import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  value: number | string;
  label: string;
  onPress?: () => void;
}

export const StatTile = ({ value, label, onPress }: Props) => {
  const content = (
    <>
      <AppText variant="h1" color="textPrimary">
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary" style={styles.label} numberOfLines={2}>
        {label}
      </AppText>
    </>
  );

  if (!onPress) {
    return <View style={styles.tile}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      accessibilityRole="button"
      accessibilityLabel={`${value} ${label}`}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  tilePressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.12)',
  },
  label: {
    textAlign: 'center',
  },
});
