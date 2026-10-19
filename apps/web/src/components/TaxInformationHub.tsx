'use client';

import React from 'react';
import { federal2026 } from '@fiscal-insights/tax-data';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { payrollCeilings } from '@/features/brackets/payroll-ceilings';
import BracketsSection from '@/components/brackets/BracketsSection';
import LegacyAudit from '@/components/brackets/LegacyAudit';
import { FaqSection, PayrollCeilingsSection, RatesExplainer } from '@/components/brackets/HubSections';

/** Brackets, rate explainers, payroll ceilings, the legacy audit and FAQ: the home page's tax reference. */
export default function TaxInformationHub({ locale }: { locale: Locale }) {
  const dict = useDictionary();
  const hub = dict.infoHub;
  const ceilings = payrollCeilings(federal2026, locale);

  return (
    <section className="mx-auto my-6 max-w-2xl space-y-8 lg:my-14 lg:max-w-7xl lg:space-y-14" id="tax-information">
      <div className="mx-auto max-w-3xl space-y-3 lg:text-center">
        <h2 className="text-balance text-2xl font-extrabold tracking-tight text-white md:text-3xl lg:text-4xl">{hub.title}</h2>
        <p className="text-sm leading-relaxed text-slate-400 lg:text-base">{hub.subtitle}</p>
      </div>

      <BracketsSection locale={locale} strings={hub.brackets} />
      <RatesExplainer hub={hub} />
      <PayrollCeilingsSection hub={hub} ceilings={ceilings} />
      <LegacyAudit id="legacy-audit" locale={locale} pitch={dict.pitch} eiValues={ceilings.ei} />
      <FaqSection hub={hub} />
    </section>
  );
}
