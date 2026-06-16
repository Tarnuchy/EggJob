import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { EmptyState } from '../../components/common/EmptyState';
import { BingoGrid, type BingoCell } from '../../components/tasks/BingoGrid';
import { useAppState } from '../../application/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { taskService } from '../../services';
import { selectTasksByGroup } from '../../application/selectors';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { BingoSize } from '../../application/state';

export const GroupTasksScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const currentUserId = useCurrentUserId();
  const { groupId } = route.params as { groupId: string };

  const group = state.entities.taskGroups[groupId];
  const tasks = useMemo(() => selectTasksByGroup(state, groupId), [state, groupId]);

  const cells = useMemo<BingoCell[]>(
    () =>
      tasks.map(({ id, task }) => {
        const progressValue = state.entities.taskProgresses[task.progressId]?.value ?? 0;
        return task.name === ''
          ? null
          : { taskId: id, task, progress: progressValue, isDone: progressValue >= task.goal };
      }),
    [state.entities.taskProgresses, tasks],
  );

  if (!group) {
    return (
      <View style={styles.root}>
        <TopBar title={t('tasks.tasks.listSection')} showBackButton showRightActions={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <AppText variant="label">{t('tasks.groups.notFound')}</AppText>
        </SafeAreaView>
      </View>
    );
  }

  const isBingoGroup = group.isBingo;
  const size = Math.round(Math.sqrt(tasks.length)) as BingoSize;
  const canEdit =
    group.ownerUserId === currentUserId || group.memberRoles[currentUserId] === 'admin';

  const handleCopyCode = async () => {
    const code = group?.inviteCode;
    if (!code) return;
    await Clipboard.setStringAsync(code);
    showToast({ message: t('tasks.groups.inviteCodeCopied'), variant: 'success' });
  };

  const handleToggleDone = async (cell: NonNullable<BingoCell>) => {
    // Ukończenie taska wymagającego zdjęcia musi przejść przez bramkowany ekran AddProgress
    // (dołączenie zdjęcia). Odznaczanie (powrót do 0) nie wymaga zdjęcia i zostaje bezpośrednie.
    if (!cell.isDone && cell.task.params.photoRequired) {
      navigation.navigate('AddProgress', { groupId, taskId: cell.taskId });
      return;
    }
    // przełączenie ukończenia = ustawienie progresu na cel (done) albo 0 (undone)
    const target = cell.isDone ? 0 : cell.task.goal;
    const res = await taskService.setProgress({
      taskId: cell.taskId,
      authorUserId: currentUserId,
      value: target,
    });
    if (!res.ok) {
      showToast({ message: t('tasks.progress.errorMessage'), variant: 'error' });
      return;
    }
    const result = dispatch({ type: 'tasks/set-progress', taskId: cell.taskId, value: target });
    if (!result.ok) {
      showToast({ message: t('tasks.progress.errorMessage'), variant: 'error' });
    }
  };

  const handleCellPress = (index: number) => {
    const cell = cells[index];
    // wypełniona komórka: tap przełącza ukończenie (dostępne dla wszystkich członków)
    if (cell) {
      handleToggleDone(cell);
      return;
    }
    // pusty placeholder: tap otwiera edycję, by nazwać task (owner/admin)
    if (canEdit) {
      const placeholderTask = tasks[index];
      if (placeholderTask) {
        navigation.navigate('EditTask', { groupId, taskId: placeholderTask.id });
      }
    }
  };

  const handleCellLongPress = (index: number) => {
    const cell = cells[index];
    // wypełniona komórka: długie przytrzymanie otwiera szczegóły + historię (dostępne dla wszystkich)
    if (cell) {
      navigation.navigate('TaskDetail', { groupId, taskId: cell.taskId });
      return;
    }
    // pusty placeholder: edycja, by nazwać task — tylko owner/admin
    if (!canEdit) return;
    const taskId = tasks[index]?.id;
    if (taskId) {
      navigation.navigate('EditTask', { groupId, taskId });
    }
  };

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
            <View style={styles.codeRow}>
              <AppText
                variant="caption"
                color="muted"
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.codeText}
              >
                {t('tasks.groups.inviteCodeSection')}: {group.inviteCode || '-'}
              </AppText>
              <Pressable
                onPress={handleCopyCode}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('tasks.groups.inviteCodeCopy')}
              >
                <Ionicons name="copy-outline" size={14} color={colors.muted} />
              </Pressable>
            </View>
            <AppText variant="caption" color="textSecondary">
              {t('tasks.groups.taskCount', { count: group.taskIds.length })}
            </AppText>
          </View>

          {!isBingoGroup ? (
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
          ) : null}

          {isBingoGroup ? (
            <BingoGrid
              cells={cells}
              size={size}
              canEdit={canEdit}
              onCellPress={handleCellPress}
              onCellLongPress={handleCellLongPress}
              filledCellHint={t('tasks.groups.bingoOpenDetailsHint')}
            />
          ) : tasks.length === 0 ? (
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
                    onPress={() => navigation.navigate('TaskDetail', { groupId, taskId: id })}
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
                    {!isDone ? (
                      <Pressable
                        onPress={() => navigation.navigate('AddProgress', { groupId, taskId: id })}
                        hitSlop={8}
                        style={({ pressed }) => pressed && styles.addProgressPressed}
                        accessibilityRole="button"
                        accessibilityLabel={t('tasks.tasks.addProgressAction')}
                      >
                        <Ionicons name="add-circle-outline" size={22} color={colors.muted} />
                      </Pressable>
                    ) : null}
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  codeText: {
    flexShrink: 1,
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
    backgroundColor: colors.cardSurfaceTranslucent,
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
  addProgressPressed: { opacity: 0.7 },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
});
