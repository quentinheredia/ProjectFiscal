export * from './schema';
export { federal2026 } from './rules/2026/federal';
export { ontario2026, quebec2026, britishColumbia2026, alberta2026 } from './rules/2026/provinces';
export { federal2025 } from './rules/2025/federal';
export { ontario2025 } from './rules/2025/ontario';

import { FederalRuleSet, ProvincialRuleSet } from './schema';
import { federal2026 } from './rules/2026/federal';
import { ontario2026, quebec2026, britishColumbia2026, alberta2026 } from './rules/2026/provinces';
import { federal2025 } from './rules/2025/federal';
import { ontario2025 } from './rules/2025/ontario';

export function getFederalRules(year: number): FederalRuleSet {
  if (year === 2026) return federal2026;
  if (year === 2025) return federal2025;
  throw new Error(`Federal rules for year ${year} not loaded`);
}

export function getProvincialRules(jurisdiction: string, year: number): ProvincialRuleSet {
  if (year === 2026) {
    switch (jurisdiction) {
      case 'ON': return ontario2026;
      case 'QC': return quebec2026;
      case 'BC': return britishColumbia2026;
      case 'AB': return alberta2026;
      default:
        throw new Error(`Rules for ${jurisdiction} in ${year} not loaded`);
    }
  }
  if (year === 2025) {
    if (jurisdiction === 'ON') return ontario2025;
    throw new Error(`Rules for ${jurisdiction} in ${year} not loaded`);
  }
  throw new Error(`Rules for year ${year} not loaded`);
}
