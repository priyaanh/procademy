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
    const week = { days: 0, q: 0, right: 0 };
    for (let k = 0; k < 7; k++) { const d = days[S.dayShift(monday, k)]; if (d && d.q) { week.days++; week.q += d.q; week.right += d.right || 0; } }
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
    return { v: 1, name: String(p.name || nameFallback || '').trim().slice(0, 24), grade: Number.isInteger(p.grade) ? p.grade : null, t: Date.now(), streak, week, counts: counts.slice(1), courses, next, slips, last };
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
    return { v: 1, id: o.id, name, grade, t, streak, week, counts, courses, next, slips, last };
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

  /** one learner's card */
  function card(sum, opts) {
    const pct = sum.week.q ? Math.round(sum.week.right / sum.week.q * 100) : 0;
    const grade = sum.grade == null ? '' : sum.grade === 0 ? 'Kindergarten' : `Grade ${sum.grade}`;
    const names = { sign: 'sign slips', flip: 'flipped fractions', place: 'decimal point slips', percent: 'percent and decimal mix-ups', early: 'stopping a step early', echo: 'answering with a given number', digits: 'swapped digits', round: 'rounding', one: 'off-by-one slips', op: 'choosing the wrong operation' };
    return `<div class="card fam-card"><div class="row between" style="flex-wrap:wrap;gap:6px"><h3 style="margin:0" data-raw>${esc(sum.name || 'A learner')}</h3><span class="small muted">${[grade, opts.where].filter(Boolean).map(esc).join(' · ')}</span></div>
      <div class="fam-stats"><span><b>${sum.streak}</b> day streak</span><span><b>${sum.week.days}</b> of 7 days this week</span><span><b>${sum.week.q}</b> questions${sum.week.q ? `, ${pct}% right` : ''}</span><span><b>${sum.counts[3]}</b> mastered · <b>${sum.counts[2]}</b> proficient</span></div>
      ${sum.courses.length ? `<ul class="fam-courses">${sum.courses.map(c => `<li><span>${esc(A.courseById(c.id).title)}</span><span class="pbar" role="img" aria-label="${c.pct}% mastered"><span style="width:${c.pct}%"></span></span><span class="small muted">${c.pct}%</span></li>`).join('')}</ul>` : ''}
      ${sum.next.length ? `<p class="small" style="margin:8px 0 0"><b>Next to practice:</b> ${sum.next.map(id => `<a href="${H.skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}</p>` : ''}
      ${sum.slips.length ? `<p class="small muted" style="margin:4px 0 0">Watch for ${sum.slips.map(k => names[k]).join(' and ')}.</p>` : ''}
      ${opts.extra || ''}</div>`;
  }

  function page(root) {
    H.tutorCtx(null);
    const here = window.LEARNERS ? LEARNERS.list().map(l => ({ l, st: LEARNERS.stateOf(l.id) })).filter(x => x.st) : [{ l: { id: 'me' }, st: S.get() }];
    const away = shared().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    root.innerHTML = `<h1>Family and class</h1><p class="muted">How everyone you help is doing. Learners on this device appear here by themselves; anyone else can send you their progress link from their report.</p>
      <div class="section-title"><h2>On this device</h2><a href="#/report">Full report →</a></div>
      <div class="fam-grid">${here.map(({ l, st }) => card(summarize(st, l.name), { where: window.LEARNERS && l.id === LEARNERS.active() ? 'Using Procademy now' : 'On this device' })).join('')}</div>
      <div class="section-title"><h2>Shared with you</h2></div>
      ${away.length ? `<div class="fam-grid">${away.map(s => card(s, { where: 'Updated ' + new Date(s.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), extra: `<div class="btn-row"><button class="btn sm ghost" type="button" data-fam-del="${esc(s.id)}">Remove</button></div>` })).join('')}</div>`
        : `<div class="card empty"><p>No one has shared their progress with you yet. On their device, a learner opens <b>Progress</b>, then <b>Report</b>, and sends you <b>my progress link</b>. Opening it here adds them.</p></div>`}
      ${shareBox()}`;
    root.querySelectorAll('[data-fam-del]').forEach(b => b.addEventListener('click', () => { keep(shared().filter(x => x.id !== b.dataset.famDel)); page(root); }));
    wireShare(root);
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

  const FAMILY = { summarize, read, add, shared, link, shareBox, wireShare, page, addPage, _last: null };
  window.FAMILY = FAMILY;
})();
