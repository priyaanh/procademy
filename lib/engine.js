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

  const ENGINE = {
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
        s.items = distinctItems(opts.skillId, sessionSeed, opts.n || PRACTICE_N);
        const where = A.whereIs(opts.skillId);
        if (where) { s.courseId = where.course.id; s.unitId = where.unit.id; }
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
        s.items = rng.shuffle(list).slice(0, DAILY_N);
      } else if (kind === 'chapter-test') {
        // a practice test for a CPM chapter: a question from each lesson (8 to 20 in all), no hints
        const b = A.cpmById(opts.book), ch = b && b.chapters.find(c => c.n === Number(opts.chapter));
        if (!ch) throw new Error('no chapter');
        const lessons = ch.lessons.filter(l => l.skills.some(id => A.skills[id] && A.whereIs(id)));
        if (!lessons.length) throw new Error('nothing to test in this chapter yet');
        s.title = `${b.short} · Chapter ${ch.n} practice test`;
        s.cpm = { book: b.id, chapter: ch.n };
        const picked = lessons.length > 20 ? rng.sample(lessons, 20).sort((x, y) => lessons.indexOf(x) - lessons.indexOf(y)) : lessons.slice();
        while (picked.length < Math.min(8, lessons.length * 3)) picked.push(lessons[picked.length % lessons.length]);
        const seen = new Set();
        picked.forEach((l, k) => {
          const ids = l.skills.filter(id => A.skills[id] && A.whereIs(id));
          s.items.push(Object.assign(distinctItems(ids[k % ids.length], `${sessionSeed}-${k}`, 1, seen)[0], { lesson: l.id }));
        });
      } else if (kind === 'review') {
        const missed = (opts.items || STORE.get().missed).filter(m => A.skills[m.skill]).slice(0, opts.n || 10);
        s.title = 'Review your mistakes';
        missed.forEach(m => { s.items.push({ skillId: m.skill, seed: m.seed, q: A.question(m.skill, m.seed) }); });
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
      s.items.push(distinctItems(sid, `${s.seed}-${k}`, 1, s.seen)[0]);
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
    /** at the end of a unit test, one more question for each skill missed (once); returns how many were added */
    followUps(s) {
      if (!s.secondChance || s.followed || s.i + 1 < s.items.length) return 0;
      s.followed = true;
      const seen = new Set(s.items.map(it => it.q.prompt));
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
      if (res.correct) { r.correct = true; r.done = true; }
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
      const total = s.items.length;
      let right = 0, pts = 0, placed = null;
      const perSkill = {};
      s.items.forEach((it, k) => {
        const r = s.results[k] || { tries: 0, hinted: false, correct: false };
        const good = ENGINE.counts(r);
        if (good) right += 1;
        pts += good ? POINTS.correct : (r.correct ? POINTS.hinted : 0);
        STORE.countAnswer(good);
        const sk = STORE.skill(it.skillId);
        STORE.setSkill(it.skillId, { tries: sk.tries + 1, right: sk.right + (good ? 1 : 0), last: Date.now() });
        if (good) STORE.clearMissed(it.skillId, it.seed); else if (s.kind !== 'placement') STORE.addMissed(it.skillId, it.seed, r.slip);    // a placement guess isn't a mistake to review
        (perSkill[it.skillId] = perSkill[it.skillId] || []).push(good);
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
        pts += POINTS.set;
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
      } else if (s.kind === 'review') {
        // review changes no levels; getting one right only clears it from the list, which happened above
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
      s.finished = { right, total, pts, changes, placed };
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
