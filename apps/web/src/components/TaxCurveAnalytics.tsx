'use client';

import React from 'react';
import { calculateTax } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import { AnalyticsLineChart, AnalyticsDataPoint } from '@/components/ui/analytics-chart';
import { Locale, getDictionary } from '@/lib/i18n';
import { TrendingUp, Activity } from 'lucide-react';

interface TaxCurveAnalyticsProps {
  locale: Locale;
}

const TAX_YEAR = 2026;
const SALARY_BENCHMARKS = [25000, 45000, 65000, 80000, 105000, 135000, 170000, 200000] as const;
const RETENTION_CARD_BENCHMARKS = [45000, 80000, 135000] as const;

/**
 * Calculates Ontario annual take-home pay in whole integer dollars using the pure tax-engine.
 */
function calculateTakeHomePay(annualSalaryDollars: number): number {
  const annualSalaryCents = annualSalaryDollars * 100;
  const result = calculateTax(
    { year: TAX_YEAR, province: 'ON', employmentIncomeCents: annualSalaryCents },
    getFederalRules(TAX_YEAR),
    getProvincialRules('ON', TAX_YEAR),
    { computeMarginalRate: false, includeTraces: false }
  );
  return Math.round(result.takeHomePayCents / 100);
}

const TAKE_HOME_BY_SALARY = new Map<number, number>(
  SALARY_BENCHMARKS.map((salary) => [salary, calculateTakeHomePay(salary)])
);

function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRetentionPercent(takeHome: number, grossSalary: number, locale: Locale): string {
  const percentage = (takeHome / grossSalary) * 100;
  const formattedNumber = percentage.toFixed(1).replace('.', locale === 'fr' ? ',' : '.');
  return locale === 'fr' ? `${formattedNumber} %` : `${formattedNumber}%`;
}

export default function TaxCurveAnalytics({ locale }: TaxCurveAnalyticsProps) {
  const dict = getDictionary(locale);
  const strings = dict.taxCurve;

  // Build chart data points with descriptive labels and accurate retention ratios
  const chartPoints: AnalyticsDataPoint[] = SALARY_BENCHMARKS.map((salary, index) => {
    const takeHome = TAKE_HOME_BY_SALARY.get(salary) ?? calculateTakeHomePay(salary);
    const retentionRate = formatRetentionPercent(takeHome, salary, locale);
    const formattedSalary = formatCurrency(salary, locale);

    return {
      date: `${TAX_YEAR}-${String(index + 1).padStart(2, '0')}-01`,
      label: `${formattedSalary} ${strings.grossLabel} (${retentionRate})`,
      value: takeHome,
      header: strings.netRetentionHeader.replace('{rate}', retentionRate),
      hideDate: true,
      xLabel: `$${salary / 1000}k`,
    };
  });

  return (
    <section
      id="brackets-curve"
      aria-label={strings.title}
      className="max-w-7xl mx-auto my-12 bg-[#0c121e] rounded-2xl border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6 relative overflow-hidden"
    >
      {/* Background radial accent glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{strings.badge}</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {strings.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {strings.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#070b12] p-2.5 rounded-xl border border-white/[0.06] shrink-0">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{strings.indexedBadge}</span>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="pt-2">
        <AnalyticsLineChart
          data={chartPoints}
          valueLabel={strings.takeHomeAxisLabel}
          pinnedIndices={[3, 7]}
          className="w-full"
        />
      </div>

      {/* Flush 3-Column Retention Footer Strip (Zero Nested Inner Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] border-t border-white/[0.06] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 mt-6 bg-white/[0.01] text-xs text-slate-400">
        {RETENTION_CARD_BENCHMARKS.map((salary) => {
          const takeHome = TAKE_HOME_BY_SALARY.get(salary) ?? calculateTakeHomePay(salary);
          const retentionRate = formatRetentionPercent(takeHome, salary, locale);
          const formattedGross = formatCurrency(salary, locale);
          const formattedNet = formatCurrency(takeHome, locale);

          return (
            <div
              key={salary}
              className="p-5 sm:p-6 flex flex-col justify-between space-y-2 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">
                  {strings.retentionAt.replace('{amount}', formattedGross)}
                </span>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {formattedNet} {strings.netLabel}
                </span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold text-sm tabular-nums">
                  {retentionRate}
                </span>{' '}
                <span className="text-slate-500 text-[11px]">
                  {strings.keptExplanation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
