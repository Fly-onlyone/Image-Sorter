---
tags: [frontend, components]
---

# Animated Gradient Border

> An emphasis wrapper that frames its child in a continuously flowing gradient border.

## Source

- `frontend/src/components/effects/AnimatedGradientBorder.tsx` (`AnimatedGradientBorder`) — primary implementation

## How it works

`AnimatedGradientBorder` renders an outer `Box` padded by 1px whose background is `theme.app.gradientAccent` ([[Theme Context]]) at `200%` width, animated by the `gradientFlow` keyframes over six seconds. An inner `Box` with `background.paper` fills the interior, so only a thin flowing gradient ring shows. The corner radius derives from `theme.app.glass.borderRadius` (overridable via the `radius` prop), keeping it consistent with the glass chrome.

Ported from the TradingAgent app; it is a presentational frame with no motion library and no reduced-motion gate of its own.

## Depends on

- [[Theme Context]] — `theme.app.gradientAccent`, `glass.borderRadius`
- [[Theme Factory]] — produces the `theme.app` token bag

## See also

- [[_index]]
- [[Magnetic Button]]
- [[Theme Factory Pattern]]
