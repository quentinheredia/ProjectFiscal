'use client';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  ArrowRight,
  Calculator,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

interface CalculatorHubProps {
  locale: Locale;
}

export default function CalculatorHub({ locale }: CalculatorHubProps) {
  const dict = getDictionary(locale);

  const provinces = [
    {
      id: 'ontario',
      code: 'ON',
      name: dict.hub.ontario.name,
      badge: dict.hub.ontario.badge,
      desc: dict.hub.ontario.desc,
      href: `/${locale}/calculator/ontario`,
      cta: dict.hub.ontario.cta,
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
      btnColor: 'from-emerald-400 to-teal-300 text-slate-950 hover:from-emerald-300 hover:to-teal-200',
    },
    {
      id: 'quebec',
      code: 'QC',
      name: dict.hub.quebec.name,
      badge: dict.hub.quebec.badge,
      desc: dict.hub.quebec.desc,
      href: `/${locale}/calculator/quebec`,
      cta: dict.hub.quebec.cta,
      borderGlow: 'hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
      badgeColor: 'bg-blue-950/70 text-blue-400 border-blue-500/30',
      btnColor: 'from-blue-400 to-cyan-300 text-slate-950 hover:from-blue-300 hover:to-cyan-200',
    },
    {
      id: 'british-columbia',
      code: 'BC',
      name: dict.hub.bc.name,
      badge: dict.hub.bc.badge,
      desc: dict.hub.bc.desc,
      href: `/${locale}/calculator/british-columbia`,
      cta: dict.hub.bc.cta,
      borderGlow: 'hover:border-teal-500/50 hover:shadow-[0_0_25px_rgba(20,184,166,0.15)]',
      badgeColor: 'bg-teal-950/70 text-teal-400 border-teal-500/30',
      btnColor: 'from-teal-400 to-emerald-300 text-slate-950 hover:from-teal-300 hover:to-emerald-200',
    },
    {
      id: 'alberta',
      code: 'AB',
      name: dict.hub.alberta.name,
      badge: dict.hub.alberta.badge,
      desc: dict.hub.alberta.desc,
      href: `/${locale}/calculator/alberta`,
      cta: dict.hub.alberta.cta,
      borderGlow: 'hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      badgeColor: 'bg-purple-950/70 text-purple-400 border-purple-500/30',
      btnColor: 'from-purple-400 to-pink-300 text-slate-950 hover:from-purple-300 hover:to-pink-200',
    },
  ];

  const salaryFastTracks = [
    { amount: 50000, label: '$50,000', href: `/${locale}/salary/50000/ontario` },
    { amount: 80000, label: '$80,000 (Benchmark)', href: `/${locale}/salary/80000/ontario` },
    { amount: 100000, label: '$100,000', href: `/${locale}/salary/100000/ontario` },
    { amount: 120000, label: '$120,000', href: `/${locale}/salary/120000/ontario` },
    { amount: 150000, label: '$150,000', href: `/${locale}/salary/150000/ontario` },
  ];

  return (
    <section className="max-w-7xl mx-auto my-14 space-y-8" id="calculator-hub">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-950/70 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
          <Calculator className="w-3.5 h-3.5 text-blue-400" />
          <span>{dict.hub.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {dict.hub.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.hub.subtitle}
        </p>
      </div>

      {/* 4 Province Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {provinces.map((prov) => (
          <div
            key={prov.id}
            className={`bg-[#0c121e] rounded-2xl border border-slate-800 p-6 sm:p-7 space-y-5 transition-all duration-300 flex flex-col justify-between ${prov.borderGlow}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#070b12] border border-slate-700/80 flex items-center justify-center font-bold text-xs text-white">
                    {prov.code}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{prov.name}</h3>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${prov.badgeColor}`}>
                  {prov.badge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {prov.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{locale === 'fr' ? 'Barèmes 2026 audités' : '2026 Audited Rules'}</span>
              </span>
              <Link
                href={prov.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r shadow-md transition-all cursor-pointer ${prov.btnColor}`}
              >
                <span>{prov.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Fast-Track Benchmark Shortcuts */}
      <div className="bg-[#0c121e] rounded-2xl border border-slate-800/90 p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{dict.hub.salaryPresetsTitle}</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {dict.hub.salaryPresetsSubtitle}
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30 w-fit">
            Ontario (2026)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {salaryFastTracks.map((item) => (
            <Link
              key={item.amount}
              href={item.href}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#070b12] text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/40 hover:bg-[#0e1624] transition-all cursor-pointer"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
