import React from 'react';
import { cn } from '@/lib/utils';

interface ChipRailProps {
  /** Names the set of chips for assistive technology. */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A single row of chips that scrolls sideways instead of wrapping. It bleeds to the screen edge
 * (the page gutter is 16 px) and fades at both ends so a cut-off chip reads as "more to the side".
 */
export function ChipRail({ label, children, className }: ChipRailProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        '-mx-4 flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  selected?: boolean;
}

export function Chip({ selected = false, className, children, ...buttonProps }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13px] font-medium tabular-nums transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
        selected
          ? 'border-emerald-500/40 bg-emerald-500/15 font-semibold text-emerald-300'
          : 'border-white/[0.08] bg-white/[0.02] text-slate-300 active:bg-white/[0.06]',
        className
      )}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
