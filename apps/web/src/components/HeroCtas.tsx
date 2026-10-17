'use client';

import React from 'react';
import Link from 'next/link';
import { useProvince } from '@/context/ProvinceContext';
import { Calculator } from 'lucide-react';

interface HeroCtasProps {
  locale: 'en' | 'fr';
  exploreProvincesText: string;
}

export default function HeroCtas({ locale, exploreProvincesText }: HeroCtasProps) {
  const { selectedProvince } = useProvince();
  const isFr = locale === 'fr';

  const buttonText = isFr
    ? `Calculer les impôts (${selectedProvince.nameFr})`
    : `Calculate ${selectedProvince.nameEn} Taxes`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
      {/* Primary Dynamic Province CTA */}
      <Link
        href={`/${locale}/calculator/${selectedProvince.slug}`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.28)] transition-all cursor-pointer"
      >
        <Calculator className="w-3.5 h-3.5" />
        <span>{buttonText}</span>
      </Link>

      {/* Federal Budget Simulator Link */}
      <Link
        href={`/${locale}/simulator`}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 transition-all cursor-pointer"
      >
        <span>{isFr ? '🏛️ Simulateur budgétaire' : '🏛️ Federal Budget Simulator'}</span>
      </Link>

      {/* Elevated Glass Explore Provinces CTA */}
      <a
        href="#provinces"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white transition-all shadow-sm cursor-pointer"
      >
        <span>{exploreProvincesText}</span>
      </a>
    </div>
  );
}

