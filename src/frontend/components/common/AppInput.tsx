import React, { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  touched?: boolean;
  error?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  passwordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
}

export const AppInput = ({
  label,
  touched,
  error,
  value,
  placeholder,
  style,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  onFocus,
  onBlur,
  passwordVisible,
  onTogglePasswordVisibility,
  ...rest
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = Boolean(secureTextEntry);
  const resolvedAutoCapitalize = autoCapitalize ?? (isPassword ? 'none' : 'sentences');
  const resolvedAutoCorrect = autoCorrect ?? (isPassword ? false : undefined);

  const hasError = touched && Boolean(error);
  const resolvedPasswordVisible = passwordVisible ?? showPassword;

  const handleTogglePasswordVisibility = () => {
    if (onTogglePasswordVisibility) {
      onTogglePasswordVisibility();
      return;
    }
    setShowPassword((v) => !v);
  };

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.fieldFrame}>
        <View
          pointerEvents="none"
          style={[styles.focusTint, isFocused && styles.focusTintVisible]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.stateRing,
            isFocused && styles.stateRingFocused,
            hasError && styles.stateRingError,
          ]}
        />
        <View style={styles.inputRow}>
          <TextInput
            {...rest}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            value={value ?? ''}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !resolvedPasswordVisible}
            autoCapitalize={resolvedAutoCapitalize}
            autoCorrect={resolvedAutoCorrect}
            selectionColor={colors.primary}
          />
          {isPassword ? (
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={handleTogglePasswordVisibility}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>{resolvedPasswordVisible ? '🙈' : '🐵'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <Text style={styles.errorText} numberOfLines={1}>
        {hasError ? `⚠️ ${error}` : ' '}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: 6,
    color: colors.textSecondary,
    ...typography.label,
    fontSize: 14,
  },
  fieldFrame: {
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  focusTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: colors.background,
    opacity: 0,
  },
  focusTintVisible: {
    opacity: 1,
  },
  stateRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorderIdle,
  },
  stateRingFocused: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  stateRingError: {
    borderColor: colors.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 12,
    ...typography.body,
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    marginTop: 4,
    minHeight: 18,
    color: colors.danger,
    ...typography.caption,
  },
});
