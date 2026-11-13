/* Files the learner attaches to a question: a photo of homework, a worksheet PDF, or a text or CSV file.

   A file is only ever read as data. It is never run, and never shown as a page, so a file cannot take
   over Procademy:
   - Only these kinds are accepted, judged by the bytes at the start of the file rather than its name:
     PNG, JPEG, GIF and WebP pictures, PDF, and plain text (.txt, .csv, .tsv, .md, .json). Web pages, SVG,
     programs, archives and everything else are refused.
   - Limits: 15 MB a picture or PDF, 1 MB of text, three files a question, the first 10 pages of a PDF.
   - A picture is decoded and redrawn on a canvas, and only that clean copy is kept (at most 1600 px).
     Anything hidden inside the file goes, and so do the camera's details, such as where it was taken.
   - Whatever is read from a file is escaped wherever it is shown, and goes to the AI marked as the
     student's material, never as instructions (see SYSTEM in tutor.js).
   - The file stays on this device. Only the text read from it goes with the question.
   The free AI services read text only, so the words in a picture are read on this device with Tesseract.js
   (fetched the first time a picture is attached, about 4 MB, then kept by the browser); PDFs are read
   with PDF.js (about 2 MB, also only when needed). Both come from jsDelivr at pinned versions. */
'use strict';
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MAX_FILES = 3, MAX_BYTES = 15 * 1024 * 1024, MAX_TEXT = 1024 * 1024, MAX_PAGES = 10, MAX_SIDE = 1600, KEEP_CHARS = 4000;
  const TESS = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/';
  const TESS_CORE = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0';
  const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/build/';
  const TEXT_EXT = /\.(txt|csv|tsv|md|markdown|json|text)$/i;
  const ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.csv,.tsv,.md,.json,image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,text/csv';

  /** what a file really is, from its first bytes: png | jpeg | gif | webp | pdf | text | null */
  function sniff(bytes, name) {
    const b = bytes, at = (i, s) => s.split('').every((c, k) => b[i + k] === c.charCodeAt(0));
    if (b.length >= 8 && b[0] === 0x89 && at(1, 'PNG')) return 'png';
    if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
    if (b.length >= 6 && (at(0, 'GIF87a') || at(0, 'GIF89a'))) return 'gif';
    if (b.length >= 12 && at(0, 'RIFF') && at(8, 'WEBP')) return 'webp';
    if (b.length >= 5 && at(0, '%PDF-')) return 'pdf';
    // text: a text name, no NUL bytes, and valid UTF-8, and not a web page or an SVG in disguise
    if (TEXT_EXT.test(name || '')) {
      if (b.includes(0)) return null;
      let s;
      try { s = new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(0, Math.min(b.length, 4096))); } catch (e) { if (b.length < 4096) return null; }
      if (s !== undefined && /^\s*<(!doctype|html|svg|script|\?xml)/i.test(s)) return null;
      return 'text';
    }
    return null;
  }
  async function head(file, n) { return new Uint8Array(await file.slice(0, n).arrayBuffer()); }

  /** read one file into { name, kind, text, thumb, note } or { name, error } */
  async function read(file, onProgress) {
    onProgress = onProgress || (() => {});
    const name = String(file.name || 'file').replace(/[^\w .()-]/g, '_').slice(0, 80);
    if (!file || !file.size) return { name, error: 'This file is empty.' };
    const kind = sniff(await head(file, 4096), file.name);
    if (!kind) return { name, error: 'Procademy can read pictures (PNG, JPEG, GIF, WebP), PDFs and text or CSV files. This file isn’t one of those, so it wasn’t opened.' };
    if (kind === 'text') {
      if (file.size > MAX_TEXT) return { name, error: 'This text file is over 1 MB. Attach a smaller part of it.' };
      let text = '';
      try { text = new TextDecoder('utf-8', { fatal: false }).decode(await file.arrayBuffer()); } catch (e) { return { name, error: 'This file couldn’t be read as text.' }; }
      text = tidy(text);
      const csv = /\.(csv|tsv)$/i.test(file.name) || looksLikeTable(text);
      return { name, kind: csv ? 'csv' : 'text', text: text.slice(0, KEEP_CHARS), chars: text.length, note: `${text.length.toLocaleString()} characters` };
    }
    if (file.size > MAX_BYTES) return { name, error: 'This file is over 15 MB. Use a smaller photo or fewer pages.' };
    if (kind === 'pdf') return readPdf(file, name, onProgress);
    return readImage(file, name, onProgress);
  }
  function tidy(s) {
    return String(s).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‏‪-‮⁦-⁩]/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  const looksLikeTable = s => { const rows = s.split('\n').slice(0, 6); return rows.length >= 2 && rows.every(r => (r.match(/,/g) || []).length >= 1) && new Set(rows.map(r => (r.match(/,/g) || []).length)).size === 1; };

  /** a picture: decoded, redrawn clean and small, then its words read on this device */
  async function readImage(file, name, onProgress) {
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { return { name, error: 'This picture couldn’t be opened. It may be damaged.' }; }
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(bmp.width * scale)); cv.height = Math.max(1, Math.round(bmp.height * scale));
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
    if (bmp.close) bmp.close();
    const thumb = thumbOf(cv);
    onProgress({ text: 'Reading the words in the picture…', fraction: 0.05 });
    let o;
    try { o = asRead(await ocr(cv, onProgress)); } catch (e) { return { name, kind: 'image', thumb, text: '', note: 'The words couldn’t be read on this device', error: '' }; }
    const text = tidy(o.text);
    return { name, kind: 'image', thumb, text: text.slice(0, KEEP_CHARS), chars: text.length, note: text ? `read ${text.length.toLocaleString()} characters` : 'no words found', sure: sureOf(Object.assign(o, { text })) };
  }
  function thumbOf(cv) {
    const t = document.createElement('canvas'), k = Math.min(1, 220 / Math.max(cv.width, cv.height));
    t.width = Math.max(1, Math.round(cv.width * k)); t.height = Math.max(1, Math.round(cv.height * k));
    t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
    return t.toDataURL('image/jpeg', 0.72);
  }
  let tessWorker = null, tessLoading = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) { res(); return; }
      const s = document.createElement('script'); s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = () => res(); s.onerror = () => rej(new Error('couldn’t load ' + src));
      document.head.appendChild(s);
    });
  }
  async function ocrWorker(onProgress) {
    if (tessWorker) return tessWorker;
    if (!tessLoading) tessLoading = (async () => {
      await loadScript(TESS + 'tesseract.min.js');
      tessWorker = await window.Tesseract.createWorker('eng', 1, {
        workerPath: TESS + 'worker.min.js', corePath: TESS_CORE,
        logger: m => { if (F.onOcrProgress) F.onOcrProgress(m); },
      });
      return tessWorker;
    })().catch(e => { tessLoading = null; throw e; });
    F.onOcrProgress = m => onProgress({ text: m.status === 'recognizing text' ? 'Reading the words…' : 'Preparing the text reader (first time only)…', fraction: m.progress || 0 });
    return tessLoading;
  }
  /** the words in a picture: { text, confidence (0 to 100), words: [{ text, confidence, choices }] } */
  async function ocr(canvas, onProgress) {
    if (F.ocr) return F.ocr(canvas);                       // tests put a fake reader here (it may give just the text)
    const w = await ocrWorker(onProgress);
    F.onOcrProgress = m => onProgress({ text: m.status === 'recognizing text' ? 'Reading the words…' : 'Preparing the text reader…', fraction: m.progress || 0 });
    const r = await w.recognize(canvas, {}, { text: true, blocks: true });
    const d = (r && r.data) || {}, words = [];
    (d.blocks || []).forEach(b => (b.paragraphs || []).forEach(pg => (pg.lines || []).forEach(l => (l.words || []).forEach(x => words.push({ text: x.text, confidence: x.confidence, choices: (x.choices || []).map(c => c && c.text) })))));
    return { text: d.text || '', confidence: d.confidence, words };
  }
  const asRead = o => (o && typeof o === 'object' ? { text: String(o.text || ''), confidence: o.confidence, words: Array.isArray(o.words) ? o.words : [] } : { text: String(o || ''), confidence: null, words: [] });
  /* ---------- how sure the reader is: its own score (0 to 100), and the words it was least sure of, each with other
     ways to read it: the reader's own second choices, and the usual mix-ups in math (S and 5, O and 0, l and 1,
     Z and 2, B and 8, g and 9, an x between numbers and ×) ---------- */
  const MIXUPS = [[/S/g, '5'], [/[Oo]/g, '0'], [/[lI|]/g, '1'], [/[Zz]/g, '2'], [/B/g, '8'], [/[gq]/g, '9']];
  /** other ways to read a word that is mostly numbers: "2S" → "25", "l5" → "15", "1O" → "10", "3x4" → "3 × 4" */
  function mathAlts(word) {
    const w = String(word || ''), digits = (w.match(/\d/g) || []).length, letters = (w.match(/[a-z|]/gi) || []).length, out = [];
    if (digits && letters && letters <= digits) { let t = w; MIXUPS.forEach(([re, d]) => { t = t.replace(re, d); }); if (t !== w && /\d/.test(t)) out.push(t); }
    if (/^\d+x\d+$/i.test(w)) out.push(w.replace(/x/i, ' × '));
    return out;
  }
  /** { conf: 0–100 or null, unsure: [{ word, alts }] } (at most six words, three ways each) */
  function sureOf(o) {
    const conf = typeof o.confidence === 'number' && isFinite(o.confidence) ? Math.max(0, Math.min(100, Math.round(o.confidence))) : null, unsure = [];
    const add = (word, alts) => { alts = [...new Set(alts.filter(a => typeof a === 'string' && a.trim() && a.toLowerCase() !== word.toLowerCase()))].slice(0, 3); if (alts.length && unsure.length < 6 && !unsure.some(u => u.word === word)) unsure.push({ word, alts }); };
    if (o.words && o.words.length) o.words.forEach(w => { if (w && typeof w.text === 'string' && w.text.trim() && Number(w.confidence) < 75) add(w.text, (w.choices || []).concat(mathAlts(w.text))); });
    else String(o.text || '').split(/\s+/).forEach(t => add(t, mathAlts(t)));
    return { conf, unsure };
  }

  /** a PDF: its text, page by page; a scanned page with no text is read like a photo */
  async function readPdf(file, name, onProgress) {
    let lib;
    try { lib = F.pdfLib || await import(PDFJS + 'pdf.min.mjs'); } catch (e) { return { name, error: 'The PDF reader couldn’t be loaded. Check the internet connection.' }; }
    if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.mjs';
    let doc;
    try { doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false, enableXfa: false, disableFontFace: true, useSystemFonts: false }).promise; }
    catch (e) { return { name, error: /password/i.test(e && e.message) ? 'This PDF is locked with a password.' : 'This PDF couldn’t be opened. It may be damaged.' }; }
    const pages = Math.min(doc.numPages, MAX_PAGES);
    const parts = [];
    let thumb = '';
    for (let p = 1; p <= pages; p++) {
      onProgress({ text: `Reading page ${p} of ${pages}…`, fraction: (p - 1) / pages });
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      let t = tc.items.map(it => it.str + (it.hasEOL ? '\n' : ' ')).join('').trim();
      if (p === 1 || t.length < 20) {
        const vp = page.getViewport({ scale: 1 }), k = Math.min(2, MAX_SIDE / Math.max(vp.width, vp.height));
        const cv = document.createElement('canvas'), v2 = page.getViewport({ scale: k });
        cv.width = Math.round(v2.width); cv.height = Math.round(v2.height);
        const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        await page.render({ canvasContext: ctx, viewport: v2 }).promise;
        if (p === 1) thumb = thumbOf(cv);
        if (t.length < 20) { try { t = asRead(await ocr(cv, onProgress)).text; } catch (e) { /* leave the page empty */ } }
      }
      parts.push(pages > 1 ? `[Page ${p}]\n${t}` : t);
      if (parts.join('\n').length > KEEP_CHARS * 2) break;
    }
    try { doc.destroy(); } catch (e) { /* fine */ }
    const text = tidy(parts.join('\n\n'));
    return { name, kind: 'pdf', thumb, text: text.slice(0, KEEP_CHARS), chars: text.length, note: `${pages} page${pages === 1 ? '' : 's'}${doc.numPages > pages ? ` of ${doc.numPages}` : ''} · ${text.length.toLocaleString()} characters` };
  }

  /** the attached files as context for the tutor: marked as the student's material, never as instructions */
  function contextText(files) {
    const ok = (files || []).filter(f => f && !f.error);
    if (!ok.length) return '';
    let room = 3000;
    return 'The student attached ' + ok.map(f => `"${f.name}" (${f.kind === 'image' ? 'a photo' : f.kind === 'pdf' ? 'a PDF' : f.kind === 'csv' ? 'a table of data' : 'a text file'})`).join(', ') + '. ' +
      ok.map(f => {
        const t = String(f.text || '').slice(0, Math.max(0, room)); room -= t.length;
        return `Text read from "${f.name}"${f.kind === 'image' || (f.kind === 'pdf' && /\[Page/.test(t)) ? ' (read by a scanner on the device, so a symbol may be misread; if something looks odd, ask)' : ''}:\n<<<\n${t || '(no words found)'}\n>>>`;
      }).join('\n');
  }
  /** a table in a CSV file as a drawing: label + number → bar chart, two number columns → points */
  function drawingOf(f) {
    if (!f || f.kind !== 'csv' || !f.text) return null;
    const rows = f.text.split('\n').map(r => r.split(/\t|,/).map(c => c.trim().replace(/^"|"$/g, ''))).filter(r => r.length >= 2 && r.some(Boolean));
    if (rows.length < 2) return null;
    const isN = c => c !== '' && isFinite(Number(c));
    const header = !isN(rows[0][1]) ? rows.shift() : null;
    const body = rows.filter(r => isN(r[1])).slice(0, 40);
    if (body.length < 2) return null;
    if (body.every(r => isN(r[0]))) {
      const lines = ['points ' + body.map(r => `(${Number(r[0])}, ${Number(r[1])})`).join(' ')];
      if (header) lines.push(`x label: ${header[0].slice(0, 30)}`, `y label: ${header[1].slice(0, 30)}`);
      return '```graph\n' + lines.join('\n') + '\n```';
    }
    const lines = ['bar'].concat(header ? [`title: ${header[1].slice(0, 40)}`] : []).concat(body.map(r => `${r[0].replace(/[:=|]/g, ' ').slice(0, 24)}: ${Number(r[1])}`));
    return '```chart\n' + lines.join('\n') + '\n```';
  }
  /** a worksheet's text split into its numbered problems ("1.", "2)", "(3)", "#4", "Problem 5", "Q6"), for a
      homework plan: [{ n, text }]. A problem's later lines join it; numbering that jumps back (a step "1." inside a
      problem) is kept with the problem before it. */
  function problems(text) {
    const START = /^\s*(?:(?:problem|question|exercise|q)\s*#?\s*(\d{1,3})\s*[:.)-]?|#\s*(\d{1,3})\s*[:.)-]?|\(\s*(\d{1,3})\s*\)|(\d{1,3})\s*[.)](?!\d))\s*(.*)$/i;
    const out = [];
    let cur = null;
    String(text || '').replace(/\r\n?/g, '\n').split('\n').forEach(raw => {
      const line = raw.replace(/\s+/g, ' ').trim();
      if (!line || /^\[page \d+\]$/i.test(line)) return;
      const m = START.exec(line), n = m ? Number(m[1] || m[2] || m[3] || m[4]) : null;
      const rest = m ? String(m[5] || '').trim() : '';
      if (m && rest && (!cur || n > cur.n || (n === 1 && cur.n > 3 && !out.some(p => p.n === 1)))) { cur = { n, text: rest }; out.push(cur); return; }
      if (cur && cur.text.length < 600) cur.text += ' ' + line;          // the rest of a problem (or a step inside it)
    });
    return out.filter(p => p.text.replace(/[^a-z0-9]/gi, '').length >= 2).slice(0, 30).map(p => ({ n: p.n, text: p.text.slice(0, 300) }));
  }

  /** a file as a small chip in a message: the clean thumbnail, or an icon, and its name */
  function chip(f) {
    const thumb = typeof f.thumb === 'string' && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(f.thumb) ? f.thumb : '';
    // a drawn page with its type written on it (no emoji); currentColor keeps it readable in both themes
    const icon = `<svg width="22" height="26" viewBox="0 0 22 26" style="vertical-align:middle"><path d="M2 1.5 h12 l6 6 v17 h-18 z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 1.5 v6 h6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><text x="11" y="20" text-anchor="middle" font-size="6.5" font-weight="700" fill="currentColor">${f.kind === 'pdf' ? 'PDF' : f.kind === 'csv' ? 'CSV' : 'TXT'}</text></svg>`;
    return `<span class="file-chip" title="${esc(f.name)}">${thumb ? `<img src="${thumb}" alt="">` : `<span class="fi" aria-hidden="true">${icon}</span>`}<span class="fn">${esc(f.name)}</span>${f.note ? `<span class="tiny muted">${esc(f.note)}</span>` : ''}</span>`;
  }
  /** only what a saved chat needs: no original file, a size-capped text and the clean thumbnail */
  function keep(f) { return { name: f.name, kind: f.kind, text: String(f.text || '').slice(0, KEEP_CHARS), thumb: f.thumb || '', note: f.note || '' }; }

  /** the files waiting to go with the next question, shown in el: each is read as soon as it is added,
      can be checked and corrected (what a scanner reads is not always right) and removed */
  function tray(el, onChange) {
    let items = [], n = 0;
    const draw = () => {
      el.hidden = !items.length;
      el.innerHTML = items.map(it => `<div class="tray-item${it.status === 'error' ? ' bad' : ''}" data-id="${it.id}">
        <div class="tray-row">${chip(it.data || { name: it.name, kind: it.kind })}
          <span class="tray-state tiny muted">${it.status === 'reading' ? esc(it.progress || 'Reading…') : ''}</span>
          ${it.status === 'ready' && it.data.kind === 'image' && it.file ? `<button type="button" class="chip-btn" data-crop="${it.id}" title="Read only the part with the question">Crop</button>` : ''}
          <button type="button" class="iconbtn sm" data-rm="${it.id}" aria-label="Remove ${esc(it.name)}" title="Remove">✕</button></div>
        ${it.status === 'error' ? `<p class="tiny tray-err">${esc(it.error)}</p>` : ''}
        ${it.status === 'ready' && (it.data.kind === 'image' || it.data.kind === 'pdf') ? `<details class="tray-text"><summary class="tiny">${it.data.text ? 'Check what Procademy read' : 'No words were found. Type the question instead.'}</summary><textarea rows="4" aria-label="Text read from ${esc(it.name)}">${esc(it.data.text || '')}</textarea></details>` : ''}</div>`).join('');
      el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { items = items.filter(i => String(i.id) !== b.dataset.rm); draw(); }));
      el.querySelectorAll('[data-crop]').forEach(b => b.addEventListener('click', async () => {
        const it = items.find(i => String(i.id) === b.dataset.crop); if (!it || !it.file) return;
        const part = await crop(it.file);
        if (part && part !== it.file && items.includes(it)) { it.file = part; it.status = 'reading'; it.progress = 'Reading…'; draw(); readInto(it, part); }
      }));
      el.querySelectorAll('.tray-item textarea').forEach(t => t.addEventListener('input', () => { const it = items.find(i => String(i.id) === t.closest('.tray-item').dataset.id); if (it && it.data) it.data.text = t.value.slice(0, KEEP_CHARS); }));
      if (onChange) onChange();
    };
    /** read one file into its place in the tray (again, after a crop) */
    function readInto(it, file) {
      read(file, p => {
        it.progress = (p.text || 'Reading…') + (p.fraction > 0 && p.fraction < 1 ? ` ${Math.round(p.fraction * 100)}%` : '');
        const s = el.querySelector(`.tray-item[data-id="${it.id}"] .tray-state`); if (s) s.textContent = it.progress;
      }).then(r => {
        if (!items.includes(it)) return;
        if (r.error && !r.kind) { it.status = 'error'; it.error = r.error; } else { it.status = 'ready'; it.data = Object.assign(r, { name: it.name }); }
        draw();
      }, () => { it.status = 'error'; it.error = 'This file couldn’t be read.'; draw(); });
    }
    const api = {
      add(list) {
        [...(list || [])].forEach(file => {
          if (items.filter(i => i.status !== 'error').length >= MAX_FILES) { items.push({ id: ++n, name: file.name || 'file', status: 'error', error: `You can attach up to ${MAX_FILES} files at a time.` }); return; }
          const it = { id: ++n, name: String(file.name || 'file').slice(0, 80), status: 'reading', progress: 'Reading…', file };
          items.push(it);
          readInto(it, file);
        });
        draw();
      },
      /** the files that are ready, without clearing them */
      peek() { return items.filter(i => i.status === 'ready').map(i => i.data); },
      /** the files that are ready; the tray empties */
      take() { const out = api.peek(); items = []; draw(); return out; },
      busy() { return items.some(i => i.status === 'reading'); },
      count() { return items.filter(i => i.status === 'ready').length; },
      clear() { items = []; draw(); },
      /** show the same files in a new element (a page that redraws itself) */
      mount(next) { el = next; draw(); },
    };
    return api;
  }

  /** a picture turned a quarter turn at a time (1 to the right, -1 to the left), redrawn clean as a PNG; the same
      file for no turn (or one that can't be opened) */
  function rotate(file, turns) {
    const q = ((Math.round(turns) % 4) + 4) % 4;
    if (!q) return Promise.resolve(file);
    return createImageBitmap(file).then(bmp => new Promise(res => {
      const k = Math.min(1, 2400 / Math.max(bmp.width, bmp.height)), w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
      const cv = document.createElement('canvas'), side = q % 2 === 1;
      cv.width = side ? h : w; cv.height = side ? w : h;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.translate(cv.width / 2, cv.height / 2); ctx.rotate(q * Math.PI / 2); ctx.drawImage(bmp, -w / 2, -h / 2, w, h);
      if (bmp.close) bmp.close();
      cv.toBlob(b => res(b ? new File([b], String(file.name || 'picture').replace(/\.[a-z0-9]+$/i, '') + '.png', { type: 'image/png' }) : file), 'image/png');
    }), () => file);
  }

  /* ---------- cropping and turning: read only the part of a picture with the question, the right way up ----------
     The picture shows in a dialog; Turn left and Turn right turn it, and dragging across it draws a box, so only
     that part is read. It never leaves the device: it is turned and cut out on a canvas, like every picture here. */
  /** resolves to the part chosen (a PNG file), the whole picture (the same file, or a turned copy), or null for Cancel */
  function crop(file) {
    return new Promise(resolve => {
      let url;
      try { url = URL.createObjectURL(file); } catch (e) { resolve(file); return; }
      const back = document.activeElement, wrap = document.createElement('div');
      let cur = file, turns = 0;
      wrap.className = 'crop-wrap';
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'crop-h');
      wrap.innerHTML = `<div class="crop-card"><h2 id="crop-h">Crop or turn the picture</h2><p class="small muted">Turn it so the writing is upright, then drag across the question you want. Only that part is read.</p>
        <div class="crop-stage" id="crop-stage"><img id="crop-img" alt="Your picture" draggable="false"><div class="crop-box" id="crop-box" hidden></div></div>
        <div class="btn-row"><button type="button" class="btn primary" id="crop-go" disabled>Read this part</button><button type="button" class="btn" id="crop-all">Use the whole picture</button><button type="button" class="btn" id="crop-left">Turn left</button><button type="button" class="btn" id="crop-right">Turn right</button><button type="button" class="btn ghost" id="crop-no">Cancel</button></div></div>`;
      document.body.appendChild(wrap);
      const img = wrap.querySelector('#crop-img'), box = wrap.querySelector('#crop-box'), stage = wrap.querySelector('#crop-stage'), go = wrap.querySelector('#crop-go');
      let sel = null, from = null;
      const finish = out => { wrap.remove(); URL.revokeObjectURL(url); document.removeEventListener('keydown', onKey, true); if (back && back.focus) back.focus(); resolve(out); };
      const turn = async by => {
        turns += by;
        const next = await rotate(file, turns);
        if (!wrap.isConnected) return;
        cur = next; sel = null; show();
        URL.revokeObjectURL(url); url = URL.createObjectURL(cur); img.src = url;
      };
      wrap.querySelector('#crop-left').addEventListener('click', () => turn(-1));
      wrap.querySelector('#crop-right').addEventListener('click', () => turn(1));
      const onKey = ev => { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); finish(null); } };
      document.addEventListener('keydown', onKey, true);
      const at = ev => { const r = img.getBoundingClientRect(); return [Math.max(0, Math.min(r.width, ev.clientX - r.left)), Math.max(0, Math.min(r.height, ev.clientY - r.top))]; };
      const show = () => {
        const r = img.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        box.hidden = !sel; go.disabled = !sel;
        if (sel) Object.assign(box.style, { left: (r.left - sr.left + sel.x) + 'px', top: (r.top - sr.top + sel.y) + 'px', width: sel.w + 'px', height: sel.h + 'px' });
      };
      stage.addEventListener('pointerdown', ev => { if (!img.naturalWidth) return; ev.preventDefault(); from = at(ev); sel = null; try { stage.setPointerCapture(ev.pointerId); } catch (e) { /* a synthetic event */ } show(); });
      stage.addEventListener('pointermove', ev => {
        if (!from) return;
        const [x, y] = at(ev);
        sel = { x: Math.min(x, from[0]), y: Math.min(y, from[1]), w: Math.abs(x - from[0]), h: Math.abs(y - from[1]) };
        if (sel.w < 10 || sel.h < 10) sel = null;
        show();
      });
      stage.addEventListener('pointerup', () => { from = null; });
      wrap.querySelector('#crop-no').addEventListener('click', () => finish(null));
      wrap.querySelector('#crop-all').addEventListener('click', () => finish(cur));
      go.addEventListener('click', () => {
        if (!sel) return;
        const k = img.naturalWidth / img.getBoundingClientRect().width, cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(sel.w * k)); cv.height = Math.max(1, Math.round(sel.h * k));
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(img, sel.x * k, sel.y * k, cv.width, cv.height, 0, 0, cv.width, cv.height);
        cv.toBlob(b => finish(b ? new File([b], 'part of ' + String(file.name || 'picture').replace(/\.[a-z]+$/i, '') + '.png', { type: 'image/png' }) : cur), 'image/png');
      });
      img.addEventListener('load', () => { if (!turns) wrap.querySelector('#crop-all').focus(); });
      img.addEventListener('error', () => finish(cur));
      img.src = url;
      wrap.__select = (x, y, w, h) => { sel = { x, y, w, h }; show(); };            // for the test suite
      wrap.__turn = turn;
    });
  }

  /** start loading the text reader before a picture arrives (a page that is about to need it), so reading is quick */
  function warm() { if (!F.ocr && !tessWorker && !tessLoading && navigator.onLine !== false) ocrWorker(() => {}).catch(() => {}); }

  const F = { ACCEPT, MAX_FILES, sniff, read, contextText, drawingOf, chip, keep, tray, warm, crop, rotate, problems, sureOf, mathAlts, ocr: null, pdfLib: null, onOcrProgress: null };
  window.FILES = F;
})();
