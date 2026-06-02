// Gradient-flow border for emphasis cards (ported from TradingAgent). Reduced-motion gated.

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function AnimatedGradientBorder({
  children,
  radius,
}: {
  children: ReactNode;
  radius?: number;
}) {
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  const r = radius ?? theme.app.glass.borderRadius;
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: `${r + 1}px`,
        p: "1px",
        background: theme.app.gradientAccent,
        backgroundSize: "200% 100%",
        ...(reduced ? {} : { animation: "gradientFlow 6s ease infinite" }),
      }}
    >
      <Box sx={{ borderRadius: `${r}px`, bgcolor: "background.paper", height: "100%" }}>
        {children}
      </Box>
    </Box>
  );
}
