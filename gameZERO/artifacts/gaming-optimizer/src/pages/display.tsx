import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Monitor, Cpu, CircuitBoard, Zap, Thermometer, Check } from "lucide-react";
import { useState } from "react";
import { useSystemMetrics, useSystemInfo, useGraphicsSettings } from "@/lib/system-api";

const SETTINGS = [
  { id: "refresh", name: "Refresh Rate", value: "240Hz", rec: "Maximum available", type: "select", options: ["60Hz", "120Hz", "144Hz", "240Hz"], learn: "Higher refresh rates reduce input lag and display motion more smoothly." },
  { id: "vrr", name: "VRR / G-Sync", value: "Active", rec: "Active", type: "switch", checked: true, learn: "Variable Refresh Rate synchronizes your monitor to your GPU to prevent screen tearing." },
  { id: "hags", name: "Hardware GPU Scheduling", value: "Enabled", rec: "Enabled", type: "switch", checked: true, learn: "Allows the GPU to manage its own memory, improving latency in some games." },
  { id: "texture", name: "Texture Filtering", value: "Anisotropic 16x", rec: "16x", type: "select", options: ["Off", "Trilinear", "8x", "16x"], learn: "Improves texture clarity at oblique viewing angles with minimal performance hit on modern GPUs." },
  { id: "vsync", name: "V-Sync (Global)", value: "Off", rec: "Off", type: "switch", checked: false, learn: "Should generally be disabled globally and managed per-game or replaced by VRR/G-Sync." },
  { id: "shader", name: "Shader Cache", value: "Enabled", rec: "Enabled", type: "switch", checked: true, learn: "Saves compiled shaders to disk to prevent stuttering in games." },
  { id: "latency", name: "Low Latency Mode", value: "Ultra", rec: "Ultra", type: "select", options: ["Off", "On", "Ultra"], learn: "Restricts the number of pre-rendered frames. Ultra minimizes input latency." },
  { id: "res", name: "Resolution", value: "Native", rec: "Native", type: "select", options: ["1080p", "1440p", "4K", "Native"], learn: "Running at your monitor's native resolution provides the sharpest image." },
];

function GpuCard({ gpu, index }: { gpu: any; index: number }) {
  const isIntegrated = gpu.vendor?.toLowerCase().includes('intel') || 
                       gpu.bus?.toLowerCase().includes('integrated') ||
                       (gpu.vram === 0 || gpu.vram === null);
  
  return (
    <div className={`border rounded-lg p-5 ${isIntegrated ? 'border-amber-500/50 bg-amber-500/5' : 'border-border bg-card'}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isIntegrated ? 'bg-amber-500/20' : 'bg-primary/20'}`}>
          <Monitor className={`w-5 h-5 ${isIntegrated ? 'text-amber-500' : 'text-primary'}`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base truncate">{gpu.name || `GPU ${index + 1}`}</h3>
            {isIntegrated && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-500 uppercase tracking-wider">Integrated</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{gpu.vendor}{gpu.bus ? ` | ${gpu.bus}` : ''}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-md p-2.5 ${isIntegrated ? 'bg-amber-500/10' : 'bg-muted/30'}`}>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">VRAM</div>
          <div className="text-sm font-mono font-semibold mt-0.5">
            {gpu.vram ? `${(gpu.vram / 1024 / 1024 / 1024).toFixed(1)} GB` : 'System Shared'}
          </div>
        </div>
        <div className={`rounded-md p-2.5 ${isIntegrated ? 'bg-amber-500/10' : 'bg-muted/30'}`}>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Clock</div>
          <div className="text-sm font-mono font-semibold mt-0.5">
            {gpu.clock ? `${gpu.clock} MHz` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Display() {
  const { data: systemInfo, loading } = useSystemInfo();
  const { data: metrics } = useSystemMetrics(3000);
  const { apply: applyGraphics, applying: graphicsApplying, lastResult } = useGraphicsSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({
    refresh: "240Hz", vrr: true, hags: true, texture: "16x", vsync: false, shader: true, latency: "Ultra", res: "Native"
  });
  const [appliedSettings, setAppliedSettings] = useState<Set<string>>(new Set());

  const handleApplyAll = async () => {
    const payload: any = {};
    if (localSettings.refresh === "240Hz") payload.refreshRate = "240Hz";
    if (localSettings.vrr === true) payload.vsync = false;
    if (localSettings.hags === true) payload.hags = true;
    if (localSettings.latency === "Ultra") payload.latencyMode = "Ultra";
    payload.powerMode = localSettings.latency === "Ultra" ? "max" : "balanced";

    const result = await applyGraphics(payload);
    if (result?.ok) {
      SETTINGS.forEach(s => setAppliedSettings(prev => new Set([...prev, s.id])));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Display & GPU Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor system GPUs and configure graphics driver settings.</p>
      </div>

      {/* All GPUs Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          Installed GPUs ({systemInfo?.gpus?.length || metrics?.allGpus?.length || 0})
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
          </div>
        ) : systemInfo?.gpus && systemInfo.gpus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemInfo.gpus.map((gpu, i) => (
              <GpuCard key={i} gpu={gpu} index={i} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-border rounded-lg text-center">
            <Monitor className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No GPU data available. Ensure the app is running in Electron.</p>
          </div>
        )}
      </div>

      {/* Live GPU Metrics */}
      {metrics?.allGpus && metrics.allGpus.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Live GPU Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.allGpus.map((gpu, i) => (
              <div key={i} className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold">{gpu.name || `GPU ${i + 1}`}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Load: </span>
                    <span className="font-mono font-bold">{gpu.load != null ? `${gpu.load}%` : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp: </span>
                    <span className="font-mono font-bold">{gpu.temp != null ? `${gpu.temp}°C` : 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">VRAM: </span>
                    <span className="font-mono font-bold">
                      {gpu.vram?.used != null ? `${(gpu.vram.used / 1024).toFixed(1)} GB` : 'N/A'}
                      {gpu.vram?.total != null ? ` / ${(gpu.vram.total / 1024).toFixed(0)} GB` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphics Driver Settings */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CircuitBoard className="w-4 h-4 text-primary" />
          Graphics Driver Settings
        </h2>
        
        {lastResult && (
          <div className="mb-4 p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-lg flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-emerald-500">Settings Applied</div>
              <div className="text-xs text-muted-foreground mt-0.5">{lastResult.results?.join(', ')}</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {SETTINGS.map(setting => {
            const settingValue = localSettings[setting.id] ?? (setting.type === 'switch' ? setting.checked : setting.value);
            return (
            <div key={setting.id} className={`border rounded-lg p-5 flex flex-col bg-card transition-colors ${appliedSettings.has(setting.id) ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">{setting.name}</h3>
                    {appliedSettings.has(setting.id) && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Recommended:</span>
                    <span className="text-xs font-bold text-primary">{setting.rec}</span>
                  </div>
                </div>
                
                <div className="flex items-center shrink-0 ml-4">
                  {setting.type === "switch" ? (
                    <Switch 
                      checked={!!settingValue}
                      onCheckedChange={(val) => setLocalSettings(prev => ({ ...prev, [setting.id]: val }))}
                    />
                  ) : (
                    <Select value={settingValue as string} onValueChange={(val) => setLocalSettings(prev => ({ ...prev, [setting.id]: val }))}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options?.map(opt => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md flex items-start gap-2 text-xs text-muted-foreground mt-4">
                <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p>{setting.learn}</p>
              </div>
            </div>
          )})}
        </div>

        <div className="mt-4 flex items-center justify-between p-4 border border-border bg-card rounded-lg">
          <div>
            <h3 className="text-sm font-semibold">Apply All Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Apply your preferred settings to system graphics drivers</p>
          </div>
          <Button onClick={handleApplyAll} disabled={graphicsApplying} className="gap-2">
            <CircuitBoard className="w-4 h-4" />
            {graphicsApplying ? "Applying..." : "Apply Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}