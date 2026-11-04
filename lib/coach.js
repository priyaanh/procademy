/* The learning coach: what a wrong answer probably means, and reading math aloud.

   COACH.diagnose(q, input) looks at a wrong number answer next to the right one and the numbers in the
   question and its working, and names the likely slip: a sign, a flipped fraction, the decimal point, a
   percent read as a decimal, adding where the question needed multiplying, stopping a step early, giving
   back a number from the question, digits swapped, rounding, off by one. The message never says the
   answer, so it works while the learner is still trying. Each slip is counted (STORE.noteMistake), and
   Progress shows the learner's own patterns.

   COACH.text(html) turns question HTML into plain math text (3/4, x^2, √(2)) for the tutor and the
   coach; COACH.text(html, true) into words for reading aloud (3 over 4, x squared). COACH.say() reads
   with the browser's own voice, so it works offline and sends nothing anywhere. */
'use strict';
(function () {
  const A = window.ACADEMY;

  /* ---------- math as text, or as words ---------- */
  const wrap = t => (/[\s+\-−×÷]/.test(t.trim()) ? `(${t.trim()})` : t.trim());
  function walk(node, sp) {
    let out = '';
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) { out += sp ? words(n.nodeValue) : n.nodeValue; return; }
      if (n.nodeType !== 1) return;
      const el = n, tag = el.tagName.toUpperCase(), cls = el.classList;
      if (cls && cls.contains('frac')) {
        const num = el.querySelector(':scope > .num'), den = el.querySelector(':scope > .den');
        const a = num ? walk(num, sp) : '', b = den ? walk(den, sp) : '';
        out += sp ? ` ${a.trim()} over ${b.trim()} ` : `${wrap(a)}/${wrap(b)}`;
        return;
      }
      if (cls && cls.contains('mixed')) { out += (sp ? ' and ' : ' ') + walk(el, sp); return; }
      if (cls && cls.contains('sqrt')) { const r = el.querySelector('.rad'); const t = r ? walk(r, sp) : ''; out += sp ? ` the square root of ${t} ` : `√${wrap(t) === t.trim() && t.trim().length === 1 ? t.trim() : '(' + t.trim() + ')'}`; return; }
      if (tag === 'SUP') { const e = walk(el, sp).trim(); out += sp ? (e === '2' ? ' squared ' : e === '3' ? ' cubed ' : ` to the power ${e} `) : (e.length > 1 ? `^(${e})` : `^${e}`); return; }
      if (tag === 'SCRIPT' || tag === 'STYLE') return;
      if (tag === 'SVG' || tag === 'svg') { if (!sp) out += ' ' + walk(el, sp) + ' '; else out += ' (see the picture) '; return; }
      if (tag === 'TEXT' || tag === 'text') { out += ' ' + walk(el, sp) + ' '; return; }
      if (/^(BR)$/.test(tag)) { out += sp ? '. ' : ' '; return; }
      if (/^(P|DIV|LI|TR|H\d|UL|OL|TABLE|FIGURE)$/.test(tag)) { out += ' ' + walk(el, sp) + (sp ? '. ' : ' '); return; }
      if (tag === 'TD' || tag === 'TH') { out += ' ' + walk(el, sp) + (sp ? ', ' : ' '); return; }
      out += walk(el, sp);
    });
    return out;
  }
  /** symbols as words, for a voice */
  function words(t) {
    return String(t)
      .replace(/(^|[\s(=])[−-](?=\d|\.\d|[a-z])/gi, '$1negative ')
      .replace(/\s*[−]\s*/g, ' minus ').replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2')
      .replace(/\s*[×·]\s*/g, ' times ').replace(/\s*÷\s*/g, ' divided by ')
      .replace(/\s*≤\s*/g, ' is less than or equal to ').replace(/\s*≥\s*/g, ' is greater than or equal to ')
      .replace(/\s*≠\s*/g, ' doesn’t equal ').replace(/\s*<\s*/g, ' is less than ').replace(/\s*>\s*/g, ' is greater than ')
      .replace(/\s*=\s*/g, ' equals ').replace(/%/g, ' percent').replace(/°/g, ' degrees').replace(/π/g, ' pi ')
      .replace(/√/g, ' the square root of ').replace(/\|([^|]+)\|/g, ' the absolute value of $1 ').replace(/_{2,}/g, ' blank ');
  }
  /** question HTML as plain text (math kept readable), or as words for a voice */
  function text(html, spoken) {
    if (typeof document === 'undefined') return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const d = document.createElement('div');
    d.innerHTML = String(html || '');
    return walk(d, !!spoken).replace(/\s+([.,;:!?])/g, '$1').replace(/\s+/g, ' ').replace(/(\. ){2,}/g, '. ').trim();
  }

  /* ---------- what a wrong answer probably means ---------- */
  /** the numbers written in some text: 12, −3, 0.5, 3/4 (as 0.75), 1,250 */
  function numbersIn(t) {
    const out = [];
    const s = String(t).replace(/(\d),(?=\d{3}\b)/g, '$1');
    const re = /([−-]?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)|[−-]?\d+(?:\.\d+)?/g;
    let m;
    while ((m = re.exec(s))) {
      const v = m[2] ? Number(m[1].replace('−', '-')) / Number(m[2]) : Number(m[0].replace('−', '-'));
      if (isFinite(v) && !out.some(x => same(x, v))) out.push(v);
    }
    return out;
  }
  const same = (x, y) => Math.abs(x - y) <= Math.max(1e-9, 1e-7 * Math.abs(y));
  const OPS = [['add', (p, r) => p + r], ['sub', (p, r) => p - r], ['sub', (p, r) => r - p], ['mul', (p, r) => p * r], ['div', (p, r) => p / r], ['div', (p, r) => r / p]];
  const DID = { add: 'added', sub: 'subtracted', mul: 'multiplied', div: 'divided' };
  const NEED = { add: 'adding', sub: 'subtracting', mul: 'multiplying', div: 'dividing' };
  /** the operation on two of these numbers that gives v: [name, p, r] or null */
  function opFor(v, nums) {
    for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
      const p = nums[i], r = nums[j];
      for (const [name, f] of OPS) { const x = f(p, r); if (isFinite(x) && same(x, v)) return [name, p, r]; }
    }
    return null;
  }
  const MSG = {
    sign: 'The size is correct, but the sign isn’t. Check whether the answer should be positive or negative.',
    flip: 'That answer is inverted. Check which number belongs on top of the fraction.',
    place: 'The digits appear correct, but the decimal point is in the wrong place. Check the place value.',
    percent: 'A percent and a decimal may have been confused. 25% is 0.25 as a decimal: the decimal point moves two places.',
    early: 'That number appears partway through the working. You may have stopped one step early. What remains to be done?',
    echo: 'That number is already in the question. Determine what the question is asking for.',
    digits: 'The digits are correct but in a different order. Check that you wrote them in the correct order.',
    round: 'Very close. Check your rounding, or the number of decimal places the question requires.',
    one: 'The answer is off by one. Check your counting, or the last step of the arithmetic.',
  };
  const TIPS = {
    sign: 'Before answering, ask: should this be positive or negative? A negative times a negative is positive; subtracting a negative adds.',
    flip: 'When dividing by a fraction, invert only the second one. When writing a rate, the "per" quantity goes on the bottom.',
    place: 'Estimate first: if the answer should be "about 40", then 4 or 400 is a slip of the decimal point.',
    percent: 'Percent means "out of 100": 35% = 0.35 = 35/100.',
    early: 'After each step, reread the question and ask: is this what it asked for?',
    echo: 'Underline what the question asks for before you start.',
    digits: 'Copy numbers carefully, and check your answer against an estimate.',
    round: 'Round only at the very end, to the place the question asks for.',
    one: 'Count again slowly, or check the last step with the inverse operation.',
    op: 'Look for the action words: "each", "per" and "times" often mean multiply; "shared equally" means divide; "more than" or "total" often mean add.',
  };
  /** the likely slip behind a wrong answer: { kind, msg } or null. Never states the answer. */
  function diagnose(q, input) {
    if (!q) return null;
    let v, a;
    if (q.type === 'number') { v = A.parseNumber(input); a = q.answer; }
    else if (q.type === 'choice' && typeof input === 'number' && q.choices[input] != null) { v = A.parseNumber(text(q.choices[input])); a = A.parseNumber(text(q.choices[q.answerIndex])); }
    else return null;
    if (!isFinite(v) || !isFinite(a) || same(v, a)) return null;
    const prompt = text(q.prompt);
    const isPct = q.unit === '%' || /percent|%/i.test(prompt);
    const out = kind => ({ kind, msg: MSG[kind] });
    if (a !== 0 && same(v, -a)) return out('sign');
    if (a !== 0 && v !== 0 && Math.abs(a) !== 1 && same(v, 1 / a)) return out('flip');
    for (const k of [1, 2, 3, -1, -2, -3]) if (a !== 0 && same(v, a * Math.pow(10, k))) return out(isPct && Math.abs(k) === 2 ? 'percent' : 'place');
    const given = numbersIn(prompt).slice(0, 8);
    const steps = numbersIn((q.hints || []).slice(0, -1).map(h => text(h)).join(' ')).filter(x => !given.some(g => same(g, x)) && !same(x, a));
    if (steps.some(x => same(x, v))) return out('early');
    const used = opFor(v, given), right = opFor(a, given);
    if (used && (!right || right[0] !== used[0])) {
      return { kind: 'op', msg: `It looks like you ${DID[used[0]]} ${fmt(used[1])} and ${fmt(used[2])}.${right ? ` This one needs ${NEED[right[0]]} instead.` : ' Is that what the question asks for? It may need another step.'}` };
    }
    if (given.some(x => same(x, v))) return out('echo');
    if (Number.isInteger(a) && Number.isInteger(v) && Math.abs(a) >= 10 && Math.sign(a) === Math.sign(v) && [...String(Math.abs(v))].sort().join('') === [...String(Math.abs(a))].sort().join('')) return out('digits');
    if (Math.abs(v - a) <= Math.max(0.011 * Math.abs(a), 0.0051) && !Number.isInteger(a)) return out('round');
    if (Number.isInteger(a) && Number.isInteger(v) && Math.abs(v - a) === 1 && Math.abs(a) >= 3) return out('one');
    return null;
  }
  const fmt = x => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : String(Math.round(x * 1000) / 1000)).replace(/^-/, '−');

  /* ---------- reading aloud ---------- */
  const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let speaking = null;
  /** read some HTML aloud; reading the same thing again stops it. Returns true while it reads. */
  function say(html, onEnd) {
    if (!canSpeak()) return false;
    const synth = window.speechSynthesis;
    const t = text(html, true);
    if (speaking && speaking.t === t && (synth.speaking || synth.pending)) { synth.cancel(); speaking = null; if (onEnd) onEnd(); return false; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.rate = 0.95; u.lang = 'en-US';
    const voice = synth.getVoices().find(v => /^en(-|_)US/i.test(v.lang) && v.localService) || synth.getVoices().find(v => /^en/i.test(v.lang));
    if (voice) u.voice = voice;
    u.onend = u.onerror = () => { if (speaking && speaking.u === u) speaking = null; if (onEnd) onEnd(); };
    speaking = { t, u };
    synth.speak(u);
    return true;
  }
  /** a "Read aloud" button; data-say holds the HTML to read */
  const speakBtn = (html, label) => (canSpeak() ? `<button type="button" class="btn ghost sm say-btn" data-say="${String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')}" aria-label="${label || 'Read aloud'}" title="${label || 'Read aloud'}">Read aloud</button>` : '');
  let wired = false;
  function wire() {
    if (wired || typeof document === 'undefined') return;
    wired = true;
    document.addEventListener('click', ev => {
      const b = ev.target.closest && ev.target.closest('.say-btn');
      if (!b) return;
      ev.preventDefault();
      const on = say(b.dataset.say, () => b.classList.remove('on'));
      document.querySelectorAll('.say-btn.on').forEach(x => x.classList.remove('on'));
      b.classList.toggle('on', on);
    });
    window.addEventListener('hashchange', () => { if (canSpeak()) window.speechSynthesis.cancel(); });
  }

  const COACH = { text, numbersIn, diagnose, MSG, TIPS, say, speakBtn, canSpeak, wire };
  window.COACH = COACH;
  wire();
})();
