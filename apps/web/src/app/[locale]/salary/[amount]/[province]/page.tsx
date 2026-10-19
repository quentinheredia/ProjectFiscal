import React from 'react';
import type { Metadata } from 'next';
import Calculator from '@/components/Calculator';
import CalculatorExtras from '@/components/CalculatorExtras';
import { SITE_URL, localizedAlternates, resolveLocale } from '@/lib/locale';
import { calculateTax, formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { federal2026, ontario2026 } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';

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
  const locale = resolveLocale(resolved.locale);
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
    alternates: localizedAlternates(locale, '/salary/80000/ontario'),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/salary/80000/ontario`,
    },
  };
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
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
    <div className="space-y-12 max-w-7xl mx-auto pt-4">
      {/* Editorial Summary Header */}
      <section className="bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-4">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {locale === 'fr'
            ? '80 000 $ après impôt en Ontario (2026)'
            : '$80,000 After Tax in Ontario (2026 Salary Breakdown)'}
        </h1>
        <p className="text-base text-slate-400 max-w-3xl leading-relaxed">
          {locale === 'fr'
            ? `Sur un salaire brut de 80 000 $ en Ontario en 2026, votre salaire net annuel estimé est de ${formatCentsToDollars(result.takeHomePayCents)}, soit environ ${formatCentsToDollars(Math.round(result.takeHomePayCents / 12))} par mois ou ${formatCentsToDollars(Math.round(result.takeHomePayCents / 26))} toutes les deux semaines.`
            : `If you make an annual employment salary of $80,000 in Ontario in 2026, your estimated net take-home pay is ${formatCentsToDollars(result.takeHomePayCents)} per year (${formatCentsToDollars(Math.round(result.takeHomePayCents / 12))}/month or ${formatCentsToDollars(Math.round(result.takeHomePayCents / 26))} bi-weekly).`}
        </p>

        {/* Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Take-Home Pay</span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              {formatCentsToDollars(result.takeHomePayCents)}
            </span>
          </div>
          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total Income Tax</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {formatCentsToDollars(result.totalTaxCents)}
            </span>
          </div>
          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Average Tax Rate</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {(result.averageTaxRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Marginal Rate</span>
            <span className="text-xl font-bold text-emerald-400 tabular-nums">
              {(result.marginalTaxRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Calculator prefilled at $80,000 in BrowserWindow */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white">
            Adjust this calculation or add RRSP/FHSA deductions
          </h2>
        </div>
        <div className="space-y-10">
          <Calculator
            locale={locale}
            initialProvince="ON"
            initialSalaryDollars={80000}
          />
          <CalculatorExtras locale={locale} />
        </div>
      </section>
    </div>
  );
}
