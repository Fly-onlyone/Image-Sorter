// Selectable cards for an exclusive choice (New Run's folder layout). Each tile shows a
// label + a monospace path-preview; the active tile gets a primary ring + primary glow so
// selection reads clearly across all 11 themes (no hardcoded hex). Replaces a cramped
// ToggleButtonGroup that couldn't show the per-option folder preview.

import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export interface CardRadioOption {
  value: string;
  label: string;
  preview?: string;
}

interface CardRadioGroupProps {
  options: CardRadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function CardRadioGroup({ options, value, onChange }: CardRadioGroupProps) {
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: `repeat(${options.length}, 1fr)` },
        gap: 1.5,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Card
            key={opt.value}
            sx={{
              // These tiles are selection chips, not section containers — drop the global
              // animated gradient top-border so a row of them does not read as busy.
              "&::before": { display: "none" },
              // Ease the ring/glow as selection moves between cards instead of snapping.
              transition: reduced ? "none" : "box-shadow .25s ease, border-color .25s ease",
              borderColor: active ? "primary.main" : undefined,
              boxShadow: active ? theme.app.shadows.primary : undefined,
            }}
          >
            <CardActionArea
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              sx={{ p: 1.5, height: "100%" }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: active ? "primary.main" : "text.primary" }}
              >
                {opt.label}
              </Typography>
              {opt.preview && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "text.secondary",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {opt.preview}
                </Typography>
              )}
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
