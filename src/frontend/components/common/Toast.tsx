import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';
import { spacing, SCREEN_PADDING_H } from '../../theme/spacing';

export type ToastVariant = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  onHide: () => void;
};

type VariantConfig = {
  backgroundColor: string;
  textColor: 'textOnPrimary' | 'textPrimary';
  icon: 'checkmark-circle' | 'close-circle' | 'information-circle';
  iconColor: string;
};

const VARIANT_CONFIG: Record<ToastVariant, VariantConfig> = {
  success: {
    backgroundColor: colors.primary,
    textColor: 'textOnPrimary',
    icon: 'checkmark-circle',
    iconColor: colors.textOnPrimary,
  },
  error: {
    backgroundColor: colors.danger,
    textColor: 'textOnPrimary',
    icon: 'close-circle',
    iconColor: colors.textOnPrimary,
  },
  info: {
    backgroundColor: colors.surfaceAlt,
    textColor: 'textPrimary',
    icon: 'information-circle',
    iconColor: colors.textPrimary,
  },
};

const ANIMATION_DURATION_MS = 220;
// keeps the toast above the floating tab bar
const TAB_BAR_CLEARANCE = 88;

export const Toast = ({ message, variant, visible, onHide }: ToastProps) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: ANIMATION_DURATION_MS,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished && !visible) {
        onHide();
      }
    });
    return () => animation.stop();
  }, [onHide, progress, visible]);

  const config = VARIANT_CONFIG[variant];

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [spacing.lg, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.iconColor} />
      <AppText variant="label" color={config.textColor} style={styles.message}>
        {message}
      </AppText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_BAR_CLEARANCE,
    left: 0,
    right: 0,
    marginHorizontal: SCREEN_PADDING_H,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.level2,
  },
  message: { flex: 1 },
});
