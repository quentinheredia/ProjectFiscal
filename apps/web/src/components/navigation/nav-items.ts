import { Calculator, FileCheck2, Home, Play, Table2, type LucideIcon } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import type { ProvinceSlug } from '@/lib/provinces';
import { AUDIT_BENCHMARK_DOLLARS, salaryPageHref } from '@/features/tax/salary-benchmarks';

export type NavId = 'home' | 'calculator' | 'simulator' | 'brackets' | 'audit';

export interface NavItem {
  id: NavId;
  href: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
}

/** The one icon for the budget simulator, on the nav and on every button that leads to it. */
export const SimulatorIcon = Play;

/** Hash of the home page section the Brackets tab points at. */
export const BRACKETS_ANCHOR = 'brackets';

/** Every destination, in menu order. The dock and tab bar show the three primary ones. */
export function navItems(locale: Locale, provinceSlug: ProvinceSlug, nav: Dictionary['nav']): NavItem[] {
  return [
    { id: 'home', href: `/${locale}`, label: nav.home, shortLabel: nav.home, Icon: Home },
    { id: 'calculator', href: `/${locale}/calculator/${provinceSlug}`, label: nav.taxCalculator, shortLabel: nav.calculator, Icon: Calculator },
    { id: 'simulator', href: `/${locale}/simulator`, label: nav.budgetSimulator, shortLabel: nav.simulatorShort, Icon: SimulatorIcon },
    { id: 'brackets', href: `/${locale}#${BRACKETS_ANCHOR}`, label: nav.bracketsAudit, shortLabel: nav.bracketsShort, Icon: Table2 },
    { id: 'audit', href: salaryPageHref(locale, AUDIT_BENCHMARK_DOLLARS), label: nav.auditBenchmark, shortLabel: nav.auditBenchmark, Icon: FileCheck2 },
  ];
}

const PRIMARY: readonly NavId[] = ['calculator', 'simulator', 'brackets'];

export function primaryNavItems(items: readonly NavItem[]): NavItem[] {
  return items.filter((item) => PRIMARY.includes(item.id));
}
