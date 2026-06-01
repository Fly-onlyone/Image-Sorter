---
tags: [moc, frontend]
---

# Frontend `components/` — Map of Content

> Shared chrome + the signature animated polish. Glass + glow apply to chrome only; the
> thumbnail grid stays flat neutral. All effects gate on [[usePrefersReducedMotion]].

## Chrome

- [[App Entry and Router]] — `main.tsx` boot + `App.tsx` provider stack + view router
- [[App Shell]] — AppBar + Drawer nav + stepper + SilkRibbons frame (`AppShell.tsx`)
- [[Theme Picker]] — menu listing the 11 presets with swatches (`ThemePicker.tsx`)

## Effects (`effects/`)

- [[Silk Ribbons]] — signature canvas ribbon background, intensity-dialled per screen (`SilkRibbons.tsx`)
- [[Magnetic Button]] — cursor-following spring wrapper for primary actions (`MagneticButton.tsx`)
- [[Animated Gradient Border]] — flowing gradient emphasis card (`AnimatedGradientBorder.tsx`)
- [[Scroll Reveal]] — fade+slide on scroll-in (`ScrollReveal.tsx`)

## See also

- [[_HOME]] · [[02-Frontend/_index|Frontend overview]]
- [[02-Frontend/theme/_index|theme]] · [[Reduced-Motion Gating Pattern]]
