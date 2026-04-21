import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/tasks/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FriendsScreen } from '../screens/social/FriendsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { TabParamList } from './types';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator<TabParamList>();

export const BottomBar = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textSecondary,
				sceneStyle: { backgroundColor: colors.background },
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{ title: 'Home' }}
			/>
			<Tab.Screen
				name="Tasks"
				component={TasksScreen}
				options={{ title: 'Tasks' }}
			/>
			<Tab.Screen
				name="Friends"
				component={FriendsScreen}
				options={{ title: 'Friends' }}
			/>
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{ title: 'Profile' }}
			/>
		</Tab.Navigator>
	);
};