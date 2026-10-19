import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fillTemplate, formatCents } from '@/lib/format';
import { auditLines, type AuditLine } from '@/features/brackets/audit-benchmark';
import { AUDIT_BENCHMARK_DOLLARS, salaryPageHref } from '@/features/tax/salary-benchmarks';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';

interface LegacyAuditProps {
  locale: Locale;
  pitch: Dictionary['pitch'];
  /** Values for the {mie} and {rate} placeholders in the EI impact text. */
  eiValues: Record<string, string>;
  /** Show the link to the $80,000 page; off on that page itself. */
  linkToCase?: boolean;
  id?: string;
}

function lineText(line: AuditLine, pitch: Dictionary['pitch'], eiValues: Record<string, string>) {
  return { label: pitch.table[line.labelKey], impact: fillTemplate(pitch.table[line.impactKey], eiValues) };
}

function AuditTable({ lines, locale, pitch, eiValues }: { lines: AuditLine[]; locale: Locale; pitch: Dictionary['pitch']; eiValues: Record<string, string> }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5)] bg-[#0a0f1a]/60">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-[#070b12] text-slate-300 font-semibold">
            <th className="py-3.5 px-4">{pitch.table.line}</th>
            <th className="py-3.5 px-4 text-rose-400 bg-rose-950/20">{pitch.table.oldSite}</th>
            <th className="py-3.5 px-4 text-emerald-400 bg-emerald-500/[0.08] border-x border-emerald-500/20 font-bold">{pitch.table.newEngine}</th>
            <th className="py-3.5 px-4">{pitch.table.difference}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 bg-[#0a0f1c]/80">
          {lines.map((line) => {
            const { label, impact } = lineText(line, pitch, eiValues);
            return (
              <tr key={line.key} className={line.isTotal ? 'bg-[#070b12] font-bold' : undefined}>
                <td className="py-3.5 px-4 font-semibold text-white">{label}</td>
                <td className={`py-3.5 px-4 tabular-nums ${line.legacyWrong ? 'text-rose-400 bg-rose-950/10' : 'text-slate-300'}`}>
                  {formatCents(line.legacyCents, locale, 2)}
                </td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">
                  {formatCents(line.engineCents, locale, 2)}
                </td>
                <td className={`py-3.5 px-4 ${line.isTotal ? 'text-emerald-300/90 font-medium' : 'text-slate-400'}`}>{impact}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Phone comparison: one row per line, the label on the left and both figures stacked on the right
 * (legacy struck through when it was wrong), with the impact underneath.
 */
function AuditCards({ lines, locale, pitch, eiValues }: { lines: AuditLine[]; locale: Locale; pitch: Dictionary['pitch']; eiValues: Record<string, string> }) {
  return (
    <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-[#0c121e] px-4">
      {lines.map((line) => {
        const { label, impact } = lineText(line, pitch, eiValues);
        return (
          <li key={line.key} className={`space-y-1.5 py-3 ${line.isTotal ? '-mx-4 bg-emerald-500/[0.05] px-4' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <p className="pt-0.5 text-sm font-semibold text-white">{label}</p>
              <dl className="shrink-0 text-right tabular-nums">
                <dt className="sr-only">{pitch.legacyLabel}</dt>
                <dd className={`text-xs ${line.legacyWrong ? 'text-rose-400 line-through decoration-rose-400/60' : 'text-slate-400'}`}>
                  {formatCents(line.legacyCents, locale, 2)}
                </dd>
                <dt className="sr-only">{pitch.engineLabel}</dt>
                <dd className="text-base font-bold text-emerald-400">{formatCents(line.engineCents, locale, 2)}</dd>
              </dl>
            </div>
            <p className={`text-[13px] leading-relaxed ${line.isTotal ? 'text-emerald-200/90' : 'text-slate-400'}`}>{impact}</p>
          </li>
        );
      })}
    </ul>
  );
}

/** The legacy-site audit at the $80,000 Ontario benchmark: a table on desktop, cards on phones. */
export default function LegacyAudit({ locale, pitch, eiValues, linkToCase = true, id }: LegacyAuditProps) {
  const lines = auditLines();
  const caseLink = linkToCase && (
    <Link
      href={salaryPageHref(locale, AUDIT_BENCHMARK_DOLLARS)}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm lg:text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.18)] transition-colors shrink-0 cursor-pointer lg:min-h-0 lg:w-auto"
    >
      <span>{pitch.inspectAuditAction}</span>
      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
    </Link>
  );

  return (
    <div id={id} className="space-y-5 scroll-mt-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">{pitch.badge}</span>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1 text-balance">{pitch.title}</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl text-pretty">
            {pitch.subtitle} {pitch.benchmarkNote}
          </p>
        </div>
        {caseLink}
      </div>

      <PhoneOnly>
        <AuditCards lines={lines} locale={locale} pitch={pitch} eiValues={eiValues} />
      </PhoneOnly>
      <DesktopOnly>
        <AuditTable lines={lines} locale={locale} pitch={pitch} eiValues={eiValues} />
      </DesktopOnly>
    </div>
  );
}
