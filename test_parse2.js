const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const line = fs.readFileSync(p, 'utf8').split(/\r?\n/)[196];
console.log('Char 104:', JSON.stringify(line[104]));
console.log('Context 95-110:', JSON.stringify(line.slice(95,110)));
try {
  new Function(line);
  console.log('Valid');
} catch (e) {
  console.log('Parse error:', e.message);
}
