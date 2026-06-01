// Shared structural tokens. For the 11 themes these are shared
// defaults; only the colors + gradientAccent differ. Gallery-fit: cardOpacity is
// kept toward the opaque end so thumbnails behind glass stay readable.

import type { AnimationTokens, GlassTokens, SpringTokens } from "./types";

export const DEFAULT_GLASS: GlassTokens = {
  borderRadius: 12,
  cardBlur: 18,
  cardOpacity: 0.6,
  sidebarBlur: 30,
  sidebarOpacity: 0.85,
};

export const DEFAULT_SPRING: SpringTokens = {
  snappy: { stiffness: 320, damping: 30 },
  bouncy: { stiffness: 260, damping: 18 },
  gentle: { stiffness: 170, damping: 24 },
};

export const DEFAULT_ANIM: AnimationTokens = {
  fast: 160,
  normal: 260,
  slow: 440,
  easing: {
    easeOutExpo: "cubic-bezier(.16,1,.3,1)",
    easeInOutBack: "cubic-bezier(.68,-.6,.32,1.6)",
  },
};
