import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { StatTile } from './StatTile';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { UserStats } from '../../services';

interface Props {
  stats: UserStats;
  onFriendsPress?: () => void;
}

export const ProfileStats = ({ stats, onFriendsPress }: Props) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatTile value={stats.activeTasks} label={t('profile.stats.activeTasks')} />
        <StatTile value={stats.completedTasks} label={t('profile.stats.completedTasks')} />
        <StatTile
          value={stats.friendsCount}
          label={t('profile.stats.friends')}
          onPress={onFriendsPress}
        />
      </View>
      {stats.bestStreak > 0 ? (
        <View style={styles.streak}>
          <Ionicons name="flame" size={20} color={colors.primary} />
          <AppText variant="label" color="textPrimary">
            {t('profile.stats.bestStreak', { count: stats.bestStreak })}
          </AppText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
});
