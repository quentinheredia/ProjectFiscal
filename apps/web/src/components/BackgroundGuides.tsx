'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Decorative only: the guides (and the animation library they use) load in their own chunk
// once the browser is idle, so they stay out of first-load JS. They render nothing on the
// server anyway.
const StripeBgGuides = dynamic(
  () => import('@/components/ui/stripe-bg-guides').then((m) => m.StripeBgGuides),
  { ssr: false }
);

export default function BackgroundGuides() {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <StripeBgGuides
      columnCount={5}
      darkMode={true}
      glowColor="rgba(16, 185, 129, 0.2)"
      glowOpacity={0.2}
      animationDuration={45}
      responsive={true}
      animated={!reducedMotion}
    />
  );
}
