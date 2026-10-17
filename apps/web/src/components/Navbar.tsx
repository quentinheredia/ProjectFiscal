'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Locale, getDictionary } from '@/lib/i18n';
import { Calculator, MapPin, DollarSign, Globe } from 'lucide-react';

interface NavbarProps {
  locale: Locale;
}

interface NavTab {
  id: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function Navbar({ locale }: NavbarProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname() || `/${locale}`;

  // Toggle locale between 'en' and 'fr' while preserving current sub-path
  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const targetPath = pathname.replace(`/${locale}`, `/${targetLocale}`) || `/${targetLocale}`;

  const navItems: NavTab[] = [
    {
      id: 'calculator',
      href: `/${locale}`,
      label: dict.nav.calculator,
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
    {
      id: 'ontario',
      href: `/${locale}/calculator/ontario`,
      label: 'Ontario',
      icon: <MapPin className="w-3.5 h-3.5" />,
    },
    {
      id: 'salary80k',
      href: `/${locale}/salary/80000/ontario`,
      label: '$80k in ON',
      icon: <DollarSign className="w-3.5 h-3.5" />,
    },
  ];

  // Determine active item from current route
  const activeItem = navItems.find((item) => {
    if (item.id === 'calculator') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(item.href);
  })?.id ?? 'calculator';

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
            <span className="relative z-10">FI</span>
            <div className="absolute inset-0 rounded-xl bg-emerald-400/20 blur-[2px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white tracking-tight text-lg leading-none">
              Fiscal<span className="text-emerald-400">Insights</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              Canada Tax Transparency
            </span>
          </div>
        </Link>

        {/* Cult UI Gradient Button Group Navigation */}
        <nav
          className="hidden md:flex items-center p-1.5 rounded-2xl bg-[#111113] border border-[#252527] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.05)]"
          aria-label="Main Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeItem === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <>
                    {/* Inset groove */}
                    <motion.span
                      layoutId="nav-well"
                      className="absolute inset-0 rounded-xl bg-[#0a0a0d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.05)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                    {/* Animated glowing gradient ring */}
                    <motion.span
                      layoutId="nav-ring"
                      className="absolute inset-[2px] overflow-hidden rounded-[10px]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    >
                      <span
                        className="animate-gold-spin absolute inset-[-80%] origin-center will-change-transform opacity-90"
                        style={{
                          background:
                            'conic-gradient(from 220deg, #10B981 0%, #06B6D4 20%, #3B82F6 40%, #10B981 60%, #34D399 80%, #10B981 100%)',
                        }}
                      />
                    </motion.span>
                    {/* Inner raised button surface */}
                    <motion.span
                      layoutId="nav-surface"
                      className="absolute inset-[3.5px] rounded-[8px] bg-[#141416] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.6)]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  </>
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right side: Language Switcher and Mobile Nav */}
        <div className="flex items-center gap-3">
          <Link
            href={targetPath}
            className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-[#161b26] hover:bg-[#1e2536] border border-slate-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.3)] hover:text-white transition-all"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{dict.nav.languageSwitch}</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav drawer / row */}
      <div className="md:hidden flex items-center justify-around py-2.5 px-3 border-t border-slate-800/60 bg-[#090d16]/95 text-xs">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
