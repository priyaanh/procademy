/* Procademy is a formal website (CONTENT.md, "Tone and symbols"): no emojis or pictographs in anything it
   shows. This scans every page, script, content and CPM file for them. Notation stays allowed: math symbols,
   arrows, ✓ ✗ for checked steps, ✕ for close, ☐ for an equation blank, and the dice faces ⚀–⚅ in the
   probability simulator.
     node tests/formal.js */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = ['index.html', 'privacy.html', 'app.css'].concat(...['lib', 'content', 'cpm'].map(d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.js')).map(f => d + '/' + f)));
const ALLOWED = new Set(['✓', '✗', '✕', '☐', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']);
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
let bad = 0;
for (const f of files) {
  const lines = fs.readFileSync(path.join(root, f), 'utf8').split('\n');
  lines.forEach((line, k) => {
    for (const m of line.matchAll(EMOJI)) {
      if (ALLOWED.has(m[0])) continue;
      bad++;
      if (bad <= 30) console.log(`FAIL ${f}:${k + 1}: “${m[0]}” in …${line.slice(Math.max(0, m.index - 40), m.index + 30).trim()}…`);
    }
  });
}
console.log(bad ? `FAIL ${bad} emojis or pictographs in ${files.length} files` : `PASS: ${files.length} files, no emojis or pictographs`);
process.exit(bad ? 1 : 0);
