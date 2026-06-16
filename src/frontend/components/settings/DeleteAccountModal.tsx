import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '../common/AppText';
import { AppInput } from '../common/AppInput';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props {
  visible: boolean;
  busy: boolean;
  /** Already-translated error message to surface (e.g. wrong password). */
  error?: string;
  onCancel: () => void;
  onConfirm: (password: string) => void;
}

/**
 * Destructive confirmation sheet for account deletion. The user must re-enter their
 * password, which the parent forwards to the backend (which verifies it).
 */
export const DeleteAccountModal = ({ visible, busy, error, onCancel, onConfirm }: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [password, setPassword] = useState('');

  // Clear the field whenever the sheet (re)opens so a previous attempt doesn't linger.
  useEffect(() => {
    if (visible) setPassword('');
  }, [visible]);

  const canConfirm = password.trim().length > 0 && !busy;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={busy ? undefined : onCancel}
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={busy ? undefined : onCancel}
        accessibilityElementsHidden
      >
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.md + insets.bottom }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <AppText variant="h2" color="textPrimary" style={styles.title}>
            {t('settings.account.modalTitle')}
          </AppText>
          <AppText variant="body" color="muted" style={styles.warning}>
            {t('settings.account.warning')}
          </AppText>
          <AppInput
            label={t('settings.account.passwordLabel')}
            placeholder={t('settings.account.passwordPlaceholder')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!busy}
            accessibilityLabel={t('settings.account.passwordLabel')}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              onPress={busy ? undefined : onCancel}
              accessibilityRole="button"
              accessibilityLabel={t('settings.account.cancel')}
              style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
            >
              <Text style={styles.cancelLabel}>{t('settings.account.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={canConfirm ? () => onConfirm(password) : undefined}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canConfirm }}
              accessibilityLabel={t('settings.account.confirm')}
              style={({ pressed }) => [
                styles.button,
                styles.confirm,
                !canConfirm && styles.confirmDisabled,
                pressed && canConfirm && styles.pressed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmLabel}>{t('settings.account.confirm')}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 19, 14, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  warning: {
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  cancel: {
    borderWidth: 2,
    borderColor: colors.inputBorderIdle,
  },
  cancelLabel: {
    color: colors.textPrimary,
    ...typography.label,
  },
  confirm: {
    backgroundColor: colors.danger,
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmLabel: {
    color: '#FFFFFF',
    ...typography.label,
  },
  pressed: {
    opacity: 0.85,
  },
});
