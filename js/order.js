// Ordena los niveles por `order` (o `id`) y los numera 1..N, junto con sus temas (N.1, N.2...).
(function (g) {
  [g.KUMON_LEVELS, g.LENGUA_LEVELS].forEach((L) => {
    L.sort((a, b) => (a.order !== undefined ? a.order : a.id) - (b.order !== undefined ? b.order : b.id));
    L.forEach((lv, i) => {
      lv.id = i + 1;
      lv.sublevels.forEach((s, j) => { s.id = lv.id + '.' + (j + 1); });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
