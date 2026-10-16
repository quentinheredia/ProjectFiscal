'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateTax,
  formatCentsToDollars,
  TaxCalculationResult,
} from '@fiscal-insights/tax-engine';
import {
  getFederalRules,
  getProvincialRules,
} from '@fiscal-insights/tax-data';
import { Locale, getDictionary } from '@/lib/i18n';
import { FEDERAL_SPENDING_CATEGORIES } from '@/lib/spending';
import { HaloButton } from '@/components/ui/halo-button';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Percent,
  Layers,
  PieChart,
} from 'lucide-react';

interface CalculatorProps {
  locale: Locale;
  initialProvince?: 'ON' | 'QC' | 'BC' | 'AB';
  initialSalaryDollars?: number;
}

type PayFrequency = 'annual' | 'monthly' | 'biweekly' | 'weekly' | 'hourly';

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
  const [province, setProvince] = useState<'ON' | 'QC' | 'BC' | 'AB'>(initialProvince);
  const [employmentIncome, setEmploymentIncome] = useState<string>(initialSalaryDollars.toString());
  const [selfEmploymentIncome, setSelfEmploymentIncome] = useState<string>('0');
  const [rrspDeduction, setRrspDeduction] = useState<string>('0');
  const [fhsaDeduction, setFhsaDeduction] = useState<string>('0');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);

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
      <div className="flex items-center gap-2 text-xs font-medium text-brand-green-dark bg-brand-green-light/70 px-3.5 py-1.5 rounded-full w-fit border border-brand-green/20">
        <ShieldCheck className="w-4 h-4 text-brand-green" />
        <span>{dict.newsletter.disclaimer}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green"></span>
              {dict.calculator.title}
            </h2>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setYear(2026)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  year === 2026 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2026
              </button>
              <button
                type="button"
                onClick={() => setYear(2025)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  year === 2025 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2025
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Province selection */}
            <div>
              <label htmlFor="province-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {dict.calculator.province}
              </label>
              <select
                id="province-select"
                value={province}
                onChange={(e) => setProvince(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all cursor-pointer"
              >
                <option value="ON">Ontario (ON)</option>
                <option value="QC">Québec (QC)</option>
                <option value="BC">British Columbia (BC)</option>
                <option value="AB">Alberta (AB)</option>
              </select>
            </div>

            {/* Employment Income */}
            <div>
              <label htmlFor="employment-income-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {dict.calculator.employmentIncome} ($ CAD)
              </label>
              <div className="relative rounded-lg shadow-xs">
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
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-lg focus:outline-hidden focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all tabular-nums"
                  placeholder="80,000"
                />
              </div>
            </div>

            {/* Advanced toggle */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark inline-flex items-center gap-1 focus:outline-hidden"
              >
                {showAdvanced ? dict.calculator.advancedToggleHide : dict.calculator.advancedToggleShow}
              </button>
            </div>

            {showAdvanced && (
              <div className="pt-2 space-y-4 border-t border-slate-100">
                {/* Self-employment */}
                <div>
                  <label htmlFor="self-employment-income-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
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
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 font-medium tabular-nums"
                    />
                  </div>
                </div>

                {/* RRSP */}
                <div>
                  <label htmlFor="rrsp-deduction-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
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
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 font-medium tabular-nums"
                    />
                  </div>
                </div>

                {/* FHSA */}
                <div>
                  <label htmlFor="fhsa-deduction-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
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
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 font-medium tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-500 block mb-0.5">{dict.results.averageRate}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {(calculation.averageTaxRate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
              <span className="text-slate-500 block mb-0.5">{dict.results.marginalRate}</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {(calculation.marginalTaxRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* RESULTS HERO COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-7 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green-dark">
                  {dict.results.heroLabel} ({frequency})
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-1 tabular-nums tracking-tight">
                  {formatScaledCents(calculation.takeHomePayCents)}
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                {(['annual', 'monthly', 'biweekly', 'weekly', 'hourly'] as PayFrequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`px-2.5 py-1 rounded-md transition-all capitalize ${
                      frequency === f
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f === 'biweekly' ? '2-wk' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Stacked Proportional Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span>{dict.results.breakdown.title}</span>
                <span className="tabular-nums">Gross: {formatScaledCents(calculation.totalIncomeCents)}</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                <div style={{ width: `${Math.max(2, netShare)}%` }} className="bg-brand-green-dark transition-all duration-300" title="Take-Home Pay" />
                <div style={{ width: `${Math.max(1, fedShare)}%` }} className="bg-brand-blue transition-all duration-300" title="Federal Tax" />
                <div style={{ width: `${Math.max(1, provShare)}%` }} className="bg-sky-500 transition-all duration-300" title="Provincial Tax" />
                <div style={{ width: `${Math.max(1, cppShare)}%` }} className="bg-indigo-500 transition-all duration-300" title="CPP/QPP" />
                <div style={{ width: `${Math.max(1, eiShare)}%` }} className="bg-amber-500 transition-all duration-300" title="EI/QPIP" />
              </div>

              {/* Legend with exact numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-brand-green-dark mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.breakdown.netPay}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.takeHomePayCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-brand-blue mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.breakdown.federalTax}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.federal.netFederalTaxCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-sky-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.breakdown.provincialTax}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.provincial.netProvincialTaxCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.breakdown.cpp}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.cpp.totalCents)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.breakdown.ei}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.ei.totalCents + (calculation.qpip?.totalCents ?? 0))}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm bg-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block">{dict.results.totalDeductions}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatScaledCents(calculation.totalDeductionsCents)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AUDITED EXPLANATION TRACES (Every number shows math & CRA link) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-7 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-blue" />
                {dict.results.tracesTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {dict.results.tracesSubtitle}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {calculation.traces.map((trace) => {
                const isExpanded = expandedTraceId === trace.id;
                return (
                  <div key={trace.id} className="py-2.5">
                    <button
                      type="button"
                      onClick={() => setExpandedTraceId(isExpanded ? null : trace.id)}
                      className="w-full flex items-center justify-between text-left hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-blue transition-colors">
                            {locale === 'fr' ? trace.titleFr : trace.titleEn}
                          </span>
                          {trace.formReference && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {trace.formReference}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono block">
                          {trace.formula}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
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
                      <div className="mt-2 ml-2 pl-3 border-l-2 border-brand-blue/40 text-xs text-slate-600 space-y-1.5 bg-slate-50/80 p-2.5 rounded-r-lg">
                        <p className="font-mono text-slate-700">Formula: {trace.formula}</p>
                        <a
                          href={trace.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-blue hover:underline font-medium text-[11px]"
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
        </div>
      </div>

      {/* WHERE YOUR TAXES GO SECTION (Public Accounts of Canada Breakdown) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-blue uppercase tracking-wider mb-1">
              <PieChart className="w-4 h-4 text-brand-blue" />
              {dict.spending.badge}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {dict.spending.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {dict.spending.subtitle}
            </p>
          </div>
          <div className="text-right shrink-0 bg-brand-blue-light/50 border border-brand-blue/20 p-3 rounded-xl">
            <span className="text-xs text-slate-600 block">Your Federal Contribution</span>
            <span className="text-xl font-black text-brand-blue tabular-nums">
              {formatCentsToDollars(calculation.federal.netFederalTaxCents)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEDERAL_SPENDING_CATEGORIES.map((cat) => {
            const allocatedCents = Math.round((calculation.federal.netFederalTaxCents * cat.percentage) / 100);
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {locale === 'fr' ? cat.nameFr : cat.nameEn}
                  </span>
                  <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs tabular-nums">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatCentsToDollars(allocatedCents)}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {locale === 'fr' ? cat.descriptionFr : cat.descriptionEn}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 text-[11px] text-slate-400">
          {dict.spending.sourceNote}
        </div>
      </section>

      {/* PITCH COMPARISON TABLE (Audit Proof Point: Ontario $80,000) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-green-dark uppercase tracking-wider">
            Phase 0 Pitch Point
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {dict.pitch.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {dict.pitch.subtitle} (Ontario, $80,000 salary comparison)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3 px-4">{dict.pitch.table.line}</th>
                <th className="py-3 px-4 text-red-600 bg-red-50/50">{dict.pitch.table.oldSite}</th>
                <th className="py-3 px-4 text-brand-green-dark bg-emerald-50/50">{dict.pitch.table.newEngine}</th>
                <th className="py-3 px-4">{dict.pitch.table.difference}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Federal Tax</td>
                <td className="py-3 px-4 tabular-nums text-red-700 bg-red-50/30">$10,323</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">~$9,552</td>
                <td className="py-3 px-4 text-slate-600">Old site was ~$771 too high (used obsolete pre-2025 brackets).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Ontario Tax + OHP</td>
                <td className="py-3 px-4 tabular-nums text-red-700 bg-red-50/30">$3,985</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">~$4,940</td>
                <td className="py-3 px-4 text-slate-600">Old site was ~$955 too low (completely omitted Ontario Health Premium of $750).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">CPP + CPP2</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$4,382.10</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">$4,382.10</td>
                <td className="py-3 px-4 text-slate-600">Exact match on YMPE + enhanced CPP2 contribution ceiling.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Employment Insurance (EI)</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$1,077.48</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">$1,077.48</td>
                <td className="py-3 px-4 text-slate-600">Exact match on maximum insurable earnings limit.</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-3 px-4 text-slate-900">Take-Home Net Income</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$60,232</td>
                <td className="py-3 px-4 tabular-nums text-brand-green-dark bg-emerald-50/50">~$60,048</td>
                <td className="py-3 px-4 text-slate-700">Net looked plausible only because two large errors canceled each other out!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* NEWSLETTER CAPTURE (UI ONLY AS SPECIFIED IN PHASE 0) */}
      <section className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-brand-green-accent uppercase tracking-wider">
            {dict.newsletter.badge}
          </span>
          <h4 className="text-2xl font-bold tracking-tight">
            {dict.newsletter.title}
          </h4>
          <p className="text-sm text-slate-300">
            {dict.newsletter.description}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="max-w-xl space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder={dict.newsletter.placeholder}
              className="grow px-4 py-3 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-green-accent"
              required
            />
            <HaloButton
              type="submit"
              className="shrink-0"
              staggerLabel={false}
            >
              {dict.newsletter.button}
            </HaloButton>
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <input type="checkbox" id="consent-check" className="mt-0.5 rounded border-slate-700 bg-slate-800 text-brand-green-accent" defaultChecked />
            <label htmlFor="consent-check" className="cursor-pointer">
              {dict.newsletter.consent}
            </label>
          </div>
        </form>
      </section>

      {/* LEGAL & STATUTORY DISCLAIMER */}
      <footer className="text-center text-xs text-slate-500 py-4 max-w-4xl mx-auto">
        <p>{dict.disclaimer}</p>
      </footer>
    </div>
  );
}
