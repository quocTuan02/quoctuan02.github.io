import boto3
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random
import logging
import decimal
import os
from pathlib import Path
from boto3.dynamodb.types import DYNAMODB_CONTEXT

# Load environment variables từ .env file
try:
    from dotenv import load_dotenv
    env_file = Path(__file__).parent / '.env'
    if env_file.exists():
        load_dotenv(env_file)
except ImportError:
    pass  # python-dotenv not installed, sử dụng environment variables từ system

# Cấu hình Decimal context của boto3 để tránh lỗi làm tròn
DYNAMODB_CONTEXT.prec = 38  # DynamoDB hỗ trợ tối đa 38 chữ số
DYNAMODB_CONTEXT.traps[decimal.Rounded] = False
DYNAMODB_CONTEXT.traps[decimal.Inexact] = False
DYNAMODB_CONTEXT.traps[decimal.Overflow] = False
DYNAMODB_CONTEXT.traps[decimal.Underflow] = False

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ============= CẤU HÌNH =============
AWS_REGION = os.environ.get('AWS_REGION', 'eu-west-1')
BILLING_MODE = 'PAY_PER_REQUEST'  # 'PAY_PER_REQUEST' hoặc 'PROVISIONED'
DEFAULT_READ_CAPACITY = 200
DEFAULT_WRITE_CAPACITY = 200
PARALLEL_SCAN_SEGMENTS = 4  # Tăng để có performance tốt hơn cho bảng lớn
BATCH_WRITE_SIZE = 25  # Kích thước batch mặc định của boto3
MAX_RETRIES = 10
INITIAL_RETRY_DELAY = 0.1  # Giây
MAX_RETRY_DELAY = 10  # Cap cho exponential backoff (giây)
GSI_WAIT_TIMEOUT = 1500  # 15 phút (10s x 150)
TABLE_PREFIX = "MSU_"

# ============= BẢNG CẦN CLONE =============
table_list = [
    'BO_ROLE',
    'BO_ROUTE',
    'BO_ROUTE_SHOP',
    'BO_SUPPORT_NOTE',
    'BO_USER',
    'SYSTEM_DAILY_REVENUE',
    'SYSTEM_DAILY_SALE_ITEM',
    'SYSTEM_DAILY_SALE_SERVICE',
    'SYSTEM_MONTHLY_REVENUE',
    'SYSTEM_MONTHLY_SALE_ITEM',
    'SYSTEM_MONTHLY_SALE_SERVICE'
]

# ============= KHỞI TẠO AWS CLIENTS =============
# Sử dụng AWS credentials từ environment variables hoặc IAM role
# Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
# Hoặc cấu hình AWS profile: AWS_PROFILE
dynamodb_client = boto3.client('dynamodb', region_name=AWS_REGION)
dynamodb_resource = boto3.resource('dynamodb', region_name=AWS_REGION)

# Hàm kiểm tra xem bảng có tồn tại không
def table_exists(table_name):
    try:
        dynamodb_client.describe_table(TableName=table_name)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            return False
        raise e

# Hàm lấy cấu trúc của bảng, bao gồm GSI và LSI
def get_table_schema(table_name):
    try:
        response = dynamodb_client.describe_table(TableName=table_name)
        return response['Table']
    except ClientError as e:
        log.error(f"Lỗi khi lấy schema của bảng {table_name}: {e}")
        return None

# Hàm kiểm tra trạng thái GSI
def wait_for_gsi_active(table_name, index_name):
    max_attempts = GSI_WAIT_TIMEOUT // 10  # Chờ tối đa theo cấu hình
    attempt = 0
    while attempt < max_attempts:
        try:
            response = dynamodb_client.describe_table(TableName=table_name)
            for gsi in response['Table'].get('GlobalSecondaryIndexes', []):
                if gsi['IndexName'] == index_name:
                    if gsi['IndexStatus'] == 'ACTIVE':
                        return True
                    break
            log.info(f"Đang chờ gsi {index_name} của bảng {table_name} đạt trạng thái ACTIVE...")
            time.sleep(10)  # Chờ 10 giây trước khi kiểm tra lại
            attempt += 1
        except ClientError as e:
            log.error(f"Lỗi khi kiểm tra trạng thái GSI {index_name} cho bảng {table_name}: {e}")
            return False
    log.error(f"Timeout: GSI {index_name} của bảng {table_name} không đạt trạng thái ACTIVE sau {max_attempts*10}s")
    return False

# Hàm tạo bảng mới với tiền tố, bao gồm GSI và LSI
def create_table_with_prefix(table_name, new_table_name):
    schema = get_table_schema(table_name)
    if not schema:
        return False

    # Sử dụng billing mode từ cấu hình
    billing_mode = BILLING_MODE

    # Kiểm tra xem bảng mới đã tồn tại chưa
    if table_exists(new_table_name):
        log.info(f"Bảng {new_table_name} đã tồn tại, chuyển sang kiểm tra GSI và sao chép dữ liệu...")
        return True

    try:
        # Lấy KeySchema và LocalSecondaryIndexes
        key_schema = schema['KeySchema']
        local_secondary_indexes = schema.get('LocalSecondaryIndexes', [])

        # Thu thập tất cả các thuộc tính được sử dụng trong KeySchema và LSI
        required_attributes = set()
        for key in key_schema:
            required_attributes.add(key['AttributeName'])
        for lsi in local_secondary_indexes:
            for key in lsi['KeySchema']:
                required_attributes.add(key['AttributeName'])

        # Lọc AttributeDefinitions để chỉ giữ các thuộc tính cần thiết
        attribute_definitions = [
            attr for attr in schema['AttributeDefinitions']
            if attr['AttributeName'] in required_attributes
        ]

        # Chuẩn bị tham số tạo bảng
        create_table_params = {
            'TableName': new_table_name,
            'AttributeDefinitions': attribute_definitions,
            'KeySchema': key_schema
        }

        # Cấu hình billing mode
        if billing_mode == 'PROVISIONED':
            provisioned_throughput = schema.get('ProvisionedThroughput', {})
            read_capacity = max(provisioned_throughput.get('ReadCapacityUnits', DEFAULT_READ_CAPACITY), DEFAULT_READ_CAPACITY)
            write_capacity = max(provisioned_throughput.get('WriteCapacityUnits', DEFAULT_WRITE_CAPACITY), DEFAULT_WRITE_CAPACITY)
            create_table_params['ProvisionedThroughput'] = {
                'ReadCapacityUnits': read_capacity,
                'WriteCapacityUnits': write_capacity
            }
            log.info(f"Bảng {new_table_name} có BillingMode = PROVISIONED (R:{read_capacity}, W:{write_capacity})")
        else:
            create_table_params['BillingMode'] = 'PAY_PER_REQUEST'
            log.info(f"Bảng {new_table_name} có BillingMode = PAY_PER_REQUEST")

        # Lấy LSI (nếu có)
        if local_secondary_indexes:
            create_table_params['LocalSecondaryIndexes'] = local_secondary_indexes

        # Tạo bảng mới
        dynamodb_client.create_table(**create_table_params)
        log.info(f"Đã tạo bảng {new_table_name}. Đang chờ bảng sẵn sàng...")

        # Chờ bảng được tạo xong
        dynamodb_client.get_waiter('table_exists').wait(TableName=new_table_name)
    except ClientError as e:
        log.error(f"Lỗi khi tạo bảng {new_table_name}: {e}")
        return False

    # Kiểm tra và tạo GSI nếu cần
    global_secondary_indexes = schema.get('GlobalSecondaryIndexes', [])
    if global_secondary_indexes:
        # Lấy danh sách GSI hiện có của bảng mới
        try:
            response = dynamodb_client.describe_table(TableName=new_table_name)
            existing_gsis = [gsi['IndexName'] for gsi in response['Table'].get('GlobalSecondaryIndexes', [])]
        except ClientError as e:
            log.error(f"Lỗi khi kiểm tra GSI hiện có của bảng {new_table_name}: {e}")
            return False

        # Thu thập thuộc tính cho tất cả GSI
        gsi_required_attributes = set()
        for gsi in global_secondary_indexes:
            for key in gsi['KeySchema']:
                gsi_required_attributes.add(key['AttributeName'])
        # Lọc AttributeDefinitions cho GSI
        gsi_attribute_definitions = [
            attr for attr in schema['AttributeDefinitions']
            if attr['AttributeName'] in gsi_required_attributes
        ]

        # Tạo các GSI chưa tồn tại
        for gsi in global_secondary_indexes:
            if gsi['IndexName'] in existing_gsis:
                log.info(f"GSI {gsi['IndexName']} đã tồn tại cho bảng {new_table_name}, bỏ qua...")
                continue
            try:
                # Chuẩn bị tham số tạo GSI
                gsi_create_params = {
                    'IndexName': gsi['IndexName'],
                    'KeySchema': gsi['KeySchema'],
                    'Projection': gsi['Projection']
                }

                # Chỉ thêm ProvisionedThroughput nếu billing_mode là PROVISIONED
                if billing_mode == 'PROVISIONED':
                    gsi_throughput = gsi.get('ProvisionedThroughput', {})
                    gsi_read_capacity = gsi_throughput.get('ReadCapacityUnits', DEFAULT_READ_CAPACITY)
                    gsi_write_capacity = gsi_throughput.get('WriteCapacityUnits', DEFAULT_WRITE_CAPACITY)
                    gsi_read_capacity = max(gsi_read_capacity, DEFAULT_READ_CAPACITY)
                    gsi_write_capacity = max(gsi_write_capacity, DEFAULT_WRITE_CAPACITY)
                    gsi_create_params['ProvisionedThroughput'] = {
                        'ReadCapacityUnits': gsi_read_capacity,
                        'WriteCapacityUnits': gsi_write_capacity
                    }

                dynamodb_client.update_table(
                    TableName=new_table_name,
                    AttributeDefinitions=gsi_attribute_definitions,
                    GlobalSecondaryIndexUpdates=[
                        {
                            'Create': gsi_create_params
                        }
                    ]
                )
                log.info(f"Đã gửi yêu cầu tạo GSI {gsi['IndexName']} cho bảng {new_table_name}")
                # Chờ GSI đạt trạng thái ACTIVE trước khi tạo GSI tiếp theo
                if not wait_for_gsi_active(new_table_name, gsi['IndexName']):
                    log.error(f"Không thể tạo GSI {gsi['IndexName']} do timeout hoặc lỗi")
                    return False
            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceInUseException':
                    log.info(f"GSI {gsi['IndexName']} đang được tạo hoặc đã tồn tại cho bảng {new_table_name}, bỏ qua...")
                    if not wait_for_gsi_active(new_table_name, gsi['IndexName']):
                        log.error(f"GSI {gsi['IndexName']} không đạt trạng thái ACTIVE")
                        return False
                else:
                    log.error(f"Lỗi khi tạo GSI {gsi['IndexName']} cho bảng {new_table_name}: {e}")
                    return False

    return True

# Hàm sao chép dữ liệu sử dụng Parallel Scan với retry
def copy_table_data(source_table, target_table):
    source = dynamodb_resource.Table(source_table)
    target = dynamodb_resource.Table(target_table)
    total_segments = PARALLEL_SCAN_SEGMENTS
    max_retries = MAX_RETRIES
    base_delay = INITIAL_RETRY_DELAY

    def scan_segment(segment):
        retries = 0
        while retries <= max_retries:
            try:
                # Sử dụng Parallel Scan để đọc dữ liệu
                response = source.scan(
                    Segment=segment,
                    TotalSegments=total_segments,
                    ConsistentRead=False  # Tăng tốc bằng cách tắt ConsistentRead
                )
                items = response.get('Items', [])

                # Xử lý các trang tiếp theo nếu có
                while 'LastEvaluatedKey' in response:
                    response = source.scan(
                        Segment=segment,
                        TotalSegments=total_segments,
                        ConsistentRead=False,
                        ExclusiveStartKey=response['LastEvaluatedKey']
                    )
                    items.extend(response.get('Items', []))

                # Ghi dữ liệu vào bảng mới theo lô 25 mục
                if items:
                    with target.batch_writer() as batch:
                        for item in items:
                            batch.put_item(Item=item)
                    log.info(f"Đã sao chép {len(items)} mục từ segment {segment}/{total_segments} của bảng {source_table} sang {target_table}")
                else:
                    log.info(f"Không có dữ liệu trong segment {segment}/{total_segments} của bảng {source_table}")
                return  # Thoát nếu thành công
            except ClientError as e:
                if e.response['Error']['Code'] == 'ProvisionedThroughputExceededException':
                    retries += 1
                    if retries > max_retries:
                        log.error(f"Lỗi: Vượt quá số lần thử lại ({max_retries}) cho segment {segment} của bảng {source_table}")
                        raise e
                    # Exponential backoff với giới hạn tối đa
                    delay = min(base_delay * (2 ** retries) + random.uniform(0, 0.1), MAX_RETRY_DELAY)
                    log.info(f"Vượt quá throughput ở segment {segment}, thử lại sau {delay:.2f}s...")
                    time.sleep(delay)
                else:
                    log.error(f"Lỗi khi sao chép dữ liệu từ {source_table} sang {target_table} ở segment {segment}: {e}")
                    raise e

    # Chạy Parallel Scan với 2 segment
    with ThreadPoolExecutor(max_workers=total_segments) as executor:
        futures = [executor.submit(scan_segment, segment) for segment in range(total_segments)]
        for future in as_completed(futures):
            future.result()  # Đợi hoàn thành và xử lý lỗi nếu có

# Hàm chính để clone các bảng trong danh sách
def clone_tables_with_prefix():
    if not table_list:
        log.error("Danh sách bảng rỗng! Vui lòng cung cấp danh sách bảng.")
        return

    for table in table_list:
        if not table_exists(table):
            log.info(f"Bảng {table} không tồn tại, bỏ qua...")
            continue

        new_table_name = f"{TABLE_PREFIX}{table}"
        log.info(f"Đang xử lý bảng {table} -> {new_table_name}")

        # Tạo bảng mới hoặc tiếp tục với GSI và dữ liệu
        if create_table_with_prefix(table, new_table_name):
            # Sao chép dữ liệu
            copy_table_data(table, new_table_name)

# Chạy script
if __name__ == "__main__":
    clone_tables_with_prefix()
