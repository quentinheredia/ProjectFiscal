import { ProvincialRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.craRates2026, retrieved: RETRIEVED, notes });
// The July 2026 edition carries BC's February 2026 changes (5.60% lowest rate, $690 reduction)
// for the full year; Option 2 uses the annual, non-prorated amounts.
const t4127Jul = (value: number, notes: string) => ({ value, source: SOURCES.t4127Jul2026, retrieved: RETRIEVED, notes });

export const britishColumbia2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'BC',
  brackets: [
    { upToCents: rates(5036300, 'Up to $50,363'), rate: rates(0.056, '5.6% for 2026') },
    { upToCents: rates(10072800, '$50,363.01 to $100,728'), rate: rates(0.077) },
    { upToCents: rates(11564800, '$100,728.01 to $115,648'), rate: rates(0.105) },
    { upToCents: rates(14043000, '$115,648.01 to $140,430'), rate: rates(0.1229) },
    { upToCents: rates(19040500, '$140,430.01 to $190,405'), rate: rates(0.147) },
    { upToCents: rates(26554500, '$190,405.01 to $265,545'), rate: rates(0.168) },
    { rate: rates(0.205, 'Over $265,545') },
  ],
  nonRefundableCreditRate: t4127Jul(0.056, 'Chapter 5 (Option 2), British Columbia: K1P = 0.056 x TCP'),
  basicPersonalAmountCents: t4127Jul(1321600, 'Chapter 4, British Columbia: TCP is $13,216 if TD1BC is not filed'),
  bcTaxReduction: {
    basicReductionCents: t4127Jul(69000, 'Chapter 5 (Option 2), factor S: $690'),
    phaseOutStartCents: t4127Jul(2557000, 'Factor S: reduced where income exceeds $25,570'),
    phaseOutRate: t4127Jul(0.0356, 'Factor S: reduced by 3.56% of income over $25,570'),
  },
};
