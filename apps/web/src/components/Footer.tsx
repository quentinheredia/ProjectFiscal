import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { fillTemplate, formatCurrency } from '@/lib/format';
import { PROVINCES, provinceName } from '@/lib/provinces';
import { AUDIT_BENCHMARK_DOLLARS, SALARY_BENCHMARK_DOLLARS, salaryPageHref } from '@/features/tax/salary-benchmarks';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import { Disclosure } from '@/components/mobile/Disclosure';

interface FooterProps {
  locale: Locale;
}

interface FooterLink {
  href: string;
  label: string;
  highlight?: boolean;
}

interface FooterGroup {
  title: string;
  links?: FooterLink[];
  facts?: string[];
}

function footerGroups(locale: Locale): FooterGroup[] {
  const strings = getDictionary(locale).footer;
  return [
    {
      title: strings.calculators,
      links: PROVINCES.map((p) => ({ href: `/${locale}/calculator/${p.slug}`, label: `${provinceName(p, locale)} (${p.form})` })),
    },
    {
      title: strings.benchmarks,
      links: SALARY_BENCHMARK_DOLLARS.map((amount) => ({
        href: salaryPageHref(locale, amount),
        label:
          amount === AUDIT_BENCHMARK_DOLLARS
            ? strings.auditCase
            : fillTemplate(strings.salaryBreakdown, { amount: formatCurrency(amount, locale) }),
        highlight: amount === AUDIT_BENCHMARK_DOLLARS,
      })),
    },
    {
      title: strings.standards,
      facts: [strings.clientSide, strings.integerCents, strings.noTracking, strings.citations],
    },
  ];
}

function Brand({ locale }: { locale: Locale }) {
  const strings = getDictionary(locale).footer;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Image src="/brand/emblem-96.png" alt="" width={28} height={28} className="h-7 w-7" />
        <span className="text-sm font-extrabold text-white">
          Fiscal<span className="text-emerald-400">Insights</span>
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-slate-400">{strings.tagline}</p>
      <span className="inline-block rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-400">
        {strings.engineBadge}
      </span>
    </div>
  );
}

function GroupItems({ group, tall }: { group: FooterGroup; tall: boolean }) {
  return (
    <ul className={tall ? 'space-y-0.5' : 'space-y-1.5'}>
      {group.links?.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`${tall ? 'flex min-h-11 items-center' : ''} ${
              link.highlight ? 'font-medium text-emerald-400' : 'text-slate-400 hover:text-emerald-400'
            } transition-colors`}
          >
            {link.label}
          </Link>
        </li>
      ))}
      {group.facts?.map((fact) => (
        <li key={fact} className={`flex items-center gap-1.5 text-slate-300 ${tall ? 'min-h-9' : ''}`}>
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>{fact}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Footer({ locale }: FooterProps) {
  const dict = getDictionary(locale);
  const groups = footerGroups(locale);

  return (
    <footer className="mx-auto max-w-7xl space-y-8 border-t border-slate-800/80 pt-10">
      <PhoneOnly className="mx-auto max-w-2xl space-y-4 text-sm">
        <Brand locale={locale} />
        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {groups.map((group) => (
            <Disclosure key={group.title} summary={<span className="font-semibold text-white">{group.title}</span>}>
              <GroupItems group={group} tall />
            </Disclosure>
          ))}
        </div>
      </PhoneOnly>

      <DesktopOnly>
        <div className="grid grid-cols-4 gap-8 text-xs">
          <Brand locale={locale} />
          {groups.map((group) => (
            <div key={group.title} className="space-y-2.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">{group.title}</span>
              <GroupItems group={group} tall={false} />
            </div>
          ))}
        </div>
      </DesktopOnly>

      <div className="mx-auto max-w-4xl space-y-2 border-t border-slate-800/60 pt-6 text-center text-xs leading-relaxed text-slate-500">
        <p>{dict.disclaimer}</p>
        <p className="font-mono text-slate-500">{dict.footer.copyright}</p>
      </div>
    </footer>
  );
}
