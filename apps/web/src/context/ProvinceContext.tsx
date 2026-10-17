'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ProvinceSlug = 'ontario' | 'quebec' | 'british-columbia' | 'alberta';

export interface ProvinceConfig {
  slug: ProvinceSlug;
  code: 'ON' | 'QC' | 'BC' | 'AB';
  nameEn: string;
  nameFr: string;
  form: string;
}

export const DEFAULT_PROVINCE: ProvinceConfig = {
  slug: 'ontario',
  code: 'ON',
  nameEn: 'Ontario',
  nameFr: 'Ontario',
  form: 'ON428',
};

export const PROVINCES_LIST: ProvinceConfig[] = [
  DEFAULT_PROVINCE,
  { slug: 'quebec', code: 'QC', nameEn: 'Québec', nameFr: 'Québec', form: 'TP-1' },
  { slug: 'british-columbia', code: 'BC', nameEn: 'British Columbia', nameFr: 'Colombie-Britannique', form: 'BC428' },
  { slug: 'alberta', code: 'AB', nameEn: 'Alberta', nameFr: 'Alberta', form: 'AB428' },
];

interface ProvinceContextType {
  selectedProvince: ProvinceConfig;
  setSelectedProvinceSlug: (slug: ProvinceSlug) => void;
}

const ProvinceContext = createContext<ProvinceContextType | null>(null);

const STORAGE_KEY = 'fiscal_insights_selected_province';

export function ProvinceProvider({
  children,
  initialSlug = 'ontario',
}: {
  children: React.ReactNode;
  initialSlug?: ProvinceSlug;
}) {
  const [selectedSlug, setSelectedSlug] = useState<ProvinceSlug>(initialSlug);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ProvinceSlug | null;
      if (stored && PROVINCES_LIST.some((p) => p.slug === stored)) {
        setSelectedSlug(stored);
      }
    } catch {
      // Ignore localStorage exceptions (private mode, SSR)
    }
  }, []);

  const setSelectedProvinceSlug = (slug: ProvinceSlug) => {
    setSelectedSlug(slug);
    try {
      localStorage.setItem(STORAGE_KEY, slug);
      document.cookie = `fiscal_province=${slug}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
  };

  const selectedProvince: ProvinceConfig =
    PROVINCES_LIST.find((p) => p.slug === selectedSlug) ?? DEFAULT_PROVINCE;

  return (
    <ProvinceContext.Provider value={{ selectedProvince, setSelectedProvinceSlug }}>
      {children}
    </ProvinceContext.Provider>
  );
}

export function useProvince() {
  const context = useContext(ProvinceContext);
  if (!context) {
    // Return safe default if rendered outside provider
    return {
      selectedProvince: DEFAULT_PROVINCE,
      setSelectedProvinceSlug: () => {},
    };
  }
  return context;
}
