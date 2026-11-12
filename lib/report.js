/* A progress report for a parent or teacher (#/report): a period (the last 7 days, last week, this month,
   last month…) on one printable page — days practiced, questions and how many were right first try, levels
   gained, what was practiced (topic practice and puzzles too), the learner's usual slips, the best time of
   day, tutor use (counts only), mastery by area, when each course should be finished, badges, what is due
   for review, coming tests — and three suggestions for next. Print it, save it as a PDF or a picture, or
   copy it as text for a message. Made on this device from what is saved here; nothing is sent.
   The ways of looking at progress here (areas, months, time of day, forecasts, a skill's growth, goal
   history, topics and puzzles, tutor counts, the weekly recap, the progress picture) are shared with the
   Progress page and Family and class: each takes a learner's saved state, so a parent can see anyone's. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const NAMES = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation' };
  const KINDS = { topic: 'Practice on any topic', practice: 'Practice sets', 'unit-test': 'Unit tests', 'course-challenge': 'Course challenges', 'mastery-challenge': 'Mastery challenges', mix: 'CPM lesson practice', review: 'Reviews', daily: 'Today’s practice', 'chapter-test': 'Practice tests', sprint: 'Speed sprints', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles', placement: 'Starting-point checks' };
  const TESTS = { 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', 'chapter-test': 'Practice test', testout: 'Test-out' };
  const READY = [0, 0.25, 0.6, 0.85, 1];
  const DAY = 864e5;

  /* ---------- small helpers ---------- */
  const isoOf = t => S.today(new Date(t));
  const msOf = iso => new Date(iso + 'T00:00').getTime();
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  const shortDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const longDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  const monthName = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long' });
  const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
  const lvOf = (st, id) => (((st && st.skills) || {})[id] || {}).level || 0;
  /** a learner's own saved things besides progress (tutor chats, puzzles): from storage for the one on screen */
  const ownNow = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const readJSON = raw => { try { const o = JSON.parse(raw || 'null'); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } };

  /** totals from the days between from and to (inclusive) */
  function sumDays(st, from, to) {
    let q = 0, right = 0, min = 0, active = 0, pts = 0;
    Object.keys(st.days || {}).forEach(iso => { if (iso < from || iso > to) return; const d = st.days[iso]; if (!d || !d.q) return; q += d.q; right += d.right || 0; min += S.minutes(d); pts += d.pts || 0; active++; });
    return { q, right, min, active, pts };
  }
  /** skills that went up a level between two moments: [{ id, from, to }] (ids: only these skills) */
  function upsIn(st, since, until, ids) {
    const out = [];
    (st.log || []).slice().reverse().forEach(e => {
      if (!e || e.t < since || e.t >= until) return;
      (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && (!ids || ids.has(ch.skillId))) { const o = out.find(u => u.id === ch.skillId); if (o) o.to = Math.max(o.to, ch.to); else out.push({ id: ch.skillId, from: ch.from, to: ch.to }); } });
    });
    return out;
  }
  /** does a log entry belong to a course (with its skills as a Set)? */
  const entryIn = (e, c, ids) => e.course === c.id || (!!e.skill && ids.has(e.skill)) || (e.changes || []).some(ch => ids.has(ch.skillId));
  /** the courses being learned: saved, or with any progress */
  const coursesOf = st => A.courses.filter(c => ((st.profile || {}).enrolled || []).includes(c.id) || A.courseSkills(c).some(id => lvOf(st, id) > 0));

  /* ---------- areas: every skill sorted into a strand that runs across the grades ---------- */
  const AREAS = [['number', 'Numbers and operations'], ['fractions', 'Fractions and decimals'], ['ratio', 'Ratios, rates and percents'], ['algebra', 'Expressions and equations'], ['functions', 'Functions and graphs'], ['geometry', 'Geometry'], ['measure', 'Measurement and money'], ['data', 'Data and probability'], ['calculus', 'Calculus'], ['logic', 'Logic and coding'], ['other', 'Mixed practice']];
  const AREA_NAME = Object.fromEntries(AREAS);
  const RULES = [
    ['logic', /\b(code|coding|program|algorithm|boolean|truth table|loops?|logic|flowchart|binary)\b/],
    ['number', /\b(prime|gcf|lcm|greatest common|least common|factors and multiples|divisib|place value)/],
    ['data', /venn|probab|statist|\bdata\b|\bmean\b|median|\bmode\b|box plot|histogram|dot plot|scatter|sampl|survey|outcome|combinat|permut|counting principle|standard deviation|distribution|regression|correlation|two-way|frequency|tally|pictograph|bar graph|line plot|expected value|\bodds\b|variabilit|quartile|spread/],
    ['calculus', /derivativ|integra|\blimits?\b|continuity|differenti|riemann|related rates|optimiz|series|taylor|calculus|l.h.pital|accumulat/],
    ['geometry', /angle|triangle|\barea|volume|perimeter|circle|polygon|shape|transformation|pythag|congruen|similar|surface|prism|cylinder|cone|sphere|quadrilateral|parallel|perpendicular|rotation|reflection|translation|dilation|symmetr|solid|\bnets?\b|circumference|radius|diameter|chord|\barcs?\b|proof|\bgeometry\b|segment|\brays?\b|cross.section|rectang|square units|cube|pyramid|tessel/],
    ['functions', /function|graph|slope|linear|coordinate|intercept|exponential|logarithm|\blogs?\b|trig|\bsine|cosine|tangent|polar|vector|matri|sequence|domain|parabola|asymptote|rate of change|ordered pair|quadrant|conic|unit circle|radian|complex number|polynomial/],
    ['measure', /measur|convert|conversion|length|mass|weight|capacity|\btime\b|clock|money|\bcoins?\b|\bdollars?\b|\bcents?\b|elapsed|metric|customary|\binch(es)?\b|\bfeet\b|\bfoot\b|\b(kilo|centi|milli)?met(er|re)s?\b|\b(milli)?lit(er|re)s?\b|\b(kilo)?grams?\b|\bpounds?\b|\bounces?\b|temperature|calendar|budget|payroll|paycheck|bank|credit|loan|insurance|invest|saving/],
    ['ratio', /\bratios?\b|\brates?\b|percent|proportion|scale|discount|\btax|\btips?\b|interest|markup|commission|unit price/],
    ['fractions', /fraction|decimal|mixed number|numerator|denominator|equivalent|reciprocal/],
    ['algebra', /equation|expression|inequalit|variable|solv|factor|quadratic|system|algebra|exponent|radical|simplif|distribut|like terms|literal|binomial|monomial|completing the square|rational/],
    ['number', /number|\badd|subtract|multipl|divi|integer|negative|count|round|estimat|order of operations|square root|cube root|power|\beven\b|\bodd\b|compar|skip|facts?\b|\bsums?\b|difference|product|quotient|regroup|absolute value|scientific notation|irrational|mental math|times tables?|make 10|doubles|digit|arithmetic|operations/],
  ];
  const areaCache = Object.create(null);
  /** the area a skill belongs to: its title decides, then its unit's title */
  function areaOf(sid) {
    if (areaCache[sid]) return areaCache[sid];
    if (!A.skills[sid]) return 'other';
    const w = A.whereIs(sid);
    if (w && w.course.id === 'coding-logic') return (areaCache[sid] = 'logic');
    const t = A.stripTags(A.skills[sid].title).toLowerCase(), u = (w ? w.unit.title : '').toLowerCase();
    const r = RULES.find(([, re]) => re.test(t)) || RULES.find(([, re]) => re.test(u));
    return (areaCache[sid] = r ? r[0] : 'other');
  }
  /** mastery by area over some skills (by default: every skill of the courses being learned, and any skill practiced) */
  function areas(st, ids) {
    if (!ids) { const set = new Set(); coursesOf(st).forEach(c => A.courseSkills(c).forEach(id => set.add(id))); Object.keys(st.skills || {}).forEach(id => { if (A.skills[id] && A.whereIs(id) && lvOf(st, id) > 0) set.add(id); }); ids = [...set]; }
    const by = {};
    ids.forEach(id => { const k = areaOf(id), o = by[k] || (by[k] = { id: k, name: AREA_NAME[k], n: 0, pts: 0, counts: [0, 0, 0, 0, 0] }); const lv = lvOf(st, id); o.n++; o.pts += A.LEVEL_POINTS[lv]; o.counts[lv]++; });
    return AREAS.map(([k]) => by[k]).filter(Boolean).map(o => Object.assign(o, { pct: Math.round(o.pts / o.n), started: o.n - o.counts[0] }));
  }

  /* ---------- this month and last month ---------- */
  function spanStats(st, from, to) {
    const since = msOf(from), until = msOf(S.dayShift(to, 1)), d = sumDays(st, from, to);
    const tests = (st.log || []).filter(e => e && TESTS[e.kind] && e.total && e.t >= since && e.t < until);
    const badges = Object.values(st.badges || {}).filter(t => t >= since && t < until).length;
    return Object.assign(d, { from, to, ups: upsIn(st, since, until).length, tests: tests.length, testPct: tests.length ? Math.round(tests.reduce((a, e) => a + e.right / e.total, 0) / tests.length * 100) : null, badges });
  }
  function months(st) {
    const today = S.today(), first = today.slice(0, 8) + '01', lastTo = S.dayShift(first, -1), lastFrom = lastTo.slice(0, 8) + '01';
    return { now: spanStats(st, first, today), last: spanStats(st, lastFrom, lastTo), nowName: monthName(first), lastName: monthName(lastFrom) };
  }

  /* ---------- the time of day practice goes best ---------- */
  const PARTS = [['morning', 'Morning', 'in the morning', 5, 12], ['afternoon', 'Afternoon', 'in the afternoon', 12, 17], ['evening', 'Evening', 'in the evening', 17, 21], ['night', 'Night', 'at night', 21, 29]];
  const UNSCORED = new Set(['cards']);                // flashcards are rated by the learner, not checked
  function timeOfDay(st, since, until, keep) {
    const out = PARTS.map(([id, name, phrase, from, to]) => ({ id, name, phrase, from, to, sets: 0, q: 0, right: 0 }));
    (st.log || []).forEach(e => {
      if (!e || !e.total || UNSCORED.has(e.kind) || e.t < (since || 0) || (until && e.t >= until) || (keep && !keep(e))) return;
      let h = new Date(e.t).getHours(); if (h < 5) h += 24;
      const p = out.find(x => h >= x.from && h < x.to);
      p.sets++; p.q += e.total; p.right += Math.min(e.right || 0, e.total);
    });
    out.forEach(p => { p.pct = p.q ? pct(p.right, p.q) : null; });
    const enough = out.filter(p => p.q >= 10), q = out.reduce((a, p) => a + p.q, 0), right = out.reduce((a, p) => a + p.right, 0);
    let best = enough.length >= 2 ? enough.slice().sort((a, b) => b.pct - a.pct || b.q - a.q)[0] : null;
    if (best && best.pct <= Math.min(...enough.map(p => p.pct))) best = null;           // all the same: no best time
    const most = out.slice().sort((a, b) => b.q - a.q)[0];
    const others = best ? pct(right - best.right, q - best.q) : null;
    return { parts: out, best, most: most.q ? most : null, others, q };
  }
  const timeSentence = t => (t.best ? `Practice goes best ${t.best.phrase}: ${t.best.pct}% right the first time, against ${t.others}% at other times.`
    : t.most ? `Most practice happens ${t.most.phrase}. With more practice at other times, the best time of day shows here.` : 'No practice yet, so there’s no best time of day.');

  /* ---------- when a course will be finished ---------- */
  function forecast(st, c) {
    const ids = A.courseSkills(c), set = new Set(ids), done = ids.filter(id => lvOf(st, id) >= 3).length, left = ids.length - done;
    const since = Date.now() - 28 * DAY, got = new Set();
    (st.log || []).forEach(e => { if (e && e.t >= since) (e.changes || []).forEach(ch => { if (set.has(ch.skillId) && ch.to >= 3 && ch.from < 3) got.add(ch.skillId); }); });
    const perWeek = got.size / 4, weeks = left && perWeek ? Math.ceil(left / perWeek) : null;
    const now = new Date(), june = `${now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear()}-06-01`;
    const toJune = Math.max(1, Math.round((msOf(june) - Date.now()) / (7 * DAY)));
    return { c, total: ids.length, done, left, perWeek, weeks, date: weeks != null && weeks <= 260 ? S.dayShift(S.today(), weeks * 7) : null, june, needPerWeek: left ? Math.ceil(left / toJune) : 0, pct: pct(done, ids.length) };
  }
  const monthYear = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  function forecastSentence(f) {
    if (!f.left) return `Every skill in ${f.c.title} is Proficient or better. Course finished.`;
    const perMonth = Math.max(1, Math.round(f.perWeek * 4));
    const pace = f.perWeek >= 1 ? `about ${H.plural(Math.round(f.perWeek), 'skill')} a week` : `about ${H.plural(perMonth, 'skill')} a month`;
    const june = `To finish by ${new Date(f.june + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}, about ${H.plural(f.needPerWeek, 'skill')} a week would do it.`;
    if (!f.perWeek) return `No new skill reached Proficient in the last four weeks, so there’s no pace yet. ${june}`;
    return f.date ? `At this pace (${pace}), every skill reaches Proficient around ${monthYear(f.date)}.${f.date > f.june ? ' ' + june : ''}` : `At this pace (${pace}) it would take more than five years. ${june}`;
  }

  /* ---------- a skill's growth over time ---------- */
  function growth(st, sid) {
    const ev = [];
    (st.log || []).slice().reverse().forEach(e => {
      if (!e) return;
      const ch = (e.changes || []).find(x => x.skillId === sid);
      if (e.skill !== sid && !ch) return;
      ev.push({ t: e.t, kind: e.kind, title: e.title, right: e.right, total: e.total, from: ch ? ch.from : null, to: ch ? ch.to : null });
    });
    const sk = (st.skills || {})[sid] || { level: 0, tries: 0, right: 0 };
    return { sid, ev, level: sk.level || 0, tries: sk.tries || 0, right: sk.right || 0 };
  }
  /** the skills with a history, most recently practiced first */
  const grownSkills = st => Object.keys(st.skills || {}).filter(id => A.skills[id] && A.whereIs(id) && (st.skills[id].tries || st.skills[id].level)).sort((a, b) => (st.skills[b].last || 0) - (st.skills[a].last || 0));

  /* ---------- goals: the last weeks against the goals, and when the goals changed ---------- */
  function goalHistory(st, n) {
    const p = st.profile || {}, log = (Array.isArray(p.goalLog) ? p.goalLog : []).filter(x => x && x.t);
    const cur = { goal: Number(p.goal) || 20, week: Number(p.weekGoal) || 5 };
    const at = t => { const before = log.filter(x => x.t <= t); const g = before.length ? before[before.length - 1] : log[0] || cur; return { goal: Number(g.goal) || cur.goal, week: Number(g.week) || cur.week }; };
    const mon = mondayOf(S.today()), rows = [];
    for (let w = (n || 8) - 1; w >= 0; w--) {
      const start = S.dayShift(mon, -7 * w), g = at(msOf(S.dayShift(start, 7)) - 1);
      let days = 0, goalDays = 0, q = 0;
      for (let k = 0; k < 7; k++) { const d = (st.days || {})[S.dayShift(start, k)]; if (d && d.q) { days++; q += d.q; if (d.q >= g.goal) goalDays++; } }
      rows.push({ mon: start, days, goalDays, q, goal: g.goal, week: g.week, met: days >= g.week, now: w === 0 });
    }
    const changes = log.map((x, i) => ({ t: x.t, goal: x.goal, week: x.week, was: i ? log[i - 1] : null })).filter(x => x.was && (x.was.goal !== x.goal || x.was.week !== x.week)).reverse();
    return { rows, cur, changes, since: log.length ? log[0].t : null };
  }

  /* ---------- topic practice and puzzles ---------- */
  function extras(st, since, until, own) {
    const log = (st.log || []).filter(e => e && e.t >= since && e.t < until), get = own || ownNow;
    const of = k => log.filter(e => e.kind === k);
    const topic = of('topic'), sprint = of('sprint'), cards = of('cards');
    const from = isoOf(since), to = isoOf(until - 1);
    let daily = 0, levels = 0;
    ['procademy.leap.v1', 'procademy.balance.v1'].forEach(k => { const o = readJSON(get(k)); if (!o) return; daily += Object.keys(o.daily || {}).filter(d => d >= from && d <= to && o.daily[d]).length; levels += Object.keys(o.stars || {}).filter(l => o.stars[l]).length; });
    const weekly = Object.values((st.profile || {}).weekly || {}).filter(Boolean).length;
    return { topicSets: topic.length, topicQ: topic.reduce((a, e) => a + (e.total || 0), 0), topicRight: topic.reduce((a, e) => a + (e.right || 0), 0), topics: [...new Set(topic.map(e => e.title).filter(Boolean))].slice(0, 4), sprints: sprint.length, cards: cards.length, daily, levels, weekly };
  }
  /** the topics and puzzles as short phrases (the ones with anything in them) */
  const extrasList = x => [x.topicSets && `Practice on a topic: ${H.plural(x.topicSets, 'set')}, ${H.plural(x.topicQ, 'question')}`, x.daily && `Daily puzzles solved: ${x.daily}`, x.sprints && `Speed sprints: ${x.sprints}`, x.cards && `Flashcard rounds: ${x.cards}`, x.levels && `Puzzle levels solved, in all: ${x.levels}`, x.weekly && `Weekly challenges solved, in all: ${x.weekly}`].filter(Boolean);

  /* ---------- the tutor, as counts only (and chat titles, only where a parent was allowed to see them) ---------- */
  function tutorUse(raw, since, until) {
    const o = readJSON(raw), chats = o && Array.isArray(o.chats) ? o.chats.filter(c => c && typeof c === 'object') : [];
    const asked = c => (Array.isArray(c.messages) ? c.messages.filter(m => m && m.role === 'user').length : 0);
    const inP = chats.filter(c => (c.updated || c.created || 0) >= (since || 0) && (c.created || 0) < (until || Infinity) && asked(c));
    const titles = chats.filter(c => c.title && c.title !== 'New chat' && asked(c)).sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 8).map(c => ({ title: String(c.title).replace(/[\u0000-\u001f]/g, '').slice(0, 80), t: c.updated || c.created || 0 }));
    return { chats: inP.length, asked: inP.reduce((a, c) => a + asked(c), 0), all: chats.filter(asked).length, titles };
  }
  const tutorSentence = t => (t.chats ? `${H.plural(t.asked, 'question')} asked in ${H.plural(t.chats, 'tutor chat')}.` : 'No tutor questions in this period.');

  /* ---------- a week, Monday to Sunday: the recap ---------- */
  function week(st, mon) {
    const to = S.dayShift(mon, 6), since = msOf(mon), until = msOf(S.dayShift(mon, 7)), d = sumDays(st, mon, to);
    const prev = sumDays(st, S.dayShift(mon, -7), S.dayShift(mon, -1));
    let best = null;
    for (let k = 0; k < 7; k++) { const iso = S.dayShift(mon, k), x = (st.days || {})[iso]; if (x && x.q && (!best || x.q > best.q)) best = { iso, q: x.q }; }
    const tests = (st.log || []).filter(e => e && TESTS[e.kind] && e.total && e.t >= since && e.t < until).reverse();
    const badges = (window.BADGES ? BADGES.LIST : []).filter(b => (st.badges || {})[b.id] >= since && (st.badges || {})[b.id] < until).map(b => b.name);
    return Object.assign(d, { mon, to, prev, best, ups: upsIn(st, since, until).filter(u => A.whereIs(u.id)), tests, badges, goal: (st.profile || {}).weekGoal || 5 });
  }
  /** the week compared with the one before, in a few words */
  function weekVs(w) {
    if (!w.prev.q && !w.q) return '';
    if (!w.prev.q) return 'More than the week before, which had no practice.';
    const diff = w.q - w.prev.q;
    if (Math.abs(diff) <= Math.max(2, w.prev.q * 0.1)) return `About the same as the week before (${H.plural(w.prev.q, 'question')}).`;
    return diff > 0 ? `${diff} more ${diff === 1 ? 'question' : 'questions'} than the week before.` : `${-diff} fewer ${-diff === 1 ? 'question' : 'questions'} than the week before.`;
  }

  /* ---------- a note on each progress page that the data stays private ---------- */
  const LOCK = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>';
  function privateNote(kind) {
    const p = S.get().profile, acct = window.ACCOUNT && ACCOUNT.user && ACCOUNT.user();
    const where = acct ? 'on this device and in your account' : 'on this device';
    const text = kind === 'family' ? 'Private: everything on this page is kept on this device. Learners here appear by themselves; anyone else appears only after sending you a link, and only a short summary comes with it. Nothing goes to a server.'
      : kind === 'report' ? `Private: made on this device from what is saved here${acct ? ' and in your account' : ''}. Nothing is sent unless you print, copy or share it.`
      : `Private: your progress is saved ${where}, and nobody else sees it. It’s shared only when you send a link or print a report.${p.chatTitlesShared ? ' A parent can see the titles of your tutor chats on Family and class, never what was said.' : ''}${p.limit ? ` A parent set a daily time limit of ${p.limit} minutes.` : ''}`;
    return `<p class="pr-private${kind === 'report' ? ' no-print' : ''}">${LOCK}<span>${text}</span></p>`;
  }

  /* ---------- the progress picture: a PNG to keep or share ---------- */
  function picture(st) {
    const W = 1200, Ht = 675, c = document.createElement('canvas'); c.width = W; c.height = Ht;
    const g = c.getContext('2d');
    if (!g) return c;
    const font = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
    const f = (w, px) => `${w} ${px}px ${font}`;
    const BLUE = '#1865f2', DEEP = '#0f3f9c', INK = '#1d2433', MUTED = '#5f6672', SOFT = '#e8f0fe';
    const round = (x, y, w, h, r, fill) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fillStyle = fill; g.fill(); };
    const fit = (text, max) => { let t = String(text); if (g.measureText(t).width <= max) return t; while (t.length > 1 && g.measureText(t + '…').width > max) t = t.slice(0, -1); return t.trimEnd() + '…'; };
    const grad = g.createLinearGradient(0, 0, W, Ht); grad.addColorStop(0, '#dfe9ff'); grad.addColorStop(0.55, '#f4f7ff'); grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad; g.fillRect(0, 0, W, Ht);
    round(40, 40, W - 80, Ht - 80, 28, '#ffffff');
    const mon = mondayOf(S.today()), w = week(st, mon), p = st.profile || {}, name = String(p.name || '').trim();
    g.fillStyle = BLUE; g.font = f(800, 26); g.fillText('Procademy', 84, 104);
    g.fillStyle = MUTED; g.font = f(600, 22); const when = `Week of ${shortDate(mon)}, ${mon.slice(0, 4)}`; g.fillText(when, W - 84 - g.measureText(when).width, 104);
    g.fillStyle = INK; g.font = f(800, 54); g.fillText(fit(name ? `${name}’s progress` : 'My progress', W - 168), 84, 176);
    const did = d => !!((st.days || {})[d] && st.days[d].q), used = (st.savers && st.savers.used) || {};
    let day = S.today(), streak = 0; if (!did(day)) day = S.dayShift(day, -1);
    while (did(day) || used[day]) { if (did(day)) streak++; day = S.dayShift(day, -1); }
    const stats = [[String(streak), 'day streak'], [`${w.active} of 7`, 'days this week'], [String(w.q), w.q === 1 ? 'question this week' : 'questions this week'], [w.q ? `${pct(w.right, w.q)}%` : '–', 'right the first time']];
    const bw = (W - 168 - 3 * 20) / 4;
    stats.forEach(([big, label], k) => { const x = 84 + k * (bw + 20); round(x, 214, bw, 132, 20, SOFT); g.fillStyle = DEEP; g.font = f(800, 52); g.fillText(fit(big, bw - 48), x + 24, 290); g.fillStyle = MUTED; g.font = f(600, 21); g.fillText(fit(label, bw - 48), x + 24, 324); });
    // courses on the left, what got better on the right
    const cs = coursesOf(st).slice(0, 3), lx = 84, colW = (W - 168 - 40) / 2;
    g.fillStyle = INK; g.font = f(800, 26); g.fillText('Courses', lx, 404);
    if (!cs.length) { g.fillStyle = MUTED; g.font = f(500, 22); g.fillText('Save a course to see it here.', lx, 444); }
    cs.forEach((cc, k) => {
      const ids = A.courseSkills(cc), m = Math.round(ids.reduce((a, id) => a + A.LEVEL_POINTS[lvOf(st, id)], 0) / Math.max(1, ids.length)), y = 440 + k * 56;
      g.fillStyle = INK; g.font = f(600, 22); g.fillText(fit(cc.title, colW - 90), lx, y);
      g.fillStyle = MUTED; g.font = f(700, 22); const mt = `${m}%`; g.fillText(mt, lx + colW - g.measureText(mt).width, y);
      round(lx, y + 12, colW, 12, 6, '#dfe5ef'); if (m) round(lx, y + 12, Math.max(12, colW * m / 100), 12, 6, BLUE);
    });
    const rx = 84 + colW + 40;
    g.fillStyle = INK; g.font = f(800, 26); g.fillText(w.ups.length ? 'Got better at' : 'Skills', rx, 404);
    g.font = f(500, 22);
    if (w.ups.length) w.ups.slice(0, 4).forEach((u, k) => { g.fillStyle = BLUE; g.beginPath(); g.arc(rx + 7, 434 + k * 40, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.fillText(fit(`${H.plain(A.skills[u.id].title)} (${A.LEVELS[u.to]})`, colW - 30), rx + 24, 442 + k * 40); });
    else { const lv = [0, 0, 0, 0, 0]; Object.keys(st.skills || {}).forEach(id => { if (A.skills[id]) lv[lvOf(st, id)]++; }); g.fillStyle = INK; [`${lv[4]} mastered`, `${lv[3]} proficient`, `${lv[2]} familiar`].forEach((t, k) => { g.fillText(t, rx, 442 + k * 40); }); }
    g.fillStyle = MUTED; g.font = f(500, 18); g.fillText(`Made with Procademy on ${longDate(S.today())}`, 84, Ht - 70);
    c.__summary = { name, streak, week: w };
    return c;
  }
  /** a panel with the picture, to download or share */
  function pictureBox(box, st) {
    const c = picture(st || S.get()), name = `procademy-progress-${S.today()}.png`;
    let url = '';
    try { url = c.toDataURL('image/png'); } catch (e) { url = ''; }
    box.hidden = false;
    box.innerHTML = `<div class="card pr-pic"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">A progress picture</h2><button type="button" class="btn sm ghost" data-pic-close>Close</button></div>
      <p class="small muted" style="margin:4px 0 12px">This week at a glance, to keep or send to family. It shows the first name, the streak, this week and course progress, and no answers.</p>
      ${url ? `<img class="pr-pic-img" src="${url}" alt="${esc(c.__summary && c.__summary.name ? c.__summary.name + '’s' : 'My')} progress this week: a ${c.__summary ? c.__summary.streak : 0} day streak and ${c.__summary ? c.__summary.week.q : 0} questions" width="1200" height="675">` : '<p class="small">This browser can’t make pictures.</p>'}
      <div class="btn-row">${url ? `<a class="btn sm primary" href="${url}" download="${name}" data-pic-save>Download the picture</a>` : ''}${url && navigator.canShare ? '<button type="button" class="btn sm" data-pic-share>Share…</button>' : ''}</div></div>`;
    box.querySelector('[data-pic-close]').addEventListener('click', () => { box.hidden = true; box.innerHTML = ''; });
    const sh = box.querySelector('[data-pic-share]');
    if (sh) sh.addEventListener('click', () => c.toBlob(b => { try { const file = new File([b], name, { type: 'image/png' }); if (navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'My Procademy progress' }).catch(() => {}); else V.toast('This browser can’t share pictures. Download it instead.'); } catch (e) { V.toast('This browser can’t share pictures. Download it instead.'); } }, 'image/png'));
    REPORT._picture = c;
    if (box.scrollIntoView) box.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- the report ---------- */
  const PERIODS = [['7', 'Last 7 days'], ['lastweek', 'Last week'], ['30', 'Last 30 days'], ['month', 'This month'], ['lastmonth', 'Last month'], ['90', 'Last 90 days']];
  /** the first and last day of a period */
  function span(p) {
    const today = S.today();
    if (p === 'lastweek') { const mon = S.dayShift(mondayOf(today), -7); return { from: mon, to: S.dayShift(mon, 6), before: 'the week before' }; }
    if (p === 'month') return { from: today.slice(0, 8) + '01', to: today, before: 'the same number of days before' };
    if (p === 'lastmonth') { const to = S.dayShift(today.slice(0, 8) + '01', -1); return { from: to.slice(0, 8) + '01', to, before: 'the month before' }; }
    const n = Math.max(1, Math.min(366, Number(p) || 7));
    return { from: S.dayShift(today, -(n - 1)), to: today, before: `the ${n} days before` };
  }
  /** how ready a learner is for a test a parent put on the calendar (its skills' levels, as test prep counts them) */
  const plannedReady = (st, t) => { const ids = (t.ids || []).filter(id => A.skills[id]); return ids.length ? Math.round(ids.reduce((a, id) => a + READY[lvOf(st, id)], 0) / ids.length * 100) : 0; };
  /** everything the report says, for a period (a number of days ending today, or a name from PERIODS) */
  function gather(period) {
    const st = S.get(), { from, to, before } = span(String(period || 7)), since = msOf(from), until = msOf(S.dayShift(to, 1));
    const dayList = []; for (let iso = from; iso <= to; iso = S.dayShift(iso, 1)) { const d = st.days[iso] || {}; dayList.push({ iso, q: d.q || 0, right: d.right || 0, min: S.minutes(st.days[iso]) }); }
    const days = dayList.length;
    const q = dayList.reduce((a, d) => a + d.q, 0), right = dayList.reduce((a, d) => a + d.right, 0);
    const log = st.log.filter(e => e.t >= since && e.t < until);
    const ups = upsIn(st, since, until);
    const kinds = {}; log.forEach(e => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });
    const skillsSeen = {}; log.forEach(e => { if (e.skill && A.skills[e.skill]) skillsSeen[e.skill] = (skillsSeen[e.skill] || 0) + 1; });
    const slips = Object.entries(st.mistakes || {}).filter(([k, m]) => m.n && NAMES[k]).sort((a, b) => b[1].n - a[1].n).slice(0, 3);
    const badges = window.BADGES ? BADGES.all().filter(b => b.at && b.at >= since && b.at < until).sort((a, b) => a.at - b.at) : [];
    const due = E.dueSkills();
    const weak = Object.keys(st.skills).filter(id => A.skills[id] && A.whereIs(id) && st.skills[id].tries >= 3 && st.skills[id].right / st.skills[id].tries < 0.6).slice(0, 5);
    const prep = st.profile.prep && window.PREP ? (() => { const c = PREP.chapterOf(st.profile.prep.book, st.profile.prep.ch); return c ? { c, date: st.profile.prep.date, ready: Math.round(PREP.readiness(c, st.profile.prep).overall * 100), tests: st.profile.prep.tests || [] } : null; })() : null;
    // three suggestions, most useful first
    const ideas = [];
    const help = st.profile.helpNote && st.profile.helpNote.text && !st.profile.helpNote.seen ? st.profile.helpNote : null;
    if (help) ideas.push({ text: `Talk about the note asking for help${help.skill && A.skills[help.skill] ? ` with ${H.plain(A.skills[help.skill].title)}` : ''}: “${String(help.text).slice(0, 80)}”`, href: '#/family' });
    if (weak.length) ideas.push({ text: `Practice ${H.plain(A.skills[weak[0]].title)}: fewer than 60% correct so far.`, href: `#/practice/${encodeURIComponent(weak[0])}` });
    if (prep && prep.ready < 80) ideas.push({ text: `Continue the plan for the ${prep.c.b.short} chapter ${prep.c.ch.n} test (${prep.ready}% ready).`, href: `#/prep/${prep.c.b.id}/${prep.c.ch.n}` });
    if (st.missed.length) ideas.push({ text: `Correct the ${H.plural(st.missed.length, 'missed question')} in Review.`, href: '#/review' });
    if (due.length) ideas.push({ text: `Refresh ${H.plural(due.length, 'skill')} that ${due.length === 1 ? 'is' : 'are'} due, with today’s practice.`, href: '#/daily' });
    if (slips.length) ideas.push({ text: `Watch for ${NAMES[slips[0][0]].toLowerCase()}: ${window.COACH ? COACH.TIPS[slips[0][0]] || '' : ''}`, href: '#/progress' });
    if (dayList.filter(d => d.q).length < Math.min(days, 4)) ideas.push({ text: 'Practice briefly on most days: ten minutes a day is more effective than an hour once a week.', href: '#/daily' });
    const tests = log.filter(e => TESTS[e.kind] && e.total).slice(0, 6);
    const seen = Object.keys(st.skills).filter(id => A.skills[id] && A.whereIs(id) && st.skills[id].tries >= 3), acc = id => st.skills[id].right / st.skills[id].tries;
    const strong = seen.filter(id => st.skills[id].level >= 2).sort((a, b) => st.skills[b].level - st.skills[a].level || acc(b) - acc(a)).slice(0, 3);
    const units = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).slice(0, 2).map(c => { const sid = E.courseOrder(c).find(id => S.skill(id).level < 3); if (!sid) return null; const u = A.whereIs(sid).unit, ids = u.skills.filter(id => A.skills[id] && A.whereIs(id)); return ids.length ? { name: `${c.title}, ${u.title}`, pct: Math.round(ids.reduce((a, id) => a + READY[S.skill(id).level], 0) / ids.length * 100) } : null; }).filter(Boolean);
    const prev = sumDays(st, S.dayShift(from, -days), S.dayShift(from, -1));
    const planned = (Array.isArray(st.profile.tests) ? st.profile.tests : []).filter(t => t && t.date >= S.today()).sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, 3);
    return { days, period: String(period || 7), from, to, today: to, dayList, q, right, active: dayList.filter(d => d.q).length, log, ups, kinds, skillsSeen, slips, badges, due, weak, prep, ideas: ideas.slice(0, 3), streak: S.streak().days, name: st.profile.name.trim(), points: log.reduce((a, e) => a + (e.pts || 0), 0),
      min: dayList.reduce((a, d) => a + d.min, 0), tests, strong, units, prev, before,
      tod: timeOfDay(st, since, until), tutor: tutorUse(ownNow('procademy.chats.v1'), since, until), extras: extras(st, since, until), areas: areas(st).filter(a => a.started), forecasts: st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).slice(0, 3).map(c => forecast(st, c)),
      flagged: (Array.isArray(st.profile.flagged) ? st.profile.flagged : []).filter(f => f && A.skills[f.skill]), planned, help };
  }
  /** the period in one sentence, for the top of the report and the start of its text */
  const glance = r => `Practiced on ${r.active} of ${r.days} days: ${H.plural(r.q, 'question')}${r.q ? `, ${Math.round(r.right / r.q * 100)}% correct on the first try` : ''}, about ${H.plural(r.min, 'minute')} in all.${r.ups.length ? ` Leveled up in ${H.plural(r.ups.length, 'skill')}.` : ''}`;
  /** the period against the same length of time just before it */
  function versus(r) {
    if (!r.prev || (!r.q && !r.prev.q)) return '';
    if (!r.prev.q) return `Up from no practice in ${r.before}.`;
    const d = r.q - r.prev.q;
    if (Math.abs(d) <= Math.max(2, r.prev.q * 0.1)) return `About the same as ${r.before} (${H.plural(r.prev.q, 'question')}).`;
    return `${d > 0 ? 'More' : 'Fewer'} than ${r.before} (${H.plural(r.prev.q, 'question')}).`;
  }
  const FLAG_WHY = { confusing: 'It’s confusing', answer: 'The answer looks wrong', broken: 'Something doesn’t show right' };
  const clip = (t, n) => (t.length > n ? t.slice(0, n - 3).replace(/\s+\S*$/, '') + '…' : t);
  /** a flagged question, rebuilt from its skill and seed, as a line of plain text */
  const flaggedText = f => { try { return clip(H.plain(A.question(f.skill, f.seed).prompt), 110); } catch (e) { return H.plain(A.skills[f.skill].title); } };

  /** the report as plain text, for a message */
  function asText(r) {
    const L = [];
    L.push(`Procademy progress report${r.name ? ' for ' + r.name : ''}: ${longDate(r.from)} – ${longDate(r.today)}`);
    L.push(`${glance(r)} Streak: ${r.streak} days.${versus(r) ? ' ' + versus(r) : ''}`);
    if (r.tests.length) L.push('Tests: ' + r.tests.map(e => `${TESTS[e.kind]} ${e.right}/${e.total}`).join(', ') + '.');
    if (r.strong.length) L.push('Strongest: ' + r.strong.map(id => H.plain(A.skills[id].title)).join(', ') + '.');
    if (r.weak.length) L.push('Needs work: ' + r.weak.slice(0, 3).map(id => H.plain(A.skills[id].title)).join(', ') + '.');
    if (r.ups.length) L.push('Leveled up: ' + r.ups.map(u => `${H.plain(A.skills[u.id].title)} (${A.LEVELS[u.to]})`).join('; ') + '.');
    if (r.slips.length) L.push('Common slips: ' + r.slips.map(([k, m]) => `${NAMES[k].toLowerCase()} (${m.n})`).join(', ') + '.');
    if (r.tod && r.tod.best) L.push(timeSentence(r.tod));
    if (r.tutor) L.push('Tutor: ' + tutorSentence(r.tutor));
    const ex = r.extras ? extrasList(r.extras) : [];
    if (ex.length) L.push('Topics and puzzles: ' + ex.join('; ') + '.');
    if (r.prep) L.push(`${r.prep.c.b.short} chapter ${r.prep.c.ch.n} test on ${longDate(r.prep.date)}: ${r.prep.ready}% ready${r.prep.tests[0] ? `, last practice test ${r.prep.tests[0].right}/${r.prep.tests[0].total}` : ''}.`);
    if (r.planned && r.planned.length) L.push('Tests coming up: ' + r.planned.map(t => `${t.name} on ${longDate(t.date)}`).join('; ') + '.');
    (r.forecasts || []).forEach(f => L.push(`${f.c.title}: ${f.done} of ${f.total} skills Proficient. ${forecastSentence(f)}`));
    if (r.badges.length) L.push('New badges: ' + r.badges.map(b => b.name).join(', ') + '.');
    if (r.flagged && r.flagged.length) L.push(`Questions flagged as confusing: ${r.flagged.length}.`);
    if (r.ideas.length) L.push('Suggested next steps: ' + r.ideas.map(i => i.text).join(' '));
    return L.join('\n');
  }

  function page(root) {
    let period = '7';
    try { const p = sessionStorage.getItem('procademy.reportPeriod'); sessionStorage.removeItem('procademy.reportPeriod'); if (PERIODS.some(x => x[0] === p)) period = p; } catch (e) { /* the usual week */ }
    function render() {
      const r = gather(period), maxQ = Math.max(1, ...r.dayList.map(d => d.q)), short = r.days <= 7;
      const sec = (title, body) => `<section><h2>${title}</h2>${body}</section>`;
      const list = items => `<ul>${items.join('')}</ul>`;
      const none = t => `<p class="rp-none">${t}</p>`;
      const ex = extrasList(r.extras);
      const extra = [
        sec('Best time of day', r.tod.q ? `<p class="rp-p">${esc(timeSentence(r.tod))}</p>${list(r.tod.parts.filter(p => p.q).map(p => `<li>${p.name} <span class="rp-lv">${H.plural(p.q, 'question')}, ${p.pct}% right</span></li>`))}` : none('No practice in this period.')),
        sec('Tutor use', `<p class="rp-p">${esc(tutorSentence(r.tutor))}</p><p class="rp-none">Counts only. What was asked stays private.</p>`),
        r.areas.length ? sec('Mastery by area', list(r.areas.slice(0, 8).map(a => `<li>${esc(a.name)} <span class="rp-lv">${a.pct}% · ${a.counts[4]} mastered, ${a.counts[3]} proficient of ${a.n}</span></li>`))) : '',
        r.forecasts.length ? sec('When each course should be finished', list(r.forecasts.map(f => `<li><b>${esc(f.c.title)}</b> <span class="rp-lv">${f.done} of ${f.total} skills Proficient.</span> ${esc(forecastSentence(f))}</li>`))) : '',
        r.badges.length ? sec('Badges earned', list(r.badges.map(b => `<li>${esc(b.name)} <span class="rp-lv">${new Date(b.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`))) : '',
        r.flagged.length ? sec('Questions flagged as confusing', list(r.flagged.slice(0, 5).map(f => `<li>${esc(flaggedText(f))} <span class="rp-lv">${esc(FLAG_WHY[f.why] || FLAG_WHY.confusing)}${f.note ? ': ' + esc(f.note) : ''}</span></li>`)) + (r.flagged.length > 5 ? none(`And ${r.flagged.length - 5} more, on the Progress page.`) : '')) : '',
      ].filter(Boolean);
      const tips = window.FAMILY && FAMILY.helpTips ? FAMILY.helpTips(r.weak.concat(V.nextUp ? V.nextUp().map(x => x.id) : []), 2) : [];
      root.innerHTML = `
        <div class="ws-controls card tight"><div class="row between" style="flex-wrap:wrap;gap:10px">
          <div><a class="btn sm ghost" href="#/progress">← Progress</a> <b style="margin-left:6px">Progress report</b></div>
          <div class="btn-row" style="margin:0"><label class="small">Period <select id="rp-days">${PERIODS.map(([v, l]) => `<option value="${v}" ${v === period ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            <button class="btn sm" id="rp-copy" type="button">Copy as text</button><button class="btn sm" id="rp-pic" type="button">Save as a picture</button><button class="btn sm primary" id="rp-print" type="button">Print or save as PDF</button></div></div>
          <p class="tiny muted" style="margin:8px 0 0">For a parent or teacher. It prints without the buttons, on one or two pages.</p></div>
        <div id="rp-picbox" class="no-print" hidden></div>
        <article class="ws-sheet report">
          <header class="ws-head"><div><div class="ws-brand">Procademy progress report</div><h1>${r.name ? esc(r.name) : 'Progress'}</h1><p>${esc(longDate(r.from))} – ${esc(longDate(r.today))}</p></div>
            <div class="rp-streak"><b>${r.streak}</b><span>day streak</span></div></header>
          <p class="rp-glance">${esc(glance(r))}${versus(r) ? ` <span class="rp-vs">${esc(versus(r))}</span>` : ''}</p>
          ${r.help ? `<p class="rp-help"><b>Asked for help${r.help.skill && A.skills[r.help.skill] ? ` with ${A.skills[r.help.skill].title}` : ''}:</b> “${esc(r.help.text)}”</p>` : ''}
          <div class="rp-tiles">
            <div><b>${r.active} / ${r.days}</b><span>days practiced</span></div>
            <div><b>${r.q}</b><span>questions answered</span></div>
            <div><b>${r.q ? Math.round(r.right / r.q * 100) : 0}%</b><span>correct on the first try</span></div>
            <div><b>${r.min}</b><span>minutes practicing</span></div>
            <div><b>${r.ups.length}</b><span>skills leveled up</span></div>
          </div>
          <h2>Questions each day</h2>
          <div class="rp-bars" role="img" aria-label="${esc(r.dayList.filter(d => d.q).map(d => `${shortDate(d.iso)}: ${d.q}`).join('; ') || 'No questions in this period')}">${r.dayList.map(d => `<div title="${d.iso}: ${d.q}"><i style="height:${Math.round(d.q / maxQ * 100)}%"></i><span>${short ? new Date(d.iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' }) : (Number(d.iso.slice(8)) % 5 === 0 ? Number(d.iso.slice(8)) : '')}</span></div>`).join('')}</div>
          <div class="rp-grid">
            ${sec('Leveled up', r.ups.length ? list(r.ups.slice(0, 10).map(u => `<li>${A.skills[u.id].title} <span class="rp-lv">${A.LEVELS[u.from]} → <b>${A.LEVELS[u.to]}</b></span></li>`)) : none('No level changes in this period.'))}
            ${sec('What was practiced', Object.keys(r.kinds).length || ex.length ? list(Object.entries(r.kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<li>${esc(KINDS[k] || k)}: ${n}</li>`).concat(ex.filter(t => /^Daily puzzles|^Puzzle levels|^Weekly/.test(t)).map(t => `<li>${esc(t)}</li>`))) : none('Nothing in this period.'))}
            ${sec('Strongest', r.strong.length ? list(r.strong.map(id => `<li>${A.skills[id].title} <span class="rp-lv">${A.LEVELS[S.skill(id).level]}</span></li>`)) : none('Not enough practice yet.'))}
            ${sec('Needs work', r.weak.length ? list(r.weak.slice(0, 3).map(id => `<li>${A.skills[id].title} <span class="rp-lv">${Math.round(S.skill(id).right / S.skill(id).tries * 100)}% right</span></li>`)) : none('Nothing weak right now.'))}
            ${sec('Tests in this period', r.tests.length ? list(r.tests.map(e => `<li>${TESTS[e.kind]}${e.title ? ': ' + esc(e.title) : ''} <span class="rp-lv">${e.right} / ${e.total} (${Math.round(e.right / e.total * 100)}%), ${new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`)) : none('No tests in this period.'))}
            ${sec('How ready for the next test', r.prep || r.units.length || r.planned.length ? list([r.prep ? `<li>${esc(r.prep.c.b.short)} chapter ${r.prep.c.ch.n} test <span class="rp-lv">${r.prep.ready}% ready</span></li>` : ''].concat(r.planned.map(t => `<li>${esc(t.name)} <span class="rp-lv">${esc(shortDate(t.date))}${t.ids && t.ids.length ? `, ${plannedReady(S.get(), t)}% ready` : ''}</span></li>`), r.units.map(u => `<li>Unit test: ${esc(u.name)} <span class="rp-lv">${u.pct}% ready</span></li>`))) : none('Save a course to see this.'))}
            ${sec('Common slips', r.slips.length ? list(r.slips.map(([k, m]) => `<li><b>${NAMES[k]}</b> (${m.n}) — ${esc(window.COACH ? COACH.TIPS[k] || '' : '')}</li>`)) : none('None recorded yet.'))}
            ${sec('Upcoming', `<ul>
              ${r.prep ? `<li><b>${esc(r.prep.c.b.short)} chapter ${r.prep.c.ch.n} test</b> on ${esc(longDate(r.prep.date))}: ${r.prep.ready}% ready${r.prep.tests[0] ? `; last practice test ${r.prep.tests[0].right} / ${r.prep.tests[0].total}` : ''}.</li>` : ''}
              ${r.planned.map(t => `<li><b>${esc(t.name)}</b> on ${esc(longDate(t.date))}.</li>`).join('')}
              <li>${r.due.length ? `${H.plural(r.due.length, 'skill')} due for a refresher.` : 'Nothing due for review.'}</li>
              ${r.weak.length ? `<li>Needs more practice: ${r.weak.map(id => A.skills[id].title).join(', ')}.</li>` : ''}
              ${r.badges.length ? `<li>New badges: ${r.badges.map(b => esc(b.name)).join(', ')}.</li>` : ''}
            </ul>`)}
            ${extra.join('')}
          </div>
          <h2>Suggested next steps</h2>
          ${r.ideas.length ? `<ol class="rp-ideas">${r.ideas.map(i => `<li><a href="${i.href}">${esc(i.text)}</a></li>`).join('')}</ol>` : '<p class="rp-none">No changes are suggested. Continue the current routine.</p>'}
          ${tips.length ? `<h2>How to help at home</h2><ul class="rp-tips">${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          <footer class="ws-foot">Procademy keeps all of this on the learner’s device. Levels: Attempted, Familiar, Proficient (all correct in a practice set), Mastered (kept correct in tests and challenges).</footer>
        </article>${privateNote('report')}${window.FAMILY ? FAMILY.shareBox() : ''}`;
      if (window.FAMILY) FAMILY.wireShare(root);
      root.querySelector('#rp-days').addEventListener('change', ev => { period = ev.target.value; render(); });
      root.querySelector('#rp-print').addEventListener('click', () => window.print());
      root.querySelector('#rp-pic').addEventListener('click', () => pictureBox(root.querySelector('#rp-picbox')));
      root.querySelector('#rp-copy').addEventListener('click', () => { const t = asText(r); REPORT._lastText = t; try { navigator.clipboard.writeText(t).then(() => V.toast('The report was copied as text.'), () => V.toast('The report couldn’t be copied.')); } catch (e) { V.toast('The report couldn’t be copied.'); } });
      root.__report = r;
    }
    render();
    // Print a report on Progress: straight to printing, in one tap
    let auto = null; try { auto = sessionStorage.getItem('procademy.printReport'); sessionStorage.removeItem('procademy.printReport'); } catch (e) { auto = null; }
    if (auto) setTimeout(() => { if (root.querySelector('.report')) window.print(); }, 350);
  }

  const REPORT = { gather, asText, page, PERIODS, span, sumDays, upsIn, entryIn, coursesOf, areaOf, areas, AREAS, months, timeOfDay, timeSentence, forecast, forecastSentence, growth, grownSkills, goalHistory, extras, extrasList, tutorUse, tutorSentence, week, weekVs, privateNote, picture, pictureBox, plannedReady, flaggedText, FLAG_WHY, mondayOf, msOf, isoOf, shortDate, longDate, _lastText: null, _picture: null };
  window.REPORT = REPORT;
})();
