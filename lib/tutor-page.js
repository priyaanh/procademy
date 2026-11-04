/* The tutor's own page (#/tutor): saved chats, what to ask about, how to explain, and answers with
   follow-ups and links to the Procademy practice that matches. It uses the same engine as the panel
   (TUTOR), so the free cloud services and unlimited mode work here too. Chats are kept on this device
   only (localStorage, never in a backup file). */
'use strict';
(function () {
  const A = window.ACADEMY, S = window.STORE, T = window.TUTOR, UI = window.TUTORUI, V = window.VIEWS, M = window.M, FILES = window.FILES;
  const H = V._h, esc = M.esc;
  const KEY = 'procademy.chats.v1', MAX_CHATS = 30, MAX_MESSAGES = 60;

  /* ---------- saved chats ---------- */
  function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && Array.isArray(o.chats) ? o : { chats: [] }; } catch (e) { return { chats: [] }; } }
  function save(o) { try { o.chats = o.chats.slice(0, MAX_CHATS); localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage full or blocked: the chat still works */ } }
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  function getChat(id) { return load().chats.find(c => c.id === id) || null; }
  function putChat(chat) {
    const o = load();
    chat.updated = Date.now();
    chat.messages = chat.messages.slice(-MAX_MESSAGES);
    o.chats = [chat].concat(o.chats.filter(c => c.id !== chat.id));
    save(o);
  }
  function deleteChat(id) { const o = load(); o.chats = o.chats.filter(c => c.id !== id); save(o); }
  const blankChat = () => ({ id: newId(), title: 'New chat', created: Date.now(), updated: Date.now(), about: 'general', level: 'auto', style: 'steps', messages: [] });

  /* ---------- what to ask about, and how ---------- */
  const LEVELS = [['auto', 'My level'], ['Elementary school', 'Elementary'], ['6th grade', '6th grade'], ['7th grade', '7th grade'], ['8th grade', '8th grade'], ['High school', 'High school']];
  const STYLES = [
    ['steps', 'Step by step', 'Step by step, saying why each step works.'],
    ['short', 'Short', 'Short and simple: the key idea in a few sentences.'],
    ['example', 'With an example', 'Start from a fully worked example, then explain the idea.'],
    ['new', 'I’m new to this', 'As if the student has never seen it: start from what they already know, avoid jargon.'],
    ['check', 'Check my work', 'The student will share their working: check each step, say which are right, and explain any mistake kindly.'],
  ];
  /** a level from what the learner is doing: their class book, else their first saved course */
  function myLevel() {
    const pg = S.get().profile.grade;
    if (pg != null && pg !== '') return pg === 0 ? 'Elementary school' : pg <= 5 ? 'Elementary school' : pg >= 9 ? 'High school' : `${pg}th grade`;
    const c = S.get().profile.cpm, book = c && A.cpmById(c.book);
    const g = book ? book.grade : (S.get().profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0] || {}).grade;
    if (g == null) return '';
    return g <= 5 ? 'Elementary school' : g >= 9 ? 'High school' : `${g}th grade`;
  }
  /** the choices for "Ask about": anything, the class lesson, and skills the learner is working on */
  function aboutOptions() {
    const out = [{ id: 'general', label: 'Any question, any subject' }];
    const c = S.get().profile.cpm, found = c && A.cpmLesson(c.book, c.lesson);
    if (found) out.push({ id: 'lesson', label: `My class lesson: ${found.book.short} ${CPMVIEWS.lessonName(found.lesson)}` });
    const seen = new Set();
    S.get().recent.concat(S.get().profile.enrolled.map(id => A.courseById(id)).filter(Boolean).map(co => A.courseSkills(co).find(id => S.skill(id).level < 3)))
      .filter(id => id && A.skills[id] && !seen.has(id) && seen.add(id)).slice(0, 8)
      .forEach(id => out.push({ id: 'skill:' + id, label: 'Skill: ' + H.plain(A.skills[id].title) }));
    return out;
  }
  /** the context object the engine sends with each question */
  function contextFor(chat) {
    const st = STYLES.find(x => x[0] === chat.style);
    const level = chat.level === 'auto' ? myLevel() : chat.level;
    let ctx = {};
    if (chat.about === 'lesson') {
      const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
      if (f) ctx = { course: f.book.title, lesson: CPMVIEWS.lessonName(f.lesson), notes: f.lesson.topic + ' Skills practiced: ' + f.lesson.skills.filter(id => A.skills[id]).map(id => H.plain(A.skills[id].title)).join(', ') + '.' };
    } else if (String(chat.about).startsWith('skill:')) {
      const id = chat.about.slice(6), def = A.skills[id], w = A.whereIs(id);
      if (def) ctx = { course: w ? w.course.title : '', skill: H.plain(def.title), notes: H.plain(def.learn) };
    } else if (chat.about === 'carried' && chat.carried) ctx = Object.assign({}, chat.carried);
    if (level) ctx.level = level;
    if (st) ctx.style = st[2];
    return ctx;
  }

  /* ---------- related practice: the skills whose titles share the words of the question ---------- */
  const STOP = new Set('what when where which while with without would could should about above after again also because been before being between both does doing down during each from further have having here into just more most other over same some such than that their them then there these they this those through under until very want your yours explain please help show tell give make know mean means need does work works solve find another example question questions answer step steps like math number numbers problem problems homework worksheet page graph draw'.split(' '));
  /** a light stemmer, so "inequalities", "inequality" and "dividing", "divide" meet */
  function stem(w) {
    if (w.length > 5 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 5 && /(ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
    if (w.length > 6 && w.endsWith('ing')) return w.slice(0, -3).replace(/(.)\1$/, '$1');
    if (w.length > 5 && w.endsWith('ed')) return w.slice(0, -2);
    if (w.length > 5 && w.endsWith('e')) return w.slice(0, -1);
    return w;
  }
  const words = t => A.normText(t).split(' ').filter(w => w.length >= 4 && !STOP.has(w)).map(stem);
  let index = null;
  /** for every skill: the words of its title, its unit and its lesson, and how rare each title word is */
  function buildIndex() {
    const docs = [], df = {};
    Object.keys(A.skills).forEach(id => {
      const w = A.whereIs(id); if (!w) return;
      const title = new Set(words(H.plain(A.skills[id].title)));
      const unit = new Set(words(w.unit.title));
      const learn = new Set(words(H.plain(A.skills[id].learn || '')));
      title.forEach(x => { df[x] = (df[x] || 0) + 1; });
      docs.push({ id, title, unit, learn, grade: w.course.grade });
    });
    const n = docs.length;
    const idf = x => Math.log(1 + n / (1 + (df[x] || 0)));
    return { docs, idf };
  }
  /** the Procademy skills that best match a question: title words count most, then the unit, then the lesson
      text; rare words count more than common ones, and skills near the learner's grade get a lift */
  function related(text, grade) {
    const q = [...new Set(words(text))];
    if (!q.length) return [];
    index = index || buildIndex();
    const scored = index.docs.map(d => {
      let sc = 0, titleHits = 0;
      q.forEach(x => { const w = index.idf(x); if (d.title.has(x)) { sc += 3 * w; titleHits++; } if (d.unit.has(x)) sc += 1 * w; if (d.learn.has(x)) sc += 0.8 * w; });
      if (grade != null && d.grade != null) sc *= Math.abs(d.grade - grade) <= 1 ? 1.5 : Math.abs(d.grade - grade) <= 3 ? 1 : 0.6;
      return { id: d.id, sc, titleHits };
    }).filter(x => x.titleHits > 0 || x.sc > 6);
    return scored.sort((a, b) => b.sc - a.sc).slice(0, 3).map(x => x.id);
  }
  /** the learner's grade as a number, for ranking related practice */
  function gradeNumber(chat) {
    const lv = chat.level === 'auto' ? myLevel() : chat.level;
    const m = /(\d+)th grade/.exec(lv || '');
    return m ? Number(m[1]) : /High school/.test(lv || '') ? 10 : /Elementary/.test(lv || '') ? 4 : null;
  }

  /* ---------- the page ---------- */
  let current = null, root = null, busy = false, sessionTimes = [], statusWired = false, tray = null;

  function tutorPage(el, id) {
    root = el;
    document.body.classList.add('on-ai-page');
    UI.close();
    let chat = null;
    if (id === 'new') {
      chat = blankChat();
      const h = UI.takeHandoff();
      if (h && h.history && h.history.length) {
        chat.messages = h.history.filter(m => m.content || m.viz || m.pic).map(m => ({ role: m.role, content: m.content, via: m.via, viz: m.viz, pic: m.pic, files: m.files }));
        if (h.context) { chat.about = 'carried'; chat.carried = h.context; }
        chat.title = titleFrom(chat.messages);
        putChat(chat);
      }
    } else if (id) chat = getChat(id);
    if (!chat) { const first = load().chats[0]; chat = first || blankChat(); }
    current = chat;
    if (id !== chat.id && chat.messages.length) history.replaceState(null, '', '#/tutor/' + chat.id);
    draw();
    UI.ensureReady().then(() => drawStatus());
    if (!statusWired) { statusWired = true; T.on(() => { if (root && root.isConnected && document.body.classList.contains('on-ai-page')) drawStatus(); }); }
  }
  const titleFrom = msgs => { const u = msgs.find(m => m.role === 'user'); const t = u ? u.content.replace(/\s+/g, ' ').trim() : 'New chat'; return t.length > 52 ? t.slice(0, 49) + '…' : t; };

  function draw() {
    const chat = current;
    const chats = load().chats;
    const abouts = aboutOptions();
    if (chat.about === 'carried') abouts.unshift({ id: 'carried', label: 'The question I was working on' });
    root.innerHTML = `
      <div class="ai-page">
        <aside class="ai-side">
          <button class="btn primary block" id="ai-new">+ New chat</button>
          <div class="ai-chats card tight" aria-label="Your chats">
            ${chats.length ? chats.map(c => `<div class="ai-chat${c.id === chat.id ? ' on' : ''}"><a href="#/tutor/${c.id}" title="${esc(c.title)}"><span class="t">${esc(c.title)}</span><span class="w tiny muted">${ago(c.updated)} · ${c.messages.filter(m => m.role === 'user').length} q</span></a>
              <button class="iconbtn sm ai-del" data-del="${c.id}" aria-label="Delete this chat">✕</button></div>`).join('') : '<p class="small muted" style="margin:6px 4px">Your chats will be kept here, on this device.</p>'}
          </div>
          <div class="card tight ai-status" id="ai-status"></div>
        </aside>
        <section class="ai-main card">
          <div class="ai-controls">
            <label class="ai-field"><span class="tiny muted">Ask about</span><select id="ai-about">${abouts.map(o => `<option value="${esc(o.id)}" ${o.id === chat.about ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
            <label class="ai-field"><span class="tiny muted">Explain for</span><select id="ai-level">${LEVELS.map(([v, l]) => `<option value="${esc(v)}" ${v === chat.level ? 'selected' : ''}>${esc(v === 'auto' && myLevel() ? `My level (${myLevel()})` : l)}</option>`).join('')}</select></label>
            <div class="ai-field"><span class="tiny muted">Style</span><div class="ai-styles" role="radiogroup" aria-label="Explanation style">${STYLES.map(([v, l]) => `<button type="button" role="radio" aria-checked="${v === chat.style}" class="chip-btn${v === chat.style ? ' on' : ''}" data-style="${v}">${esc(l)}</button>`).join('')}</div></div>
          </div>
          <div class="ai-thread" id="ai-thread" aria-live="polite">${thread()}</div>
          <form class="ai-compose" id="ai-form">
            <div class="file-tray" id="ai-tray" hidden></div>
            <textarea id="ai-text" rows="2" placeholder="${chat.style === 'check' ? 'Paste your working, one step per line, or attach a photo of it…' : 'Ask about anything (math, science, reading, history, languages…), ask for a graph, or attach a photo of your homework…'}" aria-label="Your question"></textarea>
            <div class="ai-compose-row">${FILES ? `<button class="btn sm ghost attach-btn" id="ai-attach" type="button" title="Attach a photo, PDF or text file">Attach a file</button><input type="file" id="ai-file" accept="${FILES.ACCEPT}" multiple hidden>` : ''}<span class="tiny muted" id="ai-hint"></span>
              <button class="btn primary" id="ai-send" type="submit">Send</button></div>
          </form>
        </section>
      </div>`;
    bind();
    drawStatus();
    scrollDown();
  }

  function thread() {
    const chat = current;
    if (!chat.messages.length) return starters();
    return chat.messages.map((m, i) => m.role === 'user'
      ? `<div class="ai-msg user"><div class="bubble">${esc(m.content).replace(/\n/g, '<br>')}${m.files && m.files.length && FILES ? `<div class="file-chips">${m.files.map(FILES.chip).join('')}</div>` : ''}</div></div>`
      : `<div class="ai-msg bot" data-i="${i}"><div class="bubble">${m.content || m.viz || m.pic ? T.render(m.content, m) : ''}${m.pending && !m.content ? '<span class="muted">Thinking…</span>' : ''}</div>${m.content && !m.pending && !m.pic ? actions(m, i) : ''}</div>`).join('');
  }
  function actions(m, i) {
    const um = current.messages.slice(0, i).reverse().find(x => x.role === 'user') || {};
    const q = (um.content || '') + ' ' + (um.files || []).map(f => f.text || '').join(' ').slice(0, 600);
    const rel = related(q + ' ' + (current.about.startsWith('skill:') ? H.plain(A.skills[current.about.slice(6)] ? A.skills[current.about.slice(6)].title : '') : ''), gradeNumber(current));
    const via = m.via === 'device' ? 'This device' : m.via === 'llm7' ? 'Cloud · LLM7' : m.via === 'pollinations' ? 'Cloud · Pollinations' : m.via ? 'Cloud' : '';
    return `<div class="ai-actions">
      <button type="button" class="chip-btn" data-act="copy" data-i="${i}">Copy</button>
      ${window.COACH && COACH.canSpeak() ? `<button type="button" class="chip-btn say-btn" data-say="${esc(T.render(m.content))}" aria-label="Read this answer aloud">Read aloud</button>` : ''}
      <button type="button" class="chip-btn" data-follow="Explain that more simply.">Simpler</button>
      <button type="button" class="chip-btn" data-follow="Show me another worked example, with different numbers.">Another example</button>
      <button type="button" class="chip-btn" data-follow="Give me one practice question like this. Don't tell me the answer until I reply.">Practice question</button>
      <button type="button" class="chip-btn" data-follow="Why does that work? Explain the idea behind it.">Why?</button>
      ${via ? `<span class="tiny muted ai-meta">${esc(via)}${m.ms ? ' · ' + (m.ms / 1000).toFixed(1) + ' s' : ''}</span>` : ''}
    </div>
    ${rel.length ? `<div class="ai-related"><span class="tiny muted">Practice on Procademy:</span>${rel.map(id => `<a class="chip-btn" href="#/practice/${encodeURIComponent(id)}">${H.lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div>` : ''}`;
  }
  function starters() {
    const items = [];
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    if (f) items.push({ about: 'lesson', q: `Explain my class lesson, ${CPMVIEWS.lessonName(f.lesson)}, step by step.`, label: `Explain my class lesson`, sub: `${f.book.short} · ${CPMVIEWS.lessonName(f.lesson)}` });
    const rec = S.get().recent.filter(id => A.skills[id])[0];
    if (rec) {
      items.push({ about: 'skill:' + rec, q: `Explain ${H.plain(A.skills[rec].title)} with a new example.`, label: 'A new example', sub: H.plain(A.skills[rec].title) });
      items.push({ about: 'skill:' + rec, q: `Give me one practice question on ${H.plain(A.skills[rec].title)}. Don't tell me the answer until I reply.`, label: 'Quiz me', sub: H.plain(A.skills[rec].title) });
    }
    items.push({ q: 'Graph y = 2x + 1 and y = -x + 4, and show me where they meet.', label: 'Draw a graph', sub: 'Lines, curves, inequalities: drawn exactly, so you can explore them' });
    items.push({ link: '#/steps', label: 'Step checker', sub: 'Each line of your work is checked by calculation' });
    items.push({ style: 'check', fill: 'Here is my working:\n', label: 'Check my working', sub: 'Paste your steps, or attach a photo; the tutor checks each one' });
    [['What is slope, and how do I find it?', 'Slope'], ['How do I add fractions with different denominators?', 'Adding fractions'], ['Why do I flip the sign when I divide an inequality by a negative?', 'Inequalities'], ['What is the difference between area and perimeter?', 'Area and perimeter']]
      .forEach(([q, l]) => items.push({ q, label: l, sub: q }));
    return `<div class="ai-empty"><h2>What would you like to understand?</h2>
      <p class="muted">Ask anything, or start from one of these. The tutor explains step by step, never gives away a practice answer before you try, and points you to practice that matches.</p>
      <div class="ai-starters">${items.slice(0, 8).map((it, k) => `<button type="button" class="ai-starter" data-k="${k}"><b>${esc(it.label)}</b><span class="small muted">${esc(it.sub)}</span></button>`).join('')}</div></div>`
      .replace('<div class="ai-starters">', `<div class="ai-starters" data-items='${esc(JSON.stringify(items.slice(0, 8)))}'>`);
  }

  function drawStatus() {
    const hint = root && root.querySelector('#ai-hint');
    if (hint) hint.textContent = 'Enter sends · Shift+Enter for a new line · ' + (T.state !== 'ready' ? 'starting…' : T.isCloud() ? (T.localReady() ? 'answers come from the cloud, or this device when it is busy' : 'questions go to a free AI service, never your name or progress') : 'runs on this device');
    const box = root && root.querySelector('#ai-status');
    if (!box) return;
    const L = T.local, cloud = T.isCloud && T.isCloud();
    const pct = Math.round((L.progress.fraction || 0) * 100);
    const model = L.modelId ? T.model(L.modelId) : null;
    const avg = sessionTimes.length ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length / 1000).toFixed(1) : null;
    const rows = [];
    rows.push(['How it runs', cloud ? 'Free cloud AI (GPT-OSS 20B)' : T.state === 'ready' ? T.model(T.modelId).name + ' on this device' : 'Starting…']);
    if (cloud) {
      const u = UI.unlimitedOn();
      rows.push(['Unlimited mode', !u ? 'Off' : L.state === 'ready' ? 'On · never a wait' : L.state === 'loading' ? `Getting ready · ${pct}%` : L.state === 'unsupported' ? 'Not on this device' : L.state === 'error' ? 'Could not start' : 'Starts when you ask']);
      if (model && u) rows.push(['On-device model', model.id === 'builtin' ? 'The browser’s own' : `${model.name} · ${model.size}`]);
    }
    if (T.lastProvider) rows.push(['Last answer', T.lastProvider === 'device' ? 'This device' : T.lastProvider === 'llm7' ? 'Cloud · LLM7' : 'Cloud · Pollinations']);
    if (avg) rows.push(['Average reply', avg + ' s']);
    box.innerHTML = `<p class="small" style="margin:0 0 6px"><b>Tutor details</b></p>
      <dl class="ai-dl">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${cloud && L.state === 'loading' ? `<div class="pbar" style="margin:4px 0 8px"><span style="width:${pct}%"></span></div>` : ''}
      ${cloud && L.state !== 'unsupported' ? `<label class="tutor-check small"><input type="checkbox" id="ai-unlimited" ${UI.unlimitedOn() ? 'checked' : ''}><span>Unlimited mode: also run the AI on this device so there is never a wait</span></label>` : ''}
      <button class="btn sm ghost" id="ai-settings" type="button">All tutor settings</button>
      <p class="tiny muted" style="margin:6px 0 0">Chats stay on this device. The tutor can make mistakes; Procademy checks every practice answer itself.</p>`;
    const u = box.querySelector('#ai-unlimited');
    if (u) u.addEventListener('change', () => { UI.setPref({ unlimited: u.checked }); if (u.checked) { if (T.local.state === 'error') T.local.state = 'off'; UI.ensureReady(); } drawStatus(); });
    box.querySelector('#ai-settings').addEventListener('click', () => UI.showSettings());
  }

  function bind() {
    const chat = current;
    root.querySelector('#ai-new').addEventListener('click', () => { location.hash = '#/tutor/new'; });
    root.querySelectorAll('.ai-del').forEach(b => b.addEventListener('click', ev => {
      ev.preventDefault();
      if (!confirm('Delete this chat?')) return;
      deleteChat(b.dataset.del);
      if (b.dataset.del === chat.id) location.hash = '#/tutor/new'; else draw();
    }));
    const about = root.querySelector('#ai-about'), level = root.querySelector('#ai-level');
    about.addEventListener('change', () => { chat.about = about.value; if (chat.messages.length) putChat(chat); });
    level.addEventListener('change', () => { chat.level = level.value; if (chat.messages.length) putChat(chat); });
    root.querySelectorAll('[data-style]').forEach(b => b.addEventListener('click', () => {
      chat.style = b.dataset.style; if (chat.messages.length) putChat(chat);
      root.querySelectorAll('[data-style]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)); });
      root.querySelector('#ai-text').placeholder = chat.style === 'check' ? 'Paste your working, one step per line, or attach a photo of it…' : 'Ask about anything (math, science, reading, history, languages…), ask for a graph, or attach a photo of your homework…';
    }));
    const form = root.querySelector('#ai-form'), text = root.querySelector('#ai-text');
    form.addEventListener('submit', ev => { ev.preventDefault(); if (busy) { T.stop(); return; } send(text.value); });
    text.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); } });
    text.addEventListener('input', () => { text.style.height = 'auto'; text.style.height = Math.min(220, text.scrollHeight) + 'px'; });
    // files: the Attach button, a pasted picture, or a file dropped on the chat
    if (FILES) {
      if (!tray) tray = FILES.tray(root.querySelector('#ai-tray'), () => drawStatus());
      else tray.mount(root.querySelector('#ai-tray'));
      const input = root.querySelector('#ai-file');
      root.querySelector('#ai-attach').addEventListener('click', () => input.click());
      input.addEventListener('change', () => { tray.add(input.files); input.value = ''; });
      text.addEventListener('paste', ev => { const f = ev.clipboardData && [...ev.clipboardData.files]; if (f && f.length) { ev.preventDefault(); tray.add(f); } });
      const main = root.querySelector('.ai-main');
      main.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); main.classList.add('dropping'); } });
      main.addEventListener('dragleave', ev => { if (!main.contains(ev.relatedTarget)) main.classList.remove('dropping'); });
      main.addEventListener('drop', ev => { main.classList.remove('dropping'); if (ev.dataTransfer && ev.dataTransfer.files.length) { ev.preventDefault(); tray.add(ev.dataTransfer.files); } });
    }
    bindThread();
  }
  function bindThread() {
    const th = root.querySelector('#ai-thread');
    th.querySelectorAll('[data-follow]').forEach(b => b.addEventListener('click', () => send(b.dataset.follow)));
    th.addEventListener('click', ev => { const b = ev.target.closest('[data-ask]'); if (b) { ev.preventDefault(); send(b.dataset.ask); } });
    th.querySelectorAll('[data-act="copy"]').forEach(b => b.addEventListener('click', () => {
      const m = current.messages[Number(b.dataset.i)];
      const done = () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1500); };
      try { navigator.clipboard.writeText(m.content).then(done, () => { V.toast('Could not copy'); }); } catch (e) { V.toast('Could not copy'); }
    }));
    const st = th.querySelector('.ai-starters');
    if (st) {
      const items = JSON.parse(st.dataset.items || '[]');
      st.querySelectorAll('.ai-starter').forEach(b => b.addEventListener('click', () => {
        const it = items[Number(b.dataset.k)];
        if (it.link) { location.hash = it.link; return; }
        if (it.about) { current.about = it.about; const sel = root.querySelector('#ai-about'); if (sel) sel.value = it.about; }
        if (it.style) { const sb = root.querySelector(`[data-style="${it.style}"]`); if (sb) sb.click(); }
        if (it.fill) { const t = root.querySelector('#ai-text'); t.value = it.fill; t.focus(); return; }
        send(it.q);
      }));
    }
  }
  function scrollDown() { const th = root && root.querySelector('#ai-thread'); if (th) th.scrollTop = th.scrollHeight; }

  async function send(text) {
    text = String(text || '').trim();
    if (busy) return;
    if (tray && tray.busy()) { V.toast('Still reading your file…'); return; }
    if (!text && !(tray && tray.count())) return;
    if (!text) text = 'Help me with this.';
    const chat = current;
    const files = tray ? tray.peek() : [];
    const plan = UI.plan(text, chat.messages, contextFor(chat), files);
    const begin = () => {
      chat.messages.push({ role: 'user', content: text, files: files.length ? files.map(FILES.keep) : undefined });
      if (chat.title === 'New chat') chat.title = titleFrom(chat.messages);
      if (tray) tray.take();
    };
    if (plan.pic || plan.refuse) {                       // a picture is made by the picture AI; no tutor reply needed
      begin();
      chat.messages.push(plan.refuse ? { role: 'assistant', content: plan.refuse } : { role: 'assistant', content: `Here is a picture of ${plan.pic.prompt}.`, pic: plan.pic });
      putChat(chat);
      if (location.hash !== '#/tutor/' + chat.id) history.replaceState(null, '', '#/tutor/' + chat.id);
      draw(); return;
    }
    await UI.ensureReady();
    if (T.state !== 'ready') { V.toast('The tutor could not start. Try again in a moment.'); return; }
    begin();
    const reply = { role: 'assistant', content: '', pending: true, viz: plan.viz || undefined };
    chat.messages.push(reply);
    putChat(chat);
    if (location.hash !== '#/tutor/' + chat.id) history.replaceState(null, '', '#/tutor/' + chat.id);
    busy = true;
    draw();
    const input = root.querySelector('#ai-text'); input.value = '';
    const sendBtn = root.querySelector('#ai-send'); sendBtn.textContent = 'Stop';
    const t0 = performance.now();
    try {
      const full = await T.ask(UI.forModel(chat.messages.slice(0, -1)), plan.ctx, partial => {
        reply.content = partial;
        const last = root.querySelector('#ai-thread .ai-msg.bot:last-child .bubble');
        if (last) { last.innerHTML = T.render(partial, reply); scrollDown(); }
      }, w => {
        const last = root.querySelector('#ai-thread .ai-msg.bot:last-child .bubble');
        if (last && !reply.content) last.innerHTML = (reply.viz ? T.render('', reply) : '') + (w ? `<span class="muted">The free AI services are busy for a moment. Your reply is coming in ${w.seconds} s…</span>` : '<span class="muted">Thinking…</span>');
      });
      reply.content = full || reply.content || (reply.viz ? '' : 'Sorry, I could not think of an answer. Try asking another way.');
      reply.via = T.lastProvider;
      reply.ms = Math.round(performance.now() - t0);
      sessionTimes.push(reply.ms);
      UI.finish(text, reply);
      if (window.BADGES) BADGES.flag('tutor');
    } catch (e) {
      reply.content = (e && e.message) ? e.message : 'Sorry, something went wrong.';
    }
    delete reply.pending;
    busy = false;
    putChat(chat);
    if (current === chat && root.isConnected) draw();
  }

  function ago(t) {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60); if (h < 24) return h + ' h ago';
    const d = Math.round(h / 24); return d === 1 ? 'yesterday' : d + ' days ago';
  }

  window.TUTORPAGE = { tutorPage, related, load, contextFor, _setCurrent: c => { current = c; } };
})();
