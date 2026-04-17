import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/frontend/screens/LoginScreen';
import { RegisterScreen } from './src/frontend/screens/RegisterScreen';
import { SettingsScreen } from './src/frontend/screens/SettingsScreen';
import { NotificationScreen } from './src/frontend/screens/NotificationScreen';
import { BottomBar } from './src/frontend/navigation/BottomBar';
import { RootStackParamList } from './src/frontend/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="BottomBar" component={BottomBar} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationScreen}
          options={{ headerShown: true, title: 'Notifications' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}