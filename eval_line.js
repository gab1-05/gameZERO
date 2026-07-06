const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const line = fs.readFileSync(p, 'utf8').split(/\r?\n/)[196];
console.log(line);
