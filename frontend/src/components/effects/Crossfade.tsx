// Crossfade between mutually-exclusive panels (e.g. tab bodies): the outgoing content fades
// out, then the incoming content fades in, keyed by `id`. Reduced-motion renders children
// directly. Shared by Review + Gallery so the tab swap reads the same on both.

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function Crossfade({ id, children }: { id: string | number; children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
