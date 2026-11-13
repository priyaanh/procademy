#!/usr/bin/env node
/* Checks every course and skill: structure, determinism, variety, answers that round-trip through the
   checker, choice sets without giveaways, and each skill's own verify() where it has one. A skill's challenge()
   maker, where it has one, is run over the same seeds under the same rules, and must pass the same verify().
     node tests/content.js                     every content file named in index.html
     node tests/content.js content/int2.js     just that file, while writing it
     SEEDS=2000 node tests/content.js          more seeds per skill */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = global;
require('../lib/rng.js'); require('../lib/math.js'); require('../lib/content.js');
const A = global.ACADEMY;
const args = process.argv.slice(2);
const SEEDS = Number(process.env.SEEDS || 300);
let files = args.length ? args : (fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/content\/[\w-]+\.js/g) || []);
files = [...new Set(files)];
let fails = 0, checks = 0;
const seen = new Set();
const fail = msg => { fails++; if (!seen.has(msg)) { seen.add(msg); console.log('FAIL ' + msg); } };

for (const f of files) {
  const p = path.resolve(root, f);
  if (!fs.existsSync(p)) { if (args.length) fail(`missing ${f}`); else console.log(`skip ${f} (not written yet)`); continue; }
  try { require(p); } catch (e) { fail(`${f} threw while loading: ${e.message}`); }
}

const { unplaced, missing } = A.orphans();
unplaced.forEach(id => fail(`skill ${id} is registered but not in any unit`));
missing.forEach(id => fail(`a unit lists ${id} but no such skill is registered`));
for (const c of A.courses) {
  if (!c.blurb) fail(`course ${c.id} has no blurb`);
  if (!c.icon) fail(`course ${c.id} has no icon`);
  if (c.hue == null) fail(`course ${c.id} has no hue`);
  c.units.forEach(u => { if (u.skills.length < 2) fail(`unit ${c.id}/${u.id} has fewer than two skills`); });
}

// every skill's make(), and its challenge() where it has one (a challenge seed builds with it), under the same rules
const runs = [];
for (const id of Object.keys(A.skills)) { runs.push([id, false]); if (A.hasChallenge(id)) runs.push([id, true]); }
let challengeMakers = 0;
for (const [id, hard] of runs) {
  const def = A.skills[id];
  if (!A.whereIs(id)) continue;
  if (!hard && (!def.learn || A.stripTags(def.learn).replace(/\s+/g, ' ').trim().length < 120)) fail(`${id}: learn article missing or too short`);
  if (hard) challengeMakers++;
  const prompts = new Set(), answers = new Set();
  let longest = 0, choiceQs = 0, perSkill = 0;
  const tag = hard ? `${id} (challenge)` : id;
  for (let k = 0; k < SEEDS; k++) {
    const seed = hard ? A.challengeSeed('s' + k) : 's' + k;
    let q;
    try { q = A.question(id, seed); } catch (e) { fail(`${tag} seed ${seed}: ${e.message}`); break; }
    let q2;
    try { q2 = A.question(id, seed); } catch (e) { q2 = null; }
    if (!q2 || JSON.stringify(q) !== JSON.stringify(q2)) { fail(`${tag} seed ${seed}: not deterministic`); break; }
    prompts.add(A.normText(A.stripTags(q.prompt)) + '|' + (q.type === 'choice' ? q.choices.slice().sort().join('|') : ''));
    answers.add(String(q.answer));
    if (q.type === 'number') {
      if (!A.check(q, String(q.answer)).correct) fail(`${tag} seed ${seed}: the numeric answer ${q.answer} does not check as correct`);
      if (q.answerText != null && !A.check(q, String(q.answerText)).correct) fail(`${tag} seed ${seed}: answerText "${q.answerText}" does not check as the answer ${q.answer}`);
      if (q.tolerance != null && q.tolerance > Math.max(0.051, Math.abs(q.answer) * 0.011)) fail(`${tag} seed ${seed}: tolerance ${q.tolerance} is too loose for ${q.answer}`);
      if (Math.abs(q.answer) > 1e9) fail(`${tag} seed ${seed}: answer ${q.answer} is absurdly large`);
    } else if (!A.check(q, q.answer).correct) fail(`${tag} seed ${seed}: the answer does not check as correct`);
    if (q.type === 'choice') {
      choiceQs++;
      if (q.choices[q.answerIndex] !== q.answer) fail(`${tag} seed ${seed}: answerIndex points at the wrong choice`);
      const lens = q.choices.map(c => A.stripTags(c).replace(/\s+/g, ' ').trim().length);
      const mine = lens[q.answerIndex], others = lens.filter((_, i) => i !== q.answerIndex);
      if (others.every(l => mine >= l * 1.5 + 4)) longest++;
      if (q.choices.length > 6) fail(`${tag} seed ${seed}: ${q.choices.length} choices is too many`);
    }
    if (q.type === 'text' && A.normText(q.answer).length > 60) fail(`${tag} seed ${seed}: text answer is too long to type (${q.answer})`);
    if (q.hints.length > 8) fail(`${tag} seed ${seed}: ${q.hints.length} hints is too many`);
    if (/undefined|NaN|\[object/.test(q.prompt + q.hints.join('') + (q.choices || []).join(''))) fail(`${tag} seed ${seed}: "undefined"/"NaN" leaked into the text`);
    // an HTML tag such as <i> or <b> inside <svg> ends the drawing early in a browser ("foreign content breakout")
    for (const html of [q.prompt].concat(q.hints, q.choices || [])) {
      for (const svg of String(html).match(/<svg[\s\S]*?<\/svg>/g) || []) {
        const bad = svg.match(/<(b|big|blockquote|body|br|center|code|dd|div|dl|dt|em|embed|h[1-6]|head|hr|i|img|li|listing|menu|meta|nobr|ol|p|pre|ruby|s|small|span|strong|strike|sub|sup|table|tt|u|ul|var)[\s>\/]/i);
        if (bad) fail(`${tag} seed ${seed}: <${bad[1]}> inside an <svg> breaks the drawing; use SVG attributes (font-style="italic", font-weight="700") instead`);
      }
    }
    if (def.verify) {
      let v;
      try { v = def.verify(q); } catch (e) { v = 'threw: ' + e.message; }
      if (v !== true) fail(`${tag} seed ${seed}: verify() says ${JSON.stringify(v)} for answer ${JSON.stringify(q.answer)} — ${A.stripTags(q.prompt).replace(/\s+/g, ' ').trim().slice(0, 120)}`);
    }
    checks++; perSkill++;
  }
  if (perSkill === SEEDS) {
    if (prompts.size < Math.min(8, Math.floor(SEEDS / 4))) fail(`${tag}: only ${prompts.size} distinct questions in ${SEEDS} seeds`);
    if (answers.size < 2) fail(`${tag}: every question has the same answer (${[...answers][0]})`);
    if (choiceQs && longest / choiceQs > 0.5) fail(`${tag}: the right choice is the longest by far in ${longest} of ${choiceQs} questions — a giveaway`);
  }
}
const skillCount = Object.keys(A.skills).filter(id => A.whereIs(id)).length;
console.log(`${fails ? 'FAIL' : 'PASS'}: ${checks} questions checked across ${skillCount} skills (${challengeMakers} with challenge questions) in ${A.courses.length} courses; ${fails} problem${fails === 1 ? '' : 's'}`);
process.exit(fails ? 1 : 0);
