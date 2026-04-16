import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

import { TabParamList } from './types';
import { View, Text, Button, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator<TabParamList>();

export const MainTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false}}>
            <Tab.Screen name="Home"
            component={HomeScreen}
            options={{ title: "Home" }} 
            />
            <Tab.Screen name="Tasks"
            component={TasksScreen}
            options={{ title: "Tasks" }} 
            />
            <Tab.Screen name="Friends"
            component={FriendsScreen}
            options={{ title: "Friends" }}
            />
            <Tab.Screen name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }} 
            />
        </Tab.Navigator>
    );
};
