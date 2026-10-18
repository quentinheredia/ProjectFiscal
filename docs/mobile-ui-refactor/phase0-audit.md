# Phase 0: Audit of the current mobile UI

Baseline: `main` at `4e75f3f` (after #11, "Fixed mobile ui and graphs"). Sources: the 52 phone screenshots in `current-mobile-ui/` (Android, 1080 x 2392), a code read of `apps/web/src`, and a Playwright probe of the production build at 390 x 844 (phone) and 820 x 1180 (tablet), touch enabled.

## Measured baseline

| Route | Page height at 390 px (screens) | Tap targets under 44 px | Text under 12 px (elements) | Tables needing side-scroll | `<main>` elements |
| --- | --- | --- | --- | --- | --- |
| `/en` | 16.2 | 49 of 74 | 78 | 1 | 1 |
| `/en/calculator/ontario` | 9.6 | 23 of 48 | 62 | 1 | 1 |
| `/en/simulator` | 4.6 | 16 of 20 | 48 | 0 | **2** |
| `/en/salary/80000/ontario` | 8.2 | 24 of 39 | 51 | 1 | 1 |

At 820 px the counts are similar (55 of 74 small targets on `/en`), because tablets currently get the same squeezed desktop components. No route overflows horizontally; the audit table scrolls inside its own container instead, which hides two of its four columns on a phone.

JS first load: `/[locale]/calculator/[province]` 141 kB, `/[locale]/simulator` 126 kB, shared 102 kB (budget: 150 kB on the calculator route).

## Findings by area

### Home (`app/[locale]/page.tsx`)
1. **Too long.** 16 screens on a phone. The page runs two calculators (`TaxSimulationPreview` and `TaxCurveAnalytics`), the whole `TaxInformationHub`, and a second, inline copy of the footer (`page.tsx:178-297`) that duplicates `components/Footer.tsx`.
2. **Hero CTAs wrap into three mismatched rows** (`HeroCtas.tsx:22-47`): a primary, a blue secondary with an emoji, and a ghost anchor, each a different shape.
3. **Preset scenario chips wrap to three rows** (`TaxSimulationPreview.tsx:121-139`); the salary chips wrap beside a 128 px input (`:150-193`).
4. **Inspector tabs break.** Three long labels plus a badge wrap to three lines each (`TaxSimulationPreview.tsx:347-389`); the tab strip is not a `tablist`.
5. **"Where your federal taxes go" renders 11 full cards** (`:399-415`), about two screens, and labels truncate mid-word.
6. **"How it works"** is three desktop columns stacked (`InteractiveOnboarding.tsx`), each with a monospace eyebrow, an icon tile and two tip bullets: three screens of near-identical rhythm.
7. **Province hub** is four tall cards, each with a full-width "Launch" button (`CalculatorHub.tsx:83-123`); the Québec badge wraps to two lines.
8. **Waterfall** (`TaxCurveAnalytics.tsx:412-499`) is readable but every row spends two lines plus a 24 px bar.

### Tax calculator (`calculator/[province]/page.tsx`, `Calculator.tsx`)
1. **Hero** keeps desktop padding (`pt-18`) so the form starts below the fold.
2. **Result is far from the inputs.** On a phone the input card, then the result card, then traces stack; changing the salary means scrolling back up to see the effect.
3. **Frequency selector** squeezes five options; "2-Wk" wraps (`Calculator.tsx:348-363`).
4. **Trace rows** put title, form badge and amount on one line; badges wrap to two lines and push amounts out of alignment (`:489-514`).
5. **Spending breakdown** repeats the 11 cards (`:567-595`); it is a second copy of the home component.
6. **Bracket and audit tables** need side-scrolling; the audit "Impact" column wraps one word per line.
7. Hard-coded English in a localized page: "Total tax / Gross salary", "Tax on next $1 earned", "Gross:", "Your Federal Contribution", "Formula:", OHP note (`page.tsx:209-212`), and others.

### Budget simulator (`simulator/FederalBudgetSimulator.tsx`)
1. **The sticky summary covers about 45% of the viewport** (`:240-338`). It is a full card with four stacked blocks and two buttons, pinned under the header, so only one envelope is visible at a time.
2. **Nested `<main>`** (`simulator/page.tsx:48` inside the layout's `<main>`).
3. **Sliders are the only control.** A 0.5 B step on a 300 px track is hard to hit with a thumb; there is no way to type or nudge a value.
4. The statutory and discretionary envelope cards are two near-identical copies of the same markup (`:360-412`, `:436-488`).

### Brackets and audit (`TaxInformationHub.tsx`, calculator page)
1. **The same bracket table is written three times** (federal, provincial in the hub, provincial on the calculator page).
2. **The legacy audit table is written twice** with its figures inline (`TaxInformationHub.tsx:386-429`, `calculator/[province]/page.tsx:240-283`).
3. **FAQ toggles** lack `aria-expanded` and `aria-controls` (`TaxInformationHub.tsx:455-466`).
4. Badges such as "Ontario (ON)" wrap inside the heading row.

### Menu and navigation (`Navbar.tsx`)
1. Bottom tab bar and sheet already exist and work. The sheet offers only Home, the $80k case and Language; Simulator and Brackets are reachable only from the tab bar, and salary benchmarks not at all.
2. The "Brackets" tab is active only after a `hashchange`; scrolling to the section or arriving from another route does not light it.
3. The sheet lives inside a 420-line component that also owns the desktop dock, the dropdown and outside-click logic.
4. No `color-scheme` or `theme-color`, so form controls and the browser bar stay light.

### Code health (blocks clean mobile work)
1. **Dead code:** 13 of the 15 files in `components/ui/` are never imported by a live page (about 6,000 lines: `analytics-chart`, `feature-sticky-section`, `marketing-hero-analytics`, `mock-browser-window`, `cutout-card`, `halo-button`, `gradient-button-group`, `shadow-card`, `texture-card`, `minimal-card`, `texture-overlay`, `onboarding`, `button`), plus `SiteTutorial.tsx`.
2. **Province data is defined five times:** `ProvinceContext.tsx`, `calculator/[province]/page.tsx`, `Calculator.tsx`, `InteractiveOnboarding.tsx`, `CalculatorHub.tsx`, with forms and citations again in `TaxInformationHub.tsx` and `TaxSimulationPreview.tsx`.
3. **Locale parsing** (`resolved.locale === 'fr' ? 'fr' : 'en'`) and hreflang blocks are repeated in every page.
4. **Formatting helpers** live privately in `TaxCurveAnalytics.tsx`; other files format with `toFixed` and string concatenation.
5. **Calculation state lives in view components**, so a phone layout cannot reuse it without copying it.
6. 35 `transition-all` uses, 7 `focus:`-only styles, and many sub-12 px labels.
7. The root `package.json` has gained an accidental `github` dependency again.

## Guideline check (Vercel Web Interface Guidelines, abridged)
- Touch: no `touch-action: manipulation`, no deliberate tap highlight, no `overscroll-behavior: contain` on the sheet.
- Forms: money inputs are `type="number"` without `inputMode`, `name` or `autocomplete`; the newsletter email lacks `autocomplete="email"`.
- Focus: several controls rely on `focus:` or have no visible focus style.
- Animation: `transition: all` throughout; the decorative pulse in the footer ignores reduced motion.
- Theming: no `color-scheme: dark`, no `theme-color`; native `<select>` gets no explicit colors.
- Typography: no `text-wrap: balance` on headings; numbers mostly use `tabular-nums` (good).
