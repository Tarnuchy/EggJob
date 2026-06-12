import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar } from '../../components/common/Avatar';
import { AppText } from '../../components/common/AppText';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ProfileStats } from '../../components/common/ProfileStats';
import { SettingsRow } from '../../components/settings';
import { profileService } from '../../services';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useUserStats } from '../../hooks/useUserStats';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { usePanelContext } from '../../navigation/PanelContext';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const { setOpenPanel } = usePanelContext();
  const currentUserId = useCurrentUserId();
  const { stats, loading: statsLoading } = useUserStats(currentUserId);

  const [username, setUsername] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(false);
      void (async () => {
        const result = await profileService.getProfile(currentUserId);
        if (cancelled) return;
        if (result.ok) {
          setUsername(result.value.username);
          setPhotoUrl(result.value.photoUrl);
        } else {
          setUsername(null);
          setError(true);
        }
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [currentUserId]),
  );

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        {loading ? (
          <LoadingIndicator fullscreen />
        ) : error || username === null ? (
          <View style={styles.center}>
            <EmptyState icon="warning-outline" title={t('profile.loadError')} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Avatar photoUrl={photoUrl} size={120} accessibilityLabel={username} />
              <AppText variant="h1" color="textPrimary" style={styles.username}>
                {username}
              </AppText>
            </View>

            {stats ? (
              <ProfileStats stats={stats} />
            ) : statsLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : null}

            <View style={styles.card}>
              <SettingsRow
                icon="create-outline"
                label={t('profile.actions.edit')}
                onPress={() => navigation.navigate('EditProfile')}
              />
              <SettingsRow
                icon="settings-outline"
                label={t('profile.actions.settings')}
                onPress={() => setOpenPanel('settings')}
                showDivider
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  username: {
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    overflow: 'hidden',
  },
});
