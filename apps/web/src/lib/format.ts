import type { Locale } from './i18n';

const CENTS_PER_DOLLAR = 100;

function numberLocale(locale: Locale): string {
  return locale === 'fr' ? 'fr-CA' : 'en-CA';
}

/** Dollars as Canadian currency in the visitor's locale, for example "$74,206" or "74 206 $". */
export function formatCurrency(dollars: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(numberLocale(locale), {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(dollars);
}

export function formatCents(cents: number, locale: Locale, fractionDigits = 0): string {
  return formatCurrency(cents / CENTS_PER_DOLLAR, locale, fractionDigits);
}

/** A 0 to 1 ratio as a percentage, for example 0.258 as "25.8%" or "25,8 %". */
export function formatPercent(ratio: number, locale: Locale, fractionDigits = 1): string {
  const formatted = (ratio * 100).toFixed(fractionDigits).replace('.', locale === 'fr' ? ',' : '.');
  return locale === 'fr' ? `${formatted} %` : `${formatted}%`;
}

/** Dollars in thousands, for example 81200 as "$81.2k" or "81,2 k$". */
export function formatThousands(dollars: number, locale: Locale): string {
  const thousands = Math.round(dollars / 100) / 10;
  const text = String(thousands).replace('.', locale === 'fr' ? ',' : '.');
  return locale === 'fr' ? `${text} k$` : `$${text}k`;
}

/** Fills {name} placeholders in a dictionary string; unknown placeholders are left as they are. */
export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
