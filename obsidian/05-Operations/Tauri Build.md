---
tags: [operations]
---

# Tauri Build

> Run the desktop window in dev or produce an NSIS/MSI installer — both require the bundled sidecar exe to exist.

## Source

- `frontend/package.json` — `tauri:dev`, `tauri:build` scripts
- `frontend/src-tauri/tauri.conf.json` — `externalBin` declaration (compile-time validated)

## How it works

All commands run from `frontend/` (where `src-tauri/` is nested). `bun run tauri:dev` opens the
desktop window and the Rust shell spawns the sidecar, making it a single self-contained command.
`bun run tauri:build` produces the NSIS/MSI installer.

```powershell
bun run tauri:dev      # desktop window + sidecar
bun run tauri:build    # NSIS/MSI installer
```

**`externalBin` is validated at compile time** — `cargo check`, `tauri dev`, and `tauri build`
all fail unless `src-tauri/binaries/image-sorter-sidecar-<target-triple>.exe` exists, so run
[[Sidecar Packaging]] first. If you relocate `src-tauri/`, run `cargo clean` — absolute paths
get baked into the build cache.

## Depends on

- [[Sidecar Packaging]] — must build the exe before any Tauri build succeeds
- [[Tauri Shell]] — `lib.rs` spawns the sidecar and owns its lifecycle
- [[Tauri Config]] — `tauri.conf.json` declares the `externalBin`

## See also

- [[_index]]
- [[Frontend Dev Workflow]]
- [[Release Please]]
