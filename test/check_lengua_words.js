// Valida el banco de palabras de lengua: node test/check_lengua_words.js
const path = require('path');
const DIR = process.env.BANK_DIR || path.join(__dirname, '..', 'js', 'lengua');
require(path.join(DIR, 'words.js'));
require(path.join(DIR, 'images.js'));
const W = globalThis.LENGUA_WORDS, IM = globalThis.LENGUA_IMGS;
const NOUN_CATS = ['animales','frutas','verduras','comida','ropa','casa','cuerpo','escuela','transporte','naturaleza','juguetes','profesiones','objetos','plantas','bebidas','familia','lugares','deportes','instrumentos','herramientas'];
const CATS = NOUN_CATS.concat(['verbos','adjetivos']);
let errs = 0;
const bad = (m) => { errs++; if (errs <= 60) console.log('ERROR: ' + m); };
if (!Array.isArray(W) || !W.length) { console.log('LENGUA_WORDS vacio'); process.exit(1); }
if (!IM || typeof IM !== 'object') { console.log('LENGUA_IMGS vacio'); process.exit(1); }
const seenW = new Set(), seenImg = new Set(), byW = {};
const hasTilde = (s) => /[áéíóú]/.test(s);
for (const e of W) {
  const id = e.w + '/' + e.cat;
  if (byW[e.w]) bad('palabra duplicada ' + e.w);
  byW[e.w] = e;
  if (!/^[a-záéíóúüñ]+$/.test(e.w)) bad(id + ' w no valida');
  if (!Array.isArray(e.syl) || !e.syl.length || e.syl.some(s => !s)) { bad(id + ' syl vacio'); continue; }
  if (e.syl.join('') !== e.w) bad(id + ' silabas != w: ' + e.syl.join('-'));
  if (e.syl.length > 4) bad(id + ' mas de 4 silabas');
  if (!Number.isInteger(e.t) || e.t < 0 || e.t >= e.syl.length) bad(id + ' t fuera de rango');
  else {
    const tild = e.syl.map((s, i) => hasTilde(s) ? i : -1).filter(i => i >= 0);
    if (tild.length > 1) bad(id + ' mas de una tilde');
    let exp;
    if (tild.length) exp = tild[0];
    else if (e.syl.length === 1) exp = 0;
    else exp = /[aeiouns]$/.test(e.w) ? e.syl.length - 2 : e.syl.length - 1;
    if (e.cat !== 'verbos' && e.t !== exp) bad(id + ' t=' + e.t + ' esperado ' + exp);
  }
  if (!CATS.includes(e.cat)) bad(id + ' categoria invalida');
  if (typeof e.img !== 'string' || !e.img) bad(id + ' sin img');
  else {
    if (seenImg.has(e.img)) bad('img duplicada ' + e.img);
    seenImg.add(e.img);
    const norm = e.w.normalize('NFD').replace(/ñ/g, '\u0001').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'n');
    if (!e.img.startsWith(norm)) bad(id + ' img no corresponde a w: ' + e.img);
    const d = IM[e.img];
    if (typeof d !== 'string' || !d.startsWith('data:image/png;base64,')) bad(id + ' imagen ausente/no base64 png');
    else {
      const buf = Buffer.from(d.slice(22), 'base64');
      if (buf.length < 100 || buf.readUInt32BE(0) !== 0x89504e47 || buf.readUInt32BE(4) !== 0x0d0a1a0a) bad(id + ' PNG invalido');
      else if (buf.readUInt32BE(16) > 160 || buf.readUInt32BE(20) > 160) bad(id + ' imagen mayor de 160 px');
    }
  }
  if (NOUN_CATS.includes(e.cat)) {
    if (e.g !== 'm' && e.g !== 'f') bad(id + ' genero invalido');
    if (typeof e.pl !== 'string' || !e.pl) bad(id + ' plural vacio');
    else {
      if (!/s$/.test(e.pl)) bad(id + ' plural no acaba en s: ' + e.pl);
      if (/z$/.test(e.w) && !/ces$/.test(e.pl)) bad(id + ' plural de -z debe acabar en -ces: ' + e.pl);
      if (/[^aeiouáéíóúsz]$/.test(e.w) && !/es$/.test(e.pl) && !['club', 'clip'].includes(e.w)) bad(id + ' plural debe acabar en -es: ' + e.pl);
      if (e.pl.length < e.w.length - 1) bad(id + ' plural demasiado corto');
    }
  } else {
    if (e.g !== null || e.pl !== null) bad(id + ' g/pl deben ser null');
  }
  if (e.cat === 'verbos') {
    if (!['ar', 'er', 'ir'].includes(e.conj) || !e.w.endsWith(e.conj) && !(e.conj === 'ir' && /ír$/.test(e.w))) bad(id + ' conj invalida');
    if (!/(ar|er|ir|ír)$/.test(e.w)) bad(id + ' no es infinitivo');
    if (e.t !== e.syl.length - 1) bad(id + ' verbo: t debe ser la ultima silaba');
  }
  if (e.cat === 'adjetivos' && !e.ant) bad(id + ' adjetivo sin ant');
}
for (const e of W) if (e.ant !== undefined) {
  const a = byW[e.ant];
  if (!a) bad(e.w + ' ant inexistente ' + e.ant);
  else if (a.ant !== e.w) bad('ant no reciproco ' + e.w + ' <-> ' + e.ant);
  else if (a.cat !== 'adjetivos' || e.cat !== 'adjetivos') bad('ant fuera de adjetivos ' + e.w);
}
for (const k of Object.keys(IM)) if (!seenImg.has(k)) bad('imagen sobrante sin palabra: ' + k);
const nouns = W.filter(e => NOUN_CATS.includes(e.cat));
const perCat = {}; for (const c of CATS) perCat[c] = W.filter(e => e.cat === c).length;
for (const c of NOUN_CATS) if (perCat[c] > 0 && perCat[c] < 15) bad('categoria ' + c + ' con menos de 15: ' + perCat[c]);
const bySyl = [0, 0, 0, 0, 0]; for (const e of nouns) bySyl[e.syl.length]++;
if (bySyl[1] < 25) bad('monosilabos < 25: ' + bySyl[1]);
if (bySyl[2] < 100) bad('bisilabos < 100: ' + bySyl[2]);
if (bySyl[3] < 80) bad('trisilabos < 80: ' + bySyl[3]);
if (bySyl[4] < 25) bad('tetrasilabos < 25: ' + bySyl[4]);
const tonic = { aguda: 0, llana: 0, esdrujula: 0 };
for (const e of nouns) { const f = e.syl.length - 1 - e.t; if (e.syl.length > 1) tonic[f === 0 ? 'aguda' : f === 1 ? 'llana' : 'esdrujula']++; }
if (tonic.aguda < 10 || tonic.esdrujula < 5) bad('faltan agudas/esdrujulas ' + JSON.stringify(tonic));
if (perCat.verbos < 40) bad('verbos < 40: ' + perCat.verbos);
if (perCat.adjetivos < 30) bad('adjetivos < 30: ' + perCat.adjetivos);
console.log('palabras:', W.length, 'sustantivos:', nouns.length, 'por categoria:', JSON.stringify(perCat));
console.log('silabas (1..4):', bySyl.slice(1).join('/'), 'tonicidad:', JSON.stringify(tonic), 'imagenes:', Object.keys(IM).length);
if (errs) { console.log('FALLO: ' + errs + ' errores'); process.exit(1); }
console.log('OK');
