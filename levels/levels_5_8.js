(function (g) {
  const S = String;
  const col = (a, b, op, ans) => ({ kind: 'col', a: S(a), b: S(b), op: op, answer: S(ans) });
  const tok = (tokens, ans) => ({ kind: 'tokens', tokens: tokens, answer: Array.isArray(ans) ? ans.map(S) : S(ans) });

  // ---------- Nivel 5 ----------
  function borrows(a, b) {
    let br = 0, n = 0;
    while (a > 0 || b > 0) {
      const da = a % 10, db = b % 10;
      if (da - br < db) { br = 1; n++; } else { br = 0; }
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return n;
  }
  function carriesOf(a, b) {
    let c = 0, n = 0;
    while (a > 0 || b > 0) {
      const s = (a % 10) + (b % 10) + c;
      c = s >= 10 ? 1 : 0; n += c;
      a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return n;
  }
  function add2c(r) {
    const ua = r.int(1, 9), ub = r.int(10 - ua, 9), ta = r.int(1, 7), tb = r.int(1, 8 - ta);
    const a = ta * 10 + ua, b = tb * 10 + ub;
    return col(a, b, '+', a + b);
  }
  function add2c3(r) {
    const ua = r.int(1, 9), ub = r.int(10 - ua, 9), ta = r.int(1, 9), tb = r.int(Math.max(1, 9 - ta), 9);
    const a = ta * 10 + ua, b = tb * 10 + ub;
    return col(a, b, '+', a + b);
  }
  function sub2b(r) {
    const ua = r.int(0, 8), ub = r.int(ua + 1, 9), ta = r.int(2, 9), tb = r.int(1, ta - 1);
    const a = ta * 10 + ua, b = tb * 10 + ub;
    return col(a, b, '-', a - b);
  }
  function add3n(r) {
    const ha = r.int(1, 8), hb = r.int(1, 9 - ha), ta = r.int(0, 9), tb = r.int(0, 9 - ta), ua = r.int(0, 9), ub = r.int(0, 9 - ua);
    const a = ha * 100 + ta * 10 + ua, b = hb * 100 + tb * 10 + ub;
    return col(a, b, '+', a + b);
  }
  function sub3n(r) {
    const hb = r.int(1, 8), ha = r.int(hb + 1, 9), tb = r.int(0, 9), ta = r.int(tb, 9), ub = r.int(0, 9), ua = r.int(ub, 9);
    const a = ha * 100 + ta * 10 + ua, b = hb * 100 + tb * 10 + ub;
    return col(a, b, '-', a - b);
  }
  function add3c(r) {
    for (let i = 0; i < 200; i++) {
      const a = r.int(100, 899), b = r.int(100, 899);
      if (a + b < 1000 && carriesOf(a, b) >= 1) return col(a, b, '+', a + b);
    }
    return col(478, 265, '+', 743);
  }
  function sub3c(r) {
    for (let i = 0; i < 200; i++) {
      const a = r.int(200, 999), b = r.int(100, a - 1);
      if (borrows(a, b) >= 1) return col(a, b, '-', a - b);
    }
    return col(532, 267, '-', 265);
  }
  const add3 = (r) => (r.chance(0.5) ? add3n(r) : sub3n(r));
  const mix3 = (r) => (r.chance(0.5) ? add3c(r) : sub3c(r));

  // ---------- Nivel 6 ----------
  function rep(r, withProd) {
    const n = r.int(1, 10), k = r.int(2, 5), t = [];
    for (let i = 0; i < k; i++) { if (i) t.push('+'); t.push(n); }
    if (withProd) { t.push('=', k, '×', n, '=', '__'); } else { t.push('=', '__'); }
    return tok(t, n * k);
  }
  const rep1 = (r) => rep(r, false);
  const rep2 = (r) => rep(r, true);
  function tabla(tables, fmax) {
    return function (r) {
      const t = r.pick(tables), a = r.int(1, fmax || 10);
      return r.chance(0.5) ? tok([a, '×', t, '=', '__'], a * t) : tok([t, '×', a, '=', '__'], a * t);
    };
  }
  function huecoMul(tables) {
    return function (r) {
      const t = r.pick(tables), a = r.int(1, 10), p = a * t;
      const tFirst = r.chance(0.5);
      if (tFirst) return r.chance(0.5) ? tok([t, '×', '__', '=', p], a) : tok(['__', '×', a, '=', p], t);
      return r.chance(0.5) ? tok(['__', '×', t, '=', p], a) : tok([a, '×', '__', '=', p], t);
    };
  }
  const t25 = tabla([2, 5, 10]);
  const t34 = tabla([3, 4]);
  const h = huecoMul([2, 3, 4, 5, 10]);

  // ---------- Nivel 7 ----------
  const t67 = tabla([6, 7]);
  const t89 = tabla([8, 9]);
  function tFull(r) {
    const a = r.int(2, 10), b = r.int(2, 10);
    return tok([a, '×', b, '=', '__'], a * b);
  }
  function por10(r) {
    const n = r.int(2, 99), m = r.pick([10, 100]);
    return r.chance(0.5) ? tok([n, '×', m, '=', '__'], n * m) : tok([m, '×', n, '=', '__'], n * m);
  }
  function mul2(r) {
    const b = r.int(2, 6), mx = Math.floor(9 / b);
    const a = r.int(1, mx) * 10 + r.int(0, mx);
    return col(a, b, '×', a * b);
  }

  // ---------- Nivel 8 ----------
  const dbx = (a, b, ans) => ({ kind: 'divbox', a: S(a), b: S(b), answer: Array.isArray(ans) ? ans.map(S) : S(ans) });
  function div(tables, qmax) {
    return function (r) {
      const t = r.pick(tables), q = r.int(1, qmax);
      return dbx(t * q, t, q);
    };
  }
  function divResto(lo, hi) {
    return function (r) {
      const d = r.int(lo, hi), q = r.int(1, 9), rs = r.int(1, d - 1);
      return dbx(d * q + rs, d, [q, rs]);
    };
  }
  const NAMES = ['Ana', 'Luis', 'Marta', 'Pablo', 'Lucía', 'Hugo', 'Sara', 'Daniel'];
  const OBJS = [
    ['canicas', 'f'], ['cromos', 'm'], ['pegatinas', 'f'], ['lápices', 'm'],
    ['galletas', 'f'], ['caramelos', 'm'], ['flores', 'f'], ['globos', 'm'],
  ];
  const BUY = [['cuaderno', 'cuadernos'], ['libro', 'libros'], ['helado', 'helados'], ['juguete', 'juguetes']];
  function problema(r) {
    const k = r.int(2, 9), q = r.int(2, 10), n = k * q;
    const nm = r.pick(NAMES), o = r.pick(OBJS), pl = o[0], fem = o[1] === 'f';
    const Q = fem ? 'Cuántas' : 'Cuántos', pr = fem ? 'las' : 'los';
    const type = r.int(1, 4);
    let text;
    if (type === 1) text = nm + ' reparte ' + n + ' ' + pl + ' en partes iguales entre ' + k + ' amigos. ¿' + Q + ' ' + pl + ' recibe cada amigo?';
    else if (type === 2) text = 'Se colocan ' + n + ' ' + pl + ' en ' + k + ' cajas, con el mismo número en cada una. ¿' + Q + ' ' + pl + ' hay en cada caja?';
    else if (type === 3) text = nm + ' tiene ' + n + ' ' + pl + ' y ' + pr + ' guarda en bolsas de ' + k + '. ¿Cuántas bolsas necesita?';
    else {
      const b = r.pick(BUY);
      text = 'Un ' + b[0] + ' cuesta ' + k + ' euros. ¿Cuántos ' + b[1] + ' se pueden comprar con ' + n + ' euros?';
    }
    return { kind: 'problem', text: text, answer: S(q) };
  }
  const pick = (list) => (r) => r.pick(list)(r);

  g.KUMON_LEVELS.push({
    id: 5, name: 'Sumas y restas llevando', age: '8 años',
    sublevels: [
      { id: '5.1', name: 'Sumas de 2 cifras llevando', layout: 'cols3', gen: add2c },
      { id: '5.2', name: 'Sumas llevando con resultado de 3 cifras', layout: 'cols3', gen: add2c3 },
      { id: '5.3', name: 'Restas de 2 cifras llevando', layout: 'cols3', gen: sub2b },
      { id: '5.4', name: 'Sumas y restas de 3 cifras sin llevar', layout: 'cols3', gen: add3 },
      { id: '5.5', name: 'Sumas y restas de 3 cifras llevando', layout: 'cols3', gen: mix3 },
      { id: '5.6', name: 'Repaso mixto', layout: 'cols3', gen: pick([add2c, add2c3, sub2b, add3, mix3]) },
    ],
  });
  g.KUMON_LEVELS.push({
    id: 7, order: 7, name: 'Multiplicar con más cifras', age: '9 años',
    sublevels: [
      { id: '7.1', name: 'Multiplicar por 10 y por 100', layout: 'cols3', gen: por10 },
      { id: '7.2', name: 'Multiplicar 2 cifras por 1 cifra sin llevar', layout: 'cols3', gen: mul2 },
      { id: '7.3', name: 'Repaso mixto', layout: 'cols3', gen: pick([por10, mul2]) },
    ],
  });
  g.KUMON_LEVELS.push({
    id: 8, order: 8, name: 'Dividir con caja', age: '9 años',
    sublevels: [
      { id: '8.1', name: 'Dividir entre 2, 5 y 10', layout: 'cols3', gen: div([2, 5, 10], 10) },
      { id: '8.2', name: 'Dividir entre 3 y 4', layout: 'cols3', gen: div([3, 4], 10) },
      { id: '8.3', name: 'Dividir entre 6 y 7', layout: 'cols3', gen: div([6, 7], 10) },
      { id: '8.4', name: 'Dividir entre 8 y 9', layout: 'cols3', gen: div([8, 9], 10) },
      { id: '8.5', name: 'Todas las divisiones mezcladas', layout: 'cols3', gen: div([2, 3, 4, 5, 6, 7, 8, 9, 10], 10) },
      { id: '8.6', name: 'Divisiones con resto (entre 2 y 5)', layout: 'cols3', gen: divResto(2, 5) },
      { id: '8.7', name: 'Divisiones con resto (entre 6 y 9)', layout: 'cols3', gen: divResto(6, 9) },
      { id: '8.8', name: 'Problemas de repartir', layout: 'wide', gen: problema },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
