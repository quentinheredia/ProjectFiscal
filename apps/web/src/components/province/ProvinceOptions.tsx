'use client';

import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useDictionary } from '@/lib/dictionary-context';
import { fitsInline, groupByKind, provinceName, type ProvinceCode, type ProvinceConfig } from '@/lib/provinces';
import { BottomSheet } from '@/components/mobile/BottomSheet';
import { SegmentedControl } from '@/components/mobile/SegmentedControl';

interface ProvinceOptionListProps {
  locale: Locale;
  provinces: readonly ProvinceConfig[];
  currentCode: ProvinceCode;
  onPick: (province: ProvinceConfig) => void;
  /** Jurisdictions that cannot be picked right now, for example without rules for the chosen year. */
  isDisabled?: (province: ProvinceConfig) => boolean;
  disabledNote?: string;
}

interface GroupedJurisdictionsProps {
  provinces: readonly ProvinceConfig[];
  listClassName: string;
  renderItem: (province: ProvinceConfig) => React.ReactNode;
}

/** Lists jurisdictions under "Provinces" and "Territories" headings; with only one kind present, no heading. */
export function GroupedJurisdictions({ provinces, listClassName, renderItem }: GroupedJurisdictionsProps) {
  const groups = groupByKind(provinces);
  const headings = useDictionary().nav.jurisdictionGroups;
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.kind} className="space-y-1">
          {groups.length > 1 && <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{headings[group.kind]}</h3>}
          <ul className={listClassName}>
            {group.provinces.map((province) => (
              <li key={province.code}>{renderItem(province)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Every jurisdiction as a 48 px row, grouped into provinces and territories when both are present. */
export function ProvinceOptionList({ locale, provinces, currentCode, onPick, isDisabled, disabledNote }: ProvinceOptionListProps) {
  return (
    <GroupedJurisdictions
      provinces={provinces}
      listClassName="divide-y divide-white/[0.05]"
      renderItem={(province) => {
        const selected = province.code === currentCode;
        const disabled = isDisabled?.(province) ?? false;
        return (
          <button
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onPick(province)}
            className={`flex min-h-12 w-full items-center gap-3 px-1 text-left text-sm focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:opacity-40 ${
              selected ? 'font-semibold text-emerald-300' : 'text-slate-200 active:text-white'
            }`}
          >
            <span className="w-7 shrink-0 font-mono text-xs font-bold text-slate-400">{province.code}</span>
            <span className="grow">
              <span className="block">{provinceName(province, locale)}</span>
              {disabled && disabledNote && <span className="block text-xs font-normal text-slate-500">{disabledNote}</span>}
            </span>
            {selected && <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />}
          </button>
        );
      }}
    />
  );
}

interface ProvinceFieldProps {
  /** Names the control, for example "Province / Territory". */
  label: string;
  locale: Locale;
  provinces: readonly ProvinceConfig[];
  value: ProvinceCode;
  onChange: (code: ProvinceCode) => void;
  isDisabled?: (province: ProvinceConfig) => boolean;
  disabledNote?: string;
}

/**
 * A phone province picker that adapts to how many jurisdictions there are: a segmented control of codes
 * while they fit on one row, otherwise a full-width button that opens a bottom sheet with the full list.
 */
export function ProvinceField({ label, locale, provinces, value, onChange, isDisabled, disabledNote }: ProvinceFieldProps) {
  const nav = useDictionary().nav;
  const [open, setOpen] = useState(false);
  const current = provinces.find((p) => p.code === value);

  if (fitsInline(provinces)) {
    return (
      <SegmentedControl
        label={label}
        value={value}
        onChange={onChange}
        options={provinces.map((p) => ({
          value: p.code,
          label: p.code,
          accessibleLabel: provinceName(p, locale),
          disabled: isDisabled?.(p) ?? false,
        }))}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${label}: ${current ? provinceName(current, locale) : ''}`}
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-[#070b12] px-4 text-left text-sm text-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        <span className="font-mono text-xs font-bold text-emerald-400">{current?.code}</span>
        <span className="grow">{current ? provinceName(current, locale) : ''}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={label} closeLabel={nav.closeSheet}>
        <ProvinceOptionList
          locale={locale}
          provinces={provinces}
          currentCode={value}
          isDisabled={isDisabled}
          disabledNote={disabledNote}
          onPick={(province) => {
            onChange(province.code);
            setOpen(false);
          }}
        />
      </BottomSheet>
    </>
  );
}
