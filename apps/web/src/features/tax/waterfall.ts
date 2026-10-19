import type { TaxCalculationResult } from '@fiscal-insights/tax-engine';
import type { FederalRuleSet, ProvincialRuleSet } from '@fiscal-insights/tax-data';
import type { Dictionary } from '@/lib/i18n';
import { fillTemplate } from '@/lib/format';

export type TaxCurveStrings = Dictionary['taxCurve'];

export type RowKind = 'gross' | 'payroll' | 'federal' | 'provincial' | 'net';

export interface WaterfallRow {
  key: string;
  kind: RowKind;
  label: string;
  amountCents: number;
  sourceUrl?: string;
}

/** A row placed on the gross-to-take-home bar, as percentages of gross. */
export interface WaterfallSlice {
  row: WaterfallRow;
  isDeduction: boolean;
  /** Share of gross this row represents. */
  sharePercent: number;
  /** Where the coloured slice starts, and how much of gross is left after it. */
  sliceLeftPercent: number;
  sliceWidthPercent: number;
  remainingPercent: number;
}

export const ROW_COLORS: Record<RowKind, string> = {
  gross: 'bg-slate-400/70',
  payroll: 'bg-sky-400',
  federal: 'bg-amber-400',
  provincial: 'bg-orange-400',
  net: 'bg-emerald-400',
};

/** Gross, each deduction in payroll, federal, provincial order, then take-home, each with its source. */
export function buildWaterfallRows(
  result: TaxCalculationResult,
  fed: FederalRuleSet,
  prov: ProvincialRuleSet,
  strings: TaxCurveStrings,
  provinceName: string
): WaterfallRow[] {
  const quebec = prov.quebec;
  const plan = quebec ? quebec.qpp : fed.cpp;
  const surtaxCents = result.provincial.surtaxCents ?? 0;
  const healthPremiumCents = result.provincial.healthPremiumCents ?? 0;

  const rows: WaterfallRow[] = [
    { key: 'gross', kind: 'gross', label: strings.gross, amountCents: result.totalIncomeCents },
    {
      key: 'pension',
      kind: 'payroll',
      label: quebec ? strings.qpp : strings.cpp,
      amountCents: result.cpp.totalCents,
      sourceUrl: plan.baseEmployeeRate.source,
    },
    {
      key: 'ei',
      kind: 'payroll',
      label: strings.ei,
      amountCents: result.ei.employeeCents,
      sourceUrl: quebec ? fed.ei.quebecRate.source : fed.ei.rate.source,
    },
  ];
  if (quebec && result.qpip) {
    rows.push({
      key: 'qpip',
      kind: 'payroll',
      label: strings.qpip,
      amountCents: result.qpip.totalCents,
      sourceUrl: quebec.qpip.employeeRate.source,
    });
  }
  rows.push(
    {
      key: 'federal',
      kind: 'federal',
      label: strings.federalTax,
      amountCents: result.federal.netFederalTaxCents,
      sourceUrl: fed.brackets[0]!.rate.source,
    },
    {
      key: 'provincial',
      kind: 'provincial',
      label: fillTemplate(strings.provincialTax, { province: provinceName }),
      // Surtax and Health Premium get their own rows; reductions and credits stay netted in here.
      amountCents: result.provincial.netProvincialTaxCents - surtaxCents - healthPremiumCents,
      sourceUrl: prov.brackets[0]!.rate.source,
    }
  );
  if (prov.ontarioSurtax) {
    rows.push({
      key: 'surtax',
      kind: 'provincial',
      label: strings.surtax,
      amountCents: surtaxCents,
      sourceUrl: prov.ontarioSurtax.tier1ThresholdCents.source,
    });
  }
  if (prov.ontarioHealthPremium) {
    rows.push({
      key: 'healthPremium',
      kind: 'provincial',
      label: strings.healthPremium,
      amountCents: healthPremiumCents,
      sourceUrl: prov.ontarioHealthPremium.tiers.source,
    });
  }
  rows.push({ key: 'net', kind: 'net', label: strings.takeHome, amountCents: result.takeHomePayCents });
  return rows;
}

/** Places each row on the bar: deductions eat into what is left of gross, from the right. */
export function toWaterfallSlices(rows: readonly WaterfallRow[], grossCents: number): WaterfallSlice[] {
  const percentOf = (cents: number) => (grossCents > 0 ? (cents / grossCents) * 100 : 0);
  let remainingCents = grossCents;

  return rows.map((row) => {
    const isDeduction = row.kind !== 'gross' && row.kind !== 'net';
    const before = remainingCents;
    if (isDeduction) remainingCents -= row.amountCents;
    return {
      row,
      isDeduction,
      sharePercent: percentOf(row.amountCents),
      sliceLeftPercent: isDeduction ? percentOf(remainingCents) : 0,
      sliceWidthPercent: isDeduction ? percentOf(before - remainingCents) : percentOf(row.amountCents),
      remainingPercent: percentOf(remainingCents),
    };
  });
}
