/* Middle school science, from Procademy's own generators: measurement and units, density and floating, speed,
   velocity and acceleration, forces and weight, energy, work and power, electric circuits (Ohm's law, series and
   parallel, power and cost), heredity with Punnett squares, atoms and the periodic table, chemical formulas and
   balanced equations, and states of matter. Every answer carries its unit beside the box and says how to round.
   verify() re-derives each answer another way: unit changes by powers of ten, temperatures through the −40
   crossing point, physics answers by putting the answer back into the formula, Punnett squares by allele
   probabilities, element facts from the atomic number, and atom counts by spelling formulas out in full.
   Masses in reactions follow the real proportions (from atomic masses). Lessons link to the matching experiment
   in the science lab (lib/lab.js, #/lab). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const N = M.n;
  const p = (s, fig) => `<p>${s}${fig || ''}</p>`;          // a figure goes inside its paragraph, so a lesson's summary reads the words
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 * Math.max(1, Math.abs(b)) : tol);
  const r1 = x => M.round(x, 1), r2 = x => M.round(x, 2), r0 = x => Math.round(x);
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  /** the answer plus up to n − 1 distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  const lab = (id, what) => p(`<a href="#/lab/${id}">${what}</a> in the science lab: change the numbers and watch what happens.`);
  const CU = 'cm³';                                   // cubic centimeters

  const COURSE = {
    id: 'science', title: 'Middle school science', subject: 'Middle school', area: 'science', added: '2026-11-12', grade: 7, icon: 'Sci', hue: 160,
    blurb: 'Measurement and units, density, speed and velocity, forces, energy, electric circuits, heredity and Punnett squares, atoms and the periodic table, chemical formulas and equations, and states of matter, with lab experiments to try.',
    units: [
      { id: 'measurement', title: 'Measurement and units', blurb: 'Metric units and prefixes, the units and tools for each quantity, and temperature scales.', skills: ['sci.metric-units', 'sci.units-tools', 'sci.temperature'] },
      { id: 'density', title: 'Density', blurb: 'Mass divided by volume, measuring volume by displacement, and what floats.', skills: ['sci.density', 'sci.sink-float'] },
      { id: 'motion', title: 'Speed and velocity', blurb: 'Speed, distance and time; velocity and displacement; and acceleration.', skills: ['sci.speed', 'sci.velocity', 'sci.acceleration'] },
      { id: 'forces', title: 'Forces', blurb: 'Net force and balanced forces, Newton’s second law, and mass and weight.', skills: ['sci.net-force', 'sci.newtons-second-law', 'sci.weight'] },
      { id: 'energy', title: 'Energy, work and power', blurb: 'Kinetic and potential energy, energy changing form, work and power.', skills: ['sci.kinetic-energy', 'sci.potential-energy', 'sci.work-power'] },
      { id: 'circuits', title: 'Electric circuits', blurb: 'Ohm’s law, series and parallel circuits, and electric power and its cost.', skills: ['sci.ohms-law', 'sci.series-parallel', 'sci.electric-power'] },
      { id: 'heredity', title: 'Heredity', blurb: 'Genes, dominant and recessive traits, genotypes, and Punnett squares.', skills: ['sci.genotypes', 'sci.punnett-squares'] },
      { id: 'atoms', title: 'Atoms and the periodic table', blurb: 'Protons, neutrons and electrons, isotopes and ions, and groups and periods.', skills: ['sci.atoms', 'sci.periodic-table'] },
      { id: 'chemistry', title: 'Chemical formulas and equations', blurb: 'Counting atoms in a formula, and balancing equations so mass is conserved.', skills: ['sci.counting-atoms', 'sci.balancing-equations'] },
      { id: 'matter', title: 'States of matter', blurb: 'Solids, liquids and gases, the changes between them, and melting and boiling points.', skills: ['sci.states-of-matter', 'sci.melting-boiling'] },
    ],
  };
  A.course(COURSE);

  /* ---------- Unit 1: measurement ---------- */
  const IN_BASE = { km: 1000, m: 1, cm: 0.01, mm: 0.001, kg: 1000, g: 1, mg: 0.001, L: 1, mL: 0.001 };
  const EXP10 = { km: 3, m: 0, cm: -2, mm: -3, kg: 3, g: 0, mg: -3, L: 0, mL: -3 };          // for verify(): the same units as powers of ten
  const FAMILY = { length: ['km', 'm', 'cm', 'mm'], mass: ['kg', 'g', 'mg'], volume: ['L', 'mL'] };
  const FACT = { km: '1 km = 1,000 m', cm: '1 m = 100 cm', mm: '1 cm = 10 mm, and 1 m = 1,000 mm', kg: '1 kg = 1,000 g', mg: '1 g = 1,000 mg', mL: '1 L = 1,000 mL' };
  A.skill({
    id: 'sci.metric-units', title: 'Metric units and prefixes',
    real: 'Scientists everywhere measure in metric units, and so do medicine labels, running races and nutrition labels.',
    mistakes: ['Multiplying when you should divide: changing to a bigger unit gives a smaller number.', 'Moving the decimal point the wrong number of places: centi is 2 places, milli and kilo are 3.'],
    learn: p(`The metric system builds every unit from a base unit and a <b>prefix</b>: <b>kilo-</b> means 1,000, <b>centi-</b> means one hundredth, and <b>milli-</b> means one thousandth. So 1 kilometer = 1,000 meters, 1 meter = 100 centimeters, and 1 gram = 1,000 milligrams.`) +
      p(`Because every step is a power of ten, changing units just moves the decimal point. <b>Changing to a smaller unit, multiply</b> (there are more of them). <b>Changing to a bigger unit, divide.</b> One more useful fact: <b>1 cm³ = 1 mL</b>.`) +
      M.table(['Length', 'Mass', 'Volume'], [['1 km = 1,000 m', '1 kg = 1,000 g', '1 L = 1,000 mL'], ['1 m = 100 cm', '1 g = 1,000 mg', `1 mL = 1 ${CU}`], ['1 cm = 10 mm', '', '']], { compact: true }) +
      example('Example', `Convert 2.5 km to meters: a meter is smaller, so multiply by 1,000: 2.5 × 1,000 = <b>2,500 m</b>. Convert 350 mL to liters: a liter is bigger, so divide: 350 ÷ 1,000 = <b>0.35 L</b>.`),
    make(rng) {
      // units at most three places apart (km and m, g and mg), so the numbers stay sensible
      const fam = rng.pick(Object.keys(FAMILY)), pairs = [];
      FAMILY[fam].forEach(a => FAMILY[fam].forEach(b => { if (a !== b && Math.abs(EXP10[a] - EXP10[b]) <= 3) pairs.push([a, b]); }));
      const [from, to] = rng.pick(pairs);
      if (rng.chance(0.2)) {
        const [u1, u2] = IN_BASE[from] > IN_BASE[to] ? [from, to] : [to, from];
        const a = rng.pick([rng.int(2, 9) / 10, rng.int(1, 5) + 0.5, rng.int(2, 9)]), b = r1(a * IN_BASE[u1] / IN_BASE[u2] * rng.pick([0.8, 0.9, 1.1, 1.25]));
        const firstMore = a * IN_BASE[u1] > b * IN_BASE[u2], ans = firstMore ? `${N(a)} ${u1}` : `${N(b)} ${u2}`, inSmall = M.round(a * IN_BASE[u1] / IN_BASE[u2], 6);
        return { prompt: `Which is more: ${N(a)} ${u1} or ${N(b)} ${u2}?`, type: 'choice', keepOrder: true, answer: ans, choices: [`${N(a)} ${u1}`, `${N(b)} ${u2}`], params: { t: 'more', a, from: u1, b, to: u2 },
          hints: [`Write both in ${u2}: ${N(a)} ${u1} = ${N(inSmall)} ${u2}.`, `${N(inSmall)} ${u2} is ${firstMore ? 'more' : 'less'} than ${N(b)} ${u2}, so <b>${ans}</b> is more.`] };
      }
      const v = rng.pick([rng.int(2, 95), rng.int(1, 9) + rng.pick([0.5, 0.25, 0.2]), rng.int(12, 900) * 10, rng.int(2, 9) / 10]);
      const f = IN_BASE[from] / IN_BASE[to], ans = M.round(v * f, 6), mult = f > 1, k = M.round(mult ? f : 1 / f, 6);
      const fact = [FACT[from], FACT[to]].filter(Boolean).join('; ');
      return { prompt: `Convert ${N(v)} ${from} to ${to}.${big(`${N(v)} ${from} = ? ${to}`)}`, type: 'number', answer: ans, unit: to, params: { t: 'convert', v, from, to },
        hints: [fact ? `${fact}.` : 'Use the prefixes: kilo is 1,000 and milli is one thousandth.', `${mult ? `A ${to} is the smaller unit, so multiply` : `A ${to} is the bigger unit, so divide`} by ${N(k)}.`, `${N(v)} ${mult ? '×' : '÷'} ${N(k)} = <b>${N(ans)} ${to}</b>.`] };
    },
    verify(q) {
      const P = q.params, inTo = (x, a, b) => x * Math.pow(10, EXP10[a] - EXP10[b]);
      if (P.t === 'more') return q.answer === (inTo(P.a, P.from, P.to) > P.b ? `${N(P.a)} ${P.from}` : `${N(P.b)} ${P.to}`);
      return near(inTo(P.v, P.from, P.to), q.answer, 1e-9 * Math.max(1, Math.abs(q.answer)));
    },
  });

  const QTY = [['length', 'meter (m)', 'a meter stick or ruler'], ['mass', 'kilogram (kg)', 'a balance'], ['time', 'second (s)', 'a stopwatch'], ['temperature', 'kelvin (K)', 'a thermometer'], ['force', 'newton (N)', 'a spring scale'], ['energy', 'joule (J)', null], ['power', 'watt (W)', null], ['electric current', 'ampere (A)', 'an ammeter'], ['voltage', 'volt (V)', 'a voltmeter'], ['electrical resistance', 'ohm (Ω)', null], ['volume of a liquid', null, 'a graduated cylinder']];
  // for verify(): what each unit and tool measures, written separately
  const MEASURES = { 'meter (m)': 'length', 'kilogram (kg)': 'mass', 'second (s)': 'time', 'kelvin (K)': 'temperature', 'newton (N)': 'force', 'joule (J)': 'energy', 'watt (W)': 'power', 'ampere (A)': 'electric current', 'volt (V)': 'voltage', 'ohm (Ω)': 'electrical resistance', 'a meter stick or ruler': 'length', 'a balance': 'mass', 'a stopwatch': 'time', 'a thermometer': 'temperature', 'a spring scale': 'force', 'an ammeter': 'electric current', 'a voltmeter': 'voltage', 'a graduated cylinder': 'volume of a liquid' };
  A.skill({
    id: 'sci.units-tools', title: 'Units and measuring tools',
    real: 'Choosing the right tool and unit is the first step of every experiment, and a measurement without its unit means nothing.',
    mistakes: ['Mixing up mass and weight: a balance measures mass in kilograms or grams; a spring scale measures weight, a force, in newtons.', 'Mixing up energy (joules) and power (watts): power is how fast energy is used.'],
    learn: p(`Scientists around the world use the same units, the <b>SI units</b>: the <b>meter</b> for length, the <b>kilogram</b> for mass, the <b>second</b> for time and the <b>kelvin</b> for temperature. Other units are built from these: the <b>newton (N)</b> for force, the <b>joule (J)</b> for energy, and the <b>watt (W)</b> for power.`) +
      p(`For electricity: current in <b>amperes (A)</b>, voltage in <b>volts (V)</b> and resistance in <b>ohms (Ω)</b>. Each quantity has its tool: <b>a balance for mass, a spring scale for force</b> (such as weight), a graduated cylinder for the volume of a liquid, a thermometer, a stopwatch, an ammeter and a voltmeter.`) +
      example('Example', `To find how heavy a backpack is as a force, hang it from a <b>spring scale</b> and read newtons. To find its mass, put it on a <b>balance</b> and read kilograms.`),
    make(rng) {
      const t = rng.pick(['unit', 'what', 'tool']);
      if (t === 'unit') {
        const [qn, unit] = rng.pick(QTY.filter(x => x[1])), others = QTY.filter(x => x[1] && x[1] !== unit).map(x => x[1]);
        return { prompt: `What is the SI unit of ${qn}?`, type: 'choice', answer: unit, choices: options(unit, rng.shuffle(others)), params: { t, qn },
          hints: ['Each quantity has one SI unit, often named after a scientist.', `${cap(qn)} is measured in the <b>${unit}</b>.`] };
      }
      if (t === 'what') {
        const [qn, unit] = rng.pick(QTY.filter(x => x[1])), others = QTY.filter(x => x[0] !== qn && x[1]).map(x => x[0]), sym = unit.match(/\((.*)\)/)[1];
        return { prompt: `The ${unit.replace(/ \(.*\)/, '')} (${sym}) is a unit of what?`, type: 'choice', answer: qn, choices: options(qn, rng.shuffle(others)), params: { t, unit },
          hints: [`Think of where you see the unit ${sym}: on a label, a meter or in a formula.`, `The ${unit} measures <b>${qn}</b>.`] };
      }
      const [qn, , tool] = rng.pick(QTY.filter(x => x[2])), others = QTY.filter(x => x[2] && x[2] !== tool).map(x => x[2]);
      const ask = qn === 'force' ? 'the weight of a bag, as a force' : qn === 'mass' ? 'the mass of a rock' : qn;
      return { prompt: `Which tool measures ${ask}?`, type: 'choice', answer: tool, choices: options(tool, (qn === 'mass' ? ['a spring scale'] : qn === 'force' ? ['a balance'] : []).concat(rng.shuffle(others))), params: { t, qn },
        hints: [qn === 'mass' || qn === 'force' ? 'A balance compares masses; a spring scale stretches under a force.' : `Think of the unit of ${qn} and the tool that reads it.`, `Use <b>${tool}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'what') return MEASURES[P.unit] === q.answer;
      return MEASURES[q.answer] === P.qn;
    },
  });

  A.skill({
    id: 'sci.temperature', title: 'Celsius, Fahrenheit and kelvin',
    real: 'Weather in the United States is given in Fahrenheit, science uses Celsius and kelvin, and recipes and thermometers often show both.',
    mistakes: ['Adding 32 before multiplying by 9/5: multiply first, then add 32.', 'Writing a degree sign with kelvin: it’s just K, and it never goes below zero.'],
    learn: p(`Water freezes at <b>0 °C</b> or <b>32 °F</b>, and boils at <b>100 °C</b> or <b>212 °F</b>. So 100 Celsius degrees cover the same change as 180 Fahrenheit degrees, which is why the formulas use 9/5 and 5/9.`) +
      p(`<b>°F = °C × 9/5 + 32</b> and <b>°C = (°F − 32) × 5/9</b>. The <b>kelvin</b> scale starts at absolute zero, the coldest anything can be: <b>K = °C + 273.15</b>. A kelvin is the same size as a Celsius degree, and it’s written without the degree sign.`) +
      example('Example', `A warm day of 30 °C is 30 × 9/5 + 32 = 54 + 32 = <b>86 °F</b>, and 30 + 273.15 = <b>303.15 K</b>.`),
    make(rng) {
      const t = rng.pick(['c2f', 'f2c', 'c2k', 'k2c']);
      if (t === 'c2f') { const c = rng.pick([rng.int(-6, 20) * 5, rng.int(-20, 45)]), ans = r1(c * 9 / 5 + 32); return { prompt: `Change ${N(c)} °C to degrees Fahrenheit. Round to the nearest tenth if you need to.`, type: 'number', answer: ans, unit: '°F', tolerance: 0.05, params: { t, x: c }, hints: ['°F = °C × 9/5 + 32.', `${N(c)} × 9/5 = ${N(r2(c * 9 / 5))}; add 32: <b>${N(ans)} °F</b>.`] }; }
      if (t === 'f2c') { const f = rng.pick([32 + 9 * rng.int(-6, 10), rng.int(-10, 110)]), ans = r1((f - 32) * 5 / 9); return { prompt: `Change ${N(f)} °F to degrees Celsius. Round to the nearest tenth if you need to.`, type: 'number', answer: ans, unit: '°C', tolerance: 0.05, params: { t, x: f }, hints: ['°C = (°F − 32) × 5/9.', `${N(f)} − 32 = ${N(f - 32)}; × 5/9 = <b>${N(ans)} °C</b>.`] }; }
      if (t === 'c2k') { const c = rng.int(-200, 400), ans = M.round(c + 273.15, 2); return { prompt: `Change ${N(c)} °C to kelvins. Use K = °C + 273.15.`, type: 'number', answer: ans, unit: 'K', tolerance: 0.01, params: { t, x: c }, hints: ['Add 273.15 to the Celsius temperature.', `${N(c)} + 273.15 = <b>${N(ans)} K</b>.`] }; }
      const k = rng.int(10, 700), ans = M.round(k - 273.15, 2);
      return { prompt: `Change ${N(k)} K to degrees Celsius. Use K = °C + 273.15.`, type: 'number', answer: ans, unit: '°C', tolerance: 0.01, params: { t, x: k }, hints: ['Subtract 273.15 from the kelvin temperature.', `${N(k)} − 273.15 = <b>${N(ans)} °C</b>.`] };
    },
    verify(q) {
      const { t, x } = q.params;
      // −40 is the same on both scales: scale the distance from −40 by 9/5 or 5/9
      const got = t === 'c2f' ? (x + 40) * 9 / 5 - 40 : t === 'f2c' ? (x + 40) * 5 / 9 - 40 : t === 'c2k' ? x - (-273.15) : x + (-273.15);
      return near(got, q.answer, t === 'c2k' || t === 'k2c' ? 0.006 : 0.051);
    },
  });

  /* ---------- Unit 2: density ---------- */
  const MATERIALS = [['cork', 0.24], ['ice', 0.92], ['aluminum', 2.7], ['zinc', 7.13], ['iron', 7.87], ['copper', 8.96], ['silver', 10.49], ['lead', 11.34], ['gold', 19.32]];
  const LIQUIDS = [['water', 1], ['salt water', 1.03], ['vegetable oil', 0.92], ['corn syrup', 1.38], ['rubbing alcohol', 0.79]];
  const LAYERS = [['honey', 1.42], ['corn syrup', 1.38], ['dish soap', 1.06], ['water', 1], ['vegetable oil', 0.92], ['lamp oil', 0.8]];
  A.skill({
    id: 'sci.density', title: 'Density',
    real: 'Density is how jewelers check gold, how geologists tell minerals apart, and why a hot-air balloon rises.',
    mistakes: ['Dividing the wrong way: density is mass ÷ volume, not volume ÷ mass.', 'Reading the water level instead of the change: the object’s volume is how far the water rises.'],
    learn: p(`<b>Density</b> is how much mass is packed into each unit of volume: <b>density = mass ÷ volume</b>, often in grams per cubic centimeter (g/${CU}). A brick and a sponge the same size have the same volume, but the brick has more mass, so it’s denser.`) +
      p(`The formula can be turned around: <b>mass = density × volume</b> and <b>volume = mass ÷ density</b>. The volume of a box is length × width × height. For an odd-shaped object, use <b>water displacement</b>: the rise in the water level of a graduated cylinder is the object’s volume (1 mL = 1 ${CU}).`) +
      example('Example', `A stone has a mass of 52 g. It raises the water in a graduated cylinder from 40 mL to 60 mL, so its volume is 20 ${CU}. Its density is 52 ÷ 20 = <b>2.6 g/${CU}</b>.`) + lab('density', 'Try the density experiment'),
    make(rng) {
      const t = rng.pick(['find', 'find', 'mass', 'volume', 'displace', 'identify']);
      if (t === 'find') { const m = rng.int(20, 600), v = rng.int(5, 200), ans = r2(m / v); return { prompt: `An object has a mass of ${m} g and a volume of ${v} ${CU}. What is its density? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: `g/${CU}`, tolerance: 0.01, params: { t, m, v }, hints: ['Density = mass ÷ volume.', `${m} ÷ ${v} ≈ <b>${N(ans)} g/${CU}</b>.`] }; }
      if (t === 'mass') { const [mat, d] = rng.pick(MATERIALS), v = rng.int(2, 60), ans = r1(d * v); return { prompt: `${cap(mat)} has a density of ${N(d)} g/${CU}. What is the mass of a ${v} ${CU} piece? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'g', tolerance: 0.05, params: { t, d, v }, hints: ['Mass = density × volume.', `${N(d)} × ${v} = <b>${N(ans)} g</b>.`] }; }
      if (t === 'volume') { const [mat, d] = rng.pick(MATERIALS.slice(2)), m = rng.int(30, 900), ans = r1(m / d); return { prompt: `A piece of ${mat} (density ${N(d)} g/${CU}) has a mass of ${m} g. What is its volume? Round to the nearest tenth.`, type: 'number', answer: ans, unit: CU, tolerance: 0.05, params: { t, d, m }, hints: ['Volume = mass ÷ density.', `${m} ÷ ${N(d)} ≈ <b>${N(ans)} ${CU}</b>.`] }; }
      if (t === 'displace') {
        const v1 = rng.int(4, 12) * 5, dv = rng.int(4, 30), m = rng.int(15, 200), ans = r2(m / dv), who = rng.pick(NAMES);
        return { prompt: `${who} drops a ${m} g rock into a graduated cylinder. The water rises from ${v1} mL to ${v1 + dv} mL. What is the rock’s density? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: `g/${CU}`, tolerance: 0.01, params: { t, m, v1, v2: v1 + dv },
          hints: [`The rock’s volume is the rise in the water: ${v1 + dv} − ${v1} = ${dv} mL = ${dv} ${CU}.`, `Density = ${m} ÷ ${dv} ≈ <b>${N(ans)} g/${CU}</b>.`] };
      }
      const [mat, d] = rng.pick(MATERIALS.slice(2)), l = rng.int(2, 6), w = rng.int(2, 5), h = rng.int(1, 4), v = l * w * h, m = r1(d * v);
      const others = rng.shuffle(MATERIALS.slice(2).filter(x => x[0] !== mat)).slice(0, 3), shown = rng.shuffle([[mat, d]].concat(others));
      return { prompt: `A block measures ${l} cm × ${w} cm × ${h} cm and has a mass of ${N(m)} g. Which metal is it most likely made of?${M.table(['Metal', `Density (g/${CU})`], shown.map(([a, b]) => [a, N(b)]), { compact: true })}`, type: 'choice', answer: mat, choices: shown.map(x => x[0]), params: { t, m, v, shown },
        hints: [`Volume = ${l} × ${w} × ${h} = ${v} ${CU}.`, `Density = ${N(m)} ÷ ${v} ≈ ${N(r2(m / v))} g/${CU}.`, `That matches <b>${mat}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'find') return near(q.answer * P.v, P.m, 0.0051 * P.v);
      if (P.t === 'mass') return near(q.answer / P.v, P.d, 0.051 / P.v);
      if (P.t === 'volume') return near(q.answer * P.d, P.m, 0.051 * P.d);
      if (P.t === 'displace') return near(q.answer * (P.v2 - P.v1), P.m, 0.0051 * (P.v2 - P.v1));
      const dens = P.m / P.v, best = P.shown.slice().sort((a, b) => Math.abs(a[1] - dens) - Math.abs(b[1] - dens))[0];
      return best[0] === q.answer && Math.abs(best[1] - dens) < 0.1;
    },
  });

  A.skill({
    id: 'sci.sink-float', title: 'Sinking, floating and layers',
    real: 'Ships float because their hollow hulls make their average density less than water’s, and an iceberg floats with about nine tenths under the surface.',
    mistakes: ['Thinking heavy things always sink: a huge log floats, because what matters is density, not mass.', 'Comparing with water when the liquid is something else: compare with that liquid’s own density.'],
    learn: p(`An object <b>floats if it’s less dense than the liquid</b> it’s in, and <b>sinks if it’s denser</b>. Water’s density is 1.00 g/${CU}, so wood (about 0.5) floats and aluminum (2.7) sinks. It doesn’t matter how big the object is.`) +
      p(`A floating object sinks until it pushes aside its own weight of liquid. <b>The fraction under the surface equals the object’s density ÷ the liquid’s density</b>: ice (0.92) floats in water with 92% under the surface. Liquids that don’t mix settle in layers, with <b>the densest at the bottom</b>.`) +
      example('Example', `A toy has a mass of 30 g and a volume of 40 ${CU}: its density is 0.75 g/${CU}, less than water’s, so it <b>floats</b>, with 75% of it under the water.`) + lab('density', 'Drop objects into different liquids'),
    make(rng) {
      const t = rng.pick(['float', 'float', 'percent', 'layers']);
      if (t === 'float') {
        const [liq, ld] = rng.pick(LIQUIDS);
        let m, v;
        do { v = rng.int(10, 120); m = rng.int(5, 260); } while (Math.abs(m / v - ld) < 0.06);
        const ans = m / v < ld ? 'It floats.' : 'It sinks.';
        return { prompt: `An object has a mass of ${m} g and a volume of ${v} ${CU}. It is dropped into ${liq}, which has a density of ${N(ld)} g/${CU}. What happens?`, type: 'choice', keepOrder: true, answer: ans, choices: ['It floats.', 'It sinks.'], params: { t, m, v, ld },
          hints: [`The object’s density is ${m} ÷ ${v} ≈ ${N(r2(m / v))} g/${CU}.`, `Compare with ${N(ld)} g/${CU}: ${m / v < ld ? 'less dense, so it floats' : 'denser, so it sinks'}. <b>${ans}</b>`] };
      }
      if (t === 'percent') {
        const [liq, ld] = rng.pick(LIQUIDS.filter(x => x[1] >= 1)), od = r2(rng.int(4, 18) * 0.05), ans = r0(od / ld * 100);
        return { prompt: `A block of wood with a density of ${N(od)} g/${CU} floats in ${liq} (density ${N(ld)} g/${CU}). What percent of the block is under the surface? Round to the nearest whole percent.`, type: 'number', answer: ans, unit: '%', params: { t, od, ld },
          hints: ['The fraction under the surface = the object’s density ÷ the liquid’s density.', `${N(od)} ÷ ${N(ld)} ≈ ${N(M.round(od / ld, 3))}, which is about <b>${ans}%</b>.`] };
      }
      const three = rng.sample(LAYERS, 3), top = rng.bool(), sorted = three.slice().sort((a, b) => a[1] - b[1]), ans = (top ? sorted[0] : sorted[2])[0];
      return { prompt: `${three.map(x => `${cap(x[0])} (${N(x[1])} g/${CU})`).join(', ')} are poured gently into a jar and settle into layers. Which liquid ends up on the ${top ? 'top' : 'bottom'}?`, type: 'choice', answer: ans, choices: three.map(x => x[0]), params: { t, three, top },
        hints: ['Liquids that don’t mix settle with the densest at the bottom and the least dense on top.', `The ${top ? 'least' : 'most'} dense is <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'float') return q.answer === (P.m < P.ld * P.v ? 'It floats.' : 'It sinks.');
      if (P.t === 'percent') return Math.abs(q.answer * P.ld - P.od * 100) <= 0.5 * P.ld + 1e-9;
      const ds = P.three.map(x => x[1]), want = P.top ? Math.min(...ds) : Math.max(...ds);
      return P.three.find(x => x[1] === want)[0] === q.answer;
    },
  });

  /* ---------- Unit 3: motion ---------- */
  A.skill({
    id: 'sci.speed', title: 'Speed, distance and time',
    real: 'Speed limits, running paces and travel times all come from speed = distance ÷ time.',
    mistakes: ['Mixing units: if the time is in minutes and you want kilometers per hour, change the minutes to hours first.', 'Multiplying distance by time to get speed: speed is distance ÷ time.'],
    learn: p(`<b>Speed</b> is how far something goes in each unit of time: <b>speed = distance ÷ time</b>. A runner who covers 100 m in 20 s averages 100 ÷ 20 = 5 meters per second (m/s). Turned around: <b>distance = speed × time</b> and <b>time = distance ÷ speed</b>.`) +
      p(`Keep the units matched: kilometers and hours give km/h; meters and seconds give m/s. To change m/s to km/h, multiply by 3.6 (an hour is 3,600 seconds and a kilometer is 1,000 meters).`) +
      example('Example', `A train goes 270 km in 1.5 h. Its average speed is 270 ÷ 1.5 = <b>180 km/h</b>, which is 180 ÷ 3.6 = 50 m/s.`) + lab('motion', 'Race two runners on a distance–time graph'),
    make(rng) {
      const t = rng.pick(['speed', 'distance', 'time', 'convert']), who = rng.pick(NAMES);
      if (t === 'speed') {
        const [d, tt, du, tu, su] = rng.pick([[rng.int(50, 800), rng.int(8, 120), 'm', 's', 'm/s'], [rng.int(20, 600), rng.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), 'km', 'h', 'km/h']]), ans = r1(d / tt);
        return { prompt: `${who} travels ${N(d)} ${du} in ${N(tt)} ${tu}. What is ${who}’s average speed? Round to the nearest tenth.`, type: 'number', answer: ans, unit: su, tolerance: 0.05, params: { t, d, tt }, hints: ['Speed = distance ÷ time.', `${N(d)} ÷ ${N(tt)} ≈ <b>${N(ans)} ${su}</b>.`] };
      }
      if (t === 'distance') { const v = rng.int(4, 90), tt = rng.pick([0.25, 0.5, 1.5, 2, 2.5, 3, 4]), ans = M.round(v * tt, 4); return { prompt: `A car travels at an average speed of ${v} km/h for ${N(tt)} h. How far does it go?`, type: 'number', answer: ans, unit: 'km', params: { t, v, tt }, hints: ['Distance = speed × time.', `${v} × ${N(tt)} = <b>${N(ans)} km</b>.`] }; }
      if (t === 'time') { const v = rng.pick([2, 3, 4, 5, 6, 8, 10, 12, 15]), d = v * rng.int(5, 90), ans = d / v; return { prompt: `A cyclist rides ${N(d)} m at a steady ${v} m/s. How many seconds does it take?`, type: 'number', answer: ans, unit: 's', params: { t, v, d }, hints: ['Time = distance ÷ speed.', `${N(d)} ÷ ${v} = <b>${N(ans)} s</b>.`] }; }
      const toKmh = rng.bool(), x = toKmh ? rng.int(2, 40) : rng.int(2, 30) * 9, ans = toKmh ? r1(x * 3.6) : r1(x / 3.6);
      return { prompt: `Change ${x} ${toKmh ? 'm/s to km/h' : 'km/h to m/s'}. Round to the nearest tenth if you need to.`, type: 'number', answer: ans, unit: toKmh ? 'km/h' : 'm/s', tolerance: 0.05, params: { t, x, toKmh },
        hints: ['1 m/s = 3.6 km/h, because an hour is 3,600 s and a kilometer is 1,000 m.', `${x} ${toKmh ? '×' : '÷'} 3.6 = <b>${N(ans)} ${toKmh ? 'km/h' : 'm/s'}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'speed') return near(q.answer * P.tt, P.d, 0.051 * P.tt);
      if (P.t === 'distance') return near(q.answer / P.tt, P.v);
      if (P.t === 'time') return near(q.answer * P.v, P.d);
      return P.toKmh ? near(q.answer * 1000 / 3600, P.x, 0.02) : near(q.answer * 3600 / 1000, P.x, 0.2);
    },
  });

  A.skill({
    id: 'sci.velocity', title: 'Velocity and displacement',
    real: 'Pilots, sailors and weather reports give velocities, a speed with a direction, because the direction matters as much as the speed.',
    mistakes: ['Using the total distance for velocity: velocity uses the displacement, the change in position from start to finish.', 'Leaving off the direction: a velocity needs one, such as east or north.'],
    learn: p(`<b>Distance</b> is how far you travel in all. <b>Displacement</b> is how far you end up from where you started, and in which direction. Walk 30 m east and then 10 m west: the distance is 40 m, but the displacement is 20 m east.`) +
      p(`<b>Speed = distance ÷ time</b>, but <b>velocity = displacement ÷ time</b>, and velocity has a direction. Taking one direction as positive (east, say), a move the other way counts as negative. Along a line, velocities add: a boat going 5 m/s through water that flows 2 m/s the same way goes 7 m/s past the shore.`) +
      example('Example', `In 10 s, Ana walks 30 m east and then 10 m west. Her average speed is 40 ÷ 10 = 4 m/s, and her average velocity is 20 m ÷ 10 s = <b>2 m/s east</b>.`) + lab('motion', 'See position and time on a graph'),
    make(rng) {
      const t = rng.pick(['speed', 'velocity', 'displacement', 'river', 'which']), who = rng.pick(NAMES);
      if (t === 'which') {
        const v = rng.int(3, 40), dir = rng.pick(['north', 'east', 'south', 'west']), ans = `${v} m/s ${dir}`;
        return { prompt: 'Which of these is a velocity?', type: 'choice', answer: ans, choices: [ans, `${v} m/s`, `${v} m ${dir}`, `${v} s`], params: { t },
          hints: ['A velocity is a speed together with a direction.', `<b>${ans}</b> has a speed (m/s) and a direction.`] };
      }
      const a = rng.int(10, 90), b = rng.int(5, 80), tt = rng.int(5, 40), dirs = rng.pick([['east', 'west'], ['north', 'south']]);
      if (t === 'river') {
        const vb = rng.int(3, 12), vc = rng.int(1, vb - 1), down = rng.bool(), ans = down ? vb + vc : vb - vc;
        return { prompt: `A boat moves at ${vb} m/s through the water. The river flows at ${vc} m/s. How fast does the boat move past the shore when it heads ${down ? 'downstream (with the current)' : 'upstream (against the current)'}?`, type: 'number', answer: ans, unit: 'm/s', params: { t, vb, vc, down },
          hints: [down ? 'Going with the current, the velocities add.' : 'Going against the current, the current takes away from the boat’s velocity.', `${vb} ${down ? '+' : '−'} ${vc} = <b>${ans} m/s</b>.`] };
      }
      const story = `${who} walks ${a} m ${dirs[0]}, then ${b} m ${dirs[1]}, in ${tt} s.`;
      if (t === 'displacement') { const ans = Math.abs(a - b), side = a === b ? '' : a > b ? dirs[0] : dirs[1]; return { prompt: `${who} walks ${a} m ${dirs[0]}, then ${b} m ${dirs[1]}. How far is ${who} from the starting point (the size of the displacement)?`, type: 'number', answer: ans, unit: 'm', params: { t, a, b }, hints: ['The two moves are in opposite directions, so subtract.', `The difference of ${a} and ${b} is <b>${ans} m</b>${side ? ' ' + side : ''}.`] }; }
      if (t === 'speed') { const ans = r1((a + b) / tt); return { prompt: `${story} What is the average speed? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'm/s', tolerance: 0.05, params: { t, a, b, tt }, hints: [`Speed uses the total distance: ${a} + ${b} = ${a + b} m.`, `${a + b} ÷ ${tt} ≈ <b>${N(ans)} m/s</b>.`] }; }
      const ans = r1((a - b) / tt);
      return { prompt: `${story} Taking ${dirs[0]} as positive, what is the average velocity? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'm/s', tolerance: 0.05, params: { t, a, b, tt },
        hints: [`Displacement = ${a} − ${b} = ${N(a - b)} m (${dirs[0]} is positive).`, `Velocity = ${N(a - b)} ÷ ${tt} ≈ <b>${N(ans)} m/s</b>${ans < 0 ? `, which means ${dirs[1]}` : ''}.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'which') return /m\/s (north|east|south|west)$/.test(q.answer);
      if (P.t === 'river') return q.answer === (P.down ? P.vb + P.vc : P.vb - P.vc);
      if (P.t === 'displacement') return q.answer === Math.max(P.a, P.b) - Math.min(P.a, P.b);
      if (P.t === 'speed') return near(q.answer * P.tt, P.a + P.b, 0.051 * P.tt);
      return near(q.answer * P.tt + P.b, P.a, 0.051 * P.tt);
    },
  });

  A.skill({
    id: 'sci.acceleration', title: 'Acceleration',
    real: 'Car makers measure how quickly a car reaches 100 km/h, and engineers design roller coasters around their acceleration.',
    mistakes: ['Subtracting in the wrong order: it’s final velocity minus starting velocity.', 'Thinking slowing down isn’t acceleration: slowing down is a negative acceleration.'],
    learn: p(`<b>Acceleration</b> is how quickly velocity changes: <b>acceleration = (final velocity − starting velocity) ÷ time</b>. Its unit is meters per second per second, written <b>m/s²</b>. Speeding up, slowing down and turning are all acceleration.`) +
      p(`A negative acceleration means slowing down (when moving in the positive direction). Turned around, <b>final velocity = starting velocity + acceleration × time</b>. Near Earth’s surface, a falling object speeds up by about <b>9.8 m/s every second</b> (ignoring air resistance).`) +
      example('Example', `A bike goes from 2 m/s to 8 m/s in 3 s: (8 − 2) ÷ 3 = <b>2 m/s²</b>. A car slowing from 20 m/s to 5 m/s in 5 s has (5 − 20) ÷ 5 = <b>−3 m/s²</b>.`),
    make(rng) {
      const t = rng.pick(['find', 'find', 'final', 'time', 'fall']);
      if (t === 'find') {
        const vi = rng.int(0, 25), vf = rng.int(0, 30), tt = rng.int(2, 12), ans = r2((vf - vi) / tt);
        if (vf === vi) return { prompt: `A cart moves at a steady ${vi} m/s for ${tt} s. What is its acceleration?`, type: 'number', answer: 0, unit: 'm/s²', params: { t, vi, vf, tt }, hints: ['Its velocity doesn’t change.', 'So its acceleration is <b>0 m/s²</b>.'] };
        return { prompt: `A cart’s velocity changes from ${vi} m/s to ${vf} m/s in ${tt} s. What is its acceleration? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'm/s²', tolerance: 0.01, params: { t, vi, vf, tt },
          hints: ['Acceleration = (final velocity − starting velocity) ÷ time.', `(${vf} − ${vi}) ÷ ${tt} ≈ <b>${N(ans)} m/s²</b>${ans < 0 ? ' (slowing down)' : ''}.`] };
      }
      if (t === 'final') { const vi = rng.int(0, 15), a = rng.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), tt = rng.int(2, 10), ans = M.round(vi + a * tt, 4); return { prompt: `A skateboard starts at ${vi} m/s and speeds up at ${N(a)} m/s² for ${tt} s. What is its final velocity?`, type: 'number', answer: ans, unit: 'm/s', params: { t, vi, a, tt }, hints: ['Final velocity = starting velocity + acceleration × time.', `${vi} + ${N(a)} × ${tt} = <b>${N(ans)} m/s</b>.`] }; }
      if (t === 'time') { const a = rng.pick([2, 3, 4, 5]), vi = rng.int(0, 10), tt = rng.int(2, 9), vf = vi + a * tt; return { prompt: `A car speeds up from ${vi} m/s to ${vf} m/s with an acceleration of ${a} m/s². How many seconds does it take?`, type: 'number', answer: tt, unit: 's', params: { t, a, vi, vf }, hints: ['Time = change in velocity ÷ acceleration.', `(${vf} − ${vi}) ÷ ${a} = <b>${tt} s</b>.`] }; }
      const tt = rng.int(1, 6), ans = r1(9.8 * tt);
      return { prompt: `A stone is dropped from rest from a high cliff. Ignoring air resistance, how fast is it falling after ${tt} s? (It speeds up by 9.8 m/s every second.)`, type: 'number', answer: ans, unit: 'm/s', tolerance: 0.05, params: { t, tt }, hints: ['Final velocity = 0 + 9.8 × time.', `9.8 × ${tt} = <b>${N(ans)} m/s</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'find') return near(P.vi + q.answer * P.tt, P.vf, 0.0051 * P.tt);
      if (P.t === 'final') return near(q.answer - P.a * P.tt, P.vi);
      if (P.t === 'time') return near(P.vi + P.a * q.answer, P.vf);
      return near(q.answer / P.tt, 9.8, 0.01);
    },
  });

  /* ---------- Unit 4: forces ---------- */
  A.skill({
    id: 'sci.net-force', title: 'Net force and balanced forces',
    real: 'In a tug of war, the rope moves toward the team that pulls harder: it moves with the net force.',
    mistakes: ['Adding forces that point in opposite directions: subtract them, and the bigger one gives the direction.', 'Thinking a moving object must have a net force on it: with balanced forces it keeps moving at the same speed.'],
    learn: p(`A <b>force</b> is a push or a pull, measured in newtons (N). When several forces act on one object, the <b>net force</b> is their total. <b>Forces in the same direction add; forces in opposite directions subtract</b>, and the net force points the way of the bigger one.`) +
      p(`If the net force is zero, the forces are <b>balanced</b>, and the object’s motion doesn’t change: it stays still, or keeps moving at the same speed in the same direction. <b>Unbalanced forces change the motion</b>: the object speeds up, slows down or turns.`) +
      example('Example', `Ben pushes a box east with 50 N and friction pulls west with 20 N. The net force is 50 − 20 = <b>30 N east</b>, so the box speeds up toward the east.`) + lab('forces', 'Push a cart against friction'),
    make(rng) {
      const t = rng.pick(['two', 'two', 'three', 'balanced']), [d1, d2] = rng.pick([['east', 'west'], ['left', 'right'], ['north', 'south']]), who = rng.pick(NAMES);
      if (t === 'balanced') {
        const f = rng.int(10, 90), ans = 'It keeps moving at the same speed in the same direction.';
        return { prompt: `A sled is already sliding ${d1}. A ${f} N force pushes it ${d1} and friction pulls ${d2} with ${f} N. What happens to the sled’s motion?`, type: 'choice', answer: ans, choices: [ans, 'It slows down and stops.', `It speeds up toward the ${d1}.`, `It starts moving ${d2}.`], params: { t },
          hints: [`The net force is ${f} − ${f} = 0 N: the forces are balanced.`, `Balanced forces don’t change the motion: <b>it keeps moving at the same speed in the same direction</b>.`] };
      }
      const a = rng.int(5, 90), b = rng.int(5, 90), c = t === 'three' ? rng.int(5, 60) : 0;
      const net = a + c - b, size = Math.abs(net), ans = net === 0 ? '0 N (balanced)' : `${size} N ${net > 0 ? d1 : d2}`;
      const story = t === 'three' ? `${who} pulls a wagon ${d1} with ${a} N, a friend pushes it ${d1} with ${c} N, and friction acts ${d2} with ${b} N.` : `${who} pushes a crate ${d1} with ${a} N, and friction acts ${d2} with ${b} N.`;
      const cands = net === 0 ? [`${a} N ${d1}`, `${a + b + c} N ${d1}`, `${a + b + c} N ${d2}`] : [`${size} N ${net > 0 ? d2 : d1}`, `${a + b + c} N ${net > 0 ? d1 : d2}`, '0 N (balanced)', `${a} N ${d1}`];
      return { prompt: `${story} What is the net force?`, type: 'choice', answer: ans, choices: options(ans, cands), params: { t, a, b, c, d1, d2 },
        hints: [`Forces ${d1}: ${t === 'three' ? `${a} + ${c} = ${a + c}` : a} N. Forces ${d2}: ${b} N.`, `Opposite directions subtract: ${a + c} − ${b} = ${N(net)}.`, `The net force is <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'balanced') return /same speed/.test(q.answer);
      // add the forces as signed numbers, the first direction positive
      const net = [[P.a, 1], [P.c, 1], [P.b, -1]].reduce((s, [f, sg]) => s + f * sg, 0);
      return q.answer === (net ? `${Math.abs(net)} N ${net > 0 ? P.d1 : P.d2}` : '0 N (balanced)');
    },
  });

  A.skill({
    id: 'sci.newtons-second-law', title: 'Newton’s second law: F = ma',
    real: 'Engineers use F = ma to work out how strong a car’s brakes must be and how much thrust a rocket needs.',
    mistakes: ['Using the push when there is friction: use the net force.', 'Mixing up mass and weight: m is the mass in kilograms.'],
    learn: p(`<b>Newton’s second law</b>: an object’s acceleration depends on the net force on it and on its mass. <b>Net force = mass × acceleration</b>, or <b>F = ma</b>, with F in newtons, m in kilograms and a in m/s². One newton is the force that gives 1 kg an acceleration of 1 m/s².`) +
      p(`So <b>a = F ÷ m</b>: the same push gives a light cart a bigger acceleration than a heavy one, and a bigger push gives a bigger acceleration. When friction acts too, use the net force: the push minus the friction.`) +
      example('Example', `A 40 kg cart is pushed with 120 N, and friction is 20 N. The net force is 100 N, so a = 100 ÷ 40 = <b>2.5 m/s²</b>.`) + lab('forces', 'Change the mass and the push'),
    make(rng) {
      const t = rng.pick(['force', 'accel', 'mass', 'friction']);
      if (t === 'force') { const m = rng.int(2, 80), a = rng.pick([0.5, 1.5, 2, 2.5, 3, 4, 5, 6, 8]), ans = M.round(m * a, 4); return { prompt: `What net force gives a ${m} kg object an acceleration of ${N(a)} m/s²?`, type: 'number', answer: ans, unit: 'N', params: { t, m, a }, hints: ['F = m × a.', `${m} × ${N(a)} = <b>${N(ans)} N</b>.`] }; }
      if (t === 'accel') { const m = rng.int(2, 60), f = rng.int(5, 400), ans = r2(f / m); return { prompt: `A net force of ${f} N acts on a ${m} kg object. What is its acceleration? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'm/s²', tolerance: 0.01, params: { t, m, f }, hints: ['a = F ÷ m.', `${f} ÷ ${m} ≈ <b>${N(ans)} m/s²</b>.`] }; }
      if (t === 'mass') { const a = rng.pick([2, 4, 5, 8, 10]), m = rng.int(2, 50), f = m * a; return { prompt: `A net force of ${f} N gives an object an acceleration of ${a} m/s². What is its mass?`, type: 'number', answer: m, unit: 'kg', params: { t, f, a }, hints: ['m = F ÷ a.', `${f} ÷ ${a} = <b>${m} kg</b>.`] }; }
      const m = rng.int(5, 60), push = rng.int(40, 400), fr = rng.int(5, Math.floor(push * 0.8)), ans = r2((push - fr) / m);
      return { prompt: `A ${m} kg crate is pushed with ${push} N. Friction pushes back with ${fr} N. What is the crate’s acceleration? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'm/s²', tolerance: 0.01, params: { t, m, push, fr },
        hints: [`Net force = ${push} − ${fr} = ${push - fr} N.`, `a = ${push - fr} ÷ ${m} ≈ <b>${N(ans)} m/s²</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'force') return near(q.answer / P.m, P.a);
      if (P.t === 'accel') return near(q.answer * P.m, P.f, 0.0051 * P.m);
      if (P.t === 'mass') return near(q.answer * P.a, P.f);
      return near(q.answer * P.m + P.fr, P.push, 0.0051 * P.m);
    },
  });

  const WORLDS = [['the Moon', 1.6], ['Mars', 3.7], ['Jupiter', 24.8]];
  A.skill({
    id: 'sci.weight', title: 'Mass and weight',
    real: 'Astronauts weigh about one sixth as much on the Moon, though their mass doesn’t change at all.',
    mistakes: ['Thinking mass changes on the Moon: only weight changes; mass is the amount of matter.', 'Giving weight in kilograms: weight is a force, in newtons.'],
    learn: p(`<b>Mass</b> is the amount of matter in an object, in kilograms; it’s the same everywhere. <b>Weight</b> is the force of gravity pulling on that mass, in newtons, and it depends on where you are.`) +
      p(`<b>Weight = mass × gravitational field strength</b>, W = mg. On Earth, g is about <b>9.8 N/kg</b>, so each kilogram weighs 9.8 N. On the Moon, g is about 1.6 N/kg; on Mars about 3.7 N/kg.`) +
      example('Example', `A 50 kg student weighs 50 × 9.8 = <b>490 N</b> on Earth and 50 × 1.6 = <b>80 N</b> on the Moon. Their mass is still 50 kg.`),
    make(rng) {
      const t = rng.pick(['earth', 'earth', 'mass', 'world', 'same']), m = rng.int(2, 90);
      if (t === 'earth') { const ans = r1(m * 9.8); return { prompt: `What is the weight on Earth of a ${m} kg object? Use g = 9.8 N/kg.`, type: 'number', answer: ans, unit: 'N', tolerance: 0.05, params: { t, m }, hints: ['Weight = mass × 9.8 N/kg.', `${m} × 9.8 = <b>${N(ans)} N</b>.`] }; }
      if (t === 'mass') { const w = rng.int(20, 900), ans = r1(w / 9.8); return { prompt: `An object weighs ${w} N on Earth. What is its mass? Use g = 9.8 N/kg and round to the nearest tenth.`, type: 'number', answer: ans, unit: 'kg', tolerance: 0.05, params: { t, w }, hints: ['Mass = weight ÷ 9.8.', `${w} ÷ 9.8 ≈ <b>${N(ans)} kg</b>.`] }; }
      const [where, g] = rng.pick(WORLDS);
      if (t === 'world') { const ans = r1(m * g); return { prompt: `What would a ${m} kg rover weigh on ${where}, where g is about ${N(g)} N/kg?`, type: 'number', answer: ans, unit: 'N', tolerance: 0.05, params: { t, m, g }, hints: ['Weight = mass × g there.', `${m} × ${N(g)} = <b>${N(ans)} N</b>.`] }; }
      return { prompt: `An astronaut has a mass of ${m} kg on Earth. What is the astronaut’s mass on ${where}?`, type: 'number', answer: m, unit: 'kg', params: { t, m }, hints: ['Mass is the amount of matter, which doesn’t change from place to place.', `Still <b>${m} kg</b> (only the weight changes).`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'earth') return near(q.answer / 9.8, P.m, 0.006);
      if (P.t === 'mass') return near(q.answer * 9.8, P.w, 0.5);
      if (P.t === 'world') return near(q.answer / P.g, P.m, 0.05 / P.g);
      return q.answer === P.m;
    },
  });

  /* ---------- Unit 5: energy ---------- */
  A.skill({
    id: 'sci.kinetic-energy', title: 'Kinetic energy',
    real: 'A car at highway speed has four times the kinetic energy it has at half that speed, which is why stopping distances grow so fast.',
    mistakes: ['Forgetting to square the speed: KE = ½ × m × v × v.', 'Forgetting the ½.'],
    learn: p(`<b>Kinetic energy</b> is the energy of motion: <b>KE = ½ × m × v²</b>, with m in kilograms, v in m/s, and KE in joules (J). Anything moving has it; anything still has none.`) +
      p(`Because the speed is squared, <b>doubling the speed makes the kinetic energy four times as big</b>, and tripling it makes it nine times as big. Doubling the mass only doubles it.`) +
      example('Example', `A 60 kg runner at 5 m/s: ½ × 60 × 5² = ½ × 60 × 25 = <b>750 J</b>.`) + lab('energy', 'Drop a ball and watch its energy change form'),
    make(rng) {
      const t = rng.pick(['find', 'find', 'speed', 'mass', 'times']);
      if (t === 'times') {
        const what = rng.pick([['speed', 2, 4], ['speed', 3, 9], ['mass', 2, 2], ['mass', 3, 3], ['speed', 0.5, 0.25]]), ans = `${N(what[2])} times as much`;
        const word = what[1] === 0.5 ? 'is halved' : what[1] === 2 ? 'doubles' : 'triples';
        return { prompt: `A ball’s ${what[0]} ${word} and nothing else changes. What happens to its kinetic energy? It becomes…`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle([2, 3, 4, 6, 8, 9, 0.5, 0.25]).map(k => `${N(k)} times as much`)), params: { t, what: what[0], k: what[1] },
          hints: [what[0] === 'speed' ? 'KE = ½mv²: the speed is squared.' : 'KE = ½mv²: the mass isn’t squared.', `${what[0] === 'speed' ? `${N(what[1])}² = ${N(what[2])}` : `× ${N(what[1])}`}, so <b>${ans}</b>.`] };
      }
      const m = rng.int(1, 80), v = rng.int(1, 30), ke = 0.5 * m * v * v;
      if (t === 'find') return { prompt: `What is the kinetic energy of a ${m} kg object moving at ${v} m/s?`, type: 'number', answer: ke, unit: 'J', params: { t, m, v }, hints: ['KE = ½ × m × v².', `½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = <b>${N(ke)} J</b>.`] };
      if (t === 'speed') return { prompt: `A ${m} kg object has ${N(ke)} J of kinetic energy. How fast is it moving?`, type: 'number', answer: v, unit: 'm/s', params: { t, m, ke }, hints: ['v² = 2 × KE ÷ m.', `v² = 2 × ${N(ke)} ÷ ${m} = ${v * v}, so v = <b>${v} m/s</b>.`] };
      return { prompt: `An object moving at ${v} m/s has ${N(ke)} J of kinetic energy. What is its mass?`, type: 'number', answer: m, unit: 'kg', params: { t, v, ke }, hints: ['m = 2 × KE ÷ v².', `2 × ${N(ke)} ÷ ${v * v} = <b>${m} kg</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'times') return q.answer === `${N(P.what === 'speed' ? P.k * P.k : P.k)} times as much`;
      if (P.t === 'find') return near(2 * q.answer / P.m, P.v * P.v);
      if (P.t === 'speed') return near(0.5 * P.m * q.answer * q.answer, P.ke);
      return near(0.5 * q.answer * P.v * P.v, P.ke);
    },
  });

  A.skill({
    id: 'sci.potential-energy', title: 'Gravitational potential energy',
    real: 'A roller coaster’s first hill stores the energy for the whole ride, and dams hold water high up to make electricity.',
    mistakes: ['Forgetting g: PE = m × 9.8 × h, not just m × h.', 'Using a height in centimeters: change it to meters first.'],
    learn: p(`<b>Gravitational potential energy</b> is energy stored by height: <b>PE = m × g × h</b>, with m in kilograms, g = 9.8 N/kg, h in meters, and PE in joules. The higher or heavier something is, the more it stores.`) +
      p(`Energy isn’t made or destroyed; it changes form. As a ball falls, its potential energy becomes kinetic energy. Ignoring air resistance, an object dropped from height h reaches the ground at <b>v = √(2 × 9.8 × h)</b>.`) +
      example('Example', `A 2 kg book on a 1.5 m shelf has 2 × 9.8 × 1.5 = <b>29.4 J</b>. If it falls, it hits the floor at √(2 × 9.8 × 1.5) ≈ <b>5.4 m/s</b>.`) + lab('energy', 'Drop a ball from different heights'),
    make(rng) {
      const t = rng.pick(['find', 'find', 'height', 'speed']), m = rng.int(1, 60), h = rng.pick([rng.int(1, 30), rng.int(2, 9) + 0.5]);
      if (t === 'find') { const ans = r1(m * 9.8 * h); return { prompt: `A ${m} kg object is lifted ${N(h)} m. How much gravitational potential energy does it gain? Use g = 9.8 N/kg.`, type: 'number', answer: ans, unit: 'J', tolerance: 0.05, params: { t, m, h }, hints: ['PE = m × g × h.', `${m} × 9.8 × ${N(h)} = <b>${N(ans)} J</b>.`] }; }
      if (t === 'height') { const pe = r1(m * 9.8 * h); return { prompt: `A ${m} kg box has ${N(pe)} J of gravitational potential energy on a shelf. How high is the shelf? Use g = 9.8 N/kg.`, type: 'number', answer: h, unit: 'm', tolerance: 0.05, params: { t, m, pe }, hints: ['h = PE ÷ (m × g).', `${N(pe)} ÷ (${m} × 9.8) = ${N(pe)} ÷ ${N(r1(m * 9.8))} = <b>${N(h)} m</b>.`] }; }
      const ans = r1(Math.sqrt(2 * 9.8 * h));
      return { prompt: `A ball is dropped from ${N(h)} m. Ignoring air resistance, how fast is it moving just before it hits the ground? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'm/s', tolerance: 0.05, params: { t, h },
        hints: ['All the potential energy becomes kinetic energy: m g h = ½ m v², so v = √(2gh).', `√(2 × 9.8 × ${N(h)}) = √${N(r2(19.6 * h))} ≈ <b>${N(ans)} m/s</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'find') return near(q.answer / (9.8 * P.h), P.m, 0.05 / (9.8 * P.h));
      if (P.t === 'height') return near(P.m * 9.8 * q.answer, P.pe, 0.05 * P.m * 9.8);
      return near(q.answer * q.answer / (2 * 9.8), P.h, 0.006 * q.answer + 0.01);
    },
  });

  A.skill({
    id: 'sci.work-power', title: 'Work and power',
    real: 'A light bulb’s watts, a car engine’s horsepower and a sprinter running up stairs are all measures of power.',
    mistakes: ['Counting work when nothing moves: holding a heavy box still does no work on it.', 'Mixing up work and power: power is work divided by time.'],
    learn: p(`In science, <b>work</b> is done when a force moves something: <b>work = force × distance</b>, in joules (1 J = 1 N × 1 m). Pushing on a wall that doesn’t move does no work on it.`) +
      p(`<b>Power</b> is how fast work is done: <b>power = work ÷ time</b>, in watts (1 W = 1 J each second). Two people can do the same work climbing stairs, but the faster one uses more power.`) +
      example('Example', `Lifting a 300 N box onto a 2 m shelf takes 300 × 2 = <b>600 J</b> of work. Done in 4 s, that’s 600 ÷ 4 = <b>150 W</b>.`),
    make(rng) {
      const t = rng.pick(['work', 'power', 'time', 'stairs']), who = rng.pick(NAMES);
      if (t === 'work') { const f = rng.int(5, 500), d = rng.pick([rng.int(1, 40), rng.int(1, 9) + 0.5]), ans = M.round(f * d, 4); return { prompt: `${who} pushes a cart with a force of ${f} N for ${N(d)} m. How much work does ${who} do?`, type: 'number', answer: ans, unit: 'J', params: { t, f, d }, hints: ['Work = force × distance.', `${f} × ${N(d)} = <b>${N(ans)} J</b>.`] }; }
      if (t === 'power') { const w = rng.int(50, 6000), s = rng.int(2, 60), ans = r1(w / s); return { prompt: `A motor does ${N(w)} J of work in ${s} s. What is its power? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'W', tolerance: 0.05, params: { t, w, s }, hints: ['Power = work ÷ time.', `${N(w)} ÷ ${s} ≈ <b>${N(ans)} W</b>.`] }; }
      if (t === 'time') { const pw = rng.pick([20, 25, 40, 50, 60, 75, 100, 200]), s = rng.int(2, 60), w = pw * s; return { prompt: `A ${pw} W motor does ${N(w)} J of work. How many seconds does it take?`, type: 'number', answer: s, unit: 's', params: { t, pw, w }, hints: ['Time = work ÷ power.', `${N(w)} ÷ ${pw} = <b>${s} s</b>.`] }; }
      const wt = rng.int(30, 80) * 10, h = rng.int(3, 12), s = rng.int(4, 20), ans = r1(wt * h / s);
      return { prompt: `${who} weighs ${wt} N and runs up stairs ${h} m high in ${s} s. What power does ${who} use to climb? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'W', tolerance: 0.05, params: { t, wt, h, s },
        hints: [`Work = weight × height = ${wt} × ${h} = ${N(wt * h)} J.`, `Power = ${N(wt * h)} ÷ ${s} ≈ <b>${N(ans)} W</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'work') return near(q.answer / P.d, P.f);
      if (P.t === 'power') return near(q.answer * P.s, P.w, 0.051 * P.s);
      if (P.t === 'time') return near(q.answer * P.pw, P.w);
      return near(q.answer * P.s / P.h, P.wt, 0.051 * P.s / P.h);
    },
  });

  /* ---------- Unit 6: circuits ---------- */
  const zig = (x1, y1, x2, y2) => {          // a resistor between two points (horizontal or vertical)
    const hor = y1 === y2, len = hor ? x2 - x1 : y2 - y1, a = len * 0.25, b = len * 0.75, seg = (b - a) / 6;
    let d = hor ? `M${x1} ${y1}H${x1 + a}` : `M${x1} ${y1}V${y1 + a}`;
    for (let i = 0; i < 6; i++) d += hor ? `L${x1 + a + seg * (i + 0.5)} ${y1 + (i % 2 ? 7 : -7)}` : `L${x1 + (i % 2 ? 7 : -7)} ${y1 + a + seg * (i + 0.5)}`;
    d += hor ? `L${x1 + b} ${y1}H${x2}` : `L${x1} ${y1 + b}V${y2}`;
    return `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`;
  };
  const battery = (x, y1, y2, v) => { const m = (y1 + y2) / 2; return `<path d="M${x} ${y1}V${m - 5}M${x} ${m + 5}V${y2}" stroke="currentColor" stroke-width="2"/><path d="M${x - 14} ${m - 5}h28" stroke="currentColor" stroke-width="2"/><path d="M${x - 7} ${m + 5}h14" stroke="currentColor" stroke-width="4"/><text x="${x - 20}" y="${m + 5}" text-anchor="end" font-size="13" font-weight="700">${v} V</text>`; };
  /** a battery and resistors in series or in parallel, labeled */
  function circuit(kind, rs, v) {
    let body = battery(56, 24, 124, v);
    if (kind === 'series') {
      const w = 200 / rs.length;
      body += '<path d="M56 24H96M56 124H300V24" fill="none" stroke="currentColor" stroke-width="2"/>';
      rs.forEach((r, i) => { const x = 96 + i * w; body += zig(x, 24, x + w - 12, 24) + `<path d="M${x + w - 12} 24H${i < rs.length - 1 ? x + w : 300}" stroke="currentColor" stroke-width="2"/><text x="${x + (w - 12) / 2}" y="52" text-anchor="middle" font-size="13" font-weight="700">${r} Ω</text>`; });
    } else {
      const xs = rs.map((_, i) => 150 + i * 80), end = xs[xs.length - 1];
      body += `<path d="M56 24H${end}M56 124H${end}" fill="none" stroke="currentColor" stroke-width="2"/>`;
      rs.forEach((r, i) => { body += zig(xs[i], 24, xs[i], 124) + `<circle cx="${xs[i]}" cy="24" r="2.6" fill="currentColor"/><circle cx="${xs[i]}" cy="124" r="2.6" fill="currentColor"/><text x="${xs[i] + 13}" y="78" font-size="13" font-weight="700">${r} Ω</text>`; });
    }
    const W = kind === 'series' ? 312 : 150 + (rs.length - 1) * 80 + 56;
    return `<svg class="figure sci-circuit" viewBox="0 8 ${W} 130" width="${W}" role="img" aria-label="a ${v} volt battery with resistors of ${rs.join(' and ')} ohms in ${kind}"><desc>${kind} circuit: ${v} V, ${rs.map(r => r + ' ohms').join(', ')}</desc>${body}</svg>`;
  }
  A.skill({
    id: 'sci.ohms-law', title: 'Ohm’s law',
    real: 'Electricians use Ohm’s law to choose wires and fuses, and every phone charger is designed around it.',
    mistakes: ['Multiplying when you should divide: current = voltage ÷ resistance.', 'Forgetting to change milliamperes to amperes: 250 mA = 0.25 A.'],
    learn: p(`A battery’s <b>voltage</b> (in volts, V) pushes electric <b>current</b> (in amperes, A) around a circuit, and <b>resistance</b> (in ohms, Ω) holds it back. They’re linked by <b>Ohm’s law: V = I × R</b>, where I is the current.`) +
      p(`Turned around: <b>I = V ÷ R</b> and <b>R = V ÷ I</b>. More voltage gives more current; more resistance gives less. A covering triangle helps: V on top, I and R below.`) +
      example('Example', `A 9 V battery is connected to a 30 Ω resistor. The current is 9 ÷ 30 = <b>0.3 A</b>, which is 300 mA.`) + lab('circuit', 'Build a circuit and read the meters'),
    make(rng) {
      const t = rng.pick(['current', 'voltage', 'resistance', 'milli']);
      if (t === 'current') { const v = rng.pick([1.5, 3, 4.5, 6, 9, 12, 24]), r = rng.int(2, 120), ans = r2(v / r); return { prompt: `A ${N(v)} V battery is connected across a ${r} Ω resistor. What current flows? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'A', tolerance: 0.005, params: { t, v, r }, hints: ['I = V ÷ R.', `${N(v)} ÷ ${r} ≈ <b>${N(ans)} A</b>.`] }; }
      if (t === 'voltage') { const i = rng.pick([0.1, 0.2, 0.25, 0.5, 0.75, 1, 1.5, 2, 3]), r = rng.int(2, 60), ans = M.round(i * r, 4); return { prompt: `A current of ${N(i)} A flows through a ${r} Ω resistor. What is the voltage across it?`, type: 'number', answer: ans, unit: 'V', params: { t, i, r }, hints: ['V = I × R.', `${N(i)} × ${r} = <b>${N(ans)} V</b>.`] }; }
      if (t === 'resistance') { const v = rng.pick([3, 6, 9, 12, 24, 120]), i = rng.pick([0.1, 0.2, 0.25, 0.5, 1, 1.5, 2, 3, 4]), ans = r1(v / i); return { prompt: `A ${v} V source drives ${N(i)} A through a device. What is the device’s resistance? Round to the nearest tenth if you need to.`, type: 'number', answer: ans, unit: 'Ω', tolerance: 0.05, params: { t, v, i }, hints: ['R = V ÷ I.', `${v} ÷ ${N(i)} = <b>${N(ans)} Ω</b>.`] }; }
      const ma = rng.pick([20, 25, 40, 50, 100, 150, 200, 250, 300, 500]), r = rng.int(5, 200), ans = M.round(ma / 1000 * r, 4);
      return { prompt: `A current of ${ma} mA flows through a ${r} Ω resistor. What is the voltage across it?`, type: 'number', answer: ans, unit: 'V', params: { t, ma, r }, hints: [`Change milliamperes to amperes: ${ma} mA = ${N(ma / 1000)} A.`, `V = ${N(ma / 1000)} × ${r} = <b>${N(ans)} V</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'current') return near(q.answer * P.r, P.v, 0.0051 * P.r);
      if (P.t === 'voltage') return near(q.answer / P.r, P.i);
      if (P.t === 'resistance') return near(q.answer * P.i, P.v, 0.051 * P.i);
      return near(q.answer * 1000 / P.r, P.ma);
    },
  });

  const PAIRS = [[6, 3], [12, 6], [10, 10], [20, 30], [4, 12], [8, 24], [15, 10], [6, 12], [9, 18], [20, 5], [30, 60], [40, 10], [12, 4], [18, 9], [60, 20]];
  A.skill({
    id: 'sci.series-parallel', title: 'Series and parallel circuits',
    real: 'Old strings of holiday lights were wired in series, so one dead bulb put them all out; the outlets in a house are wired in parallel.',
    mistakes: ['Adding resistances in parallel: two resistors in parallel have less resistance than either one.', 'Thinking current gets used up: in a series circuit, the same current flows through every part.'],
    learn: p(`In a <b>series</b> circuit there is one path, so the same current flows through every part. <b>Resistances in series add</b>: R = R₁ + R₂ + … If one bulb breaks, the path is broken and every bulb goes out.`) +
      p(`In a <b>parallel</b> circuit each branch has its own path, and each branch gets the full battery voltage. <b>Two resistors in parallel: R = (R₁ × R₂) ÷ (R₁ + R₂)</b>, which is less than either one. The branch currents add up to the current from the battery, and one broken branch leaves the others working.`, `<span class="sci-pair">${circuit('series', [4, 8], 12)}${circuit('parallel', [6, 3], 12)}</span>`) +
      example('Example', `A 12 V battery with 4 Ω and 8 Ω in series: R = 12 Ω, so I = 12 ÷ 12 = <b>1 A</b>. With 6 Ω and 3 Ω in parallel: R = 18 ÷ 9 = <b>2 Ω</b>, so the battery gives 12 ÷ 2 = 6 A.`) + lab('circuit', 'Switch between series and parallel'),
    make(rng) {
      const t = rng.pick(['series', 'series', 'parallel', 'parallel', 'branch', 'concept']), v = rng.pick([6, 9, 12, 18, 24]);
      if (t === 'concept') {
        const ser = rng.bool(), ans = ser ? 'All the bulbs go out.' : 'The other bulbs stay on.';
        return { prompt: `Three bulbs are wired in ${ser ? 'series' : 'parallel'} to a battery. One bulb burns out. What happens to the others?`, type: 'choice', keepOrder: true, answer: ans, choices: ['All the bulbs go out.', 'The other bulbs stay on.'], params: { t, ser },
          hints: [ser ? 'A series circuit has only one path for the current.' : 'In parallel, each bulb has its own path.', `<b>${ans}</b>`] };
      }
      if (t === 'series') {
        const rs = Array.from({ length: rng.int(2, 3) }, () => rng.int(2, 40)), tot = rs.reduce((a, b) => a + b, 0), askI = rng.bool(), ans = askI ? r2(v / tot) : tot;
        return { prompt: `${askI ? 'What current flows from the battery? Round to the nearest hundredth.' : 'What is the total resistance of the circuit?'}${circuit('series', rs, v)}`, type: 'number', answer: ans, unit: askI ? 'A' : 'Ω', tolerance: askI ? 0.005 : undefined, params: { t, rs, v, askI },
          hints: [`In series, resistances add: ${rs.join(' + ')} = ${tot} Ω.`].concat(askI ? [`I = V ÷ R = ${v} ÷ ${tot} ≈ <b>${N(ans)} A</b>.`] : [`The total is <b>${tot} Ω</b>.`]) };
      }
      const [ra, rb] = rng.pick(PAIRS), tot = ra * rb / (ra + rb);
      if (t === 'parallel') {
        const askI = rng.bool(), ans = askI ? r2(v / tot) : r1(tot);
        return { prompt: `${askI ? 'What current flows from the battery? Round to the nearest hundredth.' : 'What is the total resistance of the two resistors in parallel?'}${circuit('parallel', [ra, rb], v)}`, type: 'number', answer: ans, unit: askI ? 'A' : 'Ω', tolerance: askI ? 0.005 : 0.05, params: { t, rs: [ra, rb], v, askI },
          hints: [`R = (${ra} × ${rb}) ÷ (${ra} + ${rb}) = ${ra * rb} ÷ ${ra + rb} = ${N(r2(tot))} Ω.`].concat(askI ? [`I = ${v} ÷ ${N(r2(tot))} ≈ <b>${N(ans)} A</b>.`] : [`The total is <b>${N(ans)} Ω</b>, less than either resistor.`]) };
      }
      const which = rng.pick([ra, rb]), ans = r2(v / which);
      return { prompt: `How much current flows through the ${which} Ω resistor? Round to the nearest hundredth.${circuit('parallel', [ra, rb], v)}`, type: 'number', answer: ans, unit: 'A', tolerance: 0.005, params: { t, which, v },
        hints: ['In parallel, each branch gets the full battery voltage.', `I = ${v} ÷ ${which} ≈ <b>${N(ans)} A</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'concept') return q.answer === (P.ser ? 'All the bulbs go out.' : 'The other bulbs stay on.');
      if (P.t === 'branch') return near(q.answer * P.which, P.v, 0.0051 * P.which);
      // parallel: add the conductances (1/R) instead of using product over sum
      const R = P.t === 'series' ? P.rs.reduce((a, b) => a + b, 0) : 1 / P.rs.reduce((a, b) => a + 1 / b, 0);
      return P.askI ? near(q.answer, P.v / R, 0.0051) : near(q.answer, R, 0.051);
    },
  });

  A.skill({
    id: 'sci.electric-power', title: 'Electric power and energy cost',
    real: 'An electric bill charges for kilowatt-hours, so knowing a device’s watts tells you what it costs to run.',
    mistakes: ['Forgetting to change watts to kilowatts: divide by 1,000.', 'Multiplying by minutes instead of hours.'],
    learn: p(`<b>Electric power = voltage × current</b>: P = V × I, in watts. A 120 V lamp drawing 0.5 A uses 60 W. Turned around, I = P ÷ V.`) +
      p(`Energy companies charge for <b>kilowatt-hours (kWh)</b>: <b>energy in kWh = power in kilowatts × time in hours</b>. A 1,500 W heater (1.5 kW) running for 2 hours uses 3 kWh. Multiply by the price per kWh to find the cost.`) +
      example('Example', `A 2,000 W oven runs for 1.5 h: 2 kW × 1.5 h = 3 kWh. At $0.16 per kWh it costs 3 × 0.16 = <b>$0.48</b>.`),
    make(rng) {
      const t = rng.pick(['power', 'current', 'kwh', 'cost']);
      if (t === 'power') { const v = rng.pick([1.5, 3, 5, 9, 12, 120, 240]), i = rng.pick([0.2, 0.5, 1, 1.5, 2, 2.5, 4, 10]), ans = M.round(v * i, 4); return { prompt: `A device runs on ${N(v)} V and draws ${N(i)} A. What is its power?`, type: 'number', answer: ans, unit: 'W', params: { t, v, i }, hints: ['P = V × I.', `${N(v)} × ${N(i)} = <b>${N(ans)} W</b>.`] }; }
      if (t === 'current') { const pw = rng.pick([40, 60, 100, 600, 900, 1200, 1500, 1800]), v = 120, ans = r2(pw / v); return { prompt: `A ${N(pw)} W appliance is plugged into a ${v} V outlet. What current does it draw? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'A', tolerance: 0.005, params: { t, pw, v }, hints: ['I = P ÷ V.', `${N(pw)} ÷ ${v} ≈ <b>${N(ans)} A</b>.`] }; }
      const pw = rng.pick([60, 100, 500, 750, 1200, 1500, 2000, 3000]), h = rng.pick([0.5, 1, 1.5, 2, 3, 4, 5, 8]), kwh = M.round(pw / 1000 * h, 4);
      if (t === 'kwh') return { prompt: `A ${N(pw)} W device runs for ${N(h)} hours. How much energy does it use, in kilowatt-hours?`, type: 'number', answer: kwh, unit: 'kWh', params: { t, pw, h }, hints: [`${N(pw)} W = ${N(pw / 1000)} kW.`, `${N(pw / 1000)} × ${N(h)} = <b>${N(kwh)} kWh</b>.`] };
      const price = rng.pick([0.12, 0.14, 0.15, 0.16, 0.18, 0.2]), ans = r2(kwh * price);
      return { prompt: `A ${N(pw)} W heater runs for ${N(h)} hours. Electricity costs $${price.toFixed(2)} per kWh. How much does it cost to run? Round to the nearest cent.`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { t, pw, h, price },
        hints: [`Energy = ${N(pw / 1000)} kW × ${N(h)} h = ${N(kwh)} kWh.`, `Cost = ${N(kwh)} × $${price.toFixed(2)} ≈ <b>$${ans.toFixed(2)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'power') return near(q.answer / P.i, P.v);
      if (P.t === 'current') return near(q.answer * P.v, P.pw, 0.0051 * P.v);
      if (P.t === 'kwh') return near(q.answer * 1000, P.pw * P.h);
      return near(q.answer * 100, P.pw * P.h * P.price / 10, 0.51);          // in cents, to the nearest cent
    },
  });

  /* ---------- Unit 7: heredity ---------- */
  const TRAITS = [
    { org: 'pea plants', trait: 'flower color', dom: 'purple', rec: 'white', L: 'P', thing: 'flowers' },
    { org: 'pea plants', trait: 'height', dom: 'tall', rec: 'short', L: 'T', thing: 'stems' },
    { org: 'pea plants', trait: 'seed shape', dom: 'round', rec: 'wrinkled', L: 'R', thing: 'seeds' },
    { org: 'pea plants', trait: 'seed color', dom: 'yellow', rec: 'green', L: 'Y', thing: 'seeds' },
    { org: 'guinea pigs', trait: 'fur color', dom: 'black', rec: 'white', L: 'B', thing: 'fur' },
    { org: 'guinea pigs', trait: 'fur length', dom: 'short', rec: 'long', L: 'S', thing: 'fur' },
  ];
  const geno = (T, k) => [T.L + T.L, T.L + T.L.toLowerCase(), T.L.toLowerCase() + T.L.toLowerCase()][k];          // 0 homozygous dominant, 1 heterozygous, 2 homozygous recessive
  const gi = s => `<i class="sci-g">${s}</i>`;
  const traitLine = T => `In ${T.org}, ${T.dom} ${T.thing} (${gi(T.L)}) are dominant over ${T.rec} ${T.thing} (${gi(T.L.toLowerCase())}).`;
  const one = T => T.org.replace(/s$/, '');
  const GSETS = ['homozygous dominant only', 'heterozygous only', 'homozygous dominant or heterozygous', 'homozygous recessive only'];
  A.skill({
    id: 'sci.genotypes', title: 'Dominant and recessive traits',
    real: 'Farmers and breeders use dominant and recessive traits to grow plants and raise animals with the features they want.',
    mistakes: ['Thinking a heterozygous plant shows a blend: with a dominant allele, it shows the dominant trait.', 'Mixing up genotype (the letters) and phenotype (what you can see).'],
    learn: p(`Living things get one copy of each gene from each parent. The different versions of a gene are <b>alleles</b>. A <b>dominant</b> allele (a capital letter, like ${gi('T')}) shows whenever it’s there; a <b>recessive</b> allele (lower case, ${gi('t')}) shows only when both copies are recessive.`) +
      p(`The pair of letters is the <b>genotype</b>; the trait you can see is the <b>phenotype</b>. Two matching letters (${gi('TT')} or ${gi('tt')}) are <b>homozygous</b>; two different letters (${gi('Tt')}) are <b>heterozygous</b>. With tall stems (${gi('T')}) dominant over short (${gi('t')}), ${gi('TT')} and ${gi('Tt')} plants are tall, and only ${gi('tt')} plants are short.`) +
      example('Example', `Purple flowers (${gi('P')}) are dominant over white (${gi('p')}). A ${gi('Pp')} plant is heterozygous and has <b>purple</b> flowers.`) + lab('genetics', 'Cross two parents and count the offspring'),
    make(rng) {
      const T = rng.pick(TRAITS), t = rng.pick(['phenotype', 'phenotype', 'zygous', 'which']);
      if (t === 'phenotype') {
        const k = rng.int(0, 2), g = geno(T, k), ans = k < 2 ? T.dom : T.rec;
        return { prompt: `${traitLine(T)} What are the ${T.thing} of a ${gi(g)} ${one(T)} like?`, type: 'choice', answer: ans, choices: options(ans, [T.dom, T.rec, `a blend of ${T.dom} and ${T.rec}`]), params: { t, g, dom: T.dom, rec: T.rec },
          hints: ['A dominant (capital) allele shows if there is at least one.', `${gi(g)} has ${k < 2 ? 'a dominant allele' : 'only recessive alleles'}, so they are <b>${ans}</b>.`] };
      }
      if (t === 'zygous') {
        const k = rng.int(0, 2), g = geno(T, k), ans = ['homozygous dominant', 'heterozygous', 'homozygous recessive'][k];
        return { prompt: `Which describes the genotype ${gi(g)}?`, type: 'choice', keepOrder: true, answer: ans, choices: ['homozygous dominant', 'heterozygous', 'homozygous recessive'], params: { t, g },
          hints: ['Homozygous means two matching letters; heterozygous means two different letters.', `${gi(g)} is <b>${ans}</b>.`] };
      }
      const want = rng.bool(), ans = want ? GSETS[3] : GSETS[2];
      return { prompt: `${traitLine(T)} Which genotypes give ${want ? T.rec : T.dom} ${T.thing}?`, type: 'choice', keepOrder: true, answer: ans, choices: GSETS.slice(), params: { t, want },
        hints: [want ? 'A recessive trait shows only when both alleles are recessive.' : 'A dominant trait shows with at least one capital letter.', want ? `Only ${gi(geno(T, 2))}: <b>${ans}</b>.` : `Both ${gi(geno(T, 0))} and ${gi(geno(T, 1))}: <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'phenotype') return q.answer === (/[A-Z]/.test(P.g) ? P.dom : P.rec);
      if (P.t === 'zygous') return q.answer === (P.g[0] !== P.g[1] ? 'heterozygous' : P.g[0] === P.g[0].toUpperCase() ? 'homozygous dominant' : 'homozygous recessive');
      return q.answer === (P.want ? 'homozygous recessive only' : 'homozygous dominant or heterozygous');
    },
  });

  /** a Punnett square: one parent's alleles down the side, the other's across the top; cells filled, or left for the learner */
  function punnett(g1, g2, fill) {
    const cell = (a, b) => (a === a.toUpperCase() ? a + b : b + a);
    const row = a => `<tr><th>${gi(a)}</th>${[g2[0], g2[1]].map(b => `<td>${fill ? gi(cell(a, b)) : ''}</td>`).join('')}</tr>`;
    return `<table class="mtable sci-punnett" aria-label="Punnett square for ${g1} and ${g2}"><thead><tr><th></th><th>${gi(g2[0])}</th><th>${gi(g2[1])}</th></tr></thead><tbody>${row(g1[0])}${row(g1[1])}</tbody></table>`;
  }
  A.skill({
    id: 'sci.punnett-squares', title: 'Punnett squares',
    real: 'Genetic counselors use the same reasoning to tell families the chances of a child inheriting a trait.',
    mistakes: ['Putting both of a parent’s alleles in one box: each box gets one letter from each parent.', 'Counting genotypes when the question asks about the trait you can see: TT and Tt look the same.'],
    learn: p(`A <b>Punnett square</b> shows the possible offspring of two parents. Write one parent’s two alleles across the top and the other’s down the side. <b>Each box gets one allele from the top and one from the side.</b> Each of the 4 boxes is an equally likely outcome, so each is a 25% chance.`) +
      p(`Count the boxes: <b>Tt × Tt</b> gives ${gi('TT')}, ${gi('Tt')}, ${gi('Tt')} and ${gi('tt')}. That’s 1 : 2 : 1 for the genotypes, and <b>3 tall : 1 short</b> for the phenotypes, so a 25% chance of a short plant.`) + punnett('Tt', 'Tt', true) +
      example('Example', `${gi('Tt')} × ${gi('tt')}: the boxes are ${gi('Tt')}, ${gi('Tt')}, ${gi('tt')}, ${gi('tt')}, so there’s a <b>50%</b> chance of a short (${gi('tt')}) plant.`) + lab('genetics', 'Breed 100 offspring and compare with the square'),
    make(rng) {
      const T = rng.pick(TRAITS), g1 = geno(T, rng.int(0, 2)), g2 = geno(T, rng.pick([0, 1, 1, 2])), t = rng.pick(['geno', 'pheno', 'pheno', 'ratio']);
      const kids = [];
      for (const a of g1) for (const b of g2) kids.push(a === a.toUpperCase() ? a + b : b + a);
      const shown = `${traitLine(T)} Two ${T.org} with genotypes ${gi(g1)} and ${gi(g2)} are crossed.${punnett(g1, g2, false)}`;
      if (t === 'geno') {
        const target = rng.pick([geno(T, 0), geno(T, 1), geno(T, 2)]), n = kids.filter(k => k === target).length, ans = n * 25;
        return { prompt: `${shown} What is the chance that an offspring has the genotype ${gi(target)}?`, type: 'number', answer: ans, unit: '%', params: { t, g1, g2, target },
          hints: ['Fill each box with one allele from the top and one from the side.', `The boxes: ${kids.map(gi).join(', ')}.`, `${n} of 4 boxes: <b>${ans}%</b>.`] };
      }
      if (t === 'pheno') {
        const rec = rng.bool(), n = kids.filter(k => (k === k.toLowerCase()) === rec).length, ans = n * 25;
        return { prompt: `${shown} What is the chance that an offspring has ${rec ? T.rec : T.dom} ${T.thing}?`, type: 'number', answer: ans, unit: '%', params: { t, g1, g2, rec },
          hints: ['Fill the four boxes, then decide what each one looks like.', `The boxes: ${kids.map(gi).join(', ')}. ${rec ? `Only ${gi(geno(T, 2))} is ${T.rec}` : `Any box with a capital letter is ${T.dom}`}.`, `${n} of 4 boxes: <b>${ans}%</b>.`] };
      }
      const d = kids.filter(k => k !== k.toLowerCase()).length, ans = `${d} ${T.dom} : ${4 - d} ${T.rec}`;
      return { prompt: `${shown} In what ratio do you expect ${T.dom} and ${T.rec} ${T.thing} among the offspring?`, type: 'choice', answer: ans, choices: options(ans, rng.shuffle([0, 1, 2, 3, 4]).map(k => `${k} ${T.dom} : ${4 - k} ${T.rec}`)), params: { t, g1, g2 },
        hints: [`The boxes: ${kids.map(gi).join(', ')}.`, `${d} show the dominant trait and ${4 - d} the recessive: <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params, pr = (g, capital) => [...g].filter(c => (c === c.toUpperCase()) === capital).length / 2;          // the chance a parent passes on a capital (or small) letter
      const pDD = pr(P.g1, true) * pr(P.g2, true), pdd = pr(P.g1, false) * pr(P.g2, false), pDd = 1 - pDD - pdd;
      if (P.t === 'geno') { const k = P.target[0] !== P.target[1] ? pDd : P.target[0] === P.target[0].toUpperCase() ? pDD : pdd; return near(q.answer, 100 * k); }
      if (P.t === 'pheno') return near(q.answer, 100 * (P.rec ? pdd : 1 - pdd));
      return q.answer.startsWith(`${Math.round(4 * (1 - pdd))} `);
    },
  });

  /* ---------- Unit 8: atoms and the periodic table ---------- */
  // atomic number, symbol, name, standard atomic mass
  const ELEMENTS = [[1, 'H', 'hydrogen', 1.008], [2, 'He', 'helium', 4.003], [3, 'Li', 'lithium', 6.94], [4, 'Be', 'beryllium', 9.012], [5, 'B', 'boron', 10.81], [6, 'C', 'carbon', 12.011], [7, 'N', 'nitrogen', 14.007], [8, 'O', 'oxygen', 15.999], [9, 'F', 'fluorine', 18.998], [10, 'Ne', 'neon', 20.18], [11, 'Na', 'sodium', 22.99], [12, 'Mg', 'magnesium', 24.305], [13, 'Al', 'aluminum', 26.982], [14, 'Si', 'silicon', 28.085], [15, 'P', 'phosphorus', 30.974], [16, 'S', 'sulfur', 32.06], [17, 'Cl', 'chlorine', 35.45], [18, 'Ar', 'argon', 39.948], [19, 'K', 'potassium', 39.098], [20, 'Ca', 'calcium', 40.078], [26, 'Fe', 'iron', 55.845], [29, 'Cu', 'copper', 63.546], [30, 'Zn', 'zinc', 65.38]];
  const ISOTOPES = { H: [1, 2, 3], He: [3, 4], Li: [6, 7], Be: [9], B: [10, 11], C: [12, 13, 14], N: [14, 15], O: [16, 17, 18], F: [19], Ne: [20, 22], Na: [23], Mg: [24, 25, 26], Al: [27], Si: [28, 29, 30], P: [31], S: [32, 34], Cl: [35, 37], Ar: [40], K: [39, 41], Ca: [40, 44], Fe: [54, 56], Cu: [63, 65], Zn: [64, 66] };
  const IONS = [['Na', 1], ['K', 1], ['Li', 1], ['Mg', 2], ['Ca', 2], ['Al', 3], ['Cl', -1], ['F', -1], ['O', -2], ['S', -2]];
  const SYMBOL_ORDER = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca'.split(' ');          // for verify(): the atomic number is the place in this list
  const zOf = sym => (SYMBOL_ORDER.includes(sym) ? SYMBOL_ORDER.indexOf(sym) + 1 : { Fe: 26, Cu: 29, Zn: 30 }[sym]);
  const el = sym => ELEMENTS.find(e => e[1] === sym);
  const ELNAME = Object.fromEntries(ELEMENTS.map(e => [e[1], e[2]]));
  const charge = c => (c > 0 ? (c > 1 ? c : '') + '+' : (c < -1 ? -c : '') + '−');
  /** an element's square from the periodic table */
  function tile(e) {
    const [z, sym, name, mass] = e;
    return `<svg class="figure sci-tile" viewBox="0 0 120 124" width="120" role="img" aria-label="${name}: atomic number ${z}, symbol ${sym}, atomic mass ${mass}"><rect x="2" y="2" width="116" height="120" rx="10" fill="var(--primary-soft)" stroke="currentColor" stroke-width="2"/><text x="12" y="26" font-size="18" font-weight="700">${z}</text><text x="60" y="72" text-anchor="middle" font-size="40" font-weight="800">${sym}</text><text x="60" y="94" text-anchor="middle" font-size="13">${cap(name)}</text><text x="60" y="112" text-anchor="middle" font-size="12">${mass}</text></svg>`;
  }
  A.skill({
    id: 'sci.atoms', title: 'Protons, neutrons and electrons',
    real: 'Carbon-14, an isotope with two extra neutrons, is how scientists find the age of ancient bones and wood.',
    mistakes: ['Using the atomic mass as the number of neutrons: neutrons = mass number − atomic number.', 'Adding electrons for a positive ion: a positive ion has lost electrons.'],
    learn: p(`An atom has a tiny <b>nucleus</b> of protons and neutrons, with electrons around it. The <b>atomic number</b> is the number of <b>protons</b>, and it decides which element an atom is: every carbon atom has 6 protons. A neutral atom has as many <b>electrons</b> as protons.`) +
      p(`The <b>mass number</b> is protons + neutrons, so <b>neutrons = mass number − atomic number</b>. Atoms of one element with different numbers of neutrons are <b>isotopes</b>, named by mass number: carbon-12 and carbon-14. An <b>ion</b> has gained or lost electrons: Na⁺ has lost one, and Cl⁻ has gained one.`, tile(el('C'))) +
      example('Example', `Chlorine’s atomic number is 17. Chlorine-37 has 17 protons and 37 − 17 = <b>20 neutrons</b>. A Cl⁻ ion has 17 + 1 = <b>18 electrons</b>.`),
    make(rng) {
      const t = rng.pick(['protons', 'neutrons', 'neutrons', 'ion', 'which']), e = rng.pick(ELEMENTS), [z, sym, name] = e;
      if (t === 'protons') { const what = rng.pick(['protons', 'electrons']); return { prompt: `How many ${what} does a neutral atom of ${name} have?${tile(e)}`, type: 'number', answer: z, params: { t, sym }, hints: ['The atomic number (top left) is the number of protons, and a neutral atom has the same number of electrons.', `<b>${z}</b>.`] }; }
      if (t === 'neutrons') { const a = rng.pick(ISOTOPES[sym]); return { prompt: `How many neutrons are in an atom of ${name}-${a}?${tile(e)}`, type: 'number', answer: a - z, params: { t, sym, a }, hints: [`The mass number is ${a}; the atomic number is ${z}.`, `Neutrons = ${a} − ${z} = <b>${a - z}</b>.`] }; }
      if (t === 'ion') {
        const [s2, c] = rng.pick(IONS), e2 = el(s2);
        return { prompt: `How many electrons does the ion ${s2}<sup>${charge(c)}</sup> have? (The atomic number of ${e2[2]} is ${e2[0]}.)`, type: 'number', answer: e2[0] - c, params: { t, sym: s2, c },
          hints: [`A neutral ${e2[2]} atom has ${e2[0]} electrons.`, c > 0 ? `A charge of ${charge(c)} means ${M.plural(c, 'electron')} lost: ${e2[0]} − ${c} = <b>${e2[0] - c}</b>.` : `A charge of ${charge(c)} means ${M.plural(-c, 'electron')} gained: ${e2[0]} + ${-c} = <b>${e2[0] - c}</b>.`] };
      }
      const a = rng.pick(ISOTOPES[sym]);
      return { prompt: `An atom has ${M.plural(z, 'proton')} and ${M.plural(a - z, 'neutron')}. Which element is it?`, type: 'choice', answer: name, choices: options(name, rng.shuffle(ELEMENTS.filter(x => Math.abs(x[0] - z) <= 4 || x[0] === a - z || x[0] === a).map(x => x[2]))), params: { t, z },
        hints: ['The number of protons (the atomic number) decides the element; neutrons don’t.', `Atomic number ${z} is <b>${name}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'protons') return q.answer === zOf(P.sym);
      if (P.t === 'neutrons') return q.answer + zOf(P.sym) === P.a;
      if (P.t === 'ion') return q.answer + P.c === zOf(P.sym);
      const e = ELEMENTS.find(x => x[2] === q.answer);
      return !!e && zOf(e[1]) === P.z;
    },
  });

  // the first 20 elements: [group, kind]
  const PLACE = { H: [1, 'nonmetal'], He: [18, 'nonmetal'], Li: [1, 'metal'], Be: [2, 'metal'], B: [13, 'metalloid'], C: [14, 'nonmetal'], N: [15, 'nonmetal'], O: [16, 'nonmetal'], F: [17, 'nonmetal'], Ne: [18, 'nonmetal'], Na: [1, 'metal'], Mg: [2, 'metal'], Al: [13, 'metal'], Si: [14, 'metalloid'], P: [15, 'nonmetal'], S: [16, 'nonmetal'], Cl: [17, 'nonmetal'], Ar: [18, 'nonmetal'], K: [1, 'metal'], Ca: [2, 'metal'] };
  const GROUP_NAME = { 1: 'alkali metals', 2: 'alkaline earth metals', 17: 'halogens', 18: 'noble gases' };
  const periodOf = z => (z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : 4);
  /** the first 20 elements laid out as in the periodic table, one marked */
  function miniTable(mark) {
    const cols = [1, 2, 13, 14, 15, 16, 17, 18], cw = 40, ch = 34;
    let s = '';
    SYMBOL_ORDER.forEach((sym, i) => {
      const z = i + 1, g = PLACE[sym][0], x = 30 + cols.indexOf(g) * cw, y = 22 + (periodOf(z) - 1) * ch, on = sym === mark;
      s += `<rect x="${x}" y="${y}" width="${cw - 3}" height="${ch - 3}" rx="5" fill="${on ? 'var(--primary)' : 'var(--surface-2)'}" stroke="var(--line-strong)"/><text x="${x + (cw - 3) / 2}" y="${y + 21}" text-anchor="middle" font-size="13" font-weight="700"${on ? ' style="fill:var(--on-primary)"' : ''}>${sym}</text>`;
    });
    cols.forEach((g, i) => { s += `<text x="${30 + i * cw + (cw - 3) / 2}" y="15" text-anchor="middle" font-size="10">${g}</text>`; });
    [1, 2, 3, 4].forEach(r => { s += `<text x="14" y="${22 + (r - 1) * ch + 21}" text-anchor="middle" font-size="10">${r}</text>`; });
    const W = 30 + cols.length * cw;
    return `<svg class="figure sci-ptable" viewBox="0 0 ${W} ${22 + 4 * ch + 4}" width="${W}" role="img" aria-label="the first 20 elements of the periodic table, by group and period${mark ? ', with ' + mark + ' marked' : ''}"><desc>groups 1, 2 and 13 to 18; periods 1 to 4</desc>${s}</svg>`;
  }
  A.skill({
    id: 'sci.periodic-table', title: 'Groups and periods',
    real: 'Chemists predict how a new compound will behave from where its elements sit in the periodic table.',
    mistakes: ['Mixing up groups (columns) and periods (rows).', 'Expecting neighbors in a row to be alike: elements in the same column are the ones with similar properties.'],
    learn: p(`The periodic table lists the elements in order of atomic number. Each row is a <b>period</b>, and each column is a <b>group</b>. <b>Elements in the same group have similar properties</b>, because they have the same number of <b>valence electrons</b>, the outer electrons that take part in reactions.`) +
      p(`For the main groups: group 1 has 1 valence electron, group 2 has 2, and groups 13 to 18 have 3 to 8 (helium has 2). Group 1 (not hydrogen) is the <b>alkali metals</b>, group 2 the <b>alkaline earth metals</b>, group 17 the <b>halogens</b>, and group 18 the <b>noble gases</b>, which hardly react. Metals are on the left, nonmetals on the right, and metalloids such as silicon sit between.`, miniTable(null)) +
      example('Example', `Sodium (Na) is in period 3, group 1: an alkali metal with <b>1 valence electron</b>. Potassium (K), below it, reacts in a similar way.`),
    make(rng) {
      let t = rng.pick(['valence', 'same', 'period', 'kind', 'family']);
      const sym = rng.pick(SYMBOL_ORDER), [g, kind] = PLACE[sym], z = zOf(sym), name = ELNAME[sym];
      if (t === 'same' && (sym === 'H' || sym === 'He')) t = 'period';
      if (t === 'valence') { const ans = sym === 'He' ? 2 : g <= 2 ? g : g - 10; return { prompt: `How many valence electrons does an atom of ${name} (${sym}) have?${miniTable(sym)}`, type: 'number', answer: ans, params: { t, sym }, hints: ['Groups 1 and 2 have 1 and 2; groups 13 to 18 have 3 to 8 (helium has 2).', `${sym} is in group ${g}: <b>${ans}</b>.`] }; }
      if (t === 'period') return { prompt: `Which period (row) is ${name} (${sym}) in?${miniTable(sym)}`, type: 'number', answer: periodOf(z), params: { t, sym }, hints: ['Periods are the rows, numbered from the top.', `${sym} is in period <b>${periodOf(z)}</b>.`] };
      if (t === 'kind') return { prompt: `Is ${name} (${sym}) a metal, a metalloid or a nonmetal?${miniTable(sym)}`, type: 'choice', keepOrder: true, answer: kind, choices: ['metal', 'metalloid', 'nonmetal'], params: { t, sym }, hints: ['Metals are on the left, nonmetals on the right, and boron and silicon are metalloids.', `${cap(name)} is a <b>${kind}</b>.`] };
      if (t === 'family') {
        const gg = rng.pick([1, 2, 17, 18]), two = rng.sample(SYMBOL_ORDER.filter(s => PLACE[s][0] === gg && s !== 'H'), 2), ans = GROUP_NAME[gg];
        return { prompt: `${two.map(s => cap(ELNAME[s])).join(' and ')} belong to which family of elements?`, type: 'choice', answer: ans, choices: options(ans, Object.values(GROUP_NAME)), params: { t, gg },
          hints: [`They’re in group ${gg}.`, `Group ${gg} is the <b>${ans}</b>.`] };
      }
      const ans = ELNAME[rng.pick(SYMBOL_ORDER.filter(s => s !== sym && s !== 'H' && PLACE[s][0] === g))];
      const others = rng.shuffle(SYMBOL_ORDER.filter(s => s !== sym && periodOf(zOf(s)) === periodOf(z) && PLACE[s][0] !== g)).concat(rng.shuffle(SYMBOL_ORDER.filter(s => PLACE[s][0] !== g))).map(s => ELNAME[s]);
      return { prompt: `Which element has properties most like ${name} (${sym})?`, type: 'choice', answer: ans, choices: options(ans, others), params: { t, sym },
        hints: ['Elements in the same group (column) have similar properties.', `${sym} is in group ${g}, and so is <b>${ans}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      // the group from the atomic number: rows of 2, 8 and 8, then potassium and calcium
      const groupOf = z => (z === 1 ? 1 : z === 2 ? 18 : z <= 18 ? [1, 2, 13, 14, 15, 16, 17, 18][(z - 3) % 8] : z - 18);
      if (P.t === 'valence') { const g = groupOf(zOf(P.sym)); return q.answer === (P.sym === 'He' ? 2 : g > 12 ? g - 10 : g); }
      if (P.t === 'period') { const z = zOf(P.sym); return q.answer === 1 + (z > 2) + (z > 10) + (z > 18); }
      if (P.t === 'kind') return q.answer === (['B', 'Si'].includes(P.sym) ? 'metalloid' : ['Li', 'Be', 'Na', 'Mg', 'Al', 'K', 'Ca'].includes(P.sym) ? 'metal' : 'nonmetal');
      if (P.t === 'family') return q.answer === { 1: 'alkali metals', 2: 'alkaline earth metals', 17: 'halogens', 18: 'noble gases' }[P.gg];
      const e = ELEMENTS.find(x => x[2] === q.answer);
      return !!e && groupOf(e[0]) === groupOf(zOf(P.sym));
    },
  });

  /* ---------- Unit 9: formulas and equations ---------- */
  const FORMULAS = ['H2O', 'CO2', 'NaCl', 'C6H12O6', 'CaCO3', 'Ca(OH)2', 'Mg(OH)2', 'Al2(SO4)3', '(NH4)2SO4', 'Fe2O3', 'H2SO4', 'NaHCO3', 'CH4', 'C3H8', 'NH3', 'Ca3(PO4)2', 'Al(OH)3', 'C2H5OH', 'HNO3', 'Mg(NO3)2', 'K2CO3', 'Cu(NO3)2', 'C12H22O11'];
  /** atoms in a formula: { symbol: count } (parentheses with a number after them multiply what's inside) */
  function atoms(f) {
    let i = 0;
    function group() {
      const out = {};
      while (i < f.length && f[i] !== ')') {
        let part;
        if (f[i] === '(') { i++; part = group(); i++; }
        else { const m = /^[A-Z][a-z]?/.exec(f.slice(i)); i += m[0].length; part = { [m[0]]: 1 }; }
        const n = /^\d+/.exec(f.slice(i)), k = n ? Number(n[0]) : 1;
        if (n) i += n[0].length;
        Object.keys(part).forEach(s => { out[s] = (out[s] || 0) + part[s] * k; });
      }
      return out;
    }
    return group();
  }
  /** for verify(): spell a formula out in full ("Ca(OH)2" → "CaOHOH") and count the symbols */
  function spellOut(f) {
    let s = f;
    while (/\(/.test(s)) s = s.replace(/\(([^()]*)\)(\d*)/, (m, inside, n) => inside.repeat(Number(n || 1)));
    s = s.replace(/([A-Z][a-z]?)(\d+)/g, (m, sym, n) => sym.repeat(Number(n)));
    const out = {};
    (s.match(/[A-Z][a-z]?/g) || []).forEach(x => { out[x] = (out[x] || 0) + 1; });
    return out;
  }
  const fmt = f => f.replace(/(\d+)/g, '<sub>$1</sub>');
  const withCoef = (k, f) => `${k > 1 ? k : ''}${fmt(f)}`;
  A.skill({
    id: 'sci.counting-atoms', title: 'Counting atoms in a formula',
    real: 'Chemists read formulas like recipes: C₆H₁₂O₆ says exactly how many atoms of each element make one molecule of glucose, a sugar.',
    mistakes: ['Forgetting that a number after parentheses multiplies everything inside: Ca(OH)₂ has 2 oxygen atoms.', 'Forgetting that the big number in front multiplies the whole formula: 3H₂O has 6 hydrogen atoms.'],
    learn: p(`A <b>chemical formula</b> lists the atoms in one unit of a substance. Each symbol is an element, and <b>the small number after it (a subscript) says how many atoms</b>; no number means one. H₂O has 2 hydrogen atoms and 1 oxygen atom.`) +
      p(`<b>A subscript after parentheses multiplies everything inside</b>: Ca(OH)₂ has 1 calcium, 2 oxygen and 2 hydrogen atoms. <b>A coefficient in front multiplies the whole formula</b>: 3H₂O is three water molecules, with 6 hydrogen atoms and 3 oxygen atoms.`) +
      example('Example', `How many oxygen atoms are in 2Al₂(SO₄)₃? In one unit, (SO₄)₃ has 4 × 3 = 12 oxygen atoms. Two units: 2 × 12 = <b>24</b>.`),
    make(rng) {
      const f = rng.pick(FORMULAS), k = rng.pick([1, 1, 2, 3, 4]), at = atoms(f), syms = Object.keys(at), t = rng.pick(['one', 'one', 'total', 'elements']);
      if (t === 'one') {
        const sym = rng.pick(syms), ans = at[sym] * k;
        return { prompt: `How many ${ELNAME[sym]} (${sym}) atoms are in ${withCoef(k, f)}?${big(withCoef(k, f))}`, type: 'number', answer: ans, params: { t, f, k, sym },
          hints: [/\(/.test(f) ? 'A number after parentheses multiplies every atom inside them.' : `Read the subscript after ${sym} (no number means 1).`, `One ${fmt(f)} has ${at[sym]} ${sym}${k > 1 ? `; the ${k} in front multiplies it: ${at[sym]} × ${k}` : ''}.`, `<b>${ans}</b> ${ELNAME[sym]} atoms.`] };
      }
      if (t === 'total') {
        const each = Object.values(at).reduce((a, b) => a + b, 0), ans = each * k;
        return { prompt: `How many atoms in all are in ${withCoef(k, f)}?${big(withCoef(k, f))}`, type: 'number', answer: ans, params: { t, f, k },
          hints: [`Count each element: ${syms.map(s => `${s} ${at[s]}`).join(', ')}.`, `That’s ${each} atoms in one ${fmt(f)}${k > 1 ? `, times ${k}` : ''}: <b>${ans}</b>.`] };
      }
      return { prompt: `How many different elements are in ${fmt(f)}?${big(fmt(f))}`, type: 'number', answer: syms.length, params: { t, f },
        hints: ['Each capital letter starts a new element symbol.', `The elements are ${syms.map(s => ELNAME[s]).join(', ')}: <b>${syms.length}</b>.`] };
    },
    verify(q) {
      const P = q.params, c = spellOut(P.f);
      if (P.t === 'one') return q.answer === c[P.sym] * P.k;
      if (P.t === 'total') return q.answer === Object.values(c).reduce((a, b) => a + b, 0) * P.k;
      return q.answer === Object.keys(c).length;
    },
  });

  // balanced equations: [reactants, products], each a list of [coefficient, formula]
  const EQS = [
    [[[2, 'H2'], [1, 'O2']], [[2, 'H2O']]], [[[1, 'N2'], [3, 'H2']], [[2, 'NH3']]], [[[1, 'CH4'], [2, 'O2']], [[1, 'CO2'], [2, 'H2O']]], [[[2, 'Na'], [1, 'Cl2']], [[2, 'NaCl']]],
    [[[4, 'Fe'], [3, 'O2']], [[2, 'Fe2O3']]], [[[2, 'Mg'], [1, 'O2']], [[2, 'MgO']]], [[[1, 'C3H8'], [5, 'O2']], [[3, 'CO2'], [4, 'H2O']]], [[[2, 'H2O2']], [[2, 'H2O'], [1, 'O2']]],
    [[[2, 'KClO3']], [[2, 'KCl'], [3, 'O2']]], [[[1, 'Zn'], [2, 'HCl']], [[1, 'ZnCl2'], [1, 'H2']]], [[[1, 'CaCO3']], [[1, 'CaO'], [1, 'CO2']]], [[[2, 'Al'], [3, 'Cl2']], [[2, 'AlCl3']]],
    [[[4, 'Al'], [3, 'O2']], [[2, 'Al2O3']]], [[[1, 'C6H12O6'], [6, 'O2']], [[6, 'CO2'], [6, 'H2O']]], [[[2, 'C2H6'], [7, 'O2']], [[4, 'CO2'], [6, 'H2O']]], [[[1, 'Ca(OH)2'], [2, 'HCl']], [[1, 'CaCl2'], [2, 'H2O']]],
    [[[2, 'NaOH'], [1, 'H2SO4']], [[1, 'Na2SO4'], [2, 'H2O']]], [[[2, 'Cu'], [1, 'O2']], [[2, 'CuO']]],
  ];
  const sideHtml = (terms, blank) => terms.map(([k, f], i) => (i === blank ? `☐${fmt(f)}` : withCoef(k, f))).join(' + ');
  const show = (eq, blank) => `${sideHtml(eq[0], blank != null && blank < eq[0].length ? blank : null)} → ${sideHtml(eq[1], blank != null && blank >= eq[0].length ? blank - eq[0].length : null)}`;
  const tally = terms => { const out = {}; terms.forEach(([k, f]) => { const c = spellOut(f); Object.keys(c).forEach(s => { out[s] = (out[s] || 0) + c[s] * k; }); }); return out; };
  const balanced = eq => { const a = tally(eq[0]), b = tally(eq[1]); return Object.keys(Object.assign({}, a, b)).every(s => a[s] === b[s]); };
  const molar = f => Object.entries(atoms(f)).reduce((s, [sym, n]) => s + n * el(sym)[3], 0);          // grams per mole, from the atomic masses
  A.skill({
    id: 'sci.balancing-equations', title: 'Balanced equations and conservation of mass',
    real: 'Matter is never created or destroyed in a reaction, so chemists balance equations to know how much of each ingredient to use.',
    mistakes: ['Changing a subscript to balance an equation: that changes the substance. Change only the coefficients in front.', 'Forgetting that a coefficient multiplies every atom in the formula.'],
    learn: p(`In a chemical reaction, atoms are rearranged, never created or destroyed. So <b>a balanced equation has the same number of each kind of atom on both sides</b>, and the total mass of the products equals the total mass of the reactants: the <b>law of conservation of mass</b>.`) +
      p(`To balance an equation, put <b>coefficients</b> in front of formulas; never change the subscripts. Count each element on both sides and adjust one at a time. In 2H₂ + O₂ → 2H₂O, the left side has 4 H and 2 O, and so does the right.`) +
      example('Example', `☐Na + Cl₂ → 2NaCl: the right side has 2 Na atoms, so the missing coefficient is <b>2</b>. If 46 g of sodium reacts with 71 g of chlorine, <b>117 g</b> of salt forms.`),
    make(rng) {
      const eq = rng.pick(EQS), t = rng.pick(['blank', 'blank', 'balanced', 'mass', 'count']), all = eq[0].concat(eq[1]);
      if (t === 'blank') {
        const i = rng.int(0, all.length - 1), ans = all[i][0];
        return { prompt: `What coefficient goes in the box to balance the equation?${big(show(eq, i))}`, type: 'number', answer: ans, params: { t, eq, i },
          hints: [`Pick an element in ${fmt(all[i][1])} and count its atoms on the other side.`, `With ${ans} in the box, every element balances${ans === 1 ? ' (a coefficient of 1 is usually left out)' : ''}: <b>${ans}</b>.`] };
      }
      if (t === 'balanced') {
        const off = rng.bool(), shown = [eq[0].map(x => x.slice()), eq[1].map(x => x.slice())];
        if (off) { const s = rng.int(0, 1), j = rng.int(0, shown[s].length - 1); shown[s][j][0] += shown[s][j][0] > 1 && rng.bool() ? -1 : 1; }
        const ans = balanced(shown) ? 'Balanced' : 'Not balanced', a = tally(shown[0]), b = tally(shown[1]), bad = Object.keys(a).find(s => a[s] !== b[s]);
        return { prompt: `Is this equation balanced?${big(show(shown))}`, type: 'choice', keepOrder: true, answer: ans, choices: ['Balanced', 'Not balanced'], params: { t, shown },
          hints: ['Count the atoms of each element on each side, multiplying by the coefficients.', bad ? `${cap(ELNAME[bad])}: ${a[bad]} on the left but ${b[bad]} on the right, so it’s <b>not balanced</b>.` : 'Every element has the same count on both sides: <b>balanced</b>.'] };
      }
      if (t === 'count') {
        const left = rng.bool(), counts = tally(left ? eq[0] : eq[1]), sym = rng.pick(Object.keys(counts));
        return { prompt: `How many ${ELNAME[sym]} atoms are on the ${left ? 'left (reactant)' : 'right (product)'} side?${big(show(eq))}`, type: 'number', answer: counts[sym], params: { t, eq, sym, left },
          hints: ['Multiply each subscript by the coefficient in front of its formula, then add.', `There are <b>${counts[sym]}</b> (and the same number on the other side, since it’s balanced).`] };
      }
      // masses in the real proportions: each substance's mass is its coefficient × its molar mass, scaled
      const s = rng.pick([0.1, 0.2, 0.5, 1, 2]), mass = ([k, f]) => r1(s * k * molar(f));
      if (rng.bool()) {
        const e = rng.pick(EQS.filter(x => x[0].length === 2 && x[1].length === 1)), [ma, mb] = e[0].map(mass), ans = r1(ma + mb);
        return { prompt: `${N(ma)} g of ${fmt(e[0][0][1])} reacts completely with ${N(mb)} g of ${fmt(e[0][1][1])}. What mass of ${fmt(e[1][0][1])} forms?${big(show(e))}`, type: 'number', answer: ans, unit: 'g', params: { t, total: [ma, mb], known: [] },
          hints: ['Mass is conserved: the product has the same mass as the reactants.', `${N(ma)} + ${N(mb)} = <b>${N(ans)} g</b>.`] };
      }
      const e = rng.pick(EQS.filter(x => x[0].length === 1 && x[1].length === 2)), mr = mass(e[0][0]), m1 = mass(e[1][0]), ans = r1(mr - m1);
      return { prompt: `${N(mr)} g of ${fmt(e[0][0][1])} breaks down completely into ${fmt(e[1][0][1])} and ${fmt(e[1][1][1])}. If ${N(m1)} g of ${fmt(e[1][0][1])} forms, what mass of ${fmt(e[1][1][1])} forms?${big(show(e))}`, type: 'number', answer: ans, unit: 'g', params: { t, total: [mr], known: [m1] },
        hints: ['Mass is conserved: the products together have the same mass as the reactant.', `${N(mr)} − ${N(m1)} = <b>${N(ans)} g</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'blank') { const eq = [P.eq[0].map(x => x.slice()), P.eq[1].map(x => x.slice())]; eq[0].concat(eq[1])[P.i][0] = q.answer; return balanced(eq); }
      if (P.t === 'balanced') return (q.answer === 'Balanced') === balanced(P.shown);
      if (P.t === 'count') { const terms = P.left ? P.eq[0] : P.eq[1]; return q.answer === terms.reduce((n, [k, f]) => n + k * (spellOut(f)[P.sym] || 0), 0); }
      return near(q.answer + P.known.reduce((a, b) => a + b, 0), P.total.reduce((a, b) => a + b, 0), 1e-6);
    },
  });

  /* ---------- Unit 10: states of matter ---------- */
  const STATES = [['solid', 'Its particles are packed tightly and vibrate in fixed places.', 'It keeps its own shape and volume.'], ['liquid', 'Its particles are close together but slide past each other.', 'It has a fixed volume but takes the shape of its container.'], ['gas', 'Its particles are far apart and move fast in all directions.', 'It spreads out to fill its whole container.']];
  const CHANGES = [['melting', 'solid', 'liquid', 'absorbs', 'an ice cube turning to water in a glass'], ['freezing', 'liquid', 'solid', 'releases', 'water in a tray turning to ice in the freezer'], ['evaporation', 'liquid', 'gas', 'absorbs', 'a puddle drying up in the sun'], ['condensation', 'gas', 'liquid', 'releases', 'drops of water forming on a cold glass'], ['sublimation', 'solid', 'gas', 'absorbs', 'dry ice turning straight into a gas'], ['deposition', 'gas', 'solid', 'releases', 'frost forming on a window on a cold night']];
  A.skill({
    id: 'sci.states-of-matter', title: 'Solids, liquids, gases and changes of state',
    real: 'Sweating cools you because evaporation takes in energy, and steam burns badly because condensing gives energy off.',
    mistakes: ['Mixing up evaporation and condensation: evaporation is liquid to gas, condensation is gas to liquid.', 'Thinking freezing takes in energy: a liquid must give off energy to freeze.'],
    learn: p(`Matter is made of tiny moving particles. In a <b>solid</b> they’re packed tightly and vibrate in place, so a solid keeps its shape. In a <b>liquid</b> they’re close but slide past each other, so a liquid has a fixed volume but takes its container’s shape. In a <b>gas</b> they’re far apart and fast, so a gas fills its container.`) +
      p(`Adding energy (heating) causes <b>melting</b> (solid → liquid), <b>evaporation</b> or boiling (liquid → gas) and <b>sublimation</b> (solid → gas). Taking energy away causes <b>freezing</b> (liquid → solid), <b>condensation</b> (gas → liquid) and <b>deposition</b> (gas → solid).`) +
      example('Example', `Drops of water appear on a cold can of juice. Water vapor in the air touches the cold can, gives off energy, and turns to liquid: <b>condensation</b>.`) + lab('heating', 'Heat ice and watch the temperature'),
    make(rng) {
      const t = rng.pick(['state', 'name', 'name', 'example', 'energy']);
      if (t === 'state') { const [st, a, b] = rng.pick(STATES), say = rng.bool() ? a : b; return { prompt: `Which state of matter is this? “${say}”`, type: 'choice', keepOrder: true, answer: st, choices: ['solid', 'liquid', 'gas'], params: { t, say }, hints: ['Solid: fixed shape. Liquid: fixed volume, any shape. Gas: fills its container.', `That describes a <b>${st}</b>.`] }; }
      const [nm, from, to, energy, ex] = rng.pick(CHANGES), names = CHANGES.map(c => c[0]);
      if (t === 'name') return { prompt: `What is the change from a ${from} to a ${to} called?`, type: 'choice', answer: nm, choices: options(nm, rng.shuffle(names)), params: { t, from, to }, hints: ['Think of the starting and ending states.', `${cap(from)} to ${to} is <b>${nm}</b>.`] };
      if (t === 'example') return { prompt: `Which change of state is this: ${ex}?`, type: 'choice', answer: nm, choices: options(nm, rng.shuffle(names)), params: { t, ex }, hints: ['What state does it start in, and what state does it end in?', `${cap(from)} to ${to}: <b>${nm}</b>.`] };
      const ans = energy === 'absorbs' ? 'It takes in energy.' : 'It gives off energy.';
      return { prompt: `During ${nm}, does a substance take in energy or give off energy?`, type: 'choice', keepOrder: true, answer: ans, choices: ['It takes in energy.', 'It gives off energy.'], params: { t, nm },
        hints: ['Changes toward a gas (particles moving faster and farther apart) need energy; changes toward a solid give energy off.', `${cap(nm)} goes from ${from} to ${to}: <b>${ans.toLowerCase().replace(/\.$/, '')}</b>.`] };
    },
    verify(q) {
      const P = q.params, ORDER = ['solid', 'liquid', 'gas'];
      const named = { melting: ['solid', 'liquid'], freezing: ['liquid', 'solid'], evaporation: ['liquid', 'gas'], condensation: ['gas', 'liquid'], sublimation: ['solid', 'gas'], deposition: ['gas', 'solid'] };
      if (P.t === 'state') return (/fixed places|own shape/.test(P.say) ? 'solid' : /slide|fixed volume/.test(P.say) ? 'liquid' : 'gas') === q.answer;
      if (P.t === 'name') return !!named[q.answer] && named[q.answer][0] === P.from && named[q.answer][1] === P.to;
      if (P.t === 'example') return !!named[q.answer] && CHANGES.find(c => c[4] === P.ex)[0] === q.answer;
      const [a, b] = named[P.nm];
      return q.answer === (ORDER.indexOf(b) > ORDER.indexOf(a) ? 'It takes in energy.' : 'It gives off energy.');
    },
  });

  const SUBSTANCES = [['water', 0, 100], ['ethanol', -114, 78], ['mercury', -39, 357], ['iron', 1538, 2862], ['lead', 327, 1749], ['oxygen', -218, -183], ['nitrogen', -210, -196], ['copper', 1085, 2562], ['acetone', -95, 56]];
  /** a heating curve: the temperature rising, flat while melting and again while boiling */
  function heatingCurve(name, mp, bp) {
    const lo = mp - Math.max(20, (bp - mp) * 0.3), hi = bp + Math.max(20, (bp - mp) * 0.3), y = T => 150 - (T - lo) / (hi - lo) * 130, X = [50, 90, 150, 190, 290, 330];
    const pts = [[X[0], y(lo)], [X[1], y(mp)], [X[2], y(mp)], [X[3], y(bp)], [X[4], y(bp)], [X[5], y(hi)]];
    const tick = T => `<path d="M44 ${y(T)}h6" stroke="currentColor"/><text x="40" y="${y(T) + 4}" text-anchor="end" font-size="12">${N(T)} °C</text><path d="M50 ${y(T)}H330" stroke="currentColor" stroke-dasharray="3 4" opacity=".35"/>`;
    return `<svg class="figure sci-curve" viewBox="-30 0 370 186" width="370" role="img" aria-label="a heating curve for ${name}, flat at ${mp} and at ${bp} degrees Celsius"><desc>heating curve of ${name}</desc><path d="M50 10V150H336" fill="none" stroke="currentColor" stroke-width="1.5"/>${tick(mp)}${tick(bp)}<polyline points="${pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linejoin="round"/><text x="190" y="176" text-anchor="middle" font-size="12">time (heat added) →</text><text x="-24" y="10" font-size="12">temperature</text></svg>`;
  }
  A.skill({
    id: 'sci.melting-boiling', title: 'Melting points, boiling points and heating curves',
    real: 'Salt on icy roads lowers the temperature at which water melts, and engineers choose engine metals by how hot they can get before melting.',
    mistakes: ['Thinking the temperature rises while ice melts: it stays flat until all of it has melted.', 'Treating every substance like water: each has its own melting and boiling points.'],
    learn: p(`Every pure substance has its own <b>melting point</b> and <b>boiling point</b>. <b>Below the melting point it’s a solid, between the two it’s a liquid, and above the boiling point it’s a gas.</b> Water melts at 0 °C and boils at 100 °C; iron doesn’t melt until 1,538 °C, and oxygen boils at −183 °C.`) +
      p(`A <b>heating curve</b> shows the temperature as heat is added. It has two flat parts: <b>while a substance melts or boils, its temperature stays the same</b>, because the energy goes into pulling the particles apart instead of making them move faster.`, heatingCurve('water', 0, 100)) +
      example('Example', `Ethanol melts at −114 °C and boils at 78 °C. At room temperature, 20 °C, it’s between the two, so it’s a <b>liquid</b>.`) + lab('heating', 'Run the heating curve experiment'),
    make(rng) {
      const t = rng.pick(['state', 'state', 'read', 'which', 'flat']), [nm, mp, bp] = rng.pick(SUBSTANCES);
      if (t === 'state') {
        let T;
        do { T = rng.pick([rng.int(Math.round(mp - 150), Math.round(bp + 150)), rng.pick([-50, 0, 20, 25, 37, 100, 500, 1000, 2000])]); } while (Math.abs(T - mp) < 5 || Math.abs(T - bp) < 5);
        const ans = T < mp ? 'solid' : T < bp ? 'liquid' : 'gas';
        return { prompt: `${cap(nm)} melts at ${N(mp)} °C and boils at ${N(bp)} °C. What state is it in at ${N(T)} °C?`, type: 'choice', keepOrder: true, answer: ans, choices: ['solid', 'liquid', 'gas'], params: { t, mp, bp, T },
          hints: ['Below the melting point: solid. Between the two: liquid. Above the boiling point: gas.', `${N(T)} °C is ${T < mp ? 'below the melting point' : T < bp ? 'between the melting and boiling points' : 'above the boiling point'}: <b>${ans}</b>.`] };
      }
      if (t === 'read') {
        const boil = rng.bool();
        return { prompt: `This is the heating curve of a substance. What is its ${boil ? 'boiling' : 'melting'} point?${heatingCurve('a substance', mp, bp)}`, type: 'number', answer: boil ? bp : mp, unit: '°C', params: { t, mp, bp, boil },
          hints: ['The flat parts are where it changes state: the lower one is melting, the higher one is boiling.', `The ${boil ? 'higher' : 'lower'} flat part is at <b>${N(boil ? bp : mp)} °C</b>.`] };
      }
      if (t === 'flat') {
        const ans = 'The energy is pulling the particles apart as it changes state.';
        return { prompt: 'Why does a heating curve stay flat at the melting point, even though heat is still being added?', type: 'choice', answer: ans, choices: [ans, 'The heater stops heating while the solid melts.', 'The particles stop moving until all of it has melted.', 'A thermometer can’t read the temperature of a melting solid.'], params: { t },
          hints: ['Think about where the added energy goes while a solid becomes a liquid.', `<b>${ans}</b>`] };
      }
      const liquid = SUBSTANCES.filter(s => s[1] < 20 && s[2] > 20), others = SUBSTANCES.filter(s => !(s[1] < 20 && s[2] > 20));
      const ans = rng.pick(liquid), shown = rng.shuffle([ans].concat(rng.sample(others, 3)));
      return { prompt: `Which of these is a liquid at room temperature (20 °C)?${M.table(['Substance', 'Melts at', 'Boils at'], shown.map(s => [s[0], `${N(s[1])} °C`, `${N(s[2])} °C`]), { compact: true })}`, type: 'choice', answer: ans[0], choices: shown.map(s => s[0]), params: { t, shown },
        hints: ['A liquid at 20 °C melts below 20 °C and boils above it.', `<b>${cap(ans[0])}</b> melts at ${N(ans[1])} °C and boils at ${N(ans[2])} °C.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.t === 'state') return q.answer === ['solid', 'liquid', 'gas'][(P.T > P.mp) + (P.T > P.bp)];
      if (P.t === 'read') return q.answer === (P.boil ? Math.max(P.mp, P.bp) : Math.min(P.mp, P.bp));
      if (P.t === 'flat') return /pulling the particles apart/.test(q.answer);
      const fits = P.shown.filter(s => s[1] < 20 && 20 < s[2]);
      return fits.length === 1 && fits[0][0] === q.answer;
    },
  });

  window.SCIENCE = { atoms, spellOut, balanced, molar, EQS, ELEMENTS, MATERIALS, LIQUIDS, LAYERS, SUBSTANCES, circuit, heatingCurve, punnett, miniTable, tile };
})();
