/**
 * Internationalization configuration
 * Currently supports English (US) only
 * Future languages: Spanish, Russian, German, Arabic, Hebrew
 */

export type SupportedLanguage = 'en' | 'es' | 'ru' | 'de' | 'ar' | 'he';

export interface LanguageConfig {
  code: SupportedLanguage;
  locale: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const languages: Record<SupportedLanguage, LanguageConfig> = {
  en: {
    code: 'en',
    locale: 'en_US',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  es: {
    code: 'es',
    locale: 'es_ES',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
  },
  ru: {
    code: 'ru',
    locale: 'ru_RU',
    name: 'Russian',
    nativeName: 'Русский',
    direction: 'ltr',
  },
  de: {
    code: 'de',
    locale: 'de_DE',
    name: 'German',
    nativeName: 'Deutsch',
    direction: 'ltr',
  },
  ar: {
    code: 'ar',
    locale: 'ar_SA',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
  he: {
    code: 'he',
    locale: 'he_IL',
    name: 'Hebrew',
    nativeName: 'עברית',
    direction: 'rtl',
  },
};

export const defaultLanguage: SupportedLanguage = 'en';
export const currentLanguage = defaultLanguage;
export const currentLanguageConfig = languages[currentLanguage];

