# Fiscal Insights Rebuild: One-Page Pitch

**Prepared for client review** · October 2026 · every figure below was checked on 2026-10-16 (sources at the end)

---

## 1. The $80,000 Ontario test

The current calculator gets the individual lines wrong. Two errors partly cancel out, so the take-home figure looks plausible until someone checks the parts.

| Ontario, $80,000 salary | Current site | Rebuild | Difference |
| :--- | ---: | ---: | :--- |
| Federal tax | $10,323 | $9,552.30 | site is $770.70 too high |
| Ontario tax (incl. health premium) | $3,985 | $4,940.18 | site is $955.18 too low |
| CPP + CPP2 | $4,382.10 | $4,382.10 | same |
| EI | $1,077.48 | $1,077.48 | same |
| **Take-home pay** | **$60,232** | **$60,047.94** | site overstates it by $184.06 |

- The current site labels this result "2026" but applies 2025 rates, so the rebuild column uses 2025 rules for a like-for-like comparison.
- According to the October 15 audit, the site's federal figure follows 2024-style rules and its Ontario figure leaves out the $750 Ontario Health Premium.
- The rebuild's figures are worked line by line from the 2025 T1 return and Form ON428. They match the build plan's separate hand calculation (about $9,552, $4,940 and $60,048).
- With the real 2026 rules, the rebuild shows federal tax $9,242.60, Ontario tax $4,885.26, CPP $4,446.45, EI $1,123.07 and take-home pay $60,302.62.

> A tax calculator that is wrong line by line loses trust the moment an accountant, a journalist or a careful user compares it with their notice of assessment.

---

## 2. Speed on a phone (Lighthouse, mobile)

| Measure | Current site | Rebuild demo |
| :--- | ---: | ---: |
| Performance score (out of 100) | 27 | 65 |
| Main content visible (LCP) | 27.7 s | 3.4 s |
| Time the page is blocked (TBT) | 4,750 ms | 1,600 ms |
| Data downloaded | 4.8 MB | 169 KB |
| Requests | 74 | 12 |
| JavaScript downloaded | 1.0 MB | 139 KB |
| Console errors | 10 | 0 |
| Accessibility score (out of 100) | 95 | 96 |

- Each figure is the median of three runs with Lighthouse's standard mobile test (simulated slow 4G and a slowed-down phone CPU). The current site was tested live; the demo was tested as a production build on our machine. The demo figures come from the build before the dark-theme redesign and will be re-measured on a deployed preview.
- The demo is not yet at our own launch targets: 95+ for performance and 100 for accessibility. The remaining gap is script work while the page loads, plus one colour-contrast issue. Closing it is part of Phase 1.
- The calculator pages ship 130–141 kB of compressed JavaScript, inside our 150 kB budget.

---

## 3. Search visibility

**Current site:**
- Its canonical tag points search engines to an old GitHub Pages copy (`hj799web.github.io/Tax-calculator-website/`), not to fiscal-insights.ca.
- Every screen is a `/#/` hash route, so search engines see one page.
- There are no French URLs or `hreflang` tags, so the French content cannot rank in French search.
- The audit also found that crawlers without JavaScript see only a "please enable JavaScript" message.

**Rebuild:**
- Real URLs, prerendered as HTML, in English and French (`/en/...`, `/fr/...`).
- Each page has its own canonical tag and `hreflang` links (en-CA, fr-CA, x-default).
- In the demo today: the home page, `/calculator/ontario` and `/salary/80000/ontario`, each in both languages.
- Planned for launch: 13 province pages, tax-bracket pages, about 15 salary pages for each of the four largest provinces, and learn guides.
- Target: 60+ pages indexed by Google within 90 days of launch.

---

## 4. Accuracy you can audit

- 46 worked test cases cover Ontario, Quebec, British Columbia and Alberta for 2026, plus Ontario for 2025. Each lists its arithmetic and its CRA, Revenu Québec or Ontario source. CI is set up to block any change that breaks one.
- Every rate and threshold in the tax rules carries a link to the official page it came from and the date it was read.
- Still to come (the Phase 1 gate): 20 random cases checked against an independent calculator, matching within $1 per line.

---

## 5. Phase plan

| Phase | What it delivers | Gate to the next phase |
| :--- | :--- | :--- |
| **0: Pitch demo** (this document) | Calculator for federal + ON, QC, BC, AB (2026) and Ontario 2025, with 46 cited test cases. Bilingual Ontario pages. "Where your taxes go" view (spending figures still to be sourced). | Scope and price for Phases 1 and 2 agreed |
| **1: Engine and calculator** (4–6 weeks) | All 13 provinces and territories for 2025 and 2026. Dividends, capital gains, OAS recovery, age, pension and family credits. 10+ cited cases per jurisdiction per year. Full calculator UI. Mobile performance 95+ and accessibility 100. | Every case passes, and 20 random cases match an independent calculator within $1 per line |
| **2: Content, accounts, launch** (3–4 weeks) | Province, bracket, salary and learn pages. Privacy policy (PIPEDA and Quebec Law 25). Magic-link sign-in with saved scenarios. Newsletter with double opt-in. 2027 rates when CRA publishes them. | Live on fiscal-insights.ca before the February–April 2027 filing season |
| **3: Upsells** (scoped separately) | History back to 2014, a simpler budget simulator, province comparison, education tier | — |

Pricing for Phases 1 and 2 is agreed at Gate 1.

---

### Where these numbers come from

- **Rebuild tax figures:** test cases `on-2025-80k` and `on-2026-80k` in `packages/tax-engine/tests/vectors.ts` (branch `engine-cited-vectors`). They are worked from the 2025 T1 return, Form ON428 and CRA's T4127 payroll formulas, and checked against the build plan's hand calculation.
- **Current-site tax figures and the "2026 label, 2025 rates" finding:** the October 15, 2026 audit in the build plan. They were not re-entered on the live site.
- **Speed and accessibility:** Lighthouse 13.5.0, default mobile settings, median of three runs each on 2026-10-16. The current site was tested live at https://fiscal-insights.ca/. The demo was tested as a local production build (Next.js 15.5, branch `web-gates`). Full reports are in `docs/lighthouse/`.
- **JavaScript budget:** `next build` output on 2026-10-16: first-load JS of 141 kB for the home page and 130 kB for the province and salary pages.
- **Search findings:** the canonical tag, the `/#/` URL and the missing `hreflang` were observed on the live site on 2026-10-16. The "enable JavaScript" finding comes from the audit.
