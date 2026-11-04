/* The graphing calculator (#/graph): type equations, inequalities, points and shapes, one per line, and
   see them drawn as you type. A letter set to a number (m = 2) becomes a slider, so "y = m x + b" can be
   explored by dragging. Everything is drawn by lib/draw.js on this device; it works offline.
   The lines are kept on this device (localStorage procademy.graph.v1); Copy link puts them in the
   address (#/graph/<code>) to share or bookmark, and "Open in calculator" on any graph the tutor drew
   lands here. */
'use strict';
(function () {
  const D = window.DRAW, H = window.VIEWS._h, esc = H.esc;
  const KEY = 'procademy.graph.v1';
  const EXAMPLES = [
    ['Slope and y-intercept (sliders)', 'y = m x + b\nm = 2\nb = 1'],
    ['A parabola in vertex form (sliders)', 'y = a(x - h)^2 + k\na = 1\nh = 2\nk = -3'],
    ['Where two lines meet', 'y = 2x + 1\ny = -x + 4'],
    ['Shading inequalities', 'y < 2x - 1\ny >= -x - 3'],
    ['A circle and a point on it', 'x^2 + y^2 = 25\npoint (3, 4) "on the circle"'],
    ['Absolute value', 'y = |x - 2| - 3'],
    ['Exponential growth', 'y = 50(1.2)^x\nx from -2 to 12\ny from -20 to 450'],
    ['A reflection in the y-axis', 'triangle A(1, 1) B(4, 1) C(1, 3)\ntriangle (-1, 1) (-4, 1) (-1, 3)\nx = 0'],
    ['A table of points', 'points (0, 1) (1, 3) (2, 5) (3, 7)\ny = 2x + 1'],
  ];
  const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return Array.isArray(v) && v.length ? v.map(String) : null; } catch (e) { return null; } };
  const store = lines => { try { localStorage.setItem(KEY, JSON.stringify(lines.slice(0, 60))); } catch (e) { /* fine */ } };

  function page(root, code) {
    let lines = (code && D.decode(code) ? D.decode(code).split('\n') : null) || load() || ['y = 2x + 1', ''];
    if (lines[lines.length - 1].trim()) lines.push('');
    root.innerHTML = `
      <div class="calc">
        <section class="calc-graph card" id="calc-graph" aria-label="The graph"></section>
        <section class="calc-side card">
          <div class="calc-head"><h1>Graphing calculator</h1><span class="tiny muted">Enter one item per line. A letter set to a number (<b>m = 2</b>) becomes a slider.</span></div>
          <div class="calc-list" id="calc-list"></div>
          <div class="btn-row calc-tools">
            <button class="btn sm" id="calc-add" type="button">Add a line</button>
            <select id="calc-ex" aria-label="Examples"><option value="">Examples…</option>${EXAMPLES.map(([t], k) => `<option value="${k}">${esc(t)}</option>`).join('')}</select>
            <button class="btn sm ghost" id="calc-share" type="button">Copy link</button>
            <button class="btn sm ghost" id="calc-clear" type="button">Clear</button>
          </div>
          <button class="btn ghost block" id="calc-ask" type="button">Ask the tutor about this graph</button>
          <details class="calc-help"><summary class="small"><b>What you can enter</b></summary>
            <ul class="small">
              <li><code>y = 2x + 1</code>, <code>y = x^2 - 4</code>, <code>y = |x|</code>, <code>y = sqrt(x)</code>, <code>y = sin x</code></li>
              <li>Any line or curve: <code>2x + 3y = 6</code>, <code>x = 3</code>, <code>x^2 + y^2 = 25</code></li>
              <li>Inequalities are shaded: <code>y &lt; 2x + 1</code>, <code>y >= x^2</code></li>
              <li>Points and shapes: <code>(2, 5)</code>, <code>A(1, 2)</code>, <code>segment (0,0) (3,4)</code>, <code>triangle (0,0) (4,0) (4,3)</code>, <code>circle (0,0) 5</code></li>
              <li>Part of a line: <code>y = 2x for 0 &lt;= x &lt;= 3</code></li>
              <li>Sliders: <code>a = 2</code>, or with a range, <code>a = 2 {0 to 5}</code></li>
              <li>The window: <code>x from -5 to 5</code>, <code>y from 0 to 100</code>; names: <code>x label: hours</code></li>
            </ul>
            <p class="tiny muted">Point to a curve (or tap it) to read the coordinates of a point. Gray dots mark intercepts, turning points and intersections.</p></details>
        </section>
      </div>`;
    const list = root.querySelector('#calc-list'), graph = root.querySelector('#calc-graph');
    let timer = 0;

    function drawGraph() {
      const old = graph.querySelector('.viz'), kept = old ? D.getView(old) : null;
      const body = lines.filter(l => l.trim()).join('\n');
      const html = body ? D.figure('graph', body, { calc: true }) : null;
      graph.innerHTML = html || `<div class="calc-empty"><p class="muted">Enter an equation on the left, such as <b>y = 2x + 1</b>, and it will be drawn here.</p></div>`;
      const fig = graph.querySelector('.viz');
      if (fig && kept && kept.moved) D.setView(fig, kept.view);           // keep the learner's own zoom while they edit
      store(lines);
    }
    function colorsFor(status) { let k = 0; return status.map(st => (st === 'ok' ? D.COLORS[k++ % D.COLORS.length] : null)); }
    function drawList(focus) {
      const status = D.lineStatus(lines), colors = colorsFor(status);
      list.innerHTML = lines.map((l, i) => {
        const p = status[i] === 'param' ? D.paramOf(l) : null;
        return `<div class="calc-row is-${status[i]}" data-i="${i}">
          <span class="calc-sw" ${colors[i] ? `style="background:var(--${colors[i]})"` : ''} aria-hidden="true">${status[i] === 'param' ? '<svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:middle"><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.5"/><circle cx="7" cy="6" r="2.5" fill="currentColor"/></svg>' : status[i] === 'error' ? '!' : ''}</span>
          <input class="calc-in" value="${esc(l)}" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Line ${i + 1}" placeholder="${i === lines.length - 1 ? 'Enter an equation…' : ''}">
          <button class="iconbtn sm" data-rm="${i}" type="button" aria-label="Remove line ${i + 1}">✕</button>
          ${p ? `<label class="calc-slider"><span class="tiny muted">${esc(String(p.min))}</span><input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.value}" data-slide="${i}" aria-label="${esc(p.name)}"><span class="tiny muted">${esc(String(p.max))}</span></label>` : ''}
          ${status[i] === 'error' ? `<div class="calc-err tiny">Procademy can’t read this line. See “What you can enter” below.</div>` : ''}
        </div>`;
      }).join('');
      if (focus) {
        const inp = list.querySelector(`.calc-row[data-i="${focus.i}"] .calc-in`);
        if (inp) { inp.focus(); const at = focus.at == null ? inp.value.length : focus.at; inp.setSelectionRange(at, at); }
      }
    }
    list.addEventListener('input', ev => {
      const inp = ev.target.closest('.calc-in'), slide = ev.target.closest('[data-slide]');
      if (inp) {
        const i = Number(inp.closest('.calc-row').dataset.i), was = D.lineStatus(lines);
        lines[i] = inp.value;
        if (i === lines.length - 1 && inp.value.trim()) lines.push('');
        const now = D.lineStatus(lines);
        clearTimeout(timer); timer = setTimeout(drawGraph, 120);
        if (now.join() !== was.join() || now.length !== was.length) drawList({ i, at: inp.selectionStart });
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
    list.addEventListener('keydown', ev => {
      const inp = ev.target.closest('.calc-in'); if (!inp) return;
      const i = Number(inp.closest('.calc-row').dataset.i);
      if (ev.key === 'Enter') { ev.preventDefault(); lines.splice(i + 1, 0, ''); drawList({ i: i + 1, at: 0 }); }
      else if (ev.key === 'Backspace' && !inp.value && lines.length > 1) { ev.preventDefault(); lines.splice(i, 1); drawList({ i: Math.max(0, i - 1) }); drawGraph(); }
      else if (ev.key === 'ArrowDown' && i < lines.length - 1) { ev.preventDefault(); drawList({ i: i + 1 }); }
      else if (ev.key === 'ArrowUp' && i > 0) { ev.preventDefault(); drawList({ i: i - 1 }); }
    });
    list.addEventListener('click', ev => {
      const b = ev.target.closest('[data-rm]'); if (!b) return;
      lines.splice(Number(b.dataset.rm), 1);
      if (!lines.length || lines[lines.length - 1].trim()) lines.push('');
      drawList(); drawGraph();
    });
    root.querySelector('#calc-add').addEventListener('click', () => { if (lines[lines.length - 1].trim()) lines.push(''); drawList({ i: lines.length - 1 }); });
    root.querySelector('#calc-ex').addEventListener('change', ev => {
      const ex = EXAMPLES[Number(ev.target.value)]; if (!ex) return;
      lines = ex[1].split('\n').concat(['']); ev.target.value = '';
      graph.innerHTML = ''; drawList(); drawGraph();
    });
    root.querySelector('#calc-clear').addEventListener('click', () => { lines = ['']; graph.innerHTML = ''; drawList({ i: 0 }); drawGraph(); });
    root.querySelector('#calc-share').addEventListener('click', () => {
      const url = location.href.split('#')[0] + '#/graph/' + D.encode(lines.filter(l => l.trim()).join('\n'));
      try { navigator.clipboard.writeText(url).then(() => window.VIEWS.toast('Link copied. It opens this graph.'), () => window.VIEWS.toast('The link couldn’t be copied.')); } catch (e) { window.VIEWS.toast('The link couldn’t be copied.'); }
    });
    root.querySelector('#calc-ask').addEventListener('click', () => {
      const body = lines.filter(l => l.trim()).join('; ');
      if (window.TUTORUI) TUTORUI.open({ ask: body ? `Explain this graph to me: ${body}` : 'How do I use a graphing calculator to graph a line?' });
    });
    if (code) history.replaceState(null, '', '#/graph');
    drawList();
    drawGraph();
    root.__calc = { lines: () => lines };                      // for the test suite
  }

  window.CALC = { page, EXAMPLES };
})();
