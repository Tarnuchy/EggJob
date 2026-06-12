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
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { selectTaskGroupsByMember } from '../../application/selectors';
import { taskService } from '../../services';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { TaskColor, TaskKind } from '../../application/state';
import { DEFAULT_TASK_COLOR, findTaskColorId, TASK_COLORS } from './taskColors';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const CreateTaskScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { dispatch, state } = useAppState();
  const currentUserId = useCurrentUserId();
  const initialGroupId = (route.params as { groupId?: string } | undefined)?.groupId ?? null;

  const memberGroups = useMemo(
    () => selectTaskGroupsByMember(state, currentUserId),
    [state, currentUserId],
  );

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialGroupId);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskKind, setTaskKind] = useState<TaskKind>('one_time');
  const [taskGoal, setTaskGoal] = useState('10');
  const [taskColor, setTaskColor] = useState<TaskColor>(DEFAULT_TASK_COLOR);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [taskPhotoRequired, setTaskPhotoRequired] = useState(false);
  const [taskNotifications, setTaskNotifications] = useState(true);

  const selectedGroup = selectedGroupId ? state.entities.taskGroups[selectedGroupId] : null;
  const selectedColorId = findTaskColorId(taskColor);

  const taskKindOptions = useMemo(
    () =>
      [
        { value: 'one_time', label: t('tasks.tasks.taskTypeOneTime') },
        { value: 'endless', label: t('tasks.tasks.taskTypeProgress') },
      ] as const satisfies ReadonlyArray<SegmentedControlOption<TaskKind>>,
    [t],
  );

  const handleCreateTask = async () => {
    if (!selectedGroupId || !selectedGroup) {
      Alert.alert(t('tasks.tasks.missingGroupTitle'), t('tasks.tasks.missingGroupMessage'));
      return;
    }

    const trimmedName = taskName.trim();
    const parsedGoal = taskKind === 'one_time' ? 1 : Number(taskGoal);
    if (!trimmedName || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert(t('tasks.tasks.validationTitle'), t('tasks.tasks.validationMessage'));
      return;
    }

    const taskId = generateId('tsk');
    const progressId = generateId('prg');
    const params = {
      color: taskColor,
      photoRequired: taskPhotoRequired,
      notifications: taskNotifications,
    };

    const serviceResult = await taskService.createTask({
      taskId,
      groupId: selectedGroupId,
      progressId,
      name: trimmedName,
      goal: parsedGoal,
      status: 'active',
      kind: taskKind,
      params,
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.tasks.createErrorTitle'), t('tasks.tasks.createErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'tasks/create',
      taskId,
      groupId: selectedGroupId,
      progressId,
      name: trimmedName,
      goal: parsedGoal,
      kind: taskKind,
      params,
    });
    if (!result.ok) {
      Alert.alert(t('tasks.tasks.createErrorTitle'), t('tasks.tasks.createErrorMessage'));
      return;
    }

    Alert.alert(t('tasks.tasks.createSuccessTitle'), t('tasks.tasks.createSuccessMessage'));
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <TopBar title={t('tasks.tasks.createTask')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.tasks.groupPickerSection')}
            </AppText>
            <Pressable
              onPress={() => setGroupPickerOpen((value) => !value)}
              style={({ pressed }) => [styles.dropdownTrigger, pressed && styles.dropdownTriggerPressed]}
              accessibilityRole="button"
              accessibilityState={{ expanded: groupPickerOpen }}
            >
              <AppText variant="label" color={selectedGroup ? 'textPrimary' : 'textSecondary'}>
                {selectedGroup ? selectedGroup.name : t('tasks.tasks.noGroupSelectedTitle')}
              </AppText>
              <Ionicons
                name={groupPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.muted}
              />
            </Pressable>
            {groupPickerOpen ? (
              <View style={styles.dropdownList}>
                {memberGroups.map(({ id, group }) => (
                  <Pressable
                    key={id}
                    onPress={() => {
                      setSelectedGroupId(id);
                      setGroupPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownRow,
                      selectedGroupId === id && styles.dropdownRowActive,
                      pressed && styles.dropdownRowPressed,
                    ]}
                    accessibilityRole="button"
                  >
                    <AppText
                      variant="caption"
                      color={selectedGroupId === id ? 'textOnPrimary' : 'textPrimary'}
                    >
                      {group.name}
                    </AppText>
                  </Pressable>
                ))}
                {memberGroups.length === 0 ? (
                  <AppText variant="caption" color="textSecondary">
                    {t('tasks.groups.emptyMessage')}
                  </AppText>
                ) : null}
              </View>
            ) : null}
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
              title={t('tasks.tasks.createTask')}
              onPress={handleCreateTask}
              disabled={!taskName.trim() || !selectedGroupId || !currentUserId}
            />
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
  actions: { marginTop: spacing.sm },
});
