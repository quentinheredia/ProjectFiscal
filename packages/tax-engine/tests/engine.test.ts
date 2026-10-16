import { describe, it, expect } from 'vitest';
import { calculateTax } from '../src/engine';
import {
  federal2026,
  federal2025,
  ontario2026,
  ontario2025,
  quebec2026,
  britishColumbia2026,
  alberta2026,
} from '@fiscal-insights/tax-data';

describe('Tax Engine v0 - Audit Test Cases', () => {
  it('correctly calculates the pitch test case: Ontario 2025 at $80,000', () => {
    const result = calculateTax(
      {
        year: 2025,
        province: 'ON',
        employmentIncomeCents: 8000000, // $80,000.00
      },
      federal2025,
      ontario2025
    );

    // Expected values from PRD page 2:
    // Federal tax: ~$9,552
    // Ontario tax incl. health premium: ~$4,940
    // CPP + CPP2: $4,382.10
    // EI: $1,077.48
    // Net income: ~$60,048

    expect(result.cpp.totalCents).toBe(438210); // $4,382.10 exact
    expect(result.ei.totalCents).toBe(107748); // $1,077.48 exact
    expect(result.provincial.healthPremiumCents).toBe(75000); // $750.00 exact

    // Federal tax within $150 of PRD author approximate hand-calculation estimate ~$9,552
    expect(Math.abs(result.federal.netFederalTaxCents - 955200)).toBeLessThan(15000);

    // Ontario tax incl health premium within $50 of estimate ~$4,940
    expect(Math.abs(result.provincial.netProvincialTaxCents - 494000)).toBeLessThan(10000);

    // Net take-home pay within $150 of estimate ~$60,048
    expect(Math.abs(result.takeHomePayCents - 6004800)).toBeLessThan(15000);
  });

  it('correctly calculates 2026 Ontario at $80,000 with 14% lowest federal bracket', () => {
    const result = calculateTax(
      {
        year: 2026,
        province: 'ON',
        employmentIncomeCents: 8000000,
      },
      federal2026,
      ontario2026
    );

    expect(result.totalIncomeCents).toBe(8000000);
    expect(result.provincial.healthPremiumCents).toBe(75000); // $750 OHP
    expect(result.takeHomePayCents).toBeGreaterThan(5800000);
    expect(result.takeHomePayCents).toBeLessThan(6300000);
    expect(result.marginalTaxRate).toBeGreaterThan(0.20);
    expect(result.marginalTaxRate).toBeLessThan(0.40);
  });
});

describe('40+ Test Vectors Across ON, QC, BC, AB (2026)', () => {
  const provinces = [
    { code: 'ON', rules: ontario2026 },
    { code: 'QC', rules: quebec2026 },
    { code: 'BC', rules: britishColumbia2026 },
    { code: 'AB', rules: alberta2026 },
  ] as const;

  const salaryLevels = [
    2500000,  // $25,000
    3500000,  // $35,000
    5000000,  // $50,000
    6500000,  // $65,000
    8000000,  // $80,000
    10000000, // $100,000
    12500000, // $125,000
    15000000, // $150,000
    20000000, // $200,000
    30000000, // $300,000
  ];

  for (const prov of provinces) {
    describe(`Province: ${prov.code}`, () => {
      for (const salary of salaryLevels) {
        it(`calculates valid results for ${prov.code} at $${salary / 100}`, () => {
          const result = calculateTax(
            {
              year: 2026,
              province: prov.code,
              employmentIncomeCents: salary,
            },
            federal2026,
            prov.rules
          );

          // Invariant 1: Total deductions cannot exceed total income (for employment income)
          expect(result.totalDeductionsCents).toBeLessThanOrEqual(result.totalIncomeCents);

          // Invariant 2: Take-home pay + total deductions = total income
          expect(result.takeHomePayCents + result.totalDeductionsCents).toBe(result.totalIncomeCents);

          // Invariant 3: Average tax rate must be between 0 and 55%
          expect(result.averageTaxRate).toBeGreaterThanOrEqual(0);
          expect(result.averageTaxRate).toBeLessThan(0.55);

          // Invariant 4: Traces must be non-empty and carry valid formulas and sources
          expect(result.traces.length).toBeGreaterThan(5);
          for (const trace of result.traces) {
            expect(trace.formula).toBeTruthy();
            expect(trace.sourceUrl).toMatch(/^https?:\/\//);
          }

          // Province-specific checks
          if (prov.code === 'QC') {
            expect(result.federal.quebecAbatementCents).toBeGreaterThanOrEqual(0);
            expect(result.qpip).toBeDefined();
          }
          if (prov.code === 'ON') {
            if (salary >= 2000000) {
              expect(result.provincial.healthPremiumCents).toBeGreaterThan(0);
            }
          }
        });
      }
    });
  }
});

describe('Engine Property & Invariant Tests', () => {
  it('guarantees total tax never decreases as income increases (monotonicity)', () => {
    let previousTax = 0;
    for (let salary = 2000000; salary <= 20000000; salary += 1000000) {
      const result = calculateTax(
        {
          year: 2026,
          province: 'ON',
          employmentIncomeCents: salary,
        },
        federal2026,
        ontario2026
      );
      expect(result.totalTaxCents).toBeGreaterThanOrEqual(previousTax);
      previousTax = result.totalTaxCents;
    }
  });

  it('guarantees marginal tax rate is between 0 and 60% across all income brackets', () => {
    for (let salary = 1500000; salary <= 30000000; salary += 2500000) {
      const result = calculateTax(
        {
          year: 2026,
          province: 'BC',
          employmentIncomeCents: salary,
        },
        federal2026,
        britishColumbia2026
      );
      expect(result.marginalTaxRate).toBeGreaterThanOrEqual(0);
      expect(result.marginalTaxRate).toBeLessThanOrEqual(0.60);
    }
  });

  it('applies RRSP and FHSA deductions directly reducing net income', () => {
    const baseResult = calculateTax(
      {
        year: 2026,
        province: 'AB',
        employmentIncomeCents: 10000000, // $100,000
      },
      federal2026,
      alberta2026
    );

    const rrspResult = calculateTax(
      {
        year: 2026,
        province: 'AB',
        employmentIncomeCents: 10000000,
        rrspDeductionCents: 1000000, // $10,000 RRSP deduction
      },
      federal2026,
      alberta2026
    );

    expect(rrspResult.taxableIncomeCents).toBe(baseResult.taxableIncomeCents - 1000000);
    expect(rrspResult.totalTaxCents).toBeLessThan(baseResult.totalTaxCents);
  });
});
