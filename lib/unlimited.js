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
    // a math topic typed in Practice any topic: the skills that match it, near the learner's grade when there are some
    if (kind === 'find') {
      const g = /^\d+$/.test(b || '') ? Number(b) : st.profile.grade, gradeOf = id => A.whereIs(id).course.grade;
      const ids = (V.mathTopic(a).length ? V.mathTopic(a) : V.findSkills(a, { whole: true })).filter(inCourse);
      const near = g == null ? [] : ids.filter(id => Math.abs(gradeOf(id) - g) <= 1);
      return { title: a, skills: near.length ? near : ids, find: true };
    }
    return null;
  }
  const gradeCourses = () => { const g = S.get().profile.grade; return g == null ? [] : A.courses.filter(c => c.grade === g && !/^int-/.test(c.id)); };
  const gradeName = () => { const g = S.get().profile.grade; return g === 0 ? 'Kindergarten' : g <= 8 ? `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade` : gradeCourses().map(c => c.title).join(' and '); };

  /** practicing one pool, without end */
  function play(root, kind, a, b) {
    if (kind === 'topic' && window.TOPICS) return TOPICS.page(root, a, b);      // any topic, written by the free AI
    const p = pool(kind, a, b);
    if (!p || !p.skills.length) {
      root.innerHTML = `<div class="card empty"><h1>Nothing to practice yet</h1><p>${kind === 'mine' ? 'Practice a skill first, and it will appear here.' : kind === 'due' ? 'No skills are due for review today.' : kind === 'saved' ? 'Save a course or a CPM book (select Save on its page), and it will appear here.' : 'This link doesn’t match a skill, unit, course or lesson.'}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited">Choose something else</a></div></div>`;
      H.tutorCtx(null);
      return;
    }
    const start = () => H.exercise(root, E.endless({ skills: p.skills, title: 'Unlimited · ' + p.title, cpm: p.cpm }), { back: '#/unlimited', backLabel: 'Unlimited practice', again: start, againLabel: 'Continue practicing' });
    start();
    // a typed math topic: say whose questions these are, with the way to AI-written ones instead
    if (p.find && window.TOPICS && !window.PROCADEMY_OFFLINE) {
      const head = root.querySelector('.ex-head');
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">Procademy’s own questions on “${esc(a)}”, from ${H.plural(p.skills.length, 'skill')}: ready at once and checked. <a href="${TOPICS.href(a, S.get().profile.grade)}">Practice with AI-written questions instead</a></p>`);
    }
  }

  /** the page: quick picks, a search over every skill, then every course and CPM book */
  function page(root) {
    const st = S.get(), mine = pool('mine').skills, due = E.dueSkills(), saved = pool('saved').skills, all = pool('all').skills;
    const c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), gc = gradeCourses();
    const picks = [
      mine.length && ['#/unlimited/mine', 'Everything you’ve practiced', `${H.plural(mine.length, 'skill')}, with weaker skills more often`, 'target', 215],
      due.length && ['#/unlimited/due', 'Due for review', `${H.plural(due.length, 'skill')} due`, 'review', 25],
      f && lessonSkills(f.lesson).length && [`#/unlimited/lesson/${f.book.id}/${enc(f.lesson.id)}`, 'Your class lesson', lessonTitle(f.book, f.lesson), 'school', 140],
      saved.length && ['#/unlimited/saved', 'Your saved courses', H.plural(saved.length, 'skill'), 'bookmark', 330],
      gc.length && ['#/unlimited/grade', `Everything for ${gradeName()}`, H.plural([].concat(...gc.map(x => A.courseSkills(x))).length, 'skill'), 'book', 265],
      ['#/unlimited/all', 'Everything', `All ${all.length} skills, Kindergarten to Calculus, mixed`, 'globe', 175],
    ].filter(Boolean);
    const skillLink = id => `<li><a href="#/unlimited/skill/${enc(id)}">${H.lvl(S.skill(id).level)} <span>${A.skills[id].title}</span></a></li>`;
    root.innerHTML = `<div class="unlimited">
      <h1>Unlimited practice</h1>
      <p class="muted" style="margin-top:-4px">Practice any skill in any course or CPM book, or any topic you like, for as long as you want. Every ${E.PRACTICE_N} answers count as a practice set, and End session shows how you did.</p>
      ${window.TOPICS && !window.PROCADEMY_OFFLINE ? TOPICS.card() : ''}
      <div class="ul-picks">${picks.map(([href, name, line, ic, hue]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic" style="--h:${hue}">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
      <div class="card tight ul-find"><label for="ul-q" class="label">Find any skill</label><input id="ul-q" type="search" autocomplete="off" placeholder="Fractions, slope, area, factoring…"><ul class="ul-skills" id="ul-found"></ul></div>
      <div class="section-title"><h2>Every course</h2></div>
      ${A.courses.map(co => `<details class="card tight ul-course" ${H.courseVar(co)}><summary>${H.mono(co.icon, 'mono-sm')} <b>${esc(co.title)}</b> <span class="muted small">${H.plural(A.courseSkills(co).length, 'skill')}</span></summary>
        <div class="btn-row"><a class="btn sm primary" href="#/unlimited/course/${co.id}">Practice the whole course</a></div>
        ${co.units.map(u => `<div class="ul-unit"><div class="ul-unit-head"><h3>${esc(u.title)}</h3><a class="btn sm" href="#/unlimited/unit/${co.id}/${u.id}">Practice this unit</a></div><ul class="ul-skills">${u.skills.filter(inCourse).map(skillLink).join('')}</ul></div>`).join('')}</details>`).join('')}
      <div class="section-title"><h2>CPM books</h2></div>
      ${A.cpm.map(bk => `<details class="card tight ul-course" ${H.courseVar(bk)}><summary>${H.mono(bk.icon, 'mono-sm')} <b>${esc(bk.title)}</b></summary>
        ${bk.chapters.map(ch => { const ls = ch.lessons.filter(l => lessonSkills(l).length); return ls.length ? `<div class="ul-unit"><div class="ul-unit-head"><h3>Chapter ${ch.n}: ${esc(ch.title)}</h3><a class="btn sm" href="#/unlimited/chapter/${bk.id}/${ch.n}">Practice this chapter</a></div>
          <div class="ul-lessons">${ls.map(l => `<a class="chip-btn" href="#/unlimited/lesson/${bk.id}/${enc(l.id)}" title="${esc(l.title || '')}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id)}</a>`).join('')}</div></div>` : ''; }).join('')}</details>`).join('')}
      <div class="section-title"><h2>Other continuous practice</h2></div>
      <div class="ul-picks">${[['#/daily', 'Today’s practice', 'Review, corrections and new skills, picked for you', 'calendar', 215], ['#/review', 'Your mistakes', 'Every question you’ve missed, until you get it right', 'review', 25], ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts', 'timer', 350], ['#/words/cards', 'Math vocabulary flashcards', 'Spaced review of math terms', 'book', 265], ['#/leap', 'Leap', '80 puzzles, and a new one every day', 'flag', 140]]
        .map(([href, name, line, ic, hue]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic" style="--h:${hue}">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
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
    if (window.TOPICS) TOPICS.wireCard(root);
    H.tutorCtx(null);
  }

  window.UNLIMITED = { page, play, pool };
})();
