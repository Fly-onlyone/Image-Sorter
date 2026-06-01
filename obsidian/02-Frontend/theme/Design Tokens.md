---
tags: [frontend, theme]
---

# Design Tokens

> Shared structural defaults — `DEFAULT_GLASS`, `DEFAULT_SPRING`, `DEFAULT_ANIM` — that every preset reuses so only colors differ between themes.

## Source

- `frontend/src/theme/tokens.ts` — primary implementation

## How it works

`DEFAULT_GLASS` sets `borderRadius` plus card/sidebar blur and opacity; `cardOpacity` is kept toward opaque (0.6) so thumbnails behind glass stay readable. `DEFAULT_SPRING` defines `snappy`/`bouncy`/`gentle` framer-motion spring configs (stiffness + damping). `DEFAULT_ANIM` defines `fast`/`normal`/`slow` durations and two named easings (`easeOutExpo`, `easeInOutBack`).

All 11 presets share these instances via [[Theme Presets]]'s `preset()` helper, so themes diverge only in `colors` and the derived `gradientAccent`. The tokens surface on `theme.app` through [[Theme Factory]].

## Depends on

- [[Theme Types]] — the token interface shapes

## Used by

- [[Theme Presets]] — every preset embeds these defaults
- [[Theme Factory]] — exposes them on the `theme.app` bag

## See also

- [[_index]]
- [[Reduced-Motion Gating Pattern]]
