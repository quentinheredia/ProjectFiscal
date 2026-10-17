import { ProvincialRuleSet } from '../../schema';
import { RETRIEVED, SOURCES } from '../sources';

const rates = (value: number, notes?: string) => ({ value, source: SOURCES.rqIncomeTaxRates, retrieved: RETRIEVED, notes });
const changes = (value: number, notes: string) => ({ value, source: SOURCES.rqPrincipalChanges2026, retrieved: RETRIEVED, notes });
const formulas = (value: number, notes: string) => ({ value, source: SOURCES.rqSourceDeductionFormulas2026, retrieved: RETRIEVED, notes });
const selfEmployedQpp = (value: number, notes: string) => ({ value, source: SOURCES.rqSelfEmployedQpp, retrieved: RETRIEVED, notes });

export const quebec2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'QC',
  brackets: [
    { upToCents: rates(5434500, '$54,345 or less'), rate: rates(0.14) },
    { upToCents: rates(10868000, 'More than $54,345 but not more than $108,680'), rate: rates(0.19) },
    { upToCents: rates(13224500, 'More than $108,680 but not more than $132,245'), rate: rates(0.24) },
    { rate: rates(0.2575, 'More than $132,245') },
  ],
  nonRefundableCreditRate: formulas(0.14, 'Step 2: Y = (T x I) - K - K1 - (0.14 x E)'),
  basicPersonalAmountCents: changes(1895200, 'Personal tax credit amounts: basic personal amount $18,952'),
  quebec: {
    federalAbatementRate: {
      value: 0.165,
      source: SOURCES.t4127Jan2026,
      retrieved: RETRIEVED,
      notes: 'Table 8.2: QC abatement 0.165 of basic federal tax',
    },
    deductionForWorkers: {
      rate: formulas(0.06, 'Step 1: H = 0.06 x gross salary'),
      maxCents: changes(145000, 'Deduction for workers: maximum $1,450 for 2026'),
    },
    qpp: {
      basicExemptionCents: changes(350000, 'QPP: basic exemption $3,500'),
      maxPensionableEarningsCents: changes(7460000, 'QPP: maximum pensionable earnings $74,600'),
      additionalMaxPensionableEarningsCents: changes(8500000, 'QPP: additional maximum pensionable earnings $85,000'),
      baseEmployeeRate: changes(0.053, 'QPP: base contribution rate 5.30%'),
      firstAdditionalEmployeeRate: changes(0.01, 'QPP: first additional contribution rate 1%'),
      secondAdditionalEmployeeRate: changes(0.04, 'QPP: second additional contribution rate 4%'),
      selfEmployedFirstTierRate: selfEmployedQpp(0.126, '2026: basic rate 10.6% plus first additional rate 2%'),
      selfEmployedSecondTierRate: selfEmployedQpp(0.08, '2026: second additional rate 8%'),
    },
    qpip: {
      maxInsurableEarningsCents: changes(10300000, 'QPIP: maximum insurable earnings $103,000'),
      employeeRate: changes(0.0043, "QPIP: employee's premium rate 0.430%"),
      selfEmployedRate: {
        value: 0.00764,
        source: SOURCES.quebecQpipRates,
        retrieved: RETRIEVED,
        notes: 'Travailleurs autonomes 2026: 0,764 %',
      },
    },
  },
};
