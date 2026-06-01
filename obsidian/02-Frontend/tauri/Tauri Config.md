---
tags: [frontend, tauri]
---

# Tauri Config

> Declares the desktop window, CSP, and the `externalBin` sidecar bundling for the Tauri shell.

## Source

- `frontend/src-tauri/tauri.conf.json` — primary configuration
- `frontend/src-tauri/Cargo.toml`, `frontend/src-tauri/src/main.rs` — crate + entry (`windows_subsystem = "windows"` in release)

## How it works

The single `main` window opens at 1320×860 (min 1000×660), centered and resizable. The CSP allows the localhost sidecar — `img-src`/`connect-src` permit `http://127.0.0.1:*` (plus `ws://`) alongside `data:`/`blob:`/`asset:`, with `'unsafe-inline'` styles and `data:` fonts. The dev URL is `http://localhost:5181`; bundle targets are NSIS and MSI (current-user install).

The sidecar exe is bundled through `externalBin: ["binaries/image-sorter-sidecar"]`. Tauri validates `externalBin` at compile time, so `cargo check`, `tauri dev`, and `tauri build` all fail unless `frontend/src-tauri/binaries/image-sorter-sidecar-<target-triple>.exe` exists.

## Depends on

- [[Tauri Shell]] — the Rust code that spawns the declared `externalBin`

## Used by

- [[Tauri Build]] — consumes this config to produce installers

## Gotchas

- Build the real sidecar with `bun run tauri:prepare-sidecar`; a missing binary fails compilation.
- If you relocate `src-tauri/`, run `cargo clean` — absolute paths get baked into the build cache.

## See also

- [[02-Frontend/tauri/_index|tauri]]
- [[Tauri Build]]
- [[Two-Process Architecture]]
