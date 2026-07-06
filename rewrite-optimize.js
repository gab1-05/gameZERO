const fs = require('fs');
const p = 'c:\\projects\\gameZERO\\Attached-Assets\\artifacts\\gaming-optimizer\\src\\pages\\optimize.tsx';
let c = fs.readFileSync(p, 'utf8');
const m = 'export default function Optimize()';
const i = c.indexOf(m);
if (i > -1) {
  // Remove everything from export default to end of file
  c = c.substring(0, i);
  // Write back (we'll add the new component later)
  fs.writeFileSync(p, c, 'utf8');
  console.log('SUCCESS: Removed old component. File truncated to: ' + i + ' chars');
} else {
  console.log('FAIL: marker not found');
}
