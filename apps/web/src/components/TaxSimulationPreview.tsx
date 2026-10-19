'use client';

import React from 'react';
import { Locale } from '@/lib/i18n';
import { useQuickEstimate } from '@/features/tax/useQuickEstimate';
import { DesktopOnly, PhoneOnly } from '@/components/responsive/Responsive';
import QuickEstimatePhone from '@/components/home/QuickEstimatePhone';
import QuickEstimateDesktop from '@/components/home/QuickEstimateDesktop';

interface TaxSimulationPreviewProps {
  locale: Locale;
}

/** The home page's live estimate. One state, two presentations. */
export default function TaxSimulationPreview({ locale }: TaxSimulationPreviewProps) {
  const model = useQuickEstimate();

  return (
    <section id="simulator" className="w-full max-w-7xl mx-auto">
      <PhoneOnly className="mx-auto max-w-2xl">
        <QuickEstimatePhone locale={locale} model={model} />
      </PhoneOnly>
      <DesktopOnly>
        <QuickEstimateDesktop locale={locale} model={model} />
      </DesktopOnly>
    </section>
  );
}
