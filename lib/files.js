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
    let text = '';
    try { text = await ocr(cv, onProgress); } catch (e) { return { name, kind: 'image', thumb, text: '', note: 'The words couldn’t be read on this device', error: '' }; }
    text = tidy(text);
    return { name, kind: 'image', thumb, text: text.slice(0, KEEP_CHARS), chars: text.length, note: text ? `read ${text.length.toLocaleString()} characters` : 'no words found' };
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
  async function ocr(canvas, onProgress) {
    if (F.ocr) return F.ocr(canvas);                       // tests put a fake reader here
    const w = await ocrWorker(onProgress);
    F.onOcrProgress = m => onProgress({ text: m.status === 'recognizing text' ? 'Reading the words…' : 'Preparing the text reader…', fraction: m.progress || 0 });
    const r = await w.recognize(canvas);
    return (r && r.data && r.data.text) || '';
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
        if (t.length < 20) { try { t = await ocr(cv, onProgress); } catch (e) { /* leave the page empty */ } }
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
          <button type="button" class="iconbtn sm" data-rm="${it.id}" aria-label="Remove ${esc(it.name)}" title="Remove">✕</button></div>
        ${it.status === 'error' ? `<p class="tiny tray-err">${esc(it.error)}</p>` : ''}
        ${it.status === 'ready' && (it.data.kind === 'image' || it.data.kind === 'pdf') ? `<details class="tray-text"><summary class="tiny">${it.data.text ? 'Check what Procademy read' : 'No words were found. Type the question instead.'}</summary><textarea rows="4" aria-label="Text read from ${esc(it.name)}">${esc(it.data.text || '')}</textarea></details>` : ''}</div>`).join('');
      el.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => { items = items.filter(i => String(i.id) !== b.dataset.rm); draw(); }));
      el.querySelectorAll('.tray-item textarea').forEach(t => t.addEventListener('input', () => { const it = items.find(i => String(i.id) === t.closest('.tray-item').dataset.id); if (it && it.data) it.data.text = t.value.slice(0, KEEP_CHARS); }));
      if (onChange) onChange();
    };
    const api = {
      add(list) {
        [...(list || [])].forEach(file => {
          if (items.filter(i => i.status !== 'error').length >= MAX_FILES) { items.push({ id: ++n, name: file.name || 'file', status: 'error', error: `You can attach up to ${MAX_FILES} files at a time.` }); return; }
          const it = { id: ++n, name: String(file.name || 'file').slice(0, 80), status: 'reading', progress: 'Reading…' };
          items.push(it);
          read(file, p => {
            it.progress = (p.text || 'Reading…') + (p.fraction > 0 && p.fraction < 1 ? ` ${Math.round(p.fraction * 100)}%` : '');
            const s = el.querySelector(`.tray-item[data-id="${it.id}"] .tray-state`); if (s) s.textContent = it.progress;
          }).then(r => {
            if (!items.includes(it)) return;
            if (r.error && !r.kind) { it.status = 'error'; it.error = r.error; } else { it.status = 'ready'; it.data = r; }
            draw();
          }, () => { it.status = 'error'; it.error = 'This file couldn’t be read.'; draw(); });
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

  const F = { ACCEPT, MAX_FILES, sniff, read, contextText, drawingOf, chip, keep, tray, ocr: null, pdfLib: null, onOcrProgress: null };
  window.FILES = F;
})();
