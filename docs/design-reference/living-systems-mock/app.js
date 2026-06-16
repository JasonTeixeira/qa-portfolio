/* =========================================================================
   SAGE IDEAS — interactions · "LIVING SYSTEMS" v3
   --------------------------------------------------------------------------
   Motion philosophy: SMOOTH > spectacle. Native scroll (NO Lenis).
   GSAP + ScrollTrigger power scrubs/pins/parallax. Everything is progressive:
   content is visible by default; animate-from states arm ONLY after GSAP +
   ScrollTrigger are confirmed loaded. reduced-motion or any lib failure =>
   fully static + visible. Every loop pauses when its section is offscreen.
   GPU-only props (transform / opacity / clip-path); will-change kept narrow.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var narrow = window.matchMedia("(max-width: 940px)").matches;
  var body = document.body;

  // GSAP availability is resolved after deferred scripts load.
  var gsap = null, ScrollTrigger = null, Draggable = null;
  var GSAP_OK = false;        // gsap + ScrollTrigger both present
  var armed = false;          // animate-from states are live

  /* ------------------------------------------------------------------ */
  /* 0. SAFETY NET — force everything visible if motion never arms.      */
  /* ------------------------------------------------------------------ */
  function showEverything() {
    document.querySelectorAll("[data-reveal], [data-reveal-group]").forEach(function (t) {
      t.classList.add("is-in");
    });
    document.querySelectorAll(".hero__title, .final__title").forEach(function (h) {
      h.classList.add("is-loaded");
    });
    document.querySelectorAll(".ksplit").forEach(function (k) { k.classList.add("is-revealed"); });
    var loader = document.querySelector("[data-loader]");
    if (loader) loader.classList.add("is-done");
  }
  // hard backstop: no matter what, nothing stays hidden.
  setTimeout(showEverything, 4200);

  /* ------------------------------------------------------------------ */
  /* 1. LIVE CLOCK (Orlando / America/New_York)                          */
  /* ------------------------------------------------------------------ */
  var clockEl = document.querySelector("[data-clock-time]");
  function tick() {
    if (!clockEl) return;
    try {
      clockEl.textContent = new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false
      });
    } catch (e) {
      var d = new Date();
      clockEl.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }
  }
  tick();
  setInterval(tick, 15000);

  /* ------------------------------------------------------------------ */
  /* 2. KINETIC TYPE — split section titles into masked lines.           */
  /*    Done in markup so the "from" state (CSS) can gate on .ksplit.     */
  /* ------------------------------------------------------------------ */
  function splitTitles() {
    document.querySelectorAll(".section-title").forEach(function (h) {
      if (h.dataset.split) return;
      h.dataset.split = "1";
      // split on explicit <br> only — keeps copy/markup intact, no glyph churn.
      var segs = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = segs.map(function (seg) {
        return '<span class="kline"><span class="kline__inner">' + seg + "</span></span>";
      }).join("");
      h.classList.add("ksplit");
    });
  }
  splitTitles();

  /* ------------------------------------------------------------------ */
  /* 3. LIVING DIAGRAMS — upgrade every card's edges + inject packets.   */
  /*    Works whether or not GSAP loads (CSS animates packets via @keys). */
  /* ------------------------------------------------------------------ */
  function upgradeDiagrams() {
    document.querySelectorAll("[data-card]").forEach(function (card) {
      var svg = card.querySelector(".sys-graph");
      if (!svg || svg.dataset.upgraded) return;
      svg.dataset.upgraded = "1";

      var edgeGroup = svg.querySelector("g[stroke]");
      var edges = [];
      if (edgeGroup) {
        edgeGroup.querySelectorAll("path").forEach(function (p) {
          p.classList.add("sys-edge");
          p.removeAttribute("stroke");
          try {
            var len = p.getTotalLength();
            p.style.strokeDasharray = len;
            p.style.strokeDashoffset = len;
            p.dataset.len = len;
          } catch (e) {}
          edges.push(p);
        });
        edgeGroup.removeAttribute("stroke");
        edgeGroup.removeAttribute("stroke-width");
        edgeGroup.removeAttribute("opacity");
      }
      // a moving packet for (up to) a few edges
      var ns = "http://www.w3.org/2000/svg";
      edges.slice(0, 6).forEach(function (p, i) {
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("r", "2.4");
        c.classList.add("sys-packet");
        c.dataset.edge = i;
        svg.appendChild(c);
      });
      wireNodeLighting(svg, edges);
    });
  }

  // map nodes -> connected edges by proximity, then light on hover
  function wireNodeLighting(svg, edges) {
    var nodes = Array.prototype.slice.call(svg.querySelectorAll(".sys-node"));
    var endpoints = edges.map(function (p) {
      try {
        var L = p.getTotalLength();
        return { p: p, a: p.getPointAtLength(0), b: p.getPointAtLength(L) };
      } catch (e) { return { p: p, a: { x: -999, y: -999 }, b: { x: -999, y: -999 } }; }
    });
    function near(pt, cx, cy, bb) {
      var r = Math.max(bb.width, bb.height) * 0.9 + 8;
      return Math.hypot(pt.x - cx, pt.y - cy) < r;
    }
    nodes.forEach(function (node) {
      var bb;
      try { bb = node.getBBox(); } catch (e) { return; }
      var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      var linked = endpoints.filter(function (e) { return near(e.a, cx, cy, bb) || near(e.b, cx, cy, bb); });
      node.addEventListener("mouseenter", function () {
        node.classList.add("is-lit");
        linked.forEach(function (e) { e.p.classList.add("is-lit"); });
      });
      node.addEventListener("mouseleave", function () {
        node.classList.remove("is-lit");
        linked.forEach(function (e) { e.p.classList.remove("is-lit"); });
      });
    });
  }
  upgradeDiagrams();

  // animate packets along their edges via a throttled rAF (paused offscreen).
  var packetCards = [];
  (function buildPacketDrivers() {
    document.querySelectorAll("[data-card]").forEach(function (card) {
      var svg = card.querySelector(".sys-graph");
      if (!svg) return;
      var edgeEls = Array.prototype.slice.call(svg.querySelectorAll(".sys-edge"));
      var packets = Array.prototype.slice.call(svg.querySelectorAll(".sys-packet")).map(function (c) {
        var ei = parseInt(c.dataset.edge, 10) || 0;
        var edge = edgeEls[ei];
        var len = 1;
        try { len = edge.getTotalLength(); } catch (e) {}
        return { el: c, edge: edge, len: len, t: Math.random() };
      });
      if (packets.length) packetCards.push({ card: card, packets: packets, active: false });
    });
  })();

  var packetRAF = null, packetLast = 0;
  function packetLoop(now) {
    if (now - packetLast > 33) { // ~30fps for tiny dots; saves cycles
      packetLast = now;
      var any = false;
      packetCards.forEach(function (pc) {
        if (!pc.active) return;
        any = true;
        pc.packets.forEach(function (pk) {
          pk.t += 0.0055;
          if (pk.t > 1) pk.t -= 1;
          try {
            var pt = pk.edge.getPointAtLength(pk.t * pk.len);
            pk.el.setAttribute("cx", pt.x);
            pk.el.setAttribute("cy", pt.y);
          } catch (e) {}
        });
      });
      if (!any) { packetRAF = null; return; } // stop the loop when nothing flows
    }
    packetRAF = requestAnimationFrame(packetLoop);
  }
  function setPacketActive(card, on) {
    packetCards.forEach(function (pc) { if (pc.card === card) pc.active = on; });
    if (on && !packetRAF) packetRAF = requestAnimationFrame(packetLoop);
  }

  /* ------------------------------------------------------------------ */
  /* 4. SURFACE ⇄ SYSTEM reveal (hover/tap). Drives packet flow + live.  */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-card]").forEach(function (card) {
    var peelBtn = card.querySelector("[data-peel]");
    var label = card.querySelector("[data-peel-label]");
    var device = card.querySelector("[data-device]");

    function setSystem(on) {
      card.classList.toggle("is-system", on);
      if (device) device.classList.toggle("is-live", on); // ignite living UI + diagram loops
      if (label) label.textContent = on ? "Surface" : "System";
      if (peelBtn) peelBtn.setAttribute("aria-label", on ? "Show product surface" : "Reveal system view");
      setPacketActive(card, on && !reduced);
    }
    card._setSystem = setSystem; // exposed for pinned scrollytelling
    card._device = device;

    if (coarse) {
      if (peelBtn) peelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        setSystem(!card.classList.contains("is-system"));
      });
    } else {
      var sticky = false;
      card.addEventListener("mouseenter", function () { if (!sticky && !card.classList.contains("is-pinned-on")) setSystem(true); });
      card.addEventListener("mouseleave", function () { if (!sticky && !card.classList.contains("is-pinned-on")) setSystem(false); });
      if (peelBtn) peelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        sticky = !sticky;
        setSystem(sticky);
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* 5. COUNT-UPS                                                        */
  /* ------------------------------------------------------------------ */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1300, start = performance.now();
    (function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame); else el.textContent = target + suffix;
    })(performance.now());
  }
  var counts = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // when the reel is armed, scene metrics are counted by the reel
        // timeline as each scene lands — skip them here to avoid a premature
        // all-at-once count (every stacked scene reads as "intersecting").
        if (body.classList.contains("is-reel") && en.target.closest("[data-scene]")) {
          cio.unobserve(en.target); return;
        }
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counts.forEach(function (c) { cio.observe(c); });
  } else {
    counts.forEach(function (c) { c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || ""); });
  }

  /* ------------------------------------------------------------------ */
  /* 6. OFFSCREEN PAUSE for diagram loops (IntersectionObserver).        */
  /* ------------------------------------------------------------------ */
  if ("IntersectionObserver" in window) {
    var pauseIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // When the reel is armed, the reel timeline owns pause/active state for
        // its scenes (all scenes share the pinned viewport, so IO can't tell
        // them apart). Don't let IO un-pause inactive stacked scenes.
        if (body.classList.contains("is-reel") && en.target.closest("[data-scene]")) return;
        var on = en.isIntersecting;
        en.target.classList.toggle("is-paused", !on);
        if (en.target.matches("[data-card]")) {
          if (!on) setPacketActive(en.target, false);
          else if (en.target.classList.contains("is-system")) setPacketActive(en.target, !reduced);
        }
      });
    }, { rootMargin: "120px 0px 120px 0px", threshold: 0 });
    document.querySelectorAll("[data-card], .device").forEach(function (el) { pauseIO.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 7. FULL-SCREEN IMMERSIVE PROJECT REEL                               */
  /*    A pinned, scroll-scrubbed sequence: each project is a full-      */
  /*    viewport SCENE. One scene fully visible at a time (never cut     */
  /*    off, no dead space). Per scene the timeline choreographs:        */
  /*      [0.00–0.22] ENTRANCE   device scales/slides in, title masks    */
  /*                             in, metrics count up, parallax settles  */
  /*      [0.30–0.70] X-RAY      surface ⇄ system: nodes draw, gradient  */
  /*                             edges connect, magenta packets flow     */
  /*      [0.80–1.00] HANDOFF    light-sweep + scale/fade to next scene  */
  /*    Pin distance is EXACTLY N viewport-heights (tight 1:1, no empty  */
  /*    leading/trailing scroll). Only the active scene runs loops.      */
  /*    Mobile/coarse/reduced/no-GSAP → never armed; static stack shows. */
  /* ------------------------------------------------------------------ */
  var reel = {
    track: document.querySelector("[data-reel-track]"),
    stage: document.querySelector("[data-reel-stage]"),
    scenes: Array.prototype.slice.call(document.querySelectorAll("[data-scene]")),
    railFill: document.querySelector("[data-reel-railfill]"),
    cur: document.querySelector("[data-reel-cur]"),
    tot: document.querySelector("[data-reel-tot]"),
    ticks: document.querySelector("[data-reel-ticks]"),
    activeIdx: -1
  };

  function setSceneActive(idx) {
    if (idx === reel.activeIdx) return;
    reel.activeIdx = idx;
    reel.scenes.forEach(function (sc, i) {
      var on = i === idx;
      sc.classList.toggle("is-live-scene", on);
      // only the active scene's living loops run (UI + diagram + packets)
      var dev = sc._device;
      if (!on) {
        sc.classList.add("is-paused");
        setPacketActive(sc, false);
      } else {
        sc.classList.remove("is-paused");
      }
    });
    if (reel.cur) reel.cur.textContent = String(Math.min(reel.scenes.length, idx + 1)).padStart(2, "0");
  }

  // x-ray amount → drive is-system + live on the active scene as scroll scrubs it.
  function setSceneXray(sc, on) {
    if (!sc._setSystem) return;
    var already = sc.classList.contains("is-system");
    if (on === already) return;
    sc._setSystem(on); // toggles is-system + is-live + packets
  }


    /* ================================================================== */
  /* ================  GSAP / SCROLLTRIGGER ENGINE  =================== */
  /* ================================================================== */
  function initGSAP() {
    gsap = window.gsap;
    ScrollTrigger = window.ScrollTrigger;
    Draggable = window.Draggable;
    GSAP_OK = !!(gsap && ScrollTrigger);

    if (!GSAP_OK || reduced) {
      // No engine OR reduced motion → guarantee fully visible static page.
      showEverything();
      runLoader(true);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (Draggable) gsap.registerPlugin(Draggable);

    // ARM animate-from states (CSS) only now that the engine is live.
    body.classList.add("is-ready");
    armed = true;

    armRevealObserver();
    runLoader(false);
    buildScrollScenes();
    ScrollTrigger.refresh();
  }

  /* --- 10. Reveal observer (for [data-reveal] groups) --- */
  function armRevealObserver() {
    var revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-group]");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealTargets.forEach(function (t) { io.observe(t); });
    } else {
      revealTargets.forEach(function (t) { t.classList.add("is-in"); });
    }
  }

  /* --- 11. LOADER + cinematic intro --- */
  function runLoader(skip) {
    var loader = document.querySelector("[data-loader]");
    var pct = document.querySelector("[data-loader-pct]");

    function igniteHero() {
      document.querySelectorAll(".hero__title, .final__title").forEach(function (h) {
        h.classList.add("is-loaded");
      });
      // Hero sub/cta/cap-strip/eyebrow are CSS [data-reveal]-managed; flip them
      // to is-in here so they reveal in lockstep with the intro (never stuck).
      document.querySelectorAll(".hero [data-reveal], .topbar[data-reveal-group]").forEach(function (el) {
        el.classList.add("is-in");
      });
      if (GSAP_OK && !reduced) {
        // animate ONLY elements GSAP fully owns (not data-reveal targets), so
        // there is no fight over the final opacity value.
        gsap.fromTo(".brand__mark", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)", delay: 0.2 });
        gsap.fromTo(".hero__grid", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" });
      }
    }

    if (skip || !loader) {
      if (loader) loader.classList.add("is-done");
      igniteHero();
      return;
    }

    loader.classList.add("is-arm");
    var p = 0, pTimer = setInterval(function () {
      p = Math.min(100, p + Math.round(6 + Math.random() * 12));
      if (pct) pct.textContent = "Initializing system · " + String(p).padStart(2, "0");
      if (p >= 100) clearInterval(pTimer);
    }, 90);

    var skipBtn = document.createElement("button");
    skipBtn.className = "loader__skip";
    skipBtn.type = "button";
    skipBtn.textContent = "Skip intro";
    loader.appendChild(skipBtn);

    var done = false;
    function finish() {
      if (done) return; done = true;
      clearInterval(pTimer);
      if (pct) pct.textContent = "System online · 100";
      loader.classList.add("is-done");
      igniteHero();
    }
    skipBtn.addEventListener("click", finish);
    setTimeout(finish, 1050);   // ~1s branded loader
    setTimeout(finish, 2200);   // absolute backstop
  }

  /* --- 12. Build all scroll-coupled scenes --- */
  function buildScrollScenes() {
    var prefersBig = !narrow;

    /* (a) SCROLL PROGRESS BAR + CHAPTER MARKERS ---------------------- */
    var bar = document.querySelector("[data-scrollbar]");
    var fill = document.querySelector("[data-scrollbar-fill]");
    if (bar) bar.classList.add("is-shown");
    if (fill) {
      gsap.to(fill, {
        scaleY: 1, ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
      });
    }
    // Map each chapter to its real section element (NOT #top, which wraps the
    // whole page and would stay "active" everywhere). Use onEnter/onEnterBack
    // so the chapter whose top most recently crossed the midline wins.
    var chapterMap = [
      [".hero", "hero"], ["#work", "work"], ["#services", "services"],
      ["#proof", "proof"], ["#operator", "operator"], ["#build", "build"]
    ];
    function setActiveChapter(name) {
      document.querySelectorAll(".chapter").forEach(function (c) {
        c.classList.toggle("is-active", c.getAttribute("data-chapter") === name);
      });
    }
    chapterMap.forEach(function (m) {
      var sec = document.querySelector(m[0]);
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 50%", end: "bottom 50%",
        onEnter: function () { setActiveChapter(m[1]); },
        onEnterBack: function () { setActiveChapter(m[1]); }
      });
    });
    setActiveChapter("hero");
    document.querySelectorAll(".chapter").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        var t = id && document.querySelector(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth", block: "start" }); }
      });
    });

    /* (b) PARALLAX DEPTH LAYERS -------------------------------------- */
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      var depth = parseFloat(el.getAttribute("data-parallax")) || 0.12;
      gsap.to(el, {
        yPercent: -depth * 100, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.4 }
      });
    });

    /* (c) HERO scroll-coupled life: title drifts + fades on exit ----- */
    gsap.to(".hero__title", {
      yPercent: -12, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.5 }
    });
    gsap.to(".cap-strip", {
      yPercent: -6, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 }
    });

    /* (d) KINETIC TYPOGRAPHY: split-line reveal + scroll parallax ---- */
    document.querySelectorAll(".ksplit").forEach(function (h) {
      ScrollTrigger.create({
        trigger: h, start: "top 85%",
        onEnter: function () { h.classList.add("is-revealed"); },
        once: true
      });
      gsap.fromTo(h, { yPercent: 5 }, {
        yPercent: -5, ease: "none",
        scrollTrigger: { trigger: h, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });

    /* (e) BAND SEAMS: gradient color-bleed wipe between sections ------ */
    document.querySelectorAll("[data-seam]").forEach(function (seam) {
      gsap.fromTo(seam, { scaleX: 0 }, {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: seam.parentElement, start: "top 92%", end: "top 60%", scrub: 0.5 }
      });
    });

    /* (f) SERVICES + PROOF entrance is owned by the CSS [data-reveal]
       observer (armRevealObserver). We add only NON-opacity scrub accents
       here so there is never a fight over final opacity. */
    // services number labels drift slightly on scroll for depth
    gsap.utils.toArray(".svc__no").forEach(function (no) {
      gsap.fromTo(no, { x: -6 }, {
        x: 6, ease: "none",
        scrollTrigger: { trigger: no.closest(".svc"), start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });

    /* (h) WORK: the full-screen immersive project REEL --------------- */
    buildReel();

    /* (i) FINAL CTA: gentle scale-in. NO opacity (the mask reveal already
       handles appearance) and once:true so the from-state can never re-arm
       and leave the title invisible if the user scrolls back up. */
    var finalTitle = document.querySelector(".final__title");
    if (finalTitle) {
      gsap.fromTo(finalTitle, { scale: 0.96 }, {
        scale: 1, duration: 0.9, ease: "power3.out", immediateRender: false,
        scrollTrigger: { trigger: ".final", start: "top 80%", once: true }
      });
    }
  }

  /* --- 13. THE REEL: pinned, scrubbed, full-screen scene sequence --- */
  function buildReel() {
    var N = reel.scenes.length;
    if (!reel.track || !reel.stage || N === 0) return;

    // Mobile / coarse pointer → NO pin/scrub hijack. The CSS static stack
    // (full-screen-per-project sequence) already handles small screens.
    if (narrow || coarse) return;

    if (reel.tot) reel.tot.textContent = String(N).padStart(2, "0");

    // build rail ticks (one per scene boundary) for the morphing progress rail
    if (reel.ticks) {
      reel.ticks.innerHTML = "";
      for (var t = 1; t < N; t++) { reel.ticks.appendChild(document.createElement("i")); }
    }

    // TIGHT 1:1 pin mapping: one viewport-height of scroll per scene.
    // pin distance = N * 100svh → no empty leading/trailing scroll.
    var SCROLL_PER_SCENE = 1;                       // viewport-heights per scene
    reel.track.style.setProperty("--reel-len", String(N * SCROLL_PER_SCENE * 100));

    // ARM the pinned layout (absolute-stacked scenes, tall driver).
    body.classList.add("is-reel");
    reel._pTiltX = 0; reel._pTiltY = 0;
    // hand x-ray control to the timeline: disable hover-driven toggles.
    reel.scenes.forEach(function (sc) { sc.classList.add("is-pinned-on"); });

    // prime scene 0 visible so there is never a blank first frame.
    setSceneActive(0);

    var winH = function () { return window.innerHeight; };

    // Master timeline: scrubbed 1:1 to the pin. Total = N segments.
    // We drive each scene's opacity/scale/parallax + x-ray + handoff inside
    // its own segment using a single ScrollTrigger.onUpdate (cheap, no layout
    // thrash — only transforms/opacity/clip-path are touched).
    // counted-up flags so metrics tick exactly once per scene entrance.
    // (declared BEFORE the ScrollTrigger so onRefresh, which can fire during
    // create(), never reads it undefined.)
    var counted = reel.scenes.map(function () { return false; });

    var st = ScrollTrigger.create({
      trigger: reel.track,
      start: "top top",
      end: "bottom bottom",
      pin: reel.stage,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: function (self) { renderReel(self.progress); },
      onRefresh: function (self) { renderReel(self ? self.progress : 0); },
      onToggle: function (self) {
        // pause every scene's loops when the whole reel leaves the viewport
        if (!self.isActive) {
          reel.scenes.forEach(function (sc) { sc.classList.add("is-paused"); setPacketActive(sc, false); });
        } else if (reel.activeIdx >= 0) {
          reel.scenes[reel.activeIdx].classList.remove("is-paused");
        }
      }
    });
    reel._st = st;

    function renderReel(p) {
      // global rail fill (morphs smoothly across the whole reel)
      if (reel.railFill) reel.railFill.style.transform = "scaleX(" + p + ")";

      // which scene are we in? segment = 1/N of total progress.
      var seg = 1 / N;
      var raw = Math.min(p / seg, N - 0.0001);      // 0..N
      var idx = Math.floor(raw);
      var local = raw - idx;                         // 0..1 within current scene

      setSceneActive(idx);

      reel.scenes.forEach(function (sc, i) {
        var lead = sc.querySelector("[data-scene-lead]");
        var dev = sc.querySelector("[data-scene-device]");
        var name = sc.querySelector("[data-scene-name]");
        var bg = sc.querySelector("[data-scene-bg]");

        if (i < idx - 1 || i > idx + 1) {
          // far offscreen scenes: cheap hide, clear any stale x-ray, no transforms
          if (sc.style.opacity !== "0") { sc.style.opacity = "0"; }
          if (sc.classList.contains("is-system")) setSceneXray(sc, false);
          return;
        }

        var op = 0, scale = 1, dx = 0, devTilt = 0, leadY = 0, devScale = 1, xray = 0;

        var isLast = (idx === N - 1);
        var isFirst = (idx === 0);
        var HANDOFF = 0.80;   // exit/enter crossfade window start (local units)
        if (i === idx) {
          // ---- ACTIVE scene: entrance → x-ray → handoff ----
          // The active scene's OPACITY stays full for its whole turn; the
          // "assemble" is expressed via scale + leadY (GPU transforms), so there
          // is never an opacity gap. Scene 0 has a quick pre-arrived fade only
          // so the opening frame is not blank. Last scene never hands off.
          var entr = clamp01(local / 0.18);                 // for scale/leadY easing
          var exit = isLast ? 0 : clamp01((local - HANDOFF) / (1 - HANDOFF));
          var enterFade = isFirst ? clamp01(0.55 + local / 0.10) : 1;
          op = Math.min(enterFade, 1 - exit);               // fades out as next fades in
          devScale = lerp(0.9, 1, easeOutExpo(entr)) * lerp(1, 0.92, exit);
          leadY = lerp(24, 0, easeOutExpo(entr)) + exit * -16;
          dx = exit * (sc.classList.contains("project-block__body--rtl") ? 46 : -46);
          // x-ray window 0.28–0.70: surface morphs into living system
          xray = clamp01((local - 0.28) / 0.42);
          // parallax: device drifts slightly relative to lead
          var par = (local - 0.5);
          dev && (devTilt = par * 4);
          // count metrics up once, right as the scene lands
          if (!counted[i] && local > 0.10) {
            counted[i] = true;
            sc.querySelectorAll("[data-count]").forEach(function (c) { animateCount(c); });
          }
        } else if (i === idx + 1) {
          // ---- NEXT scene: pre-stages IN over the SAME window the active one
          //      exits, so the two crossfade with no blank frame at the boundary.
          var inn = clamp01((local - HANDOFF) / (1 - HANDOFF));
          op = inn;
          devScale = lerp(1.06, 1, inn);
          leadY = lerp(24, 4, inn);
          dx = (sc.classList.contains("project-block__body--rtl") ? -1 : 1) * lerp(40, 8, inn);
        } else if (i === idx - 1) {
          // ---- PREVIOUS scene: fully handed off, keep hidden ----
          op = 0;
        }

        // commit (GPU-only props)
        sc.style.opacity = op.toFixed(3);
        if (lead) lead.style.transform = "translate3d(0," + leadY.toFixed(2) + "px,0)";
        if (name) name.style.transform = "translate3d(0," + (op < 1 ? (1 - op) * 18 : 0).toFixed(2) + "px,0)";
        if (bg) bg.style.opacity = (0.55 + op * 0.4).toFixed(3);
        if (dev) {
          dev._base = { dx: dx, tilt: devTilt, scale: devScale };
          commitDevice(dev, i === idx);
        }

        // x-ray: drive surface ⇄ system on the active scene only
        if (i === idx) {
          setSceneXray(sc, xray > 0.5);
        } else {
          setSceneXray(sc, false);
        }
      });
    }

    // compose the device transform from its scrubbed base + (active-only) pointer tilt.
    function commitDevice(dev, isActive) {
      var b = dev._base || { dx: 0, tilt: 0, scale: 1 };
      var py = isActive ? (reel._pTiltY || 0) : 0;   // rotateY from pointer x
      var px = isActive ? (reel._pTiltX || 0) : 0;   // rotateX from pointer y
      dev.style.transform =
        "perspective(1400px) translate3d(" + b.dx.toFixed(2) + "px,0,0) " +
        "rotateY(" + (b.tilt + py).toFixed(2) + "deg) " +
        "rotateX(" + px.toFixed(2) + "deg) " +
        "scale(" + b.scale.toFixed(3) + ")";
    }

    // mouse-reactive subtle 3D tilt on the ACTIVE scene's device (parallax depth).
    var tiltRAF = null;
    function applyTilt() {
      tiltRAF = null;
      var sc = reel.scenes[reel.activeIdx];
      if (!sc) return;
      var dev = sc.querySelector("[data-scene-device]");
      if (dev) commitDevice(dev, true);
    }
    reel.stage.addEventListener("pointermove", function (e) {
      var r = reel.stage.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      reel._pTiltY = nx * 5;     // subtle
      reel._pTiltX = ny * -4;
      if (!tiltRAF) tiltRAF = requestAnimationFrame(applyTilt);
    });
    reel.stage.addEventListener("pointerleave", function () {
      reel._pTiltX = 0; reel._pTiltY = 0;
      if (!tiltRAF) tiltRAF = requestAnimationFrame(applyTilt);
    });

    // initial paint
    renderReel(0);
    reel._render = renderReel;   // exposed for deterministic verification
    window.__reel = reel;
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  /* ------------------------------------------------------------------ */
  /* BOOTSTRAP: wait for deferred GSAP scripts, then init (or fallback). */
  /* ------------------------------------------------------------------ */
  function boot() {
    if (window.gsap) { initGSAP(); return; }
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (window.gsap || tries > 40) { clearInterval(iv); initGSAP(); } // ~2s max
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
