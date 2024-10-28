#!/bin/bash

# Đường dẫn tới thư mục chứa các file mp3
AUDIO_DIR="/home/phuoc/Desktop/Development/Pet_Project/vue3-english-player/public/assets/audios/LPTD1.1"

# Đường dẫn tới thư mục xuất kết quả
OUTPUT_DIR="subtitled1.1"

# Tạo thư mục output nếu chưa có
mkdir -p "$OUTPUT_DIR"

# Đếm tổng số file mp3 trong thư mục
TOTAL_FILES=$(ls "$AUDIO_DIR"/*.mp3 2>/dev/null | wc -l)

# Nếu không có file nào thì thông báo và thoát
if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "No MP3 files found in the directory: $AUDIO_DIR"
    exit 1
fi

# Biến đếm số file đã xử lý
PROCESSED_COUNT=0

# Lặp qua tất cả các file mp3 trong thư mục
for FILE in "$AUDIO_DIR"/*.mp3
do
    if [ -f "$FILE" ]; then
        # Tăng biến đếm số file đã xử lý
        PROCESSED_COUNT=$((PROCESSED_COUNT + 1))

        echo "Processing file $PROCESSED_COUNT of $TOTAL_FILES: $FILE"

        # Chạy lệnh auto_subtitle
        auto_subtitle "$FILE" -o "$OUTPUT_DIR" --srt_only true --model medium.en --language en

        echo "Finished processing: $FILE"
    fi
done

echo "All $TOTAL_FILES files have been processed!"
