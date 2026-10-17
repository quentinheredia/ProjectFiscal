'use client';

import React from 'react';
import { Locale, getDictionary } from '@/lib/i18n';

// UI only for Phase 0: submitting does nothing until double opt-in is wired up.
export default function NewsletterForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-xl space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          aria-label={dict.newsletter.placeholder}
          placeholder={dict.newsletter.placeholder}
          className="grow px-4 py-3 rounded-lg bg-slate-800/90 border border-slate-700 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-green-accent"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-brand-green hover:bg-brand-green-dark text-white font-semibold text-sm transition-colors motion-reduce:transition-none shrink-0"
        >
          {dict.newsletter.button}
        </button>
      </div>
      <div className="flex items-start gap-2 text-xs text-slate-300">
        <input type="checkbox" id="consent-check" className="mt-0.5 rounded border-slate-700 bg-slate-800 text-brand-green-accent" />
        <label htmlFor="consent-check" className="cursor-pointer">
          {dict.newsletter.consent}
        </label>
      </div>
    </form>
  );
}
