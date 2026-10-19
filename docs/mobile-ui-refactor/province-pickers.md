# Province pickers: from 4 to 13 jurisdictions

Branch: `feat/mobile-ui-menu` (follow-up after phase 5)

Every menu that picks a province reads `PROVINCES` in `lib/provinces.ts` and adapts to its length, so adding jurisdictions needs no UI change.

## How each picker adapts
`fitsInline(provinces)` is true for 5 or fewer (`INLINE_PICKER_LIMIT`). Jurisdictions carry a `kind` (`province` or `territory`). `groupByKind` puts provinces first and adds headings only when both kinds are present.

| Picker | 5 or fewer | More than 5 |
| --- | --- | --- |
| Phone calculator, phone gross-to-take-home (`ProvinceField`) | Segmented control of codes | Full-width button that opens a bottom sheet listing every jurisdiction in 48 px rows, grouped; unavailable ones are disabled with the reason |
| Desktop gross-to-take-home | Pills | Grouped native `<select>` |
| Phone menu sheet (`ProvinceMenuChoice`) | 2-column tiles | Disclosure showing the current one, opening the grouped list |
| Desktop province dropdown (`ProvinceList`) | List | Same list, scrolling inside a 28rem panel |
| Phone home hub (`ProvinceHubPhone`) | 2-column tiles | Grouped link rows with code and form |
| Desktop calculator `<select>`, footer links, onboarding grid | Already list-driven | Unchanged |
| Desktop calculator hub | One card per jurisdiction; the four with written copy keep it, others get a template with name and form | Same |
| Brackets section | Rules looked up by code, accents assigned in list order | Same |

## Adding a jurisdiction
1. Add its sourced rule set to `packages/tax-data` with test vectors (AGENTS.md).
2. Extend `ProvinceCode` and `ProvinceSlug`, and add a `PROVINCES` entry with `kind`, names, form and citations.
3. Optionally add hand-written hub copy to the dictionary and `HUB_COPY` in `CalculatorHub.tsx`.

Province-specific engine behaviour (Québec abatement and QPP, Ontario surtax and health premium) lives in the engine and rule sets, not in the pickers.

## Verification
- With a temporary 13-entry list (not committed), checked at 390 px: the menu sheet, the home hub rows (Provinces and Territories groups) and the calculator's province sheet, where the nine without rules show as disabled with "not yet available for 2026". At 1440 px: the dropdown scrolls and the gross-to-take-home control becomes a select.
- With the real 4-entry list every picker looks as before.
- Gates pass: typecheck, lint, test (82), build, e2e (68 passed, 2 skipped by design). Home first-load JS 147 kB.

## Note
With 13 jurisdictions the phone home hub grows by about 9 rows (roughly 430 px), which would push the home page past the 9-screen target. If that happens, cap the hub at the most-used provinces and add a "See all" sheet.
