// Theme factory — turns the active ThemePreset into a full MUI theme and exposes
// the design tokens (glass / shadows / spring / animations) on `theme.app` so
// components and framer-motion can read them anywhere.

import { createTheme, type Theme } from "@mui/material/styles";
import { buildComponents } from "./components";
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
  const shadows = buildGlowShadows(preset.colors.primary);
  const app: AppTokens = {
    colors: preset.colors,
    glass: preset.glass,
    spring: preset.spring,
    animations: preset.animations,
    shadows,
    gradientAccent: gradientAccent(preset.colors.primary, preset.colors.secondary),
  };
  return createTheme({
    palette: buildPalette(preset.colors),
    typography,
    shape: { borderRadius: preset.glass.borderRadius },
    components: buildComponents(preset, shadows),
    app,
  });
}

export { DEFAULT_THEME_ID, getPreset, PRESET_MAP, PRESETS } from "./presets";
export type { ThemePreset } from "./types";
