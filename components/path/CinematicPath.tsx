'use client';

import { useEffect, useRef } from 'react';

const chapters = [
  {
    key: 'arrival',
    no: '01',
    label: 'Arrival',
    kicker: 'The studio at the edge of the map',
    titleHtml: 'We build the systems<br />others only sketch.',
    lede: 'Software, AI, and brand for founders who want one craftsman, not a committee.',
    indexKicker: 'Path layer',
    indexTitle: 'One world, seven business moves.',
    items: ['Idea to offer', 'Offer to system', 'System to market'],
  },
  {
    key: 'studio',
    no: '02',
    label: 'Forge / Studio',
    kicker: 'Sword cut: strategy becomes product',
    titleHtml: 'Strategy becomes<br />working systems.',
    lede: 'Studio is the forge: AI agents, applications, SaaS, brand, and launch surfaces shaped as one system.',
    indexKicker: 'Studio',
    indexTitle: 'Done-for-you craft without vendor sprawl.',
    items: ['AI implementation', 'Product surface', 'Brand system'],
  },
  {
    key: 'academy',
    no: '03',
    label: 'Night Dojo',
    kicker: 'Moon cut: learn the craft behind the tool',
    titleHtml: 'Learn the craft<br />behind the tools.',
    lede: 'The world cools into the dojo: AI fluency, systems thinking, design taste, and execution reps.',
    indexKicker: 'Academy',
    indexTitle: 'Training for builders who need judgment.',
    items: ['Workshops', 'Playbooks', 'Cohorts'],
  },
  {
    key: 'growth',
    no: '04',
    label: 'Trade Routes',
    kicker: 'Route draw: demand follows the path',
    titleHtml: 'Draw the routes<br />the market follows.',
    lede: 'Growth becomes visible as signal: SEO, content, analytics, ads, proof, and conversion loops.',
    indexKicker: 'Growth',
    indexTitle: 'Distribution engineered into the system.',
    items: ['Demand map', 'Content engine', 'Measurement spine'],
  },
  {
    key: 'diagnostic',
    no: '05',
    label: 'Crossroads',
    kicker: 'The path forks into the right next move',
    titleHtml: 'Choose the path<br />that fits the moment.',
    lede: 'The diagnostic is the useful conversion: build, learn, grow, or repair what is blocking momentum.',
    indexKicker: 'Diagnostic',
    indexTitle: 'The guide points before asking for trust.',
    items: ['Four questions', 'Route result', 'Email roadmap'],
  },
  {
    key: 'proof',
    no: '06',
    label: 'Proof Gallery',
    kicker: 'Artifacts rise from the world',
    titleHtml: 'The work becomes<br />the evidence.',
    lede: 'Case studies, product surfaces, dashboards, automations, and brand systems appear as built artifacts.',
    indexKicker: 'Proof',
    indexTitle: 'Show the build, the thinking, the result.',
    items: ['Case surfaces', 'System diagrams', 'Metrics'],
  },
  {
    key: 'summit',
    no: '07',
    label: 'Summit',
    kicker: 'Dawn cut: convert wonder into motion',
    titleHtml: 'Build the system.<br />Walk the path.',
    lede: 'The story resolves into action: book the studio, join the academy, or run the diagnostic.',
    indexKicker: 'Final CTA',
    indexTitle: 'The final frame has one job: decision.',
    items: ['Book Studio', 'Join Academy', 'Run Diagnostic'],
  },
];

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function pulse(center: number, width: number, p: number) {
  return clamp(1 - Math.abs(p - center) / width);
}

export function CinematicPath() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = root.querySelector<HTMLElement>('[data-scene]');
    const indexMeter = root.querySelector<HTMLElement>('[data-index-meter]');
    const routeMain = root.querySelector<SVGPathElement>('[data-route-main]');
    const routeGrowth = root.querySelector<SVGPathElement>('[data-route-growth]');
    const forks = Array.from(root.querySelectorAll<SVGPathElement>('[data-fork]'));
    const constellation = root.querySelector<SVGPathElement>('[data-constellation]');
    const slash = root.querySelector<SVGPathElement>('[data-slash]');
    const labels = {
      no: root.querySelector<HTMLElement>('[data-chapter-no]'),
      label: root.querySelector<HTMLElement>('[data-chapter-label]'),
      kicker: root.querySelector<HTMLElement>('[data-kicker]'),
      title: root.querySelector<HTMLElement>('[data-title]'),
      lede: root.querySelector<HTMLElement>('[data-lede]'),
      indexKicker: root.querySelector<HTMLElement>('[data-index-kicker]'),
      indexTitle: root.querySelector<HTMLElement>('[data-index-title]'),
      items: [
        root.querySelector<HTMLElement>('[data-index-a]'),
        root.querySelector<HTMLElement>('[data-index-b]'),
        root.querySelector<HTMLElement>('[data-index-c]'),
      ],
    };

    let frame = 0;
    let activeChapter = -1;
    const state = { p: 0, tp: 0, mx: 0, my: 0, tmx: 0, tmy: 0 };

    const setDash = (elm: SVGPathElement | null, value: number) => {
      if (elm) elm.style.strokeDashoffset = (1 - clamp(value)).toFixed(3);
    };

    const setText = (idx: number) => {
      if (idx === activeChapter) return;
      activeChapter = idx;
      const chapter = chapters[idx];
      if (!chapter || !scene) return;
      scene.dataset.chapter = chapter.key;
      if (labels.no) labels.no.textContent = chapter.no;
      if (labels.label) labels.label.textContent = chapter.label;
      if (labels.kicker) labels.kicker.textContent = chapter.kicker;
      if (labels.title) labels.title.innerHTML = chapter.titleHtml;
      if (labels.lede) labels.lede.textContent = chapter.lede;
      if (labels.indexKicker) labels.indexKicker.textContent = chapter.indexKicker;
      if (labels.indexTitle) labels.indexTitle.textContent = chapter.indexTitle;
      labels.items.forEach((item, i) => {
        if (item) item.textContent = chapter.items[i] ?? '';
      });
    };

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      state.tp = max > 0 ? clamp(window.scrollY / max) : 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      state.tmx = (event.clientX / window.innerWidth - 0.5) * 2;
      state.tmy = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const render = () => {
      readScroll();
      if (prefersReduced) {
        state.p = state.tp;
      } else {
        const delta = state.tp - state.p;
        state.p += delta * (Math.abs(delta) > 0.2 ? 0.22 : 0.095);
        state.mx += (state.tmx - state.mx) * 0.055;
        state.my += (state.tmy - state.my) * 0.055;
      }

      const p = state.p;
      const target = state.tp;
      const semantic = target;
      const chapterIndex = clamp(Math.round(target * (chapters.length - 1)), 0, chapters.length - 1);
      const local = (semantic * (chapters.length - 1)) % 1;
      const studio = pulse(0.17, 0.11, semantic);
      const academy = pulse(0.34, 0.14, semantic);
      const growth = pulse(0.5, 0.16, semantic);
      const diagnostic = pulse(0.67, 0.13, semantic);
      const proof = pulse(0.84, 0.13, semantic) * (1 - smoothstep(0.92, 1, semantic));
      const summit = smoothstep(0.88, 1, semantic);
      const sceneMix = clamp(studio + academy + growth + diagnostic + proof + summit);
      const night = clamp(academy * 0.92 + growth * 0.72 + diagnostic * 0.58 + proof * 0.36);
      const route = smoothstep(0.18, 0.52, semantic);
      const fork = smoothstep(0.56, 0.7, semantic) * (1 - smoothstep(0.82, 0.96, semantic));
      const seal = studio * (1 - smoothstep(0.26, 0.34, semantic));
      const slashAmt = Math.max(pulse(0.17, 0.045, semantic), pulse(0.34, 0.045, semantic), pulse(0.67, 0.045, semantic));
      const time = performance.now() / 1000;

      const cameraScale = 1.05 + p * 0.22 + studio * 0.08 + proof * 0.05;
      const cameraX = -p * 46 + state.mx * 8 + diagnostic * -18 + summit * 28;
      const cameraY = -p * 30 + state.my * 5 + academy * 16 + summit * -22;
      const samuraiX = state.mx * 18 + studio * 34 + academy * -28 + diagnostic * 90 + summit * -70;
      const samuraiY = state.my * 8 + studio * -10 + academy * 22 + growth * -14 + summit * -28;
      const samuraiScale = 1 + studio * 0.08 + diagnostic * 0.05 + summit * 0.08;
      const samuraiRotate = studio * -1.2 + academy * 1.1 + diagnostic * -2.4 + summit * 1.5;
      const breath = Math.sin(time * 1.05);
      const scarfLift = Math.sin(time * 1.42 + 0.4);
      const cloakWave = Math.sin(time * 0.72 + 1.1);
      const hatTurn = academy * 1.9 + diagnostic * -2.1 + summit * 1.2 + state.my * 0.7 + breath * 0.25;
      const cloakSway = growth * 2.8 + summit * -1.1 + cloakWave * 1.4;
      const scarfX = academy * -12 + growth * 10 + summit * 8 + state.mx * -5 + scarfLift * 9;
      const scarfY = academy * -5 + growth * 3 + scarfLift * -4;
      const swordArm = studio * -5.5 + diagnostic * -8 + slashAmt * 7 + summit * 1.8;
      const legSettle = studio * 2 + diagnostic * -2 + summit * 1.4;

      scene?.style.setProperty('--p', p.toFixed(4));
      scene?.style.setProperty('--local', local.toFixed(4));
      scene?.style.setProperty('--route', route.toFixed(4));
      scene?.style.setProperty('--seal', seal.toFixed(4));
      scene?.style.setProperty('--studio', studio.toFixed(4));
      scene?.style.setProperty('--academy', academy.toFixed(4));
      scene?.style.setProperty('--night', night.toFixed(4));
      scene?.style.setProperty('--growth', growth.toFixed(4));
      scene?.style.setProperty('--diagnostic', diagnostic.toFixed(4));
      scene?.style.setProperty('--fork', fork.toFixed(4));
      scene?.style.setProperty('--proof', proof.toFixed(4));
      scene?.style.setProperty('--dawn', summit.toFixed(4));
      scene?.style.setProperty('--scene-mix', sceneMix.toFixed(4));
      scene?.style.setProperty('--slash', slashAmt.toFixed(4));
      scene?.style.setProperty('--camera-x', `${cameraX.toFixed(2)}px`);
      scene?.style.setProperty('--camera-y', `${cameraY.toFixed(2)}px`);
      scene?.style.setProperty('--camera-scale', cameraScale.toFixed(4));
      scene?.style.setProperty('--back-x', `${(state.mx * 5 - p * 18).toFixed(2)}px`);
      scene?.style.setProperty('--back-y', `${(state.my * 3 - p * 28).toFixed(2)}px`);
      scene?.style.setProperty('--back-scale', (1.08 + p * 0.08).toFixed(4));
      scene?.style.setProperty('--fore-x', `${(state.mx * 26 - p * 62).toFixed(2)}px`);
      scene?.style.setProperty('--fore-y', `${(state.my * 13 + p * 94).toFixed(2)}px`);
      scene?.style.setProperty('--fore-scale', (1.12 + p * 0.14).toFixed(4));
      scene?.style.setProperty('--sun-x', `${(state.mx * 9 + p * 18).toFixed(2)}px`);
      scene?.style.setProperty('--sun-y', `${(state.my * 7 + academy * -40 + summit * 42).toFixed(2)}px`);
      scene?.style.setProperty('--samurai-x', `${samuraiX.toFixed(2)}px`);
      scene?.style.setProperty('--samurai-y', `${samuraiY.toFixed(2)}px`);
      scene?.style.setProperty('--samurai-scale', samuraiScale.toFixed(4));
      scene?.style.setProperty('--samurai-rotate', `${samuraiRotate.toFixed(3)}deg`);
      scene?.style.setProperty('--rig-breath', breath.toFixed(4));
      scene?.style.setProperty('--hat-turn', `${hatTurn.toFixed(3)}deg`);
      scene?.style.setProperty('--cloak-sway', `${cloakSway.toFixed(3)}deg`);
      scene?.style.setProperty('--scarf-x', `${scarfX.toFixed(2)}px`);
      scene?.style.setProperty('--scarf-y', `${scarfY.toFixed(2)}px`);
      scene?.style.setProperty('--sword-arm', `${swordArm.toFixed(3)}deg`);
      scene?.style.setProperty('--leg-settle', `${legSettle.toFixed(3)}deg`);

      setDash(routeMain, route);
      setDash(routeGrowth, growth);
      forks.forEach((forkPath) => setDash(forkPath, fork));
      setDash(constellation, night);
      setDash(slash, slashAmt);
      if (indexMeter) indexMeter.style.width = `${Math.round(target * 100)}%`;
      setText(chapterIndex);
      frame = requestAnimationFrame(render);
    };

    readScroll();
    render();
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', readScroll);
    if (!prefersReduced) window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', readScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div className="pathExperience" ref={rootRef} role="main">
      <header className="topbar">
        <a className="brand" href="#arrival"><span className="seal" aria-hidden="true">道</span> Sage&nbsp;Ideas</a>
        <nav className="chapter-nav" aria-label="Story chapters">
          <a href="#arrival">Arrival</a>
          <a href="#studio">Studio</a>
          <a href="#academy">Academy</a>
          <a href="#growth">Growth</a>
          <a href="#diagnostic">Diagnostic</a>
        </nav>
        <a className="path-pill" href="/tools/route-finder">Find my route <span aria-hidden="true">↗</span></a>
      </header>

      <section className="scene" data-scene data-chapter="arrival">
        <div className="camera" data-camera>
          <img className="world world-back" data-back src="/path/00-sky.png" alt="" />
          <img className="world chapter-plate chapter-plate-studio" src="/path/scenes/studio.png" alt="" />
          <img className="world chapter-plate chapter-plate-academy" src="/path/scenes/academy.png" alt="" />
          <img className="world chapter-plate chapter-plate-growth" src="/path/scenes/growth.png" alt="" />
          <img className="world chapter-plate chapter-plate-diagnostic" src="/path/scenes/diagnostic.png" alt="" />
          <img className="world chapter-plate chapter-plate-proof" src="/path/scenes/proof.png" alt="" />
          <img className="world chapter-plate chapter-plate-summit" src="/path/scenes/summit.png" alt="" />
          <div className="sun-core" data-sun aria-hidden="true" />
          <div className="world-grade" aria-hidden="true" />
          <div className="moon-wash" aria-hidden="true" />
          <div className="dawn-wash" aria-hidden="true" />
          <div className="ink-bloom" aria-hidden="true" />
          <svg className="story-vectors" viewBox="0 0 1440 900" aria-hidden="true">
            <path className="route route-main" data-route-main pathLength="1" d="M80 736 C240 660 368 718 506 604 S764 412 978 492 S1204 650 1362 500" />
            <path className="route route-growth" data-route-growth pathLength="1" d="M176 802 C390 704 562 744 746 626 S974 512 1280 718" />
            <path className="route route-fork route-fork-a" data-fork pathLength="1" d="M714 626 C830 538 958 390 1126 328" />
            <path className="route route-fork route-fork-b" data-fork pathLength="1" d="M714 626 C900 640 1048 720 1304 664" />
            <path className="constellation" data-constellation pathLength="1" d="M206 250 L334 204 L486 270 L626 194 L770 260 L932 194 L1076 286" />
            <path className="slash" data-slash pathLength="1" d="M-80 790 C340 648 792 430 1530 80" />
          </svg>
          <div className="seal-burst" aria-label="Studio capabilities">
            <span>AI</span><span>Apps</span><span>Brand</span><span>SaaS</span>
          </div>
          <div className="proof-artifacts" aria-label="Proof surfaces">
            <article><span>01</span><strong>System map</strong></article>
            <article><span>02</span><strong>Product surface</strong></article>
            <article><span>03</span><strong>Growth loop</strong></article>
          </div>
          <div className="samurai" data-samurai>
            <img className="samurai-part samurai-base" src="/path/samurai-layers/samurai-clean.png" alt="" />
            <img className="samurai-part samurai-sword-back" src="/path/samurai-layers/sword-back.png" alt="" />
            <img className="samurai-part samurai-legs" src="/path/samurai-layers/legs.png" alt="" />
            <img className="samurai-part samurai-torso" src="/path/samurai-layers/torso-core.png" alt="" />
            <img className="samurai-part samurai-cloak" src="/path/samurai-layers/cloak-front.png" alt="" />
            <img className="samurai-part samurai-arm" src="/path/samurai-layers/sword-arm.png" alt="" />
            <img className="samurai-part samurai-head" src="/path/samurai-layers/hat-head.png" alt="" />
            <img className="samurai-part samurai-scarf" src="/path/samurai-layers/scarf.png" alt="" />
            <span className="sword-ray" aria-hidden="true" />
            <span className="guide-ray" aria-hidden="true" />
          </div>
          <img className="world world-fore" data-fore src="/path/03-fore.png" alt="" />
        </div>

        <div className="particles" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="grain" aria-hidden="true" />
        <div className="scrim" aria-hidden="true" />

        <div className="stage-ui">
          <aside className="journey-rail" aria-label="Story progress">
            <span data-progress />
            {Array.from({ length: 7 }).map((_, i) => <i key={i} />)}
          </aside>
          <p className="caption"><span data-chapter-no>01</span> — <span data-chapter-label>Arrival</span></p>
          <section className="headline" data-headline>
            <p className="kicker" data-kicker>The studio at the edge of the map</p>
            <h1 className="display" data-title>We build the systems<br />others only sketch.</h1>
            <p className="lede" data-lede>Software, AI, and brand for founders who want one craftsman, not a committee.</p>
            <div className="cta-row">
              <a className="path-cta path-cta-primary" href="/tools/route-finder"><strong>Start the path</strong><span aria-hidden="true">→</span></a>
              <a className="path-cta path-cta-ghost" href="#studio"><strong>Watch the story</strong><span aria-hidden="true">↓</span></a>
            </div>
          </section>
          <section className="story-index" aria-label="Current service chapter">
            <p data-index-kicker>Path layer</p>
            <h2 data-index-title>One world, seven business moves.</h2>
            <div className="index-meter"><span data-index-meter /></div>
            <ul>
              <li data-index-a>Idea to offer</li>
              <li data-index-b>Offer to system</li>
              <li data-index-c>System to market</li>
            </ul>
          </section>
        </div>
      </section>

      <article id="arrival" className="scroll-beat" />
      <article id="studio" className="scroll-beat" />
      <article id="academy" className="scroll-beat" />
      <article id="growth" className="scroll-beat" />
      <article id="diagnostic" className="scroll-beat" />
      <article id="proof" className="scroll-beat" />
      <article id="summit" className="scroll-beat" />
    </div>
  );
}
