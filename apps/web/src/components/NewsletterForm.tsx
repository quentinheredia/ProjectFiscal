'use client';

import React from 'react';
import { useDictionary } from '@/lib/dictionary-context';
import { Mail } from 'lucide-react';
import { ActionButton } from '@/components/ui/action';

// UI only for Phase 0: submitting does nothing until double opt-in is wired up.
export default function NewsletterForm() {
  const dict = useDictionary();

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-xl space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          aria-label={dict.newsletter.placeholder}
          placeholder={dict.newsletter.placeholder}
          className="grow min-h-12 px-4 py-3 rounded-xl bg-[#070b12] border border-slate-700 text-white text-base lg:text-sm placeholder-slate-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
          required
        />
        <ActionButton type="submit" size="lg" icon={Mail}>
          {dict.newsletter.button}
        </ActionButton>
      </div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1 text-xs text-slate-400">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-slate-700 bg-slate-800 accent-emerald-500" />
        <span>{dict.newsletter.consent}</span>
      </label>
    </form>
  );
}
