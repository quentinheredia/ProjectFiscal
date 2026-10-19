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
    <div className="mx-auto w-full max-w-2xl lg:max-w-7xl lg:px-8 lg:py-12">
      <FederalBudgetSimulator locale={locale} />
    </div>
  );
}

