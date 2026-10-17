'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import {
  Play,
  Map,
  Table2,
  Scale,
  Globe,
  ChevronDown,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface NavbarProps {
  locale: Locale;
}

const PROVINCES = [
  { slug: 'ontario', code: 'ON', nameEn: 'Ontario', nameFr: 'Ontario', form: 'ON428' },
  { slug: 'quebec', code: 'QC', nameEn: 'Québec', nameFr: 'Québec', form: 'TP-1' },
  { slug: 'british-columbia', code: 'BC', nameEn: 'British Columbia', nameFr: 'Colombie-Britannique', form: 'BC428' },
  { slug: 'alberta', code: 'AB', nameEn: 'Alberta', nameFr: 'Alberta', form: 'AB428' },
] as const;

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const [provOpen, setProvOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('simulator');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLandingPage = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProvOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeProvince =
    PROVINCES.find((p) => pathname.includes(`/${p.slug}`)) || PROVINCES[0];

  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const targetPath =
    pathname.replace(/^\/(en|fr)/, `/${targetLocale}`) || `/${targetLocale}`;

  // Distinct user-flow stops (no duplicate Calculator buttons)
  const navItems = [
    {
      id: 'simulator',
      href: `/${locale}#simulator`,
      label: locale === 'fr' ? 'Simulateur' : 'Simulator',
      icon: <Play className="w-3.5 h-3.5" />,
    },
    {
      id: 'provinces',
      href: `/${locale}#provinces`,
      label: locale === 'fr' ? 'Provinces' : 'Provinces',
      icon: <Map className="w-3.5 h-3.5" />,
    },
    {
      id: 'brackets',
      href: `/${locale}#brackets`,
      label: locale === 'fr' ? 'Tranches 2026' : '2026 Brackets',
      icon: <Table2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'audit',
      href: `/${locale}/salary/80000/ontario`,
      label: locale === 'fr' ? 'Preuve d’audit' : 'Audit Proof',
      icon: <Scale className="w-3.5 h-3.5" />,
      badge: true,
    },
  ];

  const currentTab = pathname.includes('/salary/80000')
    ? 'audit'
    : isLandingPage
    ? activeHash
    : '';

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* LEFT: Brand Identity (Home Link) */}
        <Link href={`/${locale}`} className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
            <span className="relative z-10">FI</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-lg leading-none">
                Fiscal<span className="text-emerald-400">Insights</span>
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                2026 CRA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              Canada Tax Transparency
            </span>
          </div>
        </Link>

        {/* CENTER: Non-Redundant Content Flow (Cult UI Glow Pill) */}
        <nav
          className="hidden md:flex items-center p-1.5 rounded-2xl bg-[#111113] border border-[#252527] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.05)]"
          aria-label="Page Navigation"
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (item.id !== 'audit') setActiveHash(item.id);
                }}
                className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-[#0a0a0d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.05)]" />
                    <span className="absolute inset-[2px] overflow-hidden rounded-[10px]">
                      <span
                        className="animate-gold-spin motion-reduce:animate-none absolute inset-[-80%] origin-center will-change-transform opacity-90"
                        style={{
                          background:
                            'conic-gradient(from 220deg, #10B981 0%, #06B6D4 20%, #3B82F6 40%, #10B981 60%, #34D399 80%, #10B981 100%)',
                        }}
                      />
                    </span>
                    <span className="absolute inset-[3.5px] rounded-[8px] bg-[#141416] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.6)]" />
                  </>
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Language Toggle + Single Unified Split-Button Calculator Launcher */}
        <div className="flex items-center gap-2.5">
          <Link
            href={targetPath}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-[#161b26] hover:bg-[#1e2536] border border-slate-700/60 hover:text-white transition-all cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{locale === 'en' ? 'FR' : 'EN'}</span>
          </Link>

          {/* Unified Split CTA: Left side launches active province, Right chevron switches province */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <Link
              href={`/${locale}/calculator/${activeProvince.slug}`}
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 text-xs font-bold rounded-l-lg text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)] cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>
                {locale === 'fr'
                  ? `Calculatrice (${activeProvince.code})`
                  : `${activeProvince.nameEn} Calculator`}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setProvOpen((prev) => !prev)}
              className="inline-flex items-center justify-center px-2 py-1.5 text-xs font-bold rounded-r-lg text-slate-950 bg-emerald-500 hover:bg-emerald-300 border-l border-slate-950/20 transition-colors cursor-pointer"
              aria-label="Select Province Calculator"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  provOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {provOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0e1420] border border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.75)] py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  {locale === 'fr' ? 'Choisir une province' : 'Launch Province Calculator'}
                </div>
                {PROVINCES.map((prov) => {
                  const isSelected = prov.slug === activeProvince.slug;
                  return (
                    <button
                      key={prov.slug}
                      type="button"
                      onClick={() => {
                        setProvOpen(false);
                        router.push(`/${locale}/calculator/${prov.slug}`);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-slate-800 text-slate-300 text-center">
                          {prov.code}
                        </span>
                        <span>{locale === 'fr' ? prov.nameFr : prov.nameEn}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
