import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { EmptyState } from '../../../components/common/EmptyState';
import { ActivityItem } from '../../social/components/ActivityItem';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppState } from '../../../application/AppStateContext';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { FeedItem } from '../../../services';

interface Props {
  feed: FeedItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

export const FriendsActivityFeed = ({ feed, loading, error, onRetry }: Props) => {
  const { t } = useTranslation();
  const { state } = useAppState();
  const navigation = useAppNavigation();

  const onPressFor = (item: FeedItem): (() => void) | undefined => {
    if (item.taskId && item.groupId && state.entities.tasks[item.taskId] && state.entities.taskGroups[item.groupId]) {
      const groupId = item.groupId;
      const taskId = item.taskId;
      return () => navigation.navigate('TaskDetail', { groupId, taskId });
    }
    if (item.groupId && state.entities.taskGroups[item.groupId]) {
      const groupId = item.groupId;
      return () => navigation.navigate('GroupTasks', { groupId });
    }
    return undefined;
  };

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.activity')}
      </AppText>

      {error ? (
        <Pressable onPress={onRetry} accessibilityRole="button" style={styles.errorRow}>
          <AppText variant="label" color="textPrimary">
            {t('home.feed.errorTitle')}
          </AppText>
          <AppText variant="caption" color="primary">
            {t('home.feed.retry')}
          </AppText>
        </Pressable>
      ) : loading && feed.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : feed.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('home.empty.noActivity')}
          message={t('home.empty.noActivityHint')}
        />
      ) : (
        <View>
          {feed.map((item, index) => {
            const onPress = onPressFor(item);
            const key = `${item.type}-${item.createdAt}-${index}`;
            return onPress ? (
              <Pressable key={key} onPress={onPress} style={({ pressed }) => [pressed && styles.rowPressed]}>
                <ActivityItem item={item} />
              </Pressable>
            ) : (
              <ActivityItem key={key} item={item} />
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  rowPressed: { opacity: 0.7 },
  loadingWrap: { paddingVertical: spacing.lg, alignItems: 'center' },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
});
