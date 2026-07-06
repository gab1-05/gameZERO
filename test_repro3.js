const expr = "execSync('foo ' + bar + '\\' + baz + '\\' + ' qux')";
console.log(Array.from(expr).map(c=>c.charCodeAt(0)));
