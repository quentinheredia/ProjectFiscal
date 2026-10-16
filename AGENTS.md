# AGENTS.md

## Non-negotiables
- Never invent a tax figure. Every rate, threshold or credit amount in `packages/tax-data` must carry a `source` URL and `retrieved` date. If a value is unknown, use `null` and leave a TODO; the schema must fail validation on nulls in a published rule set.
- The engine is pure: no I/O, no `Date.now()`, no network. Money is integer cents.
- Never send income or any calculator input to analytics, logs, URLs or Supabase, except the scenarios table when a signed-in user presses Save.
- No component animation inside the calculator form. Respect `prefers-reduced-motion`.

## Workflow
- One task from the build plan per branch and PR; PR description lists what was verified and how.
- Before marking a PR ready: pnpm typecheck, lint, test, build, and e2e pass locally.
- New rule set or rule change: add or update test vectors in the same PR, each with the source of its expected value.
- Install UI with the shadcn CLI only:
  ```bash
  npx shadcn@latest add <shadcn-component>
  npx shadcn@latest add @react-bits/<Name>-TS-TW
  npx shadcn@latest add @cult-ui/<name>
  ```
  Note bundle impact for anything over 30 KB gzipped.

## Quality bars
- Calculator route: < 150 KB JS gzipped, Lighthouse mobile performance >= 95, accessibility = 100.
- Every page: unique title and description, self canonical, hreflang en-CA/fr-CA, JSON-LD as specified in the PRD.
- All user-facing strings go through the i18n dictionary; no hard-coded English.

## Secrets
- Never commit keys. Supabase service-role key is server-only (route handlers and server actions). Client code uses the anon key with RLS.
