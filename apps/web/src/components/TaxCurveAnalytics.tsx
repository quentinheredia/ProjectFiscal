'use client';

import React, { useState, useMemo, useRef } from 'react';
import { calculateTax, type TaxCalculationResult } from '@fiscal-insights/tax-engine';
import {
  getFederalRules,
  getProvincialRules,
  type FederalRuleSet,
  type ProvincialRuleSet,
} from '@fiscal-insights/tax-data';
import { useProvince } from '@/context/ProvinceContext';
import { PROVINCES, fitsInline, groupByKind, provinceByCode, provinceName as nameOf } from '@/lib/provinces';
import { ProvinceField } from '@/components/province/ProvinceOptions';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCurrency, formatPercent, formatThousands } from '@/lib/format';
import { ExternalLink, Layers, TrendingUp } from 'lucide-react';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import WaterfallPhone from '@/components/home/WaterfallPhone';
import { ROW_COLORS, buildWaterfallRows, toWaterfallSlices, type TaxCurveStrings, type WaterfallRow } from '@/features/tax/waterfall';

interface TaxCurveAnalyticsProps {
  locale: Locale;
}

const TAX_YEAR = 2026;
const DEFAULT_SALARY = 100000;
const SLIDER_MIN = 10000;
const SLIDER_MAX = 250000;
const SLIDER_STEP = 1000;
const INPUT_MAX = 1000000;
// The rate chart samples the engine every $500 and measures each sample against $100 more.
const CURVE_MAX = 250000;
const CURVE_STEP = 500;
const NEXT_STEP_CENTS = 10000;
const MARKER_GAP_PERCENT = 14;
const MARKER_ROW_REM = 1.25;

interface CurveSample {
  salary: number;
  taxRate: number; // income tax on the next dollar
  payrollRate: number; // CPP/QPP, EI and QPIP on the next dollar
  averageRate: number; // all deductions / salary
}

function payrollCents(result: TaxCalculationResult): number {
  return result.cpp.totalCents + result.ei.employeeCents + (result.qpip?.totalCents ?? 0);
}

function runEngine(salaryCents: number, fed: FederalRuleSet, prov: ProvincialRuleSet): TaxCalculationResult {
  return calculateTax(
    { year: TAX_YEAR, province: prov.jurisdiction as 'ON' | 'QC' | 'BC' | 'AB', employmentIncomeCents: salaryCents },
    fed,
    prov,
    { computeMarginalRate: false, includeTraces: false }
  );
}

// What happens to the next $100: the share going to income tax and to payroll contributions.
function nextDollar(salaryCents: number, base: TaxCalculationResult, fed: FederalRuleSet, prov: ProvincialRuleSet) {
  const next = runEngine(salaryCents + NEXT_STEP_CENTS, fed, prov);
  return {
    taxRate: Math.max(0, (next.totalTaxCents - base.totalTaxCents) / NEXT_STEP_CENTS),
    payrollRate: Math.max(0, (payrollCents(next) - payrollCents(base)) / NEXT_STEP_CENTS),
    keptCents: next.takeHomePayCents - base.takeHomePayCents,
  };
}

export default function TaxCurveAnalytics({ locale }: TaxCurveAnalyticsProps) {
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();
  const [activeView, setActiveView] = useState<'waterfall' | 'rates'>('waterfall');
  const [salary, setSalary] = useState(DEFAULT_SALARY);
  const [salaryText, setSalaryText] = useState(String(DEFAULT_SALARY));
  const dict = useDictionary();
  const strings = dict.taxCurve;
  const provinceName = locale === 'fr' ? selectedProvince.nameFr : selectedProvince.nameEn;
  const isRates = activeView === 'rates';

  const rules = useMemo(
    () => ({ fed: getFederalRules(TAX_YEAR), prov: getProvincialRules(selectedProvince.code, TAX_YEAR) }),
    [selectedProvince.code]
  );

  const current = useMemo(() => {
    const salaryCents = salary * 100;
    const result = runEngine(salaryCents, rules.fed, rules.prov);
    return {
      result,
      next: nextDollar(salaryCents, result, rules.fed, rules.prov),
      averageRate: salaryCents > 0 ? result.totalDeductionsCents / salaryCents : 0,
    };
  }, [salary, rules]);

  const rows = useMemo(
    () => buildWaterfallRows(current.result, rules.fed, rules.prov, strings, provinceName),
    [current.result, rules, strings, provinceName]
  );

  // Only sampled once the rate view is opened, so the landing page does not pay for it up front.
  const curve = useMemo<CurveSample[] | null>(() => {
    if (!isRates) return null;
    const samples: CurveSample[] = [];
    for (let s = 0; s <= CURVE_MAX; s += CURVE_STEP) {
      const base = runEngine(s * 100, rules.fed, rules.prov);
      const next = nextDollar(s * 100, base, rules.fed, rules.prov);
      samples.push({
        salary: s,
        taxRate: next.taxRate,
        payrollRate: next.payrollRate,
        averageRate: s > 0 ? base.totalDeductionsCents / (s * 100) : 0,
      });
    }
    return samples;
  }, [isRates, rules]);

  const commitSalary = (value: number) => {
    const clamped = Math.min(INPUT_MAX, Math.max(0, Math.round(value)));
    setSalary(clamped);
    setSalaryText(String(clamped));
  };

  const grossCents = current.result.totalIncomeCents;
  const marginalRate = current.next.taxRate + current.next.payrollRate;
  const headerValues = { province: provinceName, year: String(TAX_YEAR) };

  return (
    <section
      id="brackets-curve"
      aria-label={isRates ? strings.ratesTitle : strings.title}
      className="max-w-2xl lg:max-w-7xl mx-auto bg-[#0c121e] rounded-2xl border border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.6)] p-4 md:p-6 lg:p-8 space-y-5 lg:space-y-6 relative overflow-hidden"
    >
      {/* Header with view toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight text-balance">
            {isRates ? strings.ratesTitle : strings.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl text-pretty">
            {fillTemplate(isRates ? strings.ratesDescription : strings.description, headerValues)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div
            role="tablist"
            aria-label={strings.viewLabel}
            className="flex w-full lg:inline-flex lg:w-auto items-center p-1 rounded-xl bg-[#070b12] border border-white/[0.08] shadow-inner"
          >
            {(
              [
                ['waterfall', strings.viewWaterfall, Layers],
                ['rates', strings.viewRates, TrendingUp],
              ] as const
            ).map(([view, label, Icon]) => {
              const active = activeView === view;
              return (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveView(view)}
                  className={`inline-flex flex-1 lg:flex-none justify-center min-h-11 lg:min-h-0 items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] lg:text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shared controls: salary and province */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="tax-curve-salary" className="text-[13px] lg:text-xs font-semibold text-slate-300">
              {strings.salaryLabel}
            </label>
            <div className="flex min-h-11 lg:min-h-0 items-center gap-1 rounded-lg bg-[#070b12] border border-white/[0.08] px-3 lg:px-2.5 py-1 focus-within:border-emerald-500/50">
              <span className="text-xs text-slate-400" aria-hidden="true">$</span>
              <input
                id="tax-curve-salary"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={salaryText}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 7);
                  setSalaryText(digits);
                  if (digits) setSalary(Math.min(INPUT_MAX, Number(digits)));
                }}
                onBlur={() => commitSalary(Number(salaryText || 0))}
                className="w-28 lg:w-24 min-h-11 lg:min-h-0 bg-transparent text-right text-base lg:text-sm font-mono font-semibold text-white tabular-nums outline-hidden"
              />
            </div>
          </div>
          <input
            type="range"
            aria-label={strings.salaryLabel}
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, salary))}
            onChange={(e) => commitSalary(Number(e.target.value))}
            className="w-full h-11 lg:h-8 accent-emerald-400 cursor-pointer"
          />
        </div>

        <PhoneOnly>
          <ProvinceField
            label={strings.provinceLabel}
            locale={locale}
            provinces={PROVINCES}
            value={selectedProvince.code}
            onChange={(code) => setSelectedProvinceSlug(provinceByCode(code).slug)}
          />
        </PhoneOnly>
        <DesktopOnly className="space-y-2">
          <label htmlFor="tax-curve-province" className="block text-xs font-semibold text-slate-300">
            {strings.provinceLabel}
          </label>
          {fitsInline(PROVINCES) ? (
            <div
              id="tax-curve-province"
              role="radiogroup"
              aria-label={strings.provinceLabel}
              className="inline-flex items-center p-1 rounded-xl bg-[#070b12] border border-white/[0.08]"
            >
              {PROVINCES.map((p) => {
                const active = p.code === selectedProvince.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={nameOf(p, locale)}
                    onClick={() => setSelectedProvinceSlug(p.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.code}
                  </button>
                );
              })}
            </div>
          ) : (
            <select
              id="tax-curve-province"
              value={selectedProvince.code}
              onChange={(e) => setSelectedProvinceSlug(provinceByCode(e.target.value as typeof selectedProvince.code).slug)}
              className="w-56 rounded-xl border border-white/[0.08] bg-[#070b12] px-3 py-2 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              {groupByKind(PROVINCES).map((group) => (
                <optgroup key={group.kind} label={dict.nav.jurisdictionGroups[group.kind]}>
                  {group.provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {nameOf(p, locale)} ({p.code})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          )}
        </DesktopOnly>
      </div>

      {isRates && curve ? (
        <RateStepChart
          samples={curve}
          salary={salary}
          onPick={commitSalary}
          fed={rules.fed}
          prov={rules.prov}
          provinceName={provinceName}
          strings={strings}
          locale={locale}
        />
      ) : (
        <>
          <PhoneOnly>
            <WaterfallPhone rows={rows} grossCents={grossCents} strings={strings} locale={locale} />
          </PhoneOnly>
          <DesktopOnly>
            <Waterfall rows={rows} grossCents={grossCents} strings={strings} locale={locale} />
          </DesktopOnly>
        </>
      )}

      {/* Summary strip, shared by both views */}
      <div
        aria-live="polite"
        className="grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06] -mx-4 md:-mx-6 lg:-mx-8 -mb-4 md:-mb-6 lg:-mb-8 mt-6 bg-white/[0.01] text-xs text-slate-400"
      >
        <div className="p-3 md:p-5 lg:p-6 space-y-1">
          <span className="block text-slate-400">{strings.takeHome}</span>
          <span className="block text-lg md:text-xl font-bold text-emerald-400 tabular-nums">
            {formatCurrency(current.result.takeHomePayCents / 100, locale)}
          </span>
          <span className="block text-xs lg:text-[11px] leading-snug text-slate-400 tabular-nums">
            {fillTemplate(strings.perMonth, { amount: formatCurrency(current.result.takeHomePayCents / 1200, locale) })}
          </span>
        </div>
        <div className="p-3 md:p-5 lg:p-6 space-y-1">
          <span className="block text-slate-400">{strings.averageRate}</span>
          <span className="block text-lg md:text-xl font-bold text-white tabular-nums">
            {formatPercent(current.averageRate, locale, 1)}
          </span>
          <span className="block text-xs lg:text-[11px] leading-snug text-slate-400">
            {fillTemplate(strings.keepAverage, { amount: formatCurrency(1 - current.averageRate, locale, 2) })}
          </span>
        </div>
        <div className="p-3 md:p-5 lg:p-6 space-y-1">
          <span className="block text-slate-400">{strings.marginalRate}</span>
          <span className="block text-lg md:text-xl font-bold text-white tabular-nums">
            {formatPercent(marginalRate, locale, 1)}
          </span>
          <span className="block text-xs lg:text-[11px] leading-snug text-slate-400">
            {fillTemplate(strings.keepNext, { amount: formatCurrency(current.next.keptCents / 100, locale) })}
          </span>
        </div>
      </div>
    </section>
  );
}

function Waterfall({
  rows,
  grossCents,
  strings,
  locale,
}: {
  rows: WaterfallRow[];
  grossCents: number;
  strings: TaxCurveStrings;
  locale: Locale;
}) {
  return (
    <ol className="space-y-2.5" aria-label={strings.title}>
      {toWaterfallSlices(rows, grossCents).map(({ row, isDeduction, sharePercent, sliceLeftPercent, sliceWidthPercent, remainingPercent }) => {
        // Deduction rows show what is left in a faint fill and the slice removed in colour.
        const muted = isDeduction && row.amountCents === 0;

        return (
          <li
            key={row.key}
            className={`grid grid-cols-[12rem_minmax(0,1fr)_8rem] items-center gap-x-4 gap-y-1.5 ${
              row.kind === 'net' ? 'pt-2.5 border-t border-white/[0.06]' : ''
            }`}
          >
            <span
              className={`flex items-center gap-1.5 min-w-0 text-xs sm:text-sm ${
                row.kind === 'net' || row.kind === 'gross' ? 'font-semibold text-white' : 'text-slate-300'
              } ${muted ? 'opacity-50' : ''}`}
            >
              <span className={`w-2 h-2 rounded-xs shrink-0 ${ROW_COLORS[row.kind]}`} aria-hidden="true" />
              <span className="truncate">{row.label}</span>
              {row.sourceUrl && (
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={fillTemplate(strings.sourceLink, { item: row.label })}
                  className="text-slate-400 hover:text-emerald-300 shrink-0"
                >
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              )}
            </span>

            <div className="relative h-7 rounded-md bg-white/[0.03] overflow-hidden" aria-hidden="true">
              {isDeduction && (
                <div
                  className="absolute inset-y-0 left-0 bg-emerald-400/[0.07] transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${remainingPercent}%` }}
                />
              )}
              <div
                className={`absolute inset-y-0 rounded-[3px] transition-[left,width] duration-300 motion-reduce:transition-none ${ROW_COLORS[row.kind]}`}
                style={{
                  left: `${sliceLeftPercent}%`,
                  width: row.amountCents > 0 ? `max(2px, ${sliceWidthPercent}%)` : '0',
                }}
              />
            </div>

            <span className={`text-right tabular-nums font-mono ${muted ? 'opacity-50' : ''}`}>
              <span className={`block text-sm ${row.kind === 'net' ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                {isDeduction ? '−' : ''}
                {formatCurrency(row.amountCents / 100, locale)}
              </span>
              <span className="block text-[10px] text-slate-400">
                {formatPercent(sharePercent / 100, locale, 1)} {strings.ofGross}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function stepBand(xs: number[], lower: number[], upper: number[], xEnd: number): string {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i < xs.length; i++) {
    const x0 = xs[i]!;
    const x1 = i + 1 < xs.length ? xs[i + 1]! : xEnd;
    top.push(`${x0},${upper[i]!}`, `${x1},${upper[i]!}`);
    bottom.push(`${x1},${lower[i]!}`, `${x0},${lower[i]!}`);
  }
  return `M${top.join('L')}L${bottom.reverse().join('L')}Z`;
}

function RateStepChart({
  samples,
  salary,
  onPick,
  fed,
  prov,
  provinceName,
  strings,
  locale,
}: {
  samples: CurveSample[];
  salary: number;
  onPick: (salary: number) => void;
  fed: FederalRuleSet;
  prov: ProvincialRuleSet;
  provinceName: string;
  strings: TaxCurveStrings;
  locale: Locale;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  const peak = Math.max(...samples.map((s) => Math.max(s.taxRate + s.payrollRate, s.averageRate)));
  const yMax = Math.max(0.5, Math.ceil(peak * 10) / 10);
  const yTicks = Array.from({ length: Math.round(yMax * 10) + 1 }, (_, i) => i / 10);

  // viewBox is 1000 x 100; strokes do not scale, labels live in HTML so they stay readable on phones.
  const toX = (s: number) => (s / CURVE_MAX) * 1000;
  const toY = (r: number) => 100 - (r / yMax) * 100;
  const xs = samples.map((s) => toX(s.salary));
  const zero = samples.map(() => toY(0));
  const payrollTop = samples.map((s) => toY(s.payrollRate));
  const totalTop = samples.map((s) => toY(s.payrollRate + s.taxRate));
  const averagePath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'}${xs[i]},${toY(s.averageRate)}`).join('');

  // Ceilings come from the rule set, so each label carries the same sourced value the engine uses.
  const quebec = prov.quebec;
  const plan = quebec ? quebec.qpp : fed.cpp;
  const markers = [
    { label: quebec ? strings.qppMax : strings.cppMax, cents: plan.maxPensionableEarningsCents.value },
    { label: quebec ? strings.qpp2Max : strings.cpp2Max, cents: plan.additionalMaxPensionableEarningsCents.value },
    { label: strings.eiMax, cents: fed.ei.maxInsurableEarningsCents.value },
    ...(quebec ? [{ label: strings.qpipMax, cents: quebec.qpip.maxInsurableEarningsCents.value }] : []),
  ]
    .filter((m) => m.cents / 100 <= CURVE_MAX)
    .sort((a, b) => a.cents - b.cents);

  // Ceilings sit close together, so each label takes the first row with room for it.
  const rowEnds: number[] = [];
  const markerRows = markers.map((m) => {
    const x = (m.cents / 100 / CURVE_MAX) * 100;
    let row = rowEnds.findIndex((end) => x - end >= MARKER_GAP_PERCENT);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = x;
    return row;
  });
  const markerRowCount = Math.max(1, rowEnds.length);

  const indexAt = (clientX: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.min(samples.length - 1, Math.floor((fraction * CURVE_MAX) / CURVE_STEP));
  };

  const hovered = hover !== null ? samples[hover]! : null;
  const selectedX = Math.min(100, (salary / CURVE_MAX) * 100);
  const xTicks = [0, 50000, 100000, 150000, 200000, 250000];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-amber-400/80" aria-hidden="true" />
          {strings.legendTax}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-xs bg-sky-400/80" aria-hidden="true" />
          {strings.legendPayroll}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-slate-100" aria-hidden="true" />
          {strings.legendAverage}
        </span>
      </div>

      <div className="relative pl-10 pb-6" style={{ paddingTop: `${markerRowCount * MARKER_ROW_REM + 0.25}rem` }}>
        <div
          ref={plotRef}
          role="img"
          aria-label={fillTemplate(strings.chartLabel, { province: provinceName })}
          className="relative h-64 sm:h-72 cursor-crosshair touch-none"
          onPointerMove={(e) => setHover(indexAt(e.clientX))}
          onPointerLeave={() => setHover(null)}
          onClick={(e) => {
            const i = indexAt(e.clientX);
            if (i !== null) onPick(Math.round(samples[i]!.salary / 1000) * 1000);
          }}
        >
          {yTicks.map((t) => (
            <span
              key={t}
              className="absolute -left-10 w-8 text-right text-[10px] font-mono text-slate-400 -translate-y-1/2 pointer-events-none"
              style={{ top: `${toY(t)}%` }}
            >
              {Math.round(t * 100)}%
            </span>
          ))}
          <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full overflow-visible">
            {yTicks.map((t) => (
              <line
                key={t}
                x1="0"
                x2="1000"
                y1={toY(t)}
                y2={toY(t)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={stepBand(xs, zero, payrollTop, 1000)} fill="rgba(56,189,248,0.55)" />
            <path d={stepBand(xs, payrollTop, totalTop, 1000)} fill="rgba(251,191,36,0.55)" />
            <path
              d={averagePath}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="2"
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
            {markers.map((m) => (
              <line
                key={m.label}
                x1={toX(m.cents / 100)}
                x2={toX(m.cents / 100)}
                y1="0"
                y2="100"
                stroke="rgba(148,163,184,0.45)"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* Ceiling labels */}
          {markers.map((m, i) => (
            <span
              key={m.label}
              className="absolute -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/[0.1] bg-[#0c121e] px-1.5 py-0.5 text-[10px] font-mono text-slate-300 pointer-events-none"
              style={{
                left: `${(m.cents / 100 / CURVE_MAX) * 100}%`,
                top: `${-(markerRowCount - markerRows[i]!) * MARKER_ROW_REM}rem`,
              }}
            >
              {fillTemplate(m.label, { amount: formatThousands(m.cents / 100, locale) })}
            </span>
          ))}

          {/* Selected salary, shared with the breakdown view */}
          <div className="absolute inset-y-0 w-px bg-emerald-400 pointer-events-none" style={{ left: `${selectedX}%` }} />

          {hovered && (
            <>
              <div
                className="absolute inset-y-0 w-px bg-white/40 pointer-events-none"
                style={{ left: `${(hovered.salary / CURVE_MAX) * 100}%` }}
              />
              <div
                className="absolute top-2 -translate-x-1/2 pointer-events-none rounded-lg border border-white/[0.1] bg-[#0b1019]/95 px-3 py-2 shadow-xl text-[11px] text-slate-300 whitespace-nowrap"
                style={{ left: `${Math.min(85, Math.max(15, (hovered.salary / CURVE_MAX) * 100))}%` }}
              >
                <span className="block font-mono text-slate-400">
                  {fillTemplate(strings.tooltipSalary, { amount: formatCurrency(hovered.salary, locale) })}
                </span>
                <span className="block text-sm font-semibold text-white">
                  {fillTemplate(strings.tooltipMarginal, {
                    rate: formatPercent(hovered.taxRate + hovered.payrollRate, locale, 1),
                  })}
                </span>
                <span className="block">
                  {fillTemplate(strings.tooltipSplit, {
                    tax: formatPercent(hovered.taxRate, locale, 1),
                    payroll: formatPercent(hovered.payrollRate, locale, 1),
                  })}
                </span>
                <span className="block text-slate-400">
                  {fillTemplate(strings.tooltipAverage, { rate: formatPercent(hovered.averageRate, locale, 1) })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* X axis labels */}
        <div className="relative h-5 mt-2">
          {xTicks.map((t) => (
            <span
              key={t}
              className={`absolute text-[10px] font-mono text-slate-400 ${
                t === 0 ? '' : t === CURVE_MAX ? '-translate-x-full' : '-translate-x-1/2'
              }`}
              style={{ left: `${(t / CURVE_MAX) * 100}%` }}
            >
              {formatThousands(t, locale)}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-slate-400">{strings.chartNote}</p>
    </div>
  );
}
