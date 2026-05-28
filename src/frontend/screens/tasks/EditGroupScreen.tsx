import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppText } from '../../components/common/AppText';
import { SegmentedControl, type SegmentedControlOption } from '../../components/common/SegmentedControl';
import { useAppState } from '../../application/AppStateContext';
import { taskGroupService } from '../../services';
import { TopBar } from '../../components/layout/TopBar';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { TaskGroupPrivacy, TaskGroupType } from '../../application/state';

export const EditGroupScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppState();
  const { groupId } = route.params as { groupId: string };

  const group = state.entities.taskGroups[groupId];
  const [name, setName] = useState(group?.name ?? '');
  const [privacy, setPrivacy] = useState<TaskGroupPrivacy>(group?.privacy ?? 'private');
  const [groupType, setGroupType] = useState<TaskGroupType>(group?.type ?? 'cooperative');
  const [isBingo, setIsBingo] = useState<boolean>(group?.isBingo ?? false);

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

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('tasks.groups.validationTitle'), t('tasks.groups.nameRequired'));
      return;
    }

    const res = await taskGroupService.editGroup(groupId, { name: trimmed, privacy, type: groupType, isBingo });
    if (!res.ok) {
      Alert.alert(t('tasks.groups.editErrorTitle'), t('tasks.groups.editErrorMessage'));
      return;
    }

    dispatch({ type: 'task-groups/edit', groupId, name: trimmed, privacy, groupType, isBingo });
    navigation.goBack();
  };

  const handleRemoveMember = async (userId: string) => {
    const res = await taskGroupService.removeMember(groupId, userId);
    if (!res.ok) {
      Alert.alert(t('tasks.groups.memberErrorTitle'), 'Could not remove member');
      return;
    }

    dispatch({ type: 'task-groups/remove-member', groupId, userId });
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const res = await taskGroupService.changeRole(groupId, userId, newRole);
    if (!res.ok) {
      Alert.alert(t('tasks.groups.memberErrorTitle'), 'Could not change member role');
      return;
    }

    dispatch({ type: 'task-groups/change-role', groupId, userId, role: newRole });
  };

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
              accessibilityLabel={t('tasks.groups.groupTypeSection')}
            />
          </View>

          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.bingoSection')}
            </AppText>
            <Pressable
              onPress={() => setIsBingo((v) => !v)}
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
                  {group.ownerUserId}
                </AppText>
                <View style={styles.memberBadge}>
                  <AppText variant="caption" color="textPrimary" style={styles.memberBadgeText}>
                    {t('tasks.groups.roleOwner')}
                  </AppText>
                </View>
              </View>
              {group.memberIds.map((memberId) => {
                const memberRole = group.memberRoles?.[memberId] || 'member';
                return (
                  <View key={memberId} style={styles.memberRow}>
                    <AppText variant="caption" color="textSecondary" style={styles.memberUserId}>
                      {memberId}
                    </AppText>
                    <View style={styles.memberControls}>
                      <Pressable
                        onPress={() => {
                          const roles = ['member', 'admin', 'owner'];
                          const currentIndex = roles.indexOf(memberRole);
                          const nextIndex = (currentIndex + 1) % roles.length;
                          handleChangeRole(memberId, roles[nextIndex]);
                        }}
                        style={({ pressed }) => [styles.roleButton, pressed && styles.roleButtonPressed]}
                        accessibilityRole="button"
                      >
                        <AppText variant="caption" color="textSecondary">
                          {t(`tasks.groups.role${memberRole.charAt(0).toUpperCase()}${memberRole.slice(1)}`)}
                        </AppText>
                      </Pressable>
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
                  </View>
                );
              })}
            </View>

          </View>

          <View style={styles.actions}>
            <AppButton title={t('tasks.groups.saveChanges')} onPress={handleSave} disabled={!name.trim()} />
          </View>
        </ScrollView>
      </SafeAreaView>
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(30,19,14,0.08)',
    borderRadius: 10,
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
  },
  removeMemberBtnPressed: {
    opacity: 0.7,
  },
  actions: { marginTop: spacing.sm },
});

export default EditGroupScreen;
