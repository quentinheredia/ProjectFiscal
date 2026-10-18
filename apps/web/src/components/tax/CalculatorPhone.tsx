'use client';

import React, { useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ExplanationTraceItem } from '@fiscal-insights/tax-engine';
import { Locale, getDictionary } from '@/lib/i18n';
import { fillTemplate, formatCents, formatPercent, formatThousands } from '@/lib/format';
import { PROVINCES, provinceName } from '@/lib/provinces';
import { ALL_PAY_FREQUENCIES } from '@/features/tax/pay-frequency';
import {
  CALCULATOR_MAX_DOLLARS,
  CALCULATOR_SALARY_CHIPS,
  FHSA_ANNUAL_LIMIT_DOLLARS,
  TAX_YEARS,
  type MoneyField,
  type TaxCalculatorModel,
} from '@/features/tax/useTaxCalculator';
import { ChipRail, Chip } from '@/components/mobile/ChipRail';
import { Disclosure } from '@/components/mobile/Disclosure';
import { MetricList } from '@/components/mobile/MetricList';
import { MoneyInput } from '@/components/mobile/MoneyInput';
import { SectionHeading } from '@/components/mobile/SectionHeading';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';
import { StackedBar } from '@/components/mobile/StackedBar';
import { StickySummaryBar } from '@/components/mobile/StickySummaryBar';
import { SpendingListPhone } from '@/components/tax/SpendingListPhone';

interface CalculatorPhoneProps {
  locale: Locale;
  model: TaxCalculatorModel;
}

const COLORS = {
  takeHome: 'bg-emerald-500',
  federal: 'bg-blue-500',
  provincial: 'bg-yellow-500',
  pension: 'bg-purple-500',
  insurance: 'bg-cyan-500',
} as const;

const CARD = 'rounded-2xl border border-white/[0.08] bg-[#0c121e]';

function TraceListPhone({ traces, locale }: { traces: ExplanationTraceItem[]; locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <div className="divide-y divide-white/[0.06]">
      {traces.map((trace) => (
        <Disclosure
          key={trace.id}
          summary={
            <span className="block">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-slate-100">{locale === 'fr' ? trace.titleFr : trace.titleEn}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-white">{formatCents(trace.amountCents, locale, 2)}</span>
              </span>
              {trace.formReference && <span className="mt-0.5 block font-mono text-xs text-slate-400">{trace.formReference}</span>}
            </span>
          }
        >
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#070b12] p-3 text-sm">
            <p className="break-words font-mono text-xs leading-relaxed text-slate-300">
              {fillTemplate(dict.results.formulaLabel, { formula: trace.formula })}
            </p>
            <a
              href={trace.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-emerald-400"
            >
              {dict.results.sourceLink}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </Disclosure>
      ))}
    </div>
  );
}

/** The province calculator on phones: inputs, then the answer with a sticky repeat, then the detail. */
export default function CalculatorPhone({ locale, model }: CalculatorPhoneProps) {
  const dict = getDictionary(locale);
  const phone = dict.calculator.phone;
  const resultRef = useRef<HTMLDivElement>(null);
  const { result, shares } = model;
  const money = (annualCents: number) => formatCents(model.perPeriod(annualCents), locale, 2);
  const ofGross = (ratio: number) => fillTemplate(dict.simulation.phone.ofGross, { percent: formatPercent(ratio, locale) });
  const frequencyName = dict.payFrequency.label[model.frequency].toLowerCase();
  const yearUnavailable = TAX_YEARS.some((year) => !model.isYearAvailable(year));

  const deductionFields: { field: MoneyField; label: string; max: number }[] = [
    { field: 'selfEmployment', label: dict.calculator.selfEmploymentIncome, max: CALCULATOR_MAX_DOLLARS },
    { field: 'rrsp', label: dict.calculator.rrspDeduction, max: CALCULATOR_MAX_DOLLARS },
    { field: 'fhsa', label: `${dict.calculator.fhsaDeduction} ${dict.calculator.fhsaLimit}`, max: FHSA_ANNUAL_LIMIT_DOLLARS },
  ];

  return (
    <div className="space-y-6">
      <StickySummaryBar
        target={resultRef}
        label={phone.backToResult}
        onActivate={() => resultRef.current?.scrollIntoView({ block: 'start' })}
      >
        <span className="text-[13px] text-slate-400">
          {dict.results.heroLabel} ({frequencyName})
        </span>
        <span className="text-lg font-black tabular-nums text-emerald-400">{money(result.takeHomePayCents)}</span>
      </StickySummaryBar>

      <section className={`${CARD} space-y-5 p-4 md:p-6`} aria-label={dict.calculator.title}>
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-slate-300">{dict.calculator.province}</p>
          <SegmentedControl
            label={dict.calculator.province}
            value={model.province}
            onChange={model.selectProvince}
            options={PROVINCES.map((p) => ({
              value: p.code,
              label: p.code,
              accessibleLabel: provinceName(p, locale),
              disabled: !model.isProvinceAvailable(p.code),
            }))}
          />
        </div>

        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-slate-300">{dict.calculator.filingYear}</p>
          <SegmentedControl
            label={dict.calculator.filingYear}
            value={String(model.year)}
            onChange={(year) => model.selectYear(Number(year) as TaxCalculatorModel['year'])}
            options={TAX_YEARS.map((year) => ({ value: String(year), label: year, disabled: !model.isYearAvailable(year) }))}
          />
          {yearUnavailable && <p className="text-xs text-slate-400">{dict.calculator.yearUnavailable}</p>}
        </div>

        <MoneyInput
          label={dict.calculator.employmentIncome}
          name="employmentIncome"
          valueDollars={Number(model.fields.employment) || 0}
          onChange={(dollars) => model.setField('employment', String(dollars))}
          locale={locale}
          maxDollars={CALCULATOR_MAX_DOLLARS}
        />
        <ChipRail label={dict.simulation.phone.salaryChipsLabel}>
          {CALCULATOR_SALARY_CHIPS.map((amount) => (
            <Chip key={amount} selected={Number(model.fields.employment) === amount} onClick={() => model.setField('employment', String(amount))}>
              {formatThousands(amount, locale)}
            </Chip>
          ))}
        </ChipRail>

        <Disclosure
          className="border-t border-white/[0.06]"
          summary={<span className="text-sm font-semibold text-emerald-400">{phone.moreIncome}</span>}
        >
          <div className="space-y-4">
            {deductionFields.map(({ field, label, max }) => (
              <MoneyInput
                key={field}
                label={label}
                name={field}
                valueDollars={Number(model.fields[field]) || 0}
                onChange={(dollars) => model.setField(field, String(dollars))}
                locale={locale}
                maxDollars={max}
              />
            ))}
          </div>
        </Disclosure>
      </section>

      <section ref={resultRef} className={`${CARD} scroll-mt-28 space-y-4 bg-emerald-500/[0.03] p-4 md:p-6`} aria-label={dict.results.heroLabel}>
        <div>
          <p className="text-[13px] font-semibold text-emerald-400">
            {dict.results.heroLabel} ({frequencyName})
          </p>
          <p role="status" className="mt-1 text-[2.5rem] font-black leading-none tracking-tight tabular-nums text-white">
            {money(result.takeHomePayCents)}
          </p>
        </div>

        <SegmentedControl
          label={dict.simulation.phone.frequencyLabel}
          value={model.frequency}
          onChange={model.setFrequency}
          options={ALL_PAY_FREQUENCIES.map((frequency) => ({
            value: frequency,
            label: dict.payFrequency.short[frequency],
            accessibleLabel: dict.payFrequency.label[frequency],
          }))}
        />

        <StackedBar
          segments={(Object.keys(COLORS) as (keyof typeof COLORS)[]).map((key) => ({ key, ratio: shares[key], colorClass: COLORS[key] }))}
        />

        <MetricList
          metrics={[
            { key: 'takeHome', label: dict.results.breakdown.netPay, caption: ofGross(shares.takeHome), value: money(result.takeHomePayCents), dotClass: COLORS.takeHome, emphasis: true },
            { key: 'federal', label: dict.results.breakdown.federalTax, caption: ofGross(shares.federal), value: money(result.federal.netFederalTaxCents), dotClass: COLORS.federal },
            { key: 'provincial', label: dict.results.breakdown.provincialTax, caption: ofGross(shares.provincial), value: money(result.provincial.netProvincialTaxCents), dotClass: COLORS.provincial },
            { key: 'pension', label: dict.results.breakdown.cpp, caption: ofGross(shares.pension), value: money(result.cpp.totalCents), dotClass: COLORS.pension },
            { key: 'insurance', label: dict.results.breakdown.ei, caption: ofGross(shares.insurance), value: money(model.insuranceCents), dotClass: COLORS.insurance },
            { key: 'total', label: dict.results.totalDeductions, caption: ofGross(1 - shares.takeHome), value: money(result.totalDeductionsCents) },
          ]}
        />

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [dict.results.averageRate, result.averageTaxRate, dict.results.averageRateCaption],
              [dict.results.marginalRate, result.marginalTaxRate, dict.results.marginalRateCaption],
            ] as const
          ).map(([label, rate, caption]) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-[#070b12] p-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-white">{formatPercent(rate, locale)}</p>
              <p className="text-xs text-slate-500">{caption}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={dict.results.tracesTitle} lead={phone.tracesLead} level="h3" />
        <div className={`${CARD} px-4`}>
          <TraceListPhone traces={result.traces} locale={locale} />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={dict.spending.title} lead={dict.spending.sourceNote} level="h3" />
        <div className={`${CARD} space-y-1 p-4`}>
          <p className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] pb-3 text-sm text-slate-300">
            {dict.spending.yourContribution}
            <span className="text-lg font-black tabular-nums text-emerald-400">{formatCents(result.federal.netFederalTaxCents, locale, 2)}</span>
          </p>
          <SpendingListPhone federalTaxCents={result.federal.netFederalTaxCents} locale={locale} />
        </div>
      </section>
    </div>
  );
}
