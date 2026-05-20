import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PanelHeader } from './PanelHeader';
import { SettingsScreen } from '../../screens/profile/SettingsScreen';
import { NotificationScreen } from '../../screens/social/NotificationScreen';
import { createSectionConfig } from '../../navigation/sectionConfig';
import type { PanelKind } from '../../navigation/PanelContext';
import { colors } from '../../theme/colors';
import { duration } from '../../theme/animations';

const ANIMATION_DURATION = duration.medium;

interface Props {
  panel: PanelKind;
  onClose: () => void;
}

export const SlideOverPanel = ({ panel, onClose }: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const isOpen = panel !== null;
  const openAnim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const [mountedPanel, setMountedPanel] = useState<PanelKind>(panel);

  useEffect(() => {
    let rafId: number | undefined;
    if (isOpen) {
      setMountedPanel(panel);
      rafId = requestAnimationFrame(() => {
        Animated.timing(openAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(openAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMountedPanel(null);
      });
    }
    return () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
    };
  }, [isOpen, panel, openAnim]);

  if (!mountedPanel) return null;

  const translateX = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth, 0],
  });

  const sectionKey = mountedPanel === 'settings' ? 'Settings' : 'Notifications';
  const config = createSectionConfig(t)[sectionKey];

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX }] }]}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <PanelHeader title={config.label} iconFilled={config.iconFilled} onClose={onClose} />
      <View style={styles.body}>
        {mountedPanel === 'settings' ? <SettingsScreen /> : <NotificationScreen />}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
