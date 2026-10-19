import React from 'react';
import { federal2026 } from '@fiscal-insights/tax-data';
import { Locale, getDictionary } from '@/lib/i18n';
import { payrollCeilings } from '@/features/brackets/payroll-ceilings';
import NewsletterForm from '@/components/NewsletterForm';
import LegacyAudit from '@/components/brackets/LegacyAudit';

// Static sections shown under the calculator on the $80,000 page. Server-rendered so they add nothing to hydration.
export default function CalculatorExtras({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      <section className="bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-5 md:p-6 lg:p-8">
        <LegacyAudit locale={locale} pitch={dict.pitch} eiValues={payrollCeilings(federal2026, locale).ei} linkToCase={false} />
      </section>

      <section className="bg-linear-to-b from-[#111625] to-[#090d16] text-white rounded-2xl p-5 md:p-6 lg:p-8 space-y-4 border border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-2xl space-y-2">
          <span className="block text-xs leading-6 font-bold text-emerald-400 uppercase tracking-wider">{dict.newsletter.badge}</span>
          <h4 className="text-2xl font-bold tracking-tight">{dict.newsletter.title}</h4>
          <p className="text-sm text-slate-300">{dict.newsletter.description}</p>
        </div>
        <NewsletterForm />
      </section>

      <footer className="text-center text-xs text-slate-400 py-4 max-w-4xl mx-auto">
        <p>{dict.disclaimer}</p>
      </footer>
    </div>
  );
}
