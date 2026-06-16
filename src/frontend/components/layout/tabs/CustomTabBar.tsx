import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabBarItem } from './TabBarItem';
import { QuickActionFab } from './QuickActionFab';
import { QuickActionMenu, type QuickActionItem } from './QuickActionMenu';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/shadows';
import { createSectionConfig } from '../../../navigation/sectionConfig';
import type { TabParamList } from '../../../navigation/types';

type TabName = keyof TabParamList;

const FAB_GAP = 88;

/** Visible height of the tab bar's interactive row, above any safe-area inset.
 *  Tab screens use this to pad their scrollable content clear of the overlay bar. */
export const TAB_BAR_HEIGHT = 68;

const TAB_NAMES: readonly TabName[] = ['Home', 'Tasks', 'Friends', 'Profile'];

const isTabName = (name: string): name is TabName =>
  (TAB_NAMES as readonly string[]).includes(name);

export const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const sectionConfig = createSectionConfig(t);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabRoutes = state.routes.filter((route) => isTabName(route.name));
  const midpoint = Math.ceil(tabRoutes.length / 2);
  const leftRoutes = tabRoutes.slice(0, midpoint);
  const rightRoutes = tabRoutes.slice(midpoint);

  const handlePress = (routeKey: string, routeName: string, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  const handleLongPress = (routeKey: string) => {
    navigation.emit({ type: 'tabLongPress', target: routeKey });
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navigateFromMenu = (screen: 'CreateTask' | 'AddProgress' | 'JoinGroup' | 'CreateGroup') => {
    closeMenu();
    // unhandled by the tab navigator, the action bubbles up to the root stack
    navigation.navigate(screen as never);
  };

  const quickActions: QuickActionItem[] = [
    {
      key: 'add-task',
      icon: 'checkbox-outline',
      label: t('quickAction.addTask'),
      onPress: () => navigateFromMenu('CreateTask'),
    },
    {
      key: 'add-progress',
      icon: 'trending-up',
      label: t('quickAction.addProgress'),
      onPress: () => navigateFromMenu('AddProgress'),
    },
    {
      key: 'join-group',
      icon: 'enter-outline',
      label: t('quickAction.joinGroup'),
      onPress: () => navigateFromMenu('JoinGroup'),
    },
    {
      key: 'create-group',
      icon: 'people-circle-outline',
      label: t('quickAction.createGroup'),
      onPress: () => navigateFromMenu('CreateGroup'),
    },
  ];

  const renderItem = (route: BottomTabBarProps['state']['routes'][number]) => {
    if (!isTabName(route.name)) return null;
    const config = sectionConfig[route.name];
    const isFocused = state.routes[state.index]?.key === route.key;
    return (
      <TabBarItem
        key={route.key}
        iconFilled={config.iconFilled}
        iconOutline={config.iconOutline}
        isFocused={isFocused}
        onPress={() => handlePress(route.key, route.name, isFocused)}
        onLongPress={() => handleLongPress(route.key)}
        accessibilityLabel={config.label}
      />
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {isMenuOpen && (
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={closeMenu}
          accessibilityRole="button"
          accessibilityLabel={t('quickAction.closeMenu')}
        />
      )}

      <View style={styles.barShadow}>
        <BlurView intensity={20} tint="light" style={styles.blur}>
          <View style={styles.barInner}>
            <View style={styles.tabsRow}>
              <View style={styles.side}>{leftRoutes.map(renderItem)}</View>
              <View style={styles.fabGap} />
              <View style={styles.side}>{rightRoutes.map(renderItem)}</View>
            </View>
            {insets.bottom > 0 && <View style={{ height: insets.bottom }} />}
          </View>
        </BlurView>
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.fabAnchor, { bottom: insets.bottom + 2 }]}
      >
        <QuickActionFab
          isOpen={isMenuOpen}
          onPress={() => setIsMenuOpen((open) => !open)}
          accessibilityLabel={t('quickAction.accessibilityLabel')}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.menuAnchor, { bottom: insets.bottom + 84 }]}
      >
        <QuickActionMenu isOpen={isMenuOpen} actions={quickActions} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  barShadow: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...shadows.level2,
    shadowOffset: { width: 0, height: -8 },
  },
  blur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  barInner: {
    backgroundColor: colors.cardSurfaceTranslucent,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderTranslucent,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  fabGap: {
    width: FAB_GAP,
  },
  fabAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuAnchor: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
