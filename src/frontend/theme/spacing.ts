// Technique #11 (Golden Ratio) — base unit 8px, spacings are multiples
// Golden ratio: 1.618 applied to body line-height (16px * 1.618 ≈ 26px → 24px snapped to grid)

export const BASE = 8;

export const spacing = {
  xs: BASE / 2,      // 4px
  sm: BASE,          // 8px
  md: BASE * 2,      // 16px — gap between stacked inputs
  lg: BASE * 3,      // 24px — gap between distinct page sections / horizontal padding
  xl: BASE * 5,      // 40px — major sectional breaks
  xxl: BASE * 8,     // 64px
} as const;

// Horizontal padding for ScreenContainer (upgraded from 20px)
export const SCREEN_PADDING_H = spacing.lg; // 24px
