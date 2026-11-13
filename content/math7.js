/* 7th grade math. Negative numbers, fractions and percents, rates, expressions and equations,
   geometry, statistics and probability. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  /** a fraction answer in simplest form, ready to spread into a question */
  const fracAns = (n, d) => { const [sn, sd] = M.simp(n, d); return { answer: sn / sd, answerText: M.fracText(sn, sd) }; };
  /** the bold last-hint form of a fraction: the stacked fraction and the typed form */
  const fracBold = (n, d) => { const [sn, sd] = M.simp(n, d); return `<b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}`; };
  /** the last hint for a fraction answer: simplify it, or say it already is simple */
  const simpLine = (n, d) => M.gcd(n, d) === 1 ? `That is already in simplest form: ${fracBold(n, d)}.` : `Divide the top and bottom by ${M.gcd(n, d)}: ${fracBold(n, d)}.`;
  /** a fraction exactly as given, not simplified */
  const R = (n, d) => F(n, d, { raw: true });

  A.course({
    id: 'math-7', title: '7th grade math', subject: 'Middle school', grade: 7, icon: '7', hue: 215,
    blurb: 'Negative numbers, fractions and percents, rates and proportions, expressions and equations, geometry, statistics and probability.',
    units: [
      { id: 'negatives-add', title: 'Negative numbers: addition and subtraction', blurb: 'Adding and subtracting on both sides of zero.', skills: ['math7.add-negatives', 'math7.sub-negatives', 'math7.abs-distance'] },
      { id: 'negatives-mul', title: 'Negative numbers: multiplication and division', blurb: 'The sign rules, and expressions that mix the operations.', skills: ['math7.mul-div-negatives', 'math7.order-ops-negatives'] },
      { id: 'fractions', title: 'Fractions, decimals, and percentages', blurb: 'The same number three ways, and arithmetic with fractions.', skills: ['math7.add-sub-fractions', 'math7.mul-div-fractions', 'math7.convert-fdp', 'math7.percent-of'] },
      { id: 'rates', title: 'Rates and proportional relationships', blurb: 'Unit rates, proportional tables, the constant of proportionality, percent change.', skills: ['math7.unit-rate', 'math7.proportional-table', 'math7.constant-k', 'math7.percent-change'] },
      { id: 'expressions', title: 'Expressions, equations, and inequalities', blurb: 'Simplifying, expanding, and solving in two steps.', skills: ['math7.combine-like-terms', 'math7.distribute', 'math7.two-step-equations', 'math7.two-step-inequalities'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Circles, angle pairs, and scale drawings.', skills: ['math7.circles', 'math7.angle-pairs', 'math7.scale-drawings'] },
      { id: 'stats', title: 'Statistics and probability', blurb: 'Describing data with one number, and the chance of an event.', skills: ['math7.mean-median', 'math7.simple-probability', 'math7.compound-probability', 'math7.sports-stats'] },
      { id: 'venn-probability', title: 'Venn diagrams and probability', blurb: 'Sorting with Venn diagrams, probability from experiments, and the chance of one event or another.', skills: ['math7.venn-diagrams', 'math7.experimental-probability', 'math7.or-probability'] },
      { id: 'rationals-interest', title: 'Rational numbers and simple interest', blurb: 'Repeating decimals as fractions, signed fractions and decimals, and interest on savings and loans.', skills: ['math7.repeating-decimals', 'math7.add-sub-rationals', 'math7.simple-interest'] },
      { id: 'properties-word-problems', title: 'Properties, comparing expressions, and word problems', blurb: 'Naming the arithmetic properties, comparing expressions, the 5-D Process, and Fraction Busters.', skills: ['math7.number-properties', 'math7.compare-expressions', 'math7.five-d-problems', 'math7.fraction-busters'] },
      { id: 'samples-data', title: 'Graph scales, samples, and comparing data', blurb: 'Scaling an axis, choosing a fair sample, estimating a population, and comparing data sets with the MAD.', skills: ['math7.axis-scales', 'math7.representative-samples', 'math7.population-estimate', 'math7.compare-mad'] },
      { id: 'triangles-solids', title: 'Building triangles and slicing solids', blurb: 'Which side lengths make a triangle, and the shapes you get by slicing prisms and pyramids.', skills: ['math7.triangle-inequality', 'math7.cross-sections'] },
    ],
  });

  /* ---------- Unit 1 ---------- */
  A.skill({
    id: 'math7.add-negatives', title: 'Adding negative numbers',
    learn: p('On a number line, adding a positive number moves you to the right, and adding a negative number moves you to the left. A number’s <b>size</b> is its distance from 0, without the sign: the size of −9 is 9, and the size of 4 is 4.') +
      p('<b>Same signs:</b> add the sizes and keep the sign. <b>Different signs:</b> subtract the smaller size from the larger one, and keep the sign of the number with the larger size.') +
      example('Example: same signs', `${big('−8 + (−6)')}Both numbers are negative, so add the sizes: 8 + 6 = 14. Keep the negative sign: <b>−14</b>.`) +
      example('Example: different signs', `${big('−12 + 7')}The signs are different, so subtract the sizes: 12 − 7 = 5. The −12 has the larger size, and it’s negative, so the answer is <b>−5</b>.`) +
      example('Example: the positive one is larger', `${big('−5 + 11')}Subtract the sizes: 11 − 5 = 6. The 11 has the larger size, and it’s positive, so the answer is <b>6</b>. On the number line, start at −5 and move 11 to the right.`),
    learnEs: p('En la recta numérica, sumar un número positivo te mueve a la derecha y sumar un número negativo te mueve a la izquierda. El <b>tamaño</b> de un número es su distancia al 0, sin el signo: el tamaño de −9 es 9 y el tamaño de 4 es 4.') +
      p('<b>Signos iguales:</b> suma los tamaños y conserva el signo. <b>Signos distintos:</b> resta el tamaño menor del mayor y conserva el signo del número de mayor tamaño.') +
      example('Ejemplo: signos iguales', `${big('−8 + (−6)')}Los dos números son negativos, así que suma los tamaños: 8 + 6 = 14. Conserva el signo negativo: <b>−14</b>.`) +
      example('Ejemplo: signos distintos', `${big('−12 + 7')}Los signos son distintos, así que resta los tamaños: 12 − 7 = 5. El −12 tiene el tamaño mayor y es negativo, así que la respuesta es <b>−5</b>.`) +
      example('Ejemplo: el positivo es mayor', `${big('−5 + 11')}Resta los tamaños: 11 − 5 = 6. El 11 tiene el tamaño mayor y es positivo, así que la respuesta es <b>6</b>. En la recta numérica, empieza en −5 y avanza 11 hacia la derecha.`),
    make(rng) {
      let a = rng.nz(-20, 20), b = rng.nz(-20, 20);
      if (a > 0 && b > 0) a = -a;
      const ans = a + b;
      const bTxt = b < 0 ? `(${N(b)})` : N(b);
      const hints = [];
      if ((a < 0) === (b < 0)) hints.push(`Both numbers are negative, so add their sizes: ${N(Math.abs(a))} + ${N(Math.abs(b))} = ${N(Math.abs(a) + Math.abs(b))}, and keep the negative sign.`);
      else hints.push(`The signs are different, so subtract the sizes: ${N(Math.max(Math.abs(a), Math.abs(b)))} − ${N(Math.min(Math.abs(a), Math.abs(b)))} = ${N(Math.abs(Math.abs(a) - Math.abs(b)))}. The answer takes the sign of ${N(Math.abs(a) >= Math.abs(b) ? a : b)}, the number with the larger size.`);
      hints.push(`Picture the number line: start at ${N(a)} and move ${N(Math.abs(b))} to the ${b < 0 ? 'left' : 'right'}.`);
      hints.push(`${N(a)} + ${bTxt} = <b>${N(ans)}</b>.`);
      return { prompt: `Add.${big(`${N(a)} + ${bTxt} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { return q.answer === q.params.a + q.params.b; },
  });

  A.skill({
    id: 'math7.sub-negatives', title: 'Subtracting negative numbers',
    learn: p('The <b>opposite</b> of a number is the number the same distance from 0 on the other side: the opposite of 8 is −8, and the opposite of −8 is 8. <b>Subtracting a number is the same as adding its opposite.</b> So you can rewrite any subtraction as an addition, and then use the addition rules.') +
      p(`${V('a')} − ${V('b')} = ${V('a')} + (−${V('b')}), and ${V('a')} − (−${V('b')}) = ${V('a')} + ${V('b')}. Two minus signs next to each other make a plus. Then add as usual: with the same signs, add the sizes (the distances from 0) and keep the sign; with different signs, subtract the sizes and keep the sign of the larger one.`) +
      example('Example: subtracting a negative', `${big('−3 − (−8)')}Subtracting −8 is adding its opposite, 8: −3 + 8. The signs are different, so 8 − 3 = 5, and the 8 is larger and positive: <b>5</b>.`) +
      example('Example: subtracting a positive', `${big('4 − 9')}Subtracting 9 is adding −9: 4 + (−9). The signs are different, so 9 − 4 = 5, and the −9 is larger and negative: <b>−5</b>.`) +
      example('Example: a negative minus a positive', `${big('−6 − 5')}Rewrite it as −6 + (−5). The signs are the same, so add the sizes, 6 + 5 = 11, and keep the sign: <b>−11</b>.`),
    learnEs: p('El <b>opuesto</b> de un número es el número que está a la misma distancia del 0, pero del otro lado: el opuesto de 8 es −8 y el opuesto de −8 es 8. <b>Restar un número es lo mismo que sumar su opuesto.</b> Así, toda resta se puede escribir como una suma, y luego se usan las reglas de la suma.') +
      p(`${V('a')} − ${V('b')} = ${V('a')} + (−${V('b')}), y ${V('a')} − (−${V('b')}) = ${V('a')} + ${V('b')}. Dos signos de menos seguidos se convierten en un más. Después suma como siempre: con signos iguales, suma los tamaños (las distancias al 0) y conserva el signo; con signos distintos, resta los tamaños y conserva el signo del mayor.`) +
      example('Ejemplo: restar un negativo', `${big('−3 − (−8)')}Restar −8 es sumar su opuesto, 8: −3 + 8. Los signos son distintos, así que 8 − 3 = 5, y el 8 es mayor y positivo: <b>5</b>.`) +
      example('Ejemplo: restar un positivo', `${big('4 − 9')}Restar 9 es sumar −9: 4 + (−9). Los signos son distintos, así que 9 − 4 = 5, y el −9 es mayor y negativo: <b>−5</b>.`) +
      example('Ejemplo: un negativo menos un positivo', `${big('−6 − 5')}Escríbelo como −6 + (−5). Los signos son iguales, así que suma los tamaños, 6 + 5 = 11, y conserva el signo: <b>−11</b>.`),
    make(rng) {
      let a = rng.nz(-20, 20), b = rng.nz(-20, 20);
      if (a > 0 && b > 0 && rng.chance(0.7)) b = -b;
      const ans = a - b;
      const bTxt = b < 0 ? `(${N(b)})` : N(b);
      const hints = [
        `Subtracting is adding the opposite. Rewrite ${N(a)} − ${bTxt} as ${N(a)} + ${-b < 0 ? `(${N(-b)})` : N(-b)}.`,
        (a < 0) === (-b < 0) ? `Same signs: add the sizes ${N(Math.abs(a))} + ${N(Math.abs(b))} = ${N(Math.abs(a) + Math.abs(b))} and keep the sign.` : `Different signs: subtract the sizes, ${N(Math.max(Math.abs(a), Math.abs(b)))} − ${N(Math.min(Math.abs(a), Math.abs(b)))} = ${N(Math.abs(Math.abs(a) - Math.abs(b)))}, and keep the sign of the larger one.`,
        `${N(a)} − ${bTxt} = <b>${N(ans)}</b>.`,
      ];
      return { prompt: `Subtract.${big(`${N(a)} − ${bTxt} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { return q.answer === q.params.a - q.params.b; },
  });

  A.skill({
    id: 'math7.abs-distance', title: 'Absolute value and distance',
    learn: p('The <b>absolute value</b> of a number is its distance from 0 on the number line. It’s written with two bars, like |−7|, and it’s never negative: |−7| = 7 and |7| = 7. Work out what’s inside the bars first, then take its distance from 0.') +
      p(`The <b>distance</b> between two numbers on the number line is the absolute value of their difference: the distance from ${V('a')} to ${V('b')} is |${V('a')} − ${V('b')}|. The order doesn’t matter, because |−5| and |5| are both 5. A change in temperature or height works the same way.`) +
      example('Example: an absolute value', `${big('|−14| − 6')}|−14| is 14, because −14 is 14 steps from 0. Then 14 − 6 = <b>8</b>.`) +
      example('Example: the distance between two numbers', `How far apart are −6 and 9? |−6 − 9| = |−15| = <b>15</b>. Check on the number line: 6 steps from −6 up to 0, then 9 more up to 9, and 6 + 9 = 15.`) +
      example('Example: a change in temperature', `At dawn it was −7°C, and by noon it was 5°C. The change is |5 − (−7)| = |12| = <b>12 degrees</b>.`),
    learnEs: p('El <b>valor absoluto</b> de un número es su distancia al 0 en la recta numérica. Se escribe entre dos barras, como |−7|, y nunca es negativo: |−7| = 7 y |7| = 7. Primero resuelve lo que está dentro de las barras y luego toma su distancia al 0.') +
      p(`La <b>distancia</b> entre dos números en la recta numérica es el valor absoluto de su diferencia: la distancia de ${V('a')} a ${V('b')} es |${V('a')} − ${V('b')}|. El orden no importa, porque |−5| y |5| son los dos 5. Un cambio de temperatura o de altura funciona igual.`) +
      example('Ejemplo: un valor absoluto', `${big('|−14| − 6')}|−14| es 14, porque −14 está a 14 pasos del 0. Después 14 − 6 = <b>8</b>.`) +
      example('Ejemplo: la distancia entre dos números', `¿Qué tan lejos están −6 y 9? |−6 − 9| = |−15| = <b>15</b>. Compruébalo en la recta numérica: 6 pasos de −6 hasta 0 y 9 más hasta 9, y 6 + 9 = 15.`) +
      example('Ejemplo: un cambio de temperatura', `Al amanecer hacía −7°C y al mediodía hacía 5°C. El cambio es |5 − (−7)| = |12| = <b>12 grados</b>.`),
    make(rng) {
      const kind = rng.pick(['abs', 'dist', 'dist', 'temp']);
      if (kind === 'abs') {
        const inner = rng.nz(-30, 30), shift = rng.int(0, 1) ? rng.nz(-9, 9) : 0;
        const ans = Math.abs(inner) + shift;
        const expr = shift ? `${M.abs(N(inner))} ${M.signed(shift)}` : M.abs(N(inner));
        return { prompt: `Evaluate.${big(expr)}`, type: 'number', answer: ans, params: { kind, inner, shift }, hints: [`|${N(inner)}| is the distance of ${N(inner)} from zero, which is ${N(Math.abs(inner))}.`, shift ? `Then ${N(Math.abs(inner))} ${M.signed(shift)} = <b>${N(ans)}</b>.` : `So the value is <b>${N(ans)}</b>.`] };
      }
      const a = rng.int(-25, 25); let b = rng.int(-25, 25); if (b === a) b += 3;
      const ans = Math.abs(a - b);
      if (kind === 'temp') {
        return { prompt: `The temperature at dawn was ${N(a)}°C. By noon it was ${N(b)}°C. By how many degrees did it change?`, type: 'number', answer: ans, unit: '°C', params: { kind, a, b },
          hints: [`The change is the distance between the two readings on the number line: |${N(b)} − ${N(a)}|.`, `${N(b)} − ${N(a)} = ${N(b - a)}, and its absolute value is <b>${N(ans)}</b> degrees.`] };
      }
      return { prompt: `How far apart are ${N(a)} and ${N(b)} on the number line?`, type: 'number', answer: ans, params: { kind, a, b },
        hints: [`Distance is the absolute value of the difference: |${N(a)} − ${N(b)}|.`, `${N(a)} − ${N(b)} = ${N(a - b)}, and |${N(a - b)}| = <b>${N(ans)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'abs') return q.answer === Math.abs(p.inner) + p.shift; return q.answer === Math.max(p.a, p.b) - Math.min(p.a, p.b); },
  });

  /* ---------- Unit 2 ---------- */
  A.skill({
    id: 'math7.mul-div-negatives', title: 'Multiplying and dividing negative numbers',
    learn: p('Multiply or divide the sizes (the numbers without their signs) as usual, then decide the sign: <b>same signs give a positive</b>, <b>different signs give a negative</b>. The answer to a multiplication is the <b>product</b>, and the answer to a division is the <b>quotient</b>.') +
      p('When three or more numbers are multiplied together, count the negatives: an even number of them gives a positive product, and an odd number gives a negative one.') +
      example('Example: different signs', `${big('(−7) × 6')}7 × 6 = 42. One number is negative and one is positive, so the product is negative: <b>−42</b>.`) +
      example('Example: dividing with the same signs', `${big('(−48) ÷ (−8)')}48 ÷ 8 = 6. Both numbers are negative, so the quotient is positive: <b>6</b>.`) +
      example('Example: three numbers', `${big('(−3) × 5 × (−2)')}3 × 5 × 2 = 30. There are two negatives, an even number, so the product is positive: <b>30</b>.`),
    learnEs: p('Multiplica o divide los tamaños (los números sin su signo) como siempre y después decide el signo: <b>signos iguales dan positivo</b> y <b>signos distintos dan negativo</b>. El resultado de una multiplicación es el <b>producto</b>, y el de una división es el <b>cociente</b>.') +
      p('Cuando multiplicas tres números o más, cuenta los negativos: una cantidad par da un producto positivo y una cantidad impar da uno negativo.') +
      example('Ejemplo: signos distintos', `${big('(−7) × 6')}7 × 6 = 42. Un número es negativo y el otro positivo, así que el producto es negativo: <b>−42</b>.`) +
      example('Ejemplo: dividir con signos iguales', `${big('(−48) ÷ (−8)')}48 ÷ 8 = 6. Los dos números son negativos, así que el cociente es positivo: <b>6</b>.`) +
      example('Ejemplo: tres números', `${big('(−3) × 5 × (−2)')}3 × 5 × 2 = 30. Hay dos negativos, una cantidad par, así que el producto es positivo: <b>30</b>.`),
    make(rng) {
      const kind = rng.pick(['mul', 'mul', 'div', 'triple']);
      const wrap = x => x < 0 ? `(${N(x)})` : N(x);
      if (kind === 'triple') {
        const f = [rng.nz(-6, 6), rng.nz(-6, 6), rng.nz(-6, 6)];
        if (f.every(x => x > 0)) f[1] = -f[1];
        const ans = f[0] * f[1] * f[2], negs = f.filter(x => x < 0).length;
        return { prompt: `Multiply.${big(f.map(wrap).join(' × '))}`, type: 'number', answer: ans, params: { kind, f },
          hints: [`Multiply the sizes first: ${f.map(x => Math.abs(x)).join(' × ')} = ${N(Math.abs(ans))}.`, `Count the negative factors: ${negs}. ${negs % 2 ? 'An odd number of negatives makes the product negative.' : 'An even number of negatives makes the product positive.'}`, `So the product is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'div') {
        const q = rng.nz(-12, 12); let d = rng.nz(-12, 12);
        if (q > 0 && d > 0) d = -d;              // keep at least one negative in sight
        const dividend = q * d;
        return { prompt: `Divide.${big(`${wrap(dividend)} ÷ ${wrap(d)}`)}`, type: 'number', answer: q, params: { kind, dividend, d },
          hints: [`Divide the sizes: ${N(Math.abs(dividend))} ÷ ${N(Math.abs(d))} = ${N(Math.abs(q))}.`, `${(dividend < 0) === (d < 0) ? 'Same signs, so the quotient is positive.' : 'Different signs, so the quotient is negative.'}`, `${wrap(dividend)} ÷ ${wrap(d)} = <b>${N(q)}</b>.`] };
      }
      let a = rng.nz(-12, 12), b = rng.nz(-12, 12);
      if (a > 0 && b > 0) a = -a;
      return { prompt: `Multiply.${big(`${wrap(a)} × ${wrap(b)}`)}`, type: 'number', answer: a * b, params: { kind, a, b },
        hints: [`Multiply the sizes: ${N(Math.abs(a))} × ${N(Math.abs(b))} = ${N(Math.abs(a * b))}.`, `${(a < 0) === (b < 0) ? 'Same signs, so the product is positive.' : 'Different signs, so the product is negative.'}`, `${wrap(a)} × ${wrap(b)} = <b>${N(a * b)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'triple') return q.answer === p.f[0] * p.f[1] * p.f[2]; if (p.kind === 'div') return q.answer * p.d === p.dividend; return q.answer === p.a * p.b; },
  });

  A.skill({
    id: 'math7.order-ops-negatives', title: 'Order of operations with negative numbers',
    learn: p('The <b>order of operations</b> is the agreed order for working out an expression with more than one step: first anything in <b>parentheses</b>, then <b>exponents</b> (like 3², which means 3 × 3), then <b>multiplication and division</b> from left to right, and last <b>addition and subtraction</b> from left to right.') +
      p('Negative numbers follow the same order; just use the sign rules at each step. Writing one step per line keeps the signs straight.') +
      example('Example: multiply before adding', `${big('−4 + 3 × (−5)')}Multiply first: 3 × (−5) = −15. Then add: −4 + (−15) = <b>−19</b>.`) +
      example('Example: parentheses first', `${big('(−2 + 7) × (−3)')}Parentheses first: −2 + 7 = 5. Then multiply: 5 × (−3) = <b>−15</b>.`) +
      example('Example: division, then subtraction', `${big('(−20) ÷ 4 − 3 × (−2)')}Do the division and the multiplication first: (−20) ÷ 4 = −5 and 3 × (−2) = −6. Then subtract: −5 − (−6) = −5 + 6 = <b>1</b>.`),
    learnEs: p('El <b>orden de las operaciones</b> es el orden acordado para resolver una expresión de varios pasos: primero lo que está entre <b>paréntesis</b>, luego los <b>exponentes</b> (como 3², que significa 3 × 3), luego la <b>multiplicación y la división</b> de izquierda a derecha, y al final la <b>suma y la resta</b> de izquierda a derecha.') +
      p('Los números negativos siguen el mismo orden; solo usa las reglas de los signos en cada paso. Escribir un paso por renglón ayuda a no perder los signos.') +
      example('Ejemplo: multiplica antes de sumar', `${big('−4 + 3 × (−5)')}Primero multiplica: 3 × (−5) = −15. Después suma: −4 + (−15) = <b>−19</b>.`) +
      example('Ejemplo: primero los paréntesis', `${big('(−2 + 7) × (−3)')}Primero los paréntesis: −2 + 7 = 5. Después multiplica: 5 × (−3) = <b>−15</b>.`) +
      example('Ejemplo: división y después resta', `${big('(−20) ÷ 4 − 3 × (−2)')}Primero la división y la multiplicación: (−20) ÷ 4 = −5 y 3 × (−2) = −6. Después resta: −5 − (−6) = −5 + 6 = <b>1</b>.`),
    make(rng) {
      const wrap = x => x < 0 ? `(${N(x)})` : N(x);
      const form = rng.pick(['a+b*c', '(a+b)*c', 'a-b*c', 'a*b-c*d', 'a/b+c']);
      let a = rng.nz(-9, 9), b = rng.nz(-9, 9), c = rng.nz(-9, 9), d = rng.nz(-9, 9);
      let expr, ans, hints;
      if (form === 'a+b*c') { ans = a + b * c; expr = `${N(a)} + ${wrap(b)} × ${wrap(c)}`; hints = [`Multiply before adding: ${wrap(b)} × ${wrap(c)} = ${N(b * c)}.`, `Now add: ${N(a)} + ${wrap(b * c)} = <b>${N(ans)}</b>.`]; }
      else if (form === '(a+b)*c') { ans = (a + b) * c; expr = `(${N(a)} + ${wrap(b)}) × ${wrap(c)}`; hints = [`Parentheses first: ${N(a)} + ${wrap(b)} = ${N(a + b)}.`, `Then multiply: ${wrap(a + b)} × ${wrap(c)} = <b>${N(ans)}</b>.`]; }
      else if (form === 'a-b*c') { ans = a - b * c; expr = `${N(a)} − ${wrap(b)} × ${wrap(c)}`; hints = [`Multiply first: ${wrap(b)} × ${wrap(c)} = ${N(b * c)}.`, `Then subtract: ${N(a)} − ${wrap(b * c)} = <b>${N(ans)}</b>.`]; }
      else if (form === 'a*b-c*d') { ans = a * b - c * d; expr = `${wrap(a)} × ${wrap(b)} − ${wrap(c)} × ${wrap(d)}`; hints = [`Do both multiplications first: ${wrap(a)} × ${wrap(b)} = ${N(a * b)} and ${wrap(c)} × ${wrap(d)} = ${N(c * d)}.`, `Then subtract: ${N(a * b)} − ${wrap(c * d)} = <b>${N(ans)}</b>.`]; }
      else { a = b * rng.nz(-6, 6); ans = a / b + c; expr = `${wrap(a)} ÷ ${wrap(b)} + ${wrap(c)}`; hints = [`Divide first: ${wrap(a)} ÷ ${wrap(b)} = ${N(a / b)}.`, `Then add: ${N(a / b)} + ${wrap(c)} = <b>${N(ans)}</b>.`]; }
      return { prompt: `Evaluate.${big(expr)}`, type: 'number', answer: ans, hints, params: { form, a, b, c, d } };
    },
    verify(q) {
      const { form, a, b, c, d } = q.params;
      const expr = form.replace(/a/g, `(${a})`).replace(/b/g, `(${b})`).replace(/c/g, `(${c})`).replace(/d/g, `(${d})`);
      return Math.abs(new Function('return ' + expr)() - q.answer) < 1e-9;      // JavaScript's own precedence as the second opinion
    },
  });

  /* ---------- Unit 3 ---------- */
  A.skill({
    id: 'math7.add-sub-fractions', title: 'Adding and subtracting fractions',
    learn: p('The <b>numerator</b> is the top number of a fraction, and the <b>denominator</b> is the bottom number. You can add or subtract fractions only when they have the same denominator, so first find a <b>common denominator</b>: a number that both denominators divide into. The <b>least common multiple</b> (LCM), the smallest such number, keeps the numbers small.') +
      p('Rewrite each fraction over the common denominator, add or subtract the numerators, and keep the denominator. Finish by simplifying: divide the top and bottom by their <b>greatest common factor</b>, the largest number that divides both.') +
      example('Example: adding', `${big(`${F(3, 4)} + ${F(1, 6)}`)}The LCM of 4 and 6 is 12. ${F(3, 4)} = ${R(9, 12)} and ${F(1, 6)} = ${R(2, 12)}. Add the numerators: 9 + 2 = 11, so the sum is <b>${F(11, 12)}</b>. It’s already in simplest form.`) +
      example('Example: subtracting, then simplifying', `${big(`${F(5, 6)} − ${F(1, 3)}`)}The LCM of 6 and 3 is 6, and ${F(1, 3)} = ${R(2, 6)}. Subtract the numerators: 5 − 2 = 3, giving ${R(3, 6)}. Divide the top and bottom by 3: <b>${F(1, 2)}</b>.`),
    make(rng) {
      const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
      let d1 = rng.pick(dens), d2 = rng.pick(dens);
      if (d1 === d2) d2 = dens[(dens.indexOf(d2) + 1) % dens.length];
      const coprime = d => { const opts = []; for (let k = 1; k < d; k++) if (M.gcd(k, d) === 1) opts.push(k); return rng.pick(opts); };
      const n1 = coprime(d1), n2 = coprime(d2);
      const sub = rng.bool();
      const lcd = d1 * d2 / M.gcd(d1, d2);
      const a = n1 * lcd / d1, b = n2 * lcd / d2;
      let num = sub ? a - b : a + b;
      if (num === 0) num = a + b;
      const [sn, sd] = M.simp(num, lcd);
      const op = (sub && a - b !== 0) ? '−' : '+';
      const ans = sn / sd;
      return { prompt: `${op === '−' ? 'Subtract' : 'Add'}. Give your answer as a fraction in simplest form.${big(`${F(n1, d1, { raw: true })} ${op} ${F(n2, d2, { raw: true })}`)}`, type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { n1, d1, n2, d2, op },
        hints: [`The least common denominator of ${d1} and ${d2} is ${lcd}.`, `Rewrite: ${F(n1, d1, { raw: true })} = ${F(a, lcd, { raw: true })} and ${F(n2, d2, { raw: true })} = ${F(b, lcd, { raw: true })}.`, `${op === '−' ? 'Subtract' : 'Add'} the numerators: ${N(a)} ${op} ${N(b)} = ${N(num)}, over ${lcd}.`, `${M.gcd(num, lcd) !== 1 ? `Simplify ${F(num, lcd, { raw: true })} by dividing top and bottom by ${M.gcd(num, lcd)}: ` : ''}<b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`] };
    },
    verify(q) { const { n1, d1, n2, d2, op } = q.params; const v = n1 / d1 + (op === '−' ? -1 : 1) * n2 / d2; return Math.abs(v - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.mul-div-fractions', title: 'Multiplying and dividing fractions',
    learn: p('To multiply fractions, multiply the numerators (the tops) and multiply the denominators (the bottoms), then simplify. You can also <b>cancel</b> first: divide a top and a bottom by the same number before you multiply, which keeps the numbers small. A whole number is a fraction with a denominator of 1, so 6 is 6 over 1.') +
      p(`To divide by a fraction, multiply by its <b>reciprocal</b>, which is the fraction flipped upside down: the reciprocal of ${F(4, 5)} is ${F(5, 4)}. A short way to remember it: keep the first fraction, change ÷ to ×, and flip the second.`) +
      example('Example: multiplying', `${big(`${F(3, 8)} × ${F(4, 9)}`)}Multiply across: 3 × 4 = 12 on top and 8 × 9 = 72 on the bottom, giving ${R(12, 72)}. Divide the top and bottom by 12: <b>${F(1, 6)}</b>.`) +
      example('Example: dividing', `${big(`${F(2, 3)} ÷ ${F(4, 5)}`)}Multiply by the reciprocal of ${F(4, 5)}: ${F(2, 3)} × ${F(5, 4)} = ${R(10, 12)}. Divide the top and bottom by 2: <b>${F(5, 6)}</b>.`) +
      example('Example: a whole number times a fraction', `${big(`6 × ${F(5, 9)}`)}Write 6 as 6 over 1. Multiply across: 6 × 5 = 30 on top and 1 × 9 = 9 on the bottom, giving ${R(30, 9)}. Divide the top and bottom by 3: <b>${F(10, 3)}</b>, which is ${M.mixed(10, 3)} as a mixed number.`),
    make(rng) {
      const d1 = rng.int(2, 9), d2 = rng.int(2, 9);
      const n1 = rng.int(1, 9), n2 = rng.int(1, 9);
      const div = rng.bool();
      const num = div ? n1 * d2 : n1 * n2, den = div ? d1 * n2 : d1 * d2;
      const [sn, sd] = M.simp(num, den);
      const whole = !div && rng.chance(0.25);
      if (whole) {
        const w = rng.int(2, 9);
        const [wn, wd] = M.simp(w * n1, d1);
        return { prompt: `Multiply. Give your answer as a fraction or whole number in simplest form.${big(`${N(w)} × ${F(n1, d1, { raw: true })}`)}`, type: 'number', answer: wn / wd, answerText: M.fracText(wn, wd), params: { kind: 'whole', w, n1, d1 },
          hints: [`A whole number is a fraction over 1: ${N(w)} = ${F(w, 1, { raw: true })}.`, `Multiply across: ${N(w)} × ${N(n1)} = ${N(w * n1)} on top, ${d1} underneath: ${F(w * n1, d1, { raw: true })}.`, `Simplify: <b>${F(wn, wd)}</b>${wd === 1 ? '' : ` (${M.fracText(wn, wd)})`}.`] };
      }
      return { prompt: `${div ? 'Divide' : 'Multiply'}. Give your answer as a fraction or whole number in simplest form.${big(`${F(n1, d1, { raw: true })} ${div ? '÷' : '×'} ${F(n2, d2, { raw: true })}`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind: div ? 'div' : 'mul', n1, d1, n2, d2 },
        hints: (div ? [`Dividing by a fraction is multiplying by its reciprocal: ${F(n1, d1, { raw: true })} × ${F(d2, n2, { raw: true })}.`] : []).concat([
          `Multiply the numerators and the denominators: ${N(num)} over ${N(den)}, that is ${F(num, den, { raw: true })}.`,
          `Simplify by dividing top and bottom by ${M.gcd(num, den)}: <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`]) };
    },
    verify(q) { const p = q.params; const v = p.kind === 'whole' ? p.w * p.n1 / p.d1 : p.kind === 'div' ? (p.n1 / p.d1) / (p.n2 / p.d2) : (p.n1 / p.d1) * (p.n2 / p.d2); return Math.abs(v - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.convert-fdp', title: 'Fractions, decimals, and percents',
    learn: p('A fraction, a decimal and a percent can all name the same number. <b>Percent</b> means “out of 100”, so 35% is 35 out of 100.') +
      p('<b>Fraction → decimal:</b> divide the top by the bottom. <b>Decimal → percent:</b> multiply by 100 (move the point two places right). <b>Percent → decimal:</b> divide by 100 (move the point two places left). <b>Percent or decimal → fraction:</b> write it over 100 (or over 10, 1,000, …) and simplify.') +
      example('Example: fraction to decimal to percent', `Write ${F(7, 20)} as a decimal and as a percent. 7 ÷ 20 = <b>0.35</b>, and 0.35 × 100 = <b>35%</b>.`) +
      example('Example: percent to decimal to fraction', `Write 45% as a decimal and as a fraction. 45 ÷ 100 = <b>0.45</b>. As a fraction it’s ${R(45, 100)}; divide the top and bottom by 5: <b>${F(9, 20)}</b>.`) +
      example('Example: decimal to fraction', `Write 0.375 as a fraction. It has three decimal places, so put it over 1,000: ${R(375, 1000)}. Divide the top and bottom by 125: <b>${F(3, 8)}</b>.`),
    make(rng) {
      const kind = rng.pick(['f2d', 'f2p', 'd2p', 'p2f', 'd2f', 'p2d']);
      const dens = [2, 4, 5, 8, 10, 20, 25, 50];
      const d = rng.pick(dens);
      let n = rng.int(1, d - 1); [n] = M.simp(n, d); const [sn, sd] = M.simp(n, d);
      const value = sn / sd, pctv = M.round(value * 100, 4), dec = M.round(value, 6);
      if (kind === 'f2d') return { prompt: `Write ${F(sn, sd)} as a decimal.`, type: 'number', answer: dec, params: { kind, sn, sd }, hints: [`A fraction is a division: ${sn} ÷ ${sd}.`, `${sd === 10 || sd === 100 ? 'The denominator is a power of ten, so just place the decimal point.' : `Make the denominator a power of ten: ${F(sn, sd)} = ${F(sn * (100 / sd) % 1 === 0 ? sn * 100 / sd : sn * 1000 / sd, (100 / sd) % 1 === 0 ? 100 : 1000, { raw: true })}.`}`, `${F(sn, sd)} = <b>${N(dec)}</b>.`] };
      if (kind === 'f2p') return { prompt: `Write ${F(sn, sd)} as a percent.`, type: 'number', answer: pctv, unit: '%', params: { kind, sn, sd }, hints: [`First make it a decimal: ${sn} ÷ ${sd} = ${N(dec)}.`, `Then multiply by 100: ${N(dec)} × 100 = ${N(pctv)}.`, `${F(sn, sd)} = <b>${N(pctv)}%</b>.`] };
      if (kind === 'd2p') return { prompt: `Write ${N(dec)} as a percent.`, type: 'number', answer: pctv, unit: '%', params: { kind, sn, sd }, hints: [`Percent means “per hundred”, so multiply by 100.`, `${N(dec)} × 100 = <b>${N(pctv)}%</b>.`] };
      if (kind === 'p2d') return { prompt: `Write ${N(pctv)}% as a decimal.`, type: 'number', answer: dec, params: { kind, sn, sd }, hints: [`Divide by 100: move the decimal point two places to the left.`, `${N(pctv)}% = <b>${N(dec)}</b>.`] };
      if (kind === 'p2f') return { prompt: `Write ${N(pctv)}% as a fraction in simplest form.`, type: 'number', answer: value, answerText: M.fracText(sn, sd), params: { kind, sn, sd }, hints: [`Write it over 100: ${F(pctv, 100, { raw: true })}.`, `Divide top and bottom by ${M.gcd(pctv, 100)}.`, `${N(pctv)}% = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
      const places = String(dec).split('.')[1].length, pow = Math.pow(10, places);
      return { prompt: `Write ${N(dec)} as a fraction in simplest form.`, type: 'number', answer: value, answerText: M.fracText(sn, sd), params: { kind, sn, sd }, hints: [`${N(dec)} has ${places} decimal place${places > 1 ? 's' : ''}, so write it over ${N(pow)}: ${F(Math.round(dec * pow), pow, { raw: true })}.`, `Divide top and bottom by ${M.gcd(Math.round(dec * pow), pow)}.`, `${N(dec)} = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) { const { kind, sn, sd } = q.params; const v = sn / sd; const expect = (kind === 'f2p' || kind === 'd2p') ? v * 100 : v; return Math.abs(expect - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.percent-of', title: 'Percent of a number',
    learn: p('To find a <b>percent of a number</b>, turn the percent into a decimal and multiply: 35% of 80 is 0.35 × 80 = 28. In these questions, “of” means multiply.') +
      p('Useful landmarks: 10% is one tenth (move the point one place left), 50% is half, 25% is a quarter, and 1% is one hundredth. You can build other percents from them: 15% of 60 is 10% (6) plus 5% (3), which is 9.') +
      example('Example: a percent of a number', `${big('What is 12% of 250?')}0.12 × 250 = <b>30</b>. Or with landmarks: 10% of 250 is 25 and 1% is 2.5, so 2% is 5, and 12% is 25 + 5 = 30.`) +
      example('Example: a word problem', `A 640-page book is 25% read. How many pages have been read? 25% is a quarter, and 640 ÷ 4 = <b>160 pages</b>. Check: 0.25 × 640 = 160.`),
    make(rng) {
      const pcts = [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 90];
      const pc = rng.pick(pcts);
      const base = rng.pick([20, 40, 50, 60, 80, 120, 150, 200, 240, 300, 400, 500, 640, 800, 1200]);
      const ans = M.round(pc * base / 100, 4);
      const kind = rng.pick(['plain', 'plain', 'word']);
      const name = rng.pick(NAMES);
      const prompt = kind === 'plain' ? `What is ${pc}% of ${N(base)}?` : rng.pick([
        `A class has ${N(base)} students and ${pc}% of them walk to school. How many students walk?`,
        `${name} has saved ${M.money(base)} and spends ${pc}% of it on a game. How much does the game cost?`,
        `A ${N(base)}-page book is ${pc}% read. How many pages have been read?`]);
      return { prompt, type: 'number', answer: ans, params: { pc, base }, tolerance: 0.001,
        hints: [`Write the percent as a decimal: ${pc}% = ${N(pc / 100)}.`, `Multiply: ${N(pc / 100)} × ${N(base)} = ${N(ans)}.`, `Check with 10%: 10% of ${N(base)} is ${N(base / 10)}, and ${pc}% is ${N(pc / 10)} times that. The answer is <b>${N(ans)}</b>.`] };
    },
    verify(q) { return Math.abs(q.answer - q.params.pc * q.params.base / 100) < 1e-6; },
  });

  /* ---------- Unit 4 ---------- */
  A.skill({
    id: 'math7.unit-rate', title: 'Unit rates',
    learn: p('A <b>rate</b> compares two amounts measured in different units, like 150 miles in 3 hours. A <b>unit rate</b> tells how much of the first amount goes with <b>one</b> of the second, such as miles per hour (“per” means “for each”). To find it, divide the first amount by the second: 150 ÷ 3 = 50 miles per hour.') +
      p('Unit rates make comparisons fair: 12 pens for $9 is $0.75 per pen, and 8 pens for $6.40 is $0.80 per pen, so the first pack is the better deal.') +
      example('Example: a whole-number rate', `${big('A printer prints 180 pages in 4 minutes. How many pages per minute?')}180 ÷ 4 = <b>45 pages per minute</b>.`) +
      example('Example: a price per item', `6 notebooks cost $7.50. What is the cost per notebook? 7.50 ÷ 6 = <b>$1.25</b> per notebook. Check: 6 × 1.25 = 7.50.`),
    make(rng) {
      const name = rng.pick(NAMES);
      const kinds = [
        () => { const r = rng.int(35, 75), t = rng.int(2, 6); return { prompt: `A train travels ${N(r * t)} km in ${t} hours at a steady speed. How many kilometers does it travel per hour?`, ans: r, unit: 'km/h', a: r * t, b: t, what: 'kilometers', per: 'hour' }; },
        () => { const r = rng.pick([0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 1.2, 1.25, 1.5, 2.5]), n = rng.int(4, 12); return { prompt: `${n} notebooks cost ${M.money(M.round(r * n, 2))}. What is the cost per notebook?`, ans: r, unit: '$', a: M.round(r * n, 2), b: n, what: 'dollars', per: 'notebook' }; },
        () => { const r = rng.int(20, 60), t = rng.int(3, 9); return { prompt: `${name} reads ${N(r * t)} pages in ${t} days, the same number each day. How many pages per day is that?`, ans: r, unit: 'pages/day', a: r * t, b: t, what: 'pages', per: 'day' }; },
        () => { const r = rng.pick([1.5, 2, 2.5, 3, 4, 6]), t = rng.int(2, 8); return { prompt: `A tap fills ${N(r * t)} liters in ${t} minutes. How many liters per minute?`, ans: r, unit: 'L/min', a: M.round(r * t, 2), b: t, what: 'liters', per: 'minute' }; },
        () => { const r = rng.int(8, 25), t = rng.int(3, 12); return { prompt: `${name} earns ${M.money(r * t)} for ${t} hours of work. How much is that per hour?`, ans: r, unit: '$/hour', a: r * t, b: t, what: 'dollars', per: 'hour' }; },
      ];
      const k = rng.pick(kinds)();
      return { prompt: k.prompt, type: 'number', answer: k.ans, unit: k.unit, params: { a: k.a, b: k.b }, tolerance: 0.005,
        hints: [`A unit rate is “how many ${k.what} for one ${k.per}”. Divide the ${k.what} by the number of ${k.per}s.`, `${N(k.a)} ÷ ${N(k.b)} = ${N(k.ans)}.`, `The unit rate is <b>${N(k.ans)}</b> ${k.what} per ${k.per}.`] };
    },
    verify(q) { return Math.abs(q.params.a / q.params.b - q.answer) < 1e-6; },
  });

  A.skill({
    id: 'math7.proportional-table', title: 'Recognizing proportional relationships',
    learn: p(`Two amounts are <b>proportional</b> when one is always the same multiple of the other: ${V('y')} = ${V('k')}${V('x')}. The <b>ratio</b> ${V('y')} ÷ ${V('x')} compares them. In a table, work out ${V('y')} ÷ ${V('x')} in every row. If it’s the same number every time, the relationship is proportional, and that number is the <b>constant</b> ${V('k')}.`) +
      p(`A relationship like ${V('y')} = 3${V('x')} + 2 isn’t proportional: the ratio changes from row to row, and its graph doesn’t pass through (0, 0).`) +
      example('Example: proportional', `${M.table([V('x'), V('y')], [[2, 10], [5, 25], [8, 40]], { compact: true })}10 ÷ 2 = 5, 25 ÷ 5 = 5 and 40 ÷ 8 = 5. Every ratio is 5, so <b>yes</b>, it’s proportional, with ${V('y')} = 5${V('x')}.`) +
      example('Example: not proportional', `${M.table([V('x'), V('y')], [[1, 5], [2, 8], [4, 14]], { compact: true })}5 ÷ 1 = 5, but 8 ÷ 2 = 4 and 14 ÷ 4 = 3.5. The ratios aren’t all the same, so <b>no</b>, it isn’t proportional. (Here ${V('y')} = 3${V('x')} + 2.)`),
    make(rng) {
      const k = rng.int(2, 9), prop = rng.chance(0.55), b = rng.nz(-6, 6);
      let xs = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3).sort((a, c) => a - c);
      const ys = xs.map(x => prop ? k * x : k * x + b);
      const ratios = xs.map((x, i) => ys[i] / x);
      const choices = [`Yes: ${V('y')} = ${k}${V('x')}`, `Yes: ${V('y')} = ${k + 1}${V('x')}`, `Yes: ${V('y')} = ${k - 1 === 0 ? k + 2 : k - 1}${V('x')}`, `No, the ratio ${V('y')} ÷ ${V('x')} is not constant`];
      const answer = prop ? choices[0] : choices[3];
      return { prompt: `Is ${V('y')} proportional to ${V('x')}?${M.table([V('x'), V('y')], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, params: { prop, k, xs, ys },
        hints: [`Divide ${V('y')} by ${V('x')} in each row: ${ratios.map((r, i) => `${N(ys[i])} ÷ ${N(xs[i])} = ${M.fracText(ys[i], xs[i])}`).join(', ')}.`,
          prop ? `Every ratio is ${k}, so ${V('y')} is always ${k} times ${V('x')}.` : `The ratios are not all the same, so there is no single constant.`,
          prop ? `<b>Yes: ${V('y')} = ${k}${V('x')}</b>.` : `<b>No</b>: ${V('y')} is not proportional to ${V('x')} (here ${V('y')} = ${k}${V('x')} ${M.signed(b)}).`] };
    },
    verify(q) { const { xs, ys } = q.params; const r = ys.map((y, i) => y / xs[i]); const same = r.every(v => Math.abs(v - r[0]) < 1e-9); return same ? q.answer.startsWith('Yes') && q.answer.includes(`= ${r[0]}<i>`) : q.answer.startsWith('No'); },
  });

  A.skill({
    id: 'math7.constant-k', title: 'Constant of proportionality',
    learn: p(`In a proportional relationship ${V('y')} = ${V('k')}${V('x')}, the number ${V('k')} is the <b>constant of proportionality</b>. It’s the unit rate: how much ${V('y')} goes with each 1 of ${V('x')}. On a graph, the line passes through (0, 0) and (1, ${V('k')}).`) +
      p(`From an equation, read it off: it’s the number multiplying ${V('x')}. From a table or a point, divide ${V('y')} by ${V('x')}. From a sentence like “3 kg costs $7.50”, divide to get $2.50 per kg.`) +
      example('Example: from an equation', `${big(`${V('y')} = 7${V('x')}`)}The number multiplying ${V('x')} is 7, so ${V('k')} = <b>7</b>.`) +
      example('Example: from a point', `${V('y')} is proportional to ${V('x')}, and when ${V('x')} = 6, ${V('y')} = 27. ${V('k')} = 27 ÷ 6 = <b>4.5</b>.`) +
      example('Example: from a sentence', `Strawberries cost $10.50 for 3 kg. ${V('k')} = 10.50 ÷ 3 = <b>3.50</b> dollars per kilogram.`),
    make(rng) {
      const kind = rng.pick(['point', 'equation', 'table', 'words']);
      const k = rng.pick([0.5, 1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 12]);
      const x = rng.int(2, 12), y = M.round(k * x, 3);
      if (kind === 'equation') { const other = rng.nz(-9, 9); const eqn = rng.bool() ? `${V('y')} = ${N(k)}${V('x')}` : `${V('y')} = ${V('x')} × ${N(k)}`; return { prompt: `What is the constant of proportionality in ${eqn}?`, type: 'number', answer: k, params: { k, x, y }, hints: [`The equation has the form ${V('y')} = ${V('k')}${V('x')}; the constant is the number multiplying ${V('x')}.`, `${V('k')} = <b>${N(k)}</b>.`] }; }
      if (kind === 'table') { const xs = rng.sample([1, 2, 3, 4, 5, 6, 8, 10], 3).sort((a, b) => a - b); return { prompt: `${V('y')} is proportional to ${V('x')}. What is the constant of proportionality?${M.table([V('x'), V('y')], xs.map(xx => [N(xx), N(M.round(k * xx, 3))]))}`, type: 'number', answer: k, params: { k, x: xs[0], y: M.round(k * xs[0], 3) }, hints: [`Pick any row and divide ${V('y')} by ${V('x')}.`, `${N(M.round(k * xs[0], 3))} ÷ ${N(xs[0])} = ${N(k)}; the other rows give the same.`, `${V('k')} = <b>${N(k)}</b>.`] }; }
      if (kind === 'words') { const name = rng.pick(NAMES); const kg = rng.int(2, 8), price = M.round(k * kg, 2); return { prompt: `${name} pays ${M.money(price)} for ${kg} kg of apples. Apples cost the same per kilogram. What is the constant of proportionality, in dollars per kilogram?`, type: 'number', answer: k, unit: '$/kg', params: { k, x: kg, y: price }, hints: [`The constant is the unit rate: dollars divided by kilograms.`, `${N(price)} ÷ ${kg} = <b>${N(k)}</b> dollars per kilogram.`] }; }
      return { prompt: `${V('y')} is proportional to ${V('x')}. When ${V('x')} = ${x}, ${V('y')} = ${N(y)}. What is the constant of proportionality?`, type: 'number', answer: k, params: { k, x, y }, hints: [`${V('y')} = ${V('k')}${V('x')}, so ${V('k')} = ${V('y')} ÷ ${V('x')}.`, `${N(y)} ÷ ${x} = <b>${N(k)}</b>.`] };
    },
    verify(q) { return Math.abs(q.params.y / q.params.x - q.answer) < 1e-6; },
  });

  A.skill({
    id: 'math7.percent-change', title: 'Percent increase and decrease',
    learn: p('<b>Percent change</b> = (change ÷ original) × 100, where the change is how much the amount went up or down. The <b>original</b> is always the amount you start from, even for a decrease.') +
      p('To find a new amount after a change, multiply the original by (1 + rate) for an increase or (1 − rate) for a decrease, with the rate written as a decimal. A discount is a decrease; a tip or a sales tax is an increase.') +
      example('Example: a percent increase', `A plant grew from 20 cm to 26 cm. The change is 26 − 20 = 6. Divide by the original: 6 ÷ 20 = 0.3, so it’s a <b>30% increase</b>.`) +
      example('Example: a percent decrease', `A price dropped from $80 to $60. The change is 80 − 60 = 20. Divide by the original: 20 ÷ 80 = 0.25, so it’s a <b>25% decrease</b>.`) +
      example('Example: the new amount', `A $40 jacket is 25% off, so you pay 75% of the price: 40 × 0.75 = <b>$30</b>. An 8% sales tax on $50 means you pay 108%: 50 × 1.08 = <b>$54</b>.`),
    make(rng) {
      const kind = rng.pick(['find-pct', 'find-pct', 'after-dec', 'after-inc']);
      const name = rng.pick(NAMES);
      if (kind === 'find-pct') {
        const orig = rng.pick([20, 25, 40, 50, 60, 80, 120, 150, 200, 250, 400]);
        const pc = rng.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
        const inc = rng.bool(); const nw = M.round(orig * (1 + (inc ? pc : -pc) / 100), 2);
        return { prompt: rng.pick([`A price went from ${M.money(orig)} to ${M.money(nw)}. What was the percent ${inc ? 'increase' : 'decrease'}?`, `A town's population changed from ${N(orig * 10)} to ${N(nw * 10)}. What was the percent ${inc ? 'increase' : 'decrease'}?`]), type: 'number', answer: pc, unit: '%', params: { kind, orig, nw }, tolerance: 0.01,
          hints: [`Find the change: ${N(Math.abs(nw - orig))}.`, `Divide the change by the <b>original</b>: ${N(Math.abs(nw - orig))} ÷ ${N(orig)} = ${N(Math.abs(nw - orig) / orig)}.`, `Multiply by 100: a <b>${pc}%</b> ${inc ? 'increase' : 'decrease'}.`] };
      }
      const orig = rng.pick([24, 30, 40, 45, 50, 60, 75, 80, 90, 120, 150, 200]);
      const pc = rng.pick([5, 8, 10, 15, 20, 25, 30, 40, 50]);
      if (kind === 'after-dec') { const nw = M.round(orig * (1 - pc / 100), 2); return { prompt: `${name} buys a ${M.money(orig)} pair of shoes at ${pc}% off. What is the sale price?`, type: 'number', answer: nw, unit: '$', params: { kind, orig, pc }, tolerance: 0.01, hints: [`${pc}% off means you pay ${100 - pc}% of the price.`, `${N((100 - pc) / 100)} × ${N(orig)} = ${N(nw)}.`, `The sale price is <b>${M.money(nw)}</b>. (Or: the discount is ${N(pc / 100)} × ${N(orig)} = ${M.money(M.round(orig * pc / 100, 2))}; subtract it.)`] }; }
      const nw = M.round(orig * (1 + pc / 100), 2);
      return { prompt: rng.bool() ? `A meal costs ${M.money(orig)} and ${name} adds a ${pc}% tip. What is the total?` : `A ${M.money(orig)} item has ${pc}% tax added. What is the total price?`, type: 'number', answer: nw, unit: '$', params: { kind, orig, pc }, tolerance: 0.01, hints: [`Adding ${pc}% means paying ${100 + pc}% of the price.`, `${N((100 + pc) / 100)} × ${N(orig)} = ${N(nw)}.`, `The total is <b>${M.money(nw)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'find-pct') return Math.abs(Math.abs(p.nw - p.orig) / p.orig * 100 - q.answer) < 1e-6; const expect = p.kind === 'after-dec' ? p.orig * (1 - p.pc / 100) : p.orig * (1 + p.pc / 100); return Math.abs(expect - q.answer) < 0.006; },
  });

  /* ---------- Unit 5 ---------- */
  const X = V('x');
  /** keep candidate choices that differ from the answer and from each other */
  function distinct(answer, candidates, need) {
    const out = [];
    candidates.forEach(c => { if (c !== answer && !out.includes(c)) out.push(c); });
    return out.slice(0, need);
  }

  A.skill({
    id: 'math7.combine-like-terms', title: 'Combining like terms',
    learn: p(`A <b>term</b> is one piece of an expression, separated from the others by + or − signs. The number in front of a variable is its <b>coefficient</b>, and a term with no variable is a <b>constant</b>. <b>Like terms</b> have exactly the same variable part: 3${X} and −5${X} are like terms, but 3${X} and 3 aren’t.`) +
      p(`To simplify, add the coefficients of the like terms and keep the variable part, then combine the constants. The sign in front of a term belongs to it: in 7${X} − 2 − 4${X} + 9, the terms are 7${X}, −2, −4${X} and 9.`) +
      example('Example: two kinds of terms', `${big(`5${X} + 3 − 8${X} + 4`)}${X} terms: 5 − 8 = −3. Constants: 3 + 4 = 7. Simplified: <b>−3${X} + 7</b>.`) +
      example('Example: a hidden 1', `${big(`−${X} − 6 + 4${X} − 2`)}−${X} means −1${X}. ${X} terms: −1 + 4 = 3. Constants: −6 − 2 = −8. Simplified: <b>3${X} − 8</b>.`),
    make(rng) {
      let a = rng.nz(-9, 9), c = rng.nz(-9, 9), b = rng.nz(-9, 9), d = rng.nz(-9, 9);
      if (a + c === 0) c = c + (c > 0 ? 1 : -1);
      if (b + d === 0) d = d + (d > 0 ? 1 : -1);
      const terms = rng.shuffle([M.term(a, 'x'), N(b), M.term(c, 'x'), N(d)]);
      const expr = terms.map((t, i) => i === 0 ? t : (t.startsWith('−') ? ' − ' + t.slice(1) : ' + ' + t)).join('');
      const answer = M.poly([a + c, b + d]);
      const choices = [answer].concat(distinct(answer, [M.poly([a - c, b + d]), M.poly([a + c, b - d]), M.poly([a - c, b - d]), M.poly([a + c + b + d]), M.poly([a + c, 0]) + (b + d >= 0 ? ' + ' : ' − ') + M.sup(N(Math.abs(b + d)) + X, 2)], 3));
      return { prompt: `Simplify.${big(expr)}`, type: 'choice', choices, answer, params: { a, b, c, d, coef: a + c, konst: b + d },
        hints: [`Collect the ${X} terms: ${M.term(a, 'x')} and ${M.term(c, 'x')}. Their coefficients add: ${N(a)} ${M.signed(c)} = ${N(a + c)}.`, `Collect the constants: ${N(b)} ${M.signed(d)} = ${N(b + d)}.`, `Put them together: <b>${answer}</b>.`] };
    },
    verify(q) {
      const { a, b, c, d, coef, konst } = q.params;
      return [1, 10].every(x => a * x + b + c * x + d === coef * x + konst) && q.answer === M.poly([coef, konst]);
    },
  });

  A.skill({
    id: 'math7.distribute', title: 'The distributive property',
    learn: p(`The <b>distributive property</b> says that multiplying a number by a sum means multiplying it by <b>each</b> term inside: ${V('a')}(${V('b')} + ${V('c')}) = ${V('a')}${V('b')} + ${V('a')}${V('c')}. The number outside “distributes” over everything inside the parentheses. Writing the expression without the parentheses is called <b>expanding</b> it.`) +
      p('Watch the signs: each term keeps its own sign when you multiply it. The most common slip is multiplying only the first term.') +
      example('Example: a positive number outside', `${big(`4(3${X} − 7)`)}4 × 3${X} = 12${X} and 4 × (−7) = −28, so the result is <b>12${X} − 28</b>.`) +
      example('Example: a negative number outside', `${big(`−5(2${X} − 3)`)}−5 × 2${X} = −10${X} and −5 × (−3) = +15, so the result is <b>−10${X} + 15</b>.`),
    make(rng) {
      const a = rng.nz(-8, 8), b = rng.nz(-7, 7), c = rng.nz(-9, 9);
      const inside = M.poly([b, c]);
      const expr = rng.bool() ? `${N(a)}(${inside})` : `(${inside}) × ${a < 0 ? `(${N(a)})` : N(a)}`;
      const answer = M.poly([a * b, a * c]);
      const choices = [answer].concat(distinct(answer, [M.poly([a * b, c]), M.poly([a * b, -a * c]), M.poly([a + b, a + c]), M.poly([a * b, a + c]), M.poly([-a * b, a * c])], 3));
      return { prompt: `Expand.${big(expr)}`, type: 'choice', choices, answer, params: { a, b, c },
        hints: [`Multiply ${N(a)} by the first term: ${N(a)} × ${M.term(b, 'x')} = ${M.term(a * b, 'x')}.`, `Multiply ${N(a)} by the second term, sign included: ${N(a)} × (${N(c)}) = ${N(a * c)}.`, `Add the two products: <b>${answer}</b>.`] };
    },
    verify(q) { const { a, b, c } = q.params; return q.answer === M.poly([a * b, a * c]) && [2, 5].every(x => a * (b * x + c) === a * b * x + a * c); },
  });

  A.skill({
    id: 'math7.two-step-equations', title: 'Two-step equations',
    learn: p(`To <b>solve</b> an equation means to find the value of ${X} that makes it true. A two-step equation like 3${X} + 5 = 20 is undone in reverse order: first undo the <b>addition or subtraction</b>, then undo the <b>multiplication or division</b>. Whatever you do to one side, do to the other, so the two sides stay equal.`) +
      p(`When there are parentheses, like 3(${X} − 2) = 21, you can divide by the number outside first. In a word problem, let ${X} be the unknown and write the equation: if 4 notebooks and a $3 pen cost $15, then 4${X} + 3 = 15, so 4${X} = 12 and ${X} = 3. Check an answer by putting it back into the equation.`) +
      example('Example: a negative coefficient', `${big(`−4${X} + 7 = 31`)}Subtract 7 from both sides: −4${X} = 24. Divide both sides by −4: <b>${X} = −6</b>. Check: −4 × (−6) + 7 = 24 + 7 = 31 ✓`) +
      example('Example: a division', `${big(`${F(X, 5)} − 2 = 3`)}Add 2 to both sides: ${F(X, 5)} = 5. Multiply both sides by 5: <b>${X} = 25</b>. Check: 25 ÷ 5 − 2 = 3 ✓`) +
      example('Example: parentheses', `${big(`3(${X} − 2) = 21`)}Divide both sides by 3: ${X} − 2 = 7. Add 2 to both sides: <b>${X} = 9</b>. Check: 3 × (9 − 2) = 21 ✓`),
    make(rng) {
      const form = rng.pick(['ax+b', 'ax+b', 'x/a+b', 'a(x+b)', 'word']);
      const x = rng.nz(-12, 12);
      const name = rng.pick(NAMES);
      if (form === 'x/a+b') {
        const a = rng.int(2, 9), b = rng.nz(-15, 15), c = x + b;           // x/a + b = c with x = a·k
        const xx = x * a;
        return { prompt: `Solve for ${X}.${big(`${F(X, N(a), { raw: true })} ${M.signed(b)} = ${N(c)}`)}`, type: 'number', answer: xx, params: { form, a, b, c },
          hints: [`Undo the ${b < 0 ? 'subtraction' : 'addition'} first: ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))} on both sides to get ${F(X, N(a), { raw: true })} = ${N(c - b)}.`, `Undo the division by multiplying both sides by ${a}: ${X} = ${N(c - b)} × ${a}.`, `<b>${X} = ${N(xx)}</b>. Check: ${N(xx)} ÷ ${a} ${M.signed(b)} = ${N(c)} ✓`] };
      }
      if (form === 'a(x+b)') {
        const a = rng.nz(-6, 6), b = rng.nz(-9, 9), c = a * (x + b);
        return { prompt: `Solve for ${X}.${big(`${N(a)}(${X} ${M.signed(b)}) = ${N(c)}`)}`, type: 'number', answer: x, params: { form, a, b, c },
          hints: [`Undo the multiplication first: divide both sides by ${N(a)} to get ${X} ${M.signed(b)} = ${N(x + b)}.`, `Now ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))}: ${X} = ${N(x + b)} ${M.signed(-b)}.`, `<b>${X} = ${N(x)}</b>. Check: ${N(a)}(${N(x)} ${M.signed(b)}) = ${N(a)} × ${N(x + b)} = ${N(c)} ✓`] };
      }
      const a = rng.nz(-9, 9), b = rng.nz(-15, 15), c = a * x + b;
      if (form === 'word') {
        const xp = Math.abs(x) || 4, ap = Math.abs(a) || 3, bp = Math.abs(b), cp = ap * xp + bp;
        return { prompt: `${name} buys ${ap} notebooks and a ${M.money(bp)} pen, and pays ${M.money(cp)} in total. How much does one notebook cost, in dollars?`, type: 'number', answer: xp, unit: '$', params: { form, a: ap, b: bp, c: cp },
          hints: [`Let ${X} be the cost of a notebook. Then ${ap}${X} + ${bp} = ${cp}.`, `Subtract ${bp} from both sides: ${ap}${X} = ${cp - bp}.`, `Divide by ${ap}: <b>${X} = ${xp}</b>, so a notebook costs ${M.money(xp)}.`] };
      }
      return { prompt: `Solve for ${X}.${big(`${M.term(a, 'x')} ${M.signed(b)} = ${N(c)}`)}`, type: 'number', answer: x, params: { form, a, b, c },
        hints: [`Undo the ${b < 0 ? 'subtraction' : 'addition'} first: ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))} on both sides to get ${M.term(a, 'x')} = ${N(c - b)}.`, `Divide both sides by ${N(a)}: ${X} = ${N(c - b)} ÷ ${a < 0 ? `(${N(a)})` : N(a)}.`, `<b>${X} = ${N(x)}</b>. Check: ${N(a)} × ${x < 0 ? `(${N(x)})` : N(x)} ${M.signed(b)} = ${N(c)} ✓`] };
    },
    verify(q) {
      const { form, a, b, c } = q.params, x = q.answer;
      if (form === 'x/a+b') return x / a + b === c;
      if (form === 'a(x+b)') return a * (x + b) === c;
      return a * x + b === c;
    },
  });

  A.skill({
    id: 'math7.two-step-inequalities', title: 'Two-step inequalities',
    learn: p(`An <b>inequality</b> compares two sides with &lt; (less than), &gt; (greater than), ≤ (less than or equal to) or ≥ (greater than or equal to). Its solution is every number that makes it true, such as ${X} &lt; −4.`) +
      p(`Solve it the same way as an equation, with <b>one extra rule</b>: when you multiply or divide both sides by a <b>negative</b> number, flip the inequality sign. Then check with a number from your answer.`) +
      example('Example: dividing by a positive', `${big(`5${X} − 4 ≤ 16`)}Add 4 to both sides: 5${X} ≤ 20. Divide by 5, which is positive, so the sign stays: <b>${X} ≤ 4</b>. Check with ${X} = 0: 5(0) − 4 = −4, and −4 ≤ 16 ✓`) +
      example('Example: dividing by a negative', `${big(`−2${X} + 3 &gt; 11`)}Subtract 3 from both sides: −2${X} &gt; 8. Divide by −2, which is negative, so flip the sign: <b>${X} &lt; −4</b>. Check with ${X} = −5: −2(−5) + 3 = 13, and 13 &gt; 11 ✓`),
    make(rng) {
      const a = rng.nz(-8, 8), b = rng.nz(-12, 12), x = rng.nz(-9, 9), c = a * x + b;
      const op = rng.pick(['<', '>', '≤', '≥']);
      const flip = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
      const ansOp = a < 0 ? flip[op] : op;
      const answer = `${X} ${ansOp} ${N(x)}`;
      const choices = ['<', '>', '≤', '≥'].map(o => `${X} ${o} ${N(x)}`);
      return { prompt: `Solve for ${X}.${big(`${M.term(a, 'x')} ${M.signed(b)} ${op} ${N(c)}`)}`, type: 'choice', choices, answer, keepOrder: true, params: { a, b, c, op, x },
        hints: [`${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))} on both sides: ${M.term(a, 'x')} ${op} ${N(c - b)}.`, `Divide both sides by ${N(a)}. ${a < 0 ? `Dividing by a <b>negative</b> flips the sign: ${op} becomes ${ansOp}.` : 'It is positive, so the sign stays the same.'}`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { a, b, c, op, x } = q.params;
      const holds = (lhs, o, rhs) => o === '<' ? lhs < rhs : o === '>' ? lhs > rhs : o === '≤' ? lhs <= rhs : lhs >= rhs;
      const ansOp = q.answer.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim().split(/\s+/)[1];
      // the answer and the original must agree on every integer near the boundary
      return [x - 2, x - 1, x, x + 1, x + 2].every(t => holds(a * t + b, op, c) === holds(t, ansOp, x));
    },
  });

  /* ---------- Unit 6 ---------- */
  A.skill({
    id: 'math7.circles', title: 'Area and circumference of circles',
    learn: p(`<b>Circumference</b> is the distance around a circle: ${V('C')} = 2π${V('r')} = π${V('d')}. <b>Area</b> is the space inside: ${V('A')} = π${V('r')}².`) +
      p('The radius goes from the center to the edge; the diameter goes all the way across, so it is twice the radius. On this site use 3.14 for π and round to two decimal places.') +
      example('Example', `${big('A circle has radius 5 cm.')}${V('C')} = 2 × 3.14 × 5 = <b>31.4 cm</b>. ${V('A')} = 3.14 × 5² = 3.14 × 25 = <b>78.5 cm²</b>.`),
    make(rng) {
      const kind = rng.pick(['area-r', 'area-d', 'circ-r', 'circ-d', 'r-from-c']);
      const r = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
      const unit = rng.pick(['cm', 'm', 'in', 'ft']);
      if (kind === 'r-from-c') { const C = M.round(6.28 * r, 2); return { prompt: `A circle has a circumference of ${N(C)} ${unit}. What is its radius? Use 3.14 for π.`, type: 'number', answer: r, unit, params: { kind, r }, tolerance: 0.05, hints: [`${V('C')} = 2π${V('r')}, so ${V('r')} = ${V('C')} ÷ (2π).`, `${N(C)} ÷ 6.28 = ${N(r)}.`, `The radius is <b>${N(r)} ${unit}</b>.`] }; }
      const given = kind.endsWith('-d') ? `diameter ${N(2 * r)} ${unit}` : `radius ${N(r)} ${unit}`;
      if (kind.startsWith('area')) {
        const ans = M.round(3.14 * r * r, 2);
        return { prompt: `A circle has ${given}. What is its area? Use 3.14 for π.`, type: 'number', answer: ans, unit: unit + '²', params: { kind, r }, tolerance: 0.05,
          hints: [kind === 'area-d' ? `The radius is half the diameter: ${N(2 * r)} ÷ 2 = ${N(r)} ${unit}.` : `${V('A')} = π${V('r')}², and the radius is ${N(r)} ${unit}.`, `Square the radius: ${N(r)}² = ${N(r * r)}. Then multiply by 3.14.`, `3.14 × ${N(r * r)} = <b>${N(ans)} ${unit}²</b>.`] };
      }
      const ans = M.round(6.28 * r, 2);
      return { prompt: `A circle has ${given}. What is its circumference? Use 3.14 for π.`, type: 'number', answer: ans, unit, params: { kind, r }, tolerance: 0.05,
        hints: [kind === 'circ-d' ? `${V('C')} = π${V('d')}: multiply the diameter by 3.14.` : `${V('C')} = 2π${V('r')}: double the radius to get the diameter, ${N(2 * r)} ${unit}, then multiply by 3.14.`, `3.14 × ${N(2 * r)} = <b>${N(ans)} ${unit}</b>.`] };
    },
    verify(q) { const { kind, r } = q.params; const d = 2 * r; const expect = kind === 'r-from-c' ? r : kind.startsWith('area') ? 3.14 * (d / 2) * (d / 2) : 3.14 * d; return Math.abs(expect - q.answer) < 0.006; },
  });

  A.skill({
    id: 'math7.angle-pairs', title: 'Angle relationships',
    learn: p('<b>Complementary</b> angles add to 90°. <b>Supplementary</b> angles add to 180°, as do angles on a straight line. <b>Vertical</b> angles, the opposite pair made by two crossing lines, are equal. The three angles of any <b>triangle</b> add to 180°.') +
      p('Most angle questions are a subtraction: find what the angles must add to, then take away the ones you know.') +
      example('Example', `${big('Two angles of a triangle are 48° and 67°.')}180 − 48 − 67 = <b>65°</b>.`),
    make(rng) {
      const kind = rng.pick(['comp', 'supp', 'vert', 'tri', 'line']);
      const a = rng.int(15, 75), b = rng.int(20, 80);
      if (kind === 'comp') return { prompt: `Two angles are complementary. One measures ${a}°. What is the other?`, type: 'number', answer: 90 - a, unit: '°', params: { kind, a }, hints: [`Complementary angles add to 90°.`, `90 − ${a} = <b>${90 - a}°</b>.`] };
      if (kind === 'supp') { const s = a + 60; return { prompt: `Two angles are supplementary. One measures ${s}°. What is the other?`, type: 'number', answer: 180 - s, unit: '°', params: { kind, a: s }, hints: [`Supplementary angles add to 180°.`, `180 − ${s} = <b>${180 - s}°</b>.`] }; }
      if (kind === 'line') { const s = a + 30; return { prompt: `Two angles sit side by side on a straight line. One measures ${s}°. What is the other?`, type: 'number', answer: 180 - s, unit: '°', params: { kind, a: s }, hints: [`Angles on a straight line add to 180°.`, `180 − ${s} = <b>${180 - s}°</b>.`] }; }
      if (kind === 'vert') { const s = a + 40; return { prompt: `Two lines cross. One of the angles formed measures ${s}°. What is the measure of the angle directly opposite it (its vertical angle)?`, type: 'number', answer: s, unit: '°', params: { kind, a: s }, hints: [`Vertical angles are the opposite pair where two lines cross.`, `Vertical angles are equal, so the opposite angle is also <b>${s}°</b>.`] }; }
      return { prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`, type: 'number', answer: 180 - a - b, unit: '°', params: { kind, a, b }, hints: [`The angles of a triangle add to 180°.`, `${a} + ${b} = ${a + b}, and 180 − ${a + b} = <b>${180 - a - b}°</b>.`] };
    },
    verify(q) { const { kind, a, b } = q.params; if (kind === 'comp') return q.answer + a === 90; if (kind === 'vert') return q.answer === a; if (kind === 'tri') return q.answer + a + b === 180; return q.answer + a === 180; },
  });

  A.skill({
    id: 'math7.scale-drawings', title: 'Scale drawings',
    learn: p('A scale drawing keeps every length in the same ratio to the real thing. A scale of <b>1 cm : 4 m</b> means each centimeter on the drawing stands for 4 meters in real life.') +
      p('Drawing → real: multiply by the scale. Real → drawing: divide by the scale. Between two similar figures, the <b>scale factor</b> is new length ÷ original length, and every length (but not the area) is multiplied by it.') +
      example('Example', `${big('Scale 1 cm : 4 m. A wall is 6.5 cm long on the plan.')}Real length = 6.5 × 4 = <b>26 m</b>.`),
    make(rng) {
      const kind = rng.pick(['to-real', 'to-real', 'to-drawing', 'factor']);
      const scale = rng.pick([2, 3, 4, 5, 8, 10, 20, 25, 50]);
      const draw = rng.pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5, 8, 9, 12]);
      const real = M.round(draw * scale, 3);
      if (kind === 'to-real') return { prompt: `A map uses a scale of 1 cm : ${scale} km. Two towns are ${N(draw)} cm apart on the map. How far apart are they in real life?`, type: 'number', answer: real, unit: 'km', params: { kind, scale, draw, real }, hints: [`Each centimeter stands for ${scale} km, so multiply the map distance by ${scale}.`, `${N(draw)} × ${scale} = <b>${N(real)} km</b>.`] };
      if (kind === 'to-drawing') return { prompt: `A floor plan uses a scale of 1 cm : ${scale} m. A room is ${N(real)} m long. How long is it on the plan?`, type: 'number', answer: draw, unit: 'cm', params: { kind, scale, draw, real }, hints: [`Going from real life to the drawing, divide by the scale.`, `${N(real)} ÷ ${scale} = <b>${N(draw)} cm</b>.`] };
      const k = rng.pick([1.5, 2, 2.5, 3, 4]), s = rng.int(2, 9), other = rng.int(2, 9);
      return { prompt: `A triangle with sides ${s} cm and ${other} cm is enlarged so that the ${s} cm side becomes ${N(s * k)} cm. How long does the ${other} cm side become?`, type: 'number', answer: M.round(other * k, 3), unit: 'cm', params: { kind, s, k, other }, hints: [`Find the scale factor: new ÷ original = ${N(s * k)} ÷ ${s} = ${N(k)}.`, `Every side is multiplied by ${N(k)}: ${other} × ${N(k)} = <b>${N(M.round(other * k, 3))} cm</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'to-real') return Math.abs(q.answer / p.scale - p.draw) < 1e-9; if (p.kind === 'to-drawing') return Math.abs(q.answer * p.scale - p.real) < 1e-9; return Math.abs(q.answer / p.other - (p.s * p.k) / p.s) < 1e-9; },
  });

  /* ---------- Unit 7 ---------- */
  A.skill({
    id: 'math7.mean-median', title: 'Mean, median, mode, and range',
    learn: p('<b>Mean</b>: add everything and divide by how many values there are. <b>Median</b>: put the values in order and take the middle one (with an even count, the mean of the two middle values). <b>Mode</b>: the value that appears most often. <b>Range</b>: largest minus smallest.') +
      p('The mean is pulled by very large or small values; the median is not. That is why house prices are usually reported with the median.') +
      example('Example', `${big('4, 9, 2, 9, 6')}Ordered: 2, 4, 6, 9, 9. Mean = 30 ÷ 5 = <b>6</b>. Median = <b>6</b>. Mode = <b>9</b>. Range = 9 − 2 = <b>7</b>.`),
    make(rng) {
      const n = rng.pick([5, 5, 6, 7]);
      const kind = rng.pick(['mean', 'median', 'mode', 'range']);
      let data = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], n);
      if (kind === 'mode') data[n - 1] = data[0];                      // one value appears twice, the rest once: a single mode
      if (kind === 'mean') { const sum = data.reduce((a, b) => a + b, 0); data[n - 1] += (n - sum % n) % n; }
      data = rng.shuffle(data);
      const sorted = data.slice().sort((a, b) => a - b);
      const sum = data.reduce((a, b) => a + b, 0);
      let ans, hints;
      if (kind === 'mean') { ans = sum / n; hints = [`Add the values: ${data.join(' + ')} = ${sum}.`, `Divide by how many there are: ${sum} ÷ ${n} = <b>${N(ans)}</b>.`]; }
      else if (kind === 'median') { ans = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; hints = [`Put the values in order: ${sorted.join(', ')}.`, n % 2 ? `With ${n} values the middle one is the ${M.ordinal((n + 1) / 2)}: <b>${N(ans)}</b>.` : `With ${n} values there are two middle ones, ${sorted[n / 2 - 1]} and ${sorted[n / 2]}. Their mean is <b>${N(ans)}</b>.`]; }
      else if (kind === 'mode') { const counts = {}; data.forEach(x => { counts[x] = (counts[x] || 0) + 1; }); ans = Number(Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b)); hints = [`Count how often each value appears.`, `${ans} appears ${counts[ans]} times, more than any other value, so the mode is <b>${ans}</b>.`]; }
      else { ans = sorted[n - 1] - sorted[0]; hints = [`Find the largest and smallest values: ${sorted[n - 1]} and ${sorted[0]}.`, `Range = ${sorted[n - 1]} − ${sorted[0]} = <b>${ans}</b>.`]; }
      return { prompt: `Find the <b>${kind}</b> of this data set.${big(data.join(', '))}`, type: 'number', answer: ans, params: { kind, data }, hints };
    },
    verify(q) {
      const { kind, data } = q.params, s = data.slice().sort((a, b) => a - b), n = s.length;
      if (kind === 'mean') return Math.abs(s.reduce((a, b) => a + b, 0) / n - q.answer) < 1e-9;
      if (kind === 'range') return q.answer === s[n - 1] - s[0];
      if (kind === 'median') return Math.abs(q.answer - (n % 2 ? s[Math.floor(n / 2)] : (s[n / 2 - 1] + s[n / 2]) / 2)) < 1e-9;
      const best = Math.max(...s.map(v => s.filter(x => x === v).length));
      const modes = [...new Set(s.filter(v => s.filter(x => x === v).length === best))];
      return modes.length === 1 && modes[0] === q.answer;
    },
  });

  A.skill({
    id: 'math7.simple-probability', title: 'Simple probability',
    learn: p('When every outcome is equally likely, <b>probability = favorable outcomes ÷ total outcomes</b>. It is a number from 0 (impossible) to 1 (certain), written as a fraction, decimal or percent.') +
      p(`A bag with 3 red and 5 blue marbles has 8 marbles, so P(red) = ${F(3, 8)}. The probability of <b>not</b> red is 1 − ${F(3, 8)} = ${F(5, 8)}.`) +
      example('Example', `${big('Roll a fair six-sided die. P(number greater than 4)?')}The outcomes greater than 4 are 5 and 6: two out of six. P = ${F(2, 6, { raw: true })} = <b>${F(1, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['bag', 'bag', 'die', 'spinner', 'not']);
      if (kind === 'die') {
        const ev = rng.pick([{ t: 'an even number', set: [2, 4, 6] }, { t: 'an odd number', set: [1, 3, 5] }, { t: 'a number greater than 4', set: [5, 6] }, { t: 'a number less than 3', set: [1, 2] }, { t: 'a prime number', set: [2, 3, 5] }, { t: 'a multiple of 3', set: [3, 6] }, { t: 'a 6', set: [6] }, { t: 'a number greater than 1', set: [2, 3, 4, 5, 6] }]);
        const [sn, sd] = M.simp(ev.set.length, 6);
        return { prompt: `You roll a fair six-sided die. What is the probability of rolling ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.set.length, total: 6 },
          hints: [`List the outcomes that count: ${ev.set.join(', ')}. That is ${ev.set.length} of the 6 faces.`, `P = ${F(ev.set.length, 6, { raw: true })}${sd !== 6 ? ` = <b>${F(sn, sd)}</b>` : ''}${sd === 6 ? ' = <b>' + F(sn, sd) + '</b>' : ''} (${M.fracText(sn, sd)}).`] };
      }
      const colours = rng.sample(['red', 'blue', 'green', 'yellow', 'purple', 'orange'], 3);
      const counts = colours.map(() => rng.int(1, 9));
      const total = counts.reduce((a, b) => a + b, 0);
      const i = rng.int(0, 2);
      const fav = kind === 'not' ? total - counts[i] : counts[i];
      const [sn, sd] = M.simp(fav, total);
      const list = M.list(colours.map((c, k) => `${counts[k]} ${c}`));
      const thing = kind === 'spinner' ? 'spinner with equal sections' : 'bag of marbles';
      const pick = kind === 'spinner' ? 'The spinner lands on' : 'You pick one marble without looking. It is';
      const prompt = kind === 'spinner' ? `A spinner has ${total} equal sections: ${list}. What is the probability that it lands on ${colours[i]}? Give your answer as a fraction.` :
        kind === 'not' ? `A bag has ${list} marbles. You pick one without looking. What is the probability that it is <b>not</b> ${colours[i]}? Give your answer as a fraction.` :
          `A bag has ${list} marbles. You pick one without looking. What is the probability that it is ${colours[i]}? Give your answer as a fraction.`;
      return { prompt, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav, total },
        hints: [`Count all the ${kind === 'spinner' ? 'sections' : 'marbles'}: ${counts.join(' + ')} = ${total}.`, kind === 'not' ? `“Not ${colours[i]}” means any of the other ${total - counts[i]}: P = ${F(total - counts[i], total, { raw: true })}. (Or 1 − ${F(counts[i], total, { raw: true })}.)` : `${counts[i]} of them are ${colours[i]}: P = ${F(counts[i], total, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) { return Math.abs(q.params.fav / q.params.total - q.answer) < 1e-9 && q.answer >= 0 && q.answer <= 1; },
  });

  A.skill({
    id: 'math7.compound-probability', title: 'Probability of compound events',
    learn: p('A <b>compound event</b> combines two or more simple events, like flipping a coin <i>and</i> rolling a die. When the events are <b>independent</b> (one does not change the other), multiply: P(A and B) = P(A) × P(B).') +
      p(`A sample space lists every possible outcome. Two dice have 6 × 6 = 36 equally likely outcomes, and P(sum is 7) = ${F(6, 36, { raw: true })} = ${F(1, 6)}, because six of them add to 7.`) +
      example('Example', `${big('Flip a coin and roll a die. P(heads and a 4)?')}P(heads) = ${F(1, 2)}, P(4) = ${F(1, 6)}. Multiply: ${F(1, 2)} × ${F(1, 6)} = <b>${F(1, 12)}</b>.`),
    make(rng) {
      const kind = rng.pick(['coin-die', 'two-coins', 'spinner-twice', 'dice-sum', 'bag-replace']);
      if (kind === 'coin-die') { const face = rng.int(1, 6); const side = rng.pick(['heads', 'tails']); const ev = rng.pick([{ t: `a ${face}`, k: 1 }, { t: 'an even number', k: 3 }, { t: 'a number greater than 4', k: 2 }]); const [sn, sd] = M.simp(ev.k, 12); return { prompt: `You flip a coin and roll a six-sided die. What is the probability of getting ${side} and ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.k, total: 12 }, hints: [`The events are independent. P(${side}) = ${F(1, 2)} and P(${ev.t}) = ${F(ev.k, 6)}.`, `Multiply: ${F(1, 2)} × ${F(ev.k, 6)} = ${F(ev.k, 12, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'two-coins') { const n = rng.pick([2, 3]); const ev = rng.pick([{ t: 'all heads', k: 1 }, { t: 'all tails', k: 1 }, { t: 'exactly one head', k: n }]); const total = Math.pow(2, n); const [sn, sd] = M.simp(ev.k, total); return { prompt: `You flip ${n} fair coins. What is the probability of ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.k, total }, hints: [`Each coin has 2 outcomes, so ${n} coins have ${Array(n).fill(2).join(' × ')} = ${total} equally likely outcomes.`, `${ev.k} of them ${ev.k === 1 ? 'is' : 'are'} “${ev.t}”.`, `P = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'spinner-twice') { const n = rng.pick([4, 5, 6, 8]); const r = rng.int(1, n - 1); const [sn, sd] = M.simp(r * r, n * n); return { prompt: `A spinner has ${n} equal sections and ${r} of them ${r === 1 ? 'is' : 'are'} red. You spin it twice. What is the probability of red both times? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: r * r, total: n * n }, hints: [`The two spins are independent. P(red) on one spin is ${F(r, n, { raw: true })}.`, `Multiply: ${F(r, n, { raw: true })} × ${F(r, n, { raw: true })} = ${F(r * r, n * n, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'dice-sum') { const s = rng.int(3, 11); let k = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) k++; const [sn, sd] = M.simp(k, 36); return { prompt: `You roll two six-sided dice. What is the probability that the numbers add to ${s}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, s, fav: k, total: 36 }, hints: [`Two dice have 6 × 6 = 36 equally likely outcomes.`, `Count the pairs that add to ${s}: there are ${k} of them (for example ${Math.max(1, s - 6)} + ${s - Math.max(1, s - 6)}).`, `P = ${F(k, 36, { raw: true })} = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      const red = rng.int(1, 6), blue = rng.int(1, 6), total = red + blue; const [sn, sd] = M.simp(red * blue, total * total);
      return { prompt: `A bag has ${red} red and ${blue} blue marbles. You pick one, put it back, and pick again. What is the probability of a red then a blue? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: red * blue, total: total * total }, hints: [`Because the first marble goes back, the picks are independent. P(red) = ${F(red, total, { raw: true })}, P(blue) = ${F(blue, total, { raw: true })}.`, `Multiply: ${F(red, total, { raw: true })} × ${F(blue, total, { raw: true })} = ${F(red * blue, total * total, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'dice-sum') { let k = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === p.s) k++; return Math.abs(k / 36 - q.answer) < 1e-9; }
      return Math.abs(p.fav / p.total - q.answer) < 1e-9 && q.answer > 0 && q.answer <= 1;
    },
  });

  /* ---------- Unit 8: Venn diagrams and probability ---------- */

  /** two overlapping circles in a box; marks = [only A, both, only B, neither], each a number, '?' or '' */
  function vennSvg(la, lb, marks) {
    const t = (x, y, s, size, bold) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}"${bold ? ' font-weight="700"' : ''}>${s}</text>`;
    const m = marks || ['', '', '', ''];
    return `<svg class="figure" viewBox="0 0 320 196" width="320" role="img" aria-label="Venn diagram with the circles ${M.esc(la)} and ${M.esc(lb)}">` +
      `<rect x="3" y="3" width="314" height="190" rx="10" class="stroke" style="stroke-width:1.5"/>` +
      `<circle cx="122" cy="108" r="70" class="fill" style="fill-opacity:.55"/><circle cx="198" cy="108" r="70" class="fill" style="fill-opacity:.55"/>` +
      t(100, 26, M.esc(la), 13, true) + t(220, 26, M.esc(lb), 13, true) +
      t(88, 114, m[0], 17) + t(160, 114, m[1], 17) + t(232, 114, m[2], 17) + t(290, 182, m[3], 17) + `</svg>`;
  }
  const VENN = [
    { la: 'Dog', lb: 'Cat', a: 'have a dog', b: 'have a cat', both: 'have both a dog and a cat', onlyA: 'have a dog but not a cat', onlyB: 'have a cat but not a dog', neither: 'have neither a dog nor a cat', one: 'have exactly one of the two pets', any: 'have a dog, a cat, or both' },
    { la: 'Soccer', lb: 'Basketball', a: 'play soccer', b: 'play basketball', both: 'play both sports', onlyA: 'play soccer but not basketball', onlyB: 'play basketball but not soccer', neither: 'play neither sport', one: 'play exactly one of the two sports', any: 'play at least one of the two sports' },
    { la: 'Art', lb: 'Music', a: 'take art', b: 'take music', both: 'take both art and music', onlyA: 'take art but not music', onlyB: 'take music but not art', neither: 'take neither art nor music', one: 'take exactly one of the two classes', any: 'take art, music, or both' },
    { la: 'Spanish', lb: 'French', a: 'speak Spanish', b: 'speak French', both: 'speak both Spanish and French', onlyA: 'speak Spanish but not French', onlyB: 'speak French but not Spanish', neither: 'speak neither language', one: 'speak exactly one of the two languages', any: 'speak Spanish, French, or both' },
    { la: 'Pizza', lb: 'Tacos', a: 'like pizza', b: 'like tacos', both: 'like both pizza and tacos', onlyA: 'like pizza but not tacos', onlyB: 'like tacos but not pizza', neither: 'like neither food', one: 'like exactly one of the two foods', any: 'like pizza, tacos, or both' },
  ];
  const VRULES = [{ t: 'mult', k: 3 }, { t: 'mult', k: 4 }, { t: 'mult', k: 5 }, { t: 'even' }, { t: 'odd' }, { t: 'gt', k: 20 }, { t: 'lt', k: 15 }, { t: 'factor', k: 24 }, { t: 'factor', k: 36 }, { t: 'square' }, { t: 'prime' }];
  const vLabel = r => ({ mult: `Multiples of ${r.k}`, even: 'Even numbers', odd: 'Odd numbers', gt: `Greater than ${r.k}`, lt: `Less than ${r.k}`, factor: `Factors of ${r.k}`, square: 'Square numbers', prime: 'Prime numbers' }[r.t]);
  const smallestFactor = n => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return f; return n; };
  const vTest = (r, n) => r.t === 'mult' ? n % r.k === 0 : r.t === 'even' ? n % 2 === 0 : r.t === 'odd' ? n % 2 === 1 : r.t === 'gt' ? n > r.k : r.t === 'lt' ? n < r.k :
    r.t === 'factor' ? r.k % n === 0 : r.t === 'square' ? Math.round(Math.sqrt(n)) ** 2 === n : n > 1 && smallestFactor(n) === n;
  /** a sentence saying whether n fits rule r, with the reason */
  function vWhy(r, n) {
    const ok = vTest(r, n), is = ok ? 'is' : 'is not';
    if (r.t === 'mult') return ok ? `${n} is a multiple of ${r.k}, because ${r.k} × ${n / r.k} = ${n}` : `${n} is not a multiple of ${r.k}: ${n} ÷ ${r.k} leaves a remainder of ${n % r.k}`;
    if (r.t === 'even' || r.t === 'odd') return `${n} is ${n % 2 ? 'odd' : 'even'}, so it ${ok ? 'fits' : 'does not fit'} “${vLabel(r)}”`;
    if (r.t === 'gt') return `${n} ${is} greater than ${r.k}`;
    if (r.t === 'lt') return `${n} ${is} less than ${r.k}`;
    if (r.t === 'factor') return ok ? `${n} is a factor of ${r.k}, because ${r.k} ÷ ${n} = ${r.k / n}` : `${n} is not a factor of ${r.k}: ${r.k} ÷ ${n} is not a whole number`;
    if (r.t === 'square') { const s = Math.round(Math.sqrt(n)); return ok ? `${n} is a square number, because ${s} × ${s} = ${n}` : `${n} is not a square number: ${Math.floor(Math.sqrt(n))} × ${Math.floor(Math.sqrt(n))} = ${Math.floor(Math.sqrt(n)) ** 2} and ${Math.ceil(Math.sqrt(n))} × ${Math.ceil(Math.sqrt(n))} = ${Math.ceil(Math.sqrt(n)) ** 2}`; }
    const f = smallestFactor(n);
    return ok ? `${n} is prime: its only factors are 1 and ${n}` : `${n} is not prime, because ${f} × ${n / f} = ${n}`;
  }
  const VREGIONS = ['onlyA', 'both', 'onlyB', 'neither'];
  function vennPlace(rng) {
    let ra, rb;
    do { [ra, rb] = rng.sample(VRULES, 2); } while (ra.t === rb.t || (['even', 'odd'].includes(ra.t) && ['even', 'odd'].includes(rb.t)) || (['gt', 'lt'].includes(ra.t) && ['gt', 'lt'].includes(rb.t)));
    const region = n => vTest(ra, n) ? (vTest(rb, n) ? 'both' : 'onlyA') : (vTest(rb, n) ? 'onlyB' : 'neither');
    const pool = {}; VREGIONS.forEach(k => { pool[k] = []; });
    for (let n = 2; n <= 50; n++) pool[region(n)].push(n);
    const target = rng.pick(VREGIONS.filter(k => pool[k].length));
    const n = rng.pick(pool[target]);
    const la = vLabel(ra), lb = vLabel(rb);
    const choices = [`Only in the “${la}” circle`, 'In the overlap of both circles', `Only in the “${lb}” circle`, 'Outside both circles'];
    const answer = choices[{ onlyA: 0, both: 1, onlyB: 2, neither: 3 }[target]];
    const why = { onlyA: `It fits “${la}” but not “${lb}”, so it goes in the part of that circle outside the overlap`, onlyB: `It fits “${lb}” but not “${la}”, so it goes in the part of that circle outside the overlap`, both: 'It fits both labels, so it goes where the circles overlap', neither: 'It fits neither label, so it goes in the box but outside both circles' }[target];
    return { prompt: `Where does the number <b>${n}</b> belong in this Venn diagram?${vennSvg(la, lb)}`, type: 'choice', choices, answer, keepOrder: true, params: { kind: 'place', n, ra, rb },
      hints: [`Test ${n} against the left circle: ${vWhy(ra, n)}.`, `Now the right circle: ${vWhy(rb, n)}.`, `${why}: <b>${answer}</b>.`] };
  }

  A.skill({
    id: 'math7.venn-diagrams', title: 'Venn diagrams',
    learn: p('A <b>Venn diagram</b> sorts things into overlapping circles. Each circle holds everything with one property. The <b>overlap</b> holds the things that have both properties, and anything with neither property goes inside the box but outside both circles.') +
      p('When you count, remember that a circle’s total <b>includes its share of the overlap</b>. So “only A” is the circle’s total minus the overlap, and adding the two circle totals counts the overlap twice.') +
      example('Example', `In a class of 30, 18 play soccer, 12 play basketball and 7 play both. Only soccer: 18 − 7 = 11. Only basketball: 12 − 7 = 5. Inside the circles: 11 + 7 + 5 = 23, so <b>7</b> students play neither.`),
    make(rng) {
      const kind = rng.pick(['place', 'place', 'read', 'build', 'build']);
      if (kind === 'place') return vennPlace(rng);
      const c = rng.pick(VENN);
      const r = [rng.int(3, 12), rng.int(2, 8), rng.int(3, 12), rng.int(2, 8)];          // only A, both, only B, neither
      const total = r[0] + r[1] + r[2] + r[3], inA = r[0] + r[1], inB = r[1] + r[2], any = r[0] + r[1] + r[2];
      if (kind === 'read') {
        const ask = rng.pick(['a', 'b', 'one', 'any', 'total']);
        const Q = {
          a: [`How many students ${c.a}?`, inA, [`Everyone inside the “${c.la}” circle counts, including the overlap.`, `${r[0]} + ${r[1]} = <b>${inA}</b>.`]],
          b: [`How many students ${c.b}?`, inB, [`Everyone inside the “${c.lb}” circle counts, including the overlap.`, `${r[1]} + ${r[2]} = <b>${inB}</b>.`]],
          one: [`How many students ${c.one}?`, r[0] + r[2], ['Exactly one means inside one circle but not in the overlap.', `Add the two outer parts of the circles: ${r[0]} + ${r[2]} = <b>${r[0] + r[2]}</b>.`]],
          any: [`How many students ${c.any}?`, any, ['That is everyone inside the circles: both outer parts and the overlap.', `${r[0]} + ${r[1]} + ${r[2]} = <b>${any}</b>.`]],
          total: ['How many students were surveyed in all?', total, [`Everyone is somewhere in the box, including the ${r[3]} outside both circles.`, `${r[0]} + ${r[1]} + ${r[2]} + ${r[3]} = <b>${total}</b>.`]],
        }[ask];
        return { prompt: `The Venn diagram shows a survey of a class. ${Q[0]}${vennSvg(c.la, c.lb, r)}`, type: 'number', answer: Q[1], params: { kind, ask, r }, hints: Q[2] };
      }
      const ask = rng.pick(['onlyA', 'onlyB', 'neither', 'both']);
      const facts = ask === 'both' ? `${inA} ${c.a}, ${inB} ${c.b}, and ${r[3]} ${c.neither}` : `${inA} ${c.a}, ${inB} ${c.b}, and ${r[1]} ${c.both}`;
      const marks = ['', '', '', '']; marks[VREGIONS.indexOf(ask)] = '?';
      const Q = {
        onlyA: [r[0], [`The ${inA} students who ${c.a} include the ${r[1]} in the overlap.`, `Take the overlap away: ${inA} − ${r[1]} = <b>${r[0]}</b>.`]],
        onlyB: [r[2], [`The ${inB} students who ${c.b} include the ${r[1]} in the overlap.`, `Take the overlap away: ${inB} − ${r[1]} = <b>${r[2]}</b>.`]],
        neither: [r[3], [`Fill in the overlap first: ${r[1]}. Then only in “${c.la}”: ${inA} − ${r[1]} = ${r[0]}, and only in “${c.lb}”: ${inB} − ${r[1]} = ${r[2]}.`, `Inside the circles: ${r[0]} + ${r[1]} + ${r[2]} = ${any}.`, `Outside both circles: ${total} − ${any} = <b>${r[3]}</b>.`]],
        both: [r[1], [`${total} − ${r[3]} = ${any} students are inside at least one circle.`, `Adding the circle totals, ${inA} + ${inB} = ${inA + inB}, counts the overlap twice.`, `So the overlap is ${inA + inB} − ${any} = <b>${r[1]}</b>.`]],
      }[ask];
      return { prompt: `In a class of ${total} students, ${facts}. How many students ${c[ask]}?${vennSvg(c.la, c.lb, marks)}`, type: 'number', answer: Q[0], params: { kind, ask, r, total, inA, inB }, hints: Q[1] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'place') {
        // a second test of each label: list the members from 2 to 50 and look for n
        const members = rule => { const out = []; for (let m = 2; m <= 50; m++) { let ok; if (rule.t === 'mult') ok = m % rule.k === 0; else if (rule.t === 'even') ok = (m & 1) === 0; else if (rule.t === 'odd') ok = (m & 1) === 1; else if (rule.t === 'gt') ok = m > rule.k; else if (rule.t === 'lt') ok = m < rule.k; else if (rule.t === 'factor') ok = Number.isInteger(rule.k / m); else { let d = 0; for (let f = 1; f <= m; f++) if (m % f === 0) d++; ok = rule.t === 'prime' ? d === 2 : d % 2 === 1; } if (ok) out.push(m); } return out; };
        const a = members(P.ra).includes(P.n), b = members(P.rb).includes(P.n);
        const want = a && b ? 'overlap' : a ? `“${vLabel(P.ra)}”` : b ? `“${vLabel(P.rb)}”` : 'Outside';
        return q.answer.includes(want);
      }
      // rebuild the class one student at a time and count
      const people = [];
      [[true, false], [true, true], [false, true], [false, false]].forEach((t, i) => { for (let k = 0; k < P.r[i]; k++) people.push(t); });
      const count = f => people.filter(([a, b]) => f(a, b)).length;
      if (P.kind === 'build' && (count(a => a) !== P.inA || count((a, b) => b) !== P.inB || people.length !== P.total)) return false;
      const fn = { a: a => a, b: (a, b) => b, one: (a, b) => a !== b, any: (a, b) => a || b, total: () => true, onlyA: (a, b) => a && !b, onlyB: (a, b) => b && !a, neither: (a, b) => !a && !b, both: (a, b) => a && b }[P.ask];
      return q.answer === count(fn);
    },
  });

  A.skill({
    id: 'math7.experimental-probability', title: 'Experimental and theoretical probability',
    learn: p('<b>Theoretical probability</b> comes from reasoning about equally likely outcomes: a fair coin lands heads with probability ½, because one of its two sides is heads. <b>Experimental probability</b> comes from doing the experiment: <b>times it happened ÷ number of trials</b>.') +
      p('The two rarely match exactly, but with more trials the experimental probability usually gets closer to the theoretical one. Either kind can make a prediction: <b>expected count = probability × number of trials</b>.') +
      example('Example', `Chloe flips a coin 50 times and gets 30 heads. The experimental probability of heads is ${R(30, 50)} = <b>${F(3, 5)}</b>. The theoretical probability is ${F(1, 2)}, so in 50 flips she would expect 25 heads: 5 fewer than she got.`),
    make(rng) {
      const kind = rng.pick(['exp', 'exp', 'expected', 'predict', 'diff']);
      const name = rng.pick(NAMES);
      if (kind === 'exp') {
        const T = rng.pick([20, 25, 40, 50, 60, 80, 100]);
        const asPct = [20, 25, 50, 100].includes(T) && rng.bool();
        const ask = asPct ? 'Give your answer as a percent.' : 'Give your answer as a fraction in simplest form.';
        let prompt, c, what;
        if (rng.bool()) {
          const cols = rng.sample(['red', 'blue', 'green', 'yellow'], 3);
          const lo = Math.ceil(T * 0.2), hi = Math.floor(T * 0.4);
          const counts = [rng.int(lo, hi), rng.int(lo, hi)]; counts.push(T - counts[0] - counts[1]);
          const i = rng.int(0, 2); c = counts[i]; what = `landed on ${cols[i]}`;
          prompt = `${name} spun a spinner ${T} times and recorded the results.${M.table(['Color'].concat(cols.map(s => s[0].toUpperCase() + s.slice(1))), [['Times'].concat(counts)])}What is the experimental probability of landing on ${cols[i]}? ${ask}`;
        } else {
          const heads = rng.int(Math.ceil(T * 0.3), Math.floor(T * 0.7)), side = rng.pick(['heads', 'tails']);
          c = side === 'heads' ? heads : T - heads; what = `came up ${side}`;
          prompt = `${name} flipped a coin ${T} times and got ${heads} heads. What is the experimental probability of <b>${side}</b>? ${ask}`;
        }
        const hints = [`Experimental probability = times it happened ÷ number of trials.`, `It ${what} ${c} times out of ${T}: ${R(c, T)}.`];
        if (asPct) { const pc = c * 100 / T; hints.push(`${c} ÷ ${T} = ${N(pc / 100)}, which is <b>${N(pc)}%</b>.`); return { prompt, type: 'number', answer: pc, unit: '%', params: { kind, c, T, asPct }, hints }; }
        hints.push(simpLine(c, T));
        return Object.assign({ prompt, type: 'number', params: { kind, c, T, asPct }, hints }, fracAns(c, T));
      }
      const theory = rng.pick([
        () => { const ev = rng.pick([{ t: `a ${rng.int(1, 6)}`, k: 1 }, { t: 'an even number', k: 3 }, { t: 'a number greater than 4', k: 2 }, { t: 'a 1 or a 2', k: 2 }]); return { setup: 'A fair six-sided die is rolled', ask: `About how many times would you expect to roll ${ev.t}?`, did: O => `It lands on ${ev.t} ${O} times.`, fav: ev.k, tot: 6, why: `${ev.k} of the 6 faces ${ev.k === 1 ? 'works' : 'work'}` }; },
        () => { const n = rng.pick([4, 5, 8, 10]), r = rng.int(1, n - 1); return { setup: `A spinner with ${n} equal sections, ${r} of them red, is spun`, ask: 'About how many times would you expect it to land on red?', did: O => `It lands on red ${O} times.`, fav: r, tot: n, why: `${r} of the ${n} equal sections ${r === 1 ? 'is' : 'are'} red` }; },
        () => { const r = rng.int(1, 6), b = rng.int(1, 6); return { setup: `${name} picks a marble from a bag of ${r} red and ${b} blue marbles, then puts it back. ${name} does this`, ask: `About how many times would you expect ${name} to pick a red marble?`, did: O => `A red marble comes out ${O} times.`, fav: r, tot: r + b, why: `${r} of the ${r + b} marbles ${r === 1 ? 'is' : 'are'} red` }; },
      ])();
      if (kind === 'expected') {
        const N0 = theory.tot * rng.pick([5, 10, 20, 25, 50]), ans = theory.fav * N0 / theory.tot;
        return { prompt: `${theory.setup} ${N0} times. ${theory.ask}`, type: 'number', answer: ans, params: { kind, fav: theory.fav, tot: theory.tot, N: N0 },
          hints: [`The theoretical probability is ${F(theory.fav, theory.tot)}, because ${theory.why}.`, `Expected count = probability × number of trials = ${F(theory.fav, theory.tot)} × ${N0}.`, `${N0} ÷ ${theory.tot} × ${theory.fav} = <b>${N(ans)}</b> times.`] };
      }
      if (kind === 'diff') {
        const N0 = theory.tot * rng.pick([5, 10, 20]), E = theory.fav * N0 / theory.tot;
        let d = rng.nz(-8, 8); if (E + d < 0 || E + d > N0) d = -d;
        const O = E + d;
        return { prompt: `${theory.setup} ${N0} times. ${theory.did(O)} How many ${d > 0 ? 'more' : 'fewer'} times is that than the theoretical probability predicts?`, type: 'number', answer: Math.abs(d), params: { kind, fav: theory.fav, tot: theory.tot, N: N0, O },
          hints: [`The theoretical probability is ${F(theory.fav, theory.tot)}, because ${theory.why}.`, `In ${N0} trials it predicts ${F(theory.fav, theory.tot)} × ${N0} = ${N(E)}.`, `It actually happened ${O} times: ${Math.max(O, E)} − ${Math.min(O, E)} = <b>${Math.abs(d)}</b> ${d > 0 ? 'more' : 'fewer'}.`] };
      }
      const [a, b] = rng.pick([[1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [3, 8], [5, 8], [7, 10], [3, 10], [13, 20], [9, 20]]);
      const m1 = rng.int(3, 10), T1 = b * m1, c1 = a * m1, T2 = b * rng.int(m1 + 2, m1 * 5), ans = a * T2 / b;
      const ctx = rng.pick([
        `${name} tosses a thumbtack ${T1} times and it lands point up ${c1} times. Based on these results, about how many times would you expect it to land point up in ${T2} tosses?`,
        `${name} takes ${T1} free throws and makes ${c1} of them. Based on these results, about how many free throws would you expect ${name} to make out of ${T2}?`,
        `A paper cup is tossed ${T1} times and lands on its side ${c1} times. Based on these results, about how many times would you expect it to land on its side in ${T2} tosses?`,
      ]);
      return { prompt: ctx, type: 'number', answer: ans, params: { kind, T1, c1, T2 },
        hints: [`The experimental probability is ${R(c1, T1)} = ${F(a, b)}.`, `Multiply it by the new number of trials: ${F(a, b)} × ${T2}.`, `${T2} ÷ ${b} × ${a} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'exp') return Math.abs(q.answer * P.T - (P.asPct ? 100 : 1) * P.c) < 1e-6;
      if (P.kind === 'predict') return Math.abs(q.answer * P.T1 - P.c1 * P.T2) < 1e-6;
      // an "ideal" run: go round the equally likely outcomes in turn, N times, and count the good ones
      let hits = 0; for (let i = 0; i < P.N; i++) if (i % P.tot < P.fav) hits++;
      return P.kind === 'expected' ? q.answer === hits : q.answer === Math.abs(P.O - hits);
    },
  });

  const DIE_EVENTS = [['a 1', [1]], ['a 2', [2]], ['a 3', [3]], ['a 4', [4]], ['a 5', [5]], ['a 6', [6]], ['an even number', [2, 4, 6]], ['an odd number', [1, 3, 5]], ['a number less than 3', [1, 2]], ['a number greater than 4', [5, 6]], ['a multiple of 3', [3, 6]]];
  A.skill({
    id: 'math7.or-probability', title: 'Probability of one event or another',
    learn: p('Two events are <b>mutually exclusive</b> when they cannot happen at the same time: one roll of a die cannot be both a 2 and a 5. For events like that, <b>P(A or B) = P(A) + P(B)</b>.') +
      p('If the two probabilities have different denominators, rewrite them over a common denominator before adding. And because something must happen, the probability that <b>neither</b> event happens is 1 − P(A or B).') +
      example('Example', `A spinner lands on red with probability ${F(1, 4)} and on blue with probability ${F(1, 3)}. P(red or blue) = ${R(3, 12)} + ${R(4, 12)} = <b>${F(7, 12)}</b>. P(neither) = 1 − ${F(7, 12)} = ${F(5, 12)}.`),
    make(rng) {
      const kind = rng.pick(['bag', 'bag', 'die', 'fractions', 'fractions', 'percent']);
      const neither = rng.chance(0.3);
      if (kind === 'bag') {
        const cols = rng.sample(['red', 'blue', 'green', 'yellow', 'purple'], 4), counts = cols.map(() => rng.int(2, 9));
        const [i, j] = rng.sample([0, 1, 2, 3], 2), T = counts.reduce((s, x) => s + x, 0), both = counts[i] + counts[j];
        const fav = neither ? T - both : both;
        const hints = [`There are ${counts.join(' + ')} = ${T} marbles. One marble cannot be both ${cols[i]} and ${cols[j]}, so add: ${R(counts[i], T)} + ${R(counts[j], T)} = ${R(both, T)}.`];
        if (neither) hints.push(`Neither ${cols[i]} nor ${cols[j]}: 1 − ${R(both, T)} = ${R(T - both, T)}. (Or count the other marbles: ${T - both}.)`);
        hints.push(simpLine(fav, T));
        return Object.assign({ prompt: `A bag has ${M.list(cols.map((c, k) => `${counts[k]} ${c}`))} marbles. You pick one without looking. What is the probability that it is ${neither ? `<b>neither</b> ${cols[i]} nor ${cols[j]}` : `${cols[i]} or ${cols[j]}`}? Give your answer as a fraction.`, type: 'number', params: { kind, counts, i, j, neither }, hints }, fracAns(fav, T));
      }
      if (kind === 'die') {
        let e1, e2;
        do { [e1, e2] = rng.sample(DIE_EVENTS, 2); } while (e1[1].some(x => e2[1].includes(x)) || e1[1].length + e2[1].length >= 6);
        const k = e1[1].length + e2[1].length;
        return Object.assign({ prompt: `You roll a fair six-sided die once. What is the probability of rolling ${e1[0]} or ${e2[0]}? Give your answer as a fraction.`, type: 'number', params: { kind, s1: e1[1], s2: e2[1] },
          hints: [`No face is both ${e1[0]} and ${e2[0]}, so the events cannot happen together and you can add their probabilities.`, `Faces for ${e1[0]}: ${M.list(e1[1].map(String))}, so P = ${R(e1[1].length, 6)}. Faces for ${e2[0]}: ${M.list(e2[1].map(String))}, so P = ${R(e2[1].length, 6)}. Add: ${R(k, 6)}.`, simpLine(k, 6)] }, fracAns(k, 6));
      }
      if (kind === 'percent') {
        const p1 = rng.pick([5, 10, 15, 20, 25, 30, 35]), p2 = rng.pick([5, 10, 15, 20, 25, 30, 40]);
        const sum = p1 + p2, ans = neither ? 100 - sum : sum;
        const [x, y] = rng.pick([['a free drink', 'a free snack'], ['a sticker', 'a pencil'], ['a small prize', 'a large prize']]);
        return { prompt: `On one spin of a prize wheel, the chance of winning ${x} is ${p1}% and the chance of winning ${y} is ${p2}%. A spin can win at most one prize. What is the chance that a spin wins ${neither ? '<b>neither</b> prize' : `${x} or ${y}`}?`, type: 'number', answer: ans, unit: '%', params: { kind, p1, p2, neither },
          hints: [`A spin cannot win both, so add the chances: ${p1}% + ${p2}% = ${sum}%.`].concat(neither ? [`Neither prize: 100% − ${sum}% = <b>${ans}%</b>.`] : [`The chance is <b>${ans}%</b>.`]) };
      }
      const dens = [2, 3, 4, 5, 6, 8, 10, 12];
      let d1, d2, n1, n2;
      do { [d1, d2] = rng.sample(dens, 2); n1 = rng.int(1, d1 - 1); n2 = rng.int(1, d2 - 1); } while (n1 / d1 + n2 / d2 >= 0.95 || M.gcd(n1, d1) !== 1 || M.gcd(n2, d2) !== 1);
      const L = d1 * d2 / M.gcd(d1, d2), a = n1 * L / d1, b = n2 * L / d2, fav = neither ? L - a - b : a + b;
      const [c1, c2, c3] = rng.sample(['red', 'blue', 'yellow', 'green'], 3);
      const hints = [`The spinner cannot land on ${c1} and ${c2} at once, so add the probabilities. Use the common denominator ${L}: ${R(n1, d1)} = ${R(a, L)} and ${R(n2, d2)} = ${R(b, L)}.`, `P(${c1} or ${c2}) = ${R(a, L)} + ${R(b, L)} = ${R(a + b, L)}.`];
      if (neither) hints.push(`The only other color is ${c3}, so P(${c3}) = 1 − ${R(a + b, L)} = ${R(L - a - b, L)}.`);
      hints.push(simpLine(fav, L));
      return Object.assign({ prompt: `A spinner is colored ${c1}, ${c2} and ${c3}. It lands on ${c1} with probability ${R(n1, d1)} and on ${c2} with probability ${R(n2, d2)}. What is the probability that it lands on ${neither ? c3 : `${c1} or ${c2}`}? Give your answer as a fraction.`, type: 'number', params: { kind, n1, d1, n2, d2, neither }, hints }, fracAns(fav, L));
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'bag') { const bag = []; P.counts.forEach((c, k) => { for (let t = 0; t < c; t++) bag.push(k); }); const good = bag.filter(k => (k === P.i || k === P.j) !== P.neither).length; return Math.abs(q.answer * bag.length - good) < 1e-9; }
      if (P.kind === 'die') { let good = 0; for (let f = 1; f <= 6; f++) if (P.s1.includes(f) || P.s2.includes(f)) good++; return Math.abs(q.answer * 6 - good) < 1e-9; }
      if (P.kind === 'percent') return q.answer === (P.neither ? 100 - P.p1 - P.p2 : P.p1 + P.p2);
      let D = 1; while (D % P.d1 || D % P.d2) D++;                                    // brute-force common denominator
      const top = P.n1 * (D / P.d1) + P.n2 * (D / P.d2);
      return Math.abs(q.answer * D - (P.neither ? D - top : top)) < 1e-9;
    },
  });

  /* ---------- Unit 9: Rational numbers and simple interest ---------- */
  /** "0.272727…": a repeating decimal written out, the repeating block shown a few times */
  const repText = (whole, pre, rep) => `${whole}.${pre}${rep.repeat(rep.length === 1 ? 4 : 3)}…`;
  /** the same number in bar notation */
  const repBar = (whole, pre, rep) => `${whole}.${pre}<span style="text-decoration: overline">${rep}</span>`;
  const primeFactors = n => { const out = []; for (let f = 2; n > 1; f++) while (n % f === 0) { out.push(f); n /= f; } return out; };
  /** the decimal digits of n/d by long division, for a hint: "0.41666…" or "0.375" */
  function longDivText(n, d) {
    let s = Math.floor(n / d) + '.', r = n % d;
    for (let k = 0; k < 6 && r; k++) { r *= 10; s += Math.floor(r / d); r %= d; }
    return r ? s + '…' : s.replace(/\.$/, '');
  }
  const TERM_FRACS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8], [3, 10], [7, 10], [9, 10], [3, 16], [1, 20], [7, 20], [9, 20], [3, 25], [7, 40], [3, 50]];
  const REP_FRACS = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [2, 7], [1, 9], [2, 9], [4, 9], [1, 11], [1, 12], [5, 12], [7, 12], [2, 15], [4, 15], [7, 15], [7, 30], [5, 18]];

  A.skill({
    id: 'math7.repeating-decimals', title: 'Repeating decimals as fractions',
    learn: p(`Every fraction becomes a decimal that either <b>terminates</b> (stops, like ${F(3, 8)} = 0.375) or <b>repeats</b> forever (like ${F(1, 3)} = 0.333…, written ${repBar(0, '', '3')}). In simplest form, a fraction terminates exactly when its denominator has <b>no prime factors other than 2 and 5</b>.`) +
      p(`To turn a repeating decimal into a fraction, call it ${X}. <b>Multiply by 10, 100, … so that the repeating tails line up, then subtract</b>: the tails cancel and leave an equation with whole numbers. One repeating digit needs 10${X} − ${X} = 9${X}; two repeating digits need 100${X} − ${X} = 99${X}.`) +
      example('Example', `${big(`${X} = 0.272727…`)}Two digits repeat, so 100${X} = 27.272727…. Subtract: 100${X} − ${X} = 27, so 99${X} = 27 and ${X} = ${R(27, 99)} = <b>${F(3, 11)}</b>.`),
    make(rng) {
      const kind = rng.pick(['one', 'one', 'two', 'two', 'mixed', 'mixed', 'which']);
      if (kind === 'which') {
        const wantRepeat = rng.bool();
        const odd = rng.pick(wantRepeat ? REP_FRACS : TERM_FRACS), rest = rng.sample(wantRepeat ? TERM_FRACS : REP_FRACS, 3);
        const list = [odd].concat(rest), choices = list.map(([n, d]) => F(n, d));
        const why = [...new Set(list.map(([, d]) => { const f = primeFactors(d); return `${d} ${f.length === 1 ? 'is prime' : '= ' + f.join(' × ')}${f.every(x => x === 2 || x === 5) ? ' (only 2s and 5s)' : ''}`; }))];
        return { prompt: `Which of these fractions has a decimal form that ${wantRepeat ? '<b>repeats</b> forever' : '<b>terminates</b> (stops)'}?`, type: 'choice', choices, answer: choices[0], params: { kind, list, wantRepeat },
          hints: ['Each fraction is in simplest form, so look at its denominator. If its only prime factors are 2 and 5, the decimal terminates; any other prime factor makes it repeat.', `The denominators: ${why.join('; ')}.`, `So the one that ${wantRepeat ? 'repeats' : 'terminates'} is <b>${F(odd[0], odd[1])}</b> = ${longDivText(odd[0], odd[1])}.`] };
      }
      let whole = 0, pre = '', rep;
      if (kind === 'one') { rep = String(rng.int(1, 8)); if (rng.chance(0.25)) whole = rng.int(1, 3); }
      else if (kind === 'two') { let k; do { k = rng.int(1, 98); } while (k % 11 === 0); rep = String(k).padStart(2, '0'); }
      else { const a = rng.int(0, 9); let b; do { b = rng.int(1, 8); } while (b === a); pre = String(a); rep = String(b); }   // a repeating 9 would be a terminating decimal in disguise
      const p10 = Math.pow(10, pre.length), q10 = Math.pow(10, pre.length + rep.length);
      const big1 = Number(`${whole}${pre}`), big2 = Number(`${whole}${pre}${rep}`);   // the whole-number parts of p10·x and q10·x
      const num = big2 - big1, den = q10 - p10;
      const tail = rep.repeat(rep.length === 1 ? 4 : 3) + '…';
      const txt = repText(whole, pre, rep);
      const hints = pre ? [`Let ${X} = ${txt}. Multiply by 10 so that the repeating part starts right after the point: 10${X} = ${big1}.${tail}`, `Multiply by 100 to move one more digit across: 100${X} = ${big2}.${tail}`, `Subtract: 100${X} − 10${X} = ${big2}.${tail} − ${big1}.${tail} The repeating tails cancel, so 90${X} = ${num}.`, `${X} = ${R(num, 90)}. ${simpLine(num, 90)}`]
        : [`Let ${X} = ${txt}. ${rep.length === 1 ? 'One digit repeats, so multiply by 10' : 'Two digits repeat, so multiply by 100'}: ${q10}${X} = ${big2}.${tail}`, `Subtract: ${q10}${X} − ${X} = ${big2}.${tail} − ${txt} The repeating tails cancel, so ${den}${X} = ${num}.`, `${X} = ${R(num, den)}. ${simpLine(num, den)}`];
      return Object.assign({ prompt: `Write this repeating decimal as a fraction in simplest form${whole ? ' (it is greater than 1, so the fraction will be too)' : ''}.${big(txt)}The ${rep.length === 1 ? 'digit' : 'block'} ${rep} repeats forever. In bar notation the number is ${repBar(whole, pre, rep)}.`, type: 'number', params: { kind, whole, pre, rep }, hints }, fracAns(num, den));
    },
    verify(q) {
      const P = q.params;
      const terminates = (n, d) => { let r = n % d; for (let k = 0; k < 60; k++) { if (r === 0) return true; r = (r * 10) % d; } return false; };
      if (P.kind === 'which') {
        const good = P.list.filter(([n, d]) => terminates(n, d) !== P.wantRepeat);
        return good.length === 1 && good[0] === P.list[0] && q.answer === q.choices.find(c => c === M.frac(P.list[0][0], P.list[0][1]));
      }
      // long-divide the answer and compare its first 14 digits with the decimal in the question
      const [n, d] = String(q.answerText).split('/').map(Number);
      if (!d || Math.floor(n / d) !== P.whole) return false;
      let r = n % d, digits = '';
      for (let k = 0; k < 14; k++) { r *= 10; digits += Math.floor(r / d); r %= d; }
      return digits === (P.pre + P.rep.repeat(14)).slice(0, 14) && Math.abs(n / d - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'math7.add-sub-rationals', title: 'Adding and subtracting negative fractions and decimals',
    learn: p('Negative fractions and decimals follow the same rules as negative integers. First turn any subtraction into adding the opposite: <b>a − b = a + (−b)</b>. Then: <b>same signs, add the sizes and keep the sign; different signs, subtract the smaller size from the larger and keep the sign of the larger</b>.') +
      p(`With fractions, rewrite both over a common denominator first: ${F(-2, 3)} + ${F(1, 4)} = ${R(-8, 12)} + ${R(3, 12)} = ${F(-5, 12)}, because the signs differ, 8 − 3 = 5, and the larger size was negative. With decimals, line up the decimal points.`) +
      example('Example', `${big('−1.5 − 2.75')}Add the opposite: −1.5 + (−2.75). Both are negative, so add the sizes, 1.5 + 2.75 = 4.25, and keep the sign: <b>−4.25</b>.`),
    make(rng) {
      const kind = rng.pick(['frac', 'frac', 'mixed', 'dec', 'dec', 'word']);
      const wrap = s => s.startsWith('−') ? `(${s})` : s;
      if (kind === 'frac' || kind === 'mixed') {
        const [d1, d2] = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 2);
        const top = (d, w) => { let k; do { k = rng.int(1, d - 1); } while (M.gcd(k, d) !== 1); return w * d + k; };
        const n1 = top(d1, kind === 'mixed' ? rng.int(1, 3) : 0), n2 = top(d2, kind === 'mixed' ? rng.int(0, 3) : 0);
        let s1 = rng.sign(), s2 = rng.sign();
        if (s1 > 0 && s2 > 0) { if (rng.bool()) s1 = -1; else s2 = -1; }
        const L = d1 * d2 / M.gcd(d1, d2), a = s1 * n1 * L / d1, b = s2 * n2 * L / d2;
        let op = rng.pick(['+', '−']); if ((op === '+' ? a + b : a - b) === 0) op = op === '+' ? '−' : '+';
        const bb = op === '+' ? b : -b, sum = a + bb;
        const show = (n, d) => kind === 'mixed' ? M.mixed(n, d) : F(n, d);
        const t1 = show(s1 * n1, d1), t2 = show(s2 * n2, d2);
        const t2w = s2 < 0 ? `(${t2})` : t2, opp = show(-s2 * n2, d2);
        const hints = [];
        if (op === '−') hints.push(`Subtracting is adding the opposite: ${t1} − ${t2w} = ${t1} + ${-s2 < 0 ? `(${opp})` : opp}.`);
        hints.push(`${kind === 'mixed' ? `Write the mixed numbers as fractions: ${R(s1 * n1, d1)} and ${R(Math.sign(bb) * n2, d2)}. ` : ''}Use the common denominator ${L}: ${R(a, L)} + ${bb < 0 ? `(${R(bb, L)})` : R(bb, L)}.`);
        hints.push(`${(a < 0) === (bb < 0) ? 'The signs match, so add the sizes and keep the sign' : 'The signs differ, so subtract the sizes and keep the sign of the larger one'}: the numerator is ${N(a)} + ${wrap(N(bb))} = ${N(sum)}, giving ${R(sum, L)}.`);
        hints.push(simpLine(sum, L));
        return Object.assign({ prompt: `${op === '+' ? 'Add' : 'Subtract'}. Give your answer as a ${kind === 'mixed' ? 'fraction or mixed number' : 'fraction'} in simplest form.${big(`${t1} ${op} ${t2w}`)}`, type: 'number', params: { kind, x: [s1 * n1, d1], y: [s2 * n2, d2], op }, hints }, fracAns(sum, L));
      }
      // decimals, worked in hundredths so the arithmetic is exact
      let ia, ib, op, prompt, unit;
      if (kind === 'word') {
        const temp = rng.bool();
        ia = temp ? -25 * rng.int(4, 60) : -25 * rng.int(20, 200); ib = 25 * rng.int(2, 60); op = rng.pick(['+', '−']);
        const A0 = N(ia / 100), Bv = N(ib / 100);
        if (temp) { unit = '°C'; prompt = `At 6 a.m. the temperature was ${A0}°C. By noon it had ${op === '+' ? 'risen' : 'fallen'} by ${Bv}°C. What was the temperature at noon?`; }
        else { unit = 'm'; prompt = `A diver is at an elevation of ${A0} m (below the surface). She ${op === '+' ? 'swims up' : 'dives down'} ${Bv} m. What is her new elevation?`; }
      } else {
        const pick = () => rng.nz(-199, 199) * (rng.bool() ? 10 : 1) / (rng.bool() ? 1 : 10);
        ia = Math.round(pick()); ib = Math.round(pick()); if (ia === 0) ia = -35; if (ib === 0) ib = 125;
        if (ia > 0 && ib > 0) { if (rng.bool()) ia = -ia; else ib = -ib; }
        op = rng.pick(['+', '−']); if ((op === '+' ? ia + ib : ia - ib) === 0) op = op === '+' ? '−' : '+';
      }
      const a = ia / 100, b = ib / 100, bb = op === '+' ? ib : -ib, res = ia + bb, ans = res / 100;
      const hints = [];
      if (op === '−') hints.push(`Subtracting is adding the opposite: ${N(a)} − ${wrap(N(b))} = ${N(a)} + ${wrap(N(bb / 100))}.`);
      const sa = Math.abs(ia), sb = Math.abs(bb);
      hints.push((ia < 0) === (bb < 0) ? `Both numbers are ${ia < 0 ? 'negative' : 'positive'}: add the sizes, ${N(sa / 100)} + ${N(sb / 100)} = ${N((sa + sb) / 100)}, and keep the sign.` : `The signs differ: subtract the sizes, ${N(Math.max(sa, sb) / 100)} − ${N(Math.min(sa, sb) / 100)} = ${N(Math.abs(sa - sb) / 100)}, and keep the sign of ${N((sa >= sb ? ia : bb) / 100)}.`);
      hints.push(kind === 'word' ? `The answer is <b>${N(ans)} ${unit}</b>.` : `${N(a)} ${op} ${wrap(N(b))} = <b>${N(ans)}</b>.`);
      return { prompt: prompt || `${op === '+' ? 'Add' : 'Subtract'}.${big(`${N(a)} ${op} ${wrap(N(b))}`)}`, type: 'number', answer: ans, unit, params: { kind, a, b, op }, hints };
    },
    verify(q) {
      const P = q.params, sgn = P.op === '+' ? 1 : -1;
      if (P.kind === 'frac' || P.kind === 'mixed') return Math.abs(P.x[0] / P.x[1] + sgn * P.y[0] / P.y[1] - q.answer) < 1e-9;
      return Math.abs(P.a + sgn * P.b - q.answer) < 1e-9;                         // JavaScript's own decimals as the second opinion
    },
  });

  A.skill({
    id: 'math7.simple-interest', title: 'Simple interest',
    learn: p('<b>Interest</b> is money paid for the use of money: a bank pays you interest on savings, and you pay interest on a loan. With <b>simple interest</b>, the interest is the same every year, because it is always worked out from the starting amount, the <b>principal</b>.') +
      p(`<b>${V('I')} = ${V('P')}${V('r')}${V('t')}</b>: interest = principal × yearly rate (as a decimal) × time in years. The total at the end is the principal plus the interest. A time given in months is a fraction of a year: 6 months is 0.5 years and 18 months is 1.5 years.`) +
      example('Example', `${big('$800 at 3% simple interest for 5 years')}${V('I')} = 800 × 0.03 × 5 = <b>$120</b>. After 5 years the account holds 800 + 120 = <b>$920</b>.`),
    make(rng) {
      const kind = rng.pick(['interest', 'total', 'total', 'rate', 'time', 'months']);
      const name = rng.pick(NAMES), save = rng.bool();
      const P = kind === 'months' ? rng.pick([400, 600, 800, 1000, 1200, 2000, 3000, 5000]) : rng.pick([200, 250, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2500, 4000, 5000]);
      const r = rng.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8]);
      const months = kind === 'months' ? rng.pick([6, 18, 30]) : 0, t = months ? months / 12 : rng.int(2, 10);
      const perYear = M.round(P * r / 100, 2), I = M.round(P * r * t / 100, 2), rd = N(r / 100);
      const span = months ? `${months} months` : `${t} years`;
      const where = save ? `${name} puts ${M.money(P)} in a savings account that pays ${r}% simple interest per year.` : `${name} borrows ${M.money(P)} at ${r}% simple interest per year.`;
      const work = [`Write the rate as a decimal: ${r}% = ${rd}.`, `${V('I')} = ${V('P')}${V('r')}${V('t')} = ${N(P)} × ${rd} × ${N(t)}: that is ${M.money(perYear)} a year, so ${M.money(I)} in all.`];
      if (months) work.unshift(`${months} months is ${months} ÷ 12 = ${N(t)} years.`);
      if (kind === 'rate') {
        return { prompt: `${name} ${save ? `puts ${M.money(P)} in a savings account` : `borrows ${M.money(P)}`} for ${t} years and ${save ? 'earns' : 'pays'} ${M.money(I)} in simple interest. What is the interest rate per year?`, type: 'number', answer: r, unit: '%', params: { kind, P, t, I },
          hints: [`${V('I')} = ${V('P')}${V('r')}${V('t')}, so ${V('r')} = ${V('I')} ÷ (${V('P')} × ${V('t')}).`, `${V('P')} × ${V('t')} = ${N(P)} × ${t} = ${N(P * t)}, and ${N(I)} ÷ ${N(P * t)} = ${rd}.`, `As a percent, the rate is <b>${r}%</b> per year.`] };
      }
      if (kind === 'time') {
        return { prompt: `${where} After how many years will the interest ${save ? 'earned' : 'owed'} reach ${M.money(I)}?`, type: 'number', answer: t, unit: 'years', params: { kind, P, r, I },
          hints: [`One year of interest is ${N(P)} × ${rd} = ${M.money(perYear)}.`, `Simple interest adds the same amount every year, so divide: ${N(I)} ÷ ${N(perYear)}.`, `It takes <b>${t} years</b>.`] };
      }
      const total = kind === 'total' || (kind === 'months' && rng.bool());
      const ask = total ? (save ? `How much money is in the account after ${span}?` : `${name} pays back the loan and the interest after ${span}. How much is that in total?`) : (save ? `How much interest does the account earn in ${span}?` : `How much interest does ${name} owe after ${span}?`);
      const ans = total ? M.round(P + I, 2) : I;
      const hints = work.slice(0, -1).concat(total ? [work[work.length - 1], `Add the principal: ${N(P)} + ${N(I)} = <b>${M.money(ans)}</b>.`] : [work[work.length - 1].replace(`so ${M.money(I)} in all`, `so the interest is <b>${M.money(I)}</b>`)]);
      return { prompt: `${where} ${ask}`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { kind, P, r, months: months || t * 12, total }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'rate') return Math.abs(P.P * (q.answer / 100) * P.t - P.I) < 1e-6;
      if (P.kind === 'time') { let earned = 0, years = 0; while (earned < P.I - 1e-9 && years < 100) { earned += P.P * P.r / 100; years++; } return q.answer === years && Math.abs(earned - P.I) < 1e-6; }
      let I = 0; for (let m = 0; m < P.months; m++) I += P.P * P.r / 1200;          // add the interest a month at a time
      return Math.abs((P.total ? P.P + I : I) - q.answer) < 0.006;
    },
  });

  /* ---------- Unit 10: Properties, comparing expressions, and word problems ---------- */
  const PROPS = {
    'comm-add': 'Commutative property of addition', 'comm-mul': 'Commutative property of multiplication',
    'assoc-add': 'Associative property of addition', 'assoc-mul': 'Associative property of multiplication',
    'id-add': 'Identity property of addition', 'id-mul': 'Identity property of multiplication',
    'inv-add': 'Inverse property of addition', 'inv-mul': 'Inverse property of multiplication', dist: 'Distributive property',
  };
  const PROP_MIXUPS = {
    'comm-add': ['assoc-add', 'comm-mul', 'id-add', 'inv-add'], 'comm-mul': ['assoc-mul', 'comm-add', 'id-mul', 'dist'],
    'assoc-add': ['comm-add', 'assoc-mul', 'dist', 'id-add'], 'assoc-mul': ['comm-mul', 'assoc-add', 'dist', 'id-mul'],
    'id-add': ['inv-add', 'id-mul', 'comm-add', 'inv-mul'], 'id-mul': ['inv-mul', 'id-add', 'comm-mul', 'inv-add'],
    'inv-add': ['id-add', 'inv-mul', 'comm-add', 'id-mul'], 'inv-mul': ['id-mul', 'inv-add', 'comm-mul', 'id-add'],
    dist: ['assoc-mul', 'comm-mul', 'assoc-add', 'comm-add'],
  };
  const PROP_WHY = {
    'comm-add': 'The same two numbers are added on both sides, just in the opposite order. Changing the <b>order</b> is the commutative property.',
    'comm-mul': 'The same two numbers are multiplied on both sides, just in the opposite order. Changing the <b>order</b> is the commutative property.',
    'assoc-add': 'The numbers stay in the same order; only the parentheses move. Changing the <b>grouping</b> is the associative property.',
    'assoc-mul': 'The numbers stay in the same order; only the parentheses move. Changing the <b>grouping</b> is the associative property.',
    'id-add': 'Adding 0 leaves the number exactly as it was: 0 is the additive <b>identity</b>.',
    'id-mul': 'Multiplying by 1 leaves the number exactly as it was: 1 is the multiplicative <b>identity</b>.',
    'inv-add': 'A number plus its opposite gives 0: they are additive <b>inverses</b>.',
    'inv-mul': 'A number times its reciprocal gives 1: they are multiplicative <b>inverses</b>.',
    dist: 'The number outside the parentheses multiplies <b>each</b> term inside: that is the distributive property.',
  };
  /** one true equation showing property k: { show, l, r } with l and r as JavaScript in x, for checking */
  function propEquation(rng, k) {
    const useX = rng.chance(0.35);
    const num = () => rng.nz(-12, 15);
    const t = v => typeof v === 'string' ? { s: V('x'), j: 'x' } : { s: v < 0 ? `(${N(v)})` : N(v), j: `(${v})` };
    const first = v => typeof v === 'string' ? { s: V('x'), j: 'x' } : { s: N(v), j: `(${v})` };
    const a = useX ? 'x' : num(), c = rng.nz(2, 9);
    let b = num(); while (b === a || b === -a) b = num();
    const A0 = first(a), At = t(a), B0 = first(b), Bt = t(b), Ct = t(c);
    switch (k) {
      case 'comm-add': return { show: `${A0.s} + ${Bt.s} = ${B0.s} + ${At.s}`, l: `${A0.j}+${Bt.j}`, r: `${B0.j}+${At.j}` };
      case 'comm-mul': return { show: `${A0.s} × ${Bt.s} = ${B0.s} × ${At.s}`, l: `${A0.j}*${Bt.j}`, r: `${B0.j}*${At.j}` };
      case 'assoc-add': return { show: `(${A0.s} + ${Bt.s}) + ${Ct.s} = ${A0.s} + (${B0.s} + ${Ct.s})`, l: `(${A0.j}+${Bt.j})+${Ct.j}`, r: `${A0.j}+(${B0.j}+${Ct.j})` };
      case 'assoc-mul': return { show: `(${A0.s} × ${Bt.s}) × ${Ct.s} = ${A0.s} × (${B0.s} × ${Ct.s})`, l: `(${A0.j}*${Bt.j})*${Ct.j}`, r: `${A0.j}*(${B0.j}*${Ct.j})` };
      case 'id-add': return rng.bool() ? { show: `${A0.s} + 0 = ${A0.s}`, l: `${A0.j}+0`, r: A0.j } : { show: `0 + ${At.s} = ${A0.s}`, l: `0+${At.j}`, r: A0.j };
      case 'id-mul': return rng.bool() ? { show: `${A0.s} × 1 = ${A0.s}`, l: `${A0.j}*1`, r: A0.j } : { show: `1 × ${At.s} = ${A0.s}`, l: `1*${At.j}`, r: A0.j };
      case 'inv-add': { const v = useX ? 'x' : b; const opp = useX ? `(−${V('x')})` : `(${N(-v)})`; return { show: `${first(v).s} + ${opp} = 0`, l: `${first(v).j}+(-${first(v).j})`, r: '0' }; }
      case 'inv-mul': { const n = rng.int(1, 9), d = rng.int(2, 9); if (n === d) return propEquation(rng, k); return { show: `${F(n, d, { raw: true })} × ${F(d, n, { raw: true })} = 1`, l: `(${n}/${d})*(${d}/${n})`, r: '1' }; }
      default: {
        const inner = useX ? `${V('x')} ${M.signed(b)}` : `${N(Math.abs(b) + 5)} + ${t(b).s}`;
        const innerJ = useX ? `x+(${b})` : `${Math.abs(b) + 5}+(${b})`;
        const right = useX ? `${N(c)}${V('x')} ${M.signed(c * b)}` : `${N(c)} × ${N(Math.abs(b) + 5)} + ${N(c)} × ${t(b).s}`;
        const rightJ = useX ? `${c}*x+(${c * b})` : `${c}*${Math.abs(b) + 5}+${c}*(${b})`;
        return { show: `${N(c)}(${inner}) = ${right}`, l: `${c}*(${innerJ})`, r: rightJ };
      }
    }
  }

  A.skill({
    id: 'math7.number-properties', title: 'Naming the properties of operations',
    learn: p(`The <b>commutative</b> property says order does not matter: ${V('a')} + ${V('b')} = ${V('b')} + ${V('a')} and ${V('a')} × ${V('b')} = ${V('b')} × ${V('a')}. The <b>associative</b> property says grouping does not matter: (${V('a')} + ${V('b')}) + ${V('c')} = ${V('a')} + (${V('b')} + ${V('c')}), and the same for ×.`) +
      p(`The <b>identity</b> properties: adding 0 or multiplying by 1 changes nothing. The <b>inverse</b> properties: a number plus its opposite is 0, and a number times its reciprocal is 1. The <b>distributive</b> property: ${V('a')}(${V('b')} + ${V('c')}) = ${V('a')}${V('b')} + ${V('a')}${V('c')}.`) +
      example('Example', `${big('(4 × 7) × 5 = 4 × (7 × 5)')}The numbers are in the same order on both sides; only the parentheses moved. That is the <b>associative property of multiplication</b>.`),
    make(rng) {
      const keys = Object.keys(PROPS), k = rng.pick(keys);
      const others = rng.sample(PROP_MIXUPS[k], 3);
      if (rng.chance(0.35)) {
        const all = [k].concat(others).map(kk => propEquation(rng, kk));
        const choices = all.map(e => e.show);
        return { prompt: `Which equation shows the <b>${PROPS[k].toLowerCase()}</b>?`, type: 'choice', choices, answer: choices[0], params: { kind: 'which', k, eqs: all, ks: [k].concat(others) },
          hints: [`Recall what the ${PROPS[k].toLowerCase()} says. ${PROP_WHY[k]}`, `Look for the equation that does exactly that and nothing else.`, `It is <b>${choices[0]}</b>.`] };
      }
      const e = propEquation(rng, k);
      const choices = [PROPS[k]].concat(others.map(o => PROPS[o]));
      return { prompt: `Which property does this equation show?${big(e.show)}`, type: 'choice', choices, answer: PROPS[k], params: { kind: 'name', k, eqs: [e], ks: [k] },
        hints: ['Compare the two sides. What changed: the order, the grouping, or did a 0, a 1, an opposite or a reciprocal appear?', PROP_WHY[k], `<b>${PROPS[k]}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      // every equation offered must be true: evaluate both sides for several values of x
      const holds = e => [-3, 2, 7].every(x => Math.abs(new Function('x', 'return ' + e.l)(x) - new Function('x', 'return ' + e.r)(x)) < 1e-9);
      if (!P.eqs.every(holds)) return false;
      // and the shape must fit the property: + or × only, parentheses where the property needs them
      const e = P.eqs[0], k = P.k, ops = (e.l + e.r).replace(/\(-?[\d.]+\)/g, 'n');
      const shape = { 'comm-add': !/\*/.test(ops), 'comm-mul': !/\+/.test(ops), 'assoc-add': /\)\+/.test(e.l) && !/\*/.test(ops), 'assoc-mul': /\)\*/.test(e.l) && !/\+/.test(ops),
        'id-add': /\b0\b/.test(e.l), 'id-mul': /\b1\b/.test(e.l), 'inv-add': e.r === '0', 'inv-mul': e.r === '1', dist: /\*\(/.test(e.l) && /\+/.test(e.r) }[k];
      return shape && q.answer === (P.kind === 'name' ? PROPS[k] : e.show);
    },
  });

  /** an expression from terms [{c, x}], in the order given: "3x − 2 + x" */
  const termsText = ts => ts.map((t, i) => { const s = t.x ? M.term(t.c, 'x') : N(t.c); return i === 0 ? s : (s.startsWith('−') ? ' − ' + s.slice(1) : ' + ' + s); }).join('');
  const termsJs = ts => ts.map(t => t.x ? `(${t.c})*x` : `(${t.c})`).join('+');
  /** split a total coefficient into two non-zero pieces (or keep it whole) */
  function splitTerms(rng, ax, b, pieces) {
    const ts = [];
    if (pieces > 1) { let a1 = rng.nz(-6, 7); if (a1 === ax) a1 += 1; ts.push({ c: a1, x: true }, { c: ax - a1, x: true }); } else if (ax) ts.push({ c: ax, x: true });
    if (pieces > 1 && b !== 0) { let b1 = rng.nz(-9, 9); if (b1 === b) b1 += 2; ts.push({ c: b1, x: false }, { c: b - b1, x: false }); } else if (b) ts.push({ c: b, x: false });
    return ts.filter(t => t.c !== 0);
  }
  const COMPARE = ['The left expression is always greater', 'The right expression is always greater', 'The two expressions are always equal', `It depends on the value of ${X}`];

  A.skill({
    id: 'math7.compare-expressions', title: 'Comparing expressions',
    learn: p(`To compare two expressions, <b>simplify each side first</b>: combine like terms and remove zero pairs. Then you may remove the same thing from both sides (the same number of ${X}s, or the same constant) without changing which side is greater.`) +
      p(`If both sides end up with the same number of ${X}s, the constants decide, and the answer is the same for every ${X}. If the ${X} terms are different, <b>which side is greater depends on ${X}</b>: the two sides are equal at one value and swap places there.`) +
      example('Example', `Left: 3${X} + 5 − ${X} + 2. Right: 2${X} + 4. The left simplifies to 2${X} + 7. Remove 2${X} from both sides: 7 is more than 4, so <b>the left is always greater</b>.`),
    make(rng) {
      const kind = rng.pick(['same', 'same', 'equal', 'depends', 'solve', 'test']);
      const aL = rng.int(-3, 5), x0 = rng.int(-5, 5);
      let aR = aL, bL = rng.int(-9, 9), bR;
      if (kind === 'same') { bR = bL + rng.nz(-8, 8); }
      else if (kind === 'equal') bR = bL;
      else { do { aR = rng.int(-3, 5); } while (aR === aL); bR = bL + (aL - aR) * x0; }
      const L = splitTerms(rng, aL, bL, 2), Rt = rng.shuffle(splitTerms(rng, aR, bR, rng.bool() ? 2 : 1));
      if (!Rt.length) Rt.push({ c: 0, x: false });
      const Ls = rng.shuffle(L);
      const lt = termsText(Ls), rt = termsText(Rt), lsimp = M.poly([aL, bL]), rsimp = M.poly([aR, bR]);
      const shown = `<div class="big">Left: ${lt}<br>Right: ${rt}</div>`;
      const h = [`Simplify the left side: ${lt} = ${lsimp}.`, rt === rsimp ? `The right side, ${rt}, is already simplified.` : `Simplify the right side: ${rt} = ${rsimp}.`];
      const at = (a, b, t) => a === 0 ? N(b) : `${N(a)}(${N(t)})${b ? ' ' + M.signed(b) : ''}`;
      const xdesc = (a, side) => a ? `${M.term(a, 'x')} on the ${side}` : `no ${X} on the ${side}`;
      const params = { kind, L: Ls, R: Rt };
      if (kind === 'solve') {
        h.push(`Set them equal: ${lsimp} = ${rsimp}. Move the ${X} terms to one side: ${M.term(aL - aR, 'x')} = ${N(bR - bL)}.`, `<b>${X} = ${N(x0)}</b>. Check: both sides equal ${N(aL * x0 + bL)} there.`);
        return { prompt: `For what value of ${X} are these two expressions equal?${shown}`, type: 'number', answer: x0, params, hints: h };
      }
      if (kind === 'test') {
        const t = x0 + rng.pick([-3, -2, 2, 3]), lv = aL * t + bL, rv = aR * t + bR;
        const choices = ['The left expression', 'The right expression', 'They are equal'];
        const answer = choices[lv > rv ? 0 : lv < rv ? 1 : 2];
        h.push(`Substitute ${X} = ${N(t)}: the left is ${at(aL, bL, t)} = ${N(lv)} and the right is ${at(aR, bR, t)} = ${N(rv)}.`, `<b>${answer}</b> is greater when ${X} = ${N(t)}.`);
        if (lv === rv) h[h.length - 1] = `Both are ${N(lv)}: <b>${answer}</b>.`;
        params.t = t;
        return { prompt: `When ${X} = ${N(t)}, which expression is greater?${shown}`, type: 'choice', choices, answer, keepOrder: true, params, hints: h };
      }
      let answer;
      if (aL === aR) {
        answer = COMPARE[bL > bR ? 0 : bL < bR ? 1 : 2];
        h.push(aL ? `Both sides have ${M.term(aL, 'x')}, so remove it from both. That leaves ${N(bL)} on the left and ${N(bR)} on the right.` : `Neither side has any ${X} left, so compare ${N(bL)} and ${N(bR)}.`);
        h.push(`${bL === bR ? 'They match for every value of ' + X : `${N(Math.max(bL, bR))} is greater whatever ${X} is`}: <b>${answer}</b>.`);
      } else {
        answer = COMPARE[3];
        const lo = x0 - 2, hi = x0 + 2;
        h.push(`The ${X} terms differ (${xdesc(aL, 'left')}, ${xdesc(aR, 'right')}), so try two values. At ${X} = ${N(lo)}: left ${N(aL * lo + bL)}, right ${N(aR * lo + bR)}. At ${X} = ${N(hi)}: left ${N(aL * hi + bL)}, right ${N(aR * hi + bR)}.`);
        h.push(`The greater side changes (they are equal at ${X} = ${N(x0)}): <b>${answer}</b>.`);
      }
      return { prompt: `Compare the two expressions. Which statement is true?${shown}`, type: 'choice', choices: COMPARE.slice(), answer, keepOrder: true, params, hints: h };
    },
    verify(q) {
      const P = q.params, l = new Function('x', 'return ' + termsJs(P.L)), r = new Function('x', 'return ' + termsJs(P.R));
      if (P.kind === 'solve') return l(q.answer) === r(q.answer);
      if (P.kind === 'test') { const d = l(P.t) - r(P.t); return q.answer.includes(d > 0 ? 'left' : d < 0 ? 'right' : 'equal'); }
      let gt = 0, lt = 0, eq = 0;
      for (let x = -40; x <= 40; x++) { const d = l(x) - r(x); if (d > 0) gt++; else if (d < 0) lt++; else eq++; }
      const want = gt && !lt && !eq ? 'left' : lt && !gt && !eq ? 'right' : eq === 81 ? 'equal' : 'depends';
      return q.answer.includes(want);
    },
  });

  /** 5-D word problems: each returns the facts, the unknowns and a test for any guess */
  const FIVE_D = {
    times(rng, [n1, n2]) {
      const k = rng.int(2, 5), s = rng.int(4, 30), T = (k + 1) * s, thing = rng.pick(['stickers', 'shells', 'stamps', 'marbles']);
      const askBig = rng.bool();
      return { text: `${n1} has ${k === 2 ? 'twice' : k + ' times'} as many ${thing} as ${n2}. Together they have ${T} ${thing}. How many ${thing} does ${askBig ? n1 : n2} have?`,
        x: `the number of ${thing} ${n2} has`, other: `${n1} has ${k}${X}`, eq: `${X} + ${k}${X} = ${T}`, comb: `${k + 1}${X} = ${T}`, s, total: g => g + k * g, T,
        ans: askBig ? k * s : s, declare: askBig ? `${n1} has ${k} × ${s} = <b>${k * s}</b> ${thing}.` : `${n2} has <b>${s}</b> ${thing}.`, params: { k, T, askBig } };
    },
    older(rng, [n1, n2]) {
      const d = rng.int(2, 12), s = rng.int(8, 40), T = 2 * s + d, askOld = rng.bool();
      return { text: `${n1} is ${d} years older than ${n2}. The sum of their ages is ${T}. How old is ${askOld ? n1 : n2}?`,
        x: `${n2}’s age`, other: `${n1} is ${X} + ${d}`, eq: `${X} + (${X} + ${d}) = ${T}`, comb: `2${X} + ${d} = ${T}`, s, total: g => 2 * g + d, T, word: 'sum of their ages',
        ans: askOld ? s + d : s, declare: askOld ? `${n1} is ${s} + ${d} = <b>${s + d}</b>.` : `${n2} is <b>${s}</b>.`, params: { d, T, askOld } };
    },
    twicePlus(rng, [n1, n2]) {
      const m = rng.int(2, 3), d = rng.nz(-6, 9), s = rng.int(6, 25), T = (m + 1) * s + d;
      const more = d > 0 ? `${d} more than` : `${-d} fewer than`;
      return { text: `${n1} has ${more} ${m === 2 ? 'twice' : 'three times'} as many trading cards as ${n2}. Together they have ${T} cards. How many cards does ${n2} have?`,
        x: `the number of cards ${n2} has`, other: `${n1} has ${m}${X} ${M.signed(d)}`, eq: `${X} + (${m}${X} ${M.signed(d)}) = ${T}`, comb: `${m + 1}${X} ${M.signed(d)} = ${T}`, s, total: g => g + m * g + d, T,
        ans: s, declare: `${n2} has <b>${s}</b> cards.`, params: { m, d, T } };
    },
    consecutive(rng) {
      const type = rng.pick(['', 'even', 'odd']), step = type ? 2 : 1;
      let s = rng.int(4, 40); if (type === 'even' && s % 2) s++; if (type === 'odd' && !(s % 2)) s++;
      const T = 3 * s + 3 * step, askBig = rng.bool();
      return { text: `The sum of three consecutive ${type ? type + ' ' : ''}integers is ${T}. What is the ${askBig ? 'largest' : 'smallest'} of them?`,
        x: 'the smallest integer', other: `the others are ${X} + ${step} and ${X} + ${2 * step}`, eq: `${X} + (${X} + ${step}) + (${X} + ${2 * step}) = ${T}`, comb: `3${X} + ${3 * step} = ${T}`, s, total: g => 3 * g + 3 * step, T, word: 'sum',
        ans: askBig ? s + 2 * step : s, declare: askBig ? `The integers are ${s}, ${s + step} and ${s + 2 * step}, so the largest is <b>${s + 2 * step}</b>.` : `The integers are ${s}, ${s + step} and ${s + 2 * step}, so the smallest is <b>${s}</b>.`, params: { step, T, askBig } };
    },
    rectangle(rng) {
      const m = rng.int(2, 3), d = rng.int(0, 6), s = rng.int(2, 15), len = m * s + d, T = 2 * (s + len), askLen = rng.bool();
      const rel = d ? `${d} cm more than ${m === 2 ? 'twice' : 'three times'} its width` : `${m === 2 ? 'twice' : 'three times'} its width`;
      return { text: `A rectangle’s length is ${rel}. Its perimeter is ${T} cm. What is its ${askLen ? 'length' : 'width'}, in centimeters?`,
        x: 'the width', other: `the length is ${M.term(m, 'x')}${d ? ` + ${d}` : ''}`, eq: `2(${X} + ${M.term(m, 'x')}${d ? ` + ${d}` : ''}) = ${T}`, comb: `${2 * (m + 1)}${X}${d ? ` + ${2 * d}` : ''} = ${T}`, s, total: g => 2 * (g + m * g + d), T, word: 'perimeter',
        ans: askLen ? len : s, declare: askLen ? `The length is ${m} × ${s}${d ? ` + ${d}` : ''} = <b>${len} cm</b>.` : `The width is <b>${s} cm</b>.`, params: { m, d, T, askLen } };
    },
    three(rng, [n1, n2, n3]) {
      const d = rng.int(2, 9), s = rng.int(3, 20), T = 4 * s + d;
      return { text: `${n1} has twice as many coins as ${n2}, and ${n3} has ${d} more coins than ${n2}. Together they have ${T} coins. How many coins does ${n2} have?`,
        x: `the number of coins ${n2} has`, other: `${n1} has 2${X} and ${n3} has ${X} + ${d}`, eq: `${X} + 2${X} + (${X} + ${d}) = ${T}`, comb: `4${X} + ${d} = ${T}`, s, total: g => 4 * g + d, T,
        ans: s, declare: `${n2} has <b>${s}</b> coins.`, params: { d, T } };
    },
  };

  A.skill({
    id: 'math7.five-d-problems', title: 'Word problems with related unknowns (the 5-D Process)',
    learn: p('The <b>5-D Process</b> organizes a word problem: <b>Describe</b> it, <b>Define</b> what to call the unknown, <b>Do</b> a trial, <b>Decide</b> whether the trial is too big or too small, and <b>Declare</b> the answer. A table with one row per trial keeps the work tidy.') +
      p(`After a trial or two, let ${X} stand for the trial value. Every column of the table becomes an expression in ${X}, and the last column gives an <b>equation</b>. Solving it finds the answer without more guessing.`) +
      example('Example', `Ana has 3 times as many stickers as Ben, and together they have 36. Trial: Ben 10, Ana 30, total 40: too big. Define Ben = ${X}, Ana = 3${X}: ${X} + 3${X} = 36, so 4${X} = 36 and ${X} = 9. Declare: Ben has <b>9</b>, Ana has <b>27</b>.`),
    make(rng) {
      const kind = rng.pick(Object.keys(FIVE_D));
      const P = FIVE_D[kind](rng, rng.sample(NAMES, 3));
      let g = P.s + rng.pick([-3, -2, 2, 3, 5]); if (g < 1) g = P.s + 4;
      const tv = P.total(g);
      return { prompt: P.text, type: 'number', answer: P.ans, unit: kind === 'rectangle' ? 'cm' : undefined, params: Object.assign({ kind }, P.params),
        hints: [`Define: let ${X} be ${P.x}. Then ${P.other}.`, `Do a trial: if ${X} = ${g}, the ${P.word || 'total'} would be ${tv}, which is too ${tv > P.T ? 'big' : 'small'}. So ${X} is ${tv > P.T ? 'smaller' : 'bigger'} than ${g}.`,
          `Write the equation: ${P.eq}. Combine like terms: ${P.comb}, so ${X} = ${P.s}.`, P.declare] };
    },
    verify(q) {
      const P = q.params;
      // search every whole number for the one that fits the story, then read off what was asked
      const fits = { times: s => s + P.k * s === P.T, older: s => 2 * s + P.d === P.T, twicePlus: s => s + P.m * s + P.d === P.T, consecutive: s => s + (s + P.step) + (s + 2 * P.step) === P.T && (P.step === 1 || (s % 2 + 2) % 2 === (q.answer % 2 + 2) % 2), rectangle: s => 2 * s + 2 * (P.m * s + P.d) === P.T, three: s => s + 2 * s + s + P.d === P.T }[P.kind];
      const sols = []; for (let s = 1; s <= 600; s++) if (fits(s)) sols.push(s);
      if (sols.length !== 1) return false;
      const s = sols[0];
      const want = { times: P.askBig ? P.k * s : s, older: P.askOld ? s + P.d : s, twicePlus: s, consecutive: P.askBig ? s + 2 * P.step : s, rectangle: P.askLen ? P.m * s + P.d : s, three: s }[P.kind];
      return q.answer === want;
    },
  });

  /** "x + 3" or "x − 2" as the top of a fraction */
  const xPlus = c => c ? `${X} ${M.signed(c)}` : X;
  const Tx = k => M.term(k, 'x');
  /** ", so x = 120 ÷ 5", or nothing when the coefficient is already 1 */
  /** "3(x + 2)", or just "x + 2" when the multiplier is 1 */
  const times = (k, inner) => k === 1 ? inner : `${k}(${inner})`;
  /** gather kx = rhs on the side with more x, so the coefficient is positive */
  const collect = (k, rhs) => ` Collect the ${X} terms on the side that has more of them: ${Tx(Math.abs(k))} = ${N(k < 0 ? -rhs : rhs)}${solveTail(Math.abs(k), k < 0 ? -rhs : rhs)}.`;
  const solveTail = (k, rhs) => k === 1 ? '' : `, so ${X} = ${N(rhs)} ÷ ${k < 0 ? `(${N(k)})` : N(k)}`;
  const lcm = (a, b) => a * b / M.gcd(a, b);
  const FB_FORMS = {
    sum2(rng) {
      const [a, b] = rng.sample([2, 3, 4, 5, 6, 8, 10], 2), L = lcm(a, b), op = rng.chance(0.7) ? '+' : '−';
      let x = L * rng.nz(-5, 6); const c = op === '+' ? x / a + x / b : x / a - x / b;
      if (c === 0) x = L;
      const cc = op === '+' ? x / a + x / b : x / a - x / b, k = op === '+' ? L / a + L / b : L / a - L / b;
      return { eq: `${F(X, a)} ${op} ${F(X, b)} = ${N(cc)}`, dens: [a, b], x, params: { form: 'sum2', a, b, op, c: cc },
        steps: [`Multiply: ${L} · ${F(X, a)} = ${Tx(L / a)} and ${L} · ${F(X, b)} = ${Tx(L / b)}, so ${Tx(L / a)} ${op} ${Tx(L / b)} = ${N(L * cc)}.`, `Combine like terms: ${Tx(k)} = ${N(L * cc)}${solveTail(k, L * cc)}.`] };
    },
    three(rng) {
      const [a, b, c] = rng.pick([[2, 3, 4], [2, 4, 5], [3, 4, 6], [2, 5, 10], [2, 3, 12], [3, 4, 12]]), L = lcm(lcm(a, b), c), x = L * rng.int(1, 4);
      const t = x / a + x / b + x / c, k = L / a + L / b + L / c;
      return { eq: `${F(X, a)} + ${F(X, b)} + ${F(X, c)} = ${N(t)}`, dens: [a, b, c], x, params: { form: 'three', a, b, c: t, d: c },
        steps: [`Multiply each term: ${Tx(L / a)} + ${Tx(L / b)} + ${Tx(L / c)} = ${N(L * t)}.`, `Combine like terms: ${Tx(k)} = ${N(L * t)}${solveTail(k, L * t)}.`] };
    },
    both(rng) {
      let a, b; do { [a, b] = rng.sample([2, 3, 4, 5, 6, 8], 2); } while (a > b);
      const L = lcm(a, b), x = L * rng.int(1, 5); let p, q; do { p = rng.nz(-6, 6); q = p + x / a - x / b; } while (q === 0);
      return { eq: `${F(X, a)} ${M.signed(p)} = ${F(X, b)} ${M.signed(q)}`.replace(/ \+ 0 /g, ' ').replace(/ \+ 0$/, ''), dens: [a, b], x, params: { form: 'both', a, b, p, q },
        steps: [`Multiply every term, constants too: ${Tx(L / a)} ${M.signed(L * p)} = ${Tx(L / b)} ${M.signed(L * q)}.`, `Subtract ${Tx(L / b)} from both sides and ${L * p < 0 ? 'add' : 'subtract'} ${N(Math.abs(L * p))}: ${Tx(L / a - L / b)} = ${N(L * (q - p))}${solveTail(L / a - L / b, L * (q - p))}.`] };
    },
    binomial(rng) {
      const [a, b] = rng.sample([2, 3, 4, 5, 6], 2), m = rng.nz(-6, 6), p = rng.nz(-9, 9), x = a * m - p, q = x - b * m;   // (x + p)/a = (x − q)/b = m
      const L = lcm(a, b);
      return { eq: `${F(xPlus(p), a)} = ${F(xPlus(-q), b)}`, dens: [a, b], x, params: { form: 'binomial', a, b, p, q },
        steps: [`Multiply both sides by ${L}: ${times(L / a, xPlus(p))} = ${times(L / b, xPlus(-q))}. The parentheses matter: each whole numerator is multiplied.`, `Distribute: ${M.poly([L / a, L / a * p])} = ${M.poly([L / b, -L / b * q])}. ${collect(L / a - L / b, -L / b * q - L / a * p)}`] };
    },
    split(rng) {
      const [a, b] = rng.sample([2, 3, 4, 5, 6], 2), m = rng.nz(-5, 6), x = a * m; let n = rng.nz(-4, 6), p = b * n - x; if (p === 0) { n += 1; p = b; }
      const c = m + n, L = lcm(a, b);                                              // x/a + (x + p)/b = c
      return { eq: `${F(X, a)} + ${F(xPlus(p), b)} = ${N(c)}`, dens: [a, b], x, params: { form: 'split', a, b, p, c },
        steps: [`Multiply every term by ${L}: ${Tx(L / a)} + ${L / b === 1 ? '' : L / b}(${xPlus(p)}) = ${N(L * c)}.`, `Distribute and combine: ${M.poly([L / a + L / b, L / b * p])} = ${N(L * c)}. ${L / b * p < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(L / b * p))} on both sides: ${Tx(L / a + L / b)} = ${N(L * c - L / b * p)}${solveTail(L / a + L / b, L * c - L / b * p)}.`] };
    },
    decimal(rng) {
      const scale = rng.pick([10, 10, 100]), unit = scale === 10 ? 1 : 5;
      let a, c; do { a = unit * rng.int(1, 19); c = unit * rng.int(1, 19); } while (a === c || a % scale === 0 || c % scale === 0);
      const x = rng.nz(-12, 15), b = unit * rng.nz(-30, 30), d = (a - c) * x + b;
      const t = (v, xx) => xx ? `${N(v / scale)}${X}` : N(v / scale);
      const side = (v, w) => `${t(v, true)} ${M.signed(w / scale)}`;
      return { eq: `${side(a, b)} = ${side(c, d)}`, dens: [], scale, x, params: { form: 'decimal', a, b, c, d, scale },
        steps: [`Multiply every term by ${scale}: ${M.poly([a, b])} = ${M.poly([c, d])}.`, `${collect(a - c, d - b).trim()}`] };
    },
  };

  A.skill({
    id: 'math7.fraction-busters', title: 'Fraction Busters: equations with fractions',
    learn: p(`Fractions in an equation are easier to handle once they are gone. <b>Fraction Busters: multiply every term on both sides by a common multiple of the denominators</b> (the least common multiple keeps the numbers smallest). Each fraction becomes a whole-number term, and the equation solves as usual.`) +
      p(`Multiply <b>every</b> term, including the constants. When a numerator has two terms, like ${F(xPlus(1), 2)}, keep it in parentheses and distribute. Decimals work the same way: multiply by 10 or 100 to make the coefficients whole numbers.`) +
      example('Example', `${big(`${F(X, 3)} + ${F(X, 4)} = 7`)}Multiply every term by 12: 4${X} + 3${X} = 84. Combine: 7${X} = 84, so <b>${X} = 12</b>. Check: 4 + 3 = 7 ✓.`),
    make(rng) {
      const form = rng.pick(['sum2', 'sum2', 'three', 'both', 'binomial', 'binomial', 'split', 'decimal', 'lcd']);
      if (form === 'lcd') {
        const f = FB_FORMS[rng.pick(['sum2', 'three', 'both', 'binomial', 'split'])](rng), L = f.dens.reduce(lcm, 1);
        return { prompt: `You want to clear every fraction from this equation by multiplying both sides by one whole number. What is the <b>smallest</b> number that works?${big(f.eq)}`, type: 'number', answer: L, params: { form, dens: f.dens },
          hints: [`The denominators are ${M.list(f.dens.map(String))}. The number must be a multiple of every one of them.`, `List the multiples of ${Math.max(...f.dens)}: ${[1, 2, 3, 4, 5, 6].map(k => k * Math.max(...f.dens)).filter(v => v <= L).join(', ')}. The first one that every denominator divides is ${L}.`, `The smallest is the least common multiple: <b>${L}</b>.`] };
      }
      const f = FB_FORMS[form](rng);
      const L = f.dens.length ? f.dens.reduce(lcm, 1) : f.scale;
      const first = f.dens.length ? `The denominators are ${M.list(f.dens.map(String))}; their least common multiple is ${L}. Multiply every term on both sides by ${L}.` : `The decimals have at most ${f.scale === 10 ? 'one decimal place' : 'two decimal places'}, so multiplying every term by ${f.scale} makes them whole numbers.`;
      const steps = f.dens.length ? [first].concat(f.steps) : f.steps.slice();
      if (!f.dens.length) steps[0] = `${first} ${steps[0]}`;
      return { prompt: `Solve for ${X}.${big(f.eq)}`, type: 'number', answer: f.x, params: f.params, hints: steps.concat([`<b>${X} = ${N(f.x)}</b>.`]) };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.form === 'lcd') { let n = 1; while (P.dens.some(d => n % d)) n++; return q.answer === n; }
      // substitute the answer, cross-multiplied so that everything stays a whole number
      if (P.form === 'sum2') return x * P.b + (P.op === '+' ? 1 : -1) * x * P.a === P.c * P.a * P.b;
      if (P.form === 'three') return x * P.b * P.d + x * P.a * P.d + x * P.a * P.b === P.c * P.a * P.b * P.d;
      if (P.form === 'both') return x * P.b + P.p * P.a * P.b === x * P.a + P.q * P.a * P.b;
      if (P.form === 'binomial') return P.b * (x + P.p) === P.a * (x - P.q);
      if (P.form === 'split') return x * P.b + (x + P.p) * P.a === P.c * P.a * P.b;
      return P.a * x + P.b === P.c * x + P.d;
    },
  });

  /* ---------- Unit 11: Graph scales, samples, and comparing data ---------- */
  /** a number line with 10 equal spaces starting at v0, labels at the given marks, and point A at mark `at` */
  function axisSvg(v0, st, labelAt, at) {
    const x = i => 24 + 37 * i;
    let g = `<line class="stroke" x1="10" y1="40" x2="410" y2="40"/>`;
    for (let i = 0; i <= 10; i++) {
      const lab = labelAt.includes(i);
      g += `<line class="stroke" x1="${x(i)}" y1="${lab ? 30 : 34}" x2="${x(i)}" y2="${lab ? 50 : 46}" style="stroke-width:${lab ? 2 : 1.2}"/>`;
      if (lab) g += `<text x="${x(i)}" y="68" text-anchor="middle" font-size="13">${N(M.round(v0 + st * i, 4))}</text>`;
    }
    if (at != null) g += `<circle cx="${x(at)}" cy="40" r="6" fill="var(--primary)"/><text x="${x(at)}" y="22" text-anchor="middle" font-size="14" font-weight="700">A</text>`;
    return `<svg class="figure" viewBox="0 0 420 76" width="420" role="img" aria-label="number line with equal spaces${at != null ? ' and point A' : ''}">${g}</svg>`;
  }
  const NICE_SCALES = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  /** how many equal spaces of size c an axis needs to reach from lo up to hi, with 0 on a mark */
  const spacesNeeded = (c, lo, hi) => Math.ceil(hi / c) + Math.ceil(-Math.min(lo, 0) / c);

  A.skill({
    id: 'math7.axis-scales', title: 'Choosing and reading axis scales',
    learn: p('The marks on a graph’s axis must be <b>evenly spaced</b>, and every space must stand for the same amount: the <b>scale</b>. Not every mark has to be labeled. To find the scale, take two labeled marks, subtract their values and divide by the number of spaces between them.') +
      p('To choose a scale, find the range the axis must cover and divide it by the number of spaces you have. Then round <b>up</b> to a friendly number such as 1, 2, 5, 10, 20, 25 or 50, so that all of the data fits. Rounding down would leave some data off the graph.') +
      example('Example', `Data run from 0 to 470 on an axis with 10 spaces. 470 ÷ 10 = 47, so each space must be at least 47. The smallest friendly scale that fits is <b>50</b>, and the axis runs from 0 to 500.`),
    make(rng) {
      const kind = rng.pick(['read', 'read', 'read', 'tick', 'choose', 'choose']);
      const name = rng.pick(NAMES);
      if (kind === 'choose') {
        const spaces = rng.pick([8, 10, 12]), neg = rng.chance(0.35);
        const ci = rng.int(2, NICE_SCALES.length - 3), c = NICE_SCALES[ci];
        let lo = 0, hi;
        do {
          lo = neg ? -c * rng.int(1, Math.floor(spaces / 3)) + rng.int(0, Math.floor(c / 2)) : 0;
          hi = rng.int(Math.max(1, Math.floor(c * 0.6)), c * spaces);
        } while (spacesNeeded(c, lo, hi) > spaces || spacesNeeded(NICE_SCALES[ci - 1], lo, hi) <= spaces);
        const opts = [NICE_SCALES[ci - 1], c, NICE_SCALES[ci + 1], NICE_SCALES[ci + 2]];
        const choices = opts.map(v => `${N(v)} per space`);
        const range = hi - lo;
        return { prompt: `${name} is drawing an axis with ${spaces} equal spaces for data that run from ${N(lo)} to ${N(hi)}. Zero must sit on one of the marks. Which is the <b>smallest</b> of these scales that fits all of the data?`, type: 'choice', choices, answer: choices[1], keepOrder: true, params: { kind, spaces, lo, hi, opts },
          hints: [`The axis must cover ${N(hi)} − ${N(lo)} = ${N(range)}. With ${spaces} spaces, each must be at least ${N(range)} ÷ ${spaces} ≈ ${N(M.round(range / spaces, 2))}.`,
            `Test ${N(opts[0])}: ${lo < 0 ? `it needs ${Math.ceil(-lo / opts[0])} spaces below 0 and ${Math.ceil(hi / opts[0])} above` : `${spaces} spaces only reach ${N(opts[0] * spaces)}`}, which ${lo < 0 ? `is more than ${spaces}` : `is less than ${N(hi)}`}. It does not fit.`,
            `${N(c)} fits: ${lo < 0 ? `${Math.ceil(-lo / c)} spaces below 0 and ${Math.ceil(hi / c)} above, ${spacesNeeded(c, lo, hi)} in all` : `${spaces} spaces reach ${N(c * spaces)}`}. The smallest scale that works is <b>${N(c)} per space</b>.`] };
      }
      const st = rng.pick([1, 2, 5, 10, 20, 25, 50, 100, 0.5, 0.25, 0.2, 0.1]);
      const v0 = rng.chance(0.4) ? -st * rng.int(1, 5) : 0;
      const val = i => M.round(v0 + st * i, 4);
      if (kind === 'tick') {
        const i1 = rng.int(0, 3), i2 = i1 + rng.int(2, 6);
        return { prompt: `Only two marks on this axis are labeled. The spaces between marks are all equal. How much does each space stand for?${axisSvg(v0, st, [i1, i2], null)}`, type: 'number', answer: st, params: { kind, a: val(i1), b: val(i2), gap: i2 - i1 },
          hints: [`From ${N(val(i1))} to ${N(val(i2))} is ${N(val(i2))} − ${val(i1) < 0 ? `(${N(val(i1))})` : N(val(i1))} = ${N(M.round(val(i2) - val(i1), 4))}.`, `Count the spaces between those two marks: ${i2 - i1}.`, `${N(M.round(val(i2) - val(i1), 4))} ÷ ${i2 - i1} = <b>${N(st)}</b> per space.`] };
      }
      const every = rng.pick([2, 5]), labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(i => i % every === 0);
      let at; do { at = rng.int(1, 9); } while (at % every === 0);
      const base = at - at % every, ans = val(at);
      return { prompt: `What value does point A show on this axis?${axisSvg(v0, st, labels, at)}`, type: 'number', answer: ans, params: { kind, first: val(0), last: val(10), at },
        hints: [`The labels ${N(val(0))} and ${N(val(every))} are ${every} spaces apart, so each space is (${N(val(every))} − ${val(0) < 0 ? `(${N(val(0))})` : N(val(0))}) ÷ ${every} = ${N(st)}.`, `A is ${at - base} space${at - base > 1 ? 's' : ''} to the right of ${N(val(base))}: ${N(val(base))} + ${at - base} × ${N(st)}.`, `A = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'read') return Math.abs(P.first + (P.last - P.first) * P.at / 10 - q.answer) < 1e-9;      // interpolate between the two end labels
      if (P.kind === 'tick') return Math.abs(q.answer * P.gap - (P.b - P.a)) < 1e-9;
      // try every offered scale in turn by laying out marks from 0
      const fits = c => { let below = 0, above = 0; while (-below * c > P.lo) below++; while (above * c < P.hi) above++; return below + above <= P.spaces; };
      const best = P.opts.slice().sort((a, b) => a - b).find(fits);
      return q.answer === `${N(best)} per space`;
    },
  });

  const SAMPLE_SCENES = [
    { goal: 'The principal wants to know what the 600 students at a school think of a new lunch menu.', random: 'Pick 60 students at random from a list of every student in the school', volunteer: 'Post a survey on the school website and count whoever chooses to answer it', groups: ['Ask the 30 students in the cooking club at their weekly meeting', 'Ask 60 students who are all in the 8th grade on their field trip'] },
    { goal: 'A town wants to know how its residents feel about building a new skate park.', random: 'Mail the survey to 200 homes picked at random from every home in town', volunteer: 'Ask listeners to phone a local radio show if they want to share an opinion', groups: ['Ask 200 people shopping at the skateboard shop on a Saturday', 'Ask the 25 members of the town’s skateboarding club after practice'] },
    { goal: 'A coach wants to know how many hours a week the 400 students at a school exercise.', random: 'Choose 40 student ID numbers at random from the whole school', volunteer: 'Leave a sign-up sheet in the hallway for any students who want to answer', groups: ['Ask the 40 players on the school’s soccer and basketball teams', 'Ask 40 students leaving the gym after an evening fitness class'] },
    { goal: 'A library wants to know which kind of book the 5,000 people in its town like best.', random: 'Phone 150 households picked at random from every household in town', volunteer: 'Post the question online and count replies from anyone who decides to answer', groups: ['Ask 150 people browsing the mystery-book shelves at the library', 'Ask the members of the library’s science-fiction book club'] },
    { goal: 'A cafeteria manager wants to know which drink the students at a school like best.', random: 'Draw 50 names at random from a box that holds the name of every student', volunteer: 'Put a ballot box by the door and let students vote if they feel like it', groups: ['Ask the 50 students standing in the cafeteria line for orange juice', 'Ask only the students on the school chess team during their lunch'] },
    { goal: 'A city wants to know how its residents usually travel to work.', random: 'Phone 300 residents picked at random from the city’s list of residents', volunteer: 'Ask people to answer a poll on the city’s social media page if they want to', groups: ['Ask 300 people who are waiting at the city’s bus stops one morning', 'Ask 300 drivers as they park their cars in a downtown parking garage'] },
  ];
  const SAMPLE_FRAMES = [
    { did: 'picks 30 names at random from the list of 7th graders at her school', pop: 'All 7th graders at her school', wrong: ['All students at her school', 'All 7th graders in the country', 'All the people in her town'] },
    { did: 'chooses 50 members at random from the town swim club’s list of members', pop: 'All members of the town swim club', wrong: ['All the people in the town', 'All swimmers in the country', 'All the students at the town’s schools'] },
    { did: 'picks 25 players at random from the city youth soccer league’s list of players', pop: 'All players in the city youth soccer league', wrong: ['All the children in the city', 'All soccer players in the country', 'All the students at one school'] },
    { did: 'chooses 80 households at random from a list of every household in the town of Elm Valley', pop: 'All households in Elm Valley', wrong: ['All households in the state', 'All households in the country', 'Only the households that have children'] },
    { did: 'picks 40 workers at random from the list of everyone who works at one factory', pop: 'All workers at that factory', wrong: ['All factory workers in the country', 'All the people who live near the factory', 'All the adults in the state'] },
  ];

  A.skill({
    id: 'math7.representative-samples', title: 'Representative and biased samples',
    learn: p('A <b>population</b> is the whole group you want to know about; a <b>sample</b> is the part of it you actually ask. A sample is <b>representative</b> when it looks like the population in the ways that matter. The surest way to get one is a <b>random sample</b>: everyone in the population has the same chance of being picked.') +
      p('A sample is <b>biased</b> when the way it was chosen favors some answers. Two common causes: asking only <b>one group</b> (the soccer team, the people in one shop), and letting people <b>choose themselves</b> (call-in polls, online surveys), because people with strong opinions answer most. A random sample also only represents the population it was drawn from.') +
      example('Example', 'To learn what all students think of the lunch menu, asking the cooking club is biased: they may care about food more than others. Picking 60 names at random from a list of every student is <b>representative</b>.'),
    make(rng) {
      const name = rng.pick(NAMES);
      if (rng.chance(0.35)) {
        const f = rng.pick(SAMPLE_FRAMES), choices = [f.pop].concat(f.wrong);
        const who = ['Ana', 'Chloe', 'Ella', 'Grace', 'Iris', 'Lena', 'Nora', 'Sara', 'Uma', 'Zoe'].includes(name) ? name : rng.pick(['Ana', 'Chloe', 'Nora', 'Zoe']);
        return { prompt: `${who} ${f.did}, and asks each one how many hours they sleep on a school night. Her results can be used to make estimates about which group?`, type: 'choice', choices, answer: f.pop, params: { kind: 'frame', did: f.did },
          hints: ['A random sample represents the population it was picked from, and nothing bigger.', `The names came from this list: ${f.did.replace(/^(picks|chooses) \d+ \w+ at random from /, '')}.`, `So the results describe <b>${f.pop.charAt(0).toLowerCase() + f.pop.slice(1)}</b>.`] };
      }
      const sc = rng.pick(SAMPLE_SCENES), choices = [sc.random, sc.volunteer].concat(sc.groups);
      return { prompt: `${sc.goal} Which way of choosing a sample is most likely to be representative?`, type: 'choice', choices, answer: sc.random, params: { kind: 'best', goal: sc.goal },
        hints: [`Look for the plan in which everyone in the population has the same chance of being picked.`, `“${sc.volunteer}” lets people choose themselves, and the other two plans ask only one group, so all three are biased.`, `<b>${sc.random}</b>: it is a random sample of the whole population.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'frame') { const f = SAMPLE_FRAMES.find(fr => fr.did === P.did); return !!f && q.answer === f.pop && !f.wrong.includes(q.answer); }
      const sc = SAMPLE_SCENES.find(s => s.goal === P.goal);
      return !!sc && q.answer === sc.random && /at random/.test(q.answer) && q.choices.filter(c => /at random/.test(c)).length === 1;
    },
  });

  A.skill({
    id: 'math7.population-estimate', title: 'Estimating a population from a sample',
    learn: p('If a sample is random, the fraction of the sample with some feature is a good estimate of the fraction of the whole population with it. <b>Set up a proportion: part of sample ÷ sample size = part of population ÷ population size</b>, and solve for the missing number.') +
      p('Biologists use the same idea to count animals. They catch some, tag them and let them go. Later they catch a new sample: the fraction of tagged animals in it estimates the fraction of the whole population that is tagged.') +
      example('Example', `In a random sample of 50 of a school’s 800 students, 18 bike to school. ${R(18, 50)} = ${R(V('n'), 800)}, so ${V('n')} = 800 × 18 ÷ 50 = <b>288</b> students.`),
    make(rng) {
      const kind = rng.pick(['survey', 'survey', 'defect', 'tag', 'tag']);
      const name = rng.pick(NAMES);
      if (kind === 'tag') {
        const k = rng.int(3, 12), m = rng.int(3, 10), C = k * m, T = rng.pick([20, 30, 40, 50, 60, 80, 100]), Nn = T * m;   // k of the C caught carry a tag
        const animal = rng.pick(['fish in a lake', 'turtles in a pond', 'rabbits in a park', 'frogs in a marsh']);
        return { prompt: `Scientists want to estimate the number of ${animal}. They catch ${T}, tag them and release them. A week later they catch ${C}, and ${k} of those have tags. About how many ${animal.split(' ')[0]} are there in all?`, type: 'number', answer: Nn, params: { kind, T, C, k },
          hints: [`In the second catch, ${k} of ${C} are tagged: ${R(k, C)}.`, `The whole population should have the same fraction tagged, and ${T} are tagged in all: ${R(k, C)} = ${R(T, V('n'))}.`, `${V('n')} = ${T} × ${C} ÷ ${k} = <b>${N(Nn)}</b>.`] };
      }
      const [a, b] = rng.pick([[1, 4], [3, 4], [2, 5], [3, 5], [1, 5], [3, 8], [5, 8], [3, 10], [7, 10], [9, 20], [13, 20], [9, 25], [3, 20], [1, 25], [1, 50], [3, 50]]);
      const n = b * rng.int(kind === 'defect' ? 4 : 1, kind === 'defect' ? 10 : 6) * (b < 10 ? 5 : 1), k = a * n / b;
      const Np = lcm(b, 50) * (kind === 'defect' ? rng.int(20, 100) : rng.int(Math.max(2, Math.ceil(5 * n / lcm(b, 50))), 30)), ans = a * Np / b;
      const prompt = kind === 'defect'
        ? `A factory checks a random sample of ${n} light bulbs from a batch of ${N(Np)} and finds ${k} that do not work. About how many bulbs in the whole batch do not work?`
        : rng.pick([`In a random sample of ${n} of the ${N(Np)} students at a school, ${k} said they bike to school. Estimate how many of the ${N(Np)} students bike to school.`,
          `${name} asks a random sample of ${n} of the ${N(Np)} people at a fair, and ${k} of them say they would buy a ticket for the raffle. About how many people at the fair would buy one?`,
          `A random sample of ${n} of the ${N(Np)} voters in a town finds ${k} in favor of a new park. Estimate how many of the town’s voters favor the park.`]);
      return { prompt, type: 'number', answer: ans, params: { kind, n, k, Np },
        hints: [`The sample fraction is ${R(k, n)}${M.gcd(k, n) > 1 ? ` = ${F(k, n)}` : ''}.`, `Assume the whole group has the same fraction: ${R(k, n)} = ${R(V('n'), N(Np))}.`, `${V('n')} = ${N(Np)} × ${k} ÷ ${n} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'tag') return q.answer * P.k === P.T * P.C;                    // cross-multiplied proportion
      return q.answer * P.n === P.k * P.Np;
    },
  });

  const MAD_PATTERNS = [[-3, -1, 1, 3], [-4, -2, 2, 4], [-5, -1, 1, 5], [-6, -2, 2, 6], [-5, -3, 3, 5], [-5, -5, 0, 4, 6], [-4, -1, 0, 0, 5], [-3, -2, 0, 2, 3], [-6, -4, 0, 4, 6], [-8, -2, 0, 4, 6], [-2, -2, -1, 0, 5], [-5, -3, -1, 1, 3, 5], [-4, -2, 0, 0, 2, 4], [-7, -3, -2, 2, 3, 7]];
  const madOf = data => { const m = data.reduce((s, v) => s + v, 0) / data.length; return data.reduce((s, v) => s + Math.abs(v - m), 0) / data.length; };

  A.skill({
    id: 'math7.compare-mad', title: 'Comparing data sets with the MAD',
    learn: p('The <b>mean absolute deviation</b> (MAD) is the average distance of the values from their mean. A small MAD means the values are close together: repeated measurements with a small MAD are more <b>precise</b>.') +
      p('To compare two groups whose spreads are about the same, measure the gap between their means <b>in MADs</b>: <b>difference of the means ÷ MAD</b>. A gap of several MADs means the groups barely overlap; a gap of less than one MAD means they overlap a lot.') +
      example('Example', `Class A’s mean score is 82 and Class B’s is 70; both have a MAD of 4. The means are 82 − 70 = 12 apart, and 12 ÷ 4 = <b>3 MADs</b>.`),
    make(rng) {
      const kind = rng.pick(['given', 'data', 'data', 'precise']);
      const pat = rng.pick(MAD_PATTERNS), mad = madOf(pat);
      if (kind === 'precise') {
        let pat2; do { pat2 = rng.pick(MAD_PATTERNS); } while (pat2.length !== pat.length && rng.chance(0.5) || madOf(pat2) === mad && rng.chance(0.8));
        const m = rng.int(40, 90), A1 = rng.shuffle(pat.map(d => m + d)), B1 = rng.shuffle(pat2.map(d => m + d)), ma = madOf(A1), mb = madOf(B1);
        const choices = ['Method A', 'Method B', 'They are equally precise'];
        const answer = choices[ma < mb ? 0 : mb < ma ? 1 : 2];
        return { prompt: `Two methods are used to measure the same length several times, in millimeters.${M.table(['Method', 'Measurements'], [['A', A1.join(', ')], ['B', B1.join(', ')]])}Both sets have a mean of ${m} mm. Which method is more precise?`, type: 'choice', choices, answer, keepOrder: true, params: { kind, A1, B1 },
          hints: ['The more precise method gives measurements that are closer together: the one with the smaller MAD.', `Distances from ${m}: A gives ${A1.map(v => Math.abs(v - m)).join(', ')}, so its MAD is ${N(M.round(ma, 3))}. B gives ${B1.map(v => Math.abs(v - m)).join(', ')}, so its MAD is ${N(M.round(mb, 3))}.`, ma === mb ? `The MADs are equal: <b>they are equally precise</b>.` : `${ma < mb ? 'A' : 'B'} has the smaller MAD: <b>${answer}</b> is more precise.`] };
      }
      let ratio; do { ratio = rng.pick([1, 1.5, 2, 2.5, 3, 4]); } while (!Number.isInteger(ratio * mad));
      const shift = ratio * mad, m1 = rng.int(20, 70), [g1, g2] = rng.pick([['Class A', 'Class B'], ['the 7th graders', 'the 8th graders'], ['Team Red', 'Team Blue']]);
      if (kind === 'given') {
        const what = rng.pick(['test score', 'number of push-ups', 'reaction time, in hundredths of a second,']);
        return { prompt: `For ${g1}, the mean ${what} is ${m1 + shift} with a MAD of ${N(mad)}. For ${g2}, the mean is ${m1} with a MAD of ${N(mad)}. How many MADs apart are the two means?`, type: 'number', answer: ratio, params: { kind, a: m1 + shift, b: m1, mad },
          hints: [`The difference of the means: ${m1 + shift} − ${m1} = ${shift}.`, `Divide by the MAD: ${shift} ÷ ${N(mad)} = <b>${N(ratio)}</b> MADs.`] };
      }
      const A1 = rng.shuffle(pat.map(d => m1 + d)), B1 = rng.shuffle(pat.map(d => m1 + shift + d));
      return { prompt: `Plants grown with two kinds of soil reached these heights, in centimeters.${M.table(['Soil', 'Heights'], [['Soil 1', A1.join(', ')], ['Soil 2', B1.join(', ')]])}The two sets have the same MAD. How many MADs apart are their means?`, type: 'number', answer: ratio, params: { kind, A1, B1 },
        hints: [`Mean of soil 1: ${A1.reduce((s, v) => s + v, 0)} ÷ ${A1.length} = ${m1}. Mean of soil 2: ${B1.reduce((s, v) => s + v, 0)} ÷ ${B1.length} = ${m1 + shift}. They differ by ${shift}.`,
          `The MAD of soil 1: the distances from ${m1} are ${A1.map(v => Math.abs(v - m1)).join(', ')}, and their mean is ${N(mad)}.`, `${shift} ÷ ${N(mad)} = <b>${N(ratio)}</b> MADs.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'given') return Math.abs(q.answer * P.mad - Math.abs(P.a - P.b)) < 1e-9;
      // recompute every mean and MAD from the raw data, the long way
      const stats = d => { let s = 0; d.forEach(v => { s += v; }); const m = s / d.length; let t = 0; d.forEach(v => { t += v > m ? v - m : m - v; }); return [m, t / d.length]; };
      const [ma, da] = stats(P.A1), [mb, db] = stats(P.B1);
      if (P.kind === 'precise') return q.answer === (da < db ? 'Method A' : db < da ? 'Method B' : 'They are equally precise') && ma === mb;
      return Math.abs(da - db) < 1e-9 && Math.abs(q.answer - Math.abs(mb - ma) / da) < 1e-9;
    },
  });

  /* ---------- Unit 12: Building triangles and slicing solids ---------- */
  const triOk = (a, b, c) => a + b > c && a + c > b && b + c > a;
  const sidesText = s => s.map(v => `${v} cm`).join(', ');

  A.skill({
    id: 'math7.triangle-inequality', title: 'The triangle inequality',
    learn: p('Three lengths make a triangle only when <b>the two shorter sides add up to more than the longest side</b>. If they add up to exactly the longest side, the two short pieces lie flat along it; if they add up to less, their ends cannot meet.') +
      p(`So when two sides are ${V('a')} and ${V('b')} (with ${V('b')} the longer), the third side ${V('c')} must be longer than their difference and shorter than their sum: <b>${V('b')} − ${V('a')} &lt; ${V('c')} &lt; ${V('a')} + ${V('b')}</b>.`) +
      example('Example', `Can 4 cm, 7 cm and 12 cm make a triangle? 4 + 7 = 11, which is less than 12, so <b>no</b>. If two sides are 5 cm and 9 cm, the third side must be between 9 − 5 = 4 cm and 9 + 5 = 14 cm.`),
    make(rng) {
      const kind = rng.pick(['which', 'which', 'range', 'max', 'min', 'count']);
      let a = rng.int(2, 12), b = rng.int(2, 14); if (a === b) b += 3; if (a > b) [a, b] = [b, a];
      if (kind === 'which') {
        const good = (() => { const x = rng.int(3, 10), y = rng.int(3, 10); return [x, y, rng.int(Math.abs(x - y) + 1, x + y - 1)]; })();
        const flat = (() => { const x = rng.int(2, 9), y = rng.int(2, 9); return [x, y, x + y]; })();
        const short = () => { const x = rng.int(2, 8), y = rng.int(2, 8); return [x, y, x + y + rng.int(1, 6)]; };
        const sets = [good, flat, short(), short()].map(s => rng.shuffle(s));
        const keys = sets.map(s => s.slice().sort((u, v) => u - v).join());
        if (new Set(keys).size < 4) sets[3] = [1, 2, 20 + rng.int(0, 9)];
        const choices = sets.map(sidesText);
        const why = rng.shuffle(sets.map(s => { const t = s.slice().sort((u, v) => u - v), sum = t[0] + t[1]; return `${t[0]} + ${t[1]} = ${sum}, which is ${sum > t[2] ? 'more than' : sum === t[2] ? 'only equal to' : 'less than'} ${t[2]}`; }));
        return { prompt: 'Which set of side lengths can form a triangle?', type: 'choice', choices, answer: choices[0], params: { kind, sets },
          hints: ['In each set, add the two shorter lengths and compare the total with the longest one. It must be <b>more</b>.', `${why.join('; ')}.`, `Only one set passes: <b>${choices[0]}</b>.`] };
      }
      const lo = b - a, hi = a + b, xx = V('x');
      const intro = `Two sides of a triangle are ${a} cm and ${b} cm long.`;
      const bounds = `The third side must be longer than ${b} − ${a} = ${lo} cm and shorter than ${a} + ${b} = ${hi} cm.`;
      if (kind === 'range') {
        const right = `${lo} &lt; ${xx} &lt; ${hi}`;
        const choices = [right].concat(distinct(right, rng.shuffle([`${a} &lt; ${xx} &lt; ${b}`, `${lo} &lt; ${xx} &lt; ${b}`, `${b} &lt; ${xx} &lt; ${hi}`, `${a} &lt; ${xx} &lt; ${hi}`]), 3));
        return { prompt: `${intro} Which inequality describes every possible length ${xx} of the third side, in centimeters?`, type: 'choice', choices, answer: choices[0], params: { kind, a, b },
          hints: [`If the third side were ${hi} cm or longer, the two given sides could not reach across it.`, `If it were ${lo} cm or shorter, it and the ${a} cm side could not reach across the ${b} cm side.`, `${bounds} <b>${lo} &lt; ${xx} &lt; ${hi}</b>.`] };
      }
      const Q = {
        max: [`What is the <b>longest</b> whole number of centimeters the third side could be?`, hi - 1, `It must be shorter than ${hi}, so the longest whole number is <b>${hi - 1}</b>.`],
        min: [`What is the <b>shortest</b> whole number of centimeters the third side could be?`, lo + 1, `It must be longer than ${lo}, so the shortest whole number is <b>${lo + 1}</b>.`],
        count: [`How many different whole-number lengths, in centimeters, could the third side have?`, hi - lo - 1, `The whole numbers from ${lo + 1} to ${hi - 1}: ${hi - 1} − ${lo + 1} + 1 = <b>${hi - lo - 1}</b>.`],
      }[kind];
      return { prompt: `${intro} ${Q[0]}`, type: 'number', answer: Q[1], unit: kind === 'count' ? undefined : 'cm', params: { kind, a, b },
        hints: ['The two shorter sides of a triangle must add to more than the longest side.', bounds, Q[2]] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'which') return P.sets.filter(s => triOk(s[0], s[1], s[2])).length === 1 && triOk(...P.sets[0]) && q.answer === sidesText(P.sets[0]);
      // try every length in steps of a tenth of a centimetre
      const ok = []; for (let t = 1; t <= 600; t++) if (triOk(P.a, P.b, t / 10)) ok.push(t / 10);
      const whole = ok.filter(Number.isInteger);
      if (P.kind === 'max') return q.answer === Math.max(...whole);
      if (P.kind === 'min') return q.answer === Math.min(...whole);
      if (P.kind === 'count') return q.answer === whole.length;
      const lo = M.round(ok[0] - 0.1, 4), hi = M.round(ok[ok.length - 1] + 0.1, 4);
      return q.answer === `${lo} &lt; ${V('x')} &lt; ${hi}`;
    },
  });

  /** a line-drawing of a solid; hidden edges dashed */
  function solidSvg(kind, dims) {
    const ln = (pts, dash) => `<polyline class="stroke" points="${pts.map(q => q.join(',')).join(' ')}"${dash ? ' stroke-dasharray="5 4" style="stroke-width:1.3"' : ''}/>`;
    const box = (x, y, w, h, dx, dy) => {
      const A = [x, y + h], B = [x + w, y + h], C = [x + w, y], D = [x, y], o = q => [q[0] + dx, q[1] - dy];
      return `<polygon class="fill" points="${[A, B, C, D].map(q => q.join(',')).join(' ')}" style="fill-opacity:.5"/>` + ln([A, B, C, D, A]) + ln([D, o(D), o(C), C]) + ln([B, o(B), o(C)]) + ln([A, o(A), o(B)], true) + ln([o(A), o(D)], true);
    };
    const arcs = (cx, cy, rx, ry, topSolid) => `<path class="stroke" d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}"/><path class="stroke" d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}"${topSolid ? '' : ' stroke-dasharray="5 4" style="stroke-width:1.3"'}/>`;
    let g;
    if (kind === 'cube') g = box(45, 70, 85, 85, 42, 34);
    else if (kind === 'box') { g = box(25, 100, 120, 55, 36, 28); if (dims) g += `<text x="85" y="172" text-anchor="middle" font-size="12">${dims[0]} cm long</text><text x="168" y="152" font-size="12">${dims[1]} cm wide</text><text x="186" y="104" font-size="12">${dims[2]} cm tall</text>`; }
    else if (kind === 'tprism') { const P1 = [40, 160], P2 = [135, 160], P3 = [100, 128], up = q => [q[0], q[1] - 95]; g = `<polygon class="fill" points="${[P1, P2, up(P2), up(P1)].map(q => q.join(',')).join(' ')}" style="fill-opacity:.5"/>` + ln([P1, P2]) + ln([up(P1), up(P2), up(P3), up(P1)]) + ln([P1, up(P1)]) + ln([P2, up(P2)]) + ln([P1, P3, P2], true) + ln([P3, up(P3)], true); }
    else if (kind === 'spyr') { const A0 = [30, 155], B0 = [130, 155], C0 = [172, 122], D0 = [72, 122], E = [100, 28]; g = `<polygon class="fill" points="${[A0, B0, E].map(q => q.join(',')).join(' ')}" style="fill-opacity:.5"/>` + ln([A0, B0, C0]) + ln([A0, E, B0]) + ln([C0, E]) + ln([C0, D0, A0], true) + ln([D0, E], true); }
    else if (kind === 'tpyr') { const A0 = [30, 155], B0 = [150, 155], C0 = [105, 118], E = [88, 30]; g = `<polygon class="fill" points="${[A0, B0, E].map(q => q.join(',')).join(' ')}" style="fill-opacity:.5"/>` + ln([A0, B0, E, A0]) + ln([A0, C0, B0], true) + ln([C0, E], true); }
    else if (kind === 'cylinder') g = `<rect x="50" y="45" width="100" height="105" class="fill" style="fill-opacity:.5;stroke:none"/>` + arcs(100, 45, 50, 14, true) + arcs(100, 150, 50, 14, false) + ln([[50, 45], [50, 150]]) + ln([[150, 45], [150, 150]]);
    else g = `<polygon class="fill" points="45,152 155,152 100,32" style="fill-opacity:.5;stroke:none"/>` + arcs(100, 152, 55, 15, false) + ln([[45, 152], [100, 32], [155, 152]]);
    return `<svg class="figure" viewBox="0 0 ${dims ? 250 : 200} 180" width="${dims ? 250 : 200}" role="img" aria-label="drawing of a ${kind === 'tprism' ? 'triangular prism' : kind === 'spyr' ? 'square pyramid' : kind === 'tpyr' ? 'triangular pyramid' : kind}">${g}</svg>`;
  }
  const SOLID_NAMES = { cube: 'cube', box: 'rectangular prism (a box)', tprism: 'triangular prism standing on one of its triangular ends', spyr: 'square pyramid', tpyr: 'triangular pyramid', cylinder: 'cylinder', cone: 'cone' };
  /** each slice: the solid, how it is cut, the shape, why; plane = [normal, offset] for the polyhedra in SOLIDS_3D */
  const SLICES = [
    { solid: 'cube', cut: 'parallel to its base', shape: 'Square', plane: [[0, 0, 1], 1], why: 'A slice parallel to the base of a prism is an exact copy of the base, and the base of a cube is a square.' },
    { solid: 'cube', cut: 'straight down, parallel to its front face', shape: 'Square', plane: [[0, 1, 0], 1], why: 'The slice is an exact copy of the front face, and every face of a cube is a square.' },
    { solid: 'cube', cut: 'straight down along a diagonal of its top face, from one corner to the opposite corner', shape: 'Rectangle', plane: [[1, -1, 0], 0], why: 'The slice is as tall as the cube but as wide as the diagonal of the top, which is longer than an edge. Its corners are right angles, so it is a rectangle that is not a square.' },
    { solid: 'cube', cut: 'through the three corners next to one of its corners, cutting that corner off', shape: 'Triangle', plane: [[1, 1, 1], 2], why: 'The cut crosses three faces and leaves one straight edge on each, so the cross-section has three sides.' },
    { solid: 'box', cut: 'parallel to its base', shape: 'Rectangle', plane: [[0, 0, 1], 1.5], why: 'A slice parallel to the base of a prism is an exact copy of the base: here an 8 cm by 5 cm rectangle.' },
    { solid: 'box', cut: 'straight down, parallel to its front face', shape: 'Rectangle', plane: [[0, 1, 0], 2.5], why: 'The slice is an exact copy of the front face: an 8 cm by 3 cm rectangle.' },
    { solid: 'tprism', cut: 'parallel to its triangular ends', shape: 'Triangle', plane: [[0, 0, 1], 2.5], why: 'A slice parallel to the bases of a prism is an exact copy of a base, and these bases are triangles.' },
    { solid: 'tprism', cut: 'straight down, parallel to one of its rectangular faces', shape: 'Rectangle', noSquare: true, plane: [[0, 1, 0], 1], why: 'The slice runs the full height of the prism with a straight top and bottom, so it has four sides meeting at right angles: a rectangle.' },
    { solid: 'spyr', cut: 'parallel to its base, halfway up', shape: 'Square', plane: [[0, 0, 1], 2], why: 'A slice parallel to the base of a pyramid has the same shape as the base, only smaller.' },
    { solid: 'spyr', cut: 'straight down through its top point, parallel to one edge of the base', shape: 'Triangle', plane: [[0, 1, 0], 0], why: 'The slice meets the base along a straight segment and rises to a single point at the top, so it has three sides.' },
    { solid: 'spyr', cut: 'straight down, parallel to one edge of the base, but missing the top point', shape: 'Trapezoid', plane: [[0, 1, 0], 1], why: 'The bottom edge lies along the base; the top edge is shorter and parallel to it, because the slice leaves the sloping faces before the top point. One pair of parallel sides: a trapezoid.' },
    { solid: 'tpyr', cut: 'parallel to its base', shape: 'Triangle', plane: [[0, 0, 1], 2], why: 'A slice parallel to the base of a pyramid has the same shape as the base, only smaller: a triangle.' },
    { solid: 'cylinder', cut: 'parallel to its base', shape: 'Circle', why: 'A slice parallel to the base of a cylinder is an exact copy of the base, a circle.' },
    { solid: 'cylinder', cut: 'straight down through the centers of both circular ends', shape: 'Rectangle', noSquare: true, why: 'The slice is as wide as the diameter and as tall as the cylinder, with straight sides: a rectangle.' },
    { solid: 'cone', cut: 'parallel to its base', shape: 'Circle', why: 'A slice parallel to the base of a cone is a smaller circle.' },
    { solid: 'cone', cut: 'straight down through its tip and the center of its base', shape: 'Triangle', why: 'The slice meets the base along a diameter and rises to the tip, so it has three sides.' },
  ];
  /** the polyhedra in coordinates: vertices and edges (pairs of vertex indices) */
  const boxSolid = (l, w, h) => { const v = []; [0, l].forEach(x => [0, w].forEach(y => [0, h].forEach(z => v.push([x, y, z])))); const e = []; v.forEach((p, i) => v.forEach((q, j) => { if (i < j && p.filter((c, k) => c !== q[k]).length === 1) e.push([i, j]); })); return { v, e }; };
  const SOLIDS_3D = {
    cube: boxSolid(2, 2, 2), box: boxSolid(8, 5, 3),
    tprism: { v: [[0, 0, 0], [4, 0, 0], [1, 3, 0], [0, 0, 5], [4, 0, 5], [1, 3, 5]], e: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]] },
    spyr: { v: [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0], [0, 0, 4]], e: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]] },
    tpyr: { v: [[0, 0, 0], [4, 0, 0], [1, 3, 0], [1.5, 1, 4]], e: [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]] },
  };
  /** slice a polyhedron with the plane n·p = c and name the polygon left behind */
  function sliceShape(solid, [n, c]) {
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => a.map((x, i) => x - b[i]);
    const pts = [], add = q => { if (!pts.some(r => Math.hypot(...sub(r, q)) < 1e-9)) pts.push(q); };
    solid.e.forEach(([i, j]) => {
      const p = solid.v[i], q = solid.v[j], f = dot(n, p) - c, g = dot(n, q) - c;
      if (Math.abs(f) < 1e-12) add(p); if (Math.abs(g) < 1e-12) add(q);
      if (f * g < 0) add(p.map((x, k) => x + (q[k] - x) * f / (f - g)));
    });
    if (pts.length < 3) return 'none';
    const mid = [0, 1, 2].map(k => pts.reduce((s, q) => s + q[k], 0) / pts.length);
    const u0 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], u = sub(u0, n.map(x => x * dot(u0, n) / dot(n, n)));
    const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
    pts.sort((a, b) => Math.atan2(dot(sub(a, mid), w), dot(sub(a, mid), u)) - Math.atan2(dot(sub(b, mid), w), dot(sub(b, mid), u)));
    if (pts.length === 3) return 'Triangle';
    if (pts.length !== 4) return ['Pentagon', 'Hexagon'][pts.length - 5] || 'many';
    const s = [0, 1, 2, 3].map(i => sub(pts[(i + 1) % 4], pts[i]));
    const par = (a, b) => { const x = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; return Math.hypot(...x) < 1e-9; };
    const pairs = (par(s[0], s[2]) ? 1 : 0) + (par(s[1], s[3]) ? 1 : 0);
    if (pairs === 1) return 'Trapezoid';
    if (pairs === 2 && Math.abs(dot(s[0], s[1])) < 1e-9) return Math.abs(Math.hypot(...s[0]) - Math.hypot(...s[1])) < 1e-9 ? 'Square' : 'Rectangle';
    return 'other';
  }
  const SHAPE_POOL = ['Square', 'Rectangle', 'Triangle', 'Trapezoid', 'Pentagon', 'Hexagon', 'Circle'];

  A.skill({
    id: 'math7.cross-sections', title: 'Cross sections of prisms and pyramids',
    learn: p('A <b>cross section</b> is the flat face you see when you slice straight through a solid. <b>A slice parallel to the base of a prism is an exact copy of the base; a slice parallel to the base of a pyramid has the base’s shape, but smaller.</b>') +
      p('Slices in other directions take other shapes. A slice straight down through a prism, parallel to a side face, is a rectangle. A slice straight down through the top point of a pyramid is a triangle; move it off the top point and the top of the triangle is cut off, leaving a trapezoid. Slicing a corner off a cube leaves a triangle.') +
      example('Example', 'A square pyramid is sliced straight down through its top point, parallel to one edge of its base. The slice crosses the base along a straight line and rises to the top point: the cross section is a <b>triangle</b>.'),
    make(rng) {
      if (rng.chance(0.3)) {
        const kind = rng.pick(['box', 'box', 'cube', 'pyramid']);
        if (kind === 'pyramid') {
          const s = 2 * rng.int(2, 10);
          return { prompt: `A square pyramid has a base ${s} cm on each side. It is sliced parallel to the base, exactly halfway up. How long is each side of the square cross section?${solidSvg('spyr')}`, type: 'number', answer: s / 2, unit: 'cm', params: { kind, s },
            hints: ['A slice parallel to the base of a pyramid is a smaller copy of the base.', 'Halfway up, the sloping faces have come halfway in from the edges toward the top point, so every length of the slice is half the base’s.', `${s} ÷ 2 = <b>${s / 2} cm</b>.`] };
        }
        const dims = kind === 'cube' ? (() => { const e = rng.int(2, 12); return [e, e, e]; })() : rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3);
        const [l, w, h] = dims, cut = rng.pick(['base', 'front', 'side']);
        const sides = { base: [l, w], front: [l, h], side: [w, h] }[cut], area = sides[0] * sides[1];
        const desc = kind === 'cube' ? `A cube has edges ${l} cm long.` : `A box is ${l} cm long, ${w} cm wide and ${h} cm tall.`;
        const how = { base: 'parallel to its base', front: 'straight down, parallel to its front face (the one that is long and tall)', side: 'straight down, parallel to its side face (the one that is wide and tall)' }[cut];
        return { prompt: `${desc} It is sliced ${how}. What is the area of the cross section?${solidSvg(kind, kind === 'box' ? dims : null)}`, type: 'number', answer: area, unit: 'cm²', params: { kind, dims, cut },
          hints: ['A slice parallel to a face of a box is an exact copy of that face.', `That face is ${sides[0]} cm by ${sides[1]} cm.`, `Area = ${sides[0]} × ${sides[1]} = <b>${area} cm²</b>.`] };
      }
      const sl = rng.pick(SLICES);
      const ban = { Square: ['Rectangle', 'Trapezoid'], Rectangle: ['Trapezoid'].concat(sl.noSquare ? ['Square'] : []) }[sl.shape] || [];
      const round = ['cylinder', 'cone'].includes(sl.solid);
      const pool = SHAPE_POOL.filter(s => s !== sl.shape && !ban.includes(s) && (round || s !== 'Circle' || rng.chance(0.3)));
      const choices = [sl.shape].concat(rng.sample(pool, 3));
      const dims = sl.solid === 'box' ? ' that is 8 cm long, 5 cm wide and 3 cm tall' : '';
      return { prompt: `A ${SOLID_NAMES[sl.solid]}${dims} is sliced ${sl.cut}. What shape is the cross section?${solidSvg(sl.solid)}`, type: 'choice', choices, answer: sl.shape, params: { kind: 'shape', solid: sl.solid, cut: sl.cut },
        hints: [`Picture the flat face left behind by the cut, and follow its edges around the solid.`, sl.why, `The cross section is a <b>${sl.shape.toLowerCase()}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'pyramid') { const up = 0.5; return Math.abs(q.answer - P.s * (1 - up)) < 1e-9; }    // a fraction `up` of the way up, the sides shrink by that fraction
      if (P.kind !== 'shape') { const [l, w, h] = P.dims, s = boxSolid(l, w, h); const plane = { base: [[0, 0, 1], h / 2], front: [[0, 1, 0], w / 2], side: [[1, 0, 0], l / 2] }[P.cut];
        // slice a real box and measure the slice: its two side lengths come from the corner points found
        const pts = []; s.e.forEach(([i, j]) => { const a = s.v[i], b = s.v[j], f = a.reduce((t, x, k) => t + x * plane[0][k], 0) - plane[1], g = b.reduce((t, x, k) => t + x * plane[0][k], 0) - plane[1]; if (f * g < 0) pts.push(a.map((x, k) => x + (b[k] - x) * f / (f - g))); });
        const span = k => Math.max(...pts.map(p => p[k])) - Math.min(...pts.map(p => p[k]));
        const sides = [0, 1, 2].map(span).filter(v => v > 1e-9);
        return pts.length === 4 && sides.length === 2 && Math.abs(q.answer - sides[0] * sides[1]) < 1e-9; }
      const sl = SLICES.find(s => s.solid === P.solid && s.cut === P.cut);
      if (!sl) return false;
      if (sl.plane) return sliceShape(SOLIDS_3D[sl.solid], sl.plane) === q.answer;       // cut the solid for real and name the polygon
      const top = 'Circle', profile = { cylinder: 'Rectangle', cone: 'Triangle' }[sl.solid];
      return q.answer === (/parallel to its base/.test(sl.cut) ? top : profile);
    },
  });


  /* ---------- sports statistics ---------- */
  A.skill({
    id: 'math7.sports-stats', title: 'Sports statistics',
    learn: p('Sports use a few kinds of numbers again and again. A <b>shooting percentage</b> is made ÷ tried × 100: 18 made out of 24 tries is 18 ÷ 24 = 0.75, or 75%.') +
      p('An <b>average per game</b> is the total ÷ the number of games, the mean. To find what a player needs next game for a new average, multiply the target average by the new number of games, then subtract the total so far.') +
      example('Example', `${big('Points in four games: 12, 15, 9 and 20. What is the average?')}The total is 12 + 15 + 9 + 20 = 56, and 56 ÷ 4 = <b>14 points per game</b>.`),
    make(rng) {
      const name = rng.pick(NAMES), kind = rng.pick(['pct', 'avg', 'need']);
      if (kind === 'pct') {
        const tries = rng.pick([20, 25, 40, 50, 16, 24, 32, 12]), pct = rng.pick([25, 50, 75, 60, 40, 80, 70, 90, 35, 65]);
        const made = tries * pct / 100;
        if (!Number.isInteger(made)) return this.make(rng);
        const what = rng.pick([['free throws', 'basketball'], ['penalty kicks', 'soccer'], ['serves in', 'volleyball'], ['shots on goal', 'hockey']]);
        return { prompt: `In ${what[1]}, ${name} made ${made} of ${tries} ${what[0]}. What percent is that?`, type: 'number', unit: '%', answer: pct, params: { kind, made, tries },
          hints: [`Divide made by tried: ${made} ÷ ${tries}.`, `${made} ÷ ${tries} = ${M.n(made / tries)}.`, `Times 100 makes it a percent: <b>${pct}%</b>.`] };
      }
      const n = rng.int(3, 5), avg = rng.int(8, 22), pts = [];
      let left = avg * n;
      for (let i = 0; i < n - 1; i++) { const v = Math.max(0, avg + rng.int(-6, 6)); pts.push(v); left -= v; }
      if (left < 0 || left > 40) return this.make(rng);
      pts.push(left);
      if (kind === 'avg') return { prompt: `${name} scored ${M.list(pts.map(String))} points in ${n} games. What is ${name}'s average number of points per game?`, type: 'number', answer: avg, params: { kind, pts },
        hints: [`Add the points: ${pts.join(' + ')} = ${avg * n}.`, `Divide by the number of games: ${avg * n} ÷ ${n}.`, `The average is <b>${avg}</b> points per game.`] };
      const target = avg + rng.int(1, 4), need = target * (n + 1) - avg * n;
      return { prompt: `${name} has scored ${M.list(pts.map(String))} points in ${n} games. How many points does ${name} need in the next game to average ${target} points per game?`, type: 'number', answer: need, params: { kind, pts, target },
        hints: [`For an average of ${target} over ${n + 1} games, the total must be ${target} × ${n + 1} = ${target * (n + 1)}.`, `So far the total is ${pts.join(' + ')} = ${avg * n}.`, `${target * (n + 1)} − ${avg * n} = <b>${need}</b> points.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'pct') return Math.abs(q.answer - P.made / P.tries * 100) < 1e-9;
      const sum = P.pts.reduce((x, y) => x + y, 0);
      if (P.kind === 'avg') return q.answer * P.pts.length === sum;
      return q.answer === P.target * (P.pts.length + 1) - sum;
    },
  });

})();
