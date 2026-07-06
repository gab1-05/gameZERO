import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, Download, ExternalLink, ShieldAlert, CheckCircle, Github } from "lucide-react";
import { SiNvidia, SiAsus, SiIntel, SiAmd } from "react-icons/si";
import { useDrivers, useDriverUpdate, DriverInfo } from "@/lib/system-api";

const vendorIcons: Record<string, React.ReactNode> = {
  'NVIDIA': <SiNvidia className="w-8 h-8 text-[#76B900]" />,
  'Nvidia': <SiNvidia className="w-8 h-8 text-[#76B900]" />,
  'ASUS': <SiAsus className="w-8 h-8 text-foreground" />,
  'Realtek': <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  'Intel': <SiIntel className="w-8 h-8 text-[#0068B5]" />,
  'AMD': <SiAmd className="w-8 h-8 text-[#ED1C24]" />,
  'Advanced Micro Devices': <SiAmd className="w-8 h-8 text-[#ED1C24]" />,
};

function getIcon(vendor: string) {
  for (const [key, icon] of Object.entries(vendorIcons)) {
    if (vendor?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>;
}

function getStatusColor(status: string) {
  switch(status) {
    case 'Outdated': return 'text-red-500 bg-red-500/10';
    case 'Update available': return 'text-amber-500 bg-amber-500/10';
    case 'Up to date': return 'text-emerald-500 bg-emerald-500/10';
    case 'Latest': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-muted-foreground bg-muted/20';
  }
}

const VENDOR_URLS: Record<string, string> = {
  'NVIDIA': 'https://www.nvidia.com/Download/index.aspx',
  'Nvidia': 'https://www.nvidia.com/Download/index.aspx',
  'AMD': 'https://www.amd.com/en/support',
  'Advanced Micro Devices': 'https://www.amd.com/en/support',
  'Intel': 'https://www.intel.com/content/www/us/en/support/detect.html',
  'Realtek': 'https://www.realtek.com/en/downloads',
  'Realtek Semiconductor': 'https://www.realtek.com/en/downloads',
};

export default function Drivers() {
  const { drivers, loading, error, refresh } = useDrivers();
  const updateState = useDriverUpdate();

  const handleCheckUpdate = useCallback(async (driver: DriverInfo) => {
    await updateState.checkUpdate(driver.id);
  }, [updateState]);

  const getDriverUrl = useCallback((vendor: string) => {
    for (const [key, url] of Object.entries(VENDOR_URLS)) {
      if (vendor?.toLowerCase().includes(key.toLowerCase())) return url;
    }
    return '#';
  }, []);

  const driverCards = useMemo(() => {
    return drivers.map(driver => ({
      ...driver,
      icon: getIcon(driver.vendor),
      driverUrl: getDriverUrl(driver.vendor),
    }));
  }, [drivers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Driver Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time hardware driver detection — keep your components updated.</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rescan
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-amber-500/30 bg-amber-500/5 rounded-lg text-sm text-amber-400">
          Driver scan issues: {error}
        </div>
      )}

      {updateState.result && (
        <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-blue-500">Update Check Complete</h3>
          </div>
          <div className="space-y-1">
            {updateState.result.results?.map((r: string, i: number) => (
              <div key={i} className="text-xs text-muted-foreground font-mono">[{new Date().toLocaleTimeString()}] {r}</div>
            ))}
            {updateState.result.instructions && (
              <div className="text-xs text-blue-400 mt-2">{updateState.result.instructions}</div>
            )}
          </div>
        </div>
      )}

      {loading && drivers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-52 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map(driver => (
            <div key={driver.id} className={`p-5 rounded-lg bg-card border ${driver.critical ? 'border-red-500/50' : 'border-border'} flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-muted rounded-xl">
                  {getIcon(driver.vendor)}
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getStatusColor(driver.status)}`}>
                    {driver.status}
                  </div>
                  {driver.critical && <Badge variant="destructive" className="text-[10px] mt-1">Critical</Badge>}
                  <div className="text-[10px] text-muted-foreground mt-1">{driver.type}</div>
                </div>
              </div>
              <div className="mb-6 flex-1">
                <h3 className="font-bold text-lg leading-tight">{driver.name}</h3>
                <div className="text-xs text-muted-foreground font-mono mt-1">Driver: v{driver.version}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Updated: {driver.driverDate}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant={driver.status === 'Latest' || driver.status === 'Up to date' ? 'outline' : 'default'}
                  disabled={updateState.updating}
                  onClick={() => handleCheckUpdate(driver)}
                >
                  <Download className="w-3 h-3 mr-1.5" />
                  {updateState.updating ? 'Checking...' : (driver.status === 'Latest' || driver.status === 'Up to date' ? 'Up to Date' : 'Check for Update')}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href={getDriverUrl(driver.vendor)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 border border-border bg-card rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold">Driver Management Info</h3>
            <p className="text-xs text-muted-foreground mt-1">
              For best gaming performance, keep GPU, audio, and chipset drivers updated. 
              Click "Check for Update" to scan for updates, or visit your manufacturer's website directly.
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Visit your manufacturer's website for the latest drivers and support.
          </p>
        </div>
      </div>
    </div>
  );
}