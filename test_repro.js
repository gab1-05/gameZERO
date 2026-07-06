const lines = [
  "execSync('foo ' + bar + '\\' + baz + '\\' + ' qux')",
  "execSync('foo ' + bar + '\\' + baz + '\\' + ' qux')",
];
lines.forEach((l, i) => {
  try {
    new Function(l);
    console.log(`Line ${i+1} OK`);
  } catch (e) {
    console.log(`Line ${i+1} ERROR:`, e.message);
  }
});
