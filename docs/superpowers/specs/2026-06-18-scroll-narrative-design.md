# FourSight Lab — Scroll Narrative Design

Date: 2026-06-18

## Goal

Turn the homepage into a cinematic, scroll-driven story. Native scrolling with
smooth inertia; each section is a "scene" that reveals its content in stages as
the user reaches it. Keep all existing content and section order — layer motion
on top of the refined teal/navy/amber design system already in place.

Reference feel: fourpillars.studio, theqream.com, en.protection.gr (smooth glide +
pinned reveals, not full slide-snap scroll-jacking).

## Tech (CDN, no build step)

- **Lenis** — site-wide smooth inertia scrolling.
- **GSAP + ScrollTrigger** — pinning and scroll-progress timelines.
- Both gated behind `prefers-reduced-motion`. When motion is reduced or JS fails,
  every section renders fully visible and static (graceful degradation). JS sets
  the hidden "from" state only when motion is enabled — content is never hidden
  behind JS by default.
- Lenis is bridged to the existing smooth-anchor nav (`scrollToSection`) and the
  scroll-spy active-link logic so navigation keeps working.

## Scenes

1. **Hero** — headline mask-wipe reveal word-by-word; subtitle + CTAs stagger;
   ai-brain background parallax drift; scroll cue at bottom.
2. **Solutions (6) — Orbital System (centerpiece).** The 6 solutions render as
   nodes on 2 concentric orbit rings around a central "Your Data" core. Slow
   continuous orbital drift + core pulse make it alive at rest. Section pins; scroll
   progress drives a master timeline: (a) whole system scales up from a distant
   big-picture view; (b) scrubbed — each node in sequence comes into focus (scales,
   moves forward, others recede/dim) while a **fixed detail panel** swaps in that
   solution's title + description + "Learn More" link; (c) unpins.
   Built with CSS/SVG + GSAP (no new deps).
   Accessibility/fallback: nodes ARE the existing 6 `<a class="solution-card">`
   links (text in DOM, keyboard-focusable, SEO-safe). Reduced-motion / no-JS /
   narrow viewport → falls back to the polished responsive card grid; no pinning,
   no orbit. New file `css/cosmos.css` (`.motion`-gated), `initCosmos()` in
   scroll-narrative.js.
3. **Partners** — two orbit-text lines move on scroll-linked horizontal motion.
4. **How We Work (4 pillars)** — section pins; pillars build one at a time as the
   user scrolls. Signature scene.
5. **Products (2)** — each product pins; copy slides in from the side while the
   visual animates its data (gauge needle sweep, metric count-up, answer resolve),
   tied to scroll rather than autoplay.
6. **Coming Soon** — badge + headline rise; ambient amber glow fades in.
7. **Final CTA** — title scales up subtly on entry; dark section wipes in for
   contrast against the preceding light section.

## Files

- `js/scroll-narrative.js` (new) — all Lenis/GSAP setup, one init function per
  scene, plus a reduced-motion/no-JS guard. Loaded after CDN scripts.
- `css/animations.css` — initial hidden states scoped to a `.motion` class on
  `<html>` so they only apply when motion is active; reduced-motion fallbacks.
- `index.html` — add Lenis + GSAP + ScrollTrigger CDN tags and the new script.
- Existing CSS-keyframe autoplay on product visuals gated so it does not fight GSAP.

## Non-goals

- No copy/content rewrite, no section reordering.
- No framework or styling-library migration.
- Keep prior color/font/accessibility fixes intact.

## Risks & mitigations

- **JS fails / slow CDN** → content defaults visible; motion is additive only.
- **Reduced-motion users** → all timelines skipped; static refined layout.
- **Mobile jank from pinning** → heavy pins (pillars, products) use lighter,
  shorter scrub on small screens or disable pinning below a breakpoint.
