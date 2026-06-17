import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppText } from '../../components/common/AppText';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { useAppState } from '../../application/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { taskGroupService } from '../../services';
import { TopBar } from '../../components/layout/TopBar';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { MemberRole, TaskGroupPrivacy, TaskGroupType } from '../../application/state';

export const EditGroupScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const { groupId } = route.params as { groupId: string };

  const group = state.entities.taskGroups[groupId];
  const [name, setName] = useState(group?.name ?? '');
  const [privacy, setPrivacy] = useState<TaskGroupPrivacy>(group?.privacy ?? 'private');
  const [groupType, setGroupType] = useState<TaskGroupType>(group?.type ?? 'cooperative');
  const [isBingo, setIsBingo] = useState<boolean>(group?.isBingo ?? false);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const editableRoles: Exclude<MemberRole, 'owner'>[] = ['member', 'admin'];
  const currentUserRole: MemberRole = group?.ownerUserId === state.session.currentUserId
    ? 'owner'
    : group?.memberRoles[state.session.currentUserId ?? ''] ?? 'member';
  const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'owner';

  const privacyOptions = useMemo(
    () => [
      { value: 'private', label: t('tasks.groups.privacy.private') },
      { value: 'public', label: t('tasks.groups.privacy.public') },
    ] as const,
    [t],
  );

  const groupTypeOptions = useMemo(
    () => [
      { value: 'cooperative', label: t('tasks.groups.groupTypeCooperative') },
      { value: 'competitive', label: t('tasks.groups.groupTypeCompetitive') },
    ] as const,
    [t],
  );

  if (!group) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBar title={t('tasks.groups.editAction') || t('tasks.groups.createAction')} showBackButton showRightActions={false} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <AppText variant="label">{t('tasks.groups.notFound') || 'Group not found'}</AppText>
        </SafeAreaView>
      </View>
    );
  }

  // Plain members may only view tasks / add progress — they must not reach group settings.
  if (currentUserRole === 'member') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBar title={t('tasks.groups.editAction')} showBackButton showRightActions={false} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <AppText variant="label">{t('tasks.groups.editForbidden')}</AppText>
        </SafeAreaView>
      </View>
    );
  }

  const handleDeleteGroup = async () => {
    setConfirmDeleteVisible(false);
    const res = await taskGroupService.deleteGroup(groupId);
    if (!res.ok) {
      showToast({ message: t('tasks.groups.deleteErrorMessage'), variant: 'error' });
      return;
    }
    const result = dispatch({ type: 'task-groups/delete', groupId });
    if (!result.ok) {
      showToast({ message: t('tasks.groups.deleteErrorMessage'), variant: 'error' });
      return;
    }
    showToast({ message: t('tasks.groups.deleteSuccessMessage'), variant: 'success' });
    navigation.goBack();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast({ message: t('tasks.groups.nameRequired'), variant: 'error' });
      return;
    }

    if (isBingo && !group.isBingo) {
      const count = group.taskIds.length;
      if (count !== 9 && count !== 16 && count !== 25) {
        showToast({
          message: t('tasks.groups.bingoConvertInvalidCount', { count }),
          variant: 'error',
        });
        return;
      }
    }

    const effectiveGroupType: TaskGroupType = isBingo ? 'cooperative' : groupType;

    const res = await taskGroupService.editGroup(groupId, {
      name: trimmed,
      privacy,
      type: effectiveGroupType,
      isBingo,
    });
    if (!res.ok) {
      showToast({ message: t('tasks.groups.editErrorMessage'), variant: 'error' });
      return;
    }

    const result = dispatch({
      type: 'task-groups/edit',
      groupId,
      name: trimmed,
      privacy,
      groupType: effectiveGroupType,
      isBingo,
    });
    if (!result.ok) {
      showToast({ message: t('tasks.groups.editErrorMessage'), variant: 'error' });
      return;
    }
    showToast({ message: t('tasks.groups.editSuccessMessage'), variant: 'success' });
    navigation.goBack();
  };

  const handleCopyCode = async () => {
    const code = group?.inviteCode;
    if (!code) return;
    await Clipboard.setStringAsync(code);
    showToast({ message: t('tasks.groups.inviteCodeCopied'), variant: 'success' });
  };

  const handleRemoveMember = async (userId: string) => {
    const res = await taskGroupService.removeMember(groupId, userId);
    if (!res.ok) {
      showToast({ message: t('tasks.groups.removeMemberErrorMessage'), variant: 'error' });
      return;
    }

    dispatch({ type: 'task-groups/remove-member', groupId, userId });
  };

  const handleChangeRole = async (userId: string, newRole: Exclude<MemberRole, 'owner'>) => {
    const res = await taskGroupService.changeRole(groupId, userId, newRole);
    if (!res.ok) {
      showToast({ message: t('tasks.groups.changeRoleErrorMessage'), variant: 'error' });
      return;
    }

    dispatch({ type: 'task-groups/change-role', groupId, userId, role: newRole });
  };

  const getMemberName = (userId: string) => state.entities.users[userId]?.username ?? userId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t('tasks.groups.editAction') || t('tasks.groups.createAction')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={[ 'left', 'right', 'bottom' ]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.basicInfoSection')}
            </AppText>
            <AppInput value={name} onChangeText={setName} placeholder={t('tasks.groups.groupNamePlaceholder')} />
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.inviteCodeSection')}
            </AppText>
            <View style={styles.inviteCodeRow}>
              <AppText
                variant="label"
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.inviteCodeText}
              >
                {group.inviteCode || '-'}
              </AppText>
              <Pressable
                onPress={handleCopyCode}
                style={({ pressed }) => [styles.copyButton, pressed && styles.copyButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel={t('tasks.groups.inviteCodeCopy')}
              >
                <Ionicons name="copy-outline" size={16} color={colors.textOnPrimary} />
                <AppText variant="caption" color="textOnPrimary">
                  {t('tasks.groups.inviteCodeCopy')}
                </AppText>
              </Pressable>
            </View>
            <AppText variant="caption" color="textSecondary">
              {t('tasks.groups.inviteCodeHint')}
            </AppText>
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.privacySection')}
            </AppText>
            <SegmentedControl<TaskGroupPrivacy>
              options={privacyOptions}
              value={privacy}
              onChange={setPrivacy}
              accessibilityLabel={t('tasks.groups.privacySection')}
            />
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.groupTypeSection')}
            </AppText>
            <SegmentedControl<TaskGroupType>
              options={groupTypeOptions}
              value={groupType}
              onChange={setGroupType}
              disabledValues={isBingo ? ['competitive'] : []}
              accessibilityLabel={t('tasks.groups.groupTypeSection')}
            />
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.bingoSection')}
            </AppText>
            <Pressable
              onPress={() => {
                setIsBingo((value) => {
                  const nextValue = !value;
                  if (nextValue) {
                    setGroupType('cooperative');
                  }
                  return nextValue;
                });
              }}
              style={({ pressed }) => [styles.toggleCard, pressed && styles.toggleCardPressed]}
              accessibilityRole="switch"
              accessibilityState={{ checked: isBingo }}
            >
              <View style={styles.toggleTextWrap}>
                <AppText variant="label">{isBingo ? t('tasks.groups.bingoOn') : t('tasks.groups.bingoOff')}</AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('tasks.groups.bingoDescription')}
                </AppText>
              </View>
              <View style={[styles.toggleKnob, isBingo && styles.toggleKnobActive]} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.membersSection')}
            </AppText>
            <View style={styles.memberList}>
              <View style={styles.memberRow}>
                <AppText variant="caption" color="textSecondary" style={styles.memberUserId}>
                  {getMemberName(group.ownerUserId)}
                </AppText>
                <View style={styles.memberBadge}>
                  <AppText variant="caption" color="textPrimary" style={styles.memberBadgeText}>
                    {t('tasks.groups.roleOwner')}
                  </AppText>
                </View>
              </View>
              {group.memberIds.map((memberId) => {
                const memberRole: MemberRole = group.memberRoles?.[memberId] || 'member';
                const isExpanded = expandedMemberId === memberId;
                return (
                  <View key={memberId} style={styles.memberBlock}>
                    <Pressable
                      onPress={() => {
                        if (!canManageMembers) {
                          return;
                        }
                        setExpandedMemberId((value) => (value === memberId ? null : memberId));
                      }}
                      style={({ pressed }) => [styles.memberRow, pressed && canManageMembers && styles.memberRowPressed]}
                      accessibilityRole={canManageMembers ? 'button' : 'text'}
                      accessibilityState={{ expanded: isExpanded }}
                    >
                      <AppText variant="caption" color="textSecondary" style={styles.memberUserId}>
                        {getMemberName(memberId)}
                      </AppText>
                      <View style={styles.memberBadge}>
                        <AppText variant="caption" color="textPrimary" style={styles.memberBadgeText}>
                          {t(`tasks.groups.role${memberRole.charAt(0).toUpperCase()}${memberRole.slice(1)}`)}
                        </AppText>
                      </View>
                    </Pressable>
                    {canManageMembers && isExpanded ? (
                      <View style={styles.memberActionsPanel}>
                        <View style={styles.roleOptionsRow}>
                          {editableRoles.map((role) => (
                            <Pressable
                              key={role}
                              onPress={() => {
                                handleChangeRole(memberId, role);
                                setExpandedMemberId(null);
                              }}
                              style={({ pressed }) => [
                                styles.roleOption,
                                memberRole === role && styles.roleOptionActive,
                                pressed && styles.roleOptionPressed,
                              ]}
                              accessibilityRole="button"
                            >
                              <AppText
                                variant="caption"
                                color={memberRole === role ? 'textOnPrimary' : 'textPrimary'}
                              >
                                {t(`tasks.groups.role${role.charAt(0).toUpperCase()}${role.slice(1)}`)}
                              </AppText>
                            </Pressable>
                          ))}
                        </View>
                        <Pressable
                          onPress={() => handleRemoveMember(memberId)}
                          style={({ pressed }) => [styles.removeMemberBtn, pressed && styles.removeMemberBtnPressed]}
                          accessibilityRole="button"
                        >
                          <AppText variant="caption" color="danger">
                            {t('tasks.groups.removeMember')}
                          </AppText>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

          </View>

          <View style={styles.actions}>
            <AppButton title={t('tasks.groups.saveChanges')} onPress={handleSave} disabled={!name.trim()} />
            {currentUserRole === 'owner' ? (
              <AppButton
                title={t('tasks.groups.deleteGroup')}
                onPress={() => setConfirmDeleteVisible(true)}
                style={styles.deleteButton}
              />
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title={t('tasks.groups.deleteTitle')}
        message={t('tasks.groups.deleteMessage')}
        confirmLabel={t('tasks.common.delete')}
        cancelLabel={t('tasks.common.cancel')}
        destructive
        onConfirm={handleDeleteGroup}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inviteCodeText: {
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  copyButtonPressed: {
    backgroundColor: colors.primaryPressed,
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
  toggleKnob: { width: 48, height: 30, borderRadius: 15, backgroundColor: 'rgba(30,19,14,0.12)', borderWidth: 1, borderColor: colors.dividerLine },
  toggleKnobActive: { backgroundColor: colors.primary },
  memberList: {
    gap: spacing.sm,
  },
  memberBlock: {
    gap: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(30,19,14,0.08)',
    borderRadius: 10,
  },
  memberRowPressed: {
    opacity: 0.88,
  },
  memberUserId: {
    flex: 1,
  },
  memberBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberControls: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  memberActionsPanel: {
    paddingLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  roleOptionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  roleOption: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.dividerLine,
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleOptionPressed: {
    opacity: 0.8,
  },
  roleButton: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  roleButtonPressed: {
    opacity: 0.7,
  },
  removeMemberBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.dividerLine,
  },
  removeMemberBtnPressed: {
    opacity: 0.7,
  },
  actions: { marginTop: spacing.sm, gap: spacing.sm },
  deleteButton: { marginTop: 0 },
});

export default EditGroupScreen;
