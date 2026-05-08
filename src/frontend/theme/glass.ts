import { ViewStyle } from "react-native";
import { shadows } from "./shadows";

// Technique #9 (Glassmorphism Recipe)
// Usage: overlays, bottom navigation, premium cards.
//
// Requires expo-blur's <BlurView> for backdrop blur on the native layer.
// Apply glassStyle to the container View, wrap content in <BlurView intensity={80}>.

// Blur intensity value for expo-blur <BlurView intensity={BLUR_INTENSITY}>
export const BLUR_INTENSITY = 80;

// Style tokens for glassmorphism — spread onto the container View
export const glass = {
  // Semi-transparent surface derived from colors.surface (#8A6C55 at 65%)
  backgroundColor: "rgba(138, 108, 85, 0.65)",

  // Crisp edge using textOnPrimary (#F4ECE3 at 12% opacity)
  borderColor: "rgba(244, 236, 227, 0.12)",
  borderWidth: 1,

  // Elevation via Level 2 shadow
  ...shadows.level2,
} satisfies ViewStyle;

// Convenience style object to spread onto a View that wraps BlurView
export const glassStyle: ViewStyle = {
  backgroundColor: glass.backgroundColor,
  borderColor: glass.borderColor,
  borderWidth: glass.borderWidth,
  overflow: "hidden",
  ...shadows.level2,
};
