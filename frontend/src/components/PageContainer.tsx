// Shared page chrome.
// • PageContainer owns page width — fluid by default (grows on wide windows, no right-side
//   dead zone), or a numeric cap centered with mx:auto. Never hardcode a per-page maxWidth
//   box; set it here. `fill` stretches vertically so a flexGrow child fills the bottom.
// • PageBar is the sticky title rail: a flat icon chip + a COLLAPSING large title (macOS
//   pattern) + subtitle + right-aligned actions, closed by a 1px animated gradient hairline
//   (the gradient identity lives here). At rest the title is large and the subtitle sits
//   below it; as the window scrolls the title shrinks and the subtitle collapses, docking
//   into a slim rail — so the big title reads as page identity (not a sidebar echo) without
//   permanently costing height. On run-flow views it also carries the Setup→Process→Review→
//   Commit stepper at constant size, so title + stepper read as one sticky unit. The rail is
//   a flat opaque band (NO backdrop-filter — a blur here forms a compositing layer that hid
//   the fixed Toast in the WebView). All motion gates on usePrefersReducedMotion: reduced
//   shows the large at-rest title statically (no scroll collapse), matching the non-reduced
//   top-of-page state so toggling reduce-motion doesn't jump the title size.

import { Box, Stack, Step, StepLabel, Stepper, Typography, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAppState } from "../store/AppState";
import { APPBAR_HEIGHT, FLOW, FLOW_LABELS, VIEW_ICONS } from "./nav";

interface PageContainerProps {
  children: ReactNode;
  /** Default (undefined) and "fluid" fill the whole main area; a number caps + centers it. */
  maxWidth?: number | "fluid";
  /** Stretch vertically so a `flexGrow` child fills the empty bottom (History/Review lists). */
  fill?: boolean;
}

export function PageContainer({ children, maxWidth, fill = false }: PageContainerProps) {
  const max = typeof maxWidth === "number" ? maxWidth : "none";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: max,
        ...(typeof maxWidth === "number" && { mx: "auto" }),
        ...(fill && { flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }),
      }}
    >
      {children}
    </Box>
  );
}

interface PageBarProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

// Collapse threshold (px of window scroll) over which the large title shrinks to the slim rail.
const COLLAPSE_PX = 120;

export function PageBar({ title, subtitle, actions }: PageBarProps) {
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  const compactSteps = useMediaQuery(theme.breakpoints.down("md"));
  const { view } = useAppState();
  const flowIndex = FLOW.indexOf(view);
  const icon = VIEW_ICONS[view];

  // Scroll-driven collapse. Hooks run unconditionally (rules of hooks); when reduced we render
  // the at-rest LARGE title statically (same as p=0) and skip the scroll wiring — matching the
  // non-reduced top-of-page state so toggling reduce-motion never jumps the title size, and
  // never restructures/remounts the subtree (that remount was a flicker source).
  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, COLLAPSE_PX], [0, 1]);
  const titleFontSize = useTransform(p, [0, 1], ["1.9rem", "1.2rem"]);
  const subHeight = useTransform(p, [0, 0.6], [26, 0]);
  const subOpacity = useTransform(p, [0, 0.5], [1, 0]);

  const titleStyle = reduced ? { fontSize: "1.9rem" as const } : { fontSize: titleFontSize };
  const subStyle = reduced
    ? { height: 26 as const, opacity: 1, overflow: "hidden" as const }
    : { height: subHeight, opacity: subOpacity, overflow: "hidden" as const };

  const hairline = (
    <Box
      sx={{
        height: "1px",
        borderRadius: 1,
        backgroundImage: theme.app.gradientAccent,
        backgroundSize: "200% 100%",
        opacity: 0.7,
        ...(reduced ? {} : { animation: "gradientFlow 8s ease infinite" }),
      }}
    />
  );

  const inner = (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", gap: 1.5, py: 1 }}
      >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: `${theme.app.glass.borderRadius}px`,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                boxShadow: `inset 2px 0 0 ${theme.palette.primary.main}`,
                "& svg": { fontSize: 18 },
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <motion.div
              role="heading"
              aria-level={1}
              style={{
                ...titleStyle,
                fontWeight: 700,
                lineHeight: 1.15,
                color: theme.palette.text.primary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </motion.div>
            {subtitle != null && (
              <motion.div style={subStyle}>
                <Box sx={{ display: { xs: "none", md: "block" }, pt: 0.25 }}>
                  {typeof subtitle === "string" ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {subtitle}
                    </Typography>
                  ) : (
                    subtitle
                  )}
                </Box>
              </motion.div>
            )}
          </Box>
        </Stack>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>

      {flowIndex >= 0 && (
        <Box sx={{ pt: 0.5, pb: 1 }}>
          <Stepper activeStep={flowIndex} sx={{ maxWidth: 720 }}>
            {FLOW_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{compactSteps ? "" : label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {hairline}
    </>
  );

  return (
    <Box
      sx={{
        position: "sticky",
        top: APPBAR_HEIGHT,
        zIndex: (t) => t.zIndex.appBar - 1,
        mb: 3,
        // Solid (no backdrop-filter) so it cleanly occludes content scrolling under the
        // pinned rail. A blur here forms a compositing layer that hid the fixed Toast
        // snackbar in the WebView, so the rail stays a flat opaque band instead.
        backgroundColor: "background.default",
      }}
    >
      {/* One persistent motion.div for the mount reveal — never swapped for a plain Box on
          `reduced`, so toggling reduce-motion can't remount/re-fire the entrance (a flicker
          source). When reduced, the entrance is a no-op. */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: theme.app.animations.fast / 1000, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {inner}
      </motion.div>
    </Box>
  );
}
