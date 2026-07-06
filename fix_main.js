const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
let c = fs.readFileSync(p, 'utf8');
c = c.replace("-Path '' + CLEANUP_SAGE_REG_PATH", "-Path \\'' + CLEANUP_SAGE_REG_PATH");
c = c.replace("+ key + ''", "+ key + \\''");
fs.writeFileSync(p, c);
console.log('Fixed main.cjs');
