import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../common/AppText';
import { colors } from '../../../theme/colors';
import { duration, easing } from '../../../theme/animations';
import { spacing } from '../../../theme/spacing';

export interface QuickActionItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

interface Props {
  isOpen: boolean;
  actions: QuickActionItem[];
}

export const QuickActionMenu = ({ isOpen, actions }: Props) => {
  const openAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      Animated.timing(openAnim, {
        toValue: 1,
        duration: duration.short,
        easing: easing.standard,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(openAnim, {
        toValue: 0,
        duration: duration.micro,
        easing: easing.standard,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
  }, [isOpen, openAnim]);

  if (!isMounted) return null;

  const translateY = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });
  const scale = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.container,
        { opacity: openAnim, transform: [{ translateY }, { scale }] },
      ]}
    >
      <View style={styles.inner}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={action.onPress}
            accessibilityRole="menuitem"
            accessibilityLabel={action.label}
          >
            <Ionicons name={action.icon} size={20} color={colors.primary} />
            <AppText variant="body" color="textPrimary" style={styles.rowLabel}>
              {action.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dividerLine,
    backgroundColor: colors.surfaceAlt,
  },
  inner: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  rowLabel: {
    flex: 1,
  },
});
