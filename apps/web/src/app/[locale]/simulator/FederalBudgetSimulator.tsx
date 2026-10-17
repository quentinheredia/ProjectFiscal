'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  RotateCcw,
  Sliders,
  Lock,
  ArrowRight,
  Calculator,
  Info,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface FederalBudgetSimulatorProps {
  locale: Locale;
}

interface BudgetEnvelope {
  id: string;
  nameEn: string;
  nameFr: string;
  category: 'statutory' | 'discretionary';
  baselineBillion: number; // in Billions CAD
  minBillion: number;
  maxBillion: number;
  descEn: string;
  descFr: string;
}

// ~$585.6 Billion CAD Federal Budget Model
const BUDGET_ENVELOPES: BudgetEnvelope[] = [
  // 1. STATUTORY & LOCKED-IN OBLIGATIONS ($297.0B baseline)
  {
    id: 'elderly_benefits',
    nameEn: 'Elderly Benefits (OAS & GIS)',
    nameFr: 'Prestations aux aînés (SV et SRG)',
    category: 'statutory',
    baselineBillion: 102.5,
    minBillion: 85.0,
    maxBillion: 130.0,
    descEn: 'Old Age Security and Guaranteed Income Supplement for 7.3M Canadian seniors.',
    descFr: 'Sécurité de la vieillesse et Supplément de revenu garanti pour 7,3 millions d’aînés.',
  },
  {
    id: 'health_social_transfers',
    nameEn: 'Health & Social Transfers (CHT & CST)',
    nameFr: 'Transferts provinciaux santé et social (TCS / TCPS)',
    category: 'statutory',
    baselineBillion: 94.9,
    minBillion: 75.0,
    maxBillion: 125.0,
    descEn: 'Statutory transfers to provincial governments funding public healthcare and higher education.',
    descFr: 'Transferts constitutionnels aux provinces finançant les hôpitaux et l’éducation supérieure.',
  },
  {
    id: 'public_debt_charges',
    nameEn: 'Public Debt Charges (Bond Interest)',
    nameFr: 'Frais de la dette publique (Intérêts)',
    category: 'statutory',
    baselineBillion: 69.1,
    minBillion: 55.0,
    maxBillion: 95.0,
    descEn: 'Mandatory interest payments servicing federal debt obligations (governed by market interest rates).',
    descFr: 'Paiement obligatoire des intérêts sur la dette souveraine (dépendant des taux de la Banque du Canada).',
  },
  {
    id: 'fiscal_arrangements',
    nameEn: 'Equalization & Territorial Financing',
    nameFr: 'Péréquation et formules territoriales',
    category: 'statutory',
    baselineBillion: 30.5,
    minBillion: 25.0,
    maxBillion: 40.0,
    descEn: 'Constitutional equalization payments ensuring reasonably comparable public services across provinces.',
    descFr: 'Transferts constitutionnels de péréquation garantissant des services publics équivalents entre provinces.',
  },

  // 2. DISCRETIONARY MINISTERIAL ENVELOPES ($288.6B baseline)
  {
    id: 'national_defence',
    nameEn: 'National Defence & CAF Modernization',
    nameFr: 'Défense nationale et modernisation des FAC',
    category: 'discretionary',
    baselineBillion: 44.5,
    minBillion: 25.0,
    maxBillion: 75.0,
    descEn: 'Canadian Armed Forces, NORAD modernization, NATO readiness, and search & rescue operations.',
    descFr: 'Forces armées canadiennes, modernisation du NORAD, engagements de l’OTAN et souveraineté arctique.',
  },
  {
    id: 'indigenous_services',
    nameEn: 'Indigenous Services & Reconciliation',
    nameFr: 'Services aux Autochtones et Réconciliation',
    category: 'discretionary',
    baselineBillion: 41.6,
    minBillion: 25.0,
    maxBillion: 65.0,
    descEn: 'Clean drinking water infrastructure, First Nations schooling, healthcare facilities, and child welfare agreements.',
    descFr: 'Eau potable, écoles des Premières Nations, dispensaires et accords sur la protection de l’enfance.',
  },
  {
    id: 'children_family',
    nameEn: 'Canada Child Benefit (CCB) & Families',
    nameFr: 'Allocation canadienne pour enfants (ACE)',
    category: 'discretionary',
    baselineBillion: 39.3,
    minBillion: 20.0,
    maxBillion: 55.0,
    descEn: 'Monthly tax-free assistance to lift children out of poverty and subsidized $10/day early learning centers.',
    descFr: 'Soutien mensuel non imposable et subventions pour les garderies éducatives à 10 $/jour.',
  },
  {
    id: 'employment_insurance',
    nameEn: 'Employment Insurance & Skills Training',
    nameFr: 'Assurance-emploi et formation des compétences',
    category: 'discretionary',
    baselineBillion: 34.0,
    minBillion: 20.0,
    maxBillion: 50.0,
    descEn: 'Income stabilization during economic transitions, parental leave, and vocational apprenticeship grants.',
    descFr: 'Soutien du revenu lors des arrêts d’activité, congés parentaux et subventions aux apprentis.',
  },
  {
    id: 'infrastructure_green',
    nameEn: 'National Infrastructure & Transit',
    nameFr: 'Infrastructures nationales et transport en commun',
    category: 'discretionary',
    baselineBillion: 31.6,
    minBillion: 15.0,
    maxBillion: 55.0,
    descEn: 'Federal investments in subway transit lines, interprovincial bridges, ports, and renewable energy grids.',
    descFr: 'Lignes de métro, ponts interprovinciaux, ports maritimes et réseaux électriques renouvelables.',
  },
  {
    id: 'public_safety_justice',
    nameEn: 'Public Safety, RCMP & Border Security',
    nameFr: 'Sécurité publique, GRC et frontières (ASFC)',
    category: 'discretionary',
    baselineBillion: 24.6,
    minBillion: 15.0,
    maxBillion: 40.0,
    descEn: 'Federal law enforcement, CBSA border checkpoints, federal correctional institutions, and cybersecurity.',
    descFr: 'Police fédérale, douanes et surveillance des frontières, établissements correctionnels et cybersécurité.',
  },
  {
    id: 'economic_innovation',
    nameEn: 'Innovation, Science & Regional Agencies',
    nameFr: 'Innovation, Science et agences régionales',
    category: 'discretionary',
    baselineBillion: 22.3,
    minBillion: 10.0,
    maxBillion: 45.0,
    descEn: 'University research councils, artificial intelligence superclusters, and regional economic development grants.',
    descFr: 'Conseils de recherche universitaires, supergrappes d’intelligence artificielle et développement économique régional.',
  },
  {
    id: 'general_operations',
    nameEn: 'CRA, Global Affairs & Federal Operations',
    nameFr: 'ARC, Affaires mondiales et services publics',
    category: 'discretionary',
    baselineBillion: 50.7,
    minBillion: 35.0,
    maxBillion: 70.0,
    descEn: 'CRA revenue processing, consular services worldwide, Statistics Canada, and Parliament of Canada operations.',
    descFr: 'Administration de l’ARC, réseau diplomatique mondial, Statistique Canada et institutions parlementaires.',
  },
];

const BASELINE_TOTAL = BUDGET_ENVELOPES.reduce((acc, curr) => acc + curr.baselineBillion, 0);
const CANADIAN_INCOME_TAX_FILERS = 20_500_000; // ~20.5M individual taxpayers in Canada

export default function FederalBudgetSimulator({ locale }: FederalBudgetSimulatorProps) {
  const dict = getDictionary(locale);

  // Initialize envelope allocations with their baseline values
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const env of BUDGET_ENVELOPES) {
      init[env.id] = env.baselineBillion;
    }
    return init;
  });

  const statutoryEnvelopes = useMemo(() => BUDGET_ENVELOPES.filter((e) => e.category === 'statutory'), []);
  const discretionaryEnvelopes = useMemo(() => BUDGET_ENVELOPES.filter((e) => e.category === 'discretionary'), []);

  const statutoryTotal = useMemo(() => {
    return statutoryEnvelopes.reduce((sum, env) => sum + (allocations[env.id] ?? env.baselineBillion), 0);
  }, [allocations, statutoryEnvelopes]);

  const discretionaryTotal = useMemo(() => {
    return discretionaryEnvelopes.reduce((sum, env) => sum + (allocations[env.id] ?? env.baselineBillion), 0);
  }, [allocations, discretionaryEnvelopes]);

  const totalSpending = useMemo(() => statutoryTotal + discretionaryTotal, [statutoryTotal, discretionaryTotal]);

  const statutoryPct = totalSpending > 0 ? Math.round((statutoryTotal / totalSpending) * 100) : 51;
  const discretionaryPct = 100 - statutoryPct; // Guarantee exact 100% sum

  const variance = totalSpending - BASELINE_TOTAL;
  const isSurplus = variance < -0.1; // Reduced spending means surplus relative to baseline
  const isDeficit = variance > 0.1;

  // Per-taxpayer fiscal impact: (variance in billions * 1,000,000,000) / 20.5M filers
  const perTaxpayerImpact = Math.round((variance * 1_000_000_000) / CANADIAN_INCOME_TAX_FILERS);

  const handleSliderChange = (id: string, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [id]: Math.round(value * 10) / 10,
    }));
  };

  const resetToBaseline = () => {
    const resetVals: Record<string, number> = {};
    for (const env of BUDGET_ENVELOPES) {
      resetVals[env.id] = env.baselineBillion;
    }
    setAllocations(resetVals);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="space-y-4 max-w-4xl">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {dict.budgetSimulator.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.budgetSimulator.subtitle}
        </p>
      </div>

      {/* Floating Sticky Summary Console (Pinned flush under Navbar top-18 with solid dark backdrop blur) */}
      <div className="sticky top-18 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#090d16]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c121e]/90 p-5 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Total Budget Spent */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.budgetSimulator.totalSpending}
              </span>
              <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                ${totalSpending.toFixed(1)} {dict.budgetSimulator.billionUnit}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {dict.budgetSimulator.baselineTarget}
              </span>
            </div>

            {/* Variance / Deficit or Surplus */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {dict.budgetSimulator.deficitSurplus}
              </span>
              <div
                className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${
                  isDeficit
                    ? 'text-red-400'
                    : isSurplus
                    ? 'text-emerald-400'
                    : 'text-slate-200'
                }`}
              >
                {variance > 0 ? `+$${variance.toFixed(1)}` : variance < 0 ? `-$${Math.abs(variance).toFixed(1)}` : '$0.0'}{' '}
                {dict.budgetSimulator.billionUnit}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {isDeficit
                  ? (locale === 'fr' ? 'Dépenses supérieures au budget de référence' : 'Spending higher than baseline target')
                  : isSurplus
                  ? (locale === 'fr' ? 'Économies nettes par rapport à la référence' : 'Net savings vs. baseline target')
                  : dict.budgetSimulator.balanced}
              </span>
            </div>

            {/* Dynamic Statutory vs Discretionary Breakdown (Guaranteed exact 100% sum) */}
            <div className="space-y-1.5 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="text-yellow-400">
                  {locale === 'fr' ? `Statutaire (${statutoryPct} %)` : `Statutory (${statutoryPct}%)`}
                </span>
                <span className="text-blue-400">
                  {locale === 'fr' ? `Discrétionnaire (${discretionaryPct} %)` : `Discretionary (${discretionaryPct}%)`}
                </span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-900 border border-white/[0.08]">
                <div
                  style={{ width: `${statutoryPct}%` }}
                  className="bg-yellow-500 h-full transition-all duration-300"
                  title={`Statutory: ${statutoryPct}% ($${statutoryTotal.toFixed(1)}B)`}
                />
                <div
                  style={{ width: `${discretionaryPct}%` }}
                  className="bg-blue-500 h-full transition-all duration-300"
                  title={`Discretionary: ${discretionaryPct}% ($${discretionaryTotal.toFixed(1)}B)`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                  ${statutoryTotal.toFixed(1)}B
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  ${discretionaryTotal.toFixed(1)}B
                </span>
              </div>
            </div>

            {/* Action Buttons: Reset & Jump to Tax Calculator */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 justify-center">
              <button
                type="button"
                onClick={resetToBaseline}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2c] hover:bg-[#1e273d] border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>{dict.budgetSimulator.reset}</span>
              </button>

              <Link
                href={`/${locale}`}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{locale === 'fr' ? 'Calculateur d’impôt' : 'Personal Tax Calculator'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: STATUTORY & LOCKED-IN OBLIGATIONS (Dynamic % Tag) */}
      <section className="space-y-4">
        <div className="border-b border-white/[0.08] pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-yellow-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {locale === 'fr'
                ? `1. Obligations statutaires et verrouillées (${statutoryPct} %)`
                : `1. Statutory & Locked-In Obligations (${statutoryPct}%)`}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              {dict.budgetSimulator.lockedBadge}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {dict.budgetSimulator.statutorySectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statutoryEnvelopes.map((env) => {
            const currentVal = allocations[env.id] ?? env.baselineBillion;
            const diff = currentVal - env.baselineBillion;
            return (
              <div
                key={env.id}
                className="p-5 rounded-2xl bg-[#0c121e]/70 border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">
                    {locale === 'fr' ? env.nameFr : env.nameEn}
                  </span>
                  <div className="flex items-center gap-1 text-right">
                    <span className="text-base font-black text-white tabular-nums">
                      ${currentVal.toFixed(1)} {dict.budgetSimulator.billionUnit}
                    </span>
                    {Math.abs(diff) > 0.05 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {locale === 'fr' ? env.descFr : env.descEn}
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>${env.minBillion}B min</span>
                    <span className="text-yellow-400/80 font-mono">Baseline: ${env.baselineBillion}B</span>
                    <span>${env.maxBillion}B max</span>
                  </div>
                  <input
                    type="range"
                    min={env.minBillion}
                    max={env.maxBillion}
                    step={0.5}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(env.id, Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: DISCRETIONARY MINISTERIAL PORTFOLIOS (3x3 Complete Grid with 9th Per-Taxpayer Card) */}
      <section className="space-y-4 pt-4">
        <div className="border-b border-white/[0.08] pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {locale === 'fr'
                ? `2. Enveloppes ministérielles discrétionnaires (${discretionaryPct} %)`
                : `2. Discretionary Ministerial Envelopes (${discretionaryPct}%)`}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {dict.budgetSimulator.flexibleBadge}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {dict.budgetSimulator.discretionarySectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discretionaryEnvelopes.map((env) => {
            const currentVal = allocations[env.id] ?? env.baselineBillion;
            const diff = currentVal - env.baselineBillion;
            return (
              <div
                key={env.id}
                className="p-5 rounded-2xl bg-[#0c121e]/70 border border-white/[0.08] space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm truncate">
                    {locale === 'fr' ? env.nameFr : env.nameEn}
                  </span>
                  <div className="flex items-center gap-1 text-right shrink-0">
                    <span className="text-sm font-black text-white tabular-nums">
                      ${currentVal.toFixed(1)}B
                    </span>
                    {Math.abs(diff) > 0.05 && (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          diff > 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {locale === 'fr' ? env.descFr : env.descEn}
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>${env.minBillion}B</span>
                    <span className="text-blue-400/80 font-mono">Base: ${env.baselineBillion}B</span>
                    <span>${env.maxBillion}B</span>
                  </div>
                  <input
                    type="range"
                    min={env.minBillion}
                    max={env.maxBillion}
                    step={0.5}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(env.id, Number(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}

          {/* 9TH CARD: 3x3 GRID COMPLETION — PER-TAXPAYER FISCAL IMPACT */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c121e] to-[#121927] border border-emerald-500/30 space-y-3 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.06)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-white text-sm">
                    {dict.budgetSimulator.perTaxpayerCard.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shrink-0">
                  {dict.budgetSimulator.perTaxpayerCard.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {dict.budgetSimulator.perTaxpayerCard.desc}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#080d16] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{dict.budgetSimulator.perTaxpayerCard.impactLabel}:</span>
                <div className="flex items-center gap-1">
                  {perTaxpayerImpact > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                  ) : perTaxpayerImpact < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                  <span
                    className={`font-black font-mono text-sm tabular-nums ${
                      perTaxpayerImpact > 0
                        ? 'text-red-400'
                        : perTaxpayerImpact < 0
                        ? 'text-emerald-400'
                        : 'text-slate-200'
                    }`}
                  >
                    {perTaxpayerImpact > 0 ? `+$${perTaxpayerImpact.toLocaleString()}` : perTaxpayerImpact < 0 ? `-$${Math.abs(perTaxpayerImpact).toLocaleString()}` : '$0'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 block text-right font-medium">
                {perTaxpayerImpact === 0
                  ? dict.budgetSimulator.perTaxpayerCard.baselineText
                  : perTaxpayerImpact < 0
                  ? dict.budgetSimulator.perTaxpayerCard.surplusText
                  : dict.budgetSimulator.perTaxpayerCard.deficitText}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory locked disclaimer */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>{dict.budgetSimulator.statutoryLockedNotice}</span>
      </div>
    </div>
  );
}
