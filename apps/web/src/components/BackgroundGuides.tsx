'use client';

import React from 'react';
import { StripeBgGuides } from '@/components/ui/stripe-bg-guides';

export default function BackgroundGuides() {
  return (
    <StripeBgGuides
      columnCount={5}
      darkMode={true}
      glowColor="rgba(16, 185, 129, 0.4)"
      glowOpacity={0.4}
      animationDuration={45}
      responsive={true}
    />
  );
}
