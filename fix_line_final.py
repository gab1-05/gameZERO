p = r'c:\projects\gameZERO\Attached-Assets\artifacts\gaming-optimizer\electron\main.cjs'
with open(p, 'r', encoding='utf-8') as f:
    lines = f.readlines()
lines[196] = r"      execSync('powershell -Command \"Set-ItemProperty -Path \'' + CLEANUP_SAGE_REG_PATH + '\' + key + '\' + ' -Name StateFlags0011 -Value 1 -ErrorAction SilentlyContinue\"', { windowsHide: true });\n"
with open(p, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('Done')
