import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { useEditProfileForm } from './hooks/useEditProfileForm';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';

export const EditProfileScreen = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const form = useEditProfileForm({ onSuccess: () => navigation.goBack() });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('topBar.back')}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </Pressable>
        <AppText variant="h2" color="textPrimary">
          {t('profile.edit.title')}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {form.loading ? (
        <LoadingIndicator fullscreen />
      ) : form.loadError ? (
        <View style={styles.center}>
          <EmptyState icon="warning-outline" title={t('profile.loadError')} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppInput
            label={t('profile.edit.usernameLabel')}
            placeholder={t('profile.edit.usernamePlaceholder')}
            value={form.username}
            onChangeText={form.handleUsernameChange}
            onBlur={form.handleUsernameBlur}
            touched={form.usernameTouched}
            error={form.usernameError}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppInput
            label={t('profile.edit.photoLabel')}
            placeholder={t('profile.edit.photoPlaceholder')}
            value={form.photoUrl}
            onChangeText={form.handlePhotoUrlChange}
            onBlur={form.handlePhotoUrlBlur}
            touched={form.photoTouched}
            error={form.photoError}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <AppText variant="caption" color="muted" style={styles.hint}>
            {t('profile.edit.photoHint')}
          </AppText>

          {form.formError ? (
            <AppText variant="caption" color="danger" style={styles.formError}>
              {form.formError}
            </AppText>
          ) : null}

          <AppButton
            title={t('profile.edit.save')}
            onPress={form.handleSubmit}
            isLoading={form.isSaving}
            shakeCount={form.shakeCount}
            style={styles.save}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING_H,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  headerSpacer: {
    width: 40,
  },
  center: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hint: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  formError: {
    marginBottom: spacing.md,
  },
  save: {
    marginTop: spacing.sm,
  },
});
