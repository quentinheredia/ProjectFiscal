# Phase 1: Foundation and home page

Branch: `feat/mobile-ui-home` (from `main`)

## 1. Refactor
- [ ] Delete the unused `components/ui/*` files and `SiteTutorial.tsx` (`phase0-audit.md`, code health 1).
- [ ] Remove the accidental root `github` dependency and refresh the lockfile.
- [ ] Add `lib/provinces.ts`: one `PROVINCES` list (code, slug, English and French names, French name with article, form, citation) and lookups `provinceBySlug`, `provinceByCode`. `ProvinceContext` re-exports from it.
- [ ] Add `lib/locale.ts`: `resolveLocale(param)` and `localizedAlternates(path)`; use them in every page and layout.
- [ ] Add `lib/format.ts`: `formatCurrency`, `formatPercent`, `formatThousands`, `fillTemplate`, moved out of `TaxCurveAnalytics.tsx`.
- [ ] Add `features/tax/spending.ts`: `allocateFederalTax(federalTaxCents)` returning the sorted envelope list; used by both spending views.
- [ ] Add `features/tax/useQuickEstimate.ts`: the preset, salary, RRSP, frequency and engine state now inside `TaxSimulationPreview`, returning a view model.
- [ ] Replace the inline footer in `app/[locale]/page.tsx` with `components/Footer.tsx`.
- [ ] Add `components/responsive/` (`PhoneOnly`, `DesktopOnly`).

## 2. Phone primitives
Built here, reused by phases 2 to 5 (`phase0-overview.md`, phone primitives).
- [ ] `SegmentedControl`
- [ ] `ChipRail`
- [ ] `Disclosure`
- [ ] `BottomSheet` (extracted from `Navbar.tsx`, which then uses it)
- [ ] `MoneyInput`
- [ ] `MetricRow`
- [ ] `StackedBar`
- [ ] `SectionHeading`
- [ ] Global touch defaults in `globals.css`: `touch-action: manipulation` on interactive elements, a deliberate tap highlight, `color-scheme: dark`; `theme-color` in the viewport export.

## 3. Home phone components
| Section | Today on a phone | Phone component |
| --- | --- | --- |
| Hero | Three CTAs in three rows of different shapes, two trust lines | `HomeHeroPhone`: headline, subtitle, one full-width primary CTA, the simulator as a text link, one trust line. |
| Quick estimate | Wrapped preset chips, squeezed salary row, 4 stacked KPI blocks, broken tab strip, 11 spending cards | `QuickEstimatePhone`: presets in a `ChipRail`; `MoneyInput` plus salary chips; RRSP as a 44 px switch row; frequency `SegmentedControl`; a result card (take-home, share kept, average and marginal in one `MetricRow` pair); `StackedBar` with legend; three `Disclosure`s replace the tabs: top 5 spending envelopes with "See all 11" in a `BottomSheet`, formula traces, legacy audit. |
| How it works | Three stacked desktop columns with eyebrows | `HowItWorksPhone`: a snap-scrolling rail of three cards with the next card peeking, province picker kept in card one, no eyebrows. |
| Province hub | Four tall cards with full-width buttons | `ProvinceHubPhone`: a 2 x 2 grid of province tiles (code, name, form) that link straight to each calculator; salary benchmarks in a `ChipRail`. |
| Gross to take-home | Two-line rows with 24 px bars | `WaterfallPhone`: one line per item (label and amount), a 6 px bar under it; province `SegmentedControl` at full width. The rate chart keeps its SVG but pins its readout above the plot. |
| Conversion and newsletter | Desktop split card | Stacked, full-width CTA; email input gets `type="email"` and `autoComplete="email"`. |
| Footer | Two-column link grid | Link groups become `Disclosure`s; disclaimer stays visible. |

The tax information hub (brackets, ceilings, audit, FAQ) is phase 4.

## 4. Verification
- Gates: typecheck, lint, test, build, e2e.
- Probe at 390 px on `/en` and `/fr`: page height 9 screens or fewer, no tap target under 44 px in the sections this phase rebuilt, no horizontal overflow.
- Screenshots at 390, 820 and 1440 px; 1440 must match `main`.
- New `mobile-chromium` and `tablet` Playwright projects; `e2e/mobile-home.spec.ts` covers the quick estimate (change salary, toggle RRSP, switch frequency, open the spending sheet).
- `/[locale]` first-load JS is reported in the PR.
