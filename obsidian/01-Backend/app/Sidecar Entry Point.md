---
tags: [backend, app]
---

# Sidecar Entry Point

> The process entry that performs the free-port handshake and launches uvicorn.

## Source

- `backend/app/__main__.py` — primary implementation

## How it works

`main()` resolves the port: `settings.port` if set (e.g. `IMGSORT_PORT=8771` for dev), else `_free_port(host)` which binds a probe socket to `("127.0.0.1", 0)` and reads the OS-assigned port. It then announces it on **two** channels — prints `SIDECAR_PORT=<n>` (and `SIDECAR_URL=...`) to stdout for the Rust shell to parse, and writes the port to a `sidecar.port` handshake file under the data dir. Finally it hands the **port number** (not a socket fd) to `uvicorn.Server` to bind itself. This is the [[Dynamic Port Handshake]].

The `fd=` handoff is intentionally avoided: uvicorn's fd path calls `socket.fromfd(fd, AF_UNIX, ...)`, and `AF_UNIX` doesn't exist on Windows. The probe-then-bind race is negligible for a localhost desktop sidecar. The handshake file is removed on exit.

## Depends on

- [[Settings Config]] — `host`/`port`
- [[FastAPI Server]] — serves `app.server:app`

## Used by

- [[Tauri Shell]] — spawns the process, reads `SIDECAR_PORT=`

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Dynamic Port Handshake]]
- [[Backend Dev Workflow]]
