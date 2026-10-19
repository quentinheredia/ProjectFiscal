'use client';

import React, { createContext, useContext } from 'react';
import type { Dictionary } from './i18n';

const DictionaryContext = createContext<Dictionary | null>(null);

/**
 * Hands the active locale's dictionary to client components. The layout passes it from the server,
 * so it travels once in the page payload instead of shipping both languages in every client bundle.
 */
export function DictionaryProvider({ dictionary, children }: { dictionary: Dictionary; children: React.ReactNode }) {
  return <DictionaryContext.Provider value={dictionary}>{children}</DictionaryContext.Provider>;
}

/** The active locale's strings. Client components use this; server components call getDictionary. */
export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) throw new Error('useDictionary must be used inside DictionaryProvider');
  return dictionary;
}
