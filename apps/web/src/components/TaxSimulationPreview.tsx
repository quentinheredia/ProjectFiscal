'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BrowserWindow } from '@/components/ui/mock-browser-window';
import { Locale, getDictionary } from '@/lib/i18n';
import { calculateTax, formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import { FEDERAL_SPENDING_CATEGORIES } from '@/lib/spending';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  PieChart,
  CheckCircle2,
  Scale,
  Calculator,
} from 'lucide-react';

interface TaxSimulationPreviewProps {
  locale: Locale;
}

type SimulatedProvince = 'ON' | 'QC' | 'BC' | 'AB';
type Frequency = 'annual' | 'biweekly' | 'monthly';

interface PresetScenario {
  id: string;
  labelKey: 'career' | 'benchmark' | 'quebec' | 'bc' | 'alberta';
  province: SimulatedProvince;
  provinceSlug: string;
  salary: number;
}

const PRESET_SCENARIOS: PresetScenario[] = [
  { id: 'on-95k', labelKey: 'career', province: 'ON', provinceSlug: 'ontario', salary: 95000 },
  { id: 'on-80k', labelKey: 'benchmark', province: 'ON', provinceSlug: 'ontario', salary: 80000 },
  { id: 'qc-85k', labelKey: 'quebec', province: 'QC', provinceSlug: 'quebec', salary: 85000 },
  { id: 'bc-110k', labelKey: 'bc', province: 'BC', provinceSlug: 'british-columbia', salary: 110000 },
  { id: 'ab-120k', labelKey: 'alberta', province: 'AB', provinceSlug: 'alberta', salary: 120000 },
];

export default function TaxSimulationPreview({ locale }: TaxSimulationPreviewProps) {
  const dict = getDictionary(locale);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('on-95k');
  const [salary, setSalary] = useState<number>(95000);
  const [province, setProvince] = useState<SimulatedProvince>('ON');
  const [provinceSlug, setProvinceSlug] = useState<string>('ontario');
  const [hasRrspDeduction, setHasRrspDeduction] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<Frequency>('annual');
  const [activeTab, setActiveTab] = useState<'traces' | 'spending' | 'comparison'>('traces');

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
    <section className="w-full max-w-7xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dict.simulation.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {locale === 'fr'
            ? 'Visualisez une simulation fiscale avant de lancer votre calcul'
            : 'Preview an Audited Tax Simulation in Real Time'}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.simulation.subtitle}
        </p>
      </div>

      {/* Desktop Browser Window Framing the Simulation Preview */}
      <BrowserWindow
        url={`https://fiscal-insights.ca/${locale}/calculator/${provinceSlug}`}
        variant="safari"
        theme="dark"
        headerStyle="full"
        size="auto"
        className="border-slate-800 bg-[#090d16]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] rounded-2xl overflow-hidden"
      >
        <div className="p-4 sm:p-7 space-y-6">
          {/* Top Simulation Toolbar: Preset Scenarios Selector */}
          <div className="bg-[#0c121e] rounded-xl p-3 sm:p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        : 'bg-[#070b12] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {dict.simulation.scenarios[preset.labelKey]}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dict.simulation.verifiedTag}</span>
            </div>
          </div>

          {/* Interactive Controls Bar inside the Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#070b12] p-4 rounded-xl border border-slate-800/80">
            {/* Quick Salary Picker */}
            <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-medium text-slate-400 shrink-0">
                {dict.simulation.controls.salary}:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[60000, 80000, 95000, 110000, 130000].map((amt) => {
                  const isCurrent = salary === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSalary(amt)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-slate-700 text-white font-bold'
                          : 'bg-[#0f1422] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ${(amt / 1000).toFixed(0)}k
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RRSP / FHSA Toggle */}
            <div className="md:col-span-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHasRrspDeduction(!hasRrspDeduction)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  hasRrspDeduction
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-[#0c121e] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                    hasRrspDeduction
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {hasRrspDeduction && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span>{dict.simulation.controls.rrspToggle}</span>
              </button>
            </div>

            {/* Frequency Selector */}
            <div className="md:col-span-3 flex justify-start md:justify-end items-center gap-1 bg-[#0c121e] p-1 rounded-lg border border-slate-800">
              {(['annual', 'biweekly', 'monthly'] as Frequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer capitalize ${
                    frequency === freq ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {freq === 'biweekly' ? (locale === 'fr' ? '2 sem.' : 'Bi-Wk') : freq === 'annual' ? (locale === 'fr' ? 'Annuel' : 'Annual') : (locale === 'fr' ? 'Mois' : 'Month')}
                </button>
              ))}
            </div>
          </div>

          {/* Results Overview Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Take-Home Pay Hero Metric */}
            <div className="bg-gradient-to-b from-[#0e1726] to-[#090d16] p-5 rounded-xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] space-y-1">
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
            <div className="bg-[#0c121e] p-5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.totalTax}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-200 tabular-nums">
                {scaleAmount(calculation.totalTaxCents + calculation.cpp.totalCents + calculation.ei.totalCents)}
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                {locale === 'fr' ? 'Impôt fédéral + provincial + RPC/AE' : 'Fed + Prov tax + CPP & EI'}
              </span>
            </div>

            {/* Average (Effective) Rate */}
            <div className="bg-[#0c121e] p-5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.effectiveRate}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-blue-400 tabular-nums">
                {((calculation.totalTaxCents / totalInc) * 100).toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                {locale === 'fr' ? 'Pourcentage global payé en impôt' : 'Actual percentage of income taxed'}
              </span>
            </div>

            {/* Marginal Rate */}
            <div className="bg-[#0c121e] p-5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.simulation.metrics.marginalRate}
              </span>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 tabular-nums">
                {((calculation.marginalTaxRate ?? 0) * 100).toFixed(2)}%
              </div>
              <span className="text-[11px] text-slate-400 block pt-1">
                {locale === 'fr' ? 'Taxe sur le prochain dollar gagné' : 'Tax on your next dollar earned'}
              </span>
            </div>
          </div>

          {/* Visual Breakdown Stacked Bar */}
          <div className="bg-[#0c121e] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">
                {locale === 'fr' ? 'Répartition visuelle de la rémunération' : 'Earnings Distribution Stack'}
              </span>
              <span className="text-slate-400">
                {salary.toLocaleString(locale === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency: 'CAD' })}
              </span>
            </div>

            <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex" role="progressbar">
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

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
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

          {/* Interactive Inspector Tabs (Formulas, Spending, Audit Comparison) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center border-b border-slate-800 gap-4 text-xs font-semibold">
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
                onClick={() => setActiveTab('comparison')}
                className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'comparison'
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>{dict.simulation.tabs.comparison}</span>
              </button>
            </div>

            {/* TAB CONTENT: FORMULA TRACES */}
            {activeTab === 'traces' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-1.5">
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

                <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-1.5">
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

                <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-1.5">
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

            {/* TAB CONTENT: PUBLIC SPENDING IMPACT */}
            {activeTab === 'spending' && (
              <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{dict.simulation.spendingSummary.title}</span>
                  <span className="text-slate-400 text-[11px]">{dict.simulation.spendingSummary.subtitle}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {FEDERAL_SPENDING_CATEGORIES.slice(0, 6).map((cat) => {
                    const allocatedDollars = Math.round((federalTaxDollars * cat.percentage) / 100);
                    return (
                      <div key={cat.id} className="bg-[#0c121e] p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium truncate">{locale === 'fr' ? cat.nameFr : cat.nameEn}</span>
                          <span className="text-emerald-400 font-bold tabular-nums">${allocatedDollars.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${cat.percentage * 3.5}%` }} className="bg-emerald-500 h-full rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-400 block">{cat.percentage}% of federal budget</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: COMPARISON WITH LEGACY SITE */}
            {activeTab === 'comparison' && (
              <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-white text-sm block">{dict.simulation.comparisonSummary.title}</span>
                  <p className="text-slate-400 leading-relaxed">{dict.simulation.comparisonSummary.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-lg text-red-300">
                    <span className="font-bold text-red-400 block mb-1">{locale === 'fr' ? '1. Erreur fédérale' : '1. Federal Error'}</span>
                    <p className="text-[11px] leading-relaxed">{dict.simulation.comparisonSummary.fedError}</p>
                  </div>
                  <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-lg text-red-300">
                    <span className="font-bold text-red-400 block mb-1">{locale === 'fr' ? '2. Erreur provinciale' : '2. Provincial Error'}</span>
                    <p className="text-[11px] leading-relaxed">{dict.simulation.comparisonSummary.provError}</p>
                  </div>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{dict.simulation.comparisonSummary.conclusion}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer with Direct CTA to Full Calculator */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dict.simulation.clientSideGuarantee}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/calculator/${provinceSlug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{dict.simulation.ctaButton}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </BrowserWindow>
    </section>
  );
}
