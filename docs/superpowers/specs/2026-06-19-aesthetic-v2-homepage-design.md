# Experimental Homepage — Aesthetic V2

**Date:** 2026-06-19
**Branch:** `experiment/aesthetic-v2`
**Status:** Approved design, ready for implementation plan

## Goal

Experiment with a completely different visual aesthetic for the FourSight Lab
homepage on an isolated branch, without touching the live site. Port the
"constellation / Gaussian-splat" design from a DC-format mockup
(`FourSight Lab.dc (1).html`) into plain HTML/CSS/JS, populated with the real
FourSight Lab content.

If the experiment is liked, promoting it later is a trivial rename
(`index-v2.html` → `index.html`). If not, the branch is thrown away with zero
impact on `main`.

## Scope

- **In scope:** A single new homepage only.
- **Out of scope:** The internal product pages (rag-systems, document-extraction,
  predictive-analytics, real-time-analytics, agent-interoperability). They stay
  as they are. No shared design system extraction yet.
- **Untouched:** The existing `index.html` and all existing `css/`, `js/` assets
  remain exactly as on `main`.

## Format Decision

The mockup is in **DC format** (a custom React-like runtime driven by
`support.js`, using `<x-dc>`, `<helmet>`, and `style-hover` attributes). The
live site is **plain static HTML/CSS/JS** served directly by GitHub Pages.

We port to plain HTML/CSS/JS. The `support.js` runtime, the `<x-dc>` wrapper,
and the `style-hover`/`style-focus` pseudo-attributes are NOT carried over —
they are translated to standard CSS `:hover`/`:focus` rules. The Three.js
background script is framework-agnostic and is ported nearly verbatim (only the
React lifecycle wrapper is stripped).

## File Structure

All new files are additive and self-contained:

```
index-v2.html              ← the new homepage (open this to preview)
css/v2.css                 ← all styling (inline styles → real CSS)
js/constellation-v2.js     ← Three.js Gaussian-splat background (DC <script> ported)
```

Rationale:
- Separate `index-v2.html` (not overwriting `index.html`) lets both versions be
  compared side-by-side and keeps the live site unaffected.
- Splitting CSS/JS out of the inline blob matches the existing project structure,
  makes real `:hover`/`:focus` states possible, and is far easier to iterate on.

## Aesthetic (faithful to the mockup)

- **Palette:** background `#07090d`, near-accent (teal) `#34e0d0`, far-accent
  (blue) `#4d7cff`, grey text ramp (`#e8ebef` / `#aab2bd` / `#9098a4` / `#5b6470`).
- **Fonts (Google Fonts):** Sora (display headings), IBM Plex Sans (body),
  JetBrains Mono (mono labels / `// section` tags).
- **Selection color:** teal background, dark text.
- **Background canvas:** a fixed full-viewport Three.js scene. Particles fly in
  from random positions, form an inflated sphere/constellation, and disperse
  outward as the user scrolls. Includes mouse parallax, slow auto-rotation,
  nearest-neighbor connection lines that fade as the web stretches, and a
  Gaussian-splat point shader. Ported from the DC `<script>` body.
- **Glassmorphism:** sections and cards use `backdrop-filter: blur(...)` over
  semi-transparent dark panels with subtle white borders.
- **Layout sections:** fixed nav, full-height hero, floating intro statement,
  services list (numbered rows), case-study metric cards, contact card, footer.

## Content (real FourSight Lab content)

| Section | Content |
|---|---|
| Nav | FourSight Lab logo (grid-dot mark + wordmark); links: Services, Case studies, Contact; "Book a call" button → `#contact` |
| Hero | Eyebrow `// AI-powered data intelligence`; heading **"We see what lies behind data"**; subtitle from the live hero copy; CTAs "Discuss your data needs →" and "See our work" |
| Services | The **5 real services**, each a numbered row linking to its existing page |
| Case studies | 3 metric cards (illustrative placeholders, see note) |
| Contact | Heading "Let's find your foursight."; real email `info@foursightlab.com`; book-a-call CTA |
| Footer | © 2026 FourSight Lab — AI-Powered Data Intelligence |

### Real services and their links

1. **Agentic Knowledge & RAG** → `rag-systems.html` — "Agentic RAG systems that
   answer in plain language from thousands of files, built for massive concurrent
   usage and kept current by live crawlers."
2. **Document & Process Automation** → `document-extraction.html` — "Agents that
   read, complete, and correct documents — including handwritten scans — and push
   clean data into ERP and public-sector systems."
3. **Predictive & Decision Intelligence** → `predictive-analytics.html` — "Churn
   and acquisition models that forecast outcomes and recommend the next best action."
4. **Live Monitoring & Analytics** → `real-time-analytics.html` — "Real-time
   dashboards that turn streaming energy, operations, and sensor data into action
   as it arrives."
5. **Agent Interoperability & Geospatial AI** → `agent-interoperability.html` —
   "Open-source MCP servers and standards-based connectors that let AI agents
   query OGC/INSPIRE geospatial data and other real-world systems."

### Case-study metrics — note

The metrics in the mockup (63% faster fraud review, +28% forecast accuracy,
11h saved/analyst/week) are invented. They are kept as **styled visual
placeholders** for the experiment and must NOT be promoted to the live site
without real, verifiable numbers. This is acknowledged and accepted for the
branch.

## Deliberately dropped / fixed vs. the mockup

- Drop the Cloudflare email-protection obfuscation, `support.js`, and the
  `<x-dc>`/`<helmet>` wrapper.
- Fix the mojibake (broken UTF-8 `â` / `Â` arrows and bullets) → proper `→`,
  `↓`, `·`.
- Add real `:hover` / `:focus` states (the DC `style-hover`/`style-focus`
  attributes have no plain-HTML equivalent and are translated to CSS).
- Accessibility: semantic landmarks, visible focus states, and a
  `prefers-reduced-motion` fallback that disables the canvas animation and
  renders all content fully visible.

## Three.js loading

The mockup loads Three.js r128 from a CDN (cdnjs). The branch keeps the CDN
load for simplicity (the existing site already self-hosts its own vendor libs
under `js/vendor/`, but the experiment does not need to). If the experiment is
promoted, self-hosting Three.js would be a follow-up.

## Success criteria

- `index-v2.html` opens directly (file:// or GitHub Pages) and renders the new
  aesthetic with the animated background.
- All 5 service rows link to the correct existing pages.
- Hover/focus states work; keyboard focus is visible.
- With `prefers-reduced-motion: reduce`, the canvas does not animate and all
  content is visible and readable.
- `index.html` and all existing pages are byte-for-byte unchanged.
- No console errors on load.

## Testing

- Manual: open `index-v2.html` in a browser, scroll through all sections,
  verify the canvas forms/disperses, verify mouse parallax, click each service
  link, tab through interactive elements.
- Reduced-motion: toggle OS/browser reduced-motion and confirm the fallback.
- Diff check: `git diff main -- index.html css/ js/` (excluding new v2 files)
  shows no changes to existing assets.
