# Contrato de los niveles de LENGUA

Igual que `SPEC.md` (mates), pero los niveles se añaden a `LENGUA_LEVELS` (en `js/rng.js`) desde `levels/lengua/*.js`.
Código JS plano con envoltorio `(function (g) { ... })(typeof window !== 'undefined' ? window : globalThis);`.
`gen(rng)` devuelve UN ejercicio; usa SIEMPRE `rng` (nunca `Math.random`). Todas las `answer` son strings
(array de strings si hay varios huecos, en orden de aparición). Español de España, sin faltas.

```js
g.LENGUA_LEVELS.push({
  id: 2, name: 'Las sílabas', age: '7 años',
  sublevels: [
    { id: '2.1', name: 'Contar sílabas', layout: 'cols2', perSheet: 8 /* opcional: nº fijo de ejercicios por ficha */, gen(rng) {...} },
  ],
});
```
(los `id` se renumeran solos al cargar, pon cualquier número coherente.)

## Banco de palabras (ya existe)
`LENGUA_WORDS`: `{w, syl:[...], t, g:'m'|'f', pl, cat, img}` (`t` = índice 0 de la sílaba tónica). Categorías de nombres:
animales, frutas, verduras, comida, ropa, casa, cuerpo, escuela, transporte, naturaleza, juguetes, profesiones, objetos.
Además `cat:'verbos'` (`conj:'ar'|'er'|'ir'`) y `cat:'adjetivos'` (con `ant`: antónimo). `LENGUA_IMGS[img]` es la imagen.
Ayudas en `LENGUA_LIB` (js/lengua/lib.js): `LENGUA_LIB.words(filtro?)`, `.pick(rng, arr)`, `.sample(rng, arr, n)` (n distintos),
`.byCat(cat)`, `.nouns()`, `.art(w)` ('el'/'la'), `.cap(str)`. Solo puedes usar `img` de palabras que existan en el banco.
Para ejercicios sin imagen (ortografía, verbos conjugados, sinónimos, textos...) crea tus propias listas pequeñas y REVISADAS dentro de tu archivo.

## Tipos de ejercicio (`kind`)
Reutilizan `tokens`, `seq`... de mates, más estos (todos pueden llevar imagen vía `img`):

1. `pic` — imagen a la izquierda + línea de tokens a la derecha (`layout` 'cols2' o 'wide').
   `{kind:'pic', img:'gato', tokens:['g','__','to'], answer:'a'}`; para escribir la palabra entera: `tokens:[{box:60}]`, answer:'gato';
   para sílabas: `tokens:[{box:16},{box:16}]`, answer:['ga','to']. Los tokens son strings/números, `'__'` (hueco 14 mm) o `{box:mm}`.
2. `choice` — línea con hueco + opciones para rodear (la correcta se marca en azul en las soluciones). `img` opcional.
   `{kind:'choice', img:'gato', tokens:['ca','__','allo'], options:['b','v'], answer:'b'}` (hueco opcional: sin `tokens` solo salen las opciones;
   sin `img` también vale; `answer` debe estar entre `options`). Máx. 4 opciones cortas ('el','la','un','una','sustantivo'...).
3. `match` — unir con flechas dos columnas. Items `{t:'texto'}` o `{img:'gato'}`. `right` va desordenado y
   `answer[i]` = índice (string) en `right` que corresponde a `left[i]`. Entre 3 y 5 parejas. `layout:'wide'`, `perSheet: 3` o 4.
   `{kind:'match', left:[{img:'gato'},{img:'perro'},{img:'pez'}], right:[{t:'pez'},{t:'gato'},{t:'perro'}], answer:['1','2','0']}`
4. `copy` — caligrafía: palabra o frase gris para repasar + renglones. `{kind:'copy', img:'gato', text:'gato', reps:2}` (answer: text). 'cols2' o 'wide'. Texto corto (≤ 22 caracteres).
5. `lines` — enunciado + n renglones para escribir una frase. `{kind:'lines', text:'Escribe una frase con la palabra "gato".', n:2, answer:'El gato duerme.'}`. `layout:'wide'`, `perSheet` 6-8.
6. `reading` — texto + preguntas (comprensión). `{kind:'reading', title:'El perro Max', text:'...', qs:[{q:'¿Cómo se llama el perro?', options:['Max','Rex','Toby'], answer:'Max'}, {q:'¿Dónde juega?', answer:'En el parque'}]}`;
   si `options` no existe es respuesta abierta en una línea. Texto de 45-110 palabras, 4-5 preguntas, `layout:'wide'`, `perSheet:1`.
7. `tokens` / `problem` de mates también valen (p. ej. ordenar palabras: `tokens:['to','ga',':',{box:40}]`, answer:'gato').

## Reglas
- Solo caracteres Latin-1 (acentos, ñ, ü, ¿ ¡ « » válidos); NADA de emojis ni símbolos raros (flechas, ✓...). Se imprime en Helvetica.
- Cada tema introduce UNA novedad; de 4 a 8 temas por nivel, ordenados de fácil a difícil; último tema de repaso mixto.
- El espacio de ejercicios distintos por tema debe ser claramente mayor que `perSheet` (motor reintenta duplicados). Para temas con perSheet fijo bajo (match, reading) basta ≥ 12 variantes.
- Los ejercicios tienen que tener UNA respuesta correcta y sin ambigüedad (cuidado con sílabas, tildes, b/v, plurales: usa datos del banco o listas verificadas).
- `choice` y `match` con imágenes: no mezcles dos palabras con la misma imagen en un mismo ejercicio.
- Escribe un test `test/check_lengua_<tuyo>.js` que, SIN reutilizar la lógica del `gen`, valide para cientos de ejercicios por tema: forma del objeto, `answer` coherente (p. ej. que las sílabas unidas den la palabra, que `answer` esté entre `options`, que cada pareja de `match` coincida con el banco), imágenes existentes en `LENGUA_IMGS`, caracteres permitidos y variedad. Ejecútalo (`node test/...`) hasta que pase. Carga: `require('../js/rng.js'); require('../js/lengua/words.js'); require('../js/lengua/images.js'); require('../js/lengua/lib.js'); require('../levels/lengua/<tuyo>.js')`.
