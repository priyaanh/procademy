#!/usr/bin/env node
/* Builds procademy-offline.html: the whole of Procademy in one file, which opens with a double-click and
   works with no internet and no server. Save it anywhere (a laptop, a USB stick) and open it in a browser.

   Every stylesheet and script that index.html loads is put inside the page, in the same order, each script
   in its own <script> tag so it behaves exactly as on the site. The security policy stays: inline scripts
   are allowed only by their SHA-256 hashes, so these scripts run and nothing else inline can. The tutor's
   worker goes inside too, as text. tests/run.sh runs this, so the file is rebuilt before every push:
     node tools/build-offline.js        writes procademy-offline.html next to index.html
   Without the internet the courses, practice, progress and drawings all work; the AI tutor, pictures and
   the readers for attached photos and PDFs need the internet when they are used. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'procademy-offline.html');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// a script inside a page must not contain "</script" or "<!--"; neither changes what the code means here
const safeJs = s => s.replace(/<\/(script)/gi, '<\\/$1').replace(/<!--/g, '<\\!--');
const hashOf = s => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;

let html = read('index.html');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>\n?/g)];
if (!scripts.length) throw new Error('index.html has no scripts to inline');
const inline = [];                                   // the text of every inline script, for the policy
const tag = code => { const c = safeJs(code); inline.push(c); return `<script>${c}</script>\n`; };

// the build is named by what went into it, so the file only changes when the site does
const sources = scripts.map(m => read(m[1])).concat(read('app.css'), read('lib/tutor-worker.js'));
const build = crypto.createHash('sha256').update(sources.join('\n')).digest('hex').slice(0, 10);

// the scripts, in order; before the tutor, the facts this file needs to know about itself
let out = '', at = 0;
scripts.forEach(m => {
  out += html.slice(at, m.index);
  if (m[1] === 'lib/tutor.js') out += tag(`window.PROCADEMY_OFFLINE = ${JSON.stringify({ build })};\nwindow.PROCADEMY_WORKER = ${JSON.stringify(read('lib/tutor-worker.js'))};`);
  out += tag(`/* ${m[1]} */\n` + read(m[1]));
  at = m.index + m[0].length;
});
html = out + html.slice(at);

// the stylesheet inside; the icon as data; nothing else to fetch (the install manifest is for the website)
const css = read('app.css');
if (/<\/style/i.test(css)) throw new Error('app.css contains </style');
html = html.replace('<link rel="stylesheet" href="app.css">', `<style>\n${css}\n</style>`)
  .replace(/<link rel="icon" href="icon.svg" type="image\/svg\+xml">/, `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read('icon.svg')).toString('base64')}" type="image/svg+xml">`)
  .replace(/<link rel="manifest"[^>]*>\n?/, '').replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace(/<!-- preload:start -->[\s\S]*?<!-- preload:end -->\n?/, '');                 // everything is already in the file

// the policy: the same as the site's, plus exactly these inline scripts
const before = html;
html = html.replace(/(http-equiv="Content-Security-Policy" content="[^"]*?script-src [^;"]*)/, `$1 ${inline.map(hashOf).join(' ')}`);
if (html === before) throw new Error('index.html has no script-src in its Content-Security-Policy');
html = html.replace('scripts only from this site and the pinned libraries on jsDelivr, never inline;', 'scripts only from this file (each allowed by its SHA-256 hash) and the pinned libraries on jsDelivr;');
html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<!-- Procademy, the whole site in one file (build ${build}). Made by tools/build-offline.js from the files in the repository; edit those, not this. -->\n<meta name="procademy-build" content="${build}">`);
const markup = html.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '');
for (const ref of markup.matchAll(/(?:src|href)="(?!data:|#|https?:|mailto:)([^"]+)"/g)) throw new Error('still points at a file: ' + ref[1]);

fs.writeFileSync(OUT, html);
console.log(`procademy-offline.html: ${(html.length / 1024 / 1024).toFixed(1)} MB, ${inline.length} scripts, build ${build}`);
