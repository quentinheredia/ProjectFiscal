import { FederalRuleSet } from '../../schema';

const CRA_T4127_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html';
const CRA_SCHED1_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/5000-s1.html';
const RETRIEVED_DATE = '2026-10-15';

export const federal2025: FederalRuleSet = {
  year: 2025,
  brackets: [
    {
      upToCents: { value: 5737500, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'First bracket up to $57,375' },
      rate: { value: 0.145, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE, notes: '2025 blended 14.5% rate' },
    },
    {
      upToCents: { value: 11475000, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.205, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 17788200, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.26, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 25341400, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.29, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.33, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    maxCents: { value: 1570500, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    minCents: { value: 1415600, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    thresholdLowCents: { value: 17788200, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    thresholdHighCents: { value: 25341400, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    creditRate: { value: 0.145, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
  },
  canadaEmploymentAmount: {
    maxCents: { value: 143300, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
    rate: { value: 0.145, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE },
  },
  cpp: {
    basicExemptionCents: { value: 350000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    firstCeilingCents: { value: 7130000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2025 YMPE $71,300' },
    secondCeilingCents: { value: 8120000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2025 YAMPE $81,200' },
    employeeRate: { value: 0.0595, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    secondEmployeeRate: { value: 0.04, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    selfEmployedRate: { value: 0.119, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    secondSelfEmployedRate: { value: 0.08, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
  },
  ei: {
    maxInsurableEarningsCents: { value: 6570000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2025 max insurable $65,700' },
    rate: { value: 0.0164, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2025 rate 1.64%' },
    quebecRate: { value: 0.0131, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
  },
};
