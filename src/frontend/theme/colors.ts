export const eggJobPalette = {
  paradorInn: "#A99A8A",
  antiquities: "#8A6C55",
  searingGorgeBrown: "#6B3F22",
  nightBrown: "#432617",
  bighornSheep: "#1E130E",
} as const;

export const colors = {
  background: eggJobPalette.paradorInn,
  surface: eggJobPalette.antiquities,
  surfaceAlt: "#BAAB9C",
  primary: eggJobPalette.searingGorgeBrown,
  primaryPressed: eggJobPalette.nightBrown,
  border: eggJobPalette.nightBrown,
  textPrimary: eggJobPalette.bighornSheep,
  textSecondary: "#2A1B12",
  textOnPrimary: "#F4ECE3",
  danger: "#6B2B22",
  muted: "rgba(30, 19, 14, 0.65)",
} as const;
