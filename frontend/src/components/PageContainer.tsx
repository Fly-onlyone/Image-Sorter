// Shared page chrome. PageContainer replaces every per-page `maxWidth` box with a
// FLUID width that grows on wide windows (no right-side dead zone) and can stretch to
// fill the remaining vertical space. PageHeader is the cinematic gradient-text hero
// header — title fill + animated underline derived from the active theme accent.

import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface PageContainerProps {
  children: ReactNode;
  /** Default (undefined) and "fluid" fill the whole main area; pass a number to cap width. */
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
        ...(fill && { flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }),
      }}
    >
      {children}
    </Box>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();

  const heading = (
    <Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          lineHeight: 1.1,
          backgroundImage: theme.app.gradientAccent,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          ...(reduced ? {} : { animation: "gradientFlow 8s ease infinite" }),
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        {reduced ? (
          heading
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {heading}
          </motion.div>
        )}
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>
      <Box
        sx={{
          mt: 1.5,
          height: 3,
          width: 72,
          borderRadius: 3,
          backgroundImage: theme.app.gradientAccent,
          backgroundSize: "200% 100%",
          ...(reduced ? {} : { animation: "gradientFlow 6s ease infinite" }),
        }}
      />
    </Box>
  );
}
