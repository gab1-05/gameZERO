const str = "'a' + '\\' + 'b'";
console.log('String length:', str.length);
for (let i = 0; i < str.length; i++) {
  console.log(i, str.charCodeAt(i));
}
try {
  new Function(str);
  console.log('OK');
} catch (e) {
  console.log('Error:', e.message);
}
