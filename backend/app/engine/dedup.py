"""Deduplication — keep the highest-resolution copy.

Pipeline: exact SHA (already collapsed by the ``images.hash`` PK) → perceptual
``imagehash.phash`` near-dup grouping (Hamming ≤ ``dup_distance``) → optional LPIPS
confirm on gray-zone pairs. Winner = max ``width*height``; tiebreak lossless > lossy
→ file size → mtime. Losers are flagged ``trashed`` (sent to the Recycle Bin only at
commit). Animated and still images are never matched against each other.
"""

from __future__ import annotations

from pathlib import Path

import imagehash
from PIL import Image, ImageOps

from ..config import get_settings
from ..db import Database
from ..events import publish
from . import models

_LOSSLESS = {"PNG", "BMP", "TIFF", "GIF"}


class _UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def _probe(path: Path) -> tuple[imagehash.ImageHash | None, bool, str, int]:
    """Return (phash, is_animated, format, filesize) for one image."""
    try:
        with Image.open(path) as im:
            animated = getattr(im, "is_animated", False)
            fmt = (im.format or "").upper()
            work = ImageOps.exif_transpose(im).convert("RGB")
            ph = imagehash.phash(work, hash_size=8)
        size = path.stat().st_size
        return ph, animated, fmt, size
    except Exception:
        return None, False, "", 0


def _winner_key(meta: dict) -> tuple:
    """Higher is better: resolution, then lossless, then file size, then newest mtime."""
    lossless = 1 if meta["format"] in _LOSSLESS else 0
    return (meta["width"] * meta["height"], lossless, meta["filesize"], meta["mtime"])


def dedup_run(db: Database, run_id: str, dup_distance: int | None = None) -> dict:
    settings = get_settings()
    distance = dup_distance if dup_distance is not None else settings.dup_distance
    gray_zone = distance + 6

    rows = db.query(
        "SELECT i.hash, i.src_path, i.width, i.height FROM images i "
        "JOIN run_images r ON r.hash = i.hash WHERE r.run_id = ?",
        (run_id,),
    )
    items: list[dict] = []
    for r in rows:
        path = Path(r["src_path"])
        ph, animated, fmt, filesize = _probe(path)
        if ph is None:
            continue
        items.append(
            {
                "hash": r["hash"],
                "path": path,
                "width": r["width"] or 0,
                "height": r["height"] or 0,
                "phash": ph,
                "animated": animated,
                "format": fmt,
                "filesize": filesize,
                "mtime": path.stat().st_mtime if path.exists() else 0,
            }
        )

    n = len(items)
    publish(run_id, "dedup_start", total=n)
    uf = _UnionFind(n)

    for i in range(n):
        for j in range(i + 1, n):
            if items[i]["animated"] != items[j]["animated"]:
                continue  # never match animated against still
            ham = items[i]["phash"] - items[j]["phash"]
            if ham <= distance:
                uf.union(i, j)
            elif ham <= gray_zone:
                # LPIPS confirmer on the gray zone only (skips the easy majority).
                if (
                    models.lpips_difference(str(items[i]["path"]), str(items[j]["path"]))
                    < settings.dup_lpips_max
                ):
                    uf.union(i, j)
        if i % 20 == 0:
            publish(run_id, "dedup_progress", done=i + 1, total=n)

    groups: dict[int, list[int]] = {}
    for idx in range(n):
        groups.setdefault(uf.find(idx), []).append(idx)

    kept = trashed = unique = 0
    preview_groups: list[dict] = []
    for root, members in groups.items():
        if len(members) == 1:
            it = items[members[0]]
            db.execute(
                "UPDATE images SET dup_group=NULL, dup_role='unique' WHERE hash=?",
                (it["hash"],),
            )
            unique += 1
            continue
        winner_idx = max(members, key=lambda m: _winner_key(items[m]))
        group_id = f"{run_id}:{items[winner_idx]['hash'][:12]}"
        group_entry = {"group": group_id, "keep": items[winner_idx]["hash"], "trash": []}
        for m in members:
            it = items[m]
            role = "keep" if m == winner_idx else "trashed"
            db.execute(
                "UPDATE images SET dup_group=?, dup_role=? WHERE hash=?",
                (group_id, role, it["hash"]),
            )
            if role == "keep":
                kept += 1
            else:
                trashed += 1
                group_entry["trash"].append(it["hash"])
        preview_groups.append(group_entry)

    stats = {"groups": len(preview_groups), "kept": kept, "trashed": trashed, "unique": unique}
    publish(run_id, "dedup_done", **stats)
    return {"stats": stats, "groups": preview_groups}
