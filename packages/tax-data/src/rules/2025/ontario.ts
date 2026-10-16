import { ProvincialRuleSet } from '../../schema';

const CRA_ON428_SOURCE = 'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/ontario/5006-c.html';
const ON_HEALTH_PREMIUM_SOURCE = 'https://www.ontario.ca/document/health-premium';
const RETRIEVED_DATE = '2026-10-15';

export const ontario2025: ProvincialRuleSet = {
  year: 2025,
  jurisdiction: 'ON',
  brackets: [
    {
      upToCents: { value: 5280400, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.0505, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 10561100, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.0915, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 15000000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.1116, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: 22000000, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.1216, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
    {
      upToCents: { value: null, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
      rate: { value: 0.1316, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    },
  ],
  bpa: {
    amountCents: { value: 1269700, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    creditRate: { value: 0.0505, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
  },
  ontarioSurtax: {
    tier1ThresholdCents: { value: 547100, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    tier1Rate: { value: 0.20, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
    tier2ThresholdCents: { value: 700200, source: CRA_ON428_SOURCE, retrieved: RETRIEVED_DATE },
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
