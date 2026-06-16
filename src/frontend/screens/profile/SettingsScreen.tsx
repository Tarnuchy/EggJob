import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocale, type LocalePreference } from '../../application/LocaleContext';
import {
  DeleteAccountModal,
  LanguagePickerModal,
  SettingsRow,
  SettingsSection,
} from '../../components/settings';
import { useSystemNotificationsContext } from '../../application/SystemNotificationsProvider';
import { presentTestNotification } from '../../notifications/systemNotifications';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppState } from '../../application/AppStateContext';
import { selectCurrentAccountId, selectCurrentUserId } from '../../application/selectors';
import { profileService } from '../../services';
import { AuthTokenStorage } from '../../services/http/AuthTokenStorage';
import type { RootStackParamList } from '../../navigation/types';
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
  const systemNotifications = useSystemNotificationsContext();
  const { state, dispatch } = useAppState();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>(undefined);

  const handleConfirmDelete = async (password: string) => {
    const accountId = selectCurrentAccountId(state);
    const userId = selectCurrentUserId(state);
    if (!accountId || !userId) {
      setDeleteError(t('settings.account.errorGeneric'));
      return;
    }
    setDeleteBusy(true);
    setDeleteError(undefined);
    const result = await profileService.deleteAccount(accountId, userId, password);
    if (result.ok) {
      await AuthTokenStorage.clearToken();
      dispatch({ type: 'auth/logout' });
      setDeleteBusy(false);
      setDeleteVisible(false);
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      return;
    }
    setDeleteBusy(false);
    setDeleteError(
      result.error.code === 'unauthorized' || result.error.code === 'validation'
        ? t('settings.account.errorPassword')
        : t('settings.account.errorGeneric'),
    );
  };

  const handleSelect = (next: LocalePreference) => {
    setPickerVisible(false);
    void setPreference(next);
  };

  const handleSendTest = () => {
    void presentTestNotification(
      t('settings.notifications.testTitle'),
      t('settings.notifications.testBody'),
    );
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

        <SettingsSection title={t('settings.sections.notifications')}>
          <SettingsRow
            icon="notifications-outline"
            label={t('settings.notifications.systemToggle')}
            accessibilityLabel={t('settings.notifications.systemToggle')}
            rightAccessory={
              <Switch
                value={systemNotifications.enabled}
                onValueChange={() => void systemNotifications.toggle()}
                disabled={systemNotifications.busy}
                trackColor={{ true: colors.primary, false: colors.inputBorderIdle }}
                accessibilityLabel={t('settings.notifications.systemToggle')}
              />
            }
          />
          {systemNotifications.enabled ? (
            <SettingsRow
              icon="send-outline"
              label={t('settings.notifications.sendTest')}
              onPress={handleSendTest}
              showDivider
            />
          ) : null}
        </SettingsSection>

        <SettingsSection title={t('settings.sections.account')}>
          <SettingsRow
            icon="trash-outline"
            label={t('settings.account.delete')}
            onPress={() => {
              setDeleteError(undefined);
              setDeleteVisible(true);
            }}
          />
        </SettingsSection>
      </ScrollView>
      <LanguagePickerModal
        visible={pickerVisible}
        current={preference}
        onSelect={handleSelect}
        onClose={() => setPickerVisible(false)}
      />
      <DeleteAccountModal
        visible={deleteVisible}
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => {
          if (!deleteBusy) setDeleteVisible(false);
        }}
        onConfirm={handleConfirmDelete}
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
