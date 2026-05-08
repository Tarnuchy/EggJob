import { Easing } from "react-native";

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

export const pressState = {
  scale: 0.97,
  overlayColor: "rgba(30, 19, 14, 0.10)",
  duration: duration.micro,
  easing: easing.standard,
} as const;

export const entranceAnimation = {
  scaleFrom: 0.95,
  scaleTo: 1.0,
  opacityFrom: 0,
  opacityTo: 1,
  duration: duration.medium,
  easing: easing.standard,
} as const;
