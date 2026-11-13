/* Every screen on the site. Each view is a function (root, ...params) that fills `root`. */
'use strict';
(function () {
  const A = window.ACADEMY, E = window.ENGINE, S = window.STORE, M = window.M;
  const esc = M.esc;

  /* ---------- small helpers ---------- */
  /** HTML as plain text, keeping math readable: fractions as 3/4, powers as x^2 (see COACH.text) */
  const plain = html => { if (window.COACH) return COACH.text(html); const d = document.createElement('div'); d.innerHTML = String(html || '').replace(/<(br|\/p|\/li|\/div|\/tr)\s*\/?>/gi, '$& '); return (d.textContent || '').replace(/\s+/g, ' ').trim(); };
  const tutorCtx = c => { if (window.TUTORUI) window.TUTORUI.setContext(c); };
  const explainBtn = (label, ask) => `<button class="btn ghost tutor-ask" data-ask="${esc(ask)}">${esc(label)}</button>`;
  /** wire every "explain" button inside el to open the tutor with its question */
  function bindExplain(el) { el.querySelectorAll('.tutor-ask').forEach(b => b.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: b.dataset.ask }))); }
  const possessive = name => name + (/s$/i.test(name) ? '’' : '’s');
  const brand = () => 'Procademy';
  const greeting = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 18 ? 'Good afternoon' : 'Good evening'; };
  const lvl = (level, big) => `<span class="lvl lvl-${level}${big ? ' big' : ''}" role="img" aria-label="${A.LEVELS[level]}" title="${A.LEVELS[level]}"></span>`;
  const courseVar = c => `style="--course-h:${c.hue == null ? 215 : c.hue};--course:hsl(${c.hue == null ? 215 : c.hue} 70% 45%);--course-deep:hsl(${c.hue == null ? 215 : c.hue} 65% 27%)"`;
  /** a course's or book's short label in a badge; a series and its number (CC2, INT1, IM3) stack, so every badge is the same size */
  const mono = (icon, cls) => {
    const m = /^([A-Z]{2,})(\d)$/.exec(icon || ''), sm = /\bmono-sm\b/.test(cls);
    return m && !sm ? `<span class="${cls} stack" aria-hidden="true"><span class="mono-top">${esc(m[1])}</span><span class="mono-num">${m[2]}</span></span>` : `<span class="${cls}" aria-hidden="true">${esc(icon || '')}</span>`;
  };
  const icon = (name, size) => (window.ICONS ? ICONS.svg(name, size) : '');
  const courseHref = c => `#/course/${c.id}`;
  const unitHref = (c, u) => `#/unit/${c.id}/${u.id}`;
  const skillHref = sid => `#/skill/${encodeURIComponent(sid)}`;
  const practiceHref = sid => `#/practice/${encodeURIComponent(sid)}`;
  /** links to the hands-on tools for a skill or a CPM lesson: algebra tiles, the probability simulator, the number explorer, data and statistics, shapes, percents and money, and Leap */
  function toolLinks(id, text) {
    const t = String(id || '') + ' ' + String(text || ''), out = [];
    if (/compare-expressions|comparison mat|comparing (two )?expressions|which expression is greater|comparing quantities with variables/i.test(t)) out.push(['#/tiles/compare', 'Compare with algebra tiles']);
    else if (/one-step-equations|two-step-equations|variables-both-sides|equation mat|solving equations on/i.test(t)) out.push(['#/tiles', 'Solve with algebra tiles']);
    if (/probab|simulation/i.test(t)) out.push([/compound|tables|trees|two independent/i.test(t) ? '#/chance/dice' : /coin/i.test(t) ? '#/chance/coin' : '#/chance/spinner', 'Probability simulator']);
    if (/factors-primes|gcf-lcm|\bprimes?\b|factor pairs|greatest common factor|least common multiple|characteristics of numbers/i.test(t) && !/factoring/i.test(t)) out.push([/gcf|lcm|common (factor|multiple)/i.test(t) ? '#/numbers/12-18' : '#/numbers/84', 'Number explorer']);
    if (/mean-median|g6\.spread|histogram|stem-and-leaf|dot plot|box plot|center-and-spread|distribution|absolute deviation|\bMAD\b|quartile/i.test(t) && !/normal|z-score|percentile/i.test(t)) out.push(['#/data', 'Data and statistics']);
    if (/add-negatives|sub-negatives|mul-div-negatives|composing integers|(addition|subtraction|multiplication|division) of integers|(adding|subtracting|multiplying|dividing) (integers|negatives|signed numbers|negative numbers)|multiplication as repeated (addition|subtraction)|multiplying by a negative|zero pairs?/i.test(t)
      && !/exponent|polynomial|algebra tiles|algebraic|like terms|simplifying expressions|equations?\b|coordinate|graph|inequalit|fraction|decimal|scientific|slope/i.test(t)) {
      const n = ['add', 'subtract', 'multipl', 'divi'].filter(w => new RegExp(w, 'i').test(t)).length;
      out.push([/composing|different ways/i.test(t) ? '#/integers/build' : n >= 3 ? '#/integers' : /mul-div|multipl/i.test(t) ? '#/integers/mul' : /divi/i.test(t) ? '#/integers/div' : /subtract|sub-neg/i.test(t) ? '#/integers/sub' : '#/integers/add', 'Integer tiles']);
    }
    const fo = fractionOp(t);
    if (fo) out.push(['#/fractions/' + fo, 'Fraction lab']);
    const sh = shapeKind(t);
    if (sh) out.push(['#/shapes/' + sh, 'Shapes and space']);
    if (/percent|interest|discount|sale price|\btips?\b|sales tax|mark-?ups?/i.test(t) && !/percentile|confidence|margin of error|z-score|normal distribution|circle graph|categorical|association/i.test(t)) {
      const m = /interest/i.test(t) ? 'interest' : /discount|sale price|on sale/i.test(t) ? 'sale' : /\btips?\b|sales tax/i.test(t) ? 'bill' : /mark-?ups?/i.test(t) ? 'markup' : /percent (increase|decrease|change)|percent-change|increase and decrease/i.test(t) ? 'change' : 'of';
      out.push(['#/percent/' + m, 'Percents and money']);
    }
    if (/integer|negative|order-of-operations|order of operations|opposites/i.test(t) && !/exponent|root|polynomial|probabilit|coordinate|graph|coefficient|association|slope|scientific|inequalit|zero|tiles?\b/i.test(t)) out.push(['#/leap', 'Leap puzzle']);
    return out.map(([h, l]) => `<a class="btn ghost" href="${h}">${l}</a>`).join('');
  }
  /** which page of the fraction lab fits a skill or lesson, if any */
  function fractionOp(t) {
    if (!/fraction|mixed number|reciprocal|parts of parts/i.test(t) || /exponent|radical|trig|secant|slope|sector|\barcs?\b|equation|coefficient|busters|expression|dimensional|graph|line plot|negative|integers|probabilit|repeating decimals as fractions/i.test(t) || (/ratio/i.test(t) && !/divi/i.test(t))) return null;
    if (/fraction-to-decimal|fractions into decimals|decimals as fractions|fractions as percents|percents with decimals|representations of a portion|completing the web|convert-fdp|decimal-fractions|as (a )?division/i.test(t)) return 'simplify';
    if (/compar/i.test(t)) return 'compare';
    if (/equivalent fractions|multiplicative identity|simplif(y|ying) fractions|lowest terms/i.test(t)) return 'simplify';
    if (/divi|reciprocal|how many/i.test(t)) return 'div';
    if (/multipl|portions|parts of parts|area|times/i.test(t)) return 'mul';
    if (/subtract/i.test(t) && !/\badd/i.test(t)) return 'sub';
    if (/\badd|sum|combin/i.test(t)) return 'add';
    return null;
  }
  /** which page of the shapes tool fits a skill or lesson, if any */
  function shapeKind(t) {
    if (/radian|unit circle|trig|sine|cosine|circle graph|area model|under the curve|sector|arc length|inscribed|central angle|equation|conic|probabilit|tree diagram|similar|dilation|scale factor|transformation|parallel lines|transversal|polygon|interior|exterior|factor|tiles?\b|expression|function|tangent|completing the square|cent(er|re) and radius|square root|cube root|proofs?\b|congruen|quadrilateral|coordinate|mass|measure lengths/i.test(t)) return null;
    if (/cross[- ]section/i.test(t)) return 'box';
    const solid = [[/cylinder/i, 'cyl'], [/\bcones?\b/i, 'cone'], [/sphere/i, 'sphere'], [/pyramid/i, 'pyramid'], [/triangular prism|non-rectangular prism/i, 'triprism']]
      .map(([re, k]) => [t.search(re), k]).filter(x => x[0] >= 0).sort((a, b) => a[0] - b[0])[0];
    if (solid) return solid[1];
    const hit = [[/volume|surface area|\bprisms?\b|\bnets?\b|\bcubes?\b/i, 'box'], [/triangle inequality|building triangles|constructing shapes|three side lengths|side lengths and triangles|missing parts of triangles/i, 'sides'],
      [/area of (a )?triangles?|triangle area|areas? of triangles/i, 'tri'], [/composite (shape|figure)|area of composite/i, 'arch'], [/circumference|circles?\b|\bpi\b|diameter|radius/i, 'circle'], [/trapezoid/i, 'trap'], [/parallelogram/i, 'para'],
      [/angle pairs|complementary|supplementary|vertical angles|adjacent angles|classifying angles|introduction to angles|measuring angles|angle relationships/i, 'angle'], [/\barea\b|perimeter/i, 'rect']].find(([re]) => re.test(t));
    return hit ? hit[1] : null;
  }
  const plural = (k, one, many) => `${k} ${k === 1 ? one : (many || one + 's')}`;
  const fmt = k => k.toLocaleString('en-US');

  function mbar(skillIds, thin) {
    const m = E.mastery(skillIds);
    const total = skillIds.length || 1;
    const seg = l => m.counts[l] ? `<span class="m${l}" style="width:${m.counts[l] / total * 100}%"></span>` : '';
    return `<div class="mbar${thin ? ' thin' : ''}" role="img" aria-label="${m.points} of ${m.possible} mastery points">${seg(4)}${seg(3)}${seg(2)}${seg(1)}</div>`;
  }
  /** every note the learner has written (and drawn), newest first, each with its skill; a search box finds words in
      them, and the skills saved to study later come first */
  function notes(root) {
    tutorCtx(null);
    const texts = S.get().notes, pics = drawingsAll(), later = laterIds();
    const ids = [...new Set(Object.keys(texts).filter(id => texts[id] && texts[id].text).concat(Object.keys(pics).filter(id => drawingOf(id))))].filter(id => A.skills[id] && A.whereIs(id));
    const when = id => Math.max((texts[id] && texts[id].t) || 0, (pics[id] && pics[id].t) || 0);
    ids.sort((x, y) => when(y) - when(x));
    root.innerHTML = `<h1>My notes</h1><p class="muted">What you wrote on each lesson, in your own words. Add a note, or a drawing, at the bottom of any skill page.</p>
      ${later.length ? `<section class="card tight study-later"><div class="row between"><h2>Study later</h2><span class="small muted">${plural(later.length, 'skill')} you saved</span></div><div class="sl-chips">${later.map(id => `<span class="sl-item"><a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a><button type="button" class="iconbtn sl-x" data-unlater="${esc(id)}" aria-label="Remove ${esc(plain(A.skills[id].title))} from Study later" title="Remove">✕</button></span>`).join('')}</div></section>` : ''}
      ${ids.length ? `<div class="notes-tools"><label class="visually-hidden" for="notes-find">Search your notes</label><input type="search" id="notes-find" placeholder="Search your notes" autocomplete="off"><span class="small muted" id="notes-count" aria-live="polite">${plural(ids.length, 'note')}</span></div>
        <div class="notes-list">${ids.map(id => { const w = A.whereIs(id), n = texts[id], d = drawingOf(id); return `<div class="card tight note-item" data-id="${esc(id)}" data-find="${esc(A.normText(plain(A.skills[id].title) + ' ' + w.course.title + ' ' + w.unit.title + ' ' + (n && n.text ? n.text : '')))}"><div class="row between" style="flex-wrap:wrap;gap:6px"><a href="${skillHref(id)}"><b>${A.skills[id].title}</b></a><span class="tiny muted">${esc(w.course.title)} · ${ago(when(id))}</span></div>${n && n.text ? `<p class="note-text">${esc(n.text)}</p>` : ''}${d ? drawingSvg(d, 'Your drawing for ' + plain(A.skills[id].title)) : ''}</div>`; }).join('')}</div>
        <div class="card empty" id="notes-none" hidden>No notes match. Try another word.</div>`
        : `<div class="card empty"><p>No notes yet. Open any skill and write one under <b>My notes</b>, like a rule to remember or a mistake to watch for.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/courses">Find a skill</a></div></div>`}`;
    root.querySelectorAll('[data-unlater]').forEach(b => b.addEventListener('click', () => { setLater(b.dataset.unlater, false); toast('Removed from Study later'); notes(root); }));
    const find = root.querySelector('#notes-find');
    if (!find) return;
    const mark = (text, words) => { let h = esc(text); words.forEach(w => { if (w.length < 2) return; h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>'); }); return h; };
    find.addEventListener('input', () => {
      const words = A.normText(find.value).split(' ').filter(Boolean);
      let shown = 0;
      root.querySelectorAll('.note-item').forEach(el => {
        const ok = words.every(w => el.dataset.find.includes(w)); el.hidden = !ok; if (ok) shown++;
        const p = el.querySelector('.note-text'), n = texts[el.dataset.id];
        if (p && n) p.innerHTML = words.length ? mark(n.text, find.value.trim().split(/\s+/)) : esc(n.text);
      });
      root.querySelector('#notes-none').hidden = shown > 0;
      root.querySelector('#notes-count').textContent = words.length ? `${shown} of ${plural(ids.length, 'note')}` : plural(ids.length, 'note');
    });
  }
  /** a course at a glance: a row per unit, a square per skill in the color of its level, the next skill ringed and
      the starting point (from a placement check) flagged; every square opens its skill. It also finds a skill by
      name, shows what builds on what (lib/prereq.js), and folds away units marked done for now (wireSkillMap). */
  function skillMap(c) {
    const order = E.courseOrder(c), next = order.find(id => S.skill(id).level < 3), placed = (S.get().profile.placed || {})[c.id], test = testSoon(), done = doneUnits(c.id), links = prereqLinks(c);
    const cell = id => {
      const l = S.skill(id).level, name = plain(A.skills[id].title), onTest = test && test.ids.has(id);
      return `<a class="sm-cell l${l}${id === next ? ' next' : ''}${onTest ? ' on-test' : ''}" data-sid="${esc(id)}" href="${skillHref(id)}" aria-label="${esc(name)}: ${A.LEVELS[l]}${id === next ? ', next to learn' : ''}${onTest ? ', on your coming test' : ''}" title="${esc(name)}: ${A.LEVELS[l]}${onTest ? ' · on your coming test' : ''}"></a>`;
    };
    const rows = c.units.map((u, i) => {
      const ids = u.skills.filter(id => A.skills[id]);
      if (!ids.length) return '';
      const folded = done.includes(u.id);
      return `<li class="${placed && placed.start === u.id ? 'start' : ''}${folded ? ' folded' : ''}" data-unit="${esc(u.id)}"${folded ? ' hidden' : ''}><a class="sm-unit" href="${unitHref(c, u)}"><span class="n">${i + 1}</span><span class="t">${esc(u.title)}</span>${placed && placed.start === u.id ? `<span class="chip up">Start here</span>` : ''}</a>
        <span class="sm-cells">${ids.map(cell).join('')}</span>
        <span class="sm-acts"><a class="btn sm sm-go" href="#/unlimited/unit/${c.id}/${u.id}" aria-label="Practice unit ${i + 1}, ${esc(u.title)}">Practice</a><button type="button" class="iconbtn sm-fold" data-fold="${esc(u.id)}" aria-pressed="${folded}" aria-label="${folded ? `Bring back unit ${i + 1}` : `Unit ${i + 1} is done for now: fold it away`}" title="${folded ? 'Bring it back' : 'Done for now: fold it away'}">${icon(folded ? 'review' : 'check', 18)}</button></span></li>`;
    }).join('');
    return `<div class="card skill-map" ${courseVar(c)}><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Your skill map</h2>${next ? `<a class="btn sm primary" href="${practiceHref(next)}">Next: ${esc(plain(A.skills[next].title))}</a>` : ''}</div>
      <p class="small muted" style="margin:4px 0 10px">Select a unit for its lessons and unit test, or Practice to mix its skills. Each square is a skill, filled to your level; the ringed one is next${test ? ', and dotted ones are on your coming test' : ''}.</p>
      <div class="sm-tools"><input type="search" id="sm-find" placeholder="Find a skill in this course" aria-label="Find a skill in this course" autocomplete="off">
        ${links.pairs.length ? '<label class="sm-links-label"><input type="checkbox" class="switch" id="sm-links"> Show what builds on what</label>' : ''}</div>
      <ul class="sm-found" id="sm-found" hidden></ul>
      <ol class="sm-units">${rows}</ol>
      <p class="small muted sm-why" id="sm-why" aria-live="polite" hidden></p>
      <div class="sm-folded"${done.length ? '' : ' hidden'}><span class="small muted" id="sm-folded-n">${plural(done.length, 'unit')} done for now</span><button type="button" class="link-btn small" id="sm-show-folded" aria-expanded="false">Show them</button></div>
      ${legend(E.mastery(A.courseSkills(c)).counts)}</div>`;
  }
  /** the skill map's tools: find a skill, the lines of what builds on what, and units folded away */
  function wireSkillMap(map, c) {
    if (!map) return;
    const list = map.querySelector('.sm-units'), find = map.querySelector('#sm-find'), found = map.querySelector('#sm-found'), why = map.querySelector('#sm-why'), linksBox = map.querySelector('#sm-links');
    const links = prereqLinks(c), name = id => plain(A.skills[id].title);
    let showFolded = false;
    // find a skill: matching squares stay bright and the matches are listed with their units
    find.addEventListener('input', () => {
      const words = A.normText(find.value).split(' ').filter(Boolean);
      const hits = words.length ? A.courseSkills(c).filter(id => { const t = A.normText(name(id)); return words.every(w => t.includes(w)); }) : [];
      list.classList.toggle('finding', words.length > 0);
      list.querySelectorAll('.sm-cell').forEach(el => el.classList.toggle('hit', hits.includes(el.dataset.sid)));
      found.hidden = !words.length;
      found.innerHTML = hits.length ? hits.slice(0, 8).map(id => { const w = A.whereIs(id), k = c.units.indexOf(w.unit) + 1; return `<li>${lvl(S.skill(id).level)}<a href="${skillHref(id)}">${A.skills[id].title}</a><span class="small muted">Unit ${k}</span><a class="btn sm ghost" href="${practiceHref(id)}">Practice</a></li>`; }).join('') + (hits.length > 8 ? `<li class="small muted">and ${hits.length - 8} more</li>` : '')
        : `<li class="small muted">No skill in this course matches. Try another word, or <a href="#/search/${encodeURIComponent(find.value.trim())}">search everything</a>.</li>`;
      if (words.length && hits.length) list.querySelectorAll('li[data-unit]').forEach(li => { if (li.hidden && [...li.querySelectorAll('.sm-cell')].some(el => hits.includes(el.dataset.sid))) li.hidden = false; });
    });
    // what builds on what: a line from each skill to the skills in this course that build on it
    const draw = () => {
      const old = list.querySelector('.sm-links'); if (old) old.remove();
      if (!linksBox || !linksBox.checked || !list.isConnected) return;
      const box = list.getBoundingClientRect(), at = id => { const el = list.querySelector(`.sm-cell[data-sid="${CSS.escape(id)}"]`); if (!el || !el.offsetParent) return null; const r = el.getBoundingClientRect(); return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2, r.height / 2]; };
      const paths = links.pairs.map(([p, d]) => {
        const a = at(p), b = at(d);
        if (!a || !b) return '';
        const path = Math.abs(a[1] - b[1]) < 2 ? `M${a[0]},${a[1] - a[2]}Q${(a[0] + b[0]) / 2},${a[1] - a[2] - 16}${b[0]},${b[1] - b[2]}` : `M${a[0]},${a[1]}C${a[0]},${(a[1] + b[1]) / 2} ${b[0]},${(a[1] + b[1]) / 2} ${b[0]},${b[1]}`;
        return `<path d="${path}" data-a="${esc(p)}" data-b="${esc(d)}"/>`;
      }).join('');
      list.insertAdjacentHTML('afterbegin', `<svg class="sm-links" width="${box.width}" height="${box.height}" aria-hidden="true">${paths}</svg>`);
    };
    const say = id => {
      if (!linksBox || !linksBox.checked || !id) { if (why) why.hidden = true; list.classList.remove('tracing'); list.querySelectorAll('.sm-links path.on, .sm-cell.lit').forEach(x => x.classList.remove('on', 'lit')); return; }
      const into = links.into[id] || [], out = links.out[id] || [];
      list.classList.add('tracing');
      list.querySelectorAll('.sm-links path').forEach(p => p.classList.toggle('on', p.dataset.a === id || p.dataset.b === id));
      list.querySelectorAll('.sm-cell').forEach(el => el.classList.toggle('lit', el.dataset.sid === id || into.includes(el.dataset.sid) || out.includes(el.dataset.sid)));
      why.hidden = false;
      why.innerHTML = `<b>${A.skills[id].title}</b>${into.length ? ` builds on ${into.map(x => `<a href="${skillHref(x)}">${A.skills[x].title}</a>${A.whereIs(x).course !== c ? ` <span class="muted">(${esc(A.whereIs(x).course.title)})</span>` : ''}`).join(', ')}` : ' doesn’t need another skill first'}${out.length ? `, and leads to ${out.map(x => A.skills[x].title).join(', ')}` : ''}.`;
    };
    if (linksBox) {
      linksBox.addEventListener('change', () => { list.classList.toggle('links-on', linksBox.checked); draw(); say(null); if (linksBox.checked) { why.hidden = false; why.textContent = 'Point to a skill, or tab to it, to see what it builds on.'; } });
      list.addEventListener('pointerover', ev => { const el = ev.target.closest('.sm-cell'); if (el) say(el.dataset.sid); });
      list.addEventListener('focusin', ev => { const el = ev.target.closest('.sm-cell'); if (el) say(el.dataset.sid); });
      if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (!list.isConnected) { ro.disconnect(); return; } if (linksBox.checked) draw(); }); ro.observe(list); }
    }
    // done for now: fold a unit away (and bring it back)
    const refold = () => {
      const done = doneUnits(c.id), n = map.querySelector('.sm-folded');
      list.querySelectorAll('li[data-unit]').forEach(li => {
        const on = done.includes(li.dataset.unit), b = li.querySelector('[data-fold]'), k = c.units.findIndex(u => u.id === li.dataset.unit) + 1;
        li.classList.toggle('folded', on); li.hidden = on && !showFolded;
        b.setAttribute('aria-pressed', String(on)); b.innerHTML = icon(on ? 'review' : 'check', 18);
        b.setAttribute('aria-label', on ? `Bring back unit ${k}` : `Unit ${k} is done for now: fold it away`); b.title = on ? 'Bring it back' : 'Done for now: fold it away';
      });
      n.hidden = !done.length;
      map.querySelector('#sm-folded-n').textContent = `${plural(done.length, 'unit')} done for now`;
      const sh = map.querySelector('#sm-show-folded'); sh.textContent = showFolded ? 'Hide them' : 'Show them'; sh.setAttribute('aria-expanded', String(showFolded));
      draw();
    };
    list.addEventListener('click', ev => {
      const b = ev.target.closest('[data-fold]'); if (!b) return;
      const on = !doneUnits(c.id).includes(b.dataset.fold);
      setDoneUnit(c.id, b.dataset.fold, on);
      if (on) toast('Folded away. Show it again under the map.');
      refold();
      if (!on) b.focus();
    });
    map.querySelector('#sm-show-folded').addEventListener('click', () => { showFolded = !showFolded; refold(); });
  }
  function legend(counts) {
    const items = [4, 3, 2, 1, 0].map(l => `<span><i class="dot" style="background:var(--lvl${l})"></i>${A.LEVELS[l]}${counts ? ` <b>${counts[l]}</b>` : ''}</span>`);
    return `<div class="legend">${items.join('')}</div>`;
  }
  function ago(t) {
    const d = Date.now() - t, m = Math.round(d / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
    const days = Math.round(h / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return days + ' days ago';
    return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  function toast(msg) {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }
  /** the next skill worth doing after `sid`: later in the unit, then later units; prefers ones below Proficient */
  /** where to go back to for "Too hard? Go back": the first skill it builds on that isn't Proficient yet
      (lib/prereq.js), else the skill before it in its course */
  function prevSkill(sid) {
    const pre = window.PREREQ ? PREREQ.of(sid) : [];
    if (pre.length) return pre.find(id => S.skill(id).level < 3) || pre[0];
    const where = A.whereIs(sid);
    if (!where) return null;
    const all = A.courseSkills(where.course), i = all.indexOf(sid);
    return i > 0 ? all[i - 1] : null;
  }
  function nextSkill(sid) {
    const where = A.whereIs(sid);
    if (!where) return null;
    const all = A.courseSkills(where.course);
    const i = all.indexOf(sid);
    const after = all.slice(i + 1).concat(all.slice(0, i));
    return after.find(x => S.skill(x).level < 3) || after[0] || null;
  }
  function skillRow(sid, opts) {
    opts = opts || {};
    const def = A.skills[sid];
    if (!def) return '';
    const st = S.skill(sid);
    return `<li>${lvl(st.level)}<div class="name"><a href="${skillHref(sid)}">${def.title}</a>${testChip(sid)}${opts.where || opts.time ? `<div class="sub">${[opts.where ? esc(opts.where) : '', opts.time ? `about ${setMinutes(sid)} minutes` : ''].filter(Boolean).join(' · ')}</div>` : ''}</div>
      <div class="actions"><a class="btn sm ghost" href="${skillHref(sid)}">Learn</a><a class="btn sm primary" href="${practiceHref(sid)}">Practice</a></div></li>`;
  }
  /* ---------- courses and skills: grades, time, a coming test, what to know first, the big idea ---------- */
  const gradeLabel = g => (g === 0 ? 'Kindergarten' : `Grade ${g}`);
  /** how a course's grade sits next to the learner's: [label, kind], or null when the grade isn't known */
  function fitFor(c) {
    const p = S.get().profile, g = p.adult ? null : p.grade;
    if (g == null || c.grade == null) return null;
    const d = c.grade - g;
    return d === 0 ? ['Your grade', 'mine'] : d === 1 ? ['A step ahead', 'ahead'] : d >= 2 ? ['Challenge', 'ahead'] : d === -1 ? ['Review', 'review'] : ['Easy review', 'review'];
  }
  /** about how many minutes a practice set takes: younger learners' questions are quicker */
  const setMinutes = sid => { const w = A.whereIs(sid), g = w ? w.course.grade : 6; return Math.max(3, Math.round(E.PRACTICE_N * (g <= 2 ? 30 : g <= 5 ? 45 : g <= 8 ? 60 : 80) / 60)); };
  /** the skills on a coming class test (from Test prep): { ids, label }, or null */
  function testSoon() {
    const pp = S.get().profile.prep;
    if (!pp || !pp.date || pp.date < S.today() || !window.PREP) return null;
    const c = PREP.chapterOf(pp.book, pp.ch);
    if (!c) return null;
    return { ids: new Set(A.cpmSkills(c.ch.lessons)), when: new Date(pp.date + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), name: `${c.b.short} chapter ${c.ch.n} test` };
  }
  const testChip = sid => { const t = testSoon(); return t && t.ids.has(sid) ? ` <span class="chip test-chip" title="On your ${esc(t.name)}">Test ${esc(t.when)}</span>` : ''; };
  /** skills worth knowing first: the two just before it in its course, and a close one from an earlier grade */
  function beforeThis(sid) {
    const w = A.whereIs(sid);
    if (!w) return [];
    if (window.PREREQ && PREREQ.has(sid)) return PREREQ.of(sid).slice(0, 3);       // what it really builds on
    const order = A.courseSkills(w.course), i = order.indexOf(sid), out = order.slice(Math.max(0, i - 2), i).reverse();
    if (window.TUTORPAGE && w.course.grade > 0) {
      const earlier = TUTORPAGE.related(plain(A.skills[sid].title), w.course.grade - 1).filter(id => A.whereIs(id) && A.whereIs(id).course.grade < w.course.grade && !out.includes(id));
      if (earlier[0]) out.push(earlier[0]);
    }
    return out.slice(0, 3);
  }
  /** the first sentence of a lesson: its big idea in one line */
  function bigIdea(sid) {
    const d = document.createElement('div'); d.innerHTML = (A.skills[sid] && A.skills[sid].learn) || '';
    // as plain text, keeping powers (2⁴) and fractions (3/4) readable
    d.querySelectorAll('sup').forEach(x => { x.textContent = [...x.textContent].map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(ch)] || (ch === '-' || ch === '−' ? '⁻' : ch)).join(''); });
    d.querySelectorAll('.frac').forEach(x => { const n = x.querySelector('.num'), m = x.querySelector('.den'); if (n && m) x.textContent = `${n.textContent}/${m.textContent}`; });
    const p = d.querySelector('p'), t = (p ? p.textContent : d.textContent).replace(/\s+/g, ' ').trim();
    const first = t.split(/(?<=[.!?])\s+(?=[A-Z])/)[0] || '';
    return first.length > 220 ? first.slice(0, 217).replace(/\s+\S*$/, '') + '…' : first;
  }
  /** a row of cards with no half-empty last row: the number of columns is chosen so the cards fill the rows evenly */
  function balance(grid, minW) {
    let ro = null;
    const fit = () => {
      if (!grid.isConnected) { if (ro) ro.disconnect(); return; }
      const n = [...grid.children].filter(x => !x.hidden).length;
      if (!n) return;
      const gap = parseFloat(getComputedStyle(grid).columnGap) || 16, max = Math.max(1, Math.min(n, Math.floor((grid.clientWidth + gap) / (minW + gap))));
      let best = max, empty = Infinity;
      for (let c = max; c >= Math.max(1, Math.ceil(max / 2)); c--) { const e = (c - n % c) % c; if (e < empty) { best = c; empty = e; } }
      grid.style.setProperty('--cols', best);
    };
    fit();
    if (window.ResizeObserver) { ro = new ResizeObserver(fit); ro.observe(grid); }
    return fit;
  }

  /* ---------- saving courses to the home page ---------- */
  const isSaved = id => S.get().profile.enrolled.includes(id);
  /** a Save / Saved toggle; id is a course id, or 'cpm:<book>' for a CPM book */
  const saveBtn = (id, title) => { const on = isSaved(id); return `<button type="button" class="save-btn${on ? ' on' : ''}" data-save="${esc(id)}" aria-pressed="${on}" aria-label="${on ? 'Remove ' + esc(title) + ' from' : 'Save ' + esc(title) + ' to'} your home page">${on ? 'Saved' : 'Save'}</button>`; };
  let saveWired = false;
  function wireSaving() {
    if (saveWired) return; saveWired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('[data-save]');
      if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      const id = b.dataset.save, on = !isSaved(id);
      S.enroll(id, on);
      if (on && archivedIds().includes(id)) setArchived(id, false);          // saved again: back from the archive
      document.querySelectorAll(`[data-save="${CSS.escape(id)}"]`).forEach(x => { x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); x.textContent = on ? 'Saved' : 'Save'; });
      toast(on ? 'Saved to your home page' : 'Removed from your home page');
      if (/^#\/?$/.test(location.hash || '#/') || location.hash === '') window.APP && window.APP.render();     // home lists saved courses: redraw it
    });
  }
  /** the ⠿ on a saved course: drag it (or the card) to move the course; arrow keys move it too */
  const dragHandle = title => `<button type="button" class="drag-handle" data-drag aria-label="Move ${esc(title)}: drag, or use the arrow keys" title="Drag to move">⠿</button>`;
  /** My courses can be put in any order: drag a card (on a phone, press and hold it, or drag ⠿), or
      focus ⠿ and use the arrow keys. The others slide out of the way; the order is kept in the profile, so it
      goes with the learner's account to their other devices. */
  let reorderOff = null;
  function wireReorder(grid, live) {
    if (reorderOff) { reorderOff(); reorderOff = null; }
    if (!grid) return;
    const cards = () => [...grid.children].filter(c => c.dataset.id);
    const nameOf = c => (c.querySelector('h3') || c).textContent.trim();
    const say = c => { if (live) live.textContent = `${nameOf(c)}: position ${cards().indexOf(c) + 1} of ${cards().length}`; };
    const persist = () => S.reorderEnrolled(cards().map(c => c.dataset.id));
    /** move a card in the page, letting the others glide to their new places (FLIP) */
    function moveTo(card, ref) {
      const others = cards().filter(c => c !== card), before = new Map(others.map(c => [c, [c.offsetLeft, c.offsetTop]]));
      if (ref === card) return;
      grid.insertBefore(card, ref);
      others.forEach(c => {
        const [x, y] = before.get(c), dx = x - c.offsetLeft, dy = y - c.offsetTop;
        if (!dx && !dy) return;
        c.style.transition = 'none'; c.style.transform = `translate(${dx}px, ${dy}px)`;
        void c.offsetWidth;
        c.style.transition = ''; c.style.transform = '';
      });
    }
    let drag = null, press = null;
    const follow = ev => {
      const { card } = drag, g = grid.getBoundingClientRect();
      card.style.transform = `translate(${ev.clientX - drag.gx - (g.left + card.offsetLeft)}px, ${ev.clientY - drag.gy - (g.top + card.offsetTop)}px) scale(1.03)`;
    };
    function start(card, ev) {
      const g = grid.getBoundingClientRect();
      drag = { card, gx: ev.clientX - (g.left + card.offsetLeft), gy: ev.clientY - (g.top + card.offsetTop), moved: false };
      card.classList.add('lifted'); grid.classList.add('sorting'); document.body.classList.add('sorting-cards');
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* fine */ }
      follow(ev);
    }
    function over(ev) {
      if (!drag) return;
      drag.moved = true;
      follow(ev);
      // the card under the pointer takes the dragged one's place: before it when moving back, after it when moving on
      const g = grid.getBoundingClientRect(), px = ev.clientX - g.left, py = ev.clientY - g.top;
      const list = cards(), from = list.indexOf(drag.card);
      const target = list.find(c => c !== drag.card && px >= c.offsetLeft && px <= c.offsetLeft + c.offsetWidth && py >= c.offsetTop && py <= c.offsetTop + c.offsetHeight);
      if (!target) return;
      const to = list.indexOf(target);
      moveTo(drag.card, to < from ? target : target.nextElementSibling);
      follow(ev);
    }
    function end() {
      clearTimeout(press && press.timer); press = null;
      if (!drag) return;
      const { card, moved } = drag; drag = null;
      card.classList.remove('lifted'); grid.classList.remove('sorting'); document.body.classList.remove('sorting-cards');
      card.style.transform = '';
      if (moved) {
        persist(); say(card);
        // the drag ends with a click on the card under it: swallow that one click (only on the cards, and only just after)
        const stop = e => { if (grid.contains(e.target)) { e.preventDefault(); e.stopPropagation(); } window.removeEventListener('click', stop, true); };
        window.addEventListener('click', stop, true);
        setTimeout(() => window.removeEventListener('click', stop, true), 250);
      }
    }
    grid.addEventListener('dragstart', ev => ev.preventDefault());
    grid.addEventListener('pointerdown', ev => {
      const card = ev.target.closest('[data-id]');
      if (!card || ev.button > 0) return;
      const onHandle = !!ev.target.closest('[data-drag]');
      if (!onHandle && ev.target.closest('.save-btn')) return;
      if (onHandle) { ev.preventDefault(); start(card, ev); return; }
      // anywhere else on the card: a mouse drags once it moves; a finger has to press and hold
      press = { card, x: ev.clientX, y: ev.clientY, type: ev.pointerType, timer: ev.pointerType === 'mouse' ? 0 : setTimeout(() => { if (press) start(card, { clientX: press.x, clientY: press.y }); }, 380) };
    });
    const onMove = ev => {
      if (!grid.isConnected) return;
      if (drag) { over(ev); return; }
      if (press && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > 7) {
        if (press.type === 'mouse') { const p = press; press = null; start(p.card, { clientX: p.x, clientY: p.y }); over(ev); }
        else { clearTimeout(press.timer); press = null; }                       // a finger that moves is scrolling
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    reorderOff = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); };
    // while a card is held, a finger moves it instead of scrolling the page
    grid.addEventListener('touchmove', ev => { if (drag) ev.preventDefault(); }, { passive: false });
    grid.addEventListener('contextmenu', ev => { if (drag || press) ev.preventDefault(); });
    grid.addEventListener('keydown', ev => {
      const h = ev.target.closest('[data-drag]'); if (!h) return;
      const card = h.closest('[data-id]'), list = cards(), i = list.indexOf(card);
      let j = null;
      if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') j = i - 1;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') j = i + 1;
      if (ev.key === 'Home') j = 0;
      if (ev.key === 'End') j = list.length - 1;
      if (j === null) return;
      ev.preventDefault();
      j = Math.max(0, Math.min(list.length - 1, j));
      if (j === i) return;
      moveTo(card, j > i ? list[j].nextElementSibling : list[j]);
      h.focus(); persist(); say(card);
    });
  }
  /** the next skill to work on in a course: the first not yet Proficient */
  const nextInCourse = c => E.courseOrder(c).find(id => S.skill(id).level < 3) || A.courseSkills(c)[0];
  /* a small line drawing for each course (and CPM book), beside its badge: what the course is about at a glance */
  const AXES = '<path d="M8 34H58M12 38V4" opacity=".45"/>';
  const ART = {
    'math-k': '<g fill="currentColor" stroke="none"><circle cx="12" cy="14" r="4"/><circle cx="24" cy="14" r="4"/><circle cx="36" cy="14" r="4"/><circle cx="18" cy="27" r="4"/><circle cx="30" cy="27" r="4"/></g><path d="M46 12v18M41 21h10"/>',
    'math-1': '<path d="M4 32H60"/><path d="M10 29v6M22 29v6M34 29v6M46 29v6M58 29v6" opacity=".6"/><path d="M10 30Q16 14 22 30M22 30Q28 14 34 30M34 30Q40 14 46 30"/>',
    'math-2': '<rect x="8" y="4" width="8" height="32" rx="1.5"/><path d="M8 12h8M8 20h8M8 28h8" opacity=".6"/><rect x="22" y="4" width="8" height="32" rx="1.5"/><path d="M22 12h8M22 20h8M22 28h8" opacity=".6"/><rect x="38" y="28" width="8" height="8" rx="1.5"/><rect x="50" y="28" width="8" height="8" rx="1.5"/>',
    'math-3': '<g fill="currentColor" stroke="none">' + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${14 + c * 12}" cy="${9 + r * 11}" r="3.6"/>`).join('')).join('') + '</g>',
    'math-4': '<rect x="6" y="12" width="52" height="16" rx="3"/><path d="M23.3 12v16M40.6 12v16"/><rect x="6" y="12" width="17.3" height="16" rx="3" fill="currentColor" opacity=".25" stroke="none"/>',
    'math-5': '<path d="M14 16l18-8 18 8-18 8z"/><path d="M14 16v14l18 8V24M50 16v14l-18 8"/>',
    'math-6': '<rect x="6" y="8" width="52" height="10" rx="2"/><path d="M19 8v10M32 8v10M45 8v10" opacity=".6"/><rect x="6" y="24" width="26" height="10" rx="2"/><path d="M19 24v10" opacity=".6"/>',
    'math-7': '<path d="M4 26H60"/><path d="M32 21v10" /><path d="M14 23v6M50 23v6" opacity=".6"/><path d="M32 14Q22 4 14 14M14 14l1-4.5M14 14l4.5 1"/>',
    'math-8': AXES + '<path d="M14 32L54 8"/><path d="M26 25H40V17" opacity=".7"/>',
    'algebra-1': AXES + '<path d="M16 6Q34 62 52 6"/>',
    'geometry': '<path d="M10 34L52 34L22 8Z"/><path d="M44 34A8 8 0 0 0 46.3 28.6" />',
    'algebra-2': AXES + '<path d="M14 32Q36 30 44 20T56 4"/>',
    'precalculus': '<path d="M4 20H60" opacity=".45"/><path d="M4 20Q11 4 18 20T32 20T46 20T60 20"/>',
    'calculus': AXES + '<path d="M14 30Q30 4 56 12"/><path d="M24 34V19Q30 12 38 10V34Z" fill="currentColor" opacity=".22" stroke="none"/>',
    'trigonometry': '<circle cx="24" cy="20" r="15"/><path d="M24 20L35 10" /><path d="M24 20H39" opacity=".6"/><path d="M31 20A7 7 0 0 0 29.6 15.6"/><path d="M46 20h12" opacity=".45"/>',
    'statistics': '<path d="M4 34H60" opacity=".45"/><path d="M6 33Q20 33 26 16Q32 0 38 16Q44 33 58 33"/><path d="M32 6v28" opacity=".45"/>',
    'calculus-bc': '<g transform="translate(32 20)"><ellipse rx="15" ry="5.5"/><ellipse rx="15" ry="5.5" transform="rotate(60)"/><ellipse rx="15" ry="5.5" transform="rotate(120)"/></g>',
    'int-1': AXES + '<path d="M14 30L54 10"/><g fill="currentColor" stroke="none"><circle cx="22" cy="26" r="3"/><circle cx="38" cy="18" r="3"/></g>',
    'int-2': '<path d="M8 34L40 34L40 10Z"/><path d="M34 34V28H40" opacity=".7"/><circle cx="52" cy="22" r="7"/>',
    'int-3': '<path d="M4 20H60" opacity=".45"/><path d="M4 26Q12 6 20 20T36 22T52 8"/>',
    // an answer sheet's bubbles, one filled in on each row
    'sat-act': '<g opacity=".7">' + [0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<circle cx="${14 + c * 12}" cy="${9 + r * 11}" r="3.6"/>`).join('')).join('') + '</g><g fill="currentColor" stroke="none"><circle cx="26" cy="9" r="3.6"/><circle cx="50" cy="20" r="3.6"/><circle cx="38" cy="31" r="3.6"/></g>',
    // a trophy
    'competition-math': '<path d="M23 5h18v9a9 9 0 0 1-18 0z"/><path d="M23 8h-5a5 5 0 0 0 5.5 7M41 8h5a5 5 0 0 1-5.5 7"/><path d="M32 23v6M26 34h12M28 29h8"/>',
    // a stack of coins, and savings that grow
    'personal-finance': '<ellipse cx="17" cy="32" rx="10" ry="3.5"/><path d="M7 32v-5M27 32v-5"/><ellipse cx="17" cy="27" rx="10" ry="3.5"/><path d="M7 27v-5M27 27v-5"/><ellipse cx="17" cy="22" rx="10" ry="3.5"/><path d="M34 31l8-8 6 4 11-14"/><path d="M53 13h6v6"/>',
    // code brackets
    'coding-logic': '<path d="M21 9L9 20l12 11M43 9l12 11-12 11"/><path d="M36 5L28 35" opacity=".7"/>',
  };
  const ART_FOR = { cc1: 'math-6', cc2: 'math-7', cc3: 'math-8', int1: 'int-1', int2: 'int-2', int3: 'int-3' };
  /** the drawing for a course or book id, or '' */
  const courseArt = id => { const k = ART[id] ? id : ART_FOR[id]; return k ? `<svg class="course-art" viewBox="0 0 64 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${ART[k]}</svg>` : ''; };
  /* ---------- what a course is about, how new it is, and how long it takes ---------- */
  /** the subjects courses fall into (a course's `area`, else math); the Courses page offers the ones that have a course */
  const AREAS = [['math', 'Math'], ['prep', 'Test prep and contests'], ['money', 'Money'], ['coding', 'Coding and logic']];
  const areaOf = c => (AREAS.some(a => a[0] === c.area) ? c.area : 'math');
  /** a course added in the last week (its `added` date): it wears a New chip */
  const freshCourse = c => { if (!c.added) return false; const t = new Date(c.added + 'T00:00').getTime(); return Date.now() >= t && Date.now() - t < 7 * 864e5; };
  /** minutes of practice a course still needs: about two sets for a skill not yet Familiar, one for a Familiar one */
  const minutesLeft = c => A.courseSkills(c).reduce((t, id) => { const l = S.skill(id).level; return t + (l >= 3 ? 0 : (l === 2 ? 1 : 2) * setMinutes(id)); }, 0);
  const timeText = min => { const h = Math.round(min / 60); return min < 55 ? `about ${Math.max(5, Math.round(min / 5) * 5)} minutes` : `about ${h} ${h === 1 ? 'hour' : 'hours'}`; };
  /** how long that is at the daily goal (a question takes about half a minute) */
  function paceText(min) {
    const perDay = Math.max(5, Math.round((Number(S.get().profile.goal) || 20) / 2)), days = Math.ceil(min / perDay);
    return days <= 1 ? 'a day at your daily goal' : days < 14 ? `about ${days} days at your daily goal` : `about ${Math.round(days / 7)} weeks at your daily goal`;
  }
  /** courses put away: their progress is kept, but they're off the home page (profile.archived) */
  const archivedIds = () => (Array.isArray(S.get().profile.archived) ? S.get().profile.archived.filter(id => typeof id === 'string') : []);
  function setArchived(id, on) {
    S.setProfile({ archived: archivedIds().filter(x => x !== id).concat(on ? [id] : []) });
    if (on) S.enroll(id, false);
  }
  function courseCard(c, opts) {
    opts = opts || {};
    const ids = A.courseSkills(c), m = E.mastery(ids), nx = opts.continue ? nextInCourse(c) : null, left = opts.continue ? 0 : minutesLeft(c);
    return `<div class="card course-card" ${courseVar(c)} data-filter="${esc(A.normText(c.title + ' ' + (c.blurb || '') + ' ' + c.subject + ' ' + AREAS.find(a => a[0] === areaOf(c))[1]))}" data-band="${esc(c.subject)}" data-area="${areaOf(c)}"${opts.drag ? ` data-id="${esc(c.id)}"` : ''}>
      <div class="row between" style="align-items:flex-start"><span class="course-head">${mono(c.icon, 'icon mono')}${courseArt(c.id)}</span><span class="card-tools">${opts.drag ? dragHandle(c.title) : ''}${saveBtn(c.id, c.title)}</span></div>
      <h3><a class="card-link" href="${courseHref(c)}">${esc(c.title)}</a></h3>
      ${opts.continue ? '' : (() => { const fit = fitFor(c); return `<div class="course-meta">${freshCourse(c) ? '<span class="chip new-chip">New</span>' : ''}<span class="chip">${gradeLabel(c.grade)}</span>${fit ? `<span class="chip fit-${fit[1]}">${fit[0]}</span>` : ''}${archivedIds().includes(c.id) ? '<span class="chip">Archived</span>' : ''}</div>`; })()}
      ${opts.continue ? '' : `<p>${esc(c.blurb || '')}</p>`}
      <div class="row between small muted"><span>${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}${opts.continue ? '' : ` · <span class="nowrap">${left ? timeText(left) : 'all done'}</span>`}</span><span>${m.pct}% mastered</span></div>
      <div class="pbar"><span style="width:${m.pct}%"></span></div>
      ${nx ? `<a class="btn primary sm continue" href="${practiceHref(nx)}">Continue: ${A.skills[nx].title}</a>` : ''}</div>`;
  }
  function stats() {
    const st = S.streak(), pts = S.get().points;
    return `<span class="stat-pill${st.days ? '' : ' cold'}" title="Practice streak in days">Streak ${st.days}</span><span class="stat-pill" title="Points">${fmt(pts)} pts</span>`;
  }

  /* ---------- home ---------- */
  /** Home's sections, in the order the learner chose, and the ones they hid (profile.homeLayout = { order, hidden, compact }) */
  const HOME_SECS = [['today', 'Today'], ['tiles', 'Daily goal, skills and badges'], ['courses', 'My courses'], ['cpm', 'In class now'], ['recent', 'Pick up where you left off'], ['next', 'Up next']];
  function homeLayout() {
    const l = S.get().profile.homeLayout || {}, keys = HOME_SECS.map(x => x[0]);
    const order = (Array.isArray(l.order) ? l.order : []).filter((k, i, a) => keys.includes(k) && a.indexOf(k) === i);
    keys.forEach((k, i) => { if (!order.includes(k)) order.splice(Math.min(i, order.length), 0, k); });
    return { order, hidden: Array.isArray(l.hidden) ? l.hidden.filter(k => keys.includes(k)) : [], compact: !!l.compact };
  }
  let arrangeOpen = false;
  /** visits on this device, a new one after half an hour away (Home offers the app after the third) */
  const VISITS = (() => { try { const v = JSON.parse(localStorage.getItem('procademy.visits.v1') || '{}') || {}; if (!v.at || Date.now() - v.at > 30 * 60000) v.n = (Number(v.n) || 0) + 1; v.at = Date.now(); localStorage.setItem('procademy.visits.v1', JSON.stringify(v)); return v.n; } catch (e) { return 0; } })();
  const visits = () => { try { return Number((JSON.parse(localStorage.getItem('procademy.visits.v1') || '{}') || {}).n) || VISITS; } catch (e) { return VISITS; } };
  /** the app offer on Home: once, from the third visit, and never again after Not now (Settings always has it) */
  function installOffer() {
    if (!window.INSTALL) return '';
    let put = false; try { put = !!(JSON.parse(localStorage.getItem('procademy.install.v1') || '{}') || {}).later; } catch (e) { put = false; }
    return visits() >= 3 && !put ? INSTALL.slot('home') : '';
  }
  function home(root) {
    busyEnds();
    if (window.BADGES && !isNew()) BADGES.check();          // a badge earned since the last visit counts on the tile below
    const s = S.get(), p = s.profile;
    const name = p.name.trim();
    const st = S.streak();
    const recent = s.recent.filter(id => A.skills[id]).slice(0, 3);
    wireSaving();
    const courses = p.enrolled.map(id => A.courseById(id)).filter(Boolean);
    // skills mastered in the learner's saved courses (every course when none is saved)
    const scope = courses.length ? [].concat(...courses.map(c => A.courseSkills(c))) : Object.keys(A.skills);
    const mastered = scope.filter(id => S.skill(id).level === 4).length;
    // saved courses and books together, in the order the learner put them (a handle to move them once there are two)
    const saved = p.enrolled.filter(id => id.startsWith('cpm:') ? !!(window.CPMVIEWS && A.cpmById(id.slice(4))) : !!A.courseById(id)), drag = saved.length > 1;
    const mine = saved.map(id => id.startsWith('cpm:') ? CPMVIEWS.bookCard(A.cpmById(id.slice(4)), { continue: true, drag }) : courseCard(A.courseById(id), { continue: true, drag }));
    const practised = A.courses.filter(c => !courses.includes(c) && A.courseSkills(c).some(id => S.skill(id).level > 0));
    // up next: the first unfinished skill in each course practiced but not saved (a saved course's card has Continue)
    const upNext = [];
    (courses.length ? [] : practised).forEach(c => {
      const sid = E.courseOrder(c).find(id => S.skill(id).level < 3 && !recent.includes(id));
      if (sid && upNext.length < 3) upNext.push({ sid, c });
    });
    const fresh = isNew(), go = fresh ? null : continueTarget(), next = fresh ? '' : bestNext(), roll = fresh ? 0 : goodRun();
    const earned = window.BADGES ? BADGES.all().filter(b => b.at).sort((a, b) => b.at - a.at) : [], nextBadge = window.BADGES ? BADGES.all().find(b => !b.at) : null;
    const L = homeLayout();
    const sec = {
      today: () => todayCard(),
      tiles: () => `<div class="tiles">
        ${window.BADGES ? BADGES.ring() : ''}
        <a class="tile has-ic" href="#/mastered"><span class="tile-ic ic-star">${icon('star')}</span><div class="big">${mastered}</div><div class="label">of ${scope.length} skills mastered</div></a>
        ${window.BADGES ? `<a class="tile badge-tile has-ic" href="#/progress" data-to-badges${nextBadge ? ` title="Next badge: ${esc(nextBadge.name)}. ${esc(nextBadge.how)}"` : ''}><span class="tile-ic ic-medal">${icon('medal')}</span><div class="big">${earned.length}</div><div class="label">badges earned${earned.length ? `<span class="badge-row" aria-label="Latest: ${esc(earned.slice(0, 4).map(b => b.name).join(', '))}">${earned.slice(0, 4).map(b => `<span class="mini-medal" title="${esc(b.name)}">${icon('medal', 14)}</span>`).join('')}<span class="tile-latest">${esc(earned[0].name)}</span></span>` : ''}${nextBadge ? `<span class="tile-next">Next: ${esc(nextBadge.name)}</span>` : ''}</div></a>` : ''}
      </div>`,
      courses: () => `<div class="section-title"><h2>My courses</h2>${mine.length > 1 ? '<span class="small muted reorder-hint">Drag a course to move it</span>' : ''}<a href="#/courses">Browse courses →</a></div>
        ${newInCourses(courses)}
        ${mine.length ? `<div class="grid fit my-courses${mine.length > 2 ? ' compact' : ''}${mine.length === 1 ? ' one' : ''}" id="my-courses">${mine.join('')}</div><p class="visually-hidden" aria-live="polite" id="my-courses-live"></p>` : emptySaved(practised)}`,
      cpm: () => (window.CPMVIEWS ? CPMVIEWS.homeCard() : ''),
      recent: () => recent.length ? `<div class="section-title"><h2>Pick up where you left off</h2></div>
        <div class="grid">${recent.map(id => { const d = A.skills[id], w = A.whereIs(id), st2 = S.skill(id); return `<div class="card tight"><div class="row">${lvl(st2.level, true)}<div style="flex:1;min-width:0"><div><a href="${skillHref(id)}"><b>${d.title}</b></a></div><div class="small muted">${w ? esc(w.course.title + ' · ' + w.unit.title) : ''}</div></div></div><div class="btn-row"><a class="btn sm primary" href="${practiceHref(id)}">Practice</a><span class="chip lv-${st2.level}">${A.LEVELS[st2.level]}</span></div></div>`; }).join('')}</div>` : '',
      next: () => upNext.length ? `<div class="section-title"><h2>Up next</h2></div>
        <div class="card"><ul class="skills">${upNext.map(x => skillRow(x.sid, { where: x.c.title + ' · ' + A.whereIs(x.sid).unit.title })).join('')}</ul></div>` : '',
    };
    let body = '';
    if (fresh) body = welcomeCard();
    else {
      // the notes that come and go: the week's review follows Today; the rest follow the tiles (or Today, or come first)
      const shown = L.order.filter(k => !L.hidden.includes(k));
      const recap = weekRecap(), more = howNote() + (window.PREP ? PREP.homeCard() : '') + newsCard() + installOffer();
      const atA = shown.includes('today') ? 'today' : null, atB = shown.includes('tiles') ? 'tiles' : atA;
      const notes = h => (h.trim() ? `<div class="home-sec" data-sec="notes">${h}</div>` : '');
      body = (atA || atB ? '' : notes(recap)) + (atB ? '' : notes(more)) + shown.map(k => `<div class="home-sec" data-sec="${k}">${sec[k]()}</div>` + (k === atA ? notes(recap) : '') + (k === atB ? notes((atA ? '' : recap) + more) : '')).join('');
    }
    root.innerHTML = `
      <div class="home-head"><div class="home-hello"><h1>${greeting()}${name ? ', ' + esc(name) : ''}${window.LEARNERS && LEARNERS.count() > 1 ? ' <a class="switch-learner" href="#/profile">Switch learner</a>' : ''}</h1>
        <p class="muted">${roll >= 3 ? `You’re on a roll: ${roll === 3 ? 'three' : roll} good days in a row, each with your daily goal met.` : st.today ? (st.days > 1 ? `You’re on a ${st.days}-day streak. Nice work today.` : 'You practiced today. Nice work.') : st.days ? `Practice today to keep your ${st.days}-day streak going.` : 'Pick a skill to get started.'}${next ? ' ' + next : ''}</p>
        ${fresh ? '' : `<p class="small home-tip">${dayTip()}</p>`}</div>
        ${fresh ? '' : `<div class="home-acts"><button type="button" class="btn home-now" id="home-now" aria-expanded="false" aria-controls="now-pick">${icon('sparkle', 18)} What should I do now?</button>
          ${go ? `<a class="btn primary home-go" id="home-go" href="${go.href}"${go.resume ? ` data-resume="${esc(go.resume)}"` : ''}><span><b>${go.label}</b>${go.sub ? `<small>${esc(go.sub)}</small>` : ''}${go.course ? `<span class="go-course"><span class="go-bar" role="img" aria-label="${esc(go.course.title)}: ${go.pct}% mastered"><span style="width:${go.pct}%"></span></span><small>${esc(go.course.title)} · ${go.pct}% mastered</small></span>` : ''}</span>${icon('send', 18).replace('class="ic"', 'class="ic go-arrow"')}</a>` : ''}</div>`}</div>
      <div class="now-pick" id="now-pick" hidden aria-live="polite"></div>
      ${fresh ? '' : parentStrip()}
      <div class="home-body${L.compact ? ' home-compact' : ''}">${body}</div>
      ${fresh ? '' : `<div class="home-foot"><button type="button" class="btn sm home-all" id="home-all">Show all of Home</button><button type="button" class="btn sm ghost" id="home-arrange" aria-expanded="${arrangeOpen}" aria-controls="arrange">${icon('settings', 16)} Arrange Home</button></div>
        <section class="card arrange" id="arrange" aria-labelledby="arrange-h"${arrangeOpen ? '' : ' hidden'}>${arrangeOpen ? arrangeHtml() : ''}</section>`}
`;
    wireParentStrip(root);
    wireWelcome(root);
    wireWhatIs(root);
    wireToday(root);
    // the goal ring says how long was spent today, and about how long is left
    const gl = root.querySelector('#goal-tile .label'), dd0 = s.days[S.today()] || {}, dq = dd0.q || 0, gg = window.BADGES ? BADGES.goal() : 20, mins = S.minutes(dd0);
    if (gl && dq < gg) gl.textContent = `today’s goal · ${mins ? `${mins} min practiced, ` : ''}about ${Math.max(1, Math.round((gg - dq) / 2))} min left`;
    else if (gl && mins) gl.textContent += ` · ${mins} min`;
    // a day of the week, tapped: what was done that day
    const dd = root.querySelector('#day-detail');
    root.querySelectorAll('.wk-day').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      root.querySelectorAll('.wk-day').forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (open) { dd.hidden = true; return; }
      b.setAttribute('aria-expanded', 'true'); dd.innerHTML = dayDetail(b.dataset.day); dd.hidden = false;
    }));
    const lx = root.querySelector('#levels-x');
    if (lx) lx.addEventListener('click', () => { S.setProfile({ levelsSeen: true }); const n = root.querySelector('#levels-note'); if (n) n.remove(); });
    // a screenshot pasted on Home: questions like it, as on the Practice page
    if (window.UNLIMITED && UNLIMITED.wirePaste) UNLIMITED.wirePaste(root);
    // the first time someone has made their choices: a short tour of the site
    if (!fresh && window.APP && APP.tour && p.tourNext) setTimeout(() => { if (root.isConnected && location.hash.replace(/^#\/?/, '') === '') APP.tour(); }, 400);
    const rx = root.querySelector('#recap-x');
    if (rx) rx.addEventListener('click', () => { S.setProfile({ recapSeen: rx.dataset.week }); const c = root.querySelector('#recap'); if (c) c.remove(); });
    wireReorder(root.querySelector('#my-courses'), root.querySelector('#my-courses-live'));
    if (window.BADGES) BADGES.wireRing(root, () => home(root));
    const nx = root.querySelector('#news-x');
    if (nx) nx.addEventListener('click', () => { S.setProfile({ seenNews: NEWS }); const n = root.querySelector('#news'); if (n) n.remove(); });
    // Continue: a set left halfway opens at the question it was left on
    const hg = root.querySelector('#home-go[data-resume]');
    if (hg) hg.addEventListener('click', () => {
      const lastSet = S.get().profile.lastSet;
      if (lastSet && lastSet.key === hg.dataset.resume && !pausedAll()[lastSet.key]) setPaused(lastSet.key, lastSet.packed);
      window.addEventListener('hashchange', () => setTimeout(() => { const b = document.querySelector('#main #resume'); if (b) b.click(); }, 0), { once: true });
    });
    // the badges tile opens Progress at the badges
    const bt = root.querySelector('[data-to-badges]');
    if (bt) bt.addEventListener('click', () => window.addEventListener('hashchange', () => setTimeout(() => { const b = document.getElementById('badges'); if (b) b.scrollIntoView({ block: 'start' }); }, 30), { once: true }));
    // What should I do now?: the best next thing, with why; Something else steps down the list
    const nb = root.querySelector('#home-now');
    if (nb) {
      let k = 0;
      const pick = root.querySelector('#now-pick');
      const draw = () => {
        const list = nowList(), x = list[k % list.length];
        pick.innerHTML = `<span class="now-ic">${icon(x.icon, 20)}</span><p><b>${x.what}</b> <span class="muted">${x.why}</span></p><div class="btn-row"><a class="btn sm primary" href="${x.href}">${x.go || 'Go'}</a>${list.length > 1 ? '<button type="button" class="btn sm ghost" id="now-else">Something else</button>' : ''}</div>`;
        const el = pick.querySelector('#now-else'); if (el) el.addEventListener('click', () => { k++; draw(); pick.querySelector('#now-else').focus(); });
      };
      nb.addEventListener('click', () => {
        const open = pick.hidden;
        pick.hidden = !open; nb.setAttribute('aria-expanded', String(open));
        if (open) { k = 0; draw(); }
      });
    }
    // Arrange Home: move sections, hide them, and a phone Home of Today alone
    const ab = root.querySelector('#home-arrange');
    if (ab) ab.addEventListener('click', () => { arrangeOpen = !arrangeOpen; home(root); const b = root.querySelector(arrangeOpen ? '#arrange [data-k] button:not(:disabled)' : '#home-arrange'); if (b) b.focus(); if (arrangeOpen) root.querySelector('#arrange').scrollIntoView({ block: 'nearest' }); });
    wireArrange(root);
    const all = root.querySelector('#home-all');
    if (all) all.addEventListener('click', () => { root.querySelector('.home-body').classList.add('show-all'); all.hidden = true; });
    const em = root.querySelector('#save-mine');
    if (em) em.addEventListener('click', () => { S.enroll(em.dataset.course, true); toast('Saved. Today’s practice now comes from it.'); home(root); });
    const eg = root.querySelector('#save-grade');
    if (eg) eg.addEventListener('click', () => { const v = root.querySelector('#pick-grade').value; if (!v) { root.querySelector('#pick-grade').focus(); return; } setGrade(v); toast('Saved. Today’s practice now comes from it.'); home(root); });
    const nc = root.querySelector('#new-in-x');
    if (nc) nc.addEventListener('click', () => { seeCourses(courses); const n = root.querySelector('#new-in'); if (n) n.remove(); });
    bindExplain(root);
  }
  /** the Arrange Home panel: each section with up, down and show; and the phone Home of Today alone */
  function arrangeHtml() {
    const L = homeLayout(), name = k => HOME_SECS.find(x => x[0] === k)[1];
    return `<div class="row between" style="flex-wrap:wrap;gap:8px"><h2 id="arrange-h" style="margin:0">Arrange Home</h2><button type="button" class="btn sm primary" id="arr-done">Done</button></div>
      <p class="small muted" style="margin:4px 0 12px">Move sections up or down, and hide the ones you don’t use. Hidden sections stay here, ready to show again.</p>
      <ol class="arr-list">${L.order.map((k, i) => `<li data-k="${k}" class="${L.hidden.includes(k) ? 'off' : ''}"><span class="arr-name">${name(k)}</span>
        <button type="button" class="btn sm ghost" data-move="-1" aria-label="Move ${name(k)} up"${i === 0 ? ' disabled' : ''}>Up</button><button type="button" class="btn sm ghost" data-move="1" aria-label="Move ${name(k)} down"${i === L.order.length - 1 ? ' disabled' : ''}>Down</button>
        <label class="arr-show"><input type="checkbox" class="switch" data-show ${L.hidden.includes(k) ? '' : 'checked'}${k === 'today' ? ' disabled' : ''}><span>Show</span></label></li>`).join('')}</ol>
      <label class="arr-compact"><input type="checkbox" class="switch" id="arr-compact" ${L.compact ? 'checked' : ''}><span><b>A short Home on a phone</b><span class="small muted">Only Continue and Today, with the rest of Home one tap away</span></span></label>
      <div class="btn-row"><button type="button" class="btn sm ghost" id="arr-reset">Back to the usual order</button></div>`;
  }
  function wireArrange(root) {
    const box = root.querySelector('#arrange');
    if (!box || box.hidden) return;
    const save = (patch, focus) => {
      S.setProfile({ homeLayout: Object.assign(homeLayout(), patch) });
      home(root);
      const el = focus && root.querySelector(focus); if (el && !el.disabled) el.focus(); else { const d = root.querySelector('#arr-done'); if (d) d.focus(); }
    };
    box.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
      const L = homeLayout(), k = b.closest('[data-k]').dataset.k, i = L.order.indexOf(k), j = i + Number(b.dataset.move);
      if (j < 0 || j >= L.order.length) return;
      L.order.splice(i, 1); L.order.splice(j, 0, k);
      save({ order: L.order }, `#arrange [data-k="${k}"] [data-move="${b.dataset.move}"]`);
    }));
    box.querySelectorAll('[data-show]').forEach(c => c.addEventListener('change', () => {
      const L = homeLayout(), k = c.closest('[data-k]').dataset.k;
      save({ hidden: c.checked ? L.hidden.filter(x => x !== k) : L.hidden.concat(k) }, `#arrange [data-k="${k}"] [data-show]`);
    }));
    box.querySelector('#arr-compact').addEventListener('change', ev => save({ compact: ev.target.checked }, '#arr-compact'));
    box.querySelector('#arr-reset').addEventListener('click', () => save({ order: HOME_SECS.map(x => x[0]), hidden: [] }, '#arr-reset'));
    box.querySelector('#arr-done').addEventListener('click', () => { arrangeOpen = false; home(root); const b = root.querySelector('#home-arrange'); if (b) b.focus(); });
  }
  /** no course saved yet: the clearest next step is the course for the learner's grade, saved in one tap */
  function emptySaved(practised) {
    const p = S.get().profile, gc = A.courseById(p.adult ? 'math-6' : p.grade != null ? COURSE_FOR[p.grade] : '');
    return `<div class="card empty-saved"><p><b>No saved courses yet.</b> ${gc ? `Start with <b>${esc(gc.title)}</b>: save it here in one tap, and today’s practice comes from it.` : 'Choose your grade and its course is saved here, so today’s practice comes from it. Or find your class’s CPM book.'}</p>
      <div class="btn-row">${gc ? `<button type="button" class="btn primary" id="save-mine" data-course="${gc.id}">Save ${esc(gc.title)}</button>`
        : `<label class="visually-hidden" for="pick-grade">Your grade</label><select id="pick-grade" class="set-input pick-grade"><option value="">Your grade</option>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">${ordinal(g)}</option>`).join('')}<option value="adult">Adult learner</option></select><button type="button" class="btn primary" id="save-grade">Save my grade’s course</button>`}
        <a class="btn" href="#/courses">Browse courses</a><a class="btn" href="#/courses/cpm">CPM books</a></div>
      ${practised.length ? `<p class="small muted" style="margin:14px 0 6px">You have practiced in:</p><div class="chips">${practised.map(c => `<span class="grade-chip" ${courseVar(c)}>${mono(c.icon, 'mono-sm')}<a href="${courseHref(c)}">${esc(c.title)}</a>${saveBtn(c.id, c.title)}</span>`).join('')}</div>` : ''}</div>`;
  }
  /** skills added to a saved course since the learner last looked (profile.courseSeen: course id → skill ids seen) */
  function newInCourses(courses) {
    const seen = S.get().profile.courseSeen || {}, first = {};
    let note = '';
    courses.forEach(c => {
      const ids = A.courseSkills(c);
      if (!Array.isArray(seen[c.id])) { first[c.id] = ids; return; }          // the first look is just remembered
      const add = ids.filter(id => !seen[c.id].includes(id) && A.skills[id]);
      if (add.length && !note) note = `<div class="new-in small" id="new-in"><span><b>New in ${esc(c.title)}:</b> ${add.slice(0, 3).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${add.length > 3 ? `, and ${add.length - 3} more` : ''}</span><button type="button" class="btn sm ghost" id="new-in-x">Got it</button></div>`;
    });
    if (Object.keys(first).length) S.setProfile({ courseSeen: Object.assign({}, seen, first) });
    return note;
  }
  const seeCourses = courses => S.setProfile({ courseSeen: Object.assign({}, S.get().profile.courseSeen, Object.fromEntries(courses.map(c => [c.id, A.courseSkills(c)]))) });
  /** good days in a row (the daily goal met), ending today, or yesterday while today is still open */
  function goodRun() {
    const st = S.get(), g = window.BADGES ? BADGES.goal() : 20, good = iso => ((st.days[iso] || {}).q || 0) >= g;
    let d = S.today(), n = 0;
    if (!good(d)) d = S.dayShift(d, -1);
    while (good(d) && n < 400) { n++; d = S.dayShift(d, -1); }
    return n;
  }
  /** a short tip under the greeting: one kind on school days, another at the weekend, a different one each day */
  const TIPS_SCHOOL = ['A school day: ten minutes after homework keeps today’s lesson fresh.', 'Stuck on homework? The tutor explains any question step by step.', 'Short and often beats long and rare. One practice set today is plenty.', 'Practice the lesson from class today, while it’s still fresh.', 'A tricky question from school? Type it under Questions like a picture to practice ones like it.'];
  const TIPS_WEEKEND = ['It’s the weekend: a good time for the puzzle of the day or this week’s challenge.', 'Weekend review: a few minutes on your weak skills makes Monday easier.', 'No rush at the weekend. One short practice keeps your streak going.', 'Try something new this weekend: a tool you haven’t opened yet, or a skill a step ahead.'];
  function dayTip() {
    const t = S.today(), wd = new Date(t + 'T12:00').getDay(), list = wd === 0 || wd === 6 ? TIPS_WEEKEND : TIPS_SCHOOL;
    let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return list[h % list.length];
  }
  /** a busy day: today's goal is halved, and it goes back the next day (profile.busy = { day, goal }) */
  function busyEnds() {
    const b = S.get().profile.busy;
    if (b && b.day !== S.today()) S.setProfile({ goal: b.goal, busy: null });
  }
  /** what to do now, best first, each with why: [{ icon, what, why, href, go }] */
  function nowList() {
    const st = S.get(), p = st.profile, t = S.today(), d = st.days[t] || {}, out = [];
    const work = window.FAMILY ? FAMILY.assignedOf(st).filter(a => !a.done && !a.hidden) : [];
    if (work[0]) out.push({ icon: 'target', what: `Practice “${esc(work[0].title)}”`, why: 'It was set for you, and it’s not done yet.', href: FAMILY.setHash(work[0].ids, work[0].title), go: 'Start' });
    const tp = p.prep && window.PREP && PREP.chapterOf(p.prep.book, p.prep.ch) && p.prep.date >= t ? p.prep : null;
    if (tp && !(tp.done && tp.done[t])) out.push({ icon: 'calendar', what: 'Today’s test prep', why: `Your chapter ${tp.ch} test is ${tp.date === t ? 'today' : 'coming up'}, and a little each day works best.`, href: `#/prep/${tp.book}/${tp.ch}`, go: 'Open the plan' });
    const hw = homework();
    if (hw && hw.lesson) out.push({ icon: 'bookmark', what: `Practice for your homework`, why: `It’s due ${hw.when}. A short set on ${esc(hw.what)} helps first.`, href: hw.lesson, go: 'Practice' });
    if (st.missed.length) out.push({ icon: 'review', what: `Fix ${plural(st.missed.length, 'mistake')}`, why: 'They’re still fresh, and correcting them is the quickest way to improve.', href: '#/review', go: 'Review' });
    const plan = E.dailyPlan();
    if (plan.total && !d.daily) out.push({ icon: 'calendar', what: 'Today’s practice', why: `${plural(plan.total, 'question')}, about ${Math.max(3, Math.round(plan.total * 0.7))} minutes: reviews before they slip, and something new.`, href: '#/daily', go: 'Start' });
    if (p.pod !== t) out.push({ icon: 'target', what: 'The problem of the day', why: 'One question at your level. It takes a minute or two.', href: '#/unlimited/day', go: 'Solve' });
    const wk = myCourse();
    if (wk && !(p.weekly || {})[E.weekOf()]) out.push({ icon: 'trophy', what: 'This week’s challenge', why: 'One harder problem with several steps. It’s new every Monday.', href: '#/weekly', go: 'Try it' });
    const fr = somethingNew();
    if (fr) out.push({ icon: 'sparkle', what: `Learn something new: ${A.skills[fr].title}`, why: 'Read the short lesson, then try a few questions.', href: skillHref(fr), go: 'Learn' });
    out.push({ icon: 'timer', what: 'Five minutes of practice', why: 'A quick mix of what you’ve been learning. Stop whenever you like.', href: '#/unlimited/quick', go: 'Start' });
    out.push({ icon: 'flag', what: 'A puzzle', why: 'Leap and Balance are number puzzles with a new one every day.', href: '#/leap/daily', go: 'Play' });
    return out;
  }

  /* ---------- all courses: browse, filter and save ---------- */
  const COURSE_TABS = [['all', 'All'], ['Elementary', 'Elementary'], ['Middle school', 'Middle school'], ['High school', 'High school'], ['cpm', 'CPM books'], ['saved', 'Saved']];
  const SUBJECT_KEY = 'procademy.ui.subject';
  /** the Courses page: math by school level, then each other subject, then the CPM books; filtered by level (the tabs),
      by subject (the chips; #/courses/coding opens on one) and by the words typed. Saved lists archived courses last. */
  function courses(root, tab) {
    wireSaving();
    const areas = AREAS.filter(([id]) => A.courses.some(c => areaOf(c) === id));
    let subject = 'all';
    if (areas.some(a => a[0] === tab)) { subject = tab; tab = 'all'; }
    else { try { const k = localStorage.getItem(SUBJECT_KEY); if (areas.some(a => a[0] === k)) subject = k; } catch (e) { /* All subjects */ } }
    tab = COURSE_TABS.some(t => t[0] === tab) ? tab : 'all';
    const books = A.cpm || [], gone = archivedIds().map(id => A.courseById(id)).filter(Boolean);
    const sections = A.subjects().map(band => [band, band, A.courses.filter(c => c.subject === band && areaOf(c) === 'math')])
      .concat(areas.filter(([id]) => id !== 'math').map(([id, label]) => ['area-' + id, label, A.courses.filter(c => areaOf(c) === id)]))
      .filter(x => x[2].length);
    root.innerHTML = `<h1>Courses</h1>
      <p class="muted">Math for every grade, from Kindergarten to Calculus, plus test prep, competition math, money and coding, and the CPM books chapter by chapter. Select <b>Save</b> on a course to keep it on your home page.</p>
      <div class="course-tools card tight">
        <div class="tabs" role="tablist" aria-label="Show">${COURSE_TABS.map(([id, label]) => `<a role="tab" class="tab${id === tab ? ' on' : ''}" aria-selected="${id === tab}" href="#/courses${id === 'all' ? '' : '/' + encodeURIComponent(id)}">${label}</a>`).join('')}</div>
        <input id="course-find" type="search" placeholder="Find a course: “7th”, “algebra”, “geometry”…" aria-label="Find a course" autocomplete="off">
        ${areas.length > 1 ? `<div class="subject-row" role="group" aria-label="Subject"><span class="small muted">Subject</span>${[['all', 'All subjects']].concat(areas).map(([id, label]) => `<button type="button" class="chip-btn${id === subject ? ' on' : ''}" data-subject="${id}" aria-pressed="${id === subject}">${label}</button>`).join('')}</div>` : ''}
      </div>
      ${(tab === 'all' || tab === 'saved') && subject === 'all' ? recCard() : ''}${studyLaterCard()}
      <div id="course-list">${sections.map(([id, label, list]) => `<section class="band-section" data-band="${esc(id)}"><div class="section-title"><h2>${esc(label)}</h2></div><div class="grid balanced">${list.map(c => courseCard(c)).join('')}</div></section>`).join('')}
        ${books.length && window.CPMVIEWS ? `<section class="band-section" data-band="cpm"><div class="section-title"><h2>CPM books</h2><a href="#/cpm">CPM page →</a></div><div class="grid balanced">${books.map(b => CPMVIEWS.bookCard(b)).join('')}</div></section>` : ''}
        ${gone.length ? `<section class="band-section" data-band="archived"><div class="section-title"><h2>Archived</h2><span class="small muted">Progress kept. Select Save to bring one back to your home page.</span></div><div class="grid balanced">${gone.map(c => courseCard(c)).join('')}</div></section>` : ''}
      </div>
      <div class="card empty" id="course-none" hidden></div>`;
    const find = root.querySelector('#course-find'), none = root.querySelector('#course-none'), list = root.querySelector('#course-list');
    const fits = [...root.querySelectorAll('.grid.balanced')].map(g => balance(g, 250));
    const apply = () => {
      const words = A.normText(find.value).split(' ').filter(Boolean);
      let shown = 0;
      root.querySelectorAll('.band-section').forEach(sec => {
        let inSec = 0;
        const inArchive = sec.dataset.band === 'archived';
        sec.querySelectorAll('.course-card').forEach(card => {
          const saveId = (card.querySelector('[data-save]') || { dataset: {} }).dataset.save || '', band = card.dataset.band;
          const bandOk = inArchive ? tab === 'saved' && !isSaved(saveId)
            : tab === 'all' || (tab === 'saved' ? isSaved(saveId) : tab === 'cpm' ? band === 'cpm' : band === tab);
          const subjectOk = subject === 'all' || (card.dataset.area || 'math') === subject;
          const ok = bandOk && subjectOk && words.every(w => (card.dataset.filter || '').includes(w));
          card.hidden = !ok; if (ok) inSec++;
        });
        sec.hidden = inSec === 0; shown += inSec;
      });
      none.hidden = shown > 0;
      fits.forEach(f => f());
      none.innerHTML = !shown && tab === 'saved' && !words.length && subject === 'all' ? 'You haven’t saved any courses yet. Select <b>Save</b> on a course to show it here and on your home page.'
        : `No courses match${subject !== 'all' ? ` in ${esc(AREAS.find(a => a[0] === subject)[1])}` : ''}.${subject !== 'all' ? ' <button type="button" class="link-btn" data-subject="all">Show all subjects</button>' : ' Try a shorter word, such as “grade” or “algebra”.'}`;
    };
    const pickSubject = id => {
      subject = id;
      try { localStorage.setItem(SUBJECT_KEY, id); } catch (e) { /* this visit only */ }
      root.querySelectorAll('.subject-row [data-subject]').forEach(b => { const on = b.dataset.subject === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      const rec = root.querySelector('#rec-course, .rec-course'); if (rec) rec.hidden = id !== 'all';
      apply();
    };
    root.querySelector('.course-tools').addEventListener('click', ev => { const b = ev.target.closest('[data-subject]'); if (b) pickSubject(b.dataset.subject); });
    none.addEventListener('click', ev => { const b = ev.target.closest('[data-subject]'); if (b) pickSubject(b.dataset.subject); });
    find.addEventListener('input', apply);
    list.addEventListener('click', ev => { if (tab === 'saved' && ev.target.closest('[data-save]')) setTimeout(apply, 0); });
    apply();
  }

  /** the course to suggest first on Courses: a saved course, else the one for the learner's grade */
  function recCard() {
    const p = S.get().profile, saved = p.enrolled.map(id => A.courseById(id)).filter(Boolean)[0];
    const c = saved || (p.grade != null && !p.adult ? A.courseById(COURSE_FOR[p.grade]) : p.adult ? A.courseById('math-6') : null);
    if (!c) return `<div class="card rec-course none"><div class="rec-text"><h2>Not sure where to start?</h2><p class="small muted">Choose your grade, and Procademy recommends a course.</p></div><a class="btn primary" href="#/settings">Choose my grade</a></div>`;
    const nx = nextInCourse(c), m = E.mastery(A.courseSkills(c));
    return `<div class="card rec-course" id="rec-course"><div class="rec-text"><span class="small muted rec-why">Recommended for you · ${saved ? 'your saved course' : p.adult ? 'a good place to start' : `for ${ordinal(p.grade)}`}</span>
        <h2><a href="${courseHref(c)}">${esc(c.title)}</a></h2><p class="small muted">${m.pct}% mastered${nx ? ` · next: ${esc(plain(A.skills[nx].title))}` : ''}</p></div>
      <div class="btn-row">${nx ? `<a class="btn primary" href="${practiceHref(nx)}">Continue</a>` : ''}<a class="btn" href="${courseHref(c)}">Open course</a></div></div>`;
  }

  /* ---------- skills saved to study later (profile.later: skill ids, newest first) ---------- */
  const laterIds = () => (Array.isArray(S.get().profile.later) ? S.get().profile.later.filter(id => typeof id === 'string' && A.skills[id] && A.whereIs(id)) : []);
  function setLater(sid, on) { const now = laterIds().filter(x => x !== sid); S.setProfile({ later: on ? [sid].concat(now).slice(0, 60) : now }); }
  /** the skills saved to study later, as a short row on Courses (all of them are on My notes) */
  function studyLaterCard() {
    const ids = laterIds();
    if (!ids.length) return '';
    return `<div class="card tight study-later"><div class="row between"><h2>Study later</h2><a class="small" href="#/notes">See them all</a></div>
      <div class="sl-chips">${ids.slice(0, 8).map(id => `<a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}${ids.length > 8 ? `<a class="small" href="#/notes">and ${ids.length - 8} more</a>` : ''}</div></div>`;
  }

  /* ---------- a course ---------- */
  /** the course that usually comes next, for "Compare with next year" */
  const NEXT_COURSE = { 'math-k': 'math-1', 'math-1': 'math-2', 'math-2': 'math-3', 'math-3': 'math-4', 'math-4': 'math-5', 'math-5': 'math-6', 'math-6': 'math-7', 'math-7': 'math-8', 'math-8': 'algebra-1',
    'algebra-1': 'geometry', 'geometry': 'algebra-2', 'algebra-2': 'precalculus', 'precalculus': 'calculus', 'calculus': 'calculus-bc', 'int-1': 'int-2', 'int-2': 'int-3', 'int-3': 'precalculus', 'trigonometry': 'calculus' };
  /** units marked "done for now" on a course (profile.doneUnits = { course id: [unit ids] }): folded away on the skill map */
  const doneUnits = cid => { const d = (S.get().profile.doneUnits || {})[cid]; return Array.isArray(d) ? d : []; };
  function setDoneUnit(cid, uid, on) {
    const all = Object.assign({}, S.get().profile.doneUnits), now = doneUnits(cid).filter(x => x !== uid).concat(on ? [uid] : []);
    if (now.length) all[cid] = now; else delete all[cid];
    S.setProfile({ doneUnits: all });
  }
  /** what builds on what inside a course (lib/prereq.js): into[id] = what id builds on (anywhere), out[id] = what in the course builds on it */
  function prereqLinks(c) {
    const ids = new Set(A.courseSkills(c)), into = {}, out = {}, pairs = [];
    if (window.PREREQ) ids.forEach(id => PREREQ.of(id).forEach(p => { (into[id] = into[id] || []).push(p); if (ids.has(p)) { (out[p] = out[p] || []).push(id); pairs.push([p, id]); } }));
    return { into, out, pairs };
  }
  const LOG_KINDS = { practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'Mixed practice', review: 'Review', daily: 'Today’s practice', 'chapter-test': 'Practice test', placement: 'Starting-point check', testout: 'Test out', quiz: 'Timed quiz', boss: 'Boss level', speed: 'Beat your best', weekly: 'Weekly challenge', endless: 'Unlimited practice' };
  /** the newest practice in a course: a set of its skills, a test, a challenge */
  function courseActivity(c) {
    const ids = new Set(A.courseSkills(c));
    const rows = S.get().log.filter(e => e && (e.course === c.id || (e.skill && ids.has(e.skill)) || (e.changes || []).some(ch => ids.has(ch.skillId)))).slice(0, 5);
    if (!rows.length) return '<p class="muted small" style="margin:0">Nothing yet. Your practice in this course will show up here.</p>';
    return `<ul class="log ca-log">${rows.map(e => {
      const what = e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(c.id, e.unit) ? esc(A.unitById(c.id, e.unit).title) : e.title ? esc(e.title) : '';
      const ups = (e.changes || []).filter(ch => ids.has(ch.skillId) && ch.to > ch.from).length;
      return `<li><span class="when">${ago(e.t)}</span><span><b>${LOG_KINDS[e.kind] || 'Practice'}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${ups ? ` <span class="chip up">${ups === 1 ? 'a skill' : ups + ' skills'} up</span>` : ''}</span></li>`;
    }).join('')}</ul>`;
  }
  /** course mastery at the end of each of the last ten weeks, worked back from today's levels through the log's level changes */
  function courseWeeks(c) {
    const ids = A.courseSkills(c), set = new Set(ids), lv = Object.fromEntries(ids.map(id => [id, S.skill(id).level]));
    const log = S.get().log.filter(e => e && (e.changes || []).some(ch => set.has(ch.skillId)));
    const pct = () => Math.round(ids.reduce((t, id) => t + A.LEVEL_POINTS[lv[id]], 0) / Math.max(1, ids.length));
    const mon = mondayOf(S.today()), out = [];
    let k = 0;
    for (let w = 0; w < 10; w++) {
      const end = w === 0 ? Date.now() : new Date(S.dayShift(mon, -7 * (w - 1)) + 'T00:00').getTime();
      while (k < log.length && log[k].t > end) { log[k].changes.forEach(ch => { if (set.has(ch.skillId) && ch.from != null) lv[ch.skillId] = ch.from; }); k++; }
      out.unshift({ start: S.dayShift(mon, -7 * w), pct: pct() });
    }
    return out;
  }
  /** a line of course mastery week by week: hover or focus a week for its number; the numbers are also in a table */
  function courseTrend(c) {
    const weeks = courseWeeks(c);
    if (!weeks.some(w => w.pct)) return '<p class="muted small" style="margin:0">Practice a few skills and your progress in this course shows here, week by week.</p>';
    const top = Math.max(10, Math.ceil(Math.max(...weeks.map(w => w.pct)) / 10) * 10), n = weeks.length;
    const label = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const x = k => (k + 0.5) / n * 100, y = p => 100 - p / top * 100;
    const pts = weeks.map((w, k) => `${x(k).toFixed(2)},${y(w.pct).toFixed(2)}`);
    const gain = weeks[n - 1].pct - weeks[0].pct;
    return `<p class="small muted ct-sum">${gain > 0 ? `Up ${gain} points in ten weeks, to ${weeks[n - 1].pct}% mastered.` : `${weeks[n - 1].pct}% mastered.`}</p>
      <figure class="ct-chart" role="group" aria-label="Course mastery at the end of each week, the last ten weeks">
        <div class="ct-y" aria-hidden="true"><span>${top}%</span><span>${top / 2}%</span><span>0%</span></div>
        <div class="ct-plot">
          <svg class="ct-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="ct-area" d="M${x(0).toFixed(2)},100L${pts.join('L')}L${x(n - 1).toFixed(2)},100Z"/><polyline class="ct-line" points="${pts.join(' ')}" vector-effect="non-scaling-stroke"/></svg>
          ${weeks.map((w, k) => `<div class="ct-col" tabindex="0" aria-label="Week of ${label(w.start)}: ${w.pct}% mastered"><span class="ct-dot" style="bottom:${(100 - y(w.pct)).toFixed(2)}%"></span><span class="ct-tip" style="bottom:${(100 - y(w.pct)).toFixed(2)}%">${label(w.start)} · <b>${w.pct}%</b></span></div>`).join('')}
        </div>
        <div class="ct-x" aria-hidden="true">${weeks.map((w, k) => `<span>${k % 3 === (n - 1) % 3 ? label(w.start) : ''}</span>`).join('')}</div>
      </figure>
      <details class="ct-table"><summary>See the numbers</summary><table><thead><tr><th scope="col">Week of</th><th scope="col">Mastered</th></tr></thead><tbody>${weeks.map(w => `<tr><td>${label(w.start)}</td><td>${w.pct}%</td></tr>`).join('')}</tbody></table></details>`;
  }
  /** this course next to the one after it: their units side by side, and what in the next one builds on this one */
  function compareNext(c) {
    const nx = A.courseById(NEXT_COURSE[c.id] || '');
    if (!nx) return '';
    const here = new Set(A.courseSkills(c)), builds = window.PREREQ ? A.courseSkills(nx).filter(id => PREREQ.of(id).some(p => here.has(p))) : [];
    const col = (co, tag) => { const ids = A.courseSkills(co), m = E.mastery(ids); return `<div class="cmp-col"><div class="small muted">${tag}</div><h3><a href="${courseHref(co)}">${esc(co.title)}</a></h3><p class="small muted">${plural(co.units.length, 'unit')} · ${plural(ids.length, 'skill')} · ${m.pct}% mastered</p><ol class="cmp-units">${co.units.map(u => `<li>${esc(u.title)}</li>`).join('')}</ol></div>`; };
    return `<details class="card compare-next"><summary><span><b>Compare with ${esc(nx.title)}</b><span class="small muted"> · what comes next, unit by unit</span></span></summary>
      <div class="cmp-grid">${col(c, 'This course')}${col(nx, 'Next')}</div>
      ${builds.length ? `<p class="small" style="margin:12px 0 6px"><b>${plural(builds.length, 'skill')} in ${esc(nx.title)} build${builds.length === 1 ? 's' : ''} on this course:</b></p><div class="sl-chips" style="margin-top:0">${builds.slice(0, 8).map(id => `<a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div>` : ''}
      <div class="btn-row"><a class="btn sm" href="${courseHref(nx)}">Open ${esc(nx.title)}</a>${window.PLACEMENT ? `<a class="btn sm ghost" href="#/placement/${nx.id}">Check where I’d start</a>` : ''}</div></details>`;
  }
  /** a coming class test that has skills from this course: which ones, and the way to the test prep */
  function courseTest(c) {
    const t = testSoon(), pp = S.get().profile.prep;
    if (!t || !pp) return '';
    const ids = A.courseSkills(c).filter(id => t.ids.has(id));
    if (!ids.length) return '';
    const ready = ids.filter(id => S.skill(id).level >= 3).length;
    return `<div class="card tight course-test"><div class="row between"><div><h2>On your ${esc(t.name)}, ${esc(t.when)}</h2><p class="small muted" style="margin:2px 0 0">${plural(ids.length, 'skill')} from this course, ${ready} of them Proficient or better.</p></div>
      <div class="btn-row" style="margin:0"><a class="btn sm primary" href="#/unlimited/test">Practice for the test</a><a class="btn sm" href="#/prep/${encodeURIComponent(pp.book)}/${pp.ch}">Test prep</a></div></div>
      <div class="sl-chips">${ids.map(id => `<a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div></div>`;
  }
  /** where to start: at the beginning, or where you're ready (the placement check); after a check, its result */
  function startChoice(c) {
    if (!window.PLACEMENT) return '';
    const placed = (S.get().profile.placed || {})[c.id], ids = A.courseSkills(c), n = E.placementPlan(c).length;
    if (placed || !n || ids.some(id => S.skill(id).tries > 0)) return PLACEMENT.courseCard(c);
    return `<div class="start-choice"><b>Where would you like to start?</b>
      <div class="start-opts"><a class="start-opt" href="${skillHref(ids[0])}">${icon('flag', 22)}<span><b>Start at the beginning</b><span class="small muted">Unit 1, ${esc(c.units[0].title)}, one lesson at a time.</span></span></a>
        <a class="start-opt" href="#/placement/${c.id}">${icon('target', 22)}<span><b>Start where I’m ready</b><span class="small muted">One question from each unit, about ${Math.max(2, Math.round(n * 0.4))} minutes. Practice then starts where you need it.</span></span></a></div></div>`;
  }
  /** the whole course on paper: every unit and skill, with a box to tick and each skill's big idea */
  function printOutline(c) {
    document.querySelectorAll('#skill-print').forEach(x => x.remove());
    const sheet = document.createElement('article');
    sheet.id = 'skill-print'; sheet.className = 'ws-sheet skill-print course-outline';
    sheet.innerHTML = `<header class="ws-head"><div><div class="ws-brand">Procademy · course outline · ${esc(new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }))}</div><h1>${esc(c.title)}</h1><p>${esc(c.blurb || '')}</p></div></header>
      ${c.units.map((u, i) => `<section class="co-unit"><h2>Unit ${i + 1}: ${esc(u.title)}</h2>${u.blurb ? `<p class="small">${esc(u.blurb)}</p>` : ''}
        <ul class="co-skills">${u.skills.filter(id => A.skills[id]).map(id => { const l = S.skill(id).level; return `<li><span class="co-box${l >= 3 ? ' on' : ''}" aria-hidden="true">${l >= 3 ? '✓' : ''}</span><span><b>${A.skills[id].title}</b> <span class="co-lvl">${A.LEVELS[l]}</span><br><span class="small">${esc(bigIdea(id))}</span></span></li>`; }).join('')}</ul></section>`).join('')}`;
    document.getElementById('main').appendChild(sheet);
    document.body.classList.add('print-skill');
    const done = () => { document.body.classList.remove('print-skill'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(() => { if (!window.matchMedia || !matchMedia('print').matches) done(); }, 1000);
  }
  function course(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const ids = A.courseSkills(c), m = E.mastery(ids), left = minutesLeft(c), gone = archivedIds().includes(c.id);
    wireSaving();
    const pool = E.masteryPool(c);
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <span>${esc(c.title)}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row between" style="align-items:flex-start">
          <div class="row">${mono(c.icon, 'icon-big mono')}<div><h1 style="margin:0">${esc(c.title)}</h1><div class="muted">${plural(c.units.length, 'unit')} · ${plural(ids.length, 'skill')}${freshCourse(c) ? ' <span class="chip new-chip">New</span>' : ''}${gone ? ' <span class="chip">Archived</span>' : ''}</div></div></div>
          <div class="course-keep">${saveBtn(c.id, c.title).replace('class="save-btn', 'id="enroll" class="save-btn big')}${isSaved(c.id) ? '<button type="button" class="link-btn small" id="archive">Archive</button>' : ''}</div>
        </div>
        <p style="margin-top:12px">${esc(c.blurb || '')}</p>
        <div class="row between"><b>Course mastery: ${m.pct}%</b><span class="muted small">${fmt(m.points)} of ${fmt(m.possible)} mastery points</span></div>
        ${mbar(ids)}
        <p class="small muted course-time">${left ? `About ${timeText(left).replace(/^about /, '')} of practice left, ${paceText(left)}.` : 'Every skill is Proficient or better. The mastery challenge can take them to Mastered.'}</p>
        ${startChoice(c)}
        <div class="btn-row"><a class="btn" href="#/unlimited/course/${c.id}">${icon('unlimited', 18)} Practice the whole course, mixed</a><button type="button" class="btn ghost" id="print-outline">Print the course outline</button></div>
      </div>
      ${courseTest(c)}
      ${skillMap(c)}
      <div class="grid fit" style="margin-top:16px">
        <div class="card tight"><h3>Course challenge</h3><p class="muted small">${Math.min(E.CHALLENGE_N, ids.length)} questions drawn from every unit. Correct answers raise skill levels; incorrect answers lower them.</p><a class="btn primary sm" href="#/challenge/${c.id}">Start course challenge</a></div>
        <div class="card tight"><h3>Mastery challenge</h3><p class="muted small">${pool.length ? `${E.MASTERY_N} questions on the ${plural(pool.length, 'skill')} you are Familiar or Proficient in, to raise them further.` : 'Practice a few skills to Familiar or Proficient first; this challenge can then raise them to Mastered.'}</p>${pool.length ? `<a class="btn primary sm" href="#/mastery/${c.id}">Start mastery challenge</a>` : `<button class="btn sm" disabled>Not available yet</button>`}</div>
      </div>
      <div class="card course-progress" style="margin-top:16px"><div class="cp-grid"><div><h2>Your progress over time</h2>${courseTrend(c)}</div><div><h2>Recent activity</h2>${courseActivity(c)}</div></div></div>
      ${compareNext(c)}`;
    root.querySelector('#print-outline').addEventListener('click', () => printOutline(c));
    const arch = root.querySelector('#archive');
    if (arch) arch.addEventListener('click', () => { setArchived(c.id, true); toast('Archived: it’s off your home page, and its progress is kept'); course(root, cid); });
    wireSkillMap(root.querySelector('.skill-map'), c);
  }

  /* ---------- a unit ---------- */
  /** the CPM chapters that practice a unit's skills: [{ b, ch, lessons }], the learner's own book first */
  function unitChapters(u) {
    const ids = new Set(u.skills), p = S.get().profile, mine = (p.cpm && p.cpm.book) || ((p.enrolled || []).find(x => /^cpm:/.test(x)) || '').slice(4), out = [];
    (A.cpm || []).forEach(b => b.chapters.forEach(ch => { const ls = ch.lessons.filter(l => l.skills.some(id => ids.has(id))); if (ls.length) out.push({ b, ch, lessons: ls }); }));
    return out.sort((x, y) => (y.b.id === mine) - (x.b.id === mine) || y.lessons.length - x.lessons.length).slice(0, 4);
  }
  /** a skill's lesson boiled down: its first idea, its rules (paragraphs that start in bold) and its example */
  function cheatOf(sid) {
    const d = document.createElement('div'); d.innerHTML = (A.skills[sid] && A.skills[sid].learn) || '';
    const paras = [...d.children].filter(x => !x.classList.contains('example'));
    const startsBold = p => { let f = p.firstChild; while (f && f.nodeType === 3 && !f.nodeValue.trim()) f = f.nextSibling; return !!f && f.nodeName === 'B'; };
    const ex = d.querySelector('.example'); if (ex) { const t = ex.querySelector('.ex-title'); if (t) t.remove(); }
    return { idea: paras[0] ? paras[0].innerHTML : '', rules: paras.slice(1).filter(startsBold).slice(0, 2).map(p => p.innerHTML), example: ex ? ex.innerHTML : '' };
  }
  /** a unit on one page: each skill's key idea, rules and an example */
  const cheatSheet = u => `<div class="cheat-grid">${u.skills.filter(id => A.skills[id]).map(id => { const k = cheatOf(id); return `<section class="cheat-item"><h3>${A.skills[id].title}</h3><div class="cheat-idea">${k.idea}</div>${k.rules.map(r => `<div class="cheat-rule">${r}</div>`).join('')}${k.example ? `<div class="cheat-ex"><span class="cheat-ex-t">Example</span>${k.example}</div>` : ''}</section>`; }).join('')}</div>`;
  function printCheat(c, u) {
    document.querySelectorAll('#skill-print').forEach(x => x.remove());
    const sheet = document.createElement('article');
    sheet.id = 'skill-print'; sheet.className = 'ws-sheet skill-print cheat-print';
    sheet.innerHTML = `<header class="ws-head"><div><div class="ws-brand">Procademy · cheat sheet · ${esc(c.title)}, unit ${c.units.indexOf(u) + 1}</div><h1>${esc(u.title)}</h1></div></header>${cheatSheet(u)}`;
    document.getElementById('main').appendChild(sheet);
    document.body.classList.add('print-skill');
    const done = () => { document.body.classList.remove('print-skill'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(() => { if (!window.matchMedia || !matchMedia('print').matches) done(); }, 1000);
  }
  /** a unit's skills as small squares in the colors of their levels */
  const miniMap = ids => `<span class="mini-map" aria-hidden="true">${ids.filter(id => A.skills[id]).map(id => `<i class="l${S.skill(id).level}"></i>`).join('')}</span>`;
  function unit(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const i = c.units.indexOf(u), m = E.mastery(u.skills);
    const prev = c.units[i - 1], next = c.units[i + 1], chs = unitChapters(u), folded = doneUnits(c.id).includes(u.id);
    root.innerHTML = `
      <div class="crumbs"><a href="#/courses">Courses</a> › <a href="${courseHref(c)}">${esc(c.title)}</a> › <span>Unit ${i + 1}</span></div>
      <div class="two-col">
        <aside class="sidebar card tight"><ul class="unit-nav">${c.units.map((uu, k) => { const mm = E.mastery(uu.skills); return `<li><a href="${unitHref(c, uu)}" class="${uu === u ? 'active' : ''}"${uu === u ? ' aria-current="page"' : ''} aria-label="Unit ${k + 1}, ${esc(uu.title)}: ${mm.pct}% mastered"><span class="n">${k + 1}</span><span>${esc(uu.title)}${miniMap(uu.skills)}</span><span class="small muted un-pct">${mm.pct}%</span></a></li>`; }).join('')}</ul></aside>
        <div>
          <div class="hero" ${courseVar(c)}>
            <div class="row between" style="align-items:flex-start;gap:8px"><div class="num muted small" style="font-weight:600;text-transform:uppercase;letter-spacing:.04em">Unit ${i + 1} · ${esc(c.title)}</div>
              <button type="button" class="link-btn small unit-done" id="unit-done" aria-pressed="${folded}">${folded ? 'Bring it back to the skill map' : 'Done for now'}</button></div>
            <h1>${esc(u.title)}</h1>
            ${u.blurb ? `<p>${esc(u.blurb)}</p>` : ''}
            <div class="row between"><b>Unit mastery: ${m.pct}%</b><span class="muted small">${m.points} of ${m.possible} mastery points</span></div>
            ${mbar(u.skills)}
            <div style="margin-top:10px">${legend(m.counts)}</div>
            ${chs.length ? `<div class="unit-cpm"><span class="small muted">In the CPM books:</span>${chs.map(x => `<a class="chip-btn" href="#/cpm/${x.b.id}/${encodeURIComponent(x.lessons[0].id)}" title="${esc(x.ch.title)}: lesson${x.lessons.length > 1 ? 's' : ''} ${esc(x.lessons.map(l => l.id).join(', '))}">${esc(x.b.short)}, chapter ${x.ch.n}</a>`).join('')}</div>` : ''}
          </div>
          <div class="card" style="margin-top:16px">
            <ul class="skills">${u.skills.map(sid => skillRow(sid, { time: true })).join('')}
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unlimited practice<div class="sub">All skills in this unit, mixed, for as long as you wish.</div></div><div class="actions"><a class="btn sm" href="#/unlimited/unit/${c.id}/${u.id}">Start</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Unit test<div class="sub">One question per skill you’re still learning, with a second chance on a miss.</div></div><div class="actions"><a class="btn sm primary" href="#/test/${c.id}/${u.id}">Start unit test</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Timed quiz<div class="sub">${E.QUIZ_N} questions from this unit in ${E.QUIZ_MIN} minutes, no hints. Questions you don’t reach aren’t mistakes.</div></div><div class="actions"><a class="btn sm" href="#/quiz/${c.id}/${u.id}">Start the quiz</a></div></li>
              <li class="test boss-row"><span class="test-mark" aria-hidden="true"></span><div class="name">Boss level${(S.get().profile.bosses || {})[c.id + '/' + u.id] ? ' <span class="chip up">Beaten</span>' : ''}<div class="sub">The unit’s ${E.BOSS_N} hardest questions, no hints, and ${E.BOSS_LIVES} misses end it. Beat it for the Boss badge.</div></div><div class="actions"><a class="btn sm" href="#/boss/${c.id}/${u.id}">Face the boss</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Printable worksheet<div class="sub">Questions from every skill in this unit, with an answer key.</div></div><div class="actions"><a class="btn sm" href="#/worksheet/unit/${c.id}/${u.id}">Create a worksheet</a></div></li>
              <li class="test"><span class="test-mark" aria-hidden="true"></span><div class="name">Cheat sheet<div class="sub">The key ideas, rules and an example for every skill in this unit, on one page.</div></div><div class="actions"><button type="button" class="btn sm" id="cheat-view" aria-expanded="false" aria-controls="cheat">Show it</button><button type="button" class="btn sm ghost" id="cheat-print">Print</button></div></li>
            </ul>
          </div>
          <div class="card cheat" id="cheat" style="margin-top:16px" hidden><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Cheat sheet: ${esc(u.title)}</h2><button type="button" class="btn sm" id="cheat-print-2">Print</button></div>${cheatSheet(u)}</div>
          <div class="row between" style="margin-top:16px">${prev ? `<a class="btn sm" href="${unitHref(c, prev)}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn sm" href="${unitHref(c, next)}">${esc(next.title)} →</a>` : ''}</div>
        </div>
      </div>`;
    const cheat = root.querySelector('#cheat'), view = root.querySelector('#cheat-view');
    if (window.VOCAB) VOCAB.linkify(cheat);
    view.addEventListener('click', () => { cheat.hidden = !cheat.hidden; view.setAttribute('aria-expanded', String(!cheat.hidden)); view.textContent = cheat.hidden ? 'Show it' : 'Hide it'; if (!cheat.hidden) cheat.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    root.querySelectorAll('#cheat-print, #cheat-print-2').forEach(b => b.addEventListener('click', () => printCheat(c, u)));
    root.querySelector('#unit-done').addEventListener('click', () => { const on = !doneUnits(c.id).includes(u.id); setDoneUnit(c.id, u.id, on); toast(on ? 'Folded away on the skill map. It’s still here whenever you need it.' : 'Back on the skill map'); unit(root, cid, uid); });
  }

  /* ---------- a skill: learn, then practice ---------- */
  /* where a skill turns up in everyday life, and the slips people usually make with it, by topic: each skill's id and
     title are matched in order, so the specific topics come before the broad ones (a skill's own `real` or `mistakes`
     in its course file comes first) */
  const REAL = [
    [/mix-(algebra|data|full|act)/, 'Mixed sets feel like test day: switching quickly from one kind of question to the next, and pacing yourself.'],
    [/sports-stats/, 'Batting averages and free-throw percentages are fractions written as decimals: 7 hits in 20 at-bats is .350.'],
    [/^fin\.budget/, 'A budget shows where a paycheck goes before it’s spent, so rent, food and savings come first and the rest is yours to plan.'],
    [/running-balance/, 'A running balance is how you avoid spending money that isn’t in your account yet, and catch a bank mistake early.'],
    [/gross-pay|payroll|tax-brackets|commission/, 'A paycheck’s net pay is what’s left after taxes, so it’s the number to plan your spending with.'],
    [/^fin\.(loan|credit|amortization)/, 'A loan’s total cost shows how much extra you pay for borrowing: a $20,000 car loan can cost thousands more by the end.'],
    [/^fin\.stocks/, 'Stock returns show how an investment grew or shrank, counting the dividends it paid along the way.'],
    [/^fin\.inflation/, 'Inflation is why a dollar buys less today than it did 20 years ago, and why savings need to earn interest.'],
    [/savings-plan|annuity|doubling/, 'Saving a little every month, with interest, is how people build up money for college or a car: the interest earns interest too.'],
    [/^logic\.(truth|ordering|matching|if-then|and-or-not|equivalent|conditionals)|logic-puzzles/, 'Logic is how search engines combine words (cats AND dogs), and how a program decides what to do next.'],
    [/^logic\.(trace|for-loops|while-loops|nested-loops|lists|functions)/, 'Tracing code by hand, one line at a time, is how programmers find a bug before an app or game ships.'],
    [/^logic\.(binary|decimal-to-binary|other-bases|bits)/, 'Every photo, song and message on a phone is stored as bits, 0s and 1s, and colors on web pages are written in base 16.'],
    [/^logic\.(sorting|searching|euclid|follow-steps)/, 'Sorting and searching are how a music app finds one song among millions in a blink.'],
    [/work-rate/, 'Work rates answer questions like how long two friends take to mow a lawn together when each has their own speed.'],
    [/^comp\.(series|algebra-identities)/, 'Shortcuts like these check a long calculation in your head: 1 + 2 + … + 100 is 50 pairs that each make 101, so 5,050.'],
    [/^comp\.(units-digit|remainders|cycles|trailing-zeros|digit-rules)/, 'Remainders and cycles answer calendar questions, like what day of the week it will be 100 days from now.'],
    [/^comp\.divisors|gcd-lcm|gcf-lcm|factors-primes|gcf-factoring/, 'Factors and multiples help you pack things evenly: 24 cookies fill equal boxes of 2, 3, 4, 6, 8 or 12, but not 5.'],
    [/^(comp|calc)\.motion|vector-motion/, 'Distance equals rate times time: at 60 miles per hour, a 150-mile trip takes 2.5 hours.'],
    [/integral|riemann|antideriv|area-under|area-between|average-value|net-change|u-substitution|integration-by-parts|partial-fractions|improper/, 'Integrals add up a rate over time: from a car’s speed every second, they give the total distance it went.'],
    [/derivative|power-rule|product-rule|quotient-rule|chain-rule|implicit|calc\.tangent-lines|rates-of-change|related-rates|critical|extrema|concavity|increasing|lhopital|limits|continuity/, 'Derivatives measure how fast something changes: a car’s speedometer shows the derivative of its position.'],
    [/separable|slope-fields|euler|logistic/, 'Differential equations model things whose rate of change depends on the amount, like a population, cooling cocoa, or a loan balance.'],
    [/taylor|maclaurin|convergence|lagrange|known-series|sequence-limits|alternating|^bc\.geometric-series/, 'Calculators use series like these to work out sin x and eˣ to many decimal places, adding terms until the answer stops changing.'],
    [/parametric|polar-slope|polar-area|arc-length/, 'Parametric and polar curves describe paths, like a drone’s route or the petals a spirograph draws.'],
    [/vector/, 'Vectors describe motion with a direction, like a plane flying north while the wind pushes it east.'],
    [/matri|determinant|three-variable/, 'Matrices organize numbers in rows and columns; computer graphics use them to rotate and resize every picture on a screen.'],
    [/complex|imaginary/, 'Complex numbers are used by electrical engineers to describe alternating current, and by computers to process sound.'],
    [/conic|focus-directrix/, 'Parabolas and ellipses are in satellite dishes, flashlight mirrors and the orbits of planets.'],
    [/logarithm|evaluate-logs|log-properties|exp-log|solve-exponential/, 'Logarithms measure things that span huge ranges, like earthquakes on the Richter scale and sound in decibels.'],
    [/compound-interest|simple-vs-compound/, 'Compound interest is how savings grow faster each year: the interest itself starts earning interest.'],
    [/simple-interest/, 'Simple interest is what a basic savings bond or a short loan pays: the same amount each year on the starting money.'],
    [/exponential|growth|decay/, 'Exponential growth and decay describe a savings account, a phone’s battery draining, or how fast a video spreads online.'],
    [/discount|sales-tax|\btips\b|unit-price|percent(?!ile)|markup/, 'Percents are on every sale sign and restaurant bill: 30% off a $40 jacket saves $12.'],
    [/sinusoid|amplitude|period|phase|tangent-graph|graph-equation|tangent-function/, 'Sine waves describe things that repeat, like ocean tides, sound waves, and the hours of daylight over a year.'],
    [/polar/, 'Polar coordinates give a direction and a distance, the way a ship’s radar or a lighthouse beam finds things.'],
    [/tally|picture-graphs|bar-graphs|\.graphs|read-graphs|line-plots|line-graphs|histogram|stem-and-leaf|circle-graphs|axis-scales|interpret-graphs/, 'Graphs turn numbers into pictures, like a weather app’s temperature chart or a team’s wins each season.'],
    [/arc-sector|inscribed|chord|tangents-secants|circle-(equation|center)|circles-squares|math7\.circles|sat\.circles|int2\.tangent-lines/, 'Circles are in wheels and pizzas: a bike wheel rolls one circumference forward every time it turns once.'],
    [/unit-circle|radians?\b|coterminal|quadrant-signs|point-terminal|one-ratio|inverse-trig|inverse-exact|identities|sum-difference|double-angle|trig-equations|trig\.solve|reciprocal-trig/, 'Angles measured around a circle run Ferris wheels, clock hands and the gears in a bike, where turns repeat every 360°.'],
    [/elevation|trig-ratios|trig\.ratios|missing-side|missing-angle|law-of|ambiguous|triangle-area|solve-right|right-triangles|tangent-ratio|tangent-applications/, 'Trigonometry measures what you can’t reach: the height of a tree from how far away you stand and the angle up to its top.'],
    [/pythag|distance-midpoint|special-right/, 'The Pythagorean theorem gives a TV’s diagonal size, or how long a ladder must be to reach a window.'],
    [/similar|dilation|scale-(drawings|factors)|proportionality/, 'Scale is how maps and models work: on a 1 : 24 model car, 1 inch stands for 2 feet of the real one.'],
    [/^k\.solid-shapes|sides-corners|shape-names|shape-attributes/, 'Shapes are everywhere in buildings: rectangles in windows, triangles in roofs, and cylinders in cans.'],
    [/volume|surface|prism|cylinder|\bcones?\b|sphere|solid|cross-section|cavalieri|box-volume/, 'Volume and surface area tell you how much water fills a fish tank, or how much wrapping paper covers a box.'],
    [/\barea\b|perimeter|lattice/, 'Area and perimeter tell you how much carpet covers a floor, and how much fence goes around a yard.'],
    [/translation|reflection|rotation|rigid|transformation|symmetry|preserved/, 'Slides, flips and turns are how designers repeat a pattern on wallpaper and how video games move characters.'],
    [/pascal|binomial-theorem|permutation|arrangement|comp\.choosing|multiplication-principle|paths-pages|overlaps|counting-shapes|counting-probability|probability-counting/, 'Counting outcomes is how a lock maker knows a 4-digit code has 10,000 possibilities.'],
    [/\bangles?\b|triangle|congruen|parallel|perpendicular|polygon|quadrilateral|construction|centers/, 'Angles and triangles are how carpenters frame a roof so it’s strong, and how a phone works out where you are.'],
    [/proof|counterexample|converse|induction/, 'Proof is how mathematicians, and lawyers, show a claim must be true every time, not just in the cases they tried.'],
    [/correlation|regression|residual|scatter|trend|least-squares|r-squared|association|curve-fitting|choose-model|model-predict|study-conclusions/, 'A trend line makes predictions, like how tall a plant will be next week from how it has grown so far.'],
    [/sampl|survey|bias|study|population|margin|confidence|p-value|test-statistic|standard-error|\berrors\b|randomization|simulation/, 'Polls ask a few hundred people to learn what a whole town thinks; a fair, random sample is what makes the answer trustworthy.'],
    [/sequence|series|next-term|nth-term|pattern|logic\.repeating|growing/, 'Sequences describe steady changes, like saving $5 more each week, or a stadium that adds 4 seats to every row.'],
    [/probab|chance|dice|expected|binomial-(probability|mean)|stat\.binomial|stat\.geometric|venn|conditional|independ|addition-rule|two-way/, 'Probability is how a forecast says there’s a 30% chance of rain, and how game makers keep a game fair.'],
    [/\bmean\b|median|\bmode\b|spread|center-and-spread|\bmad\b|iqr|deviation|outlier|distribution|z-score|normal|empirical|percentile|statistic|relative-frequency/, 'The mean and the median describe a typical value, like your average quiz score or the middle price of the houses on a street.'],
    [/system/, 'A system finds where two plans meet, like when a $10-a-month plan and a $4-a-month plan plus $1 a day cost the same.'],
    [/rational-irrational/, 'Irrational numbers turn up in real measurements: a square tile 1 foot on a side has a diagonal of √2 feet, about 1.41 feet, a decimal that never ends or repeats.'],
    [/rational-(equations|add|simplify|asymptotes|end)|polynomials-rational/, 'Rational equations solve shared-work and average-speed problems, like a round trip driven at two different speeds.'],
    [/quadratic|parabola|vertex|polynomial|binomials|trinomial|difference-of-squares|factor-(quadratics|cubes|grouping|trinomials)|solve-by-factoring|zeros|end-behavior|complete-the-square|\bpoly-|rational-roots|remainder-theorem/, 'A thrown ball follows a parabola: a quadratic tells you how high it goes and when it lands.'],
    [/radical|square-roots|simplify-roots|rational-exponents|math8\.roots|solve-square-roots|exponents-radicals/, 'Square roots turn up when you know an area and need a side: a square garden of 49 square feet is 7 feet along each side.'],
    [/stretches/, 'Stretching a graph is like zooming a picture in one direction: every height is multiplied by the same number.'],
    [/composite|combine-functions/, 'Combining functions is like a two-step sale: 20% comes off the price, then 8% tax is added to what’s left, one after the other.'],
    [/inverse-functions|shifts|transformations/, 'An inverse undoes a function, like turning a Celsius temperature back into Fahrenheit.'],
    [/negative-exponents/, 'Negative exponents write tiny amounts, like a raindrop’s 10⁻⁵ cubic meters, without long strings of zeros.'],
    [/negative|integer|absolute|abs-|g6\.number-line|opposite|rationals/, 'Negative numbers measure temperatures below zero and money you owe: if it’s −4 °F and it warms up 7 degrees, it’s 3 °F.'],
    [/slope|linear|\blines?\b|function|rate-of-change|intercept|domain|range|point-on-line|piecewise|plane-intercepts/, 'A steady rate makes a line: a taxi that charges $3 plus $2 a mile has a slope of 2 dollars per mile.'],
    [/exponent|powers|scientific/, 'Scientific notation writes huge and tiny numbers neatly, like the 93,000,000 miles to the Sun as 9.3 × 10⁷.'],
    [/inequalit/, 'Inequalities describe limits, like a ride that needs riders at least 48 inches tall, or a budget of at most $50.'],
    [/\bratios?\b|\brates?\b|unit-rate|proportion|recipe|constant-k|unit-conversion|convert/, 'Rates help you compare prices: $3.60 for 12 ounces is 30 cents an ounce, so you can tell which size is the better buy.'],
    [/mult-properties/, 'Multiplying in any order, or in pieces, is how people do math in their heads: 7 × 12 is 7 × 10 plus 7 × 2, which is 84.'],
    [/equation|literal|formula|expression|like-terms|distribut|five-d|fraction-busters|identities|properties|order-of-operations/, 'Equations answer “how many” questions: if a phone plan costs $20 plus $5 per gigabyte and the bill is $45, you used 5 gigabytes.'],
    [/decimal|powers-of-ten/, 'Decimals are how prices and race times are written: $4.75, or a 100-meter dash in 12.38 seconds.'],
    [/fraction|mixed|halves|fourths|thirds/, 'Fractions are in recipes and measuring cups: half a cup plus a quarter cup is three quarters of a cup.'],
    [/coordinate|points-3d/, 'Coordinates are how maps and video games say where things are: across first, then up.'],
    [/\bdiv|remainder|long-division|equal-groups/, 'Dividing is fair sharing: 52 students in vans that hold 8 need 7 vans, with 4 seats to spare.'],
    [/multipl|\bmult|times|arrays|skip-count|even|odd/, 'Multiplying is fast adding: 6 packs of 4 juice boxes is 24 juice boxes.'],
    [/money|coin/, 'Counting money is what a cashier does to give the right change.'],
    [/\btime\b|tell-time|clock/, 'Telling time tells you when the bus comes, and how long until practice starts.'],
    [/length|height|weight|measure|ruler|mass/, 'Measuring tells you whether a couch fits through a door, or how much flour a recipe needs.'],
    [/shape|corners|position|classify/, 'Shapes are everywhere in buildings: rectangles in windows, triangles in roofs, and cylinders in cans.'],
    [/place-value|tens-ones|expanded|hundreds|round|estimate|mental-math|ten-more/, 'Place value is how money works: 3 ten-dollar bills and 4 one-dollar bills make $34.'],
    [/count|compare|teen|numbers to/, 'Counting and comparing are everywhere: the steps up to your door, or which team scored more points.'],
    [/add|sub|make-10|decompose|missing-number|word-problems/, 'Adding and taking away is how you keep score in a game, share snacks, or count your change.'],
  ];
  const SLIP_RULES = [
    [/^logic\.(trace|for-loops|while-loops|nested-loops|lists|functions)/, 'Off by one in a loop: range(1, 5) stops before 5, so it runs 4 times. And list positions count from 0.'],
    [/^logic\.(binary|decimal-to-binary|other-bases|bits)/, 'Reading place values from the left: in binary, the places are 1, 2, 4, 8, … starting from the right.'],
    [/^logic\.(sorting|searching|euclid|follow-steps)/, 'Skipping a step or doing two at once: follow the steps exactly, and write down the list after each one.'],
    [/^logic\.(truth|ordering|matching|if-then|and-or-not|equivalent|conditionals)|converses|counterexamples|proof-/, 'Turning “if A, then B” around: “if B, then A” is a different statement, and it may be false.'],
    [/sub-negatives|add-sub-rationals/, 'Treating “minus a negative” as minus: 5 − (−3) is 5 + 3 = 8, not 2.'],
    [/add-negatives|integers|negatives/, 'Keeping the wrong sign: with different signs, the answer takes the sign of the number farther from zero.'],
    [/mul-div-negatives|order-ops-negatives/, 'Losing track of the sign: a negative times a negative is positive, and an odd number of negative factors makes the answer negative.'],
    [/abs-|absolute-value/, 'Dropping a minus sign before working inside the bars: |3 − 8| is |−5| = 5, so work inside first.'],
    [/order-of-operations|order-ops|evaluate-expressions/, 'Working straight from left to right: parentheses first, then powers, then multiply and divide, then add and subtract.'],
    [/add-sub-fractions|add-sub-mixed|mixed-numbers|rational-add/, 'Adding the bottoms: 1/2 + 1/3 isn’t 2/5. Rewrite with a common denominator first: 3/6 + 2/6 = 5/6.'],
    [/divide-fractions|mul-div-fractions|divide-unit-fractions|fraction-word-problems/, 'Flipping the wrong fraction: keep the first, change ÷ to ×, and flip only the second.'],
    [/multiply-fractions|fraction-times-whole|multiply-mixed|fraction-area/, 'Hunting for a common denominator to multiply: you don’t need one. Multiply the tops and multiply the bottoms.'],
    [/equivalent-fractions|compare-fractions|unit-fractions|fractions-number-line/, 'Comparing only the tops or only the bottoms: 3/8 is less than 2/5 even though 3 is more than 2. Compare with a common denominator.'],
    [/multiply-divide-decimals|g6\.decimals/, 'Guessing where the decimal point goes: count the decimal places in the numbers you multiply, and give the answer that many.'],
    [/decimal/, 'Lining up the last digits instead of the decimal points: line up the points, and fill empty places with zeros.'],
    [/percent-change|increase and decrease/, 'Dividing by the new amount: percent change always divides by the original amount.'],
    [/discount|sales-tax|\btips\b|markup/, 'Taking a percent of the wrong amount: take the discount off first, then work out the tax on the sale price.'],
    [/percent(?!ile)/, 'Using the percent as a whole number: 15% of 80 is 0.15 × 80 = 12, not 15 × 80.'],
    [/tax-brackets/, 'Taxing all of the income at the top rate: each rate applies only to the dollars inside its own bracket.'],
    [/compound-interest|simple-vs-compound|annuity|savings-plan|^fin\.(loan|credit|amortization)/, 'Using the yearly rate for every month: divide the yearly rate by the number of periods in a year.'],
    [/^fin\.budget|running-balance/, 'Leaving out the costs that don’t come every month: yearly bills, like insurance, need a monthly share too.'],
    [/ratio-language|ratio-tables|unit-rates?|unit-price|proportional-table|constant-k|ratios-rates|recipe/, 'Flipping the rate: the word after “per” goes on the bottom, so dollars per pound is dollars ÷ pounds.'],
    [/unit-conversion|convert/, 'Multiplying when you should divide: a bigger unit means fewer of them, so 36 inches is 3 feet, not 432.'],
    [/triangle-inequality/, 'Checking only one pair of sides: every two sides together must be longer than the third, so test the two shortest against the longest.'],
    [/inequalities/, 'Forgetting to flip the sign: when you multiply or divide both sides by a negative number, the inequality turns around.'],
    [/distributive|\.distribute\b|distributing/, 'Multiplying only the first term: 3(x + 4) is 3x + 12, not 3x + 4. A minus sign in front changes every sign inside.'],
    [/like-terms|add-sub-polynomials/, 'Combining terms that aren’t alike: 3x + 2 can’t become 5x, and x² and x are different terms.'],
    [/negative-exponents/, 'Making the answer negative: 2⁻³ is 1/8, a small positive number.'],
    [/scientific/, 'Moving the decimal point the wrong way: a big number gets a positive power of 10, and a small one a negative power.'],
    [/exponent|powers/, 'Multiplying the base by the exponent: 2⁵ is 2 × 2 × 2 × 2 × 2 = 32, not 10.'],
    [/radical|square-roots|simplify-roots|math8\.roots|solve-square-roots/, 'Splitting a root over a sum: √(9 + 16) is √25 = 5, not 3 + 4.'],
    [/pythag|special-right|distance-midpoint/, 'Using the wrong side as c: the hypotenuse, across from the right angle, is always the longest side.'],
        [/quadratic-formula/, 'Dividing only part of the top by 2a: the whole numerator, −b ± √(b² − 4ac), is divided by 2a.'],
    [/complete-the-square/, 'Adding to only one side: when you add (b/2)² to complete the square, add it to the other side as well.'],
    [/factor-(quadratics|cubes|grouping|trinomials)|solve-by-factoring|solve-quadratics|difference-of-squares|zeros-multiplicity|\bpoly-|rational-roots/, 'Stopping at one solution: set each factor equal to zero, since most quadratics have two.'],
    [/factors-primes|gcf|gcd|lcm|divisors/, 'Mixing up the GCF and the LCM: the greatest common factor is never more than the smaller number; the least common multiple is never less than the larger.'],
    [/exponential|growth|decay/, 'Using the percent as the factor: 5% growth means multiplying by 1.05 each time, and 5% decay by 0.95.'],
    [/logarithm|evaluate-logs|log-properties|exp-log/, 'Splitting a log of a sum: log(a + b) isn’t log a + log b. That rule is for a product: log(ab) = log a + log b.'],
    [/sequence|series|nth-term|next-term|taylor|maclaurin|convergence/, 'Off by one in the nth term: the first term uses n = 1, so aₙ = a₁ + (n − 1)d.'],
    [/or-probability|addition-rule|venn|overlaps/, 'Counting the overlap twice: P(A or B) = P(A) + P(B) − P(A and B).'],
    [/conditional/, 'Dividing by the whole table: for the chance of A given B, divide by the B total only.'],
    [/probab|dice|independ|binomial-(probability|mean)|stat\.binomial|stat\.geometric|expected/, 'Adding when you should multiply: for one thing and then another, with independent events, multiply the probabilities.'],
    [/permutation|arrangement|comp\.choosing|combination|counting-(probability|shapes)|multiplication-principle|paths-pages/, 'Counting the same group in different orders: when order doesn’t matter, like choosing a team, divide out the orders.'],
    [/median|\bmean\b|center-(and-)?spread/, 'Finding the median without sorting: put the numbers in order first, then take the middle one.'],
    [/spread|deviation|\bmad\b|iqr|outlier|z-score|normal|empirical/, 'Forgetting to subtract the mean first: distance from the mean comes before dividing by the standard deviation.'],
    [/correlation|regression|association|scatter|study-conclusions/, 'Saying one thing causes another just because they move together: correlation alone doesn’t show cause.'],
    [/sampl|survey|bias|study|population/, 'Trusting a sample that isn’t random: asking only your friends doesn’t tell you about the whole school.'],
    [/chain-rule|implicit|related-rates/, 'Forgetting the inside: the derivative of (3x + 1)⁵ is 5(3x + 1)⁴ · 3.'],
    [/product-rule|quotient-rule/, 'Multiplying the derivatives: the derivative of fg is f′g + fg′, not f′g′.'],
    [/limits|continuity|lhopital/, 'Stopping at 0/0: it doesn’t mean the limit doesn’t exist, only that another method is needed, such as factoring.'],
    [/definite|area-under|area-between|polar-area|net-change|average-value|riemann/, 'Subtracting in the wrong order: a definite integral is F(b) − F(a), the top limit first.'],
    [/integral|antideriv|u-substitution|integration|partial-fractions|improper|separable/, 'Leaving off + C on an indefinite integral, or forgetting to change dx when you substitute.'],
    [/derivative|power-rule|calc\.tangent-lines|critical|extrema|concavity|increasing|second|calc\.motion|rates-of-change/, 'Dropping the power by one but forgetting to multiply by it: the derivative of x⁴ is 4x³.'],
    [/triangle-area|g6\.area|area of triangles/, 'Forgetting the half: a triangle’s area is ½ × base × height, with the height straight up from the base.'],
    [/unit-circle|radians?\b|coterminal|quadrant-signs|point-terminal|sinusoid|amplitude|period|phase|law-of|ambiguous|trig-identities|simplify-identities|sum-difference|double-angle|trig-equations|trig\.solve|inverse-trig|inverse-exact/, 'Using degrees where the angle is in radians (or the other way around): check the calculator’s mode.'],
    [/\bcircles?\b(?!-graphs| graphs)|circumference|arc-sector/, 'Using the diameter where the radius belongs: area is πr², so halve the diameter first.'],
    [/volume|surface/, 'Using the slanted edge as the height: a cone or pyramid uses the height straight up, and is ⅓ of the matching cylinder or prism.'],
    [/\barea\b|perimeter/, 'Mixing up area and perimeter: perimeter is the distance around, in units; area is the space inside, in square units.'],
    [/angle-pairs|angle-relationships|g4\.angles|polygon-angles/, 'Mixing up the totals: complementary angles add to 90°, supplementary angles to 180°.'],
    [/matri/, 'Multiplying matrices entry by entry: each entry of a product is a row times a column, so the sizes have to match up.'],
    [/complex|imaginary/, 'Forgetting that i² = −1: in (2 + 3i)(1 + i), the 3i² becomes −3 and joins the real part.'],
    [/similar|proportionality|scale-(drawings|factors)|dilation/, 'Pairing the wrong sides: match sides in the same position, across from equal angles.'],
    [/trig-ratios|trig\.ratios|missing-side|missing-angle|elevation|solve-right|right-triangles|tangent-ratio|tangent-applications/, 'Mixing up opposite and adjacent: they depend on which angle you’re looking from. SOH-CAH-TOA helps.'],
    [/int2\.tangent-lines|tangents-secants|chords/, 'Forgetting the right angle: a tangent line meets the radius at 90°, which makes a right triangle to work with.'],
    [/system/, 'Stopping after one variable: the answer to a system is a pair, so substitute back to find the other.'],
    [/slope(?![- ]fields)|rate-of-change|linear|sat\.lines|parallel-perpendicular|graph-lines|trend-lines/, 'Subtracting in different orders: slope is (y₂ − y₁) ÷ (x₂ − x₁), with the same point first on top and bottom.'],
    [/function|domain|composite-functions|inverse-functions/, 'Reading f(3) as f times 3: it means the output when the input is 3.'],
    [/two-step|multi-step|variables-both-sides|multistep|equation|literal|fraction-busters/, 'Doing a step to one side only: whatever you do to one side of an equation, do to the other side too.'],
    [/mult-facts|arrays|equal-groups|mult-multiples|times-11|multiply-(1|2)-digit/, 'Mixing up facts that sound alike: 6 × 8 = 48 but 7 × 8 = 56. Skip-count to check one you’re not sure of.'],
    [/div-facts|divide-remainders|long-division|divide-two-digit/, 'Not checking the answer: multiply it by the number you divided by, add the remainder, and you should get back where you started.'],
    [/compare-(numbers|groups|two-digit)/, 'Mixing up the signs: the open side of < or > always faces the bigger number.'],
    [/measure|length|weight/, 'Starting at the 1 on the ruler: line the end of the object up with the 0 mark.'],
    [/elapsed|tell-time|g3\.time|clock/, 'Counting time like ordinary numbers: an hour has 60 minutes, so 50 minutes after 9:30 is 10:20, not 9:80.'],
    [/money|coin/, 'Counting the coins instead of their values: three quarters are worth 75 cents, more than five nickels.'],
    [/round/, 'Rounding from the wrong digit: look one place to the right of the place you’re rounding to.'],
    [/place-value|tens-ones|expanded|hundreds/, 'Reading a digit instead of its value: in 352, the 5 is worth 50.'],
    [/add-sub|subtract|sub-within/, 'Subtracting the smaller digit from the larger in every column: when the top digit is smaller, regroup first.'],
    [/^k\.count|count-120|count-to/, 'Counting one object twice: touch or move each one as you count it, and say one number for each.'],
    [/tally|graphs|line-plots|histogram|stem-and-leaf|axis-scales/, 'Reading the scale as counting by ones: check what each line on the axis is worth before reading a value.'],
  ];
  const GENERAL_SLIPS = ['Stopping a step early: after each step, reread the question and check that you’ve answered what it asks.', 'Copying a number wrong from the question: check your answer against a quick estimate.'];
  const topicOf = sid => (sid + ' ' + plain(A.skills[sid].title)).toLowerCase();
  /** where this skill turns up in everyday life (one sentence), or null */
  function realLife(sid) {
    const d = A.skills[sid];
    if (d && typeof d.real === 'string' && d.real.trim()) return d.real;
    const t = topicOf(sid), hit = REAL.find(([re]) => re.test(t));
    return hit ? hit[1] : null;
  }
  /** the slips people usually make with this skill: two, the topic's own first */
  function usualSlips(sid) {
    const d = A.skills[sid];
    if (d && Array.isArray(d.mistakes) && d.mistakes.length) return d.mistakes.slice(0, 3);
    const t = topicOf(sid), out = [];
    SLIP_RULES.forEach(([re, m]) => { if (out.length < 2 && re.test(t) && !out.includes(m)) out.push(m); });
    GENERAL_SLIPS.forEach(m => { if (out.length < 2) out.push(m); });
    return out;
  }
  /** the kinds of slip this learner has made on this skill, most often first: [[kind, times]] */
  const mySlips = sid => Object.entries(S.get().mistakes || {}).map(([k, v]) => [k, (v && v.skills && v.skills[sid]) || 0]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 2);
  /** the tools that suit a skill, always a few: the hands-on ones that match it, then the graphing calculator,
      the step checker and word problems where they fit, then the calculator and the math words */
  const TOOL_ICON = [[/^#\/tiles/, 'tiles'], [/^#\/chance/, 'dice'], [/^#\/numbers/, 'integers'], [/^#\/data/, 'data'], [/^#\/integers/, 'integers'], [/^#\/fractions/, 'fraction'], [/^#\/shapes/, 'shapes'], [/^#\/percent/, 'percent'], [/^#\/leap/, 'flag']];
  function relatedTools(sid) {
    const t = topicOf(sid), out = [], add = (href, label, ic) => { if (out.length < 5 && !out.some(x => x[0] === href)) out.push([href, label, ic]); };
    const d = document.createElement('div'); d.innerHTML = toolLinks(sid, plain(A.skills[sid].title));
    d.querySelectorAll('a').forEach(a => { const h = a.getAttribute('href'); add(h, a.textContent, (TOOL_ICON.find(([re]) => re.test(h)) || [0, 'calc'])[1]); });
    if (/slope|linear|line|function|graph|parabola|quadratic|exponential|sinusoid|amplitude|period|polynomial|rational|log|conic|circle-equation|derivative|tangent|limit|integral|area-under/.test(t)) add('#/graph', 'Graphing calculator', 'graph');
    if (/equation|inequalit|expression|distribut|like terms|like-terms|literal|fraction-busters|factor/.test(t) && !/logic\./.test(t)) add('#/steps', 'Step checker', 'steps');
    if (/word-problems|five-d|work-rate|systems-word|\.motion/.test(t)) add('#/setup', 'Word problems to equations', 'story');
    if (/mean|median|spread|histogram|box|deviation|data|statistic|scatter|regression/.test(t)) add('#/data', 'Data and statistics', 'data');
    add('#/calc', 'Calculator', 'calc');
    add('#/words', 'Math words', 'book');
    return out;
  }
  /* ---------- the last answers on each skill: kept on this device for the learner on screen, from the changes to
     each skill's tries and rights as practice is saved (so every kind of practice counts) ---------- */
  const ANS_KEY = () => 'procademy.answers.v1' + (window.LEARNERS && LEARNERS.active ? '.' + LEARNERS.active() : '');
  const answersAll = () => { try { const o = JSON.parse(localStorage.getItem(ANS_KEY()) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  const answersOf = sid => { const a = answersAll()[sid]; return Array.isArray(a) ? a.filter(x => Array.isArray(x) && x.length === 2) : []; };
  (function watchAnswers() {
    if (!S.onChange) return;
    const snap = () => { const o = {}; Object.entries(S.get().skills || {}).forEach(([id, k]) => { o[id] = [k.tries || 0, k.right || 0]; }); return o; };
    let was = snap(), who = ANS_KEY();
    S.onChange(st => {
      const skills = st.skills || {};
      if (ANS_KEY() !== who) { was = snap(); who = ANS_KEY(); return; }
      if (!Object.keys(skills).length && Object.keys(was).length && !Object.keys(st.notes || {}).length) { try { localStorage.removeItem(ANS_KEY()); localStorage.removeItem(DRAW_KEY()); } catch (e) { /* fine */ } was = {}; return; }   // progress erased: its answers and drawings go too
      let all = null;
      Object.entries(skills).forEach(([id, k]) => {
        const w = was[id] || [0, 0], dt = (k.tries || 0) - w[0], dr = (k.right || 0) - w[1];
        if (dt === 1 && (dr === 0 || dr === 1)) { all = all || answersAll(); all[id] = (Array.isArray(all[id]) ? all[id] : []).concat([[Date.now(), dr]]).slice(-10); }
        if (dt || dr) was[id] = [k.tries || 0, k.right || 0];
      });
      if (Object.keys(was).some(id => !skills[id])) was = snap();
      if (all) { const keep = Object.entries(all).filter(([, v]) => Array.isArray(v) && v.length).sort((a, b) => b[1][b[1].length - 1][0] - a[1][a[1].length - 1][0]).slice(0, 300); try { localStorage.setItem(ANS_KEY(), JSON.stringify(Object.fromEntries(keep))); } catch (e) { /* storage full: these few are lost */ } }
    });
  })();
  /** the last ten answers as a row of marks, oldest first, with the way to review the ones missed */
  function lastAnswers(sid) {
    const list = answersOf(sid);
    if (!list.length) return '';
    const right = list.filter(x => x[1]).length, missed = S.get().missed.filter(m => m.skill === sid).length;
    return `<div class="last-answers"><span class="small muted">Your last ${list.length === 1 ? 'answer' : plural(list.length, 'answer')}:</span>
      <span class="la-marks" role="img" aria-label="${right} of the last ${list.length} right the first time">${list.map(([t, ok]) => `<i class="${ok ? 'ok' : 'miss'}" title="${ok ? 'Right the first time' : 'Not yet'}, ${esc(ago(t))}"></i>`).join('')}</span>
      <span class="small muted">${right} of ${list.length} right</span>${missed ? ` <a class="small" href="#/review">Review ${missed === 1 ? 'the one' : 'the ' + missed} you missed</a>` : ''}</div>`;
  }
  /* ---------- drawings in notes: strokes on a 600 × 300 board, kept on this device for the learner on screen ---------- */
  const DRAW_KEY = () => 'procademy.drawings.v1' + (window.LEARNERS && LEARNERS.active ? '.' + LEARNERS.active() : '');
  const drawingsAll = () => { try { const o = JSON.parse(localStorage.getItem(DRAW_KEY()) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  const drawingOf = sid => { const d = drawingsAll()[sid]; return d && Array.isArray(d.strokes) && d.strokes.length ? d : null; };
  function saveDrawing(sid, strokes) {
    const all = drawingsAll();
    if (strokes.length) all[sid] = { strokes, t: Date.now() }; else delete all[sid];
    try { localStorage.setItem(DRAW_KEY(), JSON.stringify(all)); return true; } catch (e) { return false; }
  }
  const drawingSvg = (d, label) => `<svg class="note-drawing" viewBox="0 0 600 300" role="img" aria-label="${esc(label || 'Your drawing')}">${d.strokes.map(s => (s.length === 2 ? `<circle cx="${s[0]}" cy="${s[1]}" r="2.5"/>` : `<polyline points="${s.join(' ')}"/>`)).join('')}</svg>`;
  /** a drawing board under a note: draw with a finger, a pen or the mouse; Undo and Clear; saved as you go */
  function noteBoard(box, sid) {
    let strokes = (drawingOf(sid) || { strokes: [] }).strokes.map(s => s.slice()), cur = null;
    box.innerHTML = `<div class="nb-bar"><span class="small muted" id="nb-state">${strokes.length ? 'Your drawing, saved on this device' : 'Draw here. It’s saved on this device as you go.'}</span><span class="nb-btns"><button type="button" class="btn sm ghost" data-nb="undo">Undo</button><button type="button" class="btn sm ghost" data-nb="clear">Clear</button></span></div><canvas class="nb-canvas" aria-label="Drawing board for your note"></canvas>`;
    const cv = box.querySelector('canvas'), ctx = cv.getContext('2d'), state = box.querySelector('#nb-state');
    const paint = () => {
      const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      if (!r.width) return;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.width / 2 * dpr);
      const k = cv.width / 600; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.clearRect(0, 0, 600, 300);
      ctx.strokeStyle = ctx.fillStyle = getComputedStyle(box).color; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      strokes.concat(cur ? [cur] : []).forEach(s => { ctx.beginPath(); if (s.length === 2) { ctx.arc(s[0], s[1], 2.5, 0, Math.PI * 2); ctx.fill(); return; } ctx.moveTo(s[0], s[1]); for (let i = 2; i < s.length; i += 2) ctx.lineTo(s[i], s[i + 1]); ctx.stroke(); });
      box.querySelector('[data-nb="undo"]').disabled = box.querySelector('[data-nb="clear"]').disabled = !strokes.length;
    };
    const at = ev => { const r = cv.getBoundingClientRect(); return [Math.round(Math.max(0, Math.min(600, (ev.clientX - r.left) / r.width * 600))), Math.round(Math.max(0, Math.min(300, (ev.clientY - r.top) / r.height * 300)))]; };
    const keep = () => { const ok = saveDrawing(sid, strokes); state.textContent = !ok ? 'This device’s storage is full, so the drawing couldn’t be saved.' : strokes.length ? 'Saved on this device' : 'Draw here. It’s saved on this device as you go.'; };
    cv.addEventListener('pointerdown', ev => { if (ev.button > 0) return; ev.preventDefault(); cv.setPointerCapture(ev.pointerId); cur = at(ev); paint(); });
    cv.addEventListener('pointermove', ev => { if (!cur) return; const p = at(ev), n = cur.length; if (Math.hypot(p[0] - cur[n - 2], p[1] - cur[n - 1]) >= 2 && cur.length < 2400) { cur.push(p[0], p[1]); paint(); } });
    const end = () => { if (!cur) return; strokes.push(cur); cur = null; if (strokes.length > 200) strokes.shift(); keep(); paint(); };
    ['pointerup', 'pointercancel'].forEach(e => cv.addEventListener(e, end));
    box.addEventListener('click', ev => {
      const b = ev.target.closest('[data-nb]'); if (!b) return;
      if (b.dataset.nb === 'undo') strokes.pop();
      if (b.dataset.nb === 'clear') { const was = strokes; strokes = []; toast('Drawing cleared'); box.__undoClear = () => { strokes = was; keep(); paint(); }; }
      keep(); paint();
    });
    if (window.ResizeObserver) { const ro = new ResizeObserver(() => { if (!box.isConnected) { ro.disconnect(); return; } paint(); }); ro.observe(cv); } else setTimeout(paint, 0);
    box.__board = { strokes: () => strokes, add(s) { strokes.push(s); keep(); paint(); } };          // for the test suite
  }
  /* ---------- the lesson's own settings, on this device: text size, and Spanish where a lesson has it ---------- */
  const LESSON_KEY = 'procademy.lesson.v1';
  const lessonPref = () => { try { const o = JSON.parse(localStorage.getItem(LESSON_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  const setLessonPref = patch => { try { localStorage.setItem(LESSON_KEY, JSON.stringify(Object.assign(lessonPref(), patch))); } catch (e) { /* this visit only */ } };
  const SIZES = ['s', 'm', 'l', 'xl'];
  /** the language a lesson shows in: Spanish where it has been written and the learner chose it (or, choosing nothing,
      uses the site in Spanish); otherwise English */
  const lessonLang = sid => { const want = lessonPref().lang || (window.LANG && LANG.get() === 'es' ? 'es' : 'en'); return A.skills[sid].learnEs && want === 'es' ? 'es' : 'en'; };
  /** a link to a skill page that works from anywhere: the live site when this copy isn't on the web */
  const skillUrl = sid => (/^https?:$/.test(location.protocol) ? location.href.split('#')[0] : 'https://priyaanh.github.io/procademy/') + '#/skill/' + encodeURIComponent(sid);
  function copyText(t) {
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } ta.remove(); return ok; };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(() => true, fallback);
    return Promise.resolve(fallback());
  }
  /** "Check your understanding": one question from the skill's own maker, checked here, with the working on a miss.
      It's a check, not practice: nothing is scored or saved. */
  function checkBox(box, sid) {
    if (!box) return;
    let q = null, done = false;
    const fresh = () => { q = A.question(sid, 'check-' + Math.random().toString(36).slice(2, 9)); done = false; draw(); };
    const fb = (good, msg) => {
      done = true;
      const ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q);
      box.querySelector('.ck-fb').innerHTML = good ? `<div class="feedback good">${icon('check', 18)}<span>That’s right. You’re ready for the practice.</span></div>`
        : `<div class="feedback ck-miss">${icon('info', 18)}<span>${msg || 'Not quite. Here’s how it works:'}</span></div><ol class="we-steps ck-steps">${q.hints.map((h, k) => `<li class="hint"><div class="hn">${k === q.hints.length - 1 ? 'Last step' : 'Step ' + (k + 1)}</div>${h}</li>`).join('')}</ol><p class="ck-ans"><b>Answer:</b> ${ans}</p>`;
      box.querySelectorAll('.ck-choice, #ck-ans, #ck-go').forEach(x => { x.disabled = true; });
      if (q.type === 'choice') box.querySelectorAll('.ck-choice').forEach((b, k) => { b.classList.toggle('is-right', k === q.answerIndex); });
      if (window.VOCAB) VOCAB.linkify(box.querySelector('.ck-steps'));
      box.__check = { q, good };
    };
    function draw() {
      box.innerHTML = `<div class="row between" style="gap:8px"><h3>Check your understanding</h3><button type="button" class="btn sm ghost" id="ck-new">Another question</button></div>
        <p class="small muted" style="margin:0 0 8px">One question to see how the lesson sank in. It doesn’t count toward your level.</p>
        <div class="question">${q.prompt}</div>
        ${q.type === 'choice' ? `<div class="ck-choices">${q.choices.map((ch, k) => `<button type="button" class="ck-choice" data-k="${k}"><span class="ck-letter">${'ABCDEFGH'[k]}</span><span>${ch}</span></button>`).join('')}</div>`
          : `<form class="ck-form" autocomplete="off"><label class="visually-hidden" for="ck-ans">Your answer</label><input id="ck-ans" type="text" inputmode="${q.type === 'number' ? 'decimal' : 'text'}" placeholder="Your answer${q.unit && q.unit !== '$' ? ` (${esc(q.unit)})` : ''}" autocomplete="off" spellcheck="false"><button type="submit" class="btn primary sm" id="ck-go">Check</button></form>`}
        <div class="ck-fb" aria-live="polite"></div>`;
      box.querySelector('#ck-new').addEventListener('click', fresh);
      box.querySelectorAll('.ck-choice').forEach(b => b.addEventListener('click', () => { if (done) return; const k = Number(b.dataset.k), good = A.check(q, k).correct; b.classList.add(good ? 'is-right' : 'is-wrong'); fb(good); }));
      const form = box.querySelector('.ck-form');
      if (form) form.addEventListener('submit', ev => {
        ev.preventDefault(); if (done) return;
        const v = box.querySelector('#ck-ans').value.trim();
        if (!v) { box.querySelector('.ck-fb').innerHTML = '<p class="small muted">Type your answer first.</p>'; return; }
        const r = A.check(q, v);
        if (r.unreadable) { box.querySelector('.ck-fb').innerHTML = '<p class="small muted">Type a number, like 12, −3, 3/4 or 2.5.</p>'; return; }
        const slip = !r.correct && window.COACH ? COACH.diagnose(q, v) : null;
        fb(r.correct, slip ? slip.msg + ' Here’s the working:' : null);
      });
      box.__check = { q, good: null };
    }
    fresh();
  }
  /** each example in a lesson can be tried with other numbers: a fresh question from the skill's maker, solved */
  function exampleSwaps(body, sid) {
    const ex = body.querySelector('.example');
    if (!ex) return;
    const orig = ex.innerHTML;
    const bar = () => '<div class="ex-swap"><button type="button" class="btn sm ghost" data-ex="new">Try it with other numbers</button></div>';
    ex.insertAdjacentHTML('beforeend', bar());
    ex.addEventListener('click', ev => {
      const b = ev.target.closest('[data-ex]'); if (!b) return;
      if (b.dataset.ex === 'back') { ex.innerHTML = orig + bar(); if (window.VOCAB) VOCAB.linkify(ex); ex.__swapped = null; return; }
      const q = A.question(sid, 'ex-' + Math.random().toString(36).slice(2, 9)), ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q);
      ex.innerHTML = `<div class="ex-title">The same idea, new numbers</div><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map((c, k) => `<li class="${k === q.answerIndex ? 'is-right' : ''}">${c}</li>`).join('')}</ol>` : ''}
        <ol class="ex-steps">${q.hints.map(h => `<li>${h}</li>`).join('')}</ol><p class="ex-ans"><b>Answer:</b> ${ans}</p>
        <div class="ex-swap"><button type="button" class="btn sm ghost" data-ex="new">Other numbers</button><button type="button" class="btn sm ghost" data-ex="back">Back to the lesson’s example</button></div>`;
      ex.__swapped = q;
    });
  }
  function skill(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    const st = S.skill(sid), c = where.course, u = where.unit;
    const idx = u.skills.indexOf(sid);
    const nxt = nextSkill(sid), later = laterIds().includes(sid), size = SIZES.includes(lessonPref().size) ? lessonPref().size : 'm';
    const real = realLife(sid), slips = usualSlips(sid), mine = mySlips(sid), tools = relatedTools(sid);
    root.innerHTML = `
      <div class="crumbs"><a href="${courseHref(c)}">${esc(c.title)}</a> › <a href="${unitHref(c, u)}">${esc(u.title)}</a> › <span>Skill ${idx + 1} of ${u.skills.length}</span></div>
      <div class="hero" ${courseVar(c)}>
        <div class="row skill-top">${lvl(st.level, true)}<div style="flex:1;min-width:0"><h1 style="margin:0">${def.title}</h1><div class="muted small">${A.LEVELS[st.level]}${st.tries ? ` · ${plural(st.tries, 'question')} answered, ${Math.round(st.right / st.tries * 100)}% right` : st.level ? '' : ' · not practiced yet'} · a practice set takes about ${setMinutes(sid)} minutes${testChip(sid)}</div>${lastAnswers(sid)}</div>
          <div class="skill-keep"><button type="button" class="chip-btn${later ? ' on' : ''}" id="later" aria-pressed="${later}">${icon('bookmark', 16)}<span>${later ? 'Saved to study later' : 'Study later'}</span></button><button type="button" class="chip-btn" id="share-skill">${icon('send', 16)}<span>Share</span></button></div></div>
        ${bigIdea(sid) ? `<p class="big-idea"><b>The big idea:</b> ${esc(bigIdea(sid))}</p>` : ''}
        <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice · ${E.PRACTICE_N} questions</a><a class="btn" href="#/unlimited/skill/${encodeURIComponent(sid)}">Unlimited practice</a>${nxt ? `<a class="btn ghost" href="${skillHref(nxt)}">Next skill: ${A.skills[nxt].title} →</a>` : ''}</div>
        <p class="skill-pace small">Too easy? <button class="link-btn" type="button" id="testout">Test out with ${E.TESTOUT_N} questions</button> <span aria-hidden="true">·</span> Against the clock? <a href="#/speed/${encodeURIComponent(sid)}">Beat your best</a>${(() => { const b = (S.get().profile.best || {})[sid]; return b ? ` <span class="muted">(best ${clockText(b.ms)}, ${b.right} of ${b.total} right)</span>` : ''; })()}${prevSkill(sid) ? ` <span aria-hidden="true">·</span> Too hard? <a href="${skillHref(prevSkill(sid))}">Go back to ${A.skills[prevSkill(sid)].title}</a>` : ''}</p>
        <details class="more-ways"><summary>More ways to practice</summary>
          <div class="btn-row">${explainBtn('Ask the tutor to explain', `Explain “${plain(def.title)}” to me step by step, with an example.`)}<a class="btn ghost" href="#/worksheet/skill/${encodeURIComponent(sid)}">Printable worksheet</a><button class="btn ghost" type="button" id="print-summary">Print a one-page summary</button>${toolLinks(sid, plain(def.title))}</div></details>
        ${(() => { const pre = beforeThis(sid); return pre.length ? `<div class="before-this"><span class="small muted">Good to know first:</span>${pre.map(id => `<a class="chip-btn" href="${skillHref(id)}">${lvl(S.skill(id).level)} ${A.skills[id].title}</a>`).join('')}</div>` : ''; })()}
      </div>
      <div class="card learn-card" style="margin-top:16px">
        <div class="learn-head"><h2>Learn</h2><div class="learn-tools">
          ${window.COACH && COACH.canSpeak() ? '<button type="button" class="btn sm ghost" id="read-lesson" aria-pressed="false">Read aloud</button>' : ''}
          <span class="seg-sm" role="group" aria-label="Lesson text size"><button type="button" data-text-size="-1" aria-label="Smaller lesson text" title="Smaller text"${size === SIZES[0] ? ' disabled' : ''}>A<span aria-hidden="true">−</span></button><button type="button" data-text-size="1" aria-label="Larger lesson text" title="Larger text"${size === SIZES[SIZES.length - 1] ? ' disabled' : ''}>A<span aria-hidden="true">+</span></button></span>
          ${def.learnEs ? `<span class="seg-sm" role="group" aria-label="Lesson language"><button type="button" data-lang="en" aria-pressed="${lessonLang(sid) === 'en'}">English</button><button type="button" data-lang="es" lang="es" aria-pressed="${lessonLang(sid) === 'es'}">Español</button></span>` : ''}
        </div></div>
        <div class="learn-wrap">
          <div class="learn-main">
            <div class="learn-sum" id="learn-sum" hidden></div>
            <div class="learn" data-size="${size}"><div class="learn-body"></div></div>
            <div class="check-box" id="check"></div>
            <div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice</a><button type="button" class="btn ghost" id="ask-lesson">Ask about this lesson</button>${explainBtn('Ask for another explanation', `I read the lesson on “${plain(def.title)}”. Can you explain it a different way, with a new example?`)}</div>
          </div>
          <aside class="learn-side" aria-label="More about this skill">
            ${real ? `<section class="side-box"><h3>${icon('globe', 18)}In real life</h3><p>${esc(real)}</p></section>` : ''}
            <section class="side-box slips-box"><h3>${icon('info', 18)}Watch out for</h3><ul>${slips.map(m => `<li>${esc(m)}</li>`).join('')}</ul>${mine.length ? `<p class="my-slips small"><b>Your own slips here:</b> ${mine.map(([k, n]) => `${esc((SLIPS[k] || k).toLowerCase())} (${plural(n, 'time')})`).join(', ')}.${window.COACH && COACH.TIPS[mine[0][0]] ? ' ' + esc(COACH.TIPS[mine[0][0]]) : ''}</p>` : ''}</section>
            <section class="side-box"><h3>${icon('calc', 18)}Related tools</h3><ul class="side-tools">${tools.map(([h, l, ic]) => `<li><a href="${h}">${icon(ic, 18)}<span>${esc(l)}</span></a></li>`).join('')}</ul></section>
          </aside>
        </div>
      </div>
      <div class="card samples" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Three questions like the practice</h2><a class="btn sm" href="${practiceHref(sid)}">Practice</a></div>
        <p class="muted small" style="margin:4px 0 10px">A look before you start. Try each one in your head, then check.</p>
        <ol class="sample-list">${[1, 2, 3].map(k => { const q = A.question(sid, `peek-${S.today()}-${k}`), ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q); return `<li><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}<details class="sample-ans"><summary>Show the answer</summary><p>${ans}</p></details></li>`; }).join('')}</ol></div>
      <div class="card worked" id="worked" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Worked example</h2><button class="btn sm ghost" id="we-new" type="button">Another example</button></div>
        <p class="muted small" style="margin:4px 0 10px">A new example each time, solved one step at a time. Try each step yourself before revealing it, or select Play to watch it worked out.</p><div id="we-body"></div></div>
      <div class="card my-notes" style="margin-top:16px"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0"><label for="note">My notes</label></h2><a class="small" href="#/notes">All my notes</a></div>
        <p class="muted small" style="margin:4px 0 8px">Write it in your own words: a rule, a reminder, or a mistake to watch for. Notes are saved as you type.</p>
        <textarea id="note" rows="4" maxlength="4000" placeholder="For example: when both numbers are negative, the answer is positive.">${esc(S.note(sid))}</textarea><div class="tiny muted" id="note-saved" aria-live="polite"></div>
        <div class="note-draw">${drawingOf(sid) ? '' : '<button type="button" class="btn sm ghost" id="draw-open">Add a drawing</button>'}<div class="note-board" id="note-board"${drawingOf(sid) ? '' : ' hidden'}></div></div></div>`;
    tutorCtx({ course: c.title, skill: plain(def.title), notes: plain(def.learn) });
    const noteEl = root.querySelector('#note'); let noteT = null;
    noteEl.addEventListener('input', () => { clearTimeout(noteT); noteT = setTimeout(() => { S.setNote(sid, noteEl.value); root.querySelector('#note-saved').textContent = noteEl.value.trim() ? 'Saved' : 'Note removed'; }, 400); });
    const board = root.querySelector('#note-board'), drawOpen = root.querySelector('#draw-open');
    if (!board.hidden) noteBoard(board, sid);
    if (drawOpen) drawOpen.addEventListener('click', () => { drawOpen.remove(); board.hidden = false; noteBoard(board, sid); board.querySelector('canvas').focus && board.scrollIntoView({ block: 'nearest' }); });
    workedExample(root.querySelector('#worked'), sid);
    bindExplain(root);
    // too easy: five questions with no hints, all right for Proficient (no address of its own; Back returns here)
    root.querySelector('#testout').addEventListener('click', () => {
      const go = () => exercise(root, E.start('testout', { skillId: sid }), { back: skillHref(sid), backLabel: plain(def.title), again: go, againLabel: 'Try the test-out again' });
      go(); window.scrollTo(0, 0);
    });
    const sum = root.querySelector('#print-summary');
    if (sum) sum.addEventListener('click', () => printSummary(root, sid));
    // study later, and a link to share
    const laterBtn = root.querySelector('#later');
    laterBtn.addEventListener('click', () => {
      const on = !laterIds().includes(sid); setLater(sid, on);
      laterBtn.classList.toggle('on', on); laterBtn.setAttribute('aria-pressed', String(on)); laterBtn.querySelector('span').textContent = on ? 'Saved to study later' : 'Study later';
      toast(on ? 'Saved to study later. Find it on Courses and in My notes.' : 'Removed from Study later');
    });
    root.querySelector('#share-skill').addEventListener('click', () => {
      const url = skillUrl(sid), title = plain(def.title);
      root.__shared = url;
      if (navigator.share && window.matchMedia && matchMedia('(pointer: coarse)').matches) { navigator.share({ title: `${title} · Procademy`, text: `A short lesson on ${title}, with practice questions`, url }).catch(() => {}); return; }
      copyText(url).then(ok => toast(ok ? 'Link copied. Paste it in a message to a friend.' : url));
    });
    // the lesson: its text, steps, examples with other numbers, and the words linked to the glossary
    const learn = root.querySelector('.learn'), body = root.querySelector('.learn-body'), sumBox = root.querySelector('#learn-sum');
    function setupLesson() {
      stopReading();
      const es = lessonLang(sid) === 'es';
      body.innerHTML = (es ? def.learnEs : def.learn) || '<p class="muted">There are no notes for this skill yet. Each practice question includes step-by-step hints.</p>';
      if (es) learn.setAttribute('lang', 'es'); else learn.removeAttribute('lang');
      root.querySelectorAll('.learn-nav').forEach(x => x.remove());
      if (window.VOCAB && !es) VOCAB.linkify(learn, { topic: plain(def.title) });
      exampleSwaps(body, sid);
      stepLesson(body, sid, sumBox, setupLesson);
    }
    // read aloud, a sentence at a time and highlighted; in steps, it carries on into the next step
    const readBtn = root.querySelector('#read-lesson');
    let reading = false;
    function stopReading() { if (!reading) return; reading = false; try { window.speechSynthesis.cancel(); } catch (e) { /* fine */ } if (window.COACH) COACH.stopAlong(); if (readBtn) { readBtn.setAttribute('aria-pressed', 'false'); readBtn.textContent = 'Read aloud'; } }
    function readNow() {
      const shown = body.querySelector('.learn-step:not([hidden])'), stepped = body.__steps && body.__steps.length > 1 && !body.__all;
      const on = COACH.readAlong([{ el: stepped && shown ? shown : body }], () => {
        if (!reading) return;
        if (stepped && body.__step < body.__steps.length - 1 && root.isConnected) { body.__go(body.__step + 1); setTimeout(() => { if (reading) readNow(); }, 350); } else stopReading();
      });
      if (!on) stopReading();
    }
    if (readBtn) readBtn.addEventListener('click', () => { if (reading) { stopReading(); return; } reading = true; readBtn.setAttribute('aria-pressed', 'true'); readBtn.textContent = 'Stop reading'; readNow(); });
    // text size, and the lesson's language
    root.querySelectorAll('[data-text-size]').forEach(b => b.addEventListener('click', () => {
      const now = Math.max(0, SIZES.indexOf(learn.dataset.size)), to = SIZES[Math.max(0, Math.min(SIZES.length - 1, now + Number(b.dataset.textSize)))];
      learn.dataset.size = to; setLessonPref({ size: to });
      root.querySelector('[data-text-size="-1"]').disabled = to === SIZES[0]; root.querySelector('[data-text-size="1"]').disabled = to === SIZES[SIZES.length - 1];
    }));
    root.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
      setLessonPref({ lang: b.dataset.lang });
      root.querySelectorAll('[data-lang]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      setupLesson();
    }));
    root.querySelector('#ask-lesson').addEventListener('click', () => {
      if (!window.TUTORUI) return;
      const step = body.__steps && !body.__all ? body.__steps[body.__step] : null;
      TUTORUI.open({});
      const draft = `About the lesson on “${plain(def.title)}”${step ? ` (the part that says “${step.sum.replace(/…$/, '')}”)` : ''}: `;
      let n = 0; const put = () => { const t = document.getElementById('tutor-text'); if (t && !t.disabled) { if (!t.value.trim()) t.value = draft; t.focus(); t.setSelectionRange(t.value.length, t.value.length); } else if (n++ < 40) setTimeout(put, 50); };
      setTimeout(put, 0);
    });
    setupLesson();
    checkBox(root.querySelector('#check'), sid);
    keepPlace(root, sid);
  }

  /* ---------- reading a lesson: in steps when it is long, and back where you left off ---------- */
  const READ = 'procademy.read.v1';
  const readAll = () => { try { const o = JSON.parse(localStorage.getItem(READ) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
  function readNote(sid, patch) {
    const o = readAll();
    o[sid] = Object.assign({}, o[sid], patch, { t: Date.now() });
    const keep = Object.entries(o).filter(([k]) => k !== '_all').sort((a, b) => b[1].t - a[1].t).slice(0, 40);
    try { localStorage.setItem(READ, JSON.stringify(Object.assign(Object.fromEntries(keep), o._all ? { _all: o._all } : {}))); } catch (e) { /* a private window: nothing is kept */ }
  }
  const setAllMode = on => { const o = readAll(); if (on) o._all = 1; else delete o._all; try { localStorage.setItem(READ, JSON.stringify(o)); } catch (e) { /* a private window */ } };
  /** a step's point in one line: its first sentence, kept short */
  function stepPoint(els) {
    const ex = els[0].classList && els[0].classList.contains('example');
    const d = document.createElement('div'); els.forEach(e => d.appendChild(e.cloneNode(true)));
    d.querySelectorAll('.ex-swap, button.btn').forEach(x => x.remove());
    d.querySelectorAll('sup').forEach(x => { x.textContent = [...x.textContent].map(ch => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(ch)] || ch).join(''); });
    d.querySelectorAll('.frac').forEach(x => { const n = x.querySelector('.num'), m = x.querySelector('.den'); if (n && m) x.textContent = ` ${n.textContent}/${m.textContent} `; });
    d.querySelectorAll('.ex-title').forEach(x => x.remove());
    let t = (d.textContent || '').replace(/\s+/g, ' ').trim();
    t = (t.split(/(?<=[.!?:])\s+(?=[A-Z])/)[0] || t).trim();
    if (t.length > 96) t = t.slice(0, 93).replace(/\s+\S*$/, '') + '…';
    return (ex ? 'Example: ' : '') + t;
  }
  /** a long lesson, a step at a time: blocks grouped so each step has some substance, with Back, Next and Show all.
      Above it, "In short": each step's point (selecting one goes there) and the lesson's key words. Shown all at once,
      each part folds away under its own heading. */
  function stepLesson(body, sid, sumBox, redo) {
    if (!body) return;
    const blocks = [...body.children], total = body.textContent.length;
    if (sumBox) { sumBox.hidden = true; sumBox.innerHTML = ''; }
    body.__steps = null; body.__all = false; body.onclick = null;
    if (sumBox) sumBox.onclick = null;
    if (blocks.length < 3 || total < 650) return;
    const steps = [];
    blocks.forEach(b => { const last = steps[steps.length - 1]; if (!last || last.len >= 220) steps.push({ els: [b], len: b.textContent.length }); else { last.els.push(b); last.len += b.textContent.length; } });
    if (steps.length < 2) return;
    steps.forEach(st => { st.sum = stepPoint(st.els); });
    steps.forEach((st, k) => { const w = document.createElement('div'); w.className = 'learn-step'; w.dataset.step = k; st.els[0].before(w); st.els.forEach(e => w.appendChild(e)); });
    body.__steps = steps;
    const all = !!readAll()._all, minutes = Math.max(1, Math.round(body.textContent.split(/\s+/).length / 160));
    const words = [...new Map([...body.querySelectorAll('.term[data-word]')].map(b => [b.dataset.word, b.textContent.trim()])).entries()].slice(0, 8);
    if (sumBox) {
      sumBox.hidden = false;
      sumBox.innerHTML = `<div class="ls-head"><b>In short</b><span class="small muted">${steps.length} parts · about ${plural(minutes, 'minute')} to read</span><button type="button" class="link-btn small" id="ls-mode">${all ? 'One part at a time' : 'Show it all'}</button></div>
        <ol class="ls-list">${steps.map((st, k) => `<li><button type="button" class="ls-go" data-step-to="${k}">${esc(st.sum)}</button></li>`).join('')}</ol>
        ${words.length ? `<div class="ls-words"><span class="small muted">Key words:</span>${words.map(([id, w]) => `<a class="chip-btn" href="#/words/${esc(id)}">${esc(w)}</a>`).join('')}</div>` : ''}`;
      sumBox.querySelector('#ls-mode').addEventListener('click', () => { setAllMode(!readAll()._all); redo ? redo() : null; });
    }
    let at = Math.min(steps.length - 1, Math.max(0, (readAll()[sid] || {}).step || 0));
    const mark = () => { if (sumBox) sumBox.querySelectorAll('.ls-go').forEach((b, k) => { if (!all && k === at) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); }); };
    if (all) {
      // every part shown, each under a heading that folds it away
      body.__all = true;
      body.querySelectorAll('.learn-step').forEach((w, k) => {
        const inner = document.createElement('div'); inner.className = 'lpart-body'; inner.id = `lpart-${k}`;
        [...w.childNodes].forEach(n => inner.appendChild(n));
        w.classList.add('lpart');
        w.innerHTML = `<button type="button" class="lpart-head" aria-expanded="true" aria-controls="lpart-${k}"><span class="lpart-n">Part ${k + 1}</span><span class="lpart-t">${esc(steps[k].sum)}</span></button>`;
        w.appendChild(inner);
      });
      body.onclick = ev => { const h = ev.target.closest('.lpart-head'); if (!h) return; const open = h.getAttribute('aria-expanded') !== 'true'; h.setAttribute('aria-expanded', String(open)); h.nextElementSibling.hidden = !open; };
      if (sumBox) sumBox.onclick = ev => { const b = ev.target.closest('[data-step-to]'); if (!b) return; const w = body.querySelectorAll('.learn-step')[Number(b.dataset.stepTo)], h = w.querySelector('.lpart-head'); h.setAttribute('aria-expanded', 'true'); h.nextElementSibling.hidden = false; w.scrollIntoView({ block: 'start', behavior: 'smooth' }); h.focus({ preventScroll: true }); };
      return;
    }
    const nav = document.createElement('div'); nav.className = 'learn-nav';
    body.after(nav);
    const show = () => {
      body.querySelectorAll('.learn-step').forEach((w, k) => { w.hidden = k !== at; });
      nav.innerHTML = `<span class="small muted">Step ${at + 1} of ${steps.length}</span><span class="learn-nav-btns">${at ? '<button class="btn sm ghost" type="button" data-step-go="-1">Back</button>' : ''}${at < steps.length - 1 ? '<button class="btn sm primary" type="button" data-step-go="1">Next</button>' : ''}<button class="btn sm ghost" type="button" data-step-all>Show it all</button></span>`;
      body.__step = at; mark();
    };
    const go = k => { at = Math.max(0, Math.min(steps.length - 1, k)); readNote(sid, { step: at }); show(); };
    body.__go = go;
    nav.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-step-all')) { setAllMode(true); if (redo) redo(); else { body.querySelectorAll('.learn-step').forEach(w => { w.hidden = false; }); nav.remove(); } return; }
      go(at + Number(b.dataset.stepGo));
      body.closest('.learn').scrollIntoView({ block: 'nearest' });
    });
    if (sumBox) sumBox.onclick = ev => { const b = ev.target.closest('[data-step-to]'); if (!b) return; go(Number(b.dataset.stepTo)); body.closest('.learn').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    show();
  }
  /** back where you left off: the place on the page is kept as you scroll, and brought back next time */
  function keepPlace(root, sid) {
    const was = readAll()[sid], here = location.hash;
    if (was && was.y > 300 && Date.now() - was.t < 14 * 864e5) setTimeout(() => { if (location.hash === here) window.scrollTo(0, Math.min(was.y, document.documentElement.scrollHeight)); }, 60);
    let t = 0;
    const onScroll = () => { if (location.hash !== here || !root.isConnected) { window.removeEventListener('scroll', onScroll); return; } clearTimeout(t); t = setTimeout(() => readNote(sid, { y: Math.round(window.scrollY) }), 300); };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  /** a one-page summary of a skill to print: the big idea, the lesson, a worked example with every step, and the learner's note */
  function printSummary(root, sid) {
    const def = A.skills[sid], w = A.whereIs(sid), q = A.question(sid, 'sum-' + Math.random().toString(36).slice(2, 8));
    const ans = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q), note = S.note(sid).trim(), pre = beforeThis(sid);
    document.querySelectorAll('#skill-print').forEach(x => x.remove());
    const sheet = document.createElement('article');
    sheet.id = 'skill-print'; sheet.className = 'ws-sheet skill-print';
    sheet.innerHTML = `<header class="ws-head"><div><div class="ws-brand">Procademy · ${esc(w.course.title)} · ${esc(w.unit.title)}</div><h1>${def.title}</h1></div></header>
      ${bigIdea(sid) ? `<p class="big-idea"><b>The big idea:</b> ${esc(bigIdea(sid))}</p>` : ''}
      <h2>The lesson</h2><div class="learn">${def.learn || ''}</div>
      <h2>A worked example</h2><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}
      <ol class="we-steps">${q.hints.map(h => `<li>${h}</li>`).join('')}</ol><p><b>Answer:</b> ${ans}</p>
      ${pre.length ? `<p class="small"><b>Good to know first:</b> ${pre.map(id => A.skills[id].title).join(', ')}</p>` : ''}
      <h2>My notes</h2>${note ? `<p class="note-text">${esc(note)}</p>` : '<div class="ws-lines"><span></span><span></span><span></span></div>'}`;
    document.getElementById('main').appendChild(sheet);
    document.body.classList.add('print-skill');
    const done = () => { document.body.classList.remove('print-skill'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    root.__summary = sheet;
    window.print();
    setTimeout(() => { if (!window.matchMedia || !matchMedia('print').matches) done(); }, 1000);
  }

  /** a worked example: a fresh question from the skill's own maker, its steps shown one at a time. Play works it
      out by itself, each step staying up about as long as it takes to read, with the newest step marked and a row of
      dots for how far along it is (no sliding in when motion is reduced) */
  function workedExample(box, sid) {
    if (!box) return;
    let q, shown, playing = 0;
    const calm = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.motion === 'reduce';
    const fresh = () => { stopPlay(); q = A.question(sid, 'we-' + Math.random().toString(36).slice(2, 9)); shown = 0; draw(); };
    function stopPlay() { if (playing > 0) clearTimeout(playing); playing = 0; }
    const readMs = k => Math.max(2200, Math.min(7000, 1400 + plain(q.hints[k] || '').length * 45));
    /** play it: each step appears on its own until the answer */
    function startPlay() {
      if (shown >= q.hints.length) shown = 0;
      const step = () => {
        if (!box.isConnected) { stopPlay(); return; }
        shown++;
        playing = shown < q.hints.length ? setTimeout(step, readMs(shown - 1)) : 0;
        draw(true);
      };
      step();
    }
    function draw(fresh) {
      const n = q.hints.length, done = shown >= n, moving = fresh && !calm();
      const answer = q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q);
      box.querySelector('#we-body').innerHTML = `<div class="we-q">${window.COACH ? `<div class="q-tools">${COACH.speakBtn(q.prompt + q.hints.slice(0, shown).map(h => '<p>' + h + '</p>').join(''), 'Read it aloud')}</div>` : ''}<div class="question">${q.prompt}</div>
        ${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map((c, k) => `<li class="${done && k === q.answerIndex ? 'is-right' : ''}">${c}</li>`).join('')}</ol>` : ''}</div>
        <div class="we-progress" aria-hidden="true">${q.hints.map((_, k) => `<i class="${k < shown ? 'on' : ''}${k === shown - 1 && !done ? ' now' : ''}"></i>`).join('')}<span class="small muted">${done ? 'Solved' : shown ? `Step ${shown} of ${n}` : `${plural(n, 'step')}`}</span></div>
        <ol class="we-steps">${q.hints.slice(0, shown).map((h, k) => `<li class="hint${k === shown - 1 && !done ? ' we-now' : ''}"><div class="hn">${k === n - 1 ? 'Last step' : 'Step ' + (k + 1)}</div>${h}</li>`).join('')}</ol>
        ${done ? `<div class="feedback good${moving ? ' we-in' : ''}"><span>Answer: <b>${answer}</b></span></div><div class="btn-row"><a class="btn primary" href="${practiceHref(sid)}">Practice this skill</a><button class="btn ghost" id="we-play" type="button">Play it again</button></div>`
          : `<div class="btn-row"><button class="btn primary" id="we-next" type="button">${shown === 0 ? 'Show the first step' : shown === n - 1 ? 'Show the last step' : 'Show the next step'} <span class="muted small">(${shown + 1} of ${n})</span></button>${shown < n - 1 ? '<button class="btn ghost" id="we-all" type="button">Show all steps</button>' : ''}<button class="btn ghost" id="we-play" type="button" aria-pressed="${!!playing}">${playing ? 'Pause' : shown ? 'Play the rest' : 'Play it'}</button></div>`}`;
      const nx = box.querySelector('#we-next'), all = box.querySelector('#we-all');
      if (nx) nx.addEventListener('click', () => { stopPlay(); shown++; draw(true); const st = box.querySelectorAll('.we-steps li'); if (st.length) st[st.length - 1].scrollIntoView({ block: 'nearest' }); });
      if (all) all.addEventListener('click', () => { stopPlay(); shown = n; draw(); });
      const play = box.querySelector('#we-play');
      if (play) play.addEventListener('click', () => { if (playing) { stopPlay(); draw(); } else startPlay(); });
      if (moving && shown) { const st = box.querySelectorAll('.we-steps li'); if (st.length) st[st.length - 1].classList.add('we-in'); }
      if (window.VOCAB) VOCAB.linkify(box.querySelector('.we-steps'));
      box.__worked = { q, shown, playing: !!playing };
    }
    box.querySelector('#we-new').addEventListener('click', fresh);
    fresh();
  }

  /* ---------- the exercise player ---------- */
  // the learner's own player choices, kept in the profile: sound (off unless turned on) and the on-screen keypad
  const playerPref = () => S.get().profile.player || {};
  const setPlayerPref = patch => S.setProfile({ player: Object.assign({}, playerPref(), patch) });
  let audio = null;
  /** a short rising chime for a right answer and a soft low note otherwise, with a buzz on phones; only with sound on */
  function chime(good) {
    if (!playerPref().sound || (S.quietNow && S.quietNow()) || document.hidden) return;          // off, quiet hours, or the page is out of sight
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audio.currentTime;
      (good ? [660, 880] : [220]).forEach((f, k) => {
        const o = audio.createOscillator(), g = audio.createGain(), at = t0 + k * 0.11;
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(audio.destination);
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.16, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
        o.start(at); o.stop(at + 0.3);
      });
    } catch (e) { /* no sound on this device */ }
    try { if (navigator.vibrate) navigator.vibrate(good ? 25 : [40, 60, 40]); } catch (e) { /* fine */ }
  }
  // sets paused to finish later, by the address they were started from (the newest 6, for 3 days; today's practice for the day)
  const pausedAll = () => S.get().profile.paused || {};
  function setPaused(key, packed) {
    const all = Object.assign({}, pausedAll());
    if (packed) all[key] = packed; else delete all[key];
    S.setProfile({ paused: Object.fromEntries(Object.keys(all).sort((a, b) => all[b].t - all[a].t).slice(0, 6).map(k => [k, all[k]])) });
  }
  const stillGood = p => p && Date.now() - p.t < 3 * 864e5 && (p.kind !== 'daily' || S.today(new Date(p.t)) === S.today());
  /** 83 seconds as 1:23 */
  const clockText = ms => { const t = Math.max(0, Math.round((ms || 0) / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  /** a short burst of falling pieces over a card: a skill mastered, a boss beaten, a new best (none with less motion) */
  function celebrate(card, size) {
    if (!card || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.motion === 'reduce') return;
    const box = document.createElement('div'), n = size === 'big' ? 44 : 22;
    box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < n; k++) {
      const i = document.createElement('i');
      i.style.cssText = `--x:${Math.round(Math.random() * 100)}%;--d:${(Math.random() * 0.5).toFixed(2)}s;--r:${Math.round(Math.random() * 360)}deg;--dx:${Math.round(Math.random() * 120 - 60)}px;--c:${k % 4}`;
      box.appendChild(i);
    }
    card.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }
  /** a question's picture, large, in a dialog over the page */
  function zoomFigure(fig) {
    const d = document.createElement('dialog');
    d.className = 'zoom-dlg';
    d.setAttribute('aria-label', fig.getAttribute('aria-label') || 'The picture, larger');
    d.innerHTML = '<div class="zoom-body"></div><div class="btn-row" style="justify-content:center"><button class="btn primary" type="button">Close</button></div>';
    const c = fig.cloneNode(true);
    c.removeAttribute('style'); c.removeAttribute('width'); c.removeAttribute('height');
    d.querySelector('.zoom-body').appendChild(c);
    document.body.appendChild(d);
    d.querySelector('button').addEventListener('click', () => d.close());
    d.addEventListener('click', ev => { if (ev.target === d) d.close(); });
    d.addEventListener('close', () => d.remove());
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  /** a scratch pad to draw or write working on, kept for the question it belongs to */
  function scratchPad() {
    const wrap = document.createElement('div');
    wrap.className = 'scratch';
    wrap.innerHTML = '<div class="scratch-bar"><span class="small muted">Draw or write your working here</span><button type="button" class="btn sm ghost" data-sc="clear">Clear</button></div><canvas aria-label="Scratch pad for working"></canvas>';
    const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d');
    let last = null;
    const size = () => { const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; if (r.width && !cv.width) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); } };
    const at = ev => { const r = cv.getBoundingClientRect(); return [(ev.clientX - r.left) * cv.width / r.width, (ev.clientY - r.top) * cv.height / r.height]; };
    cv.addEventListener('pointerdown', ev => { size(); cv.setPointerCapture(ev.pointerId); last = at(ev); ctx.beginPath(); ctx.arc(last[0], last[1], 1.4 * (window.devicePixelRatio || 1), 0, Math.PI * 2); ctx.fillStyle = getComputedStyle(wrap).color; ctx.fill(); });
    cv.addEventListener('pointermove', ev => {
      if (!last) return;
      const p = at(ev);
      ctx.strokeStyle = getComputedStyle(wrap).color; ctx.lineWidth = 2.6 * (window.devicePixelRatio || 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(e => cv.addEventListener(e, () => { last = null; }));
    wrap.querySelector('[data-sc="clear"]').addEventListener('click', () => ctx.clearRect(0, 0, cv.width, cv.height));
    wrap.__size = size;
    return wrap;
  }
  // the keypad: digits, a fraction key that works like a template (the top, then the bottom), and Undo; powers,
  // roots and parentheses join it when the question can use them (ENGINE.mathKeys)
  const FRAC_KEY = '<span class="kf" aria-hidden="true"><i></i><b></b><i></i></span>';
  const PADKEYS = [['7'], ['8'], ['9'], ['⌫', 'del', 'Delete'], ['4'], ['5'], ['6'], [FRAC_KEY, 'frac', 'Fraction: the top, then the bottom'], ['1'], ['2'], ['3'], ['−', '-', 'Minus'], ['0'], ['.', '.', 'Decimal point'], ['space', ' ', 'Space, for a mixed number'], ['%', '%', 'Percent']];
  const MATHKEYS = [['x<sup>y</sup>', '^', 'To the power of'], ['√', '√', 'Square root'], ['(', '(', 'Open parenthesis'], [')', ')', 'Close parenthesis']];
  const ENDKEYS = [['Undo', 'undo', 'Undo the last key'], ['Clear', 'clear', 'Clear the answer']];
  // choices kept on this device rather than with the learner: the keypad open or closed, and answering by hand
  // (dragging, clicking a point) or from a list
  const DEVICE_KEY = 'procademy.player.v1';
  let deviceMem = {};
  const devicePref = () => { try { const o = JSON.parse(localStorage.getItem(DEVICE_KEY) || 'null'); return o && typeof o === 'object' ? o : deviceMem; } catch (e) { return deviceMem; } };
  const setDevicePref = patch => { deviceMem = Object.assign({}, devicePref(), patch); try { localStorage.setItem(DEVICE_KEY, JSON.stringify(deviceMem)); } catch (e) { /* this visit only */ } };
  /** what is typed, drawn as math under the answer box: 3/4 stacked, 2^5 raised, √85 under a root; an empty
      place shows as a box to fill */
  function previewHtml(t) {
    const slot = '<i class="slot"></i>';
    let h = esc(String(t || '')).replace(/-/g, '−');
    h = h.replace(/(\d+(?:\.\d+)?)?\/(\d+(?:\.\d+)?)?/g, (m, a, b) => `<span class="frac"><span class="num">${a || slot}</span><span class="den">${b || slot}</span></span>`);     // first: the markup below has slashes of its own
    h = h.replace(/√\s*(\d+(?:\.\d+)?|\([^)]*\)?)?/g, (m, x) => `<span class="sqrt">√<span class="rad">${x ? x.replace(/^\(|\)$/g, '') : slot}</span></span>`);
    h = h.replace(/\^\s*(−?\d+(?:\.\d+)?|\([^)]*\)?)?/g, (m, x) => `<sup>${x || slot}</sup>`);
    return h;
  }
  /* handwriting: one character at a time, matched against a few drawn shapes of each digit (the $P point-cloud
     method: the order and direction of strokes don't matter). A dot, a dash and a slash are told apart first. */
  const INK = (() => {
    const N = 32;
    // each shape: strokes of [x, y] points in a 100 × 100 box (y down)
    const SHAPES = {
      '0': [[[50, 0], [22, 12], [12, 50], [22, 88], [50, 100], [78, 88], [88, 50], [78, 12], [50, 0]]],
      '1': [[[30, 22], [55, 0], [55, 100]]],
      '2': [[[18, 25], [35, 4], [60, 2], [80, 20], [75, 45], [15, 100], [88, 100]]],
      '3': [[[18, 12], [45, 0], [75, 10], [75, 35], [42, 48], [78, 60], [82, 85], [50, 100], [15, 90]]],
      '4': [[[62, 0], [10, 68], [88, 68]], [[66, 30], [66, 100]]],
      '5': [[[78, 0], [28, 0], [22, 45], [60, 38], [82, 62], [72, 92], [45, 100], [15, 90]]],
      '6': [[[72, 2], [40, 25], [22, 60], [28, 90], [50, 100], [75, 88], [78, 65], [55, 52], [30, 58], [22, 72]]],
      '7': [[[12, 0], [88, 0], [38, 100]]],
      '8': [[[72, 14], [50, 0], [28, 14], [32, 36], [68, 60], [74, 86], [50, 100], [26, 86], [32, 60], [68, 36], [72, 14]]],
      '9': [[[76, 22], [55, 2], [28, 8], [22, 30], [42, 48], [70, 40], [76, 22], [74, 60], [68, 100]]],
    };
    const MORE = [
      ['0', [[[50, 0], [78, 12], [88, 50], [78, 88], [50, 100], [22, 88], [12, 50], [22, 12], [50, 0]]]],
      ['1', [[[50, 0], [50, 100]], [[30, 100], [70, 100]]]],
      ['1', [[[30, 22], [55, 0], [55, 100]], [[30, 100], [80, 100]]]],
      ['2', [[[15, 30], [30, 5], [65, 0], [82, 25], [60, 55], [15, 100], [90, 98]]]],
      ['3', [[[15, 8], [70, 0], [42, 45], [80, 62], [78, 90], [45, 100], [15, 88]]]],
      ['4', [[[18, 0], [12, 58], [86, 58]], [[68, 0], [68, 100]]]],
      ['4', [[[70, 100], [70, 0], [10, 68], [90, 68]]]],
      ['5', [[[25, 0], [22, 45], [60, 38], [82, 62], [72, 92], [45, 100], [15, 90]], [[25, 0], [80, 0]]]],
      ['6', [[[70, 0], [30, 35], [20, 70], [35, 98], [65, 98], [78, 72], [60, 52], [35, 55], [20, 70]]]],
      ['7', [[[12, 0], [88, 0], [38, 100]], [[35, 52], [75, 52]]]],
      ['7', [[[12, 18], [12, 0], [88, 0], [45, 100]]]],
      ['8', [[[50, 48], [25, 30], [30, 6], [50, 0], [70, 6], [75, 30], [50, 48], [22, 70], [30, 95], [50, 100], [70, 95], [78, 70], [50, 48]]]],
      ['8', [[[50, 0], [30, 8], [32, 38], [50, 48], [68, 38], [70, 8], [50, 0]], [[50, 48], [25, 62], [25, 92], [50, 100], [75, 92], [75, 62], [50, 48]]]],
      ['9', [[[78, 10], [50, 0], [25, 12], [25, 38], [50, 46], [76, 35], [78, 10], [78, 100]]]],
      ['9', [[[78, 30], [70, 5], [40, 0], [22, 22], [35, 45], [65, 42], [78, 30]], [[78, 30], [72, 100]]]],
    ];
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function resample(pts, n) {
      const len = pts.reduce((t, p, i) => t + (i && p.id === pts[i - 1].id ? dist(pts[i - 1], p) : 0), 0), I = len / (n - 1) || 1;
      const out = [pts[0]]; let D = 0;
      const p = pts.slice();
      for (let i = 1; i < p.length; i++) {
        if (p[i].id !== p[i - 1].id) continue;
        const d = dist(p[i - 1], p[i]);
        if (D + d >= I && d > 0) {
          const q = { x: p[i - 1].x + (I - D) / d * (p[i].x - p[i - 1].x), y: p[i - 1].y + (I - D) / d * (p[i].y - p[i - 1].y), id: p[i].id };
          out.push(q); p.splice(i, 0, q); D = 0;
        } else D += d;
      }
      while (out.length < n) out.push(Object.assign({}, pts[pts.length - 1]));
      return out.slice(0, n);
    }
    function normalize(strokes) {
      let pts = []; strokes.forEach((st, id) => st.forEach(([x, y]) => pts.push({ x, y, id })));
      pts = resample(pts, N);
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y), size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) || 1;
      const cx = xs.reduce((a, b) => a + b, 0) / N, cy = ys.reduce((a, b) => a + b, 0) / N;
      return pts.map(p => ({ x: (p.x - cx) / size, y: (p.y - cy) / size }));
    }
    function cloud(a, b, start) {
      const used = new Array(N).fill(false); let sum = 0, i = start;
      do {
        let best = Infinity, k = -1;
        for (let j = 0; j < N; j++) if (!used[j]) { const d = dist(a[i], b[j]); if (d < best) { best = d; k = j; } }
        used[k] = true; sum += (1 - ((i - start + N) % N) / N) * best; i = (i + 1) % N;
      } while (i !== start);
      return sum;
    }
    const match = (a, b) => { let m = Infinity; for (let i = 0; i < N; i += 4) m = Math.min(m, cloud(a, b, i), cloud(b, a, i)); return m; };
    let lib = null;
    const library = () => lib || (lib = Object.entries(SHAPES).map(([ch, st]) => ({ ch, pts: normalize(st) })).concat(MORE.map(([ch, st]) => ({ ch, pts: normalize(st) }))));
    /** strokes: [[[x, y], …], …] in screen units; box: the writing area's size. The character, or '' */
    function read(strokes, box) {
      strokes = strokes.filter(st => st.length);
      if (!strokes.length) return '';
      const all = [].concat(...strokes), xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), B = box || Math.max(w, h, 1);
      if (Math.max(w, h) < B * 0.1) return '.';
      if (strokes.length === 1) {
        const st = strokes[0], a = st[0], b = st[st.length - 1], chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const path = st.reduce((t, p, i) => t + (i ? Math.hypot(p[0] - st[i - 1][0], p[1] - st[i - 1][1]) : 0), 0);
        if (chord > path * 0.9) {                         // a straight line
          if (h < w * 0.35) return '−';
          if (w < h * 0.3) return '1';
          if ((b[0] - a[0]) * (b[1] - a[1]) < 0 && w > h * 0.3) return '/';
        }
      }
      const pts = normalize(strokes);
      let best = null;
      library().forEach(t => { const d = match(pts, t.pts); if (!best || d < best.d) best = { ch: t.ch, d }; });
      return best ? best.ch : '';
    }
    return { read, SHAPES };
  })();
  /** a box to write one character at a time with a finger or a pen; each is read (INK) and typed into the answer */
  function inkPad(onChar) {
    const wrap = document.createElement('div');
    wrap.className = 'ink';
    wrap.innerHTML = '<div class="ink-bar"><span class="small muted">Write one digit at a time</span><span class="ink-last small" aria-live="polite"></span><button type="button" class="btn sm ghost" data-ink="undo">Undo</button></div><canvas aria-label="Write a digit here"></canvas>';
    const cv = wrap.querySelector('canvas'), ctx = cv.getContext('2d'), last = wrap.querySelector('.ink-last');
    let strokes = [], cur = null, timer = 0;
    const dpr = () => window.devicePixelRatio || 1;
    const size = () => { const r = cv.getBoundingClientRect(); if (r.width && cv.width !== Math.round(r.width * dpr())) { cv.width = Math.round(r.width * dpr()); cv.height = Math.round(r.height * dpr()); } };
    const at = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    const clear = () => { strokes = []; cur = null; ctx.clearRect(0, 0, cv.width, cv.height); };
    const read = () => {
      const r = cv.getBoundingClientRect(), ch = INK.read(strokes, Math.min(r.width, r.height));
      clear();
      if (ch) { onChar(ch); last.textContent = `Read as ${ch}`; } else last.textContent = 'Try that one again.';
    };
    cv.addEventListener('pointerdown', ev => {
      size(); clearTimeout(timer);
      try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
      cur = [at(ev)]; strokes.push(cur);
      ctx.fillStyle = getComputedStyle(wrap).color; ctx.beginPath(); ctx.arc(cur[0][0] * dpr(), cur[0][1] * dpr(), 2 * dpr(), 0, Math.PI * 2); ctx.fill();
    });
    cv.addEventListener('pointermove', ev => {
      if (!cur) return;
      const p = at(ev), q = cur[cur.length - 1];
      cur.push(p);
      ctx.strokeStyle = getComputedStyle(wrap).color; ctx.lineWidth = 4 * dpr(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(q[0] * dpr(), q[1] * dpr()); ctx.lineTo(p[0] * dpr(), p[1] * dpr()); ctx.stroke();
    });
    ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { if (!cur) return; cur = null; clearTimeout(timer); timer = setTimeout(read, 700); }));
    wrap.querySelector('[data-ink="undo"]').addEventListener('click', () => { clearTimeout(timer); clear(); onChar('undo'); last.textContent = ''; });
    wrap.__clear = () => { clearTimeout(timer); clear(); last.textContent = ''; };
    wrap.__read = read;
    return wrap;
  }
  const canInk = () => devicePref().ink === true || !!(window.matchMedia && matchMedia('(any-pointer: coarse)').matches);
  exercise.INK = INK;                // for the test suite
  const signed = v => String(v).replace('-', '−');
  /** put things in order: a list to drag, or to move with the arrow keys */
  function orderHtml(sp, val, done) {
    const n = val.length;
    return `<p class="hands-how small muted" id="hands-how">Drag them into order, first at the top. Or select one and move it with the arrow keys.</p>
      <ol class="order-list" aria-describedby="hands-how">${val.map((x, k) => `<li class="order-item${done ? (x === sp.answer[k] ? ' ok' : ' no') : ''}" ${done ? '' : 'tabindex="0"'} data-i="${k}" aria-label="${esc(plain(x))}, place ${k + 1} of ${n}"><span class="key" aria-hidden="true">${k + 1}</span><span class="oi-text">${x}</span>${done ? '' : '<span class="oi-grip" aria-hidden="true">⠿</span>'}</li>`).join('')}</ol>
      ${done && val.join('|') !== sp.answer.join('|') ? `<p class="small hands-right">The right order: <b>${sp.answer.join(', ')}</b></p>` : ''}`;
  }
  /** a coordinate grid to click a point on (or move a point with the arrow keys) */
  function gridHtml(sp, pt, done, extra) {
    const n = sp.max - sp.min, W = 320, pad = 26, u = (W - 2 * pad) / n;
    const X = x => pad + (x - sp.min) * u, Y = y => W - pad - (y - sp.min) * u, every = n > 12 ? 2 : 1;
    let g = '';
    for (let v = sp.min; v <= sp.max; v++) {
      const axis = v === 0;
      g += `<line class="gr-line${axis ? ' axis' : ''}" x1="${X(v)}" y1="${Y(sp.min)}" x2="${X(v)}" y2="${Y(sp.max)}"/><line class="gr-line${axis ? ' axis' : ''}" x1="${X(sp.min)}" y1="${Y(v)}" x2="${X(sp.max)}" y2="${Y(v)}"/>`;
      if (v % every === 0 && v !== 0) g += `<text class="gr-num" x="${X(v)}" y="${Y(Math.max(sp.min, 0)) + 14}" text-anchor="middle">${signed(v)}</text><text class="gr-num" x="${X(Math.max(sp.min, 0)) - 6}" y="${Y(v) + 4}" text-anchor="end">${signed(v)}</text>`;
    }
    g += `<text class="gr-num" x="${X(Math.max(sp.min, 0)) - 6}" y="${Y(Math.max(sp.min, 0)) + 14}" text-anchor="end">0</text><text class="gr-ax" x="${X(sp.max) + 6}" y="${Y(Math.max(sp.min, 0)) + 4}">x</text><text class="gr-ax" x="${X(Math.max(sp.min, 0))}" y="${pad - 10}" text-anchor="middle">y</text>`;
    const right = done && pt && pt[0] === sp.answer[0] && pt[1] === sp.answer[1];
    if (done && !right) g += `<circle class="gr-ring" cx="${X(sp.answer[0])}" cy="${Y(sp.answer[1])}" r="8"/>`;
    if (pt) g += `<circle class="gr-pt${done ? (right ? ' right' : ' wrong') : ''}" cx="${X(pt[0])}" cy="${Y(pt[1])}" r="7"/>`;
    return `<svg class="grid-pick" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}" ${done ? '' : 'tabindex="0"'} role="img" aria-describedby="hands-how" aria-label="A coordinate grid from ${signed(sp.min)} to ${sp.max}${pt ? `, with your point at ${sp.said(pt)}` : ''}" data-u="${u}" data-pad="${pad}">${g}<circle class="gr-hover" r="6" cx="-50" cy="-50"/></svg>
      <div class="hands-side">${done ? '' : '<p class="hands-how small muted" id="hands-how">Click or tap where the point goes. The arrow keys move it too.</p>'}
      <p class="hands-read" aria-live="polite">${pt ? `Your point: <b>${sp.said(pt)}</b>` : done ? '' : 'No point yet.'}${done && !right ? `${pt ? '. ' : ''}The answer is <b>${sp.said(sp.answer)}</b>.` : ''}</p>${extra || ''}</div>`;
  }
  /** a number line with a marker to drag to the answer (it fills in the answer box) */
  function lineHtml(sp, v, done, ok, narrow) {
    // drawn at about the size it shows, so the numbers stay readable on a phone
    const n = (sp.max - sp.min) / sp.step, W = narrow ? 340 : 640, pad = 18, u = (W - 2 * pad) / n, X = x => pad + (x - sp.min) / sp.step * u;
    const label = narrow && n / sp.label > 6 ? sp.label * 2 : sp.label;
    let g = `<line class="nl-axis" x1="${pad - 10}" y1="44" x2="${W - pad + 10}" y2="44"/>`;
    for (let k = 0; k <= n; k++) {
      const x = +(sp.min + k * sp.step).toFixed(6), big = Math.abs(x / label - Math.round(x / label)) < 1e-9;
      g += `<line class="nl-tick${big ? ' big' : ''}" x1="${X(x)}" y1="${big ? 34 : 38}" x2="${X(x)}" y2="${big ? 54 : 50}"/>`;
      if (big) g += `<text class="nl-num" x="${X(x)}" y="74" text-anchor="middle">${signed(x)}</text>`;
    }
    if (sp.start != null && sp.start !== sp.min) g += `<circle class="nl-start" cx="${X(sp.start)}" cy="44" r="6"/><text class="nl-tag" x="${X(sp.start)}" y="94" text-anchor="middle">start</text>`;
    g += `<path class="nl-jump" d="${v != null && sp.start != null && v !== sp.start ? `M${X(sp.start)} 30 Q${(X(sp.start) + X(v)) / 2} 8 ${X(v)} 30` : ''}"/>`;
    if (v != null) g += `<g class="nl-mark${done ? (ok ? ' ok' : ' no') : ''}" transform="translate(${X(v)} 44)"><circle r="9"/><text y="-16" text-anchor="middle">${signed(v)}</text></g>`;
    return `<div class="nline-wrap"><svg class="nline" viewBox="0 0 ${W} 100" width="${W}" height="100" role="slider" ${done ? 'aria-disabled="true"' : 'tabindex="0"'} aria-label="Number line: drag the marker to your answer" aria-valuemin="${sp.min}" aria-valuemax="${sp.max}" aria-valuenow="${v == null ? sp.min : v}" aria-valuetext="${v == null ? 'no answer yet' : signed(v)}" data-u="${u}" data-pad="${pad}" data-w="${W}">${g}</svg></div>`;
  }
  // unlimited practice: what was answered since the last save is saved when the page changes (before the next
  // page draws, so Progress is up to date), when the tab is hidden (phones may close it without warning) and
  // when the page goes away. Saving twice saves nothing more.
  let endlessNow = null;
  const saveEndlessNow = () => { if (endlessNow && !endlessNow.stopped) E.saveEndless(endlessNow); };
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => { saveEndlessNow(); endlessNow = null; document.documentElement.classList.remove('pc-focus'); }, true);
    window.addEventListener('pagehide', saveEndlessNow);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveEndlessNow();
      // sounds pause while the page is out of sight, and carry on when it comes back
      try { if (audio) { if (document.hidden && audio.state === 'running') audio.suspend(); else if (!document.hidden && audio.state === 'suspended') audio.resume(); } } catch (e) { /* fine */ }
    });
  }
  function exercise(root, s, opts) {
    opts = opts || {};
    root.__session = s;                      // for the test suite
    const endless = s.kind === 'endless';
    let hintsShown = 0, selected = null, phase = 'fresh', lastFeedback = '', nudged = false;
    const t0 = Date.now();
    const limitMs = (opts.minutes || s.minutes || 0) * 60000;             // a countdown: a timed quiz or a warm-up
    const misses = () => s.results.filter(r => r && r.done && !E.counts(r)).length;
    const outOfLives = () => !!s.lives && misses() >= s.lives;
    let workLines = null, workOpen = false;          // the learner's own steps for this question (STEPS)
    let lastSpoken = null;                           // read each question aloud once, when the learner asks for that
    let scratch = null, scratchOpen = false;         // the scratch pad for this question, and whether it is shown
    let asking = false;                              // "I don't know" waiting to be sure, before anything was tried
    let flagOpen = false, optsOpen = false;          // the Flag form and the Options menu
    let handsVal = null, handsTouched = false, lastPick = null;    // an answer by hand (an order, a point, a place on a line), and which way was used last
    let undo = [];                                   // the answer box as it was before each key, for Undo
    let autoNext = 0;                                // going on by itself after a right answer (an option)
    let ink = null;                                  // the handwriting box (it stays open from question to question)
    const flaggedHere = [];                          // questions flagged during this set
    const fine = !!(window.matchMedia && matchMedia('(pointer: fine)').matches);
    const pauseKey = location.hash, canPause = !['endless', 'placement', 'testout'].includes(s.kind) && !opts.result;
    const held = canPause && !opts.resumed && pausedAll()[pauseKey];
    if (held && held.kind === s.kind && stillGood(held)) {
      root.innerHTML = `<div class="ex"><div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(held.title || s.title)}</h1></div>
        <div class="card resume-card"><h2>Pick up where you left off?</h2><p class="muted">You paused this set at question ${Math.min(held.i + 1, held.items.length)} of ${held.items.length}.</p>
        <div class="btn-row"><button class="btn primary" type="button" id="resume">Continue the set</button><button class="btn" type="button" id="restart">Start over</button></div></div></div>`;
      const more = Object.assign({}, opts, { resumed: true });
      root.querySelector('#resume').addEventListener('click', () => { setPaused(pauseKey, null); exercise(root, E.unpack(held), more); });
      root.querySelector('#restart').addEventListener('click', () => { setPaused(pauseKey, null); exercise(root, s, more); });
      setTimeout(() => { const b = root.querySelector('#resume'); if (b) b.focus(); }, 0);
      return;
    }
    if (held && !stillGood(held)) setPaused(pauseKey, null);

    function dots() {
      if (endless) {      // unlimited practice: a running score instead of a dot per question
        const t = E.tally(s);
        const lv = E.levelOf(s);
        return `<div class="ul-tally"><span>Answered <b>${t.n}</b></span><span>Correct on the first try <b>${t.right}</b></span><span>Streak <b>${t.streak}</b>${t.best > t.streak ? ` (best ${t.best})` : ''}</span><span class="adapt lv-${lv}" title="Questions get harder after two right in a row, and easier after a miss"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i>${['Easier questions', 'Steady', 'Harder questions'][lv]}</span><button class="btn sm" id="stop" type="button">End session</button></div>`;
      }
      return `<div class="dots" role="img" aria-label="Question ${s.i + 1} of ${s.items.length}">${s.items.map((it, k) => {
        const r = s.results[k];
        let cls = k === s.i ? 'current' : '';
        if (r && r.done) cls = E.counts(r) ? 'right' : (r.correct ? 'hinted' : 'wrong');
        return `<span class="${cls}"></span>`;
      }).join('')}</div>`;
    }
    /** the hands-on way to answer this question (put in order, click a point, a number line), if it has one */
    const handsOf = q => (E.hands ? E.hands(q) : null);
    const handsOn = kind => (kind === 'line' ? devicePref().line !== false : devicePref().hands !== false);
    /** a number line's marker: what the answer box says, when that is a place on the line; else where it was left */
    function lineValue(sp) {
      const el = root.querySelector('#ans'), t = el ? el.value : (draft != null ? draft : lastInput), v = A.parseNumber(t);
      if (isFinite(v) && v >= sp.min && v <= sp.max && Math.abs((v - sp.min) / sp.step - Math.round((v - sp.min) / sp.step)) < 1e-9) return v;
      return handsVal != null ? handsVal : sp.start;
    }
    function answerArea(q) {
      const sp = handsOf(q), done = phase === 'done', r = s.results[s.i];
      if (q.type === 'choice') {
        const useHands = !!sp && handsOn(sp.kind) && !(done && lastPick === 'list');
        if (sp && sp.kind === 'order' && handsVal == null) handsVal = sp.items.slice();
        const list = `<ul class="choices" id="choices"${useHands ? ' hidden' : ''}>${q.choices.map((ch, k) => `<li><button type="button" data-k="${k}" aria-pressed="${selected === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${ch}</span></button></li>`).join('')}</ul>`;
        // shown without an answer by hand (given up, or the last hint): the right order, or the right point
        const answered = !done || lastPick === 'hands';
        const sw = sp && !done ? `<button type="button" class="link-btn hands-switch" id="hands-switch">${useHands ? 'Choose from a list instead' : sp.kind === 'order' ? 'Drag them into order instead' : 'Click the point on a grid instead'}</button>` : '';
        const inGrid = useHands && sp.kind === 'grid';
        const widget = useHands ? `<div class="hands hands-${sp.kind}" id="hands">${sp.kind === 'order' ? orderHtml(sp, answered ? handsVal : sp.answer, done) : gridHtml(sp, answered ? handsVal : null, done, sw)}</div>` : '';
        return widget + (widget ? '<p class="visually-hidden" id="hands-live" aria-live="polite"></p>' : '') + list + (inGrid ? '' : sw);
      }
      const isNum = q.type === 'number';
      const pre = q.unit === '$', unit = q.unit && !pre ? `<span class="unit">${q.unit}</span>` : '';
      const pad = isNum && padOn(), mk = isNum && E.mathKeys && E.mathKeys(q);
      if (isNum && !done && !ink && devicePref().ink === true) ink = inkPad(typeKey);        // writing by hand, as this device was left
      const keys = PADKEYS.concat(mk ? MATHKEYS : [], ENDKEYS);
      const line = sp && sp.kind === 'line' ? sp : null;
      return `<div class="row ans-row">${pre ? '<span class="unit" style="margin:0">$</span>' : ''}<input id="ans" class="ans-input" type="text" inputmode="${pad || (ink && isNum) ? 'none' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Your answer" placeholder="${isNum ? 'Your answer' : 'Type your answer'}">${unit}${isNum && !done ? `<button type="button" class="btn sm ghost pad-toggle" id="pad-toggle" aria-controls="ans-pad" aria-expanded="${pad}">${pad ? 'Hide keypad' : 'Keypad'}</button>` : ''}${isNum && !done && canInk() ? `<button type="button" class="btn sm ghost" id="ink-toggle" aria-expanded="${!!ink}" title="Write each digit with a finger or a pen">${ink ? 'Stop writing' : 'Write it'}</button>` : ''}</div>
        <div class="ans-preview" id="ans-preview" aria-hidden="true" hidden></div>
        ${isNum && !done && ink ? '<div id="ink-slot"></div>' : ''}
        ${isNum && !done ? `<div class="ans-pad${mk ? ' has-math' : ''}" id="ans-pad" role="group" aria-label="Number keypad" ${pad ? '' : 'hidden'}>${keys.map(([lab, ins, aria]) => `<button type="button" class="ans-key${ins === 'del' ? ' del' : ''}${ins === 'undo' || ins === 'clear' ? ' wide' : ''}" data-key="${esc(ins || lab)}"${aria ? ` aria-label="${aria}"` : ''}${ins === 'undo' && !undo.length ? ' disabled' : ''}>${lab}</button>`).join('')}</div>` : ''}
        ${line && handsOn('line') ? `<div class="hands hands-line" id="hands">${lineHtml(line, lineValue(line), done, !!(r && r.correct), (root.clientWidth || innerWidth) < 600)}</div>` : ''}
        ${line && !done ? `<button type="button" class="link-btn hands-switch" id="hands-switch">${handsOn('line') ? 'Hide the number line' : 'Use a number line'}</button>` : ''}
        <div class="help">${isNum ? `Fractions like <b>3/4</b>, mixed numbers like <b>1 1/2</b>, decimals and percents are all fine.${mk ? ' A power or a root works too, like <b>√85</b> or <b>2^5</b>.' : ''}` : (q.help || 'Accents and capital letters don’t matter.')}</div>`;
    }
    /** the on-screen keypad: this device's choice, else open on touch screens */
    function padOn() { const d = devicePref().pad; if (d != null) return !!d; const p = playerPref().pad; return p == null ? !fine : !!p; }
    /** the free first rung of the hint ladder: the skill's big idea, a reminder that gives nothing away */
    function nudgeOf(it) { const b = bigIdea(it.skillId); return b ? `Remember: ${b}` : 'Read the question again and underline what it asks for. Which numbers do you need?'; }
    // each hint can be read aloud
    const hintSay = html => (window.COACH && COACH.canSpeak() ? COACH.speakBtn(html, 'Read this hint aloud') : '');
    function hintsArea(q) {
      const shown = q.hints.slice(0, hintsShown);
      const revealed = s.results[s.i] && s.results[s.i].revealed;
      return `<div class="hints" id="hints">${nudged ? `<div class="hint nudge"><div class="hn"><span>Nudge</span>${hintSay(esc(nudgeOf(E.current(s))))}</div>${esc(nudgeOf(E.current(s)))}</div>` : ''}${shown.map((hh, k) => `<div class="hint"><div class="hn"><span>${k === q.hints.length - 1 ? 'Last step' : 'Hint ' + (k + 1)}</span>${hintSay(hh)}</div>${hh}</div>`).join('')}
        ${revealed && !s.results[s.i].correct ? `<div class="hint"><div class="hn">Answer</div><b>${A.answerText(q)}</b></div>` : ''}</div>`;
    }
    const selfTimer = () => !!playerPref().timer && !limitMs && !s.stopwatch;
    const LENS = [5, 7, 10];
    /** the player's options, folded into one menu: sound, a timer, going on by itself, focus mode */
    function optionsMenu() {
      const p = playerPref(), row = (id, label, help, on) => `<label class="opt-row" for="${id}"><span class="opt-text"><b>${label}</b><span>${help}</span></span><input type="checkbox" class="switch" id="${id}"${on ? ' checked' : ''}></label>`;
      return `<div class="ex-opts"><button type="button" class="btn ghost sm" id="opts-btn" aria-expanded="${optsOpen}" aria-controls="opts-panel" aria-label="Options" title="Sound, a timer and more">${icon('settings', 16)}<span class="opts-word">Options</span></button>
        <div class="opts-panel" id="opts-panel" role="group" aria-label="Practice options"${optsOpen ? '' : ' hidden'}>
          ${row('sound', 'Sound', 'A sound, and a buzz on phones, for each answer', !!p.sound)}
          ${limitMs || s.stopwatch ? '' : row('opt-timer', 'Timer', 'Show how long this set is taking', !!p.timer)}
          ${row('opt-auto', 'Go on by itself', 'After a right answer, the next question comes up', !!p.auto)}
          ${row('opt-focus', 'Focus mode', 'Hide the menus while you practice', !!p.focus)}
        </div></div>`;
    }
    const flagged = it => (S.get().profile.flagged || []).find(f => f.skill === it.skillId && f.seed === it.seed);
    const FLAG_WHY = [['confusing', 'It’s confusing'], ['answer', 'The answer looks wrong'], ['broken', 'Something doesn’t show right']];
    function flagBox(it) {
      const f = flagged(it);
      return `<div class="flag-box" id="flag-box" role="group" aria-labelledby="flag-h"><p class="flag-h" id="flag-h"><b>What’s wrong with this question?</b></p>
        <div class="seg" id="flag-why" role="radiogroup" aria-labelledby="flag-h">${FLAG_WHY.map(([v, l], k) => `<button type="button" role="radio" data-v="${v}" aria-checked="${f ? f.why === v : k === 0}">${l}</button>`).join('')}</div>
        <input type="text" id="flag-note" maxlength="300" placeholder="Add a note (optional)" aria-label="A note about the problem (optional)" value="${f && f.note ? esc(f.note) : ''}">
        <div class="btn-row"><button type="button" class="btn sm primary" id="flag-save">${f ? 'Save' : 'Flag it'}</button><button type="button" class="btn sm ghost" id="flag-cancel">Cancel</button>${f ? '<button type="button" class="btn sm ghost" id="flag-remove">Remove the flag</button>' : ''}</div></div>`;
    }
    function render() {
      if (autoStop) autoStop(); else clearTimeout(autoNext);
      if (E.isDone(s)) return summary();
      if (phase === 'done' && !endless) E.followUps(s);           // a unit test's second chances join at the end
      const it = E.current(s), q = it.q, r = s.results[s.i];
      const canHint = s.hints && hintsShown < q.hints.length && phase !== 'done';
      const def = A.skills[it.skillId];
      const canSkip = phase !== 'done' && !it.skipped && !endless && s.kind !== 'placement' && s.i < s.items.length - 1 && !(r && r.done);
      const left = s.items.length - s.i - 1;
      const t = E.tally(s), sp = handsOf(q), handsShown = sp && sp.kind !== 'line' && handsOn(sp.kind) && !(phase === 'done' && lastPick === 'list');
      // a practice set can be 5, 7 or 10 questions: chosen before the first answer
      const lenPick = s.kind === 'practice' && !opts.result && s.results.every(x => !x) && s.i === 0 ? `<div class="len-pick"><span class="small muted" id="len-l">Questions</span><div class="seg" role="radiogroup" aria-labelledby="len-l">${LENS.map(n => `<button type="button" role="radio" data-len="${n}" aria-checked="${n === s.items.length}">${n}</button>`).join('')}</div></div>` : '';
      const fl = flagged(it);
      const acts = `${limitMs || s.stopwatch ? `<span class="stat-pill ex-clock" id="ex-clock" role="timer" aria-label="${s.stopwatch ? 'Time so far' : 'Time left'}">${clockText(s.stopwatch ? Date.now() - t0 : limitMs - (Date.now() - t0))}</span>` : ''}${selfTimer() ? `<span class="stat-pill ex-clock ex-timer" id="ex-timer" role="timer" aria-label="Time so far">${clockText(Date.now() - t0)}</span>` : ''}${s.lives ? `<span class="lives" role="img" aria-label="${s.lives - Math.min(s.lives, misses())} of ${s.lives} lives left">${Array.from({ length: s.lives }, (_, k) => `<i class="${k < s.lives - misses() ? 'on' : ''}"></i>`).join('')}</span>` : ''}${canPause && !limitMs && !s.stopwatch && !s.lives ? '<button class="btn sm ghost" type="button" id="pause" title="Save this set and finish it later">Pause</button>' : ''}`;
      root.innerHTML = `<div class="ex">
        <div class="ex-head"><a class="btn sm ghost back" href="${opts.back || '#/'}">← <span class="back-long">${esc(opts.backLabel || 'Back')}</span><span class="back-short">Back</span></a><h1>${esc(s.title)}</h1>${dots()}${endless ? '' : `<span class="tiny muted ex-left">${left ? `${left} left` : 'The last one'}${t.streak >= 3 ? ` <span class="ex-streak" title="Right on the first try, in a row">${t.streak} in a row</span>` : ''}</span>`}${acts ? `<span class="ex-acts">${acts}</span>` : ''}</div>
        <div class="card">
          ${opts.banner ? `<div class="ex-banner">${opts.banner}</div>` : ''}
          <div class="q-tools">${lenPick}${it.why ? `<span class="chip why-${it.why}">${{ review: 'Review', mistake: 'Correcting a mistake', new: 'New skill', again: 'Second chance', similar: 'A similar one' }[it.why]}</span>` : ''}${window.COACH && COACH.canSpeak() ? `<button type="button" class="btn ghost sm say-q" id="read-q" aria-pressed="false" title="Each sentence is highlighted as it is read">Read aloud</button>` : ''}<button type="button" class="btn ghost sm" id="scratch-btn" aria-pressed="${scratchOpen}">Scratch pad</button><button type="button" class="btn ghost sm flag-btn" id="flag-btn" aria-expanded="${flagOpen}" aria-pressed="${!!fl}" title="Tell us about a confusing or broken question" aria-label="${fl ? 'Flagged' : 'Flag this question'}">${icon('flag', 16)}<span class="flag-word">${fl ? 'Flagged' : 'Flag'}</span></button>${optionsMenu()}</div>
          ${flagOpen ? flagBox(it) : ''}
          <div class="question">${s.kind !== 'practice' && s.kind !== 'testout' && !(endless && s.skills.length === 1) ? `<div class="lead">${def.title}</div>` : ''}${q.prompt}</div>
          <div id="scratch-slot"></div>
          <div class="answer">${answerArea(q)}</div>
          ${workEq(it) ? `<details class="steps-work" id="work" ${workOpen ? 'open' : ''}><summary>Show your work: each step is checked</summary><div class="steps-box" id="work-box"></div><p class="tiny muted" style="margin:6px 0 0">Each line is checked as you type, by calculation. Checking a finished line (like <b>x = 4</b>) counts as a hint.</p></details>` : ''}
          <div id="feedback" aria-live="polite">${lastFeedback}</div>
          ${hintsArea(q)}
          ${asking ? `<div class="giveup-ask" role="group" aria-labelledby="giveup-h"><p id="giveup-h"><b>See the answer now?</b> <span class="muted">${s.hints ? 'A hint shows just the next step. ' : ''}A question you don’t know comes back in Review.</span></p><div class="btn-row"><button type="button" class="btn sm primary" id="giveup-yes">Show the answer</button><button type="button" class="btn sm" id="giveup-no">Keep trying</button></div></div>` : ''}
          <div class="ex-foot">
            ${s.hints ? `<button class="btn" id="hint" ${canHint ? '' : 'disabled'} title="${!nudged ? 'A gentle reminder first. It doesn’t count as a hint.' : 'Each hint shows one more step'}">${canHint && !nudged ? 'Nudge' : 'Hint'}${canHint && nudged ? ` <span class="muted small">(${q.hints.length - hintsShown} remaining)</span>` : ''}</button>` : ''}
            ${phase !== 'done' && !asking ? `<button class="btn ghost" id="giveup">I don’t know</button>` : ''}
            ${s.hints || phase === 'done' ? `<button class="btn ghost" id="ask-tutor">${phase === 'done' ? 'Ask the tutor' : 'Help with this one'}</button>` : ''}
            ${canSkip ? '<button class="btn ghost" id="skip" type="button" title="This question moves to the end of the set">Skip for now</button>' : ''}
            ${phase === 'done' && !E.counts(r) && E.canSimilar(s) && !s.outOfLives && !timeUp() ? '<button class="btn" id="similar" type="button" title="Another question like this one, right after it">Try a similar one</button>' : ''}
            <span class="spacer"></span>
            <span class="ex-go"><span class="muted small ex-count">${endless ? `Question ${s.i + 1}` : `${s.i + 1} of ${s.items.length}`}</span>
            ${phase === 'done' ? `<button class="btn primary" id="next">${s.outOfLives || timeUp() ? 'See how you did' : !endless && s.i + 1 === s.items.length ? 'Finish' : 'Next question'}</button>` : `<button class="btn primary" id="check" disabled>Check</button>`}</span>
          </div>
          ${fine && phase !== 'done' ? `<p class="ex-keys tiny muted">Keys: <kbd>Enter</kbd> checks${q.type === 'choice' ? `${handsShown ? '' : ` · <kbd>1</kbd> to <kbd>${q.choices.length}</kbd> or the arrow keys choose`}${s.hints && canHint ? ' · <kbd>H</kbd> takes a hint' : ''}${canSkip ? ' · <kbd>S</kbd> skips for now' : ''}` : ''}</p>` : ''}
        </div></div>`;
      bind(q);
      // the scratch pad belongs to this question: the same drawing comes back after each check
      if (scratchOpen) { scratch = scratch || scratchPad(); const slot = root.querySelector('#scratch-slot'); if (slot) { slot.replaceWith(scratch); requestAnimationFrame(() => scratch.__size()); } }
      // a question's pictures: larger on wide screens, and Zoom in opens them bigger still
      root.querySelectorAll('.question svg.figure').forEach(f => {
        if (/inline/.test(f.getAttribute('style') || '')) return;
        const w = Number(f.getAttribute('width')) || 0;
        if (w) { f.style.width = `min(100%, ${Math.round(w * 1.4)}px)`; f.style.height = 'auto'; }
        f.classList.add('zoomable');
        f.addEventListener('click', () => zoomFigure(f));
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn sm ghost fig-zoom'; b.textContent = 'Zoom in';
        b.addEventListener('click', () => zoomFigure(f));
        f.after(b);
      });
      // read aloud, a sentence at a time with each one highlighted (the question, then each choice)
      const readItems = () => [{ el: root.querySelector('.question') }].concat([...root.querySelectorAll('#choices:not([hidden]) button')].map((b, k) => ({ el: b.querySelector('span:last-child'), before: 'Choice ' + (k + 1) })));
      const readQ = root.querySelector('#read-q');
      if (readQ) readQ.addEventListener('click', () => { const on = COACH.readAlong(readItems(), () => readQ.setAttribute('aria-pressed', 'false')); readQ.setAttribute('aria-pressed', String(on)); });
      if (S.get().profile.autoRead && window.COACH && phase === 'fresh' && lastSpoken !== it) {
        lastSpoken = it;
        if (COACH.readAlong && COACH.canSpeak()) { if (readQ) readQ.setAttribute('aria-pressed', 'true'); COACH.readAlong(readItems(), () => readQ && readQ.setAttribute('aria-pressed', 'false')); }
        else COACH.say(q.prompt + (q.type === 'choice' && root.querySelector('#choices:not([hidden])') ? '<p>The choices are:</p>' + q.choices.map((c, k) => `<p>${k + 1}: ${c}</p>`).join('') : ''));
      }
      const wb = root.querySelector('#work-box');
      if (wb) {
        STEPS.box(wb, { first: workEq(it), lines: workLines, onCheck(res, lines) { workLines = lines; const r0 = s.results[s.i]; if (res.some(x => x.status === 'solved') && !(r0 && r0.hinted)) E.useHint(s); } });
        root.querySelector('#work').addEventListener('toggle', ev => { workOpen = ev.target.open; });
      }
      const done = phase === 'done';
      tutorCtx({
        course: (A.whereIs(it.skillId) || { course: { title: '' } }).course.title, skill: plain(def.title),
        question: plain(q.prompt), choices: q.type === 'choice' ? q.choices.map(plain) : null,
        steps: (done ? q.hints : q.hints.slice(0, Math.min(1, q.hints.length - 1))).map(plain), answer: plain(A.answerText(q)), answerShown: done,
        studentAnswer: lastInput && !(r && r.correct) ? lastInput : (q.type === 'choice' && lastSaid && !(r && r.correct) && r && r.tries ? lastSaid : ''),
      });
      bindExplain(root.querySelector('#feedback') || root);
      const ask = root.querySelector('#ask-tutor');
      if (ask) ask.addEventListener('click', () => window.TUTORUI && window.TUTORUI.open({ ask: done ? 'Explain how to get this answer, step by step.' : 'Give me a hint for this question, without telling me the answer.' }));
      wireHands(q);
      updatePreview();
      if (ink) { const slot = root.querySelector('#ink-slot'); if (slot) slot.replaceWith(ink); }
      setFocus(!!playerPref().focus);
      // going on by itself after a right answer (an option); a tap or a key first keeps the answer on screen
      if (done && r && r.correct && playerPref().auto && !s.outOfLives) startAuto();
    }
    /** focus mode: the menus hide while a question is on screen (and come back on any other page) */
    function setFocus(on) { document.documentElement.classList.toggle('pc-focus', !!on && root.isConnected && root.__session === s && !E.isDone(s)); }
    let autoStop = null;
    function startAuto() {
      if (autoStop) autoStop();
      const nx = root.querySelector('#next');
      if (!nx) return;
      nx.classList.add('auto-go');
      const at = s.i;
      const stop = () => { clearTimeout(autoNext); nx.classList.remove('auto-go'); root.removeEventListener('pointerdown', onAny, true); root.removeEventListener('keydown', onAny, true); autoStop = null; };
      const onAny = ev => { if (!(ev.target && ev.target.closest && ev.target.closest('#next'))) stop(); };
      root.addEventListener('pointerdown', onAny, true); root.addEventListener('keydown', onAny, true);
      autoStop = stop;
      autoNext = setTimeout(() => { stop(); if (root.isConnected && root.__session === s && s.i === at && phase === 'done' && !document.hidden) doNext(); }, 1800);
    }
    /* ---------- answering by hand ---------- */
    function wireHands(q) {
      const box = root.querySelector('#hands'), sp = handsOf(q);
      if (!box || !sp || phase === 'done') return;
      const changed = () => { handsTouched = true; lastPick = 'hands'; const c = root.querySelector('#check'); if (c) c.disabled = !hasInput(q); };
      if (sp.kind === 'order') wireOrder(box, sp, changed);
      else if (sp.kind === 'grid') wireGrid(box, sp, changed);
      else wireLine(box, sp);
    }
    function wireOrder(box, sp, changed) {
      const list = box.querySelector('.order-list');
      const redraw = focusAt => { box.innerHTML = orderHtml(sp, handsVal, false); wireOrder(box, sp, changed); changed(); if (focusAt != null) { const li = box.querySelectorAll('.order-item')[focusAt]; if (li) li.focus({ preventScroll: true }); } };
      const move = (from, to) => { if (to < 0 || to >= handsVal.length || to === from) return false; const v = handsVal.slice(), x = v.splice(from, 1)[0]; v.splice(to, 0, x); handsVal = v; return true; };
      list.querySelectorAll('.order-item').forEach(li => {
        li.addEventListener('keydown', ev => {
          const i = Number(li.dataset.i), d = /^Arrow(Up|Left)$/.test(ev.key) ? -1 : /^Arrow(Down|Right)$/.test(ev.key) ? 1 : 0;
          if (!d) return;
          ev.preventDefault(); ev.stopPropagation();
          if (move(i, i + d)) { redraw(i + d); live(`${plain(handsVal[i + d])}, place ${i + d + 1} of ${handsVal.length}`); }
        });
        li.addEventListener('pointerdown', ev => {
          if (ev.button > 0) return;
          const items = [...list.children], from = items.indexOf(li), rects = items.map(x => x.getBoundingClientRect()), y0 = ev.clientY;
          const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 8, h = rects[from].height + gap;
          let to = from, moved = false;
          try { li.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ }
          li.classList.add('dragging');
          const onMove = e => {
            const dy = e.clientY - y0;
            if (Math.abs(dy) > 4) moved = true;
            li.style.transform = `translateY(${dy}px)`;
            const mid = rects[from].top + rects[from].height / 2 + dy;
            to = rects.filter((r, j) => j !== from && mid > r.top + r.height / 2).length;
            items.forEach((x, j) => { if (j === from) return; const sh = from < j && j <= to ? -h : to <= j && j < from ? h : 0; x.style.transform = sh ? `translateY(${sh}px)` : ''; });
          };
          const onUp = () => {
            li.removeEventListener('pointermove', onMove); li.removeEventListener('pointerup', onUp); li.removeEventListener('pointercancel', onUp);
            items.forEach(x => { x.style.transform = ''; }); li.classList.remove('dragging');
            if (moved && move(from, to)) { redraw(to); live(`${plain(handsVal[to])}, place ${to + 1} of ${handsVal.length}`); } else li.focus({ preventScroll: true });
          };
          li.addEventListener('pointermove', onMove); li.addEventListener('pointerup', onUp); li.addEventListener('pointercancel', onUp);
        });
      });
    }
    function wireGrid(box, sp, changed) {
      const svg = box.querySelector('.grid-pick');
      if (!svg) return;
      const u = Number(svg.dataset.u), pad = Number(svg.dataset.pad), W = 320, lo = sp.min, hi = sp.max;
      const clamp = v => Math.max(lo, Math.min(hi, v));
      const toPt = ev => { const r = svg.getBoundingClientRect(), k = W / r.width; return [clamp(Math.round(((ev.clientX - r.left) * k - pad) / u) + lo), clamp(Math.round((W - pad - (ev.clientY - r.top) * k) / u) + lo)]; };
      const set = (p, keys) => {
        const sw = box.querySelector('#hands-switch'), swHtml = sw ? sw.outerHTML : '';
        handsVal = p; box.innerHTML = gridHtml(sp, handsVal, false, swHtml); wireGrid(box, sp, changed); changed();
        const nsw = box.querySelector('#hands-switch'); if (nsw) nsw.addEventListener('click', switchHands);
        if (keys) box.querySelector('.grid-pick').focus({ preventScroll: true });
      };
      const hover = svg.querySelector('.gr-hover');
      svg.addEventListener('pointermove', ev => { if (ev.pointerType !== 'mouse') return; const p = toPt(ev); hover.setAttribute('cx', pad + (p[0] - lo) * u); hover.setAttribute('cy', W - pad - (p[1] - lo) * u); });
      svg.addEventListener('pointerleave', () => { hover.setAttribute('cx', -50); });
      svg.addEventListener('click', ev => set(toPt(ev)));
      svg.addEventListener('keydown', ev => {
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[ev.key];
        if (!d) return;
        ev.preventDefault(); ev.stopPropagation();
        const p = handsVal ? handsVal : [clamp(0), clamp(0)];
        set(handsVal ? [clamp(p[0] + d[0]), clamp(p[1] + d[1])] : p, true);
      });
    }
    function wireLine(box, sp) {
      const svg = box.querySelector('.nline');
      if (!svg) return;
      const u = Number(svg.dataset.u), pad = Number(svg.dataset.pad), W = Number(svg.dataset.w);
      const X = x => pad + (x - sp.min) / sp.step * u, clamp = v => Math.max(sp.min, Math.min(sp.max, v));
      const at = ev => { const r = svg.getBoundingClientRect(); return clamp(+(sp.min + Math.round(((ev.clientX - r.left) * W / r.width - pad) / u) * sp.step).toFixed(6)); };
      // the marker moves without redrawing, so a drag keeps going
      svg.__place = v => {
        const g = svg.querySelector('.nl-mark'), j = svg.querySelector('.nl-jump');
        if (g) { g.setAttribute('transform', `translate(${X(v)} 44)`); g.querySelector('text').textContent = signed(v); }
        if (j) j.setAttribute('d', sp.start != null && v !== sp.start ? `M${X(sp.start)} 30 Q${(X(sp.start) + X(v)) / 2} 8 ${X(v)} 30` : '');
        svg.setAttribute('aria-valuenow', v); svg.setAttribute('aria-valuetext', signed(v));
      };
      const set = v => {
        handsVal = v; svg.__place(v);
        const a = root.querySelector('#ans');
        if (a && A.parseNumber(a.value) !== v) { pushUndo(); a.value = String(v); a.dispatchEvent(new Event('input', { bubbles: true })); }
      };
      let dragging = false;
      svg.addEventListener('pointerdown', ev => { if (ev.button > 0) return; dragging = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) { /* fine */ } set(at(ev)); });
      svg.addEventListener('pointermove', ev => { if (dragging) set(at(ev)); });
      ['pointerup', 'pointercancel'].forEach(t => svg.addEventListener(t, () => { dragging = false; }));
      svg.addEventListener('keydown', ev => {
        const cur = Number(svg.getAttribute('aria-valuenow')), big = sp.label * sp.step;
        const v = { ArrowLeft: cur - sp.step, ArrowDown: cur - sp.step, ArrowRight: cur + sp.step, ArrowUp: cur + sp.step, PageDown: cur - big, PageUp: cur + big, Home: sp.min, End: sp.max }[ev.key];
        if (v == null) return;
        ev.preventDefault(); ev.stopPropagation();
        set(clamp(+v.toFixed(6)));
      });
    }
    /** the equation a "Solve…" question asks about, for the step checker (practice only, not tests) */
    function workEq(it) {
      if (!s.hints || phase === 'done' || !window.STEPS) return null;
      if (it.eqn === undefined) it.eqn = STEPS.fromQuestion(it.q);
      return it.eqn;
    }
    function currentInput(q) {
      if (q.type === 'choice') { const sp = lastPick === 'hands' ? handsOf(q) : null; return sp && handsVal != null ? sp.value(handsVal) : selected; }
      const el = root.querySelector('#ans');
      return el ? el.value : '';
    }
    function hasInput(q) {
      if (q.type === 'choice') return lastPick === 'hands' ? handsTouched && handsVal != null : selected != null;
      return String(currentInput(q)).trim().length > 0;
    }
    /** the answer box as it was, kept before each key so Undo can put it back */
    function pushUndo() { const a = root.querySelector('#ans'); if (!a) return; undo.push({ v: a.value, a: a.selectionStart, e: a.selectionEnd }); if (undo.length > 80) undo.shift(); }
    function undoState() { const b = root.querySelector('.ans-key[data-key="undo"]'); if (b) b.disabled = !undo.length; }
    function updatePreview() {
      const pv = root.querySelector('#ans-preview'), a = root.querySelector('#ans');
      if (!pv || !a) return;
      const show = /[/^√]/.test(a.value) && phase !== 'done';
      pv.hidden = !show;
      pv.innerHTML = show ? previewHtml(a.value) : '';
    }
    const live = msg => { const l = root.querySelector('#hands-live'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = msg; }, 30); } };
    /** a key of the keypad (or a written character): typed at the cursor, with Undo, Clear and the fraction template */
    function typeKey(k) {
      const ans = root.querySelector('#ans');
      if (!ans || ans.disabled) return;
      if (k === '−') k = '-';
      const v = ans.value, a = ans.selectionStart == null ? v.length : ans.selectionStart, e = ans.selectionEnd == null ? v.length : ans.selectionEnd;
      const at = (val, c) => { ans.value = val; ans.setSelectionRange(c, c); };
      if (k === 'undo') { const st = undo.pop(); if (!st) return; ans.value = st.v; try { ans.setSelectionRange(st.a, st.e); } catch (x) { /* fine */ } }
      else {
        pushUndo();
        if (k === 'del') { const from = a === e ? Math.max(0, a - 1) : a; at(v.slice(0, from) + v.slice(e), from); }
        else if (k === 'clear') at('', 0);
        else if (k === 'frac') {
          // a fraction template: after a number it starts the bottom; on its own it makes an empty fraction and
          // fills the top first; pressed again it moves to the bottom
          const before = v.slice(0, a), after = v.slice(e), inFrac = /\/[\d.]*$/.test(before);
          if (after.startsWith('/')) { undo.pop(); ans.setSelectionRange(a + 1, a + 1); }
          else if (/\d$/.test(before) && !inFrac) at(before + '/' + after, a + 1);
          else if (!inFrac) at(before + '/' + after, a);
          else undo.pop();
        } else at(v.slice(0, a) + k + v.slice(e), a + k.length);
      }
      undoState();
      ans.dispatchEvent(new Event('input', { bubbles: true }));
      if (!ink) ans.focus({ preventScroll: true });
    }
    function showOpts(on) { optsOpen = on; const p = root.querySelector('#opts-panel'), b = root.querySelector('#opts-btn'); if (p) p.hidden = !on; if (b) b.setAttribute('aria-expanded', String(on)); }
    /** answer by hand, or from a list (kept on this device) */
    function switchHands() { const sp = handsOf(E.current(s).q), line = sp && sp.kind === 'line'; setDevicePref(line ? { line: !handsOn('line') } : { hands: !handsOn() }); render(); const t = root.querySelector('#hands-switch'); if (t) t.focus(); }
    function bind(q) {
      const check = root.querySelector('#check'), next = root.querySelector('#next'), hint = root.querySelector('#hint'), giveup = root.querySelector('#giveup');
      const ans = root.querySelector('#ans');
      if (ans) {
        if (phase === 'done') ans.disabled = true; else if (!asking && !flagOpen && !root.querySelector('#hands .grid-pick')) setTimeout(() => ans.focus({ preventScroll: true }), 0);
        ans.addEventListener('beforeinput', pushUndo);
        ans.addEventListener('input', () => {
          draft = ans.value; if (check) check.disabled = !hasInput(q);
          undoState(); updatePreview();
          const sp = handsOf(q); if (sp && sp.kind === 'line') { const svg = root.querySelector('.nline'); if (svg && svg.__place) svg.__place(lineValue(sp)); }
        });
        // what was typed stays after a wrong answer (or a redraw), so only the slip needs fixing
        const fill = draft != null ? draft : lastInput;
        if (q.type !== 'choice' && typeof fill === 'string') { ans.value = fill; if (check) check.disabled = !hasInput(q); }
      }
      const padBtn = root.querySelector('#pad-toggle');
      if (padBtn) padBtn.addEventListener('click', () => { setDevicePref({ pad: !padOn() }); render(); });
      root.querySelectorAll('.ans-key').forEach(b => b.addEventListener('click', () => typeKey(b.dataset.key)));
      const on = (id, fn) => { const b = root.querySelector('#' + id); if (b) b.addEventListener('click', fn); };
      on('ink-toggle', () => { const want = !ink; setDevicePref({ ink: want }); ink = want ? inkPad(typeKey) : null; render(); });
      on('show-how', doShowHow);
      on('show-step', () => {
        // straight to the step after the one the answer stopped at (it counts as a hint)
        const q0 = E.current(s).q, b = root.querySelector('#show-step'), upto = Math.min(q0.hints.length, Number(b.dataset.step));
        E.useHint(s); hintsShown = Math.max(hintsShown, upto);
        if (hintsShown >= q0.hints.length) { E.reveal(s); phase = 'done'; }
        lastFeedback = `<div class="feedback note">${icon('info')}<span>${phase === 'done' ? 'Here is how it’s done. This question comes back in Review.' : `Here is step ${upto}. Carry on from there, then check.`}</span></div>`;
        render();
      });
      on('skip', doSkip);
      on('pause', doPause);
      on('scratch-btn', () => { scratchOpen = !scratchOpen; render(); });
      on('similar', () => { if (E.similar(s)) doNext(); });
      on('hands-switch', switchHands);
      // "I don't know": before anything was tried, it asks first (a placement check never asks)
      on('giveup-yes', () => { asking = false; doGiveUp(); });
      on('giveup-no', () => { asking = false; render(); const f = root.querySelector('#ans, #hands .order-item, #hands .grid-pick, #choices:not([hidden]) button'); if (f) f.focus(); });
      // the set's length, before the first answer: 5, 7 or 10
      root.querySelectorAll('[data-len]').forEach(b => b.addEventListener('click', () => {
        const n = Number(b.dataset.len);
        setPlayerPref({ len: n });
        if (n !== s.items.length) exercise(root, E.start('practice', { skillId: s.skillId, n }), Object.assign({}, opts, { resumed: true }));
        const nb = root.querySelector(`[data-len="${n}"]`); if (nb) nb.focus();
      }));
      // options: sound, a timer, going on by itself, focus mode
      on('opts-btn', () => { showOpts(!optsOpen); if (optsOpen) { const f = root.querySelector('#opts-panel input'); if (f) f.focus(); } });
      const opt = (id, fn) => { const el = root.querySelector('#' + id); if (el) el.addEventListener('change', () => fn(el.checked)); };
      opt('sound', v => { setPlayerPref({ sound: v }); chime(true); });
      opt('opt-timer', v => { setPlayerPref({ timer: v }); render(); });
      opt('opt-auto', v => { setPlayerPref({ auto: v }); if (v && phase === 'done' && s.results[s.i] && s.results[s.i].correct) startAuto(); });
      opt('opt-focus', v => { setPlayerPref({ focus: v }); setFocus(v); });
      // flag a confusing question: kept with the learner's progress (profile.flagged) for a grown-up to check
      on('flag-btn', () => { flagOpen = !flagOpen; render(); if (flagOpen) { const f = root.querySelector('#flag-why [aria-checked="true"]'); if (f) f.focus(); } else { const b = root.querySelector('#flag-btn'); if (b) b.focus(); } });
      root.querySelectorAll('#flag-why button').forEach(b => b.addEventListener('click', () => root.querySelectorAll('#flag-why button').forEach(x => x.setAttribute('aria-checked', String(x === b)))));
      const fn = root.querySelector('#flag-note');
      if (fn) fn.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); root.querySelector('#flag-save').click(); } });
      on('flag-cancel', () => { flagOpen = false; render(); const b = root.querySelector('#flag-btn'); if (b) b.focus(); });
      const flagList = () => (S.get().profile.flagged || []).filter(f => f && f.skill);
      on('flag-save', () => {
        const it = E.current(s), why = (root.querySelector('#flag-why [aria-checked="true"]') || {}).dataset || {}, note = (root.querySelector('#flag-note') || {}).value || '';
        const entry = { skill: it.skillId, seed: it.seed, why: why.v || 'confusing', note: note.trim().slice(0, 300), t: Date.now() };
        S.setProfile({ flagged: [entry].concat(flagList().filter(f => !(f.skill === it.skillId && f.seed === it.seed))).slice(0, 40) });
        if (!flaggedHere.includes(it)) flaggedHere.push(it);
        flagOpen = false; render(); toast('Flagged. Thanks for telling us.');
        const b = root.querySelector('#flag-btn'); if (b) b.focus();
      });
      on('flag-remove', () => {
        const it = E.current(s);
        S.setProfile({ flagged: flagList().filter(f => !(f.skill === it.skillId && f.seed === it.seed)) });
        flaggedHere.splice(flaggedHere.indexOf(it) >>> 0, flaggedHere.includes(it) ? 1 : 0);
        flagOpen = false; render(); toast('The flag is off.');
      });
      root.querySelectorAll('#choices button').forEach(b => {
        if (phase === 'done') {
          b.disabled = true;
          const k = Number(b.dataset.k);
          if (k === q.answerIndex) b.classList.add('is-right');
          else if (k === selected) b.classList.add('is-wrong');
        } else b.addEventListener('click', () => { selected = Number(b.dataset.k); lastPick = 'list'; root.querySelectorAll('#choices button').forEach(x => x.setAttribute('aria-pressed', String(Number(x.dataset.k) === selected))); if (check) check.disabled = false; });
      });
      if (check) check.addEventListener('click', doCheck);
      if (next) { next.addEventListener('click', doNext); setTimeout(() => next.focus(), 0); }
      if (hint) hint.addEventListener('click', doHint);
      if (giveup) giveup.addEventListener('click', () => {
        const r0 = s.results[s.i];
        if (s.kind === 'placement' || (r0 && r0.tries)) return doGiveUp();
        asking = true; render();
        const y = root.querySelector('#giveup-no'); if (y) y.focus();
      });
      const stop = root.querySelector('#stop');
      if (stop) stop.addEventListener('click', summary);
    }
    let lastInput = null, draft = null, lastSaid = '';
    /** "fraction", "decimal", "percent" or "whole": how a number was written */
    const formOf = t => (/%/.test(t) ? 'percent' : /\//.test(t) ? 'fraction' : /\d\.\d|^\.\d/.test(t) ? 'decimal' : 'whole');
    const PRAISE = ['Well done.', 'Nicely done.', 'Good work.', 'That’s it.'];
    /** the right-or-wrong banner: a large icon, a word and a line */
    const verdict = (good, title, detail) => `<div class="feedback ${good ? 'good' : 'bad'} verdict"><span class="vd-ic">${icon(good ? 'check' : 'cross', 30)}</span><span class="vd-text"><b class="vd-title">${title}</b><span class="vd-detail">${detail}</span></span></div>`;
    /** partly right: which part, said kindly */
    const partText = p => (!p ? '' : p.which ? (p.right ? `Partly right: the ${p.which[0] ? 'x' : 'y'}-coordinate is right. Check the ${p.which[0] ? 'y' : 'x'}-coordinate. ` : '') : p.right ? `Partly right: ${p.right} of ${p.of} ${p.right === 1 ? 'is' : 'are'} in the right place. ` : '');
    function doCheck() {
      const q = E.current(s).q;
      if (!hasInput(q)) return;
      let input = currentInput(q), mathValue = null;
      if (q.type === 'number') {
        const raw = String(input).trim();
        // a percent where a number is asked for: 50% is checked as 0.5
        if (q.unit !== '%' && /%\s*$/.test(raw)) { const v = A.parseNumber(raw.replace(/%\s*$/, '')); if (isFinite(v)) input = String(+(v / 100).toPrecision(12)); }
        else if (isNaN(A.parseNumber(raw)) && /[\^√()²³]|sqrt/i.test(raw)) {
          // a power or a root: worked out where the answer is rounded anyway; elsewhere the number itself is wanted
          if (!E.mathKeys(q)) { lastFeedback = `<div class="feedback note">${icon('info')}<span>Work it out to one number, like <b>12</b>, <b>−3</b> or <b>3/4</b>.</span></div>`; render(); return; }
          const v = E.typedValue(raw);
          if (isFinite(v)) { mathValue = v; input = String(v); }
        }
      }
      const viaHands = q.type === 'choice' && lastPick === 'hands' && handsVal != null;
      if (viaHands && typeof input === 'number') selected = input;
      const res = E.answer(s, input);
      lastInput = q.type === 'choice' ? null : String(currentInput(q));
      const said = q.type === 'choice' ? (viaHands ? handsOf(q).said(handsVal) : plain(q.choices[selected])) : lastInput;
      lastSaid = said;
      const r = s.results[s.i];
      if (!res.correct && !res.unreadable && r) r.said = said;     // kept with the question for Review
      if (!res.unreadable) chime(!!res.correct);
      // the coach: what this wrong answer probably means (never the answer itself)
      const slip = !res.correct && !res.unreadable && window.COACH ? COACH.diagnose(q, q.type === 'choice' ? (typeof input === 'number' ? input : null) : (mathValue != null ? String(mathValue) : lastInput)) : null;
      if (slip) { S.noteMistake(slip.kind, E.current(s).skillId); if (s.results[s.i]) s.results[s.i].slip = slip.kind; }      // kept with the question for Review
      const stepBtn = slip && slip.kind === 'early' && slip.step != null && s.hints && hintsShown < q.hints.length ? `<button class="btn sm" type="button" id="show-step" data-step="${slip.step + 2}">Show step ${Math.min(slip.step + 2, q.hints.length)}</button>` : '';
      const coachNote = slip ? `<div class="coach-note"><span>${esc(slip.msg)}</span>${stepBtn ? `<div class="btn-row" style="margin-top:8px">${stepBtn}</div>` : ''}</div>` : '';
      if (!res.correct && !res.unreadable && workEq(E.current(s))) workOpen = true;          // a solving question: show your work, step by step
      const noticed = slip ? ' Procademy noticed: ' + slip.msg : '';
      if (res.unreadable) { lastFeedback = `<div class="feedback note">${icon('info')}<span>That doesn’t look like a number. Try something like <b>12</b>, <b>−3</b>, <b>3/4</b> or <b>0.5</b>.</span></div>`; render(); return; }
      if (res.correct) {
        phase = 'done'; r.done = true;
        // the same number in another form is right too, and says so: 1/2 is the same as 0.5; √85 is about 9.2
        const shown = q.type === 'number' ? plain(A.answerText(q)).replace(/\s+\S*[a-z]\S*$/i, '') : '', typed = (lastInput || '').trim();
        const same = mathValue != null ? ` ${esc(typed)} is ${Math.abs(mathValue - q.answer) < 1e-9 ? '' : 'about '}${esc(shown)}.` : q.type === 'number' && typed && formOf(typed) !== formOf(shown) ? ` ${esc(typed)} is the same as ${esc(shown)}.` : '';
        lastFeedback = verdict(true, 'Correct', `${r.hinted ? 'You got there with a hint.' : r.tries > 1 ? 'Right on your second try.' : PRAISE[s.i % PRAISE.length]}${same}`);
        if (hintsShown < q.hints.length) lastFeedback += `<details style="margin-top:10px"><summary class="muted small">View the steps</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      } else if (s.hints) {
        lastFeedback = verdict(false, 'Not quite', `${partText(res.part)}Fix your answer and try again, or see how it’s done.`) + coachNote +
          `<div class="btn-row" style="margin-top:8px">${hintsShown < q.hints.length ? '<button class="btn sm" type="button" id="show-how">Show me how</button>' : ''}${explainBtn('Why is that wrong?', 'I answered ' + said + '. Why is that wrong? Help me find my mistake, but don’t tell me the answer yet.' + noticed)}</div>`;
      } else {
        phase = 'done'; E.reveal(s); r.revealed = true;
        if (outOfLives()) s.outOfLives = true;
        lastFeedback = verdict(false, 'Not quite', `${partText(res.part)}The answer is <b>${A.answerText(q)}</b>.${s.outOfLives ? ' That was your last life.' : s.lives ? ` ${s.lives - misses()} ${s.lives - misses() === 1 ? 'life' : 'lives'} left.` : ''}`) + coachNote +
          `<div class="btn-row" style="margin-top:8px">${explainBtn('Explain my mistake', 'I answered ' + said + ', but the answer is ' + plain(A.answerText(q)) + '. What did I do wrong?' + noticed)}</div>
          <details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`;
      }
      render();
    }
    function doHint() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      if (!nudged) { nudged = true; render(); return; }               // the first rung is free: a reminder of the big idea
      E.useHint(s);
      hintsShown += 1;
      if (hintsShown === q.hints.length) { E.reveal(s); phase = 'done'; lastFeedback = `<div class="feedback note">${icon('info')}<span>That’s the last step. Read it through, then move on; this question will come back in Review.</span></div>`; }
      render();
      sayHints(q.hints.slice(hintsShown - 1, hintsShown));
    }
    /** with "Read questions aloud" on, a new hint is read aloud too */
    function sayHints(list) { if (list.length && S.get().profile.autoRead && window.COACH && COACH.canSpeak()) COACH.say(list.join('<p></p>')); }
    /** after a wrong answer: every step but the last, so the learner finishes it (it counts as a hint) */
    function doShowHow() {
      const q = E.current(s).q;
      if (hintsShown >= q.hints.length) return;
      const before = hintsShown;
      E.useHint(s);
      hintsShown = Math.max(hintsShown + 1, q.hints.length - 1);
      if (hintsShown >= q.hints.length) { E.reveal(s); phase = 'done'; }
      lastFeedback = `<div class="feedback note">${icon('info')}<span>${phase === 'done' ? 'Here is how it’s done. Read it through, then move on; this question comes back in Review.' : 'Here are the steps up to the last one. Finish it yourself, then check.'}</span></div>`;
      render();
      sayHints(q.hints.slice(before, hintsShown));
    }
    /** a new question: everything about the last one is put away */
    function fresh() {
      hintsShown = 0; selected = null; phase = 'fresh'; lastFeedback = ''; lastInput = null; draft = null; workLines = null; workOpen = false; scratch = null; nudged = false;
      asking = false; flagOpen = false; optsOpen = false; handsVal = null; handsTouched = false; lastPick = null; undo = []; lastSaid = '';
      if (ink && ink.__clear) ink.__clear();
    }
    function doSkip() {
      if (!E.skip(s)) return;
      fresh();
      toast('Skipped for now. It comes back at the end.');
      render();
    }
    function doPause() {
      setPaused(pauseKey, E.pack(s));
      tutorCtx(null);
      toast('Paused. Open this set again to pick up where you left off.');
      location.hash = opts.back || '#/';
    }
    function doGiveUp() {
      const q = E.current(s).q;
      E.reveal(s); phase = 'done'; hintsShown = s.hints ? q.hints.length : 0;
      lastFeedback = `<div class="feedback note">${icon('info')}<span>Here’s the answer: <b>${A.answerText(q)}</b>${s.hints ? '. The steps are below' : ''}. This question will come back in Review.</span></div>` +
        (s.hints ? '' : `<details style="margin-top:10px" open><summary class="muted small">How to get it</summary>${q.hints.map(hh => `<div class="hint" style="margin-top:8px">${hh}</div>`).join('')}</details>`);
      render();
    }
    function doNext() {
      if (endless) {
        // every PRACTICE_N answers are saved as a set; a level gained shows at once
        if (s.i + 1 - s.saved >= E.PRACTICE_N) { const f = E.saveEndless(s); const up = f && f.changes.find(c => c.to > c.from); if (up) toast(`Level raised: ${plain(A.skills[up.skillId].title)} is now ${A.LEVELS[up.to]}`); if (window.APP) window.APP.refreshStats(); }
        if (s.i + 1 >= s.items.length) E.more(s);
      }
      if (s.outOfLives || timeUp()) return summary();
      E.next(s);
      fresh();
      render();
      window.scrollTo(0, 0);
    }
    function summary() {
      stopClock(); clearTimeout(autoNext); if (autoStop) autoStop();
      document.documentElement.classList.remove('pc-focus');
      if (s.stopwatch && !s.ms) s.ms = Date.now() - t0;
      if (limitMs && timeUp()) s.timedOut = true;
      const f = endless ? E.stopEndless(s) : E.finish(s);
      if (canPause && pausedAll()[pauseKey]) setPaused(pauseKey, null);          // a paused copy of this set is done with
      if (opts.onFinish) { try { opts.onFinish(s, f); } catch (e) { console.error(e); } }
      tutorCtx(null);
      if (window.APP) window.APP.refreshStats();
      if (opts.result) return opts.result(s, f);              // a page with its own result screen (the placement check)
      const ratio = f.total ? f.right / f.total : 0;
      // the same questions for a friend: practice sets and CPM lesson sets have a seed that rebuilds them
      const vsInfo = s.kind === 'practice' ? { k: 'p', id: s.skillId, seed: s.seed, score: f.right, total: f.total }
        : s.kind === 'mix' && s.cpm && s.cpm.lesson ? { k: 'l', book: s.cpm.book, lesson: s.cpm.lesson, seed: s.seed, score: f.right, total: f.total } : null;
      const testout = s.kind === 'testout';
      const head = endless ? 'Session complete' : testout ? (ratio === 1 ? 'You tested out' : 'Not quite yet') : s.kind === 'boss' ? (f.beaten ? 'Boss beaten' : 'The boss won this time') : s.kind === 'weekly' ? (f.solved ? 'Challenge solved' : 'Not this time') : s.kind === 'speed' && f.newBest ? 'A new best' : s.timedOut && ratio < 1 ? 'Time’s up' : ratio === 1 ? 'Excellent work' : ratio >= 0.7 ? 'Nice work' : 'Keep practicing';
      const best = s.kind === 'speed' ? (S.get().profile.best || {})[s.skillId] : null;
      const extraLine = s.kind === 'speed' ? `<p class="sum-extra">Your time: <b>${clockText(s.ms)}</b>, ${f.right} of ${f.total} right.${best && !f.newBest ? ` Your best is ${clockText(best.ms)} with ${best.right} right.` : f.newBest ? ' That’s your best yet.' : ''} More right answers beat a faster time.</p>`
        : s.kind === 'boss' ? `<p class="sum-extra">${f.beaten ? `You beat the boss of this unit with ${s.lives - misses()} ${s.lives - misses() === 1 ? 'life' : 'lives'} to spare.` : s.outOfLives ? `Three misses ended it at question ${s.i + 1} of ${f.total}. Practice the unit’s skills, then try again.` : 'Three or more misses this time. Practice the unit’s skills, then try again.'}</p>`
        : s.kind === 'weekly' ? `<p class="sum-extra">${f.solved ? 'Nicely done. A new challenge comes every Monday.' : 'Read the steps below, then try again next week; a new challenge comes every Monday.'}</p>`
        : s.timedOut ? `<p class="sum-extra">Time’s up: ${plural(s.items.filter((it, k) => s.results[k] && s.results[k].done).length, 'question')} answered in ${clockText(limitMs)}.${s.kind === 'quiz' ? ' Questions you didn’t reach don’t count as mistakes.' : ''}</p>` : '';
      // a practice test for a chapter: the lessons to look at again before the real one
      const lessonsToReview = s.kind === 'chapter-test' && s.cpm ? [...new Set(s.items.filter((it, k) => it.lesson && !E.counts(s.results[k])).map(it => it.lesson))] : [];
      const mastered = f.changes.filter(ch => ch.to === 4 && ch.from < 4);
      // the questions to look at again: each with what was answered and the right answer
      const missedHere = s.items.map((it, k) => ({ it, r: s.results[k] })).filter(x => (endless ? x.r && x.r.done : true) && !E.counts(x.r));
      const answerOf = q => (q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q));
      const clipQ = t => (t.length > 120 ? t.slice(0, 117).replace(/\s+\S*$/, '') + '…' : t);
      const prev = s.kind === 'practice' && ratio < 0.5 ? prevSkill(s.skillId) : null, savedMisses = S.get().missed.length;
      const changes = f.changes.map(ch => `<span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.skills[ch.skillId].title}: ${A.LEVELS[ch.from]} → <b>${A.LEVELS[ch.to]}</b></span>`).join('');
      // a perfect set is celebrated; the longest run of first-try answers is said; the time, when the timer was on
      const perfect = !endless && f.total >= 3 && f.right === f.total && !['placement', 'weekly', 'review'].includes(s.kind);
      const run = endless ? null : E.tally(s).best;
      const timed = selfTimer() ? clockText(Date.now() - t0) : '';
      // the next skill: after a practice set, a test out, beat your best, or unlimited practice of one skill;
      // it leads when the set went well
      let nextBtn = '';
      const goOn = ratio >= 0.7;
      if (s.skillId && (s.kind === 'practice' || s.kind === 'speed' || (endless && s.skills.length === 1 && f.total) || (testout && ratio === 1))) { const nx = nextSkill(s.skillId); if (nx && nx !== s.skillId) nextBtn = `<a class="btn${goOn ? ' primary' : ''}" href="${skillHref(nx)}">Next skill: ${A.skills[nx].title} →</a>`; }
      if (opts.next) nextBtn = `<a class="btn${goOn ? ' primary' : ''}" href="${opts.next.href}">${esc(opts.next.label)} →</a>`;
      const againBtn = opts.again ? `<button class="btn${nextBtn && goOn ? '' : ' primary'}" id="again">${opts.againLabel || 'Practice again'}</button>` : '';
      root.innerHTML = `<div class="ex"><div class="card summary">
        <div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">${esc(s.title)}</div>
        <h1 style="margin-top:6px">${head}</h1>
        <div class="score">${f.right} / ${f.total}</div>
        ${perfect ? `<div class="perfect-banner"><span class="pb-ic" aria-hidden="true">${icon('star', 26)}</span><span><b>A perfect set</b><span class="small">Every question right on the first try, with no hints</span></span></div>` : ''}
        ${mastered.length ? `<div class="mastered-banner"><span class="mb-medal" aria-hidden="true">${icon('medal', 28)}</span><span><b>Mastered</b><span class="small">${mastered.map(ch => A.skills[ch.skillId].title).join(', ')}</span></span></div>` : ''}
        <div class="what">${testout ? (ratio === 1 ? `Every question right with no hints, so ${A.skills[s.skillId].title} is Proficient now.` : `${f.right} of ${f.total} right. Practice the skill a little more, then try again.`) : endless ? (f.total ? `${plural(f.total, 'question')} answered, ${f.right} correct on the first try without a hint. Longest streak: ${f.best}.` : 'No questions were answered in this session.') : f.right === f.total ? (perfect ? '' : 'Every question right on the first try, with no hints.') : `${f.right} of ${f.total} correct on the first try without a hint.${s.kind === 'practice' && ratio < 1 ? ' Answer all ' + f.total + ' correctly to reach Proficient.' : ''}`}${!endless && !perfect && run >= 2 ? ` Longest streak: ${run} in a row.` : ''}${f.extras ? ` Plus ${plural(f.extras, 'similar question')}, ${f.extraRight} right on the first try.` : ''}${timed ? ` Time: ${timed}.` : ''}</div>
        ${extraLine}
        ${changes ? `<div class="changes">${changes}</div>` : (s.kind !== 'review' && s.kind !== 'weekly' ? `<p class="muted" style="margin-top:14px">No skill levels changed.</p>` : '')}
        ${lessonsToReview.length ? `<div class="sum-lessons"><h2>Lessons to look at before the test</h2><div class="btn-row" style="margin-top:6px">${lessonsToReview.map(l => { const f2 = A.cpmLesson(s.cpm.book, l); return f2 ? `<a class="chip-btn" href="#/cpm-practice/${s.cpm.book}/${encodeURIComponent(l)}">${esc(window.CPMVIEWS ? CPMVIEWS.lessonName(f2.lesson) : l)}</a>` : ''; }).join('')}</div></div>` : ''}
        <div class="chip" style="font-size:1rem">+${fmt(f.pts)} points</div>
        <div class="btn-row">
          ${nextBtn && goOn ? nextBtn + againBtn : againBtn + nextBtn}
          <a class="btn" href="${opts.back || '#/'}">${esc(opts.backLabel || 'Back')}</a>
          ${window.WORKSHEET && WORKSHEET.sheet && f.total ? '<button class="btn ghost" type="button" id="print-set">Print this set</button>' : ''}
        </div>
        ${prev ? `<p class="small sum-note">Too hard? <a href="${skillHref(prev)}">Go back to ${A.skills[prev].title}</a> first.</p>` : ''}
        ${missedHere.length && s.kind !== 'placement' ? `<div class="sum-missed"><h2>To look at again</h2><ol>${missedHere.slice(0, 8).map(({ it, r }) => `<li><span class="sum-q">${esc(clipQ(plain(it.q.prompt)))}</span><span class="small muted">${r && r.said ? `You answered ${esc(r.said)}${r.part && r.part.right && !r.correct ? `, partly right (${r.part.right} of ${r.part.of})` : ''}. ` : ''}The answer is <b>${answerOf(it.q)}</b>.</span></li>`).join('')}</ol>${missedHere.length > 8 ? `<p class="small muted" style="margin:0">And ${missedHere.length - 8} more.</p>` : ''}
          <div class="btn-row" style="margin-top:10px"><button class="btn" type="button" id="redo-missed">Practice these again</button></div></div>` : ''}
        ${flaggedHere.length ? `<div class="sum-flags"><h2>${icon('flag', 18)} Flagged in this set</h2><ul>${flaggedHere.map(it => { const fl = (S.get().profile.flagged || []).find(x => x.skill === it.skillId && x.seed === it.seed); return `<li><span class="sum-q">${esc(clipQ(plain(it.q.prompt)))}</span>${fl ? `<span class="small muted">${esc((FLAG_WHY.find(w => w[0] === fl.why) || ['', ''])[1])}${fl.note ? `: ${esc(fl.note)}` : ''}</span>` : ''}</li>`; }).join('')}</ul><p class="small muted">Thanks for telling us. Flagged questions are kept with your progress so a grown-up can look at them.</p></div>` : ''}
        ${savedMisses >= 10 && s.kind !== 'review' ? `<p class="small sum-note">You have ${savedMisses} mistakes saved. A review day this week would clear them. <a href="#/review">Go to Review</a></p>` : ''}${opts.summaryExtra ? opts.summaryExtra(s, f) : ''}${vsInfo && window.CHALLENGE ? CHALLENGE.button(vsInfo, opts.challengeLabel) : ''}</div></div>`;
      if (window.CHALLENGE) CHALLENGE.wire(root);
      if (perfect || mastered.length || f.changes.some(ch => ch.to === 3 && ch.from < 3) || f.beaten || f.newBest || f.solved) celebrate(root.querySelector('.summary'), perfect || mastered.length || f.beaten ? 'big' : 'small');
      if (f.beaten && window.BADGES) BADGES.flag('boss');
      if (f.solved && window.BADGES) BADGES.flag('weekly');
      if (f.newBest && f.right === f.total && window.BADGES) BADGES.flag('best');
      const again = root.querySelector('#again');
      if (again) again.addEventListener('click', () => opts.again());
      const redo = root.querySelector('#redo-missed');
      if (redo) redo.addEventListener('click', () => exercise(root, E.start('review', { items: missedHere.map(x => ({ skill: x.it.skillId, seed: x.it.seed })), n: missedHere.length }), { back: opts.back, backLabel: opts.backLabel, resumed: true }));
      const pr = root.querySelector('#print-set');
      if (pr) pr.addEventListener('click', () => WORKSHEET.sheet(root, { title: plain(s.title), sub: `${plural(f.total, 'question')} from your practice`, items: (endless ? s.items.filter((it, k) => s.results[k] && s.results[k].done) : s.items).map(it => ({ q: it.q })), back: opts.back || '#/', backLabel: opts.backLabel || 'Back' }));
    }
    function timeUp() { return !!limitMs && Date.now() - t0 >= limitMs; }
    let clockTimer = 0;
    function stopClock() { clearInterval(clockTimer); clockTimer = 0; }
    // the on-screen timer for a self-paced set (an option): it counts while the set is open
    const selfTick = setInterval(() => {
      if (!root.isConnected || root.__session !== s || E.isDone(s)) return clearInterval(selfTick);
      const el = root.querySelector('#ex-timer');
      if (el) el.textContent = clockText(Date.now() - t0);
    }, 1000);
    if (limitMs || s.stopwatch) {
      clockTimer = setInterval(() => {
        const el = root.querySelector('#ex-clock');
        if (!root.isConnected || root.__session !== s || (endless ? s.stopped : s.finished)) return stopClock();
        if (el) { el.textContent = clockText(s.stopwatch ? Date.now() - t0 : limitMs - (Date.now() - t0)); el.classList.toggle('low', !!limitMs && limitMs - (Date.now() - t0) < 30000); }
        if (timeUp()) {
          const r = s.results[s.i];
          if (!(r && r.tries) || phase === 'done') { stopClock(); summary(); }                     // a question half answered gets finished first
          else if (el) el.textContent = 'Time’s up: finish this one';
        }
      }, 250);
    }
    if (endless) endlessNow = s;
    // the Options menu closes with a tap anywhere else (one listener for this set, gone when the set is)
    const closeOpts = ev => {
      if (!root.isConnected || root.__session !== s) return document.removeEventListener('pointerdown', closeOpts, true);
      if (!optsOpen || (ev.target.closest && ev.target.closest('.ex-opts'))) return;
      showOpts(false);
    };
    document.addEventListener('pointerdown', closeOpts, true);
    if (root.__onKey) root.removeEventListener('keydown', root.__onKey);   // one player per element: drop the last session's keys
    root.__onKey = onKey;
    root.addEventListener('keydown', onKey);
    function onKey(ev) {
      if (!root.isConnected) { root.removeEventListener('keydown', onKey); return; }
      if (ev.key === 'Escape' && (optsOpen || flagOpen || asking)) {
        ev.preventDefault();
        if (optsOpen) { showOpts(false); const b = root.querySelector('#opts-btn'); if (b) b.focus(); }
        else if (flagOpen) { flagOpen = false; render(); const b = root.querySelector('#flag-btn'); if (b) b.focus(); }
        else { const b = root.querySelector('#giveup-no'); if (b) b.click(); }
        return;
      }
      if (ev.key === 'Enter' && !ev.shiftKey) {
        const next = root.querySelector('#next'), check = root.querySelector('#check');
        if (document.activeElement && document.activeElement.id === 'stop') return;      // Enter on ■ Stop stops
        if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.giveup-ask, .flag-box, .opts-panel, .q-tools, .len-pick, .hands-switch, .ans-pad')) return;    // their own buttons
        if (next) { ev.preventDefault(); next.click(); }
        else if (check && !check.disabled && document.activeElement && document.activeElement.id !== 'giveup' && document.activeElement.id !== 'hint' && document.activeElement.id !== 'stop') { ev.preventDefault(); check.click(); }
      } else if (/^[1-9]$/.test(ev.key) && phase !== 'done' && !(document.activeElement && document.activeElement.tagName === 'INPUT')) {
        const b = root.querySelector(`#choices:not([hidden]) button[data-k="${Number(ev.key) - 1}"]`);
        if (b) b.click();
      } else if (/^Arrow(Up|Down|Left|Right)$/.test(ev.key) && phase !== 'done' && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        // the arrow keys move through the choices (and choose), from the list or from nowhere in particular
        const list = root.querySelector('#choices:not([hidden])'), ae = document.activeElement;
        if (!list || (ae && ae !== document.body && ae !== root && !list.contains(ae) && !(ae.classList && ae.classList.contains('card')))) return;
        const btns = [...list.querySelectorAll('button')], cur = btns.indexOf(ae) >= 0 ? btns.indexOf(ae) : selected != null ? selected : -1;
        const back = /Up|Left/.test(ev.key), k = cur < 0 ? (back ? btns.length - 1 : 0) : (cur + (back ? -1 : 1) + btns.length) % btns.length;
        ev.preventDefault();
        btns[k].focus(); btns[k].click();
      } else if (/^[hs]$/i.test(ev.key) && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !(document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))) {
        const b = root.querySelector(ev.key.toLowerCase() === 'h' ? '#hint' : '#skip');      // H: a hint; S: skip for now
        if (b && !b.disabled) { ev.preventDefault(); b.click(); }
      }
    }
    render();
  }

  function practice(root, sid) {
    const def = A.skills[sid], where = A.whereIs(sid);
    if (!def || !where) return notFound(root);
    // a set is 7 questions, or 5 or 10 when the learner chose that (from the first question of a set)
    const start = () => exercise(root, E.start('practice', { skillId: sid, n: [5, 7, 10].includes(playerPref().len) ? playerPref().len : E.PRACTICE_N }), { back: unitHref(where.course, where.unit), backLabel: where.unit.title, again: start });
    start();
  }
  function unitTest(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('unit-test', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Retake the test' });
    start();
  }
  function challenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    const start = () => exercise(root, E.start('course-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Retake the challenge' });
    start();
  }
  function masteryChallenge(root, cid) {
    const c = A.courseById(cid);
    if (!c) return notFound(root);
    if (!E.masteryPool(c).length) { root.innerHTML = `<div class="card empty">No skills are ready for a mastery challenge yet. Practice a few skills first.<div class="btn-row" style="justify-content:center"><a class="btn" href="${courseHref(c)}">Back to ${esc(c.title)}</a></div></div>`; return; }
    const start = () => { if (!E.masteryPool(c).length) return masteryChallenge(root, cid); exercise(root, E.start('mastery-challenge', { courseId: cid }), { back: courseHref(c), backLabel: c.title, again: start, againLabel: 'Start another round' }); };
    start();
  }
  /* ---------- more ways to practice: a timed quiz, beat your best, boss levels, the weekly challenge, a warm-up,
     a summer plan and a check before high school ---------- */
  function quiz(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('quiz', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Take another quiz' });
    start();
  }
  function boss(root, cid, uid) {
    const c = A.courseById(cid), u = A.unitById(cid, uid);
    if (!c || !u) return notFound(root);
    const start = () => exercise(root, E.start('boss', { courseId: cid, unitId: uid }), { back: unitHref(c, u), backLabel: u.title, again: start, againLabel: 'Face the boss again' });
    start();
  }
  function speed(root, sid) {
    const def = A.skills[sid];
    if (!def || !A.whereIs(sid)) return notFound(root);
    const start = () => exercise(root, E.start('speed', { skillId: sid }), { back: skillHref(sid), backLabel: plain(def.title), again: start, againLabel: 'Try to beat it' });
    start();
  }
  /** the course a learner works in: their first saved course, else their grade's */
  function myCourse() {
    const st = S.get();
    return st.profile.enrolled.filter(id => !id.startsWith('cpm:')).map(id => A.courseById(id)).filter(Boolean)[0] || (st.profile.grade != null ? A.courseById(COURSE_FOR[st.profile.grade]) : st.profile.adult ? A.courseById('math-6') : null);
  }
  /** weeks in a row with the weekly challenge solved, up to this one */
  function weeklyRun() {
    const w = S.get().profile.weekly || {};
    let n = 0, wk = E.weekOf();
    if (!w[wk]) wk = S.dayShift(wk, -7);
    while (w[wk]) { n++; wk = S.dayShift(wk, -7); }
    return n;
  }
  function weekly(root) {
    const c = myCourse();
    if (!c) { root.innerHTML = `<h1>This week’s challenge</h1><div class="card empty"><p>Choose your grade or save a course, and a new challenge problem from it waits here every Monday.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/settings">Choose my grade</a><a class="btn" href="#/courses">Find a course</a></div></div>`; return; }
    const week = E.weekOf(), done = (S.get().profile.weekly || {})[week], it = E.weeklyItem(c, week), run = weeklyRun();
    const until = 7 - ((new Date(S.today() + 'T12:00').getDay() + 6) % 7);
    root.innerHTML = `<div class="weekly-page"><h1>This week’s challenge</h1>
      <div class="card weekly-card"><div class="row between" style="flex-wrap:wrap;gap:10px"><div><span class="chip">${esc(c.title)}</span> <span class="chip">${esc(A.stripTags(A.skills[it.skillId].title))}</span></div><span class="small muted">${until === 1 ? 'A new one tomorrow' : `A new one in ${until} days`}</span></div>
        <p class="muted" style="margin:10px 0 0">One harder, several-step problem, new every Monday. Try it without hints first; hints open after a wrong answer. Solving it earns the Weekly challenger badge.</p>
        ${done ? `<p class="weekly-done">${icon('check', 18)} <b>Solved this week${done.first ? ', on the first try' : ''}.</b></p>` : ''}
        <div class="btn-row"><button class="btn primary" type="button" id="wk-go">${done ? 'Try it again' : 'Start the challenge'}</button></div>
        ${run > 1 ? `<p class="small muted" style="margin:10px 0 0">${run} weeks in a row solved.</p>` : ''}</div></div>`;
    root.querySelector('#wk-go').addEventListener('click', () => {
      exercise(root, E.start('weekly', { courseId: c.id, week }), { back: '#/weekly', backLabel: 'This week’s challenge' });
      window.scrollTo(0, 0);
    });
    tutorCtx(null);
  }
  /** a quick warm-up's skills: mental math and estimation near the learner's grade */
  const WARM = [[0, ['k.make-10', 'k.add-within-10']], [1, ['g1.add-within-20', 'g1.sub-within-20']], [2, ['g2.add-sub-20', 'g2.add-sub-100']], [3, ['g3.mult-facts', 'g3.div-facts', 'g3.rounding']], [4, ['g4.mental-math', 'g4.estimate-sum-diff', 'g3.mult-facts']],
    [5, ['g5.times-11', 'g5.estimate-products', 'g4.mental-math']], [6, ['g6.percent-in-head', 'g5.times-11', 'g5.estimate-products']], [7, ['g6.percent-in-head', 'math7.add-negatives', 'g5.estimate-products', 'g5.times-11']]];
  function warmSkills() {
    const g = S.get().profile.grade, at = g == null ? 6 : g;
    const row = WARM.slice().reverse().find(([from]) => at >= from) || WARM[0];
    const ids = row[1].filter(id => A.skills[id] && A.whereIs(id));
    return ids.length ? ids : ['g4.mental-math', 'g5.times-11'].filter(id => A.skills[id]);
  }
  function warmup(root) {
    const ids = warmSkills();
    if (!ids.length) return notFound(root);
    const start = () => exercise(root, E.endless({ skills: ids, title: 'Mental math warm-up' }), { back: '#/', backLabel: 'Home', minutes: 5, again: start, againLabel: 'Warm up again',
      banner: 'Five minutes of quick questions to do in your head. Questions get harder as you get them right.' });
    start();
  }
  /** a summer review plan: six weeks of the year just finished (its units in order), then two weeks of the next */
  const SUMMER_WEEKS = 8;
  function summerPlan() {
    const st = S.get(), g = st.profile.grade;
    const cur = myCourse(), idx = cur ? COURSE_FOR.indexOf(cur.id) : -1, nxt = idx >= 0 ? A.courseById(COURSE_FOR[idx + 1]) : null;
    if (!cur) return null;
    const units = cur.units.filter(u => u.skills.some(id => A.skills[id])), reviewWeeks = nxt ? 6 : SUMMER_WEEKS, per = Math.max(1, Math.ceil(units.length / reviewWeeks));
    const weeks = [];
    for (let k = 0; k < reviewWeeks && k * per < units.length; k++) { const us = units.slice(k * per, k * per + per); weeks.push({ n: weeks.length + 1, kind: 'Review', course: cur, units: us }); }
    if (nxt) nxt.units.filter(u => u.skills.some(id => A.skills[id])).slice(0, SUMMER_WEEKS - weeks.length).forEach(u => weeks.push({ n: weeks.length + 1, kind: 'A look ahead', course: nxt, units: [u] }));
    return { cur, nxt, weeks, g };
  }
  function summer(root) {
    const plan = summerPlan();
    if (!plan) { root.innerHTML = `<h1>Summer review</h1><div class="card empty"><p>Choose your grade or save a course, and an eight-week summer plan is made from it.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/settings">Choose my grade</a></div></div>`; return; }
    const st = S.get().profile.summer || {}, done = (st.course === plan.cur.id && st.done) || {};
    const next = plan.weeks.find(w => !done[w.n]);
    root.innerHTML = `<div class="summer-page"><h1>Summer review</h1>
      <p class="muted">${plan.weeks.length} weeks, one short practice each: the units of ${esc(plan.cur.title)} in order, so nothing slips over the break${plan.nxt ? `, then a first look at ${esc(plan.nxt.title)}` : ''}. Ten questions a week; do more any time.</p>
      <div class="pbar" role="img" aria-label="${Object.keys(done).length} of ${plan.weeks.length} weeks done"><span style="width:${Math.round(Object.keys(done).length / plan.weeks.length * 100)}%"></span></div>
      <ol class="summer-weeks">${plan.weeks.map(w => `<li class="card tight summer-week${done[w.n] ? ' done' : ''}${next === w ? ' next' : ''}"><div class="row between" style="gap:8px"><b>Week ${w.n}</b><span class="chip">${w.kind}</span></div>
        <span class="small">${w.units.map(u => esc(u.title)).join(', ')}</span>
        <div class="btn-row" style="margin-top:8px">${done[w.n] ? `<span class="small muted">${icon('check', 16)} Done ${new Date(done[w.n]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><button class="btn sm ghost" type="button" data-week="${w.n}">Again</button>` : `<button class="btn sm${next === w ? ' primary' : ''}" type="button" data-week="${w.n}">Start week ${w.n}</button>`}</div></li>`).join('')}</ol></div>`;
    root.querySelectorAll('[data-week]').forEach(b => b.addEventListener('click', () => {
      const w = plan.weeks.find(x => x.n === Number(b.dataset.week)), skills = [].concat(...w.units.map(u => u.skills.filter(id => A.skills[id])));
      exercise(root, E.start('mix', { skills, n: 10, title: `Summer review · week ${w.n}` }), { back: '#/summer', backLabel: 'Summer review', onFinish: () => {
        const cur = S.get().profile.summer || {};
        S.setProfile({ summer: { course: plan.cur.id, done: Object.assign({}, cur.course === plan.cur.id ? cur.done : {}, { [w.n]: Date.now() }) } });
      } });
      window.scrollTo(0, 0);
    }));
    tutorCtx(null);
  }
  /** before high school: the skills high school math builds on, by topic */
  const READY = [['Numbers', ['math7.add-negatives', 'math7.mul-div-negatives', 'math7.mul-div-fractions', 'g6.decimals', 'math8.roots']],
    ['Ratios and percents', ['g6.unit-rates', 'math7.proportional-table', 'math7.percent-of', 'math7.percent-change']],
    ['Expressions and equations', ['math7.distribute', 'math7.two-step-equations', 'math8.distributive-equations', 'math7.two-step-inequalities', 'math8.negative-exponents']],
    ['Lines and functions', ['math8.slope', 'math8.graph-lines', 'math8.recognize-functions', 'math8.solve-systems']],
    ['Geometry and data', ['math7.circles', 'math8.pythagorean-theorem', 'math8.triangle-angles', 'math7.mean-median']]];
  const readyIds = () => [].concat(...READY.map(g => g[1])).filter(id => A.skills[id] && A.whereIs(id));
  function ready(root) {
    const ids = readyIds(), good = ids.filter(id => S.skill(id).level >= 3), pct = ids.length ? Math.round(good.length / ids.length * 100) : 0;
    root.innerHTML = `<div class="ready-page"><h1>Ready for high school</h1>
      <p class="muted">The ${ids.length} skills Algebra 1 and Geometry build on. Each one at Proficient or above is checked off.</p>
      <div class="card ready-head"><div><div class="big-num">${pct}%</div><span class="small muted">${good.length} of ${ids.length} skills ready</span></div>${mbar(ids)}
        <div class="btn-row" style="margin-top:12px"><button class="btn primary" type="button" id="rd-check">Check my readiness · 10 questions</button></div></div>
      <div class="ready-groups">${READY.map(([name, list]) => { const ok = list.filter(id => A.skills[id] && A.whereIs(id)); return ok.length ? `<section class="card tight"><h2>${name}</h2><ul class="ready-list">${ok.map(id => `<li class="${S.skill(id).level >= 3 ? 'ok' : ''}"><span class="ready-tick" aria-hidden="true">${S.skill(id).level >= 3 ? icon('check', 14) : ''}</span><a href="${skillHref(id)}">${A.skills[id].title}</a><a class="btn sm ghost" href="${practiceHref(id)}" aria-label="Practice ${esc(A.stripTags(A.skills[id].title))}">Practice</a></li>`).join('')}</ul></section>` : ''; }).join('')}</div></div>`;
    root.querySelector('#rd-check').addEventListener('click', () => {
      // the weakest skills first, so the check finds the gaps
      const pick = ids.slice().sort((a, b) => S.skill(a).level - S.skill(b).level).slice(0, 10);
      exercise(root, E.start('mix', { skills: pick, n: 10, title: 'Ready for high school: a check' }), { back: '#/ready', backLabel: 'Ready for high school' });
      window.scrollTo(0, 0);
    });
    tutorCtx(null);
  }

  /** today's practice: skills due for a refresher, mistakes to fix and new skills, mixed together */
  function daily(root) {
    const plan = E.dailyPlan();
    if (!plan.total) {
      root.innerHTML = `<h1>Today’s practice</h1><div class="card empty"><p>Today’s practice is assembled from what you are learning. Save a course (or your class’s CPM book and lesson), or practice any skill, and it will be ready here.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/courses">Find a course</a></div></div>`;
      return;
    }
    const start = () => { let s; try { s = E.start('daily'); } catch (e) { return daily(root); } exercise(root, s, { back: '#/', backLabel: 'Home', again: start, againLabel: 'Practice again' }); };
    start();
  }
  /** what is new since this learner last looked (dismissed for good with Dismiss) */
  const NEWS = 'n12';
  function newsCard() {
    if (isNew() || S.get().profile.seenNews === NEWS) return '';
    const items = [['#/course/calculus', 'A Calculus course'], ['#/balance', 'Balance, a new daily puzzle'], ['#/notes', 'Notes on every lesson'], ['#/family', 'Family and class'], ['#/settings', 'Menus in Spanish or Hindi'], ['#/courses', 'Find your starting point in any course'], ['#/unlimited', 'Twenty more ready-made topics'], ['#/settings', 'Get the app'], ['#/new', 'A daily plan, with streak savers'], ['#/sprint/add', 'Addition and subtraction facts'], ['#/unlimited', 'Practice any topic, in any subject'], ['#/unlimited', 'Unlimited practice for every skill'], ['#/tutor', 'The tutor now helps with every subject'], ['#/fractions', 'Fraction lab'], ['#/integers', 'Integer tiles'], ['#/search/fraction', 'Search now finds tools'], ['#/leap', 'Leap, a number-line puzzle'], ['#/shapes', 'Shapes and space'], ['#/percent', 'Percents and money'], ['#/calc', 'An exact-fraction calculator'], ['#/numbers', 'Number explorer'], ['#/data', 'Data and statistics']];
    return `<div class="card news" id="news"><div class="row between"><h2 style="margin:0">New in Procademy</h2><button class="btn sm ghost" id="news-x" type="button">Dismiss</button></div>
      <div class="news-items">${items.map(([href, t]) => `<a class="chip-btn" href="${href}">${t}</a>`).join('')}</div><p class="small" style="margin:10px 0 0"><a href="#/new">View all updates →</a></p></div>`;
  }
  /** every tool: [key, href, name, line, icon, hue] */
  function toolList() {
    const sp = window.SPRINT ? SPRINT.DECKS.map(d => SPRINT.deckState(d.id).best).reduce((a, b) => Math.max(a, b), 0) : 0;
    const c = S.get().profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const prepHref = S.get().profile.prep ? `#/prep/${S.get().profile.prep.book}/${S.get().profile.prep.ch}` : f ? `#/prep/${f.book.id}/${f.chapter.n}` : '#/cpm';
    return [
      ['unlimited', '#/unlimited', 'Unlimited practice', 'Practice any skill or topic for as long as you like.', 'unlimited', 215],
      ['calc', '#/calc', 'Calculator', 'Keys like the graphing calculator used in class: graphs, tables and statistics, with exact fractions and every step.', 'calc', 255],
      ['graph', '#/graph', 'Graphing calculator', 'Start a graph with one tap, then explore it with sliders.', 'graph', 200],
      ['numbers', '#/numbers', 'Number explorer', 'Primes, factor trees, divisibility, GCF and LCM, and scientific notation.', 'tree', 140],
      ['measure', '#/measure', 'Units and scale', 'Change units with every step shown, and work with scale drawings and maps.', 'globe', 120],
      ['data', '#/data', 'Data and statistics', 'Mean, median, IQR, MAD, box plots and histograms.', 'data', 175],
      ['fractions', '#/fractions', 'Fraction lab', 'Add, subtract, multiply, divide and compare fractions, shown as bars and area models.', 'fraction', 25],
      ['integers', '#/integers', 'Integer tiles', 'Add, subtract, multiply and divide negative numbers with + and − tiles, one step at a time.', 'integers', 330],
      ['shapes', '#/shapes', 'Shapes and space', 'Area, perimeter, volume, surface area, nets and angles, drawn to scale.', 'shapes', 280],
      ['geometry', '#/geometry', 'Geometry lab', 'Compass constructions, transformations on a grid, and games for plotting points and reading angles.', 'pencil', 230],
      ['percent', '#/percent', 'Percents and money', 'Percent problems, sales, tips from a receipt, markups and interest on a percent ruler.', 'percent', 45],
      ['ratios', '#/ratios', 'Ratio table', 'Equal ratios in a table: multiply, divide or add columns, and find a missing value exactly.', TOOL_PICS.ratios, 200],
      ['clock', '#/measure/clock', 'Clocks and time', 'Set a clock by dragging its hands, read the time in words, and work out how long until another time.', 'timer', 30],
      ['money', '#/money', 'Counting money', 'Coins and bills on a counter, with a running total and two counting games.', TOOL_PICS.money, 140],
      ['blocks', '#/numbers/blocks', 'Place value blocks', 'Ones, tens, hundreds and thousands as blocks: build a number and trade ten for one.', TOOL_PICS.blocks, 220],
      ['times', '#/numbers/table', 'Multiplication table', 'Explore the table from 1 × 1 to 12 × 12: arrays, patterns, squares and facts that match.', TOOL_PICS.times, 260],
      ['chance', '#/chance', 'Probability simulator', 'Spinners, number cubes, coins and marbles, run up to 10,000 times, including two-step experiments.', 'dice', 0],
      ['tiles', '#/tiles', 'Algebra tiles', 'CPM’s equation mat and comparison mat with legal moves, and factoring with tiles.', 'tiles', 160],
      ['steps', '#/steps', 'Step checker', 'Check your work line by line, or see an equation solved, simplified or factored step by step.', 'steps', 215],
      ['setup', '#/setup', 'Word problems', 'Turn a story into an equation, then solve it. Every step is checked.', 'story', 30],
      ['sprint', '#/sprint', 'Speed sprints', sp ? `One-minute rounds of math facts. Best score: ${sp}.` : 'One-minute rounds of math facts, against the clock.', 'timer', 350],
      ['words', '#/words', 'Math vocabulary', window.VOCAB && VOCAB.known() ? `${VOCAB.known()} terms learned. Flashcards with spaced review.` : 'Definitions of math terms in plain language, with flashcards.', 'book', 265],
      ['leap', '#/leap', 'Leap', leapLine(), 'flag', 140],
      ['balance', '#/balance', 'Balance', 'A seesaw puzzle: weight × distance must match on both sides.', 'balance', 95],
      ['prep', prepHref, 'Test preparation', f ? `A plan for your ${esc(f.book.short)} chapter ${f.chapter.n} test.` : 'A day-by-day plan for a CPM chapter test.', 'calendar', 190],
    ];
  }
  function leapLine() {
    let st = null;
    try { st = JSON.parse(localStorage.getItem('procademy.leap.v1') || 'null'); } catch (e) { st = null; }
    return st && st.level > 1 ? `A number-line puzzle. You are on level ${st.level}.` : 'A number-line puzzle: reach the target using every card once.';
  }
  /** a one-line example for each tool, opening it ready to go: [what, where] */
  function toolTry(key) {
    const D = window.DRAW, enc = encodeURIComponent;
    const T = {
      unlimited: ['practice on fractions', '#/unlimited/find/fractions'], calc: ['1/3 + 1/4', '#/calc/' + enc('1/3+1/4')],
      graph: ['y = x² − 4', D ? '#/graph/' + D.encode('y = x² - 4') : '#/graph'], numbers: ['the factors of 360', '#/numbers/360'],
      fractions: ['adding 2/3 + 1/4', '#/fractions/add'], integers: ['adding negatives', '#/integers/add'], shapes: ['the area of a circle', '#/shapes/circle'],
      percent: ['20% off a sale price', '#/percent/sale'], chance: ['rolling two number cubes', '#/chance/dice'], tiles: ['comparing two expressions', '#/tiles/compare'],
      steps: ['checking a homework answer', '#/steps'], words: ['the formula sheet', '#/words/formulas'], leap: ['today’s puzzle', '#/leap/daily'],
      balance: ['today’s puzzle', '#/balance/daily'], sprint: ['the times tables', '#/sprint/times'], data: ['the example data set', '#/data'], setup: ['a story about saving money', '#/setup'],
      geometry: ['bisecting a segment', '#/geometry/construct'], measure: ['feet to meters', '#/measure/units'],
      ratios: ['cups of flour and cookies', '#/ratios'], clock: ['setting the time', '#/measure/clock'], money: ['making 87¢', '#/money'],
      blocks: ['building 1,234', '#/numbers/blocks'], times: ['the 7 times table', '#/numbers/table'],
    };
    return T[key] || null;
  }
  /** line drawings for tools that have no icon in the shared set */
  const TOOL_PICS = {
    ratios: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 12h18M9 5v14M15 5v14"/>',
    money: '<circle cx="9" cy="12" r="6"/><circle cx="16.5" cy="9.5" r="4.5"/><path d="M9 9.5v5M7.5 10.5h2.5a1 1 0 0 1 0 2H8a1 1 0 0 0 0 2h2.5"/>',
    blocks: '<rect x="3" y="11" width="9" height="9" rx="1"/><path d="M3 14h9M3 17h9M6 11v9M9 11v9"/><rect x="14" y="4" width="3" height="16" rx="1"/><path d="M14 8h3M14 12h3M14 16h3"/><rect x="19" y="17" width="3" height="3" rx=".6"/>',
    times: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17"/><path d="M11.2 11.2l1.6 1.6M12.8 11.2l-1.6 1.6"/>',
  };
  /* ---------- each tool's settings, kept on this device (a tool opens as it was left), and a short how-to ---------- */
  const PREF_KEY = 'procademy.toolprefs.v1';
  /** a tool's remembered settings; with patch, merges it in and saves */
  function toolPref(tool, patch) {
    let all;
    try { all = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch (e) { all = {}; }
    if (!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    const cur = all[tool] && typeof all[tool] === 'object' && !Array.isArray(all[tool]) ? all[tool] : {};
    if (!patch) return cur;
    all[tool] = Object.assign({}, cur, patch);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(all)); } catch (e) { /* a private window: nothing is kept */ }
    return all[tool];
  }
  /** three or four steps for each tool, folded away under its title */
  const GUIDES = {
    calc: ['Press the keys, or type on a keyboard. <b>enter</b> works it out, and the answer shows on the right.', 'Fractions stay exact: 1/3 + 1/4 is 7/12. <b>F ◂▸ D</b> switches an answer between a fraction and a decimal.', '<b>y=</b> then <b>graph</b> draws a graph; <b>trace</b> moves along it.', 'Beside the calculator: the answer in every form, each step, and your history to search.'],
    graph: ['Type an equation, such as <b>y = 2x + 1</b>, or tap a starter.', 'A letter set to a number, like <b>m = 2</b>, becomes a slider. Press its play button to watch it move.', 'Tap or click anywhere on the graph to read the point there. On a phone, pinch to zoom.', 'With the graph selected, the arrow keys trace a curve and + and − zoom.'],
    numbers: ['Type a whole number to see its factors, its factor tree and whether it is prime.', 'Type two or three numbers, like <b>12, 18</b>, for their GCF and LCM.', 'Further down: scientific notation, place value blocks and the multiplication table.'],
    measure: ['Choose what to measure, then the units to change from and to.', 'Type an amount: the answer shows with the conversion fact and the multiplication.', 'The star keeps a conversion you use often at the top.', 'The other tabs work with scale drawings and with clocks and time.'],
    data: ['Type or paste numbers, with spaces, commas or new lines between them.', 'Paste two columns from a spreadsheet to compare two sets.', 'Read the center and spread, then the dot plot, box plot, histogram and stem-and-leaf plot.', 'On the histogram, slide Bars to change how many bars there are and see the shape change.'],
    fractions: ['Choose an operation: add, subtract, multiply, divide, compare or simplify.', 'Type fractions like <b>3/4</b> or mixed numbers like <b>1 1/2</b>.', 'Follow the steps beside the picture. Compare takes a third fraction too.'],
    integers: ['Choose add, subtract, multiply or divide, then type two integers.', 'Press Next to move the tiles one step at a time.', 'A + tile and a − tile together make a zero pair, worth 0.', '“Build a number” is a free mat for making any number.'],
    shapes: ['Choose a shape, then type its measurements.', 'The shape is drawn to scale, with the formula and every step.', 'For a solid, press Fold it up under its net to see the net fold into the solid.'],
    geometry: ['Choose a mode: sketch, construct, transform, or one of the two games.', 'Pick a tool, then tap the grid. Points snap to where lines and circles cross.', 'The plotting game asks for points; the protractor game asks for angles.'],
    percent: ['Choose a kind of problem: a part, a percent, a whole, a sale, a bill, or more.', 'Type the numbers you know. The answer shows on a percent ruler, worked out three ways.', 'For a bill, type each price from the receipt and the tip and tax are worked out.'],
    chance: ['Choose an experiment: coins, number cubes, a spinner or marbles.', 'Run it 1, 10, 100 or 1,000 times and compare with what should happen.', 'Predict first to make a guess before 100 trials.'],
    tiles: ['Pick an equation, or enter your own, and its tiles are set out on the mat.', 'Make legal moves: take the same tile from both sides, or remove a zero pair.', 'Factoring mode arranges x², x and unit tiles into a rectangle, whose sides are the factors.'],
    steps: ['Type your first line, then each line of your working under it.', 'Each line is checked: a check mark means it still has the same solutions.', 'Or choose Solve, Simplify or Factor to see it done step by step.'],
    ratios: ['Type a ratio, like <b>3 : 5</b>, and name the two quantities.', 'Add rows by multiplying, dividing, or adding two rows together.', 'Type a number in any empty box to find the missing value.'],
    clock: ['Drag the hands, or use the buttons, to set a time.', 'The time shows in words and in digits, and how long until or since another time.', 'Play “Set the clock” to practice reading time.'],
    money: ['Tap coins and bills to add them to the counter.', 'The total shows as you go. Tap a coin on the counter to take it off.', 'Play “Make the amount” to build a price with the fewest coins.'],
    blocks: ['Type a number and press Build it, or use + and − under each place.', 'Trade 10 blocks for 1 of the next place, or break 1 into 10: the value stays the same.', 'Press Make a number for a number to build.'],
    times: ['Tap any answer to see it as rows of dots, with its fact family.', 'Choose a pattern, like square numbers, to light it up across the table.', 'Hide the answers to test yourself: tap a box to check it.'],
  };
  /** the how-to for a tool's page: folded until opened */
  const toolHow = key => (GUIDES[key] ? `<details class="tool-how"><summary>How to use this tool</summary><ol class="small">${GUIDES[key].map(t => `<li>${t}</li>`).join('')}</ol></details>` : '');
  tools.pref = toolPref; tools.how = toolHow; tools.GUIDES = GUIDES;
  const toolIcon = ic => (/^</.test(ic) ? `<svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ic}</svg>` : icon(ic, 22));
  const toolCard = ([key, href, t, sub, ic]) => { const tr = toolTry(key); return `<div class="card tool-card"><span class="tool-ic">${toolIcon(ic)}</span><span class="tool-text"><a class="tool" href="${href}"><b>${t}</b></a><span class="small muted">${sub}</span>${tr ? `<a class="tool-try" href="${tr[1]}">Try ${esc(tr[0])} →</a>` : ''}</span></div>`; };
  /* ---------- tools used lately, kept on this device ---------- */
  const TOOL_KEY = 'procademy.tools.v1', TOOL_RE = /^#\/(calc|graph|numbers|data|shapes|percent|leap|balance|fractions|integers|chance|tiles|steps|setup|sprint|words|unlimited|ratios|money|geometry|measure)(\/|$)/;
  const usedTools = () => { try { const v = JSON.parse(localStorage.getItem(TOOL_KEY) || '[]'); return Array.isArray(v) ? v.filter(k => typeof k === 'string') : []; } catch (e) { return []; } };
  window.addEventListener('hashchange', () => {
    const m = TOOL_RE.exec(location.hash); if (!m) return;
    try { localStorage.setItem(TOOL_KEY, JSON.stringify([m[1]].concat(usedTools().filter(k => k !== m[1])).slice(0, 8))); } catch (e) { /* fine */ }
  });
  /** the tools that fit what the learner is studying: their recent skills, their class lesson, their next skills */
  function studyTools() {
    const st = S.get(), out = new Map(), c = st.profile.cpm, f = c && A.cpmLesson(c.book, c.lesson);
    const ids = st.recent.filter(id => A.skills[id]).slice(0, 6);
    if (f) ids.push(...f.lesson.skills.filter(id => A.skills[id]));
    st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).forEach(co => { const n = E.courseOrder(co).find(id => S.skill(id).level < 3); if (n) ids.push(n); });
    const KEY_OF = { tiles: 'tiles', chance: 'chance', numbers: 'numbers', data: 'data', integers: 'integers', fractions: 'fractions', shapes: 'shapes', percent: 'percent', leap: 'leap' };
    ids.forEach(id => {
      const title = plain(A.skills[id].title), why = title;
      (toolLinks(id, title).match(/href="#\/([a-z]+)/g) || []).map(h => h.slice(8)).forEach(k => { if (KEY_OF[k] && !out.has(k)) out.set(k, why); });
      if (/graph|slope|linear|line|function|parabola|quadratic|system|inequalit|intercept/i.test(title) && !out.has('graph')) out.set('graph', why);
      if (/equation|solve|solving/i.test(title) && !out.has('steps')) out.set('steps', why);
    });
    return [...out.entries()].slice(0, 4);
  }
  /** the Tools page (#/tools): what fits your studies, what you used lately, then every tool in groups */
  function tools(root) {
    const by = Object.fromEntries(toolList().map(t => [t[0], t]));
    const study = studyTools(), studyKeys = study.map(x => x[0]);
    const used = usedTools().filter(k => by[k] && !studyKeys.includes(k)).slice(0, 4);
    const cardFor = (k, why) => toolCard(by[k]).replace('<a class="tool"', '<a class="tool again"').replace('</span></div>', why ? `<span class="tiny muted tool-why">For ${esc(why)}</span></span></div>` : '</span></div>');     // "again": the same tool is in its group below
    const groups = [['Calculators', ['calc', 'graph']], ['Numbers, fractions and ratios', ['fractions', 'integers', 'ratios', 'percent', 'numbers', 'measure']], ['Shapes, data and chance', ['shapes', 'geometry', 'data', 'chance']], ['Equations', ['tiles', 'steps', 'setup']], ['Time, money and place value', ['clock', 'money', 'blocks', 'times']], ['Practice and play', ['unlimited', 'leap', 'balance', 'sprint', 'words', 'prep']]];
    root.innerHTML = `<h1>Tools</h1><p class="muted" style="margin-top:-4px">Hands-on tools for working things out, exploring ideas and practicing.</p>
      ${study.length ? `<div class="section-title"><h2>For what you’re studying</h2></div><div class="grid tools fit">${study.filter(([k]) => by[k]).map(([k, why]) => cardFor(k, why)).join('')}</div>` : ''}
      ${used.length ? `<div class="section-title"><h2>Used recently</h2></div><div class="grid tools fit">${used.map(k => cardFor(k)).join('')}</div>` : ''}
      ${groups.map(([g, keys]) => `<div class="section-title"><h2>${g}</h2></div><div class="grid tools fit">${keys.filter(k => by[k]).map(k => toolCard(by[k])).join('')}</div>`).join('')}`;
    tutorCtx(null);
  }
  /** a small "What is this?" button that shows a sentence or two under it */
  const whatIs = (key, text) => `<button type="button" class="whatis-btn" data-whatis="${key}" aria-expanded="false" aria-controls="wi-${key}" aria-label="What is this?" title="What is this?">${icon('info', 15)}</button><span class="whatis-text" id="wi-${key}" hidden>${text}</span>`;
  function wireWhatIs(root) {
    root.querySelectorAll('[data-whatis]').forEach(b => b.addEventListener('click', () => {
      const t = root.querySelector('#wi-' + b.dataset.whatis); if (!t) return;
      t.hidden = !t.hidden; b.setAttribute('aria-expanded', String(!t.hidden));
    }));
  }
  /** one skill to try today that hasn't been tried yet: from the learner's first saved course, or their grade's */
  function somethingNew() {
    const st = S.get(), c = st.profile.enrolled.map(id => A.courseById(id)).filter(Boolean)[0] || (st.profile.grade != null ? A.courseById(COURSE_FOR[st.profile.grade]) : null);
    if (!c) return null;
    const open = E.courseOrder(c).filter(id => A.skills[id] && S.skill(id).tries === 0).slice(0, 5);
    if (!open.length) return null;
    const t = S.today(); let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return open[h % open.length];
  }
  /** what was done on one day of the week, for the week's dots */
  function dayDetail(iso) {
    const st = S.get(), d = st.days[iso], kept = ((st.savers && st.savers.used) || {})[iso];
    const when = new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    if (!d || !d.q) return `<b>${when}</b>: ${kept ? 'no practice, but a streak saver kept your streak.' : 'no practice.'}`;
    const from = new Date(iso + 'T00:00').getTime(), to = from + 864e5, ids = [];
    st.log.filter(e => e.t >= from && e.t < to).forEach(e => [e.skill].concat((e.changes || []).map(c => c.skillId)).forEach(id => { if (id && A.skills[id] && !ids.includes(id)) ids.push(id); }));
    return `<b>${when}</b>: ${plural(d.q, 'question')}, ${d.right || 0} right first time${ids.length ? `. Skills: ${ids.slice(0, 4).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${ids.length > 4 ? `, and ${ids.length - 4} more` : ''}` : ''}.`;
  }
  /** the best thing to do next, in a few words with a link: mistakes first, then reviews, then today's practice */
  function bestNext() {
    const st = S.get(), d = st.days[S.today()] || {}, missed = st.missed.length, due = E.dueSkills().length;
    if (missed) return `Best next: <a href="#/review">fix ${plural(missed, 'mistake')}</a>.`;
    if (due && !d.daily) return `Best next: <a href="#/daily">review ${plural(due, 'skill')}</a> in today’s practice.`;
    return '';
  }
  /** the one button at the top of Home: back to a set left halfway (at its question), else carry on with the last
      skill, else today's practice; with the course's progress */
  function continueTarget() {
    const st = S.get(), lastT = st.log[0] ? st.log[0].t : 0, ls = st.profile.lastSet;
    const held = Object.entries(pausedAll()).map(([key, v]) => ({ key, v })).concat(ls && ls.packed && ls.key ? [{ key: ls.key, v: ls.packed }] : [])
      .filter(x => x.v && stillGood(x.v) && x.v.t > lastT && Array.isArray(x.v.items) && x.v.i < x.v.items.length).sort((a, b) => b.v.t - a.v.t)[0];
    const withCourse = (o, sid) => { const w = sid && A.whereIs(sid); return w ? Object.assign(o, { course: w.course, pct: E.mastery(A.courseSkills(w.course)).pct }) : o; };
    if (held) {
      const sid = held.v.skillId || (held.v.items[held.v.i] || {}).skillId;
      return withCourse({ href: held.key, resume: held.key, label: 'Continue', sub: `${A.stripTags(held.v.title || (A.skills[sid] ? A.skills[sid].title : 'your set'))} · question ${held.v.i + 1} of ${held.v.items.length}` }, held.v.skillId);
    }
    const last = st.recent.find(id => A.skills[id] && A.whereIs(id) && S.skill(id).level < 4);
    if (last) return withCourse({ href: practiceHref(last), label: 'Continue', sub: A.stripTags(A.skills[last].title) }, last);
    if (E.dailyPlan().total && !(st.days[S.today()] || {}).daily) return { href: '#/daily', label: 'Start today’s practice', sub: '' };
    return null;
  }
  /** a set left halfway, kept for Home's Continue (profile.lastSet = { key, packed }), from a set's own address only */
  window.addEventListener('hashchange', ev => {
    const m = document.getElementById('main'), s = m && m.__session;
    let key = ''; try { key = new URL(ev.oldURL).hash; } catch (e) { key = ''; }
    if (!s || !/^#\/(practice\/[^/]+|daily|test\/[^/]+\/[^/]+)$/.test(key) || ['endless', 'placement', 'testout'].includes(s.kind) || !m.querySelector('.ex') || E.isDone(s) || !s.results.some(r => r && r.done)) return;
    try { S.setProfile({ lastSet: { key, packed: E.pack(s) } }); } catch (e) { /* the set just isn't kept */ }
  }, true);
  /** every mastered skill, by course (Home's tile links here) */
  function mastered(root) {
    const ids = Object.keys(S.get().skills).filter(id => A.skills[id] && A.whereIs(id) && S.skill(id).level === 4), by = {};
    ids.forEach(id => { const c = A.whereIs(id).course; (by[c.id] = by[c.id] || { c, ids: [] }).ids.push(id); });
    root.innerHTML = `<div class="crumbs"><a href="#/">Home</a> › <span>Mastered skills</span></div><h1>Mastered skills</h1>
      <p class="muted">${ids.length ? `${plural(ids.length, 'skill')} mastered. Each one still comes back now and then for a quick review, so it stays mastered.` : 'No mastered skills yet. A skill is mastered after a unit test, a course challenge or a mastery challenge goes well.'}</p>
      ${Object.values(by).map(x => `<div class="section-title"><h2>${esc(x.c.title)}</h2><span class="muted small">${plural(x.ids.length, 'skill')}</span></div><div class="card"><ul class="skills">${x.ids.map(id => skillRow(id, { where: A.whereIs(id).unit.title })).join('')}</ul></div>`).join('')}
      ${ids.length ? '' : '<div class="btn-row"><a class="btn primary" href="#/daily">Today’s practice</a><a class="btn" href="#/courses">Courses</a></div>'}`;
    tutorCtx(null);
  }
  /** every page in one place */
  function sitemap(root) {
    const st = S.get(), mine = st.profile.enrolled.map(id => id.startsWith('cpm:') ? A.cpmById(id.slice(4)) : A.courseById(id)).filter(Boolean);
    const group = (name, links) => `<section class="card tight sm-group"><h2>${name}</h2><ul>${links.map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul></section>`;
    root.innerHTML = `<div class="row between" style="flex-wrap:wrap;gap:10px;align-items:flex-end"><div><h1>All pages</h1><p class="muted" style="margin:0">Everything in Procademy, in one place.</p></div><button type="button" class="btn" id="tour-again">Take the 30-second tour</button></div>
      <div class="sitemap">
        ${group('Every day', [['#/', 'Home'], ['#/daily', 'Today’s practice'], ['#/unlimited/day', 'Problem of the day'], ['#/review', 'Your mistakes'], ['#/unlimited/quick', 'Five minutes of practice'], ['#/timer', 'Study timer']])}
        ${group('Practice', [['#/unlimited', 'Unlimited practice'], ['#/unlimited/picture', 'Questions like a picture'], ['#/unlimited/weak', 'Mix my weak skills'], ['#/warmup', 'Mental math warm-up'], ['#/weekly', 'This week’s challenge'], ['#/sprint', 'Speed sprints'], ['#/words/cards', 'Math vocabulary flashcards'], ['#/summer', 'Summer review'], ['#/ready', 'Ready for high school']])}
        ${group('Courses', [['#/courses', 'All courses'], ['#/courses/cpm', 'CPM books']].concat(mine.map(c => [c.chapters ? '#/cpm/' + c.id : courseHref(c), c.title])))}
        ${group('Tools', toolList().map(t => [t[1], t[2]]))}
        ${group('Help', [['#/tutor', 'Tutor'], ['#/words', 'Math words'], ['#/steps', 'Step checker'], ['#/search/', 'Search']])}
        ${group('You', [['#/progress', 'Progress'], ['#/mastered', 'Mastered skills'], ['#/notes', 'My notes'], ['#/report', 'Progress report'], ['#/family', 'Family and class'], ['#/profile', 'Profile'], ['#/settings', 'Settings'], ['#/new', 'What’s new']])}
      </div>`;
    root.querySelector('#tour-again').addEventListener('click', () => { S.setProfile({ tourNext: true }); location.hash = '#/'; });
    tutorCtx(null);
  }
  /** a one-time note, after the first set: how points, the streak and badges work, and what the four levels mean */
  function howNote() {
    const st = S.get();
    if (st.profile.levelsSeen || (!st.log.length && !Object.values(st.skills).some(x => x.level > 0))) return '';
    return `<section class="card levels-note" id="levels-note"><div class="row between" style="gap:8px;flex-wrap:wrap"><h2 style="margin:0">How Procademy keeps track</h2><button type="button" class="btn sm ghost" id="levels-x">Got it</button></div>
      <ul class="how-list">${[['star', 'Points', 'Every right answer earns points (fewer after a hint), and a finished set or a level up earns extra.'], ['flame', 'Streak', 'Practice on days in a row to grow it. A streak saver covers a missed day.'], ['medal', 'Badges', 'Real milestones, like your first mastered skill. See them all on the Progress page.']].map(([ic, n, w]) => `<li><span class="how-ic">${icon(ic, 18)}</span><span><b>${n}</b> <span class="muted small">${w}</span></span></li>`).join('')}</ul>
      <h3 class="how-h">Skill levels</h3>
      <ul class="levels-list">${[[1, 'Attempted', 'You have tried it.'], [2, 'Familiar', '70% right the first time in a practice set.'], [3, 'Proficient', 'Every answer right the first time in a practice set.'], [4, 'Mastered', 'Right again later, in a unit test or a challenge.']].map(([l, n, w]) => `<li>${lvl(l)}<span><b>${n}</b> <span class="muted small">${w}</span></span></li>`).join('')}</ul></section>`;
  }
  /** the Home card for today's practice */
  /* ---------- every day: a short plan, and a welcome for someone new ---------- */
  const COURSE_FOR = ['math-k', 'math-1', 'math-2', 'math-3', 'math-4', 'math-5', 'math-6', 'math-7', 'math-8', 'algebra-1', 'geometry', 'algebra-2', 'precalculus'];
  const ordinal = g => (g === 0 ? 'Kindergarten' : `${g}${['th', 'st', 'nd', 'rd'][g % 10 > 3 || Math.floor(g / 10) === 1 ? 0 : g % 10]} grade`);
  /** a learner's grade ('0' to '12', 'adult', or '' for not set), kept in the profile; when no course is saved
      yet, that grade's course is saved too, so Today's practice has something to start from */
  function setGrade(v) {
    const adult = v === 'adult', grade = adult || v === '' || v == null ? null : Number(v);
    S.setProfile({ grade, adult });
    const course = adult ? 'math-6' : grade == null ? null : COURSE_FOR[grade];
    if (course && A.courseById(course) && !S.get().profile.enrolled.length) S.enroll(course, true);
  }
  /** someone who hasn't started yet: no grade, no saved course, no practice, and hasn't skipped the welcome; or
      someone partway through the welcome (profile.wlDraft), who may have tried a question already */
  const isNew = () => {
    const st = S.get(), p = st.profile;
    if (p.welcomed || (window.ACCOUNT && ACCOUNT.user())) return false;
    if (p.wlDraft) return true;
    return p.grade == null && !p.adult && !p.name.trim() && !p.enrolled.length && !p.cpm && !Object.keys(st.skills).length && !Object.values(st.days).some(d => d.q);
  };
  /* ---------- the welcome: what to do today, then who is learning, a daily goal, a name and a color ---------- */
  const AV_HUES = [215, 265, 330, 0, 25, 45, 140, 175];
  const GOALS = [[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']];
  const goalLine = n => `${n} questions a day, about ${Math.round(n / 2)} minutes`;
  const WL_MODES = [['practice', 'target', 'Practice at my level', 'A plan made for you, every day'], ['tutor', 'sparkle', 'Get homework help', 'Ask the tutor about any question'],
    ['cpm', 'bookmark', 'Find my class lesson', 'Type the CPM lesson number'], ['parent', 'person', 'Set it up for my child', 'Their grade, a goal and their progress']];
  /** the course for a level in the welcome ('7', 'adult-basics', …), or null */
  const levelCourse = level => level == null ? null : A.courseById(level.startsWith('adult') ? (level === 'adult-algebra' ? 'algebra-1' : 'math-6') : COURSE_FOR[Number(level)]);
  /** the grade most children of an age are in (5 is Kindergarten), or 'adult-basics' from 18 */
  const levelForAge = age => (age >= 18 ? 'adult-basics' : String(Math.max(0, Math.min(12, age - 5))));
  /** the browser's language, when it is one the menus come in (tests can set VIEWS._browserLang) */
  const browserLang = () => { const l = (window.VIEWS && VIEWS._browserLang) || ((navigator.languages && navigator.languages[0]) || navigator.language || ''); const k = String(l).slice(0, 2).toLowerCase(); return k === 'es' || k === 'hi' ? k : null; };
  const LANG_ASK = { es: ['¿Prefieres los menús y botones en español? Las lecciones y preguntas siguen en inglés.', 'Sí, en español', 'No, gracias'], hi: ['क्या आप मेनू और बटन हिन्दी में देखना चाहेंगे? पाठ और प्रश्न अंग्रेज़ी में ही रहेंगे।', 'हाँ, हिन्दी में', 'नहीं, धन्यवाद'] };
  /** CPM lessons with a typed number ("3.1.2", "lesson 3-1-2"), the learner's grade's book first */
  function lessonsNumbered(typed, grade) {
    const id = String(typed || '').toLowerCase().replace(/lesson|les\.?/g, '').trim().replace(/[\s,-]+/g, '.').replace(/^\.+|\.+$/g, '');
    if (!/^\d+(\.\d+){1,2}$/.test(id)) return [];
    const out = [];
    A.cpm.forEach(b => b.chapters.forEach(ch => ch.lessons.forEach(l => { if (l.id === id || (id.split('.').length === 2 && l.id.startsWith(id + '.'))) out.push({ b, ch, l }); })));
    return out.sort((x, y) => (x.b.grade === grade ? 0 : 1) - (y.b.grade === grade ? 0 : 1)).slice(0, 8);
  }
  /** a first visit: what to do today; for practice, who is learning (any age) and how much a day; then straight in */
  function welcomeCard() {
    const p = S.get().profile, dr = p.wlDraft || {}, mode = dr.mode || 'practice', goal = GOALS.some(g => g[0] === dr.goal) ? dr.goal : 20;
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => [String(g), ordinal(g)]).concat([['adult-basics', 'Adult: everyday math'], ['adult-algebra', 'Adult: algebra']]);
    const lang = !p.lang && !p.langAsked ? browserLang() : null, ask = lang && LANG_ASK[lang];
    const back = !!p.wlDraft && (dr.level != null || dr.tried || dr.mode);
    const hue = AV_HUES.includes(dr.hue) ? dr.hue : 215;
    return `<section class="card welcome" id="welcome" aria-labelledby="wl-h">
      <h2 id="wl-h">${back ? 'Welcome back' : 'Welcome to Procademy'}</h2>
      <p class="muted wl-intro">${back ? (dr.tried && dr.level == null ? 'You tried a question. Choose who is learning, and practice starts at the right level.' : 'Your choices are just as you left them. Pick up where you left off.') : 'Free math practice for every age, with a tutor that explains. A couple of quick choices and you’re ready to start.'}</p>
      ${ask ? `<div class="wl-lang" id="wl-lang" lang="${lang}"><p>${ask[0]}</p><div class="btn-row"><button type="button" class="btn sm primary" data-wl-lang="${lang}">${ask[1]}</button><button type="button" class="btn sm ghost" data-wl-lang="no">${ask[2]}</button></div></div>` : ''}
      <div class="field"><span class="label" id="wl-mode-h">What do you want to do today?</span>
        <div class="wl-modes" role="radiogroup" aria-labelledby="wl-mode-h">${WL_MODES.map(([k, ic, t, sub]) => `<button type="button" class="wl-mode${k === mode ? ' on' : ''}" role="radio" aria-checked="${k === mode}" data-mode="${k}"><span class="wl-mode-ic">${icon(ic, 20)}</span><span><b>${t}</b><span class="small muted">${sub}</span></span></button>`).join('')}</div></div>
      <div class="wl-pane" data-pane="practice parent"${mode === 'practice' || mode === 'parent' ? '' : ' hidden'}>
        <div class="field"><span class="label" id="wl-who">${mode === 'parent' ? 'Who are you setting it up for?' : 'Who is learning?'}</span><div class="wl-levels" role="radiogroup" aria-labelledby="wl-who">${levels.map(([v, l]) => `<button type="button" class="chip-btn${v === dr.level ? ' on' : ''}" role="radio" aria-checked="${v === dr.level}" data-level="${v}">${l}</button>`).join('')}</div>
          <div class="wl-age"><label for="wl-age">Or choose by age</label><select id="wl-age"><option value="">Age</option>${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(a => `<option value="${a}">${a === 4 ? '4 or younger' : a}</option>`).join('')}<option value="18">18 or older</option></select><span class="small muted" id="wl-age-note" aria-live="polite"></span></div></div>
        <div class="field"><label class="label" for="wl-goal">A daily goal</label>
          <div class="wl-goal-box"><p class="wl-goal-out" id="wl-goal-out"><b>${GOALS.find(g => g[0] === goal)[1]}</b> <span class="muted">${goalLine(goal)}</span></p>
            <input type="range" id="wl-goal" class="wl-range" min="0" max="3" step="1" value="${GOALS.findIndex(g => g[0] === goal)}" aria-valuetext="${GOALS.find(g => g[0] === goal)[1]}: ${goalLine(goal)}">
            <div class="wl-ticks">${GOALS.map(([n, l], k) => `<button type="button" class="wl-tick${n === goal ? ' on' : ''}" data-goal="${n}" style="--at:${k / 3}" aria-label="${l}: ${goalLine(n)}"><b>${l}</b><span>${Math.round(n / 2)} min</span></button>`).join('')}</div></div></div>
        <div class="wl-me"><span class="wl-av" id="wl-av">${window.ACCOUNT ? ACCOUNT.avatarHtml({ name: dr.name || '', avatar: { hue } }, false) : ''}</span>
          <label class="field wl-name"><span class="label" id="wl-name-l">${mode === 'parent' ? 'Their name' : 'Your name'} <span class="muted">(optional)</span></span><input id="wl-name" maxlength="40" autocomplete="off" value="${esc(dr.name || '')}" placeholder="For the greeting on Home"></label>
          <div class="field"><span class="label" id="wl-hue-l">A color</span><div class="av-hues" role="radiogroup" aria-labelledby="wl-hue-l">${AV_HUES.map(h => `<button type="button" role="radio" aria-checked="${h === hue}" aria-label="Color ${AV_HUES.indexOf(h) + 1}" class="av-hue${h === hue ? ' on' : ''}" data-hue="${h}" style="--av:${h}"></button>`).join('')}</div></div></div>
        <div class="wl-plan" id="wl-plan" hidden aria-live="polite"></div>
        <div class="btn-row wl-go-practice"${mode === 'parent' ? ' hidden' : ''}><button class="btn primary" id="wl-place" type="button"${dr.level == null ? ' disabled' : ''}>Find my starting point</button><button class="btn" id="wl-start" type="button"${dr.level == null ? ' disabled' : ''}>Start practicing now</button><button class="btn" id="wl-try" type="button">Try one question</button></div>
        <div class="btn-row wl-go-parent"${mode === 'parent' ? '' : ' hidden'}><button class="btn primary" id="wl-parent" type="button"${dr.level == null ? ' disabled' : ''}>Set it up</button></div>
        <p class="tiny muted wl-note" id="wl-note">${mode === 'parent' ? 'Then the Family and class page shows their progress, and lets you leave a note on their Home or assign practice.' : 'Finding your starting point takes a few minutes: one question from each unit, so practice begins where you need it. Or try one question first, before choosing anything.'}</p>
      </div>
      <div class="wl-pane" data-pane="tutor"${mode === 'tutor' ? '' : ' hidden'}>
        <label class="field"><span class="label">What’s the question?</span><textarea id="wl-ask" rows="2" maxlength="600" placeholder="Type or paste it here, or leave it empty and ask in the tutor"></textarea></label>
        <p class="small muted">The tutor explains step by step and checks your thinking. It helps you understand the answer instead of just giving it.</p>
        <div class="btn-row"><button class="btn primary" id="wl-tutor" type="button">Ask the tutor</button></div>
      </div>
      <div class="wl-pane" data-pane="cpm"${mode === 'cpm' ? '' : ' hidden'}>
        <label class="field"><span class="label">Which lesson is your class on?</span><input id="wl-lesson" inputmode="decimal" autocomplete="off" placeholder="The lesson number, like 3.1.2"></label>
        <div class="wl-lessons" id="wl-lessons" aria-live="polite"><p class="small muted">Type the number from the top of your CPM homework. Procademy finds the book, and Home then shows that lesson with practice and help.</p></div>
      </div>
      <div class="wl-foot"><p class="tiny muted">Your progress is saved on this device. To keep it safe and use it on other devices too, sign in on the Profile page.</p><button class="btn ghost sm" id="wl-skip" type="button">Look around first</button></div>
    </section>`;
  }
  function wireWelcome(root) {
    const w = root.querySelector('#welcome');
    if (!w) return;
    const d0 = S.get().profile.wlDraft || {};
    let mode = d0.mode || 'practice', level = d0.level == null ? null : String(d0.level), goal = GOALS.some(g => g[0] === d0.goal) ? d0.goal : 20, name = d0.name || '', hue = AV_HUES.includes(d0.hue) ? d0.hue : 215, tried = !!d0.tried;
    /** every choice is kept as it is made, so a welcome left halfway comes back as it was (profile.wlDraft) */
    const keep = () => S.setProfile({ wlDraft: { mode, level, goal, name: name.trim().slice(0, 40), hue, tried, t: Date.now() } });
    const $ = sel => w.querySelector(sel);
    const mark = (sel, on) => w.querySelectorAll(sel).forEach(x => { const yes = on(x); x.classList.toggle('on', yes); x.setAttribute('aria-checked', String(yes)); });
    /** the week ahead, as soon as a level is chosen: the course and a look at its skill map, the daily goal, the puzzle */
    const showPlan = () => {
      const box = $('#wl-plan'), course = levelCourse(level);
      if (level == null) { box.hidden = true; return; }
      const units = course ? course.units.filter(u => u.skills.some(id => A.skills[id])) : [];
      box.hidden = false;
      box.innerHTML = `<b>${mode === 'parent' ? 'Their plan for this week' : 'Your plan for this week'}</b><ul>
        <li>${course ? `Practice from <b>${esc(course.title)}</b>, starting where ${mode === 'parent' ? 'they need' : 'you need'} it` : 'Practice any skill you like'}</li>
        <li>${goalLine(goal)}, with a puzzle of the day at ${mode === 'parent' ? 'their' : 'your'} level</li>
        <li>5 days a week; a streak saver is earned for every 7 days in a row</li></ul>
        ${units.length ? `<details class="wl-map"><summary>Preview the skill map: ${plural(units.length, 'unit')}, ${plural(A.courseSkills(course).length, 'skill')}</summary>
          <ol class="wl-units">${units.map(u => { const n = u.skills.filter(id => A.skills[id]).length; return `<li><span class="t">${esc(u.title)}</span><span class="wl-cells" role="img" aria-label="${plural(n, 'skill')}">${'<i></i>'.repeat(n)}</span></li>`; }).join('')}</ol>
          <p class="tiny muted" style="margin:6px 0 0">Each square is a skill. It fills in as the skill moves up a level: Attempted, Familiar, Proficient, then Mastered.</p></details>` : ''}`;
    };
    const ready = () => { ['#wl-start', '#wl-place', '#wl-parent'].forEach(id => { $(id).disabled = level == null; }); showPlan(); };
    const setLevel = v => { level = v; mark('[data-level]', x => x.dataset.level === v); ready(); keep(); };
    w.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { setLevel(b.dataset.level); $('#wl-age').value = ''; $('#wl-age-note').textContent = ''; }));
    $('#wl-age').addEventListener('change', ev => {
      const a = Number(ev.target.value); if (!a) return;
      const v = levelForAge(a), label = v.startsWith('adult') ? 'an adult course' : ordinal(Number(v));
      setLevel(v);
      $('#wl-age-note').textContent = a >= 18 ? 'That’s Adult: everyday math. Choose Adult: algebra above for algebra.' : `${a === 4 ? 'Most 4- and 5-year-olds are' : `Most ${a}-year-olds are`} in ${label}. Choose another grade above if that’s not right.`;
    });
    /** the daily goal: a slider of four steps, each with its minutes, or a tap on a step's name */
    const setGoal = n => {
      goal = n; const g = GOALS.find(x => x[0] === n), k = GOALS.indexOf(g);
      $('#wl-goal').value = k; $('#wl-goal').setAttribute('aria-valuetext', `${g[1]}: ${goalLine(n)}`);
      $('#wl-goal-out').innerHTML = `<b>${g[1]}</b> <span class="muted">${goalLine(n)}</span>`;
      w.querySelectorAll('.wl-tick').forEach(b => b.classList.toggle('on', Number(b.dataset.goal) === n));
      showPlan(); keep();
    };
    $('#wl-goal').addEventListener('input', ev => setGoal(GOALS[Number(ev.target.value)][0]));
    w.querySelectorAll('[data-goal]').forEach(b => b.addEventListener('click', () => setGoal(Number(b.dataset.goal))));
    const drawAv = () => { if (window.ACCOUNT) $('#wl-av').innerHTML = ACCOUNT.avatarHtml({ name, avatar: { hue } }, false); };
    $('#wl-name').addEventListener('input', ev => { name = ev.target.value; drawAv(); keep(); });
    w.querySelectorAll('[data-hue]').forEach(b => b.addEventListener('click', () => { hue = Number(b.dataset.hue); mark('[data-hue]', x => x === b); drawAv(); keep(); }));
    /** what to do today: practice (the choices below), homework help, the class lesson, or a parent setting it up */
    const setMode = m => {
      mode = m; mark('[data-mode]', x => x.dataset.mode === m);
      w.querySelectorAll('.wl-pane').forEach(p => { p.hidden = !p.dataset.pane.split(' ').includes(m); });
      const parent = m === 'parent';
      $('#wl-who').textContent = parent ? 'Who are you setting it up for?' : 'Who is learning?';
      $('#wl-name-l').firstChild.textContent = parent ? 'Their name ' : 'Your name ';
      $('.wl-go-practice').hidden = parent; $('.wl-go-parent').hidden = !parent;
      $('#wl-note').textContent = parent ? 'Then the Family and class page shows their progress, and lets you leave a note on their Home or assign practice.' : 'Finding your starting point takes a few minutes: one question from each unit, so practice begins where you need it. Or try one question first, before choosing anything.';
      showPlan(); keep();
    };
    w.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode); const f = w.querySelector('.wl-pane:not([hidden]) input:not([type=range]), .wl-pane:not([hidden]) textarea'); if (f && b.dataset.mode !== 'practice' && b.dataset.mode !== 'parent') f.focus(); }));
    /** done with the welcome: keep the choices and save the course for the level chosen */
    const finish = extra => {
      const adult = level != null && level.startsWith('adult'), grade = level == null || adult ? null : Number(level), course = levelCourse(level);
      S.setProfile(Object.assign(level == null ? {} : { grade, adult }, { goal, welcomed: true, seenNews: NEWS, tourNext: true, wlDraft: null }, name.trim() ? { name: name.trim().slice(0, 40) } : {}, hue !== 215 || name.trim() ? { avatar: Object.assign({}, S.get().profile.avatar, { hue }) } : {}, extra || {}));
      if (course && !S.get().profile.enrolled.includes(course.id)) S.enroll(course.id, true);
      if (window.ACCOUNT) ACCOUNT.avatarButton();
      if (window.APP) APP.applyPrefs();
      return course;
    };
    /** to = 'place' for the starting-point check, 'try' for one question, else today's practice */
    const go = to => {
      if (to === 'try' && level == null) {
        // one question before choosing anything: from 5th grade, the middle of the courses; the welcome stays until the choices are made
        tried = true; keep();
        const first = E.courseOrder(A.courseById('math-5'))[0];
        location.hash = '#/unlimited/sample/' + encodeURIComponent(first);
        return;
      }
      if (level == null) return;
      const course = finish();
      // one question to try: the first skill of the course, as a one-question set
      const first = course && E.courseOrder(course)[0];
      location.hash = to === 'place' && course ? '#/placement/' + course.id : to === 'try' && first ? '#/unlimited/sample/' + encodeURIComponent(first) : '#/daily';
    };
    $('#wl-try').addEventListener('click', () => go('try'));
    $('#wl-start').addEventListener('click', () => go('practice'));
    $('#wl-place').addEventListener('click', () => go('place'));
    $('#wl-parent').addEventListener('click', () => {
      if (level == null) return;
      const who = name.trim();
      finish({ parentSetup: Date.now() });
      location.hash = '#/family';
      toast(`All set${who ? ' for ' + who : ''}. Here you can see progress, leave a note on Home and assign practice.`);
    });
    // homework help: straight to the tutor, with the question typed in, ready to send
    $('#wl-tutor').addEventListener('click', () => {
      const q = $('#wl-ask').value.trim();
      finish();
      location.hash = '#/tutor/new';
      if (!q) return;
      let n = 0;
      const put = () => { const t = document.getElementById('ai-text'); if (t) { t.value = q; t.dispatchEvent(new Event('input', { bubbles: true })); t.focus(); } else if (n++ < 40) setTimeout(put, 50); };
      setTimeout(put, 0);
    });
    // the class lesson from its number: the matching lessons in every CPM book, the learner's grade's book first
    const findLessons = () => {
      const box = $('#wl-lessons'), typed = $('#wl-lesson').value, grade = level == null || level.startsWith('adult') ? null : Number(level);
      const hits = lessonsNumbered(typed, grade);
      if (!typed.trim()) { box.innerHTML = '<p class="small muted">Type the number from the top of your CPM homework. Procademy finds the book, and Home then shows that lesson with practice and help.</p>'; return; }
      box.innerHTML = hits.length ? `<p class="small muted">${hits.length === 1 ? 'Is this your lesson?' : 'Which book is your class using?'}</p><ul class="wl-lesson-list">${hits.map(h => `<li><button type="button" class="wl-lesson" data-book="${h.b.id}" data-lesson="${esc(h.l.id)}"><b>${esc(h.b.title)}</b><span class="small muted">${esc(h.l.id)} ${esc(h.l.title || h.l.topic || '')}${h.b.grade === grade ? ' · your grade’s book' : ''}</span></button></li>`).join('')}</ul>`
        : `<p class="small muted">${/\d/.test(typed) ? 'No lesson has that number yet. Lesson numbers look like 3.1.2: the chapter, the section, then the lesson.' : 'Type the lesson number, like 3.1.2.'} <a href="#/cpm">Browse the CPM books</a></p>`;
      box.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => {
        const bk = A.cpmById(b.dataset.book);
        if (level == null && bk && bk.grade != null) level = String(bk.grade);
        finish({ cpm: { book: b.dataset.book, lesson: b.dataset.lesson } });
        if (!S.get().profile.enrolled.includes('cpm:' + b.dataset.book)) S.enroll('cpm:' + b.dataset.book, true);
        toast(`Lesson ${b.dataset.lesson} is now your class lesson.`);
        home(root);
      }));
    };
    $('#wl-lesson').addEventListener('input', findLessons);
    // the menus in the browser's language, if the visitor would like that (asked once)
    w.querySelectorAll('[data-wl-lang]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.wlLang;
      S.setProfile(v === 'no' ? { langAsked: true } : { lang: v, langAsked: true });
      const box = $('#wl-lang'); if (box) box.remove();
      if (v !== 'no' && window.APP) APP.applyPrefs();
    }));
    w.querySelector('#wl-skip').addEventListener('click', () => { S.setProfile({ welcomed: true, seenNews: NEWS, tourNext: true, wlDraft: null }); home(root); });
    if (level != null) ready();
  }
  /** the Monday of the week holding iso (weeks run Monday to Sunday) */
  const mondayOf = iso => S.dayShift(iso, -((new Date(iso + 'T12:00').getDay() + 6) % 7));
  /** days practiced this week, toward the weekly goal (profile.weekGoal, 5 unless changed) */
  function weekGoalLine() {
    const st = S.get(), goal = st.profile.weekGoal || 5, mon = mondayOf(S.today());
    let n = 0; for (let k = 0; k < 7; k++) { const d = st.days[S.dayShift(mon, k)]; if (d && d.q) n++; }
    return `<div class="week-goal"><span class="small"><b>This week: ${Math.min(n, 7)} of ${goal} days</b>${n >= goal ? ' · goal reached' : ''}</span><span class="pbar" role="img" aria-label="${n} of ${goal} days this week"><span style="width:${Math.min(100, n / goal * 100)}%"></span></span></div>`;
  }
  /** a new week: the last one in a few lines, until Got it (then not again until next week) */
  function weekRecap() {
    const st = S.get(), mon = mondayOf(S.today()), last = S.dayShift(mon, -7);
    if (st.profile.recapSeen === mon) return '';
    const days = []; for (let k = 0; k < 7; k++) { const d = st.days[S.dayShift(last, k)]; if (d && d.q) days.push(d); }
    if (!days.length) return '';
    const q = days.reduce((a, d) => a + d.q, 0), right = days.reduce((a, d) => a + (d.right || 0), 0), goal = st.profile.weekGoal || 5;
    const from = new Date(last + 'T00:00').getTime(), to = new Date(mon + 'T00:00').getTime(), ups = [];
    st.log.filter(e => e.t >= from && e.t < to).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && !ups.includes(ch.skillId)) ups.push(ch.skillId); }));
    const span = d => new Date(d + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return `<div class="card recap" id="recap"><div class="row between" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Your week in review</h2><button class="btn sm ghost" id="recap-x" type="button" data-week="${mon}">Got it</button></div>
      <p class="small muted" style="margin:2px 0 10px">${span(last)} to ${span(S.dayShift(mon, -1))}</p>
      <div class="recap-stats"><div><b>${days.length}</b><span>of 7 days</span></div><div><b>${q}</b><span>${q === 1 ? 'question' : 'questions'}</span></div><div><b>${q ? Math.round(right / q * 100) : 0}%</b><span>right first time</span></div><div><b>${ups.length}</b><span>skills leveled up</span></div></div>
      <p style="margin:10px 0 0">${days.length >= goal ? `You reached your goal of ${goal} days. Great work!` : `Your goal is ${goal} days a week, and this week is a fresh start.`}</p>
      ${ups.length ? `<p class="small" style="margin:6px 0 0">Leveled up: ${ups.slice(0, 3).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${ups.length > 3 ? `, and ${ups.length - 3} more` : ''}.</p>` : ''}
      <div class="btn-row"><a class="btn sm" href="#/report">See the full report</a></div></div>`;
  }
  /** the weekly rest day (0 is Sunday), or null: a rest day without practice keeps the streak going (STORE.streak) */
  const restDay = () => { const r = S.get().profile.restDay; return r == null || r === '' || isNaN(Number(r)) ? null : Number(r); };
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const longDay = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  /** class homework with a due date, until the day after it's due (profile.homework = { what, due, book, lesson }) */
  function homework() {
    const h = S.get().profile.homework, t = S.today();
    if (!h || !h.due || h.due < t) return null;
    const days = Math.round((new Date(h.due + 'T12:00') - new Date(t + 'T12:00')) / 864e5), f = h.book && h.lesson && A.cpmLesson(h.book, h.lesson);
    return { what: h.what || (f ? `${f.book.short} ${f.lesson.id}` : 'your homework'), when: days === 0 ? 'today' : days === 1 ? 'tomorrow' : longDay(h.due), lesson: f && f.lesson.skills.some(id => A.skills[id]) ? `#/cpm-practice/${f.book.id}/${encodeURIComponent(f.lesson.id)}` : null };
  }
  /** the problem of the day once solved: the question, its answer and how to get it */
  function podHow() {
    const t = S.today();
    let sid = null;
    try { const c = JSON.parse(localStorage.getItem('procademy.pod.v1') || '{}') || {}; if (c.day === t && A.skills[c.skill]) sid = c.skill; } catch (e) { sid = null; }
    if (!sid && window.UNLIMITED) { const pl = UNLIMITED.pool('day'); sid = pl && pl.skills[0]; }
    if (!sid) return '';
    let q;
    try { q = E.endless({ skills: [sid], seed: 'pod:' + t }).items[0].q; } catch (e) { return ''; }
    return `<details class="pod-how"><summary>How to solve it</summary><div class="question">${q.prompt}</div>${q.type === 'choice' ? `<ol class="we-choices" type="A">${q.choices.map(c => `<li>${c}</li>`).join('')}</ol>` : ''}
      <p class="small">The answer is <b>${q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q)}</b>.</p>${q.hints.map(h => `<div class="hint">${h}</div>`).join('')}</details>`;
  }
  /** the problem of the day's skill, kept while it's still to do (solving it can change which skill the day picks) */
  function podRemember() {
    if (!window.UNLIMITED) return;
    try { const t = S.today(), c = JSON.parse(localStorage.getItem('procademy.pod.v1') || '{}') || {}; if (c.day !== t) { const pl = UNLIMITED.pool('day'); if (pl) localStorage.setItem('procademy.pod.v1', JSON.stringify({ day: t, skill: pl.skills[0] })); } } catch (e) { /* fine */ }
  }
  /** the first week: four things worth trying once, ticked off as they happen, until all are done or a week has passed */
  function firstWeek() {
    const st = S.get(), p = st.profile, t = S.today();
    if (p.firstWeekDone) return '';
    const days = Object.keys(st.days).filter(k => st.days[k].q).sort();
    if (days.length && days[0] < S.dayShift(t, -6)) return '';
    const daily = k => { try { return Object.keys((JSON.parse(localStorage.getItem(k) || '{}') || {}).daily || {}).length > 0; } catch (e) { return false; } };
    const items = [['Try a practice set', st.log.length > 0, '#/daily'], ['Ask the tutor a question', !!st.flags.tutor, '#/tutor'], ['Solve a puzzle', !!st.flags.leap || daily('procademy.leap.v1') || (!!window.BALANCE && daily(BALANCE.KEY)), '#/leap/daily'], ['Set a daily goal', p.goal != null, '#/settings']];
    const n = items.filter(x => x[1]).length;
    if (n === items.length) return '';
    return `<div class="first-week" id="first-week"><span class="small fw-h"><b>Your first week</b> <span class="muted">${n} of ${items.length}</span></span>
      <ul>${items.map(([l, done, href]) => `<li class="${done ? 'done' : ''}">${done ? `${icon('check', 14)}<span>${l}<span class="visually-hidden"> (done)</span></span>` : `<i aria-hidden="true"></i><a href="${href}">${l}</a>`}</li>`).join('')}</ul>
      <button type="button" class="iconbtn sm" id="fw-x" aria-label="Hide the first-week list" title="Hide">✕</button></div>`;
  }
  /** today's plan: practice, a challenge that suits the learner's age, and the daily goal; with this week's days */
  function todayCard() {
    const st = S.get(), p = st.profile, t = S.today(), d = st.days[t] || {}, q = d.q || 0, g = window.BADGES ? BADGES.goal() : 20;
    const plan = E.dailyPlan(), streak = S.streak(), savers = st.savers || { n: 0, used: {} }, rd = restDay();
    const young = p.grade != null && p.grade < 3;
    let leapDone = false;
    try { leapDone = !!((JSON.parse(localStorage.getItem('procademy.leap.v1') || '{}') || {}).daily || {})[t]; } catch (e) { leapDone = false; }
    const balanceDay = !!window.BALANCE && (Date.UTC(...t.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) / 864e5) % 2 === 1;      // the puzzle of the day takes turns (by calendar day: no time zone or clock change can skip a turn)
    const factsAt = window.SPRINT ? SPRINT.deckState('add').last : 0, factsDone = !!factsAt && S.today(new Date(factsAt)) === t;
    const parts = [plan.due.length && `${plural(plan.due.length, 'skill')} to review before ${plan.due.length === 1 ? 'it slips' : 'they slip'}`, plan.missed.length && `${plural(plan.missed.length, 'mistake')} to correct`, plan.fresh.length && `${plural(plan.fresh.length, 'new skill')}`].filter(Boolean);
    const podDone = p.pod === t;
    if (!podDone) podRemember();
    const items = [
      { done: !!d.daily, icon: 'calendar', name: 'Today’s practice', sub: plan.total ? `${plural(plan.total, 'question')} · about ${Math.max(3, Math.round(plan.total * 0.7))} minutes${parts.length ? ' · ' + parts.join(' · ') : ''}` : 'Save a course to get a practice plan made for you.', href: plan.total ? '#/daily' : '#/courses', go: plan.total ? 'Start' : 'Choose a course', again: 'Practice again' },
      young ? { done: factsDone, icon: 'timer', name: 'Facts round', sub: 'One minute of addition facts. Try to beat your best.', href: '#/sprint/add', go: 'Play', again: 'Play again' }
        : balanceDay ? { done: BALANCE.dailyDone(), icon: 'balance', name: 'Puzzle of the day', sub: 'Today’s Balance puzzle: place every weight so the seesaw is level.', href: '#/balance/daily', go: 'Play', again: 'See it again' }
        : { done: leapDone, icon: 'flag', name: 'Puzzle of the day', sub: 'Today’s Leap puzzle: reach the flag using every card once.', href: '#/leap/daily', go: 'Play', again: 'See it again' },
      { done: podDone, icon: 'target', name: 'Problem of the day', sub: podDone ? 'Solved. Here’s how it works, step by step.' : 'One new question at your level, every day.', href: '#/unlimited/day', go: 'Solve', again: 'See it again', how: podDone ? podHow() : '' },
    ];
    items.sort((a, b) => a.done - b.done);          // what is still to do comes first
    const all = items.every(x => x.done) && q >= g;          // the daily goal is the ring just below the card
    const fresh = somethingNew();
    const week = [];
    for (let k = 6; k >= 0; k--) { const iso = S.dayShift(t, -k), day = st.days[iso], did = !!(day && day.q); week.push({ iso, did, kept: !!savers.used[iso], rest: !did && rd != null && new Date(iso + 'T12:00').getDay() === rd, today: k === 0, label: new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'narrow' }) }); }
    const restPick = `<label class="rest-pick">A rest day each week <select id="rest-day"><option value="">None</option>${[1, 2, 3, 4, 5, 6, 0].map(k => `<option value="${k}"${rd === k ? ' selected' : ''}>${WEEKDAYS[k]}</option>`).join('')}</select></label>`;
    const streakLine = (streak.days ? `${streak.days}-day streak` : 'No streak yet')
      + ` · <span>${savers.n ? `${savers.n} streak saver${savers.n > 1 ? 's' : ''}` : 'earn a streak saver with 7 days in a row'}</span> ${whatIs('streak', `Your streak is how many days in a row you have practiced. A streak saver keeps it going if you miss a day: you earn one for every 7 days in a row, and can hold 2. A rest day keeps it going too, once a week.${restPick}`)}`;
    // a busy day: today's goal halved with one tap, back to normal tomorrow
    const busy = p.busy && p.busy.day === t;
    const busyBit = busy ? `<span class="small muted busy-note">Busy day: today’s goal is ${g}. <button type="button" class="linkish" id="busy-undo">Undo</button></span>`
      : q < g && g > 5 ? `<button type="button" class="btn sm ghost busy-btn" id="busy">Busy day? Lower today’s goal to ${Math.max(5, Math.round(g / 10) * 5)}</button>` : '';
    // after today's practice: a look at tomorrow
    const tmr = S.dayShift(t, 1), dueT = Math.min(5, Object.keys(st.skills).filter(id => { const x = st.skills[id]; return A.skills[id] && A.whereIs(id) && x.tries && x.level && x.due && x.due <= tmr; }).length);
    const wc = myCourse(), wDone = wc && (p.weekly || {})[E.weekOf()], wRun = wc ? weeklyRun() : 0, wLeft = 7 - ((new Date(t + 'T12:00').getDay() + 6) % 7);
    const hw = homework(), test = testSoon(), grade = gradePicks();
    const notes = [
      fresh ? `<li class="today-new">${icon('sparkle', 16)}<span>Something new today: <a href="${skillHref(fresh)}">${A.skills[fresh].title}</a> <span class="muted">· ${esc(A.whereIs(fresh).course.title)}</span></span></li>` : '',
      wc ? `<li class="today-wk">${icon('trophy', 16)}<span>This week’s challenge: ${wDone ? `<a href="#/weekly">solved</a>${wRun > 1 ? ` <span class="muted">· ${wRun} weeks in a row</span>` : ''}` : `<a href="#/weekly">not solved yet</a> <span class="muted">· ${wLeft === 1 ? 'a new one tomorrow' : `a new one in ${wLeft} days`}</span>`}</span></li>` : '',
      d.daily ? `<li class="today-tmr">${icon('calendar', 16)}<span>Tomorrow: ${dueT ? `${plural(dueT, 'skill')} to review` : 'no reviews due'}${plan.fresh.length || fresh ? ', and something new' : ''}.</span></li>` : '',
      grade ? `<li class="small today-grade">${icon('star', 16)}<span>${grade}</span></li>` : '',
    ].filter(Boolean);
    return `<section class="card today-card daily-card${all ? ' all-done' : ''}" aria-labelledby="today-h">
      <div class="today-head"><div><h2 id="today-h">${all ? 'You’ve finished today’s plan' : 'Today'}</h2><p class="small muted" style="margin:0">${streakLine}</p></div>
        <ol class="week" aria-label="The last 7 days">${week.map(w => `<li class="${w.did ? 'did' : w.kept ? 'kept' : w.rest ? 'rest' : ''}${w.today ? ' today' : ''}"><button type="button" class="wk-day" data-day="${w.iso}" aria-label="${longDay(w.iso)}${w.did ? ': practiced' : w.kept ? ': kept by a streak saver' : w.rest ? ': your rest day' : ''}" aria-expanded="false"><span>${w.label}</span><i aria-hidden="true">${w.did ? icon('check', 14) : ''}</i></button></li>`).join('')}</ol></div>
      <div class="day-detail small" id="day-detail" hidden aria-live="polite"></div>
      <div class="today-row">${weekGoalLine()}${busyBit}</div>
      ${firstWeek()}
      <ul class="today-list">${items.map(x => `<li class="${x.done ? 'done' : ''}"><span class="today-ic">${icon(x.done ? 'check' : x.icon, 22)}</span>
        <div class="today-what"><b>${x.name}</b>${x.done ? ' <span class="chip up">Done</span>' : ''}<span class="small muted">${x.sub}</span>${x.how || ''}</div>
        ${x.href ? `<a class="btn sm${x.done ? '' : ' primary'}" href="${x.href}">${x.done ? x.again : x.go}</a>` : ''}</li>`).join('')}</ul>
      <div class="today-more"><span class="small muted">${all ? 'That’s everything for today. Want more?' : 'Want more?'}</span><a class="btn sm" href="#/unlimited/quick">${icon('timer', 18)} 5 minutes</a><a class="btn sm" href="#/unlimited">${icon('unlimited', 18)} Unlimited practice</a><a class="btn sm" href="#/unlimited/picture">${icon('image', 18)} Questions like a picture</a></div>
      ${notes.length ? `<ul class="today-notes small">${notes.join('')}</ul>` : ''}
      <div class="today-plan"><span class="small muted">Coming up</span>
        ${hw ? `<span class="plan-item small">${icon('bookmark', 16)}<span>Homework due <b>${esc(hw.when)}</b>: ${esc(hw.what)}${hw.lesson ? ` · <a href="${hw.lesson}">practice it</a>` : ''} · <button type="button" class="linkish" id="hw-clear">Handed in</button></span></span>` : `<button type="button" class="chip-btn" data-plan="hw" aria-expanded="false">${icon('plus', 14)} Homework due date</button>`}
        ${test ? `<span class="plan-item small">${icon('calendar', 16)}<span><a href="#/prep/${esc(p.prep.book)}/${esc(String(p.prep.ch))}">${esc(test.name)}</a>: <b>${esc(test.when)}</b></span></span>` : `<button type="button" class="chip-btn" data-plan="test" aria-expanded="false">${icon('plus', 14)} Test date</button>`}
      </div>
      <div class="plan-form" id="plan-form" hidden></div>
    </section>`;
  }
  /** the Today card's controls: a busy day, the rest day, the first week, homework and a test date */
  function wireToday(root) {
    const card = root.querySelector('.today-card');
    if (!card) return;
    const again = () => home(root);
    const busy = card.querySelector('#busy');
    if (busy) busy.addEventListener('click', () => {
      const g = window.BADGES ? BADGES.goal() : 20, low = Math.max(5, Math.round(g / 10) * 5);
      S.setProfile({ busy: { day: S.today(), goal: g }, goal: low });
      toast(`Today’s goal is ${low} questions. It goes back to ${g} tomorrow.`); again();
    });
    const undo = card.querySelector('#busy-undo');
    if (undo) undo.addEventListener('click', () => { const b = S.get().profile.busy; S.setProfile({ goal: b.goal, busy: null }); toast(`Today’s goal is ${b.goal} questions again.`); again(); });
    const rs = card.querySelector('#rest-day');
    if (rs) rs.addEventListener('change', () => {
      const v = rs.value === '' ? null : Number(rs.value);
      S.setProfile({ restDay: v });
      toast(v == null ? 'No rest day. Every day counts toward your streak.' : `${WEEKDAYS[v]} is your rest day. Your streak keeps going without practice that day.`);
      again(); const w = root.querySelector('[data-whatis="streak"]'); if (w) w.click();
    });
    const fx = card.querySelector('#fw-x');
    if (fx) fx.addEventListener('click', () => { S.setProfile({ firstWeekDone: true }); const f = card.querySelector('#first-week'); if (f) f.remove(); });
    const hc = card.querySelector('#hw-clear');
    if (hc) hc.addEventListener('click', () => { S.setProfile({ homework: null }); toast('Nice work. Homework handed in.'); again(); });
    // a homework due date, or a test date, in a small form under the card
    const form = card.querySelector('#plan-form');
    card.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      card.querySelectorAll('[data-plan]').forEach(x => x.setAttribute('aria-expanded', 'false'));
      if (open) { form.hidden = true; form.innerHTML = ''; b.focus(); return; }
      b.setAttribute('aria-expanded', 'true');
      const p = S.get().profile, t = S.today(), c = p.cpm && A.cpmLesson(p.cpm.book, p.cpm.lesson);
      if (b.dataset.plan === 'hw') {
        const next = (() => { let d = S.dayShift(t, 1); while ([0, 6].includes(new Date(d + 'T12:00').getDay())) d = S.dayShift(d, 1); return d; })();
        form.innerHTML = `<form class="plan-box" id="hw-form"><label class="field"><span class="label">What’s due</span><input id="hw-what" type="text" maxlength="60" value="${c ? esc(`${c.book.short} ${c.lesson.id}`) : ''}" placeholder="For example: Lesson 3.1.2, problems 1 to 10"></label>
          <label class="field"><span class="label">Due</span><input id="hw-due" type="date" min="${t}" value="${next}"></label>
          <div class="btn-row"><button class="btn sm primary" type="submit">Save</button><button class="btn sm ghost" type="button" data-plan-x>Cancel</button></div></form>`;
        form.querySelector('form').addEventListener('submit', ev => {
          ev.preventDefault();
          const due = form.querySelector('#hw-due').value, what = form.querySelector('#hw-what').value.trim();
          if (!due || due < t) { form.querySelector('#hw-due').focus(); return; }
          S.setProfile({ homework: Object.assign({ what: what || 'Homework', due }, c && (!what || what === `${c.book.short} ${c.lesson.id}`) ? { book: c.book.id, lesson: c.lesson.id } : {}) });
          toast(`Homework due ${longDay(due)}. It shows here until then.`); again();
        });
      } else {
        const books = A.cpm, b0 = (p.prep && A.cpmById(p.prep.book)) || (c && c.book) || A.cpmById((p.enrolled.find(id => id.startsWith('cpm:')) || '').slice(4)) || books.find(x => x.grade === p.grade) || books[0];
        const chOpts = bk => bk.chapters.map(ch => `<option value="${ch.n}"${c && c.book === bk && c.chapter.n === ch.n ? ' selected' : ''}>Chapter ${ch.n}: ${esc(ch.title)}</option>`).join('');
        form.innerHTML = `<form class="plan-box" id="test-form"><label class="field"><span class="label">Book</span><select id="ts-book">${books.map(x => `<option value="${x.id}"${x === b0 ? ' selected' : ''}>${esc(x.title)}</option>`).join('')}</select></label>
          <label class="field"><span class="label">Chapter</span><select id="ts-ch">${chOpts(b0)}</select></label>
          <label class="field"><span class="label">Test date</span><input id="ts-date" type="date" min="${S.dayShift(t, 1)}" value="${S.dayShift(t, 7)}"></label>
          <div class="btn-row"><button class="btn sm primary" type="submit">Make a plan</button><button class="btn sm ghost" type="button" data-plan-x>Cancel</button></div>
          <p class="tiny muted" style="margin:6px 0 0">Test prep works with the CPM books: a short set each day, a practice test the day before, and a warm-up on the day.</p></form>`;
        form.querySelector('#ts-book').addEventListener('change', ev => { form.querySelector('#ts-ch').innerHTML = chOpts(A.cpmById(ev.target.value)); });
        form.querySelector('form').addEventListener('submit', ev => {
          ev.preventDefault();
          const book = form.querySelector('#ts-book').value, ch = Number(form.querySelector('#ts-ch').value), date = form.querySelector('#ts-date').value;
          if (!date || date <= t) { form.querySelector('#ts-date').focus(); return; }
          S.setProfile({ prep: { book, ch, date, done: {}, tests: [] } });
          toast(`Chapter ${ch} test on ${longDay(date)}. Home now has a plan for each day until then.`); again();
        });
      }
      form.querySelector('[data-plan-x]').addEventListener('click', () => { form.hidden = true; form.innerHTML = ''; b.setAttribute('aria-expanded', 'false'); b.focus(); });
      form.hidden = false;
      const f = form.querySelector('input, select'); if (f) f.focus();
    }));
  }
  /** three things that suit the learner's grade, in one line on Home's Today card */
  const GRADE_PICKS = [
    [2, [['#/sprint/add', 'Addition facts'], ['#/leap', 'Leap'], ['#/shapes', 'Shapes']]],
    [4, [['#/sprint', 'Times tables'], ['#/fractions', 'Fraction lab'], ['#/balance', 'Balance']]],
    [5, [['#/fractions', 'Fraction lab'], ['#/shapes', 'Volume and area'], ['#/leap', 'Leap']]],
    [6, [['#/percent', 'Ratios and percents'], ['#/integers', 'Integer tiles'], ['#/data', 'Data and statistics']]],
    [7, [['#/integers', 'Integer tiles'], ['#/percent', 'Percents and money'], ['#/tiles', 'Algebra tiles']]],
    [8, [['#/graph', 'Graphing calculator'], ['#/geometry', 'Geometry lab'], ['#/numbers', 'Scientific notation']]],
    [12, [['#/graph', 'Graphing calculator'], ['#/steps', 'Solve step by step'], ['#/calc', 'Calculator']]],
  ];
  function gradePicks() {
    const p = S.get().profile;
    if (p.grade == null && !p.adult) return '';
    const picks = p.adult ? [['#/percent', 'Percents and money'], ['#/measure', 'Units and scale'], ['#/calc', 'Calculator']] : GRADE_PICKS.find(([upTo]) => p.grade <= upTo)[1];
    return `For ${p.adult ? 'adult learners' : ordinal(p.grade)}: ${picks.map(([h, t]) => `<a href="${h}">${t}</a>`).join(' <span class="muted" aria-hidden="true">·</span> ')}`;
  }
  /** the kinds of slip the coach recognizes (lib/coach.js), as Review and Progress name them */
  const SLIPS = { sign: 'Sign slips', flip: 'Flipped fractions', place: 'Decimal point', percent: 'Percent and decimal', early: 'Stopping a step early', echo: 'Answering with a given number', digits: 'Digits swapped', round: 'Rounding', one: 'Off by one', op: 'Wrong operation', double: 'Double or half' };
  /** Review: the questions missed, grouped by the kind of slip and by skill, each group practiced on its own; every
      mistake can be opened to see what was answered, the right answer and how to get it */
  /** the kinds of slip worth a drill: seen twice or more, in skills that can still be practiced (most first) */
  function drillKinds() {
    const ms = S.get().mistakes || {};
    return Object.keys(ms).filter(k => SLIPS[k] && ms[k].n >= 2 && Object.keys(ms[k].skills || {}).some(id => A.skills[id] && A.whereIs(id))).sort((a, b) => ms[b].n - ms[a].n).slice(0, 6);
  }
  /** a drill: six new questions from the skills where this slip happened, the skills with it most often first */
  function drill(root, kind) {
    const m = (S.get().mistakes || {})[kind];
    if (!m) return review(root);
    const ids = Object.keys(m.skills).filter(id => A.skills[id] && A.whereIs(id)).sort((a, b) => m.skills[b] - m.skills[a]).slice(0, 4);
    if (!ids.length) return review(root);
    const tip = (window.COACH && COACH.TIPS && COACH.TIPS[kind]) || '';
    const go = () => exercise(root, E.start('mix', { skills: ids, n: 6, title: 'Drill: ' + SLIPS[kind] }), { back: '#/review', backLabel: 'Review', again: go, againLabel: 'Drill again', banner: tip ? `<b>Watch for it:</b> ${esc(tip)}` : '' });
    go(); window.scrollTo(0, 0);
  }
  function review(root) {
    tutorCtx(null);
    const missed = S.get().missed.filter(m => A.skills[m.skill] && A.whereIs(m.skill));
    if (!missed.length) { root.innerHTML = `<h1>Review</h1><div class="card empty">There is nothing to review. Every question you missed has been corrected.<div class="btn-row" style="justify-content:center"><a class="btn" href="#/">Home</a>${drillKinds().map(k => `<button class="btn" type="button" data-drill="${k}">Drill: ${SLIPS[k]}</button>`).join('')}</div></div>`; root.querySelectorAll('[data-drill]').forEach(b => b.addEventListener('click', () => drill(root, b.dataset.drill))); return; }
    const groups = [];
    const bySlip = {};
    missed.forEach(m => { if (m.slip && SLIPS[m.slip]) (bySlip[m.slip] = bySlip[m.slip] || []).push(m); });
    Object.entries(bySlip).sort((x, y) => y[1].length - x[1].length).forEach(([k, list]) => groups.push({ key: 'slip:' + k, title: SLIPS[k], line: (window.COACH && COACH.TIPS && COACH.TIPS[k]) || '', list }));
    const bySkill = {};
    missed.forEach(m => (bySkill[m.skill] = bySkill[m.skill] || []).push(m));
    const skills = Object.entries(bySkill).sort((x, y) => y[1].length - x[1].length);
    const ROUND = 20;
    const run = list => { const go = () => { const left = S.get().missed.filter(m => list.some(x => x.skill === m.skill && x.seed === m.seed)); if (!left.length) return review(root); exercise(root, E.start('review', { items: left, n: Math.min(ROUND, left.length) }), { back: '#/review', backLabel: 'Review', again: go, againLabel: 'Keep reviewing these' }); }; go(); };
    const card = (key, title, line, n, extra) => `<li class="rv-group"><div class="rv-text"><b>${title}</b><span class="muted small">${plural(n, 'question')}${extra || ''}</span>${line ? `<p class="small" style="margin:4px 0 0">${esc(line)}</p>` : ''}</div><button class="btn sm primary" type="button" data-rv="${esc(key)}">Practice these</button></li>`;
    const answerOf = q => (q.type === 'choice' ? q.choices[q.answerIndex] : A.answerText(q));
    const clipQ = t => (t.length > 110 ? t.slice(0, 107).replace(/\s+\S*$/, '') + '…' : t);
    const item = m => {
      const q = A.question(m.skill, m.seed), i = missed.indexOf(m);
      return `<li class="rv-item"><details><summary><span class="rv-q">${esc(clipQ(plain(q.prompt)))}</span>${m.wins ? '<span class="chip">Right once</span>' : ''}</summary>
        <div class="rv-detail"><div class="question">${q.prompt}</div>
          <p class="small">${m.said ? `You answered <b>${esc(m.said)}</b>. ` : ''}The answer is <b>${answerOf(q)}</b>.${m.wins ? ' Get it right once more to clear it.' : ''}</p>
          <div class="rv-how"><div class="small"><b>How to get it</b></div>${q.hints.map(h => `<div class="hint">${h}</div>`).join('')}</div>
          <div class="btn-row"><button class="btn sm primary" type="button" data-one="${i}">Practice this one</button><button class="btn sm" type="button" data-ok="${i}">I understand now</button></div></div></details></li>`;
    };
    const days = Math.ceil(missed.length / 10);
    root.innerHTML = `<h1>Review your mistakes</h1>
      <p class="muted">${plural(missed.length, 'question')} to fix. A question leaves the list after you get it right ${E.WINS_TO_CLEAR === 2 ? 'twice' : E.WINS_TO_CLEAR + ' times'}, or when you mark it “I understand now”.</p>
      ${missed.length >= 10 ? `<div class="card rv-day"><b>Plan a review day</b><p class="small muted" style="margin:2px 0 0">That’s a lot to fix at once. Set aside a day this week: ${days === 1 ? 'one round of practice' : `${days} rounds of 10`} clears them, and each round takes about ten minutes.</p></div>` : ''}
      <div class="btn-row"><button class="btn primary" type="button" data-rv="all">Fix my mistakes${missed.length > ROUND ? ` (${ROUND} at a time)` : ''}</button></div>
      ${groups.length ? `<div class="card" style="margin-top:16px"><h2>By kind of mistake</h2><ul class="rv-groups">${groups.map(g => card(g.key, g.title, g.line, g.list.length)).join('')}</ul></div>` : ''}
      ${drillKinds().length ? `<div class="card rv-drills" style="margin-top:16px"><h2>Drills</h2><p class="muted small" style="margin-top:-2px">Fresh questions from the skills where a kind of slip happens, with a tip to watch for it.</p><div class="btn-row">${drillKinds().map(k => `<button class="btn sm" type="button" data-drill="${k}">${SLIPS[k]} <span class="muted small">· 6 questions</span></button>`).join('')}</div></div>` : ''}
      <div class="card" style="margin-top:16px"><h2>Each mistake, by skill</h2><p class="muted small" style="margin-top:-2px">Open a question to see what you answered, the right answer and how to get it.</p>
        ${skills.slice(0, 12).map(([id, list]) => `<section class="rv-skill"><ul class="rv-groups">${card('skill:' + id, A.skills[id].title, '', list.length, ` · ${esc(A.whereIs(id).course.title)} · <a href="${skillHref(id)}">See the lesson</a>`)}</ul>
          <ul class="rv-list">${list.slice(0, 6).map(item).join('')}</ul>${list.length > 6 ? `<p class="small muted rv-more">And ${list.length - 6} more in this skill.</p>` : ''}</section>`).join('')}</div>`;
    root.querySelectorAll('[data-rv]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.rv;
      run(k === 'all' ? missed : k.startsWith('slip:') ? bySlip[k.slice(5)] : bySkill[k.slice(6)]);
    }));
    root.querySelectorAll('[data-one]').forEach(b => b.addEventListener('click', () => run([missed[Number(b.dataset.one)]])));
    root.querySelectorAll('[data-drill]').forEach(b => b.addEventListener('click', () => drill(root, b.dataset.drill)));
    root.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', () => {
      const m = missed[Number(b.dataset.ok)];
      S.clearMissed(m.skill, m.seed);
      toast('Taken off your list. Nice work.');
      const y = window.scrollY; review(root); window.scrollTo(0, y);
    }));
  }

  /* ---------- progress ---------- */
  function progress(root) {
    const s = S.get(), st = S.streak();
    const allIds = Object.keys(A.skills);
    const levels = [0, 0, 0, 0, 0];
    allIds.forEach(id => { levels[S.skill(id).level] += 1; });
    const totalQ = Object.values(s.days).reduce((a, d) => a + d.q, 0), totalRight = Object.values(s.days).reduce((a, d) => a + d.right, 0);
    const activeDays = Object.values(s.days).filter(d => d.q).length;
    // heatmap: 26 weeks of Monday-first columns ending this week
    const today = S.today();
    const dow = (new Date(today + 'T12:00').getDay() + 6) % 7;         // 0 = Monday
    const start = S.dayShift(today, -(dow + 7 * 25));
    let cells = '';
    for (let k = 0; k < 26 * 7; k++) {
      const iso = S.dayShift(start, k);
      const d = s.days[iso];
      const q = d ? d.q : 0;
      const cls = !q ? '' : q < 5 ? 'h1' : q < 15 ? 'h2' : q < 30 ? 'h3' : 'h4';
      cells += `<span class="${cls}" title="${iso}: ${plural(q, 'question')}"${iso > today ? ' style="visibility:hidden"' : ''}></span>`;
    }
    const missed = s.missed.filter(m => A.skills[m.skill]);
    const kinds = { topic: 'Practice on a topic', practice: 'Practice', 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', mix: 'CPM practice', review: 'Review', daily: 'Today’s practice', 'chapter-test': 'Practice test', sprint: 'Speed sprint', cards: 'Flashcards', setup: 'Word problems', tiles: 'Algebra tiles', placement: 'Starting-point check' };
    const COACH_TIPS = () => (window.COACH ? COACH.TIPS : {});
    root.innerHTML = `
      <div class="row between" style="flex-wrap:wrap;gap:8px"><h1 style="margin:0">Progress</h1><div class="btn-row" style="margin:0"><a class="btn sm" href="#/notes">My notes</a><a class="btn sm" href="#/report" id="pr-print">Print a report</a>${window.FAMILY ? '<button class="btn sm" type="button" id="pr-share">Share with a parent</button>' : ''}<a class="btn sm" href="#/family">Family and class</a></div></div>
      ${weekCard()}
      ${nextCard()}
      ${readyCard()}
      ${trendCard()}
      ${timeCard()}
      ${strongWeak()}
      ${dueWeek()}
      ${testsCard()}
      <div class="section-title"><h2>All time</h2></div>
      <div class="tiles">
        <div class="tile"><div class="big">${st.days}</div><div class="label">${st.days === 1 ? 'day' : 'days'} in a row</div></div>
        <div class="tile"><div class="big">${fmt(s.points)}</div><div class="label">points</div></div>
        <div class="tile"><div class="big">${fmt(totalQ)}</div><div class="label">questions answered</div></div>
        <div class="tile"><div class="big">${totalQ ? Math.round(totalRight / totalQ * 100) : 0}%</div><div class="label">correct on the first try</div></div>
        <div class="tile"><div class="big">${activeDays}</div><div class="label">days practiced</div></div>
      </div>
      <div class="pr-two"><div><div class="section-title"><h2>Activity</h2><span class="muted small">last 26 weeks</span></div>
      <div class="card"><div class="heat" aria-label="Questions answered per day">${cells}</div></div></div>
      <div><div class="section-title"><h2>Mastery</h2></div>
      <div class="card">${legend(levels)}<div style="margin-top:10px">${mbar(allIds)}</div>
${(() => {
          // the courses being learned (saved, or with any progress) first; the rest behind All courses
          const row = c => { const ids = A.courseSkills(c), m = E.mastery(ids); return `<tr><td><a href="${courseHref(c)}">${esc(c.title)}</a></td><td style="width:40%"><div class="row"><div class="pbar" style="flex:1" ${courseVar(c)}><span style="width:${m.pct}%"></span></div><b class="small">${m.pct}%</b></div></td><td class="small muted">${m.counts[4]} / ${m.counts[3]} / ${m.counts[2]} / ${m.counts[1]}</td></tr>`; };
          const head = '<thead><tr><th>Course</th><th>Mastery</th><th class="small">M / P / F / A</th></tr></thead>';
          const mine = A.courses.filter(c => s.profile.enrolled.includes(c.id) || A.courseSkills(c).some(id => S.skill(id).level > 0)), rest = A.courses.filter(c => !mine.includes(c));
          return (mine.length ? `<table class="plain" style="margin-top:14px">${head}<tbody>${mine.map(row).join('')}</tbody></table>` : '')
            + (rest.length ? `<details class="all-courses" ${mine.length ? '' : 'open'}><summary>${mine.length ? `All courses (${rest.length} more)` : 'All courses'}</summary><table class="plain">${head}<tbody>${rest.map(row).join('')}</tbody></table></details>` : '');
        })()}</div></div></div>
      ${masteryMap()}
      ${(() => {
        const ms = Object.entries(s.mistakes || {}).filter(([k, m]) => m.n && (COACH_TIPS()[k])).sort((a, b) => b[1].n - a[1].n);
        if (!ms.length) return '';
        const total = ms.reduce((a, [, m]) => a + m.n, 0);
        const names = SLIPS;
        return `<div class="section-title"><h2>Your mistake patterns</h2></div>
          <div class="card"><p class="muted small" style="margin:0 0 10px">What the coach noticed in your wrong answers. Knowing your usual slip is half of fixing it.</p>
          <ul class="patterns">${ms.slice(0, 6).map(([k, m]) => { const top = Object.entries(m.skills || {}).sort((a, b) => b[1] - a[1]).map(([id]) => id).filter(id => A.skills[id] && A.whereIs(id))[0]; return `<li><div class="row between"><b>${names[k] || k}</b><span class="muted small">${plural(m.n, 'time')}</span></div><div class="pbar"><span style="width:${Math.round(m.n / total * 100)}%"></span></div><p class="small" style="margin:6px 0 0">${esc(COACH_TIPS()[k])}${top ? ` Most often in <a href="${skillHref(top)}">${A.skills[top].title}</a>.` : ''}</p></li>`; }).join('')}</ul></div>`;
      })()}
      ${window.BADGES ? BADGES.shelf() : ''}
      ${window.CHALLENGE ? CHALLENGE.card() : ''}
      <div class="section-title"><h2>Mistakes to review</h2></div>
      <div class="card">${missed.length ? `<div class="row between"><span>${plural(missed.length, 'question')} you missed, rebuilt exactly as asked. Get one right and it comes off the list.</span><a class="btn primary sm" href="#/review">Review now</a></div>` : '<p class="muted" style="margin:0">Nothing waiting. Missed questions will collect here.</p>'}</div>
      <div class="section-title"><h2>Recent activity</h2></div>
      <div class="card">${s.log.length ? `<ul class="log">${s.log.slice(0, 8).map(e => {
        const what = e.title ? esc(e.title) : e.skill && A.skills[e.skill] ? A.skills[e.skill].title : e.unit && A.unitById(e.course, e.unit) ? A.unitById(e.course, e.unit).title : e.course && A.courseById(e.course) ? A.courseById(e.course).title : '';
        return `<li><span class="when">${ago(e.t)}</span><span><b>${kinds[e.kind] || e.kind}</b>${what ? ' · ' + what : ''} <span class="muted">${e.right}/${e.total}</span>${(e.changes || []).map(ch => ` <span class="chip ${ch.to > ch.from ? 'up' : 'down'}">${A.LEVELS[ch.to]}</span>`).join('')}</span><span class="pts">+${e.pts}</span></li>`; }).join('')}</ul>` : '<p class="muted" style="margin:0">Nothing yet. Your practice will show up here.</p>'}</div>`;
    const heat = root.querySelector('.heat'); if (heat) heat.scrollLeft = heat.scrollWidth;
    root.querySelectorAll('[data-time]').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('[data-time]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)); });
      root.querySelectorAll('[data-time-view]').forEach(v => { v.hidden = v.dataset.timeView !== b.dataset.time; });
    }));        // a narrow screen shows the latest weeks, not the oldest
    // a report printed in one tap, and the read-only progress link for a parent
    root.querySelector('#pr-print').addEventListener('click', () => { try { sessionStorage.setItem('procademy.printReport', '1'); } catch (e) { /* the report opens; print from there */ } });
    const sh = root.querySelector('#pr-share');
    if (sh) sh.addEventListener('click', () => { const url = FAMILY.link(); FAMILY._last = url; try { navigator.clipboard.writeText(url).then(() => toast('Progress link copied. Send it to a parent or teacher.'), () => toast('The link couldn’t be copied.')); } catch (e) { toast('The link couldn’t be copied.'); } });
  }

  /* ---------- Home: a note from a parent, and practice they assigned (set on the Family and class page) ---------- */
  function parentStrip() {
    const p = S.get().profile, note = p.parentNote && p.parentNote.text && !p.parentNote.seen ? p.parentNote : null;
    const work = window.FAMILY ? FAMILY.assignedOf(S.get()).filter(a => !a.done && !a.hidden) : [];
    if (!note && !work.length) return '';
    const a = work[0];
    return `<section class="card parent-strip" aria-label="From a parent">
      ${note ? `<div class="ps-row ps-note"><span class="ps-ic">${icon('person', 18)}</span><p><b>${note.by ? 'From ' + esc(note.by) : 'A note for you'}:</b> <span data-raw>${esc(note.text)}</span></p>
        <div class="ps-replies" role="group" aria-label="Reply"><button class="btn sm" type="button" id="ps-seen" data-reply="Got it, thanks.">Got it, thanks</button><button class="btn sm ghost" type="button" data-reply="Will do.">Will do</button><button class="btn sm ghost" type="button" id="ps-write" aria-expanded="false" aria-controls="ps-form">Reply</button></div></div>
        <form class="ps-form" id="ps-form" hidden><label class="visually-hidden" for="ps-text">Your reply</label><input id="ps-text" type="text" maxlength="120" autocomplete="off" placeholder="Write a short reply"><button class="btn sm primary" type="submit">Send</button></form>` : ''}
      ${a ? `<div class="ps-row"><span class="ps-ic">${icon('target', 18)}</span><p><b data-raw>${esc(a.title)}</b> <span class="small muted">${a.got} of ${a.ids.length} ${a.ids.length === 1 ? 'skill' : 'skills'} practiced${work.length > 1 ? ` · ${work.length - 1} more assigned` : ''}</span></p><a class="btn sm primary" href="${FAMILY.setHash(a.ids, a.title)}">Start</a></div>` : ''}
    </section>`;
  }
  /** a parent's note: put away with a quick reply (Got it, thanks · Will do) or a short one written here, kept with
      the note (parentNote.reply) for the parent to see */
  function wireParentStrip(root) {
    const strip = root.querySelector('.parent-strip');
    if (!strip) return;
    const reply = text => {
      const n = S.get().profile.parentNote;
      S.setProfile({ parentNote: Object.assign({}, n, { seen: true }, text ? { reply: { text: String(text).slice(0, 120), t: Date.now() } } : {}) });
      strip.querySelectorAll('.ps-note, .ps-form').forEach(x => x.remove());
      if (!strip.querySelector('.ps-row')) strip.remove();
      if (text) toast(`Reply saved with the note${n && n.by ? ` for ${n.by}` : ''}.`);
    };
    strip.querySelectorAll('[data-reply]').forEach(b => b.addEventListener('click', () => reply(b.dataset.reply)));
    const w = strip.querySelector('#ps-write'), f = strip.querySelector('#ps-form');
    if (w) w.addEventListener('click', () => { f.hidden = !f.hidden; w.setAttribute('aria-expanded', String(!f.hidden)); if (!f.hidden) f.querySelector('input').focus(); });
    if (f) f.addEventListener('submit', ev => { ev.preventDefault(); const t = f.querySelector('input').value.trim(); if (!t) { f.querySelector('input').focus(); return; } reply(t); });
  }

  /* ---------- progress: this week, what to practice next and why, and how it is going over the weeks ---------- */
  /** this week (Monday on): days against the weekly goal, questions, first-try rights, and what leveled up */
  function weekCard() {
    const s = S.get(), mon = mondayOf(S.today()), goal = s.profile.weekGoal || 5, since = new Date(mon + 'T00:00').getTime();
    let days = 0, q = 0, right = 0;
    let mins = 0;
    for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(mon, k)]; if (d && d.q) { days++; q += d.q; right += d.right || 0; mins += S.minutes(d); } }
    const ups = [];
    s.log.filter(e => e.t >= since).forEach(e => (e.changes || []).forEach(ch => { if (ch.to > ch.from && A.skills[ch.skillId] && A.whereIs(ch.skillId)) { const u = ups.find(x => x.id === ch.skillId); if (u) u.to = Math.max(u.to, ch.to); else ups.push({ id: ch.skillId, to: ch.to }); } }));
    return `<section class="card pr-week" aria-labelledby="pr-week-h"><h2 id="pr-week-h">This week</h2>
      <div class="pr-week-stats"><div><b>${days} of ${goal}</b><span>days practiced${days >= goal ? ' · goal reached' : ''}</span></div><div><b>${mins}</b><span>${mins === 1 ? 'minute' : 'minutes'} practicing</span></div><div><b>${q}</b><span>${q === 1 ? 'question' : 'questions'}</span></div><div><b>${q ? Math.round(right / q * 100) : 0}%</b><span>right the first time</span></div><div><b>${ups.length}</b><span>${ups.length === 1 ? 'skill' : 'skills'} leveled up</span></div></div>
      ${ups.length ? `<h3>You got better at</h3><ul class="pr-ups">${ups.slice(0, 6).map(u => `<li>${lvl(u.to)}<a href="${skillHref(u.id)}">${A.skills[u.id].title}</a><span class="chip fit-mine">${A.LEVELS[u.to]}</span><a class="btn sm" href="${practiceHref(u.id)}">Practice</a></li>`).join('')}</ul>`
        : `<p class="muted small" style="margin:10px 0 0">${q ? 'Keep going: a skill moves up a level after a practice set with most answers right.' : 'No practice yet this week. Today’s practice is a good start.'}</p>`}</section>`;
  }
  /** what to practice next, most useful first, each with the reason: a coming test, a missed question, a weak skill, a review, the next new skill */
  function nextUp() {
    const s = S.get(), out = [], seen = new Set();
    const add = (id, why) => { if (out.length < 5 && id && A.skills[id] && A.whereIs(id) && !seen.has(id)) { seen.add(id); out.push({ id, why }); } };
    const t = testSoon();
    if (t) [...t.ids].filter(id => S.skill(id).level < 3).slice(0, 2).forEach(id => add(id, `On your ${t.name}, ${t.when}`));
    s.missed.map(m => m.skill).forEach(id => add(id, 'You missed a question here'));
    Object.keys(s.skills).filter(id => s.skills[id].tries >= 3 && s.skills[id].right / s.skills[id].tries < 0.6).forEach(id => add(id, 'Fewer than 6 in 10 right so far'));
    E.dueSkills().forEach(id => add(id, 'Due for a quick refresher'));
    s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).forEach(c => add(E.courseOrder(c).find(id => S.skill(id).level < 3), `Next in ${c.title}`));
    return out;
  }
  function nextCard() {
    const list = nextUp();
    return `<div class="section-title"><h2>Practice next</h2><a href="#/daily">Today’s practice →</a></div>
      <div class="card">${list.length ? `<ul class="skills pr-next">${list.map(x => `<li>${lvl(S.skill(x.id).level)}<div class="name"><a href="${skillHref(x.id)}">${A.skills[x.id].title}</a><div class="sub">${esc(x.why)}</div></div><div class="actions"><a class="btn sm primary" href="${practiceHref(x.id)}">Practice</a></div></li>`).join('')}</ul>`
        : '<p class="muted" style="margin:0">Save a course on the Courses page, and what to practice next shows up here.</p>'}</div>`;
  }
  /** the last eight weeks: questions each week as bars, and the share right the first time as a line */
  function trendCard() {
    const s = S.get(), mon = mondayOf(S.today()), weeks = [];
    for (let w = 7; w >= 0; w--) {
      const start = S.dayShift(mon, -7 * w); let q = 0, right = 0;
      for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(start, k)]; if (d) { q += d.q || 0; right += d.right || 0; } }
      weeks.push({ start, q, pct: q ? Math.round(right / q * 100) : null });
    }
    if (!weeks.some(w => w.q)) return '';
    const maxQ = Math.max(...weeks.map(w => w.q), 1), n = weeks.length;
    const label = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const desc = weeks.map(w => `week of ${label(w.start)}: ${w.q} questions${w.pct == null ? '' : `, ${w.pct}% right`}`).join('; ');
    const pts = weeks.map((w, k) => (w.pct == null ? null : `${((k + 0.5) / n * 100).toFixed(2)},${100 - w.pct}`)).filter(Boolean);
    return `<div class="section-title"><h2>How it’s going</h2><span class="muted small">the last 8 weeks</span></div>
      <div class="card pr-trend"><div class="legend"><span><i class="dot pr-key-bar"></i>Questions each week</span><span><i class="dot pr-key-line"></i>Right the first time</span></div>
        <div class="pr-chart" role="img" aria-label="${esc(desc)}">
          <div class="pr-plot">${pts.length > 1 ? `<svg class="pr-linesvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts.join(' ')}" vector-effect="non-scaling-stroke"/></svg>` : ''}
            ${weeks.map(w => `<div class="pr-col"><div class="pr-bar" style="height:${Math.round(w.q / maxQ * 100)}%"></div>${w.pct == null ? '' : `<span class="pr-dot" style="bottom:${w.pct}%"></span><span class="pr-pct" style="bottom:${w.pct}%">${w.pct}%</span>`}</div>`).join('')}</div>
          <div class="pr-labels" aria-hidden="true">${weeks.map(w => `<div><span>${label(w.start)}</span><span class="muted">${w.q} q</span></div>`).join('')}</div>
        </div></div>`;
  }

  const LEVEL_READY = [0, 0.25, 0.6, 0.85, 1];                 // how ready each level is for a test (as test prep counts it)
  const readyWord = pct => (pct >= 80 ? 'Ready' : pct >= 60 ? 'Nearly ready' : pct >= 35 ? 'Getting there' : 'Just starting');
  /** the coming tests: a CPM chapter test with a plan, and the unit test of the unit each saved course is on */
  function nextTests() {
    const s = S.get(), out = [], pr = s.profile.prep;
    if (pr && window.PREP && pr.date >= S.today()) {
      const c = PREP.chapterOf(pr.book, pr.ch);
      if (c) out.push({ name: `${c.b.short} chapter ${c.ch.n} test`, date: pr.date, pct: Math.round(PREP.readiness(c, pr).overall * 100), href: `#/prep/${c.b.id}/${c.ch.n}`, go: 'Continue the plan' });
    }
    s.profile.enrolled.map(id => A.courseById(id)).filter(Boolean).slice(0, 2).forEach(c => {
      const sid = E.courseOrder(c).find(id => S.skill(id).level < 3);
      if (!sid) return;
      const u = A.whereIs(sid).unit, ids = u.skills.filter(id => A.skills[id] && A.whereIs(id));
      if (!ids.length) return;
      const pct = Math.round(ids.reduce((a, id) => a + LEVEL_READY[S.skill(id).level], 0) / ids.length * 100);
      const weak = ids.filter(id => S.skill(id).level < 2);
      out.push({ name: `Unit test: ${u.title}`, where: c.title, pct, href: pct >= 60 ? `#/test/${c.id}/${u.id}` : weak.length ? practiceHref(weak[0]) : `#/unlimited/unit/${c.id}/${u.id}`, go: pct >= 60 ? 'Take the unit test' : weak.length ? `Practice ${plain(A.skills[weak[0]].title)}` : 'Practice the unit', weak: weak.length });
    });
    return out;
  }
  function readyCard() {
    const list = nextTests();
    if (!list.length) return '';
    const when = iso => new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return `<div class="section-title"><h2>How ready for the next test</h2></div>
      <div class="card pr-ready"><ul>${list.map(t => `<li><div class="pr-ready-top"><div><b>${esc(t.name)}</b><span class="small muted">${t.date ? `${when(t.date)} · ` : t.where ? esc(t.where) + ' · ' : ''}${readyWord(t.pct)}${t.weak ? ` · ${plural(t.weak, 'skill')} still to learn` : ''}</span></div><span class="pr-ready-pct">${t.pct}%</span></div>
        <div class="pbar" role="img" aria-label="${t.pct}% ready"><span style="width:${t.pct}%"></span></div><a class="btn sm" href="${t.href}">${esc(t.go)}</a></li>`).join('')}</ul>
        <p class="tiny muted" style="margin:10px 0 0">Worked out from the levels of the test’s skills${list.some(t => t.date) ? ' and the last practice test' : ''}. Proficient and Mastered skills count most.</p></div>`;
  }
  /** minutes practicing: the last 14 days, or the last 8 weeks */
  function timeCard() {
    const s = S.get();
    if (!Object.values(s.days).some(d => d.q)) return '';
    const label = (iso, o) => new Date(iso + 'T12:00').toLocaleDateString(undefined, o);
    const days = []; for (let k = 13; k >= 0; k--) { const iso = S.dayShift(S.today(), -k), d = s.days[iso]; days.push({ iso, min: S.minutes(d), est: !!(d && d.q && d.sec == null) }); }
    const mon = mondayOf(S.today()), weeks = [];
    for (let w = 7; w >= 0; w--) { const start = S.dayShift(mon, -7 * w); let min = 0, est = false; for (let k = 0; k < 7; k++) { const d = s.days[S.dayShift(start, k)]; min += S.minutes(d); if (d && d.q && d.sec == null) est = true; } weeks.push({ iso: start, min, est }); }
    const bars = (list, lab) => { const max = Math.max(...list.map(x => x.min), 1); return `<div class="pr-tbars" style="--n:${list.length}">${list.map(x => `<div title="${x.min} min${x.est ? ' (estimated)' : ''}"><span class="pr-tv">${x.min || ''}</span><i style="height:${Math.round(x.min / max * 100)}%"></i><span class="pr-tl">${lab(x.iso)}</span></div>`).join('')}</div>`; };
    const total = days.slice(-7).reduce((a, x) => a + x.min, 0), est = days.some(x => x.est) || weeks.some(x => x.est);
    return `<div class="section-title"><h2>Time practicing</h2><span class="muted small">${total} min in the last 7 days</span></div>
      <div class="card pr-time"><div class="tabs pr-time-tabs" role="tablist" aria-label="Show"><button type="button" role="tab" class="tab on" aria-selected="true" data-time="days">Days</button><button type="button" role="tab" class="tab" aria-selected="false" data-time="weeks">Weeks</button></div>
        <div data-time-view="days" role="img" aria-label="${esc(days.map(x => `${label(x.iso, { month: 'short', day: 'numeric' })}: ${x.min} minutes`).join('; '))}">${bars(days, iso => label(iso, { weekday: 'narrow' }))}</div>
        <div data-time-view="weeks" hidden role="img" aria-label="${esc(weeks.map(x => `week of ${label(x.iso, { month: 'short', day: 'numeric' })}: ${x.min} minutes`).join('; '))}">${bars(weeks, iso => label(iso, { month: 'short', day: 'numeric' }))}</div>
        ${est ? '<p class="tiny muted" style="margin:8px 0 0">Minutes before November 9, 2026 are estimated from the questions answered.</p>' : ''}</div>`;
  }
  /** strongest and weakest skills at a glance (practiced at least three times) */
  function strongWeak() {
    const s = S.get(), seen = Object.keys(s.skills).filter(id => A.skills[id] && A.whereIs(id) && s.skills[id].tries >= 3);
    if (seen.length < 2) return '';
    const acc = id => s.skills[id].right / s.skills[id].tries;
    const strong = seen.filter(id => s.skills[id].level >= 2).sort((a, b) => s.skills[b].level - s.skills[a].level || acc(b) - acc(a)).slice(0, 3);
    const weak = seen.filter(id => !strong.includes(id) && (acc(id) < 0.75 || s.skills[id].level < 2)).sort((a, b) => acc(a) - acc(b)).slice(0, 3);
    const row = id => `<li>${lvl(s.skills[id].level)}<div class="name"><a href="${skillHref(id)}">${A.skills[id].title}</a><div class="sub">${Math.round(acc(id) * 100)}% right · ${plural(s.skills[id].tries, 'try', 'tries')}</div></div><div class="actions"><a class="btn sm" href="${practiceHref(id)}">Practice</a></div></li>`;
    return `<div class="pr-sw">
      <div><div class="section-title"><h2>Strongest</h2></div><div class="card">${strong.length ? `<ul class="skills">${strong.map(row).join('')}</ul>` : '<p class="muted small" style="margin:0">Reach Familiar in a skill and it shows here.</p>'}</div></div>
      <div><div class="section-title"><h2>Needs work</h2></div><div class="card">${weak.length ? `<ul class="skills">${weak.map(row).join('')}</ul>` : '<p class="muted small" style="margin:0">Nothing weak right now. Nice work.</p>'}</div></div></div>`;
  }
  /** skills due for a refresher this week, by day (today includes anything overdue) */
  function dueWeek() {
    const s = S.get(), today = S.today(), end = S.dayShift(today, 6), by = {};
    E.dueSkills().forEach(id => { (by[today] = by[today] || []).push(id); });
    Object.keys(s.skills).forEach(id => { const d = s.skills[id].due; if (A.skills[id] && A.whereIs(id) && d && d > today && d <= end) (by[d] = by[d] || []).push(id); });
    const days = Object.keys(by).sort(), n = days.reduce((a, d) => a + by[d].length, 0);
    const name = iso => (iso === today ? 'Today' : iso === S.dayShift(today, 1) ? 'Tomorrow' : new Date(iso + 'T12:00').toLocaleDateString(undefined, { weekday: 'long' }));
    return `<div class="section-title"><h2>Due this week</h2><a href="#/daily">Today’s practice →</a></div>
      <div class="card pr-due">${n ? `<p class="muted small" style="margin:0 0 8px">${plural(n, 'skill')} due for a quick refresher. Each comes back later and later as you keep getting it right.</p>
        <ul class="pr-due-days">${days.map(d => `<li><b>${name(d)}</b><span>${by[d].slice(0, 4).map(id => `<a href="${skillHref(id)}">${A.skills[id].title}</a>`).join(', ')}${by[d].length > 4 ? `, and ${by[d].length - 4} more` : ''}</span></li>`).join('')}</ul>`
        : '<p class="muted" style="margin:0">Nothing is due this week. Skills come back for review a few days after you practice them.</p>'}</div>`;
  }
  /** test scores over time: unit tests, challenges and practice tests */
  function testsCard() {
    const NAMES = { 'unit-test': 'Unit test', 'course-challenge': 'Course challenge', 'mastery-challenge': 'Mastery challenge', 'chapter-test': 'Practice test', testout: 'Test-out' };
    const list = S.get().log.filter(e => NAMES[e.kind] && e.total).slice(0, 30);
    if (!list.length) return '';
    const pts = list.slice(0, 12).reverse(), n = pts.length;
    const what = e => (e.title ? esc(e.title) : e.unit && A.unitById(e.course, e.unit) ? esc(A.unitById(e.course, e.unit).title) : e.course && A.courseById(e.course) ? esc(A.courseById(e.course).title) : '');
    const xy = (e, k) => [n === 1 ? 50 : 4 + k / (n - 1) * 92, 100 - Math.round(e.right / e.total * 100)];
    return `<div class="section-title"><h2>Test scores</h2><span class="muted small">${plural(list.length, 'test')}</span></div>
      <div class="card pr-tests">${n > 1 ? `<div class="pr-tchart" role="img" aria-label="${esc(pts.map(e => `${Math.round(e.right / e.total * 100)}%`).join(', '))}"><span class="pr-ty" style="top:0">100%</span><span class="pr-ty" style="top:50%">50%</span><span class="pr-ty" style="top:100%">0%</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="50" x2="100" y2="50" class="pr-tgrid"/><polyline points="${pts.map((e, k) => xy(e, k).join(',')).join(' ')}" vector-effect="non-scaling-stroke"/></svg>
        ${pts.map((e, k) => { const [x, y] = xy(e, k); return `<i class="pr-tdot" style="left:${x}%;top:${y}%"></i>`; }).join('')}</div>` : ''}
        <ul class="log pr-tlist">${list.slice(0, 6).map(e => `<li><span class="when">${new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span><b>${NAMES[e.kind]}</b>${what(e) ? ' · ' + what(e) : ''}</span><span class="pts">${e.right} / ${e.total} · ${Math.round(e.right / e.total * 100)}%</span></li>`).join('')}</ul></div>`;
  }
  /** every course, a square for each skill filled to its level (courses being learned first) */
  function masteryMap() {
    const s = S.get(), mine = A.courses.filter(c => s.profile.enrolled.includes(c.id) || A.courseSkills(c).some(id => S.skill(id).level > 0)), rest = A.courses.filter(c => !mine.includes(c));
    const row = c => `<li><a class="pr-map-name" href="${courseHref(c)}">${esc(c.title)}</a><span class="sm-cells pr-map-cells">${A.courseSkills(c).map(id => `<a class="sm-cell l${S.skill(id).level}" href="${skillHref(id)}" title="${esc(plain(A.skills[id].title))}: ${A.LEVELS[S.skill(id).level]}" aria-label="${esc(plain(A.skills[id].title))}, ${A.LEVELS[S.skill(id).level]}"></a>`).join('')}</span></li>`;
    return `<div class="section-title"><h2>Mastery map</h2><span class="muted small">a square for every skill</span></div>
      <div class="card pr-map">${legend()}${mine.length ? `<ul class="pr-map-list">${mine.map(row).join('')}</ul>` : ''}
        <details class="all-courses" ${mine.length ? '' : 'open'}><summary>${mine.length ? `Every other course (${rest.length})` : 'Every course'}</summary><ul class="pr-map-list">${rest.map(row).join('')}</ul></details></div>`;
  }

  /* ---------- settings ---------- */
  /** Profile and Settings: one tab strip on both pages */
  const meTabs = on => `<nav class="tabs me-tabs" aria-label="Your profile and settings">${[['profile', 'Profile'], ['settings', 'Settings']].map(([id, label]) => `<a class="tab${id === on ? ' on' : ''}" href="#/${id}"${id === on ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
  /** who is signed in, with Sync now, or the way to save online; and Switch learner when there are several */
  function meLine() {
    const me = window.ACCOUNT && ACCOUNT.user(), many = window.LEARNERS && LEARNERS.count() > 1;
    const acct = me && !me.waiting ? `Signed in as <b>@${esc(me.username)}</b><span class="muted" id="me-sync"> · ${syncWords()}</span><button class="btn sm" type="button" id="me-sync-now">Sync now</button>`
      : window.ACCOUNT && ACCOUNT.enabled() && !window.PROCADEMY_OFFLINE ? `<span class="muted">Not signed in. Your progress is saved on this device.</span><a class="btn sm" href="#/profile">Save it online</a>` : '';
    return acct || many ? `<div class="me-line">${acct}${many ? `<a class="btn sm" href="#/profile" id="me-switch">Switch learner</a>` : ''}</div>` : '';
  }
  function syncWords() {
    const st = window.ACCOUNT ? ACCOUNT.status() : { state: 'off' };
    return st.state === 'saving' ? 'saving…' : st.state === 'saved' ? `saved online${st.at ? ' at ' + new Date(st.at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}` : st.state === 'offline' ? 'offline; it saves when you’re back online' : st.state === 'error' ? 'not saved yet' : 'saved online';
  }
  function wireMeLine(root) {
    const sw = root.querySelector('#me-switch');
    if (sw) sw.addEventListener('click', () => { try { sessionStorage.setItem('procademy.goLearners', '1'); } catch (e) { /* the Profile page opens at the top */ } });
    const b = root.querySelector('#me-sync-now');
    if (!b) return;
    const off = ACCOUNT.on(() => { const t = root.querySelector('#me-sync'); if (!t || !t.isConnected) { off(); return; } t.textContent = ' · ' + syncWords(); });
    b.addEventListener('click', async () => { b.disabled = true; await ACCOUNT.push(); b.disabled = false; toast(ACCOUNT.status().state === 'saved' ? 'Saved online' : ACCOUNT.status().error || 'It couldn’t be saved just now'); });
  }

  /** a setting with a few choices, as one row of pill buttons (a radio group) */
  const seg = (id, label, help, opts, cur) => `<div class="set-row"><div class="set-text"><span class="set-label" id="${id}-l">${label}</span>${help ? `<span class="set-help">${help}</span>` : ''}</div>
    <div class="seg" id="${id}" role="radiogroup" aria-labelledby="${id}-l">${opts.map(([v, l, lang]) => `<button type="button" role="radio" aria-checked="${String(v) === String(cur)}" data-v="${v}"${lang ? ` lang="${lang}"` : ''}>${l}</button>`).join('')}</div></div>`;
  /** an on/off setting, as a switch */
  const toggle = (id, label, help, on) => `<label class="set-row" for="${id}"><span class="set-text"><span class="set-label">${label}</span>${help ? `<span class="set-help">${help}</span>` : ''}</span><input type="checkbox" class="switch" id="${id}" ${on ? 'checked' : ''}></label>`;
  function settings(root) {
    const p = S.get().profile;
    const skillCount = Object.keys(A.skills).length;
    const grade = p.adult ? 'adult' : p.grade == null ? '' : String(p.grade);
    root.innerHTML = `
      <div class="settings">
      ${meTabs('settings')}
      <h1>Settings</h1>
      ${meLine()}
      <div class="settings-grid">
        <section class="card set-card"><h2>You</h2>
          <div class="set-row"><label class="set-text" for="name"><span class="set-label">Your name</span><span class="set-help">For the greeting on Home</span></label><input id="name" class="set-input" type="text" value="${esc(p.name)}" placeholder="Optional" autocomplete="off"></div>
          <div class="set-row"><label class="set-text" for="grade"><span class="set-label">Grade</span><span class="set-help">Sets the puzzle of the day, the tutor and topic practice to your level</span></label><select id="grade" class="set-input"><option value="">Not set</option>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option value="${g}">${ordinal(g)}</option>`).join('')}<option value="adult">Adult learner</option></select></div>
          ${window.COACH && COACH.canSpeak() ? toggle('auto-read', 'Read questions aloud', 'Every practice question, in this device’s voice', p.autoRead) : ''}
        </section>
        <section class="card set-card"><h2>Look</h2>
          ${seg('theme', 'Colors', '', [['system', 'Device'], ['light', 'Light'], ['dark', 'Dark']], p.theme || 'system')}
          ${seg('blue', 'Blue', '', [['classic', 'Classic'], ['ocean', 'Ocean'], ['navy', 'Navy'], ['sky', 'Sky']].map(([v, l]) => [v, `<span class="blue-dot" data-b="${v}" aria-hidden="true"></span>${l}`]), p.blue || 'classic')}
          ${toggle('contrast', 'High contrast', 'Black and white with a deep blue, and outlines on everything', p.contrast === 'high')}
          ${seg('size', 'Text size', '', [['normal', 'Normal'], ['large', 'Large'], ['xlarge', 'Extra large']], p.textSize || 'normal')}
          ${toggle('easy-read', 'Easier-to-read text', 'A clearer typeface with more space', p.easyRead)}
          ${p.easyRead ? seg('read-font', 'Reading font', 'OpenDyslexic is made for readers with dyslexia', [['clear', 'Clearer'], ['dyslexic', 'OpenDyslexic']], p.readFont || 'clear') : ''}
          ${toggle('less-motion', 'Less motion', 'Fewer slides and animations', p.reduceMotion)}
          ${seg('lang', 'Menus and buttons', 'Lessons, questions and the tutor stay in English', Object.entries(window.LANG ? LANG.NAMES : { en: 'English' }).map(([k, n]) => [k, n, k]), p.lang || 'en')}
          <div class="set-foot"><button class="btn sm ghost" type="button" id="look-reset">Reset to defaults</button></div>
        </section>
        <section class="card set-card"><h2>Goals</h2>
          ${seg('goal', 'Questions a day', 'The ring on Home. All practice counts', [10, 20, 30, 50].map(n => [n, String(n)]), Number(p.goal || 20))}
          ${seg('week-goal', 'Days a week', 'Shown in today’s plan on Home', [3, 4, 5, 6, 7].map(n => [n, String(n)]), Number(p.weekGoal || 5))}
          <div class="set-row"><label class="set-text" for="quiet"><span class="set-label">Quiet hours</span><span class="set-help">No sounds, and reminders skip these hours</span></label><select id="quiet" class="set-input">${QUIET.map(([v, l]) => `<option value="${v}" ${v === quietKey(p.quiet) ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div class="set-row set-remind"><div class="set-text"><span class="set-label">A practice reminder</span><span class="set-help">Added to the calendar on your phone or computer</span></div>
            <div class="set-remind-pick"><label class="visually-hidden" for="rm-days">Which days</label><select id="rm-days" class="set-input"><option value="daily">Every day</option><option value="school">School days</option><option value="weekend">Weekends</option></select>
              <label class="visually-hidden" for="rm-hour">What time</label><select id="rm-hour" class="set-input">${[7, 8, 15, 16, 17, 18, 19, 20].map(h => `<option value="${h}" ${h === 16 ? 'selected' : ''}>${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'pm' : 'am'}</option>`).join('')}</select>
              <button class="btn sm" type="button" id="rm-add">Add to calendar</button></div></div>
        </section>
        <section class="card set-card"><h2>Your progress</h2>
          <p class="muted small">Everything is saved in this browser. Save a copy to keep it safe, or load it on another device.</p>
          <div class="btn-row" style="margin-top:0"><button class="btn primary" id="export">Save a copy</button><label class="btn">Load a copy <input id="import" type="file" accept="application/json,.json" class="visually-hidden"></label></div>
          ${window.MOVE ? MOVE.box() : ''}
          <div class="set-sub"><h3>As a spreadsheet</h3><p class="muted small">Every day’s questions and minutes, or every skill’s level, to open in Excel, Numbers or Google Sheets.</p>
            <div class="btn-row" style="margin-top:0"><button class="btn sm" type="button" id="csv-days">Download days</button><button class="btn sm" type="button" id="csv-skills">Download skills</button></div></div>
        </section>
        ${window.INSTALL ? INSTALL.slot('settings') : ''}
        <section class="card set-card" id="offline-card"><h2>Use it without the internet</h2>
          ${window.PROCADEMY_OFFLINE ? `<p class="muted small">This is Procademy’s offline file (build ${esc(window.PROCADEMY_OFFLINE.build)}). Every course, practice set, test and drawing works here with no internet. The AI tutor, pictures and reading attached photos and PDFs work when there is an internet connection.</p>
            <p class="muted small">Progress made in this file is saved in this browser, separately from the website. To carry it across, use <b>Save a copy</b> in one and <b>Load a copy</b> in the other. For the newest version, download the file again from the website’s settings.</p>`
          : `<p class="muted small"><b>On a computer:</b> download Procademy as one file and open it with a double-click. Every course, practice set and drawing works with no internet; the tutor needs it. <b>On a phone or tablet:</b> install the app.</p>
            <div class="btn-row" style="margin-top:0"><a class="btn primary" href="procademy-offline.html" download="procademy-offline.html">Download the offline file</a></div>
            <p class="tiny muted" style="margin:10px 0 0">The offline file keeps its own progress: move it with Save a copy and Load a copy.</p>`}
        </section>
        <section class="card set-card" id="lock-card"></section>
        <section class="card set-card"><div class="row between" style="flex-wrap:wrap;gap:8px;margin-bottom:8px"><h2 style="margin:0">About</h2><span class="btn-row" style="margin:0"><button class="btn sm" type="button" data-tour-again>Take the tour again</button><a class="btn sm" href="#/new">What’s new</a></span></div><p class="muted small">${A.courses.length} courses, ${skillCount} skills. Every question is made on this device, so a missed one can be asked again exactly as it was. Progress stays here unless you make an account. Only what you ask the AI is sent, to a free AI service. <a href="${(window.MOVE ? MOVE.siteBase() : '').replace(/[^/]*$/, '')}privacy.html">Privacy</a> · <a href="#/new">Updates</a> · <a href="https://github.com/priyaanh/procademy">Source on GitHub</a></p></section>
      </div></div>`;
    /** a row of pill buttons: mark the choice, then fn(value) */
    const onSeg = (id, fn) => { const g = root.querySelector('#' + id); if (g) g.addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (!b) return; g.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-checked', String(x === b))); fn(b.dataset.v); }); };
    if (window.MOVE) MOVE.wire(root);
    root.querySelector('#grade').value = grade;
    root.querySelector('#name').addEventListener('input', ev => { S.setProfile({ name: ev.target.value.slice(0, 40) }); window.APP.applyPrefs(); });
    root.querySelector('#grade').addEventListener('change', ev => { setGrade(ev.target.value); toast('Saved'); });
    onSeg('theme', v => { S.setProfile({ theme: v }); window.APP.applyPrefs(); });
    onSeg('size', v => { S.setProfile({ textSize: v }); window.APP.applyPrefs(); });
    onSeg('lang', v => { S.setProfile({ lang: v }); window.APP.applyPrefs(); });
    root.querySelector('#less-motion').addEventListener('change', ev => { S.setProfile({ reduceMotion: ev.target.checked }); window.APP.applyPrefs(); });
    root.querySelector('#easy-read').addEventListener('change', ev => { S.setProfile({ easyRead: ev.target.checked }); window.APP.applyPrefs(); settings(root); const er = root.querySelector('#easy-read'); if (er) er.focus(); });
    root.querySelector('#contrast').addEventListener('change', ev => { S.setProfile({ contrast: ev.target.checked ? 'high' : null }); window.APP.applyPrefs(); });
    onSeg('blue', v => { S.setProfile({ blue: v }); window.APP.applyPrefs(); });
    onSeg('read-font', v => { S.setProfile({ readFont: v }); window.APP.applyPrefs(); });
    const ar = root.querySelector('#auto-read'); if (ar) ar.addEventListener('change', ev => { S.setProfile({ autoRead: ev.target.checked }); toast(ev.target.checked ? 'Questions will be read aloud' : 'Read-aloud off'); });
    onSeg('goal', v => { S.setProfile({ goal: Number(v) }); toast('Daily goal: ' + v + ' questions'); });
    onSeg('week-goal', v => { S.setProfile({ weekGoal: Number(v) }); toast('Weekly goal: ' + v + ' days'); });
    root.querySelector('#look-reset').addEventListener('click', () => { S.setProfile({ theme: 'system', textSize: 'normal', easyRead: false, lang: 'en', blue: 'classic', contrast: null, readFont: 'clear' }); window.APP.applyPrefs(); settings(root); toast('Colors, text and language are back to how they started'); });
    wireMeLine(root);
    root.querySelector('#quiet').addEventListener('change', ev => { S.setProfile({ quiet: QUIET_SET[ev.target.value] || null }); toast(ev.target.value === 'off' ? 'Quiet hours off' : 'Quiet hours saved'); });
    root.querySelector('#rm-add').addEventListener('click', () => {
      const h = Number(root.querySelector('#rm-hour').value), days = root.querySelector('#rm-days').value, at = new Date(); at.setHours(h, 0, 0, 0);
      if (S.quietNow(at)) { toast('That time is inside your quiet hours. Choose another time.'); return; }
      reminderIcs(h, days);
    });
    root.querySelector('#csv-days').addEventListener('click', () => download(`procademy-days-${S.today()}.csv`, csvDays(), 'text/csv'));
    root.querySelector('#csv-skills').addEventListener('click', () => download(`procademy-skills-${S.today()}.csv`, csvSkills(), 'text/csv'));
    root.querySelector('#export').addEventListener('click', () => {
      const blob = new Blob([S.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `procademy-backup-${S.today()}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Saved a copy');
    });
    root.querySelector('#import').addEventListener('change', ev => {
      const f = ev.target.files[0]; if (!f) return;
      ev.target.value = '';
      const rd = new FileReader();
      const load = () => { try { S.importJSON(String(rd.result)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Loaded your copy'); } catch (e) { toast(e.message || 'Couldn’t read that file'); } };
      // a copy replaces the progress here, so with a lock it waits for the PIN or password
      rd.onload = () => (LOCK && LOCK.locked() ? lockPanel('load', load) : load());
      rd.readAsText(f);
    });
    drawLock();
  }

  /* ---------- settings: quiet hours, a reminder, spreadsheets, and the weekly copies kept on this device ---------- */
  const QUIET = [['off', 'Off'], ['20-7', '8 pm to 7 am'], ['21-7', '9 pm to 7 am'], ['22-7', '10 pm to 7 am'], ['21-8', '9 pm to 8 am'], ['22-6', '10 pm to 6 am']];
  const QUIET_SET = Object.fromEntries(QUIET.filter(([v]) => v !== 'off').map(([v]) => { const [from, to] = v.split('-').map(Number); return [v, { from, to }]; }));
  const quietKey = q => (q && q.from != null ? `${q.from}-${q.to}` : 'off');
  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    window.VIEWS._lastDownload = { name, text };
  }
  const csvCell = v => { const t = String(v == null ? '' : v); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const csv = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
  function csvDays() {
    const d = S.get().days;
    return csv([['Date', 'Questions', 'Right the first time', 'Percent right', 'Minutes', 'Points']].concat(Object.keys(d).filter(k => d[k].q).sort().map(k => [k, d[k].q, d[k].right || 0, d[k].q ? Math.round((d[k].right || 0) / d[k].q * 100) : 0, S.minutes(d[k]), d[k].pts || 0])));
  }
  function csvSkills() {
    const s = S.get(), when = t => (t ? new Date(t).toISOString().slice(0, 10) : '');
    return csv([['Course', 'Unit', 'Skill', 'Level', 'Tries', 'Right', 'Percent right', 'Last practiced', 'Next review']].concat(Object.keys(s.skills).filter(id => A.skills[id] && A.whereIs(id) && s.skills[id].tries).map(id => { const w = A.whereIs(id), k = s.skills[id]; return [w.course.title, w.unit.title, plain(A.skills[id].title), A.LEVELS[k.level], k.tries, k.right, Math.round(k.right / k.tries * 100), when(k.last), k.due || '']; }).sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]))));
  }
  /** a calendar file with a repeating practice reminder at hour h (every day, school days or weekends) */
  function reminderIcs(h, days) {
    const d = new Date(); d.setDate(d.getDate() + (d.getHours() >= h ? 1 : 0));
    const ymd = x => x.getFullYear() + String(x.getMonth() + 1).padStart(2, '0') + String(x.getDate()).padStart(2, '0');
    const rule = days === 'school' ? 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' : days === 'weekend' ? 'RRULE:FREQ=WEEKLY;BYDAY=SA,SU' : 'RRULE:FREQ=DAILY';
    const want = days === 'school' ? [1, 2, 3, 4, 5] : days === 'weekend' ? [0, 6] : null;
    while (want && !want.includes(d.getDay())) d.setDate(d.getDate() + 1);          // the first one falls on a day it repeats on
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'), site = window.MOVE ? MOVE.siteBase() : location.href.split('#')[0];
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Procademy//Practice reminder//EN', 'BEGIN:VEVENT', `UID:procademy-remind-${Date.now()}@procademy`, `DTSTAMP:${stamp}`,
      `DTSTART:${ymd(d)}T${String(h).padStart(2, '0')}0000`, 'DURATION:PT15M', rule, 'SUMMARY:Procademy: today’s practice (10 minutes)', `DESCRIPTION:Open Procademy for today’s practice: ${site}#/daily`, `URL:${site}#/daily`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Time for Procademy', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    download('procademy-reminder.ics', ics, 'text/calendar');
    toast('Open the downloaded file to add the reminder');
  }
  function copiesHtml() {
    const list = S.copies(), when = t => new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return `<h3>Copies kept on this device</h3><p class="muted small">Once a week Procademy keeps a copy of your progress here, so you can go back to it if something goes wrong.</p>
      ${list.length ? `<ul class="set-copies">${list.map((c, i) => `<li><span>${when(c.t)}</span><button class="btn sm" type="button" data-copy="${i}">Go back to this copy</button></li>`).join('')}</ul>` : '<p class="small muted">No copy yet. The first one is made after you practice.</p>'}
      <div class="btn-row" style="margin-top:6px"><button class="btn sm ghost" type="button" id="copy-now">Keep a copy now</button></div>`;
  }
  function wireCopies(root) {
    const box = root.querySelector('#copies'); if (!box) return;
    box.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.id === 'copy-now') { S.copyNow(); box.innerHTML = copiesHtml(); toast('A copy is kept on this device'); return; }
      if (b.dataset.copy == null) return;
      const go = () => { try { S.restoreCopy(Number(b.dataset.copy)); window.APP.applyPrefs(); window.APP.refreshStats(); settings(root); toast('Back to that copy. The progress you had is kept as the newest copy.'); } catch (e) { toast(e.message); } };
      // going back replaces the progress here, so it asks like loading a copy does
      if (LOCK && LOCK.locked()) lockPanel('load', go); else if (confirm('Go back to this copy? The progress you have now is kept as the newest copy.')) go();
    });
  }

  /* ---------- settings: erasing all progress, behind the account's password when there is one (ACCOUNT.lock) ---------- */
  let LOCK = null, lockRoot = null;          // ACCOUNT loads after this file, so the lock is looked up when Settings draws
  function drawLock() {
    const card = document.getElementById('lock-card');
    if (!card) return;
    lockRoot = card; LOCK = (window.ACCOUNT && ACCOUNT.lock) || null;
    const signedIn = window.ACCOUNT && ACCOUNT.user() && !ACCOUNT.user().waiting;
    card.innerHTML = `<h2>Start over</h2>
      <p class="muted small">Erases every level, point and streak${signedIn ? ', here and in your account' : ' on this device'}. A copy you saved isn’t touched.${LOCK && LOCK.locked() ? ' Your account password is needed.' : ''}</p>
      <button class="btn" type="button" id="reset">Erase all progress</button>
      <div id="lock-panel"></div>
      <div class="set-sub" id="copies">${copiesHtml()}</div>`;
    wireCopies(card.closest('#main') || document.getElementById('main'));
    card.querySelector('#reset').addEventListener('click', () => lockPanel('erase'));
  }
  /** the form under the card: erase, or load a copy (then done()); signed in with a password, it asks for it */
  function lockPanel(job, done) {
    const panel = lockRoot && lockRoot.querySelector('#lock-panel');
    if (!panel) return;
    const proof = !!(LOCK && LOCK.locked());
    const what = { erase: ['Erase all progress?', 'Erase all progress'], load: ['Load this copy?', 'Load it'] }[job];
    panel.innerHTML = `<form class="lock-form" id="lock-form" autocomplete="off"><h3>${what[0]}</h3>
      <p class="small muted">${job === 'erase' ? 'This can’t be undone.' : 'Loading a copy replaces the progress here.'}</p>
      ${proof ? '<div class="field"><label for="lk-proof">Your account password</label><input id="lk-proof" type="password" autocomplete="current-password"></div>' : ''}
      <div class="btn-row"><button class="btn sm primary" type="submit" id="lk-go">${what[1]}</button><button class="btn sm ghost" type="button" id="lk-cancel">Cancel</button></div>
      <p class="ac-msg" role="alert" id="lk-msg"></p></form>`;
    const f = panel.querySelector('#lock-form'), msg = f.querySelector('#lk-msg');
    if (window.ACCOUNT && ACCOUNT.reveal) ACCOUNT.reveal(f);
    const busy = on => f.querySelectorAll('input, button').forEach(x => { x.disabled = on; });
    f.querySelector('#lk-cancel').addEventListener('click', () => { panel.innerHTML = ''; });
    (f.querySelector('#lk-proof') || f.querySelector('#lk-cancel')).focus({ preventScroll: true });
    panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    f.addEventListener('submit', async ev => {
      ev.preventDefault();
      busy(true); msg.textContent = proof ? 'Checking…' : '';
      try {
        if (proof && !await LOCK.check(f.querySelector('#lk-proof').value)) { busy(false); f.querySelector('#lk-proof').select(); msg.textContent = 'That isn’t your account password.'; return; }
        if (job === 'load') { done(); return; }
        S.reset(); window.APP.applyPrefs(); window.APP.refreshStats(); toast('Erased'); settings(document.getElementById('main'));
      } catch (e) { busy(false); msg.textContent = e.message || 'Something went wrong. Try again.'; }
    });
  }

  /* ---------- search ---------- */
  /** more words each tool answers to in search */
  const TOOL_WORDS = {
    ratios: 'ratio table rate unit rate proportion equivalent ratios missing value scale', clock: 'clock time telling time hours minutes elapsed time how long am pm', money: 'money coins bills cents dollars change count coins penny nickel dime quarter',
    blocks: 'place value blocks ones tens hundreds thousands regroup trade expanded form', times: 'multiplication table times table facts arrays fact family squares',
    calc: 'calculator arithmetic decimal fraction mixed number exponent square root order of operations statistics mean median regression ti stat list permutation combination npr ncr', graph: 'graph graphing line slope equation inequality function parabola plot best fit line scatter trend',
    geometry: 'geometry construction compass straightedge bisect bisector perpendicular protractor ruler angle measure transformation translation reflection rotation dilation sketch', measure: 'unit units convert conversion measurement length mass weight volume capacity temperature celsius fahrenheit metric customary inches feet meters scale drawing map',
    fractions: 'fraction mixed number numerator denominator common denominator equivalent simplify reciprocal add subtract multiply divide compare area model',
    integers: 'integer negative positive zero pair tiles add subtract multiply divide opposite sign', ratios: 'ratio rate unit rate proportion proportional scale drawing better buy share constant',
    percent: 'percent discount sale tax tip interest markup money', numbers: 'prime factor factor tree divisibility gcf lcm greatest common factor least common multiple scientific notation power of ten',
    data: 'data statistics mean median mode range iqr mad box plot histogram dot plot stem and leaf', shapes: 'shape area perimeter volume surface area net angle triangle circle prism cylinder cone sphere pyramid',
    chance: 'probability chance spinner dice coin simulation experiment', tiles: 'algebra tiles equation mat solve equations comparison', steps: 'check steps solve equation working solver factor factoring simplify expand quadratic',
    setup: 'word problem story equation', sprint: 'facts times tables speed timed', words: 'vocabulary glossary definition flashcards', leap: 'game puzzle integer number line order of operations', prep: 'test prep study plan chapter test',
  };
  /** a test for whether text matches every word of a search; each word also matches its singular (fractions,
      fraction; inequalities, inequality; boxes, box) */
  /** words around a search that don't change it: “fractions for kids”, “intro to slope”, “5th grade area” */
  const FILLER = /\b(for kids|for students|for beginners|basics|basic|facts|quiz|introduction to|intro to|all about|grade \d+|\d+(st|nd|rd|th) grade)\b/g;
  const one = w => (w.length > 3 ? w.replace(/ies$/, 'y').replace(/(?<=[sxz]|ch|sh)es$|s$/, '') : w);          // a word's singular
  const wordsOf = s => A.normText(A.stripTags(String(s || ''))).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  /** a test for whether text has every word of a search, as whole words (singular or plural): “art” isn't in
      “kindergarten”. While typing (not opts.whole), the last word may be the start of one: “fract”. */
  function matcher(q, opts) {
    const qs = wordsOf(String(q || '').toLowerCase().replace(FILLER, ' ')), prefix = !(opts && opts.whole);
    return text => { const ts = wordsOf(text), set = new Set(ts.map(one)); return qs.length > 0 && qs.every((w, k) => set.has(one(w)) || (prefix && k === qs.length - 1 && w.length >= 3 && ts.some(t => t.startsWith(w)))); };
  }
  /** skills that match a search (title, or title with its unit and course), those nearest the learner's grade
      first, at most 40 */
  function findSkills(q, opts) {
    const hit = matcher(q, opts), g = S.get().profile.grade;
    const ids = Object.keys(A.skills).filter(sid => { const w = A.whereIs(sid); return w && (hit(A.skills[sid].title) || hit(A.skills[sid].title + ' ' + w.unit.title + ' ' + w.course.title)); });
    if (g != null) { const far = sid => Math.abs(A.whereIs(sid).course.grade - g); ids.sort((x, y) => far(x) - far(y)); }
    return ids.slice(0, 40);
  }
  /** the glossary's words, singular, without the little ones: what tells a math topic from any other */
  const SMALL = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'than', 'into', 'per', 'its', 'are', 'not', 'all', 'any', 'one', 'two', 'out', 'each', 'same', 'other', 'also', 'way']);
  let mathWords = null;
  const glossaryWords = () => mathWords || (mathWords = new Set((window.WORDS ? WORDS.LIST : []).flatMap(w => [w.term].concat(w.also)).flatMap(wordsOf).map(one).filter(w => w.length >= 3 && !SMALL.has(w))));
  /** a typed topic that is math, as Procademy's own skills for it, or [] when it isn't: a glossary word or one
      of its other names (“integers”, “GCF”, “PEMDAS”), or skills it names that use a math word. A topic with
      reviewed questions (“money” is economics) is never math here. */
  function mathTopic(q) {
    if (window.TOPICS && TOPICS.bankFor(String(q || ''))) return [];
    const qs = wordsOf(String(q || '').toLowerCase().replace(FILLER, ' ')).map(one), key = qs.join(' '), big = qs.filter(w => !SMALL.has(w));
    if (!big.length) return [];
    const g = S.get().profile.grade, rel = text => (window.TUTORPAGE ? TUTORPAGE.related(text, g).filter(id => A.whereIs(id)) : []);
    const term = window.WORDS && WORDS.LIST.find(w => [w.term].concat(w.also).some(n => wordsOf(n).map(one).join(' ') === key));
    const named = findSkills(q, { whole: true });
    if (term) return [...new Set(rel(term.term + ' ' + term.also.join(' ')).concat(named))];          // the closest skills, and every one that names it
    if (big.every(w => glossaryWords().has(w))) return named.length ? named : rel(big.join(' '));      // “congruent triangles”: math words only
    return named.length && big.some(w => glossaryWords().has(w)) ? named : [];
  }
  /* a search typed as a question, or with a typo: "how do I find the slope?" is "slope", "fracions" is "fractions" */
  const ASKING = /^(please\s+)?(how\s+(do|can|would|should|to)\s+(i|you|we\s+)?\s*|how\s+to\s+|what\s+(is|are|does|do)\s+(a\s+|an\s+|the\s+)?|what's\s+|why\s+(is|do|does)\s+|can\s+you\s+|help\s+(me\s+)?(with\s+)?|explain\s+|show\s+me\s+|teach\s+me\s+|i\s+need\s+help\s+with\s+|tell\s+me\s+about\s+)/i;
  const DROP = new Set(['find', 'work', 'out', 'solve', 'figure', 'get', 'the', 'a', 'an', 'my', 'i', 'me', 'to', 'do', 'does', 'is', 'are', 'in', 'on', 'with', 'for', 'about', 'using', 'use', 'calculate', 'understand', 'learn', 'please']);
  let vocab = null;
  /** every word in the names of skills, units, courses, tools and math terms */
  function buildVocab() {
    const set = new Set(), add = t => wordsOf(t).forEach(w => { if (w.length >= 4) { set.add(w); set.add(one(w)); } });
    Object.keys(A.skills).forEach(id => add(A.skills[id].title));
    A.courses.forEach(c => { add(c.title); c.units.forEach(u => add(u.title)); });
    toolList().forEach(t => add(t[2] + ' ' + t[3]));
    Object.values(TOOL_WORDS).forEach(add);
    if (window.WORDS) WORDS.LIST.forEach(w => add([w.term].concat(w.also).join(' ')));
    return { set, list: [...set] };
  }
  /** how many letters differ (insert, delete or change), up to max + 1 */
  function edits(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, k) => k);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let low = i;
      for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); low = Math.min(low, cur[j]); }
      if (low > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  /** a search, tidied: question words dropped, and a misspelled word swapped for the nearest real one. A word that
      starts a real one is left alone, so "fract" while typing stays "fract". */
  function fixQuery(q) {
    const raw = String(q || '').trim(), t = raw.toLowerCase().replace(/[?!.]+$/, '').replace(ASKING, '');
    let ws = wordsOf(t).filter(w => !DROP.has(w));
    if (!ws.length) ws = wordsOf(t);
    vocab = vocab || buildVocab();
    let typo = false;
    const fixed = ws.map(w => {
      if (w.length < 4 || /\d/.test(w) || vocab.set.has(w) || vocab.set.has(one(w)) || vocab.list.some(v => v.startsWith(w))) return w;
      const max = w.length <= 5 ? 1 : 2;
      let best = null, d = max + 1;
      vocab.list.forEach(v => { const e = edits(w, v, max); if (e < d || (e === d && best && v.length < best.length)) { d = e; best = v; } });
      if (best && d <= max) { typo = true; return best; }
      return w;
    });
    return { q: fixed.join(' ') || raw, typo };
  }
  /** everything a search matches: tools, courses, units and skills (for the search page and the search box) */
  function find(q) {
    q = fixQuery(q).q;
    const hit = matcher(q), g = S.get().profile.grade, far = c => (g == null ? 0 : Math.abs(c.grade - g));
    return {
      tools: toolList().filter(t => hit(`${t[2]} ${t[3]} ${TOOL_WORDS[t[0]] || ''}`)),
      courses: A.courses.filter(c => hit(c.title) || hit(c.blurb || '')),
      units: A.courses.flatMap(c => c.units.filter(u => hit(u.title)).map(u => ({ c, u }))).sort((x, y) => far(x.c) - far(y.c)).slice(0, 12),
      skills: findSkills(q),
    };
  }
  function search(root, q) {
    q = (q || '').trim();
    const fx = fixQuery(q), typed = q;
    if (q && fx.q !== q) q = fx.q;
    const { tools, courses, units, skills } = find(q);
    root.innerHTML = `<h1>Search</h1><p class="muted">${typed ? `Results for “${esc(typed)}”${fx.typo ? `. Showing results for <b>${esc(q)}</b>` : ''}` : 'Type in the box above to search skills, units and courses, or ask a question like “how do I find slope”.'}</p>
      ${tools.length ? `<div class="section-title"><h2>Tools</h2></div><div class="grid tools">${tools.map(toolCard).join('')}</div>` : ''}
      ${courses.length ? `<div class="section-title"><h2>Courses</h2></div><div class="grid">${courses.map(courseCard).join('')}</div>` : ''}
      ${units.length ? `<div class="section-title"><h2>Units</h2></div><div class="card">${units.map(x => `<div class="search-hit"><div><a href="${unitHref(x.c, x.u)}"><b>${esc(x.u.title)}</b></a><div class="where">${esc(x.c.title)}</div></div></div>`).join('')}</div>` : ''}
      ${q && window.CPMVIEWS ? CPMVIEWS.searchHits(q) : ''}
      ${skills.length ? `<div class="section-title"><h2>Skills</h2></div><div class="card"><ul class="skills">${skills.map(sid => { const w = A.whereIs(sid); return skillRow(sid, { where: w.course.title + ' · ' + w.unit.title }); }).join('')}</ul></div>` : ''}
      ${q && mathTopic(q).length ? `<div class="card search-topic"><div><a href="#/unlimited/find/${encodeURIComponent(q)}"><b>Practice “${esc(q)}” now</b></a><div class="small muted">Procademy’s own questions, ready at once</div></div></div>` : ''}
      ${q && window.TOPICS && !window.PROCADEMY_OFFLINE ? `<div class="card search-topic"><div><a href="${TOPICS.href(TOPICS.clip(q), S.get().profile.grade)}"><b>Practice “${esc(TOPICS.clip(q))}” as a topic</b></a><div class="small muted">Any subject, at your grade, without end</div></div></div>` : ''}
      ${q && !tools.length && !courses.length && !units.length && !skills.length && !(window.CPMVIEWS && CPMVIEWS.searchHits(q)) ? `<div class="card empty">No math skill matched. Try a shorter word, like “fraction” or “slope”, or <a href="#/sitemap">see every page</a>.</div>` : ''}`;
    bindExplain(root);
  }

  function notFound(root) {
    root.innerHTML = `<div class="card empty"><h1>Not here</h1><p>That page doesn’t exist, or the skill has moved.</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/">Home</a><a class="btn" href="#/courses">Courses</a><a class="btn" href="#/sitemap">All pages</a></div></div>`;
  }

  window.VIEWS = { home, tools, courses, course, unit, skill, practice, unitTest, challenge, masteryChallenge, review, daily, progress, settings, search, notFound, stats, brand, toast,
    quiz, boss, speed, weekly, warmup, summer, ready, readyIds, warmSkills, clockText,
    findSkills, matcher, find, skillMap, notes, mathTopic, setGrade, ordinal, mastered, sitemap, fixQuery, meTabs, nextUp, testSoon, bigIdea, balance,
    _h: { courseArt, toolLinks, esc, plain, lvl, mbar, legend, skillRow, exercise, plural, fmt, courseVar, mono, skillHref, practiceHref, explainBtn, bindExplain, tutorCtx, saveBtn, wireSaving, isSaved, dragHandle, wireReorder, exercise, unitHref, courseHref } };
})();
