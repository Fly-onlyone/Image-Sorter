---
tags: [moc, operations]
---

# Operations — Map of Content

> Dev, build, packaging, and release workflows. Remember the repo shape: Python commands
> run from the repo root; all frontend/Tauri commands run from `frontend/`.

## Dev loops

- [[Backend Dev Workflow]] — `uv sync`, `run.py`, pytest, ruff (from repo root)
- [[Frontend Dev Workflow]] — bun dev, the `/api` proxy + source sidecar, biome (from `frontend/`)

## Build & package

- [[Sidecar Packaging]] — PyInstaller build of the bundled sidecar exe (`product/sidecar.spec`)
- [[Tauri Build]] — `tauri:dev` / `tauri:build` (NSIS/MSI); `externalBin` compile-time gate

## Quality & release

- [[Testing Strategy]] — heuristic fallback lets the full pipeline run weightless under `TestClient`
- [[Linting and Formatting]] — Ruff (Python) + Biome (frontend); what CI runs
- [[Release Please]] — Conventional Commits → version fan-out across the three manifests

## See also

- [[_HOME]]
- [[Dynamic Port Handshake]] · [[Tauri Shell]] · [[ML Facade]]
