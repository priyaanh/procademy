#!/usr/bin/env node
/* Checks Procademy with no internet, two ways, in headless Chrome over the DevTools protocol:
   1. the one-file build (procademy-offline.html), opened from disk with every network lookup blocked:
      pages render, practice works, drawings draw, progress is kept across a reload, and it never
      tries to reach the network or trips its own security policy;
   2. the website as a phone keeps it: served once over http so the offline helper (sw.js) saves it,
      then the server is stopped and the site is opened again.
   Usage: node tests/offline.js            (run by tests/run.sh after tools/build-offline.js)
   NB: never pass --user-data-dir to Chrome here; it makes headless Chrome hang on macOS. */
'use strict';
const { spawn } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

async function browser(extraFlags) {
  const port = 9800 + Math.floor(Math.random() * 150);
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files', '--remote-debugging-port=' + port, '--window-size=1280,1000'].concat(extraFlags || [], ['about:blank']), { stdio: 'ignore' });
  let version;
  for (let i = 0; i < 120 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch (e) { await wait(100); } }
  if (!version) throw new Error('Chrome did not start');
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('devtools socket failed')); });
  let id = 0; const pending = new Map(); const logs = [];
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result || msg.error); pending.delete(msg.id); return; }
    if (msg.method === 'Log.entryAdded') logs.push(msg.params.entry.level + ': ' + msg.params.entry.text + (msg.params.entry.url ? ' ' + msg.params.entry.url : ''));
    if (msg.method === 'Runtime.exceptionThrown') logs.push('error: ' + ((msg.params.exceptionDetails.exception || {}).description || msg.params.exceptionDetails.text));
  };
  const send = (method, params, sessionId) => new Promise(res => { const m = ++id; pending.set(m, res); ws.send(JSON.stringify({ id: m, method, params, sessionId })); });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId); await send('Page.enable', {}, sessionId); await send('Log.enable', {}, sessionId);
  const go = async url => { await send('Page.navigate', { url }, sessionId); await wait(900); };
  const js = async expr => { const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true }, sessionId); return r && r.result ? r.result.value : undefined; };
  return { go, js, logs, close: () => { ws.close(); chrome.kill(); } };
}

(async () => {
  /* 1. the one-file build, from disk, with the network cut off */
  const file = 'file://' + path.join(ROOT, 'procademy-offline.html');
  const b = await browser(['--host-resolver-rules=MAP * ~NOTFOUND']);
  await b.go(file + '#/');
  ok(await b.js(`return !!window.PROCADEMY_OFFLINE && document.querySelector('main h1') && /Good|Hello|Welcome/.test(document.querySelector('main h1').textContent)`), 'offline file: it opens from disk and shows Home');
  await b.go(file + '#/courses');
  ok(await b.js(`return document.querySelectorAll('main .course-card').length >= 16`), 'offline file: every course is there');
  await b.go(file + '#/course/math-7');
  ok(await b.js(`return document.querySelectorAll('main .sm-unit').length >= 10`), 'offline file: a course page with its units');
  await b.go(file + '#/cpm/cc2');
  ok(await b.js(`return /Core Connections, Course 2/.test(document.querySelector('main').textContent)`), 'offline file: the CPM books');
  await b.go(file + '#/practice/math7.add-negatives');
  ok(await b.js(`
    const m = document.getElementById('main'), s = m.__session; if (!s || s.items.length !== 7) return false;
    const q = s.items[s.i].q;
    if (q.type === 'choice') m.querySelector('#choices button[data-k="' + q.answerIndex + '"]').click();
    else { const inp = m.querySelector('#ans'); inp.value = String(q.answer); inp.dispatchEvent(new Event('input', { bubbles: true })); }
    m.querySelector('#check').click();
    await new Promise(r => setTimeout(r, 50));
    return !!m.querySelector('.feedback.good')`), 'offline file: practice works, and a right answer is marked right');
  ok(await b.js(`const d = document.createElement('div'); d.innerHTML = TUTOR.render('\`\`\`graph\\ny = 2x + 1\\ny = -x + 4\\n\`\`\`'); document.body.appendChild(d); return d.querySelectorAll('svg path').length > 3`), 'offline file: graphs are drawn with no internet');
  await b.js(`STORE.setProfile({ name: 'Offline tester' }); return true`);
  await b.go(file + '#/settings');
  ok(await b.js(`return document.getElementById('name').value === 'Offline tester' && /offline file/.test(document.getElementById('offline-card').textContent)`), 'offline file: progress is kept after it is opened again, and Settings says what it is');
  await b.js(`STORE.setProfile({ name: '' }); return true`);
  await b.go(file + '#/tutor');
  ok(await b.js(`return document.querySelectorAll('.ai-starter').length >= 6`), 'offline file: the tutor page opens (it answers when there is internet)');
  const net = b.logs.filter(l => /ERR_NAME_NOT_RESOLVED|ERR_INTERNET|Failed to load/.test(l));
  const csp = b.logs.filter(l => /Content Security Policy|Refused/.test(l));
  const errs = b.logs.filter(l => /^error/.test(l) && !net.includes(l) && !csp.includes(l));
  ok(!net.length, 'offline file: it never reaches for the network on its own' + (net.length ? ': ' + net.slice(0, 3).join(' | ') : ''));
  ok(!csp.length, 'offline file: its security policy allows exactly its own scripts' + (csp.length ? ': ' + csp.slice(0, 3).join(' | ') : ''));
  ok(!errs.length, 'offline file: no errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  b.close();

  /* 2. the website, kept by the offline helper, then opened with the server gone */
  const port = 8900 + Math.floor(Math.random() * 90);
  let server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${port}/index.html`); break; } catch (e) { await wait(100); } }
  const w = await browser();
  await w.go(`http://127.0.0.1:${port}/index.html#/`);
  const saved = await w.js(`
    for (let i = 0; i < 80; i++) { const keys = (await caches.keys()).filter(k => /^procademy-v/.test(k)); if (keys.length) { const n = (await (await caches.open(keys[0])).keys()).length; if (n >= 40 && navigator.serviceWorker.controller) return n; } await new Promise(r => setTimeout(r, 150)); if (i === 20) location.reload(); }
    return 0`);
  ok(saved >= 40, `website: the offline helper keeps a copy of the site (${saved} files)`);
  server.kill(); await wait(400);
  await w.go(`http://127.0.0.1:${port}/?again#/course/math-7`);
  ok(await w.js(`return document.querySelectorAll('main .sm-unit').length >= 10 && /7th grade math/.test(document.querySelector('main h1').textContent)`), 'website: with the server gone it still opens and works');
  w.close();

  console.log(`RESULTS ${fail} failed of ${pass + fail}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FAIL offline check threw: ' + (e.stack || e.message)); console.log('RESULTS 1 failed of 1'); process.exit(1); });
