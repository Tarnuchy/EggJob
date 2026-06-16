import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { HomeActiveTask } from '../../../application/selectors';

interface Props {
  items: HomeActiveTask[];
}

export const ActiveTasksPeek = ({ items }: Props) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.activeTasks')}
      </AppText>
      {items.length === 0 ? (
        <View style={styles.card}>
          <AppText variant="body" color="textSecondary">
            {t('home.empty.noActiveTasks')}
          </AppText>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.taskId}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => navigation.navigate('TaskDetail', { groupId: item.groupId, taskId: item.taskId })}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.body}>
              <AppText variant="label" color="textPrimary" numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText variant="caption" color="muted" numberOfLines={1}>
                {item.groupName}
              </AppText>
            </View>
            <View style={styles.progressPill}>
              <AppText variant="caption" color="primary">{`${item.value} / ${item.goal}`}</AppText>
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  card: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  rowPressed: { transform: [{ scale: 0.99 }] },
  dot: { width: 12, height: 12, borderRadius: 6 },
  body: { flex: 1, minWidth: 0 },
  progressPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(107, 63, 34, 0.10)',
  },
});
