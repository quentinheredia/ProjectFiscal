import { FederalRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.craRates2026, retrieved: RETRIEVED, notes });
const t4127 = (value: number, notes: string) => ({ value, source: SOURCES.t4127Jan2026, retrieved: RETRIEVED, notes });

export const federal2026: FederalRuleSet = {
  year: 2026,
  brackets: [
    { upToCents: rates(5852300, 'Up to $58,523'), rate: rates(0.14, 'Lowest federal rate is 14% for 2026') },
    { upToCents: rates(11704500, '$58,523.01 to $117,045'), rate: rates(0.205) },
    { upToCents: rates(18144000, '$117,045.01 to $181,440'), rate: rates(0.26) },
    { upToCents: rates(25848200, '$181,440.01 to $258,482'), rate: rates(0.29) },
    { rate: rates(0.33, 'Over $258,482') },
  ],
  nonRefundableCreditRate: t4127(0.14, 'Chapter 4: K1 = 0.14 x TC (lowest federal rate)'),
  bpa: {
    maxCents: t4127(1645200, 'BPAF formula: $16,452 where net income <= $181,440'),
    minCents: t4127(1482900, 'BPAF formula: $14,829 where net income >= $258,482'),
    phaseOutStartCents: t4127(18144000, 'BPAF formula: reduction starts above $181,440'),
    phaseOutEndCents: t4127(25848200, 'BPAF formula: minimum reached at $258,482'),
  },
  canadaEmploymentAmountMaxCents: t4127(150100, 'Table 8.2: CEA $1,501'),
  cpp: {
    basicExemptionCents: t4127(350000, 'Table 8.3: basic exemption $3,500'),
    maxPensionableEarningsCents: t4127(7460000, 'Table 8.3: YMPE $74,600'),
    additionalMaxPensionableEarningsCents: t4127(8500000, 'Table 8.6: YAMPE $85,000'),
    baseEmployeeRate: t4127(0.0495, 'Table 8.4: base contribution rate 4.95%'),
    firstAdditionalEmployeeRate: t4127(0.01, 'Table 8.5: first additional contribution rate 1%'),
    secondAdditionalEmployeeRate: t4127(0.04, 'Table 8.6: second additional contribution rate 4%'),
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
    maxInsurableEarningsCents: t4127(6890000, 'Table 8.7: maximum insurable earnings $68,900'),
    rate: t4127(0.0163, 'Table 8.7: employee rate 1.63% outside Quebec'),
    quebecRate: t4127(0.013, 'Table 8.7: employee rate 1.30% in Quebec'),
  },
};
