import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pin, PinOff, Zap, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";

const ALL_OPTIMIZATIONS = [
  { id: "o1", title: "Game Mode", icon: Zap },
  { id: "o2", title: "High Performance Power", icon: Zap },
  { id: "o4", title: "Kill Background Tasks", icon: Trash2 },
  { id: "o5", title: "Clean Temp Files", icon: Trash2 },
  { id: "o8", title: "Hardware GPU Scheduling", icon: Zap },
  { id: "o9", title: "Max Refresh Rate", icon: Zap },
];

export function QuickAccessPanel() {
  const { lastAppliedOptimizations, addAppliedOptimization, sidebarCollapsed } = useAppStore();
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [applyingIds, setApplyingIds] = useState<string[]>([]);

  const pinnedOptimizations = ALL_OPTIMIZATIONS.filter(opt => pinnedIds.includes(opt.id));

  const handlePin = (id: string) => {
    if (pinnedIds.includes(id)) {
      setPinnedIds(prev => prev.filter(pid => pid !== id));
    } else {
      setPinnedIds(prev => [...prev, id]);
    }
  };

  const handleQuickApply = async (id: string) => {
    setApplyingIds(prev => [...prev, id]);
    try {
      if (window.electronAPI) {
        await window.electronAPI.systemCommand('optimize:apply', { id });
        addAppliedOptimization(id);
      }
    } catch (e) {
      console.error('Quick apply failed:', e);
    } finally {
      setApplyingIds(prev => prev.filter(aid => aid !== id));
    }
  };

  const handleApplyAll = async () => {
    for (const opt of pinnedOptimizations) {
      if (!applyingIds.includes(opt.id)) {
        await handleQuickApply(opt.id);
      }
    }
  };

  if (sidebarCollapsed || pinnedOptimizations.length === 0) {
    return null;
  }

  return (
    <div className="border border-primary/20 rounded-lg bg-primary/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Quick Access</h3>
          <Badge variant="outline" className="text-xs">
            {pinnedOptimizations.length} pinned
          </Badge>
        </div>
        {pinnedOptimizations.length > 1 && (
          <Button
            size="sm"
            variant="default"
            onClick={handleApplyAll}
            disabled={applyingIds.length > 0}
            className="gap-2"
          >
            <Zap className="w-3 h-3" />
            Apply All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pinnedOptimizations.map(opt => {
          const Icon = opt.icon;
          const isApplying = applyingIds.includes(opt.id);
          const isApplied = lastAppliedOptimizations.includes(opt.id);

          return (
            <div
              key={opt.id}
              className={`p-3 border rounded-md transition-all ${
                isApplied
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isApplied ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{opt.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handlePin(opt.id)}
                >
                  <PinOff className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
              
              <Button
                size="sm"
                variant={isApplied ? "outline" : "default"}
                className="w-full text-xs"
                onClick={() => handleQuickApply(opt.id)}
                disabled={isApplying}
              >
                {isApplying ? (
                  "Applying..."
                ) : isApplied ? (
                  "Applied ✓"
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {pinnedOptimizations.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          <Pin className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No optimizations pinned yet</p>
          <p className="mt-1">Click the pin icon on optimizations to add them here</p>
        </div>
      )}
    </div>
  );
}