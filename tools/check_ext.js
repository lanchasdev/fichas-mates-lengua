// Valida una ampliacion del banco junto con el banco base: node tools/check_ext.js bank_ext/<nombre> [...otras]
const { execFileSync } = require('child_process'); const os = require('os'), path = require('path'), fs = require('fs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bank-'));
const exts = process.argv.slice(2).map((d) => path.resolve(d));
if (!exts.length) { console.log('uso: node tools/check_ext.js bank_ext/<nombre>'); process.exit(2); }
execFileSync('node', [path.join(__dirname, 'merge_bank.js'), tmp, ...exts], { stdio: 'inherit' });
try { execFileSync('node', [path.join(__dirname, '..', 'test', 'check_lengua_words.js')], { stdio: 'inherit', env: { ...process.env, BANK_DIR: tmp } }); }
catch (e) { process.exit(1); }
