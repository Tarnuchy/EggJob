import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { OutlineButton } from '../../components/common/OutlineButton';
import { Avatar } from '../../components/common/Avatar';
import { PhotoSourceSheet } from '../../components/common/PhotoSourceSheet';
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
  const { t } = useTranslation();
  const form = useRegisterForm({ onSuccess });

  useEffect(() => {
    if (!isActive) form.resetShake();
  }, [isActive, form]);

  return (
    <>
      <View style={styles.photoSection}>
        <Avatar photoUrl={form.photoUrl} size={88} accessibilityLabel={form.username} />
        <OutlineButton
          title={form.uploading ? t('photo.uploading') : form.photoUrl ? t('photo.change') : t('photo.add')}
          onPress={form.openPhotoSheet}
          isLoading={form.uploading}
          disabled={form.isLoading}
          style={styles.photoButton}
        />
      </View>
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
        passwordVisible={form.passwordVisible}
        onTogglePasswordVisibility={form.togglePasswordVisibility}
      />
      <AppInput
        label={t('auth.fields.confirmPassword')}
        placeholder={t('auth.fields.confirmPasswordPlaceholder')}
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
        label={t('auth.fields.username')}
        placeholder={t('auth.fields.usernamePlaceholder')}
        value={form.username}
        onChangeText={form.handleUsernameChange}
        onBlur={form.handleUsernameBlur}
        touched={form.usernameTouched}
        error={form.usernameError}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {form.registerError ? (
        <View style={styles.errorRow}>
          <Ionicons name="warning-outline" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{form.registerError}</Text>
        </View>
      ) : null}
      <Spacer height={spacing.sm} />
      <AppButton
        title={t('auth.cta.register')}
        onPress={form.handleSubmit}
        shakeCount={form.shakeCount}
        isLoading={form.isLoading}
        disabled={form.uploading}
      />

      <PhotoSourceSheet
        visible={form.sheetVisible}
        onSelect={form.handleSelectSource}
        onCancel={form.closePhotoSheet}
      />
    </>
  );
};

const styles = StyleSheet.create({
  photoSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    width: 'auto',
  },
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
