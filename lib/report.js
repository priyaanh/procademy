/* A progress report for a parent or teacher (#/report): the last 7 or 30 days on one printable page —
   days practised, questions and how many were right first try, levels gained, what was practised, the
   learner's usual slips, what is due for review, a coming CPM test, badges — and three suggestions for
   next. Print it, save it as a PDF, or copy it as text for a message. Made on this device from what is
   saved here; nothing is sent. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const NAMES = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation' };
  const KINDS = { topic: 'Practice on any topic', practice: 'Practice sets', 'unit-test': 'Unit tests', 'course-challenge': 'Course challenges', 'mastery-challenge': 'Mastery challenges', mix: 'CPM lesson practice', review: 'Reviews', daily: 'Today’s practice', 'chapter-test': 'Practice tests', sprint: 'Speed sprints', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles', placement: 'Starting-point checks' };

  /** everything the report says, for a period of `days` ending today */
  function gather(days) {
    const st = S.get(), today = S.today(), from = S.dayShift(today, -(days - 1)), since = new Date(from + 'T00:00').getTime();
    const dayList = []; for (let k = days - 1; k >= 0; k--) { const iso = S.dayShift(today, -k); dayList.push({ iso, q: (st.days[iso] || {}).q || 0, right: (st.days[iso] || {}).right || 0, min: S.minutes(st.days[iso]) }); }
    const q = dayList.reduce((a, d) => a + d.q, 0), right = dayList.reduce((a, d) => a + d.right, 0);
    const log = st.log.filter(e => e.t >= since);
    const ups = [];
    log.slice().reverse().forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId]) { const old = ups.find(u => u.id === ch.skillId); if (old) old.to = Math.max(old.to, ch.to); else ups.push({ id: ch.skillId, from: ch.from, to: ch.to }); } }));
    const kinds = {}; log.forEach(e => { kinds[e.kind] = (kinds[e.kind] || 0) + 1; });
    const skillsSeen = {}; log.forEach(e => { if (e.skill && A.skills[e.skill]) skillsSeen[e.skill] = (skillsSeen[e.skill] || 0) + 1; });
    const slips = Object.entries(st.mistakes || {}).filter(([k, m]) => m.n && NAMES[k]).sort((a, b) => b[1].n - a[1].n).slice(0, 3);
    const badges = window.BADGES ? BADGES.all().filter(b => b.at && b.at >= since) : [];
    const due = E.dueSkills();
    const weak = Object.keys(st.skills).filter(id => A.skills[id] && A.whereIs(id) && st.skills[id].tries >= 3 && st.skills[id].right / st.skills[id].tries < 0.6).slice(0, 5);
    const prep = st.profile.prep && window.PREP ? (() => { const c = PREP.chapterOf(st.profile.prep.book, st.profile.prep.ch); return c ? { c, date: st.profile.prep.date, ready: Math.round(PREP.readiness(c, st.profile.prep).overall * 100), tests: st.profile.prep.tests || [] } : null; })() : null;
    // three suggestions, most useful first
    const ideas = [];
    if (weak.length) ideas.push({ text: `Practice ${H.plain(A.skills[weak[0]].title)}: fewer than 60% correct so far.`, href: `#/practice/${encodeURIComponent(weak[0])}` });
    if (prep && prep.ready < 80) ideas.push({ text: `Continue the plan for the ${prep.c.b.short} chapter ${prep.c.ch.n} test (${prep.ready}% ready).`, href: `#/prep/${prep.c.b.id}/${prep.c.ch.n}` });
    if (st.missed.length) ideas.push({ text: `Correct the ${H.plural(st.missed.length, 'missed question')} in Review.`, href: '#/review' });
    if (due.length) ideas.push({ text: `Refresh ${H.plural(due.length, 'skill')} that ${due.length === 1 ? 'is' : 'are'} due, with today’s practice.`, href: '#/daily' });
    if (slips.length) ideas.push({ text: `Watch for ${NAMES[slips[0][0]].toLowerCase()}: ${window.COACH ? COACH.TIPS[slips[0][0]] || '' : ''}`, href: '#/progress' });
    if (dayList.filter(d => d.q).length < Math.min(days, 4)) ideas.push({ text: 'Practice briefly on most days: ten minutes a day is more effective than an hour once a week.', href: '#/daily' });
    const tests = log.filter(e => TESTS[e.kind] && e.total).slice(0, 6);
    const seen = Object.keys(st.skills).filter(id => A.skills[id] && A.whereIs(id) && st.skills[id].tries >= 3), acc = id => st.skills[id].right / st.skills[id].tries;
    const strong = seen.filter(id => st.skills[id].level >= 2).sort((a, b) => st.skills[b].level - st.skills[a].level || acc(b) - acc(a)).slice(0, 3);
    const units = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).slice(0, 2).map(c => { const sid = E.courseOrder(c).find(id => S.skill(id).level < 3); if (!sid) return null; const u = A.whereIs(sid).unit, ids = u.skills.filter(id => A.skills[id] && A.whereIs(id)); return ids.length ? { name: `${c.title}, ${u.title}`, pct: Math.round(ids.reduce((a, id) => a + READY[S.skill(id).level], 0) / ids.length * 100) } : null; }).filter(Boolean);
    return { days, from, today, dayList, q, right, active: dayList.filter(d => d.q).length, log, ups, kinds, skillsSeen, slips, badges, due, weak, prep, ideas: ideas.slice(0, 3), streak: S.streak().days, name: st.profile.name.trim(), points: log.reduce((a, e) => a + (e.pts || 0), 0),
      min: dayList.reduce((a, d) => a + d.min, 0), tests, strong, units };
  }
  const TESTS = { 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', 'chapter-test': 'Practice test', testout: 'Test-out' };
  const READY = [0, 0.25, 0.6, 0.85, 1];
  /** the period in one sentence, for the top of the report and the start of its text */
  const glance = r => `Practiced on ${r.active} of ${r.days} days: ${H.plural(r.q, 'question')}${r.q ? `, ${Math.round(r.right / r.q * 100)}% correct on the first try` : ''}, about ${H.plural(r.min, 'minute')} in all.${r.ups.length ? ` Leveled up in ${H.plural(r.ups.length, 'skill')}.` : ''}`;
  const longDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  /** the report as plain text, for a message */
  function asText(r) {
    const L = [];
    L.push(`Procademy progress report${r.name ? ' for ' + r.name : ''}: ${longDate(r.from)} – ${longDate(r.today)}`);
    L.push(`${glance(r)} Streak: ${r.streak} days.`);
    if (r.tests.length) L.push('Tests: ' + r.tests.map(e => `${TESTS[e.kind]} ${e.right}/${e.total}`).join(', ') + '.');
    if (r.strong.length) L.push('Strongest: ' + r.strong.map(id => H.plain(A.skills[id].title)).join(', ') + '.');
    if (r.weak.length) L.push('Needs work: ' + r.weak.slice(0, 3).map(id => H.plain(A.skills[id].title)).join(', ') + '.');
    if (r.ups.length) L.push('Leveled up: ' + r.ups.map(u => `${H.plain(A.skills[u.id].title)} (${A.LEVELS[u.to]})`).join('; ') + '.');
    if (r.slips.length) L.push('Common slips: ' + r.slips.map(([k, m]) => `${NAMES[k].toLowerCase()} (${m.n})`).join(', ') + '.');
    if (r.prep) L.push(`${r.prep.c.b.short} chapter ${r.prep.c.ch.n} test on ${longDate(r.prep.date)}: ${r.prep.ready}% ready${r.prep.tests[0] ? `, last practice test ${r.prep.tests[0].right}/${r.prep.tests[0].total}` : ''}.`);
    if (r.badges.length) L.push('New badges: ' + r.badges.map(b => b.name).join(', ') + '.');
    if (r.ideas.length) L.push('Suggested next steps: ' + r.ideas.map(i => i.text).join(' '));
    return L.join('\n');
  }

  function page(root) {
    let days = 7;
    function render() {
      const r = gather(days), maxQ = Math.max(1, ...r.dayList.map(d => d.q));
      root.innerHTML = `
        <div class="ws-controls card tight"><div class="row between" style="flex-wrap:wrap;gap:10px">
          <div><a class="btn sm ghost" href="#/progress">← Progress</a> <b style="margin-left:6px">Progress report</b></div>
          <div class="btn-row" style="margin:0"><label class="small">Period <select id="rp-days"><option value="7" ${days === 7 ? 'selected' : ''}>Last 7 days</option><option value="30" ${days === 30 ? 'selected' : ''}>Last 30 days</option></select></label>
            <button class="btn sm" id="rp-copy">Copy as text</button><button class="btn sm primary" id="rp-print">Print or save as PDF</button></div></div>
          <p class="tiny muted" style="margin:8px 0 0">For a parent or teacher. Made on this device from what is saved here; nothing is sent.</p></div>
        <article class="ws-sheet report">
          <header class="ws-head"><div><div class="ws-brand">Procademy progress report</div><h1>${r.name ? esc(r.name) : 'Progress'}</h1><p>${esc(longDate(r.from))} – ${esc(longDate(r.today))}</p></div>
            <div class="rp-streak"><b>${r.streak}</b><span>day streak</span></div></header>
          <p class="rp-glance">${esc(glance(r))}</p>
          <div class="rp-tiles">
            <div><b>${r.active} / ${r.days}</b><span>days practiced</span></div>
            <div><b>${r.q}</b><span>questions answered</span></div>
            <div><b>${r.q ? Math.round(r.right / r.q * 100) : 0}%</b><span>correct on the first try</span></div>
            <div><b>${r.min}</b><span>minutes practicing</span></div>
            <div><b>${r.ups.length}</b><span>skills leveled up</span></div>
          </div>
          <h2>Questions each day</h2>
          <div class="rp-bars">${r.dayList.map(d => `<div title="${d.iso}: ${d.q}"><i style="height:${Math.round(d.q / maxQ * 100)}%"></i><span>${days <= 7 ? new Date(d.iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short' }) : (Number(d.iso.slice(8)) % 5 === 0 ? Number(d.iso.slice(8)) : '')}</span></div>`).join('')}</div>
          <div class="rp-two">
            <section><h2>Leveled up</h2>${r.ups.length ? `<ul>${r.ups.slice(0, 10).map(u => `<li>${A.skills[u.id].title} <span class="rp-lv">${A.LEVELS[u.from]} → <b>${A.LEVELS[u.to]}</b></span></li>`).join('')}</ul>` : '<p class="rp-none">No level changes in this period.</p>'}</section>
            <section><h2>What was practiced</h2>${Object.keys(r.kinds).length ? `<ul>${Object.entries(r.kinds).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<li>${esc(KINDS[k] || k)}: ${n}</li>`).join('')}</ul>` : '<p class="rp-none">Nothing in this period.</p>'}</section>
          </div>
          <div class="rp-two">
            <section><h2>Strongest</h2>${r.strong.length ? `<ul>${r.strong.map(id => `<li>${A.skills[id].title} <span class="rp-lv">${A.LEVELS[S.skill(id).level]}</span></li>`).join('')}</ul>` : '<p class="rp-none">Not enough practice yet.</p>'}</section>
            <section><h2>Needs work</h2>${r.weak.length ? `<ul>${r.weak.slice(0, 3).map(id => `<li>${A.skills[id].title} <span class="rp-lv">${Math.round(S.skill(id).right / S.skill(id).tries * 100)}% right</span></li>`).join('')}</ul>` : '<p class="rp-none">Nothing weak right now.</p>'}</section>
          </div>
          <div class="rp-two">
            <section><h2>Tests in this period</h2>${r.tests.length ? `<ul>${r.tests.map(e => `<li>${TESTS[e.kind]}${e.title ? ': ' + esc(e.title) : ''} <span class="rp-lv">${e.right} / ${e.total} (${Math.round(e.right / e.total * 100)}%), ${new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`).join('')}</ul>` : '<p class="rp-none">No tests in this period.</p>'}</section>
            <section><h2>How ready for the next test</h2>${r.prep || r.units.length ? `<ul>${r.prep ? `<li>${esc(r.prep.c.b.short)} chapter ${r.prep.c.ch.n} test <span class="rp-lv">${r.prep.ready}% ready</span></li>` : ''}${r.units.map(u => `<li>Unit test: ${esc(u.name)} <span class="rp-lv">${u.pct}% ready</span></li>`).join('')}</ul>` : '<p class="rp-none">Save a course to see this.</p>'}</section>
          </div>
          <div class="rp-two">
            <section><h2>Common slips</h2>${r.slips.length ? `<ul>${r.slips.map(([k, m]) => `<li><b>${NAMES[k]}</b> (${m.n}) — ${esc(window.COACH ? COACH.TIPS[k] || '' : '')}</li>`).join('')}</ul>` : '<p class="rp-none">None recorded yet.</p>'}</section>
            <section><h2>Upcoming</h2><ul>
              ${r.prep ? `<li><b>${esc(r.prep.c.b.short)} chapter ${r.prep.c.ch.n} test</b> on ${esc(longDate(r.prep.date))}: ${r.prep.ready}% ready${r.prep.tests[0] ? `; last practice test ${r.prep.tests[0].right} / ${r.prep.tests[0].total}` : ''}.</li>` : ''}
              <li>${r.due.length ? `${H.plural(r.due.length, 'skill')} due for a refresher.` : 'Nothing due for review.'}</li>
              ${r.weak.length ? `<li>Needs more practice: ${r.weak.map(id => A.skills[id].title).join(', ')}.</li>` : ''}
              ${r.badges.length ? `<li>New badges: ${r.badges.map(b => esc(b.name)).join(', ')}.</li>` : ''}
            </ul></section>
          </div>
          <h2>Suggested next steps</h2>
          ${r.ideas.length ? `<ol class="rp-ideas">${r.ideas.map(i => `<li><a href="${i.href}">${esc(i.text)}</a></li>`).join('')}</ol>` : '<p class="rp-none">No changes are suggested. Continue the current routine.</p>'}
          <footer class="ws-foot">Procademy keeps all of this on the learner’s device. Levels: Attempted, Familiar, Proficient (all correct in a practice set), Mastered (kept correct in tests and challenges).</footer>
        </article>${window.FAMILY ? FAMILY.shareBox() : ''}`;
      if (window.FAMILY) FAMILY.wireShare(root);
      root.querySelector('#rp-days').addEventListener('change', ev => { days = Number(ev.target.value); render(); });
      root.querySelector('#rp-print').addEventListener('click', () => window.print());
      root.querySelector('#rp-copy').addEventListener('click', () => { const t = asText(r); REPORT._lastText = t; try { navigator.clipboard.writeText(t).then(() => V.toast('The report was copied as text.'), () => V.toast('The report couldn’t be copied.')); } catch (e) { V.toast('The report couldn’t be copied.'); } });
      root.__report = r;
    }
    render();
    // Print a report on Progress: straight to printing, in one tap
    let auto = null; try { auto = sessionStorage.getItem('procademy.printReport'); sessionStorage.removeItem('procademy.printReport'); } catch (e) { auto = null; }
    if (auto) setTimeout(() => { if (root.querySelector('.report')) window.print(); }, 350);
  }

  const REPORT = { gather, asText, page, _lastText: null };
  window.REPORT = REPORT;
})();
