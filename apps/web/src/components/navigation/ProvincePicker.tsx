'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { PROVINCES, fitsInline, provinceName, type ProvinceConfig, type ProvinceSlug } from '@/lib/provinces';
import { Disclosure } from '@/components/mobile/Disclosure';
import { ProvinceOptionList } from '@/components/province/ProvinceOptions';

interface ProvincePickerProps {
  locale: Locale;
  current: ProvinceConfig;
  onPick: (slug: ProvinceSlug) => void;
}

/**
 * The phone menu's jurisdiction choice: thumb-sized tiles while the list is short, otherwise a
 * disclosure showing the current one that opens the full grouped list.
 */
export function ProvinceMenuChoice({ locale, current, onPick }: ProvincePickerProps) {
  if (fitsInline(PROVINCES)) return <ProvinceGrid locale={locale} current={current} onPick={onPick} />;
  return (
    <Disclosure
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3"
      summary={
        <span className="flex items-center gap-2.5 text-sm font-semibold text-emerald-300">
          <span className="font-mono text-xs font-bold text-slate-400">{current.code}</span>
          {provinceName(current, locale)}
        </span>
      }
    >
      <ProvinceOptionList locale={locale} provinces={PROVINCES} currentCode={current.code} onPick={(p) => onPick(p.slug)} />
    </Disclosure>
  );
}

/** The provinces as 2-column thumb-sized tiles, for a short list in the phone menu sheet. */
function ProvinceGrid({ locale, current, onPick }: ProvincePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PROVINCES.map((province) => {
        const selected = province.slug === current.slug;
        return (
          <button
            key={province.slug}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(province.slug)}
            className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-emerald-400 ${
              selected
                ? 'border-emerald-500/40 bg-emerald-500/10 font-semibold text-emerald-300'
                : 'border-white/[0.08] bg-white/[0.02] text-slate-200 active:bg-white/[0.06]'
            }`}
          >
            <span className="font-mono text-xs font-bold text-slate-400">{province.code}</span>
            <span className="leading-tight">{provinceName(province, locale)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Every jurisdiction as compact rows, for the desktop dropdown; long lists scroll inside it. */
export function ProvinceList({ locale, current, onPick }: ProvincePickerProps) {
  return (
    <>
      {PROVINCES.map((province) => {
        const selected = province.slug === current.slug;
        return (
          <button
            key={province.slug}
            type="button"
            aria-pressed={selected}
            onClick={() => onPick(province.slug)}
            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
              selected ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="w-6 text-[10px] font-mono font-bold px-1 py-0.5 rounded-sm bg-slate-800 text-slate-300 text-center">{province.code}</span>
              <span>{provinceName(province, locale)}</span>
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
          </button>
        );
      })}
    </>
  );
}
