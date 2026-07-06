import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Fan, AlertTriangle, CheckCircle2, Wifi } from "lucide-react";
import { useRef, useEffect } from "react";
import { useSystemMetrics, useThermalHistory } from "@/lib/system-api";
import { showThermalAlert } from "@/lib/notifications";

export default function Thermals() {
  const { data: metrics, loading: metricsLoading } = useSystemMetrics(3000);
  const { data: thermals, loading: thermalsLoading } = useThermalHistory(5000);
  const alertedRef = useRef(false);
  
  const currentCpuTemp = metrics?.cpu.temp ?? (thermals?.[thermals.length - 1]?.cpuTemp ?? null);
  const currentGpuTemp = metrics?.gpu.temp ?? (thermals?.[thermals.length - 1]?.gpuTemp ?? null);
  
  // Show thermal alerts when thresholds exceeded (once per session)
  useEffect(() => {
    if (currentCpuTemp && currentGpuTemp && (currentCpuTemp > 85 || currentGpuTemp > 83) && !alertedRef.current) {
      alertedRef.current = true;
      showThermalAlert(currentCpuTemp, currentGpuTemp);
    }
  }, [currentCpuTemp, currentGpuTemp]);

  const cpuData = thermals
    ? thermals.map(r => ({ time: r.time, temp: r.cpuTemp }))
    : [];

  const gpuData = thermals
    ? thermals.filter(r => r.gpuTemp !== null).map(r => ({ time: r.time, temp: r.gpuTemp as number }))
    : [];

  const hasGpuData = gpuData.length > 0 && gpuData.some(d => d.temp > 0);
  const hasCpuData = cpuData.length > 0 && cpuData.some(d => d.temp > 0);

  const cpuOverheat = currentCpuTemp !== null && currentCpuTemp > 85;
  const gpuOverheat = currentGpuTemp !== null && currentGpuTemp > 83;
  const throttleRisk = cpuOverheat || gpuOverheat ? "High" : currentCpuTemp !== null && currentCpuTemp > 75 ? "Medium" : "Low";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Thermal Analytics</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary tracking-wider">
              <Wifi className="w-2.5 h-2.5 animate-pulse" />
              LIVE
            </div>
          </div>
          <p className="text-muted-foreground text-xs mt-1">Live temperature monitoring — updated every 5 seconds.</p>
        </div>
        <Badge
          variant="outline"
          className={`px-3 py-1 text-xs flex items-center gap-2 ${
            throttleRisk === "Low"
              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
              : throttleRisk === "Medium"
              ? "text-amber-500 border-amber-500/20 bg-amber-500/10"
              : "text-red-500 border-red-500/20 bg-red-500/10"
          }`}
        >
          {throttleRisk === "Low" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          Throttle Risk: {throttleRisk}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CPU Temp */}
        <div className={`border rounded-lg bg-card p-5 ${cpuOverheat ? "border-red-500/50" : "border-border"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className={`w-4 h-4 ${cpuOverheat ? "text-red-500" : "text-primary"}`} />
              <h3 className="font-semibold text-sm">CPU Temperature</h3>
            </div>
            {metricsLoading && !currentCpuTemp ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold tabular-nums ${cpuOverheat ? "text-red-500" : ""}`}>
                {currentCpuTemp != null && currentCpuTemp > 0 ? `${currentCpuTemp}°C` : "N/A"}
              </div>
            )}
          </div>
          {cpuOverheat && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1.5 border border-red-500/20">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Temperature above throttle threshold. CPU may be reducing clock speed to cool down.
            </div>
          )}
          <div className="h-52">
            {thermalsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasCpuData ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                CPU temperature sensor not detected on this system.<br />
                On gaming PCs, run as administrator for full sensor access.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuThermalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={[30, 110]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: 11 }}
                    formatter={(v: number) => [`${v}°C`, "CPU Temp"]}
                  />
                  <ReferenceLine
                    y={85}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    label={{ position: "insideTopLeft", value: "Throttle 85°C", fill: "hsl(var(--destructive))", fontSize: 9 }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#cpuThermalGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GPU Temp */}
        <div className={`border rounded-lg bg-card p-5 ${gpuOverheat ? "border-red-500/50" : "border-border"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className={`w-4 h-4 ${gpuOverheat ? "text-red-500" : "text-chart-2"}`} />
              <h3 className="font-semibold text-sm">GPU Temperature</h3>
              {metrics?.gpu.name && (
                <span className="text-[10px] text-muted-foreground font-mono">{metrics.gpu.name.split(" ").slice(-3).join(" ")}</span>
              )}
            </div>
            {metricsLoading && !currentGpuTemp ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className={`text-2xl font-bold tabular-nums ${gpuOverheat ? "text-red-500" : ""}`}>
                {currentGpuTemp != null && currentGpuTemp > 0 ? `${currentGpuTemp}°C` : "N/A"}
              </div>
            )}
          </div>
          {gpuOverheat && (
            <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1.5 border border-red-500/20">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              GPU temperature above safe threshold. Frame rates may be reduced.
            </div>
          )}
          <div className="h-52">
            {thermalsLoading ? (
              <Skeleton className="h-full w-full" />
            ) : !hasGpuData ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center px-4">
                GPU temperature sensor not available.<br />
                Discrete GPU sensors typically require proprietary drivers.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpuData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpuThermalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={[30, 110]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: 11 }}
                    formatter={(v: number) => [`${v}°C`, "GPU Temp"]}
                  />
                  <ReferenceLine
                    y={83}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    label={{ position: "insideTopLeft", value: "Throttle 83°C", fill: "hsl(var(--destructive))", fontSize: 9 }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#gpuThermalGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 border border-border rounded-lg bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Fan className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Active Cooling</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded border border-border/50">
              <div className="text-xs text-muted-foreground">CPU Cooler</div>
              <div className="text-lg font-mono mt-1 tabular-nums">
                {metrics?.cpu.temp != null && metrics.cpu.temp > 0 ? "Active" : "N/A"}
              </div>
              {metrics?.cpu.temp != null && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {metrics.cpu.temp < 60 ? "Low speed" : metrics.cpu.temp < 75 ? "Medium speed" : "High speed"}
                </div>
              )}
            </div>
            <div className="p-3 bg-muted/30 rounded border border-border/50">
              <div className="text-xs text-muted-foreground">GPU Fans</div>
              <div className="text-lg font-mono mt-1 tabular-nums">
                {metrics?.gpu.temp != null && metrics.gpu.temp > 0 ? "Active" : "N/A"}
              </div>
              {metrics?.gpu.temp != null && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {metrics.gpu.temp < 60 ? "Low speed" : metrics.gpu.temp < 75 ? "Medium speed" : "High speed"}
                </div>
              )}
            </div>
            <div className="p-3 bg-muted/30 rounded border border-border/50">
              <div className="text-xs text-muted-foreground">CPU Model</div>
              <div className="text-xs font-mono mt-1 leading-snug">
                {metrics?.cpu.model?.replace(/\(R\)/g, "").replace(/\(TM\)/g, "").trim() ?? "Detecting..."}
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded border border-border/50">
              <div className="text-xs text-muted-foreground">GPU Model</div>
              <div className="text-xs font-mono mt-1 leading-snug">
                {metrics?.gpu.name ?? "No discrete GPU detected"}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 border border-border rounded-lg bg-card p-5">
          <h3 className="font-semibold mb-4 text-xs uppercase tracking-wider text-muted-foreground">Thermal Advice</h3>
          <div className="space-y-3">
            {cpuOverheat ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">CPU is overheating. Check cooler mounting and thermal paste. Consider reducing CPU-heavy background tasks.</p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {currentCpuTemp != null && currentCpuTemp > 0
                    ? `CPU at ${currentCpuTemp}°C — within safe operating range.`
                    : "CPU thermal sensor not accessible on this system."}
                </p>
              </div>
            )}
            {gpuOverheat ? (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">GPU overheating. Increase fan curve aggressiveness or improve case airflow.</p>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {currentGpuTemp != null && currentGpuTemp > 0
                    ? `GPU at ${currentGpuTemp}°C — thermal headroom available.`
                    : "GPU temperature sensor not exposed on this system."}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">For gaming PCs, run gameZERO as Administrator for full hardware sensor access.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
