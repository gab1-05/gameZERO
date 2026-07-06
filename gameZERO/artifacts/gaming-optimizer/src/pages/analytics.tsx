import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Download, Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { usePerformanceTrends, useSystemMetrics } from "@/lib/system-api";

export default function Analytics() {
  const { data: trends, loading: trendsLoading } = usePerformanceTrends(10000);
  const { data: currentMetrics } = useSystemMetrics(5000);
  const [timeRange, setTimeRange] = useState("1h");

  const chartData = (trends || []).map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cpu: Math.round(t.cpu * 10) / 10,
    memory: Math.round(t.memory * 10) / 10,
    gpu: Math.round(t.gpu * 10) / 10,
  }));

  const avgCpu = chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b.cpu, 0) / chartData.length * 10) / 10 : 0;
  const avgMemory = chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b.memory, 0) / chartData.length * 10) / 10 : 0;
  const avgGpu = chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b.gpu, 0) / chartData.length * 10) / 10 : 0;

  // Performance per watt (efficiency score)
  const efficiencyScore = chartData.length > 0 && avgCpu > 0 && avgGpu > 0 
    ? Math.round((100 - (avgCpu + avgGpu) / 2) * 10) / 10 
    : 0;

  const handleExport = () => {
    if (!chartData.length) return;
    const csv = "Time,CPU%,Memory%,GPU%\n" + chartData.map(d => `${d.time},${d.cpu},${d.memory},${d.gpu}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gamezero-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Historical performance trends and insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-3 h-3 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last 1 Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2" disabled={chartData.length === 0}>
            <Download className="w-3 h-3" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">AVG CPU</div>
          </div>
          <div className="text-2xl font-bold">{avgCpu}%</div>
          <div className="text-xs text-muted-foreground mt-1">Average utilization</div>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">AVG MEMORY</div>
          </div>
          <div className="text-2xl font-bold">{avgMemory}%</div>
          <div className="text-xs text-muted-foreground mt-1">RAM usage</div>
        </div>
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">AVG GPU</div>
          </div>
          <div className="text-2xl font-bold">{avgGpu}%</div>
          <div className="text-xs text-muted-foreground mt-1">Graphics load</div>
        </div>
        <div className={`border rounded-lg bg-card p-4 ${efficiencyScore > 70 ? 'border-emerald-500/30 bg-emerald-500/5' : efficiencyScore > 40 ? 'border-amber-500/30 bg-amber-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-4 h-4 ${efficiencyScore > 70 ? 'text-emerald-500' : efficiencyScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>⚡</div>
            <div className="text-xs font-semibold text-muted-foreground">EFFICIENCY</div>
          </div>
          <div className={`text-2xl font-bold ${efficiencyScore > 70 ? 'text-emerald-500' : efficiencyScore > 40 ? 'text-amber-500' : 'text-red-500'}`}>{efficiencyScore}</div>
          <div className="text-xs text-muted-foreground mt-1">Performance per watt</div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Performance Over Time</h3>
        
        {trendsLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : chartData.length === 0 ? (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Collecting data...</p>
              <p className="text-xs mt-1">Performance metrics will appear here as they're collected</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" name="CPU %" dot={false} />
              <Area type="monotone" dataKey="memory" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" name="Memory %" dot={false} />
              <Area type="monotone" dataKey="gpu" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gpuGrad)" name="GPU %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <h3 className="font-semibold text-sm mb-3">Current System State</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <div className="text-muted-foreground mb-1">CPU Model</div>
          <div className="font-mono font-semibold truncate">{currentMetrics?.cpu.model || "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">CPU Load</div>
          <div className="font-mono font-semibold">{currentMetrics?.cpu.load ?? 0}%</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">GPU</div>
          <div className="font-mono font-semibold truncate">{currentMetrics?.gpu?.name || "N/A"}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">RAM Used</div>
          <div className="font-mono font-semibold">{currentMetrics ? (currentMetrics.ram.used / 1073741824).toFixed(1) : "0"} GB</div>
        </div>
      </div>
      </div>
    </div>
  );
}