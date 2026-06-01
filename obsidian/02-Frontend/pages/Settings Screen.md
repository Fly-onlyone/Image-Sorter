---
tags: [frontend, pages]
---

# Settings Screen

> Persistent settings surface for thresholds, GPU, reduced motion, and Sentry crash-report opt-in.

## Source

- `frontend/src/pages/Settings.tsx` (`SettingsScreen`) — primary implementation

## How it works

`SettingsScreen` hydrates from `api.getSettings` ([[API Client]]) on mount, then exposes sliders for dedup distance, explicit (nude) threshold, gate illustration min, and character-hint confidence. Slider commits and switch toggles call `persist` → `api.patchSettings`, which layers the change onto the backend `settings` table; a `Snackbar` confirms "Saved".

Three switches cover GPU (`onnxruntime-gpu`), reduced motion, and Sentry opt-in. Reduced motion is the exception — it is stored in `localStorage` under `image-sorter.reducedMotion` (read by [[usePrefersReducedMotion]], part of the [[Reduced-Motion Gating Pattern]]) rather than sent to the backend. Theme selection lives in the AppBar [[Theme Picker]], not here.

## Depends on

- [[API Client]] — `getSettings`, `patchSettings`
- [[usePrefersReducedMotion]] — consumes the reduced-motion localStorage flag
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[App Entry and Router]] — rendered when `view === "settings"`

## See also

- [[_index]]
- [[Theme Picker]]
