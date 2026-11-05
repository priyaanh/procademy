/* Procademy's icons: one set of simple line drawings (24 × 24, drawn with the current text color), so the site
   has friendly pictures without emojis. ICONS.svg(name, size) gives the markup, hidden from screen readers
   (the text next to an icon always says what it means). */
'use strict';
(function () {
  const P = {
    unlimited: '<path d="M12 12c-2-2.7-3.8-4-5.6-4a4 4 0 0 0 0 8c1.8 0 3.6-1.3 5.6-4zm0 0c2 2.7 3.8 4 5.6 4a4 4 0 0 0 0-8c-1.8 0-3.6 1.3-5.6 4z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7h7M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M8.5 18h.01M12 18h.01M15.5 15v3"/>',
    graph: '<path d="M4 4v16h16"/><path d="M7 16c2.5-.5 3.5-8 6.5-8S16 13 20 12"/>',
    tree: '<circle cx="12" cy="5" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="4.5" cy="19" r="1.8"/><circle cx="9.5" cy="19" r="1.8"/><path d="M10.8 6.6 8.2 10.4M13.2 6.6l2.6 3.8M6.2 13.8l-1.1 3.4M7.8 13.8l1.1 3.4"/>',
    data: '<path d="M4 20h16"/><rect x="5.5" y="12" width="3" height="8" rx=".8"/><rect x="10.5" y="6" width="3" height="14" rx=".8"/><rect x="15.5" y="9" width="3" height="11" rx=".8"/>',
    fraction: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6.4 5.6"/>',
    integers: '<rect x="2.5" y="7" width="8.5" height="10" rx="2"/><rect x="13" y="7" width="8.5" height="10" rx="2"/><path d="M6.75 10v4M4.75 12h4M15.25 12h4"/>',
    shapes: '<path d="M7.5 4 13 13H2z"/><rect x="13.5" y="12.5" width="7.5" height="7.5" rx="1"/><circle cx="17" cy="6.5" r="3"/>',
    percent: '<circle cx="7" cy="7" r="2.6"/><circle cx="17" cy="17" r="2.6"/><path d="M19 5 5 19"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01"/>',
    tiles: '<rect x="3" y="5" width="11" height="14" rx="1.6"/><rect x="16" y="5" width="5" height="5" rx="1.2"/><rect x="16" y="13" width="5" height="6" rx="1.2"/>',
    steps: '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12 5 13.5l2.5-2.5"/><path d="M5 18h.01"/>',
    story: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16.5h5"/>',
    timer: '<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.5l2.5 2M10 3h4M12 3v3.5M18.5 6.5l1.2-1.2"/>',
    book: '<path d="M3 5.5c3-1.2 6-1.2 9 .8 3-2 6-2 9-.8v13.5c-3-1.2-6-1.2-9 .8-3-2-6-2-9-.8z"/><path d="M12 6.3v13.6"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    sparkle: '<path d="M12 3.5 13.9 9 19.5 11l-5.6 2L12 18.5 10.1 13 4.5 11l5.6-2z"/><path d="M19 3v3M17.5 4.5h3"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
    cross: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
    flame: '<path d="M12 3c.8 3.6 5.5 5.4 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.8 1.8-3.9 1.8-6.4 1.8.9 2.7 2.7 2.7 4.4.9-1.8.9-5.5 1-8.5z"/>',
    star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.2 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.7 10.6 6 3h4l2 5.5L14 3h4l-2.7 7.6"/><path d="m12 12.6.8 1.6 1.7.2-1.3 1.2.4 1.7-1.6-.9-1.6.9.4-1.7-1.3-1.2 1.7-.2z"/>',
    target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
    review: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.8 2.6 2.8 14.4 0 17M12 3.5c-2.8 2.6-2.8 14.4 0 17"/>',
    school: '<path d="M2.5 9.5 12 4.5l9.5 5-9.5 5z"/><path d="M6.5 11.8v4.4c3.2 2.3 7.8 2.3 11 0v-4.4M21.5 9.5v5"/>',
    bookmark: '<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>',
    pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    home: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10v10h12V10"/><path d="M10 20v-5.5h4V20"/>',
    more: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-4 4.1-6 7.5-6s6.3 2 7.5 6"/>',
    settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z"/>',
  };
  window.ICONS = {
    names: Object.keys(P),
    /** an icon's SVG (an unknown name gives an empty string) */
    svg(name, size) {
      const p = P[name]; if (!p) return '';
      const s = size || 20;
      return `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
    },
  };
})();
