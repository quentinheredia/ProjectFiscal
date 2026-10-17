export * from './schema';
export { SOURCES } from './rules/sources';
export { federal2026 } from './rules/2026/federal';
export { ontario2026 } from './rules/2026/ontario';
export { quebec2026 } from './rules/2026/quebec';
export { britishColumbia2026 } from './rules/2026/british-columbia';
export { alberta2026 } from './rules/2026/alberta';
export { federal2025 } from './rules/2025/federal';
export { ontario2025 } from './rules/2025/ontario';

import { FederalRuleSet, ProvincialRuleSet } from './schema';
import { federal2026 } from './rules/2026/federal';
import { ontario2026 } from './rules/2026/ontario';
import { quebec2026 } from './rules/2026/quebec';
import { britishColumbia2026 } from './rules/2026/british-columbia';
import { alberta2026 } from './rules/2026/alberta';
import { federal2025 } from './rules/2025/federal';
import { ontario2025 } from './rules/2025/ontario';

export const FEDERAL_RULE_SETS: readonly FederalRuleSet[] = [federal2026, federal2025];
export const PROVINCIAL_RULE_SETS: readonly ProvincialRuleSet[] = [
  ontario2026,
  quebec2026,
  britishColumbia2026,
  alberta2026,
  ontario2025,
];

export function getFederalRules(year: number): FederalRuleSet {
  const rules = FEDERAL_RULE_SETS.find((set) => set.year === year);
  if (!rules) throw new Error(`Federal rules for year ${year} not loaded`);
  return rules;
}

export function getProvincialRules(jurisdiction: string, year: number): ProvincialRuleSet {
  const rules = PROVINCIAL_RULE_SETS.find((set) => set.jurisdiction === jurisdiction && set.year === year);
  if (!rules) throw new Error(`Rules for ${jurisdiction} in ${year} not loaded`);
  return rules;
}
