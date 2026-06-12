import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { useToast } from '../../context/ToastContext';
import { taskGroupService } from '../../services';
import { USE_HTTP_SERVICES } from '../../services/http/config';
import { fetchHydratedTaskData } from '../../services/http/hydrateTaskData';
import { TopBar } from '../../components/layout/TopBar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const JoinGroupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();
  const { showToast } = useToast();

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      showToast({ message: t('tasks.groups.joinEmptyMessage'), variant: 'error' });
      return;
    }

    if (USE_HTTP_SERVICES) {
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
      showToast({ message: t('tasks.groups.joinSuccessMessage'), variant: 'success' });
      navigation.goBack();
      return;
    }

    const match = Object.entries(state.entities.taskGroups).map(([id, group]) => ({ id, group })).find(({ group }) => (group.inviteCode || '').toUpperCase() === trimmed.toUpperCase());
    if (!match) {
      showToast({ message: t('tasks.groups.joinNotFound'), variant: 'error' });
      return;
    }

    const alreadyMember = match.group.ownerUserId === currentUserId || match.group.memberIds.includes(currentUserId);
    if (alreadyMember) {
      showToast({ message: t('tasks.groups.joinConflict'), variant: 'error' });
      return;
    }

    const serviceResult = await taskGroupService.joinByInviteCode({ inviteCode: trimmed, userId: currentUserId });
    if (!serviceResult.ok) {
      showToast({ message: t('tasks.groups.joinGeneric'), variant: 'error' });
      return;
    }

    const result = dispatch({ type: 'task-groups/add-member', groupId: match.id, userId: currentUserId });
    if (!result.ok) {
      showToast({ message: t('tasks.groups.joinGeneric'), variant: 'error' });
      return;
    }

    showToast({ message: t('tasks.groups.joinSuccessMessage'), variant: 'success' });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t('tasks.groups.joinAction')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={[ 'left', 'right', 'bottom' ]}>
        <AppInput value={code} onChangeText={setCode} placeholder={t('tasks.groups.joinPlaceholder')} autoCapitalize="characters" style={styles.input} />
        <View style={styles.actions}>
          <AppButton title={t('tasks.groups.joinCta')} onPress={handleJoin} disabled={!code.trim()} />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  input: { marginTop: spacing.lg },
  actions: { marginTop: 16 },
});
