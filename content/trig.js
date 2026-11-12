/* Trigonometry. Right-triangle ratios, angles and radians, the unit circle, graphs of the trig functions,
   identities, trig equations, solving any triangle, inverse trig and polar coordinates. Every question can be
   done by hand or with a scientific calculator, and every answer is checked a second way in verify(). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const X = V('x'), TH = V('θ');
  const D = d => `${N(d)}°`;
  const rad = d => d * Math.PI / 180, degOf = r => r * 180 / Math.PI;
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const r1 = x => M.round(x, 1), r2 = x => M.round(x, 2);
  /** a stacked fraction with any HTML on top */
  const fr = (num, den) => den === 1 ? num : `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const R2 = M.sqrt(2), R3 = M.sqrt(3);
  const clean = v => (Math.abs(v) < 1e-12 ? 0 : v);
  /** sin, cos or tan of an angle in degrees; tan at an odd multiple of 90° is Infinity */
  function trig(f, d) {
    const r = rad(d);
    if (f === 'sin') return clean(Math.sin(r));
    if (f === 'cos') return clean(Math.cos(r));
    return Math.abs(Math.cos(r)) < 1e-12 ? Infinity : clean(Math.tan(r));
  }
  const KNOWN = [[0, '0'], [0.5, F(1, 2)], [Math.SQRT2 / 2, fr(R2, 2)], [Math.sqrt(3) / 2, fr(R3, 2)], [1, '1'], [Math.sqrt(3) / 3, fr(R3, 3)], [Math.sqrt(3), R3]];
  /** the exact value of a special angle's sin, cos or tan, as it is written */
  function exactHtml(v) {
    if (!isFinite(v)) return 'Undefined';
    const k = KNOWN.find(([x]) => near(x, Math.abs(v), 1e-9));
    return k ? (v < -1e-12 ? '−' : '') + k[1] : null;
  }
  const EXACTS = ['0', '1', '−1', F(1, 2), '−' + F(1, 2), fr(R2, 2), '−' + fr(R2, 2), fr(R3, 2), '−' + fr(R3, 2), R3, '−' + R3, fr(R3, 3), '−' + fr(R3, 3), 'Undefined'];
  /** an angle in degrees as radians: 150 → 5π/6 */
  function radHtml(d) {
    if (d === 0) return '0';
    const [n, den] = M.simp(d, 180);
    const top = (n < 0 ? '−' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + 'π';
    return fr(top, den);
  }
  const radText = d => { if (d === 0) return '0'; const [n, den] = M.simp(d, 180); return (n < 0 ? '−' : '') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + 'π' + (den === 1 ? '' : '/' + den); };
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [6, 8, 10], [12, 16, 20]];
  /** the answer plus up to three distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  const fname = f => `${f} `;
  const QUAD = ['I', 'II', 'III', 'IV'];
  /** quadrant of an angle in degrees that isn't on an axis */
  const quadOf = d => { const t = ((d % 360) + 360) % 360; return t < 90 ? 0 : t < 180 ? 1 : t < 270 ? 2 : 3; };
  const SIGNS = [[1, 1], [-1, 1], [-1, -1], [1, -1]];          // signs of (x, y) in quadrants I to IV

  /* a right triangle: the right angle at C (bottom right), A at the bottom left, B at the top */
  function rightTri(lab) {
    const Ax = 34, Ay = 168, Cx = 258, Cy = 168, Bx = 258, By = 40;
    const t = (x, y, s, anchor) => s ? `<text x="${x}" y="${y}" font-size="15" text-anchor="${anchor || 'middle'}">${s}</text>` : '';
    let g = `<polygon class="fill" points="${Ax},${Ay} ${Cx},${Cy} ${Bx},${By}"/>`;
    g += `<polyline class="stroke" points="${Cx - 14},${Cy} ${Cx - 14},${Cy - 14} ${Cx},${Cy - 14}" stroke-width="1.5"/>`;
    g += `<path class="stroke" d="M ${Ax + 34} ${Ay} A 34 34 0 0 0 ${Ax + 34 * Math.cos(Math.atan2(Ay - By, Bx - Ax))} ${Ay - 34 * Math.sin(Math.atan2(Ay - By, Bx - Ax))}" stroke-width="1.5"/>`;
    g += t(Ax - 12, Ay + 6, 'A') + t(Cx + 12, Cy + 6, 'C') + t(Bx + 12, By, 'B');
    g += t((Ax + Cx) / 2, Ay + 22, lab.b) + t(Cx + 14, (Cy + By) / 2 + 5, lab.a, 'start') + t((Ax + Bx) / 2 - 14, (Ay + By) / 2 - 10, lab.c, 'end');
    if (lab.A) g += t(Ax + 52, Ay - 8, lab.A, 'start');
    return `<svg class="figure" viewBox="0 0 320 196" width="320" role="img" aria-label="right triangle ABC with the right angle at C">${g}</svg>`;
  }
  /** any triangle ABC (not to scale), with labels on its sides and angles */
  function anyTri(lab) {
    const P = { A: [40, 160], B: [290, 160], C: [190, 40] };
    const t = (x, y, s, anchor) => s ? `<text x="${x}" y="${y}" font-size="15" text-anchor="${anchor || 'middle'}">${s}</text>` : '';
    let g = `<polygon class="fill" points="${P.A} ${P.B} ${P.C}"/>`;
    g += t(26, 168, 'A') + t(304, 168, 'B') + t(190, 30, 'C');
    g += t(165, 180, lab.c) + t(254, 96, lab.a, 'start') + t(104, 94, lab.b, 'end');
    g += t(64, 152, lab.A, 'start') + t(266, 152, lab.B, 'end') + t(190, 68, lab.C);
    return `<svg class="figure" viewBox="0 0 330 190" width="330" role="img" aria-label="triangle ABC">${g}</svg>`;
  }

  A.course({
    id: 'trigonometry', title: 'Trigonometry', subject: 'High school', added: '2026-11-09', grade: 11, icon: 'Trig', hue: 175,
    blurb: 'Right-triangle ratios, radians and the unit circle, graphs of sine, cosine and tangent, identities, trig equations, solving any triangle, and polar coordinates.',
    units: [
      { id: 'right-triangles', title: 'Right-triangle trigonometry', blurb: 'Sine, cosine and tangent as ratios of sides, and using them to find sides, angles and heights.', skills: ['trig.ratios', 'trig.missing-side', 'trig.missing-angle', 'trig.elevation'] },
      { id: 'angles', title: 'Angles and radians', blurb: 'Measuring angles in radians, coterminal and reference angles, arcs and sectors.', skills: ['trig.radians', 'trig.coterminal-reference', 'trig.arc-sector'] },
      { id: 'unit-circle', title: 'The unit circle', blurb: 'Exact values of the special angles, signs in each quadrant, and ratios from a point or from one ratio.', skills: ['trig.unit-circle-exact', 'trig.quadrant-signs', 'trig.point-terminal', 'trig.one-ratio-to-others'] },
      { id: 'graphs', title: 'Graphs of the trig functions', blurb: 'Amplitude, period, midline and phase shift, matching a graph to its equation, and the tangent graph.', skills: ['trig.amplitude-period', 'trig.phase-shift', 'trig.graph-equation', 'trig.tangent-graph'] },
      { id: 'identities', title: 'Trig identities', blurb: 'Simplifying with the basic identities, sum and difference formulas, and double angles.', skills: ['trig.simplify-identities', 'trig.sum-difference', 'trig.double-angle'] },
      { id: 'equations', title: 'Trig equations', blurb: 'Solving equations in one trig function, including ones that factor like quadratics.', skills: ['trig.solve-basic', 'trig.solve-quadratic'] },
      { id: 'any-triangle', title: 'Solving any triangle', blurb: 'The laws of sines and cosines, the area of a triangle from two sides and an angle, and the ambiguous case.', skills: ['trig.law-of-sines', 'trig.law-of-cosines', 'trig.triangle-area', 'trig.ambiguous-case'] },
      { id: 'inverse-polar', title: 'Inverse trig and polar coordinates', blurb: 'Exact values of the inverse functions, and moving between polar and rectangular coordinates.', skills: ['trig.inverse-exact', 'trig.polar-rect'] },
    ],
  });

  /* ---------- Unit 1: right triangles ---------- */
  A.skill({
    id: 'trig.ratios', title: 'Sine, cosine and tangent in a right triangle',
    learn: p(`In a right triangle, each acute angle has three ratios. Name the sides <b>from the angle you're looking at</b>: the <b>hypotenuse</b> is across from the right angle (the longest side), the <b>opposite</b> side is across from your angle, and the <b>adjacent</b> side touches your angle but isn't the hypotenuse.`) +
      p(`<b>sin = opposite ÷ hypotenuse, cos = adjacent ÷ hypotenuse, tan = opposite ÷ adjacent.</b> Many students remember this as SOH-CAH-TOA. Switching to the other acute angle swaps opposite and adjacent, so sin A = cos B.`) +
      example('Example', `In right triangle ${V('ABC')} with the right angle at ${V('C')}: BC = 5, AC = 12 and AB = 13. From angle ${V('A')}, the opposite side is BC = 5 and the adjacent side is AC = 12, so sin A = ${F(5, 13)}, cos A = ${F(12, 13)} and tan A = ${F(5, 12)}.`),
    make(rng) {
      const [t0, t1, c] = rng.pick(TRIPLES), [a, b] = rng.bool() ? [t0, t1] : [t1, t0];
      const at = rng.chance(0.7) ? 'A' : 'B', f = rng.pick(['sin', 'cos', 'tan']);
      const opp = at === 'A' ? a : b, adj = at === 'A' ? b : a;
      const [num, den] = f === 'sin' ? [opp, c] : f === 'cos' ? [adj, c] : [opp, adj];
      const oppName = at === 'A' ? 'BC' : 'AC', adjName = at === 'A' ? 'AC' : 'BC';
      const rule = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[f];
      return {
        prompt: `In right triangle ABC, the right angle is at ${V('C')}. Find ${f} ${at}. Write it as a fraction.${rightTri({ a: N(a), b: N(b), c: N(c) })}`,
        type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { a, b, c, at, f },
        hints: [`${f} = ${rule}. Look from angle ${V(at)}: the hypotenuse is AB = ${N(c)}, the opposite side is ${oppName} = ${N(opp)}, and the adjacent side is ${adjName} = ${N(adj)}.`,
          `${f} ${at} = ${F(num, den, { raw: true })}${M.simp(num, den)[1] !== den ? ` = ${F(num, den)}` : ''}.`],
      };
    },
    verify(q) {
      const { a, b, c, at, f } = q.params;
      if (a * a + b * b !== c * c) return 'not a right triangle';
      const ang = at === 'A' ? Math.atan2(a, b) : Math.atan2(b, a);
      const v = f === 'sin' ? Math.sin(ang) : f === 'cos' ? Math.cos(ang) : Math.tan(ang);
      return near(v, q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'trig.missing-side', title: 'Finding a missing side',
    learn: p(`When you know an acute angle and one side of a right triangle, one ratio links that side to the side you want. <b>Pick the ratio that uses the side you know and the side you want</b>, write the equation, and solve it.`) +
      p(`If the unknown is on top, multiply: opposite = hypotenuse × sin ${TH}. If it's on the bottom, divide: hypotenuse = opposite ÷ sin ${TH}. Make sure your calculator is in <b>degree mode</b>.`) +
      example('Example', `Angle ${V('A')} = 35° and the hypotenuse is 20. The side opposite ${V('A')} is 20 × sin 35° ≈ 20 × 0.5736 ≈ <b>11.47</b>.`),
    make(rng) {
      const th = rng.int(15, 75), known = rng.pick(['hyp', 'adj', 'opp']), len = rng.int(5, 40);
      const want = rng.pick({ hyp: ['opp', 'adj'], adj: ['opp', 'hyp'], opp: ['adj', 'hyp'] }[known]);
      const s = Math.sin(rad(th)), co = Math.cos(rad(th)), tn = Math.tan(rad(th));
      const sides = { hyp: known === 'hyp' ? len : known === 'adj' ? len / co : len / s };
      sides.opp = sides.hyp * s; sides.adj = sides.hyp * co;
      const ans = r2(sides[want]);
      const lab = { a: known === 'opp' ? N(len) : want === 'opp' ? V('x') : '', b: known === 'adj' ? N(len) : want === 'adj' ? V('x') : '', c: known === 'hyp' ? N(len) : want === 'hyp' ? V('x') : '', A: D(th) };
      const pair = [known, want].sort().join('+');
      const f = { 'hyp+opp': 'sin', 'adj+hyp': 'cos', 'adj+opp': 'tan' }[pair];
      const NM = { hyp: 'hypotenuse', adj: 'adjacent side', opp: 'opposite side' };
      const top = f === 'sin' ? 'opp' : f === 'cos' ? 'adj' : 'opp', bottom = f === 'tan' ? 'adj' : 'hyp';
      const eq = `${f} ${D(th)} = ${top === want ? V('x') : N(len)} ÷ ${bottom === want ? V('x') : N(len)}`;
      const val = M.round(f === 'sin' ? s : f === 'cos' ? co : tn, 4);
      const solve = top === want ? `${V('x')} = ${N(len)} × ${f} ${D(th)} ≈ ${N(len)} × ${N(val)}` : `${V('x')} = ${N(len)} ÷ ${f} ${D(th)} ≈ ${N(len)} ÷ ${N(val)}`;
      return {
        prompt: `Find ${V('x')} to the nearest hundredth.${rightTri(lab)}`, type: 'number', answer: ans, tolerance: 0.02,
        params: { th, known, want, len },
        hints: [`From angle ${V('A')}, you know the ${NM[known]} and want the ${NM[want]}. The ratio that uses both is ${f}.`, `${eq}.`, `${solve} ≈ <b>${N(ans)}</b>.`],
      };
    },
    verify(q) {
      const { th, known, want, len } = q.params;
      // rebuild the triangle from the angle at B (90° − θ) and check against the answer
      const B = rad(90 - q.params.th), hyp = known === 'hyp' ? len : known === 'adj' ? len / Math.sin(B) : len / Math.cos(B);
      const got = { hyp, opp: hyp * Math.cos(B), adj: hyp * Math.sin(B) }[want];
      return near(got, q.answer, 0.006) && th > 0;
    },
  });

  A.skill({
    id: 'trig.missing-angle', title: 'Finding a missing angle',
    learn: p(`When you know two sides of a right triangle, find the ratio they make, then use the <b>inverse</b> function to turn the ratio back into an angle: if sin ${TH} = 0.6, then ${TH} = sin<sup>−1</sup>(0.6) ≈ 36.9°.`) +
      p(`<b>Choose sin<sup>−1</sup>, cos<sup>−1</sup> or tan<sup>−1</sup> by which two sides you know</b>, just as you pick a ratio. The answer is in degrees when the calculator is in degree mode.`) +
      example('Example', `The side opposite ${V('A')} is 7 and the adjacent side is 10. tan A = 7 ÷ 10 = 0.7, so A = tan<sup>−1</sup>(0.7) ≈ <b>35.0°</b>.`),
    make(rng) {
      const kind = rng.pick(['tan', 'sin', 'cos']);
      let a, b, c;
      if (kind === 'tan') { a = rng.int(3, 30); b = rng.int(3, 30); if (a === b) b++; }
      else { c = rng.int(12, 40); a = rng.int(3, c - 2); b = Math.sqrt(c * c - a * a); }
      const ang = degOf(kind === 'tan' ? Math.atan(a / b) : kind === 'sin' ? Math.asin(a / c) : Math.acos(a / c));
      const ans = r1(ang);
      const lab = kind === 'tan' ? { a: N(a), b: N(b), c: '', A: '?' } : kind === 'sin' ? { a: N(a), b: '', c: N(c), A: '?' } : { a: '', b: N(a), c: N(c), A: '?' };
      const ratio = kind === 'tan' ? `${N(a)} ÷ ${N(b)}` : `${N(a)} ÷ ${N(c)}`;
      const nm = { tan: ['opposite', 'adjacent'], sin: ['opposite', 'hypotenuse'], cos: ['adjacent', 'hypotenuse'] }[kind];
      return {
        prompt: `Find the measure of angle ${V('A')}, to the nearest tenth of a degree.${rightTri(lab)}`, type: 'number', answer: ans, tolerance: 0.05, unit: '°',
        params: { kind, a, b: kind === 'tan' ? b : null, c: kind === 'tan' ? null : c },
        hints: [`You know the ${nm[0]} and the ${nm[1]} sides for angle ${V('A')}, so use ${kind}.`, `${kind} A = ${ratio} ≈ ${N(M.round(kind === 'tan' ? a / b : a / c, 4))}.`, `A = ${kind}<sup>−1</sup>(${ratio}) ≈ <b>${D(ans)}</b>.`],
      };
    },
    verify(q) {
      const { kind, a, b, c } = q.params;
      // check with the other inverse function, from the third side
      const third = kind === 'tan' ? Math.hypot(a, b) : Math.sqrt(c * c - a * a);
      const ang = kind === 'tan' ? Math.asin(a / third) : kind === 'sin' ? Math.atan(a / third) : Math.atan(third / a);
      return near(degOf(ang), q.answer, 0.051);
    },
  });

  A.skill({
    id: 'trig.elevation', title: 'Angles of elevation and depression',
    learn: p(`The <b>angle of elevation</b> is measured up from a horizontal line to something above you; the <b>angle of depression</b> is measured down from the horizontal to something below. Draw the right triangle first: the horizontal ground or line of sight, the vertical height, and the slanted line between them.`) +
      p(`<b>Because the horizontal lines at the top and the bottom are parallel, an angle of depression from above equals the angle of elevation from below.</b> Then label the sides from that angle and use sin, cos or tan.`) +
      example('Example', `From 40 m away, the angle of elevation to the top of a tower is 52°. The height is opposite the angle and 40 m is adjacent, so height = 40 × tan 52° ≈ <b>51.2 m</b>.`),
    make(rng) {
      const who = rng.pick(NAMES), kind = rng.pick(['tower', 'ladder-up', 'ladder-out', 'cliff', 'kite', 'ramp']);
      let prompt, ans, hints, params;
      if (kind === 'tower') {
        const d = rng.int(15, 90), th = rng.int(20, 70);
        ans = r1(d * Math.tan(rad(th)));
        prompt = `${who} stands ${d} m from the base of a tower and measures the angle of elevation to its top as ${D(th)}. How tall is the tower, to the nearest tenth of a meter?`;
        hints = [`The height is opposite the ${D(th)} angle and the ${d} m distance is adjacent, so use tan.`, `height = ${d} × tan ${D(th)} ≈ ${d} × ${N(M.round(Math.tan(rad(th)), 4))} ≈ <b>${N(ans)} m</b>.`];
        params = { kind, d, th };
      } else if (kind === 'ladder-up' || kind === 'ladder-out') {
        const L = rng.int(8, 30), th = rng.int(55, 80), up = kind === 'ladder-up';
        ans = r1(up ? L * Math.sin(rad(th)) : L * Math.cos(rad(th)));
        prompt = `A ${L}-foot ladder leans against a wall, making a ${D(th)} angle with the ground. ${up ? 'How high up the wall does it reach' : 'How far is its foot from the wall'}, to the nearest tenth of a foot?`;
        hints = [`The ladder is the hypotenuse. The ${up ? 'height on the wall is opposite' : 'distance along the ground is adjacent to'} the ${D(th)} angle, so use ${up ? 'sin' : 'cos'}.`, `${up ? 'height' : 'distance'} = ${L} × ${up ? 'sin' : 'cos'} ${D(th)} ≈ <b>${N(ans)} ft</b>.`];
        params = { kind, L, th };
      } else if (kind === 'cliff') {
        const h = rng.int(30, 200), th = rng.int(10, 50);
        ans = r1(h / Math.tan(rad(th)));
        prompt = `From the top of a cliff ${h} m above the sea, ${who} sees a boat at an angle of depression of ${D(th)}. How far is the boat from the foot of the cliff, to the nearest tenth of a meter?`;
        hints = [`The angle of depression equals the angle of elevation from the boat up to the top: ${D(th)}. From the boat, the cliff's ${h} m is opposite and the distance is adjacent.`, `tan ${D(th)} = ${h} ÷ distance, so distance = ${h} ÷ tan ${D(th)} ≈ <b>${N(ans)} m</b>.`];
        params = { kind, h, th };
      } else if (kind === 'kite') {
        const L = rng.int(40, 150), th = rng.int(25, 70);
        ans = r1(L * Math.sin(rad(th)));
        prompt = `${who}'s kite string is ${L} ft long and makes a ${D(th)} angle with the ground. How high is the kite above the point where the string is held, to the nearest tenth of a foot?`;
        hints = [`The string is the hypotenuse and the height is opposite the ${D(th)} angle, so use sin.`, `height = ${L} × sin ${D(th)} ≈ <b>${N(ans)} ft</b>.`];
        params = { kind, L, th };
      } else {
        const h = rng.int(1, 6), d = rng.int(12, 60);
        ans = r1(degOf(Math.atan(h / d)));
        prompt = `A ramp rises ${h} ft over a horizontal distance of ${d} ft. What angle does it make with the ground, to the nearest tenth of a degree?`;
        hints = [`The rise is opposite the angle and the horizontal distance is adjacent, so tan ${TH} = ${h} ÷ ${d}.`, `${TH} = tan<sup>−1</sup>(${h} ÷ ${d}) ≈ <b>${D(ans)}</b>.`];
        params = { kind, h, d };
      }
      return { prompt, type: 'number', answer: ans, tolerance: 0.05, hints, params };
    },
    verify(q) {
      const P = q.params, k = P.kind;
      const got = k === 'tower' ? P.d * Math.sin(rad(P.th)) / Math.cos(rad(P.th)) : k === 'ladder-up' ? P.L * Math.cos(rad(90 - P.th)) : k === 'ladder-out' ? P.L * Math.sin(rad(90 - P.th))
        : k === 'cliff' ? P.h * Math.tan(rad(90 - P.th)) : k === 'kite' ? P.L * Math.cos(rad(90 - P.th)) : 90 - degOf(Math.atan(P.d / P.h));
      return near(got, q.answer, 0.051);
    },
  });

  /* ---------- Unit 2: angles and radians ---------- */
  A.skill({
    id: 'trig.radians', title: 'Degrees and radians',
    learn: p(`A <b>radian</b> is the angle that cuts off an arc as long as the radius. A full turn is 2π radians, so <b>180° = π radians</b>.`) +
      p(`<b>To change degrees to radians, multiply by π/180. To change radians to degrees, multiply by 180/π.</b> Radians are usually left as a fraction of π: 150° × π/180 = 5π/6.`) +
      example('Example', `135° = 135 × π/180 = ${radHtml(135)} radians, and ${radHtml(240)} radians = 4/3 × 180° = 240°.`),
    make(rng) {
      const d = rng.pick([15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 225, 240, 270, 300, 315, 330, 360, 390, 420, 450, 540, -30, -45, -60, -90, -120, -135, -150, -210]);
      if (rng.bool()) {
        const answer = radHtml(d);
        const wrong = [radHtml(2 * d), d % 2 === 0 ? radHtml(d / 2) : null, radHtml(180 - d), radHtml(-d), radHtml(d + 180), radHtml(d + 30)];
        return { prompt: `Write ${D(d)} in radians.`, type: 'choice', answer, choices: options(answer, wrong), params: { kind: 'toRad', d },
          hints: [`Multiply by ${fr('π', 180)}: ${N(d)} × π/180.`, `${N(d)}/180 simplifies to ${M.fracText(d, 180)}, so ${D(d)} = <b>${answer}</b>.`] };
      }
      return { prompt: `Write ${radHtml(d)} radians in degrees.`, type: 'number', answer: d, unit: '°', params: { kind: 'toDeg', d },
        hints: [`Replace π with 180°, or multiply by 180/π.`, `${radText(d)} = ${M.fracText(d, 180)} × 180° = <b>${D(d)}</b>.`] };
    },
    verify(q) {
      const d = q.params.d;
      if (q.params.kind === 'toDeg') return near(degOf(rad(d)), q.answer, 1e-9);
      // read the choice back: kπ/n → degrees
      const m = A.stripTags(q.answer).replace(/\s+/g, ' ').trim().match(/^(−)?(\d*)π(?: (\d+))?$/);
      if (!m) return 'unreadable radian answer';
      const deg = (m[1] ? -1 : 1) * (m[2] ? Number(m[2]) : 1) * 180 / (m[3] ? Number(m[3]) : 1);
      return near(deg, d, 1e-9);
    },
  });

  A.skill({
    id: 'trig.coterminal-reference', title: 'Coterminal and reference angles',
    learn: p(`<b>Coterminal angles</b> share the same ending side. Add or subtract 360° (or 2π) as many times as you need: 400°, 40° and −320° are all coterminal.`) +
      p(`The <b>reference angle</b> is the acute angle between the ending side and the ${X}-axis. First find the coterminal angle between 0° and 360°. Then: in quadrant I it is the angle itself; in II, 180° minus it; in III, it minus 180°; in IV, 360° minus it.`) +
      example('Example', `For 510°: subtract 360° to get 150°, which is in quadrant II, so the reference angle is 180° − 150° = <b>30°</b>.`),
    make(rng) {
      const base = rng.int(1, 359), k = rng.pick([-2, -1, 1, 2]), th = base + 360 * k;
      if (rng.bool() || base % 90 === 0) {
        return { prompt: `Find the angle between 0° and 360° that is coterminal with ${D(th)}.`, type: 'number', answer: base, unit: '°', params: { kind: 'co', th },
          hints: [`${k > 0 ? 'Subtract' : 'Add'} 360° until the angle is between 0° and 360°.`, `${D(th)} ${k > 0 ? '−' : '+'} ${N(360 * Math.abs(k))}° = <b>${D(base)}</b>.`] };
      }
      const q = quadOf(base), ref = [base, 180 - base, base - 180, 360 - base][q];
      const show = rng.bool() ? base : th;
      return { prompt: `Find the reference angle for ${D(show)}.`, type: 'number', answer: ref, unit: '°', params: { kind: 'ref', th: show },
        hints: [show === base ? `${D(base)} is in quadrant ${QUAD[q]}.` : `${D(show)} is coterminal with ${D(base)}, which is in quadrant ${QUAD[q]}.`,
          `In quadrant ${QUAD[q]}, the reference angle is ${['the angle itself', '180° minus the angle', 'the angle minus 180°', '360° minus the angle'][q]}: <b>${D(ref)}</b>.`] };
    },
    verify(q) {
      const t = ((q.params.th % 360) + 360) % 360;
      if (q.params.kind === 'co') return q.answer === t;
      // the reference angle is the acute angle with the x-axis: atan of |y/x|
      return near(degOf(Math.atan(Math.abs(Math.sin(rad(t)) / Math.cos(rad(t))))), q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'trig.arc-sector', title: 'Arc length and sector area',
    learn: p(`In a circle of radius ${V('r')}, a central angle of ${TH} <b>radians</b> cuts off an arc of length <b>${V('s')} = ${V('r')}${TH}</b> and a sector (a pizza slice) of area <b>${V('A')} = ½${V('r')}²${TH}</b>.`) +
      p(`If the angle is in degrees, change it to radians first, or use the fraction of the whole circle: ${V('s')} = 2π${V('r')} × ${TH}/360 and ${V('A')} = π${V('r')}² × ${TH}/360.`) +
      example('Example', `Radius 6, angle ${radHtml(120)}: arc = 6 × ${radHtml(120)} = 4π ≈ <b>12.57</b>, area = ½ × 36 × ${radHtml(120)} = 12π ≈ <b>37.70</b>.`),
    make(rng) {
      const r = rng.int(2, 15), d = rng.pick([20, 30, 40, 45, 60, 72, 90, 100, 120, 135, 150, 210, 240, 270, 300]);
      const inRad = rng.bool() && 180 % M.simp(d, 180)[1] === 0, what = rng.pick(['arc', 'area']);
      const th = rad(d), ans = r2(what === 'arc' ? r * th : 0.5 * r * r * th);
      const angle = inRad ? `${radHtml(d)} radians` : D(d);
      return {
        prompt: `A circle has radius ${r} cm. Find the ${what === 'arc' ? 'length of the arc' : 'area of the sector'} cut off by a central angle of ${angle}, to the nearest hundredth.`,
        type: 'number', answer: ans, tolerance: 0.02, params: { r, d, what },
        hints: [inRad ? `The angle is already in radians: ${TH} = ${radText(d)}.` : `Change to radians: ${N(d)} × π/180 = ${radText(d)}.`,
          what === 'arc' ? `${V('s')} = ${V('r')}${TH} = ${r} × ${radText(d)} ≈ <b>${N(ans)} cm</b>.` : `${V('A')} = ½${V('r')}²${TH} = ½ × ${r * r} × ${radText(d)} ≈ <b>${N(ans)} cm²</b>.`],
      };
    },
    verify(q) {
      const { r, d, what } = q.params;
      const got = what === 'arc' ? 2 * Math.PI * r * d / 360 : Math.PI * r * r * d / 360;
      return near(got, q.answer, 0.006);
    },
  });

  /* ---------- Unit 3: the unit circle ---------- */
  const SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  A.skill({
    id: 'trig.unit-circle-exact', title: 'Exact values on the unit circle',
    learn: p(`On the unit circle (radius 1), the point at angle ${TH} is <b>(cos ${TH}, sin ${TH})</b>, and tan ${TH} = sin ${TH} ÷ cos ${TH}. Learn the first quadrant: 30° gives (${fr(R3, 2)}, ${F(1, 2)}), 45° gives (${fr(R2, 2)}, ${fr(R2, 2)}), and 60° gives (${F(1, 2)}, ${fr(R3, 2)}).`) +
      p(`<b>For any other special angle, use its reference angle for the size and its quadrant for the sign.</b> Where cos ${TH} = 0 (at 90° and 270°), tan ${TH} is undefined.`) +
      example('Example', `cos 210°: the reference angle is 30° and 210° is in quadrant III, where cosine is negative, so cos 210° = <b>−${fr(R3, 2)}</b>.`),
    make(rng) {
      const d = rng.pick(SPECIAL), f = rng.pick(['sin', 'cos', 'tan']), useRad = rng.bool();
      const v = trig(f, d), answer = exactHtml(v);
      const other = f === 'sin' ? trig('cos', d) : f === 'cos' ? trig('sin', d) : (trig('sin', d) === 0 ? Infinity : trig('cos', d) / trig('sin', d));
      const wrong = [exactHtml(-v), exactHtml(other), exactHtml(-other), isFinite(v) && v !== 0 ? exactHtml(1 / v) : null].filter(Boolean).concat(rng.shuffle(EXACTS));
      const angle = useRad ? radHtml(d) : D(d);
      const ref = d % 90 === 0 ? null : [d, 180 - d, d - 180, 360 - d][quadOf(d)];
      return {
        prompt: `Find the exact value of ${f} ${angle}.`, type: 'choice', answer, choices: options(answer, wrong), params: { f, d },
        hints: [d % 90 === 0 ? `${angle} is on an axis: the point on the unit circle is (${N(Math.round(Math.cos(rad(d))))}, ${N(Math.round(Math.sin(rad(d))))}).` : `The reference angle is ${D(ref)}, and ${useRad ? `${angle} (that's ${D(d)})` : angle} is in quadrant ${QUAD[quadOf(d)]}.`,
          f === 'tan' ? `tan = sin ÷ cos; ${isFinite(v) ? 'work out the size from the reference angle, then the sign from the quadrant' : 'cos is 0 here, so tan has no value there'}.` : `${f} gives the ${f === 'cos' ? 'x' : 'y'}-coordinate; its sign in quadrant ${d % 90 === 0 ? '' : QUAD[quadOf(d)]} decides positive or negative.`,
          `${f} ${angle} = <b>${answer}</b>.`],
      };
    },
    verify(q) { return exactHtml(trig(q.params.f, q.params.d)) === q.answer && q.choices.filter(c => c === q.answer).length === 1; },
  });

  A.skill({
    id: 'trig.quadrant-signs', title: 'Signs of the trig functions',
    learn: p(`Since the point on the unit circle is (cos ${TH}, sin ${TH}), the signs of ${X} and ${V('y')} in each quadrant give the signs of cosine and sine, and tangent is positive when they match.`) +
      p(`<b>Quadrant I: all positive. II: only sin positive. III: only tan positive. IV: only cos positive.</b> A way to remember it: All Students Take Calculus, going counterclockwise from quadrant I.`) +
      example('Example', `If sin ${TH} &lt; 0 and tan ${TH} &gt; 0, sine is negative in III and IV, and tangent is positive in I and III, so ${TH} is in <b>quadrant III</b>.`),
    make(rng) {
      const qd = rng.int(0, 3), [sx, sy] = SIGNS[qd], sg = { sin: sy, cos: sx, tan: sx * sy };
      if (rng.bool()) {
        const [f1, f2] = rng.sample(['sin', 'cos', 'tan'], 2);
        const cmp = f => `${f} ${TH} ${sg[f] > 0 ? '&gt;' : '&lt;'} 0`;
        return { prompt: `If ${cmp(f1)} and ${cmp(f2)}, in which quadrant is ${TH}?`, type: 'choice', keepOrder: true, answer: `Quadrant ${QUAD[qd]}`, choices: QUAD.map(x => `Quadrant ${x}`), params: { kind: 'which', qd, f1, f2 },
          hints: [`${f1} is ${sg[f1] > 0 ? 'positive' : 'negative'} in quadrants ${QUAD.filter((_, i) => ({ sin: SIGNS[i][1], cos: SIGNS[i][0], tan: SIGNS[i][0] * SIGNS[i][1] })[f1] === sg[f1]).join(' and ')}.`,
            `${f2} is ${sg[f2] > 0 ? 'positive' : 'negative'} in quadrants ${QUAD.filter((_, i) => ({ sin: SIGNS[i][1], cos: SIGNS[i][0], tan: SIGNS[i][0] * SIGNS[i][1] })[f2] === sg[f2]).join(' and ')}. Both are true only in <b>quadrant ${QUAD[qd]}</b>.`] };
      }
      const d = qd * 90 + rng.int(5, 85) + 360 * rng.pick([0, 0, 1, -1]), f = rng.pick(['sin', 'cos', 'tan']);
      const answer = sg[f] > 0 ? 'Positive' : 'Negative';
      return { prompt: `Is ${f} ${D(d)} positive or negative?`, type: 'choice', keepOrder: true, answer, choices: ['Positive', 'Negative'], params: { kind: 'sign', d, f },
        hints: [`${D(d)} ends in quadrant ${QUAD[qd]}${d < 0 || d >= 360 ? ` (it's coterminal with ${D(((d % 360) + 360) % 360)})` : ''}.`, `In quadrant ${QUAD[qd]}, ${f} is <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'sign') return (trig(P.f, P.d) > 0 ? 'Positive' : 'Negative') === q.answer;
      const ok = [0, 1, 2, 3].filter(i => { const d = i * 90 + 45; return [P.f1, P.f2].every(f => Math.sign(trig(f, d)) === ({ sin: SIGNS[P.qd][1], cos: SIGNS[P.qd][0], tan: SIGNS[P.qd][0] * SIGNS[P.qd][1] })[f]); });
      return ok.length === 1 && q.answer === `Quadrant ${QUAD[ok[0]]}`;
    },
  });

  A.skill({
    id: 'trig.point-terminal', title: 'Trig ratios from a point on the terminal side',
    learn: p(`If the point (${X}, ${V('y')}) is on the ending side of angle ${TH} (drawn from the positive ${X}-axis), let ${V('r')} = √(${X}² + ${V('y')}²), the distance from the origin. Then <b>sin ${TH} = ${V('y')}/${V('r')}, cos ${TH} = ${X}/${V('r')}, tan ${TH} = ${V('y')}/${X}</b>.`) +
      p(`${V('r')} is always positive, so the signs come from ${X} and ${V('y')}, which matches the quadrant rules.`) +
      example('Example', `For the point (−8, 15): ${V('r')} = √(64 + 225) = 17, so sin ${TH} = ${F(15, 17)}, cos ${TH} = −${F(8, 17)} and tan ${TH} = −${F(15, 8)}.`),
    make(rng) {
      const [t0, t1, r] = rng.pick(TRIPLES), [ax, ay] = rng.bool() ? [t0, t1] : [t1, t0], qd = rng.int(0, 3);
      const x = ax * SIGNS[qd][0], y = ay * SIGNS[qd][1], f = rng.pick(['sin', 'cos', 'tan']);
      const [num, den] = f === 'sin' ? [y, r] : f === 'cos' ? [x, r] : [y, x];
      return {
        prompt: `The point ${M.pt(x, y)} is on the terminal side of angle ${TH}. Find ${f} ${TH} as a fraction.`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { x, y, f },
        hints: [`${V('r')} = √(${x < 0 ? `(${N(x)})` : N(x)}² + ${y < 0 ? `(${N(y)})` : N(y)}²) = √${x * x + y * y} = ${r}.`, `${f} ${TH} = ${f === 'sin' ? `${V('y')}/${V('r')}` : f === 'cos' ? `${X}/${V('r')}` : `${V('y')}/${X}`} = ${N(num)}/${N(den)} = <b>${M.fracText(num, den)}</b>.`],
      };
    },
    verify(q) {
      const { x, y, f } = q.params, th = Math.atan2(y, x);
      return near({ sin: Math.sin(th), cos: Math.cos(th), tan: Math.tan(th) }[f], q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'trig.one-ratio-to-others', title: 'Finding the other ratios from one',
    learn: p(`If you know one trig ratio and the quadrant, you can find the others. <b>Draw a reference triangle from the ratio, find the third side with the Pythagorean theorem, then attach the signs from the quadrant.</b>`) +
      p(`For example, sin ${TH} = ${F(3, 5)} means opposite 3 and hypotenuse 5, so the adjacent side is 4. In quadrant II, cosine is negative: cos ${TH} = −${F(4, 5)} and tan ${TH} = −${F(3, 4)}.`) +
      example('Example', `tan ${TH} = ${F(12, 5)} with ${TH} in quadrant III: the hypotenuse is √(144 + 25) = 13, and in III sine and cosine are both negative, so sin ${TH} = −${F(12, 13)}.`),
    make(rng) {
      const [t0, t1, r] = rng.pick(TRIPLES), [ax, ay] = rng.bool() ? [t0, t1] : [t1, t0], qd = rng.int(0, 3);
      const x = ax * SIGNS[qd][0], y = ay * SIGNS[qd][1];
      const vals = { sin: [y, r], cos: [x, r], tan: [y, x] };
      const [g, f] = rng.sample(['sin', 'cos', 'tan'], 2);
      const [num, den] = vals[f];
      const given = `${g} ${TH} = ${F(...vals[g])}`;
      return {
        prompt: `${given} and ${TH} is in quadrant ${QUAD[qd]}. Find ${f} ${TH} as a fraction.`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { x, y, g, f },
        hints: [`Use a reference triangle with sides ${ax}, ${ay} and ${r} (${M.fracText(Math.abs(vals[g][0]), Math.abs(vals[g][1]))} gives two of them; the Pythagorean theorem gives the third).`,
          `In quadrant ${QUAD[qd]}, ${X} is ${SIGNS[qd][0] > 0 ? 'positive' : 'negative'} and ${V('y')} is ${SIGNS[qd][1] > 0 ? 'positive' : 'negative'}, so ${X} = ${N(x)}, ${V('y')} = ${N(y)}, ${V('r')} = ${r}.`,
          `${f} ${TH} = <b>${M.fracText(num, den)}</b>.`],
      };
    },
    verify(q) {
      const { x, y, f } = q.params, th = Math.atan2(y, x);
      return near({ sin: Math.sin(th), cos: Math.cos(th), tan: Math.tan(th) }[f], q.answer, 1e-9);
    },
  });

  /* ---------- Unit 4: graphs ---------- */
  /** a coefficient times a function name: 3 sin, −sin, ½ sin */
  const coefHtml = (c, f) => (c === 1 ? '' : c === -1 ? '−' : N(c)) + f;
  const bArg = (b, v) => (b === 1 ? v : `${N(b)}${v}`);
  const sinus = (a, f, b, d) => `${V('y')} = ${coefHtml(a, f)}(${bArg(b, X)})${d ? ` ${M.signed(d)}` : ''}`;
  /** a period 2π/b (or π/b) written as a fraction of π */
  const piFrac = (num, den) => { const [n, dd] = M.simp(num, den); return fr((n === 1 ? '' : N(n)) + 'π', dd); };
  A.skill({
    id: 'trig.amplitude-period', title: 'Amplitude, period and midline',
    learn: p(`For ${V('y')} = ${V('a')} sin(${V('b')}${X}) + ${V('d')} or ${V('y')} = ${V('a')} cos(${V('b')}${X}) + ${V('d')}: the <b>amplitude</b> is |${V('a')}|, the <b>period</b> (the length of one full cycle) is 2π ÷ ${V('b')}, and the <b>midline</b> is ${V('y')} = ${V('d')}.`) +
      p(`The graph goes up to ${V('d')} + |${V('a')}| and down to ${V('d')} − |${V('a')}|. A negative ${V('a')} flips the graph, but the amplitude is still positive.`) +
      example('Example', `${V('y')} = −3 sin(2${X}) + 1 has amplitude 3, period 2π ÷ 2 = π, midline ${V('y')} = 1, maximum 4 and minimum −2.`),
    make(rng) {
      const a = rng.pick([1, 2, 3, 4, 5, -1, -2, -3, -4]), b = rng.pick([1, 2, 3, 4, 6]), d = rng.int(-4, 4), f = rng.pick(['sin', 'cos']);
      const kind = rng.pick(['amp', 'period', 'period', 'mid', 'max', 'min']);
      const prompt0 = big(sinus(a, f, b, d));
      if (kind === 'period') {
        const answer = piFrac(2, b), wrong = [piFrac(1, b), piFrac(2 * b, 1), piFrac(4, b), piFrac(1, 2 * b), piFrac(2, 1)];
        return { prompt: `What is the period of this graph?${prompt0}`, type: 'choice', answer, choices: options(answer, wrong), params: { kind, a, b, d, f },
          hints: [`The period is 2π ÷ ${V('b')}, and here ${V('b')} = ${b}.`, `2π ÷ ${b} = <b>${answer}</b>.`] };
      }
      const ans = { amp: Math.abs(a), mid: d, max: d + Math.abs(a), min: d - Math.abs(a) }[kind];
      const what = { amp: 'amplitude', mid: `midline (the ${V('y')}-value of the line ${V('y')} = ?)`, max: 'maximum value', min: 'minimum value' }[kind];
      return { prompt: `What is the ${what} of this graph?${prompt0}`, type: 'number', answer: ans, params: { kind, a, b, d, f },
        hints: [`Amplitude |${V('a')}| = ${Math.abs(a)}, midline ${V('y')} = ${N(d)}.`, kind === 'amp' ? `The amplitude is <b>${Math.abs(a)}</b> (always positive).` : kind === 'mid' ? `The midline is <b>${V('y')} = ${N(d)}</b>.` : `${kind === 'max' ? 'Maximum = midline + amplitude' : 'Minimum = midline − amplitude'} = ${N(d)} ${kind === 'max' ? '+' : '−'} ${Math.abs(a)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, d, f } = q.params, g = x => a * (f === 'sin' ? Math.sin(b * x) : Math.cos(b * x)) + d;
      const xs = Array.from({ length: 2001 }, (_, i) => i * 2 * Math.PI / 2000), ys = xs.map(g);
      const mx = Math.max(...ys), mn = Math.min(...ys);
      if (kind === 'period') { const per = 2 * Math.PI / b; const ok = xs.every(x => near(g(x + per), g(x), 1e-9)) && !near(g(0.37 + per / 2), g(0.37), 1e-6); const m = A.stripTags(q.answer).replace(/\s+/g, ' ').trim().match(/^(\d*)π(?: (\d+))?$/); return ok && !!m && near((m[1] ? +m[1] : 1) * Math.PI / (m[2] ? +m[2] : 1), per, 1e-9); }
      return near({ amp: (mx - mn) / 2, mid: (mx + mn) / 2, max: mx, min: mn }[kind], q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'trig.phase-shift', title: 'Phase shift',
    learn: p(`In ${V('y')} = sin(${V('b')}(${X} − ${V('c')})), the graph of sin(${V('b')}${X}) slides <b>${V('c')} units to the right</b> (to the left if ${V('c')} is negative). That slide is the <b>phase shift</b>.`) +
      p(`<b>If the equation is written as sin(${V('b')}${X} − ${V('k')}), factor out ${V('b')} first:</b> sin(${V('b')}(${X} − ${V('k')}/${V('b')})), so the shift is ${V('k')}/${V('b')}, not ${V('k')}.`) +
      example('Example', `${V('y')} = cos(2${X} − ${radHtml(60)}) = cos(2(${X} − ${radHtml(30)})), so the phase shift is ${radHtml(30)} to the right.`),
    make(rng) {
      const b = rng.pick([1, 2, 3, 4]), cd = rng.pick([30, 45, 60, 90, 120, 135, 150, -30, -45, -60, -90]), f = rng.pick(['sin', 'cos']);
      const expanded = b > 1 && rng.bool();
      const inner = expanded ? `${N(b)}${X} ${cd * b > 0 ? '−' : '+'} ${radHtml(Math.abs(cd * b))}` : `${bArg(b, '')}${b === 1 ? '' : '('}${X} ${cd > 0 ? '−' : '+'} ${radHtml(Math.abs(cd))}${b === 1 ? '' : ')'}`;
      const eq = `${V('y')} = ${f}(${inner})`;
      const say = (deg) => `${radHtml(Math.abs(deg))} to the ${deg > 0 ? 'right' : 'left'}`;
      const answer = say(cd);
      const wrong = [say(-cd), say(cd * b), say(cd * 2), say(-cd * b), say(cd / 2)];
      return {
        prompt: `What is the phase shift of the graph?${big(eq)}`, type: 'choice', answer, choices: options(answer, wrong), params: { b, cd, f },
        hints: [expanded ? `Factor ${b} out of the inside: ${N(b)}${X} ${cd * b > 0 ? '−' : '+'} ${radText(Math.abs(cd * b))} = ${b}(${X} ${cd > 0 ? '−' : '+'} ${radText(Math.abs(cd))}).` : `The inside already has the form ${b === 1 ? '' : `${b}(`}${X} − ${V('c')}${b === 1 ? '' : ')'}.`,
          `${V('c')} = ${cd > 0 ? '' : '−'}${radText(Math.abs(cd))}, so the graph moves <b>${A.stripTags(answer).replace(/\s+/g, ' ')}</b>.`],
      };
    },
    verify(q) {
      const { b, cd, f } = q.params, g = x => (f === 'sin' ? Math.sin : Math.cos)(b * x - b * rad(cd)), base = x => (f === 'sin' ? Math.sin : Math.cos)(b * x);
      // the graph is the base graph moved by cd: g(x) = base(x − c)
      if (![0.3, 1.1, 2.4].every(x => near(g(x), base(x - rad(cd)), 1e-9))) return 'shift mismatch';
      return q.answer.includes(cd > 0 ? 'right' : 'left') && near(degOf(((t) => t)(rad(Math.abs(cd)))), Math.abs(cd), 1e-9);
    },
  });

  /** a sinusoid drawn from 0 to 2π, with the y-axis marked in whole numbers */
  function sinusoidPic(a, f, b, d) {
    const lo = Math.floor(d - Math.abs(a)) - 1, hi = Math.ceil(d + Math.abs(a)) + 1;
    const W = 340, H = Math.max(150, (hi - lo) * 26), L = 34, T = 10, PW = W - L - 10, PH = H - T - 26;
    const px = x => L + x / (2 * Math.PI) * PW, py = y => T + (hi - y) / (hi - lo) * PH;
    let g = '';
    for (let y = lo; y <= hi; y++) g += `<line class="light" x1="${L}" y1="${py(y)}" x2="${L + PW}" y2="${py(y)}" stroke-width="1"/><text x="${L - 6}" y="${py(y) + 4}" font-size="11" text-anchor="end">${N(y)}</text>`;
    ['π/2', 'π', '3π/2', '2π'].forEach((s, i) => { const x = px((i + 1) * Math.PI / 2); g += `<line class="light" x1="${x}" y1="${T}" x2="${x}" y2="${T + PH}" stroke-width="1"/><text x="${x}" y="${H - 8}" font-size="11" text-anchor="middle">${s}</text>`; });
    if (lo <= 0 && hi >= 0) g += `<line class="stroke" x1="${L}" y1="${py(0)}" x2="${L + PW}" y2="${py(0)}" stroke-width="1.4"/>`;
    g += `<line class="stroke" x1="${L}" y1="${T}" x2="${L}" y2="${T + PH}" stroke-width="1.4"/>`;
    const pts = Array.from({ length: 241 }, (_, i) => { const x = i / 240 * 2 * Math.PI; return `${px(x).toFixed(1)},${py(a * (f === 'sin' ? Math.sin(b * x) : Math.cos(b * x)) + d).toFixed(1)}`; }).join(' ');
    g += `<polyline points="${pts}" fill="none" stroke="var(--primary)" stroke-width="2.5"/>`;
    return `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="graph of a sine or cosine curve">${g}</svg>`;
  }
  A.skill({
    id: 'trig.graph-equation', title: 'Matching a graph to its equation',
    learn: p(`To read a sine or cosine graph: find the <b>midline</b> halfway between the highest and lowest points, the <b>amplitude</b> from the midline to a peak, and the <b>period</b> from one peak to the next.`) +
      p(`<b>Then look at ${X} = 0.</b> A sine graph starts on the midline going up (going down if ${V('a')} is negative). A cosine graph starts at a peak (at a low point if ${V('a')} is negative).`) +
      example('Example', `A graph that starts at its highest point 3, drops to −1 at π, and is back at 3 at 2π has midline 1, amplitude 2 and period 2π: ${V('y')} = 2 cos(${X}) + 1.`),
    make(rng) {
      const a = rng.pick([1, 2, 3, -1, -2, -3]), b = rng.pick([1, 2]), d = rng.pick([-1, 0, 0, 1, 2]), f = rng.pick(['sin', 'cos']);
      const opts = [[a, f, b, d], [a, f === 'sin' ? 'cos' : 'sin', b, d], [-a, f, b, d], [a, f, b === 1 ? 2 : 1, d], [a, f, b, d === 0 ? 1 : 0], [a + (a > 0 ? 1 : -1), f, b, d]];
      const html = o => sinus(o[0], o[1], o[2], o[3]);
      const answer = html(opts[0]);
      return { prompt: `Which equation matches the graph?${sinusoidPic(a, f, b, d)}`, type: 'choice', answer, choices: options(answer, opts.slice(1).map(html)), params: { opts },
        hints: [`Midline ${V('y')} = ${N(d)}; the curve reaches ${N(d + Math.abs(a))} and ${N(d - Math.abs(a))}, so the amplitude is ${Math.abs(a)}.`,
          `One full cycle takes ${b === 1 ? '2π' : 'π'}, so 2π ÷ ${V('b')} = ${b === 1 ? '2π' : 'π'} and ${V('b')} = ${b}.`,
          `At ${X} = 0 the curve ${f === 'sin' ? `is on the midline heading ${a > 0 ? 'up' : 'down'}` : `is at its ${a > 0 ? 'highest' : 'lowest'} point`}, so it's ${a < 0 ? 'a flipped ' : 'a '}${f === 'sin' ? 'sine' : 'cosine'}: <b>${answer}</b>.`] };
    },
    verify(q) {
      const ev = o => x => o[0] * (o[1] === 'sin' ? Math.sin(o[2] * x) : Math.cos(o[2] * x)) + o[3];
      const t = ev(q.params.opts[0]), xs = [0.2, 0.9, 1.7, 2.6, 3.9, 5.1];
      const match = q.params.opts.filter(o => q.choices.includes(sinus(o[0], o[1], o[2], o[3])) && xs.every(x => near(ev(o)(x), t(x), 1e-9)));
      return match.length === 1 && sinus(...match[0]) === q.answer;
    },
  });

  A.skill({
    id: 'trig.tangent-graph', title: 'The tangent graph',
    learn: p(`${V('y')} = tan ${X} repeats every π (not 2π), crosses the ${X}-axis at 0, ±π, ±2π, …, and has <b>vertical asymptotes where cos ${X} = 0</b>: at ±π/2, ±3π/2, ….`) +
      p(`<b>For ${V('y')} = ${V('a')} tan(${V('b')}${X}), the period is π ÷ ${V('b')}</b>, and the asymptotes are at ${X} = π/(2${V('b')}) plus any multiple of the period. The ${V('a')} stretches the graph but doesn't move the asymptotes.`) +
      example('Example', `${V('y')} = 3 tan(2${X}) has period π/2, and its first asymptote to the right of 0 is at ${X} = π/4.`),
    make(rng) {
      const a = rng.pick([1, 2, 3, -1, -2]), b = rng.pick([1, 2, 3, 4, 6]), kind = rng.pick(['period', 'asym']);
      const eq = big(`${V('y')} = ${coefHtml(a, 'tan')}(${bArg(b, X)})`);
      if (kind === 'period') {
        const answer = piFrac(1, b), wrong = [piFrac(2, b), piFrac(b, 1), piFrac(1, 2 * b), piFrac(4, b)];
        return { prompt: `What is the period of this graph?${eq}`, type: 'choice', answer, choices: options(answer, wrong), params: { kind, a, b },
          hints: [`Tangent's period is π ÷ ${V('b')} (not 2π ÷ ${V('b')}).`, `π ÷ ${b} = <b>${answer}</b>.`] };
      }
      const answer = `${X} = ${piFrac(1, 2 * b)}`, wrong = [`${X} = ${piFrac(1, b)}`, `${X} = ${piFrac(1, 4 * b)}`, `${X} = ${piFrac(2, b)}`, `${X} = ${piFrac(3, 2 * b)}`];
      return { prompt: `Where is the first vertical asymptote to the right of ${X} = 0?${eq}`, type: 'choice', answer, choices: options(answer, wrong), params: { kind, a, b },
        hints: [`Asymptotes are where cos(${bArg(b, X)}) = 0, first when ${bArg(b, X)} = π/2.`, `${X} = π/2 ÷ ${b}, so the asymptote is at <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, b } = q.params, read = s => { const m = A.stripTags(s).replace(/\s+/g, ' ').trim().match(/(\d*)π(?: (\d+))?$/); return m ? (m[1] ? +m[1] : 1) * Math.PI / (m[2] ? +m[2] : 1) : NaN; };
      const v = read(q.answer);
      if (kind === 'period') return [0.1, 0.25].every(x => near(Math.tan(b * (x + v)), Math.tan(b * x), 1e-6)) && !near(Math.tan(b * (0.1 + v / 2)), Math.tan(b * 0.1), 1e-3);
      return near(Math.cos(b * v), 0, 1e-9) && [0.25, 0.5, 0.75].every(t => Math.abs(Math.cos(b * v * t)) > 1e-6);
    },
  });

  /* ---------- Unit 5: identities ---------- */
  const SQ = s => `${s}<sup>2</sup>`;
  /** trig expressions by name: how they print, and their value at an angle in radians */
  const EXPR = {
    sin: ['sin x', t => Math.sin(t)], cos: ['cos x', t => Math.cos(t)], tan: ['tan x', t => Math.tan(t)], sec: ['sec x', t => 1 / Math.cos(t)], csc: ['csc x', t => 1 / Math.sin(t)], cot: ['cot x', t => Math.cos(t) / Math.sin(t)],
    one: ['1', () => 1], sin2: [`${SQ('sin')} x`, t => Math.sin(t) ** 2], cos2: [`${SQ('cos')} x`, t => Math.cos(t) ** 2], tan2: [`${SQ('tan')} x`, t => Math.tan(t) ** 2], sec2: [`${SQ('sec')} x`, t => 1 / Math.cos(t) ** 2], cot2: [`${SQ('cot')} x`, t => (Math.cos(t) / Math.sin(t)) ** 2], csc2: [`${SQ('csc')} x`, t => 1 / Math.sin(t) ** 2],
    cosCot: ['cos x cot x', t => Math.cos(t) ** 2 / Math.sin(t)], sinTan: ['sin x tan x', t => Math.sin(t) ** 2 / Math.cos(t)], zero: ['0', () => 0],
  };
  const IDS = [
    [`1 − ${SQ('sin')} x`, t => 1 - Math.sin(t) ** 2, 'cos2', `${SQ('sin')} x + ${SQ('cos')} x = 1, so 1 − ${SQ('sin')} x = ${SQ('cos')} x.`],
    [`1 − ${SQ('cos')} x`, t => 1 - Math.cos(t) ** 2, 'sin2', `${SQ('sin')} x + ${SQ('cos')} x = 1, so 1 − ${SQ('cos')} x = ${SQ('sin')} x.`],
    [`${SQ('sec')} x − 1`, t => 1 / Math.cos(t) ** 2 - 1, 'tan2', `1 + ${SQ('tan')} x = ${SQ('sec')} x, so ${SQ('sec')} x − 1 = ${SQ('tan')} x.`],
    [`${SQ('csc')} x − 1`, t => 1 / Math.sin(t) ** 2 - 1, 'cot2', `1 + ${SQ('cot')} x = ${SQ('csc')} x, so ${SQ('csc')} x − 1 = ${SQ('cot')} x.`],
    ['sin x cot x', t => Math.sin(t) * Math.cos(t) / Math.sin(t), 'cos', 'cot x = cos x ÷ sin x, so the sines cancel: cos x.'],
    ['cos x tan x', t => Math.cos(t) * Math.tan(t), 'sin', 'tan x = sin x ÷ cos x, so the cosines cancel: sin x.'],
    ['sin x csc x', t => Math.sin(t) / Math.sin(t), 'one', 'csc x = 1 ÷ sin x, so the product is 1.'],
    ['cos x sec x', t => Math.cos(t) / Math.cos(t), 'one', 'sec x = 1 ÷ cos x, so the product is 1.'],
    [`${fr('sin x', 'tan x')}`, t => Math.sin(t) / Math.tan(t), 'cos', 'Dividing by tan x = sin x ÷ cos x is multiplying by cos x ÷ sin x: the sines cancel, leaving cos x.'],
    [`${fr(`1 − ${SQ('cos')} x`, 'sin x')}`, t => (1 - Math.cos(t) ** 2) / Math.sin(t), 'sin', `1 − ${SQ('cos')} x = ${SQ('sin')} x, and ${SQ('sin')} x ÷ sin x = sin x.`],
    [`${SQ('sin')} x + ${SQ('cos')} x + ${SQ('tan')} x`, t => 1 + Math.tan(t) ** 2, 'sec2', `${SQ('sin')} x + ${SQ('cos')} x = 1, and 1 + ${SQ('tan')} x = ${SQ('sec')} x.`],
    [`(1 + ${SQ('tan')} x)${SQ('cos')} x`, t => (1 + Math.tan(t) ** 2) * Math.cos(t) ** 2, 'one', `1 + ${SQ('tan')} x = ${SQ('sec')} x = 1 ÷ ${SQ('cos')} x, so the product is 1.`],
    ['sec x − sin x tan x', t => 1 / Math.cos(t) - Math.sin(t) * Math.tan(t), 'cos', `Over cos x: (1 − ${SQ('sin')} x) ÷ cos x = ${SQ('cos')} x ÷ cos x = cos x.`],
    ['csc x − sin x', t => 1 / Math.sin(t) - Math.sin(t), 'cosCot', `Over sin x: (1 − ${SQ('sin')} x) ÷ sin x = ${SQ('cos')} x ÷ sin x = cos x · (cos x ÷ sin x) = cos x cot x.`],
    ['sec x − cos x', t => 1 / Math.cos(t) - Math.cos(t), 'sinTan', `Over cos x: (1 − ${SQ('cos')} x) ÷ cos x = ${SQ('sin')} x ÷ cos x = sin x tan x.`],
    [`${SQ('tan')} x − ${SQ('sec')} x`, t => Math.tan(t) ** 2 - 1 / Math.cos(t) ** 2, null, `1 + ${SQ('tan')} x = ${SQ('sec')} x, so ${SQ('tan')} x − ${SQ('sec')} x = −1.`],
  ];
  const TS = [0.4, 0.9, 1.3, 2.2, 2.8, 4.0];
  A.skill({
    id: 'trig.simplify-identities', title: 'Simplifying with identities',
    learn: p(`Three kinds of identities do most of the work. <b>Ratio:</b> tan ${X} = sin ${X}/cos ${X} and cot ${X} = cos ${X}/sin ${X}. <b>Reciprocal:</b> sec ${X} = 1/cos ${X}, csc ${X} = 1/sin ${X}. <b>Pythagorean:</b> ${SQ('sin')} ${X} + ${SQ('cos')} ${X} = 1, and its cousins 1 + ${SQ('tan')} ${X} = ${SQ('sec')} ${X} and 1 + ${SQ('cot')} ${X} = ${SQ('csc')} ${X}.`) +
      p(`<b>A reliable plan: rewrite everything in sines and cosines, combine over a common denominator, then look for ${SQ('sin')} + ${SQ('cos')} = 1.</b>`) +
      example('Example', `sec ${X} − cos ${X} = 1/cos ${X} − cos ${X} = (1 − ${SQ('cos')} ${X})/cos ${X} = ${SQ('sin')} ${X}/cos ${X} = sin ${X} tan ${X}.`),
    make(rng) {
      const k = rng.int(0, IDS.length - 1), [expr, f, ansKey, why] = IDS[k];
      const answer = ansKey ? EXPR[ansKey][0] : '−1';
      const target = ansKey ? EXPR[ansKey][1] : () => -1;
      const pool = rng.shuffle(Object.keys(EXPR).filter(n => n !== ansKey && !TS.every(t => near(EXPR[n][1](t), target(t), 1e-9))));
      const wrongs = pool.map(n => EXPR[n][0]).concat(ansKey ? [] : ['1']);
      return { prompt: `Simplify.${big(expr)}`, type: 'choice', answer, choices: options(answer, wrongs), params: { k },
        hints: [`Rewrite in sines and cosines, or use a Pythagorean identity.`, `${why} The answer is <b>${answer}</b>.`] };
    },
    verify(q) {
      const [, f] = IDS[q.params.k], fns = Object.fromEntries(Object.values(EXPR).map(([h, g]) => [h, g]).concat([['−1', () => -1]]));
      const good = q.choices.filter(c => fns[c] && TS.every(t => near(fns[c](t), f(t), 1e-7)));
      return good.length === 1 && good[0] === q.answer;
    },
  });

  const R6 = M.sqrt(6);
  const SUMFORMS = { pp: fr(`${R6} + ${R2}`, 4), pm: fr(`${R6} − ${R2}`, 4), mp: '−' + fr(`${R6} + ${R2}`, 4), mm: '−' + fr(`${R6} − ${R2}`, 4) };
  const formOf = v => { const s = (Math.sqrt(6) + Math.sqrt(2)) / 4, d = (Math.sqrt(6) - Math.sqrt(2)) / 4; return near(v, s, 1e-9) ? SUMFORMS.pp : near(v, d, 1e-9) ? SUMFORMS.pm : near(v, -s, 1e-9) ? SUMFORMS.mp : near(v, -d, 1e-9) ? SUMFORMS.mm : null; };
  A.skill({
    id: 'trig.sum-difference', title: 'Sum and difference formulas',
    learn: p(`<b>sin(A ± B) = sin A cos B ± cos A sin B</b> and <b>cos(A ± B) = cos A cos B ∓ sin A sin B</b> (the sign flips for cosine). They give exact values for angles like 15°, 75° and 105°, which are sums or differences of 30°, 45° and 60°.`) +
      p(`Write the angle as a sum or difference of two special angles, put in their exact values, and multiply out: √2 × √3 = √6.`) +
      example('Example', `sin 75° = sin(45° + 30°) = ${fr(R2, 2)} · ${fr(R3, 2)} + ${fr(R2, 2)} · ${F(1, 2)} = ${SUMFORMS.pp}.`),
    make(rng) {
      const [ang, A1, B1, op] = rng.pick([[15, 45, 30, '−'], [75, 45, 30, '+'], [105, 60, 45, '+'], [165, 120, 45, '+'], [195, 150, 45, '+'], [255, 210, 45, '+'], [285, 240, 45, '+'], [345, 300, 45, '+']]);
      const f = rng.pick(['sin', 'cos']), useRad = rng.bool();
      const v = trig(f, ang), answer = formOf(v);
      const fa = f === 'sin' ? `sin ${D(A1)} cos ${D(B1)} ${op} cos ${D(A1)} sin ${D(B1)}` : `cos ${D(A1)} cos ${D(B1)} ${op === '+' ? '−' : '+'} sin ${D(A1)} sin ${D(B1)}`;
      return { prompt: `Find the exact value of ${f} ${useRad ? radHtml(ang) : D(ang)}.`, type: 'choice', answer, choices: options(answer, Object.values(SUMFORMS)), params: { f, ang },
        hints: [`${useRad ? `${radHtml(ang)} = ${D(ang)}, and ` : ''}${D(ang)} = ${D(A1)} ${op} ${D(B1)}.`, `${f}(${D(A1)} ${op} ${D(B1)}) = ${fa}.`,
          `Put in the exact values and simplify: <b>${answer}</b>.`] };
    },
    verify(q) { return formOf(trig(q.params.f, q.params.ang)) === q.answer; },
  });

  A.skill({
    id: 'trig.double-angle', title: 'Double-angle formulas',
    learn: p(`<b>sin 2${TH} = 2 sin ${TH} cos ${TH}</b> and <b>cos 2${TH} = ${SQ('cos')} ${TH} − ${SQ('sin')} ${TH}</b> (which also equals 1 − 2${SQ('sin')} ${TH} and 2${SQ('cos')} ${TH} − 1).`) +
      p(`To use them from one known ratio, first find sin ${TH} and cos ${TH} with a reference triangle and the quadrant's signs, then put them in the formula.`) +
      example('Example', `sin ${TH} = ${F(3, 5)} in quadrant II, so cos ${TH} = −${F(4, 5)}. sin 2${TH} = 2 · ${F(3, 5)} · (−${F(4, 5)}) = −${F(24, 25)}, and cos 2${TH} = ${F(16, 25)} − ${F(9, 25)} = ${F(7, 25)}.`),
    make(rng) {
      const [t0, t1, r] = rng.pick(TRIPLES.slice(0, 6)), [ax, ay] = rng.bool() ? [t0, t1] : [t1, t0], qd = rng.int(0, 3);
      const x = ax * SIGNS[qd][0], y = ay * SIGNS[qd][1], g = rng.pick(['sin', 'cos']), f = rng.pick(['sin', 'cos']);
      const [num, den] = f === 'sin' ? [2 * x * y, r * r] : [x * x - y * y, r * r];
      const given = g === 'sin' ? F(y, r) : F(x, r);
      return {
        prompt: `${g} ${TH} = ${given} and ${TH} is in quadrant ${QUAD[qd]}. Find ${f} 2${TH} as a fraction.`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { x, y, f },
        hints: [`From the reference triangle (${ax}, ${ay}, ${r}) and quadrant ${QUAD[qd]}: sin ${TH} = ${M.fracText(y, r)} and cos ${TH} = ${M.fracText(x, r)}.`,
          f === 'sin' ? `sin 2${TH} = 2 sin ${TH} cos ${TH} = 2 · ${M.fracText(y, r)} · ${M.fracText(x, r)}.` : `cos 2${TH} = ${SQ('cos')} ${TH} − ${SQ('sin')} ${TH} = ${x * x}/${r * r} − ${y * y}/${r * r}.`,
          `= <b>${M.fracText(num, den)}</b>.`],
      };
    },
    verify(q) { const { x, y, f } = q.params, th = Math.atan2(y, x); return near(f === 'sin' ? Math.sin(2 * th) : Math.cos(2 * th), q.answer, 1e-9); },
  });

  /* ---------- Unit 6: equations ---------- */
  /** every angle from 0° up to 360° (multiples of 15°) where f equals v */
  const solveSet = (f, v) => { const out = []; for (let d = 0; d < 360; d += 15) { const t = trig(f, d); if (isFinite(v) ? isFinite(t) && near(t, v, 1e-9) : !isFinite(t)) out.push(d); } return out; };
  const listHtml = (ds, useRad) => ds.length ? M.list(ds.map(d => useRad ? radHtml(d) : D(d))) : 'No solutions';
  const SPECIAL_V = { sin: [0, 0.5, -0.5, Math.SQRT2 / 2, -Math.SQRT2 / 2, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 1, -1], cos: [0, 0.5, -0.5, Math.SQRT2 / 2, -Math.SQRT2 / 2, Math.sqrt(3) / 2, -Math.sqrt(3) / 2, 1, -1], tan: [0, 1, -1, Math.sqrt(3), -Math.sqrt(3), Math.sqrt(3) / 3, -Math.sqrt(3) / 3] };
  A.skill({
    id: 'trig.solve-basic', title: 'Solving basic trig equations',
    learn: p(`To solve sin ${X} = ${V('k')} (or cos, or tan) for 0 ≤ ${X} &lt; 360°: <b>find the reference angle from the size of ${V('k')}, then find every quadrant where the function has ${V('k')}'s sign.</b>`) +
      p(`Sine and cosine usually give two answers in one turn, and tangent repeats every 180°, so it also gives two. Values like 1, −1 and 0 land on the axes and can give just one or two.`) +
      example('Example', `cos ${X} = −${F(1, 2)}: the reference angle is 60°, and cosine is negative in quadrants II and III, so ${X} = 180° − 60° = <b>120°</b> or ${X} = 180° + 60° = <b>240°</b>.`),
    make(rng) {
      const f = rng.pick(['sin', 'cos', 'tan']), v = rng.pick(SPECIAL_V[f]), useRad = rng.chance(0.35);
      const sol = solveSet(f, v), answer = listHtml(sol, useRad);
      const alt = [solveSet(f, -v), solveSet(f === 'sin' ? 'cos' : 'sin', v), sol.slice(0, 1), sol.map(d => (d + 180) % 360).sort((a, b) => a - b), sol.map(d => (360 - d) % 360).sort((a, b) => a - b)];
      const range = useRad ? `0 ≤ ${X} &lt; 2π` : `0° ≤ ${X} &lt; 360°`;
      const ref = Math.round(degOf(f === 'tan' ? Math.atan(Math.abs(v)) : Math.asin(Math.min(1, Math.abs(v)))));
      const refAng = f === 'cos' ? Math.round(degOf(Math.acos(Math.abs(v)))) : ref;
      return { prompt: `Solve for ${range}.${big(`${f} ${X} = ${exactHtml(v)}`)}`, type: 'choice', answer, choices: options(answer, alt.map(s => listHtml(s, useRad))), params: { f, v, useRad },
        hints: [v === 0 || Math.abs(v) === 1 ? `${exactHtml(v)} sits on an axis of the unit circle: check where ${f === 'sin' ? 'the y-coordinate' : f === 'cos' ? 'the x-coordinate' : 'y ÷ x'} equals ${exactHtml(v)}.` : `The reference angle is ${D(refAng)}, and ${f} is ${v > 0 ? 'positive' : 'negative'} in quadrants ${QUAD.filter((_, i) => Math.sign({ sin: SIGNS[i][1], cos: SIGNS[i][0], tan: SIGNS[i][0] * SIGNS[i][1] }[f]) === Math.sign(v)).join(' and ')}.`,
          `So ${X} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const { f, v, useRad } = q.params;
      const ok = []; for (let d = 0; d < 360; d += 5) { const t = d * Math.PI / 180, val = f === 'sin' ? Math.sin(t) : f === 'cos' ? Math.cos(t) : Math.tan(t); if (Math.abs(Math.cos(t)) > 1e-9 || f !== 'tan') if (near(val, v, 1e-7)) ok.push(d); }
      return listHtml(ok, useRad) === q.answer;
    },
  });

  const ROOTS = [[-1, 1], [-1, 2], [0, 1], [1, 2], [1, 1]];          // −1, −1/2, 0, 1/2, 1 as [p, q]
  A.skill({
    id: 'trig.solve-quadratic', title: 'Trig equations that factor',
    learn: p(`Some trig equations are quadratics in disguise. In 2${SQ('sin')} ${X} − sin ${X} − 1 = 0, let ${V('u')} = sin ${X}: 2${V('u')}² − ${V('u')} − 1 = 0 factors as (2${V('u')} + 1)(${V('u')} − 1) = 0, so ${V('u')} = −${F(1, 2)} or ${V('u')} = 1.`) +
      p(`<b>Then solve each basic equation separately and collect all the angles.</b> A factor like sin ${X} = 2 gives no angles, because sine is never bigger than 1.`) +
      example('Example', `sin ${X} = −${F(1, 2)} gives 210° and 330°; sin ${X} = 1 gives 90°. So ${X} = 90°, 210° or 330°.`),
    make(rng) {
      const f = rng.pick(['sin', 'cos']), [r1x, r2x] = rng.sample(ROOTS, 2);
      const [p1, q1] = r1x, [p2, q2] = r2x;
      const co = [q1 * q2, -(q1 * p2 + q2 * p1), p1 * p2];               // (q1u − p1)(q2u − p2)
      const g = M.gcd(M.gcd(co[0], co[1]), co[2]) || 1, cc = co.map(c => c / g);
      const u = `${f} ${X}`, poly = M.poly(cc, 'U').replace(/<i>U<\/i><sup>2<\/sup>/, `${SQ(f)} ${X}`).replace(/<i>U<\/i>/, u);
      const sol = [...new Set(solveSet(f, p1 / q1).concat(solveSet(f, p2 / q2)))].sort((a, b) => a - b);
      const answer = listHtml(sol, false);
      const neg = [...new Set(solveSet(f, -p1 / q1).concat(solveSet(f, -p2 / q2)))].sort((a, b) => a - b);
      const alt = [solveSet(f, p1 / q1), solveSet(f, p2 / q2), neg, [...new Set(solveSet(f === 'sin' ? 'cos' : 'sin', p1 / q1).concat(solveSet(f === 'sin' ? 'cos' : 'sin', p2 / q2)))].sort((a, b) => a - b)];
      const fac = (pp, qq) => `${qq === 1 ? '' : qq}${V('u')} ${pp > 0 ? '−' : '+'} ${Math.abs(pp)}`;
      return { prompt: `Solve for 0° ≤ ${X} &lt; 360°.${big(`${poly} = 0`)}`, type: 'choice', answer, choices: options(answer, alt.map(s => listHtml(s, false))), params: { f, roots: [p1 / q1, p2 / q2] },
        hints: [`Let ${V('u')} = ${f} ${X}. ${p1 === 0 || p2 === 0 ? `Factor out ${V('u')}` : `Factor`}: ${p1 === 0 ? `${V('u')}(${fac(p2, q2)})` : p2 === 0 ? `${V('u')}(${fac(p1, q1)})` : `(${fac(p1, q1)})(${fac(p2, q2)})`} = 0${g > 1 ? ` (after dividing by ${g})` : ''}.`,
          `So ${f} ${X} = ${M.fracText(p1, q1)} or ${f} ${X} = ${M.fracText(p2, q2)}.`, `${f} ${X} = ${M.fracText(p1, q1)} gives ${listHtml(solveSet(f, p1 / q1), false)}; ${f} ${X} = ${M.fracText(p2, q2)} gives ${listHtml(solveSet(f, p2 / q2), false)}. All together: <b>${answer}</b>.`] };
    },
    verify(q) {
      const { f, roots } = q.params, ok = [];
      for (let d = 0; d < 360; d += 5) { const u = f === 'sin' ? Math.sin(d * Math.PI / 180) : Math.cos(d * Math.PI / 180); if (roots.some(r => near(u, r, 1e-9))) ok.push(d); }
      return listHtml(ok, false) === q.answer;
    },
  });

  /* ---------- Unit 7: any triangle ---------- */
  A.skill({
    id: 'trig.law-of-sines', title: 'The law of sines',
    learn: p(`In any triangle, each side divided by the sine of the angle across from it gives the same number: <b>${V('a')}/sin A = ${V('b')}/sin B = ${V('c')}/sin C</b>. Use it when you know an angle and the side across from it, plus one more side or angle.`) +
      p(`If you know two angles, the third is 180° minus their sum. Then set up one proportion with the side you want and solve.`) +
      example('Example', `A = 40°, B = 65°, ${V('a')} = 12. Then ${V('b')} = 12 · sin 65° ÷ sin 40° ≈ 12 × 0.9063 ÷ 0.6428 ≈ <b>16.92</b>.`),
    make(rng) {
      const Aa = rng.int(25, 80), Bb = rng.int(25, 80), Cc = 180 - Aa - Bb, a = rng.int(6, 30), kind = rng.pick(['b', 'c']);
      const want = kind === 'b' ? a * Math.sin(rad(Bb)) / Math.sin(rad(Aa)) : a * Math.sin(rad(Cc)) / Math.sin(rad(Aa));
      const ans = r2(want);
      return {
        prompt: `In triangle ABC, A = ${D(Aa)}, B = ${D(Bb)} and ${V('a')} = ${a}. Find ${V(kind)} to the nearest hundredth.${anyTri({ A: D(Aa), B: D(Bb), a: N(a), [kind]: V(kind) })}`, type: 'number', answer: ans, tolerance: 0.02, params: { Aa, Bb, a, kind },
        hints: [kind === 'c' ? `First C = 180° − ${Aa}° − ${Bb}° = ${D(Cc)}.` : `Side ${V('b')} is across from B = ${D(Bb)}.`,
          `${V('a')}/sin A = ${V(kind)}/sin ${kind.toUpperCase()}, so ${V(kind)} = ${a} · sin ${D(kind === 'b' ? Bb : Cc)} ÷ sin ${D(Aa)}.`, `${V(kind)} ≈ <b>${N(ans)}</b>.`],
      };
    },
    verify(q) {
      const { Aa, Bb, a, kind } = q.params, Cc = 180 - Aa - Bb;
      // law of cosines from a and the two sides the law of sines gives
      const b = a * Math.sin(rad(Bb)) / Math.sin(rad(Aa)), c = a * Math.sin(rad(Cc)) / Math.sin(rad(Aa));
      const cosA = (b * b + c * c - a * a) / (2 * b * c);
      return near(degOf(Math.acos(cosA)), Aa, 1e-6) && near(kind === 'b' ? b : c, q.answer, 0.006);
    },
  });

  A.skill({
    id: 'trig.law-of-cosines', title: 'The law of cosines',
    learn: p(`<b>${V('c')}² = ${V('a')}² + ${V('b')}² − 2${V('a')}${V('b')} cos C.</b> It's the Pythagorean theorem with a correction for angles that aren't 90°. Use it when you know two sides and the angle between them (to find the third side), or all three sides (to find an angle).`) +
      p(`To find an angle, rearrange: cos C = (${V('a')}² + ${V('b')}² − ${V('c')}²) ÷ (2${V('a')}${V('b')}), then take cos<sup>−1</sup>.`) +
      example('Example', `${V('a')} = 8, ${V('b')} = 11, C = 50°: ${V('c')}² = 64 + 121 − 176 cos 50° ≈ 71.87, so ${V('c')} ≈ <b>8.48</b>.`),
    make(rng) {
      if (rng.bool()) {
        const a = rng.int(4, 25), b = rng.int(4, 25), Cc = rng.int(20, 150);
        const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(Cc))), ans = r2(c);
        return { prompt: `In triangle ABC, ${V('a')} = ${a}, ${V('b')} = ${b} and C = ${D(Cc)}. Find ${V('c')} to the nearest hundredth.${anyTri({ a: N(a), b: N(b), C: D(Cc), c: V('c') })}`, type: 'number', answer: ans, tolerance: 0.02, params: { kind: 'side', a, b, Cc },
          hints: [`${V('c')}² = ${V('a')}² + ${V('b')}² − 2${V('a')}${V('b')} cos C = ${a * a} + ${b * b} − ${2 * a * b} cos ${D(Cc)}.`, `${V('c')}² ≈ ${N(M.round(c * c, 3))}, so ${V('c')} ≈ <b>${N(ans)}</b>.`] };
      }
      let a, b, c;
      do { a = rng.int(4, 20); b = rng.int(4, 20); c = rng.int(4, 20); } while (a + b <= c || a + c <= b || b + c <= a);
      const ang = degOf(Math.acos((a * a + b * b - c * c) / (2 * a * b))), ans = r1(ang);
      return { prompt: `The sides of triangle ABC are ${V('a')} = ${a}, ${V('b')} = ${b} and ${V('c')} = ${c}. Find angle C to the nearest tenth of a degree.${anyTri({ a: N(a), b: N(b), c: N(c), C: '?' })}`, type: 'number', answer: ans, tolerance: 0.05, unit: '°', params: { kind: 'angle', a, b, c },
        hints: [`cos C = (${V('a')}² + ${V('b')}² − ${V('c')}²) ÷ (2${V('a')}${V('b')}) = (${a * a} + ${b * b} − ${c * c}) ÷ ${2 * a * b} = ${M.fracText(a * a + b * b - c * c, 2 * a * b)}.`, `C = cos<sup>−1</sup>(${M.fracText(a * a + b * b - c * c, 2 * a * b)}) ≈ <b>${D(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'side') { const x = P.a - P.b * Math.cos(rad(P.Cc)), y = P.b * Math.sin(rad(P.Cc)); return near(Math.hypot(x, y), q.answer, 0.006); }
      // place the triangle and measure the angle at C with atan2
      const x = (P.b * P.b + P.a * P.a - P.c * P.c) / (2 * P.a), y = Math.sqrt(P.b * P.b - x * x);
      return near(degOf(Math.atan2(y, x)), q.answer, 0.051);
    },
  });

  A.skill({
    id: 'trig.triangle-area', title: 'The area of a triangle from two sides and an angle',
    learn: p(`The usual area formula is ½ × base × height. If you know two sides and the angle between them, the height is the second side times the sine of the angle, so <b>Area = ½${V('a')}${V('b')} sin C</b>.`) +
      p(`The angle must be the one <b>between</b> the two sides you use. The formula works for obtuse angles too, since sin C is still positive.`) +
      example('Example', `Sides 9 and 14 with a 38° angle between them: Area = ½ × 9 × 14 × sin 38° ≈ 63 × 0.6157 ≈ <b>38.79</b>.`),
    make(rng) {
      const a = rng.int(4, 30), b = rng.int(4, 30), Cc = rng.int(15, 165), ans = r2(0.5 * a * b * Math.sin(rad(Cc)));
      const ctx = rng.pick(['triangle', 'garden', 'sail']);
      const prompt = ctx === 'triangle' ? `Find the area of triangle ABC with ${V('a')} = ${a}, ${V('b')} = ${b} and C = ${D(Cc)}, to the nearest hundredth.${anyTri({ a: N(a), b: N(b), C: D(Cc) })}`
        : ctx === 'garden' ? `A triangular garden has two sides of ${a} ft and ${b} ft with a ${D(Cc)} angle between them. What is its area, to the nearest hundredth of a square foot?`
          : `A triangular sail has edges of ${a} ft and ${b} ft meeting at a ${D(Cc)} angle. What is its area, to the nearest hundredth of a square foot?`;
      return { prompt, type: 'number', answer: ans, tolerance: 0.02, params: { a, b, Cc },
        hints: [`Area = ½${V('a')}${V('b')} sin C, using the angle between the two sides.`, `½ × ${a} × ${b} × sin ${D(Cc)} = ${N(a * b / 2)} × ${N(M.round(Math.sin(rad(Cc)), 4))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { a, b, Cc } = q.params, x = b * Math.cos(rad(Cc)), y = b * Math.sin(rad(Cc));
      return near(Math.abs(a * y - 0 * x) / 2, q.answer, 0.006);        // shoelace with C at the origin, B at (a, 0)
    },
  });

  const HOWMANY = ['No triangle', 'Exactly one triangle', 'Two triangles'];
  A.skill({
    id: 'trig.ambiguous-case', title: 'The ambiguous case (SSA)',
    learn: p(`Knowing two sides and an angle that is <b>not</b> between them (SSA) can give no triangle, one, or two. With angle A, the side ${V('a')} across from it, and side ${V('b')}, compare ${V('a')} with the height ${V('h')} = ${V('b')} sin A.`) +
      p(`<b>If A is acute:</b> ${V('a')} &lt; ${V('h')} gives none, ${V('a')} = ${V('h')} gives one (a right triangle), ${V('h')} &lt; ${V('a')} &lt; ${V('b')} gives two, and ${V('a')} ≥ ${V('b')} gives one. <b>If A is right or obtuse:</b> one triangle if ${V('a')} &gt; ${V('b')}, otherwise none.`) +
      example('Example', `A = 30°, ${V('a')} = 6, ${V('b')} = 10: ${V('h')} = 10 sin 30° = 5, and 5 &lt; 6 &lt; 10, so there are <b>two</b> triangles.`),
    make(rng) {
      const kind = rng.pick(['none', 'one-right', 'two', 'one-big', 'obtuse']);
      let Aa, a, b;
      if (kind === 'one-right') { Aa = 30; a = rng.int(3, 15); b = 2 * a; }
      else if (kind === 'obtuse') { Aa = rng.int(95, 140); b = rng.int(5, 20); a = rng.bool() ? b + rng.int(1, 8) : b - rng.int(1, 4); }
      else {
        Aa = rng.int(25, 70); b = rng.int(8, 30); const h = b * Math.sin(rad(Aa));
        if (kind === 'none') a = Math.max(1, Math.floor(h) - rng.int(0, 2)); else if (kind === 'two') { a = Math.floor(h) + 1; if (a >= b) a = b - 1; } else a = b + rng.int(0, 6);
        if (kind === 'none' && a >= h) a = Math.max(1, Math.floor(h - 0.01));
      }
      const n = count(Aa, a, b), answer = HOWMANY[n];
      const h = b * Math.sin(rad(Aa));
      return { prompt: `In triangle ABC, A = ${D(Aa)}, ${V('a')} = ${a} and ${V('b')} = ${b}. How many triangles have these measurements?`, type: 'choice', keepOrder: true, answer, choices: HOWMANY.slice(), params: { Aa, a, b },
        hints: [Aa >= 90 ? `A is ${Aa === 90 ? 'right' : 'obtuse'}, so there's a triangle only if ${V('a')} &gt; ${V('b')}: is ${a} &gt; ${b}?` : `A is acute. The height is ${V('h')} = ${V('b')} sin A = ${b} sin ${D(Aa)} ≈ ${N(M.round(h, 3))}.`,
          Aa >= 90 ? `${a > b ? 'Yes' : 'No'}, so: <b>${answer}</b>.` : `Compare ${V('a')} = ${a} with ${V('h')} ≈ ${N(M.round(h, 2))} and ${V('b')} = ${b}: <b>${answer}</b>.`] };
    },
    verify(q) {
      // count by solving the law of sines for B directly
      const { Aa, a, b } = q.params, s = b * Math.sin(rad(Aa)) / a;
      let n = 0;
      if (near(s, 1, 1e-9)) n = Aa < 90 ? 1 : 0;                 // sin B = 1: B is a right angle, one triangle
      else if (s < 1) { const B1 = degOf(Math.asin(s)); [B1, 180 - B1].forEach(B => { if (Aa + B < 180 - 1e-9) n++; }); }
      return HOWMANY[n] === q.answer;
    },
  });
  function count(Aa, a, b) {
    if (Aa >= 90) return a > b ? 1 : 0;
    const h = b * Math.sin(rad(Aa));
    if (near(a, h, 1e-9)) return 1;
    if (a < h) return 0;
    return a < b ? 2 : 1;
  }

  /* ---------- Unit 8: inverse trig and polar ---------- */
  A.skill({
    id: 'trig.inverse-exact', title: 'Exact values of inverse trig functions',
    learn: p(`sin<sup>−1</sup>, cos<sup>−1</sup> and tan<sup>−1</sup> give back an angle, but only from a set range so the answer is unique. <b>sin<sup>−1</sup> and tan<sup>−1</sup> give angles from −90° to 90°; cos<sup>−1</sup> gives angles from 0° to 180°.</b>`) +
      p(`So sin<sup>−1</sup>(−${F(1, 2)}) = −30° (not 210°), but cos<sup>−1</sup>(−${F(1, 2)}) = 120°, because cosine's range stays on the top half of the circle.`) +
      example('Example', `tan<sup>−1</sup>(−√3): tan 60° = √3, and tan<sup>−1</sup> answers between −90° and 90°, so the answer is <b>−60°</b>.`),
    make(rng) {
      const f = rng.pick(['sin', 'cos', 'tan']), v = rng.pick(SPECIAL_V[f]);
      const ang = Math.round(degOf(f === 'sin' ? Math.asin(v) : f === 'cos' ? Math.acos(v) : Math.atan(v)));
      return { prompt: `Find the exact value, in degrees.${big(`${f}<sup>−1</sup>(${exactHtml(v)})`)}`, type: 'number', answer: ang, unit: '°', params: { f, v },
        hints: [`${f}<sup>−1</sup> answers between ${f === 'cos' ? '0° and 180°' : '−90° and 90°'}.`, `Which angle in that range has ${f} equal to ${exactHtml(v)}? ${f} ${D(ang)} = ${exactHtml(v)}, so the answer is <b>${D(ang)}</b>.`] };
    },
    verify(q) {
      const { f, v } = q.params, d = q.answer;
      const inRange = f === 'cos' ? d >= 0 && d <= 180 : d >= -90 && d <= 90;
      return inRange && near(trig(f, d), v, 1e-9);
    },
  });

  A.skill({
    id: 'trig.polar-rect', title: 'Polar and rectangular coordinates',
    learn: p(`A point can be named by its distance ${V('r')} from the origin and its angle ${TH} from the positive ${X}-axis: the polar coordinates (${V('r')}, ${TH}). <b>To go to rectangular: ${X} = ${V('r')} cos ${TH} and ${V('y')} = ${V('r')} sin ${TH}.</b>`) +
      p(`<b>To go back: ${V('r')} = √(${X}² + ${V('y')}²) and tan ${TH} = ${V('y')}/${X}</b>, choosing ${TH} in the quadrant where the point actually is.`) +
      example('Example', `(6, 150°) is ${X} = 6 cos 150° ≈ −5.20, ${V('y')} = 6 sin 150° = 3. The point (−5, 12) has ${V('r')} = 13 and ${TH} = 180° − tan<sup>−1</sup>(12/5) ≈ 112.6°.`),
    make(rng) {
      if (rng.bool()) {
        const r = rng.int(2, 12), d = rng.pick(SPECIAL.filter(x => x % 90)), w = rng.pick(['x', 'y']);
        const ans = r2(w === 'x' ? r * Math.cos(rad(d)) : r * Math.sin(rad(d)));
        return { prompt: `The point has polar coordinates (${r}, ${D(d)}). Find its ${V(w)}-coordinate, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.02, params: { kind: 'rect', r, d, w },
          hints: [`${V(w)} = ${V('r')} ${w === 'x' ? 'cos' : 'sin'} ${TH} = ${r} ${w === 'x' ? 'cos' : 'sin'} ${D(d)}.`, `${w === 'x' ? 'cos' : 'sin'} ${D(d)} = ${exactHtml(trig(w === 'x' ? 'cos' : 'sin', d))}, so ${V(w)} ≈ <b>${N(ans)}</b>.`] };
      }
      const [t0, t1, c] = rng.pick(TRIPLES), [ax, ay] = rng.bool() ? [t0, t1] : [t1, t0], qd = rng.int(0, 3);
      const x = ax * SIGNS[qd][0], y = ay * SIGNS[qd][1], w = rng.pick(['r', 'th']);
      if (w === 'r') return { prompt: `Find ${V('r')} for the point ${M.pt(x, y)} in polar coordinates (${V('r')} &gt; 0).`, type: 'number', answer: c, params: { kind: 'r', x, y },
        hints: [`${V('r')} = √(${X}² + ${V('y')}²) = √(${x * x} + ${y * y}).`, `√${c * c} = <b>${c}</b>.`] };
      const th = r1(((degOf(Math.atan2(y, x)) % 360) + 360) % 360);
      return { prompt: `Find the angle ${TH} (0° ≤ ${TH} &lt; 360°) for the point ${M.pt(x, y)} in polar coordinates, to the nearest tenth of a degree.`, type: 'number', answer: th, tolerance: 0.05, unit: '°', params: { kind: 'th', x, y },
        hints: [`The point is in quadrant ${QUAD[qd]}. The reference angle is tan<sup>−1</sup>(${ay}/${ax}) ≈ ${N(r1(degOf(Math.atan(ay / ax))))}°.`, `In quadrant ${QUAD[qd]}, ${TH} = ${['the reference angle', '180° − reference', '180° + reference', '360° − reference'][qd]} ≈ <b>${D(th)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'rect') return near(P.w === 'x' ? P.r * Math.sin(rad(90 - P.d)) : P.r * Math.cos(rad(90 - P.d)), q.answer, 0.006);
      if (P.kind === 'r') return near(Math.sqrt(P.x * P.x + P.y * P.y), q.answer, 1e-9);
      const t = rad(q.answer);
      return near(Math.cos(t) * Math.hypot(P.x, P.y), P.x, 0.05) && near(Math.sin(t) * Math.hypot(P.x, P.y), P.y, 0.05);
    },
  });
})();
