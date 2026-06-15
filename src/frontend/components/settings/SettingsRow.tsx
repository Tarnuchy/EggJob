import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  icon?: IoniconName;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
  /** Trailing control (e.g. a Switch). When set, it replaces the chevron. */
  rightAccessory?: React.ReactNode;
}

export const SettingsRow = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  showDivider = false,
  accessibilityLabel,
  rightAccessory,
}: Props) => {
  const content = (
    <View style={[styles.row, showDivider && styles.divider]}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.labelWrap}>
        <AppText variant="body" color="textPrimary">
          {label}
        </AppText>
      </View>
      {value ? (
        <AppText variant="body" color="muted" style={styles.value}>
          {value}
        </AppText>
      ) : null}
      {rightAccessory ? (
        rightAccessory
      ) : onPress && showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      ) : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
    gap: spacing.sm,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.dividerLine,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  labelWrap: {
    flex: 1,
  },
  value: {
    marginRight: spacing.xs,
  },
  pressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.06)',
  },
});
