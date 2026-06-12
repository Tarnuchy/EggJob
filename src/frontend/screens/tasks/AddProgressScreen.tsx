import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useToast } from '../../context/ToastContext';
import { selectTaskGroupsByMember, selectTasksByGroup } from '../../application/selectors';
import { taskService } from '../../services';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const AddProgressScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const { showToast } = useToast();
  const initialParams = (route?.params ?? {}) as { groupId?: string; taskId?: string };

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialParams.groupId ?? null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialParams.taskId ?? null,
  );
  const [progressValue, setProgressValue] = useState('1');
  const [progressNote, setProgressNote] = useState('');

  const memberGroups = useMemo(
    () => selectTaskGroupsByMember(state, currentUserId),
    [state, currentUserId],
  );
  const groupTasks = useMemo(
    () =>
      selectedGroupId
        ? selectTasksByGroup(state, selectedGroupId).filter(({ task }) => task.name !== '')
        : [],
    [state, selectedGroupId],
  );

  const selectedGroup = selectedGroupId ? state.entities.taskGroups[selectedGroupId] : null;
  const selectedTask = selectedTaskId ? state.entities.tasks[selectedTaskId] : null;
  const isOneTime = selectedTask?.kind === 'one_time' || selectedTask?.goal === 1;

  const submitProgress = async (value: number) => {
    if (!selectedTaskId || !selectedTask) return;
    if (Number.isNaN(value) || value <= 0) {
      showToast({ message: t('tasks.progress.validationMessage'), variant: 'error' });
      return;
    }

    const currentValue = state.entities.taskProgresses[selectedTask.progressId]?.value ?? 0;
    if (currentValue >= selectedTask.goal) {
      showToast({ message: t('tasks.progress.completedMessage'), variant: 'info' });
      return;
    }

    const entryId = generateId('entry');
    const note = progressNote.trim();

    const serviceResult = await taskService.addProgress({
      entryId,
      taskId: selectedTaskId,
      authorUserId: currentUserId,
      value,
      note,
    });
    if (!serviceResult.ok) {
      showToast({ message: t('tasks.progress.errorMessage'), variant: 'error' });
      return;
    }

    const result = dispatch({
      type: 'tasks/add-progress',
      entryId,
      taskId: selectedTaskId,
      authorUserId: currentUserId,
      value,
      note: note || undefined,
    });
    if (!result.ok) {
      showToast({ message: t('tasks.progress.errorMessage'), variant: 'error' });
      return;
    }

    showToast({ message: t('tasks.progress.successMessage'), variant: 'success' });
    navigation.goBack();
  };

  const renderGroupStep = () => (
    <>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="caption" color="muted" style={styles.sectionTitle}>
          {t('tasks.progress.pickGroupStep')}
        </AppText>
      </View>
      {memberGroups.length === 0 ? (
        <EmptyState
          icon="albums-outline"
          title={t('tasks.groups.emptyTitle')}
          message={t('tasks.groups.emptyMessage')}
        />
      ) : (
        <View style={styles.list}>
          {memberGroups.map(({ id, group }) => (
            <Pressable
              key={id}
              onPress={() => {
                setSelectedGroupId(id);
                setSelectedTaskId(null);
              }}
              style={({ pressed }) => [styles.rowCard, pressed && styles.rowCardPressed]}
              accessibilityRole="button"
              accessibilityLabel={group.name}
            >
              <View style={styles.rowCardBody}>
                <AppText variant="label">{group.name}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('tasks.groups.taskCount', { count: group.taskIds.length })}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      )}
    </>
  );

  const renderTaskStep = () => (
    <>
      <Pressable
        onPress={() => setSelectedGroupId(null)}
        style={({ pressed }) => [styles.backRow, pressed && styles.rowCardPressed]}
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={16} color={colors.muted} />
        <AppText variant="caption" color="textSecondary">
          {selectedGroup?.name}
        </AppText>
      </Pressable>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="caption" color="muted" style={styles.sectionTitle}>
          {t('tasks.progress.pickTaskStep')}
        </AppText>
      </View>
      {groupTasks.length === 0 ? (
        <EmptyState
          icon="clipboard-outline"
          title={t('tasks.tasks.emptyTitle')}
          message={t('tasks.progress.noTasksInGroup')}
        />
      ) : (
        <View style={styles.list}>
          {groupTasks.map(({ id, task }) => {
            const currentValue = state.entities.taskProgresses[task.progressId]?.value ?? 0;
            const isDone = currentValue >= task.goal;
            return (
              <Pressable
                key={id}
                onPress={() => setSelectedTaskId(id)}
                style={({ pressed }) => [styles.rowCard, pressed && styles.rowCardPressed]}
                accessibilityRole="button"
                accessibilityLabel={task.name}
              >
                <View style={[styles.colorBar, { backgroundColor: task.params.color }]} />
                <View style={styles.rowCardBody}>
                  <AppText variant="label">{task.name}</AppText>
                  <AppText variant="caption" color="textSecondary">
                    {task.kind === 'one_time' || task.goal === 1
                      ? t('tasks.tasks.taskMetaOneTime')
                      : t('tasks.tasks.taskMeta', { current: currentValue, goal: task.goal })}
                  </AppText>
                </View>
                <View style={styles.pill}>
                  <AppText variant="caption" color="textPrimary">
                    {isDone ? t('tasks.tasks.statusDone') : t('tasks.tasks.statusActive')}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );

  const renderProgressStep = () => {
    if (!selectedTask) return null;
    const currentValue = state.entities.taskProgresses[selectedTask.progressId]?.value ?? 0;
    return (
      <>
        <Pressable
          onPress={() => setSelectedTaskId(null)}
          style={({ pressed }) => [styles.backRow, pressed && styles.rowCardPressed]}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={16} color={colors.muted} />
          <AppText variant="caption" color="textSecondary">
            {t('tasks.progress.pickTaskStep')}
          </AppText>
        </Pressable>
        <View style={styles.card}>
          <AppText variant="caption" color="muted" style={styles.sectionTitle}>
            {t('tasks.progress.section')}
          </AppText>
          <View style={styles.taskHeaderRow}>
            <View style={[styles.colorBar, { backgroundColor: selectedTask.params.color }]} />
            <AppText variant="label">{selectedTask.name}</AppText>
          </View>
          <AppText variant="caption" color="textSecondary">
            {isOneTime
              ? t('tasks.tasks.taskMetaOneTime')
              : t('tasks.tasks.taskMeta', { current: currentValue, goal: selectedTask.goal })}
          </AppText>
          {selectedTask.params.photoRequired ? (
            <View style={styles.noticeRow}>
              <Ionicons name="camera-outline" size={16} color={colors.muted} />
              <AppText variant="caption" color="textSecondary" style={styles.noticeText}>
                {t('tasks.progress.photoRequiredNotice')}
              </AppText>
            </View>
          ) : null}
          {!isOneTime ? (
            <AppInput
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
              placeholder={t('tasks.progress.valuePlaceholder')}
            />
          ) : null}
          <AppInput
            value={progressNote}
            onChangeText={setProgressNote}
            placeholder={t('tasks.progress.notePlaceholder')}
          />
          <AppButton
            title={isOneTime ? t('tasks.progress.markDone') : t('tasks.progress.addProgress')}
            onPress={() => submitProgress(isOneTime ? 1 : Number(progressValue))}
            disabled={!isOneTime && !progressValue.trim()}
          />
        </View>
      </>
    );
  };

  return (
    <View style={styles.root}>
      <TopBar title={t('tasks.progress.addProgress')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedGroupId ? renderGroupStep() : !selectedTaskId ? renderTaskStep() : renderProgressStep()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  sectionHeaderRow: { marginBottom: 0 },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  list: { gap: spacing.md },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  rowCardPressed: { opacity: 0.9 },
  rowCardBody: { flex: 1, gap: 2 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  card: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
    gap: spacing.md,
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
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  noticeText: { flex: 1 },
});

export default AddProgressScreen;
