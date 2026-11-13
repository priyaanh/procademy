/* Runs before the first paint: set the theme and text size so pages never flash the wrong colours.
   (A file rather than an inline script, so the page's security policy can refuse every inline script.) */
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('procademy.v1') || 'null');
    var p = (s && s.profile) || {};
    var forced = new URLSearchParams(location.search).get('theme');      // ?theme=dark, for screenshots and tests
    if (forced) p = { theme: forced, textSize: p.textSize };
    if (p.theme && p.theme !== 'system') document.documentElement.setAttribute('data-theme', p.theme);
    if (p.textSize && p.textSize !== 'normal') document.documentElement.setAttribute('data-size', p.textSize);
    if (p.easyRead) document.documentElement.setAttribute('data-read', 'easy');
    if (p.easyRead && p.readFont === 'dyslexic') document.documentElement.setAttribute('data-font', 'dyslexic');
    if (p.blue && p.blue !== 'classic') document.documentElement.setAttribute('data-blue', p.blue);
    if (p.contrast === 'high') document.documentElement.setAttribute('data-contrast', 'high');
    // reading and access (Settings): line and word spacing, a bigger focus outline, fewer extras on screen
    if (p.lineSpace === 'more' || p.lineSpace === 'most') document.documentElement.setAttribute('data-lines', p.lineSpace);
    if (p.wordSpace === 'more' || p.wordSpace === 'most') document.documentElement.setAttribute('data-words', p.wordSpace);
    if (p.focusRing) document.documentElement.setAttribute('data-focus', 'strong');
    if (p.calm) document.documentElement.setAttribute('data-clutter', 'less');
  } catch (e) {}
})();
/* A browser too old for the rest of Procademy (an iPad that can't update past iPadOS 15, say) stops at a script it
   can't read. Instead of "Loading" forever, the page then says what to do. (Old-style code, so old browsers run it.) */
(function () {
  window.addEventListener('load', function () {
    setTimeout(function () {
      var m = document.getElementById('main');
      if (window.APP || !m) return;
      var card = document.createElement('div'), h = document.createElement('h1'), p = document.createElement('p');
      card.className = 'card empty'; card.setAttribute('role', 'alert');
      h.textContent = 'Procademy couldn’t start in this browser';
      p.className = 'muted';
      p.textContent = 'It needs a recent browser: Safari 16.4 or newer on an iPhone or iPad (Settings, then General, then Software Update), or a recent Chrome, Edge or Firefox. If you’re offline, connect to the internet and reload the page.';
      card.appendChild(h); card.appendChild(p);
      m.innerHTML = ''; m.appendChild(card);
    }, 0);
  });
})();
