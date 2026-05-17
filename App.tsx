import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AppStateProvider } from './src/frontend/application/AppStateContext';
import { ErrorBoundary } from './src/frontend/components/common/ErrorBoundary';
import { AppNavigator } from './src/frontend/navigation/AppNavigator';
import { interFonts } from './src/frontend/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function App() {
  const [fontsLoaded] = useFonts(interFonts);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppStateProvider>
          <AppNavigator />
        </AppStateProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
