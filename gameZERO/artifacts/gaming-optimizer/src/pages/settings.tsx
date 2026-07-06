import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, HelpCircle, Download, Upload, Trash2, RefreshCw, Bell, Palette, Monitor, Cpu, Keyboard } from "lucide-react";
import { useSystemMetrics, useSystemInfo } from "@/lib/system-api";

export default function Settings() {
  const { data: metrics } = useSystemMetrics(10000);
  const { data: systemInfo } = useSystemInfo();
  const [notifications, setNotifications] = useState(true);
  const [autoMinimize, setAutoMinimize] = useState(true);
  const [thermalAlerts, setThermalAlerts] = useState(true);
  const [gpuPreference, setGpuPreference] = useState("dedicated");
  const [startupBehavior, setStartupBehavior] = useState("tray");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure gameZERO preferences and system behavior.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="hotkeys">Hotkeys</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Appearance</h3>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Theme</Label>
                  <p className="text-xs text-muted-foreground">Choose between light and dark mode</p>
                </div>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Startup Behavior</Label>
                  <p className="text-xs text-muted-foreground">What happens when you open gameZERO</p>
                </div>
                <Select value={startupBehavior} onValueChange={setStartupBehavior}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tray">Minimize to Tray</SelectItem>
                    <SelectItem value="window">Open Window</SelectItem>
                    <SelectItem value="hidden">Start Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">GPU Preferences</h3>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Primary GPU</Label>
                  <p className="text-xs text-muted-foreground">Select which GPU to monitor by default</p>
                </div>
                <Select value={gpuPreference} onValueChange={setGpuPreference}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dedicated">Dedicated GPU</SelectItem>
                    <SelectItem value="integrated">Integrated GPU</SelectItem>
                    <SelectItem value="auto">Auto-Detect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-muted/30 rounded-md">
                <div className="text-xs font-medium text-muted-foreground mb-2">Detected Hardware</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU:</span>
                    <span className="font-mono">{metrics?.cpu.model || systemInfo?.cpu.brand || 'Detecting...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primary GPU:</span>
                    <span className="font-mono">{metrics?.gpu?.name || systemInfo?.primaryGpu?.name || 'Detecting...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total GPUs:</span>
                    <span className="font-mono">{systemInfo?.gpus?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Performance</h3>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Auto-Minimize During Games</Label>
                  <p className="text-xs text-muted-foreground">Automatically minimize when a game launches</p>
                </div>
                <Switch checked={autoMinimize} onCheckedChange={setAutoMinimize} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Thermal Warnings</Label>
                  <p className="text-xs text-muted-foreground">Alert when temperature exceeds 90°C</p>
                </div>
                <Switch checked={thermalAlerts} onCheckedChange={setThermalAlerts} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Notification Settings</h3>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">Show toast notifications for completed actions</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">Data Management</h3>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Export Settings</div>
                  <div className="text-xs text-muted-foreground">Save your configuration to a file</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-3 h-3" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Import Settings</div>
                  <div className="text-xs text-muted-foreground">Restore from a backup file</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-3 h-3" />
                  Import
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-400">Reset All Settings</div>
                  <div className="text-xs text-muted-foreground">Clear all preferences and start fresh</div>
                </div>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="w-3 h-3" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hotkeys" className="space-y-4 mt-4">
          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Quick Optimize</Label>
                  <p className="text-xs text-muted-foreground">Run all safe optimizations instantly</p>
                </div>
                <div className="px-3 py-1.5 bg-muted/30 rounded border border-border/50 text-xs font-mono">
                  Ctrl + Shift + O
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">System Cleanup</Label>
                  <p className="text-xs text-muted-foreground">Clean temp files and cache</p>
                </div>
                <div className="px-3 py-1.5 bg-muted/30 rounded border border-border/50 text-xs font-mono">
                  Ctrl + Shift + C
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Toggle Theme</Label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
                <div className="px-3 py-1.5 bg-muted/30 rounded border border-border/50 text-xs font-mono">
                  Ctrl + Shift + T
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Command Palette</Label>
                  <p className="text-xs text-muted-foreground">Open search and commands</p>
                </div>
                <div className="px-3 py-1.5 bg-muted/30 rounded border border-border/50 text-xs font-mono">
                  Ctrl + K
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg bg-card p-5">
            <h3 className="font-semibold text-sm mb-3">Custom Hotkeys</h3>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Enable Global Hotkeys</div>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">
                Global hotkeys work even when gameZERO is minimized. Requires app restart to apply changes.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4 mt-4">
          <div className="border border-border rounded-lg bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">gameZERO</h3>
                <p className="text-xs text-muted-foreground">Version 2.4.1</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build:</span>
                <span className="font-mono">2025.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Electron:</span>
                <span className="font-mono">36.4.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-mono">{systemInfo?.os.platform || 'Windows'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-mono">{systemInfo?.os.arch || 'x64'}</span>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p>Copyright © 2025 gab1-05</p>
              <p className="mt-1">
                <a href="https://github.com/gab1-05" className="text-primary hover:underline">
                  github.com/gab1-05
                </a>
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}