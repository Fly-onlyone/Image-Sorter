---
tags: [operations]
---

# Sidecar Packaging

> PyInstaller bundles the FastAPI sidecar into a single exe that the Tauri shell spawns.

## Source

- `product/sidecar.spec` — one-file PyInstaller spec; `collect_all()` for native DLLs
- `frontend/package.json` — `tauri:prepare-sidecar` → `scripts/prepare-tauri-sidecar.ts`

## How it works

From `frontend/`, `bun run tauri:prepare-sidecar` PyInstaller-builds the bundled sidecar into
`src-tauri/binaries/` as `image-sorter-sidecar-<target-triple>.exe`. After changing **backend**
Python, re-run it to refresh the bundled exe — `tauri dev` and `tauri build` both spawn this
binary rather than the source.

```powershell
bun run tauri:prepare-sidecar   # PyInstaller build into src-tauri/binaries/
```

The spec is a **one-file** build because Tauri `externalBin` expects a single file. It uses
`collect_all()` to pull in `onnxruntime`'s native DLLs plus `imgutils`/`imagehash` data so they
aren't dropped, and `collect_submodules("app")` because uvicorn imports the app via the string
`"app.server:app"` and `models.py` lazy-imports imgutils as strings (invisible to static
analysis). If a one-file build still drops a DLL on a target machine, switch to a one-dir build
and ship the folder via Tauri `bundle.resources`.

## Depends on

- [[ONNX Runtime]] — native DLLs gathered via `collect_all("onnxruntime")`
- [[dghs-imgutils Integration]] — imgutils data bundled; lazy string imports forced in
- [[Sidecar Entry Point]] — `run.py` is the PyInstaller entry script

## See also

- [[_index]]
- [[Tauri Build]]
