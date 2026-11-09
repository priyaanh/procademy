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
    const order = E.courseOrder(c), next = order.find(id => S.skill(id).level < 3), placed = (S.get().profile.placed || {})[c.id];
    const rows = c.units.map((u, i) => {
      const ids = u.skills.filter(id => A.skills[id]);
      if (!ids.length) return '';
      return `<li class="${placed && placed.start === u.id ? 'start' : ''}"><a class="sm-unit" href="${unitHref(c, u)}"><span class="n">${i + 1}</span><span class="t">${esc(u.title)}</span>${placed && placed.start === u.id ? `<span class="chip up">Start here</span>` : ''}</a>
        <span class="sm-cells">${ids.map(id => { const l = S.skill(id).level, name = plain(A.skills[id].title); return `<a class="sm-cell l${l}${id === next ? ' next' : ''}" href="${skillHref(id)}" aria-label="${esc(name)}: ${A.LEVELS[l]}${id === next ? ', next to learn' : ''}" title="${esc(name)}: ${A.LEVELS[l]}"></a>`; }).join('')}</span></li>`;
    }).join('');
    return `<div class="card skill-map" ${courseVar(c)}><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Your skill map</h2>${next ? `<a class="btn sm primary" href="${practiceHref(next)}">Next: ${esc(plain(A.skills[next].title))}</a>` : ''}</div>
      <p class="small muted" style="margin:4px 0 10px">Select a unit for its lessons and unit test. Each square is a skill, in the color of your level; the ringed one is next.</p><ol class="sm-units">${rows}</ol>${legend(E.mastery(A.courseSkills(c)).counts)}</div>`;
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
    return `<li>${lvl(st.level)}<div class="name"><a href="${skillHref(sid)}">${def.title}</a>${opts.where ? `<div class="sub">${esc(opts.where)}</div>` : ''}</div>
      <div class="actions"><a class="btn sm ghost" href="${skillHref(sid)}">Learn</a><a class="btn sm primary" href="${practiceHref(sid)}">Practice</a></div></li>`;
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
  function courseCard(c, opts) {
    opts = opts || {};
    const ids = A.courseSkills(c), m = E.mastery(ids), nx = opts.continue ? nextInCourse(c) : null;
    return `<div class="card course-card" ${courseVar(c)} data-filter="${esc(A.normText(c.title + ' ' + (c.blurb || '') + ' ' + c.subject))}" data-band="${esc(c.subject)}"${opts.drag ? ` data-id="${esc(c.id)}"` : ''}>
      <div class="row between" style="align-items:flex-start">${mono(c.icon, 'icon mono')}<span class="card-tools">${opts.drag ? dragHandle(c.title) : ''}${saveBtn(c.id, c.title)}</span></div>
      <h3><a class="card-link" href="${courseHref(c)}">${esc(c.title)}</a></h3>
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
  function home(root) {
    const s = S.get();
    const name = s.profile.name.trim();
    const st = S.streak();
    const recent = s.recent.filter(id => A.skills[id]).slice(0, 3);
    wireSaving();
    const courses = s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean);
    // skills mastered in the learner's saved courses (every course when none is saved)
    const scope = courses.length ? [].concat(...courses.map(c => A.courseSkills(c))) : Object.keys(A.skills);
    const mastered = scope.filter(id => S.skill(id).level === 4).length;
    const books = s.profile.enrolled.filter(id => id.startsWith('cpm:')).map(id => A.cpmById(id.slice(4))).filter(Boolean);
    // saved courses and books together, in the order the learner put them
    const mine = s.profile.enrolled.map(id => id.startsWith('cpm:') ? (window.CPMVIEWS && A.cpmById(id.slice(4)) ? CPMVIEWS.bookCard(A.cpmById(id.slice(4)), { continue: true, drag: true }) : '') : A.courseById(id) ? courseCard(A.courseById(id), { continue: true, drag: true }) : '').filter(Boolean);
    const practised = A.courses.filter(c => !courses.includes(c) && A.courseSkills(c).some(id => S.skill(id).level > 0));
    // up next: the first unfinished skill in each course practiced but not saved (a saved course's card has Continue)
    const upNext = [];
    (courses.length ? [] : practised).forEach(c => {
      const sid = E.courseOrder(c).find(id => S.skill(id).level < 3 && !recent.includes(id));
      if (sid && upNext.length < 3) upNext.push({ sid, c });
    });
    const fresh = isNew(), go = fresh ? null : continueTarget(), next = fresh ? '' : bestNext();
    const nextBadge = window.BADGES ? BADGES.all().find(b => !b.at) : null;
    root.innerHTML = `
      <div class="home-head"><div class="home-hello"><h1>${greeting()}${name ? ', ' + esc(name) : ''}${window.LEARNERS && LEARNERS.count() > 1 ? ' <a class="switch-learner" href="#/profile">Switch learner</a>' : ''}</h1>
        <p class="muted">${st.today ? (st.days > 1 ? `You’re on a ${st.days}-day streak. Nice work today.` : 'You practiced today. Nice work.') : st.days ? `Practice today to keep your ${st.days}-day streak going.` : 'Pick a skill to get started.'}${next ? ' ' + next : ''}</p></div>
        ${go ? `<a class="btn primary home-go" id="home-go" href="${go.href}"><span><b>${go.label}</b>${go.sub ? `<small>${esc(go.sub)}</small>` : ''}</span>${icon('send', 18).replace('class="ic"', 'class="ic go-arrow"')}</a>` : ''}</div>
      ${fresh ? welcomeCard() : todayCard()}${fresh ? '' : weekRecap()}
      <div class="tiles">
        ${window.BADGES ? BADGES.ring() : ''}
        <a class="tile has-ic" href="#/mastered"><span class="tile-ic ic-star">${icon('star')}</span><div class="big">${mastered}</div><div class="label">of ${scope.length} skills mastered</div></a>
        ${window.BADGES ? `<a class="tile badge-tile has-ic" href="#/progress"${nextBadge ? ` title="Next badge: ${esc(nextBadge.name)}. ${esc(nextBadge.how)}"` : ''}><span class="tile-ic ic-medal">${icon('medal')}</span><div class="big">${BADGES.all().filter(b => b.at).length}</div><div class="label">badges earned${nextBadge ? `<span class="tile-next">Next: ${esc(nextBadge.name)}</span>` : ''}</div></a>` : ''}
      </div>
      ${fresh ? '' : levelsNote()}
      ${window.PREP ? PREP.homeCard() : ''}${newsCard()}${window.INSTALL ? INSTALL.slot('home') : ''}
      <div class="section-title"><h2>My courses</h2>${mine.length > 1 ? '<span class="small muted reorder-hint">Drag a course to move it</span>' : ''}<a href="#/courses">Browse courses →</a></div>
      ${mine.length ? `<div class="grid fit my-courses${mine.length > 2 ? ' compact' : ''}" id="my-courses">${mine.join('')}</div><p class="visually-hidden" aria-live="polite" id="my-courses-live"></p>`
        : `<div class="card empty-saved"><p><b>No saved courses yet.</b> Find your grade or your class’s CPM book on the Courses page and select <b>Save</b>; it will appear here.</p>
          <div class="btn-row"><a class="btn primary" href="#/courses">Browse courses</a><a class="btn" href="#/courses/cpm">CPM books</a></div>
          ${practised.length ? `<p class="small muted" style="margin:14px 0 6px">You have practiced in:</p><div class="chips">${practised.map(c => `<span class="grade-chip" ${courseVar(c)}>${mono(c.icon, 'mono-sm')}<a href="${courseHref(c)}">${esc(c.title)}</a>${saveBtn(c.id, c.title)}</span>`).join('')}</div>` : ''}</div>`}
      ${window.CPMVIEWS ? CPMVIEWS.homeCard() : ''}
      ${recent.length ? `<div class="section-title"><h2>Pick up where you left off</h2></div>
        <div class="grid">${recent.map(id => { const d = A.skills[id], w = A.whereIs(id), st2 = S.skill(id); return `<div class="card tight"><div class="row">${lvl(st2.level, true)}<div style="flex:1;min-width:0"><div><a href="${skillHref(id)}"><b>${d.title}</b></a></div><div class="small muted">${w ? esc(w.course.title + ' · ' + w.unit.title) : ''}</div></div></div><div class="btn-row"><a class="btn sm primary" href="${practiceHref(id)}">Practice</a><span class="chip lv-${st2.level}">${A.LEVELS[st2.level]}</span></div></div>`; }).join('')}</div>` : ''}
      ${upNext.length ? `<div class="section-title"><h2>Up next</h2></div>
        <div class="card"><ul class="skills">${upNext.map(x => skillRow(x.sid, { where: x.c.title + ' · ' + A.whereIs(x.sid).unit.title })).join('')}</ul></div>` : ''}
`;
    void books;
    wireWelcome(root);
    wireWhatIs(root);
    // the goal ring says how long is left today
    const gl = root.querySelector('#goal-tile .label'), dq = (s.days[S.today()] || {}).q || 0, gg = window.BADGES ? BADGES.goal() : 20;
    if (gl && dq < gg) gl.textContent = `today’s goal · about ${Math.max(1, Math.round((gg - dq) / 2))} min left`;
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
    if (!fresh && window.APP && APP.tour && s.profile.tourNext) setTimeout(() => { if (root.isConnected && location.hash.replace(/^#\/?/, '') === '') APP.tour(); }, 400);
    const rx = root.querySelector('#recap-x');
    if (rx) rx.addEventListener('click', () => { S.setProfile({ recapSeen: rx.dataset.week }); const c = root.querySelector('#recap'); if (c) c.remove(); });
    wireReorder(root.querySelector('#my-courses'), root.querySelector('#my-courses-live'));
    if (window.BADGES) { BADGES.wireRing(root, () => home(root)); BADGES.check(); }
    const nx = root.querySelector('#news-x');
    if (nx) nx.addEventListener('click', () => { S.setProfile({ seenNews: NEWS }); const n = root.querySelector('#news'); if (n) n.remove(); });
    bindExplain(root);
  }

  /* ---------- all courses: browse, filter and save ---------- */
  const COURSE_TABS = [['all', 'All'], ['Elementary', 'Elementary'], ['Middle school', 'Middle school'], ['High school', 'High school'], ['cpm', 'CPM books'], ['saved', 'Saved']];
  function courses(root, tab) {
    wireSaving();
    tab = COURSE_TABS.some(t => t[0] === tab) ? tab : 'all';
    const books = A.cpm || [];
    root.innerHTML = `<h1>Courses</h1>
      <p class="muted">Math for every grade, from Kindergarten to Calculus, and the CPM books chapter by chapter. Select <b>Save</b> on a course to keep it on your home page.</p>
      <div class="course-tools card tight">
        <div class="tabs" role="tablist" aria-label="Show">${COURSE_TABS.map(([id, label]) => `<a role="tab" class="tab${id === tab ? ' on' : ''}" aria-selected="${id === tab}" href="#/courses${id === 'all' ? '' : '/' + encodeURIComponent(id)}">${label}</a>`).join('')}</div>
        <input id="course-find" type="search" placeholder="Find a course: “7th”, “algebra”, “geometry”…" aria-label="Find a course" autocomplete="off">
      </div>
      <div id="course-list">${A.subjects().map(sub => `<section class="band-section" data-band="${esc(sub)}"><div class="section-title"><h2>${esc(sub)}</h2></div><div class="grid">${A.courses.filter(c => c.subject === sub).map(c => courseCard(c)).join('')}</div></section>`).join('')}
        ${books.length && window.CPMVIEWS ? `<section class="band-section" data-band="cpm"><div class="section-title"><h2>CPM books</h2><a href="#/cpm">CPM page →</a></div><div class="grid">${books.map(b => CPMVIEWS.bookCard(b)).join('')}</div></section>` : ''}
      </div>
      <div class="card empty" id="course-none" hidden>No courses match. Try a shorter word, such as “grade” or “algebra”.</div>`;
    const find = root.querySelector('#course-find'), none = root.querySelector('#course-none');
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
      if (!shown && tab === 'saved' && !words.length) none.innerHTML = 'You haven’t saved any courses yet. Select <b>Save</b> on a course to show it here and on your home page.';
    };
    find.addEventListener('input', apply);
    root.addEventListener('click', ev => { if (tab === 'saved' && ev.target.closest('[data-save]')) setTimeout(apply, 0); });
    apply();
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
            <ul class="skills">${u.skills.map(sid => skillRow(sid)).join('')}
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unlimited practice<div class="sub">All skills in this unit, mixed, for as long as you wish.</div></div><div class="actions"><a class="btn sm" href="#/unlimited/unit/${c.id}/${u.id}">Start</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unit test<div class="sub">One question per skill you’re still learning, with a second chance on a miss.</div></div><div class="actions"><a class="btn sm primary" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
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
        <div class="row">${lvl(st.level, true)}<div style="flex:1;min-width:0"><h1 style="margin:0">${def.title}</h1><div class="muted small">${A.LEVELS[st.level]}${st.tries ? ` · ${plural(st.tries, 'question')} answered, ${Math.round(st.right / st.tries * 100)}% right` : st.level ? '' : ' · not practiced yet'}</div></div></div>
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice · ${E.PRACTICE_N} questions</a><a class="btn" href="#/unlimited/skill/${encodeURIComponent(sid)}">Unlimited practice</a>${nxt ? `<a class="btn ghost" href="${skillHref(nxt)}">Next skill: ${A.skills[nxt].title} →</a>` : ''}</div>
        <details class="more-ways"><summary>More ways to practice</summary>
          <div class="btn-row">${explainBtn('Ask the tutor to explain', `Explain “${plain(def.title)}” to me step by step, with an example.`)}<a class="btn ghost" href="#/worksheet/skill/${encodeURIComponent(sid)}">Printable worksheet</a>${toolLinks(sid, plain(def.title))}</div></details>
      </div>
      <div class="card learn" style="margin-top:16px"><h2>Learn</h2>${def.learn || '<p class="muted">There are no notes for this skill yet. Each practice question includes step-by-step hints.</p>'}
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice</a>${explainBtn('Ask for another explanation', `I read the lesson on “${plain(def.title)}”. Can you explain it a different way, with a new example?`)}</div></div>
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
  }

  /** a worked example: a fresh question from the skill's own maker, its steps shown one at a time */
  function workedExample(box, sid) {
    if (!box) return;
    let q, shown;
    const fresh = () => { q = A.question(sid, 'we-' + Math.random().toString(36).slice(2, 9)); shown = 0; draw(); };
    function draw() {
      const n = q.hints.length, done = shown >= n;
      const answer = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q);
      box.querySelector('#we-body').innerHTML = `<div class="we-q">${window.COACH ? `<div class="q-tools">${COACH.speakBtn(q.prompt + q.hints.slice(0, shown).map(h => '<p>' + h + '</p>').join(''), 'Read it aloud')}</div>` : ''}<div class="question">${q.prompt}</div>
        ${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map((c, k) => `<li class="${done && k === q.answerIndex ? 'is-right' : ''}">${c}</li>`).join('')}</ol>` : ''}</div>
        <ol class="we-steps">${q.hints.slice(0, shown).map((h, k) => `<li class="hint"><div class="hn">${k === n - 1 ? 'Last step' : 'Step ' + (k + 1)}</div>${h}</li>`).join('')}</ol>
        ${done ? `<div class="feedback good"><span>Answer: <b>${answer}</b></span></div><div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice this skill</a></div>`
          : `<div class="btn-row"><button class="btn primary" id="we-next" type="button">${shown === 0 ? 'Show the first step' : shown === n - 1 ? 'Show the last step' : 'Show the next step'} <span class="muted small">(${shown + 1} of ${n})</span></button>${shown < n - 1 ? '<button class="btn ghost" id="we-all" type="button">Show all steps</button>' : ''}</div>`}`;
      const nx = box.querySelector('#we-next'), all = box.querySelector('#we-all');
      if (nx) nx.addEventListener('click', () => { shown++; draw(); const st = box.querySelectorAll('.we-steps li'); if (st.length) st[st.length - 1].scrollIntoView({ block: 'nearest' }); });
      if (all) all.addEventListener('click', () => { shown = n; draw(); });
      if (window.VOCAB) VOCAB.linkify(box.querySelector('.we-steps'));
      box.__worked = { q, shown };
    }
    box.querySelector('#we-new').addEventListener('click', fresh);
    fresh();
  }

  /* ---------- the exercise player ---------- */
  // unlimited practice: what was answered since the last save is saved when the page changes (before the next
  // page draws, so Progress is up to date), when the tab is hidden (phones may close it without warning) and
  // when the page goes away. Saving twice saves nothing more.
  let endlessNow = null;
  const saveEndlessNow = () => { if (endlessNow && !endlessNow.stopped) E.saveEndless(endlessNow); };
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => { saveEndlessNow(); endlessNow = null; }, true);
    window.addEventListener('pagehide', saveEndlessNow);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveEndlessNow(); });
  }
  function exercise(root, s, opts) {
    opts = opts || {};
    root.__session = s;                      // for the test suite
    const endless = s.kind === 'endless';
    let hintsShown = 0, selected = null, phase = 'fresh', lastFeedback = '';
    let workLines = null, workOpen = false;          // the learner's own steps for this question (STEPS)
    let lastSpoken = null;                           // read each question aloud once, when the learner asks for that

    function dots() {
      if (endless) {      // unlimited practice: a running score instead of a dot per question
        const t = E.tally(s);
        return `<div class="ul-tally"><span>Answered <b>${t.n}</b></span><span>Correct on the first try <b>${t.right}</b></span><span>Streak <b>${t.streak}</b>${t.best > t.streak ? ` (best ${t.best})` : ''}</span><button class="btn sm" id="stop" type="button">End session</button></div>`;
      }
      return `<div class="dots" role="img" aria-label="Question ${s.i + 1} of ${s.items.length}">${s.items.map((it, k) => {
        const r = s.results[k];
        let cls = k === s.i ? 'current' : '';
        if (r && r.done) cls = E.counts(r) ? 'right' : (r.correct ? 'hinted' : 'wrong');
        return `<span class="${cls}"></span>`;
      }).join('')}</div>`;
    }
    function answerArea(q) {
      if (q.type === 'choice') {
        return `<ul class="choices" id="choices">${q.choices.map((ch, k) => `<li><button type="button" data-k="${k}" aria-pressed="${selected === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${ch}</span></button></li>`).join('')}</ul>`;
      }
      const isNum = q.type === 'number';
      const pre = q.unit === '$', unit = q.unit && !pre ? `<span class="unit">${q.unit}</span>` : '';
      return `<div class="row">${pre ? '<span class="unit" style="margin:0">$</span>' : ''}<input id="ans" type="text" ${isNum ? 'inputmode="text"' : ''} autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="${isNum ? 'Your answer' : 'Type your answer'}">${unit}</div>
        <div class="help">${isNum ? 'Fractions like <b>3/4</b>, mixed numbers like <b>1 1/2</b>, and decimals are all fine.' : (q.help || 'Accents and capital letters don’t matter.')}</div>`;
    }
    function hintsArea(q) {
      const shown = q.hints.slice(0, hintsShown);
      const revealed = s.results[s.i] && s.results[s.i].revealed;
      return `<div class="hints" id="hints">${shown.map((hh, k) => `<div class="hint"><div class="hn">${k === q.hints.length - 1 ? 'Last step' : 'Hint ' + (k + 1)}</div>${hh}</div>`).join('')}
        ${revealed && !s.results[s.i].correct ? `<div class="hint"><div class="hn">Answer</div><b>${A.answerText(q)}</b></div>` : ''}</div>`;
    }
    function render() {
      if (E.isDone(s)) return summary();
      if (phase === 'done' && !endless) E.followUps(s);           // a unit test's second chances join at the end
      const it = E.current(s), q = it.q, r = s.results[s.i];
      const canHint = s.hints && hintsShown < q.hints.length && phase !== 'done';
      const def = A.skills[it.skillId];
      root.innerHTML = `<div class="ex">
        <div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(s.title)}</h1>${dots()}</div>
        <div class="card">
          <div class="q-tools">${it.why ? `<span class="chip why-${it.why}">${{ review: 'Review', mistake: 'Correcting a mistake', new: 'New skill', again: 'Second chance' }[it.why]}</span>` : ''}${window.COACH ? COACH.speakBtn(q.prompt + (q.type === 'choice' ? '<p>The choices are:</p>' + q.choices.map((c, k) => `<p>${k + 1}: ${c}</p>`).join('') : ''), 'Read the question aloud') : ''}</div>
          <div class="question">${s.kind !== 'practice' && !(endless && s.skills.length === 1) ? `<div class="lead">${def.title}</div>` : ''}${q.prompt}</div>
          <div class="answer">${answerArea(q)}</div>
          ${workEq(it) ? `<details class="steps-work" id="work" ${workOpen ? 'open' : ''}><summary>Show your work: each step is checked</summary><div class="steps-box" id="work-box"></div><p class="tiny muted" style="margin:6px 0 0">Each line is checked as you type, by calculation. Checking a finished line (like <b>x = 4</b>) counts as a hint.</p></details>` : ''}
          <div id="feedback" aria-live="polite">${lastFeedback}</div>
          ${hintsArea(q)}
          <div class="ex-foot">
            ${s.hints ? `<button class="btn" id="hint" ${canHint ? '' : 'disabled'}>Hint${canHint ? ` <span class="muted small">(${q.hints.length - hintsShown} remaining)</span>` : ''}</button>` : ''}
            ${phase !== 'done' ? `<button class="btn ghost" id="giveup">I don’t know</button>` : ''}
            ${s.hints || phase === 'done' ? `<button class="btn ghost" id="ask-tutor">Ask the tutor</button>` : ''}
            <span class="spacer"></span>
            <span class="muted small">${endless ? `Question ${s.i + 1}` : `${s.i + 1} / ${s.items.length}`}</span>
            ${phase === 'done' ? `<button class="btn primary" id="next">${!endless && s.i + 1 === s.items.length ? 'Finish' : 'Next question'}</button>` : `<button class="btn primary" id="check" disabled>Check</button>`}
          </div>
        </div></div>`;
      bind(q);
      if (S.get().profile.autoRead && window.COACH && phase === 'fresh' && lastSpoken !== it) { lastSpoken = it; COACH.say(q.prompt + (q.type === 'choice' ? '<p>The choices are:</p>' + q.choices.map((c, k) => `<p>${k + 1}: ${c}</p>`).join('') : '')); }
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
        studentAnswer: lastInput && !(r && r.correct) ? lastInput : (q.type === 'choice' && selected != null && !(r && r.correct) && r && r.tries ? plain(q.choices[selected]) : ''),
      });
      bindExplain(root.querySelector('#feedback') || root);
      const ask = root.querySelector('#ask-tutor');
      if (ask) ask.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: done ? 'Explain how to get this answer, step by step.' : 'Give me a hint for this question, without telling me the answer.' }));
    }
    /** the equation a "Solve…" question asks about, for the step checker (practice only, not tests) */
    function workEq(it) {
      if (!s.hints || phase === 'done' || !window.STEPS) return null;
      if (it.eqn === undefined) it.eqn = STEPS.fromQuestion(it.q);
      return it.eqn;
    }
    function currentInput(q) {
      if (q.type === 'choice') return selected;
      const el = root.querySelector('#ans');
      return el ? el.value : '';
    }
    function hasInput(q) { const v = currentInput(q); return q.type === 'choice' ? v != null : String(v).trim().length > 0; }
    function bind(q) {
      const check = root.querySelector('#check'), next = root.querySelector('#next'), hint = root.querySelector('#hint'), giveup = root.querySelector('#giveup');
      const ans = root.querySelector('#ans');
      if (ans) {
        if (phase === 'done') ans.disabled = true; else setTimeout(() => ans.focus(), 0);
        ans.addEventListener('input', () => { if (check) check.disabled = !hasInput(q); });
        if (q.type !== 'choice' && phase !== 'done' && typeof lastInput === 'string') { ans.value = lastInput; if (check) check.disabled = !hasInput(q); }
      }
      root.querySelectorAll('#choices button').forEach(b => {
        if (phase === 'done') {
          b.disabled = true;
          const k = Number(b.dataset.k);
          if (k === q.answerIndex) b.classList.add('is-right');
          else if (k === selected) b.classList.add('is-wrong');
        } else b.addEventListener('click', () => { selected = Number(b.dataset.k); root.querySelectorAll('#choices button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.k) === selected))); if (check) check.disabled = false; });
      });
      if (check) check.addEventListener('click', doCheck);
      if (next) { next.addEventListener('click', doNext); setTimeout(() => next.focus(), 0); }
      if (hint) hint.addEventListener('click', doHint);
      if (giveup) giveup.addEventListener('click', doGiveUp);
      const stop = root.querySelector('#stop');
      if (stop) stop.addEventListener('click', summary);
    }
    let lastInput = null;
    function doCheck() {
      const q = E.current(s).q;
      if (!hasInput(q)) return;
      const res = E.answer(s, currentInput(q));
      lastInput = q.type === 'choice' ? null : String(currentInput(q));
      const r = s.results[s.i];
      // the coach: what this wrong answer probably means (never the answer itself)
      const slip = !res.correct && !res.unreadable && window.COACH ? COACH.diagnose(q, q.type === 'choice' ? selected : lastInput) : null;
      if (slip) { S.noteMistake(slip.kind, E.current(s).skillId); if (s.results[s.i]) s.results[s.i].slip = slip.kind; }      // kept with the question for Review
      const coachNote = slip ? `<div class="coach-note"><span>${esc(slip.msg)}</span></div>` : '';
      const noticed = slip ? ' Procademy noticed: ' + slip.msg : '';
      if (res.unreadable) { lastFeedback = `<div class="feedback note">${icon('info')}<span>That doesn’t look like a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.</span></div>`; render(); return; }
      if (res.correct) {
        phase = 'done'; r.done = true;
        lastFeedback = `<div class="feedback good">${icon('check')}<span>${r.hinted ? 'Correct. You got there with a hint.' : r.tries > 1 ? 'Correct on your second try.' : 'Correct, well done.'}</span></div>`;
        if (hintsShown < q.hints.length) lastFeedback += `<details style="margin-top:10px"><summary class="muted small">View the steps</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      } else if (s.hints) {
        lastFeedback = `<div class="feedback bad">${icon('cross')}<span>Not quite. Try again, or take a hint.</span></div>${coachNote}
          <div class="btn-row" style="margin-top:8px">${explainBtn('Why is that wrong?', 'I answered ' + plain(q.type === 'choice' ? q.choices[selected] : lastInput) + '. Why is that wrong? Help me find my mistake, but don’t tell me the answer yet.' + noticed)}</div>`;
      } else {
        phase = 'done'; E.reveal(s); r.revealed = true;
        lastFeedback = `<div class="feedback bad">${icon('cross')}<span>Not quite. The answer is <b>${A.answerText(q)}</b>.</span></div>${coachNote}
          <div class="btn-row" style="margin-top:8px">${explainBtn('Explain my mistake', 'I answered ' + plain(q.type === 'choice' ? q.choices[selected] : lastInput) + ', but the answer is ' + plain(A.answerText(q)) + '. What did I do wrong?' + noticed)}</div>
          <details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      }
      render();
    }
    function doHint() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      E.useHint(s);
      hintsShown += 1;
      if (hintsShown === q.hints.length) { E.reveal(s); phase = 'done'; lastFeedback = `<div class="feedback note">${icon('info')}<span>That’s the last step. Read it through, then move on; this question will come back in Review.</span></div>`; }
      render();
    }
    function doGiveUp() {
      const q = E.current(s).q;
      E.reveal(s); phase = 'done'; hintsShown = s.hints ? q.hints.length : 0;
      lastFeedback = `<div class="feedback note">${icon('info')}<span>Here’s the answer: <b>${A.answerText(q)}</b>${s.hints ? '. The steps are below' : ''}. This question will come back in Review.</span></div>` +
        (s.hints ? '' : `<details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`);
      render();
    }
    function doNext() {
      if (endless) {
        // every PRACTICE_N answers are saved as a set; a level gained shows at once
        if (s.i + 1 - s.saved >= E.PRACTICE_N) { const f = E.saveEndless(s); const up = f && f.changes.find(c => c.to > c.from); if (up) toast(`Level raised: ${plain(A.skills[up.skillId].title)} is now ${A.LEVELS[up.to]}`); if (window.APP) window.APP.refreshStats(); }
        if (s.i + 1 >= s.items.length) E.more(s);
      }
      E.next(s);
      hintsShown = 0; selected = null; phase = 'fresh'; lastFeedback = ''; lastInput = null; workLines = null; workOpen = false;
      render();
      window.scrollTo(0, 0);
    }
    function summary() {
      const f = endless ? E.stopEndless(s) : E.finish(s);
      if (opts.onFinish) { try { opts.onFinish(s, f); } catch (e) { console.error(e); } }
      tutorCtx(null);
      if (window.APP) window.APP.refreshStats();
      if (opts.result) return opts.result(s, f);              // a page with its own result screen (the placement check)
      const ratio = f.total ? f.right / f.total : 0;
      // the same questions for a friend: practice sets and CPM lesson sets have a seed that rebuilds them
      const vsInfo = s.kind === 'practice' ? { k: 'p', id: s.skillId, seed: s.seed, score: f.right, total: f.total }
        : s.kind === 'mix' && s.cpm && s.cpm.lesson ? { k: 'l', book: s.cpm.book, lesson: s.cpm.lesson, seed: s.seed, score: f.right, total: f.total } : null;
      const head = endless ? 'Session complete' : ratio === 1 ? 'Excellent work' : ratio >= 0.7 ? 'Nice work' : 'Keep practicing';
      const changes = f.changes.map(ch => `<span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.skills[ch.skillId].title}: ${A.LEVELS[ch.from]} → <b>${A.LEVELS[ch.to]}</b></span>`).join('');
      let nextBtn = '';
      if (s.kind === 'practice') { const nx = nextSkill(s.skillId); if (nx) nextBtn = `<a class="btn" href="${skillHref(nx)}">Next skill: ${A.skills[nx].title} →</a>`; }
      if (opts.next) nextBtn = `<a class="btn" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;
      root.innerHTML = `<div class="ex"><div class="card summary">
        <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(s.title)}</div>
        <h1 style="margin-top:6px">${head}</h1>
        <div class="score">${f.right} / ${f.total}</div>
        <div class="what">${endless ? (f.total ? `${plural(f.total, 'question')} answered, ${f.right} correct on the first try without a hint. Longest streak: ${f.best}.` : 'No questions were answered in this session.') : f.right === f.total ? 'Every question right on the first try, with no hints.' : `${f.right} of ${f.total} correct on the first try without a hint.${s.kind === 'practice' && ratio < 1 ? ' Answer all ' + f.total + ' correctly to reach Proficient.' : ''}`}</div>
        ${changes ? `<div class="changes">${changes}</div>` : (s.kind !== 'review' ? `<p class="muted" style="margin-top:14px">No skill levels changed.</p>` : '')}
        <div class="chip" style="font-size:1rem">+${fmt(f.pts)} points</div>
        <div class="btn-row">
          ${opts.again ? `<button class="btn primary" id="again">${opts.againLabel || 'Practice again'}</button>` : ''}
          ${nextBtn}
          <a class="btn" href="${opts.back || '#/'}">${esc(opts.backLabel || 'Back')}</a>
        </div>${opts.summaryExtra ? opts.summaryExtra(s, f) : ''}${vsInfo && window.CHALLENGE ? CHALLENGE.button(vsInfo, opts.challengeLabel) : ''}</div></div>`;
      if (window.CHALLENGE) CHALLENGE.wire(root);
      const again = root.querySelector('#again');
      if (again) again.addEventListener('click', () => opts.again());
    }
    if (endless) endlessNow = s;
    if (root.__onKey) root.removeEventListener('keydown', root.__onKey);   // one player per element: drop the last session's keys
    root.__onKey = onKey;
    root.addEventListener('keydown', onKey);
    function onKey(ev) {
      if (!root.isConnected) { root.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const next = root.querySelector('#next'), check = root.querySelector('#check');
        if (document.activeElement && document.activeElement.id === 'stop') return;      // Enter on ■ Stop stops
        if (next) { ev.preventDefault(); next.click(); }
        else if (check && !check.disabled && document.activeElement && document.activeElement.id !== 'giveup' && document.activeElement.id !== 'hint' && document.activeElement.id !== 'stop') { ev.preventDefault(); check.click(); }
      } else if (/^[1-9]$/.test(ev.key) && phase !== 'done' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) {
        const b = root.querySelector(`#choices button[data-k="${Number(ev.key) - 1}"]`);
        if (b) b.click();
      }
    }
    render();
  }

  function practice(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    const start = () => exercise(root, E.start('practice', { skillId: sid }), { back: unitHref(where.course, where.unit), backLabel: where.unit.title, again: start });
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
      ['calc', '#/calc', 'Calculator', 'Keys like the graphing calculator used in class, with exact fractions and every step shown.', 'calc', 255],
      ['graph', '#/graph', 'Graphing calculator', 'Start a graph with one tap, then explore it with sliders.', 'graph', 200],
      ['numbers', '#/numbers', 'Number explorer', 'Primes, factor trees, divisibility, GCF and LCM.', 'tree', 140],
      ['data', '#/data', 'Data and statistics', 'Mean, median, IQR, MAD, box plots and histograms.', 'data', 175],
      ['fractions', '#/fractions', 'Fraction lab', 'Add, subtract, multiply, divide and compare fractions, shown as bars and area models.', 'fraction', 25],
      ['integers', '#/integers', 'Integer tiles', 'Add, subtract, multiply and divide negative numbers with + and − tiles, one step at a time.', 'integers', 330],
      ['shapes', '#/shapes', 'Shapes and space', 'Area, perimeter, volume, surface area, nets and angles, drawn to scale.', 'shapes', 280],
      ['percent', '#/percent', 'Percents and money', 'Percent problems, sales, tips, markups and interest on a percent ruler.', 'percent', 45],
      ['chance', '#/chance', 'Probability simulator', 'Spinners, number cubes, coins and marbles, run up to 1,000 times.', 'dice', 0],
      ['tiles', '#/tiles', 'Algebra tiles', 'CPM’s equation mat and comparison mat, with legal moves.', 'tiles', 160],
      ['steps', '#/steps', 'Step checker', 'Write your work line by line; each line is checked exactly.', 'steps', 215],
      ['setup', '#/setup', 'Word problems', 'Turn a story into an equation, then solve it. Every step is checked.', 'story', 30],
      ['sprint', '#/sprint', 'Speed sprints', sp ? `One-minute rounds of math facts. Best score: ${sp}.` : 'One-minute rounds of math facts, against the clock.', 'timer', 350],
      ['words', '#/words', 'Math vocabulary', window.VOCAB && VOCAB.known() ? `${VOCAB.known()} terms learned. Flashcards with spaced review.` : 'Definitions of math terms in plain language, with flashcards.', 'book', 265],
      ['leap', '#/leap', 'Leap', leapLine(), 'flag', 140],
      ['balance', '#/balance', 'Balance', 'A seesaw puzzle: weight × distance must match on both sides.', 'balance', 95],
      ['prep', prepHref, 'Test preparation', f ? `A plan for your ${esc(f.book.short)} chapter ${f.chapter.n} test.` : 'A day-by-day plan for a CPM chapter test.', 'calendar', 190],
    ];
  }
  function leapLine() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); } catch (e) { st = null; }
    return st && st.level > 1 ? `A number-line puzzle. You are on level ${st.level}.` : 'A number-line puzzle: reach the target using every card once.';
  }
  const toolCard = ([, href, t, sub, ic, hue]) => `<a class="card tool" href="${href}"><span class="tool-ic">${icon(ic, 22)}</span><span><b>${t}</b><span class="small muted">${sub}</span></span></a>`;
  /** the Tools page (#/tools), in groups */
  function tools(root) {
    const by = Object.fromEntries(toolList().map(t => [t[0], t]));
    const groups = [['Calculators', ['calc', 'graph']], ['Numbers, fractions and ratios', ['fractions', 'integers', 'ratios', 'percent', 'numbers']], ['Shapes, data and chance', ['shapes', 'data', 'chance']], ['Equations', ['tiles', 'steps', 'setup']], ['Practice and play', ['unlimited', 'leap', 'balance', 'sprint', 'words', 'prep']]];
    root.innerHTML = `<h1>Tools</h1><p class="muted" style="margin-top:-4px">Hands-on tools for working things out, exploring ideas and practicing.</p>
      ${groups.map(([g, keys]) => `<div class="section-title"><h2>${g}</h2></div><div class="grid tools">${keys.filter(k => by[k]).map(k => toolCard(by[k])).join('')}</div>`).join('')}`;
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
  /** the one button at the top of Home: carry on with the last skill, else today's practice */
  function continueTarget() {
    const st = S.get(), last = st.recent.find(id => A.skills[id] && A.whereIs(id) && S.skill(id).level < 4);
    if (last) return { href: practiceHref(last), label: 'Continue', sub: A.stripTags(A.skills[last].title) };
    if (E.dailyPlan().total && !(st.days[S.today()] || {}).daily) return { href: '#/daily', label: 'Start today’s practice', sub: '' };
    return null;
  }
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
        ${group('Practice', [['#/unlimited', 'Unlimited practice'], ['#/unlimited/picture', 'Questions like a picture'], ['#/unlimited/weak', 'Mix my weak skills'], ['#/sprint', 'Speed sprints'], ['#/words/cards', 'Math vocabulary flashcards']])}
        ${group('Courses', [['#/courses', 'All courses'], ['#/courses/cpm', 'CPM books']].concat(mine.map(c => [c.chapters ? '#/cpm/' + c.id : courseHref(c), c.title])))}
        ${group('Tools', toolList().map(t => [t[1], t[2]]))}
        ${group('Help', [['#/tutor', 'Tutor'], ['#/words', 'Math words'], ['#/steps', 'Step checker'], ['#/search/', 'Search']])}
        ${group('You', [['#/progress', 'Progress'], ['#/mastered', 'Mastered skills'], ['#/notes', 'My notes'], ['#/report', 'Progress report'], ['#/family', 'Family and class'], ['#/profile', 'Profile'], ['#/settings', 'Settings'], ['#/new', 'What’s new']])}
      </div>`;
    root.querySelector('#tour-again').addEventListener('click', () => { S.setProfile({ tourNext: true }); location.hash = '#/'; });
    tutorCtx(null);
  }
  /** a one-time note on what the four levels mean, once a skill has one */
  function levelsNote() {
    const st = S.get();
    if (st.profile.levelsSeen || !Object.values(st.skills).some(x => x.level > 0)) return '';
    return `<section class="card levels-note" id="levels-note"><div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">How skill levels work</h2><button type="button" class="btn sm ghost" id="levels-x">Got it</button></div>
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
  /** someone who hasn't started yet: no grade, no saved course, no practice, and hasn't skipped the welcome */
  const isNew = () => { const st = S.get(); return !st.profile.welcomed && st.profile.grade == null && !st.profile.adult && !st.profile.name.trim() && !st.profile.enrolled.length && !Object.keys(st.skills).length && !Object.values(st.days).some(d => d.q) && !(window.ACCOUNT && ACCOUNT.user()); };
  /** a first visit: who is learning (any age) and how much a day; then straight into the first practice */
  function welcomeCard() {
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => [String(g), ordinal(g)]).concat([['adult-basics', 'Adult: everyday math'], ['adult-algebra', 'Adult: algebra']]);
    const goals = [[10, 'Casual', 'about 5 minutes'], [20, 'Regular', 'about 10 minutes'], [30, 'Serious', 'about 15 minutes']];
    return `<section class="card welcome" id="welcome" aria-labelledby="wl-h">
      <h2 id="wl-h">Welcome to Procademy</h2>
      <p class="muted">Free math practice for every age, with a tutor that explains. Two quick choices and you’re ready to start.</p>
      <div class="field"><span class="label">Who is learning?</span><div class="wl-levels" role="radiogroup" aria-label="Who is learning">${levels.map(([v, l]) => `<button type="button" class="chip-btn" role="radio" aria-checked="false" data-level="${v}">${l}</button>`).join('')}</div></div>
      <div class="field"><span class="label">A daily goal</span><div class="wl-goals" role="radiogroup" aria-label="Daily goal">${goals.map(([n, l, t], k) => `<button type="button" class="wl-goal${k === 1 ? ' on' : ''}" role="radio" aria-checked="${k === 1}" data-goal="${n}"><b>${l}</b><span class="small muted">${n} questions a day, ${t}</span></button>`).join('')}</div></div>
      <div class="wl-plan" id="wl-plan" hidden aria-live="polite"></div>
      <div class="btn-row"><button class="btn primary" id="wl-place" type="button" disabled>Find my starting point</button><button class="btn" id="wl-start" type="button" disabled>Start practicing now</button><button class="btn" id="wl-try" type="button" disabled>Try one question</button><button class="btn ghost" id="wl-skip" type="button">Look around first</button></div>
      <p class="tiny muted" style="margin:8px 0 0">Finding your starting point takes a few minutes: one question from each unit, so practice begins where you need it.</p>
    </section>`;
  }
  function wireWelcome(root) {
    const w = root.querySelector('#welcome');
    if (!w) return;
    let level = null, goal = 20;
    const pick = (sel, key, fn) => w.querySelectorAll(sel).forEach(b => b.addEventListener('click', () => {
      w.querySelectorAll(sel).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
      fn(b.dataset[key]);
    }));
    /** the week ahead, as soon as a level is chosen: the course, the daily goal, the puzzle and the weekly goal */
    const showPlan = () => {
      const box = w.querySelector('#wl-plan');
      if (level == null) { box.hidden = true; return; }
      const adult = level.startsWith('adult'), course = A.courseById(adult ? (level === 'adult-algebra' ? 'algebra-1' : 'math-6') : COURSE_FOR[Number(level)]);
      box.hidden = false;
      box.innerHTML = `<b>Your plan for this week</b><ul>
        <li>${course ? `Practice from <b>${esc(course.title)}</b>, starting where you need it` : 'Practice any skill you like'}</li>
        <li>${goal} questions a day, about ${Math.round(goal / 2)} minutes, with a puzzle of the day at your level</li>
        <li>5 days a week; a streak saver is earned for every 7 days in a row</li></ul>`;
    };
    pick('[data-level]', 'level', v => { level = v; ['#wl-start', '#wl-place', '#wl-try'].forEach(id => { w.querySelector(id).disabled = false; }); showPlan(); });
    pick('[data-goal]', 'goal', v => { goal = Number(v); showPlan(); });
    /** keep the choices; to = 'place' for the starting-point check, else today's practice */
    const go = to => {
      if (level == null) return;
      const adult = level.startsWith('adult'), grade = adult ? null : Number(level);
      const course = adult ? (level === 'adult-algebra' ? 'algebra-1' : 'math-6') : COURSE_FOR[grade];
      S.setProfile({ grade, adult, goal, welcomed: true, seenNews: NEWS, tourNext: true });
      const ok = course && A.courseById(course);
      if (ok && !S.get().profile.enrolled.includes(course)) S.enroll(course, true);
      // one question to try: the first skill of the course, as a one-question set
      const first = ok && E.courseOrder(A.courseById(course))[0];
      location.hash = to === 'place' && ok ? '#/placement/' + course : to === 'try' && first ? '#/unlimited/sample/' + encodeURIComponent(first) : '#/daily';
    };
    w.querySelector('#wl-try').addEventListener('click', () => go('try'));
    w.querySelector('#wl-start').addEventListener('click', () => go('practice'));
    w.querySelector('#wl-place').addEventListener('click', () => go('place'));
    w.querySelector('#wl-skip').addEventListener('click', () => { S.setProfile({ welcomed: true, seenNews: NEWS, tourNext: true }); home(root); });
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
  /** today's plan: practice, a challenge that suits the learner's age, and the daily goal; with this week's days */
  function todayCard() {
    const st = S.get(), t = S.today(), d = st.days[t] || {}, q = d.q || 0, g = window.BADGES ? BADGES.goal() : 20;
    const plan = E.dailyPlan(), streak = S.streak(), savers = st.savers || { n: 0, used: {} };
    const young = st.profile.grade != null && st.profile.grade < 3;
    let leapDone = false;
    try { leapDone = !!((JSON.parse(localStorage.getItem('procademy.leap.v1') || '{}') || {}).daily || {})[t]; } catch (e) { leapDone = false; }
    const balanceDay = !!window.BALANCE && (Date.UTC(...t.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) / 864e5) % 2 === 1;      // the puzzle of the day takes turns (by calendar day: no time zone or clock change can skip a turn)
    const factsAt = window.SPRINT ? SPRINT.deckState('add').last : 0, factsDone = !!factsAt && S.today(new Date(factsAt)) === t;
    const parts = [plan.due.length && `${plural(plan.due.length, 'skill')} to review before ${plan.due.length === 1 ? 'it slips' : 'they slip'}`, plan.missed.length && `${plural(plan.missed.length, 'mistake')} to correct`, plan.fresh.length && `${plural(plan.fresh.length, 'new skill')}`].filter(Boolean);
    const items = [
      { done: !!d.daily, icon: 'calendar', name: 'Today’s practice', sub: plan.total ? `${plural(plan.total, 'question')} · about ${Math.max(3, Math.round(plan.total * 0.7))} minutes${parts.length ? ' · ' + parts.join(' · ') : ''}` : 'Save a course to get a practice plan made for you.', href: plan.total ? '#/daily' : '#/courses', go: plan.total ? 'Start' : 'Choose a course', again: 'Practice again' },
      young ? { done: factsDone, icon: 'timer', name: 'Facts round', sub: 'One minute of addition facts. Try to beat your best.', href: '#/sprint/add', go: 'Play', again: 'Play again' }
        : balanceDay ? { done: BALANCE.dailyDone(), icon: 'balance', name: 'Puzzle of the day', sub: 'Today’s Balance puzzle: place every weight so the seesaw is level.', href: '#/balance/daily', go: 'Play', again: 'See it again' }
        : { done: leapDone, icon: 'flag', name: 'Puzzle of the day', sub: 'Today’s Leap puzzle: reach the flag using every card once.', href: '#/leap/daily', go: 'Play', again: 'See it again' },
      { done: st.profile.pod === t, icon: 'target', name: 'Problem of the day', sub: 'One new question at your level, every day.', href: '#/unlimited/day', go: 'Solve', again: 'See it again' },
    ];
    items.sort((a, b) => a.done - b.done);          // what is still to do comes first
    const all = items.every(x => x.done) && q >= g;          // the daily goal is the ring just below the card
    const fresh = somethingNew();
    const week = [];
    for (let k = 6; k >= 0; k--) { const iso = S.dayShift(t, -k), day = st.days[iso]; week.push({ iso, did: !!(day && day.q), kept: !!savers.used[iso], today: k === 0, label: new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
    const streakLine = (streak.days ? `${streak.days}-day streak` : 'No streak yet')
      + ` · <span>${savers.n ? `${savers.n} streak saver${savers.n > 1 ? 's' : ''}` : 'earn a streak saver with 7 days in a row'}</span> ${whatIs('streak', 'Your streak is how many days in a row you have practiced. A streak saver keeps it going if you miss a day: you earn one for every 7 days in a row, and can hold 2.')}`;
    return `<section class="card today-card daily-card${all ? ' all-done' : ''}" aria-labelledby="today-h">
      <div class="today-head"><div><h2 id="today-h">${all ? 'You’ve finished today’s plan' : 'Today'}</h2><p class="small muted" style="margin:0">${streakLine}</p></div>
        <ol class="week" aria-label="The last 7 days">${week.map(w => `<li class="${w.did ? 'did' : w.kept ? 'kept' : ''}${w.today ? ' today' : ''}"><button type="button" class="wk-day" data-day="${w.iso}" aria-label="${new Date(w.iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}${w.did ? ': practiced' : w.kept ? ': kept by a streak saver' : ''}" aria-expanded="false"><span>${w.label}</span><i aria-hidden="true">${w.did ? icon('check', 14) : ''}</i></button></li>`).join('')}</ol></div>
      <div class="day-detail small" id="day-detail" hidden aria-live="polite"></div>
      ${weekGoalLine()}
      <ul class="today-list">${items.map(x => `<li class="${x.done ? 'done' : ''}"><span class="today-ic">${icon(x.done ? 'check' : x.icon, 22)}</span>
        <div class="today-what"><b>${x.name}</b>${x.done ? ' <span class="chip up">Done</span>' : ''}<span class="small muted">${x.sub}</span></div>
        ${x.href ? `<a class="btn sm${x.done ? '' : ' primary'}" href="${x.href}">${x.done ? x.again : x.go}</a>` : ''}</li>`).join('')}</ul>
      <div class="today-more"><span class="small muted">${all ? 'That’s everything for today. Want more?' : 'Want more?'}</span><a class="btn sm" href="#/unlimited/quick">${icon('timer', 18)} 5 minutes</a><a class="btn sm" href="#/unlimited">${icon('unlimited', 18)} Unlimited practice</a><a class="btn sm" href="#/unlimited/picture">${icon('image', 18)} Questions like a picture</a></div>
      ${fresh ? `<p class="small today-new">Something new today: <a href="${skillHref(fresh)}">${A.skills[fresh].title}</a> <span class="muted">· ${esc(A.whereIs(fresh).course.title)}</span></p>` : ''}
    </section>`;
  }
  /** the kinds of slip the coach recognizes (lib/coach.js), as Review and Progress name them */
  const SLIPS = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation' };
  /** Review: the questions missed, grouped by the kind of slip and by skill, each group practiced on its own */
  function review(root) {
    tutorCtx(null);
    const missed = S.get().missed.filter(m => A.skills[m.skill] && A.whereIs(m.skill));
    if (!missed.length) { root.innerHTML = `<h1>Review</h1><div class="card empty">There is nothing to review. Every question you missed has been corrected.<div class="btn-row" style="justify-content:center"><a class="btn" href="#/">Home</a></div></div>`; return; }
    const groups = [];
    const bySlip = {};
    missed.forEach(m => { if (m.slip && SLIPS[m.slip]) (bySlip[m.slip] = bySlip[m.slip] || []).push(m); });
    Object.entries(bySlip).sort((x, y) => y[1].length - x[1].length).forEach(([k, list]) => groups.push({ key: 'slip:' + k, title: SLIPS[k], line: (window.COACH && COACH.TIPS && COACH.TIPS[k]) || '', list }));
    const bySkill = {};
    missed.forEach(m => (bySkill[m.skill] = bySkill[m.skill] || []).push(m));
    const skills = Object.entries(bySkill).sort((x, y) => y[1].length - x[1].length);
    const run = list => { const go = () => { const left = S.get().missed.filter(m => list.some(x => x.skill === m.skill && x.seed === m.seed)); if (!left.length) return review(root); exercise(root, E.start('review', { items: left }), { back: '#/review', backLabel: 'Review', again: go, againLabel: 'Keep reviewing these' }); }; go(); };
    const card = (key, title, line, n, extra) => `<li class="rv-group"><div class="rv-text"><b>${title}</b><span class="muted small">${plural(n, 'question')}${extra || ''}</span>${line ? `<p class="small" style="margin:4px 0 0">${esc(line)}</p>` : ''}</div><button class="btn sm primary" type="button" data-rv="${esc(key)}">Practice these</button></li>`;
    root.innerHTML = `<h1>Review your mistakes</h1>
      <p class="muted">${plural(missed.length, 'question')} to correct. Fix one kind of slip at a time, or one skill at a time. A question leaves the list once you get it right.</p>
      <div class="btn-row"><button class="btn primary" type="button" data-rv="all">Review them all</button></div>
      ${groups.length ? `<div class="card" style="margin-top:16px"><h2>By kind of mistake</h2><ul class="rv-groups">${groups.map(g => card(g.key, g.title, g.line, g.list.length)).join('')}</ul></div>` : ''}
      <div class="card" style="margin-top:16px"><h2>By skill</h2><ul class="rv-groups">${skills.slice(0, 12).map(([id, list]) => card('skill:' + id, A.skills[id].title, '', list.length, ` · ${esc(A.whereIs(id).course.title)} · <a href="${skillHref(id)}">See the lesson</a>`)).join('')}</ul></div>`;
    root.querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.rv;
      run(k === 'all' ? missed : k.startsWith('slip:') ? bySlip[k.slice(5)] : bySkill[k.slice(6)]);
    }));
  }

  /* ---------- progress ---------- */
  function progress(root) {
    const s = S.get(), st = S.streak();
    const allIds = Object.keys(A.skills);
    const levels = [0, 0, 0, 0, 0];
    allIds.forEach(id => { levels[S.skill(id).level] += 1; });
    const totalQ = Object.values(s.days).reduce((a, d) => a + d.q, 0), totalRight = Object.values(s.days).reduce((a, d) => a + d.right, 0);
    const activeDays = Object.values(s.days).filter(d => d.q).length;
    // heatmap: 26 weeks of Monday-first columns ending this week
    const today = S.today();
    const dow = (new Date(today + 'T12:00').getDay() + 6) % 7;         // 0 = Monday
    const start = S.dayShift(today, -(dow + 7 * 25));
    let cells = '';
    for (let k = 0; k < 26 * 7; k++) {
      const iso = S.dayShift(start, k);
      const d = s.days[iso];
      const q = d ? d.q : 0;
      const cls = !q ? '' : q < 5 ? 'h1' : q < 15 ? 'h2' : q < 30 ? 'h3' : 'h4';
      cells += `<span class="${cls}" title="${iso}: ${plural(q, 'question')}"${iso > today ? ' style="visibility:hidden"' : ''}></span>`;
    }
    const missed = s.missed.filter(m => A.skills[m.skill]);
    const kinds = { topic: 'Practice on a topic', practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'CPM practice', review: 'Review', daily: 'Today’s practice', 'chapter-test': 'Practice test', sprint: 'Speed sprint', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles', placement: 'Starting-point check' };
    const COACH_TIPS = () => (window.COACH ? COACH.TIPS : {});
    root.innerHTML = `
      <div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">Progress</h1><div class="btn-row" style="margin:0"><a class="btn sm" href="#/notes">My notes</a><a class="btn sm" href="#/report">Report for a parent or teacher</a><a class="btn sm" href="#/family">Family and class</a></div></div>
      <div class="tiles" style="margin-top:12px">
        <div class="tile"><div class="big">${st.days}</div><div class="label">${st.days === 1 ? 'day' : 'days'} in a row</div></div>
        <div class="tile"><div class="big">${fmt(s.points)}</div><div class="label">points</div></div>
        <div class="tile"><div class="big">${fmt(totalQ)}</div><div class="label">questions answered</div></div>
        <div class="tile"><div class="big">${totalQ ? Math.round(totalRight / totalQ * 100) : 0}%</div><div class="label">correct on the first try</div></div>
        <div class="tile"><div class="big">${activeDays}</div><div class="label">days practiced</div></div>
      </div>
      <div class="section-title"><h2>Activity</h2><span class="muted small">last 26 weeks</span></div>
      <div class="card"><div class="heat" aria-label="Questions answered per day">${cells}</div></div>
      <div class="section-title"><h2>Mastery</h2></div>
      <div class="card">${legend(levels)}<div style="margin-top:10px">${mbar(allIds)}</div>
${(() => {
          // the courses being learned (saved, or with any progress) first; the rest behind All courses
          const row = c => { const ids = A.courseSkills(c), m = E.mastery(ids); return `<tr><td><a href="${courseHref(c)}">${esc(c.title)}</a></td><td style="width:40%"><div class="row"><div class="pbar" style="flex:1" ${courseVar(c)}><span style="width:${m.pct}%"></span></div><b class="small">${m.pct}%</b></div></td><td class="small muted">${m.counts[4]} / ${m.counts[3]} / ${m.counts[2]} / ${m.counts[1]}</td></tr>`; };
          const head = '<thead><tr><th>Course</th><th>Mastery</th><th class="small">M / P / F / A</th></tr></thead>';
          const mine = A.courses.filter(c => s.profile.enrolled.includes(c.id) || A.courseSkills(c).some(id => S.skill(id).level > 0)), rest = A.courses.filter(c => !mine.includes(c));
          return (mine.length ? `<table class="plain" style="margin-top:14px">${head}<tbody>${mine.map(row).join('')}</tbody></table>` : '')
            + (rest.length ? `<details class="all-courses" ${mine.length ? '' : 'open'}><summary>${mine.length ? `All courses (${rest.length} more)` : 'All courses'}</summary><table class="plain">${head}<tbody>${rest.map(row).join('')}</tbody></table></details>` : '');
        })()}</div>
      ${(() => {
        const due = E.dueSkills();
        return `<div class="section-title"><h2>Due for review</h2><a href="#/daily">Today’s practice →</a></div>
          <div class="card">${due.length ? `<p class="muted small" style="margin:0 0 8px">${plural(due.length, 'skill')} due for a quick refresher${due.length > 3 ? '; Today’s practice includes them all' : ''}. Each one comes back later and later as you keep getting it right.</p><ul class="skills">${due.slice(0, 3).map(id => skillRow(id, { where: (A.whereIs(id) || { course: { title: '' } }).course.title + (S.skill(id).due ? ' · due ' + S.skill(id).due : '') })).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing due. Skills you practice come back here when it is time for a refresher.</p>'}</div>`;
      })()}
      ${(() => {
        const ms = Object.entries(s.mistakes || {}).filter(([k, m]) => m.n && (COACH_TIPS()[k])).sort((a, b) => b[1].n - a[1].n);
        if (!ms.length) return '';
        const total = ms.reduce((a, [, m]) => a + m.n, 0);
        const names = SLIPS;
        return `<div class="section-title"><h2>Your mistake patterns</h2></div>
          <div class="card"><p class="muted small" style="margin:0 0 10px">What the coach noticed in your wrong answers. Knowing your usual slip is half of fixing it.</p>
          <ul class="patterns">${ms.slice(0, 6).map(([k, m]) => { const top = Object.entries(m.skills || {}).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter(id => A.skills[id] && A.whereIs(id))[0]; return `<li><div class="row between"><b>${names[k] || k}</b><span class="muted small">${plural(m.n, 'time')}</span></div><div class="pbar"><span style="width:${Math.round(m.n / total * 100)}%"></span></div><p class="small" style="margin:6px 0 0">${esc(COACH_TIPS()[k])}${top ? ` Most often in <a href="${skillHref(top)}">${A.skills[top].title}</a>.` : ''}</p></li>`; }).join('')}</ul></div>`;
      })()}
      ${window.BADGES ? BADGES.shelf() : ''}
      ${window.CHALLENGE ? CHALLENGE.card() : ''}
      <div class="section-title"><h2>Mistakes to review</h2></div>
      <div class="card">${missed.length ? `<div class="row between"><span>${plural(missed.length, 'question')} you missed, rebuilt exactly as asked. Get one right and it comes off the list.</span><a class="btn primary sm" href="#/review">Review now</a></div>` : '<p class="muted" style="margin:0">Nothing waiting. Missed questions will collect here.</p>'}</div>
      <div class="section-title"><h2>Recent activity</h2></div>
      <div class="card">${s.log.length ? `<ul class="log">${s.log.slice(0, 8).map(e => {
        const what = e.title ? esc(e.title) : e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(e.course, e.unit) ? A.unitById(e.course, e.unit).title : e.course && A.courseById(e.course) ? A.courseById(e.course).title : '';
        return `<li><span class="when">${ago(e.t)}</span><span><b>${kinds[e.kind] || e.kind}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${(e.changes || []).map(ch => ` <span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.LEVELS[ch.to]}</span>`).join('')}</span><span class="pts">+${e.pts}</span></li>`; }).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing yet. Your practice will show up here.</p>'}</div>`;
    const heat = root.querySelector('.heat'); if (heat) heat.scrollLeft = heat.scrollWidth;        // a narrow screen shows the latest weeks, not the oldest
  }

  /* ---------- settings ---------- */
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
      <h1>Settings</h1>
      <div class="settings-grid">
        <section class="card set-card"><h2>You</h2>
          <div class="set-row"><label class="set-text" for="name"><span class="set-label">Your name</span><span class="set-help">For the greeting on Home</span></label><input id="name" class="set-input" type="text" value="${esc(p.name)}" placeholder="Optional" autocomplete="off"></div>
          <div class="set-row"><label class="set-text" for="grade"><span class="set-label">Grade</span><span class="set-help">Sets the puzzle of the day, the tutor and topic practice to your level</span></label><select id="grade" class="set-input"><option value="">Not set</option>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">${ordinal(g)}</option>`).join('')}<option value="adult">Adult learner</option></select></div>
          ${window.COACH && COACH.canSpeak() ? toggle('auto-read', 'Read questions aloud', 'Every practice question, in this device’s voice', p.autoRead) : ''}
        </section>
        <section class="card set-card"><h2>Look</h2>
          ${seg('theme', 'Colors', '', [['system', 'Device'], ['light', 'Light'], ['dark', 'Dark']], p.theme || 'system')}
          ${seg('size', 'Text size', '', [['normal', 'Normal'], ['large', 'Large'], ['xlarge', 'Extra large']], p.textSize || 'normal')}
          ${toggle('easy-read', 'Easier-to-read text', 'A clearer typeface with more space', p.easyRead)}
          ${seg('lang', 'Menus and buttons', 'Lessons, questions and the tutor stay in English', Object.entries(window.LANG ? LANG.NAMES : { en: 'English' }).map(([k, n]) => [k, n, k]), p.lang || 'en')}
        </section>
        <section class="card set-card"><h2>Goals</h2>
          ${seg('goal', 'Questions a day', 'The ring on Home. All practice counts', [10, 20, 30, 50].map(n => [n, String(n)]), Number(p.goal || 20))}
          ${seg('week-goal', 'Days a week', 'Shown in today’s plan on Home', [3, 4, 5, 6, 7].map(n => [n, String(n)]), Number(p.weekGoal || 5))}
        </section>
        <section class="card set-card"><h2>Your progress</h2>
          <p class="muted small">Everything is saved in this browser. Save a copy to keep it safe, or load it on another device.</p>
          <div class="btn-row" style="margin-top:0"><button class="btn primary" id="export">Save a copy</button><label class="btn">Load a copy <input id="import" type="file" accept="application/json,.json" class="visually-hidden"></label></div>
          ${window.MOVE ? MOVE.box() : ''}
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
        <section class="card set-card"><div class="row between" style="flex-wrap:wrap;gap:8px;margin-bottom:8px"><h2 style="margin:0">About</h2><a class="btn sm" href="#/new">What’s new</a></div><p class="muted small">${A.courses.length} courses, ${skillCount} skills. Every question is made on this device, so a missed one can be asked again exactly as it was. Progress stays here unless you make an account. Only what you ask the AI is sent, to a free AI service. <a href="${(window.MOVE ? MOVE.siteBase() : '').replace(/[^/]*$/, '')}privacy.html">Privacy</a> · <a href="#/new">Updates</a> · <a href="https://github.com/priyaanh/procademy">Source on GitHub</a></p></section>
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
    root.querySelector('#easy-read').addEventListener('change', ev => { S.setProfile({ easyRead: ev.target.checked }); window.APP.applyPrefs(); });
    const ar = root.querySelector('#auto-read'); if (ar) ar.addEventListener('change', ev => { S.setProfile({ autoRead: ev.target.checked }); toast(ev.target.checked ? 'Questions will be read aloud' : 'Read-aloud off'); });
    onSeg('goal', v => { S.setProfile({ goal: Number(v) }); toast('Daily goal: ' + v + ' questions'); });
    onSeg('week-goal', v => { S.setProfile({ weekGoal: Number(v) }); toast('Weekly goal: ' + v + ' days'); });
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
      <div id="lock-panel"></div>`;
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
    const busy = on => f.querySelectorAll('input, button').forEach(x => { x.disabled = on; });
    f.querySelector('#lk-cancel').addEventListener('click', () => { panel.innerHTML = ''; });
    (f.querySelector('#lk-proof') || f.querySelector('#lk-cancel')).focus();
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
    calc: 'calculator arithmetic decimal fraction mixed number exponent square root order of operations', graph: 'graph graphing line slope equation inequality function parabola plot',
    fractions: 'fraction mixed number numerator denominator common denominator equivalent simplify reciprocal add subtract multiply divide compare area model',
    integers: 'integer negative positive zero pair tiles add subtract multiply divide opposite sign', ratios: 'ratio rate unit rate proportion proportional scale drawing better buy share constant',
    percent: 'percent discount sale tax tip interest markup money', numbers: 'prime factor factor tree divisibility gcf lcm greatest common factor least common multiple',
    data: 'data statistics mean median mode range iqr mad box plot histogram dot plot stem and leaf', shapes: 'shape area perimeter volume surface area net angle triangle circle prism cylinder cone sphere pyramid',
    chance: 'probability chance spinner dice coin simulation experiment', tiles: 'algebra tiles equation mat solve equations comparison', steps: 'check steps solve equation working',
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
    findSkills, matcher, find, skillMap, notes, mathTopic, setGrade, ordinal, mastered, sitemap, fixQuery,
    _h: { toolLinks, esc, plain, lvl, mbar, legend, skillRow, exercise, plural, fmt, courseVar, mono, skillHref, practiceHref, explainBtn, bindExplain, tutorCtx, saveBtn, wireSaving, isSaved, dragHandle, wireReorder, exercise, unitHref, courseHref } };
})();
