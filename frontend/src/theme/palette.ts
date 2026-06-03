// MUI palette from a preset's 12 color roles. App semantic states map
// onto these slots so every theme "just works" with no hardcoded hex.

import type { PaletteOptions } from "@mui/material/styles";
import type { ColorRoles } from "./types";

export function buildPalette(c: ColorRoles): PaletteOptions {
  return {
    mode: "dark",
    primary: { main: c.primary },
    secondary: { main: c.secondary },
    success: { main: c.success }, // identified / auto-filed
    warning: { main: c.warning }, // review / borderline
    error: { main: c.error }, //   nude / R-18
    info: { main: c.info },
    background: { default: c.bg, paper: c.surface },
    // Both text roles already meet a WCAG contrast floor (>=7:1 / >=4.5:1) against the
    // lightest surface — enforced in normalizeColors — so they stay readable on every theme.
    text: { primary: c.textPrimary, secondary: c.textSecondary },
    divider: c.border,
  };
}
