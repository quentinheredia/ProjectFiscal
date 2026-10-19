import type { Locale } from '@/lib/i18n';
import { BUDGET_ENVELOPES, TAX_FILERS, type EnvelopeGroup } from './envelopes';

/** Variance within this many billions of the baseline counts as balanced. */
const BALANCED_TOLERANCE_BILLION = 0.1;
const DOLLARS_PER_BILLION = 1_000_000_000;

export type BudgetDirection = 'deficit' | 'surplus' | 'balanced';

export interface BudgetSummary {
  totalBillion: number;
  groupBillion: Record<EnvelopeGroup, number>;
  /** Whole percentages of the total that always sum to 100. */
  groupPercent: Record<EnvelopeGroup, number>;
  /** Spending above (positive) or below (negative) the baseline, in billions. */
  varianceBillion: number;
  direction: BudgetDirection;
  /** The variance shared across every tax filer, in whole dollars. */
  perTaxpayerDollars: number;
}

const BASELINE_TOTAL_BILLION = BUDGET_ENVELOPES.reduce((sum, envelope) => sum + envelope.baselineBillion, 0);

function directionOf(varianceBillion: number): BudgetDirection {
  if (varianceBillion > BALANCED_TOLERANCE_BILLION) return 'deficit';
  if (varianceBillion < -BALANCED_TOLERANCE_BILLION) return 'surplus';
  return 'balanced';
}

/** Totals, group split, variance and per-taxpayer impact for a set of allocations (billions by envelope id). */
export function summarizeBudget(allocations: Readonly<Record<string, number>>): BudgetSummary {
  const groupBillion: Record<EnvelopeGroup, number> = { statutory: 0, discretionary: 0 };
  for (const envelope of BUDGET_ENVELOPES) {
    groupBillion[envelope.group] += allocations[envelope.id] ?? envelope.baselineBillion;
  }
  const totalBillion = groupBillion.statutory + groupBillion.discretionary;
  const statutoryPercent = totalBillion > 0 ? Math.round((groupBillion.statutory / totalBillion) * 100) : 0;
  const varianceBillion = totalBillion - BASELINE_TOTAL_BILLION;

  return {
    totalBillion,
    groupBillion,
    groupPercent: { statutory: statutoryPercent, discretionary: 100 - statutoryPercent },
    varianceBillion,
    direction: directionOf(varianceBillion),
    // `|| 0` turns -0 (a tiny negative float rounded) into 0, so it never prints as "-$0".
    perTaxpayerDollars: Math.round((varianceBillion * DOLLARS_PER_BILLION) / TAX_FILERS) || 0,
  };
}

/** Billions as currency, for example 102.5 as "$102.5B" or "102,5 G$". */
export function formatBillions(billions: number, locale: Locale): string {
  const text = Math.abs(billions).toFixed(1);
  const sign = billions < 0 ? '-' : '';
  return locale === 'fr' ? `${sign}${text.replace('.', ',')} G$` : `${sign}$${text}B`;
}

/** A change in billions with its sign, for example "+2.5" or "-1.0". */
export function formatBillionDelta(billions: number, locale: Locale): string {
  const text = Math.abs(billions).toFixed(1);
  const signed = `${billions > 0 ? '+' : billions < 0 ? '-' : ''}${text}`;
  return locale === 'fr' ? signed.replace('.', ',') : signed;
}
