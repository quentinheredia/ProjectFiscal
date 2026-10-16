import { z } from 'zod';

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

export const TaxBracketSchema = z.object({
  upToCents: AuditedValueSchema(z.number().int().nonnegative().nullable()), // null indicates unlimited / top bracket
  rate: AuditedValueSchema(z.number().min(0).max(1)), // e.g. 0.14 for 14%
});
export type TaxBracket = z.infer<typeof TaxBracketSchema>;

export const FederalRuleSetSchema = z.object({
  year: z.number().int().min(2014).max(2030),
  brackets: z.array(TaxBracketSchema).min(1),
  bpa: z.object({
    maxCents: AuditedValueSchema(z.number().int().positive()),
    minCents: AuditedValueSchema(z.number().int().positive()),
    thresholdLowCents: AuditedValueSchema(z.number().int().positive()),
    thresholdHighCents: AuditedValueSchema(z.number().int().positive()),
    creditRate: AuditedValueSchema(z.number().min(0).max(1)),
  }),
  canadaEmploymentAmount: z.object({
    maxCents: AuditedValueSchema(z.number().int().positive()),
    rate: AuditedValueSchema(z.number().min(0).max(1)),
  }),
  cpp: z.object({
    basicExemptionCents: AuditedValueSchema(z.number().int().positive()),
    firstCeilingCents: AuditedValueSchema(z.number().int().positive()),
    secondCeilingCents: AuditedValueSchema(z.number().int().positive()),
    employeeRate: AuditedValueSchema(z.number().min(0).max(1)),
    secondEmployeeRate: AuditedValueSchema(z.number().min(0).max(1)),
    selfEmployedRate: AuditedValueSchema(z.number().min(0).max(1)),
    secondSelfEmployedRate: AuditedValueSchema(z.number().min(0).max(1)),
  }),
  ei: z.object({
    maxInsurableEarningsCents: AuditedValueSchema(z.number().int().positive()),
    rate: AuditedValueSchema(z.number().min(0).max(1)),
    quebecRate: AuditedValueSchema(z.number().min(0).max(1)),
  }),
});
export type FederalRuleSet = z.infer<typeof FederalRuleSetSchema>;

export const OntarioHealthPremiumTierSchema = z.object({
  thresholdCents: z.number().int().nonnegative(),
  baseAmountCents: z.number().int().nonnegative(),
  rateOnExcess: z.number().min(0).max(1),
  capCents: z.number().int().nonnegative(),
});
export type OntarioHealthPremiumTier = z.infer<typeof OntarioHealthPremiumTierSchema>;

export const ProvincialRuleSetSchema = z.object({
  year: z.number().int().min(2014).max(2030),
  jurisdiction: z.enum([
    'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU'
  ]),
  brackets: z.array(TaxBracketSchema).min(1),
  bpa: z.object({
    amountCents: AuditedValueSchema(z.number().int().positive()),
    creditRate: AuditedValueSchema(z.number().min(0).max(1)),
  }),
  // Optional provincial specifics
  ontarioSurtax: z.object({
    tier1ThresholdCents: AuditedValueSchema(z.number().int().positive()),
    tier1Rate: AuditedValueSchema(z.number().min(0).max(1)),
    tier2ThresholdCents: AuditedValueSchema(z.number().int().positive()),
    tier2Rate: AuditedValueSchema(z.number().min(0).max(1)),
  }).optional(),
  ontarioHealthPremium: z.object({
    tiers: z.array(OntarioHealthPremiumTierSchema),
    source: AuditedValueSchema(z.boolean()),
  }).optional(),
  bcTaxReduction: z.object({
    initialAmountCents: AuditedValueSchema(z.number().int().positive()),
    thresholdCents: AuditedValueSchema(z.number().int().positive()),
    phaseOutRate: AuditedValueSchema(z.number().min(0).max(1)),
  }).optional(),
  quebecAbatementRate: AuditedValueSchema(z.number().min(0).max(1)).optional(),
  qpp: z.object({
    basicExemptionCents: AuditedValueSchema(z.number().int().positive()),
    firstCeilingCents: AuditedValueSchema(z.number().int().positive()),
    secondCeilingCents: AuditedValueSchema(z.number().int().positive()),
    employeeRate: AuditedValueSchema(z.number().min(0).max(1)),
    secondEmployeeRate: AuditedValueSchema(z.number().min(0).max(1)),
    selfEmployedRate: AuditedValueSchema(z.number().min(0).max(1)),
    secondSelfEmployedRate: AuditedValueSchema(z.number().min(0).max(1)),
  }).optional(),
  qpip: z.object({
    maxInsurableEarningsCents: AuditedValueSchema(z.number().int().positive()),
    employeeRate: AuditedValueSchema(z.number().min(0).max(1)),
    selfEmployedRate: AuditedValueSchema(z.number().min(0).max(1)),
  }).optional(),
});
export type ProvincialRuleSet = z.infer<typeof ProvincialRuleSetSchema>;

export const TestVectorSchema = z.object({
  id: z.string(),
  description: z.string(),
  year: z.number().int(),
  province: z.enum(['ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU']),
  inputs: z.object({
    employmentIncomeCents: z.number().int().nonnegative().default(0),
    selfEmploymentIncomeCents: z.number().int().nonnegative().default(0),
    rrspDeductionCents: z.number().int().nonnegative().default(0),
    fhsaDeductionCents: z.number().int().nonnegative().default(0),
  }),
  expected: z.object({
    totalIncomeCents: z.number().int().nonnegative(),
    netIncomeCents: z.number().int().nonnegative(),
    taxableIncomeCents: z.number().int().nonnegative(),
    federalTaxCents: z.number().int().nonnegative(),
    provincialTaxCents: z.number().int().nonnegative(),
    cppCents: z.number().int().nonnegative(),
    eiCents: z.number().int().nonnegative(),
    qpipCents: z.number().int().nonnegative().optional(),
    totalDeductionsCents: z.number().int().nonnegative(),
    takeHomePayCents: z.number().int().nonnegative(),
  }),
  source: z.string(),
  toleranceCents: z.number().int().default(100), // $1 max difference allowed in verification
});
export type TestVector = z.infer<typeof TestVectorSchema>;
