import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  initI18n,
  isSupportedLocale,
  type SupportedLocale,
} from '../i18n/config';

export type LocalePreference = 'system' | SupportedLocale;

const STORAGE_KEY = '@eggjob/locale-preference';

type LocaleContextValue = {
  preference: LocalePreference;
  resolvedLocale: SupportedLocale;
  setPreference: (next: LocalePreference) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectSystemLocale(): SupportedLocale {
  const locales = Localization.getLocales();
  const primary = locales[0]?.languageCode;
  return primary === 'pl' ? 'pl' : DEFAULT_LOCALE;
}

function resolvePreference(preference: LocalePreference): SupportedLocale {
  return preference === 'system' ? detectSystemLocale() : preference;
}

function isLocalePreference(value: string | null | undefined): value is LocalePreference {
  return value === 'system' || isSupportedLocale(value);
}

export async function loadInitialLocale(): Promise<{
  preference: LocalePreference;
  resolvedLocale: SupportedLocale;
}> {
  let preference: LocalePreference = 'system';
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (isLocalePreference(stored)) {
      preference = stored;
    }
  } catch {
    preference = 'system';
  }
  const resolvedLocale = resolvePreference(preference);
  await initI18n(resolvedLocale);
  return { preference, resolvedLocale };
}

type LocaleProviderProps = {
  initialPreference: LocalePreference;
  initialResolvedLocale: SupportedLocale;
  children: React.ReactNode;
};

export function LocaleProvider({
  initialPreference,
  initialResolvedLocale,
  children,
}: LocaleProviderProps) {
  const [preference, setPreferenceState] = useState<LocalePreference>(initialPreference);
  const [resolvedLocale, setResolvedLocale] = useState<SupportedLocale>(initialResolvedLocale);

  const setPreference = useCallback(async (next: LocalePreference) => {
    const nextResolved = resolvePreference(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence failure should not block the locale switch in-session.
    }
    await initI18n(nextResolved);
    setPreferenceState(next);
    setResolvedLocale(nextResolved);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ preference, resolvedLocale, setPreference }),
    [preference, resolvedLocale, setPreference],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
