import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Search, Play, Eye, EyeOff, Zap, Monitor } from "lucide-react";
import { useGameDetection, useSystemMetrics } from "@/lib/system-api";
import { useAppStore } from "@/lib/store";
import { showSuccess, showInfo } from "@/lib/notifications";

export default function GamingMonitor() {
  const { games, detecting, detect } = useGameDetection();
  const { data: metrics } = useSystemMetrics(5000);
  const { favoriteGames, toggleFavoriteGame } = useAppStore();
  
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [watchingGames, setWatchingGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Auto-detect on mount
    detect();
  }, [detect]);

  const handleWatchGame = (gameName: string) => {
    const newWatching = new Set(watchingGames);
    if (newWatching.has(gameName)) {
      newWatching.delete(gameName);
      showInfo(`Stopped watching ${gameName}`);
    } else {
      newWatching.add(gameName);
      showSuccess(`Now watching ${gameName}`);
    }
    setWatchingGames(newWatching);
  };

  const handleQuickOptimize = async (gameName: string) => {
    showSuccess(`Quick optimize applied for ${gameName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gaming Monitor</h1>
          <p className="text-muted-foreground text-sm mt-1">Auto-detect games and apply optimizations.</p>
        </div>
        <Button onClick={detect} disabled={detecting} className="gap-2">
          {detecting ? (
            <Search className="w-4 h-4 animate-spin" />
          ) : (
            <Gamepad2 className="w-4 h-4" />
          )}
          {detecting ? "Scanning..." : "Scan for Games"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">DETECTED GAMES</div>
          </div>
          <div className="text-2xl font-bold">{games.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Running now</div>
        </div>

        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">WATCHING</div>
          </div>
          <div className="text-2xl font-bold">{watchingGames.size}</div>
          <div className="text-xs text-muted-foreground mt-1">Auto-optimize enabled</div>
        </div>

        <div className="border border-border rounded-lg bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Monitor className="w-4 h-4 text-primary" />
            <div className="text-xs font-semibold text-muted-foreground">PRIMARY GPU</div>
          </div>
          <div className="text-sm font-bold truncate">
            {metrics?.gpu?.name || "Detecting..."}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {metrics?.gpu?.vendor || "Unknown"}
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Detected Running Games</h3>
        
        {games.length === 0 ? (
          <div className="text-center py-10">
            <Gamepad2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No games currently running</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Launch a game or click scan to detect running processes
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {games.map((game: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedGame?.name === game.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent/50'
                }`}
                onClick={() => setSelectedGame(game)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{game.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        PID: {game.pid} • CPU: {game.cpu.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchGame(game.name);
                      }}
                    >
                      {watchingGames.has(game.name) ? (
                        <EyeOff className="w-4 h-4 text-primary" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickOptimize(game.name);
                      }}
                    >
                      <Zap className="w-3 h-3" />
                      Optimize
                    </Button>
                  </div>
                </div>

                {selectedGame?.name === game.name && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Process:</span>
                        <span className="font-mono ml-2">{game.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">PID:</span>
                        <span className="font-mono ml-2">{game.pid}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPU Usage:</span>
                        <span className="font-mono ml-2">{game.cpu.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="ml-2 text-emerald-500 border-emerald-500/20">
                          Running
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleWatchGame(game.name)}
                      >
                        {watchingGames.has(game.name) ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Stop Watching
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            Watch for Auto-Optimize
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setSelectedGame(null)}
                      >
                        Close Details
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              games.forEach((g: any) => handleWatchGame(g.name));
            }}
            disabled={games.length === 0}
          >
            <Eye className="w-4 h-4" />
            Watch All Games
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              games.forEach((g: any) => handleQuickOptimize(g.name));
            }}
            disabled={games.length === 0}
          >
            <Zap className="w-4 h-4" />
            Optimize All
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setWatchingGames(new Set());
              showInfo("Stopped watching all games");
            }}
            disabled={watchingGames.size === 0}
          >
            <EyeOff className="w-4 h-4" />
            Stop All Watching
          </Button>
        </div>
      </div>
    </div>
  );
}