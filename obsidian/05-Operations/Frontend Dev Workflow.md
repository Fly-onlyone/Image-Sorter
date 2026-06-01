---
tags: [operations]
---

# Frontend Dev Workflow

> Run the React/MUI UI in the browser against a source sidecar via the `/api` Vite proxy — all from `frontend/`.

## Source

- `frontend/package.json` — bun scripts (`dev`, `build`, `lint`), Vite 7, React 18.3.1
- `frontend/src/api/client.ts` — base-URL resolution (proxy in dev)

## How it works

All frontend/Tauri commands run from `frontend/` (the only `package.json` lives there; bun is
the package manager). `bun run dev` serves the browser UI at `http://localhost:5181`, which
reaches the sidecar through the `/api` Vite proxy. `bun run build` runs `tsc --noEmit && vite
build`.

```powershell
bun install
bun run dev                  # browser UI at http://localhost:5181 (uses the /api Vite proxy)
bun run build                # tsc --noEmit && vite build
bunx biome check .           # lint + format check (autofix: bunx biome check --write .)
```

For pure browser dev there is no Tauri shell to spawn the sidecar, so run it from source on the
fixed dev port the proxy expects (from the repo root): `IMGSORT_PORT=8771 uv run python
run.py`. Then open `http://localhost:5181`.

## Depends on

- [[API Client]] — resolves the base URL, falling back to the `/api` proxy in dev
- [[Backend Dev Workflow]] — supplies the source sidecar the proxy targets

## See also

- [[_index]]
- [[Tauri Build]]
- [[Linting and Formatting]]
- [[Dynamic Port Handshake]]
