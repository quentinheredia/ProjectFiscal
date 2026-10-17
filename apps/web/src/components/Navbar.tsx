'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Locale } from '@/lib/i18n';
import {
  Play,
  Table2,
  Globe,
  ChevronDown,
  ArrowRight,
  Calculator,
} from 'lucide-react';

import { useProvince, ProvinceSlug, PROVINCES_LIST } from '@/context/ProvinceContext';

interface NavbarProps {
  locale: Locale;
}

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const [provOpen, setProvOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();

  // Root or homepage detection across locales and bare path
  const isRoot =
    pathname === '/' ||
    pathname === '' ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProvOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '');
        setActiveHash(hash);
      };
      handleHashChange();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  // Sync route province if on a province calculator page
  const matchedRouteProvince = PROVINCES_LIST.find((p) => pathname.includes(`/${p.slug}`));
  const currentProvince = matchedRouteProvince ?? selectedProvince;

  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const targetPath =
    pathname.replace(/^\/(en|fr)/, `/${targetLocale}`) || `/${targetLocale}`;

  // Distinct user-flow stops: Tax Calculator, Budget Simulator, 2026 Brackets & Audit
  const navItems = [
    {
      id: 'calculator',
      href: `/${locale}/calculator/${currentProvince.slug}`,
      label: locale === 'fr' ? 'Calculateur d’impôt' : 'Tax Calculator',
      icon: <Calculator className="w-3.5 h-3.5" />,
    },
    {
      id: 'simulator',
      href: `/${locale}/simulator`,
      label: locale === 'fr' ? 'Simulateur budgétaire' : 'Budget Simulator',
      icon: <Play className="w-3.5 h-3.5" />,
    },
    {
      id: 'brackets',
      href: `/${locale}#brackets`,
      label: locale === 'fr' ? 'Barèmes 2026 et audit' : '2026 Brackets & Audit',
      icon: <Table2 className="w-3.5 h-3.5" />,
    },
  ];

  // At the root, no tab is active; tabs light up only when on their dedicated route or hash
  const currentTab = pathname.includes('/simulator')
    ? 'simulator'
    : pathname.includes('/calculator') || pathname.includes('/salary')
    ? 'calculator'
    : isRoot && activeHash === 'brackets'
    ? 'brackets'
    : '';

  return (
    <header className="sticky top-0 z-50 pt-3 sm:pt-4 pb-2 bg-[#090d16]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* LEFT: Brand Identity (Home Link with Official Logo) */}
        <Link
          href={`/${locale}`}
          onClick={() => setActiveHash('')}
          className="flex items-center gap-3 group shrink-0"
        >
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <Image
              src="/logo-icon.png"
              alt="Fiscal Insights Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-lg leading-none">
                Fiscal<span className="text-emerald-400">Insights</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
              Canada Tax Transparency
            </span>
          </div>
        </Link>

        {/* CENTER: Floating Dock Navigation */}
        <nav
          className="hidden md:flex items-center p-1.5 rounded-full bg-[#0c121e]/90 border border-slate-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl ring-1 ring-white/5"
          aria-label="Floating Navigation Dock"
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (item.id === 'brackets') setActiveHash('brackets');
                  else if (item.id === 'calculator') setActiveHash('');
                  else setActiveHash(item.id);
                }}
                className={`relative px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white bg-emerald-500/10 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.08)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent bg-transparent'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span className={isActive ? 'font-bold' : 'font-medium'}>{item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Language Toggle + Jurisdiction Switcher */}
        <div className="flex items-center gap-2.5">
          <Link
            href={targetPath}
            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-[#161b26] hover:bg-[#1e2536] border border-slate-700/60 hover:text-white transition-all cursor-pointer"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>{locale === 'en' ? 'FR' : 'EN'}</span>
          </Link>

          {/* Active Jurisdiction Dropdown Switcher */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProvOpen((prev) => !prev)}
              className="inline-flex items-center justify-between w-[84px] sm:w-[190px] px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-200 bg-[#111827] hover:bg-[#1f293d] border border-slate-700/80 hover:border-slate-600 transition-colors cursor-pointer shrink-0"
              aria-label="Select Jurisdiction"
            >
              <div className="flex items-center gap-1.5 min-w-0 text-left overflow-hidden">
                <span className="text-emerald-400 font-bold font-mono shrink-0">📍 {currentProvince.code}</span>
                <span className="hidden sm:inline text-slate-300 truncate text-left">
                  {locale === 'fr' ? currentProvince.nameFr : currentProvince.nameEn}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                  provOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {provOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0e1420] border border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.75)] py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                  {locale === 'fr' ? 'Changer de province' : 'Select Jurisdiction'}
                </div>
                {PROVINCES_LIST.map((prov) => {
                  const isSelected = prov.slug === currentProvince.slug;
                  return (
                    <button
                      key={prov.slug}
                      type="button"
                      onClick={() => {
                        setSelectedProvinceSlug(prov.slug as ProvinceSlug);
                        setProvOpen(false);
                        if (pathname.includes('/calculator')) {
                          router.push(`/${locale}/calculator/${prov.slug}`);
                        }
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
