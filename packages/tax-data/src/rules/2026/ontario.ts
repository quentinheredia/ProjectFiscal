import { ProvincialRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.craRates2026, retrieved: RETRIEVED, notes });
const t4127 = <T>(value: T, notes: string) => ({ value, source: SOURCES.t4127Jan2026, retrieved: RETRIEVED, notes });
const lift = (value: number, notes: string) => ({ value, source: SOURCES.ontarioLift, retrieved: RETRIEVED, notes });

export const ontario2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'ON',
  brackets: [
    { upToCents: rates(5389100, 'Up to $53,891'), rate: rates(0.0505) },
    { upToCents: rates(10778500, '$53,891.01 to $107,785'), rate: rates(0.0915) },
    { upToCents: rates(15000000, '$107,785.01 to $150,000'), rate: rates(0.1116) },
    { upToCents: rates(22000000, '$150,000.01 to $220,000'), rate: rates(0.1216) },
    { rate: rates(0.1316, 'Over $220,000') },
  ],
  nonRefundableCreditRate: t4127(0.0505, 'Chapter 4: K1P uses the lowest provincial rate (5.05%)'),
  basicPersonalAmountCents: t4127(1298900, 'Table 8.2: Ontario basic amount $12,989'),
  ontarioSurtax: {
    tier1ThresholdCents: t4127(581800, 'Table 8.2 / factor V1: 20% of basic Ontario tax over $5,818'),
    tier1Rate: t4127(0.2, 'Table 8.2 / factor V1'),
    tier2ThresholdCents: t4127(744600, 'Table 8.2 / factor V1: 36% of basic Ontario tax over $7,446'),
    tier2Rate: t4127(0.36, 'Table 8.2 / factor V1'),
  },
  ontarioTaxReduction: {
    basicReductionCents: t4127(30000, 'Table 8.2 S2 / factor S: basic reduction $300'),
  },
  ontarioLift: {
    maxCreditCents: lift(87500, '2022 onward: maximum credit $875'),
    employmentIncomeRate: lift(0.0505, '2022 onward: or 5.05% of employment income, whichever is lower'),
    incomeThresholdCents: lift(3250000, '2022 onward: reduced above adjusted individual net income of $32,500'),
    phaseOutRate: lift(0.05, '2022 onward: reduced by 5% of income over the threshold'),
  },
  ontarioHealthPremium: {
    tiers: t4127(
      [
        { overCents: 2000000, baseCents: 0, rate: 0.06, capCents: 30000 },
        { overCents: 3600000, baseCents: 30000, rate: 0.06, capCents: 45000 },
        { overCents: 4800000, baseCents: 45000, rate: 0.25, capCents: 60000 },
        { overCents: 7200000, baseCents: 60000, rate: 0.25, capCents: 75000 },
        { overCents: 20000000, baseCents: 75000, rate: 0.25, capCents: 90000 },
      ],
      'Chapter 4, Ontario factor V2 (Ontario Health Premium)',
    ),
  },
};
