---
tags: [backend, app]
---

# API Schemas

> Pydantic request/response models that validate the [[FastAPI Server]] endpoints' payloads.

## Source

- `backend/app/schemas.py` — primary implementation

## How it works

Defines the typed envelopes for each endpoint: `ScanRequest`/`ScanResponse` (scan + result), `DedupRequest`, `GateRequest`, `TagRequest`, `IdentifyRequest`, `ClusterRequest`, `EnrollRequest`, `NameClusterRequest`, `CommitRequest`, `MediaReassignRequest`, and `SettingsPatch`. A shared `Facet = Literal["character","artist"]` and `Layout = list[Facet]` type the run layout.

Notable defaults encode behavior: `ScanRequest.output_dir=None` means in-place (defaults to `input_dir`); `DedupRequest.dup_distance=None` falls back to the [[Settings Config]] default; `CommitRequest.mode="auto"` moves when in-place else copies; `SettingsPatch.values` is a loose `dict` of any persisted knob subset. Naming follows the repo `Request`/`Response` suffix convention.

## Depends on

- (pydantic only)

## Used by

- [[FastAPI Server]] — every endpoint signature

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Routing and Commit Flow]]
