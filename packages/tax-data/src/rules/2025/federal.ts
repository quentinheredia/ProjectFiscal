import { FederalRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const t1 = (value: number, notes: string) => ({ value, source: SOURCES.t1Return2025, retrieved: RETRIEVED, notes });
const t4127 = (value: number, notes: string) => ({ value, source: SOURCES.t4127Jan2026, retrieved: RETRIEVED, notes });

export const federal2025: FederalRuleSet = {
  year: 2025,
  brackets: [
    {
      upToCents: t1(5737500, 'Step 5 Part A: up to $57,375'),
      rate: t1(0.145, 'Step 5 Part A: 14.5% for 2025'),
    },
    { upToCents: t1(11475000, 'Step 5 Part A: $57,375 to $114,750'), rate: t1(0.205, 'Step 5 Part A') },
    { upToCents: t1(17788200, 'Step 5 Part A: $114,750 to $177,882'), rate: t1(0.26, 'Step 5 Part A') },
    { upToCents: t1(25341400, 'Step 5 Part A: $177,882 to $253,414'), rate: t1(0.29, 'Step 5 Part A') },
    { rate: t1(0.33, 'Step 5 Part A: over $253,414') },
  ],
  nonRefundableCreditRate: t1(0.145, 'Line 33800: line 33500 x 14.5%'),
  bpa: {
    maxCents: t1(1612900, 'Line 30000: $16,129 if net income is $177,882 or less'),
    minCents: t1(1453800, 'Line 30000: $14,538 if net income is $253,414 or more'),
    phaseOutStartCents: t1(17788200, 'Line 30000: reduction starts above $177,882'),
    phaseOutEndCents: t1(25341400, 'Line 30000: minimum reached at $253,414'),
  },
  canadaEmploymentAmountMaxCents: t1(147100, 'Line 31260: lesser of $1,471 and employment income'),
  cpp: {
    basicExemptionCents: t4127(350000, 'Table 8.24: basic exemption $3,500'),
    maxPensionableEarningsCents: t4127(7130000, 'Table 8.24: 2025 YMPE $71,300'),
    additionalMaxPensionableEarningsCents: t4127(8120000, 'Table 8.27: 2025 YAMPE $81,200'),
    baseEmployeeRate: t4127(0.0495, 'Table 8.25: base contribution rate 4.95%'),
    firstAdditionalEmployeeRate: t4127(0.01, 'Table 8.26: first additional contribution rate 1%'),
    secondAdditionalEmployeeRate: t4127(0.04, 'Table 8.27: second additional contribution rate 4%'),
    selfEmployedFirstTierRate: {
      value: 0.119,
      source: SOURCES.craCppRates,
      retrieved: RETRIEVED,
      notes: 'Self-employed pay both the employee and employer 5.95%',
    },
    selfEmployedSecondTierRate: {
      value: 0.08,
      source: SOURCES.craCppRates,
      retrieved: RETRIEVED,
      notes: 'Self-employed pay both the employee and employer 4% second additional contribution',
    },
  },
  ei: {
    maxInsurableEarningsCents: t4127(6570000, 'Table 8.28: maximum insurable earnings $65,700'),
    rate: t4127(0.0164, 'Table 8.28: employee rate 1.64% outside Quebec'),
    quebecRate: t4127(0.0131, 'Table 8.28: employee rate 1.31% in Quebec'),
  },
};
