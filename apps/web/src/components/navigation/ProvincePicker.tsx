'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { PROVINCES, provinceName, type ProvinceConfig, type ProvinceSlug } from '@/lib/provinces';

interface ProvincePickerProps {
  locale: Locale;
  current: ProvinceConfig;
  onPick: (slug: ProvinceSlug) => void;
}

/** The four provinces as 2 x 2 thumb-sized tiles, for the phone menu sheet. */
export function ProvinceGrid({ locale, current, onPick }: ProvincePickerProps) {
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

/** The four provinces as compact rows, for the desktop dropdown. */
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
