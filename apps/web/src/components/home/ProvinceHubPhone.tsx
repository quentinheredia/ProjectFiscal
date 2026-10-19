'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { formatCurrency } from '@/lib/format';
import { PROVINCES, provinceName } from '@/lib/provinces';
import { ChipRail } from '@/components/mobile/ChipRail';
import { SectionHeading } from '@/components/mobile/SectionHeading';

export interface SalaryBenchmark {
  amountDollars: number;
  href: string;
}

/** Province calculators as four tappable tiles, then salary benchmarks in a sideways rail. */
export default function ProvinceHubPhone({ locale, benchmarks }: { locale: Locale; benchmarks: readonly SalaryBenchmark[] }) {
  const dict = useDictionary();

  return (
    <div className="space-y-5">
      <SectionHeading title={dict.hub.title} lead={dict.hub.subtitle} />
      <ul className="grid grid-cols-2 gap-3">
        {PROVINCES.map((province) => (
          <li key={province.slug}>
            <Link
              href={`/${locale}/calculator/${province.slug}`}
              className="flex min-h-28 flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c121e] p-4 active:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <span className="flex items-center justify-between">
                <span className="rounded-md border border-white/[0.08] bg-[#070b12] px-2 py-1 text-xs font-bold text-white">{province.code}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-base font-bold leading-tight text-white">{provinceName(province, locale)}</span>
                <span className="block font-mono text-xs text-slate-400">{province.form}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold text-slate-300">{dict.hub.salaryPresetsTitle}</p>
        <ChipRail label={dict.hub.salaryPresetsTitle}>
          {benchmarks.map(({ amountDollars, href }) => (
            <Link
              key={amountDollars}
              href={href}
              className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-[13px] font-medium tabular-nums text-slate-200 active:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-emerald-400"
            >
              {formatCurrency(amountDollars, locale)}
            </Link>
          ))}
        </ChipRail>
      </div>
    </div>
  );
}
