// Theme normalization — two standards applied to every preset's colors before it
// becomes a theme, so all 11 themes share one background darkness and readable text
// while keeping their own hue/identity. Accent + border roles pass through untouched.

import {
  STANDARD_BG_LIGHTNESS,
  TEXT_CONTRAST_PRIMARY,
  TEXT_CONTRAST_SECONDARY,
  TEXT_LIGHTNESS_CAP,
} from "./standards";
import type { ColorRoles } from "./types";
import { contrastRatio, hexToHsl, hslToHex, relativeLuminance } from "./utils";

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

// Raise text lightness (preserving hue/sat) to the lowest value that meets `target`
// contrast against `bg`. No-op if it already passes; best-effort at the cap otherwise.
function meetContrast(textHex: string, bg: string, target: number): string {
  if (contrastRatio(textHex, bg) >= target) return textHex;
  const { h, s, l } = hexToHsl(textHex);
  const atCap = hslToHex({ h, s, l: TEXT_LIGHTNESS_CAP });
  if (contrastRatio(atCap, bg) < target) return atCap;
  let lo = l;
  let hi = TEXT_LIGHTNESS_CAP;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(hslToHex({ h, s, l: mid }), bg) >= target) hi = mid;
    else lo = mid;
  }
  return hslToHex({ h, s, l: hi });
}

// Standardize background darkness (anchor `bg`, shift `surface`/`elevated` by the same
// lightness delta so each theme keeps its elevation relationships) and enforce a text
// contrast floor against the lightest surface (the worst case for light text).
export function normalizeColors(colors: ColorRoles): ColorRoles {
  const bgHsl = hexToHsl(colors.bg);
  const delta = STANDARD_BG_LIGHTNESS - bgHsl.l;
  const bg = hslToHex({ ...bgHsl, l: STANDARD_BG_LIGHTNESS });
  const sHsl = hexToHsl(colors.surface);
  const surface = hslToHex({ ...sHsl, l: clamp01(sHsl.l + delta) });
  const eHsl = hexToHsl(colors.elevated);
  const elevated = hslToHex({ ...eHsl, l: clamp01(eHsl.l + delta) });

  const ref = [bg, surface, elevated].reduce((a, b) =>
    relativeLuminance(b) > relativeLuminance(a) ? b : a,
  );
  const textPrimary = meetContrast(colors.textPrimary, ref, TEXT_CONTRAST_PRIMARY);
  const textSecondary = meetContrast(colors.textSecondary, ref, TEXT_CONTRAST_SECONDARY);

  return { ...colors, bg, surface, elevated, textPrimary, textSecondary };
}
