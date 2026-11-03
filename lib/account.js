/* Profiles and accounts (#/profile): your own profile (a name, an avatar, your grade) and, with an account,
   your progress saved online so you can log in on any computer, with no files to move.

   Accounts use Firebase (Google): Firebase Authentication keeps the passwords (hashed, with lockouts after
   repeated wrong guesses), and Cloud Firestore keeps one document per learner that only that learner can
   read or write (firestore.rules). A learner picks a username; no email is needed. The username becomes
   a sign-in address inside the site owner's own Firebase project, which never receives mail; an email,
   if given, is used instead and lets a forgotten password be reset. An account made with an email gets one
   email with a link to confirm the address, and saves online only once it is confirmed (logging in never
   sends one; the learner can ask for the link again). Or a learner signs in with Google,
   GitHub or Facebook (whichever lib/firebase-config.js lists): one click in a pop-up, no password to
   remember (the site's policy allows the one frame those pop-ups report back through, from the project's
   own firebaseapp.com address). What is saved online is
   what the site keeps on the device — levels, history, settings, badges, sprint bests — not tutor chats or files.
   Changes are saved a few seconds after they happen and when the page is hidden; another computer's
   changes are merged in when the page is opened or comes back into view.

   The owner turns accounts on once, by following SETUP-ACCOUNTS.md and filling lib/firebase-config.js.
   Until then (and in the one-file offline build) the Profile page works on this device only. */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc;
  const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
  const CFG = window.PROCADEMY_FIREBASE || null;
  const SPRINTS = 'procademy.sprints.v1';
  const USERNAME = /^[a-z0-9][a-z0-9_-]{2,19}$/;
  const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🐧', '🦉', '🐙', '🦄', '🐲', '🐢', '🦈', '🐝', '🦋', '🐬', '🚀', '⚽', '🎸', '🎨', '🌟', '🔥', '🌈', '🍕'];
  const HUES = [215, 265, 330, 0, 25, 45, 140, 175];
  const LOGO = { google: '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>',
    github: '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#0866FF" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>' };
  /** the sign-in buttons there can be, by the name lib/firebase-config.js lists them under */
  const SOCIAL = { google: { label: 'Google', id: 'google.com' }, github: { label: 'GitHub', id: 'github.com' }, facebook: { label: 'Facebook', id: 'facebook.com' } };
  const GRADES = [['', 'Not set'], ['0', 'Kindergarten']].concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => [String(g), `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade`]));

  /* ---------- the backend: Firebase, behind a small interface (tests put a stand-in here) ---------- */
  function firebaseBackend(cfg) {
    let U, F, auth, db, user = null;
    const watchers = new Set();
    const ready = (async () => {
      const [A, Au, Fs] = await Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore-lite.js')]);
      U = Au; F = Fs;
      const app = A.initializeApp({ apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId, appId: cfg.appId });
      auth = U.initializeAuth(app, { persistence: [U.indexedDBLocalPersistence, U.browserLocalPersistence] });     // the pop-up helper is passed only for the sign-in buttons, so password sign-in loads no frames
      db = F.getFirestore(app);
      await new Promise(res => { const off = U.onAuthStateChanged(auth, u => { user = u; off(); res(); }); });
      U.onAuthStateChanged(auth, u => { user = u; watchers.forEach(fn => fn()); });
    })();
    let status = 'loading';
    ready.then(() => { status = 'ready'; }, () => { status = 'failed'; });
    const ref = uid => F.doc(db, 'users', uid);
    /** which sign-in button an account uses ('google', 'github', 'facebook'), or null for a password */
    const via = u => { const d = (u.providerData || []).find(x => Object.keys(SOCIAL).some(n => SOCIAL[n].id === x.providerId)); return d ? Object.keys(SOCIAL).find(n => SOCIAL[n].id === d.providerId) : null; };
    const provider = name => {
      if (name === 'github') return new U.GithubAuthProvider();
      if (name === 'facebook') { const p = new U.FacebookAuthProvider(); p.setCustomParameters({ display: 'popup' }); return p; }
      const p = new U.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return p;
    };
    return {
      ready,
      status: () => status,
      providers: (cfg.signIn || ['google']).filter(n => SOCIAL[n]),
      onChange(fn) { watchers.add(fn); },
      current: () => (user ? { uid: user.uid, email: user.email, via: via(user), verified: user.emailVerified, name: user.displayName || '' } : null),
      /** the username is kept on the account (displayName), so it survives until the first save, whichever
          computer that happens on (an account made with an email saves only once the email is confirmed) */
      async signUp(email, pw, username) {
        await ready;
        const c = await U.createUserWithEmailAndPassword(auth, email, pw);
        try { await U.updateProfile(c.user, { displayName: username }); } catch (e) { /* the email's first part is used instead */ }
        return { uid: c.user.uid, email, verified: c.user.emailVerified, name: username };
      },
      async signIn(email, pw) { await ready; const c = await U.signInWithEmailAndPassword(auth, email, pw); return { uid: c.user.uid, email: c.user.email, verified: c.user.emailVerified, name: c.user.displayName || '' }; },
      /** the email that confirms the address; its link comes back to the Profile page on the website */
      async sendVerification() {
        await ready;
        const back = /^https?:$/.test(location.protocol) ? { url: location.href.split('#')[0] + '#/profile' } : null;
        try { await U.sendEmailVerification(auth.currentUser, back); }
        catch (e) { if (back && /continue-uri|unauthorized-domain/.test(e.code || '')) await U.sendEmailVerification(auth.currentUser); else throw e; }
      },
      /** has the link been clicked? (asks Firebase again; a fresh token then carries the confirmed address) */
      async checkVerified() { await ready; await U.reload(auth.currentUser); if (auth.currentUser.emailVerified) await auth.currentUser.getIdToken(true); return auth.currentUser.emailVerified; },
      // the pop-up must open straight from the click: the page only calls this once status() is 'ready'
      async social(name) {
        await ready;
        const c = await U.signInWithPopup(auth, provider(name), U.browserPopupRedirectResolver);
        const info = U.getAdditionalUserInfo(c);     // GitHub tells the account's login name
        return { uid: c.user.uid, email: c.user.email, via: name, login: (info && info.username) || null };
      },
      async signOut() { await ready; await U.signOut(auth); },
      async load(uid) { await ready; const snap = await F.getDoc(ref(uid)); return snap.exists() ? snap.data() : null; },
      async save(uid, data) { await ready; await F.setDoc(ref(uid), data); },
      async reauth(pw) { await ready; await U.reauthenticateWithCredential(auth.currentUser, U.EmailAuthProvider.credential(auth.currentUser.email, pw)); },
      async changePassword(oldPw, newPw) { await this.reauth(oldPw); await U.updatePassword(auth.currentUser, newPw); },
      /** pw null: an account from a sign-in button, which proves who it is in that service's pop-up instead */
      async remove(pw) {
        if (pw == null) await U.reauthenticateWithPopup(auth.currentUser, provider(via(auth.currentUser)), U.browserPopupRedirectResolver); else await this.reauth(pw);
        await F.deleteDoc(ref(auth.currentUser.uid)); await U.deleteUser(auth.currentUser);
      },
      async resetPassword(email) { await ready; await U.sendPasswordResetEmail(auth, email); },
    };
  }
  /** what a Firebase error means, in plain words (who: the sign-in button's service, for the pop-up errors) */
  function why(e, who) {
    const c = (e && e.code) || '', w = who || 'sign-in';
    if (/email-already-in-use/.test(c)) return 'That username (or email) is already taken. Try another, or log in.';
    if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return 'That username and password don’t match.';
    if (/too-many-requests/.test(c)) return 'Too many tries. Wait a few minutes, then try again.';
    if (/weak-password|password-does-not-meet/.test(c)) return 'Choose a longer password: at least 8 characters.';
    if (/network-request-failed|unavailable/.test(c)) return 'No connection to the internet right now. Try again when you are online.';
    if (/invalid-email/.test(c)) return 'That email doesn’t look right.';
    if (/requires-recent-login/.test(c)) return 'For safety, log in again first.';
    if (/popup-closed-by-user|cancelled-popup-request/.test(c)) return `The ${w} window was closed before signing in finished.`;
    if (/popup-blocked/.test(c)) return `Your browser blocked the ${w} window. Allow pop-ups for this site, then try again.`;
    if (/account-exists-with-different-credential/.test(c)) return 'That email already has a Procademy account, made another way (with a password, or a different button). Sign in that way instead.';
    if (/user-mismatch/.test(c)) return `That’s a different ${w} account from the one signed in here.`;
    if (/operation-not-allowed/.test(c)) return `${who || 'This'} sign-in isn’t switched on for this copy of Procademy.`;
    if (/unauthorized-domain|operation-not-supported/.test(c)) return `${who || 'This'} sign-in works on the Procademy website, not on this copy.`;
    if (/permission-denied/.test(c)) return 'The account storage refused this. (Has the owner published the security rules from SETUP-ACCOUNTS.md?)';
    return (e && e.message) ? 'Something went wrong: ' + e.message.replace(/^Firebase:\s*/, '') : 'Something went wrong.';
  }

  /* ---------- merging two copies of progress ---------- */
  /** combine progress from this device and the account, keeping the most of both: higher levels, longer
      histories, earliest badges; settings and the mistakes list come from whichever was saved last */
  function merge(a, b) {
    const x = S.migrate(JSON.parse(JSON.stringify(a || {}))), y = S.migrate(JSON.parse(JSON.stringify(b || {})));
    // the newer copy gives the settings, but an empty copy (a new computer, or one just cleared) never wins
    const weight = st => (hasProgress(st) || (st.profile && st.profile.name) ? (st.saved || 0) + 1 : 0);
    const newer = weight(x) >= weight(y) ? x : y, older = newer === x ? y : x;
    const out = JSON.parse(JSON.stringify(newer));
    Object.keys(older.skills).forEach(id => {
      const p = older.skills[id], q = out.skills[id];
      if (!q) { out.skills[id] = p; return; }
      const later = (p.last || 0) > (q.last || 0) ? p : q;
      out.skills[id] = { level: Math.max(p.level || 0, q.level || 0), tries: Math.max(p.tries || 0, q.tries || 0), right: Math.max(p.right || 0, q.right || 0), sets: Math.max(p.sets || 0, q.sets || 0), last: Math.max(p.last || 0, q.last || 0), ivl: later.ivl, due: later.due };
    });
    Object.keys(older.days).forEach(d => {
      const p = older.days[d], q = out.days[d] || {};
      out.days[d] = { q: Math.max(p.q || 0, q.q || 0), right: Math.max(p.right || 0, q.right || 0), pts: Math.max(p.pts || 0, q.pts || 0) };
      if (p.daily || q.daily) out.days[d].daily = Math.max(p.daily || 0, q.daily || 0);
    });
    const seen = new Set(), log = [];
    out.log.concat(older.log).sort((m, n) => n.t - m.t).forEach(e => { const k = e.t + '|' + e.kind; if (!seen.has(k)) { seen.add(k); log.push(e); } });
    out.log = log.slice(0, 500);
    Object.keys(older.mistakes).forEach(k => {
      const p = older.mistakes[k], q = out.mistakes[k] || { n: 0, skills: {} };
      const skills = Object.assign({}, q.skills);
      Object.keys(p.skills || {}).forEach(id => { skills[id] = Math.max(skills[id] || 0, p.skills[id]); });
      out.mistakes[k] = { n: Math.max(p.n || 0, q.n || 0), skills };
    });
    ['badges', 'flags'].forEach(f => Object.keys(older[f]).forEach(k => { out[f][k] = out[f][k] ? Math.min(out[f][k], older[f][k]) : older[f][k]; }));
    Object.keys(older.words).forEach(k => { const p = older.words[k], q = out.words[k]; if (!q || (p.ivl || 0) > (q.ivl || 0)) out.words[k] = p; });
    out.points = Math.max(x.points || 0, y.points || 0);
    out.saved = Math.max(x.saved || 0, y.saved || 0);
    return out;
  }
  function mergeSprints(a, b) {
    let x = {}, y = {};
    try { x = JSON.parse(a || '{}') || {}; } catch (e) { /* none */ }
    try { y = JSON.parse(b || '{}') || {}; } catch (e) { /* none */ }
    const out = Object.assign({}, y, x);
    Object.keys(y).forEach(id => { if (x[id]) { const p = x[id], q = y[id]; out[id] = { best: Math.max(p.best || 0, q.best || 0), plays: Math.max(p.plays || 0, q.plays || 0), last: Math.max(p.last || 0, q.last || 0), weak: (p.last || 0) >= (q.last || 0) ? p.weak : q.weak }; } });
    return JSON.stringify(out);
  }
  const hasProgress = st => Object.values(st.days || {}).some(d => d.q) || Object.keys(st.skills || {}).length > 0;

  /* ---------- the session: who is signed in, and keeping their copy in step ---------- */
  let backend = null, me = null, sync = { state: 'off', at: 0, error: '' }, timer = 0, pending = false, pulling = false, lastPull = 0;
  const watchers = new Set();
  const emit = () => { watchers.forEach(fn => { try { fn(); } catch (e) { /* fine */ } }); avatarButton(); };
  const ACCOUNT = {
    enabled: () => !!(backend || (CFG && CFG.apiKey && !window.PROCADEMY_OFFLINE)),
    user: () => me,
    status: () => sync,
    on(fn) { watchers.add(fn); return () => watchers.delete(fn); },
    merge, mergeSprints,
    /** tests: a stand-in backend with the same interface */
    useBackend(b) { backend = b; me = null; sync = { state: 'off', at: 0, error: '' }; },
  };
  function getBackend() {
    if (!backend && CFG && CFG.apiKey && !window.PROCADEMY_OFFLINE) backend = firebaseBackend(CFG);
    return backend;
  }
  const emailFor = id => (id.includes('@') ? id.trim().toLowerCase() : `${id.trim().toLowerCase()}@${(CFG && (CFG.usernameDomain || (CFG.projectId + '.firebaseapp.com'))) || 'learners.procademy.invalid'}`);
  const pack = (username, created) => ({ v: 1, username, created: created || Date.now(), updated: Date.now(), state: JSON.stringify(S.get()), sprints: localStorage.getItem(SPRINTS) || '{}' });
  function setSync(state, error) { sync = { state, at: state === 'saved' ? Date.now() : sync.at, error: error || '' }; emit(); }

  async function push() {
    const b = getBackend();
    if (!b || !me || me.waiting) return;
    clearTimeout(timer); pending = false;
    if (!navigator.onLine) { setSync('offline'); pending = true; return; }
    setSync('saving');
    try { await b.save(me.uid, pack(me.username, me.created)); setSync('saved'); }
    catch (e) { pending = true; setSync('error', why(e)); }
  }
  function schedule() { if (!me || me.waiting) return; pending = true; clearTimeout(timer); timer = setTimeout(push, 3000); }
  /** fetch the account's copy and merge it into this device's */
  async function pull(force) {
    const b = getBackend();
    if (!b || !me || me.waiting || pulling || (!force && Date.now() - lastPull < 20000)) return;
    pulling = true; lastPull = Date.now();
    try {
      const doc = await b.load(me.uid);
      if (doc && doc.state) {
        const before = JSON.stringify(S.get());
        const merged = merge(S.get(), JSON.parse(doc.state));
        S.replace(merged, { quiet: true });
        try { localStorage.setItem(SPRINTS, mergeSprints(localStorage.getItem(SPRINTS), doc.sprints)); } catch (e) { /* fine */ }
        me.created = doc.created || me.created; me.username = doc.username || me.username;
        if (JSON.stringify(S.get()) !== before && window.APP) { APP.applyPrefs(); APP.refreshStats(); if (!/^#\/(practice|test|challenge|mastery|daily|review|sprint\/|unlimited\/|cpm-practice|prep\/[^/]+\/\d+\/)/.test(location.hash)) APP.render(); }
        if (JSON.stringify(merged) !== doc.state) await push();
        else setSync('saved');
      } else await push();
    } catch (e) { setSync('error', why(e)); }
    pulling = false;
  }
  /** an account made with a real email that hasn't been confirmed yet (usernames and sign-in buttons need nothing) */
  const usernameDomain = () => '@' + ((CFG && (CFG.usernameDomain || (CFG.projectId + '.firebaseapp.com'))) || 'learners.procademy.invalid');
  const needsConfirming = u => !!(u && u.email && !u.via && !u.verified && !u.email.endsWith(usernameDomain()));
  /** waiting for the email's link: nothing is saved online yet; progress stays on this device */
  function waitFor(u, username, sent) { me = { uid: u.uid, username, email: u.email, created: null, via: null, waiting: true, sent: !!sent }; remember(); setSync('off'); }
  /** the link was clicked: carry on as a normal sign-in. Resolves to arrive()'s answer, or null when not yet */
  async function confirmed() {
    if (!me || !me.waiting) return null;
    const ok = await getBackend().checkVerified();
    if (!ok || !me || !me.waiting) return null;
    const r = await arrive({ uid: me.uid, email: me.email, via: null }, { username: me.username });
    remember();
    return r;
  }
  /** after signing in: bring this device and the account together (asking first if both have progress) */
  async function arrive(u, how, choice) {
    me = { uid: u.uid, username: how.username, email: u.email, created: null, via: u.via || null };
    const doc = await getBackend().load(u.uid);
    if (doc) { me.username = doc.username || me.username; me.created = doc.created; }
    if (!doc || !doc.state) { me.created = me.created || Date.now(); await push(); return 'uploaded'; }
    const local = S.get();
    if (hasProgress(local) && choice == null) return 'ask';
    if (choice === 'replace') { S.replace(JSON.parse(doc.state), { quiet: true }); try { localStorage.setItem(SPRINTS, doc.sprints || '{}'); } catch (e) { /* fine */ } }
    await pull(true);
    return 'merged';
  }

  S.onChange(() => schedule());
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!me) return;
      if (document.hidden) { if (pending) push(); return; }
      // back from the email: once the link has been clicked, the Profile page carries on as if "I clicked the link" was pressed
      if (me.waiting) getBackend().checkVerified().then(ok => { const b = ok && document.querySelector('#ac-check'); if (b) b.click(); }, () => {});
      else pull();
    });
    window.addEventListener('online', () => { if (me && pending) push(); });
  }
  /** on page load: if this browser is still signed in, pick the session up and merge */
  ACCOUNT.start = async function () {
    const b = getBackend();
    if (!b) return;
    try { await b.ready; } catch (e) { setSync('error', 'The account service could not be reached.'); return; }
    const u = b.current();
    const saved = (() => { try { return JSON.parse(localStorage.getItem('procademy.account.v1') || 'null'); } catch (e) { return null; } })();
    const username = (saved && saved.uid === u.uid && saved.username) || (u && u.name) || ((u && u.email) || '').split('@')[0];
    if (u && needsConfirming(u)) { waitFor(u, username, false); emit(); }
    else if (u) { me = { uid: u.uid, username, email: u.email, created: saved && saved.created, via: u.via || null }; emit(); await pull(true); }
    else emit();
  };
  const remember = () => { try { localStorage.setItem('procademy.account.v1', JSON.stringify(me ? { uid: me.uid, username: me.username, created: me.created } : null)); } catch (e) { /* fine */ } };

  /* ---------- the avatar in the header ---------- */
  function avatarOf(p) { p = p || S.get().profile; const a = p.avatar || {}; return { emoji: a.emoji || (p.name ? p.name.trim()[0].toUpperCase() : '🙂'), hue: a.hue == null ? 215 : a.hue }; }
  const avatarHtml = (p, big) => { const a = avatarOf(p); return `<span class="avatar${big ? ' big' : ''}" style="--av:${a.hue}" aria-hidden="true">${esc(a.emoji)}</span>`; };
  function avatarButton() {
    const el = typeof document !== 'undefined' && document.getElementById('avatar-btn');
    if (!el) return;
    el.innerHTML = avatarHtml() + (me ? `<span class="av-dot ${sync.state === 'error' || sync.state === 'offline' ? 'warn' : ''}" aria-hidden="true"></span>` : '');
    el.title = me ? `Signed in as ${me.username}` : 'Your profile';
    el.setAttribute('aria-label', me ? `Your profile (signed in as ${me.username})` : 'Your profile');
  }

  /* ---------- the profile page ---------- */
  function page(root) {
    const draw = () => {
      const st = S.get(), p = st.profile, a = avatarOf(p);
      const q = Object.values(st.days).reduce((x, d) => x + (d.q || 0), 0);
      const badges = window.BADGES ? BADGES.all().filter(b => b.at) : [];
      const mastered = Object.values(st.skills).filter(x => x.level === 4).length;
      root.innerHTML = `
        <div class="profile">
          <div class="card profile-head">
            ${avatarHtml(p, true)}
            <div class="profile-who"><h1>${esc(p.name.trim() || 'Your profile')}</h1>
              <div class="muted">${me ? `@${esc(me.username)}${me.created ? ` · member since ${new Date(me.created).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : ''}` : 'Not signed in · saved on this device'}</div></div>
          </div>
          ${window.LEARNERS ? LEARNERS.strip() : ''}
          <div class="profile-grid">
            <div class="card">
              <h2>About you</h2>
              <div class="field"><label for="pf-name">Name</label><input id="pf-name" type="text" maxlength="40" value="${esc(p.name)}" placeholder="What should Procademy call you?" autocomplete="off"></div>
              <div class="field"><label for="pf-grade">Grade</label><select id="pf-grade">${GRADES.map(([v, l]) => `<option value="${v}" ${String(p.grade == null ? '' : p.grade) === v ? 'selected' : ''}>${l}</option>`).join('')}</select><div class="help">The tutor explains at your grade’s level.</div></div>
              <div class="field"><span class="label">Avatar</span>
                <div class="av-pick" role="radiogroup" aria-label="Avatar">${AVATARS.map(e => `<button type="button" role="radio" aria-checked="${a.emoji === e}" class="av-opt${a.emoji === e ? ' on' : ''}" data-emoji="${e}">${e}</button>`).join('')}</div>
                <div class="av-hues" role="radiogroup" aria-label="Color">${HUES.map(h => `<button type="button" role="radio" aria-checked="${a.hue === h}" aria-label="Color" class="av-hue${a.hue === h ? ' on' : ''}" data-hue="${h}" style="--av:${h}"></button>`).join('')}</div></div>
            </div>
            <div class="card">
              <h2>So far</h2>
              <div class="profile-stats"><div><b>🔥 ${S.streak().days}</b><span>day streak</span></div><div><b>${q}</b><span>questions</span></div><div><b>★ ${mastered}</b><span>mastered</span></div><div><b>🏅 ${badges.length}</b><span>badges</span></div></div>
              ${badges.length ? `<div class="profile-badges">${badges.slice(-8).map(b => `<span title="${esc(b.name)}">${b.icon}</span>`).join('')}</div>` : ''}
              <a class="btn sm" href="#/progress">All your progress →</a>
            </div>
          </div>
          <div class="card account" id="account">${accountCard()}</div>
          <div class="card reminder"><h2>A daily reminder</h2><p class="muted small">A little practice every day beats a lot once a week. Put a reminder in your calendar (on a phone, computer or tablet):</p>
            <div class="row" style="gap:8px;flex-wrap:wrap"><label class="small">Every day at <select id="rm-time">${[15, 16, 17, 18, 19, 20].map(h => `<option value="${h}" ${h === 16 ? 'selected' : ''}>${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'pm' : 'am'}</option>`).join('')}</select></label><button class="btn sm" id="rm-ics" type="button">📅 Add to my calendar</button></div></div>
        </div>`;
      bind();
    };
    function accountCard() {
      const move = window.MOVE ? `<h3 style="margin-top:14px">Move to another computer</h3>${MOVE.box()}` : '';
      if (window.PROCADEMY_OFFLINE) return `<h2>Your account</h2><p class="muted">Accounts work on the Procademy website, not in the offline file. Progress in this file stays on this computer.</p>${move}`;
      if (!ACCOUNT.enabled()) return `<h2>Your progress on other computers</h2><p class="muted">Online accounts aren’t switched on for this copy of Procademy yet, so everything is saved on this device. (For the site’s owner: see SETUP-ACCOUNTS.md.)</p>${move}`;
      if (me && me.waiting) {
        return `<h2>Check your email</h2>
          <p>${me.sent ? 'We sent a link to' : 'To start saving online, confirm your email: click the link in the email we sent to'} <b>${esc(me.email)}</b>${me.sent ? '. Click it to finish making your account, then come back here.' : ' when you made your account.'}</p>
          <p class="small muted">It can take a minute to arrive; look in spam or junk too. Until then, your progress is saved on this computer.</p>
          <div class="btn-row"><button class="btn primary" id="ac-check" type="button">I clicked the link</button><button class="btn sm" id="ac-resend" type="button">Send the link again</button><button class="btn sm ghost" id="ac-out-w" type="button">Log out</button></div>
          <p class="ac-msg" role="alert"></p>`;
      }
      if (me) {
        return `<h2>Your account</h2>
          <p>Signed in as <b>@${esc(me.username)}</b>${me.email && !me.email.endsWith(domain()) ? ` (${esc(me.email)})` : ''}${me.via ? ' with ' + SOCIAL[me.via].label : ''}. Your progress is saved online: log in on any computer to pick up where you left off.</p>
          <p class="sync-line ${sync.state}" id="sync-line">${syncLine()}</p>
          <div class="btn-row"><button class="btn sm" id="ac-sync">Sync now</button>${me.via ? '' : '<button class="btn sm" id="ac-pw">Change password</button>'}<button class="btn sm primary" id="ac-out">Log out</button></div>
          <div id="ac-more"></div>
          <details class="ac-danger"><summary class="small">Delete my account</summary><p class="small muted">This deletes your account and everything saved online. Progress on this computer stays unless you log out.</p>
            ${me.via ? `<div id="ac-del-box"><p class="small muted">${SOCIAL[me.via].label} will ask you to confirm it’s you.</p><button class="btn sm danger" id="ac-del-g">Delete my account</button></div>`
    : '<div class="row" style="gap:8px;flex-wrap:wrap"><input type="password" id="ac-del-pw" placeholder="Your password" autocomplete="current-password" aria-label="Password"><button class="btn sm danger" id="ac-del">Delete my account</button></div>'}</details>`;
      }
      return `<h2>Save your progress online</h2>
        <p class="muted">Keep your progress safe and pick up where you left off on any computer.${social().length ? '' : ' You only need a username and a password.'} <a href="privacy.html">What is saved</a>.</p>
        ${social().length ? `<div class="ac-social" id="ac-g">${social().map(n => `<button class="btn ac-social-btn" type="button" id="ac-${n}" data-social="${n}">${LOGO[n]} Continue with ${SOCIAL[n].label}</button>`).join('')}<p class="ac-msg" role="alert"></p>
          <div class="ac-or"><span>or use a username and password</span></div></div>` : ''}
        <div class="tabs ac-tabs" role="tablist"><button class="tab on" role="tab" aria-selected="true" data-tab="new">Create an account</button><button class="tab" role="tab" aria-selected="false" data-tab="in">Log in</button></div>
        <form id="ac-new" class="ac-form" autocomplete="on">
          <div class="field"><label for="ac-user">Username</label><input id="ac-user" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" maxlength="20" placeholder="3–20 letters, numbers, - or _" required><div class="help">Don’t use your full name. Other people never see it.</div></div>
          <div class="field"><label for="ac-pass">Password</label><input id="ac-pass" type="password" autocomplete="new-password" minlength="8" required placeholder="At least 8 characters"></div>
          <div class="field"><label for="ac-pass2">Password again</label><input id="ac-pass2" type="password" autocomplete="new-password" minlength="8" required></div>
          <div class="field"><label for="ac-email">Email <span class="muted">(optional)</span></label><input id="ac-email" type="email" autocomplete="email" placeholder="A parent’s email is fine"><div class="help">We’ll email a link to check it’s yours: click it to start saving online. An email lets you reset a forgotten password, and you log in with it instead of the username. Without one, write your password down somewhere safe.</div></div>
          ${hasProgress(S.get()) ? '<p class="small">Your progress on this device goes into the new account.</p>' : ''}
          <button class="btn primary" type="submit">Create my account</button><p class="ac-msg" role="alert"></p></form>
        <form id="ac-in" class="ac-form" hidden autocomplete="on">
          <div class="field"><label for="ac-id">Username or email</label><input id="ac-id" name="username" autocomplete="username" autocapitalize="off" spellcheck="false" required></div>
          <div class="field"><label for="ac-pw-in">Password</label><input id="ac-pw-in" type="password" autocomplete="current-password" required></div>
          <button class="btn primary" type="submit">Log in</button> <button class="btn ghost sm" type="button" id="ac-forgot">Forgot your password?</button><p class="ac-msg" role="alert"></p></form>`;
    }
    function syncLine() {
      const when = sync.at ? new Date(sync.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';
      return sync.state === 'saving' ? '⏳ Saving…' : sync.state === 'saved' ? `✓ Saved online${when ? ' at ' + when : ''}` : sync.state === 'offline' ? '⚠️ Offline: changes will be saved when you’re back online' : sync.state === 'error' ? `⚠️ ${esc(sync.error)}` : '…';
    }
    const social = () => { const b = getBackend(); return ((b && b.providers) || []).filter(n => SOCIAL[n]); };
    const domain = () => '@' + ((CFG && (CFG.usernameDomain || (CFG.projectId + '.firebaseapp.com'))) || 'learners.procademy.invalid');
    function bind() {
      bindProfile(); bindAccount();
      if (window.LEARNERS) LEARNERS.wire(root, draw);
      root.querySelector('#rm-ics').addEventListener('click', () => reminder(Number(root.querySelector('#rm-time').value)));
    }
    function bindProfile() {
      root.querySelector('#pf-name').addEventListener('input', ev => { S.setProfile({ name: ev.target.value.slice(0, 40) }); if (window.APP) APP.applyPrefs(); avatarButton(); root.querySelector('.profile-who h1').textContent = ev.target.value.trim() || 'Your profile'; });
      root.querySelector('#pf-grade').addEventListener('change', ev => { S.setProfile({ grade: ev.target.value === '' ? null : Number(ev.target.value) }); V.toast('Saved'); });
      root.querySelectorAll('[data-emoji]').forEach(b => b.addEventListener('click', () => { S.setProfile({ avatar: Object.assign({}, S.get().profile.avatar, { emoji: b.dataset.emoji }) }); avatarButton(); draw(); }));
      root.querySelectorAll('[data-hue]').forEach(b => b.addEventListener('click', () => { S.setProfile({ avatar: Object.assign({}, S.get().profile.avatar, { hue: Number(b.dataset.hue) }) }); avatarButton(); draw(); }));
    }
    function bindAccount() {
      const acc = root.querySelector('#account');
      if (window.MOVE) MOVE.wire(acc);
      acc.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => {
        acc.querySelectorAll('[data-tab]').forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', String(x === t)); });
        acc.querySelector('#ac-new').hidden = t.dataset.tab !== 'new'; acc.querySelector('#ac-in').hidden = t.dataset.tab !== 'in';
      }));
      const say = (form, msg, good) => { const m = form.querySelector('.ac-msg'); m.textContent = msg; m.classList.toggle('good', !!good); };
      const busy = (form, on) => form.querySelectorAll('button, input').forEach(x => { x.disabled = on; });
      const g = acc.querySelector('#ac-g');
      if (g) g.querySelectorAll('[data-social]').forEach(btn => btn.addEventListener('click', async () => {
        const name = btn.dataset.social, who = SOCIAL[name].label;
        // waiting for the SDK here would open the pop-up too long after the click, and browsers block that
        const st = getBackend().status ? getBackend().status() : 'ready';
        if (st === 'loading') return say(g, `${who} sign-in is still loading. Press the button again in a moment.`, true);
        if (st === 'failed') return say(g, `${who} sign-in can’t be reached right now. Check the internet, then reload the page.`);
        busy(g, true); say(g, `Waiting for ${who}…`, true);
        try {
          const u = await getBackend().social(name);
          // the username starts as the GitHub login or the email's first part (Facebook may give neither)
          const r = await arrive(u, { username: (u.login || (u.email || '').split('@')[0] || name).toLowerCase().slice(0, 40) });
          remember();
          if (r === 'ask') return askMerge(u);
          V.toast(r === 'uploaded' ? `Welcome, @${me.username}! Your progress is saved online.` : `Welcome back, @${me.username}!`);
          if (window.BADGES) BADGES.check();
          draw();
        } catch (e) { me = null; busy(g, false); say(g, why(e, who)); }
      }));
      const fNew = acc.querySelector('#ac-new');
      if (fNew) fNew.addEventListener('submit', async ev => {
        ev.preventDefault();
        const user = fNew.querySelector('#ac-user').value.trim().toLowerCase(), pw = fNew.querySelector('#ac-pass').value, pw2 = fNew.querySelector('#ac-pass2').value, email = fNew.querySelector('#ac-email').value.trim();
        if (!USERNAME.test(user)) return say(fNew, 'Usernames are 3 to 20 letters, numbers, - or _, starting with a letter or number.');
        if (pw.length < 8) return say(fNew, 'Choose a password of at least 8 characters.');
        if (pw !== pw2) return say(fNew, 'The two passwords are different.');
        if (pw.toLowerCase().includes(user)) return say(fNew, 'Don’t put your username in your password.');
        busy(fNew, true); say(fNew, 'Creating your account…', true);
        try {
          const u = await getBackend().signUp(email || emailFor(user), pw, user);
          if (needsConfirming(u)) {
            waitFor(u, user, true); draw();
            try { await getBackend().sendVerification(); } catch (e) { me.sent = false; draw(); say(root.querySelector('#account'), 'The email couldn’t be sent just now (' + why(e) + ') Press “Send the link again” in a minute.'); }
            return;
          }
          me = { uid: u.uid, username: user, email: u.email, created: Date.now() };
          await push(); remember();
          V.toast(`Welcome, @${user}! Your progress is saved online.`);
          if (window.BADGES) BADGES.check();
          draw();
        } catch (e) { busy(fNew, false); say(fNew, why(e)); }
      });
      const fIn = acc.querySelector('#ac-in');
      if (fIn) {
        fIn.addEventListener('submit', async ev => {
          ev.preventDefault();
          const id = fIn.querySelector('#ac-id').value.trim(), pw = fIn.querySelector('#ac-pw-in').value;
          if (!id || !pw) return;
          busy(fIn, true); say(fIn, 'Logging in…', true);
          try {
            const u = await getBackend().signIn(emailFor(id), pw);
            const username = u.name || (id.includes('@') ? id.split('@')[0] : id.toLowerCase());
            if (needsConfirming(u)) { waitFor(u, username, false); draw(); return; }      // logging in never sends an email
            const r = await arrive(u, { username });
            remember();
            if (r === 'ask') return askMerge(u);
            V.toast(`Welcome back, @${me.username}!`); draw();
          } catch (e) { me = null; busy(fIn, false); say(fIn, why(e)); }
        });
        fIn.querySelector('#ac-forgot').addEventListener('click', async () => {
          const id = fIn.querySelector('#ac-id').value.trim();
          if (!id.includes('@')) return say(fIn, 'A password can be reset only for an account made with an email: type that email above, then press this again. Accounts with only a username can’t be reset, so keep the password somewhere safe.');
          try { await getBackend().resetPassword(id); say(fIn, 'If that email has an account, a reset link is on its way.', true); } catch (e) { say(fIn, why(e)); }
        });
      }
      const on = (id, fn) => { const b = acc.querySelector(id); if (b) b.addEventListener('click', fn); };
      on('#ac-check', async () => {
        try {
          const r = await confirmed();
          if (!r) return say(acc, 'Not yet: the link hasn’t been clicked. Open the email from Procademy and click the link, then press this again.');
          if (r === 'ask') return askMerge({ uid: me.uid, email: me.email, via: null });
          V.toast(`Your email is confirmed. Welcome, @${me.username}!`); if (window.BADGES) BADGES.check(); draw();
        } catch (e) { say(acc, why(e)); }
      });
      on('#ac-resend', async () => {
        try { await getBackend().sendVerification(); me.sent = true; say(acc, `Sent again to ${me.email}.`, true); } catch (e) { say(acc, why(e)); }
      });
      on('#ac-out-w', async () => { await logOut(false); draw(); });
      on('#ac-sync', async () => { await push(); await pull(true); draw(); });
      on('#ac-out', () => {
        const more = acc.querySelector('#ac-more');
        more.innerHTML = `<div class="card tight ac-confirm"><p><b>Log out?</b> Your progress is saved online.</p><label class="small"><input type="checkbox" id="ac-keep"> Keep a copy of my progress on this computer</label><p class="small muted">Leave it unchecked on a shared computer, so the next person starts fresh.</p><div class="btn-row"><button class="btn sm primary" id="ac-out-yes">Log out</button><button class="btn sm ghost" id="ac-out-no">Cancel</button></div></div>`;
        more.querySelector('#ac-out-no').addEventListener('click', () => { more.innerHTML = ''; });
        more.querySelector('#ac-out-yes').addEventListener('click', async () => { await logOut(!more.querySelector('#ac-keep').checked); draw(); });
      });
      on('#ac-pw', () => {
        const more = acc.querySelector('#ac-more');
        more.innerHTML = `<form class="card tight ac-confirm" id="ac-pw-form"><div class="field"><label for="ac-old">Current password</label><input id="ac-old" type="password" autocomplete="current-password" required></div><div class="field"><label for="ac-new1">New password</label><input id="ac-new1" type="password" autocomplete="new-password" minlength="8" required></div><button class="btn sm primary" type="submit">Change it</button> <button class="btn sm ghost" type="button" id="ac-pw-no">Cancel</button><p class="ac-msg" role="alert"></p></form>`;
        const f = more.querySelector('#ac-pw-form');
        f.querySelector('#ac-pw-no').addEventListener('click', () => { more.innerHTML = ''; });
        f.addEventListener('submit', async ev => {
          ev.preventDefault();
          const n = f.querySelector('#ac-new1').value;
          if (n.length < 8) return say(f, 'At least 8 characters.');
          try { await getBackend().changePassword(f.querySelector('#ac-old').value, n); more.innerHTML = ''; V.toast('Password changed'); } catch (e) { say(f, why(e)); }
        });
      });
      // an account from a sign-in button: no password to type, and no confirm() first, because the pop-up has to open from a click
      on('#ac-del-g', () => {
        const box = acc.querySelector('#ac-del-box');
        box.innerHTML = '<p class="small"><b>Delete everything saved online?</b> This can’t be undone.</p><button class="btn sm danger" id="ac-del-yes">Yes, delete my account</button>';
        box.querySelector('#ac-del-yes').addEventListener('click', async () => {
          try { await getBackend().remove(null); me = null; remember(); setSync('off'); V.toast('Your account is deleted'); draw(); } catch (e) { V.toast(why(e, SOCIAL[me.via].label)); }
        });
      });
      on('#ac-del', async () => {
        const pw = acc.querySelector('#ac-del-pw').value;
        if (!pw) { V.toast('Type your password first'); return; }
        if (!confirm('Delete your account and everything saved online? This can’t be undone.')) return;
        try { await getBackend().remove(pw); me = null; remember(); setSync('off'); V.toast('Your account is deleted'); draw(); } catch (e) { V.toast(why(e)); }
      });
    }
    function askMerge(u) {
      const acc = root.querySelector('#account');
      acc.innerHTML = `<h2>Two sets of progress</h2><p>This computer already has progress that isn’t in <b>@${esc(me.username)}</b>’s account. What should happen to it?</p>
        <div class="btn-row"><button class="btn primary" id="mg-add">Add it to my account</button><button class="btn" id="mg-replace">Use only my account’s progress</button></div>
        <p class="small muted">Adding keeps the most of both: the higher level of every skill, both histories, every badge. Choose “only my account’s” if this computer’s progress is someone else’s.</p>`;
      acc.querySelector('#mg-add').addEventListener('click', async () => { await arrive(u, { username: me.username }, 'merge'); remember(); V.toast('Added to your account'); draw(); });
      acc.querySelector('#mg-replace').addEventListener('click', async () => { await arrive(u, { username: me.username }, 'replace'); remember(); V.toast(`Welcome back, @${me.username}!`); draw(); });
    }
    // the "saved online" line follows the sync as it happens
    const off = ACCOUNT.on(() => { if (!root.isConnected) { off(); return; } const line = root.querySelector('#sync-line'); if (line) { line.innerHTML = syncLine(); line.className = 'sync-line ' + sync.state; } });
    draw();
    H.tutorCtx(null);
  }
  /** a calendar file with a daily reminder at hour h (local time), linking to today's practice */
  function reminder(h) {
    const d = new Date(); d.setDate(d.getDate() + (d.getHours() >= h ? 1 : 0));
    const day = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    const site = window.MOVE ? MOVE.siteBase() : location.href.split('#')[0];
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Daily reminder//EN', 'BEGIN:VEVENT',
      `UID:procademy-daily-${Date.now()}@procademy`, `DTSTAMP:${stamp}`, `DTSTART:${day}T${String(h).padStart(2, '0')}0000`, 'DURATION:PT15M', 'RRULE:FREQ=DAILY',
      'SUMMARY:Procademy: today’s practice (10 minutes)', `DESCRIPTION:Open Procademy for today’s practice: ${site}#/daily`, `URL:${site}#/daily`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Time for Procademy', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'procademy-daily-reminder.ics';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    ACCOUNT._lastIcs = ics;
    V.toast('Open the downloaded file to add the reminder');
  }
  async function logOut(wipe) {
    if (pending) await push();
    try { await getBackend().signOut(); } catch (e) { /* signed out locally anyway */ }
    me = null; remember(); setSync('off');
    if (wipe) { S.reset(); try { localStorage.removeItem(SPRINTS); localStorage.removeItem('procademy.chats.v1'); localStorage.removeItem('procademy.topics.v1'); } catch (e) { /* fine */ } if (window.APP) { APP.applyPrefs(); APP.refreshStats(); } }
    V.toast(wipe ? 'Logged out. This computer’s copy is cleared.' : 'Logged out');
  }

  Object.assign(ACCOUNT, { page, push, pull, logOut, avatarHtml, avatarButton, emailFor });
  window.ACCOUNT = ACCOUNT;
})();
