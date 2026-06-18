# FourSight Lab — Cosmos Construction-on-Scroll Design

Date: 2026-06-18

## Goal

Remove the "dead" intro scroll in the Solutions orbital scene. Today, after the
"AI solutions orbiting your data" heading, there is roughly a viewport of scroll
where nothing visibly changes before the orbital system appears. Replace that
dead zone with a **scroll-driven construction**: the system assembles itself as
the user scrolls — core first, then the rings, then the six solution nodes one at
a time — and then the existing per-node focus walkthrough runs unchanged.

Scope is limited to the Solutions scene (`initCosmos` in
`js/scroll-narrative.js` and `css/cosmos.css`). No new files, no new
dependencies, no content changes.

## Decisions (locked)

- **Build sequence:** Core → rings → nodes, in order. Each node pops onto its
  ring one-by-one as the user keeps scrolling.
- **After build:** Keep the existing per-node focus walkthrough + detail panel
  exactly as it works today. Construction replaces only the dead intro.
- **Scroll budget:** Reuse the existing total range (`nodes.length * 100%`,
  ~600%). The intro slice that was a dead zoom (`INTRO = 0.12`) becomes the
  construction phase, widened to `INTRO = 0.28`. The per-node walkthrough runs
  in the remaining range and is therefore slightly faster per node — accepted.
- **Reverse:** Construction is driven off `self.progress` with scrub, so
  scrolling back up deconstructs the system in reverse (nodes leave, rings
  retract, core fades). Free with GSAP scrub.

## Current behaviour (what we change)

`initCosmos` pins `#solutions` at `start: 'center center'`, `end: '+=' +
(nodes.length * 100) + '%'`, scrub `0.2`, with snap points. On `onUpdate`:

- `introT = min(1, p / INTRO)` scales the whole (already-complete) viewport from
  `0.9 → 1.0`. This is the dead zone.
- `focusNode(progressToIndex(p))` steps through nodes after the intro.

Snap points: `[INTRO]` then the center of each node's slice.

## New behaviour

### Phases (within the same total scroll range)

- `INTRO` widens from `0.12` to `0.28`.
- Construction sub-allocation within the `0 → INTRO` slice (intro-local progress
  `t = p / INTRO`):
  - `t` in `[0, CORE_END]` (`CORE_END ≈ 0.16`): core fades + scales in.
  - `t` in `[CORE_END, RINGS_END]` (`RINGS_END ≈ 0.30`): rings draw in
    (opacity + scale), slightly staggered inner-then-outer.
  - `t` in `[RINGS_END, 1.0]`: the 6 nodes reveal sequentially, evenly spaced
    across the remaining intro range. Node `i` has its own
    `[arrivalStart_i, arrivalEnd_i]` window; `--reveal` ramps 0 → 1 across it.
- After `INTRO` (`p > INTRO`): existing walkthrough runs. `stepSpan`,
  `progressToIndex`, and the walkthrough snap points are all recomputed against
  the new `INTRO` value (they already derive from `INTRO`, so just the constant
  changes plus the additions below).

### Reveal mechanics (imperative, reverse-safe)

A new helper `buildProgress(p)` is called every `onUpdate` and sets reveal state
imperatively (not tweened), so reverse scrubbing dismantles correctly:

- **Core:** `gsap.set(core, { autoAlpha: coreT, scale: 0.6 + 0.4 * coreT })`
  where `coreT` is the eased core sub-progress.
- **Rings:** each ring `autoAlpha` + `scale` from its sub-progress.
- **Nodes:** each node gets a `--reveal` custom property (0 → 1). The node's
  CSS transform multiplies its scale by a function of `--reveal` (small
  pop-from-smaller), and opacity = `--reveal`. Nodes keep their final orbit
  `--x/--y`; reveal animates only opacity + scale, so `layout()` and the drift
  ticker are untouched and keep working on still-hidden nodes.

`buildProgress` also handles `p >= INTRO`: clamp everything to fully revealed
(core/rings autoAlpha 1, scale 1; all nodes `--reveal: 1`), and keep the
viewport scale at its final value. The old `viewport` `0.9 → 1.0` zoom is
removed (the construction is the entrance now); viewport scale is fixed at `1`,
or a gentle `0.97 → 1.0` tied to core sub-progress if it reads better.

### Focus gating

`focusNode(0)` must NOT run at init anymore — there are no visible nodes yet and
the detail panel would show "01 / 06" before construction. Instead:

- At init, leave `current = -1` and the detail panel empty (or pre-seed text
  hidden).
- In `onUpdate`, only call `focusNode(progressToIndex(p))` once `p >= INTRO`.
- While `p < INTRO`, optionally focus the most-recently-arrived node (cosmetic;
  defaults to no focus to keep the build clean — TBD during implementation,
  default: no focus until INTRO).

### Snap points

To keep the "one solution per gesture" feel through the build too, add intro
sub-snaps at each node's arrival point:

- Build snaps: the arrival progress of each node (`p` value at `arrivalEnd_i`),
  for the 6 nodes.
- Walkthrough snaps: the existing center-of-slice points, recomputed with new
  `INTRO`.

Resulting `snapPoints` = `[...buildSnaps, ...walkthroughSnaps]`. `inertia:false`
stays so a fling never runs to the bottom.

## CSS changes (`css/cosmos.css`)

- `.cosmos-node` transform gains a `--reveal`-driven scale factor and opacity:
  e.g. `opacity: var(--reveal, 1)` and transform scale multiplied by
  `(0.4 + 0.6 * var(--reveal, 1))`. Default `--reveal: 1` so the
  non-motion/static path (where JS never sets it) is unaffected.
- Under `html.motion .cosmos-stage.is-active`, give `.cosmos-core` and
  `.cosmos-ring` a base hidden state (set via `gsap.set` at init rather than CSS
  to avoid FOUC; CSS only ensures no flash before JS runs — they already start
  inside a `visibility:hidden; opacity:0` stage, so the stage gate covers the
  first paint).

No change to the `< 900px`, reduced-motion, or no-JS fallback paths.

## Files

- `js/scroll-narrative.js` — `initCosmos`: widen `INTRO`; add `buildProgress`;
  add per-node arrival windows; add build snap points; remove old viewport zoom;
  gate `focusNode`; set initial hidden state for core/rings/nodes via `gsap.set`.
- `css/cosmos.css` — `--reveal`-aware `.cosmos-node` transform/opacity with a
  safe `1` default.

## Non-goals

- No content/copy changes, no section reordering.
- No change to other scenes (hero, pillars, products, final CTA).
- No change to the responsive card-grid fallback, reduced-motion, or no-JS
  behaviour.

## Risks & mitigations

- **Snap-math consistency** — `INTRO`, `stepSpan`, and the snap array must all
  agree. Mitigation: keep `progressToIndex` as the single source of which node
  is focused; derive all phase boundaries from named constants
  (`INTRO`, `CORE_END`, `RINGS_END`, per-node windows).
- **Detail panel showing before build** — gated by only calling `focusNode`
  once `p >= INTRO`.
- **Reverse scrub correctness** — reveal is set imperatively from progress
  every frame (not one-shot tweened), so it tracks scroll in both directions.
- **Static/no-JS regression** — `--reveal` defaults to `1`; core/ring hidden
  state is applied only via JS `gsap.set` under motion, never via base CSS.
