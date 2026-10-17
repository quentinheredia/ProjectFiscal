'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, getDictionary } from '@/lib/i18n';
import {
  Play,
  Table2,
  Globe,
  ChevronDown,
  ArrowRight,
  Calculator,
  Menu,
  X,
  Home,
  FileCheck2,
  MapPin,
} from 'lucide-react';

import { useProvince, ProvinceSlug, PROVINCES_LIST } from '@/context/ProvinceContext';

interface NavbarProps {
  locale: Locale;
}

export default function Navbar({ locale }: NavbarProps) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const nav = getDictionary(locale).nav;
  const [provOpen, setProvOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
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

  // A modal <dialog> traps focus and handles Escape, but the page behind it still scrolls.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sheetOpen]);

  // Close the sheet whenever the route changes
  useEffect(() => {
    sheetRef.current?.close();
  }, [pathname]);

  const openSheet = () => {
    if (!sheetRef.current?.open) sheetRef.current?.showModal();
    setSheetOpen(true);
  };
  const closeSheet = () => sheetRef.current?.close();

  // Sync route province if on a province calculator page
  const matchedRouteProvince = PROVINCES_LIST.find((p) => pathname.includes(`/${p.slug}`));
  const currentProvince = matchedRouteProvince ?? selectedProvince;

  const targetLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const targetPath =
    pathname.replace(/^\/(en|fr)/, `/${targetLocale}`) || `/${targetLocale}`;

  const selectProvince = (slug: ProvinceSlug) => {
    setSelectedProvinceSlug(slug);
    if (pathname.includes('/calculator')) {
      router.push(`/${locale}/calculator/${slug}`);
    }
  };

  // Distinct user-flow stops: Tax Calculator, Budget Simulator, 2026 Brackets & Audit
  const navItems = [
    {
      id: 'calculator',
      href: `/${locale}/calculator/${currentProvince.slug}`,
      label: nav.taxCalculator,
      shortLabel: nav.calculator,
      Icon: Calculator,
    },
    {
      id: 'simulator',
      href: `/${locale}/simulator`,
      label: nav.budgetSimulator,
      shortLabel: nav.simulatorShort,
      Icon: Play,
    },
    {
      id: 'brackets',
      href: `/${locale}#brackets`,
      label: nav.bracketsAudit,
      shortLabel: nav.bracketsShort,
      Icon: Table2,
    },
  ];

  const onNavClick = (id: string) => {
    if (id === 'brackets') setActiveHash('brackets');
    else if (id === 'calculator') setActiveHash('');
    else setActiveHash(id);
  };

  // At the root, no tab is active; tabs light up only when on their dedicated route or hash
  const currentTab = pathname.includes('/simulator')
    ? 'simulator'
    : pathname.includes('/calculator') || pathname.includes('/salary')
    ? 'calculator'
    : isRoot && activeHash === 'brackets'
    ? 'brackets'
    : '';

  const provinceName = (p: (typeof PROVINCES_LIST)[number]) => (locale === 'fr' ? p.nameFr : p.nameEn);

  return (
    <>
      <header className="sticky top-0 z-50 pt-3 sm:pt-4 pb-2 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* LEFT: Brand Identity (Home Link with Official Logo) */}
          <Link
            href={`/${locale}`}
            onClick={() => setActiveHash('')}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <Image
                src="/logo-icon.png"
                alt="Fiscal Insights Logo"
                width={40}
                height={40}
                priority
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg leading-none">
                Fiscal<span className="text-emerald-400">Insights</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">
                {nav.tagline}
              </span>
            </div>
          </Link>

          {/* CENTER: Floating Dock Navigation (tablet landscape and up) */}
          <nav
            className="hidden lg:flex items-center p-1.5 rounded-full bg-[#0c121e]/90 border border-slate-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl ring-1 ring-white/5"
            aria-label={nav.mainNavLabel}
          >
            {navItems.map(({ id, href, label, Icon }) => {
              const isActive = currentTab === id;
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => onNavClick(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white bg-emerald-500/10 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.08)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent bg-transparent'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className={isActive ? 'font-bold' : 'font-medium'}>{label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT (desktop): Language Toggle + Jurisdiction Switcher */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href={targetPath}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-[#161b26] hover:bg-[#1e2536] border border-slate-700/60 hover:text-white transition-all cursor-pointer"
              aria-label={nav.languageSwitch}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>{locale === 'en' ? 'FR' : 'EN'}</span>
            </Link>

            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProvOpen((prev) => !prev)}
                className="inline-flex items-center justify-between w-[190px] px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-200 bg-[#111827] hover:bg-[#1f293d] border border-slate-700/80 hover:border-slate-600 transition-colors cursor-pointer shrink-0"
                aria-label={nav.selectJurisdiction}
                aria-expanded={provOpen}
              >
                <div className="flex items-center gap-1.5 min-w-0 text-left overflow-hidden">
                  <span className="text-emerald-400 font-bold font-mono shrink-0">📍 {currentProvince.code}</span>
                  <span className="text-slate-300 truncate text-left">{provinceName(currentProvince)}</span>
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
                    {nav.selectJurisdiction}
                  </div>
                  {PROVINCES_LIST.map((prov) => {
                    const isSelected = prov.slug === currentProvince.slug;
                    return (
                      <button
                        key={prov.slug}
                        type="button"
                        onClick={() => {
                          selectProvince(prov.slug);
                          setProvOpen(false);
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
                          <span>{provinceName(prov)}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT (mobile): province chip opens the menu sheet */}
          <button
            type="button"
            onClick={openSheet}
            aria-label={`${nav.changeProvince}: ${provinceName(currentProvince)}`}
            className="lg:hidden inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold font-mono text-emerald-300 bg-[#111827] border border-slate-700/80 active:bg-[#1f293d]"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {currentProvince.code}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* MOBILE: bottom tab bar. Lives outside the header, whose backdrop blur would trap position: fixed. */}
      <nav
        aria-label={nav.mobileNavLabel}
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0b1019]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-4">
          {navItems.map(({ id, href, shortLabel, Icon }) => {
            const isActive = currentTab === id && !sheetOpen;
            return (
              <li key={id}>
                <Link
                  href={href}
                  onClick={() => onNavClick(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 active:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  )}
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span>{shortLabel}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={openSheet}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className={`relative w-full flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold ${
                sheetOpen ? 'text-emerald-400' : 'text-slate-400 active:text-slate-200'
              }`}
            >
              {sheetOpen && (
                <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-emerald-400" aria-hidden="true" />
              )}
              <Menu className="w-5 h-5" aria-hidden="true" />
              <span>{nav.menu}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* MOBILE: menu bottom sheet (native modal dialog: focus trap, Escape and backdrop for free) */}
      <dialog
        ref={sheetRef}
        aria-labelledby="mobile-sheet-title"
        onClose={() => setSheetOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeSheet();
        }}
        className="sheet-in lg:hidden mt-auto mb-0 mx-0 w-full max-w-full max-h-[85dvh] p-0 rounded-t-2xl bg-[#0c121e] text-slate-100 border-t border-white/[0.1] shadow-[0_-12px_40px_rgba(0,0,0,0.7)] backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-6">
          <div className="mx-auto w-10 h-1 rounded-full bg-white/15" aria-hidden="true" />

          <div className="flex items-center justify-between">
            <h2 id="mobile-sheet-title" className="text-base font-bold text-white">
              {nav.menuTitle}
            </h2>
            <button
              type="button"
              onClick={closeSheet}
              aria-label={nav.close}
              className="w-9 h-9 inline-flex items-center justify-center rounded-full text-slate-400 bg-white/[0.04] active:bg-white/[0.08]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <section className="space-y-2.5">
            <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{nav.selectJurisdiction}</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROVINCES_LIST.map((prov) => {
                const isSelected = prov.slug === currentProvince.slug;
                return (
                  <button
                    key={prov.slug}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      selectProvince(prov.slug);
                      closeSheet();
                    }}
                    className={`flex items-center gap-2.5 min-h-12 px-3 rounded-xl border text-left text-sm ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                        : 'bg-white/[0.02] border-white/[0.08] text-slate-200 active:bg-white/[0.06]'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold text-slate-400">{prov.code}</span>
                    <span className="leading-tight">{provinceName(prov)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-1">
            {[
              { href: `/${locale}`, label: nav.home, Icon: Home },
              { href: `/${locale}/salary/80000/ontario`, label: nav.auditBenchmark, Icon: FileCheck2 },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeSheet}
                className="flex items-center gap-3 min-h-12 px-1 text-sm text-slate-200 border-b border-white/[0.05] active:text-white"
              >
                <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span className="grow">{label}</span>
                <ArrowRight className="w-4 h-4 text-slate-600" aria-hidden="true" />
              </Link>
            ))}
            <Link
              href={targetPath}
              onClick={closeSheet}
              className="flex items-center gap-3 min-h-12 px-1 text-sm text-slate-200 active:text-white"
            >
              <Globe className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="grow">{nav.language}</span>
              <span className="text-xs font-semibold text-emerald-300">{nav.languageSwitch}</span>
            </Link>
          </section>
        </div>
      </dialog>
    </>
  );
}
