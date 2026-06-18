/* Scroll Narrative — smooth scrolling + scroll-driven scenes.
 *
 * Progressive enhancement: this entire file is a no-op unless motion is enabled
 * (html.motion, set before paint) and GSAP + Lenis loaded from CDN. When it does
 * not run, the page is the fully styled, static layout — content is never hidden
 * behind JS. Each scene also re-checks its own preconditions (viewport, elements).
 */
(function () {
  'use strict';

  var html = document.documentElement;
  var motionEnabled = html.classList.contains('motion');
  var hasLibs = typeof window.gsap !== 'undefined' &&
                typeof window.ScrollTrigger !== 'undefined' &&
                typeof window.Lenis !== 'undefined';

  // Expose so main.js can avoid double-driving the same elements.
  window.__narrativeActive = motionEnabled && hasLibs;

  if (!window.__narrativeActive) return;

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- Smooth scrolling (Lenis) bridged to ScrollTrigger ---------- */
  var lenis = new window.Lenis({
    duration: 0.6,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5
  });

  lenis.on('scroll', window.ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // Let the existing nav anchor helper drive Lenis instead of window.scrollTo.
  window.scrollToSection = function (sectionId) {
    var target = document.getElementById(sectionId);
    if (target) lenis.scrollTo(target, { offset: -80 });
  };

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initHero();
    initCosmos();
    initPillars();
    initProducts();
    initFinalCta();
    window.ScrollTrigger.refresh();
  });

  /* ---------------------------- Scene: Hero ---------------------------- */
  function initHero() {
    var title = document.querySelector('.hero-title');
    var subtitle = document.querySelector('.hero-subtitle');
    var ctas = document.querySelector('.hero-cta-group');
    if (!title) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(title, { y: 40, opacity: 0, duration: 0.9 })
      .from(subtitle, { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
      .from(ctas, { y: 20, opacity: 0, duration: 0.6 }, '-=0.45');

    // Parallax drift on the ai-brain background as the hero scrolls away.
    var hero = document.querySelector('.hero');
    if (hero) {
      gsap.to(hero, {
        backgroundPositionY: '30%',
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  /* -------------------- Scene: Cosmos (Solutions) --------------------- */
  function initCosmos() {
    var stage = document.querySelector('.cosmos-stage');
    var grid = document.querySelector('.solutions-grid');
    var orbit = document.querySelector('.cosmos-orbit');
    var viewport = document.querySelector('.cosmos-viewport');
    var section = document.getElementById('solutions');
    if (!stage || !grid || !orbit || !section) return;

    // Orbit math needs room; below this width fall back to the card grid.
    var MIN_WIDTH = 900;
    if (window.innerWidth < MIN_WIDTH) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.solution-card'));
    if (cards.length === 0) return;

    // Pull content from the real cards so the orbit stays in sync with the source.
    var data = cards.map(function (card) {
      var h = card.querySelector('h3');
      var p = card.querySelector('p');
      return {
        title: h ? h.textContent.trim() : '',
        text: p ? p.textContent.trim() : '',
        href: card.getAttribute('href') || '#'
      };
    });

    // Motion + wide enough → the orbit IS the layout. Swap the grid out for the
    // stage immediately (grid → display:none, stage → is-active) so the card grid
    // never appears for even a frame. The stage's CSS keeps the orbit itself
    // visually hidden (visibility:hidden; opacity:0) until the pin engages and the
    // lifecycle fades it in — so we get the swap without the flash either way.
    stage.classList.add('is-active');
    grid.classList.add('is-hidden');

    // Position nodes: 3 on the inner ring, 3 on the outer ring, evenly spread.
    var nodes = [];
    var ringRadii = { inner: 0.30, outer: 0.47 }; // fraction of viewport size
    data.forEach(function (d, i) {
      var node = document.createElement('a');
      node.className = 'cosmos-node';
      node.href = d.href;
      node.setAttribute('aria-label', d.title);
      // Build with DOM methods + textContent (no innerHTML) so titles are never
      // interpreted as markup.
      var dot = document.createElement('span');
      dot.className = 'cosmos-node-dot';
      var label = document.createElement('span');
      label.className = 'cosmos-node-label';
      label.textContent = d.title;
      node.appendChild(dot);
      node.appendChild(label);
      orbit.appendChild(node);

      var ring = i % 2 === 0 ? 'inner' : 'outer';
      // Distribute angles; offset alternating rings so they interleave.
      var perRing = 3;
      var idxInRing = Math.floor(i / 2);
      var baseAngle = (idxInRing / perRing) * Math.PI * 2;
      if (ring === 'outer') baseAngle += Math.PI / 3;

      nodes.push({ el: node, ring: ring, angle: baseAngle, radiusFrac: ringRadii[ring], data: d });
    });

    function layout() {
      var size = viewport.clientWidth;
      nodes.forEach(function (n) {
        var r = n.radiusFrac * size;
        var x = Math.cos(n.angle) * r;
        var y = Math.sin(n.angle) * r;
        n.el.style.setProperty('--x', x.toFixed(1) + 'px');
        n.el.style.setProperty('--y', y.toFixed(1) + 'px');
      });
    }
    layout();
    window.addEventListener('resize', layout);

    // Continuous slow orbital drift (alive at rest). Rotates the angles over time.
    // Only runs while the section is engaged (started on onEnter, stopped on leave)
    // so the orbit isn't animating off-screen and burning CPU.
    var driftSpeed = 0.04; // radians per second
    var lastTime = null;
    var driftRunning = false;
    function drift(time) {
      if (lastTime === null) lastTime = time;
      var dt = (time - lastTime) / 1000;
      lastTime = time;
      nodes.forEach(function (n) {
        var dir = n.ring === 'inner' ? 1 : -1; // counter-rotating rings
        n.angle += driftSpeed * dir * dt;
      });
      layout();
    }
    function startDrift() {
      if (driftRunning) return;
      driftRunning = true;
      lastTime = null;
      gsap.ticker.add(drift);
    }
    function stopDrift() {
      if (!driftRunning) return;
      driftRunning = false;
      gsap.ticker.remove(drift);
    }

    // Detail panel.
    var detail = document.querySelector('.cosmos-detail');
    var dIndex = detail.querySelector('.cosmos-detail-index');
    var dTitle = detail.querySelector('.cosmos-detail-title');
    var dText = detail.querySelector('.cosmos-detail-text');
    var dCta = detail.querySelector('.cosmos-detail-cta');
    var current = -1;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function focusNode(i) {
      if (i === current || i < 0 || i >= nodes.length) return;
      current = i;
      nodes.forEach(function (n, j) {
        n.el.classList.toggle('is-focused', j === i);
        n.el.classList.toggle('is-dimmed', j !== i);
        // Focused node scales up; others ease back down.
        gsap.to(n.el, { '--s': j === i ? 1.42 : 1, duration: 0.5, ease: 'power3.out' });
      });
      // Swap detail content with a small fade.
      detail.classList.add('is-swapping');
      gsap.delayedCall(0.18, function () {
        var d = nodes[i].data;
        dIndex.textContent = pad(i + 1) + ' / ' + pad(nodes.length);
        dTitle.textContent = d.title;
        dText.textContent = d.text;
        dCta.setAttribute('href', d.href);
        detail.classList.remove('is-swapping');
      });
    }

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

    // ---- Reveal lifecycle ---------------------------------------------------
    // The grid is already swapped out at init (above) and stays gone. Here we only
    // fade the ORBIT in/out as the pin engages, and run the drift ticker only while
    // engaged. The grid layout is never touched again, so it can't flash on entry
    // or exit.
    var engaged = false;
    function engage() {
      if (engaged) return;
      engaged = true;
      startDrift();
      gsap.killTweensOf(stage);
      gsap.to(stage, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
    }
    function disengage() {
      if (!engaged) return;
      engaged = false;
      stopDrift();
      gsap.killTweensOf(stage);
      gsap.to(stage, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
    }

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
        nodes.forEach(function (n) {
          n.el.style.setProperty('--reveal', '1');
          n.el.style.pointerEvents = '';   // fully built → hover/click re-enabled
        });
        return;
      }
      // Mid-construction: nodes aren't fully formed yet, so they shouldn't be
      // hoverable/clickable (a hover would fire focusNode and populate the
      // detail panel before the system exists). Re-enabled once p >= INTRO.
      nodes.forEach(function (n) { n.el.style.pointerEvents = 'none'; });
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

    // Pin the section and step focus through the nodes as the user scrolls.
    var st = window.ScrollTrigger.create({
      trigger: section,
      start: 'center center',     // pin when the section is centered → orbit not clipped
      end: '+=' + (nodes.length * 100) + '%',  // one viewport-worth of scroll per node
      pin: true,
      pinSpacing: true,
      scrub: 0.2,                 // light tracking only; snap owns the resting state
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: snapPoints,       // discrete resting points → one solution per gesture
        duration: { min: 0.15, max: 0.35 },
        ease: 'power2.inOut',
        inertia: false            // ignore fling velocity → never runs to the bottom
      },
      onToggle: function (self) {
        if (self.isActive) engage();
        else disengage();
      },
      onUpdate: function (self) {
        var p = self.progress;
        buildProgress(p);
        // Only run the focus walkthrough once construction is complete — before
        // that there is no fully-formed system to "focus" and the detail panel
        // should stay empty.
        if (p >= INTRO) focusNode(progressToIndex(p));
      }
    });

    // Clicking a node should focus it (and the link still navigates on a real click).
    nodes.forEach(function (n, i) {
      n.el.addEventListener('mouseenter', function () { focusNode(i); });
      n.el.addEventListener('focus', function () { focusNode(i); });
    });

    // Scroll hint.
    var hint = document.createElement('span');
    hint.className = 'cosmos-hint';
    hint.textContent = 'Scroll to explore';
    viewport.appendChild(hint);
    // Fade the hint out across the construction phase (INTRO of the pinned
    // range, which is nodes.length*100% long → INTRO*nodes.length*100%).
    gsap.to(hint, {
      opacity: 0,
      scrollTrigger: {
        trigger: section, start: 'center center',
        end: '+=' + Math.round(INTRO * nodes.length * 100) + '%', scrub: true
      }
    });

    void st;
  }

  /* --------------------- Scene: Pillars build ------------------------- */
  function initPillars() {
    var cards = gsap.utils.toArray('.pillar-card');
    if (!cards.length) return;
    gsap.from(cards, {
      y: 48, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.18,
      scrollTrigger: { trigger: '.pillars-grid', start: 'top 78%' }
    });
  }

  /* ------------------------ Scene: Products --------------------------- */
  function initProducts() {
    gsap.utils.toArray('.product').forEach(function (product) {
      var content = product.querySelector('.product-content');
      var visual = product.querySelector('.product-visual');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: product, start: 'top 72%' }
      });
      if (content) tl.from(content, { x: -40, opacity: 0, duration: 0.7, ease: 'power3.out' });
      if (visual) tl.from(visual, { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');
    });
  }

  /* ----------------------- Scene: Final CTA --------------------------- */
  function initFinalCta() {
    var cta = document.querySelector('.final-cta-content');
    if (!cta) return;
    gsap.from(cta, {
      y: 40, opacity: 0, scale: 0.97, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.final-cta', start: 'top 80%' }
    });
  }
})();
