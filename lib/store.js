/* Everything the site remembers lives in one localStorage key. Nothing is sent anywhere. */
'use strict';
(function () {
  const KEY = 'procademy.v1';
  const SECRET = [];                     // profile fields that must never enter a backup (none yet)
  const blank = () => ({
    v: 1,
    profile: { name: '', theme: 'system', textSize: 'normal', enrolled: [] },   // Home adds: restDay (0 Sunday to 6, or null), busy { day, goal }, homework { what, due, book, lesson }, homeLayout { order, hidden, compact }, lastSet { key, packed }, courseSeen, wlDraft, langAsked, firstWeekDone, parentNote.reply
    points: 0,
    skills: {},                          // id → { level, tries, right, sets, last, ivl, due } (due: 'YYYY-MM-DD' of the next review)
    days: {},                            // 'YYYY-MM-DD' → { q, right, pts, sec } (sec: about how long was spent answering)
    log: [],                             // newest first, capped
    missed: [],                          // { skill, seed, t }, capped
    recent: [],                          // skill ids, most recent first
    mistakes: {},                        // kind of slip → { n, skills: { id: count } } (see COACH.diagnose)
    badges: {},                          // badge id → when it was earned (see BADGES)
    flags: {},                           // moments some badges need: steps, grapher, tutor, challenge → when
    words: {},                           // math word id → { ivl, due, seen, right } (flashcards, see VOCAB)
    notes: {},                           // skill id → { text, t }: the learner's own notes on a lesson
    savers: { n: 0, mark: 0, used: {} },  // streak savers: how many are held, the streak length last rewarded, days a saver kept
  });

  let state = null;
  let memory = null;                     // in tests: a fake storage so real data is untouched
  let memLimit = 0;                      // tests: how many characters the fake storage holds before it's full (0: no limit)
  let lastAnswer = 0;                    // when the last answer was counted, for the time spent
  const BACKUPS = 'procademy.backup.v1', WEEK = 7 * 864e5;
  const DAMAGED = 'procademy.damaged.v1';          // progress that couldn't be read, kept as it was in case it can be mended

  /** this device's storage, or the tests' stand-in for it; set() throws when there's no room, as localStorage does */
  const raw = {
    get(k) { try { return memory ? (memory.has(k) ? memory.get(k) : null) : localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) {
      if (!memory) { localStorage.setItem(k, v); return; }
      if (memLimit && [...memory].reduce((n, [x, y]) => n + (x === k ? 0 : x.length + y.length), 0) + k.length + v.length > memLimit) { const e = new Error('The storage is full'); e.name = 'QuotaExceededError'; throw e; }
      memory.set(k, v);
    },
    remove(k) { try { if (memory) memory.delete(k); else localStorage.removeItem(k); } catch (e) { /* fine */ } },
    keys() { try { return memory ? [...memory.keys()] : Object.keys(localStorage); } catch (e) { return []; } },
  };

  /* ---------- a full storage: room is made from what can be rebuilt, then from the older copies, and the page is
     told (STORE.onFull) so it can say so; progress carries on in memory meanwhile ---------- */
  const fullFns = new Set();
  let fullSince = 0;                     // when saving last failed for lack of room (0: saving works)
  const tellFull = on => fullFns.forEach(fn => { try { fn(on); } catch (e) { /* a listener's problem stays its own */ } });
  /** what Procademy can do without (it rebuilds them, or they only help find a problem) */
  const SPARE = [DAMAGED, 'procademy.problems.v1', 'procademy.tutorcache.v1', 'procademy.speed.v1', 'procademy.recentpages.v1'];
  const spareKeys = () => raw.keys().filter(k => SPARE.some(s => k === s || k.startsWith(s + '.')));
  const storage = {
    get() { return raw.get(KEY); },
    /** keep the progress; false when there was no room even after making some */
    set(v) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          raw.set(KEY, v);
          if (fullSince) { fullSince = 0; tellFull(false); }
          return true;
        } catch (e) {
          if (attempt === 0) spareKeys().forEach(raw.remove);                     // first what can be rebuilt,
          else if (attempt === 1) bset(bget().slice(0, 1));                        // then the older copy,
          else if (attempt === 2) raw.remove(BACKUPS);                             // and last the newest copy: today's progress matters more
        }
      }
      if (!fullSince) { fullSince = Date.now(); tellFull(true); }
      return false;
    },
  };

  /* ---------- progress that can't be read (a save cut short, a damaged browser profile): Procademy goes back to the
     newest copy kept on this device, and keeps the damaged text aside ---------- */
  let recovered = null;                  // { from: when the copy used was made (0: there was none), at } after a recovery
  function recover(text) {
    try { raw.set(DAMAGED, JSON.stringify({ t: Date.now(), text: String(text).slice(0, 3e6) })); } catch (e) { /* no room for it */ }
    for (const b of bget()) {
      try { const d = JSON.parse(b.data); if (d && typeof d === 'object' && !Array.isArray(d)) { recovered = { from: b.t, at: Date.now() }; return d; } } catch (e) { /* that copy is damaged too */ }
    }
    recovered = { from: 0, at: Date.now() };
    return null;
  }

  function load() {
    if (state) return state;
    const text = storage.get();
    let parsed = null, damaged = false;
    if (text != null && text !== '' && text !== 'null') {
      try { parsed = JSON.parse(text); } catch (e) { damaged = true; }
      if (!damaged && (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))) damaged = true;
    }
    if (damaged) parsed = recover(text);
    state = migrate(parsed);
    if (damaged) { quiet = true; try { save(); } finally { quiet = false; } }          // the mended progress is the one kept from now on
    return state;
  }
  function migrate(s) {
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    const out = Object.assign(b, s);
    out.profile = Object.assign(b.profile, s.profile || {});
    delete out.profile.pin;                // a PIN lock was tried for a day (2026-11-08) and taken out
    ['skills', 'days', 'mistakes', 'badges', 'flags', 'words', 'notes'].forEach(k => { if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {}; });
    ['log', 'missed', 'recent'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
    if (!Array.isArray(out.profile.enrolled)) out.profile.enrolled = [];
    if (typeof out.points !== 'number') out.points = 0;
    const sv = out.savers && typeof out.savers === 'object' ? out.savers : {};
    out.savers = { n: Math.max(0, Math.min(2, Number(sv.n) || 0)), mark: Math.max(0, Number(sv.mark) || 0), used: sv.used && typeof sv.used === 'object' && !Array.isArray(sv.used) ? sv.used : {} };
    return out;
  }
  /** listeners told after every save (the account sync pushes changes with them) */
  const listeners = new Set();
  let quiet = false;
  function save() { const st = load(); st.saved = Date.now(); const text = JSON.stringify(st); storage.set(text); weekly(st, text); if (!quiet) listeners.forEach(fn => { try { fn(state); } catch (e) { /* a listener's problem stays its own */ } }); }

  /* ---------- copies kept on this device: one a week, the newest two, to go back to if something goes wrong ---------- */
  const bget = () => { try { const v = JSON.parse(raw.get(BACKUPS) || '[]'); return Array.isArray(v) ? v.filter(b => b && b.t && typeof b.data === 'string') : []; } catch (e) { return []; } };
  const bset = list => { try { raw.set(BACKUPS, JSON.stringify(list)); return true; } catch (e) { return false; } };
  let newestCopy = null;                 // when the newest copy was made (read once)
  function weekly(st, text) {
    if (newestCopy == null) { const l = bget(); newestCopy = l.length ? l[0].t : 0; }
    if (Date.now() - newestCopy < WEEK || !Object.values(st.days).some(d => d.q) || fullSince) return;
    copyNow(text);
  }
  function copyNow(text) {
    const list = [{ t: Date.now(), data: text || JSON.stringify(load()) }].concat(bget()).slice(0, 2);
    if (!bset(list)) bset(list.slice(0, 1));          // storage nearly full: keep the newest only
    newestCopy = list[0].t;
  }

  /** the learner's weekly rest day (profile.restDay, 0 Sunday to 6 Saturday): a day without practice that doesn't
      break the streak, nor count toward it */
  const restOf = s => { const r = s.profile.restDay; return r == null || r === '' || isNaN(Number(r)) ? () => false : d => new Date(d + 'T12:00').getDay() === Number(r); };
  const today = (d) => {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const dayShift = (iso, delta) => { const [y, m, d] = iso.split('-').map(Number); return today(new Date(y, m - 1, d + delta)); };

  const STORE = {
    KEY, today, dayShift,
    get() { return load(); },
    save,
    skill(id) { const s = load(); return s.skills[id] || { level: 0, tries: 0, right: 0, sets: 0, last: 0 }; },
    setSkill(id, data) { const s = load(); s.skills[id] = Object.assign(STORE.skill(id), data); save(); },
    addPoints(k) { const s = load(); s.points += k; const d = s.days[today()] || (s.days[today()] = { q: 0, right: 0, pts: 0 }); d.pts += k; save(); },
    /** an answer: counted for the day, with about how long it took (the time since the last answer, up to 2½
        minutes; the first answer of a sitting counts half a minute) */
    countAnswer(correct) {
      const s = load(), d = s.days[today()] || (s.days[today()] = { q: 0, right: 0, pts: 0 }), now = Date.now(), gap = (now - lastAnswer) / 1000;
      d.q += 1; if (correct) d.right += 1;
      d.sec = (d.sec || 0) + Math.round(lastAnswer && gap > 0 && gap < 600 ? Math.min(gap, 150) : 30);
      lastAnswer = now;
      save();
    },
    /** minutes spent on a day: timed since November 2026, and before that about 36 seconds a question */
    minutes(d) { return !d ? 0 : d.sec != null ? Math.round(d.sec / 60) : Math.round((d.q || 0) * 0.6); },
    /** inside the learner's quiet hours (profile.quiet = { from, to } in hours): no sounds and no nudges */
    quietNow(at) {
      const q = load().profile.quiet;
      if (!q || q.from == null || q.to == null || q.from === q.to) return false;
      const h = (at || new Date()).getHours();
      return q.from < q.to ? h >= q.from && h < q.to : h >= q.from || h < q.to;
    },
    /** the copies kept on this device, newest first: [{ t, size }] */
    copies() { return bget().map(b => ({ t: b.t, size: b.data.length })); },
    copyNow() { copyNow(); },
    /** go back to a copy kept on this device (the one being replaced is kept as the newest copy first) */
    restoreCopy(i) {
      const b = bget()[i];
      if (!b) throw new Error('That copy isn’t here any more.');
      const data = JSON.parse(b.data);
      copyNow();
      state = migrate(data); save();
      return state;
    },
    logEvent(e) { const s = load(); s.log.unshift(Object.assign({ t: Date.now() }, e)); if (s.log.length > 500) s.log.length = 500; save(); },
    /** a slip the coach noticed, counted by kind and skill */
    noteMistake(kind, skillId) {
      const s = load(), m = s.mistakes[kind] || (s.mistakes[kind] = { n: 0, skills: {} });
      m.n += 1; if (skillId) m.skills[skillId] = (m.skills[skillId] || 0) + 1;
      save();
    },
    setWord(id, data) { const s = load(); s.words[id] = Object.assign({}, s.words[id], data); save(); },
    /** a note on a skill's lesson (empty text removes it) */
    setNote(id, text) { const s = load(); text = String(text || '').slice(0, 4000); s.notes[id] = { text: text.trim() ? text : '', t: Date.now() }; save(); },   // an empty note is a deletion, so the newer one wins when two computers merge
    note(id) { const n = load().notes[id]; return n ? n.text : ''; },
    earnBadges(ids) { const s = load(); ids.forEach(id => { if (!s.badges[id]) s.badges[id] = Date.now(); }); save(); },
    setFlag(k) { const s = load(); if (!s.flags[k]) { s.flags[k] = Date.now(); save(); } },
    /** today's practice was done (counted, so a second round shows too) */
    markDaily() { const s = load(); const d = s.days[today()] || (s.days[today()] = { q: 0, right: 0, pts: 0 }); d.daily = (d.daily || 0) + 1; save(); },
    touchRecent(skillId) { const s = load(); s.recent = [skillId].concat(s.recent.filter(x => x !== skillId)).slice(0, 12); save(); },
    /** a question to review later; slip is the kind of mistake the coach saw in it (sign, flip, …), if any */
    addMissed(skillId, seed, slip) {
      const s = load(), m = s.missed.find(x => x.skill === skillId && x.seed === seed);
      if (m) { if (slip && m.slip !== slip) { m.slip = slip; save(); } return; }
      s.missed.unshift(Object.assign({ skill: skillId, seed, t: Date.now() }, slip ? { slip } : {})); if (s.missed.length > 200) s.missed.length = 200; save();
    },
    clearMissed(skillId, seed) { const s = load(); s.missed = s.missed.filter(m => !(m.skill === skillId && m.seed === seed)); save(); },
    enroll(courseId, on) {
      const s = load();
      s.profile.enrolled = s.profile.enrolled.filter(c => c !== courseId);
      if (on) s.profile.enrolled.unshift(courseId);
      save();
    },
    /** put saved courses in a new order (ids not given keep their place at the end) */
    reorderEnrolled(ids) {
      const s = load(), have = s.profile.enrolled;
      const first = (ids || []).filter((id, i, a) => have.includes(id) && a.indexOf(id) === i);
      s.profile.enrolled = first.concat(have.filter(id => !first.includes(id)));
      save();
    },
    setProfile(patch) { const s = load(); Object.assign(s.profile, patch); save(); },
    /** consecutive days of practice ending today (or yesterday, when today is still open) */
    /** days practiced in a row, up to today (or yesterday, before today's practice); a day a streak saver kept
        doesn't count, but doesn't break the streak either */
    streak() {
      const s = load(), used = s.savers.used, did = d => !!(s.days[d] && s.days[d].q), rest = restOf(s);
      let day = today(), count = 0;
      if (!did(day)) { day = dayShift(day, -1); if (!did(day) && !used[day] && !rest(day)) return { days: 0, today: false }; }
      while (did(day) || used[day] || rest(day)) { if (did(day)) count++; day = dayShift(day, -1); }
      return { days: count, today: did(today()) };
    },
    /** streak savers, so one missed day doesn't undo weeks of practice: every 7 days of streak earns one (up to
        2 held); a missed day (or two, with two savers) right before today is kept by savers, if the streak was
        alive before it. Returns what happened: { used: [days kept], earned }. */
    keepStreak() {
      const s = load(), sv = s.savers, did = d => !!(s.days[d] && s.days[d].q), rest = restOf(s), out = { used: [], earned: 0 };
      const gap = [];
      let d = dayShift(today(), -1);
      while (!did(d) && !sv.used[d] && gap.length <= 2) { if (!rest(d)) gap.push(d); d = dayShift(d, -1); }          // a rest day needs no saver
      if (gap.length && gap.length <= sv.n && (did(d) || sv.used[d])) { gap.forEach(x => { sv.used[x] = true; }); sv.n -= gap.length; out.used = gap; }
      const days = STORE.streak().days;
      let changed = out.used.length > 0;
      if (days < sv.mark) { sv.mark = 0; changed = true; }               // a new streak earns savers again
      const step = Math.floor(days / 7) * 7;
      if (step > sv.mark) { out.earned = Math.max(0, Math.min(2 - sv.n, (step - sv.mark) / 7)); sv.n += out.earned; sv.mark = step; changed = true; }
      if (changed) save();
      return out;
    },
    /** a backup: everything but the secret fields */
    exportJSON() {
      const s = JSON.parse(JSON.stringify(load()));
      SECRET.forEach(k => delete s.profile[k]);
      return JSON.stringify({ app: 'procademy', exported: new Date().toISOString(), data: s }, null, 2);
    },
    importJSON(text) {
      const parsed = JSON.parse(text);
      const data = parsed && (parsed.app === 'procademy' || parsed.app === 'academy') && parsed.data ? parsed.data : parsed;
      if (!data || typeof data !== 'object' || !data.skills) throw new Error('That file isn’t a Procademy backup. Choose a file made with Save a copy (its name starts with procademy-backup).');
      const keep = {};
      SECRET.forEach(k => { keep[k] = load().profile[k]; });
      state = migrate(data);
      Object.assign(state.profile, keep);
      save();
      return state;
    },
    reset() { state = blank(); save(); },
    /** be told after every save */
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /** replace everything with another state (an account's progress); quiet: don't tell the listeners */
    replace(data, opts) { state = migrate(JSON.parse(JSON.stringify(data))); quiet = !!(opts && opts.quiet); try { save(); } finally { quiet = false; } return state; },
    blank,
    migrate,
    /** a time limit (ms) as the learner wants it (profile.timeLimits): more time, twice as long, or none (0) */
    timeLimit(ms) {
      ms = Number(ms) || 0;
      const k = load().profile.timeLimits;
      return !ms || k === 'off' ? 0 : Math.round(ms * (k === 'more' ? 1.5 : k === 'double' ? 2 : 1));
    },
    /** after progress couldn't be read: { from: when the copy gone back to was made (0: none), at }, else null */
    recovered: () => recovered,
    /** the progress that couldn't be read, as it was: { t, text }, or null */
    damaged() { try { const d = JSON.parse(raw.get(DAMAGED) || 'null'); return d && typeof d.text === 'string' ? d : null; } catch (e) { return null; } },
    /** told true when progress can't be saved for lack of room, and false once it can again */
    onFull(fn) { fullFns.add(fn); return () => fullFns.delete(fn); },
    isFull: () => !!fullSince,
    /** what Procademy keeps on this device, biggest first: [{ label, size (characters), spare }] (spare: it can go) */
    usage() {
      const kinds = [[k => k === KEY, 'Your progress'], [k => k === BACKUPS, 'Copies kept on this device'], [k => k === 'procademy.chats.v1' || k.startsWith('procademy.chats.v1.'), 'Tutor chats'],
        [k => k.startsWith('procademy.learner.') || k === 'procademy.learners.v1', 'Other learners on this device'], [k => k.startsWith('procademy.drawings.v1'), 'Your drawings'],
        [k => SPARE.some(s => k === s || k.startsWith(s + '.')), 'Things Procademy can rebuild']];
      const out = new Map();
      raw.keys().filter(k => /^procademy/.test(k)).forEach(k => {
        const kind = kinds.find(([t]) => t(k)), label = kind ? kind[1] : 'Everything else';
        out.set(label, (out.get(label) || 0) + k.length + (raw.get(k) || '').length);
      });
      return [...out].map(([label, size]) => ({ label, size, spare: label === 'Things Procademy can rebuild' })).sort((a, b) => b.size - a.size);
    },
    /** remove what Procademy can rebuild (never progress, copies, chats or drawings); returns the characters freed */
    freeUp() {
      let n = 0;
      spareKeys().forEach(k => { n += k.length + (raw.get(k) || '').length; raw.remove(k); });
      if (fullSince) save();
      return n;
    },
    /** tests call this so they never touch the real data; opts.seed: { key: text } to start with, opts.limit: how
        many characters fit before the stand-in storage is full */
    useMemory(on, opts) { memory = on ? new Map(Object.entries((opts && opts.seed) || {})) : null; memLimit = (on && opts && opts.limit) || 0; state = null; newestCopy = null; lastAnswer = 0; recovered = null; if (fullSince) { fullSince = 0; tellFull(false); } },
  };

  if (typeof module !== 'undefined') module.exports = STORE;
  if (typeof window !== 'undefined') window.STORE = STORE;
})();
