"""End-to-end pipeline smoke test using the heuristic fallback (no ONNX models).

Validates: scan → dedup (keep highest-res) → gate → identify (gallery match +
residual) → preview → commit routing (``<char>/`` vs ``anime/`` vs Recycle Bin),
plus name sanitisation and the combined-folder builder.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

# Isolate the app data dir BEFORE importing the app (settings are read at import).
_TMP = tempfile.mkdtemp(prefix="imgsort-test-")
os.environ["IMGSORT_DATA_DIR"] = _TMP

from app.engine import route  # noqa: E402
from app.server import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


def _make(path: Path, seed: int, size=(96, 96)) -> None:
    """Deterministic spatial pattern per seed (flat colours share a phash, so vary
    the content). Same seed at different sizes stays perceptually identical."""
    w, h = size
    xs = np.linspace(0, 1, w)
    ys = np.linspace(0, 1, h)
    x, y = np.meshgrid(xs, ys)
    r = np.sin(x * 6 + seed) * 0.5 + 0.5
    g = np.cos(y * 6 + seed * 2) * 0.5 + 0.5
    b = np.sin((x + y) * 4 + seed * 3) * 0.5 + 0.5
    arr = (np.stack([r, g, b], axis=-1) * 255).astype("uint8")
    Image.fromarray(arr).save(path)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_sanitize_and_combined_folder():
    assert route.sanitize("a<b>:c?") == "a_b__c_"
    assert route.sanitize("trailing. ") == "trailing"
    assert route.combined_folder(["Navia", "Furina"]) == "Furina + Navia"
    many = route.combined_folder(["D", "C", "B", "A"])
    assert many.startswith("A + B + C") and "+1 more" in many


def test_full_pipeline(client: TestClient, tmp_path: Path):
    src = tmp_path / "in"
    out = tmp_path / "out"
    src.mkdir()
    out.mkdir()

    # Alice = pattern 1 (two resolutions → dedup keeps the larger), Bob = pattern 7 (unknown).
    _make(src / "alice_big.png", seed=1, size=(160, 160))
    _make(src / "alice_small.png", seed=1, size=(64, 64))
    _make(src / "bob.png", seed=7, size=(112, 112))

    # Enroll Alice from the big ref.
    r = client.post(
        "/characters", json={"name": "Alice", "ref_paths": [str(src / "alice_big.png")]}
    )
    assert r.status_code == 200, r.text

    # Scan.
    r = client.post(
        "/scan", json={"input_dir": str(src), "output_dir": str(out), "recursive": True}
    )
    assert r.status_code == 200, r.text
    run_id = r.json()["run_id"]
    assert r.json()["scanned"] == 3

    # Granular phases.
    assert client.post("/dedup", json={"run_id": run_id}).status_code == 200
    assert client.post("/gate", json={"run_id": run_id}).status_code == 200
    assert client.post("/tag", json={"run_id": run_id}).status_code == 200
    assert (
        client.post("/identify", json={"run_id": run_id, "layout": ["character"]}).status_code
        == 200
    )

    # Preview: nothing on disk yet.
    prev = client.get(f"/preview/{run_id}").json()
    folders = {f["folder"] for f in prev["tree"]}
    assert "Alice" in folders  # gallery match routed alice_big → Alice/
    assert "anime" in folders  # bob unresolved → anime/
    assert prev["trash_count"] == 1  # alice_small deduped
    assert not any(out.iterdir())  # disk untouched before commit

    # Commit.
    stats = client.post("/commit", json={"run_id": run_id, "mode": "copy"}).json()
    assert stats["trashed"] == 1
    assert (out / "Alice").is_dir()
    assert (out / "anime").is_dir()
    assert (out / "Alice" / "alice_big.png").exists()
