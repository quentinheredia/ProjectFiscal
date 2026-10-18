import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { calculateTax, type TaxCalculationResult } from '@fiscal-insights/tax-engine';
import { federal2026, ontario2026 } from '@fiscal-insights/tax-data';
import Calculator from '@/components/Calculator';
import CalculatorExtras from '@/components/CalculatorExtras';
import { MetricList } from '@/components/mobile/MetricList';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import { getDictionary, type Locale } from '@/lib/i18n';
import { fillTemplate, formatCents, formatCurrency, formatPercent } from '@/lib/format';
import { LOCALES, SITE_URL, localizedAlternates, resolveLocale } from '@/lib/locale';
import { AUDIT_BENCHMARK_DOLLARS, SALARY_BENCHMARK_DOLLARS } from '@/features/tax/salary-benchmarks';
import { PAY_PERIODS_PER_YEAR, perPeriodCents } from '@/features/tax/pay-frequency';

interface SalaryPageProps {
  params: Promise<{
    locale: string;
    amount: string;
    province: string;
  }>;
}

// Salary pages cover Ontario only, at the benchmark amounts.
const SALARY_PROVINCE_SLUG = 'ontario';
const CENTS_PER_DOLLAR = 100;

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    SALARY_BENCHMARK_DOLLARS.map((amount) => ({ locale, amount: String(amount), province: SALARY_PROVINCE_SLUG }))
  );
}

/** The benchmark amount a route names, or null when the route is not a salary page. */
function benchmarkFromParams(amount: string, province: string): number | null {
  const dollars = Number(amount);
  const known = SALARY_BENCHMARK_DOLLARS.includes(dollars) && province.toLowerCase() === SALARY_PROVINCE_SLUG;
  return known ? dollars : null;
}

function ontarioResult(salaryDollars: number): TaxCalculationResult {
  return calculateTax(
    { year: 2026, province: 'ON', employmentIncomeCents: salaryDollars * CENTS_PER_DOLLAR },
    federal2026,
    ontario2026
  );
}

function salaryPath(dollars: number): string {
  return `/salary/${dollars}/${SALARY_PROVINCE_SLUG}`;
}

export async function generateMetadata({ params }: SalaryPageProps): Promise<Metadata> {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const dollars = benchmarkFromParams(resolved.amount, resolved.province);
  if (dollars === null) return {};

  const strings = getDictionary(locale).salaryPage;
  const values = { amount: formatCurrency(dollars, locale) };
  const title = fillTemplate(strings.metaTitle, values);
  const description = fillTemplate(strings.metaDescription, values);

  return {
    title,
    description,
    alternates: localizedAlternates(locale, salaryPath(dollars)),
    openGraph: { title, description, url: `${SITE_URL}/${locale}${salaryPath(dollars)}` },
  };
}

function highlights(result: TaxCalculationResult, locale: Locale) {
  const strings = getDictionary(locale).salaryPage;
  return [
    { key: 'net', label: strings.takeHome, value: formatCents(result.takeHomePayCents, locale, 2), emphasis: true },
    { key: 'tax', label: strings.totalIncomeTax, value: formatCents(result.totalTaxCents, locale, 2) },
    { key: 'average', label: strings.averageRate, value: formatPercent(result.averageTaxRate, locale) },
    { key: 'marginal', label: strings.marginalRate, value: formatPercent(result.marginalTaxRate, locale) },
  ];
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const dollars = benchmarkFromParams(resolved.amount, resolved.province);
  if (dollars === null) notFound();

  const strings = getDictionary(locale).salaryPage;
  const result = ontarioResult(dollars);
  const items = highlights(result, locale);
  const summary = fillTemplate(strings.summary, {
    amount: formatCurrency(dollars, locale),
    net: formatCents(result.takeHomePayCents, locale, 2),
    monthly: formatCents(perPeriodCents(result.takeHomePayCents, 'monthly'), locale, 2),
    biweekly: formatCents(Math.round(result.takeHomePayCents / PAY_PERIODS_PER_YEAR.biweekly), locale, 2),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-10 lg:max-w-7xl lg:space-y-12 lg:pt-4">
      <section className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0c121e] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] md:p-6 lg:p-8">
        <h1 className="text-balance text-[1.875rem] font-black leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
          {fillTemplate(strings.title, { amount: formatCurrency(dollars, locale) })}
        </h1>
        <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-slate-400 lg:text-base">{summary}</p>

        <PhoneOnly className="border-t border-slate-800/80">
          <MetricList metrics={items} />
        </PhoneOnly>
        <DesktopOnly>
          <div className="grid grid-cols-4 gap-4 border-t border-slate-800/80 pt-4">
            {items.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-800 bg-[#070b12] p-4">
                <span className="mb-1 block text-xs text-slate-400">{item.label}</span>
                <span className={`text-xl font-black tabular-nums ${item.emphasis ? 'text-emerald-400' : 'text-white'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </DesktopOnly>
      </section>

      <section className="space-y-4">
        <h2 className="px-1 text-lg font-bold text-white">{strings.adjustHeading}</h2>
        <div className="space-y-10">
          <Calculator locale={locale} initialProvince="ON" initialSalaryDollars={dollars} />
          {dollars === AUDIT_BENCHMARK_DOLLARS && <CalculatorExtras locale={locale} />}
        </div>
      </section>
    </div>
  );
}
