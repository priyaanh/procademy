/* Routing and the page shell. Routes live in the hash so the site works from a file as well as a server. */
'use strict';
(function () {
  const V = window.VIEWS, S = window.STORE;
  const main = document.getElementById('main');

  /* Tools whose code a page needs only when it opens: fetched then, so a first visit downloads less. Every
     other page works without them; the one-file build (tools/build-offline.js reads this list) and the
     service worker's offline copy still hold them all. */
  /* lazy:start */
  const LAZY = {
    CALC: ['lib/calc.js', 'lib/calculator.js'], CALCULATOR: ['lib/calc.js', 'lib/calculator.js'],
    GEOMETRY: ['lib/shapes.js', 'lib/geometry.js'], SHAPES: ['lib/shapes.js'], MEASURE: ['lib/measure.js'], NUMBERS: ['lib/numbers.js'], DATA: ['lib/data.js'],
    PERCENT: ['lib/percent.js'], FRACTIONS: ['lib/fractions.js'], INTEGERS: ['lib/integers.js'], CHANCE: ['lib/chance.js'], TILES: ['lib/tiles.js'],
    SETUP: ['lib/setup.js'], LEAP: ['lib/leap.js'],
  };
  /* lazy:end */
  const loading = {};
  /** load a script once; resolves when it has run */
  const loadScript = src => loading[src] || (loading[src] = new Promise((ok, no) => {
    const el = document.createElement('script'); el.src = src; el.async = false;
    el.onload = () => ok(); el.onerror = () => { delete loading[src]; no(new Error('couldn’t load ' + src)); };
    document.body.appendChild(el);
  }));
  /** the tool modules a route's code names that haven't loaded yet */
  const missingFor = fn => { const code = String(fn); return Object.keys(LAZY).filter(g => !window[g] && new RegExp('\\b' + g + '\\.').test(code)); };
  const need = names => [...new Set([].concat(...names.map(g => LAZY[g])))].reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());

  const routes = [
    [/^\/?$/, () => V.home(main), 'Home'],
    [/^\/courses\/?$/, () => V.courses(main, lastCourses()), 'Courses'],
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
    // tutor: a chat shared by link (read-only), then the tutor's own page
    [/^\/tutor\/shared\/([A-Za-z0-9_-]+)$/, m => TUTORPAGE.shared(main, m[1]), 'A shared chat'],
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
    // tools
    [/^\/tiles\/factor(?:\/(.+))?$/, m => TILES.page(main, 'factor', m[1] || null), 'Algebra tiles: factoring'],
    [/^\/ratios(?:\/(.+))?\/?$/, m => PERCENT.ratios(main, m[1] || null), 'Ratio table'],
    [/^\/money\/?$/, () => PERCENT.money(main), 'Counting money'],
    [/^\/numbers\/blocks(?:\/(\d{1,4}))?$/, m => NUMBERS.blocks(main, m[1] || null), 'Place value blocks'],
    [/^\/numbers\/table$/, () => NUMBERS.times(main), 'Multiplication table'],
    [/^\/geometry\/?$/, () => GEOMETRY.page(main, null), 'Geometry lab'],
    [/^\/geometry\/([a-z]+)$/, m => GEOMETRY.page(main, m[1]), 'Geometry lab'],
    [/^\/measure\/?$/, () => MEASURE.page(main, null), 'Units and scale'],
    [/^\/measure\/([a-z]+)$/, m => MEASURE.page(main, m[1]), 'Units and scale'],
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
    [/^\/mastered\/?$/, () => V.mastered(main), 'Mastered skills'],
    [/^\/sitemap\/?$/, () => V.sitemap(main), 'All pages'],
    [/^\/timer\/?$/, () => PREP.timer(main), 'Study timer'],
    // practice: a timed quiz, beat your best, boss levels, the weekly challenge, a warm-up, a summer plan, ready for high school
    [/^\/quiz\/([^/]+)\/([^/]+)$/, m => V.quiz(main, m[1], m[2]), 'Timed quiz'],
    [/^\/boss\/([^/]+)\/([^/]+)$/, m => V.boss(main, m[1], m[2]), 'Boss level'],
    [/^\/speed\/([^/]+)$/, m => V.speed(main, dec(m[1])), 'Beat your best'],
    [/^\/weekly\/?$/, () => V.weekly(main), 'This week’s challenge'],
    [/^\/warmup\/?$/, () => V.warmup(main), 'Mental math warm-up'],
    [/^\/summer\/?$/, () => V.summer(main), 'Summer review'],
    [/^\/ready\/?$/, () => V.ready(main), 'Ready for high school'],
  ];
  /* the Courses page opens on the filter last chosen there, unless All was just chosen on it */
  const UI_COURSES = 'procademy.ui.courses';
  let lastPath = '';
  function lastCourses() {
    if (/^\/courses(\/|$)/.test(lastPath)) { try { localStorage.setItem(UI_COURSES, 'all'); } catch (e) { /* fine */ } return 'all'; }
    try { return localStorage.getItem(UI_COURSES) || 'all'; } catch (e) { return 'all'; }
  }
  /** pages under a section get a trail back to it: a tool to Tools, the report to Progress */
  function parentOf(path) {
    if (/^\/(calc|graph|numbers|data|shapes|geometry|measure|percent|leap|balance|fractions|integers|chance|tiles|setup|steps|words\/?$|words\/[a-z0-9-]+$|sprint\/?$|timer)(\/|$)/.test(path) && !/^\/words\/cards/.test(path)) return ['#/tools', 'Tools'];
    if (/^\/(notes|report|review)(\/|$)/.test(path)) return ['#/progress', 'Progress'];
    if (/^\/(new|profile|family)(\/|$)/.test(path)) return null;
    return null;
  }
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
        const missing = missingFor(fn);
        if (missing.length) {                               // a tool's code comes first, the first time it opens
          main.innerHTML = '<div class="boot-wait" role="status"><span class="boot-dot" aria-hidden="true"></span>Loading…</div>';
          need(missing).then(() => { if ((location.hash.replace(/^#/, '') || '/') === path) render(); },
            () => { main.innerHTML = '<div class="card empty"><h1>This page couldn’t load</h1><p class="muted">Check the internet connection, then try again.</p><div class="btn-row" style="justify-content:center"><button type="button" class="btn primary" id="lazy-again">Try again</button><a class="btn" href="#/">Home</a></div></div>'; main.querySelector('#lazy-again').addEventListener('click', render); });
          break;
        }
        if (/\bTUTORPAGE\./.test(String(fn))) need(['CALCULATOR']).catch(() => {});     // the tutor checks homework lines with the calculator
        try { fn(m); main.classList.remove('page-in'); void main.offsetWidth; main.classList.add('page-in'); } catch (e) { console.error(e); main.innerHTML = `<div class="card empty"><h1>Something went wrong</h1><p class="muted">${M.esc(e.message)}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a></div></div>`; }
        const t = typeof name === 'function' ? name(m) : name;
        document.title = (t && t !== 'Home' ? t + ' · ' : '') + V.brand() + (window.PROCADEMY_OFFLINE ? ' (offline)' : '');
        const parent = parentOf(path);
        if (parent && !main.querySelector('.crumbs, .ex-head')) main.insertAdjacentHTML('afterbegin', `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> › <a href="${parent[0]}">${parent[1]}</a> › <span>${M.esc(t)}</span></nav>`);
        const ct = path.match(/^\/courses\/([^/]+)$/);
        if (ct) try { localStorage.setItem(UI_COURSES, dec(ct[1])); } catch (e) { /* fine */ }
        break;
      }
    }
    if (!matched) { V.notFound(main); document.title = 'Not found · ' + V.brand(); }
    document.querySelectorAll('[data-nav]').forEach(a => {
      const on = (a.dataset.nav === 'home' ? path === '/' : path.startsWith('/' + a.dataset.nav)) || (a.dataset.nav === 'courses' && /^\/(course|unit|skill|practice|test|challenge|mastery|quiz|boss|speed)\//.test(path)) || (a.dataset.nav === 'cpm' && /^\/cpm-practice\//.test(path)) || (a.dataset.nav === 'progress' && /^\/(notes|report|review)(\/|$)/.test(path)) || (a.dataset.nav === 'settings' && /^\/new$/.test(path)) || (a.dataset.nav === 'tools' && /^\/(calc|graph|numbers|data|shapes|geometry|measure|percent|leap|balance|fractions|integers|chance|tiles|steps|setup|sprint|words|prep)(\/|$)/.test(path));
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    moreBtn.classList.toggle('active', !!moreSheet.querySelector('a.active'));
    const si = document.getElementById('search-input');
    if (si && !path.startsWith('/search')) si.value = '';
    lastPath = path;
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
      if (p.easyRead && p.readFont === 'dyslexic') html.setAttribute('data-font', 'dyslexic'); else html.removeAttribute('data-font');
      if (p.blue && p.blue !== 'classic') html.setAttribute('data-blue', p.blue); else html.removeAttribute('data-blue');
      if (p.contrast === 'high') html.setAttribute('data-contrast', 'high'); else html.removeAttribute('data-contrast');
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
  APP.LAZY = LAZY;                                    // for the test suite
  window.APP = APP;

  /* ---------- a 30-second tour: four stops, each pointing at the page it names (the phone's tab bar, or the menu) ---------- */
  const TOUR = [
    [['.today-card', '#welcome', 'main h1'], 'Home', 'Your plan for today: practice, a puzzle and one problem, with your streak and courses below.'],
    [['.nav a[data-nav="unlimited"]', '.tabbar a[data-nav="unlimited"]', '#tab-more'], 'Practice', 'Practice any skill or topic for as long as you like, or make questions from a picture of your homework.'],
    [['.nav a[data-nav="tutor"]', '.tabbar a[data-nav="tutor"]', '#tutor-fab'], 'Tutor', 'Ask about any question. The tutor explains step by step, and never gives away a practice answer.'],
    [['.top a[href="#/settings"]', '#tab-more'], 'Settings', 'Colors, text size, your grade and your goals. On a phone, Settings is under More.'],
  ];
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
  APP.tour = function tour() {
    if (document.querySelector('.tour')) return;
    S.setProfile({ toured: true, tourNext: false });
    const box = document.createElement('div');
    box.className = 'tour';
    box.innerHTML = `<div class="tour-spot" aria-hidden="true"></div><div class="tour-card" role="dialog" aria-modal="false" aria-labelledby="tour-h"><div class="tiny muted" id="tour-n"></div><h2 id="tour-h"></h2><p id="tour-p"></p>
      <div class="btn-row"><button type="button" class="btn sm primary" id="tour-next">Next</button><button type="button" class="btn sm ghost" id="tour-skip">Skip the tour</button></div></div>`;
    document.body.appendChild(box);
    let k = 0, target = null;
    const spot = box.querySelector('.tour-spot'), card = box.querySelector('.tour-card');
    const place = () => {
      if (!target) return;
      const r = target.getBoundingClientRect(), pad = 6;
      Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
      const cw = Math.min(340, window.innerWidth - 32), below = r.bottom + 14 + card.offsetHeight < window.innerHeight;
      card.style.width = cw + 'px';
      card.style.left = Math.max(16, Math.min(window.innerWidth - cw - 16, r.left + r.width / 2 - cw / 2)) + 'px';
      card.style.top = (below ? r.bottom + 14 : Math.max(16, r.top - card.offsetHeight - 14)) + 'px';
    };
    const end = () => { box.remove(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('keydown', onKey); window.removeEventListener('hashchange', end); };
    const onKey = ev => { if (ev.key === 'Escape') end(); };
    const show = () => {
      if (k >= TOUR.length) { end(); return; }
      const [sels, h, p] = TOUR[k];
      target = sels.map(x => document.querySelector(x)).find(visible) || null;
      if (!target) { k++; show(); return; }
      if (target.getBoundingClientRect().top > window.innerHeight - 120) target.scrollIntoView({ block: 'center' });
      box.querySelector('#tour-n').textContent = `${k + 1} of ${TOUR.length}`;
      box.querySelector('#tour-h').textContent = h; box.querySelector('#tour-p').textContent = p;
      box.querySelector('#tour-next').textContent = k === TOUR.length - 1 ? 'Done' : 'Next';
      place(); box.querySelector('#tour-next').focus();
    };
    box.querySelector('#tour-next').addEventListener('click', () => { k++; show(); });
    box.querySelector('#tour-skip').addEventListener('click', end);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    document.addEventListener('keydown', onKey); window.addEventListener('hashchange', end);
    show();
  };

  // phones: the main pages in a bar along the bottom (app.css shows it below 700 px), and More for the rest. Home and
  // More stay put; the learner chooses the three between them (profile.tabs)
  const PAGES = {
    unlimited: ['#/unlimited', 'Practice', 'unlimited', 'Any skill or topic, as long as you like'], courses: ['#/courses', 'Courses', 'book', 'Every grade, and the CPM books'], tutor: ['#/tutor', 'Tutor', 'sparkle', 'Ask about any question'],
    cpm: ['#/cpm', 'CPM books', 'bookmark', 'Your class book, lesson by lesson'], tools: ['#/tools', 'Tools', 'calc', 'Calculators, labs and puzzles'], progress: ['#/progress', 'Progress', 'trophy', 'Your skills, streak and badges'],
    family: ['#/family', 'Family and class', 'school', 'Progress for everyone you help'], profile: ['#/profile', 'Profile', 'person', 'Your account, and who is learning'], settings: ['#/settings', 'Settings', 'settings', 'Theme, text size and more'],
  };
  const CHOOSABLE = ['unlimited', 'courses', 'tutor', 'cpm', 'tools', 'progress'], DEFAULT_TABS = ['unlimited', 'courses', 'tutor'];
  const tabsChosen = () => { const t = S.get().profile.tabs; return Array.isArray(t) && t.length === 3 && t.every(k => CHOOSABLE.includes(k)) ? t : DEFAULT_TABS; };
  const tabbar = document.createElement('nav'), moreSheet = document.createElement('nav'), backdrop = document.createElement('div');
  tabbar.className = 'tabbar'; tabbar.setAttribute('aria-label', 'Main');
  moreSheet.className = 'more-sheet'; moreSheet.id = 'more-sheet'; moreSheet.hidden = true; moreSheet.setAttribute('aria-label', 'More pages');
  backdrop.className = 'more-backdrop'; backdrop.hidden = true;
  let moreBtn = null;
  function drawTabs() {
    const tabs = tabsChosen(), rest = ['cpm', 'tools', 'progress', 'unlimited', 'courses', 'tutor', 'family', 'profile', 'settings'].filter(k => !tabs.includes(k));
    tabbar.innerHTML = [['home', '#/', 'Home', 'home']].concat(tabs.map(k => [k, PAGES[k][0], PAGES[k][1], PAGES[k][2]])).map(([k, href, name, ic]) => `<a href="${href}" data-nav="${k}"><span class="tab-ic">${ICONS.svg(ic, 22)}</span>${name}</a>`).join('')
      + `<button type="button" id="tab-more" aria-expanded="false" aria-controls="more-sheet"><span class="tab-ic">${ICONS.svg('more', 22)}</span>More</button>`;
    moreSheet.innerHTML = rest.map(k => `<a href="${PAGES[k][0]}" data-nav="${k}"><span class="more-ic">${ICONS.svg(PAGES[k][2], 20)}</span><span><b>${PAGES[k][1]}</b><small>${PAGES[k][3]}</small></span></a>`).join('')
      + `<a href="#/sitemap" class="more-all"><span class="more-ic">${ICONS.svg('globe', 20)}</span><span><b>All pages</b><small>Everything in Procademy, in one place</small></span></a>
      <button type="button" class="btn sm ghost more-choose" id="tabs-choose" aria-expanded="false">Choose the tabs at the bottom</button><div class="tab-pick" id="tab-pick" hidden></div>`;
    moreBtn = tabbar.querySelector('#tab-more');
    moreBtn.addEventListener('click', () => showMore(moreSheet.hidden));
    moreSheet.querySelector('#tabs-choose').addEventListener('click', chooseTabs);
  }
  /** the three tabs between Home and More, chosen in the More sheet */
  function chooseTabs() {
    const box = moreSheet.querySelector('#tab-pick'), btn = moreSheet.querySelector('#tabs-choose');
    if (!box.hidden) { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); return; }
    const on = tabsChosen();
    box.innerHTML = `<p class="small muted" style="margin:0 0 6px">Choose three. Home and More always stay.</p>${CHOOSABLE.map(k => `<label class="tab-opt"><input type="checkbox" value="${k}" ${on.includes(k) ? 'checked' : ''}> ${PAGES[k][1]}</label>`).join('')}
      <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm primary" id="tabs-save">Save</button></div>`;
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
    const boxes = [...box.querySelectorAll('input')], save = box.querySelector('#tabs-save');
    const sync = () => { const n = boxes.filter(b => b.checked).length; save.disabled = n !== 3; boxes.forEach(b => { b.disabled = !b.checked && n >= 3; }); };
    boxes.forEach(b => b.addEventListener('change', sync)); sync();
    save.addEventListener('click', () => { S.setProfile({ tabs: CHOOSABLE.filter(k => boxes.find(b => b.value === k).checked) }); drawTabs(); render(); V.toast('Tabs saved'); });
  }
  document.body.append(backdrop, moreSheet, tabbar);
  const showMore = on => { moreSheet.hidden = backdrop.hidden = !on; moreBtn.setAttribute('aria-expanded', String(on)); if (on) moreSheet.querySelector('a').focus(); };
  drawTabs();
  backdrop.addEventListener('click', () => showMore(false));
  moreSheet.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });          // also when it's the page already open
  tabbar.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !moreSheet.hidden) { showMore(false); moreBtn.focus(); } });
  // the menu says a little more about each page when pointed at
  document.querySelectorAll('.nav a[data-nav]').forEach(a => { const pg = PAGES[a.dataset.nav]; if (pg) a.title = pg[3]; else if (a.dataset.nav === 'home') a.title = 'Today’s plan, your streak and your courses'; });
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
  const so = document.getElementById('search-open');
  if (so) so.addEventListener('click', () => document.getElementById('search-input').focus());          // phones: search behind an icon
  document.getElementById('search-form').addEventListener('submit', ev => {
    ev.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    location.hash = '#/search/' + encodeURIComponent(q);
  });
  document.addEventListener('keydown', ev => {
    const typing = document.activeElement && (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable);
    if (ev.key === '/' && !typing) { ev.preventDefault(); document.getElementById('search-input').focus(); }
    if (ev.key === '?' && !typing && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); showKeys(); }
  });
  /** every keyboard shortcut, in one panel (? opens it) */
  function showKeys() {
    let d = document.getElementById('keys-dialog');
    if (!d) {
      const rows = [['Anywhere', [['/', 'Search'], ['?', 'This list of shortcuts'], ['Esc', 'Close a menu or panel']]],
        ['Practice', [['Enter', 'Check, then go to the next question'], ['1 to 4', 'Choose an answer'], ['H', 'Take a hint'], ['S', 'Skip for now']]],
        ['Tutor', [['Enter', 'Send'], ['Shift + Enter', 'A new line']]],
        ['Calculators', [['Enter', 'Work it out'], ['Esc', 'Clear the line'], ['Ctrl + Z', 'Undo on the graphing calculator']]]];
      d = document.createElement('dialog');
      d.id = 'keys-dialog'; d.className = 'keys-dialog'; d.setAttribute('aria-labelledby', 'keys-h');
      d.innerHTML = `<div class="row between"><h2 id="keys-h" style="margin:0">Keyboard shortcuts</h2><button type="button" class="iconbtn" id="keys-x" aria-label="Close">✕</button></div>
        <div class="keys-groups">${rows.map(([g, list]) => `<section><h3>${g}</h3><dl>${list.map(([k, w]) => `<dt>${k.split(' + ').map(x => `<kbd>${x}</kbd>`).join(' + ')}</dt><dd>${w}</dd>`).join('')}</dl></section>`).join('')}</div>`;
      document.body.appendChild(d);
      d.querySelector('#keys-x').addEventListener('click', () => d.close());
      d.addEventListener('click', ev => { if (ev.target === d) d.close(); });          // a click outside the panel closes it
    }
    if (!d.open) d.showModal();
  }
  window.addEventListener('hashchange', render);
  // a table too wide for a phone scrolls in its own box (app.css); keyboard users can scroll it once it can take focus
  let tablesQueued = false;
  const markWideTables = () => { tablesQueued = false; main.querySelectorAll('.mtable').forEach(t => { if (t.scrollWidth > t.clientWidth + 1) t.setAttribute('tabindex', '0'); else t.removeAttribute('tabindex'); }); };
  const queueTables = () => { if (!tablesQueued) { tablesQueued = true; requestAnimationFrame(markWideTables); } };
  new MutationObserver(queueTables).observe(main, { childList: true, subtree: true });
  window.addEventListener('resize', queueTables);
  APP.applyPrefs();
  APP.refreshStats();
  if (window.PREP && PREP.timerChip) PREP.timerChip();
  if (window.TUTORUI) TUTORUI.init();
  render();
  if (window.ACCOUNT) ACCOUNT.start();               // a signed-in learner: merge in what other computers saved

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.PROCADEMY_OFFLINE) {
    const hadOne = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      // look for a new version when the learner comes back to the tab
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => { /* offline support is optional */ });
    // a new version took over: say so, with one tap to see it (a first visit has nothing to refresh)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadOne || document.getElementById('update-bar')) return;
      const bar = document.createElement('div');
      bar.id = 'update-bar'; bar.className = 'update-bar'; bar.setAttribute('role', 'status');
      bar.innerHTML = '<span>A new version of Procademy is ready.</span><button type="button" class="btn sm primary" id="update-go">Refresh</button><button type="button" class="iconbtn sm" id="update-x" aria-label="Later">✕</button>';
      document.body.appendChild(bar);
      bar.querySelector('#update-go').addEventListener('click', () => location.reload());
      bar.querySelector('#update-x').addEventListener('click', () => bar.remove());
    });
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

  // the header's avatar: with several learners on this device, a short menu switches between them at once
  const avBtn = document.getElementById('avatar-btn');
  const closeLearnerMenu = () => { const m = document.getElementById('learner-menu'); if (m) m.remove(); if (avBtn) avBtn.removeAttribute('aria-expanded'); };
  if (avBtn) avBtn.addEventListener('click', ev => {
    if (!window.LEARNERS || LEARNERS.count() < 2 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    ev.preventDefault();
    if (document.getElementById('learner-menu')) { closeLearnerMenu(); return; }
    const esc = V._h.esc, act = LEARNERS.active(), m = document.createElement('div');
    m.id = 'learner-menu'; m.className = 'learner-menu'; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', 'Switch learner');
    m.innerHTML = '<p class="tiny muted">Who is practicing?</p>' + LEARNERS.list().map(x => {
      const a = x.avatar || {}, first = x.name && x.name.trim() ? esc(Array.from(x.name.trim())[0].toUpperCase()) : '?';
      return `<button type="button" role="menuitemradio" aria-checked="${x.id === act}" data-switch="${esc(x.id)}"><span class="avatar" style="--av:${a.hue == null ? 215 : Number(a.hue) || 0}" aria-hidden="true">${first}</span><span class="lm-name">${esc(x.name || 'Unnamed learner')}</span>${x.id === act ? '<span class="tiny muted">now</span>' : x.pin ? '<span class="tiny muted">PIN</span>' : ''}</button>`;
    }).join('') + '<div class="lm-links"><a role="menuitem" href="#/profile">Profile</a><a role="menuitem" href="#/settings">Settings</a></div>';
    document.body.appendChild(m);
    const r = avBtn.getBoundingClientRect();
    m.style.top = Math.round(r.bottom + 8) + 'px'; m.style.right = Math.max(8, Math.round(innerWidth - r.right)) + 'px';
    avBtn.setAttribute('aria-expanded', 'true');
    m.querySelector('[aria-checked="true"], button').focus();
    m.addEventListener('click', async e => {
      const b = e.target.closest('[data-switch]');
      if (e.target.closest('a')) { closeLearnerMenu(); return; }
      if (!b) return;
      const id = b.dataset.switch, who = LEARNERS.list().find(x => x.id === id);
      if (id === LEARNERS.active()) { closeLearnerMenu(); return; }
      if (who && who.pin) { try { sessionStorage.setItem('procademy.goLearners', '1'); } catch (er) { /* the Profile page opens at the top */ } closeLearnerMenu(); location.hash = '#/profile'; V.toast(`Enter ${who.name || 'their'}’s PIN on the Profile page.`); return; }
      try { await LEARNERS.switchTo(id); closeLearnerMenu(); V.toast(`Switched to ${(who && who.name) || 'this learner'}.`); render(); } catch (er) { closeLearnerMenu(); V.toast(er.message); }
    });
  });
  document.addEventListener('click', ev => { const m = document.getElementById('learner-menu'); if (m && !m.contains(ev.target) && ev.target !== avBtn && !(avBtn && avBtn.contains(ev.target))) closeLearnerMenu(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && document.getElementById('learner-menu')) { closeLearnerMenu(); if (avBtn) avBtn.focus(); } });
  window.addEventListener('hashchange', closeLearnerMenu);

  // what's new, once, the first time after an update: the newest items, with Got it (a first visit has nothing to announce)
  (function whatsNewOnce() {
    const W = window.WHATSNEW, latest = W && W.UPDATES && W.UPDATES[0];
    if (!latest || window.PROCADEMY_OFFLINE) return;
    const st = S.get(), p = st.profile, returning = Object.values(st.days).some(d => d.q) || Object.keys(st.skills).length;
    if (p.seenUpdate === latest[0]) return;
    if (!returning) { S.setProfile({ seenUpdate: latest[0] }); return; }
    const esc = V._h.esc, items = latest[1].slice(0, 3);
    const pop = document.createElement('aside');
    pop.id = 'wn-pop'; pop.className = 'wn-pop'; pop.setAttribute('aria-labelledby', 'wn-pop-h');
    pop.innerHTML = `<div class="row between"><h2 id="wn-pop-h">New in Procademy</h2><button type="button" class="iconbtn sm" id="wn-pop-x" aria-label="Close">✕</button></div>
      <ul>${items.map(([href, name, what]) => `<li><a href="${esc(href)}"><b>${esc(name)}</b></a><span class="small muted">${esc(what.length > 90 ? what.slice(0, 87) + '…' : what)}</span></li>`).join('')}</ul>
      <div class="btn-row"><a class="btn sm" href="#/new">See everything new</a><button type="button" class="btn sm primary" id="wn-pop-ok">Got it</button></div>`;
    const seen = () => { S.setProfile({ seenUpdate: latest[0] }); pop.remove(); };
    document.body.appendChild(pop);
    pop.querySelector('#wn-pop-ok').addEventListener('click', seen);
    pop.querySelector('#wn-pop-x').addEventListener('click', seen);
    pop.querySelectorAll('a').forEach(a => a.addEventListener('click', seen));
  })();
  // home: a short tip the first time each tool opens (profile.tipsSeen), a warm word for the very first badge, and the tour again
  const TIPS = {
    calc: 'Press the keys or type on your keyboard. Enter works it out, and Esc clears the line.',
    graph: 'Type an equation, then drag a slider to watch the graph change. Ctrl + Z undoes a change.',
    numbers: 'Try a number from your homework. Two or three numbers, like 12, 18, give their GCF and LCM.',
    data: 'Paste the numbers from your homework, separated by spaces or commas, to see every statistic at once.',
    shapes: 'Choose a shape, then type its measurements. It’s drawn to scale, with each step of the working.',
    geometry: 'Three tools in one: a sketch pad, constructions with a compass and straightedge, and transformations on a grid.',
    measure: 'Every conversion shows its steps, so you can use the same method in your homework.',
    percent: 'Each answer is drawn on a percent ruler, so you can see how the part, the whole and the percent fit together.',
    fractions: 'Choose what to do, type the fractions, and the drawing shows why each step works.',
    integers: 'A + tile and a − tile make a zero pair. Step through slowly and watch the pairs cancel.',
    chance: 'Run an experiment a few times, then 1,000 times. The more trials, the closer it gets to the theoretical probability.',
    tiles: 'Like the mat in class: only legal moves are allowed, so whatever you do to one side, do to the other.',
    setup: 'Write the equation first, then solve it. Every step is checked as you go.',
    steps: 'Write one step per line. Each line is checked, and a slip is named so you can fix it.',
    sprint: 'One minute a round. The facts you miss come back more often, so they stick.',
    words: 'Select the star beside a word to add it to your flashcards.',
    leap: 'Plan before you move: every card is used exactly once, and the holes are off limits.',
    balance: 'Weight times distance must match on both sides. Placing the heaviest weight first often helps.',
    timer: 'Focus while the timer runs, then take the short break. The time left shows at the top of every page.',
  };
  function toolTip() {
    const path = location.hash.replace(/^#/, '') || '/', m = /^\/(calc|graph|numbers|data|shapes|geometry|measure|percent|leap|balance|fractions|integers|chance|tiles|setup|steps|sprint|words|timer)(\/|$)/.exec(path);
    const k = m && !/^\/words\/cards/.test(path) ? m[1] : null;
    if (!k || !TIPS[k] || (S.get().profile.tipsSeen || {})[k]) return;
    let n = 0;
    const put = () => {
      if ((location.hash.replace(/^#/, '') || '/') !== path || main.querySelector('.tool-tip')) return;
      if (main.querySelector('.boot-wait') || !main.firstElementChild) { if (n++ < 60) setTimeout(put, 100); return; }          // a tool still loading
      const tip = document.createElement('aside');
      tip.className = 'tool-tip'; tip.setAttribute('aria-label', 'Tip');
      tip.innerHTML = `<span class="tool-tip-ic">${ICONS.svg('info', 18)}</span><p><b>Tip:</b> ${TIPS[k]}</p><button type="button" class="btn sm ghost">Got it</button>`;
      const crumbs = main.querySelector(':scope > .crumbs');
      if (crumbs) crumbs.after(tip); else main.prepend(tip);
      tip.querySelector('button').addEventListener('click', () => tip.remove());
      S.setProfile({ tipsSeen: Object.assign({}, S.get().profile.tipsSeen, { [k]: Date.now() }) });          // once, even if it isn't put away
    };
    setTimeout(put, 0);
  }
  window.addEventListener('hashchange', toolTip);
  toolTip();
  // the very first answer earns the first badge: said with a small card instead of a passing note
  let checking = false;
  S.onChange(st => {
    if (checking || !window.BADGES || (st.badges && st.badges.first)) return;
    const q = Object.values(st.days).reduce((a, d) => a + (d.q || 0), 0);
    if (q < 1 || q > 12) return;          // answers are counted as a set ends: a first set is 7 to 10
    checking = true;
    let got = [];
    try { got = BADGES.check(true); } finally { checking = false; }          // earned now, quietly, so no passing note says it first
    if (!got.some(b => b.id === 'first')) return;
    setTimeout(() => {
      const pop = document.createElement('div');
      pop.className = 'first-badge'; pop.setAttribute('role', 'status');
      pop.innerHTML = `<span class="fb-medal">${ICONS.svg('medal', 22)}</span><p><b>Your first badge: First question.</b> <span>A good start. Every answer counts toward today’s goal.</span></p><a class="btn sm" href="#/progress">See badges</a><button type="button" class="iconbtn sm" aria-label="Close">✕</button>`;
      document.body.appendChild(pop);
      const bye = () => pop.remove();
      pop.querySelector('button').addEventListener('click', bye);
      pop.querySelector('a').addEventListener('click', () => { bye(); window.addEventListener('hashchange', () => setTimeout(() => { const b = document.getElementById('badges'); if (b) b.scrollIntoView({ block: 'start' }); }, 30), { once: true }); });
      setTimeout(bye, 9000);
    }, 0);
  });
  // Take the tour again (Settings, All pages): back to Home, where it starts
  document.addEventListener('click', ev => {
    if (!(ev.target.closest && ev.target.closest('[data-tour-again]'))) return;
    S.setProfile({ tourNext: true });
    if ((location.hash.replace(/^#\/?/, '') || '') === '') render(); else location.hash = '#/';
  });
})();
