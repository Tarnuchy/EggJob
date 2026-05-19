import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  icon: IoniconName;
  title: string;
  message?: string;
}

export const EmptyState = ({ icon, title, message }: Props) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={48} color={colors.primary} />
    </View>
    <AppText variant="h2" color="textPrimary" style={styles.title}>
      {title}
    </AppText>
    {message ? (
      <AppText variant="body" color="textSecondary" style={styles.message}>
        {message}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
