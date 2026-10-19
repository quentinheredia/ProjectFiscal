import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';
import { SITE_URL, localeParams, localizedAlternates, resolveLocale } from '@/lib/locale';
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
import HeroCtasPhone from '@/components/home/HeroCtasPhone';
import BottomConversionCta from '@/components/BottomConversionCta';
import Footer from '@/components/Footer';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const dict = getDictionary(locale);

  return {
    title: dict.siteTitle,
    description: dict.siteDescription,
    alternates: localizedAlternates(locale),
    openGraph: {
      title: dict.siteTitle,
      description: dict.siteDescription,
      url: `${SITE_URL}/${locale}`,
      siteName: 'Fiscal Insights',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
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
    <div className="space-y-12 lg:space-y-16 pb-8 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION + SIMULATION PREVIEW (Tightened Gap for Screen Share / Demo) */}
      <div className="space-y-6 sm:space-y-8">
        <section className="text-center max-w-4xl mx-auto space-y-5 lg:space-y-6 pt-2 lg:pt-8">
          <h1 className="text-[2.125rem] md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] text-balance">
            {dict.hero.title}
          </h1>

          <p className="text-[15px] md:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto text-pretty">
            {dict.hero.subtitle}
          </p>

          <PhoneOnly>
            <HeroCtasPhone locale={locale} />
          </PhoneOnly>
          <DesktopOnly>
            <HeroCtas locale={locale} exploreProvincesText={dict.hero.ctaExploreProvinces} />
          </DesktopOnly>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 lg:pt-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{dict.hero.trustItem1}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
              <span>{dict.hero.trustItem3}</span>
            </div>
          </div>
        </section>

        <div className="relative lg:mt-8">
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
      <section className="max-w-2xl lg:max-w-7xl mx-auto">
        <div className="bg-[#0c121e] rounded-2xl lg:rounded-3xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_15px_40px_-10px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80">
            {/* Left Column: Primary Conversion Action */}
            <div className="lg:col-span-7 p-5 md:p-8 lg:p-10 flex flex-col justify-between space-y-6">
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
                    <span>{dict.bottomCta.exactCent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 2027 Statutory Indexation Alerts */}
            <div className="lg:col-span-5 p-5 md:p-8 lg:p-10 bg-[#080d17]/60 flex flex-col justify-between space-y-5">
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

      <Footer locale={locale} />
    </div>
  );
}
