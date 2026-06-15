import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import type { PickSource } from '../../utils/pickImage';

interface Props {
  visible: boolean;
  onSelect: (source: PickSource) => void;
  onCancel: () => void;
}

/**
 * Bottom-sheet that offers a camera or photo-library source for a picture, plus cancel.
 * Visually consistent with `ConfirmDialog`. Reused by the profile, progress and register screens.
 */
export const PhotoSourceSheet = ({ visible, onSelect, onCancel }: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityElementsHidden>
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.md + insets.bottom }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <AppText variant="h2" color="textPrimary" style={styles.title}>
            {t('photo.sourceTitle')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.message}>
            {t('photo.sourceMessage')}
          </AppText>

          <Pressable
            onPress={() => onSelect('camera')}
            accessibilityRole="button"
            accessibilityLabel={t('photo.takePhoto')}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
            <Text style={styles.optionText}>{t('photo.takePhoto')}</Text>
          </Pressable>

          <Pressable
            onPress={() => onSelect('library')}
            accessibilityRole="button"
            accessibilityLabel={t('photo.chooseFromLibrary')}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
          >
            <Ionicons name="images-outline" size={20} color={colors.primary} />
            <Text style={styles.optionText}>{t('photo.chooseFromLibrary')}</Text>
          </Pressable>

          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={t('photo.cancel')}
            style={({ pressed }) => [styles.cancel, pressed && styles.optionPressed]}
          >
            <Text style={styles.cancelText}>{t('photo.cancel')}</Text>
          </Pressable>
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
  message: {
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.dividerLine,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    color: colors.textPrimary,
    ...typography.button,
  },
  cancel: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelText: {
    color: colors.muted,
    ...typography.button,
  },
});

export default PhotoSourceSheet;
