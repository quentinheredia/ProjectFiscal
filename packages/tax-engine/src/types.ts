export type SupportedProvince = 'ON' | 'QC' | 'BC' | 'AB';

export interface TaxCalculationInput {
  year: number;
  province: SupportedProvince;
  employmentIncomeCents: number;
  selfEmploymentIncomeCents?: number;
  rrspDeductionCents?: number;
  fhsaDeductionCents?: number;
}

export interface ExplanationTraceItem {
  id: string;
  category: 'income' | 'cpp_ei' | 'federal' | 'provincial' | 'summary';
  titleEn: string;
  titleFr: string;
  formReference?: string;
  formula: string;
  amountCents: number;
  sourceUrl: string;
  notes?: string;
}

// Parts of a calculation the engine does not model yet; the result is still returned.
export type CalculationLimitation = 'QC_SELF_EMPLOYMENT_NOT_MODELLED';

export interface PensionContributions {
  plan: 'CPP' | 'QPP';
  employeeFirstTierCents: number;
  employeeSecondTierCents: number;
  selfEmployedFirstTierCents: number;
  selfEmployedSecondTierCents: number;
  totalCents: number;
  baseCreditableCents: number; // T1 lines 30800 + 31000
  enhancedEmploymentDeductionCents: number; // T1 line 22215 (TP-1 line 248 in Quebec)
  selfEmployedDeductionCents: number; // T1 line 22200
}

export interface TaxCalculationResult {
  inputs: TaxCalculationInput;
  totalIncomeCents: number;
  cpp: PensionContributions;
  ei: {
    employeeCents: number;
    totalCents: number;
  };
  qpip?: {
    employeeCents: number;
    selfEmployedCents: number;
    totalCents: number;
  };
  netIncomeCents: number;
  taxableIncomeCents: number;
  federal: {
    taxOnTaxableIncomeCents: number;
    bpaAmountCents: number;
    creditAmountsCents: number; // sum of amounts before the credit rate
    nonRefundableCreditsCents: number;
    basicFederalTaxCents: number;
    quebecAbatementCents: number;
    netFederalTaxCents: number;
  };
  provincial: {
    jurisdiction: string;
    taxableIncomeCents: number;
    taxOnTaxableIncomeCents: number;
    nonRefundableCreditsCents: number;
    basicProvincialTaxCents: number;
    surtaxCents?: number;
    taxReductionCents?: number;
    liftCreditCents?: number;
    healthPremiumCents?: number;
    netProvincialTaxCents: number;
  };
  totalTaxCents: number;
  totalDeductionsCents: number; // CPP/QPP + EI + QPIP + federal tax + provincial tax
  takeHomePayCents: number; // total income - total deductions
  averageTaxRate: number; // total tax / total income
  marginalTaxRate: number; // combined marginal tax rate on the next $100 of employment income
  limitations: CalculationLimitation[];
  traces: ExplanationTraceItem[];
}
