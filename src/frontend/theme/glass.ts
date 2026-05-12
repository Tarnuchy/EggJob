import type { ViewStyle } from 'react-native';
import { shadows } from './shadows';

export const BLUR_INTENSITY = 80;

export const glass = {
  backgroundColor: 'rgba(138, 108, 85, 0.65)',
  borderColor: 'rgba(244, 236, 227, 0.12)',
  borderWidth: 1,
  ...shadows.level2,
} satisfies ViewStyle;

export const glassStyle: ViewStyle = {
  backgroundColor: glass.backgroundColor,
  borderColor: glass.borderColor,
  borderWidth: glass.borderWidth,
  overflow: 'hidden',
  ...shadows.level2,
};
