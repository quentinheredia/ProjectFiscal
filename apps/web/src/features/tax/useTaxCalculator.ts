'use client';

import { useMemo, useState } from 'react';
import { calculateTax, type TaxCalculationResult } from '@fiscal-insights/tax-engine';
import { getFederalRules, getProvincialRules } from '@fiscal-insights/tax-data';
import type { ProvinceCode } from '@/lib/provinces';
import { perPeriodCents, type PayFrequency } from './pay-frequency';

export const TAX_YEARS = [2026, 2025] as const;
export type TaxYear = (typeof TAX_YEARS)[number];

const CENTS_PER_DOLLAR = 100;
export const CALCULATOR_SALARY_CHIPS: readonly number[] = [50000, 68500, 80000, 100000, 130000];
export const CALCULATOR_MAX_DOLLARS = 9_999_999;
export const FHSA_ANNUAL_LIMIT_DOLLARS = 8000;

/** The calculator's free-text money fields, kept as typed so a cleared field stays empty. */
export type MoneyField = 'employment' | 'selfEmployment' | 'rrsp' | 'fhsa';

/** Shares of gross income, each a 0 to 1 ratio. */
export interface CalculatorShares {
  takeHome: number;
  federal: number;
  provincial: number;
  pension: number;
  insurance: number;
}

export interface TaxCalculatorModel {
  year: TaxYear;
  selectYear: (year: TaxYear) => void;
  isYearAvailable: (year: TaxYear) => boolean;
  province: ProvinceCode;
  selectProvince: (province: ProvinceCode) => void;
  isProvinceAvailable: (province: ProvinceCode) => boolean;
  fields: Record<MoneyField, string>;
  setField: (field: MoneyField, value: string) => void;
  frequency: PayFrequency;
  setFrequency: (frequency: PayFrequency) => void;
  result: TaxCalculationResult;
  /** EI plus QPIP, annual. */
  insuranceCents: number;
  shares: CalculatorShares;
  /** An annual amount in the chosen pay frequency. */
  perPeriod: (annualCents: number) => number;
}

/** True when a rule set is published for that province and year. */
export function hasProvincialRules(province: ProvinceCode, year: number): boolean {
  try {
    getProvincialRules(province, year);
    return true;
  } catch {
    return false;
  }
}

function toCents(dollarsText: string): number {
  return Math.round((parseFloat(dollarsText) || 0) * CENTS_PER_DOLLAR);
}

function shareOf(cents: number, totalCents: number): number {
  return totalCents > 0 ? cents / totalCents : 0;
}

/** State and engine call behind the province calculator; shared by its phone and desktop views. */
export function useTaxCalculator(initialProvince: ProvinceCode, initialSalaryDollars: number): TaxCalculatorModel {
  const [year, setYear] = useState<TaxYear>(TAX_YEARS[0]);
  const [province, setProvince] = useState<ProvinceCode>(initialProvince);
  const [fields, setFields] = useState<Record<MoneyField, string>>({
    employment: String(initialSalaryDollars),
    selfEmployment: '0',
    rrsp: '0',
    fhsa: '0',
  });
  const [frequency, setFrequency] = useState<PayFrequency>('annual');

  const result = useMemo(
    () =>
      calculateTax(
        {
          year,
          province,
          employmentIncomeCents: toCents(fields.employment),
          selfEmploymentIncomeCents: toCents(fields.selfEmployment),
          rrspDeductionCents: toCents(fields.rrsp),
          fhsaDeductionCents: toCents(fields.fhsa),
        },
        getFederalRules(year),
        getProvincialRules(province, year)
      ),
    [year, province, fields]
  );

  const insuranceCents = result.ei.totalCents + (result.qpip?.totalCents ?? 0);
  const total = result.totalIncomeCents;

  return {
    year,
    selectYear: (next) => {
      if (hasProvincialRules(province, next)) setYear(next);
    },
    isYearAvailable: (candidate) => hasProvincialRules(province, candidate),
    province,
    selectProvince: (next) => {
      if (hasProvincialRules(next, year)) setProvince(next);
    },
    isProvinceAvailable: (candidate) => hasProvincialRules(candidate, year),
    fields,
    setField: (field, value) => setFields((previous) => ({ ...previous, [field]: value })),
    frequency,
    setFrequency,
    result,
    insuranceCents,
    shares: {
      takeHome: shareOf(result.takeHomePayCents, total),
      federal: shareOf(result.federal.netFederalTaxCents, total),
      provincial: shareOf(result.provincial.netProvincialTaxCents, total),
      pension: shareOf(result.cpp.totalCents, total),
      insurance: shareOf(insuranceCents, total),
    },
    perPeriod: (annualCents) => perPeriodCents(annualCents, frequency),
  };
}
