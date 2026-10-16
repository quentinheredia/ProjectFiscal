import '../globals.css';
import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { Locale, getDictionary } from '@/lib/i18n';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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

// This is the root layout (there is no app/layout.tsx) so that <html lang> follows the locale.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale: Locale = resolved.locale === 'fr' ? 'fr' : 'en';

  return (
    <html lang={locale === 'fr' ? 'fr-CA' : 'en-CA'}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-green-light selection:text-brand-green-dark">
        <Navbar locale={locale} />
        <main className="grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
