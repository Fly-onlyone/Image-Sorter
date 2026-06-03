"""CORS allowlist — only the Tauri WebView + dev/loopback origins receive CORS headers;
arbitrary web origins are refused, so a stray page in the user's browser can't drive the
localhost sidecar even if it guesses the port.
"""

from __future__ import annotations

import os
import tempfile

# Isolate the app data dir BEFORE importing the app (settings are read at import).
os.environ.setdefault("IMGSORT_DATA_DIR", tempfile.mkdtemp(prefix="imgsort-cors-"))

import pytest  # noqa: E402
from app.server import app  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

client = TestClient(app)

ALLOWED = [
    "tauri://localhost",  # macOS / Linux WebView
    "http://tauri.localhost",  # Windows WebView2
    "http://localhost:5181",  # browser dev server
    "http://127.0.0.1:8770",  # loopback fallback
]
BLOCKED = [
    "https://evil.example",
    "http://tauri.localhost.evil.com",  # suffix attack on the WebView host
    "http://notlocalhost",
    "https://tauri.localhost.attacker.test",
]


@pytest.mark.parametrize("origin", ALLOWED)
def test_allowed_origin_is_echoed(origin: str) -> None:
    r = client.get("/health", headers={"Origin": origin})
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == origin


@pytest.mark.parametrize("origin", BLOCKED)
def test_blocked_origin_gets_no_cors_header(origin: str) -> None:
    r = client.get("/health", headers={"Origin": origin})
    assert "access-control-allow-origin" not in r.headers
