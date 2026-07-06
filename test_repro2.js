const expr = "execSync('foo ' + bar + '\\' + baz + '\\' + ' qux')";
console.log('expr:', expr);
try {
  new Function(expr);
  console.log('Valid');
} catch (e) {
  console.log('Error:', e.message);
}
