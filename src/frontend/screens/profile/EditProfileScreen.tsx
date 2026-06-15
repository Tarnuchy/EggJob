import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { OutlineButton } from '../../components/common/OutlineButton';
import { Avatar } from '../../components/common/Avatar';
import { PhotoSourceSheet } from '../../components/common/PhotoSourceSheet';
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
          <View style={styles.photoSection}>
            <Avatar photoUrl={form.photoUrl} size={120} accessibilityLabel={form.username} />
            <AppText variant="caption" color="muted" style={styles.photoLabel}>
              {t('profile.edit.photoSectionLabel')}
            </AppText>
            <OutlineButton
              title={form.uploading ? t('photo.uploading') : t('photo.change')}
              onPress={form.openPhotoSheet}
              isLoading={form.uploading}
              disabled={form.isSaving}
              style={styles.changePhoto}
            />
            {form.photoUrl ? (
              <Pressable
                onPress={form.handleRemovePhoto}
                disabled={form.uploading || form.isSaving}
                accessibilityRole="button"
                accessibilityLabel={t('photo.remove')}
                hitSlop={8}
                style={styles.removePhoto}
              >
                <AppText variant="caption" color="danger">
                  {t('photo.remove')}
                </AppText>
              </Pressable>
            ) : null}
          </View>

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

          {form.formError ? (
            <AppText variant="caption" color="danger" style={styles.formError}>
              {form.formError}
            </AppText>
          ) : null}

          <AppButton
            title={t('profile.edit.save')}
            onPress={form.handleSubmit}
            isLoading={form.isSaving}
            disabled={form.uploading}
            shakeCount={form.shakeCount}
            style={styles.save}
          />
        </ScrollView>
      )}

      <PhotoSourceSheet
        visible={form.sheetVisible}
        onSelect={form.handleSelectSource}
        onCancel={form.closePhotoSheet}
      />
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
  photoSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  changePhoto: {
    marginTop: spacing.xs,
  },
  removePhoto: {
    paddingVertical: spacing.xs,
  },
  formError: {
    marginBottom: spacing.md,
  },
  save: {
    marginTop: spacing.sm,
  },
});
