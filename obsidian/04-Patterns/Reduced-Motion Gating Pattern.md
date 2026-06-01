---
tags: [pattern]
---

# Reduced-Motion Gating Pattern

> Every animation reads the reduced-motion gate and freezes or skips when it is set.

## When to apply

Adding any animation, transition, or animated background (framer-motion springs, [[Silk Ribbons]], thumbnail effects).

## The pattern

```typescript
const reduce = usePrefersReducedMotion();  // system media query OR localStorage override
<motion.div
  animate={reduce ? undefined : { opacity: 1 }}
  transition={reduce ? { duration: 0 } : spring}
/>
```

[[usePrefersReducedMotion]] resolves the OS `prefers-reduced-motion` media query, overridable by a localStorage setting.

## Why

Accessibility: motion-sensitive users must be able to stop animation, and the localStorage override lets the in-app toggle win over the system setting. Ungated animations are a vestibular hazard and break the accessibility contract.

## Don't

- Don't ship an animation that ignores the gate — every one must check it.
- Don't read the media query directly — use the hook so the localStorage override applies.

## See also

- [[_index]]
- [[usePrefersReducedMotion]]
- [[Silk Ribbons]]
- [[Theme Factory Pattern]]
