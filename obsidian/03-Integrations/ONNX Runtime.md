---
tags: [integration]
---

# ONNX Runtime

> The inference backend that `dghs-imgutils` runs its ONNX models on; bundled wholesale into the one-file PyInstaller sidecar so the packaged app needs no separate ML install.

## Used for

- [[dghs-imgutils Integration]] — executes the CCIP / tagger / gate / rating ONNX graphs
- [[Sidecar Packaging]] — its native DLLs are collected into the bundled exe

## Configuration

- Extra / dependency: installed with `uv sync --extra ml` (`onnxruntime>=1.19`); swap for `onnxruntime-gpu` via `--extra ml-gpu`
- Optional at build time — the spec collects whatever is installed

## Wire-up

- `product/sidecar.spec` — `collect_all("onnxruntime")` pulls native DLLs into the build
- `backend/app/engine/models.py` — reached indirectly via imgutils

## Auth mode

N/A

## Gotchas

- `onnxruntime.quantization` needs `onnx` (unused at inference) — both are excluded in the spec.
- If a one-file build drops a DLL on a target machine, switch to a one-dir build shipped via Tauri `bundle.resources`.

## See also

- [[_index]]
- [[dghs-imgutils Integration]]
- [[Sidecar Packaging]]
