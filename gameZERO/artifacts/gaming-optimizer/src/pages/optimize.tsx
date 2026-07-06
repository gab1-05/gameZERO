import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Check, X, ShieldAlert, Zap, Trash2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOptimization, useSystemCleanup, useSystemMetrics, fmtBytes } from "@/lib/system-api";
import { showSuccess, showError } from "@/lib/notifications";
import { useAppStore } from "@/lib/store";
import { QuickAccessPanel } from "@/components/QuickAccessPanel";

type ImpactKey = "fps" | "ram" | "space" | "smoothness";

const OPTIMIZATIONS: Array<{
  id: string;
  title: string;
  risk: "Low" | "Medium" | "High";
  description: string;
  impactKey: ImpactKey;
  estimatedGain?: number;
}> = [
  { id: "o1", title: "Enable Game Mode", risk: "Low", description: "Prioritizes games and suspends background updates via Windows Game Mode.", impactKey: "fps", estimatedGain: 2 },
  { id: "o2", title: "High Performance Power Plan", risk: "Low", description: "Switches to the High Performance power plan to prevent CPU downclocking.", impactKey: "fps", estimatedGain: 5 },
  { id: "o4", title: "Kill Resource-Heavy Background Tasks", risk: "Medium", description: "Terminates known resource-hogging background applications (Discord, Chrome, etc.).", impactKey: "ram" },
  { id: "o5", title: "Clear Temp Files & Cache", risk: "Low", description: "Removes temporary system files older than 24 hours and prefetch cache older than 7 days.", impactKey: "space" },
  { id: "o8", title: "Hardware GPU Scheduling", risk: "Low", description: "Offloads memory management from CPU to GPU for lower latency.", impactKey: "fps", estimatedGain: 4 },
  { id: "o9", title: "Refresh Rate Check", risk: "Low", description: "Ensures display is running at maximum available refresh rate.", impactKey: "smoothness" },
  { id: "o10", title: "In-Game Graphics Priorities", risk: "High", description: "Adjusts global driver settings for maximum performance (may affect visual quality).", impactKey: "fps", estimatedGain: 6 },
];

export default function Optimize() {
  const { apply, applying } = useOptimization();
  const { runCleanup, loading: cleaning, results: cleanupResults, totalFreed } = useSystemCleanup();
  const { data: metrics, loading: metricsLoading } = useSystemMetrics(5000);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const [actionResults, setActionResults] = useState<Array<{id: string; ok: boolean; detail: string; error?: string}>>([]);
  const [cleanupTriggered, setCleanupTriggered] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const getImpactDescription = useCallback((opt: typeof OPTIMIZATIONS[number]) => {
    if (!metrics) {
      switch (opt.impactKey) {
        case "fps": return `+FPS`;
        case "ram": return "RAM";
        case "space": return "Space";
        case "smoothness": return "Smoothness";
        default: return "";
      }
    }
    switch (opt.impactKey) {
      case "fps": {
        const baseFps = metrics!.cpu.load > 0 ? Math.max(30, Math.round(100 - metrics!.cpu.load * 0.4)) : 60;
        const gain = opt.estimatedGain ?? 3;
        return `+${gain} FPS (est. ${baseFps} -> ${baseFps + gain})`;
      }
      case "ram": {
        const totalGb = metrics!.ram.total / 1073741824;
        const usedGb = metrics!.ram.used / 1073741824;
        return `${usedGb.toFixed(1)}/${totalGb.toFixed(0)} GB used`;
      }
      case "space": return "Frees disk space";
      case "smoothness": return "Smoother display";
      default: return "";
    }
  }, [metrics]);

  const { addAppliedOptimization } = useAppStore();
  
  const handleApply = useCallback(async (id: string) => {
    setApplyingId(id);
    try {
      const result = await apply(id);
      if (result?.ok) {
        setAppliedSet(prev => new Set(prev).add(id));
        setActionResults(prev => [...prev, { id, ok: true, detail: result.results?.join(', ') || 'Applied' }]);
        addAppliedOptimization(id);
        showSuccess(`Optimization applied: ${OPTIMIZATIONS.find(o => o.id === id)?.title}`);
        if (id === 'o5') { setCleanupTriggered(true); await runCleanup(); }
      } else {
        setActionResults(prev => [...prev, { id, ok: false, detail: 'Failed', error: result?.error || 'Error' }]);
        showError(`Failed to apply: ${OPTIMIZATIONS.find(o => o.id === id)?.title}`);
      }
    } catch (e) {
      setActionResults(prev => [...prev, { id, ok: false, detail: 'Error', error: String(e) }]);
      showError('Optimization failed');
    } finally {
      setApplyingId(null);
    }
  }, [apply, runCleanup, addAppliedOptimization]);

  const handleRunAllSafe = useCallback(async () => {
    const safe = OPTIMIZATIONS.filter(o => o.risk === "Low");
    await Promise.all(safe.filter(opt => !appliedSet.has(opt.id)).map(opt => handleApply(opt.id)));
  }, [appliedSet, handleApply]);

  const handleCleanup = useCallback(async () => {
    setCleanupTriggered(true);
    await runCleanup();
  }, [runCleanup]);

  const summary = useMemo(() => {
    const succeeded = actionResults.filter(r => r.ok);
    const failed = actionResults.filter(r => !r.ok);
    return { succeeded, failed, totalSucceeded: succeeded.length, totalFailed: failed.length };
  }, [actionResults]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Optimization</h1>
          <p className="text-muted-foreground text-sm mt-1">Apply real system optimizations.</p>
        </div>
        <Button onClick={handleRunAllSafe} disabled={applyingId !== null || cleaning} className="gap-2">
          <Zap className="w-4 h-4" /> Run All Safe
        </Button>
      </div>

      {summary.totalSucceeded + summary.totalFailed > 0 && (
        <div className={`p-4 rounded-lg border ${summary.totalFailed > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
          <h3 className={`text-sm font-semibold mb-2 ${summary.totalFailed > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {summary.totalFailed > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {summary.totalFailed > 0 ? `${summary.totalSucceeded} Succeeded, ${summary.totalFailed} Failed` : 'All Optimizations Applied'}
          </h3>
          <ul className="space-y-1">
            {actionResults.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                {r.ok ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                <span className="font-medium">{OPTIMIZATIONS.find(o => o.id === r.id)?.title || r.id}:</span>
                {r.ok ? r.detail : (r.error || 'Failed')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cleanupTriggered && cleanupResults.length > 0 && (
        <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-500">Cleanup Results <Trash2 className="w-4 h-4 ml-2 inline" /></h3>
          <ul className="space-y-1 mt-2">
            {cleanupResults.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground font-mono flex justify-between">
                <span>{r.type}</span>
                <span>{r.items} items - {fmtBytes(r.freed)}</span>
              </li>
            ))}
            {totalFreed > 0 && <li className="text-xs text-emerald-500 pt-1 border-t border-border/50 mt-1">Total freed: {fmtBytes(totalFreed)}</li>}
          </ul>
        </div>
      )}

      <QuickAccessPanel />

      <div className="space-y-3">
        {OPTIMIZATIONS.map(opt => {
          const isApplied = appliedSet.has(opt.id);
          const isApplying = applyingId === opt.id;
          const impact = getImpactDescription(opt);
          return (
            <div key={opt.id} className={`border rounded-lg bg-card transition-colors ${isApplied ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(opt.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${isApplied ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {isApplied ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">{opt.title}
                      {opt.risk === "Low" && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Low Risk</Badge>}
                      {opt.risk === "Medium" && <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Medium Risk</Badge>}
                      {opt.risk === "High" && <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10">High Risk</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {metricsLoading ? <Skeleton className="h-3 w-24 inline-block" /> : impact}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {isApplied ? <span className="text-primary">Applied</span> : <span className="text-muted-foreground">Not Applied</span>}
                  </div>
                  {!isApplied && (
                    <Button size="sm" variant="default" onClick={() => handleApply(opt.id)} disabled={isApplying || cleaning}>
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {expanded[opt.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border/50 mt-2">
                      <p className="pt-3">{opt.description}</p>
                      <div className="mt-2 text-xs bg-muted/30 p-2 rounded font-mono">Expected impact: {impact}</div>
                      {opt.risk === "High" && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 flex items-start gap-2">
                          <ShieldAlert className="w-4 h-4 mt-0.5" />
                          <span>Warning: alters core system behavior. May destabilize older games.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-sm">System Cleanup</h3>
              <p className="text-xs text-muted-foreground">Remove temp files and cache older than thresholds</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleCleanup} disabled={cleaning} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${cleaning ? 'animate-spin' : ''}`} />
            {cleaning ? "Cleaning..." : "Clean System"}
          </Button>
        </div>
        {cleanupTriggered && cleanupResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="text-xs font-semibold text-muted-foreground">Last Cleanup</div>
            <div className="flex items-center gap-4 text-sm mt-2">
              <span className="text-emerald-500">{cleanupResults.length} categories</span>
              <span className="text-primary font-bold">{fmtBytes(totalFreed)} freed</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
