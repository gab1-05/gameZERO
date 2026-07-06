const cases = [
  "'a' + '\\' + 'b'",
  "execSync('foo ' + bar + '\\' + baz + '\\' + ' qux')",
];
for (const c of cases) {
  try {
    new Function(c);
    console.log('OK:', c);
  } catch (e) {
    console.log('FAIL:', c, '->', e.message);
  }
}
