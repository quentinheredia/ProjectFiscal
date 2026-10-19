# Phase 3: Federal budget simulator

Branch: `feat/mobile-ui-budget` (from `feat/mobile-ui-tax`)
Route: `/[locale]/simulator`

## 1. Refactor
- [ ] Move `BUDGET_ENVELOPES` into `features/budget/envelopes.ts` with named constants (`TAX_FILERS`, `SLIDER_STEP_BILLIONS`).
- [ ] Add `features/budget/summarize.ts`: a pure `summarizeBudget(allocations)` returning totals, group shares (summing to 100), variance, direction (`deficit`, `surplus`, `balanced`) and per-taxpayer impact.
- [ ] Add `features/budget/useBudgetAllocations.ts`: allocations state, `setAllocation`, `nudge(id, steps)`, `reset`, and the summary.
- [ ] Replace the two copies of the envelope card with one `EnvelopeCard` that takes a `tone` (`statutory` or `discretionary`).
- [ ] Remove the nested `<main>` in `simulator/page.tsx`; use `resolveLocale` and `localizedAlternates`.
- [ ] Move remaining inline English (variance captions, group headings, "Personal Tax Calculator") into the dictionary.

## 2. Phone components
| Area | Phone component |
| --- | --- |
| Summary | `BudgetSummaryBar`: a 56 px sticky bar under the header with total spending and the variance chip (green surplus, red deficit). Tapping it opens a `BottomSheet` with the statutory and discretionary split, per-taxpayer impact, Reset and the calculator link. Replaces the pinned card that covers 45% of the screen. |
| Groups | A `SegmentedControl` switches between Statutory and Discretionary, each with its live share; the choice is kept in the URL hash so it survives reload and sharing. |
| Envelopes | `EnvelopeRowPhone`: name, current value and delta chip on one row. Tapping expands it (one open at a time) to show the description, min, baseline and max, a full-width slider, and minus and plus buttons that move by 0.5 B for precise thumb control. |
| Impact | `TaxpayerImpactPhone`: the per-taxpayer card, shown after the list and inside the summary sheet. |
| Notice | The statutory disclaimer as one line under the list. |

## 3. Verification
- Gates, plus `e2e/mobile-simulator.spec.ts`: nudge an envelope up, check the bar shows a deficit and the sheet shows the per-taxpayer impact; reset returns to balanced; switching groups changes the list and the hash.
- Probe at 390 px: one `<main>`, sticky bar height 64 px or less, no tap target under 44 px.
- Screenshots at 390, 820 and 1440 px.
