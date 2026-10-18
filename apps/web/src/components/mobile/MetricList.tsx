import React from 'react';
import { cn } from '@/lib/utils';

export interface Metric {
  key: string;
  label: string;
  value: string;
  caption?: string;
  /** Tailwind background class for a colour key dot, matching a chart segment. */
  dotClass?: string;
  emphasis?: boolean;
}

interface MetricListProps {
  metrics: readonly Metric[];
  className?: string;
}

/** Label and value on one line per metric, as a description list; replaces multi-column metric grids. */
export function MetricList({ metrics, className }: MetricListProps) {
  return (
    <dl className={cn('divide-y divide-white/[0.06]', className)}>
      {metrics.map((metric) => (
        <div key={metric.key} className="flex items-center justify-between gap-4 py-3">
          <dt className="flex min-w-0 items-center gap-2 text-sm text-slate-300">
            {metric.dotClass && <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', metric.dotClass)} aria-hidden="true" />}
            <span className="min-w-0">
              <span className={cn('block', metric.emphasis && 'font-semibold text-white')}>{metric.label}</span>
              {metric.caption && <span className="block text-xs text-slate-400">{metric.caption}</span>}
            </span>
          </dt>
          <dd className={cn('shrink-0 text-right text-base font-bold tabular-nums', metric.emphasis ? 'text-emerald-400' : 'text-white')}>
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
