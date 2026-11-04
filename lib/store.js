/* Everything the site remembers lives in one localStorage key. Nothing is sent anywhere. */
'use strict';
(function () {
  const KEY = 'procademy.v1';
  const SECRET = [];                     // profile fields that must never enter a backup (none yet)
  const blank = () => ({
    v: 1,
    profile: { name: '', theme: 'system', textSize: 'normal', enrolled: [] },
    points: 0,
    skills: {},                          // id → { level, tries, right, sets, last, ivl, due } (due: 'YYYY-MM-DD' of the next review)
    days: {},                            // 'YYYY-MM-DD' → { q, right, pts }
    log: [],                             // newest first, capped
    missed: [],                          // { skill, seed, t }, capped
    recent: [],                          // skill ids, most recent first
    mistakes: {},                        // kind of slip → { n, skills: { id: count } } (see COACH.diagnose)
    badges: {},                          // badge id → when it was earned (see BADGES)
    flags: {},                           // moments some badges need: steps, grapher, tutor, challenge → when
    words: {},                           // math word id → { ivl, due, seen, right } (flashcards, see VOCAB)
  });

  let state = null;
  let memory = null;                     // in tests: a fake storage so real data is untouched

  const storage = {
    get() { try { return memory ? memory.get(KEY) : localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { if (memory) memory.set(KEY, v); else localStorage.setItem(KEY, v); } catch (e) { /* storage full or blocked: keep going in memory */ } },
  };

  function load() {
    if (state) return state;
    let parsed = null;
    try { parsed = JSON.parse(storage.get() || 'null'); } catch (e) { parsed = null; }
    state = migrate(parsed);
    return state;
  }
  function migrate(s) {
    const b = blank();
    if (!s || typeof s !== 'object') return b;
    const out = Object.assign(b, s);
    out.profile = Object.assign(b.profile, s.profile || {});
    ['skills', 'days', 'mistakes', 'badges', 'flags', 'words'].forEach(k => { if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {}; });
    ['log', 'missed', 'recent'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
    if (!Array.isArray(out.profile.enrolled)) out.profile.enrolled = [];
    if (typeof out.points !== 'number') out.points = 0;
    return out;
  }
  /** listeners told after every save (the account sync pushes changes with them) */
  const listeners = new Set();
  let quiet = false;
  function save() { const st = load(); st.saved = Date.now(); storage.set(JSON.stringify(st)); if (!quiet) listeners.forEach(fn => { try { fn(state); } catch (e) { /* a listener's problem stays its own */ } }); }

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
    countAnswer(correct) { const s = load(); const d = s.days[today()] || (s.days[today()] = { q: 0, right: 0, pts: 0 }); d.q += 1; if (correct) d.right += 1; save(); },
    logEvent(e) { const s = load(); s.log.unshift(Object.assign({ t: Date.now() }, e)); if (s.log.length > 500) s.log.length = 500; save(); },
    /** a slip the coach noticed, counted by kind and skill */
    noteMistake(kind, skillId) {
      const s = load(), m = s.mistakes[kind] || (s.mistakes[kind] = { n: 0, skills: {} });
      m.n += 1; if (skillId) m.skills[skillId] = (m.skills[skillId] || 0) + 1;
      save();
    },
    setWord(id, data) { const s = load(); s.words[id] = Object.assign({}, s.words[id], data); save(); },
    earnBadges(ids) { const s = load(); ids.forEach(id => { if (!s.badges[id]) s.badges[id] = Date.now(); }); save(); },
    setFlag(k) { const s = load(); if (!s.flags[k]) { s.flags[k] = Date.now(); save(); } },
    /** today's practice was done (counted, so a second round shows too) */
    markDaily() { const s = load(); const d = s.days[today()] || (s.days[today()] = { q: 0, right: 0, pts: 0 }); d.daily = (d.daily || 0) + 1; save(); },
    touchRecent(skillId) { const s = load(); s.recent = [skillId].concat(s.recent.filter(x => x !== skillId)).slice(0, 12); save(); },
    addMissed(skillId, seed) {
      const s = load();
      if (!s.missed.some(m => m.skill === skillId && m.seed === seed)) { s.missed.unshift({ skill: skillId, seed, t: Date.now() }); if (s.missed.length > 200) s.missed.length = 200; save(); }
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
    streak() {
      const s = load();
      let day = today(), count = 0;
      if (!s.days[day] || !s.days[day].q) { day = dayShift(day, -1); if (!s.days[day] || !s.days[day].q) return { days: 0, today: false }; }
      while (s.days[day] && s.days[day].q) { count++; day = dayShift(day, -1); }
      return { days: count, today: !!(s.days[today()] && s.days[today()].q) };
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
      if (!data || typeof data !== 'object' || !data.skills) throw new Error('That file isn’t a Procademy backup.');
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
    /** tests call this so they never touch the real data */
    useMemory(on) { memory = on ? new Map() : null; state = null; },
  };

  if (typeof module !== 'undefined') module.exports = STORE;
  if (typeof window !== 'undefined') window.STORE = STORE;
})();
