import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { AppStateProvider } from './src/frontend/application/AppStateContext';
import { AppNavigator } from './src/frontend/navigation/AppNavigator';
import { interFonts } from './src/frontend/theme';
import { colors } from './src/frontend/theme/colors';

export default function App() {
  const [fontsLoaded] = useFonts(interFonts);

  /*if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }*/

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <AppNavigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
