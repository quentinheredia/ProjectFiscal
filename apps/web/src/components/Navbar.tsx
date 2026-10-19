'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, MapPin } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { useProvince } from '@/context/ProvinceContext';
import { provinceName, PROVINCES, type ProvinceSlug } from '@/lib/provinces';
import { navItems, primaryNavItems } from '@/components/navigation/nav-items';
import { useActiveSection } from '@/components/navigation/useActiveSection';
import { localeSwitch } from '@/components/navigation/locale-switch';
import { DesktopControls, DesktopDock } from '@/components/navigation/DesktopNav';
import { MenuSheet, MobileTabBar } from '@/components/navigation/MobileNav';

/** The province named in the route (on calculator pages), or the one the visitor picked. */
function useCurrentProvince(pathname: string) {
  const { selectedProvince, setSelectedProvinceSlug } = useProvince();
  const fromRoute = PROVINCES.find((p) => pathname.includes(`/${p.slug}`));
  return { province: fromRoute ?? selectedProvince, setSelectedProvinceSlug };
}

/** Site header with the desktop dock and controls, plus the phone tab bar and menu sheet. */
export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const nav = useDictionary().nav;
  const [menuOpen, setMenuOpen] = useState(false);
  const { province, setSelectedProvinceSlug } = useCurrentProvince(pathname);
  const active = useActiveSection(pathname, locale);
  const items = navItems(locale, province.slug, nav);
  const primary = primaryNavItems(items);
  const language = localeSwitch(pathname, locale);

  // A route change closes the menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  const pickProvince = (slug: ProvinceSlug) => {
    setSelectedProvinceSlug(slug);
    if (pathname.includes('/calculator')) router.push(`/${locale}/calculator/${slug}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 pt-3 sm:pt-4 pb-2 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex min-h-11 items-center gap-2.5 sm:gap-3 group shrink-0">
            {/* Logo emblem; the name next to it is live text, so the image is decorative */}
            <Image src="/brand/emblem-96.png" alt="" width={40} height={40} priority className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-white tracking-tight text-base sm:text-lg leading-none">
                Fiscal<span className="text-emerald-400">Insights</span>
              </span>
              <span className="hidden lg:block text-[10px] text-slate-400 font-mono tracking-wider uppercase mt-1">{nav.tagline}</span>
            </div>
          </Link>

          <DesktopDock items={primary} active={active} />
          <DesktopControls locale={locale} province={province} onPickProvince={pickProvince} language={language} />

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={`${nav.changeProvince}: ${provinceName(province, locale)}`}
            className="lg:hidden inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full text-xs font-bold font-mono text-emerald-300 bg-[#111827] border border-slate-700/80 active:bg-[#1f293d] focus-visible:outline-2 focus-visible:outline-emerald-400"
          >
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {province.code}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          </button>
        </div>
      </header>

      <MobileTabBar items={primary} active={active} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      <MenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        pathname={pathname}
        items={items}
        province={province}
        onPickProvince={pickProvince}
      />
    </>
  );
}
