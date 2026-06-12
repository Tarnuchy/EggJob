import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { AppText } from '../../components/common/AppText';
import { SegmentedControl, type SegmentedControlOption } from '../../components/common/SegmentedControl';
import { useAppState } from '../../application/AppStateContext';
import { useCurrentUserId } from '../../hooks/useCurrentUserId';
import { taskGroupService } from '../../services';
import { TopBar } from '../../components/layout/TopBar';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H, spacing } from '../../theme/spacing';
import type { BingoSize, TaskGroupPrivacy, TaskGroupType } from '../../application/state';

type BingoSizeValue = '3' | '4' | '5';

const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const CreateGroupScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState<TaskGroupPrivacy>('private');
  const [groupType, setGroupType] = useState<TaskGroupType>('cooperative');
  const [isBingo, setIsBingo] = useState(false);
  const [bingoSize, setBingoSize] = useState<BingoSizeValue>('3');
  const { dispatch } = useAppState();
  const currentUserId = useCurrentUserId();

  const privacyOptions = [
    { value: 'private', label: t('tasks.groups.privacy.private') },
    { value: 'public', label: t('tasks.groups.privacy.public') },
  ] as const satisfies ReadonlyArray<SegmentedControlOption<TaskGroupPrivacy>>;

  const groupTypeOptions = [
    { value: 'cooperative', label: t('tasks.groups.groupTypeCooperative') },
    { value: 'competitive', label: t('tasks.groups.groupTypeCompetitive') },
  ] as const satisfies ReadonlyArray<SegmentedControlOption<TaskGroupType>>;

  const bingoSizeOptions = [
    { value: '3', label: '3×3' },
    { value: '4', label: '4×4' },
    { value: '5', label: '5×5' },
  ] as const satisfies ReadonlyArray<SegmentedControlOption<BingoSizeValue>>;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('tasks.groups.validationTitle'), t('tasks.groups.nameRequired'));
      return;
    }

    const effectiveGroupType: TaskGroupType = isBingo ? 'cooperative' : groupType;
    const effectiveBingoSize = isBingo ? (Number(bingoSize) as BingoSize) : undefined;

    const groupId = generateId('grp');

    const serviceResult = await taskGroupService.createGroup({
      groupId,
      ownerUserId: currentUserId,
      name: trimmed,
      privacy,
      type: effectiveGroupType,
      isBingo,
      bingoSize: effectiveBingoSize,
    });
    if (!serviceResult.ok) {
      Alert.alert(t('tasks.groups.createErrorTitle'), t('tasks.groups.createErrorMessage'));
      return;
    }

    const serverCode = serviceResult.value?.inviteCode ?? '';
    dispatch({
      type: 'task-groups/create',
      groupId,
      ownerUserId: currentUserId,
      name: trimmed,
      privacy,
      groupType: effectiveGroupType,
      isBingo,
      bingoSize: effectiveBingoSize,
      inviteCode: serverCode,
    });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t('tasks.groups.createAction')} showBackButton showRightActions={false} />
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <AppText variant="caption" color="muted" style={styles.sectionTitle}>
              {t('tasks.groups.basicInfoSection')}
            </AppText>
            <AppInput value={name} onChangeText={setName} placeholder={t('tasks.groups.groupNamePlaceholder')} style={styles.centeredInput} />
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
            {isBingo ? (
              <>
                <AppText variant="caption" color="muted" style={styles.sectionTitle}>
                  {t('tasks.groups.bingoSizeSection')}
                </AppText>
                <SegmentedControl<BingoSizeValue>
                  options={bingoSizeOptions}
                  value={bingoSize}
                  onChange={setBingoSize}
                  accessibilityLabel={t('tasks.groups.bingoSizeSection')}
                />
              </>
            ) : null}
          </View>

          <View style={styles.actions}>
            <AppButton title={t('tasks.groups.createAction')} onPress={handleCreate} disabled={!name.trim()} />
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
  centeredInput: {
    textAlign: 'center',
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
  toggleCardPressed: {
    opacity: 0.9,
  },
  toggleTextWrap: {
    flex: 1,
    gap: 2,
  },
  toggleKnob: {
    width: 48,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(30, 19, 14, 0.12)',
    borderWidth: 1,
    borderColor: colors.dividerLine,
  },
  toggleKnobActive: {
    backgroundColor: colors.primary,
  },
  actions: { marginTop: spacing.sm },
});
