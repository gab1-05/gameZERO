import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu, Monitor, HardDrive, CircuitBoard, Network } from "lucide-react";
import { useSystemInfo, useSystemMetrics } from "@/lib/system-api";

function SpecSection({ title, icon: Icon, children, loading }: { title: string; icon: any; children: React.ReactNode; loading?: boolean }) {
  return (
    <div className="p-5 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground text-right ml-4">{value}</span>
    </div>
  );
}

export default function SystemSpecs() {
  const { data: systemInfo, loading: infoLoading } = useSystemInfo();
  const { data: metrics } = useSystemMetrics(3000);

  const cpuInfo = useMemo(() => {
    if (!systemInfo?.cpu || !metrics?.cpu) return null;
    const cpu = systemInfo.cpu;
    return {
      manufacturer: cpu.manufacturer || 'Unknown',
      brand: cpu.brand || 'Unknown',
      cores: cpu.cores || 0,
      threads: cpu.threads || 0,
      baseSpeed: cpu.speed ? `${cpu.speed.toFixed(1)} GHz` : 'Unknown',
      maxSpeed: cpu.speedMax ? `${cpu.speedMax.toFixed(1)} GHz` : 'Unknown',
      cache: cpu.cache ? Object.entries(cpu.cache).map(([level, size]) => ({
        level: level.toUpperCase(),
        size: size ? `${(size / 1024).toFixed(1)} MB` : 'Unknown'
      })) : []
    };
  }, [systemInfo, metrics]);

  const gpuInfo = useMemo(() => {
    if (!systemInfo?.primaryGpu || !metrics?.gpu) return null;
    const gpu = systemInfo.primaryGpu;
    const metricGpu = metrics.gpu;
    return {
      name: gpu.name || 'Unknown',
      vendor: gpu.vendor || 'Unknown',
      vram: gpu.vram ? `${(gpu.vram / 1024).toFixed(0)} GB` : 'Unknown',
      load: metricGpu.load !== null ? `${metricGpu.load}%` : 'N/A',
      temp: metricGpu.temp !== null ? `${metricGpu.temp}°C` : 'N/A',
    };
  }, [systemInfo, metrics]);

  const allGpusInfo = useMemo(() => {
    if (!systemInfo?.gpus) return [];
    return systemInfo.gpus.map((gpu, index) => {
      const nameLower = (gpu.name || '').toLowerCase();
      const vendorLower = (gpu.vendor || '').toLowerCase();
      const isIntegrated = nameLower.includes('integrated') || 
                          nameLower.includes('hd graphics') || 
                          nameLower.includes('uhd graphics') || 
                          nameLower.includes('iris') ||
                          (vendorLower.includes('intel') && !nameLower.includes('arc')) ||
                          (vendorLower.includes('amd') && nameLower.includes('graphics') && !nameLower.includes('rx'));
      
      return {
        name: gpu.name || `GPU ${index + 1}`,
        vendor: gpu.vendor || 'Unknown',
        vram: gpu.vram ? `${(gpu.vram / 1024).toFixed(0)} GB` : 'Unknown',
        isIntegrated,
        bus: gpu.bus || 'Unknown',
        clock: gpu.clock ? `${gpu.clock} MHz` : 'Unknown',
      };
    });
  }, [systemInfo]);

  const ramInfo = useMemo(() => {
    if (!metrics?.ram) return null;
    return {
      total: `${((metrics.ram.total / 1024) / 1024).toFixed(0)} GB`,
      used: `${((metrics.ram.used / 1024) / 1024).toFixed(1)} GB`,
      available: `${((metrics.ram.available / 1024) / 1024).toFixed(1)} GB`,
      usage: `${((metrics.ram.used / metrics.ram.total) * 100).toFixed(1)}%`
    };
  }, [metrics]);

  const motherboardInfo = useMemo(() => {
    if (!systemInfo) return null;
    return {
      manufacturer: systemInfo.baseboard?.manufacturer || 'Unknown',
      model: systemInfo.baseboard?.model || 'Unknown',
      biosVendor: systemInfo.bios?.vendor || 'Unknown',
      biosVersion: systemInfo.bios?.version || 'Unknown',
      biosDate: systemInfo.bios?.releaseDate || 'Unknown'
    };
  }, [systemInfo]);

  const osInfo = useMemo(() => {
    if (!systemInfo?.os) return null;
    const os = systemInfo.os;
    return {
      platform: os.platform || 'Unknown',
      distro: os.distro || 'Unknown',
      release: os.release || 'Unknown',
      kernel: os.kernel || 'Unknown',
      arch: os.arch || 'Unknown',
      hostname: os.hostname || 'Unknown'
    };
  }, [systemInfo]);

  const storageInfo = useMemo(() => {
    if (!systemInfo?.displays) return null;
    return systemInfo.displays.map(display => ({
      model: display.model || 'Unknown',
      resolution: `${display.resolutionX}x${display.resolutionY}`,
      refreshRate: display.refreshRate ? `${display.refreshRate} Hz` : 'Unknown',
      connection: display.connection || 'Unknown'
    }));
  }, [systemInfo]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">System Specifications</h1>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Detailed hardware information
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpecSection title="Processor" icon={Cpu} loading={infoLoading}>
          {cpuInfo && (
            <>
              <SpecRow label="Manufacturer" value={cpuInfo.manufacturer} />
              <SpecRow label="Model" value={cpuInfo.brand} />
              <SpecRow label="Cores / Threads" value={`${cpuInfo.cores} / ${cpuInfo.threads}`} />
              <SpecRow label="Base Speed" value={cpuInfo.baseSpeed} />
              <SpecRow label="Max Speed" value={cpuInfo.maxSpeed} />
              {cpuInfo.cache && cpuInfo.cache.length > 0 && (
                <>
                  {cpuInfo.cache.map(cache => (
                    <SpecRow key={cache.level} label={`Cache (${cache.level})`} value={cache.size} />
                  ))}
                </>
              )}
            </>
          )}
        </SpecSection>

        <SpecSection title="Primary Graphics" icon={Monitor} loading={infoLoading}>
          {gpuInfo && systemInfo && (
            <>
              <SpecRow label="Name" value={gpuInfo.name} />
              <SpecRow label="Vendor" value={gpuInfo.vendor} />
              <SpecRow label="VRAM" value={gpuInfo.vram} />
              <SpecRow label="Current Load" value={gpuInfo.load} />
              <SpecRow label="Temperature" value={gpuInfo.temp} />
              <SpecRow label="Bus" value={systemInfo.gpus?.[0]?.bus || 'Unknown'} />
            </>
          )}
        </SpecSection>

        {allGpusInfo.length > 1 && (
          <SpecSection title="All Graphics Adapters" icon={Monitor} loading={infoLoading}>
            {allGpusInfo.map((gpu, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold">{gpu.name}</span>
                  {gpu.isIntegrated && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Integrated
                    </span>
                  )}
                </div>
                <SpecRow label="Vendor" value={gpu.vendor} />
                <SpecRow label="VRAM" value={gpu.vram} />
                <SpecRow label="Bus" value={gpu.bus} />
                <SpecRow label="Clock" value={gpu.clock} />
                {i < allGpusInfo.length - 1 && <div className="border-t border-border/50 pt-2 mt-2" />}
              </div>
            ))}
          </SpecSection>
        )}

        <SpecSection title="Memory" icon={CircuitBoard} loading={infoLoading}>
          {ramInfo && (
            <>
              <SpecRow label="Total RAM" value={ramInfo.total} />
              <SpecRow label="In Use" value={ramInfo.used} />
              <SpecRow label="Available" value={ramInfo.available} />
              <SpecRow label="Usage" value={ramInfo.usage} />
            </>
          )}
        </SpecSection>

        <SpecSection title="Motherboard & BIOS" icon={HardDrive} loading={infoLoading}>
          {motherboardInfo && (
            <>
              <SpecRow label="Manufacturer" value={motherboardInfo.manufacturer} />
              <SpecRow label="Model" value={motherboardInfo.model} />
              <SpecRow label="BIOS Vendor" value={motherboardInfo.biosVendor} />
              <SpecRow label="BIOS Version" value={motherboardInfo.biosVersion} />
              <SpecRow label="BIOS Date" value={motherboardInfo.biosDate} />
            </>
          )}
        </SpecSection>

        <SpecSection title="Operating System" icon={CircuitBoard} loading={infoLoading}>
          {osInfo && (
            <>
              <SpecRow label="Platform" value={osInfo.platform} />
              <SpecRow label="Distribution" value={osInfo.distro} />
              <SpecRow label="Release" value={osInfo.release} />
              <SpecRow label="Kernel" value={osInfo.kernel} />
              <SpecRow label="Architecture" value={osInfo.arch} />
              <SpecRow label="Hostname" value={osInfo.hostname} />
            </>
          )}
        </SpecSection>

        <SpecSection title="Display" icon={Monitor} loading={infoLoading}>
          {storageInfo && storageInfo.length > 0 ? (
            storageInfo.map((display, i) => (
              <div key={i} className="space-y-2">
                <SpecRow label="Model" value={display.model} />
                <SpecRow label="Resolution" value={display.resolution} />
                <SpecRow label="Refresh Rate" value={display.refreshRate} />
                <SpecRow label="Connection" value={display.connection} />
                {i < storageInfo.length - 1 && <div className="border-t border-border/50 pt-2 mt-2" />}
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No display information available</div>
          )}
        </SpecSection>
      </div>
    </div>
  );
}