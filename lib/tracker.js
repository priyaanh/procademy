/* The merit badge tracker (#/scouts, #/scouts/<badge>, a Tools card): a checklist for each Scouts merit badge a
   learner is working on. The learner types or pastes the requirements from their own pamphlet or workbook (one
   per line; "1.", "2a.", "(b)" and "Requirement 3:" become labels, and lines that wrap are joined back up), then
   ticks each one off with the date it was done and a note. Each badge keeps its counselor, start and finish
   dates, and notes, and can be copied as text to send to a counselor. Procademy ships no requirement text of its
   own. Kept per learner in profile.scouts = { badges: { id: { name, counselor, started, done, notes, reqs, t } } },
   so it travels with an account (merged badge by badge, the newer edit winning; a removed badge is kept as
   { gone, t } so it stays removed). */
'use strict';
(function () {
  const S = window.STORE, V = window.VIEWS, H = V && V._h;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const kept = () => { const p = S.get().profile.scouts; return p && typeof p === 'object' && !Array.isArray(p) ? JSON.parse(JSON.stringify(p)) : {}; };
  const all = () => { const b = kept().badges; return b && typeof b === 'object' ? b : {}; };
  /** the badges being tracked, newest first (removed ones left out) */
  const badges = () => Object.entries(all()).filter(([, b]) => b && !b.gone && b.name).map(([id, b]) => Object.assign({ id }, b)).sort((a, b) => (b.started || '').localeCompare(a.started || '') || (b.t || 0) - (a.t || 0));
  const badge = id => { const b = all()[id]; return b && !b.gone ? Object.assign({ id }, b) : null; };
  function put(id, b) { const p = kept(); p.badges = p.badges && typeof p.badges === 'object' ? p.badges : {}; p.badges[id] = Object.assign({}, b, { t: Date.now() }); delete p.badges[id].id; S.setProfile({ scouts: p }); }
  const newId = () => 'b' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  const day = d => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : '');
  const icon = name => (window.ICONS ? ICONS.svg(name, 16) : '');
  const nice = d => (d ? new Date(d + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  /* ---------- reading requirements typed or pasted in ---------- */
  // "Requirement 3", "1.", "2a)", "(4)", "(b)", "c." (a bare number like "50 yards" is ordinary text)
  const LABEL = /^(?:requirement\s+(\d{1,2})([a-z])?[.):]?|\(?(\d{1,2})([a-z])?[.):]|\(([a-z])\)|([a-z])[.)])(?:\s+|$)/i;
  /** one requirement per line: a leading "1.", "2a.", "(b)", "c)" or "Requirement 4:" becomes its label; a line with no
      label continues the one before (as text copied from a document often wraps). Lettered parts take their number. */
  function parse(text) {
    const out = [];
    let num = '';
    String(text || '').replace(/\r/g, '').split('\n').map(l => l.replace(/^[\s•\-–*]+/, '').replace(/\s+/g, ' ').trim()).filter(Boolean).forEach(line => {
      const m = LABEL.exec(line);
      if (m) {
        const n = m[1] || m[3], part = m[2] || m[4], letter = m[5] || m[6];
        let label, level;
        if (n) { num = n; label = n + (part ? part.toLowerCase() : ''); level = part ? 1 : 0; }
        else { label = num + letter.toLowerCase(); level = 1; }
        out.push({ label, level, text: line.slice(m[0].length).slice(0, 1000) });
      } else if (out.length) out[out.length - 1].text = (out[out.length - 1].text + ' ' + line).trim().slice(0, 1000);
      else out.push({ label: '', level: 0, text: line.slice(0, 1000) });
    });
    return out.slice(0, 120).map((r, i) => Object.assign(r, { id: 'r' + i }));
  }
  /** new requirements from edited text, keeping the ticks and notes of ones that match an old one (by label, or by text) */
  function reparse(old, text) {
    const fresh = parse(text), used = new Set();
    return fresh.map((r, i) => {
      const hit = old.find((o, k) => !used.has(k) && ((r.label && o.label === r.label) || o.text === r.text) && (used.add(k), true));
      return Object.assign(r, { id: 'r' + i, done: hit ? hit.done || '' : '', note: hit ? hit.note || '' : '' });
    });
  }
  const progress = b => { const r = b.reqs || [], n = r.filter(x => x.done).length; return { n, of: r.length, pct: r.length ? Math.round(n / r.length * 100) : 0 }; };
  /** a badge as text, to send to a counselor */
  function asText(b) {
    const pr = progress(b);
    return [`${b.name} merit badge`, b.counselor ? `Counselor: ${b.counselor}` : '', b.started ? `Started: ${nice(b.started)}` : '', b.done ? `Completed: ${nice(b.done)}` : `Progress: ${pr.n} of ${pr.of} requirements done`, '']
      .concat((b.reqs || []).map(r => `${r.level ? '    ' : ''}[${r.done ? 'x' : ' '}] ${r.label ? r.label + '. ' : ''}${r.text}${r.done ? ` (done ${nice(r.done)})` : ''}${r.note ? `\n${r.level ? '    ' : ''}    Note: ${r.note}` : ''}`))
      .concat(b.notes ? ['', `Notes: ${b.notes}`] : []).filter((l, i, a) => l !== '' || (i > 0 && a[i - 1] !== '')).join('\n');
  }

  /* ---------- the page ---------- */
  let adding = false;
  function page(root, id) {
    const list = badges(), cur = id && badge(id) ? badge(id) : (!adding && list[0]) || null;
    if (!cur && !list.length) adding = true;
    root.innerHTML = `<div class="sc-page"><h1>Merit badge tracker</h1>
      <p class="muted sc-intro">Keep track of the merit badges you’re working on. Type or paste the requirements from your pamphlet or workbook, then tick each one off as you finish it.</p>
      <div class="sc-grid">
        <aside class="card sc-list" aria-label="Your badges"><div class="row between"><h2>Your badges</h2><button type="button" class="btn sm primary" id="sc-new">Add a badge</button></div>
          ${list.length ? `<p class="small muted sc-sum">${list.filter(b => !b.done).length} in progress · ${list.filter(b => b.done).length} completed</p>` : ''}
          ${list.length ? `<ul class="sc-badges">${list.map(b => { const pr = progress(b); return `<li><a class="sc-b${cur && cur.id === b.id && !adding ? ' on' : ''}" href="#/scouts/${b.id}"${cur && cur.id === b.id && !adding ? ' aria-current="page"' : ''}><span class="sc-b-name">${esc(b.name)}</span><span class="sc-bar" aria-hidden="true"><i style="width:${b.done ? 100 : pr.pct}%"></i></span><span class="small muted">${b.done ? `Completed ${nice(b.done)}` : `${pr.n} of ${pr.of} done`}${b.counselor ? ` · ${esc(b.counselor)}` : ''}</span></a></li>`; }).join('')}</ul>` : '<p class="small muted">No badges yet. Add the first one you’re working on.</p>'}
        </aside>
        <section class="card sc-detail" id="sc-detail">${adding ? addForm() : cur ? detail(cur) : ''}</section>
      </div></div>`;
    wire(root, cur);
    root.__scouts = { id: cur && !adding ? cur.id : null, adding };
    if (H && H.tutorCtx) H.tutorCtx({ notes: 'The student is on the Scouts merit badge tracker page.' });
  }
  const addForm = () => `<h2>Add a badge</h2>
    <label class="field"><span class="label">Badge name</span><input type="text" id="sc-name" maxlength="80" placeholder="For example: Camping" autocomplete="off"></label>
    <div class="sc-two"><label class="field"><span class="label">Counselor <span class="muted small">(optional)</span></span><input type="text" id="sc-counselor" maxlength="80" autocomplete="off"></label>
      <label class="field"><span class="label">Started</span><input type="date" id="sc-started" value="${S.today()}"></label></div>
    <label class="field"><span class="label">Requirements</span><textarea id="sc-reqs" rows="9" maxlength="40000" placeholder="1. The first requirement&#10;2. The second requirement&#10;   a. A part of it&#10;   b. Another part"></textarea><span class="help">Paste them from your pamphlet or workbook, one per line. Numbers like 1, 2a or (b) are kept. You can change them later.</span></label>
    <p class="small muted" id="sc-preview" aria-live="polite"></p>
    <div class="btn-row"><button type="button" class="btn primary" id="sc-add">Add the badge</button>${badges().length ? '<button type="button" class="btn ghost" id="sc-cancel">Cancel</button>' : ''}</div>
    <p class="small" id="sc-msg" role="status"></p>`;
  function detail(b) {
    const pr = progress(b);
    return `<div class="sc-head"><div><h2>${esc(b.name)}</h2><p class="small muted">${b.done ? `Completed ${nice(b.done)}` : `${pr.n} of ${pr.of} requirements done`}${b.started ? ` · started ${nice(b.started)}` : ''}</p></div><span class="sc-pct" aria-label="${b.done ? 100 : pr.pct} percent done">${b.done ? 100 : pr.pct}%</span></div>
      <div class="sc-bar big" aria-hidden="true"><i style="width:${b.done ? 100 : pr.pct}%"></i></div>
      ${(b.reqs || []).length ? `<ol class="sc-reqs">${b.reqs.map(r => `<li class="sc-r lv${r.level}${r.done ? ' done' : ''}" data-r="${r.id}">
        <div class="sc-row"><label class="sc-tick"><input type="checkbox" data-tick="${r.id}"${r.done ? ' checked' : ''}><span class="sc-lab">${esc(r.label)}</span><span class="sc-text">${esc(r.text)}</span></label><button type="button" class="iconbtn sc-note-btn" data-note-open="${r.id}" aria-label="${r.note ? 'Edit the note on' : 'Add a note to'} requirement ${esc(r.label || r.text.slice(0, 30))}" title="${r.note ? 'Edit the note' : 'Add a note'}">${icon('pencil')}</button></div>
        ${r.done || r.note ? `<div class="sc-meta">${r.done ? `<label class="small">Done on <input type="date" data-date="${r.id}" value="${r.done}" max="${S.today()}"></label>` : ''}${r.note ? `<span class="small sc-note">${esc(r.note)}</span>` : ''}</div>` : ''}
        <div class="sc-note-edit" data-note-box="${r.id}" hidden><input type="text" maxlength="300" data-note="${r.id}" value="${esc(r.note || '')}" aria-label="Note for requirement ${esc(r.label)}" placeholder="For example: showed my counselor on Oct 3"><button type="button" class="btn sm" data-note-save="${r.id}">Save note</button></div></li>`).join('')}</ol>` : '<p class="small muted">No requirements yet. Add them under Edit the requirements.</p>'}
      <details class="sc-more"${(b.reqs || []).length ? '' : ' open'}><summary>Badge details and requirements</summary>
        <div class="sc-two"><label class="field"><span class="label">Badge name</span><input type="text" id="sc-e-name" maxlength="80" value="${esc(b.name)}"></label><label class="field"><span class="label">Counselor</span><input type="text" id="sc-e-counselor" maxlength="80" value="${esc(b.counselor || '')}"></label></div>
        <div class="sc-two"><label class="field"><span class="label">Started</span><input type="date" id="sc-e-started" value="${b.started || ''}"></label><label class="field"><span class="label">Completed <span class="muted small">(the day your counselor signed it off)</span></span><input type="date" id="sc-e-done" value="${b.done || ''}"></label></div>
        <label class="field"><span class="label">Notes</span><textarea id="sc-e-notes" rows="3" maxlength="2000" placeholder="Meeting times, what to bring, what your counselor asked for">${esc(b.notes || '')}</textarea></label>
        <label class="field"><span class="label">Edit the requirements</span><textarea id="sc-e-reqs" rows="8" maxlength="40000">${esc((b.reqs || []).map(r => `${r.level ? '   ' : ''}${r.label ? r.label + '. ' : ''}${r.text}`).join('\n'))}</textarea><span class="help">Ticks and notes stay with requirements whose number or words don’t change.</span></label>
        <div class="btn-row"><button type="button" class="btn primary" id="sc-e-save">Save changes</button></div>
      </details>
      <div class="btn-row sc-actions"><button type="button" class="btn" id="sc-copy">Copy for my counselor</button><button type="button" class="btn ghost" id="sc-del">Remove this badge</button></div>
      <p class="small" id="sc-msg" role="status"></p>`;
  }
  function wire(root, cur) {
    const $ = s => root.querySelector(s), msg = () => $('#sc-msg');
    $('#sc-new').addEventListener('click', () => { adding = true; page(root, null); const f = $('#sc-name'); if (f) f.focus(); });
    if (adding) {
      const pv = () => { const r = parse($('#sc-reqs').value); $('#sc-preview').textContent = r.length ? `${r.length} requirement${r.length === 1 ? '' : 's'} found${r.some(x => x.label) ? `, from ${r.find(x => x.label).label} to ${r.filter(x => x.label).pop().label}` : ''}.` : ''; };
      $('#sc-reqs').addEventListener('input', pv);
      $('#sc-add').addEventListener('click', () => {
        const name = $('#sc-name').value.trim().replace(/\s+merit badge$/i, '');
        if (!name) { msg().textContent = 'Give the badge a name first.'; $('#sc-name').focus(); return; }
        const id = newId(), reqs = parse($('#sc-reqs').value).map(r => Object.assign(r, { done: '', note: '' }));
        put(id, { name: name.slice(0, 80), counselor: $('#sc-counselor').value.trim().slice(0, 80), started: day($('#sc-started').value), done: '', notes: '', reqs });
        adding = false;
        location.hash = '#/scouts/' + id;
        if (location.hash === '#/scouts/' + id) page(root, id);
        if (V.toast) V.toast(`${name} added, with ${reqs.length} requirement${reqs.length === 1 ? '' : 's'}.`);
      });
      const c = $('#sc-cancel'); if (c) c.addEventListener('click', () => { adding = false; page(root, cur && cur.id); });
      return;
    }
    if (!cur) return;
    const box = $('#sc-detail'), save = (patch, again) => { const b = badge(cur.id); put(cur.id, Object.assign(b, patch)); if (again) page(root, cur.id); };
    box.addEventListener('change', ev => {
      const t = ev.target;
      if (t.dataset.tick) { const b = badge(cur.id); b.reqs = b.reqs.map(r => (r.id === t.dataset.tick ? Object.assign(r, { done: t.checked ? S.today() : '' }) : r)); save({ reqs: b.reqs }, true); const f = root.querySelector(`[data-tick="${t.dataset.tick}"]`); if (f) f.focus(); }
      if (t.dataset.date) { const b = badge(cur.id); b.reqs = b.reqs.map(r => (r.id === t.dataset.date && day(t.value) ? Object.assign(r, { done: t.value }) : r)); save({ reqs: b.reqs }); }
    });
    box.addEventListener('click', ev => {
      const t = ev.target.closest('button'); if (!t) return;
      if (t.dataset.noteOpen) { const nb = root.querySelector(`[data-note-box="${t.dataset.noteOpen}"]`); nb.hidden = !nb.hidden; if (!nb.hidden) nb.querySelector('input').focus(); return; }
      if (t.dataset.noteSave) { const v = root.querySelector(`[data-note="${t.dataset.noteSave}"]`).value.trim().slice(0, 300), b = badge(cur.id); b.reqs = b.reqs.map(r => (r.id === t.dataset.noteSave ? Object.assign(r, { note: v }) : r)); save({ reqs: b.reqs }, true); return; }
      if (t.id === 'sc-e-save') {
        const name = $('#sc-e-name').value.trim();
        if (!name) { msg().textContent = 'A badge needs a name.'; return; }
        const b = badge(cur.id);
        save({ name: name.slice(0, 80), counselor: $('#sc-e-counselor').value.trim().slice(0, 80), started: day($('#sc-e-started').value), done: day($('#sc-e-done').value), notes: $('#sc-e-notes').value.trim().slice(0, 2000), reqs: reparse(b.reqs || [], $('#sc-e-reqs').value) }, true);
        if (V.toast) V.toast('Badge saved.');
        return;
      }
      if (t.id === 'sc-copy') {
        const text = asText(badge(cur.id)), done = ok => { msg().textContent = ok ? 'Copied. Paste it into an email or a message to your counselor.' : ''; if (!ok) { msg().innerHTML = `<textarea class="sc-copytext" rows="8" readonly aria-label="The badge as text">${esc(text)}</textarea>`; msg().querySelector('textarea').select(); } };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); else done(false);
        return;
      }
      if (t.id === 'sc-del') { t.outerHTML = `<span class="sc-sure"><span class="small">Remove ${esc(cur.name)} and its ticks?</span><button type="button" class="btn sm" id="sc-del-yes">Remove it</button><button type="button" class="btn sm ghost" id="sc-del-no">Keep it</button></span>`; return; }
      if (t.id === 'sc-del-yes') { const p = kept(); p.badges[cur.id] = { gone: true, t: Date.now() }; S.setProfile({ scouts: p }); if (V.toast) V.toast(`${cur.name} removed.`); location.hash = '#/scouts'; if (location.hash === '#/scouts') page(root, null); return; }
      if (t.id === 'sc-del-no') page(root, cur.id);
    });
  }

  window.SCOUTS = { page, parse, reparse, badges, badge, progress, asText };
})();
