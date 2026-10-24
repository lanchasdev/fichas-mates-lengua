// Nivel 1.5 «Una letra cada vez»: todos los ejercicios de la ficha usan la letra que elige el usuario (ctx.letra).
(function (g) {
  const LIB = g.LENGUA_LIB;
  const VOW = ['a', 'e', 'i', 'o', 'u'];
  const ACC = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' };
  const norm = (s) => s.toLowerCase().replace(/[áéíóú]/g, (c) => ACC[c]);

  // ¿la letra L está en la posición i de la palabra w (sin ser parte de ch, ll, rr)?
  function at(w, i, L) {
    if (w.slice(i, i + L.length) !== L) return false;
    if (L.length > 1) return true;
    const prev = w[i - 1] || '', next = w[i + 1] || '';
    if (L === 'c' && next === 'h') return false;
    if (L === 'h' && prev === 'c') return false;
    if (L === 'l' && (next === 'l' || prev === 'l')) return false;
    if (L === 'r' && (next === 'r' || prev === 'r')) return false;
    return true;
  }
  const positions = (w, L) => { const r = []; for (let i = 0; i < w.length; i++) if (at(w, i, L)) r.push(i); return r; };
  const positionsN = (w, L) => positions(norm(w.w), L); // sin tildes: para contar y comprobar
  const nouns = (f) => LIB.nouns(f);
  const startsExact = (L) => nouns((w) => w.w.startsWith(L) && at(w.w, 0, L));
  const startsN = (L) => nouns((w) => at(norm(w.w), 0, L));
  const hasN = (L) => nouns((w) => positionsN(w, L).length > 0);

  const cache = {};
  const memo = (k, f) => (cache[k] || (cache[k] = f()));
  const S1 = (L) => memo('s1' + L, () => startsExact(L));
  const SN = (L) => memo('sn' + L, () => startsN(L));
  const HN = (L) => memo('hn' + L, () => hasN(L));
  const letterOf = (ctx) => (ctx && ctx.letra) || 'm';

  const pick = (rng, a) => a[Math.floor(rng.next() * a.length)];
  const fallbackLetter = (L) => ({ kind: 'copy', text: L + '  ' + L.toUpperCase() + '  ' + L + '  ' + L.toUpperCase(), reps: 1, answer: L });

  // 1. Copia la palabra
  function copiar(rng, ctx) {
    const L = letterOf(ctx), p = SN(L).length ? SN(L) : HN(L);
    if (!p.length) return fallbackLetter(L);
    const w = pick(rng, p);
    return { kind: 'copy', img: w.img, text: w.w, reps: 2, answer: w.w };
  }
  // 2. Escribe la letra inicial
  function inicial(rng, ctx) {
    const L = letterOf(ctx), p = S1(L);
    if (!p.length) return copiar(rng, ctx);
    const w = pick(rng, p);
    return { kind: 'pic', img: w.img, tokens: ['__', w.w.slice(L.length)], answer: L };
  }
  // 3. ¿Empieza por la letra?
  function siNo(rng, ctx) {
    const L = letterOf(ctx), p = SN(L);
    if (!p.length) return copiar(rng, ctx);
    const yes = rng.chance(0.5);
    let w;
    if (yes) w = pick(rng, p);
    else { const q = nouns((x) => !at(norm(x.w), 0, L)); w = pick(rng, q); }
    return { kind: 'choice', img: w.img, tokens: [w.w], options: ['sí', 'no'], answer: yes ? 'sí' : 'no' };
  }
  // 4. Une el dibujo con su palabra
  function unir(rng, ctx) {
    const L = letterOf(ctx), p = SN(L);
    if (p.length < 4) return inicial(rng, ctx);
    const ws = LIB.sample(rng, p, 4);
    const order = rng.shuffle([0, 1, 2, 3]);
    const right = order.map((i) => ({ t: ws[i].w }));
    const answer = ws.map((_, i) => String(order.indexOf(i)));
    return { kind: 'match', left: ws.map((w) => ({ img: w.img })), right, answer };
  }
  // 5. Sílabas con la letra: m + a = ma
  function silabas(rng, ctx) {
    const L = letterOf(ctx);
    if (VOW.includes(L)) return inicial(rng, ctx);
    const p = S1(L).filter((w) => VOW.includes(w.w[L.length]));
    if (!p.length) return inicial(rng, ctx);
    const w = pick(rng, p), v = w.w[L.length];
    return { kind: 'pic', img: w.img, tokens: [L, '+', v, '=', '__'], answer: L + v };
  }
  // 6. Completa la letra que falta (en medio o al final)
  function falta(rng, ctx) {
    const L = letterOf(ctx);
    const p = nouns((w) => w.w.length > L.length + 1 && positions(w.w, L).some((i) => i > 0));
    const pp = memo('f' + L, () => p);
    if (!pp.length) return inicial(rng, ctx);
    const w = pick(rng, pp), i = pick(rng, positions(w.w, L).filter((k) => k > 0));
    return { kind: 'pic', img: w.img, tokens: [w.w.slice(0, i), '__', w.w.slice(i + L.length)], answer: L };
  }
  // 7. Escribe el nombre del dibujo
  function nombre(rng, ctx) {
    const L = letterOf(ctx), p = SN(L).length ? SN(L) : HN(L);
    if (!p.length) return copiar(rng, ctx);
    const w = pick(rng, p);
    return { kind: 'pic', img: w.img, tokens: [{ box: 50 }], answer: w.w };
  }
  // 8. ¿Cuántas veces aparece la letra?
  function cuantas(rng, ctx) {
    const L = letterOf(ctx), p = HN(L).filter((w) => positionsN(w, L).length <= 3);
    if (!p.length) return copiar(rng, ctx);
    const multi = p.filter((w) => positionsN(w, L).length > 1);
    const w = pick(rng, multi.length && rng.chance(0.45) ? multi : p);
    return { kind: 'choice', img: w.img, tokens: [w.w], options: ['1', '2', '3'], answer: String(positionsN(w, L).length) };
  }
  const mixto = (rng, ctx) => pick(rng, [copiar, inicial, siNo, silabas, falta, nombre, cuantas])(rng, ctx);

  g.LENGUA_LETRA = { norm, count: (L) => SN(L).length, countAny: (L) => HN(L).length, positions, at };

  g.LENGUA_LEVELS.push({
    id: 1.5, order: 1.5, name: 'Una letra cada vez', age: '6-7 años', needsLetter: true,
    sublevels: [
      { id: '1.5.1', name: 'Copia la palabra con la letra', layout: 'wide', perSheet: 8, gen: copiar },
      { id: '1.5.2', name: 'Escribe la letra inicial', layout: 'cols2', perSheet: 10, gen: inicial },
      { id: '1.5.3', name: '¿Empieza por la letra? Sí o no', layout: 'cols2', perSheet: 10, gen: siNo },
      { id: '1.5.4', name: 'Une el dibujo con su palabra', layout: 'wide', perSheet: 3, gen: unir },
      { id: '1.5.5', name: 'Sílabas con la letra', layout: 'cols2', perSheet: 10, gen: silabas },
      { id: '1.5.6', name: 'Completa la letra que falta', layout: 'cols2', perSheet: 10, gen: falta },
      { id: '1.5.7', name: 'Escribe el nombre del dibujo', layout: 'cols2', perSheet: 10, gen: nombre },
      { id: '1.5.8', name: '¿Cuántas veces aparece la letra?', layout: 'cols2', perSheet: 10, gen: cuantas },
      { id: '1.5.9', name: 'Repaso mixto con la letra', layout: 'cols2', perSheet: 10, gen: mixto },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
