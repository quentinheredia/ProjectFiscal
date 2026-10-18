import type { Metadata } from 'next';
import type { Locale } from './i18n';

export const SITE_URL = 'https://fiscal-insights.ca';
export const LOCALES: readonly Locale[] = ['en', 'fr'];

/** Any route segment other than "fr" falls back to English. */
export function resolveLocale(segment: string): Locale {
  return segment === 'fr' ? 'fr' : 'en';
}

/** Canonical URL plus en-CA, fr-CA and x-default alternates for a path below the locale, such as "/simulator". */
export function localizedAlternates(locale: Locale, path = ''): NonNullable<Metadata['alternates']> {
  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: {
      'en-CA': `${SITE_URL}/en${path}`,
      'fr-CA': `${SITE_URL}/fr${path}`,
      'x-default': `${SITE_URL}/en${path}`,
    },
  };
}

export function localeParams(): { locale: Locale }[] {
  return LOCALES.map((locale) => ({ locale }));
}
