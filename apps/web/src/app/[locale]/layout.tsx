import '../globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import { getDictionary } from '@/lib/i18n';
import { SITE_URL, localeParams, localizedAlternates, resolveLocale } from '@/lib/locale';
import BackgroundGuides from '@/components/BackgroundGuides';
import { ProvinceProvider } from '@/context/ProvinceContext';
import { DictionaryProvider } from '@/lib/dictionary-context';

// viewport-fit=cover lets the mobile tab bar pad itself clear of the home indicator.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#090d16',
  colorScheme: 'dark',
};

// Only /en and /fr exist. Any other first segment, such as a browser's automatic /favicon.ico request, is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return localeParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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

// This is the root layout (there is no app/layout.tsx) so that <html lang> follows the locale.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolved = await params;
  const locale = resolveLocale(resolved.locale);

  return (
    <html lang={locale === 'fr' ? 'fr-CA' : 'en-CA'} className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0 bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300"
        suppressHydrationWarning
      >
        <DictionaryProvider dictionary={getDictionary(locale)}>
          <ProvinceProvider>
            <BackgroundGuides />
            <Navbar locale={locale} />
            <main className="relative z-10 grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </ProvinceProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
