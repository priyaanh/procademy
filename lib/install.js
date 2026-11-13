/* Get the app: Procademy installs like an app, with its own icon, full screen, and working offline (sw.js).
   Chrome, Edge and Android offer an install prompt (beforeinstallprompt), opened from our own Install button.
   Safari on an iPhone or iPad has no prompt, so it shows the taps instead (Share, then Add to Home Screen). Home
   offers it once a learner has practiced on two different days, until it is installed or put away for two weeks;
   Settings always has it. Pages hold a slot (INSTALL.slot) that fills in when the browser says it can install.
   It also opens the site on the page chosen in Settings (startPage). */
'use strict';
(function () {
  const S = window.STORE, KEY = 'procademy.install.v1', LATER = 14 * 864e5;
  let prompt = null;
  const state = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const put = patch => { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(state(), patch))); } catch (e) { /* this visit only */ } };
  const standalone = () => !!((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true);
  const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installed = () => standalone() || !!state().done;
  /** can this device install Procademy right now? */
  const can = () => !window.PROCADEMY_OFFLINE && !installed() && (!!prompt || ios());
  const homeWanted = () => { const st = S.get(), later = state().later; return can() && Object.keys(st.days).filter(d => st.days[d].q).length >= 2 && !(later && Date.now() - later < LATER); };

  const steps = `<ol class="install-steps"><li>Tap the <b>Share</b> button (the square with an arrow) in Safari’s toolbar.</li><li>Scroll down and choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>. Procademy then opens from its own icon.</li></ol>`;
  function inner(where) {
    if (where === 'home' && !homeWanted()) return '';
    // in Settings it is one part of the This device card
    if (where === 'settings') {
      if (window.PROCADEMY_OFFLINE) return '';
      if (installed()) return `<div class="set-sub"><h3>Get the app</h3><p class="muted small">Procademy is installed on this device. Open it from your home screen or app list. Press and hold its icon for shortcuts to today’s practice, the tutor and the calculator.</p></div>`;
      if (!can()) return `<div class="set-sub"><h3>Get the app</h3><p class="muted small">Procademy can be installed like an app, with its own icon, and it works without the internet. In Chrome or Edge, choose <b>Install</b> in the address bar or menu. On an iPhone or iPad, open this site in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>.</p></div>`;
      return `<div class="set-sub install-sub" id="install-settings"><h3>Get the app</h3><p class="muted small">Open practice straight from your home screen, full screen, and keep going without the internet. It’s free and takes a few seconds.</p>
        <div class="btn-row" style="margin-top:0">${prompt ? `<button class="btn primary sm" type="button" data-install-act="go">Install</button>` : `<button class="btn primary sm" type="button" data-install-act="how" aria-expanded="false">Show me how</button>`}</div>
        <div class="install-how" hidden>${steps}</div></div>`;
    }
    const act = prompt ? `<button class="btn primary sm" type="button" data-install-act="go">Install</button>` : `<button class="btn primary sm" type="button" data-install-act="how" aria-expanded="false">Show me how</button>`;
    return `<div class="card install-card" id="install-${where}"><img src="icon-192.png" alt="" width="52" height="52" class="install-icon">
      <div class="install-text"><h2>Get the Procademy app</h2><p class="small muted">Open practice straight from your home screen, full screen, and keep going without the internet. It’s free and takes a few seconds.</p>
        <div class="btn-row">${act}${where === 'home' ? '<button class="btn ghost sm" type="button" data-install-act="later">Not now</button>' : ''}</div>
        <div class="install-how" hidden>${steps}</div></div></div>`;
  }
  /** a place on a page for the offer; it fills in (or empties) as the browser's answer arrives */
  const slot = where => `<div class="install-slot" data-install="${where}">${inner(where)}</div>`;
  function refresh() { document.querySelectorAll('[data-install]').forEach(el => { el.innerHTML = inner(el.dataset.install); }); }

  async function install() {
    const p = prompt;
    if (!p) return;
    prompt = null;
    try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === 'accepted') put({ done: Date.now() }); } catch (e) { /* the browser said no */ }
    refresh();
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('[data-install-act]');
    if (!b) return;
    const what = b.dataset.installAct;
    if (what === 'go') install();
    else if (what === 'later') { put({ later: Date.now() }); refresh(); }
    else if (what === 'how') { const how = b.closest('.install-card, .install-sub').querySelector('.install-how'); how.hidden = !how.hidden; b.setAttribute('aria-expanded', String(!how.hidden)); }
  });
  window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); prompt = ev; refresh(); });
  window.addEventListener('appinstalled', () => { prompt = null; put({ done: Date.now() }); refresh(); if (window.VIEWS) VIEWS.toast('Procademy is installed. Open it from your home screen or app list.'); });

  /* the page Procademy opens on (Settings › You › Open Procademy on, profile.startPage): opening the site or the app
     with no page in its address goes there; "Where I left off" is the page visited last */
  function startPage(hash) {
    if (hash && hash !== '#') return null;
    let want = null;
    try { want = S.get().profile.startPage; } catch (e) { return null; }
    if (want === 'last') {
      const key = 'procademy.recentpages.v1' + (window.LEARNERS && LEARNERS.active ? '.' + LEARNERS.active() : '');
      try { const r = JSON.parse(localStorage.getItem(key) || '[]'); want = Array.isArray(r) && r[0] && typeof r[0].h === 'string' ? r[0].h : null; } catch (e) { want = null; }
    }
    return typeof want === 'string' && /^#\/[^\s<>"]+$/.test(want) && want !== '#/' ? want : null;
  }
  if (!/\/tests\//.test(location.pathname)) {
    const go = startPage(location.hash);
    if (go) try { history.replaceState(history.state, '', location.pathname + location.search + go); } catch (e) { /* Home, then */ }
  }

  window.INSTALL = { slot, refresh, can, installed, startPage, _setPrompt: p => { prompt = p; refresh(); } };
})();
