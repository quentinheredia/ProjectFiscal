'use client';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  ArrowRight,
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
      badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'quebec',
      code: 'QC',
      name: dict.hub.quebec.name,
      badge: dict.hub.quebec.badge,
      desc: dict.hub.quebec.desc,
      href: `/${locale}/calculator/quebec`,
      cta: dict.hub.quebec.cta,
      badgeColor: 'bg-blue-950/70 text-blue-400 border-blue-500/30',
    },
    {
      id: 'british-columbia',
      code: 'BC',
      name: dict.hub.bc.name,
      badge: dict.hub.bc.badge,
      desc: dict.hub.bc.desc,
      href: `/${locale}/calculator/british-columbia`,
      cta: dict.hub.bc.cta,
      badgeColor: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'alberta',
      code: 'AB',
      name: dict.hub.alberta.name,
      badge: dict.hub.alberta.badge,
      desc: dict.hub.alberta.desc,
      href: `/${locale}/calculator/alberta`,
      cta: dict.hub.alberta.cta,
      badgeColor: 'bg-amber-950/70 text-amber-400 border-amber-500/30',
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
    <section className="max-w-7xl mx-auto my-14 space-y-8" id="provinces">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {dict.hub.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          {dict.hub.subtitle}
        </p>
      </div>

      {/* Unified 2x2 Hairline Matrix (Single Outer Container with Flush Dividers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0a0f1a]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_10px_30px_-10px_rgba(0,0,0,0.5)]">
        {provinces.map((prov, idx) => (
          <div
            key={prov.id}
            className={`p-6 sm:p-8 space-y-5 transition-all duration-300 flex flex-col justify-between hover:bg-white/[0.02] ${
              idx % 2 === 0 ? 'md:border-r border-white/[0.07]' : ''
            } ${idx >= 2 ? 'border-t border-white/[0.07]' : 'border-t md:border-t-0 border-white/[0.07] first:border-t-0'}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#070b12] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white">
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

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{locale === 'fr' ? 'Barèmes 2026 audités' : '2026 Audited Rules'}</span>
              </span>
              <Link
                href={prov.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.18)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
              >
                <span>{prov.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Salary Fast-Track Benchmark Shortcuts (Open-Canvas Horizontal Inline Bar, Zero Outer Card Box) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {dict.hub.salaryPresetsTitle}:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {salaryFastTracks.map((item) => (
            <Link
              key={item.amount}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#070b12] text-slate-300 hover:text-white border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#0e1624] transition-all cursor-pointer tabular-nums"
            >
              <span>{item.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
