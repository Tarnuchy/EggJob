import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '../components/common/AppButton';
import { AppText } from '../components/common/AppText';
import { Spacer } from '../components/common/Spacer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { i18n } from '../i18n';

interface Props {
  error: unknown;
  resetErrorBoundary: () => void;
}

function describeError(error: unknown): string {
  const generic = i18n.t('errorScreen.generic', { defaultValue: 'An unexpected error occurred.' });
  if (error instanceof Error) return error.message || generic;
  if (typeof error === 'string') return error;
  return generic;
}

export const ErrorScreen = ({ error, resetErrorBoundary }: Props) => {
  return (
    <View style={styles.root}>
      <AppText variant="h1" color="textPrimary" style={styles.title}>
        {i18n.t('errorScreen.title', { defaultValue: 'Something went wrong' })}
      </AppText>
      <Spacer height={spacing.md} />
      <AppText variant="body" color="textSecondary" style={styles.message}>
        {describeError(error)}
      </AppText>
      <Spacer height={spacing.lg} />
      <AppButton title={i18n.t('errorScreen.retry', { defaultValue: 'Try again' })} onPress={resetErrorBoundary} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
});
