/* Family and class (#/family): how everyone a parent or teacher helps is doing, on one page. Learners on this device
   appear by themselves; anyone else sends a progress link (#/family/add/<code>, made on their report page) that
   adds them here. A link carries a short summary only (first name, grade, streak, this week, levels, course
   mastery, what to practice next, a note asking for help, and a nickname for class standings if they chose one),
   never answers or history, and it is checked field by field like any link.
   For a parent: each learner's week in plain words with next steps and how to help at home, a note for their Home
   page, practice assigned to them, tests on their calendar, the questions they flagged, tutor use (counts, and chat
   titles only if allowed), gentle parent controls (a daily time limit, the tutor on or off), a family goal of
   minutes together, a poster to print, a family link for another parent, and every learner's data saved to a file.
   For a teacher: practice links (that can expire), a plan of practice by week, printable sets with an answer key,
   and class standings by nickname, for those who opted in. Getting started and Privacy explain it all in plain words.
   The lists here are kept on this device (procademy.family.v1); nothing goes to a server. The class links travel
   after the # of the address, which no website receives. */
'use strict';
(function () {
  const A = window.ACADEMY, S = window.STORE, V = window.VIEWS, D = window.DRAW, H = V._h, esc = H.esc;
  const KEY = 'procademy.family.v1', PTS = [0, 0, 50, 80, 100];
  const SLIPS = ['sign', 'flip', 'place', 'percent', 'early', 'echo', 'digits', 'round', 'one', 'op'];
  const NICK = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,14}[\p{L}\p{N}]$/u;
  const DAY = 864e5;
  const R = () => window.REPORT;
  const shortDate = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  /* ---------- what this device keeps: { list: shared summaries, goal: { min }, links: class links made, plan, life } ---------- */
  function famGet() { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch (e) { return {}; } }
  function famSet(patch) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(famGet(), patch))); } catch (e) { /* this visit only */ } }

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
    const out = { v: 1, name: String(p.name || nameFallback || '').trim().slice(0, 24), grade: Number.isInteger(p.grade) ? p.grade : null, t: Date.now(), streak, week, counts: counts.slice(1), courses, next, slips, last, w7, ups, goal, today, gm, min };
    const h = p.helpNote;
    if (h && h.text && !h.seen) out.help = { text: String(h.text).slice(0, 160), skill: h.skill && A.skills[h.skill] ? h.skill : null };
    const sd = p.standing;
    if (sd && sd.on && NICK.test(String(sd.nick || '').trim())) { out.nick = String(sd.nick).trim(); out.rank = 1; }
    return out;
  }

  /** a summary from a link, checked field by field, or null */
  function read(code) {
    let o;
    try { o = JSON.parse(D.decode(code) || 'null'); } catch (e) { return null; }
    return check(o);
  }
  function check(o) {
    const int = (v, max) => (Number.isInteger(v) && v >= 0 && v <= max ? v : null);
    if (!o || o.v !== 1 || o.k || !/^[a-z0-9]{6,16}$/.test(String(o.id || ''))) return null;
    const t = Number(o.t);
    if (!(t > Date.UTC(2026, 0, 1) && t < Date.now() + DAY)) return null;
    const w = o.week || {}, week = { days: int(w.days, 7), q: int(w.q, 100000), right: int(w.right, 100000) };
    if (week.days == null || week.q == null || week.right == null || week.right > week.q) return null;
    const counts = Array.isArray(o.counts) && o.counts.length === 4 ? o.counts.map(n => int(n, 5000)) : null;
    if (!counts || counts.includes(null)) return null;
    const streak = int(o.streak, 100000);
    if (streak == null) return null;
    const courses = (Array.isArray(o.courses) ? o.courses : []).slice(0, 6).filter(c => c && A.courseById(c.id) && int(c.pct, 100) != null).map(c => ({ id: c.id, pct: c.pct }));
    const next = (Array.isArray(o.next) ? o.next : []).slice(0, 3).filter(id => typeof id === 'string' && A.skills[id] && A.whereIs(id));
    const slips = (Array.isArray(o.slips) ? o.slips : []).slice(0, 2).filter(k => SLIPS.includes(k));
    const clean = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n) : '');
    const name = clean(o.name, 24);
    const grade = o.grade == null ? null : int(o.grade, 12);
    const last = typeof o.last === 'string' && /^\d{4}-\d\d-\d\d$/.test(o.last) ? o.last : null;
    const w7 = Array.isArray(o.w7) && o.w7.length === 7 && o.w7.every(x => x === 0 || x === 1) ? o.w7 : null;
    const ups = (Array.isArray(o.ups) ? o.ups : []).slice(0, 3).filter(id => typeof id === 'string' && A.skills[id] && A.whereIs(id));
    const goal = int(o.goal, 200), today = int(o.today, 100000), gm = int(o.gm, 7), min = int(o.min, 100000);
    const out = { v: 1, id: o.id, name, grade, t, streak, week, counts, courses, next, slips, last, w7, ups, goal: goal != null && goal >= 5 ? goal : null, today, gm, min };
    const help = o.help && typeof o.help === 'object' ? clean(o.help.text, 160) : '';
    if (help) out.help = { text: help, skill: typeof o.help.skill === 'string' && A.skills[o.help.skill] && A.whereIs(o.help.skill) ? o.help.skill : null };
    const nick = clean(o.nick, 16);
    if (o.rank === 1 && NICK.test(nick)) { out.nick = nick; out.rank = 1; }
    return out;
  }

  function shared() { const v = famGet(); return Array.isArray(v.list) ? v.list.map(x => check(JSON.parse(JSON.stringify(x)))).filter(Boolean) : []; }
  function keep(list) { famSet({ list }); }
  /** add (or update) a shared learner; an older link never replaces a newer one */
  function add(sum) { const list = shared(), at = list.findIndex(x => x.id === sum.id); if (at >= 0) { if (list[at].t >= sum.t) return false; list[at] = sum; } else list.push(sum); keep(list); return true; }

  const siteBase = () => (window.MOVE ? MOVE.siteBase() : location.href.split('#')[0]);
  const shareIdOf = p => (/^[a-z0-9]{6,16}$/.test(String((p || {}).shareId || '')) ? p.shareId : null);
  const newShareId = () => Math.random().toString(36).slice(2, 12).padEnd(8, '0');
  /** this learner's progress link, for a parent or teacher */
  function link() {
    let id = shareIdOf(S.get().profile);
    if (!id) { id = newShareId(); S.setProfile({ shareId: id }); }
    const sum = Object.assign(summarize(S.get()), { id });
    return siteBase() + '#/family/add/' + D.encode(JSON.stringify(sum));
  }
  /** the share box on the report page and here */
  function shareBox() {
    const sd = S.get().profile.standing || {};
    return `<div class="card no-print share-progress"><h2>Share progress with a parent or teacher</h2>
      <p class="small muted">A link with a short summary: your first name, grade, streak, this week, skill levels and what to practice next. No answers or history. Opening it adds you to their Family and class page; send a new link any time to update it.</p>
      <div class="fam-optin"><label class="fam-check"><input type="checkbox" id="fam-rank" ${sd.on ? 'checked' : ''}> Show me in my class’s standings, under a nickname</label>
        <label class="field fam-nick" ${sd.on ? '' : 'hidden'}><span class="label">Nickname</span><input id="fam-nick" type="text" maxlength="16" autocomplete="off" value="${esc(sd.nick || '')}" placeholder="2 to 16 letters or numbers"></label>
        <p class="tiny muted" style="margin:0">Standings show nicknames and this week’s numbers only. Your teacher still sees your first name on their own page.</p></div>
      <div class="btn-row"><button class="btn primary sm" type="button" id="fam-copy">Copy my progress link</button>${navigator.share ? '<button class="btn sm" type="button" id="fam-share">Share…</button>' : ''}</div><div id="fam-qr"></div></div>`;
  }
  function wireShare(root) {
    const c = root.querySelector('#fam-copy');
    if (!c) return;
    const rank = root.querySelector('#fam-rank'), nick = root.querySelector('#fam-nick');
    const saveRank = () => { const n = nick.value.trim(); S.setProfile({ standing: { on: rank.checked, nick: n.slice(0, 16) } }); nick.closest('.fam-nick').hidden = !rank.checked; };
    if (rank) { rank.addEventListener('change', () => { saveRank(); if (rank.checked) nick.focus(); }); nick.addEventListener('input', saveRank); }
    c.addEventListener('click', () => {
      const sd = S.get().profile.standing;
      if (sd && sd.on && !NICK.test(String(sd.nick || '').trim())) { V.toast('Choose a nickname of 2 to 16 letters or numbers, or untick the standings.'); nick.focus(); return; }
      const url = link(); FAMILY._last = url; try { navigator.clipboard.writeText(url).then(() => V.toast('Progress link copied.'), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); }
    });
    const sh = root.querySelector('#fam-share');
    if (sh) sh.addEventListener('click', () => { navigator.share({ title: 'My Procademy progress', url: link() }).catch(() => {}); });
    if (window.MOVE && MOVE.qrButton) root.querySelector('#share-progress-row, .share-progress .btn-row').appendChild(MOVE.qrButton(root.querySelector('#fam-qr'), link));
  }
  const copy = (url, msg) => { try { navigator.clipboard.writeText(url).then(() => V.toast(msg), () => V.toast('The link couldn’t be copied.')); } catch (e) { V.toast('The link couldn’t be copied.'); } };

  /* ---------- class links: practice, a plan by week, standings; each can stop working after a while ---------- */
  const LIVES = [[0, 'Always'], [7, '1 week'], [14, '2 weeks'], [28, '4 weeks'], [70, '10 weeks']];
  const life = () => { const n = Number(famGet().life); return LIVES.some(l => l[0] === n) ? n : 0; };
  const lifeSelect = id => `<label class="small fam-life">Links work for <select id="${id}">${LIVES.map(([n, l]) => `<option value="${n}" ${n === life() ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  const code = o => D.encode(JSON.stringify(o));
  const PRACTICE = /^#\/unlimited\/(course|unit|skill|set)\/[A-Za-z0-9_.,%~\-/]{1,1500}$/;
  /** a class link: plain when it never stops working, otherwise wrapped with the day it stops (and remembered here) */
  function classLink(kind, title, body, days) {
    const t = Date.now(), exp = days ? t + days * DAY : null;
    let url;
    if (kind === 'go' && !days) url = siteBase() + body.to;
    else url = siteBase() + '#/family/add/' + code(Object.assign({ v: 1, k: kind, t, title: String(title || '').slice(0, 60) }, exp ? { exp } : {}, body));
    if (kind !== 'go' || days) remember({ kind, title: String(title || '').slice(0, 60) || 'Class practice', url, t, exp, body, days });
    return url;
  }
  function remember(x) { const list = (famGet().links || []).filter(l => l && l.url !== x.url); famSet({ links: [x].concat(list).slice(0, 15) }); }
  const links = () => (Array.isArray(famGet().links) ? famGet().links.filter(l => l && typeof l.url === 'string' && l.t) : []);
  const KIND_NAME = { go: 'Practice link', plan: 'Plan by week', st: 'Class standings' };
  function linksCard() {
    const list = links();
    if (!list.length) return '';
    const until = l => (l.exp ? (l.exp < Date.now() ? '<span class="chip">Expired</span>' : `works until ${new Date(l.exp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`) : 'no end date');
    return `<details class="card fam-tool fam-links"><summary><b>Your class links</b> <span class="small muted">${list.length}, newest first</span></summary>
      <p class="small muted">Links made on this device. A link stops working on its end date; make a fresh one to share again. A link already sent can’t be taken back before then.</p>
      <ul class="fam-link-list">${list.map((l, i) => `<li><div><b>${esc(l.title)}</b><span class="small muted">${KIND_NAME[l.kind] || 'Link'} · made ${new Date(l.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${until(l)}</span></div>
        <div class="btn-row" style="margin:0">${!l.exp || l.exp > Date.now() ? `<button type="button" class="btn sm" data-cl-copy="${i}">Copy</button>` : ''}<button type="button" class="btn sm" data-cl-fresh="${i}">Make a fresh link</button><button type="button" class="btn sm ghost" data-cl-del="${i}">Remove</button></div></li>`).join('')}</ul></details>`;
  }
  function wireLinks(root) {
    const list = links();
    root.querySelectorAll('[data-cl-copy]').forEach(b => b.addEventListener('click', () => { const l = list[Number(b.dataset.clCopy)]; FAMILY._assign = l.url; copy(l.url, 'Link copied.'); }));
    root.querySelectorAll('[data-cl-del]').forEach(b => b.addEventListener('click', () => { famSet({ links: list.filter((x, k) => k !== Number(b.dataset.clDel)) }); page(root); }));
    root.querySelectorAll('[data-cl-fresh]').forEach(b => b.addEventListener('click', () => {
      const l = list[Number(b.dataset.clFresh)];
      famSet({ links: list.filter((x, k) => k !== Number(b.dataset.clFresh)) });
      const body = l.kind === 'st' ? { rows: standRows(shared()) } : l.body || {};
      const url = classLink(l.kind, l.title, body, l.days || (l.exp ? Math.max(1, Math.round((l.exp - l.t) / DAY)) : 0));
      FAMILY._assign = url; copy(url, 'A fresh link was copied.'); page(root);
    }));
  }

  const todayIdx = () => (new Date(S.today() + 'T12:00').getDay() + 6) % 7;
  /** a practice link for a class: a whole course, a unit or one skill, with questions that never run out */
  function assignCard() {
    const c0 = A.courses.find(c => c.id === 'math-7') || A.courses[0];
    return `<details class="card fam-tool fam-assign" open><summary><b>Share practice with a class</b> <span class="small muted">links, worksheets and a plan by week</span></summary>
        <div class="row between fam-assign-top"><p class="small muted" style="margin:0">Pick a course, a unit or one skill, and copy the link. Opening it starts practice right away, with questions that never run out, on the learner’s own device.</p>${lifeSelect('fa-life')}</div>
        <div class="fam-pick"><label class="field"><span class="label">Course</span><select id="fa-course">${A.courses.map(c => `<option value="${c.id}" ${c === c0 ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
          <label class="field"><span class="label">Unit</span><select id="fa-unit"></select></label>
          <label class="field"><span class="label">Skill</span><select id="fa-skill"></select></label></div>
        <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="button" id="fa-copy">Copy the practice link</button><a class="btn sm" id="fa-try" href="#/unlimited">Try it</a><a class="btn sm" id="fa-ws" href="#/worksheets" aria-disabled="true">Print a worksheet with answers</a></div>
        <details class="fam-pickset"><summary><b>Or pick the skills yourself</b> <span class="small muted">any mix, up to 40</span></summary>
          <label class="field"><span class="label">A name for the set</span><input id="fs-title" maxlength="60" placeholder="For example: Chapter 3 review"></label>
          ${pickerHtml('set')}
          <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="button" id="fs-copy" disabled>Copy the link for these skills</button><a class="btn sm" id="fs-try" href="#/unlimited" aria-disabled="true">Try it</a><button class="btn sm" type="button" id="fs-key" disabled>Print with an answer key</button></div>
          <p class="tiny muted" style="margin:0">Online, each learner gets fresh questions. For one set that everyone shares, with the answers, print it with the answer key.</p></details>
        ${planHtml()}</details>`;
  }
  function wireAssign(root) {
    const cs = root.querySelector('#fa-course'); if (!cs) return;
    const us = root.querySelector('#fa-unit'), ks = root.querySelector('#fa-skill'), tr = root.querySelector('#fa-try'), ws = root.querySelector('#fa-ws');
    const hash = () => (ks.value ? `#/unlimited/skill/${encodeURIComponent(ks.value)}` : us.value ? `#/unlimited/unit/${cs.value}/${us.value}` : `#/unlimited/course/${cs.value}`);
    const sheet = () => (ks.value ? `#/worksheet/skill/${encodeURIComponent(ks.value)}` : us.value ? `#/worksheet/unit/${cs.value}/${us.value}` : '');
    const upd = () => { tr.href = hash(); const w = sheet(); ws.href = w || '#/family'; ws.setAttribute('aria-disabled', String(!w)); ws.title = w ? '' : 'Choose a unit or a skill first'; };
    const fillSkills = () => { const u = A.unitById(cs.value, us.value); ks.innerHTML = '<option value="">' + (u ? 'Every skill in the unit' : 'Every skill in the course') + '</option>' + (u ? u.skills.filter(id => A.skills[id]).map(id => `<option value="${esc(id)}">${esc(H.plain(A.skills[id].title))}</option>`).join('') : ''); ks.disabled = !u; upd(); };
    const fillUnits = () => { const c = A.courseById(cs.value); us.innerHTML = '<option value="">The whole course</option>' + c.units.map((u, k) => `<option value="${u.id}">Unit ${k + 1}: ${esc(u.title)}</option>`).join(''); fillSkills(); };
    cs.addEventListener('change', fillUnits); us.addEventListener('change', fillSkills); ks.addEventListener('change', upd);
    ws.addEventListener('click', ev => { if (ws.getAttribute('aria-disabled') === 'true') { ev.preventDefault(); V.toast('Choose a unit or a skill first.'); } });
    fillUnits();
    const lifeSel = root.querySelector('#fa-life');
    if (lifeSel) lifeSel.addEventListener('change', () => famSet({ life: Number(lifeSel.value) }));
    const title = () => { const u = A.unitById(cs.value, us.value); return ks.value ? H.plain(A.skills[ks.value].title) : u ? u.title : A.courseById(cs.value).title; };
    const pick = root.querySelector('.fam-pickset .fam-picker');
    if (pick) {
      const copyB = root.querySelector('#fs-copy'), tryIt = root.querySelector('#fs-try'), keyB = root.querySelector('#fs-key'), ttl = root.querySelector('#fs-title');
      let ids = [];
      const upd2 = () => { copyB.disabled = !ids.length; keyB.disabled = !ids.length; tryIt.href = ids.length ? setHash(ids, ttl.value.trim()) : '#/unlimited'; tryIt.setAttribute('aria-disabled', String(!ids.length)); };
      wirePicker(pick, v => { ids = v; upd2(); });
      ttl.addEventListener('input', upd2);
      copyB.addEventListener('click', () => {
        const url = classLink('go', ttl.value.trim() || 'Practice set', { to: setHash(ids, ttl.value.trim()) }, life()); FAMILY._assign = url;
        copy(url, `Link copied: practice on ${ids.length > 40 ? 40 : ids.length} skills.`);
      });
      keyB.addEventListener('click', () => answerKey(root, ids.slice(0, 40), ttl.value.trim()));
    }
    root.querySelector('#fa-copy').addEventListener('click', () => {
      const url = classLink('go', title(), { to: hash() }, life()); FAMILY._assign = url;
      copy(url, 'Practice link copied. Share it with the class.');
    });
    wirePlan(root);
  }
  /** a printable set of the chosen skills with its answer key on a page of its own (the worksheet page) */
  function answerKey(root, ids, title) {
    if (!window.WORKSHEET || !ids.length) return;
    const n = Math.min(20, Math.max(10, ids.length * 2)), seed = Math.random().toString(36).slice(2, 7);
    const items = WORKSHEET.build({ skills: ids }, n, seed);
    WORKSHEET.sheet(root, { title: title || 'Practice set', sub: `${H.plural(ids.length, 'skill')} · set ${seed}`, items, back: '#/family', backLabel: 'Family and class' });
    const back = root.querySelector('.ws-controls a.btn');
    if (back) back.addEventListener('click', ev => { ev.preventDefault(); page(root); window.scrollTo(0, 0); });
    FAMILY._sheet = { ids, n: items.length };
  }

  /* ---------- a plan of class practice by week: a unit a week, as one link that opens on this week ---------- */
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  function planHtml() {
    const p = famGet().plan || {}, c0 = A.courseById(p.c) || A.courses.find(c => c.id === 'math-7') || A.courses[0], mon = mondayOf(S.today());
    return `<details class="fam-plan"><summary><b>Plan practice by week</b> <span class="small muted">a unit a week, in one link</span></summary>
      <div class="fam-pick"><label class="field"><span class="label">Course</span><select id="fp-course">${A.courses.map(c => `<option value="${c.id}" ${c === c0 ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>
        <label class="field"><span class="label">First week</span><select id="fp-start">${[0, 1, 2, 3].map(k => { const d = S.dayShift(mon, 7 * k); return `<option value="${d}" ${d === p.start ? 'selected' : ''}>${k ? 'Week of' : 'This week,'} ${shortDate(d)}</option>`; }).join('')}</select></label>
        <label class="field"><span class="label">Weeks</span><select id="fp-n">${[2, 3, 4, 5, 6, 8, 10, 12].map(n => `<option ${n === (p.n || 4) ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <ol class="fam-plan-weeks" id="fp-weeks"></ol>
      <label class="field"><span class="label">A name for the plan</span><input id="fp-title" maxlength="60" value="${esc(p.title || '')}" placeholder="For example: Period 3, second quarter"></label>
      <div class="btn-row" style="margin-top:0"><button class="btn primary sm" type="button" id="fp-copy">Copy the plan link</button><button class="btn sm" type="button" id="fp-text">Copy as a list of links</button></div>
      <p class="tiny muted" style="margin:0">The plan link opens on the current week, with every week listed. Each week practices a whole unit, with questions that never run out.</p></details>`;
  }
  function wirePlan(root) {
    const cs = root.querySelector('#fp-course'); if (!cs) return;
    const start = root.querySelector('#fp-start'), n = root.querySelector('#fp-n'), box = root.querySelector('#fp-weeks'), ttl = root.querySelector('#fp-title');
    let units = (famGet().plan || {}).units || [];
    const draw = () => {
      const c = A.courseById(cs.value), us = c.units.filter(u => u.skills.some(id => A.skills[id]));
      const k0 = Math.max(0, us.findIndex(u => u.id === units[0]));
      units = Array.from({ length: Number(n.value) }, (x, k) => (us.some(u => u.id === units[k]) ? units[k] : (us[Math.min(us.length - 1, k0 + k)] || us[0]).id));
      box.innerHTML = units.map((uid, k) => `<li><span class="fam-plan-wk">${shortDate(S.dayShift(start.value, 7 * k))}</span><label class="visually-hidden" for="fp-u${k}">Unit for week ${k + 1}</label><select id="fp-u${k}" data-pw="${k}">${us.map(u => `<option value="${u.id}" ${u.id === uid ? 'selected' : ''}>Unit ${c.units.indexOf(u) + 1}: ${esc(u.title)}</option>`).join('')}</select></li>`).join('');
      box.querySelectorAll('[data-pw]').forEach(s => s.addEventListener('change', () => { units[Number(s.dataset.pw)] = s.value; save(); }));
      save();
    };
    const save = () => famSet({ plan: { c: cs.value, start: start.value, n: Number(n.value), units: units.slice(), title: ttl.value.trim() } });
    cs.addEventListener('change', () => { units = []; draw(); }); start.addEventListener('change', draw); n.addEventListener('change', draw); ttl.addEventListener('input', save);
    draw();
    const body = () => ({ c: cs.value, weeks: units.map((u, k) => ({ mon: S.dayShift(start.value, 7 * k), u })) });
    root.querySelector('#fp-copy').addEventListener('click', () => { const url = classLink('plan', ttl.value.trim() || 'Practice plan', body(), life() || Number(n.value) * 7 + 7); FAMILY._plan = url; copy(url, 'Plan link copied. Share it with the class.'); });
    root.querySelector('#fp-text').addEventListener('click', () => {
      const c = A.courseById(cs.value), lines = [`${ttl.value.trim() || 'Practice plan'}: ${c.title}`].concat(body().weeks.map(w => `Week of ${shortDate(w.mon)}: ${A.unitById(c.id, w.u).title}. ${siteBase()}#/unlimited/unit/${c.id}/${w.u}`));
      FAMILY._planText = lines.join('\n'); copy(FAMILY._planText, 'The plan was copied as a list of links.');
    });
  }

  /* ---------- class standings: by nickname, only for learners who opted in on their progress link ---------- */
  const BY = [['q', 'Questions this week'], ['days', 'Days practiced this week'], ['min', 'Minutes this week'], ['streak', 'Day streak'], ['m', 'Skills mastered']];
  const standRows = list => list.filter(x => x.rank === 1 && x.nick).slice(0, 60).map(x => ({ n: x.nick, q: x.week.q, days: x.week.days, min: x.min || 0, streak: x.streak, m: x.counts[3] }));
  const ranked = (rows, by) => rows.slice().sort((a, b) => (b[by] || 0) - (a[by] || 0) || a.n.localeCompare(b.n));
  const standList = (rows, by) => `<ol class="fam-st-list">${ranked(rows, by).map((r, k, all) => { const place = all.findIndex(x => (x[by] || 0) === (r[by] || 0)) + 1; return `<li><span class="fam-st-n">${place}</span><b data-raw>${esc(r.n)}</b><span class="fam-st-v">${r[by] || 0}</span></li>`; }).join('')}</ol>`;
  function standingsCard(away) {
    const rows = standRows(away);
    if (!away.length) return '';
    if (!rows.length) return `<p class="small muted fam-st-none">Class standings appear here once students choose to join them, with a nickname, when they copy their progress link.</p>`;
    return `<div class="section-title"><h2>Class standings</h2><span class="small muted">nicknames only, for ${H.plural(rows.length, 'student')} who joined</span></div>
      <div class="card fam-standings"><div class="row between fam-st-top"><label class="small">Rank by <select id="fam-st-by">${BY.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
        <div class="btn-row" style="margin:0">${lifeSelect('fam-st-life')}<button type="button" class="btn sm primary" id="fam-st-copy">Copy the standings link</button></div></div>
        <div id="fam-st-box">${standList(rows, 'q')}</div>
        <p class="tiny muted" style="margin:10px 0 0">The link shows the class only nicknames and numbers, as they are now. Make a fresh link to update it.</p></div>`;
  }
  function wireStandings(root, away) {
    const by = root.querySelector('#fam-st-by'); if (!by) return;
    const rows = standRows(away);
    by.addEventListener('change', () => { root.querySelector('#fam-st-box').innerHTML = standList(rows, by.value); });
    const ls = root.querySelector('#fam-st-life'); if (ls) ls.addEventListener('change', () => famSet({ life: Number(ls.value) }));
    root.querySelector('#fam-st-copy').addEventListener('click', () => { const url = classLink('st', 'Class standings', { rows }, life() || 14); FAMILY._standings = url; copy(url, 'Standings link copied. Share it with the class.'); });
  }

  /* ---------- for a parent: plain words, next steps, how to help at home ---------- */
  const SLIP_WORDS = { sign: 'sign slips', flip: 'flipped fractions', place: 'decimal point slips', percent: 'percent and decimal mix-ups', early: 'stopping a step early', echo: 'answering with a given number', digits: 'swapped digits', round: 'rounding', one: 'off-by-one slips', op: 'choosing the wrong operation' };
  const TIPS = {
    number: ['Play a quick game with two dice or a deck of cards: add, subtract or multiply the numbers that come up.', 'Ask for an estimate first, then the exact answer, and talk about how close the estimate was.'],
    fractions: ['Cook or bake together and ask fraction questions, like how many quarter cups make three quarters of a cup.', 'Cut a pizza, a sandwich or a sheet of paper into equal parts and name the fractions.'],
    ratio: ['At the store, compare unit prices together: which size is the better buy?', 'Work out a tip, a sale price or sales tax together, in your heads first.'],
    algebra: ['Ask them to say each step out loud, and why it keeps the equation balanced.', 'Trade number puzzles: “I’m thinking of a number. Double it and add 3 and you get 11. What is it?”'],
    functions: ['Find a graph in the news or a weather app and ask what it shows, and what its steepness means in words.', 'Make a table for something real, like savings each week, and sketch its graph together.'],
    geometry: ['Measure a room, a rug or a garden together and work out its area and perimeter.', 'Spot shapes and angles around the house and estimate their sizes before measuring.'],
    measure: ['Use a measuring tape, a kitchen scale or a recipe together, and convert between units.', 'Let them count out the money and the change when you pay with cash.'],
    data: ['Roll a die 30 times, keep a tally, and talk about what you expected to happen.', 'Look at sports scores or weather data together and find the mean and the median.'],
    calculus: ['Ask them to explain the idea in words with a real example, like speed and distance, before any symbols.', 'Encourage one problem done carefully over five done quickly.'],
    logic: ['Ask them to trace a short program or a logic puzzle step by step, out loud.', 'Play a strategy game together and talk through the reasoning behind each move.'],
  };
  const ALWAYS = 'Ask them to teach you one problem from today. Explaining it is some of the best practice there is.';
  /** a few tips for helping at home with these skills (one per area, the first areas first) */
  function helpTips(ids, n) {
    const out = [], seen = new Set();
    (ids || []).filter(id => A.skills[id]).forEach(id => { const a = R() ? R().areaOf(id) : 'other'; if (!seen.has(a) && TIPS[a]) { seen.add(a); out.push(TIPS[a][out.length % 2]); } });
    return out.slice(0, Math.max(1, (n || 3) - 1)).concat(ALWAYS).slice(0, n || 3);
  }
  const rightWord = pct => (pct >= 90 ? 'almost all' : pct >= 75 ? 'most' : pct >= 55 ? 'more than half' : pct >= 40 ? 'about half' : 'fewer than half');
  /** a learner's week in plain words */
  function plainWords(sum) {
    const n = sum.name || 'This learner', pct = sum.week.q ? Math.round(sum.week.right / sum.week.q * 100) : 0;
    if (!sum.week.q) return `${esc(n)} hasn’t practiced yet${sum.last ? ` (last time: ${esc(shortDate(sum.last))})` : ''}. A few minutes today is a good restart.`;
    const ups = (sum.ups || []).map(id => A.skills[id].title);
    return `${esc(n)} practiced on ${H.plural(sum.week.days, 'day')}: ${H.plural(sum.week.q, 'question')}, ${rightWord(pct)} of them right the first time${sum.min ? `, in about ${H.plural(sum.min, 'minute')}` : ''}.${ups.length ? ` Getting better at ${ups.join(', ')}.` : ''}${sum.streak >= 3 ? ` That’s ${sum.streak} days in a row.` : ''}`;
  }
  /** what a parent could do next, most useful first (with a button where one helps) */
  function nextSteps(sum, local) {
    const out = [], n = sum.name || 'them', nx = sum.next[0];
    if (sum.help) out.push({ text: `Talk about the note asking for help${sum.help.skill ? ` with ${H.plain(A.skills[sum.help.skill].title)}` : ''}.` });
    if (nx) out.push({ text: `Suggest ten minutes on ${H.plain(A.skills[nx].title)}.`, act: local ? `<button type="button" class="btn sm" data-fam-quick="${esc(JSON.stringify([local, nx]))}">Assign it</button>` : '' });
    if (sum.slips.length) out.push({ text: `Watch for ${SLIP_WORDS[sum.slips[0]]}: ${(window.COACH && COACH.TIPS && COACH.TIPS[sum.slips[0]]) || 'slow down on that step and check it.'}` });
    if (sum.week.days < 3) out.push({ text: `Agree on a regular time with ${esc(n)}: short and often works best.` });
    else out.push({ text: `Celebrate the effort: ${H.plural(sum.week.days, 'day')} of practice this week.` });
    return out.slice(0, 3);
  }

  /** one learner's card */
  function card(sum, opts) {
    const pct = sum.week.q ? Math.round(sum.week.right / sum.week.q * 100) : 0;
    const grade = sum.grade == null ? '' : sum.grade === 0 ? 'Kindergarten' : `Grade ${sum.grade}`;
    const st = opts.st, p = st ? st.profile || {} : {}, local = opts.local;
    const av = opts.avatar ? `<span class="avatar fam-av" style="--av:${Number(opts.avatar.hue) || 215}" aria-hidden="true">${esc((Array.from((sum.name || '?').trim())[0] || '?').toUpperCase())}</span>` : '';
    const steps = nextSteps(sum, local);
    const tips = helpTips((sum.help && sum.help.skill ? [sum.help.skill] : []).concat(sum.next, sum.ups || []), 3);
    const flags = st ? (Array.isArray(p.flagged) ? p.flagged : []).filter(f => f && A.skills[f.skill]) : [];
    const tests = st ? (Array.isArray(p.tests) ? p.tests : []).filter(t => t && t.date >= S.today()).sort((a, b) => (a.date < b.date ? -1 : 1)) : [];
    const tutor = st && R() ? R().tutorUse(opts.chats, Date.now() - 7 * DAY) : null;
    const controls = st ? [p.limit ? `Time limit: ${p.limit} minutes a day` : '', p.tutorOff ? 'Tutor off' : '', p.chatTitlesShared ? 'Chat titles shown here' : ''].filter(Boolean) : [];
    const help = st ? (p.helpNote && p.helpNote.text ? p.helpNote : null) : sum.help ? Object.assign({ seen: false }, sum.help) : null;
    return `<div class="card fam-card"><div class="row between fam-card-top"><div class="fam-who">${av}<h3 style="margin:0" data-raw>${esc(sum.name || 'A learner')}</h3></div><span class="small muted">${[grade, opts.where].filter(Boolean).map(esc).join(' · ')}</span></div>
      ${help && !help.seen ? `<div class="fam-helpnote"><p><b>Asked for help${help.skill && A.skills[help.skill] ? ` with <a href="${H.skillHref(help.skill)}">${A.skills[help.skill].title}</a>` : ''}:</b> <span data-raw>“${esc(help.text)}”</span></p>${local ? `<div class="btn-row" style="margin:0"><button type="button" class="btn sm primary" data-fam-reply="${esc(local)}">Reply</button><button type="button" class="btn sm" data-fam-seen="${esc(local)}">Mark as read</button></div>` : ''}</div>` : ''}
      <div class="fam-stats"><span><b>${sum.streak}</b> day streak</span><span><b>${sum.week.days}</b> of 7 days this week</span><span><b>${sum.week.q}</b> questions${sum.week.q ? `, ${pct}% right` : ''}</span>${sum.min != null ? `<span><b>${sum.min}</b> min this week</span>` : ''}<span><b>${sum.counts[3]}</b> mastered · <b>${sum.counts[2]}</b> proficient</span></div>
      ${sum.courses.length ? `<ul class="fam-courses">${sum.courses.map(c => `<li><span>${esc(A.courseById(c.id).title)}</span><span class="pbar" role="img" aria-label="${c.pct}% mastered"><span style="width:${c.pct}%"></span></span><span class="small muted">${c.pct}%</span></li>`).join('')}</ul>` : ''}
      ${sum.w7 ? `<ol class="fam-week" aria-label="This week, Monday to Sunday">${sum.w7.map((x, k) => `<li class="${x ? 'did' : ''}${k === todayIdx() ? ' today' : ''}" title="${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][k]}: ${x ? 'practiced' : 'no practice'}"><span>${'MTWTFSS'[k]}</span><i aria-hidden="true"></i></li>`).join('')}</ol>` : ''}
      ${sum.goal ? `<div class="fam-goal"><span class="small"><b>Today: ${sum.today || 0} of ${sum.goal}</b> questions${(sum.today || 0) >= sum.goal ? ' · goal met' : ''}${sum.gm != null ? ` · met on ${sum.gm} ${sum.gm === 1 ? 'day' : 'days'} this week` : ''}</span><span class="pbar" role="img" aria-label="${Math.min(100, Math.round((sum.today || 0) / sum.goal * 100))}% of today’s goal"><span style="width:${Math.min(100, Math.round((sum.today || 0) / sum.goal * 100))}%"></span></span>${opts.goalFor ? `<label class="small fam-goal-set">Daily goal <select data-fam-goal="${esc(opts.goalFor)}">${[10, 20, 30, 50].map(n => `<option value="${n}" ${n === sum.goal ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}</div>` : ''}
      <p class="small fam-high"><b>This week:</b> ${plainWords(sum)}</p>
      ${(() => { const id = (sum.ups && sum.ups[0]) || sum.next[0]; return id ? `<p class="small fam-ask"><b>Ask about it:</b> “Can you show me how ${esc(H.plain(A.skills[id].title).toLowerCase())} works, with an example?”</p>` : ''; })()}
      ${steps.length ? `<div class="fam-next"><b class="small">Next steps</b><ol class="fam-steps">${steps.map(x => `<li><span>${x.text}</span>${x.act || ''}</li>`).join('')}</ol></div>` : ''}
      ${sum.next.length ? `<p class="small" style="margin:8px 0 0"><b>Next to practice:</b> ${sum.next.map(id => `<a href="${H.skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}</p>` : ''}
      ${sum.slips.length ? `<p class="small muted" style="margin:4px 0 0">Watch for ${sum.slips.map(k => SLIP_WORDS[k]).join(' and ')}.</p>` : ''}
      <details class="fam-more fam-tips"><summary>How to help at home</summary><ul>${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></details>
      ${tests.length ? `<div class="fam-more"><b class="small">Tests coming up</b><ul class="fam-tests">${tests.map(t => `<li><span><b data-raw>${esc(t.name)}</b> <span class="small muted">${esc(shortDate(t.date))}${t.ids && t.ids.length && R() ? ` · ${R().plannedReady(st, t)}% ready` : ''}</span></span><span class="btn-row" style="margin:0"><button type="button" class="btn sm ghost" data-fam-ics="${esc(JSON.stringify([local, t.id]))}">Add to calendar</button><button type="button" class="btn sm ghost" data-fam-test-del="${esc(JSON.stringify([local, t.id]))}">Remove</button></span></li>`).join('')}</ul></div>` : ''}
      ${flags.length ? `<details class="fam-more fam-flags"><summary>Questions they flagged (${flags.length})</summary><ul>${flags.map(f => `<li><span><span data-raw>${esc(R() ? R().flaggedText(f) : H.plain(A.skills[f.skill].title))}</span> <span class="small muted">${esc(R() ? R().FLAG_WHY[f.why] || R().FLAG_WHY.confusing : '')}${f.note ? `: “${esc(f.note)}”` : ''} · <a href="${H.skillHref(f.skill)}">${A.skills[f.skill].title}</a></span></span><button type="button" class="btn sm ghost" data-fam-unflag="${esc(JSON.stringify([local, f.skill, f.seed]))}">Clear</button></li>`).join('')}</ul>${flags.length > 1 ? `<button type="button" class="btn sm ghost" data-fam-unflag-all="${esc(local)}">Clear them all</button>` : ''}</details>` : ''}
      ${tutor ? `<p class="small muted fam-tutor">Tutor: ${p.tutorOff ? 'turned off by a parent.' : tutor.chats ? `${H.plural(tutor.asked, 'question')} in ${H.plural(tutor.chats, 'chat')} this week.` : 'no questions this week.'}</p>${p.chatTitlesShared && tutor.titles.length ? `<details class="fam-more"><summary>Tutor chat titles</summary><ul class="fam-titles">${tutor.titles.map(c => `<li><span data-raw>${esc(c.title)}</span> <span class="small muted">${new Date(c.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></li>`).join('')}</ul><p class="tiny muted" style="margin:0">Only the titles. What was said stays private.</p></details>` : ''}` : ''}
      ${local ? `<div class="btn-row fam-acts"><button class="btn sm" type="button" data-fam-note="${esc(local)}">${opts.note ? 'Change the note' : 'Leave a note'}</button><button class="btn sm" type="button" data-fam-assign="${esc(local)}">Assign practice</button><button class="btn sm" type="button" data-fam-test="${esc(local)}">Add a test</button><button class="btn sm" type="button" data-fam-ctl="${esc(local)}">Parent controls</button>${opts.switchTo ? `<button class="btn sm ghost" type="button" data-fam-switch="${esc(local)}">Switch to ${esc(sum.name || 'them')}</button>` : ''}</div>
        ${controls.length ? `<p class="small muted fam-ctl-now">${esc(controls.join(' · '))}</p>` : ''}
        ${opts.note ? `<p class="small muted fam-note-was">Your note: “${esc(opts.note.text)}”${opts.note.reply ? ` · they replied: “${esc(opts.note.reply.text || '')}”` : opts.note.seen ? ' · read' : ' · not read yet'}</p>` : ''}
        ${opts.assigned && opts.assigned.length ? `<ul class="fam-assigned">${opts.assigned.map(a => `<li><span>${esc(a.title)}</span><span class="small muted">${a.done ? 'done' : `${a.got} of ${a.ids.length} skills practiced`}</span></li>`).join('')}</ul>` : ''}
        <div class="fam-panel" data-fam-panel="${esc(local)}"></div>` : ''}
      ${opts.extra || ''}</div>`;
  }

  /* ---------- for a parent: a note on a learner's Home, practice assigned to them, tests, controls ---------- */
  /** practice assigned to a learner, each with how many of its skills were practiced since */
  function assignedOf(st) {
    return ((st.profile || {}).assigned || []).filter(a => a && Array.isArray(a.ids)).map(a => {
      const got = a.ids.filter(id => (((st.skills || {})[id] || {}).last || 0) > a.t).length;
      return Object.assign({}, a, { got, done: got >= a.ids.length });
    });
  }
  /** the skill picker: a course, then the skills of its units to tick (used for class links, assignments and tests) */
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
  const LIMITS = [[0, 'No limit'], [15, '15 minutes'], [20, '20 minutes'], [30, '30 minutes'], [45, '45 minutes'], [60, '1 hour'], [90, '1 hour 30 minutes']];
  /** a note, an assignment, a test or the parent controls for one learner on this device, in a small panel under their card */
  function panel(root, id, kind, preset) {
    const box = root.querySelector(`[data-fam-panel="${CSS.escape(id)}"]`);
    if (!box) return;
    const st = LEARNERS.stateOf(id) || { profile: {} }, p = st.profile || {};
    if (kind === 'note') {
      box.innerHTML = `<form class="fam-form"><label class="field"><span class="label">${preset ? 'Your reply, for their Home page' : 'A note for their Home page'}</span><textarea rows="2" maxlength="200" class="fn-text" placeholder="For example: Great work this week. Try ten minutes before dinner."></textarea></label>
        <label class="field"><span class="label">From</span><input class="fn-by" maxlength="24" placeholder="Mom, Dad, Ms. Lee…"></label>
        <div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Save the note</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button></div></form>`;
    } else if (kind === 'assign') {
      box.innerHTML = `<form class="fam-form"><label class="field"><span class="label">A name for it</span><input class="fa-title" maxlength="60" placeholder="For example: Fractions before Friday"></label>
        ${pickerHtml('as')}<div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Assign it</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button></div></form>`;
    } else if (kind === 'test') {
      box.innerHTML = `<form class="fam-form"><div class="fam-pick"><label class="field"><span class="label">The test</span><input class="ft-name" maxlength="60" placeholder="For example: Chapter 4 test"></label>
          <label class="field"><span class="label">Date</span><input class="ft-date" type="date" min="${S.today()}" value="${S.dayShift(S.today(), 7)}"></label>
          <label class="field"><span class="label">From</span><input class="ft-by" maxlength="24" placeholder="Mom, Dad, Ms. Lee…"></label></div>
        <p class="small muted" style="margin:0 0 6px">What it covers (optional): their Progress page then shows how ready they are, and practice for it.</p>
        ${pickerHtml('ft')}<div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Add the test</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button></div></form>`;
    } else {
      box.innerHTML = `<form class="fam-form fam-controls"><p class="small muted" style="margin:0">These stay on this device and in ${esc(p.name || 'this learner')}’s own profile. ${esc(p.name || 'The learner')} sees a note about them on Progress.</p>
        <label class="field"><span class="label">Daily time limit</span><select class="fc-limit">${LIMITS.map(([n, l]) => `<option value="${n}" ${n === (Number(p.limit) || 0) ? 'selected' : ''}>${l}</option>`).join('')}</select><span class="small muted">After this much practice in a day, a friendly note suggests a break. Nothing is locked.</span></label>
        <label class="set-row"><span class="set-text"><span class="set-label">The tutor</span><span class="set-help">When it’s off, the tutor’s button, page and Explain buttons are hidden for ${esc(p.name || 'this learner')} on this device. Hints and lessons still work.</span></span><input type="checkbox" class="switch fc-tutor" ${p.tutorOff ? '' : 'checked'} aria-label="The tutor is on"></label>
        <label class="set-row"><span class="set-text"><span class="set-label">Show tutor chat titles here</span><span class="set-help">Only the titles of their chats, never what was said.</span></span><input type="checkbox" class="switch fc-titles" ${p.chatTitlesShared ? 'checked' : ''} aria-label="Show tutor chat titles"></label>
        <div class="btn-row" style="margin-top:0"><button class="btn sm primary" type="submit">Save</button><button class="btn sm ghost" type="button" data-fam-cancel>Cancel</button></div></form>`;
    }
    const f = box.querySelector('form');
    let ids = [];
    const pk = f.querySelector('.fam-picker');
    if (pk) wirePicker(pk, v => { ids = v; });
    f.querySelector('[data-fam-cancel]').addEventListener('click', () => { box.innerHTML = ''; });
    (f.querySelector('textarea, input, select')).focus();
    f.addEventListener('submit', ev => {
      ev.preventDefault();
      if (kind === 'note') {
        const text = f.querySelector('.fn-text').value.trim(), by = f.querySelector('.fn-by').value.trim();
        if (!text) { f.querySelector('.fn-text').focus(); return; }
        LEARNERS.patch(id, q => Object.assign({ parentNote: { text: text.slice(0, 200), by: by.slice(0, 24), t: Date.now(), seen: false } }, preset && q.helpNote ? { helpNote: Object.assign({}, q.helpNote, { seen: true, reply: { text: text.slice(0, 200), t: Date.now() } }) } : {}));
        V.toast('The note will show on their Home page.');
      } else if (kind === 'assign') {
        if (!ids.length) { V.toast('Choose at least one skill.'); return; }
        const title = f.querySelector('.fa-title').value.trim() || 'Practice from a parent';
        LEARNERS.patch(id, q => ({ assigned: [{ id: Date.now().toString(36), title: title.slice(0, 60), ids: ids.slice(0, 40), t: Date.now() }].concat(q.assigned || []).slice(0, 5) }));
        V.toast('Assigned. It shows on their Home page.');
      } else if (kind === 'test') {
        const name = f.querySelector('.ft-name').value.trim(), date = f.querySelector('.ft-date').value, by = f.querySelector('.ft-by').value.trim();
        if (!name) { f.querySelector('.ft-name').focus(); return; }
        if (!/^\d{4}-\d\d-\d\d$/.test(date) || date < S.today()) { V.toast('Choose a date from today on.'); f.querySelector('.ft-date').focus(); return; }
        LEARNERS.patch(id, q => ({ tests: [{ id: Date.now().toString(36), name: name.slice(0, 60), date, ids: ids.slice(0, 40), by: by.slice(0, 24), t: Date.now() }].concat((q.tests || []).filter(t => t && t.date >= S.today())).slice(0, 8) }));
        V.toast('The test is on their calendar. Progress shows how ready they are.');
      } else {
        const limit = Number(f.querySelector('.fc-limit').value) || null;
        LEARNERS.patch(id, () => ({ limit, tutorOff: !f.querySelector('.fc-tutor').checked, chatTitlesShared: f.querySelector('.fc-titles').checked }));
        gate(); V.toast('Parent controls saved.');
      }
      page(root);
    });
  }
  /** a test as a calendar file (an all-day event, with a reminder the day before) */
  function testIcs(name, date, who) {
    const d = date.replace(/-/g, ''), e = S.dayShift(date, 1).replace(/-/g, ''), stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const safe = s => String(s).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, ' ');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Tests//EN', 'BEGIN:VEVENT', `UID:${d}-${Math.random().toString(36).slice(2, 10)}@procademy`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${e}`, `SUMMARY:${safe(`${who ? who + ': ' : ''}${name}`)}`, `DESCRIPTION:${safe('Practice for it on Procademy: ' + siteBase() + '#/progress')}`, 'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${safe(name + ' tomorrow')}`, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    FAMILY._download = { name, text };
  }

  /** everyone side by side: on this device and shared with you */
  function compare(rows) {
    if (rows.length < 2) return '';
    return `<div class="card fam-compare"><div class="mtable-wrap"><table class="plain fam-table"><caption class="visually-hidden">Everyone this week</caption><thead><tr><th>Learner</th><th>Days</th><th>Questions</th><th>Right</th><th>Minutes</th><th>Goal met</th><th>Streak</th><th>Mastered</th></tr></thead>
        <tbody>${rows.map(r => `<tr><td data-raw>${esc(r.name || 'A learner')}${r.where ? `<span class="small muted"> · ${esc(r.where)}</span>` : ''}</td><td>${r.week.days} of 7</td><td>${r.week.q}</td><td>${r.week.q ? Math.round(r.week.right / r.week.q * 100) + '%' : '–'}</td><td>${r.min == null ? '–' : r.min}</td><td>${r.gm == null ? '–' : r.gm + ' days'}</td><td>${r.streak}</td><td>${r.counts[3]}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  /** a teacher's class: paste several progress links at once */
  function pasteCard() {
    return `<details class="card fam-tool fam-paste"><summary><b>Add several at once</b> <span class="small muted">paste the progress links students sent</span></summary><p class="small muted" style="margin:0 0 8px">Paste them one per line or all together. Each one is checked and kept on this device only.</p>
      <label class="visually-hidden" for="fam-links">Progress links</label><textarea id="fam-links" rows="3" placeholder="https://…#/family/add/…"></textarea>
      <div class="btn-row" style="margin-top:8px"><button class="btn sm primary" type="button" id="fam-paste-go">Add them</button></div></details>`;
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

  /* ---------- the family goal: minutes practiced together this week ---------- */
  const GOALS = [0, 60, 90, 120, 180, 240, 300, 420];
  const famGoal = () => { const g = famGet().goal; const n = g && Number(g.min); return GOALS.includes(n) ? n : 0; };
  const herePeople = () => (window.LEARNERS ? LEARNERS.list().map(l => ({ l, st: LEARNERS.stateOf(l.id) })).filter(x => x.st) : [{ l: { id: 'me', name: S.get().profile.name, avatar: S.get().profile.avatar }, st: S.get() }]);
  function together(here) { const parts = here.map(({ l, st }) => ({ name: (st.profile || {}).name || l.name || 'A learner', min: summarize(st, l.name).min || 0 })); return { parts, total: parts.reduce((a, p) => a + p.min, 0) }; }
  function goalCard(here) {
    const g = famGoal(), { parts, total } = together(here), max = Math.max(g, total, 1);
    return `<div class="card fam-goal-card"><div class="row between fam-goal-top"><div><b>Family goal</b> <span class="small muted">minutes practiced together this week, Monday to Sunday</span></div><label class="small">Goal <select id="fam-fgoal">${GOALS.map(n => `<option value="${n}" ${n === g ? 'selected' : ''}>${n ? n + ' minutes' : 'Off'}</option>`).join('')}</select></label></div>
      ${g ? `<p class="fam-goal-now"><b>${total} of ${g} minutes</b>${total >= g ? ' · goal reached. Well done, everyone!' : ` · ${g - total} to go`}</p>
        <div class="fam-stack" role="img" aria-label="${esc(parts.map(p => `${p.name}: ${p.min} minutes`).join('; '))}">${parts.map((p, k) => `<span class="fs${k % 4}" style="width:${(p.min / max * 100).toFixed(2)}%"></span>`).join('')}${g > total ? `<i class="fam-stack-goal" style="left:${(g / max * 100).toFixed(2)}%"></i>` : ''}</div>
        <ul class="fam-stack-key">${parts.map((p, k) => `<li><i class="fs${k % 4}" aria-hidden="true"></i><span data-raw>${esc(p.name)}</span> <span class="muted">${p.min} min</span></li>`).join('')}</ul>`
        : '<p class="small muted" style="margin:6px 0 0">Choose a weekly goal for the minutes everyone practices together. Each learner sees it on their Progress page.</p>'}</div>`;
  }
  /** the family goal on a learner's Progress page (when there is a goal and more than one learner here) */
  function goalLine() {
    const g = famGoal();
    if (!g || !window.LEARNERS || LEARNERS.count() < 2) return '';
    const { total } = together(herePeople());
    return `<p class="small pr-family"><b>Family goal:</b> ${total} of ${g} minutes together this week${total >= g ? ' · reached. Well done, everyone!' : ''}</p>`;
  }

  /* ---------- several parents, one family view: a link with everyone on this device ---------- */
  function familyLink() {
    const list = herePeople().map(({ l, st }) => {
      let id = shareIdOf(st.profile);
      if (!id) { id = newShareId(); if (window.LEARNERS && l.id !== 'me') LEARNERS.patch(l.id, () => ({ shareId: id })); else S.setProfile({ shareId: id }); }
      return Object.assign(summarize(st, l.name), { id });
    }).slice(0, 8);
    return siteBase() + '#/family/add/' + code({ v: 1, k: 'fam', t: Date.now(), list });
  }

  /* ---------- a poster of everyone's week, to print ---------- */
  function poster(root) {
    const here = herePeople(), people = here.map(({ l, st }) => Object.assign(summarize(st, l.name), { hue: ((st.profile || {}).avatar || l.avatar || {}).hue })).concat(shared());
    const g = famGoal(), { total } = together(here), mon = mondayOf(S.today());
    root.innerHTML = `<div class="ws-controls card tight"><div class="row between" style="flex-wrap:wrap;gap:10px"><div><button type="button" class="btn sm ghost" id="fpo-back">← Family and class</button> <b style="margin-left:6px">Family poster</b></div>
        <div class="btn-row" style="margin:0"><button type="button" class="btn sm primary" id="fpo-print">Print the poster</button></div></div>
        <p class="tiny muted" style="margin:8px 0 0">Everyone’s week on one page, for the fridge. It prints in color when the printer can.</p></div>
      <article class="ws-sheet fam-poster"><header class="ws-head"><div><div class="ws-brand">Procademy</div><h1>Our practice this week</h1><p>Week of ${esc(new Date(mon + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))}</p></div>
        ${g ? `<div class="rp-streak"><b>${total} / ${g}</b><span>minutes together</span></div>` : ''}</header>
        <div class="fpo-grid">${people.map(p => `<section class="fpo-tile"><div class="fpo-top"><span class="fpo-av" style="--av:${Number(p.hue) || 215}" aria-hidden="true">${esc((Array.from((p.name || '?').trim())[0] || '?').toUpperCase())}</span><div><h2 data-raw>${esc(p.name || 'A learner')}</h2>${p.grade != null ? `<p>${p.grade === 0 ? 'Kindergarten' : 'Grade ' + p.grade}</p>` : ''}</div></div>
          <div class="fpo-big"><div><b>${p.streak}</b><span>day streak</span></div><div><b>${p.week.days}</b><span>days this week</span></div><div><b>${p.week.q}</b><span>questions</span></div></div>
          ${p.w7 ? `<ol class="fpo-week">${p.w7.map((x, k) => `<li class="${x ? 'did' : ''}"><i></i><span>${'MTWTFSS'[k]}</span></li>`).join('')}</ol>` : ''}
          <p>${p.ups && p.ups.length ? `Got better at ${p.ups.map(id => esc(H.plain(A.skills[id].title))).join(', ')}.` : p.week.q ? 'Kept practicing all week.' : 'A fresh start this week.'}</p>
          <p class="fpo-m">${H.plural(p.counts[3], 'skill')} mastered so far</p></section>`).join('')}</div>
        <footer class="ws-foot">Keep going, everyone. Made with Procademy on ${esc(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))}.</footer></article>`;
    root.querySelector('#fpo-back').addEventListener('click', () => { page(root); window.scrollTo(0, 0); });
    root.querySelector('#fpo-print').addEventListener('click', () => window.print());
    window.scrollTo(0, 0);
  }

  /* ---------- every learner's data on this device, in one file (and a spreadsheet of this week) ---------- */
  function exportAll() {
    const own = id => { const out = {}; if (!window.LEARNERS) return out; (LEARNERS.OWN || []).forEach(k => { const v = LEARNERS.own(id, k); if (v != null) out[k] = v; }); return out; };
    const here = herePeople();
    return JSON.stringify({ app: 'procademy-family', v: 1, exported: new Date().toISOString(),
      learners: here.map(({ l, st }) => ({ id: l.id, name: (st.profile || {}).name || l.name || '', avatar: l.avatar || null, active: !window.LEARNERS || l.id === LEARNERS.active(), data: JSON.parse(JSON.stringify(st)), own: own(l.id) })),
      shared: shared(), family: { goal: famGoal(), links: links().map(x => ({ kind: x.kind, title: x.title, url: x.url, made: new Date(x.t).toISOString(), expires: x.exp ? new Date(x.exp).toISOString() : null })) } }, null, 2);
  }
  function exportCsv() {
    const cell = v => { const t = String(v == null ? '' : v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const rows = [['Learner', 'Where', 'Grade', 'Days this week', 'Questions this week', 'Right the first time (%)', 'Minutes this week', 'Day streak', 'Mastered', 'Proficient', 'Last practiced']];
    herePeople().forEach(({ l, st }) => { const s = summarize(st, l.name); rows.push([s.name, 'This device', s.grade == null ? '' : s.grade, s.week.days, s.week.q, s.week.q ? Math.round(s.week.right / s.week.q * 100) : '', s.min, s.streak, s.counts[3], s.counts[2], s.last || '']); });
    shared().forEach(s => rows.push([s.name, 'Shared ' + new Date(s.t).toISOString().slice(0, 10), s.grade == null ? '' : s.grade, s.week.days, s.week.q, s.week.q ? Math.round(s.week.right / s.week.q * 100) : '', s.min == null ? '' : s.min, s.streak, s.counts[3], s.counts[2], s.last || '']));
    return rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';
  }
  function keepCard(here) {
    return `<div class="section-title"><h2>Share, print and save</h2></div>
      <div class="fam-keep">${shareBox()}
      <div class="card fam-keep-card"><h2>For the whole family</h2>
        <div class="fam-keep-row"><div><b>A family link</b><p class="small muted">Another parent opens it to see everyone here on their own Family and class page. Short summaries only; send a new link any time to update it.</p></div><button type="button" class="btn sm primary" id="fam-famlink" ${here.length ? '' : 'disabled'}>Copy the family link</button></div>
        <div class="fam-keep-row"><div><b>A family poster</b><p class="small muted">Everyone’s week on one printable page.</p></div><button type="button" class="btn sm" id="fam-poster">Make the poster</button></div>
        <div class="fam-keep-row"><div><b>All family data</b><p class="small muted">Every learner’s progress on this device, the progress shared with you and your class links, in one file. Keep it somewhere safe: it’s private.</p></div><div class="btn-row" style="margin:0"><button type="button" class="btn sm" id="fam-export">Save as a file</button><button type="button" class="btn sm ghost" id="fam-csv">Spreadsheet</button></div></div></div></div>`;
  }

  /* ---------- Getting started, and Privacy, for parents ---------- */
  function guideHtml(here) {
    const many = window.LEARNERS ? LEARNERS.count() > 1 : false, ps = here.map(x => x.st.profile || {});
    const step = (n, done, title, body, act) => `<li class="fam-gstep${done ? ' done' : ''}"><span class="fam-gn" aria-hidden="true">${n}</span><div><h3>${title}${done ? ' <span class="chip fit-mine">Done</span>' : ''}</h3><p>${body}</p>${act || ''}</div></li>`;
    return `<p class="muted">Five short steps to set Procademy up for your family. Each takes a minute or two, and you can come back to this page any time.</p>
      <ol class="fam-guide">
        ${step(1, many || ps.some(p => p.name), 'Add each child as a learner', 'Each learner gets their own progress, badges and tutor chats on this device. Open Profile and choose <b>Add a learner</b>. A 4-digit PIN stops anyone switching by mistake.', '<a class="btn sm" href="#/profile">Open Profile</a>')}
        ${step(2, ps.some(p => p.goal || p.limit), 'Set a daily goal and gentle limits', 'On the Overview, each card has a daily goal and <b>Parent controls</b>: a daily time limit that suggests a break, the tutor on or off, and whether you see tutor chat titles. A family goal counts everyone’s minutes together.', '<button type="button" class="btn sm" data-fam-tab="overview">Go to the overview</button>')}
        ${step(3, false, 'Check in once a week', 'Each card says how the week went in plain words, with next steps. Progress shows last week’s recap on Mondays, and the report prints, saves as a picture, or copies as text.', '<a class="btn sm" href="#/report">Open the report</a>')}
        ${step(4, ps.some(p => p.parentNote || (p.assigned || []).length || (p.tests || []).length), 'Encourage, and help a little', 'Leave a short note for their Home page, assign a few skills, or put a test on their calendar. They can leave you a note asking for help, and it shows on their card.')}
        ${step(5, shared().length > 0, 'Share with another parent or a teacher', 'A family link adds everyone here to another parent’s page. A learner’s progress link shares just them, with a teacher. Only short summaries travel, never answers or chats.')}
      </ol>
      <div class="card fam-habits"><h2>Habits that help</h2><ul>
        <li><b>Short and often.</b> Ten minutes on most days beats an hour once a week.</li>
        <li><b>Praise the effort,</b> not being “a math person.” Mistakes are how skills grow.</li>
        <li><b>Ask them to teach you</b> one problem. Explaining is great practice.</li>
        <li><b>Let them use the hints</b> and worked examples. Getting unstuck is part of learning.</li>
        <li><b>Keep it calm.</b> Quiet hours in Settings keep sounds and nudges off late in the day.</li></ul></div>`;
  }
  function privacyHtml() {
    return `<p class="muted">What Procademy keeps, where it goes, and how to delete it, in plain words.</p>
      <div class="fam-privacy">
        <section class="card"><h2>Saved on this device</h2><p>Each learner’s progress, settings, badges and tutor chats are saved in this browser. Learners on this device each have their own, and a PIN only guards against switching by mistake. Nothing here is sent anywhere by itself.</p></section>
        <section class="card"><h2>With an account</h2><p>An account is optional. It saves the same progress online (on Google Firebase) so it’s the same on every computer. Tutor chats and files are never uploaded. Only the signed-in learner can read their record.</p></section>
        <section class="card"><h2>Links</h2><p>Links carry their information after the # of the address, which no website receives. A progress link or a family link holds a short summary: first name, grade, streak, this week, levels and what to practice next. Class standings show nicknames only, and only for learners who chose to join. Class practice links hold no personal information at all.</p></section>
        <section class="card"><h2>The tutor</h2><p>Questions for the tutor go to a free AI service, with the skill and grade but not the learner’s name. A parent can turn the tutor off for a learner in Parent controls, or switch it to run on this device in the tutor’s settings. You see tutor use as counts, and chat titles only if you turn that on.</p></section>
        <section class="card"><h2>Parent controls</h2><p>The time limit, the tutor switch and chat titles are kept in the learner’s own profile on this device, and the learner sees a note about them on their Progress page. Nothing goes to a server.</p></section>
        <section class="card"><h2>Deleting it</h2><p>Remove a learner on Profile, or erase everything on this device in Settings. To delete an account and its online copy, sign in and use <b>Delete my account</b> on Profile. Progress shared with you can be removed from its card here.</p></section>
      </div>
      <p class="small"><a href="privacy.html">Read the full privacy page</a></p>`;
  }

  /* ---------- the page ---------- */
  const TABS = [['overview', 'Overview'], ['guide', 'Getting started'], ['privacy', 'Privacy']];
  function page(root, tab) {
    H.tutorCtx(null);
    tab = TABS.some(t => t[0] === tab) ? tab : 'overview';
    const here = herePeople();
    const tabs = `<nav class="tabs fam-tabs" aria-label="Family and class">${TABS.map(([id, label]) => `<button type="button" class="tab${id === tab ? ' on' : ''}" data-fam-tab="${id}" ${id === tab ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>`;
    if (tab !== 'overview') {
      root.innerHTML = `<h1>Family and class</h1>${tabs}${tab === 'guide' ? guideHtml(here) : privacyHtml()}${R() ? R().privateNote('family') : ''}`;
      if (tab === 'guide') famSet({ guided: true });
      root.querySelectorAll('[data-fam-tab]').forEach(b => b.addEventListener('click', () => { page(root, b.dataset.famTab); window.scrollTo(0, 0); }));
      return;
    }
    const away = shared().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const local = window.LEARNERS && here.length;
    const active = window.LEARNERS ? LEARNERS.active() : 'me';
    const rows = here.map(({ l, st }) => Object.assign(summarize(st, l.name), { where: 'here' })).concat(away.map(x => Object.assign({}, x, { where: 'shared' })));
    const stale = away.filter(x => Date.now() - x.t > 30 * DAY);
    const chatsOf = l => (window.LEARNERS && l.id !== active ? LEARNERS.own(l.id, 'procademy.chats.v1') : (() => { try { return localStorage.getItem('procademy.chats.v1'); } catch (e) { return null; } })());
    const newParent = S.get().profile.parentSetup && !famGet().guided;
    root.innerHTML = `<h1>Family and class</h1>${tabs}
      <p class="muted">How everyone you help is doing. Learners on this device appear here by themselves; anyone else can send you their progress link from their report.</p>
      ${newParent ? '<div class="fam-new"><p><b>New here?</b> Five short steps set things up for your family.</p><button type="button" class="btn sm primary" data-fam-tab="guide">Getting started</button></div>' : ''}
      <div class="section-title"><h2>On this device</h2><a href="#/report">Full report →</a></div>
      ${here.length ? goalCard(here) : ''}
      ${compare(rows)}
      <div class="fam-grid">${here.map(({ l, st }) => card(summarize(st, l.name), { st, where: window.LEARNERS && l.id === active ? 'Using Procademy now' : 'On this device', goalFor: l.id, local: local ? l.id : null, note: (st.profile || {}).parentNote || null, assigned: assignedOf(st), avatar: (st.profile || {}).avatar || l.avatar || { hue: 215 }, switchTo: local && l.id !== active, chats: chatsOf(l) })).join('')}</div>
      <div class="section-title"><h2>Shared with you</h2>${stale.length ? `<button type="button" class="btn sm ghost" id="fam-stale">Remove ${H.plural(stale.length, 'link')} older than 30 days</button>` : ''}</div>
      ${away.length ? `<div class="fam-grid">${away.map(s => card(s, { where: 'Updated ' + new Date(s.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + (Date.now() - s.t > 14 * DAY ? ' · ask for a new link' : ''), extra: `<div class="btn-row"><button class="btn sm ghost" type="button" data-fam-del="${esc(s.id)}">Remove</button></div>` })).join('')}</div>`
        : `<div class="card empty"><p>No one has shared their progress with you yet. On their device, a learner opens <b>Progress</b>, then <b>Report</b>, and sends you <b>my progress link</b>. Opening it here adds them.</p></div>`}
      ${standingsCard(away)}
      <div class="section-title"><h2>For teachers and classes</h2></div>
      <div class="fam-tools">${assignCard()}${pasteCard()}${linksCard()}</div>
      ${keepCard(here)}
      ${R() ? R().privateNote('family') : ''}`;
    root.querySelectorAll('[data-fam-tab]').forEach(b => b.addEventListener('click', () => { page(root, b.dataset.famTab); window.scrollTo(0, 0); }));
    root.querySelectorAll('[data-fam-del]').forEach(b => b.addEventListener('click', () => { keep(shared().filter(x => x.id !== b.dataset.famDel)); page(root); }));
    const st0 = root.querySelector('#fam-stale');
    if (st0) st0.addEventListener('click', () => { keep(shared().filter(x => Date.now() - x.t <= 30 * DAY)); V.toast('Old progress links removed.'); page(root); });
    root.querySelectorAll('[data-fam-goal]').forEach(sel => sel.addEventListener('change', () => {
      const id = sel.dataset.famGoal, n = Number(sel.value);
      if (window.LEARNERS ? LEARNERS.setGoal(id, n) : (S.setProfile({ goal: n }), true)) V.toast(`Daily goal: ${n} questions`);
      page(root);
    }));
    const fg = root.querySelector('#fam-fgoal');
    if (fg) fg.addEventListener('change', () => { famSet({ goal: { min: Number(fg.value) } }); V.toast(Number(fg.value) ? `Family goal: ${fg.value} minutes a week` : 'The family goal is off.'); page(root); });
    root.querySelectorAll('[data-fam-note]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famNote, 'note')));
    root.querySelectorAll('[data-fam-reply]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famReply, 'note', 'reply')));
    root.querySelectorAll('[data-fam-assign]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famAssign, 'assign')));
    root.querySelectorAll('[data-fam-test]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famTest, 'test')));
    root.querySelectorAll('[data-fam-ctl]').forEach(b => b.addEventListener('click', () => panel(root, b.dataset.famCtl, 'controls')));
    root.querySelectorAll('[data-fam-seen]').forEach(b => b.addEventListener('click', () => { LEARNERS.patch(b.dataset.famSeen, q => ({ helpNote: Object.assign({}, q.helpNote, { seen: true }) })); V.toast('Marked as read. They’ll see that on their Progress page.'); page(root); }));
    root.querySelectorAll('[data-fam-quick]').forEach(b => b.addEventListener('click', () => {
      const [id, sid] = JSON.parse(b.dataset.famQuick);
      LEARNERS.patch(id, q => ({ assigned: [{ id: Date.now().toString(36), title: H.plain(A.skills[sid].title).slice(0, 60), ids: [sid], t: Date.now() }].concat(q.assigned || []).slice(0, 5) }));
      V.toast('Assigned. It shows on their Home page.'); page(root);
    }));
    root.querySelectorAll('[data-fam-test-del]').forEach(b => b.addEventListener('click', () => { const [id, tid] = JSON.parse(b.dataset.famTestDel); LEARNERS.patch(id, q => ({ tests: (q.tests || []).filter(t => t && t.id !== tid) })); page(root); }));
    root.querySelectorAll('[data-fam-ics]').forEach(b => b.addEventListener('click', () => {
      const [id, tid] = JSON.parse(b.dataset.famIcs), st = LEARNERS.stateOf(id), t = ((st && st.profile.tests) || []).find(x => x && x.id === tid);
      if (t) download(`procademy-test-${t.date}.ics`, testIcs(t.name, t.date, st.profile.name), 'text/calendar');
    }));
    root.querySelectorAll('[data-fam-unflag]').forEach(b => b.addEventListener('click', () => { const [id, skill, seed] = JSON.parse(b.dataset.famUnflag); LEARNERS.patch(id, q => ({ flagged: (q.flagged || []).filter(f => !(f && f.skill === skill && f.seed === seed)) })); V.toast('The flag is off.'); page(root); }));
    root.querySelectorAll('[data-fam-unflag-all]').forEach(b => b.addEventListener('click', () => { if (!confirm('Clear every flagged question for this learner?')) return; LEARNERS.patch(b.dataset.famUnflagAll, () => ({ flagged: [] })); page(root); }));
    root.querySelectorAll('[data-fam-switch]').forEach(b => b.addEventListener('click', async () => {
      const id = b.dataset.famSwitch, t = LEARNERS.list().find(x => x.id === id);
      if (t && t.pin) { V.toast(`${t.name || 'This learner'} has a PIN. Switch on the Profile page.`); location.hash = '#/profile'; return; }
      try { await LEARNERS.switchTo(id); V.toast(`Switched to ${(t && t.name) || 'this learner'}.`); page(root); } catch (e) { V.toast(e.message); }
    }));
    const fl = root.querySelector('#fam-famlink');
    if (fl) fl.addEventListener('click', () => { const url = familyLink(); FAMILY._family = url; copy(url, 'Family link copied. Send it to another parent.'); });
    root.querySelector('#fam-poster').addEventListener('click', () => poster(root));
    root.querySelector('#fam-export').addEventListener('click', () => download(`procademy-family-${S.today()}.json`, exportAll(), 'application/json'));
    root.querySelector('#fam-csv').addEventListener('click', () => download(`procademy-family-${S.today()}.csv`, exportCsv(), 'text/csv'));
    wireShare(root);
    wireAssign(root);
    wirePaste(root);
    wireLinks(root);
    wireStandings(root, away);
  }

  /* ---------- #/family/add/<code>: a progress link, a family link, or a class link (practice, a plan, standings) ---------- */
  function decodeAny(c) { try { return JSON.parse(D.decode(c) || 'null'); } catch (e) { return null; } }
  const goodTime = t => Number(t) > Date.UTC(2026, 0, 1) && Number(t) < Date.now() + DAY;
  const expired = o => o.exp != null && !(Number(o.exp) > Date.now());
  const until = o => (o.exp ? ` It works until ${new Date(Number(o.exp)).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.` : '');
  function deadLink(root, title, msg) { root.innerHTML = `<div class="card empty"><h1>${title}</h1><p class="muted">${msg}</p><a class="btn primary" href="#/">Home</a></div>`; }
  function classPage(root, o) {
    const title = typeof o.title === 'string' ? o.title.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60) : '';
    if (!goodTime(o.t)) return deadLink(root, 'This link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
    if (expired(o)) return deadLink(root, 'This class link has expired', `It stopped working on ${new Date(Number(o.exp)).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}. Ask your teacher for a fresh link.`);
    if (o.k === 'go') {
      if (typeof o.to !== 'string' || !PRACTICE.test(o.to)) return deadLink(root, 'This link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
      location.replace(o.to);
      return;
    }
    if (o.k === 'plan') {
      const c = A.courseById(o.c), weeks = (Array.isArray(o.weeks) ? o.weeks : []).slice(0, 12).filter(w => w && /^\d{4}-\d\d-\d\d$/.test(w.mon) && c && A.unitById(c.id, w.u));
      if (!c || !weeks.length) return deadLink(root, 'This plan link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
      const mon = mondayOf(S.today()), now = weeks.find(w => w.mon === mon) || weeks.find(w => w.mon > mon) || weeks[weeks.length - 1];
      root.innerHTML = `<h1>${esc(title || 'Practice plan')}</h1><p class="muted">${esc(c.title)}: a unit a week, from your teacher.${esc(until(o))}</p>
        <ol class="fam-plan-view">${weeks.map(w => { const u = A.unitById(c.id, w.u), on = w === now; return `<li class="${on ? 'on' : ''}${w.mon < mon && !on ? ' past' : ''}"><div><span class="small muted">Week of ${esc(shortDate(w.mon))}${on ? ' · this week' : ''}</span><b>${esc(u.title)}</b></div><a class="btn sm${on ? ' primary' : ''}" href="#/unlimited/unit/${c.id}/${u.id}">${on ? 'Start this week’s practice' : 'Practice'}</a></li>`; }).join('')}</ol>`;
      return;
    }
    if (o.k === 'st') {
      const int = v => (Number.isInteger(v) && v >= 0 && v <= 100000 ? v : 0);
      const rows = (Array.isArray(o.rows) ? o.rows : []).slice(0, 60).filter(r => r && typeof r.n === 'string' && NICK.test(r.n.trim())).map(r => ({ n: r.n.trim(), q: int(r.q), days: Math.min(7, int(r.days)), min: int(r.min), streak: int(r.streak), m: int(r.m) }));
      if (!rows.length) return deadLink(root, 'This standings link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
      root.innerHTML = `<h1>${esc(title || 'Class standings')}</h1><p class="muted">Nicknames only, for students who chose to join. As of ${esc(new Date(Number(o.t)).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}.${esc(until(o))}</p>
        <div class="card fam-standings"><label class="small">Rank by <select id="fam-st-by">${BY.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label><div id="fam-st-box">${standList(rows, 'q')}</div></div>
        <p class="small muted">To join, copy your progress link on your Report page with <b>Show me in my class’s standings</b> ticked, and send it to your teacher.</p>`;
      root.querySelector('#fam-st-by').addEventListener('change', ev => { root.querySelector('#fam-st-box').innerHTML = standList(rows, ev.target.value); });
      return;
    }
    deadLink(root, 'This link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
  }
  function addPage(root, c) {
    H.tutorCtx(null);
    const o = decodeAny(c);
    if (o && o.v === 1 && ['go', 'plan', 'st'].includes(o.k)) return classPage(root, o);
    if (o && o.v === 1 && o.k === 'fam') {
      const list = goodTime(o.t) && Array.isArray(o.list) ? o.list.slice(0, 8).map(x => check(x && typeof x === 'object' ? Object.assign({}, x, { k: undefined }) : null)).filter(Boolean) : [];
      if (!list.length) return deadLink(root, 'This family link doesn’t work', 'It may have been shortened when it was copied. Ask for a new link.');
      root.innerHTML = `<h1>Add this family’s progress?</h1><p class="muted">${H.plural(list.length, 'learner')}, kept on this device on your Family and class page. A newer family link updates them.</p>
        <div class="fam-grid">${list.map(s => card(s, { where: 'Shared on ' + new Date(s.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })).join('')}</div>
        <div class="btn-row"><button class="btn primary" type="button" id="fam-add">Add ${list.length === 1 ? 'them' : `all ${list.length}`} to Family and class</button><a class="btn" href="#/">Not now</a></div>`;
      root.querySelector('#fam-add').addEventListener('click', () => { const n = list.filter(add).length; V.toast(n ? `Added ${H.plural(n, 'learner')} to Family and class.` : 'You already have newer updates from them.'); location.hash = '#/family'; });
      return;
    }
    const sum = read(c);
    if (!sum) { root.innerHTML = `<div class="card empty"><h1>This progress link doesn’t work</h1><p class="muted">It may have been shortened when it was copied. Ask for a new link.</p><a class="btn primary" href="#/family">Family and class</a></div>`; return; }
    root.innerHTML = `<h1>Add ${esc(sum.name || 'this learner')}’s progress?</h1><p class="muted">It will be kept on this device, on your Family and class page. A newer link from them updates it.</p>
      ${card(sum, { where: 'Shared on ' + new Date(sum.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) })}
      <div class="btn-row"><button class="btn primary" type="button" id="fam-add">Add to Family and class</button><a class="btn" href="#/">Not now</a></div>`;
    root.querySelector('#fam-add').addEventListener('click', () => { const fresh = add(sum); V.toast(fresh ? 'Added to Family and class.' : 'You already have a newer update from them.'); location.hash = '#/family'; });
  }

  /* ---------- parent controls at work: the tutor off for a learner, and a gentle break after the time limit ---------- */
  const tutorOff = () => !!S.get().profile.tutorOff;
  /** hide the tutor's buttons and links while it is off (the class on <html>, see app.css) */
  function gate() { document.documentElement.classList.toggle('tutor-off', tutorOff()); }
  function tutorOffPage(root) {
    const n = S.get().profile.name;
    root.innerHTML = `<div class="card empty"><h1>The tutor is turned off</h1><p class="muted">A parent turned off the tutor for ${esc(n || 'this learner')} on this device. Hints, worked examples and lessons still work. A parent can turn it back on in Family and class, under Parent controls.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a><a class="btn" href="#/family">Family and class</a></div></div>`;
  }
  // the tutor's panel and page check first (both are loaded before this file)
  if (window.TUTORUI && typeof TUTORUI.open === 'function') { const open0 = TUTORUI.open; TUTORUI.open = function (opts) { if (tutorOff()) { V.toast('A parent turned the tutor off for now.'); return undefined; } return open0.apply(this, arguments); }; }
  if (window.TUTORPAGE && typeof TUTORPAGE.tutorPage === 'function') { const page0 = TUTORPAGE.tutorPage; TUTORPAGE.tutorPage = function (root) { if (tutorOff()) return tutorOffPage(root); return page0.apply(this, arguments); }; }
  function breakNote(lim) {
    if (document.getElementById('fam-break')) return;
    const el = document.createElement('div'); el.id = 'fam-break'; el.className = 'fam-break'; el.setAttribute('role', 'status');
    el.innerHTML = `<p><b>Time for a break.</b> That’s ${lim} minutes of practice today, the limit a parent set. Finish what you’re on, then rest. Great work today.</p><button type="button" class="btn sm primary">OK</button>`;
    document.body.appendChild(el);
    el.querySelector('button').addEventListener('click', () => el.remove());
  }
  S.onChange(st => {
    gate();
    const lim = Number(st.profile.limit), today = S.today();
    if (!lim || st.profile.limitSaid === today || S.minutes(st.days[today]) < lim) return;
    S.setProfile({ limitSaid: today });
    breakNote(lim);
  });
  gate();

  const FAMILY = { summarize, read, add, shared, link, shareBox, wireShare, page, addPage, assignedOf, setHash, helpTips, plainWords, nextSteps, goalLine, familyLink, exportAll, exportCsv, testIcs, poster, gate, tutorOff, standRows, _last: null, _assign: null };
  window.FAMILY = FAMILY;
})();
