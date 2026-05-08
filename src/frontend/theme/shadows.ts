import { ViewStyle } from "react-native";

// Technique #5 (Pop-out Effect) + #10 (Shadow Glow)
// iOS uses shadow* props; Android uses elevation.
// Apply both for cross-platform depth.

export const shadows = {
  // Level 1: Resting — cards, resting inputs
  level1: {
    shadowColor: "#1E130E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } satisfies ViewStyle,

  // Level 2: Floating — modals, dropdowns, sticky nav
  level2: {
    shadowColor: "#1E130E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,

  // Level 3: Primary Glow — active states, main CTAs
  // Uses primary (#6B3F22) instead of black for a warm colored glow
  level3: {
    shadowColor: "#6B3F22",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  } satisfies ViewStyle,
} as const;
