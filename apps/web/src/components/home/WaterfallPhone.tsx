import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { fillTemplate, formatCurrency, formatPercent } from '@/lib/format';
import { ROW_COLORS, toWaterfallSlices, type TaxCurveStrings, type WaterfallRow } from '@/features/tax/waterfall';

interface WaterfallPhoneProps {
  rows: readonly WaterfallRow[];
  grossCents: number;
  strings: TaxCurveStrings;
  locale: Locale;
}

/** Gross to take-home on a phone: one line per item with its amount, and a slim bar beneath. */
export default function WaterfallPhone({ rows, grossCents, strings, locale }: WaterfallPhoneProps) {
  return (
    <ol className="divide-y divide-white/[0.06]" aria-label={strings.title}>
      {toWaterfallSlices(rows, grossCents).map(({ row, isDeduction, sharePercent, sliceLeftPercent, sliceWidthPercent, remainingPercent }) => {
        const isTotal = row.kind === 'gross' || row.kind === 'net';
        const muted = isDeduction && row.amountCents === 0;
        return (
          <li key={row.key} className={`space-y-2 py-3 ${muted ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <span className={`flex min-w-0 items-center gap-2 text-sm ${isTotal ? 'font-semibold text-white' : 'text-slate-300'}`}>
                <span className={`h-2.5 w-2.5 shrink-0 rounded-xs ${ROW_COLORS[row.kind]}`} aria-hidden="true" />
                <span>{row.label}</span>
                {row.sourceUrl && (
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={fillTemplate(strings.sourceLink, { item: row.label })}
                    className="-my-3 -ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 active:text-emerald-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className={`block text-sm font-semibold ${row.kind === 'net' ? 'text-emerald-400' : 'text-white'}`}>
                  {isDeduction ? '−' : ''}
                  {formatCurrency(row.amountCents / 100, locale)}
                </span>
                <span className="block text-xs text-slate-400">{formatPercent(sharePercent / 100, locale, 1)}</span>
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.04]" aria-hidden="true">
              {isDeduction && <div className="absolute inset-y-0 left-0 bg-emerald-400/10" style={{ width: `${remainingPercent}%` }} />}
              <div
                className={`absolute inset-y-0 rounded-full transition-[left,width] duration-300 motion-reduce:transition-none ${ROW_COLORS[row.kind]}`}
                style={{ left: `${sliceLeftPercent}%`, width: row.amountCents > 0 ? `max(3px, ${sliceWidthPercent}%)` : '0' }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
