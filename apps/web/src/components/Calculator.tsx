'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import type { ProvinceCode } from '@/lib/provinces';
import { useTaxCalculator } from '@/features/tax/useTaxCalculator';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import CalculatorPhone from '@/components/tax/CalculatorPhone';
import CalculatorDesktop from '@/components/tax/CalculatorDesktop';

interface CalculatorProps {
  locale: Locale;
  initialProvince?: ProvinceCode;
  initialSalaryDollars?: number;
}

const DEFAULT_SALARY_DOLLARS = 80000;

/** The province calculator. One state, two presentations. */
export default function Calculator({ locale, initialProvince = 'ON', initialSalaryDollars = DEFAULT_SALARY_DOLLARS }: CalculatorProps) {
  const model = useTaxCalculator(initialProvince, initialSalaryDollars);

  return (
    <>
      <PhoneOnly className="mx-auto max-w-2xl">
        <CalculatorPhone locale={locale} model={model} />
      </PhoneOnly>
      <DesktopOnly>
        <CalculatorDesktop locale={locale} model={model} />
      </DesktopOnly>
    </>
  );
}
