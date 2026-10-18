import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Phone and tablet (below 1024 px) and desktop variants switch with CSS, so the server renders both
 * and hydration never depends on the device. The hidden variant is display: none, which also removes
 * it from the accessibility tree.
 */
export function PhoneOnly({ children, className }: ResponsiveProps) {
  return <div className={cn('lg:hidden', className)}>{children}</div>;
}

export function DesktopOnly({ children, className }: ResponsiveProps) {
  return <div className={cn('hidden lg:block', className)}>{children}</div>;
}
