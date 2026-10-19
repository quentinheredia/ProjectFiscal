'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PROVINCE, PROVINCES, findProvinceBySlug, type ProvinceConfig, type ProvinceSlug } from '@/lib/provinces';

export { DEFAULT_PROVINCE, PROVINCES as PROVINCES_LIST };
export type { ProvinceConfig, ProvinceSlug };

interface ProvinceContextType {
  selectedProvince: ProvinceConfig;
  setSelectedProvinceSlug: (slug: ProvinceSlug) => void;
}

const ProvinceContext = createContext<ProvinceContextType | null>(null);

const STORAGE_KEY = 'fiscal_insights_selected_province';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function ProvinceProvider({
  children,
  initialSlug = DEFAULT_PROVINCE.slug,
}: {
  children: React.ReactNode;
  initialSlug?: ProvinceSlug;
}) {
  const [selectedSlug, setSelectedSlug] = useState<ProvinceSlug>(initialSlug);

  useEffect(() => {
    try {
      const stored = findProvinceBySlug(localStorage.getItem(STORAGE_KEY) ?? '');
      if (stored) setSelectedSlug(stored.slug);
    } catch {
      // Storage can be unavailable (private mode); the default province stands.
    }
  }, []);

  const setSelectedProvinceSlug = (slug: ProvinceSlug) => {
    setSelectedSlug(slug);
    try {
      localStorage.setItem(STORAGE_KEY, slug);
      document.cookie = `fiscal_province=${slug}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    } catch {
      // Storage can be unavailable; the choice still applies for this visit.
    }
  };

  const selectedProvince = findProvinceBySlug(selectedSlug) ?? DEFAULT_PROVINCE;

  return (
    <ProvinceContext.Provider value={{ selectedProvince, setSelectedProvinceSlug }}>
      {children}
    </ProvinceContext.Provider>
  );
}

const FALLBACK_CONTEXT: ProvinceContextType = {
  selectedProvince: DEFAULT_PROVINCE,
  setSelectedProvinceSlug: () => {},
};

export function useProvince(): ProvinceContextType {
  return useContext(ProvinceContext) ?? FALLBACK_CONTEXT;
}
