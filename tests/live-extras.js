/* Live checks of the parts that need real services, run inside the real site (tests/live-extras.html).
   ./tests/run.sh --live-tutor runs it; add ?unlimited to also start unlimited mode under the policy. */
'use strict';
(async function () {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
  const tick = ms => new Promise(r => setTimeout(r, ms || 0));
  const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch (e) { /* not yet */ } await tick(250); } return false; };
  const frame = document.getElementById('site');
  await new Promise(r => frame.addEventListener('load', r, { once: true }));
  const w = frame.contentWindow, doc = w.document;
  const violations = [];
  doc.addEventListener('securitypolicyviolation', e => { violations.push(e.violatedDirective + ' ' + e.blockedURI); console.log('CSP blocked: ' + e.violatedDirective + ' ' + e.blockedURI); });
  await until(() => w.APP && w.TUTORUI && w.FILES, 10000);

  // 1. the policy is on, and refuses what an attacker would try
  ok(doc.querySelector('meta[http-equiv="Content-Security-Policy"]'), 'security: the site carries its policy');
  const s = doc.createElement('script'); s.textContent = 'window.__inline = 1'; doc.body.appendChild(s);
  let evalBlocked = false; try { w.eval('1'); } catch (e) { evalBlocked = true; }
  const img = doc.createElement('div'); img.innerHTML = '<img src="x" onerror="window.__onerror = 1">'; doc.body.appendChild(img);
  await tick(300);
  ok(!w.__inline && evalBlocked && !w.__onerror, 'security: inline scripts, eval and inline event handlers are all refused');
  violations.length = 0;

  // 2. a photo of homework: its words read on this device
  const cv = doc.createElement('canvas'); cv.width = 900; cv.height = 260;
  const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 900, 260); g.fillStyle = '#111'; g.font = 'bold 64px Arial'; g.fillText('Solve 2x + 3 = 11', 40, 150);
  const png = await new Promise(r => cv.toBlob(r, 'image/png'));
  let t0 = performance.now();
  const photo = await w.FILES.read(new w.File([png], 'homework.png', { type: 'image/png' }), p => {});
  ok(photo.kind === 'image' && /2x/.test(photo.text) && /11/.test(photo.text), `files: a photo's words are read on this device (${((performance.now() - t0) / 1000).toFixed(1)} s): "${(photo.text || photo.error || '').replace(/\s+/g, ' ')}"`);

  // 3. a PDF: its text
  const body = 'BT /F1 24 Tf 20 60 Td (Find x: 3x = 12) Tj ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>', `<< /Length ${body.length} >>\nstream\n${body}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  t0 = performance.now();
  const doc1 = await w.FILES.read(new w.File([pdf], 'worksheet.pdf', { type: 'application/pdf' }));
  ok(doc1.kind === 'pdf' && /3x\s*=\s*12/.test(doc1.text) && /^data:image\/jpeg/.test(doc1.thumb || ''), `files: a PDF's text is read (${((performance.now() - t0) / 1000).toFixed(1)} s): "${(doc1.text || doc1.error || '').replace(/\s+/g, ' ')}"`);

  // 3b. a QR code from the real QR library (loaded from jsDelivr under the policy)
  const qrSvg = await w.MOVE.qr('https://priyaanh.github.io/procademy/#/vs/test');
  ok(/^<svg/.test(qrSvg || '') && /<path|<rect/.test(qrSvg), 'move: the QR code maker loads and draws a code');

  // 4. a picture from the free picture AI (it may be full for a while: Procademy waits and retries)
  w.location.hash = '#/tutor/new'; await tick(400);
  const pic = w.PICTURES.make('a friendly cartoon owl teacher at a chalkboard');
  const holder = doc.createElement('div'); holder.innerHTML = w.PICTURES.html(pic); doc.body.appendChild(holder);
  t0 = performance.now();
  const got = await until(() => holder.querySelector('img') || (w.PICTURES.state(pic) || {}).status === 'error', 200000);
  const st = w.PICTURES.state(pic) || {};
  ok(got && st.status === 'ready' && holder.querySelector('img').naturalWidth >= 256, `pictures: the picture AI made a picture (${((performance.now() - t0) / 1000).toFixed(0)} s)${st.error ? ': ' + st.error : ''}`);
  holder.remove();

  // 5. the cloud tutor: a graph asked for in words is drawn exactly, and the tutor explains it
  w.location.hash = '#/course/math-7'; await tick(400);
  const UI = w.TUTORUI, T = w.TUTOR;
  UI.open(); UI.reset();
  const ask = async q => {
    const n = UI.history().length;
    const p = doc.getElementById('tutor');
    p.querySelector('#tutor-text').value = q; p.querySelector('#tutor-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
    await until(() => UI.history().length >= n + 2 && !T.busy() && UI.history()[n + 1].content, 120000);
    return UI.history()[n + 1] || {};
  };
  t0 = performance.now();
  let r = await ask('Graph y = x^2 - 4 and tell me where it crosses the x-axis.');
  ok(r.viz && /x\^2 - 4/.test(r.viz) && /\b2\b/.test(r.content) && doc.querySelector('#tutor .tmsg.assistant:last-child .viz-graph svg'), `tutor: draws y = x² − 4 and explains it (${((performance.now() - t0) / 1000).toFixed(1)} s): ${String(r.content).replace(/\s+/g, ' ').slice(0, 160)}`);
  t0 = performance.now();
  r = await ask('Make a bar graph of how many legs a spider, a dog and a bird have.');
  if (/busy/.test(r.content)) { console.log('  (the free services were busy; asking again in a minute)'); await tick(60000); r = await ask('Make a bar graph of how many legs a spider, a dog and a bird have.'); }
  const drawn = doc.querySelector('#tutor .tmsg.assistant:last-child .viz-chart svg rect, #tutor .tmsg.assistant:last-child .viz svg');
  ok(drawn && !/```/.test(doc.querySelector('#tutor .tmsg.assistant:last-child').textContent), `tutor: writes its own drawing block when there is nothing to draw from the question (${((performance.now() - t0) / 1000).toFixed(1)} s)`);
  console.log('  reply: ' + String(r.content).replace(/\s+/g, ' ').slice(0, 300));

  // 6. optional: unlimited mode starts under the policy
  if (/unlimited/.test(location.search)) {
    t0 = performance.now();
    await T.prepareLocal();
    await until(() => T.local.state === 'ready' || T.local.state === 'error' || T.local.state === 'unsupported', 600000);
    ok(T.local.state === 'ready', `unlimited mode starts with the security policy on (${((performance.now() - t0) / 1000).toFixed(0)} s)${T.local.error ? ': ' + T.local.error : ''}`);
  }
  ok(!violations.length, 'security: nothing the site needs was blocked by its own policy' + (violations.length ? ': ' + violations.join('; ') : ''));
  console.log(`RESULTS ${fail} failed of ${pass + fail}`);
})().catch(e => { console.log('FAIL live extras threw: ' + (e.stack || e.message)); console.log('RESULTS 1 failed of 1'); });
