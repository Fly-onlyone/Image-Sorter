// A titled chrome section: a glass Card with an overline header and divider-separated
// rows, plus an optional footer slot (e.g. an in-place warning) below the rows. Shared by
// Settings and New Run so every grouped section reads with the same rhythm.

import { Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
  /** Optional right-aligned header control (e.g. a count or toggle). */
  action?: ReactNode;
  /** Rendered below the divider-separated rows, outside the divider rhythm. */
  footer?: ReactNode;
}

export function SettingsSection({ title, children, action, footer }: SettingsSectionProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {title}
          </Typography>
          {action}
        </Stack>
        <Stack divider={<Divider />}>{children}</Stack>
        {footer}
      </CardContent>
    </Card>
  );
}
