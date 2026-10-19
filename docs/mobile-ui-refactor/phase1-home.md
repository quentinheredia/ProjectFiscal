# Phase 1: Foundation and home page

Branch: `feat/mobile-ui-home` (from `main`)

## 1. Refactor
- [x] Delete the unused `components/ui/*` files and `SiteTutorial.tsx` (`phase0-audit.md`, code health 1), and the dependencies only they used.
- [x] Remove the accidental root `github` dependency and refresh the lockfile.
- [x] Add `lib/provinces.ts`: one `PROVINCES` list (code, slug, English and French names, French name with article, form, citation) and lookups `findProvinceBySlug`, `provinceByCode`, `provinceName`. `ProvinceContext` re-exports from it; the province page, onboarding, hub and footer read it.
- [x] Add `lib/locale.ts`: `resolveLocale`, `localizedAlternates`, `localeParams`; used in every page and the layout.
- [x] Add `lib/format.ts`: `formatCurrency`, `formatCents`, `formatPercent`, `formatThousands`, `fillTemplate`, moved out of `TaxCurveAnalytics.tsx`.
- [x] Make typecheck fail when a French dictionary key is missing (`DictionaryShape` in `lib/i18n.ts`).
- [x] Add `features/tax/spending.ts`: `allocateFederalTax`, `allocateFederalTaxByShare`, `spendingBarWidth`; used by every spending view.
- [x] Add `features/tax/pay-frequency.ts` and `features/tax/useQuickEstimate.ts`; `TaxSimulationPreview` becomes a container and its desktop markup moves unchanged to `QuickEstimateDesktop`.
- [x] Add `features/tax/waterfall.ts`: row building and bar geometry moved out of `TaxCurveAnalytics.tsx`.
- [x] Add `features/tax/salary-benchmarks.ts`: one list of salary benchmark pages for the hub and footer.
- [x] Replace the inline footer in `app/[locale]/page.tsx` with a data-driven `components/Footer.tsx`.
- [x] Add `components/responsive/` (`PhoneOnly`, `DesktopOnly`).

## 2. Phone primitives
Built here, reused by phases 2 to 5 (`phase0-overview.md`, phone primitives).
- [x] `SegmentedControl` (native radios, arrow keys for free)
- [x] `ChipRail` and `Chip`
- [x] `Disclosure` (native `<details>`)
- [x] `BottomSheet` (the navbar moves onto it in phase 5)
- [x] `MoneyInput`
- [x] `MetricList`
- [x] `StackedBar`
- [x] `SectionHeading`
- [x] Global touch defaults in `globals.css`: `touch-action: manipulation`, transparent tap highlight, `color-scheme: dark`, dark native `<select>`; `themeColor` and `colorScheme` in the viewport export.

## 3. Home phone components
| Section | Today on a phone | Phone component | Done |
| --- | --- | --- | --- |
| Hero | Three CTAs in three rows of different shapes | `HeroCtasPhone`: one full-width primary CTA for the selected province, the simulator as a text link. | [x] |
| Quick estimate | Wrapped preset chips, squeezed salary row, broken tab strip, 11 spending cards | `QuickEstimatePhone`: presets and salaries in `ChipRail`s, `MoneyInput`, RRSP switch, frequency `SegmentedControl`, the answer under the inputs as one `MetricList`, three `Disclosure`s for spending (top 5, all 11 in a `BottomSheet`), traces and the legacy audit. | [x] |
| How it works | Three stacked desktop columns with eyebrows | `HowItWorksPhone`: snap rail of three cards, next card peeking, province picker in card one. | [x] |
| Province hub | Four tall cards with full-width buttons | `ProvinceHubPhone`: 2 x 2 tiles linking to each calculator; salary benchmarks in a `ChipRail`. | [x] |
| Gross to take-home | Two-line rows with 24 px bars | `WaterfallPhone`: one line per item, 6 px bar; full-width view and province controls; 44 px targets. | [x] |
| Conversion and newsletter | Desktop split card | Stacked, full-width CTA; email input with `autoComplete="email"`, 48 px tall; consent checkbox and label share one hit target. | [x] |
| Footer | Two-column link grid | Link groups become `Disclosure`s with 44 px rows. | [x] |

The tax information hub (brackets, ceilings, audit, FAQ) is phase 4.

## 4. Verification
- [x] Gates: typecheck, lint, test, build, e2e (desktop, `mobile-chromium` and `tablet` projects).
- [x] `e2e/mobile-home.spec.ts`: no horizontal overflow; 44 px targets in the rebuilt sections; the estimate reacts to salary, RRSP and frequency; the spending sheet opens with all 11 programs and closes; province tiles link to their calculator.
- [x] Probe at 390 px: page height 16.2 to 12.2 screens on `/en`. The remaining length is mostly the tax information hub, which phase 4 rebuilds; the 9-screen target is checked at the end of phase 4.
- [x] Screenshots at 390, 820 and 1440 px; 1440 px matches `main` apart from shared fixes (footer wordmark, frequency labels now "Year / 2 wk / Month").
- [x] First-load JS: `/[locale]` 152 kB on `main`, 158 kB here (phone presenters, after dropping `tailwind-merge`); calculator route 141 to 142 kB.

## Found along the way
- `/favicon.ico` (requested by every browser) matched `[locale]` and returned a 500. The locale layout now sets `dynamicParams = false`, so unknown first segments are 404s.
- Both languages' dictionaries shipped to every client page; phase 2 moves them server-side.
- Salary benchmark links other than $80,000 (`/salary/50000/ontario` and three more) return 404 because only the $80,000 page is generated. Phase 2 generalizes the salary page.
