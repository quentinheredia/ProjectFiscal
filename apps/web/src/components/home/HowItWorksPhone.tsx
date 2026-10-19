'use client';

import React from 'react';
import { CheckCircle2, FileCheck2, Lock, MapPin, type LucideIcon } from 'lucide-react';
import { useProvince } from '@/context/ProvinceContext';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { PROVINCES, provinceName } from '@/lib/provinces';
import { SectionHeading } from '@/components/mobile/SectionHeading';

interface Step {
  title: string;
  description: string;
  tip1Title: string;
  tip1Desc: string;
  tip2Title: string;
  tip2Desc: string;
}

function StepCard({ icon: Icon, step, children }: { icon: LucideIcon; step: Step; children?: React.ReactNode }) {
  return (
    <li className="flex w-[85%] max-w-sm shrink-0 snap-start flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c121e] p-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold leading-snug text-white">{step.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
      </div>
      {children}
      <ul className="mt-auto space-y-2.5 border-t border-white/[0.06] pt-4 text-sm">
        {[
          [step.tip1Title, step.tip1Desc],
          [step.tip2Title, step.tip2Desc],
        ].map(([title, description]) => (
          <li key={title} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
            <span className="leading-relaxed text-slate-400">
              <strong className="font-semibold text-slate-200">{title}</strong> {description}
            </span>
          </li>
        ))}
      </ul>
    </li>
  );
}

/** "How it works" as a sideways rail of three cards, the next one peeking in from the edge. */
export default function HowItWorksPhone({ locale }: { locale: Locale }) {
  const dict = useDictionary();
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();

  return (
    <div className="space-y-5">
      <SectionHeading title={dict.onboarding.title} lead={dict.onboarding.subtitle} />
      <ol
        aria-label={dict.onboarding.title}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <StepCard icon={MapPin} step={dict.onboarding.step1}>
          <div className="grid grid-cols-2 gap-2">
            {PROVINCES.map((province) => {
              const selected = province.slug === selectedProvince.slug;
              return (
                <button
                  key={province.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedProvinceSlug(province.slug)}
                  className={`min-h-12 rounded-xl border px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-emerald-400 ${
                    selected ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-white/[0.08] bg-[#070b12] text-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold">{province.code}</span>
                  <span className="block truncate text-xs text-slate-400">{provinceName(province, locale)}</span>
                </button>
              );
            })}
          </div>
        </StepCard>
        <StepCard icon={Lock} step={dict.onboarding.step3} />
        <StepCard icon={FileCheck2} step={dict.onboarding.step4} />
      </ol>
    </div>
  );
}
