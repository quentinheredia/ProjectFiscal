'use client';

import React, { useState } from 'react';
import { Locale, getDictionary } from '@/lib/i18n';
import { federal2026, ontario2026 } from '@fiscal-insights/tax-data';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import {
  BookOpen,
  Scale,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TaxInformationHubProps {
  locale: Locale;
}

export default function TaxInformationHub({ locale }: TaxInformationHubProps) {
  const dict = getDictionary(locale);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <section className="max-w-7xl mx-auto my-14 space-y-12" id="tax-information">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-950/70 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <BookOpen className="w-3.5 h-3.5 text-purple-400" />
          <span>{dict.infoHub.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {dict.infoHub.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.infoHub.subtitle}
        </p>
      </div>

      {/* 1. Official 2026 Tax Brackets (Federal & Ontario) */}
      <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            {locale === 'fr' ? 'Barèmes officiels indexés' : 'Statutory Schedules'}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.infoHub.brackets.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {dict.infoHub.brackets.subtitle} {dict.infoHub.brackets.federalTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Federal Brackets Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>{dict.infoHub.brackets.federalTitle}</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.thresholdCol}</th>
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.rateCol}</th>
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.citationCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
                  {federal2026.brackets.map((b, idx) => {
                    const prevBracket = idx > 0 ? federal2026.brackets[idx - 1] : undefined;
                    const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                    const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : (locale === 'fr' ? 'Tout montant supérieur' : 'Above this threshold');
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3.5 font-medium text-white tabular-nums">
                          {prevUpTo} – {currentUpTo}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-blue-400 tabular-nums">
                          {(b.rate.value * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">
                          Schedule 1, Part B
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ontario Brackets Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>{dict.infoHub.brackets.ontarioTitle}</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.thresholdCol}</th>
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.rateCol}</th>
                    <th className="py-2.5 px-3.5">{dict.infoHub.brackets.citationCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
                  {ontario2026.brackets.map((b, idx) => {
                    const prevBracket = idx > 0 ? ontario2026.brackets[idx - 1] : undefined;
                    const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                    const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : (locale === 'fr' ? 'Tout montant supérieur' : 'Above this threshold');
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3.5 font-medium text-white tabular-nums">
                          {prevUpTo} – {currentUpTo}
                        </td>
                        <td className="py-2.5 px-3.5 font-bold text-yellow-400 tabular-nums">
                          {(b.rate.value * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">
                          Form ON428, Part A
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Marginal Rate vs. Average Tax Rate Guide & RRSP/FHSA Optimization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marginal vs Average */}
        <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 p-6 sm:p-7 space-y-4">
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

          <div className="space-y-3 pt-2">
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.marginalVsAverage.point1Title}
              </span>
              <p className="text-slate-400">{dict.infoHub.marginalVsAverage.point1Desc}</p>
            </div>
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.marginalVsAverage.point2Title}
              </span>
              <p className="text-slate-400">{dict.infoHub.marginalVsAverage.point2Desc}</p>
            </div>
          </div>
        </div>

        {/* RRSP & FHSA Optimization */}
        <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 p-6 sm:p-7 space-y-4">
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

          <div className="space-y-3 pt-2">
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.deductions.rrspTitle}
              </span>
              <p className="text-slate-400">{dict.infoHub.deductions.rrspDesc}</p>
            </div>
            <div className="bg-[#070b12] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white block">
                {dict.infoHub.deductions.fhsaTitle}
              </span>
              <p className="text-slate-400">{dict.infoHub.deductions.fhsaDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 2026 Statutory Payroll Ceilings (CPP, CPP2, EI) */}
      <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 p-6 sm:p-7 space-y-5">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            {locale === 'fr' ? 'Cotisations salariales obligatoires' : 'Mandatory Payroll Limits'}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.infoHub.ceilings.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {dict.infoHub.ceilings.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.cppBaseTitle}</span>
              <span className="font-mono text-emerald-400 font-bold">$73,200</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.cppBaseDesc}
            </p>
          </div>

          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.cpp2Title}</span>
              <span className="font-mono text-purple-400 font-bold">$81,200</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.cpp2Desc}
            </p>
          </div>

          <div className="bg-[#070b12] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">{dict.infoHub.ceilings.eiTitle}</span>
              <span className="font-mono text-blue-400 font-bold">$65,700</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {dict.infoHub.ceilings.eiDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 4. The Famous $80,000 Ontario Test: Old Site vs. Rebuild */}
      <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            {locale === 'fr' ? 'Preuve d’audit rigoureuse' : 'Audit Verification Point'}
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.pitch.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {dict.pitch.subtitle} (Ontario, $80,000 benchmark)
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
                <th className="py-3 px-4">{dict.pitch.table.line}</th>
                <th className="py-3 px-4 text-red-400 bg-red-950/30">{dict.pitch.table.oldSite}</th>
                <th className="py-3 px-4 text-emerald-400 bg-emerald-950/30">{dict.pitch.table.newEngine}</th>
                <th className="py-3 px-4">{dict.pitch.table.difference}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Federal Tax</td>
                <td className="py-3 px-4 tabular-nums text-red-400 bg-red-950/15">$10,323</td>
                <td className="py-3 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-950/20">~$9,552</td>
                <td className="py-3 px-4 text-slate-400">Old site was ~$771 too high (used obsolete pre-2025 brackets).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Ontario Tax + OHP</td>
                <td className="py-3 px-4 tabular-nums text-red-400 bg-red-950/15">$3,985</td>
                <td className="py-3 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-950/20">~$4,940</td>
                <td className="py-3 px-4 text-slate-400">Old site was ~$955 too low (completely omitted Ontario Health Premium of $750).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">CPP + CPP2</td>
                <td className="py-3 px-4 tabular-nums text-slate-300">$4,382.10</td>
                <td className="py-3 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-950/20">$4,382.10</td>
                <td className="py-3 px-4 text-slate-400">Exact match on YMPE + enhanced CPP2 ceiling.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Employment Insurance (EI)</td>
                <td className="py-3 px-4 tabular-nums text-slate-300">$1,077.48</td>
                <td className="py-3 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-950/20">$1,077.48</td>
                <td className="py-3 px-4 text-slate-400">Exact match on maximum insurable earnings limit.</td>
              </tr>
              <tr className="bg-[#070b12] font-bold">
                <td className="py-3 px-4 text-white">Take-Home Net Income</td>
                <td className="py-3 px-4 tabular-nums text-slate-300">$60,232</td>
                <td className="py-3 px-4 tabular-nums text-emerald-400 bg-emerald-950/30">~$60,048</td>
                <td className="py-3 px-4 text-slate-300">Net looked plausible only because two large errors canceled each other out!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Frequently Asked Questions Accordion */}
      <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {dict.infoHub.faq.title}
          </h3>
        </div>

        <div className="divide-y divide-slate-800">
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
