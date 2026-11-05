#!/usr/bin/env node
/* Runs a page in headless Chrome over the DevTools protocol and prints its console output in REAL time.
   (--virtual-time-budget fast-forwards timers, so suites that wait on real work end early under it.)
   Usage: node tests/cdp.js <url> [maxMs] [stopWhenLineContains] [--dark]
   WINDOW=390,844 emulates a phone of that size.
   NB: never pass --user-data-dir to Chrome here; it makes headless Chrome hang on macOS. */
'use strict';
const { spawn } = require('child_process');
const url = process.argv[2];
const maxMs = Number(process.argv[3] || 30000);
const stopOn = process.argv[4] || null;
const dark = process.argv.includes('--dark');          // emulate prefers-color-scheme: dark
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9400 + Math.floor(Math.random() * 400);
const gpu = /webgpu/i.test(process.env.EXTRA_FLAGS || '');      // the live tutor test needs the real GPU
// a suite that runs past 5 minutes (a busy computer) would otherwise have its timers slowed to once a minute,
// because headless Chrome treats the page as a background tab; and the suite changes the address hundreds of times
// in seconds, which Chrome would start quietly ignoring (flooding protection)
const NO_THROTTLE = ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-features=IntensiveWakeUpThrottling', '--disable-ipc-flooding-protection'];
const chrome = spawn(CHROME, ['--headless=new'].concat(gpu ? [] : ['--disable-gpu'], ['--no-first-run'], NO_THROTTLE).concat([ '--allow-file-access-from-files', '--remote-debugging-port=' + port,
  '--window-size=1280,1000'].concat((process.env.EXTRA_FLAGS || '').split(' ').filter(Boolean), ['about:blank'])), { stdio: 'ignore' });
let sawError = false;

(async () => {
  let version;
  for (let i = 0; i < 120 && !version; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); }
    catch (e) { await new Promise(r => setTimeout(r, 100)); }
  }
  if (!version) throw new Error('Chrome did not start a debugging port');
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('devtools socket failed')); });
  let id = 0; const pending = new Map();
  const send = (method, params, sessionId) => new Promise(res => { const m = ++id; pending.set(m, res); ws.send(JSON.stringify({ id: m, method, params, sessionId })); });
  let done; const finished = new Promise(r => { done = r; });
  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result || msg.error); pending.delete(msg.id); return; }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => (a.value !== undefined ? String(a.value) : (a.description || a.type))).join(' ');
      console.log(text);
      if (msg.params.type === 'error') sawError = true;
      if (stopOn && text.includes(stopOn)) done();
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      sawError = true;
      const d = msg.params.exceptionDetails;
      console.log('EXCEPTION ' + ((d.exception && d.exception.description) || d.text));
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, sessionId);
  await send('Page.enable', {}, sessionId);
  if (process.env.WINDOW) { const [w, h] = process.env.WINDOW.split(',').map(Number); await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: true }, sessionId); }
  if (dark) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] }, sessionId);
  await send('Page.navigate', { url }, sessionId);
  const timer = setTimeout(done, maxMs);
  await finished;
  clearTimeout(timer);
  ws.close(); chrome.kill();
  process.exit(sawError ? 1 : 0);
})().catch(e => { console.error('harness error:', e.message); chrome.kill(); process.exit(2); });
