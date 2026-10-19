import React from 'react';
import { HelpCircle, Scale, TrendingUp, type LucideIcon } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { fillTemplate } from '@/lib/format';
import type { PayrollCeilings } from '@/features/brackets/payroll-ceilings';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import { Disclosure } from '@/components/mobile/Disclosure';
import { MetricList } from '@/components/mobile/MetricList';

type InfoHub = Dictionary['infoHub'];

interface ExplainerPoint {
  title: string;
  body: string;
  accent: string;
}

interface Explainer {
  key: string;
  icon: LucideIcon;
  iconClass: string;
  title: string;
  description: string;
  points: ExplainerPoint[];
}

function explainers(hub: InfoHub): Explainer[] {
  return [
    {
      key: 'rates',
      icon: Scale,
      iconClass: 'bg-blue-950/60 border-blue-500/30 text-blue-400',
      title: hub.marginalVsAverage.title,
      description: hub.marginalVsAverage.description,
      points: [
        { title: hub.marginalVsAverage.point1Title, body: hub.marginalVsAverage.point1Desc, accent: 'border-blue-400/80' },
        { title: hub.marginalVsAverage.point2Title, body: hub.marginalVsAverage.point2Desc, accent: 'border-emerald-400/80' },
      ],
    },
    {
      key: 'deductions',
      icon: TrendingUp,
      iconClass: 'bg-purple-950/60 border-purple-500/30 text-purple-400',
      title: hub.deductions.title,
      description: hub.deductions.description,
      points: [
        { title: hub.deductions.rrspTitle, body: hub.deductions.rrspDesc, accent: 'border-purple-400/80' },
        { title: hub.deductions.fhsaTitle, body: hub.deductions.fhsaDesc, accent: 'border-teal-400/80' },
      ],
    },
  ];
}

function ExplainerPoints({ points }: { points: ExplainerPoint[] }) {
  return (
    <div className="space-y-4">
      {points.map((point) => (
        <div key={point.title} className={`border-l-2 ${point.accent} pl-4 py-1 text-sm lg:text-xs text-slate-300 space-y-1`}>
          <span className="font-bold text-white block">{point.title}</span>
          <p className="text-slate-400 leading-relaxed">{point.body}</p>
        </div>
      ))}
    </div>
  );
}

/** Marginal versus average rate, and RRSP and FHSA savings: two disclosures on phones, two columns on desktop. */
export function RatesExplainer({ hub }: { hub: InfoHub }) {
  const items = explainers(hub);
  return (
    <>
      <PhoneOnly className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {items.map((item) => (
          <Disclosure key={item.key} summary={<span className="text-base font-bold text-white">{item.title}</span>}>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>
              <ExplainerPoints points={item.points} />
            </div>
          </Disclosure>
        ))}
      </PhoneOnly>
      <DesktopOnly>
        <div className="grid grid-cols-2 divide-x divide-white/[0.08] border-y border-white/[0.08] py-10">
          {items.map(({ key, icon: Icon, iconClass, title, description, points }) => (
            <div key={key} className="p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg border ${iconClass}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
              <ExplainerPoints points={points} />
            </div>
          ))}
        </div>
      </DesktopOnly>
    </>
  );
}

/** 2026 CPP, CPP2 and EI ceilings, with every figure computed from the federal rule set. */
export function PayrollCeilingsSection({ hub, ceilings }: { hub: InfoHub; ceilings: PayrollCeilings }) {
  const strings = hub.ceilings;
  const items = [
    { key: 'cpp', title: strings.cppBaseTitle, value: ceilings.headline.ympe, valueClass: 'text-emerald-400', desc: fillTemplate(strings.cppBaseDesc, ceilings.cppBase) },
    { key: 'cpp2', title: strings.cpp2Title, value: ceilings.headline.yampe, valueClass: 'text-purple-400', desc: fillTemplate(strings.cpp2Desc, ceilings.cpp2) },
    { key: 'ei', title: strings.eiTitle, value: ceilings.headline.mie, valueClass: 'text-blue-400', desc: fillTemplate(strings.eiDesc, ceilings.ei) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">{strings.badge}</span>
        <h3 className="text-2xl font-bold text-white tracking-tight mt-1 text-balance">{strings.title}</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">{strings.description}</p>
      </div>

      <PhoneOnly className="space-y-1 rounded-2xl border border-white/[0.08] bg-[#0c121e] px-4">
        <MetricList metrics={items.map(({ key, title, value }) => ({ key, label: title, value }))} />
        <Disclosure className="border-t border-white/[0.06]" summary={<span className="text-sm font-semibold text-emerald-400">{strings.title}</span>}>
          <ul className="space-y-3 text-[13px] leading-relaxed text-slate-400">
            {items.map((item) => (
              <li key={item.key}>
                <strong className="font-semibold text-slate-200">{item.title}.</strong> {item.desc}
              </li>
            ))}
          </ul>
        </Disclosure>
      </PhoneOnly>

      <DesktopOnly>
        <div className="grid grid-cols-3 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0a0f1a]/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)] text-xs">
          {items.map((item) => (
            <div key={item.key} className="p-6 space-y-2 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{item.title}</span>
                <span className={`font-mono font-bold tabular-nums ${item.valueClass}`}>{item.value}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </DesktopOnly>
    </div>
  );
}

/** Frequently asked questions as native disclosures: keyboard and screen reader state come for free. */
export function FaqSection({ hub }: { hub: InfoHub }) {
  const faq = hub.faq;
  const items = [
    [faq.q1, faq.a1],
    [faq.q2, faq.a2],
    [faq.q3, faq.a3],
    [faq.q4, faq.a4],
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 py-8 border-t border-white/[0.08]">
      <div className="lg:col-span-4 space-y-3">
        <div className="hidden lg:inline-flex items-center gap-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 w-fit">
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{faq.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{faq.subtitle}</p>
      </div>
      <div className="lg:col-span-8 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {items.map(([question, answer], index) => (
          <Disclosure
            key={question}
            defaultOpen={index === 0}
            summary={<span className="text-[15px] lg:text-sm font-semibold text-slate-200">{question}</span>}
          >
            <p className="text-sm text-slate-400 leading-relaxed">{answer}</p>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
