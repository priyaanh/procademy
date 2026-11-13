/* The science lab (#/lab, #/lab/<experiment>, a Tools card): seven small experiments to try the ideas of the
   science course by hand. Sink or float (density, and how much of a floating block is under the surface); a
   circuit with two bulbs in series or in parallel (Ohm's law, a switch, a bulb taken out); a race on a
   distance–time graph (speed as slope, a head start); pushing a cart against friction (F = ma); dropping a ball
   (potential energy turning into kinetic energy); breeding offspring from a Punnett square (chance against the
   square); and a heating curve (temperature flat while melting and boiling). Each lab has sliders, readouts
   worked out with the formula shown, a sentence on what to notice, and a link to practice the matching skill.
   Everything is drawn here as SVG and works offline. The last experiment opened is remembered on this device. */
'use strict';
(function () {
  const V = window.VIEWS, H = V && V._h, M = window.M;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const n = (x, d) => M.n(M.round(x, d == null ? 2 : d));
  const pref = patch => (V.tools && V.tools.pref ? V.tools.pref('lab', patch) : {});
  const G = 9.8;
  let anim = 0;
  const stop = () => { cancelAnimationFrame(anim); anim = 0; };
  window.addEventListener('hashchange', stop);

  /* ---------- the experiments: [id, name, one line, the skill to practice, its name] ---------- */
  const LABS = [
    ['density', 'Sink or float', 'Change an object’s mass and volume, or the liquid, and see whether it floats.', 'sci.sink-float', 'Sinking, floating and layers'],
    ['circuit', 'Circuit with two bulbs', 'Wire two bulbs in series or in parallel, then change the battery and the resistances.', 'sci.series-parallel', 'Series and parallel circuits'],
    ['motion', 'Race on a graph', 'Race two runners and watch their distance–time lines: the steeper line is faster.', 'sci.speed', 'Speed, distance and time'],
    ['forces', 'Push a cart', 'Push a cart against friction and see how the net force and the mass set its acceleration.', 'sci.newtons-second-law', 'Newton’s second law'],
    ['energy', 'Drop a ball', 'Drop a ball from a height and watch potential energy turn into kinetic energy.', 'sci.potential-energy', 'Gravitational potential energy'],
    ['genetics', 'Breed offspring', 'Cross two parents, then breed offspring and compare what happens with the Punnett square.', 'sci.punnett-squares', 'Punnett squares'],
    ['heating', 'Heating curve', 'Heat a substance from solid to gas and watch the temperature stop while it changes state.', 'sci.melting-boiling', 'Melting points, boiling points and heating curves'],
  ];
  const NOTICE = {
    density: 'Only the density matters, not the size: double both the mass and the volume and the block floats exactly as before. A floating block sinks until the share under the surface equals its density ÷ the liquid’s density.',
    circuit: 'In series the same current flows through both bulbs, and taking one out stops both. In parallel each bulb gets the whole battery voltage, so they shine brighter, and one keeps working without the other.',
    motion: 'Each runner’s line is straight because the speed is steady; its slope is the speed. Where the two lines cross, the faster runner catches up.',
    forces: 'If the push is no bigger than the friction, nothing moves: the forces are balanced. Double the mass and the same net force gives half the acceleration.',
    energy: 'The total energy stays the same all the way down: what potential energy loses, kinetic energy gains. The mass doesn’t change the landing speed, only the energy.',
    genetics: 'A few offspring can be far from the square’s percentages, but with hundreds the results get close to it. The square gives chances, not certainties.',
    heating: 'The temperature stops rising twice: while the substance melts and while it boils. The energy goes into pulling the particles apart, so they don’t move faster until the change is done.',
  };

  /* ---------- pieces ---------- */
  const slider = (id, label, min, max, step, val, unit) => `<div class="lab-ctl"><label for="lab-${id}"><span>${label}</span><b id="lab-${id}-v">${n(val)}${unit ? ' ' + unit : ''}</b></label><input id="lab-${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-k="${id}" data-unit="${unit || ''}"></div>`;
  const seg = (id, label, list, on) => `<div class="lab-ctl"><span class="lab-label" id="lab-${id}-l">${label}</span><div class="seg" role="radiogroup" aria-labelledby="lab-${id}-l" data-k="${id}">${list.map(([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${String(v) === String(on)}">${l}</button>`).join('')}</div></div>`;
  const select = (id, label, list, on) => `<div class="lab-ctl"><label for="lab-${id}"><span>${label}</span></label><select id="lab-${id}" data-k="${id}">${list.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(on) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>`;
  const svg = (w, h, body, label, cls) => `<svg class="figure lab-svg${cls ? ' ' + cls : ''}" viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const arrow = (x1, y, x2, label, strong) => {
    if (Math.abs(x2 - x1) < 2) return '';
    const dir = x2 > x1 ? 1 : -1;
    return `<path d="M${x1} ${y}H${x2 - dir * 8}" stroke="currentColor" stroke-width="${strong ? 4 : 2.5}"/><path d="M${x2} ${y}l${-dir * 11} -6v12z" fill="currentColor"/>${label ? `<text x="${(x1 + x2) / 2}" y="${y - 9}" text-anchor="middle" font-size="12" font-weight="700">${label}</text>` : ''}`;
  };

  /* ---------- sink or float ---------- */
  const LIQ = [['water', 'Water', 1], ['salt', 'Salt water', 1.03], ['oil', 'Vegetable oil', 0.92], ['syrup', 'Corn syrup', 1.38], ['alcohol', 'Rubbing alcohol', 0.79]];
  const d2 = x => x.toFixed(2);          // a density, always with two decimals
  const OBJ = [['cork', 'Cork', 12, 50], ['wood', 'Pine wood', 50, 100], ['ice', 'Ice', 92, 100], ['rubber', 'Rubber', 60, 50], ['aluminum', 'Aluminum', 54, 20], ['iron', 'Iron', 78.7, 10], ['gold', 'Gold', 96.6, 5]];
  const density = {
    state: () => ({ m: 60, v: 80, liq: 'water' }),
    controls: s => `${select('obj', 'Try an object', [['', 'Your own block']].concat(OBJ.map(o => [o[0], `${o[1]} (${n(o[2] / o[3])} g/cm³)`])), '')}
      ${slider('m', 'Mass', 1, 500, 0.1, s.m, 'g')}${slider('v', 'Volume', 1, 200, 1, s.v, 'cm³')}
      ${select('liq', 'Liquid', LIQ.map(l => [l[0], `${l[1]} (${d2(l[2])} g/cm³)`]), s.liq)}`,
    set(s, k, v) { if (k === 'obj') { const o = OBJ.find(x => x[0] === v); if (o) { s.m = o[2]; s.v = o[3]; } } else s[k] = k === 'liq' ? v : Number(v); },
    result(s) {
      const d = s.m / s.v, L = LIQ.find(x => x[0] === s.liq), share = d / L[2];
      return { d, ld: L[2], name: L[1], floats: share < 0.995, under: Math.min(1, share) };
    },
    draw(s) {
      const r = density.result(s), side = Math.max(30, Math.min(104, 18 + Math.cbrt(s.v) * 15)), top = 96, bottom = 286;
      const y = r.floats ? top - side * (1 - r.under) : r.under >= 0.995 && r.d / r.ld < 1.005 ? (top + bottom - side) / 2 : bottom - side;
      const depth = Math.min(1, Math.max(0.25, (r.ld - 0.7) / 0.8));
      return svg(400, 300, `<rect x="60" y="30" width="280" height="258" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <rect x="62" y="${top}" width="276" height="${bottom - top + 0}" fill="var(--primary)" opacity="${(0.12 + depth * 0.2).toFixed(2)}"/><path d="M62 ${top}H338" stroke="var(--primary)" stroke-width="2"/>
        <g class="lab-block" style="transform:translate(${200 - side / 2}px,${y.toFixed(1)}px)"><rect width="${side}" height="${side}" rx="4" fill="var(--surface-2)" stroke="currentColor" stroke-width="2.5"/><text x="${side / 2}" y="${side / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700">${n(r.d)}</text></g>
        <text x="200" y="22" text-anchor="middle" font-size="13">${esc(r.name)}: ${d2(r.ld)} g/cm³</text>`, `a tank of ${r.name.toLowerCase()} with a block that ${r.floats ? 'floats' : 'sinks'}`);
    },
    out(s) {
      const r = density.result(s);
      return `<p><b>Density</b> = ${n(s.m, 1)} g ÷ ${n(s.v, 0)} cm³ = <b>${n(r.d)} g/cm³</b>.</p><p class="lab-say">${r.floats ? `That’s less than ${r.name.toLowerCase()} (${d2(r.ld)} g/cm³), so it <b>floats</b>, with about <b>${Math.round(r.under * 100)}%</b> under the surface (${n(r.d)} ÷ ${d2(r.ld)}).` : r.d / r.ld < 1.005 ? `That’s the same as ${r.name.toLowerCase()}, so it <b>hovers</b> wherever it’s put.` : `That’s more than ${r.name.toLowerCase()} (${d2(r.ld)} g/cm³), so it <b>sinks</b>.`}</p>`;
    },
  };

  /* ---------- a circuit with two bulbs ---------- */
  const circuit = {
    state: () => ({ v: 9, r1: 10, r2: 20, mode: 'series', on: true, out1: false }),
    controls: s => `${seg('mode', 'Wiring', [['series', 'Series'], ['parallel', 'Parallel']], s.mode)}
      ${slider('v', 'Battery', 1.5, 24, 1.5, s.v, 'V')}${slider('r1', 'Bulb 1 resistance', 2, 100, 1, s.r1, 'Ω')}${slider('r2', 'Bulb 2 resistance', 2, 100, 1, s.r2, 'Ω')}
      <div class="btn-row lab-btns"><button type="button" class="btn sm" data-act="switch">${s.on ? 'Open the switch' : 'Close the switch'}</button><button type="button" class="btn sm ghost" data-act="bulb">${s.out1 ? 'Put bulb 1 back' : 'Take out bulb 1'}</button></div>`,
    set(s, k, v) { if (k === 'mode') s.mode = v; else s[k] = Number(v); },
    act(s, a) { if (a === 'switch') s.on = !s.on; if (a === 'bulb') s.out1 = !s.out1; return true; },
    result(s) {
      if (!s.on) return { I: 0, I1: 0, I2: 0, V1: 0, V2: 0, P1: 0, P2: 0, R: null };
      if (s.mode === 'series') {
        if (s.out1) return { I: 0, I1: 0, I2: 0, V1: 0, V2: 0, P1: 0, P2: 0, R: null };
        const R = s.r1 + s.r2, I = s.v / R;
        return { R, I, I1: I, I2: I, V1: I * s.r1, V2: I * s.r2, P1: I * I * s.r1, P2: I * I * s.r2 };
      }
      const I1 = s.out1 ? 0 : s.v / s.r1, I2 = s.v / s.r2, R = s.out1 ? s.r2 : s.r1 * s.r2 / (s.r1 + s.r2);
      return { R, I: I1 + I2, I1, I2, V1: s.out1 ? 0 : s.v, V2: s.v, P1: I1 * s.v, P2: I2 * s.v };
    },
    draw(s) {
      const r = circuit.result(s), glow = P => Math.min(0.9, Math.sqrt(P / 20) * 0.9), dur = I => Math.max(0.3, Math.min(6, 1.2 / Math.max(I, 0.01))).toFixed(2);
      const bulb = (x, y, P, k, gone) => gone ? `<circle cx="${x}" cy="${y}" r="16" fill="var(--surface)" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/><text x="${x}" y="${y + 36}" text-anchor="middle" font-size="12">bulb ${k} out</text>`
        : `<circle cx="${x}" cy="${y}" r="26" fill="var(--primary)" opacity="${glow(P).toFixed(2)}"/><circle cx="${x}" cy="${y}" r="16" fill="var(--surface)" stroke="currentColor" stroke-width="2"/><path d="M${x - 9} ${y - 9}l18 18M${x + 9} ${y - 9}l-18 18" stroke="currentColor" stroke-width="1.6"/><text x="${x}" y="${y + 38}" text-anchor="middle" font-size="12" font-weight="700">${k === 1 ? s.r1 : s.r2} Ω</text>`;
      const flow = (d, I) => (I > 0 ? `<path d="${d}" class="lab-flow" style="animation-duration:${dur(I)}s" fill="none" stroke="var(--primary)" stroke-width="3"/>` : '');
      const sw = s.on ? '<path d="M110 30H150" stroke="currentColor" stroke-width="2.5"/>' : '<path d="M110 30L146 12" stroke="currentColor" stroke-width="2.5"/>';
      const batt = `<path d="M50 30V92M50 108V170" stroke="currentColor" stroke-width="2.5"/><path d="M34 92h32" stroke="currentColor" stroke-width="2.5"/><path d="M42 108h16" stroke="currentColor" stroke-width="5"/><text x="28" y="104" text-anchor="end" font-size="13" font-weight="700">${n(s.v, 1)} V</text><circle cx="110" cy="30" r="3" fill="currentColor"/><circle cx="150" cy="30" r="3" fill="currentColor"/>${sw}`;
      let body;
      if (s.mode === 'series') {
        body = `<path d="M50 30H110M150 30H380V170H50" fill="none" stroke="currentColor" stroke-width="2.5"/>${flow('M150 30H380V170H50V30H110', r.I)}${bulb(220, 30, r.P1, 1, s.out1)}${bulb(310, 30, r.P2, 2, false)}`;
      } else {
        body = `<path d="M50 30H110M150 30H360M50 170H360M240 30V170M360 30V170" fill="none" stroke="currentColor" stroke-width="2.5"/>${flow('M150 30H240V170H50V30H110', r.I1)}${flow('M240 30H360V170H240', r.I2)}${bulb(240, 100, r.P1, 1, s.out1)}${bulb(360, 100, r.P2, 2, false)}`;
      }
      const meter = `<rect x="140" y="186" width="150" height="30" rx="8" fill="var(--surface-2)" stroke="currentColor" stroke-width="1.5"/><text x="215" y="206" text-anchor="middle" font-size="13" font-weight="700">current ${n(r.I)} A</text>`;
      return svg(420, 226, batt + body + meter, `a ${n(s.v, 1)} volt battery and two bulbs in ${s.mode}${s.on ? '' : ', switch open'}`, 'lab-circuit');
    },
    out(s) {
      const r = circuit.result(s);
      if (!s.on) return '<p class="lab-say">The switch is open, so there’s no complete path: <b>no current flows</b> and both bulbs are dark.</p>';
      if (s.mode === 'series' && s.out1) return '<p class="lab-say">With bulb 1 out, the only path is broken: <b>no current flows</b>, and bulb 2 goes dark too.</p>';
      const tot = s.mode === 'series' ? `R = ${s.r1} + ${s.r2} = <b>${n(r.R)} Ω</b>` : s.out1 ? `Only bulb 2 is left: R = <b>${s.r2} Ω</b>` : `R = (${s.r1} × ${s.r2}) ÷ (${s.r1} + ${s.r2}) = <b>${n(r.R)} Ω</b>`;
      const b = (k, I, Vb, P) => `<li>Bulb ${k}: ${n(Vb)} V, ${n(I)} A, ${n(P)} W</li>`;
      return `<p>${tot}. Current from the battery: I = V ÷ R = ${n(s.v, 1)} ÷ ${n(r.R)} = <b>${n(r.I)} A</b>.</p><ul class="lab-list">${s.out1 ? '' : b(1, r.I1, r.V1, r.P1)}${b(2, r.I2, r.V2, r.P2)}</ul><p class="lab-say">${s.mode === 'series' ? 'The same current flows through both bulbs, and the battery’s voltage is shared between them.' : s.out1 ? 'Bulb 2 still has its own path to the battery, so it stays on.' : 'Each bulb gets the full battery voltage, and the currents add up.'}</p>`;
    },
  };

  /* ---------- a race on a distance–time graph ---------- */
  const motion = {
    state: () => ({ va: 5, vb: 3.5, head: 20, t: 0 }),
    controls: s => `${slider('va', 'Runner A’s speed', 0.5, 10, 0.5, s.va, 'm/s')}${slider('vb', 'Runner B’s speed', 0.5, 10, 0.5, s.vb, 'm/s')}${slider('head', 'B’s head start', 0, 60, 5, s.head, 'm')}
      <div class="btn-row lab-btns"><button type="button" class="btn sm primary" data-act="play">Start the race</button><button type="button" class="btn sm ghost" data-act="reset">Reset</button></div>`,
    set(s, k, v) { s[k] = Number(v); s.t = 0; },
    act(s, a, redraw) {
      if (a === 'reset') { stop(); s.t = 0; return true; }
      stop();
      const end = motion.result(s).end, t0 = performance.now(), real = 6000;
      const step = now => { s.t = Math.min(end, (now - t0) / real * end); redraw(); if (s.t < end) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
      return false;
    },
    result(s) {
      const L = 100, ta = L / s.va, tb = (L - s.head) / s.vb, catchT = s.va > s.vb && s.head > 0 ? s.head / (s.va - s.vb) : null;
      return { L, ta, tb, end: Math.max(ta, tb), catchT: catchT != null && catchT * s.va <= L ? catchT : null };
    },
    draw(s) {
      const r = motion.result(s), L = r.L, pos = (v, st) => Math.min(L, st + v * s.t), X = d => 40 + d / L * 330;
      const gx = t => 60 + t / r.end * 320, gy = d => 290 - d / L * 140;
      const line = (v, st, tEnd) => `M${gx(0)} ${gy(st)}L${gx(tEnd)} ${gy(Math.min(L, st + v * tEnd))}`;
      const tA = Math.min(s.t, r.ta), tB = Math.min(s.t, r.tb);
      const track = `<path d="M40 40H370M40 80H370" stroke="currentColor" opacity=".35"/><path d="M370 26V94" stroke="currentColor" stroke-width="3"/><text x="370" y="20" text-anchor="middle" font-size="11">finish</text>
        <circle cx="${X(pos(s.va, 0))}" cy="40" r="11" fill="var(--primary)"/><text x="${X(pos(s.va, 0))}" y="44.5" text-anchor="middle" font-size="12" font-weight="800" style="fill:var(--on-primary)">A</text>
        <circle cx="${X(pos(s.vb, s.head))}" cy="80" r="11" fill="var(--surface)" stroke="var(--primary)" stroke-width="3"/><text x="${X(pos(s.vb, s.head))}" y="84.5" text-anchor="middle" font-size="12" font-weight="800">B</text>`;
      const axes = `<path d="M60 140V290H385" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="56" y="${gy(L) + 4}" text-anchor="end" font-size="13">100 m</text><text x="56" y="294" text-anchor="end" font-size="13">0</text><text x="380" y="308" text-anchor="end" font-size="13">${n(r.end, 1)} s</text><text x="222" y="318" text-anchor="middle" font-size="13">time →</text><text x="8" y="130" font-size="13">distance</text>`;
      const graph = `<path d="${line(s.va, 0, r.ta)}" stroke="var(--primary)" stroke-width="2" stroke-dasharray="3 5" opacity=".5"/><path d="${line(s.vb, s.head, r.tb)}" stroke="currentColor" stroke-width="2" stroke-dasharray="3 5" opacity=".4"/>
        <path d="${line(s.va, 0, tA)}" stroke="var(--primary)" stroke-width="3.5"/><path d="${line(s.vb, s.head, tB)}" stroke="currentColor" stroke-width="3.5"/>
        <text x="${gx(r.ta) - 4}" y="${gy(L) - 6}" text-anchor="end" font-size="11" font-weight="700">A</text><text x="${gx(r.tb) + 4}" y="${gy(L) + 14}" font-size="11" font-weight="700">B</text>`;
      return svg(400, 324, track + axes + graph, `a race: A at ${s.va} meters per second, B at ${s.vb} with a ${s.head} meter head start`, 'lab-race');
    },
    out(s) {
      const r = motion.result(s), win = Math.abs(r.ta - r.tb) < 1e-9 ? 'They tie' : r.ta < r.tb ? 'A wins' : 'B wins';
      return `<p>A finishes in 100 ÷ ${n(s.va, 1)} = <b>${n(r.ta, 1)} s</b>. B runs ${100 - s.head} m: ${100 - s.head} ÷ ${n(s.vb, 1)} = <b>${n(r.tb, 1)} s</b>.</p><p class="lab-say"><b>${win}.</b> ${r.catchT != null ? `A catches B after ${n(r.catchT, 1)} s (${s.head} ÷ (${n(s.va, 1)} − ${n(s.vb, 1)})), where the lines cross.` : s.head && s.va > s.vb ? 'A is faster but runs out of track before catching up.' : 'The steeper line is the faster runner.'} Time on the clock: ${n(s.t, 1)} s.</p>`;
    },
  };

  /* ---------- push a cart ---------- */
  const forces = {
    state: () => ({ push: 120, fric: 40, mass: 20, t: 0 }),
    controls: s => `${slider('push', 'Push', 0, 200, 5, s.push, 'N')}${slider('fric', 'Friction (at most)', 0, 100, 5, s.fric, 'N')}${slider('mass', 'Mass of the cart', 1, 100, 1, s.mass, 'kg')}
      <div class="btn-row lab-btns"><button type="button" class="btn sm primary" data-act="play">Let go</button><button type="button" class="btn sm ghost" data-act="reset">Reset</button></div>`,
    set(s, k, v) { s[k] = Number(v); s.t = 0; },
    act(s, a, redraw) {
      stop();
      if (a === 'reset') { s.t = 0; return true; }
      const r = forces.result(s), end = r.a > 0 ? Math.min(10, Math.sqrt(2 * 50 / r.a)) : 3, t0 = performance.now();
      const step = now => { s.t = Math.min(end, (now - t0) / 1000); redraw(); if (s.t < end) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
      return false;
    },
    result(s) { const f = Math.min(s.fric, s.push), net = s.push - f, a = net / s.mass; return { f, net, a, x: Math.min(50, 0.5 * a * s.t * s.t), v: a * s.t }; },
    draw(s) {
      const r = forces.result(s), k = 0.4, cx = 50 + r.x / 50 * 240;          // k: pixels per newton, the same for every arrow
      const cart = `<g transform="translate(${cx.toFixed(1)} 0)"><rect x="0" y="120" width="60" height="36" rx="5" fill="var(--surface-2)" stroke="currentColor" stroke-width="2.5"/><circle cx="14" cy="162" r="7" fill="currentColor"/><circle cx="46" cy="162" r="7" fill="currentColor"/><text x="30" y="143" text-anchor="middle" font-size="13" font-weight="700">${s.mass} kg</text>
        ${arrow(62, 112, 62 + s.push * k, s.push ? `push ${s.push} N` : '')}${arrow(-2, 112, -2 - r.f * k, r.f ? `friction ${r.f} N` : '')}</g>`;
      const net = r.net ? arrow(210 - r.net * k / 2, 44, 210 + r.net * k / 2, `net force ${r.net} N`, true) : '<text x="210" y="44" text-anchor="middle" font-size="14" font-weight="700">net force 0 N: balanced</text>';
      const ground = `<path d="M10 169H410" stroke="currentColor" stroke-width="2"/><path d="M80 176v6M320 176v6" stroke="currentColor"/><text x="80" y="196" text-anchor="middle" font-size="13">0 m</text><text x="320" y="196" text-anchor="middle" font-size="13">50 m</text>`;
      return svg(420, 204, net + ground + cart, `a ${s.mass} kilogram cart pushed with ${s.push} newtons against ${r.f} newtons of friction`, 'lab-cart');
    },
    out(s) {
      const r = forces.result(s);
      if (!r.net) return `<p class="lab-say">Friction pushes back as hard as you push (${r.f} N), so the net force is <b>0 N</b> and the cart <b>doesn’t move</b>. Push harder than ${s.fric} N to start it.</p>`;
      return `<p>Net force = ${s.push} − ${r.f} = <b>${r.net} N</b>. Acceleration = F ÷ m = ${r.net} ÷ ${s.mass} = <b>${n(r.a)} m/s²</b>.</p><p class="lab-say">${s.t ? `After ${n(s.t, 1)} s it’s going <b>${n(r.v, 1)} m/s</b> and has gone ${n(r.x, 1)} m${r.x >= 50 ? ' (the end of the track)' : ''}.` : 'Select Let go to watch it speed up.'}</p>`;
    },
  };

  /* ---------- drop a ball ---------- */
  const energy = {
    state: () => ({ mass: 2, h: 20, t: 0, slow: false }),
    controls: s => `${slider('mass', 'Mass of the ball', 0.5, 10, 0.5, s.mass, 'kg')}${slider('h', 'Height', 1, 50, 1, s.h, 'm')}
      <label class="lab-check"><input type="checkbox" data-k="slow"${s.slow ? ' checked' : ''}> Slow motion (one quarter speed)</label>
      <div class="btn-row lab-btns"><button type="button" class="btn sm primary" data-act="play">Drop the ball</button><button type="button" class="btn sm ghost" data-act="reset">Reset</button></div>`,
    set(s, k, v) { if (k === 'slow') s.slow = !!v; else { s[k] = Number(v); s.t = 0; } },
    act(s, a, redraw) {
      stop();
      if (a === 'reset') { s.t = 0; return true; }
      const end = Math.sqrt(2 * s.h / G), t0 = performance.now(), rate = s.slow ? 0.25 : 1;
      const step = now => { s.t = Math.min(end, (now - t0) / 1000 * rate); redraw(); if (s.t < end) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
      return false;
    },
    result(s) { const fall = Math.min(s.h, 0.5 * G * s.t * s.t), y = s.h - fall, v = G * s.t, PE = s.mass * G * y, KE = 0.5 * s.mass * v * v; return { y, v: Math.min(v, Math.sqrt(2 * G * s.h)), PE, KE: Math.min(KE, s.mass * G * s.h), total: s.mass * G * s.h }; },
    draw(s) {
      const r = energy.result(s), Y = h => 280 - h / 50 * 250, bar = (x, val, label, solid) => { const hh = r.total ? val / r.total * 200 : 0; return `<rect x="${x}" y="${280 - hh}" width="44" height="${hh}" rx="4" fill="${solid ? 'var(--primary)' : 'var(--primary-soft)'}" stroke="var(--primary)" stroke-width="2"/><text x="${x + 22}" y="298" text-anchor="middle" font-size="12" font-weight="700">${label}</text><text x="${x + 22}" y="${272 - hh}" text-anchor="middle" font-size="11">${n(val, 0)} J</text>`; };
      const scale = [0, 10, 20, 30, 40, 50].map(h => `<path d="M48 ${Y(h)}h8" stroke="currentColor"/><text x="44" y="${Y(h) + 4}" text-anchor="end" font-size="13">${h} m</text>`).join('');
      const ledge = `<path d="M56 ${Y(s.h)}h70" stroke="currentColor" stroke-width="3"/>`;
      return svg(400, 306, `<path d="M56 30V280H230" fill="none" stroke="currentColor" stroke-width="2"/>${scale}${ledge}<circle cx="140" cy="${(Y(r.y) - 9).toFixed(1)}" r="9" fill="var(--primary)"/>${bar(270, r.PE, 'PE', true)}${bar(330, r.KE, 'KE', false)}`, `a ${s.mass} kilogram ball dropped from ${s.h} meters, with bars for its potential and kinetic energy`, 'lab-drop');
    },
    out(s) {
      const r = energy.result(s), vEnd = Math.sqrt(2 * G * s.h);
      return `<p>At the top: PE = m × g × h = ${n(s.mass, 1)} × 9.8 × ${s.h} = <b>${n(r.total, 0)} J</b>. At the bottom it’s all kinetic energy, so the ball lands at v = √(2 × 9.8 × ${s.h}) = <b>${n(vEnd, 1)} m/s</b> after ${n(Math.sqrt(2 * s.h / G), 2)} s.</p><p class="lab-say">Now: ${n(r.y, 1)} m up, ${n(r.v, 1)} m/s, PE ${n(r.PE, 0)} J + KE ${n(r.KE, 0)} J = ${n(r.PE + r.KE, 0)} J.</p>`;
    },
  };

  /* ---------- breed offspring ---------- */
  const TRAIT = [['flower', 'Pea flower color', 'P', 'purple', 'white'], ['height', 'Pea plant height', 'T', 'tall', 'short'], ['fur', 'Guinea pig fur color', 'B', 'black', 'white']];
  const genetics = {
    state: () => ({ trait: 'flower', g1: 1, g2: 1, dom: 0, rec: 0 }),
    controls: s => { const T = TRAIT.find(x => x[0] === s.trait), gs = [0, 1, 2].map(k => [k, genetics.geno(T, k)]); return `${select('trait', 'Trait', TRAIT.map(x => [x[0], x[1]]), s.trait)}${seg('g1', 'Parent 1', gs, s.g1)}${seg('g2', 'Parent 2', gs, s.g2)}
      <div class="btn-row lab-btns"><button type="button" class="btn sm primary" data-act="1">Breed 1</button><button type="button" class="btn sm" data-act="10">Breed 10</button><button type="button" class="btn sm" data-act="100">Breed 100</button><button type="button" class="btn sm ghost" data-act="reset">Reset</button></div>`; },
    geno: (T, k) => [T[2] + T[2], T[2] + T[2].toLowerCase(), T[2].toLowerCase() + T[2].toLowerCase()][k],
    set(s, k, v) { if (k === 'trait') s.trait = v; else s[k] = Number(v); s.dom = 0; s.rec = 0; return k === 'trait'; },
    act(s, a) {
      if (a === 'reset') { s.dom = 0; s.rec = 0; return true; }
      const T = TRAIT.find(x => x[0] === s.trait), g1 = genetics.geno(T, s.g1), g2 = genetics.geno(T, s.g2);
      for (let i = 0; i < Number(a); i++) { const kid = g1[Math.random() < 0.5 ? 0 : 1] + g2[Math.random() < 0.5 ? 0 : 1]; if (kid === kid.toLowerCase()) s.rec++; else s.dom++; }
      return true;
    },
    expect(s) { const T = TRAIT.find(x => x[0] === s.trait), g1 = genetics.geno(T, s.g1), g2 = genetics.geno(T, s.g2); let rec = 0; for (const a of g1) for (const b of g2) if ((a + b) === (a + b).toLowerCase()) rec++; return { T, g1, g2, rec: rec / 4 }; },
    draw(s) {
      const e = genetics.expect(s), tot = s.dom + s.rec, bar = (y, label, got, want) => { const w = 220; return `<text x="10" y="${y + 15}" font-size="13" font-weight="700">${esc(label)}</text><rect x="120" y="${y}" width="${w}" height="20" rx="5" fill="var(--surface-2)"/><rect x="120" y="${y}" width="${tot ? (got / tot * w).toFixed(1) : 0}" height="20" rx="5" fill="var(--primary)"/><path d="M${120 + want * w} ${y - 4}v28" stroke="currentColor" stroke-width="2.5"/><text x="346" y="${y + 15}" font-size="12">${tot ? Math.round(got / tot * 100) : 0}%</text>`; };
      const sq = window.SCIENCE && SCIENCE.punnett ? SCIENCE.punnett(e.g1, e.g2, true) : '';
      return `<div class="lab-square">${sq}<p class="small">The square predicts <b>${Math.round((1 - e.rec) * 100)}% ${e.T[3]}</b> and <b>${Math.round(e.rec * 100)}% ${e.T[4]}</b>.</p></div>` +
        svg(390, 112, `${bar(14, cap(e.T[3]), s.dom, 1 - e.rec)}${bar(58, cap(e.T[4]), s.rec, e.rec)}<text x="10" y="106" font-size="12">Bars: the offspring so far. Lines: the square’s prediction.</text>`, `${tot} offspring bred: ${s.dom} ${e.T[3]}, ${s.rec} ${e.T[4]}`, 'lab-bars');
    },
    out(s) {
      const e = genetics.expect(s), tot = s.dom + s.rec;
      return `<p class="lab-say">${tot ? `So far: ${tot} offspring, <b>${s.dom} ${e.T[3]}</b> (${Math.round(s.dom / tot * 100)}%) and <b>${s.rec} ${e.T[4]}</b> (${Math.round(s.rec / tot * 100)}%).` : 'Breed some offspring to compare with the square.'}</p>`;
    },
  };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  /* ---------- a heating curve ---------- */
  const SUB = [['water', 'Water', 0, 100], ['ethanol', 'Ethanol', -114, 78], ['acetone', 'Acetone', -95, 56], ['mercury', 'Mercury', -39, 357], ['lead', 'Lead', 327, 1749]];
  // the energy each stage takes, in a model that uses water's values for every substance: per degree for the solid, liquid and gas, and for melting and boiling
  const STAGE = { cs: 2.1, cl: 4.2, cg: 2, lf: 334, lv: 2260 };
  const heating = {
    state: () => ({ sub: 'water', power: 2, e: 0 }),
    controls: s => `${select('sub', 'Substance', SUB.map(x => [x[0], `${x[1]} (melts at ${n(x[2])} °C, boils at ${n(x[3])} °C)`]), s.sub)}${seg('power', 'Heater', [[1, 'Low'], [2, 'Medium'], [3, 'High']], s.power)}
      <div class="btn-row lab-btns"><button type="button" class="btn sm primary" data-act="play">Start heating</button><button type="button" class="btn sm ghost" data-act="reset">Reset</button></div>`,
    set(s, k, v) { if (k === 'sub') s.sub = v; else s.power = Number(v); s.e = 0; },
    stages(s) {
      const [, , mp, bp] = SUB.find(x => x[0] === s.sub), lo = mp - 30, hi = bp + 30;
      const parts = [['solid', 30 * STAGE.cs, lo, mp], ['melting', STAGE.lf, mp, mp], ['liquid', (bp - mp) * STAGE.cl, mp, bp], ['boiling', STAGE.lv, bp, bp], ['gas', 30 * STAGE.cg, bp, hi]];
      return { mp, bp, lo, hi, parts, total: parts.reduce((a, p) => a + p[1], 0) };
    },
    at(s) {
      const st = heating.stages(s);
      let left = s.e;
      for (const [nm, len, a, b] of st.parts) { if (left <= len) return { st, state: nm, T: a + (b - a) * (len ? left / len : 1) }; left -= len; }
      return { st, state: 'gas', T: st.hi };
    },
    act(s, a, redraw) {
      stop();
      if (a === 'reset') { s.e = 0; return true; }
      const st = heating.stages(s), rate = 160 * s.power, t0 = performance.now(), e0 = s.e >= st.total ? 0 : s.e;
      const step = now => { s.e = Math.min(st.total, e0 + (now - t0) / 1000 * rate); redraw(); if (s.e < st.total) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
      return false;
    },
    draw(s) {
      const cur = heating.at(s), st = cur.st, X = e => 70 + e / st.total * 300, Y = T => 250 - (T - st.lo) / (st.hi - st.lo) * 200;
      const pts = [[0, st.lo]];
      let e = 0;
      for (const [, len, , b] of st.parts) { e += len; pts.push([e, b]); }
      const upTo = [];
      for (let i = 0; i < pts.length; i++) { if (pts[i][0] <= s.e) upTo.push(pts[i]); else { upTo.push([s.e, cur.T]); break; } }
      const poly = list => list.map(([ee, T]) => `${X(ee).toFixed(1)},${Y(T).toFixed(1)}`).join(' ');
      const tick = T => `<text x="64" y="${Y(T) + 4}" text-anchor="end" font-size="13">${n(T)} °C</text><path d="M70 ${Y(T)}H370" stroke="currentColor" stroke-dasharray="3 4" opacity=".3"/>`;
      const dots = heating.particles(cur.state);
      return svg(400, 290, `<path d="M70 40V250H380" fill="none" stroke="currentColor" stroke-width="1.5"/>${tick(st.mp)}${tick(st.bp)}<polyline points="${poly(pts)}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 5" opacity=".35"/><polyline points="${poly(upTo)}" fill="none" stroke="var(--primary)" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${X(s.e).toFixed(1)}" cy="${Y(cur.T).toFixed(1)}" r="5" fill="var(--primary)"/><text x="225" y="278" text-anchor="middle" font-size="13">heat added →</text><text x="8" y="28" font-size="13">temperature</text><g transform="translate(86 46)">${dots}</g>`, `a heating curve: now ${n(cur.T, 0)} degrees Celsius, ${cur.state}`, 'lab-heat');
    },
    /** a small box of particles: packed in a grid, close and jumbled, or spread out */
    particles(state) {
      const P = state === 'solid' || state === 'melting' ? [0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(c => [10 + c * 12, 30 + r * 12]))
        : state === 'gas' || state === 'boiling' ? [[8, 8], [38, 12], [20, 30], [50, 40], [10, 52], [44, 64], [28, 58], [52, 22], [6, 34], [30, 6], [24, 44], [48, 52], [14, 18], [40, 30], [56, 8], [34, 66]]
          : [[10, 40], [22, 44], [34, 42], [46, 44], [14, 52], [27, 55], [40, 53], [52, 55], [8, 64], [20, 66], [32, 65], [44, 66], [16, 30], [30, 31], [42, 32], [54, 34]];
      return `<rect x="0" y="0" width="64" height="74" rx="6" fill="var(--surface-2)" stroke="currentColor"/>${P.map(([x, y]) => `<circle cx="${x + 2}" cy="${y + 2}" r="4.4" fill="var(--primary)"${state === 'gas' || state === 'boiling' ? ' class="lab-jig"' : ''}/>`).join('')}`;
    },
    out(s) {
      const cur = heating.at(s), say = { solid: 'It’s a solid, warming up.', melting: `It’s <b>melting</b>: the temperature stays at ${n(cur.st.mp)} °C until it has all melted.`, liquid: 'It’s a liquid, warming up.', boiling: `It’s <b>boiling</b>: the temperature stays at ${n(cur.st.bp)} °C until it has all turned to gas.`, gas: 'It’s a gas, warming up.' }[cur.state];
      return `<p class="lab-temp"><b>${n(cur.T, 0)} °C</b></p><p class="lab-say">${say}</p><p class="tiny muted">How long each stage takes is a model that uses water’s values for every substance.</p>`;
    },
  };

  const RUN = { density, circuit, motion, forces, energy, genetics, heating };
  const states = {};

  /** the lab page: the experiments to choose from, then the one chosen */
  function page(root, id) {
    stop();
    if (!RUN[id]) id = RUN[pref().last] ? pref().last : 'density';
    pref({ last: id });
    const L = LABS.find(x => x[0] === id), lab = RUN[id], s = states[id] || (states[id] = lab.state());
    root.innerHTML = `<div class="lab-page">
      <div class="lab-head"><h1>Science lab</h1><p class="muted">Small experiments to try the ideas from the science course. Change the numbers, predict what will happen, then watch.</p>
        <nav class="lab-pick" aria-label="Experiments">${LABS.map(([k, name]) => `<a class="chip-btn${k === id ? ' on' : ''}" href="#/lab/${k}"${k === id ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav></div>
      <div class="lab-grid">
        <div class="card lab-stage"><h2>${L[1]}</h2><p class="small muted">${L[2]}</p><div id="lab-fig" class="lab-fig"></div></div>
        <div class="card lab-side"><div id="lab-ctl" class="lab-ctls"></div><div id="lab-out" class="lab-out" aria-live="polite"></div>
          <details class="lab-notice"><summary>What to notice</summary><p class="small">${NOTICE[id]}</p></details>
          <p class="small muted lab-from">From the science course: <a href="#/skill/${encodeURIComponent(L[3])}">${L[4]}</a></p><div class="btn-row"><a class="btn" href="#/skill/${encodeURIComponent(L[3])}">Read the lesson</a><a class="btn ghost" href="#/practice/${encodeURIComponent(L[3])}">Practice it</a></div></div>
      </div></div>`;
    const fig = root.querySelector('#lab-fig'), ctl = root.querySelector('#lab-ctl'), out = root.querySelector('#lab-out');
    const redraw = () => { if (!fig.isConnected) return stop(); fig.innerHTML = lab.draw(s); out.innerHTML = lab.out(s); };
    const controls = () => { ctl.innerHTML = lab.controls(s); };
    controls(); redraw();
    ctl.addEventListener('input', ev => {
      const el = ev.target.closest('input[type=range]'); if (!el) return;
      stop();
      lab.set(s, el.dataset.k, el.value);
      const b = ctl.querySelector(`#lab-${el.dataset.k}-v`); if (b) b.textContent = `${n(Number(el.value))}${el.dataset.unit ? ' ' + el.dataset.unit : ''}`;
      redraw();
    });
    ctl.addEventListener('change', ev => {
      const el = ev.target;
      if (el.tagName === 'SELECT') { stop(); const again = lab.set(s, el.dataset.k, el.value); if (el.dataset.k === 'obj' || again) controls(); redraw(); }
      if (el.type === 'checkbox') { lab.set(s, el.dataset.k, el.checked); redraw(); }
    });
    ctl.addEventListener('click', ev => {
      const r = ev.target.closest('[role="radio"]');
      if (r) { stop(); const g = r.closest('[data-k]'); g.querySelectorAll('[role="radio"]').forEach(x => x.setAttribute('aria-checked', String(x === r))); const again = lab.set(s, g.dataset.k, r.dataset.v); if (again) controls(); redraw(); return; }
      const b = ev.target.closest('[data-act]');
      if (b && lab.act) { const re = lab.act(s, b.dataset.act, redraw); if (re) { if (b.dataset.act === 'switch' || b.dataset.act === 'bulb') controls(); redraw(); } }
    });
    root.__lab = { id, state: s, lab };
    if (H && H.tutorCtx) H.tutorCtx({ notes: `The student is in the science lab, on the experiment "${L[1]}".` });
  }

  window.LAB = { page, LABS, RUN, density, circuit, motion, forces, energy, genetics, heating };
})();
