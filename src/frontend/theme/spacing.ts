export const BASE = 8;

export const spacing = {
  xs: BASE / 2,
  sm: BASE,
  md: BASE * 2,
  lg: BASE * 3,
  xl: BASE * 5,
  xxl: BASE * 8,
} as const;

export const SCREEN_PADDING_H = spacing.lg;
