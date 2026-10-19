'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, Sliders, Lock, ArrowRight, Calculator, Info, Users, TrendingUp, TrendingDown } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCurrency } from '@/lib/format';
import { ENVELOPE_STEP_BILLION, envelopesIn, type BudgetEnvelope, type EnvelopeGroup } from '@/features/budget/envelopes';
import { formatBillionDelta, formatBillions } from '@/features/budget/summarize';
import type { BudgetModel } from '@/features/budget/useBudgetAllocations';

interface BudgetSimulatorDesktopProps {
  locale: Locale;
  model: BudgetModel;
}

const TONE: Record<EnvelopeGroup, { accent: string; baseline: string }> = {
  statutory: { accent: 'accent-yellow-400', baseline: 'text-yellow-400/80' },
  discretionary: { accent: 'accent-blue-400', baseline: 'text-blue-400/80' },
};

/** Variance in billions with its sign and colour class. */
function varianceTone(direction: BudgetModel['summary']['direction']): string {
  if (direction === 'deficit') return 'text-red-400';
  if (direction === 'surplus') return 'text-emerald-400';
  return 'text-slate-200';
}

function EnvelopeCard({ envelope, model, locale }: { envelope: BudgetEnvelope; model: BudgetModel; locale: Locale }) {
  const dict = useDictionary().budgetSimulator;
  const current = model.allocationOf(envelope);
  const diff = current - envelope.baselineBillion;
  const tone = TONE[envelope.group];
  const name = locale === 'fr' ? envelope.nameFr : envelope.nameEn;

  return (
    <div className="p-5 rounded-2xl bg-[#0c121e]/70 border border-white/[0.08] space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-white text-sm truncate">{name}</span>
        <div className="flex items-center gap-1 text-right shrink-0">
          <span className="text-sm font-black text-white tabular-nums">{formatBillions(current, locale)}</span>
          {Math.abs(diff) > 0.05 && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                diff > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {formatBillionDelta(diff, locale)}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{locale === 'fr' ? envelope.descFr : envelope.descEn}</p>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{fillTemplate(dict.minLabel, { amount: formatBillions(envelope.minBillion, locale) })}</span>
          <span className={`${tone.baseline} font-mono`}>
            {fillTemplate(dict.baselineLabel, { amount: formatBillions(envelope.baselineBillion, locale) })}
          </span>
          <span>{fillTemplate(dict.maxLabel, { amount: formatBillions(envelope.maxBillion, locale) })}</span>
        </div>
        <input
          type="range"
          aria-label={fillTemplate(dict.phone.sliderLabel, { name })}
          min={envelope.minBillion}
          max={envelope.maxBillion}
          step={ENVELOPE_STEP_BILLION}
          value={current}
          onChange={(e) => model.setAllocation(envelope, Number(e.target.value))}
          className={`w-full ${tone.accent} cursor-pointer`}
        />
      </div>
    </div>
  );
}

export default function BudgetSimulatorDesktop({ locale, model }: BudgetSimulatorDesktopProps) {
  const dict = useDictionary().budgetSimulator;
  const { summary } = model;
  const percent = summary.groupPercent;
  const varianceCaption =
    summary.direction === 'deficit' ? dict.deficitCaption : summary.direction === 'surplus' ? dict.surplusCaption : dict.balanced;
  const impact = summary.perTaxpayerDollars;

  return (
    <div className="space-y-8">
      {/* Summary console, pinned under the navbar */}
      <div className="sticky top-18 z-40 -mx-8 px-8 py-3 bg-[#090d16]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{dict.totalSpending}</span>
              <div className="text-3xl font-black text-white tabular-nums tracking-tight">{formatBillions(summary.totalBillion, locale)}</div>
              <span className="text-[11px] text-slate-400 block">{dict.baselineTarget}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{dict.deficitSurplus}</span>
              <div className={`text-3xl font-black tabular-nums tracking-tight ${varianceTone(summary.direction)}`}>
                {summary.direction === 'balanced' ? formatBillions(0, locale) : formatBillions(summary.varianceBillion, locale)}
              </div>
              <span className="text-[11px] text-slate-400 block">{varianceCaption}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="text-yellow-400">{fillTemplate(dict.statutoryShareLabel, { percent: String(percent.statutory) })}</span>
                <span className="text-blue-400">{fillTemplate(dict.discretionaryShareLabel, { percent: String(percent.discretionary) })}</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 border border-white/[0.08]" aria-hidden="true">
                <div style={{ width: `${percent.statutory}%` }} className="bg-yellow-500 h-full transition-[width] duration-300" />
                <div style={{ width: `${percent.discretionary}%` }} className="bg-blue-500 h-full transition-[width] duration-300" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
                <span>{formatBillions(summary.groupBillion.statutory, locale)}</span>
                <span>{formatBillions(summary.groupBillion.discretionary, locale)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <button
                type="button"
                onClick={model.reset}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2c] hover:bg-[#1e273d] border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{dict.reset}</span>
              </button>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{dict.calculatorLink}</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {(['statutory', 'discretionary'] as const).map((group) => (
        <section key={group} className="space-y-4">
          <div className="border-b border-white/[0.08] pb-3 space-y-1">
            <div className="flex items-center gap-2">
              {group === 'statutory' ? (
                <Lock className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              ) : (
                <Sliders className="w-4 h-4 text-blue-400" aria-hidden="true" />
              )}
              <h2 className="text-lg font-bold text-white tracking-tight">
                {fillTemplate(group === 'statutory' ? dict.statutoryHeading : dict.discretionaryHeading, { percent: String(percent[group]) })}
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border ${
                  group === 'statutory' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}
              >
                {group === 'statutory' ? dict.lockedBadge : dict.flexibleBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400">{group === 'statutory' ? dict.statutorySectionDesc : dict.discretionarySectionDesc}</p>
          </div>

          <div className={`grid gap-4 ${group === 'statutory' ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {envelopesIn(group).map((envelope) => (
              <EnvelopeCard key={envelope.id} envelope={envelope} model={model} locale={locale} />
            ))}

            {group === 'discretionary' && (
              <div className="p-5 rounded-2xl bg-linear-to-br from-[#0c121e] to-[#121927] border border-emerald-500/30 space-y-3 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.06)]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                      <span className="font-bold text-white text-sm">{dict.perTaxpayerCard.title}</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                      {dict.perTaxpayerCard.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{dict.perTaxpayerCard.desc}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#080d16] border border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{dict.perTaxpayerCard.impactLabel}:</span>
                    <div className="flex items-center gap-1">
                      {impact > 0 && <TrendingUp className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />}
                      {impact < 0 && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />}
                      <span className={`font-black font-mono text-sm tabular-nums ${impact > 0 ? 'text-red-400' : impact < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {impact > 0 ? '+' : ''}
                        {formatCurrency(impact, locale)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right font-medium">
                    {impact === 0 ? dict.perTaxpayerCard.baselineText : impact < 0 ? dict.perTaxpayerCard.surplusText : dict.perTaxpayerCard.deficitText}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span>{dict.statutoryLockedNotice}</span>
      </div>
    </div>
  );
}
