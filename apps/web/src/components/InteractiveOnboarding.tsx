'use client';

import React, { useState } from 'react';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  Compass,
  MapPin,
  FileCheck2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface InteractiveOnboardingProps {
  locale: Locale;
}

export default function InteractiveOnboarding({ locale }: InteractiveOnboardingProps) {
  const dict = getDictionary(locale);
  const [selectedProvince, setSelectedProvince] = useState<string>('ON');

  const provinces = [
    { code: 'ON', slug: 'ontario', name: 'Ontario', form: 'ON428' },
    { code: 'QC', slug: 'quebec', name: 'Québec', form: 'TP-1' },
    { code: 'BC', slug: 'british-columbia', name: 'British Columbia', form: 'BC428' },
    { code: 'AB', slug: 'alberta', name: 'Alberta', form: 'AB428' },
  ];

  return (
    <section className="max-w-7xl mx-auto my-14 space-y-10" id="how-it-works">
      {/* Section Header with clean sans-serif typography */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dict.onboarding.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {dict.onboarding.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.onboarding.subtitle}
        </p>
      </div>

      {/* Single 3-Column Architectural Grid on Open Canvas (Zero Outer Nested Box Wrappers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] border-y border-white/[0.08]">
        
        {/* COLUMN 1: Statutory Jurisdiction Selection */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                01 / JURISDICTION
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MapPin className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {dict.onboarding.step1.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {dict.onboarding.step1.description}
              </p>
            </div>

            {/* Interactive Province Selector (Only visual artifact on this column) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {provinces.map((p) => {
                const isSelected = selectedProvince === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedProvince(p.code)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-[#070b12] border-white/[0.06] text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{p.code}</span>
                      <span className="text-[10px] font-mono text-slate-500">{p.form}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-normal truncate mt-0.5">{p.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step1.tip1Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step1.tip1Desc}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step1.tip2Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step1.tip2Desc}</span>
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Zero-I/O Pure Calculation Engine */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400 tracking-wider">
                02 / ZERO I/O ENGINE
              </span>
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Lock className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {dict.onboarding.step3.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {dict.onboarding.step3.description}
              </p>
            </div>

            {/* Deduction & Privacy Proof Box (Only visual artifact on this column) */}
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">RRSP / FHSA Tax Shield</span>
                <span className="text-emerald-400 font-bold font-mono tabular-nums">-$2,400+ Tax</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Privacy Architecture</span>
                <span className="text-blue-400 font-bold font-mono">100% Client-Side</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-white/[0.06]">
                Salaries never touch remote APIs, databases, or tracking logs.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step3.tip1Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step3.tip1Desc}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step3.tip2Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step3.tip2Desc}</span>
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Official CRA Audits & Mathematical Proof */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                03 / CRA AUDIT TRACES
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCheck2 className="w-4 h-4" />
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {dict.onboarding.step4.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {dict.onboarding.step4.description}
              </p>
            </div>

            {/* Line 42000 Audit Badge (Only visual artifact on this column) */}
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-white/[0.06] space-y-1.5 text-xs font-mono">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>Line 42000 Audited</span>
                <span className="text-[10px] text-slate-400 font-normal">CRA Schedule 1</span>
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed font-sans">
                Every calculation shows statutory formula breakdowns down to the exact integer cent.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step4.tip1Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step4.tip1Desc}</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-slate-200 font-semibold">{dict.onboarding.step4.tip2Title}</strong>{' '}
                <span className="text-slate-400">{dict.onboarding.step4.tip2Desc}</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
