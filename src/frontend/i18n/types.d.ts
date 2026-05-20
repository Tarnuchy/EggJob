import 'react-i18next';
import type { Translation } from './locales/en';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Translation;
    };
    returnNull: false;
  }
}
