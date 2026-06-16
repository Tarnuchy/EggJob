import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from '../screens/home/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FriendsScreen } from '../screens/social/FriendsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme/colors';
import { CustomTabBar } from '../components/layout/tabs';
import { useDevSeed } from '../hooks/useDevSeed';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export const MainTabs = () => {
  const { t } = useTranslation();
  useDevSeed();
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('screens.home') }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ title: t('screens.tasks') }} />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ title: t('screens.friends') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('screens.profile') }}
      />
    </Tab.Navigator>
  );
};
