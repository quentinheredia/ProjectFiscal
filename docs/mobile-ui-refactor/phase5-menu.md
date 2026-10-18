# Phase 5: Header, tab bar and menu

Branch: `feat/mobile-ui-menu` (from `feat/mobile-ui-brackets-audit`)

## 1. Refactor
- [ ] Split `Navbar.tsx` into `SiteHeader`, `DesktopDock`, `ProvinceDropdown`, `MobileTabBar` and `MenuSheet`, each under 150 lines.
- [ ] Add `navigation/nav-items.ts`: one list of destinations (id, href builder, label keys, icon) used by the dock, the tab bar and the sheet.
- [ ] Add `navigation/useActiveSection.ts`: the active tab from the route, plus an IntersectionObserver on `#brackets` on the home page, replacing the `hashchange`-only logic.
- [ ] Add `navigation/useLocaleSwitch.ts`: the target locale and path (today computed inline).
- [ ] Share one `ProvincePicker` between the desktop dropdown and the sheet.

## 2. Phone components
| Area | Phone component |
| --- | --- |
| Header | 56 px on phones: emblem, wordmark, province chip. The tagline stays desktop-only. |
| Tab bar | `MobileTabBar`: Calculator, Simulator, Brackets, Menu; 64 px plus safe area; the active state follows route and section. |
| Menu sheet | `MenuSheet` on the shared `BottomSheet`: province grid; all destinations (Home, Tax calculator, Budget simulator, Brackets and audit, $80k audit case); salary benchmarks in a `ChipRail`; language as an EN and FR `SegmentedControl`; close button; drag the handle down to close, with the button as the keyboard and tap alternative. |
| Province chip | Opens the sheet scrolled to the province grid. |

## 3. Verification
- Gates, plus `e2e/mobile-menu.spec.ts`: open the sheet from the tab bar and the chip, change province (calculator route follows), switch language (path preserved), navigate to each destination, close with Escape, the close button and a backdrop tap.
- The Brackets tab lights when `#brackets` scrolls into view.
- Probe at 390 and 820 px across all routes for the definition of done in `phase0-overview.md`.
- Screenshots at 390, 820 and 1440 px.
