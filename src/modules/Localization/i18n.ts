import en from '../../i18n/en.json';
import ar from '../../i18n/ar.json';
import de from '../../i18n/de.json';
import type { AppLanguage } from '../Profile/types';

type Dict = Record<string, string>;

const catalogs: Partial<Record<AppLanguage, Dict>> = {
  en: en as Dict,
  ar: ar as Dict,
  de: de as Dict,
};

/** Fallback chain: requested → en → key itself */
export function t(
  lang: AppLanguage,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = catalogs[lang] ?? catalogs.en!;
  let str = dict[key] ?? catalogs.en![key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export function hasCatalog(lang: AppLanguage): boolean {
  return Boolean(catalogs[lang]);
}
