import { ProvincialRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.craRates2025, retrieved: RETRIEVED, notes });
const on428 = <T>(value: T, notes: string) => ({ value, source: SOURCES.on428Form2025, retrieved: RETRIEVED, notes });
const on428a = (value: number, notes: string) => ({ value, source: SOURCES.on428aForm2025, retrieved: RETRIEVED, notes });

export const ontario2025: ProvincialRuleSet = {
  year: 2025,
  jurisdiction: 'ON',
  brackets: [
    { upToCents: rates(5288600, 'Up to $52,886'), rate: rates(0.0505) },
    { upToCents: rates(10577500, '$52,886.01 to $105,775'), rate: rates(0.0915) },
    { upToCents: rates(15000000, '$105,775.01 to $150,000'), rate: rates(0.1116) },
    { upToCents: rates(22000000, '$150,000.01 to $220,000'), rate: rates(0.1216) },
    { rate: rates(0.1316, 'Over $220,000') },
  ],
  nonRefundableCreditRate: on428(0.0505, 'Part B: credits are multiplied by 5.05%'),
  basicPersonalAmountCents: on428(1274700, 'Line 58040: basic personal amount $12,747'),
  ontarioSurtax: {
    tier1ThresholdCents: on428(571000, 'Line 66: 20% of basic Ontario tax over $5,710'),
    tier1Rate: on428(0.2, 'Line 66'),
    tier2ThresholdCents: on428(730700, 'Line 67: 36% of basic Ontario tax over $7,307'),
    tier2Rate: on428(0.36, 'Line 67'),
  },
  ontarioTaxReduction: {
    basicReductionCents: on428(29400, 'Line 74: basic reduction $294'),
  },
  ontarioLift: {
    maxCreditCents: on428a(87500, 'Line 5: maximum $875'),
    employmentIncomeRate: on428a(0.0505, 'Line 4: 5.05% of employment income'),
    incomeThresholdCents: on428a(3250000, 'Line 16: individual income threshold $32,500'),
    phaseOutRate: on428a(0.05, 'Line 18: 5% of adjusted net income over the threshold'),
  },
  ontarioHealthPremium: {
    tiers: on428(
      [
        { overCents: 2000000, baseCents: 0, rate: 0.06, capCents: 30000 },
        { overCents: 3600000, baseCents: 30000, rate: 0.06, capCents: 45000 },
        { overCents: 4800000, baseCents: 45000, rate: 0.25, capCents: 60000 },
        { overCents: 7200000, baseCents: 60000, rate: 0.25, capCents: 75000 },
        { overCents: 20000000, baseCents: 75000, rate: 0.25, capCents: 90000 },
      ],
      'Line 89 chart: Ontario health premium by taxable income',
    ),
  },
};
