import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocale, type LocalePreference } from '../../application/LocaleContext';
import {
  LanguagePickerModal,
  SettingsRow,
  SettingsSection,
} from '../../components/settings';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';

const PREFERENCE_LABEL_KEYS: Record<
  LocalePreference,
  'settings.languagePicker.system' | 'settings.languagePicker.english' | 'settings.languagePicker.polish'
> = {
  system: 'settings.languagePicker.system',
  en: 'settings.languagePicker.english',
  pl: 'settings.languagePicker.polish',
};

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const { preference, setPreference } = useLocale();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSelect = (next: LocalePreference) => {
    setPickerVisible(false);
    void setPreference(next);
  };

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t('settings.sections.preferences')}>
          <SettingsRow
            icon="language-outline"
            label={t('settings.rows.language')}
            value={t(PREFERENCE_LABEL_KEYS[preference])}
            onPress={() => setPickerVisible(true)}
          />
        </SettingsSection>
      </ScrollView>
      <LanguagePickerModal
        visible={pickerVisible}
        current={preference}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
