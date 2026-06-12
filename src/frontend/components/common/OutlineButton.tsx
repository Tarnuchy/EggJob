import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../../theme/colors';

interface Props {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  isLoading?: boolean;
  accessibilityLabel?: string;
}

/** Secondary, in-system button: 1px brown hairline, transparent fill. */
export const OutlineButton = ({
  title,
  onPress,
  style,
  disabled,
  isLoading,
  accessibilityLabel,
}: Props) => {
  const isDisabled = Boolean(disabled) || Boolean(isLoading);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: Boolean(isLoading) }}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <AppText variant="button" color="primary">
          {title}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
