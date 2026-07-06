import { ReactNode, useState, useEffect, useMemo, memo } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Zap,
  Gamepad2,
  Activity,
  Cpu,
  Monitor,
  Thermometer,
  HardDrive,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  Terminal,
  TrendingUp,
  X,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSystemMetrics, useNetworkSpeed } from "@/lib/system-api";
import { Wifi, Download, Upload } from "lucide-react";

const NAV_SECTIONS = [
  {
    label: "Gaming",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/" },
      { id: "optimize", label: "Optimize", icon: Zap, path: "/optimize" },
      { id: "game-profiles", label: "Game Profiles", icon: Gamepad2, path: "/profiles" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "processes", label: "Processes", icon: Activity, path: "/processes" },
      { id: "drivers", label: "Drivers", icon: Cpu, path: "/drivers" },
      { id: "display", label: "Display & GPU", icon: Monitor, path: "/display" },
      { id: "system-specs", label: "System Specs", icon: Cpu, path: "/system-specs" },
      { id: "thermals", label: "Thermals", icon: Thermometer, path: "/thermals" },
      { id: "storage", label: "Storage", icon: HardDrive, path: "/storage" },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "benchmarks", label: "Benchmarks", icon: BarChart2, path: "/benchmarks" },
      { id: "analytics", label: "Analytics", icon: TrendingUp, path: "/analytics" },
      { id: "gaming-monitor", label: "Gaming Monitor", icon: Gamepad2, path: "/gaming" },
    ],
  },
];

const ANALYTICS_ITEM = { id: "analytics", label: "Analytics", icon: TrendingUp, path: "/analytics" };

const SETTINGS_ITEM = { id: "settings", label: "Settings", icon: Settings, path: "/settings" };

const WindowTitlebar = memo(function WindowTitlebar({ onToggleTheme, theme }: { onToggleTheme: () => void; theme: string }) {
  const isElectron = typeof window !== "undefined" && !!window.electronAPI?.isElectron;

  return (
    <div
      className="h-10 flex items-center justify-between px-4 border-b border-titlebar-border bg-titlebar shrink-0 select-none relative z-30"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <button
          onClick={() => isElectron ? window.electronAPI!.minimize() : undefined}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => isElectron ? window.electronAPI!.close() : undefined}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors text-muted-foreground hover:text-red-500"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
        <Terminal className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold tracking-widest text-foreground/80 uppercase">
          game<span className="text-primary">ZERO</span>
        </span>
      </div>

      <div
        className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-medium">SYSTEM ACTIVE</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
});

const MiniBar = memo(function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
      />
    </div>
  );
});

const SidebarFooter = memo(function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { data: metrics } = useSystemMetrics(5000);
  const { data: network } = useNetworkSpeed(2000);
  
  const cpuLoad = metrics?.cpu.load ?? null;
  const ramPct = metrics ? Math.round((metrics.ram.used / metrics.ram.total) * 100) : null;
  
  const fmtSpeed = (bytesPerSec: number) => {
    if (bytesPerSec === 0) return '0 KB/s';
    const mbps = bytesPerSec / 1048576;
    if (mbps >= 1) return `${mbps.toFixed(1)} MB/s`;
    const kbps = bytesPerSec / 1024;
    return `${kbps.toFixed(0)} KB/s`;
  };

  return (
    <div className="border-t border-sidebar-border p-3 space-y-2 shrink-0">
      {!collapsed && metrics && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
            <span>CPU</span>
            <span className="tabular-nums">{cpuLoad?.toFixed(1)}%</span>
          </div>
          <MiniBar value={cpuLoad ?? 0} color={cpuLoad && cpuLoad > 80 ? "#ef4444" : "hsl(var(--primary))"} />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
            <span>RAM</span>
            <span className="tabular-nums">{ramPct}%</span>
          </div>
          <MiniBar value={ramPct ?? 0} color={ramPct && ramPct > 85 ? "#ef4444" : "#6366f1"} />
          
          {network && (
            <div className="pt-1.5 border-t border-sidebar-border/50 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span className="flex items-center gap-1">
                  <Wifi className="w-2.5 h-2.5" />
                  Network
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span className="flex items-center gap-1">
                  <Download className="w-2.5 h-2.5" />
                  ↓
                </span>
                <span className="tabular-nums">{fmtSpeed(network.downloadSpeed)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span className="flex items-center gap-1">
                  <Upload className="w-2.5 h-2.5" />
                  ↑
                </span>
                <span className="tabular-nums">{fmtSpeed(network.uploadSpeed)}</span>
              </div>
              {network.sessionRx > 0 && (
                <div className="text-[9px] text-muted-foreground/40 font-mono text-center pt-1">
                  Session: ↓ {(network.sessionRx / 1073741824).toFixed(2)} GB ↑ {(network.sessionTx / 1073741824).toFixed(2)} GB
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {collapsed && (
        <div className="w-full flex justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
        </div>
      )}
    </div>
  );
});

const NavItem = memo(function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; path: string };
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  const inner = (
    <Link href={item.path}>
      <div
        onClick={onClick}
        data-testid={`nav-${item.id}`}
        className={`
          relative flex items-center h-9 rounded-md cursor-pointer transition-all duration-150 group
          ${collapsed ? "px-0 justify-center w-9 mx-auto" : "px-3 gap-3"}
          ${isActive
            ? "bg-primary/15 text-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          }
        `}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        <Icon
          className={`shrink-0 transition-colors ${collapsed ? "w-4 h-4" : "w-4 h-4"} ${
            isActive ? "text-primary" : "text-current"
          }`}
        />

        <AnimatePresence mode="popLayout">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div>{inner}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return inner;
});

export const AppLayout = memo(function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="text-muted-foreground text-sm font-medium tabular-nums tracking-widest uppercase">
            game<span className="text-primary">ZERO</span> initializing...
          </div>
        </div>
      </div>
    );
  }

  const runCommand = (command: () => void) => {
    setCmdOpen(false);
    command();
  };

  const allItems = NAV_SECTIONS.flatMap((s) => s.items).concat([SETTINGS_ITEM, ANALYTICS_ITEM]);

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-[100dvh] w-full bg-background text-foreground overflow-hidden font-sans">
        <WindowTitlebar
          theme={theme}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />

        <div className="flex flex-1 min-h-0">
          <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Navigate">
                {allItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem key={item.id} onSelect={() => runCommand(() => setLocation(item.path))}>
                      <Icon className="mr-2 h-4 w-4" /> {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => runCommand(() => setLocation("/optimize"))}>
                  <Zap className="mr-2 h-4 w-4" /> Run Quick Optimize
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setLocation("/benchmarks"))}>
                  <BarChart2 className="mr-2 h-4 w-4" /> Start Benchmark
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
                  {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />} Toggle Theme
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>

          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: collapsed ? 56 : 220 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="flex-shrink-0 border-r border-sidebar-border bg-sidebar z-20 flex flex-col relative h-full"
          >
            {/* Logo header */}
            <div className={`h-12 flex items-center border-b border-sidebar-border shrink-0 ${collapsed ? "justify-center px-0" : "px-4 gap-2.5"}`}>
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Terminal className="w-3.5 h-3.5 text-primary" />
              </div>
              <AnimatePresence mode="popLayout">
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="font-bold text-sm tracking-widest text-sidebar-foreground uppercase leading-none">
                      game<span className="text-primary">ZERO</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/50 font-mono tracking-wider mt-0.5">
                      PERFORMANCE SUITE
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute -right-3 top-[3.75rem] w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-30 shadow-sm"
              data-testid="sidebar-collapse-toggle"
            >
              {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            {/* Nav sections */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 min-h-0">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <AnimatePresence mode="popLayout">
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-3 mb-1.5 select-none"
                      >
                        {section.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {collapsed && <div className="h-px bg-sidebar-border mx-1 mb-2" />}
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        isActive={location === item.path}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Settings pinned at bottom */}
            <div className="px-2 pb-2 shrink-0 border-t border-sidebar-border pt-2">
              <NavItem
                item={SETTINGS_ITEM}
                isActive={location === SETTINGS_ITEM.path}
                collapsed={collapsed}
              />
            </div>

            {/* Live mini metrics footer */}
            <SidebarFooter collapsed={collapsed} />
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Toolbar header */}
            <header className="h-11 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs font-medium text-muted-foreground w-44 justify-start px-2 bg-muted/30 border-transparent hover:border-border font-mono"
                  onClick={() => setCmdOpen(true)}
                  data-testid="search-bar"
                >
                  <Search className="w-3 h-3 mr-2 shrink-0" />
                  <span className="text-[11px]">Search... (Ctrl+K)</span>
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary font-mono tracking-wide">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Competitive FPS
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-5 relative min-h-0">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
});
