/* The graphing calculator (#/graph): type equations, inequalities, points and shapes, one per line, and
   see them drawn as you type. A letter set to a number (m = 2) becomes a slider, so "y = m x + b" can be
   explored by dragging. Everything is drawn by lib/draw.js on this device; it works offline.
   Made to be easy for a first-time grapher:
   - one-tap starters (a line, a parabola, a circle…) instead of having to know what to type;
   - a math keypad (x, ², √, |a|, ≤ and the digits) that types at the cursor. On a wide screen it sits under
     the list; on a narrow one it opens over the bottom of the screen while a line is being edited, in place of
     the phone's own keyboard (ABC brings that back for letters), and the graph stays in view above it;
   - forgiving input (2x + 1 alone, f(x) = …, x², √x, 2(x + 1)), and when a line can't be read, a hint about
     that line, with a button that adds sliders for letters that have no value yet.
   The lines are kept on this device (localStorage procademy.graph.v1); Copy link puts them in the
   address (#/graph/<code>) to share or bookmark, and "Open in calculator" on any graph the tutor drew
   lands here. */
'use strict';
(function () {
  const D = window.DRAW, H = window.VIEWS._h, esc = H.esc, A = window.ACADEMY, S = window.STORE;
  const KEY = 'procademy.graph.v1';
  const DEFAULT = ['y = 2x + 1', ''];
  /** the starters: [name, what it shows, its lines, a little picture (SVG inside a 24 × 24 box), what it means in a sentence] */
  const STARTERS = [
    ['A line', 'y = mx + b, with sliders', 'y = m x + b\nm = 2\nb = 1', '<path d="M3 19 21 5"/>', 'm is the slope, how steep the line is; b is where it crosses the y-axis. Drag the sliders to see each one change the line.'],
    ['A parabola', 'Vertex form, with sliders', 'y = a(x - h)² + k\na = 1\nh = 2\nk = -3', '<path d="M4 4Q12 30 20 4"/>', 'The turning point (the vertex) is at (h, k), and a sets how wide the U is and whether it opens up or down.'],
    ['Absolute value', 'A V shape, with sliders', 'y = a|x - h| + k\na = 1\nh = 0\nk = -2', '<path d="M4 5l8 13 8-13"/>', 'The point of the V is at (h, k), and a sets how steep its sides are.'],
    ['A circle', 'Center (0, 0), radius r', 'x² + y² = r²\nr = 4', '<circle cx="12" cy="12" r="7.5"/>', 'Every point on the circle is the same distance, r, from the center (0, 0).'],
    ['A point', 'A(2, 3)', 'A(2, 3)', '<circle cx="12" cy="12" r="3.2" fill="currentColor"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4" opacity=".45"/>', 'A point is written (x, y): go 2 right along the x-axis, then 3 up.'],
    ['An inequality', 'Shading for y < 2x − 1', 'y < 2x - 1', '<path d="M3 21 21 4v17z" fill="currentColor" opacity=".22" stroke="none"/><path d="M3 21 21 4" stroke-dasharray="3 2.4"/>', 'The shaded side is every point that makes it true. A dashed line means points on the line don’t count.'],
    ['Two lines meeting', 'Where y = 2x + 1 meets y = −x + 4', 'y = 2x + 1\ny = -x + 4', '<path d="M3 19 21 6M3 6l18 13"/><circle cx="12" cy="12.4" r="2" fill="currentColor"/>', 'Where two lines cross is the one point that fits both equations, the solution of the system.'],
    ['Exponential', 'y = a · bˣ, with sliders', 'y = a(b)^x\na = 1\nb = 2 {0.1 to 4}', '<path d="M3 20c8 0 13-3 18-17"/>', 'Each step of 1 to the right multiplies y by b: it grows when b is more than 1 and shrinks when it is less.'],
    ['A best-fit line', 'Points, and the line that fits them best', 'points (1, 2) (2, 3.5) (3, 3.5) (4, 5.5) (5, 6) (6, 7.5)\nbest fit', '<path d="M3 20 21 5" opacity=".55"/><circle cx="6" cy="16" r="1.9" fill="currentColor"/><circle cx="10" cy="15" r="1.9" fill="currentColor"/><circle cx="14" cy="9" r="1.9" fill="currentColor"/><circle cx="18" cy="8" r="1.9" fill="currentColor"/>', 'The best-fit line passes as close as it can to every point. Drag a point and the line follows; r near 1 or −1 means the points lie close to a line.'],
  ];
  const EXAMPLES = STARTERS.map(s => [s[0], s[2]]);
  /** the keypad, in three blocks: algebra, digits, and moving about. [label, typed, back (keys to step back), aria-label]
      or [label, action, aria-label] for the actions */
  const PAD = [
    [['x', 'x'], ['y', 'y'], ['x²', '²', 0, 'squared'], ['xʸ', '^', 0, 'to the power'],
      ['(', '('], [')', ')'], ['<', '<', 0, 'less than'], ['>', '>', 0, 'greater than'],
      ['|a|', '||', 1, 'absolute value'], [',', ', ', 0, 'comma'], ['≤', ' ≤ ', 0, 'less than or equal to'], ['≥', ' ≥ ', 0, 'greater than or equal to'],
      ['ABC', '@abc', 'letters keyboard'], ['sin', 'sin()', 1, 'sine'], ['√', '√()', 1, 'square root'], ['π', 'π', 0, 'pi'], ['a/b', '/', 0, 'fraction bar']],
    [['7', '7'], ['8', '8'], ['9', '9'], ['÷', ' ÷ ', 0, 'divide'],
      ['4', '4'], ['5', '5'], ['6', '6'], ['×', ' × ', 0, 'times'],
      ['1', '1'], ['2', '2'], ['3', '3'], ['−', ' − ', 0, 'minus'],
      ['0', '0'], ['.', '.', 0, 'point'], ['=', ' = ', 0, 'equals'], ['+', ' + ', 0, 'plus']],
    [['⌫', '@del', 'delete'], ['←', '@left', 'move left'], ['→', '@right', 'move right'], ['↵', '@enter', 'new line']],
  ];
  /** kept on this device: the lines on screen, and graphs saved by name (an older copy is just the lines) */
  const raw = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const load = () => { const v = raw(), ls = Array.isArray(v) ? v : v && Array.isArray(v.lines) ? v.lines : null; return ls && ls.length ? ls.map(String) : null; };
  const savedList = () => { const v = raw(); return v && Array.isArray(v.saved) ? v.saved.filter(g => g && typeof g.name === 'string' && Array.isArray(g.lines)) : []; };
  const store = (lines, saved) => { try { localStorage.setItem(KEY, JSON.stringify({ lines: lines.slice(0, 60), saved: (saved || savedList()).slice(0, 40) })); } catch (e) { /* fine */ } };

  /* ---------- help for a line that can't be read ---------- */
  const FNS = /sqrt|cbrt|abs|arcsin|arccos|arctan|asin|acos|atan|sin|cos|tan|sec|csc|cot|ln|log|exp|floor|ceil|round|pi|tau/g;
  const and = xs => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
  /** the letters a line uses that have no value yet, when giving them sliders would make it draw */
  function missing(line, lines) {
    const s = line.replace(/["“”'‘’][^"“”'‘’]*["“”'‘’]/g, ' ').replace(/√/g, 'sqrt').replace(/π/g, 'pi').toLowerCase();
    if (/^\s*[a-z]{3,}\b/.test(s.replace(FNS, ''))) return null;                    // a command: point, circle, title…
    const params = lines.filter(l => D.paramOf(l)), have = new Set(params.map(l => D.paramOf(l).name));
    const letters = [...new Set(s.replace(FNS, ' ').match(/[a-df-wz]/g) || [])].filter(c => !have.has(c));
    if (!letters.length || letters.length > 4) return null;
    return D.lineStatus(params.concat(letters.map(c => c + ' = 1'), [line])).pop() === 'ok' ? letters : null;
  }
  /** what to try for a line that can't be read: { text, add } (add: letters to give sliders) */
  function hint(line, lines) {
    const s = line.trim(), last = s.slice(-1);
    const miss = missing(s, lines);
    if (miss) return { text: `${and(miss)} ${miss.length > 1 ? 'don’t have values' : 'doesn’t have a value'} yet.`, add: miss };
    const count = re => (s.match(re) || []).length;
    let text;
    if (/≠|!=/.test(s)) text = 'A line with ≠ can’t be drawn. Try <, >, ≤ or ≥.';
    else if (/^[=<>≤≥]/.test(s)) text = 'Put y in front, like y = 2x + 1.';
    else if (/[=<>≤≥]$/.test(s)) text = 'Finish the right side, like y = 2x + 1.';
    else if (count(/=/g) > 1 && !/[<>]/.test(s)) text = 'Use just one = sign.';
    else if (count(/[([{]/g) > count(/[)\]}]/g)) text = 'Close the parenthesis: add “)”.';
    else if (count(/[([{]/g) < count(/[)\]}]/g)) text = 'There’s an extra “)”. Delete it, or add “(” where it starts.';
    else if (count(/\|/g) % 2) text = 'Close the absolute value with another “|”.';
    else if (/[-+*/^×÷−,.]/.test(last)) text = `Finish the line: it ends with “${last}”.`;
    else if (/y/i.test(s) && !/[=<>≤≥]/.test(s)) text = 'Add an = sign, like x + y = 4.';
    else text = 'Procademy can’t read this line. Try something like y = 2x + 1, or tap a starter above.';
    return { text, add: null };
  }

  let keypad = null;                                            // the keypad of the page on screen, which may sit on <body>

  /* ---------- a best-fit line: the line "best fit" becomes y = ax + b through every point on the graph ---------- */
  const PAIR = /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  const FIT = /^\s*(?:best[\s-]*fit|fit)(?:\s+line)?\s*$/i;
  const isPoints = l => /^\s*(?:points?\b|[A-Z][\w']*\s*\(|\()/i.test(l) && !FIT.test(l);
  const n3 = x => String(Number(x.toFixed(3))).replace('-', '−');
  /** the least-squares line through the points, or null: { a, b, r, n, text } */
  function bestFit(lines) {
    const pts = [];
    lines.filter(isPoints).forEach(l => { for (const m of l.matchAll(PAIR)) pts.push([Number(m[1]), Number(m[2])]); });
    const n = pts.length;
    if (n < 2) return null;
    const sx = pts.reduce((t, p) => t + p[0], 0), sy = pts.reduce((t, p) => t + p[1], 0), mx = sx / n, my = sy / n;
    let sxx = 0, sxy = 0, syy = 0;
    pts.forEach(([x, y]) => { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); syy += (y - my) ** 2; });
    if (!sxx) return null;
    const a = sxy / sxx, b = my - a * mx, r = syy ? sxy / Math.sqrt(sxx * syy) : 1;
    const B = Number(b.toFixed(3));
    return { a, b, r, n, text: `y = ${Number(a.toFixed(3))}x ${B < 0 ? '-' : '+'} ${Math.abs(B)}` };
  }
  /** the lines as drawn: "best fit" swapped for its equation */
  const expand = lines => { const f = lines.some(l => FIT.test(l)) ? bestFit(lines) : null; return lines.map(l => (FIT.test(l) && f ? f.text : l)); };

  /* ---------- starters for each unit of the learner's own course ---------- */
  const UNIT_GRAPHS = [
    [/proportion|ratio|rate/i, 'y = kx', 'y = k x\nk = 2', 'A proportional relationship is a line through (0, 0); k is the unit rate.'],
    [/system/i, 'Two lines meeting', 'y = 2x + 1\ny = -x + 4', 'The solution of the system is where the lines cross.'],
    [/inequalit/i, 'Shaded inequality', 'y < 2x - 1\ny >= -x - 3', 'Each shaded side is where an inequality is true; both shadings overlap where both are.'],
    [/slope|linear|line|intercept/i, 'Slope and intercept', 'y = m x + b\nm = 2\nb = 1', 'm is the slope and b the y-intercept: drag the sliders.'],
    [/quadratic|parabola/i, 'A parabola', 'y = a(x - h)² + k\na = 1\nh = 2\nk = -3', 'The vertex is (h, k); a sets the width and direction.'],
    [/exponent|growth|decay/i, 'Growth and decay', 'y = a(b)^x\na = 1\nb = 2 {0.1 to 4}', 'b more than 1 grows, b less than 1 decays.'],
    [/absolute/i, 'Absolute value', 'y = a|x - h| + k\na = 1\nh = 0\nk = -2', 'The V turns at (h, k).'],
    [/circle/i, 'A circle', 'x² + y² = r²\nr = 4', 'Every point is r from the center.'],
    [/pythag|distance|right triangle/i, 'A right triangle', 'triangle (0, 0) (4, 0) (4, 3)\nsegment (0, 0) (4, 3) "5"', '3² + 4² = 5²: the hypotenuse is 5. Drag a corner.'],
    [/transform|reflect|rotat|translat|congruen|similar|dilat|symmetr/i, 'A reflection', 'triangle A(1, 1) B(4, 1) C(1, 3)\ntriangle (-1, 1) (-4, 1) (-1, 3)\nx = 0', 'Each point flips across the line x = 0.'],
    [/data|statistic|scatter|association|trend|bivariate/i, 'A best-fit line', 'points (1, 2) (2, 3.5) (3, 3.5) (4, 5.5) (5, 6) (6, 7.5)\nbest fit', 'The trend line fits the points; drag one to see it change.'],
    [/coordinate|plane|quadrant|ordered pair/i, 'Points in four quadrants', 'A(2, 3)\nB(-3, 1)\nC(-2, -4)\nD(4, -2)', 'The signs of x and y say which quadrant a point is in.'],
    [/trig|sine|cosine|periodic/i, 'A sine wave', 'y = a sin(b x)\na = 2\nb = 1', 'a stretches it up and down, b squeezes it side to side.'],
    [/polynomial|factor/i, 'A cubic', 'y = x³ - 4x', 'It crosses the x-axis at its zeros: −2, 0 and 2.'],
    [/logarithm/i, 'A logarithm', 'y = log(x)', 'log(x) is the power of 10 that gives x.'],
    [/radical|square root/i, 'A square root', 'y = √x', 'It starts at (0, 0) and grows slower and slower.'],
    [/rational/i, 'One over x', 'y = 1/x', 'It never touches the axes: they are its asymptotes.'],
    [/function/i, 'A function', 'f(x) = x² - 2x', 'Each x gives exactly one y.'],
  ];
  /** up to six graphs for the units of the learner's saved course (or their grade's) */
  function courseStarters() {
    if (!A || !S) return null;
    const p = S.get().profile;
    let c = p.enrolled.filter(id => !String(id).startsWith('cpm:')).map(id => A.courseById(id)).find(Boolean);
    if (!c && p.grade != null) c = A.courses.find(x => x.grade === p.grade && !/^int-/.test(x.id));
    if (!c) return null;
    const out = [], used = new Set();
    c.units.forEach(u => {
      const g = UNIT_GRAPHS.find(m => m[0].test(u.title));
      if (g && !used.has(g[1]) && out.length < 6) { used.add(g[1]); out.push({ unit: u.title, name: g[1], lines: g[2], why: g[3] }); }
    });
    return out.length ? { course: c.title, list: out } : null;
  }
  /** y = lines as the calculator's Y= (X, ×, −; a slider's letter becomes its value) */
  function toCalculator(lines) {
    const vals = {};
    lines.forEach(l => { const p = D.paramOf(l); if (p) vals[p.name] = p.value; });
    const ys = [];
    expand(lines).forEach(l => {
      const m = /^\s*(?:y|[a-z]\s*\(\s*x\s*\))\s*=\s*(.+)$/i.exec(l);
      if (!m || /[<>≤≥]/.test(m[1]) || ys.length >= 6) return;
      let e = m[1].replace(/\s+for\s.*$/i, '');
      e = e.replace(/\b([a-wz])\b/g, (w, k) => (k in vals ? `(${vals[k]})` : w));
      if (/[a-wz]/i.test(e.replace(/sqrt|abs|sin|cos|tan|log|ln|pi/gi, ''))) return;          // a letter with no value
      ys.push(e.replace(/x/g, 'X').replace(/\*/g, '×').replace(/-/g, '−').replace(/sqrt\(/gi, '√(').replace(/abs\(/gi, 'abs(').replace(/pi/gi, 'π').replace(/\|([^|]+)\|/g, 'abs($1)'));
    });
    return ys;
  }

  function page(root, code) {
    let lines = (code && D.decode(code) ? D.decode(code).split('\n') : null) || load() || DEFAULT.slice();
    if (lines[lines.length - 1].trim()) lines.push('');
    if (keypad) keypad.remove();
    root.innerHTML = `
      <div class="calc">
        <section class="calc-graph card" aria-label="The graph"><div id="calc-graph"></div>
          <div class="calc-below" id="calc-below"><div class="tabs calc-below-tabs" role="tablist" aria-label="Under the graph"><button type="button" role="tab" class="tab on" aria-selected="true" data-below="keys">Key points</button><button type="button" role="tab" class="tab" aria-selected="false" data-below="table">Table</button></div><div id="calc-below-body"></div></div></section>
        <section class="calc-side card">
          <div class="calc-head"><h1>Graphing calculator</h1><p class="small muted">Type an equation, or start with one of these. A letter set to a number, like <b>m = 2</b>, becomes a slider.</p></div>
          <div class="calc-starters" role="group" aria-label="Start with">${STARTERS.map(([name, sub, , pic], k) => `<button type="button" class="calc-start" data-start="${k}" title="${esc(sub)}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pic}</svg><span>${esc(name)}</span></button>`).join('')}</div>
          <div class="calc-course" id="calc-course"></div>
          <p class="calc-explain small" id="calc-explain" hidden></p>
          <div class="calc-list" id="calc-list"></div>
          <button class="calc-add" id="calc-add" type="button">+ Add a line</button>
          <p class="calc-fit small" id="calc-fit" hidden></p>
          <div class="calc-kp-slot"></div>
          <div class="calc-tools">
            <button class="btn sm" id="calc-ask" type="button">Ask the tutor about this graph</button>
            <button class="btn sm" id="calc-undo" type="button" disabled>Undo</button>
            <button class="btn sm" id="calc-redo" type="button" disabled>Redo</button>
            <button class="btn sm" id="calc-save" type="button">Save</button>
            <button class="btn sm" id="calc-share" type="button">Copy link</button>
            <button class="btn sm" id="calc-tocalc" type="button">Open in the calculator</button>
            <button class="btn sm" id="calc-clear" type="button">Clear</button>
          </div>
          <div id="calc-save-box"></div>
          <details class="calc-saved" id="calc-saved" hidden><summary class="small"><b>My graphs</b> <span class="muted" id="calc-saved-n"></span></summary><ul id="calc-saved-list"></ul></details>
          <details class="calc-help"><summary class="small"><b>What you can enter</b></summary>
            <ul class="small">
              <li><code>y = 2x + 1</code>, or just <code>2x + 1</code>; <code>y = x² − 4</code>, <code>y = |x|</code>, <code>y = √x</code>, <code>f(x) = 3x − 2</code></li>
              <li>Any line or curve: <code>2x + 3y = 6</code>, <code>x = 3</code>, <code>x² + y² = 25</code></li>
              <li>Inequalities are shaded: <code>y &lt; 2x + 1</code>, <code>y ≥ x²</code></li>
              <li>Points and shapes: <code>(2, 5)</code>, <code>A(1, 2)</code>, <code>segment (0,0) (3,4)</code>, <code>triangle (0,0) (4,0) (4,3)</code>, <code>circle (0,0) 5</code></li>
              <li>Part of a line: <code>y = 2x for 0 ≤ x ≤ 3</code></li>
              <li>Sliders: <code>a = 2</code>, or with a range, <code>a = 2 {0 to 5}</code></li>
              <li>The window: <code>x from -5 to 5</code>, <code>y from 0 to 100</code>; names: <code>x label: hours</code></li>
            </ul>
            <p class="tiny muted">Point to a curve (or tap it) to read the coordinates of a point. Gray dots mark intercepts, turning points and intersections.</p></details>
        </section>
      </div>`;
    const wrap = root.querySelector('.calc'), list = root.querySelector('#calc-list'), graph = root.querySelector('#calc-graph'), slot = root.querySelector('.calc-kp-slot');
    let timer = 0, last = { i: lines.length - 1, at: 0 }, native = false;     // the line the keypad types into, and where; native: ABC was tapped

    function drawGraph() {
      const old = graph.querySelector('.viz'), kept = old ? D.getView(old) : null;
      const body = expand(lines).filter(l => l.trim()).join('\n');
      const html = body ? D.figure('graph', body, { calc: true }) : null;
      fitNote();
      graph.innerHTML = html || `<div class="calc-empty"><p class="muted">Type an equation, such as <b>y = 2x + 1</b>, or tap a starter, and it will be drawn here.</p></div>`;
      const fig = graph.querySelector('.viz');
      if (fig && kept && kept.moved) D.setView(fig, kept.view);           // keep the learner's own zoom while they edit
      store(lines);
      clearTimeout(remT); remT = setTimeout(remember, 600);
      below();
    }
    /* ---------- undo and redo: what the lines were, a moment after each change ---------- */
    const norm = ls => ls.filter(l => l.trim()).join('\n');
    let past = [], future = [], saved0 = norm(lines), remT = 0;
    function remember() {
      clearTimeout(remT);
      const now = norm(lines);
      if (now === saved0) return;
      past.push(saved0); if (past.length > 80) past.shift();
      saved0 = now; future = []; undoState();
    }
    function undoState() { root.querySelector('#calc-undo').disabled = !past.length; root.querySelector('#calc-redo').disabled = !future.length; }
    function restore(text) { lines = text ? text.split('\n') : []; lines.push(''); saved0 = text; graph.innerHTML = ''; drawList(); drawGraph(); clearTimeout(remT); undoState(); }
    function undo() { remember(); if (!past.length) return; future.push(saved0); restore(past.pop()); }
    function redo() { if (!future.length) return; past.push(saved0); restore(future.pop()); }
    /* ---------- under the graph: its key points, or a table of values ---------- */
    let belowTab = 'keys';
    const num = v => (Number.isFinite(v) ? String(Number(v.toPrecision(5))).replace(/-/g, '−') : '–');
    function below() {
      const box = root.querySelector('#calc-below-body'), fig = graph.querySelector('.viz');
      root.querySelectorAll('[data-below]').forEach(b => { const on = b.dataset.below === belowTab; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); });
      if (!fig) { box.innerHTML = '<p class="small muted">Draw something first.</p>'; return; }
      if (belowTab === 'keys') {
        const ks = D.keysOf(fig).slice(0, 14);
        box.innerHTML = ks.length ? `<div class="calc-keys">${ks.map((k, i) => `<button type="button" class="chip-btn" data-key="${i}">${esc(k.name)} ${esc(k.label)}</button>`).join('')}</div><p class="tiny muted" style="margin:6px 0 0">Tap one to see it on the graph.</p>`
          : '<p class="small muted">No intercepts or crossings in this view. Drag or zoom the graph to look for some.</p>';
        box.__keys = ks;
        return;
      }
      const fs = D.fnsOf(fig).slice(0, 4), v = D.getView(fig);
      if (!fs.length || !v) { box.innerHTML = '<p class="small muted">Add an equation with y in it, like <b>y = 2x + 1</b>, and its table of values appears here.</p>'; return; }
      const span = v.view.x1 - v.view.x0, raw0 = span / 8, mag = Math.pow(10, Math.floor(Math.log10(raw0))), step = [1, 2, 5, 10].map(k => k * mag).find(k => k >= raw0) || mag * 10;
      const xs = []; for (let x = Math.ceil(v.view.x0 / step) * step; x <= v.view.x1 + 1e-9 && xs.length < 11; x += step) xs.push(Math.round(x / step) * step);
      box.innerHTML = `<div class="calc-table-wrap"><table class="calc-table"><thead><tr><th>x</th>${fs.map(f => `<th><span class="calc-sw" style="background:var(--${f.color || 'vz1'})"></span>${esc(f.text || 'y')}</th>`).join('')}</tr></thead>
        <tbody>${xs.map(x => `<tr><td>${num(x)}</td>${fs.map(f => `<td>${f.has(x) ? num(f.f(x)) : '–'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    root.querySelector('#calc-below').addEventListener('click', ev => {
      const t = ev.target.closest('[data-below]'), k = ev.target.closest('[data-key]');
      if (t) { belowTab = t.dataset.below; below(); return; }
      if (k) { const box = root.querySelector('#calc-below-body'), p = (box.__keys || [])[Number(k.dataset.key)], fig = graph.querySelector('.viz'); if (p && fig) D.showPoint(fig, p.x, p.y); }
    });
    // the graph's own zoom and drag change what is in view, so the key points and table follow
    graph.addEventListener('pointerup', () => setTimeout(below, 60));
    graph.addEventListener('click', ev => { if (ev.target.closest('.viz-btn')) setTimeout(below, 60); });
    graph.addEventListener('wheel', () => { clearTimeout(graph.__bt); graph.__bt = setTimeout(below, 250); }, { passive: true });
    const hintHtml = (h, i) => `${esc(h.text)}${h.add ? ` <button type="button" class="btn sm calc-fix" data-fix="${i}" data-add="${h.add.join('')}">Add ${h.add.length > 1 ? 'sliders' : 'a slider'} for ${esc(and(h.add))}</button>` : ''}`;
    function colorsFor(status) { let k = 0; return status.map(st => (st === 'ok' ? D.COLORS[k++ % D.COLORS.length] : null)); }
    /** under the list: the best-fit line's equation and how well it fits, with a button to add one */
    function fitNote() {
      const box = root.querySelector('#calc-fit'), has = lines.some(l => FIT.test(l)), f = bestFit(lines), pts = lines.filter(isPoints).join(' ').match(PAIR);
      if (has && f) { box.innerHTML = `Best fit: <b>${esc(f.text)}</b> · r = ${n3(f.r)} (${f.n} points). Drag a point to move it.`; box.hidden = false; }
      else if (!has && pts && pts.length >= 2) { box.innerHTML = 'Drag a point to move it. <button type="button" class="btn sm" id="calc-addfit">Add a best-fit line</button>'; box.hidden = false; }
      else if (pts && pts.length) { box.textContent = 'Drag a point to move it.'; box.hidden = false; }
      else box.hidden = true;
    }
    function drawList(focus) {
      const status = D.lineStatus(expand(lines)), colors = colorsFor(status), sheet = isSheet();
      list.innerHTML = lines.map((l, i) => {
        const p = status[i] === 'param' ? D.paramOf(l) : null, h = status[i] === 'error' ? hint(l, lines) : null;
        return `<div class="calc-row is-${status[i]}" data-i="${i}">
          <span class="calc-sw" ${colors[i] ? `style="background:var(--${colors[i]})"` : ''} aria-hidden="true">${status[i] === 'param' ? '<svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="6" r="2.5" fill="currentColor"/></svg>' : status[i] === 'error' ? '!' : ''}</span>
          <input class="calc-in" value="${esc(l)}" spellcheck="false" autocomplete="off" autocapitalize="off" ${sheet && !native ? 'inputmode="none" ' : ''}aria-label="Line ${i + 1}" placeholder="${i === lines.length - 1 ? 'Type an equation…' : ''}">
          <button class="iconbtn sm" data-rm="${i}" type="button" aria-label="Remove line ${i + 1}">✕</button>
          ${p ? `<label class="calc-slider"><span class="tiny muted">${esc(String(p.min))}</span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" data-slide="${i}" aria-label="${esc(p.name)}"><span class="tiny muted">${esc(String(p.max))}</span></label>` : ''}
          ${h ? `<div class="calc-err small">${hintHtml(h, i)}</div>` : ''}
        </div>`;
      }).join('');
      if (focus) {
        const inp = list.querySelector(`.calc-row[data-i="${focus.i}"] .calc-in`);
        if (inp) { inp.focus(); const at = focus.at == null ? inp.value.length : focus.at; inp.setSelectionRange(at, at); last = { i: focus.i, at }; }
      }
    }
    /** the lines changed: draw the list again when what each line is has changed, and the graph soon */
    function changed(i, inp, was) {
      if (i === lines.length - 1 && lines[i].trim()) lines.push('');
      const now = D.lineStatus(lines);
      clearTimeout(timer); timer = setTimeout(drawGraph, 120);
      if (now.join() !== was.join() || now.length !== was.length) drawList({ i, at: inp ? inp.selectionStart : null });
      else if (now[i] === 'error') { const e = list.querySelector(`.calc-row[data-i="${i}"] .calc-err`); if (e) e.innerHTML = hintHtml(hint(lines[i], lines), i); }   // still unreadable: a hint for what it is now
    }
    list.addEventListener('input', ev => {
      const inp = ev.target.closest('.calc-in'), slide = ev.target.closest('[data-slide]');
      if (inp) {
        const i = Number(inp.closest('.calc-row').dataset.i);
        const was = D.lineStatus(lines);
        lines[i] = inp.value; last = { i, at: inp.selectionStart };
        changed(i, inp, was);
      } else if (slide) {
        if (window.BADGES) BADGES.flag('grapher');
        const i = Number(slide.dataset.slide), p = D.paramOf(lines[i]);
        if (!p) return;
        const v = Number(slide.value);
        lines[i] = `${p.name} = ${Math.round(v * 1000) / 1000}${p.custom ? ` {${p.min} to ${p.max}}` : ''}`;
        const inp2 = list.querySelector(`.calc-row[data-i="${i}"] .calc-in`); if (inp2) inp2.value = lines[i];
        const fig = graph.querySelector('.viz');                // move the drawing at once; settle it when let go
        if (fig) D.slide(fig, p.name, v); else { clearTimeout(timer); timer = setTimeout(drawGraph, 30); }
        store(lines);
      }
    });
    list.addEventListener('change', ev => { if (ev.target.closest('[data-slide]')) drawGraph(); });
    const newLine = (i, at) => { const inp = list.querySelector(`.calc-row[data-i="${i}"] .calc-in`), v = inp ? inp.value : lines[i], k = at == null ? v.length : at; lines[i] = v.slice(0, k); lines.splice(i + 1, 0, v.slice(k)); drawList({ i: i + 1, at: 0 }); if (v.slice(k)) { clearTimeout(timer); timer = setTimeout(drawGraph, 120); } };
    const dropLine = i => { lines.splice(i, 1); if (!lines.length || lines[lines.length - 1].trim()) lines.push(''); drawList({ i: Math.max(0, i - 1) }); drawGraph(); };
    list.addEventListener('keydown', ev => {
      const inp = ev.target.closest('.calc-in'); if (!inp) return;
      const i = Number(inp.closest('.calc-row').dataset.i);
      if (ev.key === 'Enter') { ev.preventDefault(); newLine(i, inp.selectionStart); }
      else if (ev.key === 'Backspace' && !inp.value && lines.length > 1) { ev.preventDefault(); dropLine(i); }
      else if (ev.key === 'ArrowDown' && i < lines.length - 1) { ev.preventDefault(); drawList({ i: i + 1 }); }
      else if (ev.key === 'ArrowUp' && i > 0) { ev.preventDefault(); drawList({ i: i - 1 }); }
    });
    list.addEventListener('click', ev => {
      const fix = ev.target.closest('[data-fix]');
      if (fix) {                                                 // sliders for the letters that have no value yet
        const i = Number(fix.dataset.fix);
        lines.splice(i + 1, 0, ...fix.dataset.add.split('').map(c => `${c} = 1`));
        drawList(); drawGraph(); return;
      }
      const b = ev.target.closest('[data-rm]'); if (!b) return;
      lines.splice(Number(b.dataset.rm), 1);
      if (!lines.length || lines[lines.length - 1].trim()) lines.push('');
      drawList(); drawGraph();
    });
    list.addEventListener('focusin', ev => {
      const inp = ev.target.closest('.calc-in'); if (!inp) return;
      last = { i: Number(inp.closest('.calc-row').dataset.i), at: inp.selectionStart };
      if (isSheet() && !native) openSheet(inp);
    });
    list.addEventListener('focusout', () => setTimeout(() => {
      const a = document.activeElement;
      if (!(a && a.classList.contains('calc-in') && list.contains(a))) { native = false; closeSheet(); }
    }, 160));
    // keep track of the cursor, so a key tapped after clicking away still types where the learner was
    list.addEventListener('keyup', ev => { const inp = ev.target.closest('.calc-in'); if (inp) last = { i: Number(inp.closest('.calc-row').dataset.i), at: inp.selectionStart }; });
    list.addEventListener('pointerup', ev => { const inp = ev.target.closest('.calc-in'); if (inp) setTimeout(() => { last = { i: Number(inp.closest('.calc-row').dataset.i), at: inp.selectionStart }; }, 0); });

    /* ---------- starters ---------- */
    root.querySelector('.calc-starters').addEventListener('click', ev => {
      const b = ev.target.closest('[data-start]'); if (!b) return;
      const add = STARTERS[Number(b.dataset.start)][2].split('\n'), mine = lines.filter(l => l.trim());
      if (!mine.length || mine.join('\n') === DEFAULT[0]) lines = add.concat(['']);              // nothing of theirs yet: start fresh
      else {                                                    // add to what is there; a slider already there keeps its value
        const have = new Set(mine.map(l => D.paramOf(l)).filter(Boolean).map(p => p.name));
        lines = mine.concat(add.filter(l => !(D.paramOf(l) && have.has(D.paramOf(l).name)) && !mine.includes(l)), ['']);
      }
      graph.innerHTML = ''; drawList(); drawGraph();
      const ex = root.querySelector('#calc-explain'), st0 = STARTERS[Number(b.dataset.start)];
      ex.innerHTML = `<b>${esc(st0[0])}:</b> ${esc(st0[4])}`; ex.hidden = false;
      if (isSheet()) graph.scrollIntoView({ block: 'nearest' });
    });
    root.querySelector('#calc-add').addEventListener('click', () => { if (lines[lines.length - 1].trim()) lines.push(''); drawList({ i: lines.length - 1 }); });
    root.querySelector('#calc-fit').addEventListener('click', ev => {
      if (!ev.target.closest('#calc-addfit')) return;
      remember(); lines = lines.filter(l => l.trim()).concat(['best fit', '']); drawList(); drawGraph();
    });
    /* ---------- graphs for the units of the learner's course ---------- */
    const cs = courseStarters(), cbox = root.querySelector('#calc-course');
    if (cs) {
      cbox.innerHTML = `<span class="tiny muted">For ${esc(cs.course)}:</span>${cs.list.map((g, k) => `<button type="button" class="chip-btn" data-unit="${k}" title="${esc(g.unit)}">${esc(g.name)}</button>`).join('')}`;
      cbox.addEventListener('click', ev => {
        const b = ev.target.closest('[data-unit]'); if (!b) return;
        const g = cs.list[Number(b.dataset.unit)];
        remember(); lines = g.lines.split('\n').concat(['']); graph.innerHTML = ''; drawList(); drawGraph(); remember();
        const ex = root.querySelector('#calc-explain'); ex.innerHTML = `<b>${esc(g.unit)}:</b> ${esc(g.why)}`; ex.hidden = false;
      });
    } else cbox.hidden = true;
    /* ---------- the lines y = … go to the classroom calculator's Y= ---------- */
    root.querySelector('#calc-tocalc').addEventListener('click', () => {
      const ys = toCalculator(lines);
      if (!ys.length) { window.VIEWS.toast('Only lines that start y = can go to the calculator, like y = 2x + 1.'); return; }
      if (window.CALCULATOR && CALCULATOR.receive) CALCULATOR.receive(ys);
      location.hash = '#/calc';
    });
    /* ---------- dragging a point: any (x, y) written in a line moves with the pointer, snapped to the grid ---------- */
    let pull = null, pullFrame = 0;
    const plotOf = () => { const fig = graph.querySelector('.viz'), svg = fig && fig.querySelector('.viz-plot svg'), v = fig && D.getView(fig); return svg && v ? { fig, svg, v: v.view, r: svg.getBoundingClientRect() } : null; };
    function handleAt(cx, cy) {
      const P = plotOf(); if (!P) return null;
      const { v, r } = P, X = x => r.left + (x - v.x0) / (v.x1 - v.x0) * r.width, Y = y => r.top + (v.y1 - y) / (v.y1 - v.y0) * r.height;
      let best = null, bd = 18;
      lines.forEach((l, i) => { if (FIT.test(l)) return; let k = 0; for (const m of l.matchAll(PAIR)) { const d = Math.hypot(X(Number(m[1])) - cx, Y(Number(m[2])) - cy); if (d < bd) { bd = d; best = { i, k }; } k++; } });
      return best;
    }
    function pullTo(cx, cy) {
      const P = plotOf(); if (!P || !pull) return;
      const { v, r } = P, w = v.x1 - v.x0, step = w <= 14 ? 0.5 : w <= 40 ? 1 : w <= 120 ? 5 : 10, snap = t => Math.round(t / step) * step;
      const x = snap(v.x0 + (cx - r.left) / r.width * w), y = snap(v.y1 - (cy - r.top) / r.height * (v.y1 - v.y0)), f = t => String(Number(t.toFixed(2)));
      let k = 0;
      const next = lines[pull.i].replace(PAIR, m => (k++ === pull.k ? `(${f(x)}, ${f(y)})` : m));
      if (next === lines[pull.i]) return;
      lines[pull.i] = next;
      const inp = list.querySelector(`.calc-row[data-i="${pull.i}"] .calc-in`); if (inp) inp.value = next;
      if (!pullFrame) pullFrame = requestAnimationFrame(() => {
        pullFrame = 0;
        const view = P.v, body = expand(lines).filter(l => l.trim()).join('\n');
        graph.innerHTML = D.figure('graph', body, { calc: true }) || '';
        const fig = graph.querySelector('.viz'); if (fig) D.setView(fig, view);
        fitNote(); store(lines);
      });
    }
    graph.addEventListener('pointerdown', ev => {
      if (ev.button > 0) return;
      const h = handleAt(ev.clientX, ev.clientY); if (!h) return;
      ev.stopPropagation(); ev.preventDefault();
      remember(); pull = h; graph.classList.add('pulling');
    }, true);
    graph.addEventListener('touchstart', ev => { const t = ev.touches[0]; if (t && handleAt(t.clientX, t.clientY)) ev.preventDefault(); }, { passive: false });
    const onMove = ev => {
      if (pull) { ev.preventDefault(); pullTo(ev.clientX, ev.clientY); return; }
      if (ev.pointerType === 'mouse' && graph.contains(ev.target)) graph.classList.toggle('can-pull', !!handleAt(ev.clientX, ev.clientY));
    };
    const endPull = () => { if (!pull) return; pull = null; graph.classList.remove('pulling'); drawList(); drawGraph(); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', endPull);
    window.addEventListener('pointercancel', endPull);
    root.querySelector('#calc-clear').addEventListener('click', () => { remember(); lines = ['']; graph.innerHTML = ''; root.querySelector('#calc-explain').hidden = true; drawList({ i: 0 }); drawGraph(); remember(); });
    root.querySelector('#calc-undo').addEventListener('click', undo);
    root.querySelector('#calc-redo').addEventListener('click', redo);
    wrap.addEventListener('keydown', ev => {
      if (!(ev.ctrlKey || ev.metaKey) || ev.target.closest('input, textarea')) return;
      if (ev.key.toLowerCase() === 'z' && !ev.shiftKey) { ev.preventDefault(); undo(); }
      else if (ev.key.toLowerCase() === 'y' || (ev.key.toLowerCase() === 'z' && ev.shiftKey)) { ev.preventDefault(); redo(); }
    });
    /* ---------- saving graphs by name ---------- */
    function drawSaved() {
      const list = savedList(), d = root.querySelector('#calc-saved');
      d.hidden = !list.length;
      root.querySelector('#calc-saved-n').textContent = `(${list.length})`;
      root.querySelector('#calc-saved-list').innerHTML = list.map((g, k) => `<li><button type="button" class="calc-open" data-open="${k}"><b>${esc(g.name)}</b><span class="tiny muted">${esc(g.lines.filter(l => l.trim()).slice(0, 2).join('; '))}</span></button><button type="button" class="iconbtn sm" data-unsave="${k}" aria-label="Delete ${esc(g.name)}">✕</button></li>`).join('');
    }
    root.querySelector('#calc-save').addEventListener('click', () => {
      const box = root.querySelector('#calc-save-box');
      if (box.innerHTML) { box.innerHTML = ''; return; }
      const first = lines.find(l => l.trim()) || '';
      box.innerHTML = `<form class="calc-save-form" id="calc-save-form"><label class="visually-hidden" for="calc-save-name">Name</label><input id="calc-save-name" maxlength="50" value="${esc(first.slice(0, 40))}" placeholder="A name for this graph"><button class="btn sm primary" type="submit">Save graph</button></form>`;
      const f = box.querySelector('form'), inp = box.querySelector('input');
      inp.focus(); inp.select();
      f.addEventListener('submit', ev => {
        ev.preventDefault();
        const name = inp.value.replace(/\s+/g, ' ').trim() || 'My graph', mine = lines.filter(l => l.trim());
        if (!mine.length) { window.VIEWS.toast('Draw something first.'); return; }
        const list = savedList().filter(g => g.name !== name);
        list.unshift({ name, lines: mine, t: Date.now() });
        store(lines, list); box.innerHTML = ''; drawSaved();
        root.querySelector('#calc-saved').open = true;
        window.VIEWS.toast('Saved as “' + name + '”');
      });
    });
    root.querySelector('#calc-saved').addEventListener('click', ev => {
      const o = ev.target.closest('[data-open]'), x = ev.target.closest('[data-unsave]');
      if (o) { const g = savedList()[Number(o.dataset.open)]; if (g) { remember(); restore(g.lines.join('\n')); remember(); } }
      if (x) { const list = savedList(); list.splice(Number(x.dataset.unsave), 1); store(lines, list); drawSaved(); }
    });
    root.querySelector('#calc-share').addEventListener('click', () => {
      const url = location.href.split('#')[0] + '#/graph/' + D.encode(lines.filter(l => l.trim()).join('\n'));
      try { navigator.clipboard.writeText(url).then(() => window.VIEWS.toast('Link copied. It opens this graph.'), () => window.VIEWS.toast('The link couldn’t be copied.')); } catch (e) { window.VIEWS.toast('The link couldn’t be copied.'); }
    });
    root.querySelector('#calc-ask').addEventListener('click', () => {
      const body = lines.filter(l => l.trim()).join('; ');
      if (window.TUTORUI) TUTORUI.open({ ask: body ? `Explain this graph to me: ${body}` : 'How do I use a graphing calculator to graph a line?' });
    });

    /* ---------- the keypad ---------- */
    const kp = document.createElement('div');
    kp.className = 'calc-kp';
    kp.setAttribute('role', 'group');
    kp.setAttribute('aria-label', 'Math keypad');
    kp.innerHTML = PAD.map((block, k) => `<div class="kp-${['a', 'n', 'x'][k]}">${block.map(key => {
      const act = String(key[1]).startsWith('@'), label = act ? key[2] : key[3];
      return `<button type="button" class="kp-key${act ? ' act kp-' + key[1].slice(1) : /^\d$/.test(key[1]) ? ' digit' : ''}${key[0] === 'sin' ? ' kp-sin' : ''}" ${act ? `data-act="${key[1].slice(1)}"` : `data-ins="${esc(key[1])}" data-back="${key[2] || 0}"`}${label ? ` aria-label="${esc(label)}"` : ''}>${esc(key[0])}</button>`;
    }).join('')}</div>`).join('');
    keypad = kp;
    /** the line the keypad types into: the one being edited, else the last one used */
    function target() {
      const a = document.activeElement;
      if (a && a.classList.contains('calc-in') && list.contains(a)) return a;
      const i = Math.min(last.i, lines.length - 1), inp = list.querySelector(`.calc-row[data-i="${i}"] .calc-in`);
      if (inp) { inp.focus(); const at = Math.min(last.at == null ? inp.value.length : last.at, inp.value.length); inp.setSelectionRange(at, at); }
      return inp;
    }
    kp.addEventListener('pointerdown', ev => { if (ev.target.closest('button')) ev.preventDefault(); });   // keep the cursor in the line
    kp.addEventListener('mousedown', ev => { if (ev.target.closest('button')) ev.preventDefault(); });
    kp.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      const inp = target(); if (!inp) return;
      const i = Number(inp.closest('.calc-row').dataset.i), v = inp.value;
      const a = inp.selectionStart == null ? v.length : inp.selectionStart, z = inp.selectionEnd == null ? v.length : inp.selectionEnd;
      const put = (text, at) => { const was = D.lineStatus(lines); inp.value = text; inp.setSelectionRange(at, at); lines[i] = text; last = { i, at }; changed(i, inp, was); };
      const act = b.dataset.act;
      if (act === 'left') { const k = Math.max(0, a - 1); inp.setSelectionRange(k, k); last = { i, at: k }; return; }
      if (act === 'right') { const k = Math.min(v.length, z + 1); inp.setSelectionRange(k, k); last = { i, at: k }; return; }
      if (act === 'enter') return newLine(i, a);
      if (act === 'abc') {                                     // the phone's own keyboard, for letters
        native = true; closeSheet(); inp.inputMode = 'text'; inp.blur(); setTimeout(() => inp.focus(), 30); return;
      }
      if (act === 'del') {
        if (a !== z) return put(v.slice(0, a) + v.slice(z), a);
        if (!v && lines.length > 1) return dropLine(i);
        if (!a) return;
        const k = / [=<>≤≥+−×÷] $/.test(v.slice(Math.max(0, a - 3), a)) ? a - 3 : a - 1;    // a sign typed with its spaces goes in one
        return put(v.slice(0, k) + v.slice(a), k);
      }
      let text = b.dataset.ins;
      if (/^ /.test(text) && (!a || / $/.test(v.slice(0, a)))) text = text.replace(/^ /, '');    // no double spaces, none at the start
      put(v.slice(0, a) + text + v.slice(z), a + text.length - Number(b.dataset.back || 0));
    });
    const isSheet = () => wrap.clientWidth < 820 || window.innerWidth < 700;
    function openSheet(inp) {
      if (kp.parentNode !== document.body) document.body.appendChild(kp);
      kp.classList.add('sheet');
      document.body.classList.add('calc-kp-open');
      wrap.classList.add('kp-open');
      // keep the line being edited between the graph above and the keypad below
      requestAnimationFrame(() => {
        if (!inp.isConnected) return;
        const r = inp.getBoundingClientRect(), topEdge = graph.getBoundingClientRect().bottom + 8, bottomEdge = kp.getBoundingClientRect().top - 12;
        if (r.bottom > bottomEdge) window.scrollBy(0, r.bottom - bottomEdge);
        else if (r.top < topEdge) window.scrollBy(0, r.top - topEdge);
      });
    }
    function closeSheet() {
      if (!kp.classList.contains('sheet')) return;
      document.body.classList.remove('calc-kp-open');
      wrap.classList.remove('kp-open');
      list.querySelectorAll('.calc-in').forEach(x => { if (isSheet() && !native) x.inputMode = 'none'; });
    }
    /** the keypad sits under the list on a wide screen; on a narrow one it waits on <body> to open over the bottom */
    function place() {
      if (!wrap.isConnected) return;
      const sheet = isSheet();
      if (!sheet && kp.parentNode !== slot) { slot.appendChild(kp); kp.classList.remove('sheet'); document.body.classList.remove('calc-kp-open'); wrap.classList.remove('kp-open'); }
      if (sheet && !kp.classList.contains('sheet')) { document.body.appendChild(kp); kp.classList.add('sheet'); }
      list.querySelectorAll('.calc-in').forEach(x => { if (sheet && !native) x.inputMode = 'none'; else if (!sheet) x.removeAttribute('inputmode'); });
    }
    const ro = window.ResizeObserver ? new ResizeObserver(place) : null;
    if (ro) ro.observe(wrap);
    const leave = () => setTimeout(() => {
      if (wrap.isConnected) return;
      kp.remove(); if (ro) ro.disconnect();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', endPull); window.removeEventListener('pointercancel', endPull);
      document.body.classList.remove('calc-kp-open');
      window.removeEventListener('hashchange', leave);
    }, 0);
    window.addEventListener('hashchange', leave);

    if (code) history.replaceState(null, '', '#/graph');
    drawList();
    place();
    drawGraph();
    drawSaved();
    undoState();
    root.__calc = { lines: () => lines, undo, redo, handleAt, fit: () => bestFit(lines) };          // for the test suite
  }

  window.CALC = { page, EXAMPLES, STARTERS, hint, bestFit, expand, toCalculator, courseStarters };
})();
