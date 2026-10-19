'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { formatCurrency } from '@/lib/format';
import type { ProvinceConfig, ProvinceSlug } from '@/lib/provinces';
import { salaryBenchmarks } from '@/features/tax/salary-benchmarks';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { ChipRail } from '@/components/mobile/ChipRail';
import type { NavId, NavItem } from './nav-items';
import { pathInLocale } from './locale-switch';
import { ProvinceGrid } from './ProvincePicker';

const ACTIVE_BAR = <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-emerald-400" aria-hidden="true" />;

interface MobileTabBarProps {
  items: NavItem[];
  active: NavId | null;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

/** Fixed bottom bar on phones and tablets: three destinations and the menu. */
export function MobileTabBar({ items, active, menuOpen, onOpenMenu }: MobileTabBarProps) {
  const nav = useDictionary().nav;
  const tab = 'relative flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-emerald-400';

  return (
    // Lives outside the header, whose backdrop blur would trap position: fixed.
    <nav
      aria-label={nav.mobileNavLabel}
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-[#0b1019]/95 backdrop-blur-xl border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {items.map(({ id, href, shortLabel, Icon }) => {
          const isActive = active === id && !menuOpen;
          return (
            <li key={id}>
              <Link href={href} aria-current={isActive ? 'page' : undefined} className={`${tab} ${isActive ? 'text-emerald-400' : 'text-slate-400 active:text-slate-200'}`}>
                {isActive && ACTIVE_BAR}
                <Icon className="w-5 h-5" aria-hidden="true" />
                <span>{shortLabel}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className={`${tab} w-full ${menuOpen ? 'text-emerald-400' : 'text-slate-400 active:text-slate-200'}`}
          >
            {menuOpen && ACTIVE_BAR}
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span>{nav.menu}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  pathname: string;
  items: NavItem[];
  province: ProvinceConfig;
  onPickProvince: (slug: ProvinceSlug) => void;
}

function SheetHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</h3>;
}

/** The phone menu: province, every destination, salary breakdowns and language. */
export function MenuSheet({ open, onClose, locale, pathname, items, province, onPickProvince }: MenuSheetProps) {
  const nav = useDictionary().nav;
  const languages: { locale: Locale; label: string }[] = [
    { locale: 'en', label: nav.languageEnglish },
    { locale: 'fr', label: nav.languageFrench },
  ];

  return (
    <BottomSheet open={open} onClose={onClose} title={nav.menuTitle} closeLabel={nav.close}>
      <section className="space-y-2.5">
        <SheetHeading>{nav.selectJurisdiction}</SheetHeading>
        <ProvinceGrid
          locale={locale}
          current={province}
          onPick={(slug) => {
            onPickProvince(slug);
            onClose();
          }}
        />
      </section>

      <nav aria-label={nav.goTo} className="space-y-1">
        <SheetHeading>{nav.goTo}</SheetHeading>
        <ul>
          {items.map(({ id, href, label, Icon }) => (
            <li key={id}>
              <Link
                href={href}
                onClick={onClose}
                className="flex min-h-12 items-center gap-3 border-b border-white/[0.05] px-1 text-sm text-slate-200 active:text-white"
              >
                <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span className="grow">{label}</span>
                <ArrowRight className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="space-y-2.5">
        <SheetHeading>{nav.salaryBreakdowns}</SheetHeading>
        <ChipRail label={nav.salaryBreakdowns}>
          {salaryBenchmarks(locale).map(({ amountDollars, href }) => (
            <Link
              key={amountDollars}
              href={href}
              onClick={onClose}
              className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-4 text-[13px] font-medium tabular-nums text-slate-200 active:bg-white/[0.06]"
            >
              {formatCurrency(amountDollars, locale)}
            </Link>
          ))}
        </ChipRail>
      </section>

      <section className="space-y-2.5">
        <SheetHeading>{nav.language}</SheetHeading>
        <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#070b12] p-1">
          {languages.map((language) => {
            const current = language.locale === locale;
            return (
              <Link
                key={language.locale}
                href={pathInLocale(pathname, language.locale)}
                hrefLang={language.locale}
                lang={language.locale}
                aria-current={current ? 'true' : undefined}
                onClick={onClose}
                className={`flex min-h-11 flex-1 items-center justify-center rounded-lg text-[13px] font-semibold ${
                  current ? 'bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]' : 'text-slate-400 active:text-slate-200'
                }`}
              >
                {language.label}
              </Link>
            );
          })}
        </div>
      </section>
    </BottomSheet>
  );
}
