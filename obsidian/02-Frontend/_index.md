---
tags: [moc, frontend]
---

# Frontend — Map of Content

> React 18 + Vite 7 + MUI v9 WebView (`frontend/src/`) hosted by a thin Tauri v2 Rust
> shell (`frontend/src-tauri/`). React Context for state (no Redux); one `EventSource`
> per run for progress. The grid stays flat neutral while chrome carries glass + glow.

## Entry & state
→ [[App Entry and Router]] — `main.tsx` pre-resolves the sidecar URL, `App.tsx` switches on view
→ [[02-Frontend/store/_index|store]] · [[02-Frontend/api/_index|api]] · [[02-Frontend/hooks/_index|hooks]] · [[02-Frontend/utils/_index|utils]]

## Screens
→ [[02-Frontend/pages/_index|pages]] — Setup → Progress → Review → Commit, plus Gallery / History / Settings

## Chrome & effects
→ [[02-Frontend/components/_index|components]] — App Shell + SilkRibbons and polish helpers

## Theme system
→ [[02-Frontend/theme/_index|theme]] — 11-preset factory → MUI theme + `theme.app` token bag

## Native shell
→ [[02-Frontend/tauri/_index|tauri]] — sidecar lifecycle (`lib.rs`) + window/CSP config

## See also

- [[_HOME]]
- [[Two-Process Architecture]] · [[Dynamic Port Handshake]] · [[Theme Factory Pattern]]
