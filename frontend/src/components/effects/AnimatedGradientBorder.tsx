// Gradient-flow border for emphasis cards (ported from TradingAgent).

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";

export function AnimatedGradientBorder({
  children,
  radius,
}: {
  children: ReactNode;
  radius?: number;
}) {
  const theme = useTheme();
  const r = radius ?? theme.app.glass.borderRadius;
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: `${r + 1}px`,
        p: "1px",
        background: theme.app.gradientAccent,
        backgroundSize: "200% 100%",
        animation: "gradientFlow 6s ease infinite",
      }}
    >
      <Box sx={{ borderRadius: `${r}px`, bgcolor: "background.paper", height: "100%" }}>
        {children}
      </Box>
    </Box>
  );
}
