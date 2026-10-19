'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { formatCurrency } from '@/lib/format';
import { PROVINCES, fitsInline, provinceName, type ProvinceConfig } from '@/lib/provinces';
import { GroupedJurisdictions } from '@/components/province/ProvinceOptions';
import { ChipRail } from '@/components/mobile/ChipRail';
import { SectionHeading } from '@/components/mobile/SectionHeading';

export interface SalaryBenchmark {
  amountDollars: number;
  href: string;
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400';

function calculatorHref(locale: Locale, province: ProvinceConfig): string {
  return `/${locale}/calculator/${province.slug}`;
}

/** A short list as 2-column tiles. */
function ProvinceTiles({ locale }: { locale: Locale }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {PROVINCES.map((province) => (
        <li key={province.slug}>
          <Link
            href={calculatorHref(locale, province)}
            className={`flex min-h-24 flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c121e] p-4 active:bg-white/[0.04] ${FOCUS}`}
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
  );
}

/** A long list as grouped rows, so all 13 jurisdictions stay compact. */
function ProvinceRows({ locale }: { locale: Locale }) {
  return (
    <GroupedJurisdictions
      provinces={PROVINCES}
      listClassName="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c121e] px-4"
      renderItem={(province) => (
        <Link href={calculatorHref(locale, province)} className={`flex min-h-12 items-center gap-3 text-sm text-slate-100 ${FOCUS}`}>
          <span className="w-7 font-mono text-xs font-bold text-slate-400">{province.code}</span>
          <span className="grow font-semibold">{provinceName(province, locale)}</span>
          <span className="font-mono text-xs text-slate-500">{province.form}</span>
          <ChevronRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
        </Link>
      )}
    />
  );
}

/** Province calculators (tiles while few, grouped rows when many), then salary benchmarks in a sideways rail. */
export default function ProvinceHubPhone({ locale, benchmarks }: { locale: Locale; benchmarks: readonly SalaryBenchmark[] }) {
  const dict = useDictionary();

  return (
    <div className="space-y-5">
      <SectionHeading title={dict.hub.title} lead={dict.hub.subtitle} />
      {fitsInline(PROVINCES) ? <ProvinceTiles locale={locale} /> : <ProvinceRows locale={locale} />}

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
