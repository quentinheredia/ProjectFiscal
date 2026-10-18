'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Height of the phone site header, which the bar sits under. */
const HEADER_OFFSET_PX = 56;

interface StickySummaryBarProps {
  /** The element whose figure this bar repeats; the bar shows once it has scrolled up out of view. */
  target: React.RefObject<HTMLElement | null>;
  /** Spoken name of the bar's button, for example "Back to your result". */
  label: string;
  onActivate: () => void;
  children: React.ReactNode;
  className?: string;
}

function useScrolledPast(target: React.RefObject<HTMLElement | null>): boolean {
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!!entry && !entry.isIntersecting && entry.boundingClientRect.top < HEADER_OFFSET_PX),
      { rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px` }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return scrolledPast;
}

/**
 * A slim bar pinned under the header that repeats a key figure once its source scrolls away, so
 * edits further down the page still show their effect. It appears without animation.
 */
export function StickySummaryBar({ target, label, onActivate, children, className }: StickySummaryBarProps) {
  const visible = useScrolledPast(target);
  if (!visible) return null;

  return (
    <div className={cn('fixed inset-x-0 top-14 z-40 border-b border-white/[0.08] bg-[#0b1019]/95 backdrop-blur-xl lg:hidden', className)}>
      <button
        type="button"
        onClick={onActivate}
        aria-label={label}
        className="mx-auto flex min-h-12 w-full max-w-2xl items-center justify-between gap-4 px-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-400"
      >
        {children}
      </button>
    </div>
  );
}
