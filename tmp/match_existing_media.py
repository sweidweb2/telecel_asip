from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(r"D:\Programs\ASIP")
MANIFEST = json.loads((ROOT / "tmp/drive-review/manifest.json").read_text(encoding="utf-8"))


def ahash(path: Path, size: int = 16) -> int:
    with Image.open(path) as source:
        image = ImageOps.exif_transpose(source).convert("L").resize((size, size))
    values = list(image.getdata())
    mean = sum(values) / len(values)
    result = 0
    for value in values:
        result = (result << 1) | (value >= mean)
    return result


thumbs = []
for record in MANIFEST:
    thumb = record.get("thumbnail")
    if thumb and Path(thumb).exists():
        thumbs.append((record, ahash(Path(thumb))))

for asset in sorted((ROOT / "public/asip-media").glob("*.webp")):
    target = ahash(asset)
    best = sorted(
        ((target ^ candidate).bit_count(), record["index"], record["path"])
        for record, candidate in thumbs
    )[:5]
    print(asset.name)
    for distance, index, path in best:
        print(f"  {distance:3d} {index:04d} {path}")
