/* Math words in use: the glossary (#/words), tap-to-define in lessons, and flashcards (#/words/cards).

   - The glossary lists every word in lib/words.js with its definition, an example, the Procademy
     practice that uses it, a Read aloud button, and a star to keep it in your own deck. Search and grade filters.
   - VOCAB.linkify(el) underlines the first use of each word in a lesson; tapping it shows the definition.
     Only text is touched, never pictures or math layout, and everyday words (mean, range…) are left alone.
     Basic words a lesson uses all the time (fraction, angle, area…) are underlined only when the lesson is
     about them: VOCAB.linkify(el, { topic: 'Area of triangles' }) also underlines "area" once.
   - Flashcards come from your grade, your starred words, or every word, with spaced review: a word you
     know comes back after 3, then 7, 16, 37 days; one you don't, tomorrow and again later in the set.
     Kept per learner in STORE (words).
   - The Hindi deck (#/words/cards/hindi) is the Hindi course's words (HINDI.WORDS, content/hindi.js): Devanagari on
     the front, the meaning and how to say it on the back, with the same spaced review. Its ids start with h-. */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V._h, esc = H.esc, WD = window.WORDS;
  const BANDS = [['all', 'All'], ['k2', 'K–2'], ['35', '3–5'], ['6', '6th'], ['7', '7th'], ['8', '8th'], ['hs', 'High school']];
  const inBand = (w, b) => b === 'all' || (b === 'k2' && w.grade <= 2) || (b === '35' && w.grade >= 3 && w.grade <= 5) || (b === 'hs' && w.grade >= 9) || String(w.grade) === b;
  /** the learner's grade: from Profile, else the class book, else the first saved course */
  function myGrade() {
    const p = S.get().profile;
    if (p.grade != null && p.grade !== '') return Number(p.grade);
    const c = p.cpm && ACADEMY.cpmById(p.cpm.book);
    if (c && c.grade != null) return c.grade;
    const co = p.enrolled.map(id => ACADEMY.courseById(id)).filter(Boolean)[0];
    return co && co.grade != null ? co.grade : null;
  }
  const state = id => (S.get().words || {})[id] || null;
  const known = () => Object.keys(S.get().words || {}).filter(k => !k.startsWith('f-') && !k.startsWith('h-') && S.get().words[k].ivl >= 3).length;
  const hindiKnown = () => Object.keys(S.get().words || {}).filter(k => k.startsWith('h-') && S.get().words[k].ivl >= 3).length;
  /** the star on a word's card: drawn, filled when the word is starred (its color comes from .star / .star.on) */
  const starIcon = on => `<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" style="vertical-align:middle"><polygon points="10,1.5 12.6,7.2 18.8,7.8 14.1,12 15.5,18.2 10,15 4.5,18.2 5.9,12 1.2,7.8 7.4,7.2" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const practiceFor = w => (window.TUTORPAGE ? TUTORPAGE.related(w.term + ' ' + w.also.join(' '), myGrade()) : []).slice(0, 2);

  /* ---------- tap to define ---------- */
  /** basic words that are underlined only in a lesson about them (the rest of words.js's NO_LINK stay everyday words) */
  const BASIC = new Set(['circle', 'triangle', 'rectangle', 'angle', 'area', 'volume', 'equation', 'expression', 'fraction', 'decimal', 'integer', 'variable', 'factor', 'multiple', 'sum', 'difference', 'product', 'quotient', 'percent', 'ratio', 'digit', 'estimate', 'rounding']);
  const matchers = new Map();
  /** the pattern for the linked words, plus the basic words in `extra` (word ids) */
  function getMatcher(extra) {
    const key = (extra || []).slice().sort().join(',');
    if (matchers.has(key)) return matchers.get(key);
    const names = [];
    WD.LIST.filter(w => w.link || (extra || []).includes(w.id)).forEach(w => [w.term].concat(w.also).forEach(n => names.push([n, w.id])));
    names.sort((a, b) => b[0].length - a[0].length);
    const re = new RegExp(`(^|[^A-Za-z0-9-])(${names.map(([n]) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![A-Za-z0-9-])`, 'i');
    const lookup = new Map(names.map(([n, id]) => [n.toLowerCase(), id]));
    const m = { re, lookup };
    if (matchers.size < 60) matchers.set(key, m);
    return m;
  }
  /** the basic words a lesson's topic names: "Area of triangles" → area, triangle */
  const topicWords = topic => { const t = ' ' + String(topic || '').toLowerCase().replace(/<[^>]*>/g, ' ').replace(/[^a-z]+/g, ' ') + ' '; return [...BASIC].filter(id => [WD.byId[id].term].concat(WD.byId[id].also).some(n => t.includes(' ' + n.toLowerCase() + ' ') || t.includes(' ' + n.toLowerCase() + 's '))); };
  const SKIP = /^(A|BUTTON|SVG|CODE|PRE|SUP|SUB|INPUT|TEXTAREA|SELECT|LABEL|H1|H2|H3)$/i;
  /** underline the first use of each word in el (text only) */
  function linkify(el, opts) {
    if (!el) return 0;
    const { re, lookup } = getMatcher(opts && opts.topic ? topicWords(opts.topic) : null), used = new Set();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        for (let p = n.parentElement; p && p !== el; p = p.parentElement) {
          if (SKIP.test(p.tagName) || p.classList.contains('frac') || p.classList.contains('sqrt') || p.namespaceURI === 'http://www.w3.org/2000/svg') return NodeFilter.FILTER_REJECT;
        }
        return n.nodeValue.trim().length > 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    let count = 0;
    nodes.forEach(node => {
      let cur = node;
      while (cur) {
        const m = re.exec(cur.nodeValue);
        if (!m) break;
        const id = lookup.get(m[2].toLowerCase()), start = m.index + m[1].length, end = start + m[2].length;
        if (!id || used.has(id)) {                       // already underlined once: look further along
          if (end >= cur.nodeValue.length) break;
          cur = cur.splitText(end);
          continue;
        }
        used.add(id); count++;
        const word = cur.splitText(start), after = word.splitText(m[2].length);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'term'; b.dataset.word = id; b.textContent = word.nodeValue;
        b.setAttribute('aria-expanded', 'false');
        word.replaceWith(b);
        cur = after.nodeValue ? after : null;
      }
    });
    return count;
  }

  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } document.querySelectorAll('.term[aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
  function openPop(b) {
    closePop();
    const w = WD.byId[b.dataset.word]; if (!w) return;
    pop = document.createElement('div');
    pop.className = 'term-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', w.term);
    pop.innerHTML = `<div class="row between"><b>${esc(w.term)}</b><button type="button" class="iconbtn sm" data-pop-x aria-label="Close">✕</button></div>
      <p>${esc(w.def)}</p>${w.ex ? `<p class="small muted">${esc(w.ex)}</p>` : ''}
      <div class="btn-row" style="margin:6px 0 0">${window.COACH ? COACH.speakBtn(esc(w.term) + '. ' + esc(w.def), 'Read it aloud') : ''}<a class="btn sm ghost" href="#/words/${w.id}">View the full entry</a></div>`;
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect(), pw = Math.min(320, window.innerWidth - 24);
    pop.style.width = pw + 'px';
    pop.style.left = Math.max(12, Math.min(window.innerWidth - pw - 12, r.left + window.scrollX)) + 'px';
    pop.style.top = (r.bottom + window.scrollY + 6) + 'px';
    b.setAttribute('aria-expanded', 'true');
    pop.querySelector('[data-pop-x]').addEventListener('click', closePop);
  }
  let wired = false;
  function wire() {
    if (wired || typeof document === 'undefined') return;
    wired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('.term[data-word]');
      if (b) { ev.preventDefault(); if (b.getAttribute('aria-expanded') === 'true') closePop(); else openPop(b); return; }
      if (pop && !pop.contains(ev.target)) closePop();
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closePop(); });
    window.addEventListener('hashchange', closePop);
  }

  /* ---------- small drawings for some words, so the glossary shows as well as tells ---------- */
  const PS = 'stroke="var(--primary)" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const AX = 'stroke="var(--muted)" stroke-width="1.4" fill="none"';
  const FI = 'fill="var(--tint-2)" stroke="var(--primary)" stroke-width="2"';
  const TX = 'style="font:600 10px var(--font);fill:var(--ink)"';
  const DASH = 'stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="3 3" fill="none"';
  const PICS = {
    slope: `<path d="M8 64H114M16 70V4" ${AX}/><path d="M20 62 100 14" ${PS}/><path d="M40 50H70V32" ${DASH}/><text x="48" y="61" ${TX}>run</text><text x="74" y="44" ${TX}>rise</text>`,
    'right-angle': `<path d="M30 62H104M30 62V8" ${PS}/><path d="M30 50H42V62" stroke="var(--primary)" stroke-width="1.6" fill="none"/><text x="48" y="46" ${TX}>90°</text>`,
    'acute-angle': `<path d="M20 62H106M20 62 86 18" ${PS}/><path d="M44 62A24 24 0 0 0 40 48.7" stroke="var(--primary)" stroke-width="1.6" fill="none"/><text x="50" y="57" ${TX}>less than 90°</text>`,
    'obtuse-angle': `<path d="M62 62H112M62 62 26 20" ${PS}/><path d="M82 62A20 20 0 0 0 49 46.8" stroke="var(--primary)" stroke-width="1.6" fill="none"/><text x="70" y="42" ${TX}>more than 90°</text>`,
    angle: `<path d="M24 62H104M24 62 84 14" ${PS}/><path d="M50 62A26 26 0 0 0 44.3 45.8" stroke="var(--primary)" stroke-width="1.6" fill="none"/><circle cx="24" cy="62" r="3" fill="var(--primary)"/><text x="10" y="56" ${TX}>vertex</text>`,
    radius: `<circle cx="60" cy="36" r="27" ${FI}/><path d="M60 36H87" ${PS}/><circle cx="60" cy="36" r="2.6" fill="var(--primary)"/><text x="70" y="31" ${TX}>r</text>`,
    diameter: `<circle cx="60" cy="36" r="27" ${FI}/><path d="M33 36H87" ${PS}/><text x="57" y="31" ${TX}>d</text>`,
    circumference: `<circle cx="60" cy="36" r="27" fill="var(--tint)" stroke="var(--primary)" stroke-width="4"/><text x="92" y="16" ${TX}>C</text>`,
    perimeter: `<rect x="24" y="14" width="72" height="44" rx="2" fill="var(--tint)" stroke="var(--primary)" stroke-width="4"/><text x="34" y="40" ${TX}>around the edge</text>`,
    area: `<rect x="30" y="12" width="60" height="48" ${FI}/><path d="M42 12V60M54 12V60M66 12V60M78 12V60M30 24H90M30 36H90M30 48H90" stroke="var(--primary)" stroke-opacity=".35"/>`,
    'ordered-pair': `<path d="M14 62H114M20 68V4" ${AX}/><path d="M68 62V30H20" ${DASH}/><circle cx="68" cy="30" r="4" fill="var(--primary)"/><text x="74" y="26" ${TX}>(3, 2)</text>`,
    'coordinate-plane': `<path d="M6 36H114M60 70V2" ${AX}/><path d="M18 33V39M32 33V39M46 33V39M74 33V39M88 33V39M102 33V39M57 10H63M57 22H63M57 50H63M57 62H63" stroke="var(--muted)" stroke-width="1.2"/><text x="106" y="30" ${TX}>x</text><text x="65" y="9" ${TX}>y</text><circle cx="88" cy="22" r="3.6" fill="var(--primary)"/>`,
    'x-axis': `<path d="M6 36H114" stroke="var(--primary)" stroke-width="3"/><path d="M60 70V2" ${AX}/><text x="100" y="30" ${TX}>x-axis</text>`,
    'y-intercept': `<path d="M6 46H114M50 70V2" ${AX}/><path d="M10 44 104 2" ${PS}/><circle cx="50" cy="26.1" r="4" fill="var(--primary)"/><text x="56" y="34" ${TX}>crosses the y-axis</text>`,
    fraction: `<rect x="20" y="20" width="20" height="26" ${FI}/><rect x="40" y="20" width="20" height="26" ${FI}/><rect x="60" y="20" width="20" height="26" ${FI}/><rect x="80" y="20" width="20" height="26" fill="none" stroke="var(--primary)" stroke-width="2"/><text x="52" y="62" ${TX}>3/4</text>`,
    histogram: `<path d="M12 62H110" ${AX}/><rect x="20" y="44" width="16" height="18" ${FI}/><rect x="36" y="28" width="16" height="34" ${FI}/><rect x="52" y="16" width="16" height="46" ${FI}/><rect x="68" y="34" width="16" height="28" ${FI}/><rect x="84" y="50" width="16" height="12" ${FI}/>`,
    'box-plot': `<path d="M10 60H110" ${AX}/><path d="M18 30H40M80 30H102M18 22V38M102 22V38" stroke="var(--primary)" stroke-width="2"/><rect x="40" y="18" width="40" height="24" ${FI}/><path d="M56 18V42" stroke="var(--primary)" stroke-width="3"/>`,
    'absolute-value': `<path d="M8 50H112" ${AX}/><path d="M30 46V54M60 44V56M90 46V54" stroke="var(--muted)" stroke-width="1.4"/><path d="M30 40Q45 22 60 40" ${PS}/><text x="25" y="66" ${TX}>−3</text><text x="57" y="66" ${TX}>0</text><text x="42" y="24" ${TX}>3</text>`,
    integer: `<path d="M8 40H112" ${AX}/>${[-3, -2, -1, 0, 1, 2, 3].map(k => `<circle cx="${60 + k * 14}" cy="40" r="3.4" fill="var(--primary)"/><text x="${57 + k * 14 - (k < 0 ? 3 : 0)}" y="58" ${TX}>${k < 0 ? '−' + -k : k}</text>`).join('')}`,
    hypotenuse: `<path d="M20 60H100M20 60V14" stroke="var(--muted)" stroke-width="2.4" fill="none"/><path d="M20 14 100 60" ${PS}/><path d="M20 50H30V60" stroke="var(--muted)" stroke-width="1.4" fill="none"/><text x="64" y="32" ${TX}>hypotenuse</text>`,
    volume: `<path d="M30 30 54 18 94 18 70 30Z" fill="var(--tint)" stroke="var(--primary)" stroke-width="2"/><path d="M70 30V62H30V30Z" ${FI}/><path d="M70 62 94 50V18" fill="var(--tint-2)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round"/>`,
    triangle: `<path d="M18 62H102L54 12Z" ${FI}/>`,
    rectangle: `<rect x="22" y="16" width="76" height="44" ${FI}/><path d="M22 26H32V16M88 16V26H98M98 50H88V60M32 60V50H22" stroke="var(--primary)" stroke-width="1.4" fill="none"/>`,
    quadrilateral: `<path d="M16 58 34 14 96 20 106 60Z" ${FI}/>`,
  };
  const pic = id => (PICS[id] ? `<svg class="word-pic" viewBox="0 0 120 72" aria-hidden="true">${PICS[id]}</svg>` : '');

  /* ---------- the formula sheet (#/words/formulas): grade by grade, with what each letter means ---------- */
  const FORMULAS = [
    ['35', 'Perimeter of a rectangle', 'P = 2l + 2w', 'l is the length and w is the width.'],
    ['35', 'Area of a rectangle', 'A = l × w', 'Length times width, in square units.'],
    ['35', 'Area of a square', 'A = s<sup>2</sup>', 's is the length of a side.'],
    ['35', 'Volume of a rectangular prism', 'V = l × w × h', 'Length times width times height, in cubic units.'],
    ['6', 'Area of a triangle', 'A = ½ b h', 'b is the base and h the height, at a right angle to the base.'],
    ['6', 'Area of a parallelogram', 'A = b h', 'Base times height (not the slanted side).'],
    ['6', 'Area of a trapezoid', 'A = ½ (b<sub>1</sub> + b<sub>2</sub>) h', 'b₁ and b₂ are the two parallel sides; h is the height.'],
    ['6', 'Mean (average)', 'mean = sum ÷ count', 'Add the values, then divide by how many there are.'],
    ['6', 'Unit rate', 'rate = amount ÷ units', 'How much for one: dollars per pound, miles per hour.'],
    ['6', 'Percent of a number', 'part = percent × whole', 'Write the percent as a decimal first: 15% = 0.15.'],
    ['7', 'Circumference of a circle', 'C = 2πr = πd', 'r is the radius, d the diameter; π ≈ 3.14.'],
    ['7', 'Area of a circle', 'A = πr<sup>2</sup>', 'r is the radius.'],
    ['7', 'Proportional relationship', 'y = kx', 'k is the constant of proportionality (the unit rate).'],
    ['7', 'Simple interest', 'I = P r t', 'P is the starting amount, r the rate as a decimal, t the time in years.'],
    ['7', 'Percent change', 'change = (new − old) ÷ old', 'Times 100 for a percent. Positive is an increase, negative a decrease.'],
    ['7', 'Probability', 'P(event) = favorable ÷ total', 'The number of ways it can happen over all equally likely outcomes.'],
    ['8', 'Pythagorean theorem', 'a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>', 'a and b are the legs of a right triangle; c is the hypotenuse.'],
    ['8', 'Slope', 'm = (y<sub>2</sub> − y<sub>1</sub>) ÷ (x<sub>2</sub> − x<sub>1</sub>)', 'Rise over run between two points (x₁, y₁) and (x₂, y₂).'],
    ['8', 'Slope-intercept form', 'y = mx + b', 'm is the slope; b is where the line crosses the y-axis.'],
    ['8', 'Volume of a cylinder', 'V = πr<sup>2</sup>h', 'The area of the circle times the height.'],
    ['8', 'Volume of a cone', 'V = ⅓πr<sup>2</sup>h', 'A third of the cylinder with the same base and height.'],
    ['8', 'Volume of a sphere', 'V = 4⁄3 πr<sup>3</sup>', 'r is the radius.'],
    ['8', 'Exponent rules', 'a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup>, (a<sup>m</sup>)<sup>n</sup> = a<sup>mn</sup>, a<sup>0</sup> = 1, a<sup>−n</sup> = 1 ÷ a<sup>n</sup>', 'Multiplying powers of the same base adds the exponents.'],
    ['8', 'Scientific notation', 'a × 10<sup>n</sup>', 'a is at least 1 and less than 10; n is a whole number.'],
    ['hs', 'Point-slope form', 'y − y<sub>1</sub> = m(x − x<sub>1</sub>)', 'A line with slope m through the point (x₁, y₁).'],
    ['hs', 'Standard form of a line', 'Ax + By = C', 'A, B and C are whole numbers.'],
    ['hs', 'Quadratic formula', 'x = (−b ± √(b<sup>2</sup> − 4ac)) ÷ 2a', 'The solutions of ax² + bx + c = 0.'],
    ['hs', 'Vertex form', 'y = a(x − h)<sup>2</sup> + k', 'The vertex is (h, k).'],
    ['hs', 'Distance between two points', 'd = √((x<sub>2</sub> − x<sub>1</sub>)<sup>2</sup> + (y<sub>2</sub> − y<sub>1</sub>)<sup>2</sup>)', 'The Pythagorean theorem on the coordinate plane.'],
    ['hs', 'Midpoint', 'M = ((x<sub>1</sub> + x<sub>2</sub>) ÷ 2, (y<sub>1</sub> + y<sub>2</sub>) ÷ 2)', 'The average of the x values and of the y values.'],
    ['hs', 'Equation of a circle', '(x − h)<sup>2</sup> + (y − k)<sup>2</sup> = r<sup>2</sup>', 'Center (h, k), radius r.'],
    ['hs', 'Arithmetic sequence', 'a<sub>n</sub> = a<sub>1</sub> + (n − 1)d', 'd is the amount added each time.'],
    ['hs', 'Geometric sequence', 'a<sub>n</sub> = a<sub>1</sub> · r<sup>n − 1</sup>', 'r is the amount multiplied each time.'],
    ['hs', 'Compound interest', 'A = P(1 + r ÷ n)<sup>nt</sup>', 'n is how many times a year interest is added.'],
    ['hs', 'Trigonometric ratios', 'sin = opp ÷ hyp, cos = adj ÷ hyp, tan = opp ÷ adj', 'In a right triangle, from one of the acute angles (SOH CAH TOA).'],
  ];
  const BAND_NAME = { 35: 'Grades 3–5', 6: '6th grade', 7: '7th grade', 8: '8th grade', hs: 'High school' };
  const wordTabs = on => `<div class="tabs words-tabs" role="tablist" aria-label="Math words">${[['words', '#/words', 'Words'], ['formulas', '#/words/formulas', 'Formulas'], ['cards', '#/words/cards', 'Flashcards']].map(([k, h, l]) => `<a class="tab${k === on ? ' on' : ''}" role="tab" aria-selected="${k === on}" href="${h}">${l}</a>`).join('')}</div>`;
  function formulas(root) {
    const g = myGrade();
    let band = g == null ? 'all' : g <= 5 ? '35' : g >= 9 ? 'hs' : String(g), q = '';
    const bands = [['all', 'All'], ['35', '3–5'], ['6', '6th'], ['7', '7th'], ['8', '8th'], ['hs', 'High school']];
    root.innerHTML = `<div class="words-page">
      <div class="row between" style="flex-wrap:wrap;gap:10px;align-items:flex-end"><div><h1 style="margin:0">Formulas</h1><p class="muted" style="margin:4px 0 0">The formulas used in math class, grade by grade, with what each letter means.</p></div><a class="btn primary sm" href="#/words/cards" id="fm-cards">Study them as flashcards</a></div>
      ${wordTabs('formulas')}
      <div class="card tight words-tools"><input id="fm-q" type="search" placeholder="Find a formula: “area”, “slope”, “interest”…" aria-label="Find a formula" autocomplete="off">
        <div class="tabs" role="group" aria-label="Grade">${bands.map(([v, l]) => `<button type="button" class="tab" data-band="${v}" aria-pressed="false">${l}</button>`).join('')}</div><span class="small muted" id="fm-count"></span></div>
      <div id="fm-list" class="formula-list"></div></div>`;
    const norm = t => ACADEMY.normText(String(t).replace(/<[^>]+>/g, ' '));
    const draw = () => {
      const list = FORMULAS.filter(f => (band === 'all' || f[0] === band) && (!q || norm(f[1] + ' ' + f[2] + ' ' + f[3]).includes(norm(q))));
      root.querySelector('#fm-list').innerHTML = list.length ? list.map(([b, name, eq, where]) => `<article class="card formula"><div class="row between" style="align-items:flex-start;gap:8px"><h3>${esc(name)}</h3><span class="chip">${BAND_NAME[b]}</span></div><div class="formula-eq">${eq}</div><p class="small muted" style="margin:0">${esc(where)}</p></article>`).join('')
        : '<div class="card empty">No formula matches. Try a shorter search.</div>';
      root.querySelector('#fm-count').textContent = `${list.length} of ${FORMULAS.length} formulas`;
      root.querySelectorAll('[data-band]').forEach(b => { b.classList.toggle('on', b.dataset.band === band); b.setAttribute('aria-pressed', String(b.dataset.band === band)); });
    };
    root.querySelector('#fm-q').addEventListener('input', ev => { q = ev.target.value.trim(); if (q) band = 'all'; draw(); });
    root.querySelector('#fm-cards').addEventListener('click', () => { wantDeck = 'formulas'; });
    root.querySelectorAll('[data-band]').forEach(b => b.addEventListener('click', () => { band = b.dataset.band; draw(); }));
    draw();
    H.tutorCtx({ notes: 'The student is looking at the formula sheet.' });
  }

  /* ---------- the glossary ---------- */
  function page(root, focusId) {
    if (focusId === 'formulas') return formulas(root);
    const g = myGrade(), starred = () => (S.get().profile.starredWords || []);
    let band = 'all', q = '';
    const draw = () => {
      const words = WD.LIST.filter(w => inBand(w, band) && (!q || A_norm(w.term + ' ' + w.also.join(' ') + ' ' + w.def).includes(A_norm(q)))).sort((a, b) => a.term.localeCompare(b.term));
      root.querySelector('#wd-list').innerHTML = words.length ? words.map(w => {
        const st = state(w.id), on = starred().includes(w.id), prac = practiceFor(w);
        return `<article class="card word${w.id === focusId ? ' focus' : ''}" id="w-${w.id}">
          <div class="row between" style="align-items:flex-start"><h3>${esc(w.term)}</h3><span class="row" style="gap:4px">${st && st.ivl >= 3 ? '<span class="chip up" title="You know this word">Known</span>' : ''}<span class="chip">${w.grade === 0 ? 'K' : w.grade >= 9 ? 'HS' : 'Grade ' + w.grade}</span>
            <button type="button" class="iconbtn sm star${on ? ' on' : ''}" data-star="${w.id}" aria-pressed="${on}" aria-label="${on ? 'Remove from' : 'Add to'} my flashcards" title="${on ? 'Starred' : 'Add to your flashcards'}">${starIcon(on)}</button></span></div>
          ${pic(w.id)}<p>${esc(w.def)}</p>${w.ex ? `<p class="small muted word-ex">${esc(w.ex)}</p>` : ''}
          ${w.also.length ? `<p class="tiny muted">Also: ${w.also.map(esc).join(', ')}</p>` : ''}
          <div class="btn-row" style="margin:6px 0 0">${window.COACH ? COACH.speakBtn(esc(w.term) + '. ' + esc(w.def) + ' ' + esc(w.ex || ''), 'Read it aloud') : ''}
            ${prac.map(id => `<a class="btn sm ghost" href="#/practice/${encodeURIComponent(id)}">Practice: ${ACADEMY.skills[id].title}</a>`).join('')}</div></article>`;
      }).join('') : '<div class="card empty">No words match. Try a shorter search.</div>';
      root.querySelector('#wd-count').textContent = `${words.length} of ${WD.LIST.length} words`;
      root.querySelectorAll('[data-band]').forEach(b => { b.classList.toggle('on', b.dataset.band === band); b.setAttribute('aria-pressed', String(b.dataset.band === band)); });
      root.querySelectorAll('[data-star]').forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.star, list = starred(), on = list.includes(id);
        S.setProfile({ starredWords: on ? list.filter(x => x !== id) : list.concat(id) });
        draw();
      }));
    };
    const A_norm = t => ACADEMY.normText(t);
    root.innerHTML = `<div class="words-page">
      <div class="row between" style="flex-wrap:wrap;gap:10px"><div><h1 style="margin:0">Math words</h1><p class="muted" style="margin:4px 0 0">The words used in math class, each defined in plain language with an example. Select the star beside a word to add it to your flashcards.</p></div>
</div>
      <div class="row between words-head">${wordTabs('words')}<a class="btn primary sm" href="#/words/cards">Study flashcards${known() ? ` · ${known()} known` : ''}</a></div>
      <div class="card tight words-tools"><input id="wd-q" type="search" placeholder="Find a word: “slope”, “ratio”, “median”…" aria-label="Find a word" autocomplete="off">
        <div class="tabs" role="group" aria-label="Grade">${BANDS.map(([v, l]) => `<button type="button" class="tab" data-band="${v}" aria-pressed="false">${l}</button>`).join('')}</div><span class="small muted" id="wd-count"></span></div>
      <div id="wd-list" class="words-list"></div></div>`;
    root.querySelector('#wd-q').addEventListener('input', ev => { q = ev.target.value.trim(); draw(); });
    root.querySelectorAll('[data-band]').forEach(b => b.addEventListener('click', () => { band = b.dataset.band; draw(); }));
    if (focusId && WD.byId[focusId]) band = 'all';
    else if (g != null) band = g <= 2 ? 'k2' : g <= 5 ? '35' : g >= 9 ? 'hs' : String(g);
    draw();
    if (focusId) { const el = root.querySelector('#w-' + focusId); if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 0); }
    H.tutorCtx({ notes: 'The student is looking at the glossary of math words.' });
  }

  /* ---------- flashcards ---------- */
  const GAPS = [3, 7, 16, 37, 85];
  /** the formula sheet as cards: the name on the front, the formula and what its letters mean on the back */
  const formulaCards = () => FORMULAS.map(([band, name, eq, where]) => ({ id: 'f-' + ACADEMY.normText(name).replace(/\s+/g, '-'), term: name, html: eq, def: where, band, grade: band === '35' ? 4 : band === 'hs' ? 9 : Number(band), formula: true }));
  const bandOf = g => (g == null ? null : g <= 5 ? '35' : g >= 9 ? 'hs' : String(g));
  let wantDeck = null;                                     // a deck to open with, from the formula sheet's button
  /** the Hindi course's words as cards, in the course's order: Devanagari on the front */
  const hindiCards = () => (window.HINDI ? HINDI.WORDS : []).map((w, n) => ({ id: w.id, term: w.dev, def: w.en.charAt(0).toUpperCase() + w.en.slice(1), rom: w.rom, topic: w.topic, grade: w.order, n, hindi: true }));
  function deckOf(kind) {
    const g = myGrade(), st = S.get().profile.starredWords || [];
    if (kind === 'hindi') return hindiCards();
    if (kind === 'formulas') { const b = bandOf(g), all = formulaCards(); const mine = b ? all.filter(f => f.band === b || (b !== '35' && f.band === '35' && g <= 7)) : all; return mine.length ? mine : all; }
    if (kind === 'starred') return WD.LIST.filter(w => st.includes(w.id));
    if (kind === 'all') return WD.LIST.slice();
    const lo = g == null ? 0 : Math.max(0, g - 1), hi = g == null ? 8 : g + 1;
    return WD.LIST.filter(w => w.grade >= lo && w.grade <= hi);
  }
  /** a set of up to n cards: words due first, then new ones (earlier grades first) */
  function pickSet(kind, n) {
    const today = S.today(), deck = deckOf(kind);
    const due = deck.filter(w => { const s = state(w.id); return s && s.due <= today; }).sort((a, b) => state(a.id).due.localeCompare(state(b.id).due));
    const fresh = deck.filter(w => !state(w.id)).sort((a, b) => a.grade - b.grade || (a.n != null && b.n != null ? a.n - b.n : a.term.localeCompare(b.term)));
    return due.concat(fresh).slice(0, n);
  }
  function cards(root, deck) {
    let kind = deck || wantDeck || (S.get().profile.starredWords && S.get().profile.starredWords.length ? 'starred' : 'grade');
    wantDeck = null;
    const back = deck === 'hindi' ? '<a class="btn sm ghost back" href="#/course/hindi">← Hindi for beginners</a>' : '<a class="btn sm ghost back" href="#/words">← Math words</a>';
    function chooser() {
      const counts = { grade: pickSet('grade', 999).length, starred: pickSet('starred', 999).length, all: pickSet('all', 999).length, formulas: pickSet('formulas', 999).length, hindi: pickSet('hindi', 999).length };
      root.innerHTML = `<div class="cards-page"><div class="ex-head">${back}<h1>Flashcards</h1></div>
        <div class="card"><p>Read the word and state its meaning, aloud or silently. Then flip the card and record honestly whether you knew it. Words you know return less and less often; the others return soon.</p>
          <div class="deck-pick" role="radiogroup" aria-label="Which words">${[['grade', `Words for your grade${myGrade() != null ? ` (${myGrade() === 0 ? 'K' : myGrade() >= 9 ? 'high school' : myGrade() + 'th'})` : ''}`], ['starred', 'Your starred words'], ['all', 'All words'], ['formulas', 'Formulas for your grade']].concat(window.HINDI ? [['hindi', 'Hindi words']] : []).map(([v, l]) => `<label class="deck-opt"><input type="radio" name="deck" value="${v}" ${kind === v ? 'checked' : ''} ${counts[v] ? '' : 'disabled'}> <span><b>${l}</b><span class="small muted"> · ${counts[v] ? `${counts[v]} to review` : v === 'starred' ? 'star words in the glossary first' : 'none due today'}</span></span></label>`).join('')}</div>
          <p class="small muted">${known()} of ${WD.LIST.length} math words known so far${hindiKnown() ? `, and ${hindiKnown()} of ${hindiCards().length} Hindi words` : ''}.</p>
          <button class="btn primary" id="cd-go">Start a set of 12 cards</button></div></div>`;
      root.querySelectorAll('input[name="deck"]').forEach(r => r.addEventListener('change', () => { kind = r.value; }));
      root.querySelector('#cd-go').addEventListener('click', () => play(pickSet(kind, 12)));
    }
    function play(set) {
      if (!set.length) { chooser(); V.toast('There is nothing to review in that deck today.'); return; }
      const queue = set.slice(), results = { knew: 0, notyet: 0, again: new Set() };
      let flipped = false;
      const show = () => {
        if (!queue.length) return done();
        const w = queue[0];
        const face = w.hindi
          ? (flipped ? `<span class="fc-term small muted hi" lang="hi">${esc(w.term)}</span><span class="fc-def">${esc(w.def)}</span><span class="fc-ex">Say it: ${esc(w.rom)}</span>` : `<span class="fc-term hi" lang="hi">${esc(w.term)}</span><span class="fc-hint small muted">What does it mean? Select the card to flip it.</span>`)
          : flipped ? `<span class="fc-term small muted">${esc(w.term)}</span>${w.formula ? `<span class="fc-def formula-eq">${w.html}</span><span class="fc-ex">${esc(w.def)}</span>` : `<span class="fc-def">${esc(w.def)}</span>${w.ex ? `<span class="fc-ex">${esc(w.ex)}</span>` : ''}`}` : `<span class="fc-term">${esc(w.term)}</span><span class="fc-hint small muted">${w.formula ? 'What is the formula? Say it, then select the card to flip it.' : 'What does it mean? Select the card to flip it.'}</span>`;
        const say = w.hindi ? (window.HINDI ? HINDI.listen(esc(w.term)) : '') : window.COACH ? COACH.speakBtn(esc(w.term) + (flipped ? '. ' + esc(w.def) : ''), 'Read it aloud') : '';
        root.innerHTML = `<div class="cards-page"><div class="ex-head"><a class="btn sm ghost back" href="${deck === 'hindi' ? '#/words/cards/hindi' : '#/words/cards'}">← Decks</a><h1>${w.hindi ? 'Hindi flashcards' : 'Flashcards'}</h1><span class="muted small">${queue.length} remaining</span></div>
          <button type="button" class="flashcard${flipped ? ' flipped' : ''}" id="fc" aria-label="${flipped ? 'Definition' : 'Flip the card to see what it means'}">
            ${face}</button>
          <div class="btn-row fc-actions">${flipped ? `<button class="btn" id="fc-no">Not yet <span class="muted small">(1)</span></button><button class="btn primary" id="fc-yes">I knew it <span class="small">(2)</span></button>` : `<button class="btn primary" id="fc-flip">Flip the card <span class="small">(Space)</span></button>`}${say}</div></div>`;
        root.querySelector('#fc').addEventListener('click', () => { flipped = !flipped; show(); });
        const f = root.querySelector('#fc-flip'); if (f) { f.addEventListener('click', () => { flipped = true; show(); }); f.focus(); }
        const yes = root.querySelector('#fc-yes'), no = root.querySelector('#fc-no');
        if (yes) { yes.addEventListener('click', () => answer(true)); yes.focus(); }
        if (no) no.addEventListener('click', () => answer(false));
      };
      const answer = good => {
        const w = queue.shift(), st = state(w.id) || { ivl: 0, seen: 0, right: 0 };
        if (results.again.has(w.id)) { if (good) results.knew += 0; }                     // a second look in the same set changes nothing more
        else {
          const ivl = good ? (GAPS.find(x => x > (st.ivl || 0)) || 90) : 1;
          S.setWord(w.id, { ivl: good ? ivl : 1, due: S.dayShift(S.today(), good ? ivl : 1), seen: (st.seen || 0) + 1, right: (st.right || 0) + (good ? 1 : 0) });
          if (good) results.knew++; else { results.notyet++; results.again.add(w.id); queue.splice(Math.min(3, queue.length), 0, w); }
        }
        flipped = false; show();
      };
      const done = () => {
        if (results.knew) S.addPoints(results.knew * 2);
        const isF = set.length && set[0].formula, isH = set.length && set[0].hindi;
        S.logEvent({ kind: 'cards', title: isF ? 'Formulas' : isH ? 'Hindi words' : 'Math words', right: results.knew, total: results.knew + results.notyet, pts: results.knew * 2, changes: [] });
        if (window.APP) APP.refreshStats();
        root.innerHTML = `<div class="cards-page"><div class="card summary"><div class="muted small" style="text-transform:uppercase;letter-spacing:.05em;font-weight:700">Flashcards</div>
          <h1 style="margin-top:6px">${results.notyet ? 'Session complete' : isF ? 'All formulas known' : 'All words known'}</h1><div class="score">${results.knew} / ${results.knew + results.notyet}</div>
          <div class="what">${results.notyet ? `${H.plural(results.notyet, isF ? 'formula' : 'word')} will return tomorrow.` : `These ${isF ? 'formulas' : 'words'} will return in a few days for review.`} ${isF ? `${Object.keys(S.get().words || {}).filter(k => k.startsWith('f-') && S.get().words[k].ivl >= 3).length} of ${FORMULAS.length} formulas known.` : isH ? `${hindiKnown()} of ${hindiCards().length} Hindi words known.` : `${known()} of ${WD.LIST.length} words known.`}</div>
          <div class="chip" style="font-size:1rem">+${results.knew * 2} points</div>
          <div class="btn-row"><a class="btn primary" href="#/words/cards" id="cd-more">Study more cards</a>${isH ? '<a class="btn" href="#/course/hindi">Back to the Hindi course</a>' : '<a class="btn" href="#/words">View all words</a>'}</div></div></div>`;
        root.__cards = results;
        const more = root.querySelector('#cd-more'); more.addEventListener('click', ev => { ev.preventDefault(); chooser(); });
      };
      if (root.__cardKeys) document.removeEventListener('keydown', root.__cardKeys);
      root.__cardKeys = ev => {
        if (!root.isConnected || !root.querySelector('#fc')) return;
        if (ev.key === ' ' && !root.querySelector('#fc-yes')) { ev.preventDefault(); flipped = true; show(); }
        else if (ev.key === '1' && root.querySelector('#fc-no')) answer(false);
        else if (ev.key === '2' && root.querySelector('#fc-yes')) answer(true);
      };
      document.addEventListener('keydown', root.__cardKeys);
      root.__cards = results;
      show();
    }
    chooser();
    root.__play = play;                                    // for the test suite
  }

  window.VOCAB = { linkify, page, cards, pickSet, deckOf, known, hindiKnown, myGrade, wire, formulas, FORMULAS, PICS };
  wire();
})();
