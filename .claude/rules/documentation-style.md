# Documentation Style Guide

## Core Principles

1. **Document WHY, not WHAT** — the code shows what; comments explain the non-obvious decision.
2. **Module docstrings carry the design** — every backend module opens with a docstring stating
   its role in the pipeline and the key invariant (e.g. dedup's tiebreak order, the gate's
   short-circuit, the nude policy's escalation rule). This is where a reader gets oriented.
3. **Keep it current** — outdated docs are worse than none.
4. **Be concise** — every word earns its place.

## Established conventions in this repo

### Python module docstrings
Open each `engine/*.py` (and `db.py`, `server.py`, etc.) with a triple-quoted docstring: one
line naming the component, then the rationale / invariants. Reference symbols with double
backticks (`` ``media_type`` ``). Example shape:

```python
"""Media gate — anime art vs other drawing vs photo.

Short-circuiting chain of ``imgutils.validate`` classifiers run *after* dedup and
*before* character classification, so non-anime images never waste ML. Sets
``images.media_type`` ∈ {anime, other, review}.
"""
```

### Section comment boxes
Group related functions with the box-rule style already used in `models.py` / `gallery.py`:

```python
# ── CCIP identity ──────────────────────────────────────────
```

```typescript
// ── networking (dynamic free port) ──
```

### TS file headers
Each `frontend/src` file starts with a `//` comment stating its purpose and any cross-cutting
rule it enforces (e.g. "glass + glow apply to chrome only; thumbnails stay flat neutral").

## No external-design references

PLAN.md (the original design doc) was removed. **Do not reintroduce `PLAN.md §X`, bare
`§section`, or `P<phase>` citations** — they point at a deleted file. State the rule inline
instead. The design now lives in the README, this `.claude/rules/` set, and module docstrings.

## Skip documentation for

- Getters/setters and pydantic field declarations with obvious purpose.
- Self-documenting code (`get_or_create_character(db, name, series)`).
- Test files — the test name and asserts are the documentation.

## Words to avoid

| Avoid | Use instead |
|-------|-------------|
| "This function…" | start with a verb |
| "Basically" / "Simply" / "Obviously" | remove |
| "etc." | be specific |
