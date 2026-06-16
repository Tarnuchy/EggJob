import React, { useEffect } from 'react';
import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthScreen } from '../screens/auth/AuthScreen';
import { UserProfileScreen } from '../screens/social/UserProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { CreateGroupScreen } from '../screens/tasks/CreateGroupScreen';
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen';
import { EditTaskScreen } from '../screens/tasks/EditTaskScreen';
import { AddProgressScreen } from '../screens/tasks/AddProgressScreen';
import { GroupTasksScreen } from '../screens/tasks/GroupTasksScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { JoinGroupScreen } from '../screens/tasks/JoinGroupScreen';
import { colors } from '../theme/colors';
import { PanelHost } from './PanelHost';
import { setUnauthorizedHandler } from '../services/http/authEvents';
import { AuthSessionStorage } from '../services/http/AuthSessionStorage';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

export function AppNavigator({ initialRouteName }: { initialRouteName: keyof RootStackParamList }) {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  // require dynamically to avoid static resolution issues when file is added at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EditGroupScreen = require('../screens/tasks/EditGroupScreen').default;

  // On any authenticated 401 the HTTP layer clears the token and fires this handler: drop the
  // persisted session and return to Auth, so an expired token can't strand the user in the shell.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void AuthSessionStorage.clear();
      if (navigationRef.isReady() && navigationRef.getCurrentRoute()?.name !== 'Auth') {
        navigationRef.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [navigationRef]);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          freezeOnBlur: true,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Main" component={PanelHost} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen name="AddProgress" component={AddProgressScreen} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
        <Stack.Screen name="GroupTasks" component={GroupTasksScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="EditGroup" component={EditGroupScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
