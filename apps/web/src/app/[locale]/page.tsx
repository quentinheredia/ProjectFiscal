import React from 'react';
import Calculator from '@/components/Calculator';
import CalculatorExtras from '@/components/CalculatorExtras';
import { Locale, getDictionary } from '@/lib/i18n';
import { CheckCircle2, Shield, Sparkles, BookOpen } from 'lucide-react';
import { BrowserWindow } from '@/components/ui/mock-browser-window';
import { TextureCard } from '@/components/ui/texture-card';
import SiteTutorial from '@/components/SiteTutorial';
import TaxCurveAnalytics from '@/components/TaxCurveAnalytics';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
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
    <div className="space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header with Cult UI Dark Aesthetic */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{dict.hero.badge}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          {dict.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {dict.hero.subtitle}
        </p>
      </section>

      {/* Calculator Core Framed in Mock Browser Window (SaaS Showcase) */}
      <section className="max-w-7xl mx-auto">
        <BrowserWindow
          url={`https://fiscal-insights.ca/${locale}/calculator/ontario`}
          variant="safari"
          theme="dark"
          headerStyle="full"
          className="border-slate-800 bg-[#090d16]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] rounded-2xl overflow-hidden"
        >
          <div className="p-4 sm:p-8 space-y-10">
            <Calculator locale={locale} initialProvince="ON" initialSalaryDollars={80000} />
            <CalculatorExtras locale={locale} />
          </div>
        </BrowserWindow>
      </section>

      {/* Tax Curve Analytics (Cult UI AnalyticsLineChart) */}
      <TaxCurveAnalytics locale={locale} />

      {/* Site Tutorial / Onboarding (Cult UI Onboarding & TipsList) */}
      <SiteTutorial locale={locale} />

      {/* Trust & Architecture Features Grid using Cult UI TextureCard */}
      <section className="max-w-7xl mx-auto pt-8 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TextureCard className="bg-[#0c121e] border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">
              {locale === 'fr' ? 'Précision garantie par tests' : 'Mathematically Proven & Tested'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === 'fr'
                ? 'Plus de 40 scénarios validés directement contre les formulaires d’impôt officiels de l’ARC et Revenu Québec.'
                : 'Every rate, threshold, and credit is backed by official CRA and provincial form citations with automated CI test vectors.'}
            </p>
          </TextureCard>

          <TextureCard className="bg-[#0c121e] border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-base font-bold text-white">
              {locale === 'fr' ? 'Confidentialité totale' : 'Local Browser Execution'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === 'fr'
                ? 'Aucune donnée financière ne quitte votre appareil. Vos revenus ne sont jamais enregistrés ni envoyés à des serveurs tiers.'
                : 'Zero network calls during calculation. Your income never leaves your device and is never sent to analytics or logging.'}
            </p>
          </TextureCard>

          <TextureCard className="bg-[#0c121e] border-slate-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.5)] p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="text-base font-bold text-white">
              {locale === 'fr' ? 'Transparence des dépenses' : 'Public Spending Clarity'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {locale === 'fr'
                ? 'Voyez exactement comment vos impôts fédéraux financent la santé, les aînés, la défense et les programmes sociaux.'
                : 'Connect your tax dollars directly to the Public Accounts of Canada to see how public funds are invested in healthcare and social programs.'}
            </p>
          </TextureCard>
        </div>
      </section>
    </div>
  );
}
