/* The family calendar (#/calendar, #/calendar/<YYYY-MM>, a Tools card): practice days, lessons and events a family
   adds, on a month view (Sunday first, as phone calendars in the United States show it) beside the chosen day.
   An entry can happen once or every week on chosen weekdays (until a date, with single weeks skipped). The days
   also show what's already known: practice done on Procademy, piano practice from the practice log, tests a
   parent put on the calendar, and merit badges completed. Everything exports to a phone calendar as an .ics file
   (one entry, or all of them; weekly ones as repeating events). Kept per learner in profile.calendar =
   { events: { id: { title, kind, date, time, dur, repeat, days, until, skip, who, notes, t } } }, so it travels
   with an account (merged entry by entry, the newer edit winning; a removed entry is kept as { gone, t }). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V && V._h;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KINDS = [['practice', 'Practice'], ['lesson', 'Lesson'], ['event', 'Event']];
  const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ICS_DAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const isDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
  const isTime = t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t || '');
  const wday = d => new Date(d + 'T12:00').getDay();
  const ymOf = d => d.slice(0, 7);
  const fmt = (d, o) => new Date(d + 'T12:00').toLocaleDateString('en-US', o || { weekday: 'long', month: 'long', day: 'numeric' });
  const time12 = t => { if (!isTime(t)) return ''; const [h, m] = t.split(':').map(Number); return `${(h + 11) % 12 + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

  /* ---------- what's kept ---------- */
  const kept = () => { const p = S.get().profile.calendar; return p && typeof p === 'object' && !Array.isArray(p) ? JSON.parse(JSON.stringify(p)) : {}; };
  const map = () => { const e = kept().events; return e && typeof e === 'object' ? e : {}; };
  /** every entry (removed ones left out), with its id */
  const events = () => Object.entries(map()).filter(([, e]) => e && !e.gone && e.title && isDay(e.date)).map(([id, e]) => Object.assign({ id }, e));
  const newId = () => 'e' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  /** add or change an entry; returns its id */
  function save(id, ev) {
    const p = kept(), m = p.events && typeof p.events === 'object' ? p.events : {};
    id = id || newId();
    const days = (Array.isArray(ev.days) ? ev.days : []).map(Number).filter(d => d >= 0 && d <= 6);
    m[id] = {
      title: String(ev.title || '').trim().slice(0, 80), kind: KINDS.some(k => k[0] === ev.kind) ? ev.kind : 'event', date: ev.date, time: isTime(ev.time) ? ev.time : '',
      dur: Math.max(0, Math.min(600, Number(ev.dur) || 0)), repeat: ev.repeat === 'weekly' ? 'weekly' : 'none', days: ev.repeat === 'weekly' ? [...new Set(days.length ? days : [wday(ev.date)])].sort() : [],
      until: ev.repeat === 'weekly' && isDay(ev.until) && ev.until >= ev.date ? ev.until : '', skip: (Array.isArray(ev.skip) ? ev.skip : []).filter(isDay).slice(-60),
      who: String(ev.who || '').trim().slice(0, 40), notes: String(ev.notes || '').trim().slice(0, 500), t: Date.now(),
    };
    p.events = m;
    S.setProfile({ calendar: p });
    return id;
  }
  function remove(id) { const p = kept(); if (!p.events || !p.events[id]) return; p.events[id] = { gone: true, t: Date.now() }; S.setProfile({ calendar: p }); }
  /** does an entry happen on a day? */
  function occurs(ev, d) {
    if (!ev || ev.gone || !isDay(d)) return false;
    if (ev.repeat !== 'weekly') return d === ev.date;
    return d >= ev.date && (!ev.until || d <= ev.until) && (ev.days || []).includes(wday(d)) && !(ev.skip || []).includes(d);
  }
  const byTime = (a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.title.localeCompare(b.title);
  const on = d => events().filter(e => occurs(e, d)).sort(byTime);
  /** what Procademy already knows about a day: practice here, piano practice, tests, badges completed */
  function known(d) {
    const st = S.get(), out = [], dd = st.days && st.days[d];
    if (dd && dd.q) out.push({ k: 'practice', text: `Practiced on Procademy: ${dd.q} question${dd.q === 1 ? '' : 's'}${S.minutes ? `, about ${Math.max(1, S.minutes(dd))} min` : ''}` });
    const pl = window.PIANO ? PIANO.log()[d] : null;
    if (pl && pl.min) out.push({ k: 'piano', text: `Piano practice: ${pl.min} min${(pl.pieces || []).length ? ` (${pl.pieces.join(', ')})` : ''}` });
    (Array.isArray(st.profile.tests) ? st.profile.tests : []).filter(t => t && t.date === d && t.name).forEach(t => out.push({ k: 'test', text: `Test: ${t.name}` }));
    if (window.SCOUTS) SCOUTS.badges().filter(b => b.done === d).forEach(b => out.push({ k: 'badge', text: `Merit badge completed: ${b.name}` }));
    return out;
  }

  /* ---------- the phone calendar file (.ics) ---------- */
  const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  /** fold lines longer than 75 characters, as the format asks */
  const fold = line => { const out = []; let s = line; while (s.length > 74) { out.push(s.slice(0, 74)); s = ' ' + s.slice(74); } out.push(s); return out.join('\r\n'); };
  const compact = d => d.replace(/-/g, '');
  const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  /** the first day an entry happens (a weekly one's start day may not be one of its weekdays) */
  function firstDay(ev) { if (ev.repeat !== 'weekly') return ev.date; let d = ev.date; for (let i = 0; i < 7; i++) { if ((ev.days || []).includes(wday(d))) return d; d = S.dayShift(d, 1); } return ev.date; }
  function vevent(ev) {
    const d0 = firstDay(ev), timed = isTime(ev.time), dur = ev.dur || 60;
    const start = timed ? `${compact(d0)}T${ev.time.replace(':', '')}00` : compact(d0);
    let end;
    if (timed) { const t = new Date(`${d0}T${ev.time}:00`); t.setMinutes(t.getMinutes() + dur); end = `${t.getFullYear()}${String(t.getMonth() + 1).padStart(2, '0')}${String(t.getDate()).padStart(2, '0')}T${String(t.getHours()).padStart(2, '0')}${String(t.getMinutes()).padStart(2, '0')}00`; }
    else end = compact(S.dayShift(d0, 1));
    const lines = ['BEGIN:VEVENT', `UID:${ev.id}@procademy`, `DTSTAMP:${stamp()}`, timed ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${start}`, timed ? `DTEND:${end}` : `DTEND;VALUE=DATE:${end}`];
    if (ev.repeat === 'weekly') {
      lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${ev.days.map(k => ICS_DAY[k]).join(',')}${ev.until ? `;UNTIL=${compact(ev.until)}${timed ? 'T235959' : ''}` : ''}`);
      (ev.skip || []).filter(d => d >= d0).forEach(d => lines.push(timed ? `EXDATE:${compact(d)}T${ev.time.replace(':', '')}00` : `EXDATE;VALUE=DATE:${compact(d)}`));
    }
    lines.push(`SUMMARY:${icsText(ev.who ? `${ev.title} (${ev.who})` : ev.title)}`, `CATEGORIES:${icsText(KINDS.find(k => k[0] === ev.kind)[1])}`);
    if (ev.notes) lines.push(`DESCRIPTION:${icsText(ev.notes)}`);
    lines.push('END:VEVENT');
    return lines;
  }
  /** a calendar file with the given entries */
  const ics = list => ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Family calendar//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Procademy family calendar'].concat(...list.map(vevent), ['END:VCALENDAR']).map(fold).join('\r\n') + '\r\n';
  function download(name, text) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/calendar' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const fileName = s => 'procademy-' + (String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'calendar') + '.ics';

  /* ---------- the page ---------- */
  let sel = null, editing = null;          // the chosen day; the entry being added or changed ({} for a new one)
  /** the month's grid: whole weeks, Sunday first */
  function grid(ym) {
    const first = ym + '-01', start = S.dayShift(first, -wday(first)), out = [];
    for (let i = 0; i < 42; i++) { const d = S.dayShift(start, i); if (i % 7 === 0 && i >= 28 && ymOf(d) !== ym) break; out.push(d); }
    return out;
  }
  function page(root, ym) {
    const today = S.today();
    if (!sel || (ym && ymOf(sel) !== ym)) sel = ym && ymOf(today) !== ym ? ym + '-01' : today;
    ym = ym && /^\d{4}-\d{2}$/.test(ym) ? ym : ymOf(sel);
    const days = grid(ym), evs = events(), title = new Date(ym + '-15T12:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const prevYm = ymOf(S.dayShift(ym + '-01', -1)), nextYm = ymOf(S.dayShift(ym + '-01', 32));
    const cell = d => {
      const list = evs.filter(e => occurs(e, d)).sort(byTime), k = known(d), out = ymOf(d) !== ym;
      return `<button type="button" class="cal-day${out ? ' out' : ''}${d === today ? ' today' : ''}${d === sel ? ' on' : ''}" data-day="${d}" aria-pressed="${d === sel}" aria-label="${fmt(d)}${list.length ? `: ${list.length} ${list.length === 1 ? 'entry' : 'entries'}` : ''}${k.length ? ', ' + k.map(x => x.k === 'practice' ? 'practiced on Procademy' : x.k === 'piano' ? 'piano practice' : x.k).join(', ') : ''}">
        <span class="cal-n">${Number(d.slice(8))}</span><span class="cal-evs">${list.slice(0, 2).map(e => `<span class="cal-ev k-${e.kind}">${esc(e.title)}</span>`).join('')}${list.length > 2 ? `<span class="cal-more">+${list.length - 2} more</span>` : ''}</span>
        <span class="cal-marks" aria-hidden="true">${k.some(x => x.k === 'practice') ? '<i class="m-practice"></i>' : ''}${k.some(x => x.k === 'piano') ? '<i class="m-piano"></i>' : ''}${k.some(x => x.k === 'test' || x.k === 'badge') ? '<i class="m-test"></i>' : ''}</span></button>`;
    };
    root.innerHTML = `<div class="cal-page"><div class="cal-top"><div><h1>Family calendar</h1><p class="muted cal-intro">Practice days, lessons and family events in one place. Add them to a phone calendar too.</p></div>
        <div class="btn-row cal-acts"><button type="button" class="btn primary" id="cal-add">Add to the calendar</button>${evs.length ? '<button type="button" class="btn" id="cal-ics-all">Export all to a phone calendar</button>' : ''}</div></div>
      <div class="cal-grid">
        <section class="card cal-month" aria-label="${title}">
          <div class="cal-head"><h2>${title}</h2><span class="cal-nav"><a class="iconbtn" href="#/calendar/${prevYm}" aria-label="Previous month">‹</a>${ym !== ymOf(today) ? `<a class="btn sm ghost" href="#/calendar/${ymOf(today)}" id="cal-today">Today</a>` : ''}<a class="iconbtn" href="#/calendar/${nextYm}" aria-label="Next month">›</a></span></div>
          <div class="cal-wd" aria-hidden="true">${WD.map(w => `<span>${w.slice(0, 3)}</span>`).join('')}</div>
          <div class="cal-days">${days.map(cell).join('')}</div>
          <p class="tiny muted cal-legend"><span class="cal-ev k-practice">Practice</span><span class="cal-ev k-lesson">Lesson</span><span class="cal-ev k-event">Event</span><span><i class="m-practice"></i> practiced on Procademy</span><span><i class="m-piano"></i> piano practice</span><span><i class="m-test"></i> a test or a badge</span></p>
        </section>
        <section class="card cal-side" id="cal-side" aria-live="polite"></section>
      </div></div>`;
    const side = root.querySelector('#cal-side');
    const drawSide = () => { side.innerHTML = editing ? form(editing) : dayView(sel); };
    drawSide();
    root.querySelector('.cal-days').addEventListener('click', ev => { const b = ev.target.closest('[data-day]'); if (!b) return; sel = b.dataset.day; editing = null; root.querySelectorAll('.cal-day').forEach(x => { const o = x.dataset.day === sel; x.classList.toggle('on', o); x.setAttribute('aria-pressed', String(o)); }); if (ymOf(sel) !== ym) { location.hash = '#/calendar/' + ymOf(sel); return; } drawSide(); if (window.innerWidth < 900) side.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    root.querySelector('#cal-add').addEventListener('click', () => { editing = { date: sel || today }; drawSide(); const f = side.querySelector('#ce-title'); if (f) f.focus(); });
    const all = root.querySelector('#cal-ics-all'); if (all) all.addEventListener('click', () => download('procademy-family-calendar.ics', ics(events())));
    side.addEventListener('click', ev => sideClick(root, ev, drawSide, ym));
    root.__cal = { ym, sel, days };
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the family calendar page.' });
  }
  function dayView(d) {
    const list = on(d), k = known(d), soon = [];
    for (let i = 1; i <= 14 && soon.length < 6; i++) { const dd = S.dayShift(d, i); on(dd).forEach(e => { if (soon.length < 6) soon.push([dd, e]); }); }
    const row = e => `<li class="cal-item"><span class="cal-ev k-${e.kind}">${KINDS.find(x => x[0] === e.kind)[1]}</span><div class="cal-what"><b>${esc(e.title)}</b><span class="small muted">${[time12(e.time) + (e.time && e.dur ? `, ${e.dur} min` : ''), e.repeat === 'weekly' ? `every ${e.days.map(x => WD[x]).join(' and ')}${e.until ? ` until ${fmt(e.until, { month: 'short', day: 'numeric' })}` : ''}` : '', e.who].filter(Boolean).map(esc).join(' · ')}</span>${e.notes ? `<span class="small">${esc(e.notes)}</span>` : ''}
      <span class="cal-btns"><button type="button" class="link-btn small" data-edit="${e.id}">Edit</button><button type="button" class="link-btn small" data-ics="${e.id}">Add to phone calendar</button>${e.repeat === 'weekly' ? `<button type="button" class="link-btn small" data-skip="${e.id}">Skip this week</button>` : ''}</span></div></li>`;
    return `<h2>${fmt(d)}</h2>${d === S.today() ? '<p class="small muted cal-sub">Today</p>' : ''}
      ${list.length ? `<ul class="cal-list">${list.map(row).join('')}</ul>` : '<p class="small muted">Nothing on the calendar this day.</p>'}
      ${k.length ? `<ul class="cal-known small">${k.map(x => `<li><i class="m-${x.k === 'badge' ? 'test' : x.k}"></i>${esc(x.text)}</li>`).join('')}</ul>` : ''}
      <div class="btn-row"><button type="button" class="btn sm" data-add-day="${d}">Add to this day</button></div>
      ${soon.length ? `<h3 class="cal-soon-h">Coming up</h3><ul class="cal-soon small">${soon.map(([dd, e]) => `<li><button type="button" class="link-btn" data-go="${dd}">${fmt(dd, { weekday: 'short', month: 'short', day: 'numeric' })}</button> ${esc(e.title)}${e.time ? ` <span class="muted">${time12(e.time)}</span>` : ''}</li>`).join('')}</ul>` : ''}`;
  }
  function form(e) {
    const weekly = e.repeat === 'weekly', days = e.days && e.days.length ? e.days : [wday(e.date || S.today())];
    const seg = (id, label, list, v) => `<div class="lab-ctl"><span class="lab-label" id="${id}-l">${label}</span><div class="seg" role="radiogroup" aria-labelledby="${id}-l" id="${id}">${list.map(([k, l]) => `<button type="button" role="radio" data-v="${k}" aria-checked="${k === v}">${l}</button>`).join('')}</div></div>`;
    return `<h2>${e.id ? 'Change' : 'Add to'} the calendar</h2>
      <label class="field"><span class="label">What</span><input type="text" id="ce-title" maxlength="80" value="${esc(e.title || '')}" placeholder="For example: Piano lesson" autocomplete="off"></label>
      ${seg('ce-kind', 'Kind', KINDS, e.kind || 'event')}
      <div class="cal-two"><label class="field"><span class="label">Day</span><input type="date" id="ce-date" value="${e.date || S.today()}"></label><label class="field"><span class="label">Time <span class="muted small">(optional)</span></span><input type="time" id="ce-time" value="${e.time || ''}"></label></div>
      <label class="field"><span class="label">How long <span class="muted small">(optional)</span></span><select id="ce-dur">${[[0, 'Not set'], [15, '15 minutes'], [30, '30 minutes'], [45, '45 minutes'], [60, '1 hour'], [90, '1½ hours'], [120, '2 hours'], [180, '3 hours']].map(([v, l]) => `<option value="${v}"${Number(e.dur || 0) === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      ${seg('ce-repeat', 'Repeats', [['none', 'Just once'], ['weekly', 'Every week']], weekly ? 'weekly' : 'none')}
      <div class="cal-weekly" id="ce-weekly"${weekly ? '' : ' hidden'}><span class="lab-label" id="ce-days-l">On</span><div class="cal-wdpick" role="group" aria-labelledby="ce-days-l">${WD.map((w, i) => `<button type="button" class="chip-btn${days.includes(i) ? ' on' : ''}" data-wd="${i}" aria-pressed="${days.includes(i)}" aria-label="${w}">${w.slice(0, 3)}</button>`).join('')}</div>
        <label class="field"><span class="label">Until <span class="muted small">(optional)</span></span><input type="date" id="ce-until" value="${e.until || ''}"></label></div>
      <label class="field"><span class="label">Who <span class="muted small">(optional)</span></span><input type="text" id="ce-who" maxlength="40" value="${esc(e.who || '')}" placeholder="For example: Ana, or everyone" autocomplete="off"></label>
      <label class="field"><span class="label">Notes <span class="muted small">(optional)</span></span><textarea id="ce-notes" rows="2" maxlength="500">${esc(e.notes || '')}</textarea></label>
      <div class="btn-row"><button type="button" class="btn primary" id="ce-save">${e.id ? 'Save changes' : 'Add it'}</button><button type="button" class="btn ghost" id="ce-cancel">Cancel</button>${e.id ? '<button type="button" class="btn ghost" id="ce-del">Remove</button>' : ''}</div>
      <p class="small" id="ce-msg" role="status"></p>`;
  }
  function sideClick(root, ev, drawSide, ym) {
    const t = ev.target.closest('button'); if (!t) return;
    const side = root.querySelector('#cal-side'), $ = s => side.querySelector(s), byId = id => events().find(x => x.id === id);
    if (t.dataset.addDay) { editing = { date: t.dataset.addDay }; drawSide(); $('#ce-title').focus(); return; }
    if (t.dataset.edit) { editing = byId(t.dataset.edit); drawSide(); $('#ce-title').focus(); return; }
    if (t.dataset.ics) { const e = byId(t.dataset.ics); if (e) download(fileName(e.title), ics([e])); return; }
    if (t.dataset.skip) { const e = byId(t.dataset.skip); if (e) { save(e.id, Object.assign(e, { skip: (e.skip || []).concat(sel) })); if (V.toast) V.toast(`${e.title} is skipped on ${fmt(sel, { month: 'short', day: 'numeric' })}.`); page(root, ym); } return; }
    if (t.dataset.go) { sel = t.dataset.go; if (ymOf(sel) !== ym) { location.hash = '#/calendar/' + ymOf(sel); return; } page(root, ym); return; }
    if (t.closest('#ce-kind, #ce-repeat') && t.getAttribute('role') === 'radio') {
      t.parentNode.querySelectorAll('[role="radio"]').forEach(x => x.setAttribute('aria-checked', String(x === t)));
      if (t.closest('#ce-repeat')) $('#ce-weekly').hidden = t.dataset.v !== 'weekly';
      return;
    }
    if (t.dataset.wd != null) { const onNow = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', String(onNow)); t.classList.toggle('on', onNow); return; }
    if (t.id === 'ce-cancel') { editing = null; drawSide(); return; }
    if (t.id === 'ce-del') { remove(editing.id); if (V.toast) V.toast(`${editing.title} removed from the calendar.`); editing = null; page(root, ym); return; }
    if (t.id === 'ce-save') {
      const pick = id => (side.querySelector(`#${id} [aria-checked="true"]`) || {}).dataset || {};
      const e = { title: $('#ce-title').value, kind: pick('ce-kind').v, date: $('#ce-date').value, time: $('#ce-time').value, dur: $('#ce-dur').value, repeat: pick('ce-repeat').v, days: [...side.querySelectorAll('[data-wd][aria-pressed="true"]')].map(b => Number(b.dataset.wd)), until: $('#ce-until').value, who: $('#ce-who').value, notes: $('#ce-notes').value, skip: editing.skip || [] };
      const msg = $('#ce-msg');
      if (!e.title.trim()) { msg.textContent = 'Say what it is first, such as “Piano lesson”.'; $('#ce-title').focus(); return; }
      if (!isDay(e.date)) { msg.textContent = 'Choose a day.'; $('#ce-date').focus(); return; }
      if (e.repeat === 'weekly' && !e.days.length) { msg.textContent = 'Choose at least one day of the week.'; return; }
      const id = save(editing.id || null, e), saved = events().find(x => x.id === id);
      if (V.toast) V.toast(editing.id ? 'Saved.' : `${e.title.trim()} is on the calendar.`);
      editing = null; sel = saved ? firstDay(saved) : e.date;
      if (ymOf(sel) !== ym) { location.hash = '#/calendar/' + ymOf(sel); return; }
      page(root, ym);
    }
  }

  window.CALENDAR = { page, events, save, remove, occurs, on, known, ics, vevent, grid, firstDay };
})();
