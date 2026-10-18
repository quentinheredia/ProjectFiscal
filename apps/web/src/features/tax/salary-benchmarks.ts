import type { Locale } from '@/lib/i18n';

/** Salaries with their own Ontario breakdown page; 80,000 is the audited benchmark. */
export const SALARY_BENCHMARK_DOLLARS: readonly number[] = [50000, 80000, 100000, 120000, 150000];
export const AUDIT_BENCHMARK_DOLLARS = 80000;

export function salaryPageHref(locale: Locale, amountDollars: number): string {
  return `/${locale}/salary/${amountDollars}/ontario`;
}

export function salaryBenchmarks(locale: Locale) {
  return SALARY_BENCHMARK_DOLLARS.map((amountDollars) => ({ amountDollars, href: salaryPageHref(locale, amountDollars) }));
}
