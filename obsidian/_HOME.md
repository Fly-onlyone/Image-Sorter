---
tags: [moc, home]
---

# Image Sorter — Knowledge Vault

A graph-linked tour of the Image Sorter codebase. **Start with the architecture flows**
to build mental scaffolding, then drill into modules or patterns as needed.

> **Image Sorter** is a Windows desktop app that sorts anime/gacha images by subject. A
> Tauri v2 Rust shell hosts a React/MUI WebView that talks over localhost HTTP+SSE to a
> Python FastAPI sidecar running an offline ONNX vision/ML engine. State lives in SQLite;
> everything is keyed by each image's SHA-256 content hash.

## 🧭 Start here — Architecture flows

- [[Two-Process Architecture]] — Rust shell ⇄ FastAPI sidecar over localhost
- [[Per-Run Pipeline]] — scan → dedup → gate → tag → identify → cluster → preview → commit
- [[Identity Resolution Flow]] — detect-crop → CCIP gallery → tagger hint → residual → cluster
- [[Dynamic Port Handshake]] — OS-assigned free port → `SIDECAR_PORT=` → `sidecar_url`
- [[SSE Progress Flow]] — worker-thread `publish` → serving loop → one `EventSource`
- [[Content-Hash Idempotency]] — SHA-256 keying for cross-run cache + in-place safety
- [[Routing and Commit Flow]] — dest-path builder, copy/move, Recycle Bin at commit

## 🐍 Backend
- [[01-Backend/_index|Backend overview]] — the FastAPI sidecar
- [[01-Backend/app/_index|app/ modules]] — server, jobs, events, db, config, schemas
- [[01-Backend/engine/_index|engine/ phases]] — one module per pipeline phase + ML facade

## ⚛️ Frontend
- [[02-Frontend/_index|Frontend overview]] — React WebView + Tauri shell
- [[02-Frontend/pages/_index|pages]] — the 7 screens (Setup → Progress → Review → Commit, + Gallery/History/Settings)
- [[02-Frontend/components/_index|components]] — App Shell + effects (SilkRibbons)
- [[02-Frontend/theme/_index|theme]] — 11-preset factory → MUI theme + token bag
- [[02-Frontend/api/_index|api]] · [[02-Frontend/store/_index|store]] · [[02-Frontend/tauri/_index|tauri shell]]

## 🔌 External Integrations
→ [[03-Integrations/_index|All integrations]] — dghs-imgutils, ONNX, reverse-image lookup, Sentry

## 🧩 Patterns
→ [[04-Patterns/_index|All patterns]] — ML facade, engine-per-phase, hand-rolled SQLite repo, theme factory

## 🛠️ Operations
→ [[05-Operations/_index|All operations]] — dev / build / packaging / release

## 📖 Glossary
→ [[06-Glossary/_index|Glossary]] — CCIP, facet, residual, prototype

## 🎯 Reading paths

**New contributor:** [[Two-Process Architecture]] → [[Per-Run Pipeline]] → [[Engine-Per-Phase Pattern]] → [[01-Backend/engine/_index|engine/]]

**Backend developer:** [[Per-Run Pipeline]] → [[ML Facade]] → [[ML Facade Pattern]] → [[SQLite Repository]] → [[Content-Hash Keying Pattern]]

**Frontend developer:** [[App Entry and Router]] → [[App State Context]] → [[API Client]] → [[Theme Factory Pattern]] → [[02-Frontend/components/_index|components]]

**DevOps / packaging:** [[Dynamic Port Handshake]] → [[Sidecar Packaging]] → [[Tauri Build]] → [[Release Please]]
