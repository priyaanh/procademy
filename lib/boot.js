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
  } catch (e) {}
})();
