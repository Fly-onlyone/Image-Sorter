---
tags: [frontend, utils]
---

# Platform Utilities

> Thin wrappers over Tauri native plugins with web-dev fallbacks so the UI runs both inside the desktop shell and in a plain browser.

## Source

- `frontend/src/utils/platform.ts` — primary implementation

## How it works

`isTauri()` detects the shell by checking for `window.__TAURI_INTERNALS__`. `pickDirectory(title)` opens the Tauri native folder dialog (`@tauri-apps/plugin-dialog`) when inside the shell, returning the chosen path or `null`; in a plain browser it falls back to `window.prompt`. `openPath(path)` reveals a folder in the OS file explorer via `@tauri-apps/plugin-shell`, falling back to a `window.alert` in the browser.

Each Tauri plugin is dynamically imported only on the native path, so the bundle stays loadable under `vite dev` where those globals are absent.

## Depends on

- [[Tauri Shell]] — registers the `dialog` and `shell` plugins these wrappers call

## Used by

- [[Setup Screen]] — folder pickers for input/output
- [[App Shell]] — open-output-folder action

## See also

- [[02-Frontend/utils/_index|utils]]
- [[Frontend Dev Workflow]]
