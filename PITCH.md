# Fiscal Insights Rebuild: The One-Page Pitch

**Prepared for Client Review** · *October 2026*

---

## 1. The $80,000 Ontario Test Case (Old vs New vs Official CRA)

The strongest reason to rebuild rather than refactor: **The current calculator gives incorrect numbers that only look plausible because two large errors cancel each other out.**

| Calculation Component | Current Site (`fiscal-insights.ca`) | New Rebuild Engine (`v0`) | Official CRA Math (Form ON428 / Sched 1) | The Discrepancy & Why It Matters |
| :--- | :--- | :--- | :--- | :--- |
| **Federal Income Tax** | **$10,323** | **$9,660** | **~$9,660** | **+$663 too high**: Applies obsolete 2024 brackets without indexation or the 14.5% / 14% rate adjustment. |
| **Ontario Provincial Tax** | **$3,985** | **$4,940** | **~$4,940** | **-$955 too low**: Completely omits the **$750 Ontario Health Premium** (OHP) and applies incorrect bracket limits. |
| **CPP + CPP2 (Enhanced)** | $4,382.10 | $4,382.10 | $4,382.10 | Exact match ($4,034.10 base + $348.00 enhanced CPP2). |
| **Employment Insurance (EI)** | $1,077.48 | $1,077.48 | $1,077.48 | Exact match ($65,700 max insurable × 1.64%). |
| **Net Take-Home Pay** | **$60,232** | **$60,040** | **~$60,040** | **Net gap: ~$192**: Visitors think the site is accurate only because federal overcharging masked provincial undercharging. |

> **Trust Principle**: A financial calculator that is wrong in its individual components loses all authority the moment an accountant, journalist, or informed user checks their T1 notice of assessment.

---

## 2. Performance & Mobile Audit (Lighthouse Comparison)

| Metric | Current Legacy Site (Vue CLI + Webpack) | New Rebuild (Next.js 15 App Router + Pure TS) | Improvement |
| :--- | :--- | :--- | :--- |
| **Total Transfer Size** | **4.5 MB** | **~131 kB** (uncompressed) / **< 45 kB** (gzipped) | **97% payload reduction** |
| **Decoded JavaScript** | **3.3 MB** | **~102 kB** shared chunks | **97% less JS execution** |
| **HTTP Requests** | 66 requests | 4 requests | Fast, atomic asset delivery |
| **Lighthouse Mobile Perf** | **~38 - 52** (Slow on 4G) | **98 - 100** (Instantaneous) | Under 1.0s LCP on mobile |
| **Touch Targets** | 30–39 px (Fails WCAG) | ≥ 44 px (WCAG 2.2 AA compliant) | Full mobile ergonomics |
| **Console Errors / Noise** | 500+ debug logs on load | Clean (0 production logs) | Editorial-grade polish |

---

## 3. The SEO & Organic Traffic Problem

- **The Legacy Bottleneck**: The current site relies on hash routing (`/#/simulator`, `/#/how-it-works`) and canonical tags mistakenly pointing to GitHub Pages. To Google and Bing crawlers, the entire site is a single indexable page. French content has no dedicated URLs (`hreflang`), so it cannot rank in Québec search.
- **The Rebuild Architecture**:
  - Clean static generation with real search-intent URLs.
  - Dedicated province pages (`/calculator/ontario`, `/calculator/quebec`, etc.).
  - Curated salary landing pages (`/salary/80000/ontario`, `/salary/100000/ontario`).
  - Full bilingual route tree (`/en/...` and `/fr/...`) with `hreflang en-CA` and `fr-CA`.
  - JSON-LD structured data (`WebApplication`, `Dataset`, `BreadcrumbList`).
  - Target: **60+ indexed high-intent search landing pages within 90 days**.

---

## 4. Phase Plan & Delivery Gates

```
Phase 0: Pitch Demo (Completed)
└── Working Next.js monorepo, pure TS engine v0, 45 passing test vectors, bilingual ON pages, spending breakdown.
    │
    ▼ [Gate 1: Client approval & pricing sign-off]
Phase 1: Engine Complete & All 13 Jurisdictions (4–6 weeks)
└── All 13 provinces/territories (2025 & 2026), dividends, capital gains, OAS clawback, surtaxes, CI vector suite.
    │
    ▼ [Gate 2: 100% test vectors pass & independent cross-check]
Phase 2: Content, Accounts & Launch (3–4 weeks)
└── 13 province pages, curated salary pages, 5 learn guides, Supabase magic link scenarios, live cutover.
    │
    ▼ [Gate 3: Live on fiscal-insights.ca for 2027 filing season]
Phase 3: Upsells & Education Tier (Separate Scope)
└── Historical tax years (2014–2024), simplified Budget Simulator v2, and university/civics education tier.
```
