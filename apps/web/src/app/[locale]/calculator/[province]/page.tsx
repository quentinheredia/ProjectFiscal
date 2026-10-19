import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { federal2026, getProvincialRules } from '@fiscal-insights/tax-data';
import Calculator from '@/components/Calculator';
import NewsletterForm from '@/components/NewsletterForm';
import Footer from '@/components/Footer';
import LegacyAudit from '@/components/brackets/LegacyAudit';
import { BracketLadder, BracketTable } from '@/components/brackets/BracketTable';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import { getDictionary } from '@/lib/i18n';
import { fillTemplate } from '@/lib/format';
import { toBracketRows } from '@/features/brackets/bracket-rows';
import { payrollCeilings } from '@/features/brackets/payroll-ceilings';
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

  const bracketRows = toBracketRows(getProvincialRules(config.code, 2026).brackets);
  const citation = locale === 'fr' ? config.citationFr : config.citationEn;

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

      {/* 4. PROVINCIAL 2026 TAX BRACKETS */}
      <section className="mx-auto max-w-2xl lg:max-w-none space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight text-balance">
              {fillTemplate(dict.infoHub.brackets.provincePageTitle, { province: locale === 'fr' ? config.nameFrWithArticle : config.nameEn })}
            </h2>
            <p className="text-sm lg:text-xs text-slate-400 mt-0.5">
              {fillTemplate(dict.infoHub.brackets.provincePageSubtitle, { form: config.form })}
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
            Form {config.form}
          </span>
        </div>

        <PhoneOnly>
          <BracketLadder rows={bracketRows} citation={citation} strings={dict.infoHub.brackets} locale={locale} barClass="bg-emerald-400" rateClass="text-emerald-400" />
        </PhoneOnly>
        <DesktopOnly>
          <BracketTable rows={bracketRows} citation={citation} strings={dict.infoHub.brackets} locale={locale} rateClass="text-emerald-400" />
        </DesktopOnly>

        {config.code === 'ON' && (
          <div className="bg-[#14120a] border border-amber-500/30 p-4 rounded-xl text-sm lg:text-xs text-amber-200/90 space-y-1">
            <span className="font-bold text-amber-300 block">{dict.infoHub.brackets.ohpTitle}</span>
            <p className="text-amber-200/80 leading-relaxed">{dict.infoHub.brackets.ohpBody}</p>
          </div>
        )}
      </section>

      {/* 5. LEGACY AUDIT */}
      <section className="mx-auto max-w-2xl lg:max-w-none pt-4 border-t border-white/[0.08]">
        <LegacyAudit locale={locale} pitch={dict.pitch} eiValues={payrollCeilings(federal2026, locale).ei} />
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
        <NewsletterForm />
      </section>

      {/* 7. UNIFIED SITE FOOTER */}
      <Footer locale={locale} />
    </div>
  );
}
