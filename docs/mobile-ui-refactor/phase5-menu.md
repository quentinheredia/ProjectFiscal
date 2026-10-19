# Phase 5: Header, tab bar and menu

Branch: `feat/mobile-ui-menu` (from `feat/mobile-ui-brackets-audit`)

## 1. Refactor
- [x] Move the menu sheet onto the shared `BottomSheet` from phase 1, removing the navbar's own dialog and scroll-lock code.
- [x] Split the 420-line `Navbar.tsx` into `Navbar` (header, about 90 lines), `DesktopDock` and `DesktopControls` (`navigation/DesktopNav.tsx`), and `MobileTabBar` and `MenuSheet` (`navigation/MobileNav.tsx`).
- [x] Add `navigation/nav-items.ts`: one list of destinations (id, href, labels, icon) used by the dock, the tab bar and the sheet.
- [x] Add `navigation/useActiveSection.ts`: the active tab from the route, plus an IntersectionObserver on `#brackets` on the home page, replacing the `hashchange`-only logic.
- [x] Add `navigation/locale-switch.ts`: the same path in another locale.
- [x] Share the province choice between the desktop dropdown (`ProvinceList`) and the sheet (`ProvinceGrid`).

## 2. Phone components
| Area | Phone component | Done |
| --- | --- | --- |
| Header | 56 px on phones: emblem, wordmark, a 44 px province chip. The tagline is desktop-only. | [x] |
| Tab bar | `MobileTabBar`: Calculator, Simulator, Brackets, Menu; 64 px plus safe area; the active state follows the route and, on the home page, the brackets section. | [x] |
| Menu sheet | `MenuSheet` on `BottomSheet`: province grid; every destination (Home, Tax Calculator, Budget Simulator, Brackets & Audit, $80k Audit Case); salary breakdowns in a `ChipRail`; an English and Français toggle that keeps the current path; close button. Every sheet can now be dragged down by its handle to close, with the button as the tap and keyboard alternative. | [x] |
| Province chip | Opens the sheet; the province grid is its first section. | [x] |

## 3. Verification
- [x] Gates, plus `e2e/mobile-menu.spec.ts`: open from the tab bar and the chip; close with Escape and the button; reach every destination; change province on a calculator page (the route follows); switch language on the same path; the Brackets tab lights when `#brackets` is on screen. The suite passed 40 of 40 repeated runs.
- [x] Probe at 390 and 820 px across all routes (results in `phase0-overview.md`, Outcome).
- [x] Screenshots at 390, 820 and 1440 px.

## Fixes made along the way
- Escape hid the dialog before its `close` event fired a task later, so reopening the sheet straight away could be undone. `BottomSheet` now handles `cancel` and closes through its `open` prop.
- The last controls under 44 px at phone widths (the header logo link, and the waterfall's salary field, slider and source links) were enlarged.
- Content sheets used the label "Close menu"; they now say "Close".
