p = r'c:\projects\gameZERO\Attached-Assets\artifacts\gaming-optimizer\electron\main.cjs'
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()
line = lines[196]
new_line = line.replace("'\\\\''", "'\\\\'")
lines[196] = new_line
with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Fixed')
