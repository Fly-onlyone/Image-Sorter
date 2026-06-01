// Typed theme-preset model (TradingAgent pattern).

/** The 12 color roles every preset must supply. App semantic states map onto these. */
export interface ColorRoles {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface GlassTokens {
  borderRadius: number;
  cardBlur: number;
  cardOpacity: number;
  sidebarBlur: number;
  sidebarOpacity: number;
}

export interface SpringConfig {
  stiffness: number;
  damping: number;
}

export interface SpringTokens {
  snappy: SpringConfig;
  bouncy: SpringConfig;
  gentle: SpringConfig;
}

export interface AnimationTokens {
  fast: number;
  normal: number;
  slow: number;
  easing: {
    easeOutExpo: string;
    easeInOutBack: string;
  };
}

export interface ThemePreset {
  id: string;
  name: string;
  /** Short hue/character description shown in the picker. */
  hue: string;
  colors: ColorRoles;
  glass: GlassTokens;
  spring: SpringTokens;
  animations: AnimationTokens;
}
