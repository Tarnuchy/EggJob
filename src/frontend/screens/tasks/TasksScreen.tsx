import React, { useMemo, useState } from 'react';
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
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import { taskGroupService } from '../../services';
import { useAppState } from '../../application/AppStateContext';
import { selectCurrentUserId } from '../../application/selectors';

type TasksTab = 'tasks' | 'groups';

export const TasksScreen = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TasksTab>('tasks');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { state } = useAppState();
  const currentUserId = selectCurrentUserId(state);

  const handleJoinGroup = async () => {
    const trimmedCode = joinCode.trim();
    if (!trimmedCode) {
      Alert.alert(t('tasks.groups.joinEmptyTitle'), t('tasks.groups.joinEmptyMessage'));
      return;
    }
    if (!currentUserId) {
      Alert.alert(t('tasks.groups.joinNoUserTitle'), t('tasks.groups.joinNoUserMessage'));
      return;
    }

    setIsJoining(true);
    const result = await taskGroupService.joinByInviteCode({
      inviteCode: trimmedCode,
      userId: currentUserId,
    });
    setIsJoining(false);

    if (!result.ok) {
      const code = result.error.code;
      const message =
        code === 'not-found'
          ? t('tasks.groups.joinNotFound')
          : code === 'conflict'
            ? t('tasks.groups.joinConflict')
            : code === 'validation'
              ? t('tasks.groups.joinInvalid')
              : code === 'unauthorized'
                ? t('tasks.groups.joinUnauthorized')
                : t('tasks.groups.joinGeneric');
      Alert.alert(t('tasks.groups.joinErrorTitle'), message);
      return;
    }

    setJoinCode('');
    Alert.alert(t('tasks.groups.joinSuccessTitle'), t('tasks.groups.joinSuccessMessage'));
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
          {activeTab === 'tasks' ? (
            <View style={styles.emptyTab} />
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
              <View style={styles.actionRow}>
                <View style={styles.actionCard}>
                  <View style={styles.actionIconWrap}>
                    <Ionicons name="enter-outline" size={20} color={colors.primary} />
                  </View>
                  <AppText variant="label" color="textPrimary">
                    {t('tasks.groups.joinAction')}
                  </AppText>
                  <AppText variant="caption" color="textSecondary" style={styles.actionSubtitle}>
                    {t('tasks.groups.joinSubtitle')}
                  </AppText>
                  <AppInput
                    value={joinCode}
                    onChangeText={setJoinCode}
                    placeholder={t('tasks.groups.joinPlaceholder')}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    accessibilityLabel={t('tasks.groups.joinPlaceholder')}
                    style={styles.joinInput}
                  />
                  <AppButton
                    title={t('tasks.groups.joinCta')}
                    onPress={handleJoinGroup}
                    isLoading={isJoining}
                    disabled={!joinCode.trim() || isJoining}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionCard,
                    pressed && styles.actionCardPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('tasks.groups.createAction')}
                  onPress={() => undefined}
                >
                  <View style={styles.actionIconWrap}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  </View>
                  <AppText variant="label" color="textPrimary">
                    {t('tasks.groups.createAction')}
                  </AppText>
                  <AppText variant="caption" color="textSecondary" style={styles.actionSubtitle}>
                    {t('tasks.groups.createSubtitle')}
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.sectionHeaderRow}>
                <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                  {t('tasks.groups.myGroupsSection')}
                </AppText>
              </View>
              <View style={styles.groupList}>
                {MOCK_GROUPS.map((group) => (
                  <Pressable
                    key={group.id}
                    style={({ pressed }) => [
                      styles.groupCard,
                      pressed && styles.groupCardPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={group.name}
                    onPress={() => undefined}
                  >
                    <View style={styles.groupTopRow}>
                      <AppText variant="label" color="textPrimary">
                        {group.name}
                      </AppText>
                      <View style={styles.groupPill}>
                        <AppText variant="caption" color="textPrimary">
                          {group.roleLabel}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.groupMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="list" size={16} color={colors.muted} />
                        <AppText variant="caption" color="textSecondary">
                          {t('tasks.groups.taskCount', { count: group.taskCount })}
                        </AppText>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <Ionicons name="people" size={16} color={colors.muted} />
                        <AppText variant="caption" color="textSecondary">
                          {t('tasks.groups.memberCount', { count: group.memberCount })}
                        </AppText>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const MOCK_GROUPS = [
  {
    id: 'group-1',
    name: 'October Fit',
    taskCount: 12,
    memberCount: 5,
    roleLabel: 'Owner',
  },
  {
    id: 'group-2',
    name: 'FitCrew 5K',
    taskCount: 8,
    memberCount: 14,
    roleLabel: 'Member',
  },
  {
    id: 'group-3',
    name: 'Egg Eating Challenge',
    taskCount: 4,
    memberCount: 9,
    roleLabel: 'Admin',
  },
];

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
  emptyTab: {
    flex: 1,
  },
  groupsContent: {
    paddingBottom: spacing.xl,
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
});
