/* Getting ready for a CPM chapter test (#/prep/<book>/<chapter>).

   Give the test date and Procademy makes a plan: a short prep set each day aimed at the chapter's weakest
   lessons, a full practice test the day before (one question from each lesson, no hints, scored lesson
   by lesson), and a warm-up on the day. A readiness meter follows the levels of the chapter's skills and
   the last practice test, so the plan keeps adapting. The plan can go into a calendar (.ics) as daily
   reminders. One plan at a time, kept in the profile (profile.prep). */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const SCORE = [0, 0.25, 0.6, 0.85, 1];          // how ready each level is
  const DAY = 864e5;
  const lessonName = l => (window.CPMVIEWS ? CPMVIEWS.lessonName(l) : l.id);

  function chapterOf(bookId, n) {
    const b = A.cpmById(bookId), ch = b && b.chapters.find(c => c.n === Number(n));
    if (!ch) return null;
    const lessons = ch.lessons.map(l => ({ l, ids: l.skills.filter(id => A.skills[id] && A.whereIs(id)) })).filter(x => x.ids.length);
    return { b, ch, lessons };
  }
  const prepFor = (b, ch) => { const p = S.get().profile.prep; return p && p.book === b.id && p.ch === ch.n ? p : null; };
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / DAY);
  const dayLabel = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  /** how ready each lesson is, from 0 to 1: the levels of its skills, and how it went in the last practice test */
  function readiness(c, prep) {
    const last = prep && prep.tests && prep.tests[0];
    const rows = c.lessons.map(({ l, ids }) => {
      let r = ids.reduce((a, id) => a + SCORE[S.skill(id).level], 0) / ids.length;
      const t = last && last.byLesson && last.byLesson[l.id];
      if (t) r = 0.6 * r + 0.4 * (t[0] / t[1]);
      return { l, ids, r, status: r >= 0.8 ? 'ready' : r >= 0.5 ? 'almost' : 'work' };
    });
    const overall = rows.length ? rows.reduce((a, x) => a + x.r, 0) / rows.length : 0;
    return { rows, overall };
  }
  /** the skills for a prep set: weak lessons count three times, middling ones twice */
  function weighted(c, prep) {
    const out = [];
    readiness(c, prep).rows.forEach(x => { const w = x.r < 0.5 ? 3 : x.r < 0.8 ? 2 : 1; x.ids.forEach(id => { for (let k = 0; k < w; k++) out.push(id); }); });
    return out;
  }
  /** each day from today to the test: prep sets, the practice test the day before, a warm-up on the day */
  function plan(prep) {
    const today = S.today(), left = daysBetween(today, prep.date);
    const days = [];
    for (let k = 0; k <= Math.max(0, left); k++) {
      const iso = S.dayShift(today, k), toTest = left - k;
      days.push({ iso, task: toTest === 0 ? 'warmup' : toTest === 1 ? 'test' : 'prep', done: !!(prep.done && prep.done[iso]) });
    }
    return { left, days, today: days[0] };
  }
  const TASK = {
    prep: { name: 'Prep set', what: '10 questions, mostly from the lessons that need it most', mins: 8 },
    test: { name: 'Practice test', what: 'a question from every lesson, no hints, scored lesson by lesson', mins: 20 },
    warmup: { name: 'Warm-up', what: '5 short questions to prepare for the test', mins: 4 },
  };
  const taskHref = (c, t) => `#/prep/${c.b.id}/${c.ch.n}/${t}`;

  /* ---------- the page ---------- */
  function page(root, bookId, n) {
    const c = chapterOf(bookId, n);
    if (!c) return V.notFound(root);
    if (!c.lessons.length) { root.innerHTML = `<div class="card empty"><p>Chapter ${c.ch.n} has no Procademy practice yet, so there is nothing to plan.</p><a class="btn" href="#/cpm/${c.b.id}">Back to ${esc(c.b.short)}</a></div>`; return; }
    const prep = prepFor(c.b, c.ch), other = S.get().profile.prep && !prep ? S.get().profile.prep : null;
    const head = `<div class="crumbs"><a href="#/cpm">CPM books</a> › <a href="#/cpm/${c.b.id}">${esc(c.b.short)}</a> › <span>Chapter ${c.ch.n} test prep</span></div>
      <div class="hero"><div class="small muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.04em">${esc(c.b.short)} · Chapter ${c.ch.n}</div><h1>${esc(c.ch.title)}: test prep</h1>
        <p class="muted" style="margin:0">${H.plural(c.lessons.length, 'lesson')} with practice · ${H.plural(new Set(c.lessons.flatMap(x => x.ids)).size, 'skill')}</p></div>`;
    if (!prep || daysBetween(S.today(), prep.date) < 0) {
      const past = prep && daysBetween(S.today(), prep.date) < 0;
      root.innerHTML = head + `<div class="card prep-setup" style="margin-top:16px">
        ${past ? `<p><b>Your chapter ${c.ch.n} test was on ${esc(dayLabel(prep.date))}.</b> Set a new date to make another plan.</p>` : ''}
        <h2>When is the test?</h2>
        <p class="muted">Procademy makes a plan up to that day: a short prep set each day aimed at your weakest lessons, a full practice test the day before, and a warm-up on the day.</p>
        <div class="row" style="gap:10px;flex-wrap:wrap"><input type="date" id="prep-date" min="${S.today()}" value="${S.dayShift(S.today(), 5)}" aria-label="Test date"><button class="btn primary" id="prep-make">Create the plan</button></div>
        ${other ? `<p class="small muted" style="margin-top:10px">This replaces your plan for ${esc((A.cpmById(other.book) || {}).short || '')} chapter ${other.ch}.</p>` : ''}</div>`;
      root.querySelector('#prep-make').addEventListener('click', () => {
        const d = root.querySelector('#prep-date').value;
        if (!d || d < S.today()) { V.toast('Choose today or a later date.'); return; }
        S.setProfile({ prep: { book: c.b.id, ch: c.ch.n, date: d, done: {}, tests: [] } });
        V.toast('Your plan is ready.'); page(root, bookId, n);
      });
      return;
    }
    const pl = plan(prep), rd = readiness(c, prep), pct = Math.round(rd.overall * 100), t = TASK[pl.today.task];
    const when = pl.left === 0 ? 'today' : pl.left === 1 ? 'tomorrow' : `in ${pl.left} days`;
    const words = pct >= 80 ? 'Ready' : pct >= 50 ? 'Almost ready' : 'Needs work';
    root.innerHTML = head + `
      <div class="prep-grid">
        <div class="card prep-count"><div class="small muted">Test</div><div class="prep-when">${esc(dayLabel(prep.date))}</div><div class="prep-left">${when}</div>
          <div class="btn-row" style="margin-top:10px"><button class="btn sm ghost" id="prep-change">Change the date</button><button class="btn sm ghost" id="prep-ics">Add to calendar</button><button class="btn sm ghost" id="prep-stop">Stop the plan</button></div>
          <div class="row" style="gap:8px;margin-top:6px" hidden id="prep-redate"><input type="date" id="prep-date" min="${S.today()}" value="${prep.date}" aria-label="New test date"><button class="btn sm primary" id="prep-save">Save</button></div></div>
        <div class="card prep-meter"><div class="small muted">Readiness</div><div class="prep-pct">${pct}%</div><div class="pbar big"><span style="width:${pct}%"></span></div><div class="small"><b>${words}</b> · from your skill levels${prep.tests && prep.tests[0] ? ' and your last practice test' : ''}</div></div>
      </div>
      <div class="card prep-today${pl.today.done ? ' done' : ''}">
        <div class="daily-main"><div><h2>Today: ${t.name}${pl.today.done ? ' (complete)' : ''}</h2><p class="muted small">${esc(t.what)} · about ${t.mins} minutes</p></div>
          <a class="btn primary" href="${taskHref(c, pl.today.task)}">${pl.today.done ? 'Repeat it' : 'Start'}</a></div>
        ${pl.today.task !== 'test' ? `<p class="small" style="margin:10px 0 0">To check your progress, <a href="${taskHref(c, 'test')}">take a practice test now</a>.</p>` : ''}</div>
      <div class="section-title"><h2>The plan</h2><span class="muted small">${pl.days.filter(d => d.done).length} of ${pl.days.length} days complete</span></div>
      <div class="card"><ol class="prep-days">${pl.days.map((d, k) => `<li class="${d.done ? 'done' : ''}${k === 0 ? ' today' : ''}"><span class="prep-dot" aria-hidden="true">${d.done ? '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5 l2.5 2.5 l5.5 -6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : k === 0 ? '<svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>' : ''}</span><div><b>${k === 0 ? 'Today' : esc(dayLabel(d.iso))}</b> · ${TASK[d.task].name}<div class="small muted">${esc(TASK[d.task].what)}</div></div></li>`).join('')}</ol></div>
      <div class="section-title"><h2>Lesson by lesson</h2></div>
      <div class="card"><ul class="skills prep-lessons">${rd.rows.map(x => `<li><span class="chip prep-${x.status}">${x.status === 'ready' ? 'Ready' : x.status === 'almost' ? 'Almost' : 'Needs work'}</span>
        <div class="name"><a href="#/cpm/${c.b.id}/${encodeURIComponent(x.l.id)}">${esc(lessonName(x.l))}</a><div class="sub">${esc(x.l.topic)}</div></div>
        <div class="cpm-levels" aria-label="Skill levels">${x.ids.map(id => H.lvl(S.skill(id).level)).join('')}</div>
        <div class="actions"><a class="btn sm ${x.status === 'ready' ? 'ghost' : 'primary'}" href="#/cpm-practice/${c.b.id}/${encodeURIComponent(x.l.id)}">Practice</a></div></li>`).join('')}</ul></div>
      ${prep.tests && prep.tests.length ? `<div class="section-title"><h2>Practice tests</h2></div><div class="card"><ul class="log">${prep.tests.slice(0, 5).map(r => `<li><span class="when">${new Date(r.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span><b>${r.right} / ${r.total}</b> right</span><span class="pts">${Math.round(r.right / r.total * 100)}%</span></li>`).join('')}</ul></div>` : ''}`;
    root.querySelector('#prep-change').addEventListener('click', () => { root.querySelector('#prep-redate').hidden = false; });
    root.querySelector('#prep-save').addEventListener('click', () => { const d = root.querySelector('#prep-date').value; if (d && d >= S.today()) { S.setProfile({ prep: Object.assign({}, prep, { date: d }) }); page(root, bookId, n); } });
    root.querySelector('#prep-stop').addEventListener('click', () => { if (confirm('Stop this plan?')) { S.setProfile({ prep: null }); page(root, bookId, n); } });
    root.querySelector('#prep-ics').addEventListener('click', () => calendar(c, prep));
    H.tutorCtx({ course: c.b.title, notes: `The student is preparing for the CPM ${c.b.short} chapter ${c.ch.n} test (${c.ch.title}) on ${prep.date}. Weakest lessons: ${rd.rows.filter(x => x.status === 'work').map(x => lessonName(x.l)).join(', ') || 'none'}.` });
  }

  /* ---------- the day's task ---------- */
  function markDone(prep) { const p = S.get().profile.prep; if (p && p.book === prep.book && p.ch === prep.ch) { p.done = Object.assign({}, p.done, { [S.today()]: true }); S.setProfile({ prep: p }); } }
  function task(root, bookId, n, kind) {
    const c = chapterOf(bookId, n);
    if (!c || !c.lessons.length || !TASK[kind]) return V.notFound(root);
    const prep = prepFor(c.b, c.ch) || { book: c.b.id, ch: c.ch.n, tests: [] };
    const back = `#/prep/${c.b.id}/${c.ch.n}`;
    const start = () => {
      let s;
      if (kind === 'test') s = E.start('chapter-test', { book: c.b.id, chapter: c.ch.n });
      else s = E.start('mix', { skills: weighted(c, prep), n: kind === 'warmup' ? 5 : 10, title: `${c.b.short} · Chapter ${c.ch.n} ${kind === 'warmup' ? 'warm-up' : 'prep'}`, cpm: { book: c.b.id, chapter: c.ch.n } });
      H.exercise(root, s, {
        back, backLabel: 'Test prep', again: start, againLabel: kind === 'test' ? 'Take another test' : 'Start another set',
        onFinish(sess) {
          if (kind === 'test') {
            const byLesson = {};
            sess.items.forEach((it, k) => { const g = E.counts(sess.results[k]); const b = byLesson[it.lesson] || (byLesson[it.lesson] = [0, 0]); b[0] += g ? 1 : 0; b[1] += 1; });
            const p = S.get().profile.prep;
            if (p && p.book === c.b.id && p.ch === c.ch.n) { p.tests = [{ t: Date.now(), right: Object.values(byLesson).reduce((a, x) => a + x[0], 0), total: sess.items.length, byLesson }].concat(p.tests || []).slice(0, 10); S.setProfile({ prep: p }); }
          }
          markDone(prep);
        },
        summaryExtra(sess) {
          if (kind !== 'test') return '';
          const rows = c.lessons.filter(x => sess.items.some(it => it.lesson === x.l.id)).map(x => {
            const k = sess.items.map((it, i) => (it.lesson === x.l.id ? i : -1)).filter(i => i >= 0), good = k.filter(i => E.counts(sess.results[i])).length;
            return `<li class="${good === k.length ? 'ok' : 'miss'}"><span aria-hidden="true">${good === k.length ? '✓' : '✗'}</span><a href="#/cpm/${c.b.id}/${encodeURIComponent(x.l.id)}">${esc(lessonName(x.l))}</a><span class="small muted">${good} / ${k.length}</span>${good < k.length ? `<a class="btn sm" href="#/cpm-practice/${c.b.id}/${encodeURIComponent(x.l.id)}">Practice this lesson</a>` : ''}</li>`;
          });
          return `<div class="prep-result"><h3>Lesson by lesson</h3><ul>${rows.join('')}</ul></div>`;
        },
      });
    };
    start();
  }

  /** daily reminders and the test day, as a calendar file */
  function calendar(c, prep) {
    const pl = plan(prep), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Test prep//EN', 'CALSCALE:GREGORIAN']
      .concat(...pl.days.map(d => [
        'BEGIN:VEVENT', `UID:procademy-${c.b.id}-${c.ch.n}-${d.iso}@procademy`, `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${d.iso.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${S.dayShift(d.iso, 1).replace(/-/g, '')}`,
        `SUMMARY:${d.task === 'warmup' ? `${c.b.short} chapter ${c.ch.n} test today - warm up on Procademy` : `Procademy: chapter ${c.ch.n} ${TASK[d.task].name.toLowerCase()} (${TASK[d.task].mins} min)`}`,
        `DESCRIPTION:${TASK[d.task].what.replace(/[,;]/g, '\\$&')}. Open Procademy and go to Test prep.`, 'END:VEVENT']))
      .concat('END:VCALENDAR').join('\r\n') + '\r\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = `procademy-chapter-${c.ch.n}-test.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    PREP._lastIcs = ics;                                   // for the test suite
  }

  /** the Home card while a plan is on */
  function homeCard() {
    const prep = S.get().profile.prep;
    if (!prep) return '';
    const c = chapterOf(prep.book, prep.ch);
    if (!c || daysBetween(S.today(), prep.date) < 0) return '';
    const pl = plan(prep), pct = Math.round(readiness(c, prep).overall * 100), t = TASK[pl.today.task];
    const when = pl.left === 0 ? 'today' : pl.left === 1 ? 'tomorrow' : `in ${pl.left} days`;
    return `<div class="card prep-home${pl.today.done ? ' done' : ''}"><div class="daily-main"><div><h2>Chapter ${c.ch.n} test ${when}</h2>
      <p class="muted small">${esc(c.b.short)} · ${esc(c.ch.title)} · ${pct}% ready · Today: ${t.name.toLowerCase()}${pl.today.done ? ' (complete)' : ''}</p></div>
      <div class="btn-row" style="margin:0"><a class="btn ${pl.today.done ? '' : 'primary'}" href="${taskHref(c, pl.today.task)}">${pl.today.done ? 'Repeat' : 'Start'}</a><a class="btn ghost" href="#/prep/${c.b.id}/${c.ch.n}">View plan</a></div></div></div>`;
  }

  const PREP = { page, task, homeCard, readiness, plan, chapterOf, _lastIcs: null };
  window.PREP = PREP;
})();
