# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Image Sorter is a Windows desktop app (Tauri v2 shell + React/MUI frontend + Python FastAPI
sidecar) that sorts anime/gacha images by subject. Dev environment is Windows + PowerShell.

## Project Rules

Deeper conventions live in `.claude/rules/`:
- [architecture.md](.claude/rules/architecture.md) — system design, the per-run pipeline, data flow, components
- [code-guide.md](.claude/rules/code-guide.md) — naming + the repo's real patterns (ML facade, engine-per-phase, hand-rolled SQLite repo, theme factory) and style
- [documentation-style.md](.claude/rules/documentation-style.md) — module-docstring + section-comment conventions

A graph-linked knowledge vault lives in [`obsidian/`](obsidian/_HOME.md) — open as an Obsidian
vault (start at `_HOME.md`) or browse the markdown. Read the relevant flow/module note there
*before* changing cross-cutting code; the vault records facts the code doesn't show.

## Repo shape (non-standard — read this first)

The **repo root is the Python (uv) project** (`pyproject.toml`, `run.py`, source in
`backend/app/`). There is **no root `package.json`** — the only one is `frontend/package.json`
(bun), and **`src-tauri/` is nested inside `frontend/`**. So Python commands run from the repo
root; all frontend/Tauri commands run from `frontend/`. This mirrors the author's
`ZZZ_Bot_Python` / `TradingAgent` repos.

## Commands

Backend (from repo root):
```powershell
uv sync                 # core deps; the engine runs without ML models (see below)
uv sync --extra ml      # + dghs-imgutils + onnxruntime (large, offline ONNX)
uv run python run.py    # start the sidecar (binds a dynamic free port, prints SIDECAR_PORT=)
uv run pytest -q        # full test suite
uv run pytest tests/test_pipeline.py::test_full_pipeline -q   # a single test
uv run ruff check . ; uv run ruff format .                   # lint + format (line-length 100)
```

Frontend / Tauri (from `frontend/`):
```powershell
bun install
bun run dev                  # browser UI at http://localhost:5181 (uses the /api Vite proxy)
bun run build                # tsc --noEmit && vite build
bunx biome check .           # lint + format check (autofix: bunx biome check --write .)
bun run tauri:prepare-sidecar  # PyInstaller-build the bundled sidecar into src-tauri/binaries/
bun run tauri:dev            # desktop window (needs the sidecar binary to exist — see gotchas)
bun run tauri:build          # NSIS/MSI installer
```

For pure browser dev (`bun run dev`), run the sidecar on the fixed dev port so the Vite
`/api` proxy can reach it: `IMGSORT_PORT=8771 uv run python run.py`.

## Architecture

**Two processes, localhost only.** The Tauri Rust shell (`frontend/src-tauri/src/lib.rs`)
spawns the FastAPI sidecar, reads the `SIDECAR_PORT=<n>` line it prints on stdout, and exposes
it to the WebView via the `sidecar_url` command. The frontend never hardcodes a port:
`frontend/src/api/client.ts` resolves the base URL in order — injected `window.__SIDECAR_URL__`
→ `invoke('sidecar_url')` (Tauri) → the `/api` Vite proxy (dev) → `127.0.0.1:8770` (fallback).
The sidecar binds an OS-assigned free port (`backend/app/__main__.py`, picked via a probe
socket — never the `fd=` handoff, which breaks on Windows) to avoid colliding with the author's
other apps. The shell kills the sidecar on exit.

**Sidecar in dev and release:** both `tauri dev` and `tauri build` spawn the bundled
PyInstaller exe (the Rust shell owns its lifecycle). So `tauri dev` is a single self-contained
command — it runs the window + sidecar. After changing **backend** Python, re-run
`bun run tauri:prepare-sidecar` to refresh the bundled exe (the frontend/Rust hot-reload as
usual). For pure browser dev without rebuilding, run the sidecar from source
(`IMGSORT_PORT=8771 uv run python run.py`) + `bun run dev` and open http://localhost:5181.

**Per-run pipeline:** `scan → dedup → media gate → identify (+ artist) → cluster → preview →
commit`. Everything is keyed by the image's **SHA-256 content hash** for idempotency. Each phase
is a `backend/app/engine/*.py` module operating on SQLite rows; `engine/route.py` builds the
destination paths and `engine/dedup.py` flags losers (only sent to the Recycle Bin at commit).
`backend/app/jobs.py::run_pipeline` chains the phases on a worker thread and emits SSE progress;
the granular `POST /dedup`, `/gate`, `/tag`, `/identify`, `/cluster` endpoints exist too and are
what the tests drive.

**SSE progress:** engine code (worker threads) calls `events.publish(...)`, which hops onto the
serving loop via `call_soon_threadsafe`; the frontend `Progress.tsx` consumes one `EventSource`.
The event type travels inside the JSON payload (unnamed SSE channel), so a single `onmessage`
handler receives everything.

**ML facade + heuristic fallback (important):** `backend/app/engine/models.py` is the *only*
place that imports `dghs-imgutils`. `has_ml()` gates every model call; when imgutils is absent it
returns a deterministic fallback (a weak 16×16 colour embedding stands in for CCIP, the media
gate assumes "anime illustration", rating assumes SFW). This is why the whole pipeline — and the
test suite — runs end-to-end with no ONNX weights downloaded. Install `--extra ml` for the real
models. When editing `models.py`, REPL-verify each imgutils signature against the installed
version (its API shifts between releases) and always pass `model='ccip-caformer_b36-24'` to CCIP.

**Routing (`engine/route.py`):** non-anime → `other/`; anime with no character → `anime/`; one
character → `<char>/`; 2+ → `<A> + <B> + …/` (alphabetical, cap 3 + `+N more`, hash-truncate on
Windows path overflow); `nude/` is always the innermost leaf. Output may equal input → files are
**moved** in place (otherwise copied). `media_type` / `dup_role` / `char_names_json` columns on
`images` drive all of this. `GET /preview` is read-only — nothing touches disk until `/commit`.

**Config layering:** `backend/app/config.py` holds defaults (overridable via `IMGSORT_*` env
vars); user changes are persisted in the SQLite `settings` table and applied on top via
`PATCH /settings`. App data (DB, thumbnail cache, model cache) lives under
`%LOCALAPPDATA%/ImageSorter`.

**Theme system (`frontend/src/theme/`):** 11 typed `ThemePreset`s in `presets.ts` (default
Dracula; a preset may pass a `glass` override — Dracula uses a glossier one) → `buildTheme()`
produces an MUI theme plus a `theme.app` token bag (glass/shadows/spring/animations) that
components and framer-motion read. `buildTheme` first runs every preset through
`normalizeColors()` (`theme/normalize.ts`) so all themes share two central standards from
`theme/standards.ts`: one **background darkness** (each `bg` re-leveled to the `STANDARD_BG_LIGHTNESS` HSL target
— the single tunable darkness constant in `standards.ts` — with `surface`/`elevated`
shifted by the same delta) and a **text-contrast floor** (text
auto-lightened until it clears WCAG ≈7:1 primary / 4.5:1 secondary against the lightest surface).
Authored preset hexes therefore fix each theme's hue/identity; the standard governs darkness +
readability. Accents pass through untouched, so `palette.ts` maps text straight through (the old
45% secondary-text mix is gone). App states map onto MUI palette slots — nude=`error`,
review=`warning`, identified=`success` — so every theme "just works". Glass + glow apply to
chrome only; the thumbnail grid stays flat neutral. `SilkRibbons` (signature animated background,
full intensity on every screen) layers over a theme-derived `body` gradient + accent glow.

**Shared frontend primitives (`frontend/src/components/`):** `PageContainer` owns page width —
**never hardcode a per-page `maxWidth`** (fluid by default; a number caps + centers it).
`PageBar` is the **sticky** title rail every screen renders instead of a big heading: a
**collapsing large title** (icon chip + large title with the subtitle below it) that, as the
window scrolls, shrinks and docks into a slim rail (`useScroll`/`useTransform`, threshold
`COLLAPSE_PX`), closed by a 1px animated gradient hairline. On run-flow views it also carries
the Setup→Process→Review→Commit `Stepper` at constant size (so `AppShell` no longer renders it).
Keep the rail a flat opaque band — **no `backdrop-filter`** there (a blur formed a compositing
layer that hid the fixed Toast in the WebView). `SettingRow` + `SettingsSection` (label/control
row + titled glass-card group) and `CardRadioGroup` (selectable-card picker) compose Settings and
New Run — **never put `height:"100%"` on a section card** (stretching a 1-control card to a tall
neighbour was the old source of empty layouts). `PageTransition` crossfades view changes
(opacity-only so the sticky `PageBar` isn't trapped by a transformed ancestor); `StatTile` is the
animated count-up tile; `Toast` + `useToast()` is the themed app-wide snackbar (**bottom-center,
outlined** over a solid `background.paper` surface — no severity fill, and **no `backdrop-filter`**
which hid it in the WebView). `FadeIn` eases dynamically-appearing
alerts in; lists that add/remove items wrap in `AnimatePresence` for exit animations. All motion
gates on `usePrefersReducedMotion`.

## Gotchas

- **Tauri `externalBin` is validated at compile time** — `cargo check`/`tauri dev`/`tauri build`
  all fail unless `frontend/src-tauri/binaries/image-sorter-sidecar-<target-triple>.exe` exists.
  A placeholder is committed-ignored there; run `bun run tauri:prepare-sidecar` to build the real
  one. If you relocate `src-tauri/`, delete its `target/` (`cargo clean`) — absolute paths get
  baked into the build cache.
- **MUI v9 `Stack` dropped `alignItems`/`justifyContent`** as direct props — pass them via `sx`.
- The frontend is **React 18.3.1 + Vite 7 + `@vitejs/plugin-react` v5** (v6 requires Vite 8) —
  keep these aligned.

## Conventions

Default branch is `dev` (PRs target `dev`; release-please runs there). Conventional Commits are
enforced by pre-commit (`pre-commit install --hook-type commit-msg`). Python = Ruff, frontend =
Biome. `release-please` ("simple") fans the version into `pyproject.toml`,
`frontend/src-tauri/tauri.conf.json`, and `frontend/src-tauri/Cargo.toml`.
