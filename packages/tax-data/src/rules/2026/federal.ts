import { FederalRuleSet } from '../../schema';

const CRA_T4127_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas.html';
const CRA_SCHED1_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/5000-s1.html';
const KPMG_2026_SOURCE = 'https://kpmg.com/ca/en/home/insights/2025/12/canadian-tax-rates.html';
const RETRIEVED_DATE = '2026-10-15';

export const federal2026: FederalRuleSet = {
  year: 2026,
  brackets: [
    {
      upToCents: { value: 5852300, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'First bracket up to $58,523' },
      rate: { value: 0.14, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 lowest federal rate lowered to 14%' },
    },
    {
      upToCents: { value: 11704500, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Second bracket $58,523 to $117,045' },
      rate: { value: 0.205, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 18144000, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Third bracket $117,045 to $181,440' },
      rate: { value: 0.26, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 25848200, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Fourth bracket $181,440 to $258,482' },
      rate: { value: 0.29, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Top bracket over $258,482' },
      rate: { value: 0.33, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    maxCents: { value: 1614000, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Max BPA $16,140' },
    minCents: { value: 1452600, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Base BPA $14,526' },
    thresholdLowCents: { value: 18144000, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    thresholdHighCents: { value: 25848200, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
    creditRate: { value: 0.14, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Lowest federal tax bracket rate' },
  },
  canadaEmploymentAmount: {
    maxCents: { value: 147100, source: CRA_SCHED1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'CEA max $1,471' },
    rate: { value: 0.14, source: KPMG_2026_SOURCE, retrieved: RETRIEVED_DATE },
  },
  cpp: {
    basicExemptionCents: { value: 350000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    firstCeilingCents: { value: 7460000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 YMPE $74,600' },
    secondCeilingCents: { value: 8500000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 YAMPE $85,000' },
    employeeRate: { value: 0.0595, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    secondEmployeeRate: { value: 0.04, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    selfEmployedRate: { value: 0.119, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
    secondSelfEmployedRate: { value: 0.08, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE },
  },
  ei: {
    maxInsurableEarningsCents: { value: 6890000, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 max insurable earnings $68,900' },
    rate: { value: 0.0163, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 EI employee rate 1.63%' },
    quebecRate: { value: 0.0130, source: CRA_T4127_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 EI Quebec rate 1.30%' },
  },
};
