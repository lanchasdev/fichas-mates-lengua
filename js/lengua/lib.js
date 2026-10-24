// Ayudas para generar ejercicios de lengua a partir del banco LENGUA_WORDS.
(function (g) {
  const NOUN_CATS = ['animales', 'frutas', 'verduras', 'comida', 'ropa', 'casa', 'cuerpo', 'escuela', 'transporte', 'naturaleza', 'juguetes', 'profesiones', 'objetos', 'plantas', 'bebidas', 'familia', 'lugares', 'deportes', 'instrumentos', 'herramientas'];
  const all = () => g.LENGUA_WORDS || [];
  g.LENGUA_LIB = {
    NOUN_CATS,
    words: (f) => (f ? all().filter(f) : all().slice()),
    byCat: (cat) => all().filter((w) => w.cat === cat),
    nouns: (f) => all().filter((w) => NOUN_CATS.includes(w.cat) && (!f || f(w))),
    pick: (rng, arr) => arr[Math.floor(rng.next() * arr.length)],
    sample(rng, arr, n) { return rng.shuffle(arr).slice(0, n); },
    art: (w) => (w.g === 'f' ? 'la' : 'el'),
    cap: (s) => s.charAt(0).toUpperCase() + s.slice(1),
  };
})(typeof window !== 'undefined' ? window : globalThis);
