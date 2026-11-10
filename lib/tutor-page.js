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
  /** change a saved chat without moving it to the top (rename, pin) */
  function editChat(id, patch) { const o = load(), c = o.chats.find(x => x.id === id); if (!c) return; Object.assign(c, patch); save(o); }
  let chatQuery = '';
  /** the chats in the list: pinned ones first, then the newest; the search matches titles and what was said */
  function listed(chats) {
    const q = chatQuery.trim().toLowerCase();
    const hit = c => !q || c.title.toLowerCase().includes(q) || c.messages.some(m => String(m.content || '').toLowerCase().includes(q));
    return chats.filter(hit).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }
  const chatRow = (c, on) => `<div class="ai-chat${on ? ' on' : ''}${c.pinned ? ' pinned' : ''}" data-chat="${c.id}"><a href="#/tutor/${c.id}" title="${esc(c.title)}"><span class="t">${c.pinned ? `<span class="ai-pin-mark" aria-label="Pinned">${ICON('star', 13)}</span>` : ''}${esc(c.title)}</span><span class="w tiny muted">${ago(c.updated)} · ${c.messages.filter(m => m.role === 'user').length} q</span></a>
    <button class="iconbtn sm ai-pin" data-pin="${c.id}" aria-label="${c.pinned ? 'Unpin' : 'Pin'} this chat" aria-pressed="${!!c.pinned}" title="${c.pinned ? 'Unpin' : 'Pin'}">${ICON('star', 15)}</button><button class="iconbtn sm ai-ren" data-ren="${c.id}" aria-label="Rename this chat" title="Rename">${ICON('pencil', 15)}</button><button class="iconbtn sm ai-del" data-del="${c.id}" aria-label="Delete this chat">✕</button></div>`;
  const blankChat = () => ({ id: newId(), title: 'New chat', created: Date.now(), updated: Date.now(), about: 'general', level: 'auto', style: 'steps', lang: (UI.pref().lang || 'en'), messages: [] });

  /* ---------- what to ask about, and how ---------- */
  const LEVELS = [['auto', 'My level'], ['Elementary school', 'Elementary'], ['6th grade', '6th grade'], ['7th grade', '7th grade'], ['8th grade', '8th grade'], ['High school', 'High school']];
  const STYLES = [
    ['steps', 'Step by step', 'Step by step, saying why each step works.'],
    ['short', 'Short', 'Short and simple: the key idea in a few sentences.'],
    ['example', 'With an example', 'Start from a fully worked example, then explain the idea.'],
    ['new', 'I am new to this', 'As if the student has never seen it: start from what they already know, avoid jargon.'],
    ['check', 'Check my work', 'The student will share their working: check each step, say which are right, and explain any mistake kindly.'],
    ['homework', 'Homework help: hints only', 'Homework mode: the student is doing homework. Never give the final answer or work the whole problem; give one hint at a time, ask what they tried, and check their steps.'],
    ['socratic', 'Ask me questions', 'Socratic: don’t explain or give the answer. Guide with one short question at a time that leads the student to the next step, wait for their reply and build on it. If they are stuck twice in a row, give one small hint, then ask again.'],
    ['teach', 'Teach it back', 'Teach it back: the student explains the idea in their own words, as if teaching it. Reply as a friendly listener: say what they got right, gently correct anything wrong or missing, and end with one question about the trickiest part.'],
  ];
  /** a level from what the learner is doing: their class book, else their first saved course */
  function myLevel() {
    if (S.get().profile.adult) return 'An adult learner';
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
    ctx.langCode = chat.lang || 'en';
    if (UI.LANG_LINE && UI.LANG_LINE[ctx.langCode]) ctx.lang = UI.LANG_LINE[ctx.langCode];
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
  const ICON = (name, size) => (window.ICONS ? ICONS.svg(name, size) : '');
  const SVG = d => `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const SPEAKER = SVG('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>');
  const LINK = SVG('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.8-2.8a4.5 4.5 0 0 0-6.4-6.4L11.6 6"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-2.8 2.8a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/>');
  const narrow = () => window.innerWidth < 520;
  const placeholder = style => (style === 'check' ? (narrow() ? 'Paste your working' : 'Paste your working, one step per line, or attach a photo of it') : style === 'teach' ? 'Explain it in your own words' : narrow() ? 'Ask anything' : 'Ask anything, or attach a photo');
  /** how the tutor explains, for this chat */
  function setStyle(v) {
    current.style = v; if (current.messages.length) putChat(current);
    const t = root.querySelector('#ai-text'); if (t) t.placeholder = placeholder(v);
  }
  let current = null, root = null, busy = false, sessionTimes = [], statusWired = false, tray = null, pasteWired = false;

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
    UI.warm();
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
        <aside class="ai-side" id="ai-side">
          <button class="btn primary block" id="ai-new">${ICON('plus', 18)} New chat</button>
          ${chats.length > 3 || chatQuery ? `<label class="visually-hidden" for="ai-find">Search your chats</label><input class="ai-find" id="ai-find" type="search" placeholder="Search your chats" value="${esc(chatQuery)}" autocomplete="off">` : ''}
          <nav class="ai-chats" aria-label="Your chats" id="ai-chats">${chatsHtml(chats, chat)}</nav>
          <details class="ai-status" id="ai-status"></details>
        </aside>
        <section class="ai-main card">
          <div class="ai-bar">
            <button type="button" class="chip-btn ai-chats-btn" id="ai-chats-btn" aria-expanded="false" aria-controls="ai-side">${ICON('review', 16)} Chats${chats.length ? ` (${chats.length})` : ''}</button>
            <label class="ai-pick"><span class="visually-hidden">Ask about</span><select id="ai-about">${abouts.map(o => `<option value="${esc(o.id)}" ${o.id === chat.about ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></label>
            <label class="ai-pick"><span class="visually-hidden">Explain for</span><select id="ai-level">${LEVELS.map(([v, l]) => `<option value="${esc(v)}" ${v === chat.level ? 'selected' : ''}>${esc(v === 'auto' && myLevel() ? `My level (${myLevel()})` : l)}</option>`).join('')}</select></label>
            <label class="ai-pick"><span class="visually-hidden">How to explain</span><select id="ai-style">${STYLES.map(([v, l]) => `<option value="${v}" ${v === chat.style ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
            <label class="ai-pick"><span class="visually-hidden">Language of explanations</span><select id="ai-lang">${UI.LANGS.map(([v, l]) => `<option value="${v}" lang="${v}" ${v === (chat.lang || 'en') ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            <span class="ai-bar-end">
              ${window.COACH && COACH.canSpeak() ? `<button type="button" class="iconbtn ai-round ai-voice${UI.voiceOn() ? ' on' : ''}" id="ai-voice" aria-pressed="${UI.voiceOn()}" aria-label="Read answers aloud" title="Read each answer aloud">${SPEAKER}</button>` : ''}
              ${chat.messages.length && window.MOVE ? `<button type="button" class="iconbtn ai-round ai-share-btn" id="ai-share-btn" aria-label="Share this chat" title="A link to this chat, to show a parent or teacher">${LINK}</button>` : ''}
            </span>
          </div>
          <div id="ai-share" hidden></div>
          <div class="ai-thread" id="ai-thread" aria-live="polite">${thread()}</div>
          <form class="ai-compose" id="ai-form">
            <div class="file-tray" id="ai-tray" hidden></div>
            <div class="ai-box">${FILES ? `<button class="iconbtn ai-clip attach-btn" id="ai-attach" type="button" aria-label="Attach a photo, PDF or text file" title="Attach a photo, PDF or text file">${ICON('clip', 20)}</button><input type="file" id="ai-file" accept="${FILES.ACCEPT}" multiple hidden>` : ''}
              ${UI.micHtml('ai-mic', 'ai-mic')}<textarea id="ai-text" rows="1" placeholder="${placeholder(chat.style)}" aria-label="Your question"></textarea>
              <button class="ai-send" id="ai-send" type="submit" aria-label="Send">${ICON('send', 20)}</button></div>
            <p class="tiny muted ai-hint" id="ai-hint"></p>
          </form>
        </section>
      </div>`;
    bind();
    drawStatus();
    scrollDown();
  }

  function chatsHtml(chats, chat) {
    if (!chats.length) return '<p class="small muted ai-none">Your chats are kept here, on this device.</p>';
    const shown = listed(chats);
    return shown.length ? shown.map(c => chatRow(c, c.id === chat.id)).join('') : '<p class="small muted ai-none">No chat matches.</p>';
  }
  function thread() {
    const chat = current;
    if (!chat.messages.length) return starters();
    return chat.messages.map((m, i) => msgHtml(m, i, false)).join('');
  }
  /** one message: the learner's, a practice question, one of Procademy's own lines, or the tutor's answer */
  function msgHtml(m, i, readOnly) {
    if (m.role === 'user') return `<div class="ai-msg user"><div class="bubble">${esc(m.content).replace(/\n/g, '<br>')}${m.files && m.files.length && FILES ? `<div class="file-chips">${m.files.map(FILES.chip).join('')}</div>` : ''}</div></div>`;
    if (m.quiz) return quizHtml(m, i, readOnly);
    const checked = m.checked && m.checked.length ? `<div class="ai-checked"><div class="tiny muted">Procademy checked ${m.checked.length === 1 ? 'this line' : `these ${m.checked.length} lines`} with its own calculator</div><ul>${m.checked.map(x => `<li class="${x.ok ? 'ok' : 'no'}">${ICON(x.ok ? 'check' : 'cross', 16)}<span>${esc(x.line)}${x.ok ? '' : ` <span class="muted">(it’s ${esc(x.right)})</span>`}</span></li>`).join('')}</ul></div>` : '';
    const body = m.content || m.viz || m.pic ? T.render(m.content, m) : '';
    const foot = readOnly ? '' : m.local ? (m.summary ? summaryActions(m, i) : '') : m.content && !m.pending && !m.pic ? actions(m, i) : '';
    return `<div class="ai-msg bot${m.local ? ' ai-local' : ''}" data-i="${i}">${checked}<div class="bubble">${body}${m.pending && !m.content ? UI.thinkingHtml() : ''}</div>${foot}</div>`;
  }
  function actions(m, i) {
    const um = current.messages.slice(0, i).reverse().find(x => x.role === 'user') || {};
    const q = (um.content || '') + ' ' + (um.files || []).map(f => f.text || '').join(' ').slice(0, 600);
    const rel = related(q + ' ' + (current.about.startsWith('skill:') ? H.plain(A.skills[current.about.slice(6)] ? A.skills[current.about.slice(6)].title : '') : ''), gradeNumber(current));
    const via = m.via === 'device' ? 'This device' : m.via === 'llm7' ? 'Cloud · LLM7' : m.via === 'pollinations' ? 'Cloud · Pollinations' : m.via ? 'Cloud' : '';
    return `<div class="ai-actions">
      <button type="button" class="chip-btn" data-follow="Explain that in more detail, step by step.">Explain more</button>
      <button type="button" class="chip-btn" data-picture="${i}">Show me a picture</button>
      <button type="button" class="chip-btn" data-practice="${i}" title="A question to try, made and checked by Procademy">Practice question</button>
      <button type="button" class="chip-btn" data-board="${i}" title="See the steps written out, one at a time">Whiteboard</button>
      <button type="button" class="chip-btn ai-more-btn" aria-expanded="false">More</button>
      <span class="ai-more-chips" hidden>
        <button type="button" class="chip-btn" data-follow="Show me another worked example, with different numbers.">Another example</button>
        <button type="button" class="chip-btn" data-follow="Explain that more simply.">Simpler</button>
        <button type="button" class="chip-btn" data-follow="Why does that work? Explain the idea behind it.">Why?</button>
        <button type="button" class="chip-btn" data-act="copy" data-i="${i}">Copy</button>
        ${window.COACH && COACH.canSpeak() ? `<button type="button" class="chip-btn say-btn" data-say="${esc(T.render(m.content))}" aria-label="Read this answer aloud">Read aloud</button>` : ''}
      </span>
      ${via ? `<span class="tiny muted ai-meta">${esc(via)}${m.ms ? ' · ' + (m.ms / 1000).toFixed(1) + ' s' : ''}</span>` : ''}
    </div>
    ${rel.length ? `<div class="ai-related"><span class="tiny muted">Practice on Procademy:</span>${rel.map(id => `<a class="chip-btn" href="#/practice/${encodeURIComponent(id)}">${H.lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div>` : ''}`;
  }
  function starters() {
    const items = [];
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    if (f) items.push({ about: 'lesson', q: `Explain my class lesson, ${CPMVIEWS.lessonName(f.lesson)}, step by step.`, label: `Explain my class lesson`, sub: `${f.book.short} · ${CPMVIEWS.lessonName(f.lesson)}`, icon: 'school' });
    const quiz = buddyPlan();
    if (quiz) items.push({ buddy: true, label: 'Quiz me', sub: `5 questions on ${quiz.title}`, icon: 'target' });
    items.push({ style: 'check', homework: true, fill: 'Check my homework, one problem at a time. Tell me which answers are right, and give me a hint for any that aren’t.', label: 'Check my homework', sub: 'Attach a photo or a PDF of your work', icon: 'check' });
    const topic = quiz ? quiz.title : f ? CPMVIEWS.lessonName(f.lesson) : 'an idea from class';
    items.push({ style: 'teach', fill: `Here’s how I’d explain ${topic}: `, label: 'Teach it back', sub: 'Explain it in your words and get feedback', icon: 'pencil' });
    items.push({ q: 'Graph y = 2x + 1 and y = -x + 4, and show me where they meet.', label: 'Draw a graph', sub: 'Lines and curves, drawn exactly', icon: 'graph' });
    items.push({ link: '#/unlimited/picture', label: 'Questions like a picture', sub: 'Practice from a screenshot of homework', icon: 'image' });
    const cards = items.slice(0, 6);
    const ex = [['What is slope, and how do I find it?', 'Slope'], ['How do I add fractions with different denominators?', 'Adding fractions'], ['Why do I flip the sign when I divide an inequality by a negative?', 'Inequalities'], ['What is the difference between area and perimeter?', 'Area and perimeter']].map(([q, l]) => ({ q, label: l }));
    const all = cards.concat(ex);
    return `<div class="ai-empty" data-items='${esc(JSON.stringify(all))}'><span class="ai-hello">${ICON('sparkle', 26)}</span><h2>What would you like to understand?</h2>
      <p class="muted">Ask anything. The tutor explains step by step and never gives away a practice answer before you try.</p>
      <div class="ai-starters">${cards.map((it, k) => `<button type="button" class="ai-starter" data-k="${k}"><span class="ai-st-ic">${ICON(it.icon || 'sparkle', 20)}</span><b>${esc(it.label)}</b><span class="small muted">${esc(it.sub)}</span></button>`).join('')}</div>
      <div class="ai-examples"><span class="small muted">Or try</span>${ex.map((it, k) => `<button type="button" class="chip-btn ai-starter ai-ex" data-k="${cards.length + k}" title="${esc(it.q)}">${esc(it.label)}</button>`).join('')}</div></div>`;
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
      rows.push(['Unlimited mode', !u ? 'Off' : L.state === 'ready' ? 'On · never a wait' : L.state === 'loading' ? `Getting ready · ${pct}%` : L.state === 'unsupported' ? 'Not on this device' : L.state === 'error' ? 'Couldn’t start' : 'Starts when you ask']);
      if (model && u) rows.push(['On-device model', model.id === 'builtin' ? 'The browser’s own' : `${model.name} · ${model.size}`]);
    }
    if (T.lastProvider) rows.push(['Last answer', T.lastProvider === 'device' ? 'This device' : T.lastProvider === 'llm7' ? 'Cloud · LLM7' : 'Cloud · Pollinations']);
    if (avg) rows.push(['Average reply', avg + ' s']);
    box.innerHTML = `<summary class="small"><b>Tutor details</b><span class="tiny muted">${esc(rows[0][1])}</span></summary>
      <div class="ai-status-body"><dl class="ai-dl">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${cloud && L.state === 'loading' ? `<div class="pbar" style="margin:4px 0 8px"><span style="width:${pct}%"></span></div>` : ''}
      ${cloud && L.state !== 'unsupported' ? `<label class="tutor-check small"><input type="checkbox" id="ai-unlimited" ${UI.unlimitedOn() ? 'checked' : ''}><span>Unlimited mode: also run the AI on this device so there is never a wait</span></label>` : ''}
      ${UI.memoryCard()}
      <button class="btn sm ghost" id="ai-settings" type="button">All tutor settings</button>
      <p class="tiny muted" style="margin:6px 0 0">Chats stay on this device. The tutor can make mistakes; Procademy checks every practice answer itself.</p></div>`;
    UI.wireMemory(box, drawStatus);
    const u = box.querySelector('#ai-unlimited');
    if (u) u.addEventListener('change', () => { UI.setPref({ unlimited: u.checked }); if (u.checked) { if (T.local.state === 'error') T.local.state = 'off'; UI.ensureReady(); } drawStatus(); });
    box.querySelector('#ai-settings').addEventListener('click', () => UI.showSettings());
  }

  function bind() {
    const chat = current;
    root.querySelector('#ai-new').addEventListener('click', () => { location.hash = '#/tutor/new'; });
    root.querySelector('#ai-chats').addEventListener('click', ev => {
      const b = ev.target.closest('.ai-del'); if (!b) return;
      ev.preventDefault();
      if (!confirm('Delete this chat?')) return;
      deleteChat(b.dataset.del);
      if (b.dataset.del === chat.id) location.hash = '#/tutor/new'; else draw();
    });
    const about = root.querySelector('#ai-about'), level = root.querySelector('#ai-level');
    about.addEventListener('change', () => { chat.about = about.value; if (chat.messages.length) putChat(chat); });
    level.addEventListener('change', () => { chat.level = level.value; if (chat.messages.length) putChat(chat); });
    root.querySelector('#ai-style').addEventListener('change', ev => setStyle(ev.target.value));
    root.querySelector('#ai-lang').addEventListener('change', ev => { chat.lang = ev.target.value; UI.setPref({ lang: chat.lang }); if (chat.messages.length) putChat(chat); });
    UI.wireMic(root.querySelector('#ai-mic'), root.querySelector('#ai-text'), () => current.lang || 'en');
    const shareB = root.querySelector('#ai-share-btn');
    if (shareB) shareB.addEventListener('click', () => shareChat());
    const cb = root.querySelector('#ai-chats-btn'), pageEl = root.querySelector('.ai-page');
    cb.addEventListener('click', () => { const on = !pageEl.classList.contains('show-chats'); pageEl.classList.toggle('show-chats', on); cb.setAttribute('aria-expanded', String(on)); if (on) root.querySelector('#ai-side').scrollIntoView({ block: 'nearest' }); });
    const vb = root.querySelector('#ai-voice');
    if (vb) vb.addEventListener('click', () => { const on = !UI.voiceOn(); UI.setPref({ voice: on }); vb.classList.toggle('on', on); vb.setAttribute('aria-pressed', String(on)); if (!on && window.speechSynthesis) speechSynthesis.cancel(); V.toast(on ? 'Answers will be read aloud' : 'Reading aloud is off'); });
    const find = root.querySelector('#ai-find');
    if (find) find.addEventListener('input', () => { chatQuery = find.value; root.querySelector('#ai-chats').innerHTML = chatsHtml(load().chats, current); });
    root.querySelector('#ai-chats').addEventListener('click', ev => {
      const pin = ev.target.closest('[data-pin]'), ren = ev.target.closest('[data-ren]');
      if (pin) { ev.preventDefault(); const c = getChat(pin.dataset.pin); if (c) { editChat(c.id, { pinned: !c.pinned }); if (c.id === current.id) current.pinned = !c.pinned; root.querySelector('#ai-chats').innerHTML = chatsHtml(load().chats, current); } return; }
      if (ren) {
        ev.preventDefault();
        const row = ren.closest('.ai-chat'), c = getChat(ren.dataset.ren); if (!c || !row) return;
        row.innerHTML = `<form class="ai-ren-form"><label class="visually-hidden" for="ai-ren-in">Chat name</label><input id="ai-ren-in" maxlength="60" value="${esc(c.title)}"><button class="btn sm primary" type="submit">Save</button></form>`;
        const f = row.querySelector('form'), inp = row.querySelector('input');
        inp.focus(); inp.select();
        const done = keep => { const t = inp.value.replace(/\s+/g, ' ').trim(); if (keep && t) { editChat(c.id, { title: t }); if (c.id === current.id) current.title = t; } root.querySelector('#ai-chats').innerHTML = chatsHtml(load().chats, current); };
        f.addEventListener('submit', e => { e.preventDefault(); done(true); });
        inp.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); done(false); } });
      }
    });
    const form = root.querySelector('#ai-form'), text = root.querySelector('#ai-text');
    form.addEventListener('submit', ev => { ev.preventDefault(); if (busy) { T.stop(); return; } send(text.value); });
    text.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true })); } });
    text.addEventListener('input', () => { text.style.height = 'auto'; text.style.height = Math.min(220, text.scrollHeight) + 'px'; });
    text.focus({ preventScroll: true });
    // files: the Attach button, a pasted picture, or a file dropped on the chat
    if (FILES) {
      if (!tray) tray = FILES.tray(root.querySelector('#ai-tray'), () => drawStatus());
      else tray.mount(root.querySelector('#ai-tray'));
      const input = root.querySelector('#ai-file');
      root.querySelector('#ai-attach').addEventListener('click', () => input.click());
      input.addEventListener('change', () => { tray.add(input.files); input.value = ''; });
      text.addEventListener('paste', ev => { const f = ev.clipboardData && [...ev.clipboardData.files]; if (f && f.length) { ev.preventDefault(); ev.stopPropagation(); tray.add(f); } });
      // a screenshot pasted anywhere on the page (not into another box) is attached too
      if (!pasteWired) {
        pasteWired = true;
        document.addEventListener('paste', ev => {
          if (!root || !root.isConnected || !document.body.classList.contains('on-ai-page') || !tray) return;
          const t = ev.target; if (t && t.closest && t.closest('input, textarea, [contenteditable]')) return;
          const f = ev.clipboardData && [...ev.clipboardData.files]; if (f && f.length) { ev.preventDefault(); tray.add(f); }
        });
      }
      const main = root.querySelector('.ai-main');
      main.addEventListener('dragover', ev => { if (ev.dataTransfer && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); main.classList.add('dropping'); } });
      main.addEventListener('dragleave', ev => { if (!main.contains(ev.relatedTarget)) main.classList.remove('dropping'); });
      main.addEventListener('drop', ev => { main.classList.remove('dropping'); if (ev.dataTransfer && ev.dataTransfer.files.length) { ev.preventDefault(); tray.add(ev.dataTransfer.files); } });
    }
    bindThread();
  }
  function bindThread() {
    const th = root.querySelector('#ai-thread');
    th.querySelectorAll('.ai-msg.bot[data-i]').forEach(el => { const m = current.messages[Number(el.dataset.i)]; UI.pace(el.querySelector('.bubble'), m); });
    th.querySelectorAll('[data-follow]').forEach(b => b.addEventListener('click', () => send(b.dataset.follow)));
    th.querySelectorAll('[data-practice]').forEach(b => b.addEventListener('click', () => practiceHere(Number(b.dataset.practice))));
    th.querySelectorAll('[data-board]').forEach(b => {
      const el = b.closest('.ai-msg'), bubble = el && el.querySelector('.bubble');
      if (UI.stepsOf(bubble).length < 2) { b.hidden = true; return; }
      b.addEventListener('click', () => { const um = current.messages.slice(0, Number(b.dataset.board)).reverse().find(x => x.role === 'user'); UI.whiteboard(UI.stepsOf(bubble), um ? titleFrom([um]) : 'Step by step'); });
    });
    bindQuiz(th);
    th.querySelectorAll('[data-picture]').forEach(b => b.addEventListener('click', () => send(UI.pictureAsk(current.messages.slice(0, Number(b.dataset.picture))))));
    th.querySelectorAll('.ai-more-btn').forEach(b => b.addEventListener('click', () => { const g = b.nextElementSibling, on = g.hidden; g.hidden = !on; b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Less' : 'More'; }));
    th.addEventListener('click', ev => { const b = ev.target.closest('[data-ask]'); if (b) { ev.preventDefault(); send(b.dataset.ask); } });
    th.querySelectorAll('[data-act="copy"]').forEach(b => b.addEventListener('click', () => {
      const m = current.messages[Number(b.dataset.i)];
      const done = () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy'; }, 1500); };
      try { navigator.clipboard.writeText(m.content).then(done, () => { V.toast('Couldn’t copy'); }); } catch (e) { V.toast('Couldn’t copy'); }
    }));
    const st = th.querySelector('.ai-empty');
    if (st) {
      const items = JSON.parse(st.dataset.items || '[]');
      st.querySelectorAll('.ai-starter').forEach(b => b.addEventListener('click', () => {
        const it = items[Number(b.dataset.k)];
        if (it.link) { location.hash = it.link; return; }
        if (it.buddy) { const pl = buddyPlan(); if (pl) startBuddy(pl.skills, pl.title); return; }
        if (it.homework && FILES) { const fi = root.querySelector('#ai-file'); if (fi) fi.click(); }
        if (it.about) { current.about = it.about; const sel = root.querySelector('#ai-about'); if (sel) sel.value = it.about; }
        if (it.style) { root.querySelector('#ai-style').value = it.style; setStyle(it.style); }
        if (it.fill) { const t = root.querySelector('#ai-text'); t.value = it.fill; t.focus(); return; }
        send(it.q);
      }));
    }
  }
  function scrollDown() { const th = root && root.querySelector('#ai-thread'); if (th) th.scrollTop = th.scrollHeight; }

  async function send(text, extra) {
    text = String(text || '').trim();
    if (busy) return;
    if (tray && tray.busy()) { V.toast('Still reading your file…'); return; }
    if (!text && !(tray && tray.count())) return;
    if (!text) text = 'Help me with this.';
    const chat = current;
    const files = tray ? tray.peek() : [];
    const plan = UI.plan(text, modelView(chat.messages), Object.assign(contextFor(chat), extra || {}), files);
    // lines of finished work ("3/4 + 1/6 = 11/12"): Procademy checks them with its calculator first
    const checked = /check|homework|right|correct/i.test(text) || chat.style === 'check' || chat.style === 'homework' ? checkWork([text].concat(files.map(f => f.text || '')).join('\n')) : [];
    if (checked.length) plan.ctx = Object.assign({}, plan.ctx || {}, { checked: checked.map(x => `- ${x.line}: ${x.ok ? 'right' : 'not right; it is ' + x.right}`).join('\n') });
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
    if (T.state !== 'ready') { V.toast('The tutor couldn’t start. Try again in a moment.'); return; }
    begin();
    const reply = { role: 'assistant', content: '', pending: true, viz: plan.viz || undefined, checked: checked.length ? checked : undefined };
    chat.messages.push(reply);
    putChat(chat);
    if (location.hash !== '#/tutor/' + chat.id) history.replaceState(null, '', '#/tutor/' + chat.id);
    busy = true;
    draw();
    const input = root.querySelector('#ai-text'); input.value = '';
    const sendBtn = root.querySelector('#ai-send'); sendBtn.innerHTML = ICON('stop', 18); sendBtn.setAttribute('aria-label', 'Stop'); sendBtn.classList.add('stop');
    const t0 = performance.now();
    try {
      const full = await T.ask(UI.forModel(modelView(chat.messages.slice(0, -1))), plan.ctx, partial => {
        reply.content = partial;
        const last = root.querySelector('#ai-thread .ai-msg.bot:last-child .bubble');
        if (last) { last.innerHTML = T.render(partial, reply); scrollDown(); }
      }, w => {
        const last = root.querySelector('#ai-thread .ai-msg.bot:last-child .bubble');
        if (last && !reply.content) last.innerHTML = (reply.viz ? T.render('', reply) : '') + (w ? `<span class="muted">The free AI services are busy for a moment. Your reply is coming in ${w.seconds} s…</span>` : UI.thinkingHtml());
      });
      reply.content = full || reply.content || (reply.viz ? '' : 'Sorry, I couldn’t think of an answer. Try asking another way.');
      reply.via = T.lastProvider;
      reply.ms = Math.round(performance.now() - t0);
      sessionTimes.push(reply.ms);
      UI.noteTime(reply.ms);
      UI.finish(text, reply);
      UI.speak(reply);
      if (window.BADGES) BADGES.flag('tutor');
    } catch (e) {
      reply.content = (e && e.message) ? e.message : 'Sorry, something went wrong.';
    }
    delete reply.pending;
    busy = false;
    putChat(chat);
    if (current === chat && root.isConnected) draw();
  }

  /* ---------- practice in the chat: Procademy's own questions, checked by Procademy ----------
     "Practice question" under an answer and "Quiz me" make a question from the skill the chat is about (A.question),
     check the answer with the same checker as the practice screen (A.check), and count it toward today. A miss is
     saved for Review like any practice question. The tutor never sees the answer before the learner has tried. */
  const QUIZ_N = 5;
  const quizQ = z => { try { return z && A.skills[z.skill] ? A.question(z.skill, z.seed) : null; } catch (e) { return null; } };
  const newSeed = () => 'chat-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const quizMsg = (skill, buddy) => ({ role: 'assistant', content: '', quiz: Object.assign({ skill, seed: newSeed(), ok: null }, buddy ? { buddy } : {}) });
  function lessonSkills() { const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson); return f ? f.lesson.skills.filter(id => A.skills[id] && A.whereIs(id)) : []; }
  /** what "Quiz me" practices: the class lesson, else the skills practiced lately, else what's next in a saved course */
  function buddyPlan() {
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson), ls = lessonSkills();
    if (f && ls.length) return { skills: ls, title: CPMVIEWS.lessonName(f.lesson) };
    const rec = S.get().recent.filter(id => A.skills[id] && A.whereIs(id)).slice(0, 3);
    if (rec.length) return { skills: rec, title: rec.length === 1 ? H.plain(A.skills[rec[0]].title) : 'what you practiced lately' };
    const co = S.get().profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0], nx = co && A.courseSkills(co).find(id => S.skill(id).level < 3);
    return nx ? { skills: [nx], title: H.plain(A.skills[nx].title) } : null;
  }
  /** the skill a practice question should come from: the one chosen, else what the question was about, else the lesson */
  function skillFor(chat, text) {
    if (String(chat.about).startsWith('skill:') && A.skills[chat.about.slice(6)]) return chat.about.slice(6);
    const rel = related(text || '', gradeNumber(chat)).filter(id => A.whereIs(id));
    if (rel.length) return rel[0];
    const ls = lessonSkills(); if (ls.length) return ls[0];
    return S.get().recent.find(id => A.skills[id] && A.whereIs(id)) || null;
  }
  const saidHtml = (q, z) => (q.type === 'choice' ? (q.choices[Number(z.said)] || '') : esc(String(z.said == null ? '' : z.said)));
  const answerHtml = q => (q.type === 'choice' ? q.answer : esc(A.answerText(q)));
  function quizHtml(m, i, readOnly) {
    const z = m.quiz, q = quizQ(z);
    if (!q) return `<div class="ai-msg bot" data-i="${i}"><div class="bubble muted">This practice question can’t be shown here.</div></div>`;
    const done = z.ok === true || z.ok === false;
    const input = done ? '' : readOnly ? '<p class="small muted">Not answered yet.</p>'
      : q.type === 'choice' ? `<div class="ai-quiz-choices" role="group" aria-label="Choose an answer">${q.choices.map((c, k) => `<button type="button" class="chip-btn" data-qi="${i}" data-qchoice="${k}">${c}</button>`).join('')}</div>`
      : `<form class="ai-quiz-form" data-qi="${i}"><label class="visually-hidden" for="qz-${i}">Your answer</label><input id="qz-${i}" autocomplete="off" spellcheck="false" inputmode="${q.type === 'number' ? 'decimal' : 'text'}" placeholder="Your answer"><button class="btn sm primary" type="submit">Check</button></form>`;
    const fb = done ? `<div class="ai-quiz-fb ${z.ok ? 'good' : 'bad'}">${ICON(z.ok ? 'check' : 'cross', 18)}<span>${z.ok ? 'Right, well done.' : `Not quite. You answered ${saidHtml(q, z)}, and the answer is <b>${answerHtml(q)}</b>.`}</span></div>` : '';
    const acts = done && !readOnly ? `<div class="ai-actions"><button type="button" class="chip-btn" data-qboard="${i}">See the steps on a whiteboard</button><button type="button" class="chip-btn" data-qask="${i}">Ask the tutor about it</button>${z.buddy ? '' : `<button type="button" class="chip-btn" data-qmore="${i}">Another one</button>`}</div>` : '';
    return `<div class="ai-msg bot ai-quiz" data-i="${i}"><div class="bubble"><div class="tiny muted ai-quiz-head">${z.buddy ? `Question ${z.buddy} of ${QUIZ_N}` : 'A practice question'} · ${A.skills[z.skill].title}</div>
      <div class="ai-quiz-q">${q.prompt}</div>${input}<p class="small ai-quiz-msg" role="alert"></p>${fb}</div>${acts}</div>`;
  }
  function bindQuiz(th) {
    th.querySelectorAll('[data-qchoice]').forEach(b => b.addEventListener('click', () => answerQuiz(Number(b.dataset.qi), Number(b.dataset.qchoice))));
    th.querySelectorAll('.ai-quiz-form').forEach(f => f.addEventListener('submit', ev => { ev.preventDefault(); answerQuiz(Number(f.dataset.qi), f.querySelector('input').value); }));
    th.querySelectorAll('[data-qboard]').forEach(b => b.addEventListener('click', () => { const z = current.messages[Number(b.dataset.qboard)].quiz, q = quizQ(z); if (q) UI.whiteboard(q.hints, H.plain(A.skills[z.skill].title)); }));
    th.querySelectorAll('[data-qask]').forEach(b => b.addEventListener('click', () => {
      const z = current.messages[Number(b.dataset.qask)].quiz, q = quizQ(z); if (!q) return;
      send('Explain how to get the answer to this practice question, step by step.', { skill: H.plain(A.skills[z.skill].title), question: H.plain(q.prompt), choices: q.type === 'choice' ? q.choices.map(H.plain) : undefined, steps: q.hints.map(H.plain), answerShown: true, answer: H.plain(A.answerText(q)), studentAnswer: H.plain(saidHtml(q, z)) || undefined });
    }));
    th.querySelectorAll('[data-qmore]').forEach(b => b.addEventListener('click', () => { const z = current.messages[Number(b.dataset.qmore)].quiz; addQuiz(z.skill); }));
    th.querySelectorAll('[data-again]').forEach(b => b.addEventListener('click', () => { const pl = current.buddyRun; if (pl) startBuddy(pl.skills, pl.title); }));
  }
  function addQuiz(skill) {
    current.messages.push(quizMsg(skill));
    if (current.title === 'New chat') current.title = 'Practice: ' + H.plain(A.skills[skill].title);
    putChat(current);
    if (location.hash !== '#/tutor/' + current.id) history.replaceState(null, '', '#/tutor/' + current.id);
    draw();
    const inp = root.querySelector('.ai-quiz:last-child input, .ai-quiz:last-child [data-qchoice]'); if (inp) inp.focus({ preventScroll: true });
  }
  /** "Practice question" under an answer: a question from the skill it was about (or, with none, ask the tutor for one) */
  function practiceHere(i) {
    const um = current.messages.slice(0, i).reverse().find(x => x.role === 'user') || {};
    const sid = skillFor(current, um.content || '');
    if (sid) addQuiz(sid); else send('Give me one practice question like this. Please don’t tell me the answer until I reply.');
  }
  function answerQuiz(i, input) {
    const m = current.messages[i], z = m && m.quiz, q = quizQ(z);
    if (!q || z.ok === true || z.ok === false) return;
    const r = A.check(q, input), msg = root.querySelector(`.ai-quiz[data-i="${i}"] .ai-quiz-msg`);
    if (r.unreadable || (q.type !== 'choice' && !String(input).trim())) { if (msg) msg.textContent = q.type === 'number' ? 'Type a number, like 12, 3/4 or 2.5.' : 'Type your answer first.'; return; }
    z.ok = !!r.correct; z.said = q.type === 'choice' ? Number(input) : String(input).trim().slice(0, 60);
    S.countAnswer(z.ok);
    if (z.ok) S.addPoints(10); else S.addMissed(z.skill, z.seed);
    if (window.APP) APP.refreshStats();
    if (z.buddy) {
      const run = current.buddyRun || { right: 0, skills: [z.skill], title: '' };
      run.right = (run.right || 0) + (z.ok ? 1 : 0);
      current.buddyRun = run;
      if (z.buddy < QUIZ_N) current.messages.push(quizMsg(run.skills[z.buddy % run.skills.length], z.buddy + 1));
      else {
        const n = run.right;
        current.messages.push({ role: 'assistant', local: true, summary: true, content: `You got **${n} of ${QUIZ_N}** right on ${run.title}. ${n === QUIZ_N ? 'Every one. Excellent work.' : n >= 3 ? 'Nice work. The ones you missed are saved in Review, so you can fix them later.' : 'Keep going: the ones you missed are saved in Review, and each try makes the next one easier.'}` });
      }
    }
    putChat(current);
    draw();
    const nxt = root.querySelector('.ai-quiz:last-child input, .ai-quiz:last-child [data-qchoice]'); if (nxt && z.buddy) nxt.focus({ preventScroll: true });
  }
  /** "Quiz me": five of Procademy's questions on the lesson or the skills practiced lately, one after another */
  function startBuddy(skills, title) {
    const chat = current;
    chat.buddyRun = { skills: skills.slice(), title, right: 0 };
    chat.messages.push({ role: 'assistant', local: true, content: `Let’s warm up on ${title}. Here are ${QUIZ_N} quick questions, made and checked by Procademy. Answer each one, and I’ll keep score.` });
    chat.messages.push(quizMsg(skills[0], 1));
    if (chat.title === 'New chat') chat.title = 'Quiz: ' + title;
    putChat(chat);
    if (location.hash !== '#/tutor/' + chat.id) history.replaceState(null, '', '#/tutor/' + chat.id);
    draw();
    const first = root.querySelector('.ai-quiz:last-child input, .ai-quiz:last-child [data-qchoice]'); if (first) first.focus({ preventScroll: true });
  }
  function summaryActions(m, i) {
    const run = current.buddyRun, sid = run && run.skills[0];
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const more = f && run && run.title === CPMVIEWS.lessonName(f.lesson) ? `#/unlimited/lesson/${f.book.id}/${encodeURIComponent(f.lesson.id)}` : sid ? `#/unlimited/skill/${encodeURIComponent(sid)}` : '';
    return `<div class="ai-actions"><button type="button" class="chip-btn" data-again="${i}">Another 5 questions</button>${more ? `<a class="chip-btn" href="${more}">Keep practicing</a>` : ''}<a class="chip-btn" href="#/review">Review</a></div>`;
  }
  /** the conversation as the tutor should see it: a practice question as its words, never its answer before it's tried */
  function modelView(msgs) {
    return msgs.map(m => {
      if (!m.quiz) return m;
      const q = quizQ(m.quiz); if (!q) return { role: 'assistant', content: '' };
      const z = m.quiz, done = z.ok === true || z.ok === false;
      return { role: 'assistant', content: `[A practice question from Procademy on ${H.plain(A.skills[z.skill].title)}: ${H.plain(q.prompt)}${q.type === 'choice' ? ' Choices: ' + q.choices.map(H.plain).join(' | ') + '.' : ''} ${done ? `The student answered ${H.plain(saidHtml(q, z))}, which is ${z.ok ? 'right' : 'not right; the checked answer is ' + H.plain(A.answerText(q))}.` : 'The student hasn’t answered it yet.'}]` };
    }).filter(m => m.content || m.viz || m.files);
  }

  /* ---------- finished work, checked by Procademy's calculator before the tutor reads it ---------- */
  const numOf = v => (v.q ? Number(v.n) / Number(v.d) : v.v);
  /** lines such as "3/4 + 1/6 = 11/12" or "4. 12 × 3 = 36" in what the learner typed or attached */
  function checkWork(text) {
    const C = window.CALCULATOR; if (!C || !C.calc) return [];
    const out = [];
    String(text || '').split(/\n|;/).forEach(raw => {
      if (out.length >= 12) return;
      const line = raw.replace(/^\s*(\(?\d+[.)]|[a-z][.)])\s+/i, '').replace(/\s+/g, ' ').trim();
      const m = /^([^=]{3,60})=\s*(-?[−]?\s*[\d.,]+(?:\s*\/\s*\d+)?(?:\s+\d+\/\d+)?)$/.exec(line);
      if (!m) return;
      let lhs = m[1].trim().replace(/(\d)\s*[x×*]\s*(\d)/g, '$1×$2').replace(/(\d)\s*[x×*]\s*\(/g, '$1×(').replace(/\)\s*[x×*]\s*(\d)/g, ')×$1');
      if (!/\d/.test(lhs) || !/[+\-−×÷/^()²√]/.test(lhs.replace(/^-/, '')) || /[a-z]/i.test(lhs.replace(/sqrt/gi, ''))) return;
      let a, b;
      try { a = C.calc(lhs, { deg: true }); b = C.calc(m[2].replace(/,/g, '').trim(), { deg: true }); } catch (e) { return; }
      if (!a || a.error || !a.value || !b || b.error || !b.value) return;
      const va = numOf(a.value), vb = numOf(b.value);
      if (!isFinite(va) || !isFinite(vb)) return;
      out.push({ line, ok: Math.abs(va - vb) <= 1e-9 * Math.max(1, Math.abs(va)), right: a.answer ? a.answer.text.replace(/^[=≈]\s*/, '') : String(va) });
    });
    return out;
  }

  /* ---------- sharing a chat: the whole chat travels inside the link (compressed), never on a server ---------- */
  const LINK_MAX = 24000;
  async function shareChat() {
    const chat = current, box = root.querySelector('#ai-share');
    if (!chat.messages.length || !window.MOVE || !box) return;
    const slim = m => {
      const o = { r: m.role === 'user' ? 'u' : 'a' };
      if (m.content) o.c = String(m.content).slice(0, 4000);
      if (m.viz) o.v = String(m.viz).slice(0, 2000);
      if (m.quiz) o.q = { s: m.quiz.skill, d: m.quiz.seed, ok: m.quiz.ok, a: m.quiz.said, b: m.quiz.buddy };
      if (m.files && m.files.length) o.f = m.files.slice(0, 3).map(f => String(f.name || 'file').slice(0, 60));
      return o;
    };
    let msgs = chat.messages.filter(m => !m.pending && !m.pic && (m.content || m.viz || m.quiz)).map(slim), code = '', cut = false;
    for (;;) {
      code = await MOVE.pack({ v: 1, t: String(chat.title || 'A chat').slice(0, 80), at: Date.now(), m: msgs });
      if (code.length <= LINK_MAX || msgs.length <= 2) break;
      msgs = msgs.slice(2); cut = true;
    }
    const url = location.href.split('#')[0] + '#/tutor/shared/' + code;
    box.hidden = false;
    box.innerHTML = `<div class="ai-share"><p class="small" style="margin:0 0 8px"><b>Share this chat</b> The chat travels inside the link itself: nothing is stored online, and whoever opens it can only read it.${cut ? ' The chat is long, so only its newest messages fit.' : ''}</p>
      <div class="ai-share-row"><label class="visually-hidden" for="ai-share-url">Link to this chat</label><input id="ai-share-url" readonly value="${esc(url)}"><button type="button" class="btn sm primary" id="ai-share-copy">Copy link</button><button type="button" class="btn sm ghost" id="ai-share-x">Close</button></div></div>`;
    const inp = box.querySelector('#ai-share-url');
    const copy = () => { try { navigator.clipboard.writeText(url).then(() => V.toast('Link copied'), () => { inp.select(); }); } catch (e) { inp.select(); } };
    box.querySelector('#ai-share-copy').addEventListener('click', copy);
    box.querySelector('#ai-share-x').addEventListener('click', () => { box.hidden = true; box.innerHTML = ''; });
    inp.addEventListener('focus', () => inp.select());
    copy();
    root.__share = url;                       // for the test suite
  }
  /** a shared chat (#/tutor/shared/<code>): read-only, with a way to keep a copy */
  async function sharedPage(el, code) {
    root = el;
    el.innerHTML = '<div class="card"><p class="muted" style="margin:0">Opening the shared chat…</p></div>';
    let o = null;
    try { o = window.MOVE ? await MOVE.unpack(code) : null; } catch (e) { o = null; }
    if (!o || o.v !== 1 || !Array.isArray(o.m)) {
      el.innerHTML = `<div class="card empty"><h1>This chat link doesn’t work</h1><p class="muted">It may have been cut short when it was copied. Ask for the link again.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/tutor">Open the tutor</a></div></div>`;
      return;
    }
    const msgs = o.m.slice(0, 80).map(x => {
      const m = { role: x.r === 'u' ? 'user' : 'assistant', content: typeof x.c === 'string' ? x.c.slice(0, 4000) : '' };
      if (typeof x.v === 'string') m.viz = x.v.slice(0, 2000);
      if (x.q && typeof x.q.s === 'string' && A.skills[x.q.s] && typeof x.q.d === 'string') m.quiz = { skill: x.q.s, seed: x.q.d.slice(0, 40), ok: x.q.ok === true ? true : x.q.ok === false ? false : null, said: typeof x.q.a === 'number' ? x.q.a : typeof x.q.a === 'string' ? x.q.a.slice(0, 60) : null, buddy: Number(x.q.b) > 0 ? Math.min(QUIZ_N, Number(x.q.b)) : undefined };
      if (Array.isArray(x.f)) m.files = x.f.slice(0, 3).map(n => ({ name: String(n).slice(0, 60), kind: 'text' }));
      return m;
    }).filter(m => m.content || m.viz || m.quiz);
    const title = String(o.t || 'A chat').slice(0, 80), when = Number(o.at) ? new Date(Number(o.at)).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    el.innerHTML = `<div class="ai-shared"><div class="crumbs"><a href="#/tutor">Tutor</a> › <span>A shared chat</span></div>
      <div class="card ai-shared-head"><div><h1>${esc(title)}</h1><p class="small muted" style="margin:0">A chat with the Procademy tutor${when ? `, shared ${esc(when)}` : ''}. You can read it here; nothing in it can be changed.</p></div>
        <button type="button" class="btn primary" id="ai-keep">Save a copy to my chats</button></div>
      <div class="card ai-thread ai-shared-thread">${msgs.map((m, i) => msgHtml(m, i, true)).join('')}</div></div>`;
    el.querySelector('#ai-keep').addEventListener('click', () => {
      const chat = blankChat();
      chat.title = 'Shared: ' + title.slice(0, 60); chat.messages = msgs; putChat(chat);
      V.toast('Saved to your chats'); location.hash = '#/tutor/' + chat.id;
    });
    H.tutorCtx(null);
  }

  function ago(t) {
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60); if (h < 24) return h + ' h ago';
    const d = Math.round(h / 24); return d === 1 ? 'yesterday' : d + ' days ago';
  }

  window.TUTORPAGE = { tutorPage, shared: sharedPage, related, load, contextFor, checkWork, modelView, buddyPlan, _setCurrent: c => { current = c; } };
})();
