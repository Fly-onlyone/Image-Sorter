// Color helpers — all design idioms derive from the active palette so they work
// across all 11 themes (theme-agnostic).

/** "#7aa2f7" → "122, 162, 247" (handles #rgb, #rrggbb and #rrggbbaa). */
export function hexToRgb(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Translucent fill from a role hex: withAlpha("#16181d", 0.6) → "rgba(22,24,29,0.6)". */
export function withAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)}, ${alpha})`;
}

export function gradientAccent(primary: string, secondary: string): string {
  return `linear-gradient(90deg, ${primary}, ${secondary})`;
}
