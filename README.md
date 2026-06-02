# Image Sorter — Anime / Gacha Character Categoriser

A Windows desktop app that sorts a folder of anime/gacha images by **subject**
(character and/or artist), keeps the highest-resolution copy of duplicates, gates
out non-anime images, and splits R-18 art into a `nude/` leaf — all offline.

📚 Documentation lives in [`obsidian/`](obsidian/_HOME.md) — open as an Obsidian vault or
browse the markdown directly.

## Architecture

```
Tauri v2 (Rust shell, WebView2)
  └─ React 18 + Vite + TS + MUI v9          ← UI
        │  HTTP + SSE over 127.0.0.1 : dynamic free port
  └─ FastAPI sidecar (Python, uv)           ← engine
        engine: dghs-imgutils + onnxruntime   state: SQLite
```

The Rust shell spawns the PyInstaller-built FastAPI sidecar on launch, reads the
**dynamic free port** it binds (never the fixed 8000/8001 used by other apps), injects
that port into the WebView, and kills the sidecar on window close.

## Per-run pipeline

```
scan → dedup → media gate → (character + artist resolve) → preview → commit
```

- **dedup** — SHA-256 + perceptual hash (+ optional LPIPS confirm); keep the
  highest-resolution copy, losers go to the Recycle Bin (recoverable).
- **media gate** — `aicheck → real → classify`; only anime *illustration* is classified,
  everything else routes to `other/`.
- **routing** — `other/` (non-anime), `anime/` (anime, character unresolved),
  `<char>/`, `<A> + <B> + …/` (2+ characters), with `nude/` as the innermost leaf.

## Development

Prerequisites: **bun**, **uv**, **Rust** (stable), **Python 3.11–3.12**.

The repo root is the **Python (uv) project**; the frontend (with `src-tauri/` nested
inside it) is a sibling — matching the `ZZZ_Bot_Python` / `TradingAgent` convention.

```powershell
# backend (FastAPI sidecar) — from the repo root
uv sync                      # core deps (server boots without ML models)
uv sync --extra ml           # add dghs-imgutils + onnxruntime (large)
uv run python run.py         # runs the sidecar on a dynamic free port

# frontend + Tauri shell — from frontend/
cd frontend
bun install
bun run dev                  # browser UI at http://localhost:5181
bun run tauri:dev            # or the desktop window (needs the sidecar binary; see below)
```

For `tauri:dev` / `tauri:build`, build the bundled sidecar once with
`bun run tauri:prepare-sidecar` (PyInstaller; needs `--extra ml`). The first ML run
downloads ONNX weights (hundreds of MB) into the local model cache; afterwards
everything runs offline (`HF_HUB_OFFLINE=1`).

## Project layout

| Path | What |
|---|---|
| `pyproject.toml`, `run.py` | Python project root (uv) + sidecar launcher |
| `backend/app/` | FastAPI sidecar — `server.py`, `db.py`, `engine/*` |
| `frontend/src/pages/` | the 7 app screens (Setup → Progress → Review → Commit, Gallery, History, Settings) |
| `frontend/src/api/`, `store/`, `hooks/`, `utils/` | client, app state, hooks, platform helpers |
| `frontend/src/theme/` | typed 11-theme registry (default Dracula) |
| `frontend/src/components/` | shared chrome — `PageBar` (sticky collapsing-title rail), `PageContainer`, `SettingRow`/`SettingsSection`/`CardRadioGroup`, `StatTile`, `Toast` (bottom-center, outlined) |
| `frontend/src/components/effects/` | `SilkRibbons` (signature background) + ported polish helpers |
| `frontend/src-tauri/` | Rust shell — sidecar lifecycle + port handshake |
| `product/sidecar.spec` | PyInstaller packaging for the sidecar |
| `.github/workflows/` | CI, release-please, CodeQL |

The per-run pipeline and routing rules are documented in this README and in the engine
module docstrings under `backend/app/engine/`.
