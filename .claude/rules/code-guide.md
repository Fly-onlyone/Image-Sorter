# Code Guide

Dual-stack: Python (backend, Ruff) + TypeScript/React (frontend, Biome) + a thin Rust shell.
The repo root is the Python project; `frontend/` is bun + Tauri (see CLAUDE.md "Repo shape").

## Package Structure

```
Image Sorter/
├── pyproject.toml  run.py            # Python project root + sidecar launcher
├── backend/app/
│   ├── server.py  jobs.py  events.py # endpoints, pipeline orchestration, SSE bus
│   ├── db.py  config.py  schemas.py  # SQLite repo, settings, pydantic models
│   └── engine/                       # one module per pipeline phase + models.py facade
├── frontend/
│   ├── src/{api,store,hooks,utils,pages,theme}/   # client, context, hooks, screens, theme
│   ├── src/components/effects/       # SilkRibbons + ported polish helpers
│   └── src-tauri/                    # Rust shell (lib.rs lifecycle), tauri.conf.json
├── product/sidecar.spec              # PyInstaller packaging
└── tests/
```

## Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Python modules / functions | `snake_case` | `engine/route.py`, `commit_run()` |
| Pydantic models | `PascalCase` + `Request`/`Response` suffix | `ScanRequest`, `PreviewResult` |
| Python private helpers | `_leading_underscore` | `_winner_key`, `_iter_images` |
| React components / pages | `PascalCase` file + export | `pages/Setup.tsx` → `SetupScreen` |
| TS client / hooks / utils | lowercase or `useX` | `api/client.ts`, `hooks/usePrefersReducedMotion.ts` |
| TS theme files | lowercase | `theme/presets.ts`, `theme/components.ts` |
| Type-only imports (TS) | `import type { … }` | enforced by Biome `useImportType` |

## Code Patterns (the real ones in this repo)

### ML facade (`engine/models.py`) — single gateway + graceful fallback
**Every** call into `dghs-imgutils` goes through `models.py`. `has_ml()` is checked first;
when imgutils is absent, each function returns a deterministic heuristic (16×16 colour
embedding for CCIP, gate assumes "anime illustration", rating assumes SFW). **Never import
`imgutils` outside `models.py`** (the lazy import there is what keeps the sidecar bootable
without weights). Always pass `model='ccip-caformer_b36-24'` to CCIP and load its own
threshold. REPL-verify imgutils signatures before relying on them — the API shifts per release.

### Engine-per-phase
Each pipeline stage is its own module exposing one `<phase>_run(db, run_id, …) -> dict`
function that reads/writes SQLite rows keyed by hash and `publish()`es SSE progress. Add a new
phase as a new `engine/x.py` + a step in `jobs.py::run_pipeline` + (optionally) a granular
endpoint in `server.py`.

### Hand-rolled SQLite repo (`db.py`) — no ORM
One `Database` class wraps a single `sqlite3` connection (`check_same_thread=False`) behind an
`RLock`; endpoints run in FastAPI's threadpool. Use `db.query`/`query_one`/`execute`. Schema
lives in the `SCHEMA` string (idempotent `CREATE TABLE IF NOT EXISTS`). Features are stored as
raw `float32` bytes BLOBs.

### SSE pub/sub (`events.py`)
Engine worker threads call `publish(run_id, "event_name", **data)`, which marshals back onto
the serving loop via `call_soon_threadsafe`. Events are emitted on the **unnamed** SSE channel
with the type inside the JSON, so the frontend uses a single `EventSource.onmessage`.

### Typed theme-preset factory (`theme/`)
A `ThemePreset` (12 color roles + glass/spring/animation tokens) → `buildTheme()` → an MUI
theme plus a `theme.app` token bag read by components and framer-motion. App states map onto
MUI palette slots (`nude→error`, `review→warning`, `identified→success`) — **never hardcode
hex** in components; derive from the active palette so all 11 themes work. `buildTheme` first
normalizes the preset's colors once (`theme/normalize.ts`, knobs in `theme/standards.ts`):
every theme is leveled to one background darkness (`STANDARD_BG_LIGHTNESS`) and a WCAG text-
contrast floor, while accents pass through. Add/adjust the standard there — **don't** re-tune
darkness or text contrast per preset.

### Config layering (`config.py`)
`Settings` (pydantic-settings, env prefix `IMGSORT_`) provides defaults; persisted user
overrides come from the SQLite `settings` table. Read config via `get_settings()` (lru-cached).

### Shared page primitives (`components/`)
Screens compose from shared primitives, not bespoke layout. `PageContainer` (`PageContainer.tsx`)
owns page width — fluid by default, or a number that caps + centers it (`mx:auto`); **never
hardcode a per-page `maxWidth` box**; `fill` makes it a flex column for list pages. `PageBar`
(same file) is the **sticky** title rail every screen renders instead of a big heading — a
**collapsing large title** (icon chip + large title with the subtitle below) that shrinks/docks
into a slim rail on scroll (`useScroll`/`useTransform`), closed by an animated gradient hairline;
on run-flow views it also hosts the Setup→Process→Review→Commit `Stepper` at constant size (so
`AppShell` no longer renders it). Keep the rail flat opaque — **no `backdrop-filter`** (it hid the
fixed Toast in the WebView). `SettingRow` + `SettingsSection` (label/control row + titled glass-card
group) and `CardRadioGroup` (selectable-card picker) compose Settings and New Run — **never set
`height:"100%"` on a section card**; cards size to content (the stretch was the old empty-layout
bug). `PageTransition` (`PageTransition.tsx`) crossfades view changes (opacity-only so the sticky
`PageBar` isn't trapped by a transformed ancestor). `StatTile` (`StatTile.tsx`) is the count-up
tile. `Toast` + `useToast()` (`Toast.tsx`, `hooks/useToast.ts`) is the one themed snackbar
(**bottom-center, outlined**, no severity fill) — don't add ad-hoc `Snackbar`s. `FadeIn`
(`effects/FadeIn.tsx`) eases dynamically-rendered alerts in (vs `ScrollReveal`, which is for long
scrolling lists); wrap add/remove lists in `AnimatePresence` for exit animations. Reuse the
`effects/` motion wrappers (`MagneticButton`, `ScrollReveal`, `AnimatedGradientBorder`); all motion
gates on `usePrefersReducedMotion`.

### When NOT to add abstraction
No DI containers, no ORM, no Redux. This is a single-user localhost app — direct functions +
SQLite + React context are the intended altitude. Match it; don't introduce frameworks.

## Code Style

- **Imports** — Ruff (isort, `extend-select=["I"]`) orders Python; Biome `organizeImports`
  orders TS. Don't hand-sort; run the formatter.
- **Line length** 100 (Ruff). Biome: 2-space indent, double quotes, trailing commas.
- **Guard clauses / early returns** throughout the engine; broad `except Exception` is
  acceptable in the per-image loops (one bad image must not kill a run).
- **MUI v9 `Stack`** has no `alignItems`/`justifyContent` props — pass via `sx`.

## Before "done"

`uv run ruff check . && uv run ruff format --check .` (root) and `bunx biome check .`
(frontend) must pass; `uv run pytest -q` green. CI runs exactly these.
