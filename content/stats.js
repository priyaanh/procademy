/* Statistics and probability. Describing data, the normal distribution, two-variable data and regression,
   collecting data, probability rules, random variables, and the first ideas of inference (confidence intervals
   and significance tests): the scope of an introductory high school or AP-style course. Any table value a
   question needs (a normal area, a critical value) is given in the question. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const r1 = x => M.round(x, 1), r2 = x => M.round(x, 2), r3 = x => M.round(x, 3), r4 = x => M.round(x, 4);
  const XB = `${V('x')}̄`, PH = `${V('p')}̂`, MU = 'μ', SG = 'σ', H0 = 'H<sub>0</sub>', HA = 'H<sub>a</sub>';
  const sum = a => a.reduce((s, x) => s + x, 0);
  const mean = a => sum(a) / a.length;
  const sorted = a => a.slice().sort((x, y) => x - y);
  function median(a) { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; }
  /** quartiles the way a graphing calculator finds them: the medians of the lower and upper halves (the middle value left out) */
  function quartiles(a) { const s = sorted(a), h = Math.floor(s.length / 2); return [median(s.slice(0, h)), median(s), median(s.slice(s.length - h))]; }
  const sdev = (a, sample) => { const m = mean(a); return Math.sqrt(sum(a.map(x => (x - m) ** 2)) / (a.length - (sample ? 1 : 0))); };
  /** the standard normal cumulative area, accurate to about 1e-7 */
  function Phi(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }
  const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
  const binom = (n, k, pp) => choose(n, k) * pp ** k * (1 - pp) ** (n - k);
  /** the answer plus up to three distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; if (c == null) continue; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  const list = a => a.map(x => N(x)).join(', ');
  const pc = x => `${N(x)}%`;

  A.course({
    id: 'statistics', title: 'Statistics and probability', subject: 'High school', grade: 11, icon: 'Stat', hue: 70,
    blurb: 'Describing data, the normal distribution, scatterplots and regression lines, sampling and experiments, probability, random variables, and confidence intervals and significance tests.',
    units: [
      { id: 'one-variable', title: 'Exploring one-variable data', blurb: 'Center and spread, outliers, standard deviation, z-scores, and the shape of a distribution.', skills: ['stat.center-spread', 'stat.outliers', 'stat.standard-deviation', 'stat.z-scores', 'stat.distribution-shape'] },
      { id: 'normal', title: 'Normal distributions', blurb: 'The 68–95–99.7 rule, areas under the normal curve, and percentiles.', skills: ['stat.empirical-rule', 'stat.normal-probability', 'stat.inverse-normal'] },
      { id: 'two-variable', title: 'Two-variable data', blurb: 'Correlation, the least-squares regression line, residuals, and r².', skills: ['stat.correlation', 'stat.regression-line', 'stat.residuals', 'stat.r-squared'] },
      { id: 'collecting', title: 'Collecting data', blurb: 'Kinds of samples, experiments and observational studies, and bias.', skills: ['stat.sampling-methods', 'stat.study-design', 'stat.bias'] },
      { id: 'probability', title: 'Probability', blurb: 'The addition rule, conditional probability from two-way tables, and independence.', skills: ['stat.addition-rule', 'stat.conditional-probability', 'stat.independence'] },
      { id: 'random-variables', title: 'Random variables', blurb: 'Expected value, binomial and geometric probabilities, and the mean and spread of a binomial count.', skills: ['stat.expected-value', 'stat.binomial', 'stat.binomial-mean-sd', 'stat.geometric'] },
      { id: 'inference', title: 'Sampling distributions and inference', blurb: 'Standard error, confidence intervals, test statistics, P-values, and the two kinds of error.', skills: ['stat.standard-error', 'stat.confidence-interval', 'stat.test-statistic', 'stat.p-value-decision', 'stat.errors'] },
    ],
  });

  /* ---------- Unit 1: one-variable data ---------- */
  A.skill({
    id: 'stat.center-spread', title: 'Center and spread',
    learn: p(`The <b>mean</b> is the sum divided by how many values there are. The <b>median</b> is the middle value once the data are in order (the mean of the two middle values when there's an even count). The <b>range</b> is the largest minus the smallest.`) +
      p(`The <b>interquartile range (IQR)</b> is Q3 − Q1, the spread of the middle half. <b>Find Q1 and Q3 as the medians of the lower and upper halves</b>, leaving out the overall median when the count is odd (this is how graphing calculators do it).`) +
      example('Example', `Data: 3, 5, 7, 8, 12, 13, 20. Mean = 68 ÷ 7 ≈ 9.71; median = 8; range = 17; lower half 3, 5, 7 gives Q1 = 5, upper half 12, 13, 20 gives Q3 = 13, so IQR = 8.`),
    make(rng) {
      const n = rng.int(7, 11), data = Array.from({ length: n }, () => rng.int(2, 60)), kind = rng.pick(['mean', 'median', 'range', 'iqr']);
      const s = sorted(data), [q1, med, q3] = quartiles(data);
      const ans = { mean: r2(mean(data)), median: med, range: s[n - 1] - s[0], iqr: q3 - q1 }[kind];
      const what = { mean: 'mean (to the nearest hundredth)', median: 'median', range: 'range', iqr: 'interquartile range (IQR)' }[kind];
      const hints = kind === 'mean' ? [`Add the values: the sum is ${sum(data)}.`, `Divide by ${n}: ${sum(data)} ÷ ${n} ≈ <b>${N(ans)}</b>.`]
        : kind === 'range' ? [`In order: ${list(s)}.`, `Largest − smallest = ${s[n - 1]} − ${s[0]} = <b>${N(ans)}</b>.`]
          : kind === 'median' ? [`In order: ${list(s)}.`, n % 2 ? `With ${n} values, the middle one is the ${M.ordinal((n + 1) / 2)}: <b>${N(ans)}</b>.` : `With ${n} values, average the ${M.ordinal(n / 2)} and ${M.ordinal(n / 2 + 1)}: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = <b>${N(ans)}</b>.`]
            : [`In order: ${list(s)}. The lower half is ${list(s.slice(0, Math.floor(n / 2)))}, the upper half ${list(s.slice(n - Math.floor(n / 2)))}.`, `Q1 = ${N(q1)} and Q3 = ${N(q3)}, so IQR = ${N(q3)} − ${N(q1)} = <b>${N(ans)}</b>.`];
      return { prompt: `Find the ${what} of the data.${big(list(data))}`, type: 'number', answer: ans, tolerance: kind === 'mean' ? 0.01 : undefined, params: { data, kind }, hints };
    },
    verify(q) {
      const { data, kind } = q.params, s = sorted(data), n = s.length;
      // a second way: the median and quartiles by position rule (n+1)/2 on each half
      const mid = a => (a[Math.floor((a.length - 1) / 2)] + a[Math.ceil((a.length - 1) / 2)]) / 2, h = Math.floor(n / 2);
      const got = { mean: data.reduce((x, y) => x + y) / n, median: mid(s), range: Math.max(...data) - Math.min(...data), iqr: mid(s.slice(n - h)) - mid(s.slice(0, h)) }[kind];
      return near(got, q.answer, kind === 'mean' ? 0.0051 : 1e-9);
    },
  });

  A.skill({
    id: 'stat.outliers', title: 'Outliers and the 1.5 × IQR rule',
    learn: p(`A common rule calls a value an <b>outlier</b> if it is more than 1.5 × IQR below Q1 or above Q3. The cutoffs are the <b>fences</b>: <b>lower fence = Q1 − 1.5 × IQR</b> and <b>upper fence = Q3 + 1.5 × IQR</b>.`) +
      p(`Find Q1 and Q3 first (medians of the lower and upper halves), then the IQR, then the fences. Any value outside the fences is an outlier.`) +
      example('Example', `Q1 = 10 and Q3 = 18, so IQR = 8 and 1.5 × IQR = 12. The fences are 10 − 12 = −2 and 18 + 12 = 30, so a value of 34 is an outlier but 29 is not.`),
    make(rng) {
      const n = rng.int(9, 12), data = Array.from({ length: n - 1 }, () => rng.int(20, 50));
      data.push(rng.bool() ? rng.int(70, 110) : rng.int(40, 60));
      const sh = rng.shuffle(data), [q1, , q3] = quartiles(sh), iqr = q3 - q1, lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
      const kind = rng.pick(['upper', 'lower', 'count']);
      const out = sh.filter(x => x < lo || x > hi).length;
      const ans = kind === 'upper' ? hi : kind === 'lower' ? lo : out;
      const what = kind === 'upper' ? 'upper fence (Q3 + 1.5 × IQR)' : kind === 'lower' ? 'lower fence (Q1 − 1.5 × IQR)' : 'number of outliers, using the 1.5 × IQR rule';
      return { prompt: `Find the ${what} for the data.${big(list(sh))}`, type: 'number', answer: ans, params: { data: sh, kind },
        hints: [`In order: ${list(sorted(sh))}. Q1 = ${N(q1)}, Q3 = ${N(q3)}, IQR = ${N(iqr)}.`, `1.5 × IQR = ${N(1.5 * iqr)}. Fences: ${N(q1)} − ${N(1.5 * iqr)} = ${N(lo)} and ${N(q3)} + ${N(1.5 * iqr)} = ${N(hi)}.`,
          kind === 'count' ? `Values below ${N(lo)} or above ${N(hi)}: ${out ? list(sh.filter(x => x < lo || x > hi)) : 'none'}, so <b>${out}</b>.` : `The ${kind} fence is <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { data, kind } = q.params, s = sorted(data), n = s.length, h = Math.floor(n / 2);
      const md = a => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
      const q1 = md(s.slice(0, h)), q3 = md(s.slice(n - h)), lo = q1 - 1.5 * (q3 - q1), hi = q3 + 1.5 * (q3 - q1);
      return near({ upper: hi, lower: lo, count: s.filter(x => x < lo || x > hi).length }[kind], q.answer);
    },
  });

  A.skill({
    id: 'stat.standard-deviation', title: 'Standard deviation',
    learn: p(`The <b>standard deviation</b> measures the typical distance of the values from the mean. To find it: subtract the mean from each value, square those deviations, add them up, divide, and take the square root.`) +
      p(`<b>For a whole population, divide by ${V('n')} (that's ${SG}). For a sample, divide by ${V('n')} − 1 (that's ${V('s')})</b>, which makes up for a sample usually being a little less spread out than its population.`) +
      example('Example', `Sample: 4, 7, 9, 12, 13. The mean is 9; the squared deviations are 25, 4, 0, 9, 16, which add to 54. ${V('s')} = √(54 ÷ 4) ≈ <b>3.67</b>; as a population, ${SG} = √(54 ÷ 5) ≈ 3.29.`),
    make(rng) {
      const m = rng.int(8, 40), devs = rng.pick([[-5, -2, 0, 3, 4], [-4, -3, 1, 2, 4], [-6, -1, 0, 2, 5], [-3, -3, 0, 2, 4], [-7, -2, 1, 3, 5], [-4, -1, -1, 2, 4], [-8, -3, 2, 4, 5]]);
      const data = rng.shuffle(devs.map(d => m + d)), sample = rng.bool();
      const ss = sum(devs.map(d => d * d)), ans = r2(Math.sqrt(ss / (5 - (sample ? 1 : 0))));
      return { prompt: `Find the ${sample ? 'sample' : 'population'} standard deviation of the data, to the nearest hundredth.${big(list(data))}`, type: 'number', answer: ans, tolerance: 0.01, params: { data, sample },
        hints: [`The mean is ${sum(data)} ÷ 5 = ${m}.`, `The deviations are ${list(data.map(x => x - m))}; their squares add to ${ss}.`, `${sample ? `Divide by ${V('n')} − 1 = 4` : `Divide by ${V('n')} = 5`}: √(${ss} ÷ ${sample ? 4 : 5}) ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { data, sample } = q.params, n = data.length;
      // the shortcut formula: Σx² − n·mean²
      const m = data.reduce((a, b) => a + b) / n, ss = data.reduce((a, b) => a + b * b, 0) - n * m * m;
      return near(Math.sqrt(ss / (n - (sample ? 1 : 0))), q.answer, 0.0051);
    },
  });

  A.skill({
    id: 'stat.z-scores', title: 'z-scores',
    learn: p(`A <b>z-score</b> says how many standard deviations a value is from the mean: <b>${V('z')} = (${V('x')} − ${MU}) ÷ ${SG}</b>. Positive means above the mean; negative means below.`) +
      p(`z-scores let you compare values from different distributions: the one with the higher z-score is relatively higher. Working backward, <b>${V('x')} = ${MU} + ${V('z')}${SG}</b>.`) +
      example('Example', `A test has mean 72 and standard deviation 8. A score of 86 has ${V('z')} = (86 − 72) ÷ 8 = <b>1.75</b>, and ${V('z')} = −0.5 means 72 − 0.5 × 8 = 68.`),
    make(rng) {
      const kind = rng.pick(['z', 'z', 'x', 'compare']), who = rng.pick(NAMES);
      if (kind === 'compare') {
        const [n1, n2] = rng.sample(NAMES, 2), m1 = rng.int(60, 80), s1 = rng.pick([4, 5, 6, 8, 10]), m2 = rng.int(20, 35), s2 = rng.pick([2, 3, 4, 5]);
        let z1 = rng.pick([0.5, 1, 1.25, 1.5, 2, -0.5]), z2 = rng.pick([0.25, 0.75, 1.5, 1.75, 2.5, -1]);
        if (z1 === z2) z2 += 0.5;
        const x1 = m1 + z1 * s1, x2 = m2 + z2 * s2, answer = z1 > z2 ? n1 : n2;
        return { prompt: `${n1} scored ${N(x1)} on a history test (mean ${m1}, standard deviation ${s1}). ${n2} scored ${N(x2)} on a math test (mean ${m2}, standard deviation ${s2}). Who did better compared with their class?`, type: 'choice', keepOrder: true, answer, choices: [n1, n2], params: { kind, x1, m1, s1, x2, m2, s2 },
          hints: [`${n1}: ${V('z')} = (${N(x1)} − ${m1}) ÷ ${s1} = ${N(z1)}. ${n2}: ${V('z')} = (${N(x2)} − ${m2}) ÷ ${s2} = ${N(z2)}.`, `The higher z-score is relatively better: <b>${answer}</b>.`] };
      }
      const mu = rng.int(40, 120), sg = rng.int(3, 18);
      if (kind === 'z') {
        const x = mu + rng.int(-30, 30), z = r2((x - mu) / sg);
        return { prompt: `A set of scores has mean ${mu} and standard deviation ${sg}. What is the z-score of ${who}'s score of ${x}, to the nearest hundredth?`, type: 'number', answer: z, tolerance: 0.01, params: { kind, x, mu, sg },
          hints: [`${V('z')} = (${V('x')} − ${MU}) ÷ ${SG} = (${x} − ${mu}) ÷ ${sg}.`, `${N(x - mu)} ÷ ${sg} ≈ <b>${N(z)}</b>.`] };
      }
      const z = rng.pick([-2.5, -2, -1.5, -1.25, -1, -0.75, -0.5, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5]), x = mu + z * sg;
      return { prompt: `A set of scores has mean ${mu} and standard deviation ${sg}. Which score has a z-score of ${N(z)}?`, type: 'number', answer: x, params: { kind, z, mu, sg },
        hints: [`${V('x')} = ${MU} + ${V('z')}${SG} = ${mu} + (${N(z)})(${sg}).`, `= ${mu} ${z < 0 ? '−' : '+'} ${N(Math.abs(z * sg))} = <b>${N(x)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'z') return near((P.x - P.mu) / P.sg, q.answer, 0.0051);
      if (P.kind === 'x') return near((q.answer - P.mu) / P.sg, P.z, 1e-9);
      return q.answer === ((P.x1 - P.m1) / P.s1 > (P.x2 - P.m2) / P.s2 ? q.choices[0] : q.choices[1]);
    },
  });

  const SHAPES = ['Skewed left', 'Roughly symmetric', 'Skewed right'], MEANMED = ['The mean is less than the median', 'The mean is about equal to the median', 'The mean is greater than the median'];
  function histPic(counts, lo, w) {
    const W = 320, H = 170, L = 30, B = 26, bw = (W - L - 10) / counts.length, top = Math.max(...counts);
    const py = c => H - B - c / top * (H - B - 12);
    let g = '';
    for (let c = 0; c <= top; c += Math.max(1, Math.ceil(top / 5))) g += `<line class="light" x1="${L}" y1="${py(c)}" x2="${W - 10}" y2="${py(c)}" stroke-width="1"/><text x="${L - 5}" y="${py(c) + 4}" font-size="10" text-anchor="end">${c}</text>`;
    counts.forEach((c, i) => { g += `<rect class="fill" x="${(L + i * bw).toFixed(1)}" y="${py(c).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - B - py(c)).toFixed(1)}"/>`; });
    for (let i = 0; i <= counts.length; i += 2) g += `<text x="${(L + i * bw).toFixed(1)}" y="${H - 10}" font-size="10" text-anchor="middle">${lo + i * w}</text>`;
    g += `<line class="stroke" x1="${L}" y1="${H - B}" x2="${W - 10}" y2="${H - B}" stroke-width="1.4"/>`;
    return `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="histogram">${g}</svg>`;
  }
  A.skill({
    id: 'stat.distribution-shape', title: 'The shape of a distribution',
    learn: p(`A distribution is <b>skewed right</b> when it has a long tail stretching to the right (toward larger values), <b>skewed left</b> when the long tail stretches left, and <b>roughly symmetric</b> when the two sides look like mirror images.`) +
      p(`<b>The mean gets pulled toward the tail; the median doesn't.</b> So in a right-skewed distribution the mean is greater than the median, in a left-skewed one it's less, and in a symmetric one they're about equal. That's why the median is the better center for skewed data.`) +
      example('Example', `Household incomes have a few very large values: a long tail to the right. They're skewed right, and the mean income is higher than the median income.`),
    make(rng) {
      const s = rng.int(0, 2), k = 9;
      // a symmetric one is an exact mirror image; a skewed one has a long tail on one side
      const half = [1, 3, 6, 10].map(c => Math.max(1, c + rng.int(-1, 1)));
      let counts = s === 1 ? half.concat([12 + rng.int(-1, 1)], half.slice().reverse()) : [12, 15, 11, 7, 5, 3, 2, 1, 1].map(c => Math.max(1, c + rng.int(-1, 1)));
      if (s === 0) counts = counts.reverse();
      const lo = rng.pick([0, 10, 20, 40, 100]), w = rng.pick([2, 5, 10]);
      const ask = rng.bool() ? 'shape' : 'center', set = ask === 'shape' ? SHAPES : MEANMED, answer = set[s];
      const mids = counts.flatMap((c, i) => Array(c).fill(lo + (i + 0.5) * w));
      return { prompt: `${ask === 'shape' ? 'How would you describe the shape of this distribution?' : 'How do the mean and median of these data compare?'}${histPic(counts, lo, w)}`, type: 'choice', keepOrder: true, answer, choices: set.slice(), params: { counts, lo, w, ask },
        hints: [s === 1 ? 'The bars rise to a peak in the middle and fall away evenly on both sides.' : `The tallest bars are on the ${s === 2 ? 'left' : 'right'}, with a long, low tail stretching to the ${s === 2 ? 'right' : 'left'}.`,
          ask === 'shape' ? `So it is <b>${answer.toLowerCase()}</b>.` : `${s === 1 ? 'In a symmetric distribution the mean and median are close' : `The mean is pulled toward the tail on the ${s === 2 ? 'right' : 'left'}`}: <b>${answer.toLowerCase()}</b>.`], meta: { mean: mean(mids), median: median(mids) } };
    },
    verify(q) {
      const { counts, lo, w, ask } = q.params, mids = counts.flatMap((c, i) => Array(c).fill(lo + (i + 0.5) * w)), m = mean(mids), md = median(mids), sd = sdev(mids);
      const skew = sum(mids.map(x => ((x - m) / sd) ** 3)) / mids.length;
      const s = skew > 0.4 ? 2 : skew < -0.4 ? 0 : Math.abs(skew) < 0.2 ? 1 : -1;
      if (s < 0) return 'unclear skew';
      return q.answer === (ask === 'shape' ? SHAPES : MEANMED)[s];
    },
  });

  /* ---------- Unit 2: normal distributions ---------- */
  const BANDS = [0.15, 2.35, 13.5, 34, 34, 13.5, 2.35, 0.15];         // percent in each band, from below −3σ to above 3σ
  A.skill({
    id: 'stat.empirical-rule', title: 'The 68–95–99.7 rule',
    learn: p(`In a normal distribution, about <b>68% of values lie within 1 standard deviation of the mean, 95% within 2, and 99.7% within 3</b>. The curve is symmetric, so each of those is split evenly on both sides of the mean.`) +
      p(`That gives the pieces: 34% between the mean and 1 SD on either side, 13.5% between 1 and 2 SD, 2.35% between 2 and 3 SD, and 0.15% beyond 3 SD. Add the pieces you need.`) +
      example('Example', `Heights are normal with mean 64 in. and SD 3 in. The percent between 61 and 70 in. is from −1 to +2 SD: 34 + 34 + 13.5 = <b>81.5%</b>.`),
    make(rng) {
      const mu = rng.int(20, 120), sg = rng.int(2, 15);
      let a = rng.int(-4, 3), b = rng.int(a + 1, 4);
      if (a === -4 && b === 4) b = 3;
      const lab = k => k === -4 ? null : k === 4 ? null : mu + k * sg;
      const pct = r2(sum(BANDS.slice(a + 4, b + 4)));
      const desc = a === -4 ? `below ${N(lab(b))}` : b === 4 ? `above ${N(lab(a))}` : `between ${N(lab(a))} and ${N(lab(b))}`;
      const ctx = rng.pick(['Test scores', 'Battery lives (in hours)', 'Heights of a kind of plant (in cm)', 'Commute times (in minutes)']);
      return { prompt: `${ctx} are normally distributed with mean ${mu} and standard deviation ${sg}. About what percent of them are ${desc}?`, type: 'number', answer: pct, params: { mu, sg, a, b },
        hints: [`In standard deviations, that's ${a === -4 ? `below ${b >= 0 ? '+' : ''}${N(b)} SD` : b === 4 ? `above ${a >= 0 ? '+' : ''}${N(a)} SD` : `from ${a >= 0 ? '+' : ''}${N(a)} to ${b >= 0 ? '+' : ''}${N(b)} SD`}.`,
          `Add the pieces: ${BANDS.slice(a + 4, b + 4).map(N).join(' + ')} = <b>${pc(pct)}</b>.`] };
    },
    verify(q) {
      // the rule's rounded figures against the true normal areas, within the rule's own rounding
      const { a, b } = q.params, lo = a === -4 ? -Infinity : a, hi = b === 4 ? Infinity : b;
      const exact = 100 * ((hi === Infinity ? 1 : Phi(hi)) - (lo === -Infinity ? 0 : Phi(lo)));
      return near(exact, q.answer, 0.9);
    },
  });

  A.skill({
    id: 'stat.normal-probability', title: 'Areas under the normal curve',
    learn: p(`To find a probability for a normal distribution, <b>change each value to a z-score, then use the area to the left of that z</b> (from a z-table or a calculator).`) +
      p(`P(${V('X')} &lt; ${V('a')}) is the area to the left of its z. P(${V('X')} &gt; ${V('a')}) is 1 minus that. P(${V('a')} &lt; ${V('X')} &lt; ${V('b')}) is the area to the left of ${V('b')}'s z minus the area to the left of ${V('a')}'s z.`) +
      example('Example', `Mean 50, SD 8. P(${V('X')} &gt; 60): ${V('z')} = (60 − 50) ÷ 8 = 1.25, and the area to the left of 1.25 is 0.8944, so the answer is 1 − 0.8944 = <b>0.1056</b>.`),
    make(rng) {
      const mu = rng.int(30, 120), sg = rng.pick([4, 8, 12, 16, 20]);
      const zs = [-2, -1.75, -1.5, -1.25, -1, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const kind = rng.pick(['less', 'more', 'between']);
      const [z1, z2] = kind === 'between' ? rng.sample(zs, 2).sort((x, y) => x - y) : [rng.pick(zs), null];
      const t1 = r4(Phi(z1)), t2 = z2 == null ? null : r4(Phi(z2));
      const a = mu + z1 * sg, b = z2 == null ? null : mu + z2 * sg;
      const ans = r4(kind === 'less' ? t1 : kind === 'more' ? 1 - t1 : t2 - t1);
      const use = `Use: the area to the left of ${V('z')} = ${N(z1)} is ${t1.toFixed(4)}${z2 == null ? '' : `, and to the left of ${V('z')} = ${N(z2)} it is ${t2.toFixed(4)}`}.`;
      const ask = kind === 'less' ? `less than ${N(a)}` : kind === 'more' ? `greater than ${N(a)}` : `between ${N(a)} and ${N(b)}`;
      return { prompt: `${V('X')} is normally distributed with mean ${mu} and standard deviation ${sg}. Find the probability that ${V('X')} is ${ask}. Give 4 decimal places.${big(use)}`, type: 'number', answer: ans, tolerance: 0.0006, params: { mu, sg, kind, a, b },
        hints: [kind === 'between' ? `z-scores: (${N(a)} − ${mu}) ÷ ${sg} = ${N(z1)} and (${N(b)} − ${mu}) ÷ ${sg} = ${N(z2)}.` : `${V('z')} = (${N(a)} − ${mu}) ÷ ${sg} = ${N(z1)}.`,
          kind === 'less' ? `The probability is the area to the left: <b>${ans.toFixed(4)}</b>.` : kind === 'more' ? `Greater than means the area to the right: 1 − ${t1.toFixed(4)} = <b>${ans.toFixed(4)}</b>.` : `Subtract the left areas: ${t2.toFixed(4)} − ${t1.toFixed(4)} = <b>${ans.toFixed(4)}</b>.`] };
    },
    verify(q) {
      // integrate the normal density numerically instead of using Phi
      const { mu, sg, kind, a, b } = q.params, f = x => Math.exp(-(((x - mu) / sg) ** 2) / 2) / (sg * Math.sqrt(2 * Math.PI));
      const simp = (lo, hi) => { const n = 4000, h = (hi - lo) / n; let s = f(lo) + f(hi); for (let i = 1; i < n; i++) s += f(lo + i * h) * (i % 2 ? 4 : 2); return s * h / 3; };
      const lo = mu - 10 * sg, hi = mu + 10 * sg;
      const got = kind === 'less' ? simp(lo, a) : kind === 'more' ? simp(a, hi) : simp(a, b);
      return near(got, q.answer, 0.0006);
    },
  });

  const PCT = [[5, -1.645], [10, -1.28], [20, -0.84], [25, -0.67], [30, -0.52], [40, -0.25], [60, 0.25], [70, 0.52], [75, 0.67], [80, 0.84], [90, 1.28], [95, 1.645], [99, 2.33]];
  A.skill({
    id: 'stat.inverse-normal', title: 'Percentiles of a normal distribution',
    learn: p(`The <b>${V('k')}th percentile</b> is the value with ${V('k')}% of the distribution below it. To find it, look up the z-score with that area to its left, then turn the z-score back into a value: <b>${V('x')} = ${MU} + ${V('z')}${SG}</b>.`) +
      p(`Percentiles below the 50th have negative z-scores, so they land below the mean. The "top 10%" starts at the 90th percentile.`) +
      example('Example', `IQ scores have mean 100 and SD 15. The 90th percentile has ${V('z')} ≈ 1.28, so it is 100 + 1.28 × 15 = <b>119.2</b>.`),
    make(rng) {
      const [pct, z] = rng.pick(PCT), mu = rng.int(40, 600), sg = rng.int(4, 90), top = pct > 50 && rng.chance(0.3);
      const ans = r2(mu + z * sg);
      const ctx = rng.pick(['scores on a placement test', 'the weights of packages, in grams,', 'the lengths of phone calls, in seconds,', 'the times to finish a race, in seconds,']);
      const ask = top ? `the cutoff for the top ${100 - pct}%` : `the ${M.ordinal(pct)} percentile`;
      return { prompt: `Suppose ${ctx} are normally distributed with mean ${mu} and standard deviation ${sg}. Find ${ask}, to the nearest hundredth.${big(`Use: the z-score with ${pct}% of the area to its left is ${N(z)}.`)}`, type: 'number', answer: ans, tolerance: Math.max(0.02, Math.abs(ans) * 0.002), params: { mu, sg, pct, z },
        hints: [top ? `The top ${100 - pct}% starts where ${pct}% is below: the ${M.ordinal(pct)} percentile, with ${V('z')} = ${N(z)}.` : `The ${M.ordinal(pct)} percentile has ${V('z')} = ${N(z)}.`, `${V('x')} = ${mu} + (${N(z)})(${sg}) = <b>${N(ans)}</b>.`] };
    },
    verify(q) { const { mu, sg, pct } = q.params; return near(100 * Phi((q.answer - mu) / sg), pct, 0.25); },          // table z-values are rounded to 2 places
  });

  /* ---------- Unit 3: two-variable data ---------- */
  const RS = [-0.95, -0.7, -0.3, 0, 0.3, 0.7, 0.95];
  const corr = (xs, ys) => { const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; }); return sxy / Math.sqrt(sxx * syy); };
  function scatterPic(xs, ys) {
    const W = 260, H = 200, L = 24, B = 22, lx = Math.min(...xs), hx = Math.max(...xs), ly = Math.min(...ys), hy = Math.max(...ys);
    const px = x => L + 8 + (x - lx) / (hx - lx || 1) * (W - L - 24), py = y => H - B - 8 - (y - ly) / (hy - ly || 1) * (H - B - 24);
    let g = `<line class="stroke" x1="${L}" y1="${H - B}" x2="${W - 6}" y2="${H - B}" stroke-width="1.4"/><line class="stroke" x1="${L}" y1="8" x2="${L}" y2="${H - B}" stroke-width="1.4"/>`;
    g += `<text x="${W - 10}" y="${H - 6}" font-size="12" text-anchor="end" font-style="italic">x</text><text x="${L - 8}" y="16" font-size="12" font-style="italic">y</text>`;
    xs.forEach((x, i) => { g += `<circle cx="${px(x).toFixed(1)}" cy="${py(ys[i]).toFixed(1)}" r="4" fill="var(--primary)"/>`; });
    return `<svg class="figure" viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="scatterplot">${g}</svg>`;
  }
  A.skill({
    id: 'stat.correlation', title: 'Correlation',
    learn: p(`The <b>correlation ${V('r')}</b> measures how strongly two variables follow a straight line. It is always between −1 and 1. <b>The sign gives the direction</b> (positive: up to the right; negative: down to the right), and <b>the size gives the strength</b>: near ±1 the points hug a line, near 0 there's no linear pattern.`) +
      p(`Correlation only describes straight-line patterns, it isn't changed by switching ${V('x')} and ${V('y')} or by changing units, and it does not show that one variable causes the other.`) +
      example('Example', `A tight cloud of points rising from left to right has ${V('r')} near 0.95. A loose cloud falling to the right might have ${V('r')} = −0.3.`),
    make(rng) {
      const target = rng.pick(RS), n = 22, xs = [], ys = [];
      const gauss = () => { const u = Math.max(1e-9, rng.next()), v = rng.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      for (let i = 0; i < n; i++) { const zx = gauss(), e = gauss(); xs.push(M.round(10 + 3 * zx, 2)); ys.push(M.round(20 + 5 * (target * zx + Math.sqrt(1 - target * target) * e), 2)); }
      const r = corr(xs, ys);
      const answer = `${V('r')} = ${N(RS.reduce((b, c) => Math.abs(c - r) < Math.abs(b - r) ? c : b))}`;
      const far = RS.filter(c => Math.abs(c - r) > 0.32).map(c => `${V('r')} = ${N(c)}`);
      return { prompt: `Which value is closest to the correlation for this scatterplot?${scatterPic(xs, ys)}`, type: 'choice', answer, choices: options(answer, rng.shuffle(far)), params: { xs, ys },
        hints: [`Direction: the points ${r > 0.15 ? 'rise' : r < -0.15 ? 'fall' : "don't clearly rise or fall"} from left to right${Math.abs(r) > 0.15 ? `, so ${V('r')} is ${r > 0 ? 'positive' : 'negative'}` : ''}.`,
          `Strength: the points ${Math.abs(r) > 0.85 ? 'lie close to a line' : Math.abs(r) > 0.5 ? 'follow a line loosely' : 'barely follow a line'}. So <b>${answer}</b>.`] };
    },
    verify(q) {
      const r = corr(q.params.xs, q.params.ys), vals = q.choices.map(c => Number(A.stripTags(c).replace(/[^0-9.−-]/g, '').replace('−', '-')));
      const best = vals.reduce((b, v, i) => Math.abs(v - r) < Math.abs(vals[b] - r) ? i : b, 0);
      return q.choices[best] === q.answer && vals.filter((v, i) => i !== best).every(v => Math.abs(v - r) > 0.3);
    },
  });

  A.skill({
    id: 'stat.regression-line', title: 'The least-squares regression line',
    learn: p(`The least-squares regression line ${V('ŷ')} = ${V('a')} + ${V('b')}${V('x')} is the line that makes the squared vertical distances to the points as small as possible. From summary statistics: <b>slope ${V('b')} = ${V('r')} · ${V('s')}<sub>${V('y')}</sub> ÷ ${V('s')}<sub>${V('x')}</sub></b>, and the line always passes through (${XB}, ${V('ȳ')}), so <b>${V('a')} = ${V('ȳ')} − ${V('b')}${XB}</b>.`) +
      p(`The slope is the predicted change in ${V('y')} for each 1-unit increase in ${V('x')}. To predict, put an ${V('x')}-value into the equation.`) +
      example('Example', `${XB} = 10, ${V('ȳ')} = 50, ${V('s')}<sub>${V('x')}</sub> = 4, ${V('s')}<sub>${V('y')}</sub> = 12, ${V('r')} = 0.75. Slope = 0.75 × 12 ÷ 4 = 2.25; intercept = 50 − 2.25 × 10 = 27.5.`),
    make(rng) {
      const r = rng.pick([0.4, 0.5, 0.6, 0.75, 0.8, -0.5, -0.6, -0.8]), sx = rng.pick([2, 4, 5, 10]), sy = rng.pick([3, 6, 10, 12, 15, 20]);
      const xb = rng.int(5, 40), yb = rng.int(20, 200), b = r * sy / sx, a = yb - b * xb, kind = rng.pick(['slope', 'intercept', 'predict']);
      const x0 = xb + rng.int(-8, 8), ans = r2(kind === 'slope' ? b : kind === 'intercept' ? a : a + b * x0);
      const ctx = rng.pick([['hours studied', 'test score'], ['temperature (°F)', 'drinks sold'], ['age of a car (years)', 'price (hundreds of dollars)'], ['arm span (cm)', 'height (cm)']]);
      const stats = `${XB} = ${xb}, ${V('s')}<sub>${V('x')}</sub> = ${sx}, ${V('ȳ')} = ${yb}, ${V('s')}<sub>${V('y')}</sub> = ${sy}, ${V('r')} = ${N(r)}`;
      const what = kind === 'slope' ? 'the slope of the least-squares regression line' : kind === 'intercept' ? 'the y-intercept of the least-squares regression line' : `the predicted ${ctx[1]} when the ${ctx[0]} is ${x0}`;
      return { prompt: `For ${ctx[0]} (${V('x')}) and ${ctx[1]} (${V('y')}): ${stats}. Find ${what}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { r, sx, sy, xb, yb, kind, x0 },
        hints: [`Slope ${V('b')} = ${V('r')} · ${V('s')}<sub>${V('y')}</sub> ÷ ${V('s')}<sub>${V('x')}</sub> = ${N(r)} × ${sy} ÷ ${sx} = ${N(b)}.`,
          `Intercept ${V('a')} = ${V('ȳ')} − ${V('b')}${XB} = ${yb} − (${N(b)})(${xb}) = ${N(r2(a))}.`,
          kind === 'slope' ? `The slope is <b>${N(ans)}</b>.` : kind === 'intercept' ? `The y-intercept is <b>${N(ans)}</b>.` : `${V('ŷ')} = ${N(r2(a))} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))}(${x0}) = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      // build points with exactly these statistics and fit them directly
      const { r, sx, sy, xb, yb, kind, x0 } = q.params, n = 400, xs = [], ys = [];
      for (let i = 0; i < n; i++) { const u = Math.cos(2 * Math.PI * i / n), w = Math.sin(2 * Math.PI * i / n); xs.push(xb + sx * Math.SQRT2 * u); ys.push(yb + sy * Math.SQRT2 * (r * u + Math.sqrt(1 - r * r) * w)); }
      const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0; xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; });
      const b = sxy / sxx, a = my - b * mx;
      return near({ slope: b, intercept: a, predict: a + b * x0 }[kind], q.answer, 0.0051);
    },
  });

  A.skill({
    id: 'stat.residuals', title: 'Residuals',
    learn: p(`A <b>residual</b> is how far a data point is from the regression line, measured up and down: <b>residual = actual ${V('y')} − predicted ${V('ŷ')}</b>.`) +
      p(`A positive residual means the point is above the line (the line underestimated it); a negative residual means it's below the line (an overestimate). A good linear model leaves residuals scattered randomly around 0.`) +
      example('Example', `The line is ${V('ŷ')} = 12.5 + 3.2${V('x')}. For the point (6, 34): ${V('ŷ')} = 12.5 + 19.2 = 31.7, so the residual is 34 − 31.7 = <b>2.3</b>, above the line.`),
    make(rng) {
      const a = r1(rng.int(-200, 400) / 10), b = r1(rng.pick([-1, 1]) * rng.int(5, 60) / 10), x = rng.int(1, 30), yh = a + b * x, y = r1(yh + rng.nz(-80, 80) / 10);
      const res = r2(y - yh), kind = rng.bool() ? 'value' : 'side';
      const eq = `${V('ŷ')} = ${N(a)} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))}${V('x')}`;
      if (kind === 'side') {
        const answer = res > 0 ? 'Above the line: the line underestimates it' : 'Below the line: the line overestimates it';
        return { prompt: `The regression line is ${eq}. Where is the data point (${x}, ${N(y)}), and what does that mean?`, type: 'choice', keepOrder: true, answer, choices: ['Above the line: the line underestimates it', 'Below the line: the line overestimates it'], params: { a, b, x, y, kind },
          hints: [`Predicted: ${V('ŷ')} = ${N(a)} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))}(${x}) = ${N(r2(yh))}.`, `Residual = ${N(y)} − ${yh < 0 ? `(${N(r2(yh))})` : N(r2(yh))} = ${N(res)}, which is ${res > 0 ? 'positive' : 'negative'}: <b>${answer.toLowerCase()}</b>.`] };
      }
      return { prompt: `The regression line is ${eq}. Find the residual for the data point (${x}, ${N(y)}), to the nearest hundredth.`, type: 'number', answer: res, tolerance: 0.01, params: { a, b, x, y, kind },
        hints: [`Predicted: ${V('ŷ')} = ${N(a)} ${b < 0 ? '−' : '+'} ${N(Math.abs(b))}(${x}) = ${N(r2(yh))}.`, `Residual = actual − predicted = ${N(y)} − ${yh < 0 ? `(${N(r2(yh))})` : N(r2(yh))} = <b>${N(res)}</b>.`] };
    },
    verify(q) {
      const { a, b, x, y, kind } = q.params, res = y - (b * x + a);
      return kind === 'value' ? near(res, q.answer, 0.0051) : q.answer.startsWith(res > 0 ? 'Above' : 'Below') && Math.abs(res) > 1e-9;
    },
  });

  A.skill({
    id: 'stat.r-squared', title: 'The coefficient of determination r²',
    learn: p(`<b>${V('r')}² is the fraction of the variation in ${V('y')} that the regression line explains</b> using ${V('x')}. As a percent: "${V('r')}² = 0.64 means 64% of the variation in ${V('y')} is explained by the linear relationship with ${V('x')}."`) +
      p(`To get ${V('r')} back from ${V('r')}², take the square root and <b>give it the sign of the slope</b>: a downward trend means ${V('r')} is negative.`) +
      example('Example', `${V('r')} = −0.8 gives ${V('r')}² = 0.64: 64% of the variation explained. If ${V('r')}² = 0.49 and the slope is negative, ${V('r')} = −0.7.`),
    make(rng) {
      if (rng.bool()) {
        const r = rng.pick([-0.95, -0.9, -0.8, -0.75, -0.6, -0.45, 0.35, 0.5, 0.65, 0.7, 0.85, 0.9, 0.98]), ans = r1(r * r * 100);
        return { prompt: `A regression of ${rng.pick(['sales on advertising spending', 'plant height on hours of sunlight', 'fuel use on car weight', 'reaction time on hours of sleep'])} has ${V('r')} = ${N(r)}. What percent of the variation in ${V('y')} is explained by the line? Round to the nearest tenth of a percent.`, type: 'number', answer: ans, tolerance: 0.05, params: { kind: 'pct', r },
          hints: [`${V('r')}² = (${N(r)})² = ${N(r4(r * r))}.`, `As a percent: <b>${pc(ans)}</b>.`] };
      }
      const r = rng.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) * rng.pick([1, -1]), r2v = r2(r * r);
      return { prompt: `A regression line has a ${r < 0 ? 'negative' : 'positive'} slope and ${V('r')}² = ${N(r2v)}. What is ${V('r')}?`, type: 'number', answer: r, params: { kind: 'r', r2v, neg: r < 0 },
        hints: [`√${N(r2v)} = ${N(Math.abs(r))}.`, `The slope is ${r < 0 ? 'negative' : 'positive'}, so ${V('r')} = <b>${N(r)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'pct') return near(100 * P.r * P.r, q.answer, 0.051);
      return near(q.answer * q.answer, P.r2v, 1e-9) && (q.answer < 0) === P.neg;
    },
  });

  /* ---------- Unit 4: collecting data ---------- */
  const METHODS = ['Simple random sample', 'Stratified random sample', 'Cluster sample', 'Systematic random sample', 'Convenience sample', 'Voluntary response sample'];
  const CTX = [
    { org: 'A principal', pop: 'students', one: 'student', strata: 'grade', clusters: 'homerooms', place: 'the cafeteria doors', list: 'the alphabetical list of students' },
    { org: 'A city council', pop: 'residents', one: 'resident', strata: 'neighborhood', clusters: 'city blocks', place: 'the main library', list: 'the list of registered voters' },
    { org: 'A company', pop: 'employees', one: 'employee', strata: 'department', clusters: 'office floors', place: 'the front entrance', list: 'the payroll list' },
    { org: 'A gym', pop: 'members', one: 'member', strata: 'membership type', clusters: 'fitness classes', place: 'the front desk', list: 'the membership list' },
  ];
  const DO = [
    c => `gives every ${c.one} a number and uses a random number generator to choose 60 of them`,
    c => `splits the ${c.pop} by ${c.strata} and randomly chooses 15 from each ${c.strata}`,
    c => `randomly chooses 4 of the ${c.clusters} and asks every one of the ${c.pop} in them`,
    c => `picks a random starting name near the top of ${c.list}, then every 20th name after it`,
    c => `asks the first 60 ${c.pop} who walk past ${c.place}`,
    c => `posts a link to the survey online and counts whichever ${c.pop} choose to answer`,
  ];
  A.skill({
    id: 'stat.sampling-methods', title: 'Kinds of samples',
    learn: p(`A <b>simple random sample</b> gives every group of the chosen size the same chance. A <b>stratified</b> sample splits the population into similar groups (strata) and takes a random sample from <b>each</b>. A <b>cluster</b> sample randomly picks a few groups (clusters) and takes <b>everyone</b> in them. A <b>systematic</b> sample takes every ${V('k')}th one from a list after a random start.`) +
      p(`Two methods aren't random and usually give biased results: a <b>convenience sample</b> takes whoever is easy to reach, and a <b>voluntary response sample</b> lets people choose to answer (people with strong opinions answer most).`) +
      example('Example', `Randomly choosing 3 classrooms and surveying every student in them is a cluster sample. Choosing 10 random students from each classroom would be stratified.`),
    make(rng) {
      const c = rng.pick(CTX), m = rng.int(0, 5), answer = METHODS[m];
      return { prompt: `${c.org} wants to know what its ${c.pop} think about a new plan. It ${DO[m](c)}. What kind of sample is this?`, type: 'choice', answer, choices: options(answer, rng.shuffle(METHODS)), params: { m },
        hints: [m === 1 ? `It samples randomly within every ${c.strata}.` : m === 2 ? `It picks whole groups at random and takes everyone in them.` : m === 3 ? 'After a random start, it takes every 20th one.' : m === 4 ? 'It takes whoever is easiest to reach.' : m === 5 ? 'People decide for themselves whether to answer.' : `Every ${c.one} has the same chance, and so does every group of 60.`, `This is a <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) { return q.answer === METHODS[q.params.m] && q.prompt.includes(DO[q.params.m](CTX.find(c => q.prompt.startsWith(c.org)))); },
  });

  const STUDIES = {
    exp: ['Researchers randomly assign 120 volunteers to drink either green tea or water every day for a month, then compare their blood pressure.',
      'A teacher randomly assigns half of her students to study with flashcards and half with practice tests, then compares their quiz scores.',
      'A farmer randomly assigns 40 plots to get a new fertilizer or the old one, then compares the harvests.',
      'A website randomly shows half of its visitors a blue button and half a green one, then compares how many click.'],
    obs: ['Researchers survey 500 adults about how much coffee they drink and compare their heart health.',
      'A school compares the grades of students who chose to join the chess club with those who did not.',
      'A doctor looks through records of patients who exercise often and patients who don\'t, and compares their sleep.',
      'A store compares how much is spent by customers who signed up for its app and by customers who didn\'t.'],
  };
  const DESIGN = ['Experiment; it can show cause and effect', 'Observational study; it can show only an association', 'Experiment; it can show only an association', 'Observational study; it can show cause and effect'];
  A.skill({
    id: 'stat.study-design', title: 'Experiments and observational studies',
    learn: p(`In an <b>experiment</b>, the researchers <b>assign</b> the treatments, ideally at random. In an <b>observational study</b>, they only watch or measure; the subjects (or circumstances) decide who is in which group.`) +
      p(`<b>Only a randomized experiment can show cause and effect</b>, because random assignment makes the groups alike in everything except the treatment. An observational study can show an association, but a lurking variable might explain it.`) +
      example('Example', `Comparing students who chose to take music lessons with those who didn't is observational: maybe students with more free time do both, so it can't show that lessons cause better grades.`),
    make(rng) {
      const exp = rng.bool(), text = rng.pick(exp ? STUDIES.exp : STUDIES.obs), answer = DESIGN[exp ? 0 : 1];
      return { prompt: `${text} What kind of study is this, and what can it show?`, type: 'choice', answer, choices: DESIGN.slice(), params: { exp, text },
        hints: [exp ? 'The researchers assigned the treatments at random.' : 'Nobody was assigned to a group: the subjects or their circumstances decided.', `So it is <b>${answer.charAt(0).toLowerCase() + answer.slice(1)}</b>.`] };
    },
    verify(q) { return STUDIES[q.params.exp ? 'exp' : 'obs'].includes(q.params.text) && q.answer === DESIGN[q.params.exp ? 0 : 1] && /random/.test(q.params.text) === q.params.exp; },
  });

  const BIAS = ['Undercoverage', 'Nonresponse', 'Response bias', 'Voluntary response bias'];
  const BIAS_EX = [
    ['A poll about internet use is done only by calling landline phones.', 'A survey about city parks interviews people only in the wealthiest neighborhood.', 'A survey of shoppers about a mall is done only on weekday mornings, when most people are at work or school.'],
    ['A survey is mailed to 1,000 homes, but only 120 are sent back.', 'A pollster calls during dinner, and most of the people chosen hang up before answering.', 'Out of 300 randomly chosen students, only 40 fill out the online survey they were sent.'],
    ['The question asks, "Don\'t you agree that the park needs to be cleaner?"', 'Students are asked, in front of their teacher, how much time they really spend on homework.', 'A dentist asks patients in person how often they really floss.'],
    ['A radio host asks listeners to call in and say whether they like the new stadium.', 'A news website asks visitors to vote in an online poll about the new law.', 'A TV show invites viewers to text in their opinion of the finale.'],
  ];
  A.skill({
    id: 'stat.bias', title: 'Bias in surveys',
    learn: p(`<b>Undercoverage</b>: some groups in the population have little or no chance to be chosen. <b>Nonresponse</b>: people who were chosen can't be reached or refuse to answer. <b>Response bias</b>: the wording, the setting or the interviewer pushes people toward certain answers, or they don't answer truthfully.`) +
      p(`<b>Voluntary response bias</b>: people choose themselves to take part, and those with strong (often negative) opinions answer most. A bigger sample doesn't fix any of these; only a better design does.`) +
      example('Example', `Asking "Do you support the unfair new parking fee?" is response bias: the word "unfair" leads people to say no.`),
    make(rng) {
      const b = rng.int(0, 3), text = rng.pick(BIAS_EX[b]), answer = BIAS[b];
      return { prompt: `${text} What is the main kind of bias here?`, type: 'choice', keepOrder: true, answer, choices: BIAS.slice(), params: { b, text },
        hints: [['Who could never be chosen?', 'Were the chosen people able and willing to answer?', 'Is something pushing people toward an answer?', 'Did people choose themselves to answer?'][b], `This is <b>${answer.toLowerCase()}</b>.`] };
    },
    verify(q) { return BIAS_EX[q.params.b].includes(q.params.text) && q.answer === BIAS[q.params.b]; },
  });

  /* ---------- Unit 5: probability ---------- */
  A.skill({
    id: 'stat.addition-rule', title: 'The addition rule',
    learn: p(`<b>P(A or B) = P(A) + P(B) − P(A and B).</b> You subtract the overlap because adding P(A) and P(B) counts the outcomes in both events twice.`) +
      p(`If A and B are <b>mutually exclusive</b> (they can't happen together), P(A and B) = 0 and the rule is just P(A) + P(B). The rule also works backward to find the overlap.`) +
      example('Example', `40% of students play a sport, 30% play an instrument, and 12% do both. P(sport or instrument) = 0.40 + 0.30 − 0.12 = <b>0.58</b>.`),
    make(rng) {
      const pa = rng.int(15, 60), pb = rng.int(10, 50), pab = rng.int(0, Math.min(pa, pb) - 5), por = pa + pb - pab;
      const kind = rng.pick(['or', 'or', 'and']), [x, y] = rng.pick([['play a sport', 'play an instrument'], ['own a dog', 'own a cat'], ['like math', 'like science'], ['ride the bus', 'buy lunch']]);
      const d = k => N(k / 100);
      if (kind === 'or') return { prompt: `At a school, P(${x}) = ${d(pa)}, P(${y}) = ${d(pb)} and P(${x} and ${y}) = ${d(pab)}. Find P(${x} or ${y}).`, type: 'number', answer: por / 100, params: { kind, pa, pb, pab },
        hints: [`P(A or B) = P(A) + P(B) − P(A and B).`, `${d(pa)} + ${d(pb)} − ${d(pab)} = <b>${d(por)}</b>.`] };
      return { prompt: `At a school, P(${x}) = ${d(pa)}, P(${y}) = ${d(pb)} and P(${x} or ${y}) = ${d(por)}. Find P(${x} and ${y}).`, type: 'number', answer: pab / 100, params: { kind, pa, pb, por },
        hints: [`Rearrange the addition rule: P(A and B) = P(A) + P(B) − P(A or B).`, `${d(pa)} + ${d(pb)} − ${d(por)} = <b>${d(pab)}</b>.`] };
    },
    verify(q) {
      // count people in a population of 100
      const P = q.params, both = P.kind === 'or' ? P.pab : q.answer * 100, onlyA = P.pa - both, onlyB = P.pb - both;
      if (onlyA < 0 || onlyB < 0) return 'impossible overlap';
      return P.kind === 'or' ? near((onlyA + onlyB + both) / 100, q.answer, 1e-9) : near(onlyA + onlyB + both, P.por, 1e-9);
    },
  });

  /** a two-way table with row and column totals */
  const twoWay = (rows, cols, cells) => M.table([''].concat(cols, ['Total']), rows.map((r, i) => [r].concat(cells[i].map(N), [N(sum(cells[i]))])).concat([['Total'].concat(cols.map((_, j) => N(sum(cells.map(row => row[j])))), [N(sum(cells.flat()))])]), { compact: true });
  const TW = [[['Grade 9', 'Grade 10'], ['Walks', 'Bus', 'Car']], [['Has a pet', 'No pet'], ['Likes cats more', 'Likes dogs more']], [['Morning', 'Evening'], ['Ran', 'Swam', 'Biked']], [['Adult', 'Child'], ['Chose popcorn', 'Chose nachos']]];
  A.skill({
    id: 'stat.conditional-probability', title: 'Conditional probability from a two-way table',
    learn: p(`<b>P(A | B)</b> ("A given B") is the probability of A when you already know B happened. In a two-way table, <b>stay in B's row (or column), and divide the count for A within it by B's total</b>: P(A | B) = P(A and B) ÷ P(B).`) +
      p(`Order matters: P(A | B) divides by B's total, and P(B | A) divides by A's total. They're usually different.`) +
      example('Example', `Of 80 students who walk, 30 are in grade 9. So P(grade 9 | walks) = 30 ÷ 80 = ${F(3, 8)}.`),
    make(rng) {
      const [rows, cols] = rng.pick(TW), cells = rows.map(() => cols.map(() => rng.int(8, 60)));
      const i = rng.int(0, rows.length - 1), j = rng.int(0, cols.length - 1), kind = rng.pick(['rowGivenCol', 'colGivenRow', 'and']);
      const total = sum(cells.flat()), rowT = sum(cells[i]), colT = sum(cells.map(r => r[j]));
      const [num, den] = kind === 'rowGivenCol' ? [cells[i][j], colT] : kind === 'colGivenRow' ? [cells[i][j], rowT] : [cells[i][j], total];
      const ask = kind === 'rowGivenCol' ? `P(${rows[i]} | ${cols[j]})` : kind === 'colGivenRow' ? `P(${cols[j]} | ${rows[i]})` : `P(${rows[i]} and ${cols[j]})`;
      return { prompt: `Find ${ask} as a fraction.${twoWay(rows, cols, cells)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { cells, i, j, kind },
        hints: [kind === 'and' ? `"And" means the one cell in both: ${cells[i][j]}, out of everyone: ${total}.` : `"Given ${kind === 'rowGivenCol' ? cols[j] : rows[i]}" means look only at that ${kind === 'rowGivenCol' ? 'column' : 'row'}: its total is ${den}.`,
          `${cells[i][j]} ÷ ${den} = <b>${M.fracText(num, den)}</b>.`] };
    },
    verify(q) {
      const { cells, i, j, kind } = q.params, total = cells.flat().reduce((a, b) => a + b), pAnd = cells[i][j] / total;
      const pRow = cells[i].reduce((a, b) => a + b) / total, pCol = cells.reduce((s, r) => s + r[j], 0) / total;
      return near(kind === 'and' ? pAnd : kind === 'rowGivenCol' ? pAnd / pCol : pAnd / pRow, q.answer, 1e-12);
    },
  });

  const INDEP = ['Independent, because P(A | B) = P(A)', 'Not independent, because P(A | B) ≠ P(A)'];
  A.skill({
    id: 'stat.independence', title: 'Independent events',
    learn: p(`Events A and B are <b>independent</b> if knowing one happened doesn't change the probability of the other: <b>P(A | B) = P(A)</b>. Equivalently, P(A and B) = P(A) · P(B).`) +
      p(`In a two-way table, compare the proportion of A in B's column with the proportion of A overall. If they match, the events are independent; if not, they're associated.`) +
      example('Example', `If 60 of 200 people are left-handed (0.3), and 18 of the 60 who play guitar are left-handed (also 0.3), then being left-handed and playing guitar are independent.`),
    make(rng) {
      const [rows, cols] = rng.pick(TW.filter(t => t[1].length === 2)), indep = rng.bool();
      const r0 = rng.pick([20, 40, 60, 80]), r1n = rng.pick([20, 40, 60, 100]), share = rng.pick([0.25, 0.5, 0.75, 0.3, 0.6]);
      let cells = [[r0 * share, r0 * (1 - share)], [r1n * share, r1n * (1 - share)]].map(r => r.map(Math.round));
      if (!indep) { const k = rng.int(3, 8); cells = [[cells[0][0] + k, cells[0][1] - k], [cells[1][0] - k, cells[1][1] + k]]; }
      const [a, b] = [rows[0], cols[0]], total = sum(cells.flat()), pA = sum(cells[0]) / total, colT = cells[0][0] + cells[1][0], pAgB = cells[0][0] / colT;
      const answer = INDEP[indep ? 0 : 1];
      return { prompt: `Let A = "${a}" and B = "${b}". Are A and B independent?${twoWay(rows, cols, cells)}`, type: 'choice', keepOrder: true, answer, choices: INDEP.slice(), params: { cells },
        hints: [`P(A) = ${sum(cells[0])} ÷ ${total} = ${N(r3(pA))}.`, `P(A | B) = ${cells[0][0]} ÷ ${colT} = ${N(r3(pAgB))}.`, `They ${indep ? 'match' : "don't match"}: <b>${answer.charAt(0).toLowerCase() + answer.slice(1)}</b>.`] };
    },
    verify(q) {
      const c = q.params.cells, total = c.flat().reduce((x, y) => x + y), pA = (c[0][0] + c[0][1]) / total, pB = (c[0][0] + c[1][0]) / total;
      return q.answer === INDEP[near(c[0][0] / total, pA * pB, 1e-12) ? 0 : 1];
    },
  });

  /* ---------- Unit 6: random variables ---------- */
  A.skill({
    id: 'stat.expected-value', title: 'Expected value',
    learn: p(`The <b>expected value</b> (mean) of a random variable is the long-run average: multiply each value by its probability and add, <b>E(${V('X')}) = Σ ${V('x')} · P(${V('x')})</b>.`) +
      p(`For a game, use the net gain for each outcome (what you win minus what you paid). A negative expected value means you lose money on average, even if you sometimes win.`) +
      example('Example', `${V('x')}: 0, 1, 2 with probabilities 0.5, 0.3, 0.2. E(${V('X')}) = 0(0.5) + 1(0.3) + 2(0.2) = <b>0.7</b>.`),
    make(rng) {
      if (rng.bool()) {
        const n = rng.int(3, 5), xs = Array.from({ length: n }, (_, i) => i + rng.int(0, 1) * (i ? 1 : 0)), cuts = rng.sample([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95], n - 1).sort((a, b) => a - b);
        const ps = cuts.map((c, i) => c - (i ? cuts[i - 1] : 0)).concat([100 - cuts[n - 2]]), vals = [...new Set(xs)].length === n ? xs : xs.map((_, i) => i);
        const ev = sum(vals.map((x, i) => x * ps[i])) / 100;
        return { prompt: `Find the expected value of ${V('X')}.${M.table([V('x')].concat(vals.map(N)), [['P(' + V('x') + ')'].concat(ps.map(q => N(q / 100)))], { compact: true })}`, type: 'number', answer: ev, params: { kind: 'table', vals, ps },
          hints: [`Multiply each value by its probability: ${vals.map((x, i) => `${x}(${N(ps[i] / 100)})`).join(' + ')}.`, `The sum is <b>${N(ev)}</b>.`] };
      }
      const cost = rng.pick([1, 2, 5]), prize = rng.pick([10, 20, 50, 100]), oneIn = rng.pick([10, 20, 25, 50, 100]), ev = r2(prize / oneIn - cost);
      return { prompt: `A game costs $${cost} to play. You win $${prize} with probability 1/${oneIn}; otherwise you win nothing. What is the expected net gain per game, in dollars?`, type: 'number', answer: ev, params: { kind: 'game', cost, prize, oneIn },
        hints: [`Net gain: $${prize - cost} with probability 1/${oneIn}, and −$${cost} otherwise.`, `${prize - cost}(1/${oneIn}) + (−${cost})(${oneIn - 1}/${oneIn}) = ${N(r2(prize / oneIn))} − ${cost} = <b>${N(ev)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'game') return near((P.prize - P.cost) / P.oneIn - P.cost * (P.oneIn - 1) / P.oneIn, q.answer, 0.0051);
      return near(P.ps.reduce((s, pp, i) => s + pp * P.vals[i], 0) / P.ps.reduce((a, b) => a + b), q.answer, 1e-9) && P.ps.reduce((a, b) => a + b) === 100;
    },
  });

  const BCTX = [['a player makes a free throw', 'free throws'], ['a student guesses a multiple-choice question right', 'guessed questions'], ['a seed sprouts', 'planted seeds'], ['a customer buys a drink', 'customers']];
  A.skill({
    id: 'stat.binomial', title: 'Binomial probabilities',
    learn: p(`A <b>binomial</b> setting has a fixed number of trials ${V('n')}, each a success or failure, independent, with the same success probability ${V('p')}. Then <b>P(${V('X')} = ${V('k')}) = C(${V('n')}, ${V('k')}) · ${V('p')}<sup>${V('k')}</sup> · (1 − ${V('p')})<sup>${V('n')} − ${V('k')}</sup></b>, where C(${V('n')}, ${V('k')}) counts the ways to choose which ${V('k')} trials succeed.`) +
      p(`"At least one" is easiest as 1 − P(none) = 1 − (1 − ${V('p')})<sup>${V('n')}</sup>.`) +
      example('Example', `A player makes 70% of free throws. P(exactly 4 of 5) = C(5, 4)(0.7)<sup>4</sup>(0.3)<sup>1</sup> = 5 × 0.2401 × 0.3 ≈ <b>0.3602</b>.`),
    make(rng) {
      const n = rng.int(4, 10), pp = rng.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), [ev, many] = rng.pick(BCTX), who = rng.pick(NAMES);
      const kind = rng.chance(0.25) ? 'atleast1' : 'exact', k = rng.int(0, n);
      const ans = r4(kind === 'exact' ? binom(n, k, pp) : 1 - (1 - pp) ** n);
      const story = `The probability that ${ev} is ${N(pp)}, independently each time. ${who} looks at ${n} ${many}.`;
      return { prompt: `${story} Find the probability of ${kind === 'exact' ? `exactly ${k} successes` : 'at least one success'}, to 4 decimal places.`, type: 'number', answer: ans, tolerance: 0.0002, params: { n, pp, k, kind },
        hints: kind === 'exact' ? [`Binomial with ${V('n')} = ${n}, ${V('p')} = ${N(pp)}: P(${V('X')} = ${k}) = C(${n}, ${k})(${N(pp)})<sup>${k}</sup>(${N(r2(1 - pp))})<sup>${n - k}</sup>.`, `C(${n}, ${k}) = ${choose(n, k)}, so the probability is about <b>${ans.toFixed(4)}</b>.`]
          : [`P(at least one) = 1 − P(none) = 1 − (${N(r2(1 - pp))})<sup>${n}</sup>.`, `= 1 − ${N(r4((1 - pp) ** n))} ≈ <b>${ans.toFixed(4)}</b>.`] };
    },
    verify(q) {
      // simulate exactly by summing over all 2^n outcomes
      const { n, pp, k, kind } = q.params; let tot = 0;
      for (let m = 0; m < (1 << n); m++) { let c = 0, pr = 1; for (let b = 0; b < n; b++) { if (m >> b & 1) { c++; pr *= pp; } else pr *= 1 - pp; } if (kind === 'exact' ? c === k : c >= 1) tot += pr; }
      return near(tot, q.answer, 0.00006);
    },
  });

  A.skill({
    id: 'stat.binomial-mean-sd', title: 'Mean and standard deviation of a binomial count',
    learn: p(`For a binomial count with ${V('n')} trials and success probability ${V('p')}: <b>mean ${MU} = ${V('np')}</b> and <b>standard deviation ${SG} = √(${V('np')}(1 − ${V('p')}))</b>.`) +
      p(`The mean is the number of successes you'd expect on average; the standard deviation is how much the count typically varies from that from one set of ${V('n')} trials to another.`) +
      example('Example', `Flip a fair coin 100 times: ${MU} = 100 × 0.5 = 50 heads, and ${SG} = √(100 × 0.5 × 0.5) = 5.`),
    make(rng) {
      const n = rng.pick([20, 25, 40, 50, 60, 80, 100, 150, 200]), pp = rng.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9]), kind = rng.pick(['mean', 'sd']);
      const ans = kind === 'mean' ? r2(n * pp) : r2(Math.sqrt(n * pp * (1 - pp)));
      return { prompt: `A count ${V('X')} is binomial with ${V('n')} = ${n} and ${V('p')} = ${N(pp)}. Find its ${kind === 'mean' ? 'mean' : 'standard deviation, to the nearest hundredth'}.`, type: 'number', answer: ans, tolerance: kind === 'sd' ? 0.01 : undefined, params: { n, pp, kind },
        hints: [kind === 'mean' ? `${MU} = ${V('np')} = ${n} × ${N(pp)}.` : `${SG} = √(${V('np')}(1 − ${V('p')})) = √(${n} × ${N(pp)} × ${N(r2(1 - pp))}) = √${N(r4(n * pp * (1 - pp)))}.`, `= <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { n, pp, kind } = q.params; let m = 0, m2 = 0;
      for (let k = 0; k <= n; k++) { const pr = binom(n, k, pp); m += k * pr; m2 += k * k * pr; }
      return near(kind === 'mean' ? m : Math.sqrt(m2 - m * m), q.answer, kind === 'mean' ? 1e-6 : 0.0051);
    },
  });

  A.skill({
    id: 'stat.geometric', title: 'Geometric probabilities',
    learn: p(`A <b>geometric</b> setting repeats independent trials, each with success probability ${V('p')}, until the first success. The chance the first success comes on trial ${V('k')} is <b>P(${V('X')} = ${V('k')}) = (1 − ${V('p')})<sup>${V('k')} − 1</sup> ${V('p')}</b>: ${V('k')} − 1 failures, then a success.`) +
      p(`The expected number of trials until the first success is <b>1/${V('p')}</b>.`) +
      example('Example', `Each card in a pack has a 1/8 chance of being a rare card. The chance the first rare card is in the 3rd pack is (7/8)²(1/8) ≈ 0.0957, and on average it takes 8 packs.`),
    make(rng) {
      const pp = rng.pick([0.05, 0.1, 0.125, 0.2, 0.25, 0.3, 0.4, 0.5]), kind = rng.pick(['first', 'first', 'mean']), k = rng.int(1, 7);
      const ans = kind === 'first' ? r4((1 - pp) ** (k - 1) * pp) : r2(1 / pp);
      const ctx = rng.pick(['rolls a game die until a special symbol appears', 'calls customers until one agrees to a survey', 'shoots at a target until the first hit', 'opens card packs until a rare card appears']);
      const who = rng.pick(NAMES);
      return { prompt: `${who} ${ctx}. Each try succeeds with probability ${N(pp)}, independently. ${kind === 'first' ? `Find the probability that the first success is on try ${k}, to 4 decimal places.` : 'How many tries does it take on average to get the first success?'}`, type: 'number', answer: ans, tolerance: kind === 'first' ? 0.0002 : undefined, params: { pp, k, kind },
        hints: kind === 'first' ? [`That's ${k - 1} failure${k === 2 ? '' : 's'} and then a success: (1 − ${N(pp)})<sup>${k - 1}</sup> × ${N(pp)}.`, `= <b>${ans.toFixed(4)}</b>.`] : [`The mean of a geometric count is 1/${V('p')}.`, `1 ÷ ${N(pp)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { pp, k, kind } = q.params;
      if (kind === 'mean') { let m = 0; for (let j = 1; j < 2000; j++) m += j * (1 - pp) ** (j - 1) * pp; return near(m, q.answer, 0.0051); }
      let still = 1; for (let j = 1; j < k; j++) still *= 1 - pp;
      return near(still * pp, q.answer, 0.00006);
    },
  });

  /* ---------- Unit 7: inference ---------- */
  A.skill({
    id: 'stat.standard-error', title: 'Standard error',
    learn: p(`A statistic (like a sample proportion ${PH} or a sample mean ${XB}) changes from sample to sample. Its standard deviation across samples is its <b>standard error</b>. <b>For a proportion: √(${V('p')}(1 − ${V('p')}) ÷ ${V('n')}). For a mean: ${SG} ÷ √${V('n')}.</b>`) +
      p(`Bigger samples give smaller standard errors, but only by the square root: to cut the standard error in half, you need four times as many observations.`) +
      example('Example', `With ${V('p')} = 0.4 and ${V('n')} = 150: √(0.4 × 0.6 ÷ 150) = √0.0016 = <b>0.04</b>. With ${SG} = 12 and ${V('n')} = 36: 12 ÷ 6 = <b>2</b>.`),
    make(rng) {
      if (rng.bool()) {
        const pp = rng.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), n = rng.pick([50, 100, 150, 200, 400, 500, 1000]), ans = r4(Math.sqrt(pp * (1 - pp) / n));
        return { prompt: `Samples of size ${n} are taken from a population where the proportion of successes is ${V('p')} = ${N(pp)}. Find the standard error of the sample proportion, to 4 decimal places.`, type: 'number', answer: ans, tolerance: 0.0002, params: { kind: 'p', pp, n },
          hints: [`SE = √(${V('p')}(1 − ${V('p')}) ÷ ${V('n')}) = √(${N(pp)} × ${N(r2(1 - pp))} ÷ ${n}).`, `= √${N(r4(pp * (1 - pp) / n))} ≈ <b>${ans.toFixed(4)}</b>.`] };
      }
      const sg = rng.int(4, 40), n = rng.pick([4, 9, 16, 25, 36, 49, 64, 100, 30, 50]), ans = r2(sg / Math.sqrt(n));
      return { prompt: `A population has standard deviation ${SG} = ${sg}. Find the standard error of the sample mean for samples of size ${n}, to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { kind: 'm', sg, n },
        hints: [`SE = ${SG} ÷ √${V('n')} = ${sg} ÷ √${n}.`, `√${n} ${Number.isInteger(Math.sqrt(n)) ? '=' : '≈'} ${N(r4(Math.sqrt(n)))}, so SE ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'm') return near(Math.sqrt(P.sg * P.sg / P.n), q.answer, 0.0051);
      return near(Math.sqrt(P.pp - P.pp * P.pp) / Math.sqrt(P.n), q.answer, 0.00006);
    },
  });

  const ZSTAR = [[90, 1.645], [95, 1.96], [99, 2.576]];
  A.skill({
    id: 'stat.confidence-interval', title: 'Confidence intervals for a proportion',
    learn: p(`A confidence interval for a population proportion is <b>${PH} ± ${V('z')}* · √(${PH}(1 − ${PH}) ÷ ${V('n')})</b>. The part after ± is the <b>margin of error</b>. The critical value ${V('z')}* is 1.645 for 90% confidence, 1.96 for 95%, and 2.576 for 99%.`) +
      p(`Higher confidence means a wider interval. A larger sample means a narrower one. "95% confident" means the method captures the true proportion in about 95% of samples.`) +
      example('Example', `In a sample of 400, 240 said yes, so ${PH} = 0.6. For 95%: margin = 1.96 × √(0.6 × 0.4 ÷ 400) ≈ 0.048, so the interval is 0.552 to 0.648.`),
    make(rng) {
      const n = rng.pick([100, 200, 250, 400, 500, 800, 1000, 1200]), x = Math.round(n * rng.int(15, 85) / 100), [lvl, zs] = rng.pick(ZSTAR), kind = rng.pick(['moe', 'lower', 'upper']);
      const ph = x / n, moe = zs * Math.sqrt(ph * (1 - ph) / n), ans = r3(kind === 'moe' ? moe : kind === 'lower' ? ph - moe : ph + moe);
      const what = kind === 'moe' ? 'the margin of error' : kind === 'lower' ? 'the lower end of the interval' : 'the upper end of the interval';
      return { prompt: `In a random sample of ${n} people, ${x} said they would vote for a new park. For a ${lvl}% confidence interval for the population proportion (${V('z')}* = ${zs}), find ${what}, to 3 decimal places.`, type: 'number', answer: ans, tolerance: 0.0011, params: { n, x, zs, kind },
        hints: [`${PH} = ${x} ÷ ${n} = ${N(r4(ph))}.`, `Margin of error = ${zs} × √(${N(r4(ph))} × ${N(r4(1 - ph))} ÷ ${n}) ≈ ${N(r4(moe))}.`, kind === 'moe' ? `So it's about <b>${ans.toFixed(3)}</b>.` : `${N(r4(ph))} ${kind === 'lower' ? '−' : '+'} ${N(r4(moe))} ≈ <b>${ans.toFixed(3)}</b>.`] };
    },
    verify(q) {
      const { n, x, zs, kind } = q.params, ph = x / n, se = Math.sqrt(x * (n - x) / n ** 3), moe = zs * se;
      return near(kind === 'moe' ? moe : kind === 'lower' ? ph - moe : ph + moe, q.answer, 0.00051);
    },
  });

  A.skill({
    id: 'stat.test-statistic', title: 'The test statistic for a proportion',
    learn: p(`A significance test asks whether data are surprising if the null hypothesis ${H0}: ${V('p')} = ${V('p')}<sub>0</sub> is true. The <b>test statistic</b> measures how many standard errors the sample result is from ${V('p')}<sub>0</sub>: <b>${V('z')} = (${PH} − ${V('p')}<sub>0</sub>) ÷ √(${V('p')}<sub>0</sub>(1 − ${V('p')}<sub>0</sub>) ÷ ${V('n')})</b>.`) +
      p(`Note that the standard error uses ${V('p')}<sub>0</sub>, the value in the null hypothesis, not ${PH}. A ${V('z')} far from 0 (beyond about ±2) is evidence against ${H0}.`) +
      example('Example', `${H0}: ${V('p')} = 0.5, and 62 of 100 flips land heads. ${V('z')} = (0.62 − 0.5) ÷ √(0.25 ÷ 100) = 0.12 ÷ 0.05 = <b>2.4</b>.`),
    make(rng) {
      const p0 = rng.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75]), n = rng.pick([100, 150, 200, 300, 400, 500]), x = Math.round(n * (p0 + rng.int(-12, 12) / 100)) || 1;
      const ph = x / n, z = r2((ph - p0) / Math.sqrt(p0 * (1 - p0) / n));
      const claim = rng.pick(['of customers use a coupon', 'of students walk to school', 'of seeds sprout', 'of voters support the plan']);
      return { prompt: `A company claims that ${N(p0 * 100)}% ${claim}. In a random sample of ${n}, ${x} did. Find the test statistic ${V('z')} for ${H0}: ${V('p')} = ${N(p0)}, to the nearest hundredth.`, type: 'number', answer: z, tolerance: 0.01, params: { p0, n, x },
        hints: [`${PH} = ${x} ÷ ${n} = ${N(r4(ph))}; the standard error uses ${V('p')}<sub>0</sub>: √(${N(p0)} × ${N(r2(1 - p0))} ÷ ${n}) ≈ ${N(r4(Math.sqrt(p0 * (1 - p0) / n)))}.`, `${V('z')} = (${N(r4(ph))} − ${N(p0)}) ÷ ${N(r4(Math.sqrt(p0 * (1 - p0) / n)))} ≈ <b>${N(z)}</b>.`] };
    },
    verify(q) { const { p0, n, x } = q.params; return near((x - n * p0) / Math.sqrt(n * p0 * (1 - p0)), q.answer, 0.0051); },
  });

  const CLAIMS = [['the new tutoring program raises the average test score', 'the program does not raise the average score'], ['the coin is not fair', 'the coin is fair'], ['more than 20% of customers use coupons', '20% of customers use coupons'], ['the new battery lasts longer on average', 'the new battery lasts the same on average'], ['the vaccine works better than the old one', 'the vaccine works no better than the old one']];
  A.skill({
    id: 'stat.p-value-decision', title: 'P-values and conclusions',
    learn: p(`The <b>P-value</b> is the probability, if ${H0} were true, of getting a result at least as extreme as the one observed. <b>If the P-value is less than the significance level α, reject ${H0}</b>: there is convincing evidence for ${HA}. Otherwise, <b>fail to reject ${H0}</b>: there isn't convincing evidence for ${HA}.`) +
      p(`Two traps: failing to reject ${H0} doesn't prove ${H0} is true (never "accept" it), and rejecting ${H0} doesn't prove ${HA}; it only gives convincing evidence.`) +
      example('Example', `With α = 0.05 and a P-value of 0.012, reject ${H0}: there is convincing evidence for ${HA}. With a P-value of 0.21, fail to reject ${H0}.`),
    make(rng) {
      const [alt, nul] = rng.pick(CLAIMS), alpha = rng.pick([0.01, 0.05, 0.10]), reject = rng.bool();
      const pv = reject ? r3(alpha * rng.pick([0.1, 0.3, 0.5, 0.8])) || 0.001 : r3(alpha * rng.pick([1.4, 2, 3, 5, 8]));
      const opts = [`Reject ${H0}. There is convincing evidence that ${alt}.`, `Fail to reject ${H0}. There is not convincing evidence that ${alt}.`, `Reject ${H0}. This proves that ${alt}.`, `Accept ${H0}. This shows that ${nul}.`];
      const answer = opts[reject ? 0 : 1];
      return { prompt: `A study tests ${H0}: ${nul} against ${HA}: ${alt}. The P-value is ${N(pv)} and the significance level is α = ${N(alpha)}. Which conclusion is correct?`, type: 'choice', answer, choices: opts, params: { pv, alpha },
        hints: [`Compare: ${N(pv)} is ${pv < alpha ? 'less' : 'more'} than α = ${N(alpha)}, so ${pv < alpha ? 'reject' : 'fail to reject'} ${H0}.`, `A test never "proves" anything and never "accepts" ${H0}. The answer: <b>${answer}</b>`] };
    },
    verify(q) { return q.answer === q.choices.find(c => c.startsWith(q.params.pv < q.params.alpha ? `Reject ${H0}. There is convincing` : 'Fail to reject')); },
  });

  A.skill({
    id: 'stat.errors', title: 'Type I and Type II errors',
    learn: p(`A test can go wrong in two ways. A <b>Type I error</b> rejects ${H0} when ${H0} is actually true (a false alarm). A <b>Type II error</b> fails to reject ${H0} when ${HA} is actually true (a missed effect).`) +
      p(`The significance level α is the probability of a Type I error. Making α smaller makes Type I errors rarer but Type II errors more likely; a larger sample reduces Type II errors.`) +
      example('Example', `${H0}: a new drug is no better; ${HA}: it is better. A Type I error is concluding the drug is better when it isn't. A Type II error is not concluding it's better when it really is.`),
    make(rng) {
      const [alt, nul] = rng.pick(CLAIMS), t1 = rng.bool();
      const opts = [`Concluding that ${alt}, when in fact ${nul}.`, `Not concluding that ${alt}, when in fact it is true.`, `Concluding that ${alt}, when in fact it is true.`, `Not concluding that ${alt}, when in fact ${nul}.`];
      const answer = opts[t1 ? 0 : 1];
      return { prompt: `${H0}: ${nul}. ${HA}: ${alt}. Which describes a ${t1 ? 'Type I' : 'Type II'} error?`, type: 'choice', answer, choices: opts, params: { t1 },
        hints: [t1 ? `A Type I error rejects ${H0} (concludes ${HA}) when ${H0} is really true.` : `A Type II error fails to reject ${H0} when ${HA} is really true.`, `So: <b>${answer}</b> (The other two choices are correct decisions, not errors.)`] };
    },
    verify(q) { return q.answer === q.choices.find(c => (q.params.t1 ? c.startsWith('Concluding') : c.startsWith('Not concluding')) && (q.params.t1 ? !c.endsWith('it is true.') : c.endsWith('it is true.'))); },
  });
})();
