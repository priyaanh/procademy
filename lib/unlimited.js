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
    if (kind === 'lesson') { const f = A.cpmLesson(a, b); return f ? { title: lessonTitle(f.book, f.lesson), skills: lessonSkills(f.lesson), cpm: { book: f.book.id, lesson: f.lesson.id } } : null; }
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
    if (kind === 'set') { const ids = [...new Set(String(a || '').split(',').filter(inCourse))].slice(0, 12); return ids.length ? { title: 'Your worksheet', skills: ids } : null; }
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
  /* ---------- how long a session lasts: without end, a number of questions, or a number of minutes ---------- */
  const LEN = 'procademy.ullen.v1', LENS = [['', 'No limit'], ['q10', '10 questions'], ['q20', '20 questions'], ['m5', '5 minutes'], ['m10', '10 minutes']];
  const lenPref = () => { try { const v = localStorage.getItem(LEN) || ''; return LENS.some(x => x[0] === v) ? v : ''; } catch (e) { return ''; } };
  const limitOf = v => (/^q\d+$/.test(v) ? { questions: Number(v.slice(1)) } : /^m\d+$/.test(v) ? { minutes: Number(v.slice(1)) } : null);
  /** watch a running session: show what is left, and end it (with its summary) once the limit is reached and the
      question on screen hasn't been tried; onAnswer hears the running tally */
  function limitSession(root, limit, onAnswer) {
    const t0 = Date.now(); let chip = null;
    const timer = setInterval(() => {
      const s = root.__session;
      if (!root.isConnected || !s || s.kind !== 'endless' || s.stopped) { clearInterval(timer); return; }
      const t = E.tally(s);
      if (onAnswer) onAnswer(t);
      if (!limit) return;
      const left = limit.minutes ? limit.minutes * 60000 - (Date.now() - t0) : 0, up = limit.questions ? t.n >= limit.questions : left <= 0;
      const head = root.querySelector('.ex-head');
      if (head && (!chip || !chip.isConnected)) { chip = document.createElement('span'); chip.className = 'stat-pill ul-limit'; head.appendChild(chip); }
      if (chip) chip.textContent = limit.questions ? `${Math.min(t.n, limit.questions)} of ${limit.questions}` : up ? 'Time’s up: finish this one' : `${Math.floor(left / 60000)}:${String(Math.floor(left % 60000 / 1000)).padStart(2, '0')} left`;
      const r = s.results[s.i];
      if (up && !(r && r.tries)) { const stop = root.querySelector('#stop'); if (stop) { clearInterval(timer); stop.click(); } }
    }, 300);
  }
  const gradeCourses = () => { const g = S.get().profile.grade; return g == null ? [] : A.courses.filter(c => c.grade === g && !/^int-/.test(c.id)); };
  const gradeName = () => { const g = S.get().profile.grade; return g === 0 ? 'Kindergarten' : g <= 8 ? `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade` : gradeCourses().map(c => c.title).join(' and '); };

  /** practicing one pool, without end */
  function play(root, kind, a, b) {
    if (kind === 'topic' && window.TOPICS) return TOPICS.page(root, a, b);      // any topic, written by the free AI
    if (kind === 'picture') {
      page(root);
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
    const limit = p.limit || limitOf(lenPref());
    let first = true;
    const start = () => {
      H.exercise(root, E.endless({ skills: p.skills, title: (p.day ? '' : 'Unlimited · ') + p.title, cpm: p.cpm, seed: first && p.seed ? p.seed : undefined }), { back: p.day ? '#/' : '#/unlimited', backLabel: p.day ? 'Home' : 'Unlimited practice', again: start, againLabel: p.day ? 'More like it' : 'Continue practicing' });
      first = false;
      limitSession(root, limit, p.day ? t => { if (t.n >= 1 && S.get().profile.pod !== S.today()) S.setProfile({ pod: S.today() }); } : null);
    };
    start();
    if (p.day) {
      const head = root.querySelector('.ex-head'), w = A.whereIs(p.skills[0]);
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">One new question each day, from <b>${A.skills[p.skills[0]].title}</b>${w ? ` (${esc(w.course.title)})` : ''}.</p>`);
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

  /** the page: the picks used most, how long a session lasts, questions like a picture, a search over every skill,
      any topic, then every course and CPM book, and the other ways to practice */
  const UI = 'procademy.ui.unlimited';
  const uiGet = () => { try { return JSON.parse(localStorage.getItem(UI) || '{}') || {}; } catch (e) { return {}; } };
  const uiSet = patch => { try { localStorage.setItem(UI, JSON.stringify(Object.assign(uiGet(), patch))); } catch (e) { /* fine */ } };
  function page(root) {
    const st = S.get(), mine = pool('mine').skills, due = E.dueSkills(), saved = pool('saved').skills, all = pool('all').skills, weak = pool('weak').skills, test = testChapter();
    const c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), gc = gradeCourses(), today = (st.days[S.today()] || {}).q || 0, ui = uiGet();
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
    /** on a wide screen, rows of 3 or 4 cards, whichever leaves fewer gaps in the last row */
    const cols = n => ((4 - n % 4) % 4 <= (3 - n % 3) % 3 ? 4 : 3);
    const pickHtml = ([href, name, line, ic]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`;
    const skillLink = id => `<li><a href="#/unlimited/skill/${enc(id)}">${H.lvl(S.skill(id).level)} <span>${A.skills[id].title}</span></a></li>`;
    const len = lenPref();
    root.innerHTML = `<div class="unlimited">
      <div class="ul-head"><div><h1>Unlimited practice</h1>
        <p class="muted" style="margin:-4px 0 0">Practice any skill or topic for as long as you like. End session shows how you did.</p></div>
        <span class="stat-pill ul-today" title="Questions answered today, in every kind of practice">${today ? `Today: ${H.plural(today, 'question')}` : 'No questions yet today'}</span></div>
      <div class="ul-picks even" style="--cols:${cols(picks.length)}">${picks.map(pickHtml).join('')}</div>
      <div class="card tight ul-len"><div class="set-row"><div class="set-text"><span class="set-label" id="ul-len-l">How long a session lasts</span><span class="set-help">For every kind of unlimited practice. End session works any time.</span></div>
        <div class="seg" id="ul-len" role="radiogroup" aria-labelledby="ul-len-l">${LENS.map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === len}" data-v="${v}">${l}</button>`).join('')}</div></div></div>
      ${shotCard()}
      <div class="card tight ul-find"><label for="ul-q" class="label">Find any skill</label><input id="ul-q" type="search" autocomplete="off" placeholder="Fractions, slope, area, factoring…"><ul class="ul-skills" id="ul-found"></ul></div>
      ${window.TOPICS && !window.PROCADEMY_OFFLINE ? TOPICS.card() : ''}
      <details class="ul-every" id="ul-every"${ui.every ? ' open' : ''}><summary><h2>Every course and CPM book</h2><span class="muted small">A whole course, a unit, a chapter or one skill</span></summary>
      ${A.courses.map(co => `<details class="card tight ul-course" ${H.courseVar(co)}><summary>${H.mono(co.icon, 'mono-sm')} <b>${esc(co.title)}</b> <span class="muted small">${H.plural(A.courseSkills(co).length, 'skill')}</span></summary>
        <div class="btn-row"><a class="btn sm primary" href="#/unlimited/course/${co.id}">Practice the whole course</a></div>
        ${co.units.map(u => `<div class="ul-unit"><div class="ul-unit-head"><h3>${esc(u.title)}</h3><a class="btn sm" href="#/unlimited/unit/${co.id}/${u.id}">Practice this unit</a></div><ul class="ul-skills">${u.skills.filter(inCourse).map(skillLink).join('')}</ul></div>`).join('')}</details>`).join('')}
      <h3 class="ul-books">CPM books</h3>
      ${A.cpm.map(bk => `<details class="card tight ul-course" ${H.courseVar(bk)}><summary>${H.mono(bk.icon, 'mono-sm')} <b>${esc(bk.title)}</b></summary>
        ${bk.chapters.map(ch => { const ls = ch.lessons.filter(l => lessonSkills(l).length); return ls.length ? `<div class="ul-unit"><div class="ul-unit-head"><h3>Chapter ${ch.n}: ${esc(ch.title)}</h3><a class="btn sm" href="#/unlimited/chapter/${bk.id}/${ch.n}">Practice this chapter</a></div>
          <div class="ul-lessons">${ls.map(l => `<a class="chip-btn" href="#/unlimited/lesson/${bk.id}/${enc(l.id)}" title="${esc(l.title || '')}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id)}</a>`).join('')}</div></div>` : ''; }).join('')}</details>`).join('')}</details>
      <details class="ul-every" id="ul-more"${ui.more === false ? '' : ' open'}><summary><h2>More ways to practice</h2><span class="muted small">Today’s plan, mistakes, sprints, flashcards and puzzles</span></summary>
      <div class="ul-picks more even" style="--cols:3">${[['#/daily', 'Today’s practice', 'Review, corrections and new skills, picked for you', 'calendar'], ['#/unlimited/day', 'Problem of the day', 'One new question at your level, every day', 'target'], ['#/review', 'Your mistakes', 'Every question you’ve missed, until you get it right', 'review'], ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts', 'timer'], ['#/words/cards', 'Math vocabulary flashcards', 'Spaced review of math terms', 'book'], ['#/leap', 'Leap', '80 puzzles, and a new one every day', 'flag']].map(pickHtml).join('')}</div></details>
    </div>`;
    // the search: every skill whose title (or course) has all the words typed
    const index = all.map(id => ({ id, text: A.normText(A.stripTags(A.skills[id].title) + ' ' + A.whereIs(id).course.title + ' ' + A.whereIs(id).unit.title) }));
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
      V.toast(b.dataset.v ? `Sessions last ${b.textContent.trim().toLowerCase()}` : 'Sessions have no limit');
    });
    // the open sections are remembered on this device
    root.querySelector('#ul-every').addEventListener('toggle', ev => uiSet({ every: ev.target.open }));
    root.querySelector('#ul-more').addEventListener('toggle', ev => uiSet({ more: ev.target.open }));
    if (window.TOPICS) TOPICS.wireCard(root);
    wireShot(root);
    H.tutorCtx(null);
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
      ${window.FILES ? '<p class="tiny muted shot-paste" style="margin:10px 0 0">You can also paste a screenshot (Ctrl+V, or Command+V on a Mac) or drop a picture or PDF here, even a whole worksheet. It stays on this device.</p>' : ''}
      ${recent.length ? `<div class="shot-recent"><span class="tiny muted">Recent</span>${recent.map(x => `<a class="chip-btn" data-raw href="#/unlimited/similar/${x.ids.map(enc).join(',')}" title="${esc(x.text)}">${esc(x.text.length > 34 ? x.text.slice(0, 32) + '…' : x.text)}</a>`).join('')}</div>` : ''}
      <div id="shot-out" aria-live="polite"></div></section>`;
  }
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
          <div class="btn-row"><a class="btn primary" href="#/unlimited/set/${ids.map(enc).join(',')}">Practice all of them, mixed</a></div></div>` };
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
    const review = (text, thumb, src) => {
      const canCrop = !!(src && /^image\//.test(src.type || '') && FILES.crop);
      out.innerHTML = `<div class="shot-review">${thumb ? `<img class="shot-thumb" src="${thumb}" alt="Your picture">` : ''}<div class="shot-read"><label for="shot-read" class="small"><b>What Procademy read</b> <span class="muted">(fix anything it got wrong)</span></label>
        <textarea id="shot-read" rows="3" spellcheck="false">${esc(text)}</textarea>${canCrop ? '<button type="button" class="btn sm" id="shot-crop">Crop and read again</button>' : ''}</div></div><div id="shot-found"></div>`;
      const ta = out.querySelector('#shot-read'), found = out.querySelector('#shot-found');
      const cb = out.querySelector('#shot-crop');
      if (cb) cb.addEventListener('click', async () => { const part = await FILES.crop(src); if (part && part !== src && box.isConnected) read(part); });
      showMatches(found, text, thumb);
      let tm = 0; ta.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => showMatches(found, ta.value, thumb), 250); });
    };
    async function read(f) {
      out.innerHTML = `<div class="shot-reading"><span class="small" id="shot-say">${/pdf/i.test(f.type || '') || /\.pdf$/i.test(f.name || '') ? 'Reading your PDF…' : 'Reading your picture…'}</span><span class="pbar"><span id="shot-bar" style="width:4%"></span></span></div>`;
      const r = await FILES.read(f, pr => { const say = out.querySelector('#shot-say'), bar = out.querySelector('#shot-bar'); if (say && pr.text) say.textContent = pr.text; if (bar) bar.style.width = Math.max(4, Math.round((pr.fraction || 0) * 100)) + '%'; });
      if (!box.isConnected) return;
      if (r.error) { out.innerHTML = `<p class="small shot-err">${esc(r.error)}</p>`; return; }
      if (!r.text || !r.text.trim()) { out.innerHTML = `<p class="small shot-err">${navigator.onLine === false ? 'Reading a picture needs the internet the first time. Type the question instead.' : r.kind === 'pdf' ? 'No words could be read in this PDF. Try a picture of the page, or type the question.' : 'No words could be read in this picture. Try a sharper screenshot, or crop it to the question.'}</p>${r.kind === 'image' && FILES.crop ? '<button type="button" class="btn sm" id="shot-crop0">Crop the picture</button>' : ''}`; const c0 = out.querySelector('#shot-crop0'); if (c0) c0.addEventListener('click', async () => { const part = await FILES.crop(f); if (part && part !== f && box.isConnected) read(part); }); return; }
      review(r.text, r.thumb, f);
    }
    box.__read = read;
    if (file) {
      box.querySelector('#shot-pick').addEventListener('click', () => file.click());
      file.addEventListener('change', () => { if (file.files[0]) read(file.files[0]); file.value = ''; });
      if (cam) { box.querySelector('#shot-camera').addEventListener('click', () => cam.click()); cam.addEventListener('change', () => { if (cam.files[0]) read(cam.files[0]); cam.value = ''; }); }
      // a screenshot pasted anywhere on the page, or dropped on the box
      const onPaste = ev => {
        if (!box.isConnected) { document.removeEventListener('paste', onPaste); return; }
        const f = ev.clipboardData && [...ev.clipboardData.files].find(x => /^image\//.test(x.type));
        if (f) { ev.preventDefault(); read(f); }
      };
      document.addEventListener('paste', onPaste);
      box.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); box.classList.add('dropping'); } });
      box.addEventListener('dragleave', ev => { if (!box.contains(ev.relatedTarget)) box.classList.remove('dropping'); });
      box.addEventListener('drop', ev => { box.classList.remove('dropping'); const f = ev.dataTransfer && ev.dataTransfer.files[0]; if (f) { ev.preventDefault(); read(f); } });
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
  window.UNLIMITED = { page, play, pool, likeThis, mathWords, splitQuestions, wirePaste, dayskill };
})();
