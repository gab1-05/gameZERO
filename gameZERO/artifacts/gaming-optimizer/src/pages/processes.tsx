import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, RefreshCw } from "lucide-react";
import { systemCommand, useSystemProcesses, bytesToGb } from "@/lib/system-api";

const FILTERS = ["All", "High Impact", "Browsers", "Communication", "Launchers", "Media", "System"];

export default function Processes() {
  const { data: liveProcesses, total, loading, error, lastUpdated } = useSystemProcesses(4000);
  const [activeFilter, setActiveFilter] = useState("All");
  const [killedPids, setKilledPids] = useState<Set<number>>(new Set());
  const [busyPid, setBusyPid] = useState<number | null>(null);

  const processes = useMemo(() => {
    if (!liveProcesses) return [];
    return liveProcesses.filter(p => !killedPids.has(p.pid));
  }, [liveProcesses, killedPids]);

  const filtered = useMemo(() => {
    return processes.filter(p => {
      if (activeFilter === "All") return true;
      if (activeFilter === "High Impact") return p.impact === "High";
      if (activeFilter === "Browsers") return p.category === "Browser";
      if (activeFilter === "Communication") return p.category === "Communication";
      if (activeFilter === "Launchers") return p.category === "Launcher";
      if (activeFilter === "Media") return p.category === "Media";
      if (activeFilter === "System") return p.category === "System";
      return true;
    });
  }, [processes, activeFilter]);

  const totalCpu = filtered.reduce((a, p) => a + p.cpu, 0);
  const totalRamMb = filtered.reduce((a, p) => a + p.mem, 0);

  const killProcess = async (pid: number) => {
    setBusyPid(pid);
    const result = await systemCommand<{ ok: boolean; error?: string }>("killProcess", { pid }).catch((e) => ({
      ok: false,
      error: String(e),
    }));
    setBusyPid(null);
    if (result.ok) {
      setKilledPids(prev => new Set([...prev, pid]));
    } else {
      window.alert(result.error || "Could not terminate process.");
    }
  };

  const lastUpdatedStr = lastUpdated
    ? `Updated ${Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
    : "Connecting...";

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Process Manager</h1>
            {!loading && !error && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary tracking-wider">
                <Wifi className="w-2.5 h-2.5 animate-pulse" />
                LIVE
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-xs mt-1 font-mono">
            {error
              ? "API unavailable — check connection"
              : loading
              ? "Scanning running processes..."
              : `${total} total processes · ${lastUpdatedStr}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setKilledPids(new Set())}
          data-testid="btn-refresh-processes"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <Badge
            key={f}
            variant={activeFilter === f ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
            onClick={() => setActiveFilter(f)}
            data-testid={`filter-${f.toLowerCase().replace(" ", "-")}`}
          >
            {f}
          </Badge>
        ))}
      </div>

      {/* Summary Bar */}
      <div className="p-3 border border-border bg-card rounded-lg grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Visible CPU Load</span>
            <span className="tabular-nums font-mono">{totalCpu.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(totalCpu, 100)} className="h-1.5" />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground">Visible RAM Usage</span>
            <span className="tabular-nums font-mono">{bytesToGb(totalRamMb * 1024 * 1024)} GB</span>
          </div>
          <Progress value={Math.min((totalRamMb / 32000) * 100, 100)} className="h-1.5" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg bg-card overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <div className="overflow-auto flex-1">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead className="text-xs w-12">PID</TableHead>
                <TableHead className="text-xs">Process</TableHead>
                <TableHead className="text-right text-xs">CPU</TableHead>
                <TableHead className="text-right text-xs">RAM</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Impact</TableHead>
                <TableHead className="text-xs">User</TableHead>
                <TableHead className="text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                    Could not load process list — API server may be starting up.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                    No processes match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.pid} className="group">
                    <TableCell className="text-xs text-muted-foreground font-mono tabular-nums">{p.pid}</TableCell>
                    <TableCell className="font-medium font-mono text-xs max-w-[160px] truncate">{p.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">
                      <span className={p.cpu > 10 ? "text-red-400" : p.cpu > 3 ? "text-amber-400" : ""}>
                        {p.cpu.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-mono">
                      <span className={p.mem > 500 ? "text-red-400" : p.mem > 200 ? "text-amber-400" : ""}>
                        {p.mem > 1024 ? `${(p.mem / 1024).toFixed(1)} GB` : `${p.mem} MB`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/30 font-normal text-[10px] py-0 h-5">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        p.impact === "High" ? "text-red-500" :
                        p.impact === "Medium" ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {p.impact}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono max-w-[80px] truncate">{p.user}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => killProcess(p.pid)}
                          disabled={busyPid === p.pid}
                          data-testid={`btn-kill-${p.pid}`}
                        >
                          {busyPid === p.pid ? "Killing" : "Kill"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Ignore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
