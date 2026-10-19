# Phase 4: 2026 brackets and audit

Branch: `feat/mobile-ui-brackets-audit` (from `feat/mobile-ui-budget`)
Surfaces: `TaxInformationHub` on the home page (the nav "Brackets" target, `#brackets`), and the bracket and audit sections of the province and $80,000 salary pages.

## 1. Refactor
- [x] Add `features/brackets/bracket-rows.ts`: `toBracketRows(brackets)` returning `{ fromCents, toCents, rate }` rows, and `topRate`; replaces the three hand-written table loops.
- [x] Add `features/brackets/audit-benchmark.ts`: the $80,000 Ontario legacy comparison as data. Legacy figures stay as recorded; engine figures are computed from the 2026 rules at render time. Replaces three inline tables (hub, province page, `CalculatorExtras`).
- [x] Add `features/brackets/payroll-ceilings.ts`: YMPE, YAMPE, EI maximum, rates and maximum contributions computed from the federal rule set.
- [x] Add `BracketTable` (desktop) and the `LegacyAudit` section (desktop table, phone rows) built from that data.
- [x] Split `TaxInformationHub` into `BracketsSection`, `RatesExplainer`, `PayrollCeilingsSection`, `LegacyAudit` and `FaqSection`. Sections take dictionary slices as props so server pages render them too.
- [x] Citations come from `lib/provinces.ts`; hard-coded English ("Applies to all Canadian residents", "Schedule 1, Part B", "Above this threshold", badges, the FAQ lead, the OHP note, the province bracket heading) moves to the dictionary.

## 2. Phone components
| Area | Phone component | Done |
| --- | --- | --- |
| Brackets | `BracketLadder`: a Federal and province `SegmentedControl` (the province follows the one picked anywhere on the site); each bracket shows the rate large, the income range beside it, and a bar scaled to the top rate; the citation appears once under the list. The province page shows its own ladder. | [x] |
| Rates explainer | Marginal versus average, and RRSP and FHSA, become two `Disclosure`s with the existing copy. | [x] |
| Payroll ceilings | One `MetricList` (YMPE, YAMPE, EI maximum) with the descriptions in a `Disclosure`. | [x] |
| Legacy audit | One row per line: label on the left; legacy figure (struck through when wrong) above the engine figure on the right; impact underneath; net line highlighted. "Inspect full audit" is a full-width link. | [x] |
| FAQ | `Disclosure` per question; native `<details>` fixes the missing `aria-expanded` and `aria-controls`. | [x] |

## 3. Verification
- [x] Gates, plus `e2e/mobile-brackets.spec.ts`: zero tables on `/en` and `/en/calculator/ontario` at phone and tablet widths; the federal and Ontario switch shows each citation; ceilings read $74,600, $85,000 and $68,900; the audit shows legacy and engine figures; a FAQ item opens and closes.
- [x] The province smoke test checks the table on desktop and the ladder on phones and tablets.
- [x] Probe at 390 px: home 12.2 to 10.1 screens, province page 7.4 screens. A follow-up after phase 5 brought the home page to 8.85 screens (see `phase0-overview.md`, Outcome).
- [x] Screenshots at 390, 820 and 1440 px. 1440 px matches `main` apart from the fixes below.
- [x] First-load JS unchanged from phase 3: home 145 kB, calculator 133 kB.

## Fixes made along the way
- The payroll section labelled 2025 values as 2026: YMPE $73,200, YAMPE $81,200, EI $65,700 at 1.64%. The audit's EI impact read "$65,700 × 1.71%". The rule set's sourced 2026 values are $74,600, $85,000 and $68,900 at 1.63%. The copy is now a set of templates filled from the rule set, so it cannot drift again. The home estimate's CPP2 trace line uses the same values.
- Bracket ranges read "$0.00 to $58,523.00" and "Over $258,482.00" instead of using an en dash.

## Known, not changed
- `infoHub.deductions.rrspDesc` still quotes a $32,490 RRSP limit, and `simulation.traceHighlights.line42000Desc` a $16,129 basic personal amount. Neither figure is in the rule set, so they cannot be computed yet; they need a sourced value first (AGENTS.md: never invent a tax figure).
