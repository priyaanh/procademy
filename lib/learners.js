/* Several learners on one computer ("Who's practising?"): a brother, a sister or a parent each get their
   own profile — progress, badges, sprint bests, tutor chats and graphs — and switch on the Profile page.
   The learner on screen uses the usual storage; the others are put aside, each under its own key, and
   swapped in when chosen. A learner can add a 4-digit PIN so nobody switches to their profile by mistake
   (it is a lock against accidents, not a strong one: anyone with the computer can read its storage). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const REG = 'procademy.learners.v1';
  const OWN = ['procademy.sprints.v1', 'procademy.chats.v1', 'procademy.graph.v1', 'procademy.calc.v1', 'procademy.leap.v1', 'procademy.balance.v1', 'procademy.topics.v1', 'procademy.searches.v1', 'procademy.vs.v1', 'procademy.shots.v1', 'procademy.backup.v1'];     // a learner's things besides progress
  const stashKey = id => 'procademy.learner.' + id;
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* storage full or blocked */ } };

  /** the list of learners on this computer, and who is on screen (made from the current profile the first time) */
  function reg() {
    let r = null;
    try { r = JSON.parse(get(REG) || 'null'); } catch (e) { r = null; }
    if (!r || !Array.isArray(r.list) || !r.list.length) {
      const p = S.get().profile;
      r = { active: 'l1', list: [{ id: 'l1', name: p.name || '', avatar: p.avatar || null, pin: null, created: Date.now() }] };
    }
    if (!r.list.some(x => x.id === r.active)) r.active = r.list[0].id;
    return r;
  }
  const save = r => set(REG, JSON.stringify(r));
  /** keep the on-screen learner's name and avatar in the list */
  function sync() { const r = reg(), me = r.list.find(x => x.id === r.active), p = S.get().profile; me.name = p.name || ''; me.avatar = p.avatar || null; save(r); return r; }
  async function hashPin(pin, id) {
    const data = new TextEncoder().encode('procademy-pin:' + id + ':' + pin);
    if (crypto && crypto.subtle) { const h = await crypto.subtle.digest('SHA-256', data); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''); }
    let h = 5381; data.forEach(b => { h = ((h << 5) + h + b) | 0; }); return 'x' + (h >>> 0).toString(16);
  }
  /** put the on-screen learner aside, and bring another in */
  function stash(id) { set(stashKey(id), JSON.stringify({ state: S.get(), own: Object.fromEntries(OWN.map(k => [k, get(k)])) })); }
  function bring(id, entry) {
    let b = null;
    try { b = JSON.parse(get(stashKey(id)) || 'null'); } catch (e) { b = null; }
    const st = b && b.state ? b.state : Object.assign(S.blank(), { profile: Object.assign(S.blank().profile, { name: entry.name || '', avatar: entry.avatar || undefined }) });
    S.replace(st, { quiet: true });
    OWN.forEach(k => set(k, b && b.own ? b.own[k] : null));
    set(stashKey(id), null);
  }
  function refresh() {
    if (window.TUTORUI) TUTORUI.reset();
    if (window.APP) { APP.applyPrefs(); APP.refreshStats(); }
  }
  const L = {
    list: () => sync().list,
    active: () => reg().active,
    /** a learner's saved progress, without switching to them (the family view reads it) */
    stateOf(id) {
      if (id === reg().active) return S.get();
      try { const b = JSON.parse(get(stashKey(id)) || 'null'); return b && b.state ? b.state : null; } catch (e) { return null; }
    },
    count: () => reg().list.length,
    /** change a learner's profile from the family page (the one on screen, or one put aside): their goal, a
        note from a parent, practice assigned to them */
    patch(id, fn) {
      if (id === reg().active) { const p = S.get().profile; S.setProfile(fn(Object.assign({}, p))); return true; }
      let b = null;
      try { b = JSON.parse(get(stashKey(id)) || 'null'); } catch (e) { b = null; }
      if (!b || !b.state) return false;
      b.state.profile = Object.assign({}, b.state.profile, fn(Object.assign({}, b.state.profile)));
      set(stashKey(id), JSON.stringify(b));
      return true;
    },
    setGoal(id, n) { return L.patch(id, () => ({ goal: n })); },
    /** switch to another learner (with their PIN, if they have one) */
    async switchTo(id, pin) {
      if (window.ACCOUNT && ACCOUNT.user()) throw new Error('Log out of the online account first, then switch.');
      const r = sync(), target = r.list.find(x => x.id === id);
      if (!target || id === r.active) return false;
      if (target.pin && (await hashPin(String(pin || ''), id)) !== target.pin) throw new Error('That PIN isn’t right.');
      stash(r.active); bring(id, target);
      r.active = id; save(r); refresh();
      return true;
    },
    /** a new learner, who starts fresh and is switched to */
    async add(name, avatar, pin) {
      if (window.ACCOUNT && ACCOUNT.user()) throw new Error('Log out of the online account first, then add a learner.');
      const r = sync();
      if (r.list.length >= 8) throw new Error('Up to 8 learners on one computer.');
      const id = 'l' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      const entry = { id, name: String(name || '').trim().slice(0, 40), avatar: avatar || null, pin: pin ? await hashPin(pin, id) : null, created: Date.now() };
      stash(r.active);
      r.list.push(entry); r.active = id; save(r);
      bring(id, entry);
      if (entry.name || entry.avatar) S.setProfile({ name: entry.name, avatar: entry.avatar || undefined });
      refresh();
      return id;
    },
    async setPin(pin) { const r = sync(), me = r.list.find(x => x.id === r.active); me.pin = pin ? await hashPin(pin, me.id) : null; save(r); },
    hasPin() { const r = reg(); return !!r.list.find(x => x.id === r.active).pin; },
    /** remove a learner who is not on screen, with everything of theirs */
    remove(id) { const r = sync(); if (id === r.active) return false; r.list = r.list.filter(x => x.id !== id); set(stashKey(id), null); save(r); return true; },

    /** "Who's practising?" for the Profile page */
    strip() {
      const r = sync();
      return `<div class="card learners"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Who is practicing?</h2><span class="small muted">Each learner on this computer has their own progress.</span></div>
        <div class="learner-list">${r.list.map(x => { const a = x.avatar || {}; return `<button type="button" class="learner${x.id === r.active ? ' on' : ''}" data-learner="${esc(x.id)}" aria-pressed="${x.id === r.active}">
          <span class="avatar" style="--av:${a.hue == null ? 215 : Number(a.hue) || 0}" aria-hidden="true">${x.name && x.name.trim() ? esc(Array.from(x.name.trim())[0].toUpperCase()) : '?'}</span>
          <span class="ln">${esc(x.name || 'Unnamed learner')}${x.pin ? ' (PIN)' : ''}</span>${x.id === r.active ? '<span class="tiny muted">current</span>' : ''}</button>`; }).join('')}
          ${r.list.length < 8 ? '<button type="button" class="learner add" id="ln-add"><span class="avatar" aria-hidden="true">+</span><span class="ln">Add a learner</span></button>' : ''}</div>
        <div id="ln-more"></div>
        <details class="ln-pin"><summary class="small">${L.hasPin() ? 'Your profile has a PIN' : 'Add a PIN to your profile'}</summary>
          <p class="small muted">A 4-digit PIN prevents others from switching to your profile by mistake. It is a safeguard against accidents, not strong security.</p>
          <div class="row" style="gap:8px;flex-wrap:wrap"><input id="ln-pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="4 digits" aria-label="New PIN"><button class="btn sm" id="ln-pin-set" type="button">Set PIN</button>${L.hasPin() ? '<button class="btn sm ghost" id="ln-pin-off" type="button">Remove PIN</button>' : ''}</div></details></div>`;
    },
    wire(root, rerender) {
      const more = root.querySelector('#ln-more');
      if (!more) return;
      root.querySelectorAll('[data-learner]').forEach(b => b.addEventListener('click', async () => {
        const id = b.dataset.learner, r = reg(), t = r.list.find(x => x.id === id);
        if (id === r.active) return;
        const go = async pin => { try { await L.switchTo(id, pin); V.toast(`Switched to ${t.name || 'this learner'}.`); rerender(); } catch (e) { const m = more.querySelector('.ac-msg'); if (m) m.textContent = e.message; else V.toast(e.message); } };
        if (!t.pin) return go();
        more.innerHTML = `<form class="card tight ln-form" id="ln-unlock"><p><b>${esc(t.name || 'This learner')}</b> has a PIN.</p><div class="row" style="gap:8px"><input id="ln-unlock-pin" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="PIN" placeholder="PIN"><button class="btn sm primary" type="submit">Switch</button><button class="btn sm ghost" type="button" id="ln-cancel">Cancel</button></div><p class="ac-msg" role="alert"></p>
          <p class="tiny muted">Forgotten the PIN? <button type="button" class="linklike" id="ln-forget">Remove ${esc(t.name || 'this learner')}’s profile</button> (this also removes their progress).</p></form>`;
        more.querySelector('#ln-unlock-pin').focus();
        more.querySelector('#ln-cancel').addEventListener('click', () => { more.innerHTML = ''; });
        more.querySelector('#ln-unlock').addEventListener('submit', ev => { ev.preventDefault(); go(more.querySelector('#ln-unlock-pin').value); });
        more.querySelector('#ln-forget').addEventListener('click', () => { if (confirm(`Remove ${t.name || 'this learner'} and all their progress from this computer?`)) { L.remove(id); rerender(); } });
      }));
      const add = root.querySelector('#ln-add');
      if (add) add.addEventListener('click', () => {
        more.innerHTML = `<form class="card tight ln-form" id="ln-new"><div class="field"><label for="ln-name">Name</label><input id="ln-name" type="text" maxlength="40" required autocomplete="off"></div>
          <div class="field"><label for="ln-new-pin">PIN <span class="muted">(optional, 4 digits)</span></label><input id="ln-new-pin" inputmode="numeric" maxlength="4" autocomplete="off"></div>
          <p class="small muted">The new learner starts with no progress. Your progress is kept, and you can switch back at any time.</p>
          <button class="btn primary" type="submit">Add and switch</button> <button class="btn ghost" type="button" id="ln-cancel">Cancel</button><p class="ac-msg" role="alert"></p></form>`;
        more.querySelector('#ln-cancel').addEventListener('click', () => { more.innerHTML = ''; });
        more.querySelector('#ln-name').focus();
        more.querySelector('#ln-new').addEventListener('submit', async ev => {
          ev.preventDefault();
          const name = more.querySelector('#ln-name').value.trim(), pin = more.querySelector('#ln-new-pin').value.trim();
          const msg = more.querySelector('.ac-msg');
          if (!name) { msg.textContent = 'Enter a name.'; return; }
          if (pin && !/^\d{4}$/.test(pin)) { msg.textContent = 'A PIN must be 4 digits.'; return; }
          try { await L.add(name, { hue: [215, 265, 330, 0, 25, 45, 140, 175][Math.floor(Math.random() * 8)] }, pin || null); V.toast(`${name} has been added.`); rerender(); } catch (e) { msg.textContent = e.message; }
        });
      });
      const setBtn = root.querySelector('#ln-pin-set'), offBtn = root.querySelector('#ln-pin-off');
      if (setBtn) setBtn.addEventListener('click', async () => { const v = root.querySelector('#ln-pin').value.trim(); if (!/^\d{4}$/.test(v)) { V.toast('A PIN is 4 digits'); return; } await L.setPin(v); V.toast('PIN set'); rerender(); });
      if (offBtn) offBtn.addEventListener('click', async () => { await L.setPin(null); V.toast('PIN removed'); rerender(); });
    },
  };
  window.LEARNERS = L;
})();
