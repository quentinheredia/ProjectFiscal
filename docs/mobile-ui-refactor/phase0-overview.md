# Phase 0: Overview and technical plan

## Design read
Reading this as: a preserve-mode redesign of a dark Canadian tax tool for people checking their pay on a phone, with a trust-first, data-led language, built on the existing Tailwind v4 utilities, the existing `lucide-react` icon set, and the emerald accent.

Dials (from the brief, not the defaults): `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 3`, `VISUAL_DENSITY 5`. It is a product tool, so layout stays predictable, motion is limited to state feedback, and density is that of a daily app. AGENTS.md also forbids animation inside the calculator form and requires `prefers-reduced-motion` support.

What is kept: the dark palette (`#090d16` base, `#0c121e` surfaces), emerald as the one accent, the system sans stack, the logo and wordmark, URL structure, nav labels and copy voice. What changes is layout, component shape and interaction on screens narrower than 1024 px.

## Principles
1. **One answer per screen.** The first screen of every route shows the number the visitor came for (take-home pay, the budget balance, the bracket for their income) without scrolling.
2. **Input and result stay together.** On the calculator and simulator the current result is always visible while editing, through a compact sticky bar, never a pinned card.
3. **Summaries first, detail on demand.** Long lists (11 spending envelopes, 12 budget envelopes, 13 trace lines) show the top items, and the rest opens in a disclosure or a bottom sheet.
4. **Lists, not tables.** Multi-column tables become stacked rows or comparison cards on phones. Desktop keeps its tables.
5. **Thumb-sized controls.** Every interactive target is at least 44 x 44 px; segmented controls replace wrapped pill rows and squeezed selects.
6. **Same data, same engine.** Phone and desktop views read one hook or one pure function. No figure is computed twice.

## Breakpoints
| Width | UI | Notes |
| --- | --- | --- |
| < 768 px | Phone | Single column, 16 px gutters, bottom tab bar. |
| 768 to 1023 px | Phone UI, scaled | Same components; content column capped at `max-w-2xl` and centred, type and spacing one step up (`md:`). |
| >= 1024 px | Desktop | Existing desktop components, unchanged except for shared refactors. |

The switch is `lg` (1024 px), which the navbar already uses.

## Architecture

### Rendering phone and desktop variants
Variants switch with CSS, not JavaScript, so server rendering and hydration stay identical on every device:

```tsx
<PhoneOnly><QuickEstimatePhone {...model} /></PhoneOnly>
<DesktopOnly><QuickEstimateDesktop {...model} /></DesktopOnly>
```

`PhoneOnly` renders `lg:hidden`, `DesktopOnly` renders `hidden lg:block`. Both variants are presenters: they receive a view model and callbacks and own no business state. The container that renders them owns the state through a hook (container/presenter split). Element IDs come from `useId()` so the two trees never collide, and hidden variants are `display: none`, which removes them from the accessibility tree.

A `useMediaQuery` hook was rejected: it renders the wrong variant on the server and flashes on hydration.

### Folder layout (new)
```
apps/web/src/
  lib/
    provinces.ts        single source for province codes, slugs, names, forms, citations
    locale.ts           resolveLocale(), localizedAlternates()
    format.ts           currency, percent, thousands, template fill
  features/
    tax/                useTaxCalculation, pay frequencies, spending allocation
    budget/             envelope data, useBudgetAllocations, summarizeBudget
    brackets/           toBracketRows, audit benchmark data
  components/
    responsive/         PhoneOnly, DesktopOnly
    mobile/             phone primitives (below)
    home/ tax/ budget/ brackets/ navigation/   feature presenters, phone and desktop
```

### Phone primitives (`components/mobile/`)
Built once in phase 1 and reused by every later phase. Each one is standalone: no imports from feature code, no global state.

| Primitive | Purpose |
| --- | --- |
| `SegmentedControl` | Radio group with 44 px segments; replaces wrapped pill rows, tab strips and short selects. |
| `ChipRail` | Horizontally scrolling, snap-aligned chips with edge fades; replaces wrapping preset rows. |
| `Disclosure` | `<details>`-based expandable row with a summary line; native keyboard and screen reader support. |
| `BottomSheet` | Modal `<dialog>` sheet with handle, title, close button, `overscroll-behavior: contain`, safe-area padding. Extracted from the navbar. |
| `MoneyInput` | Text input with `inputMode="numeric"`, digit filtering, thousands formatting on blur, `autoComplete="off"`, large type. |
| `MetricList` | Label, value and caption on one row per metric, as a description list; replaces 2 x 3 metric grids. |
| `StackedBar` | Proportional bar with an accessible legend list; one implementation for the three current copies. |
| `SectionHeading` | Phone section title and optional one-line lead, no eyebrow. |
| `StickySummaryBar` | Slim bar pinned under the header, shown once its anchor scrolls away (IntersectionObserver, no scroll listeners). |

## Stages
Every phase runs the same four stages, in order:

1. **Refactor.** Bring the touched modules to clean-code standard before adding UI: delete dead code, move data and state out of view components, collapse duplicates, name constants, keep functions to one job and three parameters. Behaviour does not change, and gates must pass before stage 2.
2. **Build phone components** on top of the refactored hooks and primitives.
3. **Wire up** with `PhoneOnly` and `DesktopOnly`, keeping desktop output identical.
4. **Verify:** full gates, the mobile e2e project, the Playwright probe (`phase0-audit.md` metrics), screenshots at 390, 820 and 1440 px, and the JS budget.

## Branch strategy
Branches are stacked in the order requested, because later phases reuse the primitives and hooks from earlier ones:

```
main
 └─ feat/mobile-ui-home            phase 0 docs, foundation, home
     └─ feat/mobile-ui-tax          calculator and salary pages
         └─ feat/mobile-ui-budget    simulator
             └─ feat/mobile-ui-brackets-audit
                 └─ feat/mobile-ui-menu
```

Each branch gets its own PR into the branch below it (or into `main` once that one merges), listing what was verified and how. Commits are small: one refactor, one component or one wiring step per commit, each leaving the build green.

## Definition of done (all phases)
- At 390 px: no horizontal overflow, no table that needs side-scrolling, zero tap targets under 44 px apart from inline text links, no text under 12 px apart from legal small print.
- Home page height at 390 px drops from 16.2 screens to 9 or fewer.
- One `<main>` per page.
- Every money input has `inputMode`, `name` and `autoComplete`.
- Calculator route stays under 150 kB first-load JS.
- Desktop at 1440 px is visually unchanged apart from shared fixes.
- All user-facing strings touched by a phase go through the i18n dictionary, in English and French.
- `pnpm typecheck`, `lint`, `test`, `build` and `e2e` pass.

## Testing additions
- A second Playwright project, `mobile-chromium` (Pixel 7, 412 px), and a tablet project (iPad Mini, 768 px) run the smoke suite plus a `mobile.spec.ts` per phase.
- Desktop tests locate controls by role, which ignores the hidden variant; where a test used `getByLabel`, it moves to `getByRole(..., { name })`.
- A shared `expectNoHorizontalOverflow(page)` helper runs on every route in the mobile project.

## Outcome
Measured on the production build of `feat/mobile-ui-menu`, against `main` at `4e75f3f`.

| Route at 390 px | Page height (screens) | Controls under 44 px | Text under 12 px | Tables needing side-scroll | `<main>` |
| --- | --- | --- | --- | --- | --- |
| `/en` | 16.2 to 8.85 (`/fr`: 9.0) | 49 to 0 | 78 to 7 | 1 to 0 | 1 |
| `/en/calculator/ontario` | 9.6 to 6.9 | 23 to 0 | 62 to 5 | 1 to 0 | 1 |
| `/en/simulator` | 4.6 to 1.3 | 16 to 0 | 48 to 4 | 0 | 2 to 1 |
| `/en/salary/80000/ontario` | 8.2 to 6.0 | 24 to 0 | 51 to 4 | 1 to 0 | 1 |

"Controls under 44 px" excludes visually hidden radio inputs whose labels are the 44 px targets, and the newsletter checkbox, whose label is its hit target. The remaining small text is legal print and monospace citations. At 820 px the home page drops from 7.9 to 6.4 screens.

First-load JS: home 152 to 146 kB, calculator 141 to 133 kB, salary 136 to 128 kB, simulator 126 to 115 kB.

Definition of done:
- [x] No horizontal overflow, no side-scrolling table, no control under 44 px, at 390 px on every route.
- [x] Home page 9 screens or fewer at 390 px: 8.85 in English, 9.0 in French (follow-up after phase 5: the duplicate take-home row went, the waterfall summary became three columns, audit explanations open on tap, phone spacing tightened, and FAQ items start closed).
- [x] One `<main>` per page.
- [x] Every visible text, number or email input has `autoComplete`, `name` and the right `inputMode`.
- [x] Calculator route under 150 kB (133 kB).
- [x] Desktop at 1440 px matches `main` apart from the shared fixes listed in each phase.
- [x] Touched strings go through the dictionary in English and French; typecheck fails on a missing French key.
- [x] `pnpm typecheck`, `lint`, `test` (82), `build` and `e2e` (68 passed, 2 skipped by design) pass.

## Risks
| Risk | Mitigation |
| --- | --- |
| Two variants in the DOM add markup and JS. | Phone presenters are small and share hooks; the JS budget is checked every phase. |
| Desktop regressions from shared refactors. | Refactor stage changes no markup; 1440 px screenshots before and after. |
| Figures drifting between variants. | Both variants read one hook or pure function; no presenter computes tax. |
| Copy drift between languages. | New strings are added to `en` and `fr` in the same commit; the dictionary type requires both. |
