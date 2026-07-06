import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, RotateCcw, AlertCircle } from "lucide-react";
import { useBenchmark } from "@/lib/system-api";


export default function Benchmarks() {
  const { startBenchmark, resetBenchmark, running, results, error } = useBenchmark();

  const fpsGain = useMemo(() => {
    if (!results) return null;
    return ((results.fpsAfter - results.fpsBefore) / results.fpsBefore * 100);
  }, [results]);

  const lowOneGain = useMemo(() => {
    if (!results) return null;
    return ((results.lowOneAfter - results.lowOneBefore) / results.lowOneBefore * 100);
  }, [results]);

  const fpsBarData = useMemo(() => {
    if (!results) return [];
    return [
      { name: "Avg FPS", Before: results.fpsBefore, After: results.fpsAfter },
      { name: "1% Low FPS", Before: results.lowOneBefore, After: results.lowOneAfter },
    ];
  }, [results]);

  const frameBarData = useMemo(() => {
    if (!results) return [];
    return [
      { name: "CPU Frame (ms)", Before: results.cpuFrameBefore, After: results.cpuFrameAfter },
      { name: "GPU Frame (ms)", Before: results.gpuFrameBefore, After: results.gpuFrameAfter },
    ];
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Performance Benchmarks</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time system benchmarks based on live metrics — click Run to measure performance.</p>
        </div>
        <div className="flex items-center gap-2">
          {results && (
            <Button variant="outline" onClick={resetBenchmark} disabled={running} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
          <Button onClick={startBenchmark} disabled={running} className="bg-primary text-primary-foreground gap-2">
            {running ? (
              <><Skeleton className="w-4 h-4 rounded-full animate-spin" /> Running...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Benchmark</>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>Benchmark error: {error}</span>
        </div>
      )}

      {!results && !error && !running && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Play className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Benchmark Data Yet</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            <strong className="text-foreground">Note:</strong> This provides estimated performance metrics based on live system data.
            For accurate benchmarks, use dedicated tools like 3DMark, Cinebench, or game-specific benchmarks.
            This tool shows potential improvements from system optimizations.
          </p>
          <Button onClick={startBenchmark} disabled={running} size="lg" className="gap-2">
            <Play className="w-4 h-4" />
            Run Benchmark
          </Button>
        </div>
      )}

      {running && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Skeleton className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-lg font-semibold mb-2">Running Benchmark...</h2>
          <p className="text-muted-foreground text-sm">Analyzing CPU/GPU metrics and estimating performance...</p>
        </div>
      )}

      {results && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-5 border border-border bg-card rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Avg FPS Gain</div>
              <div className={`text-3xl font-bold mt-2 tabular-nums ${fpsGain !== null && fpsGain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {fpsGain !== null ? `${fpsGain >= 0 ? "+" : ""}${fpsGain.toFixed(1)}%` : "N/A"}
              </div>
            </div>
            <div className="p-5 border border-border bg-card rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">1% Lows Improvement</div>
              <div className={`text-3xl font-bold mt-2 tabular-nums ${lowOneGain !== null && lowOneGain >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {lowOneGain !== null ? `${lowOneGain >= 0 ? "+" : ""}${lowOneGain.toFixed(1)}%` : "N/A"}
              </div>
            </div>
            <div className="p-5 border border-border bg-card rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Avg FPS</div>
              <div className="text-3xl font-bold mt-2 tabular-nums">{results.fpsAfter}</div>
              <div className="text-xs text-muted-foreground mt-1">Up from {results.fpsBefore}</div>
            </div>
            <div className="p-5 border border-border bg-card rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">Frame Time Delta</div>
              <div className={`text-3xl font-bold mt-2 tabular-nums ${results.cpuFrameAfter + results.gpuFrameAfter <= results.cpuFrameBefore + results.gpuFrameBefore ? "text-emerald-500" : "text-red-500"}`}>
                {(results.cpuFrameAfter + results.gpuFrameAfter) <= (results.cpuFrameBefore + results.gpuFrameBefore) ? "-" : "+"}
                {Math.abs((results.cpuFrameAfter + results.gpuFrameAfter) - (results.cpuFrameBefore + results.gpuFrameBefore)).toFixed(1)}ms
              </div>
            </div>
          </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card rounded-lg p-5">
          <h3 className="font-semibold mb-6">Framerate Comparison</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fpsBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Before" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="After" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card rounded-lg p-5">
          <h3 className="font-semibold mb-6">Frame Time Comparison (Lower is Better)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frameBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Before" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                <Bar dataKey="After" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Benchmark Summary</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>CPU Load: {results.before?.cpu.load.toFixed(1) ?? "N/A"}% → {results.after?.cpu.load.toFixed(1) ?? "N/A"}%</p>
          <p>GPU Load: {results.before?.gpu.load?.toFixed(1) ?? "N/A"}% → {results.after?.gpu.load?.toFixed(1) ?? "N/A"}%</p>
          <p>RAM Used: {results.before ? (results.before.ram.used / 1073741824).toFixed(1) : "N/A"} GB → {results.after ? (results.after.ram.used / 1073741824).toFixed(1) : "N/A"} GB</p>
          <p className="mt-2 pt-2 border-t border-border/50 text-[10px]">
            ⚡ Estimated metrics based on system utilization. Actual game performance may vary.
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}