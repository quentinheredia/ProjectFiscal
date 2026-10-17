import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Calculator,
} from 'lucide-react';
import TaxSimulationPreview from '@/components/TaxSimulationPreview';
import InteractiveOnboarding from '@/components/InteractiveOnboarding';
import CalculatorHub from '@/components/CalculatorHub';
import TaxInformationHub from '@/components/TaxInformationHub';
import TaxCurveAnalytics from '@/components/TaxCurveAnalytics';
import NewsletterForm from '@/components/NewsletterForm';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const dict = getDictionary(locale);

  return {
    title: dict.siteTitle,
    description: dict.siteDescription,
    alternates: {
      canonical: `https://fiscal-insights.ca/${locale}`,
      languages: {
        'en-CA': 'https://fiscal-insights.ca/en',
        'fr-CA': 'https://fiscal-insights.ca/fr',
        'x-default': 'https://fiscal-insights.ca/en',
      },
    },
    openGraph: {
      title: dict.siteTitle,
      description: dict.siteDescription,
      url: `https://fiscal-insights.ca/${locale}`,
      siteName: 'Fiscal Insights',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const dict = getDictionary(locale);

  // Structured Data (JSON-LD) for WebApplication
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Fiscal Insights Canadian Income Tax Calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: dict.siteDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CAD',
    },
  };

  return (
    <div className="space-y-20 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION */}
      <section className="text-center max-w-4xl mx-auto space-y-7 pt-8 sm:pt-12">
        {/* Live Tax Rules Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dict.hero.badge}</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
          {dict.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {dict.hero.subtitle}
        </p>

        {/* Hero Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href={`/${locale}/calculator/ontario`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>{dict.hero.ctaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-[#0e1422] hover:bg-[#151e32] border border-slate-800 hover:border-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <span>{dict.hero.ctaSecondary}</span>
          </a>

          <a
            href="#calculator-hub"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-emerald-400 bg-transparent hover:bg-slate-900/40 transition-all cursor-pointer"
          >
            <span>{dict.hero.ctaExploreProvinces}</span>
          </a>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{dict.hero.trustItem1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>{dict.hero.trustItem2}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{dict.hero.trustItem3}</span>
          </div>
        </div>
      </section>

      {/* 1. MOCK BROWSER WINDOW COMPONENT: FULL SIMULATION PREVIEW */}
      <TaxSimulationPreview locale={locale} />

      {/* 2. INTERACTIVE ONBOARDING PROCESS: HOW IT WORKS */}
      <div id="how-it-works">
        <InteractiveOnboarding locale={locale} />
      </div>

      {/* 3. CALCULATOR HUB & CTAS (DIRECT JUMP TO 1 OF THE CALCULATORS) */}
      <CalculatorHub locale={locale} />

      {/* 4. PROGRESSIVE TAX CURVE ANALYTICS (CULT UI LINE CHART) */}
      <TaxCurveAnalytics locale={locale} />

      {/* 5. TAX INFORMATION & FINANCIAL KNOWLEDGE HUB (PREVIOUS SITE DATA) */}
      <TaxInformationHub locale={locale} />

      {/* 6. BOTTOM HIGH-IMPACT CTA & CASL NEWSLETTER CAPTURE */}
      <section className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-[#0c1626] via-[#0e1c2e] to-[#09111c] text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              {dict.bottomCta.badge}
            </span>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {dict.bottomCta.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {dict.bottomCta.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href={`/${locale}/calculator/ontario`}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>{dict.bottomCta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Newsletter Capture Section */}
        <div className="bg-gradient-to-b from-[#111625] to-[#090d16] text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
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
        </div>

        {/* Statutory Legal Disclaimer */}
        <footer className="text-center text-xs text-slate-500 py-4 max-w-4xl mx-auto leading-relaxed">
          <p>{dict.disclaimer}</p>
        </footer>
      </section>
    </div>
  );
}
