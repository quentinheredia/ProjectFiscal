# Phase 2: Tax calculator and salary pages

Branch: `feat/mobile-ui-tax` (from `feat/mobile-ui-home`)
Routes: `/[locale]/calculator/[province]`, `/[locale]/salary/[amount]/[province]`

## 1. Refactor
- [ ] Add `features/tax/useTaxCalculator.ts`: year, province, the four income and deduction fields, frequency, availability checks and the engine call, moved out of `Calculator.tsx`. Returns a view model (scaled amounts, shares, traces, setters).
- [ ] Add `features/tax/pay-frequency.ts`: the frequency list, divisors and localized short labels (`Year`, `Month`, `2 wk`, `Week`, `Hour`).
- [ ] Split `Calculator.tsx` into a container plus `CalculatorDesktop` (current markup, unchanged) and the presenters below.
- [ ] Use `lib/provinces.ts` in the province page in place of `SUPPORTED_PROVINCES`; use `resolveLocale` and `localizedAlternates`.
- [ ] Move the hard-coded English strings on these routes into the dictionary (`phase0-audit.md`, tax calculator 7), in English and French.
- [ ] Generalize the salary page to every amount in `SALARY_BENCHMARK_DOLLARS` (today only $80,000 is generated, so four linked pages return 404). Title, summary and metadata come from the dictionary with the amount filled in.

## 2. Phone components
| Area | Phone component |
| --- | --- |
| Page header | `CalculatorHeaderPhone`: smaller H1 ("Ontario tax calculator 2026"), one-line lead, no top padding. |
| Inputs | `CalculatorFormPhone`: province `SegmentedControl` (ON, QC, BC, AB), year `SegmentedControl`, `MoneyInput` for employment income, salary `ChipRail`, and a `Disclosure` for self-employment, RRSP and FHSA. Unavailable year or province combinations are shown disabled with the reason. |
| Result | `ResultCardPhone`: take-home for the chosen period, frequency `SegmentedControl` with short labels, `StackedBar`, then a single-column `MetricList` (take-home, federal, provincial, CPP/QPP, EI/QPIP, total), average and marginal rate pair. |
| Sticky result | `StickySummaryBar` with take-home and period, shown once the result card scrolls out of view, so salary edits always show their effect. Tapping it scrolls back to the result. No animation (AGENTS.md: no animation in the calculator form). |
| Trace | `TraceListPhone`: each line is a `Disclosure`; the summary shows title and amount on one line and the form reference on the next; the body shows the formula and the source link. |
| Spending | `SpendingSummaryPhone` (shared with phase 1): top 5 envelopes, the rest in a `BottomSheet`. |
| Salary page | `SalaryHeaderPhone`: shorter H1, the four highlight cards become a `MetricList`. |

The bracket table and the audit table on the province page are replaced in phase 4.

## 3. Verification
- Gates, plus `e2e/mobile-calculator.spec.ts`: edit income, change province and year (including a disabled combination), switch frequency, expand a trace line, confirm the sticky bar appears after scrolling and shows the same figure as the result card.
- Existing desktop tests keep passing; selectors move to `getByRole` where needed.
- Probe at 390 and 820 px on both routes; calculator route first-load JS under 150 kB.
- Screenshots at 390, 820 and 1440 px.
