---
tags: [frontend, components]
---

# Toast

> The app-wide themed snackbar — a bottom-right filled `Alert` that replaced the old unstyled bottom-left `SnackbarContent` box.

## Source

- `frontend/src/components/Toast.tsx` (`ToastProvider`) — provider + visual outlet
- `frontend/src/hooks/useToast.ts` (`useToast`, `ToastContext`) — context + hook

## How it works

`ToastProvider` (mounted once in `App.tsx`, inside the theme provider) holds `{open, message, severity}` and exposes `toast(message, severity?)` via context. The outlet is a MUI `Snackbar` anchored bottom-right containing a `variant="filled"` `Alert` — so its colour comes from the palette `success`/`error`/`info` slot (no hardcoded hex) and it auto-dismisses (~2.2s). Screens call `useToast()` and fire `toast(...)` on save success / failure.

This replaced [[Settings Screen]]'s bare `<Snackbar message="Saved">`, whose default light `SnackbarContent` rendered as an unstyled box bottom-left on the dark theme.

## Depends on

- [[Theme Factory]] — palette severity colours

## Used by

- [[Settings Screen]] — save success/failure
- [[Review Screen]], [[Gallery Screen]] — action errors

## See also

- [[_index]]
