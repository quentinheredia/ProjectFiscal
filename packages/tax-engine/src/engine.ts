import {
  FederalRuleSet,
  ProvincialRuleSet,
  TaxBracket,
} from '@fiscal-insights/tax-data';
import {
  TaxCalculationInput,
  TaxCalculationResult,
  ExplanationTraceItem,
} from './types';

export function formatCentsToDollars(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

function calculateBracketTax(
  taxableIncomeCents: number,
  brackets: TaxBracket[]
): { totalCents: number; breakdown: { thresholdCents: number | null; rate: number; taxableCents: number; taxCents: number }[] } {
  let remainingIncome = taxableIncomeCents;
  let previousThresholdCents = 0;
  let totalCents = 0;
  const breakdown: { thresholdCents: number | null; rate: number; taxableCents: number; taxCents: number }[] = [];

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    const upTo = bracket.upToCents.value;
    const rate = bracket.rate.value;

    let taxableInBracket = 0;
    if (upTo === null) {
      taxableInBracket = remainingIncome;
    } else {
      const bracketSpan = upTo - previousThresholdCents;
      taxableInBracket = Math.min(remainingIncome, bracketSpan);
      previousThresholdCents = upTo;
    }

    const taxCents = Math.round(taxableInBracket * rate);
    totalCents += taxCents;
    remainingIncome -= taxableInBracket;

    breakdown.push({
      thresholdCents: upTo,
      rate,
      taxableCents: taxableInBracket,
      taxCents,
    });
  }

  return { totalCents, breakdown };
}

export function calculateTax(
  input: TaxCalculationInput,
  fedRules: FederalRuleSet,
  provRules: ProvincialRuleSet,
  options: { computeMarginalRate?: boolean; includeTraces?: boolean } = { computeMarginalRate: true, includeTraces: true }
): TaxCalculationResult {
  const traces: ExplanationTraceItem[] = [];
  const empIncomeCents = Math.max(0, input.employmentIncomeCents);
  const selfEmpIncomeCents = Math.max(0, input.selfEmploymentIncomeCents ?? 0);
  const rrspDeductionCents = Math.max(0, input.rrspDeductionCents ?? 0);
  const fhsaDeductionCents = Math.max(0, input.fhsaDeductionCents ?? 0);
  const totalIncomeCents = empIncomeCents + selfEmpIncomeCents;

  if (options.includeTraces) {
    traces.push({
      id: 'total_income',
      category: 'income',
      titleEn: 'Total Income',
      titleFr: 'Revenu total',
      formReference: 'Line 15000',
      formula: `${formatCentsToDollars(empIncomeCents)} (employment) + ${formatCentsToDollars(selfEmpIncomeCents)} (self-employment)`,
      amountCents: totalIncomeCents,
      sourceUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-15000-total-income.html',
    });
  }

  // --- CPP / QPP Calculations ---
  const isQuebec = input.province === 'QC';
  let cppBaseEmployeeCents = 0;
  let cppEnhancedEmployeeCents = 0;
  let cppBaseSelfEmployedCents = 0;
  let cppEnhancedSelfEmployedCents = 0;
  let cppDeductiblePortionCents = 0;

  if (isQuebec && provRules.qpp) {
    const qpp = provRules.qpp;
    const exemption = qpp.basicExemptionCents.value;
    const yme = qpp.firstCeilingCents.value;
    const yampe = qpp.secondCeilingCents.value;

    if (empIncomeCents > exemption) {
      const basePensionable = Math.min(empIncomeCents, yme) - exemption;
      cppBaseEmployeeCents = Math.round(basePensionable * qpp.employeeRate.value);

      if (empIncomeCents > yme) {
        const additionalPensionable = Math.min(empIncomeCents, yampe) - yme;
        cppEnhancedEmployeeCents = Math.round(additionalPensionable * qpp.secondEmployeeRate.value);
      }
    }

    if (selfEmpIncomeCents > 0) {
      const remainingExemption = Math.max(0, exemption - empIncomeCents);
      const remainingYme = Math.max(0, yme - empIncomeCents);
      const basePensionableSE = Math.min(selfEmpIncomeCents, remainingYme) - remainingExemption;
      if (basePensionableSE > 0) {
        cppBaseSelfEmployedCents = Math.round(basePensionableSE * qpp.selfEmployedRate.value);
      }
      if (empIncomeCents + selfEmpIncomeCents > yme) {
        const remainingYampe = Math.max(0, yampe - Math.max(empIncomeCents, yme));
        const additionalSE = Math.min(selfEmpIncomeCents, remainingYampe);
        if (additionalSE > 0) {
          cppEnhancedSelfEmployedCents = Math.round(additionalSE * qpp.secondSelfEmployedRate.value);
        }
      }
    }
  } else {
    const cpp = fedRules.cpp;
    const exemption = cpp.basicExemptionCents.value;
    const yme = cpp.firstCeilingCents.value;
    const yampe = cpp.secondCeilingCents.value;

    if (empIncomeCents > exemption) {
      const basePensionable = Math.min(empIncomeCents, yme) - exemption;
      cppBaseEmployeeCents = Math.round(basePensionable * cpp.employeeRate.value);

      if (empIncomeCents > yme) {
        const additionalPensionable = Math.min(empIncomeCents, yampe) - yme;
        cppEnhancedEmployeeCents = Math.round(additionalPensionable * cpp.secondEmployeeRate.value);
      }
    }

    if (selfEmpIncomeCents > 0) {
      const remainingExemption = Math.max(0, exemption - empIncomeCents);
      const remainingYme = Math.max(0, yme - empIncomeCents);
      const basePensionableSE = Math.min(selfEmpIncomeCents, remainingYme) - remainingExemption;
      if (basePensionableSE > 0) {
        cppBaseSelfEmployedCents = Math.round(basePensionableSE * cpp.selfEmployedRate.value);
      }
      if (empIncomeCents + selfEmpIncomeCents > yme) {
        const remainingYampe = Math.max(0, yampe - Math.max(empIncomeCents, yme));
        const additionalSE = Math.min(selfEmpIncomeCents, remainingYampe);
        if (additionalSE > 0) {
          cppEnhancedSelfEmployedCents = Math.round(additionalSE * cpp.secondSelfEmployedRate.value);
        }
      }
    }
  }

  // Enhanced CPP is 100% tax deductible on Line 22215; half of self-employed base is deductible on Line 22200
  cppDeductiblePortionCents =
    cppEnhancedEmployeeCents +
    cppEnhancedSelfEmployedCents +
    Math.round(cppBaseSelfEmployedCents / 2);

  const totalCppCents =
    cppBaseEmployeeCents +
    cppEnhancedEmployeeCents +
    cppBaseSelfEmployedCents +
    cppEnhancedSelfEmployedCents;

  if (options.includeTraces) {
    traces.push({
      id: 'cpp_base',
      category: 'cpp_ei',
      titleEn: isQuebec ? 'QPP Base Contribution' : 'CPP Base Contribution',
      titleFr: isQuebec ? 'Cotisation de base au RRQ' : 'Cotisation de base au RPC',
      formReference: 'Schedule 8 / Line 30800',
      formula: `${isQuebec ? '6.40%' : '5.95%'} on earnings up to ceiling minus $3,500 exemption`,
      amountCents: cppBaseEmployeeCents + cppBaseSelfEmployedCents,
      sourceUrl: fedRules.cpp.firstCeilingCents.source,
    });

    if (cppEnhancedEmployeeCents > 0 || cppEnhancedSelfEmployedCents > 0) {
      traces.push({
        id: 'cpp_enhanced',
        category: 'cpp_ei',
        titleEn: isQuebec ? 'QPP2 Enhanced Contribution' : 'CPP2 Enhanced Contribution',
        titleFr: isQuebec ? 'Deuxième cotisation supplémentaire au RRQ' : 'Cotisation supplémentaire au RPC (RPC2)',
        formReference: 'Line 22215',
        formula: `4.0% on earnings between first ceiling and second ceiling`,
        amountCents: cppEnhancedEmployeeCents + cppEnhancedSelfEmployedCents,
        sourceUrl: fedRules.cpp.secondCeilingCents.source,
      });
    }
  }

  // --- EI & QPIP Calculations ---
  const eiMaxInsurable = fedRules.ei.maxInsurableEarningsCents.value;
  const eiRate = isQuebec ? fedRules.ei.quebecRate.value : fedRules.ei.rate.value;
  const eiInsurableIncome = Math.min(empIncomeCents, eiMaxInsurable);
  const eiEmployeeCents = Math.round(eiInsurableIncome * eiRate);

  if (options.includeTraces) {
    traces.push({
      id: 'ei_contribution',
      category: 'cpp_ei',
      titleEn: 'Employment Insurance (EI)',
      titleFr: "Assurance-emploi (AE)",
      formReference: 'Line 31200',
      formula: `${(eiRate * 100).toFixed(2)}% on insurable earnings up to ${formatCentsToDollars(eiMaxInsurable)}`,
      amountCents: eiEmployeeCents,
      sourceUrl: fedRules.ei.rate.source,
    });
  }

  let qpipEmployeeCents = 0;
  let qpipSelfEmployedCents = 0;
  if (isQuebec && provRules.qpip) {
    const qpip = provRules.qpip;
    const qpipInsurableEmp = Math.min(empIncomeCents, qpip.maxInsurableEarningsCents.value);
    qpipEmployeeCents = Math.round(qpipInsurableEmp * qpip.employeeRate.value);

    if (selfEmpIncomeCents > 0) {
      const remainingQpipInsurable = Math.max(0, qpip.maxInsurableEarningsCents.value - empIncomeCents);
      const qpipInsurableSE = Math.min(selfEmpIncomeCents, remainingQpipInsurable);
      qpipSelfEmployedCents = Math.round(qpipInsurableSE * qpip.selfEmployedRate.value);
    }

    if (options.includeTraces) {
      traces.push({
        id: 'qpip_contribution',
        category: 'cpp_ei',
        titleEn: 'Quebec Parental Insurance Plan (QPIP)',
        titleFr: 'Régime québécois d’assurance parentale (RQAP)',
        formReference: 'Schedule R (TP-1)',
        formula: `${(qpip.employeeRate.value * 100).toFixed(3)}% on insurable earnings up to ${formatCentsToDollars(qpip.maxInsurableEarningsCents.value)}`,
        amountCents: qpipEmployeeCents + qpipSelfEmployedCents,
        sourceUrl: qpip.maxInsurableEarningsCents.source,
      });
    }
  }

  // --- Net Income & Taxable Income ---
  const totalDeductionsFromIncome = cppDeductiblePortionCents + rrspDeductionCents + fhsaDeductionCents;
  const netIncomeCents = Math.max(0, totalIncomeCents - totalDeductionsFromIncome);
  const taxableIncomeCents = netIncomeCents; // Standard taxable income

  if (options.includeTraces) {
    traces.push({
      id: 'taxable_income',
      category: 'income',
      titleEn: 'Taxable Income',
      titleFr: 'Revenu imposable',
      formReference: 'Line 26000',
      formula: `${formatCentsToDollars(totalIncomeCents)} - deductions of ${formatCentsToDollars(totalDeductionsFromIncome)}`,
      amountCents: taxableIncomeCents,
      sourceUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-26000-taxable-income.html',
    });
  }

  // --- Federal Tax Calculation ---
  const fedBracketCalc = calculateBracketTax(taxableIncomeCents, fedRules.brackets);
  const federalGrossTaxCents = fedBracketCalc.totalCents;

  if (options.includeTraces) {
    fedBracketCalc.breakdown.forEach((b, idx) => {
      traces.push({
        id: `federal_bracket_${idx + 1}`,
        category: 'federal',
        titleEn: `Federal Bracket ${idx + 1} (${(b.rate * 100).toFixed(1)}%)`,
        titleFr: `Palier fédéral ${idx + 1} (${(b.rate * 100).toFixed(1)} %)`,
        formReference: 'Schedule 1, Part A',
        formula: `${formatCentsToDollars(b.taxableCents)} × ${(b.rate * 100).toFixed(1)}% = ${formatCentsToDollars(b.taxCents)}`,
        amountCents: b.taxCents,
        sourceUrl: fedRules.brackets[idx]?.rate.source ?? fedRules.brackets[0]!.rate.source,
      });
    });
  }

  // Federal BPA clawback calculation
  const bpaCfg = fedRules.bpa;
  let federalBpaAmountCents = bpaCfg.maxCents.value;
  if (taxableIncomeCents > bpaCfg.thresholdLowCents.value) {
    if (taxableIncomeCents >= bpaCfg.thresholdHighCents.value) {
      federalBpaAmountCents = bpaCfg.minCents.value;
    } else {
      const excess = taxableIncomeCents - bpaCfg.thresholdLowCents.value;
      const span = bpaCfg.thresholdHighCents.value - bpaCfg.thresholdLowCents.value;
      const clawback = Math.round((bpaCfg.maxCents.value - bpaCfg.minCents.value) * (excess / span));
      federalBpaAmountCents = bpaCfg.maxCents.value - clawback;
    }
  }
  const federalBpaCreditCents = Math.round(federalBpaAmountCents * bpaCfg.creditRate.value);

  if (options.includeTraces) {
    traces.push({
      id: 'federal_bpa_credit',
      category: 'federal',
      titleEn: 'Federal Basic Personal Amount Credit',
      titleFr: 'Crédit fédéral pour montant personnel de base',
      formReference: 'Line 30000',
      formula: `${formatCentsToDollars(federalBpaAmountCents)} × ${(bpaCfg.creditRate.value * 100).toFixed(1)}%`,
      amountCents: federalBpaCreditCents,
      sourceUrl: bpaCfg.maxCents.source,
    });
  }

  // Canada Employment Amount
  const ceaCents = Math.min(empIncomeCents, fedRules.canadaEmploymentAmount.maxCents.value);
  const federalCeaCreditCents = Math.round(ceaCents * fedRules.canadaEmploymentAmount.rate.value);

  if (options.includeTraces && federalCeaCreditCents > 0) {
    traces.push({
      id: 'federal_cea_credit',
      category: 'federal',
      titleEn: 'Canada Employment Amount Credit',
      titleFr: 'Montant canadien pour emploi',
      formReference: 'Line 31260',
      formula: `${formatCentsToDollars(ceaCents)} × ${(fedRules.canadaEmploymentAmount.rate.value * 100).toFixed(1)}%`,
      amountCents: federalCeaCreditCents,
      sourceUrl: fedRules.canadaEmploymentAmount.maxCents.source,
    });
  }

  // Federal CPP / EI credits (using lowest federal rate)
  const federalCppCreditCents = Math.round(cppBaseEmployeeCents * bpaCfg.creditRate.value);
  const federalEiCreditCents = Math.round(eiEmployeeCents * bpaCfg.creditRate.value);

  const federalTotalCreditsCents =
    federalBpaCreditCents +
    federalCeaCreditCents +
    federalCppCreditCents +
    federalEiCreditCents;

  const basicFederalTaxCents = Math.max(0, federalGrossTaxCents - federalTotalCreditsCents);

  // Quebec Abatement (Line 44000: 16.5% reduction)
  let quebecAbatementCents = 0;
  if (isQuebec && provRules.quebecAbatementRate) {
    quebecAbatementCents = Math.round(basicFederalTaxCents * provRules.quebecAbatementRate.value);
    if (options.includeTraces) {
      traces.push({
        id: 'quebec_abatement',
        category: 'federal',
        titleEn: 'Refundable Quebec Abatement',
        titleFr: 'Abattement remboursable du Québec',
        formReference: 'Line 44000',
        formula: `${formatCentsToDollars(basicFederalTaxCents)} × 16.5%`,
        amountCents: quebecAbatementCents,
        sourceUrl: provRules.quebecAbatementRate.source,
      });
    }
  }

  const netFederalTaxCents = Math.max(0, basicFederalTaxCents - quebecAbatementCents);

  if (options.includeTraces) {
    traces.push({
      id: 'net_federal_tax',
      category: 'federal',
      titleEn: 'Net Federal Tax',
      titleFr: 'Impôt fédéral net',
      formReference: 'Line 42000',
      formula: `${formatCentsToDollars(federalGrossTaxCents)} gross - ${formatCentsToDollars(federalTotalCreditsCents)} credits ${quebecAbatementCents > 0 ? `- ${formatCentsToDollars(quebecAbatementCents)} abatement` : ''}`,
      amountCents: netFederalTaxCents,
      sourceUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-42000-net-federal-tax.html',
    });
  }

  // --- Provincial Tax Calculation ---
  const provBracketCalc = calculateBracketTax(taxableIncomeCents, provRules.brackets);
  const provGrossTaxCents = provBracketCalc.totalCents;

  if (options.includeTraces) {
    provBracketCalc.breakdown.forEach((b, idx) => {
      traces.push({
        id: `provincial_bracket_${idx + 1}`,
        category: 'provincial',
        titleEn: `${provRules.jurisdiction} Bracket ${idx + 1} (${(b.rate * 100).toFixed(2)}%)`,
        titleFr: `${provRules.jurisdiction} Palier ${idx + 1} (${(b.rate * 100).toFixed(2)} %)`,
        formReference: `Form ${provRules.jurisdiction}428`,
        formula: `${formatCentsToDollars(b.taxableCents)} × ${(b.rate * 100).toFixed(2)}% = ${formatCentsToDollars(b.taxCents)}`,
        amountCents: b.taxCents,
        sourceUrl: provRules.brackets[idx]?.rate.source ?? provRules.brackets[0]!.rate.source,
      });
    });
  }

  // Provincial BPA credit
  const provBpaCreditCents = Math.round(provRules.bpa.amountCents.value * provRules.bpa.creditRate.value);
  const provCppCreditCents = isQuebec ? 0 : Math.round(cppBaseEmployeeCents * provRules.bpa.creditRate.value);
  const provEiCreditCents = isQuebec ? 0 : Math.round(eiEmployeeCents * provRules.bpa.creditRate.value);
  const provTotalCreditsCents = provBpaCreditCents + provCppCreditCents + provEiCreditCents;
  const basicProvTaxCents = Math.max(0, provGrossTaxCents - provTotalCreditsCents);

  let surtaxCents = 0;
  let healthPremiumCents = 0;
  let lowIncomeReductionCents = 0;

  // Ontario Surtax and Health Premium
  if (provRules.jurisdiction === 'ON') {
    if (provRules.ontarioSurtax) {
      const t1 = provRules.ontarioSurtax.tier1ThresholdCents.value;
      const r1 = provRules.ontarioSurtax.tier1Rate.value;
      const t2 = provRules.ontarioSurtax.tier2ThresholdCents.value;
      const r2 = provRules.ontarioSurtax.tier2Rate.value;

      if (basicProvTaxCents > t1) {
        surtaxCents += Math.round((basicProvTaxCents - t1) * r1);
      }
      if (basicProvTaxCents > t2) {
        surtaxCents += Math.round((basicProvTaxCents - t2) * r2);
      }

      if (options.includeTraces && surtaxCents > 0) {
        traces.push({
          id: 'ontario_surtax',
          category: 'provincial',
          titleEn: 'Ontario Surtax',
          titleFr: 'Surtaxe de l’Ontario',
          formReference: 'Form ON428, Line 56000',
          formula: `20% on basic tax > ${formatCentsToDollars(t1)} + 36% on basic tax > ${formatCentsToDollars(t2)}`,
          amountCents: surtaxCents,
          sourceUrl: provRules.ontarioSurtax.tier1ThresholdCents.source,
        });
      }
    }

    if (provRules.ontarioHealthPremium) {
      for (const tier of provRules.ontarioHealthPremium.tiers) {
        if (taxableIncomeCents > tier.thresholdCents) {
          const excess = taxableIncomeCents - tier.thresholdCents;
          const calculated = tier.baseAmountCents + Math.round(excess * tier.rateOnExcess);
          healthPremiumCents = Math.min(calculated, tier.capCents);
        }
      }

      if (options.includeTraces && healthPremiumCents > 0) {
        traces.push({
          id: 'ontario_health_premium',
          category: 'provincial',
          titleEn: 'Ontario Health Premium',
          titleFr: 'Contribution-santé de l’Ontario',
          formReference: 'Form ON428, Line 58000',
          formula: `Calculated from graduated taxable income schedule (max $900)`,
          amountCents: healthPremiumCents,
          sourceUrl: provRules.ontarioHealthPremium.source.source,
        });
      }
    }
  }

  // BC Tax Reduction
  if (provRules.jurisdiction === 'BC' && provRules.bcTaxReduction) {
    const bcr = provRules.bcTaxReduction;
    const initialReduction = bcr.initialAmountCents.value;
    const thresh = bcr.thresholdCents.value;
    const phaseOutRate = bcr.phaseOutRate.value;

    if (taxableIncomeCents <= thresh) {
      lowIncomeReductionCents = Math.min(basicProvTaxCents, initialReduction);
    } else {
      const reduction = Math.max(0, initialReduction - Math.round((taxableIncomeCents - thresh) * phaseOutRate));
      lowIncomeReductionCents = Math.min(basicProvTaxCents, reduction);
    }

    if (options.includeTraces && lowIncomeReductionCents > 0) {
      traces.push({
        id: 'bc_tax_reduction',
        category: 'provincial',
        titleEn: 'BC Tax Reduction',
        titleFr: 'Réduction d’impôt de la Colombie-Britannique',
        formReference: 'Form BC428, Line 59000',
        formula: `Phased out based on net income`,
        amountCents: lowIncomeReductionCents,
        sourceUrl: bcr.initialAmountCents.source,
      });
    }
  }

  const netProvincialTaxCents = Math.max(0, basicProvTaxCents + surtaxCents + healthPremiumCents - lowIncomeReductionCents);

  if (options.includeTraces) {
    traces.push({
      id: 'net_provincial_tax',
      category: 'provincial',
      titleEn: `${provRules.jurisdiction} Net Provincial Tax`,
      titleFr: `Impôt provincial net de ${provRules.jurisdiction}`,
      formReference: `Form ${provRules.jurisdiction}428`,
      formula: `${formatCentsToDollars(provGrossTaxCents)} gross - ${formatCentsToDollars(provTotalCreditsCents)} credits ${surtaxCents > 0 ? `+ ${formatCentsToDollars(surtaxCents)} surtax` : ''} ${healthPremiumCents > 0 ? `+ ${formatCentsToDollars(healthPremiumCents)} health premium` : ''}`,
      amountCents: netProvincialTaxCents,
      sourceUrl: provRules.brackets[0]!.rate.source,
    });
  }

  const totalTaxCents = netFederalTaxCents + netProvincialTaxCents;
  const qpipTotalCents = qpipEmployeeCents + qpipSelfEmployedCents;
  const totalDeductionsCents = totalTaxCents + totalCppCents + eiEmployeeCents + qpipTotalCents;
  const takeHomePayCents = Math.max(0, totalIncomeCents - totalDeductionsCents);

  const averageTaxRate = totalIncomeCents > 0 ? totalTaxCents / totalIncomeCents : 0;

  // Marginal tax rate: test +$100.00 (10,000 cents) of employment income to avoid 1-cent discretization artifacts
  let marginalTaxRate = 0;
  if (options.computeMarginalRate !== false) {
    const deltaSpanCents = 10000; // $100 span
    const testInput: TaxCalculationInput = {
      ...input,
      employmentIncomeCents: empIncomeCents + deltaSpanCents,
    };
    const testResult = calculateTax(testInput, fedRules, provRules, {
      computeMarginalRate: false,
      includeTraces: false,
    });
    const deltaTaxCents = testResult.totalTaxCents - totalTaxCents;
    marginalTaxRate = Math.min(1, Math.max(0, deltaTaxCents / deltaSpanCents));
  }

  return {
    inputs: input,
    totalIncomeCents,
    cpp: {
      baseEmployeeCents: cppBaseEmployeeCents,
      enhancedEmployeeCents: cppEnhancedEmployeeCents,
      baseSelfEmployedCents: cppBaseSelfEmployedCents,
      enhancedSelfEmployedCents: cppEnhancedSelfEmployedCents,
      totalCents: totalCppCents,
      deductiblePortionCents: cppDeductiblePortionCents,
    },
    ei: {
      employeeCents: eiEmployeeCents,
      totalCents: eiEmployeeCents,
    },
    qpip: isQuebec ? {
      employeeCents: qpipEmployeeCents,
      selfEmployedCents: qpipSelfEmployedCents,
      totalCents: qpipTotalCents,
    } : undefined,
    netIncomeCents,
    taxableIncomeCents,
    federal: {
      grossTaxCents: federalGrossTaxCents,
      bpaCreditCents: federalBpaCreditCents,
      ceaCreditCents: federalCeaCreditCents,
      cppCreditCents: federalCppCreditCents,
      eiCreditCents: federalEiCreditCents,
      totalCreditsCents: federalTotalCreditsCents,
      basicFederalTaxCents,
      quebecAbatementCents,
      netFederalTaxCents,
    },
    provincial: {
      jurisdiction: provRules.jurisdiction,
      grossTaxCents: provGrossTaxCents,
      bpaCreditCents: provBpaCreditCents,
      cppCreditCents: provCppCreditCents,
      eiCreditCents: provEiCreditCents,
      totalCreditsCents: provTotalCreditsCents,
      basicProvincialTaxCents: basicProvTaxCents,
      surtaxCents: surtaxCents > 0 ? surtaxCents : undefined,
      healthPremiumCents: healthPremiumCents > 0 ? healthPremiumCents : undefined,
      lowIncomeReductionCents: lowIncomeReductionCents > 0 ? lowIncomeReductionCents : undefined,
      netProvincialTaxCents,
    },
    totalTaxCents,
    totalDeductionsCents,
    takeHomePayCents,
    averageTaxRate,
    marginalTaxRate,
    traces,
  };
}
