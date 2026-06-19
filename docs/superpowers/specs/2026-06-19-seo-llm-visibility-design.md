# SEO + LLM Visibility Improvements — Design

**Date:** 2026-06-19
**Site:** FourSight Lab (`foursightlab.com`)
**Goal:** Improve visibility in search engines (Google rich results) and in LLM web searches (ChatGPT, Claude, Perplexity, Google AI), with no visible change to the site except a new FAQ section.

## Context

- **Live site:** hand-written HTML at the repository root. Deployed by GitHub Pages from the `main` branch, root path. Custom domain `foursightlab.com` (set via `CNAME`).
- **Current working branch:** `experiment/aesthetic-v2` — contains the newest content; Pages serves `main`. Changes go live only after merging to `main`. **This merge is out of scope for the implementation and will NOT be done without explicit user approval.**
- **Existing SEO assets (good baseline):** per-page `<title>`/`description`/`keywords`, `canonical`, OG tags on subpages, `robots.txt` (AI crawlers explicitly allowed), `sitemap.xml`, `llms.txt`.
- **Pages in scope:** `index.html` (home), `rag-systems.html`, `document-extraction.html`, `predictive-analytics.html`, `real-time-analytics.html`, `agent-interoperability.html`.

## Gaps identified

1. **No JSON-LD structured data** anywhere. Largest single lever for both Google rich results and LLM comprehension.
2. **Homepage `index.html` is under-optimized** vs. subpages: bare `<title>` ("FourSight Lab"), no `keywords`, no `canonical`, no OG tags, no Twitter Card.
3. **`og-image.jpg` referenced on every page but does not exist** → broken preview cards in social/search/LLM.
4. **`sitemap.xml` has no `<lastmod>`** dates.
5. **No FAQ content** — high-leverage for LLM web-search answers (LLMs extract Q&A pairs).
6. **Stale `dist/` Vite build** in the working tree (untracked, not served) references a wrong domain (`www.foursightlab.com`) and dead pages — confusing artifact, worth removing locally.

## Decisions (confirmed with user)

- Canonical domain: `foursightlab.com` (no `www`).
- Scope: all four areas — structured data, homepage fixes, FAQ, dist cleanup.
- FAQ: **add a visible FAQ section** (copy approved by user before commit).
- OG image: **generate a branded 1200×630 `og-image.jpg`**.

## Work breakdown

### 1. JSON-LD structured data (invisible `<head>` `<script type="application/ld+json">`)

- **All pages:** `Organization` schema — `name`, `url` (`https://foursightlab.com`), `logo`, `email` (`support@foursightlab.com`), `description`, `knowsAbout` (the 5 practice areas).
- **Homepage:** add `WebSite` schema; add `FAQPage` schema (see §3).
- **Each service page:** `Service` schema (`name`, `description`, `provider` → Organization, `serviceType`); `BreadcrumbList` (Home → service).
- Use `@graph` to combine multiple schema objects per page where appropriate.
- All URLs use `foursightlab.com` (no `www`); all content in schema must match visible/meta content.

### 2. Homepage `index.html` meta fixes

- Stronger `<title>`: keyword-rich, e.g. `FourSight Lab | Agentic AI & Data Intelligence Systems`.
- Add `<meta name="keywords">` aligned with practice areas.
- Add `<link rel="canonical" href="https://foursightlab.com/">`.
- Add full OG tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) matching the subpage pattern.
- Add Twitter Card meta (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
- Apply the same `twitter:*` additions to the 5 service pages (they already have OG; Twitter cards are missing).

### 3. FAQ section (visible) + `FAQPage` schema

- New `<section id="faq">` on the homepage, placed before `#contact`, styled with existing `v2.css` classes (no new visual language; reuse `panel`, `eyebrow`, `h2`, etc.).
- ~5–6 plain-language Q&As. Draft topics:
  - What does FourSight Lab do?
  - What is agentic RAG / agentic AI?
  - Do you build custom AI systems or sell a product?
  - What industries / data do you work with?
  - How do we get started / what does engagement look like?
  - What makes FourSight Lab different?
- Matching `FAQPage` JSON-LD with the exact same Q&A text (Google requires visible-content match).
- **FAQ copy is presented to the user for approval before committing.**

### 4. OG image

- Generate a branded `1200×630` `og-image.jpg` (dark `#040912` background, amber `#f8b84e` accent, "FourSight Lab" wordmark + tagline) at repo root so existing references resolve.

### 5. Sitemap + cleanup

- Add `<lastmod>2026-06-19</lastmod>` to each `sitemap.xml` entry.
- Delete the local `dist/` folder (untracked, not served) and add `dist/` to `.gitignore`.

## Out of scope / will NOT do without explicit approval

- Pushing or merging to `main` (required for changes to go live).
- Any visible design change beyond the approved FAQ section.
- Touching `node_modules/` or the old Vite source.

## Testing / verification

- Validate every JSON-LD block parses as valid JSON and conforms to schema.org types (manual review against Google Rich Results requirements).
- Confirm no page references a non-existent asset after the OG image is created.
- Confirm all schema/meta URLs use `foursightlab.com` (no `www`), matching `CNAME`, `robots.txt`, `sitemap.xml`, `llms.txt`.
- Confirm FAQ schema text matches visible FAQ text verbatim.
- Open each modified HTML locally to confirm no visible regression (except the intended FAQ section).
