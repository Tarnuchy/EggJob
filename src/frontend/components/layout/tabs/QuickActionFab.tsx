import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, eggJobPalette } from '../../../theme/colors';
import { shadows } from '../../../theme/shadows';
import { duration, easing } from '../../../theme/animations';

interface Props {
  isOpen: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

export const QuickActionFab = ({ isOpen, onPress, accessibilityLabel }: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: duration.short,
      easing: easing.standard,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotateAnim]);

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.94,
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

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View style={[styles.fabShadow, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: isOpen }}
        style={styles.pressable}
      >
        <LinearGradient
          colors={[eggJobPalette.searingGorgeBrown, eggJobPalette.nightBrown]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerRing}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="add" size={30} color={colors.textOnPrimary} />
            </Animated.View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const FAB_SIZE = 64;

const styles = StyleSheet.create({
  fabShadow: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    ...shadows.level3,
  },
  pressable: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: FAB_SIZE - 8,
    height: FAB_SIZE - 8,
    borderRadius: (FAB_SIZE - 8) / 2,
    borderWidth: 1,
    borderColor: 'rgba(244, 236, 227, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
