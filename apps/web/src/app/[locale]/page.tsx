import React from 'react';
import Calculator from '@/components/Calculator';
import { Locale, getDictionary } from '@/lib/i18n';
import { CheckCircle2, Shield, Sparkles, BookOpen } from 'lucide-react';
import { ShadowCard, ShadowCardBevel } from '@/components/ui/shadow-card';

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
    <div className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green-light text-brand-green-dark border border-brand-green/20">
          <Sparkles className="w-3.5 h-3.5 text-brand-green" />
          <span>{dict.hero.badge}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {dict.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {dict.hero.subtitle}
        </p>
      </section>

      {/* Calculator Core */}
      <Calculator locale={locale} initialProvince="ON" initialSalaryDollars={80000} />

      {/* Trust & Architecture Features Grid using Cult UI ShadowCard */}
      <section className="max-w-7xl mx-auto pt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ShadowCard className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <ShadowCardBevel barClassName="bg-brand-green/25" />
            <div className="w-10 h-10 rounded-xl bg-brand-green-light flex items-center justify-center text-brand-green-dark font-bold">
              <CheckCircle2 className="w-5 h-5 text-brand-green" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {locale === 'fr' ? 'Précision garantie par tests' : 'Mathematically Proven & Tested'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {locale === 'fr'
                ? 'Plus de 40 scénarios validés directement contre les formulaires d’impôt officiels de l’ARC et Revenu Québec.'
                : 'Every rate, threshold, and credit is backed by official CRA and provincial form citations with automated CI test vectors.'}
            </p>
          </ShadowCard>

          <ShadowCard className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <ShadowCardBevel barClassName="bg-brand-blue/25" />
            <div className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-brand-blue-dark font-bold">
              <Shield className="w-5 h-5 text-brand-blue" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {locale === 'fr' ? 'Confidentialité totale' : 'Local Browser Execution'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {locale === 'fr'
                ? 'Aucune donnée financière ne quitte votre appareil. Vos revenus ne sont jamais enregistrés ni envoyés à des serveurs tiers.'
                : 'Zero network calls during calculation. Your income never leaves your device and is never sent to analytics or logging.'}
            </p>
          </ShadowCard>

          <ShadowCard className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <ShadowCardBevel barClassName="bg-purple-500/25" />
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700 font-bold">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {locale === 'fr' ? 'Transparence des dépenses' : 'Public Spending Clarity'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {locale === 'fr'
                ? 'Voyez exactement comment vos impôts fédéraux financent la santé, les aînés, la défense et les programmes sociaux.'
                : 'Connect your tax dollars directly to the Public Accounts of Canada to see how public funds are invested in healthcare and social programs.'}
            </p>
          </ShadowCard>
        </div>
      </section>
    </div>
  );
}
