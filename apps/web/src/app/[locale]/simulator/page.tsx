import React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n';
import { SITE_URL, localeParams, localizedAlternates, resolveLocale } from '@/lib/locale';
import FederalBudgetSimulator from './FederalBudgetSimulator';

interface SimulatorPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({
  params,
}: SimulatorPageProps): Promise<Metadata> {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);
  const dict = getDictionary(locale);

  return {
    title: `${dict.budgetSimulator.title} — Fiscal Insights`,
    description: dict.budgetSimulator.subtitle,
    alternates: localizedAlternates(locale, '/simulator'),
    openGraph: {
      title: `${dict.budgetSimulator.title} — Fiscal Insights`,
      description: dict.budgetSimulator.subtitle,
      url: `${SITE_URL}/${locale}/simulator`,
      siteName: 'Fiscal Insights',
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      type: 'website',
    },
  };
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <FederalBudgetSimulator locale={locale} />
    </main>
  );
}

