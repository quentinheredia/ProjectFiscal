'use client';

import React, { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, ChevronDown, Info, Minus, Plus, RotateCcw, Users } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCurrency } from '@/lib/format';
import { ENVELOPE_STEP_BILLION, envelopesIn, type BudgetEnvelope, type EnvelopeGroup } from '@/features/budget/envelopes';
import { formatBillionDelta, formatBillions, type BudgetSummary } from '@/features/budget/summarize';
import type { BudgetModel } from '@/features/budget/useBudgetAllocations';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';

interface BudgetSimulatorPhoneProps {
  locale: Locale;
  model: BudgetModel;
}

const GROUPS: readonly EnvelopeGroup[] = ['statutory', 'discretionary'];
const SLIDER_ACCENT: Record<EnvelopeGroup, string> = { statutory: 'accent-yellow-400', discretionary: 'accent-blue-400' };

function directionClass(direction: BudgetSummary['direction']): string {
  if (direction === 'deficit') return 'border-red-500/30 bg-red-500/15 text-red-300';
  if (direction === 'surplus') return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300';
  return 'border-white/[0.08] bg-white/[0.04] text-slate-300';
}

/** The group chosen in the URL hash, so a reload or a shared link keeps it. */
function useGroupFromHash(): [EnvelopeGroup, (group: EnvelopeGroup) => void] {
  const [group, setGroup] = useState<EnvelopeGroup>('statutory');
  useEffect(() => {
    if (window.location.hash === '#discretionary') setGroup('discretionary');
  }, []);
  const choose = (next: EnvelopeGroup) => {
    setGroup(next);
    window.history.replaceState(null, '', `#${next}`);
  };
  return [group, choose];
}

function TaxpayerImpact({ summary, locale }: { summary: BudgetSummary; locale: Locale }) {
  const card = useDictionary().budgetSimulator.perTaxpayerCard;
  const impact = summary.perTaxpayerDollars;
  const caption = impact === 0 ? card.baselineText : impact < 0 ? card.surplusText : card.deficitText;
  return (
    <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-[#0c121e] p-4">
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <Users className="h-4 w-4 text-emerald-400" aria-hidden="true" />
        {card.title}
      </p>
      <p className="text-[13px] leading-relaxed text-slate-400">{card.desc}</p>
      <p className="flex items-baseline justify-between gap-3 border-t border-white/[0.06] pt-3 text-sm text-slate-300">
        {card.impactLabel}
        <span className={`text-xl font-black tabular-nums ${impact > 0 ? 'text-red-400' : impact < 0 ? 'text-emerald-400' : 'text-white'}`}>
          {impact > 0 ? '+' : ''}
          {formatCurrency(impact, locale)}
        </span>
      </p>
      <p className="text-right text-xs text-slate-400">{caption}</p>
    </div>
  );
}

function EnvelopeRow({
  envelope,
  model,
  locale,
  open,
  onToggle,
}: {
  envelope: BudgetEnvelope;
  model: BudgetModel;
  locale: Locale;
  open: boolean;
  onToggle: () => void;
}) {
  const dict = useDictionary().budgetSimulator;
  const panelId = useId();
  const current = model.allocationOf(envelope);
  const diff = current - envelope.baselineBillion;
  const name = locale === 'fr' ? envelope.nameFr : envelope.nameEn;
  const stepButton = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] text-slate-200 active:bg-white/[0.08] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-emerald-400';

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 py-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-slate-100">{name}</span>
        <span className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-bold tabular-nums text-white">{formatBillions(current, locale)}</span>
          {Math.abs(diff) > 0.05 && (
            <span className={`text-xs font-semibold tabular-nums ${diff > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatBillionDelta(diff, locale)}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div id={panelId} className="space-y-3 pb-4">
          <p className="text-[13px] leading-relaxed text-slate-400">{locale === 'fr' ? envelope.descFr : envelope.descEn}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={fillTemplate(dict.phone.decrease, { name })}
              disabled={current <= envelope.minBillion}
              onClick={() => model.nudge(envelope, -1)}
              className={stepButton}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="range"
              aria-label={fillTemplate(dict.phone.sliderLabel, { name })}
              min={envelope.minBillion}
              max={envelope.maxBillion}
              step={ENVELOPE_STEP_BILLION}
              value={current}
              onChange={(e) => model.setAllocation(envelope, Number(e.target.value))}
              className={`h-11 min-w-0 flex-1 cursor-pointer ${SLIDER_ACCENT[envelope.group]}`}
            />
            <button
              type="button"
              aria-label={fillTemplate(dict.phone.increase, { name })}
              disabled={current >= envelope.maxBillion}
              onClick={() => model.nudge(envelope, 1)}
              className={stepButton}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="flex justify-between text-xs tabular-nums text-slate-400">
            <span>{fillTemplate(dict.minLabel, { amount: formatBillions(envelope.minBillion, locale) })}</span>
            <span>{fillTemplate(dict.baselineLabel, { amount: formatBillions(envelope.baselineBillion, locale) })}</span>
            <span>{fillTemplate(dict.maxLabel, { amount: formatBillions(envelope.maxBillion, locale) })}</span>
          </p>
        </div>
      )}
    </li>
  );
}

/** The budget simulator on phones: a slim balance bar, one group at a time, one envelope open at a time. */
export default function BudgetSimulatorPhone({ locale, model }: BudgetSimulatorPhoneProps) {
  const dictionary = useDictionary();
  const dict = dictionary.budgetSimulator;
  const { summary } = model;
  const [group, setGroup] = useGroupFromHash();
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const percentOf = (g: EnvelopeGroup) => String(summary.groupPercent[g]);
  const variance = summary.direction === 'balanced' ? formatBillions(0, locale) : formatBillions(summary.varianceBillion, locale);

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-30 -mx-4 border-b border-white/[0.08] bg-[#090d16]/95 px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-label={dict.phone.openSummary}
          className="flex min-h-14 w-full items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-400"
        >
          <span>
            <span className="block text-xs text-slate-400">{dict.totalSpending}</span>
            <span className="block text-lg font-black tabular-nums text-white">{formatBillions(summary.totalBillion, locale)}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-sm font-bold tabular-nums ${directionClass(summary.direction)}`}>{variance}</span>
            <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </span>
        </button>
      </div>

      <SegmentedControl
        label={dict.phone.groupsLabel}
        value={group}
        onChange={(next) => {
          setGroup(next);
          setOpenId(null);
        }}
        options={GROUPS.map((g) => ({
          value: g,
          label: fillTemplate(g === 'statutory' ? dict.phone.statutoryTab : dict.phone.discretionaryTab, { percent: percentOf(g) }),
        }))}
      />
      <p className="text-[13px] leading-relaxed text-slate-400">{group === 'statutory' ? dict.statutorySectionDesc : dict.discretionarySectionDesc}</p>

      <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c121e] px-4">
        {envelopesIn(group).map((envelope) => (
          <EnvelopeRow
            key={envelope.id}
            envelope={envelope}
            model={model}
            locale={locale}
            open={openId === envelope.id}
            onToggle={() => setOpenId(openId === envelope.id ? null : envelope.id)}
          />
        ))}
      </ul>

      <TaxpayerImpact summary={summary} locale={locale} />

      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {dict.statutoryLockedNotice}
      </p>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={dict.phone.sheetTitle} closeLabel={dictionary.nav.close}>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.06] bg-[#070b12] p-3">
            <dt className="text-xs text-slate-400">{dict.totalSpending}</dt>
            <dd className="mt-0.5 text-xl font-black tabular-nums text-white">{formatBillions(summary.totalBillion, locale)}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#070b12] p-3">
            <dt className="text-xs text-slate-400">{dict.deficitSurplus}</dt>
            <dd className="mt-0.5 text-xl font-black tabular-nums text-white">{variance}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <div className="flex justify-between text-[13px] font-medium">
            <span className="text-yellow-400">{fillTemplate(dict.statutoryShareLabel, { percent: percentOf('statutory') })}</span>
            <span className="text-blue-400">{fillTemplate(dict.discretionaryShareLabel, { percent: percentOf('discretionary') })}</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-900" aria-hidden="true">
            <div className="h-full bg-yellow-500" style={{ width: `${summary.groupPercent.statutory}%` }} />
            <div className="h-full bg-blue-500" style={{ width: `${summary.groupPercent.discretionary}%` }} />
          </div>
          <div className="flex justify-between text-xs tabular-nums text-slate-400">
            <span>{formatBillions(summary.groupBillion.statutory, locale)}</span>
            <span>{formatBillions(summary.groupBillion.discretionary, locale)}</span>
          </div>
        </div>

        <TaxpayerImpact summary={summary} locale={locale} />

        <div className="grid gap-2">
          <button
            type="button"
            onClick={model.reset}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#151c2c] text-sm font-semibold text-slate-200 active:bg-[#1e273d]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {dict.reset}
          </button>
          <Link
            href={`/${locale}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 text-sm font-bold text-slate-950 active:bg-emerald-300"
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {dict.calculatorLink}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </BottomSheet>
    </div>
  );
}
