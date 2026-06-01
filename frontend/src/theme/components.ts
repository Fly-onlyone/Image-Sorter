// MUI v9 component overrides. Glass + glow apply to *chrome* only
// (AppBar, Drawer, Card, dialogs, inputs); the thumbnail grid stays flat opaque
// neutral so images stay true — image screens use plain Box/ImageListItem, not Card.

import type { Components, Theme } from "@mui/material/styles";
import type { GlowShadows } from "./shadows";
import type { ThemePreset } from "./types";
import { gradientAccent, hexToRgb, withAlpha } from "./utils";

export function buildComponents(preset: ThemePreset, shadows: GlowShadows): Components<Theme> {
  const { colors, glass } = preset;
  const p = hexToRgb(colors.primary);
  const accent = gradientAccent(colors.primary, colors.secondary);
  const cardBg = withAlpha(colors.surface, glass.cardOpacity);
  const sidebarBg = withAlpha(colors.surface, glass.sidebarOpacity);

  return {
    MuiCssBaseline: {
      styleOverrides: {
        "@keyframes gradientFlow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        body: {
          backgroundColor: colors.bg,
          color: colors.textPrimary,
          scrollbarColor: `${colors.border} transparent`,
        },
        "*::-webkit-scrollbar": { width: 10, height: 10 },
        "*::-webkit-scrollbar-thumb": {
          background: colors.border,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "transparent" },
      styleOverrides: {
        root: {
          background: sidebarBg,
          backdropFilter: `blur(${glass.sidebarBlur}px)`,
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: sidebarBg,
          backdropFilter: `blur(${glass.sidebarBlur}px)`,
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          position: "relative",
          background: cardBg,
          backdropFilter: `blur(${glass.cardBlur}px)`,
          border: `1px solid ${colors.border}`,
          borderRadius: glass.borderRadius,
          transition: "box-shadow .25s ease, transform .25s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            insetInline: 0,
            top: 0,
            height: 2,
            background: accent,
            backgroundSize: "200% 100%",
            animation: "gradientFlow 6s ease infinite",
            opacity: 0.8,
          },
          "&:hover": { boxShadow: shadows.cardHover },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: glass.borderRadius, paddingInline: 18 },
        contained: {
          background: `linear-gradient(135deg, rgba(${p},.7), rgba(${p},.5))`,
          backdropFilter: "blur(12px)",
          boxShadow: shadows.primary,
          "&:hover": {
            background: `linear-gradient(135deg, rgba(${p},.85), rgba(${p},.65))`,
            boxShadow: `0 4px 16px rgba(${p},.4), 0 0 20px rgba(${p},.15)`,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          border: "none",
          height: 1,
          background: accent,
          backgroundSize: "200% 100%",
          animation: "gradientFlow 8s ease infinite",
          opacity: 0.5,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3, boxShadow: shadows.primary },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: glass.borderRadius,
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
            boxShadow: shadows.primary,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
    },
  };
}
