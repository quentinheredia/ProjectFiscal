import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  CheckCircle2,
  Layers,
} from 'lucide-react';
import TaxSimulationPreview from '@/components/TaxSimulationPreview';
import InteractiveOnboarding from '@/components/InteractiveOnboarding';
import CalculatorHub from '@/components/CalculatorHub';
import TaxInformationHub from '@/components/TaxInformationHub';
import TaxCurveAnalytics from '@/components/TaxCurveAnalytics';
import NewsletterForm from '@/components/NewsletterForm';
import HeroCtas from '@/components/HeroCtas';
import BottomConversionCta from '@/components/BottomConversionCta';

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
    <div className="space-y-16 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION + SIMULATION PREVIEW (Tightened Gap for Screen Share / Demo) */}
      <div className="space-y-6 sm:space-y-8">
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
            {dict.hero.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {dict.hero.subtitle}
          </p>

          {/* Hero Call To Actions & Quick Section Anchors */}
          <HeroCtas locale={locale} exploreProvincesText={dict.hero.ctaExploreProvinces} />

          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dict.hero.trustItem1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{dict.hero.trustItem3}</span>
            </div>
          </div>
        </section>

        {/* 1. MOCK BROWSER WINDOW COMPONENT: FULL SIMULATION PREVIEW (HERO ANCHOR) */}
        <div className="relative mt-8">
          <TaxSimulationPreview locale={locale} />
        </div>
      </div>

      {/* 2. INTERACTIVE ONBOARDING PROCESS: HOW IT WORKS */}
      <InteractiveOnboarding locale={locale} />

      {/* 3. CALCULATOR HUB & CTAS (DIRECT JUMP TO 1 OF THE CALCULATORS) */}
      <CalculatorHub locale={locale} />

      {/* 4. PROGRESSIVE TAX CURVE ANALYTICS (CULT UI LINE CHART) */}
      <TaxCurveAnalytics locale={locale} />

      {/* 5. TAX INFORMATION & FINANCIAL KNOWLEDGE HUB (PREVIOUS SITE DATA) */}
      <TaxInformationHub locale={locale} />

      {/* 6. UNIFIED CONVERSION & 2027 INDEXATION ALERT CARD */}
      <section className="max-w-7xl mx-auto">
        <div className="bg-[#0c121e] rounded-3xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_15px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
            {/* Left Column: Primary Conversion Action */}
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {dict.bottomCta.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  {dict.bottomCta.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <BottomConversionCta locale={locale} />
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{locale === 'fr' ? 'Précision au centime' : 'Exact Cent'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 2027 Statutory Indexation Alerts */}
            <div className="lg:col-span-5 p-8 sm:p-10 bg-[#080d17]/60 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {dict.newsletter.badge}
                </span>
                <h4 className="text-xl font-bold text-white tracking-tight">
                  {dict.newsletter.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {dict.newsletter.description}
                </p>
              </div>
              <div>
                <NewsletterForm locale={locale} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-COLUMN PRODUCTION FOOTER */}
      <footer className="max-w-7xl mx-auto pt-10 border-t border-slate-800/80 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          {/* Column 1: Brand & Verification */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-icon.png"
                alt="Fiscal Insights Logo"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
              <span className="font-extrabold text-white text-sm">
                Fiscal<span className="text-emerald-400">Insights</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {locale === 'fr'
                ? 'Plateforme open source de transparence fiscale et de calcul d’impôt canadien conforme aux normes ARC 2026.'
                : 'Audited Canadian tax engine and fiscal transparency platform built to CRA 2026 statutory specifications.'}
            </p>
            <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {locale === 'fr' ? 'Moteur ARC 2026.1 validé' : '2026.1 CRA Engine Audited'}
            </span>
          </div>

          {/* Column 2: Provincial Calculators */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              {locale === 'fr' ? 'Calculateurs' : 'Calculators'}
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href={`/${locale}/calculator/ontario`} className="hover:text-emerald-400 transition-colors">
                  Ontario (ON428)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/calculator/quebec`} className="hover:text-emerald-400 transition-colors">
                  Québec (TP-1)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/calculator/british-columbia`} className="hover:text-emerald-400 transition-colors">
                  British Columbia (BC428)
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/calculator/alberta`} className="hover:text-emerald-400 transition-colors">
                  Alberta (AB428)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Fast-Track Benchmarks */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              {locale === 'fr' ? 'Repères d’audit' : 'Audit Benchmarks'}
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href={`/${locale}/salary/80000/ontario`} className="text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                  <span>$80,000 Audit Case</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/salary/50000/ontario`} className="hover:text-emerald-400 transition-colors">
                  $50,000 Fast-Track
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/salary/100000/ontario`} className="hover:text-emerald-400 transition-colors">
                  $100,000 Fast-Track
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/salary/150000/ontario`} className="hover:text-emerald-400 transition-colors">
                  $150,000 Fast-Track
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Architecture & Integrity */}
          <div className="space-y-2.5">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
              {locale === 'fr' ? 'Normes & Intégrité' : 'Standards & Privacy'}
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Client-Side Pure</span>
              </li>
              <li className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Integer-Cents Math</span>
              </li>
              <li className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Remote Tracking</span>
              </li>
              <li className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Schedule 1 Citations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500 leading-relaxed max-w-4xl mx-auto space-y-2">
          <p>{dict.disclaimer}</p>
          <p className="text-[11px] text-slate-600 font-mono">
            © 2026 Fiscal Insights. Canadian Tax Transparency Initiative.
          </p>
        </div>
      </footer>
    </div>
  );
}
