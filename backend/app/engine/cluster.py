"""Residual clustering (step 3, ``/cluster``).

CCIP-clusters the still-unidentified anime images (OPTICS for character, style
embeddings for artist) into unnamed groups for the review UI. Naming a cluster
creates a character and auto-enrolls its features — this is how a brand-new
character is learned once. Reuses the cached ``ccip_feature`` from identify.
"""

from __future__ import annotations

import numpy as np

from ..db import Database
from ..events import publish
from . import gallery, models


def _residual_rows(db: Database, run_id: str) -> list:
    return db.query(
        "SELECT i.hash, i.src_path, i.ccip_feature FROM images i "
        "JOIN run_images r ON r.hash = i.hash "
        "WHERE r.run_id = ? AND i.media_type = 'anime' "
        "AND i.character_id IS NULL AND i.char_names_json IS NULL "
        "AND i.status = 'review'",
        (run_id,),
    )


def cluster_run(db: Database, run_id: str, facet: str = "character") -> dict:
    rows = _residual_rows(db, run_id)
    publish(run_id, "cluster_start", total=len(rows), facet=facet)
    if not rows:
        publish(run_id, "cluster_done", clusters=0, facet=facet)
        return {"clusters": 0}

    feats = []
    for r in rows:
        if r["ccip_feature"]:
            feats.append(np.frombuffer(r["ccip_feature"], dtype="float32"))
        else:
            feats.append(gallery.feature_of(r["src_path"]))
    feature_arr = np.stack(feats)

    labels = models.ccip_cluster(feature_arr, min_samples=5)
    db.execute("DELETE FROM clusters WHERE run_id = ? AND facet = ?", (run_id, facet))
    distinct = set()
    for r, label in zip(rows, labels):
        if label < 0:
            continue  # noise
        distinct.add(label)
        db.execute(
            "INSERT OR REPLACE INTO clusters(run_id, facet, label, hash) VALUES(?,?,?,?)",
            (run_id, facet, int(label), r["hash"]),
        )

    publish(run_id, "cluster_done", clusters=len(distinct), facet=facet)
    return {"clusters": len(distinct)}


def name_cluster(
    db: Database,
    run_id: str,
    label: int,
    name: str,
    series: str | None = None,
    facet: str = "character",
) -> dict:
    """Create the character (if new), enroll all cluster features, mark identified."""
    rows = db.query(
        "SELECT i.hash, i.src_path, i.ccip_feature FROM images i "
        "JOIN clusters c ON c.hash = i.hash "
        "WHERE c.run_id = ? AND c.facet = ? AND c.label = ?",
        (run_id, facet, label),
    )
    if not rows:
        raise ValueError("empty cluster")

    char_id = gallery.get_or_create_character(db, name, series)
    feats = []
    for r in rows:
        feat = (
            np.frombuffer(r["ccip_feature"], dtype="float32")
            if r["ccip_feature"]
            else gallery.feature_of(r["src_path"])
        )
        feats.append(feat)
    prototype = models.ccip_merge(np.stack(feats))
    gallery.add_prototype(db, char_id, prototype, src_image=rows[0]["src_path"])

    for r in rows:
        db.execute(
            "UPDATE images SET character_id=?, char_conf=1.0, source='cluster', "
            "status='identified' WHERE hash=?",
            (char_id, r["hash"]),
        )
    return {"character_id": char_id, "name": name, "members": len(rows)}
