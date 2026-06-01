"""Character gallery — CCIP prototypes.

The gallery is what makes the system extensible to characters no tagger has seen:
identity comes from CCIP (contrastive "same character or not"), naming is a separate
problem. Features are always extracted from the best single-character **crop**
(detect-and-crop front-end) — the biggest accuracy win against busy splash art.
"""

from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from ..db import Database
from . import models


def _detect_best_box(path: str):
    """Largest person/head box, or None to use the whole frame."""
    if not models.has_ml():
        return None
    try:
        from imgutils.detect import detect_person

        boxes = detect_person(path)
    except Exception:
        boxes = []
    if not boxes:
        try:
            from imgutils.detect import detect_heads

            boxes = detect_heads(path)
        except Exception:
            boxes = []
    if not boxes:
        return None
    # imgutils boxes: ((x0, y0, x1, y1), label, score)
    best = max(boxes, key=lambda b: (b[0][2] - b[0][0]) * (b[0][3] - b[0][1]))
    return best[0]


def feature_of(path: str) -> np.ndarray:
    """CCIP feature from the best crop (falls back to the whole image)."""
    box = _detect_best_box(path)
    if box is None:
        return models.ccip_extract(path)
    try:
        with Image.open(path) as im:
            im = ImageOps.exif_transpose(im).convert("RGB")
            crop = im.crop(tuple(int(v) for v in box))
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            crop.save(tmp.name)
            feat = models.ccip_extract(tmp.name)
        Path(tmp.name).unlink(missing_ok=True)
        return feat
    except Exception:
        return models.ccip_extract(path)


# ── persistence ───────────────────────────────────────────────────────────────
def _to_blob(feat: np.ndarray) -> bytes:
    return np.asarray(feat, dtype="float32").tobytes()


def _from_blob(blob: bytes) -> np.ndarray:
    return np.frombuffer(blob, dtype="float32")


def get_or_create_character(db: Database, name: str, series: str | None) -> int:
    row = db.query_one("SELECT id FROM characters WHERE name = ?", (name,))
    if row:
        if series:
            db.execute(
                "UPDATE characters SET series = COALESCE(series, ?) WHERE id = ?",
                (series, row["id"]),
            )
        return int(row["id"])
    cur = db.execute("INSERT INTO characters(name, series) VALUES(?, ?)", (name, series))
    return int(cur.lastrowid)


def add_prototype(
    db: Database,
    character_id: int,
    feature: np.ndarray,
    outfit: str | None = None,
    src_image: str | None = None,
) -> None:
    db.execute(
        "INSERT INTO prototypes(character_id, feature, outfit, src_image, created_at) "
        "VALUES(?,?,?,?,?)",
        (
            character_id,
            _to_blob(feature),
            outfit,
            src_image,
            datetime.now(timezone.utc).isoformat(),
        ),
    )


def enroll_from_refs(
    db: Database, name: str, series: str | None, ref_paths: list[str], outfit: str | None = None
) -> dict:
    feats = [feature_of(p) for p in ref_paths if Path(p).exists()]
    if not feats:
        raise ValueError("no readable reference images")
    prototype = models.ccip_merge(np.stack(feats))
    char_id = get_or_create_character(db, name, series)
    add_prototype(db, char_id, prototype, outfit=outfit, src_image=ref_paths[0])
    return {"character_id": char_id, "name": name, "refs": len(feats)}


# ── matching ──────────────────────────────────────────────────────────────────
def load_prototypes(db: Database) -> list[tuple[int, str, np.ndarray]]:
    rows = db.query(
        "SELECT p.character_id, c.name, p.feature FROM prototypes p "
        "JOIN characters c ON c.id = p.character_id"
    )
    return [(int(r["character_id"]), r["name"], _from_blob(r["feature"])) for r in rows]


def match(db: Database, feature: np.ndarray, threshold: float) -> tuple[int, str, float] | None:
    """Nearest character (min over its prototypes) below ``threshold``, or None."""
    protos = load_prototypes(db)
    if not protos:
        return None
    best: tuple[int, str, float] | None = None
    for char_id, name, proto in protos:
        dist = models.ccip_difference(feature, proto)
        if best is None or dist < best[2]:
            best = (char_id, name, dist)
    if best and best[2] <= threshold:
        return best
    return None
