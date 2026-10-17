'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Onboarding, TipsList } from '@/components/ui/onboarding';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  Compass,
  MapPin,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface InteractiveOnboardingProps {
  locale: Locale;
}

export default function InteractiveOnboarding({ locale }: InteractiveOnboardingProps) {
  const dict = getDictionary(locale);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDemoProvince, setSelectedDemoProvince] = useState<string>('ON');
  const [demoIncome, setDemoIncome] = useState<number>(85000);
  const [demoRrsp, setDemoRrsp] = useState<number>(8000);

  // Approximate marginal tax savings preview for Step 3 demonstration
  const estSavings = Math.round(demoRrsp * 0.3148);

  return (
    <section className="max-w-5xl mx-auto my-14 bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-9 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dict.onboarding.badge}</span>
        </div>
      </div>

      <Onboarding
        totalSteps={5}
        value={activeStep}
        onValueChange={setActiveStep}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {dict.onboarding.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {dict.onboarding.subtitle}
            </p>
          </div>
          <Onboarding.StepIndicator />
        </div>

        {/* STEP 1: PROVINCE & TAX YEAR */}
        <Onboarding.Step step={1} className="space-y-4">
          <Onboarding.Header
            title={dict.onboarding.step1.title}
            description={dict.onboarding.step1.description}
          />
          <div className="bg-[#070b12] rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {[
                { code: 'ON', label: 'Ontario (ON428)' },
                { code: 'QC', label: 'Québec (TP-1)' },
                { code: 'BC', label: 'British Columbia (BC428)' },
                { code: 'AB', label: 'Alberta (AB428)' },
              ].map((p) => (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setSelectedDemoProvince(p.code)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedDemoProvince === p.code
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      : 'bg-[#0f1422] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {p.label}
                </button>
              ))}
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step1.tip1Title}
                  </span>
                  <span>{dict.onboarding.step1.tip1Desc}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step1.tip2Title}
                  </span>
                  <span>{dict.onboarding.step1.tip2Desc}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 2: SALARY & FREQUENCIES */}
        <Onboarding.Step step={2} className="space-y-4">
          <Onboarding.Header
            title={dict.onboarding.step2.title}
            description={dict.onboarding.step2.description}
          />
          <div className="bg-[#070b12] rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c121e] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">
                  {locale === 'fr' ? 'Exemple de rémunération :' : 'Sample Gross Income:'}
                </span>
                <span className="text-xs font-bold text-emerald-400 tabular-nums">
                  ${demoIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[65000, 85000, 115000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setDemoIncome(inc)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium cursor-pointer ${
                      demoIncome === inc
                        ? 'bg-slate-700 text-white'
                        : 'bg-[#070b12] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ${(inc / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step2.tip1Title}
                  </span>
                  <span>{dict.onboarding.step2.tip1Desc}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step2.tip2Title}
                  </span>
                  <span>{dict.onboarding.step2.tip2Desc}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 3: RRSP & FHSA DEDUCTIONS */}
        <Onboarding.Step step={3} className="space-y-4">
          <Onboarding.Header
            title={dict.onboarding.step3.title}
            description={dict.onboarding.step3.description}
          />
          <div className="bg-[#070b12] rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="bg-[#0c121e] p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">
                  {locale === 'fr' ? 'Cotisation REER simulée :' : 'Modeled RRSP Contribution:'}
                </span>
                <span className="text-xs font-bold text-purple-400">${demoRrsp.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[4000, 8000, 12000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDemoRrsp(amt)}
                    className={`px-2 py-0.5 text-xs rounded-md font-medium cursor-pointer ${
                      demoRrsp === amt
                        ? 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                        : 'bg-[#070b12] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ${(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                {locale === 'fr'
                  ? `Économie d’impôt immédiate : ~${estSavings.toLocaleString()} $`
                  : `Instant Tax Reduction: ~$${estSavings.toLocaleString()}`}
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step3.tip1Title}
                  </span>
                  <span>{dict.onboarding.step3.tip1Desc}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step3.tip2Title}
                  </span>
                  <span>{dict.onboarding.step3.tip2Desc}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 4: AUDITABLE LINE-BY-LINE TRACES */}
        <Onboarding.Step step={4} className="space-y-4">
          <Onboarding.Header
            title={dict.onboarding.step4.title}
            description={dict.onboarding.step4.description}
          />
          <div className="bg-[#070b12] rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="bg-[#0c121e] p-3 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
              <div className="text-emerald-400 font-bold">Line 42000: Net Federal Tax</div>
              <div className="text-slate-400 text-[11px]">
                = Tax on Taxable Income ($13,420.50) - Federal Non-Refundable Credits ($2,258.06)
              </div>
              <div className="text-[10px] text-blue-400 pt-0.5">
                Official source: CRA Schedule 1, Line 42000 (Tax year 2026)
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step4.tip1Title}
                  </span>
                  <span>{dict.onboarding.step4.tip1Desc}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step4.tip2Title}
                  </span>
                  <span>{dict.onboarding.step4.tip2Desc}</span>
                </div>
              </TipsList.Item>
            </TipsList>
          </div>
        </Onboarding.Step>

        {/* STEP 5: PUBLIC SPENDING ALLOCATION */}
        <Onboarding.Step step={5} className="space-y-4">
          <Onboarding.Header
            title={dict.onboarding.step5.title}
            description={dict.onboarding.step5.description}
          />
          <div className="bg-[#070b12] rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0c121e] p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-white font-semibold block">
                  {locale === 'fr' ? 'Santé & Programmes Sociaux' : 'Health & Social Transfers'}
                </span>
                <span className="text-emerald-400 font-bold">25.0% of Federal Budget</span>
              </div>
              <div className="bg-[#0c121e] p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-white font-semibold block">
                  {locale === 'fr' ? 'Prestations aux aînés (SV / SRG)' : 'Elderly Benefits (OAS / GIS)'}
                </span>
                <span className="text-emerald-400 font-bold">17.2% of Federal Budget</span>
              </div>
            </div>

            <TipsList className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step5.tip1Title}
                  </span>
                  <span>{dict.onboarding.step5.tip1Desc}</span>
                </div>
              </TipsList.Item>
              <TipsList.Item className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">
                    {dict.onboarding.step5.tip2Title}
                  </span>
                  <span>{dict.onboarding.step5.tip2Desc}</span>
                </div>
              </TipsList.Item>
            </TipsList>

            {/* Direct CTA on the Final Step */}
            <div className="pt-3 flex justify-end">
              <Link
                href={`/${locale}/calculator/ontario`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{dict.onboarding.launchCta} (Ontario)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Onboarding.Step>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Onboarding.Navigation />
        </div>
      </Onboarding>
    </section>
  );
}
