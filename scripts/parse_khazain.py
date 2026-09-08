import os
import json
import re

input_dir = "/Users/waleedmangla/Desktop/JAI/Stage 1 Conversion/Files/Ruhani Khazain"
output_dir = "public/ruhani-khazain"
os.makedirs(output_dir, exist_ok=True)

header_regex = re.compile(r"Ruhani Khazain Volume (\d+)\. Page: (\d+)", re.IGNORECASE)

for filename in os.listdir(input_dir):
    if filename.endswith(".txt"):
        filepath = os.path.join(input_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        volume_num = None
        pages = []
        current_page_num = None
        current_page_text = []
        
        skip_lines = 0
        for i, line in enumerate(lines):
            if skip_lines > 0:
                skip_lines -= 1
                continue
                
            match = header_regex.search(line)
            if match:
                if current_page_num is not None:
                    pages.append({
                        "page_num": current_page_num,
                        "text": "".join(current_page_text).strip()
                    })
                volume_num = int(match.group(1))
                current_page_num = int(match.group(2))
                current_page_text = []
                skip_lines = 2
            else:
                current_page_text.append(line)
        
        if current_page_num is not None:
            pages.append({
                "page_num": current_page_num,
                "text": "".join(current_page_text).strip()
            })
        
        if volume_num is not None:
            out_filepath = os.path.join(output_dir, f"volume_{volume_num}.json")
            with open(out_filepath, "w", encoding="utf-8") as f:
                json.dump({"volume": volume_num, "pages": pages}, f, ensure_ascii=False)
            print(f"Processed Volume {volume_num} - {len(pages)} pages.")

