import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * An expandable row built on <details>, so keyboard, screen reader state and find-in-page work natively.
 */
export function Disclosure({ summary, children, defaultOpen = false, className }: DisclosureProps) {
  return (
    <details className={cn('group', className)} open={defaultOpen}>
      <summary
        className={cn(
          'flex min-h-12 cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 rounded-lg'
        )}
      >
        <span className="block min-w-0 flex-1">{summary}</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
