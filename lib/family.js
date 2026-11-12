/* Family and class (#/family): how everyone a parent or teacher helps is doing, on one page. Learners on this device
   appear by themselves; anyone else sends a progress link (#/family/add/<code>, made on their report page) that
   adds them here. A link carries a short summary only (first name, grade, streak, this week, levels, course
   mastery, what to practice next), never answers or history, and it is checked field by field like any link.
   The list of shared learners is kept on this device (procademy.family.v1); nothing goes to a server. */
'use strict';
(function () {
  const A = window.ACADEMY, S = window.STORE, V = window.VIEWS, D = window.DRAW, H = V._h, esc = H.esc;
  const KEY = 'procademy.family.v1', PTS = [0, 0, 50, 80, 100];
  const SLIPS = ['sign', 'flip', 'place', 'percent', 'early', 'echo', 'digits', 'round', 'one', 'op'];

  /** a progress summary from a learner's saved state */
  function summarize(st, nameFallback) {
    const days = st.days || {}, did = d => !!(days[d] && days[d].q), used = (st.savers && st.savers.used) || {};
    let day = S.today(), streak = 0;
    if (!did(day)) day = S.dayShift(day, -1);
    while (did(day) || used[day]) { if (did(day)) streak++; day = S.dayShift(day, -1); }
    const monday = S.dayShift(S.today(), -((new Date(S.today() + 'T12:00').getDay() + 6) % 7));
    const p0 = st.profile || {}, goal0 = Number.isInteger(p0.goal) && p0.goal >= 5 && p0.goal <= 200 ? p0.goal : 20;
    const week = { days: 0, q: 0, right: 0 }, w7 = [];
    let gm = 0, min = 0;
    for (let k = 0; k < 7; k++) { const d = days[S.dayShift(monday, k)]; w7.push(d && d.q ? 1 : 0); if (d && d.q) { week.days++; week.q += d.q; week.right += d.right || 0; min += S.minutes(d); if (d.q >= goal0) gm++; } }
    const since = new Date(monday + 'T00:00').getTime(), ups = [];
    (st.log || []).filter(e => e && e.t >= since).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && A.whereIs(ch.skillId) && !ups.includes(ch.skillId) && ups.length < 3) ups.push(ch.skillId); }));
    const lv = id => ((st.skills || {})[id] || {}).level || 0;
    const counts = [0, 0, 0, 0, 0];
    Object.keys(st.skills || {}).forEach(id => { if (A.skills[id]) counts[lv(id)]++; });
    const p = st.profile || {}, enrolled = (p.enrolled || []).map(id => A.courseById(id)).filter(Boolean);
    const courses = enrolled.slice(0, 6).map(c => { const ids = A.courseSkills(c); return { id: c.id, pct: ids.length ? Math.round(ids.reduce((a, id) => a + PTS[lv(id)], 0) / ids.length) : 0 }; });
    const next = [];
    enrolled.forEach(c => {
      const placed = (p.placed || {})[c.id], list = A.courseSkills(c), u = placed && placed.start ? c.units.find(x => x.id === placed.start) : null;
      const at = u ? list.indexOf(u.skills.find(id => list.includes(id))) : -1, order = at > 0 ? list.slice(at).concat(list.slice(0, at)) : list;
      order.filter(id => lv(id) < 2).slice(0, 2).forEach(id => { if (next.length < 3 && !next.includes(id)) next.push(id); });
    });
    const slips = Object.entries(st.mistakes || {}).filter(([k, m]) => m && m.n && SLIPS.includes(k)).sort((a, b) => b[1].n - a[1].n).slice(0, 2).map(([k]) => k);
    const last = Object.keys(days).filter(did).sort().pop() || null;
    const goal = Number.isInteger(p.goal) && p.goal >= 5 && p.goal <= 200 ? p.goal : 20, today = (days[S.today()] || {}).q || 0;
    return { v: 1, name: String(p.name || nameFallback || '').trim().slice(0, 24), grade: Number.isInteger(p.grade) ? p.grade : null, t: Date.now(), streak, week, counts: counts.slice(1), courses, next, slips, last, w7, ups, goal, today, gm, min };
  }

  /** a summary from a link, checked field by field, or null */
  function read(code) {
    let o;
    try { o = JSON.parse(D.decode(code) || 'null'); } catch (e) { return null; }
    const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);
    if (!o || o.v !== 1 || !/^[a-z0-9]{6,16}$/.test(String(o.id || ''))) return null;
    const t = Number(o.t);
    if (!(t > Date.UTC(2026, 0, 1) && t < Date.now() + 864e5)) return null;
    const w = o.week || {}, week = { days: int(w.days, 7), q: int(w.q, 100000), right: int(w.right, 100000) };
    if (week.days == null || week.q == null || week.right == null || week.right > week.q) return null;
    const counts = Array.isArray(o.counts) && o.counts.length === 4 ? o.counts.map(n => int(n, 5000)) : null;
    if (!counts || counts.includes(null)) return null;
    const streak = int(o.streak, 100000);
    if (streak == null) return null;
    const courses = (Array.isArray(o.courses) ? o.courses : []).slice(0, 6).filter(c => c && A.courseById(c.id) && int(c.pct, 100) != null).map(c => ({ id: c.id, pct: c.pct }));
    const next = (Array.isArray(o.next) ? o.next : []).slice(0, 3).filter(id => typeof id === 'string' && A.skills[id] && A.whereIs(id));
    const slips = (Array.isArray(o.slips) ? o.slips : []).slice(0, 2).filter(k => SLIPS.includes(k));
    const name = typeof o.name === 'string' ? o.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) : '';
    const grade = o.grade == null ? null : int(o.grade, 12);
    const last = typeof o.last === 'string' && /^\d{4}-\d\d-\d\d$/.test(o.last) ? o.last : null;
    const w7 = Array.isArray(o.w7) && o.w7.length === 7 && o.w7.every(x => x === 0 || x === 1) ? o.w7 : null;
    const ups = (Array.isArray(o.ups) ? o.ups : []).slice(0, 3).filter(id => typeof id === 'string' && A.skills[id] && A.whereIs(id));
    const goal = int(o.goal, 200), today = int(o.today, 100000), gm = int(o.gm, 7), min = int(o.min, 100000);
    return { v: 1, id: o.id, name, grade, t, streak, week, counts, courses, next, slips, last, w7, ups, goal: goal != null && goal >= 5 ? goal : null, today, gm, min };
  }

  function shared() { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && Array.isArray(v.list) ? v.list.map(x => read(D.encode(JSON.stringify(x)))).filter(Boolean) : []; } catch (e) { return []; } }
  function keep(list) { try { localStorage.setItem(KEY, JSON.stringify({ list })); } catch (e) { /* this visit only */ } }
  /** add (or update) a shared learner; an older link never replaces a newer one */
  function add(sum) { const list = shared(), at = list.findIndex(x => x.id === sum.id); if (at >= 0) { if (list[at].t >= sum.t) return false; list[at] = sum; } else list.push(sum); keep(list); return true; }

  /** this learner's progress link, for a parent or teacher */
  function link() {
    let id = S.get().profile.shareId;
    if (!/^[a-z0-9]{6,16}$/.test(String(id || ''))) { id = Math.random().toString(36).slice(2, 12).padEnd(8, '0'); S.setProfile({ shareId: id }); }
    const sum = Object.assign(summarize(S.get()), { id });
    return (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]) + '#/family/add/' + D.encode(JSON.stringify(sum));
  }
  /** the share box on the report page */
  function shareBox() {
    return `<div class="card no-print share-progress"><h2>Share progress with a parent or teacher</h2>
      <p class="small muted">A link with a short summary: your first name, grade, streak, this week, skill levels and what to practice next. No answers or history. Opening it adds you to their Family and class page; send a new link any time to update it.</p>
      <div class="btn-row"><button class="btn primary sm" type="button" id="fam-copy">Copy my progress link</button>${navigator.share ? '<button class="btn sm" type="button" id="fam-share">Share…</button>' : ''}</div><div id="fam-qr"></div></div>`;
  }
  function wireShare(root) {
    const c = root.querySelector('#fam-copy');
    if (!c) return;
    c.addEventListener('click', () => { const url = link(); FAMILY._last = url; try { navigator.clipboard.writeText(url).then(() => V.toast('Progress link copied.'), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); } });
    const sh = root.querySelector('#fam-share');
    if (sh) sh.addEventListener('click', () => { navigator.share({ title: 'My Procademy progress', url: link() }).catch(() => {}); });
    if (window.MOVE && MOVE.qrButton) root.querySelector('#share-progress-row, .share-progress .btn-row').appendChild(MOVE.qrButton(root.querySelector('#fam-qr'), link));
  }

  const todayIdx = () => (new Date(S.today() + 'T12:00').getDay() + 6) % 7;
  /** a practice link for a class: a whole course, a unit or one skill, with questions that never run out */
  function assignCard() {
    const c0 = A.courses.find(c => c.id === 'math-7') || A.courses[0];
    return `<div class="section-title"><h2>Share practice with a class</h2></div>
      <div class="card fam-assign"><p class="small muted" style="margin:0 0 10px">Pick a course, a unit or one skill, and copy the link. Opening it starts practice right away, with questions that never run out, on the learner’s own device.</p>
        <div class="fam-pick"><label class="field"><span class="label">Course</span><select id="fa-course">${A.courses.map(c => `<option value="${c.id}" ${c === c0 ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
          <label class="field"><span class="label">Unit</span><select id="fa-unit"></select></label>
          <label class="field"><span class="label">Skill</span><select id="fa-skill"></select></label></div>
        <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="button" id="fa-copy">Copy the practice link</button><a class="btn sm" id="fa-try" href="#/unlimited">Try it</a></div>
        <details class="fam-pickset"><summary><b>Or pick the skills yourself</b> <span class="small muted">any mix, up to 40</span></summary>
          <label class="field"><span class="label">A name for the set</span><input id="fs-title" maxlength="60" placeholder="For example: Chapter 3 review"></label>
          ${pickerHtml('set')}
          <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="button" id="fs-copy" disabled>Copy the link for these skills</button><a class="btn sm" id="fs-try" href="#/unlimited" aria-disabled="true">Try it</a></div></details></div>`;
  }
  function wireAssign(root) {
    const cs = root.querySelector('#fa-course'); if (!cs) return;
    const us = root.querySelector('#fa-unit'), ks = root.querySelector('#fa-skill'), tr = root.querySelector('#fa-try');
    const hash = () => (ks.value ? `#/unlimited/skill/${encodeURIComponent(ks.value)}` : us.value ? `#/unlimited/unit/${cs.value}/${us.value}` : `#/unlimited/course/${cs.value}`);
    const fillSkills = () => { const u = A.unitById(cs.value, us.value); ks.innerHTML = '<option value="">' + (u ? 'Every skill in the unit' : 'Every skill in the course') + '</option>' + (u ? u.skills.filter(id => A.skills[id]).map(id => `<option value="${esc(id)}">${esc(H.plain(A.skills[id].title))}</option>`).join('') : ''); ks.disabled = !u; tr.href = hash(); };
    const fillUnits = () => { const c = A.courseById(cs.value); us.innerHTML = '<option value="">The whole course</option>' + c.units.map((u, k) => `<option value="${u.id}">Unit ${k + 1}: ${esc(u.title)}</option>`).join(''); fillSkills(); };
    cs.addEventListener('change', fillUnits); us.addEventListener('change', fillSkills); ks.addEventListener('change', () => { tr.href = hash(); });
    fillUnits();
    const pick = root.querySelector('.fam-pickset .fam-picker');
    if (pick) {
      const copy = root.querySelector('#fs-copy'), tryIt = root.querySelector('#fs-try'), title = root.querySelector('#fs-title');
      let ids = [];
      const upd = () => { copy.disabled = !ids.length; tryIt.href = ids.length ? setHash(ids, title.value.trim()) : '#/unlimited'; tryIt.setAttribute('aria-disabled', String(!ids.length)); };
      wirePicker(pick, v => { ids = v; upd(); });
      title.addEventListener('input', upd);
      copy.addEventListener('click', () => {
        const url = siteBase() + setHash(ids, title.value.trim()); FAMILY._assign = url;
        try { navigator.clipboard.writeText(url).then(() => V.toast(`Link copied: practice on ${ids.length > 40 ? 40 : ids.length} skills.`), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); }
      });
    }
    root.querySelector('#fa-copy').addEventListener('click', () => {
      const url = (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]) + hash(); FAMILY._assign = url;
      try { navigator.clipboard.writeText(url).then(() => V.toast('Practice link copied. Share it with the class.'), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); }
    });
  }

  /** one learner's card */
  function card(sum, opts) {
    const pct = sum.week.q ? Math.round(sum.week.right / sum.week.q * 100) : 0;
    const grade = sum.grade == null ? '' : sum.grade === 0 ? 'Kindergarten' : `Grade ${sum.grade}`;
    const names = { sign: 'sign slips', flip: 'flipped fractions', place: 'decimal point slips', percent: 'percent and decimal mix-ups', early: 'stopping a step early', echo: 'answering with a given number', digits: 'swapped digits', round: 'rounding', one: 'off-by-one slips', op: 'choosing the wrong operation' };
    return `<div class="card fam-card"><div class="row between" style="flex-wrap:wrap;gap:6px"><h3 style="margin:0" data-raw>${esc(sum.name || 'A learner')}</h3><span class="small muted">${[grade, opts.where].filter(Boolean).map(esc).join(' · ')}</span></div>
      <div class="fam-stats"><span><b>${sum.streak}</b> day streak</span><span><b>${sum.week.days}</b> of 7 days this week</span><span><b>${sum.week.q}</b> questions${sum.week.q ? `, ${pct}% right` : ''}</span>${sum.min != null ? `<span><b>${sum.min}</b> min this week</span>` : ''}<span><b>${sum.counts[3]}</b> mastered · <b>${sum.counts[2]}</b> proficient</span></div>
      ${sum.courses.length ? `<ul class="fam-courses">${sum.courses.map(c => `<li><span>${esc(A.courseById(c.id).title)}</span><span class="pbar" role="img" aria-label="${c.pct}% mastered"><span style="width:${c.pct}%"></span></span><span class="small muted">${c.pct}%</span></li>`).join('')}</ul>` : ''}
      ${sum.w7 ? `<ol class="fam-week" aria-label="This week, Monday to Sunday">${sum.w7.map((x, k) => `<li class="${x ? 'did' : ''}${k === todayIdx() ? ' today' : ''}" title="${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][k]}: ${x ? 'practiced' : 'no practice'}"><span>${'MTWTFSS'[k]}</span><i aria-hidden="true"></i></li>`).join('')}</ol>` : ''}
      ${sum.goal ? `<div class="fam-goal"><span class="small"><b>Today: ${sum.today || 0} of ${sum.goal}</b> questions${(sum.today || 0) >= sum.goal ? ' · goal met' : ''}${sum.gm != null ? ` · met on ${sum.gm} ${sum.gm === 1 ? 'day' : 'days'} this week` : ''}</span><span class="pbar" role="img" aria-label="${Math.min(100, Math.round((sum.today || 0) / sum.goal * 100))}% of today’s goal"><span style="width:${Math.min(100, Math.round((sum.today || 0) / sum.goal * 100))}%"></span></span>${opts.goalFor ? `<label class="small fam-goal-set">Daily goal <select data-fam-goal="${esc(opts.goalFor)}">${[10, 20, 30, 50].map(n => `<option value="${n}" ${n === sum.goal ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}</div>` : ''}
      ${sum.week.q ? `<p class="small fam-high"><b>This week:</b> ${sum.week.days} ${sum.week.days === 1 ? 'day' : 'days'}, ${sum.week.q} questions, ${pct}% right the first time${sum.ups && sum.ups.length ? `. Leveled up in ${sum.ups.map(id => `<a href="${H.skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}` : ''}.</p>` : `<p class="small muted fam-high">No practice yet this week.</p>`}
      ${(() => { const id = (sum.ups && sum.ups[0]) || sum.next[0]; return id ? `<p class="small fam-ask"><b>Ask about it:</b> “Can you show me how ${esc(H.plain(A.skills[id].title).toLowerCase())} works, with an example?”</p>` : ''; })()}
      ${sum.next.length ? `<p class="small" style="margin:8px 0 0"><b>Next to practice:</b> ${sum.next.map(id => `<a href="${H.skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}</p>` : ''}
      ${sum.slips.length ? `<p class="small muted" style="margin:4px 0 0">Watch for ${sum.slips.map(k => names[k]).join(' and ')}.</p>` : ''}
      ${opts.local ? `<div class="btn-row fam-acts"><button class="btn sm" type="button" data-fam-note="${esc(opts.local)}">${opts.note ? 'Change the note' : 'Leave a note'}</button><button class="btn sm" type="button" data-fam-assign="${esc(opts.local)}">Assign practice</button></div>
        ${opts.note ? `<p class="small muted fam-note-was">Your note: “${esc(opts.note.text)}”${opts.note.reply ? ` · they replied: “${esc(opts.note.reply.text || '')}”` : opts.note.seen ? ' · read' : ' · not read yet'}</p>` : ''}
        ${opts.assigned && opts.assigned.length ? `<ul class="fam-assigned">${opts.assigned.map(a => `<li><span>${esc(a.title)}</span><span class="small muted">${a.done ? 'done' : `${a.got} of ${a.ids.length} skills practiced`}</span></li>`).join('')}</ul>` : ''}
        <div class="fam-panel" data-fam-panel="${esc(opts.local)}"></div>` : ''}
      ${opts.extra || ''}</div>`;
  }

  /* ---------- for a parent: a note on a learner's Home, and practice assigned to them ---------- */
  /** practice assigned to a learner, each with how many of its skills were practiced since */
  function assignedOf(st) {
    return ((st.profile || {}).assigned || []).filter(a => a && Array.isArray(a.ids)).map(a => {
      const got = a.ids.filter(id => (((st.skills || {})[id] || {}).last || 0) > a.t).length;
      return Object.assign({}, a, { got, done: got >= a.ids.length });
    });
  }
  /** the skill picker: a course, then the skills of its units to tick (used for class links and assignments) */
  function pickerHtml(prefix) {
    const c0 = A.courses.find(c => c.id === (S.get().profile.enrolled.find(id => A.courseById(id)) || 'math-7')) || A.courses[0];
    return `<div class="fam-picker" data-prefix="${prefix}"><label class="field"><span class="label">Course</span><select class="fp-course">${A.courses.map(c => `<option value="${c.id}" ${c === c0 ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
      <div class="fp-units"></div><p class="small muted fp-count">No skills chosen yet.</p></div>`;
  }
  function wirePicker(box, onChange) {
    const sel = box.querySelector('.fp-course'), units = box.querySelector('.fp-units'), count = box.querySelector('.fp-count');
    const chosen = new Set();
    const tell = () => { count.textContent = chosen.size ? `${chosen.size} ${chosen.size === 1 ? 'skill' : 'skills'} chosen${chosen.size > 40 ? ' (a link holds up to 40)' : ''}` : 'No skills chosen yet.'; onChange([...chosen]); };
    const draw = () => {
      const c = A.courseById(sel.value);
      units.innerHTML = c.units.map((u, k) => `<details class="fp-unit"><summary><b>Unit ${k + 1}: ${esc(u.title)}</b> <span class="small muted">${u.skills.filter(id => A.skills[id]).length} skills</span></summary>
        <label class="fp-all small"><input type="checkbox" data-unit="${u.id}"> The whole unit</label>
        <ul>${u.skills.filter(id => A.skills[id]).map(id => `<li><label><input type="checkbox" value="${esc(id)}" ${chosen.has(id) ? 'checked' : ''}> ${A.skills[id].title}</label></li>`).join('')}</ul></details>`).join('');
    };
    sel.addEventListener('change', draw);
    units.addEventListener('change', ev => {
      const cb = ev.target;
      if (cb.dataset.unit) { cb.closest('.fp-unit').querySelectorAll('input[value]').forEach(x => { x.checked = cb.checked; if (cb.checked) chosen.add(x.value); else chosen.delete(x.value); }); }
      else if (cb.value) { if (cb.checked) chosen.add(cb.value); else chosen.delete(cb.value); }
      tell();
    });
    draw();
    return { clear() { chosen.clear(); draw(); tell(); } };
  }
  const setHash = (ids, title) => `#/unlimited/set/${ids.slice(0, 40).map(encodeURIComponent).join(',')}${title ? '/' + encodeURIComponent(title.slice(0, 60)) : ''}`;
  const siteBase = () => (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]);
  /** a note or an assignment for one learner on this device, in a small panel under their card */
  function panel(root, id, kind) {
    const box = root.querySelector(`[data-fam-panel="${CSS.escape(id)}"]`);
    if (!box) return;
    if (kind === 'note') {
      box.innerHTML = `<form class="fam-form"><label class="field"><span class="label">A note for their Home page</span><textarea rows="2" maxlength="200" class="fn-text" placeholder="For example: Great work this week. Try ten minutes before dinner."></textarea></label>
        <label class="field"><span class="label">From</span><input class="fn-by" maxlength="24" placeholder="Mom, Dad, Ms. Lee…"></label>
        <div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Save the note</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button>${''}</div></form>`;
    } else {
      box.innerHTML = `<form class="fam-form"><label class="field"><span class="label">A name for it</span><input class="fa-title" maxlength="60" placeholder="For example: Fractions before Friday"></label>
        ${pickerHtml('as')}<div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Assign it</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button></div></form>`;
    }
    const f = box.querySelector('form');
    let ids = [];
    if (kind !== 'note') wirePicker(f.querySelector('.fam-picker'), v => { ids = v; });
    f.querySelector('[data-fam-cancel]').addEventListener('click', () => { box.innerHTML = ''; });
    (f.querySelector('textarea, input')).focus();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      if (kind === 'note') {
        const text = f.querySelector('.fn-text').value.trim(), by = f.querySelector('.fn-by').value.trim();
        if (!text) { f.querySelector('.fn-text').focus(); return; }
        LEARNERS.patch(id, () => ({ parentNote: { text: text.slice(0, 200), by: by.slice(0, 24), t: Date.now(), seen: false } }));
        V.toast('The note will show on their Home page.');
      } else {
        if (!ids.length) { V.toast('Choose at least one skill.'); return; }
        const title = f.querySelector('.fa-title').value.trim() || 'Practice from a parent';
        LEARNERS.patch(id, p => ({ assigned: [{ id: Date.now().toString(36), title: title.slice(0, 60), ids: ids.slice(0, 40), t: Date.now() }].concat(p.assigned || []).slice(0, 5) }));
        V.toast('Assigned. It shows on their Home page.');
      }
      page(root);
    });
  }

  /** everyone side by side: on this device and shared with you */
  function compare(rows) {
    if (rows.length < 2) return '';
    return `<div class="section-title"><h2>Side by side</h2><span class="small muted">this week</span></div>
      <div class="card fam-compare"><div class="mtable-wrap"><table class="plain fam-table"><thead><tr><th>Learner</th><th>Days</th><th>Questions</th><th>Right</th><th>Minutes</th><th>Goal met</th><th>Streak</th><th>Mastered</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td data-raw>${esc(r.name || 'A learner')}${r.where ? `<span class="small muted"> · ${esc(r.where)}</span>` : ''}</td><td>${r.week.days} of 7</td><td>${r.week.q}</td><td>${r.week.q ? Math.round(r.week.right / r.week.q * 100) + '%' : '–'}</td><td>${r.min == null ? '–' : r.min}</td><td>${r.gm == null ? '–' : r.gm + ' days'}</td><td>${r.streak}</td><td>${r.counts[3]}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  /** a teacher's class: paste several progress links at once */
  function pasteCard() {
    return `<div class="card fam-paste"><h3 style="margin:0 0 4px">Add several at once</h3><p class="small muted" style="margin:0 0 8px">Paste the progress links your students sent, one per line or all together. Each one is checked and kept on this device only.</p>
      <label class="visually-hidden" for="fam-links">Progress links</label><textarea id="fam-links" rows="3" placeholder="https://…#/family/add/…"></textarea>
      <div class="btn-row" style="margin-top:8px"><button class="btn sm primary" type="button" id="fam-paste-go">Add them</button></div></div>`;
  }
  function wirePaste(root) {
    const b = root.querySelector('#fam-paste-go'); if (!b) return;
    b.addEventListener('click', () => {
      const codes = (root.querySelector('#fam-links').value.match(/#\/family\/add\/[A-Za-z0-9_\-~.%]+/g) || []).map(x => x.split('/').pop());
      let added = 0, bad = 0;
      codes.forEach(c => { const sum = read(c); if (sum) { if (add(sum)) added++; } else bad++; });
      V.toast(!codes.length ? 'No progress links found. Paste links that contain #/family/add/.' : `${added} added${bad ? `, ${bad} didn’t work` : ''}.`);
      page(root);
    });
  }

  function page(root) {
    H.tutorCtx(null);
    const here = window.LEARNERS ? LEARNERS.list().map(l => ({ l, st: LEARNERS.stateOf(l.id) })).filter(x => x.st) : [{ l: { id: 'me' }, st: S.get() }];
    const away = shared().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const local = window.LEARNERS && here.length;
    const rows = here.map(({ l, st }) => Object.assign(summarize(st, l.name), { where: 'here' })).concat(away.map(x => Object.assign({}, x, { where: 'shared' })));
    root.innerHTML = `<h1>Family and class</h1><p class="muted">How everyone you help is doing. Learners on this device appear here by themselves; anyone else can send you their progress link from their report.</p>
      <div class="section-title"><h2>On this device</h2><a href="#/report">Full report →</a></div>
      ${compare(rows)}
      <div class="fam-grid">${here.map(({ l, st }) => card(summarize(st, l.name), { where: window.LEARNERS && l.id === LEARNERS.active() ? 'Using Procademy now' : 'On this device', goalFor: l.id, local: local ? l.id : null, note: (st.profile || {}).parentNote || null, assigned: assignedOf(st) })).join('')}</div>
      <div class="section-title"><h2>Shared with you</h2></div>
      ${away.length ? `<div class="fam-grid">${away.map(s => card(s, { where: 'Updated ' + new Date(s.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), extra: `<div class="btn-row"><button class="btn sm ghost" type="button" data-fam-del="${esc(s.id)}">Remove</button></div>` })).join('')}</div>`
        : `<div class="card empty"><p>No one has shared their progress with you yet. On their device, a learner opens <b>Progress</b>, then <b>Report</b>, and sends you <b>my progress link</b>. Opening it here adds them.</p></div>`}
      ${pasteCard()}
      ${assignCard()}
      ${shareBox()}`;
    root.querySelectorAll('[data-fam-del]').forEach(b => b.addEventListener('click', () => { keep(shared().filter(x => x.id !== b.dataset.famDel)); page(root); }));
    root.querySelectorAll('[data-fam-goal]').forEach(sel => sel.addEventListener('change', () => {
      const id = sel.dataset.famGoal, n = Number(sel.value);
      if (window.LEARNERS ? LEARNERS.setGoal(id, n) : (S.setProfile({ goal: n }), true)) V.toast(`Daily goal: ${n} questions`);
      page(root);
    }));
    root.querySelectorAll('[data-fam-note]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famNote, 'note')));
    root.querySelectorAll('[data-fam-assign]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famAssign, 'assign')));
    wireShare(root);
    wireAssign(root);
    wirePaste(root);
  }

  /** #/family/add/<code>: someone's progress link */
  function addPage(root, code) {
    H.tutorCtx(null);
    const sum = read(code);
    if (!sum) { root.innerHTML = `<div class="card empty"><h1>This progress link doesn’t work</h1><p class="muted">It may have been shortened when it was copied. Ask for a new link.</p><a class="btn primary" href="#/family">Family and class</a></div>`; return; }
    root.innerHTML = `<h1>Add ${esc(sum.name || 'this learner')}’s progress?</h1><p class="muted">It will be kept on this device, on your Family and class page. A newer link from them updates it.</p>
      ${card(sum, { where: 'Shared on ' + new Date(sum.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })}
      <div class="btn-row"><button class="btn primary" type="button" id="fam-add">Add to Family and class</button><a class="btn" href="#/">Not now</a></div>`;
    root.querySelector('#fam-add').addEventListener('click', () => { const fresh = add(sum); V.toast(fresh ? 'Added to Family and class.' : 'You already have a newer update from them.'); location.hash = '#/family'; });
  }

  const FAMILY = { summarize, read, add, shared, link, shareBox, wireShare, page, addPage, assignedOf, setHash, _last: null, _assign: null };
  window.FAMILY = FAMILY;
})();
