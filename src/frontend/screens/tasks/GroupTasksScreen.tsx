import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppState } from '../../application/AppStateContext';
import { selectTasksByGroup } from '../../application/selectors';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';

export const GroupTasksScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state } = useAppState();
  const { groupId } = route.params as { groupId: string };

  const group = state.entities.taskGroups[groupId];
  const tasks = useMemo(() => selectTasksByGroup(state, groupId), [state, groupId]);

  if (!group) {
    return (
      <View style={styles.root}>
        <TopBar title={t('tasks.tasks.listSection')} showBackButton showRightActions={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <AppText variant="label">{t('tasks.groups.notFound') || 'Group not found'}</AppText>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar title={group.name} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.listSection')}
            </AppText>
            <AppText variant="label">{group.name}</AppText>
            <AppText variant="caption" color="textSecondary">
              {t('tasks.groups.taskCount', { count: group.taskIds.length })}
            </AppText>
          </View>

          <Pressable
            onPress={() => navigation.navigate('CreateTask', { groupId })}
            style={({ pressed }) => [styles.actionBar, pressed && styles.actionBarPressed]}
            accessibilityRole="button"
          >
            <AppText variant="label" color="textOnPrimary">
              {t('tasks.tasks.addTaskAction')}
            </AppText>
            <Ionicons name="add" size={20} color={colors.textOnPrimary} />
          </Pressable>

          {tasks.length === 0 ? (
            <EmptyState
              icon="clipboard-outline"
              title={t('tasks.tasks.emptyTitle')}
              message={t('tasks.tasks.emptyMessage')}
            />
          ) : (
            <View style={styles.list}>
              {tasks.map(({ id, task }) => {
                const currentValue = state.entities.taskProgresses[task.progressId]?.value ?? 0;
                const isDone = currentValue >= task.goal;
                const isOneTime = task.kind === 'one_time' || task.goal === 1;

                return (
                  <Pressable
                    key={id}
                    onPress={() => navigation.navigate('EditTask', { groupId, taskId: id })}
                    style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                    accessibilityRole="button"
                    accessibilityLabel={task.name}
                  >
                    <View style={[styles.colorBar, { backgroundColor: task.params.color }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <AppText variant="label" color="textPrimary">
                          {task.name}
                        </AppText>
                        <View style={styles.pill}>
                          <AppText variant="caption" color="textPrimary">
                            {isDone ? t('tasks.tasks.statusDone') : t('tasks.tasks.statusActive')}
                          </AppText>
                        </View>
                      </View>
                      <View style={styles.cardMetaRow}>
                        <AppText variant="caption" color="textSecondary">
                          {isOneTime
                            ? t('tasks.tasks.taskMetaOneTime')
                            : t('tasks.tasks.taskMeta', { current: currentValue, goal: task.goal })}
                        </AppText>
                        {task.params.photoRequired ? (
                          <Ionicons name="camera-outline" size={14} color={colors.muted} />
                        ) : null}
                        {task.params.notifications ? (
                          <Ionicons name="notifications-outline" size={14} color={colors.muted} />
                        ) : null}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerCard: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
    gap: spacing.xs,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBarPressed: { transform: [{ scale: 0.995 }] },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
  },
  cardPressed: { transform: [{ scale: 0.99 }] },
  cardBody: { flex: 1, gap: spacing.xs },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
});
