import type { Locale } from '@/lib/i18n';

export interface LocaleSwitch {
  targetLocale: Locale;
  /** The current path in the other language, for example /en/simulator to /fr/simulator. */
  targetPath: string;
}

/** The same path under another locale's prefix. */
export function pathInLocale(pathname: string, locale: Locale): string {
  return pathname.replace(/^\/(en|fr)/, `/${locale}`) || `/${locale}`;
}

export function localeSwitch(pathname: string, locale: Locale): LocaleSwitch {
  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  return { targetLocale, targetPath: pathInLocale(pathname, targetLocale) };
}
