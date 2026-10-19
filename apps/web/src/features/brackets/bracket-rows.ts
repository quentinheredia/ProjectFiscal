import type { FederalRuleSet } from '@fiscal-insights/tax-data';

/** One bracket as a range: income from `fromCents` up to `toCents` (null for the top bracket) at `rate`. */
export interface BracketRow {
  fromCents: number;
  toCents: number | null;
  rate: number;
}

type RuleBrackets = FederalRuleSet['brackets'];

/** Turns a rule set's cumulative bracket limits into explicit from/to ranges. */
export function toBracketRows(brackets: RuleBrackets): BracketRow[] {
  return brackets.map((bracket, index) => ({
    fromCents: index === 0 ? 0 : (brackets[index - 1]!.upToCents?.value ?? 0),
    toCents: bracket.upToCents?.value ?? null,
    rate: bracket.rate.value,
  }));
}

/** The highest rate in a set of rows, for scaling rate bars. */
export function topRate(rows: readonly BracketRow[]): number {
  return rows.reduce((max, row) => Math.max(max, row.rate), 0);
}
