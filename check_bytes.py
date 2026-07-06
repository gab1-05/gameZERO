p = r'c:\projects\gameZERO\Attached-Assets\artifacts\gaming-optimizer\electron\main.cjs'
with open(p, 'rb') as f:
    c = f.read()
i = c.find(b'Path ')
print('bytes after Path:', list(c[i+5:i+15]))
j = c.find(b'key +')
print('bytes after key:', list(c[j+5:j+15]))
