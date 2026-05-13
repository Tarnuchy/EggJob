import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { strings } from '../../i18n/strings';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import type { AuthTab } from '../../types';

const PILL_PADDING = 3;
const PILL_RADIUS = 11;

interface Props {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

export const AuthTabSwitcher = ({ activeTab, onTabChange }: Props) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateAnim = useRef(new Animated.Value(activeTab === 'register' ? 1 : 0)).current;

  const indicatorWidth = useMemo(() => {
    if (!containerWidth) return 0;
    return (containerWidth - PILL_PADDING * 2) / 2;
  }, [containerWidth]);

  useEffect(() => {
    Animated.timing(translateAnim, {
      toValue: activeTab === 'register' ? 1 : 0,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeTab, containerWidth, translateAnim]);

  const indicatorTranslateX = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(indicatorWidth, 0)],
  });

  return (
    <View
      style={styles.container}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          indicatorWidth > 0 && { width: indicatorWidth },
          { transform: [{ translateX: indicatorTranslateX }] },
        ]}
      />
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('login')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityLabel={strings.auth.tabs.login}
        accessibilityState={{ selected: activeTab === 'login' }}
      >
        <Text
          style={[styles.label, activeTab === 'login' && styles.labelActive]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {strings.auth.tabs.login}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('register')}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityLabel={strings.auth.tabs.register}
        accessibilityState={{ selected: activeTab === 'register' }}
      >
        <Text
          style={[styles.label, activeTab === 'register' && styles.labelActive]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {strings.auth.tabs.register}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

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
