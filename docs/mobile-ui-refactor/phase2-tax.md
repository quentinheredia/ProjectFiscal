# Phase 2: Tax calculator and salary pages

Branch: `feat/mobile-ui-tax` (from `feat/mobile-ui-home`)
Routes: `/[locale]/calculator/[province]`, `/[locale]/salary/[amount]/[province]`

## 1. Refactor
- [x] Add `features/tax/useTaxCalculator.ts`: year, province, the four income and deduction fields, frequency, availability checks and the engine call, moved out of `Calculator.tsx`. Returns a view model (shares, per-period scaling, setters).
- [x] Reuse `features/tax/pay-frequency.ts` (phase 1) for all five frequencies, with full and short labels from the dictionary.
- [x] Split `Calculator.tsx` into a container plus `CalculatorDesktop` (current markup, reading the view model) and `CalculatorPhone`.
- [x] Province page reads `lib/provinces.ts` and the locale helpers (done in phase 1).
- [x] Move the hard-coded English on these routes into the dictionary, in English and French: rate captions, "Gross:", "% of gross", "Formula:", the source link, "Your Federal Contribution", currency suffix and FHSA limit, and every string on the salary page.
- [x] Generalize the salary page to every amount in `SALARY_BENCHMARK_DOLLARS` (only $80,000 was generated, so four linked pages returned 404). Title, summary and metadata come from the dictionary with the amount filled in; `dynamicParams = false` keeps other amounts a 404. The legacy audit section shows only on the $80,000 page.

## 2. Phone components
| Area | Phone component | Done |
| --- | --- | --- |
| Page header | Smaller H1, no 72 px top padding, and no doubled gutter (the page added its own 16 px inside the layout's). | [x] |
| Inputs | Province `SegmentedControl` (ON, QC, BC, AB, spoken as full names), year `SegmentedControl` with unavailable years disabled and explained, `MoneyInput`, salary `ChipRail`, and a `Disclosure` for self-employment, RRSP and FHSA. | [x] |
| Result | Take-home for the chosen period (`role="status"`), five-way frequency `SegmentedControl` with short labels, `StackedBar`, a single `MetricList` (take-home, federal, provincial, CPP/QPP, EI/QPIP, total), average and marginal pair. | [x] |
| Sticky result | `StickySummaryBar` with take-home and period, shown once the result card scrolls above the header; tapping it scrolls back. No animation (AGENTS.md: no animation in the calculator form). | [x] |
| Trace | Each line is a `Disclosure`: title and amount on one line, form reference under it; the body shows the formula and a 44 px source link. | [x] |
| Spending | `SpendingListPhone` (phase 1) with the visitor's federal contribution above it. | [x] |
| Salary page | Shorter H1; the four highlight cards become a `MetricList`. | [x] |

The bracket table and the audit table on the province page are replaced in phase 4.

## 3. Verification
- [x] Gates, plus `e2e/mobile-calculator.spec.ts`: no overflow and 44 px targets in the form and result; income, province, year (including Québec's disabled 2025) and frequency all move the result; a trace line opens with formula and source; the sticky bar appears after scrolling, repeats the result and scrolls back to it; every salary benchmark page renders.
- [x] Existing desktop tests pass. The income test now finds the field by role (the hidden variant has no role), and the desktop select test is skipped on phone and tablet projects.
- [x] Probe at 390 px: calculator page 9.6 to 7.8 screens (with one disclosure open).
- [x] Screenshots at 390, 820 and 1440 px; 1440 px matches `main`.
- [x] First-load JS after moving dictionaries server-side (below): calculator 141 kB on `main` to 133 kB, home 152 to 145 kB, simulator 126 to 112 kB.

## Added during the phase
- [x] Client components no longer import both dictionaries. The locale layout passes the active one to `DictionaryProvider` (`lib/dictionary-context.tsx`), and client components call `useDictionary()`. This removed 16 kB (gzipped) from every page and brought the calculator back under budget with room for phase 4.
