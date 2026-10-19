# Mobile UI refactor

A phone-first rebuild of the Fiscal Insights web UI. Phones get their own components, which carry the same information and design quality as the desktop ones but are laid out and operated differently. Tablets use the phone UI at a slightly larger scale.

| Doc | What it covers | Branch |
| --- | --- | --- |
| [phase0-overview.md](phase0-overview.md) | Design direction, architecture, stages, branch strategy, definition of done | (all) |
| [phase0-audit.md](phase0-audit.md) | Measured audit of the current mobile UI, with file references | (all) |
| [phase1-home.md](phase1-home.md) | Shared foundation, then the home page | `feat/mobile-ui-home` |
| [phase2-tax.md](phase2-tax.md) | Province calculator and salary pages | `feat/mobile-ui-tax` |
| [phase3-budget.md](phase3-budget.md) | Federal budget simulator | `feat/mobile-ui-budget` |
| [phase4-brackets-audit.md](phase4-brackets-audit.md) | 2026 brackets, payroll ceilings, legacy audit, FAQ | `feat/mobile-ui-brackets-audit` |
| [phase5-menu.md](phase5-menu.md) | Header, bottom tab bar and menu sheet | `feat/mobile-ui-menu` |
| [province-pickers.md](province-pickers.md) | Province menus that scale from 4 to 13 jurisdictions | `feat/mobile-ui-menu` |

Each phase doc lists its refactor work first, then the new mobile components, then how it is verified. Every phase ends with the full gate run: `pnpm typecheck`, `lint`, `test`, `build`, `e2e`.

Each task in a phase doc has a checkbox. A task is ticked in the same commit that completes it.
