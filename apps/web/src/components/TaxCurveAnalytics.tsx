'use client';

import React from 'react';
import { AnalyticsLineChart, AnalyticsDataPoint } from '@/components/ui/analytics-chart';
import { Locale } from '@/lib/i18n';
import { TrendingUp, Activity } from 'lucide-react';

interface TaxCurveAnalyticsProps {
  locale: Locale;
}

const TAX_CURVE_DATA: AnalyticsDataPoint[] = [
  { date: '2026-01-01', label: '$25,000 Gross (Low Bracket)', value: 23150 },
  { date: '2026-02-01', label: '$45,000 Gross (Basic Bracket)', value: 37900 },
  { date: '2026-03-01', label: '$65,000 Gross (Middle Bracket)', value: 50800 },
  { date: '2026-04-01', label: '$80,000 Gross (Median Benchmark)', value: 60048 },
  { date: '2026-05-01', label: '$105,000 Gross (CPP2 Ceiling)', value: 75400 },
  { date: '2026-06-01', label: '$135,000 Gross (Upper-Middle)', value: 92800 },
  { date: '2026-07-01', label: '$170,000 Gross (High Bracket)', value: 111600 },
  { date: '2026-08-01', label: '$200,000 Gross (Top Bracket)', value: 126400 },
];

export default function TaxCurveAnalytics({ locale }: TaxCurveAnalyticsProps) {
  const isFr = locale === 'fr';

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
          data={TAX_CURVE_DATA}
          valueLabel={isFr ? 'Salaire net ($)' : 'Take-Home ($)'}
          pinnedIndices={[3, 7]}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="bg-[#070b12] p-3 rounded-xl border border-slate-800">
          <span className="text-white font-semibold block mb-0.5">
            {isFr ? 'Taux de rétention à 45k$' : 'Retention at $45,000'}
          </span>
          <span className="text-emerald-400 font-bold text-sm tabular-nums">84.2%</span>{' '}
          <span className="text-slate-500">
            {isFr ? 'conservé après impôts' : 'kept after deductions'}
          </span>
        </div>
        <div className="bg-[#070b12] p-3 rounded-xl border border-slate-800">
          <span className="text-white font-semibold block mb-0.5">
            {isFr ? 'Taux de rétention à 80k$' : 'Retention at $80,000'}
          </span>
          <span className="text-emerald-400 font-bold text-sm tabular-nums">75.1%</span>{' '}
          <span className="text-slate-500">
            {isFr ? 'conservé après impôts' : 'kept after deductions'}
          </span>
        </div>
        <div className="bg-[#070b12] p-3 rounded-xl border border-slate-800">
          <span className="text-white font-semibold block mb-0.5">
            {isFr ? 'Taux de rétention à 135k$' : 'Retention at $135,000'}
          </span>
          <span className="text-emerald-400 font-bold text-sm tabular-nums">68.7%</span>{' '}
          <span className="text-slate-500">
            {isFr ? 'conservé après impôts' : 'kept after deductions'}
          </span>
        </div>
      </div>
    </section>
  );
}
