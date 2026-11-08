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
    // questions like one in a picture (or typed): the closest skill, with the next closest a tap away
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
  const gradeCourses = () => { const g = S.get().profile.grade; return g == null ? [] : A.courses.filter(c => c.grade === g && !/^int-/.test(c.id)); };
  const gradeName = () => { const g = S.get().profile.grade; return g === 0 ? 'Kindergarten' : g <= 8 ? `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade` : gradeCourses().map(c => c.title).join(' and '); };

  /** practicing one pool, without end */
  function play(root, kind, a, b) {
    if (kind === 'topic' && window.TOPICS) return TOPICS.page(root, a, b);      // any topic, written by the free AI
    if (kind === 'picture') { page(root); const box = root.querySelector('#ul-shot'); if (box) { if (window.FILES) FILES.warm(); box.scrollIntoView({ block: 'center' }); box.querySelector('#shot-pick').focus({ preventScroll: true }); } return; }
    const p = pool(kind, a, b);
    if (!p || !p.skills.length) {
      root.innerHTML = `<div class="card empty"><h1>Nothing to practice yet</h1><p>${kind === 'mine' ? 'Practice a skill first, and it will appear here.' : kind === 'due' ? 'No skills are due for review today.' : kind === 'saved' ? 'Save a course or a CPM book (select Save on its page), and it will appear here.' : 'This link doesn’t match a skill, unit, course or lesson.'}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/unlimited">Choose something else</a></div></div>`;
      H.tutorCtx(null);
      return;
    }
    const start = () => H.exercise(root, E.endless({ skills: p.skills, title: 'Unlimited · ' + p.title, cpm: p.cpm }), { back: '#/unlimited', backLabel: 'Unlimited practice', again: start, againLabel: 'Continue practicing' });
    start();
    // questions like a picture: what was read, and the other close matches
    if (p.similar) {
      const head = root.querySelector('.ex-head'), seen = lastShot && lastShot.ids === a ? lastShot : null;
      const others = p.similar.slice(1).map(id => `<a href="#/unlimited/similar/${[id].concat(p.similar.filter(x => x !== id)).map(enc).join(',')}">${A.skills[id].title}</a>`);
      if (head) head.insertAdjacentHTML('afterend', `<p class="small muted find-note">${seen ? `From your ${seen.thumb ? 'picture' : 'question'}: “${esc(clipText(seen.text))}”. ` : ''}New questions like it, ready at once.${others.length ? ` Not quite it? Try ${others.join(' or ')}.` : ''}</p>`);
    }
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
      <p class="muted" style="margin-top:-4px">Practice any skill or topic for as long as you like. End session shows how you did.</p>
      ${shotCard()}
      ${window.TOPICS && !window.PROCADEMY_OFFLINE ? TOPICS.card() : ''}
      <div class="ul-picks">${picks.map(([href, name, line, ic, hue]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
      <div class="card tight ul-find"><label for="ul-q" class="label">Find any skill</label><input id="ul-q" type="search" autocomplete="off" placeholder="Fractions, slope, area, factoring…"><ul class="ul-skills" id="ul-found"></ul></div>
      <details class="ul-every"><summary><h2>Every course and CPM book</h2><span class="muted small">A whole course, a unit, a chapter or one skill</span></summary>
      ${A.courses.map(co => `<details class="card tight ul-course" ${H.courseVar(co)}><summary>${H.mono(co.icon, 'mono-sm')} <b>${esc(co.title)}</b> <span class="muted small">${H.plural(A.courseSkills(co).length, 'skill')}</span></summary>
        <div class="btn-row"><a class="btn sm primary" href="#/unlimited/course/${co.id}">Practice the whole course</a></div>
        ${co.units.map(u => `<div class="ul-unit"><div class="ul-unit-head"><h3>${esc(u.title)}</h3><a class="btn sm" href="#/unlimited/unit/${co.id}/${u.id}">Practice this unit</a></div><ul class="ul-skills">${u.skills.filter(inCourse).map(skillLink).join('')}</ul></div>`).join('')}</details>`).join('')}
      <h3 class="ul-books">CPM books</h3>
      ${A.cpm.map(bk => `<details class="card tight ul-course" ${H.courseVar(bk)}><summary>${H.mono(bk.icon, 'mono-sm')} <b>${esc(bk.title)}</b></summary>
        ${bk.chapters.map(ch => { const ls = ch.lessons.filter(l => lessonSkills(l).length); return ls.length ? `<div class="ul-unit"><div class="ul-unit-head"><h3>Chapter ${ch.n}: ${esc(ch.title)}</h3><a class="btn sm" href="#/unlimited/chapter/${bk.id}/${ch.n}">Practice this chapter</a></div>
          <div class="ul-lessons">${ls.map(l => `<a class="chip-btn" href="#/unlimited/lesson/${bk.id}/${enc(l.id)}" title="${esc(l.title || '')}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id)}</a>`).join('')}</div></div>` : ''; }).join('')}</details>`).join('')}</details>
      <div class="section-title"><h2>More ways to practice</h2></div>
      <div class="ul-picks more">${[['#/daily', 'Today’s practice', 'Review, corrections and new skills, picked for you', 'calendar', 215], ['#/review', 'Your mistakes', 'Every question you’ve missed, until you get it right', 'review', 25], ['#/sprint', 'Speed sprints', 'One-minute rounds of math facts', 'timer', 350], ['#/words/cards', 'Math vocabulary flashcards', 'Spaced review of math terms', 'book', 265], ['#/leap', 'Leap', '80 puzzles, and a new one every day', 'flag', 140]]
        .map(([href, name, line, ic, hue]) => `<a class="card tight ul-pick" href="${href}"><span class="tool-ic">${ICONS.svg(ic, 22)}</span><span><b>${esc(name)}</b><span class="small muted">${esc(line)}</span></span></a>`).join('')}</div>
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
  function shotCard() {
    return `<section class="card ul-shot" id="ul-shot" aria-labelledby="shot-h">
      <div class="ul-shot-head"><span class="tool-ic">${ICONS.svg('image', 22)}</span><div><h2 id="shot-h">Questions like yours</h2>
        <p class="small muted">Add a screenshot or photo of a question, or type it in. Procademy finds the skill and makes new questions like it, ready at once.</p></div></div>
      <div class="ul-shot-row">${window.FILES ? `<button class="btn primary" type="button" id="shot-pick">${ICONS.svg('image', 18)} Choose a picture</button><input type="file" id="shot-file" accept="image/*" hidden>` : ''}
        <form class="ul-shot-type" id="shot-form"><label class="visually-hidden" for="shot-text">Type a question</label><input id="shot-text" type="text" autocomplete="off" placeholder="Or type one, like 3/4 + 1/6 or 2x + 5 = 17"><button class="btn" type="submit">Find</button></form></div>
      ${window.FILES ? '<p class="tiny muted" style="margin:10px 0 0">You can also paste a screenshot (Ctrl+V, or Command+V on a Mac) or drop it here. The picture stays on this device.</p>' : ''}
      <div id="shot-out" aria-live="polite"></div></section>`;
  }
  function wireShot(root) {
    const box = root.querySelector('#ul-shot'); if (!box) return;
    const out = box.querySelector('#shot-out'), file = box.querySelector('#shot-file');
    // the text reader is fetched the first time, so start it as soon as the learner heads for the box
    if (window.FILES) ['pointerenter', 'focusin', 'touchstart'].forEach(e => box.addEventListener(e, () => FILES.warm(), { once: true, passive: true }));
    const go = (text, thumb) => {
      const ids = likeThis(text);
      if (ids.length) { const key = ids.join(','); lastShot = { text, thumb, ids: key }; location.hash = '#/unlimited/similar/' + ids.map(enc).join(','); return; }
      const g = S.get().profile.grade;
      out.innerHTML = `<div class="shot-none"><p class="small" style="margin:0 0 8px">Procademy read “${esc(clipText(text))}”, but no math skill matched it.</p>
        <div class="btn-row" style="margin-top:0">${window.TOPICS && !window.PROCADEMY_OFFLINE ? `<a class="btn sm primary" href="${TOPICS.href(TOPICS.clip(text), g)}">Questions like it from the free AI</a>` : ''}<button class="btn sm" type="button" id="shot-find">Find a skill instead</button></div></div>`;
      out.querySelector('#shot-find').addEventListener('click', () => { const q = root.querySelector('#ul-q'); if (q) { q.scrollIntoView({ block: 'center' }); q.focus(); } });
    };
    async function read(f) {
      out.innerHTML = `<div class="shot-reading"><span class="small" id="shot-say">Reading your picture…</span><span class="pbar"><span id="shot-bar" style="width:4%"></span></span></div>`;
      const r = await FILES.read(f, pr => { const say = out.querySelector('#shot-say'), bar = out.querySelector('#shot-bar'); if (say && pr.text) say.textContent = pr.text; if (bar) bar.style.width = Math.max(4, Math.round((pr.fraction || 0) * 100)) + '%'; });
      if (!box.isConnected) return;
      if (r.error) { out.innerHTML = `<p class="small shot-err">${esc(r.error)}</p>`; return; }
      if (!r.text || !r.text.trim()) { out.innerHTML = `<p class="small shot-err">${navigator.onLine === false ? 'Reading a picture needs the internet the first time. Type the question instead.' : 'No words could be read in this picture. Try a sharper screenshot, or type the question.'}</p>`; return; }
      go(r.text, r.thumb);
    }
    if (file) {
      box.querySelector('#shot-pick').addEventListener('click', () => file.click());
      file.addEventListener('change', () => { if (file.files[0]) read(file.files[0]); file.value = ''; });
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
    box.querySelector('#shot-form').addEventListener('submit', ev => { ev.preventDefault(); const t = box.querySelector('#shot-text').value.trim(); if (t) go(t, null); });
  }

  window.UNLIMITED = { page, play, pool, likeThis, mathWords };
})();
