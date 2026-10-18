import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  lead?: string;
  id?: string;
  level?: 'h2' | 'h3';
  className?: string;
}

/** A phone section title with an optional one-line lead. */
export function SectionHeading({ title, lead, id, level = 'h2', className }: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className={cn('space-y-1.5', className)}>
      <Heading id={id} className="scroll-mt-20 text-balance text-2xl font-extrabold tracking-tight text-white md:text-3xl">
        {title}
      </Heading>
      {lead && <p className="text-pretty text-sm leading-relaxed text-slate-400 md:text-base">{lead}</p>}
    </div>
  );
}
