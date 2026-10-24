// Sumas repetidas (camino hacia la multiplicación) y una ficha por cada tabla de multiplicar.
(function (g) {
  const S = String;
  const tok = (tokens, ans) => ({ kind: 'tokens', tokens: tokens, answer: Array.isArray(ans) ? ans.map(S) : S(ans) });
  const pick = (list) => (r) => r.pick(list)(r);

  function sumaTokens(n, k) {
    const t = [];
    for (let i = 0; i < k; i++) { if (i) t.push('+'); t.push(n); }
    return t;
  }

  // ---------- Sumas repetidas ----------
  // Sumar siempre el mismo número: 4 + 4 + 4 = __   /   __ = 4 + 4 + 4
  function sumaDe(nums, kmin, kmax) {
    return function (r) {
      const n = r.pick(nums), k = r.int(kmin, kmax), t = sumaTokens(n, k);
      return r.chance(0.5) ? tok(t.concat(['=', '__']), n * k) : tok(['__', '='].concat(t), n * k);
    };
  }
  // ¿Cuántas veces se repite? 3 + 3 + 3 + 3 = __ × 3
  function cuantasVeces(r) {
    const n = r.int(2, 10), k = r.int(2, 6);
    return tok(sumaTokens(n, k).concat(['=', '__', '×', n]), k);
  }
  // De la suma al producto: 4 + 4 + 4 = 3 × 4 = __
  function sumaAProducto(r) {
    const n = r.int(2, 10), k = r.int(2, 6);
    return tok(sumaTokens(n, k).concat(['=', k, '×', n, '=', '__']), n * k);
  }
  // Del producto a la suma: 3 × 4 = __ + __ + __ = __
  function productoASuma(r) {
    const n = r.int(2, 10), k = r.int(2, 5), t = [k, '×', n, '='], ans = [];
    for (let i = 0; i < k; i++) { if (i) t.push('+'); t.push('__'); ans.push(n); }
    t.push('=', '__'); ans.push(n * k);
    return tok(t, ans);
  }
  const sumsSubs = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => ({
    id: '1.' + (i + 1), name: 'Sumar siempre el ' + n, layout: 'cols2', gen: sumaDe([n], 2, 10),
  }));
  g.KUMON_LEVELS.push({
    id: 100, order: 5.5, name: 'Sumas repetidas', age: '7-8 años',
    sublevels: sumsSubs.concat([
      { id: '1.10', name: 'Sumas repetidas mezcladas (2 a 5)', layout: 'cols2', gen: sumaDe([2, 3, 4, 5], 2, 8) },
      { id: '1.11', name: 'Sumas repetidas mezcladas (6 a 10)', layout: 'cols2', gen: sumaDe([6, 7, 8, 9, 10], 2, 6) },
      { id: '1.12', name: '¿Cuántas veces se repite?', layout: 'cols2', gen: cuantasVeces },
      { id: '1.13', name: 'De la suma repetida a la multiplicación', layout: 'wide', gen: sumaAProducto },
      { id: '1.14', name: 'De la multiplicación a la suma repetida', layout: 'wide', gen: productoASuma },
    ]),
  });

  // ---------- Tablas de multiplicar ----------
  function tabla(tables, hueco) {
    return function (r) {
      const t = r.pick(tables), a = r.int(1, 10), p = a * t;
      if (hueco) {
        const f = r.int(0, 3);
        if (f === 0) return tok([t, '×', '__', '=', p], a);
        if (f === 1) return tok(['__', '×', t, '=', p], a);
        if (f === 2) return tok([a, '×', '__', '=', p], t);
        return tok(['__', '×', a, '=', p], t);
      }
      const f = r.int(0, 2);
      if (f === 0) return tok([t, '×', a, '=', '__'], p);
      if (f === 1) return tok([a, '×', t, '=', '__'], p);
      return { kind: 'col', a: S(a), b: S(t), op: '×', answer: S(p) };
    };
  }
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const tablaSubs = range(1, 10).map((t, i) => ({
    id: '1.' + (i + 1), name: 'Tabla del ' + t, layout: 'cols3', gen: tabla([t]),
  }));
  g.KUMON_LEVELS.push({
    id: 101, order: 5.6, name: 'Tablas de multiplicar', age: '8-9 años',
    sublevels: tablaSubs.concat([
      { id: '1.11', name: 'Tablas del 1 al 5 mezcladas', layout: 'cols3', gen: tabla(range(1, 5)) },
      { id: '1.12', name: 'Tablas del 6 al 10 mezcladas', layout: 'cols3', gen: tabla(range(6, 10)) },
      { id: '1.13', name: 'Todas las tablas mezcladas', layout: 'cols3', gen: tabla(range(1, 10)) },
      { id: '1.14', name: 'Huecos en las tablas del 1 al 5', layout: 'cols3', gen: tabla(range(1, 5), true) },
      { id: '1.15', name: 'Huecos en las tablas del 6 al 10', layout: 'cols3', gen: tabla(range(6, 10), true) },
      { id: '1.16', name: 'Huecos en todas las tablas', layout: 'cols3', gen: tabla(range(1, 10), true) },
    ]),
  });
})(typeof window !== 'undefined' ? window : globalThis);
