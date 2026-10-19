'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCentsToDollars, type ExplanationTraceItem } from '@fiscal-insights/tax-engine';
import { ChevronDown, ChevronUp, ExternalLink, Layers, PieChart, Sliders, ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatThousands } from '@/lib/format';
import { PROVINCES } from '@/lib/provinces';
import { ALL_PAY_FREQUENCIES } from '@/features/tax/pay-frequency';
import { allocateFederalTax, spendingBarWidth } from '@/features/tax/spending';
import {
  CALCULATOR_SALARY_CHIPS,
  FHSA_ANNUAL_LIMIT_DOLLARS,
  TAX_YEARS,
  type MoneyField,
  type TaxCalculatorModel,
} from '@/features/tax/useTaxCalculator';

interface CalculatorDesktopProps {
  locale: Locale;
  model: TaxCalculatorModel;
}

const percentOf = (ratio: number) => (ratio * 100).toFixed(1);

export default function CalculatorDesktop({ locale, model }: CalculatorDesktopProps) {
  const dict = useDictionary();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { result, shares } = model;
  const scaled = (cents: number) => formatCentsToDollars(model.perPeriod(cents));
  const ofGross = (ratio: number) => fillTemplate(dict.results.ofGross, { percent: percentOf(ratio) });

  const advancedFields: { field: MoneyField; id: string; label: string; step: number; max?: number }[] = [
    { field: 'selfEmployment', id: 'self-employment-income-input', label: `${dict.calculator.selfEmploymentIncome} ${dict.calculator.currencySuffix}`, step: 1000 },
    { field: 'rrsp', id: 'rrsp-deduction-input', label: `${dict.calculator.rrspDeduction} ${dict.calculator.currencySuffix}`, step: 500 },
    {
      field: 'fhsa',
      id: 'fhsa-deduction-input',
      label: `${dict.calculator.fhsaDeduction} ${dict.calculator.fhsaLimit}`,
      step: 500,
      max: FHSA_ANNUAL_LIMIT_DOLLARS,
    },
  ];

  const breakdown = [
    { key: 'net', dot: 'bg-emerald-500 shadow-[0_0_6px_#10b981]', label: dict.results.breakdown.netPay, cents: result.takeHomePayCents, caption: ofGross(shares.takeHome), highlight: true },
    { key: 'federal', dot: 'bg-blue-500', label: dict.results.breakdown.federalTax, cents: result.federal.netFederalTaxCents, caption: ofGross(shares.federal) },
    { key: 'provincial', dot: 'bg-yellow-500', label: dict.results.breakdown.provincialTax, cents: result.provincial.netProvincialTaxCents, caption: ofGross(shares.provincial) },
    { key: 'cpp', dot: 'bg-purple-500', label: dict.results.breakdown.cpp, cents: result.cpp.totalCents, caption: ofGross(shares.pension) },
    { key: 'ei', dot: 'bg-cyan-500', label: dict.results.breakdown.ei, cents: model.insuranceCents, caption: ofGross(shares.insurance) },
    {
      key: 'total',
      dot: 'bg-slate-500',
      label: dict.results.totalDeductions,
      cents: result.totalDeductionsCents,
      caption: fillTemplate(dict.results.totalTaxShare, { percent: percentOf(1 - shares.takeHome) }),
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Inputs, sticky beside the results */}
        <div className="col-span-5 sticky top-24 self-start rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
                {dict.calculator.title}
              </h2>
              <div
                className="flex items-center gap-1 bg-[#070b12] p-1 rounded-xl border border-white/[0.08]"
                role="group"
                aria-label={dict.calculator.filingYear}
              >
                {TAX_YEARS.map((taxYear) => {
                  const available = model.isYearAvailable(taxYear);
                  return (
                    <button
                      key={taxYear}
                      type="button"
                      onClick={() => model.selectYear(taxYear)}
                      disabled={!available}
                      aria-pressed={model.year === taxYear}
                      title={available ? undefined : dict.calculator.yearUnavailable}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${
                        model.year === taxYear
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {taxYear}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="province-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {dict.calculator.province}
                </label>
                <select
                  id="province-select"
                  value={model.province}
                  onChange={(e) => model.selectProvince(e.target.value as TaxCalculatorModel['province'])}
                  className="w-full px-3.5 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-white font-medium text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500 transition-colors cursor-pointer"
                >
                  {PROVINCES.map((p) => {
                    const available = model.isProvinceAvailable(p.code);
                    const label = `${p.nameEn} (${p.code})`;
                    return (
                      <option key={p.code} value={p.code} disabled={!available}>
                        {available ? label : `${label}: ${dict.calculator.provinceUnavailable.replace('{year}', String(model.year))}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="employment-income-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {dict.calculator.employmentIncome} {dict.calculator.currencySuffix}
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-medium text-sm" aria-hidden="true">
                    $
                  </span>
                  <input
                    id="employment-income-input"
                    name="employmentIncome"
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    min="0"
                    step="1000"
                    value={model.fields.employment}
                    onChange={(e) => model.setField('employment', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-white font-semibold text-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500 transition-colors tabular-nums"
                    placeholder="80,000"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {CALCULATOR_SALARY_CHIPS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => model.setField('employment', String(amount))}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      Number(model.fields.employment) === amount
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                        : 'bg-[#0f1422] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                    }`}
                  >
                    {formatThousands(amount, locale)}
                  </button>
                ))}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  aria-expanded={showAdvanced}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {showAdvanced ? dict.calculator.advancedToggleHide : dict.calculator.advancedToggleShow}
                </button>
              </div>

              {showAdvanced && (
                <div className="pt-3 space-y-3.5 border-t border-white/[0.06]">
                  {advancedFields.map(({ field, id, label, step, max }) => (
                    <div key={field}>
                      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        {label}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm" aria-hidden="true">
                          $
                        </span>
                        <input
                          id={id}
                          name={field}
                          type="number"
                          inputMode="decimal"
                          autoComplete="off"
                          min="0"
                          max={max}
                          step={step}
                          value={model.fields[field]}
                          onChange={(e) => model.setField(field, e.target.value)}
                          className="w-full pl-7 pr-3 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-xs text-white font-medium tabular-nums focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-t border-white/[0.06] bg-white/[0.01]">
            <div className="p-5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{dict.results.averageRate}</span>
              <div className="text-2xl font-black text-white tabular-nums tracking-tight">{(result.averageTaxRate * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-400 block">{dict.results.averageRateCaption}</span>
            </div>
            <div className="p-5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{dict.results.marginalRate}</span>
              <div className="text-2xl font-black text-emerald-400 tabular-nums tracking-tight">{(result.marginalTaxRate * 100).toFixed(1)}%</div>
              <span className="text-[10px] text-slate-400 block">{dict.results.marginalRateCaption}</span>
            </div>
          </div>
        </div>

        {/* Take-home summary and traces */}
        <div className="col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {dict.results.heroLabel} ({dict.payFrequency.label[model.frequency].toLowerCase()})
                  </span>
                  <div role="status" className="text-5xl font-black text-white mt-1 tabular-nums tracking-tight">
                    {scaled(result.takeHomePayCents)}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#070b12] p-1 rounded-xl border border-white/[0.08] text-xs font-medium">
                  {ALL_PAY_FREQUENCIES.map((frequency) => (
                    <button
                      key={frequency}
                      type="button"
                      aria-pressed={model.frequency === frequency}
                      onClick={() => model.setFrequency(frequency)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        model.frequency === frequency
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {dict.payFrequency.label[frequency]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>{dict.results.breakdown.title}</span>
                  <span className="tabular-nums text-slate-300">
                    {fillTemplate(dict.results.grossLabel, { amount: scaled(result.totalIncomeCents) })}
                  </span>
                </div>
                <div className="h-3.5 w-full bg-[#070b12] border border-white/[0.08] rounded-full flex overflow-hidden p-0.5" aria-hidden="true">
                  <div style={{ width: `${Math.max(2, shares.takeHome * 100)}%` }} className="bg-emerald-500 rounded-full transition-[width] duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div style={{ width: `${Math.max(1, shares.federal * 100)}%` }} className="bg-blue-500 rounded-full transition-[width] duration-300" />
                  <div style={{ width: `${Math.max(1, shares.provincial * 100)}%` }} className="bg-yellow-500 rounded-full transition-[width] duration-300" />
                  <div style={{ width: `${Math.max(1, shares.pension * 100)}%` }} className="bg-purple-500 rounded-full transition-[width] duration-300" />
                  <div style={{ width: `${Math.max(1, shares.insurance * 100)}%` }} className="bg-cyan-500 rounded-full transition-[width] duration-300" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-y divide-white/[0.06] border-t border-white/[0.06] bg-white/[0.01] text-xs">
              {breakdown.map((item) => (
                <div key={item.key} className={`p-5 space-y-1 ${item.highlight ? 'bg-emerald-500/[0.02]' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} aria-hidden="true" />
                    <span className="text-slate-400 font-medium">{item.label}</span>
                  </div>
                  <div className="font-bold text-white text-base tabular-nums pt-0.5">{scaled(item.cents)}</div>
                  <span className={`text-[10px] block ${item.highlight ? 'text-emerald-400' : 'text-slate-400'}`}>{item.caption}</span>
                </div>
              ))}
            </div>
          </div>

          <TraceList traces={result.traces} locale={locale} />
        </div>
      </div>

      <SpendingBreakdown federalTaxCents={result.federal.netFederalTaxCents} locale={locale} />
    </div>
  );
}

// Every result line with its formula and source; collapsed until clicked.
function TraceList({ traces, locale }: { traces: ExplanationTraceItem[]; locale: Locale }) {
  const dict = useDictionary();
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/[0.06] pb-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          {dict.results.tracesTitle}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{dict.results.tracesSubtitle}</p>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {traces.map((trace) => {
          const isExpanded = expandedTraceId === trace.id;
          return (
            <div key={trace.id} className="py-2.5">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedTraceId(isExpanded ? null : trace.id)}
                className="w-full flex items-center justify-between text-left hover:bg-white/[0.02] px-2 py-1.5 rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {locale === 'fr' ? trace.titleFr : trace.titleEn}
                  </span>
                  {trace.formReference && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-400 border border-slate-700">
                      {trace.formReference}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs text-white tabular-nums">{formatCentsToDollars(trace.amountCents)}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-2 pl-3 border-l-2 border-emerald-500/60 text-xs text-slate-300 space-y-1.5 bg-[#070b12] p-3 rounded-r-xl border border-white/[0.06]">
                  <p className="font-mono text-slate-300">{fillTemplate(dict.results.formulaLabel, { formula: trace.formula })}</p>
                  <a
                    href={trace.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium text-[11px]"
                  >
                    {dict.results.sourceLink}
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The user's federal tax split across spending categories.
function SpendingBreakdown({ federalTaxCents, locale }: { federalTaxCents: number; locale: Locale }) {
  const dict = useDictionary();

  return (
    <section className="space-y-6 pt-4">
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            {dict.spending.badge}
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{dict.spending.title}</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{dict.spending.subtitle}</p>
        </div>
        <div className="text-right shrink-0 bg-[#0c121e] border border-emerald-500/30 p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="text-xs text-slate-400 block">{dict.spending.yourContribution}</span>
          <span className="text-xl font-black text-emerald-400 tabular-nums">{formatCentsToDollars(federalTaxCents)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3.5 text-xs">
        {allocateFederalTax(federalTaxCents).map(({ category, allocatedCents }) => (
          <div key={category.id} className="bg-[#0c121e]/70 border border-white/[0.08] p-4 rounded-xl space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-200 truncate">{locale === 'fr' ? category.nameFr : category.nameEn}</span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-sm tabular-nums shrink-0">
                {category.percentage}%
              </span>
            </div>
            <div className="text-base font-black text-white tabular-nums">{formatCentsToDollars(allocatedCents)}</div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden" aria-hidden="true">
              <div style={{ width: `${spendingBarWidth(category)}%` }} className="bg-emerald-500 h-full rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{locale === 'fr' ? category.descriptionFr : category.descriptionEn}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-linear-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/30 flex items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-semibold text-blue-200 block">{dict.simulation.budgetCallout.summary}</span>
          <span className="text-[11px] text-slate-400">{dict.spending.sourceNote}</span>
        </div>
        <Link
          href={`/${locale}/simulator`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{dict.simulation.budgetCallout.cta}</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
