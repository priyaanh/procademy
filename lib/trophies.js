/* The trophy room and what goes with it.
   - #/trophies: the learner's avatar and banner, their badges with the closest ones to earn next, drawn stickers
     for milestones, this week's summary, a streak calendar that shows the days a streak saver kept, certificates
     ready to print, and a picture of it all to send to a parent (drawn on this device; nothing is uploaded).
   - #/certificate/unit/<course>/<unit> and #/certificate/course/<course>: a printable certificate, once every skill
     in it is Proficient or Mastered.
   - #/map: a treasure map of a course, one island for each unit, that fills in as its skills are mastered.
   - #/league: a family league for the week. There is no server: everyone's numbers for the week travel in a link,
     like the progress links. Opening a member's link adds their numbers here; sending yours back shares yours, with
     everyone else's you know about. When a new week starts, last week's table is kept and a reminder says so.
   The league lives in the learner's profile (profile.league), checked field by field whenever a link is read. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, D = window.DRAW, H = V._h, esc = H.esc;
  const icon = (n, s) => (window.ICONS ? ICONS.svg(n, s) : '');
  const plural = H.plural;
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  const strip = t => A.stripTags(String(t || '')).trim();
  const name = () => (S.get().profile.name || '').trim();

  /* ---------- streaks: the longest ever, and the calendar ---------- */
  function longest(st) {
    st = st || S.get();
    const used = (st.savers && st.savers.used) || {}, days = Object.keys(st.days).filter(d => st.days[d].q).sort();
    if (!days.length) return 0;
    const r = st.profile.restDay, rest = d => r != null && r !== '' && !isNaN(Number(r)) && new Date(d + 'T12:00').getDay() === Number(r);
    let best = 0, run = 0, d = days[0];
    const last = S.today();
    while (d <= last) {
      if (st.days[d] && st.days[d].q) run++;
      else if (!used[d] && !rest(d) && d !== last) { best = Math.max(best, run); run = 0; }          // a saver, a rest day or today still open don't break it
      d = S.dayShift(d, 1);
    }
    return Math.max(best, run);
  }
  /** a month of days: practiced, kept by a streak saver, a rest day, or nothing */
  function calendar(ym) {
    const st = S.get(), used = (st.savers && st.savers.used) || {}, rest = st.profile.restDay;
    const [y, m] = ym.split('-').map(Number), first = new Date(y, m - 1, 1), lead = (first.getDay() + 6) % 7, n = new Date(y, m, 0).getDate();
    const cells = [];
    for (let k = 0; k < lead; k++) cells.push('<td></td>');
    for (let d = 1; d <= n; d++) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, day = st.days[iso], did = !!(day && day.q), kept = !did && !!used[iso];
      const isRest = !did && !kept && rest != null && rest !== '' && new Date(iso + 'T12:00').getDay() === Number(rest) && iso <= S.today();
      const cls = did ? 'did' : kept ? 'kept' : isRest ? 'rest' : '';
      const say = did ? `practiced, ${plural(day.q, 'question')}` : kept ? 'kept by a streak saver' : isRest ? 'your rest day' : iso > S.today() ? 'still to come' : 'no practice';
      cells.push(`<td class="${cls}${iso === S.today() ? ' today' : ''}"><span aria-label="${esc(new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' }))}: ${say}">${d}</span></td>`);
    }
    while (cells.length % 7) cells.push('<td></td>');
    const rows = []; for (let k = 0; k < cells.length; k += 7) rows.push(`<tr>${cells.slice(k, k + 7).join('')}</tr>`);
    return `<table class="sc-cal"><caption class="visually-hidden">${esc(first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }))}</caption><thead><tr>${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x, k) => `<th scope="col"><abbr title="${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][k]}">${x}</abbr></th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }
  const monthName = ym => new Date(ym + '-15T12:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const shiftMonth = (ym, k) => { const [y, m] = ym.split('-').map(Number), d = new Date(y, m - 1 + k, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

  /* ---------- stickers: drawn marks for milestones (no pictures of things, just shapes in the one blue) ---------- */
  const puzzleTotal = () => { if (!window.PUZZLES) return 0; return PUZZLES.solvedDays().reduce((a, d) => a + Object.keys(PUZZLES.doneOn(d)).filter(k => k !== 'three').length, 0); };
  const kindCount = k => { if (!window.PUZZLES) return 0; const o = PUZZLES.load(); return Object.values(o.done).filter(d => d && d[k]).length; };
  const seasonDone = sea => !!window.PUZZLES && PUZZLES.solvedDays().some(d => PUZZLES.season(d) === sea);
  const leapLevel = () => { try { const v = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); return v ? Number(v.level) || 1 : 1; } catch (e) { return 1; } };
  const raceWins = () => { try { const o = JSON.parse(localStorage.getItem('procademy.sprints.v1') || '{}'); return Object.values(o).reduce((a, d) => a + ((d && d.race && d.race.hard) || 0), 0); } catch (e) { return 0; } };
  const totalQ = st => Object.values(st.days).reduce((a, d) => a + (d.q || 0), 0);
  const mastered = st => Object.values(st.skills).filter(x => x.level >= 4).length;
  const unitsDone = () => finished().filter(f => f.kind === 'unit').length;
  const STICKERS = [
    ['q50', 'circle', '50', '50 questions', 'Answer 50 questions.', st => totalQ(st) >= 50],
    ['q500', 'hex', '500', '500 questions', 'Answer 500 questions.', st => totalQ(st) >= 500],
    ['q2000', 'burst', '2K', '2,000 questions', 'Answer 2,000 questions.', st => totalQ(st) >= 2000],
    ['run5', 'circle', '5', 'Five days running', 'Practice 5 days in a row.', st => longest(st) >= 5],
    ['run14', 'shield', '14', 'Two weeks running', 'Practice 14 days in a row.', st => longest(st) >= 14],
    ['run50', 'burst', '50', 'Fifty days running', 'Practice 50 days in a row.', st => longest(st) >= 50],
    ['m1', 'star', '1', 'First mastered skill', 'Master a skill.', st => mastered(st) >= 1],
    ['m25', 'shield', '25', 'Twenty-five mastered', 'Master 25 skills.', st => mastered(st) >= 25],
    ['unit', 'ribbon', 'U', 'A whole unit', 'Reach Proficient in every skill of a unit.', () => unitsDone() >= 1],
    ['pz1', 'diamond', '1', 'First daily puzzle', 'Solve a puzzle of the day.', () => puzzleTotal() >= 1],
    ['pz30', 'hex', '30', 'Thirty puzzles', 'Solve 30 puzzles of the day.', () => puzzleTotal() >= 30],
    ['cages5', 'square', '5', 'Cage builder', 'Solve 5 Cages puzzles.', () => kindCount('cages') >= 5],
    ['cross5', 'square', '5', 'Cross-number fan', 'Solve 5 cross-numbers.', () => kindCount('cross') >= 5],
    ['leap20', 'diamond', '20', 'Leap level 20', 'Reach level 20 of Leap.', () => leapLevel() > 20],
    ['race', 'star', '1', 'Quickest runner', 'Beat the computer at its fastest speed.', () => raceWins() >= 1],
    ['fall', 'season', 'leaf', 'Fall puzzler', 'Solve a puzzle of the day in fall.', () => seasonDone('fall')],
    ['winter', 'season', 'snow', 'Winter puzzler', 'Solve a puzzle of the day in winter.', () => seasonDone('winter')],
    ['spring', 'season', 'flower', 'Spring puzzler', 'Solve a puzzle of the day in spring.', () => seasonDone('spring')],
    ['summer', 'season', 'sun', 'Summer puzzler', 'Solve a puzzle of the day in summer.', () => seasonDone('summer')],
  ].map(([id, shape, mark, nm, how, test]) => ({ id, shape, mark, name: nm, how, test }));
  const SHAPES = {
    circle: '<circle cx="40" cy="40" r="32"/>',
    hex: '<path d="M40 7l28.6 16.5v33L40 73 11.4 56.5v-33z"/>',
    burst: '<path d="' + Array.from({ length: 24 }, (_, k) => { const a = k * Math.PI / 12, r = k % 2 ? 28 : 35; return (k ? 'L' : 'M') + (40 + r * Math.sin(a)).toFixed(1) + ' ' + (40 - r * Math.cos(a)).toFixed(1); }).join('') + 'z"/>',
    shield: '<path d="M40 7l28 9v20c0 18-12 30-28 37C24 66 12 54 12 36V16z"/>',
    star: '<path d="' + Array.from({ length: 10 }, (_, k) => { const a = k * Math.PI / 5, r = k % 2 ? 16 : 35; return (k ? 'L' : 'M') + (40 + r * Math.sin(a)).toFixed(1) + ' ' + (42 - r * Math.cos(a)).toFixed(1); }).join('') + 'z"/>',
    ribbon: '<path d="M26 46l-8 26 12-6 7 10 5-24M54 46l8 26-12-6-7 10-5-24"/><circle cx="40" cy="34" r="24"/>',
    diamond: '<path d="M40 6l32 34-32 34L8 40z"/>',
    square: '<rect x="10" y="10" width="60" height="60" rx="14"/>',
    season: '<circle cx="40" cy="40" r="32"/>',
  };
  /** a sticker's drawing: its shape with a white rim, and its number or seasonal picture */
  function stickerSvg(s, got, size) {
    const sz = size || 64, art = s.shape === 'season' && window.PUZZLES ? PUZZLES.seasonArt(s.id, 40).replace('<svg ', '<svg x="20" y="20" ') : '';
    return `<svg viewBox="0 0 80 80" width="${sz}" height="${sz}" class="stk-svg${got ? ' got' : ''}" aria-hidden="true" focusable="false"><g class="stk-shape">${SHAPES[s.shape]}</g>${art || `<text x="40" y="${s.shape === 'star' ? 49 : 47}" text-anchor="middle" class="stk-mark${s.mark.length > 2 ? ' sm' : ''}">${esc(s.mark)}</text>`}</svg>`;
  }
  function stickers() { const st = S.get(); return STICKERS.map(s => { let got = false; try { got = !!s.test(st); } catch (e) { got = false; } return Object.assign({ got }, s); }); }

  /* ---------- certificates: units and courses finished (every skill Proficient or Mastered) ---------- */
  const doneSkills = ids => ids.filter(id => S.skill(id).level >= 3).length;
  /** the courses worth looking at: saved ones first, then any practiced */
  function myCourses() {
    const st = S.get(), saved = st.profile.enrolled.filter(id => !id.startsWith('cpm:')).map(id => A.courseById(id)).filter(Boolean);
    const practiced = A.courses.filter(c => !saved.includes(c) && A.courseSkills(c).some(id => S.skill(id).level > 0));
    return saved.concat(practiced);
  }
  /** everything finished: [{ kind: 'unit' | 'course', course, unit, href }] */
  function finished() {
    const out = [];
    myCourses().forEach(c => {
      const units = c.units.filter(u => u.skills.length && doneSkills(u.skills) === u.skills.length);
      units.forEach(u => out.push({ kind: 'unit', course: c, unit: u, href: `#/certificate/unit/${c.id}/${u.id}` }));
      if (units.length === c.units.filter(u => u.skills.length).length && units.length) out.push({ kind: 'course', course: c, href: `#/certificate/course/${c.id}` });
    });
    return out;
  }
  /** the unit closest to finished, for "what's next" */
  function closestUnit() {
    let best = null;
    myCourses().forEach(c => c.units.forEach(u => { const n = doneSkills(u.skills), left = u.skills.length - n; if (left > 0 && n > 0 && (!best || left < best.left)) best = { c, u, n, left }; }));
    return best;
  }
  const BORDER = '<svg class="cert-border" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden="true"><rect x="12" y="12" width="776" height="536" rx="18" class="cb-1"/><rect x="26" y="26" width="748" height="508" rx="12" class="cb-2"/>' + [[40, 40, 1, 1], [760, 40, -1, 1], [40, 520, 1, -1], [760, 520, -1, -1]].map(([x, y, a, b]) => `<path d="M${x} ${y + 40 * b}V${y}H${x + 40 * a}M${x + 10 * a} ${y + 26 * b}V${y + 10 * b}H${x + 26 * a}" class="cb-3"/>`).join('') + '</svg>';
  function certificate(root, kind, cid, uid) {
    const c = A.courseById(cid), u = kind === 'unit' ? A.unitById(cid, uid) : null;
    if (!c || (kind === 'unit' && !u)) return V.notFound(root);
    const ids = u ? u.skills : A.courseSkills(c), n = doneSkills(ids);
    const what = u ? strip(u.title) : strip(c.title);
    if (n < ids.length) {
      const left = ids.filter(id => S.skill(id).level < 3);
      root.innerHTML = `<div class="card empty cert-wait"><h1>Not quite finished</h1><p class="muted">The certificate for <b>${esc(what)}</b> is ready once every skill is Proficient or Mastered: ${n} of ${ids.length} so far.</p>
        <ul class="cert-left">${left.slice(0, 6).map(id => `<li><a href="${H.skillHref(id)}">${A.skills[id].title}</a></li>`).join('')}${left.length > 6 ? `<li class="muted">and ${left.length - 6} more</li>` : ''}</ul>
        <div class="btn-row" style="justify-content:center"><a class="btn primary" href="${u ? H.unitHref(c, u) : H.courseHref(c)}">Go to ${u ? 'the unit' : 'the course'}</a><a class="btn" href="#/trophies">Trophy room</a></div></div>`;
      return;
    }
    const nm = name(), when = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    root.innerHTML = `<div class="cert-page">
      <div class="cert-tools no-print"><label class="field cert-name"><span class="label">Name on the certificate</span><input id="cert-name" type="text" maxlength="40" value="${esc(nm)}" placeholder="Your name" autocomplete="off"></label>
        <div class="btn-row"><button type="button" class="btn primary" id="cert-print">${icon('bookmark', 18)} Print it</button><a class="btn" href="#/trophies">Trophy room</a></div></div>
      <article class="cert" aria-label="Certificate">${BORDER}
        <div class="cert-in"><p class="cert-kicker">Certificate of completion</p>
          <p class="cert-small">This certifies that</p>
          <h1 class="cert-who" id="cert-who">${esc(nm || 'A Procademy learner')}</h1>
          <p class="cert-small">has completed ${u ? 'the unit' : 'the course'}</p>
          <h2 class="cert-what">${esc(what)}</h2>
          ${u ? `<p class="cert-small">in ${esc(strip(c.title))}</p>` : ''}
          <p class="cert-detail">${plural(ids.length, 'skill')} at Proficient or Mastered${ids.filter(id => S.skill(id).level >= 4).length ? `, ${ids.filter(id => S.skill(id).level >= 4).length} of them Mastered` : ''}</p>
          <div class="cert-foot"><span><b>${esc(when)}</b><small>Date</small></span><svg viewBox="0 0 24 24" width="54" height="54" class="cert-medal" aria-hidden="true">${(window.BADGES && BADGES.MEDAL || '').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg><span><b>Procademy</b><small>Practice, one skill at a time</small></span></div></div></article></div>`;
    const inp = root.querySelector('#cert-name');
    inp.addEventListener('input', () => { root.querySelector('#cert-who').textContent = inp.value.trim() || 'A Procademy learner'; });
    root.querySelector('#cert-print').addEventListener('click', () => window.print());
    H.tutorCtx(null);
  }

  /* ---------- the treasure map ---------- */
  function map(root, cid) {
    const list = myCourses(), p = S.get().profile;
    const c = A.courseById(cid) || list[0] || A.courseById(p.grade != null ? ['math-k', 'math-1', 'math-2', 'math-3', 'math-4', 'math-5', 'math-6', 'math-7', 'math-8', 'algebra-1', 'geometry', 'algebra-2', 'precalculus'][p.grade] : 'math-7') || A.courses[0];
    const units = c.units.filter(u => u.skills.length);
    const info = units.map(u => { const m = E.mastery(u.skills); return { u, pct: m.pct, done: doneSkills(u.skills) === u.skills.length, n: doneSkills(u.skills) }; });
    const all = info.every(x => x.done), doneN = info.filter(x => x.done).length;
    root.innerHTML = `<div class="tm-page">
      <div class="card pz-head"><div><h1>Treasure map</h1><p class="muted small">${esc(strip(c.title))}: each island is a unit. Its ring fills in as you master its skills, and a finished unit is marked with an X. Finish them all to open the treasure.</p></div>
        ${list.length > 1 ? `<label class="small tm-pick">Course <select id="tm-course">${list.map(x => `<option value="${x.id}"${x === c ? ' selected' : ''}>${esc(strip(x.title))}</option>`).join('')}</select></label>` : ''}</div>
      <div class="card tm-card"><p class="small tm-sum"><b>${doneN} of ${units.length}</b> units finished · ${E.mastery(A.courseSkills(c)).pct}% of the course mastered</p>
        <div class="tm-wide">${mapSvg(c, info, all, false)}</div><div class="tm-narrow">${mapSvg(c, info, all, true)}</div></div>
      <details class="card tm-list"><summary>The units as a list</summary><ol>${info.map(x => `<li><a href="${H.unitHref(c, x.u)}">${esc(strip(x.u.title))}</a><span class="pbar" role="img" aria-label="${x.pct}% mastered"><span style="width:${x.pct}%"></span></span><span class="small muted">${x.n} of ${x.u.skills.length} Proficient</span></li>`).join('')}</ol></details></div>`;
    const sel = root.querySelector('#tm-course');
    if (sel) sel.addEventListener('change', () => { location.hash = '#/map/' + sel.value; });
    root.__map = { course: c.id, units: info.map(x => ({ id: x.u.id, pct: x.pct, done: x.done })), all };
    H.tutorCtx(null);
  }
  /** the map drawn for a wide screen (four islands a row) or a narrow one (two a row) */
  function mapSvg(c, info, all, narrow) {
    const units = info.map(x => x.u);
    const cols = narrow ? 2 : 4, W = narrow ? 420 : 1000, gapX = W / cols, rowH = narrow ? 170 : 190, top = 70;
    const pos = units.map((u, k) => { const r = Math.floor(k / cols), i = k % cols, x = (r % 2 ? cols - 1 - i : i) * gapX + gapX / 2; return { x, y: top + r * rowH + (i % 2 ? 26 : 0) }; });
    const end = (() => { const k = units.length, r = Math.floor(k / cols), i = k % cols; return { x: (r % 2 ? cols - 1 - i : i) * gapX + gapX / 2, y: top + r * rowH + (i % 2 ? 26 : 0) }; })();
    const Hh = end.y + 90;
    const pts = [{ x: 30, y: top - 40 }].concat(pos, [end]);
    let path = '';
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + (k % 2 ? -24 : 24);
      const solid = k === 1 ? info[0] && info[0].pct > 0 : info[k - 2] && info[k - 2].done;
      path += `<path d="M${a.x.toFixed(0)} ${a.y.toFixed(0)} Q${mx.toFixed(0)} ${my.toFixed(0)} ${b.x.toFixed(0)} ${b.y.toFixed(0)}" class="tm-path${solid ? ' walked' : ''}"/>`;
    }
    const R = narrow ? 34 : 38, C = 2 * Math.PI * (R - 6);
    const stops = info.map((x, k) => { const { x: cx, y: cy } = pos[k], short = strip(x.u.title).replace(/^(.{0,22})(.*)$/, (m0, a, b) => a + (b ? '…' : ''));
      return `<a href="${H.unitHref(c, x.u)}" class="tm-stop${x.done ? ' done' : x.pct ? ' started' : ''}" aria-label="Unit ${k + 1}: ${esc(strip(x.u.title))}, ${x.pct}% mastered${x.done ? ', finished' : ''}">
        <ellipse cx="${cx}" cy="${cy + 6}" rx="${R + 16}" ry="${R - 6}" class="tm-isle"/>
        <circle cx="${cx}" cy="${cy}" r="${R - 6}" class="tm-ring"/>
        <circle cx="${cx}" cy="${cy}" r="${R - 6}" class="tm-fill" stroke-dasharray="${(C * x.pct / 100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>
        ${x.done ? `<path d="M${cx - 11} ${cy - 11}l22 22M${cx + 11} ${cy - 11}l-22 22" class="tm-x"/>` : `<text x="${cx}" y="${cy + 6}" text-anchor="middle" class="tm-n">${k + 1}</text>`}
        <text x="${cx}" y="${cy + R + 22}" text-anchor="middle" class="tm-label">${esc(short)}</text></a>`; }).join('');
    const chest = `<g class="tm-chest${all ? ' open' : ''}" transform="translate(${end.x - 30} ${end.y - 30})"><rect x="0" y="22" width="60" height="36" rx="5" class="tm-box"/>${all ? '<path d="M2 22 L8 2 H52 L58 22" class="tm-lid"/><path d="M30 -10v-10M14 -4l-6-8M46 -4l6-8" class="tm-shine"/>' : '<path d="M0 24 Q30 2 60 24" class="tm-lid"/>'}<rect x="25" y="30" width="10" height="12" rx="2" class="tm-lock"/></g><text x="${end.x}" y="${end.y + 52}" text-anchor="middle" class="tm-label">${all ? 'Treasure found' : 'The treasure'}</text>`;
    return `<svg viewBox="0 0 ${W} ${Hh}" class="tm-svg" role="group" aria-label="Treasure map of ${esc(strip(c.title))}"><rect x="0" y="0" width="${W}" height="${Hh}" rx="18" class="tm-sea"/>
      <g class="tm-waves" aria-hidden="true">${Array.from({ length: Math.floor(Hh / 70) }, (_, k) => `<path d="M${(k * 137) % (W - 80) + 20} ${30 + k * 70} q8 -6 16 0 t16 0" />`).join('')}</g>
      ${path}<g class="tm-start" aria-hidden="true"><path d="M30 ${top - 40}v-26" /><path d="M30 ${top - 66}l16 6-16 6z" class="tm-flag"/></g>${stops}${chest}</svg>`;
  }

  /* ---------- the family league ---------- */
  const SEED = /^[a-z0-9]{6,16}$/;
  const clean = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n) : '');
  const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);
  const newId = () => Math.random().toString(36).slice(2, 12).padEnd(8, '0');
  const ISO = /^\d{4}-\d\d-\d\d$/;
  const DECKS = () => (window.SPRINT ? SPRINT.DECKS.map(d => d.id) : []);
  /** a row (one member's week), checked */
  function checkRow(r) {
    if (!r || typeof r !== 'object' || !SEED.test(String(r.m || '')) || !ISO.test(String(r.w || ''))) return null;
    const out = { m: r.m, n: clean(r.n, 24) || 'A player', w: r.w, p: int(r.p, 1e6), d: int(r.d, 7), q: int(r.q, 1e5), z: int(r.z, 100), t: Number(r.t) };
    if ([out.p, out.d, out.q, out.z].includes(null) || !(out.t > Date.UTC(2026, 0, 1) && out.t < Date.now() + 864e5)) return null;
    const sp = {}; if (r.s && typeof r.s === 'object') DECKS().forEach(k => { const v = int(r.s[k], 999); if (v) sp[k] = v; });
    out.s = sp;
    return out;
  }
  /** a league link's contents, checked: { id, name, rows } or null */
  function readLink(code) {
    let o; try { o = JSON.parse(D.decode(code) || 'null'); } catch (e) { return null; }
    if (!o || o.v !== 1 || o.k !== 'lg' || !SEED.test(String(o.id || ''))) return null;
    const nm = clean(o.name, 40); if (!nm) return null;
    const rows = (Array.isArray(o.rows) ? o.rows : []).slice(0, 12).map(checkRow).filter(Boolean);
    if (!rows.length) return null;
    return { id: o.id, name: nm, rows, from: SEED.test(String(o.from || '')) ? o.from : rows[0].m };
  }
  const league = () => { const l = S.get().profile.league; return l && SEED.test(String(l.id || '')) && SEED.test(String(l.me || '')) ? l : null; };
  /** my own row for this week, worked out from what I did */
  function myRow(l) {
    const st = S.get(), mon = mondayOf(S.today()), w = { p: 0, d: 0, q: 0, z: 0 };
    for (let k = 0; k < 7; k++) { const iso = S.dayShift(mon, k), d = st.days[iso]; if (d && d.q) { w.d++; w.q += d.q; } if (d) w.p += d.pts || 0; if (window.PUZZLES) w.z += Object.keys(PUZZLES.doneOn(iso)).length; }
    const sp = {}; if (window.SPRINT) SPRINT.DECKS.forEach(dk => { const b = SPRINT.deckState(dk.id).best; if (b) sp[dk.id] = b; });
    return { m: l.me, n: clean(l.myName || name() || 'Me', 24) || 'Me', w: mon, p: Math.min(1e6, w.p), d: w.d, q: Math.min(1e5, w.q), z: Math.min(100, w.z), s: sp, t: Date.now() };
  }
  /** a new week: last week's table is kept (with its winner) and this week starts empty; returns true if it changed */
  function rollWeek() {
    const l = league(); if (!l) return false;
    const mon = mondayOf(S.today());
    if (l.week === mon) return false;
    const rows = Object.values(l.rows || {}).filter(r => r.w === l.week);
    const last = l.week ? { week: l.week, rows: rows.sort((a, b) => b.p - a.p).slice(0, 12) } : l.last || null;
    S.setProfile({ league: Object.assign({}, l, { week: mon, rows: {}, last, remind: !!l.week }) });
    return true;
  }
  /** take in a league link's rows: a newer row for a member replaces an older one */
  function merge(info) {
    const l = league(); if (!l || l.id !== info.id) return 0;
    const rows = Object.assign({}, l.rows || {}), mon = mondayOf(S.today());
    let n = 0;
    info.rows.forEach(r => { if (r.m === l.me || r.w !== mon) return; const had = rows[r.m]; if (!had || had.t < r.t) { rows[r.m] = r; n++; } });
    S.setProfile({ league: Object.assign({}, l, { rows }) });
    return n;
  }
  /** this week's table: everyone known, with me worked out fresh, by points */
  function table() {
    const l = league(); if (!l) return [];
    const mon = mondayOf(S.today()), mine = myRow(l);
    return Object.values(l.rows || {}).filter(r => r.w === mon && r.m !== l.me).concat([mine]).sort((a, b) => b.p - a.p || b.d - a.d || a.n.localeCompare(b.n));
  }
  function linkFor() {
    const l = league();
    const rows = table().map(r => ({ m: r.m, n: r.n, w: r.w, p: r.p, d: r.d, q: r.q, z: r.z, s: r.s, t: r.t }));
    const base = window.MOVE ? MOVE.siteBase() : location.href.split('#')[0];
    return base + '#/league/' + D.encode(JSON.stringify({ v: 1, k: 'lg', id: l.id, name: l.name, from: l.me, rows }));
  }
  /** the best sprint scores of everyone in the league (for the speed-sprint standings) */
  function sprintRows() { const l = league(); if (!l) return []; return table().filter(r => r.m !== l.me).map(r => ({ name: r.n, s: r.s || {} })); }
  const rowsHtml = (rows, me) => `<div class="lg-table-wrap"><table class="lg-table"><thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Points</th><th scope="col">Days</th><th scope="col">Questions</th><th scope="col">Puzzles</th></tr></thead>
    <tbody>${rows.map((r, k) => `<tr class="${r.m === me ? 'me' : ''}"><td>${k + 1}</td><th scope="row">${esc(r.n)}${r.m === me ? ' <span class="chip">You</span>' : ''}</th><td><b>${r.p.toLocaleString()}</b></td><td>${r.d}</td><td>${r.q.toLocaleString()}</td><td>${r.z}</td></tr>`).join('')}</tbody></table></div>`;
  function leaguePage(root, code) {
    rollWeek();
    const l = league(), info = code ? readLink(code) : null;
    if (code && !info) { root.innerHTML = '<div class="card empty"><h1>This league link doesn’t work</h1><p class="muted">It may have been cut short when it was copied. Ask for a fresh link.</p><a class="btn primary" href="#/league">Family league</a></div>'; return; }
    if (info && l && l.id === info.id) {
      const n = merge(info);
      V.toast(n ? `League updated: ${plural(n, 'new score')}.` : 'You already have these scores.');
      history.replaceState(null, '', '#/league');
      return leaguePage(root, null);
    }
    if (info) {
      const mon = mondayOf(S.today()), rows = info.rows.filter(r => r.w === mon).sort((a, b) => b.p - a.p);
      root.innerHTML = `<div class="lg-page"><div class="card lg-join"><h1>Join ${esc(info.name)}?</h1>
        <p class="muted">A family league: everyone’s points, days and puzzles for the week, shared by sending links. Nothing goes to a server.</p>
        ${l ? `<p class="small">You’re in <b>${esc(l.name)}</b> now. Joining this one leaves it.</p>` : ''}
        <form id="lg-join" class="lg-form" novalidate><label class="field"><span class="label">Your name in the league</span><input id="lg-me" type="text" maxlength="24" autocomplete="off" value="${esc(name())}" placeholder="Your first name"></label>
          <div class="btn-row"><button class="btn primary" type="submit">Join the league</button><a class="btn ghost" href="#/">Not now</a></div></form></div>
        ${rows.length ? `<div class="section-title"><h2>This week so far</h2></div><div class="card">${rowsHtml(rows, null)}</div>` : '<p class="muted small">Nobody has scores for this week in the link yet.</p>'}</div>`;
      root.querySelector('#lg-join').addEventListener('submit', ev => {
        ev.preventDefault();
        const me = clean(root.querySelector('#lg-me').value, 24) || name() || 'Me';
        S.setProfile({ league: { id: info.id, name: info.name, me: newId(), myName: me, week: mondayOf(S.today()), rows: {}, joined: Date.now() } });
        merge(info);
        if (window.BADGES) BADGES.flag('league');
        history.replaceState(null, '', '#/league'); leaguePage(root, null);
        V.toast(`You joined ${info.name}. Send your link back so they see your scores.`);
      });
      return;
    }
    if (!l) {
      root.innerHTML = `<div class="lg-page"><div class="card lg-start"><h1>Family league</h1>
        <p class="muted">A friendly weekly table for your family: points, days practiced and puzzles solved, from Monday to Sunday. There’s no server: each person sends a link, and the table fills in as links arrive.</p>
        <form id="lg-new" class="lg-form" novalidate><label class="field"><span class="label">League name</span><input id="lg-name" type="text" maxlength="40" autocomplete="off" placeholder="The ${esc(name() ? name() + ' family' : 'Family')}"></label>
          <label class="field"><span class="label">Your name in it</span><input id="lg-me" type="text" maxlength="24" autocomplete="off" value="${esc(name())}" placeholder="Your first name"></label>
          <div class="btn-row"><button class="btn primary" type="submit">Start a league</button></div></form>
        <p class="small muted">Got a league link from someone? Open it, and it asks whether to join.</p></div></div>`;
      root.querySelector('#lg-new').addEventListener('submit', ev => {
        ev.preventDefault();
        const nm = clean(root.querySelector('#lg-name').value, 40) || (name() ? `The ${name()} family` : 'Family league'), me = clean(root.querySelector('#lg-me').value, 24) || name() || 'Me';
        S.setProfile({ league: { id: newId(), name: nm, me: newId(), myName: me, week: mondayOf(S.today()), rows: {}, joined: Date.now() } });
        if (window.BADGES) BADGES.flag('league');
        leaguePage(root, null);
      });
      return;
    }
    const rows = table(), last = l.last && l.last.rows && l.last.rows.length ? l.last : null, mon = mondayOf(S.today());
    const sun = new Date(S.dayShift(mon, 6) + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    root.innerHTML = `<div class="lg-page">
      ${l.remind ? `<div class="card lg-remind" role="status">${icon('calendar', 22)}<div><b>A new league week has started.</b> ${last ? `Last week, ${esc(last.rows[0].n)} came first with ${last.rows[0].p.toLocaleString()} points.` : ''} Send your new link so everyone sees this week’s table.</div><button type="button" class="btn sm ghost" id="lg-seen">Got it</button></div>` : ''}
      <div class="card lg-head"><div><h1>${esc(l.name)}</h1><p class="muted small">This week: Monday to ${esc(sun)}. Points come from practice and puzzles; the table updates when someone’s link arrives.</p></div>
        <div class="btn-row"><button type="button" class="btn primary sm" id="lg-copy">Copy my league link</button>${navigator.share ? '<button type="button" class="btn sm" id="lg-share">Share…</button>' : ''}</div><div id="lg-qr" class="lg-qr"></div></div>
      <div class="lg-cols"><section class="card"><h2>This week</h2>${rowsHtml(rows, l.me)}
          ${rows.length < 2 ? '<p class="small muted" style="margin:10px 0 0">Only you so far. Copy your link and send it to your family: when they open it and send theirs back, they appear here.</p>' : ''}</section>
        <aside class="card"><h2>How it works</h2><ul class="nm-facts small">
          <li>Copy your league link and send it to everyone in the league. It carries this week’s table, so it passes on everyone you know about.</li>
          <li>When someone’s link arrives, open it here: their newest numbers replace their older ones.</li>
          <li>On Monday a new week starts. Last week’s table is kept below.</li>
          <li>The link holds only names in the league and this week’s numbers.</li></ul>
          <details class="lg-leave"><summary class="small">Leave the league</summary><p class="small muted">Your progress stays. The league disappears from this device.</p><button type="button" class="btn sm danger" id="lg-leave">Leave ${esc(l.name)}</button></details></aside></div>
      ${last ? `<details class="card lg-last"><summary><b>Last week</b> <span class="small muted">· from ${esc(new Date(last.week + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))}</span></summary>${rowsHtml(last.rows, l.me)}</details>` : ''}</div>`;
    const copy = () => { const url = linkFor(); TROPHIES._last = url; try { navigator.clipboard.writeText(url).then(() => V.toast('League link copied.'), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); } };
    root.querySelector('#lg-copy').addEventListener('click', copy);
    const sh = root.querySelector('#lg-share'); if (sh) sh.addEventListener('click', () => navigator.share({ title: l.name, text: 'This week’s family league', url: linkFor() }).catch(() => {}));
    if (window.MOVE && MOVE.qrButton) root.querySelector('.lg-head .btn-row').appendChild(MOVE.qrButton(root.querySelector('#lg-qr'), linkFor));
    const seen = root.querySelector('#lg-seen'); if (seen) seen.addEventListener('click', () => { S.setProfile({ league: Object.assign({}, league(), { remind: false }) }); root.querySelector('.lg-remind').remove(); });
    root.querySelector('#lg-leave').addEventListener('click', () => { S.setProfile({ league: null }); V.toast('You left the league.'); leaguePage(root, null); });
    root.__league = { id: l.id, rows: rows.map(r => ({ n: r.n, p: r.p, m: r.m })), last };
    H.tutorCtx(null);
  }
  /** once a session: when a league's week has turned over, say so */
  function remindLater() {
    setTimeout(() => {
      try { if (rollWeek() && !S.quietNow() && window.VIEWS) V.toast('A new family league week has started. Open Family league to send your new link.'); } catch (e) { /* fine */ }
    }, 2500);
  }

  /* ---------- a picture to send a parent, drawn on this device ---------- */
  function picture() {
    const st = S.get(), cv = document.createElement('canvas'), W = 1200, Hh = 760, dpr = 1;
    cv.width = W * dpr; cv.height = Hh * dpr;
    const g = cv.getContext('2d'); if (!g) return null;
    const blue = '#1865f2', ink = '#1d2433', soft = '#e8f0fe', muted = '#5f6672';
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, Hh);
    const grad = g.createLinearGradient(0, 0, W, 0); grad.addColorStop(0, soft); grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad; g.fillRect(0, 0, W, 210);
    g.fillStyle = blue; g.fillRect(0, 0, 14, Hh);
    const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
    g.fillStyle = blue; g.font = font(700, 28); g.fillText('Procademy', 64, 72);
    g.fillStyle = ink; g.font = font(800, 58); g.fillText(`${name() || 'My'}${name() ? '’s' : ''} progress`, 64, 150);
    g.fillStyle = muted; g.font = font(500, 26); g.fillText(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 64, 192);
    const badges = window.BADGES ? BADGES.all().filter(b => b.at).sort((a, b) => b.at - a.at) : [];
    const stats = [[String(S.streak().days), 'days in a row'], [totalQ(st).toLocaleString(), 'questions answered'], [String(mastered(st)), 'skills mastered'], [String(badges.length), 'badges earned']];
    stats.forEach(([n, l], k) => {
      const x = 64 + k * 272, y = 250;
      g.fillStyle = soft; roundRect(g, x, y, 248, 150, 22); g.fill();
      g.fillStyle = blue; g.font = font(800, 56); g.fillText(n, x + 24, y + 80);
      g.fillStyle = ink; g.font = font(600, 24); g.fillText(l, x + 24, y + 122);
    });
    g.fillStyle = ink; g.font = font(700, 30); g.fillText(badges.length ? 'Latest badges' : 'Badges to come', 64, 470);
    (badges.length ? badges.slice(0, 4) : (window.BADGES ? BADGES.nearest(4) : [])).forEach((b, k) => {
      const x = 64 + k * 272, y = 500;
      g.strokeStyle = blue; g.lineWidth = 3; g.fillStyle = '#ffffff'; roundRect(g, x, y, 248, 160, 22); g.fill(); g.stroke();
      g.beginPath(); g.arc(x + 52, y + 56, 26, 0, Math.PI * 2); g.fillStyle = b.at ? '#b7791f' : soft; g.fill();
      g.beginPath(); g.arc(x + 52, y + 56, 12, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill();
      g.fillStyle = ink; g.font = font(700, 22); wrap(g, b.name, x + 24, y + 112, 210, 26, 2);
    });
    g.fillStyle = muted; g.font = font(500, 20); g.fillText('Made on Procademy, on this device.', 64, Hh - 30);
    return cv;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function wrap(g, text, x, y, max, lh, lines) {
    const words = String(text).split(' '); let line = '', n = 0;
    for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, y + n * lh); line = w; n++; if (n >= lines) return; } else line = t; }
    if (line && n < lines) g.fillText(line, x, y + n * lh);
  }

  /* ---------- the trophy room ---------- */
  function page(root) {
    if (window.BADGES) BADGES.check();          // anything earned since the last check shows here at once
    const st = S.get(), p = st.profile, list = window.BADGES ? BADGES.all() : [], got = list.filter(b => b.at).sort((a, b) => b.at - a.at);
    const near = window.BADGES ? BADGES.nearest(3) : [], stk = stickers(), stkN = stk.filter(s => s.got).length, fin = finished(), close = closestUnit();
    let ym = S.today().slice(0, 7);
    const firstYm = (Object.keys(st.days).filter(d => st.days[d].q).sort()[0] || S.today()).slice(0, 7);
    root.innerHTML = `<div class="tr-page">
      <div class="card tr-head${window.ACCOUNT && ACCOUNT.bannerClass ? ' ' + ACCOUNT.bannerClass() : ''}">
        ${window.ACCOUNT ? ACCOUNT.avatarHtml(p, true) : ''}
        <div class="tr-who"><h1>${esc(name() ? `${name()}’s trophy room` : 'Trophy room')}</h1>
          <p class="muted small">${got.length} of ${list.length} badges · ${stkN} of ${stk.length} stickers · longest streak ${plural(longest(st), 'day')} · ${st.points.toLocaleString()} points</p>
          <div class="btn-row"><a class="btn sm" href="#/profile">${icon('person', 18)} Avatar and banner</a><a class="btn sm" href="#/league">${icon('trophy', 18)} Family league</a><a class="btn sm" href="#/map">${icon('globe', 18)} Treasure map</a></div></div></div>
      <div class="tr-cols">
        <div class="tr-col">
          <section class="card" aria-labelledby="tr-badges"><div class="row between"><h2 id="tr-badges">Badges</h2><a class="small" href="#/progress" id="tr-all">Every badge →</a></div>
            ${got.length ? `<ul class="tr-medals">${got.slice(0, 12).map(b => `<li title="${esc(b.how)}"><span class="tr-medal" aria-hidden="true">${BADGES.MEDAL.replace('width="28" height="28"', 'width="44" height="44"')}</span><b>${esc(b.name)}</b><span class="tiny muted">${new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`).join('')}</ul>${got.length > 12 ? `<p class="small muted">And ${got.length - 12} more on Progress.</p>` : ''}` : '<p class="muted">Your first badge comes with your first answer.</p>'}
            ${near.length ? `<h3 class="tr-sub">Closest to earning</h3><ul class="tr-near">${near.map(b => `<li><span><b>${esc(b.name)}</b><span class="small muted">${esc(b.how)}</span></span><span class="pbar" role="img" aria-label="${b.prog.now} of ${b.prog.need}"><span style="width:${b.prog.pct}%"></span></span><span class="small muted tr-n">${b.prog.now.toLocaleString()} of ${b.prog.need.toLocaleString()}</span></li>`).join('')}</ul>` : ''}</section>
          <section class="card" aria-labelledby="tr-stk"><div class="row between"><h2 id="tr-stk">Stickers</h2><span class="small muted">${stkN} of ${stk.length} collected</span></div>
            <ul class="tr-stickers">${stk.map(s => `<li class="${s.got ? 'got' : ''}" title="${esc(s.how)}">${stickerSvg(s, s.got)}<b>${esc(s.name)}</b><span class="tiny muted">${s.got ? 'Collected' : esc(s.how)}</span></li>`).join('')}</ul></section>
        </div>
        <div class="tr-col">
          <section class="card" id="week" aria-labelledby="tr-week"><h2 id="tr-week">This week</h2>${window.BADGES ? BADGES.weekSummary() : ''}</section>
          <section class="card" aria-labelledby="tr-cal"><div class="row between tr-cal-head"><h2 id="tr-cal">Streak calendar</h2>
              <div class="tr-cal-nav"><button type="button" class="btn sm ghost" id="cal-prev" aria-label="Previous month">‹</button><span class="small" id="cal-m"></span><button type="button" class="btn sm ghost" id="cal-next" aria-label="Next month">›</button></div></div>
            <p class="small muted" style="margin:0 0 8px">Now ${plural(S.streak().days, 'day')} in a row; your longest is ${plural(longest(st), 'day')}.</p>
            <div id="cal-box"></div>
            <ul class="sc-key small"><li><i class="did"></i>Practiced</li><li><i class="kept"></i>Kept by a streak saver</li><li><i class="rest"></i>Rest day</li></ul></section>
          <section class="card" aria-labelledby="tr-cert"><h2 id="tr-cert">Certificates</h2>
            ${fin.length ? `<ul class="tr-certs">${fin.slice(0, 8).map(f => `<li>${icon('bookmark', 18)}<span><a href="${f.href}">${esc(f.kind === 'course' ? strip(f.course.title) : strip(f.unit.title))}</a><span class="tiny muted">${f.kind === 'course' ? 'Whole course' : esc(strip(f.course.title))}</span></span></li>`).join('')}</ul>` : '<p class="small muted">Finish a unit (every skill Proficient or Mastered) and its certificate appears here, ready to print.</p>'}
            ${close ? `<p class="small">Closest: <a href="${H.unitHref(close.c, close.u)}">${esc(strip(close.u.title))}</a>, ${plural(close.left, 'skill')} to go.</p>` : ''}</section>
          <section class="card" aria-labelledby="tr-pic"><h2 id="tr-pic">A picture for a parent</h2><p class="small muted">Your streak, questions, mastered skills and latest badges in one picture, made on this device.</p>
            <div class="btn-row"><button type="button" class="btn primary sm" id="pic-make">${icon('image', 18)} Make the picture</button></div><div id="pic-out" class="tr-pic"></div></section>
        </div></div></div>`;
    const drawCal = () => {
      root.querySelector('#cal-box').innerHTML = calendar(ym);
      root.querySelector('#cal-m').textContent = monthName(ym);
      root.querySelector('#cal-prev').disabled = ym <= firstYm;
      root.querySelector('#cal-next').disabled = ym >= S.today().slice(0, 7);
    };
    root.querySelector('#cal-prev').addEventListener('click', () => { ym = shiftMonth(ym, -1); drawCal(); });
    root.querySelector('#cal-next').addEventListener('click', () => { ym = shiftMonth(ym, 1); drawCal(); });
    drawCal();
    root.querySelector('#pic-make').addEventListener('click', () => {
      const cv = picture(), out = root.querySelector('#pic-out');
      if (!cv) { out.textContent = 'This browser can’t draw the picture.'; return; }
      const url = cv.toDataURL('image/png'), file = `procademy-${(name() || 'progress').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${S.today()}.png`;
      out.innerHTML = `<img src="${url}" alt="A summary picture: ${esc(name() || 'your')} progress, with the streak, questions answered, skills mastered and badges"><div class="btn-row"><a class="btn sm primary" download="${esc(file)}" href="${url}">Save the picture</a>${navigator.canShare ? '<button type="button" class="btn sm" id="pic-share">Share…</button>' : ''}</div>`;
      const sh = out.querySelector('#pic-share');
      if (sh) sh.addEventListener('click', () => cv.toBlob(b => { const f = new File([b], file, { type: 'image/png' }); if (navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'My Procademy progress' }).catch(() => {}); else V.toast('This device can’t share pictures. Save it instead.'); }));
      root.__picture = url.length;
    });
    const all = root.querySelector('#tr-all');
    if (all) all.addEventListener('click', () => window.addEventListener('hashchange', () => setTimeout(() => { const b = document.getElementById('badges'); if (b) b.scrollIntoView({ block: 'start' }); }, 30), { once: true }));
    root.__trophies = { badges: got.length, stickers: stk.filter(s => s.got).map(s => s.id), certificates: fin.map(f => f.href), longest: longest(st) };
    H.tutorCtx(null);
  }

  const TROPHIES = { page, certificate, map, league: leaguePage, readLink, rollWeek, merge, table, linkFor, sprintRows, myRow, stickers, STICKERS, stickerSvg, longest, calendar, finished, closestUnit, picture, _last: null };
  window.TROPHIES = TROPHIES;
  remindLater();
})();
