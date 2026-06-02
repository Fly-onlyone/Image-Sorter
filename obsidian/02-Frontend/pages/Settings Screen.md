---
tags: [frontend, pages]
---

# Settings Screen

> Persistent settings surface for thresholds, GPU, reduced motion, and Sentry crash-report opt-in.

## Source

- `frontend/src/pages/Settings.tsx` (`SettingsScreen`) — primary implementation

## How it works

`SettingsScreen` hydrates from `api.getSettings` ([[API Client]]) on mount. It's a centered [[Page Container]] (`maxWidth={780}`) of `SettingsSection` cards, each in a staggered `ScrollReveal` — **Detection** (sliders for dedup distance, explicit/nude threshold, gate illustration min, character-hint confidence), **Engine & UX** (the three switches), and **Appearance** (a pointer to the AppBar [[Theme Picker]], replacing the old info banner) — each control a shared `SettingRow`. Slider commits and switch toggles call `persist` → `api.patchSettings`, which layers the change onto the backend `settings` table; the themed [[Toast]] confirms "Saved".

Three switches cover GPU (`onnxruntime-gpu`), reduced motion, and Sentry opt-in. Reduced motion is the exception — it's stored in `localStorage` under `image-sorter.reducedMotion` (read by [[usePrefersReducedMotion]], part of the [[Reduced-Motion Gating Pattern]]) and fires `REDUCED_MOTION_EVENT` rather than hitting the backend, but it now **also toasts "Saved"** for parity with the other switches. Toggling it no longer flickers the screen: [[Silk Ribbons]] reads `reduced` through a ref (so it freezes in place instead of re-initializing) and `PageBar` keeps one persistent wrapper (no remount). Theme selection lives in the AppBar [[Theme Picker]], not here.

## Depends on

- [[API Client]] — `getSettings`, `patchSettings`
- [[usePrefersReducedMotion]] — consumes the reduced-motion localStorage flag
- [[Reduced-Motion Gating Pattern]]

## Used by

- [[App Entry and Router]] — rendered when `view === "settings"`

## See also

- [[_index]]
- [[Theme Picker]]
