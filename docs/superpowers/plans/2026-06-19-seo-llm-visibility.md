# SEO + LLM Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve FourSight Lab's visibility in search engines and LLM web searches by adding structured data, fixing homepage meta gaps, adding a visible FAQ, generating the missing OG image, and removing a stale build artifact — with no visible change except the FAQ.

**Architecture:** Pure static-HTML edits. Add invisible `<head>` JSON-LD and meta tags to 6 existing HTML pages; add one visible FAQ `<section>` to the homepage styled with existing CSS classes; create one image asset; update `sitemap.xml`; delete local `dist/` and add a `.gitignore` entry.

**Tech Stack:** Hand-written HTML, schema.org JSON-LD, existing `css/v2.css`. No build step. GitHub Pages (serves `main`, root). Git Bash + PowerShell available.

## Global Constraints

- Canonical domain is `https://foursightlab.com` (NO `www`) — every URL in meta/schema/sitemap must match this, the `CNAME`, `robots.txt`, and `llms.txt`.
- Org email: `support@foursightlab.com`.
- Logo/icon in repo: `icons/favicon.svg` (used as `<link rel="icon">`), plus `icons/lab-icon2.png`.
- The 5 practice areas (exact names): Agentic Knowledge & RAG; Document & Process Automation; Predictive & Decision Intelligence; Live Monitoring & Analytics; Agent Interoperability & Geospatial AI.
- Reuse existing CSS classes only (`panel`, `eyebrow`, `h2`, etc.) — introduce NO new visual language.
- JSON-LD must be valid JSON inside `<script type="application/ld+json">`; ampersands in JSON string VALUES are literal `&` (NOT `&amp;` — that's HTML-attribute escaping, not JSON).
- Do NOT push or merge to `main`. Work stays on the current branch.
- No verbatim visible-text changes except the new FAQ section.

## File Structure

- Modify: `index.html` — homepage meta gaps, JSON-LD (Organization + WebSite + FAQPage), visible FAQ section, Twitter cards.
- Modify: `rag-systems.html`, `document-extraction.html`, `predictive-analytics.html`, `real-time-analytics.html`, `agent-interoperability.html` — Service + Organization + BreadcrumbList JSON-LD, Twitter cards.
- Create: `og-image.jpg` (repo root, 1200×630).
- Modify: `sitemap.xml` — add `<lastmod>`.
- Create: `.gitignore` (or modify if exists) — ignore `dist/`.
- Delete: `dist/` (local untracked folder).

---

### Task 1: Generate the OG image

**Files:**
- Create: `og-image.jpg` (repo root)

**Interfaces:**
- Produces: `https://foursightlab.com/og-image.jpg` — referenced by `og:image`/`twitter:image` on every page (references already exist; this makes them resolve).

- [ ] **Step 1: Generate a 1200×630 branded JPG**

Brand: background `#040912`, accent `#f8b84e`, light text `#f6f7fb`. Wordmark "FourSightlab" + tagline "AI-Powered Data Intelligence".

Try ImageMagick first (Git Bash):

```bash
cd /c/Users/N.KOULOS/Documents/personal/4sight/Website/foursightlab.github.io
magick -size 1200x630 xc:'#040912' \
  -gravity center \
  -fill '#f6f7fb' -font Arial -pointsize 92 -annotate +0-40 'FourSight Lab' \
  -fill '#f8b84e' -font Arial -pointsize 38 -annotate +0+70 'AI-Powered Data Intelligence' \
  og-image.jpg
```

If `magick`/`convert` is unavailable, fall back to PowerShell GDI+:

```powershell
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1200,630
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#040912'))
$light = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#f6f7fb'))
$amber = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#f8b84e'))
$f1 = New-Object System.Drawing.Font 'Arial',64,'Bold'
$f2 = New-Object System.Drawing.Font 'Arial',28
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
$g.DrawString('FourSight Lab',$f1,$light,(New-Object System.Drawing.RectangleF 0,230,1200,100),$fmt)
$g.DrawString('AI-Powered Data Intelligence',$f2,$amber,(New-Object System.Drawing.RectangleF 0,360,1200,60),$fmt)
$g.Dispose()
$bmp.Save("$PWD\og-image.jpg",[System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose()
```

- [ ] **Step 2: Verify the file exists and is a valid image**

Run (Git Bash):
```bash
ls -la og-image.jpg && file og-image.jpg
```
Expected: file present, ~10–80 KB, reported as `JPEG image data, ... 1200 x 630`.

- [ ] **Step 3: Commit**

```bash
git add og-image.jpg
git commit -m "feat(seo): add 1200x630 OG preview image"
```

---

### Task 2: Homepage meta gaps + Twitter cards (`index.html`)

**Files:**
- Modify: `index.html` (the `<head>`, lines ~6–12)

**Interfaces:**
- Consumes: `og-image.jpg` from Task 1.
- Produces: a homepage `<head>` with title, keywords, canonical, OG, and Twitter meta — pattern matched by service pages in Task 4.

- [ ] **Step 1: Replace the title line and insert meta tags**

Find in `index.html`:
```html
<title>FourSight Lab</title>
<meta name="description" content="FourSight Lab builds agentic AI systems proven in production — agentic RAG, document & process automation, predictive intelligence, live monitoring, and open-source MCP servers.">
<link rel="icon" type="image/svg+xml" href="icons/favicon.svg">
```

Replace with:
```html
<title>FourSight Lab | Agentic AI &amp; Data Intelligence Systems</title>
<meta name="description" content="FourSight Lab builds agentic AI systems proven in production — agentic RAG, document & process automation, predictive intelligence, live monitoring, and open-source MCP servers.">
<meta name="keywords" content="agentic AI, data intelligence, agentic RAG, document automation, predictive analytics, live monitoring, MCP servers, AI consultancy">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://foursightlab.com/">
<meta property="og:title" content="FourSight Lab | Agentic AI &amp; Data Intelligence Systems">
<meta property="og:description" content="We build agentic AI systems that read, decide, and act on your data — agentic RAG, document automation, predictive intelligence, live monitoring, and MCP servers. In production, not in theory.">
<meta property="og:image" content="https://foursightlab.com/og-image.jpg">
<meta property="og:url" content="https://foursightlab.com/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="FourSight Lab | Agentic AI &amp; Data Intelligence Systems">
<meta name="twitter:description" content="Agentic AI systems that read, decide, and act on your data — proven in production.">
<meta name="twitter:image" content="https://foursightlab.com/og-image.jpg">
<link rel="icon" type="image/svg+xml" href="icons/favicon.svg">
```

- [ ] **Step 2: Verify no duplicate tags and the file still opens**

Run (Git Bash):
```bash
grep -c 'rel="canonical"' index.html        # expect 1
grep -c 'property="og:title"' index.html     # expect 1
grep -c '<title>' index.html                 # expect 1
```
Expected: each command prints `1`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(seo): add canonical, keywords, OG and Twitter meta to homepage"
```

---

### Task 3: Visible FAQ section + FAQPage schema (`index.html`)

**Files:**
- Modify: `index.html` — insert a `<section id="faq">` immediately before `<section id="contact" class="contact">` (currently line ~121); insert FAQPage JSON-LD in `<head>` (covered in Task 5's homepage `@graph`, but the FAQ text is defined here).

**Interfaces:**
- Produces: visible FAQ Q&A text that MUST match the `FAQPage` JSON-LD verbatim (built in Task 5).

**FAQ content (approved — use verbatim):**

1. **Q: What does FourSight Lab do?**
   A: We build agentic AI and data-intelligence systems that turn raw data into action. Our work spans agentic RAG and knowledge systems, document and process automation, predictive and decision intelligence, live monitoring, and agent interoperability — all proven in production, not just prototypes.
2. **Q: What is agentic AI, and how is it different from a chatbot?**
   A: A chatbot answers questions. An agentic AI system reads your data, decides what to do, and takes action — completing documents, pushing clean data into your ERP, scoring customers, or querying live systems through standards-based connectors. We build systems that act, not just respond.
3. **Q: What is agentic RAG?**
   A: Agentic RAG is retrieval-augmented generation that reasons over many sources to answer in plain language with citations. Think of it as a private search engine over your company's knowledge — built for heavy concurrent usage and kept current by live crawlers feeding the knowledge base.
4. **Q: Do you build custom systems or sell a product?**
   A: We build custom systems tailored to your problem. Our approach is problem-first: we start with your business challenge, then choose the right technology — an agentic RAG pipeline, a predictive model, or a standards-based connector — rather than forcing a one-size-fits-all product.
5. **Q: What data and industries do you work with?**
   A: We work across documents, ERP systems (such as SoftOne), energy and operations data, public APIs, and geospatial data (OGC/INSPIRE). We've shipped work in energy, the public sector, and operations-heavy businesses.
6. **Q: How do we get started?**
   A: Book a 30-minute call. We map where intelligence moves your numbers most and leave you with a plan — no pitch deck. Email support@foursightlab.com.

- [ ] **Step 1: Insert the FAQ section before the contact section**

Find in `index.html`:
```html
<section id="contact" class="contact">
```

Insert immediately BEFORE it:
```html
<section id="faq" class="services">
  <div class="panel">
    <div class="services-head">
      <p class="eyebrow">// frequently asked</p>
      <h2 class="h2">Questions, answered</h2>
      <p class="services-lede">What FourSight Lab does, in plain language.</p>
    </div>
    <div class="rows">
      <div class="row">
        <h3 class="row-title">What does FourSight Lab do?</h3>
        <p class="row-desc">We build agentic AI and data-intelligence systems that turn raw data into action. Our work spans agentic RAG and knowledge systems, document and process automation, predictive and decision intelligence, live monitoring, and agent interoperability — all proven in production, not just prototypes.</p>
      </div>
      <div class="row">
        <h3 class="row-title">What is agentic AI, and how is it different from a chatbot?</h3>
        <p class="row-desc">A chatbot answers questions. An agentic AI system reads your data, decides what to do, and takes action — completing documents, pushing clean data into your ERP, scoring customers, or querying live systems through standards-based connectors. We build systems that act, not just respond.</p>
      </div>
      <div class="row">
        <h3 class="row-title">What is agentic RAG?</h3>
        <p class="row-desc">Agentic RAG is retrieval-augmented generation that reasons over many sources to answer in plain language with citations. Think of it as a private search engine over your company's knowledge — built for heavy concurrent usage and kept current by live crawlers feeding the knowledge base.</p>
      </div>
      <div class="row">
        <h3 class="row-title">Do you build custom systems or sell a product?</h3>
        <p class="row-desc">We build custom systems tailored to your problem. Our approach is problem-first: we start with your business challenge, then choose the right technology — an agentic RAG pipeline, a predictive model, or a standards-based connector — rather than forcing a one-size-fits-all product.</p>
      </div>
      <div class="row">
        <h3 class="row-title">What data and industries do you work with?</h3>
        <p class="row-desc">We work across documents, ERP systems (such as SoftOne), energy and operations data, public APIs, and geospatial data (OGC/INSPIRE). We've shipped work in energy, the public sector, and operations-heavy businesses.</p>
      </div>
      <div class="row">
        <h3 class="row-title">How do we get started?</h3>
        <p class="row-desc">Book a 30-minute call. We map where intelligence moves your numbers most and leave you with a plan — no pitch deck. Email support@foursightlab.com.</p>
      </div>
    </div>
  </div>
</section>

```

- [ ] **Step 2: Add a "FAQ" link to the primary nav (optional polish)**

Find in `index.html`:
```html
    <a href="#work">Case studies</a>
  </nav>
```
Replace with:
```html
    <a href="#work">Case studies</a>
    <a href="#faq">FAQ</a>
  </nav>
```

- [ ] **Step 3: Verify the section renders and anchors resolve**

Run (Git Bash):
```bash
grep -c 'id="faq"' index.html       # expect 1
grep -c 'class="row-title"' index.html   # expect 11 (5 services + 6 FAQ)
```
Expected: `1` then `11`.

Open `index.html` in a browser and confirm: the FAQ section appears above the contact section, styled like the services list; clicking the nav "FAQ" link scrolls to it.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(seo): add visible FAQ section to homepage"
```

---

### Task 4: Twitter cards on the 5 service pages

**Files:**
- Modify: `rag-systems.html`, `document-extraction.html`, `predictive-analytics.html`, `real-time-analytics.html`, `agent-interoperability.html` — add 4 Twitter meta tags after the existing `og:type` line.

**Interfaces:**
- Consumes: `og-image.jpg` (Task 1). Each page already has `og:title`/`og:description`/`og:image`; reuse those values for the Twitter equivalents.

- [ ] **Step 1: Add Twitter cards to each service page**

For EACH file, find the line:
```html
<meta property="og:type" content="website">
```
and insert immediately AFTER it the four lines below, using THAT page's own `og:title` and `og:description` values (copied from the page) and the shared image:

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="PAGE_OG_TITLE_HERE">
<meta name="twitter:description" content="PAGE_OG_DESCRIPTION_HERE">
<meta name="twitter:image" content="https://foursightlab.com/og-image.jpg">
```

Exact `twitter:title` per page (copy from each page's `og:title`):
- `rag-systems.html`: `Agentic Knowledge &amp; RAG | FourSight Lab`
- `document-extraction.html`: `Document &amp; Process Automation | FourSight Lab`
- `predictive-analytics.html`: `Predictive &amp; Decision Intelligence | FourSight Lab`
- `real-time-analytics.html`: `Live Monitoring &amp; Analytics | FourSight Lab`
- `agent-interoperability.html`: `Agent Interoperability &amp; Geospatial AI | FourSight Lab`

For `twitter:description`, copy each page's existing `og:description` content verbatim.

- [ ] **Step 2: Verify each page has exactly one twitter:card**

Run (Git Bash):
```bash
for f in rag-systems document-extraction predictive-analytics real-time-analytics agent-interoperability; do
  echo -n "$f: "; grep -c 'twitter:card' "$f.html"
done
```
Expected: each prints `1`.

- [ ] **Step 3: Commit**

```bash
git add rag-systems.html document-extraction.html predictive-analytics.html real-time-analytics.html agent-interoperability.html
git commit -m "feat(seo): add Twitter card meta to service pages"
```

---

### Task 5: JSON-LD structured data on all pages

**Files:**
- Modify: all 6 HTML pages — insert one `<script type="application/ld+json">` block just before `</head>`.

**Interfaces:**
- Consumes: FAQ text from Task 3 (homepage FAQPage must match verbatim).
- Produces: schema.org graphs read by Google and LLMs. The `Organization` object is reused (same `@id`) across pages.

Shared Organization definition (referenced by `@id` `https://foursightlab.com/#org`).

- [ ] **Step 1: Add Organization + WebSite + FAQPage graph to `index.html`**

Insert immediately before `</head>` in `index.html`:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://foursightlab.com/#org",
      "name": "FourSight Lab",
      "url": "https://foursightlab.com/",
      "email": "support@foursightlab.com",
      "logo": "https://foursightlab.com/icons/lab-icon2.png",
      "description": "FourSight Lab builds agentic AI and data-intelligence systems proven in production — agentic RAG, document and process automation, predictive intelligence, live monitoring, and open-source MCP servers.",
      "knowsAbout": [
        "Agentic RAG",
        "Document and process automation",
        "Predictive and decision intelligence",
        "Live monitoring and analytics",
        "Agent interoperability",
        "Model Context Protocol",
        "Geospatial AI"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://foursightlab.com/#website",
      "url": "https://foursightlab.com/",
      "name": "FourSight Lab",
      "publisher": { "@id": "https://foursightlab.com/#org" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does FourSight Lab do?",
          "acceptedAnswer": { "@type": "Answer", "text": "We build agentic AI and data-intelligence systems that turn raw data into action. Our work spans agentic RAG and knowledge systems, document and process automation, predictive and decision intelligence, live monitoring, and agent interoperability — all proven in production, not just prototypes." }
        },
        {
          "@type": "Question",
          "name": "What is agentic AI, and how is it different from a chatbot?",
          "acceptedAnswer": { "@type": "Answer", "text": "A chatbot answers questions. An agentic AI system reads your data, decides what to do, and takes action — completing documents, pushing clean data into your ERP, scoring customers, or querying live systems through standards-based connectors. We build systems that act, not just respond." }
        },
        {
          "@type": "Question",
          "name": "What is agentic RAG?",
          "acceptedAnswer": { "@type": "Answer", "text": "Agentic RAG is retrieval-augmented generation that reasons over many sources to answer in plain language with citations. Think of it as a private search engine over your company's knowledge — built for heavy concurrent usage and kept current by live crawlers feeding the knowledge base." }
        },
        {
          "@type": "Question",
          "name": "Do you build custom systems or sell a product?",
          "acceptedAnswer": { "@type": "Answer", "text": "We build custom systems tailored to your problem. Our approach is problem-first: we start with your business challenge, then choose the right technology — an agentic RAG pipeline, a predictive model, or a standards-based connector — rather than forcing a one-size-fits-all product." }
        },
        {
          "@type": "Question",
          "name": "What data and industries do you work with?",
          "acceptedAnswer": { "@type": "Answer", "text": "We work across documents, ERP systems (such as SoftOne), energy and operations data, public APIs, and geospatial data (OGC/INSPIRE). We've shipped work in energy, the public sector, and operations-heavy businesses." }
        },
        {
          "@type": "Question",
          "name": "How do we get started?",
          "acceptedAnswer": { "@type": "Answer", "text": "Book a 30-minute call. We map where intelligence moves your numbers most and leave you with a plan — no pitch deck. Email support@foursightlab.com." }
        }
      ]
    }
  ]
}
</script>
```

- [ ] **Step 2: Add Service + Organization + BreadcrumbList graph to each service page**

For each service page, insert before `</head>` a block of this shape, filling the per-page values from the table below:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://foursightlab.com/#org",
      "name": "FourSight Lab",
      "url": "https://foursightlab.com/",
      "email": "support@foursightlab.com",
      "logo": "https://foursightlab.com/icons/lab-icon2.png"
    },
    {
      "@type": "Service",
      "name": "SERVICE_NAME",
      "serviceType": "SERVICE_TYPE",
      "url": "PAGE_URL",
      "description": "SERVICE_DESCRIPTION",
      "provider": { "@id": "https://foursightlab.com/#org" },
      "areaServed": "Worldwide"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://foursightlab.com/" },
        { "@type": "ListItem", "position": 2, "name": "SERVICE_NAME", "item": "PAGE_URL" }
      ]
    }
  ]
}
</script>
```

Per-page values (NOTE: in JSON, write `&` literally, not `&amp;`):

| File | SERVICE_NAME / SERVICE_TYPE | PAGE_URL | SERVICE_DESCRIPTION |
|------|------|------|------|
| `rag-systems.html` | Agentic Knowledge & RAG | https://foursightlab.com/rag-systems.html | Agentic RAG that reasons over thousands of files, returns cited answers, scales to massive concurrent usage, and stays current with live crawlers. |
| `document-extraction.html` | Document & Process Automation | https://foursightlab.com/document-extraction.html | Agents that read, complete, and correct documents — including handwritten text recognition — and push clean data into ERP and public-sector systems via public APIs. |
| `predictive-analytics.html` | Predictive & Decision Intelligence | https://foursightlab.com/predictive-analytics.html | Churn and acquisition models that forecast outcomes and recommend the next best action, extending to demand forecasting, lifetime value, lead scoring, and risk detection. |
| `real-time-analytics.html` | Live Monitoring & Analytics | https://foursightlab.com/real-time-analytics.html | Real-time dashboards that turn streaming energy, operations, and sensor data into action as it arrives, with anomaly and threshold alerting. |
| `agent-interoperability.html` | Agent Interoperability & Geospatial AI | https://foursightlab.com/agent-interoperability.html | Open-source MCP (Model Context Protocol) servers and standards-based connectors that let AI agents query OGC map services (WMS/WFS) and INSPIRE-compliant geospatial data. |

(For both `name` and `serviceType`, use SERVICE_NAME.)

- [ ] **Step 3: Validate every JSON-LD block is valid JSON**

Run (Git Bash) — extracts each block and pipes through a JSON parser:
```bash
cd /c/Users/N.KOULOS/Documents/personal/4sight/Website/foursightlab.github.io
for f in index rag-systems document-extraction predictive-analytics real-time-analytics agent-interoperability; do
  echo -n "$f: "
  sed -n '/<script type="application\/ld+json">/,/<\/script>/p' "$f.html" \
    | sed '1d;$d' \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{JSON.parse(s);console.log("valid JSON")})' \
    || echo "INVALID"
done
```
Expected: each line ends with `valid JSON`. If `node` is unavailable, paste each block into https://validator.schema.org/ instead.

- [ ] **Step 4: Confirm homepage FAQ schema matches visible text**

Run (Git Bash) — both should print 6:
```bash
grep -c 'class="row-title"' index.html   # 11 total (5 services + 6 FAQ) — visual check the 6 FAQ titles
grep -c '"@type": "Question"' index.html  # expect 6
```
Expected: `11` and `6`. Spot-check that one FAQ answer string is identical in the visible `row-desc` and the JSON-LD `text`.

- [ ] **Step 5: Commit**

```bash
git add index.html rag-systems.html document-extraction.html predictive-analytics.html real-time-analytics.html agent-interoperability.html
git commit -m "feat(seo): add JSON-LD structured data (Organization, WebSite, Service, FAQ, breadcrumbs)"
```

---

### Task 6: Sitemap lastmod + dist cleanup

**Files:**
- Modify: `sitemap.xml` — add `<lastmod>` to each `<url>`.
- Create/Modify: `.gitignore` — ignore `dist/`.
- Delete: local `dist/` folder.

**Interfaces:**
- None consumed. Independent housekeeping.

- [ ] **Step 1: Add lastmod to each sitemap URL**

For EACH of the 6 `<url>` entries in `sitemap.xml`, add a `<lastmod>2026-06-19</lastmod>` line directly after the `<loc>` line. Example for the homepage entry:

Find:
```xml
  <url>
    <loc>https://foursightlab.com/</loc>
    <changefreq>weekly</changefreq>
```
Replace with:
```xml
  <url>
    <loc>https://foursightlab.com/</loc>
    <lastmod>2026-06-19</lastmod>
    <changefreq>weekly</changefreq>
```
Do the same for the other 5 entries.

- [ ] **Step 2: Verify lastmod count**

Run (Git Bash):
```bash
grep -c '<lastmod>' sitemap.xml   # expect 6
```
Expected: `6`.

- [ ] **Step 3: Ignore and delete the stale dist build**

```bash
cd /c/Users/N.KOULOS/Documents/personal/4sight/Website/foursightlab.github.io
# Add dist/ to .gitignore (create the file if absent), avoiding a duplicate line
grep -qxF 'dist/' .gitignore 2>/dev/null || echo 'dist/' >> .gitignore
rm -rf dist
ls dist 2>/dev/null && echo "STILL PRESENT" || echo "dist removed"
```
Expected: prints `dist removed`.

- [ ] **Step 4: Commit**

```bash
git add sitemap.xml .gitignore
git commit -m "chore(seo): add sitemap lastmod dates; ignore stale dist build"
```

---

### Task 7: Final verification

**Files:** none modified — verification only.

- [ ] **Step 1: Confirm no page references a missing asset and domain is consistent**

Run (Git Bash):
```bash
cd /c/Users/N.KOULOS/Documents/personal/4sight/Website/foursightlab.github.io
echo "--- og-image referenced and present? ---"
grep -l 'og-image.jpg' *.html | wc -l   # 6 pages reference it
ls og-image.jpg && echo "image present"
echo "--- any stray www. domain in served files? ---"
grep -rn 'www\.foursightlab' *.html sitemap.xml robots.txt llms.txt || echo "no www refs (good)"
echo "--- canonical count across pages ---"
grep -c 'rel="canonical"' *.html
```
Expected: image present; `no www refs (good)`; each HTML page reports `1` canonical.

- [ ] **Step 2: Open the homepage in a browser**

Open `index.html`. Confirm: layout unchanged except the new FAQ section above contact; FAQ styled consistently; nav "FAQ" link scrolls correctly. No console errors.

- [ ] **Step 3: Validate structured data externally (manual)**

Paste the homepage and one service page source into https://validator.schema.org/ (or Google Rich Results Test once live). Confirm Organization, WebSite, FAQPage, Service, and BreadcrumbList are detected with no errors.

- [ ] **Step 4: Note the go-live step (do NOT execute without user approval)**

Changes are on the current branch. GitHub Pages serves `main`. To go live, the branch must be merged to `main` — this also ships the broader redesign and is the user's decision. Surface this; do not merge.

## Self-Review

- **Spec coverage:** JSON-LD (Task 5) ✓; homepage meta gaps (Task 2) ✓; FAQ + schema (Tasks 3, 5) ✓; OG image (Task 1) ✓; sitemap lastmod + dist cleanup (Task 6) ✓; Twitter cards (Tasks 2, 4) ✓; verification (Task 7) ✓; merge-to-main flagged out of scope (Task 7 Step 4) ✓.
- **Placeholder scan:** Per-page Service values are in an explicit table; FAQ text is verbatim; Twitter values reference each page's own existing tags. No TBD/TODO.
- **Type consistency:** Organization `@id` `https://foursightlab.com/#org` is identical across all pages and referenced by `provider`/`publisher`. FAQ answer text in Task 3 (visible) matches Task 5 (schema) verbatim. Domain `foursightlab.com` (no www) throughout.
