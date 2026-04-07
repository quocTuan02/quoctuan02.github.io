# docker_monitor_daily_rotation.sh

Script Bash giám sát Docker containers, ghi log dạng JSON và tự động xoay vòng (rotate) log theo ngày.

---

## Mục đích

- Thu thập trạng thái tất cả Docker containers (kể cả container đã dừng) mỗi lần chạy
- Ghi log dạng JSON, mỗi dòng là một bản ghi của một container tại một thời điểm
- Tự động rotate log sang ngày mới (nén thành `.zip`)
- Tự động dọn dẹp archive cũ hơn 60 ngày

Thường được lên lịch bằng **cron job** để chạy định kỳ (ví dụ: mỗi 5 phút).

---

## Yêu cầu

| Công cụ | Mục đích |
|---------|---------|
| `bash` | Shell thực thi script |
| `docker` | Lấy thông tin container (`ps`, `stats`) |
| `zip` | Nén file log cũ khi rotate |
| `sudo` | Tạo thư mục/file nếu chưa tồn tại |

---

## Cấu trúc thư mục

```
/var/log/docker/
├── container_status.log          ← File log hiện tại (JSON Lines)
├── container_status_error.log    ← Lỗi trong quá trình chạy
├── .last_rotation                ← Marker ngày thực hiện rotation gần nhất
├── .last_cleanup                 ← Marker ngày thực hiện cleanup gần nhất
└── archive/
    ├── container_status_2025-04-05.zip
    ├── container_status_2025-04-06.zip
    └── ...
```

---

## Cách hoạt động

### 1. Khởi tạo thư mục và file

Script tự tạo các thư mục và file cần thiết nếu chưa tồn tại:
- `/var/log/docker/`
- `container_status.log`
- `container_status_error.log`

### 2. Log Rotation hàng ngày (`handle_daily_rotation`)

Mỗi lần script chạy:

1. Đọc file marker `.last_rotation` để biết ngày rotation gần nhất
2. So sánh với ngày hiện tại
3. **Nếu sang ngày mới:**
   - Nén `container_status.log` → `archive/container_status_YYYY-MM-DD.zip`
   - Xác minh file zip hợp lệ
   - Truncate file log gốc (giữ file, xóa nội dung)
   - Cập nhật `.last_rotation`

### 3. Cleanup archive cũ (`cleanup_once_daily`)

- Chỉ chạy **một lần mỗi ngày** (kiểm tra qua `.last_cleanup`)
- Xóa các file `.zip` trong `archive/` có ngày **cũ hơn 60 ngày**

### 4. Thu thập dữ liệu container

```
docker stats --no-stream  →  lấy CPU, RAM, network, block I/O
docker ps -a              →  lấy danh sách tất cả container
```

Với mỗi container, script:
1. Lấy thông tin từ `docker ps -a`
2. Ghép (merge) với stats tương ứng theo `ContainerID`
3. Thêm trường `Date` (timestamp hiện tại)
4. Append dòng JSON vào `container_status.log`

---

## Định dạng output

Mỗi dòng trong `container_status.log` là một JSON object:

```json
{
  "ID": "abc123def456",
  "Names": "my-app",
  "Image": "nginx:latest",
  "Status": "Up 2 hours",
  "CPUPerc": "0.5%",
  "MemUsage": "128MiB / 2GiB",
  "MemPerc": "6.25%",
  "NetIO": "1.2MB / 500kB",
  "BlockIO": "10MB / 5MB",
  "PIDs": "5",
  "Date": "2025-04-07 08:00:00 +0700"
}
```

> Nếu container đang ở trạng thái stopped, phần stats (CPU, RAM...) sẽ không có.

---

## Cài đặt và sử dụng

### Cấp quyền thực thi

```bash
chmod +x docker_monitor_daily_rotation.sh
```

### Chạy thủ công

```bash
./docker_monitor_daily_rotation.sh
```

### Lên lịch bằng cron (ví dụ: mỗi 5 phút)

```bash
crontab -e
```

Thêm dòng:

```cron
*/5 * * * * /path/to/docker_monitor_daily_rotation.sh >> /var/log/docker/cron.log 2>&1
```

---

## Xử lý lỗi

- Mọi lỗi runtime được ghi vào `container_status_error.log`
- Nếu tạo file `.zip` thất bại hoặc zip bị lỗi → file zip sẽ bị xóa, log gốc được giữ nguyên
- Nếu không thể truncate file log gốc sau khi zip → zip bị xóa, rotation bị hủy để tránh mất dữ liệu

---

## Lưu ý

- Script cần quyền `sudo` lần đầu để tạo thư mục `/var/log/docker/`. Sau đó, quyền sở hữu được gán về user hiện tại nên các lần sau không cần `sudo`
- Biến `$USER` được dùng để `chown`, đảm bảo user chạy script có quyền ghi vào thư mục log
- Script tương thích với Linux (dùng `date -d`). Trên macOS cần thay bằng `date -v`
