import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProfileStats } from '../../../components/common/ProfileStats';
import { StatTile } from '../../../components/common/StatTile';
import { spacing } from '../../../theme/spacing';
import type { UserStats } from '../../../services';

interface Props {
  stats: UserStats | null;
  onFriendsPress: () => void;
}

export const StatsSnapshot = ({ stats, onFriendsPress }: Props) => {
  const { t } = useTranslation();

  if (stats) {
    return <ProfileStats stats={stats} onFriendsPress={onFriendsPress} />;
  }

  // loading / error fallback: ProfileStats requires a non-null UserStats
  return (
    <View style={styles.row}>
      <StatTile value="—" label={t('profile.stats.activeTasks')} />
      <StatTile value="—" label={t('profile.stats.completedTasks')} />
      <StatTile value="—" label={t('profile.stats.friends')} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});
