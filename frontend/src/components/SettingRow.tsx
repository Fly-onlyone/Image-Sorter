// One settings row, shared by Settings and New Run so every control follows the same
// grammar. Inline mode (default) puts a compact control (Switch) on the right of the
// label; stack mode drops a full-width control (Slider, TextField) below the label with
// an optional right-aligned value. Rows are separated by <Divider/> in their parent.

import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SettingRowProps {
  label: string;
  helper?: string;
  control: ReactNode;
  /** Right-aligned value beside the label (sliders). Only shown in stack mode. */
  value?: ReactNode;
  /** Render the control full-width below the label instead of inline on the right. */
  stack?: boolean;
  disabled?: boolean;
}

export function SettingRow({
  label,
  helper,
  control,
  value,
  stack = false,
  disabled = false,
}: SettingRowProps) {
  const labelBlock = (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "baseline", justifyContent: "space-between" }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {stack && value != null && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </Typography>
        )}
      </Stack>
      {helper && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
          {helper}
        </Typography>
      )}
    </Box>
  );

  if (stack) {
    return (
      <Box sx={{ py: 1.5, opacity: disabled ? 0.5 : 1 }}>
        {labelBlock}
        <Box sx={{ mt: 1.5, px: 0.5 }}>{control}</Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {labelBlock}
      <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Box>
  );
}
