'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCents, formatPercent, formatThousands } from '@/lib/format';
import {
  QUICK_FREQUENCIES,
  QUICK_PRESETS,
  QUICK_SALARY_CHIPS,
  QUICK_SALARY_MAX_DOLLARS,
  type QuickEstimateModel,
} from '@/features/tax/useQuickEstimate';
import { ChipRail, Chip } from '@/components/mobile/ChipRail';
import { Disclosure } from '@/components/mobile/Disclosure';
import { MetricList } from '@/components/mobile/MetricList';
import { MoneyInput } from '@/components/mobile/MoneyInput';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';
import { StackedBar } from '@/components/mobile/StackedBar';
import { SpendingListPhone } from '@/components/tax/SpendingListPhone';

interface QuickEstimatePhoneProps {
  locale: Locale;
  model: QuickEstimateModel;
}

const SEGMENT_COLORS = {
  takeHome: 'bg-emerald-500',
  federal: 'bg-blue-500',
  provincial: 'bg-yellow-500',
  payroll: 'bg-purple-500',
} as const;

function RrspSwitch({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-400/70">
      <span className="text-sm text-slate-200">{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-full bg-slate-700 transition-colors peer-checked:bg-emerald-500 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 motion-reduce:after:transition-none"
      />
    </label>
  );
}

/** The home page's quick estimate on phones: inputs first, the answer straight under them, detail on demand. */
export default function QuickEstimatePhone({ locale, model }: QuickEstimatePhoneProps) {
  const dict = useDictionary();
  const phone = dict.simulation.phone;
  const { result, shares, perPeriod, province } = model;
  const money = (annualCents: number) => formatCents(perPeriod(annualCents), locale, 2);
  const ofGross = (ratio: number) => fillTemplate(phone.ofGross, { percent: formatPercent(ratio, locale) });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c121e]">
      <div className="space-y-4 p-4 md:p-6">
        <ChipRail label={phone.scenariosLabel}>
          {QUICK_PRESETS.map((preset) => (
            <Chip key={preset.id} selected={model.presetId === preset.id} onClick={() => model.selectPreset(preset)}>
              {dict.simulation.scenarios[preset.labelKey]}
            </Chip>
          ))}
        </ChipRail>

        <MoneyInput
          label={dict.simulation.controls.salary}
          name="salary"
          valueDollars={model.salaryDollars}
          onChange={model.setSalaryDollars}
          locale={locale}
          maxDollars={QUICK_SALARY_MAX_DOLLARS}
        />
        <ChipRail label={phone.salaryChipsLabel}>
          {QUICK_SALARY_CHIPS.map((amount) => (
            <Chip key={amount} selected={model.salaryDollars === amount} onClick={() => model.setSalaryDollars(amount)}>
              {formatThousands(amount, locale)}
            </Chip>
          ))}
        </ChipRail>

        <RrspSwitch checked={model.hasRrspDeduction} onChange={model.setHasRrspDeduction} label={phone.rrspSwitch} />

        <SegmentedControl
          label={phone.frequencyLabel}
          value={model.frequency}
          onChange={model.setFrequency}
          options={QUICK_FREQUENCIES.map((frequency) => ({ value: frequency, label: dict.payFrequency.label[frequency] }))}
        />
      </div>

      <div className="space-y-4 border-t border-white/[0.06] bg-emerald-500/[0.03] p-4 md:p-6" aria-live="polite">
        <div>
          <p className="text-[13px] font-semibold text-emerald-400">
            {dict.simulation.metrics.takeHome} ({dict.payFrequency.label[model.frequency].toLowerCase()})
          </p>
          <p className="mt-1 text-[2.5rem] font-black leading-none tracking-tight tabular-nums text-white">
            {money(result.takeHomePayCents)}
          </p>
          <p className="mt-2 text-[13px] text-emerald-400/90">
            {dict.simulation.metrics.retention.replace('{percent}', formatPercent(shares.takeHome, locale))}
          </p>
        </div>

        <StackedBar
          segments={(Object.keys(SEGMENT_COLORS) as (keyof typeof SEGMENT_COLORS)[]).map((key) => ({
            key,
            ratio: shares[key],
            colorClass: SEGMENT_COLORS[key],
          }))}
        />

        <MetricList
          metrics={[
            { key: 'takeHome', label: dict.simulation.breakdown.netPay, caption: ofGross(shares.takeHome), value: money(result.takeHomePayCents), dotClass: SEGMENT_COLORS.takeHome },
            { key: 'federal', label: dict.simulation.breakdown.federal, caption: ofGross(shares.federal), value: money(result.federal.netFederalTaxCents), dotClass: SEGMENT_COLORS.federal },
            { key: 'provincial', label: dict.simulation.breakdown.provincial, caption: ofGross(shares.provincial), value: money(result.provincial.netProvincialTaxCents), dotClass: SEGMENT_COLORS.provincial },
            { key: 'payroll', label: dict.simulation.breakdown.payroll, caption: ofGross(shares.payroll), value: money(model.payrollCents), dotClass: SEGMENT_COLORS.payroll },
          ]}
        />

        <div className="grid grid-cols-2 gap-2">
          {(
            [
              [phone.averageRate, result.averageTaxRate],
              [phone.marginalRate, result.marginalTaxRate],
            ] as const
          ).map(([label, rate]) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-[#070b12] p-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-white">{formatPercent(rate || 0, locale)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] px-4 md:px-6">
        <Disclosure summary={<span className="text-sm font-semibold text-white">{phone.spendingTitle}</span>}>
          <SpendingListPhone federalTaxCents={result.federal.netFederalTaxCents} locale={locale} />
        </Disclosure>

        <Disclosure summary={<span className="text-sm font-semibold text-white">{phone.tracesTitle}</span>}>
          <ul className="space-y-4 text-sm">
            {(
              [
                [dict.simulation.traceHighlights.line42000, dict.simulation.traceHighlights.line42000Desc, 'CRA T1 Schedule 1, Part B'],
                [`${dict.simulation.traceHighlights.lineProv} (${province.code})`, dict.simulation.traceHighlights.lineProvDesc, `Form ${province.form}`],
                [dict.simulation.traceHighlights.lineCpp2, dict.simulation.traceHighlights.lineCpp2Desc, 'Schedule 8 / CPP2'],
              ] as const
            ).map(([title, description, reference]) => (
              <li key={title} className="space-y-1">
                <p className="font-semibold text-slate-100">{title}</p>
                <p className="leading-relaxed text-slate-400">{description}</p>
                <p className="font-mono text-xs text-emerald-400">{reference}</p>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure
          summary={
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
              {phone.comparisonTitle}
              <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-xs font-bold text-emerald-400">
                {dict.simulation.tabs.comparisonBadge}
              </span>
            </span>
          }
        >
          <div className="space-y-3 text-sm">
            <p className="leading-relaxed text-slate-400">{dict.simulation.comparisonSummary.subtitle}</p>
            {(
              [
                [dict.simulation.comparisonSummary.fedErrorTitle, dict.simulation.comparisonSummary.fedError],
                [dict.simulation.comparisonSummary.provErrorTitle, dict.simulation.comparisonSummary.provError],
              ] as const
            ).map(([title, text]) => (
              <div key={title} className="rounded-xl border border-red-500/20 bg-red-950/15 p-3">
                <p className="font-semibold text-red-300">{title}</p>
                <p className="mt-1 leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
            <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              {dict.simulation.comparisonSummary.conclusion}
            </p>
          </div>
        </Disclosure>
      </div>

      <div className="space-y-3 border-t border-white/[0.06] p-4 md:p-6">
        <Link
          href={`/${locale}/calculator/${province.slug}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-bold text-slate-950 active:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <Calculator className="h-4 w-4" aria-hidden="true" />
          {dict.simulation.ctaButton}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
          {dict.simulation.clientSideGuarantee}
        </p>
      </div>
    </div>
  );
}
