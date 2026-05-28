import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../../components/layout/TopBar';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '../../components/common/SegmentedControl';
import { AppText } from '../../components/common/AppText';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { EmptyState } from '../../components/common/EmptyState';
import { taskGroupService, taskService } from '../../services';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import type { TaskColor, TaskGroupPrivacy } from '../../application/state';
import { useAppState } from '../../application/AppStateContext';
import { selectAllTaskGroups, selectTasksByGroup, selectTaskGroupsByMember } from '../../application/selectors';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useAppNavigation } from '../../hooks/useAppNavigation';

type TasksTab = 'tasks' | 'groups';
type TaskSubscreen = 'create-task' | null;

const TASK_COLORS: TaskColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const GROUP_PRIVACY_VALUES: TaskGroupPrivacy[] = ['private', 'friends', 'public'];

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;


export const TasksScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TasksTab>('tasks');
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const [taskSubscreen, setTaskSubscreen] = useState<TaskSubscreen>(null);
  const [openedGroupId, setOpenedGroupId] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupPrivacy, setEditGroupPrivacy] = useState<TaskGroupPrivacy>('friends');
  const [memberUserId, setMemberUserId] = useState('');

  const [taskName, setTaskName] = useState('');
  const [taskGoal, setTaskGoal] = useState('1');
  const [taskColor, setTaskColor] = useState<TaskColor>('blue');
  const [taskPhotoRequired, setTaskPhotoRequired] = useState(false);
  const [taskNotifications, setTaskNotifications] = useState(true);

  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskGoal, setEditTaskGoal] = useState('1');
  const [editTaskColor, setEditTaskColor] = useState<TaskColor>('blue');
  const [editTaskPhotoRequired, setEditTaskPhotoRequired] = useState(false);
  const [editTaskNotifications, setEditTaskNotifications] = useState(true);

  const [progressValue, setProgressValue] = useState('1');
  const [progressNote, setProgressNote] = useState('');

  const allGroups = useMemo(() => selectAllTaskGroups(state), [state]);
  const memberGroups = useMemo(
    () => selectTaskGroupsByMember(state, currentUserId),
    [currentUserId, state],
  );
  const selectedGroup = selectedGroupId ? state.entities.taskGroups[selectedGroupId] : null;
  const openedGroup = openedGroupId ? state.entities.taskGroups[openedGroupId] : null;
  const tasksInSelectedGroup = useMemo(
    () => (selectedGroupId ? selectTasksByGroup(state, selectedGroupId) : []),
    [selectedGroupId, state],
  );
  const selectedTask = selectedTaskId ? state.entities.tasks[selectedTaskId] : null;
  const selectedTaskProgressValue = selectedTask
    ? (state.entities.taskProgresses[selectedTask.progressId]?.value ?? 0)
    : 0;
  const selectedTaskProgressEntries = useMemo(
    () =>
      Object.entries(state.entities.progressEntries)
        .filter(([, entry]) => entry.taskId === selectedTaskId)
        .map(([entryId, entry]) => ({ id: entryId, ...entry }))
        .reverse(),
    [selectedTaskId, state.entities.progressEntries],
  );

  useEffect(() => {
    if (allGroups.length > 0) {
      return;
    }

    const starterGroupId = 'grp-starter-1';
    const exploreGroupId = 'grp-starter-2';
    const joinableGroupId = 'grp-starter-3';
    const runTaskId = 'tsk-starter-1';
    const runProgressId = 'prg-starter-1';

    dispatch({
      type: 'task-groups/create',
      groupId: starterGroupId,
      ownerUserId: currentUserId,
      name: 'Road to Marathon',
      privacy: 'friends',
      groupType: 'competitive',
      isBingo: false,
      inviteCode: 'RUN2026',
    });
    dispatch({
      type: 'task-groups/create',
      groupId: exploreGroupId,
      ownerUserId: currentUserId,
      name: 'Weekend Cooking',
      privacy: 'private',
      groupType: 'cooperative',
      isBingo: false,
      inviteCode: 'COOK42',
    });
    dispatch({
      type: 'task-groups/create',
      groupId: joinableGroupId,
      ownerUserId: 'usr-seed-2',
      name: 'Open Bingo Crew',
      privacy: 'public',
      groupType: 'competitive',
      isBingo: true,
      inviteCode: 'BINGO1',
    });

    dispatch({ type: 'task-groups/add-member', groupId: starterGroupId, userId: currentUserId });
    dispatch({ type: 'task-groups/add-member', groupId: exploreGroupId, userId: currentUserId });
    dispatch({ type: 'task-groups/add-member', groupId: starterGroupId, userId: 'usr-seed-3' });

    dispatch({
      type: 'tasks/create',
      taskId: runTaskId,
      groupId: starterGroupId,
      progressId: runProgressId,
      name: 'Run 5 km',
      goal: 5,
      params: {
        color: 'blue',
        notifications: true,
        photoRequired: false,
      },
    });
    dispatch({
      type: 'tasks/add-progress',
      entryId: 'entry-starter-1',
      taskId: runTaskId,
      authorUserId: currentUserId,
      value: 2,
      note: 'Warm-up run',
    });
    dispatch({
      type: 'task-groups/invite-friend',
      invitationId: 'inv-starter-1',
      groupId: starterGroupId,
      fromUserId: 'usr-seed-3',
      toUserId: currentUserId,
    });
  }, [allGroups.length, currentUserId, dispatch]);

  useEffect(() => {
    if (!selectedGroupId && memberGroups.length > 0) {
      setSelectedGroupId(memberGroups[0].id);
      return;
    }

    if (selectedGroupId && !memberGroups.some((entry) => entry.id === selectedGroupId)) {
      setSelectedGroupId(memberGroups[0]?.id ?? null);
      setSelectedTaskId(null);
    }
  }, [memberGroups, selectedGroupId]);

  useEffect(() => {
    if (!selectedTaskId && tasksInSelectedGroup.length > 0) {
      setSelectedTaskId(tasksInSelectedGroup[0].id);
      return;
    }

    if (selectedTaskId && !tasksInSelectedGroup.some((entry) => entry.id === selectedTaskId)) {
      setSelectedTaskId(tasksInSelectedGroup[0]?.id ?? null);
    }
  }, [selectedTaskId, tasksInSelectedGroup]);

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    setEditGroupName(selectedGroup.name);
    setEditGroupPrivacy(selectedGroup.privacy);
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedTask) {
      return;
    }
    setEditTaskName(selectedTask.name);
    setEditTaskGoal(String(selectedTask.goal));
    setEditTaskColor(selectedTask.params.color);
    setEditTaskPhotoRequired(selectedTask.params.photoRequired);
    setEditTaskNotifications(selectedTask.params.notifications);
  }, [selectedTask]);

  const currentRoleLabel = openedGroup
    ? openedGroup.ownerUserId === currentUserId
      ? t('tasks.groups.roleOwner')
      : t('tasks.groups.roleMember')
    : null;

  const selectedTaskCompleted = Boolean(selectedTask && selectedTaskProgressValue >= selectedTask.goal);

  const progressPercent = selectedTask
    ? Math.min(100, Math.round((selectedTaskProgressValue / Math.max(1, selectedTask.goal)) * 100))
    : 0;

  

  const handleEditGroup = async () => {
    if (!selectedGroupId) return;
    const trimmedName = editGroupName.trim();
    if (!trimmedName) {
      Alert.alert(t('tasks.groups.validationTitle'), t('tasks.groups.nameRequired'));
      return;
    }

    const serviceResult = await taskGroupService.editGroup(selectedGroupId, {
      name: trimmedName,
      privacy: editGroupPrivacy,
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.editErrorTitle'), t('tasks.groups.editErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'task-groups/edit',
      groupId: selectedGroupId,
      name: trimmedName,
      privacy: editGroupPrivacy,
    });
    if (!result.ok) {
      Alert.alert(t('tasks.groups.editErrorTitle'), t('tasks.groups.editErrorMessage'));
      return;
    }

    Alert.alert(t('tasks.groups.editSuccessTitle'), t('tasks.groups.editSuccessMessage'));
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId || !selectedGroup) return;
    Alert.alert(t('tasks.groups.deleteTitle'), t('tasks.groups.deleteMessage'), [
      { text: t('tasks.common.cancel'), style: 'cancel' },
      {
        text: t('tasks.common.delete'),
        style: 'destructive',
        onPress: async () => {
          const serviceResult = await taskGroupService.deleteGroup(selectedGroupId);
          if (!serviceResult.ok) {
            Alert.alert(t('tasks.groups.deleteErrorTitle'), t('tasks.groups.deleteErrorMessage'));
            return;
          }

          const result = dispatch({ type: 'task-groups/delete', groupId: selectedGroupId });
          if (!result.ok) {
            Alert.alert(t('tasks.groups.deleteErrorTitle'), t('tasks.groups.deleteErrorMessage'));
            return;
          }

          setSelectedTaskId(null);
          setOpenedGroupId(null);
          Alert.alert(t('tasks.groups.deleteSuccessTitle'), t('tasks.groups.deleteSuccessMessage'));
        },
      },
    ]);
  };

  const handleAddMember = async () => {
    if (!selectedGroupId) return;
    const trimmedUserId = memberUserId.trim();
    if (!trimmedUserId) {
      Alert.alert(t('tasks.groups.validationTitle'), t('tasks.groups.memberRequired'));
      return;
    }

    const serviceResult = await taskGroupService.addMember(selectedGroupId, trimmedUserId);
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.memberErrorTitle'), t('tasks.groups.memberErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'task-groups/add-member',
      groupId: selectedGroupId,
      userId: trimmedUserId,
    });
    if (!result.ok) {
      Alert.alert(t('tasks.groups.memberErrorTitle'), t('tasks.groups.memberErrorMessage'));
      return;
    }

    setMemberUserId('');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroupId) return;
    const serviceResult = await taskGroupService.removeMember(selectedGroupId, userId);
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.memberErrorTitle'), t('tasks.groups.memberErrorMessage'));
      return;
    }

    dispatch({ type: 'task-groups/remove-member', groupId: selectedGroupId, userId });
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroupId || !selectedGroup) return;
    if (selectedGroup.ownerUserId === currentUserId) {
      Alert.alert(t('tasks.groups.leaveErrorTitle'), t('tasks.groups.ownerCannotLeave'));
      return;
    }

    const serviceResult = await taskGroupService.leaveGroup(selectedGroupId, currentUserId);
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.leaveErrorTitle'), t('tasks.groups.leaveErrorMessage'));
      return;
    }

    dispatch({ type: 'task-groups/leave', groupId: selectedGroupId, userId: currentUserId });
    setSelectedTaskId(null);
    setOpenedGroupId(null);
    Alert.alert(t('tasks.groups.leaveSuccessTitle'), t('tasks.groups.leaveSuccessMessage'));
  };

  const handleCreateTask = async () => {
    if (!selectedGroupId) {
      Alert.alert(t('tasks.tasks.missingGroupTitle'), t('tasks.tasks.missingGroupMessage'));
      return;
    }

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
      groupId: selectedGroupId,
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
      groupId: selectedGroupId,
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

    setTaskName('');
    setTaskGoal('1');
    setTaskColor('blue');
    setTaskPhotoRequired(false);
    setTaskNotifications(true);
    setSelectedTaskId(taskId);
    setTaskSubscreen(null);
  };

  const handleEditTask = async () => {
    if (!selectedTaskId) return;
    const trimmedName = editTaskName.trim();
    const parsedGoal = Number(editTaskGoal);
    if (!trimmedName || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
      Alert.alert(t('tasks.tasks.validationTitle'), t('tasks.tasks.validationMessage'));
      return;
    }

    const serviceResult = await taskService.editTask(selectedTaskId, {
      name: trimmedName,
      goal: parsedGoal,
      params: {
        color: editTaskColor,
        photoRequired: editTaskPhotoRequired,
        notifications: editTaskNotifications,
      },
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.tasks.editErrorTitle'), t('tasks.tasks.editErrorMessage'));
      return;
    }

    const result = dispatch({
      type: 'tasks/edit',
      taskId: selectedTaskId,
      name: trimmedName,
      goal: parsedGoal,
      params: {
        color: editTaskColor,
        photoRequired: editTaskPhotoRequired,
        notifications: editTaskNotifications,
      },
    });

    if (!result.ok) {
      Alert.alert(t('tasks.tasks.editErrorTitle'), t('tasks.tasks.editErrorMessage'));
      return;
    }

    Alert.alert(t('tasks.tasks.editSuccessTitle'), t('tasks.tasks.editSuccessMessage'));
  };

  const handleDeleteTask = () => {
    if (!selectedTaskId) return;

    Alert.alert(t('tasks.tasks.deleteTitle'), t('tasks.tasks.deleteMessage'), [
      { text: t('tasks.common.cancel'), style: 'cancel' },
      {
        text: t('tasks.common.delete'),
        style: 'destructive',
        onPress: async () => {
          const serviceResult = await taskService.deleteTask(selectedTaskId);
          if (!serviceResult.ok) {
            Alert.alert(t('tasks.tasks.deleteErrorTitle'), t('tasks.tasks.deleteErrorMessage'));
            return;
          }

          const result = dispatch({ type: 'tasks/delete', taskId: selectedTaskId });
          if (!result.ok) {
            Alert.alert(t('tasks.tasks.deleteErrorTitle'), t('tasks.tasks.deleteErrorMessage'));
            return;
          }
          setSelectedTaskId(null);
        },
      },
    ]);
  };

  const handleAddProgress = async () => {
    if (!selectedTaskId || !selectedTask) return;
    if (selectedTaskCompleted) {
      Alert.alert(t('tasks.progress.completedTitle'), t('tasks.progress.completedMessage'));
      return;
    }

    const parsed = Number(progressValue);
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert(t('tasks.progress.validationTitle'), t('tasks.progress.validationMessage'));
      return;
    }

    const entryId = generateId('entry');
    const serviceResult = await taskService.addProgress({
      entryId,
      taskId: selectedTaskId,
      authorUserId: currentUserId,
      value: parsed,
      note: progressNote,
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.progress.errorTitle'), t('tasks.progress.errorMessage'));
      return;
    }

    const result = dispatch({
      type: 'tasks/add-progress',
      entryId,
      taskId: selectedTaskId,
      authorUserId: currentUserId,
      value: parsed,
      note: progressNote,
    });

    if (!result.ok) {
      Alert.alert(t('tasks.progress.errorTitle'), t('tasks.progress.errorMessage'));
      return;
    }

    setProgressValue('1');
    setProgressNote('');
  };

  const tabOptions = useMemo<ReadonlyArray<SegmentedControlOption<TasksTab>>>(
    () => [
      { value: 'tasks', label: t('tasks.tabs.tasks') },
      { value: 'groups', label: t('tasks.tabs.groups') },
    ],
    [t],
  );

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <View style={styles.switcherWrap}>
          <SegmentedControl<TasksTab>
            options={tabOptions}
            value={activeTab}
            onChange={setActiveTab}
            accessibilityLabel={t('screens.tasks')}
          />
        </View>
        <View style={styles.tabContent}>
          {activeTab === 'groups' ? (
            openedGroup && selectedGroupId === openedGroupId ? (
              <ScrollView contentContainerStyle={styles.groupsContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionCard}>
                  <AppButton title={t('tasks.common.cancel')} onPress={() => setOpenedGroupId(null)} />
                </View>

                <View style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                      {t('tasks.groups.selectedGroupSection')}
                    </AppText>
                  </View>
                  <AppText variant="label">{openedGroup.name}</AppText>
                  <AppText variant="caption" color="textSecondary" style={styles.sectionSubtitle}>
                    {t('tasks.groups.selectedGroupMeta', {
                      privacy: t(`tasks.groups.privacy.${openedGroup.privacy}`),
                      role: currentRoleLabel,
                      code: openedGroup.inviteCode || '-',
                    })}
                  </AppText>

                  <AppInput
                    value={editGroupName}
                    onChangeText={setEditGroupName}
                    placeholder={t('tasks.groups.groupNamePlaceholder')}
                    style={styles.tightInput}
                  />
                  <View style={styles.inlineControlsRow}>
                    {GROUP_PRIVACY_VALUES.map((privacy) => (
                      <Pressable
                        key={privacy}
                        style={({ pressed }) => [
                          styles.chip,
                          editGroupPrivacy === privacy && styles.chipActive,
                          pressed && styles.chipPressed,
                        ]}
                        onPress={() => setEditGroupPrivacy(privacy)}
                        accessibilityRole="button"
                      >
                        <AppText
                          variant="caption"
                          color={editGroupPrivacy === privacy ? 'textOnPrimary' : 'textPrimary'}
                        >
                          {t(`tasks.groups.privacy.${privacy}`)}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.inlineActionButtons}>
                    <AppButton title={t('tasks.groups.saveChanges')} onPress={handleEditGroup} />
                    <AppButton
                      title={t('tasks.groups.deleteGroup')}
                      onPress={handleDeleteGroup}
                      style={styles.destructiveButton}
                    />
                  </View>

                  <View style={styles.sectionHeaderRow}>
                    <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                      {t('tasks.groups.membersSection')}
                    </AppText>
                  </View>
                  <AppInput
                    value={memberUserId}
                    onChangeText={setMemberUserId}
                    placeholder={t('tasks.groups.memberInputPlaceholder')}
                    style={styles.tightInput}
                  />
                  <AppButton
                    title={t('tasks.groups.addMember')}
                    onPress={handleAddMember}
                    disabled={!memberUserId.trim()}
                  />
                  <View style={styles.memberList}>
                    <View style={styles.memberRow}>
                      <AppText variant="caption" color="textSecondary">
                        {openedGroup.ownerUserId}
                      </AppText>
                      <View style={styles.groupPill}>
                        <AppText variant="caption">{t('tasks.groups.ownerBadge')}</AppText>
                      </View>
                    </View>
                    {openedGroup.memberIds.map((memberId) => (
                      <View key={memberId} style={styles.memberRow}>
                        <AppText variant="caption" color="textSecondary">
                          {memberId}
                        </AppText>
                        <Pressable
                          onPress={() => handleRemoveMember(memberId)}
                          style={({ pressed }) => [
                            styles.inlineDanger,
                            pressed && styles.inlineDangerPressed,
                          ]}
                        >
                          <AppText variant="caption" color="textOnPrimary">
                            {t('tasks.groups.removeMember')}
                          </AppText>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  {openedGroup.ownerUserId !== currentUserId ? (
                    <AppButton title={t('tasks.groups.leaveGroup')} onPress={handleLeaveGroup} />
                  ) : null}
                </View>
              </ScrollView>
            ) : (
            <ScrollView
              contentContainerStyle={styles.groupsContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.sectionHeaderRow}>
                <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                  {t('tasks.groups.actionsSection')}
                </AppText>
              </View>
              <View style={styles.sectionCard}>
                  <View style={styles.quickActionsWrap}>
                  <View style={styles.quickActionButtonWrap}>
                    <AppButton title={t('tasks.groups.joinAction')} onPress={() => navigation.navigate('JoinGroup')} />
                  </View>
                  <View style={styles.quickActionButtonWrap}>
                    <AppButton title={t('tasks.groups.createAction')} onPress={() => navigation.navigate('CreateGroup')} />
                  </View>
                </View>
              </View>
              

              <View style={styles.sectionHeaderRow}>
                <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                  {t('tasks.groups.myGroupsSection')}
                </AppText>
              </View>
              <View style={styles.groupList}>
                {memberGroups.length === 0 ? (
                  <EmptyState
                    icon="albums-outline"
                    title={t('tasks.groups.emptyTitle')}
                    message={t('tasks.groups.emptyMessage')}
                  />
                ) : memberGroups.map(({ id, group }) => (
                  <Pressable
                    key={id}
                    style={({ pressed }) => [
                      styles.groupCard,
                      selectedGroupId === id && styles.groupCardActive,
                      pressed && styles.groupCardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={group.name}
                    onPress={() => {
                        navigation.navigate('EditGroup', { groupId: id });
                      }}
                  >
                    <View style={styles.groupTopRow}>
                      <AppText variant="label" color="textPrimary">
                        {group.name}
                      </AppText>
                      <View style={styles.groupPill}>
                        <AppText variant="caption" color="textPrimary">
                          {group.ownerUserId === currentUserId
                            ? t('tasks.groups.roleOwner')
                            : t('tasks.groups.roleMember')}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.groupMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="list" size={16} color={colors.muted} />
                        <AppText variant="caption" color="textSecondary">
                          {t('tasks.groups.taskCount', { count: group.taskIds.length })}
                        </AppText>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Ionicons name="people" size={16} color={colors.muted} />
                        <AppText variant="caption" color="textSecondary">
                          {t('tasks.groups.memberCount', {
                            count: group.memberIds.length + 1,
                          })}
                        </AppText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            )
          ) : (
            <ScrollView contentContainerStyle={styles.groupsContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                  {t('tasks.tasks.groupPickerSection')}
                </AppText>
              </View>
              <View style={styles.groupList}>
                {memberGroups.map(({ id, group }) => (
                  <Pressable
                    key={id}
                    style={({ pressed }) => [
                      styles.groupCard,
                      selectedGroupId === id && styles.groupCardActive,
                      pressed && styles.groupCardPressed,
                    ]}
                    onPress={() => setSelectedGroupId(id)}
                  >
                    <AppText variant="label">{group.name}</AppText>
                  </Pressable>
                ))}
              </View>

              {!selectedGroup ? (
                <EmptyState
                  icon="checkmark-done-outline"
                  title={t('tasks.tasks.noGroupSelectedTitle')}
                  message={t('tasks.tasks.noGroupSelectedMessage')}
                />
              ) : (
                <>
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                        {t('tasks.groups.actionsSection')}
                      </AppText>
                    </View>
                    <AppButton title={t('tasks.tasks.createTask')} onPress={() => setTaskSubscreen('create-task')} />
                  </View>

                  {taskSubscreen === 'create-task' ? (
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                          {t('tasks.tasks.createSection')}
                        </AppText>
                      </View>
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
                        {TASK_COLORS.map((color) => (
                          <Pressable
                            key={color}
                            style={({ pressed }) => [
                              styles.chip,
                              taskColor === color && styles.chipActive,
                              pressed && styles.chipPressed,
                            ]}
                            onPress={() => setTaskColor(color)}
                          >
                            <AppText
                              variant="caption"
                              color={taskColor === color ? 'textOnPrimary' : 'textPrimary'}
                            >
                              {t(`tasks.tasks.colors.${color}`)}
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
                          disabled={!taskName.trim()}
                        />
                        <AppButton title={t('tasks.common.cancel')} onPress={() => setTaskSubscreen(null)} />
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.sectionHeaderRow}>
                    <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                      {t('tasks.tasks.listSection')}
                    </AppText>
                  </View>
                  <View style={styles.groupList}>
                    {tasksInSelectedGroup.length === 0 ? (
                      <EmptyState
                        icon="clipboard-outline"
                        title={t('tasks.tasks.emptyTitle')}
                        message={t('tasks.tasks.emptyMessage')}
                      />
                    ) : tasksInSelectedGroup.map(({ id, task }) => {
                      const currentValue = state.entities.taskProgresses[task.progressId]?.value ?? 0;
                      const isDone = currentValue >= task.goal;
                      return (
                        <Pressable
                          key={id}
                          style={({ pressed }) => [
                            styles.groupCard,
                            selectedTaskId === id && styles.groupCardActive,
                            pressed && styles.groupCardPressed,
                          ]}
                          onPress={() => setSelectedTaskId(id)}
                        >
                          <View style={styles.groupTopRow}>
                            <AppText variant="label">{task.name}</AppText>
                            <View style={styles.groupPill}>
                              <AppText variant="caption">
                                {isDone ? t('tasks.tasks.statusDone') : t('tasks.tasks.statusActive')}
                              </AppText>
                            </View>
                          </View>
                          <AppText variant="caption" color="textSecondary">
                            {t('tasks.tasks.taskMeta', { current: currentValue, goal: task.goal })}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>

                  {selectedTask ? (
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeaderRow}>
                        <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                          {t('tasks.tasks.selectedTaskSection')}
                        </AppText>
                      </View>
                      <AppInput
                        value={editTaskName}
                        onChangeText={setEditTaskName}
                        placeholder={t('tasks.tasks.namePlaceholder')}
                        style={styles.tightInput}
                      />
                      <AppInput
                        value={editTaskGoal}
                        onChangeText={setEditTaskGoal}
                        keyboardType="numeric"
                        placeholder={t('tasks.tasks.goalPlaceholder')}
                        style={styles.tightInput}
                      />
                      <View style={styles.inlineControlsRow}>
                        {TASK_COLORS.map((color) => (
                          <Pressable
                            key={color}
                            style={({ pressed }) => [
                              styles.chip,
                              editTaskColor === color && styles.chipActive,
                              pressed && styles.chipPressed,
                            ]}
                            onPress={() => setEditTaskColor(color)}
                          >
                            <AppText
                              variant="caption"
                              color={editTaskColor === color ? 'textOnPrimary' : 'textPrimary'}
                            >
                              {t(`tasks.tasks.colors.${color}`)}
                            </AppText>
                          </Pressable>
                        ))}
                      </View>
                      <View style={styles.inlineControlsRow}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.chip,
                            editTaskPhotoRequired && styles.chipActive,
                            pressed && styles.chipPressed,
                          ]}
                          onPress={() => setEditTaskPhotoRequired((value) => !value)}
                        >
                          <AppText
                            variant="caption"
                            color={editTaskPhotoRequired ? 'textOnPrimary' : 'textPrimary'}
                          >
                            {t('tasks.tasks.photoRequired')}
                          </AppText>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [
                            styles.chip,
                            editTaskNotifications && styles.chipActive,
                            pressed && styles.chipPressed,
                          ]}
                          onPress={() => setEditTaskNotifications((value) => !value)}
                        >
                          <AppText
                            variant="caption"
                            color={editTaskNotifications ? 'textOnPrimary' : 'textPrimary'}
                          >
                            {t('tasks.tasks.notifications')}
                          </AppText>
                        </Pressable>
                      </View>

                      <View style={styles.inlineActionButtons}>
                        <AppButton title={t('tasks.tasks.saveChanges')} onPress={handleEditTask} />
                        <AppButton
                          title={t('tasks.tasks.deleteTask')}
                          onPress={handleDeleteTask}
                          style={styles.destructiveButton}
                        />
                      </View>

                      <View style={styles.sectionHeaderRow}>
                        <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                          {t('tasks.progress.section')}
                        </AppText>
                      </View>
                      <AppText variant="body" color="textSecondary" style={styles.sectionSubtitle}>
                        {t('tasks.progress.summary', {
                          current: selectedTaskProgressValue,
                          goal: selectedTask.goal,
                          percent: progressPercent,
                        })}
                      </AppText>
                      <AppInput
                        value={progressValue}
                        onChangeText={setProgressValue}
                        keyboardType="numeric"
                        placeholder={t('tasks.progress.valuePlaceholder')}
                        style={styles.tightInput}
                      />
                      <AppInput
                        value={progressNote}
                        onChangeText={setProgressNote}
                        placeholder={t('tasks.progress.notePlaceholder')}
                        style={styles.tightInput}
                      />
                      <AppButton
                        title={t('tasks.progress.addProgress')}
                        onPress={handleAddProgress}
                        disabled={selectedTaskCompleted}
                      />

                      <View style={styles.timelineList}>
                        {selectedTaskProgressEntries.length === 0 ? (
                          <AppText variant="caption" color="textSecondary">
                            {t('tasks.progress.emptyTimeline')}
                          </AppText>
                        ) : selectedTaskProgressEntries.map((entry) => (
                          <View key={entry.id} style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <AppText variant="caption" color="textSecondary">
                              {t('tasks.progress.timelineEntry', {
                                value: entry.value,
                                comments: entry.commentIds.length,
                              })}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  switcherWrap: {
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: spacing.md,
  },
  groupsContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionHeaderRow: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'stretch',
  },
  actionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    ...shadows.level1,
  },
  actionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  sectionCard: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    ...shadows.level1,
  },
  sectionSubtitle: {
    marginBottom: spacing.sm,
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
  tightInput: {
    marginBottom: spacing.xs,
  },
  inlineActionButtons: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  quickActionsWrap: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionButtonWrap: {
    width: '100%',
    maxWidth: 320,
  },
  destructiveButton: {
    opacity: 0.9,
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  actionSubtitle: {
    marginTop: spacing.xs,
  },
  joinInput: {
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  groupList: {
    gap: spacing.md,
  },
  groupCard: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    ...shadows.level1,
  },
  groupCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  groupCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  groupTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  groupPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.dividerLine,
  },
  memberList: {
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dividerLine,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inlineDanger: {
    backgroundColor: colors.danger,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  inlineDangerPressed: {
    opacity: 0.75,
  },
  timelineList: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
