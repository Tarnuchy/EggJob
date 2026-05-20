import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useLoginForm } from './hooks/useLoginForm';

interface Props {
  onSuccess: () => void;
  isActive: boolean;
}

export const LoginForm = ({ onSuccess, isActive }: Props) => {
  const { t } = useTranslation();
  const form = useLoginForm({ onSuccess });

  useEffect(() => {
    if (!isActive) form.resetShake();
  }, [isActive, form]);

  return (
    <>
      <AppInput
        label={t('auth.fields.email')}
        placeholder={t('auth.fields.emailPlaceholder')}
        value={form.email}
        onChangeText={form.handleEmailChange}
        onBlur={form.handleEmailBlur}
        touched={form.emailTouched}
        error={form.emailError}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AppInput
        label={t('auth.fields.password')}
        placeholder={t('auth.fields.passwordPlaceholder')}
        value={form.password}
        onChangeText={form.handlePasswordChange}
        onBlur={form.handlePasswordBlur}
        touched={form.passwordTouched}
        error={form.passwordError}
        secureTextEntry
      />
      {form.loginError ? (
        <View style={styles.errorRow}>
          <Ionicons name="warning-outline" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{form.loginError}</Text>
        </View>
      ) : null}
      <Spacer height={spacing.sm} />
      <AppButton
        title={t('auth.cta.login')}
        onPress={form.handleSubmit}
        shakeCount={form.shakeCount}
        isLoading={form.isLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  errorRow: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    color: colors.danger,
    ...typography.caption,
  },
});
