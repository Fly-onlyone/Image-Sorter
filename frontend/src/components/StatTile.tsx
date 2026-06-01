// Animated glass stat tile: spring count-up + optional accent glow for the live
// phase. Used on Progress (live SSE stats) and the Commit "Done" summary. Numbers
// count up; string values render as-is. Reduced-motion → final value immediately.

import { Card, CardContent, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

function CountUp({ value }: { value: number }) {
  const reduced = usePrefersReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduced, mv]);

  return <motion.span>{text}</motion.span>;
}

export function StatTile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: "100%",
        ...(accent && { borderColor: "primary.main", boxShadow: theme.app.shadows.primary }),
      }}
    >
      <CardContent sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
