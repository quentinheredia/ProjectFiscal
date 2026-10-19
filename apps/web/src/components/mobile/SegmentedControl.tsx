'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Spoken name when the visible label is an abbreviation, such as "ON" for Ontario. */
  accessibleLabel?: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  /** Names the group for assistive technology. */
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * A row of mutually exclusive choices with 44 px targets. Built on native radio inputs, so arrow keys,
 * focus and screen reader announcements work without custom handlers.
 */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className }: SegmentedControlProps<T>) {
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex w-full gap-1 rounded-xl border border-white/[0.08] bg-[#070b12] p-1', className)}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              'relative flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg px-1.5 text-center text-[13px] font-semibold leading-tight transition-colors',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-400/70',
              checked ? 'bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]' : 'text-slate-400 active:text-slate-200',
              option.disabled && 'cursor-not-allowed opacity-40'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              disabled={option.disabled}
              aria-label={option.accessibleLabel}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
