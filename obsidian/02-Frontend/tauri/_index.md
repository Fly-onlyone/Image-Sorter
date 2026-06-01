---
tags: [moc, frontend]
---

# Frontend `tauri/` — Map of Content

> The thin Tauri v2 Rust shell (`frontend/src-tauri/`). Hosts the WebView, spawns + owns
> the FastAPI sidecar, and exposes the resolved port to the frontend.

## Notes

- [[Tauri Shell]] — sidecar spawn, `SIDECAR_PORT` parse, `sidecar_url` command, teardown (`src/lib.rs`)
- [[Tauri Config]] — window/CSP config + `externalBin` sidecar bundling (`tauri.conf.json`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[Two-Process Architecture]] · [[Dynamic Port Handshake]] · [[Tauri Build]]
