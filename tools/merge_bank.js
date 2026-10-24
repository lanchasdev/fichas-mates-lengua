// Fusiona el banco base (bank_ext/base) con las ampliaciones bank_ext/<nombre>/{words.json,images.json}.
// Uso: node tools/merge_bank.js <dirSalida> [dirExt ...]   (sin dirExt: todas las de bank_ext/ salvo base)
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'js', 'lengua'));
let exts = process.argv.slice(3);
if (!exts.length) exts = fs.readdirSync(path.join(root, 'bank_ext')).filter((d) => d !== 'base' && fs.existsSync(path.join(root, 'bank_ext', d, 'words.json'))).map((d) => path.join(root, 'bank_ext', d));
const load = (f) => { const g = {}; vm.runInNewContext(fs.readFileSync(f, 'utf8'), { window: g, globalThis: g }); return g; };
const bw = load(path.join(root, 'bank_ext', 'base', 'words.base.js')).LENGUA_WORDS;
const bi = load(path.join(root, 'bank_ext', 'base', 'images.base.js')).LENGUA_IMGS;
const words = bw.slice(), imgs = Object.assign({}, bi);
for (const d of exts) {
  const w = JSON.parse(fs.readFileSync(path.join(d, 'words.json'), 'utf8'));
  const im = JSON.parse(fs.readFileSync(path.join(d, 'images.json'), 'utf8'));
  words.push(...w); Object.assign(imgs, im);
}
fs.mkdirSync(out, { recursive: true });
const cats = [...new Set(words.map((e) => e.cat))];
let ws = '// Banco de palabras de lengua (generado con tools/merge_bank.js). Imagenes: pictogramas ARASAAC (ver ATRIBUCION.md).\n(function (g) {\n  g.LENGUA_WORDS = [\n';
for (const c of cats) { ws += '    // ' + c + '\n'; for (const e of words.filter((x) => x.cat === c)) ws += '    ' + JSON.stringify(e) + ',\n'; }
ws += '  ];\n})(typeof window !== \'undefined\' ? window : globalThis);\n';
fs.writeFileSync(path.join(out, 'words.js'), ws);
let is = '// Pictogramas ARASAAC reducidos (160 px, paleta cuantizada). Ver ATRIBUCION.md.\n(function (g) {\n  g.LENGUA_IMGS = {\n';
is += Object.keys(imgs).sort().map((k) => '    ' + JSON.stringify(k) + ': ' + JSON.stringify(imgs[k])).join(',\n');
is += '\n  };\n})(typeof window !== \'undefined\' ? window : globalThis);\n';
fs.writeFileSync(path.join(out, 'images.js'), is);
console.log('fusionado:', words.length, 'palabras,', Object.keys(imgs).length, 'imagenes ->', out);
