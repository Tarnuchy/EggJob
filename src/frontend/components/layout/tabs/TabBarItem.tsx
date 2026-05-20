import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { duration, easing } from '../../../theme/animations';
import { spacing } from '../../../theme/spacing';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  iconFilled: IoniconName;
  iconOutline: IoniconName;
  isFocused: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  accessibilityLabel: string;
}

export const TabBarItem = ({
  iconFilled,
  iconOutline,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: duration.short,
      easing: easing.standard,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: duration.micro,
      easing: easing.standard,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: duration.micro,
      easing: easing.standard,
      useNativeDriver: true,
    }).start();
  };

  const pillBackground = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(107, 63, 34, 0)', 'rgba(107, 63, 34, 0.08)'],
  });

  return (
    <Pressable
      style={styles.pressable}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Animated.View style={[styles.pill, { backgroundColor: pillBackground }]}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={isFocused ? iconFilled : iconOutline}
              size={26}
              color={isFocused ? colors.primary : colors.muted}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    width: 44,
    height: 44,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
