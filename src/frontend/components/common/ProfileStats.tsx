import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatTile } from './StatTile';
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
});
