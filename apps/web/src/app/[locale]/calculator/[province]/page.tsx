import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Calculator from '@/components/Calculator';
import NewsletterForm from '@/components/NewsletterForm';
import Footer from '@/components/Footer';
import { getDictionary } from '@/lib/i18n';
import { getProvincialRules } from '@fiscal-insights/tax-data';
import { notFound } from 'next/navigation';
import { formatCentsToDollars } from '@fiscal-insights/tax-engine';
import { ArrowRight } from 'lucide-react';
import { PROVINCES, findProvinceBySlug } from '@/lib/provinces';
import { LOCALES, SITE_URL, localizedAlternates, resolveLocale } from '@/lib/locale';

interface ProvincePageProps {
  params: Promise<{
    locale: string;
    province: string;
  }>;
}

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROVINCES.map((p) => ({ locale, province: p.slug })));
}

export async function generateMetadata({
  params,
}: ProvincePageProps): Promise<Metadata> {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const provinceSlug = resolved.province.toLowerCase();
  const config = findProvinceBySlug(provinceSlug);

  if (!config) return {};

  const title =
    locale === 'fr'
      ? `Calculateur d’impôt de ${config.nameFrWithArticle} 2026 | Fiscal Insights`
      : `${config.nameEn} Income Tax Calculator 2026 | Fiscal Insights`;

  const description =
    locale === 'fr'
      ? `Calculez votre impôt de ${config.nameFrWithArticle} 2026 avec les barèmes officiels, crédits locaux et cotisations.`
      : `Accurate 2026 ${config.nameEn} income tax calculator with official Form ${config.form} tax brackets and provincial tax rules.`;

  return {
    title,
    description,
    alternates: localizedAlternates(locale, `/calculator/${config.slug}`),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/calculator/${config.slug}`,
    },
  };
}

export default async function ProvincePage({ params }: ProvincePageProps) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const dict = getDictionary(locale);
  const provinceSlug = resolved.province.toLowerCase();
  const config = findProvinceBySlug(provinceSlug);

  if (!config) notFound();

  const provRules = getProvincialRules(config.code, 2026);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${config.nameEn} Income Tax Calculator 2026`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    description: `Calculate ${config.nameEn} personal income tax and deductions.`,
  };

  return (
    <div className="w-full max-w-7xl mx-auto lg:px-8 lg:py-8 space-y-12 lg:space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. COMPACT PAGE HEADER */}
      <section className="text-center max-w-4xl mx-auto space-y-3 lg:pt-18">
        <h1 className="text-[1.875rem] leading-tight md:text-4xl lg:text-5xl font-black text-white tracking-tight text-balance">
          {locale === 'fr'
            ? `Calculateur d’impôt sur le revenu de ${config.nameFrWithArticle} 2026`
            : `${config.nameEn} Income Tax Calculator 2026`}
        </h1>
        <p className="text-[15px] lg:text-base text-slate-400 max-w-2xl mx-auto text-pretty">
          {locale === 'fr'
            ? `Explorez les tranches d’imposition de ${config.nameFrWithArticle} pour 2026 et calculez votre paie nette exacte.`
            : `Calculate your exact net pay in ${config.nameEn} with current 2026 provincial brackets and statutory payroll deductions.`}
        </p>
      </section>

      {/* 2 & 3. 2-COLUMN INTERACTIVE CALCULATOR WORKSPACE + WHERE YOUR FEDERAL TAXES GO */}
      <section>
        <Calculator locale={locale} initialProvince={config.code} initialSalaryDollars={80000} />
      </section>

      {/* 4. PROVINCIAL 2026 TAX BRACKETS & RATES (Open Canvas De-Boxed) */}
      <section className="mx-auto max-w-2xl lg:max-w-none space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {locale === 'fr'
                ? `Barèmes d’imposition de ${config.nameFrWithArticle} (2026)`
                : `${config.nameEn} 2026 Tax Brackets & Rates`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {locale === 'fr'
                ? `Taux officiels issus du formulaire provincial ${config.form}.`
                : `Official provincial rates based on Form ${config.form} guidelines.`}
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
            Form {config.form}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] bg-[#0c121e]/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#070b12] text-slate-300 font-semibold">
                <th className="py-3.5 px-4">Bracket Threshold</th>
                <th className="py-3.5 px-4">Tax Rate</th>
                <th className="py-3.5 px-4">Source Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {provRules.brackets.map((b, idx) => {
                const prevBracket = idx > 0 ? provRules.brackets[idx - 1] : undefined;
                const prevUpTo = prevBracket?.upToCents ? formatCentsToDollars(prevBracket.upToCents.value) : '$0';
                const currentUpTo = b.upToCents ? formatCentsToDollars(b.upToCents.value) : 'Any amount above';
                return (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white tabular-nums">
                      {prevUpTo} to {currentUpTo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 tabular-nums">
                      {(b.rate.value * 100).toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      Form {config.form}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ontario Health Premium Note if ON */}
        {config.code === 'ON' && (
          <div className="bg-[#14120a] border border-amber-500/30 p-4 rounded-xl text-xs text-amber-200/90 space-y-1">
            <span className="font-bold text-amber-300 block">Note on the Ontario Health Premium (OHP):</span>
            <p className="text-amber-200/80 leading-relaxed">
              Unlike other provinces, Ontario levies an additional graduated health premium ranging from $0 up to a maximum of $900 for taxable incomes over $200,600. For an individual earning $80,000, the Ontario Health Premium is exactly $750.00.
            </p>
          </div>
        )}
      </section>

      {/* 5. THE REBUILD DIFFERENCE: ACCURACY VERIFIED (Audit Verification Table) */}
      <section className="mx-auto max-w-2xl lg:max-w-none space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              {locale === 'fr' ? 'VÉRIFICATION D’AUDIT LÉGAL DE L’ARC' : 'CRA STATUTORY AUDIT VERIFICATION'}
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-1">
              {dict.pitch.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              {dict.pitch.subtitle} (Ontario, $80,000 benchmark)
            </p>
          </div>
          <Link
            href={`/${locale}/salary/80000/ontario`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_2px_12px_rgba(16,185,129,0.18)] hover:shadow-[0_2px_16px_rgba(16,185,129,0.25)] transition-all shrink-0 cursor-pointer"
          >
            <span>{dict.pitch.inspectAuditAction}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] bg-[#0c121e]/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#070b12] text-slate-300 font-semibold">
                <th className="py-3.5 px-4">{dict.pitch.table.line}</th>
                <th className="py-3.5 px-4 text-rose-400 bg-rose-950/20">{dict.pitch.table.oldSite}</th>
                <th className="py-3.5 px-4 text-emerald-400 bg-emerald-500/[0.08] border-x border-emerald-500/20 font-bold">{dict.pitch.table.newEngine}</th>
                <th className="py-3.5 px-4">{dict.pitch.table.difference}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.fedLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-rose-400 bg-rose-950/10">$10,323.00</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$9,242.60</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.fedDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.provLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-rose-400 bg-rose-950/10">$3,985.00</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$4,885.26</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.provDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.cppLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$4,382.10</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$4,446.45</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.cppDiff}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">{dict.pitch.table.eiLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$1,077.48</td>
                <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-400 bg-emerald-500/[0.04] border-x border-emerald-500/20">$1,123.07</td>
                <td className="py-3.5 px-4 text-slate-400">{dict.pitch.table.eiDiff}</td>
              </tr>
              <tr className="bg-[#070b12] font-bold">
                <td className="py-3.5 px-4 text-white">{dict.pitch.table.netLine}</td>
                <td className="py-3.5 px-4 tabular-nums text-slate-300">$60,232.42</td>
                <td className="py-3.5 px-4 tabular-nums text-emerald-400 bg-emerald-500/[0.08] border-x border-emerald-500/30">$60,302.62</td>
                <td className="py-3.5 px-4 text-emerald-300/90 font-medium">{dict.pitch.table.netDiff}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. NEWSLETTER CAPTURE CARD */}
      <section className="mx-auto max-w-2xl lg:max-w-none bg-linear-to-b from-[#111625] to-[#090d16] text-white rounded-2xl p-5 md:p-6 lg:p-8 space-y-4 border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
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

      {/* 7. UNIFIED SITE FOOTER */}
      <Footer locale={locale} />
    </div>
  );
}
