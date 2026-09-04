/* Sage Academy shared widgets: <sage-lang-switch> and <sage-chat> */
(function () {
  const LANGS = [
    ['en', 'English', 'EN'], ['es', 'Español', 'ES'], ['zh', '中文', 'ZH'],
    ['hi', 'हिन्दी', 'HI'], ['pt', 'Português', 'PT'], ['fr', 'Français', 'FR'],
  ];
  const getLang = () => { try { return localStorage.getItem('sage-lang') || 'en'; } catch (e) { return 'en'; } };

  /* ---------- shared app state (one organism) ---------- */
  const SKEY = 'sage-state';
  const SageState = {
    read() { try { return JSON.parse(localStorage.getItem(SKEY) || '{}'); } catch (e) { return {}; } },
    get(k, d) { const v = this.read()[k]; return v === undefined ? d : v; },
    set(k, v) {
      const o = this.read(); o[k] = v;
      try { localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('sage-state', { detail: { key: k, value: v } }));
    },
  };
  window.SageState = SageState;

  /* ---------- language switcher ---------- */
  class SageLang extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      const cur = getLang();
      const code = (LANGS.find((l) => l[0] === cur) || LANGS[0])[2];
      root.innerHTML = `
        <style>
          :host { display: inline-block; position: relative; font-family: 'JetBrains Mono', monospace; }
          .pill { display: flex; align-items: center; gap: 8px; border: 1px solid #2A2A33; border-radius: 20px; padding: 8px 14px; cursor: pointer; user-select: none; font-size: 11px; color: #B6B6C0; white-space: nowrap; background: transparent; font-family: inherit; }
          .pill:hover { border-color: #343440; color: #F2EFE9; }
          .pill:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; }
          .menu { position: absolute; right: 0; top: calc(100% + 8px); background: #141418; border: 1px solid #2A2A33; border-radius: 12px; padding: 6px; min-width: 150px; box-shadow: 0 20px 48px -12px rgba(0,0,0,0.8); z-index: 90; display: none; }
          .menu.open { display: block; }
          .item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 13.5px; color: #B6B6C0; white-space: nowrap; font-family: 'Hanken Grotesk', 'Noto Sans SC', 'Noto Sans Devanagari', sans-serif; }
          .item:hover { background: rgba(255,255,255,0.06); }
          .item.cur { color: #F2EFE9; background: rgba(61,90,254,0.12); }
          .item .c { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #4A4A54; }
          .item.cur .c { color: #8FA0FF; }
        </style>
        <button class="pill" aria-label="Language"><span style="font-size:13px">⊕</span>${code}<span style="font-size:9px;color:#4A4A54">▾</span></button>
        <div class="menu" role="menu">
          ${LANGS.map((l) => `<div class="item${l[0] === cur ? ' cur' : ''}" data-k="${l[0]}" role="menuitem">${l[1]}<span class="c">${l[2]}</span></div>`).join('')}
        </div>`;
      const menu = root.querySelector('.menu');
      root.querySelector('.pill').addEventListener('click', () => menu.classList.toggle('open'));
      root.querySelectorAll('.item').forEach((it) => it.addEventListener('click', () => {
        try { localStorage.setItem('sage-lang', it.dataset.k); } catch (e) {}
        location.reload();
      }));
      document.addEventListener('click', (e) => { if (!e.composedPath().includes(this)) menu.classList.remove('open'); });
    }
  }
  if (!customElements.get('sage-lang-switch')) customElements.define('sage-lang-switch', SageLang);

  /* ---------- warm helper chat ---------- */
  const REPLIES = [
    [/start|begin|first|which course|donde|empez|开始|शुरू/i, 'Start with Engineering Judgment (Course 00). It\u2019s the loop every other course runs on \u2014 and in about 25 minutes you\u2019ll ship your first artifact. No prerequisites.'],
    [/proof|prove|artifact|certificat|prueba|证明|प्रमाण/i, 'A proof is a check a skeptic can run \u2014 a passing eval, a decision memo, a repaired case. Every course ends in one, and they stack into a ledger you can share with anyone.'],
    [/pric|cost|\$|pay|precio|价格|मूल्य|tarif/i, 'One membership: $250/year, every course as it ships \u2014 labs, proofs, recall, leagues, certificates. And a 14-day honest guarantee: no proof shipped, full refund.'],
    [/refund|guarantee|cancel|garant/i, '14 days, no questions \u2014 if you haven\u2019t shipped a proof by then, we refund everything. Cancel anytime after that; your ledger stays yours.'],
    [/language|idioma|语言|भाषा|langue/i, 'The site speaks English, Espa\u00f1ol, \u4e2d\u6587, \u0939\u093f\u0928\u094d\u0926\u0940, Portugu\u00eas and Fran\u00e7ais \u2014 the \u2295 switcher in the nav. Lessons are English-first for now, with more on the way.'],
    [/human|person|contact|email|talk|support|help/i, 'A real person reads everything at hello@sageideas.dev \u2014 usually same-day. For account things, that\u2019s the fastest path.'],
    [/^(hi|hey|hello|hola|ol\u00e1|salut|\u4f60\u597d|\u0928\u092e\u0938\u094d\u0924\u0947)\b/i, 'Hey! Happy you\u2019re here. What can I help you figure out \u2014 courses, proofs, or pricing?'],
    [/hard|difficult|beginner|new to|junior/i, 'It meets you where you are \u2014 the pretest in each lesson calibrates, and the starter labs fail on purpose so the first win is guaranteed. Plenty of career-switchers here.'],
    [/time|hours|week|long/i, 'Most people do one lesson (~30 min) a few times a week, plus a 6-minute recall queue. A course is a 4\u20136 week sprint at that pace.'],
  ];
  const FALLBACK = 'Good question \u2014 I don\u2019t want to guess at that one. Send it to hello@sageideas.dev and a human will answer today. Meanwhile: courses, proofs, or pricing \u2014 I know those cold.';
  const GREETING = 'Hey \u2014 I\u2019m Sprout. Questions about courses, proofs, or where to start? Ask away. A human reads everything too.';
  const CHIPS = ['Where do I start?', 'What\u2019s a proof?', 'How does pricing work?'];

  class SageChat extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          .fab { position: fixed; right: 20px; bottom: 20px; width: 54px; height: 54px; border-radius: 50%; background: #3D5AFE; color: #fff; border: none; cursor: pointer; font-size: 19px; box-shadow: 0 0 24px rgba(61,90,254,0.4), 0 12px 32px -8px rgba(0,0,0,0.6); z-index: 95; transition: transform 0.2s cubic-bezier(0.16,1,0.3,1); }
          .fab:hover { transform: translateY(-2px) scale(1.05); }
          .fab:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 3px; }
          .panel { position: fixed; right: 20px; bottom: 86px; width: min(330px, calc(100vw - 40px)); max-height: min(480px, calc(100vh - 120px)); background: #141418; border: 1px solid #2A2A33; border-radius: 16px; box-shadow: 0 32px 80px -24px rgba(0,0,0,0.9); z-index: 95; display: none; flex-direction: column; overflow: hidden; font-family: 'Hanken Grotesk', sans-serif; }
          .panel.open { display: flex; }
          .head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid #1E1E24; }
          .dot { width: 26px; height: 26px; border-radius: 8px; background: #3D5AFE; color: #fff; display: grid; place-items: center; font-size: 11px; flex-shrink: 0; }
          .head b { font-size: 13.5px; color: #F2EFE9; font-weight: 700; display: block; }
          .head small { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #18B663; display: flex; align-items: center; gap: 5px; }
          .head small::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: #18B663; }
          .x { margin-left: auto; background: none; border: none; color: #9598A2; font-size: 16px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
          .x:hover { color: #F2EFE9; background: rgba(255,255,255,0.06); }
          .msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 180px; }
          .m { max-width: 85%; padding: 10px 14px; font-size: 13.5px; line-height: 1.55; border-radius: 14px; }
          .bot { align-self: flex-start; background: #1A1A20; color: #D6D6DE; border-radius: 14px 14px 14px 4px; }
          .me { align-self: flex-end; background: #3D5AFE; color: #fff; border-radius: 14px 14px 4px 14px; }
          .chips { display: flex; flex-wrap: wrap; gap: 7px; padding: 0 16px 12px; }
          .chip { border: 1px solid #2A2A33; background: transparent; border-radius: 16px; padding: 7px 13px; font-size: 12px; color: #B6B6C0; cursor: pointer; font-family: inherit; }
          .chip:hover { border-color: rgba(61,90,254,0.5); color: #F2EFE9; background: rgba(61,90,254,0.07); }
          .row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #1E1E24; }
          .in { flex: 1; background: #0F0F13; border: 1px solid #2A2A33; border-radius: 10px; padding: 10px 13px; font-size: 13.5px; color: #F2EFE9; font-family: inherit; outline: none; min-width: 0; }
          .in:focus { border-color: rgba(61,90,254,0.55); }
          .send { background: #3D5AFE; color: #fff; border: none; border-radius: 10px; padding: 0 15px; font-size: 14px; cursor: pointer; font-family: inherit; font-weight: 600; }
          .send:hover { background: #6E83FF; }
        </style>
        <button class="fab" aria-label="Chat with Sprout">◆</button>
        <div class="panel" role="dialog" aria-label="Sage helper">
          <div class="head"><span class="dot">◆</span><span><b>Sprout</b><small>usually replies in seconds</small></span><button class="x" aria-label="Close">×</button></div>
          <div class="msgs"></div>
          <div class="chips">${CHIPS.map((c) => `<button class="chip">${c}</button>`).join('')}</div>
          <div class="row"><input class="in" placeholder="Ask me anything…"><button class="send">→</button></div>
        </div>`;
      const panel = root.querySelector('.panel');
      const msgs = root.querySelector('.msgs');
      const input = root.querySelector('.in');
      const add = (cls, text) => {
        const d = document.createElement('div');
        d.className = 'm ' + cls; d.textContent = text;
        msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
        return d;
      };
      const answer = (q) => {
        const hit = REPLIES.find(([re]) => re.test(q));
        const typing = add('bot', '…');
        setTimeout(() => { typing.textContent = hit ? hit[1] : FALLBACK; msgs.scrollTop = msgs.scrollHeight; }, 550);
      };
      const send = (q) => { if (!q.trim()) return; add('me', q.trim()); answer(q); input.value = ''; };
      root.querySelector('.fab').addEventListener('click', () => {
        panel.classList.toggle('open');
        if (panel.classList.contains('open') && !msgs.children.length) add('bot', GREETING);
      });
      root.querySelector('.x').addEventListener('click', () => panel.classList.remove('open'));
      root.querySelector('.send').addEventListener('click', () => send(input.value));
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(input.value); });
      root.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => send(c.textContent)));
    }
  }
  class SageNotify extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const hideDue = this.hasAttribute('hide-due');
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host { display: inline-flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; }
          .due { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; color: #E0A93E; border: 1px solid rgba(224,169,62,0.35); padding: 5px 11px; border-radius: 14px; white-space: nowrap; text-decoration: none; }
          .due:hover { background: rgba(224,169,62,0.08); }
          .due.clear { color: #18B663; border-color: rgba(24,182,99,0.35); }
          .due.clear:hover { background: rgba(24,182,99,0.08); }
          .due:focus-visible, .bell:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; }
          .wrap { position: relative; display: inline-flex; }
          .bell { position: relative; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; border: 1px solid #2A2A33; background: transparent; color: #9598A2; font-size: 13px; cursor: pointer; }
          .bell:hover { border-color: #343440; color: #F2EFE9; }
          .bell .dot { position: absolute; top: 1px; right: 1px; width: 8px; height: 8px; border-radius: 50%; background: #18B663; border: 1.5px solid #0B0B0E; }
          .bell.read .dot { display: none; }
          .panel { position: absolute; right: 0; top: calc(100% + 10px); width: 308px; background: #141418; border: 1px solid #2A2A33; border-radius: 14px; box-shadow: 0 24px 56px -16px rgba(0,0,0,0.85); z-index: 90; display: none; overflow: hidden; }
          .panel.open { display: block; }
          .head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #1E1E24; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #9598A2; }
          .head button { background: none; border: none; color: #8FA0FF; font-family: inherit; font-size: 9.5px; letter-spacing: 0.06em; cursor: pointer; }
          .item { display: flex; gap: 11px; padding: 13px 16px; border-bottom: 1px solid #1E1E24; text-decoration: none; align-items: flex-start; }
          .item:last-child { border-bottom: none; }
          .item:hover { background: rgba(255,255,255,0.03); }
          .item .d { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
          .item b { display: block; font-family: 'Hanken Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: #F2EFE9; line-height: 1.35; }
          .item small { font-size: 10px; color: #9598A2; }
          .read .item b { color: #9598A2; font-weight: 400; }
        </style>
        ${hideDue ? '' : '<a class="due" href="Sage Recall Queue.dc.html">◔ 4 due · 6 min</a>'}
        <span class="wrap">
          <button class="bell" aria-label="Notifications">◈<span class="dot"></span></button>
          <div class="panel">
            <div class="head">Notifications <span style="font-size:8.5px;color:#4A4A54;letter-spacing:0.08em;">· demo data</span><button class="mark">mark all read</button></div>
            <a class="item" href="Sage Lesson Player.dc.html"><span class="d" style="background:#18B663"></span><span><b>Gate rag-core-38 unblocked</b><small>case #7 repaired · 2h ago</small></span></a>
            <a class="item" href="Sage Recall Queue.dc.html"><span class="d" style="background:#E0A93E"></span><span><b>4 recall prompts due today</b><small>~6 min · 7-day window closing</small></span></a>
            <a class="item" href="Sage Leagues.dc.html"><span class="d" style="background:#8FA0FF"></span><span><b>Gold II closes Sunday</b><small>you’re #4 — top 3 promote</small></span></a>
          </div>
        </span>`;
      const panel = root.querySelector('.panel');
      const bell = root.querySelector('.bell');
      bell.addEventListener('click', () => panel.classList.toggle('open'));
      root.querySelector('.mark').addEventListener('click', (e) => { e.stopPropagation(); bell.classList.add('read'); panel.classList.add('read'); });
      const dueEl = root.querySelector('.due');
      if (dueEl) {
        const refresh = () => {
          const d = window.SageState ? window.SageState.get('recallDue', 4) : 4;
          dueEl.classList.toggle('clear', d === 0);
          dueEl.textContent = d === 0 ? '✓ recall clear' : '◔ ' + d + ' due · 6 min';
        };
        document.addEventListener('sage-state', refresh);
        window.addEventListener('storage', refresh);
        refresh();
      }
      document.addEventListener('click', (e) => { if (!e.composedPath().includes(this)) panel.classList.remove('open'); });
    }
  }
  class SageAppNav extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const cur = this.getAttribute('current') || '';
      const items = [
        ['today', 'Today', 'Sage Dashboard Cockpit.dc.html'],
        ['rep', 'Daily Rep', 'Sage Daily Rep.dc.html'],
        ['course', 'Course', 'Sage Course Map.dc.html'],
        ['lesson', 'Lesson', 'Sage Lesson Player.dc.html'],
        ['lab', 'Lab', 'Sage Lab.dc.html'],
        ['recall', 'Recall', 'Sage Recall Queue.dc.html'],
        ['progress', 'Progress', 'Sage Progress.dc.html'],
        ['leagues', 'Leagues', 'Sage Leagues.dc.html'],
        ['challenge', 'Challenge', 'Sage Weekly Challenge.dc.html'],
        ['evidence', 'Evidence', 'Sage Evidence Portfolio.dc.html'],
      ];
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host { display: inline-flex; align-items: center; gap: 1px; margin: 0 4px; }
          a { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #9598A2; text-decoration: none; padding: 6px 10px; border-radius: 12px; white-space: nowrap; }
          a:hover { color: #F2EFE9; background: rgba(255,255,255,0.05); }
          a.cur { color: #F2EFE9; background: rgba(255,255,255,0.07); }
          a:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; }
          @media (max-width: 1080px) { .row { display: none; } }
        </style>
        <span class="row">${items.map((it) => `<a class="${it[0] === cur ? 'cur' : ''}" href="${it[2]}">${it[1]}</a>`).join('')}</span>`;
      if (!document.getElementById('sage-tabbar-pad')) {
        const s = document.createElement('style');
        s.id = 'sage-tabbar-pad';
        s.textContent = '@media (max-width: 1080px) { body { padding-bottom: 84px !important; } sage-chat { display: none; } }';
        document.head.appendChild(s);
      }
      // Tab bar must live on document.body: a backdrop-filtered sticky header creates
      // a containing block that hijacks position:fixed descendants.
      const mountTabs = () => {
        if (document.querySelector('sage-tab-bar') || !document.body) return;
        const tb = document.createElement('sage-tab-bar');
        tb.setAttribute('current', cur);
        document.body.appendChild(tb);
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountTabs);
      else mountTabs();
    }
  }
  class SageTabBar extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const cur = this.getAttribute('current') || '';
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          .tabs { display: none; }
          @media (max-width: 1080px) {
            .tabs { display: grid; grid-template-columns: repeat(5, 1fr); position: fixed; left: 0; right: 0; bottom: 0; z-index: 95; background: rgba(13,13,17,0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid #1E1E24; padding: 6px max(8px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-bottom)); }
            .tab { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 7px 2px; border-radius: 12px; text-decoration: none; color: #9598A2; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.04em; border: none; background: none; cursor: pointer; min-height: 44px; justify-content: center; }
            .tab .ic { font-size: 15px; line-height: 1; }
            .tab.cur { color: #F2EFE9; }
            .tab.cur .ic { color: #8FA0FF; }
            .tab:focus-visible { outline: 2px solid #8FA0FF; outline-offset: -2px; }
          }
          .sheet { display: none; }
          .sheet.open { display: block; position: fixed; inset: 0; z-index: 96; background: rgba(11,11,14,0.6); }
          .sheet .card { position: absolute; left: 10px; right: 10px; bottom: 78px; background: #141418; border: 1px solid #2A2A33; border-radius: 18px; box-shadow: 0 30px 70px -18px rgba(0,0,0,0.9); padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
          .sheet a { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #B6B6C0; text-decoration: none; padding: 14px; border-radius: 12px; }
          .sheet a:hover { color: #F2EFE9; background: rgba(255,255,255,0.05); }
          .sheet a.cur { color: #F2EFE9; background: rgba(255,255,255,0.07); }
        </style>
        <nav class="tabs" aria-label="App">
          <a class="tab ${cur === 'today' ? 'cur' : ''}" href="Sage Dashboard Cockpit.dc.html"><span class="ic">◆</span>Today</a>
          <a class="tab ${['course','lesson','lab'].includes(cur) ? 'cur' : ''}" href="Sage Course Map.dc.html"><span class="ic">▤</span>Course</a>
          <a class="tab ${cur === 'recall' ? 'cur' : ''}" href="Sage Recall Queue.dc.html"><span class="ic">◔</span>Recall</a>
          <a class="tab ${cur === 'evidence' ? 'cur' : ''}" href="Sage Evidence Portfolio.dc.html"><span class="ic">✓</span>Evidence</a>
          <button class="tab more ${['rep','progress','leagues','challenge'].includes(cur) ? 'cur' : ''}"><span class="ic">≡</span>More</button>
        </nav>
        <div class="sheet">
          <div class="card">
            <a class="${cur === 'rep' ? 'cur' : ''}" href="Sage Daily Rep.dc.html">◐ Daily rep</a>
            <a class="${cur === 'lesson' ? 'cur' : ''}" href="Sage Lesson Player.dc.html">▶ Lesson</a>
            <a class="${cur === 'lab' ? 'cur' : ''}" href="Sage Lab.dc.html">⌗ Lab</a>
            <a class="${cur === 'progress' ? 'cur' : ''}" href="Sage Progress.dc.html">◧ Progress</a>
            <a class="${cur === 'leagues' ? 'cur' : ''}" href="Sage Leagues.dc.html">♛ Leagues</a>
            <a class="${cur === 'challenge' ? 'cur' : ''}" href="Sage Weekly Challenge.dc.html">◈ Challenge</a>
            <a href="Sage Settings.dc.html">⚙ Settings</a>
            <a href="Sage Home.dc.html">← Marketing site</a>
          </div>
        </div>`;
      const sheet = root.querySelector('.sheet');
      root.querySelector('.more').addEventListener('click', () => sheet.classList.toggle('open'));
      sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.classList.remove('open'); });
    }
  }
  if (!customElements.get('sage-tab-bar')) customElements.define('sage-tab-bar', SageTabBar);
  if (!customElements.get('sage-app-nav')) customElements.define('sage-app-nav', SageAppNav);

  if (!customElements.get('sage-notify')) customElements.define('sage-notify', SageNotify);

  /* ---------- copy chip ---------- */
  class SageCopy extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          button { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; background: #3D5AFE; border: none; border-radius: 18px; padding: 9px 16px; cursor: pointer; white-space: nowrap; }
          button:hover { background: #6E83FF; }
          button.ok { background: #18B663; color: #04130C; }
          button:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; }
        </style>
        <button>${this.getAttribute('label') || 'copy link'}</button>`;
      const btn = root.querySelector('button');
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(this.getAttribute('value') || ''); } catch (e) {}
        const old = btn.textContent;
        btn.textContent = '✓ copied'; btn.classList.add('ok');
        setTimeout(() => { btn.textContent = old; btn.classList.remove('ok'); }, 1600);
      });
    }
  }
  if (!customElements.get('sage-copy')) customElements.define('sage-copy', SageCopy);

  /* ---------- share card modal ---------- */
  class SageShare extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          .trigger { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #8FA0FF; background: none; border: none; cursor: pointer; padding: 0; white-space: nowrap; }
          .trigger:hover { color: #B9C4FF; }
          .trigger:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; border-radius: 4px; }
          .overlay { position: fixed; inset: 0; background: rgba(6,6,9,0.72); backdrop-filter: blur(6px); z-index: 120; display: none; align-items: center; justify-content: center; padding: 20px; }
          .overlay.open { display: flex; }
          .card { width: min(430px, 100%); background: linear-gradient(165deg, #14141C, #0E0E12); border: 1px solid rgba(61,90,254,0.45); border-radius: 20px; padding: 30px; box-shadow: 0 0 60px rgba(61,90,254,0.18), 0 40px 100px -30px rgba(0,0,0,0.95); font-family: 'Hanken Grotesk', sans-serif; color: #F2EFE9; }
          .brand { display: flex; align-items: center; gap: 9px; font-size: 12.5px; font-weight: 700; }
          .brand .m { display: grid; place-items: center; width: 22px; height: 22px; border-radius: 7px; background: #3D5AFE; color: #fff; font-size: 10px; }
          .h { font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 27px; letter-spacing: -0.02em; line-height: 1.12; margin: 20px 0 14px; }
          .stat { display: flex; align-items: baseline; gap: 12px; }
          .stat b { font-family: 'Fraunces', Georgia, serif; font-weight: 700; font-size: 44px; color: #18B663; letter-spacing: -0.03em; }
          .stat small { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #9598A2; }
          .verify { margin-top: 18px; background: #08080A; border: 1px solid #1E1E24; border-radius: 10px; padding: 12px 14px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #18B663; overflow-x: auto; white-space: nowrap; }
          .foot { margin-top: 14px; font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #4A4A54; }
          .row { display: flex; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
          .row a, .row button { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 10px 15px; border-radius: 18px; cursor: pointer; text-decoration: none; white-space: nowrap; border: 1px solid #2A2A33; color: #B6B6C0; background: none; }
          .row a:hover, .row button:hover { border-color: #343440; color: #F2EFE9; }
          .row .x { margin-left: auto; }
        </style>
        <button class="trigger">${this.getAttribute('label') || 'share →'}</button>
        <div class="overlay" role="dialog" aria-label="Share">
          <div class="card">
            <div class="brand"><span class="m">◆</span>Sage Academy</div>
            <div class="h"></div>
            <div class="stat"><b></b><small></small></div>
            <div class="verify"></div>
            <div class="foot">sageideas.dev · proof, not vibes · anyone can run the verify</div>
            <div class="row">
              <button class="copy">copy as text</button>
              <a class="tw" target="_blank" rel="noopener">post on X</a>
              <a class="li" target="_blank" rel="noopener">LinkedIn</a>
              <button class="x">close</button>
            </div>
          </div>
        </div>`;
      const overlay = root.querySelector('.overlay');
      const open = () => {
        const h = this.getAttribute('headline') || 'Proof shipped';
        const stat = this.getAttribute('stat') || '';
        const sub = this.getAttribute('sub') || '';
        const verify = this.getAttribute('verify') || 'curl sageideas.dev/verify/SA-7F2K-91';
        root.querySelector('.h').textContent = h;
        root.querySelector('.stat b').textContent = stat;
        root.querySelector('.stat small').textContent = sub;
        root.querySelector('.verify').textContent = '$ ' + verify;
        const text = h + ' — ' + sub + '. Verify it yourself: ' + verify + ' · via Sage Academy';
        root.querySelector('.tw').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
        root.querySelector('.li').href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent('https://sageideas.dev');
        root.querySelector('.copy').onclick = async () => {
          try { await navigator.clipboard.writeText(text); } catch (e) {}
          root.querySelector('.copy').textContent = '✓ copied';
          setTimeout(() => { root.querySelector('.copy').textContent = 'copy as text'; }, 1600);
        };
        overlay.classList.add('open');
      };
      root.querySelector('.trigger').addEventListener('click', open);
      root.querySelector('.x').addEventListener('click', () => overlay.classList.remove('open'));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    }
  }
  if (!customElements.get('sage-share')) customElements.define('sage-share', SageShare);

  /* ---------- ⌘K search ---------- */
  const INDEX = [
    ['Lesson', 'Map the blast radius before you touch anything', 'Sage Lesson Player.dc.html', 'Course 00 · lesson 07'],
    ['Lesson', 'Lab: catch the third reader', 'Sage Lab.dc.html', 'Course 00 · lab 07L'],
    ['Lesson', 'Course map · Engineering Judgment', 'Sage Course Map.dc.html', '16 lessons · 4 modules'],
    ['Field note', 'The invoice that emailed itself twice', 'Sage Field Note Article.dc.html', 'repair log · 9 min'],
    ['Field note', 'All field notes', 'Sage Field Notes.dc.html', '62 notes'],
    ['Course', 'Engineering Judgment & the Sage Learning OS', 'Sage Course Landing.dc.html', 'Course 00 · start here'],
    ['Course', 'Programming Fundamentals', 'Sage Course Landing.dc.html', 'Engineering · 18 lessons'],
    ['Course', 'Backend Engineering', 'Sage Course Landing.dc.html', 'Engineering · 20 lessons'],
    ['Course', 'Databases & Data Modeling', 'Sage Course Landing.dc.html', 'Data · 20 lessons'],
    ['Course', 'Think Like a Senior Engineer: Concept Maps', 'Sage Course Landing.dc.html', 'Foundations · 30 lessons'],
    ['Course', 'Full catalog · 23 courses', 'Sage Courses.dc.html', '6 tracks · live + in production'],
    ['Page', 'How it works', 'Sage How It Works.dc.html', 'ten moves · one loop'],
    ['Page', 'Why proof', 'Sage Why Proof.dc.html', 'the manifesto'],
    ['Page', 'Pricing', 'Sage Pricing.dc.html', 'free · pro · teams'],
    ['Concept', 'Blast radius — bounded by readers', 'Sage Lesson Player.dc.html', 'skill graph: 88 solid'],
    ['Concept', 'Idempotency — intent, not time', 'Sage Recall Queue.dc.html', 'skill graph: 94 solid'],
    ['Concept', 'Defended omissions', 'Sage Lesson Player.dc.html', 'skill graph: 71 decaying'],
    ['Screen', 'Today · cockpit', 'Sage Dashboard Cockpit.dc.html', 'next best action'],
    ['Screen', 'Daily Rep', 'Sage Daily Rep.dc.html', '~6 min · shields the streak'],
    ['Screen', 'Recall queue', 'Sage Recall Queue.dc.html', '4 due'],
    ['Screen', 'Evidence ledger', 'Sage Evidence Portfolio.dc.html', '14 artifacts'],
    ['Screen', 'Leagues', 'Sage Leagues.dc.html', 'Gold II · #4'],
    ['Screen', 'Weekly challenge', 'Sage Weekly Challenge.dc.html', 'closes Sunday'],
    ['Screen', 'Progress & skill graph', 'Sage Progress.dc.html', 'mastery over time'],
    ['Screen', 'Settings', 'Sage Settings.dc.html', 'billing · notifications'],
    ['Screen', 'Help center', 'Sage Help.dc.html', 'a human answers'],
  ];
  class SageSearch extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          .ov { position: fixed; inset: 0; background: rgba(6,6,9,0.72); backdrop-filter: blur(6px); z-index: 130; display: none; align-items: flex-start; justify-content: center; padding: 12vh 20px 20px; }
          .ov.open { display: flex; }
          .box { width: min(560px, 100%); background: #141418; border: 1px solid rgba(61,90,254,0.45); border-radius: 16px; overflow: hidden; box-shadow: 0 40px 100px -30px rgba(0,0,0,0.95); font-family: 'Hanken Grotesk', sans-serif; }
          input { width: 100%; background: transparent; border: none; outline: none; padding: 17px 20px; font-size: 15.5px; color: #F2EFE9; font-family: inherit; border-bottom: 1px solid #1E1E24; }
          .res { max-height: 46vh; overflow-y: auto; }
          .grp { font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #4A4A54; padding: 11px 20px 5px; }
          a { display: flex; align-items: center; gap: 12px; padding: 10px 20px; text-decoration: none; }
          a.act, a:hover { background: rgba(61,90,254,0.1); }
          a b { font-size: 13.5px; color: #F2EFE9; font-weight: 600; flex: 1; min-width: 0; }
          a small { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #9598A2; white-space: nowrap; }
          .none { padding: 22px 20px; font-size: 13.5px; color: #9598A2; }
          .foot { display: flex; gap: 16px; padding: 10px 20px; border-top: 1px solid #1E1E24; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #4A4A54; }
        </style>
        <div class="ov" role="dialog" aria-label="Search">
          <div class="box">
            <input placeholder="Search lessons, notes, concepts, screens…" aria-label="Search">
            <div class="res"></div>
            <div class="foot"><span>↑↓ move</span><span>↵ open</span><span>esc close</span></div>
          </div>
        </div>`;
      const ov = root.querySelector('.ov');
      const input = root.querySelector('input');
      const res = root.querySelector('.res');
      let act = 0, links = [];
      const render = (q) => {
        const query = (q || '').toLowerCase().trim();
        const hits = INDEX.filter((r) => !query || (r[1] + ' ' + r[0] + ' ' + r[3]).toLowerCase().includes(query));
        const groups = {};
        hits.forEach((r) => { (groups[r[0]] = groups[r[0]] || []).push(r); });
        res.innerHTML = hits.length
          ? Object.entries(groups).map(([g, rs]) => `<div class="grp">${g}s</div>` + rs.map((r) => `<a href="${r[2]}"><b>${r[1]}</b><small>${r[3]}</small></a>`).join('')).join('')
          : '<div class="none">Nothing in the ledger by that name — try “radius”, “recall”, or “billing”.</div>';
        links = Array.from(res.querySelectorAll('a'));
        act = 0;
        if (links[0]) links[0].classList.add('act');
      };
      const open = () => { ov.classList.add('open'); input.value = ''; render(''); setTimeout(() => input.focus(), 30); };
      const close = () => ov.classList.remove('open');
      input.addEventListener('input', () => render(input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!links.length) return;
          links[act].classList.remove('act');
          act = (act + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length;
          links[act].classList.add('act');
          links[act].scrollIntoView === undefined || links[act].offsetTop;
          res.scrollTop = Math.max(0, links[act].offsetTop - 120);
        }
        if (e.key === 'Enter' && links[act]) { window.location.href = links[act].getAttribute('href'); }
        if (e.key === 'Escape') close();
      });
      ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ov.classList.contains('open') ? close() : open(); }
        else if (e.key === 'Escape') close();
      });
    }
  }
  if (!customElements.get('sage-search')) customElements.define('sage-search', SageSearch);
  const mountSearch = () => {
    if (!document.querySelector('sage-search') && document.body) document.body.appendChild(document.createElement('sage-search'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountSearch);
  else mountSearch();

  /* ---------- shared site footer ---------- */
  class SageFooter extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const root = this.attachShadow({ mode: 'open' });
      const saved = (() => { try { return localStorage.getItem('sage-newsletter') || ''; } catch (e) { return ''; } })();
      root.innerHTML = `
        <style>
          :host { display: block; border-top: 1px solid #1E1E24; background: #0D0D11; font-family: 'Hanken Grotesk', sans-serif; }
          .wrap { max-width: 1240px; margin: 0 auto; padding: clamp(44px, 6vw, 72px) clamp(20px, 4vw, 48px) 28px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 36px 28px; }
          .brand { display: flex; align-items: center; gap: 10px; color: #F2EFE9; font-size: 14.5px; font-weight: 700; letter-spacing: -0.01em; }
          .brand .m { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: #3D5AFE; color: #fff; font-size: 12px; box-shadow: 0 0 18px rgba(61,90,254,0.35); }
          .loop { margin-top: 14px; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #9598A2; line-height: 1.8; }
          .loop b { color: #8FA0FF; font-weight: 500; }
          h4 { margin: 0 0 14px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.14em; color: #4A4A54; }
          ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
          ul a { color: #9C9CA6; text-decoration: none; font-size: 13.5px; }
          ul a:hover { color: #F2EFE9; }
          ul a:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; border-radius: 4px; }
          .news p { margin: 0 0 12px; font-size: 13px; color: #9C9CA6; line-height: 1.55; }
          .row { display: flex; gap: 8px; }
          input { flex: 1; min-width: 0; background: #0F0F13; border: 1px solid #2A2A33; border-radius: 10px; padding: 10px 13px; font-size: 13px; color: #F2EFE9; font-family: inherit; outline: none; }
          input:focus { border-color: rgba(61,90,254,0.55); }
          .go { background: #3D5AFE; color: #fff; border: none; border-radius: 10px; padding: 0 16px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
          .go:hover { background: #6E83FF; }
          .ok { display: none; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: #18B663; padding: 10px 0; }
          .done .row { display: none; }
          .done .ok { display: flex; }
          .note { margin-top: 10px; font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: #4A4A54; }
          .bottom { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: clamp(36px, 5vw, 56px); padding-top: 22px; border-top: 1px solid #1E1E24; font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: #4A4A54; }
          .bottom .tag { color: #9598A2; }
        </style>
        <div class="wrap">
          <div class="grid">
            <div>
              <div class="brand"><span class="m">◆</span>Sage Academy</div>
              <div class="loop">frame → route → map<br>→ decide → <b>prove</b></div>
            </div>
            <div>
              <h4>Learn</h4>
              <ul>
                <li><a href="Sage How It Works.dc.html">How it works</a></li>
                <li><a href="Sage Courses.dc.html">Courses</a></li>
                <li><a href="Sage Field Notes.dc.html">Field notes</a></li>
                <li><a href="Sage Weekly Challenge.dc.html">Weekly challenge</a></li>
              </ul>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="Sage Why Proof.dc.html">Why proof</a></li>
                <li><a href="Sage Pricing.dc.html">Pricing</a></li>
                <li><a href="Sage Placement.dc.html">Placement test</a></li>
                <li><a href="Sage Help.dc.html">Help center</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="Sage About.dc.html">About</a></li>
                <li><a href="Sage Legal.dc.html">Legal</a></li>
                <li><a href="mailto:hello@sageideas.dev">hello@sageideas.dev</a></li>
              </ul>
            </div>
            <div class="news${saved ? ' done' : ''}">
              <h4>The Monday note</h4>
              <p>One real incident, mapped in public — in your inbox every Monday.</p>
              <div class="row">
                <input type="email" placeholder="you@work.dev" aria-label="Email for the Monday note">
                <button class="go">Subscribe</button>
              </div>
              <div class="ok">✓ you're in — see you Monday</div>
              <div class="note">62 notes and counting · unsubscribe anytime</div>
            </div>
          </div>
          <div class="bottom">
            <span class="tag">© 2026 Sage Ideas LLC · sageideas.dev</span>
            <span>proof, not vibes</span>
          </div>
        </div>`;
      const box = root.querySelector('.news');
      const input = root.querySelector('input');
      const submit = () => {
        const v = (input.value || '').trim();
        if (!v || v.indexOf('@') < 1) { input.focus(); input.style.borderColor = '#E5484D'; setTimeout(() => { input.style.borderColor = ''; }, 1200); return; }
        try { localStorage.setItem('sage-newsletter', v); } catch (e) {}
        box.classList.add('done');
      };
      root.querySelector('.go').addEventListener('click', submit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    }
  }
  if (!customElements.get('sage-footer')) customElements.define('sage-footer', SageFooter);

  /* ---------- marketing mobile menu (hamburger, ≤760px) ---------- */
  class SageMobileMenu extends HTMLElement {
    connectedCallback() {
      if (this._done) return; this._done = true;
      const here = decodeURIComponent((location.pathname.split('/').pop() || ''));
      const links = [
        ['Sage Home.dc.html', 'Home'],
        ['Sage How It Works.dc.html', 'How it works'],
        ['Sage Courses.dc.html', 'Courses'],
        ['Sage Field Notes.dc.html', 'Field notes'],
        ['Sage Why Proof.dc.html', 'Why proof'],
        ['Sage Pricing.dc.html', 'Pricing'],
        ['Sage About.dc.html', 'About'],
      ];
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host { display: none; }
          @media (max-width: 760px) { :host { display: block; } }
          .btn { position: fixed; top: 11px; right: 116px; z-index: 94; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; border: 1px solid #2A2A33; background: rgba(13,13,17,0.85); backdrop-filter: blur(10px); color: #F2EFE9; font-size: 17px; cursor: pointer; }
          .btn:focus-visible { outline: 2px solid #8FA0FF; outline-offset: 2px; }
          .ov { display: none; position: fixed; inset: 0; z-index: 97; background: rgba(11,11,14,0.72); }
          .ov.open { display: block; }
          .panel { position: absolute; top: 10px; left: 10px; right: 10px; background: #141418; border: 1px solid #2A2A33; border-radius: 20px; box-shadow: 0 30px 70px -18px rgba(0,0,0,0.9); padding: 14px; }
          .top { display: flex; align-items: center; justify-content: space-between; padding: 4px 6px 12px; }
          .brand { display: flex; align-items: center; gap: 9px; color: #F2EFE9; font-family: 'Hanken Grotesk', sans-serif; font-size: 14px; font-weight: 700; }
          .brand .m { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; background: #3D5AFE; color: #fff; font-size: 11px; }
          .x { background: none; border: none; color: #9598A2; font-size: 20px; cursor: pointer; padding: 6px 10px; }
          .links { display: flex; flex-direction: column; }
          .links a { font-family: 'Hanken Grotesk', sans-serif; font-size: 16.5px; font-weight: 600; color: #B6B6C0; text-decoration: none; padding: 13px 10px; border-radius: 12px; }
          .links a:hover { color: #F2EFE9; background: rgba(255,255,255,0.05); }
          .links a.cur { color: #F2EFE9; background: rgba(255,255,255,0.06); }
          .cta { display: block; text-align: center; margin-top: 10px; background: #3D5AFE; color: #fff; border-radius: 13px; padding: 15px; font-family: 'Hanken Grotesk', sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; }
          .cta:hover { background: #6E83FF; }
        </style>
        <button class="btn" aria-label="Menu">≡</button>
        <div class="ov">
          <div class="panel">
            <div class="top"><span class="brand"><span class="m">◆</span>Sage Academy</span><button class="x" aria-label="Close">×</button></div>
            <div class="links">${links.map((l) => `<a class="${l[0] === here ? 'cur' : ''}" href="${l[0]}">${l[1]}</a>`).join('')}</div>
            <a class="cta" href="Sage Auth.dc.html">Start free →</a>
          </div>
        </div>`;
      const ov = root.querySelector('.ov');
      root.querySelector('.btn').addEventListener('click', () => ov.classList.add('open'));
      root.querySelector('.x').addEventListener('click', () => ov.classList.remove('open'));
      ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
    }
  }
  if (!customElements.get('sage-mobile-menu')) customElements.define('sage-mobile-menu', SageMobileMenu);
  const mountMenu = () => {
    if (document.body && document.querySelector('sage-footer') && !document.querySelector('sage-app-nav') && !document.querySelector('sage-mobile-menu')) {
      document.body.appendChild(document.createElement('sage-mobile-menu'));
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(mountMenu, 400));
  else setTimeout(mountMenu, 400);

  /* ---------- reward ceremony overlay ---------- */
  class SageReward extends HTMLElement {
    static show(opts) {
      const el = document.createElement('sage-reward');
      el._opts = opts || {};
      document.body.appendChild(el);
    }
    connectedCallback() {
      const o = this._opts || {};
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = this.attachShadow({ mode: 'open' });
      const tint = o.tint || '#18B663';
      root.innerHTML = `
        <style>
          .ov { position: fixed; inset: 0; z-index: 120; display: grid; place-items: center; background: rgba(11,11,14,0.78); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.3s; }
          .ov.in { opacity: 1; }
          .card { position: relative; text-align: center; background: #141418; border: 1px solid #2A2A33; border-radius: 22px; padding: 44px 48px 36px; max-width: min(420px, 88vw); box-shadow: 0 40px 90px -20px rgba(0,0,0,0.95); transform: scale(0.92) translateY(10px); transition: transform 0.45s cubic-bezier(0.2, 1.2, 0.4, 1); }
          .ov.in .card { transform: scale(1) translateY(0); }
          .stamp { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.14em; color: ${tint}; border: 1.5px solid ${tint}; border-radius: 8px; padding: 8px 18px; transform: rotate(-2deg) scale(${reduce ? 1 : 2.6}); opacity: ${reduce ? 1 : 0}; }
          .ov.in .stamp { animation: ${reduce ? 'none' : 'sr-stamp 0.5s cubic-bezier(0.2, 1.2, 0.4, 1) 0.25s both'}; }
          @keyframes sr-stamp { 0% { opacity: 0; transform: rotate(-2deg) scale(2.6); } 60% { opacity: 1; transform: rotate(-2deg) scale(0.9); } 100% { opacity: 1; transform: rotate(-2deg) scale(1); } }
          h3 { margin: 20px 0 6px; font-family: 'Fraunces', Georgia, serif; font-weight: 600; font-size: 24px; letter-spacing: -0.02em; color: #F2EFE9; }
          p { margin: 0; font-size: 13.5px; color: #9C9CA6; line-height: 1.55; }
          .xp { margin-top: 16px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #E0A93E; }
          .row { display: flex; gap: 8px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
          a, button { font-family: 'Hanken Grotesk', sans-serif; font-size: 13.5px; font-weight: 600; border-radius: 11px; padding: 11px 20px; cursor: pointer; text-decoration: none; }
          .go { background: #3D5AFE; color: #fff; border: none; }
          .go:hover { background: #6E83FF; }
          .stay { background: none; color: #9598A2; border: 1px solid #2A2A33; }
          .stay:hover { color: #F2EFE9; }
        </style>
        <div class="ov" role="dialog" aria-label="${o.title || 'Nice work'}">
          <div class="card">
            <span class="stamp">${o.stamp || 'PROOF HELD'}</span>
            <h3>${o.title || 'Nice work.'}</h3>
            <p>${o.body || ''}</p>
            ${o.xp ? `<div class="xp">+<span class="n">0</span> XP</div>` : ''}
            <div class="row">
              ${o.href ? `<a class="go" href="${o.href}">${o.cta || 'Continue'}</a>` : ''}
              <button class="stay">${o.dismiss || 'Stay here'}</button>
            </div>
          </div>
        </div>`;
      const ov = root.querySelector('.ov');
      requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('in')));
      if (o.xp) {
        const n = root.querySelector('.n');
        const t0 = performance.now(), dur = reduce ? 1 : 900;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          n.textContent = Math.round(o.xp * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 500);
      }
      const close = () => { ov.classList.remove('in'); setTimeout(() => this.remove(), 320); };
      root.querySelector('.stay').addEventListener('click', close);
      ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
      this._esc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', this._esc); } };
      document.addEventListener('keydown', this._esc);
    }
    disconnectedCallback() { if (this._esc) document.removeEventListener('keydown', this._esc); }
  }
  if (!customElements.get('sage-reward')) customElements.define('sage-reward', SageReward);
  window.SageReward = SageReward;

  if (!customElements.get('sage-chat')) customElements.define('sage-chat', SageChat);
})();
