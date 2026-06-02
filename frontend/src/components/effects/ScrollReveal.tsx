// Scroll-in reveal for long Review/Gallery lists. Reduced-motion gated.
//
// Always renders the SAME motion.div — never swap to a plain fragment on reduced-motion.
// Swapping element types remounts the children the instant reduce-motion is toggled (a
// flicker source). Reduced just renders at the natural state with no entrance.

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function ScrollReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
