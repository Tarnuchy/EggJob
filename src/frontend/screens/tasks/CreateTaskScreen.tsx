import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { taskService } from '../../services';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { TaskColor } from '../../application/state';

const TASK_COLORS: Array<{ id: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple'; value: TaskColor }> = [
  { id: 'red', value: '#DC2626' },
  { id: 'orange', value: '#EA580C' },
  { id: 'yellow', value: '#CA8A04' },
  { id: 'green', value: '#16A34A' },
  { id: 'blue', value: '#2563EB' },
  { id: 'purple', value: '#7C3AED' },
];

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const CreateTaskScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { dispatch, state } = useAppState();
  const currentUserId = useCurrentUserId();
  const { groupId } = route.params as { groupId: string };

  const [taskName, setTaskName] = useState('');
  const [taskGoal, setTaskGoal] = useState('1');
  const [taskColor, setTaskColor] = useState<TaskColor>(TASK_COLORS[4].value);
  const [taskPhotoRequired, setTaskPhotoRequired] = useState(false);
  const [taskNotifications, setTaskNotifications] = useState(true);

  const group = state.entities.taskGroups[groupId];

  const handleCreateTask = async () => {
    const trimmedName = taskName.trim();
    const parsedGoal = Number(taskGoal);
    if (!trimmedName || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert(t('tasks.tasks.validationTitle'), t('tasks.tasks.validationMessage'));
      return;
    }

    const taskId = generateId('tsk');
    const progressId = generateId('prg');
    const serviceResult = await taskService.createTask({
      taskId,
      groupId,
      progressId,
      name: trimmedName,
      goal: parsedGoal,
      status: 'active',
      kind: 'endless',
      params: {
        color: taskColor,
        photoRequired: taskPhotoRequired,
        notifications: taskNotifications,
      },
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.tasks.createErrorTitle'), t('tasks.tasks.createErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'tasks/create',
      taskId,
      groupId,
      progressId,
      name: trimmedName,
      goal: parsedGoal,
      params: {
        color: taskColor,
        photoRequired: taskPhotoRequired,
        notifications: taskNotifications,
      },
    });

    if (!result.ok) {
      Alert.alert(t('tasks.tasks.createErrorTitle'), t('tasks.tasks.createErrorMessage'));
      return;
    }

    Alert.alert(t('tasks.tasks.createSuccessTitle'), t('tasks.tasks.createSuccessMessage'));
    navigation.goBack();
  };

  if (!group) {
    return (
      <View style={styles.root}>
        <TopBar title={t('tasks.tasks.createTask')} showBackButton showRightActions={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <AppText variant="label">{t('tasks.groups.notFound') || 'Group not found'}</AppText>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <TopBar title={t('tasks.tasks.createTask')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.groupPickerSection')}
            </AppText>
            <AppText variant="label">{group.name}</AppText>
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.createSection')}
            </AppText>
            <AppInput
              value={taskName}
              onChangeText={setTaskName}
              placeholder={t('tasks.tasks.namePlaceholder')}
              style={styles.tightInput}
            />
            <AppInput
              value={taskGoal}
              onChangeText={setTaskGoal}
              keyboardType="numeric"
              placeholder={t('tasks.tasks.goalPlaceholder')}
              style={styles.tightInput}
            />
            <View style={styles.inlineControlsRow}>
              {TASK_COLORS.map((colorOption) => (
                <Pressable
                  key={colorOption.id}
                  style={({ pressed }) => [
                    styles.chip,
                    taskColor === colorOption.value && styles.chipActive,
                    pressed && styles.chipPressed,
                  ]}
                  onPress={() => setTaskColor(colorOption.value)}
                >
                  <View style={[styles.colorDot, { backgroundColor: colorOption.value }]} />
                  <AppText
                    variant="caption"
                    color={taskColor === colorOption.value ? 'textOnPrimary' : 'textPrimary'}
                  >
                    {t(`tasks.tasks.colors.${colorOption.id}`)}
                  </AppText>
                </Pressable>
              ))}
            </View>
            <View style={styles.inlineControlsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  taskPhotoRequired && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => setTaskPhotoRequired((value) => !value)}
              >
                <AppText
                  variant="caption"
                  color={taskPhotoRequired ? 'textOnPrimary' : 'textPrimary'}
                >
                  {t('tasks.tasks.photoRequired')}
                </AppText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.chip,
                  taskNotifications && styles.chipActive,
                  pressed && styles.chipPressed,
                ]}
                onPress={() => setTaskNotifications((value) => !value)}
              >
                <AppText
                  variant="caption"
                  color={taskNotifications ? 'textOnPrimary' : 'textPrimary'}
                >
                  {t('tasks.tasks.notifications')}
                </AppText>
              </Pressable>
            </View>
            <View style={styles.inlineActionButtons}>
              <AppButton
                title={t('tasks.tasks.createTask')}
                onPress={handleCreateTask}
                disabled={!taskName.trim() || !currentUserId}
              />
              <AppButton title={t('tasks.common.cancel')} onPress={() => navigation.goBack()} />
            </View>
          </View>
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
  card: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  tightInput: {
    marginBottom: spacing.xs,
  },
  inlineControlsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.inputBorderIdle,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  inlineActionButtons: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});