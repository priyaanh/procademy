/* The CPM pages: every middle and high school CPM book, chapter by chapter and lesson by lesson.
   Each lesson links to Procademy practice for it, the tutor, and CPM's own homework help.
   The pages are built from the cpm/<book>.js data, and mastery updates live as skills level up. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS;
  const H = V._h, esc = H.esc;
  const EBOOK = 'https://ebooks.cpm.org/';
  const PARENT_GUIDES = 'https://pdfs.cpm.org/CoreConnections/ParentGuide/';

  const bookHref = b => `#/cpm/${b.id}`;
  const lessonHref = (b, l) => `#/cpm/${b.id}/${l.id}`;
  const lessonPracticeHref = (b, l) => `#/cpm-practice/${b.id}/${l.id}`;
  const chapterPracticeHref = (b, ch) => `#/cpm-practice/${b.id}/ch/${ch.n}`;
  const homeworkHref = (b, l) => `${b.homework}/chapter/${l.chapter}/lesson/${l.id}`;
  const bookVar = b => `style="--course:hsl(${b.hue == null ? 215 : b.hue} 70% 45%)"`;
  const lessonName = l => l.title ? `${l.id} ${l.title}` : `Lesson ${l.id}`;
  const allLessons = b => b.chapters.flatMap(ch => ch.lessons);
  const current = () => S.get().profile.cpm || null;
  const plural = H.plural;

  function stats(b) {
    const lessons = allLessons(b), ids = A.cpmSkills(lessons);
    return { lessons: lessons.length, linked: lessons.filter(l => l.skills.some(id => A.skills[id])).length, ids, m: E.mastery(ids) };
  }
  function levels(l) {
    return l.skills.filter(id => A.skills[id]).map(id => H.lvl(S.skill(id).level)).join('');
  }
  function neighbours(b, l) {
    const all = allLessons(b), i = all.indexOf(l);
    return { prev: all[i - 1] || null, next: all[i + 1] || null };
  }
  /** lessons matching every word of q, in title, topic, number, chapter title or skill titles */
  function matches(b, q) {
    const words = A.normText(q).split(' ').filter(Boolean);
    if (!words.length) return null;
    const hits = [];
    b.chapters.forEach(ch => ch.lessons.forEach(l => {
      const hay = A.normText([l.id, l.title || '', l.topic, ch.title, l.skills.map(id => A.skills[id] ? H.plain(A.skills[id].title) : '').join(' ')].join(' '));
      if (words.every(w => hay.includes(w))) hits.push({ ch, l });
    }));
    return hits;
  }

  /* ---------- in-class card for the home page ---------- */
  function homeCard() {
    const c = current();
    if (!c) return '';
    const found = A.cpmLesson(c.book, c.lesson);
    if (!found) return '';
    const { book: b, lesson: l } = found;
    const hasPractice = l.skills.some(id => A.skills[id]);
    return `<div class="section-title"><h2>In class now</h2><a href="${bookHref(b)}">${esc(b.short)} →</a></div>
      <div class="card cpm-now" ${bookVar(b)}><div class="row between"><div style="min-width:0"><div class="small muted">${esc(b.title)} · Chapter ${l.chapter}</div>
        <h3 style="margin:2px 0 4px"><a href="${lessonHref(b, l)}">${esc(lessonName(l))}</a></h3><div class="small">${esc(l.topic)}</div></div><div class="cpm-levels">${levels(l)}</div></div>
        <div class="btn-row">${hasPractice ? `<a class="btn primary sm" href="${lessonPracticeHref(b, l)}">Practice this lesson</a>` : ''}
          ${H.explainBtn('Explain this lesson', `Explain CPM lesson ${lessonName(l)} to me: ${l.topic}`)}
          <a class="btn sm" href="${homeworkHref(b, l)}" target="_blank" rel="noopener">Homework help ↗</a>
          ${A.cpmSkills(found.chapter.lessons).length && !(S.get().profile.prep) ? `<a class="btn sm ghost" href="#/prep/${b.id}/${found.chapter.n}">Prepare for the chapter ${found.chapter.n} test</a>` : ''}</div></div>`;
  }

  /* ---------- all CPM books ---------- */
  function cpmHome(root) {
    H.wireSaving();
    const bands = [];
    A.cpm.forEach(b => { if (!bands.includes(b.band)) bands.push(b.band); });
    const c = current();
    root.innerHTML = `
      <h1>CPM books</h1>
      <p class="muted">Follow your class book chapter by chapter. Every lesson links to Procademy practice, to the free tutor that explains it, and to CPM’s own homework help.</p>
      ${homeCard()}
      <div class="card tight cpm-find"><label class="visually-hidden" for="cpm-find">Find a lesson</label>
        <input id="cpm-find" type="search" placeholder="Find a lesson or topic in any book: “slope”, “5.2.1”, “similar triangles”…" autocomplete="off"></div>
      <div id="cpm-results"></div>
      <div id="cpm-books">${A.cpm.length ? bands.map(band => `<div class="section-title"><h2>${esc(band)}</h2></div>
        <div class="grid">${A.cpm.filter(b => b.band === band).map(b => bookCard(b)).join('')}</div>`).join('') : '<div class="card empty">The CPM books are not available yet.</div>'}</div>
      <p class="small muted" style="margin-top:20px">The books belong to CPM Educational Program; nothing from them is copied here. Lessons open CPM’s <a href="${EBOOK}" target="_blank" rel="noopener">eBook</a>, its free homework help, and its <a href="${PARENT_GUIDES}" target="_blank" rel="noopener">parent guides</a> on cpm.org.</p>`;
    H.bindExplain(root);
    H.tutorCtx(null);
    const input = root.querySelector('#cpm-find'), out = root.querySelector('#cpm-results'), books = root.querySelector('#cpm-books');
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (!q) { out.innerHTML = ''; books.hidden = false; return; }
      const hits = A.cpm.flatMap(b => (matches(b, q) || []).map(h => Object.assign({ b }, h))).slice(0, 60);
      books.hidden = true;
      out.innerHTML = hits.length ? `<div class="section-title"><h2>${plural(hits.length, 'lesson')}</h2></div><div class="card"><ul class="cpm-lessons">${hits.map(h => lessonRow(h.b, h.l, { book: true })).join('')}</ul></div>`
        : `<div class="card empty">No lessons match “${esc(q)}”. Try a shorter search.</div>`;
      H.bindExplain(out);
    });
  }
  /** the lesson to continue with: the class lesson in this book, else the first with practice not yet Proficient */
  function nextLesson(b) {
    const c = current();
    if (c && c.book === b.id) { const f = A.cpmLesson(b.id, c.lesson); if (f) return f.lesson; }
    return allLessons(b).find(l => l.skills.some(id => A.skills[id] && S.skill(id).level < 3)) || allLessons(b)[0];
  }
  function bookCard(b, opts) {
    opts = opts || {};
    const st = stats(b), c = current(), mine = c && c.book === b.id, nx = opts.continue ? nextLesson(b) : null;
    return `<div class="card course-card" ${bookVar(b)} data-filter="${esc(A.normText(b.title + ' ' + b.short + ' cpm ' + b.band))}" data-band="cpm"${opts.drag ? ` data-id="cpm:${esc(b.id)}"` : ''}>
      <div class="row between" style="align-items:flex-start"><span class="icon mono" aria-hidden="true">${esc(b.icon || '')}</span><span class="card-tools">${opts.drag ? H.dragHandle(b.title) : ''}${H.saveBtn('cpm:' + b.id, b.title)}</span></div>
      <h3><a class="card-link" href="${bookHref(b)}">${esc(b.title)}</a>${mine ? ' <span class="chip up">In class</span>' : ''}</h3>
      ${opts.continue ? '' : `<p>${plural(b.chapters.length, 'chapter')} · ${plural(st.lessons, 'lesson')} · practice for ${st.linked} of them</p>`}
      <div class="row between small muted"><span>${opts.continue ? plural(st.lessons, 'lesson') : st.ids.length + ' skills'}</span><span>${st.m.pct}% mastered</span></div>
      <div class="pbar"><span style="width:${st.m.pct}%"></span></div>
      ${nx ? `<a class="btn primary sm continue" href="${lessonHref(b, nx)}">Continue: ${esc(lessonName(nx))}</a>` : ''}</div>`;
  }

  /* ---------- one book ---------- */
  function lessonRow(b, l, opts) {
    opts = opts || {};
    const c = current(), here = c && c.book === b.id && c.lesson === l.id;
    const has = l.skills.some(id => A.skills[id]);
    return `<li class="${here ? 'here' : ''}" data-lesson="${esc(l.id)}">
      <a class="cpm-num" href="${lessonHref(b, l)}">${esc(l.id)}</a>
      <div class="cpm-what"><a href="${lessonHref(b, l)}"><b>${esc(l.title || 'Lesson ' + l.id)}</b></a>${here ? ' <span class="chip up">In class</span>' : ''}${opts.book ? ` <span class="chip">${esc(b.short)}</span>` : ''}
        <div class="small muted">${esc(l.topic)}</div></div>
      <div class="cpm-levels" role="img" aria-label="Skill levels">${levels(l)}</div>
      <div class="actions">${has ? `<a class="btn sm primary" href="${lessonPracticeHref(b, l)}">Practice</a>` : ''}
        <button class="btn sm ghost tutor-ask" data-ask="${esc(`Explain CPM lesson ${lessonName(l)}: ${l.topic}`)}" aria-label="Explain lesson ${esc(l.id)} with the tutor">Explain</button>
        <a class="btn sm ghost" href="${homeworkHref(b, l)}" target="_blank" rel="noopener" aria-label="CPM homework help for lesson ${esc(l.id)}">Help ↗</a></div></li>`;
  }
  function cpmBook(root, id) {
    H.wireSaving();
    const b = A.cpmById(id);
    if (!b) return V.notFound(root);
    const st = stats(b), c = current();
    const hereCh = c && c.book === b.id ? (A.cpmLesson(b.id, c.lesson) || {}).chapter : null;
    root.innerHTML = `
      <div class="crumbs"><a href="#/cpm">CPM books</a> › <span>${esc(b.short)}</span></div>
      <div class="hero" ${bookVar(b)}>
        <div class="row between" style="align-items:flex-start"><div class="row"><span class="icon-big mono" aria-hidden="true">${esc(b.icon || '')}</span><div><h1 style="margin:0">${esc(b.title)}</h1>
          <div class="muted">${plural(b.chapters.length, 'chapter')} · ${plural(st.lessons, 'lesson')} · Procademy practice for ${st.linked}</div></div></div>${H.saveBtn('cpm:' + b.id, b.title).replace('class="save-btn', 'class="save-btn big')}</div>
        <div class="row between" style="margin-top:12px"><b>Book mastery: ${st.m.pct}%</b><span class="muted small">${H.fmt(st.m.points)} of ${H.fmt(st.m.possible)} mastery points across ${plural(st.ids.length, 'skill')}</span></div>
        ${H.mbar(st.ids)}
        <div class="btn-row">${hereCh ? `<button class="btn primary sm" id="jump">Go to my lesson (${esc(c.lesson)})</button>` : ''}
          <a class="btn sm" href="${b.homework}" target="_blank" rel="noopener">CPM homework help ↗</a>
          <a class="btn sm" href="${EBOOK}" target="_blank" rel="noopener">Open the eBook ↗</a></div>
      </div>
      <div class="card tight cpm-tools" style="margin-top:16px">
        <input id="lesson-find" type="search" placeholder="Filter lessons in ${esc(b.short)}…" aria-label="Filter lessons" autocomplete="off">
        <label class="small"><input type="checkbox" id="only-practice"> Only lessons with practice</label>
        <button class="btn sm ghost" id="expand">Open all chapters</button>
      </div>
      <div id="chapters">${b.chapters.map(ch => chapterBlock(b, ch, hereCh ? ch.n === hereCh : ch.n === b.chapters[0].n)).join('')}</div>
      <p class="small muted" style="margin-top:16px">Titles come from CPM’s published tables of contents; a lesson without one shows its number. Each topic line is Procademy’s own summary.</p>`;
    H.bindExplain(root);
    H.tutorCtx({ course: b.title });
    const find = root.querySelector('#lesson-find'), only = root.querySelector('#only-practice');
    const apply = () => {
      const q = find.value.trim(), hits = matches(b, q), set = hits ? new Set(hits.map(h => h.l.id)) : null;
      root.querySelectorAll('details.chapter').forEach(d => {
        let shown = 0;
        d.querySelectorAll('li[data-lesson]').forEach(li => {
          const l = A.cpmLesson(b.id, li.dataset.lesson).lesson;
          const ok = (!set || set.has(l.id)) && (!only.checked || l.skills.some(x => A.skills[x]));
          li.hidden = !ok; if (ok) shown++;
        });
        d.hidden = shown === 0;
        if (set || only.checked) d.open = shown > 0;
      });
    };
    find.addEventListener('input', apply);
    only.addEventListener('change', apply);
    root.querySelector('#expand').addEventListener('click', ev => {
      const all = [...root.querySelectorAll('details.chapter')], open = !all.every(d => d.open);
      all.forEach(d => { d.open = open; });
      ev.target.textContent = open ? 'Close all chapters' : 'Open all chapters';
    });
    const jump = root.querySelector('#jump');
    if (jump) jump.addEventListener('click', () => { const li = root.querySelector('li.here'); if (li) { li.closest('details').open = true; li.scrollIntoView({ block: 'center' }); } });
  }
  function chapterBlock(b, ch, open) {
    const ids = A.cpmSkills(ch.lessons), m = E.mastery(ids);
    return `<details class="card chapter" ${open ? 'open' : ''} style="margin-top:12px" ${bookVar(b)}>
      <summary><span class="ch-n">Chapter ${ch.n}</span><span class="ch-title">${esc(ch.title)}</span>
        <span class="ch-meta small muted">${plural(ch.lessons.length, 'lesson')}${ids.length ? ` · ${m.pct}%` : ''}</span></summary>
      ${ids.length ? `<div style="margin:10px 0 4px">${H.mbar(ids, true)}</div>` : ''}
      <ul class="cpm-lessons">${ch.lessons.map(l => lessonRow(b, l)).join('')}</ul>
      ${ids.length ? `<div class="btn-row"><a class="btn sm" href="${chapterPracticeHref(b, ch)}">Practice all of chapter ${ch.n}</a><a class="btn sm ghost" href="#/prep/${b.id}/${ch.n}">Plan for the chapter test</a><span class="small muted">${plural(Math.min(10, Math.max(ids.length, 7)), 'question')} from ${plural(ids.length, 'skill')}</span></div>` : ''}
    </details>`;
  }

  /* ---------- one lesson ---------- */
  function cpmLesson(root, bookId, lessonId) {
    const found = A.cpmLesson(bookId, lessonId);
    if (!found) return V.notFound(root);
    const { book: b, chapter: ch, lesson: l } = found;
    const { prev, next } = neighbours(b, l);
    const ids = l.skills.filter(id => A.skills[id]);
    const c = current(), here = c && c.book === b.id && c.lesson === l.id;
    root.innerHTML = `
      <div class="crumbs"><a href="#/cpm">CPM books</a> › <a href="${bookHref(b)}">${esc(b.short)}</a> › <span>Chapter ${ch.n}: ${esc(ch.title)}</span></div>
      <div class="hero" ${bookVar(b)}>
        <div class="small muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.04em">Lesson ${esc(l.id)} · ${esc(b.short)}</div>
        <h1>${esc(l.title || 'Lesson ' + l.id)}</h1>
        <p>${esc(l.topic)}</p>
        <div class="btn-row">${ids.length ? `<a class="btn primary" href="${lessonPracticeHref(b, l)}">Practice this lesson · ${E.PRACTICE_N} questions</a>` : ''}
          ${H.explainBtn('Explain this lesson', `Explain CPM lesson ${lessonName(l)} to me step by step: ${l.topic}`)}
          <a class="btn" href="${homeworkHref(b, l)}" target="_blank" rel="noopener">CPM homework help ↗</a>
          ${ids.length ? `<a class="btn ghost" href="#/worksheet/lesson/${b.id}/${encodeURIComponent(l.id)}">Print a worksheet</a>` : ''}
          ${H.toolLinks('', (l.title || '') + ' ' + l.topic)}
          <button class="btn ${here ? '' : 'ghost'}" id="in-class">${here ? 'In class now' : 'Mark as my class lesson'}</button></div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Practice</h2>
        ${ids.length ? `<p class="muted small">The Procademy skills that practice this lesson. Each has a written lesson and its own practice, and they level up as you progress.</p><ul class="skills">${ids.map(id => H.skillRow(id, { where: A.whereIs(id).course.title })).join('')}</ul>`
          : `<p class="muted">Procademy has no practice for this lesson yet. The tutor can explain it, and CPM’s homework help has a hint for every problem.</p>`}
      </div>
      <div class="row between" style="margin-top:16px">${prev ? `<a class="btn sm" href="${lessonHref(b, prev)}">← ${esc(lessonName(prev))}</a>` : '<span></span>'}${next ? `<a class="btn sm" href="${lessonHref(b, next)}">${esc(lessonName(next))} →</a>` : ''}</div>`;
    H.bindExplain(root);
    H.tutorCtx({ course: b.title, lesson: lessonName(l), notes: `${l.topic} Chapter ${ch.n}: ${ch.title}.${ids.length ? ' Skills practiced: ' + ids.map(id => H.plain(A.skills[id].title)).join(', ') + '.' : ''}` });
    root.querySelector('#in-class').addEventListener('click', () => {
      S.setProfile({ cpm: here ? null : { book: b.id, lesson: l.id } });
      V.toast(here ? 'Your class lesson was cleared.' : `Lesson ${l.id} is now shown on your home page.`);
      cpmLesson(root, bookId, lessonId);
    });
  }

  /* ---------- practice a lesson or a chapter ---------- */
  function cpmPractice(root, bookId, lessonId) {
    const found = A.cpmLesson(bookId, lessonId);
    if (!found) return V.notFound(root);
    const { book: b, lesson: l } = found;
    const ids = l.skills.filter(id => A.skills[id]);
    if (!ids.length) { location.replace(lessonHref(b, l)); return; }
    const { next } = neighbours(b, l);
    const start = () => H.exercise(root, E.start('mix', { skills: ids, title: `${b.short} · ${lessonName(l)}`, cpm: { book: b.id, lesson: l.id } }),
      { back: lessonHref(b, l), backLabel: 'Lesson ' + l.id, again: start, next: next ? { href: lessonHref(b, next), label: 'Next: ' + lessonName(next) } : null });
    start();
  }
  function cpmChapterPractice(root, bookId, n) {
    const b = A.cpmById(bookId), ch = b && b.chapters.find(c => c.n === Number(n));
    if (!ch) return V.notFound(root);
    const ids = A.cpmSkills(ch.lessons);
    if (!ids.length) { location.replace(bookHref(b)); return; }
    const start = () => H.exercise(root, E.start('mix', { skills: ids, n: Math.min(10, Math.max(ids.length, 7)), title: `${b.short} · Chapter ${ch.n}: ${ch.title}`, cpm: { book: b.id, chapter: ch.n } }),
      { back: bookHref(b), backLabel: b.short, again: start, againLabel: 'Start another round' });
    start();
  }

  /** CPM lessons for the site search */
  function searchHits(q) {
    if (!A.cpm.length) return '';
    const hits = A.cpm.flatMap(b => (matches(b, q) || []).map(h => Object.assign({ b }, h))).slice(0, 15);
    return hits.length ? `<div class="section-title"><h2>CPM lessons</h2></div><div class="card"><ul class="cpm-lessons">${hits.map(h => lessonRow(h.b, h.l, { book: true })).join('')}</ul></div>` : '';
  }

  window.CPMVIEWS = { cpmHome, cpmBook, cpmLesson, cpmPractice, cpmChapterPractice, homeCard, searchHits, lessonName, bookCard };
})();
