import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: Props) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.frame, isFocused && styles.frameFocused]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.muted}
        style={styles.leadingIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor={colors.primary}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearSearch')}
        >
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.inputBorderIdle,
  },
  frameFocused: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
