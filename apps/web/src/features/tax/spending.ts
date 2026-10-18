import { FEDERAL_SPENDING_CATEGORIES, type SpendingCategory } from '@/lib/spending';

export interface SpendingAllocation {
  category: SpendingCategory;
  /** The visitor's federal tax attributed to this category. */
  allocatedCents: number;
}

/** The largest category is about a quarter of spending, so bars scale by 4 to use the full track. */
const BAR_SCALE = 4;

/** Splits federal tax across spending categories in their published order. */
export function allocateFederalTax(federalTaxCents: number): SpendingAllocation[] {
  return FEDERAL_SPENDING_CATEGORIES.map((category) => ({
    category,
    allocatedCents: Math.round((federalTaxCents * category.percentage) / 100),
  }));
}

/** The same allocation, largest share first, for summaries that show only the top few. */
export function allocateFederalTaxByShare(federalTaxCents: number): SpendingAllocation[] {
  return allocateFederalTax(federalTaxCents).sort((a, b) => b.category.percentage - a.category.percentage);
}

/** Width of a category's bar as a percentage of its track. */
export function spendingBarWidth(category: SpendingCategory): number {
  return Math.min(100, category.percentage * BAR_SCALE);
}
