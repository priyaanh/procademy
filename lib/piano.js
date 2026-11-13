/* Piano helpers (Tools cards): a practice log (#/piano), a metronome (#/metronome) and note-reading flashcards
   (#/piano/cards). The log keeps minutes, pieces and a short note for each day, with a week view, a streak, a
   timer, and the week as text to send a teacher. The metronome is scheduled ahead on the audio clock (Web Audio),
   so it never drifts: a short loop puts each click a fraction of a second ahead on the sound card's own clock,
   and the lit beat follows that clock too. Tempo, beats per measure, an accent, subdivisions, tap tempo and the
   Italian tempo word; it's all synthesized, so it works offline. The flashcards show a note on the treble or bass
   staff (lines and spaces, or ledger lines too), answered with its letter or with the exact piano key; notes
   missed come back sooner (boxes 0–4), and each round ends with what to practice.
   Kept per learner in profile.piano = { log: { day: { min, pieces, note, t } }, cards: { id: { box, right, miss, t } },
   goal }, so they travel with an account (merged entry by entry, the newer edit winning: lib/account.js). An
   empty entry is a removal. The metronome's settings are a tool preference on this device. Also here: the Play
   buttons in the music theory lessons (.mus-play). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V && V._h, M = window.M;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pref = (tool, patch) => (V.tools && V.tools.pref ? V.tools.pref(tool, patch) : {});
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  /* ---------- what's kept: profile.piano ---------- */
  const kept = () => { const p = S.get().profile.piano; return p && typeof p === 'object' && !Array.isArray(p) ? JSON.parse(JSON.stringify(p)) : {}; };
  const put = p => S.setProfile({ piano: p });
  const logOf = p => (p.log && typeof p.log === 'object' ? p.log : {});
  /** the days with practice: { day: { min, pieces, note, t } } (empty entries, which record a removal, left out) */
  function log() { const L = logOf(kept()), out = {}; Object.keys(L).forEach(d => { const e = L[d]; if (e && (e.min > 0 || (e.pieces || []).length || e.note)) out[d] = e; }); return out; }
  const goal = () => { const g = Number(kept().goal); return g >= 5 && g <= 240 ? g : 20; };
  const cleanPieces = list => [...new Set((Array.isArray(list) ? list : String(list || '').split(/[,\n]/)).map(x => String(x).trim().replace(/\s+/g, ' ').slice(0, 60)).filter(Boolean))].slice(0, 8);
  /** save a day's practice (minutes 0–600, pieces, a note); an empty one removes the day */
  function save(day, entry) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
    const p = kept(), L = logOf(p), min = Math.max(0, Math.min(600, Math.round(Number(entry.min) || 0)));
    L[day] = { min, pieces: cleanPieces(entry.pieces), note: String(entry.note || '').trim().slice(0, 300), t: Date.now() };
    p.log = L;
    put(p);
    return true;
  }
  /** add minutes to a day, keeping its pieces and note */
  function addMinutes(day, min) { const e = log()[day] || { min: 0, pieces: [], note: '' }; return save(day, { min: (e.min || 0) + min, pieces: e.pieces, note: e.note }); }
  const monday = day => S.dayShift(day, -((new Date(day + 'T12:00').getDay() + 6) % 7));
  /** a week from Monday: the days, minutes, the total, days practiced and the pieces */
  function week(day) {
    const start = monday(day || S.today()), L = log(), days = [0, 1, 2, 3, 4, 5, 6].map(k => S.dayShift(start, k));
    const mins = days.map(d => (L[d] ? L[d].min || 0 : 0)), pieces = [];
    days.forEach(d => (L[d] ? L[d].pieces || [] : []).forEach(x => { if (!pieces.includes(x)) pieces.push(x); }));
    return { start, days, mins, total: mins.reduce((a, b) => a + b, 0), practiced: mins.filter(m => m > 0).length, pieces };
  }
  /** days in a row with practice, up to today (or yesterday, while today is still open) */
  function streak() {
    const L = log(), did = d => !!(L[d] && L[d].min > 0);
    let d = S.today(), n = 0;
    if (!did(d)) d = S.dayShift(d, -1);
    while (did(d)) { n++; d = S.dayShift(d, -1); }
    return n;
  }
  const recentPieces = () => { const L = log(), out = []; Object.keys(L).sort().reverse().forEach(d => (L[d].pieces || []).forEach(x => { if (!out.includes(x)) out.push(x); })); return out.slice(0, 10); };
  const dayName = (d, opts) => new Date(d + 'T12:00').toLocaleDateString('en-US', opts || { weekday: 'short', month: 'short', day: 'numeric' });
  const plural = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
  /** the week as plain text, for a teacher */
  function weekText(day) {
    const w = week(day), L = log();
    const lines = w.days.filter(d => L[d] && L[d].min > 0).map(d => `${dayName(d)}: ${L[d].min} min${(L[d].pieces || []).length ? ' (' + L[d].pieces.join(', ') + ')' : ''}${L[d].note ? '. ' + L[d].note : ''}`);
    return `Piano practice, week of ${dayName(w.start, { month: 'long', day: 'numeric' })}: ${w.total} minutes on ${plural(w.practiced, 'day')}.\n` + (lines.length ? lines.join('\n') : 'No practice logged yet.');
  }

  /* ---------- sound: a soft piano-like tone and the metronome's click, made on the spot ---------- */
  let ctx = null;
  function audio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC && !ctx) return null;
    if (!ctx) { try { ctx = new AC(); } catch (e) { ctx = null; } }          // made on a tap, so a phone lets it play
    if (ctx && ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
    return ctx;
  }
  /** a note: midi number, start time on the audio clock, length in seconds */
  function tone(midi, when, dur, vol) {
    const c = audio(); if (!c) return false;
    const f = 440 * Math.pow(2, (midi - 69) / 12), t = when || c.currentTime, g = c.createGain(), o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain();
    o1.type = 'triangle'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = 0.25;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.9));
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(c.destination);
    o1.start(t); o2.start(t); o1.stop(t + (dur || 0.9) + 0.05); o2.stop(t + (dur || 0.9) + 0.05);
    return true;
  }
  /** play notes one after another (or together) */
  function playNotes(midis, together) {
    const c = audio(); if (!c) return false;
    const t0 = c.currentTime + 0.05;
    midis.forEach((m, i) => tone(m, together ? t0 : t0 + i * 0.42, together ? 1.6 : 0.6, together ? 0.18 : 0.3));
    return true;
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('.mus-play'); if (!b) return; ev.preventDefault(); playNotes(String(b.dataset.midi || '').split(',').map(Number).filter(x => x > 20 && x < 110), !!b.dataset.together); });
    // Enter on a Play button plays it; it doesn't also check the answer in the practice player
    document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.closest && ev.target.closest('.mus-play')) ev.stopPropagation(); }, true);
  }

  /* ---------- the tabs shared by the three pages ---------- */
  const TABS = [['#/piano', 'Practice log'], ['#/metronome', 'Metronome'], ['#/piano/cards', 'Note cards']];
  const tabs = here => `<nav class="tabs pn-tabs" aria-label="Piano tools">${TABS.map(([h, l]) => `<a class="tab${h === here ? ' on' : ''}" href="${h}"${h === here ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

  /* ---------- the practice log (#/piano) ---------- */
  let timer = null, logTick = 0;          // timer: { start } while the practice timer runs (also kept as a tool preference, so it survives leaving the page)
  const clock = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  function weekBars(w) {
    const g = goal(), top = Math.max(g * 1.4, ...w.mins, 10), Y = m => 150 - m / top * 120, today = S.today();
    const bars = w.days.map((d, i) => { const x = 18 + i * 52, m = w.mins[i], h = 150 - Y(m); return `<rect x="${x}" y="${Y(m).toFixed(1)}" width="34" height="${Math.max(h, m ? 3 : 0).toFixed(1)}" rx="5" fill="var(--primary)"${m ? '' : ' opacity=".3"'}/>${m ? `<text x="${x + 17}" y="${(Y(m) - 6).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700">${m}</text>` : ''}<text x="${x + 17}" y="170" text-anchor="middle" font-size="12"${d === today ? ' font-weight="800"' : ''}>${dayName(d, { weekday: 'short' })}</text>`; }).join('');
    return `<svg class="figure pn-week" viewBox="0 0 380 178" width="380" role="img" aria-label="minutes practiced each day this week: ${w.mins.join(', ')}; goal ${g} minutes"><path d="M10 150H372" stroke="currentColor" stroke-width="1.5"/><path d="M10 ${Y(g).toFixed(1)}H372" stroke="currentColor" stroke-dasharray="4 4" opacity=".5"/><text x="372" y="${(Y(g) - 5).toFixed(1)}" text-anchor="end" font-size="11">goal ${g} min</text>${bars}</svg>`;
  }
  function logPage(root, opts) {
    opts = opts || {};
    const day = opts.day || S.today(), L = log(), e = L[day] || { min: 0, pieces: [], note: '' }, wk = opts.week || S.today(), w = week(wk), st = streak();
    const tp = pref('pianolog'); if (tp.timer && !timer) timer = { start: tp.timer };
    root.innerHTML = `<div class="pn-page">${tabs('#/piano')}
      <h1>Piano practice log</h1><p class="muted pn-intro">Write down how long you practiced and what you played. A short practice most days beats one long one a week.</p>
      <div class="pn-grid">
        <div class="card pn-form"><h2>${L[day] ? 'Edit' : 'Log'} practice</h2>
          <label class="field"><span class="label">Day</span><input type="date" id="pl-day" value="${day}" max="${S.today()}"></label>
          <div class="field"><label class="label" for="pl-min">Minutes</label><div class="pn-min"><input type="number" id="pl-min" min="0" max="600" step="1" inputmode="numeric" value="${e.min || ''}" placeholder="0"><span class="pn-quick">${[5, 10, 15, 30].map(k => `<button type="button" class="chip-btn" data-add="${k}">+${k}</button>`).join('')}</span></div></div>
          <div class="pn-timer" id="pl-timer"></div>
          <label class="field"><span class="label">Pieces and exercises</span><input type="text" id="pl-pieces" maxlength="400" value="${esc((e.pieces || []).join(', '))}" placeholder="For example: Minuet in G, scales in D major" autocomplete="off"><span class="help">Separate them with commas.</span></label>
          ${recentPieces().length ? `<div class="pn-recent"><span class="small muted">Recent:</span>${recentPieces().map(x => `<button type="button" class="chip-btn" data-piece="${esc(x)}">${esc(x)}</button>`).join('')}</div>` : ''}
          <label class="field"><span class="label">Note <span class="muted small">(optional)</span></span><textarea id="pl-note" rows="2" maxlength="300" placeholder="What went well, or what to work on next time">${esc(e.note || '')}</textarea></label>
          <div class="btn-row"><button type="button" class="btn primary" id="pl-save">${L[day] ? 'Save changes' : 'Save practice'}</button>${L[day] ? '<button type="button" class="btn ghost" id="pl-del">Remove this day</button>' : ''}</div>
          <p class="small muted" id="pl-msg" role="status"></p>
        </div>
        <div class="card pn-weekcard"><div class="row between pn-weekhead"><h2>Week of ${dayName(w.start, { month: 'short', day: 'numeric' })}</h2><span class="seg-sm"><button type="button" data-wk="-7" aria-label="Previous week">‹</button><button type="button" data-wk="7" aria-label="Next week"${w.start >= monday(S.today()) ? ' disabled' : ''}>›</button></span></div>
          ${weekBars(w)}
          <div class="pn-stats"><div><b>${w.total}</b><span>minutes this week</span></div><div><b>${w.practiced}</b><span>days practiced</span></div><div><b>${st}</b><span>day streak</span></div></div>
          ${w.pieces.length ? `<p class="small"><b>Pieces this week:</b> ${w.pieces.map(esc).join(', ')}</p>` : ''}
          <div class="btn-row"><button type="button" class="btn sm" id="pl-copy">Copy the week for a teacher</button><label class="small pn-goal">Daily goal <select id="pl-goal">${[10, 15, 20, 30, 45, 60].map(g => `<option value="${g}"${g === goal() ? ' selected' : ''}>${g} minutes</option>`).join('')}</select></label></div>
        </div>
      </div>
      ${(() => { const days = Object.keys(L).sort().reverse().slice(0, 10); return days.length ? `<div class="card pn-history"><h2>Recent practice</h2><ul class="pn-days">${days.map(d => `<li><span class="pn-d"><b>${dayName(d)}</b><span class="muted small">${L[d].min} min</span></span><span class="pn-what small">${esc((L[d].pieces || []).join(', ') || '')}${L[d].note ? `<span class="muted"> · ${esc(L[d].note)}</span>` : ''}</span><button type="button" class="btn sm ghost" data-edit="${d}">Edit</button></li>`).join('')}</ul></div>` : ''; })()}
      <p class="small muted pn-more">Also: <a href="#/course/music-theory">the music theory course</a> and <a href="#/calendar">the family calendar</a>, which shows your practice days.</p></div>`;
    const $ = sel => root.querySelector(sel), minIn = $('#pl-min'), msg = $('#pl-msg');
    const drawTimer = () => {
      const box = $('#pl-timer'); if (!box) return;
      box.innerHTML = timer ? `<span class="pn-clock" id="pl-clock">${clock(Date.now() - timer.start)}</span><button type="button" class="btn sm primary" id="pl-stop">Stop and add the minutes</button>` : '<button type="button" class="btn sm" id="pl-start">Time my practice</button>';
    };
    drawTimer();
    clearInterval(logTick);
    logTick = setInterval(() => { const c = document.getElementById('pl-clock'); if (!document.getElementById('pl-timer')) { clearInterval(logTick); return; } if (c && timer) c.textContent = clock(Date.now() - timer.start); }, 1000);
    $('.pn-page').addEventListener('click', ev => {
      const t = ev.target.closest('button, [data-add]'); if (!t) return;
      if (t.dataset.add) { minIn.value = Math.min(600, (Number(minIn.value) || 0) + Number(t.dataset.add)); return; }
      if (t.dataset.piece) { const pi = $('#pl-pieces'), have = cleanPieces(pi.value); if (!have.includes(t.dataset.piece)) pi.value = have.concat(t.dataset.piece).join(', '); return; }
      if (t.id === 'pl-start') { timer = { start: Date.now() }; pref('pianolog', { timer: timer.start }); drawTimer(); return; }
      if (t.id === 'pl-stop') { const m = Math.max(1, Math.round((Date.now() - timer.start) / 60000)); timer = null; pref('pianolog', { timer: 0 }); minIn.value = (Number(minIn.value) || 0) + m; drawTimer(); msg.textContent = `${plural(m, 'minute')} added. Select Save to keep them.`; return; }
      if (t.id === 'pl-save') {
        const d = $('#pl-day').value || S.today(), min = Number(minIn.value) || 0, pieces = cleanPieces($('#pl-pieces').value), note = $('#pl-note').value;
        if (!min && !pieces.length && !note.trim()) { msg.textContent = 'Add the minutes you practiced first.'; minIn.focus(); return; }
        save(d, { min, pieces, note });
        if (V.toast) V.toast(min ? `${plural(min, 'minute')} of practice saved.` : 'Saved.');
        logPage(root, { day: d, week: d });
        return;
      }
      if (t.id === 'pl-del') { const d = $('#pl-day').value; save(d, { min: 0, pieces: [], note: '' }); if (V.toast) V.toast('That day is removed from the log.'); logPage(root, { week: d }); return; }
      if (t.dataset.wk) { logPage(root, { day, week: S.dayShift(w.start, Number(t.dataset.wk)) }); return; }
      if (t.dataset.edit) { logPage(root, { day: t.dataset.edit, week: t.dataset.edit }); const f = root.querySelector('#pl-min'); if (f) f.focus(); return; }
      if (t.id === 'pl-copy') {
        const text = weekText(w.start), done = ok => { msg.textContent = ok ? 'The week is copied. Paste it into a message or an email.' : text; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); else done(false);
      }
    });
    $('#pl-day').addEventListener('change', ev => { if (/^\d{4}-\d{2}-\d{2}$/.test(ev.target.value)) logPage(root, { day: ev.target.value, week: ev.target.value }); });
    $('#pl-goal').addEventListener('change', ev => { const p = kept(); p.goal = Number(ev.target.value); put(p); logPage(root, { day, week: w.start }); });
    root.__piano = { day, week: w };
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the piano practice log page.' });
  }

  /* ---------- the metronome (#/metronome) ---------- */
  const TEMPO_WORDS = [[0, 'Largo', 'very slow and broad'], [60, 'Adagio', 'slow'], [76, 'Andante', 'at a walking pace'], [108, 'Moderato', 'at a moderate speed'], [120, 'Allegro', 'fast and lively'], [168, 'Presto', 'very fast']];
  const tempoWord = bpm => TEMPO_WORDS.filter(x => bpm >= x[0]).pop();
  const SUBS = [[1, 'None'], [2, 'Eighths'], [3, 'Triplets'], [4, 'Sixteenths']];
  const MET = { bpm: 96, beats: 4, sub: 1, accent: true, vol: 0.7, running: false, beat: -1, sub_i: 0, nextTime: 0, step: 0, queue: [], loop: 0, raf: 0, started: 0, played: 0 };
  function metLoad() { const p = pref('metronome'); MET.bpm = clampBpm(p.bpm || MET.bpm); MET.beats = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12].includes(p.beats) ? p.beats : MET.beats; MET.sub = [1, 2, 3, 4].includes(p.sub) ? p.sub : MET.sub; MET.accent = p.accent !== false; MET.vol = typeof p.vol === 'number' ? Math.max(0, Math.min(1, p.vol)) : MET.vol; }
  const metSave = () => pref('metronome', { bpm: MET.bpm, beats: MET.beats, sub: MET.sub, accent: MET.accent, vol: MET.vol });
  const clampBpm = b => Math.max(30, Math.min(240, Math.round(Number(b) || 96)));
  /** one click at time t on the audio clock: the first beat higher (if accented), off-beats softer */
  function click(t, kind) {
    const c = ctx, o = c.createOscillator(), g = c.createGain(), f = kind === 'accent' ? 1760 : kind === 'beat' ? 1175 : 880, v = MET.vol * (kind === 'sub' ? 0.35 : kind === 'accent' ? 1 : 0.7);
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * 0.4), t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.06);
  }
  /** schedule every click due before the look-ahead window ends (longer while the page is hidden, when timers slow down) */
  function schedule() {
    const ahead = document.hidden ? 1.5 : 0.12;
    while (MET.nextTime < ctx.currentTime + ahead) {
      const sub = MET.step % MET.sub, beat = Math.floor(MET.step / MET.sub) % MET.beats;
      if (MET.vol > 0) click(MET.nextTime, sub ? 'sub' : beat === 0 && MET.accent && MET.beats > 1 ? 'accent' : 'beat');
      MET.queue.push({ beat, sub, time: MET.nextTime });
      MET.nextTime += 60 / MET.bpm / MET.sub;          // the next click, counted on the audio clock: never from setTimeout
      MET.step++;
    }
  }
  function metStart() {
    if (!audio()) return false;
    metStop(true);
    MET.running = true; MET.step = 0; MET.queue = []; MET.beat = -1; MET.started = Date.now();
    MET.nextTime = ctx.currentTime + 0.08;
    schedule();
    MET.loop = setInterval(schedule, 25);
    const draw = () => {
      if (!MET.running) return;
      while (MET.queue.length && MET.queue[0].time <= ctx.currentTime) { const q = MET.queue.shift(); if (!q.sub) { MET.beat = q.beat; showBeat(); } }
      MET.raf = requestAnimationFrame(draw);
    };
    MET.raf = requestAnimationFrame(draw);
    return true;
  }
  function metStop(quiet) {
    if (MET.running) MET.played += Date.now() - MET.started;
    MET.running = false; clearInterval(MET.loop); cancelAnimationFrame(MET.raf); MET.queue = []; MET.beat = -1;
    if (!quiet) showBeat();
  }
  function showBeat() {
    const dots = document.querySelectorAll('#mt-dots .mt-dot');
    dots.forEach((d, i) => d.classList.toggle('on', i === MET.beat));
    const pulse = document.getElementById('mt-bpm-box'); if (pulse && MET.beat >= 0) { pulse.classList.remove('beat'); void pulse.offsetWidth; pulse.classList.add('beat'); }
  }
  window.addEventListener('hashchange', () => { if (MET.running && !/^#\/metronome/.test(location.hash)) metStop(); });
  let taps = [];
  function metPage(root) {
    metLoad();
    const tw = tempoWord(MET.bpm);
    root.innerHTML = `<div class="pn-page">${tabs('#/metronome')}
      <h1>Metronome</h1><p class="muted pn-intro">A steady beat to practice with. Start slowly, and speed up only when a passage feels easy.</p>
      <div class="pn-grid mt-grid">
        <div class="card mt-main">
          <div class="mt-bpm" id="mt-bpm-box"><button type="button" class="iconbtn mt-step" data-bpm="-1" aria-label="Slower by one">−</button><div class="mt-read"><b id="mt-bpm">${MET.bpm}</b><span>beats per minute</span></div><button type="button" class="iconbtn mt-step" data-bpm="1" aria-label="Faster by one">+</button></div>
          <input type="range" id="mt-slider" min="30" max="240" step="1" value="${MET.bpm}" aria-label="Tempo in beats per minute">
          <p class="mt-word" id="mt-word"><b>${tw[1]}</b> · ${tw[2]}</p>
          <div class="mt-dots" id="mt-dots" aria-hidden="true">${Array.from({ length: MET.beats }, (_, i) => `<span class="mt-dot${i === 0 && MET.accent && MET.beats > 1 ? ' first' : ''}"></span>`).join('')}</div>
          <div class="btn-row mt-go"><button type="button" class="btn primary mt-start" id="mt-start" aria-pressed="${MET.running}">${MET.running ? 'Stop' : 'Start'}</button><button type="button" class="btn" id="mt-tap">Tap the tempo</button></div>
          <p class="small muted mt-keys">Space starts and stops; the arrow keys change the tempo.</p>
          <p class="small" id="mt-log" role="status"></p>
        </div>
        <div class="card mt-side">
          <div class="lab-ctl"><span class="lab-label" id="mt-beats-l">Beats in a measure</span><div class="mt-beats" role="group" aria-labelledby="mt-beats-l"><button type="button" class="iconbtn mt-step sm" data-beats="-1" aria-label="One beat fewer">−</button><b id="mt-beats" aria-live="polite">${MET.beats}</b><button type="button" class="iconbtn mt-step sm" data-beats="1" aria-label="One beat more">+</button><span class="small muted" id="mt-beats-say">${MET.beats === 1 ? 'no measures, just the beat' : `like ${MET.beats}/4 time`}</span></div></div>
          <div class="lab-ctl"><span class="lab-label" id="mt-sub-l">Clicks between beats</span><div class="seg" role="radiogroup" aria-labelledby="mt-sub-l" id="mt-sub">${SUBS.map(([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${v === MET.sub}">${l}</button>`).join('')}</div></div>
          <label class="lab-check"><input type="checkbox" id="mt-accent"${MET.accent ? ' checked' : ''}> Stress the first beat of each measure</label>
          <div class="lab-ctl"><label for="mt-vol"><span>Volume</span></label><input type="range" id="mt-vol" min="0" max="1" step="0.05" value="${MET.vol}"></div>
          <details class="lab-notice"><summary>Tempo words</summary><ul class="small mt-words">${TEMPO_WORDS.map(([b, w, m], i) => `<li><b>${w}</b>: ${m} <span class="muted">(${i ? `from ${b}` : 'below 60'})</span></li>`).join('')}</ul><p class="tiny muted">Ranges vary a little from book to book.</p></details>
        </div>
      </div></div>`;
    const $ = s => root.querySelector(s), slider = $('#mt-slider');
    const setBpm = b => { MET.bpm = clampBpm(b); $('#mt-bpm').textContent = MET.bpm; slider.value = MET.bpm; const w = tempoWord(MET.bpm); $('#mt-word').innerHTML = `<b>${w[1]}</b> · ${w[2]}`; metSave(); };
    const dots = () => { $('#mt-dots').innerHTML = Array.from({ length: MET.beats }, (_, i) => `<span class="mt-dot${i === 0 && MET.accent && MET.beats > 1 ? ' first' : ''}"></span>`).join(''); };
    const toggle = () => {
      if (MET.running) { metStop(); const m = Math.round(MET.played / 60000); if (m >= 1) $('#mt-log').innerHTML = `You practiced with the metronome for ${plural(m, 'minute')}. <button type="button" class="link-btn" id="mt-add">Add to today’s practice log</button>`; }
      else if (!metStart()) { $('#mt-log').textContent = 'This browser can’t play sound, so the metronome can’t run here.'; return; }
      const b = $('#mt-start'); b.textContent = MET.running ? 'Stop' : 'Start'; b.setAttribute('aria-pressed', String(MET.running));
    };
    $('#mt-start').addEventListener('click', toggle);
    slider.addEventListener('input', () => setBpm(slider.value));
    root.querySelectorAll('[data-bpm]').forEach(b => b.addEventListener('click', () => setBpm(MET.bpm + Number(b.dataset.bpm))));
    $('#mt-tap').addEventListener('click', () => {
      const now = performance.now();
      taps = taps.filter(t => now - t < 2500).concat(now).slice(-5);
      if (taps.length >= 2) { const gaps = taps.slice(1).map((t, i) => t - taps[i]); setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length)); }
    });
    const pick = (id, fn) => $('#' + id).addEventListener('click', ev => { const r = ev.target.closest('[role="radio"]'); if (!r) return; $('#' + id).querySelectorAll('[role="radio"]').forEach(x => x.setAttribute('aria-checked', String(x === r))); fn(Number(r.dataset.v)); });
    root.querySelectorAll('[data-beats]').forEach(b => b.addEventListener('click', () => { MET.beats = Math.max(1, Math.min(12, MET.beats + Number(b.dataset.beats))); $('#mt-beats').textContent = MET.beats; $('#mt-beats-say').textContent = MET.beats === 1 ? 'no measures, just the beat' : `like ${MET.beats}/4 time`; dots(); metSave(); }));
    pick('mt-sub', v => { MET.sub = v; if (MET.running) { MET.step = Math.ceil(MET.step / MET.sub) * MET.sub; } metSave(); });
    $('#mt-accent').addEventListener('change', ev => { MET.accent = ev.target.checked; dots(); metSave(); });
    $('#mt-vol').addEventListener('input', ev => { MET.vol = Number(ev.target.value); metSave(); });
    $('#mt-log').addEventListener('click', ev => { if (ev.target.id !== 'mt-add') return; const m = Math.round(MET.played / 60000); addMinutes(S.today(), m); MET.played = 0; $('#mt-log').innerHTML = `${plural(m, 'minute')} added to today’s log. <a href="#/piano">See the practice log</a>`; });
    if (!root.__mtKeys) {
      root.__mtKeys = true;
      document.addEventListener('keydown', ev => {
        if (!/^#\/metronome/.test(location.hash) || ev.ctrlKey || ev.metaKey || ev.altKey) return;
        const el = document.activeElement, typing = el && ((/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && el.type !== 'range') || el.isContentEditable);
        if (typing || el && el.tagName === 'BUTTON' && ev.key === ' ') return;
        const m = document.getElementById('main');
        if (ev.key === ' ' && m.querySelector('#mt-start')) { ev.preventDefault(); m.querySelector('#mt-start').click(); }
        if (/^Arrow(Up|Down|Left|Right)$/.test(ev.key) && el && el.type !== 'range' && m.querySelector('#mt-slider')) { ev.preventDefault(); const s = m.querySelector('#mt-slider'); s.value = clampBpm(Number(s.value) + (ev.key === 'ArrowUp' || ev.key === 'ArrowRight' ? 1 : -1)); s.dispatchEvent(new Event('input')); }
      });
    }
    if (MET.running) showBeat();
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the metronome page.' });
  }

  /* ---------- note-reading flashcards (#/piano/cards) ---------- */
  // where notes can be: q counts lines and spaces up from the bottom line (as in content/music.js)
  const RANGES = { staff: [-1, 9], ledger: [-5, 13] };
  const BASE = { treble: 30, bass: 18 };
  const noteOf = (clef, q) => { const d = BASE[clef] + q; return { L: d % 7, acc: 0, oct: Math.floor(d / 7) }; };
  const midiOf = n => 12 * (n.oct + 1) + [0, 2, 4, 5, 7, 9, 11][n.L];
  const cardId = (clef, q) => `${clef}:${q}`;
  function deck(opts) {
    const clefs = opts.clef === 'both' ? ['treble', 'bass'] : [opts.clef], [lo, hi] = RANGES[opts.range] || RANGES.staff, out = [];
    clefs.forEach(c => { for (let q = lo; q <= hi; q++) out.push({ clef: c, q, id: cardId(c, q) }); });
    return out;
  }
  const cardsKept = () => { const c = kept().cards; return c && typeof c === 'object' ? c : {}; };
  function mark(id, right) {
    const p = kept(), c = p.cards && typeof p.cards === 'object' ? p.cards : {}, e = c[id] || { box: 0, right: 0, miss: 0 };
    c[id] = { box: right ? Math.min(4, (e.box || 0) + 1) : 0, right: (e.right || 0) + (right ? 1 : 0), miss: (e.miss || 0) + (right ? 0 : 1), t: Date.now() };
    p.cards = c; put(p);
  }
  /** the next card: lower boxes much more often, never the same note twice in a row */
  function nextCard(list, last, rnd) {
    const c = cardsKept(), pool = list.filter(x => !last || x.id !== last.id || list.length < 2), w = pool.map(x => [5, 3, 2, 1.2, 0.7][(c[x.id] || {}).box || 0]);
    let r = (rnd || Math.random)() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
  /** an interactive keyboard: white and black keys from midi `from` to `to`; each key a button-like rect with data-m */
  function keys(from, to) {
    const WK = 20, WH = 82, BK = 12, BH = 52, whites = [], blacks = [];
    let wi = 0;
    for (let m = from; m <= to; m++) { if ([1, 3, 6, 8, 10].includes(m % 12)) blacks.push({ m, x: wi * WK - BK / 2 }); else { whites.push({ m, x: wi * WK }); wi++; } }
    const name = m => `${LETTERS[[0, 2, 4, 5, 7, 9, 11].indexOf(m % 12)]}${Math.floor(m / 12) - 1}`;
    return `<svg class="pn-keys" viewBox="0 0 ${wi * WK + 2} ${WH + 16}" role="group" aria-label="piano keys">${whites.map(k => `<rect class="pk-w" x="${k.x + 1}" y="1" width="${WK}" height="${WH}" rx="3" data-m="${k.m}" tabindex="0" role="button" aria-label="${name(k.m)}"/>`).join('')}${blacks.map(k => `<rect class="pk-b" x="${k.x + 1}" y="1" width="${BK}" height="${BH}" rx="2" data-m="${k.m}"/>`).join('')}${whites.filter(k => k.m % 12 === 0).map(k => `<text x="${k.x + 1 + WK / 2}" y="${WH + 13}" text-anchor="middle" font-size="10">${name(k.m)}</text>`).join('')}</svg>`;
  }
  const KEY_SPAN = { treble: [55, 86], bass: [33, 65], both: [33, 86] };          // G3 to D6, A1 to F4: every note the cards can show
  const HINT = { treble: 'Treble lines: E, G, B, D, F. Spaces: F, A, C, E.', bass: 'Bass lines: G, B, D, F, A. Spaces: A, C, E, G.' };
  let cardOpts = null;
  function cardsPage(root) {
    const p = pref('notecards');
    cardOpts = cardOpts || { clef: ['treble', 'bass', 'both'].includes(p.clef) ? p.clef : 'treble', range: p.range === 'ledger' ? 'ledger' : 'staff', answer: p.answer === 'keys' ? 'keys' : 'letters', n: [10, 20, 30].includes(p.n) ? p.n : 10 };
    const o = cardOpts, c = cardsKept(), d = deck(o), known = d.filter(x => (c[x.id] || {}).box >= 3).length;
    const segH = (id, label, list, on) => `<div class="lab-ctl"><span class="lab-label" id="nc-${id}-l">${label}</span><div class="seg" role="radiogroup" aria-labelledby="nc-${id}-l" data-k="${id}">${list.map(([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(on)}">${l}</button>`).join('')}</div></div>`;
    root.innerHTML = `<div class="pn-page">${tabs('#/piano/cards')}
      <h1>Note flashcards</h1><p class="muted pn-intro">A note appears on the staff: name it, or find its key on the piano. Notes you miss come back sooner.</p>
      <div class="pn-grid">
        <div class="card nc-setup">${segH('clef', 'Staff', [['treble', 'Treble'], ['bass', 'Bass'], ['both', 'Both']], o.clef)}${segH('range', 'Notes', [['staff', 'On the staff'], ['ledger', 'With ledger lines']], o.range)}${segH('answer', 'Answer with', [['letters', 'The letter'], ['keys', 'The piano key']], o.answer)}${segH('n', 'How many', [[10, '10'], [20, '20'], [30, '30']], o.n)}
          <div class="btn-row"><button type="button" class="btn primary" id="nc-go">Start</button></div></div>
        <div class="card nc-know"><h2>Notes you know</h2><p class="small muted">${known} of ${d.length} notes in this set are well known (right several times in a row).</p>
          <div class="nc-grid">${d.map(x => { const b = (c[x.id] || {}).box || 0, n = noteOf(x.clef, x.q); return `<span class="nc-cell b${b}" title="${x.clef} ${LETTERS[n.L]}${n.oct}: ${['new', 'just started', 'getting there', 'known', 'well known'][b]}">${LETTERS[n.L]}<sub>${n.oct}</sub></span>`; }).join('')}</div>
          <p class="tiny muted">Darker squares are notes you know better. <a href="#/course/music-theory">Learn to read notes</a> in the music theory course.</p></div>
      </div></div>`;
    root.querySelectorAll('.nc-setup [data-k]').forEach(g => g.addEventListener('click', ev => {
      const r = ev.target.closest('[role="radio"]'); if (!r) return;
      g.querySelectorAll('[role="radio"]').forEach(x => x.setAttribute('aria-checked', String(x === r)));
      o[g.dataset.k] = g.dataset.k === 'n' ? Number(r.dataset.v) : r.dataset.v; pref('notecards', o);
      if (g.dataset.k === 'clef' || g.dataset.k === 'range') cardsPage(root);
    }));
    root.querySelector('#nc-go').addEventListener('click', () => cardsRun(root, o));
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the piano note-reading flashcards page.' });
  }
  let cardKeys = null;
  function cardsRun(root, o) {
    const d = deck(o), missed = new Map(), token = (root.__ncToken = (root.__ncToken || 0) + 1), live = () => root.__ncToken === token && !!document.getElementById('nc-staff');
    let i = 0, right = 0, run = 0, best = 0, cur = null, t0 = Date.now(), answered = false, firstTry = true;
    root.innerHTML = `<div class="pn-page nc-run"><div class="ex-head"><a class="btn sm ghost back" href="#/piano/cards" id="nc-back">← Note flashcards</a><h1>Name the note</h1><span class="stat-pill" id="nc-count"></span></div>
      <div class="card nc-card"><div class="nc-staff" id="nc-staff"></div><p class="nc-say" id="nc-say" aria-live="polite"></p>
        <div class="nc-answers" id="nc-ans">${o.answer === 'keys' ? keys(...KEY_SPAN[o.clef]) : `<div class="nc-letters">${['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => `<button type="button" class="btn nc-l" data-l="${l}">${l}</button>`).join('')}</div>`}</div>
        <div class="btn-row nc-next"><button type="button" class="btn primary" id="nc-next" hidden>Next note</button><button type="button" class="btn sm ghost" id="nc-hear">Hear it</button></div>
        <p class="tiny muted">${o.answer === 'keys' ? 'Tap the key on the piano.' : 'Tap a letter, or press A to G on a keyboard.'}</p></div></div>`;
    const $ = s => root.querySelector(s), say = $('#nc-say'), nextBtn = $('#nc-next');
    const show = () => {
      cur = nextCard(d, cur); answered = false; firstTry = true;
      const n = noteOf(cur.clef, cur.q);
      $('#nc-staff').innerHTML = window.MUSIC ? MUSIC.staff({ clef: cur.clef, notes: [n], label: `a note on the ${cur.clef} staff` }) : '';
      $('#nc-count').textContent = `${i + 1} of ${o.n}`;
      say.textContent = ''; nextBtn.hidden = true;
      root.querySelectorAll('.nc-l, .pk-w').forEach(b => b.classList.remove('right', 'wrong'));
    };
    const answer = (letter, m) => {
      if (answered || !cur) return;
      const n = noteOf(cur.clef, cur.q), ok = m != null ? m === midiOf(n) : letter === LETTERS[n.L], name = `${LETTERS[n.L]}${o.answer === 'keys' ? n.oct : ''}`;
      if (firstTry) mark(cur.id, ok);
      if (ok) {
        answered = true; i++; if (firstTry) { right++; run++; best = Math.max(best, run); }
        tone(midiOf(n), null, 0.7, 0.25);
        say.innerHTML = `✓ <b>${name}</b>${firstTry ? '' : '. Got it on the next try.'}`;
        const el = m != null ? root.querySelector(`.pk-w[data-m="${m}"]`) : root.querySelector(`.nc-l[data-l="${letter}"]`);
        if (el) el.classList.add('right');
        if (i >= o.n) return setTimeout(() => { if (live()) cardsDone(root, o, { right, n: o.n, best, ms: Date.now() - t0, missed }); }, 700);
        setTimeout(() => { if (live()) show(); }, 650);
      } else {
        if (firstTry) { missed.set(cur.id, cur); run = 0; }
        firstTry = false;
        const el = m != null ? root.querySelector(`.pk-w[data-m="${m}"]`) : root.querySelector(`.nc-l[data-l="${letter}"]`); if (el) el.classList.add('wrong');
        say.innerHTML = `Not quite. ${HINT[cur.clef]} Try again.`;
      }
    };
    $('#nc-ans').addEventListener('click', ev => { const b = ev.target.closest('.nc-l'); if (b) return answer(b.dataset.l, null); const k = ev.target.closest('[data-m]'); if (k) answer(null, Number(k.dataset.m)); });
    $('#nc-ans').addEventListener('keydown', ev => { const k = ev.target.closest && ev.target.closest('.pk-w'); if (k && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); answer(null, Number(k.dataset.m)); } });
    $('#nc-hear').addEventListener('click', () => { if (cur) tone(midiOf(noteOf(cur.clef, cur.q)), null, 0.9, 0.3); });
    nextBtn.addEventListener('click', show);
    if (cardKeys) document.removeEventListener('keydown', cardKeys);
    cardKeys = ev => {
      if (!live()) { document.removeEventListener('keydown', cardKeys); cardKeys = null; return; }
      if (o.answer !== 'letters' || ev.ctrlKey || ev.metaKey || ev.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName)) return;
      const l = String(ev.key).toUpperCase();
      if (/^[A-G]$/.test(l)) { ev.preventDefault(); answer(l, null); }
    };
    document.addEventListener('keydown', cardKeys);
    show();
    root.__cards = { answer, current: () => cur, note: () => cur && noteOf(cur.clef, cur.q), midi: () => cur && midiOf(noteOf(cur.clef, cur.q)), state: () => ({ i, right, best }) };
  }
  function cardsDone(root, o, r) {
    const per = r.n ? r.ms / r.n / 1000 : 0, miss = [...r.missed.values()].map(x => { const n = noteOf(x.clef, x.q); return `${LETTERS[n.L]}${n.oct} (${x.clef})`; });
    root.__cards = Object.assign(root.__cards || {}, { done: r });
    root.innerHTML = `<div class="pn-page"><div class="card summary nc-done"><div class="muted small pn-kicker">Note flashcards</div><h1>${r.right >= r.n * 0.9 ? 'Nice reading' : 'Set complete'}</h1>
      <div class="ty-stats"><div><b>${r.right} of ${r.n}</b><span>right the first time</span></div><div><b>${M.n(M.round(per, 1))} s</b><span>a note, on average</span></div><div><b>${r.best}</b><span>in a row, at best</span></div></div>
      ${miss.length ? `<p class="small">Notes to practice: ${miss.map(x => `<b>${esc(x)}</b>`).join(', ')}. They’ll come back sooner next time.</p>` : '<p class="small">Every note right the first time.</p>'}
      <div class="btn-row"><a class="btn" href="#/piano/cards">Change the set</a><button type="button" class="btn primary" id="nc-again">Another round</button></div></div></div>`;
    root.querySelector('#nc-again').addEventListener('click', () => cardsRun(root, o));
    root.querySelector('#nc-again').focus();
  }

  window.PIANO = { log, save, addMinutes, week, streak, weekText, goal, page: logPage, metronome: metPage, cards: cardsPage, cardsRun, MET, metStart, metStop, schedule, tone, playNotes, deck, nextCard, noteOf, midiOf, tempoWord, cleanPieces,
    /** tests: a stand-in audio context (currentTime, createOscillator, createGain, destination) */
    useAudio(c) { ctx = c; } };
})();
