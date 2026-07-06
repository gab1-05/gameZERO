import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Search, RefreshCw, Star } from "lucide-react";
import { useScannedGames, ScannedGame } from "@/lib/system-api";
import { showSuccess, showError, showInfo } from "@/lib/notifications";
import { useAppStore } from "@/lib/store";

export default function GameProfiles() {
  const { games, loading, error, scan } = useScannedGames();
  const [activeGame, setActiveGame] = useState<ScannedGame | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (games.length > 0 && !activeGame) {
      setActiveGame(games[0]);
    }
  }, [games, activeGame]);

  const { favoriteGames, toggleFavoriteGame } = useAppStore();
  
  const handleScan = async () => {
    setScanning(true);
    await scan();
    setScanning(false);
    showSuccess("Game scan completed");
  };
  
  const handleToggleFavorite = (gameId: string) => {
    toggleFavoriteGame(gameId);
    const isFavorite = favoriteGames.includes(gameId);
    showInfo(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Game Profiles</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time scanning of installed games with per-game optimization.</p>
        </div>
        <Button onClick={handleScan} disabled={loading || scanning} className="gap-2">
          {scanning || loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Gamepad2 className="w-4 h-4" />
          )}
          {scanning || loading ? "Scanning..." : "Scan for Games"}
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg text-sm text-red-400">
          Scan error: {error}
        </div>
      )}

      {loading && games.length === 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Games Found</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            Click "Scan for Games" to detect installed games from your Steam, Epic Games, and other game directories.
          </p>
          <Button onClick={handleScan} disabled={scanning} size="lg" className="gap-2">
            {scanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Scan for Games
          </Button>
          <p className="text-xs text-muted-foreground/50 mt-4">
            Scans: Steam, Epic Games, GOG Galaxy, and common game directories
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { name: "Total Games", value: games.length, desc: "Detected installations" },
              { name: "Scan Coverage", value: "Steam + Epic + GOG", desc: "Auto-detected" },
              { name: "Total Size", value: `${games.reduce((a, g) => a + g.size, 0).toFixed(0)} GB`, desc: "Combined" },
              { name: "Average Size", value: `${(games.reduce((a, g) => a + g.size, 0) / Math.max(games.length, 1)).toFixed(1)} GB`, desc: "Per game" },
            ].map((stat) => (
              <div key={stat.name} className="p-4 border border-border rounded-lg bg-card">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.name}</div>
                <div className="text-2xl font-bold mt-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>INSTALLED GAMES ({games.length})</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleScan} disabled={loading}>
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      activeGame?.id === game.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card hover:bg-accent/50'
                    }`}
                    onClick={() => setActiveGame(game)}
                  >
                    <div className="font-semibold text-sm truncate">{game.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {game.preset}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(game.id); }}
                      >
                        <Star className={`w-3 h-3 ${favoriteGames.includes(game.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      <span className="text-xs text-muted-foreground tabular-nums">{game.size} GB</span>
                    </div>
                  </div>
                    {game.path && (
                      <div className="text-[10px] text-muted-foreground/40 mt-1 truncate font-mono">{game.path}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeGame && (
              <div className="lg:col-span-2">
                <div className="border border-border rounded-lg bg-card overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg">{activeGame.name}</h2>
                      <div className="text-xs text-muted-foreground">{activeGame.path || `${activeGame.preset} target`}</div>
                    </div>
                    <Button size="sm">Apply Profile</Button>
                  </div>

                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">FPS Target</Label>
                        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{activeGame.fpsTarget} FPS</span>
                      </div>
                      <Slider defaultValue={[activeGame.fpsTarget]} max={360} step={1} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Performance Preset</Label>
                        <Select defaultValue={activeGame.preset.toLowerCase().replace(/\s+/g, '-')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preset" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="competitive-fps">Competitive FPS</SelectItem>
                            <SelectItem value="visual-quality">Visual Quality</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="power-saver">Power Saver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Power Management</Label>
                        <Select defaultValue="max">
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="max">Prefer Maximum Performance</SelectItem>
                            <SelectItem value="optimal">Optimal Power</SelectItem>
                            <SelectItem value="adaptive">Adaptive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-semibold">Background App Aggression</Label>
                      <div className="text-xs text-muted-foreground mb-2">Controls how aggressively background apps are suspended when this game launches.</div>
                      <Select defaultValue="high">
                        <SelectTrigger>
                          <SelectValue placeholder="Select aggression" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Keep apps running)</SelectItem>
                          <SelectItem value="medium">Medium (Suspend heavy apps)</SelectItem>
                          <SelectItem value="high">High (Suspend all non-essential)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Disable Overlays</Label>
                          <p className="text-xs text-muted-foreground">Force disable Discord/Steam overlays for this game</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold">Clear RAM on Launch</Label>
                          <p className="text-xs text-muted-foreground">Flush standby list before game starts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <Label className="text-sm font-semibold">Launch Arguments</Label>
                      <Input placeholder="-novid -high -threads 16" className="font-mono text-sm" />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Profile Notes</Label>
                      <Textarea placeholder="Specific settings to remember for this game..." className="resize-none h-20" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
