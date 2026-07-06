p = r'c:\projects\gameZERO\Attached-Assets\artifacts\gaming-optimizer\electron\main.cjs'
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()
line = lines[196]
print('repr line:', repr(line))
print('index of key:', line.find('key '))
print('after key repr:', repr(line[line.find('key ')+4:line.find('key ')+20]))
new_line = line.replace("'\\\\''", "'\\\\'")
print('new repr:', repr(new_line))
lines[196] = new_line
with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fixed')
