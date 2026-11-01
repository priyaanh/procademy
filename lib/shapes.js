/* Shapes and space (#/shapes, #/shapes/<kind>, #/shapes/<kind>/<a>_<b>_…[_<unit>]). Flat shapes show area and
   perimeter or circumference; solids show volume and surface area with a net and a table of its faces; two more
   pages cover angle pairs and building a triangle from three sides. Every shape is drawn to scale from the
   numbers typed, and every answer shows the formula, the numbers put in and the result, the way CPM Course 2
   chapters 8 and 9 write them. Answers with π come exactly (25π) and rounded, with π and with 3.14. */
'use strict';
(function () {
  const V = window.VIEWS, H = V._h, esc = H.esc;
  const PI = Math.PI;
  const UNITS = ['', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
  const MAX = 1e6;

  // ---- numbers
  const clean = x => Math.round(x * 1e9) / 1e9;
  const nf = x => clean(x).toLocaleString('en-US', { maximumFractionDigits: 3 });
  const nf2 = x => x.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const nf1 = x => x.toLocaleString('en-US', { maximumFractionDigits: 1 });
  const raw = x => String(clean(x));
  const exact = x => { const c = clean(x); return Math.abs(Number(c.toFixed(3)) - c) < 1e-9; };
  const whole = x => Math.abs(x - Math.round(x)) < 1e-9;
  const same = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, a, b);
  const num = x => (exact(x) ? nf(x) : '≈ ' + nf2(x));
  const is = x => (exact(x) ? '= ' + nf(x) : '≈ ' + nf2(x));
  const sq = x => `${nf(x)}²`;
  const frac = (n, d) => `<span class="frac"><span class="num">${n}</span><span class="den">${d}</span></span>`;
  const HALF = frac(1, 2), THIRD = frac(1, 3);
  /** k as a multiple of π: 25π, 6.25π, 32/3 π (stacked, or with a slash when text is true, for drawings) */
  function piK(k, text) {
    const c = clean(k);
    if (same(c, 1)) return 'π';
    if (exact(c)) return nf(c) + 'π';
    for (let d = 2; d <= 12; d++) { const n = c * d; if (whole(n) && Math.abs(n) < 1e9) return (text ? `${nf(Math.round(n))}/${d}` : frac(nf(Math.round(n)), d)) + 'π'; }
    return '≈ ' + nf2(c) + 'π';
  }
  const piNote = (k, u) => `≈ ${nf2(k * PI)}${u} · with 3.14: ${nf2(k * 3.14)}${u}`;
  const U = { len: u => (u ? ' ' + u : ' units'), area: u => (u ? ` ${u}²` : ' square units'), vol: u => (u ? ` ${u}³` : ' cubic units') };
  const L = (x, u) => `${nf(x)}${u ? ' ' + u : ''}`;   // a label on a drawing

  // ---- drawing
  const W = 360, HH = 250, PAD = 38;
  const r1 = x => Math.round(x * 10) / 10;
  const pt = p => `${r1(p[0])},${r1(p[1])}`;
  const pg = (ps, cls) => `<polygon points="${ps.map(pt).join(' ')}" class="${cls}"/>`;
  const seg = (a, b, cls) => `<line x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}" class="${cls}"/>`;
  const txt = (p, t, cls) => `<text x="${r1(p[0])}" y="${r1(p[1])}" text-anchor="middle" class="${cls || 'sh-lab'}">${t}</text>`;
  const svg = (body, label, w, h) => `<svg class="sh-svg" viewBox="0 0 ${w || W} ${h || HH}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  /** fit points (math coordinates, y up) into the picture; P maps a point to the screen */
  function frame(pts, w, h, pad) {
    w = w || W; h = h || HH; pad = pad === undefined ? PAD : pad;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min((w - 2 * pad) / ((x1 - x0) || 1), (h - 2 * pad) / ((y1 - y0) || 1));
    const ox = (w - (x1 - x0) * s) / 2, oy = (h - (y1 - y0) * s) / 2;
    return { s, P: p => [ox + (p[0] - x0) * s, h - oy - (p[1] - y0) * s] };
  }
  /** a label beside the side a–b (screen points), on the side away from c */
  function side(a, b, t, c, off) {
    off = off || 13;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;
    if ((c[0] - mx) * nx + (c[1] - my) * ny > 0) { nx = -nx; ny = -ny; }
    const k = off + String(t).replace(/<[^>]+>/g, '').length * 3.4 * Math.abs(nx);
    return txt([mx + nx * k, my + ny * k + 4.5], t);
  }
  /** the little square in a right angle at p, between the directions to a and b */
  function corner(p, a, b, size) {
    size = size || 10;
    const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
    const lu = Math.hypot(...u) || 1, lv = Math.hypot(...v) || 1;
    const A = [p[0] + u[0] / lu * size, p[1] + u[1] / lu * size], B = [p[0] + v[0] / lv * size, p[1] + v[1] / lv * size];
    return `<path d="M${pt(A)} L${pt([A[0] + B[0] - p[0], A[1] + B[1] - p[1]])} L${pt(B)}" class="sh-mark"/>`;
  }
  const arcPts = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
  const centre = ps => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
  /** a prism: the front face (math coordinates, counter-clockwise) pushed back along D; hidden edges are dashed */
  const DEPTH = [0.46, 0.3];
  function prism(front, d, extra) {
    const D = [d * DEPTH[0], d * DEPTH[1]], n = front.length;
    const back = front.map(p => [p[0] + D[0], p[1] + D[1]]);
    const fr = frame(front.concat(back, extra || [])), P = fr.P;
    const vis = front.map((p, i) => { const q = front[(i + 1) % n]; return (q[1] - p[1]) * D[0] - (q[0] - p[0]) * D[1] > 1e-9; });
    const shown = [], hid = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      shown.push([front[i], front[j]]);
      (vis[i] ? shown : hid).push([back[i], back[j]]);
      (vis[i] || vis[(i - 1 + n) % n] ? shown : hid).push([front[i], back[i]]);
    }
    const faces = front.map((p, i) => (vis[i] ? pg([p, front[(i + 1) % n], back[(i + 1) % n], back[i]].map(P), 'sh-face side') : '')).join('');
    const body = faces + pg(front.map(P), 'sh-face') + hid.map(([a, b]) => seg(P(a), P(b), 'sh-hid')).join('') + shown.map(([a, b]) => seg(P(a), P(b), 'sh-edge')).join('');
    return { body, P, D, back, s: fr.s, c: P(centre(front.concat(back))) };
  }
  /** a net: faces [{pts, cls, t (dimensions), a (area)}] */
  function netSvg(faces, label, extra) {
    const fr = frame(faces.flatMap(f => f.pts), W, 270, 14), P = fr.P;
    const body = faces.map(f => {
      const ps = f.pts.map(P), xs = ps.map(p => p[0]), ys = ps.map(p => p[1]);
      const c = f.at ? P(f.at) : centre(ps), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
      const room = w > 52 && h > 34, small = w > 30 && h > 18;
      return pg(ps, 'sh-net ' + f.cls) + (room ? txt([c[0], c[1] - 2], f.a, 'sh-lab b') + txt([c[0], c[1] + 13], f.t, 'sh-lab s') : small ? txt([c[0], c[1] + 4], f.a, 'sh-lab s') : '');
    }).join('');
    return svg(body + (extra ? extra(P, fr.s) : ''), label, W, 270);
  }
  const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ---- the shapes. Each returns {fig, res: [[label, value, note]], work: [[title, [lines]]], net, faces, notes, hook}
  const done = (x, u) => `${is(x)}${u}`;
  function rect([l, w], u) {
    const A = l * w, P = 2 * l + 2 * w, pts = box(0, 0, l, w), fr = frame(pts), S = pts.map(fr.P), c = fr.P([l / 2, w / 2]);
    let grid = '';
    if (whole(l) && whole(w) && l <= 30 && w <= 30) {
      for (let i = 1; i < l; i++) grid += seg(fr.P([i, 0]), fr.P([i, w]), 'sh-grid');
      for (let j = 1; j < w; j++) grid += seg(fr.P([0, j]), fr.P([l, j]), 'sh-grid');
    }
    return {
      fig: svg(pg(S, 'sh-face') + grid + pg(S, 'sh-edge') + corner(S[0], S[1], S[3]) + side(S[0], S[1], L(l, u), c) + side(S[3], S[0], L(w, u), c), `A rectangle ${nf(l)} by ${nf(w)}`),
      res: [['Area', num(A) + U.area(u)], ['Perimeter', num(P) + U.len(u)]],
      work: [['Area', ['A = length × width', `= ${nf(l)} × ${nf(w)}`, done(A, U.area(u))]],
        ['Perimeter', ['P = 2 × length + 2 × width', `= 2 × ${nf(l)} + 2 × ${nf(w)}`, `= ${nf(2 * l)} + ${nf(2 * w)}`, done(P, U.len(u))]]],
      notes: [same(l, w) ? `The length and width are equal, so this is a <b>square</b>: A = side² = ${sq(l)}.` : '',
        grid ? `Count the squares: ${nf(w)} rows of ${nf(l)} is ${nf(A)} squares. That is why area is length × width.` : '',
        'Area is how much flat space is inside (square units). Perimeter is the distance around the edge (plain units).'],
      hook: { area: A, perimeter: P },
    };
  }
  function tri([b, h, p], u) {
    const ax = b * p / 100, pts = [[0, 0], [b, 0], [ax, h]], foot = [ax, 0];
    const fr = frame(pts.concat([foot])), S = pts.map(fr.P), F = fr.P(foot), c = centre(S);
    const s1 = Math.hypot(ax, h), s2 = Math.hypot(b - ax, h), A = b * h / 2, Pm = b + s1 + s2;
    const out = ax < 0 || ax > b, rightAt = same(ax, 0) || same(ax, b);
    const ext = ax < 0 ? seg(F, S[0], 'sh-hid') : ax > b ? seg(S[1], F, 'sh-hid') : '';
    const hl = rightAt ? '' : seg(S[2], F, 'sh-dash') + corner(F, S[2], ax < b / 2 ? S[1] : S[0], 8);
    return {
      fig: svg(pg(S, 'sh-face') + ext + hl + pg(S, 'sh-edge') + (rightAt ? corner(same(ax, 0) ? S[0] : S[1], S[2], same(ax, 0) ? S[1] : S[0]) : '') + side(S[0], S[1], L(b, u), c) + txt([(S[2][0] + F[0]) / 2 + (out ? 0 : 6) + 22, (S[2][1] + F[1]) / 2 + 4], 'h = ' + L(h, u)), `A triangle with base ${nf(b)} and height ${nf(h)}`),
      res: [['Area', num(A) + U.area(u)], ['Perimeter', num(Pm) + U.len(u)]],
      work: [['Area', [`A = ${HALF} × base × height`, `= ${HALF} × ${nf(b)} × ${nf(h)}`, done(A, U.area(u))]],
        ['Perimeter', ['P = base + left side + right side', `The slanted sides come from the Pythagorean theorem: √(${sq(Math.abs(ax))} + ${sq(h)}) ${is(s1)} and √(${sq(Math.abs(b - ax))} + ${sq(h)}) ${is(s2)}`, `P ${is(b + s1 + s2).slice(0, 1)} ${nf(b)} + ${num(s1).replace('≈ ', '')} + ${num(s2).replace('≈ ', '')}`, done(Pm, U.len(u))]]],
      notes: ['Slide the top corner: the base and the height stay the same, so the <b>area stays the same</b>. The perimeter changes.',
        `A triangle is half of a parallelogram with the same base and height: ${nf(b)} × ${nf(h)} = ${nf(b * h)}, and half of that is ${nf(A)}.`,
        out ? 'When the top corner is past the end of the base, the height falls outside the triangle. Measure it to the base line, made longer (dashed).' : '',
        rightAt ? 'This is a <b>right triangle</b>: one side is the height.' : ''],
      hook: { area: A, perimeter: Pm },
    };
  }
  function para([b, h, p], u) {
    const o = b * p / 100, pts = [[0, 0], [b, 0], [b + o, h], [o, h]], fr = frame(pts), S = pts.map(fr.P), F = fr.P([o, 0]), c = centre(S);
    const sl = Math.hypot(o, h), A = b * h, Pm = 2 * b + 2 * sl, cut = o > 0;
    return {
      fig: svg(pg(S, 'sh-face') + (cut ? pg([S[0], F, S[3]], 'sh-cut') + seg(S[3], F, 'sh-dash') + corner(F, S[3], S[1], 8) : '') + pg(S, 'sh-edge') + side(S[0], S[1], L(b, u), c) + txt([(S[3][0] + F[0]) / 2 + 26, (S[3][1] + F[1]) / 2 + 4], 'h = ' + L(h, u)) + (cut ? side(S[3], S[0], (exact(sl) ? '' : '≈ ') + L(sl, u), c) : ''), `A parallelogram with base ${nf(b)} and height ${nf(h)}`),
      res: [['Area', num(A) + U.area(u)], ['Perimeter', num(Pm) + U.len(u)]],
      work: [['Area', ['A = base × height', `= ${nf(b)} × ${nf(h)}`, done(A, U.area(u))]],
        ['Perimeter', ['P = 2 × base + 2 × slanted side', cut ? `The slanted side: √(${sq(o)} + ${sq(h)}) ${is(sl)}` : 'With no lean, the slanted side is just the height.', `P ${is(Pm).slice(0, 1)} 2 × ${nf(b)} + 2 × ${num(sl).replace('≈ ', '')}`, done(Pm, U.len(u))]]],
      notes: [cut ? 'Cut off the shaded triangle and slide it to the other end: the parallelogram becomes a rectangle, base by height. That is why the area is base × height, not base × slanted side.' : 'With no lean, a parallelogram is a rectangle.',
        'Lean it more: the area stays the same, because the base and height do.'],
      hook: { area: A, perimeter: Pm },
    };
  }
  function trap([a, b, h], u) {
    const d = (b - a) / 2, pts = [[0, 0], [b, 0], [d + a, h], [d, h]], fr = frame(pts), S = pts.map(fr.P), c = centre(S);
    const F = fr.P([Math.max(d, 0), 0]), T = fr.P([Math.max(d, 0), h]), leg = Math.hypot(d, h), A = (a + b) / 2 * h, Pm = a + b + 2 * leg;
    return {
      fig: svg(pg(S, 'sh-face') + seg(T, F, 'sh-dash') + corner(F, T, S[1], 8) + pg(S, 'sh-edge') + side(S[0], S[1], L(b, u), c) + side(S[2], S[3], L(a, u), c) + txt([(T[0] + F[0]) / 2 + 26, (T[1] + F[1]) / 2 + 4], 'h = ' + L(h, u)), `A trapezoid with bases ${nf(a)} and ${nf(b)} and height ${nf(h)}`),
      res: [['Area', num(A) + U.area(u)], ['Perimeter', num(Pm) + U.len(u), 'if the two slanted sides are equal']],
      work: [['Area', [`A = ${HALF} × (top + bottom) × height`, `= ${HALF} × (${nf(a)} + ${nf(b)}) × ${nf(h)}`, `= ${HALF} × ${nf(a + b)} × ${nf(h)}`, done(A, U.area(u))]],
        ['Perimeter', ['P = top + bottom + 2 × slanted side', `The slanted side: √(${sq(Math.abs(d))} + ${sq(h)}) ${is(leg)}`, `P ${is(Pm).slice(0, 1)} ${nf(a)} + ${nf(b)} + 2 × ${num(leg).replace('≈ ', '')}`, done(Pm, U.len(u))]]],
      notes: [`Two copies of this trapezoid, one turned upside down, fit together into a parallelogram with base ${nf(a)} + ${nf(b)} = ${nf(a + b)} and height ${nf(h)}. The trapezoid is half of it.`,
        same(a, b) ? 'The two bases are equal, so this is really a rectangle.' : ''],
      hook: { area: A, perimeter: Pm },
    };
  }
  function circle([r], u) {
    const fr = frame([[-r, -r], [r, r]]), C = fr.P([0, 0]), R = r * fr.s, E = fr.P([r, 0]), Wd = fr.P([-r, 0]);
    return {
      fig: svg(`<circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="${r1(R)}" class="sh-face"/><circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="${r1(R)}" class="sh-edge"/>` + seg(Wd, C, 'sh-dash') + seg(C, E, 'sh-edge r') + `<circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="3" class="sh-dot"/>` + txt([(C[0] + E[0]) / 2, C[1] - 8], 'r = ' + L(r, u)) + txt([(C[0] + E[0]) / 2 - R / 2, C[1] + 18], 'd = ' + L(2 * r, u), 'sh-lab s'), `A circle with radius ${nf(r)}`),
      res: [['Area', piK(r * r) + U.area(u), piNote(r * r, U.area(u))], ['Circumference', piK(2 * r) + U.len(u), piNote(2 * r, U.len(u))]],
      work: [['Area', ['A = π × radius²', `= π × ${sq(r)}`, `= π × ${nf(r * r)}`, `= ${piK(r * r)}${U.area(u)}`, piNote(r * r, U.area(u))]],
        ['Circumference', ['C = π × diameter', `= π × ${nf(2 * r)}`, `= ${piK(2 * r)}${U.len(u)}`, piNote(2 * r, U.len(u))]]],
      notes: ['For every circle, circumference ÷ diameter is the same number, <b>π ≈ 3.14159…</b>. That is what π means.',
        `The diameter goes all the way across, so it is twice the radius: ${nf(2 * r)} = 2 × ${nf(r)}.`,
        'Area uses the radius <i>squared</i>: double the radius and the area becomes 4 times as big.'],
      hook: { area: r * r * PI, circumference: 2 * PI * r },
    };
  }
  function arch([l, w], u) {
    const r = w / 2, pts = [[0, 0], [l, 0]].concat(arcPts(l, r, r, -PI / 2, PI / 2, 40)).concat([[l, w], [0, w]]);
    const fr = frame(pts), S = pts.map(fr.P), c = fr.P([l / 2, r]), A = l * w, k = r * r / 2, Pp = 2 * l + w, pk = r;
    return {
      fig: svg(pg(S, 'sh-face') + seg(fr.P([l, 0]), fr.P([l, w]), 'sh-dash') + pg(S, 'sh-edge') + side(fr.P([0, 0]), fr.P([l, 0]), L(l, u), c) + side(fr.P([0, w]), fr.P([0, 0]), L(w, u), c) + seg(fr.P([l, r]), fr.P([l + r, r]), 'sh-edge r') + txt([fr.P([l + r / 2, r])[0], fr.P([l, r])[1] - 8], 'r = ' + L(r, u), 'sh-lab s'), `A rectangle ${nf(l)} by ${nf(w)} with a half circle on the end`),
      res: [['Area', `${nf(A)} + ${piK(k)}${U.area(u)}`, `≈ ${nf2(A + k * PI)}${U.area(u)} · with 3.14: ${nf2(A + k * 3.14)}`], ['Perimeter', `${nf(Pp)} + ${piK(pk)}${U.len(u)}`, `≈ ${nf2(Pp + pk * PI)}${U.len(u)}`]],
      work: [['Area', ['A = rectangle + half circle', `= ${nf(l)} × ${nf(w)} + ${HALF} × π × ${sq(r)}`, `= ${nf(A)} + ${piK(k)}`, `≈ ${nf2(A + k * PI)}${U.area(u)}`]],
        ['Perimeter', ['P = three sides of the rectangle + half the circle’s circumference', `= ${nf(l)} + ${nf(w)} + ${nf(l)} + ${HALF} × π × ${nf(w)}`, `= ${nf(Pp)} + ${piK(pk)}`, `≈ ${nf2(Pp + pk * PI)}${U.len(u)}`]]],
      notes: ['Split a composite shape into shapes you know, find each area, and add them. Subtract any part that is cut out (try <b>Frame</b>).',
        `The half circle’s diameter is the rectangle’s width, ${nf(w)}, so its radius is ${nf(r)}.`,
        'The dashed line is inside the shape, so it is not part of the perimeter.'],
      hook: { area: A + k * PI, perimeter: Pp + pk * PI },
    };
  }
  function frameShape([Lo, Wo, li, wi], u) {
    const x = (Lo - li) / 2, y = (Wo - wi) / 2, out = box(0, 0, Lo, Wo), inn = box(x, y, li, wi);
    const fr = frame(out), S = out.map(fr.P), I = inn.map(fr.P), c = fr.P([Lo / 2, Wo / 2]), A = Lo * Wo - li * wi;
    const even = same(x, y);
    return {
      fig: svg(pg(S, 'sh-face') + pg(I, 'sh-hole') + pg(S, 'sh-edge') + pg(I, 'sh-edge') + side(S[0], S[1], L(Lo, u), c) + side(S[3], S[0], L(Wo, u), c) + side(I[2], I[3], L(li, u), [c[0], c[1] - 999], 12) + side(I[1], I[2], L(wi, u), [c[0] + 999, c[1]], 12), `A ${nf(Lo)} by ${nf(Wo)} rectangle with a ${nf(li)} by ${nf(wi)} rectangle cut out`),
      res: [['Area', num(A) + U.area(u)], ['Border width', even ? num(x) + U.len(u) : `${num(x)} and ${num(y)}${U.len(u)}`, even ? 'all the way round' : 'sides and ends']],
      work: [['Area', ['A = outer rectangle − inner rectangle', `= ${nf(Lo)} × ${nf(Wo)} − ${nf(li)} × ${nf(wi)}`, `= ${nf(Lo * Wo)} − ${nf(li * wi)}`, done(A, U.area(u))]],
        ['Border width', ['Each side gets half of the difference:', `(${nf(Lo)} − ${nf(li)}) ÷ 2 ${is(x)}`, `(${nf(Wo)} − ${nf(wi)}) ÷ 2 ${is(y)}`]]],
      notes: ['This is how to find the area of a path around a garden or the mat around a picture: the whole thing, minus the part cut out.'],
      hook: { area: A },
    };
  }

  function prismBox([l, w, h], u) {
    const pr = prism(box(0, 0, l, h), w), P = pr.P, D = pr.D, V0 = l * w * h, B = l * w, SA = 2 * (l * w + l * h + w * h);
    let grid = '';
    if ([l, w, h].every(x => whole(x) && x <= 12)) {
      const at = (x, y, z) => P([x + z / w * D[0], y + z / w * D[1]]);
      for (let i = 1; i < l; i++) grid += seg(at(i, 0, 0), at(i, h, 0), 'sh-grid') + seg(at(i, h, 0), at(i, h, w), 'sh-grid');
      for (let j = 1; j < h; j++) grid += seg(at(0, j, 0), at(l, j, 0), 'sh-grid') + seg(at(l, j, 0), at(l, j, w), 'sh-grid');
      for (let k = 1; k < w; k++) grid += seg(at(0, h, k), at(l, h, k), 'sh-grid') + seg(at(l, 0, k), at(l, h, k), 'sh-grid');
    }
    const cube = same(l, w) && same(w, h);
    const net = [
      { pts: box(0, w, w, h), cls: 'c', t: `${nf(w)} × ${nf(h)}`, a: nf(w * h) }, { pts: box(w, w, l, h), cls: 'b', t: `${nf(l)} × ${nf(h)}`, a: nf(l * h) },
      { pts: box(w + l, w, w, h), cls: 'c', t: `${nf(w)} × ${nf(h)}`, a: nf(w * h) }, { pts: box(2 * w + l, w, l, h), cls: 'b', t: `${nf(l)} × ${nf(h)}`, a: nf(l * h) },
      { pts: box(w, w + h, l, w), cls: 'a', t: `${nf(l)} × ${nf(w)}`, a: nf(l * w) }, { pts: box(w, 0, l, w), cls: 'a', t: `${nf(l)} × ${nf(w)}`, a: nf(l * w) }];
    return {
      fig: svg(pr.body + grid + side(P([0, 0]), P([l, 0]), L(l, u), pr.c) + side(P([0, h]), P([0, 0]), L(h, u), pr.c) + side(P([l, 0]), P([l + D[0], D[1]]), L(w, u), pr.c), `A rectangular prism ${nf(l)} by ${nf(w)} by ${nf(h)}`),
      res: [['Volume', num(V0) + U.vol(u)], ['Surface area', num(SA) + U.area(u)]],
      work: [['Volume', ['V = area of the base × height', `The base is ${nf(l)} × ${nf(w)} = ${nf(B)}`, `V = ${nf(B)} × ${nf(h)}`, done(V0, U.vol(u))]],
        ['Surface area', ['SA = 2 × top + 2 × front + 2 × end', `= 2(${nf(l)} × ${nf(w)}) + 2(${nf(l)} × ${nf(h)}) + 2(${nf(w)} × ${nf(h)})`, `= 2(${nf(l * w)}) + 2(${nf(l * h)}) + 2(${nf(w * h)})`, `= ${nf(2 * l * w)} + ${nf(2 * l * h)} + ${nf(2 * w * h)}`, done(SA, U.area(u))]]],
      net: netSvg(net, 'The net of the prism: six rectangles'),
      faces: [['Top and bottom', 2, `${nf(l)} × ${nf(w)}`, l * w], ['Front and back', 2, `${nf(l)} × ${nf(h)}`, l * h], ['The two ends', 2, `${nf(w)} × ${nf(h)}`, w * h]],
      notes: [grid ? `Volume counts the cubes that fill it: each layer has ${nf(l)} × ${nf(w)} = ${nf(B)} cubes, and there are ${nf(h)} layers, so ${nf(V0)} cubes.` : 'Volume is how many unit cubes would fill it. Surface area is how much wrapping paper covers it: the area of its net.',
        cube ? `All the edges are equal, so it is a <b>cube</b>: V = side³ = ${nf(l)}³ and SA = 6 × side² = 6 × ${sq(l)}.` : '',
        'Faces come in matching pairs, so the net has three colours.'],
      hook: { volume: V0, surface: SA },
    };
  }
  function triPrism([b, h, l, t], u) {
    const ax = t ? 0 : b / 2, front = [[0, 0], [b, 0], [ax, h]];
    const pr = prism(front, l), P = pr.P, D = pr.D, s1 = Math.hypot(ax, h), s2 = Math.hypot(b - ax, h), B = b * h / 2, V0 = B * l, SA = 2 * B + (b + s1 + s2) * l;
    const top = P([ax, h]), foot = P([ax, 0]);
    const nb = [
      { pts: box(0, h, s1, l), cls: 'b', t: `${num(s1)} × ${nf(l)}`, a: num(s1 * l) }, { pts: box(s1, h, b, l), cls: 'c', t: `${nf(b)} × ${nf(l)}`, a: nf(b * l) },
      { pts: box(s1 + b, h, s2, l), cls: 'b', t: `${num(s2)} × ${nf(l)}`, a: num(s2 * l) },
      { pts: [[s1, h + l], [s1 + b, h + l], [s1 + ax, 2 * h + l]], cls: 'a', t: '', a: nf(B), at: [s1 + (b + ax) / 3, h + l + h / 3] },
      { pts: [[s1, h], [s1 + ax, 0], [s1 + b, h]], cls: 'a', t: '', a: nf(B), at: [s1 + (b + ax) / 3, h - h / 3] }];
    return {
      fig: svg(pr.body + (t ? '' : seg(top, foot, 'sh-dash') + corner(foot, top, P([b, 0]), 8)) + (t ? corner(P([0, 0]), P([b, 0]), top) : '') + side(P([0, 0]), P([b, 0]), L(b, u), pr.c) + (t ? side(top, P([0, 0]), L(h, u), pr.c) : txt([(top[0] + foot[0]) / 2 + 22, (top[1] + foot[1]) / 2 + 4], 'h = ' + L(h, u), 'sh-lab s')) + side(P([b, 0]), P([b + D[0], D[1]]), L(l, u), pr.c), `A triangular prism: triangle base ${nf(b)}, height ${nf(h)}, length ${nf(l)}`),
      res: [['Volume', num(V0) + U.vol(u)], ['Surface area', num(SA) + U.area(u)]],
      work: [['Volume', ['V = area of the base × length', `The base is a triangle: ${HALF} × ${nf(b)} × ${nf(h)} = ${nf(B)}`, `V = ${nf(B)} × ${nf(l)}`, done(V0, U.vol(u))]],
        ['Surface area', ['SA = 2 triangles + 3 rectangles', `The slanted side${t ? '' : 's'}: ${t ? `√(${sq(b)} + ${sq(h)}) ${is(s2)}` : `√(${sq(b / 2)} + ${sq(h)}) ${is(s1)}`}`, `${exact(s1) && exact(s2) ? '=' : '≈'} 2 × ${nf(B)} + (${nf(b)} + ${num(s1).replace('≈ ', '')} + ${num(s2).replace('≈ ', '')}) × ${nf(l)}`, done(SA, U.area(u))]]],
      net: netSvg(nb, 'The net: two triangles and three rectangles'),
      faces: [['The two triangles', 2, `${HALF} × ${nf(b)} × ${nf(h)}`, B], ['Bottom', 1, `${nf(b)} × ${nf(l)}`, b * l], [t ? 'Upright side' : 'Slanted sides', t ? 1 : 2, `${num(s1)} × ${nf(l)}`, s1 * l], ...(t ? [['Slanted side', 1, `${num(s2)} × ${nf(l)}`, s2 * l]] : [])],
      notes: ['Every prism’s volume is the area of its base (the shape at the end) times its length. The base doesn’t have to be on the bottom.',
        'The three rectangles have the same length as the prism; their widths are the triangle’s three sides.'],
      hook: { volume: V0, surface: SA },
    };
  }
  function pyramid([s, h], u) {
    const p3 = (x, y, z) => [x + z * DEPTH[0], y + z * DEPTH[1]];
    const A0 = p3(0, 0, 0), A1 = p3(s, 0, 0), A2 = p3(s, 0, s), A3 = p3(0, 0, s), T = p3(s / 2, h, s / 2), Cn = p3(s / 2, 0, s / 2), M0 = p3(s / 2, 0, 0);
    const fr = frame([A0, A1, A2, A3, T]), P = fr.P, sl = Math.hypot(h, s / 2), V0 = s * s * h / 3, SA = s * s + 2 * s * sl, c = P(centre([A0, A1, A2, A3, T]));
    const body = pg([A0, A1, T].map(P), 'sh-face') + pg([A1, A2, T].map(P), 'sh-face side') + seg(P(A3), P(A0), 'sh-hid') + seg(P(A3), P(A2), 'sh-hid') + seg(P(A3), P(T), 'sh-hid') +
      seg(P(T), P(Cn), 'sh-dash') + seg(P(T), P(M0), 'sh-dash') + [[A0, A1], [A1, A2], [A0, T], [A1, T], [A2, T]].map(([a, b]) => seg(P(a), P(b), 'sh-edge')).join('');
    const net = [{ pts: box(sl, sl, s, s), cls: 'a', t: `${nf(s)} × ${nf(s)}`, a: nf(s * s) },
      { pts: [[sl, sl], [sl + s / 2, 0], [sl + s, sl]], cls: 'b', t: '', a: num(s * sl / 2), at: [sl + s / 2, sl * 0.4] }, { pts: [[sl, sl + s], [sl + s, sl + s], [sl + s / 2, 2 * sl + s]], cls: 'b', t: '', a: num(s * sl / 2), at: [sl + s / 2, sl + s + sl * 0.4] },
      { pts: [[sl, sl], [sl, sl + s], [0, sl + s / 2]], cls: 'b', t: '', a: num(s * sl / 2), at: [sl * 0.6, sl + s / 2] }, { pts: [[sl + s, sl], [2 * sl + s, sl + s / 2], [sl + s, sl + s]], cls: 'b', t: '', a: num(s * sl / 2), at: [sl + s + sl * 0.4, sl + s / 2] }];
    return {
      fig: svg(body + side(P(A0), P(A1), L(s, u), c) + txt([P(Cn)[0] + (P(T)[0] - P(Cn)[0]) * 0.3 + 9, P(Cn)[1] + (P(T)[1] - P(Cn)[1]) * 0.3], 'h', 'sh-lab s') + txt([(P(T)[0] + P(M0)[0]) / 2 - 11, (P(T)[1] + P(M0)[1]) / 2 + 6], 'ℓ', 'sh-lab s'), `A square pyramid: base ${nf(s)} by ${nf(s)}, height ${nf(h)}`),
      res: [['Volume', num(V0) + U.vol(u)], ['Surface area', num(SA) + U.area(u)], ['Slant height ℓ', num(sl) + U.len(u), 'up the middle of a face']],
      work: [['Volume', [`V = ${THIRD} × area of the base × height`, `= ${THIRD} × ${sq(s)} × ${nf(h)}`, `= ${THIRD} × ${nf(s * s)} × ${nf(h)}`, done(V0, U.vol(u))]],
        ['Slant height', ['ℓ = √(height² + (half the side)²)', `= √(${sq(h)} + ${sq(s / 2)})`, `= √${nf(h * h + s * s / 4)}`, done(sl, U.len(u))]],
        ['Surface area', ['SA = the square base + 4 triangles', `= ${sq(s)} + 4 × ${HALF} × ${nf(s)} × ${num(sl).replace('≈ ', '')}`, `${is(s * s).slice(0, 1)} ${nf(s * s)} + ${num(2 * s * sl).replace('≈ ', '')}`, done(SA, U.area(u))]]],
      net: netSvg(net, 'The net: a square and four triangles'),
      faces: [['The square base', 1, `${nf(s)} × ${nf(s)}`, s * s], ['Triangles', 4, `${HALF} × ${nf(s)} × ${num(sl)}`, s * sl / 2]],
      notes: [`A pyramid holds exactly ${THIRD} as much as a box with the same base and height: ${nf(s * s * h)} ÷ 3 ${is(V0)}.`,
        'The height (h) goes straight down the middle; the slant height (ℓ) runs down a face. Use h for volume and ℓ for the triangles.'],
      hook: { volume: V0, surface: SA },
    };
  }
  /** the ellipse of a circular end: front half solid, back half dashed */
  function rim(P, cx, cy, r, s, back) {
    const C = P([cx, cy]), rx = r * s, ry = r * s * 0.32;
    return `<path d="M${pt([C[0] - rx, C[1]])} A${r1(rx)} ${r1(ry)} 0 0 1 ${pt([C[0] + rx, C[1]])}" class="${back ? 'sh-hid' : 'sh-edge'}"/><path d="M${pt([C[0] - rx, C[1]])} A${r1(rx)} ${r1(ry)} 0 0 0 ${pt([C[0] + rx, C[1]])}" class="sh-edge"/>`;
  }
  function cyl([r, h], u) {
    const fr = frame([[-r, -r * 0.32], [r, h + r * 0.32]]), P = fr.P, s = fr.s, rx = r * s, ry = r * s * 0.32, B = P([0, 0]), T = P([0, h]);
    const k = r * r * h, sa = 2 * r * r + 2 * r * h, C2 = 2 * PI * r;
    const body = `<path d="M${pt([T[0] - rx, T[1]])} L${pt([B[0] - rx, B[1]])} A${r1(rx)} ${r1(ry)} 0 0 0 ${pt([B[0] + rx, B[1]])} L${pt([T[0] + rx, T[1]])} Z" class="sh-face side"/><ellipse cx="${r1(T[0])}" cy="${r1(T[1])}" rx="${r1(rx)}" ry="${r1(ry)}" class="sh-face"/>` +
      rim(P, 0, 0, r, s, true) + `<ellipse cx="${r1(T[0])}" cy="${r1(T[1])}" rx="${r1(rx)}" ry="${r1(ry)}" class="sh-edge"/>` + seg([T[0] - rx, T[1]], [B[0] - rx, B[1]], 'sh-edge') + seg([T[0] + rx, T[1]], [B[0] + rx, B[1]], 'sh-edge') + seg(T, [T[0] + rx, T[1]], 'sh-edge r');
    const net = [{ pts: box(0, 2 * r, C2, h), cls: 'b', t: `${nf2(C2)} × ${nf(h)}`, a: piK(2 * r * h, true) }];
    const circ = (P2, s2) => [[C2 / 2, 2 * r + h + r], [C2 / 2, r]].map(c => { const q = P2(c); return `<circle cx="${r1(q[0])}" cy="${r1(q[1])}" r="${r1(r * s2)}" class="sh-net a"/>${r * s2 > 22 ? txt([q[0], q[1] + 4], piK(r * r, true), 'sh-lab b') : ''}`; }).join('');
    return {
      fig: svg(body + txt([T[0] + rx / 2, T[1] - 7], 'r = ' + L(r, u), 'sh-lab s') + side([B[0] + rx, B[1]], [T[0] + rx, T[1]], L(h, u), B), `A cylinder with radius ${nf(r)} and height ${nf(h)}`),
      res: [['Volume', piK(k) + U.vol(u), piNote(k, U.vol(u))], ['Surface area', piK(sa) + U.area(u), piNote(sa, U.area(u))]],
      work: [['Volume', ['V = area of the base × height = πr² × h', `= π × ${sq(r)} × ${nf(h)}`, `= ${piK(k)}${U.vol(u)}`, piNote(k, U.vol(u))]],
        ['Surface area', ['SA = 2 circles + the curved side = 2πr² + 2πr × h', `= 2 × π × ${sq(r)} + 2 × π × ${nf(r)} × ${nf(h)}`, `= ${piK(2 * r * r)} + ${piK(2 * r * h)}`, `= ${piK(sa)}${U.area(u)}`, piNote(sa, U.area(u))]]],
      net: netSvg(net, 'The net: a rectangle and two circles', (P2, s2) => circ(P2, s2)),
      faces: [['The two circles', 2, `π × ${sq(r)}`, r * r * PI, piK(r * r)], ['The curved side (a rectangle)', 1, `2π × ${nf(r)} by ${nf(h)}`, 2 * PI * r * h, piK(2 * r * h)]],
      notes: ['A cylinder is like a prism with a circle for its base: volume = area of the base × height.',
        `Unroll the curved side and it is a rectangle. Its width is the circle’s circumference, 2π × ${nf(r)} ≈ ${nf2(C2)}.`],
      hook: { volume: k * PI, surface: sa * PI },
    };
  }
  function cone([r, h], u) {
    const fr = frame([[-r, -r * 0.32], [r, h]]), P = fr.P, s = fr.s, rx = r * s, ry = r * s * 0.32, B = P([0, 0]), T = P([0, h]);
    const sl = Math.hypot(r, h), k = r * r * h / 3, sa = r * r + r * sl;
    const body = `<path d="M${pt(T)} L${pt([B[0] - rx, B[1]])} A${r1(rx)} ${r1(ry)} 0 0 0 ${pt([B[0] + rx, B[1]])} Z" class="sh-face side"/>` + rim(P, 0, 0, r, s, true) + seg(T, [B[0] - rx, B[1]], 'sh-edge') + seg(T, [B[0] + rx, B[1]], 'sh-edge') + seg(T, B, 'sh-dash') + seg(B, [B[0] + rx, B[1]], 'sh-dash');
    const th = 2 * PI * r / sl, a0 = -PI / 2 - th / 2;
    const sector = [[0, 0]].concat(arcPts(0, 0, sl, a0, a0 + th, 48));
    const net = [{ pts: sector, cls: 'b', t: 'curved side', a: piK(r * sl, true), at: [0, -sl * 0.6] }, { pts: arcPts(0, -sl - r, r, 0, 2 * PI, 48), cls: 'a', t: '', a: piK(r * r, true) }];
    return {
      fig: svg(body + txt([B[0] + rx / 2, B[1] + 16], 'r = ' + L(r, u), 'sh-lab s') + txt([B[0] - 12, (T[1] + B[1]) / 2 + 4], 'h', 'sh-lab s') + side(T, [B[0] + rx, B[1]], 'ℓ', B), `A cone with radius ${nf(r)} and height ${nf(h)}`),
      res: [['Volume', piK(k) + U.vol(u), piNote(k, U.vol(u))], ['Surface area', piK(sa) + U.area(u), piNote(sa, U.area(u))], ['Slant height ℓ', num(sl) + U.len(u)]],
      work: [['Volume', [`V = ${THIRD} × πr² × h`, `= ${THIRD} × π × ${sq(r)} × ${nf(h)}`, `= ${piK(k)}${U.vol(u)}`, piNote(k, U.vol(u))]],
        ['Slant height', ['ℓ = √(r² + h²)', `= √(${sq(r)} + ${sq(h)})`, done(sl, U.len(u))]],
        ['Surface area', ['SA = the base + the curved side = πr² + πrℓ', `= π × ${sq(r)} + π × ${nf(r)} × ${num(sl).replace('≈ ', '')}`, `${exact(r * sl) ? '=' : '≈'} ${piK(r * r)} + ${piK(r * sl)}`, `${exact(sa) ? '=' : '≈'} ${piK(sa)}${U.area(u)}`, piNote(sa, U.area(u))]]],
      net: netSvg(net, 'The net: a circle and a sector of a bigger circle'),
      faces: [['The circle base', 1, `π × ${sq(r)}`, r * r * PI, piK(r * r)], ['The curved side', 1, `π × ${nf(r)} × ${num(sl)}`, r * sl * PI, piK(r * sl)]],
      notes: [`A cone holds exactly ${THIRD} as much as a cylinder with the same base and height.`,
        'Unrolled, the curved side is a slice of a circle whose radius is the slant height.'],
      hook: { volume: k * PI, surface: sa * PI },
    };
  }
  function sphere([r], u) {
    const fr = frame([[-r, -r], [r, r]]), P = fr.P, s = fr.s, C = P([0, 0]), R = r * s;
    const k = 4 * r * r * r / 3, sa = 4 * r * r;
    const body = `<circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="${r1(R)}" class="sh-face side"/>` + rim(P, 0, 0, r, s, true) + `<circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="${r1(R)}" class="sh-edge"/>` + seg(C, [C[0] + R, C[1]], 'sh-edge r') + `<circle cx="${r1(C[0])}" cy="${r1(C[1])}" r="3" class="sh-dot"/>`;
    return {
      fig: svg(body + txt([C[0] + R / 2, C[1] - 8], 'r = ' + L(r, u), 'sh-lab s'), `A sphere with radius ${nf(r)}`),
      res: [['Volume', piK(k) + U.vol(u), piNote(k, U.vol(u))], ['Surface area', piK(sa) + U.area(u), piNote(sa, U.area(u))]],
      work: [['Volume', [`V = ${frac(4, 3)} × π × r³`, `= ${frac(4, 3)} × π × ${nf(r)}³`, `= ${frac(4, 3)} × π × ${nf(r * r * r)}`, `= ${piK(k)}${U.vol(u)}`, piNote(k, U.vol(u))]],
        ['Surface area', ['SA = 4 × π × r²', `= 4 × π × ${sq(r)}`, `= ${piK(sa)}${U.area(u)}`, piNote(sa, U.area(u))]]],
      notes: ['A sphere’s surface is exactly 4 of its biggest circles (πr² each).',
        `A sphere holds ${frac(2, 3)} as much as the cylinder that just fits around it.`,
        'A sphere has no flat net: it can’t be flattened without stretching. That is why every flat map of the Earth is a little wrong somewhere.'],
      hook: { volume: k * PI, surface: sa * PI },
    };
  }

  function angle([a]) {
    const type = a < 90 ? 'acute' : same(a, 90) ? 'right' : a < 180 ? 'obtuse' : same(a, 180) ? 'straight' : 'reflex';
    const why = { acute: 'less than 90°', right: 'exactly 90°, a square corner', obtuse: 'between 90° and 180°', straight: 'exactly 180°, a straight line', reflex: 'more than 180°' }[type];
    const rad = a * PI / 180, cx = a <= 90 ? 120 : 180, cy = a > 180 ? 120 : 160, R = 120;
    const ray2 = [cx + R * Math.cos(rad), cy - R * Math.sin(rad)];
    const mid = rad / 2, lab = [cx + 62 * Math.cos(mid), cy - 62 * Math.sin(mid) + 5];
    const arc = type === 'right' ? corner([cx, cy], [cx + 1, cy], [cx, cy - 1], 16) : `<polyline points="${arcPts(cx, cy, 34, 0, -rad, 60).map(pt).join(' ')}" class="sh-arc"/>`;
    const fig1 = svg(arc + seg([cx, cy], [cx + R, cy], 'sh-edge') + seg([cx, cy], ray2, 'sh-edge') + `<circle cx="${cx}" cy="${cy}" r="3.5" class="sh-dot"/>` + txt(lab, nf1(a) + '°', 'sh-lab b'), `An angle of ${nf1(a)} degrees`, 360, a > 180 ? 250 : 190);
    let fig2 = '';
    if (a < 180) {
      const c2 = [180, 110], Rl = 140, d = [Math.cos(rad), -Math.sin(rad)], b = 180 - a;
      const lb = (t, deg) => { const m = deg * PI / 180; return txt([c2[0] + 50 * Math.cos(m), c2[1] - 50 * Math.sin(m) + 5], t, 'sh-lab s'); };
      const ar = (from, to, cls) => `<polyline points="${arcPts(c2[0], c2[1], 26, -from * PI / 180, -to * PI / 180, 30).map(pt).join(' ')}" class="sh-arc ${cls}"/>`;
      fig2 = svg(ar(0, a, 'a') + ar(180, 180 + a, 'a') + ar(a, 180, 'b') + ar(180 + a, 360, 'b') + seg([c2[0] - Rl, c2[1]], [c2[0] + Rl, c2[1]], 'sh-edge') + seg([c2[0] - Rl * d[0], c2[1] - Rl * d[1]], [c2[0] + Rl * d[0], c2[1] + Rl * d[1]], 'sh-edge') +
        lb(nf1(a) + '°', a / 2) + lb(nf1(a) + '°', 180 + a / 2) + lb(nf1(b) + '°', a + b / 2) + lb(nf1(b) + '°', 180 + a + b / 2), `Two crossing lines make angles of ${nf1(a)} and ${nf1(b)} degrees`, 360, 220);
    }
    const res = [['Kind of angle', type[0].toUpperCase() + type.slice(1), why]];
    if (a < 90) res.push(['Its complement', nf1(90 - a) + '°', 'together they make 90°']);
    if (a < 180) res.push(['Its supplement', nf1(180 - a) + '°', 'together they make 180°']);
    res.push(['The rest of a full turn', nf1(360 - a) + '°', 'together they make 360°']);
    const work = [];
    if (a < 90) work.push(['Complement', ['Complementary angles add to 90°.', `90° − ${nf1(a)}° = ${nf1(90 - a)}°`]]);
    if (a < 180) work.push(['Supplement', ['Supplementary angles add to 180°: two angles that make a straight line.', `180° − ${nf1(a)}° = ${nf1(180 - a)}°`]]);
    work.push(['Around a point', ['All the angles around a point add to 360°.', `360° − ${nf1(a)}° = ${nf1(360 - a)}°`]]);
    return {
      fig: fig1, fig2,
      fig2Title: 'Two lines crossing at this angle',
      res, work,
      notes: [a < 180 ? `Where two lines cross, <b>vertical angles</b> (straight across from each other) are equal: both ${nf1(a)}°. Angles next to each other on a line are a <b>linear pair</b> and add to 180°.` : '',
        a < 180 ? `In a triangle the three angles add to 180°. If one angle is ${nf1(a)}°, the other two add to ${nf1(180 - a)}°.` : 'A triangle can’t have an angle this big: its three angles add to only 180°.'],
      hook: { type, complement: a < 90 ? 90 - a : null, supplement: a < 180 ? 180 - a : null },
    };
  }

  function sides([a, b, c], u) {
    const s = [a, b, c].slice().sort((x, y) => x - y), sum = s[0] + s[1];
    if (!(sum > s[2] && !same(sum, s[2]))) {
      const fr = frame([[0, 0], [s[2], 0], [0, s[2] * 0.25]], 360, 160), P = fr.P, gap = s[2] - sum, y = s[2] * 0.12;
      const body = seg(P([0, 0]), P([s[2], 0]), 'sh-edge') + seg(P([0, y]), P([s[0], y]), 'sh-edge b') + seg(P([s[2], y]), P([s[2] - s[1], y]), 'sh-edge c') +
        txt(P([s[2] / 2, -s[2] * 0.06]), L(s[2], u)) + txt(P([s[0] / 2, y + s[2] * 0.05]), L(s[0], u), 'sh-lab s') + txt(P([s[2] - s[1] / 2, y + s[2] * 0.05]), L(s[1], u), 'sh-lab s') + (gap > 1e-9 ? txt(P([s[0] + gap / 2, y - s[2] * 0.06]), 'gap', 'sh-lab bad') : '');
      return {
        fig: svg(body, `Sides ${nf(s[0])} and ${nf(s[1])} laid along a side of ${nf(s[2])}: they can’t meet`, 360, 160),
        res: [['A triangle?', 'No', same(sum, s[2]) ? 'the sides only meet lying flat' : 'the two short sides can’t reach']],
        work: [['The triangle inequality', ['Any two sides of a triangle must add to <b>more</b> than the third side.', `The two shorter sides: ${nf(s[0])} + ${nf(s[1])} = ${nf(sum)}`, `The longest side: ${nf(s[2])}`, same(sum, s[2]) ? `${nf(sum)} = ${nf(s[2])}: not more, so the sides lie flat in a straight line.` : `${nf(sum)} < ${nf(s[2])}: even laid flat they leave a gap of ${nf(gap)}.`]]],
        notes: [`Make the longest side shorter than ${nf(sum)}, or a short side longer than ${nf(s[2] - s[0])}, and it works.`],
        hook: { triangle: false },
      };
    }
    const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
    const pts = [[0, 0], [c, 0], [x, y]], fr = frame(pts), S = pts.map(fr.P), cc = centre(S);
    const deg = v => Math.acos(Math.max(-1, Math.min(1, v))) * 180 / PI;
    const angP = deg((b * b + c * c - a * a) / (2 * b * c)), angQ = deg((a * a + c * c - b * b) / (2 * a * c)), angR = 180 - angP - angQ;
    const angs = [angP, angQ, angR];
    const by = same(a, b) && same(b, c) ? 'equilateral' : same(a, b) || same(b, c) || same(a, c) ? 'isosceles' : 'scalene';
    const d = s[0] * s[0] + s[1] * s[1] - s[2] * s[2], kind = Math.abs(d) <= 1e-9 * s[2] * s[2] ? 'right' : d < 0 ? 'obtuse' : 'acute';
    const area = c * y / 2, per = a + b + c;
    const angLab = S.map((p, i) => { const q = [cc[0] - p[0], cc[1] - p[1]], l = Math.hypot(...q) || 1; return txt([p[0] + q[0] / l * 30, p[1] + q[1] / l * 30 + 4], nf1(angs[i]) + '°', 'sh-lab s'); }).join('');
    const ri = kind === 'right' ? angs.findIndex(t => Math.abs(t - 90) < 1e-6) : -1;
    return {
      fig: svg(pg(S, 'sh-face') + pg(S, 'sh-edge') + (ri >= 0 ? corner(S[ri], S[(ri + 1) % 3], S[(ri + 2) % 3]) : '') + side(S[0], S[1], 'c = ' + L(c, u), cc) + side(S[1], S[2], 'a = ' + L(a, u), cc) + side(S[2], S[0], 'b = ' + L(b, u), cc) + angLab, `A triangle with sides ${nf(a)}, ${nf(b)} and ${nf(c)}`),
      res: [['A triangle?', 'Yes', `${by}, ${kind}`], ['Perimeter', num(per) + U.len(u)], ['Area', num(area) + U.area(u)]],
      work: [['The triangle inequality', ['Any two sides must add to more than the third.', `${nf(s[0])} + ${nf(s[1])} = ${nf(sum)}, more than ${nf(s[2])} ✓`]],
        ['By its sides', [{ equilateral: 'All three sides are equal: <b>equilateral</b>.', isosceles: 'Two sides are equal: <b>isosceles</b>.', scalene: 'No two sides are equal: <b>scalene</b>.' }[by]]],
        ['By its angles', [`Compare the two shorter sides squared with the longest side squared: ${sq(s[0])} + ${sq(s[1])} = ${nf(s[0] * s[0] + s[1] * s[1])} and ${sq(s[2])} = ${nf(s[2] * s[2])}.`,
          { right: 'They are equal, so the Pythagorean theorem holds: a <b>right</b> triangle.', acute: 'The short sides win, so the biggest angle is less than 90°: an <b>acute</b> triangle.', obtuse: 'The long side wins, so the biggest angle is more than 90°: an <b>obtuse</b> triangle.' }[kind]]],
        ['The angles', [`${angs.map(t => nf1(t) + '°').join(' + ')} = 180°`, 'The biggest angle is always across from the longest side.']],
        ['Area', [`A = ${HALF} × base × height`, `The height to side c is ${num(y)} (straight up from the base to the top corner).`, `A ${is(area).slice(0, 1)} ${HALF} × ${nf(c)} × ${num(y).replace('≈ ', '')}`, done(area, U.area(u))]]],
      notes: ['Three side lengths make only one triangle shape. That is why builders use triangles to make things rigid.'],
      hook: { triangle: true, bySides: by, byAngles: kind, angles: angs, area, perimeter: per },
    };
  }

  const KINDS = {
    rect: { name: 'Rectangle', f: [['Length', 8], ['Width', 5]], calc: rect },
    tri: { name: 'Triangle', f: [['Base', 10], ['Height', 6], ['Slide the top corner', 50, { slider: [-50, 150, 1], only: true }]], calc: tri },
    para: { name: 'Parallelogram', f: [['Base', 10], ['Height', 5], ['Lean it', 40, { slider: [0, 100, 1], only: true }]], calc: para },
    trap: { name: 'Trapezoid', f: [['Top base', 6], ['Bottom base', 10], ['Height', 4]], calc: trap },
    circle: { name: 'Circle', f: [['Radius', 5]], calc: circle },
    arch: { name: 'Rectangle + half circle', f: [['Length', 10], ['Width', 6]], calc: arch },
    frame: { name: 'Frame', f: [['Outer length', 12], ['Outer width', 9], ['Inner length', 8], ['Inner width', 5]], calc: frameShape, check: v => (v[2] < v[0] && v[3] < v[1] ? '' : 'The inside rectangle has to be smaller than the outside one.') },
    box: { name: 'Rectangular prism', f: [['Length', 5], ['Width', 3], ['Height', 4]], calc: prismBox },
    triprism: { name: 'Triangular prism', f: [['Triangle base', 6], ['Triangle height', 4], ['Length', 10], ['Triangle', 1, { choice: [[1, 'Right triangle'], [0, 'Isosceles triangle']] }]], calc: triPrism },
    pyramid: { name: 'Square pyramid', f: [['Base side', 6], ['Height', 4]], calc: pyramid },
    cyl: { name: 'Cylinder', f: [['Radius', 3], ['Height', 8]], calc: cyl },
    cone: { name: 'Cone', f: [['Radius', 3], ['Height', 4]], calc: cone },
    sphere: { name: 'Sphere', f: [['Radius', 3]], calc: sphere },
    angle: { name: 'Angle pairs', f: [['Angle', 50, { slider: [1, 359, 1], deg: true }]], calc: angle, check: v => (v[0] > 0 && v[0] < 360 ? '' : 'Use an angle between 0° and 360°.') },
    sides: { name: 'Triangle builder', f: [['Side a', 5], ['Side b', 6], ['Side c', 7]], calc: sides },
  };
  const GROUPS = [['Flat shapes', ['rect', 'tri', 'para', 'trap', 'circle', 'arch', 'frame']], ['Solids', ['box', 'triprism', 'pyramid', 'cyl', 'cone', 'sphere']], ['Angles and triangles', ['angle', 'sides']]];

  /** work out a shape from its numbers (for the page and the tests): {error} or the shape's result */
  function solve(kind, vals, unit) {
    const K = KINDS[kind];
    if (!K) return { error: 'No such shape.' };
    for (let i = 0; i < K.f.length; i++) {
      const [label, , o] = K.f[i], v = vals[i];
      if (o && (o.choice || o.only)) continue;
      if (!Number.isFinite(v) || v <= 0) return { error: `Type a number bigger than 0 for ${label.toLowerCase()}.` };
      if (v > MAX) return { error: `Use numbers up to ${MAX.toLocaleString('en-US')}.` };
    }
    const bad = K.check && K.check(vals);
    if (bad) return { error: bad };
    return K.calc(vals, UNITS.includes(unit) ? unit : '');
  }

  function page(root, kind, code) {
    let k = KINDS[kind] ? kind : 'rect', unit = '';
    const defaults = key => KINDS[key].f.map(x => x[1]);
    let vals = defaults(k);
    if (code) {
      const parts = String(code).split('_');
      if (UNITS.includes(parts[parts.length - 1])) unit = parts.pop();
      parts.forEach((p, i) => { const v = Number(p); if (i < vals.length && p !== '' && Number.isFinite(v)) vals[i] = v; });
    }
    root.innerHTML = `<div class="sh-page">
      <div class="card">
        <h1>Shapes and space</h1>
        <p class="muted small" style="margin:4px 0 10px">Area, perimeter, volume, surface area and angles. Every shape is drawn to scale from your numbers, with each step shown.</p>
        <div class="sh-kinds">${GROUPS.map(([g, keys]) => `<div class="sh-group"><span class="tiny muted">${g}</span><div class="sh-chips">${keys.map(x => `<button type="button" class="chip-btn${x === k ? ' on' : ''}" data-kind="${x}" aria-pressed="${x === k}">${KINDS[x].name}</button>`).join('')}</div></div>`).join('')}</div>
      </div>
      <div class="card sh-main"><div id="sh-in"></div><div id="sh-fig" class="sh-fig"></div></div>
      <div id="sh-out" class="sh-out"></div>
    </div>`;
    const wrap = root.querySelector('.sh-page'), inBox = root.querySelector('#sh-in'), figBox = root.querySelector('#sh-fig'), out = root.querySelector('#sh-out');
    let touched = false;

    function drawInputs() {
      const K = KINDS[k], deg = K.f.some(x => (x[2] || {}).deg);
      inBox.innerHTML = `<h2 style="margin:0 0 8px">${K.name}</h2><div class="sh-fields">${K.f.map(([label, , o], i) => {
        o = o || {};
        const id = `sh-f${i}`;
        if (o.choice) return `<div class="sh-field"><label class="small" for="${id}">${label}</label><select id="${id}" data-i="${i}">${o.choice.map(([cv, cl]) => `<option value="${cv}"${cv === vals[i] ? ' selected' : ''}>${cl}</option>`).join('')}</select></div>`;
        const box = o.only ? '' : `<input id="${id}" type="text" inputmode="decimal" autocomplete="off" data-i="${i}" value="${raw(vals[i])}">`;
        const sl = o.slider ? `<input type="range" ${o.only ? `id="${id}" ` : `aria-label="${label}" `}data-i="${i}" data-r="1" min="${o.slider[0]}" max="${o.slider[1]}" step="${o.slider[2]}" value="${vals[i]}">` : '';
        return `<div class="sh-field${o.slider ? ' wide' : ''}"><label class="small" for="${id}">${label}${o.deg ? ' (degrees)' : ''}</label>${box}${sl}</div>`;
      }).join('')}${k === 'circle' ? `<div class="sh-field"><label class="small" for="sh-d">Diameter</label><input id="sh-d" type="text" inputmode="decimal" autocomplete="off" value="${raw(vals[0] * 2)}"></div>` : ''}
        ${deg ? '' : `<div class="sh-field"><label class="small" for="sh-u">Units</label><select id="sh-u">${UNITS.map(x => `<option value="${x}"${x === unit ? ' selected' : ''}>${x || 'none'}</option>`).join('')}</select></div>`}</div>`;
    }
    function render() {
      const r = solve(k, vals, unit), K = KINDS[k];
      root.__shapes = Object.assign({ kind: k, vals: vals.slice(), unit }, r.error ? { error: r.error } : r.hook);
      if (r.error) { out.innerHTML = `<div class="card"><p class="cx-err loud" style="margin:0">${esc(r.error)}</p></div>`; figBox.innerHTML = ''; return; }
      figBox.innerHTML = r.fig;
      const faces = r.faces ? `<div class="table-wrap"><table class="ch-table sh-faces"><thead><tr><th>Face</th><th>How many</th><th>Size</th><th>Area</th></tr></thead><tbody>${r.faces.map(([n, m, t, a, ex]) => `<tr><td>${n}</td><td>${m}</td><td>${t}</td><td>${ex || num(a)}${m > 1 ? ` each` : ''}</td></tr>`).join('')}</tbody></table></div>` : '';
      out.innerHTML = `<div class="card"><div class="sh-res">${r.res.map(([l, v, s]) => `<div class="sh-tile"><span class="tiny muted">${l}</span><b>${v}</b>${s ? `<span class="tiny muted">${s}</span>` : ''}</div>`).join('')}</div></div>
        ${r.fig2 ? `<div class="card"><h2>${r.fig2Title}</h2><div class="sh-fig">${r.fig2}</div></div>` : ''}
        <div class="card"><h2>How it’s found</h2>${r.work.map(([t, lines]) => `<div class="sh-work"><h3>${t}</h3><div class="sh-lines">${lines.map(x => `<div>${x}</div>`).join('')}</div></div>`).join('')}</div>
        ${r.net ? `<div class="card"><h2>The net</h2><p class="small muted" style="margin:0 0 6px">Cut along the edges and unfold it flat. Its area is the surface area.</p><div class="sh-fig">${r.net}</div>${faces}</div>` : ''}
        ${r.notes.filter(Boolean).length ? `<div class="card"><h2>Good to know</h2><ul class="nm-facts">${r.notes.filter(Boolean).map(t => `<li>${t}</li>`).join('')}</ul></div>` : ''}`;
      history.replaceState(null, '', `#/shapes/${k}/${vals.map(raw).join('_')}${unit ? '_' + unit : ''}`);
      H.tutorCtx({ notes: `The student is on the shapes tool: a ${K.name.toLowerCase()} with ${K.f.map(([l], i) => `${l.toLowerCase()} ${(K.f[i][2] || {}).choice ? (K.f[i][2].choice.find(c => c[0] === vals[i]) || [])[1] : raw(vals[i])}`).join(', ')}${unit ? ` (${unit})` : ''}. ${r.res.map(([l, v, s]) => `${l}: ${H.plain(v)}${s ? ` (${H.plain(s)})` : ''}`).join('; ')}.` });
      if (touched && window.BADGES) BADGES.flag('shapes');
    }
    function pick(x) {
      k = x; vals = defaults(k);
      wrap.querySelectorAll('[data-kind]').forEach(b => { b.classList.toggle('on', b.dataset.kind === k); b.setAttribute('aria-pressed', String(b.dataset.kind === k)); });
      drawInputs(); render();
    }
    let t = null;
    wrap.addEventListener('input', ev => {
      const el = ev.target;
      if (!inBox.contains(el)) return;
      touched = true;
      const n = Number(String(el.value).replace(/,/g, '').trim()), ok = el.value.trim() !== '' && Number.isFinite(n);
      if (el.id === 'sh-d') { vals[0] = ok ? n / 2 : NaN; const r = inBox.querySelector('#sh-f0'); if (r && ok) r.value = raw(n / 2); }
      else if (el.dataset.i !== undefined && el.tagName === 'INPUT') {
        const i = Number(el.dataset.i);
        vals[i] = ok ? n : NaN;
        inBox.querySelectorAll(`input[data-i="${i}"]`).forEach(o => { if (o !== el && ok) o.value = el.dataset.r ? raw(n) : String(Math.min(Number(o.max), Math.max(Number(o.min), n))); });
        if (k === 'circle' && i === 0 && ok) { const d = inBox.querySelector('#sh-d'); if (d) d.value = raw(n * 2); }
      } else return;
      clearTimeout(t); t = setTimeout(render, el.type === 'range' ? 0 : 150);
    });
    wrap.addEventListener('change', ev => {
      const el = ev.target;
      if (el.id === 'sh-u') { unit = el.value; touched = true; render(); }
      else if (el.tagName === 'SELECT' && el.dataset.i !== undefined) { vals[Number(el.dataset.i)] = Number(el.value); touched = true; render(); }
    });
    wrap.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b || !wrap.contains(b)) return;
      if (b.dataset.kind && b.dataset.kind !== k) pick(b.dataset.kind);
    });
    drawInputs(); render();
  }

  const SHAPES = { page, solve, KINDS, piK };
  window.SHAPES = SHAPES;
})();
