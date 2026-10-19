'use client';

import React from 'react';
import { useProvince } from '@/context/ProvinceContext';
import { Calculator, MapPinned } from 'lucide-react';
import { ActionLink } from '@/components/ui/action';
import { SimulatorIcon } from '@/components/navigation/nav-items';

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
      <ActionLink href={`/${locale}/calculator/${selectedProvince.slug}`} icon={Calculator}>
        {buttonText}
      </ActionLink>
      <ActionLink href={`/${locale}/simulator`} variant="secondary" icon={SimulatorIcon}>
        {isFr ? 'Simulateur budgétaire' : 'Federal Budget Simulator'}
      </ActionLink>
      <ActionLink href="#provinces" variant="secondary" icon={MapPinned}>
        {exploreProvincesText}
      </ActionLink>
    </div>
  );
}

