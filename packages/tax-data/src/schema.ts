import { z } from 'zod';

// Every figure carries the URL of the page or form that lists it and the date it was read.
// Unknown values must not be guessed: leave them null with a TODO in draft data. The schemas
// below reject null everywhere, so a rule set cannot validate (or ship) until it is resolved.
export const AuditedValueSchema = <T extends z.ZodTypeAny>(valueType: T) =>
  z.object({
    value: valueType,
    source: z.string().url('Source must be a valid official URL'),
    retrieved: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Retrieved date must be YYYY-MM-DD'),
    notes: z.string().optional(),
  });

export type AuditedValue<T> = {
  value: T;
  source: string;
  retrieved: string;
  notes?: string;
};

const CentsSchema = z.number().int().nonnegative();
const PositiveCentsSchema = z.number().int().positive();
// The engine multiplies with integer micros, so rates may carry at most six decimals.
const RateSchema = z
  .number()
  .min(0)
  .max(1)
  .refine((rate) => Math.abs(rate * 1e6 - Math.round(rate * 1e6)) < 1e-6, 'Rate must have at most 6 decimals');

const JURISDICTIONS = ['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'] as const;
export const JurisdictionSchema = z.enum(JURISDICTIONS);
export type Jurisdiction = z.infer<typeof JurisdictionSchema>;

export const TaxBracketSchema = z.object({
  // Omitted on the top bracket only, which has no upper limit.
  upToCents: AuditedValueSchema(PositiveCentsSchema).optional(),
  rate: AuditedValueSchema(RateSchema),
});
export type TaxBracket = z.infer<typeof TaxBracketSchema>;

const BracketsSchema = z
  .array(TaxBracketSchema)
  .min(1)
  .superRefine((brackets, ctx) => {
    let previousUpTo = 0;
    brackets.forEach((bracket, index) => {
      const isTop = index === brackets.length - 1;
      if (isTop && bracket.upToCents) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'upToCents'], message: 'Top bracket must not have an upper limit' });
      }
      if (!isTop && !bracket.upToCents) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'upToCents'], message: 'Only the top bracket may omit upToCents' });
      }
      if (bracket.upToCents) {
        if (bracket.upToCents.value <= previousUpTo) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [index, 'upToCents'], message: 'Bracket thresholds must increase' });
        }
        previousUpTo = bracket.upToCents.value;
      }
    });
  });

// CPP outside Quebec, QPP in Quebec. Employee rates are one share; the self-employed pay both.
export const PensionPlanSchema = z
  .object({
    basicExemptionCents: AuditedValueSchema(PositiveCentsSchema),
    maxPensionableEarningsCents: AuditedValueSchema(PositiveCentsSchema), // YMPE
    additionalMaxPensionableEarningsCents: AuditedValueSchema(PositiveCentsSchema), // YAMPE
    baseEmployeeRate: AuditedValueSchema(RateSchema), // credited (T1 lines 30800 / 31000)
    firstAdditionalEmployeeRate: AuditedValueSchema(RateSchema), // deducted (T1 line 22215)
    secondAdditionalEmployeeRate: AuditedValueSchema(RateSchema), // deducted (T1 line 22215)
    selfEmployedFirstTierRate: AuditedValueSchema(RateSchema),
    selfEmployedSecondTierRate: AuditedValueSchema(RateSchema),
  })
  .superRefine((plan, ctx) => {
    const firstTier = plan.baseEmployeeRate.value + plan.firstAdditionalEmployeeRate.value;
    if (Math.abs(plan.selfEmployedFirstTierRate.value - 2 * firstTier) > 1e-9) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selfEmployedFirstTierRate'], message: 'Self-employed first-tier rate must equal both employee and employer shares' });
    }
    if (Math.abs(plan.selfEmployedSecondTierRate.value - 2 * plan.secondAdditionalEmployeeRate.value) > 1e-9) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['selfEmployedSecondTierRate'], message: 'Self-employed second-tier rate must equal both employee and employer shares' });
    }
  });
export type PensionPlan = z.infer<typeof PensionPlanSchema>;

export const FederalRuleSetSchema = z.object({
  year: z.number().int().min(2014).max(2030),
  brackets: BracketsSchema,
  nonRefundableCreditRate: AuditedValueSchema(RateSchema),
  bpa: z.object({
    maxCents: AuditedValueSchema(PositiveCentsSchema),
    minCents: AuditedValueSchema(PositiveCentsSchema),
    phaseOutStartCents: AuditedValueSchema(PositiveCentsSchema),
    phaseOutEndCents: AuditedValueSchema(PositiveCentsSchema),
  }),
  canadaEmploymentAmountMaxCents: AuditedValueSchema(PositiveCentsSchema),
  cpp: PensionPlanSchema,
  ei: z.object({
    maxInsurableEarningsCents: AuditedValueSchema(PositiveCentsSchema),
    rate: AuditedValueSchema(RateSchema),
    quebecRate: AuditedValueSchema(RateSchema),
  }),
});
export type FederalRuleSet = z.infer<typeof FederalRuleSetSchema>;

// One tier of the Ontario Health Premium: over `overCents` of taxable income the premium is
// baseCents + rate x (income - overCents), up to capCents (T4127 factor V2, ON428 chart).
export const OntarioHealthPremiumTierSchema = z.object({
  overCents: CentsSchema,
  baseCents: CentsSchema,
  rate: RateSchema,
  capCents: CentsSchema,
});
export type OntarioHealthPremiumTier = z.infer<typeof OntarioHealthPremiumTierSchema>;

export const ProvincialRuleSetSchema = z
  .object({
    year: z.number().int().min(2014).max(2030),
    jurisdiction: JurisdictionSchema,
    brackets: BracketsSchema,
    nonRefundableCreditRate: AuditedValueSchema(RateSchema),
    basicPersonalAmountCents: AuditedValueSchema(PositiveCentsSchema),
    ontarioSurtax: z
      .object({
        tier1ThresholdCents: AuditedValueSchema(PositiveCentsSchema),
        tier1Rate: AuditedValueSchema(RateSchema),
        tier2ThresholdCents: AuditedValueSchema(PositiveCentsSchema),
        tier2Rate: AuditedValueSchema(RateSchema),
      })
      .optional(),
    ontarioTaxReduction: z
      .object({
        basicReductionCents: AuditedValueSchema(PositiveCentsSchema),
      })
      .optional(),
    ontarioLift: z
      .object({
        maxCreditCents: AuditedValueSchema(PositiveCentsSchema),
        employmentIncomeRate: AuditedValueSchema(RateSchema),
        incomeThresholdCents: AuditedValueSchema(PositiveCentsSchema),
        phaseOutRate: AuditedValueSchema(RateSchema),
      })
      .optional(),
    ontarioHealthPremium: z
      .object({
        tiers: AuditedValueSchema(z.array(OntarioHealthPremiumTierSchema).min(1)),
      })
      .optional(),
    bcTaxReduction: z
      .object({
        basicReductionCents: AuditedValueSchema(PositiveCentsSchema),
        phaseOutStartCents: AuditedValueSchema(PositiveCentsSchema),
        phaseOutRate: AuditedValueSchema(RateSchema),
      })
      .optional(),
    quebec: z
      .object({
        federalAbatementRate: AuditedValueSchema(RateSchema),
        deductionForWorkers: z.object({
          rate: AuditedValueSchema(RateSchema),
          maxCents: AuditedValueSchema(PositiveCentsSchema),
        }),
        qpp: PensionPlanSchema,
        qpip: z.object({
          maxInsurableEarningsCents: AuditedValueSchema(PositiveCentsSchema),
          employeeRate: AuditedValueSchema(RateSchema),
          selfEmployedRate: AuditedValueSchema(RateSchema),
        }),
      })
      .optional(),
  })
  .superRefine((rules, ctx) => {
    const onlyFor = (key: keyof typeof rules, jurisdiction: Jurisdiction) => {
      if (rules[key] !== undefined && rules.jurisdiction !== jurisdiction) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${String(key)} only applies to ${jurisdiction}` });
      }
    };
    onlyFor('ontarioSurtax', 'ON');
    onlyFor('ontarioTaxReduction', 'ON');
    onlyFor('ontarioLift', 'ON');
    onlyFor('ontarioHealthPremium', 'ON');
    onlyFor('bcTaxReduction', 'BC');
    onlyFor('quebec', 'QC');
    if (rules.jurisdiction === 'QC' && !rules.quebec) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quebec'], message: 'Quebec rule sets need QPP, QPIP, abatement and deduction-for-workers data' });
    }
  });
export type ProvincialRuleSet = z.infer<typeof ProvincialRuleSetSchema>;

export const TestVectorSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  year: z.number().int(),
  province: z.enum(['ON', 'QC', 'BC', 'AB']),
  inputs: z.object({
    employmentIncomeCents: CentsSchema.default(0),
    selfEmploymentIncomeCents: CentsSchema.default(0),
    rrspDeductionCents: CentsSchema.default(0),
    fhsaDeductionCents: CentsSchema.default(0),
  }),
  expected: z.object({
    totalIncomeCents: CentsSchema,
    netIncomeCents: CentsSchema,
    taxableIncomeCents: CentsSchema,
    federalTaxCents: CentsSchema,
    provincialTaxCents: CentsSchema,
    cppCents: CentsSchema,
    eiCents: CentsSchema,
    qpipCents: CentsSchema.optional(),
    totalDeductionsCents: CentsSchema,
    takeHomePayCents: CentsSchema,
  }),
  // Where the expected values come from, and the line-by-line arithmetic behind them.
  source: z.string().min(1),
  derivation: z.array(z.string().min(1)).min(1),
  toleranceCents: z.number().int().nonnegative().default(0),
});
export type TestVector = z.infer<typeof TestVectorSchema>;
export type TestVectorInput = z.input<typeof TestVectorSchema>;
