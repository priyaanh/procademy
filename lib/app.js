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
      const on = (a.dataset.nav === 'home' ? path === '/' : path.startsWith('/' + a.dataset.nav)) || (a.dataset.nav === 'courses' && /^\/(course|unit|skill|practice|test|challenge|mastery)\//.test(path)) || (a.dataset.nav === 'cpm' && /^\/cpm-practice\//.test(path)) || (a.dataset.nav === 'tools' && /^\/(calc|graph|numbers|data|shapes|percent|leap|fractions|integers|chance|tiles|steps|setup|sprint|words|prep)(\/|$)/.test(path));
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
  const MORE = [['cpm', '#/cpm', 'CPM books', 'Your class book, lesson by lesson', 'bookmark'], ['tools', '#/tools', 'Tools', 'Calculators, labs and puzzles', 'calc'], ['progress', '#/progress', 'Progress', 'Your skills, streak and badges', 'trophy'], ['notes', '#/notes', 'My notes', 'What you wrote on each lesson', 'pencil'], ['profile', '#/profile', 'Profile', 'Your account, and who is learning', 'person'], ['settings', '#/settings', 'Settings', 'Theme, text size and more', 'settings'], ['new', '#/new', 'Updates', 'What’s new in Procademy', 'sparkle']];
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
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !moreSheet.hidden) { showMore(false); moreBtn.focus(); } });
  window.addEventListener('hashchange', () => showMore(false));

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
})();
