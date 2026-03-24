# Clone DynamoDB Tables Script

Script để clone các DynamoDB tables từ bảng gốc sang bảng mới với tiền tố `MSU_`.

## Yêu cầu

- Python 3.7+
- AWS credentials (Access Key + Secret Key)
- Package dependencies:
  ```bash
  pip install boto3 python-dotenv
  ```

## Setup

### 1. Tạo file `.env`

Copy từ `.env.example`:
```bash
cp .env.example .env
```

### 2. Điền AWS credentials vào `.env`

```bash
# .env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=eu-west-1
```

Lấy credentials từ:
- AWS Console → IAM → Users → Your User → Security Credentials
- Hoặc từ file `~/.aws/credentials` nếu đã cấu hình AWS CLI

### 3. Chạy script

```bash
python clone_dynamodb_tables_continue.py
```

## Cấu hình

Sửa các giá trị ở đầu file `clone_dynamodb_tables_continue.py`:

```python
# Chế độ billing
BILLING_MODE = 'PAY_PER_REQUEST'  # hoặc 'PROVISIONED'

# Capacity units (nếu dùng PROVISIONED)
DEFAULT_READ_CAPACITY = 200
DEFAULT_WRITE_CAPACITY = 200

# Parallel scan segments (tăng cho bảng lớn)
PARALLEL_SCAN_SEGMENTS = 4

# Retry configuration
MAX_RETRIES = 10
MAX_RETRY_DELAY = 10  # giây

# Tiền tố bảng mới
TABLE_PREFIX = "MSU_"

# Danh sách bảng cần clone
table_list = ['BO_ROLE', 'BO_ROUTE', ...]
```

## Bảo mật

⚠️ **Quan trọng:**
- **Không commit** file `.env` vào git (đã có trong `.gitignore`)
- **Không share** AWS credentials qua email hoặc chat
- Sử dụng IAM roles thay vì hardcode credentials nếu có thể
- Định kỳ rotate access keys

## Troubleshooting

### Lỗi: "ProvisionedThroughputExceededException"
- Script sẽ tự động retry với exponential backoff
- Nếu vẫn lỗi, giảm `PARALLEL_SCAN_SEGMENTS` hoặc tăng capacity units

### Lỗi: "ResourceNotFoundException"
- Kiểm tra AWS credentials có đúng không
- Kiểm tra region có đúng không
- Kiểm tra bảng gốc có tồn tại không

### Lỗi: "ModuleNotFoundError: No module named 'dotenv'"
```bash
pip install python-dotenv
```

## Logs

Script in chi tiết logs khi chạy:
- Tạo bảng mới: ✓
- Tạo indexes: ✓
- Sao chép dữ liệu: ✓
- Lỗi: ✗

## Bảng sẽ được clone

```
BO_ROLE                   → MSU_BO_ROLE
BO_ROUTE                  → MSU_BO_ROUTE
BO_ROUTE_SHOP             → MSU_BO_ROUTE_SHOP
BO_SUPPORT_NOTE           → MSU_BO_SUPPORT_NOTE
BO_USER                   → MSU_BO_USER
SYSTEM_DAILY_REVENUE      → MSU_SYSTEM_DAILY_REVENUE
SYSTEM_DAILY_SALE_ITEM    → MSU_SYSTEM_DAILY_SALE_ITEM
SYSTEM_DAILY_SALE_SERVICE → MSU_SYSTEM_DAILY_SALE_SERVICE
SYSTEM_MONTHLY_REVENUE    → MSU_SYSTEM_MONTHLY_REVENUE
SYSTEM_MONTHLY_SALE_ITEM  → MSU_SYSTEM_MONTHLY_SALE_ITEM
SYSTEM_MONTHLY_SALE_SERVICE → MSU_SYSTEM_MONTHLY_SALE_SERVICE
```
