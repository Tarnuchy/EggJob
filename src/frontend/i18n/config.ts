import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import pl from './locales/pl';

export const SUPPORTED_LOCALES = ['en', 'pl'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

let initialized = false;

export async function initI18n(initialLocale: SupportedLocale): Promise<void> {
  if (initialized) {
    if (i18n.language !== initialLocale) {
      await i18n.changeLanguage(initialLocale);
    }
    return;
  }

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      pl: { translation: pl },
    },
    lng: initialLocale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });

  initialized = true;
}

export function isSupportedLocale(value: string | undefined | null): value is SupportedLocale {
  return value === 'en' || value === 'pl';
}

export default i18n;
