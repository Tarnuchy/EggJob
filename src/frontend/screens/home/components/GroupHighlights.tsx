import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAppNavigation } from '../../../hooks/useAppNavigation';
import type { HomeGroupHighlight } from '../../../application/selectors';

interface Props {
  items: HomeGroupHighlight[];
}

const BingoMiniGrid = ({
  size,
  doneCount,
  totalCount,
}: {
  size: number;
  doneCount: number;
  totalCount: number;
}) => {
  const cells = Array.from({ length: totalCount }, (_, i) => i < doneCount);
  return (
    <View style={[styles.miniGrid, { width: size * 16 }]}>
      {cells.map((on, i) => (
        <View key={i} style={[styles.miniCell, on ? styles.miniCellOn : styles.miniCellOff]} />
      ))}
    </View>
  );
};

export const GroupHighlights = ({ items }: Props) => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();

  return (
    <View style={styles.section}>
      <AppText variant="caption" color="muted" style={styles.sectionTitle}>
        {t('home.sections.groups')}
      </AppText>
      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <AppText variant="body" color="textSecondary">
            {t('home.empty.noGroups')}
          </AppText>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {items.map((g) => (
            <Pressable
              key={g.groupId}
              accessibilityRole="button"
              accessibilityLabel={g.name}
              onPress={() => navigation.navigate('GroupTasks', { groupId: g.groupId })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardTop}>
                <AppText variant="label" color="textPrimary" numberOfLines={1} style={styles.cardName}>
                  {g.name}
                </AppText>
                <View style={styles.pill}>
                  <AppText variant="caption" color="textPrimary">
                    {g.bingo
                      ? t('home.groups.bingoBadge')
                      : g.type === 'competitive'
                        ? t('home.groups.competitive')
                        : t('home.groups.cooperative')}
                  </AppText>
                </View>
              </View>
              {g.bingo ? (
                <>
                  <BingoMiniGrid size={g.bingo.size} doneCount={g.bingo.doneCount} totalCount={g.bingo.totalCount} />
                  <AppText variant="caption" color={g.bingo.hasBingo ? 'primary' : 'muted'}>
                    {g.bingo.hasBingo ? t('home.groups.bingoWin') : `${g.bingo.doneCount} / ${g.bingo.totalCount}`}
                  </AppText>
                </>
              ) : (
                <AppText variant="caption" color="muted">
                  {`${t('home.groups.taskCount', { count: g.taskCount })} · ${t('home.groups.memberCount', { count: g.memberCount })}`}
                </AppText>
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: { letterSpacing: 1.2, textTransform: 'uppercase' },
  hScroll: { gap: spacing.md, paddingRight: spacing.md },
  emptyCard: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  card: {
    width: 200,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
  },
  cardPressed: { transform: [{ scale: 0.99 }] },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  cardName: { flex: 1 },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.surfaceAlt },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  miniCell: { width: 14, height: 14, borderRadius: 3 },
  miniCellOn: { backgroundColor: colors.primary },
  miniCellOff: { backgroundColor: 'rgba(67, 38, 23, 0.18)' },
});
