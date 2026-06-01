"""Artist facet — metadata-first.

Artist identity is a metadata problem, not a vision problem. The deterministic
primary reads the per-image ``.json`` sidecar that ``gallery-dl`` writes (Pixiv →
``user.name``/``user.id``; Patreon → creator), keyed on the stable platform uid.
Reverse-image lookup (SauceNAO/IQDB/ascii2d) and style clustering are residual-only
fallbacks (lookup is wired as a throttled, optional step in ``server.py``).
"""

from __future__ import annotations

import json
from pathlib import Path

from ..db import Database


def _find_sidecar(image_path: Path) -> Path | None:
    candidates = [
        image_path.with_suffix(image_path.suffix + ".json"),  # image.jpg.json
        image_path.with_suffix(".json"),  # image.json
    ]
    for c in candidates:
        if c.exists():
            return c
    return None


def _parse_sidecar(data: dict) -> tuple[str, str, str] | None:
    """Return (platform, platform_uid, display_name) or None."""
    # Pixiv (gallery-dl)
    if "user" in data and isinstance(data["user"], dict):
        user = data["user"]
        uid = str(user.get("id") or user.get("account") or "")
        name = user.get("name") or user.get("account") or uid
        if uid:
            return ("pixiv", uid, name)
    # gallery-dl flat keys
    for plat, uid_key, name_key in (
        ("pixiv", "user_id", "user"),
        ("patreon", "creator_id", "creator"),
        ("twitter", "author_id", "author"),
    ):
        if data.get(uid_key):
            return (plat, str(data[uid_key]), str(data.get(name_key) or data[uid_key]))
    # generic
    if data.get("artist"):
        return ("generic", str(data["artist"]), str(data["artist"]))
    return None


def get_or_create_artist(db: Database, platform: str, uid: str, name: str) -> int:
    row = db.query_one(
        "SELECT id FROM artists WHERE platform = ? AND platform_uid = ?", (platform, uid)
    )
    if row:
        return int(row["id"])
    cur = db.execute(
        "INSERT INTO artists(platform, platform_uid, name) VALUES(?,?,?)",
        (platform, uid, name),
    )
    return int(cur.lastrowid)


def resolve_for_image(db: Database, image_hash: str, image_path: str) -> int | None:
    """Resolve the artist from a metadata sidecar; returns artist_id or None."""
    sidecar = _find_sidecar(Path(image_path))
    if not sidecar:
        return None
    try:
        data = json.loads(sidecar.read_text(encoding="utf-8"))
    except Exception:
        return None
    parsed = _parse_sidecar(data)
    if not parsed:
        return None
    platform, uid, name = parsed
    artist_id = get_or_create_artist(db, platform, uid, name)
    db.execute(
        "UPDATE images SET artist_id=?, artist_conf=1.0, artist_source='metadata' WHERE hash=?",
        (artist_id, image_hash),
    )
    return artist_id


def artist_name(db: Database, artist_id: int | None) -> str | None:
    if artist_id is None:
        return None
    row = db.query_one("SELECT COALESCE(alias, name) AS n FROM artists WHERE id = ?", (artist_id,))
    return row["n"] if row else None
