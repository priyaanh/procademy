/* High school geometry. Transformations, congruence, similarity, right triangles and trigonometry,
   analytic geometry, circles in the plane, circle measurement, and solids. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, PT = M.pt;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const close = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const deg2rad = d => d * Math.PI / 180, rad2deg = r => r * 180 / Math.PI;

  /** "(3, −2)" → [3, -2] */
  function parsePt(s) {
    const m = A.stripTags(s).replace(/−/g, '-').replace(/(\d),(?=\d{3})/g, '$1').match(/\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
    return m ? [Number(m[1]), Number(m[2])] : null;
  }
  /** a choice set of points: the answer, the given wrong answers, topped up with nearby points; all distinct */
  function ptChoices(rng, ans, wrongs, k) {
    k = k || 4;
    const key = q => A.normText(PT(q[0], q[1]));            // as the checker compares them: (−2.5, 5) and (−2, 5.5) read the same
    const out = [ans], seen = new Set([key(ans)]);
    for (const w of wrongs) { if (out.length >= k) break; if (!seen.has(key(w))) { seen.add(key(w)); out.push(w); } }
    let guard = 0;
    while (out.length < k && guard++ < 50) {
      const w = [ans[0] + rng.nz(-3, 3), ans[1] + rng.nz(-3, 3)];
      if (!seen.has(key(w))) { seen.add(key(w)); out.push(w); }
    }
    return out.map(q => PT(q[0], q[1]));
  }

  /** a small coordinate grid from −10 to 10 with labelled points, optional mirror line */
  function grid(points, line) {
    const S = 9, C = 100, sx = x => C + x * S, sy = y => C - y * S;
    let g = '';
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      g += `<line x1="${sx(i)}" y1="10" x2="${sx(i)}" y2="190" stroke="var(--line)" stroke-width="0.6"/><line x1="10" y1="${sy(i)}" x2="190" y2="${sy(i)}" stroke="var(--line)" stroke-width="0.6"/>`;
    }
    g += `<line x1="10" y1="${C}" x2="190" y2="${C}" stroke="var(--muted)" stroke-width="1.2"/><line x1="${C}" y1="10" x2="${C}" y2="190" stroke="var(--muted)" stroke-width="1.2"/>`;
    g += `<text x="186" y="${C - 4}" font-size="9" fill="var(--muted)">x</text><text x="${C + 4}" y="18" font-size="9" fill="var(--muted)">y</text>`;
    if (line) {
      let x1, y1, x2, y2;
      if (line.kind === 'vx') { x1 = x2 = line.k; y1 = -10; y2 = 10; }
      else if (line.kind === 'hy') { y1 = y2 = line.k; x1 = -10; x2 = 10; }
      else if (line.kind === 'yx') { x1 = -10; y1 = -10; x2 = 10; y2 = 10; }
      else if (line.kind === 'y-x') { x1 = -10; y1 = 10; x2 = 10; y2 = -10; }
      if (x1 != null) g += `<line x1="${sx(x1)}" y1="${sy(y1)}" x2="${sx(x2)}" y2="${sy(y2)}" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 3"/>`;
    }
    points.forEach(([x, y, label]) => {
      g += `<circle cx="${sx(x)}" cy="${sy(y)}" r="3.2" fill="currentColor"/><text x="${sx(x) + 5}" y="${sy(y) - 5}" font-size="11" font-weight="700" fill="currentColor">${label}</text>`;
    });
    return `<svg class="figure" viewBox="0 0 200 200" width="220" height="220" role="img" aria-label="coordinate grid">${g}</svg>`;
  }

  /** "3π/4" style: a multiple of π as stacked HTML */
  function piFrac(n, d) {
    [n, d] = M.simp(n, d);
    const top = (k) => (k === 1 ? '' : k === -1 ? '−' : N(k)) + 'π';
    if (d === 1) return top(n);
    return `<span class="frac"><span class="num">${top(n)}</span><span class="den">${N(d)}</span></span>`;
  }

  A.course({
    id: 'geometry', title: 'Geometry', subject: 'High school', grade: 10, icon: 'Geo', hue: 290,
    blurb: 'Transformations, congruence and similarity, right-triangle trigonometry, coordinate geometry, circles, and the volume and surface area of solids.',
    units: [
      { id: 'transformations', title: 'Performing transformations', blurb: 'Translations, reflections, rotations and dilations on the coordinate plane.', skills: ['geo.translations', 'geo.reflections', 'geo.rotations', 'geo.dilations'] },
      { id: 'transformation-properties', title: 'Transformation properties and proofs', blurb: 'Rigid and non-rigid transformations, and what each one preserves.', skills: ['geo.rigid-transformations', 'geo.preserved-measures'] },
      { id: 'congruence', title: 'Congruence', blurb: 'Triangle congruence criteria and the angle theorems used in proofs.', skills: ['geo.congruence-criteria', 'geo.angle-relationships'] },
      { id: 'similarity', title: 'Similarity', blurb: 'Scale factors, similar triangles, and the triangle proportionality theorem.', skills: ['geo.similar-triangles', 'geo.triangle-proportionality'] },
      { id: 'right-triangles', title: 'Right triangles & trigonometry', blurb: 'The Pythagorean theorem, special right triangles, and the sine, cosine and tangent ratios.', skills: ['geo.pythagorean-special', 'geo.trig-ratios', 'geo.solve-right-triangles'] },
      { id: 'analytic', title: 'Analytic geometry', blurb: 'Distance, midpoints, dividing segments, and slopes of parallel and perpendicular lines.', skills: ['geo.distance-midpoint', 'geo.parallel-perpendicular'] },
      { id: 'conics', title: 'Conic sections', blurb: 'The equation of a circle, and reading its center and radius.', skills: ['geo.circle-equation', 'geo.circle-center-radius'] },
      { id: 'circles', title: 'Circles', blurb: 'Arc length, sector area, radians, and inscribed angles.', skills: ['geo.arc-sector', 'geo.inscribed-angles'] },
      { id: 'solids', title: 'Solid geometry', blurb: 'Volume and surface area of prisms, cylinders, pyramids, cones and spheres.', skills: ['geo.volume', 'geo.surface-area'] },
    ],
  });

  /* ---------- Unit 1: Performing transformations ---------- */
  A.skill({
    id: 'geo.translations', title: 'Translations on the coordinate plane',
    learn: p('A <b>translation</b> slides every point of a figure the same distance in the same direction. Nothing turns, flips or changes size.') +
      p(`On the coordinate plane a translation adds the same amount to every ${X}-coordinate and the same amount to every ${Y}-coordinate. <b>Right and up are positive; left and down are negative.</b> The rule is written (${X}, ${Y}) → (${X} + ${V('a')}, ${Y} + ${V('b')}).`) +
      p('To go backwards, from an image to the original point, undo the slide: subtract instead of add.') +
      example('Example', `${big(`(${X}, ${Y}) → (${X} − 4, ${Y} + 3)`)}The point (2, −1) moves 4 left and 3 up: (2 − 4, −1 + 3) = <b>(−2, 2)</b>.`),
    make(rng) {
      let a = rng.nz(-7, 7), b = rng.nz(-7, 7);
      while (Math.abs(a) === Math.abs(b)) b = rng.nz(-7, 7);
      const x = rng.int(-6, 6), y = rng.int(-6, 6);
      const form = rng.pick(['words', 'rule', 'back']);
      const lr = `${N(Math.abs(a))} ${Math.abs(a) === 1 ? 'unit' : 'units'} ${a < 0 ? 'left' : 'right'}`;
      const ud = `${N(Math.abs(b))} ${Math.abs(b) === 1 ? 'unit' : 'units'} ${b < 0 ? 'down' : 'up'}`;
      const rule = `(${X}, ${Y}) → (${X} ${M.signed(a)}, ${Y} ${M.signed(b)})`;
      if (form === 'back') {
        const ix = x + a, iy = y + b;
        const choices = ptChoices(rng, [x, y], [[ix + a, iy + b], [ix - b, iy - a], [ix - a, iy + b]]);
        return { prompt: `A point is translated by the rule ${rule}. Its image is ${PT(ix, iy)}. Where was the original point?`, type: 'choice', choices, answer: PT(x, y), params: { a, b, x, y, back: true },
          hints: [`The rule moved the point ${lr} and ${ud}. To go back, do the opposite.`, `${N(ix)} ${M.signed(-a)} = ${N(x)} and ${N(iy)} ${M.signed(-b)} = ${N(y)}.`, `The original point was <b>${PT(x, y)}</b>.`] };
      }
      const ax = x + a, ay = y + b;
      const choices = ptChoices(rng, [ax, ay], [[x - a, y - b], [x + b, y + a], [x + a, y - b]]);
      const how = form === 'rule' ? `by the rule ${rule}` : `${lr} and ${ud}`;
      return { prompt: `Point ${V('P')}${PT(x, y)} is translated ${how}. What are the coordinates of its image ${V('P')}′?`, type: 'choice', choices, answer: PT(ax, ay), params: { a, b, x, y, back: false },
        hints: [`The translation moves every point ${lr} and ${ud}: add ${N(a)} to ${X} and ${N(b)} to ${Y}.`, `${N(x)} ${M.signed(a)} = ${N(ax)} and ${N(y)} ${M.signed(b)} = ${N(ay)}.`, `${V('P')}′ = <b>${PT(ax, ay)}</b>.`] };
    },
    verify(q) {
      const { a, b, x, y, back } = q.params, got = parsePt(q.answer);
      // the image minus the original must be the translation vector
      if (back) return close(x + a - got[0], a) && close(y + b - got[1], b) && got[0] === x && got[1] === y;
      return close(got[0] - x, a) && close(got[1] - y, b);
    },
  });

  const MIRRORS = {
    xaxis: { text: 'the ' + X + '-axis', abc: [0, 1, 0], f: (x, y) => [x, -y], fig: { kind: 'hy', k: 0 } },
    yaxis: { text: 'the ' + Y + '-axis', abc: [1, 0, 0], f: (x, y) => [-x, y], fig: { kind: 'vx', k: 0 } },
    yx: { text: `the line ${Y} = ${X}`, abc: [1, -1, 0], f: (x, y) => [y, x], fig: { kind: 'yx' } },
    ynx: { text: `the line ${Y} = −${X}`, abc: [1, 1, 0], f: (x, y) => [-y, -x], fig: { kind: 'y-x' } },
  };
  A.skill({
    id: 'geo.reflections', title: 'Reflections on the coordinate plane',
    learn: p('A <b>reflection</b> flips a figure over a line, the line of reflection. Each point and its image are the same distance from the line, on opposite sides, and the segment joining them crosses the line at a right angle.') +
      p(`The common rules: over the ${X}-axis, (${X}, ${Y}) → (${X}, −${Y}). Over the ${Y}-axis, (${X}, ${Y}) → (−${X}, ${Y}). Over ${Y} = ${X}, <b>swap the coordinates</b>: (${Y}, ${X}). Over ${Y} = −${X}, swap and change both signs: (−${Y}, −${X}).`) +
      p(`For a vertical line ${X} = ${V('k')}, count how far the point is from the line and go the same distance past it; the ${Y}-coordinate stays. A horizontal line ${Y} = ${V('k')} works the same way with ${Y}.`) +
      example('Example', `${big(`Reflect (5, 2) over ${X} = 1.`)}The point is 4 units right of the line, so its image is 4 units left of it: ${X} = 1 − 4 = −3. The image is <b>(−3, 2)</b>.`),
    make(rng) {
      const kind = rng.pick(['xaxis', 'yaxis', 'yx', 'ynx', 'vx', 'hy']);
      let x = rng.nz(-7, 7), y = rng.nz(-7, 7);
      if (Math.abs(x) === Math.abs(y)) y = y > 0 ? (y === 7 ? 5 : y + 1) : (y === -7 ? -5 : y - 1);
      let k = 0, m;
      if (kind === 'vx' || kind === 'hy') {
        k = rng.nz(-4, 4);
        const c = kind === 'vx' ? x : y;
        if (c === k) { if (kind === 'vx') x = k + 3; else y = k + 3; }
        m = kind === 'vx'
          ? { text: `the line ${X} = ${N(k)}`, abc: [1, 0, k], f: (u, w) => [2 * k - u, w], fig: { kind: 'vx', k } }
          : { text: `the line ${Y} = ${N(k)}`, abc: [0, 1, k], f: (u, w) => [u, 2 * k - w], fig: { kind: 'hy', k } };
      } else m = MIRRORS[kind];
      const img = m.f(x, y);
      const others = [[x, -y], [-x, y], [y, x], [-y, -x], [-x, -y]];
      if (kind === 'vx') others.unshift([k - x, y], [-x, y]);
      if (kind === 'hy') others.unshift([x, k - y], [x, -y]);
      const choices = ptChoices(rng, img, others.filter(o => !(o[0] === img[0] && o[1] === img[1])));
      const how = {
        xaxis: `Over the ${X}-axis the ${X}-coordinate stays and the ${Y}-coordinate changes sign.`,
        yaxis: `Over the ${Y}-axis the ${Y}-coordinate stays and the ${X}-coordinate changes sign.`,
        yx: `Over ${Y} = ${X}, swap the two coordinates.`,
        ynx: `Over ${Y} = −${X}, swap the two coordinates and change both signs.`,
        vx: `The point is ${N(Math.abs(x - k))} units ${x > k ? 'right' : 'left'} of ${X} = ${N(k)}, so the image is ${N(Math.abs(x - k))} units ${x > k ? 'left' : 'right'} of it: ${X} = ${N(k)} ${M.signed(k - x)} = ${N(img[0])}. The ${Y}-coordinate stays.`,
        hy: `The point is ${N(Math.abs(y - k))} units ${y > k ? 'above' : 'below'} ${Y} = ${N(k)}, so the image is ${N(Math.abs(y - k))} units ${y > k ? 'below' : 'above'} it: ${Y} = ${N(k)} ${M.signed(k - y)} = ${N(img[1])}. The ${X}-coordinate stays.`,
      }[kind];
      return { prompt: `Point ${V('A')}${PT(x, y)} is reflected over ${m.text}. What are the coordinates of its image ${V('A')}′?${grid([[x, y, 'A']], m.fig)}`, type: 'choice', choices, answer: PT(img[0], img[1]), params: { kind, x, y, abc: m.abc },
        hints: [how, `${V('A')}′ = <b>${PT(img[0], img[1])}</b>.`] };
    },
    verify(q) {
      const { x, y, abc } = q.params, [a, b, c] = abc, g = parsePt(q.answer);
      const mx = (x + g[0]) / 2, my = (y + g[1]) / 2, dx = g[0] - x, dy = g[1] - y;
      // the midpoint lies on the mirror, and the segment is perpendicular to it (parallel to its normal)
      return close(a * mx + b * my, c) && close(dx * b - dy * a, 0) && (dx !== 0 || dy !== 0);
    },
  });

  A.skill({
    id: 'geo.rotations', title: 'Rotations about the origin',
    learn: p('A <b>rotation</b> turns a figure about a fixed point, the center of rotation. Counterclockwise is the positive direction. Every point stays the same distance from the center.') +
      p(`About the origin the rules are: <b>90° counterclockwise</b>: (${X}, ${Y}) → (−${Y}, ${X}). <b>180°</b>: (${X}, ${Y}) → (−${X}, −${Y}). <b>90° clockwise</b> (the same as 270° counterclockwise): (${X}, ${Y}) → (${Y}, −${X}).`) +
      p('A quick check: after a quarter turn the point should be in the next quadrant over, in the direction you turned.') +
      example('Example', `${big('Rotate (4, 1) by 90° counterclockwise about the origin.')}Use (−${Y}, ${X}): the image is <b>(−1, 4)</b>, one quadrant over from quadrant I into quadrant II.`),
    make(rng) {
      let x = rng.nz(-8, 8), y = rng.nz(-8, 8);
      if (Math.abs(x) === Math.abs(y)) y = y > 0 ? (y === 8 ? 6 : y + 1) : (y === -8 ? -6 : y - 1);
      const turn = rng.pick([90, 180, 270, -90]);
      const imgOf = { 90: [-y, x], 180: [-x, -y], 270: [y, -x], '-90': [y, -x] };
      const img = imgOf[turn];
      const text = { 90: '90° counterclockwise', 180: '180°', 270: '270° counterclockwise', '-90': '90° clockwise' }[turn];
      const rule = { 90: `(−${Y}, ${X})`, 180: `(−${X}, −${Y})`, 270: `(${Y}, −${X})`, '-90': `(${Y}, −${X})` }[turn];
      const wrongs = [[-y, x], [y, -x], [-x, -y], [-x, y], [x, -y], [y, x]].filter(o => !(o[0] === img[0] && o[1] === img[1]));
      const choices = ptChoices(rng, img, wrongs);
      return { prompt: `Point ${V('B')}${PT(x, y)} is rotated ${text} about the origin. What are the coordinates of ${V('B')}′?`, type: 'choice', choices, answer: PT(img[0], img[1]), params: { x, y, turn },
        hints: [turn === 270 ? `A 270° counterclockwise turn is the same as 90° clockwise.` : `Picture the point turning ${text} around (0, 0).`, `The rule for ${text} is (${X}, ${Y}) → ${rule}.`, `With ${X} = ${N(x)} and ${Y} = ${N(y)}: ${V('B')}′ = <b>${PT(img[0], img[1])}</b>.`] };
    },
    verify(q) {
      const { x, y, turn } = q.params, g = parsePt(q.answer);
      if (!close(x * x + y * y, g[0] * g[0] + g[1] * g[1])) return false;               // same distance from the origin
      const d = rad2deg(Math.atan2(g[1], g[0]) - Math.atan2(y, x));
      const r = (((d - turn) % 360) + 360) % 360;
      return close(r, 0, 1e-6) || close(r, 360, 1e-6);
    },
  });

  A.skill({
    id: 'geo.dilations', title: 'Dilations',
    learn: p(`A <b>dilation</b> with center ${V('C')} and scale factor ${V('k')} moves every point along the ray from ${V('C')}, multiplying its distance from ${V('C')} by ${V('k')}. A scale factor above 1 enlarges the figure; between 0 and 1 it shrinks it.`) +
      p(`From the origin the rule is simple: <b>(${X}, ${Y}) → (${V('k')}${X}, ${V('k')}${Y})</b>. From any other center, find how far the point is from the center in each direction, multiply those by ${V('k')}, and add them back on to the center.`) +
      p('The scale factor is image length ÷ original length.') +
      example('Example', `${big('Dilate (5, 3) by a factor of 2 about the center (1, 1).')}From the center the point is 4 right and 2 up. Doubled, that is 8 right and 4 up, so the image is (1 + 8, 1 + 4) = <b>(9, 5)</b>.`),
    make(rng) {
      const form = rng.pick(['origin', 'centre', 'centre', 'factor']);
      const kk = rng.pick([[2, 1], [3, 1], [1, 2], [1, 3], [3, 2]]), k = kk[0] / kk[1];
      const kTxt = kk[1] === 1 ? N(kk[0]) : F(kk[0], kk[1]);
      if (form === 'factor') {
        const L = rng.int(2, 9) * kk[1], img = L * k;
        const name = rng.pick(NAMES);
        return { prompt: `${name} dilates a triangle. A side that was ${N(L)} cm long becomes ${N(img)} cm long. What is the scale factor? (Enter a fraction or a decimal.)`, type: 'number', answer: k, answerText: M.fracText(kk[0], kk[1]), params: { form, L, img },
          hints: ['The scale factor is the image length divided by the original length.', `${N(img)} ÷ ${N(L)} = <b>${M.fracText(kk[0], kk[1])}</b>${k < 1 ? ', less than 1, because the triangle shrank' : ''}.`] };
      }
      const cx = form === 'origin' ? 0 : rng.int(-4, 4), cy = form === 'origin' ? 0 : rng.int(-4, 4);
      const dx = rng.nz(-3, 3) * kk[1], dy = rng.nz(-3, 3) * kk[1];
      const x = cx + dx, y = cy + dy, ix = cx + dx * k, iy = cy + dy * k;
      const wrongs = [[x * k, y * k], [cx + dx / k, cy + dy / k], [x + k, y + k], [ix, y]].filter(w => Number.isInteger(w[0] * 2) && Number.isInteger(w[1] * 2));
      const choices = ptChoices(rng, [ix, iy], wrongs);
      const ctr = form === 'origin' ? 'the origin' : `the point ${PT(cx, cy)}`;
      const hints = form === 'origin'
        ? [`From the origin, multiply both coordinates by the scale factor ${kTxt}.`, `${N(x)} × ${kTxt} = ${N(ix)} and ${N(y)} × ${kTxt} = ${N(iy)}.`, `The image is <b>${PT(ix, iy)}</b>.`]
        : [`Find how far ${PT(x, y)} is from the center: ${N(x)} − ${wrap(cx)} = ${N(dx)} across and ${N(y)} − ${wrap(cy)} = ${N(dy)} up.`, `Multiply those by ${kTxt}: ${N(dx * k)} across and ${N(dy * k)} up.`, `Add them back on to the center: (${N(cx)} ${M.signed(dx * k)}, ${N(cy)} ${M.signed(dy * k)}) = <b>${PT(ix, iy)}</b>.`];
      return { prompt: `Point ${V('Q')}${PT(x, y)} is dilated by a scale factor of ${kTxt} with center at ${ctr}. What are the coordinates of ${V('Q')}′?`, type: 'choice', choices, answer: PT(ix, iy), params: { form, x, y, cx, cy, k },
        hints };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'factor') return close(q.answer * pr.L, pr.img);
      const g = parsePt(q.answer), ux = pr.x - pr.cx, uy = pr.y - pr.cy, vx = g[0] - pr.cx, vy = g[1] - pr.cy;
      // same direction from the centre, distance multiplied by k
      return close(ux * vy - uy * vx, 0) && ux * vx + uy * vy > 0 && close(Math.hypot(vx, vy), pr.k * Math.hypot(ux, uy), 1e-9);
    },
  });

  /* ---------- Unit 2: Transformation properties and proofs ---------- */
  /** a transformation from a plain spec, so verify() can rebuild it from q.params */
  function tf(spec) {
    const { t, a, b, k } = spec;
    const kTxt = k == null ? '' : (k === 0.5 ? F(1, 2) : N(k));
    switch (t) {
      case 'tr': return { words: `a translation ${M.plural(Math.abs(a), 'unit')} ${a < 0 ? 'left' : 'right'} and ${M.plural(Math.abs(b), 'unit')} ${b < 0 ? 'down' : 'up'}`, rule: `(${X} ${M.signed(a)}, ${Y} ${M.signed(b)})`, f: (x, y) => [x + a, y + b] };
      case 'rx': return { words: `a reflection over the ${X}-axis`, rule: `(${X}, −${Y})`, f: (x, y) => [x, -y] };
      case 'ry': return { words: `a reflection over the ${Y}-axis`, rule: `(−${X}, ${Y})`, f: (x, y) => [-x, y] };
      case 'ryx': return { words: `a reflection over the line ${Y} = ${X}`, rule: `(${Y}, ${X})`, f: (x, y) => [y, x] };
      case 'r90': return { words: 'a rotation of 90° counterclockwise about the origin', rule: `(−${Y}, ${X})`, f: (x, y) => [-y, x] };
      case 'r180': return { words: 'a rotation of 180° about the origin', rule: `(−${X}, −${Y})`, f: (x, y) => [-x, -y] };
      case 'dil': return { words: `a dilation by a scale factor of ${kTxt} about the origin`, rule: `(${kTxt}${X}, ${kTxt}${Y})`, f: (x, y) => [k * x, k * y] };
      case 'hs': return { words: `a horizontal stretch by a factor of ${kTxt}`, rule: `(${kTxt}${X}, ${Y})`, f: (x, y) => [k * x, y] };
      case 'vs': return { words: `a vertical stretch by a factor of ${kTxt}`, rule: `(${X}, ${kTxt}${Y})`, f: (x, y) => [x, k * y] };
    }
  }
  const RIGID_SPECS = rng => rng.pick([
    { t: 'tr', a: rng.nz(-6, 6), b: rng.nz(-6, 6) }, { t: 'rx' }, { t: 'ry' }, { t: 'ryx' }, { t: 'r90' }, { t: 'r180' }]);
  /** apply a list of specs to a list of points */
  const applyAll = (specs, pts) => pts.map(pt => specs.reduce((q, s) => tf(s).f(q[0], q[1]), pt));
  const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
  const angleAt = (V0, P, Q) => { const u = [P[0] - V0[0], P[1] - V0[1]], w = [Q[0] - V0[0], Q[1] - V0[1]]; return rad2deg(Math.acos((u[0] * w[0] + u[1] * w[1]) / (Math.hypot(...u) * Math.hypot(...w)))); };
  const triArea = (P, Q, R) => Math.abs((Q[0] - P[0]) * (R[1] - P[1]) - (R[0] - P[0]) * (Q[1] - P[1])) / 2;

  const RIGID_CHOICES = [
    'Rigid: lengths and angle measures are both preserved.',
    'Not rigid: angle measures are preserved, but lengths are not.',
    'Not rigid: lengths are preserved, but angle measures are not.',
    'Not rigid: neither lengths nor angle measures are preserved.',
  ];
  A.skill({
    id: 'geo.rigid-transformations', title: 'Rigid transformations',
    learn: p('A <b>rigid transformation</b> (an isometry) moves a figure without changing its size or shape. <b>Translations, reflections and rotations are rigid</b>: they preserve every length and every angle measure, so the image is congruent to the original.') +
      p('A <b>dilation</b> is not rigid. It multiplies every length by the scale factor but keeps every angle, so the image is <b>similar</b> to the original, not congruent. A stretch in only one direction, such as (' + X + ', ' + Y + ') → (2' + X + ', ' + Y + '), changes lengths and angles both.') +
      p('A sequence of transformations is rigid only if every step in it is rigid. One dilation anywhere in the list is enough to change the lengths.') +
      example('Example', `${big('A reflection over the ' + X + '-axis, then a dilation by a factor of 3')}The reflection keeps everything, but the dilation triples the lengths while keeping the angles. <b>Not rigid: angle measures are preserved, but lengths are not.</b>`),
    make(rng) {
      const form = rng.pick(['seq', 'seq', 'rule']);
      const kind = rng.pick(['rigid', 'dil', 'stretch']);
      const odd = kind === 'dil' ? { t: 'dil', k: rng.pick([2, 3, 0.5]) } : kind === 'stretch' ? { t: rng.pick(['hs', 'vs']), k: rng.pick([2, 3]) } : null;
      let specs;
      if (form === 'rule') specs = [odd || RIGID_SPECS(rng)];
      else {
        specs = [RIGID_SPECS(rng), RIGID_SPECS(rng)];
        if (odd) specs[rng.int(0, 1)] = odd;
        if (specs[0].t === specs[1].t) specs[1] = specs[0].t === 'r90' ? { t: 'rx' } : { t: 'r90' };
      }
      const answer = RIGID_CHOICES[kind === 'rigid' ? 0 : kind === 'dil' ? 1 : 3];
      const T = specs.map(tf);
      const prompt = form === 'rule'
        ? `A transformation follows the rule ${big(`(${X}, ${Y}) → ${T[0].rule}`)}Which statement is true?`
        : `A figure undergoes ${T[0].words}, followed by ${T[1].words}. Which statement about the whole sequence is true?`;
      const hints = form === 'rule'
        ? [`Decide what kind of transformation this rule is: it is ${T[0].words}.`]
        : [`Look at each step: ${T[0].words} and ${T[1].words}.`];
      hints.push(kind === 'rigid' ? 'Translations, reflections and rotations all keep lengths and angles, so nothing changes size or shape.'
        : kind === 'dil' ? 'A dilation multiplies lengths by the scale factor, but keeps every angle.'
        : 'A stretch in one direction only changes lengths, and it squashes angles too, because the figure is pulled out of shape.');
      hints.push(`<b>${answer}</b>`);
      return { prompt, type: 'choice', choices: RIGID_CHOICES.slice(), keepOrder: true, answer, params: { specs }, hints };
    },
    verify(q) {
      // move a test triangle and measure it
      const tri = [[0, 0], [4, 0], [1, 3]], im = applyAll(q.params.specs, tri);
      const sides = t => [dist(t[0], t[1]), dist(t[1], t[2]), dist(t[2], t[0])];
      const angs = t => [angleAt(t[0], t[1], t[2]), angleAt(t[1], t[2], t[0])];
      const L = sides(tri).every((s, i) => close(s, sides(im)[i], 1e-9)), Ang = angs(tri).every((s, i) => close(s, angs(im)[i], 1e-6));
      const expect = L && Ang ? 0 : Ang ? 1 : L ? 2 : 3;
      return q.answer === RIGID_CHOICES[expect];
    },
  });

  A.skill({
    id: 'geo.preserved-measures', title: 'Measures under transformations',
    learn: p('Because rigid transformations preserve lengths and angles, <b>corresponding parts of the image and the original are equal</b>: if △' + V('ABC') + ' maps to △' + V('A′B′C′') + ', then ' + V('A′B′') + ' = ' + V('AB') + ' and ∠' + V('B′') + ' = ∠' + V('B') + '.') +
      p(`A dilation by scale factor ${V('k')} keeps every angle but <b>multiplies every length by ${V('k')}</b>. Areas grow faster: they are multiplied by <b>${V('k')}²</b>, because both the base and the height are scaled.`) +
      p('So when a sequence includes a dilation, scale lengths once by the factor, scale areas by its square, and leave angles alone.') +
      example('Example', `${big('△' + V('ABC') + ' is rotated 180°, then dilated by a factor of 3. ' + V('AB') + ' = 4, ∠' + V('B') + ' = 50°, area = 10.')}${V('A′B′')} = 3 × 4 = <b>12</b>, ∠${V('B′')} = <b>50°</b>, and the area is 3² × 10 = <b>90</b>.`),
    make(rng) {
      const c = rng.int(3, 12), a = rng.int(3, 12), th = rng.int(25, 130);
      const area = M.round(a * c * Math.sin(deg2rad(th)) / 2, 1);        // consistent with the two sides and the angle
      const ask = rng.pick(['side', 'side', 'angle', 'area']);
      const useDil = rng.chance(0.7), k = ask === 'area' ? rng.pick([2, 3, 4]) : rng.pick([2, 3, 0.5, 4]);
      const specs = [RIGID_SPECS(rng)];
      if (useDil) specs.push({ t: 'dil', k }); else specs.push(RIGID_SPECS(rng));
      if (rng.bool()) specs.reverse();
      const kf = useDil ? k : 1, kTxt = kf === 0.5 ? F(1, 2) : N(kf);
      const T = specs.map(tf);
      const prompt = `In △${V('ABC')}, ${V('AB')} = ${N(c)} cm, ${V('BC')} = ${N(a)} cm, ∠${V('B')} = ${M.deg(th)}, and the area is about ${N(area)} cm². The triangle undergoes ${T[0].words}, followed by ${T[1].words}, to give △${V('A′B′C′')}. `;
      const scaleHint = useDil ? `The dilation multiplies lengths by ${kTxt}; the other step is rigid and changes nothing.` : 'Both steps are rigid, so every length, angle and area stays the same.';
      if (ask === 'angle') return { prompt: prompt + `What is ∠${V('B′')}?`, type: 'number', answer: th, unit: '°', params: { specs, c, a, th, area, ask },
        hints: ['Ask which measures could change. Rigid steps keep everything; a dilation changes lengths only.', 'No step in the sequence changes an angle.', `∠${V('B′')} = ∠${V('B')} = <b>${M.deg(th)}</b>.`] };
      if (ask === 'area') { const ans = area * kf * kf; return { prompt: prompt + `What is the area of △${V('A′B′C′')}, in cm²?`, type: 'number', answer: ans, unit: 'cm²', params: { specs, c, a, th, area, ask },
        hints: [scaleHint, useDil ? `Area scales by the square of the factor: ${kTxt}² = ${N(kf * kf)}.` : 'The area is unchanged.', `${N(area)} × ${N(kf * kf)} = <b>${N(ans)} cm²</b>.`] }; }
      const ans = c * kf;
      return { prompt: prompt + `What is ${V('A′B′')}, in cm?`, type: 'number', answer: ans, unit: 'cm', params: { specs, c, a, th, area, ask },
        hints: [scaleHint, `${V('A′B′')} corresponds to ${V('AB')} = ${N(c)} cm.`, `${N(c)} × ${kTxt} = <b>${N(ans)} cm</b>.`] };
    },
    verify(q) {
      const { specs, c, a, th, area, ask } = q.params;
      const tri = [[c, 0], [0, 0], [a * Math.cos(deg2rad(th)), a * Math.sin(deg2rad(th))]];       // A, B, C
      const im = applyAll(specs, tri);
      if (ask === 'angle') return close(angleAt(im[1], im[0], im[2]), q.answer, 1e-6);
      if (ask === 'area') return close(triArea(...im) / triArea(...tri) * area, q.answer, 1e-6);
      return close(dist(im[0], im[1]), q.answer, 1e-9);
    },
  });

  /* ---------- Unit 3: Congruence ---------- */
  const CRITERIA = ['SSS', 'SAS', 'ASA', 'AAS', 'HL', 'Not enough information'];
  const MATE = { A: 'D', B: 'E', C: 'F' };
  const sideMate = s => s.split('').map(ch => MATE[ch]).join('');
  A.skill({
    id: 'geo.congruence-criteria', title: 'Triangle congruence criteria',
    learn: p('Two triangles are congruent when all six pairs of corresponding parts match, but you only need three of them, in the right arrangement:') +
      p('<b>SSS</b>: three pairs of sides. <b>SAS</b>: two sides and the angle <i>between</i> them. <b>ASA</b>: two angles and the side <i>between</i> them. <b>AAS</b>: two angles and a side that is <i>not</i> between them. <b>HL</b>: in right triangles, the hypotenuse and one leg.') +
      p('Two arrangements do <b>not</b> prove congruence: <b>AAA</b> (the triangles could be different sizes) and <b>SSA</b>, two sides and an angle that is not between them (two different triangles can fit), unless the angle is a right angle, which is HL.') +
      example('Example', `${big(`${V('AB')} = ${V('DE')}, ∠${V('B')} ≅ ∠${V('E')}, ${V('BC')} = ${V('EF')}`)}The angle at ${V('B')} sits between sides ${V('AB')} and ${V('BC')}, so this is <b>SAS</b>.`),
    make(rng) {
      const kind = rng.pick(['SSS', 'SAS', 'SAS', 'ASA', 'ASA', 'AAS', 'AAS', 'HL', 'SSA', 'AAA']);
      const verts = ['A', 'B', 'C'], sideOf = { A: 'BC', B: 'CA', C: 'AB' };      // the side opposite each vertex
      const between = (u, w) => verts.filter(z => z !== u && z !== w).map(z => sideOf[z])[0];
      let sides = [], angles = [], right = null;
      const v = rng.pick(verts), others = verts.filter(z => z !== v);
      if (kind === 'SSS') sides = ['AB', 'BC', 'CA'];
      else if (kind === 'SAS') { sides = others.map(o => sideOf[o]); angles = [v]; }
      else if (kind === 'ASA') { angles = others; sides = [sideOf[v]]; }
      else if (kind === 'AAS') { angles = others; sides = [sideOf[rng.pick(others)]]; }
      else if (kind === 'SSA') { sides = others.map(o => sideOf[o]); angles = [rng.pick(others)]; }
      else if (kind === 'AAA') angles = verts.slice();
      else { right = v; sides = [sideOf[v], sideOf[rng.pick(others)]]; }
      const fix = s => ({ CA: 'AC', FD: 'DF' }[s] || s);
      const facts = sides.map(s => `${V(fix(s))} = ${V(fix(sideMate(s)))}`).concat(angles.map(z => `∠${V(z)} ≅ ∠${V(MATE[z])}`));
      const shown = rng.shuffle(facts);
      const answer = kind === 'SSA' || kind === 'AAA' ? CRITERIA[5] : kind;
      const why = {
        SSS: 'All three pairs of sides match.',
        SAS: `The angle at ${V(v)} is formed by sides ${V(fix(sideOf[others[0]]))} and ${V(fix(sideOf[others[1]]))}, so it is the included angle.`,
        ASA: `Side ${V(fix(sideOf[v]))} joins the two vertices ${V(others[0])} and ${V(others[1])}, so it lies between the two angles.`,
        AAS: `The side is not the one joining ${V(others[0])} and ${V(others[1])}, so it is not between the two angles.`,
        HL: `Both triangles are right triangles, ${V(fix(sideOf[v]))} is the side opposite the right angle (the hypotenuse), and the other side is a leg.`,
        SSA: 'The angle is not between the two sides; it touches only one of them. Two different triangles can have these measurements.',
        AAA: 'Only angles match. Triangles with the same angles can be different sizes, so they are similar but not necessarily congruent.',
      }[kind];
      return { prompt: `In △${V('ABC')} and △${V('DEF')}${right ? `, ∠${V(right)} and ∠${V(MATE[right])} are right angles, and` : ''} you know:${big(shown.join(',&nbsp;&nbsp; '))}Which criterion, if any, proves △${V('ABC')} ≅ △${V('DEF')}?`,
        type: 'choice', choices: CRITERIA.slice(), keepOrder: true, answer, params: { sides, angles, right },
        hints: [`Count what you know: ${M.plural(sides.length, 'pair')} of sides and ${M.plural(angles.length, 'pair')} of angles${right ? ', in right triangles' : ''}.`, why, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { sides, angles, right } = q.params;
      const ends = s => s.split('');
      let expect;
      if (right && sides.length === 2 && sides.some(s => !ends(s).includes(right)) && sides.some(s => ends(s).includes(right))) expect = 'HL';
      else if (sides.length === 3) expect = 'SSS';
      else if (sides.length === 2 && angles.length === 1) expect = sides.every(s => ends(s).includes(angles[0])) ? 'SAS' : CRITERIA[5];
      else if (sides.length === 1 && angles.length === 2) expect = angles.every(z => ends(sides[0]).includes(z)) ? 'ASA' : 'AAS';
      else expect = CRITERIA[5];
      return q.answer === expect;
    },
  });

  /** two parallel lines cut by a transversal at angle th (measured from the right-hand ray), angles numbered 1–8 */
  const POS = ['TL', 'TR', 'BL', 'BR'];
  function transversalFig(th) {
    const cot = Math.cos(deg2rad(th)) / Math.sin(deg2rad(th));
    const I = [[120 + 35 * cot, 50], [120 - 35 * cot, 120]];
    const ext = 30 / Math.sin(deg2rad(th));
    const ux = Math.cos(deg2rad(th)), uy = -Math.sin(deg2rad(th));
    let g = `<line x1="20" y1="50" x2="220" y2="50" stroke="currentColor" stroke-width="1.6"/><line x1="20" y1="120" x2="220" y2="120" stroke="currentColor" stroke-width="1.6"/>`;
    g += `<line x1="${I[0][0] + ux * ext}" y1="${I[0][1] + uy * ext}" x2="${I[1][0] - ux * ext}" y2="${I[1][1] - uy * ext}" stroke="currentColor" stroke-width="1.6"/>`;
    g += `<text x="205" y="44" font-size="10" fill="var(--muted)">ℓ</text><text x="205" y="114" font-size="10" fill="var(--muted)">${V('m')}</text>`;
    const bis = { TR: th / 2, TL: (th + 180) / 2, BL: 180 + th / 2, BR: 270 + th / 2 };
    I.forEach((c, k) => POS.forEach((ps, i) => {
      const phi = deg2rad(bis[ps]);
      g += `<text x="${(c[0] + 15 * Math.cos(phi)).toFixed(1)}" y="${(c[1] - 15 * Math.sin(phi) + 4).toFixed(1)}" font-size="11" font-weight="700" text-anchor="middle" fill="currentColor">${k * 4 + i + 1}</text>`;
    }));
    return `<svg class="figure" viewBox="0 0 240 170" width="260" height="184" role="img" aria-label="two parallel lines cut by a transversal">${g}</svg>`;
  }
  function pairName(i, j) {
    const [a, b] = [Math.min(i, j), Math.max(i, j)];
    const pa = POS[(a - 1) % 4], pb = POS[(b - 1) % 4], same = Math.ceil(a / 4) === Math.ceil(b / 4);
    if (same) return (pa[0] !== pb[0] && pa[1] !== pb[1]) ? 'vertical angles' : 'a linear pair';
    if (pa === pb) return 'corresponding angles';
    // a is at the top crossing, b at the bottom one; interior means between the parallel lines
    const interior = pa[0] === 'B' && pb[0] === 'T', exterior = pa[0] === 'T' && pb[0] === 'B';
    const sameSide = pa[1] === pb[1];                              // L or R of the transversal
    if (interior) return sameSide ? 'same-side interior angles' : 'alternate interior angles';
    if (exterior) return sameSide ? 'same-side exterior angles' : 'alternate exterior angles';
    return null;
  }
  A.skill({
    id: 'geo.angle-relationships', title: 'Angle relationships',
    learn: p('<b>Vertical angles</b> are equal, and a <b>linear pair</b> adds to 180°. When a transversal crosses two <b>parallel</b> lines, <b>corresponding, alternate interior and alternate exterior angles are equal</b>, and <b>same-side interior angles add to 180°</b>.') +
      p('In any triangle the angles add to 180°, and an <b>exterior angle equals the sum of the two remote interior angles</b>. The interior angles of a polygon with ' + V('n') + ' sides add to <b>(' + V('n') + ' − 2) × 180°</b>; in a regular polygon they are all equal.') +
      p('With a transversal there are only two sizes of angle: every angle either equals the one you know or is its supplement.') +
      example('Example', `${big('A regular hexagon')}Its angles add to (6 − 2) × 180° = 720°, so each one is 720° ÷ 6 = <b>120°</b>.`),
    make(rng) {
      const kind = rng.pick(['parallel', 'parallel', 'vertical-alg', 'triangle', 'exterior', 'polygon']);
      if (kind === 'parallel') {
        let g = rng.int(35, 145); if (g === 90) g = 72;
        const i = rng.int(1, 8);
        const j = rng.pick([1, 2, 3, 4, 5, 6, 7, 8].filter(t => t !== i && pairName(i, t)));
        const acute = ps => ps === 'TR' || ps === 'BL';
        const th = acute(POS[(i - 1) % 4]) ? g : 180 - g;
        const ans = acute(POS[(j - 1) % 4]) ? th : 180 - th;
        const nm = pairName(i, j);
        return { prompt: `Lines ℓ and ${V('m')} are parallel. ∠${i} = ${M.deg(g)}. What is the measure of ∠${j}?${transversalFig(th)}`, type: 'number', answer: ans, unit: '°', params: { kind, g, i, j },
          hints: [`∠${i} and ∠${j} are ${nm}.`, ans === g ? 'Those angles are equal.' : 'Those angles are supplementary: they add to 180°.', ans === g ? `∠${j} = <b>${M.deg(ans)}</b>.` : `∠${j} = 180° − ${M.deg(g)} = <b>${M.deg(ans)}</b>.`] };
      }
      if (kind === 'vertical-alg') {
        const x = rng.int(4, 20), a = rng.int(2, 6); let c = rng.int(1, 5); if (c === a) c = a + 1;
        const linear = rng.bool();
        const angle1 = rng.int(30, 140);
        const b = angle1 - a * x, d = (linear ? 180 - angle1 : angle1) - c * x;
        const e1 = `(${M.term(a, 'x')} ${M.signed(b)})°`, e2 = `(${M.term(c, 'x')} ${M.signed(d)})°`;
        return { prompt: `Two lines cross. Two of the angles they make are ${linear ? 'a linear pair' : 'vertical angles'} measuring ${e1} and ${e2}. What is ${X}?`, type: 'number', answer: x, params: { kind, a, b, c, d, linear },
          hints: [linear ? 'A linear pair adds to 180°.' : 'Vertical angles are equal.', linear ? `${M.term(a, 'x')} ${M.signed(b)} + ${M.term(c, 'x')} ${M.signed(d)} = 180, so ${M.term(a + c, 'x')} = ${N(180 - b - d)}.` : `${M.term(a, 'x')} ${M.signed(b)} = ${M.term(c, 'x')} ${M.signed(d)}, so ${M.term(a - c, 'x')} = ${N(d - b)}.`, `<b>${X} = ${N(x)}</b>.`] };
      }
      if (kind === 'triangle' || kind === 'exterior') {
        const A1 = rng.int(25, 80), B1 = rng.int(25, 80), C1 = 180 - A1 - B1;
        if (kind === 'triangle') return { prompt: `Two angles of a triangle measure ${M.deg(A1)} and ${M.deg(B1)}. What is the third angle?`, type: 'number', answer: C1, unit: '°', params: { kind, A1, B1 },
          hints: ['The angles of a triangle add to 180°.', `180° − ${M.deg(A1)} − ${M.deg(B1)} = <b>${M.deg(C1)}</b>.`] };
        const ext = A1 + B1;
        return { prompt: `In △${V('PQR')}, the exterior angle at ${V('R')} measures ${M.deg(ext)}, and ∠${V('P')} = ${M.deg(A1)}. What is ∠${V('Q')}?`, type: 'number', answer: B1, unit: '°', params: { kind, A1, ext },
          hints: ['An exterior angle equals the sum of the two interior angles that are not next to it: here ∠' + V('P') + ' + ∠' + V('Q') + '.', `${M.deg(ext)} = ${M.deg(A1)} + ∠${V('Q')}.`, `∠${V('Q')} = ${M.deg(ext)} − ${M.deg(A1)} = <b>${M.deg(B1)}</b>.`] };
      }
      const n = rng.pick([5, 6, 8, 9, 10, 12, 15, 18, 20]);
      const NAME = { 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };
      const nm = NAME[n] ? `regular ${NAME[n]} (${n} sides)` : `regular polygon with ${n} sides`;
      if (rng.bool()) { const ans = (n - 2) * 180; return { prompt: `What is the sum of the interior angles of a ${nm.replace('regular ', '')}?`, type: 'number', answer: ans, unit: '°', params: { kind, n, each: false },
        hints: [`A polygon with ${V('n')} sides splits into ${V('n')} − 2 triangles from one vertex, so its angles add to (${V('n')} − 2) × 180°.`, `(${n} − 2) × 180° = ${n - 2} × 180° = <b>${M.deg(ans)}</b>.`] }; }
      const ans = (n - 2) * 180 / n;
      return { prompt: `What is the measure of each interior angle of a ${nm}?`, type: 'number', answer: ans, unit: '°', params: { kind, n, each: true },
        hints: [`The interior angles add to (${n} − 2) × 180° = ${M.deg((n - 2) * 180)}.`, `A regular polygon's angles are all equal, so divide by ${n}.`, `${M.deg((n - 2) * 180)} ÷ ${n} = <b>${M.deg(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.kind === 'parallel') {
        // rebuild the picture from rays and measure ∠j
        const acuteI = ['TR', 'BL'].includes(POS[(pr.i - 1) % 4]), th = acuteI ? pr.g : 180 - pr.g;
        const ray = d => [Math.cos(deg2rad(d)), Math.sin(deg2rad(d))];
        const rays = { TR: [0, th], TL: [th, 180], BL: [180, 180 + th], BR: [180 + th, 360] }[POS[(pr.j - 1) % 4]];
        return close(angleAt([0, 0], ray(rays[0]), ray(rays[1])), q.answer, 1e-6);
      }
      if (pr.kind === 'vertical-alg') { const e1 = pr.a * q.answer + pr.b, e2 = pr.c * q.answer + pr.d; return pr.linear ? e1 + e2 === 180 : e1 === e2; }
      if (pr.kind === 'triangle') return pr.A1 + pr.B1 + q.answer === 180;
      if (pr.kind === 'exterior') return pr.A1 + q.answer + (180 - pr.ext) === 180;      // the interior angle at R completes the triangle
      // exterior angles of any polygon add to 360°
      return pr.each ? close(180 - q.answer, 360 / pr.n) : close(q.answer, pr.n * 180 - 360);
    },
  });

  /* ---------- Unit 4: Similarity ---------- */
  const SIM_CHOICES = ['Yes, they are similar by AA.', 'No, their angles do not all match.', 'You cannot tell without the sides.'];
  A.skill({
    id: 'geo.similar-triangles', title: 'Similar triangles',
    learn: p('Similar figures have the same shape but not necessarily the same size: <b>corresponding angles are equal and corresponding sides are in proportion</b>. The constant ratio is the <b>scale factor</b>.') +
      p(`If △${V('ABC')} ~ △${V('DEF')}, the order of the letters tells you which parts correspond: ${V('A')} ↔ ${V('D')}, ${V('B')} ↔ ${V('E')}, ${V('C')} ↔ ${V('F')}, so ${F(V('DE'), V('AB'))} = ${F(V('EF'), V('BC'))} = ${F(V('FD'), V('CA'))}.`) +
      p('<b>AA similarity</b>: if two angles of one triangle equal two angles of another, the triangles are similar (the third angles must match too, since each set adds to 180°).') +
      example('Example', `${big(`△${V('ABC')} ~ △${V('DEF')}, ${V('AB')} = 6, ${V('BC')} = 9, ${V('DE')} = 10`)}The scale factor is 10 ÷ 6 = ${F(5, 3)}, so ${V('EF')} = 9 × ${F(5, 3)} = <b>15</b>.`),
    make(rng) {
      const form = rng.pick(['side', 'side', 'factor', 'aa']);
      if (form === 'aa') {
        const a = rng.int(30, 80), b = rng.int(30, 80), c = 180 - a - b;
        const sim = rng.bool();
        const drift = rng.pick([-8, -5, 5, 8]);
        // the second triangle is listed with one angle that is the third angle of the first, when similar
        const giveThird = rng.bool();
        const d1 = a, d2 = giveThird ? c : b;
        let e2 = sim ? d2 : d2 + drift;
        while (!sim && (e2 === b || e2 === c)) e2 += 3;          // a drifted angle must not land on a real match
        const ans = sim ? SIM_CHOICES[0] : SIM_CHOICES[1];
        const otherThird = 180 - d1 - e2;
        return { prompt: `In △${V('ABC')}, ∠${V('A')} = ${M.deg(a)} and ∠${V('B')} = ${M.deg(b)}. In △${V('DEF')}, ∠${V('D')} = ${M.deg(d1)} and ∠${V('E')} = ${M.deg(e2)}. Are the triangles similar?`, type: 'choice', choices: SIM_CHOICES.slice(), keepOrder: true, answer: ans, params: { form, a, b, d1, e2 },
          hints: [`Find the third angle of each triangle: ∠${V('C')} = 180° − ${M.deg(a)} − ${M.deg(b)} = ${M.deg(c)}, and ∠${V('F')} = 180° − ${M.deg(d1)} − ${M.deg(e2)} = ${M.deg(otherThird)}.`, `Compare the angle sets: {${[a, b, c].sort((x, y) => x - y).join('°, ')}°} and {${[d1, e2, otherThird].sort((x, y) => x - y).join('°, ')}°}.`, `<b>${ans}</b>`] };
      }
      const kk = rng.pick([[2, 1], [3, 1], [3, 2], [5, 2], [4, 3], [1, 2], [2, 3], [5, 3]]), k = kk[0] / kk[1];
      const ab = rng.int(2, 6) * kk[1], bc = rng.int(2, 7) * kk[1];
      const de = ab * k, ef = bc * k;
      if (form === 'factor') return { prompt: `△${V('ABC')} ~ △${V('DEF')}, with ${V('AB')} = ${N(ab)} and ${V('DE')} = ${N(de)}. What is the scale factor from △${V('ABC')} to △${V('DEF')}? (Enter a fraction or a decimal.)`, type: 'number', answer: k, answerText: M.fracText(kk[0], kk[1]), params: { form, ab, de },
        hints: [`${V('AB')} and ${V('DE')} correspond, because ${V('A')} ↔ ${V('D')} and ${V('B')} ↔ ${V('E')}.`, `The scale factor from the first triangle to the second is ${F(V('DE'), V('AB'))} = ${F(de, ab, { raw: true })}.`, `That simplifies to <b>${M.fracText(kk[0], kk[1])}</b>.`] };
      const back = rng.bool();          // find a side of the first triangle instead
      const name = rng.pick(NAMES);
      const pre = `${name} knows △${V('ABC')} ~ △${V('DEF')}, with ${V('AB')} = ${N(ab)} and ${V('DE')} = ${N(de)}.`;
      if (back) return { prompt: `${pre} If ${V('EF')} = ${N(ef)}, what is ${V('BC')}?`, type: 'number', answer: bc, params: { form, ab, de, known: ef, back },
        hints: [`${V('BC')} corresponds to ${V('EF')}. Set up ${F(V('BC'), V('EF'))} = ${F(V('AB'), V('DE'))}.`, `${V('BC')} = ${N(ef)} × ${F(ab, de, { raw: true })}.`, `${V('BC')} = <b>${N(bc)}</b>.`] };
      return { prompt: `${pre} If ${V('BC')} = ${N(bc)}, what is ${V('EF')}?`, type: 'number', answer: ef, params: { form, ab, de, known: bc, back },
        hints: [`${V('EF')} corresponds to ${V('BC')}. The scale factor is ${F(V('DE'), V('AB'))} = ${F(de, ab, { raw: true })} = ${M.fracText(kk[0], kk[1])}.`, `${V('EF')} = ${N(bc)} × ${M.fracText(kk[0], kk[1])}.`, `${V('EF')} = <b>${N(ef)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'aa') {
        const s1 = [pr.a, pr.b, 180 - pr.a - pr.b].sort((x, y) => x - y), s2 = [pr.d1, pr.e2, 180 - pr.d1 - pr.e2].sort((x, y) => x - y);
        return q.answer === (s1.every((v, i) => v === s2[i]) ? SIM_CHOICES[0] : SIM_CHOICES[1]);
      }
      if (pr.form === 'factor') return close(q.answer * pr.ab, pr.de);
      return pr.back ? close(q.answer * pr.de, pr.known * pr.ab) : close(q.answer * pr.ab, pr.known * pr.de);      // cross-multiplied proportion
    },
  });

  function proportionFig(t, labels) {
    const Ap = [110, 15], B = [20, 165], C = [210, 165];
    const D = [Ap[0] + t * (B[0] - Ap[0]), Ap[1] + t * (B[1] - Ap[1])], E = [Ap[0] + t * (C[0] - Ap[0]), Ap[1] + t * (C[1] - Ap[1])];
    const mid = (P, Q, dx, dy) => [((P[0] + Q[0]) / 2 + dx).toFixed(1), ((P[1] + Q[1]) / 2 + dy).toFixed(1)];
    const txt = (xy, s, anchor) => `<text x="${xy[0]}" y="${xy[1]}" font-size="11" text-anchor="${anchor || 'middle'}" fill="currentColor">${s}</text>`;
    let g = `<polygon points="${Ap} ${B} ${C}" fill="none" stroke="currentColor" stroke-width="1.6"/><line x1="${D[0]}" y1="${D[1]}" x2="${E[0]}" y2="${E[1]}" stroke="currentColor" stroke-width="1.6"/>`;
    const lab = (P, s, dx, dy) => `<text x="${P[0] + dx}" y="${P[1] + dy}" font-size="12" font-weight="700" text-anchor="middle" fill="currentColor">${s}</text>`;
    g += lab(Ap, 'A', 0, -3) + lab(B, 'B', -8, 6) + lab(C, 'C', 8, 6) + lab(D, 'D', -10, 2) + lab(E, 'E', 10, 2);
    if (labels.AD) g += txt(mid(Ap, D, -12, 2), labels.AD, 'end');
    if (labels.DB) g += txt(mid(D, B, -12, 2), labels.DB, 'end');
    if (labels.AE) g += txt(mid(Ap, E, 12, 2), labels.AE, 'start');
    if (labels.EC) g += txt(mid(E, C, 12, 2), labels.EC, 'start');
    if (labels.DE) g += txt(mid(D, E, 0, -4), labels.DE);
    if (labels.BC) g += txt(mid(B, C, 0, 14), labels.BC);
    return `<svg class="figure" viewBox="-10 0 250 190" width="250" height="190" role="img" aria-label="triangle ABC with segment DE parallel to BC">${g}</svg>`;
  }
  A.skill({
    id: 'geo.triangle-proportionality', title: 'Triangle proportionality theorem',
    learn: p(`<b>Triangle proportionality theorem</b>: if a line parallel to one side of a triangle crosses the other two sides, it divides them in the same ratio. With ${V('DE')} ∥ ${V('BC')} in △${V('ABC')}, <b>${F(V('AD'), V('DB'))} = ${F(V('AE'), V('EC'))}</b>.`) +
      p(`The small triangle △${V('ADE')} is similar to △${V('ABC')} (they share ∠${V('A')}, and the parallel lines make corresponding angles equal), so the parallel segments compare like whole sides: ${F(V('DE'), V('BC'))} = ${F(V('AD'), V('AB'))}. Note that this uses the whole side ${V('AB')}, not the piece ${V('DB')}.`) +
      p('Set up the proportion, cross-multiply, and solve.') +
      example('Example', `${big(`${V('AD')} = 4, ${V('DB')} = 6, ${V('AE')} = 6, ${V('EC')} = ?`)}${F(4, 6, { raw: true })} = ${F(6, V('EC'))}, so 4 · ${V('EC')} = 36 and ${V('EC')} = <b>9</b>.`),
    make(rng) {
      const pq = rng.pick([[1, 2], [2, 3], [3, 4], [1, 3], [2, 1], [3, 2], [3, 5], [4, 3]]), [pp, qq] = pq;
      const s1 = rng.int(1, 4), s2 = rng.int(1, 4);
      let s = { AD: pp * s1, DB: qq * s1, AE: pp * s2, EC: qq * s2 };
      if (s1 === s2) s = { AD: pp * s1, DB: qq * s1, AE: pp * (s1 + 1), EC: qq * (s1 + 1) };
      const t = pp / (pp + qq);
      if (rng.chance(0.3)) {
        const bc = (pp + qq) * rng.int(2, 5), de = bc * t;
        const labels = { AD: N(s.AD), DB: N(s.DB), BC: N(bc), DE: '?' };
        return { prompt: `In △${V('ABC')}, ${V('DE')} ∥ ${V('BC')}. ${V('AD')} = ${N(s.AD)}, ${V('DB')} = ${N(s.DB)} and ${V('BC')} = ${N(bc)}. What is ${V('DE')}?${proportionFig(t, labels)}`, type: 'number', answer: de, params: { ask: 'DE', AD: s.AD, DB: s.DB, BC: bc },
          hints: [`△${V('ADE')} ~ △${V('ABC')}, so ${F(V('DE'), V('BC'))} = ${F(V('AD'), V('AB'))}.`, `${V('AB')} = ${N(s.AD)} + ${N(s.DB)} = ${N(s.AD + s.DB)}, so ${V('DE')} = ${N(bc)} × ${F(s.AD, s.AD + s.DB, { raw: true })}.`, `${V('DE')} = <b>${N(de)}</b>.`] };
      }
      const ask = rng.pick(['AD', 'DB', 'AE', 'EC']);
      const labels = {}; ['AD', 'DB', 'AE', 'EC'].forEach(k => { labels[k] = k === ask ? '?' : N(s[k]); });
      const known = ['AD', 'DB', 'AE', 'EC'].filter(k => k !== ask).map(k => `${V(k)} = ${N(s[k])}`);
      const prop = `${F(V('AD'), V('DB'))} = ${F(V('AE'), V('EC'))}`;
      const sub = `${F(labels.AD === '?' ? V('x') : labels.AD, labels.DB === '?' ? V('x') : labels.DB)} = ${F(labels.AE === '?' ? V('x') : labels.AE, labels.EC === '?' ? V('x') : labels.EC)}`;
      return { prompt: `In △${V('ABC')}, ${V('DE')} ∥ ${V('BC')}. ${M.list(known)}. What is ${V(ask)}?${proportionFig(t, labels)}`, type: 'number', answer: s[ask], params: Object.assign({ ask }, s, { [ask]: null }),
        hints: [`Because ${V('DE')} ∥ ${V('BC')}, the sides are cut in the same ratio: ${prop}.`, `Substitute, calling the unknown ${X}: ${sub}.`, `Cross-multiply and solve: ${V(ask)} = <b>${N(s[ask])}</b>.`] };
    },
    verify(q) {
      const pr = Object.assign({}, q.params);
      if (pr.ask === 'DE') return close(q.answer * (pr.AD + pr.DB), pr.BC * pr.AD);
      pr[pr.ask] = q.answer;
      return close(pr.AD * pr.EC, pr.DB * pr.AE);
    },
  });

  /* ---------- Unit 5: Right triangles & trigonometry ---------- */
  const rad = (c, r) => r === 1 ? N(c) : `${c === 1 ? '' : N(c)}√${r}`;
  const radVal = s => { const m = A.stripTags(s).trim().match(/^(\d*)(?:√(\d+))?$/); return (m[1] === '' ? 1 : Number(m[1])) * (m[2] ? Math.sqrt(Number(m[2])) : 1); };
  const radChoices = (ans, wrongs) => { const out = [rad(...ans)]; wrongs.forEach(w => { const t = rad(...w); if (!out.includes(t) && out.length < 4) out.push(t); }); return out; };
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  A.skill({
    id: 'geo.pythagorean-special', title: 'Pythagorean theorem and special right triangles',
    learn: p(`In a right triangle with legs ${V('a')} and ${V('b')} and hypotenuse ${V('c')} (the side opposite the right angle), <b>${V('a')}² + ${V('b')}² = ${V('c')}²</b>. To find a leg, subtract: ${V('a')}² = ${V('c')}² − ${V('b')}².`) +
      p(`Two right triangles come up so often that their side ratios are worth memorizing. A <b>45°-45°-90°</b> triangle has sides in the ratio <b>1 : 1 : √2</b>, so the hypotenuse is a leg times √2. A <b>30°-60°-90°</b> triangle has sides <b>1 : √3 : 2</b>: the hypotenuse is twice the short leg (opposite 30°), and the long leg is the short leg times √3.`) +
      example('Example', `${big('A 30°-60°-90° triangle has hypotenuse 14.')}The short leg is half of it, <b>7</b>, and the long leg is <b>7√3</b>.`),
    make(rng) {
      const form = rng.pick(['hyp', 'leg', 'round', '45', '30', '30']);
      if (form === 'hyp' || form === 'leg') {
        const t = rng.pick(TRIPLES), s = t[2] > 20 ? 1 : rng.int(1, 3);
        const [a, b, c] = t.map(x => x * s);
        if (form === 'hyp') return { prompt: `A right triangle has legs ${N(a)} and ${N(b)}. How long is the hypotenuse?`, type: 'number', answer: c, params: { form, a, b },
          hints: [`${V('c')}² = ${N(a)}² + ${N(b)}² = ${N(a * a)} + ${N(b * b)} = ${N(c * c)}.`, `${V('c')} = ${M.sqrt(N(c * c))} = <b>${N(c)}</b>.`] };
        return { prompt: `A right triangle has hypotenuse ${N(c)} and one leg ${N(a)}. How long is the other leg?`, type: 'number', answer: b, params: { form, a, c },
          hints: [`The hypotenuse is the longest side, so subtract: ${V('b')}² = ${N(c)}² − ${N(a)}².`, `${N(c * c)} − ${N(a * a)} = ${N(b * b)}.`, `${V('b')} = ${M.sqrt(N(b * b))} = <b>${N(b)}</b>.`] };
      }
      if (form === 'round') {
        let a = rng.int(2, 15), b = rng.int(2, 15);
        while (Number.isInteger(Math.sqrt(a * a + b * b))) b++;
        const ans = M.round(Math.sqrt(a * a + b * b), 1);
        return { prompt: `A right triangle has legs ${N(a)} and ${N(b)}. How long is the hypotenuse? Round to the nearest tenth.`, type: 'number', answer: ans, tolerance: 0.05, params: { form, a, b },
          hints: [`${V('c')}² = ${N(a)}² + ${N(b)}² = ${N(a * a)} + ${N(b * b)} = ${N(a * a + b * b)}.`, `${V('c')} = ${M.sqrt(N(a * a + b * b))} ≈ ${N(M.round(Math.sqrt(a * a + b * b), 4))}.`, `Rounded: <b>${N(ans)}</b>.`] };
      }
      const s = rng.int(2, 12);
      if (form === '45') {
        if (rng.bool()) return { prompt: `A 45°-45°-90° triangle has legs of length ${N(s)}. How long is the hypotenuse?`, type: 'choice', choices: radChoices([s, 2], [[s, 3], [2 * s, 1], [2 * s, 2]]), answer: rad(s, 2), params: { form, s, ask: 'hyp' },
          hints: ['The sides of a 45°-45°-90° triangle are in the ratio 1 : 1 : √2.', `Hypotenuse = leg × √2 = <b>${rad(s, 2)}</b>.`] };
        const h = 2 * s;
        return { prompt: `A 45°-45°-90° triangle has hypotenuse ${N(h)}. How long is each leg?`, type: 'choice', choices: radChoices([s, 2], [[s, 1], [h, 2], [s, 3]]), answer: rad(s, 2), params: { form, h, ask: 'leg' },
          hints: [`Leg = hypotenuse ÷ √2 = ${F(N(h), '√2')}.`, `Multiply top and bottom by √2: ${F(N(h) + '√2', '2')} = ${rad(s, 2)}.`, `Each leg is <b>${rad(s, 2)}</b>.`] };
      }
      const ask = rng.pick(['long', 'hyp', 'long-from-hyp']);
      if (ask === 'long') return { prompt: `In a 30°-60°-90° triangle the shorter leg is ${N(s)}. How long is the longer leg?`, type: 'choice', choices: radChoices([s, 3], [[s, 2], [2 * s, 1], [2 * s, 3]]), answer: rad(s, 3), params: { form, s, ask },
        hints: ['The sides are in the ratio 1 : √3 : 2 (short leg : long leg : hypotenuse).', `Long leg = short leg × √3 = <b>${rad(s, 3)}</b>.`] };
      if (ask === 'hyp') return { prompt: `In a 30°-60°-90° triangle the longer leg is ${rad(s, 3)}. How long is the hypotenuse?`, type: 'number', answer: 2 * s, params: { form, s, ask },
        hints: [`The long leg is the short leg times √3, so the short leg is ${N(s)}.`, `The hypotenuse is twice the short leg: 2 × ${N(s)} = <b>${N(2 * s)}</b>.`] };
      return { prompt: `In a 30°-60°-90° triangle the hypotenuse is ${N(2 * s)}. How long is the longer leg?`, type: 'choice', choices: radChoices([s, 3], [[2 * s, 3], [s, 2], [s, 1]]), answer: rad(s, 3), params: { form, s, ask },
        hints: [`The short leg is half the hypotenuse: ${N(2 * s)} ÷ 2 = ${N(s)}.`, `The long leg is the short leg times √3: <b>${rad(s, 3)}</b>.`] };
    },
    verify(q) {
      const pr = q.params, val = typeof q.answer === 'number' ? q.answer : radVal(q.answer);
      if (pr.form === 'hyp' || pr.form === 'round') return close(val, Math.hypot(pr.a, pr.b), 0.051);
      if (pr.form === 'leg') return pr.a * pr.a + val * val === pr.c * pr.c;
      if (pr.form === '45') return pr.ask === 'hyp' ? close(val * Math.sin(deg2rad(45)), pr.s, 1e-9) : close(Math.hypot(val, val), pr.h, 1e-9);
      if (pr.ask === 'hyp') return close(val * Math.sin(deg2rad(60)), pr.s * Math.sqrt(3), 1e-9);    // long leg = hyp · sin 60°
      return close(val, pr.s * Math.tan(deg2rad(60)), 1e-9);
    },
  });

  /** right triangle with the right angle at C; a = BC (opposite A), b = AC, c = AB; labels can be text or '?' */
  function rightTriFig(a, b, lab, angleA) {
    const sc = Math.min(150 / b, 110 / a);
    const C = [35, 140], Ap = [35 + b * sc, 140], B = [35, 140 - a * sc];
    const t = (x, y, s, anc) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="12" text-anchor="${anc || 'middle'}" fill="currentColor">${s}</text>`;
    let g = `<polygon points="${C} ${Ap} ${B}" fill="none" stroke="currentColor" stroke-width="1.6"/><polyline points="${C[0] + 10},${C[1]} ${C[0] + 10},${C[1] - 10} ${C[0]},${C[1] - 10}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    g += `<text x="${C[0] - 12}" y="${C[1] + 12}" font-size="12" font-weight="700" fill="currentColor">C</text><text x="${Ap[0] + 4}" y="${Ap[1] + 12}" font-size="12" font-weight="700" fill="currentColor">A</text><text x="${B[0] - 12}" y="${B[1] - 2}" font-size="12" font-weight="700" fill="currentColor">B</text>`;
    if (lab.a) g += t(C[0] - 6, (C[1] + B[1]) / 2 + 4, lab.a, 'end');
    if (lab.b) g += t((C[0] + Ap[0]) / 2, C[1] + 16, lab.b);
    if (lab.c) g += t((Ap[0] + B[0]) / 2 + 8, (Ap[1] + B[1]) / 2 - 6, lab.c, 'start');
    if (angleA) g += t(Ap[0] - 34, Ap[1] - 5, angleA, 'middle');
    return `<svg class="figure" viewBox="0 0 220 165" width="230" height="172" role="img" aria-label="right triangle ABC">${g}</svg>`;
  }
  A.skill({
    id: 'geo.trig-ratios', title: 'Sine, cosine, and tangent ratios',
    learn: p(`For an acute angle in a right triangle, name the sides from that angle's point of view: the <b>opposite</b> side, the <b>adjacent</b> side (the leg touching the angle), and the <b>hypotenuse</b>. Then <b>SOH CAH TOA</b>: sin = ${F('opposite', 'hypotenuse')}, cos = ${F('adjacent', 'hypotenuse')}, tan = ${F('opposite', 'adjacent')}.`) +
      p('The ratios depend only on the angle, not on the size of the triangle, because all right triangles with that angle are similar.') +
      p(`The two acute angles are complementary, and the side opposite one is adjacent to the other, so <b>sin ${V('x')}° = cos (90 − ${V('x')})°</b>.`) +
      example('Example', `${big(`Legs 5 and 12, hypotenuse 13; angle ${V('A')} is opposite the 5.`)}sin ${V('A')} = <b>${F(5, 13)}</b>, cos ${V('A')} = <b>${F(12, 13)}</b>, tan ${V('A')} = <b>${F(5, 12)}</b>.`),
    make(rng) {
      if (rng.chance(0.25)) {
        const x = rng.int(10, 80), fn = rng.pick(['sin', 'cos']), other = fn === 'sin' ? 'cos' : 'sin';
        return { prompt: `Fill in the blank with an angle between 0° and 90°.${big(`${fn} ${M.deg(x)} = ${other} ?`)}`, type: 'number', answer: 90 - x, unit: '°', params: { form: 'co', x, fn },
          hints: [`The acute angles of a right triangle add to 90°, and the side opposite one angle is adjacent to the other.`, `So ${fn} ${V('x')}° = ${other} (90 − ${V('x')})°.`, `90 − ${x} = <b>${90 - x}°</b>.`] };
      }
      const t = rng.pick(TRIPLES.slice(0, 5));
      const swap = rng.bool(), a = swap ? t[1] : t[0], b = swap ? t[0] : t[1], c = t[2];
      const at = rng.pick(['A', 'A', 'B']), fn = rng.pick(['sin', 'cos', 'tan']);
      const opp = at === 'A' ? a : b, adj = at === 'A' ? b : a;
      const [n, d] = fn === 'sin' ? [opp, c] : fn === 'cos' ? [adj, c] : [opp, adj];
      const word = { sin: ['opposite', 'hypotenuse'], cos: ['adjacent', 'hypotenuse'], tan: ['opposite', 'adjacent'] }[fn];
      return { prompt: `In right triangle ${V('ABC')}, ${V('BC')} = ${N(a)}, ${V('AC')} = ${N(b)} and ${V('AB')} = ${N(c)}. What is ${fn} ${V(at)}? Enter a fraction.${rightTriFig(a, b, { a: N(a), b: N(b), c: N(c) })}`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { form: 'ratio', a, b, c, at, fn },
        hints: [`From ∠${V(at)}: the opposite side is ${N(opp)}, the adjacent leg is ${N(adj)}, and the hypotenuse is ${N(c)}.`, `${fn} = ${F(word[0], word[1])} = ${F(n, d, { raw: true })}.`, `${fn} ${V(at)} = <b>${M.fracText(n, d)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'co') return close(pr.fn === 'sin' ? Math.sin(deg2rad(pr.x)) : Math.cos(deg2rad(pr.x)), pr.fn === 'sin' ? Math.cos(deg2rad(q.answer)) : Math.sin(deg2rad(q.answer)), 1e-12);
      const angA = Math.atan2(pr.a, pr.b), ang = pr.at === 'A' ? angA : Math.PI / 2 - angA;
      return close(Math[pr.fn](ang), q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'geo.solve-right-triangles', title: 'Solving right triangles',
    learn: p('To find a missing <b>side</b>: pick the ratio that links the angle you know, the side you know and the side you want, write it as an equation, and solve. If the unknown is on top, multiply; if it is on the bottom, divide.') +
      p(`To find a missing <b>angle</b>: pick the ratio that uses the two sides you know, then use the inverse function on a calculator: ${V('A')} = sin⁻¹(${F('opp', 'hyp')}), cos⁻¹(${F('adj', 'hyp')}) or tan⁻¹(${F('opp', 'adj')}).`) +
      p('Keep the calculator in degree mode and round only at the end.') +
      example('Example', `${big(`∠${V('A')} = 35°, hypotenuse ${V('AB')} = 10. Find the opposite side ${V('BC')}.`)}sin 35° = ${F(V('BC'), 10)}, so ${V('BC')} = 10 × sin 35° ≈ 10 × 0.5736 = <b>5.7</b>.`),
    make(rng) {
      const name = { opp: 'BC', adj: 'AC', hyp: 'AB' };
      if (rng.chance(0.4)) {
        const pair = rng.pick([['opp', 'adj'], ['opp', 'hyp'], ['adj', 'hyp']]);
        let s = { opp: rng.int(3, 15), adj: rng.int(3, 15) };
        if (pair[1] === 'hyp') { const hyp = rng.int(Math.max(s[pair[0]] + 1, 6), 20); s = { [pair[0]]: Math.min(s[pair[0]], hyp - 1), hyp }; }
        const fn = pair[1] === 'adj' ? 'tan' : pair[0] === 'opp' ? 'sin' : 'cos';
        const raw = rad2deg(fn === 'tan' ? Math.atan(s.opp / s.adj) : fn === 'sin' ? Math.asin(s.opp / s.hyp) : Math.acos(s.adj / s.hyp));
        const ans = M.round(raw, 1);
        const lab = { a: s.opp != null ? N(s.opp) : '', b: s.adj != null ? N(s.adj) : '', c: s.hyp != null ? N(s.hyp) : '' };
        const [aa, bb] = s.hyp ? (s.opp != null ? [s.opp, Math.sqrt(s.hyp * s.hyp - s.opp * s.opp)] : [Math.sqrt(s.hyp * s.hyp - s.adj * s.adj), s.adj]) : [s.opp, s.adj];
        const known = pair.map(k => `${V(name[k])} = ${N(s[k])}`).join(' and ');
        return { prompt: `In right triangle ${V('ABC')} with the right angle at ${V('C')}, ${known}. Find ∠${V('A')} to the nearest tenth of a degree.${rightTriFig(aa, bb, lab, '?')}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { form: 'angle', s, fn },
          hints: [`From ∠${V('A')}, you know the ${pair[0] === 'opp' ? 'opposite' : 'adjacent'} side and the ${pair[1] === 'hyp' ? 'hypotenuse' : 'adjacent side'}, so use ${fn}.`, `${fn} ${V('A')} = ${F(N(s[pair[0]]), N(s[pair[1]]))}, so ${V('A')} = ${fn}⁻¹(${F(N(s[pair[0]]), N(s[pair[1]]))}) ≈ ${N(M.round(raw, 3))}°.`, `∠${V('A')} ≈ <b>${N(ans)}°</b>.`] };
      }
      const A0 = rng.int(20, 70);
      const know = rng.pick(['opp', 'adj', 'hyp']), want = rng.pick(['opp', 'adj', 'hyp'].filter(k => k !== know));
      const val = rng.int(4, 20);
      const unit = { opp: Math.sin(deg2rad(A0)), adj: Math.cos(deg2rad(A0)), hyp: 1 };
      const pairFn = { 'opp,hyp': 'sin', 'hyp,opp': 'sin', 'adj,hyp': 'cos', 'hyp,adj': 'cos', 'opp,adj': 'tan', 'adj,opp': 'tan' }[know + ',' + want];
      const top = pairFn === 'tan' ? 'opp' : pairFn === 'sin' ? 'opp' : 'adj', bottom = pairFn === 'tan' ? 'adj' : 'hyp';
      const ratio = Math[pairFn](deg2rad(A0));
      const raw = want === top ? val * ratio : val / ratio;
      const ans = M.round(raw, 1);
      const sides = { opp: unit.opp, adj: unit.adj };
      const lab = { a: '', b: '', c: '' }, key = { opp: 'a', adj: 'b', hyp: 'c' };
      lab[key[know]] = N(val); lab[key[want]] = '?';
      return { prompt: `In right triangle ${V('ABC')} with the right angle at ${V('C')}, ∠${V('A')} = ${M.deg(A0)} and ${V(name[know])} = ${N(val)}. Find ${V(name[want])} to the nearest tenth.${rightTriFig(sides.opp, sides.adj, lab, M.deg(A0))}`, type: 'number', answer: ans, tolerance: 0.05, params: { form: 'side', A0, know, want, val },
        hints: [`From ∠${V('A')}, ${V(name[know])} is the ${{ opp: 'opposite side', adj: 'adjacent side', hyp: 'hypotenuse' }[know]} and ${V(name[want])} is the ${{ opp: 'opposite side', adj: 'adjacent side', hyp: 'hypotenuse' }[want]}, so use ${pairFn}.`,
          `${pairFn} ${M.deg(A0)} = ${F(top === want ? V(name[want]) : N(val), bottom === want ? V(name[want]) : N(val))}, and ${pairFn} ${M.deg(A0)} ≈ ${N(M.round(ratio, 4))}.`,
          `${V(name[want])} = ${want === top ? `${N(val)} × ${pairFn} ${M.deg(A0)}` : `${N(val)} ÷ ${pairFn} ${M.deg(A0)}`} ≈ ${N(M.round(raw, 3))}.`, `${V(name[want])} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'angle') {
        const { s } = pr;
        const opp = s.opp != null ? s.opp : Math.sqrt(s.hyp * s.hyp - s.adj * s.adj), adj = s.adj != null ? s.adj : Math.sqrt(s.hyp * s.hyp - s.opp * s.opp);
        return close(rad2deg(Math.atan2(opp, adj)), q.answer, 0.051);
      }
      // scale the triangle with hypotenuse 1 until the known side matches
      const u = { opp: Math.sin(deg2rad(pr.A0)), adj: Math.sin(deg2rad(90 - pr.A0)), hyp: 1 };
      return close(u[pr.want] * pr.val / u[pr.know], q.answer, 0.051);
    },
  });

  /* ---------- Unit 6: Analytic geometry ---------- */
  A.skill({
    id: 'geo.distance-midpoint', title: 'Distance, midpoints, and dividing segments',
    learn: p(`The <b>distance</b> between (${V('x')}₁, ${V('y')}₁) and (${V('x')}₂, ${V('y')}₂) comes from the Pythagorean theorem: <b>${V('d')} = √((${V('x')}₂ − ${V('x')}₁)² + (${V('y')}₂ − ${V('y')}₁)²)</b>. The horizontal and vertical changes are the legs of a right triangle.`) +
      p(`The <b>midpoint</b> averages the coordinates: <b>(${F(V('x') + '₁ + ' + V('x') + '₂', 2)}, ${F(V('y') + '₁ + ' + V('y') + '₂', 2)})</b>. To find a missing endpoint, go from the known endpoint to the midpoint, then the same again.`) +
      p(`To find the point that divides ${V('AB')} in the ratio ${V('m')} : ${V('n')}, start at ${V('A')} and go ${F(V('m'), V('m') + ' + ' + V('n'))} of the way to ${V('B')} in each coordinate.`) +
      example('Example', `${big(`${V('A')}(1, 2), ${V('B')}(7, 10)`)}Distance: the changes are 6 and 8, so ${V('d')} = √(36 + 64) = <b>10</b>. Midpoint: <b>(4, 6)</b>. The point dividing ${V('AB')} in the ratio 1 : 3 is ${F(1, 4)} of the way: (1 + 1.5, 2 + 2) = <b>(2.5, 4)</b>.`),
    make(rng) {
      const form = rng.pick(['dist', 'dist-round', 'mid', 'end', 'ratio']);
      const x1 = rng.int(-8, 8), y1 = rng.int(-8, 8);
      if (form === 'dist' || form === 'dist-round') {
        let dx, dy;
        if (form === 'dist') { const t = rng.pick([[3, 4], [6, 8], [5, 12], [8, 15], [9, 12]]); [dx, dy] = rng.bool() ? t : [t[1], t[0]]; }
        else { dx = rng.int(1, 9); dy = rng.int(1, 9); while (Number.isInteger(Math.hypot(dx, dy))) dy++; }
        dx *= rng.sign(); dy *= rng.sign();
        const x2 = x1 + dx, y2 = y1 + dy, d2 = dx * dx + dy * dy, ans = form === 'dist' ? Math.sqrt(d2) : M.round(Math.sqrt(d2), 1);
        return { prompt: `What is the distance between ${PT(x1, y1)} and ${PT(x2, y2)}?${form === 'dist' ? '' : ' Round to the nearest tenth.'}`, type: 'number', answer: ans, tolerance: form === 'dist' ? undefined : 0.05, params: { form, x1, y1, x2, y2 },
          hints: [`The horizontal change is ${N(x2)} − ${wrap(x1)} = ${N(dx)}; the vertical change is ${N(y2)} − ${wrap(y1)} = ${N(dy)}.`, `${V('d')} = √(${wrap(dx)}² + ${wrap(dy)}²) = √${N(d2)}.`, `${V('d')} ${form === 'dist' ? '=' : '≈'} <b>${N(ans)}</b>.`] };
      }
      const x2 = rng.int(-8, 8), y2 = rng.int(-8, 8);
      if (form === 'mid') {
        const xb = x2 === x1 ? x2 + 4 : x2, mx = (x1 + xb) / 2, my = (y1 + y2) / 2;
        const choices = ptChoices(rng, [mx, my], [[(xb - x1) / 2, (y2 - y1) / 2], [my, mx], [x1 + xb, y1 + y2], [mx, (y1 - y2) / 2]]);
        return { prompt: `What is the midpoint of the segment from ${PT(x1, y1)} to ${PT(xb, y2)}?`, type: 'choice', choices, answer: PT(mx, my), params: { form, x1, y1, x2: xb, y2 },
          hints: ['Average the ' + X + '-coordinates, then average the ' + Y + '-coordinates.', `(${N(x1)} + ${wrap(xb)}) ÷ 2 = ${N(mx)} and (${N(y1)} + ${wrap(y2)}) ÷ 2 = ${N(my)}.`, `The midpoint is <b>${PT(mx, my)}</b>.`] };
      }
      if (form === 'end') {
        const mx = x2 === x1 ? x1 + 3 : x2, my = y2, bx = 2 * mx - x1, by = 2 * my - y1;
        const choices = ptChoices(rng, [bx, by], [[(x1 + mx) / 2, (y1 + my) / 2], [2 * x1 - mx, 2 * y1 - my], [mx - x1, my - y1]]);
        return { prompt: `${V('M')}${PT(mx, my)} is the midpoint of ${V('AB')}, and ${V('A')} is ${PT(x1, y1)}. What are the coordinates of ${V('B')}?`, type: 'choice', choices, answer: PT(bx, by), params: { form, x1, y1, mx, my },
          hints: [`From ${V('A')} to ${V('M')} the coordinates change by ${N(mx - x1)} and ${N(my - y1)}.`, `${V('B')} is the same step again past ${V('M')}: (${N(mx)} ${M.signed(mx - x1)}, ${N(my)} ${M.signed(my - y1)}).`, `${V('B')} = <b>${PT(bx, by)}</b>.`] };
      }
      const [m, n] = rng.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4]]), s = m + n;
      const dx = rng.nz(-3, 3) * s, dy = rng.nz(-3, 3) * s, bx = x1 + dx, by = y1 + dy;
      const px = x1 + dx * m / s, py = y1 + dy * m / s;
      const choices = ptChoices(rng, [px, py], [[x1 + dx * n / s, y1 + dy * n / s], [x1 + dx / 2, y1 + dy / 2], [x1 + dx * m / s, y1 + dy * n / s]]);
      return { prompt: `Point ${V('P')} lies on ${V('AB')} and divides it in the ratio ${V('AP')} : ${V('PB')} = ${m} : ${n}. If ${V('A')} = ${PT(x1, y1)} and ${V('B')} = ${PT(bx, by)}, where is ${V('P')}?`, type: 'choice', choices, answer: PT(px, py), params: { form, x1, y1, bx, by, m, n },
        hints: [`${V('P')} is ${F(m, s, { raw: true })} of the way from ${V('A')} to ${V('B')}, since ${m} + ${n} = ${s}.`, `The total change is ${N(dx)} in ${X} and ${N(dy)} in ${Y}; ${F(m, s, { raw: true })} of that is ${N(dx * m / s)} and ${N(dy * m / s)}.`, `${V('P')} = (${N(x1)} ${M.signed(dx * m / s)}, ${N(y1)} ${M.signed(dy * m / s)}) = <b>${PT(px, py)}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form.startsWith('dist')) { const d = Math.sqrt((pr.x2 - pr.x1) ** 2 + (pr.y2 - pr.y1) ** 2); return close(d, q.answer, pr.form === 'dist' ? 1e-9 : 0.051); }
      const g = parsePt(q.answer);
      const cross = (P, Q, R) => (Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0]);
      if (pr.form === 'mid') { const Ap = [pr.x1, pr.y1], B = [pr.x2, pr.y2]; return close(dist(Ap, g), dist(g, B)) && close(cross(Ap, B, g), 0); }
      if (pr.form === 'end') return close((pr.x1 + g[0]) / 2, pr.mx) && close((pr.y1 + g[1]) / 2, pr.my);
      const Ap = [pr.x1, pr.y1], B = [pr.bx, pr.by];
      return close(cross(Ap, B, g), 0) && close(dist(Ap, g) * pr.n, dist(g, B) * pr.m) && close(dist(Ap, g) + dist(g, B), dist(Ap, B));
    },
  });

  /** slope as text: an integer, or a fraction with the sign in front */
  const slopeHTML = (n, d) => { [n, d] = M.simp(n, d); return d === 1 ? N(n) : (n < 0 ? '−' : '') + F(Math.abs(n), d); };
  function lineText(n, d, b) {
    [n, d] = M.simp(n, d);
    const mx = d === 1 ? M.term(n, 'x') : (n < 0 ? '−' : '') + F(Math.abs(n), d) + X;
    return `${Y} = ${mx}${b ? ' ' + M.signed(b) : ''}`;
  }
  const PP_CHOICES = ['Parallel', 'Perpendicular', 'Neither'];
  A.skill({
    id: 'geo.parallel-perpendicular', title: 'Parallel and perpendicular lines',
    learn: p(`<b>Parallel lines have equal slopes.</b> (Different ${V('y')}-intercepts, or they would be the same line.)`) +
      p(`<b>Perpendicular lines have slopes that are opposite reciprocals</b>: flip the fraction and change its sign. The product of the two slopes is −1. A line with slope ${F(2, 3)} is perpendicular to any line with slope −${F(3, 2)}.`) +
      p(`To write the equation of a line through a point, use the slope you need in ${Y} = ${V('m')}${X} + ${V('b')}, substitute the point, and solve for ${V('b')}.`) +
      example('Example', `${big(`Through (4, 1), perpendicular to ${Y} = 2${X} + 5`)}The new slope is −${F(1, 2)}. Then 1 = −${F(1, 2)}(4) + ${V('b')}, so ${V('b')} = 3: <b>${Y} = −${F(1, 2)}${X} + 3</b>.`),
    make(rng) {
      let [n, d] = rng.pick([[1, 2], [2, 3], [3, 4], [1, 3], [3, 2], [2, 1], [3, 1], [4, 3], [2, 5], [5, 2], [1, 4]]);
      if (rng.bool()) n = -n;
      const form = rng.pick(['classify', 'classify', 'slope', 'equation']);
      const perp = [-d, n].map(Number); const [pn, pd] = M.simp(perp[0], perp[1]);
      if (form === 'classify') {
        const rel = rng.pick(PP_CHOICES);
        let m2 = rel === 'Parallel' ? [n, d] : rel === 'Perpendicular' ? [pn, pd] : rng.pick([[d, n], [-n, d]]);
        const b1 = rng.nz(-6, 6); let b2 = rng.nz(-6, 6); if (b2 === b1) b2 = -b1;
        const two = rng.bool();
        let line2;
        if (two) { const x0 = rng.int(-4, 4); let y0 = rng.int(-5, 5); if (y0 === n * x0 / d + b1) y0 += 1;      // never the same line
          const k = rng.pick([1, 2]), [sn, sd] = M.simp(m2[0], m2[1]); line2 = `the line through ${PT(x0, y0)} and ${PT(x0 + sd * k, y0 + sn * k)}`; m2 = [sn * k, sd * k]; }
        else line2 = `${lineText(m2[0], m2[1], b2)}`;
        return { prompt: `How are these two lines related?${big(`${lineText(n, d, b1)}<br>${two ? '' : line2}`)}${two ? `The second line is ${line2}.` : ''}`, type: 'choice', choices: PP_CHOICES.slice(), keepOrder: true, answer: rel, params: { form, n, d, m2 },
          hints: [`The first slope is ${slopeHTML(n, d)}.${two ? ` The second is rise over run: ${F(N(m2[0]), N(m2[1]))} = ${slopeHTML(m2[0], m2[1])}.` : ` The second slope is ${slopeHTML(m2[0], m2[1])}.`}`, 'Equal slopes mean parallel; slopes that multiply to −1 mean perpendicular.', `<b>${rel}</b>.`] };
      }
      if (form === 'slope') {
        const x0 = rng.int(-5, 5), y0 = rng.int(-5, 5), k = rng.pick([1, 2]);
        const P = [x0, y0], Q = [x0 + d * k, y0 + n * k];
        return { prompt: `A line passes through ${PT(...P)} and ${PT(...Q)}. What is the slope of a line perpendicular to it? (Enter a fraction or an integer.)`, type: 'number', answer: pn / pd, answerText: M.fracText(pn, pd), params: { form, P, Q },
          hints: [`Slope = ${F('rise', 'run')} = ${F(N(Q[1] - P[1]), N(Q[0] - P[0]))} = ${slopeHTML(n, d)}.`, 'A perpendicular slope is the opposite reciprocal: flip it and change the sign.', `The perpendicular slope is <b>${M.fracText(pn, pd)}</b>.`] };
      }
      const want = rng.pick(['parallel', 'perpendicular']);
      const [sn, sd] = want === 'parallel' ? M.simp(n, d) : [pn, pd];
      const b0 = rng.nz(-6, 6), x0 = rng.nz(-2, 2) * sd, y0 = rng.int(-6, 6);
      const B = y0 - sn * x0 / sd;
      const [wn, wd] = want === 'parallel' ? [pn, pd] : M.simp(n, d);
      const cand = [lineText(sn, sd, B), lineText(wn, wd, y0 - wn * x0 / wd), lineText(sn, sd, b0 === B ? B + 2 : b0), lineText(sn, sd, y0 + sn * x0 / sd === B ? B - 3 : y0 + sn * x0 / sd)];
      const choices = [...new Set(cand)];
      for (let extra = 1; choices.length < 4; extra++) { const t = lineText(-sn, sd, B + extra); if (!choices.includes(t)) choices.push(t); }
      return { prompt: `Which line passes through ${PT(x0, y0)} and is ${want} to ${lineText(n, d, b0)}?`, type: 'choice', choices, answer: cand[0], params: { form, n, d, want, x0, y0, ans: [sn, sd, B] },
        hints: [want === 'parallel' ? `A parallel line has the same slope, ${slopeHTML(n, d)}.` : `A perpendicular line has the opposite reciprocal slope: ${slopeHTML(sn, sd)}.`, `Substitute the point: ${N(y0)} = ${slopeHTML(sn, sd)} × ${wrap(x0)} + ${V('b')}, so ${V('b')} = ${N(B)}.`, `<b>${cand[0]}</b>.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'classify') {
        const u = [pr.d, pr.n], w = [pr.m2[1], pr.m2[0]];            // direction vectors (run, rise)
        const cr = u[0] * w[1] - u[1] * w[0], dot = u[0] * w[0] + u[1] * w[1];
        return q.answer === (cr === 0 ? 'Parallel' : dot === 0 ? 'Perpendicular' : 'Neither');
      }
      if (pr.form === 'slope') { const m = (pr.Q[1] - pr.P[1]) / (pr.Q[0] - pr.P[0]); return close(q.answer * m, -1); }
      const [sn, sd, B] = pr.ans, s = sn / sd, m = pr.n / pr.d;
      const rightSlope = pr.want === 'parallel' ? close(s, m) : close(s * m, -1);
      return rightSlope && close(s * pr.x0 + B, pr.y0) && q.answer === lineText(sn, sd, B);
    },
  });

  /* ---------- Unit 7: Conic sections ---------- */
  const sq = (v, h) => h === 0 ? M.sup(V(v), 2) : `(${V(v)} ${M.signed(-h)})²`;
  const circText = (h, k, R) => `${sq('x', h)} + ${sq('y', k)} = ${N(R)}`;
  A.skill({
    id: 'geo.circle-equation', title: 'Equation of a circle',
    learn: p(`A circle is every point at distance ${V('r')} from its center (${V('h')}, ${V('k')}). Writing that distance with the distance formula and squaring gives the <b>standard form</b>: <b>(${X} − ${V('h')})² + (${Y} − ${V('k')})² = ${V('r')}²</b>.`) +
      p(`Watch the signs: the equation <i>subtracts</i> the center, so a center of (−2, 5) gives (${X} + 2)² + (${Y} − 5)². And the right-hand side is the radius <i>squared</i>.`) +
      p('If you are given a point on the circle instead of the radius, the squared distance from the center to that point is ' + V('r') + '².') +
      example('Example', `${big('Center (3, −1), radius 4')}<b>(${X} − 3)² + (${Y} + 1)² = 16</b>.`),
    make(rng) {
      const h = rng.nz(-7, 7), k = rng.nz(-7, 7);
      if (rng.chance(0.6)) {
        const r = rng.int(2, 9);
        const choices = [...new Set([circText(h, k, r * r), circText(-h, -k, r * r), circText(h, k, r), circText(k === h ? -k : k, h, r * r)])];
        [circText(h, -k, r * r), circText(-h, k, r * r)].forEach(c => { if (choices.length < 4 && !choices.includes(c)) choices.push(c); });
        return { prompt: `Which is the equation of the circle with center ${PT(h, k)} and radius ${r}?`, type: 'choice', choices, answer: choices[0], params: { h, k, r, ans: [h, k, r * r], pts: [[h + r, k], [h, k - r]] },
          hints: [`Standard form is (${X} − ${V('h')})² + (${Y} − ${V('k')})² = ${V('r')}² with ${V('h')} = ${N(h)} and ${V('k')} = ${N(k)}: subtracting a negative becomes adding.`, `The right side is ${r}² = ${r * r}.`, `<b>${choices[0]}</b>`] };
      }
      const dx = rng.nz(-6, 6), dy = rng.nz(-6, 6), px = h + dx, py = k + dy, R = dx * dx + dy * dy;
      const wrongR = Number.isInteger(Math.sqrt(R)) ? Math.sqrt(R) : Math.abs(dx) + Math.abs(dy);
      const cand = [circText(h, k, R), circText(-h, -k, R), circText(h, k, wrongR === R ? R + 1 : wrongR), circText(px, py, R)];
      const choices = [...new Set(cand)];
      [circText(h, -k, R), circText(-h, k, R)].forEach(c => { if (choices.length < 4 && !choices.includes(c)) choices.push(c); });
      return { prompt: `A circle has center ${PT(h, k)} and passes through ${PT(px, py)}. Which is its equation?`, type: 'choice', choices, answer: cand[0], params: { h, k, ans: [h, k, R], pts: [[px, py], [2 * h - px, 2 * k - py]] },
        hints: [`${V('r')}² is the squared distance from the center to the point: (${N(px)} − ${wrap(h)})² + (${N(py)} − ${wrap(k)})² = ${N(dx * dx)} + ${N(dy * dy)} = ${N(R)}.`, `Put the center in with the signs flipped: ${sq('x', h)} + ${sq('y', k)}.`, `<b>${cand[0]}</b>`] };
    },
    verify(q) {
      const { ans, pts } = q.params, [h, k, R] = ans;
      // known points on the circle satisfy the chosen equation, and the centre does not
      return q.answer === circText(h, k, R) && pts.every(([x, y]) => close((x - h) ** 2 + (y - k) ** 2, R)) && R > 0;
    },
  });

  function generalForm(D, E, Fc) {
    let s = `${M.sup(X, 2)} + ${M.sup(Y, 2)}`;
    if (D) s += ` ${M.signed(D)}${X}`;
    if (E) s += ` ${M.signed(E)}${Y}`;
    if (Fc) s += ` ${M.signed(Fc)}`;
    return s + ' = 0';
  }
  A.skill({
    id: 'geo.circle-center-radius', title: 'Center and radius of a circle',
    learn: p(`From standard form (${X} − ${V('h')})² + (${Y} − ${V('k')})² = ${V('r')}², read the center (${V('h')}, ${V('k')}) with the <b>signs flipped</b> from the parentheses, and take the <b>square root</b> of the right side for the radius.`) +
      p(`An equation like ${M.sup(X, 2)} + ${M.sup(Y, 2)} − 6${X} + 4${Y} − 12 = 0 is a circle in disguise. <b>Complete the square</b> in ${X} and in ${Y}: take half of each coefficient, square it, and add it to both sides.`) +
      example('Example', `${big(`${M.sup(X, 2)} + ${M.sup(Y, 2)} − 6${X} + 4${Y} − 12 = 0`)}(${M.sup(X, 2)} − 6${X} + 9) + (${M.sup(Y, 2)} + 4${Y} + 4) = 12 + 9 + 4, so (${X} − 3)² + (${Y} + 2)² = 25. Center <b>(3, −2)</b>, radius <b>5</b>.`),
    make(rng) {
      const h = rng.nz(-6, 6), k = rng.nz(-6, 6), r = rng.int(1, 9);
      const form = rng.pick(['std-r', 'gen-c', 'gen-r', 'gen-c']);
      if (form === 'std-r') {
        return { prompt: `What is the radius of this circle?${big(circText(h, k, r * r))}`, type: 'number', answer: r, params: { form, h, k, R: r * r },
          hints: [`The right side is ${V('r')}² = ${r * r}.`, `${V('r')} = ${M.sqrt(r * r)} = <b>${r}</b>.`] };
      }
      const D = -2 * h, E = -2 * k, Fc = h * h + k * k - r * r;
      const steps = [`Group and complete the square: half of ${N(D)} is ${N(-h)}, and ${wrap(-h)}² = ${N(h * h)}; half of ${N(E)} is ${N(-k)}, and ${wrap(-k)}² = ${N(k * k)}.`,
        `${sq('x', h)} + ${sq('y', k)} = ${N(-Fc)} + ${N(h * h)} + ${N(k * k)} = ${N(r * r)}.`];
      if (form === 'gen-r') return { prompt: `What is the radius of this circle?${big(generalForm(D, E, Fc))}`, type: 'number', answer: r, params: { form, D, E, Fc },
        hints: steps.concat([`The radius is ${M.sqrt(r * r)} = <b>${r}</b>.`]) };
      const choices = ptChoices(rng, [h, k], [[-h, -k], [D, E], [k, h], [h, -k]]);
      return { prompt: `What is the center of this circle?${big(generalForm(D, E, Fc))}`, type: 'choice', choices, answer: PT(h, k), params: { form, D, E, Fc },
        hints: steps.concat([`Read the center with the signs flipped: <b>${PT(h, k)}</b>.`]) };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'std-r') return q.answer > 0 && q.answer * q.answer === pr.R;
      const f = (x, y) => x * x + y * y + pr.D * x + pr.E * y + pr.Fc;
      if (pr.form === 'gen-r') {
        // the point one radius to the right of the centre must lie on the circle
        const c = [-pr.D / 2, -pr.E / 2];
        return close(f(c[0] + q.answer, c[1]), 0) && close(f(c[0], c[1] - q.answer), 0);
      }
      const [h, k] = parsePt(q.answer);
      // the centre is where the expression is smallest: f(h ± t, k) are equal for every t
      return [1, 2, 3].every(t => close(f(h + t, k), f(h - t, k)) && close(f(h, k + t), f(h, k - t))) && f(h, k) < 0;
    },
  });

  /* ---------- Unit 8: Circles ---------- */
  /** a set of π-multiple choices from [n, d] pairs, distinct after simplifying */
  function piChoices(pairs) {
    const out = [], seen = new Set();
    for (const [n, d] of pairs) {
      if (n <= 0) continue;
      const k = M.simp(n, d).join('/');
      if (!seen.has(k) && out.length < 4) { seen.add(k); out.push(piFrac(n, d)); }
    }
    for (let extra = 2; out.length < 4; extra++) { const [n, d] = pairs[0], k = M.simp(n * extra, d).join('/'); if (!seen.has(k)) { seen.add(k); out.push(piFrac(n * extra, d)); } }
    return out;
  }
  A.skill({
    id: 'geo.arc-sector', title: 'Arc length, sector area, and radians',
    learn: p(`A central angle of ${V('θ')}° takes the fraction ${F(V('θ'), 360)} of the whole circle, so it takes that fraction of the circumference and of the area: <b>arc length = ${F(V('θ'), 360)} × 2π${V('r')}</b> and <b>sector area = ${F(V('θ'), 360)} × π${V('r')}²</b>.`) +
      p(`<b>Radians</b> measure an angle by the arc it cuts off on a circle of radius 1. A full turn is 2π radians, so <b>180° = π radians</b>: multiply degrees by ${F('π', 180)} to get radians, and radians by ${F(180, 'π')} to get degrees. In radians the arc length is simply <b>${V('s')} = ${V('r')}${V('θ')}</b>.`) +
      p('Leave answers as a multiple of π when asked to, or use 3.14 for π and round to the hundredth.') +
      example('Example', `${big(`${V('r')} = 6, ${V('θ')} = 120°`)}${F(120, 360)} = ${F(1, 3)} of the circle. Arc length = ${F(1, 3)} × 12π = <b>4π</b>. Sector area = ${F(1, 3)} × 36π = <b>12π</b>. And 120° = 120 × ${F('π', 180)} = <b>${piFrac(2, 3)}</b> radians.`),
    make(rng) {
      const form = rng.pick(['arc-314', 'sector-314', 'arc-pi', 'sector-pi', 'to-rad', 'to-deg', 'rad-arc']);
      const th = rng.pick([30, 40, 45, 60, 72, 80, 90, 120, 135, 150, 210, 240, 270, 300]);
      const r = rng.int(2, 12), unit = rng.pick(['cm', 'm', 'in']);
      const [fn, fd] = M.simp(th, 360);
      const frac = `${F(th, 360, { raw: true })} = ${F(fn, fd)}`;
      if (form === 'arc-314' || form === 'sector-314') {
        const arc = form === 'arc-314', ans = M.round(arc ? th / 360 * 2 * 3.14 * r : th / 360 * 3.14 * r * r, 2);
        return { prompt: `A circle has radius ${N(r)} ${unit}. Find the ${arc ? 'length of the arc' : 'area of the sector'} cut off by a central angle of ${M.deg(th)}. Use 3.14 for π and round to the hundredth.`, type: 'number', answer: ans, unit: arc ? unit : unit + '²', tolerance: 0.05, params: { form, th, r },
          hints: [`The angle is ${frac} of the full circle.`, arc ? `The whole circumference is 2 × 3.14 × ${N(r)} = ${N(M.round(6.28 * r, 2))}.` : `The whole area is 3.14 × ${N(r)}² = ${N(M.round(3.14 * r * r, 2))}.`, `${F(fn, fd)} × ${N(M.round(arc ? 6.28 * r : 3.14 * r * r, 2))} ≈ <b>${N(ans)} ${arc ? unit : unit + '²'}</b>.`] };
      }
      if (form === 'arc-pi' || form === 'sector-pi') {
        const arc = form === 'arc-pi';
        const ans = arc ? [2 * r * th, 360] : [r * r * th, 360];
        const choices = piChoices(arc ? [ans, [r * r * th, 360], [r * th, 360], [2 * r * th, 180]] : [ans, [2 * r * th, 360], [r * r * th, 180], [r * th, 360]]);
        return { prompt: `A circle has radius ${N(r)}. What is the ${arc ? 'length of the arc' : 'area of the sector'} cut off by a central angle of ${M.deg(th)}? Give the answer in terms of π.`, type: 'choice', choices, answer: choices[0], params: { form, th, r, ans },
          hints: [`The angle is ${frac} of the full circle.`, arc ? `The whole circumference is 2π × ${N(r)} = ${piFrac(2 * r, 1)}.` : `The whole area is π × ${N(r)}² = ${piFrac(r * r, 1)}.`, `${F(fn, fd)} × ${piFrac(arc ? 2 * r : r * r, 1)} = <b>${choices[0]}</b>.`] };
      }
      if (form === 'to-rad') {
        const choices = piChoices([[th, 180], [th, 360], [180, th], [th, 90]]);
        return { prompt: `Convert ${M.deg(th)} to radians.`, type: 'choice', choices, answer: choices[0], params: { form, th, ans: [th, 180] },
          hints: [`Multiply by ${F('π', 180)}: ${th} × ${F('π', 180)} = ${F(th + 'π', 180)}.`, `Simplify the fraction ${F(th, 180, { raw: true })} = ${F(th, 180)}: <b>${choices[0]}</b>.`] };
      }
      const [rn, rd] = M.simp(th, 180);
      if (form === 'to-deg') return { prompt: `Convert ${piFrac(rn, rd)} radians to degrees.`, type: 'number', answer: th, unit: '°', params: { form, rn, rd },
        hints: [`π radians is 180°, so replace π with 180°.`, `${F(rn + ' × 180', rd)} = <b>${M.deg(th)}</b>.`] };
      const ans = [r * rn, rd];
      const choices = piChoices([ans, [r * r * rn, 2 * rd], [2 * r * rn, rd], [r * rn, 2 * rd]]);
      return { prompt: `A circle has radius ${N(r)} ${unit}. A central angle of ${piFrac(rn, rd)} radians cuts off an arc. How long is the arc?`, type: 'choice', choices, answer: choices[0], params: { form, th, r, ans },
        hints: [`In radians the arc length is ${V('s')} = ${V('r')}${V('θ')}.`, `${V('s')} = ${N(r)} × ${piFrac(rn, rd)} = <b>${choices[0]}</b> ${unit}.`] };
    },
    verify(q) {
      const pr = q.params;
      if (pr.form === 'arc-314') return close(pr.r * deg2rad(pr.th) * 3.14 / Math.PI, q.answer, 0.006);       // s = rθ with θ in radians
      if (pr.form === 'sector-314') return close(pr.r * pr.r * deg2rad(pr.th) / 2 * 3.14 / Math.PI, q.answer, 0.006);  // A = ½r²θ
      if (pr.form === 'to-deg') return close(rad2deg(pr.rn * Math.PI / pr.rd), q.answer, 1e-9);
      const val = pr.ans[0] / pr.ans[1] * Math.PI;
      const expect = pr.form === 'arc-pi' ? pr.r * deg2rad(pr.th) : pr.form === 'sector-pi' ? pr.r * pr.r * deg2rad(pr.th) / 2 : pr.form === 'to-rad' ? deg2rad(pr.th) : pr.r * deg2rad(pr.th);
      return close(val, expect, 1e-9) && q.answer === piFrac(pr.ans[0], pr.ans[1]);
    },
  });

  A.skill({
    id: 'geo.inscribed-angles', title: 'Inscribed angles',
    learn: p('A <b>central angle</b> has its vertex at the center and equals its intercepted arc. An <b>inscribed angle</b> has its vertex on the circle, and <b>it is half the arc it intercepts</b> (so half the central angle on the same arc).') +
      p('Three consequences come up all the time: inscribed angles on the same arc are equal; an angle inscribed in a semicircle is a <b>right angle</b>; and in a quadrilateral inscribed in a circle, <b>opposite angles add to 180°</b>.') +
      example('Example', `${big('An inscribed angle intercepts an arc of 140°.')}It measures half the arc: 140° ÷ 2 = <b>70°</b>.`),
    make(rng) {
      const form = rng.pick(['from-arc', 'to-arc', 'central', 'semicircle', 'cyclic', 'same-arc']);
      if (form === 'semicircle') {
        const g = rng.int(20, 70);
        return { prompt: `Triangle ${V('ABC')} is inscribed in a circle, and ${V('AB')} is a diameter. If ∠${V('A')} = ${M.deg(g)}, what is ∠${V('B')}?`, type: 'number', answer: 90 - g, unit: '°', params: { form, g },
          hints: [`∠${V('C')} is inscribed in a semicircle, so it is 90°.`, `The angles of the triangle add to 180°: ∠${V('B')} = 180° − 90° − ${M.deg(g)}.`, `∠${V('B')} = <b>${M.deg(90 - g)}</b>.`] };
      }
      if (form === 'cyclic') {
        const g = rng.int(55, 125);
        return { prompt: `Quadrilateral ${V('ABCD')} is inscribed in a circle. If ∠${V('A')} = ${M.deg(g)}, what is ∠${V('C')}?`, type: 'number', answer: 180 - g, unit: '°', params: { form, g },
          hints: [`∠${V('A')} and ∠${V('C')} are opposite angles of an inscribed quadrilateral.`, 'Opposite angles of an inscribed quadrilateral add to 180°.', `∠${V('C')} = 180° − ${M.deg(g)} = <b>${M.deg(180 - g)}</b>.`] };
      }
      const arc = 2 * rng.int(20, 150);
      if (form === 'to-arc') return { prompt: `An inscribed angle measures ${M.deg(arc / 2)}. What is the measure of the arc it intercepts?`, type: 'number', answer: arc, unit: '°', params: { form, g: arc / 2 },
        hints: ['An inscribed angle is half its intercepted arc, so the arc is twice the angle.', `2 × ${M.deg(arc / 2)} = <b>${M.deg(arc)}</b>.`] };
      if (form === 'central') return { prompt: `Central angle ∠${V('AOB')} measures ${M.deg(arc)}. Point ${V('C')} is on the circle, on the other side from arc ${V('AB')}. What is ∠${V('ACB')}?`, type: 'number', answer: arc / 2, unit: '°', params: { form, arc },
        hints: [`The central angle equals arc ${V('AB')}, so the arc is ${M.deg(arc)}.`, `∠${V('ACB')} is inscribed on the same arc, so it is half: <b>${M.deg(arc / 2)}</b>.`] };
      if (form === 'same-arc') return { prompt: `Points ${V('C')} and ${V('D')} are on a circle, on the same side of chord ${V('AB')}. If ∠${V('ACB')} = ${M.deg(arc / 2)}, what is ∠${V('ADB')}?`, type: 'number', answer: arc / 2, unit: '°', params: { form, arc },
        hints: [`Both angles are inscribed and intercept the same arc ${V('AB')}.`, `Inscribed angles on the same arc are equal: ∠${V('ADB')} = <b>${M.deg(arc / 2)}</b>.`] };
      return { prompt: `An inscribed angle intercepts an arc of ${M.deg(arc)}. What is the measure of the angle?`, type: 'number', answer: arc / 2, unit: '°', params: { form, arc },
        hints: ['An inscribed angle is half the arc it intercepts.', `${M.deg(arc)} ÷ 2 = <b>${M.deg(arc / 2)}</b>.`] };
    },
    verify(q) {
      const pr = q.params, on = d => [Math.cos(deg2rad(d)), Math.sin(deg2rad(d))];
      // put the points on a unit circle and measure the angle
      if (pr.form === 'semicircle') { const Ap = on(180), B = on(0), C = on(2 * pr.g); return close(angleAt(Ap, B, C), pr.g, 1e-6) && close(angleAt(B, Ap, C), q.answer, 1e-6); }
      if (pr.form === 'cyclic') { const b1 = 20, b3 = 20 + 2 * pr.g, P = [on(0), on(b1), on((b1 + b3) / 2), on(b3)]; return close(angleAt(P[0], P[1], P[3]), pr.g, 1e-6) && close(angleAt(P[2], P[1], P[3]), q.answer, 1e-6); }
      const arc = pr.form === 'to-arc' ? q.answer : pr.arc;
      const Ap = on(0), B = on(arc), C = on((arc + 360) / 2), D = on(arc + (360 - arc) / 3);
      const ang = angleAt(C, Ap, B);
      if (pr.form === 'to-arc') return close(ang, pr.g, 1e-6);
      if (pr.form === 'same-arc') return close(angleAt(D, Ap, B), q.answer, 1e-6) && close(ang, q.answer, 1e-6);
      return close(ang, q.answer, 1e-6);
    },
  });

  /* ---------- Unit 9: Solid geometry ---------- */
  const r2 = x => M.round(x, 2);
  A.skill({
    id: 'geo.volume', title: 'Volume of solids',
    learn: p(`For a <b>prism or cylinder</b>, volume = base area × height: a box is ${V('l')}${V('w')}${V('h')}, a cylinder is π${V('r')}²${V('h')}. A <b>pyramid or cone</b> holds exactly <b>one third</b> of the prism or cylinder with the same base and height: ${F(1, 3)}${V('B')}${V('h')} and ${F(1, 3)}π${V('r')}²${V('h')}.`) +
      p(`A <b>sphere</b> has volume <b>${F(4, 3)}π${V('r')}³</b>. Volume is measured in cubic units.`) +
      p('Use 3.14 for π and round to the hundredth, unless the question asks for a multiple of π.') +
      example('Example', `${big(`A cone with radius 3 cm and height 4 cm`)}${F(1, 3)} × 3.14 × 3² × 4 = ${F(1, 3)} × 113.04 = <b>37.68 cm³</b>.`),
    make(rng) {
      const kind = rng.pick(['box', 'tri-prism', 'cylinder', 'pyramid', 'cone', 'sphere', 'sphere-pi', 'cone-pi']);
      const u = rng.pick(['cm', 'm', 'in', 'ft']), cu = u + '³', name = rng.pick(NAMES);
      const mk = (prompt, ans, hints, params, tol) => ({ prompt, type: 'number', answer: ans, unit: cu, tolerance: tol ? 0.05 : undefined, hints, params: Object.assign({ kind }, params) });
      if (kind === 'box') { const l = rng.int(2, 15), w = rng.int(2, 12), h = rng.int(2, 10); return mk(`${name} fills a box ${N(l)} ${u} long, ${N(w)} ${u} wide and ${N(h)} ${u} tall with sand. What volume of sand fits?`, l * w * h, [`Volume of a rectangular prism = ${V('l')} × ${V('w')} × ${V('h')}.`, `${N(l)} × ${N(w)} × ${N(h)} = <b>${N(l * w * h)} ${cu}</b>.`], { l, w, h }); }
      if (kind === 'tri-prism') { const b = 2 * rng.int(1, 7), t = rng.int(2, 10), L = rng.int(3, 15), ans = b * t / 2 * L; return mk(`A triangular prism has a triangular base with base ${N(b)} ${u} and height ${N(t)} ${u}. The prism is ${N(L)} ${u} long. What is its volume?`, ans, [`The base is a triangle: ${F(1, 2)} × ${N(b)} × ${N(t)} = ${N(b * t / 2)} ${u}².`, `Multiply by the length: ${N(b * t / 2)} × ${N(L)} = <b>${N(ans)} ${cu}</b>.`], { b, t, L }); }
      if (kind === 'pyramid') { const s = rng.int(2, 12), h = 3 * rng.int(1, 6), ans = s * s * h / 3; return mk(`A pyramid has a square base ${N(s)} ${u} on each side and a height of ${N(h)} ${u}. What is its volume?`, ans, [`The base area is ${N(s)}² = ${N(s * s)} ${u}².`, `A pyramid is one third of base × height: ${F(1, 3)} × ${N(s * s)} × ${N(h)}.`, `= <b>${N(ans)} ${cu}</b>.`], { s, h }); }
      const r = rng.int(2, 10), h = rng.int(2, 15);
      if (kind === 'cylinder') { const ans = r2(3.14 * r * r * h); return mk(`A cylindrical can has radius ${N(r)} ${u} and height ${N(h)} ${u}. What is its volume? Use 3.14 for π and round to the hundredth.`, ans, [`Volume = π${V('r')}²${V('h')}.`, `3.14 × ${N(r)}² × ${N(h)} = 3.14 × ${N(r * r)} × ${N(h)}.`, `= <b>${N(ans)} ${cu}</b>.`], { r, h }, true); }
      if (kind === 'cone') { const ans = r2(3.14 * r * r * h / 3); return mk(`A cone has radius ${N(r)} ${u} and height ${N(h)} ${u}. What is its volume? Use 3.14 for π and round to the hundredth.`, ans, [`Volume = ${F(1, 3)}π${V('r')}²${V('h')}, one third of the matching cylinder.`, `The cylinder would be 3.14 × ${N(r * r)} × ${N(h)} = ${N(r2(3.14 * r * r * h))}.`, `One third of that is <b>${N(ans)} ${cu}</b>.`], { r, h }, true); }
      if (kind === 'sphere') { const ans = r2(4 / 3 * 3.14 * r ** 3); return mk(`A ball has a radius of ${N(r)} ${u}. What is its volume? Use 3.14 for π and round to the hundredth.`, ans, [`Volume of a sphere = ${F(4, 3)}π${V('r')}³.`, `${N(r)}³ = ${N(r ** 3)}, and ${F(4, 3)} × 3.14 × ${N(r ** 3)}.`, `= <b>${N(ans)} ${cu}</b>.`], { r }, true); }
      const rr = kind === 'sphere-pi' ? 3 * rng.int(1, 4) : r, hh = 3 * rng.int(1, 5);
      const ans = kind === 'sphere-pi' ? [4 * rr ** 3, 3] : [rr * rr * hh, 3];
      const wrongs = kind === 'sphere-pi' ? [[4 * rr * rr, 1], [4 * rr * rr, 3], [rr ** 3, 1]] : [[rr * rr * hh, 1], [rr * hh, 3], [2 * rr * hh, 3]];
      const choices = piChoices([ans].concat(wrongs)).map(c => c + ' ' + cu);
      const prompt = kind === 'sphere-pi' ? `A sphere has radius ${N(rr)} ${u}. What is its volume, in terms of π?` : `A cone has radius ${N(rr)} ${u} and height ${N(hh)} ${u}. What is its volume, in terms of π?`;
      return { prompt, type: 'choice', choices, answer: choices[0], params: { kind, rr, hh, ans },
        hints: kind === 'sphere-pi' ? [`Volume = ${F(4, 3)}π${V('r')}³, and ${N(rr)}³ = ${N(rr ** 3)}.`, `${F(4, 3)} × ${N(rr ** 3)} = ${N(4 * rr ** 3 / 3)}, so the volume is <b>${choices[0]}</b>.`]
          : [`Volume = ${F(1, 3)}π${V('r')}²${V('h')} = ${F(1, 3)} × π × ${N(rr * rr)} × ${N(hh)}.`, `${N(rr * rr * hh)} ÷ 3 = ${N(rr * rr * hh / 3)}, so the volume is <b>${choices[0]}</b>.`] };
    },
    verify(q) {
      const pr = q.params, v = q.answer;
      const cyl = (r, h) => 3.14 * r * r * h;
      switch (pr.kind) {
        case 'box': return v === pr.w * pr.h * pr.l;
        case 'tri-prism': return close(v * 2, pr.b * pr.t * pr.L);                  // half of a b × t × L box
        case 'pyramid': return close(v * 3, pr.s * pr.s * pr.h);                    // three pyramids fill the prism
        case 'cylinder': return close(v, cyl(pr.r, pr.h), 0.006);
        case 'cone': return close(v * 3, cyl(pr.r, pr.h), 0.02);
        case 'sphere': return close(v, cyl(pr.r, 2 * pr.r) * 2 / 3, 0.006);         // Archimedes: ⅔ of the enclosing cylinder
        case 'sphere-pi': return q.answer.startsWith(piFrac(...pr.ans)) && close(pr.ans[0] / pr.ans[1], 2 * pr.rr ** 3 * 2 / 3);
        default: return q.answer.startsWith(piFrac(...pr.ans)) && close(pr.ans[0] / pr.ans[1] * 3, pr.rr * pr.rr * pr.hh);
      }
    },
  });

  A.skill({
    id: 'geo.surface-area', title: 'Surface area of solids',
    learn: p('Surface area is the total area of every face or surface, as if you unfolded the solid into a flat <b>net</b>. It is measured in square units.') +
      p(`<b>Box</b>: 2(${V('l')}${V('w')} + ${V('l')}${V('h')} + ${V('w')}${V('h')}). <b>Cylinder</b>: two circles plus a rectangle wrapped round, 2π${V('r')}² + 2π${V('r')}${V('h')}. <b>Sphere</b>: <b>4π${V('r')}²</b>. <b>Cone</b>: base plus curved surface, π${V('r')}² + π${V('r')}${V('ℓ')}, where ${V('ℓ')} is the slant height. <b>Square pyramid</b>: base plus four triangles, ${V('s')}² + 2${V('s')}${V('ℓ')}.`) +
      p('Use 3.14 for π and round to the hundredth.') +
      example('Example', `${big('A cylinder with radius 2 m and height 5 m')}Two circles: 2 × 3.14 × 4 = 25.12. The side: 2 × 3.14 × 2 × 5 = 62.8. Total: <b>87.92 m²</b>.`),
    make(rng) {
      const kind = rng.pick(['box', 'cube', 'cylinder', 'sphere', 'cone', 'pyramid']);
      const u = rng.pick(['cm', 'm', 'in', 'ft']), su = u + '²', name = rng.pick(NAMES);
      const mk = (prompt, ans, hints, params, tol) => ({ prompt, type: 'number', answer: ans, unit: su, tolerance: tol ? 0.05 : undefined, hints, params: Object.assign({ kind }, params) });
      if (kind === 'box') { const l = rng.int(2, 12), w = rng.int(2, 10), h = rng.int(2, 10), ans = 2 * (l * w + l * h + w * h); return mk(`${name} wraps a gift box ${N(l)} ${u} long, ${N(w)} ${u} wide and ${N(h)} ${u} tall. How much paper covers it exactly, with no overlap?`, ans, ['The box has three pairs of matching rectangles: top and bottom, front and back, the two ends.', `${N(l)} × ${N(w)} = ${N(l * w)}, ${N(l)} × ${N(h)} = ${N(l * h)}, ${N(w)} × ${N(h)} = ${N(w * h)}.`, `2 × (${N(l * w)} + ${N(l * h)} + ${N(w * h)}) = <b>${N(ans)} ${su}</b>.`], { l, w, h }); }
      if (kind === 'cube') { const s = rng.int(2, 15), ans = 6 * s * s; return mk(`What is the surface area of a cube with edges ${N(s)} ${u} long?`, ans, ['A cube has 6 identical square faces.', `Each face is ${N(s)}² = ${N(s * s)} ${su}.`, `6 × ${N(s * s)} = <b>${N(ans)} ${su}</b>.`], { s }); }
      if (kind === 'pyramid') { const s = rng.int(2, 12), l = rng.int(3, 15), ans = s * s + 2 * s * l; return mk(`A square pyramid has base edges of ${N(s)} ${u} and a slant height of ${N(l)} ${u}. What is its surface area?`, ans, [`The base is ${N(s)}² = ${N(s * s)} ${su}.`, `Each of the four triangles is ${F(1, 2)} × ${N(s)} × ${N(l)} = ${N(s * l / 2)} ${su}, so together they make ${N(2 * s * l)}.`, `${N(s * s)} + ${N(2 * s * l)} = <b>${N(ans)} ${su}</b>.`], { s, l }); }
      const r = rng.int(2, 10);
      if (kind === 'sphere') { const ans = r2(4 * 3.14 * r * r); return mk(`What is the surface area of a sphere with radius ${N(r)} ${u}? Use 3.14 for π and round to the hundredth.`, ans, [`Surface area of a sphere = 4π${V('r')}².`, `4 × 3.14 × ${N(r * r)} = <b>${N(ans)} ${su}</b>.`], { r }, true); }
      if (kind === 'cylinder') { const h = rng.int(2, 15), ans = r2(2 * 3.14 * r * r + 2 * 3.14 * r * h); return mk(`A closed cylinder has radius ${N(r)} ${u} and height ${N(h)} ${u}. What is its surface area? Use 3.14 for π and round to the hundredth.`, ans, [`The two circles: 2 × 3.14 × ${N(r)}² = ${N(r2(6.28 * r * r))}.`, `The curved side unrolls to a rectangle: circumference × height = 2 × 3.14 × ${N(r)} × ${N(h)} = ${N(r2(6.28 * r * h))}.`, `Total: <b>${N(ans)} ${su}</b>.`], { r, h }, true); }
      const t = rng.pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]]), rr = t[0], hh = t[1], l = t[2];
      const giveH = rng.bool(), ans = r2(3.14 * rr * rr + 3.14 * rr * l);
      return mk(`A cone has radius ${N(rr)} ${u} and ${giveH ? 'height' : 'slant height'} ${N(giveH ? hh : l)} ${u}. What is its total surface area? Use 3.14 for π and round to the hundredth.`, ans,
        (giveH ? [`First find the slant height: ${V('ℓ')} = √(${N(rr)}² + ${N(hh)}²) = √${N(rr * rr + hh * hh)} = ${N(l)}.`] : []).concat([`The base: 3.14 × ${N(rr)}² = ${N(r2(3.14 * rr * rr))}. The curved surface: 3.14 × ${N(rr)} × ${N(l)} = ${N(r2(3.14 * rr * l))}.`, `Total: <b>${N(ans)} ${su}</b>.`]), { rr, hh, l, giveH }, true);
    },
    verify(q) {
      const pr = q.params, v = q.answer;
      switch (pr.kind) {
        case 'box': { const faces = [pr.l * pr.w, pr.l * pr.w, pr.l * pr.h, pr.l * pr.h, pr.w * pr.h, pr.w * pr.h]; return v === faces.reduce((a, b) => a + b, 0); }
        case 'cube': return v === [1, 2, 3, 4, 5, 6].reduce(s => s + pr.s * pr.s, 0);
        case 'pyramid': return v === pr.s * pr.s + 4 * (pr.s * pr.l / 2);
        case 'sphere': return close(v, 2 * 3.14 * pr.r * (2 * pr.r), 0.006);           // the side of the enclosing cylinder
        case 'cylinder': return close(v, 2 * 3.14 * pr.r * (pr.r + pr.h), 0.006);
        default: return close(Math.hypot(pr.rr, pr.hh), pr.l) && close(v, 3.14 * pr.rr * pr.rr + pr.l * (2 * 3.14 * pr.rr) / 2, 0.006);   // base + a sector of radius ℓ and arc 2πr
      }
    },
  });
})();
