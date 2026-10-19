'use client';

import React from 'react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { useBudgetAllocations } from '@/features/budget/useBudgetAllocations';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import BudgetSimulatorPhone from '@/components/budget/BudgetSimulatorPhone';
import BudgetSimulatorDesktop from '@/components/budget/BudgetSimulatorDesktop';

/** The federal budget simulator. One state, two presentations. */
export default function FederalBudgetSimulator({ locale }: { locale: Locale }) {
  const dict = useDictionary().budgetSimulator;
  const model = useBudgetAllocations();

  return (
    <div className="space-y-5 lg:space-y-8">
      <div className="max-w-4xl space-y-3 lg:space-y-4">
        <h1 className="text-balance text-[1.875rem] font-black leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">{dict.title}</h1>
        <p className="text-pretty text-[15px] leading-relaxed text-slate-400 lg:text-base">{dict.subtitle}</p>
      </div>

      <PhoneOnly>
        <BudgetSimulatorPhone locale={locale} model={model} />
      </PhoneOnly>
      <DesktopOnly>
        <BudgetSimulatorDesktop locale={locale} model={model} />
      </DesktopOnly>
    </div>
  );
}
