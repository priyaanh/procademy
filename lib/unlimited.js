/* Unlimited practice (#/unlimited): questions that never run out, for every skill in every course and CPM
   book, one skill at a time or mixed (a unit, a course, a CPM lesson or chapter, everything practiced so far,
   everything due, everything). The questions are the same practice questions with step-by-step hints; the
   engine (ENGINE.endless) adds one after another and saves every PRACTICE_N answers as a set, so levels,
   points and review dates count as usual. ■ Stop shows the score; leaving the page saves the rest. */
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
    if (kind === 'mine') return { title: 'Everything you’ve practiced', skills: Object.keys(st.skills).filter(id => inCourse(id) && st.skills[id].tries > 0) };
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
    return null;
  }
  const gradeCourses = () => { const g = S.get().profile.grade; return g == null ? [] : A.courses.filter(c => c.grade === g && !/^int-/.test(c.id)); };
  const gradeName = () => { const g = S.get().profile.grade; return g === 0 ? 'Kindergarten' : g <= 8 ? `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade` : gradeCourses().map(c => c.title).join(' and '); };

  /** practicing one pool, without end */
  function play(root, kind, a, b) {
    const p = pool(kind, a, b);
    if (!p || !p.skills.length) {
      root.innerHTML = `<div class="card empty"><h1>Nothing to practice here yet</h1><p>${kind === 'mine' ? 'Practice any skill first, and it will be here.' : kind === 'due' ? 'No skill is due for review today. Well done!' : kind === 'saved' ? 'Save a course or a CPM book (☆ Save on its page), and it will be here.' : 'That isn’t a skill, unit, course or lesson Procademy knows.'}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited">Pick something else</a></div></div>`;
      H.tutorCtx(null);
      return;
    }
    const start = () => H.exercise(root, E.endless({ skills: p.skills, title: 'Unlimited · ' + p.title, cpm: p.cpm }), { back: '#/unlimited', backLabel: 'Unlimited practice', again: start, againLabel: 'Keep going' });
    start();
  }

  /** the page: quick picks, a search over every skill, then every course and CPM book */
  function page(root) {
    const st = S.get(), mine = pool('mine').skills, due = E.dueSkills(), saved = pool('saved').skills, all = pool('all').skills;
    const c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), gc = gradeCourses();
    const picks = [
      mine.length && ['#/unlimited/mine', '🎯', 'Everything you’ve practiced', `${H.plural(mine.length, 'skill')}, the weaker ones more often`],
      due.length && ['#/unlimited/due', '🔁', 'Due for review', `${H.plural(due.length, 'skill')} to keep fresh`],
      f && lessonSkills(f.lesson).length && [`#/unlimited/lesson/${f.book.id}/${enc(f.lesson.id)}`, '📘', 'Your class lesson', lessonTitle(f.book, f.lesson)],
      saved.length && ['#/unlimited/saved', '⭐', 'Your saved courses', H.plural(saved.length, 'skill')],
      gc.length && ['#/unlimited/grade', '🎒', `Everything for ${gradeName()}`, H.plural([].concat(...gc.map(x => A.courseSkills(x))).length, 'skill')],
      ['#/unlimited/all', '🌍', 'Everything', `All ${all.length} skills, Kindergarten to Precalculus, mixed`],
    ].filter(Boolean);
    const skillLink = id => `<li><a href="#/unlimited/skill/${enc(id)}">${H.lvl(S.skill(id).level)} <span>${A.skills[id].title}</span></a></li>`;
    root.innerHTML = `<div class="unlimited">
      <h1>Unlimited practice</h1>
      <p class="muted" style="margin-top:-4px">Questions that never run out, for every skill in every course and CPM book. Keep going as long as you like: every ${E.PRACTICE_N} answers count as a practice set, and ■ Stop shows your score.</p>
      <div class="ul-picks">${picks.map(([href, icon, name, line]) => `<a class="card tight ul-pick" href="${href}"><span class="ul-ic" aria-hidden="true">${icon}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
      <div class="card tight ul-find"><label for="ul-q" class="label">Find any skill</label><input id="ul-q" type="search" autocomplete="off" placeholder="Fractions, slope, area, factoring…"><ul class="ul-skills" id="ul-found"></ul></div>
      <div class="section-title"><h2>Every course</h2></div>
      ${A.courses.map(co => `<details class="card tight ul-course" ${H.courseVar(co)}><summary><span aria-hidden="true">${co.icon}</span> <b>${esc(co.title)}</b> <span class="muted small">${H.plural(A.courseSkills(co).length, 'skill')}</span></summary>
        <div class="btn-row"><a class="btn sm primary" href="#/unlimited/course/${co.id}">∞ The whole course, mixed</a></div>
        ${co.units.map(u => `<div class="ul-unit"><div class="ul-unit-head"><h3>${esc(u.title)}</h3><a class="btn sm" href="#/unlimited/unit/${co.id}/${u.id}">∞ Whole unit</a></div><ul class="ul-skills">${u.skills.filter(inCourse).map(skillLink).join('')}</ul></div>`).join('')}</details>`).join('')}
      <div class="section-title"><h2>CPM books</h2></div>
      ${A.cpm.map(bk => `<details class="card tight ul-course"><summary><span aria-hidden="true">${bk.icon || '📘'}</span> <b>${esc(bk.title)}</b></summary>
        ${bk.chapters.map(ch => { const ls = ch.lessons.filter(l => lessonSkills(l).length); return ls.length ? `<div class="ul-unit"><div class="ul-unit-head"><h3>Chapter ${ch.n}: ${esc(ch.title)}</h3><a class="btn sm" href="#/unlimited/chapter/${bk.id}/${ch.n}">∞ Whole chapter</a></div>
          <div class="ul-lessons">${ls.map(l => `<a class="chip-btn" href="#/unlimited/lesson/${bk.id}/${enc(l.id)}" title="${esc(l.title || '')}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id)}</a>`).join('')}</div></div>` : ''; }).join('')}</details>`).join('')}
      <div class="section-title"><h2>More that never runs out</h2></div>
      <div class="ul-picks">${[['#/daily', '📅', 'Today’s practice', 'Review, mistakes and something new, mixed for you'], ['#/review', '🩹', 'Your mistakes', 'Every question you missed, until you get it'], ['#/sprint', '⚡', 'Speed sprints', 'One-minute fact rounds, as many as you like'], ['#/words/cards', '📖', 'Math words flashcards', 'Spaced review of the words you need'], ['#/leap', '🐸', 'Leap', '80 puzzles, and a new one every day']]
        .map(([href, icon, name, line]) => `<a class="card tight ul-pick" href="${href}"><span class="ul-ic" aria-hidden="true">${icon}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
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
    H.tutorCtx(null);
  }

  window.UNLIMITED = { page, play, pool };
})();
