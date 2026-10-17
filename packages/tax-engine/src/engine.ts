import {
  FederalRuleSet,
  OntarioHealthPremiumTier,
  PensionPlan,
  ProvincialRuleSet,
  TaxBracket,
} from '@fiscal-insights/tax-data';
import {
  CalculationLimitation,
  ExplanationTraceItem,
  PensionContributions,
  TaxCalculationInput,
  TaxCalculationResult,
} from './types';

const MICROS = 1_000_000;
const MARGINAL_RATE_STEP_CENTS = 10000; // $100 of extra employment income

const CRA_LINE_URLS = {
  totalIncome: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-15000-total-income.html',
  taxableIncome: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-26000-taxable-income.html',
  netFederalTax: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-42000-net-federal-tax.html',
};

export function formatCentsToDollars(cents: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

const formatRate = (rate: number) => `${Number((rate * 100).toFixed(4))}%`;

// Rounds numerator / denominator half-up; both are non-negative integers.
function divideRoundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((2 * numerator + denominator) / (2 * denominator));
}

const toMicros = (rate: number) => Math.round(rate * MICROS);

// cents x rate, exact in integer micros and rounded half-up once, like the forms.
function applyRate(cents: number, rate: number): number {
  return divideRoundHalfUp(cents * toMicros(rate), MICROS);
}

interface BracketPortion {
  fromCents: number;
  taxableCents: number;
  rate: number;
  taxCents: number;
}

// Sums every bracket exactly and rounds once, matching the "(income - threshold) x rate +
// constant" layout of the T1 and provincial forms.
function calculateBracketTax(taxableIncomeCents: number, brackets: TaxBracket[]) {
  const portions: BracketPortion[] = [];
  let lowerCents = 0;
  let exactTotal = 0;
  for (const bracket of brackets) {
    if (taxableIncomeCents <= lowerCents) break;
    const upperCents = bracket.upToCents?.value ?? taxableIncomeCents;
    const taxableCents = Math.min(taxableIncomeCents, upperCents) - lowerCents;
    const exactTax = taxableCents * toMicros(bracket.rate.value);
    exactTotal += exactTax;
    portions.push({
      fromCents: lowerCents,
      taxableCents,
      rate: bracket.rate.value,
      taxCents: divideRoundHalfUp(exactTax, MICROS),
    });
    lowerCents = upperCents;
  }
  return { totalCents: divideRoundHalfUp(exactTotal, MICROS), portions };
}

// CPP (or QPP) on employment and self-employment income. The base part of the employee share
// is credited; the first and second additional parts are deducted from income.
function calculatePensionContributions(
  employmentCents: number,
  selfEmploymentCents: number,
  plan: PensionPlan,
  planName: 'CPP' | 'QPP'
): PensionContributions {
  const exemption = plan.basicExemptionCents.value;
  const ympe = plan.maxPensionableEarningsCents.value;
  const yampe = plan.additionalMaxPensionableEarningsCents.value;
  const baseMicros = toMicros(plan.baseEmployeeRate.value);
  const firstTierMicros = baseMicros + toMicros(plan.firstAdditionalEmployeeRate.value);

  const employeeFirstTierEarnings = Math.max(0, Math.min(employmentCents, ympe) - exemption);
  const employeeFirstTierCents = divideRoundHalfUp(employeeFirstTierEarnings * firstTierMicros, MICROS);
  const employeeSecondTierCents = applyRate(
    Math.max(0, Math.min(employmentCents, yampe) - ympe),
    plan.secondAdditionalEmployeeRate.value
  );
  const employeeBaseCents = divideRoundHalfUp(employeeFirstTierCents * baseMicros, firstTierMicros);

  // Self-employment earnings use whatever exemption and ceilings employment left unused.
  const combinedCents = employmentCents + selfEmploymentCents;
  const selfEmployedFirstTierEarnings =
    Math.max(0, Math.min(combinedCents, ympe) - exemption) - employeeFirstTierEarnings;
  const selfEmployedSecondTierEarnings = Math.max(0, Math.min(combinedCents, yampe) - Math.max(employmentCents, ympe));
  const selfEmployedFirstTierCents = applyRate(selfEmployedFirstTierEarnings, plan.selfEmployedFirstTierRate.value);
  const selfEmployedSecondTierCents = applyRate(selfEmployedSecondTierEarnings, plan.selfEmployedSecondTierRate.value);
  // Only the base part of the employee half is credited (line 31000); the employer half and
  // every additional contribution are deducted (line 22200).
  const selfEmployedBaseCents = divideRoundHalfUp(selfEmployedFirstTierCents * baseMicros, 2 * firstTierMicros);

  return {
    plan: planName,
    employeeFirstTierCents,
    employeeSecondTierCents,
    selfEmployedFirstTierCents,
    selfEmployedSecondTierCents,
    totalCents: employeeFirstTierCents + employeeSecondTierCents + selfEmployedFirstTierCents + selfEmployedSecondTierCents,
    baseCreditableCents: employeeBaseCents + selfEmployedBaseCents,
    enhancedEmploymentDeductionCents: employeeFirstTierCents - employeeBaseCents + employeeSecondTierCents,
    selfEmployedDeductionCents: selfEmployedFirstTierCents - selfEmployedBaseCents + selfEmployedSecondTierCents,
  };
}

function calculateFederalBpa(netIncomeCents: number, bpa: FederalRuleSet['bpa']): number {
  const start = bpa.phaseOutStartCents.value;
  const end = bpa.phaseOutEndCents.value;
  if (netIncomeCents <= start) return bpa.maxCents.value;
  if (netIncomeCents >= end) return bpa.minCents.value;
  const reducible = bpa.maxCents.value - bpa.minCents.value;
  return bpa.maxCents.value - divideRoundHalfUp(reducible * (netIncomeCents - start), end - start);
}

function calculateOntarioHealthPremium(taxableIncomeCents: number, tiers: OntarioHealthPremiumTier[]): number {
  let premiumCents = 0;
  for (const tier of tiers) {
    if (taxableIncomeCents > tier.overCents) {
      premiumCents = Math.min(tier.capCents, tier.baseCents + applyRate(taxableIncomeCents - tier.overCents, tier.rate));
    }
  }
  return premiumCents;
}

export function calculateTax(
  input: TaxCalculationInput,
  fedRules: FederalRuleSet,
  provRules: ProvincialRuleSet,
  options: { computeMarginalRate?: boolean; includeTraces?: boolean } = {}
): TaxCalculationResult {
  const { computeMarginalRate = true, includeTraces = true } = options;
  const traces: ExplanationTraceItem[] = [];
  const trace = (item: ExplanationTraceItem) => {
    if (includeTraces) traces.push(item);
  };
  const limitations: CalculationLimitation[] = [];

  const employmentCents = Math.max(0, input.employmentIncomeCents);
  const selfEmploymentCents = Math.max(0, input.selfEmploymentIncomeCents ?? 0);
  const rrspCents = Math.max(0, input.rrspDeductionCents ?? 0);
  const fhsaCents = Math.max(0, input.fhsaDeductionCents ?? 0);
  const totalIncomeCents = employmentCents + selfEmploymentCents;
  const quebec = provRules.quebec;
  if (quebec && selfEmploymentCents > 0) limitations.push('QC_SELF_EMPLOYMENT_NOT_MODELLED');

  trace({
    id: 'total_income',
    category: 'income',
    titleEn: 'Total Income',
    titleFr: 'Revenu total',
    formReference: 'Line 15000',
    formula: `${formatCentsToDollars(employmentCents)} (employment) + ${formatCentsToDollars(selfEmploymentCents)} (self-employment)`,
    amountCents: totalIncomeCents,
    sourceUrl: CRA_LINE_URLS.totalIncome,
  });

  // --- CPP / QPP ---
  const plan = quebec ? quebec.qpp : fedRules.cpp;
  const planName = quebec ? 'QPP' : 'CPP';
  const pension = calculatePensionContributions(employmentCents, selfEmploymentCents, plan, planName);
  const firstTierRate = plan.baseEmployeeRate.value + plan.firstAdditionalEmployeeRate.value;

  trace({
    id: 'cpp_base',
    category: 'cpp_ei',
    titleEn: quebec ? 'QPP Contributions' : 'CPP Contributions',
    titleFr: quebec ? 'Cotisations au RRQ' : 'Cotisations au RPC',
    formReference: 'Schedule 8 / Lines 30800, 31000',
    formula: `${formatRate(firstTierRate)} on employment earnings between ${formatCentsToDollars(plan.basicExemptionCents.value)} and ${formatCentsToDollars(plan.maxPensionableEarningsCents.value)} (${formatRate(plan.selfEmployedFirstTierRate.value)} if self-employed); base part credited: ${formatCentsToDollars(pension.baseCreditableCents)}`,
    amountCents: pension.employeeFirstTierCents + pension.selfEmployedFirstTierCents,
    sourceUrl: plan.baseEmployeeRate.source,
  });
  if (pension.employeeSecondTierCents + pension.selfEmployedSecondTierCents > 0) {
    trace({
      id: 'cpp_enhanced',
      category: 'cpp_ei',
      titleEn: quebec ? 'QPP Second Additional Contribution' : 'CPP2 Second Additional Contribution',
      titleFr: quebec ? 'Deuxième cotisation supplémentaire au RRQ' : 'Deuxième cotisation supplémentaire au RPC (RPC2)',
      formReference: 'Line 22215',
      formula: `${formatRate(plan.secondAdditionalEmployeeRate.value)} on earnings between ${formatCentsToDollars(plan.maxPensionableEarningsCents.value)} and ${formatCentsToDollars(plan.additionalMaxPensionableEarningsCents.value)}`,
      amountCents: pension.employeeSecondTierCents + pension.selfEmployedSecondTierCents,
      sourceUrl: plan.secondAdditionalEmployeeRate.source,
    });
  }

  // --- EI & QPIP ---
  const ei = fedRules.ei;
  const eiRate = quebec ? ei.quebecRate.value : ei.rate.value;
  const eiInsurableCents = Math.min(employmentCents, ei.maxInsurableEarningsCents.value);
  const eiEmployeeCents = applyRate(eiInsurableCents, eiRate);
  trace({
    id: 'ei_contribution',
    category: 'cpp_ei',
    titleEn: 'Employment Insurance (EI)',
    titleFr: 'Assurance-emploi (AE)',
    formReference: 'Line 31200',
    formula: `${formatCentsToDollars(eiInsurableCents)} x ${formatRate(eiRate)}`,
    amountCents: eiEmployeeCents,
    sourceUrl: quebec ? ei.quebecRate.source : ei.rate.source,
  });

  let qpipEmployeeCents = 0;
  let qpipSelfEmployedCents = 0;
  if (quebec) {
    const qpip = quebec.qpip;
    const maxInsurable = qpip.maxInsurableEarningsCents.value;
    const employeeInsurable = Math.min(employmentCents, maxInsurable);
    qpipEmployeeCents = applyRate(employeeInsurable, qpip.employeeRate.value);
    qpipSelfEmployedCents = applyRate(
      Math.min(selfEmploymentCents, maxInsurable - employeeInsurable),
      qpip.selfEmployedRate.value
    );
    trace({
      id: 'qpip_contribution',
      category: 'cpp_ei',
      titleEn: 'Quebec Parental Insurance Plan (QPIP)',
      titleFr: 'Régime québécois d’assurance parentale (RQAP)',
      formReference: 'Line 31205',
      formula: `${formatCentsToDollars(employeeInsurable)} x ${formatRate(qpip.employeeRate.value)}`,
      amountCents: qpipEmployeeCents + qpipSelfEmployedCents,
      sourceUrl: qpip.employeeRate.source,
    });
  }

  // --- Net and taxable income (T1 lines 20800, 20805, 22200, 22215) ---
  const federalDeductionsCents =
    pension.enhancedEmploymentDeductionCents + pension.selfEmployedDeductionCents + rrspCents + fhsaCents;
  const netIncomeCents = Math.max(0, totalIncomeCents - federalDeductionsCents);
  const taxableIncomeCents = netIncomeCents;
  trace({
    id: 'taxable_income',
    category: 'income',
    titleEn: 'Taxable Income',
    titleFr: 'Revenu imposable',
    formReference: 'Line 26000',
    formula: `${formatCentsToDollars(totalIncomeCents)} - ${formatCentsToDollars(pension.enhancedEmploymentDeductionCents + pension.selfEmployedDeductionCents)} ${planName} deductions - ${formatCentsToDollars(rrspCents + fhsaCents)} RRSP/FHSA`,
    amountCents: taxableIncomeCents,
    sourceUrl: CRA_LINE_URLS.taxableIncome,
  });

  // --- Federal tax ---
  const federalBrackets = calculateBracketTax(taxableIncomeCents, fedRules.brackets);
  federalBrackets.portions.forEach((portion, index) => {
    trace({
      id: `federal_bracket_${index + 1}`,
      category: 'federal',
      titleEn: `Federal Bracket ${index + 1} (${formatRate(portion.rate)})`,
      titleFr: `Palier fédéral ${index + 1} (${formatRate(portion.rate)})`,
      formReference: 'Step 5, Part A',
      formula: `${formatCentsToDollars(portion.taxableCents)} x ${formatRate(portion.rate)} = ${formatCentsToDollars(portion.taxCents)}`,
      amountCents: portion.taxCents,
      sourceUrl: fedRules.brackets[index]!.rate.source,
    });
  });

  const creditRate = fedRules.nonRefundableCreditRate.value;
  const bpaAmountCents = calculateFederalBpa(netIncomeCents, fedRules.bpa);
  const ceaCents = Math.min(employmentCents, fedRules.canadaEmploymentAmountMaxCents.value);
  const federalCreditAmountsCents = bpaAmountCents + ceaCents + pension.baseCreditableCents + eiEmployeeCents + qpipEmployeeCents;
  const federalCreditsCents = applyRate(federalCreditAmountsCents, creditRate);
  trace({
    id: 'federal_credits',
    category: 'federal',
    titleEn: 'Federal Non-Refundable Credits',
    titleFr: 'Crédits d’impôt non remboursables fédéraux',
    formReference: 'Lines 30000-33800',
    formula: `(${formatCentsToDollars(bpaAmountCents)} BPA + ${formatCentsToDollars(ceaCents)} Canada employment + ${formatCentsToDollars(pension.baseCreditableCents)} base ${planName} + ${formatCentsToDollars(eiEmployeeCents)} EI${quebec ? ` + ${formatCentsToDollars(qpipEmployeeCents)} QPIP` : ''}) x ${formatRate(creditRate)}`,
    amountCents: federalCreditsCents,
    sourceUrl: fedRules.bpa.maxCents.source,
  });

  const basicFederalTaxCents = Math.max(0, federalBrackets.totalCents - federalCreditsCents);
  const quebecAbatementCents = quebec ? applyRate(basicFederalTaxCents, quebec.federalAbatementRate.value) : 0;
  if (quebec) {
    trace({
      id: 'quebec_abatement',
      category: 'federal',
      titleEn: 'Refundable Quebec Abatement',
      titleFr: 'Abattement remboursable du Québec',
      formReference: 'Line 44000',
      formula: `${formatCentsToDollars(basicFederalTaxCents)} x ${formatRate(quebec.federalAbatementRate.value)}`,
      amountCents: quebecAbatementCents,
      sourceUrl: quebec.federalAbatementRate.source,
    });
  }
  const netFederalTaxCents = basicFederalTaxCents - quebecAbatementCents;
  trace({
    id: 'net_federal_tax',
    category: 'federal',
    titleEn: 'Net Federal Tax',
    titleFr: 'Impôt fédéral net',
    formReference: 'Line 42000',
    formula: `${formatCentsToDollars(federalBrackets.totalCents)} - ${formatCentsToDollars(federalCreditsCents)} credits${quebec ? ` - ${formatCentsToDollars(quebecAbatementCents)} abatement` : ''}`,
    amountCents: netFederalTaxCents,
    sourceUrl: CRA_LINE_URLS.netFederalTax,
  });

  // --- Provincial tax ---
  const jurisdiction = provRules.jurisdiction;
  let provincialTaxableCents = taxableIncomeCents;
  if (quebec) {
    // TP-1015.F-V: I = gross - RRSP/FHSA - deduction for workers - additional QPP contributions.
    const workers = quebec.deductionForWorkers;
    const workersDeductionCents = Math.min(applyRate(employmentCents, workers.rate.value), workers.maxCents.value);
    provincialTaxableCents = Math.max(
      0,
      totalIncomeCents - workersDeductionCents - pension.enhancedEmploymentDeductionCents - rrspCents - fhsaCents
    );
    trace({
      id: 'quebec_taxable_income',
      category: 'provincial',
      titleEn: 'Quebec Taxable Income',
      titleFr: 'Revenu imposable du Québec',
      formReference: 'TP-1 lines 201, 248, 299',
      formula: `${formatCentsToDollars(totalIncomeCents)} - ${formatCentsToDollars(workersDeductionCents)} deduction for workers - ${formatCentsToDollars(pension.enhancedEmploymentDeductionCents)} additional QPP - ${formatCentsToDollars(rrspCents + fhsaCents)} RRSP/FHSA`,
      amountCents: provincialTaxableCents,
      sourceUrl: workers.rate.source,
    });
  }

  const provincialBrackets = calculateBracketTax(provincialTaxableCents, provRules.brackets);
  provincialBrackets.portions.forEach((portion, index) => {
    trace({
      id: `provincial_bracket_${index + 1}`,
      category: 'provincial',
      titleEn: `${jurisdiction} Bracket ${index + 1} (${formatRate(portion.rate)})`,
      titleFr: `${jurisdiction} Palier ${index + 1} (${formatRate(portion.rate)})`,
      formReference: quebec ? 'TP-1 line 401' : `Form ${jurisdiction}428`,
      formula: `${formatCentsToDollars(portion.taxableCents)} x ${formatRate(portion.rate)} = ${formatCentsToDollars(portion.taxCents)}`,
      amountCents: portion.taxCents,
      sourceUrl: provRules.brackets[index]!.rate.source,
    });
  });

  // Quebec credits only the personal amounts; elsewhere base CPP and EI are credited too.
  const provincialCreditAmountsCents =
    provRules.basicPersonalAmountCents.value + (quebec ? 0 : pension.baseCreditableCents + eiEmployeeCents);
  const provincialCreditRate = provRules.nonRefundableCreditRate.value;
  const provincialCreditsCents = applyRate(provincialCreditAmountsCents, provincialCreditRate);
  trace({
    id: 'provincial_credits',
    category: 'provincial',
    titleEn: `${jurisdiction} Non-Refundable Credits`,
    titleFr: `Crédits d’impôt non remboursables (${jurisdiction})`,
    formReference: quebec ? 'TP-1 line 350' : `Form ${jurisdiction}428, Part B`,
    formula: quebec
      ? `${formatCentsToDollars(provRules.basicPersonalAmountCents.value)} basic personal amount x ${formatRate(provincialCreditRate)}`
      : `(${formatCentsToDollars(provRules.basicPersonalAmountCents.value)} BPA + ${formatCentsToDollars(pension.baseCreditableCents)} base CPP + ${formatCentsToDollars(eiEmployeeCents)} EI) x ${formatRate(provincialCreditRate)}`,
    amountCents: provincialCreditsCents,
    sourceUrl: provRules.basicPersonalAmountCents.source,
  });

  const basicProvincialTaxCents = Math.max(0, provincialBrackets.totalCents - provincialCreditsCents);
  let provincialTaxCents = basicProvincialTaxCents;
  let surtaxCents = 0;
  let taxReductionCents = 0;
  let liftCreditCents = 0;
  let healthPremiumCents = 0;

  if (provRules.ontarioSurtax) {
    const surtax = provRules.ontarioSurtax;
    const tier1 = surtax.tier1ThresholdCents.value;
    const tier2 = surtax.tier2ThresholdCents.value;
    surtaxCents =
      applyRate(Math.max(0, basicProvincialTaxCents - tier1), surtax.tier1Rate.value) +
      applyRate(Math.max(0, basicProvincialTaxCents - tier2), surtax.tier2Rate.value);
    provincialTaxCents += surtaxCents;
    if (surtaxCents > 0) {
      trace({
        id: 'ontario_surtax',
        category: 'provincial',
        titleEn: 'Ontario Surtax',
        titleFr: 'Surtaxe de l’Ontario',
        formReference: 'Form ON428, lines 63-68',
        formula: `${formatRate(surtax.tier1Rate.value)} of basic tax over ${formatCentsToDollars(tier1)} + ${formatRate(surtax.tier2Rate.value)} over ${formatCentsToDollars(tier2)}`,
        amountCents: surtaxCents,
        sourceUrl: surtax.tier1ThresholdCents.source,
      });
    }
  }

  if (provRules.ontarioTaxReduction) {
    const basicReduction = provRules.ontarioTaxReduction.basicReductionCents;
    taxReductionCents = Math.min(provincialTaxCents, Math.max(0, 2 * basicReduction.value - provincialTaxCents));
    provincialTaxCents -= taxReductionCents;
    if (taxReductionCents > 0) {
      trace({
        id: 'ontario_tax_reduction',
        category: 'provincial',
        titleEn: 'Ontario Tax Reduction',
        titleFr: 'Réduction d’impôt de l’Ontario',
        formReference: 'Form ON428, lines 74-80',
        formula: `2 x ${formatCentsToDollars(basicReduction.value)} - Ontario tax before reduction`,
        amountCents: taxReductionCents,
        sourceUrl: basicReduction.source,
      });
    }
  }

  if (provRules.ontarioLift) {
    const lift = provRules.ontarioLift;
    const maximumCents = Math.min(lift.maxCreditCents.value, applyRate(employmentCents, lift.employmentIncomeRate.value));
    const clawbackCents = applyRate(Math.max(0, netIncomeCents - lift.incomeThresholdCents.value), lift.phaseOutRate.value);
    liftCreditCents = Math.min(provincialTaxCents, Math.max(0, maximumCents - clawbackCents));
    provincialTaxCents -= liftCreditCents;
    if (liftCreditCents > 0) {
      trace({
        id: 'ontario_lift_credit',
        category: 'provincial',
        titleEn: 'Low-income Individuals and Families Tax (LIFT) Credit',
        titleFr: 'Crédit d’impôt pour les personnes et les familles à faible revenu (CIPFR)',
        formReference: 'Schedule ON428-A, line 62140',
        formula: `${formatCentsToDollars(maximumCents)} - ${formatRate(lift.phaseOutRate.value)} of net income over ${formatCentsToDollars(lift.incomeThresholdCents.value)}`,
        amountCents: liftCreditCents,
        sourceUrl: lift.maxCreditCents.source,
      });
    }
  }

  if (provRules.ontarioHealthPremium) {
    const tiers = provRules.ontarioHealthPremium.tiers;
    healthPremiumCents = calculateOntarioHealthPremium(taxableIncomeCents, tiers.value);
    provincialTaxCents += healthPremiumCents;
    if (healthPremiumCents > 0) {
      trace({
        id: 'ontario_health_premium',
        category: 'provincial',
        titleEn: 'Ontario Health Premium',
        titleFr: 'Contribution-santé de l’Ontario',
        formReference: 'Form ON428, line 89',
        formula: `Graduated premium on taxable income of ${formatCentsToDollars(taxableIncomeCents)}`,
        amountCents: healthPremiumCents,
        sourceUrl: tiers.source,
      });
    }
  }

  if (provRules.bcTaxReduction) {
    const reduction = provRules.bcTaxReduction;
    const phaseOutCents = applyRate(
      Math.max(0, netIncomeCents - reduction.phaseOutStartCents.value),
      reduction.phaseOutRate.value
    );
    taxReductionCents = Math.min(provincialTaxCents, Math.max(0, reduction.basicReductionCents.value - phaseOutCents));
    provincialTaxCents -= taxReductionCents;
    if (taxReductionCents > 0) {
      trace({
        id: 'bc_tax_reduction',
        category: 'provincial',
        titleEn: 'BC Tax Reduction',
        titleFr: 'Réduction d’impôt de la Colombie-Britannique',
        formReference: 'Form BC428',
        formula: `${formatCentsToDollars(reduction.basicReductionCents.value)} - ${formatRate(reduction.phaseOutRate.value)} of net income over ${formatCentsToDollars(reduction.phaseOutStartCents.value)}`,
        amountCents: taxReductionCents,
        sourceUrl: reduction.basicReductionCents.source,
      });
    }
  }

  const netProvincialTaxCents = provincialTaxCents;
  trace({
    id: 'net_provincial_tax',
    category: 'provincial',
    titleEn: `${jurisdiction} Net Provincial Tax`,
    titleFr: `Impôt provincial net (${jurisdiction})`,
    formReference: quebec ? 'TP-1 line 432' : `Form ${jurisdiction}428`,
    formula: `${formatCentsToDollars(provincialBrackets.totalCents)} - ${formatCentsToDollars(provincialCreditsCents)} credits${surtaxCents ? ` + ${formatCentsToDollars(surtaxCents)} surtax` : ''}${taxReductionCents ? ` - ${formatCentsToDollars(taxReductionCents)} reduction` : ''}${liftCreditCents ? ` - ${formatCentsToDollars(liftCreditCents)} LIFT` : ''}${healthPremiumCents ? ` + ${formatCentsToDollars(healthPremiumCents)} health premium` : ''}`,
    amountCents: netProvincialTaxCents,
    sourceUrl: provRules.brackets[0]!.rate.source,
  });

  const totalTaxCents = netFederalTaxCents + netProvincialTaxCents;
  const qpipTotalCents = qpipEmployeeCents + qpipSelfEmployedCents;
  const totalDeductionsCents = totalTaxCents + pension.totalCents + eiEmployeeCents + qpipTotalCents;
  const takeHomePayCents = totalIncomeCents - totalDeductionsCents;
  const averageTaxRate = totalIncomeCents > 0 ? totalTaxCents / totalIncomeCents : 0;

  let marginalTaxRate = 0;
  if (computeMarginalRate) {
    const next = calculateTax(
      { ...input, employmentIncomeCents: employmentCents + MARGINAL_RATE_STEP_CENTS },
      fedRules,
      provRules,
      { computeMarginalRate: false, includeTraces: false }
    );
    marginalTaxRate = Math.min(1, Math.max(0, (next.totalTaxCents - totalTaxCents) / MARGINAL_RATE_STEP_CENTS));
  }

  return {
    inputs: input,
    totalIncomeCents,
    cpp: pension,
    ei: { employeeCents: eiEmployeeCents, totalCents: eiEmployeeCents },
    qpip: quebec
      ? { employeeCents: qpipEmployeeCents, selfEmployedCents: qpipSelfEmployedCents, totalCents: qpipTotalCents }
      : undefined,
    netIncomeCents,
    taxableIncomeCents,
    federal: {
      taxOnTaxableIncomeCents: federalBrackets.totalCents,
      bpaAmountCents,
      creditAmountsCents: federalCreditAmountsCents,
      nonRefundableCreditsCents: federalCreditsCents,
      basicFederalTaxCents,
      quebecAbatementCents,
      netFederalTaxCents,
    },
    provincial: {
      jurisdiction,
      taxableIncomeCents: provincialTaxableCents,
      taxOnTaxableIncomeCents: provincialBrackets.totalCents,
      nonRefundableCreditsCents: provincialCreditsCents,
      basicProvincialTaxCents,
      surtaxCents: surtaxCents || undefined,
      taxReductionCents: taxReductionCents || undefined,
      liftCreditCents: liftCreditCents || undefined,
      healthPremiumCents: healthPremiumCents || undefined,
      netProvincialTaxCents,
    },
    totalTaxCents,
    totalDeductionsCents,
    takeHomePayCents,
    averageTaxRate,
    marginalTaxRate,
    limitations,
    traces,
  };
}
