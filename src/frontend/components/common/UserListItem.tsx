import React from 'react';
import type { ReactNode } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  username: string;
  photoUrl?: string;
  onPress?: () => void;
  right?: ReactNode;
  accessibilityLabel?: string;
}

export const UserListItem = ({
  username,
  photoUrl,
  onPress,
  right,
  accessibilityLabel,
}: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={accessibilityLabel ?? username}
  >
    <Avatar photoUrl={photoUrl} accessibilityLabel={`${username} avatar`} />
    <AppText variant="label" color="textPrimary" style={styles.name} numberOfLines={1}>
      {username}
    </AppText>
    {right ? <View style={styles.right}>{right}</View> : null}
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLine,
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  name: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
