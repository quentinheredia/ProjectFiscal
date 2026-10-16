import {
  FederalRuleSet,
  ProvincialRuleSet,
  TaxBracket,
} from '@fiscal-insights/tax-data';
import {
  TaxCalculationInput,
  TaxCalculationResult,
  ExplanationTraceItem,
  PensionContributions,
  CalculationLimitation,
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
    const upTo = bracket.upToCents?.value ?? null;
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
  const limitations: CalculationLimitation[] = [];
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
  const pensionRules = isQuebec && provRules.quebec ? provRules.quebec.qpp : fedRules.cpp;

  const exemption = pensionRules.basicExemptionCents.value;
  const yme = pensionRules.maxPensionableEarningsCents.value;
  const yampe = pensionRules.additionalMaxPensionableEarningsCents.value;

  let empFirstTierCents = 0;
  let empSecondTierCents = 0;
  let seFirstTierCents = 0;
  let seSecondTierCents = 0;
  let baseCreditableCents = 0;
  let enhancedEmploymentDeductionCents = 0;
  let selfEmployedDeductionCents = 0;

  if (empIncomeCents > exemption) {
    const firstTierPensionable = Math.min(empIncomeCents, yme) - exemption;
    const baseRate = pensionRules.baseEmployeeRate.value;
    const firstAddRate = pensionRules.firstAdditionalEmployeeRate.value;
    const totalFirstTierRate = baseRate + firstAddRate;

    empFirstTierCents = Math.round(firstTierPensionable * totalFirstTierRate);
    baseCreditableCents = Math.round(firstTierPensionable * baseRate);
    enhancedEmploymentDeductionCents = Math.round(firstTierPensionable * firstAddRate);

    if (empIncomeCents > yme) {
      const secondTierPensionable = Math.min(empIncomeCents, yampe) - yme;
      empSecondTierCents = Math.round(secondTierPensionable * pensionRules.secondAdditionalEmployeeRate.value);
      enhancedEmploymentDeductionCents += empSecondTierCents;
    }
  }

  if (selfEmpIncomeCents > 0) {
    if (isQuebec) {
      limitations.push('QC_SELF_EMPLOYMENT_NOT_MODELLED');
    } else {
      const remainingExemption = Math.max(0, exemption - empIncomeCents);
      const remainingYme = Math.max(0, yme - empIncomeCents);
      const sePensionable = Math.min(selfEmpIncomeCents, remainingYme) - remainingExemption;
      if (sePensionable > 0) {
        seFirstTierCents = Math.round(sePensionable * fedRules.cpp.selfEmployedFirstTierRate.value);
        selfEmployedDeductionCents = Math.round(seFirstTierCents / 2);
      }
      if (empIncomeCents + selfEmpIncomeCents > yme) {
        const remainingYampe = Math.max(0, yampe - Math.max(empIncomeCents, yme));
        const seSecondPensionable = Math.min(selfEmpIncomeCents, remainingYampe);
        if (seSecondPensionable > 0) {
          seSecondTierCents = Math.round(seSecondPensionable * fedRules.cpp.selfEmployedSecondTierRate.value);
        }
      }
    }
  }

  const totalCppCents = empFirstTierCents + empSecondTierCents + seFirstTierCents + seSecondTierCents;

  const cppContributions: PensionContributions = {
    plan: isQuebec ? 'QPP' : 'CPP',
    employeeFirstTierCents: empFirstTierCents,
    employeeSecondTierCents: empSecondTierCents,
    selfEmployedFirstTierCents: seFirstTierCents,
    selfEmployedSecondTierCents: seSecondTierCents,
    totalCents: totalCppCents,
    baseCreditableCents,
    enhancedEmploymentDeductionCents,
    selfEmployedDeductionCents,
  };

  if (options.includeTraces) {
    traces.push({
      id: 'cpp_base',
      category: 'cpp_ei',
      titleEn: isQuebec ? 'QPP Base Contribution' : 'CPP Base Contribution',
      titleFr: isQuebec ? 'Cotisation de base au RRQ' : 'Cotisation de base au RPC',
      formReference: 'Schedule 8 / Line 30800',
      formula: `${isQuebec ? '5.30%' : '4.95%'} on earnings up to ceiling minus $3,500 exemption`,
      amountCents: baseCreditableCents,
      sourceUrl: pensionRules.maxPensionableEarningsCents.source,
    });

    if (enhancedEmploymentDeductionCents > 0) {
      traces.push({
        id: 'cpp_enhanced',
        category: 'cpp_ei',
        titleEn: isQuebec ? 'QPP Enhanced Deduction' : 'CPP Enhanced Deduction',
        titleFr: isQuebec ? 'Déduction supplémentaire pour le RRQ' : 'Déduction pour cotisations bonifiées au RPC',
        formReference: 'Line 22215',
        formula: `First additional (1%) + second additional (4%) contributions`,
        amountCents: enhancedEmploymentDeductionCents,
        sourceUrl: pensionRules.additionalMaxPensionableEarningsCents.source,
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
  if (isQuebec && provRules.quebec?.qpip) {
    const qpip = provRules.quebec.qpip;
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
  const totalDeductionsFromIncome = enhancedEmploymentDeductionCents + selfEmployedDeductionCents + rrspDeductionCents + fhsaDeductionCents;
  const netIncomeCents = Math.max(0, totalIncomeCents - totalDeductionsFromIncome);
  const taxableIncomeCents = netIncomeCents;

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
  if (netIncomeCents > bpaCfg.phaseOutStartCents.value) {
    if (netIncomeCents >= bpaCfg.phaseOutEndCents.value) {
      federalBpaAmountCents = bpaCfg.minCents.value;
    } else {
      const excess = netIncomeCents - bpaCfg.phaseOutStartCents.value;
      const span = bpaCfg.phaseOutEndCents.value - bpaCfg.phaseOutStartCents.value;
      const clawback = Math.round((bpaCfg.maxCents.value - bpaCfg.minCents.value) * (excess / span));
      federalBpaAmountCents = bpaCfg.maxCents.value - clawback;
    }
  }

  // Canada Employment Amount
  const ceaCents = Math.min(empIncomeCents, fedRules.canadaEmploymentAmountMaxCents.value);

  // Credit amounts before multiplying by the credit rate
  const creditAmountsCents = federalBpaAmountCents + ceaCents + baseCreditableCents + eiEmployeeCents;
  const federalCreditsCents = Math.round(creditAmountsCents * fedRules.nonRefundableCreditRate.value);

  if (options.includeTraces) {
    traces.push({
      id: 'federal_bpa_credit',
      category: 'federal',
      titleEn: 'Federal Basic Personal Amount Credit',
      titleFr: 'Crédit fédéral pour montant personnel de base',
      formReference: 'Line 30000',
      formula: `${formatCentsToDollars(federalBpaAmountCents)} × ${(fedRules.nonRefundableCreditRate.value * 100).toFixed(1)}%`,
      amountCents: Math.round(federalBpaAmountCents * fedRules.nonRefundableCreditRate.value),
      sourceUrl: bpaCfg.maxCents.source,
    });

    if (ceaCents > 0) {
      traces.push({
        id: 'federal_cea_credit',
        category: 'federal',
        titleEn: 'Canada Employment Amount Credit',
        titleFr: 'Montant canadien pour emploi',
        formReference: 'Line 31260',
        formula: `${formatCentsToDollars(ceaCents)} × ${(fedRules.nonRefundableCreditRate.value * 100).toFixed(1)}%`,
        amountCents: Math.round(ceaCents * fedRules.nonRefundableCreditRate.value),
        sourceUrl: fedRules.canadaEmploymentAmountMaxCents.source,
      });
    }
  }

  const basicFederalTaxCents = Math.max(0, federalGrossTaxCents - federalCreditsCents);

  // Quebec Abatement (Line 44000: 16.5% reduction)
  let quebecAbatementCents = 0;
  if (isQuebec && provRules.quebec) {
    quebecAbatementCents = Math.round(basicFederalTaxCents * provRules.quebec.federalAbatementRate.value);
    if (options.includeTraces) {
      traces.push({
        id: 'quebec_abatement',
        category: 'federal',
        titleEn: 'Refundable Quebec Abatement',
        titleFr: 'Abattement remboursable du Québec',
        formReference: 'Line 44000',
        formula: `${formatCentsToDollars(basicFederalTaxCents)} × 16.5%`,
        amountCents: quebecAbatementCents,
        sourceUrl: provRules.quebec.federalAbatementRate.source,
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
      formula: `${formatCentsToDollars(federalGrossTaxCents)} gross - ${formatCentsToDollars(federalCreditsCents)} credits ${quebecAbatementCents > 0 ? `- ${formatCentsToDollars(quebecAbatementCents)} abatement` : ''}`,
      amountCents: netFederalTaxCents,
      sourceUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-42000-net-federal-tax.html',
    });
  }

  // --- Provincial Tax Calculation ---
  let provTaxableIncomeCents = taxableIncomeCents;
  if (isQuebec && provRules.quebec?.deductionForWorkers) {
    const workerDeduction = Math.min(
      Math.round(empIncomeCents * provRules.quebec.deductionForWorkers.rate.value),
      provRules.quebec.deductionForWorkers.maxCents.value
    );
    provTaxableIncomeCents = Math.max(0, taxableIncomeCents - workerDeduction);
  }

  const provBracketCalc = calculateBracketTax(provTaxableIncomeCents, provRules.brackets);
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
  const provBpaAmount = provRules.basicPersonalAmountCents.value;
  const provCreditAmounts = provBpaAmount + (isQuebec ? 0 : baseCreditableCents + eiEmployeeCents);
  const provNonRefundableCreditsCents = Math.round(provCreditAmounts * provRules.nonRefundableCreditRate.value);
  const basicProvTaxCents = Math.max(0, provGrossTaxCents - provNonRefundableCreditsCents);

  let surtaxCents = 0;
  let healthPremiumCents = 0;
  let taxReductionCents = 0;
  let liftCreditCents = 0;

  // Ontario Specifics
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
      for (const tier of provRules.ontarioHealthPremium.tiers.value) {
        if (taxableIncomeCents > tier.overCents) {
          const excess = taxableIncomeCents - tier.overCents;
          const calculated = tier.baseCents + Math.round(excess * tier.rate);
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
          sourceUrl: provRules.ontarioHealthPremium.tiers.source,
        });
      }
    }
  }

  // BC Tax Reduction
  if (provRules.jurisdiction === 'BC' && provRules.bcTaxReduction) {
    const bcr = provRules.bcTaxReduction;
    const initialReduction = bcr.basicReductionCents.value;
    const thresh = bcr.phaseOutStartCents.value;
    const phaseOutRate = bcr.phaseOutRate.value;

    if (taxableIncomeCents <= thresh) {
      taxReductionCents = Math.min(basicProvTaxCents, initialReduction);
    } else {
      const reduction = Math.max(0, initialReduction - Math.round((taxableIncomeCents - thresh) * phaseOutRate));
      taxReductionCents = Math.min(basicProvTaxCents, reduction);
    }

    if (options.includeTraces && taxReductionCents > 0) {
      traces.push({
        id: 'bc_tax_reduction',
        category: 'provincial',
        titleEn: 'BC Tax Reduction',
        titleFr: 'Réduction d’impôt de la Colombie-Britannique',
        formReference: 'Form BC428, Line 59000',
        formula: `Phased out based on net income`,
        amountCents: taxReductionCents,
        sourceUrl: bcr.basicReductionCents.source,
      });
    }
  }

  const netProvincialTaxCents = Math.max(0, basicProvTaxCents + surtaxCents + healthPremiumCents - taxReductionCents - liftCreditCents);

  if (options.includeTraces) {
    traces.push({
      id: 'net_provincial_tax',
      category: 'provincial',
      titleEn: `${provRules.jurisdiction} Net Provincial Tax`,
      titleFr: `Impôt provincial net de ${provRules.jurisdiction}`,
      formReference: `Form ${provRules.jurisdiction}428`,
      formula: `${formatCentsToDollars(provGrossTaxCents)} gross - ${formatCentsToDollars(provNonRefundableCreditsCents)} credits ${surtaxCents > 0 ? `+ ${formatCentsToDollars(surtaxCents)} surtax` : ''} ${healthPremiumCents > 0 ? `+ ${formatCentsToDollars(healthPremiumCents)} health premium` : ''}`,
      amountCents: netProvincialTaxCents,
      sourceUrl: provRules.brackets[0]!.rate.source,
    });
  }

  const totalTaxCents = netFederalTaxCents + netProvincialTaxCents;
  const qpipTotalCents = qpipEmployeeCents + qpipSelfEmployedCents;
  const totalDeductionsCents = totalTaxCents + totalCppCents + eiEmployeeCents + qpipTotalCents;
  const takeHomePayCents = Math.max(0, totalIncomeCents - totalDeductionsCents);

  const averageTaxRate = totalIncomeCents > 0 ? totalTaxCents / totalIncomeCents : 0;

  // Marginal tax rate: test +$100.00 (10,000 cents) of employment income
  let marginalTaxRate = 0;
  if (options.computeMarginalRate !== false) {
    const deltaSpanCents = 10000;
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
    cpp: cppContributions,
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
      taxOnTaxableIncomeCents: federalGrossTaxCents,
      bpaAmountCents: federalBpaAmountCents,
      creditAmountsCents,
      nonRefundableCreditsCents: federalCreditsCents,
      basicFederalTaxCents,
      quebecAbatementCents,
      netFederalTaxCents,
    },
    provincial: {
      jurisdiction: provRules.jurisdiction,
      taxableIncomeCents: provTaxableIncomeCents,
      taxOnTaxableIncomeCents: provGrossTaxCents,
      nonRefundableCreditsCents: provNonRefundableCreditsCents,
      basicProvincialTaxCents: basicProvTaxCents,
      surtaxCents: surtaxCents > 0 ? surtaxCents : undefined,
      taxReductionCents: taxReductionCents > 0 ? taxReductionCents : undefined,
      liftCreditCents: liftCreditCents > 0 ? liftCreditCents : undefined,
      healthPremiumCents: healthPremiumCents > 0 ? healthPremiumCents : undefined,
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
