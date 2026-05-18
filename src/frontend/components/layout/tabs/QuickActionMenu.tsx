import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../common/AppText';
import { colors } from '../../../theme/colors';
import { duration, easing } from '../../../theme/animations';
import { spacing } from '../../../theme/spacing';

interface Props {
  isOpen: boolean;
  onSelectRegular: () => void;
  onSelectBingo: () => void;
  regularLabel: string;
  bingoLabel: string;
}

export const QuickActionMenu = ({
  isOpen,
  onSelectRegular,
  onSelectBingo,
  regularLabel,
  bingoLabel,
}: Props) => {
  const openAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [isMounted, setIsMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      Animated.timing(openAnim, {
        toValue: 1,
        duration: duration.short,
        easing: easing.standard,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(openAnim, {
        toValue: 0,
        duration: duration.micro,
        easing: easing.standard,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsMounted(false);
      });
    }
  }, [isOpen, openAnim]);

  if (!isMounted) return null;

  const translateY = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });
  const scale = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1],
  });

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[
        styles.container,
        { opacity: openAnim, transform: [{ translateY }, { scale }] },
      ]}
    >
      <BlurView intensity={18} tint="light" style={styles.blur}>
        <LinearGradient
          colors={[
            'rgba(244, 236, 227, 0.22)',
            'rgba(244, 236, 227, 0)',
            'rgba(67, 38, 23, 0.06)',
          ]}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.inner}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onSelectRegular}
            accessibilityRole="menuitem"
            accessibilityLabel={regularLabel}
          >
            <Ionicons name="checkbox-outline" size={20} color={colors.primary} />
            <AppText variant="body" color="textPrimary" style={styles.rowLabel}>
              {regularLabel}
            </AppText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={onSelectBingo}
            accessibilityRole="menuitem"
            accessibilityLabel={bingoLabel}
          >
            <Ionicons name="grid-outline" size={20} color={colors.primary} />
            <AppText variant="body" color="textPrimary" style={styles.rowLabel}>
              {bingoLabel}
            </AppText>
          </Pressable>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorderTranslucent,
    borderTopColor: 'rgba(244, 236, 227, 0.45)',
    backgroundColor: colors.cardSurfaceTranslucent,
  },
  blur: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  inner: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowPressed: {
    backgroundColor: 'rgba(107, 63, 34, 0.08)',
  },
  rowLabel: {
    flex: 1,
  },
});
