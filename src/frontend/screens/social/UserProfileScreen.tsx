import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Avatar } from '../../components/common/Avatar';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { OutlineButton } from '../../components/common/OutlineButton';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ProfileStats } from '../../components/common/ProfileStats';
import { ActivityItem } from './components/ActivityItem';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useUserStats } from '../../hooks/useUserStats';
import { useFriendRelationship } from './hooks/useFriendRelationship';
import { useFriendActivity } from './hooks/useFriendActivity';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import type { RootStackParamList } from '../../navigation/types';

type Route = RouteProp<RootStackParamList, 'UserProfile'>;

export const UserProfileScreen = () => {
  const navigation = useAppNavigation();
  const route = useRoute<Route>();
  const { t } = useTranslation();
  const { userId } = route.params;

  const { profile, loading: profileLoading, error: profileError } = useUserProfile(userId);
  const { stats } = useUserStats(userId);
  const relationship = useFriendRelationship(userId);
  const { items: activity, loading: activityLoading } = useFriendActivity(userId);

  const renderRelationship = () => {
    const rel = relationship.relationship;
    if (relationship.loading || !rel || rel.status === 'self') {
      return null;
    }
    const { busy } = relationship;

    if (rel.status === 'none') {
      return (
        <AppButton
          title={t('friends.profile.actions.add')}
          onPress={() => void relationship.addFriend()}
          isLoading={busy}
        />
      );
    }

    if (rel.status === 'friend') {
      return (
        <View style={styles.relationship}>
          <AppText variant="caption" color="muted" style={styles.relationshipStatus}>
            {t('friends.profile.status.friend')}
          </AppText>
          <OutlineButton
            title={t('friends.profile.actions.remove')}
            onPress={() => void relationship.removeFriend()}
            isLoading={busy}
          />
        </View>
      );
    }

    if (rel.status === 'invite-sent') {
      return (
        <View style={styles.relationship}>
          <AppText variant="caption" color="muted" style={styles.relationshipStatus}>
            {t('friends.profile.status.inviteSent')}
          </AppText>
          <OutlineButton
            title={t('friends.profile.actions.cancel')}
            onPress={() => void relationship.cancelInvite()}
            isLoading={busy}
          />
        </View>
      );
    }

    return (
      <View style={styles.relationship}>
        <AppText variant="caption" color="muted" style={styles.relationshipStatus}>
          {t('friends.profile.status.inviteReceived')}
        </AppText>
        <View style={styles.actionRow}>
          <View style={styles.actionHalf}>
            <AppButton
              title={t('friends.profile.actions.accept')}
              onPress={() => void relationship.acceptInvite()}
              isLoading={busy}
            />
          </View>
          <View style={styles.actionHalf}>
            <OutlineButton
              title={t('friends.profile.actions.reject')}
              onPress={() => void relationship.rejectInvite()}
              disabled={busy}
            />
          </View>
        </View>
      </View>
    );
  };

  const isFriend = relationship.relationship?.status === 'friend';
  const showActivity = activity.length > 0 || (isFriend && !activityLoading);

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
          {t('friends.profile.title')}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {profileLoading ? (
        <LoadingIndicator fullscreen />
      ) : profileError || !profile ? (
        <View style={styles.center}>
          <EmptyState icon="warning-outline" title={t('profile.loadError')} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <Avatar photoUrl={profile.photoUrl} size={120} accessibilityLabel={profile.username} />
            <AppText variant="h1" color="textPrimary" style={styles.username}>
              {profile.username}
            </AppText>
          </View>

          {stats ? <ProfileStats stats={stats} /> : null}

          {renderRelationship()}

          {showActivity ? (
            <View style={styles.activitySection}>
              <AppText variant="label" color="textSecondary" style={styles.activityTitle}>
                {t('friends.profile.activity.title')}
              </AppText>
              {activity.length > 0 ? (
                <View style={styles.activityCard}>
                  {activity.map((item, index) => (
                    <View
                      key={`${item.type}-${item.createdAt}-${index}`}
                      style={index > 0 ? styles.activityDivider : undefined}
                    >
                      <ActivityItem item={item} />
                    </View>
                  ))}
                </View>
              ) : (
                <AppText variant="body" color="muted">
                  {t('friends.profile.activity.empty')}
                </AppText>
              )}
            </View>
          ) : null}
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
    gap: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  username: {
    textAlign: 'center',
  },
  relationship: {
    gap: spacing.sm,
  },
  relationshipStatus: {
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionHalf: {
    flex: 1,
  },
  activitySection: {
    gap: spacing.sm,
  },
  activityTitle: {
    letterSpacing: 0.8,
  },
  activityCard: {
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  activityDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.dividerLine,
  },
});
