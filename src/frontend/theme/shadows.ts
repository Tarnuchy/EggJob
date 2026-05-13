import type { ViewStyle } from 'react-native';
import { eggJobPalette } from './colors';

export const shadows = {
  level1: {
    shadowColor: eggJobPalette.bighornSheep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } satisfies ViewStyle,

  level2: {
    shadowColor: eggJobPalette.bighornSheep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  } satisfies ViewStyle,

  level3: {
    shadowColor: eggJobPalette.searingGorgeBrown,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  } satisfies ViewStyle,
} as const;
