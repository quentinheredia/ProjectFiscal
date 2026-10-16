import { ProvincialRuleSet } from '../../schema';

const CRA_ON428_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/ontario/5006-c.html';
const ON_HEALTH_PREMIUM_SOURCE = 'https://www.ontario.ca/document/health-premium';
const CRA_BC428_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/british-columbia/5010-c.html';
const CRA_AB428_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/alberta/5009-c.html';
const REVENU_QUEBEC_TP1_SOURCE = 'https://www.revenuquebec.ca/en/citizens/income-tax-return/calculating-your-income-tax/';
const RETRIEVED_DATE = '2026-10-15';

export const ontario2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'ON',
  brackets: [
    {
      upToCents: { value: 5386000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Up to $53,860' },
      rate: { value: 0.0505, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 10772400, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$53,860 to $107,724' },
      rate: { value: 0.0915, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 15000000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$107,724 to $150,000' },
      rate: { value: 0.1116, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 22000000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$150,000 to $220,000' },
      rate: { value: 0.1216, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Over $220,000' },
      rate: { value: 0.1316, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    amountCents: { value: 1298700, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'ON BPA $12,987' },
    creditRate: { value: 0.0505, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
  },
  ontarioSurtax: {
    tier1ThresholdCents: { value: 558000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: '20% on basic tax over $5,580' },
    tier1Rate: { value: 0.20, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    tier2ThresholdCents: { value: 714200, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE, notes: '36% on basic tax over $7,142' },
    tier2Rate: { value: 0.36, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
  },
  ontarioHealthPremium: {
    source: { value: true, source: ON_HEALTH_PREMIUM_SOURCE, retrieved: RETRIEVED_DATE },
    tiers: [
      { thresholdCents: 2000000, baseAmountCents: 0, rateOnExcess: 0.06, capCents: 30000 },
      { thresholdCents: 2500000, baseAmountCents: 30000, rateOnExcess: 0, capCents: 30000 },
      { thresholdCents: 3600000, baseAmountCents: 30000, rateOnExcess: 0.06, capCents: 45000 },
      { thresholdCents: 3850000, baseAmountCents: 45000, rateOnExcess: 0, capCents: 45000 },
      { thresholdCents: 4800000, baseAmountCents: 45000, rateOnExcess: 0.25, capCents: 60000 },
      { thresholdCents: 4860000, baseAmountCents: 60000, rateOnExcess: 0, capCents: 60000 },
      { thresholdCents: 7200000, baseAmountCents: 60000, rateOnExcess: 0.25, capCents: 75000 },
      { thresholdCents: 7260000, baseAmountCents: 75000, rateOnExcess: 0, capCents: 75000 },
      { thresholdCents: 20000000, baseAmountCents: 75000, rateOnExcess: 0.25, capCents: 90000 },
      { thresholdCents: 20060000, baseAmountCents: 90000, rateOnExcess: 0, capCents: 90000 },
    ],
  },
};

export const quebec2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'QC',
  brackets: [
    {
      upToCents: { value: 5375500, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Up to $53,755' },
      rate: { value: 0.14, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 10751000, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: '$53,755 to $107,510' },
      rate: { value: 0.19, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 13082500, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: '$107,510 to $130,825' },
      rate: { value: 0.24, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Over $130,825' },
      rate: { value: 0.2575, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    amountCents: { value: 1894500, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'QC BPA $18,945' },
    creditRate: { value: 0.14, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
  },
  quebecAbatementRate: {
    value: 0.165,
    source: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-44000-refundable-quebec-abatement.html',
    retrieved: RETRIEVED_DATE,
    notes: 'Federal abatement for Quebec residents (16.5% of basic federal tax)',
  },
  qpp: {
    basicExemptionCents: { value: 350000, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    firstCeilingCents: { value: 7460000, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 QPP YMPE $74,600' },
    secondCeilingCents: { value: 8500000, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: '2026 QPP YAMPE $85,000' },
    employeeRate: { value: 0.0640, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'QPP base rate 6.40%' },
    secondEmployeeRate: { value: 0.040, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE, notes: 'QPP2 rate 4.0%' },
    selfEmployedRate: { value: 0.1280, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
    secondSelfEmployedRate: { value: 0.080, source: REVENU_QUEBEC_TP1_SOURCE, retrieved: RETRIEVED_DATE },
  },
  qpip: {
    maxInsurableEarningsCents: { value: 10050000, source: 'https://www.rqap.gouv.qc.ca/', retrieved: RETRIEVED_DATE, notes: '2026 QPIP max insurable $100,500' },
    employeeRate: { value: 0.00494, source: 'https://www.rqap.gouv.qc.ca/', retrieved: RETRIEVED_DATE, notes: '0.494% employee rate' },
    selfEmployedRate: { value: 0.00873, source: 'https://www.rqap.gouv.qc.ca/', retrieved: RETRIEVED_DATE, notes: '0.873% self-employed rate' },
  },
};

export const britishColumbia2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'BC',
  brackets: [
    {
      upToCents: { value: 5026500, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Up to $50,265' },
      rate: { value: 0.0506, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 10053100, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$50,265 to $100,531' },
      rate: { value: 0.0770, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 11543100, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$100,531 to $115,431' },
      rate: { value: 0.1050, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 14017100, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$115,431 to $140,171' },
      rate: { value: 0.1229, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 19003200, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$140,171 to $190,032' },
      rate: { value: 0.1470, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 26506300, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$190,032 to $265,063' },
      rate: { value: 0.1680, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Over $265,063' },
      rate: { value: 0.2050, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    amountCents: { value: 1292500, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'BC BPA $12,925' },
    creditRate: { value: 0.0506, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE },
  },
  bcTaxReduction: {
    initialAmountCents: { value: 58400, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'BC tax reduction $584' },
    thresholdCents: { value: 2611800, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Phase-out starts at $26,118' },
    phaseOutRate: { value: 0.0356, source: CRA_BC428_SOURCE, retrieved: RETRIEVED_DATE, notes: '3.56% phase-out rate' },
  },
};

export const alberta2026: ProvincialRuleSet = {
  year: 2026,
  jurisdiction: 'AB',
  brackets: [
    {
      upToCents: { value: 15503300, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Up to $155,033' },
      rate: { value: 0.10, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 18603900, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$155,033 to $186,039' },
      rate: { value: 0.12, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 24805200, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$186,039 to $248,052' },
      rate: { value: 0.13, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 37207700, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: '$248,052 to $372,077' },
      rate: { value: 0.14, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'Over $372,077' },
      rate: { value: 0.15, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    amountCents: { value: 2290700, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE, notes: 'AB BPA $22,907' },
    creditRate: { value: 0.10, source: CRA_AB428_SOURCE, retrieved: RETRIEVED_DATE },
  },
};
