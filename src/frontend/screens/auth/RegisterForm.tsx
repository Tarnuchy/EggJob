import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { Spacer } from '../../components/common/Spacer';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useRegisterForm } from './hooks/useRegisterForm';

interface Props {
  onSuccess: () => void;
  isActive: boolean;
}

export const RegisterForm = ({ onSuccess, isActive }: Props) => {
  const form = useRegisterForm({ onSuccess });

  useEffect(() => {
    if (!isActive) form.resetShake();
  }, [isActive, form]);

  return (
    <>
      <AppInput
        label="Email"
        placeholder="Your Email"
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
        label="Password"
        placeholder="Your Password"
        value={form.password}
        onChangeText={form.handlePasswordChange}
        onBlur={form.handlePasswordBlur}
        touched={form.passwordTouched}
        error={form.passwordError}
        secureTextEntry
        passwordVisible={form.passwordVisible}
        onTogglePasswordVisibility={form.togglePasswordVisibility}
      />
      <AppInput
        label="Confirm Password"
        placeholder="Confirm Password"
        value={form.confirm}
        onChangeText={form.handleConfirmChange}
        onBlur={form.handleConfirmBlur}
        touched={form.confirmTouched}
        error={form.confirmError}
        secureTextEntry
        passwordVisible={form.passwordVisible}
        onTogglePasswordVisibility={form.togglePasswordVisibility}
      />
      <AppInput
        label="Username"
        placeholder="Your Username"
        value={form.username}
        onChangeText={form.handleUsernameChange}
        onBlur={form.handleUsernameBlur}
        touched={form.usernameTouched}
        error={form.usernameError}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {form.registerError ? <Text style={styles.errorText}>⚠️ {form.registerError}</Text> : null}
      <Spacer height={spacing.sm} />
      <AppButton
        title="Create Account"
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
