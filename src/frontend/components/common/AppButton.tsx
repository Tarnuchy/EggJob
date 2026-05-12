import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { shadows } from '../../theme/shadows';
import { useButtonAnimation } from '../../hooks/useButtonAnimation';

interface Props {
  title?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  shakeCount?: number;
  isLoading?: boolean;
  minLoadTime?: number;
}

export const AppButton = ({
  title,
  onPress,
  style,
  disabled,
  shakeCount,
  isLoading,
  minLoadTime = 1000,
}: Props) => {
  const { scaleAnim, shakeAnim, isVisuallyLoading, handlePressIn, handlePressOut } =
    useButtonAnimation({ isLoading, shakeCount, minLoadTime });

  const isDisabled = disabled || isVisuallyLoading;

  return (
    <Animated.View
      style={[
        styles.shadow,
        {
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        },
        isDisabled && styles.shadowDisabled,
        style,
      ]}
    >
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isDisabled}
      >
        {isVisuallyLoading ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    width: '100%',
    borderRadius: 12,
    shadowColor: colors.shadowAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: shadows.level3.elevation,
  },
  shadowDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.textOnPrimary,
    ...typography.button,
  },
});
