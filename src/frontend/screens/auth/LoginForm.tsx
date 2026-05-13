import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Spacer } from '../../components/common/Spacer';
import { strings } from '../../i18n/strings';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useLoginForm } from './hooks/useLoginForm';

interface Props {
  onSuccess: () => void;
  isActive: boolean;
}

export const LoginForm = ({ onSuccess, isActive }: Props) => {
  const form = useLoginForm({ onSuccess });

  useEffect(() => {
    if (!isActive) form.resetShake();
  }, [isActive, form]);

  return (
    <>
      <AppInput
        label={strings.auth.fields.email}
        placeholder={strings.auth.fields.emailPlaceholder}
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
        label={strings.auth.fields.password}
        placeholder={strings.auth.fields.passwordPlaceholder}
        value={form.password}
        onChangeText={form.handlePasswordChange}
        onBlur={form.handlePasswordBlur}
        touched={form.passwordTouched}
        error={form.passwordError}
        secureTextEntry
      />
      {form.loginError ? <Text style={styles.errorText}>⚠️ {form.loginError}</Text> : null}
      <Spacer height={spacing.sm} />
      <AppButton
        title={strings.auth.cta.login}
        onPress={form.handleSubmit}
        shakeCount={form.shakeCount}
        isLoading={form.isLoading}
      />
    </>
  );
};

const styles = StyleSheet.create({
  errorText: {
    marginBottom: spacing.sm,
    color: colors.danger,
    ...typography.caption,
  },
});
