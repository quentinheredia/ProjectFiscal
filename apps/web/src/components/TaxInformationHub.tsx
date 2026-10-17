'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import { useProvince, PROVINCES_LIST, ProvinceSlug, DEFAULT_PROVINCE } from '@/context/ProvinceContext';
import {
  federal2026,
  ontario2026,
  quebec2026,
  britishColumbia2026,
  alberta2026,
} from '@fiscal-insights/tax-data';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import {
  Scale,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';

interface TaxInformationHubProps {
  locale: Locale;
}

const PROVINCIAL_DATA: Record<
  ProvinceSlug,
  {
    rules: typeof ontario2026;
    color: string;
    rateColor: string;
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    citation: string;
    citationFr: string;
  }
> = {
  ontario: {
    rules: ontario2026,
    color: 'bg-amber-400',
    rateColor: 'text-amber-400',
    badgeBorder: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    citation: 'Form ON428, Part A',
    citationFr: 'Formulaire ON428, partie A',
  },
  quebec: {
    rules: quebec2026,
    color: 'bg-indigo-400',
    rateColor: 'text-indigo-400',
    badgeBorder: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-300',
    citation: 'Revenu Québec TP-1, Line 401',
    citationFr: 'Revenu Québec TP-1, ligne 401',
  },
  'british-columbia': {
    rules: britishColumbia2026,
    color: 'bg-teal-400',
    rateColor: 'text-teal-400',
    badgeBorder: 'border-teal-500/40',
    badgeBg: 'bg-teal-500/15',
    badgeText: 'text-teal-300',
    citation: 'Form BC428, Part A',
    citationFr: 'Formulaire BC428, partie A',
  },
  alberta: {
    rules: alberta2026,
    color: 'bg-sky-400',
    rateColor: 'text-sky-400',
    badgeBorder: 'border-sky-500/40',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-300',
    citation: 'Form AB428, Part A',
    citationFr: 'Formulaire AB428, partie A',
  },
};

export default function TaxInformationHub({ locale }: TaxInformationHubProps) {
  const dict = getDictionary(locale);
  const { selectedProvince } = useProvince();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeProvinceConfig =
    PROVINCES_LIST.find((p) => p.slug === selectedProvince.slug) ?? DEFAULT_PROVINCE;
  const activeProvData = PROVINCIAL_DATA[activeProvinceConfig.slug] ?? PROVINCIAL_DATA.ontario;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: dict.infoHub.faq.q1, a: dict.infoHub.faq.a1 },
    { q: dict.infoHub.faq.q2, a: dict.infoHub.faq.a2 },
    { q: dict.infoHub.faq.q3, a: dict.infoHub.faq.a3 },
    { q: dict.infoHub.faq.q4, a: dict.infoHub.faq.a4 },
  ];

  return (
    <section className="max-w-7xl mx-auto my-14 space-y-14" id="tax-information">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {dict.infoHub.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.infoHub.subtitle}
        </p>
      </div>

      {/* 1. Official 2026 Tax Brackets (Federal + Dynamic Provincial Brackets with Selector) */}
      <div id="brackets" className="space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            {locale === 'fr' ? 'Barèmes officiels indexés' : 'Statutory Schedules'}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.infoHub.brackets.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {dict.infoHub.brackets.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Federal Brackets Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between min-h-[32px]">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{dict.infoHub.brackets.federalTitle}</span>
              </h4>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">
                CRA Federal
              </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                    <th className="py-3 px-4">{dict.infoHub.brackets.thresholdCol}</th>
                    <th className="py-3 px-4">{dict.infoHub.brackets.rateCol}</th>
                    <th className="py-3 px-4">{dict.infoHub.brackets.citationCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
                  {federal2026.brackets.map((b, idx) => {
                    const prevBracket = idx > 0 ? federal2026.brackets[idx - 1] : undefined;
                    const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                    const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : (locale === 'fr' ? 'Tout montant supérieur' : 'Above this threshold');
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-medium text-white tabular-nums">
                          {prevUpTo} – {currentUpTo}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-blue-400 tabular-nums">
                          {(b.rate.value * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                          Schedule 1, Part B
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-1">
              <span className="text-xs text-slate-500 font-mono">
                {locale === 'fr' ? 'S’applique à tous les résidents canadiens' : 'Applies to all Canadian residents'}
              </span>
            </div>
          </div>

          {/* Dynamic Provincial Brackets Table (Driven by Navbar Province State) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between min-h-[32px]">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${activeProvData.color}`} />
                <span>
                  {locale === 'fr'
                    ? `Barèmes ${activeProvinceConfig.nameFr} 2026 (${activeProvinceConfig.form})`
                    : `2026 ${activeProvinceConfig.nameEn} Provincial Brackets (Form ${activeProvinceConfig.form})`}
                </span>
              </h4>

              {/* Active Jurisdiction Badge (Synced from Navbar) */}
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-sm ${activeProvData.badgeBg} ${activeProvData.badgeText} border ${activeProvData.badgeBorder}`}
              >
                📍 {activeProvinceConfig.nameEn} ({activeProvinceConfig.code})
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                    <th className="py-3 px-4">{dict.infoHub.brackets.thresholdCol}</th>
                    <th className="py-3 px-4">{dict.infoHub.brackets.rateCol}</th>
                    <th className="py-3 px-4">{dict.infoHub.brackets.citationCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
                  {activeProvData.rules.brackets.map((b, idx) => {
                    const prevBracket = idx > 0 ? activeProvData.rules.brackets[idx - 1] : undefined;
                    const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                    const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : (locale === 'fr' ? 'Tout montant supérieur' : 'Above this threshold');
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-medium text-white tabular-nums">
                          {prevUpTo} – {currentUpTo}
                        </td>
                        <td className={`py-2.5 px-4 font-bold tabular-nums ${activeProvData.rateColor}`}>
                          {(b.rate.value * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                          {locale === 'fr' ? activeProvData.citationFr : activeProvData.citation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Link to Launch Calculator for Selected Province */}
            <div className="flex justify-end pt-1">
              <Link
                href={`/${locale}/calculator/${activeProvinceConfig.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <span>
                  {locale === 'fr'
                    ? `Calculer l'impôt en ${activeProvinceConfig.nameFr} (${activeProvinceConfig.code})`
                    : `Calculate ${activeProvinceConfig.nameEn} (${activeProvinceConfig.code}) Taxes`}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Marginal Rate vs. Average Tax Rate Guide & RRSP/FHSA Optimization (Open-Canvas 2-Column Hairline Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] border-y border-white/[0.08] py-10">
        {/* Marginal vs Average */}
        <div className="p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-400">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {dict.infoHub.marginalVsAverage.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {dict.infoHub.marginalVsAverage.description}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="border-l-2 border-blue-400/80 pl-4 py-1 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.marginalVsAverage.point1Title}
              </span>
              <p className="text-slate-400 leading-relaxed">{dict.infoHub.marginalVsAverage.point1Desc}</p>
            </div>
            <div className="border-l-2 border-emerald-400/80 pl-4 py-1 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.marginalVsAverage.point2Title}
              </span>
              <p className="text-slate-400 leading-relaxed">{dict.infoHub.marginalVsAverage.point2Desc}</p>
            </div>
          </div>
        </div>

        {/* RRSP & FHSA Optimization */}
        <div className="p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {dict.infoHub.deductions.title}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {dict.infoHub.deductions.description}
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="border-l-2 border-purple-400/80 pl-4 py-1 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.deductions.rrspTitle}
              </span>
              <p className="text-slate-400 leading-relaxed">{dict.infoHub.deductions.rrspDesc}</p>
            </div>
            <div className="border-l-2 border-teal-400/80 pl-4 py-1 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.deductions.fhsaTitle}
              </span>
              <p className="text-slate-400 leading-relaxed">{dict.infoHub.deductions.fhsaDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 2026 Statutory Payroll Ceilings (CPP, CPP2, EI) — Open Canvas Header with Single Bordered Hairline Box */}
      <div className="space-y-5">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            {locale === 'fr' ? 'Cotisations salariales obligatoires' : 'Mandatory Payroll Limits'}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.infoHub.ceilings.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {dict.infoHub.ceilings.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0a0f1a]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)] text-xs">
          <div className="p-6 space-y-2 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.cppBaseTitle}</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">$73,200</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.cppBaseDesc}
            </p>
          </div>

          <div className="p-6 space-y-2 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.cpp2Title}</span>
              <span className="font-mono text-purple-400 font-bold tabular-nums">$81,200</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.cpp2Desc}
            </p>
          </div>

          <div className="p-6 space-y-2 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.eiTitle}</span>
              <span className="font-mono text-blue-400 font-bold tabular-nums">$65,700</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.eiDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 4. The Famous $80,000 Ontario Test: Old Site vs. Rebuild (Audit Verification Point) — Open Canvas Header with Flush Table */}
      <div id="legacy-audit" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              {locale === 'fr' ? 'VÉRIFICATION D’AUDIT LÉGAL DE L’ARC' : 'CRA STATUTORY AUDIT VERIFICATION'}
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
              {dict.pitch.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {dict.pitch.subtitle} (Ontario, $80,000 benchmark)
            </p>
          </div>
          <Link
            href={`/${locale}/salary/80000/ontario`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.18)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.25)] transition-all shrink-0 cursor-pointer"
          >
            <span>{dict.pitch.inspectAuditAction}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)] bg-[#0a0f1a]/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                <th className="py-3.5 px-4">{dict.pitch.table.line}</th>
                <th className="py-3.5 px-4 text-rose-400 bg-rose-950/20">{dict.pitch.table.oldSite}</th>
                <th className="py-3.5 px-4 text-emerald-400 bg-emerald-500/[0.08] border-x border-emerald-500/20 font-bold">{dict.pitch.table.newEngine}</th>
                <th className="py-3.5 px-4">{dict.pitch.table.difference}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]/80">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.fedLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-rose-400 bg-rose-950/10">$10,323.00</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$9,242.60</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.fedDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.provLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-rose-400 bg-rose-950/10">$3,985.00</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$4,885.26</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.provDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.cppLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$4,382.10</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$4,446.45</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.cppDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.eiLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$1,077.48</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$1,123.07</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.eiDiff}</td>
              </tr>
              <tr className="bg-[#070b12] font-bold">
                <td className="py-3.5 px-4 text-white">{dict.pitch.table.netLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$60,232.42</td>
                <td className="py-3.5 px-4 tabular-nums text-emerald-400 bg-emerald-500/[0.08] border-x border-emerald-500/30">$60,302.62</td>
                <td className="py-3.5 px-4 text-emerald-300/90 font-medium">{dict.pitch.table.netDiff}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Frequently Asked Questions (Asymmetric 12-Column Open Editorial Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 border-t border-white/[0.08]">
        {/* Left Column (lg:col-span-4): Badge, Title, Subtitle */}
        <div className="lg:col-span-4 space-y-3">
          <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 w-fit">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {dict.infoHub.faq.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {locale === 'fr'
              ? 'Réponses claires aux questions courantes sur la précision fiscale et la confidentialité.'
              : 'Direct answers to key questions regarding mathematical accuracy, statutory data, and private execution.'}
          </p>
        </div>

        {/* Right Column (lg:col-span-8): Accordion Items Separated Strictly by Hairlines */}
        <div className="lg:col-span-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 font-semibold text-sm text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2.5 pt-1">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
