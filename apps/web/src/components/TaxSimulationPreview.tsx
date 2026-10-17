'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import { useProvince, ProvinceSlug } from '@/context/ProvinceContext';
import { calculateTax, formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import { FEDERAL_SPENDING_CATEGORIES } from '@/lib/spending';
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  PieChart,
  CheckCircle2,
  Scale,
  Calculator,
  Sliders,
} from 'lucide-react';

interface TaxSimulationPreviewProps {
  locale: Locale;
}

type SimulatedProvince = 'ON' | 'QC' | 'BC' | 'AB';
type Frequency = 'annual' | 'biweekly' | 'monthly';

interface PresetScenario {
  id: string;
  labelKey: 'median' | 'benchmark' | 'career' | 'quebec' | 'bc' | 'alberta';
  province: SimulatedProvince;
  provinceSlug: string;
  salary: number;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  { id: 'canadian-median', labelKey: 'median', province: 'ON', provinceSlug: 'ontario', salary: 68500 },
  { id: 'on-80k', labelKey: 'benchmark', province: 'ON', provinceSlug: 'ontario', salary: 80000 },
  { id: 'qc-85k', labelKey: 'quebec', province: 'QC', provinceSlug: 'quebec', salary: 85000 },
  { id: 'bc-110k', labelKey: 'bc', province: 'BC', provinceSlug: 'british-columbia', salary: 110000 },
  { id: 'ab-120k', labelKey: 'alberta', province: 'AB', provinceSlug: 'alberta', salary: 120000 },
];

export default function TaxSimulationPreview({ locale }: TaxSimulationPreviewProps) {
  const dict = getDictionary(locale);
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('canadian-median');
  const [salary, setSalary] = useState<number>(68500);
  const [province, setProvince] = useState<SimulatedProvince>(selectedProvince.code);
  const [provinceSlug, setProvinceSlug] = useState<string>(selectedProvince.slug);
  const [hasRrspDeduction, setHasRrspDeduction] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<Frequency>('annual');
  const [activeTab, setActiveTab] = useState<'spending' | 'traces' | 'comparison'>('spending');

  // Keep in lockstep with navbar jurisdiction switcher
  useEffect(() => {
    if (selectedProvince.code !== province) {
      setProvince(selectedProvince.code);
      setProvinceSlug(selectedProvince.slug);
      // Reset preset highlight if different province
      const matchingPreset = PRESET_SCENARIOS.find((p) => p.province === selectedProvince.code);
      if (matchingPreset) {
        setSelectedPresetId(matchingPreset.id);
        setSalary(matchingPreset.salary);
      }
    }
  }, [selectedProvince, province]);

  const rrspAmount = hasRrspDeduction ? 8000 : 0;

  // Execute pure integer cents tax calculation
  const calculation = useMemo(() => {
    const fed = getFederalRules(2026);
    const prov = getProvincialRules(province, 2026);

    return calculateTax(
      {
        year: 2026,
        province,
        employmentIncomeCents: salary * 100,
        rrspDeductionCents: rrspAmount * 100,
      },
      fed,
      prov,
      { computeMarginalRate: true, includeTraces: true }
    );
  }, [salary, province, rrspAmount]);

  const selectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setSalary(preset.salary);
    setProvince(preset.province);
    setProvinceSlug(preset.provinceSlug);
    setSelectedProvinceSlug(preset.provinceSlug as ProvinceSlug);
  };

  const divisor = frequency === 'annual' ? 1 : frequency === 'monthly' ? 12 : 26;
  const scaleAmount = (cents: number) => formatCentsToDollars(Math.round(cents / divisor));

  const totalInc = calculation.totalIncomeCents || 1;
  const takeHomeShare = ((calculation.takeHomePayCents / totalInc) * 100).toFixed(1);
  const fedShare = ((calculation.federal.netFederalTaxCents / totalInc) * 100).toFixed(1);
  const provShare = ((calculation.provincial.netProvincialTaxCents / totalInc) * 100).toFixed(1);
  const cppEiShare = (((calculation.cpp.totalCents + calculation.ei.totalCents) / totalInc) * 100).toFixed(1);

  const federalTaxDollars = Math.round(calculation.federal.netFederalTaxCents / 100);

  return (
    <section id="simulator" className="w-full max-w-7xl mx-auto">
      {/* Live Interactive Tax & Spending Console Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_20px_50px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden">
        <div className="flex flex-col">
          {/* TOOLBAR ROW 1: Flush Preset Scenarios Selector */}
          <div className="border-b border-white/[0.06] px-5 sm:px-6 py-3.5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
                {dict.simulation.selectScenario}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PRESET_SCENARIOS.map((preset) => {
                const isActive = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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

          {/* TOOLBAR ROW 2: Flush Interactive Controls (Salary, Deductions, Frequency) */}
          <div className="border-b border-white/[0.06] px-5 sm:px-6 py-3.5 bg-white/[0.01] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Direct Editable Salary Input + Quick Presets */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="sim-salary-input" className="text-xs font-semibold text-slate-300 shrink-0">
                {dict.simulation.controls.salary}:
              </label>
              <div className="flex items-center gap-2 flex-1">
                <div className="relative w-32 sm:w-36">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">
                    $
                  </span>
                  <input
                    id="sim-salary-input"
                    type="number"
                    min={0}
                    max={2000000}
                    step={1000}
                    value={salary || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSalary(Math.max(0, val));
                      setSelectedPresetId('custom');
                    }}
                    className="w-full bg-[#0c121e] border border-slate-700/80 focus:border-emerald-400 rounded-lg pl-6 pr-2 py-1.5 text-xs font-bold text-white tabular-nums outline-hidden transition-colors"
                    placeholder="68500"
                  />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {[50000, 68500, 80000, 100000, 130000].map((amt) => {
                    const isCurrent = salary === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSalary(amt);
                          setSelectedPresetId(amt === 68500 ? 'canadian-median' : amt === 80000 ? 'on-80k' : 'custom');
                        }}
                        className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                            : 'bg-[#0f1422] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                        }`}
                      >
                        ${amt === 68500 ? '68.5k' : `${(amt / 1000).toFixed(0)}k`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RRSP / FHSA Toggle */}
            <div className="lg:col-span-3 flex items-center">
              <button
                type="button"
                onClick={() => setHasRrspDeduction(!hasRrspDeduction)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  hasRrspDeduction
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-[#0c121e] text-slate-400 border border-white/[0.08] hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                    hasRrspDeduction
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {hasRrspDeduction && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="truncate">{dict.simulation.controls.rrspToggle}</span>
              </button>
            </div>

            {/* Frequency Selector */}
            <div className="lg:col-span-3 flex justify-start lg:justify-end items-center gap-1 bg-[#0c121e] p-1 rounded-lg border border-white/[0.06]">
              {(['annual', 'biweekly', 'monthly'] as Frequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer capitalize flex-1 lg:flex-none text-center ${
                    frequency === freq ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {freq === 'biweekly' ? (locale === 'fr' ? '2 sem.' : 'Bi-Wk') : freq === 'annual' ? (locale === 'fr' ? 'Annuel' : 'Annual') : (locale === 'fr' ? 'Mois' : 'Month')}
                </button>
              ))}
            </div>
          </div>

          {/* ROW 3: 4 Flush KPI Metrics Grid (Separated by Hairlines, Zero Box Nesting) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] border-b border-white/[0.06]">
            {/* Take-Home Pay Hero Metric */}
            <div className="bg-emerald-500/[0.03] p-5 sm:p-6 space-y-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                {dict.simulation.metrics.takeHome}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">
                {scaleAmount(calculation.takeHomePayCents)}
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium block pt-1">
                {dict.simulation.metrics.retention.replace('{percent}', `${takeHomeShare}%`)}
              </span>
            </div>

            {/* Total Tax & Deductions */}
            <div className="p-5 sm:p-6 space-y-1 bg-white/[0.01]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.totalTax}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-200 tabular-nums">
                {scaleAmount(calculation.totalTaxCents + calculation.cpp.totalCents + calculation.ei.totalCents)}
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                Federal + Provincial + CPP/EI
              </span>
            </div>

            {/* Effective Tax Rate */}
            <div className="p-5 sm:p-6 space-y-1 bg-white/[0.01]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.effectiveRate}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-200 tabular-nums">
                {((calculation.averageTaxRate || 0) * 100).toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                Total tax as % of gross salary
              </span>
            </div>

            {/* Marginal Tax Rate */}
            <div className="p-5 sm:p-6 space-y-1 bg-white/[0.01]">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.marginalRate}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-200 tabular-nums">
                {((calculation.marginalTaxRate || 0) * 100).toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                Tax bracket on next $1 earned
              </span>
            </div>
          </div>

          {/* ROW 4: Earnings Distribution Stack Bar (Flush to Canvas) */}
          <div className="px-5 sm:px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] space-y-2.5">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-900 border border-white/[0.08]">
              <div
                style={{ width: `${takeHomeShare}%` }}
                className="bg-emerald-500 h-full transition-all duration-300"
                title={`${dict.simulation.breakdown.netPay}: ${takeHomeShare}%`}
              />
              <div
                style={{ width: `${fedShare}%` }}
                className="bg-blue-500 h-full transition-all duration-300"
                title={`${dict.simulation.breakdown.federal}: ${fedShare}%`}
              />
              <div
                style={{ width: `${provShare}%` }}
                className="bg-yellow-500 h-full transition-all duration-300"
                title={`${dict.simulation.breakdown.provincial}: ${provShare}%`}
              />
              <div
                style={{ width: `${cppEiShare}%` }}
                className="bg-purple-500 h-full transition-all duration-300"
                title={`${dict.simulation.breakdown.payroll}: ${cppEiShare}%`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">{dict.simulation.breakdown.netPay}:</span>
                <span className="text-emerald-400 font-bold tabular-nums">{scaleAmount(calculation.takeHomePayCents)}</span>
                <span className="text-slate-400 text-[11px]">({takeHomeShare}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-300 font-medium">{dict.simulation.breakdown.federal}:</span>
                <span className="text-blue-400 font-bold tabular-nums">{scaleAmount(calculation.federal.netFederalTaxCents)}</span>
                <span className="text-slate-400 text-[11px]">({fedShare}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span className="text-slate-300 font-medium">{dict.simulation.breakdown.provincial}:</span>
                <span className="text-yellow-400 font-bold tabular-nums">{scaleAmount(calculation.provincial.netProvincialTaxCents)}</span>
                <span className="text-slate-400 text-[11px]">({provShare}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-300 font-medium">{dict.simulation.breakdown.payroll}:</span>
                <span className="text-purple-400 font-bold tabular-nums">{scaleAmount(calculation.cpp.totalCents + calculation.ei.totalCents)}</span>
                <span className="text-slate-400 text-[11px]">({cppEiShare}%)</span>
              </div>
            </div>
          </div>

          {/* ROW 5: Interactive Inspector Tabs (Formulas, Spending, Audit Comparison) */}
          <div className="px-5 sm:px-6 pt-5 pb-6 space-y-4">
            <div className="flex items-center border-b border-white/[0.06] gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('spending')}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'spending'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>{dict.simulation.tabs.spending}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('traces')}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'traces'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{dict.simulation.tabs.traces}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comparison')}
                className={`pb-2.5 flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'comparison'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>{dict.simulation.tabs.comparison}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {dict.simulation.tabs.comparisonBadge}
                </span>
              </button>
            </div>

            {/* TAB CONTENT: PUBLIC SPENDING IMPACT (DEFAULT FIRST) */}
            {activeTab === 'spending' && (
              <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-white text-sm">{dict.simulation.spendingSummary.title}</span>
                  <span className="text-slate-400 text-[11px]">{dict.simulation.spendingSummary.subtitle}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                  {FEDERAL_SPENDING_CATEGORIES.map((cat) => {
                    const allocatedDollars = Math.round((federalTaxDollars * cat.percentage) / 100);
                    return (
                      <div key={cat.id} className="bg-[#070b12] p-3 rounded-lg border border-white/[0.06] space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-300 font-medium truncate">{locale === 'fr' ? cat.nameFr : cat.nameEn}</span>
                          <span className="text-emerald-400 font-bold tabular-nums shrink-0">${allocatedDollars.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${Math.min(100, cat.percentage * 4)}%` }} className="bg-emerald-500 h-full rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-400 block">{cat.percentage}% of federal budget</span>
                      </div>
                    );
                  })}
                </div>

                {/* Federal Budget Simulator Callout Banner */}
                <div className="mt-2 p-3.5 rounded-xl bg-linear-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-blue-200 block">
                      {dict.simulation.budgetCallout.summary}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/simulator`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{dict.simulation.budgetCallout.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FORMULA TRACES */}
            {activeTab === 'traces' && (
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] text-xs">
                <div className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-bold text-white block">
                    {dict.simulation.traceHighlights.line42000}
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {dict.simulation.traceHighlights.line42000Desc}
                  </p>
                  <span className="inline-block text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                    CRA T1 Schedule 1, Part B
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-bold text-white block">
                    {dict.simulation.traceHighlights.lineProv} ({province})
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {dict.simulation.traceHighlights.lineProvDesc}
                  </p>
                  <span className="inline-block text-[10px] font-mono text-yellow-400 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/20">
                    Form {province === 'ON' ? 'ON428' : province === 'QC' ? 'TP-1' : province === 'BC' ? 'BC428' : 'AB428'}
                  </span>
                </div>

                <div className="p-4 sm:p-5 space-y-1.5">
                  <span className="font-bold text-white block">
                    {dict.simulation.traceHighlights.lineCpp2}
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {dict.simulation.traceHighlights.lineCpp2Desc}
                  </p>
                  <span className="inline-block text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/20">
                    Schedule 8 / CPP2 Ceiling
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: COMPARISON WITH LEGACY SITE */}
            {activeTab === 'comparison' && (
              <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01] p-4 sm:p-5 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm block">{dict.simulation.comparisonSummary.title}</span>
                  <p className="text-slate-400 leading-relaxed">{dict.simulation.comparisonSummary.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden bg-white/[0.01]">
                  <div className="p-3.5 text-red-300 space-y-1 bg-red-950/10">
                    <span className="font-bold text-red-400 block">{locale === 'fr' ? '1. Erreur fédérale' : '1. Federal Error'}</span>
                    <p className="text-[11px] leading-relaxed text-slate-300">{dict.simulation.comparisonSummary.fedError}</p>
                  </div>
                  <div className="p-3.5 text-red-300 space-y-1 bg-red-950/10">
                    <span className="font-bold text-red-400 block">{locale === 'fr' ? '2. Erreur provinciale' : '2. Provincial Error'}</span>
                    <p className="text-[11px] leading-relaxed text-slate-300">{dict.simulation.comparisonSummary.provError}</p>
                  </div>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{dict.simulation.comparisonSummary.conclusion}</span>
                </div>
              </div>
            )}
          </div>

          {/* ROW 6: Bottom Action Footer with Direct CTA to Full Calculator */}
          <div className="px-5 sm:px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dict.simulation.clientSideGuarantee}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/calculator/${provinceSlug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-linear-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_2px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.28)] transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{dict.simulation.ctaButton}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
