---
tags: [frontend, theme]
---

# Color Normalization

> `normalizeColors(colors)` levels every preset to two shared standards — one background
> darkness and a text-contrast floor — before it becomes a theme, so all 11 themes feel
> consistent while keeping their own hue/identity.

## Source

- `frontend/src/theme/normalize.ts` — `normalizeColors` + private `meetContrast`
- `frontend/src/theme/standards.ts` — the tunable knobs

## Why

Presets were authored independently, so `bg` lightness ranged ~6% (Studio/Night Owl) to ~22%
(Nord) — switching themes visibly changed how dark the page felt. And some presets (notably
Solarized, `textPrimary #839496` on `bg #002b36` ≈ 3.7:1) had text that failed WCAG contrast.
Rather than hand-editing 11 palettes, the factory enforces both as central standards.

## How it works

Called once at the top of [[Theme Factory]] `buildTheme`; the result feeds [[Palette Builder]],
the `theme.app` bag, and [[Component Overrides]], so every downstream surface (body gradient,
glass, inputs, [[Silk Ribbons]]) uses the normalized colors.

1. **Darkness** — anchor `bg` to `STANDARD_BG_LIGHTNESS` (the HSL-lightness target and single
   tunable darkness knob in `standards.ts`);
   shift `surface`/`elevated` lightness by the **same signed delta** (clamped 0–1) so each
   theme keeps its internal elevation relationships — including the two themes whose surface
   is intentionally darker than bg (Tokyo Night, One Dark Pro). Hue + saturation untouched.
2. **Text-contrast floor** — measure against the lightest of `{bg, surface, elevated}` (worst
   case for light text); raise each text color's HSL lightness (preserving hue/sat) via binary
   search to the lowest value meeting its floor — `TEXT_CONTRAST_PRIMARY` (7:1) /
   `TEXT_CONTRAST_SECONDARY` (4.5:1), capped at `TEXT_LIGHTNESS_CAP` (0.98). No-op if it already
   passes (most themes' near-white text does).

Accent roles (`primary`/`secondary`/`success`/`warning`/`error`/`info`) and `border` pass
through **unchanged**, so each theme's personality — glows, ribbons, buttons, swatches — is
preserved. The [[Theme Picker]] swatches read accents only, so they always match the rendered theme.

## Depends on

- [[Color Utilities]] — `hexToHsl`/`hslToHex`/`relativeLuminance`/`contrastRatio`
- [[Theme Types]] — the `ColorRoles` in/out

## Used by

- [[Theme Factory]] — calls `normalizeColors(preset.colors)` once before assembling the theme

## Gotchas

- **HSL lightness ≠ perceived brightness** — equal HSL L leaves slightly different relative
  luminance by hue. Accepted as the predictable knob; swap the anchor metric (relative
  luminance / OKLCH L) here + in `standards.ts` if ever needed.
- **Accent-driven glow brightness still varies** (accent glows + ribbons scale with accent
  saturation). Intentional; out of scope for this standard.
- Tune the whole look from one constant: `STANDARD_BG_LIGHTNESS` in `standards.ts`.

## See also

- [[_index]]
- [[Theme Factory]] · [[Palette Builder]]
