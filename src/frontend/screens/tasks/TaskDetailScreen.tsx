import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { OutlineButton } from '../../components/common/OutlineButton';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useRelativeTime } from '../../hooks/useRelativeTime';
import { useToast } from '../../context/ToastContext';
import { taskService } from '../../services';
import { USE_HTTP_SERVICES } from '../../services/http/config';
import { resolvePhotoUri } from '../../utils/resolvePhotoUri';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';

type ProgressEntryView = {
  entryId: string;
  value: number;
  message: string;
  photoUrl?: string;
  createdAt: string;
  commentIds: string[];
};

export const TaskDetailScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const { showToast } = useToast();
  const formatTime = useRelativeTime();
  const { groupId, taskId } = (route?.params ?? {}) as { groupId: string; taskId: string };

  const task = state.entities.tasks[taskId];
  const group = state.entities.taskGroups[groupId];
  const currentValue = task ? state.entities.taskProgresses[task.progressId]?.value ?? 0 : 0;
  const isOneTime = task?.kind === 'one_time' || task?.goal === 1;
  const isComplete = !!task && currentValue >= task.goal;
  const canEdit =
    !!group &&
    (group.ownerUserId === currentUserId || group.memberRoles[currentUserId] === 'admin');

  // Mock mode keeps the reducer as the source of truth, so the timeline is derived from state
  // there; HTTP mode fetches the persisted entries from the backend. Both stay consistent with
  // the header (which reads the reducer aggregate).
  const reducerEntries = useMemo<ProgressEntryView[]>(
    () =>
      Object.entries(state.entities.progressEntries)
        .filter(([, entry]) => entry.taskId === taskId)
        .map(([entryId, entry]) => ({
          entryId,
          value: entry.value,
          message: entry.message ?? '',
          ...(entry.photoUrl !== undefined ? { photoUrl: entry.photoUrl } : {}),
          createdAt: entry.createdAt ?? '',
          commentIds: entry.commentIds,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.entities.progressEntries, taskId],
  );

  const [fetchedEntries, setFetchedEntries] = useState<ProgressEntryView[]>([]);
  const [loading, setLoading] = useState(USE_HTTP_SERVICES);
  const [loadError, setLoadError] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProgressEntryView | null>(null);

  const refetch = useCallback(async () => {
    const result = await taskService.getProgressEntries(taskId);
    if (result.ok) {
      setFetchedEntries(result.value);
    } else {
      setLoadError(true);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      if (!USE_HTTP_SERVICES || !taskId) return undefined;
      let cancelled = false;
      setLoading(true);
      setLoadError(false);
      void (async () => {
        const result = await taskService.getProgressEntries(taskId);
        if (cancelled) return;
        if (result.ok) {
          setFetchedEntries(result.value);
        } else {
          setLoadError(true);
        }
        setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [taskId]),
  );

  const entries = USE_HTTP_SERVICES ? fetchedEntries : reducerEntries;

  const removeEntry = async (entry: ProgressEntryView) => {
    const res = await taskService.deleteProgressEntry({
      entryId: entry.entryId,
      authorUserId: currentUserId,
    });
    if (!res.ok) {
      showToast({
        message:
          res.error.code === 'forbidden'
            ? t('tasks.detail.deleteForbidden')
            : t('tasks.detail.deleteError'),
        variant: 'error',
      });
      return;
    }
    dispatch({ type: 'tasks/delete-progress-entry', entryId: entry.entryId, taskId, value: entry.value });
    if (USE_HTTP_SERVICES) await refetch();
    showToast({ message: t('tasks.detail.deleteSuccess'), variant: 'success' });
  };

  const handleConfirmDelete = () => {
    const entry = pendingDelete;
    setPendingDelete(null);
    if (entry) void removeEntry(entry);
  };

  const handleUndo = () => {
    // Undo completion = remove the most recent progress entry (per product decision). Falls back
    // to resetting the aggregate for entry-less completions (e.g. a bingo cell toggled done).
    if (entries.length > 0) {
      void removeEntry(entries[0]);
      return;
    }
    void (async () => {
      const res = await taskService.setProgress({ taskId, authorUserId: currentUserId, value: 0 });
      if (!res.ok) {
        showToast({ message: t('tasks.progress.errorMessage'), variant: 'error' });
        return;
      }
      dispatch({ type: 'tasks/set-progress', taskId, value: 0 });
      showToast({ message: t('tasks.detail.deleteSuccess'), variant: 'success' });
    })();
  };

  if (!task) {
    return (
      <View style={styles.root}>
        <TopBar title={t('tasks.tasks.selectedTaskSection')} showBackButton showRightActions={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <View style={styles.center}>
            <EmptyState icon="clipboard-outline" title={t('tasks.tasks.emptyTitle')} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const renderTimeline = () => {
    if (loading) return <LoadingIndicator />;
    if (loadError) {
      return <EmptyState icon="warning-outline" title={t('tasks.detail.loadError')} />;
    }
    if (entries.length === 0) {
      return <EmptyState icon="image-outline" title={t('tasks.progress.emptyTimeline')} />;
    }
    return (
      <View style={styles.timeline}>
        {entries.map((entry) => {
          const uri = resolvePhotoUri(entry.photoUrl);
          const valueLabel = isOneTime
            ? t('tasks.tasks.statusDone')
            : t('tasks.detail.entryValue', { value: entry.value });
          const timeLabel = entry.createdAt ? formatTime(entry.createdAt) : '';
          const metaLabel = timeLabel ? `${valueLabel} · ${timeLabel}` : valueLabel;
          const rowLabel = [metaLabel, entry.message, uri ? t('tasks.progress.photoAttached') : '']
            .filter(Boolean)
            .join(' · ');
          return (
            <View key={entry.entryId} style={styles.entryRow}>
              <View style={styles.entryMain} accessible accessibilityLabel={rowLabel}>
                {uri ? (
                  <Image source={{ uri }} style={styles.entryPhoto} resizeMode="cover" />
                ) : (
                  <View style={styles.entryIcon}>
                    <Ionicons name="trending-up-outline" size={18} color={colors.primary} />
                  </View>
                )}
                <View style={styles.entryBody}>
                  <AppText variant="caption" color="muted">
                    {metaLabel}
                  </AppText>
                  {entry.message ? (
                    <AppText variant="body" color="textPrimary">
                      {entry.message}
                    </AppText>
                  ) : null}
                </View>
              </View>
              <Pressable
                onPress={() => setPendingDelete(entry)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('tasks.detail.deleteEntry')}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
              >
                <Ionicons name="trash-outline" size={18} color={colors.muted} />
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <TopBar title={task.name} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.taskHeaderRow}>
              <View style={[styles.colorBar, { backgroundColor: task.params.color }]} />
              <AppText variant="label">{task.name}</AppText>
            </View>
            <AppText variant="caption" color="textSecondary">
              {isOneTime
                ? t('tasks.tasks.taskMetaOneTime')
                : t('tasks.tasks.taskMeta', { current: currentValue, goal: task.goal })}
            </AppText>
            {isComplete ? (
              <View style={styles.noticeRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <AppText variant="caption" color="textSecondary" style={styles.noticeText}>
                  {t('tasks.tasks.statusDone')}
                </AppText>
              </View>
            ) : task.params.photoRequired ? (
              <View style={styles.noticeRow}>
                <Ionicons name="camera-outline" size={16} color={colors.muted} />
                <AppText variant="caption" color="textSecondary" style={styles.noticeText}>
                  {t('tasks.progress.photoRequiredNotice')}
                </AppText>
              </View>
            ) : null}
          </View>

          {isComplete ? (
            <OutlineButton title={t('tasks.detail.undoComplete')} onPress={handleUndo} />
          ) : (
            <AppButton
              title={t('tasks.progress.addProgress')}
              onPress={() => navigation.navigate('AddProgress', { groupId, taskId })}
            />
          )}
          {canEdit ? (
            <OutlineButton
              title={t('tasks.tasks.editTask')}
              onPress={() => navigation.navigate('EditTask', { groupId, taskId })}
            />
          ) : null}

          <AppText variant="caption" color="muted" style={styles.sectionTitle}>
            {t('tasks.detail.historyTitle')}
          </AppText>
          {renderTimeline()}
        </ScrollView>
      </SafeAreaView>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title={t('tasks.detail.deleteEntryTitle')}
        message={t('tasks.detail.deleteEntryMessage')}
        confirmLabel={t('tasks.common.delete')}
        cancelLabel={t('tasks.common.cancel')}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  center: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
    gap: spacing.sm,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorBar: {
    width: 4,
    height: 26,
    borderRadius: 2,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noticeText: { flex: 1 },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  timeline: { gap: spacing.md },
  entryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.cardSurfaceTranslucent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.sm,
  },
  entryMain: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  entryPhoto: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  entryIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  entryBody: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  deletePressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
});

export default TaskDetailScreen;
