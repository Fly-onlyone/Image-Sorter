---
tags: [frontend, components]
---

# App Entry and Router

> The boot sequence (`main.tsx`) and provider/view router (`App.tsx`) — pre-resolves the sidecar URL, then switches the active screen on `view`.

## Source

- `frontend/src/main.tsx` — boot entry
- `frontend/src/App.tsx` (`App`, `Router`) — provider stack + view switch

## How it works

`main.tsx` loads fonts, then calls `api.ready()` ([[API Client]], [[Dynamic Port Handshake]]) and only after it settles does it `createRoot(...).render(<App />)`. Resolving the sidecar base URL before first paint means thumbnail `<img>` URLs are ready synchronously.

`App` wraps everything in `AppThemeProvider` ([[Theme Context]]) → `AppStateProvider` ([[App State Context]]) → [[App Shell]]. The inner `Router` reads `view` from [[App State Context]] and switches: `setup`/`progress`/`review`/`commit` form the linear run stepper, while `gallery`/`history`/`settings` are standalone sidebar destinations.

## Depends on

- [[API Client]] — `api.ready()` pre-resolve
- [[Dynamic Port Handshake]] — what `ready()` resolves
- [[App State Context]] — supplies `view`
- [[Theme Context]] — outermost provider
- [[App Shell]] — chrome wrapper
- [[Setup Screen]], [[Progress Screen]], [[Review Screen]], [[Commit Screen]], [[Gallery Screen]], [[History Screen]], [[Settings Screen]]

## See also

- [[_index]]
- [[Two-Process Architecture]]
