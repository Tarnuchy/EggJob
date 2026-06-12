import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import { AppText } from '../../components/common/AppText';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { SegmentedControl, type SegmentedControlOption } from '../../components/common/SegmentedControl';
import { useAppState } from '../../application/AppStateContext';
import { taskService } from '../../services';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { TaskColor, TaskKind } from '../../application/state';
import { findTaskColorId, TASK_COLORS } from './taskColors';

export const EditTaskScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const { groupId, taskId } = route.params as { groupId: string; taskId: string };

  const group = state.entities.taskGroups[groupId];
  const task = state.entities.tasks[taskId];

  const [taskName, setTaskName] = useState(task?.name ?? '');
  const [taskKind, setTaskKind] = useState<TaskKind>(task?.kind ?? (task && task.goal > 1 ? 'endless' : 'one_time'));
  const [taskGoal, setTaskGoal] = useState(String(task?.goal ?? 1));
  const [taskColor, setTaskColor] = useState<TaskColor>(task?.params.color ?? TASK_COLORS[4].value);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [taskPhotoRequired, setTaskPhotoRequired] = useState(task?.params.photoRequired ?? false);
  const [taskNotifications, setTaskNotifications] = useState(task?.params.notifications ?? true);

  const selectedColorId = findTaskColorId(taskColor);

  const taskKindOptions = useMemo(
    () =>
      [
        { value: 'one_time', label: t('tasks.tasks.taskTypeOneTime') },
        { value: 'endless', label: t('tasks.tasks.taskTypeProgress') },
      ] as const satisfies ReadonlyArray<SegmentedControlOption<TaskKind>>,
    [t],
  );

  if (!group || !task) {
    return (
      <View style={styles.root}>
        <TopBar title={t('tasks.tasks.editTask')} showBackButton showRightActions={false} />
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
          <View style={styles.content}>
            <AppText variant="label">{t('tasks.groups.notFound')}</AppText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const handleSave = async () => {
    const trimmedName = taskName.trim();
    const parsedGoal = taskKind === 'one_time' ? 1 : Number(taskGoal);
    if (!trimmedName || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert(t('tasks.tasks.validationTitle'), t('tasks.tasks.validationMessage'));
      return;
    }

    const params = {
      color: taskColor,
      photoRequired: taskPhotoRequired,
      notifications: taskNotifications,
    };

    const serviceResult = await taskService.editTask(taskId, {
      name: trimmedName,
      goal: parsedGoal,
      params,
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.tasks.editErrorTitle'), t('tasks.tasks.editErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'tasks/edit',
      taskId,
      name: trimmedName,
      goal: parsedGoal,
      kind: taskKind,
      params,
    });
    if (!result.ok) {
      Alert.alert(t('tasks.tasks.editErrorTitle'), t('tasks.tasks.editErrorMessage'));
      return;
    }

    Alert.alert(t('tasks.tasks.editSuccessTitle'), t('tasks.tasks.editSuccessMessage'));
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(t('tasks.tasks.deleteTitle'), t('tasks.tasks.deleteMessage'), [
      { text: t('tasks.common.cancel'), style: 'cancel' },
      {
        text: t('tasks.common.delete'),
        style: 'destructive',
        onPress: async () => {
          const serviceResult = await taskService.deleteTask(taskId);
          if (!serviceResult.ok) {
            Alert.alert(t('tasks.tasks.deleteErrorTitle'), t('tasks.tasks.deleteErrorMessage'));
            return;
          }
          const result = dispatch({ type: 'tasks/delete', taskId });
          if (!result.ok) {
            Alert.alert(t('tasks.tasks.deleteErrorTitle'), t('tasks.tasks.deleteErrorMessage'));
            return;
          }
          Alert.alert(t('tasks.tasks.deleteSuccessTitle'), t('tasks.tasks.deleteSuccessMessage'));
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <TopBar title={t('tasks.tasks.editTask')} showBackButton showRightActions={false} />
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
              {t('tasks.groups.basicInfoSection')}
            </AppText>
            <AppInput
              value={taskName}
              onChangeText={setTaskName}
              placeholder={t('tasks.tasks.namePlaceholder')}
            />
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.taskTypeSection')}
            </AppText>
            <SegmentedControl<TaskKind>
              options={taskKindOptions}
              value={taskKind}
              onChange={setTaskKind}
              accessibilityLabel={t('tasks.tasks.taskTypeSection')}
            />
            <AppText variant="caption" color="textSecondary">
              {taskKind === 'one_time'
                ? t('tasks.tasks.taskTypeOneTimeDescription')
                : t('tasks.tasks.taskTypeProgressDescription')}
            </AppText>
            {taskKind === 'endless' ? (
              <AppInput
                value={taskGoal}
                onChangeText={setTaskGoal}
                keyboardType="numeric"
                placeholder={t('tasks.tasks.goalPlaceholder')}
              />
            ) : null}
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.colorSection')}
            </AppText>
            <Pressable
              onPress={() => setColorPickerOpen((value) => !value)}
              style={({ pressed }) => [styles.dropdownTrigger, pressed && styles.dropdownTriggerPressed]}
              accessibilityRole="button"
              accessibilityState={{ expanded: colorPickerOpen }}
            >
              <View style={styles.colorTriggerLeft}>
                <View style={[styles.colorBar, { backgroundColor: taskColor }]} />
                <AppText variant="label">
                  {selectedColorId ? t(`tasks.tasks.colors.${selectedColorId}`) : t('tasks.tasks.chooseColor')}
                </AppText>
              </View>
              <Ionicons
                name={colorPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.muted}
              />
            </Pressable>
            {colorPickerOpen ? (
              <View style={styles.dropdownList}>
                {TASK_COLORS.map((colorOption) => (
                  <Pressable
                    key={colorOption.id}
                    onPress={() => {
                      setTaskColor(colorOption.value);
                      setColorPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownRow,
                      styles.colorRow,
                      taskColor === colorOption.value && styles.dropdownRowActive,
                      pressed && styles.dropdownRowPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <View style={[styles.colorBar, { backgroundColor: colorOption.value }]} />
                    <AppText
                      variant="caption"
                      color={taskColor === colorOption.value ? 'textOnPrimary' : 'textPrimary'}
                    >
                      {t(`tasks.tasks.colors.${colorOption.id}`)}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.paramsSection')}
            </AppText>
            <Pressable
              onPress={() => setTaskPhotoRequired((value) => !value)}
              style={({ pressed }) => [styles.toggleCard, pressed && styles.toggleCardPressed]}
              accessibilityRole="switch"
              accessibilityState={{ checked: taskPhotoRequired }}
            >
              <View style={styles.toggleTextWrap}>
                <AppText variant="label">{t('tasks.tasks.photoRequired')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('tasks.tasks.photoRequiredDescription')}
                </AppText>
              </View>
              <View style={[styles.toggleKnob, taskPhotoRequired && styles.toggleKnobActive]} />
            </Pressable>
            <Pressable
              onPress={() => setTaskNotifications((value) => !value)}
              style={({ pressed }) => [styles.toggleCard, pressed && styles.toggleCardPressed]}
              accessibilityRole="switch"
              accessibilityState={{ checked: taskNotifications }}
            >
              <View style={styles.toggleTextWrap}>
                <AppText variant="label">{t('tasks.tasks.notifications')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('tasks.tasks.notificationsDescription')}
                </AppText>
              </View>
              <View style={[styles.toggleKnob, taskNotifications && styles.toggleKnobActive]} />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <AppButton
              title={t('tasks.tasks.saveChanges')}
              onPress={handleSave}
              disabled={!taskName.trim()}
            />
            <AppButton title={t('tasks.tasks.deleteTask')} onPress={handleDelete} />
          </View>
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
  card: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dropdownTrigger: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.dividerLine,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dropdownTriggerPressed: { opacity: 0.9 },
  dropdownList: { gap: spacing.xs },
  dropdownRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dividerLine,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownRowActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dropdownRowPressed: { opacity: 0.85 },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  colorBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  toggleCard: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.dividerLine,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  toggleCardPressed: { opacity: 0.9 },
  toggleTextWrap: { flex: 1, gap: 2 },
  toggleKnob: {
    width: 48,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(30, 19, 14, 0.12)',
    borderWidth: 1,
    borderColor: colors.dividerLine,
  },
  toggleKnobActive: { backgroundColor: colors.primary },
  actions: { marginTop: spacing.sm, gap: spacing.xs },
});

export default EditTaskScreen;
