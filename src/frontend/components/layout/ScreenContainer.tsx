import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { SCREEN_PADDING_H } from '../../theme/spacing';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  edges?: readonly Edge[];
}

export const ScreenContainer = ({ children, style, edges }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_H,
  },
});
