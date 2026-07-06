import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Trash2, RefreshCw, AlertTriangle, CheckCircle, Wrench } from "lucide-react";
import { useSystemDisk, useStorageScan, useSystemCleanup, fmtBytes } from "@/lib/system-api";

function DriveCard({ drive, layout }: {
  drive: { fs: string; size: number; used: number; available: number; use: number; mount: string; type: string };
  layout?: { name: string; type: string; vendor: string; size: number; health: string };
}) {
  const isSSD = layout?.type?.toLowerCase().includes("ssd") || drive.type?.toLowerCase().includes("nvme") || drive.fs?.toLowerCase().includes("nvme");
  const warn = drive.use > 90;
  const caution = drive.use > 75;
  return (
    <div className={`border rounded-lg bg-card p-5 ${warn ? "border-red-500/40 bg-red-500/5" : caution ? "border-amber-500/40 bg-amber-500/5" : "border-border"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <HardDrive className={`w-4 h-4 ${isSSD ? "text-primary" : "text-muted-foreground"}`} />
          <h3 className="font-bold text-sm">{drive.mount}</h3>
          {layout?.name && <span className="text-xs text-muted-foreground font-mono">{layout.name}</span>}
        </div>
        <div className="text-xs font-mono text-muted-foreground tabular-nums">
          {fmtBytes(drive.used)} / {fmtBytes(drive.size)}
        </div>
      </div>
      <div className="text-xs text-muted-foreground mb-3">
        {layout?.vendor && `${layout.vendor} · `}{isSSD ? "SSD" : "HDD"} · {layout?.health || "Status unknown"}
      </div>
      <Progress value={drive.use} className={`h-2 mb-1.5 ${warn ? "[&>div]:bg-red-500" : caution ? "[&>div]:bg-amber-500" : ""}`} />
      <div className="flex justify-between text-xs font-medium">
        <span className={warn ? "text-red-500 font-bold" : caution ? "text-amber-500" : "text-muted-foreground"}>Used: {drive.use}%</span>
        <span className="text-emerald-500 tabular-nums">{fmtBytes(drive.available)} Free</span>
      </div>
    </div>
  );
}

export default function Storage() {
  const { data: diskData, loading: diskLoading, error: diskError } = useSystemDisk(20000);
  const { issues, refresh: refreshScan } = useStorageScan();
  const { runCleanup, results: cleanupResults, totalFreed, loading: cleaning } = useSystemCleanup();
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);

  const drives = diskData?.drives ?? [];
  const layout = diskData?.layout ?? [];

  const handleScan = async () => {
    setScanning(true);
    await refreshScan();
    setScanning(false);
  };

  const handleFixIssue = async (issueMsg: string) => {
    setFixing(issueMsg);
    await runCleanup();
    setFixing(null);
    await refreshScan();
  };

  const handleCleanAll = async () => {
    setFixing('all');
    await runCleanup();
    setFixing(null);
    await refreshScan();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Storage Management</h1>
          <p className="text-muted-foreground text-xs mt-1">
            {diskLoading ? "Scanning drives..." : diskError ? "Could not read disk info" : `${drives.length} volume${drives.length !== 1 ? "s" : ""} detected · Live data`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleScan} disabled={scanning || diskLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${scanning || diskLoading ? 'animate-spin' : ''}`} />
            Scan
          </Button>
          <Button size="sm" onClick={handleCleanAll} disabled={cleaning || fixing !== null} className="gap-2 bg-primary">
            <Trash2 className="w-3.5 h-3.5" />
            {cleaning ? "Cleaning..." : "Fix Issues"}
          </Button>
        </div>
      </div>

      {/* Issues Banner */}
      {issues.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-amber-500">Storage Issues Detected</h3>
          </div>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start justify-between bg-background/50 p-3 rounded border border-border">
                <div className="flex items-start gap-2">
                  {issue.level === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />}
                  <div>
                    <div className="text-xs font-medium">{issue.msg}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Fix: {issue.fix}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={() => handleFixIssue(issue.msg)} disabled={fixing === issue.msg}>
                  <Wrench className="w-3 h-3" />
                  {fixing === issue.msg ? "Fixing..." : "Fix"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {issues.length === 0 && !scanning && (
        <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-emerald-500 font-medium">Storage healthy - no issues detected</span>
        </div>
      )}

      {/* Live Drive Cards */}
      {diskLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      ) : diskError ? (
        <div className="border border-border rounded-lg bg-card p-6 text-center text-muted-foreground text-sm">
          <RefreshCw className="w-5 h-5 mx-auto mb-2 opacity-50" />
          Could not read disk information.
        </div>
      ) : drives.length === 0 ? (
        <div className="border border-border rounded-lg bg-card p-6 text-center text-muted-foreground text-sm">
          No mounted drives detected.
        </div>
      ) : (
        <div className={`grid gap-4 ${drives.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          {drives.slice(0, 4).map((drive, i) => {
            const matchingLayout = layout.find(l => drive.fs?.includes(l.name) || l.name?.includes(drive.fs));
            return <DriveCard key={i} drive={drive} layout={matchingLayout} />;
          })}
        </div>
      )}

      {/* Cleanup Results */}
      {cleanupResults.length > 0 && (
        <div className="border border-border rounded-lg bg-card p-4">
          <h3 className="text-sm font-semibold mb-2">Last Cleanup Results</h3>
          <div className="space-y-1">
            {cleanupResults.map((r, i) => (
              <div key={i} className="text-xs text-muted-foreground font-mono flex justify-between">
                <span>{r.type}</span>
                <span>{r.items} files · {fmtBytes(r.freed)}</span>
              </div>
            ))}
            <div className="text-xs font-medium text-emerald-500 pt-2 border-t border-border mt-2">
              Total freed: {fmtBytes(totalFreed)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}