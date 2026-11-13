/* The search box in the header. Selecting it makes it bigger: on a computer it widens over the menu, and on a phone
   it fills the screen. Results appear as you type (practice on what was typed, topics it may be the start of, a
   course it may misspell, tools, courses, skills with your level, units, CPM lessons (a lesson number too), math
   words and formulas, help and your tutor chats); the arrow keys and Enter pick one, and Enter with nothing picked
   opens the full results page. With nothing typed it offers recent searches (which can be cleared) and topics for
   your grade. On a phone it can listen instead (the browser's own speech service). Recent searches are kept on
   this device, per learner. */
'use strict';
(function () {
  const V = window.VIEWS, A = window.ACADEMY, S = window.STORE, H = V._h, esc = H.esc, enc = encodeURIComponent;
  const RECENT = 'procademy.searches.v1';
  const top = document.querySelector('header.top'), form = document.getElementById('search-form'), input = document.getElementById('search-input');
  if (!top || !form || !input) return;

  const panel = document.createElement('div');
  panel.id = 'qs-panel'; panel.className = 'qs-panel'; panel.hidden = true;
  panel.setAttribute('role', 'listbox'); panel.setAttribute('aria-label', 'Search results');
  const cancel = document.createElement('button');
  cancel.type = 'button'; cancel.className = 'btn ghost sm qs-cancel'; cancel.textContent = 'Cancel';
  form.append(cancel, panel);
  input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', 'qs-panel'); input.setAttribute('aria-autocomplete', 'list');

  function recent() { try { const v = JSON.parse(localStorage.getItem(RECENT) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string' && x).slice(0, 6) : []; } catch (e) { return []; } }
  function remember(q) {
    q = String(q || '').trim().slice(0, 80);
    if (!q) return;
    const list = [q].concat(recent().filter(x => x.toLowerCase() !== q.toLowerCase()));
    try { localStorage.setItem(RECENT, JSON.stringify(list.slice(0, 6))); } catch (e) { /* fine */ }
  }
  function clearRecent() { try { localStorage.removeItem(RECENT); } catch (e) { /* fine */ } }
  const line = d => `<svg class="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
  /** a formula as one line of text: a² + b² = c², x₁ */
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }, SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
  const flat = h => A.stripTags(String(h).replace(/<sup>(\d+)<\/sup>/g, (_, d) => [...d].map(c => SUP[c]).join('')).replace(/<sub>(\d+)<\/sub>/g, (_, d) => [...d].map(c => SUB[c]).join('')).replace(/<sup>([^<]*)<\/sup>/g, '^($1)').replace(/<sub>([^<]*)<\/sub>/g, '_$1'));
  const X_IC = line('<path d="M6 6l12 12M18 6 6 18"/>'), ARROW_IC = line('<path d="M7 17 17 7M9 7h8v8"/>');

  /** the groups of results for what is typed: [[heading, [{ href, title, where, icon }]]] */
  function groups(q) {
    const icon = name => ICONS.svg(name, 18);
    if (!q) {
      const out = [], r = recent(), pop = V.popular ? V.popular() : { list: [], grade: null };
      if (r.length) out.push(['Recent searches', r.map(t => ({ href: '#/search/' + enc(t), title: t, icon: icon('review'), q: t })).concat({ act: 'clear', href: '#/search/', title: 'Clear recent searches', icon: X_IC, cls: 'qs-quiet' })]);
      out.push([pop.grade ? `Popular for ${pop.grade}` : 'Try searching for', pop.list.map(t => ({ href: '#/search/' + enc(t), title: t, icon: icon('search'), q: t }))]);
      return out;
    }
    const f = V.find(q), out = [], named = V.matcher(f.rest || f.q), lvlIc = id => `<span class="lvl lvl-${S.skill(id).level}" aria-hidden="true"></span>`;
    const topic = f.rest || f.q;
    if (topic && V.mathTopic(topic).length) out.push(['Practice', [{ href: '#/unlimited/find/' + enc(topic) + (f.grade != null ? '/' + f.grade : ''), title: `Practice “${topic}” now`, where: 'Procademy’s own questions at your level, ready at once', icon: icon('unlimited') }]]);
    const sug = V.suggest ? V.suggest(q, 3).filter(s => A.normText(s) !== A.normText(topic)) : [];
    if (sug.length) out.push(['Suggestions', sug.map(s => ({ href: '#/search/' + enc(s), title: s, icon: icon('search'), q: s }))]);
    if (f.guess) out.push(['Did you mean', [{ href: f.guess.chapters ? '#/cpm/' + f.guess.id : H.courseHref(f.guess), title: f.guess.title, where: f.guess.chapters ? 'CPM book' : 'Course', icon: H.mono(f.guess.icon, 'mono-sm'), style: f.guess.chapters ? '' : H.courseVar(f.guess) }]]);
    const go = (f.numbered ? f.cpm.slice(0, 3).map(l => ({ href: l.href, title: l.title, where: l.where, icon: icon('bookmark') })) : [])
      .concat(f.tools.slice(0, 3).map(t => ({ href: t[1], title: t[2], where: 'Tool', icon: icon(t[4]) || ARROW_IC })))
      .concat(f.courses.filter(c => named(c.title) || f.grade != null).slice(0, 3).map(c => ({ href: H.courseHref(c), title: c.title, where: 'Course', icon: H.mono(c.icon, 'mono-sm'), style: H.courseVar(c) })));
    if (go.length) out.push(['Go to', go]);
    if (f.skills.length) out.push(['Skills', f.skills.slice(0, 6).map(id => { const w = A.whereIs(id); return { href: H.skillHref(id), title: A.stripTags(A.skills[id].title), where: `${A.LEVELS[S.skill(id).level]} · ${w.course.title} · ${w.unit.title}`, icon: lvlIc(id), cls: 'qs-skill' }; })]);
    if (f.units.length) out.push(['Units', f.units.slice(0, 3).map(x => ({ href: H.unitHref(x.c, x.u), title: x.u.title, where: x.c.title, icon: icon('book') }))]);
    if (!f.numbered && f.cpm.length) out.push(['CPM lessons', f.cpm.slice(0, 4).map(l => ({ href: l.href, title: l.title, where: l.where, icon: icon('bookmark') }))]);
    const words = f.words.slice(0, 2).map(w => ({ href: '#/words/' + w.id, title: w.term, where: w.def, icon: icon('book') }))
      .concat(f.formulas.slice(0, 2).map(x => ({ href: '#/words/formulas', title: x[1], where: flat(x[2]), icon: icon('pencil') })));
    if (words.length) out.push(['Words and formulas', words]);
    if (f.help.length) out.push(['Help', f.help.slice(0, 2).map(h => ({ href: h.href, title: h.title, where: h.line, icon: icon('info') }))]);
    if (f.chats.length) out.push(['Your tutor chats', f.chats.slice(0, 2).map(c => ({ href: '#/tutor/' + c.id, title: c.title, where: A.stripTags(c.snip).replace(/…/g, '').trim().slice(0, 90), icon: icon('sparkle') }))]);
    const more = [];
    if (window.TOPICS && !window.PROCADEMY_OFFLINE) more.push({ href: TOPICS.href(TOPICS.clip(q), S.get().profile.grade), title: `Practice “${TOPICS.clip(q)}” as a topic`, where: 'Any subject, at your grade', icon: icon('sparkle') });
    more.push({ href: '#/search/' + enc(q), title: `See all results for “${q}”`, where: '', icon: icon('search') });
    out.push([out.length ? 'More' : 'Practice any topic', more]);
    return out;
  }

  let opts = [], active = -1;
  function render() {
    const q = input.value.trim(), gs = groups(q);
    opts = [];
    panel.innerHTML = gs.map(([head, items]) => `<div role="group" aria-label="${esc(head)}"><div class="qs-h" aria-hidden="true">${esc(head)}</div>${items.map(o => {
      const i = opts.push(Object.assign({ q: o.q || q }, o)) - 1;
      return `<a class="qs-opt${o.cls ? ' ' + o.cls : ''}" role="option" id="qs-o-${i}" data-i="${i}" href="${esc(o.href)}" tabindex="-1" aria-selected="false"><span class="qs-ic" ${o.style || ''}>${o.icon}</span><span class="qs-txt"><b data-raw>${esc(o.title)}</b>${o.where ? `<span class="qs-where">${esc(o.where)}</span>` : ''}</span></a>`;
    }).join('')}</div>`).join('');
    setActive(-1);
  }
  function setActive(i) {
    const os = panel.querySelectorAll('.qs-opt');
    active = os.length && i >= 0 ? i % os.length : i < -1 && os.length ? os.length - 1 : -1;
    os.forEach((o, k) => { o.classList.toggle('on', k === active); o.setAttribute('aria-selected', String(k === active)); });
    if (active >= 0) { input.setAttribute('aria-activedescendant', os[active].id); os[active].scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }
  const isOpen = () => top.classList.contains('qs-open');
  function open() {
    if (isOpen()) return;
    top.classList.add('qs-open'); document.body.classList.add('qs-lock');
    input.setAttribute('aria-expanded', 'true'); panel.hidden = false;
    render();
  }
  function close() {
    if (!isOpen()) return;
    top.classList.remove('qs-open'); document.body.classList.remove('qs-lock');
    input.setAttribute('aria-expanded', 'false'); panel.hidden = true; setActive(-1);
  }
  function choose(o) {
    if (o.act === 'clear') { clearRecent(); render(); input.focus(); if (V.toast) V.toast('Recent searches cleared.'); return; }
    remember(o.q);
    if (location.hash === o.href) { close(); input.blur(); } else location.hash = o.href;
  }

  /* ---------- search by voice: the browser's own speech service (phones; not offline) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const MIC_IC = line('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>');
  /** a microphone in a search field (an input inside .qs-field): what's said is typed in, then onText(words) */
  function addMic(inp, onText) {
    const field = inp && inp.closest('.qs-field');
    if (!SR || !field || field.querySelector('.qs-mic')) return null;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'qs-mic'; b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Search by voice'); b.title = 'Search by voice (your browser’s speech service listens)';
    b.innerHTML = MIC_IC;
    field.appendChild(b); field.classList.add('has-mic');
    let rec = null;
    const idle = () => { rec = null; b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Search by voice'); };
    b.addEventListener('pointerdown', ev => ev.preventDefault());          // the box keeps its focus (and stays open)
    b.addEventListener('click', ev => {
      ev.preventDefault();
      if (rec) { try { rec.stop(); } catch (e) { idle(); } return; }
      if (navigator.onLine === false) { V.toast('Voice search needs the internet. Type your search instead.'); return; }
      try { rec = new SR(); } catch (e) { V.toast('Voice search isn’t available in this browser. Type your search instead.'); return; }
      const L = window.LANG ? LANG.get() : 'en';
      rec.lang = L === 'es' ? 'es-US' : L === 'hi' ? 'hi-IN' : 'en-US';
      rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
      let said = '';
      rec.onresult = e => { said = [...e.results].map(x => x[0].transcript).join(' ').replace(/[.?!]+$/, '').trim(); inp.value = said; inp.dispatchEvent(new Event('input', { bubbles: true })); };
      rec.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') V.toast('To search by voice, allow the microphone for this site.');
        else if (e.error === 'no-speech') V.toast('Nothing was heard. Try again, a little closer.');
        else if (e.error !== 'aborted') V.toast('Voice search didn’t work this time. Type your search instead.');
      };
      rec.onend = () => { idle(); if (said && onText) onText(said); };
      b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-label', 'Stop listening');
      try { rec.start(); } catch (e) { idle(); }
    });
    return b;
  }

  input.addEventListener('focus', open);
  input.addEventListener('click', open);
  input.addEventListener('input', () => { open(); render(); });
  input.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); open(); setActive(active + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); open(); setActive(active < 0 ? -2 : active - 1); }
    else if (ev.key === 'Enter' && active >= 0 && opts[active]) { ev.preventDefault(); choose(opts[active]); }
    else if (ev.key === 'Escape' && isOpen()) { ev.preventDefault(); close(); input.blur(); }
  });
  form.addEventListener('submit', () => { remember(input.value); close(); input.blur(); });     // app.js opens the results page
  panel.addEventListener('pointerdown', ev => { if (ev.target.closest('.qs-quiet')) ev.preventDefault(); });          // Clear keeps the box open
  panel.addEventListener('click', ev => { const a = ev.target.closest('.qs-opt'); if (!a) return; ev.preventDefault(); choose(opts[Number(a.dataset.i)]); });
  cancel.addEventListener('click', () => { input.value = ''; close(); input.blur(); });
  addMic(input, () => { open(); render(); input.focus(); });
  // leaving the search box (a tap elsewhere, or Tab out of it) puts it away; moving into its own results doesn't
  form.addEventListener('focusout', ev => { if (!ev.relatedTarget || !form.contains(ev.relatedTarget)) setTimeout(() => { if (!form.contains(document.activeElement)) close(); }, 0); });
  document.addEventListener('pointerdown', ev => { if (isOpen() && !form.contains(ev.target)) close(); });
  window.addEventListener('hashchange', () => { close(); if (form.contains(document.activeElement)) document.activeElement.blur(); });

  window.QUICKSEARCH = { open, close, render, recent, remember, clearRecent, addMic, groups, isOpen };
})();
