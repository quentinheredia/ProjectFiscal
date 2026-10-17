'use client';

import React, { Suspense, useState, useMemo } from 'react';
import {
  calculateTax,
  formatCentsToDollars,
  ExplanationTraceItem,
  TaxCalculationResult,
} from '@fiscal-insights/tax-engine';
import {
  getFederalRules,
  getProvincialRules,
} from '@fiscal-insights/tax-data';
import { Locale, getDictionary } from '@/lib/i18n';
import { FEDERAL_SPENDING_CATEGORIES } from '@/lib/spending';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Layers,
  PieChart,
} from 'lucide-react';
import { MinimalCard } from '@/components/ui/minimal-card';

type Province = 'ON' | 'QC' | 'BC' | 'AB';

interface CalculatorProps {
  locale: Locale;
  initialProvince?: Province;
  initialSalaryDollars?: number;
}

type PayFrequency = 'annual' | 'monthly' | 'biweekly' | 'weekly' | 'hourly';

const TAX_YEARS = [2026, 2025] as const;

const PROVINCE_OPTIONS: { value: Province; label: string }[] = [
  { value: 'ON', label: 'Ontario (ON)' },
  { value: 'QC', label: 'Québec (QC)' },
  { value: 'BC', label: 'British Columbia (BC)' },
  { value: 'AB', label: 'Alberta (AB)' },
];

// The rule data throws for combinations it does not ship yet (for example Quebec 2025).
function hasProvincialRules(province: Province, year: number): boolean {
  try {
    getProvincialRules(province, year);
    return true;
  } catch {
    return false;
  }
}

const FREQUENCY_DIVISORS: Record<PayFrequency, number> = {
  annual: 1,
  monthly: 12,
  biweekly: 26,
  weekly: 52,
  hourly: 52 * 37.5, // Standard 37.5 hour full-time work week
};

export default function Calculator({
  locale,
  initialProvince = 'ON',
  initialSalaryDollars = 80000,
}: CalculatorProps) {
  const dict = getDictionary(locale);

  const [year, setYear] = useState<number>(2026);
  const [province, setProvince] = useState<Province>(initialProvince);
  const [employmentIncome, setEmploymentIncome] = useState<string>(initialSalaryDollars.toString());
  const [selfEmploymentIncome, setSelfEmploymentIncome] = useState<string>('0');
  const [rrspDeduction, setRrspDeduction] = useState<string>('0');
  const [fhsaDeduction, setFhsaDeduction] = useState<string>('0');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<PayFrequency>('annual');

  // Calculation is 100% pure, instantaneous, client-side
  const calculation: TaxCalculationResult = useMemo(() => {
    const empCents = Math.round((parseFloat(employmentIncome) || 0) * 100);
    const selfEmpCents = Math.round((parseFloat(selfEmploymentIncome) || 0) * 100);
    const rrspCents = Math.round((parseFloat(rrspDeduction) || 0) * 100);
    const fhsaCents = Math.round((parseFloat(fhsaDeduction) || 0) * 100);

    const fed = getFederalRules(year);
    const prov = getProvincialRules(province, year);

    return calculateTax(
      {
        year,
        province,
        employmentIncomeCents: empCents,
        selfEmploymentIncomeCents: selfEmpCents,
        rrspDeductionCents: rrspCents,
        fhsaDeductionCents: fhsaCents,
      },
      fed,
      prov
    );
  }, [year, province, employmentIncome, selfEmploymentIncome, rrspDeduction, fhsaDeduction]);

  // Only combinations with published rules can be selected, so the calculation never throws.
  const selectYear = (nextYear: number) => {
    if (hasProvincialRules(province, nextYear)) setYear(nextYear);
  };
  const selectProvince = (nextProvince: Province) => {
    if (hasProvincialRules(nextProvince, year)) setProvince(nextProvince);
  };

  const divisor = FREQUENCY_DIVISORS[frequency];
  const formatScaledCents = (cents: number) => {
    return formatCentsToDollars(Math.round(cents / divisor));
  };

  // Stacked bar shares
  const totalInc = calculation.totalIncomeCents || 1;
  const netShare = (calculation.takeHomePayCents / totalInc) * 100;
  const fedShare = (calculation.federal.netFederalTaxCents / totalInc) * 100;
  const provShare = (calculation.provincial.netProvincialTaxCents / totalInc) * 100;
  const cppShare = (calculation.cpp.totalCents / totalInc) * 100;
  const eiShare = ((calculation.ei.totalCents + (calculation.qpip?.totalCents ?? 0)) / totalInc) * 100;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* Privacy guarantee pill */}
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full w-fit border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>{dict.newsletter.disclaimer}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              {dict.calculator.title}
            </h2>
            <div className="flex items-center gap-1.5 bg-[#070b12] p-1 rounded-xl border border-slate-800" role="group" aria-label={dict.calculator.filingYear}>
              {TAX_YEARS.map((taxYear) => {
                const available = hasProvincialRules(province, taxYear);
                return (
                  <button
                    key={taxYear}
                    type="button"
                    onClick={() => selectYear(taxYear)}
                    disabled={!available}
                    aria-pressed={year === taxYear}
                    title={available ? undefined : dict.calculator.yearUnavailable}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${
                      year === taxYear
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
            {/* Province selection */}
            <div>
              <label htmlFor="province-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {dict.calculator.province}
              </label>
              <select
                id="province-select"
                value={province}
                onChange={(e) => selectProvince(e.target.value as Province)}
                className="w-full px-3.5 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all motion-reduce:transition-none cursor-pointer"
              >
                {PROVINCE_OPTIONS.map(({ value, label }) => {
                  const available = hasProvincialRules(value, year);
                  return (
                    <option key={value} value={value} disabled={!available}>
                      {available ? label : `${label} — ${dict.calculator.provinceUnavailable.replace('{year}', String(year))}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Employment Income */}
            <div>
              <label htmlFor="employment-income-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {dict.calculator.employmentIncome} ($ CAD)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-medium text-sm">
                  $
                </span>
                <input
                  id="employment-income-input"
                  type="number"
                  min="0"
                  step="1000"
                  value={employmentIncome}
                  onChange={(e) => setEmploymentIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#070b12] border border-slate-700/80 rounded-xl text-white font-semibold text-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all tabular-nums"
                  placeholder="80,000"
                />
              </div>
            </div>

            {/* Advanced toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
              >
                {showAdvanced ? dict.calculator.advancedToggleHide : dict.calculator.advancedToggleShow}
              </button>
            </div>

            {showAdvanced && (
              <div className="pt-3 space-y-4 border-t border-slate-800">
                {/* Self-employment */}
                <div>
                  <label htmlFor="self-employment-income-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {dict.calculator.selfEmploymentIncome} ($ CAD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                    <input
                      id="self-employment-income-input"
                      type="number"
                      min="0"
                      step="1000"
                      value={selfEmploymentIncome}
                      onChange={(e) => setSelfEmploymentIncome(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-sm text-white font-medium tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {/* RRSP */}
                <div>
                  <label htmlFor="rrsp-deduction-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {dict.calculator.rrspDeduction} ($ CAD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                    <input
                      id="rrsp-deduction-input"
                      type="number"
                      min="0"
                      step="500"
                      value={rrspDeduction}
                      onChange={(e) => setRrspDeduction(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-sm text-white font-medium tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                {/* FHSA */}
                <div>
                  <label htmlFor="fhsa-deduction-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    {dict.calculator.fhsaDeduction} (Max $8,000/yr)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">$</span>
                    <input
                      id="fhsa-deduction-input"
                      type="number"
                      min="0"
                      max="8000"
                      step="500"
                      value={fhsaDeduction}
                      onChange={(e) => setFhsaDeduction(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#070b12] border border-slate-700/80 rounded-xl text-sm text-white font-medium tabular-nums focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#070b12] p-3 rounded-xl border border-slate-800/90 shadow-inner">
              <span className="text-slate-400 block mb-0.5">{dict.results.averageRate}</span>
              <span className="text-lg font-bold text-white tabular-nums">
                {(calculation.averageTaxRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-[#070b12] p-3 rounded-xl border border-slate-800/90 shadow-inner">
              <span className="text-slate-400 block mb-0.5">{dict.results.marginalRate}</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {(calculation.marginalTaxRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* RESULTS HERO COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Card */}
          <div className="bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-6 sm:p-7 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {dict.results.heroLabel} ({frequency})
                </span>
                <div role="status" className="text-4xl sm:text-5xl font-black text-white mt-1 tabular-nums tracking-tight">
                  {formatScaledCents(calculation.takeHomePayCents)}
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="flex items-center gap-1 bg-[#070b12] p-1 rounded-xl border border-slate-800 text-xs font-medium">
                {(['annual', 'monthly', 'biweekly', 'weekly', 'hourly'] as PayFrequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`px-3 py-1 rounded-lg transition-all capitalize ${
                      frequency === f
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'biweekly' ? '2-wk' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Stacked Proportional Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>{dict.results.breakdown.title}</span>
                <span className="tabular-nums text-slate-300">Gross: {formatScaledCents(calculation.totalIncomeCents)}</span>
              </div>
              <div className="h-4 w-full bg-[#070b12] border border-slate-800 rounded-full flex overflow-hidden shadow-inner p-0.5">
                <div style={{ width: `${Math.max(2, netShare)}%` }} className="bg-emerald-500 rounded-full transition-all duration-300 motion-reduce:transition-none shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Take-Home Pay" />
                <div style={{ width: `${Math.max(1, fedShare)}%` }} className="bg-blue-500 rounded-full transition-all duration-300 motion-reduce:transition-none" title="Federal Tax" />
                <div style={{ width: `${Math.max(1, provShare)}%` }} className="bg-cyan-500 rounded-full transition-all duration-300 motion-reduce:transition-none" title="Provincial Tax" />
                <div style={{ width: `${Math.max(1, cppShare)}%` }} className="bg-indigo-500 rounded-full transition-all duration-300 motion-reduce:transition-none" title="CPP/QPP" />
                <div style={{ width: `${Math.max(1, eiShare)}%` }} className="bg-amber-500 rounded-full transition-all duration-300 motion-reduce:transition-none" title="EI/QPIP" />
              </div>

              {/* Legend with exact numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 shadow-[0_0_6px_#10b981] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.breakdown.netPay}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.takeHomePayCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.breakdown.federalTax}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.federal.netFederalTaxCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-cyan-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.breakdown.provincialTax}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.provincial.netProvincialTaxCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.breakdown.cpp}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.cpp.totalCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.breakdown.ei}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.ei.totalCents + (calculation.qpip?.totalCents ?? 0))}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-[#070b12] p-2.5 rounded-xl border border-slate-800/80">
                  <span className="w-3 h-3 rounded-xs bg-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 block">{dict.results.totalDeductions}</span>
                    <span className="font-bold text-white tabular-nums">
                      {formatScaledCents(calculation.totalDeductionsCents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Suspense fallback={null}>
            <TraceList traces={calculation.traces} locale={locale} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <SpendingBreakdown federalTaxCents={calculation.federal.netFederalTaxCents} locale={locale} />
      </Suspense>
    </div>
  );
}

// Every result line with its formula and source; collapsed until clicked.
function TraceList({ traces, locale }: { traces: ExplanationTraceItem[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

  return (
    <div className="bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-6 sm:p-7 space-y-4">
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          {dict.results.tracesTitle}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {dict.results.tracesSubtitle}
        </p>
      </div>

      <div className="divide-y divide-slate-800/80">
        {traces.map((trace) => {
          const isExpanded = expandedTraceId === trace.id;
          return (
            <div key={trace.id} className="py-2.5">
              <button
                type="button"
                onClick={() => setExpandedTraceId(isExpanded ? null : trace.id)}
                className="w-full flex items-center justify-between text-left hover:bg-slate-800/40 px-2 py-1.5 rounded-xl transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {locale === 'fr' ? trace.titleFr : trace.titleEn}
                    </span>
                    {trace.formReference && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#070b12] text-slate-400 border border-slate-800 rounded-sm">
                        {trace.formReference}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono block">
                    {trace.formula}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-bold text-white tabular-nums">
                    {formatCentsToDollars(trace.amountCents)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-2 pl-3 border-l-2 border-emerald-500/60 text-xs text-slate-300 space-y-1.5 bg-[#070b12] p-3 rounded-r-xl border border-slate-800">
                  <p className="font-mono text-slate-300">Formula: {trace.formula}</p>
                  <a
                    href={trace.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium text-[11px]"
                  >
                    Official CRA / Provincial Schedule Source
                    <ExternalLink className="w-3 h-3" />
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
  const dict = getDictionary(locale);

  return (
    <section className="bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4 text-emerald-400" />
            {dict.spending.badge}
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {dict.spending.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {dict.spending.subtitle}
          </p>
        </div>
        <div className="text-right shrink-0 bg-[#070b12] border border-emerald-500/30 p-3.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="text-xs text-slate-400 block">Your Federal Contribution</span>
          <span className="text-xl font-black text-emerald-400 tabular-nums">
            {formatCentsToDollars(federalTaxCents)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEDERAL_SPENDING_CATEGORIES.map((cat) => {
          const allocatedCents = Math.round((federalTaxCents * cat.percentage) / 100);
          return (
            <MinimalCard
              key={cat.id}
              className="bg-[#070b12] border border-slate-800/90 hover:border-slate-700/80 p-5 rounded-2xl space-y-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {locale === 'fr' ? cat.nameFr : cat.nameEn}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md tabular-nums">
                  {cat.percentage}%
                </span>
              </div>
              <div className="text-lg font-black text-white tabular-nums">
                {formatCentsToDollars(allocatedCents)}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
              </p>
            </MinimalCard>
          );
        })}
      </div>

      <div className="pt-2 text-[11px] text-slate-400">
        {dict.spending.sourceNote}
      </div>
    </section>
  );
}
