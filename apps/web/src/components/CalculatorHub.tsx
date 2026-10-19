'use client';

import React from 'react';
import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fillTemplate, formatCurrency } from '@/lib/format';
import { PROVINCES, provinceName, type ProvinceConfig, type ProvinceSlug } from '@/lib/provinces';
import { AUDIT_BENCHMARK_DOLLARS, salaryBenchmarks } from '@/features/tax/salary-benchmarks';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import ProvinceHubPhone from '@/components/home/ProvinceHubPhone';
import { ActionLink } from '@/components/ui/action';
import { ArrowRight, ShieldCheck, DollarSign, Calculator } from 'lucide-react';

interface CalculatorHubProps {
  locale: Locale;
}

type HubStrings = Dictionary['hub'];
type HubCopyKey = 'ontario' | 'quebec' | 'bc' | 'alberta';

// Jurisdictions with hand-written hub copy; any other one gets the generic template.
const HUB_COPY: Partial<Record<ProvinceSlug, HubCopyKey>> = {
  ontario: 'ontario',
  quebec: 'quebec',
  'british-columbia': 'bc',
  alberta: 'alberta',
};

const BADGE_TONES = [
  'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
  'bg-blue-950/70 text-blue-400 border-blue-500/30',
  'bg-amber-950/70 text-amber-400 border-amber-500/30',
] as const;

interface HubCard {
  province: ProvinceConfig;
  name: string;
  badge: string;
  desc: string;
  cta: string;
  badgeColor: string;
}

function hubCard(province: ProvinceConfig, index: number, hub: HubStrings, locale: Locale): HubCard {
  const key = HUB_COPY[province.slug];
  const name = provinceName(province, locale);
  const values = { province: name, form: province.form };
  const copy = key
    ? hub[key]
    : { name: `${name} (${province.code})`, badge: fillTemplate(hub.genericBadge, values), desc: fillTemplate(hub.genericDesc, values), cta: fillTemplate(hub.genericCta, values) };
  return { province, ...copy, badgeColor: BADGE_TONES[index % BADGE_TONES.length]! };
}

export default function CalculatorHub({ locale }: CalculatorHubProps) {
  const dict = useDictionary();
  const provinces = PROVINCES.map((province, index) => hubCard(province, index, dict.hub, locale));

  const benchmarks = salaryBenchmarks(locale);

  return (
    <section className="max-w-7xl mx-auto my-14" id="provinces">
      <PhoneOnly className="mx-auto max-w-2xl">
        <ProvinceHubPhone locale={locale} benchmarks={benchmarks} />
      </PhoneOnly>
      <DesktopOnly className="space-y-8">
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
            key={prov.province.slug}
            className={`p-6 sm:p-8 space-y-5 transition-colors duration-300 flex flex-col justify-between hover:bg-white/[0.02] ${
              idx % 2 === 0 ? 'md:border-r border-white/[0.07]' : ''
            } ${idx >= 2 ? 'border-t border-white/[0.07]' : 'border-t md:border-t-0 border-white/[0.07] first:border-t-0'}`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#070b12] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white">
                    {prov.province.code}
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
              <ActionLink href={`/${locale}/calculator/${prov.province.slug}`} variant="secondary" icon={Calculator}>
                {prov.cta}
              </ActionLink>
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
          {benchmarks.map(({ amountDollars, href }) => (
            <Link
              key={amountDollars}
              href={href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#070b12] text-slate-300 hover:text-white border border-white/[0.08] hover:border-emerald-500/40 hover:bg-[#0e1624] transition-colors cursor-pointer tabular-nums"
            >
              <span>
                {formatCurrency(amountDollars, locale)}
                {amountDollars === AUDIT_BENCHMARK_DOLLARS && ` (${dict.hub.benchmarkTag})`}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-500" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
      </DesktopOnly>
    </section>
  );
}
