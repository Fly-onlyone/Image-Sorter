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

/** Blend two role hexes: mix("#4c566a", "#d8dee9", 0.45) moves 45% from a → b. */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a).split(", ").map(Number);
  const [br, bg, bb] = hexToRgb(b).split(", ").map(Number);
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`;
}

export function gradientAccent(primary: string, secondary: string): string {
  return `linear-gradient(90deg, ${primary}, ${secondary})`;
}

export interface Hsl {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

/** "#268bd2" → { h, s, l }. Lightness is the normalization knob (see normalize.ts). */
export function hexToHsl(hex: string): Hsl {
  const [r255, g255, b255] = hexToRgb(hex).split(", ").map(Number);
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** Inverse of hexToHsl: { h, s, l } → "#rrggbb". */
export function hslToHex({ h, s, l }: Hsl): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.min(1, Math.max(0, s));
  const ll = Math.min(1, Math.max(0, l));
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hh < 60) [r, g, b] = [c, x, 0];
  else if (hh < 120) [r, g, b] = [x, c, 0];
  else if (hh < 180) [r, g, b] = [0, c, x];
  else if (hh < 240) [r, g, b] = [0, x, c];
  else if (hh < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to2 = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

/** WCAG relative luminance (0–1) of a hex color. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
    .split(", ")
    .map(Number)
    .map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
