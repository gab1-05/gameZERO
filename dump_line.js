const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
const line = lines[196];
console.log('Line:', line);
const idx = line.indexOf('key ');
console.log('After key:', JSON.stringify(line.slice(idx+4)));
console.log('Chars after key:', Array.from(line.slice(idx+4)).map(c=>c.charCodeAt(0)));
