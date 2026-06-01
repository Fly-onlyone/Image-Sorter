// Typography — Outfit headings + buttons (600/700), Inter body.
// Both self-hosted via @fontsource (no Google CDN in a desktop app).

import type { TypographyVariantsOptions } from "@mui/material/styles";

const HEADING = '"Outfit", "Inter", system-ui, sans-serif';
const BODY = '"Inter", system-ui, sans-serif';

export const typography: TypographyVariantsOptions = {
  fontFamily: BODY,
  h1: { fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" },
  h2: { fontFamily: HEADING, fontWeight: 700, letterSpacing: "-0.02em" },
  h3: { fontFamily: HEADING, fontWeight: 600, letterSpacing: "-0.01em" },
  h4: { fontFamily: HEADING, fontWeight: 600 },
  h5: { fontFamily: HEADING, fontWeight: 600 },
  h6: { fontFamily: HEADING, fontWeight: 600 },
  subtitle1: { fontFamily: HEADING, fontWeight: 600 },
  button: { fontFamily: HEADING, fontWeight: 600, textTransform: "none" },
  body1: { fontFamily: BODY },
  body2: { fontFamily: BODY },
};
