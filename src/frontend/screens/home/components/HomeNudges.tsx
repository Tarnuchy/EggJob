import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useNotifications } from '../../../application/NotificationsContext';
import { usePanelContext } from '../../../navigation/PanelContext';
import { useAppNavigation } from '../../../hooks/useAppNavigation';

interface Props {
  pendingInvitations: number;
}

interface NudgeRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  text: string;
  onPress: () => void;
  accessibilityLabel: string;
}

const NudgeRow = ({ icon, text, onPress, accessibilityLabel }: NudgeRowProps) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.nudge, pressed && styles.nudgePressed]}
  >
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <AppText variant="label" color="textPrimary" style={styles.text} numberOfLines={2}>
      {text}
    </AppText>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </Pressable>
);

export const HomeNudges = ({ pendingInvitations }: Props) => {
  const { t } = useTranslation();
  const { hasUnread, notifications } = useNotifications();
  const { setOpenPanel } = usePanelContext();
  const navigation = useAppNavigation();

  const unreadCount = notifications.filter((n) => n.active).length;

  if (!hasUnread && pendingInvitations <= 0) return null;

  return (
    <View style={styles.container}>
      {hasUnread ? (
        <NudgeRow
          icon="notifications-outline"
          text={t('home.nudges.notifications', { count: unreadCount })}
          accessibilityLabel={t('home.nudges.notifications', { count: unreadCount })}
          onPress={() => setOpenPanel('notifications')}
        />
      ) : null}
      {pendingInvitations > 0 ? (
        <NudgeRow
          icon="person-add-outline"
          text={t('home.nudges.friendRequests', { count: pendingInvitations })}
          accessibilityLabel={t('home.nudges.friendRequests', { count: pendingInvitations })}
          onPress={() => navigation.navigate('Main', { screen: 'Friends', params: { initialTab: 'invitations' } })}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  nudgePressed: { opacity: 0.85 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 63, 34, 0.12)',
  },
  text: { flex: 1 },
});
