import React from 'react';
import type { Metadata } from 'next';
import { Locale, getDictionary } from '@/lib/i18n';
import FederalBudgetSimulator from './FederalBudgetSimulator';

interface SimulatorPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: SimulatorPageProps): Promise<Metadata> {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';
  const dict = getDictionary(locale);

  return {
    title: `${dict.budgetSimulator.title} — Fiscal Insights`,
    description: dict.budgetSimulator.subtitle,
    alternates: {
      canonical: `https://fiscal-insights.ca/${locale}/simulator`,
      languages: {
        'en-CA': 'https://fiscal-insights.ca/en/simulator',
        'fr-CA': 'https://fiscal-insights.ca/fr/simulator',
        'x-default': 'https://fiscal-insights.ca/en/simulator',
      },
    },
    openGraph: {
      title: `${dict.budgetSimulator.title} — Fiscal Insights`,
      description: dict.budgetSimulator.subtitle,
      url: `https://fiscal-insights.ca/${locale}/simulator`,
      siteName: 'Fiscal Insights',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      type: 'website',
    },
  };
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <FederalBudgetSimulator locale={locale} />
    </main>
  );
}

