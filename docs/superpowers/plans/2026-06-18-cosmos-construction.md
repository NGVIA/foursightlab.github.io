# Cosmos Construction-on-Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dead intro-scroll in the Solutions orbital scene with a scroll-driven construction (core → rings → nodes), then run the existing per-node walkthrough unchanged.

**Architecture:** All work lives in `initCosmos()` in `js/scroll-narrative.js` plus a small CSS change in `css/cosmos.css`. The construction is driven imperatively off `ScrollTrigger`'s `self.progress` each `onUpdate` frame (not one-shot tweens), so scrolling back up deconstructs the system for free. The total pinned scroll range is unchanged; the former 12% dead-zoom slice becomes a 28% construction slice with the rest driving the existing focus walkthrough.

**Tech Stack:** Vanilla JS (IIFE, ES5 style — `var`, function expressions), GSAP + ScrollTrigger + Lenis (loaded from CDN), plain CSS custom properties. No build step. Static site opened directly in a browser.

## Global Constraints

- Motion code runs ONLY under `html.motion` + GSAP/ScrollTrigger/Lenis present + viewport ≥ 900px. All three guards already exist at the top of `initCosmos`; do not weaken them.
- The `.solutions-grid` card layout is the source of truth and the no-JS / reduced-motion / narrow-viewport fallback. Do NOT change it, the `< 900px` path, or any base CSS that affects it.
- `.cosmos-node` CSS `--reveal` MUST default to `1` so the static path (where JS never sets it) renders fully visible.
- Match existing code style: ES5 (`var`, no arrow functions, no template-literal-free is fine but stay consistent with the file), 2-space indent, comments explaining *why*.
- No new dependencies, no new files, no content/copy changes, no section reordering.
- Manual verification only — this is scroll-driven visual animation with no test harness. Each task ends with a browser check in the running site.

---

## File Structure

- `js/scroll-narrative.js` — `initCosmos()` only. Add reveal helpers, per-node arrival windows, build snap points; widen `INTRO`; remove the old viewport zoom; gate `focusNode`; set initial hidden state for core/rings/nodes.
- `css/cosmos.css` — `.cosmos-node` transform/opacity gains a `--reveal` factor with a safe `1` default.

## How to verify (used by every task)

The site is static. To view it:

```bash
# from repo root: foursightlab.github.io/
python -m http.server 8000
```

Then open `http://localhost:8000/` in a desktop browser at width ≥ 900px with motion enabled (default; do NOT have OS "reduce motion" on). Scroll to the "AI solutions orbiting your data" section. Use slow scroll / trackpad to watch the pinned construction.

> Note: there is no git repo in this workspace (`git init` not run). "Commit" steps below are written for completeness; if `git` is unavailable, skip the commit command and just save the files. Confirm with the user before running `git init`.

---

### Task 1: Add `--reveal`-driven node reveal to CSS

**Files:**
- Modify: `css/cosmos.css:115-136` (`.cosmos-node` rule)

**Interfaces:**
- Produces: `.cosmos-node` reads CSS var `--reveal` (0 → 1, default 1) for opacity and a scale multiplier. JS (Task 4) sets `--reveal` per node. Existing `--x`, `--y`, `--s` are unchanged.

- [ ] **Step 1: Update the `.cosmos-node` transform and opacity**

In `css/cosmos.css`, change the `.cosmos-node` rule. Current transform line:

```css
    transform: translate(-50%, -50%) translate(var(--x, 0px), var(--y, 0px)) scale(var(--s, 1));
```

Replace it with a transform that folds in a `--reveal`-based scale, and add an opacity line. The block becomes:

```css
.cosmos-node {
    position: absolute;
    top: 50%;
    left: 50%;
    /* JS sets --x / --y (px from center), --s (focus scale), and --reveal
       (0→1 build-in factor). --reveal defaults to 1 so the static/no-JS path
       renders nodes fully visible. */
    transform: translate(-50%, -50%) translate(var(--x, 0px), var(--y, 0px)) scale(calc(var(--s, 1) * (0.4 + 0.6 * var(--reveal, 1))));
    opacity: var(--reveal, 1);
    width: 104px;
    height: 104px;
    margin: 0;
    display: grid;
    place-items: center;
    text-align: center;
    border-radius: 50%;
    background: var(--light);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-md);
    color: var(--secondary);
    text-decoration: none;
    cursor: pointer;
    transition: box-shadow var(--transition-base), border-color var(--transition-base), background var(--transition-base), color var(--transition-base);
    will-change: transform;
}
```

Note: `opacity` is NOT in the `transition` list — reveal is scrubbed by JS every frame, so it must track scroll instantly, not ease.

- [ ] **Step 2: Verify static fallback unaffected**

Open the site with OS reduce-motion ON (or temporarily remove `motion` from `<html>`'s class in devtools). Confirm the `.solutions-grid` cards still render normally and nothing about the node CSS leaked into the card view (cards don't use `.cosmos-node`, so this is a sanity check). At ≥900px with motion on, the orbit nodes still render (they'll all be `--reveal:1` default until later tasks) — confirm they look exactly as before.

- [ ] **Step 3: Commit**

```bash
git add css/cosmos.css
git commit -m "feat(cosmos): add --reveal factor to node CSS (default 1)"
```

---

### Task 2: Widen INTRO and add construction phase constants + per-node arrival windows

**Files:**
- Modify: `js/scroll-narrative.js:220-236` (the `INTRO` / snap / `progressToIndex` block)

**Interfaces:**
- Produces (module-local vars inside `initCosmos`, used by Tasks 3–5):
  - `INTRO` (Number) = `0.28` — fraction of total range spent constructing.
  - `CORE_END` (Number) = `0.16` — intro-local `t` at which core finishes.
  - `RINGS_END` (Number) = `0.30` — intro-local `t` at which rings finish.
  - `nodeWindow(i)` → `{ start: Number, end: Number }` — intro-local `t` window over which node `i` reveals. Even split of `[RINGS_END, 1]` across `nodes.length`.
  - `stepSpan`, `progressToIndex(p)` — recomputed against new `INTRO` (signatures unchanged).

- [ ] **Step 1: Replace the INTRO + snap + progressToIndex block**

Replace `js/scroll-narrative.js:220-236` (from the `// ---- Progress → node mapping` comment through the end of `progressToIndex`) with:

```javascript
    // ---- Phase layout ------------------------------------------------------
    // The pinned scroll range is split into a CONSTRUCTION slice (the system
    // assembles itself) then one equal slice per node for the focus walkthrough.
    // Reusing the old intro budget: the former dead zoom (0.12) becomes a wider
    // construction phase. Progress p is 0..1 over the whole pinned range.
    var INTRO = 0.28;          // fraction of range spent constructing the system
    var CORE_END = 0.16;       // intro-local t at which the core has fully arrived
    var RINGS_END = 0.30;      // intro-local t at which both rings have arrived

    // Intro-local t-window over which node i reveals (evenly split across the
    // remaining intro after the rings land). Node 0 arrives first.
    function nodeWindow(i) {
      var span = (1 - RINGS_END) / nodes.length;
      return { start: RINGS_END + i * span, end: RINGS_END + (i + 1) * span };
    }

    var stepSpan = (1 - INTRO) / nodes.length;

    // Snap points: one per node's arrival during construction, then one at the
    // center of each node's focus slice afterward. inertia:false keeps a fling
    // from running to the bottom, so every gesture settles on a single state.
    var snapPoints = [];
    for (var b = 0; b < nodes.length; b++) {
      snapPoints.push(INTRO * nodeWindow(b).end);   // build: rest when node b lands
    }
    for (var s = 0; s < nodes.length; s++) {
      snapPoints.push(INTRO + (s + 0.5) * stepSpan); // walkthrough: center of slice
    }

    function progressToIndex(p) {
      if (p <= INTRO) return 0;
      var stepP = (p - INTRO) / (1 - INTRO);
      return Math.min(nodes.length - 1, Math.floor(stepP * nodes.length));
    }
```

- [ ] **Step 2: Syntax sanity check**

Reload the site. Open the browser console. Confirm there are NO JS errors on load (a syntax error here would break the whole IIFE and the page would lose all motion). The scene will still behave like the old version at this point except the intro is longer and snap points are denser — that's expected; later tasks wire up the visuals.

- [ ] **Step 3: Commit**

```bash
git add js/scroll-narrative.js
git commit -m "feat(cosmos): widen INTRO and add construction phase constants"
```

---

### Task 3: Set initial hidden state for core, rings, and nodes at init

**Files:**
- Modify: `js/scroll-narrative.js:217-218` (replace the `focusNode(0)` + viewport zoom-prep lines)

**Interfaces:**
- Consumes: `viewport`, `orbit` (already in scope); `stage` query for `.cosmos-core` and `.cosmos-ring` elements.
- Produces (module-local vars used by Task 4): `core` (Element|null), `rings` (Array of Elements). Nodes' `--reveal` initialized to `0`.

- [ ] **Step 1: Replace the init focus/scale lines**

Replace `js/scroll-narrative.js:217-218`:

```javascript
    focusNode(0);
    gsap.set(viewport, { scale: 0.9, transformOrigin: '50% 50%' });
```

with:

```javascript
    // Construction starts from nothing: core + rings hidden, every node at
    // --reveal 0. buildProgress() (below) reveals them as scroll progresses,
    // and reverses on scroll-up. focusNode is NOT called here — there are no
    // visible nodes yet; the detail panel stays empty until construction ends.
    var core = stage.querySelector('.cosmos-core');
    var rings = Array.prototype.slice.call(stage.querySelectorAll('.cosmos-ring'));
    gsap.set(viewport, { scale: 1, transformOrigin: '50% 50%' });
    if (core) gsap.set(core, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });
    rings.forEach(function (r) { gsap.set(r, { autoAlpha: 0, scale: 0.85, transformOrigin: '50% 50%' }); });
    nodes.forEach(function (n) { n.el.style.setProperty('--reveal', '0'); });
```

- [ ] **Step 2: Verify hidden-at-rest**

Reload and scroll the section into view but stop at the very start of the pin (the moment it pins). The core, rings, and nodes should all be invisible (only the empty detail panel area + the stage). They will NOT yet reveal on further scroll — that's Task 4. Confirm no console errors. If the core/rings selector finds nothing, check they exist in `index.html` (`.cosmos-core`, `.cosmos-ring`).

- [ ] **Step 3: Commit**

```bash
git add js/scroll-narrative.js
git commit -m "feat(cosmos): hide core/rings/nodes at init for construction"
```

---

### Task 4: Add `buildProgress()` and wire it into `onUpdate`

**Files:**
- Modify: `js/scroll-narrative.js` — add `buildProgress` function just before the `ScrollTrigger.create` call (after the reveal-lifecycle block, around line 257); modify the `onUpdate` callback (currently `js/scroll-narrative.js:279-284`).

**Interfaces:**
- Consumes: `INTRO`, `CORE_END`, `RINGS_END`, `nodeWindow` (Task 2); `core`, `rings`, `nodes` (Task 3); `gsap`.
- Produces: `buildProgress(p)` — given total progress `p` (0..1), sets core/ring autoAlpha+scale and each node's `--reveal` imperatively. Idempotent per frame; correct in both scroll directions.

- [ ] **Step 1: Add the `buildProgress` helper**

Insert this function immediately BEFORE the `var st = window.ScrollTrigger.create({` line (after the `disengage` function, ~line 257):

```javascript
    // Clamp helper + smoothstep for gentle ease on each sub-reveal.
    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function smooth(v) { v = clamp01(v); return v * v * (3 - 2 * v); }

    // Map a sub-window [a,b] of t onto 0..1.
    function sub(t, a, b) { return clamp01((t - a) / (b - a)); }

    // Drive the construction from total progress p. Imperative (set every frame)
    // so scrolling back up dismantles the system in reverse. Past INTRO,
    // everything is clamped fully-revealed and stays put for the walkthrough.
    function buildProgress(p) {
      if (p >= INTRO) {
        if (core) gsap.set(core, { autoAlpha: 1, scale: 1 });
        rings.forEach(function (r) { gsap.set(r, { autoAlpha: 1, scale: 1 }); });
        nodes.forEach(function (n) { n.el.style.setProperty('--reveal', '1'); });
        return;
      }
      var t = p / INTRO; // intro-local 0..1
      // Core: scales + fades in first.
      var coreT = smooth(sub(t, 0, CORE_END));
      if (core) gsap.set(core, { autoAlpha: coreT, scale: 0.6 + 0.4 * coreT });
      // Rings: inner then outer, staggered within [CORE_END, RINGS_END].
      rings.forEach(function (r, ri) {
        var lead = CORE_END + (ri * (RINGS_END - CORE_END) * 0.35);
        var rt = smooth(sub(t, lead, RINGS_END));
        gsap.set(r, { autoAlpha: rt, scale: 0.85 + 0.15 * rt });
      });
      // Nodes: each reveals across its own arrival window.
      nodes.forEach(function (n, i) {
        var w = nodeWindow(i);
        var nt = smooth(sub(t, w.start, w.end));
        n.el.style.setProperty('--reveal', nt.toFixed(3));
      });
    }
```

- [ ] **Step 2: Rewrite the `onUpdate` callback**

Replace the current `onUpdate` (`js/scroll-narrative.js:279-284`):

```javascript
      onUpdate: function (self) {
        var p = self.progress;
        var introT = Math.min(1, p / INTRO);
        gsap.set(viewport, { scale: 0.9 + 0.1 * introT });
        focusNode(progressToIndex(p));
      }
```

with:

```javascript
      onUpdate: function (self) {
        var p = self.progress;
        buildProgress(p);
        // Only run the focus walkthrough once construction is complete — before
        // that there is no fully-formed system to "focus" and the detail panel
        // should stay empty.
        if (p >= INTRO) focusNode(progressToIndex(p));
      }
```

- [ ] **Step 3: Verify the full construction**

Reload. Slowly scroll through the pinned section:
1. Core fades + scales up first.
2. Inner ring then outer ring draw in.
3. The 6 nodes pop onto their rings one at a time.
4. After construction, the detail panel populates and the per-node focus walkthrough runs as before.
5. Scroll back UP within the pin → nodes leave, rings retract, core fades — reverse construction.

Confirm no console errors and that the snap makes each node-arrival settle cleanly.

- [ ] **Step 4: Commit**

```bash
git add js/scroll-narrative.js
git commit -m "feat(cosmos): construct system on scroll via buildProgress"
```

---

### Task 5: Gate the scroll hint and clean up focus-at-rest edge cases

**Files:**
- Modify: `js/scroll-narrative.js:293-300` (scroll hint) and verify `focusNode` initial state.

**Interfaces:**
- Consumes: `INTRO`, `section`, `viewport`, `hint`.
- Produces: hint fades over the construction range; `current` starts at `-1` (already true) so first real `focusNode` after INTRO always applies.

- [ ] **Step 1: Retarget the scroll hint fade to the construction range**

The hint currently fades over `+=25%`. Since the intro is now longer, fade it over the construction so it's gone by the time the walkthrough starts. Replace `js/scroll-narrative.js:298-300`:

```javascript
    gsap.to(hint, {
      opacity: 0, scrollTrigger: { trigger: section, start: 'center center', end: '+=25%', scrub: true }
    });
```

with:

```javascript
    // Fade the hint out across the construction phase (INTRO of the pinned
    // range, which is nodes.length*100% long → INTRO*nodes.length*100%).
    gsap.to(hint, {
      opacity: 0,
      scrollTrigger: {
        trigger: section, start: 'center center',
        end: '+=' + Math.round(INTRO * nodes.length * 100) + '%', scrub: true
      }
    });
```

- [ ] **Step 2: Confirm `current` initial value**

Verify near `js/scroll-narrative.js:192` that `var current = -1;` is unchanged (it is — Task 3 removed the `focusNode(0)` call, so `current` correctly stays `-1` until the first post-INTRO `focusNode`). No edit needed if already `-1`; this step is a read-only check.

- [ ] **Step 3: Full regression pass in the browser**

Reload and verify end-to-end:
1. Hint is visible at the start of the pin and fully faded by the time construction ends.
2. Construction → walkthrough → unpin all flow smoothly, forward and reverse.
3. Resize the window across the 900px boundary: below 900px the card grid shows (no orbit); above, the orbit works. No console errors.
4. With OS reduce-motion ON: only the static card grid, no pinning.

- [ ] **Step 4: Commit**

```bash
git add js/scroll-narrative.js
git commit -m "feat(cosmos): fade scroll hint across construction phase"
```

---

## Self-Review

**Spec coverage:**
- Build sequence core → rings → nodes → Task 4 `buildProgress`. ✓
- Keep existing walkthrough → Task 4 gates `focusNode` after INTRO, walkthrough untouched. ✓
- Reuse intro budget, widen to 0.28 → Task 2. ✓
- Reverse on scroll-up → Task 4 imperative per-frame set. ✓
- Per-node arrival windows + build snaps → Task 2 `nodeWindow`, `snapPoints`. ✓
- Focus gating (no detail panel before build) → Task 3 removes `focusNode(0)`, Task 4 gates. ✓
- CSS `--reveal` default 1 for static path → Task 1. ✓
- Remove old viewport zoom → Task 3 (`scale:1`), Task 4 (`onUpdate` no longer scales viewport). ✓
- No change to fallback/reduced-motion/<900px → guarded; verified in Task 5 Step 3. ✓

**Placeholder scan:** No TBD/TODO; the spec's one "TBD" (focus during build) is resolved to "no focus until INTRO" and implemented in Task 4 Step 2. ✓

**Type consistency:** `buildProgress`, `nodeWindow`, `clamp01`, `smooth`, `sub`, `progressToIndex`, `INTRO`, `CORE_END`, `RINGS_END`, `core`, `rings` used consistently across tasks. `--reveal` CSS var name matches between Task 1 (CSS) and Tasks 3–4 (JS). ✓
