/* The search box in the header. Selecting it makes it bigger: on a computer it widens over the menu, and on a phone
   it fills the screen. Results appear as you type (tools, courses, skills, units, CPM lessons, and practice on what
   was typed); the arrow keys and Enter pick one, and Enter with nothing picked opens the full results page. With
   nothing typed it offers recent searches and a few ideas. Recent searches are kept on this device, per learner. */
'use strict';
(function () {
  const V = window.VIEWS, A = window.ACADEMY, S = window.STORE, H = V._h, esc = H.esc, enc = encodeURIComponent;
  const RECENT = 'procademy.searches.v1', IDEAS = ['Fractions', 'Negative numbers', 'Slope', 'Area', 'Percents', 'Photosynthesis'];
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

  /** the groups of results for what is typed: [[heading, [{ href, title, where, icon }]]] */
  function groups(q) {
    const icon = name => ICONS.svg(name, 18);
    if (!q) {
      const out = [], r = recent();
      if (r.length) out.push(['Recent searches', r.map(t => ({ href: '#/search/' + enc(t), title: t, icon: icon('review'), q: t }))]);
      out.push(['Try searching for', IDEAS.map(t => ({ href: '#/search/' + enc(t), title: t, icon: icon('search'), q: t }))]);
      return out;
    }
    const f = V.find(q), out = [], named = V.matcher(q);
    if (V.mathTopic(q).length) out.push(['Practice', [{ href: '#/unlimited/find/' + enc(q), title: `Practice “${q}” now`, where: 'Procademy’s own questions at your level, ready at once', icon: icon('unlimited') }]]);
    const go = f.tools.slice(0, 3).map(t => ({ href: t[1], title: t[2], where: 'Tool', icon: icon(t[4]) }))
      .concat(f.courses.filter(c => named(c.title)).slice(0, 3).map(c => ({ href: H.courseHref(c), title: c.title, where: 'Course', icon: H.mono(c.icon, 'mono-sm'), style: H.courseVar(c) })));
    if (go.length) out.push(['Go to', go]);
    if (f.skills.length) out.push(['Skills', f.skills.slice(0, 6).map(id => { const w = A.whereIs(id); return { href: H.skillHref(id), title: A.stripTags(A.skills[id].title), where: `${w.course.title} · ${w.unit.title}`, icon: icon('pencil') }; })]);
    if (f.units.length) out.push(['Units', f.units.slice(0, 3).map(x => ({ href: H.unitHref(x.c, x.u), title: x.u.title, where: x.c.title, icon: icon('book') }))]);
    const lessons = window.CPMVIEWS ? CPMVIEWS.findLessons(q, 4) : [];
    if (lessons.length) out.push(['CPM lessons', lessons.map(l => ({ href: l.href, title: l.title, where: l.where, icon: icon('bookmark') }))]);
    const more = [];
    if (window.TOPICS && !window.PROCADEMY_OFFLINE) more.push({ href: TOPICS.href(TOPICS.clip(q), S.get().profile.grade), title: `Practice “${TOPICS.clip(q)}” with AI-written questions`, where: 'Any subject, at your grade', icon: icon('sparkle') });
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
      return `<a class="qs-opt" role="option" id="qs-o-${i}" data-i="${i}" href="${esc(o.href)}" tabindex="-1" aria-selected="false"><span class="qs-ic" ${o.style || ''}>${o.icon}</span><span class="qs-txt"><b data-raw>${esc(o.title)}</b>${o.where ? `<span class="qs-where">${esc(o.where)}</span>` : ''}</span></a>`;
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
    remember(o.q);
    if (location.hash === o.href) { close(); input.blur(); } else location.hash = o.href;
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
  panel.addEventListener('click', ev => { const a = ev.target.closest('.qs-opt'); if (!a) return; ev.preventDefault(); choose(opts[Number(a.dataset.i)]); });
  cancel.addEventListener('click', () => { input.value = ''; close(); input.blur(); });
  // leaving the search box (a tap elsewhere, or Tab out of it) puts it away; moving into its own results doesn't
  form.addEventListener('focusout', ev => { if (!ev.relatedTarget || !form.contains(ev.relatedTarget)) setTimeout(() => { if (!form.contains(document.activeElement)) close(); }, 0); });
  document.addEventListener('pointerdown', ev => { if (isOpen() && !form.contains(ev.target)) close(); });
  window.addEventListener('hashchange', () => { close(); if (form.contains(document.activeElement)) document.activeElement.blur(); });

  window.QUICKSEARCH = { open, close, render, recent, remember, groups, isOpen };
})();
