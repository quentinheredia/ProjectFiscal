'use client';

import React from 'react';
import { useProvince } from '@/context/ProvinceContext';
import { Calculator } from 'lucide-react';
import { ActionLink } from '@/components/ui/action';

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
    <ActionLink href={`/${locale}/calculator/${selectedProvince.slug}`} size="lg" width="phone" icon={Calculator}>
      {buttonText}
    </ActionLink>
  );
}
