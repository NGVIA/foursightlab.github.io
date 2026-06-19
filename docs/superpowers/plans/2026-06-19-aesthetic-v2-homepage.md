# Aesthetic V2 Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone experimental homepage (`index-v2.html`) that ports the constellation / Gaussian-splat aesthetic from the DC mockup into plain HTML/CSS/JS with real FourSight Lab content, leaving the live site untouched.

**Architecture:** Three additive files — `index-v2.html` (semantic markup), `css/v2.css` (all styling, translating the mockup's inline styles and `style-hover`/`style-focus` pseudo-attributes into real CSS), and `js/constellation-v2.js` (the Three.js background, ported from the DC `<script>` with the React lifecycle wrapper stripped and replaced by plain init/resize/RAF + reduced-motion guard). No existing file is modified.

**Tech Stack:** Plain HTML5, CSS3 (`backdrop-filter`, CSS custom properties), vanilla JS, Three.js r128 (CDN), Google Fonts (Sora, IBM Plex Sans, JetBrains Mono).

## Global Constraints

- Branch: `experiment/aesthetic-v2`. Do NOT modify `index.html` or any existing `css/` / `js/` file.
- Palette: bg `#07090d`, near-accent `#34e0d0`, far-accent `#4d7cff`, text ramp `#e8ebef` / `#aab2bd` / `#9098a4` / `#5b6470`.
- Fonts: Sora (display), IBM Plex Sans (body), JetBrains Mono (mono labels).
- Use proper UTF-8 glyphs: `→`, `↓`, `·` — never the mockup's `â` / `Â` mojibake.
- All copy and links must be the real values listed in this plan (no placeholder service names).
- Email: `info@foursightlab.com`. Footer year: 2026.
- Must include a `prefers-reduced-motion: reduce` fallback: canvas does not animate, all content fully visible.
- No build step; files must work opened directly and on GitHub Pages.

### Real services (name → href → description)

1. Agentic Knowledge & RAG → `rag-systems.html` — "Agentic RAG systems that answer in plain language from thousands of files, built for massive concurrent usage and kept current by live crawlers."
2. Document & Process Automation → `document-extraction.html` — "Agents that read, complete, and correct documents — including handwritten scans — and push clean data into ERP and public-sector systems."
3. Predictive & Decision Intelligence → `predictive-analytics.html` — "Churn and acquisition models that forecast outcomes and recommend the next best action."
4. Live Monitoring & Analytics → `real-time-analytics.html` — "Real-time dashboards that turn streaming energy, operations, and sensor data into action as it arrives."
5. Agent Interoperability & Geospatial AI → `agent-interoperability.html` — "Open-source MCP servers and standards-based connectors that let AI agents query OGC/INSPIRE geospatial data and other real-world systems."

### Real hero copy

- Eyebrow: `// AI-powered data intelligence`
- Heading: **We see what lies behind data**
- Subtitle: "From unseen patterns to autonomous action — we build agentic AI systems that read, decide, and act on your data. In production, not in theory."
- CTAs: "Discuss your data needs →" (→ `#contact`), "See our work" (→ `#work`)

---

## Testing approach

This is static front-end work with no test runner in the repo (`package.json` has no test script). "Tests" here are **explicit manual verification steps** performed in a browser plus a git-diff guard proving existing files are untouched. Each task ends with a concrete check and a commit.

---

### Task 1: Page skeleton, fonts, and reduced-motion guard

**Files:**
- Create: `index-v2.html`
- Create: `css/v2.css` (empty shell with `:root` tokens + base reset only)

**Interfaces:**
- Produces: `index-v2.html` linking `css/v2.css` and (later) `js/constellation-v2.js`; a `<canvas id="fs-canvas">`; CSS custom properties on `:root` (`--bg`, `--near`, `--far`, `--t1`..`--t4`) consumed by all later CSS.

- [ ] **Step 1: Create `index-v2.html` skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FourSight Lab — AI-Powered Data Intelligence</title>
<meta name="description" content="FourSight Lab builds agentic AI systems proven in production — agentic RAG, document & process automation, predictive intelligence, live monitoring, and open-source MCP servers.">
<link rel="icon" type="image/png" href="icons/lab-icon2.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/v2.css">
</head>
<body>
  <canvas id="fs-canvas" aria-hidden="true"></canvas>
  <main id="content"><!-- sections added in later tasks --></main>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
          integrity="sha512-2Lo2oVDxQRTSyTrcAU+v8sxWMnayrUH4f0VlUgKhJgRGdMBe9lzNDsxd0w/B5xtH9wp9D8FK/QxqHb6OYxxhwg=="
          crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="js/constellation-v2.js" defer></script>
</body>
</html>
```

> **SRI hash — verify before committing.** The `integrity` value above is a
> placeholder and must match the actual r128 file or the browser will refuse to run
> it. Get the real hash from cdnjs (the "Copy SRI" button on the three.js r128 asset
> page), or compute it:
> `curl -s https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js | openssl dgst -sha512 -binary | openssl base64 -A`
> then prefix with `sha512-`. In Step 3's browser check, confirm `three.min.js`
> actually loads (Network tab 200, no SRI-mismatch console error) before moving on.

- [ ] **Step 2: Create `css/v2.css` base shell**

```css
:root{
  --bg:#07090d; --near:#34e0d0; --far:#4d7cff;
  --t1:#e8ebef; --t2:#aab2bd; --t3:#9098a4; --t4:#5b6470;
  --panel:rgba(9,12,17,0.52); --border:rgba(255,255,255,.08);
}
*{box-sizing:border-box;}
html,body{margin:0;background:var(--bg);}
body{color:var(--t1);font-family:'IBM Plex Sans',system-ui,sans-serif;overflow-x:hidden;}
::selection{background:var(--near);color:#06120f;}
a{color:inherit;}
#fs-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;display:block;pointer-events:none;}
#content{position:relative;z-index:2;}
@media (prefers-reduced-motion: reduce){
  #fs-canvas{display:none;}
}
```

- [ ] **Step 3: Verify in browser**

Open `index-v2.html`. Expected: dark `#07090d` page, no console errors, Three.js loads (Network tab shows `three.min.js` 200 with **no SRI-mismatch error** — fix the `integrity` hash per the note above if it fails), empty content area. (The canvas stays blank — its script comes in Task 5.)

- [ ] **Step 4: Verify existing files untouched**

Run: `git status --porcelain`
Expected: only `index-v2.html` and `css/v2.css` listed as new (`??`). No existing file modified.

- [ ] **Step 5: Commit**

```bash
git add index-v2.html css/v2.css
git commit -m "feat(v2): page skeleton, font links, reduced-motion canvas guard"
```

---

### Task 2: Fixed nav and hero section

**Files:**
- Modify: `index-v2.html` (insert nav + hero inside `<main id="content">`)
- Modify: `css/v2.css` (append nav + hero styles)

**Interfaces:**
- Consumes: `:root` tokens from Task 1.
- Produces: `<header>` nav with anchors `#services`, `#work`, `#contact`; hero `<section>` with id `home`; CTA anchors used by later sections' ids.

- [ ] **Step 1: Insert nav + hero markup** inside `<main id="content">`:

```html
<header class="nav">
  <a class="brand" href="#home" aria-label="FourSight Lab home">
    <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
    <span class="brand-name">FourSight&nbsp;Lab</span>
  </a>
  <nav class="nav-links" aria-label="Primary">
    <a href="#services">Services</a>
    <a href="#work">Case studies</a>
    <a href="#contact">Contact</a>
  </nav>
  <a class="btn btn-primary nav-cta" href="#contact">Book a call</a>
</header>

<section id="home" class="hero">
  <p class="eyebrow">// AI-powered data intelligence</p>
  <h1 class="hero-title">We see what lies behind data</h1>
  <p class="hero-sub">From unseen patterns to autonomous action — we build agentic AI systems that read, decide, and act on your data. In production, not in theory.</p>
  <div class="hero-cta">
    <a class="btn btn-primary" href="#contact">Discuss your data needs →</a>
    <a class="btn btn-ghost" href="#work">See our work</a>
  </div>
  <a class="scroll-cue" href="#services" aria-label="Scroll to services">
    <span>SCROLL</span><span class="cue-arrow" aria-hidden="true">↓</span>
  </a>
</section>
```

- [ ] **Step 2: Append nav + hero CSS** to `css/v2.css`:

```css
.nav{position:fixed;top:0;left:0;width:100%;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:20px clamp(24px,5vw,72px);background:rgba(7,9,13,.55);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);}
.brand{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--t1);}
.brand-mark{display:grid;grid-template-columns:repeat(2,8px);grid-template-rows:repeat(2,8px);gap:3px;}
.brand-mark i{background:var(--near);}
.brand-mark i:nth-child(2),.brand-mark i:nth-child(3){opacity:.4;}
.brand-name{font-family:'Sora',sans-serif;font-weight:700;font-size:17px;letter-spacing:-.01em;}
.nav-links{display:flex;gap:34px;font-size:14px;}
.nav-links a{color:var(--t3);text-decoration:none;transition:color .2s;}
.nav-links a:hover,.nav-links a:focus-visible{color:var(--t1);}
.nav-cta{font-size:14px;}
.btn{font-family:'Sora',sans-serif;font-weight:600;border-radius:8px;padding:14px 26px;cursor:pointer;text-decoration:none;display:inline-block;transition:background .2s,border-color .2s;}
.nav-cta.btn{padding:10px 18px;border-radius:6px;}
.btn-primary{color:#06120f;background:var(--near);border:none;}
.btn-primary:hover,.btn-primary:focus-visible{background:#5fe9db;}
.btn-ghost{color:var(--t1);background:rgba(255,255,255,.04);border:1px solid #2a3038;backdrop-filter:blur(4px);}
.btn-ghost:hover,.btn-ghost:focus-visible{border-color:var(--near);}
.hero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px clamp(24px,6vw,80px) 80px;}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--near);margin:0 0 30px;}
.hero-title{font-family:'Sora',sans-serif;font-size:clamp(44px,7.4vw,98px);line-height:.98;letter-spacing:-.04em;font-weight:800;margin:0 0 26px;max-width:16ch;text-wrap:balance;text-shadow:0 4px 40px rgba(7,9,13,.8);}
.hero-sub{font-size:clamp(16px,1.6vw,20px);line-height:1.6;color:var(--t2);margin:0 0 38px;max-width:620px;}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;}
.scroll-cue{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--t4);text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.16em;}
.cue-arrow{animation:fsBob 1.8s ease-in-out infinite;font-size:16px;}
@keyframes fsBob{0%,100%{transform:translateY(0);}50%{transform:translateY(7px);}}
@media (prefers-reduced-motion: reduce){.cue-arrow{animation:none;}}
```

- [ ] **Step 3: Verify in browser**

Open `index-v2.html`. Expected: fixed blurred nav with grid-dot logo + "FourSight Lab", three nav links, teal "Book a call" button; centered hero with teal eyebrow, large Sora heading, subtitle, two CTAs, bouncing scroll cue. Hover the links/buttons → color/background changes. Nav links smooth-jump (default anchor jump is fine).

- [ ] **Step 4: Commit**

```bash
git add index-v2.html css/v2.css
git commit -m "feat(v2): fixed nav and hero section"
```

---

### Task 3: Intro statement and services list

**Files:**
- Modify: `index-v2.html` (append intro + services sections)
- Modify: `css/v2.css` (append intro + services styles)

**Interfaces:**
- Consumes: `.btn`, tokens, section ids from earlier tasks.
- Produces: `<section id="services">` containing 5 anchor rows linking to the real product pages.

- [ ] **Step 1: Append intro + services markup** inside `<main>`, after the hero:

```html
<section class="intro">
  <p class="intro-text">Most companies are <span class="muted">drowning in data</span> and starved of <span class="accent">decisions.</span> We close that gap.</p>
</section>

<section id="services" class="services">
  <div class="panel">
    <div class="services-head">
      <p class="eyebrow">// what we do</p>
      <h2 class="h2">The full stack of data &amp; AI capability</h2>
      <p class="services-lede">Five practice areas, proven in production — they connect, compound, and ship together.</p>
    </div>
    <div class="rows">
      <a class="row" href="rag-systems.html">
        <span class="row-num">01</span>
        <h3 class="row-title">Agentic Knowledge &amp; RAG</h3>
        <p class="row-desc">Agentic RAG systems that answer in plain language from thousands of files, built for massive concurrent usage and kept current by live crawlers.</p>
      </a>
      <a class="row" href="document-extraction.html">
        <span class="row-num">02</span>
        <h3 class="row-title">Document &amp; Process Automation</h3>
        <p class="row-desc">Agents that read, complete, and correct documents — including handwritten scans — and push clean data into ERP and public-sector systems.</p>
      </a>
      <a class="row" href="predictive-analytics.html">
        <span class="row-num">03</span>
        <h3 class="row-title">Predictive &amp; Decision Intelligence</h3>
        <p class="row-desc">Churn and acquisition models that forecast outcomes and recommend the next best action.</p>
      </a>
      <a class="row" href="real-time-analytics.html">
        <span class="row-num">04</span>
        <h3 class="row-title">Live Monitoring &amp; Analytics</h3>
        <p class="row-desc">Real-time dashboards that turn streaming energy, operations, and sensor data into action as it arrives.</p>
      </a>
      <a class="row" href="agent-interoperability.html">
        <span class="row-num">05</span>
        <h3 class="row-title">Agent Interoperability &amp; Geospatial AI</h3>
        <p class="row-desc">Open-source MCP servers and standards-based connectors that let AI agents query OGC/INSPIRE geospatial data and other real-world systems.</p>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append intro + services CSS**:

```css
.intro{padding:clamp(70px,9vw,130px) clamp(24px,6vw,80px);}
.intro-text{max-width:20ch;margin:0 auto;font-family:'Sora',sans-serif;font-weight:500;font-size:clamp(26px,3.4vw,46px);line-height:1.25;letter-spacing:-.02em;text-shadow:0 2px 24px rgba(7,9,13,.85);}
.intro-text .muted{color:var(--t4);}
.intro-text .accent{color:var(--near);}
.services{padding:clamp(40px,5vw,70px) clamp(24px,6vw,80px) clamp(80px,9vw,120px);}
.panel{max-width:1180px;margin:0 auto;background:var(--panel);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:24px;padding:clamp(30px,4vw,56px);}
.services-head{margin-bottom:30px;}
.h2{font-family:'Sora',sans-serif;font-size:clamp(30px,4vw,52px);font-weight:700;letter-spacing:-.03em;margin:0;max-width:18ch;}
.services-lede{font-size:15px;color:var(--t3);margin:16px 0 0;max-width:46ch;}
.rows{border-top:1px solid rgba(255,255,255,.09);}
.row{display:grid;grid-template-columns:66px 1fr 1.5fr;gap:clamp(14px,2.6vw,38px);padding:28px 4px;border-bottom:1px solid rgba(255,255,255,.09);align-items:center;text-decoration:none;color:inherit;transition:background .2s;}
.row:hover,.row:focus-visible{background:rgba(52,224,208,.05);}
.row-num{font-family:'JetBrains Mono',monospace;color:var(--t4);font-size:11px;text-align:center;}
.row-title{font-family:'Sora',sans-serif;font-size:clamp(20px,2.2vw,26px);font-weight:600;margin:0;letter-spacing:-.01em;}
.row-desc{font-size:15px;line-height:1.6;color:var(--t3);margin:0;}
@media (max-width:720px){
  .row{grid-template-columns:40px 1fr;}
  .row-desc{grid-column:1 / -1;}
}
```

- [ ] **Step 3: Verify in browser**

Open `index-v2.html`, scroll down. Expected: large intro sentence with grey "drowning in data" and teal "decisions."; glass services panel with 5 numbered rows. Hover a row → faint teal wash. Click each row → navigates to the matching page (rag-systems.html, document-extraction.html, predictive-analytics.html, real-time-analytics.html, agent-interoperability.html). On a <720px viewport the rows reflow to two columns with the description on its own line.

- [ ] **Step 4: Commit**

```bash
git add index-v2.html css/v2.css
git commit -m "feat(v2): intro statement and real services list"
```

---

### Task 4: Case studies, contact, footer

**Files:**
- Modify: `index-v2.html` (append work + contact + footer)
- Modify: `css/v2.css` (append styles)

**Interfaces:**
- Consumes: `.panel`, `.btn`, `.eyebrow`, `.h2`, tokens.
- Produces: `<section id="work">`, `<section id="contact">`, `<footer>` — completing all nav anchor targets.

- [ ] **Step 1: Append markup** inside `<main>`, after services:

```html
<section id="work" class="work">
  <div class="work-head">
    <p class="eyebrow">// case studies</p>
    <h2 class="h2">Shipped &amp; measured</h2>
    <p class="work-note">Illustrative outcomes — representative of the kind of impact we build toward.</p>
  </div>
  <div class="cards">
    <article class="card">
      <div class="stat">63%</div>
      <div class="stat-label">faster fraud review</div>
      <p class="card-body">A RAG triage assistant paired with a risk model cut a fintech's manual review queue and surfaced the cases that actually mattered.</p>
      <span class="card-tag">FINTECH · RISK OPS</span>
    </article>
    <article class="card">
      <div class="stat">+28%</div>
      <div class="stat-label">forecast accuracy</div>
      <p class="card-body">A demand-forecasting pipeline let a retailer cut overstock and stop guessing on seasonal buys across 400+ SKUs.</p>
      <span class="card-tag">RETAIL · SUPPLY CHAIN</span>
    </article>
    <article class="card">
      <div class="stat">11h</div>
      <div class="stat-label">saved / analyst / week</div>
      <p class="card-body">Automated reporting freed a B2B SaaS analytics team from spreadsheet wrangling to focus on the decisions behind the numbers.</p>
      <span class="card-tag">SAAS · ANALYTICS</span>
    </article>
  </div>
</section>

<section id="contact" class="contact">
  <div class="contact-glow" aria-hidden="true"></div>
  <div class="contact-card">
    <h2 class="contact-title">Let's find your foursight.</h2>
    <p class="contact-sub">A 30-minute call to map where intelligence moves your numbers most. No pitch deck — just a plan.</p>
    <a class="btn btn-primary" href="mailto:info@foursightlab.com">Book a call →</a>
    <p class="contact-email"><a href="mailto:info@foursightlab.com">info@foursightlab.com</a></p>
  </div>
</section>

<footer class="footer">
  <span>© 2026 FourSight Lab — AI-Powered Data Intelligence</span>
</footer>
```

- [ ] **Step 2: Append CSS**:

```css
.work{padding:clamp(40px,5vw,70px) clamp(24px,6vw,80px) clamp(80px,9vw,120px);max-width:1180px;margin:0 auto;}
.work-head{margin-bottom:40px;}
.work-note{font-size:14px;color:var(--t4);margin:14px 0 0;}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.card{border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:32px;background:rgba(11,15,21,.55);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.stat{font-family:'Sora',sans-serif;font-size:clamp(40px,5vw,58px);font-weight:800;color:var(--near);line-height:1;letter-spacing:-.03em;}
.stat-label{font-size:13px;color:var(--t3);margin:10px 0 20px;}
.card-body{font-size:14px;line-height:1.65;color:#c2c8d0;margin:0 0 18px;}
.card-tag{font-family:'JetBrains Mono',monospace;font-size:12px;color:#6b7280;letter-spacing:.06em;}
.contact{position:relative;padding:clamp(90px,11vw,150px) clamp(24px,6vw,80px);text-align:center;overflow:hidden;}
.contact-glow{position:absolute;bottom:-30%;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse at center,rgba(52,224,208,.14),transparent 65%);z-index:0;}
.contact-card{position:relative;z-index:1;max-width:560px;margin:0 auto;background:rgba(9,12,17,.5);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:24px;padding:clamp(36px,5vw,60px);}
.contact-title{font-family:'Sora',sans-serif;font-size:clamp(34px,5.4vw,64px);font-weight:800;letter-spacing:-.035em;margin:0 0 18px;line-height:1.02;}
.contact-sub{font-size:clamp(16px,1.6vw,19px);line-height:1.65;color:var(--t2);margin:0 auto 32px;max-width:440px;}
.contact-email{margin:22px 0 0;font-family:'JetBrains Mono',monospace;font-size:14px;}
.contact-email a{color:var(--t3);text-decoration:none;}
.contact-email a:hover,.contact-email a:focus-visible{color:var(--near);}
.footer{padding:28px clamp(24px,6vw,80px);background:rgba(7,9,13,.85);backdrop-filter:blur(8px);border-top:1px solid rgba(255,255,255,.06);color:var(--t4);font-size:13px;text-align:center;}
@media (max-width:860px){.cards{grid-template-columns:1fr;}}
```

- [ ] **Step 3: Verify in browser**

Open `index-v2.html`, scroll to bottom. Expected: 3 glass metric cards (stack to 1 column under 860px) with an "Illustrative outcomes" note; teal-glow contact card with heading, subtitle, "Book a call →" opening a `mailto:info@foursightlab.com`, and the email shown below; footer line. Nav "Case studies" and "Contact" links now jump to these sections.

- [ ] **Step 4: Commit**

```bash
git add index-v2.html css/v2.css
git commit -m "feat(v2): case studies, contact, footer"
```

---

### Task 5: Three.js constellation background

**Files:**
- Create: `js/constellation-v2.js`

**Interfaces:**
- Consumes: global `THREE` (from the CDN `<script>` in Task 1), `<canvas id="fs-canvas">`.
- Produces: a self-running background animation; no exports.

- [ ] **Step 1: Create `js/constellation-v2.js`**

Port the DC mockup's `_init` body to a plain IIFE. Strip the React class/lifecycle; keep the Three.js logic verbatim (sphere fibonacci distribution, inflated dispersal state, fly-in start positions, Gaussian-splat ShaderMaterial, nearest-neighbor line segments, scroll/mouse/RAF loop). Use these fixed accent colors and density: `A='#34e0d0'`, `B='#4d7cff'`, `N=2200`, `showLines=true`.

```js
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // honor reduced-motion: leave canvas blank, content fully visible

  var mouse = { x: 0, y: 0 }, scrollProg = 0;
  window.addEventListener('mousemove', function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProg = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }, { passive: true });

  function waitThree() {
    if (window.THREE) init();
    else setTimeout(waitThree, 60);
  }

  function init() {
    var THREE = window.THREE;
    var canvas = document.getElementById('fs-canvas');
    if (!canvas) return;

    var A = '#34e0d0', B = '#4d7cff', N = 2200, showLines = true;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.6);
    var group = new THREE.Group();
    scene.add(group);

    var R = 2.7, gA = Math.PI * (3 - Math.sqrt(5));
    var sph = new Float32Array(N * 3), exp = new Float32Array(N * 3),
        start = new Float32Array(N * 3), cur = new Float32Array(N * 3),
        col = new Float32Array(N * 3), siz = new Float32Array(N);
    var cA = new THREE.Color(A), cB = new THREE.Color(B);
    var INF = 3.2;

    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1 || 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = gA * i;
      sph[i*3] = Math.cos(th) * r * R; sph[i*3+1] = y * R; sph[i*3+2] = Math.sin(th) * r * R;
      exp[i*3]   = sph[i*3]   * INF        + (Math.random()-.5) * 0.7;
      exp[i*3+1] = sph[i*3+1] * INF        + (Math.random()-.5) * 0.7;
      exp[i*3+2] = sph[i*3+2] * INF * 0.45 + (Math.random()-.5) * 0.7;
      var rr = 6 + Math.random()*5, u = Math.random()*2-1, ph = Math.random()*Math.PI*2, rs = Math.sqrt(1-u*u);
      start[i*3] = Math.cos(ph)*rs*rr; start[i*3+1] = u*rr; start[i*3+2] = Math.sin(ph)*rs*rr;
      cur[i*3] = start[i*3]; cur[i*3+1] = start[i*3+1]; cur[i*3+2] = start[i*3+2];
      var tc = (y + 1) / 2;
      var c = cB.clone().lerp(cA, tc);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
      siz[i] = (Math.random() < 0.16) ? (0.34 + Math.random() * 0.32) : (0.08 + Math.random() * 0.09);
    }

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(cur, 3));
    pGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
    var pMat = new THREE.ShaderMaterial({
      uniforms: { uSizeScale: { value: renderer.getPixelRatio() }, uOpacity: { value: 0.9 } },
      vertexShader: [
        'attribute float aSize;','attribute vec3 aColor;','uniform float uSizeScale;','varying vec3 vColor;',
        'void main() {','  vColor = aColor;','  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * uSizeScale * (300.0 / -mv.z);','  gl_Position = projectionMatrix * mv;','}'
      ].join('\n'),
      fragmentShader: [
        'precision mediump float;','uniform float uOpacity;','varying vec3 vColor;',
        'void main() {','  vec2 d = gl_PointCoord - vec2(0.5);','  float r2 = dot(d, d) * 4.0;',
        '  float a = exp(-r2 * 3.0);','  if (a < 0.01) discard;','  gl_FragColor = vec4(vColor, a * uOpacity);','}'
      ].join('\n'),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    });
    var points = new THREE.Points(pGeo, pMat);
    group.add(points);

    var lineSeg = null, linePos = null, pairs = null;
    if (showLines) {
      pairs = [];
      for (var a = 0; a < N; a++) {
        var b1 = -1, d1 = 1e9, b2 = -1, d2 = 1e9;
        for (var k = 0; k < N; k++) {
          if (k === a) continue;
          var dx = sph[a*3]-sph[k*3], dy = sph[a*3+1]-sph[k*3+1], dz = sph[a*3+2]-sph[k*3+2];
          var d = dx*dx + dy*dy + dz*dz;
          if (d < d1) { d2=d1; b2=b1; d1=d; b1=k; }
          else if (d < d2) { d2=d; b2=k; }
        }
        if (b1 > a) pairs.push(a, b1);
        if (b2 > a) pairs.push(a, b2);
      }
      linePos = new Float32Array(pairs.length * 3);
      var lcol = new Float32Array(pairs.length * 3);
      for (var m = 0; m < pairs.length; m++) {
        var idx = pairs[m];
        lcol[m*3] = col[idx*3]; lcol[m*3+1] = col[idx*3+1]; lcol[m*3+2] = col[idx*3+2];
      }
      var lGeo = new THREE.BufferGeometry();
      lGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
      lGeo.setAttribute('color', new THREE.BufferAttribute(lcol, 3));
      var lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false });
      lineSeg = new THREE.LineSegments(lGeo, lMat);
      group.add(lineSeg);
    }

    var t0 = performance.now();
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var easeIO = function (t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; };

    function animate() {
      var now = performance.now();
      var tf = ease(Math.min(1, (now - t0) / 2800));
      var mp = easeIO(scrollProg || 0);
      for (var i = 0; i < N; i++) {
        var sx = sph[i*3]   + (exp[i*3]   - sph[i*3])   * mp;
        var sy = sph[i*3+1] + (exp[i*3+1] - sph[i*3+1]) * mp;
        var sz = sph[i*3+2] + (exp[i*3+2] - sph[i*3+2]) * mp;
        cur[i*3]   = start[i*3]   + (sx - start[i*3])   * tf;
        cur[i*3+1] = start[i*3+1] + (sy - start[i*3+1]) * tf;
        cur[i*3+2] = start[i*3+2] + (sz - start[i*3+2]) * tf;
      }
      pGeo.attributes.position.needsUpdate = true;
      if (lineSeg) {
        for (var m2 = 0; m2 < pairs.length; m2++) {
          var idx2 = pairs[m2];
          linePos[m2*3] = cur[idx2*3]; linePos[m2*3+1] = cur[idx2*3+1]; linePos[m2*3+2] = cur[idx2*3+2];
        }
        lineSeg.geometry.attributes.position.needsUpdate = true;
        lineSeg.material.opacity = 0.13 - mp * 0.07;
      }
      pMat.uniforms.uSizeScale.value = renderer.getPixelRatio() * (1.0 + Math.sin(now * 0.0015) * 0.06 + mp * 0.4);
      group.rotation.y = (now - t0) * 0.00006 + (scrollProg || 0) * 1.4;
      group.rotation.x = (mouse.y || 0) * 0.26 + (1 - tf) * 0.5 + Math.sin(now * 0.0003) * 0.04;
      camera.position.x += ((mouse.x || 0) * 0.9 - camera.position.x) * 0.05;
      camera.position.y += (-(mouse.y || 0) * 0.5 - camera.position.y) * 0.05;
      camera.position.z = 6.6 - mp * 0.6;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    window.addEventListener('resize', function () {
      var ww = canvas.clientWidth || window.innerWidth;
      var hh = canvas.clientHeight || window.innerHeight;
      camera.aspect = ww / hh;
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh, false);
    });
  }

  waitThree();
})();
```

- [ ] **Step 2: Verify in browser**

Open `index-v2.html`. Expected: particles fly in from the edges and settle into a glowing teal/blue sphere-constellation with faint connection lines (~2.8s form-up). Moving the mouse parallax-tilts the field; scrolling disperses/inflates the cloud and fades the lines. No console errors. Resize the window → canvas stays full-viewport, no stretching.

- [ ] **Step 3: Verify reduced-motion**

In browser devtools, emulate `prefers-reduced-motion: reduce` (or set OS setting), reload. Expected: canvas is blank (CSS `display:none` from Task 1), all sections fully visible and readable, no WebGL work, no errors.

- [ ] **Step 4: Commit**

```bash
git add js/constellation-v2.js
git commit -m "feat(v2): Three.js Gaussian-splat constellation background"
```

---

### Task 6: Final verification and isolation guard

**Files:** none (verification only)

- [ ] **Step 1: Full walkthrough**

Open `index-v2.html`. Scroll top→bottom. Confirm: nav, hero, intro, 5 service rows, 3 case cards, contact, footer all render; fonts are Sora/IBM Plex/JetBrains Mono (not fallback serif); no mojibake characters anywhere (search the rendered page for `â`/`Â` — none).

- [ ] **Step 2: Link check**

Click each of the 5 service rows and confirm each opens the correct page. Use browser back between each.

- [ ] **Step 3: Keyboard/focus check**

Tab through the page. Expected: every link/button shows a visible focus state (`:focus-visible` styling); order is logical.

- [ ] **Step 4: Isolation guard**

Run: `git diff main --stat -- index.html css/animations.css css/components.css css/cosmos.css css/main.css css/responsive.css js/`
Expected: **no output** (zero changes to any existing site asset).

Run: `git log --oneline main..experiment/aesthetic-v2`
Expected: the spec commit + the 5 feature commits, nothing touching live files.

- [ ] **Step 5: Final confirmation**

No commit needed (verification task). Report results to the user with a note that the branch is ready to preview by opening `index-v2.html`.
