import type { AppLanguage } from '../Profile/types';

export interface LanguageOption {
  code: AppLanguage;
  nativeName: string;
  flag: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'ar', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'tr', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  { code: 'uk', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },
  { code: 'ru', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pl', nativeName: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'fa', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'ur', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'it', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
];

export const RTL_LANGS = new Set<AppLanguage>(['ar', 'fa', 'ur']);

export function getDir(lang: AppLanguage): 'rtl' | 'ltr' {
  return RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
}
