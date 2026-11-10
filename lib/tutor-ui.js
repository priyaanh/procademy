/* The tutor's panel: a floating "Ask" button on every page, the chat, and a small settings view.
   Views tell it what the learner is looking at with TUTORUI.setContext({...}); buttons such as
   "Explain this" call TUTORUI.open({ ask: 'question text' }).
   The free cloud tutor is the default, so the panel is ready the moment it opens; the on-device tutor
   is a choice in the settings view, for anyone who wants it private and offline. */
'use strict';
(function () {
  const T = window.TUTOR, S = window.STORE, M = window.M, FILES = window.FILES;
  const esc = M.esc;
  let context = null, history = [], pending = null, panel = null, builtin = false, view = 'chat', waiting = null, openAdvanced = false;
  let handoff = null;          // a conversation carried from the panel to the full page
  let tray = null;             // files waiting to go with the next question

  const QUICK = {
    question: ['Give me a hint', 'Explain the idea behind this', 'Show me a similar example'],
    wrong: ['Why was my answer wrong?', 'Give me a hint', 'Explain it differently'],
    done: ['Explain how to get this answer', 'Why does this work?', 'Show me a similar example'],
    skill: ['Explain this like I am new to it', 'Show me another example', 'Give me a question to try'],
    lesson: ['Explain this lesson simply', 'Show me an example', 'What should I remember from it?'],
    none: ['Help with this page', 'Explain slope', 'How do I add fractions?'],
  };
  const PAGE_Q = 'Help with this page';
  /** what is on the page, for "Help with this page": its heading and its words, without the learner's name */
  function pageText() {
    const main = document.getElementById('main');
    if (!main) return '';
    const name = (S.get().profile.name || '').trim(), h = main.querySelector('h1');
    let t = (main.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 900);
    if (name.length > 1) t = t.split(name).join('the student');
    t = t.replace(/@[\w.-]+/g, '@user');
    return `The student is on the page "${h ? h.textContent.trim().replace(name, 'the student') : document.title}". What it shows: ${t}`;
  }
  /* ---------- answers a little at a time ----------
     A long answer arrives in steps: numbered steps (or "Step 1", "Step 2" paragraphs) show one at a time with
     Next step, and any other long answer shows its first part with Show more. The state is kept on the message,
     so a redraw keeps what was opened. */
  const isStep = el => el.tagName === 'LI' || /^\s*(step\s*\d+|\d+[.)])/i.test(el.textContent || '');
  function pace(el, m) {
    if (!el || !m || m.pending || !m.content || m.pic) return;
    el.querySelectorAll(':scope > .pace').forEach(x => x.remove());
    const units = [];
    [...el.children].forEach(c => { if (c.tagName === 'OL') [...c.children].forEach(li => units.push(li)); else if (!c.classList.contains('ai-actions') && !c.classList.contains('tmsg-via')) units.push(c); });
    units.forEach(u => { u.hidden = false; });
    const steps = units.filter(u => (u.tagName === 'LI' && u.parentElement.tagName === 'OL') || (u.tagName === 'P' && isStep(u)));
    let cut = -1, label = '';
    if (steps.length >= 3 && !m.paceAll) {
      const shown = Math.max(1, Math.min(m.paceStep || 1, steps.length));
      if (shown < steps.length) { cut = units.indexOf(steps[shown - 1]); label = `<button type="button" class="chip-btn" data-pace="next">Next step (${shown + 1} of ${steps.length})</button><button type="button" class="chip-btn" data-pace="all">Show all steps</button>`; }
    } else if (!m.paceAll && units.length > 3 && (m.content || '').length > 900) {
      let len = 0;
      for (let k = 0; k < units.length; k++) { len += (units[k].textContent || '').length; if (k >= 1 && len > 420) { cut = k; break; } }
      if (cut >= 0 && cut < units.length - 1) label = '<button type="button" class="chip-btn" data-pace="all">Show more</button>'; else cut = -1;
    }
    if (cut < 0) return;
    units.forEach((u, k) => { if (k > cut) u.hidden = true; });
    el.__pace = m;
    el.insertAdjacentHTML('beforeend', `<div class="pace">${label}</div>`);
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-pace]'); if (!b) return;
    const el = b.closest('.pace') && b.closest('.pace').parentElement, m = el && el.__pace;
    if (!m) return;
    if (b.dataset.pace === 'next') m.paceStep = (m.paceStep || 1) + 1; else m.paceAll = true;
    pace(el, m);
  });
  /** follow-ups under an answer: more detail, a picture, a question to try */
  const MORE = [['Explain more', 'Explain that in more detail, step by step.'], ['Show me a picture', null], ['A practice question', 'Give me one practice question like this. Please don’t tell me the answer until I reply.']];
  /** "Show me a picture" asks for one of what the conversation is about: a drawing for math, a picture otherwise */
  function pictureAsk(msgs) {
    const u = [...(msgs || [])].reverse().find(x => x.role === 'user' && x.content && !/^(explain that|show me a picture|give me one practice)/i.test(x.content));
    const about = u ? u.content.replace(/\s+/g, ' ').trim().replace(/[?.!]+$/, '').replace(/^(what|who|how|why|when|where)\s+(is|are|was|were|do|does|did|can)\s+(i\s+|we\s+|you\s+)?/i, '').replace(/^(please\s+)?(explain|tell me about|describe|show me)\s+/i, '') || 'this' : 'this';
    return `Show me a picture of ${about.length > 90 ? about.slice(0, 87) + '…' : about}`;
  }
  /* ---------- how long answers take, for the thinking line; reading answers aloud ---------- */
  const MS_KEY = 'procademy.tutor.ms';
  function typical() { try { const v = Number(localStorage.getItem(MS_KEY)); return v > 0 ? v : 0; } catch (e) { return 0; } }
  function noteTime(ms) { if (!(ms > 0)) return; try { const v = typical(); localStorage.setItem(MS_KEY, String(Math.round(v ? v * 0.7 + ms * 0.3 : ms))); } catch (e) { /* fine */ } }
  function thinkingHtml() {
    const s = Math.round(typical() / 1000);
    return `<span class="thinking" role="status"><span class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="muted">Thinking…${s >= 2 ? ` Answers usually take about ${s} seconds.` : ''}</span></span>`;
  }
  const voiceOn = () => !!pref().voice && !!(window.COACH && COACH.canSpeak());
  function speak(reply) { if (voiceOn() && reply && reply.content) COACH.say(T.render(reply.content)); }

  /* ---------- asking by voice: the browser's own speech recognition, where it has one ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>';
  const SPEECH = { en: 'en-US', es: 'es-US', hi: 'hi-IN' };
  /** a microphone button for a box to type in (empty where the browser can't listen) */
  function micHtml(id, cls) {
    return SR ? `<button type="button" class="iconbtn ${cls || ''} mic-btn" id="${id}" aria-pressed="false" aria-label="Speak your question" title="Speak your question. Your browser may send the recording to its maker to turn it into text.">${MIC}</button>` : '';
  }
  /** listen once and type what was said into box; a second press stops. lang: en, es or hi */
  function wireMic(btn, box, lang) {
    if (!btn || !SR || !box) return;
    let rec = null;
    btn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      const before = box.value.replace(/\s+$/, '');
      try { rec = new SR(); } catch (e) { rec = null; return; }
      rec.lang = SPEECH[typeof lang === 'function' ? lang() : lang] || 'en-US';
      rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
      rec.onresult = ev => {
        const said = [...ev.results].map(r => r[0].transcript).join(' ').trim();
        box.value = (before ? before + ' ' : '') + said;
        box.dispatchEvent(new Event('input', { bubbles: true }));
      };
      const stop = () => { rec = null; btn.classList.remove('on'); btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Speak your question'); };
      rec.onend = stop;
      rec.onerror = ev => { stop(); if (ev && /not-allowed|service-not-allowed/.test(ev.error || '') && window.VIEWS) VIEWS.toast('Speaking needs the microphone. Allow it in the browser, or type instead.'); };
      btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Stop listening');
      try { rec.start(); } catch (e) { stop(); }
    });
  }

  /* ---------- warming up: so the first answer comes sooner ----------
     Opening a connection to the free services ahead of time (a preconnect sends no question, so it uses none of
     their limits), starting the tutor, and starting unlimited mode's helper in the background. */
  let warmedAt = 0;
  function warm(force) {
    if ((!force && Date.now() - warmedAt < 50000) || navigator.onLine === false) return;
    warmedAt = Date.now();
    if (chosenEngine() === 'cloud') {
      T.PROVIDERS.forEach(p => {
        const origin = new URL(p.url).origin;
        let l = document.querySelector(`link[rel="preconnect"][href="${origin}"]`);
        if (l) l.remove();                        // a fresh link opens a fresh connection (an idle one closes)
        l = document.createElement('link'); l.rel = 'preconnect'; l.href = origin; l.crossOrigin = 'anonymous';
        document.head.appendChild(l);
      });
    }
    ensureStarted();
    maybePrepare();
  }

  /* ---------- what the tutor remembers: worked out on this device, per learner ----------
     Nothing new is stored: the skills with the most questions missed lately and the tutor chats of the last two
     weeks (both kept on this device, per learner) are summed up and sent with a question, so explanations can
     build on them. "Forget" means only what comes after it counts. */
  function memoryItems() {
    const p = pref(); if (p.memory === false) return [];
    const A = window.ACADEMY, from = p.memoryFrom || 0, st = S.get(), by = {};
    if (!A) return [];
    (st.missed || []).filter(m => (m.t || 0) > from && A.skills[m.skill]).forEach(m => { by[m.skill] = (by[m.skill] || 0) + 1; });
    const plainT = id => A.stripTags(A.skills[id].title).replace(/\s+/g, ' ').trim();
    const hard = Object.keys(by).sort((a, b) => by[b] - by[a]).slice(0, 3).map(id => ({ kind: 'skill', id, text: `${plainT(id)} (${by[id]} missed question${by[id] > 1 ? 's' : ''})` }));
    let chats = [];
    try { chats = (JSON.parse(localStorage.getItem('procademy.chats.v1') || 'null') || {}).chats || []; } catch (e) { chats = []; }
    const topics = chats.filter(c => c && c.title && c.title !== 'New chat' && (c.updated || 0) > from && Date.now() - (c.updated || 0) < 14 * 864e5).slice(0, 3).map(c => ({ kind: 'chat', text: c.title }));
    return hard.concat(topics);
  }
  function memoryText() {
    const items = memoryItems(); if (!items.length) return '';
    const hard = items.filter(x => x.kind === 'skill').map(x => x.text), asked = items.filter(x => x.kind === 'chat').map(x => x.text);
    return [hard.length && 'missed in practice: ' + hard.join('; '), asked.length && 'asked the tutor about: ' + asked.join('; ')].filter(Boolean).join('. ').slice(0, 480);
  }
  /** the card that says what is remembered, with a switch and Forget (the page's details and the panel's settings) */
  function memoryCard() {
    const items = memoryItems(), on = pref().memory !== false;
    return `<div class="tutor-card tutor-memory"><p style="margin:0 0 6px"><b>What the tutor remembers</b></p>
      <label class="tutor-check"><input type="checkbox" class="mem-on" ${on ? 'checked' : ''}><span>Use what I found hard to explain things better. It’s worked out on this device from your practice and chats.</span></label>
      ${on ? (items.length ? `<ul class="small mem-list">${items.map(x => `<li>${esc(x.text)}</li>`).join('')}</ul><button type="button" class="btn sm ghost mem-forget">Forget all of this</button>` : '<p class="tiny muted" style="margin:6px 0 0">Nothing yet. Missed practice questions and recent chats show up here.</p>') : ''}</div>`;
  }
  function wireMemory(root, redraw) {
    const on = root.querySelector('.mem-on'), forget = root.querySelector('.mem-forget');
    if (on) on.addEventListener('change', () => { setPref({ memory: on.checked }); redraw(); });
    if (forget) forget.addEventListener('click', () => { setPref({ memoryFrom: Date.now() }); redraw(); if (window.VIEWS) VIEWS.toast('Forgotten. Only what comes next counts.'); });
  }

  /* ---------- the language of explanations ---------- */
  const LANGS = [['en', 'In English'], ['es', 'En español'], ['hi', 'हिंदी में']];
  const LANG_LINE = {
    es: 'Reply in Spanish, in simple, clear sentences for a student. Keep numbers, math symbols and Procademy’s skill names as written.',
    hi: 'Reply in Hindi (Devanagari script), in simple, clear sentences for a student. Keep numbers, math symbols and Procademy’s skill names as written.',
  };
  /** what every question carries from the learner's choices: the language and what is remembered */
  function withPrefs(ctx, lang) {
    const out = Object.assign({}, ctx || {}), l = lang || pref().lang || 'en', mem = memoryText();
    if (LANG_LINE[l] && !out.lang) out.lang = LANG_LINE[l];
    if (mem && !out.memory) out.memory = mem;
    return Object.keys(out).length ? out : ctx;
  }

  /* ---------- the whiteboard: worked steps written out one at a time ---------- */
  const reduceMotion = () => document.documentElement.getAttribute('data-motion') === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  /** steps (HTML already made safe: Procademy's own steps, or a rendered answer) on a whiteboard, one at a time */
  function whiteboard(steps, title) {
    steps = (steps || []).filter(x => String(x).replace(/<[^>]*>/g, '').trim());
    if (!steps.length) return null;
    const back = document.activeElement, wrap = document.createElement('div');
    wrap.className = 'wb-wrap' + (reduceMotion() ? ' still' : '');
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'wb-h');
    wrap.innerHTML = `<div class="wb-board"><div class="wb-top"><h2 id="wb-h">${esc(title || 'Step by step')}</h2><button type="button" class="iconbtn" data-wb="close" aria-label="Close the whiteboard">✕</button></div>
      <ol class="wb-steps" aria-live="polite">${steps.map(h => `<li hidden>${h}</li>`).join('')}</ol>
      <div class="wb-foot"><span class="small wb-count" id="wb-count"></span><span class="spacer"></span>
        ${window.COACH && COACH.canSpeak() ? '<button type="button" class="btn sm ghost" data-wb="say">Read it</button>' : ''}
        <button type="button" class="btn sm" data-wb="back">Back</button><button type="button" class="btn sm primary" data-wb="next">Next step</button><button type="button" class="btn sm ghost" data-wb="all">Show all</button></div></div>`;
    document.body.appendChild(wrap);
    const lis = [...wrap.querySelectorAll('.wb-steps > li')];
    let shown = 0;
    const draw = () => {
      lis.forEach((li, k) => { const was = !li.hidden; li.hidden = k >= shown; if (!was && !li.hidden) { li.classList.remove('write'); void li.offsetWidth; li.classList.add('write'); } });
      wrap.querySelector('#wb-count').textContent = `Step ${shown} of ${lis.length}`;
      wrap.querySelector('[data-wb="next"]').disabled = shown >= lis.length;
      wrap.querySelector('[data-wb="all"]').hidden = shown >= lis.length;
      wrap.querySelector('[data-wb="back"]').disabled = shown <= 1;
      if (lis[shown - 1]) lis[shown - 1].scrollIntoView({ block: 'nearest' });
    };
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey, true); if (window.speechSynthesis) speechSynthesis.cancel(); if (back && back.focus) back.focus(); };
    const act = a => {
      if (a === 'close') return close();
      if (a === 'next' && shown < lis.length) shown++;
      if (a === 'back' && shown > 1) shown--;
      if (a === 'all') shown = lis.length;
      if (a === 'say' && lis[shown - 1] && window.COACH) COACH.say(lis[shown - 1].innerHTML);
      draw();
    };
    const onKey = ev => {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); close(); }
      else if ((ev.key === 'ArrowRight' || ev.key === ' ') && !ev.target.closest('button')) { ev.preventDefault(); act('next'); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); act('back'); }
    };
    document.addEventListener('keydown', onKey, true);
    wrap.addEventListener('click', ev => { const b = ev.target.closest('[data-wb]'); if (b) act(b.dataset.wb); else if (ev.target === wrap) close(); });
    shown = 1; draw();
    wrap.querySelector('[data-wb="next"]').focus();
    return wrap;
  }
  /** the steps of an answer the tutor wrote: its numbered steps, else its paragraphs (as rendered, so safe) */
  function stepsOf(bubble) {
    if (!bubble) return [];
    const ol = bubble.querySelector(':scope > ol');
    const units = ol && ol.children.length >= 2 ? [...ol.children] : [...bubble.querySelectorAll(':scope > p, :scope > ol > li, :scope > ul > li')];
    return units.filter(u => !u.closest('.pace, .ai-actions')).map(u => u.innerHTML);
  }

  function pref() { return S.get().profile.tutor || {}; }
  function setPref(p) { S.setProfile({ tutor: Object.assign({}, pref(), p) }); applyCloud(); }
  /** keys live in their own storage entry, so they never enter a backup file */
  const SECRET_KEY = 'procademy.secret.v1';
  function secrets() { try { return JSON.parse(localStorage.getItem(SECRET_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function setSecret(k, v) { try { const o = secrets(); if (v) o[k] = v; else delete o[k]; localStorage.setItem(SECRET_KEY, JSON.stringify(o)); } catch (e) { /* storage blocked */ } if (T.clearWait) T.clearWait(k); applyCloud(); }     // a new key: the old wait no longer applies
  /** tell the engine which free services to use, and any key */
  function applyCloud() {
    const off = pref().cloudOff || [];
    T.cloud = { use: T.PROVIDERS.map(p => p.id).filter(id => !off.includes(id)), tokens: { llm7: secrets().llm7 || '' } };
  }
  /** which engine to use: the saved choice, or the free cloud tutor */
  function chosenEngine() { return pref().engine || 'cloud'; }
  /** unlimited mode is on unless switched off; on a metered connection it waits to be switched on */
  function unlimitedOn() { const u = pref().unlimited; return u === undefined ? !T.meteredConnection() : !!u; }
  /** start unlimited mode's on-device helper in the background (never blocks the chat) */
  function maybePrepare() {
    if (chosenEngine() !== 'cloud' || !unlimitedOn()) return;
    if (T.local.state === 'off') T.prepareLocal().then(() => render());
  }

  function build() {
    if (panel) return panel;
    const btn = document.createElement('button');
    btn.className = 'tutor-fab'; btn.id = 'tutor-fab'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Ask the Procademy tutor'); btn.innerHTML = (window.ICONS ? ICONS.svg('sparkle', 18) : '') + '<span>Ask the tutor</span>';
    btn.addEventListener('click', () => (panel.hidden ? UI.open() : UI.close()));
    ['pointerenter', 'focus', 'touchstart'].forEach(e => btn.addEventListener(e, () => warm(), { passive: true }));
    document.body.appendChild(btn);
    keepClear(btn);
    panel = document.createElement('aside');
    panel.className = 'tutor'; panel.id = 'tutor'; panel.hidden = true;
    panel.setAttribute('aria-label', 'Procademy tutor');
    panel.innerHTML = `<div class="tutor-resize" id="tutor-resize" role="separator" aria-orientation="vertical" aria-label="Resize the tutor (arrow keys; double-click to reset)" tabindex="0"></div>
      <div class="tutor-grip" id="tutor-grip" role="separator" aria-orientation="horizontal" aria-label="Resize the tutor" tabindex="0"></div>
      <div class="tutor-head"><div><b>Procademy tutor</b><div class="tutor-status small muted" id="tutor-status"></div></div>
        <div class="row" style="gap:2px"><button class="iconbtn" id="tutor-size" aria-label="Change the tutor’s size" title="Size: narrow, medium or wide (or drag the left edge)">⇔</button><button class="iconbtn" id="tutor-expand" aria-label="Open the tutor as a full page" title="Open as a full page">⤢</button>
        <button class="iconbtn" id="tutor-settings" aria-label="Tutor settings" title="Tutor settings"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg></button>
        <button class="iconbtn" id="tutor-close" aria-label="Close the tutor">✕</button></div></div>
      <div class="tutor-about" id="tutor-about"></div>
      <div class="tutor-body" id="tutor-body" aria-live="polite"></div>
      <div class="tutor-quick" id="tutor-quick"></div>
      <div class="file-tray" id="tutor-tray" hidden></div>
      <form class="tutor-input" id="tutor-form"><button class="iconbtn attach-btn" id="tutor-attach" type="button" aria-label="Attach a photo, PDF or text file" title="Attach a photo, PDF or text file"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M16.5 6.5 8.8 14.2a2 2 0 0 0 2.8 2.8l7.8-7.8a4 4 0 0 0-5.7-5.7L5.9 11.3a6 6 0 0 0 8.5 8.5l6.4-6.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <input type="file" id="tutor-file" accept="${FILES ? FILES.ACCEPT : ''}" multiple hidden>
        ${micHtml('tutor-mic', 'tutor-mic')}<textarea id="tutor-text" rows="2" placeholder="Ask, or ask for a graph…" aria-label="Your question"></textarea>
        <button class="btn primary" id="tutor-send" type="submit">Send</button></form>
      <div class="tutor-note tiny muted" id="tutor-note"></div>`;
    document.body.appendChild(panel);
    panel.querySelector('#tutor-close').addEventListener('click', () => UI.close());
    wireMic(panel.querySelector('#tutor-mic'), panel.querySelector('#tutor-text'), () => pref().lang || 'en');
    panel.querySelector('#tutor-expand').addEventListener('click', () => { handoff = { history: history.slice(), context }; UI.close(); location.hash = '#/tutor/new'; });
    wireResize();
    panel.querySelector('#tutor-settings').addEventListener('click', () => { view = view === 'settings' ? 'chat' : 'settings'; render(); });
    panel.querySelector('#tutor-form').addEventListener('submit', ev => { ev.preventDefault(); send(panel.querySelector('#tutor-text').value); });
    // files: the attach button, pasting a picture, or dropping a file on the panel
    if (FILES) {
      tray = FILES.tray(panel.querySelector('#tutor-tray'), () => render());
      const input = panel.querySelector('#tutor-file');
      panel.querySelector('#tutor-attach').addEventListener('click', () => input.click());
      input.addEventListener('change', () => { tray.add(input.files); input.value = ''; });
      panel.querySelector('#tutor-text').addEventListener('paste', ev => { const f = ev.clipboardData && [...ev.clipboardData.files]; if (f && f.length) { ev.preventDefault(); tray.add(f); } });
      panel.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); panel.classList.add('dropping'); } });
      panel.addEventListener('dragleave', ev => { if (!panel.contains(ev.relatedTarget)) panel.classList.remove('dropping'); });
      panel.addEventListener('drop', ev => { panel.classList.remove('dropping'); if (ev.dataTransfer && ev.dataTransfer.files.length) { ev.preventDefault(); tray.add(ev.dataTransfer.files); } });
    } else panel.querySelector('#tutor-attach').hidden = true;
    // buttons inside answers that ask a follow-up (a picture's "Another version")
    panel.querySelector('#tutor-body').addEventListener('click', ev => { const b = ev.target.closest('[data-ask]'); if (b) { ev.preventDefault(); send(b.dataset.ask); } });
    panel.querySelector('#tutor-text').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); send(ev.target.value); } });
    panel.addEventListener('keydown', ev => { if (ev.key === 'Escape') UI.close(); });
    T.on(() => render());
    T.builtinAvailable().then(b => { builtin = b; if (!panel.hidden) render(); });
    return panel;
  }

  /* ---------- the floating button keeps out of the way ----------
     Once the page has scrolled (and on a phone) it is just its icon; it slides away while the page scrolls down,
     and stays away while it would cover a button, a link or a box to type in. */
  function keepClear(btn) {
    let lastY = window.scrollY, settle = 0;
    const covers = () => {
      const r = btn.getBoundingClientRect();
      if (!r.width || getComputedStyle(btn).display === 'none') return false;
      btn.style.visibility = 'hidden';
      const pts = [[r.left + 6, r.top + 6], [r.right - 6, r.top + 6], [r.left + 6, r.bottom - 6], [r.right - 6, r.bottom - 6], [r.left + r.width / 2, r.top + r.height / 2]];
      const hit = pts.some(([x, y]) => { const el = document.elementFromPoint(x, y); return el && el.closest('button, a, input, select, textarea, label, [role="button"], [tabindex]') && !el.closest('.tutor, .tabbar, .top'); });
      btn.style.visibility = '';
      return hit;
    };
    /** measure where the button rests (with its slide paused, so a half-finished slide isn't measured), then
        let it slide in or out */
    const place = () => {
      const was = btn.classList.contains('away');
      btn.style.transition = 'none';
      btn.classList.remove('away');
      btn.classList.toggle('compact', window.scrollY > 60 || phone());
      const hit = covers();
      btn.classList.toggle('away', was);
      void btn.offsetWidth;
      btn.style.transition = '';
      btn.classList.toggle('away', hit);
    };
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > lastY + 4) btn.classList.add('away');
      lastY = y;
      clearTimeout(settle); settle = setTimeout(place, 240);
    }, { passive: true });
    const later = () => { clearTimeout(settle); settle = setTimeout(place, 320); };
    window.addEventListener('hashchange', later);
    window.addEventListener('resize', later);
    const main = document.getElementById('main');
    if (main && window.MutationObserver) new MutationObserver(later).observe(main, { childList: true, subtree: true });
    later();
    UI.placeFab = place;                               // for the test suite
  }

  /* ---------- size: drag the edge (or the ⇔ button), remembered on this device ---------- */
  const SIZE_KEY = 'procademy.ui.v1';
  const W_MIN = 320, W_DEFAULT = 420;
  const PRESETS = [[360, 'narrow'], [460, 'medium'], [640, 'wide']];
  function sizes() { try { return JSON.parse(localStorage.getItem(SIZE_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function saveSizes(o) { try { localStorage.setItem(SIZE_KEY, JSON.stringify(Object.assign(sizes(), o))); } catch (e) { /* fine */ } }
  const wMax = () => Math.max(W_MIN, Math.min(960, window.innerWidth - 120));
  const curW = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-w')) || W_DEFAULT;
  const phone = () => window.innerWidth <= 700;
  /** apply a width (computer) or top offset (phone), and decide whether the page can share the screen.
      While dragging (live), only the panel moves; the page settles once, when the drag ends. */
  function applySize(w, top, live) {
    const root = document.documentElement;
    if (w != null) root.style.setProperty('--tutor-w', Math.round(Math.max(W_MIN, Math.min(wMax(), w))) + 'px');
    if (top != null) root.style.setProperty('--tutor-top', Math.round(Math.max(56, Math.min(window.innerHeight - 200, top))) + 'px');
    if (live) return;
    // a page narrower than this would be cramped beside the tutor, so the tutor floats over it instead
    document.body.classList.toggle('tutor-overlay', window.innerWidth - curW() - 30 < 520);
    root.style.setProperty('--tutor-page-w', curW() + 'px');
    const b = panel && panel.querySelector('#tutor-size');
    if (b) { const k = nearestPreset(curW()); b.title = `Size: ${PRESETS[k][1]}. Press for ${PRESETS[(k + 1) % PRESETS.length][1]}, or drag the left edge`; }
  }
  const nearestPreset = w => PRESETS.reduce((best, p, k) => (Math.abs(p[0] - w) < Math.abs(PRESETS[best][0] - w) ? k : best), 0);
  /** a phone's panel rests at one of three heights; pulled low enough, it closes */
  function snapTop(top) {
    const h = window.innerHeight, stops = [56, Math.round(h * 0.38), Math.round(h * 0.6)];
    if (top > h * 0.8) return null;
    return stops.reduce((a, b) => (Math.abs(b - top) < Math.abs(a - top) ? b : a));
  }
  function wireResize() {
    const s0 = sizes();
    applySize(s0.w || W_DEFAULT, s0.top);
    const edge = panel.querySelector('#tutor-resize'), grip = panel.querySelector('#tutor-grip');
    const drag = (el, axis, when) => {
      el.addEventListener('pointerdown', ev => {
        if (ev.button > 0 || (when && !when(ev))) return;
        ev.preventDefault(); try { el.setPointerCapture(ev.pointerId); } catch (e) { /* not a live pointer */ }
        document.body.classList.add('tutor-resizing');
        let frame = 0, last = ev, moved = false;
        const move = e => {
          last = e; moved = moved || Math.abs(e.clientX - ev.clientX) + Math.abs(e.clientY - ev.clientY) > 2;
          if (frame) return;
          frame = requestAnimationFrame(() => { frame = 0; if (axis === 'x') applySize(window.innerWidth - last.clientX - 18, null, true); else applySize(null, last.clientY - 8, true); });
        };
        const up = () => {
          cancelAnimationFrame(frame);
          el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
          document.body.classList.remove('tutor-resizing');
          if (axis === 'x') { if (moved) applySize(window.innerWidth - last.clientX - 18, null); else applySize(null, null); saveSizes({ w: curW() }); }
          else {
            const t = snapTop(moved ? last.clientY - 8 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || 0);
            if (t === null) { UI.close(); return; }
            panel.classList.add('tutor-snapping'); applySize(null, t); setTimeout(() => panel.classList.remove('tutor-snapping'), 220);
            saveSizes({ top: t });
          }
        };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      });
    };
    drag(edge, 'x'); drag(grip, 'y');
    drag(panel.querySelector('.tutor-head'), 'y', ev => phone() && !ev.target.closest('button, a, input'));     // on a phone the header pulls too
    edge.addEventListener('keydown', ev => {
      const w = curW(), step = ev.shiftKey ? 80 : 24;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); applySize(w + step, null); saveSizes({ w: curW() }); }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); applySize(w - step, null); saveSizes({ w: curW() }); }
    });
    grip.addEventListener('keydown', ev => {
      const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || window.innerHeight * 0.38;
      if (ev.key === 'ArrowUp') { ev.preventDefault(); applySize(null, t - 60); saveSizes({ top: t - 60 }); }
      if (ev.key === 'ArrowDown') { ev.preventDefault(); applySize(null, t + 60); saveSizes({ top: t + 60 }); }
    });
    edge.addEventListener('dblclick', () => { applySize(W_DEFAULT, null); saveSizes({ w: W_DEFAULT }); });
    // ⇔ steps through narrow, medium and wide (on a phone: short, half and tall)
    panel.querySelector('#tutor-size').addEventListener('click', () => {
      panel.classList.add('tutor-snapping'); setTimeout(() => panel.classList.remove('tutor-snapping'), 220);
      if (phone()) {
        const h = window.innerHeight, stops = [Math.round(h * 0.6), Math.round(h * 0.38), 56];
        const t = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tutor-top')) || stops[1];
        const k = stops.reduce((best, v, i) => (Math.abs(v - t) < Math.abs(stops[best] - t) ? i : best), 0);
        const next = stops[(k + 1) % stops.length]; applySize(null, next); saveSizes({ top: next });
      } else {
        const fits = PRESETS.filter(p => p[0] <= wMax());
        const k = nearestPreset(curW()), next = (fits[(fits.findIndex(p => p === PRESETS[k]) + 1) % fits.length] || PRESETS[0])[0];
        applySize(next, null); saveSizes({ w: curW() });
      }
    });
    window.addEventListener('resize', () => applySize(null, null));
  }

  function aboutText() {
    if (!context) return '';
    const what = context.question ? 'this question' : context.lesson ? 'lesson ' + context.lesson : context.skill ? context.skill : '';
    return what ? `<span class="chip">About: ${esc(what.length > 60 ? what.slice(0, 57) + '…' : what)}</span>` : '';
  }

  /** the settings view: cloud (default) or a model on this device */
  function unlimitedCard() {
    const L = T.local, on = unlimitedOn(), model = L.modelId ? T.model(L.modelId) : null;
    let state = '';
    if (L.state === 'ready') state = `<span class="chip up">On · no waiting</span>`;
    else if (L.state === 'loading') state = `<span class="chip">Getting ready · ${Math.round((L.progress.fraction || 0) * 100)}%</span>`;
    else if (L.state === 'unsupported') state = `<span class="chip">Not available on this device</span>`;
    else if (L.state === 'error') state = `<span class="chip down">Couldn’t start</span>`;
    return `<div class="tutor-card"><p style="margin-bottom:6px"><b>Unlimited mode</b> ${state}</p>
      <label class="tutor-check"><input type="checkbox" id="tutor-unlimited" ${on ? 'checked' : ''} ${L.state === 'unsupported' ? 'disabled' : ''}>
        <span>Also run the free AI on this device, so there is never a wait. It sets itself up in the background the first time${model ? ` (${esc(model.id === 'builtin' ? 'uses the browser’s own AI, nothing to download' : model.size + ', once')})` : ' (about 350 MB on a phone, 1 GB on a computer, once)'}.</span></label>
      <p class="tiny muted" style="margin:6px 0 0">The cloud AI answers while the cloud is free; this device answers whenever it is busy, offline too. Answers from this device never leave it.${L.state === 'error' ? ' ' + esc(L.error) : ''}${L.state === 'unsupported' ? ' This browser can’t run it (it needs WebGPU: Chrome or Edge on a computer, or Safari on a recent Mac, iPhone or iPad).' : ''}</p></div>`;
  }
  function settingsCard() {
    const current = chosenEngine(), device = T.supported();
    const options = [T.CLOUD].concat(builtin ? [T.BUILTIN] : [], T.MODELS);
    return unlimitedCard() + `<details class="tutor-card tutor-advanced"><summary><b>Advanced</b></summary>
      <p style="margin:10px 0 8px"><b>How the tutor runs</b></p>
      <fieldset class="tutor-models"><legend class="visually-hidden">Choose how the tutor runs</legend>
        ${options.map(m => {
          const isDevice = m.id !== 'cloud' && m.id !== 'builtin', off = isDevice && !device;
          return `<label class="tutor-model${off ? ' off' : ''}"><input type="radio" name="tutor-engine" value="${m.id}" ${m.id === current ? 'checked' : ''} ${off ? 'disabled' : ''}>
            <span><b>${esc(isDevice ? 'On this device: ' + m.name : m.name)}</b> · ${esc(m.size)}${m.id === 'cloud' ? ' <span class="chip up">Recommended</span>' : ''}<br>
            <span class="small muted">${esc(m.note)}${isDevice ? ' Private, and works offline after a one-time download.' : ''}${off ? ' This browser can’t run it (it needs WebGPU).' : ''}</span></span></label>`;
        }).join('')}
      </fieldset>
      <button class="btn primary block" id="tutor-use">Use this</button>
      <p style="margin:14px 0 6px"><b>Free cloud services</b></p>
      <p class="small muted" style="margin-bottom:8px">The cloud tutor uses these in turn, so one is usually free to answer at once.</p>
      ${T.PROVIDERS.map(p => `<label class="tutor-check"><input type="checkbox" class="tutor-provider" value="${p.id}" ${(pref().cloudOff || []).includes(p.id) ? '' : 'checked'}>
        <span><b>${esc(p.name)}</b> · ${p.id === 'llm7' ? 'about one reply a second' : 'one reply every 30 seconds'} · <a href="${p.privacy}" target="_blank" rel="noopener">privacy</a></span></label>`).join('')}
      <p class="tiny muted" style="margin:4px 0 10px">LLM7’s privacy policy says it isn’t meant for children under 13. Uncheck it to use only Pollinations.</p>
      <label class="small" for="tutor-llm7-key"><b>Free LLM7 key</b> (optional)</label>
      <div class="row" style="gap:6px;margin-top:4px"><input id="tutor-llm7-key" type="password" autocomplete="off" placeholder="${secrets().llm7 ? 'Saved on this device' : 'Paste a free key from dash.llm7.io'}" style="flex:1;min-width:0;padding:.45rem .6rem;border:1px solid var(--line-strong);border-radius:8px;background:var(--surface);color:var(--ink)">
        <button class="btn sm" id="tutor-key-save">${secrets().llm7 ? 'Replace' : 'Save'}</button>${secrets().llm7 ? '<button class="btn sm ghost" id="tutor-key-clear">Remove</button>' : ''}</div>
      <p class="tiny muted" style="margin:6px 0 0">Without a key it works too. A free key secures LLM7’s published free limits (1 a second, 60 a minute, 250 an hour). It stays on this device and is never put in a backup.</p>
      <p class="tiny muted" style="margin:10px 0 0">The cloud tutor sends your question and the problem on screen to these services. It never sends your name or your progress. Don’t type personal details. The on-device models send nothing anywhere.</p></details>`;
  }

  /** while the free AI is busy, say so honestly, and give Procademy's own checked first step if there is one */
  function waitingText() {
    if (!waiting) return thinkingHtml();
    const step = context && context.question && context.steps && context.steps[0];
    return `<span class="muted">The free AI services are busy for a moment. Your reply is coming in ${waiting.seconds} s…</span>` +
      (step ? `<div class="tutor-wait-step"><div class="tiny muted">While you wait, Procademy’s first step:</div>${esc(step)}</div>` : '');
  }

  function render() {
    if (!panel || panel.hidden) return;
    const body = panel.querySelector('#tutor-body'), status = panel.querySelector('#tutor-status'), note = panel.querySelector('#tutor-note');
    panel.querySelector('#tutor-about').innerHTML = view === 'chat' ? aboutText() : '';
    const ready = T.state === 'ready', cloud = ready && T.isCloud();
    const L = T.local;
    status.textContent = waiting ? `Free tutor · next reply in ${waiting.seconds} s`
      : ready ? (cloud ? (L.state === 'ready' ? 'Unlimited · never a wait' : L.state === 'loading' ? `Free tutor · unlimited mode ${Math.round((L.progress.fraction || 0) * 100)}%` : 'Free cloud tutor · no download') : `${T.model(T.modelId).name} · on this device`)
      : T.state === 'loading' ? 'Starting…' : 'Off';
    note.textContent = view !== 'chat' ? '' : cloud ? (L.state === 'ready' ? 'Free AI: from the cloud when it is free, from this device when it is busy. It can make mistakes; Procademy checks every practice answer itself.' : 'Free AI (GPT-OSS through LLM7 and Pollinations). It can make mistakes; Procademy checks every practice answer itself.')
      : ready ? 'Runs on this device. It can make mistakes; Procademy checks every practice answer itself.' : '';
    let html = '';
    if (view === 'settings') html = (window.COACH && COACH.canSpeak() ? `<div class="tutor-card"><label class="tutor-check"><input type="checkbox" id="tutor-voice" ${pref().voice ? 'checked' : ''}><span><b>Read answers aloud</b><br><span class="small muted">Each answer is read in this device’s voice as soon as it’s ready.</span></span></label></div>` : '')
      + `<div class="tutor-card"><label class="small" for="tutor-lang"><b>Explanations</b></label><select id="tutor-lang" class="tutor-lang">${LANGS.map(([v, l]) => `<option value="${v}" lang="${v}" ${(pref().lang || 'en') === v ? 'selected' : ''}>${l}</option>`).join('')}</select><p class="tiny muted" style="margin:6px 0 0">Practice questions and lessons stay in English.</p></div>`
      + memoryCard() + settingsCard();
    else {
      if (T.state === 'loading') {
        const pct = Math.round((T.progress.fraction || 0) * 100);
        html = `<div class="tutor-card"><p><b>${T.progress.fraction > 0 && T.progress.fraction < 1 ? 'Downloading the on-device tutor…' : 'Starting the tutor…'}</b></p>
          <div class="pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>
          <p class="tiny muted" style="margin-top:6px">${esc(T.progress.text || '')}</p>
          <p class="small muted">The first time takes a few minutes; after that it starts in seconds, even offline. <a href="#" class="tutor-use-cloud">Use the free cloud tutor instead</a>.</p></div>`;
      } else if (T.state === 'error') {
        html = `<div class="feedback bad"><span>${esc(T.error)}</span></div><div class="btn-row"><button class="btn sm tutor-use-cloud">Use the free cloud tutor</button></div>`;
      } else if (ready && !history.length && context && context.question) {
        const q = context.question.length > 240 ? context.question.slice(0, 237) + '…' : context.question;
        html = `<div class="tutor-card tutor-q"><div class="tiny muted">Help with this question</div><div class="tutor-q-text">${esc(q)}</div></div>
          <div class="tmsg assistant"><p>Ask anything about it, or pick a button below. The tutor won’t give the answer before you’ve tried it.</p></div>`;
      } else if (ready && !history.length) {
        html = `<div class="tmsg assistant"><p>This is the Procademy tutor. Ask for an explanation, another example or a hint, in any subject. The tutor doesn’t reveal the answer to a practice question before you have tried it.</p></div>`;
      }
      const lastBot = history.length && history[history.length - 1].role === 'assistant' ? history.length - 1 : -1;
      html += history.map((m, i) => `<div class="tmsg ${m.role}" data-i="${i}">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>') + filesOf(m)
        : (m.content || m.viz || m.pic ? T.render(m.content, m) + (m.via === 'device' && cloud ? '<div class="tmsg-via">answered on this device</div>' : '') : '') + (!m.content && !m.pic ? waitingText() : '')
          + (i === lastBot && m.content && !m.pic && !T.busy() ? `<div class="ai-actions tutor-more">${MORE.map(([l], k) => `<button type="button" class="chip-btn" data-more="${k}">${l}</button>`).join('')}</div>` : '')}</div>`).join('');
    }
    body.innerHTML = html;
    if (view === 'chat' && !T.busy()) body.querySelectorAll('.tmsg.assistant[data-i]').forEach(el => pace(el, history[Number(el.dataset.i)]));
    body.querySelectorAll('[data-more]').forEach(b => b.addEventListener('click', () => { const k = Number(b.dataset.more); send(MORE[k][1] || pictureAsk(history)); }));
    const lSel = body.querySelector('#tutor-lang');
    if (lSel) lSel.addEventListener('change', () => setPref({ lang: lSel.value }));
    if (view === 'settings') wireMemory(body, render);
    const vBox = body.querySelector('#tutor-voice');
    if (vBox) vBox.addEventListener('change', () => { setPref({ voice: vBox.checked }); if (!vBox.checked && window.speechSynthesis) speechSynthesis.cancel(); });
    const uBox = body.querySelector('#tutor-unlimited');
    if (uBox) uBox.addEventListener('change', () => { setPref({ unlimited: uBox.checked }); if (uBox.checked) { if (T.local.state === 'error') T.local.state = 'off'; maybePrepare(); } render(); });
    const adv = body.querySelector('.tutor-advanced');
    if (adv) { adv.open = !!openAdvanced; adv.addEventListener('toggle', () => { openAdvanced = adv.open; }); }
    body.querySelectorAll('.tutor-provider').forEach(cb => cb.addEventListener('change', () => {
      const off = [...body.querySelectorAll('.tutor-provider')].filter(x => !x.checked).map(x => x.value);
      setPref({ cloudOff: off });
    }));
    const keySave = body.querySelector('#tutor-key-save'), keyClear = body.querySelector('#tutor-key-clear');
    if (keySave) keySave.addEventListener('click', () => { const v = body.querySelector('#tutor-llm7-key').value.trim(); if (v) { setSecret('llm7', v); render(); } });
    if (keyClear) keyClear.addEventListener('click', () => { setSecret('llm7', ''); render(); });
    const use = body.querySelector('#tutor-use');
    if (use) use.addEventListener('click', () => {
      const id = (body.querySelector('input[name="tutor-engine"]:checked') || {}).value || 'cloud';
      setPref({ engine: id, enabled: true });
      view = 'chat';
      T.start(id).then(() => { if (pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
      render();
    });
    body.querySelectorAll('.tutor-use-cloud').forEach(a => a.addEventListener('click', ev => {
      ev.preventDefault(); setPref({ engine: 'cloud', enabled: true });
      T.start('cloud').then(() => { if (pending) { const q = pending; pending = null; send(q); } });
    }));
    const quick = panel.querySelector('#tutor-quick');
    let kind = 'none';
    if (context) kind = context.question ? (context.answerShown ? 'done' : context.studentAnswer ? 'wrong' : 'question') : context.lesson ? 'lesson' : context.skill ? 'skill' : 'none';
    quick.innerHTML = view === 'chat' && ready && !T.busy() ? QUICK[kind].map(q => `<button type="button" class="btn sm">${esc(q)}</button>`).join('') : '';
    quick.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.textContent, { page: b.textContent === PAGE_Q })));
    panel.querySelector('#tutor-text').placeholder = context && context.question ? 'Ask about this question…' : 'Ask, or ask for a graph…';
    const sendBtn = panel.querySelector('#tutor-send');
    sendBtn.textContent = T.busy() ? 'Stop' : 'Send';
    sendBtn.type = T.busy() ? 'button' : 'submit';
    sendBtn.onclick = T.busy() ? (ev => { ev.preventDefault(); T.stop(); }) : null;
    panel.querySelector('#tutor-form').hidden = view !== 'chat';
    panel.querySelector('#tutor-text').disabled = !ready;
    const att = panel.querySelector('#tutor-attach'); if (att) att.disabled = !ready || view !== 'chat';
    body.scrollTop = history.length && view === 'chat' ? body.scrollHeight : 0;      // a chat follows the newest reply; settings read from the top
  }

  async function send(text, opts) {
    text = String(text || '').trim();
    if (T.busy() || (tray && tray.busy())) { if (tray && tray.busy()) note('Still reading your file…'); return; }
    if (!text && !(tray && tray.count())) return;
    if (!text) text = 'Help me with this.';
    const files = tray ? tray.peek() : [];
    const plan = UI.plan(text, history, context, files);
    if (opts && opts.page) plan.ctx = Object.assign({}, plan.ctx || {}, { notes: [plan.ctx && plan.ctx.notes, pageText()].filter(Boolean).join(' ') });
    if (plan.pic || plan.refuse) {                       // a picture needs no AI reply, and works before the tutor starts
      panel.querySelector('#tutor-text').value = '';
      history.push({ role: 'user', content: text });
      history.push(plan.refuse ? { role: 'assistant', content: plan.refuse } : { role: 'assistant', content: `Here is a picture of ${plan.pic.prompt}.`, pic: plan.pic });
      view = 'chat'; render(); return;
    }
    if (T.state !== 'ready') { pending = text; ensureStarted(); render(); return; }
    maybePrepare();
    view = 'chat';
    panel.querySelector('#tutor-text').value = '';
    if (tray) tray.take();
    history.push({ role: 'user', content: text, files: files.length ? files.map(FILES.keep) : undefined });
    const reply = { role: 'assistant', content: '', viz: plan.viz || undefined };
    history.push(reply);
    render();
    const t0 = performance.now();
    try {
      const full = await T.ask(UI.forModel(history.slice(0, -1)), plan.ctx, partial => {
        reply.content = partial;
        const last = panel.querySelector('#tutor-body .tmsg.assistant:last-child');
        if (last) { last.innerHTML = T.render(partial, reply); panel.querySelector('#tutor-body').scrollTop = 1e9; }
      }, w => { waiting = w; render(); });
      reply.content = full || reply.content || (reply.viz ? '' : 'Sorry, I couldn’t think of an answer. Try asking another way.');
      reply.via = T.lastProvider;
      UI.finish(text, reply);
      noteTime(performance.now() - t0);
      speak(reply);
      if (window.BADGES) BADGES.flag('tutor');
    } catch (e) {
      reply.content = (e && e.message) ? e.message : 'Sorry, something went wrong.';
    }
    waiting = null;
    render();
  }
  function note(t) { const n = panel.querySelector('#tutor-note'); if (n) n.textContent = t; }
  function filesOf(m) { return m.files && m.files.length && FILES ? `<div class="file-chips">${m.files.map(FILES.chip).join('')}</div>` : ''; }

  function ensureStarted() {
    if (T.state === 'ready' || T.state === 'loading') return;
    let id = chosenEngine();
    if (id !== 'cloud' && id !== 'builtin' && !T.supported()) { id = 'cloud'; setPref({ engine: 'cloud' }); }
    // send the waiting question only if the tutor really started (never loop back into ensureStarted)
    T.start(id).then(() => { if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); } }).catch(() => {});
  }

  const UI = {
    /** what the learner is looking at; views call this on every render */
    setContext(c) {
      const changed = JSON.stringify(c || null) !== JSON.stringify(context);
      if (changed && context && c && (context.question || '') !== (c.question || '') && history.length) history = [];   // a new question starts a new chat
      context = c || null;
      if (panel && !panel.hidden && changed) render();
      if (changed && c && c.question) setTimeout(() => warm(), 1500);           // a question on screen: the tutor may be asked soon
    },
    getContext() { return context; },
    /** open the panel; { ask } sends that question as soon as the tutor is ready */
    open(opts) {
      opts = opts || {};
      build();
      panel.hidden = false;
      view = 'chat';
      document.body.classList.add('tutor-open');
      if (opts.ask) pending = opts.ask;
      if (T.state === 'ready' && pending) { const q = pending; pending = null; send(q); }
      else ensureStarted();
      maybePrepare();
      render();
      setTimeout(() => { const t = panel.querySelector('#tutor-text'); if (t && !t.disabled) t.focus(); }, 0);
    },
    close() { if (!panel) return; panel.hidden = true; document.body.classList.remove('tutor-open'); const f = document.getElementById('tutor-fab'); if (f) f.focus(); },
    reset() { history = []; pending = null; render(); },
    history() { return history; },
    showSettings() { build(); panel.hidden = false; document.body.classList.add('tutor-open'); view = 'settings'; render(); },
    /** for the full page: start the tutor and unlimited mode as the panel would */
    ensureReady() { ensureStarted(); maybePrepare(); return T.state === 'ready' ? Promise.resolve(T) : new Promise(res => { const off = T.on(() => { if (T.state === 'ready' || T.state === 'error') { off(); res(T); } }); }); },
    unlimitedOn, setPref, pref,
    /** start unlimited mode's on-device helper in the background, as opening the tutor does (practice on any topic) */
    prepareBackup: maybePrepare,
    /** the conversation the ⤢ button carried over, once */
    takeHandoff() { const h = handoff; handoff = null; return h; },
    applySize,
    pace, pictureAsk, pageText, thinkingHtml, noteTime, speak, voiceOn, MORE, PAGE_Q,
    micHtml, wireMic, warm, memoryItems, memoryText, memoryCard, wireMemory, withPrefs, LANGS, LANG_LINE, whiteboard, stepsOf,
    /** what a question needs before it is sent: a drawing Procademy makes itself (viz), a picture to make
        instead of an AI reply (pic), and the context with any drawing and attached files described */
    plan(text, msgs, ctx, files) {
      const D = window.DRAW, Pi = window.PICTURES;
      files = files || [];
      const prev = [...(msgs || [])].reverse().find(m => m.viz);
      let viz = D ? D.fromRequest(text, prev && prev.viz) : null;
      const csv = files.find(f => f.kind === 'csv');
      if (!viz && csv && FILES && (!D || D.wants(text) || /^help me with this/i.test(text))) viz = FILES.drawingOf(csv);
      const want = !viz && !files.length && Pi ? Pi.wants(text) : null;
      if (want && Pi.blocked(want.prompt)) return { refuse: 'Procademy can’t create that picture. Request something suitable for school, such as a diagram for a word problem.' };
      // files stay part of the conversation for a few questions, so "now do number 3" still works
      const recent = files.length ? files : ((msgs || []).slice(-6).reverse().find(m => m.role === 'user' && m.files && m.files.length) || {}).files || [];
      const out = Object.assign({}, ctx || {});
      if (viz && D) out.drawn = D.describe(viz);
      if (recent.length && FILES) out.files = FILES.contextText(recent);
      return { viz, pic: want ? Pi.make(want.prompt) : null, ctx: withPrefs(viz || recent.length ? out : ctx, (ctx && ctx.langCode) || null) };
    },
    /** after the answer: fold the tutor's own graph into Procademy's, or draw what it described in words */
    finish(text, reply) {
      const D = window.DRAW;
      if (!D) return;
      if (reply.viz) { const r = D.absorb(reply.viz, reply.content); reply.viz = r.viz; reply.content = r.content; }
      else if (D.wants(text) && !/```/.test(reply.content || '')) { const v = D.fromReply(reply.content); if (v) reply.viz = v; }
      if (!reply.content && reply.viz) reply.content = 'Here it is. Point at a curve (or tap it) to read off a point.';
    },
    /** the conversation as the model sees it: drawings as their blocks, files by name */
    forModel(msgs) {
      return msgs.map(m => ({ role: m.role, content: (m.viz ? m.viz + '\n' : '') + (m.files && m.files.length ? `[attached: ${m.files.map(f => f.name).join(', ')}] ` : '') + (m.content || '') }));
    },
    init() { applyCloud(); build(); },
  };
  window.TUTORUI = UI;
})();
