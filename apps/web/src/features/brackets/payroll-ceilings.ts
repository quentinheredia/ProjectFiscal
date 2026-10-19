import type { FederalRuleSet } from '@fiscal-insights/tax-data';
import type { Locale } from '@/lib/i18n';
import { formatCents, formatPercent } from '@/lib/format';

const RATE_DIGITS = 2;

export interface PayrollCeilings {
  /** Template values for the base CPP description: ympe, exemption, rate, max. */
  cppBase: Record<string, string>;
  /** Template values for the CPP2 description: ympe, yampe, rate, max. */
  cpp2: Record<string, string>;
  /** Template values for the EI description: mie, rate, qcRate, max, qcMax. */
  ei: Record<string, string>;
  headline: { ympe: string; yampe: string; mie: string };
}

function maxContributionCents(earningsCents: number, rate: number): number {
  return Math.round(earningsCents * rate);
}

/**
 * Payroll ceilings and maximum contributions, computed from the sourced federal rule set so the
 * explanatory copy can never drift from the figures the engine uses.
 */
export function payrollCeilings(fed: FederalRuleSet, locale: Locale): PayrollCeilings {
  const money = (cents: number) => formatCents(cents, locale, 2);
  const wholeMoney = (cents: number) => formatCents(cents, locale);
  const percent = (rate: number) => formatPercent(rate, locale, RATE_DIGITS);

  const ympe = fed.cpp.maxPensionableEarningsCents.value;
  const yampe = fed.cpp.additionalMaxPensionableEarningsCents.value;
  const exemption = fed.cpp.basicExemptionCents.value;
  const cppRate = fed.cpp.baseEmployeeRate.value + fed.cpp.firstAdditionalEmployeeRate.value;
  const cpp2Rate = fed.cpp.secondAdditionalEmployeeRate.value;
  const mie = fed.ei.maxInsurableEarningsCents.value;
  const eiRate = fed.ei.rate.value;
  const eiQuebecRate = fed.ei.quebecRate.value;

  return {
    cppBase: {
      ympe: wholeMoney(ympe),
      exemption: wholeMoney(exemption),
      rate: percent(cppRate),
      max: money(maxContributionCents(ympe - exemption, cppRate)),
    },
    cpp2: {
      ympe: wholeMoney(ympe),
      yampe: wholeMoney(yampe),
      rate: percent(cpp2Rate),
      max: money(maxContributionCents(yampe - ympe, cpp2Rate)),
    },
    ei: {
      mie: wholeMoney(mie),
      rate: percent(eiRate),
      qcRate: percent(eiQuebecRate),
      max: money(maxContributionCents(mie, eiRate)),
      qcMax: money(maxContributionCents(mie, eiQuebecRate)),
    },
    headline: { ympe: wholeMoney(ympe), yampe: wholeMoney(yampe), mie: wholeMoney(mie) },
  };
}
