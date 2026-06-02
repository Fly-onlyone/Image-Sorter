---
tags: [frontend, components]
---

# Page Container

> The shared page wrapper every screen uses instead of a hardcoded `maxWidth` box, plus `PageBar` — the sticky **collapsing large title** (icon chip + large title with subtitle below it, closed by a gradient hairline) that shrinks into a slim rail on scroll, replacing the old gradient-text hero header.

## Source

- `frontend/src/components/PageContainer.tsx` (`PageContainer`, `PageBar`) — primary implementation
- `frontend/src/components/{SettingRow,SettingsSection,CardRadioGroup,nav}.tsx` — the row / titled-card / selectable-card primitives + the per-view icon & flow map `PageBar` and [[App Shell]] share

## How it works

`PageContainer` is a `width: 100%` box: **fluid** (no cap — fills the main area) by default and with `"fluid"`; pass a **number** for a fixed cap that also centers the column via `mx:auto` (Settings + New Run use `780`). With `fill`, it becomes a flex column (`flexGrow: 1`) so a `flexGrow` child stretches to the bottom — used by History (DataGrid), Review and Gallery lists. This replaced the per-page `maxWidth` boxes that left dead space on wide windows.

`PageBar` is a **sticky** rail (`top` = AppBar height, `zIndex` just below it) rendered flat: a 28px icon chip (from `nav.tsx`'s `VIEW_ICONS`, keyed on the active `view`), a **collapsing large title**, the subtitle below it (hidden on narrow windows), and a right-aligned `actions` slot — closed by a 1px `theme.app.gradientAccent` hairline (the surviving gradient identity; the old animated `h3` + 72px underline are gone). It's a **flat opaque band** (`background.default`, **no `backdrop-filter`** — a blur there formed a compositing layer that hid the fixed [[Toast]] in the WebView). As the window scrolls, `useScroll`/`useTransform` shrink the title (`~1.9rem → 1.2rem`) and collapse the subtitle (height + opacity → 0) over a `COLLAPSE_PX` (120px) threshold, docking the big title into a slim rail — so the title reads as page identity, not a sidebar echo. On run-flow views it also renders the `Stepper` (`FLOW` / `FLOW_LABELS` from `nav.tsx`) at constant size, so title + stepper read as one sticky unit. Scroll hooks run unconditionally; under [[usePrefersReducedMotion]] the motion values are ignored — reduced shows the **large at-rest title statically** (no scroll collapse), matching the non-reduced top-of-page state so toggling reduce-motion never jumps the title size — and the mount reveal is a no-op, and the wrapper is **never swapped for a plain `Box`** (that remount on toggle was a flicker source).

`SettingRow` (label/helper + an inline control or a full-width stacked one), `SettingsSection` (titled glass card + divider-separated rows), and `CardRadioGroup` (selectable-card picker) are the row-level primitives [[Settings Screen]] and [[Setup Screen]] compose — **never `height:"100%"` on a section card** (that stretch, matching a tall neighbour, was the old empty-layout bug).

## Depends on

- [[Theme Factory]] — `theme.app.gradientAccent`
- [[usePrefersReducedMotion]] — gates the header animation

## Used by

- All 7 screens — [[Setup Screen]], [[Progress Screen]], [[Review Screen]], [[Commit Screen]], [[Gallery Screen]], [[History Screen]], [[Settings Screen]]
- Composed inside [[App Shell]]'s flex-column main, under [[Page Transition]]

## See also

- [[_index]]
- [[App Shell]]
