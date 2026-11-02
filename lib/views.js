/* Every screen on the site. Each view is a function (root, ...params) that fills `root`. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, M = window.M;
  const esc = M.esc;

  /* ---------- small helpers ---------- */
  /** HTML as plain text, keeping math readable: fractions as 3/4, powers as x^2 (see COACH.text) */
  const plain = html => { if (window.COACH) return COACH.text(html); const d = document.createElement('div'); d.innerHTML = String(html || '').replace(/<(br|\/p|\/li|\/div|\/tr)\s*\/?>/gi, '$& '); return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const tutorCtx = c => { if (window.TUTORUI) window.TUTORUI.setContext(c); };
  const explainBtn = (label, ask) => `<button class="btn ghost tutor-ask" data-ask="${esc(ask)}"><span aria-hidden="true">✦</span> ${esc(label)}</button>`;
  /** wire every "✦ explain" button inside el to open the tutor with its question */
  function bindExplain(el) { el.querySelectorAll('.tutor-ask').forEach(b => b.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: b.dataset.ask }))); }
  const possessive = name => name + (/s$/i.test(name) ? '’' : '’s');
  const brand = () => 'Procademy';
  const greeting = () => { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  const lvl = (level, big) => `<span class="lvl lvl-${level}${big ? ' big' : ''}" role="img" aria-label="${A.LEVELS[level]}" title="${A.LEVELS[level]}"></span>`;
  const courseVar = c => `style="--course:hsl(${c.hue == null ? 215 : c.hue} 70% 45%)"`;
  const courseHref = c => `#/course/${c.id}`;
  const unitHref = (c, u) => `#/unit/${c.id}/${u.id}`;
  const skillHref = sid => `#/skill/${encodeURIComponent(sid)}`;
  const practiceHref = sid => `#/practice/${encodeURIComponent(sid)}`;
  /** links to the hands-on tools for a skill or a CPM lesson: algebra tiles, the probability simulator, the number explorer, data and statistics, shapes, percents and money, and Leap */
  function toolLinks(id, text) {
    const t = String(id || '') + ' ' + String(text || ''), out = [];
    if (/compare-expressions|comparison mat|comparing (two )?expressions|which expression is greater|comparing quantities with variables/i.test(t)) out.push(['#/tiles/compare', '🟩', 'Compare with algebra tiles']);
    else if (/one-step-equations|two-step-equations|variables-both-sides|equation mat|solving equations on/i.test(t)) out.push(['#/tiles', '🟩', 'Solve with algebra tiles']);
    if (/probab|simulation/i.test(t)) out.push([/compound|tables|trees|two independent/i.test(t) ? '#/chance/dice' : /coin/i.test(t) ? '#/chance/coin' : '#/chance/spinner', '🎲', 'Probability simulator']);
    if (/factors-primes|gcf-lcm|\bprimes?\b|factor pairs|greatest common factor|least common multiple|characteristics of numbers/i.test(t) && !/factoring/i.test(t)) out.push([/gcf|lcm|common (factor|multiple)/i.test(t) ? '#/numbers/12-18' : '#/numbers/84', '🌳', 'Number explorer']);
    if (/mean-median|g6\.spread|histogram|stem-and-leaf|dot plot|box plot|center-and-spread|distribution|absolute deviation|\bMAD\b|quartile/i.test(t) && !/normal|z-score|percentile/i.test(t)) out.push(['#/data', '📊', 'Data and statistics']);
    const sh = shapeKind(t);
    if (sh) out.push(['#/shapes/' + sh, '📐', 'Shapes and space']);
    if (/percent|interest|discount|sale price|\btips?\b|sales tax|mark-?ups?/i.test(t) && !/percentile|confidence|margin of error|z-score|normal distribution|circle graph|categorical|association/i.test(t)) {
      const m = /interest/i.test(t) ? 'interest' : /discount|sale price|on sale/i.test(t) ? 'sale' : /\btips?\b|sales tax/i.test(t) ? 'bill' : /mark-?ups?/i.test(t) ? 'markup' : /percent (increase|decrease|change)|percent-change|increase and decrease/i.test(t) ? 'change' : 'of';
      out.push(['#/percent/' + m, '💲', 'Percents and money']);
    }
    if (/integer|negative|order-of-operations|order of operations|opposites/i.test(t) && !/exponent|root|polynomial|probabilit|coordinate|graph|coefficient|association|slope|scientific|inequalit|zero|tiles?\b/i.test(t)) out.push(['#/leap', '🐸', 'Play Leap']);
    return out.map(([h, i, l]) => `<a class="btn ghost" href="${h}"><span aria-hidden="true">${i}</span> ${l}</a>`).join('');
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
  /** a ☆ Save / ★ Saved toggle; id is a course id, or 'cpm:<book>' for a CPM book */
  const saveBtn = (id, title) => { const on = isSaved(id); return `<button type="button" class="save-btn${on ? ' on' : ''}" data-save="${esc(id)}" aria-pressed="${on}" aria-label="${on ? 'Remove ' + esc(title) + ' from' : 'Save ' + esc(title) + ' to'} your home page">${on ? '★ Saved' : '☆ Save'}</button>`; };
  let saveWired = false;
  function wireSaving() {
    if (saveWired) return; saveWired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-save]');
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      const id = b.dataset.save, on = !isSaved(id);
      S.enroll(id, on);
      document.querySelectorAll(`[data-save="${CSS.escape(id)}"]`).forEach(x => { x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); x.textContent = on ? '★ Saved' : '☆ Save'; });
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
  const nextInCourse = c => A.courseSkills(c).find(id => S.skill(id).level < 3) || A.courseSkills(c)[0];
  function courseCard(c, opts) {
    opts = opts || {};
    const ids = A.courseSkills(c), m = E.mastery(ids), nx = opts.continue ? nextInCourse(c) : null;
    return `<div class="card course-card" ${courseVar(c)} data-filter="${esc(A.normText(c.title + ' ' + (c.blurb || '') + ' ' + c.subject))}" data-band="${esc(c.subject)}"${opts.drag ? ` data-id="${esc(c.id)}"` : ''}>
      <div class="row between" style="align-items:flex-start"><span class="icon" aria-hidden="true">${c.icon || '📘'}</span><span class="card-tools">${opts.drag ? dragHandle(c.title) : ''}${saveBtn(c.id, c.title)}</span></div>
      <h3><a class="card-link" href="${courseHref(c)}">${esc(c.title)}</a></h3>
      ${opts.continue ? '' : `<p>${esc(c.blurb || '')}</p>`}
      <div class="row between small muted"><span>${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</span><span>${m.pct}% mastered</span></div>
      <div class="pbar"><span style="width:${m.pct}%"></span></div>
      ${nx ? `<a class="btn primary sm continue" href="${practiceHref(nx)}">Continue: ${A.skills[nx].title}</a>` : ''}</div>`;
  }
  function stats() {
    const st = S.streak(), pts = S.get().points;
    return `<span class="stat-pill${st.days ? '' : ' cold'}" title="Practice streak">🔥 ${st.days}</span><span class="stat-pill" title="Energy points">⚡ ${fmt(pts)}</span>`;
  }

  /* ---------- home ---------- */
  function home(root) {
    const s = S.get();
    const name = s.profile.name.trim();
    const allIds = Object.keys(A.skills);
    const mastered = allIds.filter(id => S.skill(id).level === 4).length;
    const st = S.streak();
    const recent = s.recent.filter(id => A.skills[id]).slice(0, 3);
    wireSaving();
    const courses = s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean);
    const books = s.profile.enrolled.filter(id => id.startsWith('cpm:')).map(id => A.cpmById(id.slice(4))).filter(Boolean);
    // saved courses and books together, in the order the learner put them
    const mine = s.profile.enrolled.map(id => id.startsWith('cpm:') ? (window.CPMVIEWS && A.cpmById(id.slice(4)) ? CPMVIEWS.bookCard(A.cpmById(id.slice(4)), { continue: true, drag: true }) : '') : A.courseById(id) ? courseCard(A.courseById(id), { continue: true, drag: true }) : '').filter(Boolean);
    const practised = A.courses.filter(c => !courses.includes(c) && A.courseSkills(c).some(id => S.skill(id).level > 0));
    // up next: the first unfinished skill in each course the learner is working on
    const upNext = [];
    (courses.length ? courses : practised).forEach(c => {
      const sid = A.courseSkills(c).find(id => S.skill(id).level < 3 && !recent.includes(id));
      if (sid && upNext.length < 3) upNext.push({ sid, c });
    });
    const days = [];
    for (let k = 6; k >= 0; k--) { const iso = S.dayShift(S.today(), -k); const d = s.days[iso] || { q: 0 }; days.push({ iso, q: d.q, label: new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
    const maxQ = Math.max(1, ...days.map(d => d.q));
    root.innerHTML = `
      <h1>${greeting()}${name ? ', ' + esc(name) : ''} 👋${window.LEARNERS && LEARNERS.count() > 1 ? ' <a class="switch-learner" href="#/profile">Not you? Switch</a>' : ''}</h1>
      <p class="muted">${st.today ? 'You have practised today. Keep the streak going.' : st.days ? 'Practise today to keep your streak.' : 'Pick a skill and start a streak.'}</p>
      <div class="tiles">
        <div class="tile"><div class="big">🔥 ${st.days}</div><div class="label">day streak</div></div>
        ${window.BADGES ? BADGES.ring() : `<div class="tile"><div class="big">⚡ ${fmt(s.points)}</div><div class="label">energy points</div></div>`}
        <div class="tile"><div class="big">★ ${mastered}</div><div class="label">of ${allIds.length} skills mastered</div></div>
        ${window.BADGES ? `<a class="tile badge-tile" href="#/progress"><div class="big">🏅 ${BADGES.all().filter(b => b.at).length}</div><div class="label">badges · see them</div></a>` : ''}
      </div>
      ${window.PREP ? PREP.homeCard() : ''}${dailyCard()}${newsCard()}
      <div class="section-title"><h2>My courses</h2>${mine.length > 1 ? '<span class="small muted reorder-hint">Drag a course to move it</span>' : ''}<a href="#/courses">Browse courses →</a></div>
      ${mine.length ? `<div class="grid my-courses" id="my-courses">${mine.join('')}</div><p class="visually-hidden" aria-live="polite" id="my-courses-live"></p>`
        : `<div class="card empty-saved"><p><b>No saved courses yet.</b> Find your grade or your class’s CPM book on the Courses page and press <b>☆ Save</b>; it will appear here.</p>
          <div class="btn-row"><a class="btn primary" href="#/courses">Browse courses</a><a class="btn" href="#/courses/cpm">CPM books</a></div>
          ${practised.length ? `<p class="small muted" style="margin:14px 0 6px">You have practised in:</p><div class="chips">${practised.map(c => `<span class="grade-chip" ${courseVar(c)}><span aria-hidden="true">${c.icon}</span><a href="${courseHref(c)}">${esc(c.title)}</a>${saveBtn(c.id, c.title)}</span>`).join('')}</div>` : ''}</div>`}
      ${window.CPMVIEWS ? CPMVIEWS.homeCard() : ''}
      ${recent.length ? `<div class="section-title"><h2>Pick up where you left off</h2></div>
        <div class="grid">${recent.map(id => { const d = A.skills[id], w = A.whereIs(id), st2 = S.skill(id); return `<div class="card tight"><div class="row">${lvl(st2.level, true)}<div style="flex:1;min-width:0"><div><a href="${skillHref(id)}"><b>${d.title}</b></a></div><div class="small muted">${w ? esc(w.course.title + ' · ' + w.unit.title) : ''}</div></div></div><div class="btn-row"><a class="btn sm primary" href="${practiceHref(id)}">Practice</a><span class="chip lv-${st2.level}">${A.LEVELS[st2.level]}</span></div></div>`; }).join('')}</div>` : ''}
      ${upNext.length ? `<div class="section-title"><h2>Up next</h2></div>
        <div class="card"><ul class="skills">${upNext.map(x => skillRow(x.sid, { where: x.c.title + ' · ' + A.whereIs(x.sid).unit.title })).join('')}</ul></div>` : ''}
      ${toolsRow()}
      <div class="section-title"><h2>This week</h2><a href="#/progress">Progress →</a></div>
      <div class="card"><div class="bars">${days.map(d => `<div class="b${d.iso === S.today() ? ' today' : ''}" title="${d.iso}: ${plural(d.q, 'question')}"><i style="height:${d.q / maxQ * 80}%"></i><span>${d.label}</span></div>`).join('')}</div>
      <p class="small muted" style="margin:8px 0 0">Questions answered each day. ${days.reduce((a, d) => a + d.q, 0)} this week.</p></div>`;
    void books;
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
      <p class="muted">Math for every grade, from Kindergarten to Precalculus, and the CPM books chapter by chapter. Press <b>☆ Save</b> on a course to keep it on your home page.</p>
      <div class="course-tools card tight">
        <div class="tabs" role="tablist" aria-label="Show">${COURSE_TABS.map(([id, label]) => `<a role="tab" class="tab${id === tab ? ' on' : ''}" aria-selected="${id === tab}" href="#/courses${id === 'all' ? '' : '/' + encodeURIComponent(id)}">${label}</a>`).join('')}</div>
        <input id="course-find" type="search" placeholder="Find a course: “7th”, “algebra”, “geometry”…" aria-label="Find a course" autocomplete="off">
      </div>
      <div id="course-list">${A.subjects().map(sub => `<section class="band-section" data-band="${esc(sub)}"><div class="section-title"><h2>${esc(sub)}</h2></div><div class="grid">${A.courses.filter(c => c.subject === sub).map(c => courseCard(c)).join('')}</div></section>`).join('')}
        ${books.length && window.CPMVIEWS ? `<section class="band-section" data-band="cpm"><div class="section-title"><h2>CPM books</h2><a href="#/cpm">CPM page →</a></div><div class="grid">${books.map(b => CPMVIEWS.bookCard(b)).join('')}</div></section>` : ''}
      </div>
      <div class="card empty" id="course-none" hidden>Nothing matches. Try a shorter word, like “grade” or “algebra”.</div>`;
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
      if (!shown && tab === 'saved' && !words.length) none.innerHTML = 'You haven’t saved any courses yet. Press <b>☆ Save</b> on a course and it shows here and on your home page.';
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
          <div class="row"><span class="icon-big" aria-hidden="true">${c.icon || '📘'}</span><div><h1 style="margin:0">${esc(c.title)}</h1><div class="muted">${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}</div></div></div>
          ${saveBtn(c.id, c.title).replace('class="save-btn', 'id="enroll" class="save-btn big')}
        </div>
        <p style="margin-top:12px">${esc(c.blurb || '')}</p>
        <div class="row between"><b>Course mastery: ${m.pct}%</b><span class="muted small">${fmt(m.points)} of ${fmt(m.possible)} mastery points</span></div>
        ${mbar(ids)}
        <div style="margin-top:10px">${legend(m.counts)}</div>
      </div>
      <div class="two-col" style="margin-top:20px">
        <aside class="sidebar card tight"><ul class="unit-nav">${c.units.map((u, i) => `<li><a href="${unitHref(c, u)}"><span class="n">${i + 1}</span><span>${esc(u.title)}</span><span class="pbar"><span style="width:${E.mastery(u.skills).pct}%"></span></span></a></li>`).join('')}</ul></aside>
        <div>
          <div class="grid">
            <div class="card tight"><h3>Course challenge</h3><p class="muted small">${Math.min(E.CHALLENGE_N, ids.length)} questions drawn from every unit. Right answers level skills up; wrong ones level them down.</p><a class="btn primary sm" href="#/challenge/${c.id}">Start course challenge</a></div>
            <div class="card tight"><h3>Mastery challenge</h3><p class="muted small">${pool.length ? `${E.MASTERY_N} questions on the ${plural(pool.length, 'skill')} you are Familiar or Proficient in, to push them higher.` : 'Practise a few skills to Familiar or Proficient first, then come back to push them to Mastered.'}</p>${pool.length ? `<a class="btn primary sm" href="#/mastery/${c.id}">Start mastery challenge</a>` : `<button class="btn sm" disabled>Not available yet</button>`}</div>
          </div>
          ${c.units.map((u, i) => unitCard(c, u, i)).join('')}
        </div>
      </div>`;

  }
  function unitCard(c, u, i) {
    const m = E.mastery(u.skills);
    return `<div class="card unit-card" style="margin-top:16px">
      <div class="num">Unit ${i + 1}</div>
      <div class="row between"><h3 style="margin:0"><a href="${unitHref(c, u)}">${esc(u.title)}</a></h3><span class="muted small">${m.points} / ${m.possible} points</span></div>
      ${u.blurb ? `<p class="muted small" style="margin:4px 0 8px">${esc(u.blurb)}</p>` : ''}
      ${mbar(u.skills, true)}
      <ul class="skills" style="margin-top:10px">${u.skills.map(sid => skillRow(sid)).join('')}
        <li class="test"><span aria-hidden="true">📝</span><div class="name">Unit test<div class="sub">${plural(u.skills.length, 'question')}, one per skill. Level up or down.</div></div><div class="actions"><a class="btn sm" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
      </ul></div>`;
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
              <li class="test"><span aria-hidden="true">📝</span><div class="name">Unit test<div class="sub">${plural(u.skills.length, 'question')}, one per skill.</div></div><div class="actions"><a class="btn sm primary" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
              <li class="test"><span aria-hidden="true">🖨</span><div class="name">Printable worksheet<div class="sub">Questions from every skill in this unit, with an answer key.</div></div><div class="actions"><a class="btn sm" href="#/worksheet/unit/${c.id}/${u.id}">Make a worksheet</a></div></li>
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
        <div class="row">${lvl(st.level, true)}<div style="flex:1;min-width:0"><h1 style="margin:0">${def.title}</h1><div class="muted small">${A.LEVELS[st.level]}${st.sets ? ` · practised ${plural(st.sets, 'time')} · ${st.tries ? Math.round(st.right / st.tries * 100) : 0}% right` : ' · not practised yet'}</div></div></div>
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice · ${E.PRACTICE_N} questions</a>${explainBtn('Explain it with the tutor', `Explain “${plain(def.title)}” to me step by step, with an example.`)}<a class="btn ghost" href="#/worksheet/skill/${encodeURIComponent(sid)}">🖨 Worksheet</a>${toolLinks(sid, plain(def.title))}${nxt ? `<a class="btn ghost" href="${skillHref(nxt)}">Next skill: ${A.skills[nxt].title} →</a>` : ''}</div>
      </div>
      <div class="card learn" style="margin-top:16px"><h2>Learn</h2>${def.learn || '<p class="muted">No notes for this skill yet. Jump into practice: every question comes with step-by-step hints.</p>'}
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice</a>${explainBtn('Explain it another way', `I read the lesson on “${plain(def.title)}”. Can you explain it a different way, with a new example?`)}</div></div>
      <div class="card worked" id="worked" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Worked example</h2><button class="btn sm ghost" id="we-new" type="button">↻ Another example</button></div>
        <p class="muted small" style="margin:4px 0 10px">A new example every time, solved one step at a time. Try each step yourself before you show it.</p><div id="we-body"></div></div>`;
    tutorCtx({ course: c.title, skill: plain(def.title), notes: plain(def.learn) });
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
        ${done ? `<div class="feedback good">✅ <span>Answer: <b>${answer}</b></span></div><div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Now try some yourself</a></div>`
          : `<div class="btn-row"><button class="btn primary" id="we-next" type="button">${shown === 0 ? 'Show the first step' : shown === n - 1 ? 'Show the last step' : 'Show the next step'} <span class="muted small">(${shown + 1} of ${n})</span></button>${shown < n - 1 ? '<button class="btn ghost" id="we-all" type="button">Show it all</button>' : ''}</div>`}`;
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
  function exercise(root, s, opts) {
    opts = opts || {};
    root.__session = s;                      // for the test suite
    const total = s.items.length;
    let hintsShown = 0, selected = null, phase = 'fresh', lastFeedback = '';
    let workLines = null, workOpen = false;          // the learner's own steps for this question (STEPS)
    let lastSpoken = null;                           // read each question aloud once, when the learner asks for that

    function dots() {
      return `<div class="dots" aria-label="Progress">${s.items.map((it, k) => {
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
        <div class="help">${isNum ? 'Fractions like <b>3/4</b>, mixed numbers like <b>1 1/2</b>, and decimals are all fine.' : (q.help || 'Accents and capital letters do not matter.')}</div>`;
    }
    function hintsArea(q) {
      const shown = q.hints.slice(0, hintsShown);
      const revealed = s.results[s.i] && s.results[s.i].revealed;
      return `<div class="hints" id="hints">${shown.map((hh, k) => `<div class="hint"><div class="hn">${k === q.hints.length - 1 ? 'Last step' : 'Hint ' + (k + 1)}</div>${hh}</div>`).join('')}
        ${revealed && !s.results[s.i].correct ? `<div class="hint"><div class="hn">Answer</div><b>${A.answerText(q)}</b></div>` : ''}</div>`;
    }
    function render() {
      if (E.isDone(s)) return summary();
      const it = E.current(s), q = it.q, r = s.results[s.i];
      const canHint = s.hints && hintsShown < q.hints.length && phase !== 'done';
      const def = A.skills[it.skillId];
      root.innerHTML = `<div class="ex">
        <div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(s.title)}</h1>${dots()}</div>
        <div class="card">
          <div class="q-tools">${it.why ? `<span class="chip why-${it.why}">${{ review: '🔁 Keeping it fresh', mistake: '🩹 Fixing a mistake', new: '✨ New skill' }[it.why]}</span>` : ''}${window.COACH ? COACH.speakBtn(q.prompt + (q.type === 'choice' ? '<p>The choices are:</p>' + q.choices.map((c, k) => `<p>${k + 1}: ${c}</p>`).join('') : ''), 'Read the question aloud') : ''}</div>
          <div class="question">${s.kind !== 'practice' ? `<div class="lead">${def.title}</div>` : ''}${q.prompt}</div>
          <div class="answer">${answerArea(q)}</div>
          ${workEq(it) ? `<details class="steps-work" id="work" ${workOpen ? 'open' : ''}><summary>✍️ Work it out here: Procademy checks each step</summary><div class="steps-box" id="work-box"></div><p class="tiny muted" style="margin:6px 0 0">Each line is checked as you type, by calculation. Checking a finished line (like <b>x = 4</b>) counts as a hint.</p></details>` : ''}
          <div id="feedback" aria-live="polite">${lastFeedback}</div>
          ${hintsArea(q)}
          <div class="ex-foot">
            ${s.hints ? `<button class="btn" id="hint" ${canHint ? '' : 'disabled'}>💡 Hint${canHint ? ` <span class="muted small">(${q.hints.length - hintsShown} left)</span>` : ''}</button>` : ''}
            ${phase !== 'done' ? `<button class="btn ghost" id="giveup">I don’t know</button>` : ''}
            ${s.hints || phase === 'done' ? `<button class="btn ghost" id="ask-tutor"><span aria-hidden="true">✦</span> Ask the tutor</button>` : ''}
            <span class="spacer"></span>
            <span class="muted small">${s.i + 1} / ${total}</span>
            ${phase === 'done' ? `<button class="btn primary" id="next">${s.i + 1 === total ? 'Finish' : 'Next'} →</button>` : `<button class="btn primary" id="check" disabled>Check</button>`}
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
      if (slip) S.noteMistake(slip.kind, E.current(s).skillId);
      const coachNote = slip ? `<div class="coach-note"><span aria-hidden="true">🧭</span><span>${esc(slip.msg)}</span></div>` : '';
      const noticed = slip ? ' Procademy noticed: ' + slip.msg : '';
      if (res.unreadable) { lastFeedback = `<div class="feedback note">🤔 <span>I could not read that as a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.</span></div>`; render(); return; }
      if (res.correct) {
        phase = 'done'; r.done = true;
        lastFeedback = `<div class="feedback good">✅ <span>Correct!${r.hinted ? ' You got there with a hint.' : (r.tries > 1 ? ' Second time lucky.' : '')}</span></div>`;
        if (hintsShown < q.hints.length) lastFeedback += `<details style="margin-top:10px"><summary class="muted small">See the steps</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      } else if (s.hints) {
        lastFeedback = `<div class="feedback bad">❌ <span>Not quite. Try again, or take a hint.</span></div>${coachNote}
          <div class="btn-row" style="margin-top:8px">${explainBtn('Why is that wrong?', 'I answered ' + plain(q.type === 'choice' ? q.choices[selected] : lastInput) + '. Why is that wrong? Help me find my mistake, but don’t tell me the answer yet.' + noticed)}</div>`;
      } else {
        phase = 'done'; E.reveal(s); r.revealed = true;
        lastFeedback = `<div class="feedback bad">❌ <span>Not quite. The answer is <b>${A.answerText(q)}</b>.</span></div>${coachNote}
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
      if (hintsShown === q.hints.length) { E.reveal(s); phase = 'done'; lastFeedback = `<div class="feedback note">💡 <span>That was the last step. Read it through, then move on: this one will come back in Review.</span></div>`; }
      render();
    }
    function doGiveUp() {
      const q = E.current(s).q;
      E.reveal(s); phase = 'done'; hintsShown = s.hints ? q.hints.length : 0;
      lastFeedback = `<div class="feedback note">💡 <span>No problem. The answer is <b>${A.answerText(q)}</b>${s.hints ? ', and the steps are below' : ''}. It will come back in Review.</span></div>` +
        (s.hints ? '' : `<details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`);
      render();
    }
    function doNext() {
      E.next(s);
      hintsShown = 0; selected = null; phase = 'fresh'; lastFeedback = ''; lastInput = null; workLines = null; workOpen = false;
      render();
      window.scrollTo(0, 0);
    }
    function summary() {
      const f = E.finish(s);
      if (opts.onFinish) { try { opts.onFinish(s, f); } catch (e) { console.error(e); } }
      tutorCtx(null);
      if (window.APP) window.APP.refreshStats();
      const ratio = f.total ? f.right / f.total : 0;
      // the same questions for a friend: practice sets and CPM lesson sets have a seed that rebuilds them
      const vsInfo = s.kind === 'practice' ? { k: 'p', id: s.skillId, seed: s.seed, score: f.right, total: f.total }
        : s.kind === 'mix' && s.cpm && s.cpm.lesson ? { k: 'l', book: s.cpm.book, lesson: s.cpm.lesson, seed: s.seed, score: f.right, total: f.total } : null;
      const head = ratio === 1 ? 'Perfect!' : ratio >= 0.7 ? 'Nice work!' : ratio >= 0.4 ? 'Good effort.' : 'Keep going.';
      const changes = f.changes.map(ch => `<span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.skills[ch.skillId].title}: ${A.LEVELS[ch.from]} → <b>${A.LEVELS[ch.to]}</b></span>`).join('');
      let nextBtn = '';
      if (s.kind === 'practice') { const nx = nextSkill(s.skillId); if (nx) nextBtn = `<a class="btn" href="${skillHref(nx)}">Next skill: ${A.skills[nx].title} →</a>`; }
      if (opts.next) nextBtn = `<a class="btn" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;
      root.innerHTML = `<div class="ex"><div class="card summary">
        <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(s.title)}</div>
        <h1 style="margin-top:6px">${head}</h1>
        <div class="score">${f.right} / ${f.total}</div>
        <div class="what">${f.right === f.total ? 'Every question right, first try, no hints.' : `${plural(f.right, 'question')} right first try without a hint.${s.kind === 'practice' && ratio < 1 ? ' Get all ' + f.total + ' to reach Proficient.' : ''}`}</div>
        ${changes ? `<div class="changes">${changes}</div>` : (s.kind !== 'review' ? `<p class="muted" style="margin-top:14px">No level changes this time.</p>` : '')}
        <div class="chip" style="font-size:1rem">⚡ +${fmt(f.pts)} energy points</div>
        <div class="btn-row">
          ${opts.again ? `<button class="btn primary" id="again">${opts.againLabel || 'Practice again'}</button>` : ''}
          ${nextBtn}
          <a class="btn" href="${opts.back || '#/'}">${esc(opts.backLabel || 'Back')}</a>
        </div>${opts.summaryExtra ? opts.summaryExtra(s, f) : ''}${vsInfo && window.CHALLENGE ? CHALLENGE.button(vsInfo, opts.challengeLabel) : ''}</div></div>`;
      if (window.CHALLENGE) CHALLENGE.wire(root);
      const again = root.querySelector('#again');
      if (again) again.addEventListener('click', () => opts.again());
    }
    if (root.__onKey) root.removeEventListener('keydown', root.__onKey);   // one player per element: drop the last session's keys
    root.__onKey = onKey;
    root.addEventListener('keydown', onKey);
    function onKey(ev) {
      if (!root.isConnected) { root.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const next = root.querySelector('#next'), check = root.querySelector('#check');
        if (next) { ev.preventDefault(); next.click(); }
        else if (check && !check.disabled && document.activeElement && document.activeElement.id !== 'giveup' && document.activeElement.id !== 'hint') { ev.preventDefault(); check.click(); }
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
    const start = () => exercise(root, E.start('unit-test', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Take it again' });
    start();
  }
  function challenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const start = () => exercise(root, E.start('course-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Take it again' });
    start();
  }
  function masteryChallenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    if (!E.masteryPool(c).length) { root.innerHTML = `<div class="card empty">Nothing to level up yet. Practise a few skills first.<div class="btn-row" style="justify-content:center"><a class="btn" href="${courseHref(c)}">Back to ${esc(c.title)}</a></div></div>`; return; }
    const start = () => { if (!E.masteryPool(c).length) return masteryChallenge(root, cid); exercise(root, E.start('mastery-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Another round' }); };
    start();
  }
  /** today's practice: skills due for a refresher, mistakes to fix and new skills, mixed together */
  function daily(root) {
    const plan = E.dailyPlan();
    if (!plan.total) {
      root.innerHTML = `<h1>Today’s practice</h1><div class="card empty"><p>Your daily practice builds itself from what you are learning. Save a course (or your class’s CPM book and lesson), or practise any skill, and it will be ready here.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/courses">Find a course</a></div></div>`;
      return;
    }
    const start = () => { let s; try { s = E.start('daily'); } catch (e) { return daily(root); } exercise(root, s, { back: '#/', backLabel: 'Home', again: start, againLabel: 'Another round' }); };
    start();
  }
  /** what is new since this learner last looked (dismissed for good with Got it) */
  const NEWS = 'n6';
  function newsCard() {
    if (S.get().profile.seenNews === NEWS) return '';
    const items = [['#/leap', '🐸', 'Leap: a number-line puzzle game'], ['#/shapes', '📐', 'Shapes: area, volume, nets and angles'], ['#/percent', '💲', 'Percents and money: sales, tips, interest'], ['#/calc', '🧮', 'A calculator that keeps fractions exact'], ['#/numbers', '🌳', 'Number explorer: factor trees, GCF and LCM'], ['#/data', '📊', 'Data and statistics: box plots and more'], ['#/tools', '🧰', 'Every tool on one page'], ['#/tiles', '🟩', 'Algebra tiles: equation and comparison mats'], ['#/chance', '🎲', 'Probability simulator'], ['#/setup', '🧩', 'Word problems → equations'], ['#/courses', '👀', 'A worked example on every skill'], ['#/settings', '🔤', 'Easier-to-read text and read-aloud'], ['#/words', '📖', 'Math words and flashcards'], ['#/sprint', '⚡', 'Speed sprints'], ['#/steps', '✍️', 'Check my steps'], ['#/graph', '📈', 'Graphing calculator'], ['#/cpm', '📅', 'CPM test prep'], ['#/profile', '🦉', 'Your profile, for each learner'], ['#/profile', '🔗', 'Move to another computer'], ['#/progress', '🏅', 'Badges and a daily goal'], ['#/progress', '📄', 'A report for a parent'], ['#/courses', '🖨', 'Printable worksheets'], ['#/tutor', '✦', 'The tutor draws graphs']];
    return `<div class="card news" id="news"><div class="row between"><h2 style="margin:0">New in Procademy</h2><button class="btn sm ghost" id="news-x" type="button">Got it</button></div>
      <div class="news-items">${items.map(([href, icon, t]) => `<a class="chip-btn" href="${href}"><span aria-hidden="true">${icon}</span> ${t}</a>`).join('')}</div></div>`;
  }
  /** every tool: [key, href, icon, name, line] */
  function toolList() {
    const sp = window.SPRINT ? SPRINT.DECKS.map(d => SPRINT.deckState(d.id).best).reduce((a, b) => Math.max(a, b), 0) : 0;
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const prepHref = S.get().profile.prep ? `#/prep/${S.get().profile.prep.book}/${S.get().profile.prep.ch}` : f ? `#/prep/${f.book.id}/${f.chapter.n}` : '#/cpm';
    return [
      ['calc', '#/calc', '🧮', 'Calculator', 'Fractions stay exact, every answer four ways, step by step.'],
      ['graph', '#/graph', '📈', 'Graphing calculator', 'Equations, inequalities, shapes and sliders.'],
      ['numbers', '#/numbers', '🌳', 'Number explorer', 'Primes, factor trees, divisibility, GCF and LCM.'],
      ['data', '#/data', '📊', 'Data and statistics', 'Mean, median, IQR, MAD, box plots and histograms.'],
      ['shapes', '#/shapes', '📐', 'Shapes and space', 'Area, perimeter, volume, surface area, nets and angles, drawn to scale.'],
      ['percent', '#/percent', '💲', 'Percents and money', 'Percent problems, sales, tips, markups and interest on a percent ruler.'],
      ['chance', '#/chance', '🎲', 'Probability simulator', 'Spinners, dice, coins and marbles, run 1,000 times.'],
      ['tiles', '#/tiles', '🟩', 'Algebra tiles', 'CPM’s equation mat and comparison mat, with legal moves.'],
      ['steps', '#/steps', '✍️', 'Check my steps', 'Write your working; every line is checked exactly.'],
      ['setup', '#/setup', '🧩', 'Word problems', 'Turn a story into an equation, then solve it. Every step is checked.'],
      ['sprint', '#/sprint', '⚡', 'Speed sprints', sp ? `One-minute rounds of math facts. Your best: ${sp}.` : 'One-minute rounds of math facts, against the clock.'],
      ['words', '#/words', '📖', 'Math words', window.VOCAB && VOCAB.known() ? `${VOCAB.known()} words known. Flashcards with spaced review.` : 'Every math word in plain words, with flashcards.'],
      ['leap', '#/leap', '🐸', 'Leap', leapLine()],
      ['prep', prepHref, '📅', 'Test prep', f ? `A plan for your ${esc(f.book.short)} chapter ${f.chapter.n} test.` : 'A day-by-day plan for a CPM chapter test.'],
    ];
  }
  function leapLine() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); } catch (e) { st = null; }
    return st && st.level > 1 ? `A number-line puzzle game. You’re on level ${st.level}.` : 'A number-line puzzle game: get the frog to the flag.';
  }
  const toolCard = ([, href, icon, t, sub]) => `<a class="card tool" href="${href}"><span class="tool-icon" aria-hidden="true">${icon}</span><span><b>${t}</b><span class="small muted">${sub}</span></span></a>`;
  /** Home's tools */
  function toolsRow() {
    return `<div class="section-title"><h2>Tools</h2><a href="#/tools" class="small">All tools →</a></div><div class="grid tools">${toolList().map(toolCard).join('')}</div>`;
  }
  /** the Tools page (#/tools), in groups */
  function tools(root) {
    const by = Object.fromEntries(toolList().map(t => [t[0], t]));
    const groups = [['Calculators', ['calc', 'graph', 'percent']], ['Shapes, numbers, data and chance', ['shapes', 'numbers', 'data', 'chance']], ['Equations', ['tiles', 'steps', 'setup']], ['Practice and play', ['leap', 'sprint', 'words', 'prep']]];
    root.innerHTML = `<h1>Tools</h1><p class="muted" style="margin-top:-4px">Hands-on tools for working things out, seeing how they work, and practising.</p>
      ${groups.map(([g, keys]) => `<div class="section-title"><h2>${g}</h2></div><div class="grid tools">${keys.map(k => toolCard(by[k])).join('')}</div>`).join('')}`;
    tutorCtx(null);
  }
  /** the Home card for today's practice */
  function dailyCard() {
    const plan = E.dailyPlan();
    if (!plan.total) return '';
    const done = (S.get().days[S.today()] || {}).daily;
    const parts = [plan.due.length && `🔁 ${plural(plan.due.length, 'skill')} to keep fresh`, plan.missed.length && `🩹 ${plural(plan.missed.length, 'mistake')} to fix`, plan.fresh.length && `✨ ${plural(plan.fresh.length, 'new skill')}`].filter(Boolean);
    return `<div class="card daily-card${done ? ' done' : ''}">
      <div class="daily-main"><div><h2>${done ? '✅ Today’s practice is done' : 'Today’s practice'}</h2>
        <p class="muted small">${plural(plan.total, 'question')} · about ${Math.max(3, Math.round(plan.total * 0.7))} minutes · ${parts.join(' · ')}</p></div>
        <a class="btn primary" href="#/daily">${done ? 'Another round' : 'Start'}</a></div>
      <p class="tiny muted" style="margin:8px 0 0">Spaced review brings each skill back just before it would be forgotten, so what you learn stays learned.</p></div>`;
  }
  function review(root) {
    const missed = S.get().missed.filter(m => A.skills[m.skill]);
    if (!missed.length) { root.innerHTML = `<h1>Review</h1><div class="card empty">Nothing to review. Every question you missed has been put right. 🎉<div class="btn-row" style="justify-content:center"><a class="btn" href="#/">Home</a></div></div>`; return; }
    const start = () => { if (!S.get().missed.length) return review(root); exercise(root, E.start('review'), { back: '#/progress', backLabel: 'Progress', again: start, againLabel: 'Keep reviewing' }); };
    start();
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
    const kinds = { practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'CPM practice', review: 'Review', daily: 'Today’s practice', 'chapter-test': 'Practice test', sprint: 'Speed sprint', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles' };
    const COACH_TIPS = () => (window.COACH ? COACH.TIPS : {});
    root.innerHTML = `
      <div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">Progress</h1><a class="btn sm" href="#/report">📄 Report for a parent or teacher</a></div>
      <div class="tiles" style="margin-top:12px">
        <div class="tile"><div class="big">🔥 ${st.days}</div><div class="label">day streak</div></div>
        <div class="tile"><div class="big">⚡ ${fmt(s.points)}</div><div class="label">energy points</div></div>
        <div class="tile"><div class="big">${fmt(totalQ)}</div><div class="label">questions answered</div></div>
        <div class="tile"><div class="big">${totalQ ? Math.round(totalRight / totalQ * 100) : 0}%</div><div class="label">right first try</div></div>
        <div class="tile"><div class="big">${activeDays}</div><div class="label">days practised</div></div>
      </div>
      <div class="section-title"><h2>Activity</h2><span class="muted small">last 26 weeks</span></div>
      <div class="card"><div class="heat" aria-label="Questions answered per day">${cells}</div></div>
      <div class="section-title"><h2>Mastery</h2></div>
      <div class="card">${legend(levels)}<div style="margin-top:10px">${mbar(allIds)}</div>
        <table class="plain" style="margin-top:14px"><thead><tr><th>Course</th><th>Mastery</th><th class="small">★ / P / F / A</th></tr></thead><tbody>
        ${A.courses.map(c => { const ids = A.courseSkills(c), m = E.mastery(ids); return `<tr><td><a href="${courseHref(c)}">${c.icon || ''} ${esc(c.title)}</a></td><td style="width:40%"><div class="row"><div class="pbar" style="flex:1" ${courseVar(c)}><span style="width:${m.pct}%"></span></div><b class="small">${m.pct}%</b></div></td><td class="small muted">${m.counts[4]} / ${m.counts[3]} / ${m.counts[2]} / ${m.counts[1]}</td></tr>`; }).join('')}
        </tbody></table></div>
      ${(() => {
        const due = E.dueSkills();
        return `<div class="section-title"><h2>Keep fresh</h2><a href="#/daily">Today’s practice →</a></div>
          <div class="card">${due.length ? `<p class="muted small" style="margin:0 0 8px">${plural(due.length, 'skill')} due for a quick refresher. Each one comes back later and later as you keep getting it right.</p><ul class="skills">${due.slice(0, 8).map(id => skillRow(id, { where: (A.whereIs(id) || { course: { title: '' } }).course.title + (S.skill(id).due ? ' · due ' + S.skill(id).due : '') })).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing due. Skills you practise come back here when it is time for a refresher.</p>'}</div>`;
      })()}
      ${(() => {
        const ms = Object.entries(s.mistakes || {}).filter(([k, m]) => m.n && (COACH_TIPS()[k])).sort((a, b) => b[1].n - a[1].n);
        if (!ms.length) return '';
        const total = ms.reduce((a, [, m]) => a + m.n, 0);
        const names = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation' };
        return `<div class="section-title"><h2>Your mistake patterns</h2></div>
          <div class="card"><p class="muted small" style="margin:0 0 10px">What the coach noticed in your wrong answers. Knowing your usual slip is half of fixing it.</p>
          <ul class="patterns">${ms.slice(0, 6).map(([k, m]) => { const top = Object.entries(m.skills || {}).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter(id => A.skills[id] && A.whereIs(id))[0]; return `<li><div class="row between"><b>${names[k] || k}</b><span class="muted small">${plural(m.n, 'time')}</span></div><div class="pbar"><span style="width:${Math.round(m.n / total * 100)}%"></span></div><p class="small" style="margin:6px 0 0">${esc(COACH_TIPS()[k])}${top ? ` Most often in <a href="${skillHref(top)}">${A.skills[top].title}</a>.` : ''}</p></li>`; }).join('')}</ul></div>`;
      })()}
      ${window.BADGES ? BADGES.shelf() : ''}
      <div class="section-title"><h2>Mistakes to review</h2></div>
      <div class="card">${missed.length ? `<div class="row between"><span>${plural(missed.length, 'question')} you missed, rebuilt exactly as asked. Get one right and it comes off the list.</span><a class="btn primary sm" href="#/review">Review now</a></div>` : '<p class="muted" style="margin:0">Nothing waiting. Missed questions will collect here.</p>'}</div>
      <div class="section-title"><h2>Recent activity</h2></div>
      <div class="card">${s.log.length ? `<ul class="log">${s.log.slice(0, 25).map(e => {
        const what = e.title ? esc(e.title) : e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(e.course, e.unit) ? A.unitById(e.course, e.unit).title : e.course && A.courseById(e.course) ? A.courseById(e.course).title : '';
        return `<li><span class="when">${ago(e.t)}</span><span><b>${kinds[e.kind] || e.kind}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${(e.changes || []).map(ch => ` <span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.LEVELS[ch.to]}</span>`).join('')}</span><span class="pts">+${e.pts}</span></li>`; }).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing yet. Your practice will show up here.</p>'}</div>`;
  }

  /* ---------- settings ---------- */
  function settings(root) {
    const p = S.get().profile;
    const skillCount = Object.keys(A.skills).length;
    root.innerHTML = `
      <h1>Settings</h1>
      <div class="card"><h2>You</h2>
        <div class="field"><label for="name">Your name</label><input id="name" type="text" value="${esc(p.name)}" placeholder="Optional" autocomplete="off"><div class="help">Used in the greeting. It stays on this device.</div></div>
        <div class="field"><label for="theme">Colours</label><select id="theme"><option value="system">Match my device</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
        <div class="field"><label for="goal">Daily goal</label><select id="goal">${[10, 20, 30, 50].map(n => `<option value="${n}" ${Number(p.goal || 20) === n ? 'selected' : ''}>${n} questions a day</option>`).join('')}</select><div class="help">Shown as a ring on Home. Every kind of practice counts, speed sprints too.</div></div>
        <div class="field"><label class="check-row"><input type="checkbox" id="easy-read" ${p.easyRead ? 'checked' : ''}> Easier-to-read text</label><div class="help">A clearer typeface with more space between letters, words and lines.</div></div>
        ${window.COACH && COACH.canSpeak() ? `<div class="field"><label class="check-row"><input type="checkbox" id="auto-read" ${p.autoRead ? 'checked' : ''}> Read each practice question aloud</label><div class="help">Uses this device’s own voice. The 🔊 button reads any question again.</div></div>` : ''}
        <div class="field"><label for="size">Text size</label><select id="size"><option value="normal">Normal</option><option value="large">Large</option><option value="xlarge">Extra large</option></select></div>
      </div>
      <div class="card"><h2>Your progress</h2>
        <p class="muted">Everything is saved in this browser. To move to another device, or to keep a copy safe, save a file here and load it there.</p>
        <div class="btn-row"><button class="btn primary" id="export">Save a copy</button><label class="btn">Load a copy <input id="import" type="file" accept="application/json,.json" class="visually-hidden"></label></div>
        ${window.MOVE ? MOVE.box() : ''}
      </div>
      <div class="card" id="offline-card"><h2>Use Procademy without the internet</h2>
        ${window.PROCADEMY_OFFLINE ? `<p class="muted">This is Procademy’s offline file (build ${esc(window.PROCADEMY_OFFLINE.build)}). Every course, practice set, test and drawing works here with no internet. The AI tutor, pictures and reading attached photos and PDFs work when there is an internet connection.</p>
          <p class="muted">Progress made in this file is saved in this browser, separately from the website. To carry it across, use <b>Save a copy</b> above in one and <b>Load a copy</b> in the other. For the newest version, download the file again from the website’s settings.</p>`
        : `<p class="muted"><b>On a computer:</b> download Procademy as one file. Save it anywhere, even on a USB stick, and open it with a double-click: every course, practice set, test and drawing works with no internet. The AI tutor, pictures and reading attached photos need the internet.</p>
          <div class="btn-row"><a class="btn primary" href="procademy-offline.html" download="procademy-offline.html">Download the offline file</a></div>
          <p class="muted" style="margin-top:10px"><b>On a phone or tablet:</b> open this website once while online, then add it to the home screen (Safari: Share, then Add to Home Screen; Chrome: ⋮, then Add to Home screen or Install app). It then opens and works without the internet.</p>
          <p class="tiny muted">Progress in the offline file is kept separately from the website: move it with Save a copy and Load a copy above.</p>`}
      </div>
      <div class="card"><h2>Start over</h2><p class="muted">Erases every level, point and streak on this device. The copy you saved, if any, is not touched.</p><button class="btn danger" id="reset">Erase everything on this device</button></div>
      <div class="card"><h2>About</h2><p class="muted">${A.courses.length} courses, ${skillCount} skills. Every question is generated on this device from a seed, so a missed question can always be asked again exactly as it was. Your progress never leaves this device. Only what you ask the tutor is sent, to a free AI service, unless you switch it to run on this device in its settings. <a href="https://github.com/priyaanh/procademy">Source on GitHub</a>.</p></div>`;
    if (window.MOVE) MOVE.wire(root);
    root.querySelector('#theme').value = p.theme || 'system';
    root.querySelector('#size').value = p.textSize || 'normal';
    root.querySelector('#name').addEventListener('input', ev => { S.setProfile({ name: ev.target.value.slice(0, 40) }); window.APP.applyPrefs(); });
    root.querySelector('#theme').addEventListener('change', ev => { S.setProfile({ theme: ev.target.value }); window.APP.applyPrefs(); });
    root.querySelector('#size').addEventListener('change', ev => { S.setProfile({ textSize: ev.target.value }); window.APP.applyPrefs(); });
    root.querySelector('#easy-read').addEventListener('change', ev => { S.setProfile({ easyRead: ev.target.checked }); window.APP.applyPrefs(); });
    const ar = root.querySelector('#auto-read'); if (ar) ar.addEventListener('change', ev => { S.setProfile({ autoRead: ev.target.checked }); toast(ev.target.checked ? 'Questions will be read aloud' : 'Read-aloud off'); });
    root.querySelector('#goal').addEventListener('change', ev => { S.setProfile({ goal: Number(ev.target.value) }); toast('Daily goal: ' + ev.target.value + ' questions'); });
    root.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `procademy-backup-${S.today()}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Saved a copy');
    });
    root.querySelector('#import').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { S.importJSON(String(rd.result)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Loaded your copy'); } catch (e) { toast(e.message || 'Could not read that file'); } };
      rd.readAsText(f);
    });
    root.querySelector('#reset').addEventListener('click', () => {
      if (!confirm('Erase every level, point and streak on this device?')) return;
      S.reset(); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Erased');
    });
  }

  /* ---------- search ---------- */
  function search(root, q) {
    q = (q || '').trim();
    const words = A.normText(q).split(' ').filter(Boolean);
    const hit = text => { const t = A.normText(text); return words.length && words.every(w => t.includes(w)); };
    const skills = Object.keys(A.skills).filter(sid => { const w = A.whereIs(sid); return w && (hit(A.skills[sid].title) || hit(A.skills[sid].title + ' ' + w.unit.title + ' ' + w.course.title)); }).slice(0, 40);
    const courses = A.courses.filter(c => hit(c.title) || hit(c.blurb || ''));
    const units = A.courses.flatMap(c => c.units.filter(u => hit(u.title)).map(u => ({ c, u }))).slice(0, 12);
    root.innerHTML = `<h1>Search</h1><p class="muted">${q ? `Results for “${esc(q)}”` : 'Type in the box above to search skills, units and courses.'}</p>
      ${courses.length ? `<div class="section-title"><h2>Courses</h2></div><div class="grid">${courses.map(courseCard).join('')}</div>` : ''}
      ${units.length ? `<div class="section-title"><h2>Units</h2></div><div class="card">${units.map(x => `<div class="search-hit"><span aria-hidden="true">📂</span><div><a href="${unitHref(x.c, x.u)}"><b>${esc(x.u.title)}</b></a><div class="where">${esc(x.c.title)}</div></div></div>`).join('')}</div>` : ''}
      ${q && window.CPMVIEWS ? CPMVIEWS.searchHits(q) : ''}
      ${skills.length ? `<div class="section-title"><h2>Skills</h2></div><div class="card"><ul class="skills">${skills.map(sid => { const w = A.whereIs(sid); return skillRow(sid, { where: w.course.title + ' · ' + w.unit.title }); }).join('')}</ul></div>` : ''}
      ${q && !courses.length && !units.length && !skills.length && !(window.CPMVIEWS && CPMVIEWS.searchHits(q)) ? `<div class="card empty">Nothing matched. Try a shorter word, like “fraction” or “slope”.</div>` : ''}`;
    bindExplain(root);
  }

  function notFound(root) {
    root.innerHTML = `<div class="card empty"><h1>Not here</h1><p>That page does not exist, or the skill has moved.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a><a class="btn" href="#/courses">Courses</a></div></div>`;
  }

  window.VIEWS = { home, tools, courses, course, unit, skill, practice, unitTest, challenge, masteryChallenge, review, daily, progress, settings, search, notFound, stats, brand, toast,
    _h: { toolLinks, esc, plain, lvl, mbar, legend, skillRow, exercise, plural, fmt, courseVar, skillHref, practiceHref, explainBtn, bindExplain, tutorCtx, saveBtn, wireSaving, isSaved, dragHandle, wireReorder, exercise, unitHref, courseHref } };
})();
