import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { LocalePreference } from '../../application/LocaleContext';

interface Props {
  visible: boolean;
  current: LocalePreference;
  onSelect: (next: LocalePreference) => void;
  onClose: () => void;
}

type Option = {
  value: LocalePreference;
  labelKey: 'settings.languagePicker.system' | 'settings.languagePicker.english' | 'settings.languagePicker.polish';
};

const OPTIONS: readonly Option[] = [
  { value: 'system', labelKey: 'settings.languagePicker.system' },
  { value: 'en', labelKey: 'settings.languagePicker.english' },
  { value: 'pl', labelKey: 'settings.languagePicker.polish' },
];

export const LanguagePickerModal = ({ visible, current, onSelect, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityElementsHidden>
        <Pressable
          style={[styles.sheet, { paddingBottom: spacing.md + insets.bottom }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <AppText variant="h2" color="textPrimary" style={styles.title}>
            {t('settings.languagePicker.title')}
          </AppText>
          {OPTIONS.map((option, index) => {
            const isActive = current === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t(option.labelKey)}
                style={({ pressed }) => [
                  styles.option,
                  index > 0 && styles.optionDivider,
                  pressed && styles.optionPressed,
                ]}
              >
                <AppText
                  variant="body"
                  color={isActive ? 'primary' : 'textPrimary'}
                  style={styles.optionLabel}
                >
                  {t(option.labelKey)}
                </AppText>
                {isActive ? (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                ) : null}
              </Pressable>
            );
          })}
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
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.dividerLine,
  },
  optionPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.06)',
  },
  optionLabel: {
    flex: 1,
  },
});
