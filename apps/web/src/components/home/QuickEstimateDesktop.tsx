'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { ArrowRight, ShieldCheck, FileCheck2, PieChart, CheckCircle2, Scale, Calculator, Sliders } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { formatCents, formatThousands } from '@/lib/format';
import { allocateFederalTax, spendingBarWidth } from '@/features/tax/spending';
import {
  QUICK_FREQUENCIES,
  QUICK_PRESETS,
  QUICK_SALARY_CHIPS,
  QUICK_SALARY_MAX_DOLLARS,
  type QuickEstimateModel,
} from '@/features/tax/useQuickEstimate';

type InspectorTab = 'spending' | 'traces' | 'comparison';

interface QuickEstimateDesktopProps {
  locale: Locale;
  model: QuickEstimateModel;
}

const percentText = (ratio: number) => `${(ratio * 100).toFixed(1)}%`;

export default function QuickEstimateDesktop({ locale, model }: QuickEstimateDesktopProps) {
  const dict = useDictionary();
  const [activeTab, setActiveTab] = useState<InspectorTab>('spending');
  const { result, shares, perPeriod, province } = model;
  const scaled = (cents: number) => formatCentsToDollars(perPeriod(cents));

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
      <div className="flex flex-col">
        {/* Preset scenarios */}
        <div className="border-b border-white/[0.06] px-6 py-3.5 bg-white/[0.01] flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
            {dict.simulation.selectScenario}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_PRESETS.map((preset) => {
              const isActive = model.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => model.selectPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold'
                      : 'bg-[#070b12] text-slate-400 hover:text-white border border-white/[0.06] hover:border-slate-700'
                  }`}
                >
                  {dict.simulation.scenarios[preset.labelKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Salary, deduction and frequency controls */}
        <div className="border-b border-white/[0.06] px-6 py-3.5 bg-white/[0.01] grid grid-cols-12 gap-4 items-center">
          <div className="col-span-6 flex items-center gap-3">
            <label htmlFor="sim-salary-input" className="text-xs font-semibold text-slate-300 shrink-0">
              {dict.simulation.controls.salary}:
            </label>
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-36">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">$</span>
                <input
                  id="sim-salary-input"
                  name="salary"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  min={0}
                  max={QUICK_SALARY_MAX_DOLLARS}
                  step={1000}
                  value={model.salaryDollars || ''}
                  onChange={(e) => model.setSalaryDollars(Number(e.target.value))}
                  className="w-full bg-[#0c121e] border border-slate-700/80 focus-visible:border-emerald-400 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white tabular-nums outline-hidden transition-colors"
                  placeholder="68500"
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {QUICK_SALARY_CHIPS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => model.setSalaryDollars(amount)}
                    className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      model.salaryDollars === amount
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                        : 'bg-[#0f1422] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                    }`}
                  >
                    {formatThousands(amount, locale)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-3 flex items-center">
            <button
              type="button"
              aria-pressed={model.hasRrspDeduction}
              onClick={() => model.setHasRrspDeduction(!model.hasRrspDeduction)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                model.hasRrspDeduction
                  ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-[#0c121e] text-slate-400 border border-white/[0.08] hover:text-slate-200'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                  model.hasRrspDeduction ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-600'
                }`}
              >
                {model.hasRrspDeduction && <CheckCircle2 className="w-3 h-3 text-white" aria-hidden="true" />}
              </span>
              <span className="truncate">{dict.simulation.controls.rrspToggle}</span>
            </button>
          </div>

          <div className="col-span-3 flex justify-end items-center gap-1 bg-[#0c121e] p-1 rounded-lg border border-white/[0.06]">
            {QUICK_FREQUENCIES.map((frequency) => (
              <button
                key={frequency}
                type="button"
                aria-pressed={model.frequency === frequency}
                onClick={() => model.setFrequency(frequency)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                  model.frequency === frequency ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {dict.payFrequency.short[frequency]}
              </button>
            ))}
          </div>
        </div>

        {/* Four key figures */}
        <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-b border-white/[0.06]">
          <div className="bg-emerald-500/[0.03] p-6 space-y-1">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              {dict.simulation.metrics.takeHome}
            </span>
            <div className="text-4xl font-black text-white tabular-nums tracking-tight">{scaled(result.takeHomePayCents)}</div>
            <span className="text-[11px] text-emerald-400/90 font-medium block pt-1">
              {dict.simulation.metrics.retention.replace('{percent}', percentText(shares.takeHome))}
            </span>
          </div>
          <div className="p-6 space-y-1 bg-white/[0.01]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{dict.simulation.metrics.totalTax}</span>
            <div className="text-3xl font-bold text-slate-200 tabular-nums">
              {scaled(result.totalTaxCents + model.payrollCents)}
            </div>
            <span className="text-[11px] text-slate-400 block pt-1">{dict.simulation.metrics.totalTaxCaption}</span>
          </div>
          <div className="p-6 space-y-1 bg-white/[0.01]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {dict.simulation.metrics.effectiveRate}
            </span>
            <div className="text-3xl font-bold text-slate-200 tabular-nums">{((result.averageTaxRate || 0) * 100).toFixed(2)}%</div>
            <span className="text-[11px] text-slate-400 block pt-1">{dict.simulation.metrics.effectiveRateCaption}</span>
          </div>
          <div className="p-6 space-y-1 bg-white/[0.01]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {dict.simulation.metrics.marginalRate}
            </span>
            <div className="text-3xl font-bold text-slate-200 tabular-nums">{((result.marginalTaxRate || 0) * 100).toFixed(2)}%</div>
            <span className="text-[11px] text-slate-400 block pt-1">{dict.simulation.metrics.marginalRateCaption}</span>
          </div>
        </div>

        {/* Earnings split */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] space-y-2.5">
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-900 border border-white/[0.08]">
            <div style={{ width: percentText(shares.takeHome) }} className="bg-emerald-500 h-full transition-[width] duration-300" />
            <div style={{ width: percentText(shares.federal) }} className="bg-blue-500 h-full transition-[width] duration-300" />
            <div style={{ width: percentText(shares.provincial) }} className="bg-yellow-500 h-full transition-[width] duration-300" />
            <div style={{ width: percentText(shares.payroll) }} className="bg-purple-500 h-full transition-[width] duration-300" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
            {(
              [
                ['bg-emerald-500', 'text-emerald-400', dict.simulation.breakdown.netPay, result.takeHomePayCents, shares.takeHome],
                ['bg-blue-500', 'text-blue-400', dict.simulation.breakdown.federal, result.federal.netFederalTaxCents, shares.federal],
                ['bg-yellow-500', 'text-yellow-400', dict.simulation.breakdown.provincial, result.provincial.netProvincialTaxCents, shares.provincial],
                ['bg-purple-500', 'text-purple-400', dict.simulation.breakdown.payroll, model.payrollCents, shares.payroll],
              ] as const
            ).map(([dot, text, label, cents, share]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} aria-hidden="true" />
                <span className="text-slate-300 font-medium">{label}:</span>
                <span className={`${text} font-bold tabular-nums`}>{scaled(cents)}</span>
                <span className="text-slate-400 text-[11px]">({percentText(share)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inspector tabs */}
        <div className="px-6 pt-5 pb-6 space-y-4">
          <div role="tablist" className="flex items-center border-b border-white/[0.06] gap-4 text-xs font-semibold">
            {(
              [
                ['spending', PieChart, dict.simulation.tabs.spending, 'border-blue-400 text-blue-400'],
                ['traces', FileCheck2, dict.simulation.tabs.traces, 'border-emerald-400 text-emerald-400'],
                ['comparison', Scale, dict.simulation.tabs.comparison, 'border-emerald-400 text-emerald-400'],
              ] as const
            ).map(([tab, Icon, label, activeClass]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab ? activeClass : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{label}</span>
                {tab === 'comparison' && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {dict.simulation.tabs.comparisonBadge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'spending' && (
            <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] p-5 space-y-4">
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="font-bold text-white text-sm">{dict.simulation.spendingSummary.title}</span>
                <span className="text-slate-400 text-[11px]">{dict.simulation.spendingSummary.subtitle}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                {allocateFederalTax(result.federal.netFederalTaxCents).map(({ category, allocatedCents }) => (
                  <div key={category.id} className="bg-[#070b12] p-3 rounded-lg border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-300 font-medium truncate">{locale === 'fr' ? category.nameFr : category.nameEn}</span>
                      <span className="text-emerald-400 font-bold tabular-nums shrink-0">{formatCents(allocatedCents, locale)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${spendingBarWidth(category)}%` }} className="bg-emerald-500 h-full rounded-full" />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {dict.simulation.spendingSummary.shareOfBudget.replace('{percent}', String(category.percentage))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-3.5 rounded-xl bg-linear-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-blue-200 block">{dict.simulation.budgetCallout.summary}</span>
                <Link
                  href={`/${locale}/simulator`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{dict.simulation.budgetCallout.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'traces' && (
            <div className="grid grid-cols-3 divide-x divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] text-xs">
              <div className="p-5 space-y-1.5">
                <span className="font-bold text-white block">{dict.simulation.traceHighlights.line42000}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{dict.simulation.traceHighlights.line42000Desc}</p>
                <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  CRA T1 Schedule 1, Part B
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <span className="font-bold text-white block">
                  {dict.simulation.traceHighlights.lineProv} ({province.code})
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{dict.simulation.traceHighlights.lineProvDesc}</p>
                <span className="inline-block text-[10px] font-mono text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/20">
                  Form {province.form}
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <span className="font-bold text-white block">{dict.simulation.traceHighlights.lineCpp2}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{dict.simulation.traceHighlights.lineCpp2Desc}</p>
                <span className="inline-block text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                  Schedule 8 / CPP2 Ceiling
                </span>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] p-5 space-y-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-white text-sm block">{dict.simulation.comparisonSummary.title}</span>
                <p className="text-slate-400 leading-relaxed">{dict.simulation.comparisonSummary.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.01]">
                <div className="p-3.5 text-red-300 space-y-1 bg-red-950/10">
                  <span className="font-bold text-red-400 block">{dict.simulation.comparisonSummary.fedErrorTitle}</span>
                  <p className="text-[11px] leading-relaxed text-slate-300">{dict.simulation.comparisonSummary.fedError}</p>
                </div>
                <div className="p-3.5 text-red-300 space-y-1 bg-red-950/10">
                  <span className="font-bold text-red-400 block">{dict.simulation.comparisonSummary.provErrorTitle}</span>
                  <p className="text-[11px] leading-relaxed text-slate-300">{dict.simulation.comparisonSummary.provError}</p>
                </div>
              </div>
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>{dict.simulation.comparisonSummary.conclusion}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with the full calculator link */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{dict.simulation.clientSideGuarantee}</span>
          </div>
          <Link
            href={`/${locale}/calculator/${province.slug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-linear-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_2px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.28)] transition-[background-color,box-shadow] cursor-pointer"
          >
            <Calculator className="w-4 h-4" aria-hidden="true" />
            <span>{dict.simulation.ctaButton}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
