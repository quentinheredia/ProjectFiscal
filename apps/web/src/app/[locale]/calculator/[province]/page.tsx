import React from 'react';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import CalculatorExtras from '@/components/CalculatorExtras';
import { Locale } from '@/lib/i18n';
import { getProvincialRules } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { BrowserWindow } from '@/components/ui/mock-browser-window';

interface ProvincePageProps {
  params: Promise<{
    locale: string;
    province: string;
  }>;
}

const SUPPORTED_PROVINCES: Record<
  string,
  {
    code: 'ON' | 'QC' | 'BC' | 'AB';
    nameEn: string;
    nameFr: string;
    formName: string;
  }
> = {
  ontario: {
    code: 'ON',
    nameEn: 'Ontario',
    nameFr: 'l’Ontario',
    formName: 'Form ON428',
  },
  quebec: {
    code: 'QC',
    nameEn: 'Québec',
    nameFr: 'le Québec',
    formName: 'Form TP-1',
  },
  'british-columbia': {
    code: 'BC',
    nameEn: 'British Columbia',
    nameFr: 'la Colombie-Britannique',
    formName: 'Form BC428',
  },
  alberta: {
    code: 'AB',
    nameEn: 'Alberta',
    nameFr: 'l’Alberta',
    formName: 'Form AB428',
  },
};

export function generateStaticParams() {
  const locales = ['en', 'fr'];
  const provinces = Object.keys(SUPPORTED_PROVINCES);
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
  const provinceSlug = resolved.province.toLowerCase();
  const config = SUPPORTED_PROVINCES[provinceSlug];

  if (!config) return {};

  const title =
    locale === 'fr'
      ? `Calculateur d’impôt de ${config.nameFr} 2026 | Fiscal Insights`
      : `${config.nameEn} Income Tax Calculator 2026 | Fiscal Insights`;

  const description =
    locale === 'fr'
      ? `Calculez votre impôt de ${config.nameFr} 2026 avec les barèmes officiels, crédits locaux et cotisations.`
      : `Accurate 2026 ${config.nameEn} income tax calculator with official ${config.formName} tax brackets and provincial tax rules.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://fiscal-insights.ca/${locale}/calculator/${provinceSlug}`,
      languages: {
        'en-CA': `https://fiscal-insights.ca/en/calculator/${provinceSlug}`,
        'fr-CA': `https://fiscal-insights.ca/fr/calculator/${provinceSlug}`,
        'x-default': `https://fiscal-insights.ca/en/calculator/${provinceSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://fiscal-insights.ca/${locale}/calculator/${provinceSlug}`,
    },
  };
}

export default async function ProvincePage({ params }: ProvincePageProps) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const provinceSlug = resolved.province.toLowerCase();
  const config = SUPPORTED_PROVINCES[provinceSlug];

  if (!config) notFound();

  const provRules = getProvincialRules(config.code, 2026);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${config.nameEn} Income Tax Calculator 2026`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    description: `Calculate ${config.nameEn} personal income tax and deductions.`,
  };

  return (
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="text-center max-w-4xl mx-auto space-y-3 pt-16">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {locale === 'fr'
            ? `Calculateur d’impôt sur le revenu de ${config.nameFr} 2026`
            : `${config.nameEn} Income Tax Calculator 2026`}
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto">
          {locale === 'fr'
            ? `Explorez les tranches d’imposition de ${config.nameFr} pour 2026 et calculez votre paie nette exacte.`
            : `Calculate your exact net pay in ${config.nameEn} with current 2026 provincial brackets and statutory payroll deductions.`}
        </p>
      </section>

      {/* Calculator Framed in Mock Browser Window */}
      <section className="max-w-7xl mx-auto">
        <BrowserWindow
          url={`https://fiscal-insights.ca/${locale}/calculator/${provinceSlug}`}
          variant="safari"
          theme="dark"
          headerStyle="full"
          className="border-slate-800 bg-[#090d16]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] rounded-2xl"
        >
          <div className="p-4 sm:p-8 space-y-10">
            <Calculator locale={locale} initialProvince={config.code} initialSalaryDollars={80000} />
            <CalculatorExtras locale={locale} />
          </div>
        </BrowserWindow>
      </section>

      {/* Official Provincial 2026 Tax Brackets Table */}
      <section className="bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {locale === 'fr'
              ? `Barèmes d’imposition de ${config.nameFr} (2026)`
              : `${config.nameEn} 2026 Tax Brackets & Rates`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {locale === 'fr'
              ? `Taux officiels issus du formulaire provincial ${config.formName}.`
              : `Official provincial rates based on ${config.formName} guidelines.`}
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
              {provRules.brackets.map((b, idx) => {
                const prevBracket = idx > 0 ? provRules.brackets[idx - 1] : undefined;
                const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : 'Any amount above';
                return (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white tabular-nums">
                      {prevUpTo} to {currentUpTo}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 tabular-nums">
                      {(b.rate.value * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {config.formName}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ontario Health Premium Note if ON */}
        {config.code === 'ON' && (
          <div className="bg-[#14120a] border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200/90 space-y-1">
            <span className="font-bold text-amber-300 block">Note on the Ontario Health Premium (OHP):</span>
            <p className="text-amber-200/80 leading-relaxed">
              Unlike other provinces, Ontario levies an additional graduated health premium ranging from $0 up to a maximum of $900 for taxable incomes over $200,600. For an individual earning $80,000, the Ontario Health Premium is exactly $750.00.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
