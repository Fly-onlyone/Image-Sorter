"""Routing + commit (``/commit``).

Single config-driven path builder so routing lines are trivial to move:

* non-anime               → ``other/``
* anime, no character     → ``anime/``
* anime, 1 character      → ``<char>/``
* anime, 2+ characters    → ``<A> + <B> + …/`` (alphabetical, cap 3 + ``+N more``)
* ``nude/`` is always the innermost leaf.

Two-facet layouts nest the facets in the chosen order with ``_unknown_<facet>/`` for
partial resolutions. Windows-illegal characters are sanitised and over-long combined
paths are truncated with a short hash suffix.
"""

from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from ..db import Database
from ..events import publish
from . import artist as artist_mod

_ILLEGAL = '<>:"/\\|?*'
_MAX_COMPONENT = 110  # leave headroom under the Windows 255-char path-segment limit


def sanitize(name: str) -> str:
    cleaned = "".join("_" if c in _ILLEGAL else c for c in name)
    cleaned = cleaned.strip().rstrip(". ")
    if not cleaned:
        cleaned = "_unnamed"
    if len(cleaned) > _MAX_COMPONENT:
        digest = hashlib.sha1(name.encode("utf-8")).hexdigest()[:8]
        cleaned = cleaned[: _MAX_COMPONENT - 9].rstrip() + "_" + digest
    return cleaned


def combined_folder(names: list[str]) -> str:
    ordered = sorted(names, key=str.lower)
    if len(ordered) > 3:
        shown = ordered[:3]
        label = " + ".join(shown) + f" +{len(ordered) - 3} more"
    else:
        label = " + ".join(ordered)
    return sanitize(label)


def _character_component(row) -> str:
    names_json = row["char_names_json"]
    if names_json:
        names = json.loads(names_json)
        if len(names) >= 2:
            return combined_folder(names)
    if row["character_id"] is not None:
        return sanitize(row["character_name"] or "anime")
    return "anime"


def build_dest(db: Database, row, layout: list[str], output_dir: Path) -> Path:
    media_type = row["media_type"]
    filename = Path(row["src_path"]).name

    # non-anime short-circuits to the top-level other/ bucket regardless of layout.
    if media_type == "other":
        return output_dir / "other" / filename
    if media_type == "review":
        # passed the photo/AI gates but the fine call was uncertain → anime bucket.
        return output_dir / "anime" / filename

    components: list[str] = []
    for facet in layout:
        if facet == "character":
            components.append(_character_component(row))
        elif facet == "artist":
            name = artist_mod.artist_name(db, row["artist_id"])
            components.append(sanitize(name) if name else "_unknown_artist")

    dest = output_dir
    for c in components:
        dest = dest / c
    if row["nude"]:
        dest = dest / "nude"
    return dest / filename


def _rows_for_commit(db: Database, run_id: str) -> list:
    return db.query(
        "SELECT i.hash, i.src_path, i.media_type, i.nude, i.dup_role, "
        "i.character_id, i.char_names_json, i.artist_id, i.char_conf, i.artist_conf, "
        "i.rating_json, c.name AS character_name "
        "FROM images i JOIN run_images r ON r.hash = i.hash "
        "LEFT JOIN characters c ON c.id = i.character_id "
        "WHERE r.run_id = ?",
        (run_id,),
    )


def preview_run(db: Database, run_id: str, layout: list[str]) -> dict:
    run = db.query_one("SELECT output_dir, in_place FROM runs WHERE run_id = ?", (run_id,))
    output_dir = Path(run["output_dir"])
    folders: dict[str, dict] = {}
    trashed: list[str] = []

    for row in _rows_for_commit(db, run_id):
        if row["dup_role"] == "trashed":
            trashed.append(row["hash"])
            continue
        dest = build_dest(db, row, layout, output_dir)
        rel = str(dest.parent.relative_to(output_dir)).replace("\\", "/")
        bucket = folders.setdefault(rel, {"count": 0, "samples": []})
        bucket["count"] += 1
        if len(bucket["samples"]) < 4:
            bucket["samples"].append(row["hash"])

    tree = [{"folder": k, **v} for k, v in sorted(folders.items())]
    return {
        "in_place": bool(run["in_place"]),
        "tree": tree,
        "dedup_trash": trashed,
        "trash_count": len(trashed),
    }


def commit_run(db: Database, run_id: str, layout: list[str], mode: str = "auto") -> dict:
    run = db.query_one("SELECT output_dir, in_place FROM runs WHERE run_id = ?", (run_id,))
    output_dir = Path(run["output_dir"])
    in_place = bool(run["in_place"])
    # auto → move when in-place, else copy.
    do_move = mode == "move" or (mode == "auto" and in_place)

    rows = _rows_for_commit(db, run_id)
    total = len(rows)
    publish(run_id, "commit_start", total=total, mode="move" if do_move else "copy")

    copied = moved = trashed = skipped = 0
    for idx, row in enumerate(rows):
        if row["dup_role"] == "trashed":
            _trash(row["src_path"])
            _record_manifest(db, run_id, row, None, layout, "trash")
            trashed += 1
            continue

        dest = build_dest(db, row, layout, output_dir)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest = _dedupe_name(dest)
        src = Path(row["src_path"])
        try:
            if do_move:
                shutil.move(str(src), str(dest))
                action = "move"
                moved += 1
            else:
                shutil.copy2(str(src), str(dest))
                action = "copy"
                copied += 1
        except (OSError, shutil.Error):
            skipped += 1
            _record_manifest(db, run_id, row, None, layout, "skip")
            continue

        # move the artist sidecar alongside, if present
        _move_sidecar(src, dest, do_move)
        _record_manifest(db, run_id, row, str(dest), layout, action)
        db.execute("UPDATE images SET status='committed' WHERE hash=?", (row["hash"],))
        if idx % 20 == 0 or idx == total - 1:
            publish(
                run_id,
                "commit_progress",
                done=idx + 1,
                total=total,
                copied=copied,
                moved=moved,
                trashed=trashed,
            )

    db.execute("UPDATE runs SET status='committed' WHERE run_id=?", (run_id,))
    stats = {"copied": copied, "moved": moved, "trashed": trashed, "skipped": skipped}
    publish(run_id, "commit_done", **stats)
    return stats


def _trash(path_str: str) -> None:
    try:
        from send2trash import send2trash

        p = Path(path_str)
        if p.exists():
            send2trash(str(p))
    except Exception:
        pass


def _dedupe_name(dest: Path) -> Path:
    if not dest.exists():
        return dest
    stem, suffix, parent = dest.stem, dest.suffix, dest.parent
    i = 1
    while True:
        candidate = parent / f"{stem}_{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1


def _move_sidecar(src: Path, dest: Path, do_move: bool) -> None:
    for cand in (src.with_suffix(src.suffix + ".json"), src.with_suffix(".json")):
        if cand.exists():
            target = (
                dest.with_name(cand.name.replace(src.name, dest.name))
                if cand.name.startswith(src.name)
                else dest.with_suffix(".json")
            )
            try:
                if do_move:
                    shutil.move(str(cand), str(target))
                else:
                    shutil.copy2(str(cand), str(target))
            except Exception:
                pass
            return


def _record_manifest(
    db: Database, run_id: str, row, dest: str | None, layout: list[str], action: str
) -> None:
    db.execute(
        "INSERT OR REPLACE INTO manifest(run_id, hash, src_path, dest_path, character, "
        "char_conf, artist, artist_conf, rating_json, nude, layout, media_type, dup_action) "
        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (
            run_id,
            row["hash"],
            row["src_path"],
            dest,
            row["character_name"],
            row["char_conf"],
            artist_mod.artist_name(db, row["artist_id"]),
            row["artist_conf"],
            row["rating_json"],
            row["nude"],
            json.dumps(layout),
            row["media_type"],
            action,
        ),
    )
