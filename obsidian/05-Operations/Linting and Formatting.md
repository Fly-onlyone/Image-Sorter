---
tags: [operations]
---

# Linting and Formatting

> Ruff governs the Python backend and Biome governs the frontend; CI runs both plus the test suite.

## Source

- `pyproject.toml` — `[tool.ruff]` (line-length 100, `extend-select = ["I"]` for isort)
- `frontend/biome.json` — Biome config (2-space, double quotes, trailing commas)

## How it works

Python uses **Ruff** with line-length 100 and isort import ordering (`extend-select = ["I"]`).
The frontend uses **Biome** (2-space indent, double quotes, trailing commas, `useImportType`
for type-only imports). Don't hand-sort imports — run the formatter.

```powershell
# Python (repo root)
uv run ruff check . ; uv run ruff format .

# Frontend (from frontend/)
bunx biome check .            # add --write to autofix
```

CI runs exactly these gates before merge:

- `uv run ruff check . && uv run ruff format --check .`
- `bunx biome check .`
- `uv run pytest -q`

## Depends on

- [[Testing Strategy]] — `pytest -q` is the third CI gate alongside the linters

## See also

- [[_index]]
- [[Backend Dev Workflow]]
- [[Frontend Dev Workflow]]
