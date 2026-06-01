"""Sidecar entry point.

Implements the dynamic-free-port handshake:

1. Ask the OS for a free port by binding a probe socket to ``127.0.0.1:0`` and
   reading the assigned port (or use ``IMGSORT_PORT`` when set).
2. Print ``SIDECAR_PORT=<port>`` to stdout (the Rust shell parses this line) and
   write the same value to a handshake file under the data dir.
3. Hand the **port number** to uvicorn, which binds it itself.

We intentionally don't hand uvicorn a pre-bound socket fd: its ``fd=`` path calls
``socket.fromfd(fd, socket.AF_UNIX, …)``, and ``AF_UNIX`` doesn't exist on Windows.
The probe-then-bind race is negligible for a localhost-only desktop sidecar.

Run directly for development::

    uv run python run.py                     # dynamic free port
    IMGSORT_PORT=8771 uv run python run.py    # fixed dev/fallback port
"""

from __future__ import annotations

import socket
import sys

import uvicorn

from .config import get_settings


def _free_port(host: str) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind((host, 0))  # port 0 → OS assigns a free one
        return sock.getsockname()[1]


def main() -> None:
    settings = get_settings()
    port = settings.port or _free_port(settings.host)

    # Handshake — both channels so the Rust shell can use whichever it prefers.
    handshake = settings.data_dir / "sidecar.port"
    handshake.write_text(str(port), encoding="utf-8")
    print(f"SIDECAR_PORT={port}", flush=True)
    print(f"SIDECAR_URL=http://{settings.host}:{port}", flush=True)

    config = uvicorn.Config(
        "app.server:app",
        host=settings.host,
        port=port,
        log_level="info",
        access_log=False,
    )
    server = uvicorn.Server(config)
    try:
        server.run()
    except KeyboardInterrupt:  # pragma: no cover
        pass
    finally:
        handshake.unlink(missing_ok=True)
        sys.exit(0)


if __name__ == "__main__":
    main()
