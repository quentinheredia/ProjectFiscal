export type PayFrequency = 'annual' | 'monthly' | 'biweekly' | 'weekly' | 'hourly';

const WEEKS_PER_YEAR = 52;
const BIWEEKLY_PERIODS = 26;
const MONTHS_PER_YEAR = 12;
/** Full-time week used to turn annual pay into an hourly figure. */
const HOURS_PER_WEEK = 37.5;

export const PAY_PERIODS_PER_YEAR: Record<PayFrequency, number> = {
  annual: 1,
  monthly: MONTHS_PER_YEAR,
  biweekly: BIWEEKLY_PERIODS,
  weekly: WEEKS_PER_YEAR,
  hourly: WEEKS_PER_YEAR * HOURS_PER_WEEK,
};

export const ALL_PAY_FREQUENCIES: readonly PayFrequency[] = ['annual', 'monthly', 'biweekly', 'weekly', 'hourly'];

/** An annual amount expressed per pay period, rounded to the cent. */
export function perPeriodCents(annualCents: number, frequency: PayFrequency): number {
  return Math.round(annualCents / PAY_PERIODS_PER_YEAR[frequency]);
}
