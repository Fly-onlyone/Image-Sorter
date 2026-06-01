---
tags: [frontend, tauri]
---

# Tauri Shell

> Rust shell that spawns the bundled FastAPI sidecar, parses the dynamic port it prints, exposes it to the WebView, and kills it on exit.

## Source

- `frontend/src-tauri/src/lib.rs` — primary implementation (`main.rs` just calls `run()`)

## How it works

`SidecarState` holds the resolved `port` and the `CommandChild` behind `Mutex`es. `spawn_sidecar()` launches the bundled PyInstaller sidecar (`image-sorter-sidecar`) via the shell plugin's `sidecar()` — in both dev and release — then reads its stdout, watching for a line prefixed `SIDECAR_PORT=`; the parsed `u16` is stored in state. The `sidecar_url` command polls that state for ~10 s (100 × 100 ms) and returns `http://127.0.0.1:<port>`, or the `8770` fallback if the port never arrives. On `RunEvent::ExitRequested`, `kill_sidecar()` kills the child so no orphan process survives the window.

## Depends on

- [[Sidecar Entry Point]] — the Python process that prints `SIDECAR_PORT=`
- [[Tauri Config]] — declares the `externalBin` sidecar binary spawned here

## Used by

- [[API Client]] — invokes the `sidecar_url` command to resolve its base URL
- [[Dynamic Port Handshake]]

## Gotchas

- The sidecar is spawned in dev too, so `tauri dev` is self-contained but needs the bundled exe present.
- A missing binary logs a hint to run `bun run tauri:prepare-sidecar` rather than crashing.

## See also

- [[02-Frontend/tauri/_index|tauri]]
- [[Two-Process Architecture]]
- [[Dynamic Port Handshake]]
