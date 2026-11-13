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
    [/^\/words\/([a-z0-9-]+)$/, m => VOCAB.page(main, m[1]), m => (m[1] === 'formulas' ? 'Formulas' : 'Math words')],
    // languages: Hindi flashcards, and typing practice with math words
    [/^\/words\/cards\/hindi$/, () => VOCAB.cards(main, 'hindi'), 'Hindi flashcards'],
    [/^\/typing\/?$/, () => TYPING.page(main), 'Typing practice'],
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
    [/^\/review\/five$/, () => V.quickFive(main, '#/'), 'Review'],              // a quick round of five mistakes, from Home
    [/^\/progress$/, () => V.progress(main), 'Progress'],
    [/^\/settings$/, () => V.settings(main), 'Settings'],
    [/^\/new\/?$/, () => WHATSNEW.page(main), 'Updates'],
    [/^\/notes\/?$/, () => V.notes(main), 'My notes'],
    [/^\/family\/?$/, () => FAMILY.page(main), 'Family and class'],
    [/^\/family\/start$/, () => FAMILY.page(main, 'guide'), 'Family and class'],
    [/^\/family\/privacy$/, () => FAMILY.page(main, 'privacy'), 'Family and class'],
    [/^\/family\/add\/(.+)$/, m => FAMILY.addPage(main, m[1]), 'Family and class'],
    [/^\/placement\/([^/]+)$/, m => PLACEMENT.page(main, m[1]), 'Find your starting point'],
    [/^\/unlimited\/?$/, () => UNLIMITED.page(main), 'Unlimited practice'],
    [/^\/unlimited\/([a-z]+)(?:\/([^/]+))?(?:\/([^/]+))?$/, m => UNLIMITED.play(main, m[1], dec(m[2] || ''), dec(m[3] || '')), m => ({ picture: 'Questions like a picture', pictures: 'Questions like a picture', day: 'Problem of the day', quick: 'Five minutes of practice', weak: 'Mix my weak skills', exam: 'Practice like the test', vs: 'A friend’s challenge', round: 'Challenge a friend', mix: 'Mixed practice', set: 'A practice set', courses: 'Practice a course', topics: 'Practice a topic' })[m[1]] || 'Unlimited practice'],
    [/^\/search\/?(.*)$/, m => V.search(main, dec(m[1])), 'Search'],
    [/^\/mastered\/?$/, () => V.mastered(main), 'Mastered skills'],
    [/^\/sitemap\/?$/, () => V.sitemap(main), 'All pages'],
    // help: short how-to articles (lib/help.js)
    [/^\/help\/?$/, () => HELP.page(main, null), 'Help'],
    [/^\/help\/([a-z-]+)$/, m => HELP.page(main, m[1]), m => { const a = HELP.ARTICLES.find(x => x[0] === m[1]); return a ? a[1] : 'Not found'; }],
    [/^\/timer\/?$/, () => PREP.timer(main), 'Study timer'],
    // practice: a timed quiz, beat your best, boss levels, the weekly challenge, a warm-up, a summer plan, ready for high school
    [/^\/quiz\/([^/]+)\/([^/]+)$/, m => V.quiz(main, m[1], m[2]), 'Timed quiz'],
    [/^\/boss\/([^/]+)\/([^/]+)$/, m => V.boss(main, m[1], m[2]), 'Boss level'],
    [/^\/speed\/([^/]+)$/, m => V.speed(main, dec(m[1])), 'Beat your best'],
    [/^\/weekly\/?$/, () => V.weekly(main), 'This week’s challenge'],
    [/^\/warmup\/?$/, () => V.warmup(main), 'Mental math warm-up'],
    [/^\/summer\/?$/, () => V.summer(main), 'Summer review'],
    [/^\/ready\/?$/, () => V.ready(main), 'Ready for high school'],
    // puzzles: every puzzle of the day and past days, Leap's other number lines, a game for two (lib/puzzles.js)
    [/^\/puzzles\/?$/, () => PUZZLES.hub(main), 'Puzzles'],
    [/^\/puzzles\/archive$/, () => PUZZLES.archive(main), 'Past puzzles'],
    [/^\/puzzles\/(target|cages|cross|three)(?:\/(\d{4}-\d\d-\d\d))?$/, m => PUZZLES[m[1] + 'Page'](main, m[2] || null), m => ({ target: 'Target', cages: 'Cages', cross: 'Cross-number', three: 'Daily three' })[m[1]]],
    [/^\/puzzles\/duel$/, () => PUZZLES.duelPage(main), 'Factor grab'],
    [/^\/leap\/(negatives|fractions|decimals)(?:\/(\d+))?$/, m => LEAP.page(main, m[2] || null, { pack: m[1] }), 'Leap'],
    [/^\/leap\/day\/(\d{4}-\d\d-\d\d)$/, m => LEAP.page(main, 'daily', { date: m[1] }), 'Leap'],
    [/^\/balance\/day\/(\d{4}-\d\d-\d\d)$/, m => BALANCE.page(main, 'daily', { date: m[1] }), 'Balance'],
    [/^\/sprint\/([^/]+)\/race$/, m => SPRINT.race(main, m[1]), 'Race the computer'],
    // the trophy room, certificates, the treasure map and family leagues (lib/trophies.js)
    [/^\/trophies\/?$/, () => TROPHIES.page(main), 'Trophy room'],
    [/^\/certificate\/(unit|course)\/([^/]+)(?:\/([^/]+))?$/, m => TROPHIES.certificate(main, m[1], m[2], m[3] || null), 'Certificate'],
    [/^\/map(?:\/([^/]+))?\/?$/, m => TROPHIES.map(main, m[1] || null), 'Treasure map'],
    [/^\/league\/?$/, () => TROPHIES.league(main, null), 'Family league'],
    [/^\/league\/(.+)$/, m => TROPHIES.league(main, m[1]), 'Family league'],
  ];
  /* the Courses page opens on the filter last chosen there, unless All was just chosen on it */
  const UI_COURSES = 'procademy.ui.courses';
  let lastPath = '';
  function lastCourses() {
    if (/^\/courses(\/|$)/.test(lastPath)) { try { localStorage.setItem(UI_COURSES, 'all'); } catch (e) { /* fine */ } return 'all'; }
    try { return localStorage.getItem(UI_COURSES) || 'all'; } catch (e) { return 'all'; }
  }
  /* ---------- where each page belongs: the menu item and tab lit for it, and the start of its breadcrumbs ---------- */
  const TOOLS_RE = /^\/(tools|calc|graph|numbers|data|shapes|geometry|measure|ratios|money|typing|percent|leap|balance|fractions|integers|chance|tiles|setup|steps|sprint|words|timer|puzzles)(\/|$)/;
  /** the section a page is in (a key of SECTION_HOME, or 'home'), or null for pages outside them (search, a challenge link) */
  function sectionOf(path) {
    if (path === '/' || path === '' || path === '/daily') return 'home';
    if (/^\/(cpm|cpm-practice|prep)(\/|$)/.test(path) || /^\/worksheet\/lesson\//.test(path)) return 'cpm';
    if (/^\/(courses|course|unit|skill|practice|test|challenge|mastery|quiz|boss|speed|placement|worksheet)(\/|$)/.test(path)) return 'courses';
    if (/^\/(unlimited|warmup|weekly|summer|ready)(\/|$)/.test(path)) return 'unlimited';
    if (/^\/tutor(\/|$)/.test(path)) return 'tutor';
    if (TOOLS_RE.test(path)) return 'tools';
    if (/^\/(progress|notes|report|review|mastered)(\/|$)/.test(path)) return 'progress';
    if (/^\/family(\/|$)/.test(path)) return 'family';
    if (/^\/(profile|move)(\/|$)/.test(path)) return 'profile';
    if (/^\/(settings|new)(\/|$)/.test(path)) return 'settings';
    if (/^\/help(\/|$)/.test(path)) return 'help';
    if (/^\/sitemap\/?$/.test(path)) return 'sitemap';
    return null;
  }
  const SECTION_HOME = {
    courses: ['#/courses', 'Courses'], unlimited: ['#/unlimited', 'Practice'], cpm: ['#/cpm', 'CPM books'], tutor: ['#/tutor', 'Tutor'], tools: ['#/tools', 'Tools'],
    progress: ['#/progress', 'Progress'], family: ['#/family', 'Family and class'], profile: ['#/profile', 'Profile'], settings: ['#/settings', 'Settings'], help: ['#/help', 'Help'], sitemap: ['#/sitemap', 'All pages'],
  };
  const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const title = o => (o && o.title) ? ACADEMY.stripTags(o.title).trim() : 'Not found';

  /* ---------- going back keeps your place: each visit is marked in the browser's history, and a page you go back to
     (with Back, a swipe, or a link to the page you just came from) opens where it was scrolled to ---------- */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* fine */ }
  const scrollMem = new Map(), trail = [];
  let navKey = null, navI = 0;
  /** mark this visit in the history (or find its mark): true when it was there already (Back, Forward, or drawn again) */
  function stampVisit() {
    let st = history.state;
    if (st && typeof st === 'object' && st.pk) { navKey = st.pk; navI = st.pi || 1; return true; }
    st = Object.assign({}, st && typeof st === 'object' ? st : {}, { pk: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), pi: navI + 1 });
    try { history.replaceState(st, ''); } catch (e) { /* the place just isn't kept */ }
    navKey = st.pk; navI = st.pi;
    return false;
  }
  /** scroll to y once the page is tall enough (a page can take a moment to draw) */
  function scrollBackTo(y) {
    let n = 0;
    const go = () => {
      const room = document.documentElement.scrollHeight - window.innerHeight;
      if (room >= y - 2 || n++ > 30) { window.scrollTo(0, Math.min(y, Math.max(0, room))); return; }
      requestAnimationFrame(go);
    };
    go();
  }

  /** the page being left (render calls this first, while it is still on screen): a practice set left halfway is
      remembered for the note on the next page (leftNote) */
  let leftSet = null;
  function noteLeaving(from, to) {
    leftSet = null;
    const s = main.__session, E = window.ENGINE, key = '#' + from;
    if (!s || !E || !from || from === to || !/^\/(practice|daily|test|challenge|mastery|quiz|boss|speed|cpm-practice|review|warmup|weekly|summer|ready)(\/|$)/.test(from) || !main.querySelector('.ex') || ['endless', 'placement', 'testout'].includes(s.kind) || E.isDone(s) || !(s.results || []).some(r => r && r.done)) return;
    if ((S.get().profile.paused || {})[key]) return;                    // paused on purpose: it waits on Home
    try { leftSet = { key, packed: E.pack(s), title: ACADEMY.stripTags(s.title || ''), i: s.i, n: s.items.length }; } catch (e) { leftSet = null; }
  }

  function render() {
    let path = location.hash.replace(/^#/, '') || '/';
    noteLeaving(lastPath, path);
    const tabGo = rememberedTab(path);                       // Words or Algebra tiles open on the tab last chosen there
    if (tabGo) { try { history.replaceState(history.state, '', '#' + tabGo); path = tabGo; } catch (e) { /* the first tab, then */ } }
    if (navKey && !main.querySelector(':scope > .boot-wait')) scrollMem.set(navKey, window.scrollY);       // where the page being left was scrolled to
    const known = stampVisit();
    let backY = known ? scrollMem.get(navKey) : undefined;
    if (!known) {                                            // a link to the page just left before this one: back to its place too
      const prev = trail[trail.length - 2];
      if (prev && prev.hash === location.hash && scrollMem.has(prev.key)) backY = scrollMem.get(prev.key);
    }
    if (!trail.length || trail[trail.length - 1].key !== navKey) { trail.push({ hash: location.hash, key: navKey }); if (trail.length > 20) trail.shift(); }
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
        here = { path, title: t || '' };
        placeCrumbs(); wordTabs(); restoreTabs();
        const ct = path.match(/^\/courses\/([^/]+)$/);
        if (ct) try { localStorage.setItem(UI_COURSES, dec(ct[1])); } catch (e) { /* fine */ }
        break;
      }
    }
    if (!matched) { V.notFound(main); document.title = 'Not found · ' + V.brand(); here = { path, title: '', none: true }; }
    notePage();
    // the menu item, tab or More for the page's section is lit, on every page inside it too (a skill lights Courses)
    const sec = sectionOf(path);
    document.querySelectorAll('[data-nav]').forEach(a => {
      const on = a.dataset.nav === sec;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    moreBtn.classList.toggle('active', !!sec && sec !== 'home' && !tabsChosen().includes(sec));
    const si = document.getElementById('search-input');
    if (si && !path.startsWith('/search')) si.value = '';
    lastPath = path;
    if (backY > 0) scrollBackTo(backY); else window.scrollTo(0, 0);
  }

  /* ---------- breadcrumbs: the same line, in the same place, at the top of every page but Home ----------
     A page's own trail (a skill's course and unit, a CPM chapter's book) is kept and tidied: it moves to the very
     top, starts at Home, and ends with the page itself. Other pages get Home, their section and their name. The
     line also holds Back to course (units and skills), Copy link (tools) and the favorite star. A page that draws
     itself again (a filter, a tab) gets its line back at once. */
  let here = { path: '', title: '' };
  const STAR = on => `<svg class="ic" viewBox="0 0 24 24" width="18" height="18" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z"/></svg>`;
  const LINE_IC = d => `<svg class="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  const FULL_IC = LINE_IC('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), CLOSE_IC = LINE_IC('<path d="M6 6l12 12M18 6 6 18"/>');
  const BACK_IC = LINE_IC('<path d="M19 12H5M11 6l-6 6 6 6"/>'), LINK_IC = LINE_IC('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>');
  /** no breadcrumbs on Home, in a practice set or flashcards (their own Back is in the same spot), on the tutor's full-height page, or while a page loads */
  const noCrumbs = () => here.none || sectionOf(here.path) === 'home' || !!main.querySelector('.ex-head, .boot-wait') || document.body.classList.contains('on-ai-page');
  /** the course a unit or skill page belongs to */
  function courseOfPage(path) {
    let m = /^\/unit\/([^/]+)\//.exec(path);
    if (m) return ACADEMY.courseById(m[1]);
    m = /^\/skill\/([^/]+)$/.exec(path);
    const w = m && ACADEMY.whereIs(dec(m[1]));
    return w ? w.course : null;
  }
  function placeCrumbs() {
    const path = here.path, mine = main.querySelector(':scope > nav.crumbs[data-app]');
    if (noCrumbs()) { if (mine) mine.remove(); return; }
    const own = [...main.querySelectorAll('.crumbs:not([data-app])')];
    if (mine && mine.dataset.path === path && main.firstElementChild === mine && !own.length) return;          // already in place
    const now = Date.now(); here.times = (here.times || []).filter(t => now - t < 1000).concat(now);
    if (here.times.length > 6) return;                                                                        // never a tug of war with a page
    const esc = V._h.esc;
    let items;
    if (own.length) {          // the page's own trail, from Home
      items = [...own[0].children].filter(e => /^(A|SPAN|B|STRONG)$/.test(e.tagName)).map(e => ({ href: e.tagName === 'A' ? e.getAttribute('href') : null, text: e.textContent.trim() })).filter(x => x.text);
      if (!items.length || items[0].href !== '#/') items.unshift({ href: '#/', text: 'Home' });
      const top = SECTION_HOME[sectionOf(path)];          // and through its section: a skill's trail goes by Courses
      if (top && !items.some(x => x.href === top[0]) && '#' + path !== top[0]) items.splice(1, 0, { href: top[0], text: top[1] });
    } else {
      const top = SECTION_HOME[sectionOf(path)], t = here.title || '';
      items = [{ href: '#/', text: 'Home' }];
      if (top && top[1] !== t && '#' + path !== top[0] && '#' + path + '/' !== top[0]) items.push({ href: top[0], text: top[1] });
      if (t) items.push({ href: null, text: t });
    }
    if (items.length < 2) { if (mine) mine.remove(); return; }
    own.forEach(el => el.remove());
    const last = items.length - 1, course = courseOfPage(path), fav = isFav(location.hash);
    const nav = mine || document.createElement('nav');
    nav.className = 'crumbs'; nav.dataset.app = '1'; nav.dataset.path = path; nav.setAttribute('aria-label', 'Breadcrumb');
    // on a phone the line keeps Home and the page just above this one (the page's own name is its heading)
    const li = (x, k) => `<li class="${k === last ? 'cr-cur' : k > 0 && k < last - 1 ? 'cr-mid' : 'cr-up'}">${x.href && k < last ? `<a href="${esc(x.href)}">${esc(x.text)}</a>` : `<span${k === last ? ' aria-current="page"' : ''}>${esc(x.text)}</span>`}</li>`;
    if (items.length > 2) nav.dataset.long = '1'; else delete nav.dataset.long;
    nav.innerHTML = `<ol>${items.map((x, k) => (k === 1 && last > 2 ? '<li class="cr-gap" aria-hidden="true">…</li>' : '') + li(x, k)).join('')}</ol>
      <span class="crumb-acts">${course ? `<a class="crumb-btn crumb-back" href="${V._h.courseHref(course)}" title="${esc(course.title)}">${BACK_IC}<span class="cb-long">Back to course</span><span class="cb-short">Course</span></a>` : ''}${sectionOf(path) === 'tools' && path !== '/tools' ? `<button type="button" class="crumb-btn crumb-share" title="Copy a link that opens this tool as it is now">${LINK_IC}<span>Copy link</span></button><button type="button" class="crumb-btn crumb-full" title="Use the whole screen for this tool">${FULL_IC}<span>Full screen</span></button>` : ''}<button type="button" class="crumb-btn crumb-fav${fav ? ' on' : ''}" aria-pressed="${fav}" aria-label="Favorite" title="${fav ? 'Remove from favorites' : 'Add to favorites (they’re listed under More)'}">${STAR(fav)}</button></span>`;
    main.prepend(nav);
  }
  /* ---------- tabbed pages open on the tab last chosen: the tab is remembered when the learner picks it (profile.uiTabs) ---------- */
  const ROUTE_TABS = { '/tiles': ['/tiles', '/tiles/compare', '/tiles/factor'], '/words': ['/words', '/words/formulas', '/words/cards'] };
  const SKIP_TABS = '.ac-tabs, .words-tabs, .me-tabs';
  const uiTabs = () => { const t = S.get().profile.uiTabs; return t && typeof t === 'object' && !Array.isArray(t) ? t : {}; };
  const tabKeyOf = b => { for (const a of b.attributes) if (/^data-/.test(a.name)) return a.name + '=' + a.value; return 'text=' + b.textContent.trim(); };
  const tabListKey = list => here.path.split('/').slice(0, 2).join('/') + '|' + (list.getAttribute('aria-label') || list.className);
  /** opening Words or Algebra tiles from elsewhere: the tab last chosen there, or null */
  function rememberedTab(path) {
    const tabs = ROUTE_TABS[path.replace(/\/$/, '')], want = tabs && uiTabs()[path.replace(/\/$/, '')];
    if (!tabs || !want || want === path || !tabs.includes(want) || tabs.some(t => lastPath === t)) return null;
    return want;
  }
  /** a page whose tabs are buttons (a tool's views, Progress's days and weeks) opens on the one last chosen */
  function restoreTabs() {
    const mem = uiTabs();
    main.querySelectorAll('[role="tablist"]').forEach(list => {
      if (list.matches(SKIP_TABS)) return;
      const want = mem[tabListKey(list)], b = want && [...list.querySelectorAll('button[role="tab"]')].find(x => tabKeyOf(x) === want);
      if (b && b.getAttribute('aria-selected') !== 'true' && !b.classList.contains('on')) b.click();
    });
  }
  main.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[role="tablist"] [role="tab"]');
    if (!b || !ev.isTrusted) return;                                  // the learner's own choice, not one put back here
    const list = b.closest('[role="tablist"]'), patch = {};
    if (list.matches(SKIP_TABS) && !list.matches('.words-tabs')) return;
    if (b.tagName === 'A') {
      const to = (b.getAttribute('href') || '').replace(/^#/, ''), group = Object.keys(ROUTE_TABS).find(g => ROUTE_TABS[g].includes(to));
      if (!group) return;
      patch[group] = to;
    } else patch[tabListKey(list)] = tabKeyOf(b);
    S.setProfile({ uiTabs: Object.assign({}, uiTabs(), patch) });
  });

  /* ---------- a tool on the whole screen, with Close to come back (and Esc, or leaving the page) ---------- */
  const fullClose = document.createElement('button');
  fullClose.type = 'button'; fullClose.className = 'full-close'; fullClose.id = 'full-close'; fullClose.hidden = true;
  fullClose.innerHTML = `${CLOSE_IC}<span>Close full screen</span>`;
  document.body.appendChild(fullClose);
  function toolFull(on) {
    const html = document.documentElement;
    if (on === html.classList.contains('tool-full')) return;
    html.classList.toggle('tool-full', on); fullClose.hidden = !on;
    try {
      if (on && html.requestFullscreen && !document.fullscreenElement) { const p = html.requestFullscreen(); if (p && p.catch) p.catch(() => {}); }
      if (!on && document.fullscreenElement && document.exitFullscreen) { const p = document.exitFullscreen(); if (p && p.catch) p.catch(() => {}); }
    } catch (e) { /* the menus still step aside */ }
    if (on) fullClose.focus({ preventScroll: true }); else { const b = main.querySelector('.crumb-full'); if (b) b.focus({ preventScroll: true }); }
  }
  fullClose.addEventListener('click', () => toolFull(false));
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && document.documentElement.classList.contains('tool-full')) toolFull(false); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && document.documentElement.classList.contains('tool-full') && !document.querySelector('dialog[open], .wb-wrap, .crop-wrap')) toolFull(false); });
  window.addEventListener('hashchange', () => toolFull(false));

  // a page drawing itself again (main's own children change) gets its breadcrumbs back before the screen updates
  let crumbsQueued = false;
  new MutationObserver(() => { if (crumbsQueued) return; crumbsQueued = true; Promise.resolve().then(() => { crumbsQueued = false; if (here.path === (location.hash.replace(/^#/, '') || '/')) { placeCrumbs(); wordTabs(); } }); }).observe(main, { childList: true });
  /** Words, Formulas and Flashcards share one tab bar: the flashcards' deck page gets it too (not a deck being studied) */
  function wordTabs() {
    if (!/^\/words(\/|$)/.test(here.path) || main.querySelector('.words-tabs')) return;
    const head = main.querySelector('.cards-page > .ex-head');
    if (!head || !main.querySelector('.deck-pick')) return;
    head.insertAdjacentHTML('afterend', `<div class="tabs words-tabs" role="tablist" aria-label="Math words">${[['#/words', 'Words'], ['#/words/formulas', 'Formulas'], ['#/words/cards', 'Flashcards']].map(([h, l]) => `<a class="tab${h === '#/words/cards' ? ' on' : ''}" role="tab" aria-selected="${h === '#/words/cards'}" href="${h}">${l}</a>`).join('')}</div>`);
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
  APP.toolFull = toolFull; APP.sectionOf = sectionOf;
  window.APP = APP;

  /* ---------- a 30-second tour: four stops, each pointing at the page it names (the phone's tab bar, or the menu) ---------- */
  const TOUR = [
    [['.today-card', '#welcome', 'main h1'], 'Home', 'Your plan for today: practice, a puzzle and one problem, with your streak and courses below.'],
    [['.nav a[data-nav="unlimited"]', '.tabbar a[data-nav="unlimited"]', '#tab-more'], 'Practice', 'Practice any skill or topic for as long as you like, or make questions from a picture of your homework.'],
    [['.nav a[data-nav="tutor"]', '.tabbar a[data-nav="tutor"]', '#tutor-fab'], 'Tutor', 'Ask about any question. The tutor explains step by step, and never gives away a practice answer.'],
    [['.top a[href="#/settings"]', '#tab-more', '#top-more'], 'Settings', 'Colors, text size, your grade and your goals. On a phone, Settings is under More.'],
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
  // More stay put; the learner chooses the three between them (profile.tabs). On a computer the same More opens
  // from a button in the header, under the menu.
  const PAGES = {
    unlimited: ['#/unlimited', 'Practice', 'unlimited', 'Any skill or topic, as long as you like'], courses: ['#/courses', 'Courses', 'book', 'Every grade, and the CPM books'], tutor: ['#/tutor', 'Tutor', 'sparkle', 'Ask about any question'],
    cpm: ['#/cpm', 'CPM books', 'bookmark', 'Your class book, lesson by lesson'], tools: ['#/tools', 'Tools', 'calc', 'Calculators, labs and puzzles'], progress: ['#/progress', 'Progress', 'trophy', 'Your skills, streak and badges'],
    family: ['#/family', 'Family and class', 'school', 'Progress for everyone you help'], profile: ['#/profile', 'Profile', 'person', 'Your account, and who is learning'], settings: ['#/settings', 'Settings', 'settings', 'Theme, text size and more'],
    help: ['#/help', 'Help', 'info', 'Short how-tos for every part'], sitemap: ['#/sitemap', 'All pages', 'globe', 'Everything in Procademy, in one place'],
  };
  const CHOOSABLE = ['unlimited', 'courses', 'tutor', 'cpm', 'tools', 'progress'], DEFAULT_TABS = ['unlimited', 'courses', 'tutor'];
  const tabsChosen = () => { const t = S.get().profile.tabs; return Array.isArray(t) && t.length === 3 && t.every(k => CHOOSABLE.includes(k)) ? t : DEFAULT_TABS; };
  const isPhone = () => (window.matchMedia ? matchMedia('(max-width: 700px)').matches : window.innerWidth <= 700);
  const tabbar = document.createElement('nav'), moreSheet = document.createElement('nav'), backdrop = document.createElement('div');
  tabbar.className = 'tabbar'; tabbar.setAttribute('aria-label', 'Main');
  moreSheet.className = 'more-sheet'; moreSheet.id = 'more-sheet'; moreSheet.hidden = true; moreSheet.setAttribute('aria-label', 'More pages');
  backdrop.className = 'more-backdrop'; backdrop.hidden = true;
  let moreBtn = null, moreFrom = null;
  // a computer: More beside the profile button, for the pages the menu has no room for
  const topMore = document.createElement('button');
  topMore.type = 'button'; topMore.className = 'iconbtn top-more'; topMore.id = 'top-more';
  topMore.setAttribute('aria-expanded', 'false'); topMore.setAttribute('aria-controls', 'more-sheet'); topMore.setAttribute('aria-label', 'More'); topMore.title = 'More pages, your favorites and recent pages';
  topMore.innerHTML = ICONS.svg('more', 20);
  (function () { const bar = document.querySelector('header.top .bar'), av = document.getElementById('avatar-btn'); if (bar) bar.insertBefore(topMore, av && av.parentNode === bar ? av : null); })();

  /* favorites (profile.favs, per learner, kept with the account) and recent pages (this device, per learner) */
  const favKey = h => String(h || '').replace(/\/+$/, '') || '#';
  const favs = () => { const f = S.get().profile.favs; return Array.isArray(f) ? f.filter(x => x && typeof x.h === 'string' && typeof x.t === 'string') : []; };
  const isFav = h => favs().some(x => favKey(x.h) === favKey(h));
  const RECENT_PAGES = () => 'procademy.recentpages.v1' + (window.LEARNERS && LEARNERS.active ? '.' + LEARNERS.active() : '');
  function recentPages() { try { const v = JSON.parse(localStorage.getItem(RECENT_PAGES()) || '[]'); return Array.isArray(v) ? v.filter(x => x && typeof x.h === 'string' && typeof x.t === 'string') : []; } catch (e) { return []; } }
  /** a page's name in Favorites and Recent: a search says what was searched */
  const pageName = () => { const q = /^\/search\/(.+)$/.exec(here.path); return q ? `Search: ${dec(q[1])}` : here.title; };
  /** the page on screen goes to the top of Recent (not Home, a practice set, or a page still loading) */
  function notePage() {
    if (noCrumbs() || !here.title || /^\/(search\/?$|sitemap|move|vs|family\/add)/.test(here.path)) return;
    const h = location.hash.length > 300 ? '#' + here.path.split('/').slice(0, 2).join('/') : location.hash;
    const list = [{ h, t: pageName() }].concat(recentPages().filter(x => favKey(x.h) !== favKey(h))).slice(0, 8);
    try { localStorage.setItem(RECENT_PAGES(), JSON.stringify(list)); } catch (e) { /* fine */ }
  }
  function toggleFav(btn) {
    const h = location.hash || '#/', on = isFav(h), list = favs();
    S.setProfile({ favs: on ? list.filter(x => favKey(x.h) !== favKey(h)) : [{ h, t: pageName() }].concat(list).slice(0, 12) });
    if (btn) { btn.classList.toggle('on', !on); btn.setAttribute('aria-pressed', String(!on)); btn.title = !on ? 'Remove from favorites' : 'Add to favorites (they’re listed under More)'; btn.innerHTML = STAR(!on); }
    V.toast(on ? 'Removed from favorites.' : 'Added to favorites. They’re listed under More.');
  }

  function drawTabs() {
    const tabs = tabsChosen();
    tabbar.innerHTML = [['home', '#/', 'Home', 'home']].concat(tabs.map(k => [k, PAGES[k][0], PAGES[k][1], PAGES[k][2]])).map(([k, href, name, ic]) => `<a href="${href}" data-nav="${k}"><span class="tab-ic">${ICONS.svg(ic, 22)}</span>${name}</a>`).join('')
      + `<button type="button" id="tab-more" aria-expanded="false" aria-controls="more-sheet"><span class="tab-ic">${ICONS.svg('more', 22)}</span>More</button>`;
    moreBtn = tabbar.querySelector('#tab-more');
    moreBtn.addEventListener('click', () => showMore(moreSheet.hidden, moreBtn));
    drawMore(moreSheet.hidden ? isPhone() : moreFrom !== topMore);          // an open More keeps its kind (the tabs were just chosen in it)
  }
  /** what More holds: the pages not in the tab bar (on a computer, not in the menu), favorites, recent pages, then
      every other page in groups, tools by subject, so each is two taps away on a phone */
  function drawMore(phone) {
    const esc = V._h.esc, tabs = tabsChosen(), hereKey = favKey(location.hash || '#/');
    const keys = (phone ? ['cpm', 'tools', 'progress', 'unlimited', 'courses', 'tutor', 'family', 'profile', 'settings'].filter(k => !tabs.includes(k)) : ['family', 'profile', 'settings']).concat('help', 'sitemap');
    const chips = list => `<ul class="more-links">${list.map(([h, t, star]) => `<li><a href="${esc(h)}"${favKey(h) === hereKey ? ' aria-current="page"' : ''}>${star ? `<span class="more-star">${STAR(true)}</span>` : ''}${esc(t)}</a></li>`).join('')}</ul>`;
    const sec = (name, body, cls) => `<section class="more-sec${cls ? ' ' + cls : ''}"><h3 class="more-h">${esc(name)}</h3>${body}</section>`;
    const fav = favs(), rec = recentPages().filter(r => favKey(r.h) !== hereKey && !fav.some(f => favKey(f.h) === favKey(r.h))).slice(0, 4);
    const g = V.sitemap && V.sitemap.groups ? V.sitemap.groups() : null, shown = new Set(keys.map(k => PAGES[k][0]).concat(tabs.map(k => PAGES[k][0]), '#/'));
    const rest = list => list.filter(([h]) => !shown.has(h));
    const a = `<div class="more-pages">${keys.map(k => `<a class="more-page" href="${PAGES[k][0]}" data-nav="${k}"><span class="more-ic">${ICONS.svg(PAGES[k][2], 20)}</span><span><b>${PAGES[k][1]}</b><small>${PAGES[k][3]}</small></span></a>`).join('')}</div>`
      + (fav.length ? sec('Favorites', chips(fav.map(x => [x.h, x.t, true]))) : '')
      + (rec.length ? sec('Recent', chips(rec.map(x => [x.h, x.t])), 'more-recent') : '')
      + (g ? [g.day, g.practice].map(([n, list]) => sec(n, chips(rest(list)))).join('') : '');
    const b = g ? sec('Tools by subject', g.tools.map(([n, list]) => `<h4 class="more-sub">${esc(n)}</h4>${chips(list)}`).join(''), 'more-tools')
      + [g.help, g.you, g.courses].map(([n, list]) => (rest(list).length ? sec(n, chips(rest(list))) : '')).join('') : '';
    moreSheet.innerHTML = `<div class="more-a">${a}</div><div class="more-b">${b}</div>${phone ? '<div class="more-foot"><button type="button" class="btn sm ghost more-choose" id="tabs-choose" aria-expanded="false">Choose the tabs at the bottom</button><div class="tab-pick" id="tab-pick" hidden></div></div>' : ''}`;
    const tc = moreSheet.querySelector('#tabs-choose');
    if (tc) tc.addEventListener('click', chooseTabs);
    const sec2 = sectionOf(location.hash.replace(/^#/, '') || '/');
    moreSheet.querySelectorAll('[data-nav]').forEach(x => { const on = x.dataset.nav === sec2; x.classList.toggle('active', on); if (on) x.setAttribute('aria-current', 'page'); });
  }
  /** the three tabs between Home and More, chosen in the More sheet */
  function chooseTabs() {
    const box = moreSheet.querySelector('#tab-pick'), btn = moreSheet.querySelector('#tabs-choose');
    if (!box.hidden) { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); return; }
    const on = tabsChosen();
    box.innerHTML = `<p class="small muted" style="margin:0 0 6px">Choose three. Home and More always stay.</p>${CHOOSABLE.map(k => `<label class="tab-opt"><input type="checkbox" value="${k}" ${on.includes(k) ? 'checked' : ''}> ${PAGES[k][1]}</label>`).join('')}
      <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm primary" id="tabs-save">Save</button></div>`;
    box.hidden = false; btn.setAttribute('aria-expanded', 'true');
    box.scrollIntoView({ block: 'nearest' });
    const boxes = [...box.querySelectorAll('input')], save = box.querySelector('#tabs-save');
    const sync = () => { const n = boxes.filter(b => b.checked).length; save.disabled = n !== 3; boxes.forEach(b => { b.disabled = !b.checked && n >= 3; }); };
    boxes.forEach(b => b.addEventListener('change', sync)); sync();
    save.addEventListener('click', () => { S.setProfile({ tabs: CHOOSABLE.filter(k => boxes.find(b => b.value === k).checked) }); drawTabs(); render(); V.toast('Tabs saved'); });
  }
  document.body.append(backdrop, moreSheet, tabbar);
  const showMore = (on, from) => {
    if (on) { moreFrom = from || moreBtn; drawMore(moreFrom !== topMore); }          // from the tab bar: a phone's More
    moreSheet.hidden = backdrop.hidden = !on;
    document.body.classList.toggle('more-open', on);
    [moreBtn, topMore].forEach(b => b.setAttribute('aria-expanded', String(on && b === moreFrom)));
    if (on) { moreSheet.scrollTop = 0; const first = moreSheet.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  };
  drawTabs();
  topMore.addEventListener('click', () => showMore(moreSheet.hidden, topMore));
  backdrop.addEventListener('click', () => showMore(false));
  moreSheet.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });          // also when it's the page already open
  tabbar.addEventListener('click', ev => { if (ev.target.closest('a')) showMore(false); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !moreSheet.hidden) { const back = moreFrom; showMore(false); if (back) back.focus(); } });
  // the menu says a little more about each page when pointed at
  document.querySelectorAll('.nav a[data-nav]').forEach(a => { const pg = PAGES[a.dataset.nav]; if (pg) a.title = pg[3]; else if (a.dataset.nav === 'home') a.title = 'Today’s plan, your streak and your courses'; });
  window.addEventListener('hashchange', () => showMore(false));
  // the window crossing between phone and computer widths: More fits the new one
  if (window.matchMedia) { const mq = matchMedia('(max-width: 700px)'); const flip = () => { if (!moreSheet.hidden) showMore(false); drawMore(isPhone()); }; if (mq.addEventListener) mq.addEventListener('change', flip); }

  // the logo is Home in one tap from anywhere: it puts away More, the search and any menu on the way, and on Home
  // itself it goes back to the top
  const brandLink = document.querySelector('header.top .brand');
  if (brandLink) brandLink.addEventListener('click', ev => {
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;          // a new tab stays a new tab
    showMore(false);
    if (window.QUICKSEARCH && QUICKSEARCH.isOpen()) QUICKSEARCH.close();
    const kd = document.getElementById('keys-dialog'); if (kd && kd.open) kd.close();
    if ((location.hash.replace(/^#\/?/, '') || '') === '') { ev.preventDefault(); window.scrollTo({ top: 0, behavior: calm() ? 'auto' : 'smooth' }); main.focus({ preventScroll: true }); }
  });
  // the breadcrumbs' buttons: the favorite star, and Copy link on a tool
  main.addEventListener('click', ev => {
    const fav = ev.target.closest('.crumb-fav'), share = ev.target.closest('.crumb-share'), full = ev.target.closest('.crumb-full');
    if (fav) toggleFav(fav);
    if (share) shareLink();
    if (full) toolFull(true);
  });
  /** a link to the tool on screen as it is now: most tools keep what was typed in their address already; for the
      step checker and algebra tiles it's put in here, and the graphing calculator makes its own */
  function shareLink() {
    const own = main.querySelector('#calc-share');
    if (own) { own.click(); return; }
    let url = location.href;
    try {
      const enc = window.DRAW && DRAW.encode, base = location.href.split('#')[0];
      if (enc && /^\/steps(\/|$)/.test(here.path)) { const ls = [...main.querySelectorAll('#steps-box .step-in')].map(x => x.value.trim()).filter(Boolean); if (ls.length) url = base + '#/steps/' + enc(ls.join('\n') + '\n'); }
      if (enc && /^\/tiles(\/compare)?\/?$/.test(here.path)) { const e = main.querySelector('#tl-eq'); if (e && e.value.trim()) url = base + '#/tiles/' + (/compare/.test(here.path) ? 'cmp/' : 'eq/') + enc(e.value.trim()); }
    } catch (e) { /* the plain address */ }
    const kept = url !== location.href || /^\/(shapes|percent|fractions|integers|numbers|data|chance|leap|balance|geometry|measure)\/./.test(here.path);
    const done = () => V.toast(kept ? 'Link copied. It opens this tool just as it is now.' : 'Link copied. It opens this tool.');
    if (shareSheet(url, here.title)) return;          // phones: the share sheet (see phones, below)
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => V.toast('The link couldn’t be copied. Copy it from the address bar.'));
      else V.toast('Copy the link from the address bar.');
    } catch (e) { V.toast('Copy the link from the address bar.'); }
  }

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
  // G then H, P, C or T: Home, Practice, Courses or the tutor (not while typing). It listens first, so the letter
  // after G never also takes a hint or opens the tutor.
  const GO = { h: '#/', p: '#/unlimited', c: '#/courses', t: '#/tutor' };
  let gAt = 0;
  const typingIn = el => !!(el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable || (el.closest && el.closest('[contenteditable], .cx-calc, [role="application"]'))));
  window.addEventListener('keydown', ev => {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat || !ev.key) return;
    if (typingIn(ev.target) || typingIn(document.activeElement) || document.querySelector('dialog[open], .wb-wrap, .crop-wrap')) { gAt = 0; return; }
    const k = ev.key.toLowerCase();
    if (gAt && Date.now() - gAt < 1500 && GO[k]) { ev.preventDefault(); ev.stopPropagation(); gAt = 0; if (location.hash !== GO[k]) location.hash = GO[k]; else window.scrollTo(0, 0); return; }
    gAt = k === 'g' && !ev.shiftKey ? Date.now() : 0;
  }, true);
  /** every keyboard shortcut, in one panel (? opens it) */
  function showKeys() {
    let d = document.getElementById('keys-dialog');
    if (!d) {
      const rows = [['Anywhere', [['/', 'Search'], ['?', 'This list of shortcuts'], ['Esc', 'Close a menu or panel']]],
        ['Go to', [['G then H', 'Home'], ['G then P', 'Practice'], ['G then C', 'Courses'], ['G then T', 'Tutor']]],
        ['Practice', [['Enter', 'Check, then go to the next question'], ['1 to 4', 'Choose an answer'], ['H', 'Take a hint'], ['S', 'Skip for now']]],
        ['Tutor', [['Enter', 'Send'], ['Shift + Enter', 'A new line']]],
        ['Calculators', [['Enter', 'Work it out'], ['Esc', 'Clear the line'], ['Ctrl + Z', 'Undo on the graphing calculator']]]];
      d = document.createElement('dialog');
      d.id = 'keys-dialog'; d.className = 'keys-dialog'; d.setAttribute('aria-labelledby', 'keys-h');
      d.innerHTML = `<div class="row between"><h2 id="keys-h" style="margin:0">Keyboard shortcuts</h2><button type="button" class="iconbtn" id="keys-x" aria-label="Close">✕</button></div>
        <div class="keys-groups">${rows.map(([g, list]) => `<section><h3>${g}</h3><dl>${list.map(([k, w]) => `<dt>${k.split(' then ').map(y => y.split(' + ').map(x => `<kbd>${x}</kbd>`).join(' + ')).join(' then ')}</dt><dd>${w}</dd>`).join('')}</dl></section>`).join('')}</div>`;
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
    swipeOk = ev.touches.length === 1 && t.clientX > EDGE && !ev.target.closest('input, textarea, select, svg, canvas, .viz, .mtable, .cx-page, .calc, [data-noswipe]');          // from the very edge it's Back instead
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

  // phones: a swipe in from the left edge goes back (to the page before, or else up the breadcrumbs), with an arrow
  // that follows the thumb. Safari on an iPhone has its own edge swipe, so this is for the app on the home screen there.
  const EDGE = 22;
  const appleBrowser = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const edgeCue = document.createElement('div');
  edgeCue.className = 'edge-back'; edgeCue.setAttribute('aria-hidden', 'true'); edgeCue.innerHTML = BACK_IC;
  document.body.appendChild(edgeCue);
  let edge = null;
  const cue = dx => { const p = Math.max(0, Math.min(1, dx / 80)); edgeCue.style.transform = `translate(${Math.round(p * 64)}px, -50%)`; edgeCue.style.opacity = String(p); edgeCue.classList.toggle('ready', dx > 70); };
  const goBack = () => {
    if (navI > 1) { history.back(); return; }
    const ups = main.querySelectorAll(':scope > nav.crumbs li a');
    location.hash = ups.length ? ups[ups.length - 1].getAttribute('href') : '#/';
  };
  APP.goBack = goBack;
  document.addEventListener('touchstart', ev => {
    edge = null;
    if (ev.touches.length !== 1 || !isPhone() || (appleBrowser && !standalone)) return;
    const t = ev.touches[0];
    if (t.clientX > EDGE || location.hash.replace(/^#\/?/, '') === '' || document.body.classList.contains('qs-lock') || !moreSheet.hidden || document.querySelector('dialog[open], .wb-wrap, .crop-wrap, .tour')) return;
    if (ev.target.closest && ev.target.closest('canvas, .cx-page, [data-noswipe]')) return;
    edge = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, { passive: true });
  document.addEventListener('touchmove', ev => { if (edge) cue(ev.touches[0].clientX - edge.x); }, { passive: true });
  document.addEventListener('touchend', ev => {
    if (!edge) return;
    const t = ev.changedTouches[0], dx = t.clientX - edge.x, dy = Math.abs(t.clientY - edge.y), quick = Date.now() - edge.t < 900;
    edge = null; cue(0);
    if (dx > 70 && dy < dx * 0.6 && quick) goBack();
  }, { passive: true });
  document.addEventListener('touchcancel', () => { edge = null; cue(0); }, { passive: true });

  // a practice set left halfway (the menu, a link, the logo): leaving is never stopped, and a gentle note on the
  // next page offers to go straight back to the same question. Pause, or Home's Continue, still keep it for later.
  function leftNote() {
    const L = leftSet; leftSet = null;
    const old = document.getElementById('left-note'); if (old) old.remove();
    if (!L || location.hash === L.key) return;
    const esc = V._h.esc, bar = document.createElement('div');
    bar.id = 'left-note'; bar.className = 'left-note'; bar.setAttribute('role', 'status');
    bar.innerHTML = `<span>You left ${L.title ? `“${esc(L.title)}”` : 'your set'} at question ${Math.min(L.i + 1, L.n)} of ${L.n}.</span><button type="button" class="btn sm primary" id="left-back">Back to it</button><button type="button" class="iconbtn sm" id="left-x" aria-label="Close">${CLOSE_IC}</button>`;
    document.body.appendChild(bar);
    const bye = () => { bar.remove(); clearTimeout(timer); };
    const timer = setTimeout(bye, 12000);
    bar.querySelector('#left-x').addEventListener('click', bye);
    bar.querySelector('#left-back').addEventListener('click', () => {
      bye();
      S.setProfile({ paused: Object.assign({}, S.get().profile.paused || {}, { [L.key]: L.packed }) });          // its page then offers it at that question
      window.addEventListener('hashchange', () => setTimeout(() => { const b = document.querySelector('#main #resume'); if (b) b.click(); }, 0), { once: true });
      location.hash = L.key;
    });
    window.addEventListener('hashchange', bye, { once: true });
  }
  window.addEventListener('hashchange', () => setTimeout(leftNote, 0));

  // phones: once the page's heading scrolls under the header, its name shows in the header instead of Procademy
  const topBar = document.querySelector('header.top'), topTitle = document.createElement('span');
  topTitle.className = 'top-title'; topTitle.setAttribute('aria-hidden', 'true');
  if (brandLink) brandLink.after(topTitle);
  let titleQueued = false;
  const placeTitle = () => {
    titleQueued = false;
    if (!topBar) return;
    const h1 = isPhone() && sectionOf(here.path) !== 'home' ? main.querySelector('h1') : null, r = h1 && h1.getBoundingClientRect();
    const show = !!(r && r.height && r.bottom < topBar.getBoundingClientRect().bottom + 4);
    if (show) topTitle.textContent = h1.textContent.replace(/\s+/g, ' ').trim();
    topBar.classList.toggle('show-title', show && !!topTitle.textContent);
  };
  const queueTitle = () => { if (!titleQueued) { titleQueued = true; requestAnimationFrame(placeTitle); } };
  window.addEventListener('scroll', queueTitle, { passive: true });
  window.addEventListener('resize', queueTitle);
  window.addEventListener('hashchange', () => setTimeout(queueTitle, 60));

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
    const path = location.hash.replace(/^#/, '') || '/', m = /^\/(calc|graph|numbers|data|shapes|geometry|measure|ratios|money|typing|percent|leap|balance|fractions|integers|chance|tiles|setup|steps|sprint|words|timer)(\/|$)/.exec(path);
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

  // phones (and tablets): choices from Settings › This device, the share sheet, pull to refresh on Home, pop-ups as
  // bottom sheets that swipe away, a buzz for each answer, number keyboards, the scratch pad with a stylus, an offline
  // marker over the tab bar, and a skill's lesson beside its practice on a wide screen
  const DEVICE_SET = 'procademy.device.v1';
  const devSet = () => { try { const o = JSON.parse(localStorage.getItem(DEVICE_SET) || 'null'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  const coarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  // one-handed mode and data saver, as attributes app.css follows
  const prefsBefore = APP.applyPrefs;
  APP.applyPrefs = function () {
    prefsBefore.apply(this, arguments);
    const d = devSet(), html = document.documentElement;
    if (d.oneHand) html.setAttribute('data-hand', 'one'); else html.removeAttribute('data-hand');
    if (d.dataSaver) html.setAttribute('data-saver', 'on'); else html.removeAttribute('data-saver');
  };
  APP.applyPrefs();
  // data saver: every check of the phone's own Save-Data setting (the tutor's quiet download, warming the picture
  // reader) sees this one too
  try {
    const nc = navigator.connection, own = nc && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(nc), 'saveData');
    if (nc) Object.defineProperty(nc, 'saveData', { configurable: true, get: () => !!devSet().dataSaver || !!(own && own.get && own.get.call(nc)) });
    else Object.defineProperty(navigator, 'connection', { configurable: true, get: () => ({ get saveData() { return !!devSet().dataSaver; } }) });
  } catch (e) { /* the browser's own setting still counts */ }
  /** a link through the phone's share sheet (true), or false to copy it as on a computer */
  function shareSheet(url, title) {
    if (!navigator.share || !coarse()) return false;
    navigator.share({ title: (title ? title + ' · ' : '') + 'Procademy', url }).catch(e => { if (!e || e.name !== 'AbortError') V.toast('The link couldn’t be shared. Copy it from the address bar.'); });
    return true;
  }
  APP.shareSheet = shareSheet;

  // pull to refresh on Home: drawn afresh, with what other devices saved to the account
  const ptr = document.createElement('div');
  ptr.className = 'ptr'; ptr.setAttribute('aria-hidden', 'true'); ptr.innerHTML = ICONS.svg('review', 20);
  document.body.appendChild(ptr);
  const onHome = () => (location.hash.replace(/^#\/?/, '') || '') === '';
  const homeFlag = () => document.documentElement.classList.toggle('on-home', onHome());
  window.addEventListener('hashchange', homeFlag); homeFlag();
  let pulled = null;
  const ptrAt = (d, cls) => { ptr.style.transform = d == null ? '' : `translate(-50%, ${Math.round(d - 48)}px) rotate(${Math.round(d * 3)}deg)`; ptr.style.opacity = d == null ? '' : String(Math.min(1, d / 56)); ptr.className = 'ptr' + (cls ? ' ' + cls : ''); };
  async function refreshHome() {
    ptrAt(72, 'spin');
    try { if (window.ACCOUNT && ACCOUNT.user() && ACCOUNT.pull) await ACCOUNT.pull(true); } catch (e) { /* this device's copy, then */ }
    if (onHome()) render();
    APP.refreshStats();
    setTimeout(() => ptrAt(null), 300);
    V.toast('Home is up to date');
  }
  APP.refreshHome = refreshHome;
  document.addEventListener('touchstart', ev => {
    pulled = null;
    if (ev.touches.length !== 1 || !isPhone() || !onHome() || window.scrollY > 2 || !moreSheet.hidden || document.querySelector('dialog[open], .tour, #learner-menu')) return;
    if (ev.target.closest && ev.target.closest('input, textarea, select, canvas, [data-noswipe], .drag-handle')) return;
    pulled = { x: ev.touches[0].clientX, y: ev.touches[0].clientY, d: 0 };
  }, { passive: true });
  document.addEventListener('touchmove', ev => {
    if (!pulled) return;
    const t = ev.touches[0], dy = t.clientY - pulled.y;
    if (window.scrollY > 2 || dy < 0 || Math.abs(t.clientX - pulled.x) > Math.abs(dy)) { pulled = null; ptrAt(null); return; }
    pulled.d = Math.min(110, dy * 0.5);
    ptrAt(pulled.d, pulled.d >= 64 ? 'ready' : '');
  }, { passive: true });
  document.addEventListener('touchend', () => { const p = pulled; pulled = null; if (p && p.d >= 64) refreshHome(); else if (p) ptrAt(null); }, { passive: true });
  document.addEventListener('touchcancel', () => { pulled = null; ptrAt(null); }, { passive: true });

  // pop-ups are bottom sheets on phones (app.css); a swipe down from the top of one puts it away
  const SHEETS = 'dialog.keys-dialog[open], dialog.zoom-dlg[open], #learner-menu, #wn-pop, .opts-panel:not([hidden])';
  function closeSheet(el) {
    if (el.tagName === 'DIALOG') el.close();
    else if (el.id === 'learner-menu') closeLearnerMenu();
    else if (el.id === 'wn-pop') { const x = el.querySelector('#wn-pop-x'); if (x) x.click(); }
    else { const b = main.querySelector('#opts-btn'); if (b && b.getAttribute('aria-expanded') === 'true') b.click(); else el.hidden = true; }
  }
  let sheet = null;
  document.addEventListener('touchstart', ev => {
    sheet = null;
    const el = isPhone() && ev.touches.length === 1 && ev.target.closest ? ev.target.closest(SHEETS) : null;
    if (!el || el.scrollTop > 0 || ev.target.closest('input, textarea, select, button, a, canvas')) return;
    const t = ev.touches[0];
    if (t.clientY - el.getBoundingClientRect().top > 64) return;          // the grip at the top, so the content still scrolls
    sheet = { el, y: t.clientY, d: 0 };
  }, { passive: true });
  document.addEventListener('touchmove', ev => { if (!sheet) return; sheet.d = Math.max(0, ev.touches[0].clientY - sheet.y); sheet.el.style.transform = `translateY(${Math.round(sheet.d)}px)`; }, { passive: true });
  document.addEventListener('touchend', () => { if (!sheet) return; const { el, d } = sheet; sheet = null; el.style.transform = ''; if (d > 80) closeSheet(el); }, { passive: true });

  // a short buzz for each answer when Vibrate is on in Settings (profile.player.buzz), with or without sound
  let buzzSet = null, buzzKey = '';
  function buzzAnswer() {
    const pl = S.get().profile.player || {}, s = main.__session, v = s && main.querySelector('.feedback.verdict');
    if (s !== buzzSet) { buzzSet = s; buzzKey = ''; }
    if (!v || pl.buzz !== true || !navigator.vibrate) return;
    const r = s.results && s.results[s.i], key = `${s.i}:${r ? r.tries : 0}:${v.classList.contains('good')}`;
    if (key === buzzKey) return;
    buzzKey = key;
    try { navigator.vibrate(v.classList.contains('good') ? 25 : [40, 60, 40]); } catch (e) { /* fine */ }
  }
  // number fields bring up the number keyboard (fields that can hold a negative keep the one with a minus key)
  function numberKeys() {
    main.querySelectorAll('input[type="number"]:not([inputmode])').forEach(el => {
      const min = el.getAttribute('min'), step = el.getAttribute('step');
      if (min != null && Number(min) >= 0) el.inputMode = !step || (step !== 'any' && Number.isInteger(Number(step))) ? 'numeric' : 'decimal';
    });
    main.querySelectorAll('input[pattern]:not([inputmode])').forEach(el => { if (/^(\[0-9\]|\\d)/.test(el.getAttribute('pattern'))) el.inputMode = 'numeric'; });
  }
  let phoneQueued = false;
  const phoneWork = () => { phoneQueued = false; buzzAnswer(); numberKeys(); lessonBeside(); };
  new MutationObserver(() => { if (!phoneQueued) { phoneQueued = true; requestAnimationFrame(phoneWork); } }).observe(main, { childList: true, subtree: true });

  // the scratch pad with a stylus: a pen draws finer or bolder with pressure and its eraser end erases; while a pen
  // is in use, a palm resting on the screen draws nothing
  let penAt = 0, pen = null;
  const padOf = t => (t && t.closest ? t.closest('.scratch canvas') : null);
  const penPoint = (cv, ev) => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height, ev.pressure]; };
  document.addEventListener('pointerdown', ev => {
    const cv = padOf(ev.target);
    if (!cv) return;
    if (ev.pointerType === 'touch' && Date.now() - penAt < 1500) { ev.stopImmediatePropagation(); return; }
    if (ev.pointerType !== 'pen') return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    const wrap = cv.closest('.scratch');
    if (!cv.width && wrap && wrap.__size) wrap.__size();
    try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
    penAt = Date.now();
    pen = { cv, ctx: cv.getContext('2d'), last: penPoint(cv, ev), erase: ev.button === 5 || (ev.buttons & 32) === 32, color: getComputedStyle(wrap || cv).color };
  }, true);
  document.addEventListener('pointermove', ev => {
    if (pen && ev.pointerType === 'touch' && padOf(ev.target)) { ev.stopImmediatePropagation(); return; }
    if (!pen || ev.pointerType !== 'pen') return;
    ev.stopImmediatePropagation();
    const dpr = window.devicePixelRatio || 1, { ctx } = pen;
    (ev.getCoalescedEvents ? ev.getCoalescedEvents() : []).concat(ev).forEach(e => {
      const p = penPoint(pen.cv, e), w = pen.erase ? 18 : 1 + 3.2 * (p[2] > 0 ? p[2] : 0.5);
      ctx.save(); ctx.globalCompositeOperation = pen.erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = pen.color; ctx.lineWidth = w * dpr; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(pen.last[0], pen.last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.restore();
      pen.last = p;
    });
    penAt = Date.now();
  }, true);
  ['pointerup', 'pointercancel'].forEach(t => document.addEventListener(t, ev => { if (pen && ev.pointerType === 'pen') { ev.stopImmediatePropagation(); pen = null; penAt = Date.now(); } }, true));

  // offline: a small marker over the tab bar for as long as the connection is gone
  const offMark = document.createElement('div');
  offMark.className = 'tab-offline'; offMark.setAttribute('aria-hidden', 'true');
  offMark.innerHTML = '<span class="dot"></span>Offline';
  document.body.appendChild(offMark);

  // a wide screen (a tablet held sideways, a computer): a skill's lesson beside its practice, from Lesson beside
  // at the top of practice; the choice is kept on this device
  const wideEnough = () => window.innerWidth >= 900;
  const splitOn = () => !!devSet().lessonBeside;
  let dock = null;
  function lessonSkill() {
    const s = main.__session;
    if (!main.querySelector(':scope > .ex') || !s || !window.ENGINE || ENGINE.isDone(s)) return null;
    try { const it = ENGINE.current(s); return it && ACADEMY.skills[it.skillId] && ACADEMY.skills[it.skillId].learn ? it.skillId : null; } catch (e) { return null; }
  }
  function lessonBeside() {
    const sid = wideEnough() ? lessonSkill() : null, head = main.querySelector(':scope > .ex .ex-head');
    if (sid && head && !head.querySelector('#lesson-beside')) {
      const b = document.createElement('button');
      b.type = 'button'; b.id = 'lesson-beside'; b.className = 'btn sm ghost lesson-beside';
      b.innerHTML = `${ICONS.svg('book', 16)}<span>Lesson beside</span>`;
      head.appendChild(b);
      b.addEventListener('click', () => { const on = !splitOn(); try { localStorage.setItem(DEVICE_SET, JSON.stringify(Object.assign(devSet(), { lessonBeside: on }))); } catch (e) { /* this visit only */ } lessonBeside(); });
    }
    const btn = head && head.querySelector('#lesson-beside');
    if (btn) btn.setAttribute('aria-pressed', String(!!sid && splitOn()));
    const show = !!sid && splitOn();
    document.body.classList.toggle('lesson-split', show);
    if (!show) { if (dock) { dock.remove(); dock = null; } return; }
    if (!dock) { dock = document.createElement('aside'); dock.className = 'lesson-dock'; dock.setAttribute('aria-label', 'The lesson'); document.body.appendChild(dock); }
    if (dock.dataset.sid === sid) return;
    const def = ACADEMY.skills[sid];
    dock.dataset.sid = sid;
    dock.innerHTML = `<div class="ld-head"><b>${def.title}</b><button type="button" class="iconbtn sm" id="ld-close" aria-label="Close the lesson">${CLOSE_IC}</button></div>
      <div class="learn">${def.learn}</div><a class="small" href="#/skill/${encodeURIComponent(sid)}" target="_blank" rel="noopener">Open the whole lesson, with examples</a>`;
    dock.scrollTop = 0;
    dock.querySelector('#ld-close').addEventListener('click', () => { const b = main.querySelector('#lesson-beside'); if (b) b.click(); });
  }
  window.addEventListener('resize', () => { if (!phoneQueued) { phoneQueued = true; requestAnimationFrame(phoneWork); } });
  window.addEventListener('hashchange', () => setTimeout(lessonBeside, 0));
})();
