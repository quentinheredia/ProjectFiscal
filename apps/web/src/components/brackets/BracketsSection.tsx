'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { federal2026, ontario2026, quebec2026, britishColumbia2026, alberta2026 } from '@fiscal-insights/tax-data';
import { useProvince } from '@/context/ProvinceContext';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fillTemplate } from '@/lib/format';
import { provinceName, type ProvinceSlug } from '@/lib/provinces';
import { toBracketRows } from '@/features/brackets/bracket-rows';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';
import { BracketLadder, BracketTable } from './BracketTable';

const PROVINCIAL_RULES: Record<ProvinceSlug, typeof ontario2026> = {
  ontario: ontario2026,
  quebec: quebec2026,
  'british-columbia': britishColumbia2026,
  alberta: alberta2026,
};

// Each province keeps one accent so its schedule is recognisable across views.
const PROVINCE_TONE: Record<ProvinceSlug, { dot: string; text: string; badge: string }> = {
  ontario: { dot: 'bg-amber-400', text: 'text-amber-400', badge: 'border-amber-500/40 bg-amber-500/15 text-amber-300' },
  quebec: { dot: 'bg-indigo-400', text: 'text-indigo-400', badge: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300' },
  'british-columbia': { dot: 'bg-teal-400', text: 'text-teal-400', badge: 'border-teal-500/40 bg-teal-500/15 text-teal-300' },
  alberta: { dot: 'bg-sky-400', text: 'text-sky-400', badge: 'border-sky-500/40 bg-sky-500/15 text-sky-300' },
};

type Schedule = 'federal' | 'provincial';

interface BracketsSectionProps {
  locale: Locale;
  strings: Dictionary['infoHub']['brackets'];
}

/** Federal and provincial 2026 brackets. Provincial follows the province picked anywhere on the site. */
export default function BracketsSection({ locale, strings }: BracketsSectionProps) {
  const { selectedProvince: province } = useProvince();
  const [schedule, setSchedule] = useState<Schedule>('federal');
  const tone = PROVINCE_TONE[province.slug];
  const name = provinceName(province, locale);
  const citation = locale === 'fr' ? province.citationFr : province.citationEn;
  const federalRows = toBracketRows(federal2026.brackets);
  const provincialRows = toBracketRows(PROVINCIAL_RULES[province.slug].brackets);
  const provincialTitle = fillTemplate(strings.provincialTitle, { province: name, form: province.form });

  const calculateLink = (
    <Link
      href={`/${locale}/calculator/${province.slug}`}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm lg:min-h-0 lg:text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group"
    >
      <span>{fillTemplate(strings.calculateProvince, { province: name, code: province.code })}</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" aria-hidden="true" />
    </Link>
  );

  return (
    <div id="brackets" className="space-y-6 scroll-mt-20">
      <div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider hidden lg:block">{strings.badge}</span>
        <h3 className="text-2xl font-bold text-white tracking-tight mt-1 text-balance">{strings.title}</h3>
        <p className="hidden lg:block text-sm text-slate-400 mt-1 max-w-3xl">{strings.subtitle}</p>
      </div>

      <PhoneOnly className="space-y-4">
        <SegmentedControl
          label={strings.jurisdictionLabel}
          value={schedule}
          onChange={setSchedule}
          options={[
            { value: 'federal', label: strings.federalTab },
            { value: 'provincial', label: name },
          ]}
        />
        {schedule === 'federal' ? (
          <>
            <BracketLadder rows={federalRows} citation={strings.federalCitation} strings={strings} locale={locale} barClass="bg-blue-400" rateClass="text-blue-400" />
            <p className="text-xs text-slate-400">{strings.appliesToAll}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-200">{provincialTitle}</p>
            <BracketLadder rows={provincialRows} citation={citation} strings={strings} locale={locale} barClass={tone.dot} rateClass={tone.text} />
            {calculateLink}
          </>
        )}
      </PhoneOnly>

      <DesktopOnly>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between min-h-[32px]">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" aria-hidden="true" />
                <span>{strings.federalTitle}</span>
              </h4>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20">CRA Federal</span>
            </div>
            <BracketTable rows={federalRows} citation={strings.federalCitation} strings={strings} locale={locale} rateClass="text-blue-400" />
            <div className="flex justify-end pt-1">
              <span className="text-xs text-slate-500 font-mono">{strings.appliesToAll}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between min-h-[32px]">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${tone.dot}`} aria-hidden="true" />
                <span>{provincialTitle}</span>
              </h4>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-sm border ${tone.badge}`}>
                {name} ({province.code})
              </span>
            </div>
            <BracketTable rows={provincialRows} citation={citation} strings={strings} locale={locale} rateClass={tone.text} />
            <div className="flex justify-end pt-1">{calculateLink}</div>
          </div>
        </div>
      </DesktopOnly>
    </div>
  );
}
