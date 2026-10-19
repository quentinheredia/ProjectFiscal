'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Globe } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { provinceName, type ProvinceConfig, type ProvinceSlug } from '@/lib/provinces';
import type { NavId, NavItem } from './nav-items';
import type { LocaleSwitch } from './locale-switch';
import { ProvinceList } from './ProvincePicker';

/** The floating pill of primary destinations, from 1024 px up. */
export function DesktopDock({ items, active }: { items: NavItem[]; active: NavId | null }) {
  const nav = useDictionary().nav;
  return (
    <nav
      className="hidden lg:flex items-center p-1.5 rounded-full bg-[#0c121e]/90 border border-slate-700/60 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-xl ring-1 ring-white/5"
      aria-label={nav.mainNavLabel}
    >
      {items.map(({ id, href, label, Icon }) => {
        const isActive = active === id;
        return (
          <Link
            key={id}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={`relative px-4 py-2 text-xs font-semibold rounded-full flex items-center gap-2 transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'text-white bg-emerald-500/10 border border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.12),inset_0_1px_1px_rgba(255,255,255,0.08)]'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent bg-transparent'
            }`}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
              <span className={isActive ? 'font-bold' : 'font-medium'}>{label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Closes when a pointer goes down outside the referenced element. */
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    const handle = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onOutside]);
}

interface DesktopControlsProps {
  locale: Locale;
  province: ProvinceConfig;
  onPickProvince: (slug: ProvinceSlug) => void;
  language: LocaleSwitch;
}

/** Language toggle and province dropdown, from 1024 px up. */
export function DesktopControls({ locale, province, onPickProvince, language }: DesktopControlsProps) {
  const nav = useDictionary().nav;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(dropdownRef, close);

  return (
    <div className="hidden lg:flex items-center gap-2.5">
      <Link
        href={language.targetPath}
        hrefLang={language.targetLocale}
        className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-300 bg-[#161b26] hover:bg-[#1e2536] border border-slate-700/60 hover:text-white transition-colors cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform motion-reduce:transition-none" aria-hidden="true" />
        <span lang={language.targetLocale}>{nav.languageSwitch}</span>
      </Link>

      <div className="relative flex items-center" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          className="inline-flex items-center justify-between w-[190px] px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-200 bg-[#111827] hover:bg-[#1f293d] border border-slate-700/80 hover:border-slate-600 transition-colors cursor-pointer shrink-0"
          aria-label={nav.selectJurisdiction}
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5 min-w-0 text-left overflow-hidden">
            <span className="text-emerald-400 font-bold font-mono shrink-0">📍 {province.code}</span>
            <span className="text-slate-300 truncate text-left">{provinceName(province, locale)}</span>
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0e1420] border border-slate-800 shadow-[0_12px_32px_rgba(0,0,0,0.75)] py-1.5 z-50 max-h-[min(28rem,70vh)] overflow-y-auto overscroll-contain">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
              {nav.selectJurisdiction}
            </div>
            <ProvinceList
              locale={locale}
              current={province}
              onPick={(slug) => {
                onPickProvince(slug);
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
