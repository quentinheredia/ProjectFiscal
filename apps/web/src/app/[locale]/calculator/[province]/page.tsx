import React from 'react';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import { Locale, getDictionary } from '@/lib/i18n';
import { ontario2026 } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';

interface ProvincePageProps {
  params: Promise<{
    locale: string;
    province: string;
  }>;
}

export function generateStaticParams() {
  const locales = ['en', 'fr'];
  const provinces = ['ontario'];
  const params: { locale: string; province: string }[] = [];

  for (const locale of locales) {
    for (const province of provinces) {
      params.push({ locale, province });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: ProvincePageProps): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const province = resolved.province;
  if (province.toLowerCase() !== 'ontario') return {};

  const title =
    locale === 'fr'
      ? 'Calculateur d’impôt de l’Ontario 2026 | Fiscal Insights'
      : 'Ontario Income Tax Calculator 2026 | Fiscal Insights';

  const description =
    locale === 'fr'
      ? 'Calculez votre impôt de l’Ontario 2026 avec les barèmes officiels, la surtaxe provinciale et la contribution-santé de l’Ontario (OHP).'
      : 'Accurate 2026 Ontario income tax calculator with official ON428 tax brackets, Ontario surtax, and Ontario Health Premium tiers.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://fiscal-insights.ca/${locale}/calculator/ontario`,
      languages: {
        'en-CA': 'https://fiscal-insights.ca/en/calculator/ontario',
        'fr-CA': 'https://fiscal-insights.ca/fr/calculator/ontario',
        'x-default': 'https://fiscal-insights.ca/en/calculator/ontario',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://fiscal-insights.ca/${locale}/calculator/ontario`,
    },
  };
}

export default async function ProvincePage({ params }: ProvincePageProps) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const province = resolved.province;
  if (province.toLowerCase() !== 'ontario') notFound();

  const dict = getDictionary(locale);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ontario Income Tax Calculator 2026',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    description: 'Calculate Ontario personal income tax, surtax, and health premium.',
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="text-center max-w-4xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {locale === 'fr'
            ? 'Calculateur d’impôt sur le revenu de l’Ontario 2026'
            : 'Ontario Income Tax Calculator 2026'}
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto">
          {locale === 'fr'
            ? 'Explorez les tranches d’imposition de l’Ontario pour 2026, la surtaxe provinciale et les paliers de la Contribution-santé.'
            : 'Calculate your exact net pay in Ontario with current 2026 provincial brackets, the two-tier Ontario surtax, and the Ontario Health Premium.'}
        </p>
      </section>

      {/* Preset for Ontario */}
      <Calculator locale={locale} initialProvince="ON" initialSalaryDollars={80000} />

      {/* Official Ontario 2026 Tax Brackets Table */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {locale === 'fr' ? 'Barèmes d’imposition de l’Ontario (2026)' : 'Ontario 2026 Tax Brackets & Rates'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {locale === 'fr'
              ? 'Taux officiels issus du formulaire provincial ON428 de l’Agence du revenu du Canada.'
              : 'Official provincial rates based on Form ON428 and Ontario Ministry of Finance guidelines.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3 px-4">Bracket Threshold</th>
                <th className="py-3 px-4">Tax Rate</th>
                <th className="py-3 px-4">Source Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ontario2026.brackets.map((b, idx) => {
                const prevBracket = idx > 0 ? ontario2026.brackets[idx - 1] : undefined;
                const prevUpTo = prevBracket?.upToCents?.value ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                const currentUpTo = b.upToCents?.value ? formatCentsToDollars(b.upToCents.value) : 'Any amount above';
                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900 tabular-nums">
                      {prevUpTo} to {currentUpTo}
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-green-dark tabular-nums">
                      {(b.rate.value * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      Form ON428, Part A
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ontario Health Premium Note */}
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
          <span className="font-bold block">Note on the Ontario Health Premium (OHP):</span>
          <p className="text-amber-800 leading-relaxed">
            Unlike other provinces, Ontario levies an additional graduated health premium ranging from $0 up to a maximum of $900 for taxable incomes over $200,600. For an individual earning $80,000, the Ontario Health Premium is exactly $750.00.
          </p>
        </div>
      </section>
    </div>
  );
}
