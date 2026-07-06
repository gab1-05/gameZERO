import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, Info, Monitor, Download, Upload, Wifi } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from "recharts";
import { useSystemMetrics, useThermalHistory, bytesToGb, useSystemInfo, useNetworkSpeed } from "@/lib/system-api";

function NetworkSpeedCard() {
  const { data: network, loading: networkLoading } = useNetworkSpeed(2000);
  
  const fmtSpeed = (bytesPerSec: number) => {
    if (bytesPerSec === 0) return '0 KB/s';
    const mbps = bytesPerSec / 1048576;
    if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
    const kbps = bytesPerSec / 1024;
    return `${kbps.toFixed(0)} KB/s`;
  };
  
  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Wifi className="w-4 h-4 text-primary" />
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Network</div>
      </div>
      {networkLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : network ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mb-1">
                <Download className="w-3 h-3" />
                Download
              </div>
              <div className="text-lg font-bold tabular-nums text-emerald-500">
                {fmtSpeed(network.downloadSpeed)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 mb-1">
                <Upload className="w-3 h-3" />
                Upload
              </div>
              <div className="text-lg font-bold tabular-nums text-blue-500">
                {fmtSpeed(network.uploadSpeed)}
              </div>
            </div>
          </div>
          {network.interface && (
            <div className="text-[10px] text-muted-foreground/60 font-mono pt-1.5 border-t border-border/50">
              {network.interface.type} • {network.interface.name}
            </div>
          )}
          {network.sessionRx > 0 && (
            <div className="text-[9px] text-muted-foreground/40 font-mono text-center pt-1">
              Session: ↓ {(network.sessionRx / 1073741824).toFixed(2)} GB ↑ {(network.sessionTx / 1073741824).toFixed(2)} GB
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">Network info unavailable</div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  loading,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  loading: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border bg-card flex flex-col justify-between ${warn ? "border-red-500/40" : "border-border"}`}>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {loading ? (
        <Skeleton className="h-8 w-16 mt-2" />
      ) : (
        <div className="mt-2">
          <div className={`text-2xl font-bold tabular-nums ${warn ? "text-red-500" : ""}`}>{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
        </div>
      )}
    </div>
  );
}

export default function Overview() {
  const { data: metrics, loading: metricsLoading } = useSystemMetrics(3000);
  const { data: thermals, loading: thermalsLoading } = useThermalHistory(5000);
  const { data: systemInfo, loading: sysInfoLoading } = useSystemInfo();

  const { score, issues, actions, allGpuNames, cpuChartData, gpuChartData, currentCpuTemp, currentGpuTemp, latestCpuThermal, latestGpuThermal } = useMemo(() => {
    const ramGbUsed = metrics ? bytesToGb(metrics.ram.used) : 0;
    const ramGbTotal = metrics ? bytesToGb(metrics.ram.total) : 0;
    const ramPct = metrics ? Math.round((metrics.ram.used / metrics.ram.total) * 100) : 0;

    let s = 100;
    const iss: { level: "red" | "amber"; msg: string }[] = [];
    const acts: string[] = [];

    if (metrics) {
      if (metrics.cpu.load > 80) { s -= 25; iss.push({ level: "red", msg: `CPU load critical — ${metrics.cpu.load.toFixed(0)}% (close background apps)` }); }
      else if (metrics.cpu.load > 60) { s -= 10; iss.push({ level: "amber", msg: `CPU load elevated — ${metrics.cpu.load.toFixed(0)}% (consider closing non-essential apps)` }); }

      const rp = (metrics.ram.used / metrics.ram.total) * 100;
      if (rp > 85) { s -= 20; iss.push({ level: "red", msg: `RAM usage critical — ${rp.toFixed(0)}% used (${bytesToGb(metrics.ram.used)} GB / ${bytesToGb(metrics.ram.total)} GB)` }); }
      else if (rp > 70) { s -= 8; iss.push({ level: "amber", msg: `RAM usage high — ${rp.toFixed(0)}% used` }); }

      if (metrics.cpu.temp !== null) {
        if (metrics.cpu.temp > 85) { s -= 20; iss.push({ level: "red", msg: `CPU overheating — ${metrics.cpu.temp}°C (throttle risk above 85°C)` }); }
        else if (metrics.cpu.temp > 75) { s -= 10; iss.push({ level: "amber", msg: `CPU temperature elevated — ${metrics.cpu.temp}°C` }); }
      }

      if (metrics.gpu.temp !== null) {
        if (metrics.gpu.temp > 83) { s -= 15; iss.push({ level: "red", msg: `GPU overheating — ${metrics.gpu.temp}°C (throttle risk above 83°C)` }); }
        else if (metrics.gpu.temp > 73) { s -= 8; iss.push({ level: "amber", msg: `GPU temperature elevated — ${metrics.gpu.temp}°C` }); }
      }

      if (metrics.gpu.load === null && metrics.gpu.name === null) {
        s -= 5;
        iss.push({ level: "amber", msg: "GPU telemetry unavailable — limited monitoring active" });
      }

      if (metrics.allGpus && metrics.allGpus.length > 1) {
        const gpuNames = metrics.allGpus.map(g => g.name).filter(Boolean).join(", ");
        iss.push({ level: "amber" as const, msg: `${metrics.allGpus.length} GPUs detected: ${gpuNames}` });
      }

      s = Math.max(0, Math.min(100, s));

      if (metrics.cpu.load > 60) acts.push("Kill high-CPU processes in Process Manager");
      if (rp > 70) acts.push("Free RAM — terminate background browser or media apps");
      if (metrics.cpu.temp !== null && metrics.cpu.temp > 75) acts.push("Check CPU cooler and reapply thermal paste");
      acts.push("Run Quick Optimize to apply safe performance fixes");
      acts.push("Check Process Manager for resource-heavy background tasks");
    } else {
      s = 87;
    }

    const agn = metrics?.allGpus?.map(g => g.name).filter(Boolean).join(" + ") || "";
    const cpud = thermals ? thermals.map((r, i) => ({ time: r.time, temp: r.cpuTemp, idx: i })) : [];
    const gpud = thermals ? thermals.map((r, i) => ({ time: r.time, temp: r.gpuTemp ?? 0, idx: i })) : [];
    const cct = metrics?.cpu.temp;
    const cgt = metrics?.gpu.temp;
    const lct = thermals?.[thermals.length - 1]?.cpuTemp;
    const lgt = thermals?.[thermals.length - 1]?.gpuTemp;

    return { 
      score: s, 
      issues: iss, 
      actions: acts.slice(0, 3),
      allGpuNames: agn,
      cpuChartData: cpud,
      gpuChartData: gpud,
      currentCpuTemp: cct,
      currentGpuTemp: cgt,
      latestCpuThermal: lct,
      latestGpuThermal: lgt,
    };
  }, [metrics, thermals]);

  const ramGbUsed = metrics ? bytesToGb(metrics.ram.used) : 0;
  const ramGbTotal = metrics ? bytesToGb(metrics.ram.total) : 0;
  const ramPct = metrics ? Math.round((metrics.ram.used / metrics.ram.total) * 100) : 0;

  const scoreColor = useMemo(() => score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444", [score]);

  const circleR = 56;
  const circumference = useMemo(() => 2 * Math.PI * circleR, []);
  const offset = useMemo(() => circumference - (circumference * score) / 100, [circumference, score]);

  const systemLabel = useMemo(() => metrics?.cpu.model
    ? `${metrics.cpu.model.replace(/\(R\)/g, "").replace(/\(TM\)/g, "").trim()} | ${allGpuNames || metrics.gpu.name || "GPU"} | ${bytesToGb(metrics.ram.total, 0)} GB RAM`
    : "Scanning system hardware...", [metrics, allGpuNames]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">System Overview</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary tracking-wider">
              <Wifi className="w-2.5 h-2.5 animate-pulse" />
              LIVE
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {metricsLoading ? "Scanning system hardware..." : systemLabel}
          </div>
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0" data-testid="btn-quick-optimize">
          Run Quick Optimize
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="CPU Usage"
          value={metrics ? `${metrics.cpu.load.toFixed(0)}%` : "--"}
          loading={metricsLoading}
          warn={!!metrics && metrics.cpu.load > 80}
        />
        <KpiCard
          label="GPU Usage"
          value={metrics?.gpu.load != null ? `${metrics.gpu.load}%` : "N/A"}
          sub={allGpuNames ? allGpuNames.split(" ").slice(-2).join(" ") : metrics?.gpu.name ? metrics.gpu.name.split(" ").slice(-2).join(" ") : undefined}
          loading={metricsLoading}
          warn={!!metrics?.gpu.load && metrics.gpu.load > 90}
        />
        <KpiCard
          label="RAM"
          value={metrics ? `${ramGbUsed} GB` : "--"}
          sub={metrics ? `of ${ramGbTotal} GB (${ramPct}%)` : undefined}
          loading={metricsLoading}
          warn={ramPct > 85}
        />
        <KpiCard
          label="VRAM"
          value={
            metrics?.gpu.vram?.used != null
              ? `${(metrics.gpu.vram.used / 1024).toFixed(1)} GB`
              : "N/A"
          }
          sub={
            metrics?.gpu.vram?.total != null
              ? `of ${(metrics.gpu.vram.total / 1024).toFixed(0)} GB`
              : undefined
          }
          loading={metricsLoading}
        />
        <KpiCard
          label="CPU Temp"
          value={
            currentCpuTemp != null
              ? `${currentCpuTemp}°C`
              : latestCpuThermal != null && latestCpuThermal > 0
              ? `${latestCpuThermal}°C`
              : "N/A"
          }
          loading={metricsLoading && thermalsLoading}
          warn={
            (currentCpuTemp != null && currentCpuTemp > 85) ||
            (latestCpuThermal != null && latestCpuThermal > 85)
          }
        />
        <KpiCard
          label="GPU Temp"
          value={
            currentGpuTemp != null
              ? `${currentGpuTemp}°C`
              : latestGpuThermal != null && latestGpuThermal > 0
              ? `${latestGpuThermal}°C`
              : "N/A"
          }
          loading={metricsLoading && thermalsLoading}
          warn={
            (currentGpuTemp != null && currentGpuTemp > 83) ||
            (latestGpuThermal != null && latestGpuThermal > 83)
          }
        />
      </div>
      
      {/* Network Speed KPI */}
      <NetworkSpeedCard />

      {/* All GPUs Section */}
      {metrics?.allGpus && metrics.allGpus.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.allGpus.map((gpu, i) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="w-3 h-3 text-primary" />
                <span className="text-xs font-semibold">{gpu.name || `GPU ${i + 1}`}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>Load: <span className="font-mono font-medium text-foreground">{gpu.load != null ? `${gpu.load}%` : "N/A"}</span></div>
                <div>Temp: <span className="font-mono font-medium text-foreground">{gpu.temp != null ? `${gpu.temp}°C` : "N/A"}</span></div>
                <div>VRAM: <span className="font-mono font-medium text-foreground">{gpu.vram?.total ? `${(gpu.vram.total / 1024).toFixed(0)} GB` : "N/A"}</span></div>
                <div>Bus: <span className="font-mono font-medium text-foreground">{gpu.bus || "N/A"}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm">CPU Temp History</div>
            <div className="text-xs font-mono text-muted-foreground tabular-nums">
              {latestCpuThermal && latestCpuThermal > 0 ? `${latestCpuThermal}°C now` : "Sensor N/A"}
            </div>
          </div>
          {thermalsLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : cpuChartData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
              Collecting thermal data... check back in a few seconds.
            </div>
          ) : (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuChartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: 11 }}
                    formatter={(v: number) => [`${v}°C`, "CPU Temp"]}
                  />
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--chart-1))" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-5 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-sm">GPU Temp History</div>
            <div className="text-xs font-mono text-muted-foreground tabular-nums">
              {latestGpuThermal && latestGpuThermal > 0 ? `${latestGpuThermal}°C now` : "Sensor N/A"}
            </div>
          </div>
          {thermalsLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : gpuChartData.length === 0 || gpuChartData.every(d => d.temp === 0) ? (
            <div className="h-36 flex items-center justify-center text-xs text-muted-foreground">
              GPU thermal sensor not available on this system.
            </div>
          ) : (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gpuChartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: 11 }}
                    formatter={(v: number) => [`${v}°C`, "GPU Temp"]}
                  />
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={1} fill="url(#gpuGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Processes</div>
          <div className="text-lg font-bold tabular-nums">
            {metrics ? `${Math.max(0, Math.round(metrics.cpu.load / 5))} active` : '--'}
          </div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">System Load</div>
          <div className="text-lg font-bold tabular-nums">
            {metrics ? `${metrics.cpu.load.toFixed(0)}%` : '--'}
          </div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">RAM Usage</div>
          <div className="text-lg font-bold tabular-nums">
            {metrics ? `${ramPct}%` : '--'}
          </div>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Health</div>
          <div className={`text-lg font-bold ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
            {score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor'}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-border bg-card rounded-lg p-5 flex flex-col items-center justify-center text-center">
          {metricsLoading ? (
            <Skeleton className="w-28 h-28 rounded-full mb-4" />
          ) : (
            <div className="relative w-28 h-28 flex items-center justify-center mb-3"> 
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={circleR} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={circleR}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="text-3xl font-bold tabular-nums" style={{ color: scoreColor }}>{score}</div>
            </div>
          )}
          <div className="font-semibold text-sm">Readiness Score</div>
          <p className="text-xs text-muted-foreground mt-1">
            {score >= 80 ? "System is well-optimized." : score >= 60 ? "Some issues detected." : "Performance issues present."}
          </p>
        </div>

        <div className="lg:col-span-2 border border-border bg-card rounded-lg flex overflow-hidden">
          <div className="flex-1 p-5 border-r border-border min-w-0">
            <div className="flex items-center gap-2 mb-3 text-amber-500">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <h3 className="font-semibold text-sm">
                {metricsLoading ? "Scanning..." : `Issues Detected (${issues.length})`}
              </h3>
            </div>
            {metricsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : issues.length === 0 ? (
              <p className="text-sm text-emerald-500">No issues detected. System performing well.</p>
            ) : (
              <ul className="space-y-2">
                {issues.slice(0, 4).map((issue, i) => (
                  <li key={i} className="text-xs flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${issue.level === "red" ? "bg-red-500" : "bg-amber-500"}`} />
                    <span className="text-muted-foreground leading-relaxed">{issue.msg}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex-1 p-5 bg-muted/20 min-w-0">
            <div className="flex items-center gap-2 mb-3 text-primary">
              <Info className="w-4 h-4 shrink-0" />
              <h3 className="font-semibold text-sm">Recommended Actions</h3>
            </div>
            {metricsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : (
              <ul className="space-y-2">
                {actions.map((action, i) => (
                  <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    <span className="underline decoration-primary/30 underline-offswwwwwwwwwwet-2">{action}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
