'use client';

import React from 'react';
import { Locale, getDictionary } from '@/lib/i18n';
import NeumorphButton from '@/components/ui/neumorph-button';

// UI only for Phase 0: submitting does nothing until double opt-in is wired up.
export default function NewsletterForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-xl space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          aria-label={dict.newsletter.placeholder}
          placeholder={dict.newsletter.placeholder}
          className="grow px-4 py-3 rounded-xl bg-[#070b12] border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <NeumorphButton
          type="submit"
          intent="primary"
          size="medium"
          className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          {dict.newsletter.button}
        </NeumorphButton>
      </div>
      <div className="flex items-start gap-2 text-xs text-slate-400">
        <input type="checkbox" id="consent-check" className="mt-0.5 rounded border-slate-700 bg-slate-800 text-emerald-500" />
        <label htmlFor="consent-check" className="cursor-pointer">
          {dict.newsletter.consent}
        </label>
      </div>
    </form>
  );
}
