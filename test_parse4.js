const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const line = lines[196];
try {
  eval(line);
  console.log('eval ok');
} catch (e) {
  console.log('Eval error:', e.message);
}
