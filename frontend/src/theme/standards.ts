// Theme normalization standards — the single tunable knobs every preset is leveled
// to before it becomes a theme. See normalize.ts for how they're applied.

/** Target HSL lightness (0–1) every theme's `bg` is re-leveled to. The single knob for
 *  overall darkness — raise for a lighter page, lower for inkier. */
export const STANDARD_BG_LIGHTNESS = 0.18;

/** WCAG contrast floor for primary text against the lightest surface. */
export const TEXT_CONTRAST_PRIMARY = 7;

/** WCAG contrast floor for secondary / muted text. */
export const TEXT_CONTRAST_SECONDARY = 4.5;

/** Cap on text lightness while chasing the contrast floor (avoid pure white). */
export const TEXT_LIGHTNESS_CAP = 0.98;
