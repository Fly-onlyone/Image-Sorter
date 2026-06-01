// Magnetic-hover primary action (Start run, Commit). framer-motion,
// reduced-motion gated. Wraps a MUI Button in a motion.div to avoid prop-type
// clashes between framer-motion's drag handlers and MUI's Button typing.

import { Button, type ButtonProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { type MouseEvent, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function MagneticButton(props: ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, theme.app.spring.gentle);
  const sy = useSpring(y, theme.app.spring.gentle);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, display: "inline-block" }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
    >
      <Button {...props} />
    </motion.div>
  );
}
