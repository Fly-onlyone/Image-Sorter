---
tags: [operations]
---

# Backend Dev Workflow

> Sync deps, run the sidecar, and test/lint the Python project — all from the repo root.

## Source

- `pyproject.toml` — uv project, `[project.optional-dependencies] ml`, Ruff config (line-length 100)
- `run.py` — sidecar launcher that binds a dynamic free port and prints `SIDECAR_PORT=`

## How it works

The **repo root is the Python (uv) project** (`pyproject.toml`, `run.py`, source in
`backend/app/`). There is no root `package.json`, so all Python commands run from the repo
root. The sidecar boots without ML weights because the engine lazy-loads `dghs-imgutils` and
degrades to a [[Heuristic Fallback Pattern]] when it is absent.

```powershell
uv sync                 # core deps; engine runs without ML models
uv sync --extra ml      # + dghs-imgutils + onnxruntime (large, offline ONNX)
uv run python run.py    # start the sidecar (binds a dynamic free port, prints SIDECAR_PORT=)
uv run pytest -q        # full test suite
uv run ruff check . ; uv run ruff format .   # lint + format (line-length 100)
```

For pure browser dev, run the source sidecar on the fixed dev port so the Vite `/api` proxy
can reach it: `IMGSORT_PORT=8771 uv run python run.py`.

## Depends on

- [[Sidecar Entry Point]] — `run.py` delegates to `app.__main__:main`, which binds port 0
- [[ML Facade]] — gates every ML call so the suite runs weightless

## See also

- [[_index]]
- [[Frontend Dev Workflow]]
- [[Testing Strategy]]
- [[Linting and Formatting]]
