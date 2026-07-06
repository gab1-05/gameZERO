$ErrorActionPreference='SilentlyContinue'
$src='c:/projects/gameZERO/Attached-Assets/artifacts/gaming-optimizer/electron/main.cjs'
$c=[System.IO.File]::ReadAllText($src,[System.Text.Encoding]::UTF8)
$m1=$c.IndexOf("// === SYSTEM CLEANUP ===")
$m2=$c.IndexOf("// === APPLY OPTIMIZATION ===",$m1)
if($m1 -lt 0 -or $m2 -lt 0){Write-Host "MARKERS_NOT_FOUND";exit 1}
$before=$c.Substring(0,$m1)
$after=$c.Substring($m2)
$mid = @"
// === WINDOWS CLEANUP CONFIGURATION (sageset registry keys) ===
// We pre-define cleanup options that map to Windows Disk Cleanup (cleanmgr) settings.
// These registry entries enable cleanup of: Temp files, Recycle Bin, Thumbnails,
// Windows Update cache, Windows Error Reporting, Downloads, etc.
const CLEANUP_SAGE_REG_PATH = 'HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches';
function setCleanupSageset() {
  // Enable common cleanup categories via registry (mirrors cleanmgr /sageset)
  // This avoids requiring user interaction with the UI.
  const categories = [
    'Temporary Files',
    'Recycle Bin',
    'Thumbnails',
    'Windows Update Cleanup',
    'Windows Error Reporting Files',
    'Downloaded Program Files',
    'Internet Cache Files',
    'Temporary Setup Files',
    'Old ChkDsk Files',
    'Windows ESD installation files',
    'Delivery Optimization Files',
    'D3D Shader Cache',
    'Store Cache',
  ];
  for (const cat of categories) {
    try {
      const key = cat.replace(/[^a-zA-Z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
      execSync('powershell -Command "Set-ItemProperty -Path '' + CLEANUP_SAGE_REG_PATH + '\' + key + '' -Name StateFlags0011 -Value 1 -ErrorAction SilentlyContinue"', { windowsHide: true });
    } catch (_) {}
  }
}
setCleanupSageset();

// === SYSTEM CLEANUP ===
ipcMain.handle('system:cleanup', async () => {
  const results = []; let totalFreed = 0;
  // 1) Run Windows Disk Cleanup (cleanmgr) with our sagerun settings
  try {
    execSync('powershell -Command "cleanmgr /sagerun:11"', { windowsHide: true, timeout: 120000 });
    // cleanmgr does not return freed bytes; we report handled by OS
    results.push({ type: 'Windows Disk Cleanup', items: 1, freed: 0 });
  } catch (_) {
    results.push({ type: 'Windows Disk Cleanup', items: 0, freed: 0, error: 'Failed to start cleanmgr' });
  }

  // 2) Dism.exe component store cleanup (WinSxS)
  try {
    const dismOut = execSync('Dism.exe /Online /Cleanup-Image /AnalyzeComponentStore', { encoding: 'utf8', windowsHide: true, timeout: 120000 });
    if (dismOut.includes('Component Store can be cleaned up')) {
      execSync('Dism.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase', { windowsHide: true, timeout: 300000 });
      results.push({ type: 'DISM Component Store', items: 1, freed: 0 });
    }
  } catch (_) {
    // ignore; may not be available on all editions
  }

  // 3) Temp + shader cache cleanup (same as before but still useful)
  const tempDirs = [
    process.env.TEMP,
    process.env.WINDIR + '\Temp',
    process.env.LOCALAPPDATA + '\Temp',
    process.env.LOCALAPPDATA + '\NVIDIA\DXCache',
    process.env.LOCALAPPDATA + '\NVIDIA\GLCache',
    process.env.LOCALAPPDATA + '\AMD\Cache',
  ].filter(Boolean);
  for (const td of tempDirs) {
    try {
      if (!fs.existsSync(td)) continue;
      let cleaned = 0, freed = 0;
      const files = fs.readdirSync(td).slice(0, 500);
      for (const file of files) {
        try {
          const fp = path.join(td, file), stat = fs.statSync(fp);
          if (stat.isFile() && Date.now() - stat.mtimeMs > 86400000) {
            freed += stat.size;
            fs.unlinkSync(fp);
            cleaned++;
          }
        } catch (_) {}
      }
      if (cleaned > 0) {
        totalFreed += freed;
        results.push({
          type: td.includes('NVIDIA') ? 'NVIDIA Cache' : td.includes('AMD') ? 'AMD Cache' : 'Temp Files',
          items: cleaned,
          freed,
        });
      }
    } catch (_) {}
  }

  // 4) Prefetch cleanup
  try {
    const pf = process.env.WINDIR + '\Prefetch';
    if (fs.existsSync(pf)) {
      let cleaned = 0, freed = 0;
      for (const file of fs.readdirSync(pf).slice(0, 200)) {
        try {
          const fp = path.join(pf, file), stat = fs.statSync(fp);
          if (stat.isFile() && Date.now() - stat.mtimeMs > 604800000) {
            freed += stat.size;
            fs.unlinkSync(fp);
            cleaned++;
          }
        } catch (_) {}
      }
      if (cleaned > 0) {
        totalFreed += freed;
        results.push({ type: 'Prefetch', items: cleaned, freed });
      }
    }
  } catch (_) {}

  return { results, totalFreed, totalFreedGb: Math.round(totalFreed / 1073741824 * 10) / 10 };
});
"@
[System.IO.File]::WriteAllText($src, $before + $mid + $after, [System.Text.Encoding]::UTF8)
Write-Host "DONE"
