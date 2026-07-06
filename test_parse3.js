const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const line = fs.readFileSync(p, 'utf8').split(/\r?\n/)[196];
for (let i = 95; i <= 115; i++) {
  process.stdout.write(`${i}:${JSON.stringify(line[i])} `);
}
console.log();
try {
  new Function(line);
  console.log('Valid');
} catch (e) {
  console.log('Parse error:', e.message);
}
