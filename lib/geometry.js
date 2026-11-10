/* The geometry lab (#/geometry, #/geometry/<mode>): drawing and measuring by hand, on this device.
   - Sketch pad: points, segments, lines, circles and a compass that keeps its width, every point that lands near a
     crossing snaps onto it (so constructions are exact), a ruler and an angle measure, and an on-screen protractor
     and ruler that can be dragged and turned over the drawing, as on paper.
   - Constructions: four classic compass-and-straightedge constructions, one step at a time; each step is checked
     from the drawing itself, so the learner does the construction, not just reads it.
   - Transformations: a triangle on a grid, moved, flipped, turned or stretched, with the image's coordinates and
     the rule, (x, y) → (x + 3, y − 2). The corners can be dragged.
   Distances are in grid units. Nothing is sent anywhere. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const MODES = [['sketch', 'Sketch pad'], ['construct', 'Constructions'], ['transform', 'Transformations']];
  const XW = 10, YW = 7;                                     // the window: x from −10 to 10, y from −7 to 7
  const EPS = 1e-6, SNAP = 0.45;
  const nf = x => { const r = Math.round(x * 100) / 100; return (Object.is(r, -0) ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace('-', '−'); };
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const NAMES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  /* ---------- geometry of the scene ---------- */
  /** where two objects cross: lines, segments and circles, as [{x, y}] */
  function crossings(o1, o2, P) {
    const L = o => ({ a: P(o.a), b: P(o.b), seg: o.t === 'seg' }), C = o => ({ c: P(o.c), r: radius(o, P) });
    const onSeg = (s, p) => !s.seg || (Math.min(s.a.x, s.b.x) - EPS <= p.x && p.x <= Math.max(s.a.x, s.b.x) + EPS && Math.min(s.a.y, s.b.y) - EPS <= p.y && p.y <= Math.max(s.a.y, s.b.y) + EPS);
    const lineLine = (s, t) => {
      const d = (s.b.x - s.a.x) * (t.b.y - t.a.y) - (s.b.y - s.a.y) * (t.b.x - t.a.x); if (Math.abs(d) < EPS) return [];
      const u = ((t.a.x - s.a.x) * (t.b.y - t.a.y) - (t.a.y - s.a.y) * (t.b.x - t.a.x)) / d, p = { x: s.a.x + u * (s.b.x - s.a.x), y: s.a.y + u * (s.b.y - s.a.y) };
      return onSeg(s, p) && onSeg(t, p) ? [p] : [];
    };
    const lineCirc = (s, c) => {
      const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, fx = s.a.x - c.c.x, fy = s.a.y - c.c.y, A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), Cc = fx * fx + fy * fy - c.r * c.r, D = B * B - 4 * A * Cc;
      if (D < -EPS || A < EPS) return [];
      const sq = Math.sqrt(Math.max(0, D));
      return [(-B - sq) / (2 * A), (-B + sq) / (2 * A)].map(u => ({ x: s.a.x + u * dx, y: s.a.y + u * dy })).filter(p => onSeg(s, p));
    };
    const circCirc = (a, b) => {
      const d = dist(a.c, b.c); if (d < EPS || d > a.r + b.r + EPS || d < Math.abs(a.r - b.r) - EPS) return [];
      const k = (a.r * a.r - b.r * b.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a.r * a.r - k * k)), mx = a.c.x + k * (b.c.x - a.c.x) / d, my = a.c.y + k * (b.c.y - a.c.y) / d;
      return [{ x: mx + h * (b.c.y - a.c.y) / d, y: my - h * (b.c.x - a.c.x) / d }, { x: mx - h * (b.c.y - a.c.y) / d, y: my + h * (b.c.x - a.c.x) / d }];
    };
    const isL = o => o.t === 'seg' || o.t === 'line', isC = o => o.t === 'circ';
    if (isL(o1) && isL(o2)) return lineLine(L(o1), L(o2));
    if (isL(o1) && isC(o2)) return lineCirc(L(o1), C(o2));
    if (isC(o1) && isL(o2)) return lineCirc(L(o2), C(o1));
    if (isC(o1) && isC(o2)) return circCirc(C(o1), C(o2));
    return [];
  }
  /** a circle's radius: through a point, or a width copied from two points (the compass) */
  const radius = (o, P) => (o.p ? dist(P(o.c), P(o.p)) : dist(P(o.w[0]), P(o.w[1])));

  /** a scene: { pts: [{ id, name, x, y } or { id, name, on: [o1id, o2id, k] }], objs: [{ id, t, … }], meas: [] } */
  function makeScene(init) {
    const S = { pts: [], objs: [], meas: [], n: 0 };
    const pos = {};
    /** where each point is now: crossing points follow what they sit on */
    S.P = id => pos[id];
    S.solve = () => {
      S.pts.forEach(p => {
        if (!p.on) { pos[p.id] = { x: p.x, y: p.y }; return; }
        const a = S.objs.find(o => o.id === p.on[0]), b = S.objs.find(o => o.id === p.on[1]);
        const xs = a && b ? crossings(a, b, S.P) : [];
        pos[p.id] = xs[p.on[2]] || xs[0] || pos[p.id] || { x: NaN, y: NaN };
      });
    };
    S.addPt = (x, y, on) => { const p = { id: 'p' + (++S.n), name: NAMES[S.pts.length % 26] + (S.pts.length >= 26 ? Math.floor(S.pts.length / 26) : ''), x, y, on }; S.pts.push(p); S.solve(); return p; };
    S.addObj = o => { o.id = 'o' + (++S.n); S.objs.push(o); S.solve(); return o; };
    S.byName = n => S.pts.find(p => p.name === n);
    S.remove = id => {
      const gone = new Set([id]);
      let grew = true;
      while (grew) {
        grew = false;
        S.objs.forEach(o => { if (!gone.has(o.id) && [o.a, o.b, o.c, o.p].concat(o.w || []).some(k => gone.has(k))) { gone.add(o.id); grew = true; } });
        S.pts.forEach(p => { if (!gone.has(p.id) && p.on && p.on.slice(0, 2).some(k => gone.has(k))) { gone.add(p.id); grew = true; } });
      }
      S.pts = S.pts.filter(p => !gone.has(p.id)); S.objs = S.objs.filter(o => !gone.has(o.id)); S.meas = S.meas.filter(m => !m.ids.some(k => gone.has(k)));
      S.solve();
    };
    S.copy = () => JSON.stringify({ pts: S.pts, objs: S.objs, meas: S.meas, n: S.n });
    S.load = t => { const o = JSON.parse(t); S.pts = o.pts; S.objs = o.objs; S.meas = o.meas; S.n = o.n; S.solve(); };
    if (init) init(S);
    return S;
  }

  /* ---------- the guided constructions: each step is a test of the drawing ---------- */
  const near = (a, b) => Math.abs(a - b) < 1e-4;
  const circ = (S, cId, r) => S.objs.find(o => o.t === 'circ' && o.c === cId && near(radius(o, S.P), r));
  const lineThrough = (S, p, q) => S.objs.find(o => (o.t === 'line' || o.t === 'seg') && [o.a, o.b].every(k => { const z = S.P(k); return [p, q].some(w => w && dist(z, w) < 1e-4); }) && o.a !== o.b);
  /** points lying on both a circle and a segment (by where they are, however they were made) */
  const onBoth = (S, c, sg) => S.pts.filter(p => { const q = S.P(p.id), a = S.P(sg.a), b = S.P(sg.b), cr = S.P(c.c), r = radius(c, S.P); if (!Number.isFinite(q.x) || Math.abs(dist(q, cr) - r) > 1e-3) return false; const cross = (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x); return Math.abs(cross) / (dist(a, b) || 1) < 1e-3 && Math.min(a.x, b.x) - 1e-3 <= q.x && q.x <= Math.max(a.x, b.x) + 1e-3 && Math.min(a.y, b.y) - 1e-3 <= q.y && q.y <= Math.max(a.y, b.y) + 1e-3 && dist(q, S.P(sg.a)) > 1e-3; });
  const crossPts = (S, o1, o2) => S.pts.filter(p => p.on && ((p.on[0] === o1.id && p.on[1] === o2.id) || (p.on[0] === o2.id && p.on[1] === o1.id)));
  const LESSONS = {
    bisect: {
      name: 'Bisect a segment', goal: 'Cut segment AB exactly in half with a line at a right angle to it: its perpendicular bisector.',
      init: S => { const A = S.addPt(-3, -1), B = S.addPt(3, -1); S.addObj({ t: 'seg', a: A.id, b: B.id }); },
      steps: [
        ['With the Circle tool, tap A, then B: a circle centered at A that passes through B.', S => circ(S, S.byName('A').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['Now a circle centered at B that passes through A.', S => circ(S, S.byName('B').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['With the Point tool, tap each place the two circles cross. A point snaps onto a crossing.', S => { const A = S.byName('A'), B = S.byName('B'), r = dist(S.P(A.id), S.P(B.id)), c1 = circ(S, A.id, r), c2 = circ(S, B.id, r); return c1 && c2 && crossPts(S, c1, c2).length >= 2; }],
        ['With the Line tool, join the two crossing points. That line cuts AB in half, at a right angle.', S => { const A = S.byName('A'), B = S.byName('B'), r = dist(S.P(A.id), S.P(B.id)), c1 = circ(S, A.id, r), c2 = circ(S, B.id, r), xs = c1 && c2 ? crossPts(S, c1, c2) : []; return xs.length >= 2 && lineThrough(S, S.P(xs[0].id), S.P(xs[1].id)); }],
      ],
      done: 'Both crossing points are the same distance from A as from B, so every point on the line is too. That is why it meets AB at its midpoint, at 90°.',
    },
    equilateral: {
      name: 'An equilateral triangle', goal: 'Build a triangle whose three sides all equal AB, the first construction in Euclid’s Elements.',
      init: S => { const A = S.addPt(-2, -2), B = S.addPt(2, -2); S.addObj({ t: 'seg', a: A.id, b: B.id }); },
      steps: [
        ['Circle tool: a circle centered at A through B.', S => circ(S, S.byName('A').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['A circle centered at B through A.', S => circ(S, S.byName('B').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['Point tool: mark a place where the circles cross. Call it C.', S => { const A = S.byName('A'), B = S.byName('B'), r = dist(S.P(A.id), S.P(B.id)), c1 = circ(S, A.id, r), c2 = circ(S, B.id, r); return c1 && c2 && crossPts(S, c1, c2).length >= 1; }],
        ['Segment tool: join C to A and C to B.', S => { const A = S.byName('A'), B = S.byName('B'), r = dist(S.P(A.id), S.P(B.id)), c1 = circ(S, A.id, r), c2 = circ(S, B.id, r); const xs = c1 && c2 ? crossPts(S, c1, c2) : []; return xs.some(C => lineThrough(S, S.P(C.id), S.P(A.id)) && lineThrough(S, S.P(C.id), S.P(B.id))); }],
      ],
      done: 'AC is a radius of the circle around A, and BC of the circle around B, and both circles have radius AB. So all three sides are equal, and each angle is 60°.',
    },
    angle: {
      name: 'Bisect an angle', goal: 'Split angle AVB into two equal angles.',
      init: S => { const Vt = S.addPt(-4, -3), A = S.addPt(5, -3), B = S.addPt(0.5, 3); S.pts[0].name = 'V'; S.pts[1].name = 'A'; S.pts[2].name = 'B'; S.addObj({ t: 'seg', a: Vt.id, b: A.id }); S.addObj({ t: 'seg', a: Vt.id, b: B.id }); },
      steps: [
        ['Circle tool: tap V, then a place on side VA about halfway along. The circle crosses both sides.', S => S.objs.some(o => o.t === 'circ' && o.c === S.byName('V').id)],
        ['Point tool: mark where that circle crosses side VB (it already passes through your point on VA).', S => { const c = S.objs.find(o => o.t === 'circ' && o.c === S.byName('V').id); return !!c && S.objs.filter(o => o.t === 'seg').every(sg => onBoth(S, c, sg).length >= 1); }],
        ['Compass tool: tap those two points to set the width, then tap each of them to draw a circle around it.', S => { const c = S.objs.find(o => o.t === 'circ' && o.c === S.byName('V').id); if (!c) return false; const ps = S.objs.filter(o => o.t === 'seg').map(sg => onBoth(S, c, sg)); if (ps.some(x => !x.length)) return false; const around = list => S.objs.filter(o => o.t === 'circ' && list.some(p => p.id === o.c)); return around(ps[0]).some(a => around(ps[1]).some(b => near(radius(a, S.P), radius(b, S.P)))); }],
        ['Point tool: mark where those two circles cross, away from V. Then the Line tool: join V to it.', S => { const Vp = S.P(S.byName('V').id), A = S.P(S.byName('A').id), B = S.P(S.byName('B').id); const ang = (p, q) => Math.atan2(q.y - p.y, q.x - p.x); return S.objs.some(o => { if (o.t !== 'line' && o.t !== 'seg') return false; const ends = [S.P(o.a), S.P(o.b)], other = ends.find(e => dist(e, Vp) > 1e-3), atV = ends.some(e => dist(e, Vp) < 1e-4); if (!atV || !other) return false; const t = ang(Vp, other), a1 = ang(Vp, A), b1 = ang(Vp, B); return Math.abs(Math.abs(t - a1) - Math.abs(b1 - t)) < 1e-3; }); }],
      ],
      done: 'The line splits the angle into two equal angles: the two small circles have the same radius, so their crossing is the same distance from both sides.',
    },
    copy: {
      name: 'Copy a segment', goal: 'Make a segment from P the same length as AB, using only the compass.',
      init: S => { const A = S.addPt(-6, 2), B = S.addPt(-2, 4), P = S.addPt(-2, -3), Q = S.addPt(7, -3); S.pts[2].name = 'P'; S.pts[3].name = 'Q'; S.addObj({ t: 'seg', a: A.id, b: B.id }); S.addObj({ t: 'line', a: P.id, b: Q.id }); },
      steps: [
        ['Compass tool: tap A, then B, to set the compass to the length of AB.', (S, U) => U.compass && near(dist(S.P(U.compass[0]), S.P(U.compass[1])), dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['Now tap P: the compass draws a circle around P with that width.', S => circ(S, S.byName('P').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id)))],
        ['Point tool: mark where the circle crosses the line.', S => { const c = circ(S, S.byName('P').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id))), ln = S.objs.find(o => o.t === 'line'); return c && ln && crossPts(S, c, ln).length >= 1; }],
        ['Segment tool: join P to that point. Measure both with the Ruler to see they match.', S => { const c = circ(S, S.byName('P').id, dist(S.P(S.byName('A').id), S.P(S.byName('B').id))), ln = S.objs.find(o => o.t === 'line'); const xs = c && ln ? crossPts(S, c, ln) : []; return xs.some(x => S.objs.some(o => o.t === 'seg' && [o.a, o.b].includes(S.byName('P').id) && [o.a, o.b].includes(x.id))); }],
      ],
      done: 'The new segment is a radius of a circle whose radius is AB, so it is exactly as long as AB.',
    },
  };

  /* ---------- the transformations ---------- */
  const TRANS = [['translate', 'Slide (translate)'], ['reflect', 'Flip (reflect)'], ['rotate', 'Turn (rotate)'], ['dilate', 'Stretch (dilate)']];
  const sgn = (v, txt) => (v === 0 ? '' : v > 0 ? ` + ${txt || nf(v)}` : ` − ${txt || nf(-v)}`);
  function transformed(T, p) {
    if (T.kind === 'translate') return { x: p.x + T.dx, y: p.y + T.dy };
    if (T.kind === 'reflect') return T.line === 'x' ? { x: p.x, y: -p.y } : T.line === 'y' ? { x: -p.x, y: p.y } : T.line === 'yx' ? { x: p.y, y: p.x } : { x: -p.y, y: -p.x };
    if (T.kind === 'rotate') return T.deg === 90 ? { x: -p.y, y: p.x } : T.deg === 180 ? { x: -p.x, y: -p.y } : { x: p.y, y: -p.x };
    return { x: p.x * T.k, y: p.y * T.k };
  }
  function ruleOf(T) {
    if (T.kind === 'translate') return `(x, y) → (x${sgn(T.dx)}, y${sgn(T.dy)})`;
    if (T.kind === 'reflect') return { x: '(x, y) → (x, −y)', y: '(x, y) → (−x, y)', yx: '(x, y) → (y, x)', nyx: '(x, y) → (−y, −x)' }[T.line];
    if (T.kind === 'rotate') return { 90: '(x, y) → (−y, x)', 180: '(x, y) → (−x, −y)', 270: '(x, y) → (y, −x)' }[T.deg];
    return `(x, y) → (${nf(T.k)}x, ${nf(T.k)}y)`;
  }
  function factOf(T) {
    if (T.kind === 'dilate') return T.k === 1 ? 'A scale factor of 1 leaves the shape where it is.' : `Every length is ${T.k > 1 ? 'multiplied' : 'multiplied'} by ${nf(T.k)}, so the image is similar to the original: same angles, ${T.k > 1 ? 'larger' : 'smaller'} sides. Its area is multiplied by ${nf(T.k * T.k)}.`;
    return `A ${T.kind === 'translate' ? 'slide' : T.kind === 'reflect' ? 'flip' : 'turn'} keeps every length and angle the same, so the image is congruent to the original.${T.kind === 'reflect' ? ' The order of the corners reverses: the image is a mirror image.' : ''}`;
  }

  /* ---------- drawing ---------- */
  const W = 2 * XW, Hh = 2 * YW;
  function grid(axes) {
    let g = '';
    for (let x = -XW; x <= XW; x++) g += `<line x1="${x}" y1="${-YW}" x2="${x}" y2="${YW}" class="gl-grid${x === 0 && axes ? ' ax' : ''}"/>`;
    for (let y = -YW; y <= YW; y++) g += `<line x1="${-XW}" y1="${y}" x2="${XW}" y2="${y}" class="gl-grid${y === 0 && axes ? ' ax' : ''}"/>`;
    if (axes) { for (let x = -XW + 2; x < XW; x += 2) if (x) g += `<text x="${x}" y="0.55" class="gl-num" transform="scale(1,-1)" text-anchor="middle">${x}</text>`; for (let y = -YW + 1; y < YW; y += 2) if (y) g += `<text x="-0.25" y="${-y + 0.18}" class="gl-num" transform="scale(1,-1)" text-anchor="end">${y}</text>`; }
    return g;
  }
  /** the on-screen protractor and ruler, drawn in grid units around their own center */
  function protractorSvg() {
    let s = '<path d="M -4 0 A 4 4 0 0 1 4 0 Z" class="gl-prot"/>';
    for (let d = 0; d <= 180; d += 5) { const a = d * Math.PI / 180, r1 = d % 10 ? 3.65 : 3.4, c = Math.cos(a), sn = Math.sin(a); s += `<line x1="${4 * c}" y1="${4 * sn}" x2="${r1 * c}" y2="${r1 * sn}" class="gl-tick"/>`; if (d % 30 === 0) s += `<text x="${3 * c}" y="${-3 * sn + 0.12}" transform="scale(1,-1)" class="gl-tickt" text-anchor="middle">${d}</text>`; }
    return s + '<circle r="0.12" class="gl-hub"/><line x1="0" y1="0" x2="0" y2="1.2" class="gl-tick"/>';
  }
  function rulerSvg() {
    let s = '<rect x="-0.3" y="-0.9" width="10.6" height="0.9" rx="0.12" class="gl-rule"/>';
    for (let k = 0; k <= 20; k++) { const x = k / 2; s += `<line x1="${x}" y1="0" x2="${x}" y2="${k % 2 ? -0.22 : -0.38}" class="gl-tick"/>`; if (k % 2 === 0) s += `<text x="${x}" y="0.72" transform="scale(1,-1)" class="gl-tickt" text-anchor="middle">${k / 2}</text>`; }
    return s;
  }

  function page(root, mode) {
    mode = MODES.some(m => m[0] === mode) ? mode : 'sketch';
    root.innerHTML = `<div class="gl-page">
      <div class="gl-head"><h1>Geometry lab</h1><p class="muted">Draw with a compass and straightedge, measure with a ruler and protractor, and move shapes on a grid.</p>
        <div class="tabs gl-modes" role="tablist" aria-label="Geometry lab">${MODES.map(([k, l]) => `<a class="tab${k === mode ? ' on' : ''}" role="tab" aria-selected="${k === mode}" href="#/geometry/${k}">${l}</a>`).join('')}</div></div>
      <div class="gl-main"><div class="card gl-stage"><svg class="gl-svg" viewBox="${-XW} ${-YW} ${W} ${Hh}" role="img" aria-label="Drawing area"><g transform="scale(1,-1)" class="gl-world"></g></svg></div>
        <div class="card gl-side" id="gl-side"></div></div>
    </div>`;
    const svg = root.querySelector('.gl-svg'), world = root.querySelector('.gl-world'), side = root.querySelector('#gl-side');
    const toWorld = ev => { const r = svg.getBoundingClientRect(), k = Math.max(W / r.width, Hh / r.height), ox = (r.width * k - W) / 2, oy = (r.height * k - Hh) / 2; return { x: (ev.clientX - r.left) * k - ox - XW, y: YW - ((ev.clientY - r.top) * k - oy) }; };
    if (mode === 'transform') return transformMode();
    return sketchMode(mode === 'construct');

    /* ---------- sketch pad and constructions ---------- */
    function sketchMode(guided) {
      const TOOLS = [['move', 'Move'], ['point', 'Point'], ['seg', 'Segment'], ['line', 'Line'], ['circ', 'Circle'], ['compass', 'Compass'], ['len', 'Ruler'], ['ang', 'Angle'], ['erase', 'Erase']];
      let lesson = guided ? 'bisect' : null, S = makeScene(guided ? LESSONS[lesson].init : null), tool = guided ? 'circ' : 'point', pick = [], drag = null, step = 0;
      const U = { compass: null, prot: null, ruler: null };
      const past = [];
      const keep = () => { past.push(S.copy()); if (past.length > 60) past.shift(); };
      const hint = { move: 'Drag a point to move it. Points made from a crossing follow what they sit on.', point: 'Tap to place a point. Near a crossing, it snaps onto it.', seg: 'Tap two points (or two places) for a segment.', line: 'Tap two points for a line that goes on forever.', circ: 'Tap the center, then a point the circle passes through.', compass: U => (U.compass ? `The compass is open to ${nf(dist(S.P(U.compass[0]), S.P(U.compass[1])))}. Tap a point to draw a circle around it.` : 'Tap two points to open the compass to the distance between them.'), len: 'Ruler: tap two points to measure the distance between them.', ang: 'Angle: tap a point on one side, the corner, then a point on the other side.', erase: 'Tap a point, line or circle to erase it, with anything built from it.' };
      function sidebar() {
        const L = guided && LESSONS[lesson];
        side.innerHTML = `${guided ? `<div class="gl-lessons" role="group" aria-label="Constructions">${Object.keys(LESSONS).map(k => `<button type="button" class="chip-btn${k === lesson ? ' on' : ''}" data-lesson="${k}">${LESSONS[k].name}</button>`).join('')}</div>
          <h2 class="gl-ltitle">${esc(L.name)}</h2><p class="small muted">${esc(L.goal)}</p>
          <ol class="gl-steps">${L.steps.map(([t], i) => `<li class="${i < step ? 'done' : i === step ? 'on' : ''}">${esc(t)}</li>`).join('')}</ol>
          ${step >= L.steps.length ? `<div class="feedback good">${window.ICONS ? ICONS.svg('check') : ''}<span><b>Constructed.</b> ${esc(L.done)}</span></div>` : ''}` : ''}
          <div class="gl-tools" role="toolbar" aria-label="Tools">${TOOLS.map(([k, l]) => `<button type="button" class="btn sm${k === tool ? ' primary' : ''}" data-tool="${k}" aria-pressed="${k === tool}">${l}</button>`).join('')}</div>
          <p class="small gl-hint" id="gl-hint" aria-live="polite">${esc(typeof hint[tool] === 'function' ? hint[tool](U) : hint[tool])}${tool === 'compass' && U.compass ? ' <button type="button" class="btn sm ghost" id="gl-width">New width</button>' : ''}</p>
          <div class="btn-row gl-acts"><button type="button" class="btn sm" id="gl-prot" aria-pressed="${!!U.prot}">${U.prot ? 'Hide' : 'Show'} the protractor</button><button type="button" class="btn sm" id="gl-ruler" aria-pressed="${!!U.ruler}">${U.ruler ? 'Hide' : 'Show'} the ruler</button><button type="button" class="btn sm ghost" id="gl-undo">Undo</button><button type="button" class="btn sm ghost" id="gl-clear">${guided ? 'Start again' : 'Clear'}</button></div>
          ${S.meas.length ? `<div class="gl-meas"><h3>Measurements</h3><ul class="small">${S.meas.map(m => `<li>${measText(m)}</li>`).join('')}</ul></div>` : ''}
          ${U.prot || U.ruler ? '<p class="tiny muted">Drag the protractor or ruler to move it; drag its round handle to turn it.</p>' : ''}`;
      }
      const nameOf = id => (S.pts.find(p => p.id === id) || {}).name || '?';
      function measVal(m) {
        if (m.t === 'len') return dist(S.P(m.ids[0]), S.P(m.ids[1]));
        const [a, v, b] = m.ids.map(S.P), t1 = Math.atan2(a.y - v.y, a.x - v.x), t2 = Math.atan2(b.y - v.y, b.x - v.x);
        let d = Math.abs(t1 - t2) * 180 / Math.PI; if (d > 180) d = 360 - d; return d;
      }
      const measText = m => (m.t === 'len' ? `${nameOf(m.ids[0])}${nameOf(m.ids[1])} = ${nf(measVal(m))}` : `∠${m.ids.map(nameOf).join('')} = ${nf(measVal(m))}°`);
      function render() {
        S.solve();
        const P = S.P, lines = [], pts = [], marks = [];
        S.objs.forEach(o => {
          if (o.t === 'circ') { const c = P(o.c), r = radius(o, P); if (Number.isFinite(c.x)) lines.push(`<circle cx="${c.x}" cy="${c.y}" r="${r}" class="gl-obj"/>`); return; }
          const a = P(o.a), b = P(o.b); if (!Number.isFinite(a.x) || !Number.isFinite(b.x)) return;
          if (o.t === 'seg') lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="gl-obj"/>`);
          else { const dx = b.x - a.x, dy = b.y - a.y, k = 60 / (Math.hypot(dx, dy) || 1); lines.push(`<line x1="${a.x - dx * k}" y1="${a.y - dy * k}" x2="${a.x + dx * k}" y2="${a.y + dy * k}" class="gl-obj"/>`); }
        });
        S.meas.forEach(m => {
          if (m.t === 'len') { const a = P(m.ids[0]), b = P(m.ids[1]); marks.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="gl-mline"/><text x="${(a.x + b.x) / 2}" y="${-(a.y + b.y) / 2 - 0.3}" transform="scale(1,-1)" class="gl-mtext" text-anchor="middle">${nf(measVal(m))}</text>`); }
          else { const [a, v, b] = m.ids.map(P), t1 = Math.atan2(a.y - v.y, a.x - v.x), t2 = Math.atan2(b.y - v.y, b.x - v.x); let d = t2 - t1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; const r = 0.9, e = t1 + d, mid = t1 + d / 2;
            marks.push(`<path d="M ${v.x + r * Math.cos(t1)} ${v.y + r * Math.sin(t1)} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${v.x + r * Math.cos(e)} ${v.y + r * Math.sin(e)}" class="gl-mline"/><text x="${v.x + 1.6 * Math.cos(mid)}" y="${-(v.y + 1.6 * Math.sin(mid)) + 0.15}" transform="scale(1,-1)" class="gl-mtext" text-anchor="middle">${nf(measVal(m))}°</text>`); }
        });
        S.pts.forEach(p => { const q = P(p.id); if (!Number.isFinite(q.x)) return; const sel = pick.includes(p.id) || (U.compass && U.compass.includes(p.id) && tool === 'compass'); pts.push(`<circle cx="${q.x}" cy="${q.y}" r="${sel ? 0.24 : 0.17}" class="gl-pt${p.on ? ' on' : ''}${sel ? ' sel' : ''}"/><text x="${q.x + 0.28}" y="${-q.y - 0.28}" transform="scale(1,-1)" class="gl-name">${esc(p.name)}</text>`); });
        const tool2 = (u, svgIn, cls) => (u ? `<g class="gl-inst ${cls}" transform="translate(${u.x} ${u.y}) rotate(${u.a})">${svgIn}<circle cx="${cls === 'prot' ? 4.4 : 10.8}" cy="0" r="0.35" class="gl-turn" data-turn="${cls}"/><rect x="${cls === 'prot' ? -4 : -0.3}" y="${cls === 'prot' ? 0 : -0.9}" width="${cls === 'prot' ? 8 : 10.6}" height="${cls === 'prot' ? 4 : 0.9}" class="gl-grab" data-grab="${cls}"/></g>` : '');
        world.innerHTML = grid(false) + lines.join('') + marks.join('') + pts.join('') + tool2(U.prot, protractorSvg(), 'prot') + tool2(U.ruler, rulerSvg(), 'rule');
        root.__geo = { mode: guided ? 'construct' : 'sketch', lesson, step, tool, pts: S.pts.map(p => ({ name: p.name, x: P(p.id).x, y: P(p.id).y, on: !!p.on })), objs: S.objs.map(o => o.t), meas: S.meas.map(measText), compass: U.compass ? dist(P(U.compass[0]), P(U.compass[1])) : null };
      }
      function progress() {
        if (!guided) return;
        const L = LESSONS[lesson];
        while (step < L.steps.length && L.steps[step][1](S, U)) step++;
      }
      const update = () => { progress(); render(); sidebar(); };
      /** the point at or nearest a place: an existing point, a crossing (snapped), or a new free point */
      function pointAt(w, make) {
        const P = S.P;
        let best = null, bd = SNAP;
        S.pts.forEach(p => { const d = dist(P(p.id), w); if (d < bd) { bd = d; best = p; } });
        if (best || !make) return best;
        let cross = null; bd = SNAP;
        for (let i = 0; i < S.objs.length; i++) for (let j = i + 1; j < S.objs.length; j++) crossings(S.objs[i], S.objs[j], P).forEach((x, k) => { const d = dist(x, w); if (d < bd) { bd = d; cross = [S.objs[i].id, S.objs[j].id, k]; } });
        keep();
        if (cross) return S.addPt(0, 0, cross);
        const g = v => Math.round(v * 2) / 2;                  // free points land on half-units, so lengths come out clean
        return S.addPt(g(w.x), g(w.y));
      }
      function objAt(w) {
        const P = S.P;
        let best = null, bd = 0.35;
        S.objs.forEach(o => {
          let d;
          if (o.t === 'circ') d = Math.abs(dist(P(o.c), w) - radius(o, P));
          else { const a = P(o.a), b = P(o.b), dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1; let u = ((w.x - a.x) * dx + (w.y - a.y) * dy) / L2; if (o.t === 'seg') u = Math.max(0, Math.min(1, u)); d = Math.hypot(a.x + u * dx - w.x, a.y + u * dy - w.y); }
          if (d < bd) { bd = d; best = o; }
        });
        return best;
      }
      function tap(w) {
        if (tool === 'erase') { const p = pointAt(w, false), o = p ? null : objAt(w); if (p || o) { keep(); S.remove((p || o).id); } return; }
        if (tool === 'point') { pointAt(w, true); return; }
        const p = pointAt(w, true); if (!p) return;
        pick.push(p.id);
        const need = tool === 'ang' ? 3 : 2;
        if (tool === 'compass') {
          if (U.compass) { keep(); S.addObj({ t: 'circ', c: p.id, w: U.compass.slice() }); pick = []; return; }
          if (pick.length === 2) { if (pick[0] !== pick[1]) U.compass = pick.slice(); pick = []; }
          return;
        }
        if (pick.length < need) return;
        const [a, b, c] = pick; pick = [];
        if (a === b || (c && (b === c || a === c))) return;
        keep();
        if (tool === 'seg' || tool === 'line') S.addObj({ t: tool, a, b });
        else if (tool === 'circ') S.addObj({ t: 'circ', c: a, p: b });
        else if (tool === 'len') S.meas.push({ t: 'len', ids: [a, b] });
        else if (tool === 'ang') S.meas.push({ t: 'ang', ids: [a, b, c] });
      }
      svg.addEventListener('pointerdown', ev => {
        const w = toWorld(ev), grab = ev.target.closest('[data-grab]'), turn = ev.target.closest('[data-turn]');
        if (turn || grab) { const k = (turn || grab).dataset.turn || grab.dataset.grab, u = k === 'prot' ? U.prot : U.ruler; drag = { inst: u, turn: !!turn, off: { x: w.x - u.x, y: w.y - u.y } }; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); return; }
        if (tool === 'move') { const p = pointAt(w, false); if (p && !p.on) { keep(); drag = { p }; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); } return; }
        tap(w); update(); ev.preventDefault();
      });
      svg.addEventListener('pointermove', ev => {
        if (!drag) return;
        const w = toWorld(ev);
        if (drag.p) { drag.p.x = Math.round(w.x * 4) / 4; drag.p.y = Math.round(w.y * 4) / 4; }
        else if (drag.turn) drag.inst.a = Math.round(Math.atan2(w.y - drag.inst.y, w.x - drag.inst.x) * 180 / Math.PI);
        else { drag.inst.x = w.x - drag.off.x; drag.inst.y = w.y - drag.off.y; }
        render();
      });
      const end = () => { if (drag) { drag = null; update(); } };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      side.addEventListener('click', ev => {
        const b = ev.target.closest('button'); if (!b) return;
        if (b.dataset.tool) { tool = b.dataset.tool; pick = []; }
        else if (b.id === 'gl-width') { U.compass = null; pick = []; }
        else if (b.dataset.lesson) { lesson = b.dataset.lesson; S = makeScene(LESSONS[lesson].init); step = 0; pick = []; U.compass = null; tool = lesson === 'angle' || lesson === 'copy' ? 'compass' : 'circ'; past.length = 0; }
        else if (b.id === 'gl-prot') U.prot = U.prot ? null : { x: 0, y: -5, a: 0 };
        else if (b.id === 'gl-ruler') U.ruler = U.ruler ? null : { x: -5, y: 5.5, a: 0 };
        else if (b.id === 'gl-undo') { if (past.length) S.load(past.pop()); pick = []; if (guided) { step = 0; } }
        else if (b.id === 'gl-clear') { S = makeScene(guided ? LESSONS[lesson].init : null); step = 0; pick = []; U.compass = null; past.length = 0; }
        update();
      });
      root.__geoTap = (x, y) => { tap({ x, y }); update(); };           // for the test suite
      root.__geoTool = t => { tool = t; pick = []; update(); };
      update();
      H.tutorCtx({ notes: guided ? 'The student is doing compass-and-straightedge constructions in the geometry lab, with each step checked.' : 'The student is using the geometry lab sketch pad: points, lines, circles, a compass, a ruler and a protractor.' });
    }

    /* ---------- transformations on a grid ---------- */
    function transformMode() {
      const SHAPES = { tri: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 3 }], quad: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 3 }, { x: 2, y: 3 }] };
      let pts = SHAPES.tri.map(p => Object.assign({}, p)), T = { kind: 'translate', dx: 3, dy: -2, line: 'y', deg: 90, k: 2 }, drag = null;
      const N = i => NAMES[i];
      function draw() {
        const img = pts.map(p => transformed(T, p));
        const poly = (ps, cls) => `<polygon points="${ps.map(p => `${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;
        const labels = (ps, prime, cls) => ps.map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${prime ? 0.16 : 0.24}" class="${cls}" ${prime ? '' : `data-v="${i}"`}/><text x="${p.x + 0.25}" y="${-p.y - 0.25}" transform="scale(1,-1)" class="gl-name">${N(i)}${prime ? '′' : ''}</text>`).join('');
        const line = T.kind === 'reflect' ? ({ x: '<line x1="-10" y1="0" x2="10" y2="0" class="gl-mirror"/>', y: '<line x1="0" y1="-7" x2="0" y2="7" class="gl-mirror"/>', yx: '<line x1="-7" y1="-7" x2="7" y2="7" class="gl-mirror"/>', nyx: '<line x1="-7" y1="7" x2="7" y2="-7" class="gl-mirror"/>' }[T.line]) : T.kind === 'rotate' || T.kind === 'dilate' ? '<circle cx="0" cy="0" r="0.2" class="gl-center"/>' : '';
        const arrows = pts.map((p, i) => `<line x1="${p.x}" y1="${p.y}" x2="${img[i].x}" y2="${img[i].y}" class="gl-arrow"/>`).join('');
        world.innerHTML = grid(true) + line + arrows + poly(pts, 'gl-pre') + poly(img, 'gl-img') + labels(img, true, 'gl-ipt') + labels(pts, false, 'gl-vpt');
        const off = img.some(p => Math.abs(p.x) > XW || Math.abs(p.y) > YW);
        side.innerHTML = `<div class="gl-tools" role="group" aria-label="Transformation">${TRANS.map(([k, l]) => `<button type="button" class="btn sm${k === T.kind ? ' primary' : ''}" data-kind="${k}" aria-pressed="${k === T.kind}">${l}</button>`).join('')}</div>
          <div class="gl-ctrls">${T.kind === 'translate' ? ['dx', 'dy'].map(k => `<label class="gl-ctrl"><span>${k === 'dx' ? 'Right (+) or left (−)' : 'Up (+) or down (−)'}: <b>${nf(T[k])}</b></span><input type="range" min="-8" max="8" step="1" value="${T[k]}" data-t="${k}"></label>`).join('')
            : T.kind === 'reflect' ? `<div class="gl-opts">${[['x', 'the x-axis'], ['y', 'the y-axis'], ['yx', 'y = x'], ['nyx', 'y = −x']].map(([k, l]) => `<button type="button" class="chip-btn${T.line === k ? ' on' : ''}" data-line="${k}">Across ${l}</button>`).join('')}</div>`
            : T.kind === 'rotate' ? `<div class="gl-opts">${[90, 180, 270].map(d => `<button type="button" class="chip-btn${T.deg === d ? ' on' : ''}" data-deg="${d}">${d}° counterclockwise</button>`).join('')}</div><p class="tiny muted">About the origin (0, 0).</p>`
            : `<label class="gl-ctrl"><span>Scale factor: <b>${nf(T.k)}</b></span><input type="range" min="0.5" max="3" step="0.5" value="${T.k}" data-t="k"></label><p class="tiny muted">From the center (0, 0).</p>`}</div>
          <p class="gl-rule"><b>The rule:</b> ${esc(ruleOf(T))}</p>
          <table class="ch-table gl-table"><thead><tr><th>Corner</th><th>Before</th><th>After</th></tr></thead><tbody>${pts.map((p, i) => `<tr><td>${N(i)} → ${N(i)}′</td><td>(${nf(p.x)}, ${nf(p.y)})</td><td>(${nf(img[i].x)}, ${nf(img[i].y)})</td></tr>`).join('')}</tbody></table>
          <p class="small">${esc(factOf(T))}</p>${off ? '<p class="small muted">Part of the image is off the grid. Drag the corners closer to the middle.</p>' : ''}
          <div class="btn-row"><button type="button" class="btn sm" data-shape="tri">A triangle</button><button type="button" class="btn sm" data-shape="quad">A four-sided shape</button></div>
          <p class="tiny muted">Drag a corner of the blue shape to move it. The image follows.</p>`;
        root.__geo = { mode: 'transform', kind: T.kind, rule: ruleOf(T), before: pts.map(p => [p.x, p.y]), after: img.map(p => [p.x, p.y]) };
      }
      svg.addEventListener('pointerdown', ev => { const v = ev.target.closest('[data-v]'); if (!v) return; drag = Number(v.dataset.v); svg.setPointerCapture(ev.pointerId); ev.preventDefault(); });
      svg.addEventListener('pointermove', ev => { if (drag === null) return; const w = toWorld(ev); pts[drag] = { x: Math.max(-XW, Math.min(XW, Math.round(w.x))), y: Math.max(-YW, Math.min(YW, Math.round(w.y))) }; draw(); });
      const end = () => { drag = null; };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      side.addEventListener('click', ev => {
        const b = ev.target.closest('button'); if (!b) return;
        if (b.dataset.kind) T.kind = b.dataset.kind; else if (b.dataset.line) T.line = b.dataset.line; else if (b.dataset.deg) T.deg = Number(b.dataset.deg); else if (b.dataset.shape) pts = SHAPES[b.dataset.shape].map(p => Object.assign({}, p)); else return;
        draw();
      });
      side.addEventListener('input', ev => { const r = ev.target.closest('[data-t]'); if (!r) return; T[r.dataset.t] = Number(r.value); draw(); const again = side.querySelector(`[data-t="${r.dataset.t}"]`); if (again) again.focus(); });
      root.__geoSet = o => { Object.assign(T, o); draw(); };
      draw();
      H.tutorCtx({ notes: 'The student is in the geometry lab, transforming a shape on a coordinate grid (translations, reflections, rotations and dilations).' });
    }
  }

  window.GEOMETRY = { page, crossings, transformed, ruleOf, LESSONS };
})();
