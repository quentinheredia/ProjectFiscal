import React from 'react';
import { cn } from '@/lib/utils';

export interface BarSegment {
  key: string;
  /** Share of the whole, 0 to 1. */
  ratio: number;
  colorClass: string;
}

interface StackedBarProps {
  segments: readonly BarSegment[];
  className?: string;
}

/**
 * A proportional bar. It is decorative: the same figures must be readable next to it as text,
 * for example in a MetricList with matching key dots.
 */
export function StackedBar({ segments, className }: StackedBarProps) {
  return (
    <div className={cn('flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-[#070b12]', className)} aria-hidden="true">
      {segments.map((segment) => (
        <div
          key={segment.key}
          className={cn('h-full transition-[width] duration-300 motion-reduce:transition-none first:rounded-l-full last:rounded-r-full', segment.colorClass)}
          style={{ width: `${Math.max(0, segment.ratio) * 100}%` }}
        />
      ))}
    </div>
  );
}
