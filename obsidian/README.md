# Image Sorter — Knowledge Vault

This folder is an **Obsidian vault**: a graph-linked set of atomic markdown notes that
document the Image Sorter codebase (the facts the code doesn't show — cross-feature side
effects, flows, gotchas, version pins).

## Open it

- **In Obsidian:** *Open folder as vault* → select this `obsidian/` folder. Start at
  [[_HOME]].
- **As plain markdown:** browse the numbered zone folders directly — every folder has an
  `_index.md` Map of Content, and notes cross-link with `[[wikilinks]]`.

## Layout

| Zone | Contents |
|------|----------|
| `00-Architecture/` | Cross-cutting flows (pipeline, port handshake, SSE, identity) — **start here** |
| `01-Backend/` | Python FastAPI sidecar — `app/` modules + per-phase `engine/` |
| `02-Frontend/` | React/MUI WebView + Tauri Rust shell |
| `03-Integrations/` | External systems (dghs-imgutils, ONNX, reverse-image lookup, Sentry) |
| `04-Patterns/` | Non-obvious conventions (ML facade, engine-per-phase, theme factory) |
| `05-Operations/` | Dev / build / packaging / release workflows |
| `06-Glossary/` | Domain terms (CCIP, facet, residual, prototype) |

`_Templates/` holds the note shapes; `.obsidian/` holds shared vault config (tracked in
git — per-user `workspace.json` is gitignored).

## Smoke test (Obsidian 1.12+ CLI, optional)

```powershell
$cli = "C:\Users\$env:USERNAME\AppData\Local\Programs\Obsidian\Obsidian.com"
& $cli files total
```
