import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/common/AppText';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useRelativeTime } from '../../../hooks/useRelativeTime';
import type { NotificationItem as NotificationItemModel } from '../../../services';

interface Props {
  item: NotificationItemModel;
  onPress: () => void;
}

export const NotificationItem = ({ item, onPress }: Props) => {
  const formatTime = useRelativeTime();
  const timeLabel = formatTime(item.date);

  return (
    <Pressable
      onPress={onPress}
      disabled={!item.active}
      style={({ pressed }) => [
        styles.row,
        item.active && styles.rowUnread,
        pressed && item.active && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.message}
      accessibilityState={{ disabled: !item.active }}
    >
      <View style={styles.dotColumn}>
        {item.active ? <View style={styles.dot} /> : null}
      </View>
      <View style={styles.content}>
        <AppText variant="body" color="textPrimary">
          {item.message}
        </AppText>
        <AppText variant="caption" color="muted">
          {timeLabel}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    borderRadius: 12,
  },
  rowUnread: {
    backgroundColor: colors.cardSurfaceTranslucent,
  },
  rowPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.12)',
  },
  dotColumn: {
    width: 12,
    paddingTop: 7,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
});
