import { calculateTax } from '@fiscal-insights/tax-engine';
import { federal2026, ontario2026 } from '@fiscal-insights/tax-data';
import type { Dictionary } from '@/lib/i18n';

/** The legacy site's audit case: an $80,000 Ontario employment salary in 2026. */
export const AUDIT_SALARY_CENTS = 8_000_000;

type PitchTable = Dictionary['pitch']['table'];
type LineKey = keyof PitchTable & ('fedLine' | 'provLine' | 'cppLine' | 'eiLine' | 'netLine');
type ImpactKey = keyof PitchTable & ('fedDiff' | 'provDiff' | 'cppDiff' | 'eiDiff' | 'netDiff');

export interface AuditLine {
  key: string;
  labelKey: LineKey;
  impactKey: ImpactKey;
  /** What the legacy site showed, recorded from it; not recomputed. */
  legacyCents: number;
  /** What the engine computes from the sourced 2026 rules. */
  engineCents: number;
  /** True when the legacy figure was wrong rather than a rounding-level difference. */
  legacyWrong: boolean;
  isTotal?: boolean;
}

/** Every line of the legacy comparison: legacy figures as recorded, engine figures computed now. */
export function auditLines(): AuditLine[] {
  const result = calculateTax(
    { year: 2026, province: 'ON', employmentIncomeCents: AUDIT_SALARY_CENTS },
    federal2026,
    ontario2026
  );
  return [
    { key: 'federal', labelKey: 'fedLine', impactKey: 'fedDiff', legacyCents: 1_032_300, engineCents: result.federal.netFederalTaxCents, legacyWrong: true },
    { key: 'provincial', labelKey: 'provLine', impactKey: 'provDiff', legacyCents: 398_500, engineCents: result.provincial.netProvincialTaxCents, legacyWrong: true },
    { key: 'cpp', labelKey: 'cppLine', impactKey: 'cppDiff', legacyCents: 438_210, engineCents: result.cpp.totalCents, legacyWrong: false },
    { key: 'ei', labelKey: 'eiLine', impactKey: 'eiDiff', legacyCents: 107_748, engineCents: result.ei.totalCents, legacyWrong: false },
    { key: 'net', labelKey: 'netLine', impactKey: 'netDiff', legacyCents: 6_023_242, engineCents: result.takeHomePayCents, legacyWrong: false, isTotal: true },
  ];
}
