import { describe, it, expect } from 'vitest';
import { calculateTax } from '../src/engine';
import type { SupportedProvince, TaxCalculationResult } from '../src/types';
import {
  FEDERAL_RULE_SETS,
  PROVINCIAL_RULE_SETS,
  FederalRuleSetSchema,
  ProvincialRuleSetSchema,
  TestVector,
  TestVectorSchema,
  getFederalRules,
  getProvincialRules,
  ontario2026,
} from '@fiscal-insights/tax-data';
import { TEST_VECTORS } from './vectors';

const PROVINCES_2026: SupportedProvince[] = ['ON', 'QC', 'BC', 'AB'];

const calculate = (year: number, province: SupportedProvince, employmentIncomeCents: number, extra = {}) =>
  calculateTax(
    { year, province, employmentIncomeCents, ...extra },
    getFederalRules(year),
    getProvincialRules(province, year)
  );

function actualFor(result: TaxCalculationResult, expected: TestVector['expected']) {
  const actual: Record<string, number | undefined> = {
    totalIncomeCents: result.totalIncomeCents,
    netIncomeCents: result.netIncomeCents,
    taxableIncomeCents: result.taxableIncomeCents,
    federalTaxCents: result.federal.netFederalTaxCents,
    provincialTaxCents: result.provincial.netProvincialTaxCents,
    cppCents: result.cpp.totalCents,
    eiCents: result.ei.totalCents,
    qpipCents: result.qpip?.totalCents,
    totalDeductionsCents: result.totalDeductionsCents,
    takeHomePayCents: result.takeHomePayCents,
  };
  return Object.fromEntries(Object.keys(expected).map((key) => [key, actual[key]]));
}

describe('rule sets', () => {
  it.each(FEDERAL_RULE_SETS.map((rules) => [rules.year, rules] as const))('federal %i passes the schema', (_, rules) => {
    expect(FederalRuleSetSchema.safeParse(rules).error?.issues).toBeUndefined();
  });

  it.each(PROVINCIAL_RULE_SETS.map((rules) => [`${rules.jurisdiction} ${rules.year}`, rules] as const))(
    '%s passes the schema',
    (_, rules) => {
      expect(ProvincialRuleSetSchema.safeParse(rules).error?.issues).toBeUndefined();
    }
  );

  it('rejects an unknown (null) value', () => {
    const draft = structuredClone(ontario2026) as unknown as { basicPersonalAmountCents: { value: number | null } };
    draft.basicPersonalAmountCents.value = null;
    expect(ProvincialRuleSetSchema.safeParse(draft).success).toBe(false);
  });

  it('rejects a rule block from another province', () => {
    const misplaced = { ...ontario2026, jurisdiction: 'AB' };
    expect(ProvincialRuleSetSchema.safeParse(misplaced).success).toBe(false);
  });
});

describe('cited test vectors', () => {
  const vectors = TEST_VECTORS.map((vector) => TestVectorSchema.parse(vector));

  it.each(PROVINCES_2026)('has at least 10 vectors for %s in 2026', (province) => {
    expect(vectors.filter((v) => v.province === province && v.year === 2026).length).toBeGreaterThanOrEqual(10);
  });

  it('has unique ids', () => {
    expect(new Set(vectors.map((v) => v.id)).size).toBe(vectors.length);
  });

  it.each(vectors.map((vector) => [vector.id, vector] as const))('%s', (_, vector) => {
    const result = calculate(vector.year, vector.province, vector.inputs.employmentIncomeCents, vector.inputs);
    const actual = actualFor(result, vector.expected);
    if (vector.toleranceCents === 0) {
      expect(actual).toEqual(vector.expected);
    } else {
      for (const [key, value] of Object.entries(vector.expected)) {
        expect(Math.abs((actual[key] ?? NaN) - (value as number)), key).toBeLessThanOrEqual(vector.toleranceCents);
      }
    }
  });
});

describe('engine properties', () => {
  const incomes = Array.from({ length: 81 }, (_, i) => i * 500000); // $0 to $400,000

  it.each(PROVINCES_2026)('%s: deductions and take-home add up to income, net never exceeds gross', (province) => {
    for (const income of incomes) {
      const result = calculate(2026, province, income);
      expect(result.takeHomePayCents + result.totalDeductionsCents).toBe(result.totalIncomeCents);
      expect(result.netIncomeCents).toBeLessThanOrEqual(result.totalIncomeCents);
      expect(result.takeHomePayCents).toBeGreaterThanOrEqual(0);
    }
  });

  it.each(PROVINCES_2026)('%s: total tax never falls as income rises', (province) => {
    let previous = -1;
    for (let income = 0; income <= 40000000; income += 100000) {
      const { totalTaxCents } = calculate(2026, province, income);
      expect(totalTaxCents).toBeGreaterThanOrEqual(previous);
      previous = totalTaxCents;
    }
  });

  it.each(PROVINCES_2026)('%s: marginal rate stays between 0 and 60%%', (province) => {
    // Not capped at the top combined rate: Ontario's health premium phases in at 25% over
    // narrow bands, which briefly pushes the marginal rate above the top rate.
    for (const income of incomes) {
      const { marginalTaxRate } = calculate(2026, province, income);
      expect(marginalTaxRate).toBeGreaterThanOrEqual(0);
      expect(marginalTaxRate).toBeLessThan(0.6);
    }
  });

  it.each([
    ['ON', 0.33 + 0.1316 * (1 + 0.2 + 0.36)],
    ['QC', 0.33 * (1 - 0.165) + 0.2575],
    ['BC', 0.33 + 0.205],
    ['AB', 0.33 + 0.15],
  ] as const)('%s: marginal rate at $500,000 is the top combined rate', (province, topRate) => {
    expect(calculate(2026, province, 50000000).marginalTaxRate).toBeCloseTo(topRate, 4);
  });

  it.each(PROVINCES_2026)('%s: an RRSP deduction lowers taxable income by its amount and lowers tax', (province) => {
    const base = calculate(2026, province, 10000000);
    const withRrsp = calculate(2026, province, 10000000, { rrspDeductionCents: 1000000 });
    expect(withRrsp.taxableIncomeCents).toBe(base.taxableIncomeCents - 1000000);
    expect(withRrsp.totalTaxCents).toBeLessThan(base.totalTaxCents);
  });

  it('flags Quebec self-employment as not modelled', () => {
    expect(calculate(2026, 'QC', 0, { selfEmploymentIncomeCents: 5000000 }).limitations).toContain(
      'QC_SELF_EMPLOYMENT_NOT_MODELLED'
    );
    expect(calculate(2026, 'ON', 0, { selfEmploymentIncomeCents: 5000000 }).limitations).toEqual([]);
  });

  it('cites an http(s) source on every trace line', () => {
    for (const province of PROVINCES_2026) {
      for (const trace of calculate(2026, province, 8000000, { selfEmploymentIncomeCents: 1000000 }).traces) {
        expect(trace.sourceUrl).toMatch(/^https:\/\//);
        expect(trace.formula).toBeTruthy();
      }
    }
  });
});
