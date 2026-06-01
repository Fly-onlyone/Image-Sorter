---
tags: [pattern]
---

# Theme Factory Pattern

> A typed `ThemePreset` runs through `buildTheme()` to produce an MUI theme plus an `theme.app` token bag; map app states onto palette slots, never hex.

## When to apply

Adding a theme, a themed component, or any color/animation decision in the frontend.

## The pattern

```typescript
const theme = buildTheme(preset);   // [[Theme Factory]] + [[Palette Builder]]
// app states → MUI palette slots:
//   nude → error, review → warning, identified → success
<Chip color="error" />              // derives from active palette
```

Components and framer-motion read `theme.app` tokens (glass, shadows, spring, animations).

## Why

Mapping states to MUI slots means all 11 [[Theme Presets]] "just work" without per-theme code. Deriving from the active palette instead of hardcoding hex is what makes a new preset propagate everywhere automatically.

## Don't

- Don't hardcode hex in components — derive from the active palette so every theme works.
- Don't invent a new state color — reuse the slot mapping (error/warning/success).

## See also

- [[_index]]
- [[Theme Factory]]
- [[Theme Presets]]
- [[Palette Builder]]
