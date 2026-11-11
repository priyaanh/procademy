/* Practice sessions and the mastery rules.
   A session is a list of (skill, seed) items. Answering records a result; finishing applies the
   mastery rules and awards points. Everything mastery-related is in this one file. */
'use strict';
(function () {
  const A = (typeof window !== 'undefined' && window.ACADEMY) || require('./content.js');
  const STORE = (typeof window !== 'undefined' && window.STORE) || require('./store.js');

  const PRACTICE_N = 7;             // questions in a practice set
  const CHALLENGE_N = 30;           // questions in a course challenge
  const MASTERY_N = 6;              // questions in a mastery challenge
  const PLACE_MAX = 15;
  const POINTS = { correct: 15, hinted: 5, set: 50, levelUp: [0, 0, 100, 150, 250], unitTest: 100, challenge: 200, daily: 75 };
  const DAILY_N = 10;               // questions in the daily practice
  const TESTOUT_N = 5;              // questions in a test-out: all right, no hints, and the skill is Proficient
  const WINS_TO_CLEAR = 2;          // a missed question leaves Review after this many right answers
  const QUIZ_N = 10, QUIZ_MIN = 8;  // a timed quiz: questions, and minutes on the clock
  const SPEED_N = 10;               // beat your best: questions against a stopwatch
  const BOSS_N = 8, BOSS_LIVES = 3; // a boss level: hard questions from a whole unit, and misses allowed before it ends
  const STALE_DAYS = 3;             // a skill practised before review dates existed is due this long after

  /** spaced review: when a skill should come back. All right → the gap grows (3, 7, 16, 37, 85 days);
      mostly right → it grows a little; otherwise → tomorrow. */
  function nextGap(ivl, ratio) {
    if (ratio === 1) return ivl ? Math.min(90, Math.round(ivl * 2.3)) : 3;
    if (ratio >= 0.7) return Math.max(2, Math.round((ivl || 2) * 1.2));
    return 1;
  }
  /** is this skill due for a refresher today? */
  function isDue(sk, today) {
    if (!sk.tries || !sk.level) return false;
    if (sk.due) return sk.due <= today;
    return Date.now() - (sk.last || 0) > STALE_DAYS * 864e5;
  }

  /** pick `k` seeds for a skill whose prompts differ, deriving them from the session seed */
  function distinctItems(skillId, sessionSeed, k, seen) {
    seen = seen || new Set();
    const items = [];
    for (let attempt = 0; items.length < k && attempt < k * 12; attempt++) {
      const seed = `${sessionSeed}-${attempt}`;
      const q = A.question(skillId, seed);
      const key = A.normText(A.stripTags(q.prompt));
      if (seen.has(key) && attempt < k * 12 - k) continue;   // allow repeats only as a last resort
      seen.add(key);
      items.push({ skillId, seed, q });
    }
    return items;
  }

  /** a placement check's questions: the last skill of each unit, in order (at most PLACE_MAX units, evenly spread) */
  function placementPlan(course) {
    const units = course.units.map(u => ({ unitId: u.id, skillId: u.skills.filter(id => A.skills[id]).slice(-1)[0] })).filter(x => x.skillId);
    if (units.length <= PLACE_MAX) return units;
    return Array.from({ length: PLACE_MAX }, (_, k) => units[Math.round(k * (units.length - 1) / (PLACE_MAX - 1))]);
  }
  function spreadAcrossUnits(course, k, rng) {
    // one question per skill, taken evenly across units, at most k in total
    const perUnit = course.units.map(u => rng.shuffle(u.skills));
    const out = [];
    while (out.length < k && perUnit.some(l => l.length)) {
      perUnit.forEach(l => { if (out.length < k && l.length) out.push(l.shift()); });
    }
    return out;
  }

  /** how hard a question looks: more steps, bigger numbers, fractions, powers and negatives all add a little.
      Only used to compare questions of the same skill, so the scale doesn't matter. */
  function weight(q) {
    const t = A.stripTags(q.prompt || '').replace(/(\d),(?=\d{3}\b)/g, '$1');
    const nums = (t.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const big = nums.length ? Math.log10(1 + Math.max.apply(null, nums)) : 0;
    const frac = (t.match(/\d\s*\/\s*\d/g) || []).length + (String(q.prompt).match(/class="frac"/g) || []).length;
    const pow = (String(q.prompt).match(/<sup>/g) || []).length, neg = (t.match(/[−-]\s?\d/g) || []).length;
    return (q.hints ? q.hints.length : 1) * 1.5 + big + frac * 0.8 + pow * 0.6 + neg * 0.4 + Math.min(nums.length, 8) * 0.15 + Math.min(t.length, 400) / 400;
  }
  /** the next item for a skill at a difficulty: 0 the lightest of a few candidates, 2 the heaviest, 1 the usual one */
  function itemAt(skillId, seed, seen, lv, n) {
    const cands = [];
    for (let j = 0; j < (n || 4); j++) { const x = distinctItems(skillId, j ? `${seed}~${j}` : seed, 1, new Set(seen))[0]; if (x) cands.push(x); }
    const pick = lv === 1 || cands.length < 2 ? cands[0] : cands.slice().sort((a, b) => weight(a.q) - weight(b.q))[lv === 0 ? 0 : cands.length - 1];
    seen.add(A.normText(A.stripTags(pick.q.prompt)));
    return pick;
  }

  /** the same skill never twice in a row while another can go between: the skill with the most left goes next */
  function spread(items) {
    const left = items.slice(), out = [];
    while (left.length) {
      const last = out.length ? out[out.length - 1].skillId : null, count = {};
      left.forEach(it => { count[it.skillId] = (count[it.skillId] || 0) + 1; });
      let k = -1;
      left.forEach((it, j) => { if (it.skillId !== last && (k < 0 || count[it.skillId] > count[left[k].skillId])) k = j; });
      out.push(left.splice(k < 0 ? 0 : k, 1)[0]);
    }
    return out;
  }

  /* ---------- answering by hand: put things in order, click a point, drag on a number line ----------
     Built on the questions as they are (a choice or a number), so every question keeps its usual way to answer
     and checks the same way. A content file can also ask for a number line with ui: { kind: 'line', min, max }. */
  const minus = t => String(t).replace(/−/g, '-');
  const PAIR = /^\(\s*([−-]?\d+)\s*,\s*([−-]?\d+)\s*\)$/;
  const pairOf = html => { const m = PAIR.exec(A.stripTags(String(html || '')).replace(/&minus;/g, '−').replace(/\s+/g, ' ').trim()); return m ? [Number(minus(m[1])), Number(minus(m[2]))] : null; };
  const splitList = c => String(c).split(/,\s+/);
  /** a choice question whose choices are the same items in different orders, and which asks for an order */
  function orderSpec(q) {
    if (q.type !== 'choice' || !/\border\b|\barrange/i.test(A.stripTags(q.prompt))) return null;
    const lists = q.choices.map(splitList), n = lists[0].length, key = l => l.slice().sort().join('\u0001');
    if (n < 3 || n > 8 || lists.some((l, k) => l.length !== n || l.join(', ') !== q.choices[k] || key(l) !== key(lists[0])) || new Set(lists[0]).size !== n) return null;
    // a start order that is none of the choices, so the learner has to put it in order
    const rng = RNG.make('order:' + q.skillId + ':' + q.seed), base = lists[q.answerIndex];
    let start = null;
    for (let k = 0; k < 24 && !start; k++) { const t = rng.shuffle(base); if (!q.choices.includes(t.join(', '))) start = t; }
    if (!start) { start = base.slice(1).concat(base[0]); if (start.join(', ') === q.answer) return null; }
    return { kind: 'order', items: start, answer: base, value: v => { const t = v.join(', '), k = q.choices.indexOf(t); return k >= 0 ? k : t; }, said: v => v.map(x => A.stripTags(x).trim()).join(', ') };
  }
  /** a choice question whose choices are whole-number points and which has one right point (where the image
      goes, the solution of a system), with no picture of its own (that would make it copying, not working) */
  function gridSpec(q) {
    if (q.type !== 'choice' || /<svg/i.test(q.prompt)) return null;
    const t = A.stripTags(q.prompt).replace(/\s+/g, ' ');
    if (!/what are the coordinates|where do you end up|which point is the solution/i.test(t)) return null;
    const pts = q.choices.map(pairOf);
    if (pts.some(p => !p)) return null;
    const far = Math.max(...pts.map(p => Math.max(Math.abs(p[0]), Math.abs(p[1]))));
    if (far > 12) return null;
    const max = far <= 9 ? 10 : 12, first = pts.every(p => p[0] >= 0 && p[1] >= 0);
    const said = p => `(${String(p[0]).replace('-', '−')}, ${String(p[1]).replace('-', '−')})`;
    return { kind: 'grid', min: first ? 0 : -max, max, choices: pts, answer: pts[q.answerIndex], said, value: p => { const k = pts.findIndex(c => c[0] === p[0] && c[1] === p[1]); return k >= 0 ? k : said(p); } };
  }
  /** a number line to drag the answer on: integer adding and subtracting, or a question that asks for one */
  const LINE_SKILLS = { 'math7.add-negatives': (a, b) => [a, a + b, a - b], 'math7.sub-negatives': (a, b) => [a, a - b, a + b] };
  function lineSpec(q) {
    if (q.type !== 'number') return null;
    const u = q.ui && q.ui.kind === 'line' ? q.ui : null;
    if (u && isFinite(u.min) && isFinite(u.max) && u.max > u.min) {
      const step = u.step > 0 ? u.step : 1;
      if (q.answer < u.min || q.answer > u.max || Math.abs(Math.round((q.answer - u.min) / step) * step + u.min - q.answer) > 1e-9) return null;
      return { kind: 'line', min: u.min, max: u.max, step, start: u.start != null ? u.start : u.min, label: u.label || 5 };
    }
    const f = LINE_SKILLS[q.skillId], p = q.params || {};
    if (!f || !Number.isInteger(p.a) || !Number.isInteger(p.b) || !Number.isInteger(q.answer)) return null;
    // the window holds 0, the start, the answer and the usual slip, so where it ends says nothing about the answer
    const vals = f(p.a, p.b).concat(0, q.answer), lo = Math.floor(Math.min(...vals) / 5) * 5 - 5, hi = Math.ceil(Math.max(...vals) / 5) * 5 + 5;
    return { kind: 'line', min: lo, max: hi, step: 1, start: p.a, label: hi - lo > 40 ? 10 : 5 };
  }
  const uiCache = new WeakMap();

  const ENGINE = {
    TESTOUT_N, WINS_TO_CLEAR, spread, weight, QUIZ_N, QUIZ_MIN, SPEED_N, BOSS_N, BOSS_LIVES,
    /** a hands-on way to answer this question, or null: { kind: 'order' | 'grid' | 'line', … }. For order and grid,
        value(v) is what the answer checks as (a choice's text: any other order or point is simply wrong) */
    hands(q) {
      if (!q || typeof q !== 'object') return null;
      if (uiCache.has(q)) return uiCache.get(q);
      let sp = null;
      try { sp = orderSpec(q) || gridSpec(q) || lineSpec(q); } catch (e) { sp = null; }
      // only a way that checks the right answer as right, and something else as wrong
      if (sp && sp.kind !== 'line' && !(A.check(q, sp.value(sp.answer)).correct && !A.check(q, sp.value(sp.kind === 'order' ? sp.items : [sp.answer[0] + 1, sp.answer[1]])).correct)) sp = null;
      uiCache.set(q, sp);
      return sp;
    },
    /** how much of a several-part answer is right: the places of an order, or each coordinate of a point.
        input: a choice's index or text. { right, of, which } or null; partly right answers earn a few points */
    parts(q, input) {
      if (!q || q.type !== 'choice') return null;
      const given = typeof input === 'number' ? q.choices[input] : input;
      if (given == null || given === q.answer) return null;
      const a = pairOf(q.answer), g = pairOf(given);
      if (a && g) { const which = [a[0] === g[0], a[1] === g[1]]; return { right: which.filter(Boolean).length, of: 2, which }; }
      const al = splitList(q.answer), gl = splitList(given);
      if (al.length >= 3 && gl.length === al.length && al.slice().sort().join('\u0001') === gl.slice().sort().join('\u0001')) return { right: al.filter((x, k) => gl[k] === x).length, of: al.length };
      return null;
    },
    /** powers and roots on the keypad: a rounded answer to a question with a power or a root, where an exact
        form such as √85 or 4000 × 0.95^5 is as good as the rounded number */
    mathKeys(q) { return !!(q && q.type === 'number' && q.tolerance != null && /√|<sup>|class="sqrt"|sqrt/.test(q.prompt + (q.hints || []).join(' '))); },
    /** the value of a typed expression with powers and roots (2^3, √85, 3√2, (1.05)^4, 2(3 + 4)), read by a small
        parser (never eval); NaN when it isn't one */
    typedValue(text) {
      const src = String(text || '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/[−–]/g, '-').replace(/[×·*]/g, '*').replace(/÷/g, '/').replace(/,(?=\d{3}\b)/g, '').replace(/sqrt/gi, '√');
      const toks = src.match(/\d+(?:\.\d+)?|\.\d+|[-+*/^()√]|\S/g) || [];
      let i = 0;
      const peek = () => toks[i], take = () => toks[i++];
      const num = t => /^(\d+(\.\d+)?|\.\d+)$/.test(t || '');
      const startsAtom = t => num(t) || t === '(' || t === '√';
      function expr() { let v = term(); while (peek() === '+' || peek() === '-') v = take() === '+' ? v + term() : v - term(); return v; }
      function term() {
        let v = unary();
        for (;;) {
          if (peek() === '*' || peek() === '/') { const op = take(), r = unary(); v = op === '*' ? v * r : v / r; }
          else if (startsAtom(peek())) v *= power();          // 3√2, 2(3 + 4)
          else return v;
        }
      }
      function unary() { if (peek() === '-') { take(); return -unary(); } if (peek() === '+') { take(); return unary(); } return power(); }
      function power() { const b = atom(); if (peek() === '^') { take(); return Math.pow(b, unary()); } return b; }
      function atom() {
        const t = take();
        if (num(t)) return Number(t);
        if (t === '(') { const v = expr(); if (take() !== ')') throw new Error('('); return v; }
        if (t === '√') return Math.sqrt(power());
        throw new Error('?');
      }
      try { if (!toks.length) return NaN; const v = expr(); return i === toks.length && isFinite(v) ? v : NaN; } catch (e) { return NaN; }
    },
    /** "Try a similar one": the same skill (the same kind of question where the skill has kinds) right after this
        one. In a set it's an extra, kept out of the score and the levels; in unlimited practice it counts as usual */
    canSimilar(s) { return ['practice', 'mix', 'daily', 'review', 'endless'].includes(s.kind); },
    similar(s) {
      const it = s.items[s.i];
      if (!it || !ENGINE.canSimilar(s)) return null;
      const kind = it.q.params && it.q.params.kind, seen = new Set(s.items.map(x => A.normText(A.stripTags(x.q.prompt))));
      let pick = null;
      for (let j = 0; j < 30 && !pick; j++) {
        const seed = `${it.seed}~like${s.items.length}.${j}`, q = A.question(it.skillId, seed);
        if (seen.has(A.normText(A.stripTags(q.prompt)))) continue;
        if (kind != null && (q.params || {}).kind !== kind && j < 26) continue;
        pick = { skillId: it.skillId, seed, q, why: 'similar' };
      }
      if (!pick) return null;
      if (s.kind !== 'endless') pick.extra = true;
      if (it.lesson) pick.lesson = it.lesson;
      s.items.splice(s.i + 1, 0, pick); s.results.splice(s.i + 1, 0, null);
      return pick;
    },
    /** unlimited practice follows the learner: 1 to start, up one after two right in a row (to 2), down one after a miss (to 0) */
    levelOf(s) {
      let lv = 1, run = 0;
      s.results.forEach(r => { if (!r || !r.done) return; if (ENGINE.counts(r)) { if (++run >= 2) { lv = Math.min(2, lv + 1); run = 0; } } else { lv = Math.max(0, lv - 1); run = 0; } });
      return lv;
    },
    /** the Monday that starts the week holding iso, which names the week's challenge */
    weekOf(iso) { const d = iso || STORE.today(); return STORE.dayShift(d, -((new Date(d + 'T12:00').getDay() + 6) % 7)); },
    /** this week's challenge problem for a course: the hardest-looking of many questions across it, the same all week */
    weeklyItem(course, week) {
      const ids = A.courseSkills(course).filter(id => A.skills[id]);
      if (!ids.length) return null;
      const rng = RNG.make('weekly:' + course.id + ':' + week);
      let best = null;
      rng.sample(ids, Math.min(14, ids.length)).forEach((sid, k) => {
        for (let j = 0; j < 2; j++) {
          const seed = `weekly-${week}-${k}-${j}`, q = A.question(sid, seed), w = weight(q);
          if (q.hints.length >= 2 && (!best || w > best.w)) best = { skillId: sid, seed, q, w };
        }
      });
      return best;
    },
    PRACTICE_N, CHALLENGE_N, MASTERY_N, POINTS, DAILY_N, nextGap,

    /** skills due for a refresher, the most overdue (then the weakest) first */
    dueSkills() {
      const today = STORE.today(), all = STORE.get().skills;
      return Object.keys(all).filter(id => A.skills[id] && A.whereIs(id) && isDue(all[id], today))
        .sort((a, b) => String(all[a].due || '0').localeCompare(String(all[b].due || '0')) || all[a].level - all[b].level);
    },
    /** what today's practice will hold: skills due for review, mistakes to fix, and new skills to start */
    /** a course's skills in the order to learn them: from the unit a placement check said to start at (the units
        before it come last), otherwise from the beginning */
    courseOrder(course) {
      const list = A.courseSkills(course), p = (STORE.get().profile.placed || {})[course.id];
      const u = p && p.start ? course.units.find(x => x.id === p.start) : null;
      const at = u ? list.indexOf(u.skills.find(id => list.includes(id))) : -1;
      return at > 0 ? list.slice(at).concat(list.slice(0, at)) : list;
    },
    placementPlan,

    dailyPlan() {
      const st = STORE.get(), due = ENGINE.dueSkills().slice(0, 5);
      const missed = st.missed.filter(m => A.skills[m.skill] && !due.includes(m.skill)).slice(0, 3);
      // new: the class lesson's skills, then the next skill in each saved course, then after recent skills
      const fresh = [], want = DAILY_N - due.length - missed.length;
      const add = id => { if (id && A.skills[id] && A.whereIs(id) && STORE.skill(id).level < 2 && !due.includes(id) && !fresh.includes(id) && fresh.length < Math.max(2, want)) fresh.push(id); };
      const c = st.profile.cpm, lesson = c && A.cpmLesson && A.cpmLesson(c.book, c.lesson);
      if (lesson) lesson.lesson.skills.forEach(add);
      st.profile.enrolled.filter(id => !id.startsWith('cpm:')).map(id => A.courseById(id)).filter(Boolean).forEach(co => add(ENGINE.courseOrder(co).find(id => STORE.skill(id).level < 2)));
      st.recent.forEach(id => { const w = A.whereIs(id); if (w) { const list = A.courseSkills(w.course), k = list.indexOf(id); add(list.slice(k + 1).find(x => STORE.skill(x).level < 2)); } });
      // new skills fill the rest of the set, so with any new skill the set is always DAILY_N long
      return { due, missed, fresh, total: fresh.length ? DAILY_N : Math.min(DAILY_N, due.length + missed.length) };
    },

    /** kind: practice | unit-test | course-challenge | mastery-challenge | mix | review | daily | chapter-test */
    start(kind, opts) {
      opts = opts || {};
      const sessionSeed = opts.seed || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
      const rng = RNG.make('session:' + sessionSeed);
      const s = { kind, seed: sessionSeed, items: [], i: 0, results: [], hints: kind === 'practice' || kind === 'review', title: '', courseId: opts.courseId || null, unitId: opts.unitId || null };
      if (kind === 'practice') {
        const def = A.skills[opts.skillId];
        if (!def) throw new Error('no skill ' + opts.skillId);
        s.skillId = opts.skillId;
        s.title = def.title;
        s.items = distinctItems(opts.skillId, sessionSeed, Math.max(3, Math.min(15, Math.round(opts.n) || PRACTICE_N)));       // 5, 7 or 10, as the learner chooses
        const where = A.whereIs(opts.skillId);
        if (where) { s.courseId = where.course.id; s.unitId = where.unit.id; }
      } else if (kind === 'testout') {
        // too easy? a short check with no hints: every question right makes the skill Proficient
        const def = A.skills[opts.skillId];
        if (!def) throw new Error('no skill ' + opts.skillId);
        s.skillId = opts.skillId;
        s.title = 'Test out: ' + def.title;
        s.items = distinctItems(opts.skillId, sessionSeed, opts.n || TESTOUT_N);
        const where = A.whereIs(opts.skillId);
        if (where) { s.courseId = where.course.id; s.unitId = where.unit.id; }
      } else if (kind === 'quiz' || kind === 'boss') {
        // a timed quiz: QUIZ_N questions from a unit against the clock; a boss level: the hardest-looking question of
        // a few for each of BOSS_N picks across the unit, BOSS_LIVES misses allowed. No hints in either
        const unit = A.unitById(opts.courseId, opts.unitId);
        if (!unit) throw new Error('no unit');
        const ids = unit.skills.filter(id => A.skills[id]);
        if (!ids.length) throw new Error('nothing in this unit yet');
        const boss = kind === 'boss', n = opts.n || (boss ? BOSS_N : QUIZ_N), seen = new Set();
        s.title = (boss ? 'Boss level: ' : 'Timed quiz: ') + unit.title;
        const order = rng.shuffle(ids);
        for (let k = 0; k < n; k++) s.items.push(boss ? itemAt(order[k % order.length], `${sessionSeed}-${k}`, seen, 2, 5) : distinctItems(order[k % order.length], `${sessionSeed}-${k}`, 1, seen)[0]);
        s.items = spread(s.items);
        if (boss) s.lives = BOSS_LIVES; else s.minutes = opts.minutes || QUIZ_MIN;
      } else if (kind === 'speed') {
        // beat your best: SPEED_N questions of one skill against a stopwatch, no hints
        const def = A.skills[opts.skillId];
        if (!def) throw new Error('no skill ' + opts.skillId);
        s.skillId = opts.skillId;
        s.title = 'Beat your best: ' + def.title;
        s.items = distinctItems(opts.skillId, sessionSeed, opts.n || SPEED_N);
        s.stopwatch = true;
        const where = A.whereIs(opts.skillId);
        if (where) { s.courseId = where.course.id; s.unitId = where.unit.id; }
      } else if (kind === 'weekly') {
        // this week's challenge problem: one hard question, with hints after a try
        const course = A.courseById(opts.courseId), week = opts.week || ENGINE.weekOf();
        const it = course && ENGINE.weeklyItem(course, week);
        if (!it) throw new Error('no challenge this week');
        s.title = 'This week’s challenge';
        s.week = week; s.hints = true; s.courseId = course.id;
        s.items = [{ skillId: it.skillId, seed: it.seed, q: it.q }];
      } else if (kind === 'unit-test') {
        const unit = A.unitById(opts.courseId, opts.unitId);
        if (!unit) throw new Error('no unit');
        s.title = 'Unit test: ' + unit.title;
        // skills already Mastered get a spot check of two, so a test is about what's still being learned; a missed
        // skill gets a second question at the end (ENGINE.followUps), and only two misses lower it
        const ids = unit.skills.filter(id => A.skills[id]), open = ids.filter(id => STORE.skill(id).level < 4), done = ids.filter(id => STORE.skill(id).level >= 4);
        const pick = open.length ? open.concat(rng.sample(done, Math.min(2, done.length))) : ids;
        rng.shuffle(pick).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
        s.secondChance = true;
      } else if (kind === 'course-challenge') {
        const course = A.courseById(opts.courseId);
        if (!course) throw new Error('no course');
        s.title = 'Course challenge: ' + course.title;
        spreadAcrossUnits(course, opts.n || CHALLENGE_N, rng).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'placement') {
        // find your starting point: one question from the end of each unit, in order, no hints
        const course = A.courseById(opts.courseId);
        if (!course) throw new Error('no course');
        s.title = 'Find your starting point: ' + course.title;
        placementPlan(course).forEach((x, k) => { s.items.push({ skillId: x.skillId, unitId: x.unitId, seed: `${sessionSeed}-${k}`, q: A.question(x.skillId, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'mastery-challenge') {
        const course = A.courseById(opts.courseId);
        if (!course) throw new Error('no course');
        s.title = 'Mastery challenge: ' + course.title;
        const pool = ENGINE.masteryPool(course);
        if (!pool.length) throw new Error('nothing to level up yet');
        rng.sample(pool, opts.n || MASTERY_N).forEach((sid, k) => { s.items.push({ skillId: sid, seed: `${sessionSeed}-${k}`, q: A.question(sid, `${sessionSeed}-${k}`) }); });
      } else if (kind === 'mix') {
        // a practice set drawn from several skills, such as a CPM lesson or chapter: hints on
        const ids = (opts.skills || []).filter(id => A.skills[id]);
        if (!ids.length) throw new Error('nothing to practice here yet');
        s.title = opts.title || 'Mixed practice';
        s.skills = ids;
        s.cpm = opts.cpm || null;
        s.hints = true;
        const n = opts.n || PRACTICE_N, order = rng.shuffle(ids), seen = new Set();
        for (let k = 0; k < n; k++) {
          const sid = order[k % order.length];
          s.items.push(distinctItems(sid, `${sessionSeed}-${k}`, 1, seen)[0]);
        }
      } else if (kind === 'daily') {
        // a mix: one question for each skill due, the exact questions missed, then new skills; interleaved
        const plan = opts.plan || ENGINE.dailyPlan();
        s.title = 'Today’s practice';
        s.hints = true;
        const seen = new Set(), list = [];
        plan.due.forEach((sid, k) => list.push(Object.assign(distinctItems(sid, `${sessionSeed}-d${k}`, 1, seen)[0], { why: 'review' })));
        plan.missed.forEach(m => list.push({ skillId: m.skill, seed: m.seed, q: A.question(m.skill, m.seed), why: 'mistake' }));
        let k = 0;
        while (list.length < DAILY_N && plan.fresh.length && k < DAILY_N * 2) { const sid = plan.fresh[k % plan.fresh.length]; list.push(Object.assign(distinctItems(sid, `${sessionSeed}-n${k}`, 1, seen)[0], { why: 'new' })); k++; }
        if (!list.length) throw new Error('nothing to practice yet');
        s.items = spread(rng.shuffle(list).slice(0, DAILY_N));
      } else if (kind === 'chapter-test') {
        // a practice test for a CPM chapter: a question from each lesson (8 to 20 in all), no hints
        const b = A.cpmById(opts.book), ch = b && b.chapters.find(c => c.n === Number(opts.chapter));
        if (!ch) throw new Error('no chapter');
        const lessons = ch.lessons.filter(l => l.skills.some(id => A.skills[id] && A.whereIs(id)));
        if (!lessons.length) throw new Error('nothing to test in this chapter yet');
        s.title = `${b.short} · Chapter ${ch.n} practice test`;
        s.cpm = { book: b.id, chapter: ch.n };
        // too many lessons: the ones with the weakest skills come first, then the rest at random (kept in book order)
        const weak = l => Math.min.apply(null, l.skills.filter(id => A.skills[id]).map(id => STORE.skill(id).level));
        const picked = lessons.length > 20 ? lessons.map(l => ({ l, w: weak(l), r: rng.next() })).sort((x, y) => x.w - y.w || x.r - y.r).slice(0, 20).map(x => x.l).sort((x, y) => lessons.indexOf(x) - lessons.indexOf(y)) : lessons.slice();
        while (picked.length < Math.min(8, lessons.length * 3)) picked.push(lessons[picked.length % lessons.length]);
        const seen = new Set();
        picked.forEach((l, k) => {
          const ids = l.skills.filter(id => A.skills[id] && A.whereIs(id));
          s.items.push(Object.assign(distinctItems(ids[k % ids.length], `${sessionSeed}-${k}`, 1, seen)[0], { lesson: l.id }));
        });
        s.secondChance = true;
      } else if (kind === 'review') {
        const missed = (opts.items || STORE.get().missed).filter(m => A.skills[m.skill]).slice(0, opts.n || 10);
        s.title = 'Review your mistakes';
        s.items = spread(missed.map(m => ({ skillId: m.skill, seed: m.seed, q: A.question(m.skill, m.seed) })));
      } else throw new Error('unknown kind ' + kind);
      s.items.forEach(() => s.results.push(null));
      return s;
    },

    /** unlimited practice: questions without end from a pool of skills (one skill, a unit, a course, everything).
        Every PRACTICE_N answers are saved as a set, so levels, points and review dates count as usual. */
    endless(opts) {
      const ids = [...new Set((opts.skills || []).filter(id => A.skills[id]))];
      if (!ids.length) throw new Error('nothing to practice here yet');
      const s = { kind: 'endless', seed: opts.seed || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)), items: [], results: [], i: 0, hints: true,
        title: opts.title || 'Unlimited practice', skills: ids, saved: 0, seen: new Set(), pts: 0, changes: [], courseId: null, unitId: null, cpm: opts.cpm || null };
      if (ids.length === 1) { const w = A.whereIs(ids[0]); s.skillId = ids[0]; if (w) { s.courseId = w.course.id; s.unitId = w.unit.id; } }
      ENGINE.more(s);
      return s;
    },
    /** add the next question: the same skill again, or from a pool, the weaker skills more often and never one skill twice running */
    more(s) {
      const k = s.items.length;
      let sid = s.skills[0];
      if (s.skills.length > 1) {
        const last = k ? s.items[k - 1].skillId : null, bag = [];
        s.skills.forEach(id => { if (id !== last) for (let w = [3, 3, 2, 1, 1][STORE.skill(id).level] || 1; w > 0; w--) bag.push(id); });
        sid = RNG.make(`endless:${s.seed}:${k}`).pick(bag);
      }
      s.items.push(itemAt(sid, `${s.seed}-${k}`, s.seen, ENGINE.levelOf(s)));
      s.results.push(null);
    },
    /** save what was answered since the last save: a full set of one skill as a practice set, anything else as a
        mixed set (which never lowers a level; a short one earns no set bonus; a skill needs 3 or more answers
        in it, 70% right first try, to reach Familiar) */
    saveEndless(s) {
      const upto = s.results[s.i] && s.results[s.i].done ? s.i + 1 : s.i;
      if (upto <= s.saved) return null;
      const items = s.items.slice(s.saved, upto), results = s.results.slice(s.saved, upto);
      const full = items.length >= PRACTICE_N;
      const sub = { kind: full && s.skills.length === 1 ? 'practice' : 'mix', partial: !full, endless: true, seed: `${s.seed}:${s.saved}`, items, results, i: items.length,
        title: s.title, skillId: s.skillId, skills: s.skills, courseId: s.courseId, unitId: s.unitId, cpm: s.cpm };
      const f = ENGINE.finish(sub);
      s.saved = upto; s.pts += f.pts; s.changes.push(...f.changes);
      return f;
    },
    /** the running score: answered, right first try, the streak now and the best streak */
    tally(s) {
      let n = 0, right = 0, streak = 0, best = 0;
      s.results.forEach(r => { if (!r || !r.done) return; n += 1; if (ENGINE.counts(r)) { right += 1; streak += 1; best = Math.max(best, streak); } else streak = 0; });
      return { n, right, streak, best };
    },
    /** stop: save the rest, and sum up the whole session like a finished set */
    stopEndless(s) {
      ENGINE.saveEndless(s);
      s.stopped = true;
      const t = ENGINE.tally(s), by = {};
      s.changes.forEach(c => { by[c.skillId] = { skillId: c.skillId, from: by[c.skillId] ? by[c.skillId].from : c.from, to: c.to }; });   // one change per skill
      return { right: t.right, total: t.n, pts: s.pts, changes: Object.values(by).filter(c => c.from !== c.to), best: t.best };
    },

    /** skills a mastery challenge can level up: Familiar or Proficient */
    masteryPool(course) {
      return A.courseSkills(course).filter(sid => { const l = STORE.skill(sid).level; return l === 2 || l === 3; });
    },

    current(s) { return s.items[s.i] || null; },
    /** skip for now: the current question moves to the end of the set, once; false when it can't */
    skip(s) {
      const k = s.i, it = s.items[k];
      if (s.kind === 'endless' || s.kind === 'placement' || !it || it.skipped || k >= s.items.length - 1 || (s.results[k] && s.results[k].done)) return false;
      s.items.splice(k, 1); const r = s.results.splice(k, 1)[0];
      it.skipped = true; s.items.push(it); s.results.push(r);
      return true;
    },
    /** a set to finish later, small enough to keep in the profile: the questions as skill and seed, and the answers so far */
    pack(s) {
      const keep = ['kind', 'seed', 'title', 'hints', 'i', 'skillId', 'skills', 'courseId', 'unitId', 'cpm', 'secondChance', 'followed'];
      const o = { items: s.items.map(it => ({ skillId: it.skillId, seed: it.seed, why: it.why, unitId: it.unitId, lesson: it.lesson, skipped: it.skipped, extra: it.extra })), results: s.results.map(r => r && Object.assign({}, r)), t: Date.now() };
      keep.forEach(k => { if (s[k] !== undefined) o[k] = s[k]; });
      return JSON.parse(JSON.stringify(o));
    },
    /** a packed set, ready to carry on (its questions rebuilt from their seeds) */
    unpack(o) {
      const s = Object.assign({}, o, { items: o.items.filter(it => A.skills[it.skillId]).map(it => Object.assign({}, it, { q: A.question(it.skillId, it.seed) })) });
      delete s.t;
      while (s.results.length < s.items.length) s.results.push(null);
      return s;
    },
    /** at the end of a unit test, one more question for each skill missed (once); returns how many were added */
    followUps(s) {
      if (!s.secondChance || s.followed || s.i + 1 < s.items.length) return 0;
      s.followed = true;
      const seen = new Set(s.items.map(it => A.normText(A.stripTags(it.q.prompt))));
      const missed = s.items.filter((it, k) => !ENGINE.counts(s.results[k]));
      missed.forEach((it, k) => { const x = distinctItems(it.skillId, `${s.seed}-again-${k}`, 1, seen)[0]; if (x) { s.items.push(Object.assign(x, { why: 'again' })); s.results.push(null); } });
      return missed.length;
    },
    /** record the learner's answer to the current question; returns the check result */
    answer(s, input) {
      const item = s.items[s.i];
      const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false });
      const res = A.check(item.q, input);
      if (!res.unreadable) r.tries += 1;
      if (res.correct) { r.correct = true; r.done = true; delete r.part; }
      else if (!res.unreadable) { const p = ENGINE.parts(item.q, input); if (p) { r.part = { right: p.right, of: p.of }; res.part = p; } else delete r.part; }
      return Object.assign(res, { firstTry: r.tries === 1 });
    },
    useHint(s) { const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false }); r.hinted = true; return r; },
    /** give up on the current question: it is shown, and counts as missed */
    reveal(s) { const r = s.results[s.i] || (s.results[s.i] = { tries: 0, hinted: false, correct: false, done: false, revealed: false }); r.revealed = true; r.hinted = true; r.done = true; return r; },
    /** did this question count as right, for mastery? first try, no hints */
    counts(r) { return !!(r && r.correct && r.tries === 1 && !r.hinted); },
    next(s) { if (s.i < s.items.length) s.i += 1; return s.i >= s.items.length; },
    isDone(s) { return s.kind === 'endless' ? !!s.stopped : s.i >= s.items.length; },

    /** apply the results: mastery levels, points, log, mistakes. Returns a summary. */
    finish(s) {
      if (s.finished) return s.finished;
      // a similar question asked for after a miss is an extra: its points count, and a miss goes to Review,
      // but it stays out of the score and the levels
      const total = s.items.filter(it => !it.extra).length;
      let right = 0, pts = 0, placed = null, extraRight = 0;
      const perSkill = {};
      s.items.forEach((it, k) => {
        const r = s.results[k] || { tries: 0, hinted: false, correct: false };
        const good = ENGINE.counts(r);
        if (good && !it.extra) right += 1;
        if (good && it.extra) extraRight += 1;
        // partly right (some places of an order, one coordinate of a point) earns a little
        pts += good ? POINTS.correct : (r.correct ? POINTS.hinted : (r.part && r.part.of ? Math.floor(POINTS.hinted * r.part.right / r.part.of) : 0));
        STORE.countAnswer(good);
        const sk = STORE.skill(it.skillId);
        STORE.setSkill(it.skillId, { tries: sk.tries + 1, right: sk.right + (good ? 1 : 0), last: Date.now() });
        // a missed question leaves Review after WINS_TO_CLEAR right answers; a placement guess isn't a mistake to review
        const was = STORE.get().missed.find(m => m.skill === it.skillId && m.seed === it.seed);
        if (good) { if (was && (was.wins || 0) + 1 < WINS_TO_CLEAR) was.wins = (was.wins || 0) + 1; else STORE.clearMissed(it.skillId, it.seed); }
        else if (s.kind !== 'placement' && (r.tries || r.revealed || !['quiz', 'boss', 'speed'].includes(s.kind))) {
          STORE.addMissed(it.skillId, it.seed, r.slip);
          const m = STORE.get().missed.find(x => x.skill === it.skillId && x.seed === it.seed);
          if (m) { m.wins = 0; if (r.said != null && String(r.said).trim()) m.said = String(r.said).slice(0, 60); }
        }
        if (!it.extra) (perSkill[it.skillId] = perSkill[it.skillId] || []).push(good);
      });
      const changes = [];
      const bump = (sid, to) => {
        const from = STORE.skill(sid).level;
        if (to === from) return;
        STORE.setSkill(sid, { level: to });
        changes.push({ skillId: sid, from, to });
        if (to > from) pts += POINTS.levelUp[to] || 0;
      };
      if (s.kind === 'practice') {
        const sk = STORE.skill(s.skillId);
        STORE.setSkill(s.skillId, { sets: sk.sets + 1 });
        STORE.touchRecent(s.skillId);
        const level = sk.level;
        if (right === total) bump(s.skillId, Math.max(level, 3));
        else if (right / total >= 0.7) bump(s.skillId, Math.max(level, 2));
        else bump(s.skillId, Math.max(level, 1));
        pts += Math.round(POINTS.set * Math.min(total, 10) / PRACTICE_N);          // a set of 5 or 10 earns in step
      } else if (s.kind === 'unit-test' || s.kind === 'course-challenge' || s.kind === 'mastery-challenge' || s.kind === 'chapter-test') {
        Object.keys(perSkill).forEach(sid => {
          const level = STORE.skill(sid).level, list = perSkill[sid];
          const good = list.every(Boolean);
          if (good) bump(sid, level < 2 ? 2 : Math.min(4, level + 1));
          else if (s.secondChance && list.length > 1 && list[list.length - 1]) bump(sid, Math.max(1, level));     // missed, then right on the second chance: it stays
          else bump(sid, Math.max(1, level - 1));
        });
        pts += s.kind === 'unit-test' || s.kind === 'chapter-test' ? POINTS.unitTest : (s.kind === 'course-challenge' ? POINTS.challenge : 0);
      } else if (s.kind === 'mix') {
        // like practice, spread over skills: every question of a skill right → at least Familiar; never lowers.
        // From unlimited practice, a few answers at a time: 3 or more of a skill, 70% right, for Familiar
        Object.keys(perSkill).forEach(sid => {
          const level = STORE.skill(sid).level, list = perSkill[sid];
          const familiar = s.endless ? list.length >= 3 && list.filter(Boolean).length / list.length >= 0.7 : list.every(Boolean);
          bump(sid, familiar ? Math.max(level, 2) : Math.max(level, 1));
          STORE.touchRecent(sid);
        });
        if (!s.partial) pts += POINTS.set;
      } else if (s.kind === 'daily') {
        // like a mix: a skill's questions all right → at least Familiar; never lowers
        Object.keys(perSkill).forEach(sid => {
          const level = STORE.skill(sid).level;
          if (perSkill[sid].every(Boolean)) bump(sid, Math.max(level, 2)); else if (!level) bump(sid, 1);
        });
        pts += POINTS.daily;
        STORE.markDaily();
      } else if (s.kind === 'placement') {
        // a skill answered right rises to Familiar; nothing is lowered. The first unit missed is where practice starts
        Object.keys(perSkill).forEach(sid => { const level = STORE.skill(sid).level; bump(sid, perSkill[sid].every(Boolean) ? Math.max(level, 2) : Math.max(level, 1)); });
        const byUnit = s.items.map((it, k) => ({ unitId: it.unitId, good: ENGINE.counts(s.results[k]) }));
        const miss = byUnit.find(x => !x.good);
        placed = { start: miss ? miss.unitId : null, known: byUnit.filter(x => x.good).map(x => x.unitId), at: Date.now() };
        STORE.setProfile({ placed: Object.assign({}, STORE.get().profile.placed, { [s.courseId]: placed }) });
        pts += POINTS.set;
      } else if (s.kind === 'testout') {
        // every question right on the first try: Proficient; otherwise nothing is lowered
        const level = STORE.skill(s.skillId).level;
        bump(s.skillId, right === total ? Math.max(level, 3) : Math.max(level, 1));
        STORE.touchRecent(s.skillId);
      } else if (s.kind === 'quiz' || s.kind === 'boss' || s.kind === 'speed') {
        // like a mixed set: a skill's questions all right → at least Familiar; never lowers
        Object.keys(perSkill).forEach(sid => { const level = STORE.skill(sid).level; if (perSkill[sid].every(Boolean)) bump(sid, Math.max(level, 2)); else if (!level) bump(sid, 1); });
        if (s.kind === 'boss') {
          s.beaten = !s.outOfLives && total - right < BOSS_LIVES;
          pts += POINTS.unitTest + (s.beaten ? 150 : 0);
          if (s.beaten) STORE.setProfile({ bosses: Object.assign({}, STORE.get().profile.bosses, { [s.courseId + '/' + s.unitId]: Date.now() }) });
        } else if (s.kind === 'speed') {
          const best = (STORE.get().profile.best || {})[s.skillId];
          s.newBest = !best || right > best.right || (right === best.right && s.ms < best.ms);
          if (s.newBest && s.ms) STORE.setProfile({ best: Object.assign({}, STORE.get().profile.best, { [s.skillId]: { right, total, ms: s.ms, at: Date.now() } }) });
          pts += POINTS.set;
        } else pts += POINTS.set;
      } else if (s.kind === 'weekly') {
        const r0 = s.results[0] || {};
        s.solved = !!r0.correct && !r0.revealed;
        if (s.solved) { pts += 100; STORE.setProfile({ weekly: Object.assign({}, STORE.get().profile.weekly, { [s.week]: { first: ENGINE.counts(r0), at: Date.now() } }) }); }
      } else if (s.kind === 'review') {
        // review changes no levels; a right answer counts toward clearing it from the list, which happened above
      }
      // spaced review: each skill seen gets its next date (a review never lowers a level)
      Object.keys(perSkill).forEach(sid => {
        const sk = STORE.skill(sid), list = perSkill[sid], ratio = list.filter(Boolean).length / list.length;
        if (s.kind === 'placement' && ratio < 1) return;          // not learned yet: nothing to review
        const gap = nextGap(sk.ivl || 0, ratio);
        STORE.setSkill(sid, { ivl: gap, due: STORE.dayShift(STORE.today(), gap) });
      });
      STORE.addPoints(pts);
      STORE.logEvent({ kind: s.kind, course: s.courseId, unit: s.unitId, skill: s.skillId || null, cpm: s.cpm || null, title: s.kind === 'mix' ? s.title : undefined, right, total, pts, changes });
      const extras = s.items.filter(it => it.extra).length;
      s.finished = { right, total, pts, changes, placed, beaten: s.beaten, newBest: s.newBest, solved: s.solved, extras, extraRight };
      return s.finished;
    },

    /** mastery summary for a list of skill ids */
    mastery(skillIds) {
      const counts = [0, 0, 0, 0, 0];
      let points = 0;
      skillIds.forEach(sid => { const l = STORE.skill(sid).level; counts[l] += 1; points += A.LEVEL_POINTS[l]; });
      const possible = skillIds.length * 100;
      return { counts, points, possible, pct: possible ? Math.round(points / possible * 100) : 0 };
    },
  };

  if (typeof module !== 'undefined') module.exports = ENGINE;
  if (typeof window !== 'undefined') window.ENGINE = ENGINE;
})();
