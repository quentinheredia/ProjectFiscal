'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCents } from '@/lib/format';
import { allocateFederalTaxByShare, spendingBarWidth, type SpendingAllocation } from '@/features/tax/spending';
import { BottomSheet } from '@/components/mobile/BottomSheet';

const SUMMARY_COUNT = 5;

interface SpendingListPhoneProps {
  federalTaxCents: number;
  locale: Locale;
}

function SpendingRow({ allocation, locale }: { allocation: SpendingAllocation; locale: Locale }) {
  const { category, allocatedCents } = allocation;
  return (
    <li className="space-y-2 py-3">
      <div className="flex items-start justify-between gap-4">
        <span className="min-w-0 text-sm leading-snug text-slate-200">{locale === 'fr' ? category.nameFr : category.nameEn}</span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-bold tabular-nums text-emerald-400">{formatCents(allocatedCents, locale)}</span>
          <span className="block text-xs tabular-nums text-slate-400">{category.percentage}%</span>
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${spendingBarWidth(category)}%` }} />
      </div>
    </li>
  );
}

/** The visitor's federal tax by program: the largest five inline, every program in a sheet. */
export function SpendingListPhone({ federalTaxCents, locale }: SpendingListPhoneProps) {
  const dict = useDictionary();
  const [sheetOpen, setSheetOpen] = useState(false);
  const allocations = allocateFederalTaxByShare(federalTaxCents);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400">{dict.simulation.phone.topPrograms}</p>
      <ul className="divide-y divide-white/[0.06]">
        {allocations.slice(0, SUMMARY_COUNT).map((allocation) => (
          <SpendingRow key={allocation.category.id} allocation={allocation} locale={locale} />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        className="flex min-h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] text-sm font-semibold text-slate-200 active:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        {fillTemplate(dict.simulation.phone.seeAllPrograms, { count: String(allocations.length) })}
      </button>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={dict.simulation.phone.spendingTitle}
        closeLabel={dict.nav.close}
      >
        <ul className="divide-y divide-white/[0.06]">
          {allocations.map((allocation) => (
            <SpendingRow key={allocation.category.id} allocation={allocation} locale={locale} />
          ))}
        </ul>
        <div className="space-y-3 rounded-xl border border-blue-500/30 bg-blue-950/30 p-4">
          <p className="text-sm text-blue-100">{dict.simulation.budgetCallout.summary}</p>
          <Link
            href={`/${locale}/simulator`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white active:bg-blue-500"
          >
            {dict.nav.budgetSimulator}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </BottomSheet>
    </div>
  );
}
