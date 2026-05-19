import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const PILL_PADDING = 3;
const PILL_RADIUS = 11;

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: Props<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const translateAnim = useRef(new Animated.Value(activeIndex)).current;

  const indicatorWidth = useMemo(() => {
    if (!containerWidth || options.length === 0) return 0;
    return (containerWidth - PILL_PADDING * 2) / options.length;
  }, [containerWidth, options.length]);

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: activeIndex,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, containerWidth, translateAnim]);

  const indicatorTranslateX =
    options.length > 1
      ? translateAnim.interpolate({
          inputRange: options.map((_, index) => index),
          outputRange: options.map((_, index) => index * indicatorWidth),
        })
      : new Animated.Value(0);

  return (
    <View
      style={styles.container}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          indicatorWidth > 0 && { width: indicatorWidth },
          { transform: [{ translateX: indicatorTranslateX }] },
        ]}
      />
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.tab}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabSwitcherTrack,
    borderRadius: 14,
    padding: PILL_PADDING,
    height: 44,
  },
  indicator: {
    position: 'absolute',
    top: PILL_PADDING,
    bottom: PILL_PADDING,
    left: PILL_PADDING,
    borderRadius: PILL_RADIUS,
    backgroundColor: colors.primary,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PILL_RADIUS,
  },
  label: {
    ...typography.label,
    color: colors.muted,
  },
  labelActive: {
    color: colors.textOnPrimary,
  },
});
