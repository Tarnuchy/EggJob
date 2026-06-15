import React, { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';
import type { BingoSize, Task } from '../../application/state';

export type BingoCell = {
  taskId: string;
  task: Task;
  progress: number;
  isDone: boolean;
} | null;

export type BingoGridProps = {
  cells: BingoCell[];
  size: BingoSize;
  canEdit: boolean;
  onCellPress: (index: number) => void;
  onCellLongPress?: (index: number) => void;
  /** a11y hint announced on filled cells, describing the long-press action (e.g. open details). */
  filledCellHint?: string;
};

const GRID_GAP = spacing.sm;

function buildLines(size: number): number[][] {
  const lines: number[][] = [];
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

export const BingoGrid = ({
  cells,
  size,
  canEdit,
  onCellPress,
  onCellLongPress,
  filledCellHint,
}: BingoGridProps) => {
  const { t } = useTranslation();

  const cellSize =
    (Dimensions.get('window').width - 2 * SCREEN_PADDING_H - (size - 1) * GRID_GAP) / size;

  const hasBingo = useMemo(() => {
    if (cells.length === 0) return false;
    const done = cells.map((cell) => cell?.isDone ?? false);
    return buildLines(size).some((line) => line.every((index) => done[index]));
  }, [cells, size]);

  return (
    <View style={styles.wrapper}>
      {hasBingo ? (
        <View style={styles.banner}>
          <AppText variant="h2" color="textOnPrimary">
            {t('tasks.groups.bingoBanner')}
          </AppText>
        </View>
      ) : (
        <AppText variant="caption" color="muted" style={styles.noBingoHint}>
          {t('tasks.groups.bingoNoBingo')}
        </AppText>
      )}
      <View style={styles.grid} accessibilityLabel={t('tasks.groups.bingoGrid')}>
        {cells.map((cell, index) => {
          const isPlaceholder = cell === null || cell.task.name === '';
          return (
            <Pressable
              key={cell ? cell.taskId : `placeholder-${index}`}
              onPress={() => onCellPress(index)}
              onLongPress={onCellLongPress ? () => onCellLongPress(index) : undefined}
              delayLongPress={300}
              style={({ pressed }) => [
                styles.cell,
                { width: cellSize, height: cellSize },
                isPlaceholder ? styles.cellPlaceholder : styles.cellFilled,
                pressed && styles.cellPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                isPlaceholder ? t('tasks.groups.bingoEmptyCell') : cell.task.name
              }
              accessibilityHint={isPlaceholder ? undefined : filledCellHint}
            >
              {isPlaceholder ? (
                <View style={styles.placeholderContent}>
                  <Ionicons name="add-circle-outline" size={22} color={colors.muted} />
                  <AppText
                    variant="caption"
                    color="muted"
                    style={styles.placeholderText}
                    numberOfLines={2}
                  >
                    {canEdit
                      ? t('tasks.groups.bingoPlaceholderHint')
                      : t('tasks.groups.bingoEmptyCell')}
                  </AppText>
                </View>
              ) : (
                <>
                  <View style={[styles.colorBar, { backgroundColor: cell.task.params.color }]} />
                  <View style={styles.cellBody}>
                    <AppText variant="caption" color="textPrimary" numberOfLines={2}>
                      {cell.task.name}
                    </AppText>
                  </View>
                  {cell.isDone ? (
                    <>
                      <View style={styles.doneOverlay} />
                      <View style={styles.doneIconWrap}>
                        <Ionicons name="checkmark" size={28} color={colors.textOnPrimary} />
                      </View>
                    </>
                  ) : null}
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  noBingoHint: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  cell: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cellFilled: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
  },
  cellPlaceholder: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.inputBorderIdle,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  cellPressed: {
    opacity: 0.85,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    textAlign: 'center',
  },
  cellBody: {
    flex: 1,
    paddingLeft: spacing.xs,
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  doneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryPressed,
    opacity: 0.7,
  },
  doneIconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
