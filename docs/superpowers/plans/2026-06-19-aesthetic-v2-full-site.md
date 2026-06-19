# Aesthetic V2 Full-Site Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the v2 homepage to `index.html`, add a shared v2 product-page design system, and port all 5 internal pages to it (replacing the files) with content preserved verbatim — turning `experiment/aesthetic-v2` into a complete, consistent new site.

**Architecture:** One shared stylesheet `css/v2.css` (already holds homepage styles; we append a product-page component block). Each page is a self-contained HTML file linking `css/v2.css` + Google Fonts + Three.js (CDN, SRI'd) + `js/constellation-v2.js`. The constellation runs site-wide for visual continuity. The FourSight/"lab" logo lockup is restored in the shared nav + footer.

**Tech Stack:** Plain HTML5, CSS3 (`backdrop-filter`, custom properties), vanilla JS, Three.js r128 (CDN), Google Fonts (Sora, IBM Plex Sans, JetBrains Mono).

## Global Constraints

- Branch: `experiment/aesthetic-v2`. Do NOT modify the old shared assets (`css/main.css`, `css/components.css`, `css/animations.css`, `css/cosmos.css`, `css/responsive.css`, `js/cursor.js`, `js/main.js`, `js/navigation.js`, `js/particles.js`, `js/scroll-narrative.js`, `js/vendor/*`). New pages simply stop linking them.
- Content is VERBATIM from `.superpowers/sdd/page-content-reference.md`. Reproduce every page's text, links, titles, canonicals, and OG tags exactly. Do not rewrite copy.
- Tokens (already in `css/v2.css` `:root`): `--bg`#07090d, `--near`#34e0d0, `--far`#4d7cff, text ramp `--t1`#e8ebef/`--t2`#aab2bd/`--t3`#9098a4/`--t4`#5b6470, `--panel` rgba(9,12,17,.52), `--border` rgba(255,255,255,.08). Fonts: Sora (display), IBM Plex Sans (body), JetBrains Mono (mono labels).
- Three.js tag MUST be the exact SRI'd tag already in `index.html` (copy it verbatim — see Task 2 for the literal string). Never invent an integrity hash.
- Proper UTF-8 glyphs only (`→`, `›`, `↓`, `·`, `—`, `©`). NEVER mojibake (`â`/`Â`).
- External links use `target="_blank" rel="noopener"`.
- Every page: one `<h1>` (product title), `<h2>` per section, `<h3>` per card; semantic `header`/`nav`/`main`/`section`/`footer`; a `.skip-link` first in `<body>`; reduced-motion handled (inherited from `css/v2.css`).
- No build step; pages must work opened directly and on GitHub Pages.

### Logo lockup (binding visual rule)

The brand wordmark must show "FourSight" prominent and "lab" smaller/lighter/subtle (echoing the old `.logo-lab`: ~0.8× size, weight 300, opacity .7), in BOTH nav and footer, on ALL pages. Markup uses two spans:
```html
<span class="brand-name">FourSight<span class="brand-lab">lab</span></span>
```
CSS (append to `css/v2.css`):
```css
.brand-lab{font-weight:300;font-size:.62em;opacity:.7;margin-left:.28em;letter-spacing:0;position:relative;top:-.04em;}
```

### Shared internal-page nav + footer (binding markup)

Internal pages use this nav (links point to homepage sections since they are sub-pages) and footer. Brand → `index.html`. `PAGE_TAGLINE` is per-page (from the content reference).
```html
<a class="skip-link" href="#content">Skip to content</a>
<header class="nav">
  <a class="brand" href="index.html" aria-label="FourSight Lab home">
    <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="brand-name">FourSight<span class="brand-lab">lab</span></span>
  </a>
  <nav class="nav-links" aria-label="Primary">
    <a href="index.html#services">Services</a>
    <a href="index.html#work">Case studies</a>
    <a href="index.html#contact">Contact</a>
  </nav>
  <a class="btn btn-primary nav-cta" href="index.html#contact">Book a call</a>
</header>
```
Footer (append after `</main>`'s last section, inside `<main>` is NOT required for internal pages — place `<footer>` after `</main>`):
```html
<footer class="footer footer-product">
  <span class="brand-name">FourSight<span class="brand-lab">lab</span></span>
  <span class="footer-tagline">PAGE_TAGLINE</span>
  <span class="footer-links">
    <a href="index.html#services">Solutions</a>
    <a href="index.html#contact">Get Started</a>
  </span>
  <span class="footer-copy">© 2026 FourSight Lab. All rights reserved.</span>
</footer>
```

---

## Testing approach

Static front-end, no test runner. "Tests" are explicit static/grep verifications plus per-page content checks against the reference, and a final cross-page link/isolation guard. Each task ends with a concrete check + commit.

---

### Task 1: Promote homepage to index.html + restore logo lockup

**Files:**
- Rename: `index-v2.html` → `index.html` (overwrites old homepage)
- Modify: `index.html` (brand markup in nav + footer)
- Modify: `css/v2.css` (append `.brand-lab` rule; add footer brand styles if needed)

**Interfaces:**
- Produces: canonical `index.html` on v2 aesthetic; `.brand-lab` CSS class used by all later pages; confirms `css/v2.css` + `js/constellation-v2.js` paths.

- [ ] **Step 1: Promote the file**

```bash
git mv index-v2.html index.html
```

- [ ] **Step 2: Update the nav brand markup** in `index.html`. Replace:

```html
    <span class="brand-name">FourSight&nbsp;Lab</span>
```

with:

```html
    <span class="brand-name">FourSight<span class="brand-lab">lab</span></span>
```

- [ ] **Step 3: Update the footer** in `index.html`. The current footer is:

```html
<footer class="footer">
    <span>© 2026 FourSight Lab — AI-Powered Data Intelligence</span>
</footer>
```

Replace it with a footer that carries the brand lockup (homepage tagline keeps its current line):

```html
<footer class="footer">
  <span class="brand-name">FourSight<span class="brand-lab">lab</span></span>
  <span>© 2026 FourSight Lab — AI-Powered Data Intelligence</span>
</footer>
```

- [ ] **Step 4: Append `.brand-lab` CSS** to `css/v2.css`:

```css
.brand-lab{font-weight:300;font-size:.62em;opacity:.7;margin-left:.28em;letter-spacing:0;position:relative;top:-.04em;}
.footer .brand-name{font-family:'Sora',sans-serif;font-weight:700;font-size:15px;letter-spacing:-.01em;margin-right:14px;}
```

- [ ] **Step 5: Verify**

Run: `ls index-v2.html 2>/dev/null && echo "STILL EXISTS (bad)" || echo "renamed OK"`
Run: `grep -c 'brand-lab' index.html` → expect `2` (nav + footer).
Run: `grep -n 'brand-lab' css/v2.css` → expect the rule present.
Run: `grep -rn $'\xc3\xa2' index.html css/v2.css && echo "MOJIBAKE" || echo "clean"`
Static-confirm `index.html` still links `css/v2.css` and `js/constellation-v2.js` and the SRI'd Three.js tag.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(v2): promote homepage to index.html, restore FourSight/lab lockup"
```

---

### Task 2: Shared v2 product-page design system (CSS)

**Files:**
- Modify: `css/v2.css` (append the product-page component block)

**Interfaces:**
- Consumes: existing tokens, `.btn`/`.btn-primary`/`.btn-ghost`, `.eyebrow`, `.panel`, `.skip-link`, `.nav`, `.brand*`, `.footer` from Phase 1.
- Produces: classes used by Tasks 3–7: `.breadcrumbs`, `.crumb`, `.product-hero`, `.product-hero h1`, `.product-sub`, `.section`, `.section-head`, `.feature-grid`, `.feature`, `.usecase-grid`, `.usecase`, `.chips`, `.chip`, `.specs-grid`, `.spec-col`, `.related-grid`, `.related-card`, `.product-cta`, `.cta-card`, `.footer-product`, `.footer-tagline`, `.footer-links`, `.footer-copy`.

- [ ] **Step 1: Append the product-page CSS** to `css/v2.css`:

```css
/* ===== v2 product pages ===== */
.page-main{position:relative;z-index:2;padding-top:96px;}
.breadcrumbs{max-width:1180px;margin:0 auto;padding:8px clamp(24px,6vw,80px) 0;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--t4);letter-spacing:.04em;}
.breadcrumbs a{color:var(--t3);text-decoration:none;}
.breadcrumbs a:hover,.breadcrumbs a:focus-visible{color:var(--near);}
.breadcrumbs .sep{margin:0 8px;color:var(--t4);}
.product-hero{max-width:1180px;margin:0 auto;padding:clamp(40px,7vw,90px) clamp(24px,6vw,80px) clamp(30px,4vw,50px);}
.product-hero h1{font-family:'Sora',sans-serif;font-size:clamp(36px,6vw,76px);line-height:1.0;letter-spacing:-.035em;font-weight:800;margin:14px 0 22px;max-width:18ch;text-shadow:0 4px 40px rgba(7,9,13,.8);}
.product-sub{font-size:clamp(16px,1.7vw,21px);line-height:1.55;color:var(--t2);max-width:680px;margin:0;}
.section{max-width:1180px;margin:0 auto;padding:clamp(40px,5vw,70px) clamp(24px,6vw,80px);}
.section-head{margin-bottom:34px;}
.section-head h2{font-family:'Sora',sans-serif;font-size:clamp(26px,3.4vw,42px);font-weight:700;letter-spacing:-.03em;margin:0;max-width:20ch;}
.section-head p{font-size:15px;color:var(--t3);margin:14px 0 0;max-width:60ch;}
.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.feature{background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:18px;padding:28px;}
.feature h3{font-family:'Sora',sans-serif;font-size:20px;font-weight:600;margin:0 0 10px;letter-spacing:-.01em;}
.feature p{font-size:14px;line-height:1.65;color:var(--t3);margin:0;}
.usecase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.usecase{background:rgba(11,15,21,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:28px;}
.usecase h3{font-family:'Sora',sans-serif;font-size:19px;font-weight:600;margin:0 0 10px;letter-spacing:-.01em;}
.usecase p{font-size:14px;line-height:1.65;color:#c2c8d0;margin:0 0 16px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;}
.chip{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.04em;color:var(--near);background:rgba(52,224,208,.08);border:1px solid rgba(52,224,208,.22);border-radius:999px;padding:5px 11px;}
.specs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.spec-col{background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:18px;padding:26px;}
.spec-col h3{font-family:'JetBrains Mono',monospace;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:var(--near);margin:0 0 16px;}
.spec-col ul{list-style:none;margin:0;padding:0;}
.spec-col li{font-size:14px;color:var(--t2);padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);}
.spec-col li:last-child{border-bottom:none;}
.spec-col .spec-link{display:inline-block;margin-top:14px;font-family:'Sora',sans-serif;font-weight:600;font-size:13px;}
.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.related-card{display:block;background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:18px;padding:26px;text-decoration:none;color:inherit;transition:border-color .2s,background .2s;}
.related-card:hover,.related-card:focus-visible{border-color:var(--near);background:rgba(52,224,208,.05);}
.related-card h3{font-family:'Sora',sans-serif;font-size:18px;font-weight:600;margin:0 0 10px;letter-spacing:-.01em;}
.related-card p{font-size:14px;line-height:1.6;color:var(--t3);margin:0 0 16px;}
.related-cta{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--near);letter-spacing:.04em;}
.product-cta{position:relative;text-align:center;padding:clamp(70px,9vw,120px) clamp(24px,6vw,80px);overflow:hidden;}
.cta-card{position:relative;z-index:1;max-width:620px;margin:0 auto;background:rgba(9,12,17,.5);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:24px;padding:clamp(36px,5vw,56px);}
.cta-card h2{font-family:'Sora',sans-serif;font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-.03em;margin:0 0 16px;line-height:1.05;}
.cta-card p{font-size:clamp(15px,1.6vw,18px);line-height:1.6;color:var(--t2);margin:0 auto 28px;max-width:480px;}
.cta-buttons{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.footer-product{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 18px;text-align:center;}
.footer-tagline{color:var(--t3);}
.footer-links{display:flex;gap:16px;}
.footer-links a{color:var(--t3);text-decoration:none;}
.footer-links a:hover,.footer-links a:focus-visible{color:var(--near);}
.footer-copy{color:var(--t4);width:100%;}
@media (max-width:900px){.feature-grid,.specs-grid,.related-grid{grid-template-columns:1fr;}.usecase-grid{grid-template-columns:1fr;}}
```

- [ ] **Step 2: Verify**

Run: `grep -c 'product-hero\|usecase-grid\|specs-grid\|related-card\|cta-card' css/v2.css` → expect ≥5.
Run: `grep -rn $'\xc3\xa2' css/v2.css && echo MOJIBAKE || echo clean`.
Confirm only `css/v2.css` changed: `git status --porcelain` shows just ` M css/v2.css`.

- [ ] **Step 3: Commit**

```bash
git add css/v2.css
git commit -m "feat(v2): shared product-page design system"
```

---

### Tasks 3–7: Port the 5 internal pages

Each of Tasks 3–7 follows the SAME procedure for one page. They are independent (each replaces one file). The page-specific content is in `.superpowers/sdd/page-content-reference.md` under that page's heading — reproduce it VERBATIM.

**Per-page HTML skeleton (use for every internal page):** Replace the entire file with this structure, filling `PAGE_*` from the content reference. Keep the `<head>` SEO block exact per the reference.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PAGE_TITLE</title>
<link rel="icon" type="image/png" href="icons/lab-icon2.png">
<meta name="description" content="PAGE_DESCRIPTION">
<meta name="keywords" content="PAGE_KEYWORDS">
<meta name="robots" content="index, follow">
<link rel="canonical" href="PAGE_CANONICAL">
<meta property="og:title" content="PAGE_OG_TITLE">
<meta property="og:description" content="PAGE_OG_DESCRIPTION">
<meta property="og:image" content="https://foursightlab.com/og-image.jpg">
<meta property="og:url" content="PAGE_CANONICAL">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/v2.css">
</head>
<body>
<a class="skip-link" href="#content">Skip to content</a>
<canvas id="fs-canvas" aria-hidden="true"></canvas>
<!-- SHARED NAV (from Global Constraints) -->
<main id="content" class="page-main">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="index.html">Home</a><span class="sep">›</span><a href="index.html#services">Solutions</a><span class="sep">›</span>PAGE_LABEL
  </nav>
  <section class="product-hero">
    <p class="eyebrow">// SECTION_EYEBROW</p>
    <h1>PAGE_H1</h1>
    <p class="product-sub">PAGE_SUB</p>
  </section>
  <section class="section">
    <div class="section-head"><h2>DETAILS_H2</h2><p>DETAILS_INTRO</p></div>
    <div class="feature-grid"><!-- 3 .feature cards --></div>
  </section>
  <section class="section">
    <div class="section-head"><h2>USECASES_H2</h2><p>USECASES_INTRO</p></div>
    <div class="usecase-grid"><!-- 3 or 4 .usecase cards, each with .chips --></div>
  </section>
  <!-- TECH SPECS: include for all pages EXCEPT real-time-analytics -->
  <section class="section">
    <div class="specs-grid"><!-- 3 .spec-col --></div>
  </section>
  <section class="section">
    <div class="section-head"><h2>Related Solutions</h2><p>RELATED_INTRO</p></div>
    <div class="related-grid"><!-- 3 .related-card --></div>
  </section>
  <section class="product-cta">
    <div class="cta-card">
      <h2>CTA_H2</h2><p>CTA_P</p>
      <div class="cta-buttons">
        <a class="btn btn-primary" href="CTA_BTN1_HREF">CTA_BTN1_LABEL</a>
        <a class="btn btn-ghost" href="CTA_BTN2_HREF">CTA_BTN2_LABEL</a>
      </div>
    </div>
  </section>
</main>
<!-- SHARED FOOTER with PAGE_TAGLINE -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        integrity="sha512-dLxUelApnYxpLt6K2iomGngnHO83iUvZytA3YjDUCjT0HDOHKXnVYdf3hU4JjM8uEhxf9nD1/ey98U3t2vZ0qQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="js/constellation-v2.js" defer></script>
</body>
</html>
```

Card patterns:
```html
<!-- feature -->
<div class="feature"><h3>NAME</h3><p>BODY</p></div>
<!-- usecase (chips = the two benefit pills) -->
<div class="usecase"><h3>NAME</h3><p>BODY</p><div class="chips"><span class="chip">CHIP_A</span><span class="chip">CHIP_B</span></div></div>
<!-- spec column -->
<div class="spec-col"><h3>COL_TITLE</h3><ul><li>ITEM</li>...</ul></div>
<!-- related card -->
<a class="related-card" href="HREF"><h3>NAME</h3><p>BODY</p><span class="related-cta">Learn More →</span></a>
```

Notes binding all five page tasks:
- Pick a short, relevant `SECTION_EYEBROW` per page (mono eyebrow over the H1), e.g. `// agentic knowledge`, `// document automation`, `// predictive intelligence`, `// live monitoring`, `// agent interoperability`. This is the only non-verbatim text; everything else is from the reference.
- `PAGE_LABEL` is the breadcrumb final label from the reference.
- Use the EXACT Three.js `<script>` tag shown above (matches `index.html`'s SRI).
- Reproduce all body/heading/link text verbatim from the reference, including em-dashes and the Greek "δικαιολογητικά" in document-extraction.
- External GitHub links: `target="_blank" rel="noopener"`.

---

### Task 3: Port rag-systems.html

**Files:** Replace `rag-systems.html`. Content: reference §1.

- [ ] **Step 1:** Replace `rag-systems.html` with the skeleton, filled from reference §1 (4 use-cases; tech-specs present; eyebrow `// agentic knowledge`; CTA buttons "Request Demo" → `index.html#contact`, "View All Solutions" → `index.html#solutions`; footer tagline "Transforming data into intelligence since 2024").
- [ ] **Step 2: Verify content** — Run: `grep -c 'usecase"' rag-systems.html` → expect `4`. Run: `grep -c 'spec-col' rag-systems.html` → expect `3`. Confirm title/canonical match reference: `grep -n 'rag-systems.html\|Agentic Knowledge' rag-systems.html | head`. Run mojibake grep → clean. Confirm links: `grep -o 'href="[^"]*"' rag-systems.html | sort -u` shows index.html#services/#work/#contact, the 3 related pages, css/v2.css, js/constellation-v2.js, the Three.js CDN.
- [ ] **Step 3: Commit** — `git add rag-systems.html && git commit -m "feat(v2): port rag-systems to v2 aesthetic"`

---

### Task 4: Port document-extraction.html

**Files:** Replace `document-extraction.html`. Content: reference §2.

- [ ] **Step 1:** Replace with skeleton from reference §2 (4 use-cases incl. the Greek "δικαιολογητικά" verbatim; tech-specs present; eyebrow `// document automation`; CTA "Schedule Demo" → `index.html#contact`, "View All Solutions" → `index.html#solutions`; footer tagline "Transforming data into actionable intelligence with cutting-edge AI solutions.").
- [ ] **Step 2: Verify** — `grep -c 'usecase"'` → `4`; `grep -c 'spec-col'` → `3`; `grep -c 'δικαιολογητικά' document-extraction.html` → `1`; title/canonical match reference; mojibake grep clean; links resolve.
- [ ] **Step 3: Commit** — `git add document-extraction.html && git commit -m "feat(v2): port document-extraction to v2 aesthetic"`

---

### Task 5: Port predictive-analytics.html

**Files:** Replace `predictive-analytics.html`. Content: reference §3.

- [ ] **Step 1:** Replace with skeleton from reference §3 (4 use-cases; tech-specs present; eyebrow `// predictive intelligence`; CTA "Request Demo" → `index.html#contact`, "Explore Other Solutions" → `index.html#solutions`; footer tagline "Transforming data into intelligence since 2024").
- [ ] **Step 2: Verify** — `grep -c 'usecase"'` → `4`; `grep -c 'spec-col'` → `3`; title/canonical match reference; mojibake clean; links resolve (note related card → real-time-analytics.html).
- [ ] **Step 3: Commit** — `git add predictive-analytics.html && git commit -m "feat(v2): port predictive-analytics to v2 aesthetic"`

---

### Task 6: Port real-time-analytics.html  (NO tech-specs)

**Files:** Replace `real-time-analytics.html`. Content: reference §4.

- [ ] **Step 1:** Replace with skeleton from reference §4 but OMIT the tech-specs `<section>` entirely (this page has none). 3 use-cases; eyebrow `// live monitoring`; use-cases H2 is "Applications"; CTA "Request Demo" → `index.html#contact`, "Explore Solutions" → `index.html#solutions`; footer tagline "Transforming data into intelligence since 2024".
- [ ] **Step 2: Verify** — `grep -c 'usecase"'` → `3`; `grep -c 'spec-col'` → `0` (MUST be zero); `grep -c 'Applications' real-time-analytics.html` ≥1; title/canonical match reference; mojibake clean; links resolve.
- [ ] **Step 3: Commit** — `git add real-time-analytics.html && git commit -m "feat(v2): port real-time-analytics to v2 aesthetic"`

---

### Task 7: Port agent-interoperability.html  (GitHub extras)

**Files:** Replace `agent-interoperability.html`. Content: reference §5.

- [ ] **Step 1:** Replace with skeleton from reference §5. 3 use-cases; tech-specs present; eyebrow `// agent interoperability`; use-cases H2 "Perfect For These Scenarios". In the tech-specs "Open Source" column, after the `<ul>`, add the extra link:
```html
<a class="spec-link btn btn-ghost" href="https://github.com/nickoulos/mcp-ogc" target="_blank" rel="noopener">View mcp-ogc on GitHub</a>
```
The CTA's 2nd button is the GitHub link (NOT "View All Solutions"):
```html
<a class="btn btn-ghost" href="https://github.com/nickoulos/mcp-ogc" target="_blank" rel="noopener">View mcp-ogc on GitHub</a>
```
CTA 1st button: "Request Demo" → `index.html#contact`. Footer tagline "Transforming data into intelligence since 2024".
- [ ] **Step 2: Verify** — `grep -c 'usecase"'` → `3`; `grep -c 'spec-col'` → `3`; `grep -c 'github.com/nickoulos/mcp-ogc' agent-interoperability.html` → `2` (tech-specs link + CTA button); every `github.com` link has `target="_blank"` and `rel="noopener"`: `grep -o 'href="https://github.com[^>]*' agent-interoperability.html`; title/canonical match reference; mojibake clean.
- [ ] **Step 3: Commit** — `git add agent-interoperability.html && git commit -m "feat(v2): port agent-interoperability to v2 aesthetic"`

---

### Task 8: Final cross-page verification + isolation guard

**Files:** none (verification only).

- [ ] **Step 1: Mojibake guard (whole site)** — Run: `grep -rln $'\xc3\xa2\|\xc3\x82' index.html rag-systems.html document-extraction.html predictive-analytics.html real-time-analytics.html agent-interoperability.html css/v2.css js/constellation-v2.js` → expect NO output.

- [ ] **Step 2: SEO preservation** — For each page, confirm `<title>`, `<link rel="canonical">`, and `og:url` match `.superpowers/sdd/page-content-reference.md`. (Spot-check via grep per file.)

- [ ] **Step 3: Link integrity** — For each internal page, run `grep -o 'href="[^"]*\.html[^"]*"' <page> | sort -u` and confirm every referenced `.html` exists in the repo root and nav/footer point to `index.html#...`. Confirm `index.html`'s services rows still link to the 5 pages.

- [ ] **Step 4: Per-page structure** — Confirm each page has exactly one `<h1>`: `for f in rag-systems document-extraction predictive-analytics real-time-analytics agent-interoperability; do echo "$f: $(grep -c '<h1' $f.html)"; done` → each `1`.

- [ ] **Step 5: Isolation guard** — Run: `git diff main --stat -- css/main.css css/components.css css/animations.css css/cosmos.css css/responsive.css js/cursor.js js/main.js js/navigation.js js/particles.js js/scroll-narrative.js js/vendor` → expect NO output (old assets untouched).

- [ ] **Step 6: Report** — No commit. Report results to the user; note that browser-visual confirmation (constellation render, layout, focus order) is the user's manual step. Flag that the old shared CSS/JS remain in the repo (unused by new pages) for a later cleanup decision.
