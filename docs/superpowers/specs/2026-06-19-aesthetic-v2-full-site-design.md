# Aesthetic V2 — Full Site (Phase 2)

**Date:** 2026-06-19
**Branch:** `experiment/aesthetic-v2` (continues Phase 1)
**Status:** Approved design, ready for implementation plan
**Builds on:** `2026-06-19-aesthetic-v2-homepage-design.md` (Phase 1, the homepage)

## Goal

Extend the v2 aesthetic from the experimental homepage to the whole site, turning
this branch into a complete, internally consistent new version of the site ready
to replace `main`. This means: (1) promote the v2 homepage to the canonical
`index.html`, (2) extract a shared v2 design system for product pages, and
(3) port all 5 internal product pages to that design system, replacing the
existing files. All real content is preserved verbatim; only look and layout
change.

## Decisions (from brainstorming)

- **Strategy:** Shared v2 design system, then port each page one at a time.
- **File form:** REPLACE the existing files (not `-v2.html` siblings).
- **Content:** Keep ALL existing content verbatim (it is real and SEO-tuned);
  change only the aesthetic/layout.
- **Homepage:** Promote now (Option A) — `index-v2.html` becomes `index.html`,
  so the homepage and internal pages form one consistent site on this branch.
- **Logo lockup:** Restore the old size relationship — "FourSight" prominent,
  "lab" smaller / lighter / subtle — adapted to the v2 aesthetic, applied
  everywhere the brand appears (nav + footer, all pages).

## Scope

- **In scope:**
  - Promote homepage: `index-v2.html` → `index.html`; inline assets renamed/kept
    (`css/v2.css`, `js/constellation-v2.js`).
  - Shared v2 product-page CSS (added to `css/v2.css`) covering: product hero,
    breadcrumbs, feature grid, use-case cards with benefit chips, tech-spec
    columns, related-solutions cards, product CTA, footer.
  - Port all 5 internal pages to v2, replacing each file:
    `rag-systems.html`, `document-extraction.html`, `predictive-analytics.html`,
    `real-time-analytics.html`, `agent-interoperability.html`.
  - Restore the FourSight / "lab" logo lockup in the v2 nav and footer.
- **Out of scope:**
  - Rewriting copy (kept verbatim — see content reference).
  - The old CSS/JS (`main.css`, `components.css`, `animations.css`, `cosmos.css`,
    `responsive.css`, `js/*` except the constellation) — they stay in the repo
    untouched. Internal pages stop linking them; whether to delete them is a
    later cleanup decision, not part of this branch.
  - Sitemap/robots/llms.txt changes (URLs are unchanged since filenames are
    reused).

## Content source of truth

`.superpowers/sdd/page-content-reference.md` holds the exhaustive verbatim
content for all 5 pages, including per-page differences. Implementers reproduce
that text exactly. Key per-page differences:
- `real-time-analytics.html`: NO tech-specs section; 3 use-cases.
- `agent-interoperability.html`: tech-specs "Open Source" column has an extra
  "View mcp-ogc on GitHub" external link, and the CTA's 2nd button is that
  GitHub link (`target="_blank" rel="noopener"`) instead of "View All Solutions".
- Use-case counts: rag/document/predictive = 4; real-time/agent = 3.
- Each page keeps its own title/description/keywords/canonical/OG verbatim.

## Architecture

### Homepage promotion
- `git mv index-v2.html index.html` (overwrites the old homepage). The old
  homepage content is preserved in git history on `main`.
- Keep `css/v2.css` and `js/constellation-v2.js` filenames as-is (no rename
  needed; "v2" in the name is harmless and avoids churn). `index.html` already
  references them by those paths.
- The promoted homepage's nav links (`#services`, `#work`, `#contact`) remain;
  the brand lockup is updated per the logo decision below.

### Shared v2 design system (product pages)
A new block appended to `css/v2.css` provides product-page components, reusing
the existing v2 tokens (`--bg`, `--near`, `--far`, text ramp, `--panel`,
`--border`) and fonts (Sora / IBM Plex Sans / JetBrains Mono). Components:
- **Shared nav** — same fixed glass nav as the homepage, but its links point to
  the homepage sections (`index.html#services`, `index.html#work`,
  `index.html#contact`) since these are sub-pages; brand → `index.html`.
- **Breadcrumbs** — a slim mono/JetBrains row: Home › Solutions › <page>.
- **Product hero** — eyebrow + large Sora H1 + subtitle, over the constellation.
- **Feature grid** — the "How it works" 3-up feature cards (glass panels).
- **Use-case cards** — card grid; each has H3, body, and benefit chips
  (mono pills). 3 or 4 per page.
- **Tech-spec columns** — 3 glass columns of labeled lists; supports the optional
  extra GitHub link in one column.
- **Related-solutions cards** — 3 linked glass cards with "Learn More →".
- **Product CTA** — centered glass card with two buttons (the 2nd may be an
  external link).
- **Footer** — same v2 footer, with the brand lockup and per-page tagline.

Each internal page is a single self-contained HTML file linking only
`css/v2.css` + the Google Fonts + `js/constellation-v2.js` + the Three.js CDN
(same SRI'd tag as the homepage). The constellation background runs site-wide,
giving visual continuity.

### Logo lockup (brand)
Restore the prior relationship in v2 styling:
- "FourSight" — Sora, prominent (weight ~700, full size).
- "lab" — smaller, lighter, lower-emphasis (smaller font-size, lighter weight,
  reduced opacity), set close to the wordmark — the subtle subscript feel of the
  old `.logo-lab` (`0.8rem`, weight 300, opacity .7), translated to the v2 nav.
- Applied in BOTH the nav brand and the footer brand, on the homepage and all 5
  internal pages, so it is consistent everywhere.
- The grid-dot mark from the v2 homepage nav is kept alongside the wordmark.

## Reduced-motion & accessibility (carried from Phase 1)

- Constellation canvas hidden and animation skipped under
  `prefers-reduced-motion: reduce`; all content fully visible.
- Visible `:focus-visible` outlines, skip-to-content link, `scroll-padding-top`
  for the fixed nav — applied to internal pages too (they share `css/v2.css`).
- Semantic landmarks: `header`/`nav`/`main`/`section`/`footer`, one H1 per page
  (the product title), H2 per section, H3 per card.
- External links (`github.com/...`) use `target="_blank" rel="noopener"`.
- No mojibake; proper UTF-8 glyphs (`→`, `›`/`·`, `↓`).

## SEO preservation

- Each page keeps its exact `<title>`, meta description, meta keywords,
  canonical, and OG tags from the content reference.
- Filenames/URLs are unchanged, so `sitemap.xml`, `robots.txt`, and internal
  links elsewhere remain valid. No structured-data/JSON-LD is required on the
  product pages (the originals don't have per-page JSON-LD; the homepage's
  Organization/Service JSON-LD is preserved as part of the promoted homepage).

## Success criteria

- Opening `index.html` shows the v2 homepage (promoted), with the restored
  FourSight/"lab" lockup in nav and footer.
- Each of the 5 internal pages opens, renders in the v2 aesthetic with the
  constellation background, and shows its content VERBATIM per the reference
  (correct hero, features, use-cases, tech-specs where applicable, related,
  CTA, footer tagline).
- `real-time-analytics.html` has no tech-specs section;
  `agent-interoperability.html` has the GitHub link in tech-specs and as its
  2nd CTA button.
- All internal links resolve: breadcrumbs, related cards, CTAs, nav → homepage
  sections, footer links.
- Each page's title/canonical/OG match the reference exactly.
- Reduced-motion and keyboard-focus behaviors work on every page.
- No console errors; Three.js loads with a valid SRI hash on every page.
- No mojibake anywhere.

## Testing

- Manual per page: open in browser, scroll through, verify content matches the
  reference, click breadcrumbs/related/CTA/nav/footer links.
- Cross-page: from the homepage's services list, each link lands on the matching
  ported page; from each page, related/CTA links navigate correctly.
- Reduced-motion toggle on at least the homepage and one internal page.
- Grep guard: no `â`/`Â` mojibake in any HTML/CSS.
- Brand-consistency check: the FourSight/"lab" lockup renders with the size/weight
  relationship in both nav and footer on every page.
