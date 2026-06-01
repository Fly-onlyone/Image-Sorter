"""Thumbnail cache (``GET /thumb``).

Pre-generated 256px WEBP thumbnails keyed by content hash keep the WebView grid
fast and avoid re-decoding full images during review.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

from ..config import get_settings

THUMB_SIZE = (256, 256)


def thumb_path(image_hash: str) -> Path:
    return get_settings().thumbs_dir / f"{image_hash}.webp"


def ensure_thumb(image_hash: str, src: Path) -> Path | None:
    dest = thumb_path(image_hash)
    if dest.exists():
        return dest
    try:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            im = im.convert("RGB")
            im.thumbnail(THUMB_SIZE)
            im.save(dest, "WEBP", quality=80)
        return dest
    except Exception:
        return None
