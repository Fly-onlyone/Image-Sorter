// Glow shadows — elevation is glow, not grey shadow, all derived
// from the active palette's primary rgb so they re-tint per theme.

import { hexToRgb } from "./utils";

export interface GlowShadows {
  cardHover: string;
  cardActive: string;
  primary: string;
  primaryIntense: string;
}

export function buildGlowShadows(primaryHex: string): GlowShadows {
  const p = hexToRgb(primaryHex);
  return {
    cardHover: `0 20px 40px rgba(0,0,0,.35), 0 0 20px rgba(${p},.25)`,
    cardActive: `0 0 24px rgba(${p},.3), 0 12px 40px rgba(0,0,0,.3)`,
    primary: `0 0 20px rgba(${p},.4)`,
    primaryIntense: `0 0 30px rgba(${p},.6), 0 0 60px rgba(${p},.3)`,
  };
}
