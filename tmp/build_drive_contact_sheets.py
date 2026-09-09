from __future__ import annotations

import json
import os
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont, ImageOps

import gdown


ROOT_URL = "https://drive.google.com/drive/folders/1ELOuWuscGYTIB8F3i7CtIRGCM8PWogQz"
OUT = Path(r"D:\Programs\ASIP\tmp\drive-review")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}
TILE = (180, 142)
GRID = (6, 5)


def fit_image(image: Image.Image) -> Image.Image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    return ImageOps.fit(image, (TILE[0], TILE[1] - 24), method=Image.Resampling.LANCZOS)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    thumbs = OUT / "thumbs"
    sheets = OUT / "sheets"
    thumbs.mkdir(exist_ok=True)
    sheets.mkdir(exist_ok=True)

    files = gdown.download_folder(url=ROOT_URL, output=str(OUT / "originals"), quiet=True, skip_download=True)
    records = []
    for index, item in enumerate(files):
        suffix = Path(item.path).suffix.lower()
        record = {"index": index, "id": item.id, "path": item.path, "extension": suffix}
        if suffix in IMAGE_EXTENSIONS:
            thumb_path = thumbs / f"{index:04d}.jpg"
            record["thumbnail"] = str(thumb_path)
        records.append(record)

    def download_thumbnail(record: dict[str, object]) -> None:
        if "thumbnail" not in record:
            return
        thumb_path = Path(str(record["thumbnail"]))
        if thumb_path.exists():
            return
        for attempt in range(1):
            try:
                response = requests.get(
                    f"https://drive.google.com/thumbnail?id={record['id']}&sz=w640",
                    timeout=5,
                )
                response.raise_for_status()
                thumb_path.write_bytes(response.content)
                return
            except requests.RequestException:
                if attempt == 3:
                    return
                time.sleep(1 + attempt)

    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(download_thumbnail, records))

    (OUT / "manifest.json").write_text(json.dumps(records, indent=2), encoding="utf-8")

    image_records = [record for record in records if "thumbnail" in record]
    per_sheet = GRID[0] * GRID[1]
    font = ImageFont.load_default()
    for sheet_index in range((len(image_records) + per_sheet - 1) // per_sheet):
        page = Image.new("RGB", (GRID[0] * TILE[0], GRID[1] * TILE[1]), "white")
        draw = ImageDraw.Draw(page)
        chunk = image_records[sheet_index * per_sheet : (sheet_index + 1) * per_sheet]
        for offset, record in enumerate(chunk):
            x = (offset % GRID[0]) * TILE[0]
            y = (offset // GRID[0]) * TILE[1]
            try:
                with Image.open(record["thumbnail"]) as source:
                    fitted = fit_image(source)
                page.paste(fitted, (x, y))
            except Exception:
                draw.rectangle((x, y, x + TILE[0], y + TILE[1] - 24), fill="#dddddd")
            label = f"{record['index']:04d} {Path(record['path']).name}"
            draw.rectangle((x, y + TILE[1] - 24, x + TILE[0], y + TILE[1]), fill="white")
            draw.text((x + 3, y + TILE[1] - 20), label[:29], fill="black", font=font)
        page.save(sheets / f"sheet-{sheet_index + 1:03d}.jpg", quality=88)

    print(json.dumps({
        "total_files": len(records),
        "images": len(image_records),
        "sheets": len(list(sheets.glob('sheet-*.jpg'))),
        "output": str(OUT),
    }))


if __name__ == "__main__":
    main()
