import React from 'react';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import CalculatorExtras from '@/components/CalculatorExtras';
import { Locale } from '@/lib/i18n';
import { calculateTax, formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { federal2026, ontario2026 } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface SalaryPageProps {
  params: Promise<{
    locale: string;
    amount: string;
    province: string;
  }>;
}

export function generateStaticParams() {
  const locales = ['en', 'fr'];
  const salaries = ['80000'];
  const provinces = ['ontario'];
  const params: { locale: string; amount: string; province: string }[] = [];

  for (const locale of locales) {
    for (const amount of salaries) {
      for (const province of provinces) {
        params.push({ locale, amount, province });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: SalaryPageProps): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const amount = resolved.amount;
  const province = resolved.province;

  if (amount !== '80000' || province.toLowerCase() !== 'ontario') return {};

  const title =
    locale === 'fr'
      ? '80 000 $ après impôt en Ontario (2026) | Fiscal Insights'
      : '$80,000 After Tax in Ontario (2026) | Fiscal Insights';

  const description =
    locale === 'fr'
      ? 'Découvrez votre salaire net sur un revenu de 80 000 $ en Ontario en 2026. Répartition détaillée de l’impôt fédéral, provincial, RPC et AE.'
      : 'Comprehensive breakdown of an $80,000 salary in Ontario for 2026. Calculate exact take-home pay, federal & provincial tax, CPP2 and EI deductions.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://fiscal-insights.ca/${locale}/salary/80000/ontario`,
      languages: {
        'en-CA': 'https://fiscal-insights.ca/en/salary/80000/ontario',
        'fr-CA': 'https://fiscal-insights.ca/fr/salary/80000/ontario',
        'x-default': 'https://fiscal-insights.ca/en/salary/80000/ontario',
      },
    },
    openGraph: {
      title,
      description,
      url: `https://fiscal-insights.ca/${locale}/salary/80000/ontario`,
    },
  };
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const amount = resolved.amount;
  const province = resolved.province;

  if (amount !== '80000' || province.toLowerCase() !== 'ontario') notFound();

  // Compute exact figures statically for $80,000 in Ontario for 2026
  const result = calculateTax(
    {
      year: 2026,
      province: 'ON',
      employmentIncomeCents: 8000000, // $80,000
    },
    federal2026,
    ontario2026
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Editorial Summary Header */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-blue-light text-brand-blue border border-brand-blue/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Audited 2026 Official Rates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {locale === 'fr'
            ? '80 000 $ après impôt en Ontario (2026)'
            : '$80,000 After Tax in Ontario (2026 Salary Breakdown)'}
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          {locale === 'fr'
            ? `Sur un salaire brut de 80 000 $ en Ontario en 2026, votre salaire net annuel estimé est de ${formatCentsToDollars(result.takeHomePayCents)}, soit environ ${formatCentsToDollars(Math.round(result.takeHomePayCents / 12))} par mois ou ${formatCentsToDollars(Math.round(result.takeHomePayCents / 26))} toutes les deux semaines.`
            : `If you make an annual employment salary of $80,000 in Ontario in 2026, your estimated net take-home pay is ${formatCentsToDollars(result.takeHomePayCents)} per year (${formatCentsToDollars(Math.round(result.takeHomePayCents / 12))}/month or ${formatCentsToDollars(Math.round(result.takeHomePayCents / 26))} bi-weekly).`}
        </p>

        {/* Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Take-Home Pay</span>
            <span className="text-xl font-black text-brand-green-dark tabular-nums">
              {formatCentsToDollars(result.takeHomePayCents)}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Income Tax</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCentsToDollars(result.totalTaxCents)}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Average Tax Rate</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {(result.averageTaxRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Marginal Rate</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {(result.marginalTaxRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Calculator prefilled at $80,000 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Adjust this calculation or add RRSP/FHSA deductions
          </h2>
        </div>
        <Calculator
          locale={locale}
          initialProvince="ON"
          initialSalaryDollars={80000}
        />
      </div>
      <CalculatorExtras locale={locale} />
    </div>
  );
}
