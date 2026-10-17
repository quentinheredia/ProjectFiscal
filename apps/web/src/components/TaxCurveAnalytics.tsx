'use client';

import React from 'react';
import { calculateTax } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import { AnalyticsLineChart, AnalyticsDataPoint } from '@/components/ui/analytics-chart';
import { Locale } from '@/lib/i18n';
import { TrendingUp, Activity } from 'lucide-react';

interface TaxCurveAnalyticsProps {
  locale: Locale;
}

const YEAR = 2026;
const SALARIES = [25000, 45000, 65000, 80000, 105000, 135000, 170000, 200000];
const RETENTION_SALARIES = [45000, 80000, 135000];

// Every figure comes from the engine (Ontario, 2026 rules), never typed in by hand.
function takeHomeDollars(salary: number): number {
  const result = calculateTax(
    { year: YEAR, province: 'ON', employmentIncomeCents: salary * 100 },
    getFederalRules(YEAR),
    getProvincialRules('ON', YEAR),
    { computeMarginalRate: false, includeTraces: false }
  );
  return Math.round(result.takeHomePayCents / 100);
}

const TAKE_HOME = new Map(SALARIES.map((salary) => [salary, takeHomeDollars(salary)]));

export default function TaxCurveAnalytics({ locale }: TaxCurveAnalyticsProps) {
  const isFr = locale === 'fr';
  const money = new Intl.NumberFormat(isFr ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  // The chart spaces points by date, so each salary gets its own slot.
  const data: AnalyticsDataPoint[] = SALARIES.map((salary, index) => ({
    date: `${YEAR}-${String(index + 1).padStart(2, '0')}-01`,
    label: `${money.format(salary)} ${isFr ? 'brut' : 'gross'}`,
    value: TAKE_HOME.get(salary)!,
  }));
  const retention = (salary: number) =>
    `${((TAKE_HOME.get(salary)! / salary) * 100).toFixed(1).replace('.', isFr ? ',' : '.')}${isFr ? ' %' : '%'}`;

  return (
    <section className="max-w-7xl mx-auto bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mt-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{isFr ? 'Analyse de la courbe fiscale' : 'Progressive Tax Curve Analytics'}</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {isFr ? 'Rétention du revenu net selon le salaire brut' : 'Net Take-Home Pay Across Salary Brackets'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {isFr
              ? 'Explorez interactivement comment les tranches marginales progressives, les plafonds du RPC/RRQ et les abattements affectent votre paie nette en Ontario.'
              : 'Interactive visualization of marginal retention and statutory tax brackets across income levels in Ontario (2026 rules). Hover points to inspect exact take-home pay.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#070b12] p-2.5 rounded-xl border border-slate-800 shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{isFr ? 'Tranches indexées 2026' : '2026 Inflation-Indexed Brackets'}</span>
        </div>
      </div>

      <div className="pt-2">
        <AnalyticsLineChart
          data={data}
          valueLabel={isFr ? 'Salaire net ($)' : 'Take-Home ($)'}
          pinnedIndices={[3, 7]}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        {RETENTION_SALARIES.map((salary) => (
          <div key={salary} className="bg-[#070b12] p-3 rounded-xl border border-slate-800">
            <span className="text-white font-semibold block mb-0.5">
              {isFr ? `Taux de rétention à ${money.format(salary)}` : `Retention at ${money.format(salary)}`}
            </span>
            <span className="text-emerald-400 font-bold text-sm tabular-nums">{retention(salary)}</span>{' '}
            <span className="text-slate-500">
              {isFr ? 'conservé après impôts et cotisations' : 'kept after tax and payroll deductions'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
