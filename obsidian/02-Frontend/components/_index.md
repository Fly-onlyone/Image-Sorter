---
tags: [moc, frontend]
---

# Frontend `components/` — Map of Content

> Shared chrome + the signature animated polish. Glass + glow apply to chrome only; the
> thumbnail grid stays flat neutral. All effects gate on [[usePrefersReducedMotion]].

## Chrome

- [[App Entry and Router]] — `main.tsx` boot + `App.tsx` provider stack + view router
- [[App Shell]] — AppBar + Drawer nav + SilkRibbons frame (the run stepper now lives in `PageBar`) (`AppShell.tsx`)
- [[Theme Picker]] — menu listing the 11 presets with swatches (`ThemePicker.tsx`)

## Shared primitives

- [[Page Container]] — fluid/centered page wrapper + the slim sticky `PageBar` title rail (`PageContainer.tsx`)
- `SettingRow` / `SettingsSection` / `CardRadioGroup` — row, titled-card, and selectable-card primitives composing [[Settings Screen]] + [[Setup Screen]] (`SettingRow.tsx`, `SettingsSection.tsx`, `CardRadioGroup.tsx`)
- `nav.tsx` — per-view `VIEW_ICONS` + the `FLOW` definition shared by [[App Shell]] and `PageBar`
- [[Page Transition]] — framer-motion (opacity-only) view transition, driven by [[App Shell]] (`PageTransition.tsx`)
- [[Stat Tile]] — glass stat tile with spring count-up (`StatTile.tsx`)
- [[Toast]] — themed app-wide snackbar; `ToastProvider` + `useToast()` (`Toast.tsx`, `hooks/useToast.ts`)

## Effects (`effects/`)

- [[Silk Ribbons]] — signature canvas ribbon background, full intensity on every screen (`SilkRibbons.tsx`)
- [[Magnetic Button]] — cursor-following spring wrapper for primary actions (`MagneticButton.tsx`)
- [[Animated Gradient Border]] — flowing gradient emphasis frame, on the live Progress panel (`AnimatedGradientBorder.tsx`)
- [[Scroll Reveal]] — fade+slide on scroll-in, staggered across card lists (`ScrollReveal.tsx`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[02-Frontend/theme/_index|theme]] · [[Reduced-Motion Gating Pattern]]
