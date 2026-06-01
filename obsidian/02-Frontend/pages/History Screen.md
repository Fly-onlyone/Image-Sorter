---
tags: [frontend, pages]
---

# History Screen

> A DataGrid of past runs read from the manifest, showing input/output dirs, in-place flag, status, and start time.

## Source

- `frontend/src/pages/History.tsx` (`HistoryScreen`) — primary implementation

## How it works

`HistoryScreen` fetches `api.listRuns` ([[API Client]]) once on mount and feeds the rows into an MUI X `DataGrid`. Columns cover `run_id`, `input_dir`, `output_dir`, an `in_place` chip, a `status` chip, and `started_at`. The grid uses `getRowId` keyed on `run_id`, compact density, and row-selection disabled. Errors surface in an `Alert`.

This is a read-only sidebar destination — it reflects the persisted manifest written at commit time ([[Routing and Commit Flow]]) and does not start or resume runs.

## Depends on

- [[API Client]] — `listRuns`
- [[Routing and Commit Flow]] — manifest is written at commit

## Used by

- [[App Entry and Router]] — rendered when `view === "history"`

## See also

- [[_index]]
- [[Per-Run Pipeline]]
