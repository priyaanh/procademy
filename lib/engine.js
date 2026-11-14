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
  const CHALLENGE_SET_N = 5;        // challenge questions in a set started from a skill page
  const CHALLENGE_CANDS = 12;       // a skill without a challenge maker: the hardest-looking of this many of its usual questions
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

  /** a challenge question for a skill: from the skill's own challenge(rng) maker where it has one (its seed is marked,
      so the question rebuilds the same from it anywhere), else the hardest-looking of CHALLENGE_CANDS of its usual
      questions. Either way it is checked with the skill's own verify() like any other question. */
  function challengeItem(skillId, seed, seen) {
    seen = seen || new Set();
    if (!A.hasChallenge(skillId)) return itemAt(skillId, seed, seen, 2, CHALLENGE_CANDS);
    let pick = null;
    for (let j = 0; j < CHALLENGE_CANDS && (!pick || seen.has(pick.key)); j++) {
      const sd = A.challengeSeed(j ? `${seed}~${j}` : seed), q = A.question(skillId, sd);
      pick = { skillId, seed: sd, q, key: A.normText(A.stripTags(q.prompt)) };
    }
    seen.add(pick.key);
    return { skillId, seed: pick.seed, q: pick.q };
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
    TESTOUT_N, WINS_TO_CLEAR, spread, weight, QUIZ_N, QUIZ_MIN, SPEED_N, BOSS_N, BOSS_LIVES, CHALLENGE_SET_N, challengeItem,
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

    /** kind: practice | testout | challenge | quiz | boss | speed | weekly | unit-test | course-challenge | placement |
        mastery-challenge | mix | daily | chapter-test | review | spot */
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
      } else if (kind === 'challenge') {
        // challenge questions: a short set of harder questions for one skill, with hints after a try (ENGINE.challengeItem)
        const def = A.skills[opts.skillId];
        if (!def) throw new Error('no skill ' + opts.skillId);
        s.skillId = opts.skillId;
        s.title = 'Challenge questions: ' + def.title;
        s.hints = true;
        const seen = new Set();
        for (let k = 0; k < Math.max(1, Math.min(15, Math.round(opts.n) || CHALLENGE_SET_N)); k++) s.items.push(challengeItem(opts.skillId, `${sessionSeed}-${k}`, seen));
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
        s.title = opts.title || 'Review your mistakes';
        s.items = spread(missed.map(m => ({ skillId: m.skill, seed: m.seed, q: A.question(m.skill, m.seed) })));
      } else if (kind === 'spot') {
        // spot the mistake: someone's worked steps with one wrong step, from skills the learner knows (ENGINE.spotQuestion)
        const ids = (opts.skills || []).filter(id => A.skills[id] && ENGINE.canSpot(id));
        if (!ids.length) throw new Error('nothing to check here yet');
        s.title = opts.title || 'Spot the mistake';
        s.hints = true; s.skills = ids;
        const n = opts.n || 5, order = rng.shuffle(ids);
        for (let k = 0; k < n * 3 && s.items.length < n; k++) {
          const sid = order[k % order.length], seed = `${sessionSeed}-${k}`, q = ENGINE.spotQuestion(sid, seed);
          if (q) s.items.push({ skillId: sid, seed, q, spot: true });
        }
        if (!s.items.length) throw new Error('nothing to check here yet');
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
      const o = { items: s.items.map(it => ({ skillId: it.skillId, seed: it.seed, why: it.why, unitId: it.unitId, lesson: it.lesson, skipped: it.skipped, extra: it.extra, spot: it.spot })), results: s.results.map(r => r && Object.assign({}, r)), t: Date.now() };
      keep.forEach(k => { if (s[k] !== undefined) o[k] = s[k]; });
      return JSON.parse(JSON.stringify(o));
    },
    /** a packed set, ready to carry on (its questions rebuilt from their seeds) */
    unpack(o) {
      const s = Object.assign({}, o, { items: o.items.filter(it => A.skills[it.skillId] && (!it.spot || ENGINE.spotQuestion(it.skillId, it.seed))).map(it => Object.assign({}, it, { q: it.spot ? ENGINE.spotQuestion(it.skillId, it.seed) : A.question(it.skillId, it.seed) })) });
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
        if (s.kind === 'spot') { pts += good ? POINTS.correct : r.correct ? POINTS.hinted : 0; STORE.countAnswer(good); return; }      // checking someone's work: points, but no levels and nothing to review
        if (good && it.extra) extraRight += 1;
        // partly right (some places of an order, one coordinate of a point) earns a little
        pts += good ? POINTS.correct : (r.correct ? POINTS.hinted : (r.part && r.part.of ? Math.floor(POINTS.hinted * r.part.right / r.part.of) : 0));
        STORE.countAnswer(good);
        const sk = STORE.skill(it.skillId);
        STORE.setSkill(it.skillId, { tries: sk.tries + 1, right: sk.right + (good ? 1 : 0), last: Date.now() });
        // a missed question leaves Review after WINS_TO_CLEAR right answers; a placement guess isn't a mistake to review
        const was = STORE.get().missed.find(m => m.skill === it.skillId && m.seed === it.seed);
        if (good) { if (was && (was.wins || 0) + 1 < WINS_TO_CLEAR) was.wins = (was.wins || 0) + 1; else { STORE.clearMissed(it.skillId, it.seed); if (was) ENGINE.noteFixed(it.skillId, it.seed); } }
        else if (s.kind !== 'placement' && (r.tries || r.revealed || !['quiz', 'boss', 'speed'].includes(s.kind))) {
          STORE.addMissed(it.skillId, it.seed, r.slip);
          const m = STORE.get().missed.find(x => x.skill === it.skillId && x.seed === it.seed);
          if (m) { m.wins = 0; m.last = Date.now(); if (s.seed) m.set = String(s.seed).slice(0, 40); if (r.said != null && String(r.said).trim()) m.said = String(r.said).slice(0, 60); }
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
      } else if (s.kind === 'challenge') {
        // challenge questions never lower a level: every one right on the first try, without hints, makes it at least Proficient
        const level = STORE.skill(s.skillId).level;
        bump(s.skillId, right === total ? Math.max(level, 3) : Math.max(level, 1));
        STORE.touchRecent(s.skillId);
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
      ENGINE.keepSet(s);
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

  /* ---------- reading an answer, and what to say when it can't be read ----------
     Before a number answer is checked: "x = 5" is read as 5, a unit typed after the number is taken off (or, when
     it's the wrong unit, that is said plainly), ½ is read as 1/2, and a comma used as a decimal point is pointed
     out. An answer that still isn't a number gets a tip in the format to use. None of it ever says the answer. */
  const escH = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  /** question HTML as flat text for matching: fractions as p/q, powers as ^n, entities read */
  function flat(html) {
    return String(html || '')
      .replace(/<span class="frac"><span class="num">([^<]*)<\/span><span class="den">([^<]*)<\/span><\/span>/g, ' $1/$2 ')
      .replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]*>/g, ' ')
      .replace(/&minus;/g, '−').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ').trim();
  }
  const VULGAR = { '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4', '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5', '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8' };
  /** units: key, how it's written, its name, what it measures, and its size in that measure's base unit */
  const UNITS = [
    ['mm', /^(mm|millimet(er|re)s?)$/, 'millimeters', 'length', 0.001], ['cm', /^(cm|centimet(er|re)s?)$/, 'centimeters', 'length', 0.01], ['m', /^(m|met(er|re)s?)$/, 'meters', 'length', 1],
    ['km', /^(km|kilomet(er|re)s?)$/, 'kilometers', 'length', 1000], ['in', /^(in|inch|inches|")$/, 'inches', 'length', 0.0254], ['ft', /^(ft|foot|feet|')$/, 'feet', 'length', 0.3048],
    ['yd', /^(yds?|yards?)$/, 'yards', 'length', 0.9144], ['mi', /^(mi|miles?)$/, 'miles', 'length', 1609.344],
    ['mg', /^(mg|milligrams?)$/, 'milligrams', 'mass', 0.001], ['g', /^(g|grams?)$/, 'grams', 'mass', 1], ['kg', /^(kg|kilograms?|kilos?)$/, 'kilograms', 'mass', 1000],
    ['oz', /^(oz|ounces?)$/, 'ounces', 'mass', 28.349523125], ['lb', /^(lbs?|pounds?)$/, 'pounds', 'mass', 453.59237],
    ['ml', /^(ml|millilit(er|re)s?)$/, 'milliliters', 'volume', 0.001], ['l', /^(l|lit(er|re)s?)$/, 'liters', 'volume', 1], ['gal', /^(gal|gallons?)$/, 'gallons', 'volume', 3.785411784],
    ['s', /^(s|secs?|seconds?)$/, 'seconds', 'time', 1], ['min', /^(mins?|minutes?)$/, 'minutes', 'time', 60], ['h', /^(h|hrs?|hours?)$/, 'hours', 'time', 3600],
    ['day', /^days?$/, 'days', 'time', 86400], ['week', /^(wks?|weeks?)$/, 'weeks', 'time', 604800],
    ['°', /^(°|deg|degrees?)$/, 'degrees', 'angle', 1], ['$', /^(\$|dollars?)$/, 'dollars', 'money', 1], ['¢', /^(¢|cents?)$/, 'cents', 'money', 0.01], ['%', /^(%|percent)$/, 'percent', 'percent', 1],
  ];
  const isUnit = t => UNITS.some(u => u[1].test(t));
  /** what a written unit is: { key, known, name, dim, f } (cm², sq cm and square centimeters are all cm²) */
  function unitKey(str) {
    let t = String(str || '').trim().toLowerCase().replace(/\.$/, '').replace(/\s+/g, ' '), pow = '', m;
    if (!t) return null;
    if (t === 'mph') return { key: 'mi/h', known: true, name: 'miles per hour' };
    if ((m = /^(.+?) ?(?:\/| per ) ?(.+)$/.exec(t)) && !/^sq/.test(t)) { const a = unitKey(m[1]), b = unitKey(m[2]); return a && b ? { key: a.key + '/' + b.key, known: a.known && b.known, name: `${a.name} per ${String(b.name).replace(/s$/, '')}` } : null; }
    if ((m = /^(?:sq\.?|square) (.+)$/.exec(t))) { t = m[1]; pow = '²'; }
    else if ((m = /^cubic (.+)$/.exec(t))) { t = m[1]; pow = '³'; }
    else if ((m = /^(.+?) ?(?:\^2|2|²| squared)$/.exec(t)) && isUnit(m[1])) { t = m[1]; pow = '²'; }
    else if ((m = /^(.+?) ?(?:\^3|3|³| cubed)$/.exec(t)) && isUnit(m[1])) { t = m[1]; pow = '³'; }
    const u = UNITS.find(x => x[1].test(t)), k = pow === '²' ? 2 : pow === '³' ? 3 : 1;
    if (u) return { key: u[0] + pow, known: true, name: (pow === '²' ? 'square ' : pow === '³' ? 'cubic ' : '') + u[2], dim: u[3] + pow, f: Math.pow(u[4], k), base: u[0], pow };
    return { key: t.replace(/s$/, '') + pow, known: false, name: t };
  }
  /** a typed unit that doesn't match the question's, said plainly (never counted as a try) */
  function unitStop(want, got) {
    if (want.base && want.base === got.base && want.pow !== got.pow) {
      const what = want.pow === '²' ? 'an area, so it’s in square units' : want.pow === '³' ? 'a volume, so it’s in cubic units' : 'a length, so it isn’t in square or cubic units';
      return `You wrote <b>${escH(got.key)}</b>, but this answer is ${what}: <b>${escH(want.key)}</b>. Type just the number; the unit is already beside the box.`;
    }
    if (want.dim && want.dim === got.dim) return `This question asks for <b>${escH(want.name)}</b>, and you wrote <b>${escH(got.name)}</b>. Change your answer to ${escH(want.name)}, then type just the number.`;
    return `This question asks for <b>${escH(want.name)}</b>, not ${escH(got.name)}. Type just the number; the unit is already beside the box.`;
  }
  /** a number answer as typed, made ready to check: { input } to check, or { stop } to say first (not a try) */
  function readAnswer(q, raw) {
    let t = String(raw == null ? '' : raw).trim().replace(/[–—]/g, '−').replace(/\s+/g, ' ');
    if (!q || q.type !== 'number') return { input: t };
    t = t.replace(/(\d) ?([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])/g, '$1 $2').replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, c => VULGAR[c]);
    if (/^[−-]?\d+,\d{1,2}$/.test(t)) return { stop: `Use a point for a decimal: <b>${escH(t.replace(',', '.'))}</b>, not ${escH(t)}. A comma only groups thousands, like 1,250.` };
    const asg = /^([a-z])\s*=\s*(.+)$/i.exec(t);
    if (asg && !isNaN(A.parseNumber(asg[2]))) return { input: asg[2].trim() };
    if (!isNaN(A.parseNumber(t))) return { input: t };
    const m = /^([−-]?\$?(?:\d[\d,]*(?:\.\d+)?|\.\d+)(?: \d+\/\d+|\s*\/\s*\d+(?:\.\d+)?)?)\s*([a-z°$%¢"'][a-z°²³ .\/^\d]*)$/i.exec(t);
    if (!m || isNaN(A.parseNumber(m[1])) || /^[a-z]\s*\d/i.test(m[2])) return { input: t };
    const got = unitKey(m[2]), want = q.unit ? unitKey(q.unit) : null;
    if (!got) return { input: t };
    if (want && want.known && got.known && got.key !== want.key) return { stop: unitStop(want, got) };
    if (!got.known && m[2].replace(/[^a-z]/gi, '').length < 3) return { input: t };          // a stray letter or two is not a unit
    return { input: m[1], unit: !!(want && got.key === want.key) };
  }
  /** what format to use, for an answer that still isn't a number */
  function formatTip(q, raw) {
    const t = String(raw || '').trim();
    if (/^[a-z\s-]+$/i.test(t)) return 'Type the number with digits, like <b>7</b>, not in words.';
    if (/[=<>≤≥]/.test(t)) return 'Type just the number, without an equals or inequality sign.';
    if (/\/[^/]*\//.test(t)) return 'Use one slash for a fraction, like <b>3/4</b>, or a mixed number like <b>1 1/2</b>.';
    if (/^\/|\/\s*$/.test(t)) return 'A fraction needs a top and a bottom number, like <b>3/4</b>.';
    if (/\d\s*:\s*\d/.test(t)) return 'Write a ratio as a fraction, like <b>3/4</b>, or work it out to one number.';
    if (/\d\s*[x×*·÷+]\s*[\d(]|\d\s+[−-]\s*\d|\)\s*[\d(]|\d\s*\(/.test(t)) return 'Work it out to one number first, like <b>12</b>. The box takes a single number.';
    if (/^[−-]?\d[\d.]*\s+[\d.]+$/.test(t)) return 'There’s a space between two numbers. Write one number, like <b>34</b>, or a mixed number with a slash, like <b>3 1/4</b>.';
    if (/[a-z]/i.test(t)) return q && q.unit ? `Type just the number. The unit, <b>${escH(q.unit)}</b>, is already beside the box.` : 'Type just the number, without letters or words.';
    return 'That doesn’t look like a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.';
  }
  /** a right fraction that isn't in simplest form: what it simplifies to, said kindly ('' when it's already simple) */
  function simplifyNote(q, typed) {
    const t = String(typed || '').trim().replace(/−/g, '-');
    let m = /^(-?)(\d+) (\d+)\/(\d+)$/.exec(t), whole = 0, n, d;
    if (m) { whole = +m[2]; n = +m[3]; d = +m[4]; } else if ((m = /^(-?)(\d+)\s*\/\s*(\d+)$/.exec(t))) { n = +m[2]; d = +m[3]; } else return '';
    const g = gcd(n, d);
    if (!d || g <= 1) return '';
    const sign = m[1] ? '−' : '', sn = n / g, sd = d / g;
    const simple = sd === 1 ? sign + (whole + sn) : `${sign}${whole ? whole + ' ' : ''}${sn}/${sd}`;
    const asks = /simplest|lowest terms|simplify/i.test(flat(q && q.prompt));
    return `${escH(sign + (whole ? whole + ' ' : '') + n + '/' + d)} simplifies to <b>${simple}</b>: divide the top and the bottom by ${g}. ${asks ? 'This question asks for simplest form, so simplify before you check next time.' : 'Simplest form is usually what’s expected.'}`;
  }

  /* ---------- building hints: the rule, the lesson paragraph a step uses, simpler words, a picture ---------- */
  const BLOCK = /^(p|div|ul|ol|table|figure|svg|h[1-6]|blockquote|details|section)$/i;
  /** a lesson's top-level blocks (paragraphs, examples, lists), as HTML */
  function blocksOf(html) {
    const s = String(html || ''), out = [], re = /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/gi;
    let depth = 0, from = 0, m;
    while ((m = re.exec(s))) {
      if (!BLOCK.test(m[2]) || /\/>$/.test(m[0])) continue;
      if (m[1]) { if (depth > 0 && --depth === 0) { out.push(s.slice(from, re.lastIndex)); from = re.lastIndex; } }
      else { if (depth === 0) { const loose = s.slice(from, m.index).trim(); if (loose) out.push(loose); from = m.index; } depth++; }
    }
    const rest = s.slice(from).trim();
    if (rest) out.push(rest);
    return out.filter(b => /[a-z0-9]/i.test(flat(b)));
  }
  /** the rule a skill uses, as HTML: its own rule if the content gives one, else the lesson's first paragraph
      with a rule in bold, else its first short paragraph */
  function ruleOf(sid) {
    const def = A.skills[sid];
    if (!def) return null;
    if (def.rule) return def.rule;
    const bl = blocksOf(def.learn).filter(b => /^<p\b/i.test(b)), len = b => flat(b).length;
    const pick = bl.find(b => /<(b|strong)>/.test(b) && len(b) >= 20 && len(b) <= 340) || bl.find(b => len(b) >= 20 && len(b) <= 340);
    return pick ? pick.replace(/^<p\b[^>]*>|<\/p>$/gi, '').trim() : null;
  }
  const STOPW = new Set('the and for are was were its you your not but has have had can get put use this that then than with from into onto each what which when where how there their these those both all any more most less same step steps answer number numbers equal equals is it of to in on by as at be or so we an a one two three four five six seven eight nine ten first next last now also just only like make makes made way find work out side sides left right'.split(' '));
  const stemW = w => w.replace(/(ing|ed|es|s)$/, '');
  const wordsOf = html => new Set((flat(html).toLowerCase().match(/[a-z]{3,}/g) || []).filter(w => !STOPW.has(w)).map(stemW).filter(w => w.length >= 3));
  /** the lesson paragraph a hint uses: the block sharing the most key words with it (two at least), or null; a block
      already on screen (avoid, such as the rule) is passed over */
  function lessonFor(sid, hintHtml, avoid) {
    const def = A.skills[sid];
    if (!def || !def.learn) return null;
    const want = wordsOf(hintHtml);
    if (want.size < 2) return null;
    let best = null;
    blocksOf(def.learn).forEach((b, k) => {
      if (/^<(svg|table|figure)\b/i.test(b) || (avoid && flat(b) === flat(avoid))) return;
      const got = wordsOf(b);
      let n = 0; want.forEach(w => { if (got.has(w)) n += 1; });
      if (n >= 2 && (!best || n > best.n)) best = { k, html: b, n };
    });
    return best;
  }
  /* simpler words: hard words get a short meaning in parentheses (the first time), long words get short ones, and a
     sentence joined by "; " or ", so" is split in two. Only the words between the tags change, so math stays as it is. */
  const GLOSS = [
    ['denominator', 'the bottom number'], ['numerator', 'the top number'], ['quotient', 'the answer to a division'], ['product', 'the answer to a multiplication'],
    ['sum', 'the answer to an addition'], ['difference', 'the answer to a subtraction'], ['coefficient', 'the number in front of the letter'], ['reciprocal', 'the fraction flipped upside down'],
    ['absolute value', 'the distance from zero'], ['perimeter', 'the distance all the way around'], ['circumference', 'the distance around a circle'], ['radius', 'from the center to the edge'],
    ['diameter', 'all the way across, through the center'], ['equivalent', 'equal in value'], ['exponent', 'the small raised number'], ['variable', 'the letter that stands for a number'],
    ['integer', 'a whole number or its negative'], ['unit rate', 'the amount for one'], ['median', 'the middle value, in order'], ['the mean', 'the average'], ['hypotenuse', 'the longest side, across from the right angle'],
    ['like terms', 'terms with the same letter part'], ['distributive property', 'multiply the outside number by each part inside the parentheses'], ['inverse operation', 'the opposite operation'],
    ['slope', 'how steep the line is'], ['y-intercept', 'where the line crosses the y-axis'], ['probability', 'how likely it is, from 0 to 1'], ['proportion', 'two equal ratios'], ['isolate', 'get it on its own'],
    ['evaluate', 'work out the value'], ['a factor', 'a number that divides it evenly'], ['a multiple', 'a number in its times table'], ['prime number', 'only 1 and itself divide it'],
  ].map(([w, m]) => [new RegExp(`\\b(${w.replace(/ /g, '\\s+')})(s|es)?\\b(?!\\s*\\()`, 'i'), m]);
  const SWAPS = [[/\btherefore\b/gi, 'so'], [/\bthus\b/gi, 'so'], [/\bhence\b/gi, 'so'], [/\bdetermine\b/gi, 'find'], [/\bcalculate\b/gi, 'work out'], [/\bcompute\b/gi, 'work out'],
    [/\bobtain\b/gi, 'get'], [/\bapproximately\b/gi, 'about'], [/\bsubsequently\b/gi, 'then'], [/\bin order to\b/gi, 'to'], [/\bremaining\b/gi, 'left'], [/\bcorresponding\b/gi, 'matching'],
    [/\bindicates\b/gi, 'shows'], [/\brepresents\b/gi, 'stands for'], [/\bis equal to\b/gi, 'is'], [/\bequivalent to\b/gi, 'the same as'], [/\bsufficient\b/gi, 'enough'], [/\butilize\b/gi, 'use'],
    [/\bconsequently\b/gi, 'so'], [/\badditionally\b/gi, 'also'], [/\bnevertheless\b/gi, 'still'], [/\bsimplify\b/gi, 'make it simpler']];
  const keepCase = (from, to) => (/^[A-Z]/.test(from) ? to[0].toUpperCase() + to.slice(1) : to);
  function simpler(html) {
    const parts = String(html || '').split(/(<[^>]*>)/), used = new Set();
    let inSvg = 0;
    const out = parts.map(p => {
      if (p.startsWith('<')) { if (/^<svg\b/i.test(p)) inSvg++; else if (/^<\/svg/i.test(p)) inSvg--; return p; }
      if (inSvg || !p.trim()) return p;
      let t = p;
      SWAPS.forEach(([re, to]) => { t = t.replace(re, w => keepCase(w, to)); });
      GLOSS.forEach(([re, meaning], k) => { if (used.has(k)) return; t = t.replace(re, w => { used.add(k); return `${w} (${meaning})`; }); });
      return t.replace(/;\s+(\S)/g, (_, c) => `.<br>${c.toUpperCase()}`).replace(/,\s+(so|then)\s+(\S)/gi, (_, w, c) => `.<br>${w[0].toUpperCase()}${w.slice(1)} ${c}`);
    }).join('');
    return out;
  }

  /* ---------- pictures for hints: a number line, an area model, fraction bars, a percent bar ----------
     Drawn only when the question's numbers give exactly its answer, so a picture always fits the question. */
  const numOf = t => Number(String(t).replace(/[()]/g, '').replace(/−/g, '-'));
  const mdlText = (x, y, t, cls, extra) => `<text x="${x}" y="${y}" text-anchor="middle"${cls ? ` class="${cls}"` : ''}${extra || ''}>${escH(t)}</text>`;
  const signed = v => (v < 0 ? '−' + Math.abs(v) : String(v));
  function lineModel(a, op, b) {
    const move = op === '+' ? b : -b, end = a + move, lo = Math.min(0, a, end) - 2, hi = Math.max(0, a, end) + 2, span = hi - lo;
    if (span > 44) return null;
    const W = 380, pad = 20, u = (W - 2 * pad) / span, X = v => +(pad + (v - lo) * u).toFixed(1), every = span > 24 ? 5 : span > 12 ? 2 : 1;
    let svg = `<line x1="${pad - 8}" y1="70" x2="${W - pad + 8}" y2="70" class="mdl-axis"/>`;
    for (let v = lo; v <= hi; v++) {
      const big = v % every === 0 || v === a;
      svg += `<line x1="${X(v)}" y1="${big ? 63 : 66}" x2="${X(v)}" y2="${big ? 77 : 74}" class="mdl-tick"/>`;
      if (v % every === 0 || v === a) svg += mdlText(X(v), 94, signed(v), v === 0 ? 'mdl-zero' : '');
    }
    const mid = (X(a) + X(end)) / 2, dir = move > 0 ? 1 : -1;
    svg += `<path d="M${X(a)} 62 Q${mid} ${Math.max(8, 62 - Math.abs(move) * u * 0.45)} ${X(end)} 62" class="mdl-jump"/><path d="M${X(end)} 62 l${-dir * 8} -7 m${dir * 8} 7 l${-dir * 2} -10" class="mdl-jump"/>`;
    svg += `<circle cx="${X(a)}" cy="70" r="6" class="mdl-on"/>` + mdlText(mid, Math.max(18, 56 - Math.abs(move) * u * 0.25), (move > 0 ? '+' : '−') + Math.abs(move), 'mdl-lab');
    const said = op === '+' ? (b < 0 ? `Adding ${signed(b)} moves ${Math.abs(b)} to the left.` : `Adding ${b} moves ${b} to the right.`) : (b < 0 ? `Subtracting ${signed(b)} is adding ${Math.abs(b)}: move ${Math.abs(b)} to the right.` : `Subtracting ${b} moves ${b} to the left.`);
    return { kind: 'line', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} 104" role="img" aria-label="A number line from ${signed(lo)} to ${signed(hi)}, starting at ${signed(a)}, with a jump of ${Math.abs(move)} to the ${move > 0 ? 'right' : 'left'}">${svg}</svg>`, caption: `Start at ${signed(a)}. ${said}` };
  }
  const placeParts = n => { const out = []; let p = 1; while (n > 0) { const d = n % 10; if (d) out.unshift(d * p); n = Math.floor(n / 10); p *= 10; } return out; };
  function areaModel(a, b) {
    const pa = placeParts(a), pb = placeParts(b);
    if (pa.length * pb.length > 6 || pa.length * pb.length < 2) return null;
    const W = 360, left = 40, top = 30, H = pb.length > 1 ? 140 : 72, w = W - left - 8;
    const share = (parts, len) => { const tot = parts.reduce((x, y) => x + Math.max(y, parts[0] / 3), 0); let at = 0; return parts.map(p => { const s = Math.max(p, parts[0] / 3) / tot * len, r = [at, s]; at += s; return r; }); };
    const xs = share(pa, w), ys = share(pb, H);
    let svg = '';
    pa.forEach((p, i) => { svg += mdlText(left + xs[i][0] + xs[i][1] / 2, 20, String(p), 'mdl-lab'); });
    pb.forEach((p, j) => { svg += mdlText(left - 12, top + ys[j][0] + ys[j][1] / 2 + 5, String(p), 'mdl-lab', ' text-anchor="end"'); });
    pa.forEach((p, i) => pb.forEach((r, j) => {
      svg += `<rect x="${(left + xs[i][0]).toFixed(1)}" y="${(top + ys[j][0]).toFixed(1)}" width="${xs[i][1].toFixed(1)}" height="${ys[j][1].toFixed(1)}" class="mdl-cell${(i + j) % 2 ? ' alt' : ''}"/>`;
      svg += mdlText(left + xs[i][0] + xs[i][1] / 2, top + ys[j][0] + ys[j][1] / 2 + 5, `${p} × ${r}`, 'mdl-in');
    }));
    return { kind: 'area', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} ${top + H + 6}" role="img" aria-label="An area model for ${a} × ${b}: ${pa.join(' + ')} across and ${pb.join(' + ')} down">${svg}</svg>`, caption: `Split ${a}${pb.length > 1 ? ` and ${b}` : ''} by place value. Work out each box, then add the boxes together.` };
  }
  function barRow(y, parts, shaded, light, label, W, x0) {
    const w = (W - x0 - 8) / parts;
    let s = '';
    for (let k = 0; k < parts; k++) s += `<rect x="${(x0 + k * w).toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="30" class="mdl-cell${k < shaded ? ' on' : k < shaded + light ? ' on2' : ''}"/>`;
    return s + (label ? mdlText(x0 - 10, y + 20, label, 'mdl-lab', ' text-anchor="end"') : '');
  }
  function fractionModel(p, q, op, r, t) {
    const W = 360, x0 = 56;
    if (q === t) {
      if (op === '+' && p + r > q) return null;
      const svg = op === '+' ? barRow(10, q, p, r, '', W, x0) : barRow(10, q, p - r, r, '', W, x0);
      return { kind: 'bars', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} 50" role="img" aria-label="A bar split into ${q} equal parts">${svg}</svg>`, caption: op === '+' ? `The bar is split into ${q} equal parts. ${p} parts and ${r} more: count the shaded parts.` : `The bar is split into ${q} equal parts. Start with ${p} and take away the ${r} lighter ones.` };
    }
    const lcd = q * t / gcd(q, t);
    if (lcd > 24) return null;
    const svg = barRow(8, lcd, p * lcd / q, 0, `${p}/${q}`, W, x0) + barRow(48, lcd, 0, r * lcd / t, `${r}/${t}`, W, x0);
    return { kind: 'bars', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} 86" role="img" aria-label="Two bars, each split into ${lcd} equal parts">${svg}</svg>`, caption: `Split both bars into ${lcd} equal parts. Now ${p}/${q} is ${p * lcd / q}/${lcd} and ${r}/${t} is ${r * lcd / t}/${lcd}, so the parts are the same size.` };
  }
  function partOfModel(p, q, n) {
    const W = 360, x0 = 12;
    const svg = mdlText(W / 2, 14, `${n} in all`, 'mdl-lab') + `<path d="M${x0} 26 v-6 H${W - 8} v6" class="mdl-axis"/>` + barRow(30, q, p, 0, '', W, x0);
    return { kind: 'bars', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} 70" role="img" aria-label="A bar of ${n} split into ${q} equal parts, ${p} shaded">${svg}</svg>`, caption: `The whole bar is ${n}, split into ${q} equal parts. Find one part (${n} ÷ ${q}), then take ${p} of them.` };
  }
  function percentModel(x, y, money) {
    if (!(x > 0 && x <= 200)) return null;
    const W = 360, x0 = 12, w = W - x0 - 8, tens = Math.min(x, 100) / 10;
    let svg = '';
    for (let k = 0; k < 10; k++) svg += `<rect x="${(x0 + k * w / 10).toFixed(1)}" y="26" width="${(w / 10).toFixed(1)}" height="30" class="mdl-cell${k + 1 <= tens ? ' on' : k < tens ? ' on2' : ''}"/>`;
    svg += mdlText(x0, 18, '0%', 'mdl-lab', ' text-anchor="start"') + mdlText(W - 8, 18, '100%', 'mdl-lab', ' text-anchor="end"') + mdlText(x0 + w / 10 / 2, 76, '10%', 'mdl-in');
    svg += mdlText(x0, 76, '0', 'mdl-lab', ' text-anchor="start"') + mdlText(W - 8, 76, (money ? '$' : '') + y, 'mdl-lab', ' text-anchor="end"');
    return { kind: 'percent', svg: `<svg class="mdl-svg" viewBox="0 0 ${W} 84" role="img" aria-label="A percent bar: 100% is ${(money ? '$' : '') + y}, in ten parts of 10%">${svg}</svg>`, caption: `The whole bar is 100%, which is ${(money ? '$' : '') + y}. Each of the ten parts is 10%, so one part is ${(money ? '$' : '') + y} ÷ 10. ${x}% is ${x / 10} of those parts.` };
  }
  /** a picture that fits this question, or null: { kind, svg, caption } */
  function modelFor(q) {
    if (!q || q.type !== 'number' || !isFinite(q.answer)) return null;
    const t = flat(q.prompt).replace(/(\d),(?=\d{3}\b)/g, '$1'), A0 = q.answer, near = (x, y) => Math.abs(x - y) < 1e-9 * Math.max(1, Math.abs(y));
    let m = /(?:^|[^\d.\/^])([−-]?\d+) ([+−]) (\(?[−-]?\d+\)?)(?: = \?|\?)/.exec(t);
    if (m) { const a = numOf(m[1]), b = numOf(m[3]), op = m[2] === '+' ? '+' : '−'; if ((a < 0 || b < 0) && Math.abs(a) <= 25 && Math.abs(b) <= 25 && near(op === '+' ? a + b : a - b, A0)) return lineModel(a, op, b); }
    m = /(?:^|[^\d.\/^])(\d+) × (\d+)(?![\d.\/^])/.exec(t);
    if (m && (t.match(/×/g) || []).length === 1 && !/[+−÷]\s*\d/.test(t.replace(m[0], ''))) { const a = +m[1], b = +m[2], big = Math.max(a, b), small = Math.min(a, b); if (small >= 2 && big >= 10 && big <= 999 && small <= 99 && near(a * b, A0)) return areaModel(big, small); }
    m = /(?:^|[^\d.\/])(\d+)\/(\d+) ([+−]) (\d+)\/(\d+)(?![\d.\/])/.exec(t);
    if (m) { const [p, q2, r, s2] = [+m[1], +m[2], +m[4], +m[5]], op = m[3]; if (q2 <= 12 && s2 <= 12 && p < q2 && r < s2 && near(op === '+' ? p / q2 + r / s2 : p / q2 - r / s2, A0) && (op === '+' || p / q2 > r / s2)) return fractionModel(p, q2, op, r, s2); }
    m = /(?:^|[^\d.\/])(\d+)\/(\d+) of (?:the )?\$?(\d+)(?![\d.\/])/.exec(t);
    if (m) { const [p, q2, n] = [+m[1], +m[2], +m[3]]; if (q2 >= 2 && q2 <= 12 && p < q2 && n % q2 === 0 && near(p * n / q2, A0)) return partOfModel(p, q2, n); }
    m = /(\d+(?:\.\d+)?)% of (\$?)(\d+(?:\.\d+)?)/.exec(t);
    if (m) { const x = +m[1], y = +m[3]; if (near(x * y / 100, A0)) return percentModel(x, y, !!m[2] || q.unit === '$'); }
    return null;
  }

  /* ---------- spot the mistake: someone's worked steps for a question, with one step changed to a wrong number ----------
     Only a step that says something checkable (a + b = c, with the numbers right there) is changed, so the wrong
     step can always be found by working it out. */
  const ARITH = /(?<![\d.\/^])(\(?[−-]?\d+(?:\.\d+)?\)?) ([+−×÷]) (\(?[−-]?\d+(?:\.\d+)?\)?) = ([−-]?\d+(?:\.\d+)?)(?![\d.\/^])/g;
  const calc = (a, op, b) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b);
  const escRe = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function spotQuestion(sid, seed) {
    if (!A.skills[sid]) return null;
    let base;
    try { base = A.question(sid, seed); } catch (e) { return null; }
    if (base.type !== 'number' || base.hints.length < 2 || base.hints.length > 6 || /<svg/i.test(base.hints.join(''))) return null;
    const cands = [];
    base.hints.forEach((h, k) => {
      const t = flat(h).replace(/(\d),(?=\d{3}\b)/g, '$1');
      for (const m of t.matchAll(ARITH)) {
        const a = numOf(m[1]), b = numOf(m[3]), c = numOf(m[4]), v = calc(a, m[2], b);
        if (!isFinite(v) || Math.abs(v - c) > 1e-9 * Math.max(1, Math.abs(c))) continue;
        const shown = m[4], pat = new RegExp(`(=\\s*(?:<b>)?\\s*)(${escRe(shown).replace(/[−-]/g, '[−-]')})(?![\\d.,])`, 'g');
        if ((h.match(pat) || []).length !== 1) continue;
        cands.push({ k, lhs: `${m[1]} ${m[2]} ${m[3]}`, c, shown, pat });
      }
    });
    if (!cands.length) return null;
    const rng = RNG.make('spot:' + sid + ':' + seed), pick = rng.pick(cands);
    const dec = (pick.shown.split('.')[1] || '').length, unit = dec ? Math.pow(10, -dec) : 1;
    const wrongs = [pick.c + unit, pick.c - unit, pick.c !== 0 ? -pick.c : pick.c + 2 * unit, pick.c + 10 * unit].map(w => +w.toFixed(dec)).filter(w => w !== pick.c);
    const w = rng.pick(wrongs), wTxt = (w < 0 ? '−' : '') + Math.abs(w).toFixed(dec);
    const steps = base.hints.map((h, k) => (k === pick.k ? h.replace(pick.pat, `$1${wTxt}`) : h));
    const choices = steps.map((h, k) => `Step ${k + 1}`);
    return {
      prompt: `<p class="spot-lead">Someone worked out this question, and one step has a mistake. Which step is it?</p><div class="spot-q">${base.prompt}</div><ol class="spot-steps">${steps.map(h => `<li>${h}</li>`).join('')}</ol>`,
      type: 'choice', choices, answer: choices[pick.k], answerIndex: pick.k, keepOrder: true, skillId: sid, seed, spot: true, params: { kind: 'spot', step: pick.k },
      hints: ['Check each step on its own: work out the left side of each equals sign, and compare it with the right side.', `Look closely at the numbers in step ${pick.k + 1}.`, `Step ${pick.k + 1} says ${escH(pick.lhs)} = ${wTxt}, but ${escH(pick.lhs)} = ${pick.shown}. The mistake is in <b>step ${pick.k + 1}</b>.`],
    };
  }

  /* ---------- mistakes kept over time: fixed this week, notes and tags, sets to retry, and an archive ---------- */
  const DAYMS = 864e5, ARCHIVE_DAYS = 60;
  const prof = () => STORE.get().profile;
  const keyOf = (skill, seed) => skill + '|' + seed;

  Object.assign(ENGINE, {
    flat, unitKey, readAnswer, formatTip, simplifyNote, blocksOf, ruleOf, lessonFor, simpler, model: modelFor, spotQuestion, ARCHIVE_DAYS,
    /** can this skill make spot-the-mistake questions? (a few seeds are tried; the answer is kept) */
    canSpot(sid) {
      const c = ENGINE._spotOk || (ENGINE._spotOk = {});
      if (!(sid in c)) c[sid] = ['a', 'b', 'c', 'd'].some(x => !!spotQuestion(sid, 'probe-' + x));
      return c[sid];
    },
    /** a missed question was fixed (right twice, or "I understand now"): counted for "fixed this week", and its journal entry marked */
    noteFixed(skill, seed) {
      const p = prof(), now = Date.now(), list = (p.fixedLog || []).filter(x => Array.isArray(x) && now - x[0] < ARCHIVE_DAYS * DAYMS);
      const patch = { fixedLog: [[now, skill, seed]].concat(list).slice(0, 300) }, j = p.mjournal || {}, key = keyOf(skill, seed);
      if (j[key]) patch.mjournal = Object.assign({}, j, { [key]: Object.assign({}, j[key], { fixed: now }) });
      STORE.setProfile(patch);
    },
    /** how many mistakes were fixed since a time (default: since Monday) */
    fixedSince(t) { const from = t != null ? t : new Date(ENGINE.weekOf() + 'T00:00').getTime(); return (prof().fixedLog || []).filter(x => Array.isArray(x) && x[0] >= from).length; },
    /** the learner's own note and tag on a mistake (why: 'careless' or 'unknown'); patch null removes it */
    journal(skill, seed, patch) {
      const j = Object.assign({}, prof().mjournal || {}), key = keyOf(skill, seed);
      if (patch === undefined) return j[key] || null;
      if (patch === null) delete j[key];
      else {
        const m = STORE.get().missed.find(x => x.skill === skill && x.seed === seed) || {};
        const e = Object.assign({ skill, seed }, j[key], m.said ? { said: m.said } : {}, patch, { t: Date.now() });
        if (!e.note && !e.why) delete j[key]; else j[key] = e;
      }
      const keep = Object.entries(j).sort((x, y) => (y[1].t || 0) - (x[1].t || 0)).slice(0, 150);
      STORE.setProfile({ mjournal: Object.fromEntries(keep) });
      return j[key] || null;
    },
    /** every journal entry, newest first */
    journalAll() { return Object.values(prof().mjournal || {}).filter(e => e && A.skills[e.skill]).sort((x, y) => (y.t || 0) - (x.t || 0)); },
    /** a finished set with misses is kept (the last five) so the whole set can be tried again */
    keepSet(s) {
      if (!s || s.endless || ['review', 'spot', 'placement', 'weekly', 'testout'].includes(s.kind)) return;
      const items = s.items.filter(it => !it.extra && !it.spot), miss = s.items.filter((it, k) => !it.extra && !ENGINE.counts(s.results[k])).length;
      if (!miss || items.length < 2) return;
      const entry = { seed: String(s.seed), kind: s.kind, title: String(s.title || '').slice(0, 80), skillId: s.skillId || null, n: items.length, miss, t: Date.now(), items: items.map(it => [it.skillId, it.seed]) };
      STORE.setProfile({ missedSets: [entry].concat((prof().missedSets || []).filter(x => x && x.seed !== entry.seed)).slice(0, 5) });
    },
    /** a kept set, ready to try again: a practice set as itself (it counts), anything else as review of the same questions */
    retrySet(seed) {
      const e = (prof().missedSets || []).find(x => x && x.seed === seed);
      if (!e) return null;
      const items = e.items.filter(([sid]) => A.skills[sid]).map(([skill, sd]) => ({ skill, seed: sd }));
      if (!items.length) return null;
      if (e.kind === 'practice' && e.skillId && A.skills[e.skillId]) {
        const s = ENGINE.start('practice', { skillId: e.skillId, seed: e.seed, n: e.n });
        if (s.items.every((it, k) => items.some(x => x.seed === it.seed))) return s;
      }
      return ENGINE.start('review', { items, n: items.length, title: 'Try again: ' + e.title });
    },
    /** mistakes not missed again for ARCHIVE_DAYS move to the archive (kept, out of the way); returns how many moved */
    archiveOld(now) {
      now = now || Date.now();
      const st = STORE.get(), old = st.missed.filter(m => now - (m.last || m.t || now) > ARCHIVE_DAYS * DAYMS);
      if (!old.length) return 0;
      st.missed = st.missed.filter(m => !old.includes(m));
      const arch = old.map(m => Object.assign({}, m, { archived: now })).concat(prof().oldMistakes || []).slice(0, 300);
      STORE.setProfile({ oldMistakes: arch });          // saves the shorter list too
      return old.length;
    },
    /** bring archived mistakes back to Review */
    unarchive() {
      const st = STORE.get(), arch = (prof().oldMistakes || []).filter(m => m && A.skills[m.skill]), now = Date.now();
      arch.forEach(m => { if (!st.missed.some(x => x.skill === m.skill && x.seed === m.seed)) { const c = Object.assign({}, m, { last: now }); delete c.archived; st.missed.push(c); } });
      if (st.missed.length > 200) st.missed.length = 200;
      STORE.setProfile({ oldMistakes: [] });
      return arch.length;
    },
  });

  if (typeof module !== 'undefined') module.exports = ENGINE;
  if (typeof window !== 'undefined') window.ENGINE = ENGINE;
})();
