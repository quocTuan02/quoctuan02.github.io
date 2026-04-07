#!/bin/bash
# Thư mục và file log
OUTPUT_DIR="/var/log/docker"
OUTPUT_FILE="$OUTPUT_DIR/container_status.log"
ERROR_FILE="$OUTPUT_DIR/container_status_error.log"
ARCHIVE_DIR="$OUTPUT_DIR/archive"

# Kiểm tra và thực hiện rotation hàng ngày
handle_daily_rotation() {
    local current_date=$(date +"%Y-%m-%d")
    local rotation_marker="$OUTPUT_DIR/.last_rotation"
    
    # Đọc ngày của lần rotation cuối
    local last_rotation_date=""
    if [ -f "$rotation_marker" ]; then
        last_rotation_date=$(cat "$rotation_marker" 2>/dev/null)
    fi
    
    # Nếu đã sang ngày mới, thực hiện rotation
    if [ "$last_rotation_date" != "$current_date" ]; then
        echo "Phát hiện sang ngày mới ($current_date), thực hiện rotation..."
        
        # Tạo thư mục archive nếu chưa có
        if [ ! -d "$ARCHIVE_DIR" ]; then
            sudo mkdir -p "$ARCHIVE_DIR"
            sudo chown "$USER":"$USER" "$ARCHIVE_DIR"
        fi
        
        # Nếu file container_status.log tồn tại và có dữ liệu
        if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
            # Tạo tên archive với ngày hôm qua
            local prev_date
            if [ -n "$last_rotation_date" ]; then
                prev_date="$last_rotation_date"
            else
                # Nếu không có marker, dùng ngày hôm qua
                prev_date=$(date -d "yesterday" +"%Y-%m-%d" 2>/dev/null || date -v-1d +"%Y-%m-%d" 2>/dev/null)
                if [ -z "$prev_date" ]; then
                    prev_date="unknown"
                fi
            fi
            
            local archive_name="container_status_${prev_date}.zip"
            local archive_path="$ARCHIVE_DIR/$archive_name"
            
            echo "Đang zip file cũ: container_status.log -> $archive_name"
            
            # Zip file hiện tại
            if (cd "$OUTPUT_DIR" && zip -q "$archive_path" "container_status.log" 2>>"$ERROR_FILE"); then
                # Verify archive
                if [ -f "$archive_path" ] && zip -T "$archive_path" >/dev/null 2>&1; then
                    # Xóa nội dung file cũ (giữ nguyên file)
                    if > "$OUTPUT_FILE" 2>>"$ERROR_FILE"; then
                        echo "Đã zip và làm sạch file: container_status.log"
                        # Ghi lại ngày rotation
                        echo "$current_date" > "$rotation_marker"
                    else
                        echo "Lỗi: Không thể làm sạch file gốc"
                        rm -f "$archive_path"  # Xóa zip nếu không thể làm sạch file gốc
                        return 1
                    fi
                else
                    echo "Lỗi: Kiểm tra file zip thất bại: $archive_name"
                    rm -f "$archive_path"
                    return 1
                fi
            else
                echo "Lỗi: Không thể tạo file zip: $archive_name"
                return 1
            fi
        else
            echo "File container_status.log không tồn tại hoặc trống, chỉ cập nhật marker"
            # Vẫn ghi lại ngày rotation
            echo "$current_date" > "$rotation_marker"
        fi
        
        echo "Rotation hoàn tất cho ngày $current_date"
    fi
    
    return 0
}

# Cleanup old archives (giữ chỉ 2 tháng = 60 ngày)
cleanup_old_archives() {
    local keep_days=60
    local cutoff_date=$(date -d "$keep_days days ago" +"%Y-%m-%d" 2>/dev/null || date -v-${keep_days}d +"%Y-%m-%d" 2>/dev/null)
    
    if [ -z "$cutoff_date" ]; then
        return 0  # Không thể tính cutoff date
    fi
    
    local removed_count=0
    
    if [ -d "$ARCHIVE_DIR" ]; then
        for archive_file in "$ARCHIVE_DIR"/container_status_*.zip; do
            if [ -f "$archive_file" ]; then
                local filename=$(basename "$archive_file")
                # Extract date từ filename (format: container_status_YYYY-MM-DD.zip)
                local archive_date=$(echo "$filename" | sed -n 's/container_status_\([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}\)\.zip/\1/p')
                
                if [ -n "$archive_date" ] && [ "$archive_date" \< "$cutoff_date" ]; then
                    echo "Xóa archive cũ: $filename (ngày: $archive_date, cutoff: $cutoff_date)"
                    if rm "$archive_file" 2>>"$ERROR_FILE"; then
                        ((removed_count++))
                    fi
                fi
            fi
        done
    fi
    
    if [ $removed_count -gt 0 ]; then
        echo "Đã xóa $removed_count file archive cũ (>2 tháng)"
    fi
}

# Tạo thư mục/file nếu chưa có (giữ nguyên logic gốc)
if [ ! -d "$OUTPUT_DIR" ]; then
    sudo mkdir -p "$OUTPUT_DIR"
    sudo chown "$USER":"$USER" "$OUTPUT_DIR"
fi

if [ ! -f "$OUTPUT_FILE" ]; then
    sudo touch "$OUTPUT_FILE"
    sudo chown "$USER":"$USER" "$OUTPUT_FILE"
fi

if [ ! -f "$ERROR_FILE" ]; then
    sudo touch "$ERROR_FILE"
    sudo chown "$USER":"$USER" "$ERROR_FILE"
fi

# Xử lý rotation trước khi bắt đầu ghi log
handle_daily_rotation

# Cleanup archive cũ (chỉ chạy 1 lần duy nhất mỗi ngày)
cleanup_once_daily() {
    local current_date=$(date +"%Y-%m-%d")
    local cleanup_marker="$OUTPUT_DIR/.last_cleanup"
    
    # Đọc ngày cleanup cuối cùng
    local last_cleanup_date=""
    if [ -f "$cleanup_marker" ]; then
        last_cleanup_date=$(cat "$cleanup_marker" 2>/dev/null)
    fi
    
    # Chỉ cleanup nếu chưa cleanup hôm nay
    if [ "$last_cleanup_date" != "$current_date" ]; then
        echo "Thực hiện cleanup archive (lần đầu trong ngày $current_date)"
        cleanup_old_archives
        # Ghi lại ngày đã cleanup
        echo "$current_date" > "$cleanup_marker"
    fi
}

cleanup_once_daily

# Phần chính - giữ nguyên hoàn toàn logic gốc
# Lấy tất cả stats 1 lần
stats_all=$(docker stats --no-stream --no-trunc  --format '{{json .}}' 2>>"$ERROR_FILE")

# Xử lý từng container từ docker ps
docker ps -a --no-trunc --format '{{json .}}' | while IFS= read -r container; do
    now=$(date +"%Y-%m-%d %H:%M:%S %z")
    # Lấy ID container
    id=$(echo "$container" | sed -E 's/.*"ID":"([^"]+)".*/\1/')
    # Lấy stats tương ứng với ID từ stats_all
    stats=$(echo "$stats_all" | grep "\"ID\":\"$id\"")
    # Merge JSON
    merged=$(echo "$container" | sed 's/}$//')
    if [ -n "$stats" ]; then
        # Đổi key để tránh trùng
        stats_sanitized=$(echo "$stats" | sed 's/"ID":/"StatsID":/g' | sed 's/"Name":/"StatsName":/g' | sed 's/^{//' | sed 's/}$//')
        # Có stats → ghép thêm stats + Date
        echo "${merged},${stats_sanitized},\"Date\":\"$now\"}" >> "$OUTPUT_FILE"
    else
        # Không có stats → chỉ thêm Date
        echo "Không có stats với ID: {$id}"
        echo "${merged},\"Date\":\"$now\"}" >> "$OUTPUT_FILE"
    fi
done

echo "Container status (ps + stats(if any) + Date) appended to $OUTPUT_FILE"
