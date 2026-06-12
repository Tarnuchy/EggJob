import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  title: string;
  children: ReactNode;
}

export const SettingsSection = ({ title, children }: Props) => (
  <View style={styles.section}>
    <AppText variant="label" color="textSecondary" style={styles.title}>
      {title.toUpperCase()}
    </AppText>
    <View style={styles.card}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    overflow: 'hidden',
  },
});
