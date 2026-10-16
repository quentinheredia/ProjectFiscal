import { FederalRuleSet, ProvincialRuleSet } from '@fiscal-insights/tax-data';

export interface TaxCalculationInput {
  year: number;
  province: 'ON' | 'QC' | 'BC' | 'AB';
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

export interface TaxCalculationResult {
  inputs: TaxCalculationInput;
  totalIncomeCents: number;
  cpp: {
    baseEmployeeCents: number;
    enhancedEmployeeCents: number;
    baseSelfEmployedCents: number;
    enhancedSelfEmployedCents: number;
    totalCents: number;
    deductiblePortionCents: number; // Enhanced portion is deducted on Line 22215
  };
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
    grossTaxCents: number;
    bpaCreditCents: number;
    ceaCreditCents: number;
    cppCreditCents: number;
    eiCreditCents: number;
    totalCreditsCents: number;
    basicFederalTaxCents: number;
    quebecAbatementCents: number;
    netFederalTaxCents: number;
  };
  provincial: {
    jurisdiction: string;
    grossTaxCents: number;
    bpaCreditCents: number;
    cppCreditCents: number;
    eiCreditCents: number;
    totalCreditsCents: number;
    basicProvincialTaxCents: number;
    surtaxCents?: number;
    healthPremiumCents?: number;
    lowIncomeReductionCents?: number;
    netProvincialTaxCents: number;
  };
  totalTaxCents: number;
  totalDeductionsCents: number; // CPP + EI + QPIP + Federal Tax + Provincial Tax
  takeHomePayCents: number; // Total Income - Total Deductions
  averageTaxRate: number; // total tax / total income
  marginalTaxRate: number; // combined marginal tax rate
  traces: ExplanationTraceItem[];
}
