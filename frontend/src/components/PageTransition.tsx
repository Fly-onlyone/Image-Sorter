// View-change transition. AppShell wraps each routed screen in <AnimatePresence>
// keyed on `view`; this fades/slides the incoming screen and lets a `fill` child
// stretch via the flex column. Renders children directly when reduced-motion.

import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: theme.app.animations.normal / 1000, ease: [0.16, 1, 0.3, 1] }}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}
