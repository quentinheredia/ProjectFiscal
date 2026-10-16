import { ProvincialRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.craRates2026, retrieved: RETRIEVED, notes });
const t4127 = (value: number, notes: string) => ({ value, source: SOURCES.t4127Jan2026, retrieved: RETRIEVED, notes });

// TODO: Alberta's supplemental credit (T4127 factor K5P) applies only when credits exceed
// $61,200 x 8%; not modelled because the engine's inputs cannot reach it.
export const alberta2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'AB',
  brackets: [
    { upToCents: rates(6120000, 'Up to $61,200'), rate: rates(0.08) },
    { upToCents: rates(15425900, '$61,200.01 to $154,259'), rate: rates(0.1) },
    { upToCents: rates(18511100, '$154,259.01 to $185,111'), rate: rates(0.12) },
    { upToCents: rates(24681300, '$185,111.01 to $246,813'), rate: rates(0.13) },
    { upToCents: rates(37022000, '$246,813.01 to $370,220'), rate: rates(0.14) },
    { rate: rates(0.15, 'Over $370,220') },
  ],
  nonRefundableCreditRate: t4127(0.08, 'Chapter 4, Alberta: K1P = 0.08 x TCP'),
  basicPersonalAmountCents: t4127(2276900, 'Table 8.2: Alberta basic amount $22,769'),
};
