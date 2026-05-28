import React, { useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { taskGroupService } from '../../services';
import { TopBar } from '../../components/layout/TopBar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const JoinGroupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { state, dispatch } = useAppState();
  const currentUserId = useCurrentUserId();

  const handleJoin = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      Alert.alert(t('tasks.groups.joinEmptyTitle'), t('tasks.groups.joinEmptyMessage'));
      return;
    }

    const match = Object.entries(state.entities.taskGroups).map(([id, group]) => ({ id, group })).find(({ group }) => (group.inviteCode || '').toUpperCase() === trimmed.toUpperCase());
    if (!match) {
      Alert.alert(t('tasks.groups.joinErrorTitle'), t('tasks.groups.joinNotFound'));
      return;
    }

    const alreadyMember = match.group.ownerUserId === currentUserId || match.group.memberIds.includes(currentUserId);
    if (alreadyMember) {
      Alert.alert(t('tasks.groups.joinErrorTitle'), t('tasks.groups.joinConflict'));
      return;
    }

    const serviceResult = await taskGroupService.joinByInviteCode({ inviteCode: trimmed, userId: currentUserId });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.joinErrorTitle'), t('tasks.groups.joinGeneric'));
      return;
    }

    dispatch({ type: 'task-groups/add-member', groupId: match.id, userId: currentUserId });
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
