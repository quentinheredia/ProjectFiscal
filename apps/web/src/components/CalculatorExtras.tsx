import React from 'react';
import { Locale, getDictionary } from '@/lib/i18n';
import NewsletterForm from '@/components/NewsletterForm';

// Static sections shown under the calculator. Server-rendered so they add nothing to hydration.
export default function CalculatorExtras({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* PITCH COMPARISON TABLE (Audit Proof Point: Ontario $80,000) */}
      <section className="bg-[#0c121e] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] border border-slate-800/90 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Phase 0 Pitch Point
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
            {dict.pitch.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            {dict.pitch.subtitle} (Ontario, $80,000 salary comparison)
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
                <td className="py-3 px-4 text-slate-400">Exact match on YMPE + enhanced CPP2 contribution ceiling.</td>
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
      </section>

      {/* NEWSLETTER CAPTURE (UI ONLY AS SPECIFIED IN PHASE 0) */}
      <section className="bg-gradient-to-b from-[#111625] to-[#090d16] text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
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
