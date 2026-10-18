'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateTax, type TaxCalculationResult } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import { useProvince } from '@/context/ProvinceContext';
import { provinceByCode, type ProvinceCode, type ProvinceConfig } from '@/lib/provinces';
import { perPeriodCents, type PayFrequency } from './pay-frequency';

const TAX_YEAR = 2026;
const CENTS_PER_DOLLAR = 100;
/** The preset deduction the RRSP / FHSA switch applies. */
export const QUICK_RRSP_DEDUCTION_DOLLARS = 8000;
export const QUICK_SALARY_MAX_DOLLARS = 2_000_000;

export type QuickFrequency = Extract<PayFrequency, 'annual' | 'biweekly' | 'monthly'>;
export const QUICK_FREQUENCIES: readonly QuickFrequency[] = ['annual', 'biweekly', 'monthly'];

export type PresetLabelKey = 'median' | 'benchmark' | 'quebec' | 'bc' | 'alberta';

export interface QuickPreset {
  id: string;
  labelKey: PresetLabelKey;
  province: ProvinceCode;
  salaryDollars: number;
}

export const QUICK_PRESETS: readonly QuickPreset[] = [
  { id: 'canadian-median', labelKey: 'median', province: 'ON', salaryDollars: 68500 },
  { id: 'on-80k', labelKey: 'benchmark', province: 'ON', salaryDollars: 80000 },
  { id: 'qc-85k', labelKey: 'quebec', province: 'QC', salaryDollars: 85000 },
  { id: 'bc-110k', labelKey: 'bc', province: 'BC', salaryDollars: 110000 },
  { id: 'ab-120k', labelKey: 'alberta', province: 'AB', salaryDollars: 120000 },
];

export const QUICK_SALARY_CHIPS: readonly number[] = [50000, 68500, 80000, 100000, 130000];

const CUSTOM_PRESET_ID = 'custom';

/** Shares of gross income, each a 0 to 1 ratio. */
export interface IncomeShares {
  takeHome: number;
  federal: number;
  provincial: number;
  payroll: number;
}

export interface QuickEstimateModel {
  presetId: string;
  selectPreset: (preset: QuickPreset) => void;
  salaryDollars: number;
  setSalaryDollars: (dollars: number) => void;
  hasRrspDeduction: boolean;
  setHasRrspDeduction: (on: boolean) => void;
  frequency: QuickFrequency;
  setFrequency: (frequency: QuickFrequency) => void;
  province: ProvinceConfig;
  result: TaxCalculationResult;
  /** CPP/QPP plus EI, annual. */
  payrollCents: number;
  shares: IncomeShares;
  /** An annual amount in the chosen pay frequency. */
  perPeriod: (annualCents: number) => number;
}

function matchingPresetId(salaryDollars: number, province: ProvinceCode): string {
  return QUICK_PRESETS.find((p) => p.salaryDollars === salaryDollars && p.province === province)?.id ?? CUSTOM_PRESET_ID;
}

function shareOf(cents: number, totalCents: number): number {
  return totalCents > 0 ? cents / totalCents : 0;
}

/** State and engine call behind the home page's quick estimate; shared by its phone and desktop views. */
export function useQuickEstimate(): QuickEstimateModel {
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();
  const [presetId, setPresetId] = useState(QUICK_PRESETS[0]!.id);
  const [salaryDollars, setSalary] = useState(QUICK_PRESETS[0]!.salaryDollars);
  const [hasRrspDeduction, setHasRrspDeduction] = useState(false);
  const [frequency, setFrequency] = useState<QuickFrequency>('annual');
  const province = selectedProvince;

  // A province picked elsewhere (navbar, menu) loads that province's preset.
  useEffect(() => {
    const current = QUICK_PRESETS.find((p) => p.id === presetId);
    if (current && current.province === province.code) return;
    const preset = QUICK_PRESETS.find((p) => p.province === province.code);
    if (!preset) return;
    setPresetId(preset.id);
    setSalary(preset.salaryDollars);
    // presetId is deliberately left out: choosing a custom salary must not reload a preset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province.code]);

  const result = useMemo(
    () =>
      calculateTax(
        {
          year: TAX_YEAR,
          province: province.code,
          employmentIncomeCents: salaryDollars * CENTS_PER_DOLLAR,
          rrspDeductionCents: hasRrspDeduction ? QUICK_RRSP_DEDUCTION_DOLLARS * CENTS_PER_DOLLAR : 0,
        },
        getFederalRules(TAX_YEAR),
        getProvincialRules(province.code, TAX_YEAR),
        { computeMarginalRate: true, includeTraces: true }
      ),
    [salaryDollars, province.code, hasRrspDeduction]
  );

  const payrollCents = result.cpp.totalCents + result.ei.totalCents;
  const total = result.totalIncomeCents;

  return {
    presetId,
    selectPreset: (preset) => {
      setPresetId(preset.id);
      setSalary(preset.salaryDollars);
      setSelectedProvinceSlug(provinceByCode(preset.province).slug);
    },
    salaryDollars,
    setSalaryDollars: (dollars) => {
      const clamped = Math.min(QUICK_SALARY_MAX_DOLLARS, Math.max(0, Math.round(dollars)));
      setSalary(clamped);
      setPresetId(matchingPresetId(clamped, province.code));
    },
    hasRrspDeduction,
    setHasRrspDeduction,
    frequency,
    setFrequency,
    province,
    result,
    payrollCents,
    shares: {
      takeHome: shareOf(result.takeHomePayCents, total),
      federal: shareOf(result.federal.netFederalTaxCents, total),
      provincial: shareOf(result.provincial.netProvincialTaxCents, total),
      payroll: shareOf(payrollCents, total),
    },
    perPeriod: (annualCents) => perPeriodCents(annualCents, frequency),
  };
}
