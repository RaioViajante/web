/* Quadra drawings: the spaces as line plans, event covers as patterns. No photos, nothing real. */
(function () {
  'use strict';
  const C = '#2F4FE0', L = '#C9F24B', K = '#121212';
  const svg = (vb, body, bg) => '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
    (bg ? '<rect width="100%" height="100%" fill="' + bg + '"/>' : '') + body + '</svg>';
  const st = (c, w) => 'fill="none" stroke="' + (c || C) + '" stroke-width="' + (w || 1.4) + '" stroke-linecap="round" stroke-linejoin="round"';

  const SPACE = {
    court: (bg) => svg('0 0 160 120',
      '<rect x="14" y="14" width="132" height="92" rx="2" ' + st() + '/>' +
      '<line x1="80" y1="14" x2="80" y2="106" ' + st() + '/><circle cx="80" cy="60" r="14" ' + st() + '/><circle cx="80" cy="60" r="2" fill="' + C + '"/>' +
      '<path d="M14 36 A26 26 0 0 1 14 84" ' + st() + '/><path d="M146 36 A26 26 0 0 0 146 84" ' + st() + '/>' +
      '<rect x="14" y="48" width="18" height="24" ' + st() + '/><rect x="128" y="48" width="18" height="24" ' + st() + '/>' +
      '<circle cx="104" cy="38" r="4" fill="' + L + '" stroke="' + K + '" stroke-width="1"/><path d="M98 44 L108 54" ' + st(K, 1) + ' stroke-dasharray="2 3"/>', bg || '#E7EBFD'),
    auditorium: (bg) => svg('0 0 160 120',
      '<rect x="50" y="12" width="60" height="12" rx="2" ' + st() + '/>' +
      [34, 48, 62, 76, 90, 104].map((r, i) => '<path d="M' + (80 - r) + ' ' + (110) + ' A' + r + ' ' + (r * 0.78) + ' 0 0 1 ' + (80 + r) + ' 110" ' + st(C, 1.2) + ' stroke-dasharray="' + (i % 2 ? '1 5' : '3 4') + '"/>').join('') +
      '<line x1="80" y1="30" x2="80" y2="110" ' + st(C, 1) + ' stroke-dasharray="2 4"/><rect x="74" y="26" width="12" height="4" rx="1" fill="' + L + '"/>', bg || '#E7EBFD'),
    studio: (bg) => svg('0 0 160 120',
      '<rect x="16" y="16" width="128" height="88" rx="2" ' + st() + '/>' +
      Array.from({ length: 7 }, (_, i) => '<line x1="' + (16 + (i + 1) * 16) + '" y1="16" x2="' + (16 + (i + 1) * 16) + '" y2="104" ' + st(C, .6) + ' opacity=".5"/>').join('') +
      '<line x1="16" y1="22" x2="144" y2="22" ' + st(C, 3) + '/>' +
      '<rect x="40" y="58" width="22" height="14" rx="2" fill="' + L + '" stroke="' + K + '" stroke-width="1"/><rect x="72" y="58" width="22" height="14" rx="2" ' + st(K, 1) + '/><rect x="104" y="58" width="22" height="14" rx="2" ' + st(K, 1) + '/>', bg || '#E7EBFD'),
    commons: (bg) => svg('0 0 160 120',
      '<rect x="12" y="12" width="136" height="96" rx="14" ' + st() + '/>' +
      [[44, 42], [86, 36], [122, 54], [52, 84], [96, 82]].map(([x, y], i) => '<circle cx="' + x + '" cy="' + y + '" r="10" ' + (i === 2 ? 'fill="' + L + '" stroke="' + K + '" stroke-width="1"' : st(K, 1)) + '/>' +
        [0, 1, 2, 3].map((k) => '<circle cx="' + (x + Math.cos(k * 1.57 + .6) * 16) + '" cy="' + (y + Math.sin(k * 1.57 + .6) * 16) + '" r="2.4" fill="' + C + '"/>').join('')).join(''), bg || '#E7EBFD'),
    activity: (bg) => svg('0 0 160 120',
      '<rect x="14" y="14" width="132" height="92" rx="2" ' + st() + '/><line x1="14" y1="64" x2="80" y2="64" ' + st() + '/><line x1="80" y1="14" x2="80" y2="106" ' + st() + '/>' +
      '<rect x="26" y="26" width="42" height="10" rx="1" ' + st(K, 1) + '/><rect x="26" y="42" width="42" height="10" rx="1" ' + st(K, 1) + '/>' +
      Array.from({ length: 3 }, (_, r) => Array.from({ length: 4 }, (_, c) => '<rect x="' + (92 + c * 12) + '" y="' + (28 + r * 24) + '" width="8" height="16" rx="1" ' + (r === 1 && c === 2 ? 'fill="' + L + '" stroke="' + K + '" stroke-width="1"' : st(C, 1)) + '/>').join('')).join('') +
      '<path d="M26 92 h20 M26 84 h32" ' + st(K, 1) + ' stroke-dasharray="2 3"/>', bg || '#E7EBFD')
  };

  const COVER = {
    sports: (c, s) => svg('0 0 400 150', '<rect width="400" height="150" fill="' + s + '"/>' +
      '<g ' + st(c, 2) + '><rect x="40" y="18" width="320" height="200" rx="4"/><line x1="200" y1="18" x2="200" y2="218"/><circle cx="200" cy="118" r="44"/><path d="M40 70 A70 70 0 0 1 110 140"/><path d="M360 70 A70 70 0 0 0 290 140"/></g>' +
      '<circle cx="268" cy="62" r="11" fill="' + L + '" stroke="' + K + '" stroke-width="1.5"/>'),
    academic: (c, s) => svg('0 0 400 150', '<rect width="400" height="150" fill="' + s + '"/>' +
      Array.from({ length: 9 }, (_, r) => Array.from({ length: 26 }, (_, k) => {
        const on = (r * 7 + k * 3) % 11 === 0, big = (r * 5 + k) % 23 === 0;
        return '<rect x="' + (14 + k * 15) + '" y="' + (10 + r * 15) + '" width="10" height="10" rx="2.5" fill="' + (big ? L : on ? c : 'none') + '" ' + (on || big ? '' : 'stroke="' + c + '" stroke-opacity=".35" stroke-width="1"') + '/>';
      }).join('')).join('')),
    culture: (c, s) => svg('0 0 400 150', '<rect width="400" height="150" fill="' + s + '"/>' +
      Array.from({ length: 7 }, (_, i) => '<path d="M-10 ' + (30 + i * 16) + ' C 80 ' + (0 + i * 16) + ', 160 ' + (70 + i * 16) + ', 250 ' + (30 + i * 16) + ' S 380 ' + (10 + i * 16) + ', 420 ' + (40 + i * 16) + '" ' + st(c, 1.6) + '/>').join('') +
      '<circle cx="300" cy="46" r="18" fill="' + L + '" stroke="' + K + '" stroke-width="1.5"/>'),
    community: (c, s) => svg('0 0 400 150', '<rect width="400" height="150" fill="' + s + '"/>' +
      [[120, 80], [180, 70], [240, 84], [300, 72], [150, 120], [270, 124]].map(([x, y], i) => '<circle cx="' + x + '" cy="' + y + '" r="' + (34 - i * 2) + '" ' + st(c, 1.6) + '/>').join('') +
      '<circle cx="210" cy="76" r="8" fill="' + L + '" stroke="' + K + '" stroke-width="1.5"/>')
  };

  window.QART = { space: (id, bg) => (SPACE[id] || SPACE.court)(bg), cover: (cat) => {
    const c = window.QDATA.CATEGORIES.find((x) => x.id === cat) || window.QDATA.CATEGORIES[0];
    return COVER[c.id](c.color, c.soft);
  } };
})();
