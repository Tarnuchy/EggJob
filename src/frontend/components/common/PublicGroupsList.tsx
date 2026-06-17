import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { TaskGroupType } from '../../application/state';

export interface PublicGroupCard {
  id: string;
  name: string;
  type: TaskGroupType;
  isBingo: boolean;
  taskCount: number;
}

interface Props {
  groups: PublicGroupCard[];
  /** Optional tap handler (used on the current user's own profile to open the group). */
  onPressGroup?: (groupId: string) => void;
}

function groupIcon(group: PublicGroupCard): keyof typeof Ionicons.glyphMap {
  if (group.isBingo) return 'grid-outline';
  return group.type === 'competitive' ? 'trophy-outline' : 'people-outline';
}

/**
 * Horizontal, scrollable strip of a user's PUBLIC groups shown on the profile. Renders an empty
 * hint when there are none. Purely presentational — callers decide which groups are public.
 */
export const PublicGroupsList = ({ groups, onPressGroup }: Props) => {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <AppText variant="label" color="textSecondary" style={styles.title}>
        {t('profile.publicGroups.title')}
      </AppText>
      {groups.length === 0 ? (
        <AppText variant="body" color="muted">
          {t('profile.publicGroups.empty')}
        </AppText>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {groups.map((group) => {
            const inner = (
              <>
                <View style={styles.cardTop}>
                  <Ionicons name={groupIcon(group)} size={18} color={colors.primary} />
                  {group.isBingo ? (
                    <View style={styles.badge}>
                      <AppText variant="caption" color="textOnPrimary">
                        {t('profile.publicGroups.bingoBadge')}
                      </AppText>
                    </View>
                  ) : null}
                </View>
                <AppText variant="label" color="textPrimary" numberOfLines={2}>
                  {group.name}
                </AppText>
                <AppText variant="caption" color="textSecondary">
                  {t('tasks.groups.taskCount', { count: group.taskCount })}
                </AppText>
              </>
            );

            return onPressGroup ? (
              <Pressable
                key={group.id}
                onPress={() => onPressGroup(group.id)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                accessibilityRole="button"
                accessibilityLabel={group.name}
              >
                {inner}
              </Pressable>
            ) : (
              <View key={group.id} style={styles.card}>
                {inner}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  title: {
    letterSpacing: 0.8,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    width: 150,
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    padding: spacing.md,
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
