// The provinces the calculator supports. Every page, picker and citation reads from this list.
import type { Locale } from './i18n';

export type ProvinceCode = 'ON' | 'QC' | 'BC' | 'AB';
export type ProvinceSlug = 'ontario' | 'quebec' | 'british-columbia' | 'alberta';

export interface ProvinceConfig {
  slug: ProvinceSlug;
  code: ProvinceCode;
  nameEn: string;
  nameFr: string;
  /** French name with its article, for phrases such as "l’impôt de l’Ontario". */
  nameFrWithArticle: string;
  /** Provincial tax form, for example ON428. */
  form: string;
  /** Where the provincial brackets are published on that form. */
  citationEn: string;
  citationFr: string;
}

export const PROVINCES: readonly ProvinceConfig[] = [
  {
    slug: 'ontario',
    code: 'ON',
    nameEn: 'Ontario',
    nameFr: 'Ontario',
    nameFrWithArticle: 'l’Ontario',
    form: 'ON428',
    citationEn: 'Form ON428, Part A',
    citationFr: 'Formulaire ON428, partie A',
  },
  {
    slug: 'quebec',
    code: 'QC',
    nameEn: 'Québec',
    nameFr: 'Québec',
    nameFrWithArticle: 'le Québec',
    form: 'TP-1',
    citationEn: 'Revenu Québec TP-1, Line 401',
    citationFr: 'Revenu Québec TP-1, ligne 401',
  },
  {
    slug: 'british-columbia',
    code: 'BC',
    nameEn: 'British Columbia',
    nameFr: 'Colombie-Britannique',
    nameFrWithArticle: 'la Colombie-Britannique',
    form: 'BC428',
    citationEn: 'Form BC428, Part A',
    citationFr: 'Formulaire BC428, partie A',
  },
  {
    slug: 'alberta',
    code: 'AB',
    nameEn: 'Alberta',
    nameFr: 'Alberta',
    nameFrWithArticle: 'l’Alberta',
    form: 'AB428',
    citationEn: 'Form AB428, Part A',
    citationFr: 'Formulaire AB428, partie A',
  },
];

export const DEFAULT_PROVINCE: ProvinceConfig = PROVINCES[0]!;

export function findProvinceBySlug(slug: string): ProvinceConfig | undefined {
  return PROVINCES.find((p) => p.slug === slug);
}

export function provinceByCode(code: ProvinceCode): ProvinceConfig {
  return PROVINCES.find((p) => p.code === code) ?? DEFAULT_PROVINCE;
}

export function provinceName(province: ProvinceConfig, locale: Locale): string {
  return locale === 'fr' ? province.nameFr : province.nameEn;
}
