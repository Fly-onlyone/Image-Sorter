"""Scan + hash + thumbnail (``/scan``).

Walks the input tree, SHA-256s each image, records ``width/height`` (header-only,
no full decode), generates a thumbnail, and writes rows to ``images`` / ``run_images``.
Idempotent in-place safety: never descends into the output dir, skips the
reserved destination buckets, and skips any hash already committed in a manifest.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image

from ..db import Database
from ..events import publish
from . import thumbs

IMAGE_EXTS = {
    ".jpg",
    ".jpeg",
    ".jfif",
    ".png",
    ".webp",
    ".gif",
    ".bmp",
    ".tiff",
    ".tif",
    ".avif",
}

# Reserved output bucket names we must never re-ingest in-place.
RESERVED_DIRS = {"other", "anime", "nude", "_unknown_artist", "_unknown_character"}


def _sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _iter_images(input_dir: Path, output_dir: Path, recursive: bool):
    output_resolved = output_dir.resolve()
    in_place = output_resolved == input_dir.resolve()

    def walk(folder: Path):
        try:
            entries = sorted(folder.iterdir())
        except (PermissionError, FileNotFoundError):
            return
        for entry in entries:
            if entry.is_dir():
                if not recursive:
                    continue
                # Don't recurse into the output dir when it sits under the input.
                if entry.resolve() == output_resolved:
                    continue
                # In-place: skip our own reserved bucket folders.
                if in_place and entry.name.lower() in RESERVED_DIRS:
                    continue
                yield from walk(entry)
            elif entry.suffix.lower() in IMAGE_EXTS:
                yield entry

    yield from walk(input_dir)


def scan_run(
    db: Database,
    run_id: str,
    input_dir: str,
    output_dir: str,
    recursive: bool,
) -> tuple[int, int]:
    """Returns ``(scanned, skipped)``."""
    in_path = Path(input_dir)
    out_path = Path(output_dir)
    committed = {
        r["hash"] for r in db.query("SELECT DISTINCT hash FROM manifest WHERE dup_action != 'skip'")
    }

    scanned = skipped = 0
    files = list(_iter_images(in_path, out_path, recursive))
    total = len(files)
    publish(run_id, "scan_start", total=total)

    for idx, path in enumerate(files):
        try:
            digest = _sha256(path)
        except OSError:
            skipped += 1
            continue
        if digest in committed:
            skipped += 1
            continue
        try:
            with Image.open(path) as im:
                width, height = im.size
                animated = getattr(im, "is_animated", False)
        except Exception:
            skipped += 1
            continue

        db.execute(
            "INSERT INTO images(hash, src_path, width, height, status) VALUES(?,?,?,?, 'pending') "
            "ON CONFLICT(hash) DO UPDATE SET src_path=excluded.src_path, "
            "width=excluded.width, height=excluded.height",
            (digest, str(path), width, height),
        )
        db.execute(
            "INSERT OR IGNORE INTO run_images(run_id, hash) VALUES(?, ?)",
            (run_id, digest),
        )
        thumbs.ensure_thumb(digest, path)
        scanned += 1
        if idx % 25 == 0 or idx == total - 1:
            publish(
                run_id, "scan_progress", done=idx + 1, total=total, scanned=scanned, skipped=skipped
            )
        _ = animated  # recorded later by dedup; flagged here for clarity

    publish(run_id, "scan_done", scanned=scanned, skipped=skipped)
    return scanned, skipped
