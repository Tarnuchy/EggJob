import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/tasks/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FriendsScreen } from '../screens/social/FriendsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { strings } from '../i18n/strings';
import { colors } from '../theme/colors';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<keyof TabParamList, IoniconName> = {
  Home: 'home-outline',
  Tasks: 'checkbox-outline',
  Friends: 'people-outline',
  Profile: 'person-outline',
};

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        sceneStyle: { backgroundColor: colors.background },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: strings.screens.home }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: strings.screens.tasks }} />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ title: strings.screens.friends }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: strings.screens.profile }}
      />
    </Tab.Navigator>
  );
};
