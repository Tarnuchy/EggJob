import { Easing } from 'react-native';

export const easing = {
  standard: Easing.bezier(0.25, 1, 0.5, 1),
  spring: { damping: 15, stiffness: 180, mass: 1 },
} as const;

export const duration = {
  micro: 150,
  short: 200,
  medium: 350,
  long: 500,
} as const;

export const minLoadTime = 1000;
