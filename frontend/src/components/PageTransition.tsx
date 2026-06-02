// View-change transition. AppShell wraps each routed screen in <AnimatePresence>
// keyed on `view`; this crossfades the incoming screen and lets a `fill` child stretch
// via the flex column. Opacity-only (no transform) so the sticky PageBar inside isn't
// trapped by a transformed ancestor.
//
// IMPORTANT: always renders the SAME motion.div — never swap to a plain fragment on
// reduced-motion. Swapping element types unmounts/remounts the entire page subtree the
// instant reduce-motion is toggled, which read as a full-screen flicker. Reduced just
// disables the fade (no initial offset, instant exit).

import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: theme.app.animations.normal / 1000, ease: [0.16, 1, 0.3, 1] }
      }
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}
