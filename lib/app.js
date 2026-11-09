/* Routing and the page shell. Routes live in the hash so the site works from a file as well as a server. */
'use strict';
(function () {
  const V = window.VIEWS, S = window.STORE;
  const main = document.getElementById('main');

  const routes = [
    [/^\/?$/, () => V.home(main), 'Home'],
    [/^\/courses\/?$/, () => V.courses(main, 'all'), 'Courses'],
    [/^\/courses\/([^/]+)$/, m => V.courses(main, dec(m[1])), 'Courses'],
    [/^\/course\/([^/]+)$/, m => V.course(main, m[1]), m => title(ACADEMY.courseById(m[1]))],
    [/^\/unit\/([^/]+)\/([^/]+)$/, m => V.unit(main, m[1], m[2]), m => title(ACADEMY.unitById(m[1], m[2]))],
    [/^\/skill\/([^/]+)$/, m => V.skill(main, dec(m[1])), m => title(ACADEMY.skills[dec(m[1])])],
    [/^\/practice\/([^/]+)$/, m => V.practice(main, dec(m[1])), m => 'Practice: ' + title(ACADEMY.skills[dec(m[1])])],
    [/^\/test\/([^/]+)\/([^/]+)$/, m => V.unitTest(main, m[1], m[2]), m => 'Unit test: ' + title(ACADEMY.unitById(m[1], m[2]))],
    [/^\/challenge\/([^/]+)$/, m => V.challenge(main, m[1]), m => 'Course challenge: ' + title(ACADEMY.courseById(m[1]))],
    [/^\/mastery\/([^/]+)$/, m => V.masteryChallenge(main, m[1]), m => 'Mastery challenge: ' + title(ACADEMY.courseById(m[1]))],
    [/^\/cpm\/?$/, () => CPMVIEWS.cpmHome(main), 'CPM books'],
    [/^\/cpm\/([^/]+)$/, m => CPMVIEWS.cpmBook(main, m[1]), m => title(ACADEMY.cpmById(m[1]))],
    [/^\/cpm\/([^/]+)\/([^/]+)$/, m => CPMVIEWS.cpmLesson(main, m[1], dec(m[2])), m => { const f = ACADEMY.cpmLesson(m[1], dec(m[2])); return f ? f.book.short + ' ' + CPMVIEWS.lessonName(f.lesson) : 'Not found'; }],
    [/^\/cpm-practice\/([^/]+)\/ch\/(\d+)$/, m => CPMVIEWS.cpmChapterPractice(main, m[1], m[2]), m => 'Chapter practice'],
    [/^\/cpm-practice\/([^/]+)\/([^/]+)$/, m => CPMVIEWS.cpmPractice(main, m[1], dec(m[2])), m => 'Lesson practice ' + dec(m[2])],
    [/^\/tutor\/?$/, () => TUTORPAGE.tutorPage(main, null), 'Tutor'],
    [/^\/tutor\/([^/]+)$/, m => TUTORPAGE.tutorPage(main, dec(m[1])), 'Tutor'],
    [/^\/daily$/, () => V.daily(main), 'Today’s practice'],
    [/^\/vs\/(.+)$/, m => CHALLENGE.page(main, m[1]), 'A challenge'],
    [/^\/report$/, () => REPORT.page(main), 'Progress report'],
    [/^\/profile$/, () => ACCOUNT.page(main), 'Your profile'],
    [/^\/setup\/?$/, () => SETUP.page(main), 'Word problems → equations'],
    [/^\/tiles\/?$/, () => TILES.page(main, 'solve'), 'Algebra tiles'],
    [/^\/tiles\/compare$/, () => TILES.page(main, 'compare'), 'Algebra tiles: comparison mat'],
    [/^\/tiles\/(eq|cmp)\/(.+)$/, m => TILES.page(main, m[1] === 'cmp' ? 'compare' : 'solve', m[2]), 'Algebra tiles'],
    [/^\/chance\/?$/, () => CHANCE.page(main), 'Probability simulator'],
    [/^\/chance\/([a-z0-9]+)$/, m => CHANCE.page(main, m[1]), 'Probability simulator'],
    [/^\/words\/?$/, () => VOCAB.page(main, null), 'Math words'],
    [/^\/words\/cards$/, () => VOCAB.cards(main), 'Flashcards'],
    [/^\/words\/([a-z0-9-]+)$/, m => VOCAB.page(main, m[1]), 'Math words'],
    [/^\/move\/(.+)$/, m => MOVE.page(main, m[1]), 'Move progress'],
    [/^\/sprint\/?$/, () => SPRINT.home(main), 'Speed sprints'],
    [/^\/sprint\/([^/]+)$/, m => SPRINT.play(main, m[1]), 'Speed sprint'],
    [/^\/steps\/?$/, () => STEPS.page(main, null), 'Step checker'],
    [/^\/steps\/(.+)$/, m => STEPS.page(main, m[1]), 'Step checker'],
    [/^\/prep\/([^/]+)\/(\d+)$/, m => PREP.page(main, m[1], m[2]), 'Test prep'],
    [/^\/prep\/([^/]+)\/(\d+)\/(prep|test|warmup)$/, m => PREP.task(main, m[1], m[2], m[3]), 'Test prep'],
    [/^\/tools\/?$/, () => V.tools(main), 'Tools'],
    [/^\/calc\/?$/, () => CALCULATOR.page(main, null), 'Calculator'],
    [/^\/calc\/(.+)$/, m => CALCULATOR.page(main, dec(m[1])), 'Calculator'],
    [/^\/numbers\/?$/, () => NUMBERS.page(main, null), 'Number explorer'],
    [/^\/numbers\/([\d-]+)$/, m => NUMBERS.page(main, m[1]), m => 'Number explorer: ' + m[1].split('-').join(', ')],
    [/^\/data\/?$/, () => DATA.page(main, null), 'Data and statistics'],
    [/^\/data\/(.+)$/, m => DATA.page(main, m[1]), 'Data and statistics'],
    [/^\/shapes\/?$/, () => SHAPES.page(main, null, null), 'Shapes and space'],
    [/^\/shapes\/([a-z]+)(?:\/([\w.\-]+))?\/?$/, m => SHAPES.page(main, m[1], m[2] || null), m => 'Shapes: ' + ((SHAPES.KINDS[m[1]] || {}).name || 'shapes')],
    [/^\/percent\/?$/, () => PERCENT.page(main, null, null), 'Percents and money'],
    [/^\/percent\/([a-z]+)(?:\/([\w.\-]+))?\/?$/, m => PERCENT.page(main, m[1], m[2] || null), 'Percents and money'],
    [/^\/leap\/?$/, () => LEAP.page(main, null), 'Leap'],
    [/^\/leap\/(daily|\d+)$/, m => LEAP.page(main, m[1]), 'Leap'],
    [/^\/balance\/?$/, () => BALANCE.page(main, null), 'Balance'],
    [/^\/balance\/(daily|\d+)$/, m => BALANCE.page(main, m[1]), 'Balance'],
    [/^\/fractions\/?$/, () => FRACTIONS.page(main, null, null), 'Fraction lab'],
    [/^\/integers\/?$/, () => INTEGERS.page(main, null, null), 'Integer tiles'],
    [/^\/integers\/([a-z]+)(?:\/([\w.\-]+))?\/?$/, m => INTEGERS.page(main, m[1], m[2] || null), 'Integer tiles'],
    [/^\/fractions\/([a-z]+)(?:\/([\w.\-]+))?\/?$/, m => FRACTIONS.page(main, m[1], m[2] || null), 'Fraction lab'],
    [/^\/graph\/?$/, () => CALC.page(main, null), 'Graphing calculator'],
    [/^\/graph\/(.+)$/, m => CALC.page(main, m[1]), 'Graphing calculator'],
    [/^\/worksheet\/skill\/([^/]+)$/, m => WORKSHEET.page(main, 'skill', dec(m[1])), 'Worksheet'],
    [/^\/worksheet\/unit\/([^/]+)\/([^/]+)$/, m => WORKSHEET.page(main, 'unit', m[1], m[2]), 'Worksheet'],
    [/^\/worksheet\/lesson\/([^/]+)\/([^/]+)$/, m => WORKSHEET.page(main, 'lesson', m[1], dec(m[2])), 'Worksheet'],
    [/^\/review$/, () => V.review(main), 'Review'],
    [/^\/progress$/, () => V.progress(main), 'Progress'],
    [/^\/settings$/, () => V.settings(main), 'Settings'],
    [/^\/new\/?$/, () => WHATSNEW.page(main), 'Updates'],
    [/^\/notes\/?$/, () => V.notes(main), 'My notes'],
    [/^\/family\/?$/, () => FAMILY.page(main), 'Family and class'],
    [/^\/family\/add\/(.+)$/, m => FAMILY.addPage(main, m[1]), 'Family and class'],
    [/^\/placement\/([^/]+)$/, m => PLACEMENT.page(main, m[1]), 'Find your starting point'],
    [/^\/unlimited\/?$/, () => UNLIMITED.page(main), 'Unlimited practice'],
    [/^\/unlimited\/([a-z]+)(?:\/([^/]+))?(?:\/([^/]+))?$/, m => UNLIMITED.play(main, m[1], dec(m[2] || ''), dec(m[3] || '')), 'Unlimited practice'],
    [/^\/search\/?(.*)$/, m => V.search(main, dec(m[1])), 'Search'],
  ];
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const title = o => (o && o.title) ? ACADEMY.stripTags(o.title).trim() : 'Not found';

  function render() {
    const path = location.hash.replace(/^#/, '') || '/';
    if (window.TUTORUI) TUTORUI.setContext(null);          // each view says what is on screen
    document.body.classList.remove('on-ai-page');
    let matched = false;
    for (const [re, fn, name] of routes) {
      const m = path.match(re);
      if (m) {
        matched = true;
        try { fn(m); } catch (e) { console.error(e); main.innerHTML = `<div class="card empty"><h1>Something went wrong</h1><p class="muted">${M.esc(e.message)}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a></div></div>`; }
        const t = typeof name === 'function' ? name(m) : name;
        document.title = (t && t !== 'Home' ? t + ' · ' : '') + V.brand();
        break;
      }
    }
    if (!matched) { V.notFound(main); document.title = 'Not found · ' + V.brand(); }
    document.querySelectorAll('[data-nav]').forEach(a => {
      const on = (a.dataset.nav === 'home' ? path === '/' : path.startsWith('/' + a.dataset.nav)) || (a.dataset.nav === 'courses' && /^\/(course|unit|skill|practice|test|challenge|mastery)\//.test(path)) || (a.dataset.nav === 'cpm' && /^\/cpm-practice\//.test(path)) || (a.dataset.nav === 'progress' && /^\/(notes|report|review)(\/|$)/.test(path)) || (a.dataset.nav === 'settings' && /^\/new$/.test(path)) || (a.dataset.nav === 'tools' && /^\/(calc|graph|numbers|data|shapes|percent|leap|balance|fractions|integers|chance|tiles|steps|setup|sprint|words|prep)(\/|$)/.test(path));
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    moreBtn.classList.toggle('active', !!moreSheet.querySelector('a.active'));
    const si = document.getElementById('search-input');
    if (si && !path.startsWith('/search')) si.value = '';
    window.scrollTo(0, 0);
  }

  const APP = {
    render,
    applyPrefs() {
      const p = S.get().profile;
      const html = document.documentElement;
      const theme = new URLSearchParams(location.search).get('theme') || p.theme;    // ?theme=dark wins, for screenshots and tests
      if (theme && theme !== 'system') html.setAttribute('data-theme', theme); else html.removeAttribute('data-theme');
      if (p.textSize && p.textSize !== 'normal') html.setAttribute('data-size', p.textSize); else html.removeAttribute('data-size');
      if (p.easyRead) html.setAttribute('data-read', 'easy'); else html.removeAttribute('data-read');
      document.querySelectorAll('[data-brand]').forEach(el => { el.textContent = V.brand(); });
      // the menus' language: from English it changes in place; any other change (to English, between two
      // languages, another learner's choice) starts the page afresh, since the words on screen are already changed
      const want = p.lang || 'en';
      if (window.LANG && LANG.get() !== want) { if (LANG.get() === 'en') LANG.set(want); else location.reload(); }
    },
    refreshStats() {
      // streak savers: a missed day kept, or a new saver earned, is said once, when it happens
      const k = STORE.keepStreak ? STORE.keepStreak() : null, days = STORE.streak().days;
      if (k && k.used.length) V.toast(`A streak saver kept your ${days}-day streak going.`);
      else if (k && k.earned) V.toast(`You earned a streak saver for your ${days}-day streak.`);
      const el = document.getElementById('stats'); if (el) el.innerHTML = V.stats(); if (window.BADGES) BADGES.check(); if (window.ACCOUNT) ACCOUNT.avatarButton();
    },
  };
  window.APP = APP;

  // phones: the main pages in a bar along the bottom (app.css shows it below 700 px), and More for the rest
  const TABS = [['home', '#/', 'Home', 'home'], ['unlimited', '#/unlimited', 'Practice', 'unlimited'], ['courses', '#/courses', 'Courses', 'book'], ['tutor', '#/tutor', 'Tutor', 'sparkle']];
  const MORE = [['cpm', '#/cpm', 'CPM books', 'Your class book, lesson by lesson', 'bookmark'], ['tools', '#/tools', 'Tools', 'Calculators, labs and puzzles', 'calc'], ['progress', '#/progress', 'Progress', 'Your skills, streak and badges', 'trophy'], ['family', '#/family', 'Family and class', 'Progress for everyone you help', 'school'], ['profile', '#/profile', 'Profile', 'Your account, and who is learning', 'person'], ['settings', '#/settings', 'Settings', 'Theme, text size and more', 'settings']];
  const tabbar = document.createElement('nav'), moreSheet = document.createElement('nav'), backdrop = document.createElement('div');
  tabbar.className = 'tabbar'; tabbar.setAttribute('aria-label', 'Main');
  tabbar.innerHTML = TABS.map(([k, href, name, ic]) => `<a href="${href}" data-nav="${k}"><span class="tab-ic">${ICONS.svg(ic, 22)}</span>${name}</a>`).join('')
    + `<button type="button" id="tab-more" aria-expanded="false" aria-controls="more-sheet"><span class="tab-ic">${ICONS.svg('more', 22)}</span>More</button>`;
  moreSheet.className = 'more-sheet'; moreSheet.id = 'more-sheet'; moreSheet.hidden = true; moreSheet.setAttribute('aria-label', 'More pages');
  moreSheet.innerHTML = MORE.map(([k, href, name, line, ic]) => `<a href="${href}" data-nav="${k}"><span class="more-ic">${ICONS.svg(ic, 20)}</span><span><b>${name}</b><small>${line}</small></span></a>`).join('');
  backdrop.className = 'more-backdrop'; backdrop.hidden = true;
  document.body.append(backdrop, moreSheet, tabbar);
  const moreBtn = tabbar.querySelector('#tab-more');
  const showMore = on => { moreSheet.hidden = backdrop.hidden = !on; moreBtn.setAttribute('aria-expanded', String(on)); if (on) moreSheet.querySelector('a').focus(); };
  moreBtn.addEventListener('click', () => showMore(moreSheet.hidden));
  backdrop.addEventListener('click', () => showMore(false));
  moreSheet.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });          // also when it's the page already open
  tabbar.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !moreSheet.hidden) { showMore(false); moreBtn.focus(); } });
  window.addEventListener('hashchange', () => showMore(false));

  // the search box's hint: all of it when it fits, else just "Search"
  const searchIn = document.getElementById('search-input'), hintPen = document.createElement('canvas').getContext('2d');
  const hint = t => (window.LANG && LANG.tr(t)) || t;
  const fitHint = () => {
    const cs = getComputedStyle(searchIn), full = hint('Search skills, courses and tools');
    hintPen.font = cs.font;
    searchIn.setAttribute('placeholder', hintPen.measureText(full).width + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) <= searchIn.clientWidth ? full : hint('Search'));
  };
  if (window.ResizeObserver) new ResizeObserver(fitHint).observe(searchIn);
  document.getElementById('search-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    location.hash = '#/search/' + encodeURIComponent(q);
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === '/' && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) { ev.preventDefault(); document.getElementById('search-input').focus(); }
  });
  window.addEventListener('hashchange', render);
  // a table too wide for a phone scrolls in its own box (app.css); keyboard users can scroll it once it can take focus
  let tablesQueued = false;
  const markWideTables = () => { tablesQueued = false; main.querySelectorAll('.mtable').forEach(t => { if (t.scrollWidth > t.clientWidth + 1) t.setAttribute('tabindex', '0'); else t.removeAttribute('tabindex'); }); };
  const queueTables = () => { if (!tablesQueued) { tablesQueued = true; requestAnimationFrame(markWideTables); } };
  new MutationObserver(queueTables).observe(main, { childList: true, subtree: true });
  window.addEventListener('resize', queueTables);
  APP.applyPrefs();
  APP.refreshStats();
  if (window.TUTORUI) TUTORUI.init();
  render();
  if (window.ACCOUNT) ACCOUNT.start();               // a signed-in learner: merge in what other computers saved

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.PROCADEMY_OFFLINE) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }

  /* ---------- easier on every device ---------- */
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');        // focus can land on the page itself
  // the header's streak and points follow every save, a moment later (not every page calls refreshStats)
  let statsTimer = 0;
  S.onChange(() => { clearTimeout(statsTimer); statsTimer = setTimeout(() => { const el = document.getElementById('stats'); if (el) el.innerHTML = V.stats(); }, 200); });

  // less motion when the learner asks for it (profile.reduceMotion), as well as when the device does
  const basePrefs = APP.applyPrefs;
  APP.applyPrefs = function () {
    basePrefs.apply(this, arguments);
    if (S.get().profile.reduceMotion) document.documentElement.setAttribute('data-motion', 'reduce'); else document.documentElement.removeAttribute('data-motion');
  };
  APP.applyPrefs();
  const calm = () => document.documentElement.dataset.motion === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // back to top, once a page is more than a screen and a half long
  const toTop = document.createElement('button');
  toTop.type = 'button'; toTop.className = 'to-top'; toTop.setAttribute('aria-label', 'Back to top'); toTop.title = 'Back to top';
  toTop.innerHTML = ICONS.svg('send', 20);
  toTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: calm() ? 'auto' : 'smooth' }); main.focus({ preventScroll: true }); });
  document.body.appendChild(toTop);
  let topQueued = false;
  const placeTop = () => { topQueued = false; toTop.classList.toggle('show', window.scrollY > window.innerHeight * 1.5); };
  window.addEventListener('scroll', () => { if (!topQueued) { topQueued = true; requestAnimationFrame(placeTop); } }, { passive: true });
  window.addEventListener('hashchange', () => setTimeout(placeTop, 50));

  // offline: say so for a few seconds (practice and tools still work), and say so again when the internet is back
  if (!window.PROCADEMY_OFFLINE) {
    const note = document.createElement('div');
    note.className = 'net-note'; note.setAttribute('role', 'status'); note.hidden = true;
    note.textContent = 'You’re offline. Practice still works.';
    document.body.appendChild(note);
    let noteTimer = 0;
    const offline = () => { note.hidden = false; document.body.classList.add('is-offline'); clearTimeout(noteTimer); noteTimer = setTimeout(() => { note.hidden = true; }, 8000); };
    window.addEventListener('offline', offline);
    window.addEventListener('online', () => { note.hidden = true; document.body.classList.remove('is-offline'); V.toast('You’re back online.'); });
    if (navigator.onLine === false) offline();
  }

  // phones: while the keyboard is open, keep the field being typed in on screen, with the tab bar out of the way
  if (window.visualViewport) {
    const vv = window.visualViewport;
    vv.addEventListener('resize', () => {
      const el = document.activeElement, typing = !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
      const open = typing && vv.height < window.innerHeight * 0.78;
      document.body.classList.toggle('kb-open', open);
      if (open && main.contains(el)) { const r = el.getBoundingClientRect(); if (r.bottom > vv.offsetTop + vv.height - 16 || r.top < 70) el.scrollIntoView({ block: 'center' }); }
    });
  }

  // phones: a swipe to the left presses Next, and to the right Previous, wherever a page has them (practice, review)
  let sx = 0, sy = 0, st = 0, swipeOk = false;
  main.addEventListener('touchstart', ev => {
    const t = ev.touches[0];
    swipeOk = ev.touches.length === 1 && !ev.target.closest('input, textarea, select, svg, canvas, .viz, .mtable, .cx-page, .calc, [data-noswipe]');
    sx = t.clientX; sy = t.clientY; st = Date.now();
  }, { passive: true });
  main.addEventListener('touchend', ev => {
    if (!swipeOk) return;
    const t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st > 600 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.5) return;
    const pick = sel => [...main.querySelectorAll(sel)].find(b => b.offsetParent && !b.disabled);
    const b = dx < 0 ? pick('#next, [data-swipe="next"]') : pick('#prev, [data-swipe="prev"]');
    if (b) b.click();
  }, { passive: true });

  // screen readers hear every toast (they appear and go without a live region of their own)
  const live = document.createElement('div');
  live.className = 'visually-hidden'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('toast')) { live.textContent = ''; setTimeout(() => { live.textContent = n.textContent; }, 60); } }))).observe(document.body, { childList: true });
  // after a page is chosen from the menu, the tab bar or More, focus moves to the new page (a screen reader reads it next)
  window.addEventListener('hashchange', () => {
    const a = document.activeElement;
    if (!a || a === document.body || (a.closest && a.closest('.nav, .tabbar, .more-sheet') && !/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))) main.focus({ preventScroll: true });
  });

  // the picture reader (lib/files.js) is fetched the first time a picture is read; on a fast connection, start
  // it quietly a few seconds into the pages that read pictures, so a screenshot is read at once
  let warmed = false;
  const warmReader = () => {
    const c = navigator.connection || {}, here = () => /^#\/(unlimited|tutor)(\/|$)/.test(location.hash);
    if (warmed || !here() || !window.FILES || !FILES.warm || !/^https:$/.test(location.protocol) || window.PROCADEMY_OFFLINE) return;
    if (c.saveData || (c.effectiveType && c.effectiveType !== '4g') || (navigator.deviceMemory && navigator.deviceMemory < 4)) return;
    setTimeout(() => { if (here() && !warmed) { warmed = true; (window.requestIdleCallback || (fn => fn()))(() => FILES.warm()); } }, 4000);
  };
  window.addEventListener('hashchange', warmReader);
  warmReader();
})();
