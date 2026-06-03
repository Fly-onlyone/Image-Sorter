// Theme factory — turns the active ThemePreset into a full MUI theme and exposes
// the design tokens (glass / shadows / spring / animations) on `theme.app` so
// components and framer-motion can read them anywhere.

import { createTheme, type Theme } from "@mui/material/styles";
import { buildComponents } from "./components";
import { normalizeColors } from "./normalize";
import { buildPalette } from "./palette";
import { buildGlowShadows, type GlowShadows } from "./shadows";
import type { AnimationTokens, ColorRoles, GlassTokens, SpringTokens, ThemePreset } from "./types";
import { typography } from "./typography";
import { gradientAccent } from "./utils";

export interface AppTokens {
  colors: ColorRoles;
  glass: GlassTokens;
  spring: SpringTokens;
  animations: AnimationTokens;
  shadows: GlowShadows;
  gradientAccent: string;
}

declare module "@mui/material/styles" {
  interface Theme {
    app: AppTokens;
  }
  interface ThemeOptions {
    app?: AppTokens;
  }
}

export function buildTheme(preset: ThemePreset): Theme {
  // Level every preset to the shared darkness + contrast standards before it becomes a
  // theme. This single chokepoint feeds the palette, app tokens, body gradient/glows,
  // glass, inputs, and SilkRibbons (all read these `colors`), so every theme conforms.
  const colors = normalizeColors(preset.colors);
  const shadows = buildGlowShadows(colors.primary);
  const app: AppTokens = {
    colors,
    glass: preset.glass,
    spring: preset.spring,
    animations: preset.animations,
    shadows,
    gradientAccent: gradientAccent(colors.primary, colors.secondary),
  };
  return createTheme({
    palette: buildPalette(colors),
    typography,
    shape: { borderRadius: preset.glass.borderRadius },
    components: buildComponents({ ...preset, colors }, shadows),
    app,
  });
}

export { normalizeColors } from "./normalize";
export { DEFAULT_THEME_ID, getPreset, PRESET_MAP, PRESETS } from "./presets";
export type { ThemePreset } from "./types";
