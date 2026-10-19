# Phase 4: 2026 brackets and audit

Branch: `feat/mobile-ui-brackets-audit` (from `feat/mobile-ui-budget`)
Surfaces: `TaxInformationHub` on the home page (the nav "Brackets" target, `#brackets`), and the bracket and audit sections of the province page.

## 1. Refactor
- [ ] Add `features/brackets/bracket-rows.ts`: `toBracketRows(rules, locale)` returning `{ from, to, rate }` rows; replaces the three hand-written table loops.
- [ ] Add `features/brackets/audit-benchmark.ts`: the $80,000 Ontario legacy comparison (line, old, new, impact key) as data; replaces the two inline tables.
- [ ] Add `BracketTable` (desktop) and `AuditTable` (desktop) built from that data, with the current markup.
- [ ] Split `TaxInformationHub` into section components: `BracketsSection`, `RatesExplainer`, `PayrollCeilings`, `LegacyAudit`, `Faq`.
- [ ] Move citations into `lib/provinces.ts`; move hard-coded English ("Applies to all Canadian residents", "Schedule 1, Part B", "Above this threshold", OHP note) into the dictionary.

## 2. Phone components
| Area | Phone component |
| --- | --- |
| Brackets | `BracketLadder`: a Federal and Provincial `SegmentedControl` (provincial follows the selected province); each bracket is a row with the rate large on the left, the income range on the right, and a rate bar; the citation once under the list. |
| Rates explainer | Marginal versus average and RRSP and FHSA become two `Disclosure`s with the existing copy. |
| Payroll ceilings | One `MetricList` (YMPE, YAMPE, EI maximum) with the description in a `Disclosure`. |
| Legacy audit | `AuditComparisonPhone`: one card per line with old figure (struck, rose) and new figure (emerald) side by side and the impact text below; the net line highlighted; "Inspect full audit" as a full-width link. |
| FAQ | `Disclosure` per question; fixes the missing `aria-expanded` and `aria-controls` by using native `<details>`. |

## 3. Verification
- Gates, plus `e2e/mobile-brackets.spec.ts`: switch federal and provincial, change province from the menu and see the provincial ladder update, open an audit card and a FAQ item.
- Desktop test `the Ontario province page renders its bracket table` still passes.
- Probe at 390 px: zero tables needing side-scroll on `/en` and `/en/calculator/ontario`.
- Screenshots at 390, 820 and 1440 px.
