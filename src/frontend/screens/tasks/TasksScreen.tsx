import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { taskGroupService } from '../../services';
import { USE_HTTP_SERVICES } from '../../services/http/config';
import { fetchHydratedTaskData } from '../../services/http/hydrateTaskData';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import type { TaskGroupPrivacy } from '../../application/state';
import { useAppState } from '../../application/AppStateContext';
import { selectAllTaskGroups, selectTaskGroupsByMember } from '../../application/selectors';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useToast } from '../../context/ToastContext';
import { TASK_COLORS } from './taskColors';

type TasksTab = 'tasks' | 'groups';

const GROUP_PRIVACY_VALUES: TaskGroupPrivacy[] = ['private', 'public'];

export const TasksScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TasksTab>('tasks');
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const navigation = useAppNavigation();
  const { showToast } = useToast();

  const [openedGroupId, setOpenedGroupId] = useState<string | null>(null);
  const [showJoinCodeInput, setShowJoinCodeInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupPrivacy, setEditGroupPrivacy] = useState<TaskGroupPrivacy>('friends');
  const [memberUserId, setMemberUserId] = useState('');
  const [confirmDeleteGroupVisible, setConfirmDeleteGroupVisible] = useState(false);

  const allGroups = useMemo(() => selectAllTaskGroups(state), [state]);
  const memberGroups = useMemo(() => selectTaskGroupsByMember(state, currentUserId), [currentUserId, state]);
  const selectedGroup = selectedGroupId ? state.entities.taskGroups[selectedGroupId] : null;
  const openedGroup = openedGroupId ? state.entities.taskGroups[openedGroupId] : null;

  useEffect(() => {
    // w trybie HTTP stan pochodzi z backendu (useBackendHydration) — bez lokalnych seedów
    if (USE_HTTP_SERVICES) return;
    if (allGroups.length > 0) return;

    // Seedy demonstracyjne (nazwy w EN) pokrywają pełną domenę: typy grup, prywatność,
    // bingo 3×3 / 4×4 / 5×5, role, progres częściowy/pełny/zerowy, komentarz i zaproszenie.
    const marathonId = 'grp-marathon';
    const cookingId = 'grp-cooking';
    const bingo3Id = 'grp-bingo3';
    const bingo4Id = 'grp-bingo4';
    const bingo5Id = 'grp-bingo5';
    const cyclingId = 'grp-cycling';

    // pomocnik: grupa bingo trzyma dokładnie size² tasków; doneIndices oznacza ukończone komórki
    const seedBingoBoard = (
      groupId: string,
      size: number,
      label: (index: number) => string,
      doneIndices: number[],
    ) => {
      for (let i = 0; i < size * size; i++) {
        const taskId = `tsk-${groupId}-${i}`;
        dispatch({
          type: 'tasks/create',
          taskId,
          groupId,
          progressId: `prg-${groupId}-${i}`,
          name: label(i),
          goal: 1,
          kind: 'one_time',
          params: {
            color: TASK_COLORS[i % TASK_COLORS.length].value,
            photoRequired: false,
            notifications: false,
          },
        });
        if (doneIndices.includes(i)) {
          dispatch({
            type: 'tasks/add-progress',
            entryId: `entry-${groupId}-${i}`,
            taskId,
            authorUserId: currentUserId,
            value: 1,
          });
        }
      }
    };

    // ── Grupa 1: kompetytywna, prywatna, własna; różne typy tasków, role admina ──
    dispatch({ type: 'task-groups/create', groupId: marathonId, ownerUserId: currentUserId, name: 'Road to Marathon', privacy: 'private', groupType: 'competitive', isBingo: false, inviteCode: 'RUN2026' });
    dispatch({ type: 'task-groups/add-member', groupId: marathonId, userId: 'usr-seed-3' });
    dispatch({ type: 'task-groups/add-member', groupId: marathonId, userId: 'usr-seed-4' });
    dispatch({ type: 'task-groups/change-role', groupId: marathonId, userId: 'usr-seed-3', role: 'admin' });

    dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-run', groupId: marathonId, progressId: 'prg-marathon-run', name: 'Run 5 km', goal: 5, kind: 'endless', params: { color: '#2563EB', notifications: true, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-run', taskId: 'tsk-marathon-run', authorUserId: currentUserId, value: 2, note: 'Warm-up run' });
    dispatch({ type: 'tasks/add-comment', commentId: 'cmt-marathon-run', progressEntryId: 'entry-marathon-run', message: 'Felt strong today!', authorUserId: currentUserId });

    dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-long', groupId: marathonId, progressId: 'prg-marathon-long', name: 'Weekly long run', goal: 20, kind: 'endless', params: { color: '#16A34A', notifications: true, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-long', taskId: 'tsk-marathon-long', authorUserId: currentUserId, value: 12 });

    dispatch({ type: 'tasks/create', taskId: 'tsk-marathon-stretch', groupId: marathonId, progressId: 'prg-marathon-stretch', name: 'Stretch daily', goal: 1, kind: 'one_time', params: { color: '#EA580C', notifications: false, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-marathon-stretch', taskId: 'tsk-marathon-stretch', authorUserId: currentUserId, value: 1 });

    // ── Grupa 2: kooperacyjna, prywatna, własna, solo; photoRequired + progres zerowy ──
    dispatch({ type: 'task-groups/create', groupId: cookingId, ownerUserId: currentUserId, name: 'Weekend Cooking', privacy: 'private', groupType: 'cooperative', isBingo: false, inviteCode: 'COOK42' });
    dispatch({ type: 'tasks/create', taskId: 'tsk-cooking-bread', groupId: cookingId, progressId: 'prg-cooking-bread', name: 'Bake sourdough', goal: 1, kind: 'one_time', params: { color: '#7C3AED', notifications: false, photoRequired: true } });
    dispatch({ type: 'tasks/create', taskId: 'tsk-cooking-recipes', groupId: cookingId, progressId: 'prg-cooking-recipes', name: 'Try 3 new recipes', goal: 3, kind: 'endless', params: { color: '#0D9488', notifications: true, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-cooking-recipes', taskId: 'tsk-cooking-recipes', authorUserId: currentUserId, value: 1 });

    // ── Grupa 3: publiczna bingo 3×3, cudza (NIE jesteśmy członkiem) → grupa dołączalna kodem ──
    const bingo3Labels = ['Push-ups', 'Plank 1 min', 'Drink water', '10k steps', 'Yoga flow', 'No sugar', 'Read 20 min', 'Sleep 8h', 'Meditate'];
    dispatch({ type: 'task-groups/create', groupId: bingo3Id, ownerUserId: 'usr-seed-2', name: 'Open Bingo Crew', privacy: 'public', groupType: 'cooperative', isBingo: true, inviteCode: 'BINGO1' });
    dispatch({ type: 'task-groups/add-member', groupId: bingo3Id, userId: 'usr-seed-1' });
    seedBingoBoard(bingo3Id, 3, (i) => bingo3Labels[i], [0, 1, 5]); // 3 ukończone, brak pełnej linii

    // ── Grupa 4: bingo 4×4, prywatność 'friends', cudza — jesteśmy członkiem (nie-owner) ──
    dispatch({ type: 'task-groups/create', groupId: bingo4Id, ownerUserId: 'usr-seed-3', name: 'Habit Bingo', privacy: 'friends', groupType: 'cooperative', isBingo: true, inviteCode: 'HABIT4' });
    dispatch({ type: 'task-groups/add-member', groupId: bingo4Id, userId: currentUserId });
    dispatch({ type: 'task-groups/add-member', groupId: bingo4Id, userId: 'usr-seed-4' });
    seedBingoBoard(bingo4Id, 4, (i) => `Habit ${i + 1}`, [0, 2, 5, 9]); // częściowo, brak pełnej linii

    // ── Grupa 5: bingo 5×5, własna; pierwszy rząd ukończony → stan wygranej (banner „Bingo!") ──
    dispatch({ type: 'task-groups/create', groupId: bingo5Id, ownerUserId: currentUserId, name: 'Champion Bingo', privacy: 'public', groupType: 'cooperative', isBingo: true, inviteCode: 'CHAMP5' });
    dispatch({ type: 'task-groups/add-member', groupId: bingo5Id, userId: 'usr-seed-5' });
    seedBingoBoard(bingo5Id, 5, (i) => `Challenge ${i + 1}`, [0, 1, 2, 3, 4]); // pełny pierwszy rząd → bingo

    // ── Grupa 6: kompetytywna, prywatność 'friends', cudza — jesteśmy członkiem ──
    dispatch({ type: 'task-groups/create', groupId: cyclingId, ownerUserId: 'usr-seed-5', name: 'Cycling Buddies', privacy: 'friends', groupType: 'competitive', isBingo: false, inviteCode: 'RIDE99' });
    dispatch({ type: 'task-groups/add-member', groupId: cyclingId, userId: currentUserId });
    dispatch({ type: 'task-groups/add-member', groupId: cyclingId, userId: 'usr-seed-6' });
    dispatch({ type: 'tasks/create', taskId: 'tsk-cycling-ride', groupId: cyclingId, progressId: 'prg-cycling-ride', name: 'Ride 50 km', goal: 50, kind: 'endless', params: { color: '#DC2626', notifications: true, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-cycling-ride', taskId: 'tsk-cycling-ride', authorUserId: currentUserId, value: 30 });
    dispatch({ type: 'tasks/create', taskId: 'tsk-cycling-hill', groupId: cyclingId, progressId: 'prg-cycling-hill', name: 'Climb a hill', goal: 1, kind: 'one_time', params: { color: '#CA8A04', notifications: false, photoRequired: false } });
    dispatch({ type: 'tasks/add-progress', entryId: 'entry-cycling-hill', taskId: 'tsk-cycling-hill', authorUserId: currentUserId, value: 1 });

    // ── Oczekujące zaproszenie do grupy, której nie jesteśmy członkiem (Open Bingo Crew) ──
    dispatch({ type: 'task-groups/invite-friend', invitationId: 'inv-bingo3', groupId: bingo3Id, fromUserId: 'usr-seed-2', toUserId: currentUserId });
  }, [allGroups.length, currentUserId, dispatch]);

  useEffect(() => {
    // brak auto-zaznaczenia po wejściu w zakładkę Grupy — czyścimy tylko nieaktualny wybór
    if (selectedGroupId && !memberGroups.some((entry) => entry.id === selectedGroupId)) {
      setSelectedGroupId(null);
    }
  }, [memberGroups, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroup) return;
    setEditGroupName(selectedGroup.name);
    setEditGroupPrivacy(selectedGroup.privacy);
  }, [selectedGroup]);

  const currentRoleLabel = openedGroup
    ? openedGroup.ownerUserId === currentUserId
      ? t('tasks.groups.roleOwner')
      : t('tasks.groups.roleMember')
    : null;

  const handleEditGroup = async () => {
    if (!selectedGroupId) return;
    const trimmedName = editGroupName.trim();
    if (!trimmedName) {
      showToast({ message: t('tasks.groups.nameRequired'), variant: 'error' });
      return;
    }

    const serviceResult = await taskGroupService.editGroup(selectedGroupId, { name: trimmedName, privacy: editGroupPrivacy });
    if (!serviceResult.ok) {
      showToast({ message: t('tasks.groups.editErrorMessage'), variant: 'error' });
      return;
    }

    const result = dispatch({ type: 'task-groups/edit', groupId: selectedGroupId, name: trimmedName, privacy: editGroupPrivacy });
    if (!result.ok) {
      showToast({ message: t('tasks.groups.editErrorMessage'), variant: 'error' });
      return;
    }

    showToast({ message: t('tasks.groups.editSuccessMessage'), variant: 'success' });
  };

  const handleJoinGroup = async () => {
    const trimmed = joinCode.trim();
    if (!trimmed) { showToast({ message: t('tasks.groups.joinEmptyMessage'), variant: 'error' }); return; }

    if (USE_HTTP_SERVICES) {
      // backend zna kody grup spoza lokalnego stanu — dołącz i ponownie zhydratuj
      const serviceResult = await taskGroupService.joinByInviteCode({ inviteCode: trimmed, userId: currentUserId });
      if (!serviceResult.ok) {
        const message =
          serviceResult.error.code === 'conflict'
            ? t('tasks.groups.joinConflict')
            : serviceResult.error.code === 'not-found'
              ? t('tasks.groups.joinNotFound')
              : t('tasks.groups.joinGeneric');
        showToast({ message, variant: 'error' });
        return;
      }
      const hydrated = await fetchHydratedTaskData(currentUserId);
      if (hydrated.ok) {
        dispatch({ type: 'hydrate/task-data', ...hydrated.value });
      }
      setJoinCode(''); setShowJoinCodeInput(false);
      showToast({ message: t('tasks.groups.joinSuccessMessage'), variant: 'success' });
      return;
    }

    const match = Object.entries(state.entities.taskGroups).map(([id, group]) => ({ id, group })).find(({ group }) => (group.inviteCode || '').toUpperCase() === trimmed.toUpperCase());
    if (!match) { showToast({ message: t('tasks.groups.joinNotFound'), variant: 'error' }); return; }

    const alreadyMember = match.group.ownerUserId === currentUserId || match.group.memberIds.includes(currentUserId);
    if (alreadyMember) { showToast({ message: t('tasks.groups.joinConflict'), variant: 'error' }); return; }

    const serviceResult = await taskGroupService.joinByInviteCode({ inviteCode: trimmed, userId: currentUserId });
    if (!serviceResult.ok) { showToast({ message: t('tasks.groups.joinGeneric'), variant: 'error' }); return; }

    const result = dispatch({ type: 'task-groups/add-member', groupId: match.id, userId: currentUserId });
    if (!result.ok) { showToast({ message: t('tasks.groups.joinGeneric'), variant: 'error' }); return; }

    setJoinCode(''); setShowJoinCodeInput(false);
    showToast({ message: t('tasks.groups.joinSuccessMessage'), variant: 'success' });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId || !selectedGroup) return;
    setConfirmDeleteGroupVisible(true);
  };

  const handleConfirmDeleteGroup = async () => {
    setConfirmDeleteGroupVisible(false);
    if (!selectedGroupId) return;
    const serviceResult = await taskGroupService.deleteGroup(selectedGroupId);
    if (!serviceResult.ok) { showToast({ message: t('tasks.groups.deleteErrorMessage'), variant: 'error' }); return; }
    const result = dispatch({ type: 'task-groups/delete', groupId: selectedGroupId });
    if (!result.ok) { showToast({ message: t('tasks.groups.deleteErrorMessage'), variant: 'error' }); return; }
    setOpenedGroupId(null); showToast({ message: t('tasks.groups.deleteSuccessMessage'), variant: 'success' });
  };

  const handleAddMember = async () => {
    if (!selectedGroupId) return; const trimmedUserId = memberUserId.trim(); if (!trimmedUserId) { showToast({ message: t('tasks.groups.memberRequired'), variant: 'error' }); return; }
    const serviceResult = await taskGroupService.addMember(selectedGroupId, trimmedUserId);
    if (!serviceResult.ok) { showToast({ message: t('tasks.groups.memberErrorMessage'), variant: 'error' }); return; }
    const result = dispatch({ type: 'task-groups/add-member', groupId: selectedGroupId, userId: trimmedUserId });
    if (!result.ok) { showToast({ message: t('tasks.groups.memberErrorMessage'), variant: 'error' }); return; }
    setMemberUserId('');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroupId) return; const serviceResult = await taskGroupService.removeMember(selectedGroupId, userId);
    if (!serviceResult.ok) { showToast({ message: t('tasks.groups.memberErrorMessage'), variant: 'error' }); return; }
    dispatch({ type: 'task-groups/remove-member', groupId: selectedGroupId, userId });
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroupId || !selectedGroup) return; if (selectedGroup.ownerUserId === currentUserId) { showToast({ message: t('tasks.groups.ownerCannotLeave'), variant: 'error' }); return; }
    const serviceResult = await taskGroupService.leaveGroup(selectedGroupId, currentUserId);
    if (!serviceResult.ok) { showToast({ message: t('tasks.groups.leaveErrorMessage'), variant: 'error' }); return; }
    const result = dispatch({ type: 'task-groups/leave', groupId: selectedGroupId, userId: currentUserId });
    if (!result.ok) {
      showToast({ message: t('tasks.groups.leaveErrorMessage'), variant: 'error' });
      return;
    }
    setOpenedGroupId(null); showToast({ message: t('tasks.groups.leaveSuccessMessage'), variant: 'success' });
  };

  const tabOptions = useMemo<ReadonlyArray<SegmentedControlOption<TasksTab>>>(() => [
    { value: 'tasks', label: t('tasks.tabs.tasks') },
    { value: 'groups', label: t('tasks.tabs.groups') },
  ], [t]);

  return (
    <View style={styles.root}>
      <TopBar />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <View style={styles.switcherWrap}>
          <SegmentedControl<TasksTab> options={tabOptions} value={activeTab} onChange={setActiveTab} accessibilityLabel={t('screens.tasks')} />
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
                    <AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.selectedGroupSection')}</AppText>
                  </View>
                  <AppText variant="label">{openedGroup.name}</AppText>
                  <AppText variant="caption" color="textSecondary" style={styles.sectionSubtitle}>
                    {t('tasks.groups.selectedGroupMeta', { privacy: t(`tasks.groups.privacy.${openedGroup.privacy}`), role: currentRoleLabel, code: openedGroup.inviteCode || '-' })}
                  </AppText>

                  <AppInput value={editGroupName} onChangeText={setEditGroupName} placeholder={t('tasks.groups.groupNamePlaceholder')} style={styles.tightInput} />
                  <View style={styles.inlineControlsRow}>{GROUP_PRIVACY_VALUES.map((privacy) => (
                    <Pressable key={privacy} style={({ pressed }) => [styles.chip, editGroupPrivacy === privacy && styles.chipActive, pressed && styles.chipPressed]} onPress={() => setEditGroupPrivacy(privacy)} accessibilityRole="button">
                      <AppText variant="caption" color={editGroupPrivacy === privacy ? 'textOnPrimary' : 'textPrimary'}>{t(`tasks.groups.privacy.${privacy}`)}</AppText>
                    </Pressable>
                  ))}</View>
                  <View style={styles.inlineActionButtons}><AppButton title={t('tasks.groups.saveChanges')} onPress={handleEditGroup} /><AppButton title={t('tasks.groups.deleteGroup')} onPress={handleDeleteGroup} style={styles.destructiveButton} /></View>

                  <View style={styles.sectionHeaderRow}><AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.membersSection')}</AppText></View>
                  <AppInput value={memberUserId} onChangeText={setMemberUserId} placeholder={t('tasks.groups.memberInputPlaceholder')} style={styles.tightInput} />
                  <AppButton title={t('tasks.groups.addMember')} onPress={handleAddMember} disabled={!memberUserId.trim()} />
                  <View style={styles.memberList}>
                    <View style={styles.memberRow}><AppText variant="caption" color="textSecondary">{state.entities.users[openedGroup.ownerUserId]?.username ?? openedGroup.ownerUserId}</AppText><View style={styles.groupPill}><AppText variant="caption">{t('tasks.groups.ownerBadge')}</AppText></View></View>
                    {openedGroup.memberIds.map((memberId) => (
                      <View key={memberId} style={styles.memberRow}><AppText variant="caption" color="textSecondary">{state.entities.users[memberId]?.username ?? memberId}</AppText><Pressable onPress={() => handleRemoveMember(memberId)} style={({ pressed }) => [styles.inlineDanger, pressed && styles.inlineDangerPressed]}><AppText variant="caption" color="textOnPrimary">{t('tasks.groups.removeMember')}</AppText></Pressable></View>
                    ))}
                  </View>
                  {openedGroup.ownerUserId !== currentUserId ? <AppButton title={t('tasks.groups.leaveGroup')} onPress={handleLeaveGroup} /> : null}
                </View>
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={styles.groupsContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sectionHeaderRow}><AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.actionsSection')}</AppText></View>
                <View style={styles.sectionCard}>
                  <View style={styles.actionsColumn}>
                    <Pressable onPress={() => setShowJoinCodeInput((v) => !v)} style={({ pressed }) => [styles.actionBar, styles.actionBarBrown, pressed && styles.actionBarPressed]} accessibilityRole="button">
                      <AppText variant="label" color="textOnPrimary">{t('tasks.groups.joinAction')}</AppText>
                    </Pressable>

                    {showJoinCodeInput ? (
                      <View style={styles.joinForm}><AppInput value={joinCode} onChangeText={setJoinCode} placeholder={t('tasks.groups.joinPlaceholder')} autoCapitalize="characters" style={styles.joinInput} /><AppButton title={t('tasks.groups.joinCta')} onPress={handleJoinGroup} disabled={!joinCode.trim()} /></View>
                    ) : null}

                    <Pressable onPress={() => navigation.navigate('CreateGroup')} style={({ pressed }) => [styles.actionBar, styles.actionBarBrown, pressed && styles.actionBarPressed]} accessibilityRole="button">
                      <AppText variant="label" color="textOnPrimary">{t('tasks.groups.createAction')}</AppText>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.sectionHeaderRow}><AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.myGroupsSection')}</AppText></View>
                <View style={styles.groupList}>{memberGroups.length === 0 ? <EmptyState icon="albums-outline" title={t('tasks.groups.emptyTitle')} message={t('tasks.groups.emptyMessage')} /> : memberGroups.map(({ id, group }) => (
                  <Pressable key={id} style={({ pressed }) => [styles.groupCard, selectedGroupId === id && styles.groupCardActive, pressed && styles.groupCardPressed]} accessibilityRole="button" accessibilityLabel={group.name} onPress={() => { setSelectedGroupId(id); navigation.navigate('EditGroup', { groupId: id }); }}>
                    <View style={styles.groupTopRow}><AppText variant="label" color="textPrimary">{group.name}</AppText><View style={styles.groupPill}><AppText variant="caption" color="textPrimary">{group.ownerUserId === currentUserId ? t('tasks.groups.roleOwner') : t('tasks.groups.roleMember')}</AppText></View></View>
                    <View style={styles.groupMetaRow}><View style={styles.metaItem}><Ionicons name="list" size={16} color={colors.muted} /><AppText variant="caption" color="textSecondary">{t('tasks.groups.taskCount', { count: group.taskIds.length })}</AppText></View><View style={styles.metaDivider} /><View style={styles.metaItem}><Ionicons name="people" size={16} color={colors.muted} /><AppText variant="caption" color="textSecondary">{t('tasks.groups.memberCount', { count: group.memberIds.length + 1 })}</AppText></View></View>
                  </Pressable>
                ))}</View>
              </ScrollView>
            )
          ) : (
            <ScrollView contentContainerStyle={styles.groupsContent} showsVerticalScrollIndicator={false}>
              <View style={styles.sectionHeaderRow}><AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.actionsSection')}</AppText></View>
              <View style={styles.sectionCard}>
                <View style={styles.actionsColumn}>
                  <Pressable onPress={() => navigation.navigate('CreateTask', { groupId: undefined })} style={({ pressed }) => [styles.actionBar, styles.actionBarBrown, pressed && styles.actionBarPressed]} accessibilityRole="button">
                    <AppText variant="label" color="textOnPrimary">{t('tasks.tasks.addTaskAction')}</AppText>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('AddProgress')} style={({ pressed }) => [styles.actionBar, styles.actionBarBrown, pressed && styles.actionBarPressed]} accessibilityRole="button">
                    <AppText variant="label" color="textOnPrimary">{t('tasks.tasks.addProgressAction')}</AppText>
                  </Pressable>
                </View>
              </View>

              <View style={styles.sectionHeaderRow}><AppText variant="caption" color="muted" style={styles.sectionTitle}>{t('tasks.groups.myGroupsSection')}</AppText></View>
              <View style={styles.groupList}>{memberGroups.length === 0 ? <EmptyState icon="checkmark-done-outline" title={t('tasks.tasks.noGroupSelectedTitle')} message={t('tasks.tasks.noGroupSelectedMessage')} /> : memberGroups.map(({ id, group }) => (
                <Pressable key={id} style={({ pressed }) => [styles.groupCard, pressed && styles.groupCardPressed]} accessibilityRole="button" accessibilityLabel={group.name} onPress={() => { setSelectedGroupId(id); navigation.navigate('GroupTasks', { groupId: id }); }}>
                  <View style={styles.groupTopRow}><AppText variant="label" color="textPrimary">{group.name}</AppText><View style={styles.groupPill}><AppText variant="caption" color="textPrimary">{group.ownerUserId === currentUserId ? t('tasks.groups.roleOwner') : t('tasks.groups.roleMember')}</AppText></View></View>
                  <View style={styles.groupMetaRow}><View style={styles.metaItem}><Ionicons name="list" size={16} color={colors.muted} /><AppText variant="caption" color="textSecondary">{t('tasks.groups.taskCount', { count: group.taskIds.length })}</AppText></View><View style={styles.metaDivider} /><View style={styles.metaItem}><Ionicons name="people" size={16} color={colors.muted} /><AppText variant="caption" color="textSecondary">{t('tasks.groups.memberCount', { count: group.memberIds.length + 1 })}</AppText></View></View>
                </Pressable>
              ))}</View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmDeleteGroupVisible}
        title={t('tasks.groups.deleteTitle')}
        message={t('tasks.groups.deleteMessage')}
        confirmLabel={t('tasks.common.delete')}
        cancelLabel={t('tasks.common.cancel')}
        destructive
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setConfirmDeleteGroupVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  switcherWrap: { paddingHorizontal: SCREEN_PADDING_H, paddingTop: spacing.md },
  tabContent: { flex: 1, paddingHorizontal: SCREEN_PADDING_H, paddingTop: spacing.md },
  groupsContent: { paddingBottom: spacing.xl, gap: spacing.md },
  sectionHeaderRow: { marginBottom: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  sectionCard: { padding: spacing.md, borderRadius: 18, backgroundColor: colors.cardSurfaceTranslucent, borderWidth: 1, borderColor: colors.cardBorderTranslucent },
  sectionSubtitle: { marginBottom: spacing.sm },
  inlineControlsRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.inputBorderIdle, backgroundColor: colors.surfaceAlt },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipPressed: { opacity: 0.8 },
  tightInput: { marginBottom: spacing.xs },
  inlineActionButtons: { gap: spacing.xs, marginBottom: spacing.md },
  quickActionsWrapRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between', flexWrap: 'wrap' },
  actionCard: { width: '48%', padding: spacing.md, borderRadius: 14, backgroundColor: colors.cardSurfaceTranslucent, borderWidth: 1, borderColor: colors.cardBorderTranslucent, alignItems: 'center' },
  actionCardPressed: { transform: [{ scale: 0.99 }] },
  actionIconWrap: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm },
  joinForm: { marginTop: spacing.sm, gap: spacing.sm },
  joinInput: { marginTop: spacing.sm, marginBottom: 0 },
  destructiveButton: { opacity: 0.9 },
  groupList: { gap: spacing.md },
  groupCard: { padding: spacing.md, borderRadius: 18, backgroundColor: colors.cardSurfaceTranslucent, borderWidth: 1, borderColor: colors.cardBorderTranslucent },
  groupCardPressed: { transform: [{ scale: 0.99 }] },
  groupCardActive: { borderColor: colors.primary, borderWidth: 2 },
  groupTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  groupPill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceAlt },
  groupMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaDivider: { width: 1, height: 14, backgroundColor: colors.dividerLine },
  memberList: { marginVertical: spacing.sm, gap: spacing.xs },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.dividerLine, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  inlineDanger: { backgroundColor: colors.danger, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  inlineDangerPressed: { opacity: 0.75 },
  actionsColumn: { flexDirection: 'column', gap: spacing.sm },
  actionBar: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.cardBorderTranslucent, marginBottom: spacing.sm },
  actionBarPressed: { transform: [{ scale: 0.995 }] },
  actionBarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  actionBarText: { flex: 1 },
  actionBarSubtitle: { marginTop: 2 },
  actionBarBrown: { backgroundColor: colors.primary, borderColor: colors.primary },
});
