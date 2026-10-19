'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator } from 'lucide-react';
import { useProvince } from '@/context/ProvinceContext';
import { Locale, getDictionary } from '@/lib/i18n';
import { fillTemplate } from '@/lib/format';
import { provinceName } from '@/lib/provinces';

/** One full-width primary action for the selected province, with the simulator as a quieter link. */
export default function HeroCtasPhone({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { selectedProvince } = useProvince();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2 pt-1">
      <Link
        href={`/${locale}/calculator/${selectedProvince.slug}`}
        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-[15px] font-bold text-slate-950 active:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        <Calculator className="h-4 w-4" aria-hidden="true" />
        {fillTemplate(dict.hero.ctaCalculateProvince, { province: provinceName(selectedProvince, locale) })}
      </Link>
      <Link
        href={`/${locale}/simulator`}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-blue-300 active:text-white focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        {dict.nav.budgetSimulator}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
