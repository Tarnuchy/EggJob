import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AppStateProvider } from './src/frontend/application/AppStateContext';
import {
  LocaleProvider,
  loadInitialLocale,
  type LocalePreference,
} from './src/frontend/application/LocaleContext';
import { ErrorBoundary } from './src/frontend/components/common/ErrorBoundary';
import { ToastProvider } from './src/frontend/context/ToastContext';
import { AppNavigator } from './src/frontend/navigation/AppNavigator';
import type { SupportedLocale } from './src/frontend/i18n';
import { interFonts } from './src/frontend/theme';
import { AuthTokenStorage } from './src/frontend/services/http/AuthTokenStorage';
import { AuthSessionStorage, type StoredSession } from './src/frontend/services/http/AuthSessionStorage';

// Off-screen navigator screens (inactive tabs, screens below the top of the stack) stay
// mounted and would otherwise re-render on every reducer dispatch via the shared AppState
// context. Freezing them (react-freeze) suspends those re-renders until the screen is shown
// again, cutting per-dispatch work to just the visible screen.
enableFreeze(true);

SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

type InitialLocale = {
  preference: LocalePreference;
  resolvedLocale: SupportedLocale;
};

export default function App() {
  const [fontsLoaded] = useFonts(interFonts);
  const [initialLocale, setInitialLocale] = useState<InitialLocale | null>(null);
  const [restoredSession, setRestoredSession] = useState<StoredSession | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadInitialLocale()
      .then((result) => {
        if (!cancelled) {
          setInitialLocale(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInitialLocale({ preference: 'system', resolvedLocale: 'en' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [token, session] = await Promise.all([
          AuthTokenStorage.getToken(),
          AuthSessionStorage.get(),
        ]);
        if (!cancelled) setRestoredSession(token && session ? session : null);
      } catch {
        if (!cancelled) setRestoredSession(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = fontsLoaded && initialLocale !== null && restoredSession !== undefined;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [ready]);

  if (!ready || !initialLocale) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <LocaleProvider
          initialPreference={initialLocale.preference}
          initialResolvedLocale={initialLocale.resolvedLocale}
        >
          <AppStateProvider initialSession={restoredSession}>
            <ToastProvider>
              <AppNavigator initialRouteName={restoredSession ? 'Main' : 'Auth'} />
            </ToastProvider>
          </AppStateProvider>
        </LocaleProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
