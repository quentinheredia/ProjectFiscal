'use client';

import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { BRACKETS_ANCHOR, type NavId } from './nav-items';

function isHome(pathname: string, locale: Locale): boolean {
  return pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;
}

/** True while the brackets section is on screen. Only observes on the home page. */
function useBracketsInView(active: boolean): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!active) {
      setInView(false);
      return;
    }
    const target = document.getElementById(BRACKETS_ANCHOR);
    if (!target) return;
    // The section counts as current once it fills the middle band of the screen.
    const observer = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), {
      rootMargin: '-40% 0px -40% 0px',
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [active]);

  return inView;
}

/** Which primary tab is current: from the route, or Brackets while that home section is on screen. */
export function useActiveSection(pathname: string, locale: Locale): NavId | null {
  const onHome = isHome(pathname, locale);
  const bracketsInView = useBracketsInView(onHome);

  if (pathname.includes('/simulator')) return 'simulator';
  if (pathname.includes('/calculator') || pathname.includes('/salary')) return 'calculator';
  if (onHome && bracketsInView) return 'brackets';
  return null;
}
