'use client';

import React from 'react';
import { StripeBgGuides } from '@/components/ui/stripe-bg-guides';

export default function BackgroundGuides() {
  return (
    <StripeBgGuides
      columnCount={5}
      glowColor="rgba(27, 122, 67, 0.25)"
      glowOpacity={0.3}
      animationDuration={50}
      responsive={true}
    />
  );
}
