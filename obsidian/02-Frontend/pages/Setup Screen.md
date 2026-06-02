---
tags: [frontend, pages]
---

# Setup Screen

> The "New Run" form — a centered sheet where you pick source/output folders and a folder layout up front, tune dedup/nude/engine in always-visible sections (each change persists + toasts), then launch `/scan` from an inline footer that recaps the run.

## Source

- `frontend/src/pages/Setup.tsx` (`SetupScreen`) — primary implementation

## How it works

`SetupScreen` is the first step of the run stepper. It collects local state for the chosen layout (`character` / `artist` / combined `Facet` arrays), input/output dirs, recursion, dedup distance, strict-nude and explicit thresholds, GPU, and an optional SauceNAO key. The inner `FolderField` opens a native folder picker via [[Platform Utilities]]'s `pickDirectory`.

The settings-backed controls (dedup, nude, GPU, SauceNAO key) **persist + toast on change** — a local `persist()` helper calls `api.patchSettings` and the [[Toast]] confirms "Saved", mirroring the [[Settings Screen]] (sliders on `onChangeCommitted`, switches on change, the key on blur). `start()` still re-sends the same keys through `api.patchSettings` as a pre-flight safety net, then calls `api.scan` ([[API Client]]). On success it writes the run into [[App State Context]] via `setRun` and flips `view` to `progress`, advancing the stepper. When output equals input the screen flags an in-place MOVE warning ([[Routing and Commit Flow]]).

Layout: a centered [[Page Container]] (`maxWidth={780}`) of `SettingsSection` cards, each in a staggered `ScrollReveal` — **Source & Output** and a `CardRadioGroup` folder-layout picker (with `char/ ▸ artist/` path previews) up top, then **Deduplication / Nude policy / Engine** (+ the optional SauceNAO key, shown only for artist layouts) **always visible** (the old Advanced `Collapse` disclosure is gone), and an inline footer pairing a live "Ready to sort" recap with the Start-run [[Magnetic Button]]. Each control is a shared `SettingRow`; no card uses `height:"100%"`.

## Depends on

- [[API Client]] — `scan`, `patchSettings`
- [[App State Context]] — `setRun`, `setView`
- [[Platform Utilities]] — native folder picker
- [[Magnetic Button]] — the "Start run" action
- [[Facet]] — layout is a list of facets

## Used by

- [[App Entry and Router]] — rendered when `view === "setup"`

## Gotchas

- MUI v9 `Stack` dropped `alignItems`/`justifyContent` props — they are passed via `sx`.

## See also

- [[_index]]
- [[Per-Run Pipeline]]
- [[Progress Screen]]
