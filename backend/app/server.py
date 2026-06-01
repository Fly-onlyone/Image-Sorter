"""FastAPI sidecar — endpoints from"""

from __future__ import annotations

import asyncio
import json
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

from . import events, jobs
from .config import get_settings
from .db import get_db
from .engine import cluster as cluster_engine
from .engine import gallery, gate, ingest, thumbs
from .engine import route as route_engine
from .schemas import (
    CommitRequest,
    DedupRequest,
    EnrollRequest,
    GateRequest,
    IdentifyRequest,
    MediaReassignRequest,
    NameClusterRequest,
    ScanRequest,
    ScanResponse,
    SettingsPatch,
    TagRequest,
)
from .sentry_setup import init_sentry


@asynccontextmanager
async def lifespan(app: FastAPI):
    events.bind_loop(asyncio.get_running_loop())
    get_settings().ensure_dirs()
    get_db()
    init_sentry()
    yield


app = FastAPI(title="Image Sorter Sidecar", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # localhost-only sidecar; WebView origin varies
    allow_methods=["*"],
    allow_headers=["*"],
)


def _run_layout(run_id: str) -> list[str]:
    row = get_db().query_one("SELECT layout FROM runs WHERE run_id = ?", (run_id,))
    if row and row["layout"]:
        try:
            return json.loads(row["layout"])
        except Exception:
            pass
    return ["character"]


# ── health / settings ─────────────────────────────────────────────────────────
@app.get("/health")
async def health() -> dict:
    from .engine import models

    return {"status": "ok", "ml": models.has_ml(), "version": app.version}


@app.get("/settings")
async def get_settings_endpoint() -> dict:
    s = get_settings()
    defaults = {
        "dup_distance": s.dup_distance,
        "dup_trash": s.dup_trash,
        "explicit_threshold": s.explicit_threshold,
        "strict_nude": s.strict_nude,
        "gate_illustration_min": s.gate_illustration_min,
        "char_threshold": s.char_threshold,
        "use_gpu": s.use_gpu,
    }
    defaults.update(get_db().all_settings())
    return defaults


@app.patch("/settings")
async def patch_settings(patch: SettingsPatch) -> dict:
    db = get_db()
    for k, v in patch.values.items():
        db.set_setting(k, v)
    return await get_settings_endpoint()


# ── scan / pipeline ─────────────────────────────────────────────────────────────
@app.post("/scan", response_model=ScanResponse)
async def scan(req: ScanRequest) -> ScanResponse:
    input_dir = Path(req.input_dir)
    if not input_dir.is_dir():
        raise HTTPException(400, f"input_dir not found: {req.input_dir}")
    output_dir = Path(req.output_dir) if req.output_dir else input_dir
    in_place = output_dir.resolve() == input_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    run_id = uuid.uuid4().hex[:12]
    db = get_db()
    db.execute(
        "INSERT INTO runs(run_id, input_dir, output_dir, in_place, started_at, status) "
        "VALUES(?,?,?,?,?, 'scanning')",
        (
            run_id,
            str(input_dir),
            str(output_dir),
            int(in_place),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    scanned, skipped = await run_in_threadpool(
        ingest.scan_run, db, run_id, str(input_dir), str(output_dir), req.recursive
    )
    db.execute("UPDATE runs SET status='scanned' WHERE run_id=?", (run_id,))
    return ScanResponse(run_id=run_id, scanned=scanned, skipped=skipped, in_place=in_place)


@app.post("/process")
async def process(req: IdentifyRequest, background: BackgroundTasks) -> dict:
    """Run dedup → gate → tag → identify → cluster in the background."""
    background.add_task(jobs.run_pipeline, req.run_id, req.layout)
    return {"accepted": True, "run_id": req.run_id, "phases": jobs.PHASES}


@app.get("/jobs/{run_id}/events")
async def events_stream(run_id: str) -> StreamingResponse:
    queue = events.subscribe(run_id)

    async def gen():
        try:
            yield events.format_sse({"event": "connected", "run_id": run_id})
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield events.format_sse(payload)
                    if payload.get("event") in ("pipeline_done", "pipeline_error", "commit_done"):
                        # keep the stream open; the UI closes it
                        pass
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            events.unsubscribe(run_id, queue)

    return StreamingResponse(gen(), media_type="text/event-stream")


# ── granular phases ─────────────────────────────────────────────────────────────
@app.post("/dedup")
async def dedup_endpoint(req: DedupRequest) -> dict:
    from .engine import dedup as dedup_engine

    return await run_in_threadpool(dedup_engine.dedup_run, get_db(), req.run_id, req.dup_distance)


@app.post("/gate")
async def gate_endpoint(req: GateRequest) -> dict:
    return await run_in_threadpool(gate.gate_run, get_db(), req.run_id)


@app.post("/tag")
async def tag_endpoint(req: TagRequest) -> dict:
    from .engine import tagging

    return await run_in_threadpool(tagging.tag_run, get_db(), req.run_id)


@app.post("/identify")
async def identify_endpoint(req: IdentifyRequest) -> dict:
    from .engine import identify

    return await run_in_threadpool(identify.identify_run, get_db(), req.run_id, req.layout)


@app.post("/cluster")
async def cluster_endpoint(req: IdentifyRequest) -> dict:
    facet = "character"
    return await run_in_threadpool(cluster_engine.cluster_run, get_db(), req.run_id, facet)


# ── review data ─────────────────────────────────────────────────────────────────
@app.get("/clusters/{run_id}")
async def get_clusters(run_id: str, facet: str = "character") -> dict:
    db = get_db()
    rows = db.query(
        "SELECT c.label, i.hash, i.char_hint FROM clusters c "
        "JOIN images i ON i.hash = c.hash WHERE c.run_id=? AND c.facet=? ORDER BY c.label",
        (run_id, facet),
    )
    groups: dict[int, dict] = {}
    for r in rows:
        g = groups.setdefault(r["label"], {"label": r["label"], "hashes": [], "hint": None})
        g["hashes"].append(r["hash"])
        if r["char_hint"] and not g["hint"]:
            g["hint"] = r["char_hint"]
    return {"clusters": list(groups.values())}


@app.get("/review/{run_id}")
async def get_review(run_id: str) -> dict:
    db = get_db()

    def fetch(where: str) -> list[dict]:
        rows = db.query(
            "SELECT i.hash, i.src_path, i.char_hint, i.char_conf, i.media_type, i.nude, "
            "c.name AS character_name FROM images i "
            "JOIN run_images r ON r.hash = i.hash "
            "LEFT JOIN characters c ON c.id = i.character_id "
            f"WHERE r.run_id = ? AND {where}",
            (run_id,),
        )
        return [dict(x) for x in rows]

    return {
        "media_review": fetch("i.media_type = 'review'"),
        "borderline_char": fetch("i.status = 'review' AND i.character_id IS NOT NULL"),
        "borderline_nude": fetch(
            "i.media_type = 'anime' AND i.rating_json IS NOT NULL AND i.nude = 1"
        ),
    }


@app.post("/media/reassign")
async def media_reassign(req: MediaReassignRequest) -> dict:
    db = get_db()
    for h in req.hashes:
        db.execute("UPDATE images SET media_type=? WHERE hash=?", (req.media_type, h))
    return {"updated": len(req.hashes), "media_type": req.media_type}


# ── gallery ─────────────────────────────────────────────────────────────────────
@app.post("/characters")
async def enroll(req: EnrollRequest) -> dict:
    try:
        return await run_in_threadpool(
            gallery.enroll_from_refs, get_db(), req.name, req.series, req.ref_paths, req.outfit
        )
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.post("/clusters/{run_id}/{label}/name")
async def name_cluster_endpoint(run_id: str, label: int, req: NameClusterRequest) -> dict:
    try:
        return await run_in_threadpool(
            cluster_engine.name_cluster, get_db(), run_id, label, req.name, req.series
        )
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.get("/gallery")
async def get_gallery() -> dict:
    db = get_db()
    rows = db.query(
        "SELECT c.id, c.name, c.series, COUNT(p.id) AS prototypes "
        "FROM characters c LEFT JOIN prototypes p ON p.character_id = c.id "
        "GROUP BY c.id ORDER BY c.name"
    )
    return {"characters": [dict(r) for r in rows]}


@app.delete("/characters/{char_id}")
async def delete_character(char_id: int) -> dict:
    get_db().execute("DELETE FROM characters WHERE id=?", (char_id,))
    return {"deleted": char_id}


# ── preview / commit ────────────────────────────────────────────────────────────
@app.get("/preview/{run_id}")
async def preview(run_id: str) -> dict:
    layout = _run_layout(run_id)
    return await run_in_threadpool(route_engine.preview_run, get_db(), run_id, layout)


@app.post("/commit")
async def commit(req: CommitRequest) -> dict:
    layout = _run_layout(req.run_id)
    return await run_in_threadpool(route_engine.commit_run, get_db(), req.run_id, layout, req.mode)


# ── history ─────────────────────────────────────────────────────────────────────
@app.get("/runs")
async def list_runs() -> dict:
    rows = get_db().query(
        "SELECT run_id, input_dir, output_dir, in_place, status, started_at, "
        "finished_at, stats_json FROM runs ORDER BY started_at DESC"
    )
    return {"runs": [dict(r) for r in rows]}


@app.get("/runs/{run_id}")
async def get_run(run_id: str) -> dict:
    db = get_db()
    run = db.query_one("SELECT * FROM runs WHERE run_id=?", (run_id,))
    if not run:
        raise HTTPException(404, "run not found")
    manifest = db.query("SELECT * FROM manifest WHERE run_id=?", (run_id,))
    return {"run": dict(run), "manifest": [dict(m) for m in manifest]}


# ── media ───────────────────────────────────────────────────────────────────────
@app.get("/thumb")
async def thumb(hash: str = Query(...)) -> FileResponse:
    path = thumbs.thumb_path(hash)
    if not path.exists():
        row = get_db().query_one("SELECT src_path FROM images WHERE hash=?", (hash,))
        if row:
            thumbs.ensure_thumb(hash, Path(row["src_path"]))
    if not path.exists():
        raise HTTPException(404, "thumb not found")
    return FileResponse(path, media_type="image/webp")


@app.get("/image")
async def image(hash: str = Query(...)) -> FileResponse:
    row = get_db().query_one("SELECT src_path FROM images WHERE hash=?", (hash,))
    if not row or not Path(row["src_path"]).exists():
        raise HTTPException(404, "image not found")
    return FileResponse(row["src_path"])
