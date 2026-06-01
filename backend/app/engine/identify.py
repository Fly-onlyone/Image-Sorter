"""Identity resolution per facet (``/identify``).

Runs only on ``media_type='anime'`` images. Character facet: detect-crop → gallery
match → tagger-hint auto-bootstrap → residual (clustered later). Artist facet:
metadata sidecar/embedded parse (the deterministic primary). Two-facet layouts run
both and pair the results per image.
"""

from __future__ import annotations

import json

import numpy as np

from ..config import get_settings
from ..db import Database
from ..events import publish
from . import artist as artist_mod
from . import gallery, models


def _significant_boxes(path: str) -> list:
    """Person boxes covering a meaningful fraction of the frame (multi-character)."""
    if not models.has_ml():
        return []
    try:
        from imgutils.detect import detect_person

        boxes = detect_person(path)
    except Exception:
        return []
    if not boxes:
        return []
    img_area = None
    try:
        from PIL import Image

        with Image.open(path) as im:
            img_area = im.size[0] * im.size[1]
    except Exception:
        return boxes
    out = []
    for b in boxes:
        (x0, y0, x1, y1) = b[0]
        if img_area and (x1 - x0) * (y1 - y0) >= 0.06 * img_area:
            out.append(b)
    return out


def _resolve_characters(db: Database, path: str, threshold: float):
    """Return (primary_feature, character_id, conf, source, names[]).

    names has 2+ entries only when multiple distinct gallery characters are found.
    """
    primary = gallery.feature_of(path)
    boxes = _significant_boxes(path)

    # Multi-character: match each significant crop independently.
    names: list[str] = []
    primary_match = gallery.match(db, primary, threshold)
    if len(boxes) >= 2:
        from PIL import Image, ImageOps

        try:
            with Image.open(path) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                for b in boxes:
                    crop = im.crop(tuple(int(v) for v in b[0]))
                    feat = models.ccip_extract_image(crop)
                    m = gallery.match(db, feat, threshold)
                    if m and m[1] not in names:
                        names.append(m[1])
        except Exception:
            names = []

    if len(names) >= 2:
        return primary, None, None, "gallery", sorted(names)
    if primary_match:
        char_id, name, dist = primary_match
        return primary, char_id, dist, "gallery", [name]
    return primary, None, None, None, []


def identify_run(db: Database, run_id: str, layout: list[str]) -> dict:
    s = get_settings()
    threshold = models.ccip_threshold(s.ccip_threshold)
    comfortable = threshold * 0.8
    do_char = "character" in layout
    do_artist = "artist" in layout

    rows = db.query(
        "SELECT i.hash, i.src_path, i.char_hint FROM images i "
        "JOIN run_images r ON r.hash = i.hash "
        "WHERE r.run_id = ? AND i.media_type = 'anime'",
        (run_id,),
    )
    total = len(rows)
    publish(run_id, "identify_start", total=total)
    identified = review = residual = 0

    for idx, r in enumerate(rows):
        path, char_hint = r["src_path"], r["char_hint"]
        char_id = None
        char_conf = None
        source = None
        names: list[str] = []
        feature = None

        if do_char:
            feature, char_id, dist, source, names = _resolve_characters(db, path, threshold)
            if len(names) >= 2:
                source = "gallery"
            elif char_id is None and char_hint:
                # Tagger-hint auto-bootstrap: name it and enroll the crop for free.
                cid = gallery.get_or_create_character(db, char_hint, None)
                gallery.add_prototype(db, cid, feature, src_image=path)
                char_id, char_conf, source = cid, 1.0 - comfortable, "tagger"
                names = [char_hint]
            elif char_id is not None:
                char_conf = 1.0 - float(dist)

        if do_artist:
            artist_mod.resolve_for_image(db, r["hash"], path)

        # Banding → status.
        if len(names) >= 2 or char_id is not None:
            banded = "identified"
            if char_id is not None and dist is not None and dist > comfortable:
                banded = "review"
                review += 1
            else:
                identified += 1
        else:
            banded = "review" if do_char else "identified"
            residual += 1

        db.execute(
            "UPDATE images SET character_id=?, char_conf=?, char_names_json=?, "
            "ccip_feature=?, source=?, status=? WHERE hash=?",
            (
                char_id,
                char_conf,
                json.dumps(names) if len(names) >= 2 else None,
                np.asarray(feature, dtype="float32").tobytes() if feature is not None else None,
                source,
                banded,
                r["hash"],
            ),
        )
        if idx % 10 == 0 or idx == total - 1:
            publish(
                run_id,
                "identify_progress",
                done=idx + 1,
                total=total,
                identified=identified,
                review=review,
                residual=residual,
            )

    stats = {"identified": identified, "review": review, "residual": residual}
    publish(run_id, "identify_done", **stats)
    return stats
