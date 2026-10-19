# Phase 3: Federal budget simulator

Branch: `feat/mobile-ui-budget` (from `feat/mobile-ui-tax`)
Route: `/[locale]/simulator`

## 1. Refactor
- [x] Move the envelopes into `features/budget/envelopes.ts` with named constants (`TAX_FILERS`, `ENVELOPE_STEP_BILLION`) and helpers (`envelopesIn`, `baselineAllocations`).
- [x] Add `features/budget/summarize.ts`: a pure `summarizeBudget(allocations)` returning totals, group shares (summing to 100), variance, direction (`deficit`, `surplus`, `balanced`) and per-taxpayer impact; plus `formatBillions` and `formatBillionDelta`.
- [x] Add `features/budget/useBudgetAllocations.ts`: allocations state with clamped `setAllocation`, `nudge(envelope, steps)`, `reset`, and the summary.
- [x] Replace the two copies of the envelope card with one `EnvelopeCard` that takes its tone from the envelope's group (`BudgetSimulatorDesktop`).
- [x] Remove the nested `<main>` and the doubled phone gutter in `simulator/page.tsx`.
- [x] Move remaining inline English (variance captions, group headings, range labels, "Personal Tax Calculator") into the dictionary.

## 2. Phone components
| Area | Phone component | Done |
| --- | --- | --- |
| Summary | A 56 px sticky bar under the header with total spending and a variance chip (green surplus, red deficit). Tapping it opens a `BottomSheet` with total and variance tiles, the statutory and discretionary split, per-taxpayer impact, Reset and the calculator link. Replaces the pinned card that covered 45% of the screen. | [x] |
| Groups | A `SegmentedControl` switches between Statutory and Discretionary, each with its live share; the choice is kept in the URL hash so it survives reload and sharing. | [x] |
| Envelopes | `EnvelopeRow`: name, current value and delta on one row. Tapping expands it (one open at a time, `aria-expanded`) to show the description, a full-width slider, and minus and plus buttons that move by 0.5 B; min, baseline and max under it. | [x] |
| Impact | `TaxpayerImpact`, shown after the list and inside the summary sheet. | [x] |
| Notice | The statutory disclaimer as one line under the list. | [x] |

## 3. Verification
- [x] Gates, plus `e2e/mobile-simulator.spec.ts`: one `<main>`, no overflow, 44 px targets; the summary bar is 64 px or less; two nudges show a $1.0B deficit and a +$49 per-taxpayer cost in the sheet, and Reset returns to baseline; switching groups changes the list and the hash, and survives reload.
- [x] Probe at 390 px: 4.6 to 1.3 screens.
- [x] Screenshots at 390, 820 and 1440 px. 1440 px matches `main` apart from shared fixes: one billions format ("$102.5B"), "Baseline:" on every card, and the balanced variance reads "$0.0B" instead of "-$0.0 B".
- [x] First-load JS: simulator 126 kB on `main`, 115 kB here.

## Notes
- Under heavy machine load the full parallel e2e run times out on unrelated phone tests; each spec passes when the run uses fewer workers. CI runs with its own worker count.
