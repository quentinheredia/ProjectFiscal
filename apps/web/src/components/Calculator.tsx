'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import type { ProvinceCode } from '@/lib/provinces';
import { useTaxCalculator } from '@/features/tax/useTaxCalculator';
import CalculatorDesktop from '@/components/tax/CalculatorDesktop';

interface CalculatorProps {
  locale: Locale;
  initialProvince?: ProvinceCode;
  initialSalaryDollars?: number;
}

const DEFAULT_SALARY_DOLLARS = 80000;

export default function Calculator({ locale, initialProvince = 'ON', initialSalaryDollars = DEFAULT_SALARY_DOLLARS }: CalculatorProps) {
  const model = useTaxCalculator(initialProvince, initialSalaryDollars);
  return <CalculatorDesktop locale={locale} model={model} />;
}
