import { Easing } from "react-native";

// Technique #1 (Ripple + Easing), #3 (Anticipation), #8 (Hover/Press States)

export const easing = {
  // Universal smooth ease-out: cubic-bezier(0.25, 1, 0.5, 1)
  standard: Easing.bezier(0.25, 1, 0.5, 1),
  spring: { damping: 15, stiffness: 180, mass: 1 },
} as const;

export const duration = {
  micro: 150,   // Press state feedback
  short: 200,   // Micro-interactions (ripple, icon swap)
  medium: 350,  // Layout shifts, modals, screen transitions
} as const;

// Technique #8 — Universal press state spec
// Apply with Animated.spring or Pressable's onPressIn/Out
export const pressState = {
  scale: 0.97,
  overlayColor: "rgba(30, 19, 14, 0.10)",
  duration: duration.micro,
  easing: easing.standard,
} as const;

// Technique #3 — Modal/screen entrance animation spec
// Scale from 0.95 → 1.0, opacity 0 → 1
export const entranceAnimation = {
  scaleFrom: 0.95,
  scaleTo: 1.0,
  opacityFrom: 0,
  opacityTo: 1,
  duration: duration.medium,
  easing: easing.standard,
} as const;
