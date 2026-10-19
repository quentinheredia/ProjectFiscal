'use client';

import React, { useId, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface MoneyInputProps {
  label: string;
  name: string;
  valueDollars: number;
  onChange: (dollars: number) => void;
  locale: Locale;
  maxDollars: number;
  className?: string;
}

const MAX_DIGITS = 7;

function groupDigits(dollars: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', { maximumFractionDigits: 0 }).format(dollars);
}

/**
 * A whole-dollar amount field for phones: numeric keypad, digits only, grouped thousands when not
 * being edited, and a large type size so iOS does not zoom on focus.
 */
export function MoneyInput({ label, name, valueDollars, onChange, locale, maxDollars, className }: MoneyInputProps) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (valueDollars ? groupDigits(valueDollars, locale) : '');

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-300">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#070b12] px-4 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30">
        <span className="text-lg font-semibold text-slate-400" aria-hidden="true">
          $
        </span>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          value={shown}
          onFocus={() => setDraft(valueDollars ? String(valueDollars) : '')}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, MAX_DIGITS);
            setDraft(digits);
            onChange(Math.min(maxDollars, Number(digits || 0)));
          }}
          className="min-h-14 w-full bg-transparent text-2xl font-bold tabular-nums text-white outline-hidden placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}
