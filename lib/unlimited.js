/* Unlimited practice (#/unlimited): questions that never run out, for every skill in every course and CPM
   book, one skill at a time or mixed (a unit, a course, a CPM lesson or chapter, everything practiced so far,
   everything due, everything). The questions are the same practice questions with step-by-step hints; the
   engine (ENGINE.endless) adds one after another and saves every PRACTICE_N answers as a set, so levels,
   points and review dates count as usual. End session shows the results; leaving the page saves the rest. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const enc = encodeURIComponent;
  const inCourse = id => A.skills[id] && A.whereIs(id);
  const lessonSkills = l => l.skills.filter(inCourse);
  const lessonTitle = (b, l) => `${b.short} ${window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id}`;

  /** what a link practices: { title, skills, cpm } or null */
  function pool(kind, a, b) {
    const st = S.get();
    if (kind === 'skill') return inCourse(a) ? { title: A.stripTags(A.skills[a].title), skills: [a] } : null;
    if (kind === 'unit') { const u = A.unitById(a, b); return u ? { title: u.title, skills: u.skills.filter(inCourse) } : null; }
    if (kind === 'course') { const c = A.courseById(a); return c ? { title: c.title, skills: A.courseSkills(c) } : null; }
    if (kind === 'lesson') {
      const ls = [...new Set(String(b || '').split(','))].slice(0, 16).map(x => A.cpmLesson(a, x)).filter(Boolean);
      if (ls.length < 2) { const f = ls[0]; return f ? { title: lessonTitle(f.book, f.lesson), skills: lessonSkills(f.lesson), cpm: { book: f.book.id, lesson: f.lesson.id } } : null; }
      // some lessons of a chapter (the lesson filter on the Courses tab)
      const bk = ls[0].book, ch = bk.chapters.find(c => c.lessons.includes(ls[0].lesson));
      return { title: ls.length <= 3 || !ch ? `${bk.short} lessons ${andList(ls.map(f => f.lesson.id))}` : `${bk.short} chapter ${ch.n}: ${ls.length} lessons`, skills: [...new Set(ls.flatMap(f => lessonSkills(f.lesson)))], cpm: ch ? { book: bk.id, chapter: ch.n } : null };
    }
    // two (or three) courses or CPM books, mixed: "math-7,math-6", "algebra-1,cpm:int1"
    if (kind === 'mix') {
      const parts = [...new Set(String(a || '').split(','))].slice(0, 3).map(partOf).filter(Boolean);
      return parts.length >= 2 ? { title: andList(parts.map(x => x.title)), skills: [...new Set(parts.flatMap(x => x.ids))] } : null;
    }
    if (kind === 'chapter') {
      const bk = A.cpmById(a), ch = bk && bk.chapters.find(c => c.n === Number(b));
      return ch ? { title: `${bk.short} Chapter ${ch.n}: ${ch.title}`, skills: A.cpmSkills(ch.lessons).filter(inCourse), cpm: { book: bk.id, chapter: ch.n } } : null;
    }
    if (kind === 'mine') return { title: 'Everything you have practiced', skills: Object.keys(st.skills).filter(id => inCourse(id) && st.skills[id].tries > 0) };
    if (kind === 'due') return { title: 'Due for review', skills: E.dueSkills() };
    if (kind === 'saved') {
      const ids = [];
      st.profile.enrolled.forEach(id => {
        if (id.startsWith('cpm:')) { const bk = A.cpmById(id.slice(4)); if (bk) bk.chapters.forEach(ch => ids.push(...A.cpmSkills(ch.lessons))); }
        else { const c = A.courseById(id); if (c) ids.push(...A.courseSkills(c)); }
      });
      return { title: 'Your saved courses', skills: [...new Set(ids)].filter(inCourse) };
    }
    if (kind === 'grade') { const cs = gradeCourses(); return { title: `Everything for ${gradeName()}`, skills: [].concat(...cs.map(c => A.courseSkills(c))) }; }
    if (kind === 'all') return { title: 'Everything', skills: Object.keys(A.skills).filter(inCourse) };
    // the skills that need it most: practiced and still Attempted or Familiar, or with a mistake to fix
    if (kind === 'weak') return { title: 'Your weak skills', skills: [...new Set(Object.keys(st.skills).filter(id => inCourse(id) && st.skills[id].tries > 0 && st.skills[id].level <= 2).concat(st.missed.map(m => m.skill).filter(inCourse)))] };
    // the chapter of the test being prepared for (Test prep)
    if (kind === 'test') { const t = testChapter(); return t ? { title: `Chapter ${t.ch.n} test`, skills: [...new Set(t.lessons.flatMap(x => x.ids))].filter(inCourse), cpm: { book: t.b.id, chapter: t.ch.n } } : null; }
    // five minutes of what has been practiced (or the saved courses, or the learner's grade)
    if (kind === 'quick') { const from = ['mine', 'saved', 'grade', 'all'].map(k => pool(k)).find(x => x && x.skills.length); return { title: 'Five minutes', skills: from.skills, limit: { minutes: 5 } }; }
    // one question a day at the learner's level, the same one all day
    if (kind === 'day') { const id = dayskill(); return id ? { title: 'Problem of the day', skills: [id], limit: { questions: 1 }, seed: 'pod:' + S.today(), day: true } : null; }
    // one question to try, from the welcome
    if (kind === 'sample') return inCourse(a) ? { title: A.stripTags(A.skills[a].title), skills: [a], limit: { questions: 1 } } : null;
    // a worksheet from a picture: every skill on it, mixed
    // questions like one in a picture (or typed): the closest skill, with the next closest a tap away
    // a hand-picked set (a parent's or teacher's link): up to 40 skills, with the title they gave it
    if (kind === 'set') { const ids = [...new Set(String(a || '').split(',').filter(inCourse))].slice(0, 40); return ids.length ? { title: String(b || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 60) || 'A practice set', skills: ids } : null; }
    if (kind === 'similar') { const ids = String(a || '').split(',').filter(inCourse).slice(0, 3); return ids.length ? { title: A.stripTags(A.skills[ids[0]].title), skills: [ids[0]], similar: ids } : null; }
    // a math topic typed in Practice any topic: the skills that match it, near the learner's grade when there are some
    if (kind === 'find') {
      const g = /^\d+$/.test(b || '') ? Number(b) : st.profile.grade, gradeOf = id => A.whereIs(id).course.grade;
      const ids = (V.mathTopic(a).length ? V.mathTopic(a) : V.findSkills(a, { whole: true })).filter(inCourse);
      const near = g == null ? [] : ids.filter(id => Math.abs(gradeOf(id) - g) <= 1);
      return { title: a, skills: near.length ? near : ids, find: true };
    }
    return null;
  }
  const andList = list => (list.length < 3 ? list.join(' and ') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]);
  const bookSkills = bk => [...new Set(bk.chapters.flatMap(ch => A.cpmSkills(ch.lessons)))].filter(inCourse);
  /** a course ("math-7") or a CPM book ("cpm:cc2") to mix: { title, ids } */
  const partOf = id => { if (/^cpm:/.test(id)) { const bk = A.cpmById(id.slice(4)); return bk ? { title: bk.title, ids: bookSkills(bk) } : null; } const c = A.courseById(id); return c ? { title: c.title, ids: A.courseSkills(c).filter(inCourse) } : null; };
  /** the test being prepared for, while its date hasn't passed: { b, ch, lessons } */
  function testChapter() {
    const pr = S.get().profile.prep;
    if (!pr || !window.PREP || pr.date < S.today()) return null;
    const c = PREP.chapterOf(pr.book, pr.ch);
    return c && c.lessons.length ? c : null;
  }
  const hashOf = t => { let h = 0; for (const ch of String(t)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  /** the skill for the problem of the day: one the learner has met in their course (else one of its first few) */
  function dayskill() {
    const st = S.get(), c = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0] || gradeCourses()[0] || A.courseById('math-7');
    if (!c) return null;
    const order = E.courseOrder(c).filter(inCourse), met = order.filter(id => S.skill(id).tries > 0);
    const list = met.length >= 3 ? met : order.slice(0, Math.max(3, met.length + 3));
    return list.length ? list[hashOf(S.today()) % list.length] : null;
  }
  /* ---------- My sets: skills picked by hand and kept together under a name, in the learner's profile (so they go
     with an account to another device). A set from a teacher's or parent's link can be kept too. ---------- */
  const SETS_MAX = 20, SET_SKILLS = 40;
  const tidyName = t => String(t || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const sameIds = (x, y) => x.length === y.length && x.every(id => y.includes(id));
  /** the learner's sets, newest first: [{ id, name, ids, t }] (skills no longer in a course left out) */
  function mySets() {
    const v = S.get().profile.sets;
    return (Array.isArray(v) ? v : []).filter(x => x && typeof x === 'object' && Array.isArray(x.ids))
      .map(x => ({ id: String(x.id || '').slice(0, 24), name: tidyName(x.name) || 'My set', ids: [...new Set(x.ids.map(String))].filter(inCourse).slice(0, SET_SKILLS), t: Number(x.t) || 0 }))
      .filter(x => x.id && x.ids.length);
  }
  /** keep a set: a new one, or one changed (found by its id). Returns it, or null when it has no skills */
  function keepSet(o) {
    const ids = [...new Set((o.ids || []).filter(inCourse))].slice(0, SET_SKILLS);
    if (!ids.length) return null;
    const set = { id: o.id || 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name: tidyName(o.name) || 'My set', ids, t: Date.now() };
    const list = [set].concat(mySets().filter(x => x.id !== set.id));
    S.setProfile({ sets: list.slice(0, SETS_MAX) });
    return set;
  }
  const dropSet = id => S.setProfile({ sets: mySets().filter(x => x.id !== id) });
  const setHref = x => `#/unlimited/set/${x.ids.map(enc).join(',')}/${enc(x.name)}`;

  /* ---------- how long a session lasts: without end, a number of questions, or a number of minutes ---------- */
  const LEN = 'procademy.ullen.v1', LENS = [['', 'No limit'], ['m5', '5 minutes'], ['m10', '10 minutes'], ['m20', '20 minutes'], ['q10', '10 questions'], ['q20', '20 questions']];
  const lenPref = () => { try { const v = localStorage.getItem(LEN) || ''; return LENS.some(x => x[0] === v) ? v : ''; } catch (e) { return ''; } };
  const limitOf = v => (/^q\d+$/.test(v) ? { questions: Number(v.slice(1)) } : /^m\d+$/.test(v) ? { minutes: Number(v.slice(1)) } : null);
  /** watch a running session: show what is left, and end it (with its summary) once the limit is reached and the
      question on screen hasn't been tried; onAnswer hears the running tally */
  function limitSession(root, limit, onAnswer) {
    const t0 = Date.now(), mine = root.__session; let chip = null, rang = false;
    const timer = setInterval(() => {
      const s = root.__session;
      if (!root.isConnected || !s || s !== mine || s.kind !== 'endless' || s.stopped) { clearInterval(timer); return; }       // this session only, never the next one
      const t = E.tally(s);
      if (onAnswer) onAnswer(t);
      if (!limit) return;
      const left = limit.minutes ? limit.minutes * 60000 - (Date.now() - t0) : 0, up = limit.questions ? t.n >= limit.questions : left <= 0;
      const head = root.querySelector('.ex-head');
      if (head && (!chip || !chip.isConnected)) { chip = document.createElement('span'); chip.className = 'stat-pill ul-limit'; head.appendChild(chip); }
      if (chip) chip.textContent = limit.questions ? `${Math.min(t.n, limit.questions)} of ${limit.questions}` : up ? 'Time’s up: finish this one' : `${Math.floor(left / 60000)}:${String(Math.floor(left % 60000 / 1000)).padStart(2, '0')} left`;
      if (up && limit.minutes && !rang) { rang = true; bell(); }
      const r = s.results[s.i];
      if (up && !(r && r.tries)) { const stop = root.querySelector('#stop'); if (stop) { clearInterval(timer); s.byLimit = true; stop.click(); } }
    }, 300);
    return { left: () => { const s = root.__session, n = s ? E.tally(s).n : 0; return !limit ? null : limit.questions ? (limit.questions - n > 0 ? { questions: limit.questions - n } : null) : (limit.minutes * 60000 - (Date.now() - t0) > 30000 ? { ms: limit.minutes * 60000 - (Date.now() - t0) } : null); } };
  }
  /** a gentle three-note sound when a timed session's time is up: only when turned on (on this device), never in quiet hours */
  function bell() {
    if (!uiGet().bell || (S.quietNow && S.quietNow())) return;
    if (window.UNLIMITED && UNLIMITED._bell) { UNLIMITED._bell(); return; }        // the test suite listens here
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)(), t0 = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain(), at = t0 + k * 0.18;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.18, at + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
        o.start(at); o.stop(at + 0.65);
      });
      setTimeout(() => { try { ctx.close(); } catch (e) { /* fine */ } }, 1600);
    } catch (e) { /* no sound on this device */ }
    try { if (navigator.vibrate) navigator.vibrate([60, 80, 60]); } catch (e) { /* fine */ }
  }
  /* ---------- the pace: questions a minute, shown after a session. The time between answers counts, up to 2½
     minutes each (a break isn't practice), as Progress counts time. ---------- */
  function pacer(root) {
    const p = { last: Date.now(), ms: 0, n: 0 };
    const doneOf = s => s.results.filter(r => r && r.done).length;
    p.sample = s => { const n = doneOf(s); if (n > p.n) { const now = Date.now(); p.ms += Math.min(now - p.last, 150000); p.last = now; p.n = n; } };
    const timer = setInterval(() => { const s = root.__session; if (!root.isConnected || !s || s !== p.s) { clearInterval(timer); return; } p.sample(s); }, 300);
    /** the line for the summary (moved up under the score once it is drawn), or '' when there's too little to say */
    p.line = s => {
      p.sample(s); clearInterval(timer);
      if (p.n < 2 || p.ms < 15000) return '';
      const rate = p.n / (p.ms / 60000), r = rate >= 10 ? String(Math.round(rate)) : String(Math.round(rate * 10) / 10);
      const span = p.ms < 60000 ? `${Math.round(p.ms / 1000)} seconds` : H.plural(Math.round(p.ms / 60000), 'minute');
      Promise.resolve().then(() => { const el = root.querySelector('.sum-pace'), w = root.querySelector('.summary .what'); if (el && w) w.after(el); });
      return `<p class="sum-pace small">Your pace: about <b>${r}</b> ${r === '1' ? 'question' : 'questions'} a minute (${H.plural(p.n, 'question')} in ${span}).</p>`;
    };
    return p;
  }
  // a grade's own math course; test prep, competition, money and coding courses are extras, chosen on their own
  const EXTRA = /^(int-|sat-act$|competition-math$|personal-finance$|coding-logic$|hindi$)/;
  const gradeCourses = () => { const g = S.get().profile.grade; return g == null ? [] : A.courses.filter(c => c.grade === g && !EXTRA.test(c.id)); };
  const gradeName = () => { const g = S.get().profile.grade; return g === 0 ? 'Kindergarten' : g <= 8 ? `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade` : gradeCourses().map(c => c.title).join(' and '); };

  /* ---------- picking up where a session stopped: a session left before its end (the page changed, or End session
     before the time or questions were done) is remembered for three days, in the profile ---------- */
  let resumeNext = null, leaving = null;          // leaving: notes the session on screen, before the next page draws
  const lastStop = () => { const r = S.get().profile.ulLast; return r && typeof r === 'object' && typeof r.href === 'string' && /^#\/unlimited\/[a-z]+/.test(r.href) && r.n > 0 && Date.now() - (Number(r.t) || 0) < 3 * 864e5 ? r : null; };
  const leftText = l => (!l ? '' : l.questions ? H.plural(l.questions, 'question') : `${Math.max(1, Math.round(l.ms / 60000))} min`);
  /** where Back goes from a session: the tab it was chosen on */
  const backOf = kind => (['skill', 'unit', 'course', 'lesson', 'chapter', 'mix', 'exam'].includes(kind) ? '#/unlimited/courses' : kind === 'similar' ? '#/unlimited/pictures' : '#/unlimited');

  /** practicing one pool, without end */
  function play(root, kind, a, b) {
    if (leaving) leaving();
    if (kind === 'topic' && window.TOPICS) return TOPICS.page(root, a, b);      // any topic, in its own player
    if (TABS.some(t => t[0] === kind)) return page(root, kind);                  // a tab of the Practice page
    if (kind === 'exam') return exam(root, a);
    if (kind === 'round') return round(root, a, b);
    if (kind === 'vs') return vsPage(root, a);
    if (kind === 'picture') {
      page(root, 'pictures');
      const box = root.querySelector('#ul-shot');
      if (box) { if (window.FILES) FILES.warm(); box.scrollIntoView({ block: 'center' }); box.querySelector('#shot-pick').focus({ preventScroll: true }); }
      if (pending) { const f = pending; pending = null; if (box && box.__read) box.__read(f); }
      return;
    }
    const p = pool(kind, a, b);
    if (!p || !p.skills.length) {
      root.innerHTML = `<div class="card empty"><h1>Nothing to practice yet</h1><p>${kind === 'mine' ? 'Practice a skill first, and it will appear here.' : kind === 'weak' ? 'No weak skills right now. Nice work.' : kind === 'test' ? 'No test is coming up. Set one from a CPM chapter’s Test prep.' : kind === 'due' ? 'No skills are due for review today.' : kind === 'saved' ? 'Save a course or a CPM book (select Save on its page), and it will appear here.' : 'This link doesn’t match a skill, unit, course or lesson.'}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited">Choose something else</a></div></div>`;
      H.tutorCtx(null);
      return;
    }
    const here = location.hash, resume = resumeNext && resumeNext.href === here ? resumeNext : null, keeps = !p.day && kind !== 'sample';
    resumeNext = null;
    if (resume) S.setProfile({ ulLast: null });
    let limit = p.limit || limitOf(lenPref()), first = true;
    if (resume && resume.left) limit = resume.left.questions ? { questions: resume.left.questions } : { minutes: resume.left.ms / 60000 };
    const start = () => {
      const pace = pacer(root), prior = first && resume ? resume : null;
      let watch = null;
      /** a session left before its end is kept to pick up later; one that ran its course is not */
      const note = (s, ended) => {
        window.removeEventListener('hashchange', onLeave, true); window.removeEventListener('pagehide', onLeave);
        if (leaving === onLeave) leaving = null;
        if (!keeps || s.noted) return;
        s.noted = true;
        const t = E.tally(s), left = watch ? watch.left() : null;
        if (!t.n || s.byLimit || (ended && !left)) { if (lastStop() && lastStop().href === here) S.setProfile({ ulLast: null }); return; }
        S.setProfile({ ulLast: { href: here, title: p.title, n: t.n + (prior ? prior.n : 0), right: t.right + (prior ? prior.right : 0), left, t: Date.now() } });
      };
      const onLeave = () => { const s = pace.s; if (s && !s.stopped) note(s, false); };
      H.exercise(root, E.endless({ skills: p.skills, title: (p.day ? '' : 'Unlimited · ') + p.title, cpm: p.cpm, seed: first && p.seed ? p.seed : undefined }), { back: p.day ? '#/' : backOf(kind), backLabel: p.day ? 'Home' : 'Unlimited practice', again: start, againLabel: p.day ? 'More like it' : 'Continue practicing',
        onFinish: s => note(s, true),
        summaryExtra: (s, f) => pace.line(s) + (prior && f.total ? `<p class="small muted sum-prior">With the ${H.plural(prior.n, 'question')} from before: ${H.plural(prior.n + f.total, 'question')}, ${prior.right + f.right} right on the first try.</p>` : '') });
      pace.s = root.__session;
      first = false;
      watch = limitSession(root, limit, p.day ? t => { if (t.n >= 1 && S.get().profile.pod !== S.today()) S.setProfile({ pod: S.today() }); } : null);
      window.addEventListener('hashchange', onLeave, true); window.addEventListener('pagehide', onLeave);
      leaving = onLeave;
      if (prior) { const head = root.querySelector('.ex-head'); if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">Picking up where you stopped: ${H.plural(prior.n, 'question')} answered before, ${prior.right} right.${limit ? ` ${leftText(resume.left)} to go.` : ''}</p>`); }
    };
    start();
    if (p.day) {
      const head = root.querySelector('.ex-head'), w = A.whereIs(p.skills[0]);
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">One new question each day, from <b>${A.skills[p.skills[0]].title}</b>${w ? ` (${esc(w.course.title)})` : ''}.</p>`);
    }
    // a hand-picked set (a teacher's link, a worksheet): kept in My sets with one tap
    if (kind === 'set') {
      const head = root.querySelector('.ex-head'), kept = mySets().find(x => sameIds(x.ids, p.skills));
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note" id="set-note">${kept ? `From My sets: <b>${esc(kept.name)}</b>, ${H.plural(p.skills.length, 'skill')}.` : `A practice set of ${H.plural(p.skills.length, 'skill')}. <button type="button" class="linklike" id="set-keep">Save it to My sets</button>`}</p>`);
      const kb = root.querySelector('#set-keep');
      if (kb) kb.addEventListener('click', () => { const k = keepSet({ name: p.title, ids: p.skills }); if (!k) return; root.querySelector('#set-note').innerHTML = `Saved to My sets as <b>${esc(k.name)}</b>. You can rename it there.`; V.toast('Saved to My sets'); });
    }
    // questions like a picture: what was read, and the other close matches
    if (p.similar) {
      const head = root.querySelector('.ex-head'), seen = lastShot && p.similar.every(id => lastShot.ids.includes(id)) ? lastShot : null;
      const others = p.similar.slice(1).map(id => `<a href="#/unlimited/similar/${[id].concat(p.similar.filter(x => x !== id)).map(enc).join(',')}">${A.skills[id].title}</a>`);
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">${seen ? `From your ${seen.thumb ? 'picture' : 'question'}: “${esc(clipText(seen.text))}”. ` : ''}New questions like it, ready at once.${others.length ? ` Not quite it? Try ${others.join(' or ')}.` : ''}</p>`);
    }
    // a typed math topic: say whose questions these are, with the way to AI-written ones instead
    if (p.find && window.TOPICS && !window.PROCADEMY_OFFLINE) {
      const head = root.querySelector('.ex-head');
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">Procademy’s own questions on “${esc(a)}”, from ${H.plural(p.skills.length, 'skill')}: ready at once and checked. <a href="${TOPICS.href(a, S.get().profile.grade)}">Practice it as a topic instead</a></p>`);
    }
  }

  /* ---------- practice like the test: for any course, a timed set with no hints, from the units practiced so far
     (or the whole course, before any). It's practice, so levels only go up, as in any mixed set. ---------- */
  const EXAM_N = 12, EXAM_MIN = 20;
  function examSkills(c) {
    const units = c.units.filter(u => u.skills.some(id => inCourse(id) && S.skill(id).tries > 0));
    return { units: units.length, ids: [...new Set((units.length ? units : c.units).flatMap(u => u.skills.filter(inCourse)))] };
  }
  function exam(root, cid) {
    const c = A.courseById(cid), x = c ? examSkills(c) : { ids: [] };
    H.tutorCtx(null);
    if (!x.ids.length) { root.innerHTML = '<div class="card empty"><h1>Nothing to practice yet</h1><p>This link doesn’t match a course.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited/courses">Choose a course</a></div></div>'; return; }
    const start = () => {
      const s = E.start('mix', { skills: x.ids, n: EXAM_N, title: `Practice like the test: ${c.title}` });
      s.hints = false;
      const pace = pacer(root);
      H.exercise(root, s, { back: '#/unlimited/courses', backLabel: 'Unlimited practice', minutes: EXAM_MIN, again: start, againLabel: 'Another practice test',
        summaryExtra: sx => { if (sx.timedOut) bell(); return pace.line(sx); },
        banner: `<b>Like the real test:</b> ${EXAM_N} questions from ${x.units ? `the ${H.plural(x.units, 'unit')} you’ve practiced` : 'the whole course'}, ${EXAM_MIN} minutes and no hints. It’s practice, so your levels can only go up.` });
      pace.s = root.__session;
    };
    start();
  }

  /* ---------- a set with a friend: ten questions of a set, then a link that gives a friend exactly the same ones (the
     same seed) with your score; they see who scored higher when they finish. Everything is in the link: no account,
     no server. A name goes in only if the box is ticked. A link is untrusted, so every field is checked. ---------- */
  const ROUND_N = 10;
  const roundHref = x => `#/unlimited/round/${x.ids.map(enc).join(',')}/${enc(x.name)}`;
  const vsWhat = c => `${c.title} · ${H.plural(c.n, 'question')}`;
  /** a friend's link, checked: { ids, title, seed, n, score, name } or null */
  function readVs(code) {
    let o;
    try { o = JSON.parse((window.DRAW && DRAW.decode(code)) || 'null'); } catch (e) { return null; }
    if (!o || typeof o !== 'object' || !Array.isArray(o.ids) || !/^[a-z0-9-]{1,40}$/i.test(String(o.seed || ''))) return null;
    const ids = o.ids.map(String).slice(0, SET_SKILLS), n = Number(o.n), score = Number(o.score);
    if (!ids.length || !ids.every(inCourse) || !Number.isInteger(n) || n < 1 || n > 30 || !Number.isInteger(score) || score < 0 || score > n) return null;   // a missing skill would change the questions
    return { ids, n, score, seed: String(o.seed), title: tidyName(o.title) || 'A practice set', name: typeof o.name === 'string' ? o.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) : '' };
  }
  /** the box under a summary: Challenge a friend, then the link to copy or share, with or without a name */
  function shareBox(root, info, label) {
    Promise.resolve().then(() => {
      const b = root.querySelector('[data-ulvs]');
      if (!b) return;
      b.addEventListener('click', () => {
        const box = b.parentElement.querySelector('.vs-make');
        box.hidden = !box.hidden;
        if (box.hidden || box.innerHTML) return;
        const name = S.get().profile.name || '';
        box.innerHTML = `<label class="small"><input type="checkbox" id="ulvs-on" ${name ? 'checked' : ''}> Include my name in the link: <input id="vs-name" maxlength="24" value="${esc(name)}" placeholder="Your first name" aria-label="Name to show"></label>
          <div class="btn-row"><button class="btn sm primary" id="ulvs-copy" type="button">Copy the link</button>${navigator.share ? '<button class="btn sm" id="ulvs-share" type="button">Share…</button>' : ''}</div>
          <p class="tiny muted">The link holds only the skills, the questions’ code and your score${name ? ' (and your name, if selected)' : ''}.</p>`;
        const link = () => {
          const nm = box.querySelector('#ulvs-on').checked ? box.querySelector('#vs-name').value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) : '';
          return (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]) + '#/unlimited/vs/' + DRAW.encode(JSON.stringify(Object.assign({ v: 1 }, info, nm ? { name: nm } : {})));
        };
        const sent = () => { if (window.CHALLENGE) CHALLENGE.remember({ dir: 'sent', what: vsWhat(info), mine: `${info.score} / ${info.n}` }); if (window.BADGES) BADGES.flag('challenge'); };
        if (window.MOVE) box.querySelector('.btn-row').appendChild(MOVE.qrButton(box, link));
        box.querySelector('#ulvs-copy').addEventListener('click', () => {
          const url = link(); U._lastVs = url; sent();
          try { navigator.clipboard.writeText(url).then(() => V.toast('Challenge link copied.'), () => V.toast('The link couldn’t be copied: ' + url)); } catch (e) { V.toast('The link couldn’t be copied.'); }
        });
        const sh = box.querySelector('#ulvs-share');
        if (sh) sh.addEventListener('click', () => navigator.share({ title: 'A Procademy challenge', text: `Can you beat my score of ${info.score} / ${info.n}?`, url: link() }).then(sent, () => {}));
      });
    });
    return `<div class="vs-box"><button type="button" class="btn" data-ulvs>${esc(label || 'Challenge a friend')}</button><span class="small muted">Your friend gets exactly these questions and sees your score.</span><div class="vs-make" hidden></div></div>`;
  }
  /** #/unlimited/round/<ids>/<name>: ten questions of a set, to share */
  function round(root, a, b) {
    const p = pool('set', a, b);
    H.tutorCtx(null);
    if (!p) { root.innerHTML = '<div class="card empty"><h1>Nothing to practice yet</h1><p>This link doesn’t match any skills.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited">Choose something else</a></div></div>'; return; }
    const start = () => {
      const pace = pacer(root);
      H.exercise(root, E.start('mix', { skills: p.skills, n: ROUND_N, seed: Math.random().toString(36).slice(2, 9), title: p.title }), { back: '#/unlimited', backLabel: 'Unlimited practice', again: start, againLabel: 'Ten more',
        banner: `<b>A set to share:</b> ${ROUND_N} questions. When you finish, send them to a friend: they get exactly the same questions and see your score.`,
        summaryExtra: (sx, f) => pace.line(sx) + (f.total ? shareBox(root, { ids: p.skills, title: p.title, seed: sx.seed, n: f.total, score: f.right }) : '') });
      pace.s = root.__session;
    };
    start();
  }
  /** #/unlimited/vs/<code>: a friend's set, the same questions, then who scored higher */
  function vsPage(root, code) {
    const c = readVs(code);
    H.tutorCtx(null);
    if (!c) { root.innerHTML = '<div class="card empty"><h1>This challenge link doesn’t work</h1><p class="muted">It may have been shortened when it was copied, or made by a newer version of Procademy.</p><a class="btn primary" href="#/">Home</a></div>'; return; }
    const who = c.name || 'A friend';
    root.innerHTML = `<div class="card vs-card"><h1>${esc(who)} has sent you a practice set</h1>
      <p class="vs-what">${esc(vsWhat(c))}</p><p>${esc(who)} scored <b>${c.score} / ${c.n}</b>. You’ll get exactly the same questions.</p>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="vs-go">Accept the challenge</button><a class="btn ghost" href="#/">Decline</a></div></div>`;
    root.querySelector('#vs-go').addEventListener('click', () => {
      if (window.BADGES) BADGES.flag('challenge');
      const start = () => {
        const pace = pacer(root);
        H.exercise(root, E.start('mix', { skills: c.ids, n: c.n, seed: c.seed, title: c.title }), { back: '#/', backLabel: 'Home', again: start, againLabel: 'Try the same questions again',
          summaryExtra(sx, f) {
            const win = f.right > c.score, tie = f.right === c.score, kept = mySets().some(x => sameIds(x.ids, c.ids));
            if (window.CHALLENGE) CHALLENGE.remember({ dir: 'got', who, what: vsWhat(c), mine: `${f.right} / ${f.total}`, theirs: `${c.score} / ${c.n}`, result: win ? 'win' : tie ? 'tie' : 'lose' });
            Promise.resolve().then(() => { const k = root.querySelector('#vs-keep'); if (k) k.addEventListener('click', () => { keepSet({ name: c.title, ids: c.ids }); k.replaceWith(document.createTextNode('Saved to My sets.')); }); });
            return pace.line(sx) + `<div class="vs-result ${win ? 'win' : tie ? 'tie' : 'lose'}">You <b>${f.right} / ${f.total}</b> · ${esc(who)} <b>${c.score} / ${c.n}</b>: ${win ? 'you have the higher score.' : tie ? 'the scores are tied.' : `${esc(who)} has the higher score. You can try the same questions again.`}</div>`
              + (kept ? '' : '<p class="small sum-note"><button type="button" class="linklike" id="vs-keep">Save this set to My sets</button></p>')
              + shareBox(root, { ids: c.ids, title: c.title, seed: c.seed, n: f.total, score: f.right }, `Challenge ${who === 'A friend' ? 'them' : who} back`);
          } });
        pace.s = root.__session;
      };
      start();
    });
  }

  /* ---------- the page, in four tabs: For you (the picks used most and how long a session lasts), Courses (a search
     over every skill, and every course and CPM book), Topics (any topic) and Pictures (questions like yours). All
     four are drawn at once, so switching is instant and a picture pasted on any tab is read; the address follows the
     tab (#/unlimited, #/unlimited/courses, #/unlimited/topics, #/unlimited/pictures), so a link opens on it. ---------- */
  const TABS = [['foryou', 'For you', '', 'target'], ['courses', 'Courses', '/courses', 'book'], ['topics', 'Topics', '/topics', 'globe'], ['pictures', 'Pictures', '/pictures', 'image']];
  const topicsOn = () => !!(window.TOPICS && !window.PROCADEMY_OFFLINE);
  const UI = 'procademy.ui.unlimited';
  const uiGet = () => { try { return JSON.parse(localStorage.getItem(UI) || '{}') || {}; } catch (e) { return {}; } };
  const uiSet = patch => { try { localStorage.setItem(UI, JSON.stringify(Object.assign(uiGet(), patch))); } catch (e) { /* fine */ } };
  /** on a wide screen, rows of 3 or 4 cards, whichever leaves fewer gaps in the last row */
  const cols = n => ((4 - n % 4) % 4 <= (3 - n % 3) % 3 ? 4 : 3);
  const pickHtml = ([href, name, line, ic]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`;
  const skillLink = id => `<li><a href="#/unlimited/skill/${enc(id)}">${H.lvl(S.skill(id).level)} <span>${A.skills[id].title}</span></a></li>`;

  /** For you: the picks that fit this learner, how long a session lasts, and the other ways to practice */
  function forYouHtml(ui) {
    const st = S.get(), mine = pool('mine').skills, due = E.dueSkills(), saved = pool('saved').skills, all = pool('all').skills, weak = pool('weak').skills, test = testChapter();
    const c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), gc = gradeCourses();
    const picks = [
      ['#/unlimited/quick', 'Five minutes', 'A quick mix that stops after five minutes', 'timer'],
      mine.length && ['#/unlimited/mine', 'Everything you’ve practiced', `${H.plural(mine.length, 'skill')}, with weaker skills more often`, 'target'],
      weak.length && ['#/unlimited/weak', 'Mix my weak skills', `${H.plural(weak.length, 'skill')} still Attempted or Familiar, or with a mistake`, 'review'],
      due.length && ['#/unlimited/due', 'Due for review', `${H.plural(due.length, 'skill')} due`, 'calendar'],
      test && ['#/unlimited/test', 'Practice for my test', `${test.b.short} chapter ${test.ch.n}, on ${new Date(st.profile.prep.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`, 'flag'],
      f && lessonSkills(f.lesson).length && [`#/unlimited/lesson/${f.book.id}/${enc(f.lesson.id)}`, 'Your class lesson', lessonTitle(f.book, f.lesson), 'school'],
      saved.length && ['#/unlimited/saved', 'Your saved courses', H.plural(saved.length, 'skill'), 'bookmark'],
      gc.length && ['#/unlimited/grade', `Everything for ${gradeName()}`, H.plural([].concat(...gc.map(x => A.courseSkills(x))).length, 'skill'), 'book'],
      ['#/unlimited/all', 'Everything', `All ${all.length} skills, Kindergarten to Calculus, mixed`, 'globe'],
    ].filter(Boolean);
    const len = lenPref(), last = lastStop();
    return `${last ? `<div class="card tight ul-resume" id="ul-resume"><span class="tool-ic">${ICONS.svg('review', 22)}</span><span class="ul-resume-text"><b>Pick up where you stopped</b><span class="small muted">${esc(last.title)}: ${H.plural(last.n, 'question')} answered, ${Number(last.right) || 0} right${last.left ? `, ${leftText(last.left)} to go` : ''}</span></span>
        <span class="ul-resume-acts"><button type="button" class="btn sm primary" id="ul-resume-go">Continue</button><button type="button" class="btn sm ghost" id="ul-resume-no">Not now</button></span></div>` : ''}
      <div class="card ul-len"><div class="set-row"><div class="set-text"><span class="set-label" id="ul-len-l">How long do you want to practice?</span><span class="set-help">Sessions stop by themselves then. End session works any time.</span></div>
        <div class="seg" id="ul-len" role="radiogroup" aria-labelledby="ul-len-l">${LENS.map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === len}" data-v="${v}">${l}</button>`).join('')}</div></div>
        <div class="ul-sug-wrap" id="ul-sug">${suggestHtml(len)}</div>
        <label class="ul-bell small"><input type="checkbox" id="ul-bell"${ui.bell ? ' checked' : ''}> Play a sound when the time is up</label></div>
      <div class="ul-sec-head"><h2>Or choose what to practice</h2></div>
      <div class="ul-picks even" style="--cols:${cols(picks.length)}">${picks.map(pickHtml).join('')}</div>
      ${setsHtml()}
      <details class="ul-every" id="ul-more"${ui.more === false ? '' : ' open'}><summary><h2>More ways to practice</h2><span class="muted small">Today’s plan, mistakes, sprints, flashcards and puzzles</span></summary>
      <div class="ul-picks more even" style="--cols:3">${[['#/daily', 'Today’s practice', 'Review, corrections and new skills, picked for you', 'calendar'], ['#/unlimited/day', 'Problem of the day', 'One new question at your level, every day', 'target'], ['#/review', 'Your mistakes', 'Every question you’ve missed, until you get it right', 'review'], ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts', 'timer'], ['#/words/cards', 'Math vocabulary flashcards', 'Spaced review of math terms', 'book'], ['#/leap', 'Leap', '80 puzzles, and a new one every day', 'flag'], ['#/warmup', 'Mental math warm-up', 'Five minutes of quick math in your head', 'sparkle'], ['#/weekly', 'This week’s challenge', 'One harder problem, all week, for a badge', 'trophy'], ['#/ready', 'Ready for high school', 'The skills high school builds on', 'school']].map(pickHtml).join('')}</div></details>`;
  }
  /** three suggestions that fit the time chosen: short rounds for a few minutes, a fuller plan for longer */
  function suggestions(len) {
    const st = S.get(), m = { m5: 5, m10: 10, m20: 20, q10: 7, q20: 12 }[len] || 0, due = E.dueSkills(), weak = pool('weak').skills, mine = pool('mine').skills, test = testChapter();
    const c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), missed = st.missed.filter(x => A.skills[x.skill]).length, today = st.days[S.today()] || {};
    const course = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0] || gradeCourses()[0];
    const P = {
      five: missed >= 3 && ['#/review/five', 'Quick round: 5 mistakes', `${H.plural(missed, 'mistake')} saved; fix five of them`, 'review'],
      pod: st.profile.pod !== S.today() && ['#/unlimited/day', 'Problem of the day', 'One new question at your level', 'target'],
      due: due.length && ['#/unlimited/due', 'Due for review', `${H.plural(due.length, 'skill')} due`, 'calendar'],
      weak: weak.length && ['#/unlimited/weak', 'Mix my weak skills', `${H.plural(weak.length, 'skill')} that need it most`, 'review'],
      sprint: ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts', 'timer'],
      test: test && ['#/unlimited/test', 'Practice for my test', `${test.b.short} chapter ${test.ch.n}`, 'flag'],
      lesson: f && lessonSkills(f.lesson).length && [`#/unlimited/lesson/${f.book.id}/${enc(f.lesson.id)}`, 'Your class lesson', lessonTitle(f.book, f.lesson), 'school'],
      daily: !today.daily && ['#/daily', 'Today’s practice', 'Review, corrections and new skills, picked for you', 'calendar'],
      exam: course && ['#/unlimited/exam/' + course.id, 'Practice like the test', `${course.title}: ${EXAM_N} questions in ${EXAM_MIN} minutes`, 'flag'],
      mine: mine.length && ['#/unlimited/mine', 'Everything you’ve practiced', H.plural(mine.length, 'skill'), 'target'],
      quick: ['#/unlimited/quick', 'Five minutes', 'A quick mix', 'timer'],
      all: ['#/unlimited/all', 'Everything', 'Every skill, mixed', 'globe'],
    };
    const order = m && m <= 6 ? ['five', 'pod', 'due', 'weak', 'sprint', 'quick'] : m && m <= 12 ? ['test', 'due', 'weak', 'lesson', 'five', 'daily', 'mine'] : ['test', 'daily', 'exam', 'lesson', 'weak', 'mine'];
    const out = order.concat('mine', 'all').map(k => P[k]).filter(Boolean);
    return out.filter((x, k) => out.findIndex(y => y[0] === x[0]) === k).slice(0, 3);
  }
  const suggestHtml = len => { const l = (LENS.find(x => x[0] === len) || LENS[0])[1].toLowerCase(); return `<h3 class="ul-sug-h">${len ? `Good for ${l}` : 'Suggested for you'}</h3><div class="ul-sug">${suggestions(len).map(([href, name, line, ic]) => `<a class="ul-sug-item" href="${href}"><span class="tool-ic">${ICONS.svg(ic, 20)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>`; };
  /** My sets: each with Practice, and Edit (rename, add or take away skills, delete); Make a set opens the maker */
  function setsHtml() {
    const sets = mySets();
    const row = x => `<li class="ul-set"><div class="ul-set-text"><b>${esc(x.name)}</b><span class="small muted">${H.plural(x.ids.length, 'skill')}: ${x.ids.slice(0, 3).map(id => esc(H.plain(A.skills[id].title))).join(', ')}${x.ids.length > 3 ? ' and more' : ''}</span></div>
      <div class="ul-set-acts"><a class="btn sm primary" href="${setHref(x)}">Practice</a><a class="btn sm" href="${roundHref(x)}" title="Ten questions, then a link for a friend to try the same ones">Challenge a friend</a><button type="button" class="btn sm ghost" data-set-edit="${esc(x.id)}">Edit</button></div></li>`;
    return `<section class="ul-sets" id="ul-sets" aria-labelledby="ul-sets-h"><div class="ul-sec-head"><h2 id="ul-sets-h">My sets</h2><button type="button" class="btn sm" id="set-new">${ICONS.svg('plus', 16)} Make a set</button></div>
      ${sets.length ? `<ul class="card tight ul-setlist">${sets.map(row).join('')}</ul>` : '<p class="small muted ul-sets-none">Pick skills from any course and keep them together under a name, to practice whenever you like. A set from a teacher’s link can be kept here too.</p>'}
      <div class="card ul-set-make" id="set-make" hidden></div></section>`;
  }
  /** the set maker: a name, a search to add skills (one at a time, or all shown), and the skills chosen so far */
  function wireSets(root, index) {
    const sec = root.querySelector('#ul-sets');
    if (!sec) return;
    const make = sec.querySelector('#set-make');
    let chosen = [], editing = null;
    const redraw = () => { const at = root.querySelector('#ul-sets'); at.outerHTML = setsHtml(); wireSets(root, index); };
    const title = id => esc(H.plain(A.skills[id].title));
    function drawChosen() {
      make.querySelector('#set-count').textContent = chosen.length ? `${H.plural(chosen.length, 'skill')} chosen${chosen.length >= SET_SKILLS ? ' (the most a set can hold)' : ''}` : 'No skills chosen yet. Search above, then add them.';
      make.querySelector('#set-chosen').innerHTML = chosen.map(id => `<span class="set-chip">${title(id)}<button type="button" data-rm="${esc(id)}" aria-label="Take away ${title(id)}" title="Take away">✕</button></span>`).join('');
      make.querySelectorAll('#set-found [data-add]').forEach(b => { const on = chosen.includes(b.dataset.add); b.setAttribute('aria-pressed', String(on)); b.querySelector('.set-add-w').textContent = on ? 'Added' : 'Add'; });
      make.querySelector('#set-save').disabled = !chosen.length;
    }
    function find() {
      const qv = make.querySelector('#set-q').value, words = A.normText(qv).split(/\s+/).filter(Boolean), out = make.querySelector('#set-found');
      if (!words.length) { out.innerHTML = ''; return; }
      const hits = index.filter(x => words.every(w => x.text.includes(w))).slice(0, 12);
      out.innerHTML = hits.length ? hits.map(x => `<li><button type="button" class="set-add" data-add="${esc(x.id)}" aria-pressed="false"><span class="set-add-w">Add</span><span>${A.skills[x.id].title} <span class="muted small">· ${esc(A.whereIs(x.id).course.title)}</span></span></button></li>`).join('') + (hits.length > 1 ? `<li><button type="button" class="link-btn small" id="set-all">Add all ${hits.length} shown</button></li>` : '') : '<li class="muted small">No skill matches. Try fewer or shorter words.</li>';
      drawChosen();
    }
    function open(set) {
      editing = set || null; chosen = set ? set.ids.slice() : [];
      make.hidden = false;
      make.innerHTML = `<h3>${set ? 'Edit your set' : 'Make a set'}</h3>
        <div class="set-make-grid"><label class="set-f"><span class="label">Name</span><input id="set-name" maxlength="60" value="${set ? esc(set.name) : ''}" placeholder="For example: Friday’s quiz"></label>
          <label class="set-f"><span class="label">Add skills</span><input id="set-q" type="search" autocomplete="off" placeholder="Search: fractions, slope, area…"></label></div>
        <ul class="ul-skills set-found" id="set-found"></ul>
        <p class="tiny muted set-count" id="set-count"></p><div class="set-chosen" id="set-chosen"></div>
        <div class="btn-row"><button type="button" class="btn primary" id="set-save">Save the set</button><button type="button" class="btn" id="set-cancel">Cancel</button>${set ? '<button type="button" class="btn ghost" id="set-del">Delete this set</button>' : ''}</div>`;
      let tm = 0;
      make.querySelector('#set-q').addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(find, 120); });
      make.querySelector('#set-save').addEventListener('click', () => {
        const name = tidyName(make.querySelector('#set-name').value) || (chosen.length === 1 ? H.plain(A.skills[chosen[0]].title) : `My set ${mySets().length + 1}`);
        const k = keepSet({ id: editing && editing.id, name, ids: chosen });
        if (!k) return;
        redraw(); V.toast(editing ? 'Set saved' : 'Saved to My sets');
      });
      make.querySelector('#set-cancel').addEventListener('click', () => { make.hidden = true; make.innerHTML = ''; sec.querySelector('#set-new').focus(); });
      const del = make.querySelector('#set-del');
      if (del) del.addEventListener('click', () => { if (!confirm(`Delete the set “${editing.name}”?`)) return; dropSet(editing.id); redraw(); V.toast('Set deleted'); });
      drawChosen();
      make.querySelector(set ? '#set-q' : '#set-name').focus();
    }
    make.addEventListener('click', ev => {
      const add = ev.target.closest('[data-add]'), rm = ev.target.closest('[data-rm]');
      if (add) { const id = add.dataset.add; chosen = chosen.includes(id) ? chosen.filter(x => x !== id) : chosen.length < SET_SKILLS ? chosen.concat(id) : chosen; drawChosen(); }
      else if (rm) { chosen = chosen.filter(x => x !== rm.dataset.rm); drawChosen(); }
      else if (ev.target.closest('#set-all')) { make.querySelectorAll('#set-found [data-add]').forEach(b => { if (!chosen.includes(b.dataset.add) && chosen.length < SET_SKILLS) chosen.push(b.dataset.add); }); drawChosen(); }
    });
    sec.querySelector('#set-new').addEventListener('click', () => open(null));
    sec.querySelectorAll('[data-set-edit]').forEach(b => b.addEventListener('click', () => open(mySets().find(x => x.id === b.dataset.setEdit))));
  }
  /** Courses: a search over every skill, then every course and CPM book */
  function coursesHtml() {
    return `<div class="card tight ul-find"><label for="ul-q" class="label">Find any skill</label><input id="ul-q" type="search" autocomplete="off" placeholder="Fractions, slope, area, factoring…"><ul class="ul-skills" id="ul-found"></ul></div>
      <div class="ul-tools">${mixHtml()}${A.cpm.length ? chapterHtml() : ''}</div>
      <div class="ul-sec-head"><h2>Every course</h2><span class="muted small">A whole course, a unit or one skill</span></div>
      ${A.courses.map(co => `<details class="card tight ul-course" ${H.courseVar(co)}><summary>${H.mono(co.icon, 'mono-sm')} <b>${esc(co.title)}</b> <span class="muted small">${H.plural(A.courseSkills(co).length, 'skill')}</span></summary>
        <div class="btn-row"><a class="btn sm primary" href="#/unlimited/course/${co.id}">Practice the whole course</a><a class="btn sm" href="#/unlimited/exam/${co.id}" title="${EXAM_N} questions, ${EXAM_MIN} minutes, no hints">Practice like the test</a></div>
        ${co.units.map(u => `<div class="ul-unit"><div class="ul-unit-head"><h3>${esc(u.title)}</h3><a class="btn sm" href="#/unlimited/unit/${co.id}/${u.id}">Practice this unit</a></div><ul class="ul-skills">${u.skills.filter(inCourse).map(skillLink).join('')}</ul></div>`).join('')}</details>`).join('')}
      <div class="ul-sec-head"><h2>CPM books</h2><span class="muted small">A chapter or one lesson</span></div>
      ${A.cpm.map(bk => `<details class="card tight ul-course" ${H.courseVar(bk)}><summary>${H.mono(bk.icon, 'mono-sm')} <b>${esc(bk.title)}</b></summary>
        ${bk.chapters.map(ch => { const ls = ch.lessons.filter(l => lessonSkills(l).length); return ls.length ? `<div class="ul-unit"><div class="ul-unit-head"><h3>Chapter ${ch.n}: ${esc(ch.title)}</h3><a class="btn sm" href="#/unlimited/chapter/${bk.id}/${ch.n}">Practice this chapter</a></div>
          <div class="ul-lessons">${ls.map(l => `<a class="chip-btn" href="#/unlimited/lesson/${bk.id}/${enc(l.id)}" title="${esc(l.title || '')}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id)}</a>`).join('')}</div></div>` : ''; }).join('')}</details>`).join('')}`;
  }
  /** mix two courses (or CPM books): the learner's course and the one before it, to start with */
  function mixHtml() {
    const ui = uiGet(), st = S.get(), ok = id => !!partOf(id);
    const mine = st.profile.enrolled.find(id => !/^cpm:/.test(id) && A.courseById(id)) || (gradeCourses()[0] || A.courseById('math-7') || A.courses[0]).id;
    const c0 = A.courseById(mine), before = c0 && A.courses.filter(c => c.grade === c0.grade - 1 && !EXTRA.test(c.id))[0];
    const [a, b] = Array.isArray(ui.mix) && ui.mix.length === 2 && ui.mix.every(ok) ? ui.mix : [mine, before ? before.id : (A.courses.find(c => c.id !== mine) || {}).id];
    const opts = v => `<optgroup label="Courses">${A.courses.map(c => `<option value="${c.id}"${c.id === v ? ' selected' : ''}>${esc(c.title)}</option>`).join('')}</optgroup>${A.cpm.length ? `<optgroup label="CPM books">${A.cpm.map(bk => `<option value="cpm:${bk.id}"${'cpm:' + bk.id === v ? ' selected' : ''}>${esc(bk.title)}</option>`).join('')}</optgroup>` : ''}`;
    return `<section class="card tight ul-tool" id="ul-mix2" aria-labelledby="mx-h"><h3 id="mx-h">Mix two courses</h3>
      <p class="small muted">Questions from both, mixed together: good for keeping last year fresh while you learn this year’s.</p>
      <div class="ul-tool-row"><label class="visually-hidden" for="mx-a">First course</label><select id="mx-a">${opts(a)}</select><span class="small muted">and</span><label class="visually-hidden" for="mx-b">Second course</label><select id="mx-b">${opts(b)}</select></div>
      <p class="tiny muted" id="mx-n">${mixCount(a, b)}</p>
      <div class="btn-row"><a class="btn sm primary" id="mx-go" href="#/unlimited/mix/${enc(a)},${enc(b)}">Practice both, mixed</a></div></section>`;
  }
  const mixCount = (a, b) => { const x = partOf(a), y = partOf(b); return x && y ? `${H.plural(new Set(x.ids.concat(y.ids)).size, 'skill')} in all, with your weaker ones more often.` : ''; };
  /** a CPM chapter with the lessons to include: all of them to start with */
  function chapterHtml() {
    const st = S.get(), c = st.profile.cpm, ui = uiGet();
    const byGrade = { 6: 'cc1', 7: 'cc2', 8: 'cc3', 9: 'int1', 10: 'int2', 11: 'int3' }[st.profile.grade];
    const enrolled = (st.profile.enrolled.find(id => /^cpm:/.test(id)) || '').slice(4);
    const bk = A.cpmById(Array.isArray(ui.cpmch) && ui.cpmch[0]) || A.cpmById(c && c.book) || A.cpmById(enrolled) || A.cpmById(byGrade) || A.cpm[0];
    const f = c && c.book === bk.id ? A.cpmLesson(c.book, c.lesson) : null;
    const want = Array.isArray(ui.cpmch) && ui.cpmch[0] === bk.id ? Number(ui.cpmch[1]) : f ? (bk.chapters.find(ch => ch.lessons.includes(f.lesson)) || {}).n : null;
    const chs = bk.chapters.filter(ch => ch.lessons.some(l => lessonSkills(l).length)), ch = chs.find(x => x.n === want) || chs[0];
    return `<section class="card tight ul-tool" id="ul-cpmch" aria-labelledby="cc-h"><h3 id="cc-h">A CPM chapter, your way</h3>
      <p class="small muted">Choose a chapter, then the lessons to include.</p>
      <div class="ul-tool-row"><label class="visually-hidden" for="cc-book">Book</label><select id="cc-book">${A.cpm.map(b => `<option value="${b.id}"${b === bk ? ' selected' : ''}>${esc(b.short)}</option>`).join('')}</select>
        <label class="visually-hidden" for="cc-ch">Chapter</label><select id="cc-ch">${chs.map(x => `<option value="${x.n}"${x === ch ? ' selected' : ''}>Chapter ${x.n}: ${esc(x.title)}</option>`).join('')}</select></div>
      <div class="ul-lesson-pick" id="cc-lessons" role="group" aria-label="Lessons to include">${ch ? lessonChecks(bk, ch) : ''}</div>
      <div class="btn-row"><a class="btn sm primary" id="cc-go" href="#/unlimited/chapter/${bk.id}/${ch ? ch.n : 1}">Practice the whole chapter</a><button type="button" class="link-btn small" id="cc-all">Clear all</button></div></section>`;
  }
  const lessonChecks = (bk, ch) => ch.lessons.filter(l => lessonSkills(l).length).map(l => `<label class="chip-check" title="${esc(l.title || '')}"><input type="checkbox" value="${esc(l.id)}" checked><span>${esc(l.id)}</span></label>`).join('');
  function wireTools(root) {
    const ma = root.querySelector('#mx-a'), mb = root.querySelector('#mx-b'), mg = root.querySelector('#mx-go');
    if (ma) {
      const upd = () => {
        const same = ma.value === mb.value;
        mg.setAttribute('href', same ? (/^cpm:/.test(ma.value) ? `#/cpm/${ma.value.slice(4)}` : `#/unlimited/course/${ma.value}`) : `#/unlimited/mix/${enc(ma.value)},${enc(mb.value)}`);
        mg.textContent = same ? 'Practice this one' : 'Practice both, mixed';
        root.querySelector('#mx-n').textContent = same ? 'Choose two different ones to mix them.' : mixCount(ma.value, mb.value);
        uiSet({ mix: [ma.value, mb.value] });
      };
      ma.addEventListener('change', upd); mb.addEventListener('change', upd);
    }
    const cb = root.querySelector('#cc-book'), cc = root.querySelector('#cc-ch'), box = root.querySelector('#cc-lessons'), go = root.querySelector('#cc-go'), all = root.querySelector('#cc-all');
    if (!cb) return;
    const bookOf = () => A.cpmById(cb.value), chOf = () => bookOf().chapters.find(x => x.n === Number(cc.value));
    const upd = keep => {
      const bk = bookOf(), ch = chOf(), boxes = [...box.querySelectorAll('input')], on = boxes.filter(x => x.checked).map(x => x.value);
      box.querySelectorAll('.chip-check').forEach(l => l.classList.toggle('on', l.querySelector('input').checked));
      const whole = on.length === boxes.length;
      if (!on.length) { go.removeAttribute('href'); go.setAttribute('aria-disabled', 'true'); go.textContent = 'Choose a lesson'; }
      else { go.removeAttribute('aria-disabled'); go.setAttribute('href', whole ? `#/unlimited/chapter/${bk.id}/${ch.n}` : `#/unlimited/lesson/${bk.id}/${on.map(enc).join(',')}`); go.textContent = whole ? 'Practice the whole chapter' : `Practice ${H.plural(on.length, 'lesson')}`; }
      all.textContent = whole ? 'Clear all' : 'Choose all';
      if (keep) uiSet({ cpmch: [bk.id, ch.n] });           // the book and chapter chosen here are remembered on this device
    };
    cb.addEventListener('change', () => {
      const chs = bookOf().chapters.filter(ch => ch.lessons.some(l => lessonSkills(l).length));
      cc.innerHTML = chs.map(x => `<option value="${x.n}">Chapter ${x.n}: ${esc(x.title)}</option>`).join('');
      box.innerHTML = chs.length ? lessonChecks(bookOf(), chs[0]) : ''; upd(true);
    });
    cc.addEventListener('change', () => { box.innerHTML = lessonChecks(bookOf(), chOf()); upd(true); });
    box.addEventListener('change', () => upd());
    all.addEventListener('click', () => { const boxes = [...box.querySelectorAll('input')], to = !boxes.every(x => x.checked); boxes.forEach(x => { x.checked = to; }); upd(); });
    upd();
  }
  function page(root, tab) {
    if (leaving) leaving();
    const tabs = TABS.filter(t => t[0] !== 'topics' || topicsOn());
    if (!tabs.some(t => t[0] === tab)) tab = 'foryou';
    const st = S.get(), today = (st.days[S.today()] || {}).q || 0, ui = uiGet();
    const panel = (k, html) => `<section class="ul-panel" id="ul-p-${k}" role="tabpanel" aria-labelledby="ul-t-${k}"${k === tab ? '' : ' hidden'}>${html}</section>`;
    root.innerHTML = `<div class="unlimited">
      <div class="ul-head"><div><h1>Unlimited practice</h1>
        <p class="muted" style="margin:-4px 0 0">Practice any skill or topic for as long as you like. End session shows how you did.</p></div>
        <span class="stat-pill ul-today" title="Questions answered today, in every kind of practice">${today ? `Today: ${H.plural(today, 'question')}` : 'No questions yet today'}</span></div>
      <nav class="tabs ul-tabs" role="tablist" aria-label="Ways to practice">${tabs.map(([k, l, p, ic]) => `<a class="tab${k === tab ? ' on' : ''}" role="tab" id="ul-t-${k}" data-ultab="${k}" href="#/unlimited${p}" aria-controls="ul-p-${k}" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}">${ICONS.svg(ic, 17)}<span>${l}</span></a>`).join('')}</nav>
      ${panel('foryou', forYouHtml(ui))}
      ${panel('courses', coursesHtml())}
      ${tabs.some(t => t[0] === 'topics') ? panel('topics', TOPICS.card()) : ''}
      ${panel('pictures', shotCard())}
    </div>`;
    // the search: every skill whose title (or course) has all the words typed
    const index = pool('all').skills.map(id => ({ id, text: A.normText(A.stripTags(A.skills[id].title) + ' ' + A.whereIs(id).course.title + ' ' + A.whereIs(id).unit.title) }));
    const q = root.querySelector('#ul-q'), found = root.querySelector('#ul-found');
    q.addEventListener('input', () => {
      const words = A.normText(q.value).split(/\s+/).filter(Boolean);
      if (!words.length) { found.innerHTML = ''; return; }
      const hits = index.filter(x => words.every(w => x.text.includes(w))).slice(0, 30);
      found.innerHTML = hits.length ? hits.map(x => `<li><a href="#/unlimited/skill/${enc(x.id)}">${H.lvl(S.skill(x.id).level)} <span>${A.skills[x.id].title} <span class="muted small">· ${esc(A.whereIs(x.id).course.title)}</span></span></a></li>`).join('') : '<li class="muted small">No skill matches. Try fewer or shorter words.</li>';
    });
    root.querySelector('#ul-len').addEventListener('click', ev => {
      const b = ev.target.closest('[data-v]'); if (!b) return;
      root.querySelectorAll('#ul-len [data-v]').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      try { localStorage.setItem(LEN, b.dataset.v); } catch (e) { /* fine */ }
      root.querySelector('#ul-sug').innerHTML = suggestHtml(b.dataset.v);
      V.toast(b.dataset.v ? `Sessions last ${b.textContent.trim().toLowerCase()}` : 'Sessions have no limit');
    });
    root.querySelector('#ul-bell').addEventListener('change', ev => { uiSet({ bell: ev.target.checked }); if (ev.target.checked) V.toast('A sound plays when a timed session’s time is up'); });
    const rg = root.querySelector('#ul-resume-go');
    if (rg) {
      rg.addEventListener('click', () => { resumeNext = lastStop(); if (resumeNext) location.hash = resumeNext.href; });
      root.querySelector('#ul-resume-no').addEventListener('click', () => { S.setProfile({ ulLast: null }); root.querySelector('#ul-resume').remove(); });
    }
    // the open sections are remembered on this device
    root.querySelector('#ul-more').addEventListener('toggle', ev => uiSet({ more: ev.target.open }));
    wireSets(root, index);
    wireTools(root);
    root.__ulTab = wireTabs(root);
    if (window.TOPICS) TOPICS.wireCard(root);
    wireShot(root);
    H.tutorCtx(null);
  }
  /** the tabs: a click (or the arrow keys) shows a tab in place, and the address follows without drawing the page again */
  function wireTabs(root) {
    const list = root.querySelector('.ul-tabs');
    const show = (k, focus) => {
      const t = list.querySelector(`[data-ultab="${k}"]`);
      if (!t) return;
      list.querySelectorAll('[role="tab"]').forEach(x => { const on = x === t; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
      root.querySelectorAll('.ul-panel').forEach(p => { p.hidden = p.id !== 'ul-p-' + k; });
      const href = t.getAttribute('href');
      if (location.hash !== href && location.hash !== '#/unlimited/picture') { try { history.replaceState(history.state, '', href); } catch (e) { /* the address stays */ } }
      if (focus) t.focus();
    };
    list.addEventListener('click', ev => {
      const t = ev.target.closest('[data-ultab]');
      if (!t || ev.button || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;        // a new tab or window opens as usual
      ev.preventDefault(); show(t.dataset.ultab);
    });
    list.addEventListener('keydown', ev => {
      const all = [...list.querySelectorAll('[role="tab"]')], at = all.indexOf(document.activeElement);
      if (at < 0) return;
      const to = ev.key === 'ArrowRight' ? (at + 1) % all.length : ev.key === 'ArrowLeft' ? (at - 1 + all.length) % all.length : ev.key === 'Home' ? 0 : ev.key === 'End' ? all.length - 1 : -1;
      if (to < 0) return;
      ev.preventDefault(); show(all[to].dataset.ultab, true);
    });
    return show;
  }

  /* ---------- questions like one in a picture or typed in: matched to Procademy's own skills, so they begin at once ---------- */
  let lastShot = null;                  // the last picture or question, for the note above its questions
  const clipText = t => { const s = String(t).replace(/\s+/g, ' ').trim().replace(/[.?!:;,]+$/, ''); return s.length > 90 ? s.slice(0, 87) + '…' : s; };
  /** words for the kind of math a question shows, from its symbols: 3/4 + 1/6 is adding fractions, 2x + 5 = 17 an
      equation, −7 + 4 negative numbers. They join the question's own words when it is matched to skills. */
  function mathWords(raw) {
    const t = String(raw || '').replace(/[–—−]/g, '-').replace(/(\d)\s+[x×]\s+(\d)/g, '$1 * $2').replace(/\s+/g, ' ').trim(), w = [];
    const F = '\\d+\\s*/\\s*\\d+', frac = new RegExp(F).test(t);
    const pair = op => new RegExp(`${F}\\s*(?:${op})\\s*\\(?\\s*-?\\s*(?:\\d+\\s+)?${F}`).test(t);
    const vars = /(\d|[=+\-<>≤≥^(*\/])\s*[a-z](?![a-z])|(^|[^a-z])[a-z]\s*(?=[=<>≤≥^²³]|[+\-]\s*\d)/i.test(t);
    const neg = /(^|[(=+*×÷\/,:])\s*-\s*\d/.test(t) || /[+\-*×÷]\s*\(\s*-/.test(t);
    const ops = (t.match(/[\d)]\s*[+\-*×÷·]\s*[(\d-]/g) || []).map(x => x.replace(/[\d()\s]/g, '').charAt(0));
    const words = (t.match(/[a-z]{3,}/gi) || []).length;
    if (frac) w.push(pair('\\+|-') ? 'adding subtracting fractions' : pair('\\*|×|·') ? 'multiplying fractions' : pair('÷') ? 'dividing fractions' : 'fractions');
    if (/\d+\s+\d+\s*\/\s*\d+/.test(t)) w.push('mixed numbers');
    if (neg && !vars && !frac) w.push(ops.some(o => '*×÷·'.includes(o)) || /\)\s*\(/.test(t) ? 'multiplying dividing negative' : ops.includes('+') && !ops.includes('-') ? 'adding negative' : ops.includes('-') && !ops.includes('+') ? 'subtracting negative' : 'adding subtracting negative');
    if (/%|percent/i.test(t)) w.push(/interest/i.test(t) ? 'simple interest' : /discount|sale|\boff\b|increase|decrease|markup|change/i.test(t) ? 'percent increase decrease' : 'percent');
    if (/√|sqrt|square root/i.test(t)) w.push('square roots');
    const quad = vars && /=/.test(t) && /[a-z]\s*(\^\s*2|²)/i.test(t);
    if (/\d\s*[*×x]\s*10\s*(\^|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻])/.test(t)) w.push('scientific notation');
    else if (quad) w.push('solving quadratic equations');
    else if (/\^|[²³⁴⁵]/.test(t)) w.push(vars ? 'exponent properties' : /\^\s*-|⁻/.test(t) ? 'negative exponents' : 'exponents');
    if (/\|[^|]+\|/.test(t)) w.push('absolute value');
    if (vars && !quad) {
      if (/[<>≤≥]/.test(t)) w.push(/\d\s*[a-z]\s*[+\-]\s*\d/i.test(t) ? 'two-step inequalities' : 'inequalities');
      else if (/\by\s*=/.test(t) && /x/.test(t)) w.push((t.match(/=/g) || []).length > 1 ? 'solving systems equations' : 'slope graphing lines');
      else if (/=/.test(t)) w.push('solving equations' + (/\(/.test(t) ? ' parentheses' : /\d\s*[a-z]\s*[+\-]\s*\d/i.test(t) ? ' two-step' : ''));
      else w.push(/\(/.test(t) ? 'distributive property' : 'expressions');
    } else if (!vars && !frac && !neg && (new Set(ops).size > 1 || (/\(/.test(t) && ops.length))) w.push('order operations');
    if ((t.match(/\(\s*-?\d+\s*,\s*-?\d+\s*\)/g) || []).length >= 2) w.push('slope rate change');
    if (/\d+\s*:\s*\d+|\bratio|unit rate|for every/i.test(t)) w.push('ratio language rates');
    if (/\bmean\b|average|median|\bmode\b/i.test(t)) w.push('median mode range');
    if (/probabilit|chance|likel/i.test(t)) w.push(/\band\b|both|then|twice|two (coins|dice|number cubes)/i.test(t) ? 'compound probability' : 'simple probability');
    if (!w.length && /\d\.\d/.test(t) && !/\d\.\d+\.\d/.test(t) && words < 3) w.push('decimals');
    return w.join(' ');
  }
  /** the skills most like a question: its words and its kind of math, near the learner's grade (at most 3) */
  function likeThis(text) {
    if (!window.TUTORPAGE) return [];
    const g = S.get().profile.grade, hint = mathWords(text), out = [];
    const add = ids => ids.forEach(id => { if (inCourse(id) && !out.includes(id)) out.push(id); });
    add(TUTORPAGE.related(text + ' ' + hint, g));
    if (hint) add(TUTORPAGE.related(hint, g));
    return out.slice(0, 3);
  }
  /* recent pictures and questions, on this device (per learner): the words read and the skills found */
  const SHOTS = 'procademy.shots.v1';
  const recentShots = () => { try { const v = JSON.parse(localStorage.getItem(SHOTS) || '[]'); return Array.isArray(v) ? v.filter(x => x && typeof x.text === 'string' && Array.isArray(x.ids)).slice(0, 6) : []; } catch (e) { return []; } };
  function rememberShot(text, ids) {
    const t = clipText(text), list = [{ text: t, ids: ids.slice(0, 3), t: Date.now() }].concat(recentShots().filter(x => x.text !== t));
    try { localStorage.setItem(SHOTS, JSON.stringify(list.slice(0, 6))); } catch (e) { /* fine */ }
  }
  /** a worksheet's numbered questions, one by one ("1. …", "2) …"); a single question comes back as one */
  function splitQuestions(text) {
    const lines = String(text || '').split(/\n+/), out = [];
    lines.forEach(l => { if (/^\s*\(?\d{1,2}[.)]\s+\S/.test(l)) out.push(l.replace(/^\s*\(?\d{1,2}[.)]\s+/, '')); else if (out.length && l.trim()) out[out.length - 1] += ' ' + l.trim(); });
    return out.length >= 2 ? out.map(x => x.trim()).filter(Boolean).slice(0, 12) : [String(text || '').trim()];
  }
  let pending = null;                   // a picture pasted on Home, read when the Practice page opens
  const coarse = () => !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  function shotCard() {
    const recent = recentShots();
    return `<section class="card ul-shot" id="ul-shot" aria-labelledby="shot-h">
      <div class="ul-shot-head"><span class="tool-ic">${ICONS.svg('image', 22)}</span><div><h2 id="shot-h">Questions like yours</h2>
        <p class="small muted">Add a screenshot, photo or PDF of a question, or type it in. Procademy finds the skill and makes new questions like it, ready at once.</p></div></div>
      <div class="ul-shot-row">${window.FILES ? `<button class="btn primary" type="button" id="shot-pick">${ICONS.svg('image', 18)} Choose a picture or PDF</button><input type="file" id="shot-file" accept="image/*,application/pdf,.pdf" hidden>
        ${coarse() ? `<button class="btn" type="button" id="shot-camera">Take a photo</button><input type="file" id="shot-cam" accept="image/*" capture="environment" hidden>` : ''}` : ''}
        <form class="ul-shot-type" id="shot-form"><label class="visually-hidden" for="shot-text">Type a question</label><input id="shot-text" type="text" autocomplete="off" placeholder="Or type one, like 3/4 + 1/6"><button class="btn" type="submit">Find</button></form></div>
      ${window.FILES ? '<p class="tiny muted shot-paste" style="margin:10px 0 0">You can also paste a screenshot (Ctrl+V, or Command+V on a Mac) or drop a picture or PDF here, even a whole worksheet. It stays on this device.</p>' + tipsHtml() : ''}
      ${recent.length ? `<div class="shot-recent"><span class="tiny muted">Recent</span>${recent.map(x => `<a class="chip-btn" data-raw href="#/unlimited/similar/${x.ids.map(enc).join(',')}" title="${esc(x.text)}">${esc(x.text.length > 34 ? x.text.slice(0, 32) + '…' : x.text)}</a>`).join('')}</div>` : ''}
      <div id="shot-out" aria-live="polite"></div></section>`;
  }
  /** tips for a photo the reader can read, handwriting most of all */
  const tipsHtml = () => `<details class="shot-tips"><summary>Tips for photos of handwriting</summary><ul class="small">
    <li>Lay the page flat in good light, with no shadow from your hand or phone.</li>
    <li>Hold the phone straight above the page, close enough that the question fills the picture.</li>
    <li>One question at a time reads best: crop the picture to it.</li>
    <li>Write in dark pencil or pen, with a little space between numbers and signs.</li>
    <li>Write fractions on one line, like 3/4, and make an x look different from a times sign.</li>
    <li>If something is read wrong, fix it in the box. Practice starts from what the box says.</li></ul></details>`;
  /** how sure the reader is, and other ways to read the words it was least sure of (each a tap to use) */
  function sureHtml(sure) {
    if (!sure || (sure.conf == null && !(sure.unsure || []).length)) return '';
    const c = sure.conf, said = c == null ? '' : c >= 85 ? 'Sure it read this right' : c >= 60 ? 'Fairly sure it read this right' : 'Not sure it read this right. Check the words, or crop or turn the picture.';
    return `<div class="shot-sure${c != null && c < 60 ? ' low' : ''}">${c != null ? `<div class="sure-line"><span class="sure-meter" aria-hidden="true"><span style="width:${c}%"></span></span><span class="small">${said} <span class="muted">(${c}%)</span></span></div>` : ''}
      ${sure.unsure.length ? `<div class="shot-alts"><span class="tiny muted">${c == null ? 'Could it be' : 'Not sure of these. Could it be'}</span>${sure.unsure.map((u, k) => `<span class="shot-alt" data-w="${k}">${u.alts.map((a, j) => `<button type="button" class="chip-btn" data-alt="${k}:${j}" title="Change “${esc(u.word)}” to “${esc(a)}”">${esc(u.word)} → ${esc(a)}</button>`).join('')}</span>`).join('')}</div>` : ''}</div>`;
  }
  const reEsc = t => String(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function wireShot(root) {
    const box = root.querySelector('#ul-shot'); if (!box) return;
    const out = box.querySelector('#shot-out'), file = box.querySelector('#shot-file'), cam = box.querySelector('#shot-cam');
    // the text reader is fetched the first time, so start it as soon as the learner heads for the box
    if (window.FILES) ['pointerenter', 'focusin', 'touchstart'].forEach(e => box.addEventListener(e, () => FILES.warm(), { once: true, passive: true }));
    const g = S.get().profile.grade;
    const card = (ids, k) => { const id = ids[k], w = A.whereIs(id); return `<a class="card tight shot-match${k ? '' : ' best'}" href="#/unlimited/similar/${[id].concat(ids.filter(x => x !== id)).map(enc).join(',')}">${k ? '' : '<span class="chip up">Best match</span>'}<b>${A.skills[id].title}</b><span class="small muted">${esc(w.course.title)} · ${esc(w.unit.title)}</span><span class="shot-go">${k ? 'Practice this one' : 'Start practicing'}</span></a>`; };
    const none = text => `<div class="shot-none"><p class="small" style="margin:0 0 8px">${text ? `No math skill matched “${esc(clipText(text))}”.` : 'Type or read a question first.'}</p>
      <div class="btn-row" style="margin-top:0">${text && window.TOPICS && !window.PROCADEMY_OFFLINE ? `<a class="btn sm primary" href="${TOPICS.href(TOPICS.clip(text), g)}">Practice it as a topic</a>` : ''}<button class="btn sm" type="button" data-find>Find a skill instead</button></div></div>`;
    /** the skills a question (or each question of a worksheet) matches, as cards to pick from */
    const matchHtml = text => {
      const qs = splitQuestions(text);
      if (qs.length > 1) {
        const rows = qs.map(q => ({ q, id: likeThis(q)[0] })), ids = [...new Set(rows.map(r => r.id).filter(Boolean))];
        if (!ids.length) return { html: none(text), ids: [] };
        return { ids, html: `<div class="shot-sheet"><p class="small" style="margin:0 0 8px"><b>${H.plural(qs.length, 'question')}</b> on this worksheet.</p>
          <ol class="shot-qs">${rows.map(r => `<li><span class="shot-q">${esc(clipText(r.q))}</span>${r.id ? `<a class="btn sm" href="#/unlimited/similar/${enc(r.id)}">${A.skills[r.id].title}</a>` : '<span class="tiny muted">No skill found</span>'}</li>`).join('')}</ol>
          <div class="btn-row"><a class="btn primary" href="#/unlimited/set/${ids.map(enc).join(',')}/${enc('Your worksheet')}">Practice all of them, mixed</a></div></div>` };
      }
      const ids = likeThis(text);
      return ids.length ? { ids, html: `<div class="shot-matches">${ids.map((id, k) => card(ids, k)).join('')}</div>` } : { html: none(text), ids: [] };
    };
    const showMatches = (where, text, thumb) => {
      const m = matchHtml(text);
      where.innerHTML = m.html;
      if (m.ids.length) { lastShot = { text, thumb, ids: m.ids }; rememberShot(text, m.ids); }
      const fb = where.querySelector('[data-find]');
      if (fb) fb.addEventListener('click', () => { const q = root.querySelector('#ul-q'); if (q) { q.scrollIntoView({ block: 'center' }); q.focus(); } });
    };
    /** after a picture is read: what was read (to fix if need be), and the matches, updated as it is fixed */
    const openTips = () => { const t = box.querySelector('.shot-tips'); if (t) t.open = true; };
    const review = (r, src) => {
      const text = r.text, thumb = r.thumb, canCrop = !!(src && /^image\//.test(src.type || '') && FILES.crop), sure = r.sure;
      out.innerHTML = `<div class="shot-review">${thumb ? `<img class="shot-thumb" src="${thumb}" alt="Your picture">` : ''}<div class="shot-read"><label for="shot-read" class="small"><b>What Procademy read</b> <span class="muted">(fix anything it got wrong)</span></label>
        <textarea id="shot-read" rows="3" spellcheck="false">${esc(text)}</textarea>${sureHtml(sure)}${canCrop ? '<button type="button" class="btn sm" id="shot-crop">Crop or turn, and read again</button>' : ''}</div></div><div id="shot-found"></div>`;
      if (sure && sure.conf != null && sure.conf < 60) openTips();
      const ta = out.querySelector('#shot-read'), found = out.querySelector('#shot-found');
      const cb = out.querySelector('#shot-crop');
      if (cb) cb.addEventListener('click', async () => { const part = await FILES.crop(src); if (part && part !== src && box.isConnected) read(part); });
      // another way to read a word: it goes into the box, and the matches follow
      out.querySelectorAll('[data-alt]').forEach(b => b.addEventListener('click', () => {
        const [k, j] = b.dataset.alt.split(':').map(Number), u = sure.unsure[k], re = new RegExp('(^|\\s)' + reEsc(u.word) + '(?=\\s|$)');
        ta.value = re.test(ta.value) ? ta.value.replace(re, (m0, pre) => pre + u.alts[j]) : ta.value.replace(u.word, u.alts[j]);
        const g = out.querySelector(`.shot-alt[data-w="${k}"]`); if (g) g.remove();
        const left = out.querySelector('.shot-alts'); if (left && !left.querySelector('.shot-alt')) left.remove();
        showMatches(found, ta.value, thumb); ta.focus({ preventScroll: true });
      }));
      showMatches(found, text, thumb);
      let tm = 0; ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => showMatches(found, ta.value, thumb), 250); });
    };
    async function read(f) {
      if (box.closest('[hidden]') && root.__ulTab) root.__ulTab('pictures');       // pasted on another tab: show it being read
      out.innerHTML = `<div class="shot-reading"><span class="small" id="shot-say">${/pdf/i.test(f.type || '') || /\.pdf$/i.test(f.name || '') ? 'Reading your PDF…' : 'Reading your picture…'}</span><span class="pbar"><span id="shot-bar" style="width:4%"></span></span></div>`;
      const r = await FILES.read(f, pr => { const say = out.querySelector('#shot-say'), bar = out.querySelector('#shot-bar'); if (say && pr.text) say.textContent = pr.text; if (bar) bar.style.width = Math.max(4, Math.round((pr.fraction || 0) * 100)) + '%'; });
      if (!box.isConnected) return;
      if (r.error) { out.innerHTML = `<p class="small shot-err">${esc(r.error)}</p>`; return; }
      if (!r.text || !r.text.trim()) { out.innerHTML = `<p class="small shot-err">${navigator.onLine === false ? 'Reading a picture needs the internet the first time. Type the question instead.' : r.kind === 'pdf' ? 'No words could be read in this PDF. Try a picture of the page, or type the question.' : 'No words could be read in this picture. Try a sharper screenshot, or crop or turn it.'}</p>${r.kind === 'image' && FILES.crop ? '<button type="button" class="btn sm" id="shot-crop0">Crop or turn the picture</button>' : ''}`; if (r.kind === 'image') openTips(); const c0 = out.querySelector('#shot-crop0'); if (c0) c0.addEventListener('click', async () => { const part = await FILES.crop(f); if (part && part !== f && box.isConnected) read(part); }); return; }
      review(r, f);
    }
    box.__read = read;
    /** a photo (from a camera, so often sideways) is checked first: turned the right way up, or cropped, then read.
        A screenshot or PDF is read at once. */
    const isPhoto = f => /^image\/(jpe?g|heic|heif)$/i.test(f.type || '') || /\.(jpe?g|heic|heif)$/i.test(f.name || '');
    function prepare(f) {
      if (!isPhoto(f) || !FILES.rotate) return read(f);
      if (box.closest('[hidden]') && root.__ulTab) root.__ulTab('pictures');
      let turns = 0, url = '';
      try { url = URL.createObjectURL(f); } catch (e) { return read(f); }
      out.innerHTML = `<div class="shot-check"><div class="shot-prev-box"><img class="shot-prev" id="shot-prev" src="${url}" alt="Your photo"></div><div class="shot-check-side"><p class="small" style="margin:0"><b>Check your photo first.</b> Turn it so the writing is upright, or crop it to one question.</p>
        <div class="btn-row"><button type="button" class="btn primary" id="shot-go">Read it</button><button type="button" class="btn" id="shot-left">Turn left</button><button type="button" class="btn" id="shot-right">Turn right</button><button type="button" class="btn ghost" id="shot-cropb">Crop</button></div></div></div>`;
      const img = out.querySelector('#shot-prev'), turn = by => { turns += by; img.style.transform = `rotate(${turns * 90}deg)`; };
      out.querySelector('#shot-left').addEventListener('click', () => turn(-1));
      out.querySelector('#shot-right').addEventListener('click', () => turn(1));
      out.querySelector('#shot-go').addEventListener('click', async () => { const g = await FILES.rotate(f, turns); URL.revokeObjectURL(url); if (box.isConnected) read(g); });
      out.querySelector('#shot-cropb').addEventListener('click', async () => { const part = await FILES.crop(await FILES.rotate(f, turns)); if (part && box.isConnected) { URL.revokeObjectURL(url); read(part); } });
      out.__turns = () => turns;                                                       // for the test suite
      setTimeout(() => { const g = out.querySelector('#shot-go'); if (g) g.focus({ preventScroll: true }); }, 0);
    }
    if (file) {
      box.querySelector('#shot-pick').addEventListener('click', () => file.click());
      file.addEventListener('change', () => { if (file.files[0]) prepare(file.files[0]); file.value = ''; });
      if (cam) { box.querySelector('#shot-camera').addEventListener('click', () => cam.click()); cam.addEventListener('change', () => { if (cam.files[0]) prepare(cam.files[0]); cam.value = ''; }); }
      // a screenshot pasted anywhere on the page, or dropped on the box
      const onPaste = ev => {
        if (!box.isConnected) { document.removeEventListener('paste', onPaste); return; }
        const f = ev.clipboardData && [...ev.clipboardData.files].find(x => /^image\//.test(x.type));
        if (f) { ev.preventDefault(); read(f); }
      };
      document.addEventListener('paste', onPaste);
      box.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); box.classList.add('dropping'); } });
      box.addEventListener('dragleave', ev => { if (!box.contains(ev.relatedTarget)) box.classList.remove('dropping'); });
      box.addEventListener('drop', ev => { box.classList.remove('dropping'); const f = ev.dataTransfer && ev.dataTransfer.files[0]; if (f) { ev.preventDefault(); prepare(f); } });
    }
    box.querySelector('#shot-form').addEventListener('submit', ev => { ev.preventDefault(); const t = box.querySelector('#shot-text').value.trim(); if (t) showMatches(out, t, null); });
  }
  /** Home: a screenshot pasted there opens the Practice page and is read like one chosen there */
  function wirePaste(root) {
    if (!window.FILES) return;
    const onPaste = ev => {
      if (!root.isConnected || root.querySelector('#ul-shot')) { document.removeEventListener('paste', onPaste); return; }
      if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
      const f = ev.clipboardData && [...ev.clipboardData.files].find(x => /^image\//.test(x.type));
      if (f) { ev.preventDefault(); pending = f; location.hash = '#/unlimited/picture'; }
    };
    document.addEventListener('paste', onPaste);
    window.addEventListener('hashchange', () => document.removeEventListener('paste', onPaste), { once: true });
  }
  const U = { page, play, pool, likeThis, mathWords, splitQuestions, wirePaste, dayskill, mySets, keepSet, readVs, _bell: null, _lastVs: null };
  window.UNLIMITED = U;
})();
