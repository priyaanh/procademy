#!/usr/bin/env node
/* Keeps index.html's preload list in step with its scripts. Without it a browser discovered the 70-odd scripts at
   the end of the page one at a time, so a first visit on a phone took 13 s (each file waited a round trip for
   the one before); asking for all of them at the top of the page lets them download together (about 1 s).
   Rewrites the lines between <!-- preload:start --> and <!-- preload:end -->; prints how many. --check only
   reports whether the list is current (run.sh). Run: node tools/preload.js [--check] */
'use strict';
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const start = '<!-- preload:start -->', end = '<!-- preload:end -->';
if (!html.includes(start) || !html.includes(end)) throw new Error('index.html has no preload markers');
// boot.js runs in the head before anything else; every script after it is preloaded
const list = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => s !== 'lib/boot.js');
const block = start + '\n' + list.map(s => `<link rel="preload" as="script" href="${s}">`).join('\n') + '\n' + end;
const next = html.replace(new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + end), block);
if (process.argv.includes('--check')) { if (next !== html) { console.log('index.html’s preload list is out of date: run node tools/preload.js'); process.exit(1); } console.log(list.length + ' scripts preloaded'); process.exit(0); }
if (next !== html) fs.writeFileSync(file, next);
console.log(list.length + ' scripts preloaded');
