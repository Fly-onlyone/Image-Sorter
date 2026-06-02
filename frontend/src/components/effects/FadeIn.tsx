// Mount fade-in for chrome that appears mid-render (alerts, banners, result panels).
// Unlike ScrollReveal (whileInView, tuned for long scrolling lists), this animates on mount
// so a freshly-rendered Alert eases in instead of popping.
//
// Always renders the SAME motion.div — never swap to a plain fragment on reduced-motion.
// Swapping element types remounts the children when reduce-motion is toggled (a flicker
// source). Reduced just renders at the natural state with no entrance.

import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function FadeIn({ children, y = 6 }: { children: ReactNode; y?: number }) {
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: theme.app.animations.normal / 1000, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
