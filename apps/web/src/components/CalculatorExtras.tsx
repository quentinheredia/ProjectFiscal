import React from 'react';
import { Locale, getDictionary } from '@/lib/i18n';
import NewsletterForm from '@/components/NewsletterForm';

// Static sections shown under the calculator. Server-rendered so they add nothing to hydration.
export default function CalculatorExtras({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* PITCH COMPARISON TABLE (Audit Proof Point: Ontario $80,000) */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-green-dark uppercase tracking-wider">
            Phase 0 Pitch Point
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            {dict.pitch.title}
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {dict.pitch.subtitle} (Ontario, $80,000 salary comparison)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3 px-4">{dict.pitch.table.line}</th>
                <th className="py-3 px-4 text-red-700 bg-red-50/50">{dict.pitch.table.oldSite}</th>
                <th className="py-3 px-4 text-brand-green-dark bg-emerald-50/50">{dict.pitch.table.newEngine}</th>
                <th className="py-3 px-4">{dict.pitch.table.difference}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Federal Tax</td>
                <td className="py-3 px-4 tabular-nums text-red-700 bg-red-50/30">$10,323</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">~$9,552</td>
                <td className="py-3 px-4 text-slate-600">Old site was ~$771 too high (used obsolete pre-2025 brackets).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Ontario Tax + OHP</td>
                <td className="py-3 px-4 tabular-nums text-red-700 bg-red-50/30">$3,985</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">~$4,940</td>
                <td className="py-3 px-4 text-slate-600">Old site was ~$955 too low (completely omitted Ontario Health Premium of $750).</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">CPP + CPP2</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$4,382.10</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">$4,382.10</td>
                <td className="py-3 px-4 text-slate-600">Exact match on YMPE + enhanced CPP2 contribution ceiling.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">Employment Insurance (EI)</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$1,077.48</td>
                <td className="py-3 px-4 tabular-nums font-bold text-brand-green-dark bg-emerald-50/30">$1,077.48</td>
                <td className="py-3 px-4 text-slate-600">Exact match on maximum insurable earnings limit.</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="py-3 px-4 text-slate-900">Take-Home Net Income</td>
                <td className="py-3 px-4 tabular-nums text-slate-700">$60,232</td>
                <td className="py-3 px-4 tabular-nums text-brand-green-dark bg-emerald-50/50">~$60,048</td>
                <td className="py-3 px-4 text-slate-700">Net looked plausible only because two large errors canceled each other out!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* NEWSLETTER CAPTURE (UI ONLY AS SPECIFIED IN PHASE 0) */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-brand-green-accent uppercase tracking-wider">
            {dict.newsletter.badge}
          </span>
          <h4 className="text-2xl font-bold tracking-tight">
            {dict.newsletter.title}
          </h4>
          <p className="text-sm text-slate-300">
            {dict.newsletter.description}
          </p>
        </div>
        <NewsletterForm locale={locale} />
      </section>

      {/* LEGAL & STATUTORY DISCLAIMER */}
      <footer className="text-center text-xs text-slate-500 py-4 max-w-4xl mx-auto">
        <p>{dict.disclaimer}</p>
      </footer>
    </div>
  );
}
