'use client';

import React from 'react';
import Link from 'next/link';
import { useProvince } from '@/context/ProvinceContext';
import { Calculator, ArrowRight } from 'lucide-react';

interface BottomConversionCtaProps {
  locale: 'en' | 'fr';
}

export default function BottomConversionCta({ locale }: BottomConversionCtaProps) {
  const { selectedProvince } = useProvince();
  const isFr = locale === 'fr';

  const buttonText = isFr
    ? `Lancer le calculateur (${selectedProvince.nameFr})`
    : `Launch ${selectedProvince.nameEn} Calculator`;

  return (
    <Link
      href={`/${locale}/calculator/${selectedProvince.slug}`}
      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_2px_14px_rgba(16,185,129,0.2)] hover:shadow-[0_2px_18px_rgba(16,185,129,0.28)] transition-all cursor-pointer"
    >
      <Calculator className="w-4 h-4" />
      <span>{buttonText}</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

