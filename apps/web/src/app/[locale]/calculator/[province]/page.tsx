import React from 'react';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import { Locale, getDictionary } from '@/lib/i18n';
import { ontario2026 } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { BrowserWindow } from '@/components/ui/mock-browser-window';

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

      <section className="text-center max-w-4xl mx-auto space-y-3 pt-4">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {locale === 'fr'
            ? 'Calculateur d’impôt sur le revenu de l’Ontario 2026'
            : 'Ontario Income Tax Calculator 2026'}
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto">
          {locale === 'fr'
            ? 'Explorez les tranches d’imposition de l’Ontario pour 2026, la surtaxe provinciale et les paliers de la Contribution-santé.'
            : 'Calculate your exact net pay in Ontario with current 2026 provincial brackets, the two-tier Ontario surtax, and the Ontario Health Premium.'}
        </p>
      </section>

      {/* Preset for Ontario in BrowserWindow */}
      <section className="max-w-7xl mx-auto">
        <BrowserWindow
          url={`https://fiscal-insights.ca/${locale}/calculator/ontario`}
          variant="safari"
          theme="dark"
          headerStyle="full"
          className="border-slate-800 bg-[#090d16]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-8">
            <Calculator locale={locale} initialProvince="ON" initialSalaryDollars={80000} />
          </div>
        </BrowserWindow>
      </section>

      {/* Official Ontario 2026 Tax Brackets Table */}
      <section className="bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {locale === 'fr' ? 'Barèmes d’imposition de l’Ontario (2026)' : 'Ontario 2026 Tax Brackets & Rates'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {locale === 'fr'
              ? 'Taux officiels issus du formulaire provincial ON428 de l’Agence du revenu du Canada.'
              : 'Official provincial rates based on Form ON428 and Ontario Ministry of Finance guidelines.'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                <th className="py-3 px-4">Bracket Threshold</th>
                <th className="py-3 px-4">Tax Rate</th>
                <th className="py-3 px-4">Source Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
              {ontario2026.brackets.map((b, idx) => {
                const prevBracket = idx > 0 ? ontario2026.brackets[idx - 1] : undefined;
                const prevUpTo = prevBracket?.upToCents?.value ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                const currentUpTo = b.upToCents?.value ? formatCentsToDollars(b.upToCents.value) : 'Any amount above';
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white tabular-nums">
                      {prevUpTo} to {currentUpTo}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 tabular-nums">
                      {(b.rate.value * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      Form ON428, Part A
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ontario Health Premium Note */}
        <div className="bg-[#14120a] border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200/90 space-y-1">
          <span className="font-bold text-amber-300 block">Note on the Ontario Health Premium (OHP):</span>
          <p className="text-amber-200/80 leading-relaxed">
            Unlike other provinces, Ontario levies an additional graduated health premium ranging from $0 up to a maximum of $900 for taxable incomes over $200,600. For an individual earning $80,000, the Ontario Health Premium is exactly $750.00.
          </p>
        </div>
      </section>
    </div>
  );
}
