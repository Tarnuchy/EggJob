import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/tasks/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FriendsScreen } from '../screens/social/FriendsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { strings } from '../i18n/strings';
import { colors } from '../theme/colors';
import { CustomTabBar } from '../components/layout/tabs';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
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
