const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const line = fs.readFileSync(p, 'utf8').split(/\r?\n/)[196];
console.log('Line length:', line.length);
console.log('Char 104:', line.charCodeAt(104), line[104]);
try {
  new Function(line);
  console.log('Line is syntactically valid (expression)');
} catch (e) {
  console.log('Parse error:', e.message);
}
