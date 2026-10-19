import React from 'react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fillTemplate, formatCents, formatPercent } from '@/lib/format';
import { topRate, type BracketRow } from '@/features/brackets/bracket-rows';

type BracketStrings = Dictionary['infoHub']['brackets'];

interface BracketViewProps {
  rows: readonly BracketRow[];
  citation: string;
  strings: BracketStrings;
  locale: Locale;
}

export function bracketRange(row: BracketRow, strings: BracketStrings, locale: Locale): string {
  const from = formatCents(row.fromCents, locale, 2);
  return row.toCents === null
    ? fillTemplate(strings.rangeOver, { from })
    : fillTemplate(strings.rangeTo, { from, to: formatCents(row.toCents, locale, 2) });
}

/** Desktop bracket schedule: threshold, rate and citation columns. */
export function BracketTable({ rows, citation, strings, locale, rateClass }: BracketViewProps & { rateClass: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
            <th className="py-3 px-4">{strings.thresholdCol}</th>
            <th className="py-3 px-4">{strings.rateCol}</th>
            <th className="py-3 px-4">{strings.citationCol}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]">
          {rows.map((row) => (
            <tr key={row.fromCents} className="hover:bg-slate-800/30">
              <td className="py-2.5 px-4 font-medium text-white tabular-nums">{bracketRange(row, strings, locale)}</td>
              <td className={`py-2.5 px-4 font-bold tabular-nums ${rateClass}`}>{formatPercent(row.rate, locale, 2)}</td>
              <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{citation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Phone bracket schedule: one row per bracket with the rate large on the left, the income range on
 * the right and a bar scaled to the top rate. The citation appears once under the list.
 */
export function BracketLadder({ rows, citation, strings, locale, barClass, rateClass }: BracketViewProps & { barClass: string; rateClass: string }) {
  const top = topRate(rows) || 1;
  return (
    <div className="space-y-2">
      <ol className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c121e] px-4">
        {rows.map((row) => (
          <li key={row.fromCents} className="space-y-2 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className={`text-2xl font-black tabular-nums ${rateClass}`}>{formatPercent(row.rate, locale, 2)}</span>
              <span className="text-right text-sm tabular-nums text-slate-200">{bracketRange(row, strings, locale)}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden="true">
              <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(row.rate / top) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="px-1 font-mono text-xs text-slate-400">{citation}</p>
    </div>
  );
}
