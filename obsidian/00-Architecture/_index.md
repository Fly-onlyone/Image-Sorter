---
tags: [moc, architecture]
---

# Architecture — Map of Content

> The cross-cutting flows that every module note references. Read these first to build
> the mental model; modules and patterns hang off them.

## Process & transport

- [[Two-Process Architecture]] — Tauri Rust shell hosts the WebView; spawns + owns the FastAPI sidecar over localhost HTTP+SSE
- [[Dynamic Port Handshake]] — sidecar binds an OS-assigned free port and prints `SIDECAR_PORT=`; the shell parses + serves it via `sidecar_url`
- [[SSE Progress Flow]] — worker threads `publish()` events that hop onto the serving loop and stream to one `EventSource`

## The pipeline

- [[Per-Run Pipeline]] — scan → dedup → gate → tag → identify → cluster → preview → commit
- [[Identity Resolution Flow]] — detect-crop → CCIP gallery match → tagger hint → residual → cluster
- [[Content-Hash Idempotency]] — SHA-256 content hash keys every row (cross-run cache + in-place safety)
- [[Routing and Commit Flow]] — read-only preview tree, then copy/move + Recycle Bin at commit

## See also

- [[_HOME]]
- [[01-Backend/_index|Backend]] · [[02-Frontend/_index|Frontend]] · [[04-Patterns/_index|Patterns]]
