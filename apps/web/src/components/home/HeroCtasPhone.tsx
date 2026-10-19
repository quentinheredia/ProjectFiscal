'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { ActionLink } from '@/components/ui/action';
import { SimulatorIcon } from '@/components/navigation/nav-items';
import { useProvince } from '@/context/ProvinceContext';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate } from '@/lib/format';
import { provinceName } from '@/lib/provinces';

/** One full-width primary action for the selected province, with the simulator as a secondary action. */
export default function HeroCtasPhone({ locale }: { locale: Locale }) {
  const dict = useDictionary();
  const { selectedProvince } = useProvince();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2 pt-1">
      <ActionLink href={`/${locale}/calculator/${selectedProvince.slug}`} size="lg" width="full" icon={Calculator}>
        {fillTemplate(dict.hero.ctaCalculateProvince, { province: provinceName(selectedProvince, locale) })}
      </ActionLink>
      <ActionLink href={`/${locale}/simulator`} variant="secondary" width="full" icon={SimulatorIcon}>
        {dict.nav.budgetSimulator}
      </ActionLink>
    </div>
  );
}
