/* Every screen on the site. Each view is a function (root, ...params) that fills `root`. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, M = window.M;
  const esc = M.esc;

  /* ---------- small helpers ---------- */
  /** HTML as plain text, keeping math readable: fractions as 3/4, powers as x^2 (see COACH.text) */
  const plain = html => { if (window.COACH) return COACH.text(html); const d = document.createElement('div'); d.innerHTML = String(html || '').replace(/<(br|\/p|\/li|\/div|\/tr)\s*\/?>/gi, '$& '); return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const tutorCtx = c => { if (window.TUTORUI) window.TUTORUI.setContext(c); };
  const explainBtn = (label, ask) => `<button class="btn ghost tutor-ask" data-ask="${esc(ask)}">${esc(label)}</button>`;
  /** wire every "explain" button inside el to open the tutor with its question */
  function bindExplain(el) { el.querySelectorAll('.tutor-ask').forEach(b => b.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: b.dataset.ask }))); }
  const possessive = name => name + (/s$/i.test(name) ? '’' : '’s');
  const brand = () => 'Procademy';
  const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 18 ? 'Good afternoon' : 'Good evening'; };
  const lvl = (level, big) => `<span class="lvl lvl-${level}${big ? ' big' : ''}" role="img" aria-label="${A.LEVELS[level]}" title="${A.LEVELS[level]}"></span>`;
  const courseVar = c => `style="--course-h:${c.hue == null ? 215 : c.hue};--course:hsl(${c.hue == null ? 215 : c.hue} 70% 45%);--course-deep:hsl(${c.hue == null ? 215 : c.hue} 65% 27%)"`;
  /** a course's or book's short label in a badge; a series and its number (CC2, INT1, IM3) stack, so every badge is the same size */
  const mono = (icon, cls) => {
    const m = /^([A-Z]{2,})(\d)$/.exec(icon || ''), sm = /\bmono-sm\b/.test(cls);
    return m && !sm ? `<span class="${cls} stack" aria-hidden="true"><span class="mono-top">${esc(m[1])}</span><span class="mono-num">${m[2]}</span></span>` : `<span class="${cls}" aria-hidden="true">${esc(icon || '')}</span>`;
  };
  const icon = (name, size) => (window.ICONS ? ICONS.svg(name, size) : '');
  const courseHref = c => `#/course/${c.id}`;
  const unitHref = (c, u) => `#/unit/${c.id}/${u.id}`;
  const skillHref = sid => `#/skill/${encodeURIComponent(sid)}`;
  const practiceHref = sid => `#/practice/${encodeURIComponent(sid)}`;
  /** links to the hands-on tools for a skill or a CPM lesson: algebra tiles, the probability simulator, the number explorer, data and statistics, shapes, percents and money, and Leap */
  function toolLinks(id, text) {
    const t = String(id || '') + ' ' + String(text || ''), out = [];
    if (/compare-expressions|comparison mat|comparing (two )?expressions|which expression is greater|comparing quantities with variables/i.test(t)) out.push(['#/tiles/compare', 'Compare with algebra tiles']);
    else if (/one-step-equations|two-step-equations|variables-both-sides|equation mat|solving equations on/i.test(t)) out.push(['#/tiles', 'Solve with algebra tiles']);
    if (/probab|simulation/i.test(t)) out.push([/compound|tables|trees|two independent/i.test(t) ? '#/chance/dice' : /coin/i.test(t) ? '#/chance/coin' : '#/chance/spinner', 'Probability simulator']);
    if (/factors-primes|gcf-lcm|\bprimes?\b|factor pairs|greatest common factor|least common multiple|characteristics of numbers/i.test(t) && !/factoring/i.test(t)) out.push([/gcf|lcm|common (factor|multiple)/i.test(t) ? '#/numbers/12-18' : '#/numbers/84', 'Number explorer']);
    if (/mean-median|g6\.spread|histogram|stem-and-leaf|dot plot|box plot|center-and-spread|distribution|absolute deviation|\bMAD\b|quartile/i.test(t) && !/normal|z-score|percentile/i.test(t)) out.push(['#/data', 'Data and statistics']);
    if (/add-negatives|sub-negatives|mul-div-negatives|composing integers|(addition|subtraction|multiplication|division) of integers|(adding|subtracting|multiplying|dividing) (integers|negatives|signed numbers|negative numbers)|multiplication as repeated (addition|subtraction)|multiplying by a negative|zero pairs?/i.test(t)
      && !/exponent|polynomial|algebra tiles|algebraic|like terms|simplifying expressions|equations?\b|coordinate|graph|inequalit|fraction|decimal|scientific|slope/i.test(t)) {
      const n = ['add', 'subtract', 'multipl', 'divi'].filter(w => new RegExp(w, 'i').test(t)).length;
      out.push([/composing|different ways/i.test(t) ? '#/integers/build' : n >= 3 ? '#/integers' : /mul-div|multipl/i.test(t) ? '#/integers/mul' : /divi/i.test(t) ? '#/integers/div' : /subtract|sub-neg/i.test(t) ? '#/integers/sub' : '#/integers/add', 'Integer tiles']);
    }
    const fo = fractionOp(t);
    if (fo) out.push(['#/fractions/' + fo, 'Fraction lab']);
    const sh = shapeKind(t);
    if (sh) out.push(['#/shapes/' + sh, 'Shapes and space']);
    if (/percent|interest|discount|sale price|\btips?\b|sales tax|mark-?ups?/i.test(t) && !/percentile|confidence|margin of error|z-score|normal distribution|circle graph|categorical|association/i.test(t)) {
      const m = /interest/i.test(t) ? 'interest' : /discount|sale price|on sale/i.test(t) ? 'sale' : /\btips?\b|sales tax/i.test(t) ? 'bill' : /mark-?ups?/i.test(t) ? 'markup' : /percent (increase|decrease|change)|percent-change|increase and decrease/i.test(t) ? 'change' : 'of';
      out.push(['#/percent/' + m, 'Percents and money']);
    }
    if (/integer|negative|order-of-operations|order of operations|opposites/i.test(t) && !/exponent|root|polynomial|probabilit|coordinate|graph|coefficient|association|slope|scientific|inequalit|zero|tiles?\b/i.test(t)) out.push(['#/leap', 'Leap puzzle']);
    return out.map(([h, l]) => `<a class="btn ghost" href="${h}">${l}</a>`).join('');
  }
  /** which page of the fraction lab fits a skill or lesson, if any */
  function fractionOp(t) {
    if (!/fraction|mixed number|reciprocal|parts of parts/i.test(t) || /exponent|radical|trig|secant|slope|sector|\barcs?\b|equation|coefficient|busters|expression|dimensional|graph|line plot|negative|integers|probabilit|repeating decimals as fractions/i.test(t) || (/ratio/i.test(t) && !/divi/i.test(t))) return null;
    if (/fraction-to-decimal|fractions into decimals|decimals as fractions|fractions as percents|percents with decimals|representations of a portion|completing the web|convert-fdp|decimal-fractions|as (a )?division/i.test(t)) return 'simplify';
    if (/compar/i.test(t)) return 'compare';
    if (/equivalent fractions|multiplicative identity|simplif(y|ying) fractions|lowest terms/i.test(t)) return 'simplify';
    if (/divi|reciprocal|how many/i.test(t)) return 'div';
    if (/multipl|portions|parts of parts|area|times/i.test(t)) return 'mul';
    if (/subtract/i.test(t) && !/\badd/i.test(t)) return 'sub';
    if (/\badd|sum|combin/i.test(t)) return 'add';
    return null;
  }
  /** which page of the shapes tool fits a skill or lesson, if any */
  function shapeKind(t) {
    if (/radian|unit circle|trig|sine|cosine|circle graph|area model|under the curve|sector|arc length|inscribed|central angle|equation|conic|probabilit|tree diagram|similar|dilation|scale factor|transformation|parallel lines|transversal|polygon|interior|exterior|factor|tiles?\b|expression|function|tangent|completing the square|cent(er|re) and radius|square root|cube root|proofs?\b|congruen|quadrilateral|coordinate|mass|measure lengths/i.test(t)) return null;
    if (/cross[- ]section/i.test(t)) return 'box';
    const solid = [[/cylinder/i, 'cyl'], [/\bcones?\b/i, 'cone'], [/sphere/i, 'sphere'], [/pyramid/i, 'pyramid'], [/triangular prism|non-rectangular prism/i, 'triprism']]
      .map(([re, k]) => [t.search(re), k]).filter(x => x[0] >= 0).sort((a, b) => a[0] - b[0])[0];
    if (solid) return solid[1];
    const hit = [[/volume|surface area|\bprisms?\b|\bnets?\b|\bcubes?\b/i, 'box'], [/triangle inequality|building triangles|constructing shapes|three side lengths|side lengths and triangles|missing parts of triangles/i, 'sides'],
      [/area of (a )?triangles?|triangle area|areas? of triangles/i, 'tri'], [/composite (shape|figure)|area of composite/i, 'arch'], [/circumference|circles?\b|\bpi\b|diameter|radius/i, 'circle'], [/trapezoid/i, 'trap'], [/parallelogram/i, 'para'],
      [/angle pairs|complementary|supplementary|vertical angles|adjacent angles|classifying angles|introduction to angles|measuring angles|angle relationships/i, 'angle'], [/\barea\b|perimeter/i, 'rect']].find(([re]) => re.test(t));
    return hit ? hit[1] : null;
  }
  const plural = (k, one, many) => `${k} ${k === 1 ? one : (many || one + 's')}`;
  const fmt = k => k.toLocaleString('en-US');

  function mbar(skillIds, thin) {
    const m = E.mastery(skillIds);
    const total = skillIds.length || 1;
    const seg = l => m.counts[l] ? `<span class="m${l}" style="width:${m.counts[l] / total * 100}%"></span>` : '';
    return `<div class="mbar${thin ? ' thin' : ''}" role="img" aria-label="${m.points} of ${m.possible} mastery points">${seg(4)}${seg(3)}${seg(2)}${seg(1)}</div>`;
  }
  /** every note the learner has written, newest first, each with its skill */
  function notes(root) {
    tutorCtx(null);
    const all = Object.entries(S.get().notes).filter(([id, n]) => A.skills[id] && n.text).sort((x, y) => y[1].t - x[1].t);
    root.innerHTML = `<h1>My notes</h1><p class="muted">What you wrote on each lesson, in your own words. Add a note at the bottom of any skill page.</p>
      ${all.length ? `<div class="notes-list">${all.map(([id, n]) => { const w = A.whereIs(id); return `<div class="card tight note-item"><div class="row between" style="flex-wrap:wrap;gap:6px"><a href="${skillHref(id)}"><b>${A.skills[id].title}</b></a><span class="tiny muted">${w ? esc(w.course.title) + ' · ' : ''}${ago(n.t)}</span></div><p class="note-text">${esc(n.text)}</p></div>`; }).join('')}</div>`
        : `<div class="card empty"><p>No notes yet. Open any skill and write one under <b>My notes</b>, like a rule to remember or a mistake to watch for.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/courses">Find a skill</a></div></div>`}`;
  }
  /** a course at a glance: a row per unit, a square per skill in the color of its level, the next skill ringed and
      the starting point (from a placement check) flagged; every square opens its skill */
  function skillMap(c) {
    const order = E.courseOrder(c), next = order.find(id => S.skill(id).level < 3), placed = (S.get().profile.placed || {})[c.id], test = testSoon();
    const rows = c.units.map((u, i) => {
      const ids = u.skills.filter(id => A.skills[id]);
      if (!ids.length) return '';
      return `<li class="${placed && placed.start === u.id ? 'start' : ''}"><a class="sm-unit" href="${unitHref(c, u)}"><span class="n">${i + 1}</span><span class="t">${esc(u.title)}</span>${placed && placed.start === u.id ? `<span class="chip up">Start here</span>` : ''}</a>
        <span class="sm-cells">${ids.map(id => { const l = S.skill(id).level, name = plain(A.skills[id].title), onTest = test && test.ids.has(id); return `<a class="sm-cell l${l}${id === next ? ' next' : ''}${onTest ? ' on-test' : ''}" href="${skillHref(id)}" aria-label="${esc(name)}: ${A.LEVELS[l]}${id === next ? ', next to learn' : ''}${onTest ? ', on your coming test' : ''}" title="${esc(name)}: ${A.LEVELS[l]}${onTest ? ' · on your coming test' : ''}"></a>`; }).join('')}</span>
        <a class="btn sm sm-go" href="#/unlimited/unit/${c.id}/${u.id}" aria-label="Practice unit ${i + 1}, ${esc(u.title)}">Practice</a></li>`;
    }).join('');
    return `<div class="card skill-map" ${courseVar(c)}><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Your skill map</h2>${next ? `<a class="btn sm primary" href="${practiceHref(next)}">Next: ${esc(plain(A.skills[next].title))}</a>` : ''}</div>
      <p class="small muted" style="margin:4px 0 10px">Select a unit for its lessons and unit test, or Practice to mix its skills. Each square is a skill, filled to your level; the ringed one is next${test ? ', and dotted ones are on your coming test' : ''}.</p><ol class="sm-units">${rows}</ol>${legend(E.mastery(A.courseSkills(c)).counts)}</div>`;
  }
  function legend(counts) {
    const items = [4, 3, 2, 1, 0].map(l => `<span><i class="dot" style="background:var(--lvl${l})"></i>${A.LEVELS[l]}${counts ? ` <b>${counts[l]}</b>` : ''}</span>`);
    return `<div class="legend">${items.join('')}</div>`;
  }
  function ago(t) {
    const d = Date.now() - t, m = Math.round(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const days = Math.round(h / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return days + ' days ago';
    return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  /** the next skill worth doing after `sid`: later in the unit, then later units; prefers ones below Proficient */
  /** where to go back to for "Too hard? Go back": the first skill it builds on that isn't Proficient yet
      (lib/prereq.js), else the skill before it in its course */
  function prevSkill(sid) {
    const pre = window.PREREQ ? PREREQ.of(sid) : [];
    if (pre.length) return pre.find(id => S.skill(id).level < 3) || pre[0];
    const where = A.whereIs(sid);
    if (!where) return null;
    const all = A.courseSkills(where.course), i = all.indexOf(sid);
    return i > 0 ? all[i - 1] : null;
  }
  function nextSkill(sid) {
    const where = A.whereIs(sid);
    if (!where) return null;
    const all = A.courseSkills(where.course);
    const i = all.indexOf(sid);
    const after = all.slice(i + 1).concat(all.slice(0, i));
    return after.find(x => S.skill(x).level < 3) || after[0] || null;
  }
  function skillRow(sid, opts) {
    opts = opts || {};
    const def = A.skills[sid];
    if (!def) return '';
    const st = S.skill(sid);
    return `<li>${lvl(st.level)}<div class="name"><a href="${skillHref(sid)}">${def.title}</a>${testChip(sid)}${opts.where || opts.time ? `<div class="sub">${[opts.where ? esc(opts.where) : '', opts.time ? `about ${setMinutes(sid)} minutes` : ''].filter(Boolean).join(' · ')}</div>` : ''}</div>
      <div class="actions"><a class="btn sm ghost" href="${skillHref(sid)}">Learn</a><a class="btn sm primary" href="${practiceHref(sid)}">Practice</a></div></li>`;
  }
  /* ---------- courses and skills: grades, time, a coming test, what to know first, the big idea ---------- */
  const gradeLabel = g => (g === 0 ? 'Kindergarten' : `Grade ${g}`);
  /** how a course's grade sits next to the learner's: [label, kind], or null when the grade isn't known */
  function fitFor(c) {
    const p = S.get().profile, g = p.adult ? null : p.grade;
    if (g == null || c.grade == null) return null;
    const d = c.grade - g;
    return d === 0 ? ['Your grade', 'mine'] : d === 1 ? ['A step ahead', 'ahead'] : d >= 2 ? ['Challenge', 'ahead'] : d === -1 ? ['Review', 'review'] : ['Easy review', 'review'];
  }
  /** about how many minutes a practice set takes: younger learners' questions are quicker */
  const setMinutes = sid => { const w = A.whereIs(sid), g = w ? w.course.grade : 6; return Math.max(3, Math.round(E.PRACTICE_N * (g <= 2 ? 30 : g <= 5 ? 45 : g <= 8 ? 60 : 80) / 60)); };
  /** the skills on a coming class test (from Test prep): { ids, label }, or null */
  function testSoon() {
    const pp = S.get().profile.prep;
    if (!pp || !pp.date || pp.date < S.today() || !window.PREP) return null;
    const c = PREP.chapterOf(pp.book, pp.ch);
    if (!c) return null;
    return { ids: new Set(A.cpmSkills(c.ch.lessons)), when: new Date(pp.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), name: `${c.b.short} chapter ${c.ch.n} test` };
  }
  const testChip = sid => { const t = testSoon(); return t && t.ids.has(sid) ? ` <span class="chip test-chip" title="On your ${esc(t.name)}">Test ${esc(t.when)}</span>` : ''; };
  /** skills worth knowing first: the two just before it in its course, and a close one from an earlier grade */
  function beforeThis(sid) {
    const w = A.whereIs(sid);
    if (!w) return [];
    if (window.PREREQ && PREREQ.has(sid)) return PREREQ.of(sid).slice(0, 3);       // what it really builds on
    const order = A.courseSkills(w.course), i = order.indexOf(sid), out = order.slice(Math.max(0, i - 2), i).reverse();
    if (window.TUTORPAGE && w.course.grade > 0) {
      const earlier = TUTORPAGE.related(plain(A.skills[sid].title), w.course.grade - 1).filter(id => A.whereIs(id) && A.whereIs(id).course.grade < w.course.grade && !out.includes(id));
      if (earlier[0]) out.push(earlier[0]);
    }
    return out.slice(0, 3);
  }
  /** the first sentence of a lesson: its big idea in one line */
  function bigIdea(sid) {
    const d = document.createElement('div'); d.innerHTML = (A.skills[sid] && A.skills[sid].learn) || '';
    // as plain text, keeping powers (2⁴) and fractions (3/4) readable
    d.querySelectorAll('sup').forEach(x => { x.textContent = [...x.textContent].map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(ch)] || (ch === '-' || ch === '−' ? '⁻' : ch)).join(''); });
    d.querySelectorAll('.frac').forEach(x => { const n = x.querySelector('.num'), m = x.querySelector('.den'); if (n && m) x.textContent = `${n.textContent}/${m.textContent}`; });
    const p = d.querySelector('p'), t = (p ? p.textContent : d.textContent).replace(/\s+/g, ' ').trim();
    const first = t.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] || '';
    return first.length > 220 ? first.slice(0, 217).replace(/\s+\S*$/, '') + '…' : first;
  }
  /** a row of cards with no half-empty last row: the number of columns is chosen so the cards fill the rows evenly */
  function balance(grid, minW) {
    let ro = null;
    const fit = () => {
      if (!grid.isConnected) { if (ro) ro.disconnect(); return; }
      const n = [...grid.children].filter(x => !x.hidden).length;
      if (!n) return;
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 16, max = Math.max(1, Math.min(n, Math.floor((grid.clientWidth + gap) / (minW + gap))));
      let best = max, empty = Infinity;
      for (let c = max; c >= Math.max(1, Math.ceil(max / 2)); c--) { const e = (c - n % c) % c; if (e < empty) { best = c; empty = e; } }
      grid.style.setProperty('--cols', best);
    };
    fit();
    if (window.ResizeObserver) { ro = new ResizeObserver(fit); ro.observe(grid); }
    return fit;
  }

  /* ---------- saving courses to the home page ---------- */
  const isSaved = id => S.get().profile.enrolled.includes(id);
  /** a Save / Saved toggle; id is a course id, or 'cpm:<book>' for a CPM book */
  const saveBtn = (id, title) => { const on = isSaved(id); return `<button type="button" class="save-btn${on ? ' on' : ''}" data-save="${esc(id)}" aria-pressed="${on}" aria-label="${on ? 'Remove ' + esc(title) + ' from' : 'Save ' + esc(title) + ' to'} your home page">${on ? 'Saved' : 'Save'}</button>`; };
  let saveWired = false;
  function wireSaving() {
    if (saveWired) return; saveWired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-save]');
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      const id = b.dataset.save, on = !isSaved(id);
      S.enroll(id, on);
      document.querySelectorAll(`[data-save="${CSS.escape(id)}"]`).forEach(x => { x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); x.textContent = on ? 'Saved' : 'Save'; });
      toast(on ? 'Saved to your home page' : 'Removed from your home page');
      if (/^#\/?$/.test(location.hash || '#/') || location.hash === '') window.APP && window.APP.render();     // home lists saved courses: redraw it
    });
  }
  /** the ⠿ on a saved course: drag it (or the card) to move the course; arrow keys move it too */
  const dragHandle = title => `<button type="button" class="drag-handle" data-drag aria-label="Move ${esc(title)}: drag, or use the arrow keys" title="Drag to move">⠿</button>`;
  /** My courses can be put in any order: drag a card (on a phone, press and hold it, or drag ⠿), or
      focus ⠿ and use the arrow keys. The others slide out of the way; the order is saved on this device. */
  let reorderOff = null;
  function wireReorder(grid, live) {
    if (reorderOff) { reorderOff(); reorderOff = null; }
    if (!grid) return;
    const cards = () => [...grid.children].filter(c => c.dataset.id);
    const nameOf = c => (c.querySelector('h3') || c).textContent.trim();
    const say = c => { if (live) live.textContent = `${nameOf(c)}: position ${cards().indexOf(c) + 1} of ${cards().length}`; };
    const persist = () => S.reorderEnrolled(cards().map(c => c.dataset.id));
    /** move a card in the page, letting the others glide to their new places (FLIP) */
    function moveTo(card, ref) {
      const others = cards().filter(c => c !== card), before = new Map(others.map(c => [c, [c.offsetLeft, c.offsetTop]]));
      if (ref === card) return;
      grid.insertBefore(card, ref);
      others.forEach(c => {
        const [x, y] = before.get(c), dx = x - c.offsetLeft, dy = y - c.offsetTop;
        if (!dx && !dy) return;
        c.style.transition = 'none'; c.style.transform = `translate(${dx}px, ${dy}px)`;
        void c.offsetWidth;
        c.style.transition = ''; c.style.transform = '';
      });
    }
    let drag = null, press = null;
    const follow = ev => {
      const { card } = drag, g = grid.getBoundingClientRect();
      card.style.transform = `translate(${ev.clientX - drag.gx - (g.left + card.offsetLeft)}px, ${ev.clientY - drag.gy - (g.top + card.offsetTop)}px) scale(1.03)`;
    };
    function start(card, ev) {
      const g = grid.getBoundingClientRect();
      drag = { card, gx: ev.clientX - (g.left + card.offsetLeft), gy: ev.clientY - (g.top + card.offsetTop), moved: false };
      card.classList.add('lifted'); grid.classList.add('sorting'); document.body.classList.add('sorting-cards');
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* fine */ }
      follow(ev);
    }
    function over(ev) {
      if (!drag) return;
      drag.moved = true;
      follow(ev);
      // the card under the pointer takes the dragged one's place: before it when moving back, after it when moving on
      const g = grid.getBoundingClientRect(), px = ev.clientX - g.left, py = ev.clientY - g.top;
      const list = cards(), from = list.indexOf(drag.card);
      const target = list.find(c => c !== drag.card && px >= c.offsetLeft && px <= c.offsetLeft + c.offsetWidth && py >= c.offsetTop && py <= c.offsetTop + c.offsetHeight);
      if (!target) return;
      const to = list.indexOf(target);
      moveTo(drag.card, to < from ? target : target.nextElementSibling);
      follow(ev);
    }
    function end() {
      clearTimeout(press && press.timer); press = null;
      if (!drag) return;
      const { card, moved } = drag; drag = null;
      card.classList.remove('lifted'); grid.classList.remove('sorting'); document.body.classList.remove('sorting-cards');
      card.style.transform = '';
      if (moved) {
        persist(); say(card);
        // the drag ends with a click on the card under it: swallow that one click (only on the cards, and only just after)
        const stop = e => { if (grid.contains(e.target)) { e.preventDefault(); e.stopPropagation(); } window.removeEventListener('click', stop, true); };
        window.addEventListener('click', stop, true);
        setTimeout(() => window.removeEventListener('click', stop, true), 250);
      }
    }
    grid.addEventListener('dragstart', ev => ev.preventDefault());
    grid.addEventListener('pointerdown', ev => {
      const card = ev.target.closest('[data-id]');
      if (!card || ev.button > 0) return;
      const onHandle = !!ev.target.closest('[data-drag]');
      if (!onHandle && ev.target.closest('.save-btn')) return;
      if (onHandle) { ev.preventDefault(); start(card, ev); return; }
      // anywhere else on the card: a mouse drags once it moves; a finger has to press and hold
      press = { card, x: ev.clientX, y: ev.clientY, type: ev.pointerType, timer: ev.pointerType === 'mouse' ? 0 : setTimeout(() => { if (press) start(card, { clientX: press.x, clientY: press.y }); }, 380) };
    });
    const onMove = ev => {
      if (!grid.isConnected) return;
      if (drag) { over(ev); return; }
      if (press && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > 7) {
        if (press.type === 'mouse') { const p = press; press = null; start(p.card, { clientX: p.x, clientY: p.y }); over(ev); }
        else { clearTimeout(press.timer); press = null; }                       // a finger that moves is scrolling
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    reorderOff = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
    // while a card is held, a finger moves it instead of scrolling the page
    grid.addEventListener('touchmove', ev => { if (drag) ev.preventDefault(); }, { passive: false });
    grid.addEventListener('contextmenu', ev => { if (drag || press) ev.preventDefault(); });
    grid.addEventListener('keydown', ev => {
      const h = ev.target.closest('[data-drag]'); if (!h) return;
      const card = h.closest('[data-id]'), list = cards(), i = list.indexOf(card);
      let j = null;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') j = i - 1;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') j = i + 1;
      if (ev.key === 'Home') j = 0;
      if (ev.key === 'End') j = list.length - 1;
      if (j === null) return;
      ev.preventDefault();
      j = Math.max(0, Math.min(list.length - 1, j));
      if (j === i) return;
      moveTo(card, j > i ? list[j].nextElementSibling : list[j]);
      h.focus(); persist(); say(card);
    });
  }
  /** the next skill to work on in a course: the first not yet Proficient */
  const nextInCourse = c => E.courseOrder(c).find(id => S.skill(id).level < 3) || A.courseSkills(c)[0];
  /* a small line drawing for each course (and CPM book), beside its badge: what the course is about at a glance */
  const AXES = '<path d="M8 34H58M12 38V4" opacity=".45"/>';
  const ART = {
    'math-k': '<g fill="currentColor" stroke="none"><circle cx="12" cy="14" r="4"/><circle cx="24" cy="14" r="4"/><circle cx="36" cy="14" r="4"/><circle cx="18" cy="27" r="4"/><circle cx="30" cy="27" r="4"/></g><path d="M46 12v18M41 21h10"/>',
    'math-1': '<path d="M4 32H60"/><path d="M10 29v6M22 29v6M34 29v6M46 29v6M58 29v6" opacity=".6"/><path d="M10 30Q16 14 22 30M22 30Q28 14 34 30M34 30Q40 14 46 30"/>',
    'math-2': '<rect x="8" y="4" width="8" height="32" rx="1.5"/><path d="M8 12h8M8 20h8M8 28h8" opacity=".6"/><rect x="22" y="4" width="8" height="32" rx="1.5"/><path d="M22 12h8M22 20h8M22 28h8" opacity=".6"/><rect x="38" y="28" width="8" height="8" rx="1.5"/><rect x="50" y="28" width="8" height="8" rx="1.5"/>',
    'math-3': '<g fill="currentColor" stroke="none">' + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${14 + c * 12}" cy="${9 + r * 11}" r="3.6"/>`).join('')).join('') + '</g>',
    'math-4': '<rect x="6" y="12" width="52" height="16" rx="3"/><path d="M23.3 12v16M40.6 12v16"/><rect x="6" y="12" width="17.3" height="16" rx="3" fill="currentColor" opacity=".25" stroke="none"/>',
    'math-5': '<path d="M14 16l18-8 18 8-18 8z"/><path d="M14 16v14l18 8V24M50 16v14l-18 8"/>',
    'math-6': '<rect x="6" y="8" width="52" height="10" rx="2"/><path d="M19 8v10M32 8v10M45 8v10" opacity=".6"/><rect x="6" y="24" width="26" height="10" rx="2"/><path d="M19 24v10" opacity=".6"/>',
    'math-7': '<path d="M4 26H60"/><path d="M32 21v10" /><path d="M14 23v6M50 23v6" opacity=".6"/><path d="M32 14Q22 4 14 14M14 14l1-4.5M14 14l4.5 1"/>',
    'math-8': AXES + '<path d="M14 32L54 8"/><path d="M26 25H40V17" opacity=".7"/>',
    'algebra-1': AXES + '<path d="M16 6Q34 62 52 6"/>',
    'geometry': '<path d="M10 34L52 34L22 8Z"/><path d="M44 34A8 8 0 0 0 46.3 28.6" />',
    'algebra-2': AXES + '<path d="M14 32Q36 30 44 20T56 4"/>',
    'precalculus': '<path d="M4 20H60" opacity=".45"/><path d="M4 20Q11 4 18 20T32 20T46 20T60 20"/>',
    'calculus': AXES + '<path d="M14 30Q30 4 56 12"/><path d="M24 34V19Q30 12 38 10V34Z" fill="currentColor" opacity=".22" stroke="none"/>',
    'trigonometry': '<circle cx="24" cy="20" r="15"/><path d="M24 20L35 10" /><path d="M24 20H39" opacity=".6"/><path d="M31 20A7 7 0 0 0 29.6 15.6"/><path d="M46 20h12" opacity=".45"/>',
    'statistics': '<path d="M4 34H60" opacity=".45"/><path d="M6 33Q20 33 26 16Q32 0 38 16Q44 33 58 33"/><path d="M32 6v28" opacity=".45"/>',
    'calculus-bc': '<g transform="translate(32 20)"><ellipse rx="15" ry="5.5"/><ellipse rx="15" ry="5.5" transform="rotate(60)"/><ellipse rx="15" ry="5.5" transform="rotate(120)"/></g>',
    'int-1': AXES + '<path d="M14 30L54 10"/><g fill="currentColor" stroke="none"><circle cx="22" cy="26" r="3"/><circle cx="38" cy="18" r="3"/></g>',
    'int-2': '<path d="M8 34L40 34L40 10Z"/><path d="M34 34V28H40" opacity=".7"/><circle cx="52" cy="22" r="7"/>',
    'int-3': '<path d="M4 20H60" opacity=".45"/><path d="M4 26Q12 6 20 20T36 22T52 8"/>',
  };
  const ART_FOR = { cc1: 'math-6', cc2: 'math-7', cc3: 'math-8', int1: 'int-1', int2: 'int-2', int3: 'int-3' };
  /** the drawing for a course or book id, or '' */
  const courseArt = id => { const k = ART[id] ? id : ART_FOR[id]; return k ? `<svg class="course-art" viewBox="0 0 64 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ART[k]}</svg>` : ''; };
  function courseCard(c, opts) {
    opts = opts || {};
    const ids = A.courseSkills(c), m = E.mastery(ids), nx = opts.continue ? nextInCourse(c) : null;
    return `<div class="card course-card" ${courseVar(c)} data-filter="${esc(A.normText(c.title + ' ' + (c.blurb || '') + ' ' + c.subject))}" data-band="${esc(c.subject)}"${opts.drag ? ` data-id="${esc(c.id)}"` : ''}>
      <div class="row between" style="align-items:flex-start"><span class="course-head">${mono(c.icon, 'icon mono')}${courseArt(c.id)}</span><span class="card-tools">${opts.drag ? dragHandle(c.title) : ''}${saveBtn(c.id, c.title)}</span></div>
      <h3><a class="card-link" href="${courseHref(c)}">${esc(c.title)}</a></h3>
      ${opts.continue ? '' : (() => { const fit = fitFor(c); return `<div class="course-meta"><span class="chip">${gradeLabel(c.grade)}</span>${fit ? `<span class="chip fit-${fit[1]}">${fit[0]}</span>` : ''}</div>`; })()}
      ${opts.continue ? '' : `<p>${esc(c.blurb || '')}</p>`}
      <div class="row between small muted"><span>${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</span><span>${m.pct}% mastered</span></div>
      <div class="pbar"><span style="width:${m.pct}%"></span></div>
      ${nx ? `<a class="btn primary sm continue" href="${practiceHref(nx)}">Continue: ${A.skills[nx].title}</a>` : ''}</div>`;
  }
  function stats() {
    const st = S.streak(), pts = S.get().points;
    return `<span class="stat-pill${st.days ? '' : ' cold'}" title="Practice streak in days">Streak ${st.days}</span><span class="stat-pill" title="Points">${fmt(pts)} pts</span>`;
  }

  /* ---------- home ---------- */
  /** Home's sections, in the order the learner chose, and the ones they hid (profile.homeLayout = { order, hidden, compact }) */
  const HOME_SECS = [['today', 'Today'], ['tiles', 'Daily goal, skills and badges'], ['courses', 'My courses'], ['cpm', 'In class now'], ['recent', 'Pick up where you left off'], ['next', 'Up next']];
  function homeLayout() {
    const l = S.get().profile.homeLayout || {}, keys = HOME_SECS.map(x => x[0]);
    const order = (Array.isArray(l.order) ? l.order : []).filter((k, i, a) => keys.includes(k) && a.indexOf(k) === i);
    keys.forEach((k, i) => { if (!order.includes(k)) order.splice(Math.min(i, order.length), 0, k); });
    return { order, hidden: Array.isArray(l.hidden) ? l.hidden.filter(k => keys.includes(k)) : [], compact: !!l.compact };
  }
  let arrangeOpen = false;
  /** visits on this device, a new one after half an hour away (Home offers the app after the third) */
  const VISITS = (() => { try { const v = JSON.parse(localStorage.getItem('procademy.visits.v1') || '{}') || {}; if (!v.at || Date.now() - v.at > 30 * 60000) v.n = (Number(v.n) || 0) + 1; v.at = Date.now(); localStorage.setItem('procademy.visits.v1', JSON.stringify(v)); return v.n; } catch (e) { return 0; } })();
  const visits = () => { try { return Number((JSON.parse(localStorage.getItem('procademy.visits.v1') || '{}') || {}).n) || VISITS; } catch (e) { return VISITS; } };
  /** the app offer on Home: once, from the third visit, and never again after Not now (Settings always has it) */
  function installOffer() {
    if (!window.INSTALL) return '';
    let put = false; try { put = !!(JSON.parse(localStorage.getItem('procademy.install.v1') || '{}') || {}).later; } catch (e) { put = false; }
    return visits() >= 3 && !put ? INSTALL.slot('home') : '';
  }
  function home(root) {
    busyEnds();
    if (window.BADGES && !isNew()) BADGES.check();          // a badge earned since the last visit counts on the tile below
    const s = S.get(), p = s.profile;
    const name = p.name.trim();
    const st = S.streak();
    const recent = s.recent.filter(id => A.skills[id]).slice(0, 3);
    wireSaving();
    const courses = p.enrolled.map(id => A.courseById(id)).filter(Boolean);
    // skills mastered in the learner's saved courses (every course when none is saved)
    const scope = courses.length ? [].concat(...courses.map(c => A.courseSkills(c))) : Object.keys(A.skills);
    const mastered = scope.filter(id => S.skill(id).level === 4).length;
    // saved courses and books together, in the order the learner put them (a handle to move them once there are two)
    const saved = p.enrolled.filter(id => id.startsWith('cpm:') ? !!(window.CPMVIEWS && A.cpmById(id.slice(4))) : !!A.courseById(id)), drag = saved.length > 1;
    const mine = saved.map(id => id.startsWith('cpm:') ? CPMVIEWS.bookCard(A.cpmById(id.slice(4)), { continue: true, drag }) : courseCard(A.courseById(id), { continue: true, drag }));
    const practised = A.courses.filter(c => !courses.includes(c) && A.courseSkills(c).some(id => S.skill(id).level > 0));
    // up next: the first unfinished skill in each course practiced but not saved (a saved course's card has Continue)
    const upNext = [];
    (courses.length ? [] : practised).forEach(c => {
      const sid = E.courseOrder(c).find(id => S.skill(id).level < 3 && !recent.includes(id));
      if (sid && upNext.length < 3) upNext.push({ sid, c });
    });
    const fresh = isNew(), go = fresh ? null : continueTarget(), next = fresh ? '' : bestNext(), roll = fresh ? 0 : goodRun();
    const earned = window.BADGES ? BADGES.all().filter(b => b.at).sort((a, b) => b.at - a.at) : [], nextBadge = window.BADGES ? BADGES.all().find(b => !b.at) : null;
    const L = homeLayout();
    const sec = {
      today: () => todayCard(),
      tiles: () => `<div class="tiles">
        ${window.BADGES ? BADGES.ring() : ''}
        <a class="tile has-ic" href="#/mastered"><span class="tile-ic ic-star">${icon('star')}</span><div class="big">${mastered}</div><div class="label">of ${scope.length} skills mastered</div></a>
        ${window.BADGES ? `<a class="tile badge-tile has-ic" href="#/progress" data-to-badges${nextBadge ? ` title="Next badge: ${esc(nextBadge.name)}. ${esc(nextBadge.how)}"` : ''}><span class="tile-ic ic-medal">${icon('medal')}</span><div class="big">${earned.length}</div><div class="label">badges earned${earned.length ? `<span class="badge-row" aria-label="Latest: ${esc(earned.slice(0, 4).map(b => b.name).join(', '))}">${earned.slice(0, 4).map(b => `<span class="mini-medal" title="${esc(b.name)}">${icon('medal', 14)}</span>`).join('')}<span class="tile-latest">${esc(earned[0].name)}</span></span>` : ''}${nextBadge ? `<span class="tile-next">Next: ${esc(nextBadge.name)}</span>` : ''}</div></a>` : ''}
      </div>`,
      courses: () => `<div class="section-title"><h2>My courses</h2>${mine.length > 1 ? '<span class="small muted reorder-hint">Drag a course to move it</span>' : ''}<a href="#/courses">Browse courses →</a></div>
        ${newInCourses(courses)}
        ${mine.length ? `<div class="grid fit my-courses${mine.length > 2 ? ' compact' : ''}${mine.length === 1 ? ' one' : ''}" id="my-courses">${mine.join('')}</div><p class="visually-hidden" aria-live="polite" id="my-courses-live"></p>` : emptySaved(practised)}`,
      cpm: () => (window.CPMVIEWS ? CPMVIEWS.homeCard() : ''),
      recent: () => recent.length ? `<div class="section-title"><h2>Pick up where you left off</h2></div>
        <div class="grid">${recent.map(id => { const d = A.skills[id], w = A.whereIs(id), st2 = S.skill(id); return `<div class="card tight"><div class="row">${lvl(st2.level, true)}<div style="flex:1;min-width:0"><div><a href="${skillHref(id)}"><b>${d.title}</b></a></div><div class="small muted">${w ? esc(w.course.title + ' · ' + w.unit.title) : ''}</div></div></div><div class="btn-row"><a class="btn sm primary" href="${practiceHref(id)}">Practice</a><span class="chip lv-${st2.level}">${A.LEVELS[st2.level]}</span></div></div>`; }).join('')}</div>` : '',
      next: () => upNext.length ? `<div class="section-title"><h2>Up next</h2></div>
        <div class="card"><ul class="skills">${upNext.map(x => skillRow(x.sid, { where: x.c.title + ' · ' + A.whereIs(x.sid).unit.title })).join('')}</ul></div>` : '',
    };
    let body = '';
    if (fresh) body = welcomeCard();
    else {
      // the notes that come and go: the week's review follows Today; the rest follow the tiles (or Today, or come first)
      const shown = L.order.filter(k => !L.hidden.includes(k));
      const recap = weekRecap(), more = howNote() + (window.PREP ? PREP.homeCard() : '') + newsCard() + installOffer();
      const atA = shown.includes('today') ? 'today' : null, atB = shown.includes('tiles') ? 'tiles' : atA;
      const notes = h => (h.trim() ? `<div class="home-sec" data-sec="notes">${h}</div>` : '');
      body = (atA || atB ? '' : notes(recap)) + (atB ? '' : notes(more)) + shown.map(k => `<div class="home-sec" data-sec="${k}">${sec[k]()}</div>` + (k === atA ? notes(recap) : '') + (k === atB ? notes((atA ? '' : recap) + more) : '')).join('');
    }
    root.innerHTML = `
      <div class="home-head"><div class="home-hello"><h1>${greeting()}${name ? ', ' + esc(name) : ''}${window.LEARNERS && LEARNERS.count() > 1 ? ' <a class="switch-learner" href="#/profile">Switch learner</a>' : ''}</h1>
        <p class="muted">${roll >= 3 ? `You’re on a roll: ${roll === 3 ? 'three' : roll} good days in a row, each with your daily goal met.` : st.today ? (st.days > 1 ? `You’re on a ${st.days}-day streak. Nice work today.` : 'You practiced today. Nice work.') : st.days ? `Practice today to keep your ${st.days}-day streak going.` : 'Pick a skill to get started.'}${next ? ' ' + next : ''}</p>
        ${fresh ? '' : `<p class="small home-tip">${dayTip()}</p>`}</div>
        ${fresh ? '' : `<div class="home-acts"><button type="button" class="btn home-now" id="home-now" aria-expanded="false" aria-controls="now-pick">${icon('sparkle', 18)} What should I do now?</button>
          ${go ? `<a class="btn primary home-go" id="home-go" href="${go.href}"${go.resume ? ` data-resume="${esc(go.resume)}"` : ''}><span><b>${go.label}</b>${go.sub ? `<small>${esc(go.sub)}</small>` : ''}${go.course ? `<span class="go-course"><span class="go-bar" role="img" aria-label="${esc(go.course.title)}: ${go.pct}% mastered"><span style="width:${go.pct}%"></span></span><small>${esc(go.course.title)} · ${go.pct}% mastered</small></span>` : ''}</span>${icon('send', 18).replace('class="ic"', 'class="ic go-arrow"')}</a>` : ''}</div>`}</div>
      <div class="now-pick" id="now-pick" hidden aria-live="polite"></div>
      ${fresh ? '' : parentStrip()}
      <div class="home-body${L.compact ? ' home-compact' : ''}">${body}</div>
      ${fresh ? '' : `<div class="home-foot"><button type="button" class="btn sm home-all" id="home-all">Show all of Home</button><button type="button" class="btn sm ghost" id="home-arrange" aria-expanded="${arrangeOpen}" aria-controls="arrange">${icon('settings', 16)} Arrange Home</button></div>
        <section class="card arrange" id="arrange" aria-labelledby="arrange-h"${arrangeOpen ? '' : ' hidden'}>${arrangeOpen ? arrangeHtml() : ''}</section>`}
`;
    wireParentStrip(root);
    wireWelcome(root);
    wireWhatIs(root);
    wireToday(root);
    // the goal ring says how long was spent today, and about how long is left
    const gl = root.querySelector('#goal-tile .label'), dd0 = s.days[S.today()] || {}, dq = dd0.q || 0, gg = window.BADGES ? BADGES.goal() : 20, mins = S.minutes(dd0);
    if (gl && dq < gg) gl.textContent = `today’s goal · ${mins ? `${mins} min practiced, ` : ''}about ${Math.max(1, Math.round((gg - dq) / 2))} min left`;
    else if (gl && mins) gl.textContent += ` · ${mins} min`;
    // a day of the week, tapped: what was done that day
    const dd = root.querySelector('#day-detail');
    root.querySelectorAll('.wk-day').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      root.querySelectorAll('.wk-day').forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (open) { dd.hidden = true; return; }
      b.setAttribute('aria-expanded', 'true'); dd.innerHTML = dayDetail(b.dataset.day); dd.hidden = false;
    }));
    const lx = root.querySelector('#levels-x');
    if (lx) lx.addEventListener('click', () => { S.setProfile({ levelsSeen: true }); const n = root.querySelector('#levels-note'); if (n) n.remove(); });
    // a screenshot pasted on Home: questions like it, as on the Practice page
    if (window.UNLIMITED && UNLIMITED.wirePaste) UNLIMITED.wirePaste(root);
    // the first time someone has made their choices: a short tour of the site
    if (!fresh && window.APP && APP.tour && p.tourNext) setTimeout(() => { if (root.isConnected && location.hash.replace(/^#\/?/, '') === '') APP.tour(); }, 400);
    const rx = root.querySelector('#recap-x');
    if (rx) rx.addEventListener('click', () => { S.setProfile({ recapSeen: rx.dataset.week }); const c = root.querySelector('#recap'); if (c) c.remove(); });
    wireReorder(root.querySelector('#my-courses'), root.querySelector('#my-courses-live'));
    if (window.BADGES) BADGES.wireRing(root, () => home(root));
    const nx = root.querySelector('#news-x');
    if (nx) nx.addEventListener('click', () => { S.setProfile({ seenNews: NEWS }); const n = root.querySelector('#news'); if (n) n.remove(); });
    // Continue: a set left halfway opens at the question it was left on
    const hg = root.querySelector('#home-go[data-resume]');
    if (hg) hg.addEventListener('click', () => {
      const lastSet = S.get().profile.lastSet;
      if (lastSet && lastSet.key === hg.dataset.resume && !pausedAll()[lastSet.key]) setPaused(lastSet.key, lastSet.packed);
      window.addEventListener('hashchange', () => setTimeout(() => { const b = document.querySelector('#main #resume'); if (b) b.click(); }, 0), { once: true });
    });
    // the badges tile opens Progress at the badges
    const bt = root.querySelector('[data-to-badges]');
    if (bt) bt.addEventListener('click', () => window.addEventListener('hashchange', () => setTimeout(() => { const b = document.getElementById('badges'); if (b) b.scrollIntoView({ block: 'start' }); }, 30), { once: true }));
    // What should I do now?: the best next thing, with why; Something else steps down the list
    const nb = root.querySelector('#home-now');
    if (nb) {
      let k = 0;
      const pick = root.querySelector('#now-pick');
      const draw = () => {
        const list = nowList(), x = list[k % list.length];
        pick.innerHTML = `<span class="now-ic">${icon(x.icon, 20)}</span><p><b>${x.what}</b> <span class="muted">${x.why}</span></p><div class="btn-row"><a class="btn sm primary" href="${x.href}">${x.go || 'Go'}</a>${list.length > 1 ? '<button type="button" class="btn sm ghost" id="now-else">Something else</button>' : ''}</div>`;
        const el = pick.querySelector('#now-else'); if (el) el.addEventListener('click', () => { k++; draw(); pick.querySelector('#now-else').focus(); });
      };
      nb.addEventListener('click', () => {
        const open = pick.hidden;
        pick.hidden = !open; nb.setAttribute('aria-expanded', String(open));
        if (open) { k = 0; draw(); }
      });
    }
    // Arrange Home: move sections, hide them, and a phone Home of Today alone
    const ab = root.querySelector('#home-arrange');
    if (ab) ab.addEventListener('click', () => { arrangeOpen = !arrangeOpen; home(root); const b = root.querySelector(arrangeOpen ? '#arrange [data-k] button:not(:disabled)' : '#home-arrange'); if (b) b.focus(); if (arrangeOpen) root.querySelector('#arrange').scrollIntoView({ block: 'nearest' }); });
    wireArrange(root);
    const all = root.querySelector('#home-all');
    if (all) all.addEventListener('click', () => { root.querySelector('.home-body').classList.add('show-all'); all.hidden = true; });
    const em = root.querySelector('#save-mine');
    if (em) em.addEventListener('click', () => { S.enroll(em.dataset.course, true); toast('Saved. Today’s practice now comes from it.'); home(root); });
    const eg = root.querySelector('#save-grade');
    if (eg) eg.addEventListener('click', () => { const v = root.querySelector('#pick-grade').value; if (!v) { root.querySelector('#pick-grade').focus(); return; } setGrade(v); toast('Saved. Today’s practice now comes from it.'); home(root); });
    const nc = root.querySelector('#new-in-x');
    if (nc) nc.addEventListener('click', () => { seeCourses(courses); const n = root.querySelector('#new-in'); if (n) n.remove(); });
    bindExplain(root);
  }
  /** the Arrange Home panel: each section with up, down and show; and the phone Home of Today alone */
  function arrangeHtml() {
    const L = homeLayout(), name = k => HOME_SECS.find(x => x[0] === k)[1];
    return `<div class="row between" style="flex-wrap:wrap;gap:8px"><h2 id="arrange-h" style="margin:0">Arrange Home</h2><button type="button" class="btn sm primary" id="arr-done">Done</button></div>
      <p class="small muted" style="margin:4px 0 12px">Move sections up or down, and hide the ones you don’t use. Hidden sections stay here, ready to show again.</p>
      <ol class="arr-list">${L.order.map((k, i) => `<li data-k="${k}" class="${L.hidden.includes(k) ? 'off' : ''}"><span class="arr-name">${name(k)}</span>
        <button type="button" class="btn sm ghost" data-move="-1" aria-label="Move ${name(k)} up"${i === 0 ? ' disabled' : ''}>Up</button><button type="button" class="btn sm ghost" data-move="1" aria-label="Move ${name(k)} down"${i === L.order.length - 1 ? ' disabled' : ''}>Down</button>
        <label class="arr-show"><input type="checkbox" class="switch" data-show ${L.hidden.includes(k) ? '' : 'checked'}${k === 'today' ? ' disabled' : ''}><span>Show</span></label></li>`).join('')}</ol>
      <label class="arr-compact"><input type="checkbox" class="switch" id="arr-compact" ${L.compact ? 'checked' : ''}><span><b>A short Home on a phone</b><span class="small muted">Only Continue and Today, with the rest of Home one tap away</span></span></label>
      <div class="btn-row"><button type="button" class="btn sm ghost" id="arr-reset">Back to the usual order</button></div>`;
  }
  function wireArrange(root) {
    const box = root.querySelector('#arrange');
    if (!box || box.hidden) return;
    const save = (patch, focus) => {
      S.setProfile({ homeLayout: Object.assign(homeLayout(), patch) });
      home(root);
      const el = focus && root.querySelector(focus); if (el && !el.disabled) el.focus(); else { const d = root.querySelector('#arr-done'); if (d) d.focus(); }
    };
    box.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
      const L = homeLayout(), k = b.closest('[data-k]').dataset.k, i = L.order.indexOf(k), j = i + Number(b.dataset.move);
      if (j < 0 || j >= L.order.length) return;
      L.order.splice(i, 1); L.order.splice(j, 0, k);
      save({ order: L.order }, `#arrange [data-k="${k}"] [data-move="${b.dataset.move}"]`);
    }));
    box.querySelectorAll('[data-show]').forEach(c => c.addEventListener('change', () => {
      const L = homeLayout(), k = c.closest('[data-k]').dataset.k;
      save({ hidden: c.checked ? L.hidden.filter(x => x !== k) : L.hidden.concat(k) }, `#arrange [data-k="${k}"] [data-show]`);
    }));
    box.querySelector('#arr-compact').addEventListener('change', ev => save({ compact: ev.target.checked }, '#arr-compact'));
    box.querySelector('#arr-reset').addEventListener('click', () => save({ order: HOME_SECS.map(x => x[0]), hidden: [] }, '#arr-reset'));
    box.querySelector('#arr-done').addEventListener('click', () => { arrangeOpen = false; home(root); const b = root.querySelector('#home-arrange'); if (b) b.focus(); });
  }
  /** no course saved yet: the clearest next step is the course for the learner's grade, saved in one tap */
  function emptySaved(practised) {
    const p = S.get().profile, gc = A.courseById(p.adult ? 'math-6' : p.grade != null ? COURSE_FOR[p.grade] : '');
    return `<div class="card empty-saved"><p><b>No saved courses yet.</b> ${gc ? `Start with <b>${esc(gc.title)}</b>: save it here in one tap, and today’s practice comes from it.` : 'Choose your grade and its course is saved here, so today’s practice comes from it. Or find your class’s CPM book.'}</p>
      <div class="btn-row">${gc ? `<button type="button" class="btn primary" id="save-mine" data-course="${gc.id}">Save ${esc(gc.title)}</button>`
        : `<label class="visually-hidden" for="pick-grade">Your grade</label><select id="pick-grade" class="set-input pick-grade"><option value="">Your grade</option>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">${ordinal(g)}</option>`).join('')}<option value="adult">Adult learner</option></select><button type="button" class="btn primary" id="save-grade">Save my grade’s course</button>`}
        <a class="btn" href="#/courses">Browse courses</a><a class="btn" href="#/courses/cpm">CPM books</a></div>
      ${practised.length ? `<p class="small muted" style="margin:14px 0 6px">You have practiced in:</p><div class="chips">${practised.map(c => `<span class="grade-chip" ${courseVar(c)}>${mono(c.icon, 'mono-sm')}<a href="${courseHref(c)}">${esc(c.title)}</a>${saveBtn(c.id, c.title)}</span>`).join('')}</div>` : ''}</div>`;
  }
  /** skills added to a saved course since the learner last looked (profile.courseSeen: course id → skill ids seen) */
  function newInCourses(courses) {
    const seen = S.get().profile.courseSeen || {}, first = {};
    let note = '';
    courses.forEach(c => {
      const ids = A.courseSkills(c);
      if (!Array.isArray(seen[c.id])) { first[c.id] = ids; return; }          // the first look is just remembered
      const add = ids.filter(id => !seen[c.id].includes(id) && A.skills[id]);
      if (add.length && !note) note = `<div class="new-in small" id="new-in"><span><b>New in ${esc(c.title)}:</b> ${add.slice(0, 3).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${add.length > 3 ? `, and ${add.length - 3} more` : ''}</span><button type="button" class="btn sm ghost" id="new-in-x">Got it</button></div>`;
    });
    if (Object.keys(first).length) S.setProfile({ courseSeen: Object.assign({}, seen, first) });
    return note;
  }
  const seeCourses = courses => S.setProfile({ courseSeen: Object.assign({}, S.get().profile.courseSeen, Object.fromEntries(courses.map(c => [c.id, A.courseSkills(c)]))) });
  /** good days in a row (the daily goal met), ending today, or yesterday while today is still open */
  function goodRun() {
    const st = S.get(), g = window.BADGES ? BADGES.goal() : 20, good = iso => ((st.days[iso] || {}).q || 0) >= g;
    let d = S.today(), n = 0;
    if (!good(d)) d = S.dayShift(d, -1);
    while (good(d) && n < 400) { n++; d = S.dayShift(d, -1); }
    return n;
  }
  /** a short tip under the greeting: one kind on school days, another at the weekend, a different one each day */
  const TIPS_SCHOOL = ['A school day: ten minutes after homework keeps today’s lesson fresh.', 'Stuck on homework? The tutor explains any question step by step.', 'Short and often beats long and rare. One practice set today is plenty.', 'Practice the lesson from class today, while it’s still fresh.', 'A tricky question from school? Type it under Questions like a picture to practice ones like it.'];
  const TIPS_WEEKEND = ['It’s the weekend: a good time for the puzzle of the day or this week’s challenge.', 'Weekend review: a few minutes on your weak skills makes Monday easier.', 'No rush at the weekend. One short practice keeps your streak going.', 'Try something new this weekend: a tool you haven’t opened yet, or a skill a step ahead.'];
  function dayTip() {
    const t = S.today(), wd = new Date(t + 'T12:00').getDay(), list = wd === 0 || wd === 6 ? TIPS_WEEKEND : TIPS_SCHOOL;
    let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }
  /** a busy day: today's goal is halved, and it goes back the next day (profile.busy = { day, goal }) */
  function busyEnds() {
    const b = S.get().profile.busy;
    if (b && b.day !== S.today()) S.setProfile({ goal: b.goal, busy: null });
  }
  /** what to do now, best first, each with why: [{ icon, what, why, href, go }] */
  function nowList() {
    const st = S.get(), p = st.profile, t = S.today(), d = st.days[t] || {}, out = [];
    const work = window.FAMILY ? FAMILY.assignedOf(st).filter(a => !a.done && !a.hidden) : [];
    if (work[0]) out.push({ icon: 'target', what: `Practice “${esc(work[0].title)}”`, why: 'It was set for you, and it’s not done yet.', href: FAMILY.setHash(work[0].ids, work[0].title), go: 'Start' });
    const tp = p.prep && window.PREP && PREP.chapterOf(p.prep.book, p.prep.ch) && p.prep.date >= t ? p.prep : null;
    if (tp && !(tp.done && tp.done[t])) out.push({ icon: 'calendar', what: 'Today’s test prep', why: `Your chapter ${tp.ch} test is ${tp.date === t ? 'today' : 'coming up'}, and a little each day works best.`, href: `#/prep/${tp.book}/${tp.ch}`, go: 'Open the plan' });
    const hw = homework();
    if (hw && hw.lesson) out.push({ icon: 'bookmark', what: `Practice for your homework`, why: `It’s due ${hw.when}. A short set on ${esc(hw.what)} helps first.`, href: hw.lesson, go: 'Practice' });
    if (st.missed.length) out.push({ icon: 'review', what: `Fix ${plural(st.missed.length, 'mistake')}`, why: 'They’re still fresh, and correcting them is the quickest way to improve.', href: '#/review', go: 'Review' });
    const plan = E.dailyPlan();
    if (plan.total && !d.daily) out.push({ icon: 'calendar', what: 'Today’s practice', why: `${plural(plan.total, 'question')}, about ${Math.max(3, Math.round(plan.total * 0.7))} minutes: reviews before they slip, and something new.`, href: '#/daily', go: 'Start' });
    if (p.pod !== t) out.push({ icon: 'target', what: 'The problem of the day', why: 'One question at your level. It takes a minute or two.', href: '#/unlimited/day', go: 'Solve' });
    const wk = myCourse();
    if (wk && !(p.weekly || {})[E.weekOf()]) out.push({ icon: 'trophy', what: 'This week’s challenge', why: 'One harder problem with several steps. It’s new every Monday.', href: '#/weekly', go: 'Try it' });
    const fr = somethingNew();
    if (fr) out.push({ icon: 'sparkle', what: `Learn something new: ${A.skills[fr].title}`, why: 'Read the short lesson, then try a few questions.', href: skillHref(fr), go: 'Learn' });
    out.push({ icon: 'timer', what: 'Five minutes of practice', why: 'A quick mix of what you’ve been learning. Stop whenever you like.', href: '#/unlimited/quick', go: 'Start' });
    out.push({ icon: 'flag', what: 'A puzzle', why: 'Leap and Balance are number puzzles with a new one every day.', href: '#/leap/daily', go: 'Play' });
    return out;
  }

  /* ---------- all courses: browse, filter and save ---------- */
  const COURSE_TABS = [['all', 'All'], ['Elementary', 'Elementary'], ['Middle school', 'Middle school'], ['High school', 'High school'], ['cpm', 'CPM books'], ['saved', 'Saved']];
  function courses(root, tab) {
    wireSaving();
    tab = COURSE_TABS.some(t => t[0] === tab) ? tab : 'all';
    const books = A.cpm || [];
    root.innerHTML = `<h1>Courses</h1>
      <p class="muted">Math for every grade, from Kindergarten to Calculus, plus test prep, competition math, money and coding, and the CPM books chapter by chapter. Select <b>Save</b> on a course to keep it on your home page.</p>
      <div class="course-tools card tight">
        <div class="tabs" role="tablist" aria-label="Show">${COURSE_TABS.map(([id, label]) => `<a role="tab" class="tab${id === tab ? ' on' : ''}" aria-selected="${id === tab}" href="#/courses${id === 'all' ? '' : '/' + encodeURIComponent(id)}">${label}</a>`).join('')}</div>
        <input id="course-find" type="search" placeholder="Find a course: “7th”, “algebra”, “geometry”…" aria-label="Find a course" autocomplete="off">
      </div>
      ${tab === 'all' || tab === 'saved' ? recCard() : ''}
      <div id="course-list">${A.subjects().map(sub => `<section class="band-section" data-band="${esc(sub)}"><div class="section-title"><h2>${esc(sub)}</h2></div><div class="grid balanced">${A.courses.filter(c => c.subject === sub).map(c => courseCard(c)).join('')}</div></section>`).join('')}
        ${books.length && window.CPMVIEWS ? `<section class="band-section" data-band="cpm"><div class="section-title"><h2>CPM books</h2><a href="#/cpm">CPM page →</a></div><div class="grid balanced">${books.map(b => CPMVIEWS.bookCard(b)).join('')}</div></section>` : ''}
      </div>
      <div class="card empty" id="course-none" hidden>No courses match. Try a shorter word, such as “grade” or “algebra”.</div>`;
    const find = root.querySelector('#course-find'), none = root.querySelector('#course-none');
    const fits = [...root.querySelectorAll('.grid.balanced')].map(g => balance(g, 250));
    const apply = () => {
      const words = A.normText(find.value).split(' ').filter(Boolean);
      let shown = 0;
      root.querySelectorAll('.band-section').forEach(sec => {
        let inSec = 0;
        sec.querySelectorAll('.course-card').forEach(card => {
          const saveId = (card.querySelector('[data-save]') || {}).dataset ? card.querySelector('[data-save]').dataset.save : '';
          const bandOk = tab === 'all' || (tab === 'saved' ? isSaved(saveId) : (tab === 'cpm' ? sec.dataset.band === 'cpm' : sec.dataset.band === tab));
          const ok = bandOk && words.every(w => (card.dataset.filter || '').includes(w));
          card.hidden = !ok; if (ok) inSec++;
        });
        sec.hidden = inSec === 0; shown += inSec;
      });
      none.hidden = shown > 0;
      fits.forEach(f => f());
      if (!shown && tab === 'saved' && !words.length) none.innerHTML = 'You haven’t saved any courses yet. Select <b>Save</b> on a course to show it here and on your home page.';
    };
    find.addEventListener('input', apply);
    root.addEventListener('click', ev => { if (tab === 'saved' && ev.target.closest('[data-save]')) setTimeout(apply, 0); });
    apply();
  }

  /** the course to suggest first on Courses: a saved course, else the one for the learner's grade */
  function recCard() {
    const p = S.get().profile, saved = p.enrolled.map(id => A.courseById(id)).filter(Boolean)[0];
    const c = saved || (p.grade != null && !p.adult ? A.courseById(COURSE_FOR[p.grade]) : p.adult ? A.courseById('math-6') : null);
    if (!c) return `<div class="card rec-course none"><div class="rec-text"><h2>Not sure where to start?</h2><p class="small muted">Choose your grade, and Procademy recommends a course.</p></div><a class="btn primary" href="#/settings">Choose my grade</a></div>`;
    const nx = nextInCourse(c), m = E.mastery(A.courseSkills(c));
    return `<div class="card rec-course" id="rec-course"><div class="rec-text"><span class="small muted rec-why">Recommended for you · ${saved ? 'your saved course' : p.adult ? 'a good place to start' : `for ${ordinal(p.grade)}`}</span>
        <h2><a href="${courseHref(c)}">${esc(c.title)}</a></h2><p class="small muted">${m.pct}% mastered${nx ? ` · next: ${esc(plain(A.skills[nx].title))}` : ''}</p></div>
      <div class="btn-row">${nx ? `<a class="btn primary" href="${practiceHref(nx)}">Continue</a>` : ''}<a class="btn" href="${courseHref(c)}">Open course</a></div></div>`;
  }

  /* ---------- a course ---------- */
  function course(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const ids = A.courseSkills(c), m = E.mastery(ids);
    wireSaving();
    const pool = E.masteryPool(c);
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <span>${esc(c.title)}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row between">
          <div class="row">${mono(c.icon, 'icon-big mono')}<div><h1 style="margin:0">${esc(c.title)}</h1><div class="muted">${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</div></div></div>
          ${saveBtn(c.id, c.title).replace('class="save-btn', 'id="enroll" class="save-btn big')}
        </div>
        <p style="margin-top:12px">${esc(c.blurb || '')}</p>
        <div class="row between"><b>Course mastery: ${m.pct}%</b><span class="muted small">${fmt(m.points)} of ${fmt(m.possible)} mastery points</span></div>
        ${mbar(ids)}
        ${window.PLACEMENT ? PLACEMENT.courseCard(c) : ''}
      </div>
      ${skillMap(c)}
      <div class="grid fit" style="margin-top:16px">
        <div class="card tight"><h3>Course challenge</h3><p class="muted small">${Math.min(E.CHALLENGE_N, ids.length)} questions drawn from every unit. Correct answers raise skill levels; incorrect answers lower them.</p><a class="btn primary sm" href="#/challenge/${c.id}">Start course challenge</a></div>
        <div class="card tight"><h3>Mastery challenge</h3><p class="muted small">${pool.length ? `${E.MASTERY_N} questions on the ${plural(pool.length, 'skill')} you are Familiar or Proficient in, to raise them further.` : 'Practice a few skills to Familiar or Proficient first; this challenge can then raise them to Mastered.'}</p>${pool.length ? `<a class="btn primary sm" href="#/mastery/${c.id}">Start mastery challenge</a>` : `<button class="btn sm" disabled>Not available yet</button>`}</div>
      </div>`;
  }

  /* ---------- a unit ---------- */
  function unit(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const i = c.units.indexOf(u), m = E.mastery(u.skills);
    const prev = c.units[i - 1], next = c.units[i + 1];
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <a href="${courseHref(c)}">${esc(c.title)}</a> › <span>Unit ${i + 1}</span></div>
      <div class="two-col">
        <aside class="sidebar card tight"><ul class="unit-nav">${c.units.map((uu, k) => `<li><a href="${unitHref(c, uu)}" class="${uu === u ? 'active' : ''}"><span class="n">${k + 1}</span><span>${esc(uu.title)}</span><span class="pbar"><span style="width:${E.mastery(uu.skills).pct}%"></span></span></a></li>`).join('')}</ul></aside>
        <div>
          <div class="hero" ${courseVar(c)}>
            <div class="num muted small" style="font-weight:600;text-transform:uppercase;letter-spacing:.04em">Unit ${i + 1} · ${esc(c.title)}</div>
            <h1>${esc(u.title)}</h1>
            ${u.blurb ? `<p>${esc(u.blurb)}</p>` : ''}
            <div class="row between"><b>Unit mastery: ${m.pct}%</b><span class="muted small">${m.points} of ${m.possible} mastery points</span></div>
            ${mbar(u.skills)}
            <div style="margin-top:10px">${legend(m.counts)}</div>
          </div>
          <div class="card" style="margin-top:16px">
            <ul class="skills">${u.skills.map(sid => skillRow(sid, { time: true })).join('')}
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unlimited practice<div class="sub">All skills in this unit, mixed, for as long as you wish.</div></div><div class="actions"><a class="btn sm" href="#/unlimited/unit/${c.id}/${u.id}">Start</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unit test<div class="sub">One question per skill you’re still learning, with a second chance on a miss.</div></div><div class="actions"><a class="btn sm primary" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Timed quiz<div class="sub">${E.QUIZ_N} questions from this unit in ${E.QUIZ_MIN} minutes, no hints. Questions you don’t reach aren’t mistakes.</div></div><div class="actions"><a class="btn sm" href="#/quiz/${c.id}/${u.id}">Start the quiz</a></div></li>
              <li class="test boss-row"><span class="test-mark" aria-hidden="true"></span><div class="name">Boss level${(S.get().profile.bosses || {})[c.id + '/' + u.id] ? ' <span class="chip up">Beaten</span>' : ''}<div class="sub">The unit’s ${E.BOSS_N} hardest questions, no hints, and ${E.BOSS_LIVES} misses end it. Beat it for the Boss badge.</div></div><div class="actions"><a class="btn sm" href="#/boss/${c.id}/${u.id}">Face the boss</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Printable worksheet<div class="sub">Questions from every skill in this unit, with an answer key.</div></div><div class="actions"><a class="btn sm" href="#/worksheet/unit/${c.id}/${u.id}">Create a worksheet</a></div></li>
            </ul>
          </div>
          <div class="row between" style="margin-top:16px">${prev ? `<a class="btn sm" href="${unitHref(c, prev)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn sm" href="${unitHref(c, next)}">${esc(next.title)} →</a>` : ''}</div>
        </div>
      </div>`;
  }

  /* ---------- a skill: learn, then practise ---------- */
  function skill(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    const st = S.skill(sid), c = where.course, u = where.unit;
    const idx = u.skills.indexOf(sid);
    const nxt = nextSkill(sid);
    root.innerHTML = `
      <div class="crumbs"><a href="${courseHref(c)}">${esc(c.title)}</a> › <a href="${unitHref(c, u)}">${esc(u.title)}</a> › <span>Skill ${idx + 1} of ${u.skills.length}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row">${lvl(st.level, true)}<div style="flex:1;min-width:0"><h1 style="margin:0">${def.title}</h1><div class="muted small">${A.LEVELS[st.level]}${st.tries ? ` · ${plural(st.tries, 'question')} answered, ${Math.round(st.right / st.tries * 100)}% right` : st.level ? '' : ' · not practiced yet'} · a practice set takes about ${setMinutes(sid)} minutes${testChip(sid)}</div></div></div>
        ${bigIdea(sid) ? `<p class="big-idea"><b>The big idea:</b> ${esc(bigIdea(sid))}</p>` : ''}
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice · ${E.PRACTICE_N} questions</a><a class="btn" href="#/unlimited/skill/${encodeURIComponent(sid)}">Unlimited practice</a>${nxt ? `<a class="btn ghost" href="${skillHref(nxt)}">Next skill: ${A.skills[nxt].title} →</a>` : ''}</div>
        <p class="skill-pace small">Too easy? <button class="link-btn" type="button" id="testout">Test out with ${E.TESTOUT_N} questions</button> <span aria-hidden="true">·</span> Against the clock? <a href="#/speed/${encodeURIComponent(sid)}">Beat your best</a>${(() => { const b = (S.get().profile.best || {})[sid]; return b ? ` <span class="muted">(best ${clockText(b.ms)}, ${b.right} of ${b.total} right)</span>` : ''; })()}${prevSkill(sid) ? ` <span aria-hidden="true">·</span> Too hard? <a href="${skillHref(prevSkill(sid))}">Go back to ${A.skills[prevSkill(sid)].title}</a>` : ''}</p>
        <details class="more-ways"><summary>More ways to practice</summary>
          <div class="btn-row">${explainBtn('Ask the tutor to explain', `Explain “${plain(def.title)}” to me step by step, with an example.`)}<a class="btn ghost" href="#/worksheet/skill/${encodeURIComponent(sid)}">Printable worksheet</a><button class="btn ghost" type="button" id="print-summary">Print a one-page summary</button>${toolLinks(sid, plain(def.title))}</div></details>
        ${(() => { const pre = beforeThis(sid); return pre.length ? `<div class="before-this"><span class="small muted">Good to know first:</span>${pre.map(id => `<a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div>` : ''; })()}
      </div>
      <div class="card learn" style="margin-top:16px"><h2>Learn</h2><div class="learn-body">${def.learn || '<p class="muted">There are no notes for this skill yet. Each practice question includes step-by-step hints.</p>'}</div>
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice</a>${explainBtn('Ask for another explanation', `I read the lesson on “${plain(def.title)}”. Can you explain it a different way, with a new example?`)}</div></div>
      <div class="card samples" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Three questions like the practice</h2><a class="btn sm" href="${practiceHref(sid)}">Practice</a></div>
        <p class="muted small" style="margin:4px 0 10px">A look before you start. Try each one in your head, then check.</p>
        <ol class="sample-list">${[1, 2, 3].map(k => { const q = A.question(sid, `peek-${S.today()}-${k}`), ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q); return `<li><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}<details class="sample-ans"><summary>Show the answer</summary><p>${ans}</p></details></li>`; }).join('')}</ol></div>
      <div class="card worked" id="worked" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Worked example</h2><button class="btn sm ghost" id="we-new" type="button">Another example</button></div>
        <p class="muted small" style="margin:4px 0 10px">A new example each time, solved one step at a time. Try each step yourself before revealing it.</p><div id="we-body"></div></div>
      <div class="card my-notes" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0"><label for="note">My notes</label></h2><a class="small" href="#/notes">All my notes</a></div>
        <p class="muted small" style="margin:4px 0 8px">Write it in your own words: a rule, a reminder, or a mistake to watch for. Notes are saved as you type.</p>
        <textarea id="note" rows="4" maxlength="4000" placeholder="For example: when both numbers are negative, the answer is positive.">${esc(S.note(sid))}</textarea><div class="tiny muted" id="note-saved" aria-live="polite"></div></div>`;
    tutorCtx({ course: c.title, skill: plain(def.title), notes: plain(def.learn) });
    const noteEl = root.querySelector('#note'); let noteT = null;
    noteEl.addEventListener('input', () => { clearTimeout(noteT); noteT = setTimeout(() => { S.setNote(sid, noteEl.value); root.querySelector('#note-saved').textContent = noteEl.value.trim() ? 'Saved' : 'Note removed'; }, 400); });
    if (window.VOCAB) VOCAB.linkify(root.querySelector('.learn'));
    workedExample(root.querySelector('#worked'), sid);
    bindExplain(root);
    // too easy: five questions with no hints, all right for Proficient (no address of its own; Back returns here)
    root.querySelector('#testout').addEventListener('click', () => {
      const go = () => exercise(root, E.start('testout', { skillId: sid }), { back: skillHref(sid), backLabel: plain(def.title), again: go, againLabel: 'Try the test-out again' });
      go(); window.scrollTo(0, 0);
    });
    const sum = root.querySelector('#print-summary');
    if (sum) sum.addEventListener('click', () => printSummary(root, sid));
    stepLesson(root.querySelector('.learn-body'), sid);
    keepPlace(root, sid);
  }

  /* ---------- reading a lesson: in steps when it is long, and back where you left off ---------- */
  const READ = 'procademy.read.v1';
  const readAll = () => { try { const o = JSON.parse(localStorage.getItem(READ) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  function readNote(sid, patch) {
    const o = readAll();
    o[sid] = Object.assign({}, o[sid], patch, { t: Date.now() });
    const keep = Object.entries(o).filter(([k]) => k !== '_all').sort((a, b) => b[1].t - a[1].t).slice(0, 40);
    try { localStorage.setItem(READ, JSON.stringify(Object.assign(Object.fromEntries(keep), o._all ? { _all: o._all } : {}))); } catch (e) { /* a private window: nothing is kept */ }
  }
  /** a long lesson, a step at a time: blocks grouped so each step has some substance, with Back, Next and Show all */
  function stepLesson(body, sid) {
    if (!body) return;
    const blocks = [...body.children], total = body.textContent.length;
    if (blocks.length < 3 || total < 650 || readAll()._all) return;
    const steps = [];
    blocks.forEach(b => { const last = steps[steps.length - 1]; if (!last || last.len >= 220) steps.push({ els: [b], len: b.textContent.length }); else { last.els.push(b); last.len += b.textContent.length; } });
    if (steps.length < 2) return;
    steps.forEach((st, k) => { const w = document.createElement('div'); w.className = 'learn-step'; w.dataset.step = k; st.els[0].before(w); st.els.forEach(e => w.appendChild(e)); });
    const nav = document.createElement('div'); nav.className = 'learn-nav';
    body.after(nav);
    let at = Math.min(steps.length - 1, Math.max(0, (readAll()[sid] || {}).step || 0));
    const show = () => {
      body.querySelectorAll('.learn-step').forEach((w, k) => { w.hidden = k !== at; });
      nav.innerHTML = `<span class="small muted">Step ${at + 1} of ${steps.length}</span><span class="learn-nav-btns">${at ? '<button class="btn sm ghost" type="button" data-step-go="-1">Back</button>' : ''}${at < steps.length - 1 ? '<button class="btn sm primary" type="button" data-step-go="1">Next</button>' : ''}<button class="btn sm ghost" type="button" data-step-all>Show it all</button></span>`;
      body.__step = at;
    };
    nav.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-step-all')) { body.querySelectorAll('.learn-step').forEach(w => { w.hidden = false; }); nav.remove(); const o = readAll(); o._all = 1; try { localStorage.setItem(READ, JSON.stringify(o)); } catch (e) { /* a private window */ } return; }
      at = Math.max(0, Math.min(steps.length - 1, at + Number(b.dataset.stepGo))); readNote(sid, { step: at }); show();
      body.closest('.learn').scrollIntoView({ block: 'nearest' });
    });
    show();
  }
  /** back where you left off: the place on the page is kept as you scroll, and brought back next time */
  function keepPlace(root, sid) {
    const was = readAll()[sid], here = location.hash;
    if (was && was.y > 300 && Date.now() - was.t < 14 * 864e5) setTimeout(() => { if (location.hash === here) window.scrollTo(0, Math.min(was.y, document.documentElement.scrollHeight)); }, 60);
    let t = 0;
    const onScroll = () => { if (location.hash !== here || !root.isConnected) { window.removeEventListener('scroll', onScroll); return; } clearTimeout(t); t = setTimeout(() => readNote(sid, { y: Math.round(window.scrollY) }), 300); };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  /** a one-page summary of a skill to print: the big idea, the lesson, a worked example with every step, and the learner's note */
  function printSummary(root, sid) {
    const def = A.skills[sid], w = A.whereIs(sid), q = A.question(sid, 'sum-' + Math.random().toString(36).slice(2, 8));
    const ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q), note = S.note(sid).trim(), pre = beforeThis(sid);
    document.querySelectorAll('#skill-print').forEach(x => x.remove());
    const sheet = document.createElement('article');
    sheet.id = 'skill-print'; sheet.className = 'ws-sheet skill-print';
    sheet.innerHTML = `<header class="ws-head"><div><div class="ws-brand">Procademy · ${esc(w.course.title)} · ${esc(w.unit.title)}</div><h1>${def.title}</h1></div></header>
      ${bigIdea(sid) ? `<p class="big-idea"><b>The big idea:</b> ${esc(bigIdea(sid))}</p>` : ''}
      <h2>The lesson</h2><div class="learn">${def.learn || ''}</div>
      <h2>A worked example</h2><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}
      <ol class="we-steps">${q.hints.map(h => `<li>${h}</li>`).join('')}</ol><p><b>Answer:</b> ${ans}</p>
      ${pre.length ? `<p class="small"><b>Good to know first:</b> ${pre.map(id => A.skills[id].title).join(', ')}</p>` : ''}
      <h2>My notes</h2>${note ? `<p class="note-text">${esc(note)}</p>` : '<div class="ws-lines"><span></span><span></span><span></span></div>'}`;
    document.getElementById('main').appendChild(sheet);
    document.body.classList.add('print-skill');
    const done = () => { document.body.classList.remove('print-skill'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    root.__summary = sheet;
    window.print();
    setTimeout(() => { if (!window.matchMedia || !matchMedia('print').matches) done(); }, 1000);
  }

  /** a worked example: a fresh question from the skill's own maker, its steps shown one at a time */
  function workedExample(box, sid) {
    if (!box) return;
    let q, shown;
    const fresh = () => { stopPlay(); q = A.question(sid, 'we-' + Math.random().toString(36).slice(2, 9)); shown = 0; draw(); };
    let playing = 0;
    function stopPlay() { clearInterval(playing); playing = 0; }
    /** play it: each step appears on its own, a couple of seconds apart, until the answer */
    function startPlay() {
      if (shown >= q.hints.length) shown = 0;
      playing = setInterval(() => { if (!box.isConnected || shown >= q.hints.length) { stopPlay(); if (box.isConnected) draw(); return; } shown++; draw(true); }, 2400);
      shown++; draw(true);
    }
    function draw(fresh) {
      const n = q.hints.length, done = shown >= n;
      const answer = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q);
      box.querySelector('#we-body').innerHTML = `<div class="we-q">${window.COACH ? `<div class="q-tools">${COACH.speakBtn(q.prompt + q.hints.slice(0, shown).map(h => '<p>' + h + '</p>').join(''), 'Read it aloud')}</div>` : ''}<div class="question">${q.prompt}</div>
        ${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map((c, k) => `<li class="${done && k === q.answerIndex ? 'is-right' : ''}">${c}</li>`).join('')}</ol>` : ''}</div>
        <ol class="we-steps">${q.hints.slice(0, shown).map((h, k) => `<li class="hint"><div class="hn">${k === n - 1 ? 'Last step' : 'Step ' + (k + 1)}</div>${h}</li>`).join('')}</ol>
        ${done ? `<div class="feedback good${fresh ? ' we-in' : ''}"><span>Answer: <b>${answer}</b></span></div><div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice this skill</a><button class="btn ghost" id="we-play" type="button">Play it again</button></div>`
          : `<div class="btn-row"><button class="btn primary" id="we-next" type="button">${shown === 0 ? 'Show the first step' : shown === n - 1 ? 'Show the last step' : 'Show the next step'} <span class="muted small">(${shown + 1} of ${n})</span></button>${shown < n - 1 ? '<button class="btn ghost" id="we-all" type="button">Show all steps</button>' : ''}<button class="btn ghost" id="we-play" type="button" aria-pressed="${!!playing}">${playing ? 'Pause' : shown ? 'Play the rest' : 'Play it'}</button></div>`}`;
      const nx = box.querySelector('#we-next'), all = box.querySelector('#we-all');
      if (nx) nx.addEventListener('click', () => { stopPlay(); shown++; draw(true); const st = box.querySelectorAll('.we-steps li'); if (st.length) st[st.length - 1].scrollIntoView({ block: 'nearest' }); });
      if (all) all.addEventListener('click', () => { stopPlay(); shown = n; draw(); });
      const play = box.querySelector('#we-play');
      if (play) play.addEventListener('click', () => { if (playing) { stopPlay(); draw(); } else startPlay(); });
      if (fresh && shown) { const st = box.querySelectorAll('.we-steps li'); if (st.length) st[st.length - 1].classList.add('we-in'); }
      if (window.VOCAB) VOCAB.linkify(box.querySelector('.we-steps'));
      box.__worked = { q, shown };
    }
    box.querySelector('#we-new').addEventListener('click', fresh);
    fresh();
  }

  /* ---------- the exercise player ---------- */
  // the learner's own player choices, kept in the profile: sound (off unless turned on) and the on-screen keypad
  const playerPref = () => S.get().profile.player || {};
  const setPlayerPref = patch => S.setProfile({ player: Object.assign({}, playerPref(), patch) });
  let audio = null;
  /** a short rising chime for a right answer and a soft low note otherwise, with a buzz on phones; only with sound on */
  function chime(good) {
    if (!playerPref().sound || (S.quietNow && S.quietNow()) || document.hidden) return;          // off, quiet hours, or the page is out of sight
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime;
      (good ? [660, 880] : [220]).forEach((f, k) => {
        const o = audio.createOscillator(), g = audio.createGain(), at = t0 + k * 0.11;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(audio.destination);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.16, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
        o.start(at); o.stop(at + 0.3);
      });
    } catch (e) { /* no sound on this device */ }
    try { if (navigator.vibrate) navigator.vibrate(good ? 25 : [40, 60, 40]); } catch (e) { /* fine */ }
  }
  // sets paused to finish later, by the address they were started from (the newest 6, for 3 days; today's practice for the day)
  const pausedAll = () => S.get().profile.paused || {};
  function setPaused(key, packed) {
    const all = Object.assign({}, pausedAll());
    if (packed) all[key] = packed; else delete all[key];
    S.setProfile({ paused: Object.fromEntries(Object.keys(all).sort((a, b) => all[b].t - all[a].t).slice(0, 6).map(k => [k, all[k]])) });
  }
  const stillGood = p => p && Date.now() - p.t < 3 * 864e5 && (p.kind !== 'daily' || S.today(new Date(p.t)) === S.today());
  /** 83 seconds as 1:23 */
  const clockText = ms => { const t = Math.max(0, Math.round((ms || 0) / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  /** a short burst of falling pieces over a card: a skill mastered, a boss beaten, a new best (none with less motion) */
  function celebrate(card, size) {
    if (!card || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.motion === 'reduce') return;
    const box = document.createElement('div'), n = size === 'big' ? 44 : 22;
    box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < n; k++) {
      const i = document.createElement('i');
      i.style.cssText = `--x:${Math.round(Math.random() * 100)}%;--d:${(Math.random() * 0.5).toFixed(2)}s;--r:${Math.round(Math.random() * 360)}deg;--dx:${Math.round(Math.random() * 120 - 60)}px;--c:${k % 4}`;
      box.appendChild(i);
    }
    card.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }
  /** a question's picture, large, in a dialog over the page */
  function zoomFigure(fig) {
    const d = document.createElement('dialog');
    d.className = 'zoom-dlg';
    d.setAttribute('aria-label', fig.getAttribute('aria-label') || 'The picture, larger');
    d.innerHTML = '<div class="zoom-body"></div><div class="btn-row" style="justify-content:center"><button class="btn primary" type="button">Close</button></div>';
    const c = fig.cloneNode(true);
    c.removeAttribute('style'); c.removeAttribute('width'); c.removeAttribute('height');
    d.querySelector('.zoom-body').appendChild(c);
    document.body.appendChild(d);
    d.querySelector('button').addEventListener('click', () => d.close());
    d.addEventListener('click', ev => { if (ev.target === d) d.close(); });
    d.addEventListener('close', () => d.remove());
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  /** a scratch pad to draw or write working on, kept for the question it belongs to */
  function scratchPad() {
    const wrap = document.createElement('div');
    wrap.className = 'scratch';
    wrap.innerHTML = '<div class="scratch-bar"><span class="small muted">Draw or write your working here</span><button type="button" class="btn sm ghost" data-sc="clear">Clear</button></div><canvas aria-label="Scratch pad for working"></canvas>';
    const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
    let last = null;
    const size = () => { const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; if (r.width && !cv.width) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); } };
    const at = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; };
    cv.addEventListener('pointerdown', ev => { size(); cv.setPointerCapture(ev.pointerId); last = at(ev); ctx.beginPath(); ctx.arc(last[0], last[1], 1.4 * (window.devicePixelRatio || 1), 0, Math.PI * 2); ctx.fillStyle = getComputedStyle(wrap).color; ctx.fill(); });
    cv.addEventListener('pointermove', ev => {
      if (!last) return;
      const p = at(ev);
      ctx.strokeStyle = getComputedStyle(wrap).color; ctx.lineWidth = 2.6 * (window.devicePixelRatio || 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(e => cv.addEventListener(e, () => { last = null; }));
    wrap.querySelector('[data-sc="clear"]').addEventListener('click', () => ctx.clearRect(0, 0, cv.width, cv.height));
    wrap.__size = size;
    return wrap;
  }
  // the keypad: digits, a fraction key that works like a template (the top, then the bottom), and Undo; powers,
  // roots and parentheses join it when the question can use them (ENGINE.mathKeys)
  const FRAC_KEY = '<span class="kf" aria-hidden="true"><i></i><b></b><i></i></span>';
  const PADKEYS = [['7'], ['8'], ['9'], ['⌫', 'del', 'Delete'], ['4'], ['5'], ['6'], [FRAC_KEY, 'frac', 'Fraction: the top, then the bottom'], ['1'], ['2'], ['3'], ['−', '-', 'Minus'], ['0'], ['.', '.', 'Decimal point'], ['space', ' ', 'Space, for a mixed number'], ['%', '%', 'Percent']];
  const MATHKEYS = [['x<sup>y</sup>', '^', 'To the power of'], ['√', '√', 'Square root'], ['(', '(', 'Open parenthesis'], [')', ')', 'Close parenthesis']];
  const ENDKEYS = [['Undo', 'undo', 'Undo the last key'], ['Clear', 'clear', 'Clear the answer']];
  // choices kept on this device rather than with the learner: the keypad open or closed, and answering by hand
  // (dragging, clicking a point) or from a list
  const DEVICE_KEY = 'procademy.player.v1';
  let deviceMem = {};
  const devicePref = () => { try { const o = JSON.parse(localStorage.getItem(DEVICE_KEY) || 'null'); return o && typeof o === 'object' ? o : deviceMem; } catch (e) { return deviceMem; } };
  const setDevicePref = patch => { deviceMem = Object.assign({}, devicePref(), patch); try { localStorage.setItem(DEVICE_KEY, JSON.stringify(deviceMem)); } catch (e) { /* this visit only */ } };
  /** what is typed, drawn as math under the answer box: 3/4 stacked, 2^5 raised, √85 under a root; an empty
      place shows as a box to fill */
  function previewHtml(t) {
    const slot = '<i class="slot"></i>';
    let h = esc(String(t || '')).replace(/-/g, '−');
    h = h.replace(/(\d+(?:\.\d+)?)?\/(\d+(?:\.\d+)?)?/g, (m, a, b) => `<span class="frac"><span class="num">${a || slot}</span><span class="den">${b || slot}</span></span>`);     // first: the markup below has slashes of its own
    h = h.replace(/√\s*(\d+(?:\.\d+)?|\([^)]*\)?)?/g, (m, x) => `<span class="sqrt">√<span class="rad">${x ? x.replace(/^\(|\)$/g, '') : slot}</span></span>`);
    h = h.replace(/\^\s*(−?\d+(?:\.\d+)?|\([^)]*\)?)?/g, (m, x) => `<sup>${x || slot}</sup>`);
    return h;
  }
  /* handwriting: one character at a time, matched against a few drawn shapes of each digit (the $P point-cloud
     method: the order and direction of strokes don't matter). A dot, a dash and a slash are told apart first. */
  const INK = (() => {
    const N = 32;
    // each shape: strokes of [x, y] points in a 100 × 100 box (y down)
    const SHAPES = {
      '0': [[[50, 0], [22, 12], [12, 50], [22, 88], [50, 100], [78, 88], [88, 50], [78, 12], [50, 0]]],
      '1': [[[30, 22], [55, 0], [55, 100]]],
      '2': [[[18, 25], [35, 4], [60, 2], [80, 20], [75, 45], [15, 100], [88, 100]]],
      '3': [[[18, 12], [45, 0], [75, 10], [75, 35], [42, 48], [78, 60], [82, 85], [50, 100], [15, 90]]],
      '4': [[[62, 0], [10, 68], [88, 68]], [[66, 30], [66, 100]]],
      '5': [[[78, 0], [28, 0], [22, 45], [60, 38], [82, 62], [72, 92], [45, 100], [15, 90]]],
      '6': [[[72, 2], [40, 25], [22, 60], [28, 90], [50, 100], [75, 88], [78, 65], [55, 52], [30, 58], [22, 72]]],
      '7': [[[12, 0], [88, 0], [38, 100]]],
      '8': [[[72, 14], [50, 0], [28, 14], [32, 36], [68, 60], [74, 86], [50, 100], [26, 86], [32, 60], [68, 36], [72, 14]]],
      '9': [[[76, 22], [55, 2], [28, 8], [22, 30], [42, 48], [70, 40], [76, 22], [74, 60], [68, 100]]],
    };
    const MORE = [
      ['0', [[[50, 0], [78, 12], [88, 50], [78, 88], [50, 100], [22, 88], [12, 50], [22, 12], [50, 0]]]],
      ['1', [[[50, 0], [50, 100]], [[30, 100], [70, 100]]]],
      ['1', [[[30, 22], [55, 0], [55, 100]], [[30, 100], [80, 100]]]],
      ['2', [[[15, 30], [30, 5], [65, 0], [82, 25], [60, 55], [15, 100], [90, 98]]]],
      ['3', [[[15, 8], [70, 0], [42, 45], [80, 62], [78, 90], [45, 100], [15, 88]]]],
      ['4', [[[18, 0], [12, 58], [86, 58]], [[68, 0], [68, 100]]]],
      ['4', [[[70, 100], [70, 0], [10, 68], [90, 68]]]],
      ['5', [[[25, 0], [22, 45], [60, 38], [82, 62], [72, 92], [45, 100], [15, 90]], [[25, 0], [80, 0]]]],
      ['6', [[[70, 0], [30, 35], [20, 70], [35, 98], [65, 98], [78, 72], [60, 52], [35, 55], [20, 70]]]],
      ['7', [[[12, 0], [88, 0], [38, 100]], [[35, 52], [75, 52]]]],
      ['7', [[[12, 18], [12, 0], [88, 0], [45, 100]]]],
      ['8', [[[50, 48], [25, 30], [30, 6], [50, 0], [70, 6], [75, 30], [50, 48], [22, 70], [30, 95], [50, 100], [70, 95], [78, 70], [50, 48]]]],
      ['8', [[[50, 0], [30, 8], [32, 38], [50, 48], [68, 38], [70, 8], [50, 0]], [[50, 48], [25, 62], [25, 92], [50, 100], [75, 92], [75, 62], [50, 48]]]],
      ['9', [[[78, 10], [50, 0], [25, 12], [25, 38], [50, 46], [76, 35], [78, 10], [78, 100]]]],
      ['9', [[[78, 30], [70, 5], [40, 0], [22, 22], [35, 45], [65, 42], [78, 30]], [[78, 30], [72, 100]]]],
    ];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function resample(pts, n) {
      const len = pts.reduce((t, p, i) => t + (i && p.id === pts[i - 1].id ? dist(pts[i - 1], p) : 0), 0), I = len / (n - 1) || 1;
      const out = [pts[0]]; let D = 0;
      const p = pts.slice();
      for (let i = 1; i < p.length; i++) {
        if (p[i].id !== p[i - 1].id) continue;
        const d = dist(p[i - 1], p[i]);
        if (D + d >= I && d > 0) {
          const q = { x: p[i - 1].x + (I - D) / d * (p[i].x - p[i - 1].x), y: p[i - 1].y + (I - D) / d * (p[i].y - p[i - 1].y), id: p[i].id };
          out.push(q); p.splice(i, 0, q); D = 0;
        } else D += d;
      }
      while (out.length < n) out.push(Object.assign({}, pts[pts.length - 1]));
      return out.slice(0, n);
    }
    function normalize(strokes) {
      let pts = []; strokes.forEach((st, id) => st.forEach(([x, y]) => pts.push({ x, y, id })));
      pts = resample(pts, N);
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
      const cx = xs.reduce((a, b) => a + b, 0) / N, cy = ys.reduce((a, b) => a + b, 0) / N;
      return pts.map(p => ({ x: (p.x - cx) / size, y: (p.y - cy) / size }));
    }
    function cloud(a, b, start) {
      const used = new Array(N).fill(false); let sum = 0, i = start;
      do {
        let best = Infinity, k = -1;
        for (let j = 0; j < N; j++) if (!used[j]) { const d = dist(a[i], b[j]); if (d < best) { best = d; k = j; } }
        used[k] = true; sum += (1 - ((i - start + N) % N) / N) * best; i = (i + 1) % N;
      } while (i !== start);
      return sum;
    }
    const match = (a, b) => { let m = Infinity; for (let i = 0; i < N; i += 4) m = Math.min(m, cloud(a, b, i), cloud(b, a, i)); return m; };
    let lib = null;
    const library = () => lib || (lib = Object.entries(SHAPES).map(([ch, st]) => ({ ch, pts: normalize(st) })).concat(MORE.map(([ch, st]) => ({ ch, pts: normalize(st) }))));
    /** strokes: [[[x, y], …], …] in screen units; box: the writing area's size. The character, or '' */
    function read(strokes, box) {
      strokes = strokes.filter(st => st.length);
      if (!strokes.length) return '';
      const all = [].concat(...strokes), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), B = box || Math.max(w, h, 1);
      if (Math.max(w, h) < B * 0.1) return '.';
      if (strokes.length === 1) {
        const st = strokes[0], a = st[0], b = st[st.length - 1], chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const path = st.reduce((t, p, i) => t + (i ? Math.hypot(p[0] - st[i - 1][0], p[1] - st[i - 1][1]) : 0), 0);
        if (chord > path * 0.9) {                         // a straight line
          if (h < w * 0.35) return '−';
          if (w < h * 0.3) return '1';
          if ((b[0] - a[0]) * (b[1] - a[1]) < 0 && w > h * 0.3) return '/';
        }
      }
      const pts = normalize(strokes);
      let best = null;
      library().forEach(t => { const d = match(pts, t.pts); if (!best || d < best.d) best = { ch: t.ch, d }; });
      return best ? best.ch : '';
    }
    return { read, SHAPES };
  })();
  /** a box to write one character at a time with a finger or a pen; each is read (INK) and typed into the answer */
  function inkPad(onChar) {
    const wrap = document.createElement('div');
    wrap.className = 'ink';
    wrap.innerHTML = '<div class="ink-bar"><span class="small muted">Write one digit at a time</span><span class="ink-last small" aria-live="polite"></span><button type="button" class="btn sm ghost" data-ink="undo">Undo</button></div><canvas aria-label="Write a digit here"></canvas>';
    const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d'), last = wrap.querySelector('.ink-last');
    let strokes = [], cur = null, timer = 0;
    const dpr = () => window.devicePixelRatio || 1;
    const size = () => { const r = cv.getBoundingClientRect(); if (r.width && cv.width !== Math.round(r.width * dpr())) { cv.width = Math.round(r.width * dpr()); cv.height = Math.round(r.height * dpr()); } };
    const at = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    const clear = () => { strokes = []; cur = null; ctx.clearRect(0, 0, cv.width, cv.height); };
    const read = () => {
      const r = cv.getBoundingClientRect(), ch = INK.read(strokes, Math.min(r.width, r.height));
      clear();
      if (ch) { onChar(ch); last.textContent = `Read as ${ch}`; } else last.textContent = 'Try that one again.';
    };
    cv.addEventListener('pointerdown', ev => {
      size(); clearTimeout(timer);
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      cur = [at(ev)]; strokes.push(cur);
      ctx.fillStyle = getComputedStyle(wrap).color; ctx.beginPath(); ctx.arc(cur[0][0] * dpr(), cur[0][1] * dpr(), 2 * dpr(), 0, Math.PI * 2); ctx.fill();
    });
    cv.addEventListener('pointermove', ev => {
      if (!cur) return;
      const p = at(ev), q = cur[cur.length - 1];
      cur.push(p);
      ctx.strokeStyle = getComputedStyle(wrap).color; ctx.lineWidth = 4 * dpr(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(q[0] * dpr(), q[1] * dpr()); ctx.lineTo(p[0] * dpr(), p[1] * dpr()); ctx.stroke();
    });
    ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { if (!cur) return; cur = null; clearTimeout(timer); timer = setTimeout(read, 700); }));
    wrap.querySelector('[data-ink="undo"]').addEventListener('click', () => { clearTimeout(timer); clear(); onChar('undo'); last.textContent = ''; });
    wrap.__clear = () => { clearTimeout(timer); clear(); last.textContent = ''; };
    wrap.__read = read;
    return wrap;
  }
  const canInk = () => devicePref().ink === true || !!(window.matchMedia && matchMedia('(any-pointer: coarse)').matches);
  exercise.INK = INK;                // for the test suite
  const signed = v => String(v).replace('-', '−');
  /** put things in order: a list to drag, or to move with the arrow keys */
  function orderHtml(sp, val, done) {
    const n = val.length;
    return `<p class="hands-how small muted" id="hands-how">Drag them into order, first at the top. Or select one and move it with the arrow keys.</p>
      <ol class="order-list" aria-describedby="hands-how">${val.map((x, k) => `<li class="order-item${done ? (x === sp.answer[k] ? ' ok' : ' no') : ''}" ${done ? '' : 'tabindex="0"'} data-i="${k}" aria-label="${esc(plain(x))}, place ${k + 1} of ${n}"><span class="key" aria-hidden="true">${k + 1}</span><span class="oi-text">${x}</span>${done ? '' : '<span class="oi-grip" aria-hidden="true">⠿</span>'}</li>`).join('')}</ol>
      ${done && val.join('|') !== sp.answer.join('|') ? `<p class="small hands-right">The right order: <b>${sp.answer.join(', ')}</b></p>` : ''}`;
  }
  /** a coordinate grid to click a point on (or move a point with the arrow keys) */
  function gridHtml(sp, pt, done, extra) {
    const n = sp.max - sp.min, W = 320, pad = 26, u = (W - 2 * pad) / n;
    const X = x => pad + (x - sp.min) * u, Y = y => W - pad - (y - sp.min) * u, every = n > 12 ? 2 : 1;
    let g = '';
    for (let v = sp.min; v <= sp.max; v++) {
      const axis = v === 0;
      g += `<line class="gr-line${axis ? ' axis' : ''}" x1="${X(v)}" y1="${Y(sp.min)}" x2="${X(v)}" y2="${Y(sp.max)}"/><line class="gr-line${axis ? ' axis' : ''}" x1="${X(sp.min)}" y1="${Y(v)}" x2="${X(sp.max)}" y2="${Y(v)}"/>`;
      if (v % every === 0 && v !== 0) g += `<text class="gr-num" x="${X(v)}" y="${Y(Math.max(sp.min, 0)) + 14}" text-anchor="middle">${signed(v)}</text><text class="gr-num" x="${X(Math.max(sp.min, 0)) - 6}" y="${Y(v) + 4}" text-anchor="end">${signed(v)}</text>`;
    }
    g += `<text class="gr-num" x="${X(Math.max(sp.min, 0)) - 6}" y="${Y(Math.max(sp.min, 0)) + 14}" text-anchor="end">0</text><text class="gr-ax" x="${X(sp.max) + 6}" y="${Y(Math.max(sp.min, 0)) + 4}">x</text><text class="gr-ax" x="${X(Math.max(sp.min, 0))}" y="${pad - 10}" text-anchor="middle">y</text>`;
    const right = done && pt && pt[0] === sp.answer[0] && pt[1] === sp.answer[1];
    if (done && !right) g += `<circle class="gr-ring" cx="${X(sp.answer[0])}" cy="${Y(sp.answer[1])}" r="8"/>`;
    if (pt) g += `<circle class="gr-pt${done ? (right ? ' right' : ' wrong') : ''}" cx="${X(pt[0])}" cy="${Y(pt[1])}" r="7"/>`;
    return `<svg class="grid-pick" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" ${done ? '' : 'tabindex="0"'} role="img" aria-describedby="hands-how" aria-label="A coordinate grid from ${signed(sp.min)} to ${sp.max}${pt ? `, with your point at ${sp.said(pt)}` : ''}" data-u="${u}" data-pad="${pad}">${g}<circle class="gr-hover" r="6" cx="-50" cy="-50"/></svg>
      <div class="hands-side">${done ? '' : '<p class="hands-how small muted" id="hands-how">Click or tap where the point goes. The arrow keys move it too.</p>'}
      <p class="hands-read" aria-live="polite">${pt ? `Your point: <b>${sp.said(pt)}</b>` : done ? '' : 'No point yet.'}${done && !right ? `${pt ? '. ' : ''}The answer is <b>${sp.said(sp.answer)}</b>.` : ''}</p>${extra || ''}</div>`;
  }
  /** a number line with a marker to drag to the answer (it fills in the answer box) */
  function lineHtml(sp, v, done, ok, narrow) {
    // drawn at about the size it shows, so the numbers stay readable on a phone
    const n = (sp.max - sp.min) / sp.step, W = narrow ? 340 : 640, pad = 18, u = (W - 2 * pad) / n, X = x => pad + (x - sp.min) / sp.step * u;
    const label = narrow && n / sp.label > 6 ? sp.label * 2 : sp.label;
    let g = `<line class="nl-axis" x1="${pad - 10}" y1="44" x2="${W - pad + 10}" y2="44"/>`;
    for (let k = 0; k <= n; k++) {
      const x = +(sp.min + k * sp.step).toFixed(6), big = Math.abs(x / label - Math.round(x / label)) < 1e-9;
      g += `<line class="nl-tick${big ? ' big' : ''}" x1="${X(x)}" y1="${big ? 34 : 38}" x2="${X(x)}" y2="${big ? 54 : 50}"/>`;
      if (big) g += `<text class="nl-num" x="${X(x)}" y="74" text-anchor="middle">${signed(x)}</text>`;
    }
    if (sp.start != null && sp.start !== sp.min) g += `<circle class="nl-start" cx="${X(sp.start)}" cy="44" r="6"/><text class="nl-tag" x="${X(sp.start)}" y="94" text-anchor="middle">start</text>`;
    g += `<path class="nl-jump" d="${v != null && sp.start != null && v !== sp.start ? `M${X(sp.start)} 30 Q${(X(sp.start) + X(v)) / 2} 8 ${X(v)} 30` : ''}"/>`;
    if (v != null) g += `<g class="nl-mark${done ? (ok ? ' ok' : ' no') : ''}" transform="translate(${X(v)} 44)"><circle r="9"/><text y="-16" text-anchor="middle">${signed(v)}</text></g>`;
    return `<div class="nline-wrap"><svg class="nline" viewBox="0 0 ${W} 100" width="${W}" height="100" role="slider" ${done ? 'aria-disabled="true"' : 'tabindex="0"'} aria-label="Number line: drag the marker to your answer" aria-valuemin="${sp.min}" aria-valuemax="${sp.max}" aria-valuenow="${v == null ? sp.min : v}" aria-valuetext="${v == null ? 'no answer yet' : signed(v)}" data-u="${u}" data-pad="${pad}" data-w="${W}">${g}</svg></div>`;
  }
  // unlimited practice: what was answered since the last save is saved when the page changes (before the next
  // page draws, so Progress is up to date), when the tab is hidden (phones may close it without warning) and
  // when the page goes away. Saving twice saves nothing more.
  let endlessNow = null;
  const saveEndlessNow = () => { if (endlessNow && !endlessNow.stopped) E.saveEndless(endlessNow); };
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => { saveEndlessNow(); endlessNow = null; document.documentElement.classList.remove('pc-focus'); }, true);
    window.addEventListener('pagehide', saveEndlessNow);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveEndlessNow();
      // sounds pause while the page is out of sight, and carry on when it comes back
      try { if (audio) { if (document.hidden && audio.state === 'running') audio.suspend(); else if (!document.hidden && audio.state === 'suspended') audio.resume(); } } catch (e) { /* fine */ }
    });
  }
  function exercise(root, s, opts) {
    opts = opts || {};
    root.__session = s;                      // for the test suite
    const endless = s.kind === 'endless';
    let hintsShown = 0, selected = null, phase = 'fresh', lastFeedback = '', nudged = false;
    const t0 = Date.now();
    const limitMs = (opts.minutes || s.minutes || 0) * 60000;             // a countdown: a timed quiz or a warm-up
    const misses = () => s.results.filter(r => r && r.done && !E.counts(r)).length;
    const outOfLives = () => !!s.lives && misses() >= s.lives;
    let workLines = null, workOpen = false;          // the learner's own steps for this question (STEPS)
    let lastSpoken = null;                           // read each question aloud once, when the learner asks for that
    let scratch = null, scratchOpen = false;         // the scratch pad for this question, and whether it is shown
    let asking = false;                              // "I don't know" waiting to be sure, before anything was tried
    let flagOpen = false, optsOpen = false;          // the Flag form and the Options menu
    let handsVal = null, handsTouched = false, lastPick = null;    // an answer by hand (an order, a point, a place on a line), and which way was used last
    let undo = [];                                   // the answer box as it was before each key, for Undo
    let autoNext = 0;                                // going on by itself after a right answer (an option)
    let ink = null;                                  // the handwriting box (it stays open from question to question)
    const flaggedHere = [];                          // questions flagged during this set
    const relaxed = !!opts.relaxed;                  // relaxed review: no timer, the rule shown from the start, big hints
    if (relaxed) nudged = true;
    let animFrom = -1, animNudge = false;            // the hint steps that just appeared (each one animates in, in turn)
    const plainer = new Set(), fromLesson = new Set();   // hint steps shown in simpler words, and with their lesson paragraph
    let picture = false, lastSlip = null;            // a picture in the hints; the kind of slip in the last wrong answer
    let sideOpen = !!(s.hints && devicePref().side), sideN = 0;   // a worked example beside the question
    const fine = !!(window.matchMedia && matchMedia('(pointer: fine)').matches);
    const pauseKey = location.hash, canPause = !['endless', 'placement', 'testout'].includes(s.kind) && !opts.result;
    const held = canPause && !opts.resumed && pausedAll()[pauseKey];
    if (held && held.kind === s.kind && stillGood(held)) {
      root.innerHTML = `<div class="ex"><div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(held.title || s.title)}</h1></div>
        <div class="card resume-card"><h2>Pick up where you left off?</h2><p class="muted">You paused this set at question ${Math.min(held.i + 1, held.items.length)} of ${held.items.length}.</p>
        <div class="btn-row"><button class="btn primary" type="button" id="resume">Continue the set</button><button class="btn" type="button" id="restart">Start over</button></div></div></div>`;
      const more = Object.assign({}, opts, { resumed: true });
      root.querySelector('#resume').addEventListener('click', () => { setPaused(pauseKey, null); exercise(root, E.unpack(held), more); });
      root.querySelector('#restart').addEventListener('click', () => { setPaused(pauseKey, null); exercise(root, s, more); });
      setTimeout(() => { const b = root.querySelector('#resume'); if (b) b.focus(); }, 0);
      return;
    }
    if (held && !stillGood(held)) setPaused(pauseKey, null);

    function dots() {
      if (endless) {      // unlimited practice: a running score instead of a dot per question
        const t = E.tally(s);
        const lv = E.levelOf(s);
        return `<div class="ul-tally"><span>Answered <b>${t.n}</b></span><span>Correct on the first try <b>${t.right}</b></span><span>Streak <b>${t.streak}</b>${t.best > t.streak ? ` (best ${t.best})` : ''}</span><span class="adapt lv-${lv}" title="Questions get harder after two right in a row, and easier after a miss"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>${['Easier questions', 'Steady', 'Harder questions'][lv]}</span><button class="btn sm" id="stop" type="button">End session</button></div>`;
      }
      return `<div class="dots" role="img" aria-label="Question ${s.i + 1} of ${s.items.length}">${s.items.map((it, k) => {
        const r = s.results[k];
        let cls = k === s.i ? 'current' : '';
        if (r && r.done) cls = E.counts(r) ? 'right' : (r.correct ? 'hinted' : 'wrong');
        return `<span class="${cls}"></span>`;
      }).join('')}</div>`;
    }
    /** the hands-on way to answer this question (put in order, click a point, a number line), if it has one */
    const handsOf = q => (E.hands ? E.hands(q) : null);
    const handsOn = kind => (kind === 'line' ? devicePref().line !== false : devicePref().hands !== false);
    /** a number line's marker: what the answer box says, when that is a place on the line; else where it was left */
    function lineValue(sp) {
      const el = root.querySelector('#ans'), t = el ? el.value : (draft != null ? draft : lastInput), v = A.parseNumber(t);
      if (isFinite(v) && v >= sp.min && v <= sp.max && Math.abs((v - sp.min) / sp.step - Math.round((v - sp.min) / sp.step)) < 1e-9) return v;
      return handsVal != null ? handsVal : sp.start;
    }
    function answerArea(q) {
      const sp = handsOf(q), done = phase === 'done', r = s.results[s.i];
      if (q.type === 'choice') {
        const useHands = !!sp && handsOn(sp.kind) && !(done && lastPick === 'list');
        if (sp && sp.kind === 'order' && handsVal == null) handsVal = sp.items.slice();
        // once it's over, each wrong choice says why it's wrong, where the device can tell
        const whyNot = k => { const w = done && k !== q.answerIndex && window.COACH && COACH.whyChoice ? COACH.whyChoice(q, k) : null; return w ? `<p class="why-not"${fbAttr()}><span class="visually-hidden">Why not: </span>${esc(T(w))}</p>` : ''; };
        const list = `<ul class="choices" id="choices"${useHands ? ' hidden' : ''}>${q.choices.map((ch, k) => `<li><button type="button" data-k="${k}" aria-pressed="${selected === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${ch}</span></button>${whyNot(k)}</li>`).join('')}</ul>`;
        // shown without an answer by hand (given up, or the last hint): the right order, or the right point
        const answered = !done || lastPick === 'hands';
        const sw = sp && !done ? `<button type="button" class="link-btn hands-switch" id="hands-switch">${useHands ? 'Choose from a list instead' : sp.kind === 'order' ? 'Drag them into order instead' : 'Click the point on a grid instead'}</button>` : '';
        const inGrid = useHands && sp.kind === 'grid';
        const widget = useHands ? `<div class="hands hands-${sp.kind}" id="hands">${sp.kind === 'order' ? orderHtml(sp, answered ? handsVal : sp.answer, done) : gridHtml(sp, answered ? handsVal : null, done, sw)}</div>` : '';
        return widget + (widget ? '<p class="visually-hidden" id="hands-live" aria-live="polite"></p>' : '') + list + (inGrid ? '' : sw);
      }
      const isNum = q.type === 'number';
      const pre = q.unit === '$', unit = q.unit && !pre ? `<span class="unit">${q.unit}</span>` : '';
      const pad = isNum && padOn(), mk = isNum && E.mathKeys && E.mathKeys(q);
      if (isNum && !done && !ink && devicePref().ink === true) ink = inkPad(typeKey);        // writing by hand, as this device was left
      const keys = PADKEYS.concat(mk ? MATHKEYS : [], ENDKEYS);
      const line = sp && sp.kind === 'line' ? sp : null;
      return `<div class="row ans-row">${pre ? '<span class="unit" style="margin:0">$</span>' : ''}<input id="ans" class="ans-input" type="text" inputmode="${pad || (ink && isNum) ? 'none' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="${isNum ? 'Your answer' : 'Type your answer'}">${unit}${isNum && !done ? `<button type="button" class="btn sm ghost pad-toggle" id="pad-toggle" aria-controls="ans-pad" aria-expanded="${pad}">${pad ? 'Hide keypad' : 'Keypad'}</button>` : ''}${isNum && !done && canInk() ? `<button type="button" class="btn sm ghost" id="ink-toggle" aria-expanded="${!!ink}" title="Write each digit with a finger or a pen">${ink ? 'Stop writing' : 'Write it'}</button>` : ''}</div>
        <div class="ans-preview" id="ans-preview" aria-hidden="true" hidden></div>
        ${isNum && !done && ink ? '<div id="ink-slot"></div>' : ''}
        ${isNum && !done ? `<div class="ans-pad${mk ? ' has-math' : ''}" id="ans-pad" role="group" aria-label="Number keypad" ${pad ? '' : 'hidden'}>${keys.map(([lab, ins, aria]) => `<button type="button" class="ans-key${ins === 'del' ? ' del' : ''}${ins === 'undo' || ins === 'clear' ? ' wide' : ''}" data-key="${esc(ins || lab)}"${aria ? ` aria-label="${aria}"` : ''}${ins === 'undo' && !undo.length ? ' disabled' : ''}>${lab}</button>`).join('')}</div>` : ''}
        ${line && handsOn('line') ? `<div class="hands hands-line" id="hands">${lineHtml(line, lineValue(line), done, !!(r && r.correct), (root.clientWidth || innerWidth) < 600)}</div>` : ''}
        ${line && !done ? `<button type="button" class="link-btn hands-switch" id="hands-switch">${handsOn('line') ? 'Hide the number line' : 'Use a number line'}</button>` : ''}
        <div class="help">${isNum ? `Fractions like <b>3/4</b>, mixed numbers like <b>1 1/2</b>, decimals and percents are all fine.${mk ? ' A power or a root works too, like <b>√85</b> or <b>2^5</b>.' : ''}` : (q.help || 'Accents and capital letters don’t matter.')}</div>`;
    }
    /** the on-screen keypad: this device's choice, else open on touch screens */
    function padOn() { const d = devicePref().pad; if (d != null) return !!d; const p = playerPref().pad; return p == null ? !fine : !!p; }
    /** the free first rung of the hint ladder: the skill's big idea, a reminder that gives nothing away */
    function nudgeOf(it) { const b = bigIdea(it.skillId); return b ? `Remember: ${b}` : 'Read the question again and underline what it asks for. Which numbers do you need?'; }
    // each hint can be read aloud
    const hintSay = html => (window.COACH && COACH.canSpeak() ? COACH.speakBtn(html, 'Read this hint aloud') : '');
    function hintsArea(q) {
      const it = E.current(s), r = s.results[s.i], shown = q.hints.slice(0, hintsShown);
      const revealed = r && r.revealed, rule = E.ruleOf ? E.ruleOf(it.skillId) : null;
      // the learner's own answer, once hints are out: what it shows, and the step it matches
      const tried = r && r.tries && !r.correct && phase !== 'done' && (nudged || hintsShown > 0) && (lastInput != null || lastPick != null) && lastSaid;
      const mine = tried && window.COACH && COACH.aboutAnswer ? COACH.aboutAnswer(q, q.type === 'choice' ? (lastPick === 'hands' ? null : selected) : lastInput) : null;
      const pic = hintsShown > 0 && E.model ? E.model(q) : null;
      const step = (hh, k) => {
        const easy = E.simpler ? E.simpler(hh) : hh, src = E.lessonFor ? E.lessonFor(it.skillId, hh, nudged ? rule : null) : null, isEasy = plainer.has(k) && easy !== hh;
        return `<div class="hint${animFrom >= 0 && k >= animFrom ? ' hint-in' : ''}" style="--k:${Math.max(0, k - Math.max(animFrom, 0))}"><div class="hn"><span>${k === q.hints.length - 1 ? 'Last step' : 'Hint ' + (k + 1)}${mine && mine.step === k ? ' <span class="ya-here">Your answer is here</span>' : ''}</span>${hintSay(isEasy ? easy : hh)}</div>
          <div class="hint-body">${isEasy ? easy : hh}</div>
          ${easy !== hh || src ? `<div class="hint-acts">${easy !== hh ? `<button type="button" class="link-btn" data-plain="${k}" aria-pressed="${isEasy}">${isEasy ? 'Show the original' : 'Say it more simply'}</button>` : ''}${src ? `<button type="button" class="link-btn" data-lesson="${k}" aria-expanded="${fromLesson.has(k)}">From the lesson</button>` : ''}</div>` : ''}
          ${src && fromLesson.has(k) ? `<div class="lesson-bit"><div class="lb-h">From the lesson</div><div class="learn">${src.html}</div><a class="small" href="${skillHref(it.skillId)}" target="_blank" rel="noopener">Open the whole lesson</a></div>` : ''}</div>`;
      };
      return `<div class="hints${relaxed ? ' big' : ''}" id="hints">${nudged ? (rule ? `<div class="hint nudge rule-box${animNudge ? ' hint-in' : ''}"><div class="hn"><span>The rule</span>${hintSay(rule)}</div><div class="rule-body">${rule}</div></div>` : `<div class="hint nudge${animNudge ? ' hint-in' : ''}"><div class="hn"><span>Nudge</span>${hintSay(esc(nudgeOf(it)))}</div>${esc(nudgeOf(it))}</div>`) : ''}
        ${mine ? `<div class="your-ans"><span class="ya-label">Your answer</span> <b data-raw>${esc(lastSaid)}</b><span class="ya-line">${esc(mine.line)}</span></div>` : ''}
        ${shown.map(step).join('')}
        ${pic ? `<div class="hint-pic${picture ? ' open' : ''}">${picture ? `<div class="hn"><span>A picture</span></div>${pic.svg}<p class="small">${esc(pic.caption)}</p>` : ''}<button type="button" class="btn sm ghost" id="hint-pic" aria-expanded="${picture}">${picture ? 'Hide the picture' : 'Show a picture'}</button></div>` : ''}
        ${revealed && !r.correct ? `<div class="hint"><div class="hn">Answer</div><b>${A.answerText(q)}</b></div>` : ''}</div>`;
    }
    /** a worked example of the same kind, beside the question (a fresh question of the skill, every step shown) */
    function sideExample(it) {
      let wq = null;
      for (let j = 0; j < 6 && (!wq || A.normText(A.stripTags(wq.prompt)) === A.normText(A.stripTags(it.q.prompt))); j++) wq = A.question(it.skillId, `side-${it.seed}-${sideN}-${j}`);
      const ans = wq.type === 'choice' ? wq.choices[wq.answerIndex] : A.answerText(wq);
      return `<aside class="ex-side" aria-labelledby="side-h"><div class="side-top"><b id="side-h">A worked example</b><span class="side-btns"><button type="button" class="btn sm ghost" id="side-new">Another one</button><button type="button" class="btn sm ghost" id="side-close" aria-label="Close the example">Close</button></span></div>
        <p class="tiny muted side-note">A different question of the same kind, worked out step by step.</p>
        <div class="we-q side-q">${wq.prompt}${wq.type === 'choice' ? `<ol class="we-choices" type="A">${wq.choices.map((c, k) => `<li class="${k === wq.answerIndex ? 'is-right' : ''}">${c}</li>`).join('')}</ol>` : ''}</div>
        <ol class="we-steps">${wq.hints.map((h, k) => `<li class="hint"><div class="hn">${k === wq.hints.length - 1 ? 'Last step' : 'Step ' + (k + 1)}</div>${h}</li>`).join('')}</ol>
        <div class="feedback good"><span>Answer: <b>${ans}</b></span></div></aside>`;
    }
    /** a word problem: enough words around at least two numbers */
    const wordy = q => { const t = plain(q.prompt); return (t.match(/[a-z]{2,}/gi) || []).length >= 12 && (t.match(/\d+(?:[.,/]\d+)?/g) || []).length >= 2; };
    const KEY_WORDS = /\b(each|per|every|in all|altogether|total|left|remain(?:s|ing)?|more than|fewer than|less than|times as|twice|half|shared? equally|split|percent|average|difference|how many|how much)\b/gi;
    /** marks on the question: the minus signs after a sign slip; the numbers and action words of a word problem once hints
        are out (and the same numbers in the hints) */
    function markQuestion(q) {
      const qel = root.querySelector('.question');
      if (!qel) return;
      const wrap = (el, re, cls) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && n.parentElement.closest('svg, mark, button, .say-btn, .frac, sup, sub, .lead') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
        const list = [], hit = new RegExp(re.source, re.flags.replace('g', ''));
        for (let n = walker.nextNode(); n; n = walker.nextNode()) if (hit.test(n.nodeValue)) list.push(n);
        list.forEach(n => {
          const frag = document.createDocumentFragment(), t = n.nodeValue;
          let at = 0;
          t.replace(re, (m, ...rest) => { const i = rest[rest.length - 2]; if (i > at) frag.appendChild(document.createTextNode(t.slice(at, i))); const mk = document.createElement('mark'); mk.className = cls; mk.textContent = m; frag.appendChild(mk); at = i + m.length; return m; });
          if (at < t.length) frag.appendChild(document.createTextNode(t.slice(at)));
          n.replaceWith(frag);
        });
      };
      if (lastSlip === 'sign' && phase !== 'done') {
        wrap(qel, /[−-](?=\s*[\d(.])/g, 'sign-hl');
        const a = root.querySelector('#ans'); if (a) a.classList.add('sign-off');
      }
      if ((nudged || hintsShown > 0) && !q.spot && wordy(q)) {
        wrap(qel, /\$?\d[\d,]*(?:\.\d+)?%?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|half|twice|double|triple)\b/gi, 'num-hl');
        wrap(qel, KEY_WORDS, 'key-hl');
        const nums = new Set([...qel.querySelectorAll('mark.num-hl')].map(m => m.textContent.replace(/[$,%]/g, '')));
        root.querySelectorAll('#hints .hint:not(.nudge) .hint-body').forEach(h => wrap(h, /\d[\d,]*(?:\.\d+)?/g, 'num-hl pending'));
        root.querySelectorAll('#hints mark.pending').forEach(m => { if (nums.has(m.textContent.replace(/,/g, ''))) m.classList.remove('pending'); else m.replaceWith(document.createTextNode(m.textContent)); });
      }
    }
    const selfTimer = () => !!playerPref().timer && !limitMs && !s.stopwatch && !relaxed;
    const LENS = [5, 7, 10];
    /** the player's options, folded into one menu: sound, a timer, going on by itself, focus mode */
    function optionsMenu() {
      const p = playerPref(), row = (id, label, help, on) => `<label class="opt-row" for="${id}"><span class="opt-text"><b>${label}</b><span>${help}</span></span><input type="checkbox" class="switch" id="${id}"${on ? ' checked' : ''}></label>`;
      return `<div class="ex-opts"><button type="button" class="btn ghost sm" id="opts-btn" aria-expanded="${optsOpen}" aria-controls="opts-panel" aria-label="Options" title="Sound, a timer and more">${icon('settings', 16)}<span class="opts-word">Options</span></button>
        <div class="opts-panel" id="opts-panel" role="group" aria-label="Practice options"${optsOpen ? '' : ' hidden'}>
          ${row('sound', 'Sound', 'A sound, and a buzz on phones, for each answer', !!p.sound)}
          ${limitMs || s.stopwatch || relaxed ? '' : row('opt-timer', 'Timer', 'Show how long this set is taking', !!p.timer)}
          ${relaxed ? '' : row('opt-auto', 'Go on by itself', 'After a right answer, the next question comes up', !!p.auto)}
          ${s.hints && !relaxed ? row('opt-why', 'Ask why it works', 'After a right answer, a short question about why it works', !!p.why) : ''}
          ${window.LANG && LANG.NAMES ? `<label class="opt-row" for="opt-fb"><span class="opt-text"><b>Feedback language</b><span>Right-or-wrong messages and tips</span></span><select id="opt-fb">${Object.keys(LANG.NAMES).map(c => `<option value="${c}"${fbLang() === c ? ' selected' : ''}>${LANG.NAMES[c]}</option>`).join('')}</select></label>` : ''}
          ${row('opt-focus', 'Focus mode', 'Hide the menus while you practice', !!p.focus)}
          ${window.ESQ && ESQ.covers(E.current(s).skillId) ? row('opt-es', 'Questions in Spanish (en español)', 'The English is a tap away', !!p.es) : ''}
        </div></div>`;
    }
    const flagged = it => (S.get().profile.flagged || []).find(f => f.skill === it.skillId && f.seed === it.seed);
    const FLAG_WHY = [['confusing', 'It’s confusing'], ['answer', 'The answer looks wrong'], ['broken', 'Something doesn’t show right']];
    function flagBox(it) {
      const f = flagged(it);
      return `<div class="flag-box" id="flag-box" role="group" aria-labelledby="flag-h"><p class="flag-h" id="flag-h"><b>What’s wrong with this question?</b></p>
        <div class="seg" id="flag-why" role="radiogroup" aria-labelledby="flag-h">${FLAG_WHY.map(([v, l], k) => `<button type="button" role="radio" data-v="${v}" aria-checked="${f ? f.why === v : k === 0}">${l}</button>`).join('')}</div>
        <input type="text" id="flag-note" maxlength="300" placeholder="Add a note (optional)" aria-label="A note about the problem (optional)" value="${f && f.note ? esc(f.note) : ''}">
        <div class="btn-row"><button type="button" class="btn sm primary" id="flag-save">${f ? 'Save' : 'Flag it'}</button><button type="button" class="btn sm ghost" id="flag-cancel">Cancel</button>${f ? '<button type="button" class="btn sm ghost" id="flag-remove">Remove the flag</button>' : ''}</div></div>`;
    }
    function render() {
      if (autoStop) autoStop(); else clearTimeout(autoNext);
      if (E.isDone(s)) return summary();
      if (phase === 'done' && !endless) E.followUps(s);           // a unit test's second chances join at the end
      const it = E.current(s), q = it.q, r = s.results[s.i];
      const canHint = s.hints && hintsShown < q.hints.length && phase !== 'done';
      const def = A.skills[it.skillId];
      const canSkip = phase !== 'done' && !it.skipped && !endless && s.kind !== 'placement' && s.i < s.items.length - 1 && !(r && r.done);
      const left = s.items.length - s.i - 1;
      const t = E.tally(s), sp = handsOf(q), handsShown = sp && sp.kind !== 'line' && handsOn(sp.kind) && !(phase === 'done' && lastPick === 'list');
      // a practice set can be 5, 7 or 10 questions: chosen before the first answer
      const lenPick = s.kind === 'practice' && !opts.result && s.results.every(x => !x) && s.i === 0 ? `<div class="len-pick"><span class="small muted" id="len-l">Questions</span><div class="seg" role="radiogroup" aria-labelledby="len-l">${LENS.map(n => `<button type="button" role="radio" data-len="${n}" aria-checked="${n === s.items.length}">${n}</button>`).join('')}</div></div>` : '';
      const fl = flagged(it);
      const acts = `${limitMs || s.stopwatch ? `<span class="stat-pill ex-clock" id="ex-clock" role="timer" aria-label="${s.stopwatch ? 'Time so far' : 'Time left'}">${clockText(s.stopwatch ? Date.now() - t0 : limitMs - (Date.now() - t0))}</span>` : ''}${selfTimer() ? `<span class="stat-pill ex-clock ex-timer" id="ex-timer" role="timer" aria-label="Time so far">${clockText(Date.now() - t0)}</span>` : ''}${s.lives ? `<span class="lives" role="img" aria-label="${s.lives - Math.min(s.lives, misses())} of ${s.lives} lives left">${Array.from({ length: s.lives }, (_, k) => `<i class="${k < s.lives - misses() ? 'on' : ''}"></i>`).join('')}</span>` : ''}${canPause && !limitMs && !s.stopwatch && !s.lives ? '<button class="btn sm ghost" type="button" id="pause" title="Save this set and finish it later">Pause</button>' : ''}`;
      const side = sideOpen && s.hints ? sideExample(it) : '';
      root.innerHTML = `<div class="ex${side ? ' wide' : ''}${relaxed ? ' relaxed' : ''}">
        <div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(s.title)}</h1>${dots()}${endless ? '' : `<span class="tiny muted ex-left">${left ? `${left} left` : 'The last one'}${t.streak >= 3 ? ` <span class="ex-streak" title="Right on the first try, in a row">${t.streak} in a row</span>` : ''}</span>`}${acts ? `<span class="ex-acts">${acts}</span>` : ''}</div>
        <div class="card">
          ${opts.banner || relaxed ? `<div class="ex-banner">${opts.banner || '<b>Relaxed mode:</b> no timer, and the rule is shown from the start. Take all the time and hints you need.'}</div>` : ''}
          <div class="q-tools">${lenPick}${it.why ? `<span class="chip why-${it.why}">${{ review: 'Review', mistake: 'Correcting a mistake', new: 'New skill', again: 'Second chance', similar: 'A similar one' }[it.why]}</span>` : ''}${window.COACH && COACH.canSpeak() ? `<button type="button" class="btn ghost sm say-q" id="read-q" aria-pressed="false" title="Each sentence is highlighted as it is read">Read aloud</button>` : ''}<button type="button" class="btn ghost sm" id="scratch-btn" aria-pressed="${scratchOpen}">Scratch pad</button>${s.hints ? `<button type="button" class="btn ghost sm" id="side-btn" aria-pressed="${!!side}" aria-label="Worked example" title="A worked example of the same kind, beside the question">${icon('book', 16)}<span class="side-word">Example</span></button>` : ''}<button type="button" class="btn ghost sm flag-btn" id="flag-btn" aria-expanded="${flagOpen}" aria-pressed="${!!fl}" title="Tell us about a confusing or broken question" aria-label="${fl ? 'Flagged' : 'Flag this question'}">${icon('flag', 16)}<span class="flag-word">${fl ? 'Flagged' : 'Flag'}</span></button>${optionsMenu()}</div>
          ${flagOpen ? flagBox(it) : ''}
          ${side ? '<div class="ex-split"><div class="ex-main">' : ''}<div class="question">${s.kind !== 'practice' && s.kind !== 'testout' && !(endless && s.skills.length === 1) ? `<div class="lead">${def.title}</div>` : ''}${window.ESQ ? ESQ.prompt(q) : q.prompt}</div>
          <div id="scratch-slot"></div>
          <div class="answer">${answerArea(q)}</div>
          ${workEq(it) ? `<details class="steps-work" id="work" ${workOpen ? 'open' : ''}><summary>Show your work: each step is checked</summary><div class="steps-box" id="work-box"></div><p class="tiny muted" style="margin:6px 0 0">Each line is checked as you type, by calculation. Checking a finished line (like <b>x = 4</b>) counts as a hint.</p></details>` : ''}
          <div id="feedback" aria-live="polite">${lastFeedback}</div>
          ${hintsArea(q)}${s.hints ? `<button type="button" class="link-btn side-link" id="side-btn2" aria-expanded="${!!side}">${side ? 'Hide the worked example' : 'See a worked example'}</button>` : ''}${side ? `</div>${side}</div>` : ''}
          ${asking ? `<div class="giveup-ask" role="group" aria-labelledby="giveup-h"><p id="giveup-h"><b>See the answer now?</b> <span class="muted">${s.hints ? 'A hint shows just the next step.' : ''}${s.kind === 'spot' ? '' : `${s.hints ? ' ' : ''}A question you don’t know comes back in Review.`}</span></p><div class="btn-row"><button type="button" class="btn sm primary" id="giveup-yes">Show the answer</button><button type="button" class="btn sm" id="giveup-no">Keep trying</button></div></div>` : ''}
          <div class="ex-foot">
            ${s.hints ? `<button class="btn" id="hint" ${canHint ? '' : 'disabled'} title="${!nudged ? 'A gentle reminder first. It doesn’t count as a hint.' : 'Each hint shows one more step'}">${canHint && !nudged ? 'Nudge' : 'Hint'}${canHint && nudged ? ` <span class="muted small">(${q.hints.length - hintsShown} remaining)</span>` : ''}</button>` : ''}
            ${phase !== 'done' && !asking ? `<button class="btn ghost" id="giveup">I don’t know</button>` : ''}
            ${s.hints || phase === 'done' ? `<button class="btn ghost" id="ask-tutor">${phase === 'done' ? 'Ask the tutor' : 'Help with this one'}</button>` : ''}
            ${canSkip ? '<button class="btn ghost" id="skip" type="button" title="This question moves to the end of the set">Skip for now</button>' : ''}
            ${phase === 'done' && !E.counts(r) && E.canSimilar(s) && !s.outOfLives && !timeUp() ? '<button class="btn" id="similar" type="button" title="Another question like this one, right after it">Try a similar one</button>' : ''}
            <span class="spacer"></span>
            <span class="ex-go"><span class="muted small ex-count">${endless ? `Question ${s.i + 1}` : `${s.i + 1} of ${s.items.length}`}</span>
            ${phase === 'done' ? `<button class="btn primary" id="next">${s.outOfLives || timeUp() ? 'See how you did' : !endless && s.i + 1 === s.items.length ? 'Finish' : 'Next question'}</button>` : `<button class="btn primary" id="check" disabled>Check</button>`}</span>
          </div>
          ${fine && phase !== 'done' ? `<p class="ex-keys tiny muted">Keys: <kbd>Enter</kbd> checks${q.type === 'choice' ? `${handsShown ? '' : ` · <kbd>1</kbd> to <kbd>${q.choices.length}</kbd> or the arrow keys choose`}${s.hints && canHint ? ' · <kbd>H</kbd> takes a hint' : ''}${canSkip ? ' · <kbd>S</kbd> skips for now' : ''}` : ''}</p>` : ''}
        </div></div>`;
      bind(q);
      markQuestion(q);
      animFrom = -1; animNudge = false;
      // the scratch pad belongs to this question: the same drawing comes back after each check
      if (scratchOpen) { scratch = scratch || scratchPad(); const slot = root.querySelector('#scratch-slot'); if (slot) { slot.replaceWith(scratch); requestAnimationFrame(() => scratch.__size()); } }
      // a question's pictures: larger on wide screens, and Zoom in opens them bigger still
      root.querySelectorAll('.question svg.figure').forEach(f => {
        if (/inline/.test(f.getAttribute('style') || '')) return;
        const w = Number(f.getAttribute('width')) || 0;
        if (w) { f.style.width = `min(100%, ${Math.round(w * 1.4)}px)`; f.style.height = 'auto'; }
        f.classList.add('zoomable');
        f.addEventListener('click', () => zoomFigure(f));
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn sm ghost fig-zoom'; b.textContent = 'Zoom in';
        b.addEventListener('click', () => zoomFigure(f));
        f.after(b);
      });
      // read aloud, a sentence at a time with each one highlighted (the question, then each choice)
      const readItems = () => [{ el: root.querySelector('.question') }].concat([...root.querySelectorAll('#choices:not([hidden]) button')].map((b, k) => ({ el: b.querySelector('span:last-child'), before: 'Choice ' + (k + 1) })));
      const readQ = root.querySelector('#read-q');
      if (readQ) readQ.addEventListener('click', () => { const on = COACH.readAlong(readItems(), () => readQ.setAttribute('aria-pressed', 'false')); readQ.setAttribute('aria-pressed', String(on)); });
      if (S.get().profile.autoRead && window.COACH && phase === 'fresh' && lastSpoken !== it) {
        lastSpoken = it;
        if (COACH.readAlong && COACH.canSpeak()) { if (readQ) readQ.setAttribute('aria-pressed', 'true'); COACH.readAlong(readItems(), () => readQ && readQ.setAttribute('aria-pressed', 'false')); }
        else COACH.say(q.prompt + (q.type === 'choice' && root.querySelector('#choices:not([hidden])') ? '<p>The choices are:</p>' + q.choices.map((c, k) => `<p>${k + 1}: ${c}</p>`).join('') : ''));
      }
      const wb = root.querySelector('#work-box');
      if (wb) {
        STEPS.box(wb, { first: workEq(it), lines: workLines, onCheck(res, lines) { workLines = lines; const r0 = s.results[s.i]; if (res.some(x => x.status === 'solved') && !(r0 && r0.hinted)) E.useHint(s); } });
        root.querySelector('#work').addEventListener('toggle', ev => { workOpen = ev.target.open; });
      }
      const done = phase === 'done';
      tutorCtx({
        course: (A.whereIs(it.skillId) || { course: { title: '' } }).course.title, skill: plain(def.title),
        question: plain(q.prompt), choices: q.type === 'choice' ? q.choices.map(plain) : null,
        steps: (done ? q.hints : q.hints.slice(0, Math.min(1, q.hints.length - 1))).map(plain), answer: plain(A.answerText(q)), answerShown: done,
        studentAnswer: lastInput && !(r && r.correct) ? lastInput : (q.type === 'choice' && lastSaid && !(r && r.correct) && r && r.tries ? lastSaid : ''),
      });
      bindExplain(root.querySelector('#feedback') || root);
      const ask = root.querySelector('#ask-tutor');
      if (ask) ask.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: done ? 'Explain how to get this answer, step by step.' : 'Give me a hint for this question, without telling me the answer.' }));
      wireHands(q);
      updatePreview();
      if (ink) { const slot = root.querySelector('#ink-slot'); if (slot) slot.replaceWith(ink); }
      setFocus(!!playerPref().focus);
      // going on by itself after a right answer (an option); a tap or a key first keeps the answer on screen
      if (done && r && r.correct && playerPref().auto && !s.outOfLives && !relaxed) startAuto();
    }
    /** focus mode: the menus hide while a question is on screen (and come back on any other page) */
    function setFocus(on) { document.documentElement.classList.toggle('pc-focus', !!on && root.isConnected && root.__session === s && !E.isDone(s)); }
    let autoStop = null;
    function startAuto() {
      if (autoStop) autoStop();
      const nx = root.querySelector('#next');
      if (!nx) return;
      nx.classList.add('auto-go');
      const at = s.i;
      const stop = () => { clearTimeout(autoNext); nx.classList.remove('auto-go'); root.removeEventListener('pointerdown', onAny, true); root.removeEventListener('keydown', onAny, true); autoStop = null; };
      const onAny = ev => { if (!(ev.target && ev.target.closest && ev.target.closest('#next'))) stop(); };
      root.addEventListener('pointerdown', onAny, true); root.addEventListener('keydown', onAny, true);
      autoStop = stop;
      autoNext = setTimeout(() => { stop(); if (root.isConnected && root.__session === s && s.i === at && phase === 'done' && !document.hidden) doNext(); }, 1800);
    }
    /* ---------- answering by hand ---------- */
    function wireHands(q) {
      const box = root.querySelector('#hands'), sp = handsOf(q);
      if (!box || !sp || phase === 'done') return;
      const changed = () => { handsTouched = true; lastPick = 'hands'; const c = root.querySelector('#check'); if (c) c.disabled = !hasInput(q); };
      if (sp.kind === 'order') wireOrder(box, sp, changed);
      else if (sp.kind === 'grid') wireGrid(box, sp, changed);
      else wireLine(box, sp);
    }
    function wireOrder(box, sp, changed) {
      const list = box.querySelector('.order-list');
      const redraw = focusAt => { box.innerHTML = orderHtml(sp, handsVal, false); wireOrder(box, sp, changed); changed(); if (focusAt != null) { const li = box.querySelectorAll('.order-item')[focusAt]; if (li) li.focus({ preventScroll: true }); } };
      const move = (from, to) => { if (to < 0 || to >= handsVal.length || to === from) return false; const v = handsVal.slice(), x = v.splice(from, 1)[0]; v.splice(to, 0, x); handsVal = v; return true; };
      list.querySelectorAll('.order-item').forEach(li => {
        li.addEventListener('keydown', ev => {
          const i = Number(li.dataset.i), d = /^Arrow(Up|Left)$/.test(ev.key) ? -1 : /^Arrow(Down|Right)$/.test(ev.key) ? 1 : 0;
          if (!d) return;
          ev.preventDefault(); ev.stopPropagation();
          if (move(i, i + d)) { redraw(i + d); live(`${plain(handsVal[i + d])}, place ${i + d + 1} of ${handsVal.length}`); }
        });
        li.addEventListener('pointerdown', ev => {
          if (ev.button > 0) return;
          const items = [...list.children], from = items.indexOf(li), rects = items.map(x => x.getBoundingClientRect()), y0 = ev.clientY;
          const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 8, h = rects[from].height + gap;
          let to = from, moved = false;
          try { li.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
          li.classList.add('dragging');
          const onMove = e => {
            const dy = e.clientY - y0;
            if (Math.abs(dy) > 4) moved = true;
            li.style.transform = `translateY(${dy}px)`;
            const mid = rects[from].top + rects[from].height / 2 + dy;
            to = rects.filter((r, j) => j !== from && mid > r.top + r.height / 2).length;
            items.forEach((x, j) => { if (j === from) return; const sh = from < j && j <= to ? -h : to <= j && j < from ? h : 0; x.style.transform = sh ? `translateY(${sh}px)` : ''; });
          };
          const onUp = () => {
            li.removeEventListener('pointermove', onMove); li.removeEventListener('pointerup', onUp); li.removeEventListener('pointercancel', onUp);
            items.forEach(x => { x.style.transform = ''; }); li.classList.remove('dragging');
            if (moved && move(from, to)) { redraw(to); live(`${plain(handsVal[to])}, place ${to + 1} of ${handsVal.length}`); } else li.focus({ preventScroll: true });
          };
          li.addEventListener('pointermove', onMove); li.addEventListener('pointerup', onUp); li.addEventListener('pointercancel', onUp);
        });
      });
    }
    function wireGrid(box, sp, changed) {
      const svg = box.querySelector('.grid-pick');
      if (!svg) return;
      const u = Number(svg.dataset.u), pad = Number(svg.dataset.pad), W = 320, lo = sp.min, hi = sp.max;
      const clamp = v => Math.max(lo, Math.min(hi, v));
      const toPt = ev => { const r = svg.getBoundingClientRect(), k = W / r.width; return [clamp(Math.round(((ev.clientX - r.left) * k - pad) / u) + lo), clamp(Math.round((W - pad - (ev.clientY - r.top) * k) / u) + lo)]; };
      const set = (p, keys) => {
        const sw = box.querySelector('#hands-switch'), swHtml = sw ? sw.outerHTML : '';
        handsVal = p; box.innerHTML = gridHtml(sp, handsVal, false, swHtml); wireGrid(box, sp, changed); changed();
        const nsw = box.querySelector('#hands-switch'); if (nsw) nsw.addEventListener('click', switchHands);
        if (keys) box.querySelector('.grid-pick').focus({ preventScroll: true });
      };
      const hover = svg.querySelector('.gr-hover');
      svg.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; const p = toPt(ev); hover.setAttribute('cx', pad + (p[0] - lo) * u); hover.setAttribute('cy', W - pad - (p[1] - lo) * u); });
      svg.addEventListener('pointerleave', () => { hover.setAttribute('cx', -50); });
      svg.addEventListener('click', ev => set(toPt(ev)));
      svg.addEventListener('keydown', ev => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
        if (!d) return;
        ev.preventDefault(); ev.stopPropagation();
        const p = handsVal ? handsVal : [clamp(0), clamp(0)];
        set(handsVal ? [clamp(p[0] + d[0]), clamp(p[1] + d[1])] : p, true);
      });
    }
    function wireLine(box, sp) {
      const svg = box.querySelector('.nline');
      if (!svg) return;
      const u = Number(svg.dataset.u), pad = Number(svg.dataset.pad), W = Number(svg.dataset.w);
      const X = x => pad + (x - sp.min) / sp.step * u, clamp = v => Math.max(sp.min, Math.min(sp.max, v));
      const at = ev => { const r = svg.getBoundingClientRect(); return clamp(+(sp.min + Math.round(((ev.clientX - r.left) * W / r.width - pad) / u) * sp.step).toFixed(6)); };
      // the marker moves without redrawing, so a drag keeps going
      svg.__place = v => {
        const g = svg.querySelector('.nl-mark'), j = svg.querySelector('.nl-jump');
        if (g) { g.setAttribute('transform', `translate(${X(v)} 44)`); g.querySelector('text').textContent = signed(v); }
        if (j) j.setAttribute('d', sp.start != null && v !== sp.start ? `M${X(sp.start)} 30 Q${(X(sp.start) + X(v)) / 2} 8 ${X(v)} 30` : '');
        svg.setAttribute('aria-valuenow', v); svg.setAttribute('aria-valuetext', signed(v));
      };
      const set = v => {
        handsVal = v; svg.__place(v);
        const a = root.querySelector('#ans');
        if (a && A.parseNumber(a.value) !== v) { pushUndo(); a.value = String(v); a.dispatchEvent(new Event('input', { bubbles: true })); }
      };
      let dragging = false;
      svg.addEventListener('pointerdown', ev => { if (ev.button > 0) return; dragging = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ } set(at(ev)); });
      svg.addEventListener('pointermove', ev => { if (dragging) set(at(ev)); });
      ['pointerup', 'pointercancel'].forEach(t => svg.addEventListener(t, () => { dragging = false; }));
      svg.addEventListener('keydown', ev => {
        const cur = Number(svg.getAttribute('aria-valuenow')), big = sp.label * sp.step;
        const v = { ArrowLeft: cur - sp.step, ArrowDown: cur - sp.step, ArrowRight: cur + sp.step, ArrowUp: cur + sp.step, PageDown: cur - big, PageUp: cur + big, Home: sp.min, End: sp.max }[ev.key];
        if (v == null) return;
        ev.preventDefault(); ev.stopPropagation();
        set(clamp(+v.toFixed(6)));
      });
    }
    /** the equation a "Solve…" question asks about, for the step checker (practice only, not tests) */
    function workEq(it) {
      if (!s.hints || phase === 'done' || !window.STEPS) return null;
      if (it.eqn === undefined) it.eqn = STEPS.fromQuestion(it.q);
      return it.eqn;
    }
    function currentInput(q) {
      if (q.type === 'choice') { const sp = lastPick === 'hands' ? handsOf(q) : null; return sp && handsVal != null ? sp.value(handsVal) : selected; }
      const el = root.querySelector('#ans');
      return el ? el.value : '';
    }
    function hasInput(q) {
      if (q.type === 'choice') return lastPick === 'hands' ? handsTouched && handsVal != null : selected != null;
      return String(currentInput(q)).trim().length > 0;
    }
    /** the answer box as it was, kept before each key so Undo can put it back */
    function pushUndo() { const a = root.querySelector('#ans'); if (!a) return; undo.push({ v: a.value, a: a.selectionStart, e: a.selectionEnd }); if (undo.length > 80) undo.shift(); }
    function undoState() { const b = root.querySelector('.ans-key[data-key="undo"]'); if (b) b.disabled = !undo.length; }
    function updatePreview() {
      const pv = root.querySelector('#ans-preview'), a = root.querySelector('#ans');
      if (!pv || !a) return;
      const show = /[/^√]/.test(a.value) && phase !== 'done';
      pv.hidden = !show;
      pv.innerHTML = show ? previewHtml(a.value) : '';
    }
    const live = msg => { const l = root.querySelector('#hands-live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); } };
    /** a key of the keypad (or a written character): typed at the cursor, with Undo, Clear and the fraction template */
    function typeKey(k) {
      const ans = root.querySelector('#ans');
      if (!ans || ans.disabled) return;
      if (k === '−') k = '-';
      const v = ans.value, a = ans.selectionStart == null ? v.length : ans.selectionStart, e = ans.selectionEnd == null ? v.length : ans.selectionEnd;
      const at = (val, c) => { ans.value = val; ans.setSelectionRange(c, c); };
      if (k === 'undo') { const st = undo.pop(); if (!st) return; ans.value = st.v; try { ans.setSelectionRange(st.a, st.e); } catch (x) { /* fine */ } }
      else {
        pushUndo();
        if (k === 'del') { const from = a === e ? Math.max(0, a - 1) : a; at(v.slice(0, from) + v.slice(e), from); }
        else if (k === 'clear') at('', 0);
        else if (k === 'frac') {
          // a fraction template: after a number it starts the bottom; on its own it makes an empty fraction and
          // fills the top first; pressed again it moves to the bottom
          const before = v.slice(0, a), after = v.slice(e), inFrac = /\/[\d.]*$/.test(before);
          if (after.startsWith('/')) { undo.pop(); ans.setSelectionRange(a + 1, a + 1); }
          else if (/\d$/.test(before) && !inFrac) at(before + '/' + after, a + 1);
          else if (!inFrac) at(before + '/' + after, a);
          else undo.pop();
        } else at(v.slice(0, a) + k + v.slice(e), a + k.length);
      }
      undoState();
      ans.dispatchEvent(new Event('input', { bubbles: true }));
      if (!ink) ans.focus({ preventScroll: true });
    }
    function showOpts(on) { optsOpen = on; const p = root.querySelector('#opts-panel'), b = root.querySelector('#opts-btn'); if (p) p.hidden = !on; if (b) b.setAttribute('aria-expanded', String(on)); }
    /** answer by hand, or from a list (kept on this device) */
    function switchHands() { const sp = handsOf(E.current(s).q), line = sp && sp.kind === 'line'; setDevicePref(line ? { line: !handsOn('line') } : { hands: !handsOn() }); render(); const t = root.querySelector('#hands-switch'); if (t) t.focus(); }
    function bind(q) {
      const check = root.querySelector('#check'), next = root.querySelector('#next'), hint = root.querySelector('#hint'), giveup = root.querySelector('#giveup');
      const ans = root.querySelector('#ans');
      if (ans) {
        if (phase === 'done') ans.disabled = true; else if (!asking && !flagOpen && !root.querySelector('#hands .grid-pick')) setTimeout(() => ans.focus({ preventScroll: true }), 0);
        ans.addEventListener('beforeinput', pushUndo);
        ans.addEventListener('input', () => {
          draft = ans.value; if (check) check.disabled = !hasInput(q);
          undoState(); updatePreview();
          const sp = handsOf(q); if (sp && sp.kind === 'line') { const svg = root.querySelector('.nline'); if (svg && svg.__place) svg.__place(lineValue(sp)); }
        });
        // what was typed stays after a wrong answer (or a redraw), so only the slip needs fixing
        const fill = draft != null ? draft : lastInput;
        if (q.type !== 'choice' && typeof fill === 'string') { ans.value = fill; if (check) check.disabled = !hasInput(q); }
      }
      const padBtn = root.querySelector('#pad-toggle');
      if (padBtn) padBtn.addEventListener('click', () => { setDevicePref({ pad: !padOn() }); render(); });
      root.querySelectorAll('.ans-key').forEach(b => b.addEventListener('click', () => typeKey(b.dataset.key)));
      const on = (id, fn) => { const b = root.querySelector('#' + id); if (b) b.addEventListener('click', fn); };
      on('ink-toggle', () => { const want = !ink; setDevicePref({ ink: want }); ink = want ? inkPad(typeKey) : null; render(); });
      on('show-how', doShowHow);
      on('show-step', () => {
        // straight to the step after the one the answer stopped at (it counts as a hint)
        const q0 = E.current(s).q, b = root.querySelector('#show-step'), upto = Math.min(q0.hints.length, Number(b.dataset.step));
        E.useHint(s); animFrom = hintsShown; hintsShown = Math.max(hintsShown, upto);
        if (hintsShown >= q0.hints.length) { E.reveal(s); phase = 'done'; }
        lastFeedback = note(T(phase === 'done' ? (s.kind === 'spot' ? 'Here is how it’s done.' : 'Here is how it’s done. This question comes back in Review.') : `Here is step ${upto}. Carry on from there, then check.`));
        render();
      });
      // the hints: simpler words, the lesson paragraph a step uses, a picture (focus stays on the button pressed)
      const refocus = sel => setTimeout(() => { const b = root.querySelector(sel); if (b) b.focus({ preventScroll: true }); }, 5);
      root.querySelectorAll('[data-plain]').forEach(b => b.addEventListener('click', () => { const k = Number(b.dataset.plain); if (plainer.has(k)) plainer.delete(k); else plainer.add(k); render(); refocus(`[data-plain="${k}"]`); }));
      root.querySelectorAll('[data-lesson]').forEach(b => b.addEventListener('click', () => { const k = Number(b.dataset.lesson); if (fromLesson.has(k)) fromLesson.delete(k); else fromLesson.add(k); render(); refocus(`[data-lesson="${k}"]`); }));
      on('hint-pic', () => { picture = !picture; render(); refocus('#hint-pic'); });
      // a worked example beside the question, kept open or closed on this device
      on('side-btn', () => { sideOpen = !sideOpen; setDevicePref({ side: sideOpen }); render(); refocus(sideOpen ? '#side-new' : '#side-btn'); });
      on('side-btn2', () => { sideOpen = !sideOpen; setDevicePref({ side: sideOpen }); render(); refocus('#side-btn2'); });
      on('side-new', () => { sideN += 1; render(); refocus('#side-new'); });
      on('side-close', () => { sideOpen = false; setDevicePref({ side: false }); render(); refocus(root.querySelector('#side-btn').offsetParent ? '#side-btn' : '#side-btn2'); });
      // why does that work? the rule to compare with, and the learner's words kept in the skill's notes
      on('why-compare', () => { const w = root.querySelector('#why-rule'); if (w) w.hidden = false; const ww = root.querySelector('#why-words'); if (ww && !ww.value.trim()) ww.placeholder = 'You can still write it in your own words…'; });
      on('why-save', () => {
        const ww = root.querySelector('#why-words'), t = ww ? ww.value.trim() : '';
        if (!t) { toast('Write a few words first.'); if (ww) ww.focus(); return; }
        const sid = E.current(s).skillId, before = S.note(sid);
        S.setNote(sid, (before ? before.replace(/\s+$/, '') + '\n\n' : '') + 'Why it works: ' + t);
        const w = root.querySelector('#why-rule'); if (w) w.hidden = false;
        toast('Saved to your notes on this skill.');
      });
      on('skip', doSkip);
      on('pause', doPause);
      on('scratch-btn', () => { scratchOpen = !scratchOpen; render(); });
      on('similar', () => { if (E.similar(s)) doNext(); });
      on('hands-switch', switchHands);
      // "I don't know": before anything was tried, it asks first (a placement check never asks)
      on('giveup-yes', () => { asking = false; doGiveUp(); });
      on('giveup-no', () => { asking = false; render(); const f = root.querySelector('#ans, #hands .order-item, #hands .grid-pick, #choices:not([hidden]) button'); if (f) f.focus(); });
      // the set's length, before the first answer: 5, 7 or 10
      root.querySelectorAll('[data-len]').forEach(b => b.addEventListener('click', () => {
        const n = Number(b.dataset.len);
        setPlayerPref({ len: n });
        if (n !== s.items.length) exercise(root, E.start('practice', { skillId: s.skillId, n }), Object.assign({}, opts, { resumed: true }));
        const nb = root.querySelector(`[data-len="${n}"]`); if (nb) nb.focus();
      }));
      // options: sound, a timer, going on by itself, focus mode
      on('opts-btn', () => { showOpts(!optsOpen); if (optsOpen) { const f = root.querySelector('#opts-panel input'); if (f) f.focus(); } });
      const opt = (id, fn) => { const el = root.querySelector('#' + id); if (el) el.addEventListener('change', () => fn(el.checked)); };
      opt('sound', v => { setPlayerPref({ sound: v }); chime(true); });
      opt('opt-timer', v => { setPlayerPref({ timer: v }); render(); });
      opt('opt-auto', v => { setPlayerPref({ auto: v }); if (v && phase === 'done' && s.results[s.i] && s.results[s.i].correct) startAuto(); });
      opt('opt-focus', v => { setPlayerPref({ focus: v }); setFocus(v); });
      opt('opt-why', v => setPlayerPref({ why: v }));
      const fbSel = root.querySelector('#opt-fb');
      if (fbSel) fbSel.addEventListener('change', () => { setPlayerPref({ fbLang: fbSel.value }); toast(fbSel.value === 'en' ? 'Feedback in English' : `Feedback in ${LANG.NAMES[fbSel.value]} from the next answer`); });
      opt('opt-es', v => { setPlayerPref({ es: v }); render(); const b = root.querySelector('#opt-es'); if (b) b.focus(); });
      // flag a confusing question: kept with the learner's progress (profile.flagged) for a grown-up to check
      on('flag-btn', () => { flagOpen = !flagOpen; render(); if (flagOpen) { const f = root.querySelector('#flag-why [aria-checked="true"]'); if (f) f.focus(); } else { const b = root.querySelector('#flag-btn'); if (b) b.focus(); } });
      root.querySelectorAll('#flag-why button').forEach(b => b.addEventListener('click', () => root.querySelectorAll('#flag-why button').forEach(x => x.setAttribute('aria-checked', String(x === b)))));
      const fn = root.querySelector('#flag-note');
      if (fn) fn.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); root.querySelector('#flag-save').click(); } });
      on('flag-cancel', () => { flagOpen = false; render(); const b = root.querySelector('#flag-btn'); if (b) b.focus(); });
      const flagList = () => (S.get().profile.flagged || []).filter(f => f && f.skill);
      on('flag-save', () => {
        const it = E.current(s), why = (root.querySelector('#flag-why [aria-checked="true"]') || {}).dataset || {}, note = (root.querySelector('#flag-note') || {}).value || '';
        const entry = { skill: it.skillId, seed: it.seed, why: why.v || 'confusing', note: note.trim().slice(0, 300), t: Date.now() };
        S.setProfile({ flagged: [entry].concat(flagList().filter(f => !(f.skill === it.skillId && f.seed === it.seed))).slice(0, 40) });
        if (!flaggedHere.includes(it)) flaggedHere.push(it);
        flagOpen = false; render(); toast('Flagged. Thanks for telling us.');
        const b = root.querySelector('#flag-btn'); if (b) b.focus();
      });
      on('flag-remove', () => {
        const it = E.current(s);
        S.setProfile({ flagged: flagList().filter(f => !(f.skill === it.skillId && f.seed === it.seed)) });
        flaggedHere.splice(flaggedHere.indexOf(it) >>> 0, flaggedHere.includes(it) ? 1 : 0);
        flagOpen = false; render(); toast('The flag is off.');
      });
      root.querySelectorAll('#choices button').forEach(b => {
        if (phase === 'done') {
          b.disabled = true;
          const k = Number(b.dataset.k);
          if (k === q.answerIndex) b.classList.add('is-right');
          else if (k === selected) b.classList.add('is-wrong');
        } else b.addEventListener('click', () => { selected = Number(b.dataset.k); lastPick = 'list'; root.querySelectorAll('#choices button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.k) === selected))); if (check) check.disabled = false; });
      });
      if (check) check.addEventListener('click', doCheck);
      if (next) { next.addEventListener('click', doNext); setTimeout(() => next.focus(), 0); }
      if (hint) hint.addEventListener('click', doHint);
      if (giveup) giveup.addEventListener('click', () => {
        const r0 = s.results[s.i];
        if (s.kind === 'placement' || (r0 && r0.tries)) return doGiveUp();
        asking = true; render();
        const y = root.querySelector('#giveup-no'); if (y) y.focus();
      });
      const stop = root.querySelector('#stop');
      if (stop) stop.addEventListener('click', summary);
    }
    let lastInput = null, draft = null, lastSaid = '';
    /** "fraction", "decimal", "percent" or "whole": how a number was written */
    const formOf = t => (/%/.test(t) ? 'percent' : /\//.test(t) ? 'fraction' : /\d\.\d|^\.\d/.test(t) ? 'decimal' : 'whole');
    const PRAISE = ['Well done.', 'Nicely done.', 'Good work.', 'That’s it.'];
    /* feedback in the learner's language (an option; it follows the menus' language unless chosen): fixed phrases come
       from lib/lang.js (phrases with numbers in them through its patterns). A message translated here is marked data-raw,
       so the menus' own translation leaves it alone. */
    const fbLang = () => { const p = playerPref().fbLang; return p && p !== 'auto' ? p : (window.LANG ? LANG.get() : 'en'); };
    const T = t => { const c = fbLang(); return c !== 'en' && window.LANG ? LANG.tr(t, c) || t : t; };
    const fbAttr = () => ` data-raw lang="${fbLang()}"`;
    const note = html => `<div class="feedback note"${fbAttr()}>${icon('info')}<span>${html}</span></div>`;
    /** the right-or-wrong banner: a large icon, a word and a line (gentle: after a few tries, a calmer look) */
    const verdict = (good, title, detail, gentle) => `<div class="feedback ${good ? 'good' : 'bad'} verdict${gentle ? ' gentle' : ''}"${fbAttr()}><span class="vd-ic">${icon(good ? 'check' : gentle ? 'info' : 'cross', 30)}</span><span class="vd-text"><b class="vd-title">${title}</b><span class="vd-detail">${detail}</span></span></div>`;
    /** partly right: which part, said kindly */
    const partText = p => (!p ? '' : p.which ? (p.right ? T(`Partly right: the ${p.which[0] ? 'x' : 'y'}-coordinate is right. Check the ${p.which[0] ? 'y' : 'x'}-coordinate.`) + ' ' : '') : p.right ? T(`Partly right: ${p.right} of ${p.of} ${p.right === 1 ? 'is' : 'are'} in the right place.`) + ' ' : '');
    /** questions missed in a row just before this one (finished ones only) */
    const missRun = () => { let n = 0; for (let k = s.i - 1; k >= 0; k--) { const x = s.results[k]; if (x && x.done && !E.counts(x)) n += 1; else break; } return n; };
    /** kinder words after repeated mistakes: on this question, or several questions in a row */
    function notQuite(tries) {
      if (tries >= 3) return { title: 'Let’s slow down', detail: 'This one’s tricky, and that’s okay. Show me how walks you through it, one step at a time.', gentle: true };
      if (tries === 2) return { title: 'Not yet', detail: 'That’s okay: tricky ones often take a few tries. A hint shows just the next step.', gentle: true };
      if (missRun() >= 2) return { title: 'Not quite', detail: 'A few in a row have been tricky, and that’s part of learning. Take a hint whenever you like.' };
      return { title: 'Not quite', detail: 'Fix your answer and try again, or see how it’s done.' };
    }
    /** after a right answer (an option): why does that work? Say it in your own words, then compare with the rule */
    function whyWorks() {
      if (!playerPref().why || relaxed || !s.hints) return '';
      const it = E.current(s), rule = E.ruleOf && E.ruleOf(it.skillId);
      if (!rule) return '';
      return `<details class="why-works" id="why-works"><summary>Why does that work?</summary><div class="ww-body"><p class="small">Say it in your own words first, then compare with the rule.</p>
        <textarea id="why-words" rows="2" maxlength="300" aria-label="Why it works, in your own words" placeholder="In my own words…"></textarea>
        <div class="btn-row"><button type="button" class="btn sm" id="why-compare">Compare with the rule</button><button type="button" class="btn sm ghost" id="why-save">Save to my notes</button></div>
        <div class="hint nudge rule-box" id="why-rule" hidden><div class="hn"><span>The rule</span></div><div class="rule-body">${rule}</div></div></div></details>`;
    }
    /** a sign slip: the learner's answer with its sign marked */
    const signShow = t => { const v = String(t || '').trim(), neg = /^[−-]/.test(v); return `<span class="sign-show" aria-hidden="true"><mark>${neg ? '−' : '+'}</mark>${esc(v.replace(/^[−+-]\s*/, ''))}</span>`; };
    function doCheck() {
      const q = E.current(s).q;
      if (!hasInput(q)) return;
      let input = currentInput(q), mathValue = null, unitOff = false, cleaned = String(input);
      if (q.type === 'number') {
        // read the answer as typed: "x = 5", a unit after the number, ½; a wrong unit or a decimal comma is said first
        const rd = E.readAnswer ? E.readAnswer(q, input) : { input };
        if (rd.stop) { lastFeedback = note(T(rd.stop)); render(); return; }
        input = rd.input; unitOff = !!rd.unit; cleaned = String(rd.input).trim();
        const raw = String(input).trim();
        // a percent where a number is asked for: 50% is checked as 0.5
        if (q.unit !== '%' && /%\s*$/.test(raw)) { const v = A.parseNumber(raw.replace(/%\s*$/, '')); if (isFinite(v)) input = String(+(v / 100).toPrecision(12)); }
        else if (isNaN(A.parseNumber(raw)) && /[\^√()²³]|sqrt/i.test(raw)) {
          // a power or a root: worked out where the answer is rounded anyway; elsewhere the number itself is wanted
          if (!E.mathKeys(q)) { lastFeedback = note(T('Work it out to one number first, like <b>12</b>. The box takes a single number.')); render(); return; }
          const v = E.typedValue(raw);
          if (isFinite(v)) { mathValue = v; input = String(v); }
        }
      }
      const viaHands = q.type === 'choice' && lastPick === 'hands' && handsVal != null;
      if (viaHands && typeof input === 'number') selected = input;
      const res = E.answer(s, input);
      lastInput = q.type === 'choice' ? null : String(currentInput(q));
      const said = q.type === 'choice' ? (viaHands ? handsOf(q).said(handsVal) : plain(q.choices[selected])) : lastInput;
      lastSaid = said;
      const r = s.results[s.i];
      if (!res.correct && !res.unreadable && r) r.said = said;     // kept with the question for Review
      if (!res.unreadable) chime(!!res.correct);
      // the coach: what this wrong answer probably means (never the answer itself)
      const slip = !res.correct && !res.unreadable && window.COACH ? COACH.diagnose(q, q.type === 'choice' ? (typeof input === 'number' ? input : null) : (mathValue != null ? String(mathValue) : String(input))) : null;
      if (slip) { S.noteMistake(slip.kind, E.current(s).skillId); if (s.results[s.i]) s.results[s.i].slip = slip.kind; }      // kept with the question for Review
      lastSlip = slip ? slip.kind : null;
      // a wrong choice the coach can't name: why that choice isn't it, where the device can tell without giving the answer away
      const whyNot = !slip && !res.correct && q.type === 'choice' && !viaHands && typeof input === 'number' && window.COACH && COACH.whyChoice ? COACH.whyChoice(q, input, s.hints) : null;
      const stepBtn = slip && slip.kind === 'early' && slip.step != null && s.hints && hintsShown < q.hints.length ? `<button class="btn sm" type="button" id="show-step" data-step="${slip.step + 2}">Show step ${Math.min(slip.step + 2, q.hints.length)}</button>` : '';
      const coachNote = slip || whyNot ? `<div class="coach-note"${fbAttr()}>${slip && slip.kind === 'sign' ? signShow(said) : ''}<span>${esc(T(slip ? slip.msg : whyNot))}</span></div>${stepBtn ? `<div class="btn-row" style="margin-top:8px">${stepBtn}</div>` : ''}` : '';
      if (!res.correct && !res.unreadable && workEq(E.current(s))) workOpen = true;          // a solving question: show your work, step by step
      const noticed = slip ? ' Procademy noticed: ' + slip.msg : '';
      if (res.unreadable) { lastFeedback = note(T(E.formatTip ? E.formatTip(q, String(input)) : 'That doesn’t look like a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.')); render(); return; }
      if (res.correct) {
        phase = 'done'; r.done = true;
        // the same number in another form is right too, and says so: 1/2 is the same as 0.5; √85 is about 9.2
        const shown = q.type === 'number' ? plain(A.answerText(q)).replace(/\s+\S*[a-z]\S*$/i, '') : '', typed = (lastInput || '').trim();
        const same = mathValue != null ? ` ${esc(typed)} is ${Math.abs(mathValue - q.answer) < 1e-9 ? '' : 'about '}${esc(shown)}.` : q.type === 'number' && cleaned && formOf(cleaned) !== formOf(shown) ? ` ${esc(cleaned)} is the same as ${esc(shown)}.` : '';
        // a fraction that isn't in simplest form is right, with a nudge to simplify; a unit typed after it is fine too
        const simp = q.type === 'number' && E.simplifyNote ? E.simplifyNote(q, cleaned) : '';
        lastFeedback = verdict(true, T('Correct'), `${T(r.hinted ? 'You got there with a hint.' : r.tries > 1 ? 'Right on your second try.' : PRAISE[s.i % PRAISE.length])}${same}`) +
          (simp ? `<p class="fb-extra">${icon('info', 16)}<span>${simp}</span></p>` : '') + (unitOff ? `<p class="fb-extra"${fbAttr()}>${icon('info', 16)}<span>${T('The unit is already beside the box, so the number on its own is fine.')}</span></p>` : '') + whyWorks();
        if (hintsShown < q.hints.length) lastFeedback += `<details style="margin-top:10px"><summary class="muted small">View the steps</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      } else if (s.hints) {
        const nq = notQuite(r.tries);
        lastFeedback = verdict(false, T(nq.title), `${partText(res.part)}${T(nq.detail)}`, nq.gentle) + coachNote +
          `<div class="btn-row" style="margin-top:8px">${hintsShown < q.hints.length ? '<button class="btn sm" type="button" id="show-how">Show me how</button>' : ''}${explainBtn('Why is that wrong?', 'I answered ' + said + '. Why is that wrong? Help me find my mistake, but don’t tell me the answer yet.' + noticed)}</div>`;
      } else {
        phase = 'done'; E.reveal(s); r.revealed = true;
        if (outOfLives()) s.outOfLives = true;
        const lives = s.outOfLives ? ' ' + T('That was your last life.') : s.lives ? ' ' + T(`${s.lives - misses()} ${s.lives - misses() === 1 ? 'life' : 'lives'} left.`) : '';
        lastFeedback = verdict(false, T('Not quite'), `${partText(res.part)}${T(`The answer is <b>${A.answerText(q)}</b>.`)}${lives}${missRun() >= 2 && !s.lives ? ' ' + T('Each question is a fresh start.') : ''}`) + coachNote +
          `<div class="btn-row" style="margin-top:8px">${explainBtn('Explain my mistake', 'I answered ' + said + ', but the answer is ' + plain(A.answerText(q)) + '. What did I do wrong?' + noticed)}</div>
          <details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      }
      render();
    }
    function doHint() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      if (!nudged) { nudged = true; animNudge = true; render(); return; }               // the first rung is free: the rule this skill uses
      E.useHint(s);
      animFrom = hintsShown;
      hintsShown += 1;
      if (hintsShown === q.hints.length) { E.reveal(s); phase = 'done'; lastFeedback = note(T(s.kind === 'spot' ? 'That’s the last step. Read it through, then move on.' : 'That’s the last step. Read it through, then move on; this question will come back in Review.')); }
      render();
      sayHints(q.hints.slice(hintsShown - 1, hintsShown));
    }
    /** with "Read questions aloud" on, a new hint is read aloud too */
    function sayHints(list) { if (list.length && S.get().profile.autoRead && window.COACH && COACH.canSpeak()) COACH.say(list.join('<p></p>')); }
    /** after a wrong answer: every step but the last, so the learner finishes it (it counts as a hint) */
    function doShowHow() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      const before = hintsShown;
      E.useHint(s);
      animFrom = hintsShown;
      hintsShown = Math.max(hintsShown + 1, q.hints.length - 1);
      if (hintsShown >= q.hints.length) { E.reveal(s); phase = 'done'; }
      lastFeedback = note(T(phase === 'done' ? (s.kind === 'spot' ? 'Here is how it’s done. Read it through, then move on.' : 'Here is how it’s done. Read it through, then move on; this question comes back in Review.') : 'Here are the steps up to the last one. Finish it yourself, then check.'));
      render();
      sayHints(q.hints.slice(before, hintsShown));
    }
    /** a new question: everything about the last one is put away */
    function fresh() {
      hintsShown = 0; selected = null; phase = 'fresh'; lastFeedback = ''; lastInput = null; draft = null; workLines = null; workOpen = false; scratch = null; nudged = relaxed;
      asking = false; flagOpen = false; optsOpen = false; handsVal = null; handsTouched = false; lastPick = null; undo = []; lastSaid = '';
      animFrom = -1; animNudge = false; plainer.clear(); fromLesson.clear(); picture = false; lastSlip = null; sideN = 0;
      if (ink && ink.__clear) ink.__clear();
    }
    function doSkip() {
      if (!E.skip(s)) return;
      fresh();
      toast('Skipped for now. It comes back at the end.');
      render();
    }
    function doPause() {
      setPaused(pauseKey, E.pack(s));
      tutorCtx(null);
      toast('Paused. Open this set again to pick up where you left off.');
      location.hash = opts.back || '#/';
    }
    function doGiveUp() {
      const q = E.current(s).q;
      E.reveal(s); phase = 'done'; hintsShown = s.hints ? q.hints.length : 0;
      lastFeedback = note(T(`Here’s the answer: <b>${A.answerText(q)}</b>${s.hints ? '. The steps are below' : ''}.`) + (s.kind === 'spot' ? '' : ' ' + T('This question will come back in Review.'))) +
        (s.hints ? '' : `<details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`);
      render();
    }
    function doNext() {
      if (endless) {
        // every PRACTICE_N answers are saved as a set; a level gained shows at once
        if (s.i + 1 - s.saved >= E.PRACTICE_N) { const f = E.saveEndless(s); const up = f && f.changes.find(c => c.to > c.from); if (up) toast(`Level raised: ${plain(A.skills[up.skillId].title)} is now ${A.LEVELS[up.to]}`); if (window.APP) window.APP.refreshStats(); }
        if (s.i + 1 >= s.items.length) E.more(s);
      }
      if (s.outOfLives || timeUp()) return summary();
      E.next(s);
      fresh();
      render();
      window.scrollTo(0, 0);
    }
    function summary() {
      stopClock(); clearTimeout(autoNext); if (autoStop) autoStop();
      document.documentElement.classList.remove('pc-focus');
      if (s.stopwatch && !s.ms) s.ms = Date.now() - t0;
      if (limitMs && timeUp()) s.timedOut = true;
      const f = endless ? E.stopEndless(s) : E.finish(s);
      if (canPause && pausedAll()[pauseKey]) setPaused(pauseKey, null);          // a paused copy of this set is done with
      if (opts.onFinish) { try { opts.onFinish(s, f); } catch (e) { console.error(e); } }
      tutorCtx(null);
      if (window.APP) window.APP.refreshStats();
      if (opts.result) return opts.result(s, f);              // a page with its own result screen (the placement check)
      const ratio = f.total ? f.right / f.total : 0;
      // the same questions for a friend: practice sets and CPM lesson sets have a seed that rebuilds them
      const vsInfo = s.kind === 'practice' ? { k: 'p', id: s.skillId, seed: s.seed, score: f.right, total: f.total }
        : s.kind === 'mix' && s.cpm && s.cpm.lesson ? { k: 'l', book: s.cpm.book, lesson: s.cpm.lesson, seed: s.seed, score: f.right, total: f.total } : null;
      const testout = s.kind === 'testout';
      const head = endless ? 'Session complete' : testout ? (ratio === 1 ? 'You tested out' : 'Not quite yet') : s.kind === 'boss' ? (f.beaten ? 'Boss beaten' : 'The boss won this time') : s.kind === 'weekly' ? (f.solved ? 'Challenge solved' : 'Not this time') : s.kind === 'speed' && f.newBest ? 'A new best' : s.timedOut && ratio < 1 ? 'Time’s up' : ratio === 1 ? 'Excellent work' : ratio >= 0.7 ? 'Nice work' : 'Keep practicing';
      const best = s.kind === 'speed' ? (S.get().profile.best || {})[s.skillId] : null;
      const extraLine = s.kind === 'speed' ? `<p class="sum-extra">Your time: <b>${clockText(s.ms)}</b>, ${f.right} of ${f.total} right.${best && !f.newBest ? ` Your best is ${clockText(best.ms)} with ${best.right} right.` : f.newBest ? ' That’s your best yet.' : ''} More right answers beat a faster time.</p>`
        : s.kind === 'boss' ? `<p class="sum-extra">${f.beaten ? `You beat the boss of this unit with ${s.lives - misses()} ${s.lives - misses() === 1 ? 'life' : 'lives'} to spare.` : s.outOfLives ? `Three misses ended it at question ${s.i + 1} of ${f.total}. Practice the unit’s skills, then try again.` : 'Three or more misses this time. Practice the unit’s skills, then try again.'}</p>`
        : s.kind === 'weekly' ? `<p class="sum-extra">${f.solved ? 'Nicely done. A new challenge comes every Monday.' : 'Read the steps below, then try again next week; a new challenge comes every Monday.'}</p>`
        : s.timedOut ? `<p class="sum-extra">Time’s up: ${plural(s.items.filter((it, k) => s.results[k] && s.results[k].done).length, 'question')} answered in ${clockText(limitMs)}.${s.kind === 'quiz' ? ' Questions you didn’t reach don’t count as mistakes.' : ''}</p>` : '';
      // a practice test for a chapter: the lessons to look at again before the real one
      const lessonsToReview = s.kind === 'chapter-test' && s.cpm ? [...new Set(s.items.filter((it, k) => it.lesson && !E.counts(s.results[k])).map(it => it.lesson))] : [];
      const mastered = f.changes.filter(ch => ch.to === 4 && ch.from < 4);
      // the questions to look at again: each with what was answered and the right answer
      const missedHere = s.items.map((it, k) => ({ it, r: s.results[k] })).filter(x => (endless ? x.r && x.r.done : true) && !E.counts(x.r));
      const answerOf = q => (q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q));
      const clipQ = t => (t.length > 120 ? t.slice(0, 117).replace(/\s+\S*$/, '') + '…' : t);
      const prev = s.kind === 'practice' && ratio < 0.5 ? prevSkill(s.skillId) : null, savedMisses = S.get().missed.length;
      const changes = f.changes.map(ch => `<span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.skills[ch.skillId].title}: ${A.LEVELS[ch.from]} → <b>${A.LEVELS[ch.to]}</b></span>`).join('');
      // a perfect set is celebrated; the longest run of first-try answers is said; the time, when the timer was on
      const perfect = !endless && f.total >= 3 && f.right === f.total && !['placement', 'weekly', 'review'].includes(s.kind);
      const run = endless ? null : E.tally(s).best;
      const timed = selfTimer() ? clockText(Date.now() - t0) : '';
      // the next skill: after a practice set, a test out, beat your best, or unlimited practice of one skill;
      // it leads when the set went well
      let nextBtn = '';
      const goOn = ratio >= 0.7;
      if (s.skillId && (s.kind === 'practice' || s.kind === 'speed' || (endless && s.skills.length === 1 && f.total) || (testout && ratio === 1))) { const nx = nextSkill(s.skillId); if (nx && nx !== s.skillId) nextBtn = `<a class="btn${goOn ? ' primary' : ''}" href="${skillHref(nx)}">Next skill: ${A.skills[nx].title} →</a>`; }
      if (opts.next) nextBtn = `<a class="btn${goOn ? ' primary' : ''}" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;
      const againBtn = opts.again ? `<button class="btn${nextBtn && goOn ? '' : ' primary'}" id="again">${opts.againLabel || 'Practice again'}</button>` : '';
      root.innerHTML = `<div class="ex"><div class="card summary">
        <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(s.title)}</div>
        <h1 style="margin-top:6px">${head}</h1>
        <div class="score">${f.right} / ${f.total}</div>
        ${perfect ? `<div class="perfect-banner"><span class="pb-ic" aria-hidden="true">${icon('star', 26)}</span><span><b>A perfect set</b><span class="small">Every question right on the first try, with no hints</span></span></div>` : ''}
        ${mastered.length ? `<div class="mastered-banner"><span class="mb-medal" aria-hidden="true">${icon('medal', 28)}</span><span><b>Mastered</b><span class="small">${mastered.map(ch => A.skills[ch.skillId].title).join(', ')}</span></span></div>` : ''}
        <div class="what">${testout ? (ratio === 1 ? `Every question right with no hints, so ${A.skills[s.skillId].title} is Proficient now.` : `${f.right} of ${f.total} right. Practice the skill a little more, then try again.`) : endless ? (f.total ? `${plural(f.total, 'question')} answered, ${f.right} correct on the first try without a hint. Longest streak: ${f.best}.` : 'No questions were answered in this session.') : f.right === f.total ? (perfect ? '' : 'Every question right on the first try, with no hints.') : `${f.right} of ${f.total} correct on the first try without a hint.${s.kind === 'practice' && ratio < 1 ? ' Answer all ' + f.total + ' correctly to reach Proficient.' : ''}`}${!endless && !perfect && run >= 2 ? ` Longest streak: ${run} in a row.` : ''}${f.extras ? ` Plus ${plural(f.extras, 'similar question')}, ${f.extraRight} right on the first try.` : ''}${timed ? ` Time: ${timed}.` : ''}</div>
        ${extraLine}
        ${changes ? `<div class="changes">${changes}</div>` : (s.kind !== 'review' && s.kind !== 'weekly' ? `<p class="muted" style="margin-top:14px">No skill levels changed.</p>` : '')}
        ${lessonsToReview.length ? `<div class="sum-lessons"><h2>Lessons to look at before the test</h2><div class="btn-row" style="margin-top:6px">${lessonsToReview.map(l => { const f2 = A.cpmLesson(s.cpm.book, l); return f2 ? `<a class="chip-btn" href="#/cpm-practice/${s.cpm.book}/${encodeURIComponent(l)}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(f2.lesson) : l)}</a>` : ''; }).join('')}</div></div>` : ''}
        <div class="chip" style="font-size:1rem">+${fmt(f.pts)} points</div>
        <div class="btn-row">
          ${nextBtn && goOn ? nextBtn + againBtn : againBtn + nextBtn}
          <a class="btn" href="${opts.back || '#/'}">${esc(opts.backLabel || 'Back')}</a>
          ${window.WORKSHEET && WORKSHEET.sheet && f.total ? '<button class="btn ghost" type="button" id="print-set">Print this set</button>' : ''}
        </div>
        ${prev ? `<p class="small sum-note">Too hard? <a href="${skillHref(prev)}">Go back to ${A.skills[prev].title}</a> first.</p>` : ''}
        ${missedHere.length && s.kind !== 'placement' ? `<div class="sum-missed"><h2>To look at again</h2><ol>${missedHere.slice(0, 8).map(({ it, r }) => `<li><span class="sum-q">${esc(clipQ(plain(it.q.prompt)))}</span><span class="small muted">${r && r.said ? `You answered ${esc(r.said)}${r.part && r.part.right && !r.correct ? `, partly right (${r.part.right} of ${r.part.of})` : ''}. ` : ''}The answer is <b>${answerOf(it.q)}</b>.</span></li>`).join('')}</ol>${missedHere.length > 8 ? `<p class="small muted" style="margin:0">And ${missedHere.length - 8} more.</p>` : ''}
          <div class="btn-row" style="margin-top:10px"><button class="btn" type="button" id="redo-missed">Practice these again</button></div></div>` : ''}
        ${flaggedHere.length ? `<div class="sum-flags"><h2>${icon('flag', 18)} Flagged in this set</h2><ul>${flaggedHere.map(it => { const fl = (S.get().profile.flagged || []).find(x => x.skill === it.skillId && x.seed === it.seed); return `<li><span class="sum-q">${esc(clipQ(plain(it.q.prompt)))}</span>${fl ? `<span class="small muted">${esc((FLAG_WHY.find(w => w[0] === fl.why) || ['', ''])[1])}${fl.note ? `: ${esc(fl.note)}` : ''}</span>` : ''}</li>`; }).join('')}</ul><p class="small muted">Thanks for telling us. Flagged questions are kept with your progress so a grown-up can look at them.</p></div>` : ''}
        ${savedMisses >= 10 && s.kind !== 'review' ? `<p class="small sum-note">You have ${savedMisses} mistakes saved. A review day this week would clear them. <a href="#/review">Go to Review</a></p>` : ''}${opts.summaryExtra ? opts.summaryExtra(s, f) : ''}${vsInfo && window.CHALLENGE ? CHALLENGE.button(vsInfo, opts.challengeLabel) : ''}</div></div>`;
      if (window.CHALLENGE) CHALLENGE.wire(root);
      if (perfect || mastered.length || f.changes.some(ch => ch.to === 3 && ch.from < 3) || f.beaten || f.newBest || f.solved) celebrate(root.querySelector('.summary'), perfect || mastered.length || f.beaten ? 'big' : 'small');
      if (f.beaten && window.BADGES) BADGES.flag('boss');
      if (f.solved && window.BADGES) BADGES.flag('weekly');
      if (f.newBest && f.right === f.total && window.BADGES) BADGES.flag('best');
      const again = root.querySelector('#again');
      if (again) again.addEventListener('click', () => opts.again());
      const redo = root.querySelector('#redo-missed');
      if (redo) redo.addEventListener('click', () => exercise(root, E.start('review', { items: missedHere.map(x => ({ skill: x.it.skillId, seed: x.it.seed })), n: missedHere.length }), { back: opts.back, backLabel: opts.backLabel, resumed: true }));
      const pr = root.querySelector('#print-set');
      if (pr) pr.addEventListener('click', () => WORKSHEET.sheet(root, { title: plain(s.title), sub: `${plural(f.total, 'question')} from your practice`, items: (endless ? s.items.filter((it, k) => s.results[k] && s.results[k].done) : s.items).map(it => ({ q: it.q })), back: opts.back || '#/', backLabel: opts.backLabel || 'Back' }));
    }
    function timeUp() { return !!limitMs && Date.now() - t0 >= limitMs; }
    let clockTimer = 0;
    function stopClock() { clearInterval(clockTimer); clockTimer = 0; }
    // the on-screen timer for a self-paced set (an option): it counts while the set is open
    const selfTick = setInterval(() => {
      if (!root.isConnected || root.__session !== s || E.isDone(s)) return clearInterval(selfTick);
      const el = root.querySelector('#ex-timer');
      if (el) el.textContent = clockText(Date.now() - t0);
    }, 1000);
    if (limitMs || s.stopwatch) {
      clockTimer = setInterval(() => {
        const el = root.querySelector('#ex-clock');
        if (!root.isConnected || root.__session !== s || (endless ? s.stopped : s.finished)) return stopClock();
        if (el) { el.textContent = clockText(s.stopwatch ? Date.now() - t0 : limitMs - (Date.now() - t0)); el.classList.toggle('low', !!limitMs && limitMs - (Date.now() - t0) < 30000); }
        if (timeUp()) {
          const r = s.results[s.i];
          if (!(r && r.tries) || phase === 'done') { stopClock(); summary(); }                     // a question half answered gets finished first
          else if (el) el.textContent = 'Time’s up: finish this one';
        }
      }, 250);
    }
    if (endless) endlessNow = s;
    // the Options menu closes with a tap anywhere else (one listener for this set, gone when the set is)
    const closeOpts = ev => {
      if (!root.isConnected || root.__session !== s) return document.removeEventListener('pointerdown', closeOpts, true);
      if (!optsOpen || (ev.target.closest && ev.target.closest('.ex-opts'))) return;
      showOpts(false);
    };
    document.addEventListener('pointerdown', closeOpts, true);
    if (root.__onKey) root.removeEventListener('keydown', root.__onKey);   // one player per element: drop the last session's keys
    root.__onKey = onKey;
    root.addEventListener('keydown', onKey);
    function onKey(ev) {
      if (!root.isConnected) { root.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Escape' && (optsOpen || flagOpen || asking)) {
        ev.preventDefault();
        if (optsOpen) { showOpts(false); const b = root.querySelector('#opts-btn'); if (b) b.focus(); }
        else if (flagOpen) { flagOpen = false; render(); const b = root.querySelector('#flag-btn'); if (b) b.focus(); }
        else { const b = root.querySelector('#giveup-no'); if (b) b.click(); }
        return;
      }
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const next = root.querySelector('#next'), check = root.querySelector('#check');
        if (document.activeElement && document.activeElement.id === 'stop') return;      // Enter on ■ Stop stops
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.giveup-ask, .flag-box, .opts-panel, .q-tools, .len-pick, .hands-switch, .ans-pad')) return;    // their own buttons
        if (next) { ev.preventDefault(); next.click(); }
        else if (check && !check.disabled && document.activeElement && document.activeElement.id !== 'giveup' && document.activeElement.id !== 'hint' && document.activeElement.id !== 'stop') { ev.preventDefault(); check.click(); }
      } else if (/^[1-9]$/.test(ev.key) && phase !== 'done' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) {
        const b = root.querySelector(`#choices:not([hidden]) button[data-k="${Number(ev.key) - 1}"]`);
        if (b) b.click();
      } else if (/^Arrow(Up|Down|Left|Right)$/.test(ev.key) && phase !== 'done' && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        // the arrow keys move through the choices (and choose), from the list or from nowhere in particular
        const list = root.querySelector('#choices:not([hidden])'), ae = document.activeElement;
        if (!list || (ae && ae !== document.body && ae !== root && !list.contains(ae) && !(ae.classList && ae.classList.contains('card')))) return;
        const btns = [...list.querySelectorAll('button')], cur = btns.indexOf(ae) >= 0 ? btns.indexOf(ae) : selected != null ? selected : -1;
        const back = /Up|Left/.test(ev.key), k = cur < 0 ? (back ? btns.length - 1 : 0) : (cur + (back ? -1 : 1) + btns.length) % btns.length;
        ev.preventDefault();
        btns[k].focus(); btns[k].click();
      } else if (/^[hs]$/i.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !(document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) {
        const b = root.querySelector(ev.key.toLowerCase() === 'h' ? '#hint' : '#skip');      // H: a hint; S: skip for now
        if (b && !b.disabled) { ev.preventDefault(); b.click(); }
      }
    }
    render();
  }

  function practice(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    // a set is 7 questions, or 5 or 10 when the learner chose that (from the first question of a set)
    const start = () => exercise(root, E.start('practice', { skillId: sid, n: [5, 7, 10].includes(playerPref().len) ? playerPref().len : E.PRACTICE_N }), { back: unitHref(where.course, where.unit), backLabel: where.unit.title, again: start });
    start();
  }
  function unitTest(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('unit-test', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Retake the test' });
    start();
  }
  function challenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const start = () => exercise(root, E.start('course-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Retake the challenge' });
    start();
  }
  function masteryChallenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    if (!E.masteryPool(c).length) { root.innerHTML = `<div class="card empty">No skills are ready for a mastery challenge yet. Practice a few skills first.<div class="btn-row" style="justify-content:center"><a class="btn" href="${courseHref(c)}">Back to ${esc(c.title)}</a></div></div>`; return; }
    const start = () => { if (!E.masteryPool(c).length) return masteryChallenge(root, cid); exercise(root, E.start('mastery-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Start another round' }); };
    start();
  }
  /* ---------- more ways to practice: a timed quiz, beat your best, boss levels, the weekly challenge, a warm-up,
     a summer plan and a check before high school ---------- */
  function quiz(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('quiz', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Take another quiz' });
    start();
  }
  function boss(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('boss', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Face the boss again' });
    start();
  }
  function speed(root, sid) {
    const def = A.skills[sid];
    if (!def || !A.whereIs(sid)) return notFound(root);
    const start = () => exercise(root, E.start('speed', { skillId: sid }), { back: skillHref(sid), backLabel: plain(def.title), again: start, againLabel: 'Try to beat it' });
    start();
  }
  /** the course a learner works in: their first saved course, else their grade's */
  function myCourse() {
    const st = S.get();
    return st.profile.enrolled.filter(id => !id.startsWith('cpm:')).map(id => A.courseById(id)).filter(Boolean)[0] || (st.profile.grade != null ? A.courseById(COURSE_FOR[st.profile.grade]) : st.profile.adult ? A.courseById('math-6') : null);
  }
  /** weeks in a row with the weekly challenge solved, up to this one */
  function weeklyRun() {
    const w = S.get().profile.weekly || {};
    let n = 0, wk = E.weekOf();
    if (!w[wk]) wk = S.dayShift(wk, -7);
    while (w[wk]) { n++; wk = S.dayShift(wk, -7); }
    return n;
  }
  function weekly(root) {
    const c = myCourse();
    if (!c) { root.innerHTML = `<h1>This week’s challenge</h1><div class="card empty"><p>Choose your grade or save a course, and a new challenge problem from it waits here every Monday.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/settings">Choose my grade</a><a class="btn" href="#/courses">Find a course</a></div></div>`; return; }
    const week = E.weekOf(), done = (S.get().profile.weekly || {})[week], it = E.weeklyItem(c, week), run = weeklyRun();
    const until = 7 - ((new Date(S.today() + 'T12:00').getDay() + 6) % 7);
    root.innerHTML = `<div class="weekly-page"><h1>This week’s challenge</h1>
      <div class="card weekly-card"><div class="row between" style="flex-wrap:wrap;gap:10px"><div><span class="chip">${esc(c.title)}</span> <span class="chip">${esc(A.stripTags(A.skills[it.skillId].title))}</span></div><span class="small muted">${until === 1 ? 'A new one tomorrow' : `A new one in ${until} days`}</span></div>
        <p class="muted" style="margin:10px 0 0">One harder, several-step problem, new every Monday. Try it without hints first; hints open after a wrong answer. Solving it earns the Weekly challenger badge.</p>
        ${done ? `<p class="weekly-done">${icon('check', 18)} <b>Solved this week${done.first ? ', on the first try' : ''}.</b></p>` : ''}
        <div class="btn-row"><button class="btn primary" type="button" id="wk-go">${done ? 'Try it again' : 'Start the challenge'}</button></div>
        ${run > 1 ? `<p class="small muted" style="margin:10px 0 0">${run} weeks in a row solved.</p>` : ''}</div></div>`;
    root.querySelector('#wk-go').addEventListener('click', () => {
      exercise(root, E.start('weekly', { courseId: c.id, week }), { back: '#/weekly', backLabel: 'This week’s challenge' });
      window.scrollTo(0, 0);
    });
    tutorCtx(null);
  }
  /** a quick warm-up's skills: mental math and estimation near the learner's grade */
  const WARM = [[0, ['k.make-10', 'k.add-within-10']], [1, ['g1.add-within-20', 'g1.sub-within-20']], [2, ['g2.add-sub-20', 'g2.add-sub-100']], [3, ['g3.mult-facts', 'g3.div-facts', 'g3.rounding']], [4, ['g4.mental-math', 'g4.estimate-sum-diff', 'g3.mult-facts']],
    [5, ['g5.times-11', 'g5.estimate-products', 'g4.mental-math']], [6, ['g6.percent-in-head', 'g5.times-11', 'g5.estimate-products']], [7, ['g6.percent-in-head', 'math7.add-negatives', 'g5.estimate-products', 'g5.times-11']]];
  function warmSkills() {
    const g = S.get().profile.grade, at = g == null ? 6 : g;
    const row = WARM.slice().reverse().find(([from]) => at >= from) || WARM[0];
    const ids = row[1].filter(id => A.skills[id] && A.whereIs(id));
    return ids.length ? ids : ['g4.mental-math', 'g5.times-11'].filter(id => A.skills[id]);
  }
  function warmup(root) {
    const ids = warmSkills();
    if (!ids.length) return notFound(root);
    const start = () => exercise(root, E.endless({ skills: ids, title: 'Mental math warm-up' }), { back: '#/', backLabel: 'Home', minutes: 5, again: start, againLabel: 'Warm up again',
      banner: 'Five minutes of quick questions to do in your head. Questions get harder as you get them right.' });
    start();
  }
  /** a summer review plan: six weeks of the year just finished (its units in order), then two weeks of the next */
  const SUMMER_WEEKS = 8;
  function summerPlan() {
    const st = S.get(), g = st.profile.grade;
    const cur = myCourse(), idx = cur ? COURSE_FOR.indexOf(cur.id) : -1, nxt = idx >= 0 ? A.courseById(COURSE_FOR[idx + 1]) : null;
    if (!cur) return null;
    const units = cur.units.filter(u => u.skills.some(id => A.skills[id])), reviewWeeks = nxt ? 6 : SUMMER_WEEKS, per = Math.max(1, Math.ceil(units.length / reviewWeeks));
    const weeks = [];
    for (let k = 0; k < reviewWeeks && k * per < units.length; k++) { const us = units.slice(k * per, k * per + per); weeks.push({ n: weeks.length + 1, kind: 'Review', course: cur, units: us }); }
    if (nxt) nxt.units.filter(u => u.skills.some(id => A.skills[id])).slice(0, SUMMER_WEEKS - weeks.length).forEach(u => weeks.push({ n: weeks.length + 1, kind: 'A look ahead', course: nxt, units: [u] }));
    return { cur, nxt, weeks, g };
  }
  function summer(root) {
    const plan = summerPlan();
    if (!plan) { root.innerHTML = `<h1>Summer review</h1><div class="card empty"><p>Choose your grade or save a course, and an eight-week summer plan is made from it.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/settings">Choose my grade</a></div></div>`; return; }
    const st = S.get().profile.summer || {}, done = (st.course === plan.cur.id && st.done) || {};
    const next = plan.weeks.find(w => !done[w.n]);
    root.innerHTML = `<div class="summer-page"><h1>Summer review</h1>
      <p class="muted">${plan.weeks.length} weeks, one short practice each: the units of ${esc(plan.cur.title)} in order, so nothing slips over the break${plan.nxt ? `, then a first look at ${esc(plan.nxt.title)}` : ''}. Ten questions a week; do more any time.</p>
      <div class="pbar" role="img" aria-label="${Object.keys(done).length} of ${plan.weeks.length} weeks done"><span style="width:${Math.round(Object.keys(done).length / plan.weeks.length * 100)}%"></span></div>
      <ol class="summer-weeks">${plan.weeks.map(w => `<li class="card tight summer-week${done[w.n] ? ' done' : ''}${next === w ? ' next' : ''}"><div class="row between" style="gap:8px"><b>Week ${w.n}</b><span class="chip">${w.kind}</span></div>
        <span class="small">${w.units.map(u => esc(u.title)).join(', ')}</span>
        <div class="btn-row" style="margin-top:8px">${done[w.n] ? `<span class="small muted">${icon('check', 16)} Done ${new Date(done[w.n]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><button class="btn sm ghost" type="button" data-week="${w.n}">Again</button>` : `<button class="btn sm${next === w ? ' primary' : ''}" type="button" data-week="${w.n}">Start week ${w.n}</button>`}</div></li>`).join('')}</ol></div>`;
    root.querySelectorAll('[data-week]').forEach(b => b.addEventListener('click', () => {
      const w = plan.weeks.find(x => x.n === Number(b.dataset.week)), skills = [].concat(...w.units.map(u => u.skills.filter(id => A.skills[id])));
      exercise(root, E.start('mix', { skills, n: 10, title: `Summer review · week ${w.n}` }), { back: '#/summer', backLabel: 'Summer review', onFinish: () => {
        const cur = S.get().profile.summer || {};
        S.setProfile({ summer: { course: plan.cur.id, done: Object.assign({}, cur.course === plan.cur.id ? cur.done : {}, { [w.n]: Date.now() }) } });
      } });
      window.scrollTo(0, 0);
    }));
    tutorCtx(null);
  }
  /** before high school: the skills high school math builds on, by topic */
  const READY = [['Numbers', ['math7.add-negatives', 'math7.mul-div-negatives', 'math7.mul-div-fractions', 'g6.decimals', 'math8.roots']],
    ['Ratios and percents', ['g6.unit-rates', 'math7.proportional-table', 'math7.percent-of', 'math7.percent-change']],
    ['Expressions and equations', ['math7.distribute', 'math7.two-step-equations', 'math8.distributive-equations', 'math7.two-step-inequalities', 'math8.negative-exponents']],
    ['Lines and functions', ['math8.slope', 'math8.graph-lines', 'math8.recognize-functions', 'math8.solve-systems']],
    ['Geometry and data', ['math7.circles', 'math8.pythagorean-theorem', 'math8.triangle-angles', 'math7.mean-median']]];
  const readyIds = () => [].concat(...READY.map(g => g[1])).filter(id => A.skills[id] && A.whereIs(id));
  function ready(root) {
    const ids = readyIds(), good = ids.filter(id => S.skill(id).level >= 3), pct = ids.length ? Math.round(good.length / ids.length * 100) : 0;
    root.innerHTML = `<div class="ready-page"><h1>Ready for high school</h1>
      <p class="muted">The ${ids.length} skills Algebra 1 and Geometry build on. Each one at Proficient or above is checked off.</p>
      <div class="card ready-head"><div><div class="big-num">${pct}%</div><span class="small muted">${good.length} of ${ids.length} skills ready</span></div>${mbar(ids)}
        <div class="btn-row" style="margin-top:12px"><button class="btn primary" type="button" id="rd-check">Check my readiness · 10 questions</button></div></div>
      <div class="ready-groups">${READY.map(([name, list]) => { const ok = list.filter(id => A.skills[id] && A.whereIs(id)); return ok.length ? `<section class="card tight"><h2>${name}</h2><ul class="ready-list">${ok.map(id => `<li class="${S.skill(id).level >= 3 ? 'ok' : ''}"><span class="ready-tick" aria-hidden="true">${S.skill(id).level >= 3 ? icon('check', 14) : ''}</span><a href="${skillHref(id)}">${A.skills[id].title}</a><a class="btn sm ghost" href="${practiceHref(id)}" aria-label="Practice ${esc(A.stripTags(A.skills[id].title))}">Practice</a></li>`).join('')}</ul></section>` : ''; }).join('')}</div></div>`;
    root.querySelector('#rd-check').addEventListener('click', () => {
      // the weakest skills first, so the check finds the gaps
      const pick = ids.slice().sort((a, b) => S.skill(a).level - S.skill(b).level).slice(0, 10);
      exercise(root, E.start('mix', { skills: pick, n: 10, title: 'Ready for high school: a check' }), { back: '#/ready', backLabel: 'Ready for high school' });
      window.scrollTo(0, 0);
    });
    tutorCtx(null);
  }

  /** today's practice: skills due for a refresher, mistakes to fix and new skills, mixed together */
  function daily(root) {
    const plan = E.dailyPlan();
    if (!plan.total) {
      root.innerHTML = `<h1>Today’s practice</h1><div class="card empty"><p>Today’s practice is assembled from what you are learning. Save a course (or your class’s CPM book and lesson), or practice any skill, and it will be ready here.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/courses">Find a course</a></div></div>`;
      return;
    }
    const start = () => { let s; try { s = E.start('daily'); } catch (e) { return daily(root); } exercise(root, s, { back: '#/', backLabel: 'Home', again: start, againLabel: 'Practice again' }); };
    start();
  }
  /** what is new since this learner last looked (dismissed for good with Dismiss) */
  const NEWS = 'n12';
  function newsCard() {
    if (isNew() || S.get().profile.seenNews === NEWS) return '';
    const items = [['#/course/calculus', 'A Calculus course'], ['#/balance', 'Balance, a new daily puzzle'], ['#/notes', 'Notes on every lesson'], ['#/family', 'Family and class'], ['#/settings', 'Menus in Spanish or Hindi'], ['#/courses', 'Find your starting point in any course'], ['#/unlimited', 'Twenty more ready-made topics'], ['#/settings', 'Get the app'], ['#/new', 'A daily plan, with streak savers'], ['#/sprint/add', 'Addition and subtraction facts'], ['#/unlimited', 'Practice any topic, in any subject'], ['#/unlimited', 'Unlimited practice for every skill'], ['#/tutor', 'The tutor now helps with every subject'], ['#/fractions', 'Fraction lab'], ['#/integers', 'Integer tiles'], ['#/search/fraction', 'Search now finds tools'], ['#/leap', 'Leap, a number-line puzzle'], ['#/shapes', 'Shapes and space'], ['#/percent', 'Percents and money'], ['#/calc', 'An exact-fraction calculator'], ['#/numbers', 'Number explorer'], ['#/data', 'Data and statistics']];
    return `<div class="card news" id="news"><div class="row between"><h2 style="margin:0">New in Procademy</h2><button class="btn sm ghost" id="news-x" type="button">Dismiss</button></div>
      <div class="news-items">${items.map(([href, t]) => `<a class="chip-btn" href="${href}">${t}</a>`).join('')}</div><p class="small" style="margin:10px 0 0"><a href="#/new">View all updates →</a></p></div>`;
  }
  /** every tool: [key, href, name, line, icon, hue] */
  function toolList() {
    const sp = window.SPRINT ? SPRINT.DECKS.map(d => SPRINT.deckState(d.id).best).reduce((a, b) => Math.max(a, b), 0) : 0;
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const prepHref = S.get().profile.prep ? `#/prep/${S.get().profile.prep.book}/${S.get().profile.prep.ch}` : f ? `#/prep/${f.book.id}/${f.chapter.n}` : '#/cpm';
    return [
      ['unlimited', '#/unlimited', 'Unlimited practice', 'Practice any skill or topic for as long as you like.', 'unlimited', 215],
      ['calc', '#/calc', 'Calculator', 'Keys like the graphing calculator used in class: graphs, tables and statistics, with exact fractions and every step.', 'calc', 255],
      ['graph', '#/graph', 'Graphing calculator', 'Start a graph with one tap, then explore it with sliders.', 'graph', 200],
      ['numbers', '#/numbers', 'Number explorer', 'Primes, factor trees, divisibility, GCF and LCM, and scientific notation.', 'tree', 140],
      ['measure', '#/measure', 'Units and scale', 'Change units with every step shown, and work with scale drawings and maps.', 'globe', 120],
      ['data', '#/data', 'Data and statistics', 'Mean, median, IQR, MAD, box plots and histograms.', 'data', 175],
      ['fractions', '#/fractions', 'Fraction lab', 'Add, subtract, multiply, divide and compare fractions, shown as bars and area models.', 'fraction', 25],
      ['integers', '#/integers', 'Integer tiles', 'Add, subtract, multiply and divide negative numbers with + and − tiles, one step at a time.', 'integers', 330],
      ['shapes', '#/shapes', 'Shapes and space', 'Area, perimeter, volume, surface area, nets and angles, drawn to scale.', 'shapes', 280],
      ['geometry', '#/geometry', 'Geometry lab', 'Compass constructions, transformations on a grid, and games for plotting points and reading angles.', 'pencil', 230],
      ['percent', '#/percent', 'Percents and money', 'Percent problems, sales, tips from a receipt, markups and interest on a percent ruler.', 'percent', 45],
      ['ratios', '#/ratios', 'Ratio table', 'Equal ratios in a table: multiply, divide or add columns, and find a missing value exactly.', TOOL_PICS.ratios, 200],
      ['clock', '#/measure/clock', 'Clocks and time', 'Set a clock by dragging its hands, read the time in words, and work out how long until another time.', 'timer', 30],
      ['money', '#/money', 'Counting money', 'Coins and bills on a counter, with a running total and two counting games.', TOOL_PICS.money, 140],
      ['blocks', '#/numbers/blocks', 'Place value blocks', 'Ones, tens, hundreds and thousands as blocks: build a number and trade ten for one.', TOOL_PICS.blocks, 220],
      ['times', '#/numbers/table', 'Multiplication table', 'Explore the table from 1 × 1 to 12 × 12: arrays, patterns, squares and facts that match.', TOOL_PICS.times, 260],
      ['chance', '#/chance', 'Probability simulator', 'Spinners, number cubes, coins and marbles, run up to 10,000 times, including two-step experiments.', 'dice', 0],
      ['tiles', '#/tiles', 'Algebra tiles', 'CPM’s equation mat and comparison mat with legal moves, and factoring with tiles.', 'tiles', 160],
      ['steps', '#/steps', 'Step checker', 'Check your work line by line, or see an equation solved, simplified or factored step by step.', 'steps', 215],
      ['setup', '#/setup', 'Word problems', 'Turn a story into an equation, then solve it. Every step is checked.', 'story', 30],
      ['sprint', '#/sprint', 'Speed sprints', sp ? `One-minute rounds of math facts. Best score: ${sp}.` : 'One-minute rounds of math facts, against the clock.', 'timer', 350],
      ['words', '#/words', 'Math vocabulary', window.VOCAB && VOCAB.known() ? `${VOCAB.known()} terms learned. Flashcards with spaced review.` : 'Definitions of math terms in plain language, with flashcards.', 'book', 265],
      ['leap', '#/leap', 'Leap', leapLine(), 'flag', 140],
      ['balance', '#/balance', 'Balance', 'A seesaw puzzle: weight × distance must match on both sides.', 'balance', 95],
      ['typing', '#/typing', 'Typing practice', 'Type math words and their meanings, and see your words per minute and accuracy.', '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M6 13.5h.01M18 13.5h.01M8.5 14.5h7"/>', 230],
      ['prep', prepHref, 'Test preparation', f ? `A plan for your ${esc(f.book.short)} chapter ${f.chapter.n} test.` : 'A day-by-day plan for a CPM chapter test.', 'calendar', 190],
    ];
  }
  function leapLine() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); } catch (e) { st = null; }
    return st && st.level > 1 ? `A number-line puzzle. You are on level ${st.level}.` : 'A number-line puzzle: reach the target using every card once.';
  }
  /** a one-line example for each tool, opening it ready to go: [what, where] */
  function toolTry(key) {
    const D = window.DRAW, enc = encodeURIComponent;
    const T = {
      unlimited: ['practice on fractions', '#/unlimited/find/fractions'], calc: ['1/3 + 1/4', '#/calc/' + enc('1/3+1/4')],
      graph: ['y = x² − 4', D ? '#/graph/' + D.encode('y = x² - 4') : '#/graph'], numbers: ['the factors of 360', '#/numbers/360'],
      fractions: ['adding 2/3 + 1/4', '#/fractions/add'], integers: ['adding negatives', '#/integers/add'], shapes: ['the area of a circle', '#/shapes/circle'],
      percent: ['20% off a sale price', '#/percent/sale'], chance: ['rolling two number cubes', '#/chance/dice'], tiles: ['comparing two expressions', '#/tiles/compare'],
      steps: ['checking a homework answer', '#/steps'], words: ['the formula sheet', '#/words/formulas'], leap: ['today’s puzzle', '#/leap/daily'],
      balance: ['today’s puzzle', '#/balance/daily'], sprint: ['the times tables', '#/sprint/times'], data: ['the example data set', '#/data'], setup: ['a story about saving money', '#/setup'],
      geometry: ['bisecting a segment', '#/geometry/construct'], measure: ['feet to meters', '#/measure/units'],
      ratios: ['cups of flour and cookies', '#/ratios'], clock: ['setting the time', '#/measure/clock'], money: ['making 87¢', '#/money'],
      blocks: ['building 1,234', '#/numbers/blocks'], times: ['the 7 times table', '#/numbers/table'],
    };
    return T[key] || null;
  }
  /** line drawings for tools that have no icon in the shared set */
  const TOOL_PICS = {
    ratios: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18M9 5v14M15 5v14"/>',
    money: '<circle cx="9" cy="12" r="6"/><circle cx="16.5" cy="9.5" r="4.5"/><path d="M9 9.5v5M7.5 10.5h2.5a1 1 0 0 1 0 2H8a1 1 0 0 0 0 2h2.5"/>',
    blocks: '<rect x="3" y="11" width="9" height="9" rx="1"/><path d="M3 14h9M3 17h9M6 11v9M9 11v9"/><rect x="14" y="4" width="3" height="16" rx="1"/><path d="M14 8h3M14 12h3M14 16h3"/><rect x="19" y="17" width="3" height="3" rx=".6"/>',
    times: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/><path d="M11.2 11.2l1.6 1.6M12.8 11.2l-1.6 1.6"/>',
  };
  /* ---------- each tool's settings, kept on this device (a tool opens as it was left), and a short how-to ---------- */
  const PREF_KEY = 'procademy.toolprefs.v1';
  /** a tool's remembered settings; with patch, merges it in and saves */
  function toolPref(tool, patch) {
    let all;
    try { all = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch (e) { all = {}; }
    if (!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    const cur = all[tool] && typeof all[tool] === 'object' && !Array.isArray(all[tool]) ? all[tool] : {};
    if (!patch) return cur;
    all[tool] = Object.assign({}, cur, patch);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(all)); } catch (e) { /* a private window: nothing is kept */ }
    return all[tool];
  }
  /** three or four steps for each tool, folded away under its title */
  const GUIDES = {
    calc: ['Press the keys, or type on a keyboard. <b>enter</b> works it out, and the answer shows on the right.', 'Fractions stay exact: 1/3 + 1/4 is 7/12. <b>F ◂▸ D</b> switches an answer between a fraction and a decimal.', '<b>y=</b> then <b>graph</b> draws a graph; <b>trace</b> moves along it.', 'Beside the calculator: the answer in every form, each step, and your history to search.'],
    graph: ['Type an equation, such as <b>y = 2x + 1</b>, or tap a starter.', 'A letter set to a number, like <b>m = 2</b>, becomes a slider. Press its play button to watch it move.', 'Tap or click anywhere on the graph to read the point there. On a phone, pinch to zoom.', 'With the graph selected, the arrow keys trace a curve and + and − zoom.'],
    numbers: ['Type a whole number to see its factors, its factor tree and whether it is prime.', 'Type two or three numbers, like <b>12, 18</b>, for their GCF and LCM.', 'Further down: scientific notation, place value blocks and the multiplication table.'],
    measure: ['Choose what to measure, then the units to change from and to.', 'Type an amount: the answer shows with the conversion fact and the multiplication.', 'The star keeps a conversion you use often at the top.', 'The other tabs work with scale drawings and with clocks and time.'],
    data: ['Type or paste numbers, with spaces, commas or new lines between them.', 'Paste two columns from a spreadsheet to compare two sets.', 'Read the center and spread, then the dot plot, box plot, histogram and stem-and-leaf plot.', 'On the histogram, slide Bars to change how many bars there are and see the shape change.'],
    fractions: ['Choose an operation: add, subtract, multiply, divide, compare or simplify.', 'Type fractions like <b>3/4</b> or mixed numbers like <b>1 1/2</b>.', 'Follow the steps beside the picture. Compare takes a third fraction too.'],
    integers: ['Choose add, subtract, multiply or divide, then type two integers.', 'Press Next to move the tiles one step at a time.', 'A + tile and a − tile together make a zero pair, worth 0.', '“Build a number” is a free mat for making any number.'],
    shapes: ['Choose a shape, then type its measurements.', 'The shape is drawn to scale, with the formula and every step.', 'For a solid, press Fold it up under its net to see the net fold into the solid.'],
    geometry: ['Choose a mode: sketch, construct, transform, or one of the two games.', 'Pick a tool, then tap the grid. Points snap to where lines and circles cross.', 'The plotting game asks for points; the protractor game asks for angles.'],
    percent: ['Choose a kind of problem: a part, a percent, a whole, a sale, a bill, or more.', 'Type the numbers you know. The answer shows on a percent ruler, worked out three ways.', 'For a bill, type each price from the receipt and the tip and tax are worked out.'],
    chance: ['Choose an experiment: coins, number cubes, a spinner or marbles.', 'Run it 1, 10, 100 or 1,000 times and compare with what should happen.', 'Predict first to make a guess before 100 trials.'],
    tiles: ['Pick an equation, or enter your own, and its tiles are set out on the mat.', 'Make legal moves: take the same tile from both sides, or remove a zero pair.', 'Factoring mode arranges x², x and unit tiles into a rectangle, whose sides are the factors.'],
    steps: ['Type your first line, then each line of your working under it.', 'Each line is checked: a check mark means it still has the same solutions.', 'Or choose Solve, Simplify or Factor to see it done step by step.'],
    ratios: ['Type a ratio, like <b>3 : 5</b>, and name the two quantities.', 'Add rows by multiplying, dividing, or adding two rows together.', 'Type a number in any empty box to find the missing value.'],
    clock: ['Drag the hands, or use the buttons, to set a time.', 'The time shows in words and in digits, and how long until or since another time.', 'Play “Set the clock” to practice reading time.'],
    money: ['Tap coins and bills to add them to the counter.', 'The total shows as you go. Tap a coin on the counter to take it off.', 'Play “Make the amount” to build a price with the fewest coins.'],
    blocks: ['Type a number and press Build it, or use + and − under each place.', 'Trade 10 blocks for 1 of the next place, or break 1 into 10: the value stays the same.', 'Press Make a number for a number to build.'],
    times: ['Tap any answer to see it as rows of dots, with its fact family.', 'Choose a pattern, like square numbers, to light it up across the table.', 'Hide the answers to test yourself: tap a box to check it.'],
  };
  /** the how-to for a tool's page: folded until opened */
  const toolHow = key => (GUIDES[key] ? `<details class="tool-how"><summary>How to use this tool</summary><ol class="small">${GUIDES[key].map(t => `<li>${t}</li>`).join('')}</ol></details>` : '');
  tools.pref = toolPref; tools.how = toolHow; tools.GUIDES = GUIDES;
  const toolIcon = ic => (/^</.test(ic) ? `<svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ic}</svg>` : icon(ic, 22));
  const toolCard = ([key, href, t, sub, ic]) => { const tr = toolTry(key); return `<div class="card tool-card"><span class="tool-ic">${toolIcon(ic)}</span><span class="tool-text"><a class="tool" href="${href}"><b>${t}</b></a><span class="small muted">${sub}</span>${tr ? `<a class="tool-try" href="${tr[1]}">Try ${esc(tr[0])} →</a>` : ''}</span></div>`; };
  /* ---------- tools used lately, kept on this device ---------- */
  const TOOL_KEY = 'procademy.tools.v1', TOOL_RE = /^#\/(typing|calc|graph|numbers|data|shapes|percent|leap|balance|fractions|integers|chance|tiles|steps|setup|sprint|words|unlimited|ratios|money|geometry|measure)(\/|$)/;
  const usedTools = () => { try { const v = JSON.parse(localStorage.getItem(TOOL_KEY) || '[]'); return Array.isArray(v) ? v.filter(k => typeof k === 'string') : []; } catch (e) { return []; } };
  window.addEventListener('hashchange', () => {
    const m = TOOL_RE.exec(location.hash); if (!m) return;
    try { localStorage.setItem(TOOL_KEY, JSON.stringify([m[1]].concat(usedTools().filter(k => k !== m[1])).slice(0, 8))); } catch (e) { /* fine */ }
  });
  /** the tools that fit what the learner is studying: their recent skills, their class lesson, their next skills */
  function studyTools() {
    const st = S.get(), out = new Map(), c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const ids = st.recent.filter(id => A.skills[id]).slice(0, 6);
    if (f) ids.push(...f.lesson.skills.filter(id => A.skills[id]));
    st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).forEach(co => { const n = E.courseOrder(co).find(id => S.skill(id).level < 3); if (n) ids.push(n); });
    const KEY_OF = { tiles: 'tiles', chance: 'chance', numbers: 'numbers', data: 'data', integers: 'integers', fractions: 'fractions', shapes: 'shapes', percent: 'percent', leap: 'leap' };
    ids.forEach(id => {
      const title = plain(A.skills[id].title), why = title;
      (toolLinks(id, title).match(/href="#\/([a-z]+)/g) || []).map(h => h.slice(8)).forEach(k => { if (KEY_OF[k] && !out.has(k)) out.set(k, why); });
      if (/graph|slope|linear|line|function|parabola|quadratic|system|inequalit|intercept/i.test(title) && !out.has('graph')) out.set('graph', why);
      if (/equation|solve|solving/i.test(title) && !out.has('steps')) out.set('steps', why);
    });
    return [...out.entries()].slice(0, 4);
  }
  /** the Tools page (#/tools): what fits your studies, what you used lately, then every tool in groups */
  function tools(root) {
    const by = Object.fromEntries(toolList().map(t => [t[0], t]));
    const study = studyTools(), studyKeys = study.map(x => x[0]);
    const used = usedTools().filter(k => by[k] && !studyKeys.includes(k)).slice(0, 4);
    const cardFor = (k, why) => toolCard(by[k]).replace('<a class="tool"', '<a class="tool again"').replace('</span></div>', why ? `<span class="tiny muted tool-why">For ${esc(why)}</span></span></div>` : '</span></div>');     // "again": the same tool is in its group below
    const groups = [['Calculators', ['calc', 'graph']], ['Numbers, fractions and ratios', ['fractions', 'integers', 'ratios', 'percent', 'numbers', 'measure']], ['Shapes, data and chance', ['shapes', 'geometry', 'data', 'chance']], ['Equations', ['tiles', 'steps', 'setup']], ['Time, money and place value', ['clock', 'money', 'blocks', 'times']], ['Practice and play', ['unlimited', 'leap', 'balance', 'sprint', 'words', 'typing', 'prep']]];
    root.innerHTML = `<h1>Tools</h1><p class="muted" style="margin-top:-4px">Hands-on tools for working things out, exploring ideas and practicing.</p>
      ${study.length ? `<div class="section-title"><h2>For what you’re studying</h2></div><div class="grid tools fit">${study.filter(([k]) => by[k]).map(([k, why]) => cardFor(k, why)).join('')}</div>` : ''}
      ${used.length ? `<div class="section-title"><h2>Used recently</h2></div><div class="grid tools fit">${used.map(k => cardFor(k)).join('')}</div>` : ''}
      ${groups.map(([g, keys]) => `<div class="section-title"><h2>${g}</h2></div><div class="grid tools fit">${keys.filter(k => by[k]).map(k => toolCard(by[k])).join('')}</div>`).join('')}`;
    tutorCtx(null);
  }
  /** a small "What is this?" button that shows a sentence or two under it */
  const whatIs = (key, text) => `<button type="button" class="whatis-btn" data-whatis="${key}" aria-expanded="false" aria-controls="wi-${key}" aria-label="What is this?" title="What is this?">${icon('info', 15)}</button><span class="whatis-text" id="wi-${key}" hidden>${text}</span>`;
  function wireWhatIs(root) {
    root.querySelectorAll('[data-whatis]').forEach(b => b.addEventListener('click', () => {
      const t = root.querySelector('#wi-' + b.dataset.whatis); if (!t) return;
      t.hidden = !t.hidden; b.setAttribute('aria-expanded', String(!t.hidden));
    }));
  }
  /** one skill to try today that hasn't been tried yet: from the learner's first saved course, or their grade's */
  function somethingNew() {
    const st = S.get(), c = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0] || (st.profile.grade != null ? A.courseById(COURSE_FOR[st.profile.grade]) : null);
    if (!c) return null;
    const open = E.courseOrder(c).filter(id => A.skills[id] && S.skill(id).tries === 0).slice(0, 5);
    if (!open.length) return null;
    const t = S.today(); let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return open[h % open.length];
  }
  /** what was done on one day of the week, for the week's dots */
  function dayDetail(iso) {
    const st = S.get(), d = st.days[iso], kept = ((st.savers && st.savers.used) || {})[iso];
    const when = new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (!d || !d.q) return `<b>${when}</b>: ${kept ? 'no practice, but a streak saver kept your streak.' : 'no practice.'}`;
    const from = new Date(iso + 'T00:00').getTime(), to = from + 864e5, ids = [];
    st.log.filter(e => e.t >= from && e.t < to).forEach(e => [e.skill].concat((e.changes || []).map(c => c.skillId)).forEach(id => { if (id && A.skills[id] && !ids.includes(id)) ids.push(id); }));
    return `<b>${when}</b>: ${plural(d.q, 'question')}, ${d.right || 0} right first time${ids.length ? `. Skills: ${ids.slice(0, 4).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${ids.length > 4 ? `, and ${ids.length - 4} more` : ''}` : ''}.`;
  }
  /** the best thing to do next, in a few words with a link: mistakes first, then reviews, then today's practice */
  function bestNext() {
    const st = S.get(), d = st.days[S.today()] || {}, missed = st.missed.length, due = E.dueSkills().length;
    if (missed) return `Best next: <a href="#/review">fix ${plural(missed, 'mistake')}</a>.`;
    if (due && !d.daily) return `Best next: <a href="#/daily">review ${plural(due, 'skill')}</a> in today’s practice.`;
    return '';
  }
  /** the one button at the top of Home: back to a set left halfway (at its question), else carry on with the last
      skill, else today's practice; with the course's progress */
  function continueTarget() {
    const st = S.get(), lastT = st.log[0] ? st.log[0].t : 0, ls = st.profile.lastSet;
    const held = Object.entries(pausedAll()).map(([key, v]) => ({ key, v })).concat(ls && ls.packed && ls.key ? [{ key: ls.key, v: ls.packed }] : [])
      .filter(x => x.v && stillGood(x.v) && x.v.t > lastT && Array.isArray(x.v.items) && x.v.i < x.v.items.length).sort((a, b) => b.v.t - a.v.t)[0];
    const withCourse = (o, sid) => { const w = sid && A.whereIs(sid); return w ? Object.assign(o, { course: w.course, pct: E.mastery(A.courseSkills(w.course)).pct }) : o; };
    if (held) {
      const sid = held.v.skillId || (held.v.items[held.v.i] || {}).skillId;
      return withCourse({ href: held.key, resume: held.key, label: 'Continue', sub: `${A.stripTags(held.v.title || (A.skills[sid] ? A.skills[sid].title : 'your set'))} · question ${held.v.i + 1} of ${held.v.items.length}` }, held.v.skillId);
    }
    const last = st.recent.find(id => A.skills[id] && A.whereIs(id) && S.skill(id).level < 4);
    if (last) return withCourse({ href: practiceHref(last), label: 'Continue', sub: A.stripTags(A.skills[last].title) }, last);
    if (E.dailyPlan().total && !(st.days[S.today()] || {}).daily) return { href: '#/daily', label: 'Start today’s practice', sub: '' };
    return null;
  }
  /** a set left halfway, kept for Home's Continue (profile.lastSet = { key, packed }), from a set's own address only */
  window.addEventListener('hashchange', ev => {
    const m = document.getElementById('main'), s = m && m.__session;
    let key = ''; try { key = new URL(ev.oldURL).hash; } catch (e) { key = ''; }
    if (!s || !/^#\/(practice\/[^/]+|daily|test\/[^/]+\/[^/]+)$/.test(key) || ['endless', 'placement', 'testout'].includes(s.kind) || !m.querySelector('.ex') || E.isDone(s) || !s.results.some(r => r && r.done)) return;
    try { S.setProfile({ lastSet: { key, packed: E.pack(s) } }); } catch (e) { /* the set just isn't kept */ }
  }, true);
  /** every mastered skill, by course (Home's tile links here) */
  function mastered(root) {
    const ids = Object.keys(S.get().skills).filter(id => A.skills[id] && A.whereIs(id) && S.skill(id).level === 4), by = {};
    ids.forEach(id => { const c = A.whereIs(id).course; (by[c.id] = by[c.id] || { c, ids: [] }).ids.push(id); });
    root.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <span>Mastered skills</span></div><h1>Mastered skills</h1>
      <p class="muted">${ids.length ? `${plural(ids.length, 'skill')} mastered. Each one still comes back now and then for a quick review, so it stays mastered.` : 'No mastered skills yet. A skill is mastered after a unit test, a course challenge or a mastery challenge goes well.'}</p>
      ${Object.values(by).map(x => `<div class="section-title"><h2>${esc(x.c.title)}</h2><span class="muted small">${plural(x.ids.length, 'skill')}</span></div><div class="card"><ul class="skills">${x.ids.map(id => skillRow(id, { where: A.whereIs(id).unit.title })).join('')}</ul></div>`).join('')}
      ${ids.length ? '' : '<div class="btn-row"><a class="btn primary" href="#/daily">Today’s practice</a><a class="btn" href="#/courses">Courses</a></div>'}`;
    tutorCtx(null);
  }
  /** every page in one place */
  function sitemap(root) {
    const st = S.get(), mine = st.profile.enrolled.map(id => id.startsWith('cpm:') ? A.cpmById(id.slice(4)) : A.courseById(id)).filter(Boolean);
    const group = (name, links) => `<section class="card tight sm-group"><h2>${name}</h2><ul>${links.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul></section>`;
    root.innerHTML = `<div class="row between" style="flex-wrap:wrap;gap:10px;align-items:flex-end"><div><h1>All pages</h1><p class="muted" style="margin:0">Everything in Procademy, in one place.</p></div><button type="button" class="btn" id="tour-again">Take the 30-second tour</button></div>
      <div class="sitemap">
        ${group('Every day', [['#/', 'Home'], ['#/daily', 'Today’s practice'], ['#/unlimited/day', 'Problem of the day'], ['#/review', 'Your mistakes'], ['#/unlimited/quick', 'Five minutes of practice'], ['#/timer', 'Study timer']])}
        ${group('Practice', [['#/unlimited', 'Unlimited practice'], ['#/unlimited/picture', 'Questions like a picture'], ['#/unlimited/weak', 'Mix my weak skills'], ['#/warmup', 'Mental math warm-up'], ['#/weekly', 'This week’s challenge'], ['#/sprint', 'Speed sprints'], ['#/words/cards', 'Math vocabulary flashcards'], ['#/summer', 'Summer review'], ['#/ready', 'Ready for high school']])}
        ${group('Courses', [['#/courses', 'All courses'], ['#/courses/cpm', 'CPM books']].concat(mine.map(c => [c.chapters ? '#/cpm/' + c.id : courseHref(c), c.title])))}
        ${group('Tools', toolList().map(t => [t[1], t[2]]))}
        ${group('Help', [['#/tutor', 'Tutor'], ['#/words', 'Math words'], ['#/steps', 'Step checker'], ['#/search/', 'Search']])}
        ${group('You', [['#/progress', 'Progress'], ['#/mastered', 'Mastered skills'], ['#/notes', 'My notes'], ['#/report', 'Progress report'], ['#/family', 'Family and class'], ['#/profile', 'Profile'], ['#/settings', 'Settings'], ['#/new', 'What’s new']])}
      </div>`;
    root.querySelector('#tour-again').addEventListener('click', () => { S.setProfile({ tourNext: true }); location.hash = '#/'; });
    tutorCtx(null);
  }
  /** a one-time note, after the first set: how points, the streak and badges work, and what the four levels mean */
  function howNote() {
    const st = S.get();
    if (st.profile.levelsSeen || (!st.log.length && !Object.values(st.skills).some(x => x.level > 0))) return '';
    return `<section class="card levels-note" id="levels-note"><div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">How Procademy keeps track</h2><button type="button" class="btn sm ghost" id="levels-x">Got it</button></div>
      <ul class="how-list">${[['star', 'Points', 'Every right answer earns points (fewer after a hint), and a finished set or a level up earns extra.'], ['flame', 'Streak', 'Practice on days in a row to grow it. A streak saver covers a missed day.'], ['medal', 'Badges', 'Real milestones, like your first mastered skill. See them all on the Progress page.']].map(([ic, n, w]) => `<li><span class="how-ic">${icon(ic, 18)}</span><span><b>${n}</b> <span class="muted small">${w}</span></span></li>`).join('')}</ul>
      <h3 class="how-h">Skill levels</h3>
      <ul class="levels-list">${[[1, 'Attempted', 'You have tried it.'], [2, 'Familiar', '70% right the first time in a practice set.'], [3, 'Proficient', 'Every answer right the first time in a practice set.'], [4, 'Mastered', 'Right again later, in a unit test or a challenge.']].map(([l, n, w]) => `<li>${lvl(l)}<span><b>${n}</b> <span class="muted small">${w}</span></span></li>`).join('')}</ul></section>`;
  }
  /** the Home card for today's practice */
  /* ---------- every day: a short plan, and a welcome for someone new ---------- */
  const COURSE_FOR = ['math-k', 'math-1', 'math-2', 'math-3', 'math-4', 'math-5', 'math-6', 'math-7', 'math-8', 'algebra-1', 'geometry', 'algebra-2', 'precalculus'];
  const ordinal = g => (g === 0 ? 'Kindergarten' : `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade`);
  /** a learner's grade ('0' to '12', 'adult', or '' for not set), kept in the profile; when no course is saved
      yet, that grade's course is saved too, so Today's practice has something to start from */
  function setGrade(v) {
    const adult = v === 'adult', grade = adult || v === '' || v == null ? null : Number(v);
    S.setProfile({ grade, adult });
    const course = adult ? 'math-6' : grade == null ? null : COURSE_FOR[grade];
    if (course && A.courseById(course) && !S.get().profile.enrolled.length) S.enroll(course, true);
  }
  /** someone who hasn't started yet: no grade, no saved course, no practice, and hasn't skipped the welcome; or
      someone partway through the welcome (profile.wlDraft), who may have tried a question already */
  const isNew = () => {
    const st = S.get(), p = st.profile;
    if (p.welcomed || (window.ACCOUNT && ACCOUNT.user())) return false;
    if (p.wlDraft) return true;
    return p.grade == null && !p.adult && !p.name.trim() && !p.enrolled.length && !p.cpm && !Object.keys(st.skills).length && !Object.values(st.days).some(d => d.q);
  };
  /* ---------- the welcome: what to do today, then who is learning, a daily goal, a name and a color ---------- */
  const AV_HUES = [215, 265, 330, 0, 25, 45, 140, 175];
  const GOALS = [[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']];
  const goalLine = n => `${n} questions a day, about ${Math.round(n / 2)} minutes`;
  const WL_MODES = [['practice', 'target', 'Practice at my level', 'A plan made for you, every day'], ['tutor', 'sparkle', 'Get homework help', 'Ask the tutor about any question'],
    ['cpm', 'bookmark', 'Find my class lesson', 'Type the CPM lesson number'], ['parent', 'person', 'Set it up for my child', 'Their grade, a goal and their progress']];
  /** the course for a level in the welcome ('7', 'adult-basics', …), or null */
  const levelCourse = level => level == null ? null : A.courseById(level.startsWith('adult') ? (level === 'adult-algebra' ? 'algebra-1' : 'math-6') : COURSE_FOR[Number(level)]);
  /** the grade most children of an age are in (5 is Kindergarten), or 'adult-basics' from 18 */
  const levelForAge = age => (age >= 18 ? 'adult-basics' : String(Math.max(0, Math.min(12, age - 5))));
  /** the browser's language, when it is one the menus come in (tests can set VIEWS._browserLang) */
  const browserLang = () => { const l = (window.VIEWS && VIEWS._browserLang) || ((navigator.languages && navigator.languages[0]) || navigator.language || ''); const k = String(l).slice(0, 2).toLowerCase(); return k === 'es' || k === 'hi' ? k : null; };
  const LANG_ASK = { es: ['¿Prefieres los menús y botones en español? Las lecciones y preguntas siguen en inglés.', 'Sí, en español', 'No, gracias'], hi: ['क्या आप मेनू और बटन हिन्दी में देखना चाहेंगे? पाठ और प्रश्न अंग्रेज़ी में ही रहेंगे।', 'हाँ, हिन्दी में', 'नहीं, धन्यवाद'] };
  /** CPM lessons with a typed number ("3.1.2", "lesson 3-1-2"), the learner's grade's book first */
  function lessonsNumbered(typed, grade) {
    const id = String(typed || '').toLowerCase().replace(/lesson|les\.?/g, '').trim().replace(/[\s,-]+/g, '.').replace(/^\.+|\.+$/g, '');
    if (!/^\d+(\.\d+){1,2}$/.test(id)) return [];
    const out = [];
    A.cpm.forEach(b => b.chapters.forEach(ch => ch.lessons.forEach(l => { if (l.id === id || (id.split('.').length === 2 && l.id.startsWith(id + '.'))) out.push({ b, ch, l }); })));
    return out.sort((x, y) => (x.b.grade === grade ? 0 : 1) - (y.b.grade === grade ? 0 : 1)).slice(0, 8);
  }
  /** a first visit: what to do today; for practice, who is learning (any age) and how much a day; then straight in */
  function welcomeCard() {
    const p = S.get().profile, dr = p.wlDraft || {}, mode = dr.mode || 'practice', goal = GOALS.some(g => g[0] === dr.goal) ? dr.goal : 20;
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => [String(g), ordinal(g)]).concat([['adult-basics', 'Adult: everyday math'], ['adult-algebra', 'Adult: algebra']]);
    const lang = !p.lang && !p.langAsked ? browserLang() : null, ask = lang && LANG_ASK[lang];
    const back = !!p.wlDraft && (dr.level != null || dr.tried || dr.mode);
    const hue = AV_HUES.includes(dr.hue) ? dr.hue : 215;
    return `<section class="card welcome" id="welcome" aria-labelledby="wl-h">
      <h2 id="wl-h">${back ? 'Welcome back' : 'Welcome to Procademy'}</h2>
      <p class="muted wl-intro">${back ? (dr.tried && dr.level == null ? 'You tried a question. Choose who is learning, and practice starts at the right level.' : 'Your choices are just as you left them. Pick up where you left off.') : 'Free math practice for every age, with a tutor that explains. A couple of quick choices and you’re ready to start.'}</p>
      ${ask ? `<div class="wl-lang" id="wl-lang" lang="${lang}"><p>${ask[0]}</p><div class="btn-row"><button type="button" class="btn sm primary" data-wl-lang="${lang}">${ask[1]}</button><button type="button" class="btn sm ghost" data-wl-lang="no">${ask[2]}</button></div></div>` : ''}
      <div class="field"><span class="label" id="wl-mode-h">What do you want to do today?</span>
        <div class="wl-modes" role="radiogroup" aria-labelledby="wl-mode-h">${WL_MODES.map(([k, ic, t, sub]) => `<button type="button" class="wl-mode${k === mode ? ' on' : ''}" role="radio" aria-checked="${k === mode}" data-mode="${k}"><span class="wl-mode-ic">${icon(ic, 20)}</span><span><b>${t}</b><span class="small muted">${sub}</span></span></button>`).join('')}</div></div>
      <div class="wl-pane" data-pane="practice parent"${mode === 'practice' || mode === 'parent' ? '' : ' hidden'}>
        <div class="field"><span class="label" id="wl-who">${mode === 'parent' ? 'Who are you setting it up for?' : 'Who is learning?'}</span><div class="wl-levels" role="radiogroup" aria-labelledby="wl-who">${levels.map(([v, l]) => `<button type="button" class="chip-btn${v === dr.level ? ' on' : ''}" role="radio" aria-checked="${v === dr.level}" data-level="${v}">${l}</button>`).join('')}</div>
          <div class="wl-age"><label for="wl-age">Or choose by age</label><select id="wl-age"><option value="">Age</option>${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(a => `<option value="${a}">${a === 4 ? '4 or younger' : a}</option>`).join('')}<option value="18">18 or older</option></select><span class="small muted" id="wl-age-note" aria-live="polite"></span></div></div>
        <div class="field"><label class="label" for="wl-goal">A daily goal</label>
          <div class="wl-goal-box"><p class="wl-goal-out" id="wl-goal-out"><b>${GOALS.find(g => g[0] === goal)[1]}</b> <span class="muted">${goalLine(goal)}</span></p>
            <input type="range" id="wl-goal" class="wl-range" min="0" max="3" step="1" value="${GOALS.findIndex(g => g[0] === goal)}" aria-valuetext="${GOALS.find(g => g[0] === goal)[1]}: ${goalLine(goal)}">
            <div class="wl-ticks">${GOALS.map(([n, l], k) => `<button type="button" class="wl-tick${n === goal ? ' on' : ''}" data-goal="${n}" style="--at:${k / 3}" aria-label="${l}: ${goalLine(n)}"><b>${l}</b><span>${Math.round(n / 2)} min</span></button>`).join('')}</div></div></div>
        <div class="wl-me"><span class="wl-av" id="wl-av">${window.ACCOUNT ? ACCOUNT.avatarHtml({ name: dr.name || '', avatar: { hue } }, false) : ''}</span>
          <label class="field wl-name"><span class="label" id="wl-name-l">${mode === 'parent' ? 'Their name' : 'Your name'} <span class="muted">(optional)</span></span><input id="wl-name" maxlength="40" autocomplete="off" value="${esc(dr.name || '')}" placeholder="For the greeting on Home"></label>
          <div class="field"><span class="label" id="wl-hue-l">A color</span><div class="av-hues" role="radiogroup" aria-labelledby="wl-hue-l">${AV_HUES.map(h => `<button type="button" role="radio" aria-checked="${h === hue}" aria-label="Color ${AV_HUES.indexOf(h) + 1}" class="av-hue${h === hue ? ' on' : ''}" data-hue="${h}" style="--av:${h}"></button>`).join('')}</div></div></div>
        <div class="wl-plan" id="wl-plan" hidden aria-live="polite"></div>
        <div class="btn-row wl-go-practice"${mode === 'parent' ? ' hidden' : ''}><button class="btn primary" id="wl-place" type="button"${dr.level == null ? ' disabled' : ''}>Find my starting point</button><button class="btn" id="wl-start" type="button"${dr.level == null ? ' disabled' : ''}>Start practicing now</button><button class="btn" id="wl-try" type="button">Try one question</button></div>
        <div class="btn-row wl-go-parent"${mode === 'parent' ? '' : ' hidden'}><button class="btn primary" id="wl-parent" type="button"${dr.level == null ? ' disabled' : ''}>Set it up</button></div>
        <p class="tiny muted wl-note" id="wl-note">${mode === 'parent' ? 'Then the Family and class page shows their progress, and lets you leave a note on their Home or assign practice.' : 'Finding your starting point takes a few minutes: one question from each unit, so practice begins where you need it. Or try one question first, before choosing anything.'}</p>
      </div>
      <div class="wl-pane" data-pane="tutor"${mode === 'tutor' ? '' : ' hidden'}>
        <label class="field"><span class="label">What’s the question?</span><textarea id="wl-ask" rows="2" maxlength="600" placeholder="Type or paste it here, or leave it empty and ask in the tutor"></textarea></label>
        <p class="small muted">The tutor explains step by step and checks your thinking. It helps you understand the answer instead of just giving it.</p>
        <div class="btn-row"><button class="btn primary" id="wl-tutor" type="button">Ask the tutor</button></div>
      </div>
      <div class="wl-pane" data-pane="cpm"${mode === 'cpm' ? '' : ' hidden'}>
        <label class="field"><span class="label">Which lesson is your class on?</span><input id="wl-lesson" inputmode="decimal" autocomplete="off" placeholder="The lesson number, like 3.1.2"></label>
        <div class="wl-lessons" id="wl-lessons" aria-live="polite"><p class="small muted">Type the number from the top of your CPM homework. Procademy finds the book, and Home then shows that lesson with practice and help.</p></div>
      </div>
      <div class="wl-foot"><p class="tiny muted">Your progress is saved on this device. To keep it safe and use it on other devices too, sign in on the Profile page.</p><button class="btn ghost sm" id="wl-skip" type="button">Look around first</button></div>
    </section>`;
  }
  function wireWelcome(root) {
    const w = root.querySelector('#welcome');
    if (!w) return;
    const d0 = S.get().profile.wlDraft || {};
    let mode = d0.mode || 'practice', level = d0.level == null ? null : String(d0.level), goal = GOALS.some(g => g[0] === d0.goal) ? d0.goal : 20, name = d0.name || '', hue = AV_HUES.includes(d0.hue) ? d0.hue : 215, tried = !!d0.tried;
    /** every choice is kept as it is made, so a welcome left halfway comes back as it was (profile.wlDraft) */
    const keep = () => S.setProfile({ wlDraft: { mode, level, goal, name: name.trim().slice(0, 40), hue, tried, t: Date.now() } });
    const $ = sel => w.querySelector(sel);
    const mark = (sel, on) => w.querySelectorAll(sel).forEach(x => { const yes = on(x); x.classList.toggle('on', yes); x.setAttribute('aria-checked', String(yes)); });
    /** the week ahead, as soon as a level is chosen: the course and a look at its skill map, the daily goal, the puzzle */
    const showPlan = () => {
      const box = $('#wl-plan'), course = levelCourse(level);
      if (level == null) { box.hidden = true; return; }
      const units = course ? course.units.filter(u => u.skills.some(id => A.skills[id])) : [];
      box.hidden = false;
      box.innerHTML = `<b>${mode === 'parent' ? 'Their plan for this week' : 'Your plan for this week'}</b><ul>
        <li>${course ? `Practice from <b>${esc(course.title)}</b>, starting where ${mode === 'parent' ? 'they need' : 'you need'} it` : 'Practice any skill you like'}</li>
        <li>${goalLine(goal)}, with a puzzle of the day at ${mode === 'parent' ? 'their' : 'your'} level</li>
        <li>5 days a week; a streak saver is earned for every 7 days in a row</li></ul>
        ${units.length ? `<details class="wl-map"><summary>Preview the skill map: ${plural(units.length, 'unit')}, ${plural(A.courseSkills(course).length, 'skill')}</summary>
          <ol class="wl-units">${units.map(u => { const n = u.skills.filter(id => A.skills[id]).length; return `<li><span class="t">${esc(u.title)}</span><span class="wl-cells" role="img" aria-label="${plural(n, 'skill')}">${'<i></i>'.repeat(n)}</span></li>`; }).join('')}</ol>
          <p class="tiny muted" style="margin:6px 0 0">Each square is a skill. It fills in as the skill moves up a level: Attempted, Familiar, Proficient, then Mastered.</p></details>` : ''}`;
    };
    const ready = () => { ['#wl-start', '#wl-place', '#wl-parent'].forEach(id => { $(id).disabled = level == null; }); showPlan(); };
    const setLevel = v => { level = v; mark('[data-level]', x => x.dataset.level === v); ready(); keep(); };
    w.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { setLevel(b.dataset.level); $('#wl-age').value = ''; $('#wl-age-note').textContent = ''; }));
    $('#wl-age').addEventListener('change', ev => {
      const a = Number(ev.target.value); if (!a) return;
      const v = levelForAge(a), label = v.startsWith('adult') ? 'an adult course' : ordinal(Number(v));
      setLevel(v);
      $('#wl-age-note').textContent = a >= 18 ? 'That’s Adult: everyday math. Choose Adult: algebra above for algebra.' : `${a === 4 ? 'Most 4- and 5-year-olds are' : `Most ${a}-year-olds are`} in ${label}. Choose another grade above if that’s not right.`;
    });
    /** the daily goal: a slider of four steps, each with its minutes, or a tap on a step's name */
    const setGoal = n => {
      goal = n; const g = GOALS.find(x => x[0] === n), k = GOALS.indexOf(g);
      $('#wl-goal').value = k; $('#wl-goal').setAttribute('aria-valuetext', `${g[1]}: ${goalLine(n)}`);
      $('#wl-goal-out').innerHTML = `<b>${g[1]}</b> <span class="muted">${goalLine(n)}</span>`;
      w.querySelectorAll('.wl-tick').forEach(b => b.classList.toggle('on', Number(b.dataset.goal) === n));
      showPlan(); keep();
    };
    $('#wl-goal').addEventListener('input', ev => setGoal(GOALS[Number(ev.target.value)][0]));
    w.querySelectorAll('[data-goal]').forEach(b => b.addEventListener('click', () => setGoal(Number(b.dataset.goal))));
    const drawAv = () => { if (window.ACCOUNT) $('#wl-av').innerHTML = ACCOUNT.avatarHtml({ name, avatar: { hue } }, false); };
    $('#wl-name').addEventListener('input', ev => { name = ev.target.value; drawAv(); keep(); });
    w.querySelectorAll('[data-hue]').forEach(b => b.addEventListener('click', () => { hue = Number(b.dataset.hue); mark('[data-hue]', x => x === b); drawAv(); keep(); }));
    /** what to do today: practice (the choices below), homework help, the class lesson, or a parent setting it up */
    const setMode = m => {
      mode = m; mark('[data-mode]', x => x.dataset.mode === m);
      w.querySelectorAll('.wl-pane').forEach(p => { p.hidden = !p.dataset.pane.split(' ').includes(m); });
      const parent = m === 'parent';
      $('#wl-who').textContent = parent ? 'Who are you setting it up for?' : 'Who is learning?';
      $('#wl-name-l').firstChild.textContent = parent ? 'Their name ' : 'Your name ';
      $('.wl-go-practice').hidden = parent; $('.wl-go-parent').hidden = !parent;
      $('#wl-note').textContent = parent ? 'Then the Family and class page shows their progress, and lets you leave a note on their Home or assign practice.' : 'Finding your starting point takes a few minutes: one question from each unit, so practice begins where you need it. Or try one question first, before choosing anything.';
      showPlan(); keep();
    };
    w.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); const f = w.querySelector('.wl-pane:not([hidden]) input:not([type=range]), .wl-pane:not([hidden]) textarea'); if (f && b.dataset.mode !== 'practice' && b.dataset.mode !== 'parent') f.focus(); }));
    /** done with the welcome: keep the choices and save the course for the level chosen */
    const finish = extra => {
      const adult = level != null && level.startsWith('adult'), grade = level == null || adult ? null : Number(level), course = levelCourse(level);
      S.setProfile(Object.assign(level == null ? {} : { grade, adult }, { goal, welcomed: true, seenNews: NEWS, tourNext: true, wlDraft: null }, name.trim() ? { name: name.trim().slice(0, 40) } : {}, hue !== 215 || name.trim() ? { avatar: Object.assign({}, S.get().profile.avatar, { hue }) } : {}, extra || {}));
      if (course && !S.get().profile.enrolled.includes(course.id)) S.enroll(course.id, true);
      if (window.ACCOUNT) ACCOUNT.avatarButton();
      if (window.APP) APP.applyPrefs();
      return course;
    };
    /** to = 'place' for the starting-point check, 'try' for one question, else today's practice */
    const go = to => {
      if (to === 'try' && level == null) {
        // one question before choosing anything: from 5th grade, the middle of the courses; the welcome stays until the choices are made
        tried = true; keep();
        const first = E.courseOrder(A.courseById('math-5'))[0];
        location.hash = '#/unlimited/sample/' + encodeURIComponent(first);
        return;
      }
      if (level == null) return;
      const course = finish();
      // one question to try: the first skill of the course, as a one-question set
      const first = course && E.courseOrder(course)[0];
      location.hash = to === 'place' && course ? '#/placement/' + course.id : to === 'try' && first ? '#/unlimited/sample/' + encodeURIComponent(first) : '#/daily';
    };
    $('#wl-try').addEventListener('click', () => go('try'));
    $('#wl-start').addEventListener('click', () => go('practice'));
    $('#wl-place').addEventListener('click', () => go('place'));
    $('#wl-parent').addEventListener('click', () => {
      if (level == null) return;
      const who = name.trim();
      finish({ parentSetup: Date.now() });
      location.hash = '#/family';
      toast(`All set${who ? ' for ' + who : ''}. Here you can see progress, leave a note on Home and assign practice.`);
    });
    // homework help: straight to the tutor, with the question typed in, ready to send
    $('#wl-tutor').addEventListener('click', () => {
      const q = $('#wl-ask').value.trim();
      finish();
      location.hash = '#/tutor/new';
      if (!q) return;
      let n = 0;
      const put = () => { const t = document.getElementById('ai-text'); if (t) { t.value = q; t.dispatchEvent(new Event('input', { bubbles: true })); t.focus(); } else if (n++ < 40) setTimeout(put, 50); };
      setTimeout(put, 0);
    });
    // the class lesson from its number: the matching lessons in every CPM book, the learner's grade's book first
    const findLessons = () => {
      const box = $('#wl-lessons'), typed = $('#wl-lesson').value, grade = level == null || level.startsWith('adult') ? null : Number(level);
      const hits = lessonsNumbered(typed, grade);
      if (!typed.trim()) { box.innerHTML = '<p class="small muted">Type the number from the top of your CPM homework. Procademy finds the book, and Home then shows that lesson with practice and help.</p>'; return; }
      box.innerHTML = hits.length ? `<p class="small muted">${hits.length === 1 ? 'Is this your lesson?' : 'Which book is your class using?'}</p><ul class="wl-lesson-list">${hits.map(h => `<li><button type="button" class="wl-lesson" data-book="${h.b.id}" data-lesson="${esc(h.l.id)}"><b>${esc(h.b.title)}</b><span class="small muted">${esc(h.l.id)} ${esc(h.l.title || h.l.topic || '')}${h.b.grade === grade ? ' · your grade’s book' : ''}</span></button></li>`).join('')}</ul>`
        : `<p class="small muted">${/\d/.test(typed) ? 'No lesson has that number yet. Lesson numbers look like 3.1.2: the chapter, the section, then the lesson.' : 'Type the lesson number, like 3.1.2.'} <a href="#/cpm">Browse the CPM books</a></p>`;
      box.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => {
        const bk = A.cpmById(b.dataset.book);
        if (level == null && bk && bk.grade != null) level = String(bk.grade);
        finish({ cpm: { book: b.dataset.book, lesson: b.dataset.lesson } });
        if (!S.get().profile.enrolled.includes('cpm:' + b.dataset.book)) S.enroll('cpm:' + b.dataset.book, true);
        toast(`Lesson ${b.dataset.lesson} is now your class lesson.`);
        home(root);
      }));
    };
    $('#wl-lesson').addEventListener('input', findLessons);
    // the menus in the browser's language, if the visitor would like that (asked once)
    w.querySelectorAll('[data-wl-lang]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.wlLang;
      S.setProfile(v === 'no' ? { langAsked: true } : { lang: v, langAsked: true });
      const box = $('#wl-lang'); if (box) box.remove();
      if (v !== 'no' && window.APP) APP.applyPrefs();
    }));
    w.querySelector('#wl-skip').addEventListener('click', () => { S.setProfile({ welcomed: true, seenNews: NEWS, tourNext: true, wlDraft: null }); home(root); });
    if (level != null) ready();
  }
  /** the Monday of the week holding iso (weeks run Monday to Sunday) */
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  /** days practiced this week, toward the weekly goal (profile.weekGoal, 5 unless changed) */
  function weekGoalLine() {
    const st = S.get(), goal = st.profile.weekGoal || 5, mon = mondayOf(S.today());
    let n = 0; for (let k = 0; k < 7; k++) { const d = st.days[S.dayShift(mon, k)]; if (d && d.q) n++; }
    return `<div class="week-goal"><span class="small"><b>This week: ${Math.min(n, 7)} of ${goal} days</b>${n >= goal ? ' · goal reached' : ''}</span><span class="pbar" role="img" aria-label="${n} of ${goal} days this week"><span style="width:${Math.min(100, n / goal * 100)}%"></span></span></div>`;
  }
  /** a new week: the last one in a few lines, until Got it (then not again until next week) */
  function weekRecap() {
    if (window.REPORT && REPORT.weekRecap) return REPORT.weekRecap();          // the fuller recap: compared with the week before, the best day, one next step
    const st = S.get(), mon = mondayOf(S.today()), last = S.dayShift(mon, -7);
    if (st.profile.recapSeen === mon) return '';
    const days = []; for (let k = 0; k < 7; k++) { const d = st.days[S.dayShift(last, k)]; if (d && d.q) days.push(d); }
    if (!days.length) return '';
    const q = days.reduce((a, d) => a + d.q, 0), right = days.reduce((a, d) => a + (d.right || 0), 0), goal = st.profile.weekGoal || 5;
    const from = new Date(last + 'T00:00').getTime(), to = new Date(mon + 'T00:00').getTime(), ups = [];
    st.log.filter(e => e.t >= from && e.t < to).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && !ups.includes(ch.skillId)) ups.push(ch.skillId); }));
    const span = d => new Date(d + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `<div class="card recap" id="recap"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Your week in review</h2><button class="btn sm ghost" id="recap-x" type="button" data-week="${mon}">Got it</button></div>
      <p class="small muted" style="margin:2px 0 10px">${span(last)} to ${span(S.dayShift(mon, -1))}</p>
      <div class="recap-stats"><div><b>${days.length}</b><span>of 7 days</span></div><div><b>${q}</b><span>${q === 1 ? 'question' : 'questions'}</span></div><div><b>${q ? Math.round(right / q * 100) : 0}%</b><span>right first time</span></div><div><b>${ups.length}</b><span>skills leveled up</span></div></div>
      <p style="margin:10px 0 0">${days.length >= goal ? `You reached your goal of ${goal} days. Great work!` : `Your goal is ${goal} days a week, and this week is a fresh start.`}</p>
      ${ups.length ? `<p class="small" style="margin:6px 0 0">Leveled up: ${ups.slice(0, 3).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${ups.length > 3 ? `, and ${ups.length - 3} more` : ''}.</p>` : ''}
      <div class="btn-row"><a class="btn sm" href="#/report">See the full report</a></div></div>`;
  }
  /** the weekly rest day (0 is Sunday), or null: a rest day without practice keeps the streak going (STORE.streak) */
  const restDay = () => { const r = S.get().profile.restDay; return r == null || r === '' || isNaN(Number(r)) ? null : Number(r); };
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const longDay = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  /** class homework with a due date, until the day after it's due (profile.homework = { what, due, book, lesson }) */
  function homework() {
    const h = S.get().profile.homework, t = S.today();
    if (!h || !h.due || h.due < t) return null;
    const days = Math.round((new Date(h.due + 'T12:00') - new Date(t + 'T12:00')) / 864e5), f = h.book && h.lesson && A.cpmLesson(h.book, h.lesson);
    return { what: h.what || (f ? `${f.book.short} ${f.lesson.id}` : 'your homework'), when: days === 0 ? 'today' : days === 1 ? 'tomorrow' : longDay(h.due), lesson: f && f.lesson.skills.some(id => A.skills[id]) ? `#/cpm-practice/${f.book.id}/${encodeURIComponent(f.lesson.id)}` : null };
  }
  /** the problem of the day once solved: the question, its answer and how to get it */
  function podHow() {
    const t = S.today();
    let sid = null;
    try { const c = JSON.parse(localStorage.getItem('procademy.pod.v1') || '{}') || {}; if (c.day === t && A.skills[c.skill]) sid = c.skill; } catch (e) { sid = null; }
    if (!sid && window.UNLIMITED) { const pl = UNLIMITED.pool('day'); sid = pl && pl.skills[0]; }
    if (!sid) return '';
    let q;
    try { q = E.endless({ skills: [sid], seed: 'pod:' + t }).items[0].q; } catch (e) { return ''; }
    return `<details class="pod-how"><summary>How to solve it</summary><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}
      <p class="small">The answer is <b>${q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q)}</b>.</p>${q.hints.map(h => `<div class="hint">${h}</div>`).join('')}</details>`;
  }
  /** the problem of the day's skill, kept while it's still to do (solving it can change which skill the day picks) */
  function podRemember() {
    if (!window.UNLIMITED) return;
    try { const t = S.today(), c = JSON.parse(localStorage.getItem('procademy.pod.v1') || '{}') || {}; if (c.day !== t) { const pl = UNLIMITED.pool('day'); if (pl) localStorage.setItem('procademy.pod.v1', JSON.stringify({ day: t, skill: pl.skills[0] })); } } catch (e) { /* fine */ }
  }
  /** the first week: four things worth trying once, ticked off as they happen, until all are done or a week has passed */
  function firstWeek() {
    const st = S.get(), p = st.profile, t = S.today();
    if (p.firstWeekDone) return '';
    const days = Object.keys(st.days).filter(k => st.days[k].q).sort();
    if (days.length && days[0] < S.dayShift(t, -6)) return '';
    const daily = k => { try { return Object.keys((JSON.parse(localStorage.getItem(k) || '{}') || {}).daily || {}).length > 0; } catch (e) { return false; } };
    const items = [['Try a practice set', st.log.length > 0, '#/daily'], ['Ask the tutor a question', !!st.flags.tutor, '#/tutor'], ['Solve a puzzle', !!st.flags.leap || daily('procademy.leap.v1') || (!!window.BALANCE && daily(BALANCE.KEY)), '#/leap/daily'], ['Set a daily goal', p.goal != null, '#/settings']];
    const n = items.filter(x => x[1]).length;
    if (n === items.length) return '';
    return `<div class="first-week" id="first-week"><span class="small fw-h"><b>Your first week</b> <span class="muted">${n} of ${items.length}</span></span>
      <ul>${items.map(([l, done, href]) => `<li class="${done ? 'done' : ''}">${done ? `${icon('check', 14)}<span>${l}<span class="visually-hidden"> (done)</span></span>` : `<i aria-hidden="true"></i><a href="${href}">${l}</a>`}</li>`).join('')}</ul>
      <button type="button" class="iconbtn sm" id="fw-x" aria-label="Hide the first-week list" title="Hide">✕</button></div>`;
  }
  /** today's plan: practice, a challenge that suits the learner's age, and the daily goal; with this week's days */
  function todayCard() {
    const st = S.get(), p = st.profile, t = S.today(), d = st.days[t] || {}, q = d.q || 0, g = window.BADGES ? BADGES.goal() : 20;
    const plan = E.dailyPlan(), streak = S.streak(), savers = st.savers || { n: 0, used: {} }, rd = restDay();
    const young = p.grade != null && p.grade < 3;
    let leapDone = false;
    try { leapDone = !!((JSON.parse(localStorage.getItem('procademy.leap.v1') || '{}') || {}).daily || {})[t]; } catch (e) { leapDone = false; }
    const balanceDay = !!window.BALANCE && (Date.UTC(...t.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) / 864e5) % 2 === 1;      // the puzzle of the day takes turns (by calendar day: no time zone or clock change can skip a turn)
    const factsAt = window.SPRINT ? SPRINT.deckState('add').last : 0, factsDone = !!factsAt && S.today(new Date(factsAt)) === t;
    const parts = [plan.due.length && `${plural(plan.due.length, 'skill')} to review before ${plan.due.length === 1 ? 'it slips' : 'they slip'}`, plan.missed.length && `${plural(plan.missed.length, 'mistake')} to correct`, plan.fresh.length && `${plural(plan.fresh.length, 'new skill')}`].filter(Boolean);
    const podDone = p.pod === t;
    if (!podDone) podRemember();
    const items = [
      { done: !!d.daily, icon: 'calendar', name: 'Today’s practice', sub: plan.total ? `${plural(plan.total, 'question')} · about ${Math.max(3, Math.round(plan.total * 0.7))} minutes${parts.length ? ' · ' + parts.join(' · ') : ''}` : 'Save a course to get a practice plan made for you.', href: plan.total ? '#/daily' : '#/courses', go: plan.total ? 'Start' : 'Choose a course', again: 'Practice again' },
      young ? { done: factsDone, icon: 'timer', name: 'Facts round', sub: 'One minute of addition facts. Try to beat your best.', href: '#/sprint/add', go: 'Play', again: 'Play again' }
        : balanceDay ? { done: BALANCE.dailyDone(), icon: 'balance', name: 'Puzzle of the day', sub: 'Today’s Balance puzzle: place every weight so the seesaw is level.', href: '#/balance/daily', go: 'Play', again: 'See it again' }
        : { done: leapDone, icon: 'flag', name: 'Puzzle of the day', sub: 'Today’s Leap puzzle: reach the flag using every card once.', href: '#/leap/daily', go: 'Play', again: 'See it again' },
      { done: podDone, icon: 'target', name: 'Problem of the day', sub: podDone ? 'Solved. Here’s how it works, step by step.' : 'One new question at your level, every day.', href: '#/unlimited/day', go: 'Solve', again: 'See it again', how: podDone ? podHow() : '' },
    ];
    items.sort((a, b) => a.done - b.done);          // what is still to do comes first
    const all = items.every(x => x.done) && q >= g;          // the daily goal is the ring just below the card
    const fresh = somethingNew();
    const week = [];
    for (let k = 6; k >= 0; k--) { const iso = S.dayShift(t, -k), day = st.days[iso], did = !!(day && day.q); week.push({ iso, did, kept: !!savers.used[iso], rest: !did && rd != null && new Date(iso + 'T12:00').getDay() === rd, today: k === 0, label: new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
    const restPick = `<label class="rest-pick">A rest day each week <select id="rest-day"><option value="">None</option>${[1, 2, 3, 4, 5, 6, 0].map(k => `<option value="${k}"${rd === k ? ' selected' : ''}>${WEEKDAYS[k]}</option>`).join('')}</select></label>`;
    const streakLine = (streak.days ? `${streak.days}-day streak` : 'No streak yet')
      + ` · <span>${savers.n ? `${savers.n} streak saver${savers.n > 1 ? 's' : ''}` : 'earn a streak saver with 7 days in a row'}</span> ${whatIs('streak', `Your streak is how many days in a row you have practiced. A streak saver keeps it going if you miss a day: you earn one for every 7 days in a row, and can hold 2. A rest day keeps it going too, once a week.${restPick}`)}`;
    // a busy day: today's goal halved with one tap, back to normal tomorrow
    const busy = p.busy && p.busy.day === t;
    const busyBit = busy ? `<span class="small muted busy-note">Busy day: today’s goal is ${g}. <button type="button" class="linkish" id="busy-undo">Undo</button></span>`
      : q < g && g > 5 ? `<button type="button" class="btn sm ghost busy-btn" id="busy">Busy day? Lower today’s goal to ${Math.max(5, Math.round(g / 10) * 5)}</button>` : '';
    // after today's practice: a look at tomorrow
    const tmr = S.dayShift(t, 1), dueT = Math.min(5, Object.keys(st.skills).filter(id => { const x = st.skills[id]; return A.skills[id] && A.whereIs(id) && x.tries && x.level && x.due && x.due <= tmr; }).length);
    const wc = myCourse(), wDone = wc && (p.weekly || {})[E.weekOf()], wRun = wc ? weeklyRun() : 0, wLeft = 7 - ((new Date(t + 'T12:00').getDay() + 6) % 7);
    const hw = homework(), test = testSoon(), grade = gradePicks();
    const remind = reviewReminder();              // a weekly nudge the learner chose in Review
    const notes = [
      fresh ? `<li class="today-new">${icon('sparkle', 16)}<span>Something new today: <a href="${skillHref(fresh)}">${A.skills[fresh].title}</a> <span class="muted">· ${esc(A.whereIs(fresh).course.title)}</span></span></li>` : '',
      wc ? `<li class="today-wk">${icon('trophy', 16)}<span>This week’s challenge: ${wDone ? `<a href="#/weekly">solved</a>${wRun > 1 ? ` <span class="muted">· ${wRun} weeks in a row</span>` : ''}` : `<a href="#/weekly">not solved yet</a> <span class="muted">· ${wLeft === 1 ? 'a new one tomorrow' : `a new one in ${wLeft} days`}</span>`}</span></li>` : '',
      d.daily ? `<li class="today-tmr">${icon('calendar', 16)}<span>Tomorrow: ${dueT ? `${plural(dueT, 'skill')} to review` : 'no reviews due'}${plan.fresh.length || fresh ? ', and something new' : ''}.</span></li>` : '',
      grade ? `<li class="small today-grade">${icon('star', 16)}<span>${grade}</span></li>` : '',
      remind ? `<li class="today-remind">${icon('review', 16)}<span>${esc(remind.text)} <a href="#/review/five">Start a quick round</a></span></li>` : '',
    ].filter(Boolean);
    if (remind) remind.seen();                      // the review reminder shows once on its day
    return `<section class="card today-card daily-card${all ? ' all-done' : ''}" aria-labelledby="today-h">
      <div class="today-head"><div><h2 id="today-h">${all ? 'You’ve finished today’s plan' : 'Today'}</h2><p class="small muted" style="margin:0">${streakLine}</p></div>
        <ol class="week" aria-label="The last 7 days">${week.map(w => `<li class="${w.did ? 'did' : w.kept ? 'kept' : w.rest ? 'rest' : ''}${w.today ? ' today' : ''}"><button type="button" class="wk-day" data-day="${w.iso}" aria-label="${longDay(w.iso)}${w.did ? ': practiced' : w.kept ? ': kept by a streak saver' : w.rest ? ': your rest day' : ''}" aria-expanded="false"><span>${w.label}</span><i aria-hidden="true">${w.did ? icon('check', 14) : ''}</i></button></li>`).join('')}</ol></div>
      <div class="day-detail small" id="day-detail" hidden aria-live="polite"></div>
      <div class="today-row">${weekGoalLine()}${busyBit}</div>
      ${firstWeek()}
      <ul class="today-list">${items.map(x => `<li class="${x.done ? 'done' : ''}"><span class="today-ic">${icon(x.done ? 'check' : x.icon, 22)}</span>
        <div class="today-what"><b>${x.name}</b>${x.done ? ' <span class="chip up">Done</span>' : ''}<span class="small muted">${x.sub}</span>${x.how || ''}</div>
        ${x.href ? `<a class="btn sm${x.done ? '' : ' primary'}" href="${x.href}">${x.done ? x.again : x.go}</a>` : ''}</li>`).join('')}</ul>
      <div class="today-more"><span class="small muted">${all ? 'That’s everything for today. Want more?' : 'Want more?'}</span><a class="btn sm" href="#/unlimited/quick">${icon('timer', 18)} 5 minutes</a><a class="btn sm" href="#/unlimited">${icon('unlimited', 18)} Unlimited practice</a><a class="btn sm" href="#/unlimited/picture">${icon('image', 18)} Questions like a picture</a>${S.get().missed.length ? `<a class="btn sm" href="#/review/five">${icon('review', 18)} 5 mistakes</a>` : ''}</div>
      ${notes.length ? `<ul class="today-notes small">${notes.join('')}</ul>` : ''}
      <div class="today-plan"><span class="small muted">Coming up</span>
        ${hw ? `<span class="plan-item small">${icon('bookmark', 16)}<span>Homework due <b>${esc(hw.when)}</b>: ${esc(hw.what)}${hw.lesson ? ` · <a href="${hw.lesson}">practice it</a>` : ''} · <button type="button" class="linkish" id="hw-clear">Handed in</button></span></span>` : `<button type="button" class="chip-btn" data-plan="hw" aria-expanded="false">${icon('plus', 14)} Homework due date</button>`}
        ${test ? `<span class="plan-item small">${icon('calendar', 16)}<span><a href="#/prep/${esc(p.prep.book)}/${esc(String(p.prep.ch))}">${esc(test.name)}</a>: <b>${esc(test.when)}</b></span></span>` : `<button type="button" class="chip-btn" data-plan="test" aria-expanded="false">${icon('plus', 14)} Test date</button>`}
      </div>
      <div class="plan-form" id="plan-form" hidden></div>
    </section>`;
  }
  /** the Today card's controls: a busy day, the rest day, the first week, homework and a test date */
  function wireToday(root) {
    const card = root.querySelector('.today-card');
    if (!card) return;
    const again = () => home(root);
    const busy = card.querySelector('#busy');
    if (busy) busy.addEventListener('click', () => {
      const g = window.BADGES ? BADGES.goal() : 20, low = Math.max(5, Math.round(g / 10) * 5);
      S.setProfile({ busy: { day: S.today(), goal: g }, goal: low });
      toast(`Today’s goal is ${low} questions. It goes back to ${g} tomorrow.`); again();
    });
    const undo = card.querySelector('#busy-undo');
    if (undo) undo.addEventListener('click', () => { const b = S.get().profile.busy; S.setProfile({ goal: b.goal, busy: null }); toast(`Today’s goal is ${b.goal} questions again.`); again(); });
    const rs = card.querySelector('#rest-day');
    if (rs) rs.addEventListener('change', () => {
      const v = rs.value === '' ? null : Number(rs.value);
      S.setProfile({ restDay: v });
      toast(v == null ? 'No rest day. Every day counts toward your streak.' : `${WEEKDAYS[v]} is your rest day. Your streak keeps going without practice that day.`);
      again(); const w = root.querySelector('[data-whatis="streak"]'); if (w) w.click();
    });
    const fx = card.querySelector('#fw-x');
    if (fx) fx.addEventListener('click', () => { S.setProfile({ firstWeekDone: true }); const f = card.querySelector('#first-week'); if (f) f.remove(); });
    const hc = card.querySelector('#hw-clear');
    if (hc) hc.addEventListener('click', () => { S.setProfile({ homework: null }); toast('Nice work. Homework handed in.'); again(); });
    // a homework due date, or a test date, in a small form under the card
    const form = card.querySelector('#plan-form');
    card.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      card.querySelectorAll('[data-plan]').forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (open) { form.hidden = true; form.innerHTML = ''; b.focus(); return; }
      b.setAttribute('aria-expanded', 'true');
      const p = S.get().profile, t = S.today(), c = p.cpm && A.cpmLesson(p.cpm.book, p.cpm.lesson);
      if (b.dataset.plan === 'hw') {
        const next = (() => { let d = S.dayShift(t, 1); while ([0, 6].includes(new Date(d + 'T12:00').getDay())) d = S.dayShift(d, 1); return d; })();
        form.innerHTML = `<form class="plan-box" id="hw-form"><label class="field"><span class="label">What’s due</span><input id="hw-what" type="text" maxlength="60" value="${c ? esc(`${c.book.short} ${c.lesson.id}`) : ''}" placeholder="For example: Lesson 3.1.2, problems 1 to 10"></label>
          <label class="field"><span class="label">Due</span><input id="hw-due" type="date" min="${t}" value="${next}"></label>
          <div class="btn-row"><button class="btn sm primary" type="submit">Save</button><button class="btn sm ghost" type="button" data-plan-x>Cancel</button></div></form>`;
        form.querySelector('form').addEventListener('submit', ev => {
          ev.preventDefault();
          const due = form.querySelector('#hw-due').value, what = form.querySelector('#hw-what').value.trim();
          if (!due || due < t) { form.querySelector('#hw-due').focus(); return; }
          S.setProfile({ homework: Object.assign({ what: what || 'Homework', due }, c && (!what || what === `${c.book.short} ${c.lesson.id}`) ? { book: c.book.id, lesson: c.lesson.id } : {}) });
          toast(`Homework due ${longDay(due)}. It shows here until then.`); again();
        });
      } else {
        const books = A.cpm, b0 = (p.prep && A.cpmById(p.prep.book)) || (c && c.book) || A.cpmById((p.enrolled.find(id => id.startsWith('cpm:')) || '').slice(4)) || books.find(x => x.grade === p.grade) || books[0];
        const chOpts = bk => bk.chapters.map(ch => `<option value="${ch.n}"${c && c.book === bk && c.chapter.n === ch.n ? ' selected' : ''}>Chapter ${ch.n}: ${esc(ch.title)}</option>`).join('');
        form.innerHTML = `<form class="plan-box" id="test-form"><label class="field"><span class="label">Book</span><select id="ts-book">${books.map(x => `<option value="${x.id}"${x === b0 ? ' selected' : ''}>${esc(x.title)}</option>`).join('')}</select></label>
          <label class="field"><span class="label">Chapter</span><select id="ts-ch">${chOpts(b0)}</select></label>
          <label class="field"><span class="label">Test date</span><input id="ts-date" type="date" min="${S.dayShift(t, 1)}" value="${S.dayShift(t, 7)}"></label>
          <div class="btn-row"><button class="btn sm primary" type="submit">Make a plan</button><button class="btn sm ghost" type="button" data-plan-x>Cancel</button></div>
          <p class="tiny muted" style="margin:6px 0 0">Test prep works with the CPM books: a short set each day, a practice test the day before, and a warm-up on the day.</p></form>`;
        form.querySelector('#ts-book').addEventListener('change', ev => { form.querySelector('#ts-ch').innerHTML = chOpts(A.cpmById(ev.target.value)); });
        form.querySelector('form').addEventListener('submit', ev => {
          ev.preventDefault();
          const book = form.querySelector('#ts-book').value, ch = Number(form.querySelector('#ts-ch').value), date = form.querySelector('#ts-date').value;
          if (!date || date <= t) { form.querySelector('#ts-date').focus(); return; }
          S.setProfile({ prep: { book, ch, date, done: {}, tests: [] } });
          toast(`Chapter ${ch} test on ${longDay(date)}. Home now has a plan for each day until then.`); again();
        });
      }
      form.querySelector('[data-plan-x]').addEventListener('click', () => { form.hidden = true; form.innerHTML = ''; b.setAttribute('aria-expanded', 'false'); b.focus(); });
      form.hidden = false;
      const f = form.querySelector('input, select'); if (f) f.focus();
    }));
  }
  /** three things that suit the learner's grade, in one line on Home's Today card */
  const GRADE_PICKS = [
    [2, [['#/sprint/add', 'Addition facts'], ['#/leap', 'Leap'], ['#/shapes', 'Shapes']]],
    [4, [['#/sprint', 'Times tables'], ['#/fractions', 'Fraction lab'], ['#/balance', 'Balance']]],
    [5, [['#/fractions', 'Fraction lab'], ['#/shapes', 'Volume and area'], ['#/leap', 'Leap']]],
    [6, [['#/percent', 'Ratios and percents'], ['#/integers', 'Integer tiles'], ['#/data', 'Data and statistics']]],
    [7, [['#/integers', 'Integer tiles'], ['#/percent', 'Percents and money'], ['#/tiles', 'Algebra tiles']]],
    [8, [['#/graph', 'Graphing calculator'], ['#/geometry', 'Geometry lab'], ['#/numbers', 'Scientific notation']]],
    [12, [['#/graph', 'Graphing calculator'], ['#/steps', 'Solve step by step'], ['#/calc', 'Calculator']]],
  ];
  function gradePicks() {
    const p = S.get().profile;
    if (p.grade == null && !p.adult) return '';
    const picks = p.adult ? [['#/percent', 'Percents and money'], ['#/measure', 'Units and scale'], ['#/calc', 'Calculator']] : GRADE_PICKS.find(([upTo]) => p.grade <= upTo)[1];
    return `For ${p.adult ? 'adult learners' : ordinal(p.grade)}: ${picks.map(([h, t]) => `<a href="${h}">${t}</a>`).join(' <span class="muted" aria-hidden="true">·</span> ')}`;
  }
  /** the kinds of slip the coach recognizes (lib/coach.js), as Review and Progress name them */
  const SLIPS = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation', double: 'Double or half', unit: 'Units' };
  /** the kinds of slip worth a drill: seen twice or more, in skills that can still be practiced (most first) */
  function drillKinds() {
    const ms = S.get().mistakes || {};
    return Object.keys(ms).filter(k => SLIPS[k] && ms[k].n >= 2 && Object.keys(ms[k].skills || {}).some(id => A.skills[id] && A.whereIs(id))).sort((a, b) => ms[b].n - ms[a].n).slice(0, 6);
  }
  /** a drill: six new questions from the skills where this slip happened, the skills with it most often first */
  function drill(root, kind) {
    const m = (S.get().mistakes || {})[kind];
    if (!m) return review(root);
    const ids = Object.keys(m.skills).filter(id => A.skills[id] && A.whereIs(id)).sort((a, b) => m.skills[b] - m.skills[a]).slice(0, 4);
    if (!ids.length) return review(root);
    const tip = (window.COACH && COACH.TIPS && COACH.TIPS[kind]) || '';
    const go = () => exercise(root, E.start('mix', { skills: ids, n: 6, title: 'Drill: ' + SLIPS[kind] }), { back: '#/review', backLabel: 'Review', again: go, againLabel: 'Drill again', banner: tip ? `<b>Watch for it:</b> ${esc(tip)}` : '' });
    go(); window.scrollTo(0, 0);
  }

  /* ---------- Review: the questions missed ----------
     Grouped by the kind of slip and by skill (or listed newest or oldest first), searchable, each one opening to what
     was answered, the right answer and how to get it, with the learner's own tag and note (kept in a journal, even
     after it's fixed). Beside the list: mistakes fixed this week and a gentle weekly reminder, when each skill comes
     back (and how spaced review works), whole sets to try again, and spot the mistake. A round can be relaxed (no
     timer, the rule from the start, big hints); mistakes print as a worksheet or go to a parent or tutor as text;
     ones not missed again in 60 days move to an archive. */
  const WHY_TAGS = [['careless', 'A careless slip'], ['unknown', 'I didn’t know how']];
  const reviewPref = () => S.get().profile.reviewPrefs || {};
  const setReviewPref = patch => S.setProfile({ reviewPrefs: Object.assign({}, reviewPref(), patch) });
  const missedNow = () => S.get().missed.filter(m => A.skills[m.skill] && A.whereIs(m.skill));
  const answerOfQ = q => (q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q));
  const clipText = (t, n) => (t.length > n ? t.slice(0, n - 3).replace(/\s+\S*$/, '') + '…' : t);
  const rvDay = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const RV_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  /** a round of mistakes in the player; Back and the end return to Review (or where it started) */
  function reviewRound(root, items, o) {
    o = o || {};
    const go = () => {
      const left = S.get().missed.filter(m => items.some(x => x.skill === m.skill && x.seed === m.seed));
      if (!left.length) { if (o.back && o.back !== '#/review') location.hash = o.back; else review(root); return; }
      exercise(root, E.start('review', { items: left, n: Math.min(o.n || 20, left.length), title: o.title }), { back: o.back || '#/review', backLabel: o.backLabel || 'Review', again: o.again || go, againLabel: o.againLabel || 'Keep reviewing these', relaxed: !!reviewPref().relaxed });
    };
    go(); window.scrollTo(0, 0);
  }
  /** a quick round of five mistakes: the ones right once first (nearly cleared), then the oldest. Home can start one
      (VIEWS.quickFive(main, '#/')) */
  function quickFive(root, back) {
    if (E.archiveOld) E.archiveOld();
    const all = missedNow();
    if (!all.length) { review(root); return; }
    const pick = all.filter(m => m.wins).concat(all.filter(m => !m.wins).sort((a, b) => (a.last || a.t || 0) - (b.last || b.t || 0))).slice(0, 5);
    reviewRound(root, pick, { n: 5, title: 'Quick round: 5 mistakes', back: back || '#/review', backLabel: back && back !== '#/review' ? 'Back' : 'Review', again: () => quickFive(root, back), againLabel: 'Five more' });
  }
  /** the gentle review reminder: once a week, on the day chosen in Review, and only with mistakes waiting.
      { text, href, seen() } or null, for Home to show (seen() keeps it quiet for the rest of the day) */
  function reviewReminder() {
    const p = reviewPref(), n = missedNow().length, now = new Date();
    if (p.remind == null || p.remind === '' || !n || now.getDay() !== Number(p.remind) || p.reminded === S.today() || S.quietNow(now)) return null;
    return { text: `${plural(n, 'mistake')} waiting in Review. A quick round of five takes about five minutes.`, href: '#/review', seen: () => setReviewPref({ reminded: S.today() }) };
  }
  /** a calendar file with the review reminder on that weekday, every week */
  function reviewIcs(day) {
    const d = new Date(); d.setHours(17, 0, 0, 0);
    while (d.getDay() !== day || d < new Date()) d.setDate(d.getDate() + 1);
    const ymd = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'), site = window.MOVE ? MOVE.siteBase() : location.href.split('#')[0];
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Review reminder//EN', 'BEGIN:VEVENT', `UID:procademy-review-${Date.now()}@procademy`, `DTSTAMP:${stamp}`,
      `DTSTART:${ymd(d)}T170000`, 'DURATION:PT10M', `RRULE:FREQ=WEEKLY;BYDAY=${['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][day]}`, 'SUMMARY:Procademy: a short review of your mistakes',
      `DESCRIPTION:Open Review for a quick round: ${site}#/review`, `URL:${site}#/review`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    download('procademy-review-reminder.ics', ics, 'text/calendar');
    toast('Open the downloaded file to add the reminder');
  }
  /** when each practiced skill comes back, over the next two weeks */
  function comingBack() {
    const sk = S.get().skills, today = S.today(), by = {};
    Object.keys(sk).forEach(id => { const k = sk[id]; if (!A.skills[id] || !A.whereIs(id) || !k.level || !k.tries || !k.due) return; const d = k.due < today ? today : k.due; (by[d] = by[d] || []).push(id); });
    const days = Array.from({ length: 14 }, (_, k) => S.dayShift(today, k)), later = Object.keys(by).filter(d => d > days[13]).reduce((n, d) => n + by[d].length, 0);
    return { days, by, later };
  }
  const calDayList = (cal, d) => { const ids = cal.by[d] || []; return `<b>${d === S.today() ? 'Today' : rvDay(d)}:</b> ${ids.length ? ids.slice(0, 8).map(id => `<a href="${skillHref(id)}">${esc(plain(A.skills[id].title))}</a>`).join(', ') + (ids.length > 8 ? `, and ${ids.length - 8} more` : '') : 'nothing comes back.'}`; };
  function calendarCard(cal) {
    const first = cal.days.find(d => (cal.by[d] || []).length) || cal.days[0];
    let g = 0; const gaps = [1, 2, 3, 4, 5].map(() => (g = E.nextGap(g, 1)));
    return `<div class="card rv-side-card rv-cal-card"><h2>When skills come back</h2>
      <div class="rv-cal" role="group" aria-label="The next two weeks">${cal.days.map((d, k) => { const n = (cal.by[d] || []).length, dt = new Date(d + 'T12:00'); return `<button type="button" class="rv-cell${n ? ' has' : ''}${k === 0 ? ' today' : ''}" data-day="${d}" aria-pressed="${d === first}" aria-label="${esc(rvDay(d))}: ${n ? plural(n, 'skill') : 'nothing'} to review"><span class="rv-wd">${k === 0 ? 'Today' : dt.toLocaleDateString(undefined, { weekday: 'short' })}</span><span class="rv-dn">${dt.getDate()}</span><span class="rv-n">${n || ''}</span></button>`; }).join('')}</div>
      <p class="small rv-cal-list" id="rv-cal-list" aria-live="polite">${calDayList(cal, first)}</p>${cal.later ? `<p class="tiny muted" style="margin:0">After that: ${plural(cal.later, 'more skill')}.</p>` : ''}
      <details class="rv-how-sr"><summary>How spaced review works</summary><div class="small"><p>Each skill you practice comes back for a short refresher, just before it would start to fade.</p>
        <ul><li><b>All right:</b> it comes back in ${gaps[0]} days, then ${gaps[1]}, then about ${gaps[2]}, ${gaps[3]} and ${gaps[4]} days. Each good review pushes it further out.</li><li><b>Mostly right:</b> the gap grows a little.</li><li><b>More misses than that:</b> it comes back tomorrow.</li></ul>
        <p>A question you missed waits here until you get it right ${E.WINS_TO_CLEAR === 2 ? 'twice' : E.WINS_TO_CLEAR + ' times'} on your own.</p></div></details></div>`;
  }
  /** the mistakes as text for a parent or tutor (shared, copied, or saved as a file; nothing is sent by itself) */
  function mistakesText(missed) {
    const p = S.get().profile, lines = [`${p.name ? possessive(p.name) : 'My'} mistakes to review on Procademy (${new Date().toLocaleDateString()})`, ''];
    missed.slice(0, 30).forEach((m, k) => {
      const q = A.question(m.skill, m.seed), j = (E.journal && E.journal(m.skill, m.seed)) || {};
      lines.push(`${k + 1}. ${plain(A.skills[m.skill].title)}: ${clipText(plain(q.prompt), 160)}`);
      lines.push(`   ${m.said ? `Answered: ${m.said}. ` : ''}Right answer: ${plain(answerOfQ(q))}.${m.slip && SLIPS[m.slip] ? ` Kind of slip: ${SLIPS[m.slip]}.` : ''}${j.why ? ` ${j.why === 'careless' ? 'A careless slip.' : 'Didn’t know how yet.'}` : ''}`);
      if (j.note) lines.push(`   Note: ${j.note}`);
    });
    if (missed.length > 30) lines.push('', `And ${missed.length - 30} more.`);
    lines.push('', `Fixed this week: ${E.fixedSince ? E.fixedSince() : 0}.`);
    return lines.join('\n');
  }
  async function shareMistakes(missed) {
    const text = mistakesText(missed);
    window.VIEWS._lastShare = text;                // for the test suite
    try { if (navigator.share && navigator.canShare && navigator.canShare({ text })) { await navigator.share({ title: 'Mistakes to review', text }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Copied. Paste it into a message to a parent or tutor.'); return; } catch (e) { /* no clipboard here */ }
    download(`procademy-mistakes-${S.today()}.txt`, text, 'text/plain');
    toast('Saved as a text file to send.');
  }
  function review(root) {
    tutorCtx(null);
    if (E.archiveOld) E.archiveOld();
    const st = S.get(), missed = missedNow(), pref = reviewPref(), sort = ['skill', 'new', 'old'].includes(pref.sort) ? pref.sort : 'skill';
    const groups = [], bySlip = {}, bySkill = {};
    missed.forEach(m => { if (m.slip && SLIPS[m.slip]) (bySlip[m.slip] = bySlip[m.slip] || []).push(m); });
    Object.entries(bySlip).sort((x, y) => y[1].length - x[1].length).forEach(([k, list]) => groups.push({ key: 'slip:' + k, title: SLIPS[k], line: (window.COACH && COACH.TIPS && COACH.TIPS[k]) || '', list }));
    missed.forEach(m => (bySkill[m.skill] = bySkill[m.skill] || []).push(m));
    const skills = Object.entries(bySkill).sort((x, y) => y[1].length - x[1].length);
    const ROUND = 20;
    const run = list => reviewRound(root, list, { n: ROUND });
    const card = (key, title, line, n, extra) => `<li class="rv-group"><div class="rv-text"><b>${title}</b><span class="muted small">${plural(n, 'question')}${extra || ''}</span>${line ? `<p class="small" style="margin:4px 0 0">${esc(line)}</p>` : ''}</div><button class="btn sm primary" type="button" data-rv="${esc(key)}">Practice these</button></li>`;
    const clipQ = t => clipText(t, 110);
    const item = m => {
      const q = A.question(m.skill, m.seed), i = missed.indexOf(m), j = (E.journal && E.journal(m.skill, m.seed)) || {}, find = [plain(q.prompt), plain(A.skills[m.skill].title), j.note || '', m.said || ''].join(' ').toLowerCase();
      return `<li class="rv-item" data-find="${esc(find)}"><details><summary><span class="rv-q">${esc(clipQ(plain(q.prompt)))}</span>${sort !== 'skill' ? `<span class="small muted rv-sk">${esc(plain(A.skills[m.skill].title))}</span>` : ''}${j.why ? `<span class="chip">${j.why === 'careless' ? 'Careless' : 'Didn’t know'}</span>` : ''}${j.note ? '<span class="chip">Note</span>' : ''}${m.wins ? '<span class="chip">Right once</span>' : ''}</summary>
        <div class="rv-detail"><div class="question">${q.prompt}</div>
          <p class="small">${m.said ? `You answered <b>${esc(m.said)}</b>. ` : ''}The answer is <b>${answerOfQ(q)}</b>.${m.wins ? ' Get it right once more to clear it.' : ''}</p>
          <div class="rv-how"><div class="small"><b>How to get it</b></div>${q.hints.map(h => `<div class="hint">${h}</div>`).join('')}</div>
          <div class="rv-tag"><span class="small muted" id="rv-why-${i}">What happened?</span><div class="seg" role="radiogroup" aria-labelledby="rv-why-${i}">${WHY_TAGS.map(([v, l]) => `<button type="button" role="radio" data-why="${i}" data-v="${v}" aria-checked="${j.why === v}">${l}</button>`).join('')}</div></div>
          <label class="rv-note"><span class="small"><b>My note</b> <span class="muted">What I’ll remember next time</span></span><textarea data-note="${i}" rows="2" maxlength="300">${esc(j.note || '')}</textarea></label>
          <div class="btn-row"><button class="btn sm primary" type="button" data-one="${i}">Practice this one</button><button class="btn sm" type="button" data-ok="${i}">I understand now</button><a class="btn sm ghost" href="${skillHref(m.skill)}">See the lesson</a></div></div></details></li>`;
    };
    const days = Math.ceil(missed.length / 10), relaxedOn = !!pref.relaxed;
    // the list: by skill, or newest or oldest first
    const byDate = missed.slice().sort((a, b) => (sort === 'new' ? -1 : 1) * (((a.last || a.t || 0) - (b.last || b.t || 0))));
    const listHtml = sort === 'skill' ? skills.slice(0, 12).map(([id, list]) => `<section class="rv-skill"><ul class="rv-groups">${card('skill:' + id, A.skills[id].title, '', list.length, ` · ${esc(A.whereIs(id).course.title)} · <a href="${skillHref(id)}">See the lesson</a>`)}</ul>
          <ul class="rv-list">${list.slice(0, 6).map(item).join('')}</ul>${list.length > 6 ? `<p class="small muted rv-more">And ${list.length - 6} more in this skill.</p>` : ''}</section>`).join('')
      : `<ul class="rv-list rv-flat">${byDate.slice(0, 40).map(item).join('')}</ul>${byDate.length > 40 ? `<p class="small muted rv-more">And ${byDate.length - 40} more.</p>` : ''}`;
    // beside the list
    const cal = comingBack(), sets = (st.profile.missedSets || []).filter(x => x && Array.isArray(x.items) && x.items.some(([sid]) => A.skills[sid]));
    const spotIds = E.canSpot ? [...new Set(missed.map(m => m.skill).concat(st.recent, Object.keys(st.skills).filter(id => st.skills[id].tries)))].filter(id => A.skills[id] && A.whereIs(id)).slice(0, 24).filter(id => E.canSpot(id)).slice(0, 8) : [];
    const fixedWk = E.fixedSince ? E.fixedSince() : 0, remind = pref.remind == null || pref.remind === '' ? '' : String(pref.remind);
    const jr = E.journalAll ? E.journalAll() : [], arch = (st.profile.oldMistakes || []).filter(m => m && A.skills[m.skill]);
    const drills = drillKinds();
    root.innerHTML = `<div class="rv-page"><h1>Review your mistakes</h1>
      <p class="muted rv-lead">${missed.length ? `${plural(missed.length, 'question')} to fix. A question leaves the list after you get it right ${E.WINS_TO_CLEAR === 2 ? 'twice' : E.WINS_TO_CLEAR + ' times'}, or when you mark it “I understand now”.` : 'There is nothing to review. Every question you missed has been corrected.'}</p>
      ${missed.length >= 10 ? `<div class="card rv-day"><b>Plan a review day</b><p class="small muted" style="margin:2px 0 0">That’s a lot to fix at once. Set aside a day this week: ${days === 1 ? 'one round of practice' : `${days} rounds of 10`} clears them, and each round takes about ten minutes.</p></div>` : ''}
      ${missed.length ? `<div class="rv-acts"><div class="btn-row"><button class="btn primary" type="button" data-rv="all">Fix my mistakes${missed.length > ROUND ? ` (${ROUND} at a time)` : ''}</button>${missed.length > 5 ? '<button class="btn" type="button" id="rv-five">Quick round: 5 mistakes</button>' : ''}</div>
        <label class="opt-row rv-relax" for="rv-relaxed"><span class="opt-text"><b>Relaxed mode</b><span>No timer, the rule shown from the start, and big hints</span></span><input type="checkbox" class="switch" id="rv-relaxed"${relaxedOn ? ' checked' : ''}></label></div>` : ''}
      <div class="rv-cols"><div class="rv-main">
        ${missed.length ? '' : `<div class="card empty rv-empty">Nothing to fix right now. Nice work.<div class="btn-row" style="justify-content:center"><a class="btn" href="#/">Home</a>${drills.map(k => `<button class="btn" type="button" data-drill="${k}">Drill: ${SLIPS[k]}</button>`).join('')}</div></div>`}
        ${groups.length ? `<div class="card"><h2>By kind of mistake</h2><ul class="rv-groups">${groups.map(g => card(g.key, g.title, g.line, g.list.length)).join('')}</ul></div>` : ''}
        ${missed.length && drills.length ? `<div class="card rv-drills"><h2>Drills</h2><p class="muted small" style="margin-top:-2px">Fresh questions from the skills where a kind of slip happens, with a tip to watch for it.</p><div class="btn-row">${drills.map(k => `<button class="btn sm" type="button" data-drill="${k}">${SLIPS[k]} <span class="muted small">· 6 questions</span></button>`).join('')}</div></div>` : ''}
        ${missed.length ? `<div class="card rv-each"><div class="rv-each-head"><h2>Each mistake</h2><div class="seg" role="radiogroup" aria-label="Sort the mistakes">${[['skill', 'By skill'], ['new', 'Newest'], ['old', 'Oldest']].map(([v, l]) => `<button type="button" role="radio" data-sort="${v}" aria-checked="${sort === v}">${l}</button>`).join('')}</div></div>
          <p class="muted small" style="margin-top:-2px">Open a question to see what you answered, the right answer and how to get it, and to add a note.</p>
          ${missed.length >= 4 ? `<div class="rv-find"><input type="search" id="rv-find" placeholder="Search your mistakes" aria-label="Search your mistakes" autocomplete="off"><p class="small muted" id="rv-none" hidden>No mistakes match that.</p></div>` : ''}
          ${listHtml}</div>` : ''}
      </div><aside class="rv-side">
        <div class="card rv-side-card rv-week"><div class="rv-stats"><div><b>${fixedWk}</b><span>fixed this week</span></div><div><b>${missed.length}</b><span>to fix</span></div></div>
          <label class="rv-remind" for="rv-remind"><span class="small"><b>A gentle reminder</b><span class="muted"> once a week, only when there’s something to fix</span></span><select id="rv-remind"><option value="">Off</option>${RV_DAYS.map((d, k) => `<option value="${k}"${remind === String(k) ? ' selected' : ''}>${d}s</option>`).join('')}</select></label>
          ${remind ? '<button class="link-btn small" type="button" id="rv-ics">Add it to my calendar</button>' : ''}
          ${missed.length ? '<div class="rv-out"><button class="btn sm ghost" type="button" id="rv-print">Print as a worksheet</button><button class="btn sm ghost" type="button" id="rv-share">Share with a parent or tutor</button></div>' : ''}</div>
        ${calendarCard(cal)}
        ${sets.length ? `<div class="card rv-side-card"><h2>Try a whole set again</h2><p class="small muted">Sets you finished with a miss or two. Try every question again, not just the ones you missed.</p><ul class="rv-sets">${sets.map(x => `<li><span class="rv-set-t"><b>${esc(x.title)}</b><span class="small muted">${x.miss} of ${x.n} missed · ${ago(x.t)}</span></span><button class="btn sm" type="button" data-set="${esc(x.seed)}">Try it again</button></li>`).join('')}</ul></div>` : ''}
        ${spotIds.length ? '<div class="card rv-side-card rv-spot"><h2>Spot the mistake</h2><p class="small muted">Find the wrong step in someone else’s work. Checking work like this makes your own slips easier to catch.</p><button class="btn sm" type="button" id="rv-spot">Spot the mistake <span class="muted small">· 5 questions</span></button></div>' : ''}
      </aside></div>
      <details class="card rv-fold" id="rv-journal"><summary><b>Mistake journal</b> <span class="muted small">${jr.length ? plural(jr.length, 'note') : 'No notes yet'}</span></summary>${jr.length ? `<ul class="rv-jr">${jr.map(e => { const q = A.question(e.skill, e.seed); return `<li><div class="rv-jr-q">${esc(clipQ(plain(q.prompt)))}</div><div class="small muted">${esc(plain(A.skills[e.skill].title))} · ${new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}${e.why ? ` · ${e.why === 'careless' ? 'A careless slip' : 'Didn’t know how'}` : ''}${e.fixed ? ' · Fixed' : ''}</div>${e.note ? `<p class="note-text">${esc(e.note)}</p>` : ''}</li>`; }).join('')}</ul>` : '<p class="small muted">Open a mistake and write what you’ll remember next time, or tag it as a careless slip or something you didn’t know. Your notes stay here, even after a mistake is fixed.</p>'}</details>
      ${arch.length ? `<details class="card rv-fold" id="rv-archive"><summary><b>Older mistakes</b> <span class="muted small">${arch.length}</span></summary><p class="small muted">A mistake you haven’t missed again in ${E.ARCHIVE_DAYS} days moves here, out of the way.</p><ul class="rv-old">${arch.slice(0, 10).map(m => `<li>${esc(clipQ(plain(A.question(m.skill, m.seed).prompt)))} <span class="muted small">· ${esc(plain(A.skills[m.skill].title))}</span></li>`).join('')}</ul>${arch.length > 10 ? `<p class="small muted">And ${arch.length - 10} more.</p>` : ''}<div class="btn-row"><button class="btn sm" type="button" id="rv-unarchive">Bring them back to Review</button></div></details>` : ''}</div>`;
    const on = (sel, fn) => root.querySelectorAll(sel).forEach(b => b.addEventListener('click', ev => fn(b, ev)));
    on('[data-rv]', b => { const k = b.dataset.rv; run(k === 'all' ? missed : k.startsWith('slip:') ? bySlip[k.slice(5)] : bySkill[k.slice(6)]); });
    on('[data-one]', b => run([missed[Number(b.dataset.one)]]));
    on('[data-drill]', b => drill(root, b.dataset.drill));
    on('#rv-five', () => quickFive(root));
    on('[data-ok]', b => {
      const m = missed[Number(b.dataset.ok)];
      S.clearMissed(m.skill, m.seed); if (E.noteFixed) E.noteFixed(m.skill, m.seed);
      toast('Taken off your list. Nice work.');
      const y = window.scrollY; review(root); window.scrollTo(0, y);
    });
    const rel = root.querySelector('#rv-relaxed');
    if (rel) rel.addEventListener('change', () => { setReviewPref({ relaxed: rel.checked }); toast(rel.checked ? 'Relaxed mode on: big hints, no timer' : 'Relaxed mode off'); });
    on('#rv-print', () => { if (!window.WORKSHEET || !WORKSHEET.sheet) return; WORKSHEET.sheet(root, { title: 'My mistakes', sub: `${plural(Math.min(missed.length, 30), 'question')} to practice again`, items: missed.slice(0, 30).map(m => ({ q: A.question(m.skill, m.seed) })), back: '#/review', backLabel: 'Review' }); });
    on('#rv-share', () => shareMistakes(missed));
    on('[data-sort]', b => { setReviewPref({ sort: b.dataset.sort }); const y = window.scrollY; review(root); window.scrollTo(0, y); const nb = root.querySelector(`[data-sort="${b.dataset.sort}"]`); if (nb) nb.focus({ preventScroll: true }); });
    // search: by the question, the skill, the answer given or a note
    const find = root.querySelector('#rv-find');
    if (find) find.addEventListener('input', () => {
      const t = find.value.trim().toLowerCase();
      root.querySelectorAll('.rv-item').forEach(li => { li.hidden = !!t && !li.dataset.find.includes(t); });
      root.querySelectorAll('.rv-skill').forEach(sec => { sec.hidden = !!t && !sec.querySelector('.rv-item:not([hidden])'); });
      root.querySelectorAll('.rv-more').forEach(p => { p.hidden = !!t; });
      root.querySelector('#rv-none').hidden = !t || !!root.querySelector('.rv-item:not([hidden])');
    });
    // the learner's tag and note on each mistake (kept in the journal)
    on('[data-why]', b => {
      const m = missed[Number(b.dataset.why)], was = b.getAttribute('aria-checked') === 'true', v = was ? null : b.dataset.v;
      E.journal(m.skill, m.seed, { why: v });
      b.parentNode.querySelectorAll('[data-why]').forEach(x => x.setAttribute('aria-checked', String(x === b && !was)));
      toast(v ? 'Noted' : 'Tag removed');
    });
    root.querySelectorAll('[data-note]').forEach(ta => {
      let t = 0;
      const save = () => { clearTimeout(t); const m = missed[Number(ta.dataset.note)]; E.journal(m.skill, m.seed, { note: ta.value.trim().slice(0, 300) }); };
      ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(save, 600); });
      ta.addEventListener('change', save);
    });
    // beside the list: the reminder, the calendar, sets to try again, spot the mistake
    const rm = root.querySelector('#rv-remind');
    if (rm) rm.addEventListener('change', () => { setReviewPref({ remind: rm.value === '' ? null : Number(rm.value) }); toast(rm.value === '' ? 'Review reminder off' : `A gentle reminder on ${RV_DAYS[Number(rm.value)]}s, only when there’s something to fix`); const y = window.scrollY; review(root); window.scrollTo(0, y); });
    on('#rv-ics', () => reviewIcs(Number(reviewPref().remind)));
    on('[data-day]', b => { root.querySelectorAll('[data-day]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); root.querySelector('#rv-cal-list').innerHTML = calDayList(cal, b.dataset.day); });
    on('[data-set]', b => { const s = E.retrySet(b.dataset.set); if (!s) { toast('That set can’t be rebuilt any more.'); return; } exercise(root, s, { back: '#/review', backLabel: 'Review', relaxed: !!reviewPref().relaxed }); window.scrollTo(0, 0); });
    on('#rv-spot', () => { const go = () => exercise(root, E.start('spot', { skills: spotIds, n: 5 }), { back: '#/review', backLabel: 'Review', again: go, againLabel: 'Five more' }); go(); window.scrollTo(0, 0); });
    on('#rv-unarchive', () => { const n = E.unarchive(); toast(`${plural(n, 'mistake')} back in Review`); review(root); });
  }

  /* ---------- progress ---------- */
  /** how Progress was left on this device: the folded sections and the filter (procademy.progress.v1) */
  const PR_KEY = 'procademy.progress.v1';
  const prPrefs = () => { try { const o = JSON.parse(localStorage.getItem(PR_KEY) || '{}'); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch (e) { return {}; } };
  const setPrPrefs = patch => { try { localStorage.setItem(PR_KEY, JSON.stringify(Object.assign(prPrefs(), patch))); } catch (e) { /* this visit only */ } };
  const PR_DATES = [['all', 'All time'], ['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['year', 'This year'], ['custom', 'Choose dates…']];
  const PR_SHUT = ['growth', 'goals'];                 // the extras start folded; everything else starts open
  const isoDay = v => /^\d{4}-\d\d-\d\d$/.test(String(v || ''));
  const dayMs = iso => new Date(iso + 'T00:00').getTime();
  const shortDay = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  /** the filter in force: a course (or every course) and a span of days (or all time) */
  function prFilter() {
    const f = prPrefs().filter || {}, today = S.today();
    const c = f.course && A.courseById(f.course) ? A.courseById(f.course) : null;
    const dates = PR_DATES.some(d => d[0] === f.dates) ? f.dates : 'all';
    let from = null, to = null;
    if (/^\d+$/.test(dates)) from = S.dayShift(today, -(Number(dates) - 1));
    if (dates === 'year') from = today.slice(0, 4) + '-01-01';
    if (dates === 'custom') { from = isoDay(f.from) ? f.from : S.dayShift(today, -29); to = isoDay(f.to) ? f.to : today; if (to < from) [from, to] = [to, from]; }
    if (from && !to) to = today;
    const label = dates === 'custom' ? `${shortDay(from)} to ${shortDay(to)}` : PR_DATES.find(d => d[0] === dates)[1];
    return { c, ids: c ? new Set(A.courseSkills(c)) : null, dates, from, to, label, on: !!(c || from), since: from ? dayMs(from) : 0, until: to ? dayMs(S.dayShift(to, 1)) : Infinity };
  }
  /** a log entry inside the filter */
  const prIn = (F, e) => e && e.t >= F.since && e.t < F.until && (!F.c || window.REPORT.entryIn(e, F.c, F.ids));
  const inCourse = (F, id) => !F.ids || F.ids.has(id);
  /** a section of Progress that folds away (remembered on this device) */
  function sec(id, title, body, opts) {
    opts = opts || {};
    const fold = prPrefs().fold || {}, shut = Object.prototype.hasOwnProperty.call(fold, id) ? !!fold[id] : PR_SHUT.includes(id);
    return `<section class="pr-sec${opts.cls ? ' ' + opts.cls : ''}" data-sec="${id}"${opts.anchor ? ` id="${opts.anchor}"` : ''}><div class="section-title"><h2><button type="button" class="pr-fold" aria-expanded="${!shut}" aria-controls="prs-${id}">${title}</button></h2>${opts.side || ''}</div>
      <div class="pr-sec-body" id="prs-${id}"${shut ? ' hidden' : ''}>${body}</div></section>`;
  }
  /** one plain sentence under a chart, and a table of its numbers for screen readers */
  const say = text => (text ? `<p class="pr-say">${text}</p>` : '');
  const srTable = (caption, head, rows) => `<table class="visually-hidden"><caption>${esc(caption)}</caption><thead><tr>${head.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, k) => (k ? `<td>${esc(String(c))}</td>` : `<th scope="row">${esc(String(c))}</th>`)).join('')}</tr>`).join('')}</tbody></table>`;

  function progress(root) {
    const s = S.get(), st = S.streak(), R = window.REPORT, F = prFilter();
    const missed = s.missed.filter(m => A.skills[m.skill] && inCourse(F, m.skill));
    const kinds = { spot: 'Spot the mistake', topic: 'Practice on a topic', practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'CPM practice', review: 'Review', daily: 'Today’s practice', 'chapter-test': 'Practice test', sprint: 'Speed sprint', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles', placement: 'Starting-point check' };
    const COACH_TIPS = () => (window.COACH ? COACH.TIPS : {});
    const mine = R ? R.coursesOf(s) : [];
    const courseOpts = (F.c && !mine.includes(F.c) ? [F.c] : []).concat(mine);
    const log = s.log.filter(e => prIn(F, e));
    root.innerHTML = `
      <div class="row between pr-head"><h1 style="margin:0">Progress</h1><div class="btn-row pr-head-acts" style="margin:0"><a class="btn sm" href="#/notes">My notes</a><a class="btn sm" href="#/report" id="pr-print">Print a report</a>
        <details class="pr-menu"><summary class="btn sm" aria-label="Share or print">Share</summary><div class="pr-menu-list">${window.FAMILY ? '<button type="button" id="pr-share">Share with a parent</button>' : ''}<button type="button" id="pr-pic">Save a progress picture</button><button type="button" id="pr-print-page">Print this page</button></div></details>
        <a class="btn sm" href="#/family">Family and class</a></div></div>
      <div class="pr-filter" role="group" aria-label="Show progress for">
        <label class="pr-f">Course <select id="pr-course"><option value="">All courses</option>${courseOpts.map(c => `<option value="${c.id}" ${F.c === c ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
        <label class="pr-f">Dates <select id="pr-dates">${PR_DATES.map(([v, l]) => `<option value="${v}" ${v === F.dates ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${F.dates === 'custom' ? `<label class="pr-f">From <input type="date" id="pr-from" value="${F.from}" max="${S.today()}"></label><label class="pr-f">To <input type="date" id="pr-to" value="${F.to}" max="${S.today()}"></label>` : ''}
        <button type="button" class="btn sm ghost pr-fold-all" id="pr-fold-all">${Object.values(prPrefs().fold || {}).some(Boolean) ? 'Open all' : 'Fold all'}</button>
      </div>
      ${F.on ? `<p class="small muted pr-filter-note">Showing ${F.c ? esc(F.c.title) : 'every course'}, ${F.dates === 'all' ? 'all time' : esc(F.label.toLowerCase().replace(/^choose dates…$/, ''))}. This week, time practicing and the month comparison always count everything. <button type="button" class="linklike" id="pr-clear">Show everything</button></p>` : ''}
      <div id="pr-picbox" class="no-print" hidden></div>
      ${weekCard()}
      ${flaggedSec(F)}
      ${nextCard(F)}
      ${readyCard(F)}
      ${trendCard()}
      ${R ? monthCard() : ''}
      ${timeCard()}
      ${strongWeak(F)}
      ${dueWeek(F)}
      ${testsCard(F)}
      ${periodSec(F, log)}
      <div class="pr-two">${activitySec(F, log)}${masterySec(F)}</div>
      ${masteryMap(F)}
      ${R ? areasSec(F) : ''}
      ${R ? forecastSec(F) : ''}
      ${R ? growthSec(F) : ''}
      ${R ? goalsSec() : ''}
      ${(() => {
        const ms = Object.entries(s.mistakes || {}).filter(([k, m]) => m.n && (COACH_TIPS()[k]) && (!F.ids || Object.keys(m.skills || {}).some(id => F.ids.has(id)))).sort((a, b) => b[1].n - a[1].n);
        if (!ms.length) return '';
        const total = ms.reduce((a, [, m]) => a + m.n, 0);
        return sec('patterns', 'Your mistake patterns', `<div class="card"><p class="muted small" style="margin:0 0 10px">What the coach noticed in your wrong answers. Knowing your usual slip is half of fixing it.</p>
          <ul class="patterns">${ms.slice(0, 6).map(([k, m]) => { const top = Object.entries(m.skills || {}).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter(id => A.skills[id] && A.whereIs(id) && inCourse(F, id))[0]; return `<li><div class="row between"><b>${SLIPS[k] || k}</b><span class="muted small">${plural(m.n, 'time')}</span></div><div class="pbar"><span style="width:${Math.round(m.n / total * 100)}%"></span></div><p class="small" style="margin:6px 0 0">${esc(COACH_TIPS()[k])}${top ? ` Most often in <a href="${skillHref(top)}">${A.skills[top].title}</a>.` : ''}</p></li>`; }).join('')}</ul></div>`);
      })()}
      ${window.BADGES ? sec('badges', 'Badges', BADGES.shelfBody ? BADGES.shelfBody() : BADGES.shelf(), { anchor: 'badges', side: `<span class="muted small">${BADGES.all().filter(b => b.at).length} of ${BADGES.LIST.length}</span>` }) : ''}
      ${window.CHALLENGE ? CHALLENGE.card() : ''}
      ${sec('missed', 'Mistakes to review', `<div class="card">${missed.length ? `<div class="row between" style="flex-wrap:wrap;gap:10px"><span>${plural(missed.length, 'question')} you missed, rebuilt exactly as asked. Get one right and it comes off the list.</span><a class="btn primary sm" href="#/review">Review now</a></div>` : '<p class="muted" style="margin:0">Nothing waiting. Missed questions will collect here.</p>'}</div>`)}
      ${sec('recent', 'Recent activity', `<div class="card">${log.length ? `<ul class="log pr-log">${log.slice(0, 30).map((e, k) => {
        const what = e.title ? esc(e.title) : e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(e.course, e.unit) ? A.unitById(e.course, e.unit).title : e.course && A.courseById(e.course) ? A.courseById(e.course).title : '';
        return `<li${k >= 8 ? ' hidden' : ''}><span class="when">${ago(e.t)}</span><span><b>${kinds[e.kind] || esc(e.kind)}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${(e.changes || []).map(ch => ` <span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.LEVELS[ch.to]}</span>`).join('')}</span><span class="pts">+${e.pts}</span></li>`; }).join('')}</ul>${log.length > 8 ? `<button type="button" class="btn sm ghost pr-more" id="pr-more">Show ${Math.min(30, log.length) - 8} more</button>` : ''}` : `<p class="muted" style="margin:0">${F.on ? 'Nothing in this course or these dates.' : 'Nothing yet. Your practice will show up here.'}</p>`}</div>`)}
      ${R ? R.privateNote('progress') : ''}`;
    wireProgress(root, F);
  }
  /** Progress, drawn again where it was (after a filter or a change) */
  const progressAgain = root => { const y = window.scrollY; progress(root); window.scrollTo(0, y); };
  function wireProgress(root, F) {
    const R = window.REPORT;
    const heat = root.querySelector('.heat'); if (heat) heat.scrollLeft = heat.scrollWidth;      // a narrow screen shows the latest weeks, not the oldest
    // tabs inside cards: the week, time practicing, mastery
    const tabs = (attr, view) => root.querySelectorAll(`[${attr}]`).forEach(b => b.addEventListener('click', () => {
      const box = b.closest('section, .card') || root, key = b.getAttribute(attr);
      box.querySelectorAll(`[${attr}]`).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      box.querySelectorAll(`[${view}]`).forEach(v => { v.hidden = v.getAttribute(view) !== key; });
    }));
    tabs('data-time', 'data-time-view'); tabs('data-wk', 'data-wk-view');
    root.querySelectorAll('[data-wk-go]').forEach(b => b.addEventListener('click', () => { const t = root.querySelector(`[data-wk="${b.dataset.wkGo}"]`); if (t) { t.click(); t.focus(); } }));
    // folding, remembered on this device
    root.querySelectorAll('.pr-fold').forEach(b => b.addEventListener('click', () => {
      const s = b.closest('.pr-sec'), open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open)); s.querySelector('.pr-sec-body').hidden = !open;
      setPrPrefs({ fold: Object.assign({}, prPrefs().fold, { [s.dataset.sec]: !open }) });
      const all = root.querySelector('#pr-fold-all'); if (all) all.textContent = root.querySelector('.pr-fold[aria-expanded="false"]') ? 'Open all' : 'Fold all';
    }));
    const foldAll = root.querySelector('#pr-fold-all');
    if (foldAll) foldAll.addEventListener('click', () => {
      const shut = foldAll.textContent === 'Fold all', fold = {};
      root.querySelectorAll('.pr-sec').forEach(s => { fold[s.dataset.sec] = shut; s.querySelector('.pr-fold').setAttribute('aria-expanded', String(!shut)); s.querySelector('.pr-sec-body').hidden = shut; });
      setPrPrefs({ fold }); foldAll.textContent = shut ? 'Open all' : 'Fold all';
    });
    // the filter
    const setFilter = patch => { setPrPrefs({ filter: Object.assign({}, prPrefs().filter, patch) }); progressAgain(root); };
    const sel = (id, fn) => { const el = root.querySelector(id); if (el) el.addEventListener('change', () => fn(el.value)); };
    sel('#pr-course', v => setFilter({ course: v || null }));
    sel('#pr-dates', v => setFilter(v === 'custom' ? { dates: v, from: F.from || S.dayShift(S.today(), -29), to: F.to || S.today() } : { dates: v }));
    sel('#pr-from', v => { if (isoDay(v)) setFilter({ from: v }); });
    sel('#pr-to', v => { if (isoDay(v)) setFilter({ to: v }); });
    const clear = root.querySelector('#pr-clear'); if (clear) clear.addEventListener('click', () => { setPrPrefs({ filter: {} }); progressAgain(root); });
    // a report printed in one tap (for the dates chosen here, when the report has them), the progress link for a parent, a picture, this page printed
    root.querySelector('#pr-print').addEventListener('click', () => { try { sessionStorage.setItem('procademy.printReport', '1'); if (['7', '30', '90'].includes(F.dates)) sessionStorage.setItem('procademy.reportPeriod', F.dates); } catch (e) { /* the report opens; print from there */ } });
    const menu = root.querySelector('.pr-menu');
    const shut = () => { if (menu) menu.open = false; };
    const sh = root.querySelector('#pr-share');
    if (sh) sh.addEventListener('click', () => { shut(); const url = FAMILY.link(); FAMILY._last = url; try { navigator.clipboard.writeText(url).then(() => toast('Progress link copied. Send it to a parent or teacher.'), () => toast('The link couldn’t be copied.')); } catch (e) { toast('The link couldn’t be copied.'); } });
    const pic = root.querySelector('#pr-pic');
    if (pic) pic.addEventListener('click', () => { shut(); if (R) R.pictureBox(root.querySelector('#pr-picbox')); });
    const pp = root.querySelector('#pr-print-page');
    if (pp) pp.addEventListener('click', () => { shut(); window.print(); });
    if (menu) document.addEventListener('click', function off(ev) { if (!document.body.contains(menu)) { document.removeEventListener('click', off); return; } if (!menu.contains(ev.target)) menu.open = false; });
    // recent activity: more on request
    const more = root.querySelector('#pr-more');
    if (more) more.addEventListener('click', () => { root.querySelectorAll('.pr-log li[hidden]').forEach(li => { li.hidden = false; }); more.remove(); });
    // flagged questions: cleared one at a time, or all
    root.querySelectorAll('[data-unflag]').forEach(b => b.addEventListener('click', () => {
      const [skill, seed] = JSON.parse(b.dataset.unflag);
      S.setProfile({ flagged: (S.get().profile.flagged || []).filter(f => !(f && f.skill === skill && f.seed === seed)) });
      toast('The flag is off.'); progressAgain(root);
    }));
    const unAll = root.querySelector('#pr-unflag-all');
    if (unAll) unAll.addEventListener('click', () => { if (!confirm('Clear every flagged question?')) return; S.setProfile({ flagged: (S.get().profile.flagged || []).filter(f => f && A.skills[f.skill] && !inCourse(F, f.skill)) }); toast('Every flag is off.'); progressAgain(root); });
    // a skill's growth
    const gs = root.querySelector('#pr-growth-skill');
    if (gs) gs.addEventListener('change', () => { setPrPrefs({ growth: gs.value }); root.querySelector('#pr-growth-view').innerHTML = growthView(gs.value); });
    // a note asking a parent for help
    const hb = root.querySelector('#pr-help-btn'), hf = root.querySelector('#pr-help-form');
    if (hb && hf) {
      hb.addEventListener('click', () => { hf.hidden = !hf.hidden; hb.setAttribute('aria-expanded', String(!hf.hidden)); if (!hf.hidden) hf.querySelector('#pr-help-text').focus(); });
      hf.querySelector('#pr-help-cancel').addEventListener('click', () => { hf.hidden = true; hb.setAttribute('aria-expanded', 'false'); hb.focus(); });
      hf.addEventListener('submit', ev => {
        ev.preventDefault();
        const text = hf.querySelector('#pr-help-text').value.trim(), skill = hf.querySelector('#pr-help-skill').value;
        if (!text) { hf.querySelector('#pr-help-text').focus(); return; }
        S.setProfile({ helpNote: { text: text.slice(0, 160), skill: A.skills[skill] ? skill : null, t: Date.now(), seen: false } });
        toast('Your note is saved for a parent. It shows on Family and class.'); progressAgain(root);
      });
    }
    const hx = root.querySelector('#pr-help-x');
    if (hx) hx.addEventListener('click', () => { S.setProfile({ helpNote: null }); progressAgain(root); });
    if (window.BADGES && BADGES.wireShelf) BADGES.wireShelf(root);
  }

  /* ---------- Home: a note from a parent, and practice they assigned (set on the Family and class page) ---------- */
  function parentStrip() {
    const p = S.get().profile, note = p.parentNote && p.parentNote.text && !p.parentNote.seen ? p.parentNote : null;
    const work = window.FAMILY ? FAMILY.assignedOf(S.get()).filter(a => !a.done && !a.hidden) : [];
    if (!note && !work.length) return '';
    const a = work[0];
    return `<section class="card parent-strip" aria-label="From a parent">
      ${note ? `<div class="ps-row ps-note"><span class="ps-ic">${icon('person', 18)}</span><p><b>${note.by ? 'From ' + esc(note.by) : 'A note for you'}:</b> <span data-raw>${esc(note.text)}</span></p>
        <div class="ps-replies" role="group" aria-label="Reply"><button class="btn sm" type="button" id="ps-seen" data-reply="Got it, thanks.">Got it, thanks</button><button class="btn sm ghost" type="button" data-reply="Will do.">Will do</button><button class="btn sm ghost" type="button" id="ps-write" aria-expanded="false" aria-controls="ps-form">Reply</button></div></div>
        <form class="ps-form" id="ps-form" hidden><label class="visually-hidden" for="ps-text">Your reply</label><input id="ps-text" type="text" maxlength="120" autocomplete="off" placeholder="Write a short reply"><button class="btn sm primary" type="submit">Send</button></form>` : ''}
      ${a ? `<div class="ps-row"><span class="ps-ic">${icon('target', 18)}</span><p><b data-raw>${esc(a.title)}</b> <span class="small muted">${a.got} of ${a.ids.length} ${a.ids.length === 1 ? 'skill' : 'skills'} practiced${work.length > 1 ? ` · ${work.length - 1} more assigned` : ''}</span></p><a class="btn sm primary" href="${FAMILY.setHash(a.ids, a.title)}">Start</a></div>` : ''}
    </section>`;
  }
  /** a parent's note: put away with a quick reply (Got it, thanks · Will do) or a short one written here, kept with
      the note (parentNote.reply) for the parent to see */
  function wireParentStrip(root) {
    const strip = root.querySelector('.parent-strip');
    if (!strip) return;
    const reply = text => {
      const n = S.get().profile.parentNote;
      S.setProfile({ parentNote: Object.assign({}, n, { seen: true }, text ? { reply: { text: String(text).slice(0, 120), t: Date.now() } } : {}) });
      strip.querySelectorAll('.ps-note, .ps-form').forEach(x => x.remove());
      if (!strip.querySelector('.ps-row')) strip.remove();
      if (text) toast(`Reply saved with the note${n && n.by ? ` for ${n.by}` : ''}.`);
    };
    strip.querySelectorAll('[data-reply]').forEach(b => b.addEventListener('click', () => reply(b.dataset.reply)));
    const w = strip.querySelector('#ps-write'), f = strip.querySelector('#ps-form');
    if (w) w.addEventListener('click', () => { f.hidden = !f.hidden; w.setAttribute('aria-expanded', String(!f.hidden)); if (!f.hidden) f.querySelector('input').focus(); });
    if (f) f.addEventListener('submit', ev => { ev.preventDefault(); const t = f.querySelector('input').value.trim(); if (!t) { f.querySelector('input').focus(); return; } reply(t); });
  }

  /* ---------- progress: this week, what to practice next and why, and how it is going over the weeks ---------- */
  /** this week (Monday on): days against the weekly goal, questions, first-try rights, and what leveled up; last week
      as a recap, compared with the week before; a parent's limit, the family goal, and a note asking a parent for help */
  function weekCard() {
    const s = S.get(), R = window.REPORT, mon = mondayOf(S.today()), goal = s.profile.weekGoal || 5, since = new Date(mon + 'T00:00').getTime();
    let days = 0, q = 0, right = 0;
    let mins = 0;
    for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(mon, k)]; if (d && d.q) { days++; q += d.q; right += d.right || 0; mins += S.minutes(d); } }
    const ups = [];
    s.log.filter(e => e.t >= since).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && A.whereIs(ch.skillId)) { const u = ups.find(x => x.id === ch.skillId); if (u) u.to = Math.max(u.to, ch.to); else ups.push({ id: ch.skillId, to: ch.to }); } }));
    const lw = R ? R.week(s, S.dayShift(mon, -7)) : null;
    const stats = (d, g, m, qq, r, n) => `<div class="pr-week-stats"><div><b>${d > g ? d : `${d} of ${g}`}</b><span>days practiced${d >= g ? ' · goal reached' : ''}</span></div><div><b>${m}</b><span>${m === 1 ? 'minute' : 'minutes'} practicing</span></div><div><b>${qq}</b><span>${qq === 1 ? 'question' : 'questions'}</span></div><div><b>${qq ? Math.round(r / qq * 100) : 0}%</b><span>right the first time</span></div><div><b>${n}</b><span>${n === 1 ? 'skill' : 'skills'} leveled up</span></div></div>`;
    const upList = list => `<h3>You got better at</h3><ul class="pr-ups">${list.slice(0, 6).map(u => `<li>${lvl(u.to)}<a href="${skillHref(u.id)}">${A.skills[u.id].title}</a><span class="chip fit-mine">${A.LEVELS[u.to]}</span><a class="btn sm" href="${practiceHref(u.id)}">Practice</a></li>`).join('')}</ul>`;
    const fresh = !q && lw && lw.q;              // a new week with nothing yet: last week is worth a look
    const last = lw ? (() => {
      const next = nextUp()[0], lines = [R.weekVs(lw), lw.best ? `Best day: ${new Date(lw.best.iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long' })}, ${plural(lw.best.q, 'question')}.` : '',
        lw.q ? (lw.active >= goal ? `You reached your goal of ${goal} days. Great work!` : `Your goal is ${goal} days a week, and this week is a fresh start.`) : '',
        lw.tests.length ? `Tests: ${lw.tests.map(e => `${Math.round(e.right / e.total * 100)}%`).join(', ')}.` : '', lw.badges.length ? `New ${lw.badges.length === 1 ? 'badge' : 'badges'}: ${esc(lw.badges.join(', '))}.` : ''].filter(Boolean);
      return `<div data-wk-view="last" hidden><p class="small muted pr-week-span">${shortDay(lw.mon)} to ${shortDay(lw.to)}</p>${lw.q ? `${stats(lw.active, goal, lw.min, lw.q, lw.right, lw.ups.length)}
        <ul class="pr-recap">${lines.map(l => `<li>${l}</li>`).join('')}</ul>${lw.ups.length ? upList(lw.ups) : ''}` : '<p class="muted small" style="margin:6px 0 0">No practice last week.</p>'}
        ${next ? `<p class="pr-for-week"><b>For this week:</b> <a href="${skillHref(next.id)}">${A.skills[next.id].title}</a> <span class="small muted">· ${esc(next.why)}</span> <a class="btn sm" href="${practiceHref(next.id)}">Practice</a></p>` : ''}</div>`;
    })() : '';
    const p = s.profile, today = S.minutes(s.days[S.today()]);
    const help = p.helpNote && p.helpNote.text ? p.helpNote : null;
    const helpSkills = [...new Set(s.missed.map(m => m.skill).concat(s.recent || []))].filter(id => A.skills[id] && A.whereIs(id)).slice(0, 12);
    return `<section class="card pr-week" aria-labelledby="pr-week-h"><div class="pr-week-top"><h2 id="pr-week-h">Your week</h2>${lw ? `<div class="tabs pr-week-tabs" role="tablist" aria-label="Which week"><button type="button" role="tab" class="tab on" aria-selected="true" data-wk="now">This week</button><button type="button" role="tab" class="tab" aria-selected="false" data-wk="last">Last week</button></div>` : ''}</div>
      <div data-wk-view="now">${stats(days, goal, mins, q, right, ups.length)}
      ${ups.length ? upList(ups) : `<p class="muted small" style="margin:10px 0 0">${q ? 'Keep going: a skill moves up a level after a practice set with most answers right.' : 'No practice yet this week. Today’s practice is a good start.'}${fresh ? ' <button type="button" class="linklike" data-wk-go="last">See how last week went</button>' : ''}</p>`}</div>
      ${last}
      ${p.limit ? `<p class="small muted pr-limit">Daily time limit, set by a parent: ${p.limit} minutes. Today so far: ${plural(today, 'minute')}.</p>` : ''}
      ${window.FAMILY && FAMILY.goalLine ? FAMILY.goalLine() : ''}
      <div class="pr-help">${help ? `<p class="small pr-help-was"><b>Your note to a parent:</b> “${esc(help.text)}” <span class="muted">· ${help.reply ? `they replied: “${esc(help.reply.text || '')}”` : help.seen ? 'read' : 'not read yet'}</span> <button type="button" class="linklike small" id="pr-help-x">Remove it</button></p>` : ''}
        <button type="button" class="btn sm ghost" id="pr-help-btn" aria-expanded="false" aria-controls="pr-help-form">${help ? 'Write a new note to a parent' : 'Stuck? Ask a parent for help'}</button>
        <form class="pr-help-form" id="pr-help-form" hidden><label class="field"><span class="label">What’s it about?</span><select id="pr-help-skill"><option value="">Something else</option>${helpSkills.map(id => `<option value="${esc(id)}">${esc(plain(A.skills[id].title))}</option>`).join('')}</select></label>
          <label class="field"><span class="label">Your note</span><input id="pr-help-text" type="text" maxlength="160" autocomplete="off" placeholder="For example: I don’t get how to divide fractions."></label>
          <div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Leave the note</button><button class="btn sm ghost" type="button" id="pr-help-cancel">Cancel</button></div>
          <p class="tiny muted" style="margin:0">A parent sees it on Family and class on this device, and in your progress link if you send one.</p></form></div></section>`;
  }
  /** questions the learner flagged in practice (profile.flagged), to look at with a grown-up and clear */
  function flaggedSec(F) {
    const R = window.REPORT, all = (S.get().profile.flagged || []).filter(f => f && A.skills[f.skill] && A.whereIs(f.skill)), list = all.filter(f => inCourse(F, f.skill));
    if (!list.length || !R) return '';
    const answerOf = q => (q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q));
    return sec('flagged', 'Questions you flagged', `<div class="card pr-flags"><p class="small muted" style="margin:0 0 10px">Questions you said looked confusing or wrong. Look at them with a parent or teacher, and clear each one once it’s sorted out.</p>
      <ul class="pr-flag-list">${list.map(f => { let q = null; try { q = A.question(f.skill, f.seed); } catch (e) { q = null; } return `<li><details><summary><span class="pr-flag-q">${esc(R.flaggedText(f))}</span></summary>${q ? `<div class="pr-flag-detail"><div class="question">${q.prompt}</div><p class="small">The answer Procademy expects: <b>${answerOf(q)}</b></p></div>` : ''}</details>
        <div class="pr-flag-meta small muted"><a href="${skillHref(f.skill)}">${A.skills[f.skill].title}</a> · ${esc(R.FLAG_WHY[f.why] || R.FLAG_WHY.confusing)}${f.note ? `: “${esc(f.note)}”` : ''}${f.t ? ` · ${ago(f.t)}` : ''}</div>
        <div class="pr-flag-acts"><a class="btn sm" href="${practiceHref(f.skill)}">Practice the skill</a><button type="button" class="btn sm ghost" data-unflag="${esc(JSON.stringify([f.skill, f.seed]))}">Clear</button></div></li>`; }).join('')}</ul>
      ${list.length > 1 ? '<div class="btn-row"><button type="button" class="btn sm ghost" id="pr-unflag-all">Clear them all</button></div>' : ''}</div>`, { side: `<span class="muted small">${plural(list.length, 'question')}</span>` });
  }
  /** what to practice next, most useful first, each with the reason: a coming test, a missed question, a weak skill, a review, the next new skill */
  function nextUp() {
    const s = S.get(), out = [], seen = new Set();
    const add = (id, why) => { if (out.length < 5 && id && A.skills[id] && A.whereIs(id) && !seen.has(id)) { seen.add(id); out.push({ id, why }); } };
    const t = testSoon();
    if (t) [...t.ids].filter(id => S.skill(id).level < 3).slice(0, 2).forEach(id => add(id, `On your ${t.name}, ${t.when}`));
    (s.profile.tests || []).filter(x => x && x.date >= S.today() && Array.isArray(x.ids)).slice(0, 2).forEach(x => x.ids.filter(id => S.skill(id).level < 3).slice(0, 2).forEach(id => add(id, `On your ${x.name}, ${shortDay(x.date)}`)));
    s.missed.map(m => m.skill).forEach(id => add(id, 'You missed a question here'));
    Object.keys(s.skills).filter(id => s.skills[id].tries >= 3 && s.skills[id].right / s.skills[id].tries < 0.6).forEach(id => add(id, 'Fewer than 6 in 10 right so far'));
    E.dueSkills().forEach(id => add(id, 'Due for a quick refresher'));
    s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).forEach(c => add(E.courseOrder(c).find(id => S.skill(id).level < 3), `Next in ${c.title}`));
    return out;
  }
  function nextCard(F) {
    let list = nextUp();
    if (F && F.c) { const extra = E.courseOrder(F.c).filter(id => S.skill(id).level < 3).slice(0, 5); list = list.filter(x => F.ids.has(x.id)); extra.forEach(id => { if (list.length < 5 && !list.some(x => x.id === id)) list.push({ id, why: `Next in ${F.c.title}` }); }); }
    return sec('next', 'Practice next', `<div class="card">${list.length ? `<ul class="skills pr-next">${list.map(x => `<li>${lvl(S.skill(x.id).level)}<div class="name"><a href="${skillHref(x.id)}">${A.skills[x.id].title}</a><div class="sub">${esc(x.why)}</div></div><div class="actions"><a class="btn sm primary" href="${practiceHref(x.id)}">Practice</a></div></li>`).join('')}</ul>`
      : '<p class="muted" style="margin:0">Save a course on the Courses page, and what to practice next shows up here.</p>'}</div>`, { side: '<a href="#/daily">Today’s practice →</a>' });
  }
  /** the last eight weeks: questions each week as bars, and the share right the first time as a line */
  function trendCard() {
    const s = S.get(), mon = mondayOf(S.today()), weeks = [];
    for (let w = 7; w >= 0; w--) {
      const start = S.dayShift(mon, -7 * w); let q = 0, right = 0;
      for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(start, k)]; if (d) { q += d.q || 0; right += d.right || 0; } }
      weeks.push({ start, q, pct: q ? Math.round(right / q * 100) : null });
    }
    if (!weeks.some(w => w.q)) return '';
    const maxQ = Math.max(...weeks.map(w => w.q), 1), n = weeks.length;
    const label = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const desc = weeks.map(w => `week of ${label(w.start)}: ${w.q} questions${w.pct == null ? '' : `, ${w.pct}% right`}`).join('; ');
    const pts = weeks.map((w, k) => (w.pct == null ? null : `${((k + 0.5) / n * 100).toFixed(2)},${100 - w.pct}`)).filter(Boolean);
    const busy = weeks.slice().sort((a, b) => b.q - a.q)[0], did = weeks.filter(w => w.pct != null);
    const line = did.length >= 2 ? (did[did.length - 1].pct === did[0].pct ? ` Right the first time held at ${did[0].pct}%.` : ` Right the first time went from ${did[0].pct}% to ${did[did.length - 1].pct}%.`) : did.length ? ` ${did[0].pct}% were right the first time.` : '';
    return sec('trend', 'How it’s going', `<div class="card pr-trend"><div class="legend"><span><i class="dot pr-key-bar"></i>Questions each week</span><span><i class="dot pr-key-line"></i>Right the first time</span></div>
        <div class="pr-chart" role="img" aria-label="${esc(desc)}">
          <div class="pr-plot">${pts.length > 1 ? `<svg class="pr-linesvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.join(' ')}" vector-effect="non-scaling-stroke"/></svg>` : ''}
            ${weeks.map(w => `<div class="pr-col"><div class="pr-bar" style="height:${Math.round(w.q / maxQ * 100)}%"></div>${w.pct == null ? '' : `<span class="pr-dot" style="bottom:${w.pct}%"></span><span class="pr-pct" style="bottom:${w.pct}%">${w.pct}%</span>`}</div>`).join('')}</div>
          <div class="pr-labels" aria-hidden="true">${weeks.map(w => `<div><span>${label(w.start)}</span><span class="muted">${w.q} q</span></div>`).join('')}</div>
        </div>${say(`Each bar is a week’s questions and the line is the share right the first time. The busiest week was the week of ${label(busy.start)}, with ${plural(busy.q, 'question')}.${line}`)}
        ${srTable('Questions and first-try rights each week', ['Week of', 'Questions', 'Right the first time'], weeks.map(w => [label(w.start), w.q, w.pct == null ? 'none' : w.pct + '%']))}</div>`, { side: '<span class="muted small">the last 8 weeks</span>' });
  }
  /** this month so far against all of last month */
  function monthCard() {
    const R = window.REPORT, m = R.months(S.get()), a = m.last, b = m.now;
    if (!a.q && !b.q) return '';
    const rows = [['Days practiced', a.active, b.active], ['Questions', a.q, b.q], ['Right the first time', a.q ? Math.round(a.right / a.q * 100) + '%' : '–', b.q ? Math.round(b.right / b.q * 100) + '%' : '–'], ['Minutes practicing', a.min, b.min], ['Skills leveled up', a.ups, b.ups], ['Tests taken', a.tests ? `${a.tests} (average ${a.testPct}%)` : 0, b.tests, b.tests ? `average ${b.testPct}%` : '']];
    const cmp = b.q > a.q ? 'already more questions than' : b.q === a.q ? 'the same number of questions as' : `${plural(a.q - b.q, 'question')} to go to match`;
    return sec('month', 'This month and last month', `<div class="card pr-month"><p class="small muted" style="margin:0 0 10px">${esc(m.nowName)} so far, with all of ${esc(m.lastName)} under each number.</p>
      <div class="pr-mgrid">${rows.map(([k, x, y, sub]) => `<div><span class="pr-m-label">${k}</span><b>${y}</b><span class="small muted">${sub ? sub + ' · ' : ''}${esc(m.lastName)}: ${x}</span></div>`).join('')}</div>
      ${say(`${esc(m.nowName)} so far: ${plural(b.q, 'question')} on ${plural(b.active, 'day')}, ${esc(cmp)} all of ${esc(m.lastName)} (${plural(a.q, 'question')} on ${plural(a.active, 'day')}).`)}
      ${srTable('This month and last month', ['What', m.lastName, m.nowName + ' so far'], rows.map(r => r.slice(0, 3)))}</div>`);
  }

  const LEVEL_READY = [0, 0.25, 0.6, 0.85, 1];                 // how ready each level is for a test (as test prep counts it)
  const readyWord = pct => (pct >= 80 ? 'Ready' : pct >= 60 ? 'Nearly ready' : pct >= 35 ? 'Getting there' : 'Just starting');
  /** the coming tests: a CPM chapter test with a plan, tests a parent put on the calendar, and the unit test of the unit each saved course is on */
  function nextTests(F) {
    const s = S.get(), out = [], pr = s.profile.prep;
    if (pr && window.PREP && pr.date >= S.today() && !(F && F.c)) {
      const c = PREP.chapterOf(pr.book, pr.ch);
      if (c) out.push({ name: `${c.b.short} chapter ${c.ch.n} test`, date: pr.date, pct: Math.round(PREP.readiness(c, pr).overall * 100), href: `#/prep/${c.b.id}/${c.ch.n}`, go: 'Continue the plan' });
    }
    (Array.isArray(s.profile.tests) ? s.profile.tests : []).filter(t => t && t.date >= S.today() && Array.isArray(t.ids) && t.ids.some(id => A.skills[id]) && (!F || !F.ids || t.ids.some(id => F.ids.has(id)))).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 3).forEach(t => {
      const ids = t.ids.filter(id => A.skills[id] && A.whereIs(id)), weak = ids.filter(id => S.skill(id).level < 2);
      out.push({ name: t.name, date: t.date, by: t.by, pct: window.REPORT ? REPORT.plannedReady(s, t) : 0, href: window.FAMILY ? FAMILY.setHash(ids, t.name) : practiceHref(ids[0]), go: 'Practice for it', weak: weak.length });
    });
    s.profile.enrolled.map(id => A.courseById(id)).filter(c => c && (!F || !F.c || F.c === c)).slice(0, 2).forEach(c => {
      const sid = E.courseOrder(c).find(id => S.skill(id).level < 3);
      if (!sid) return;
      const u = A.whereIs(sid).unit, ids = u.skills.filter(id => A.skills[id] && A.whereIs(id));
      if (!ids.length) return;
      const pct = Math.round(ids.reduce((a, id) => a + LEVEL_READY[S.skill(id).level], 0) / ids.length * 100);
      const weak = ids.filter(id => S.skill(id).level < 2);
      out.push({ name: `Unit test: ${u.title}`, where: c.title, pct, href: pct >= 60 ? `#/test/${c.id}/${u.id}` : weak.length ? practiceHref(weak[0]) : `#/unlimited/unit/${c.id}/${u.id}`, go: pct >= 60 ? 'Take the unit test' : weak.length ? `Practice ${plain(A.skills[weak[0]].title)}` : 'Practice the unit', weak: weak.length });
    });
    return out;
  }
  function readyCard(F) {
    const list = nextTests(F);
    if (!list.length) return '';
    const when = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return sec('ready', 'How ready for the next test', `<div class="card pr-ready"><ul>${list.map(t => `<li><div class="pr-ready-top"><div><b>${esc(t.name)}</b><span class="small muted">${t.date ? `${when(t.date)} · ` : t.where ? esc(t.where) + ' · ' : ''}${readyWord(t.pct)}${t.weak ? ` · ${plural(t.weak, 'skill')} still to learn` : ''}${t.by ? ` · added by ${esc(t.by)}` : ''}</span></div><span class="pr-ready-pct">${t.pct}%</span></div>
        <div class="pbar" role="img" aria-label="${t.pct}% ready"><span style="width:${t.pct}%"></span></div><a class="btn sm" href="${t.href}">${esc(t.go)}</a></li>`).join('')}</ul>
        <p class="tiny muted" style="margin:10px 0 0">Worked out from the levels of the test’s skills${list.some(t => t.go === 'Continue the plan') ? ' and the last practice test' : ''}. Proficient and Mastered skills count most.</p></div>`);
  }
  /** minutes practicing: the last 14 days, or the last 8 weeks; and the time of day practice goes best */
  function timeCard() {
    const s = S.get(), R = window.REPORT;
    if (!Object.values(s.days).some(d => d.q)) return '';
    const label = (iso, o) => new Date(iso + 'T12:00').toLocaleDateString(undefined, o);
    const days = []; for (let k = 13; k >= 0; k--) { const iso = S.dayShift(S.today(), -k), d = s.days[iso]; days.push({ iso, min: S.minutes(d), est: !!(d && d.q && d.sec == null) }); }
    const mon = mondayOf(S.today()), weeks = [];
    for (let w = 7; w >= 0; w--) { const start = S.dayShift(mon, -7 * w); let min = 0, est = false; for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(start, k)]; min += S.minutes(d); if (d && d.q && d.sec == null) est = true; } weeks.push({ iso: start, min, est }); }
    const bars = (list, lab, val) => { const max = Math.max(...list.map(x => x.min), 1); return `<div class="pr-tbars" style="--n:${list.length}">${list.map(x => `<div title="${x.min} min${x.est ? ' (estimated)' : ''}"><span class="pr-tv">${val ? val(x) : x.min || ''}</span><i style="height:${Math.round(x.min / max * 100)}%"></i><span class="pr-tl">${lab(x.iso)}</span></div>`).join('')}</div>`; };
    const total = days.slice(-7).reduce((a, x) => a + x.min, 0), est = days.some(x => x.est) || weeks.some(x => x.est);
    const top = days.slice(-7).slice().sort((a, b) => b.min - a.min)[0], topW = weeks.slice().sort((a, b) => b.min - a.min)[0];
    const tod = R ? R.timeOfDay(s, Date.now() - 90 * 864e5) : null;
    const parts = tod ? tod.parts.map(p => ({ iso: p.name, min: p.pct || 0, q: p.q })) : [];
    return sec('time', 'Time practicing', `<div class="card pr-time"><div class="tabs pr-time-tabs" role="tablist" aria-label="Show"><button type="button" role="tab" class="tab on" aria-selected="true" data-time="days">Days</button><button type="button" role="tab" class="tab" aria-selected="false" data-time="weeks">Weeks</button>${tod ? '<button type="button" role="tab" class="tab" aria-selected="false" data-time="tod">Time of day</button>' : ''}</div>
        <div data-time-view="days"><div role="img" aria-label="${esc(days.map(x => `${label(x.iso, { month: 'short', day: 'numeric' })}: ${x.min} minutes`).join('; '))}">${bars(days, iso => label(iso, { weekday: 'narrow' }))}</div>
          ${say(total ? `${plural(total, 'minute')} in the last 7 days, the most on ${label(top.iso, { weekday: 'long' })} (${top.min}). A few minutes on most days works better than one long sitting.` : 'No practice in the last 7 days. Ten minutes today is a good start.')}
          ${srTable('Minutes practicing each day', ['Day', 'Minutes'], days.map(x => [label(x.iso, { weekday: 'short', month: 'short', day: 'numeric' }), x.min]))}</div>
        <div data-time-view="weeks" hidden><div role="img" aria-label="${esc(weeks.map(x => `week of ${label(x.iso, { month: 'short', day: 'numeric' })}: ${x.min} minutes`).join('; '))}">${bars(weeks, iso => label(iso, { month: 'short', day: 'numeric' }))}</div>
          ${say(`Each bar is a week, Monday to Sunday. The most was the week of ${label(topW.iso, { month: 'short', day: 'numeric' })}, with ${plural(topW.min, 'minute')}.`)}
          ${srTable('Minutes practicing each week', ['Week of', 'Minutes'], weeks.map(x => [label(x.iso, { month: 'short', day: 'numeric' }), x.min]))}</div>
        ${tod ? `<div data-time-view="tod" hidden><div role="img" aria-label="${esc(tod.parts.map(p => `${p.name}: ${p.q ? p.pct + '% right of ' + p.q + ' questions' : 'no practice'}`).join('; '))}">${bars(parts, n => n, x => (x.q ? x.min + '%' : ''))}</div>
          ${say(esc(R.timeSentence(tod)) + ' Bars show the share right the first time, over the last 90 days.')}
          ${srTable('Right the first time by time of day, last 90 days', ['Time of day', 'Questions', 'Right the first time'], tod.parts.map(p => [p.name, p.q, p.q ? p.pct + '%' : 'none']))}</div>` : ''}
        ${est ? '<p class="tiny muted" style="margin:8px 0 0">Minutes before November 9, 2026 are estimated from the questions answered.</p>' : ''}</div>`, { side: `<span class="muted small">${total} min in the last 7 days</span>` });
  }
  /** strongest and weakest skills at a glance (practiced at least three times) */
  function strongWeak(F) {
    const s = S.get(), seen = Object.keys(s.skills).filter(id => A.skills[id] && A.whereIs(id) && s.skills[id].tries >= 3 && inCourse(F, id));
    if (seen.length < 2) return '';
    const acc = id => s.skills[id].right / s.skills[id].tries;
    const strong = seen.filter(id => s.skills[id].level >= 2).sort((a, b) => s.skills[b].level - s.skills[a].level || acc(b) - acc(a)).slice(0, 3);
    const weak = seen.filter(id => !strong.includes(id) && (acc(id) < 0.75 || s.skills[id].level < 2)).sort((a, b) => acc(a) - acc(b)).slice(0, 3);
    const row = id => `<li>${lvl(s.skills[id].level)}<div class="name"><a href="${skillHref(id)}">${A.skills[id].title}</a><div class="sub">${Math.round(acc(id) * 100)}% right · ${plural(s.skills[id].tries, 'try', 'tries')}</div></div><div class="actions"><a class="btn sm" href="${practiceHref(id)}">Practice</a></div></li>`;
    return sec('sw', 'Strongest and needs work', `<div class="pr-sw">
      <div><h3 class="pr-sub">Strongest</h3><div class="card">${strong.length ? `<ul class="skills">${strong.map(row).join('')}</ul>` : '<p class="muted small" style="margin:0">Reach Familiar in a skill and it shows here.</p>'}</div></div>
      <div><h3 class="pr-sub">Needs work</h3><div class="card">${weak.length ? `<ul class="skills">${weak.map(row).join('')}</ul>` : '<p class="muted small" style="margin:0">Nothing weak right now. Nice work.</p>'}</div></div></div>`);
  }
  /** skills due for a refresher this week, by day (today includes anything overdue) */
  function dueWeek(F) {
    const s = S.get(), today = S.today(), end = S.dayShift(today, 6), by = {};
    E.dueSkills().filter(id => inCourse(F, id)).forEach(id => { (by[today] = by[today] || []).push(id); });
    Object.keys(s.skills).forEach(id => { const d = s.skills[id].due; if (A.skills[id] && A.whereIs(id) && inCourse(F, id) && d && d > today && d <= end) (by[d] = by[d] || []).push(id); });
    const days = Object.keys(by).sort(), n = days.reduce((a, d) => a + by[d].length, 0);
    const name = iso => (iso === today ? 'Today' : iso === S.dayShift(today, 1) ? 'Tomorrow' : new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long' }));
    return sec('due', 'Due this week', `<div class="card pr-due">${n ? `<p class="muted small" style="margin:0 0 8px">${plural(n, 'skill')} due for a quick refresher. Each comes back later and later as you keep getting it right.</p>
        <ul class="pr-due-days">${days.map(d => `<li><b>${name(d)}</b><span>${by[d].slice(0, 4).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${by[d].length > 4 ? `, and ${by[d].length - 4} more` : ''}</span></li>`).join('')}</ul>`
        : '<p class="muted" style="margin:0">Nothing is due this week. Skills come back for review a few days after you practice them.</p>'}</div>`, { side: '<a href="#/daily">Today’s practice →</a>' });
  }
  /** test scores over time: unit tests, challenges and practice tests */
  function testsCard(F) {
    const NAMES = { 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', 'chapter-test': 'Practice test', testout: 'Test-out' };
    const list = S.get().log.filter(e => NAMES[e.kind] && e.total && prIn(F, e)).slice(0, 30);
    if (!list.length) return '';
    const pts = list.slice(0, 12).reverse(), n = pts.length;
    const what = e => (e.title ? esc(e.title) : e.unit && A.unitById(e.course, e.unit) ? esc(A.unitById(e.course, e.unit).title) : e.course && A.courseById(e.course) ? esc(A.courseById(e.course).title) : '');
    const xy = (e, k) => [n === 1 ? 50 : 4 + k / (n - 1) * 92, 100 - Math.round(e.right / e.total * 100)];
    const p = e => Math.round(e.right / e.total * 100), when = e => new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const lastTwo = n >= 2 ? [p(pts[n - 1]), p(pts[n - 2])] : null;
    return sec('tests', 'Test scores', `<div class="card pr-tests">${n > 1 ? `<div class="pr-tchart" role="img" aria-label="${esc(pts.map(e => `${p(e)}%`).join(', '))}"><span class="pr-ty" style="top:0">100%</span><span class="pr-ty" style="top:50%">50%</span><span class="pr-ty" style="top:100%">0%</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="50" x2="100" y2="50" class="pr-tgrid"/><polyline points="${pts.map((e, k) => xy(e, k).join(',')).join(' ')}" vector-effect="non-scaling-stroke"/></svg>
        ${pts.map((e, k) => { const [x, y] = xy(e, k); return `<i class="pr-tdot" style="left:${x}%;top:${y}%"></i>`; }).join('')}</div>
        ${say(`Each dot is a test, oldest on the left. The latest score was ${lastTwo[0]}%, ${lastTwo[0] > lastTwo[1] ? `up from ${lastTwo[1]}%` : lastTwo[0] < lastTwo[1] ? `down from ${lastTwo[1]}%` : 'the same as'} the time before.`)}
        ${srTable('Test scores, oldest first', ['Date', 'Test', 'Score'], pts.map(e => [when(e), NAMES[e.kind] + (what(e) ? ': ' + plain(what(e)) : ''), `${e.right} of ${e.total} (${p(e)}%)`]))}` : ''}
        <ul class="log pr-tlist">${list.slice(0, 6).map(e => `<li><span class="when">${when(e)}</span><span><b>${NAMES[e.kind]}</b>${what(e) ? ' · ' + what(e) : ''}</span><span class="pts">${e.right} / ${e.total} · ${p(e)}%</span></li>`).join('')}</ul></div>`, { side: `<span class="muted small">${plural(list.length, 'test')}</span>` });
  }
  /** the period chosen (all time by default): totals, and topic practice and puzzles too */
  function periodSec(F, log) {
    const s = S.get(), R = window.REPORT, st = S.streak();
    let t;
    if (F.c) {
      const days = new Set(log.map(e => S.today(new Date(e.t))));
      t = { q: log.reduce((a, e) => a + (e.total || 0), 0), right: log.reduce((a, e) => a + Math.min(e.right || 0, e.total || 0), 0), active: days.size, pts: log.reduce((a, e) => a + (e.pts || 0), 0), min: null };
    } else if (F.from && R) t = R.sumDays(s, F.from, F.to);
    else t = { q: Object.values(s.days).reduce((a, d) => a + d.q, 0), right: Object.values(s.days).reduce((a, d) => a + (d.right || 0), 0), active: Object.values(s.days).filter(d => d.q).length, pts: s.points, min: null };
    const ups = R && F.on ? R.upsIn(s, F.since, F.until, F.ids).length : null;
    const tile = (big, label) => `<div class="tile"><div class="big">${big}</div><div class="label">${label}</div></div>`;
    const tiles = (F.on ? [] : [tile(st.days, st.days === 1 ? 'day in a row' : 'days in a row')]).concat([tile(fmt(t.pts), 'points'), tile(fmt(t.q), 'questions answered'), tile(`${t.q ? Math.round(t.right / t.q * 100) : 0}%`, 'correct on the first try'), tile(t.active, 'days practiced')],
      t.min != null ? [tile(fmt(t.min), 'minutes practicing')] : [], ups != null ? [tile(ups, ups === 1 ? 'skill leveled up' : 'skills leveled up')] : []);
    const ex = R && !F.c ? R.extrasList(R.extras(s, F.since, F.until === Infinity ? Date.now() + 864e5 : F.until)) : [];
    return sec('period', F.on ? esc(F.label + (F.c ? ' · ' + F.c.title : '')) : 'All time', `<div class="tiles">${tiles.join('')}</div>
      ${ex.length ? `<div class="pr-extras" aria-label="Topics and puzzles"><span class="small muted">Topics and puzzles:</span>${ex.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : ''}`);
  }
  /** a square for each day of the last 26 weeks, darker for more questions (only a course's, when one is chosen) */
  function activitySec(F, log) {
    const s = S.get(), today = S.today(), dow = (new Date(today + 'T12:00').getDay() + 6) % 7, start = S.dayShift(today, -(dow + 7 * 25));
    const byDay = {};
    if (F.c) S.get().log.filter(e => e.t >= 0 && window.REPORT.entryIn(e, F.c, F.ids)).forEach(e => { const iso = S.today(new Date(e.t)); byDay[iso] = (byDay[iso] || 0) + (e.total || 0); });
    let cells = '', active = 0, run = 0, longest = 0;
    const rows = [];
    for (let k = 0; k < 26 * 7; k++) {
      const iso = S.dayShift(start, k), q = F.c ? byDay[iso] || 0 : (s.days[iso] || {}).q || 0;
      const out = (F.from && iso < F.from) || (F.to && iso > F.to);
      if (iso <= today) { if (q) { active++; run++; longest = Math.max(longest, run); rows.push([shortDay(iso), q]); } else run = 0; }
      const cls = (!q ? '' : q < 5 ? 'h1' : q < 15 ? 'h2' : q < 30 ? 'h3' : 'h4') + (out ? ' out' : '');
      cells += `<span class="${cls.trim()}" title="${iso}: ${plural(q, 'question')}"${iso > today ? ' style="visibility:hidden"' : ''}></span>`;
    }
    return sec('activity', 'Activity', `<div class="card"><div class="heat" aria-label="Questions answered per day">${cells}</div>
      ${say(active ? `Each square is a day; darker means more questions. ${plural(active, 'day')} of practice in the last 26 weeks, ${longest > 1 ? `with ${longest} in a row at best` : 'none of them in a row yet'}.` : 'Each square is a day; it fills in on the days you practice.')}
      ${srTable('Days with practice in the last 26 weeks', ['Day', 'Questions'], rows)}</div>`, { side: '<span class="muted small">last 26 weeks</span>' });
  }
  /** mastery over every skill (or a course's), with the courses being learned first */
  function masterySec(F) {
    const s = S.get(), ids = F.c ? A.courseSkills(F.c) : Object.keys(A.skills), levels = [0, 0, 0, 0, 0];
    ids.forEach(id => { levels[S.skill(id).level] += 1; });
    const row = c => { const cids = A.courseSkills(c), m = E.mastery(cids); return `<tr><td><a href="${courseHref(c)}">${esc(c.title)}</a></td><td style="width:40%"><div class="row"><div class="pbar" style="flex:1" ${courseVar(c)}><span style="width:${m.pct}%"></span></div><b class="small">${m.pct}%</b></div></td><td class="small muted">${m.counts[4]} / ${m.counts[3]} / ${m.counts[2]} / ${m.counts[1]}</td></tr>`; };
    const head = '<thead><tr><th>Course</th><th>Mastery</th><th class="small">M / P / F / A</th></tr></thead>';
    const mine = F.c ? [F.c] : A.courses.filter(c => s.profile.enrolled.includes(c.id) || A.courseSkills(c).some(id => S.skill(id).level > 0)), rest = F.c ? [] : A.courses.filter(c => !mine.includes(c));
    return sec('mastery', 'Mastery', `<div class="card">${legend(levels)}<div style="margin-top:10px">${mbar(ids)}</div>
      ${say(`${plural(levels[4], 'skill')} mastered and ${levels[3]} proficient, of ${fmt(ids.length)} ${F.c ? 'in ' + esc(F.c.title) : 'in every course'}. The bar fills in as skills level up.`)}
      ${mine.length ? `<table class="plain" style="margin-top:14px">${head}<tbody>${mine.map(row).join('')}</tbody></table>` : ''}
      ${rest.length ? `<details class="all-courses" ${mine.length ? '' : 'open'}><summary>${mine.length ? `All courses (${rest.length} more)` : 'All courses'}</summary><table class="plain">${head}<tbody>${rest.map(row).join('')}</tbody></table></details>` : ''}</div>`);
  }
  /** every course, a square for each skill filled to its level (courses being learned first; only the chosen course, when there is one) */
  function masteryMap(F) {
    const s = S.get(), mine = F && F.c ? [F.c] : A.courses.filter(c => s.profile.enrolled.includes(c.id) || A.courseSkills(c).some(id => S.skill(id).level > 0)), rest = F && F.c ? [] : A.courses.filter(c => !mine.includes(c));
    const row = c => `<li><a class="pr-map-name" href="${courseHref(c)}">${esc(c.title)}</a><span class="sm-cells pr-map-cells">${A.courseSkills(c).map(id => `<a class="sm-cell l${S.skill(id).level}" href="${skillHref(id)}" title="${esc(plain(A.skills[id].title))}: ${A.LEVELS[S.skill(id).level]}" aria-label="${esc(plain(A.skills[id].title))}, ${A.LEVELS[S.skill(id).level]}"></a>`).join('')}</span></li>`;
    const counts = c => { const k = [0, 0, 0, 0, 0]; A.courseSkills(c).forEach(id => { k[S.skill(id).level]++; }); return k; };
    const lead = mine[0], lc = lead ? counts(lead) : null;
    return sec('map', 'Mastery map', `<div class="card pr-map">${legend()}${mine.length ? `<ul class="pr-map-list">${mine.map(row).join('')}</ul>` : ''}
        ${rest.length ? `<details class="all-courses" ${mine.length ? '' : 'open'}><summary>${mine.length ? `Every other course (${rest.length})` : 'Every course'}</summary><ul class="pr-map-list">${rest.map(row).join('')}</ul></details>` : ''}
        ${say(lead ? `Each square is a skill, filled in as it levels up. ${esc(lead.title)}: ${lc[3] + lc[4]} of ${A.courseSkills(lead).length} skills Proficient or better.` : 'Each square is a skill, filled in as it levels up. Select one to open it.')}
        ${srTable('Skills at each level, by course', ['Course', 'Mastered', 'Proficient', 'Familiar', 'Attempted', 'Not started'], mine.map(c => { const k = counts(c); return [c.title, k[4], k[3], k[2], k[1], k[0]]; }))}</div>`, { side: '<span class="muted small">a square for every skill</span>' });
  }
  /** mastery by area (numbers, fractions, geometry…) across the courses being learned */
  function areasSec(F) {
    const R = window.REPORT, list = R.areas(S.get(), F.c ? A.courseSkills(F.c) : null).filter(a => a.n);
    if (!list.some(a => a.started)) return '';
    const top = list.filter(a => a.started).sort((a, b) => b.pct - a.pct)[0], low = list.slice().sort((a, b) => a.pct - b.pct || b.n - a.n)[0];
    return sec('areas', 'Mastery by area', `<div class="card pr-areas"><ul class="pr-area-list">${list.map(a => `<li><span class="pr-area-name">${esc(a.name)}</span><span class="pbar" role="img" aria-label="${a.pct}% mastery"><span style="width:${a.pct}%"></span></span><span class="small muted">${a.pct}% · ${a.counts[4] + a.counts[3]} of ${a.n} Proficient or better</span></li>`).join('')}</ul>
      ${say(`Every skill ${F.c ? 'in ' + esc(F.c.title) : 'in the courses you’re learning'}, sorted by area. The strongest is ${esc(top.name.toLowerCase())} (${top.pct}%)${low && low !== top ? `, and the most to learn is in ${esc(low.name.toLowerCase())}` : ''}.`)}
      ${srTable('Mastery by area', ['Area', 'Skills', 'Proficient or better', 'Mastery'], list.map(a => [a.name, a.n, a.counts[3] + a.counts[4], a.pct + '%']))}</div>`, { side: '<span class="muted small">across courses</span>' });
  }
  /** when each saved course should be finished, at the pace of the last four weeks */
  function forecastSec(F) {
    const R = window.REPORT, s = S.get(), cs = F.c ? [F.c] : s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).slice(0, 4);
    if (!cs.length) return '';
    return sec('forecast', 'When you’ll finish', `<div class="card pr-forecast"><ul class="pr-fc-list">${cs.map(c => { const f = R.forecast(s, c); return `<li><div class="row between" style="gap:10px;flex-wrap:wrap"><a href="${courseHref(c)}"><b>${esc(c.title)}</b></a><span class="small muted">${f.done} of ${f.total} skills Proficient or better</span></div>
      <div class="pbar" ${courseVar(c)} role="img" aria-label="${f.pct}% of skills Proficient or better"><span style="width:${f.pct}%"></span></div><p class="small" style="margin:6px 0 0">${esc(R.forecastSentence(f))}</p></li>`; }).join('')}</ul>
      <p class="tiny muted" style="margin:10px 0 0">A course counts as finished when every skill is Proficient or better. The pace is how many skills reached Proficient in the last four weeks.</p></div>`);
  }
  /** a skill's growth: its level over time, and each time it was practiced */
  function growthView(sid) {
    const R = window.REPORT, g = R.growth(S.get(), sid);
    if (!A.skills[sid]) return '';
    const ev = g.ev, t0 = ev.length ? ev[0].t : Date.now(), t1 = Date.now(), span = Math.max(1, t1 - t0);
    const x = t => (ev.length < 2 && t === t0 ? 2 : 2 + (t - t0) / span * 96), y = l => 92 - l * 21;
    let lv = ev.length && ev[0].from != null ? ev[0].from : 0, d = `M${x(t0).toFixed(2)},${y(lv)}`;
    const dots = [];
    ev.forEach(e => { if (e.to != null && e.to !== lv) { d += ` H${x(e.t).toFixed(2)} V${y(e.to)}`; lv = e.to; } dots.push(`<i class="pr-gdot${e.to != null && e.to > (e.from || 0) ? ' up' : ''}" style="left:${x(e.t)}%;top:${y(e.to != null ? e.to : lv)}%" title="${esc(new Date(e.t).toLocaleDateString())}"></i>`); });
    d += ` H98`;
    const names = { practice: 'Practice', review: 'Review', daily: 'Today’s practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'CPM practice', 'chapter-test': 'Practice test', placement: 'Starting-point check', testout: 'Test-out', topic: 'Practice on a topic', sprint: 'Speed sprint' };
    const first = ev[0], ups = ev.filter(e => e.to != null && e.to > (e.from || 0));
    const days = first ? Math.max(1, Math.round((t1 - first.t) / 864e5)) : 0;
    return `<div class="pr-growth-chart" role="img" aria-label="${esc(plain(A.skills[sid].title))}: ${A.LEVELS[g.level]} now${first ? `, first practiced ${new Date(first.t).toLocaleDateString()}` : ''}">
        ${[4, 3, 2, 1, 0].map(l => `<span class="pr-gy" style="top:${y(l)}%">${A.LEVELS[l]}</span>`).join('')}
        <div class="pr-gplot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${[0, 1, 2, 3, 4].map(l => `<line x1="0" x2="100" y1="${y(l)}" y2="${y(l)}" class="pr-tgrid"/>`).join('')}<path d="${d}" vector-effect="non-scaling-stroke"/></svg>${dots.join('')}</div></div>
      ${say(first ? `Now ${A.LEVELS[g.level]}, after ${plural(ev.length, 'practice', 'practices')} over ${plural(days, 'day')}${ups.length ? `; it moved up ${plural(ups.length, 'time')}` : ''}. ${g.tries ? `${Math.round(g.right / g.tries * 100)}% right so far.` : ''}` : `${A.LEVELS[g.level]}. Its history starts with the next practice.`)}
      ${ev.length ? `<ol class="pr-growth-list">${ev.slice().reverse().slice(0, 10).map(e => `<li><span class="when">${new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span>${esc(names[e.kind] || e.kind)}${e.total ? ` <span class="muted">${e.right}/${e.total}</span>` : ''}</span>${e.to != null && e.to !== e.from ? `<span class="chip ${e.to > e.from ? 'up' : 'down'}">${A.LEVELS[e.to]}</span>` : '<span></span>'}</li>`).join('')}</ol>` : ''}
      ${srTable('Each practice of this skill', ['Date', 'What', 'Score', 'Level after'], ev.map(e => [new Date(e.t).toLocaleDateString(), names[e.kind] || e.kind, e.total ? `${e.right} of ${e.total}` : '', e.to != null ? A.LEVELS[e.to] : '']))}
      <div class="btn-row"><a class="btn sm" href="${practiceHref(sid)}">Practice it</a><a class="btn sm ghost" href="${skillHref(sid)}">Open the lesson</a></div>`;
  }
  function growthSec(F) {
    const R = window.REPORT, list = R.grownSkills(S.get()).filter(id => inCourse(F, id)).slice(0, 80);
    if (!list.length) return '';
    const want = prPrefs().growth, sid = list.includes(want) ? want : list[0];
    return sec('growth', 'Skill growth', `<div class="card pr-growth"><label class="field pr-growth-pick"><span class="label">Skill</span><select id="pr-growth-skill">${list.map(id => `<option value="${esc(id)}" ${id === sid ? 'selected' : ''}>${esc(plain(A.skills[id].title))}</option>`).join('')}</select></label>
      <div id="pr-growth-view">${growthView(sid)}</div></div>`, { side: '<span class="muted small">a timeline for each skill</span>' });
  }
  /** goals: the last eight weeks against them, and when they changed */
  function goalsSec() {
    const R = window.REPORT, g = R.goalHistory(S.get(), 8), met = g.rows.filter(r => r.met && !r.now).length;
    if (!g.rows.some(r => r.days)) return '';
    return sec('goals', 'Goal history', `<div class="card pr-goals"><p class="small" style="margin:0 0 10px">Your goals now: <b>${plural(g.cur.goal, 'question')} a day</b> and <b>practice on ${g.cur.week} days a week</b>. <a href="#/settings">Change them</a></p>
      <div class="mtable-wrap"><table class="plain pr-gtable"><thead><tr><th scope="col">Week of</th><th scope="col">Days practiced</th><th scope="col">Daily goal met</th><th scope="col">Weekly goal</th></tr></thead>
      <tbody>${g.rows.slice().reverse().map(r => `<tr><th scope="row">${shortDay(r.mon)}${r.now ? ' <span class="small muted">(this week)</span>' : ''}</th><td>${plural(r.days, 'day')}</td><td>${plural(r.goalDays, 'day')} <span class="small muted">(${r.goal} questions)</span></td><td>${r.met ? '<span class="chip fit-mine">Reached</span>' : r.now ? '<span class="small muted">In progress</span>' : '<span class="small muted">Not this time</span>'} <span class="small muted">(${r.week} days)</span></td></tr>`).join('')}</tbody></table></div>
      ${say(`The weekly goal was reached in ${met} of the last ${g.rows.length - 1} full weeks.`)}
      ${g.changes.length ? `<h3 class="pr-sub">Changes</h3><ul class="pr-gchanges">${g.changes.slice(0, 6).map(c => `<li><span class="when">${new Date(c.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>${c.goal !== c.was.goal ? `Daily goal ${c.goal > c.was.goal ? 'raised' : 'lowered'} from ${c.was.goal} to ${c.goal} questions.` : ''} ${c.week !== c.was.week ? `Weekly goal changed from ${c.was.week} to ${c.week} days.` : ''}</li>`).join('')}</ul>` : ''}</div>`);
  }

  /* ---------- settings ---------- */
  /** Profile and Settings: one tab strip on both pages */
  const meTabs = on => `<nav class="tabs me-tabs" aria-label="Your profile and settings">${[['profile', 'Profile'], ['settings', 'Settings']].map(([id, label]) => `<a class="tab${id === on ? ' on' : ''}" href="#/${id}"${id === on ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  /** who is signed in, with Sync now, or the way to save online; and Switch learner when there are several */
  function meLine() {
    const me = window.ACCOUNT && ACCOUNT.user(), many = window.LEARNERS && LEARNERS.count() > 1;
    const acct = me && !me.waiting ? `Signed in as <b>@${esc(me.username)}</b><span class="muted" id="me-sync"> · ${syncWords()}</span><button class="btn sm" type="button" id="me-sync-now">Sync now</button>`
      : window.ACCOUNT && ACCOUNT.enabled() && !window.PROCADEMY_OFFLINE ? `<span class="muted">Not signed in. Your progress is saved on this device.</span><a class="btn sm" href="#/profile">Save it online</a>` : '';
    return acct || many ? `<div class="me-line">${acct}${many ? `<a class="btn sm" href="#/profile" id="me-switch">Switch learner</a>` : ''}</div>` : '';
  }
  function syncWords() {
    const st = window.ACCOUNT ? ACCOUNT.status() : { state: 'off' };
    return st.state === 'saving' ? 'saving…' : st.state === 'saved' ? `saved online${st.at ? ' at ' + new Date(st.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}` : st.state === 'offline' ? 'offline; it saves when you’re back online' : st.state === 'error' ? 'not saved yet' : 'saved online';
  }
  function wireMeLine(root) {
    const sw = root.querySelector('#me-switch');
    if (sw) sw.addEventListener('click', () => { try { sessionStorage.setItem('procademy.goLearners', '1'); } catch (e) { /* the Profile page opens at the top */ } });
    const b = root.querySelector('#me-sync-now');
    if (!b) return;
    const off = ACCOUNT.on(() => { const t = root.querySelector('#me-sync'); if (!t || !t.isConnected) { off(); return; } t.textContent = ' · ' + syncWords(); });
    b.addEventListener('click', async () => { b.disabled = true; await ACCOUNT.push(); b.disabled = false; toast(ACCOUNT.status().state === 'saved' ? 'Saved online' : ACCOUNT.status().error || 'It couldn’t be saved just now'); });
  }

  /** a setting with a few choices, as one row of pill buttons (a radio group) */
  const seg = (id, label, help, opts, cur) => `<div class="set-row"><div class="set-text"><span class="set-label" id="${id}-l">${label}</span>${help ? `<span class="set-help">${help}</span>` : ''}</div>
    <div class="seg" id="${id}" role="radiogroup" aria-labelledby="${id}-l">${opts.map(([v, l, lang]) => `<button type="button" role="radio" aria-checked="${String(v) === String(cur)}" data-v="${v}"${lang ? ` lang="${lang}"` : ''}>${l}</button>`).join('')}</div></div>`;
  /** an on/off setting, as a switch */
  const toggle = (id, label, help, on) => `<label class="set-row" for="${id}"><span class="set-text"><span class="set-label">${label}</span>${help ? `<span class="set-help">${help}</span>` : ''}</span><input type="checkbox" class="switch" id="${id}" ${on ? 'checked' : ''}></label>`;
  function settings(root) {
    const p = S.get().profile;
    const skillCount = Object.keys(A.skills).length;
    const grade = p.adult ? 'adult' : p.grade == null ? '' : String(p.grade);
    root.innerHTML = `
      <div class="settings">
      ${meTabs('settings')}
      <h1>Settings</h1>
      ${meLine()}
      <div class="settings-grid">
        <section class="card set-card"><h2>You</h2>
          <div class="set-row"><label class="set-text" for="name"><span class="set-label">Your name</span><span class="set-help">For the greeting on Home</span></label><input id="name" class="set-input" type="text" value="${esc(p.name)}" placeholder="Optional" autocomplete="off"></div>
          <div class="set-row"><label class="set-text" for="grade"><span class="set-label">Grade</span><span class="set-help">Sets the puzzle of the day, the tutor and topic practice to your level</span></label><select id="grade" class="set-input"><option value="">Not set</option>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">${ordinal(g)}</option>`).join('')}<option value="adult">Adult learner</option></select></div>
          ${window.COACH && COACH.canSpeak() ? toggle('auto-read', 'Read questions aloud', 'Every practice question, in this device’s voice', p.autoRead) : ''}
        </section>
        <section class="card set-card"><h2>Look</h2>
          ${seg('theme', 'Colors', '', [['system', 'Device'], ['light', 'Light'], ['dark', 'Dark']], p.theme || 'system')}
          ${seg('blue', 'Blue', '', [['classic', 'Classic'], ['ocean', 'Ocean'], ['navy', 'Navy'], ['sky', 'Sky']].map(([v, l]) => [v, `<span class="blue-dot" data-b="${v}" aria-hidden="true"></span>${l}`]), p.blue || 'classic')}
          ${toggle('contrast', 'High contrast', 'Black and white with a deep blue, and outlines on everything', p.contrast === 'high')}
          ${seg('size', 'Text size', '', [['normal', 'Normal'], ['large', 'Large'], ['xlarge', 'Extra large']], p.textSize || 'normal')}
          ${toggle('easy-read', 'Easier-to-read text', 'A clearer typeface with more space', p.easyRead)}
          ${p.easyRead ? seg('read-font', 'Reading font', 'OpenDyslexic is made for readers with dyslexia', [['clear', 'Clearer'], ['dyslexic', 'OpenDyslexic']], p.readFont || 'clear') : ''}
          ${toggle('less-motion', 'Less motion', 'Fewer slides and animations', p.reduceMotion)}
          ${seg('lang', 'Menus and buttons', 'Lessons, questions and the tutor stay in English', Object.entries(window.LANG ? LANG.NAMES : { en: 'English' }).map(([k, n]) => [k, n, k]), p.lang || 'en')}
          <div class="set-foot"><button class="btn sm ghost" type="button" id="look-reset">Reset to defaults</button></div>
        </section>
        <section class="card set-card"><h2>Goals</h2>
          ${seg('goal', 'Questions a day', 'The ring on Home. All practice counts', [10, 20, 30, 50].map(n => [n, String(n)]), Number(p.goal || 20))}
          ${seg('week-goal', 'Days a week', 'Shown in today’s plan on Home', [3, 4, 5, 6, 7].map(n => [n, String(n)]), Number(p.weekGoal || 5))}
          <div class="set-row"><label class="set-text" for="quiet"><span class="set-label">Quiet hours</span><span class="set-help">No sounds, and reminders skip these hours</span></label><select id="quiet" class="set-input">${QUIET.map(([v, l]) => `<option value="${v}" ${v === quietKey(p.quiet) ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="set-row set-remind"><div class="set-text"><span class="set-label">A practice reminder</span><span class="set-help">Added to the calendar on your phone or computer</span></div>
            <div class="set-remind-pick"><label class="visually-hidden" for="rm-days">Which days</label><select id="rm-days" class="set-input"><option value="daily">Every day</option><option value="school">School days</option><option value="weekend">Weekends</option></select>
              <label class="visually-hidden" for="rm-hour">What time</label><select id="rm-hour" class="set-input">${[7, 8, 15, 16, 17, 18, 19, 20].map(h => `<option value="${h}" ${h === 16 ? 'selected' : ''}>${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'pm' : 'am'}</option>`).join('')}</select>
              <button class="btn sm" type="button" id="rm-add">Add to calendar</button></div></div>
        </section>
        <section class="card set-card"><h2>Your progress</h2>
          <p class="muted small">Everything is saved in this browser. Save a copy to keep it safe, or load it on another device.</p>
          <div class="btn-row" style="margin-top:0"><button class="btn primary" id="export">Save a copy</button><label class="btn">Load a copy <input id="import" type="file" accept="application/json,.json" class="visually-hidden"></label></div>
          ${window.MOVE ? MOVE.box() : ''}
          <div class="set-sub"><h3>As a spreadsheet</h3><p class="muted small">Every day’s questions and minutes, or every skill’s level, to open in Excel, Numbers or Google Sheets.</p>
            <div class="btn-row" style="margin-top:0"><button class="btn sm" type="button" id="csv-days">Download days</button><button class="btn sm" type="button" id="csv-skills">Download skills</button></div></div>
        </section>
        ${window.INSTALL ? INSTALL.slot('settings') : ''}
        <section class="card set-card" id="offline-card"><h2>Use it without the internet</h2>
          ${window.PROCADEMY_OFFLINE ? `<p class="muted small">This is Procademy’s offline file (build ${esc(window.PROCADEMY_OFFLINE.build)}). Every course, practice set, test and drawing works here with no internet. The AI tutor, pictures and reading attached photos and PDFs work when there is an internet connection.</p>
            <p class="muted small">Progress made in this file is saved in this browser, separately from the website. To carry it across, use <b>Save a copy</b> in one and <b>Load a copy</b> in the other. For the newest version, download the file again from the website’s settings.</p>`
          : `<p class="muted small"><b>On a computer:</b> download Procademy as one file and open it with a double-click. Every course, practice set and drawing works with no internet; the tutor needs it. <b>On a phone or tablet:</b> install the app.</p>
            <div class="btn-row" style="margin-top:0"><a class="btn primary" href="procademy-offline.html" download="procademy-offline.html">Download the offline file</a></div>
            <p class="tiny muted" style="margin:10px 0 0">The offline file keeps its own progress: move it with Save a copy and Load a copy.</p>`}
        </section>
        <section class="card set-card" id="lock-card"></section>
        <section class="card set-card"><div class="row between" style="flex-wrap:wrap;gap:8px;margin-bottom:8px"><h2 style="margin:0">About</h2><span class="btn-row" style="margin:0"><button class="btn sm" type="button" data-tour-again>Take the tour again</button><a class="btn sm" href="#/new">What’s new</a></span></div><p class="muted small">${A.courses.length} courses, ${skillCount} skills. Every question is made on this device, so a missed one can be asked again exactly as it was. Progress stays here unless you make an account. Only what you ask the AI is sent, to a free AI service. <a href="${(window.MOVE ? MOVE.siteBase() : '').replace(/[^/]*$/, '')}privacy.html">Privacy</a> · <a href="#/new">Updates</a> · <a href="https://github.com/priyaanh/procademy">Source on GitHub</a></p></section>
      </div></div>`;
    /** a row of pill buttons: mark the choice, then fn(value) */
    const onSeg = (id, fn) => { const g = root.querySelector('#' + id); if (g) g.addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (!b) return; g.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-checked', String(x === b))); fn(b.dataset.v); }); };
    if (window.MOVE) MOVE.wire(root);
    root.querySelector('#grade').value = grade;
    root.querySelector('#name').addEventListener('input', ev => { S.setProfile({ name: ev.target.value.slice(0, 40) }); window.APP.applyPrefs(); });
    root.querySelector('#grade').addEventListener('change', ev => { setGrade(ev.target.value); toast('Saved'); });
    onSeg('theme', v => { S.setProfile({ theme: v }); window.APP.applyPrefs(); });
    onSeg('size', v => { S.setProfile({ textSize: v }); window.APP.applyPrefs(); });
    onSeg('lang', v => { S.setProfile({ lang: v }); window.APP.applyPrefs(); });
    root.querySelector('#less-motion').addEventListener('change', ev => { S.setProfile({ reduceMotion: ev.target.checked }); window.APP.applyPrefs(); });
    root.querySelector('#easy-read').addEventListener('change', ev => { S.setProfile({ easyRead: ev.target.checked }); window.APP.applyPrefs(); settings(root); const er = root.querySelector('#easy-read'); if (er) er.focus(); });
    root.querySelector('#contrast').addEventListener('change', ev => { S.setProfile({ contrast: ev.target.checked ? 'high' : null }); window.APP.applyPrefs(); });
    onSeg('blue', v => { S.setProfile({ blue: v }); window.APP.applyPrefs(); });
    onSeg('read-font', v => { S.setProfile({ readFont: v }); window.APP.applyPrefs(); });
    const ar = root.querySelector('#auto-read'); if (ar) ar.addEventListener('change', ev => { S.setProfile({ autoRead: ev.target.checked }); toast(ev.target.checked ? 'Questions will be read aloud' : 'Read-aloud off'); });
    onSeg('goal', v => { S.setProfile({ goal: Number(v) }); toast('Daily goal: ' + v + ' questions'); });
    onSeg('week-goal', v => { S.setProfile({ weekGoal: Number(v) }); toast('Weekly goal: ' + v + ' days'); });
    root.querySelector('#look-reset').addEventListener('click', () => { S.setProfile({ theme: 'system', textSize: 'normal', easyRead: false, lang: 'en', blue: 'classic', contrast: null, readFont: 'clear' }); window.APP.applyPrefs(); settings(root); toast('Colors, text and language are back to how they started'); });
    wireMeLine(root);
    root.querySelector('#quiet').addEventListener('change', ev => { S.setProfile({ quiet: QUIET_SET[ev.target.value] || null }); toast(ev.target.value === 'off' ? 'Quiet hours off' : 'Quiet hours saved'); });
    root.querySelector('#rm-add').addEventListener('click', () => {
      const h = Number(root.querySelector('#rm-hour').value), days = root.querySelector('#rm-days').value, at = new Date(); at.setHours(h, 0, 0, 0);
      if (S.quietNow(at)) { toast('That time is inside your quiet hours. Choose another time.'); return; }
      reminderIcs(h, days);
    });
    root.querySelector('#csv-days').addEventListener('click', () => download(`procademy-days-${S.today()}.csv`, csvDays(), 'text/csv'));
    root.querySelector('#csv-skills').addEventListener('click', () => download(`procademy-skills-${S.today()}.csv`, csvSkills(), 'text/csv'));
    root.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `procademy-backup-${S.today()}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Saved a copy');
    });
    root.querySelector('#import').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return;
      ev.target.value = '';
      const rd = new FileReader();
      const load = () => { try { S.importJSON(String(rd.result)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Loaded your copy'); } catch (e) { toast(e.message || 'Couldn’t read that file'); } };
      // a copy replaces the progress here, so with a lock it waits for the PIN or password
      rd.onload = () => (LOCK && LOCK.locked() ? lockPanel('load', load) : load());
      rd.readAsText(f);
    });
    drawLock();
  }

  /* ---------- settings: quiet hours, a reminder, spreadsheets, and the weekly copies kept on this device ---------- */
  const QUIET = [['off', 'Off'], ['20-7', '8 pm to 7 am'], ['21-7', '9 pm to 7 am'], ['22-7', '10 pm to 7 am'], ['21-8', '9 pm to 8 am'], ['22-6', '10 pm to 6 am']];
  const QUIET_SET = Object.fromEntries(QUIET.filter(([v]) => v !== 'off').map(([v]) => { const [from, to] = v.split('-').map(Number); return [v, { from, to }]; }));
  const quietKey = q => (q && q.from != null ? `${q.from}-${q.to}` : 'off');
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    window.VIEWS._lastDownload = { name, text };
  }
  const csvCell = v => { const t = String(v == null ? '' : v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  function csvDays() {
    const d = S.get().days;
    return csv([['Date', 'Questions', 'Right the first time', 'Percent right', 'Minutes', 'Points']].concat(Object.keys(d).filter(k => d[k].q).sort().map(k => [k, d[k].q, d[k].right || 0, d[k].q ? Math.round((d[k].right || 0) / d[k].q * 100) : 0, S.minutes(d[k]), d[k].pts || 0])));
  }
  function csvSkills() {
    const s = S.get(), when = t => (t ? new Date(t).toISOString().slice(0, 10) : '');
    return csv([['Course', 'Unit', 'Skill', 'Level', 'Tries', 'Right', 'Percent right', 'Last practiced', 'Next review']].concat(Object.keys(s.skills).filter(id => A.skills[id] && A.whereIs(id) && s.skills[id].tries).map(id => { const w = A.whereIs(id), k = s.skills[id]; return [w.course.title, w.unit.title, plain(A.skills[id].title), A.LEVELS[k.level], k.tries, k.right, Math.round(k.right / k.tries * 100), when(k.last), k.due || '']; }).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))));
  }
  /** a calendar file with a repeating practice reminder at hour h (every day, school days or weekends) */
  function reminderIcs(h, days) {
    const d = new Date(); d.setDate(d.getDate() + (d.getHours() >= h ? 1 : 0));
    const ymd = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0');
    const rule = days === 'school' ? 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' : days === 'weekend' ? 'RRULE:FREQ=WEEKLY;BYDAY=SA,SU' : 'RRULE:FREQ=DAILY';
    const want = days === 'school' ? [1, 2, 3, 4, 5] : days === 'weekend' ? [0, 6] : null;
    while (want && !want.includes(d.getDay())) d.setDate(d.getDate() + 1);          // the first one falls on a day it repeats on
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'), site = window.MOVE ? MOVE.siteBase() : location.href.split('#')[0];
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Practice reminder//EN', 'BEGIN:VEVENT', `UID:procademy-remind-${Date.now()}@procademy`, `DTSTAMP:${stamp}`,
      `DTSTART:${ymd(d)}T${String(h).padStart(2, '0')}0000`, 'DURATION:PT15M', rule, 'SUMMARY:Procademy: today’s practice (10 minutes)', `DESCRIPTION:Open Procademy for today’s practice: ${site}#/daily`, `URL:${site}#/daily`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Time for Procademy', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    download('procademy-reminder.ics', ics, 'text/calendar');
    toast('Open the downloaded file to add the reminder');
  }
  function copiesHtml() {
    const list = S.copies(), when = t => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return `<h3>Copies kept on this device</h3><p class="muted small">Once a week Procademy keeps a copy of your progress here, so you can go back to it if something goes wrong.</p>
      ${list.length ? `<ul class="set-copies">${list.map((c, i) => `<li><span>${when(c.t)}</span><button class="btn sm" type="button" data-copy="${i}">Go back to this copy</button></li>`).join('')}</ul>` : '<p class="small muted">No copy yet. The first one is made after you practice.</p>'}
      <div class="btn-row" style="margin-top:6px"><button class="btn sm ghost" type="button" id="copy-now">Keep a copy now</button></div>`;
  }
  function wireCopies(root) {
    const box = root.querySelector('#copies'); if (!box) return;
    box.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.id === 'copy-now') { S.copyNow(); box.innerHTML = copiesHtml(); toast('A copy is kept on this device'); return; }
      if (b.dataset.copy == null) return;
      const go = () => { try { S.restoreCopy(Number(b.dataset.copy)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Back to that copy. The progress you had is kept as the newest copy.'); } catch (e) { toast(e.message); } };
      // going back replaces the progress here, so it asks like loading a copy does
      if (LOCK && LOCK.locked()) lockPanel('load', go); else if (confirm('Go back to this copy? The progress you have now is kept as the newest copy.')) go();
    });
  }

  /* ---------- settings: erasing all progress, behind the account's password when there is one (ACCOUNT.lock) ---------- */
  let LOCK = null, lockRoot = null;          // ACCOUNT loads after this file, so the lock is looked up when Settings draws
  function drawLock() {
    const card = document.getElementById('lock-card');
    if (!card) return;
    lockRoot = card; LOCK = (window.ACCOUNT && ACCOUNT.lock) || null;
    const signedIn = window.ACCOUNT && ACCOUNT.user() && !ACCOUNT.user().waiting;
    card.innerHTML = `<h2>Start over</h2>
      <p class="muted small">Erases every level, point and streak${signedIn ? ', here and in your account' : ' on this device'}. A copy you saved isn’t touched.${LOCK && LOCK.locked() ? ' Your account password is needed.' : ''}</p>
      <button class="btn" type="button" id="reset">Erase all progress</button>
      <div id="lock-panel"></div>
      <div class="set-sub" id="copies">${copiesHtml()}</div>`;
    wireCopies(card.closest('#main') || document.getElementById('main'));
    card.querySelector('#reset').addEventListener('click', () => lockPanel('erase'));
  }
  /** the form under the card: erase, or load a copy (then done()); signed in with a password, it asks for it */
  function lockPanel(job, done) {
    const panel = lockRoot && lockRoot.querySelector('#lock-panel');
    if (!panel) return;
    const proof = !!(LOCK && LOCK.locked());
    const what = { erase: ['Erase all progress?', 'Erase all progress'], load: ['Load this copy?', 'Load it'] }[job];
    panel.innerHTML = `<form class="lock-form" id="lock-form" autocomplete="off"><h3>${what[0]}</h3>
      <p class="small muted">${job === 'erase' ? 'This can’t be undone.' : 'Loading a copy replaces the progress here.'}</p>
      ${proof ? '<div class="field"><label for="lk-proof">Your account password</label><input id="lk-proof" type="password" autocomplete="current-password"></div>' : ''}
      <div class="btn-row"><button class="btn sm primary" type="submit" id="lk-go">${what[1]}</button><button class="btn sm ghost" type="button" id="lk-cancel">Cancel</button></div>
      <p class="ac-msg" role="alert" id="lk-msg"></p></form>`;
    const f = panel.querySelector('#lock-form'), msg = f.querySelector('#lk-msg');
    if (window.ACCOUNT && ACCOUNT.reveal) ACCOUNT.reveal(f);
    const busy = on => f.querySelectorAll('input, button').forEach(x => { x.disabled = on; });
    f.querySelector('#lk-cancel').addEventListener('click', () => { panel.innerHTML = ''; });
    (f.querySelector('#lk-proof') || f.querySelector('#lk-cancel')).focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    f.addEventListener('submit', async ev => {
      ev.preventDefault();
      busy(true); msg.textContent = proof ? 'Checking…' : '';
      try {
        if (proof && !await LOCK.check(f.querySelector('#lk-proof').value)) { busy(false); f.querySelector('#lk-proof').select(); msg.textContent = 'That isn’t your account password.'; return; }
        if (job === 'load') { done(); return; }
        S.reset(); window.APP.applyPrefs(); window.APP.refreshStats(); toast('Erased'); settings(document.getElementById('main'));
      } catch (e) { busy(false); msg.textContent = e.message || 'Something went wrong. Try again.'; }
    });
  }

  /* ---------- search ---------- */
  /** more words each tool answers to in search */
  const TOOL_WORDS = {
    ratios: 'ratio table rate unit rate proportion equivalent ratios missing value scale', clock: 'clock time telling time hours minutes elapsed time how long am pm', money: 'money coins bills cents dollars change count coins penny nickel dime quarter',
    blocks: 'place value blocks ones tens hundreds thousands regroup trade expanded form', times: 'multiplication table times table facts arrays fact family squares',
    calc: 'calculator arithmetic decimal fraction mixed number exponent square root order of operations statistics mean median regression ti stat list permutation combination npr ncr', graph: 'graph graphing line slope equation inequality function parabola plot best fit line scatter trend',
    geometry: 'geometry construction compass straightedge bisect bisector perpendicular protractor ruler angle measure transformation translation reflection rotation dilation sketch', measure: 'unit units convert conversion measurement length mass weight volume capacity temperature celsius fahrenheit metric customary inches feet meters scale drawing map',
    fractions: 'fraction mixed number numerator denominator common denominator equivalent simplify reciprocal add subtract multiply divide compare area model',
    integers: 'integer negative positive zero pair tiles add subtract multiply divide opposite sign', ratios: 'ratio rate unit rate proportion proportional scale drawing better buy share constant',
    percent: 'percent discount sale tax tip interest markup money', numbers: 'prime factor factor tree divisibility gcf lcm greatest common factor least common multiple scientific notation power of ten',
    data: 'data statistics mean median mode range iqr mad box plot histogram dot plot stem and leaf', shapes: 'shape area perimeter volume surface area net angle triangle circle prism cylinder cone sphere pyramid',
    chance: 'probability chance spinner dice coin simulation experiment', tiles: 'algebra tiles equation mat solve equations comparison', steps: 'check steps solve equation working solver factor factoring simplify expand quadratic',
    setup: 'word problem story equation', sprint: 'facts times tables speed timed', words: 'vocabulary glossary definition flashcards', leap: 'game puzzle integer number line order of operations', prep: 'test prep study plan chapter test',
  };
  /** a test for whether text matches every word of a search; each word also matches its singular (fractions,
      fraction; inequalities, inequality; boxes, box) */
  /** words around a search that don't change it: “fractions for kids”, “intro to slope”, “5th grade area” */
  const FILLER = /\b(for kids|for students|for beginners|basics|basic|facts|quiz|introduction to|intro to|all about|grade \d+|\d+(st|nd|rd|th) grade)\b/g;
  const one = w => (w.length > 3 ? w.replace(/ies$/, 'y').replace(/(?<=[sxz]|ch|sh)es$|s$/, '') : w);          // a word's singular
  const wordsOf = s => A.normText(A.stripTags(String(s || ''))).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  /** a test for whether text has every word of a search, as whole words (singular or plural): “art” isn't in
      “kindergarten”. While typing (not opts.whole), the last word may be the start of one: “fract”. */
  function matcher(q, opts) {
    const qs = wordsOf(String(q || '').toLowerCase().replace(FILLER, ' ')), prefix = !(opts && opts.whole);
    return text => { const ts = wordsOf(text), set = new Set(ts.map(one)); return qs.length > 0 && qs.every((w, k) => set.has(one(w)) || (prefix && k === qs.length - 1 && w.length >= 3 && ts.some(t => t.startsWith(w)))); };
  }
  /** skills that match a search (title, or title with its unit and course), those nearest the learner's grade
      first, at most 40 */
  function findSkills(q, opts) {
    const hit = matcher(q, opts), g = S.get().profile.grade;
    const ids = Object.keys(A.skills).filter(sid => { const w = A.whereIs(sid); return w && (hit(A.skills[sid].title) || hit(A.skills[sid].title + ' ' + w.unit.title + ' ' + w.course.title)); });
    if (g != null) { const far = sid => Math.abs(A.whereIs(sid).course.grade - g); ids.sort((x, y) => far(x) - far(y)); }
    return ids.slice(0, 40);
  }
  /** the glossary's words, singular, without the little ones: what tells a math topic from any other */
  const SMALL = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'than', 'into', 'per', 'its', 'are', 'not', 'all', 'any', 'one', 'two', 'out', 'each', 'same', 'other', 'also', 'way']);
  let mathWords = null;
  const glossaryWords = () => mathWords || (mathWords = new Set((window.WORDS ? WORDS.LIST : []).flatMap(w => [w.term].concat(w.also)).flatMap(wordsOf).map(one).filter(w => w.length >= 3 && !SMALL.has(w))));
  /** a typed topic that is math, as Procademy's own skills for it, or [] when it isn't: a glossary word or one
      of its other names (“integers”, “GCF”, “PEMDAS”), or skills it names that use a math word. A topic with
      reviewed questions (“money” is economics) is never math here. */
  function mathTopic(q) {
    if (window.TOPICS && TOPICS.bankFor(String(q || ''))) return [];
    const qs = wordsOf(String(q || '').toLowerCase().replace(FILLER, ' ')).map(one), key = qs.join(' '), big = qs.filter(w => !SMALL.has(w));
    if (!big.length) return [];
    const g = S.get().profile.grade, rel = text => (window.TUTORPAGE ? TUTORPAGE.related(text, g).filter(id => A.whereIs(id)) : []);
    const term = window.WORDS && WORDS.LIST.find(w => [w.term].concat(w.also).some(n => wordsOf(n).map(one).join(' ') === key));
    const named = findSkills(q, { whole: true });
    if (term) return [...new Set(rel(term.term + ' ' + term.also.join(' ')).concat(named))];          // the closest skills, and every one that names it
    if (big.every(w => glossaryWords().has(w))) return named.length ? named : rel(big.join(' '));      // “congruent triangles”: math words only
    return named.length && big.some(w => glossaryWords().has(w)) ? named : [];
  }
  /* a search typed as a question, or with a typo: "how do I find the slope?" is "slope", "fracions" is "fractions" */
  const ASKING = /^(please\s+)?(how\s+(do|can|would|should|to)\s+(i|you|we\s+)?\s*|how\s+to\s+|what\s+(is|are|does|do)\s+(a\s+|an\s+|the\s+)?|what's\s+|why\s+(is|do|does)\s+|can\s+you\s+|help\s+(me\s+)?(with\s+)?|explain\s+|show\s+me\s+|teach\s+me\s+|i\s+need\s+help\s+with\s+|tell\s+me\s+about\s+)/i;
  const DROP = new Set(['find', 'work', 'out', 'solve', 'figure', 'get', 'the', 'a', 'an', 'my', 'i', 'me', 'to', 'do', 'does', 'is', 'are', 'in', 'on', 'with', 'for', 'about', 'using', 'use', 'calculate', 'understand', 'learn', 'please']);
  let vocab = null;
  /** every word in the names of skills, units, courses, tools and math terms */
  function buildVocab() {
    const set = new Set(), add = t => wordsOf(t).forEach(w => { if (w.length >= 4) { set.add(w); set.add(one(w)); } });
    Object.keys(A.skills).forEach(id => add(A.skills[id].title));
    A.courses.forEach(c => { add(c.title); c.units.forEach(u => add(u.title)); });
    toolList().forEach(t => add(t[2] + ' ' + t[3]));
    Object.values(TOOL_WORDS).forEach(add);
    if (window.WORDS) WORDS.LIST.forEach(w => add([w.term].concat(w.also).join(' ')));
    return { set, list: [...set] };
  }
  /** how many letters differ (insert, delete or change), up to max + 1 */
  function edits(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, k) => k);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let low = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); low = Math.min(low, cur[j]); }
      if (low > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  /** a search, tidied: question words dropped, and a misspelled word swapped for the nearest real one. A word that
      starts a real one is left alone, so "fract" while typing stays "fract". */
  function fixQuery(q) {
    const raw = String(q || '').trim(), t = raw.toLowerCase().replace(/[?!.]+$/, '').replace(ASKING, '');
    let ws = wordsOf(t).filter(w => !DROP.has(w));
    if (!ws.length) ws = wordsOf(t);
    vocab = vocab || buildVocab();
    let typo = false;
    const fixed = ws.map(w => {
      if (w.length < 4 || /\d/.test(w) || vocab.set.has(w) || vocab.set.has(one(w)) || vocab.list.some(v => v.startsWith(w))) return w;
      const max = w.length <= 5 ? 1 : 2;
      let best = null, d = max + 1;
      vocab.list.forEach(v => { const e = edits(w, v, max); if (e < d || (e === d && best && v.length < best.length)) { d = e; best = v; } });
      if (best && d <= max) { typo = true; return best; }
      return w;
    });
    return { q: fixed.join(' ') || raw, typo };
  }
  /** everything a search matches: tools, courses, units and skills (for the search page and the search box) */
  function find(q) {
    q = fixQuery(q).q;
    const hit = matcher(q), g = S.get().profile.grade, far = c => (g == null ? 0 : Math.abs(c.grade - g));
    return {
      tools: toolList().filter(t => hit(`${t[2]} ${t[3]} ${TOOL_WORDS[t[0]] || ''}`)),
      courses: A.courses.filter(c => hit(c.title) || hit(c.blurb || '')),
      units: A.courses.flatMap(c => c.units.filter(u => hit(u.title)).map(u => ({ c, u }))).sort((x, y) => far(x.c) - far(y.c)).slice(0, 12),
      skills: findSkills(q),
    };
  }
  function search(root, q) {
    q = (q || '').trim();
    const fx = fixQuery(q), typed = q;
    if (q && fx.q !== q) q = fx.q;
    const { tools, courses, units, skills } = find(q);
    root.innerHTML = `<h1>Search</h1><p class="muted">${typed ? `Results for “${esc(typed)}”${fx.typo ? `. Showing results for <b>${esc(q)}</b>` : ''}` : 'Type in the box above to search skills, units and courses, or ask a question like “how do I find slope”.'}</p>
      ${tools.length ? `<div class="section-title"><h2>Tools</h2></div><div class="grid tools">${tools.map(toolCard).join('')}</div>` : ''}
      ${courses.length ? `<div class="section-title"><h2>Courses</h2></div><div class="grid">${courses.map(courseCard).join('')}</div>` : ''}
      ${units.length ? `<div class="section-title"><h2>Units</h2></div><div class="card">${units.map(x => `<div class="search-hit"><div><a href="${unitHref(x.c, x.u)}"><b>${esc(x.u.title)}</b></a><div class="where">${esc(x.c.title)}</div></div></div>`).join('')}</div>` : ''}
      ${q && window.CPMVIEWS ? CPMVIEWS.searchHits(q) : ''}
      ${skills.length ? `<div class="section-title"><h2>Skills</h2></div><div class="card"><ul class="skills">${skills.map(sid => { const w = A.whereIs(sid); return skillRow(sid, { where: w.course.title + ' · ' + w.unit.title }); }).join('')}</ul></div>` : ''}
      ${q && mathTopic(q).length ? `<div class="card search-topic"><div><a href="#/unlimited/find/${encodeURIComponent(q)}"><b>Practice “${esc(q)}” now</b></a><div class="small muted">Procademy’s own questions, ready at once</div></div></div>` : ''}
      ${q && window.TOPICS && !window.PROCADEMY_OFFLINE ? `<div class="card search-topic"><div><a href="${TOPICS.href(TOPICS.clip(q), S.get().profile.grade)}"><b>Practice “${esc(TOPICS.clip(q))}” as a topic</b></a><div class="small muted">Any subject, at your grade, without end</div></div></div>` : ''}
      ${q && !tools.length && !courses.length && !units.length && !skills.length && !(window.CPMVIEWS && CPMVIEWS.searchHits(q)) ? `<div class="card empty">No math skill matched. Try a shorter word, like “fraction” or “slope”, or <a href="#/sitemap">see every page</a>.</div>` : ''}`;
    bindExplain(root);
  }

  function notFound(root) {
    root.innerHTML = `<div class="card empty"><h1>Not here</h1><p>That page doesn’t exist, or the skill has moved.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a><a class="btn" href="#/courses">Courses</a><a class="btn" href="#/sitemap">All pages</a></div></div>`;
  }

  window.VIEWS = { home, tools, courses, course, unit, skill, practice, unitTest, challenge, masteryChallenge, review, daily, progress, settings, search, notFound, stats, brand, toast,
    quiz, boss, speed, weekly, warmup, summer, ready, readyIds, warmSkills, clockText,
    findSkills, matcher, find, skillMap, notes, mathTopic, setGrade, ordinal, mastered, sitemap, fixQuery, meTabs, nextUp, testSoon, bigIdea, balance,
    quickFive, reviewReminder,
    _h: { courseArt, toolLinks, esc, plain, lvl, mbar, legend, skillRow, exercise, plural, fmt, courseVar, mono, skillHref, practiceHref, explainBtn, bindExplain, tutorCtx, saveBtn, wireSaving, isSaved, dragHandle, wireReorder, exercise, unitHref, courseHref } };
})();
