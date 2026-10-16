'use client';

import React from 'react';
import Link from 'next/link';
import { Locale, getDictionary } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  locale: Locale;
}

export default function Navbar({ locale }: NavbarProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname() || `/${locale}`;

  // Toggle locale between 'en' and 'fr' while preserving current sub-path
  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const targetPath = pathname.replace(`/${locale}`, `/${targetLocale}`) || `/${targetLocale}`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-green to-brand-blue flex items-center justify-center text-white font-black text-base shadow-xs group-hover:opacity-90 transition-opacity">
            FI
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
              Fiscal<span className="text-brand-blue">Insights</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
              Canada Tax Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href={`/${locale}`}
            className="hover:text-slate-900 transition-colors"
          >
            {dict.nav.calculator}
          </Link>
          <Link
            href={`/${locale}/calculator/ontario`}
            className="hover:text-slate-900 transition-colors"
          >
            Ontario
          </Link>
          <Link
            href={`/${locale}/salary/80000/ontario`}
            className="hover:text-slate-900 transition-colors"
          >
            $80k in ON
          </Link>
        </nav>

        {/* Right side: Language Switcher */}
        <div className="flex items-center gap-3">
          <Link
            href={targetPath}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            {dict.nav.languageSwitch}
          </Link>
        </div>
      </div>
    </header>
  );
}
