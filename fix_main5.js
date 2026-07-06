const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\electron\\main.cjs';
const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
lines[196] = "      execSync('powershell -Command \"Set-ItemProperty -Path \\'' + CLEANUP_SAGE_REG_PATH + '\\\\' + key + '\\\\' -Name StateFlags0011 -Value 1 -ErrorAction SilentlyContinue\"', { windowsHide: true });";
fs.writeFileSync(p, lines.join('\n'));
console.log('Line 197 replaced');
