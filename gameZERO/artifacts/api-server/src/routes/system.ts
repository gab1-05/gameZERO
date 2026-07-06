import { Router } from "express";
import si from "systeminformation";

const router = Router();

type ThermalReading = { time: string; cpuTemp: number; gpuTemp: number | null };
const thermalHistory: ThermalReading[] = [];
const MAX_HISTORY = 30;

function ts() {
  const n = new Date();
  return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}:${n.getSeconds().toString().padStart(2, "0")}`;
}

async function pollThermals() {
  try {
    const [cpuTemp, graphics] = await Promise.all([
      si.cpuTemperature(),
      si.graphics(),
    ]);
    const cpuT =
      typeof cpuTemp.main === "number" && cpuTemp.main > 0
        ? Math.round(cpuTemp.main)
        : null;
    const gpu = graphics.controllers?.[0];
    const gpuT =
      typeof gpu?.temperatureGpu === "number" && gpu.temperatureGpu > 0
        ? Math.round(gpu.temperatureGpu)
        : null;
    // Only record when at least one real sensor value is available
    if ((cpuT !== null && cpuT > 0) || (gpuT !== null && gpuT > 0)) {
      thermalHistory.push({ time: ts(), cpuTemp: cpuT ?? 0, gpuTemp: gpuT });
      if (thermalHistory.length > MAX_HISTORY) thermalHistory.shift();
    }
  } catch {}
}

pollThermals();
setInterval(pollThermals, 5000);

function categorize(name: string): string {
  const n = name.toLowerCase();
  if (["chrome", "firefox", "msedge", "edge", "brave", "opera", "safari"].some(b => n.includes(b))) return "Browser";
  if (["discord", "slack", "teams", "zoom", "skype", "telegram", "signal"].some(b => n.includes(b))) return "Communication";
  if (["steam", "epicgames", "gog", "battle.net", "battlenet", "origin", "uplay", "riot", "launcher", "galaxy"].some(b => n.includes(b))) return "Launcher";
  if (["spotify", "vlc", "itunes", "music", "media", "winamp", "foobar"].some(b => n.includes(b))) return "Media";
  if (["obs", "streamlabs", "xsplit", "shadowplay", "recording"].some(b => n.includes(b))) return "Capture";
  if (["afterburner", "hwinfo", "rivaturner", "rtss", "gpu-z", "cpu-z", "hwmonitor", "aida"].some(b => n.includes(b))) return "Utility";
  if (["nvidia", "nvdisplay", "geforce", "amd", "radeon", "nvcontainer"].some(b => n.includes(b))) return "Driver";
  if (["onedrive", "dropbox", "googledrive", "icloud", "syncthing", "mega"].some(b => n.includes(b))) return "Cloud";
  return "System";
}

function impact(cpu: number, memMb: number): "Low" | "Medium" | "High" {
  if (cpu > 5 || memMb > 600) return "High";
  if (cpu > 1 || memMb > 200) return "Medium";
  return "Low";
}

let metricsCache: { data: unknown; ts: number } | null = null;
let processCache: { data: unknown; ts: number } | null = null;
let diskCache: { data: unknown; ts: number } | null = null;

const METRICS_TTL = 2000;
const PROCESS_TTL = 3000;
const DISK_TTL = 12000;

router.get("/system/metrics", async (req, res) => {
  try {
    const now = Date.now();
    if (metricsCache && now - metricsCache.ts < METRICS_TTL) {
      return res.json(metricsCache.data);
    }
    const [cpuLoad, mem, cpuTemp, graphics, cpuInfo] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature(),
      si.graphics(),
      si.cpu(),
    ]);
    const gpu = graphics.controllers?.[0];
    const data = {
      cpu: {
        load: Math.round(cpuLoad.currentLoad * 10) / 10,
        temp:
          typeof cpuTemp.main === "number" && cpuTemp.main > 0
            ? Math.round(cpuTemp.main)
            : null,
        model: cpuInfo.brand ?? null,
        cores: cpuInfo.physicalCores ?? null,
        threads: cpuInfo.cores ?? null,
        speed: cpuInfo.speed ?? null,
      },
      gpu: {
        load:
          typeof gpu?.utilizationGpu === "number"
            ? Math.round(gpu.utilizationGpu)
            : null,
        temp:
          typeof gpu?.temperatureGpu === "number" && gpu.temperatureGpu > 0
            ? Math.round(gpu.temperatureGpu)
            : null,
        name: gpu?.name ?? null,
        vendor: gpu?.vendor ?? null,
        vram: gpu
          ? {
              used:
                typeof gpu.memoryUsed === "number" ? gpu.memoryUsed : null,
              total:
                typeof gpu.memoryTotal === "number" ? gpu.memoryTotal : null,
            }
          : null,
      },
      ram: {
        used: mem.active,
        total: mem.total,
        available: mem.available,
      },
    };
    metricsCache = { data, ts: now };
    return res.json(data);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to read system metrics" });
  }
});

router.get("/system/processes", async (req, res) => {
  try {
    const now = Date.now();
    if (processCache && now - processCache.ts < PROCESS_TTL) {
      return res.json(processCache.data);
    }
    const [procs, memInfo] = await Promise.all([si.processes(), si.mem()]);
    const totalMb = memInfo.total / 1024 / 1024;
    const list = procs.list
      .filter(
        (p) =>
          p.name &&
          p.name.length > 0 &&
          !p.name.startsWith("[") &&
          !p.name.startsWith("(")
      )
      .map((p) => {
        // Use memRss if available, fall back to percentage of total RAM
        const memMb = p.memRss && p.memRss > 0
          ? Math.round(p.memRss / 1024 / 1024)
          : p.mem > 0
          ? Math.round(p.mem * totalMb / 100)
          : 0;
        return {
          pid: p.pid,
          name: p.name,
          cpu: Math.round(p.cpu * 10) / 10,
          mem: memMb,
          category: categorize(p.name),
          impact: impact(p.cpu, memMb),
          user: p.user ?? "system",
          state: p.state ?? "running",
        };
      })
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 50);
    const data = { list, total: procs.all, running: procs.running };
    processCache = { data, ts: now };
    return res.json(data);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to read processes" });
  }
});

router.get("/system/disk", async (req, res) => {
  try {
    const now = Date.now();
    if (diskCache && now - diskCache.ts < DISK_TTL) {
      return res.json(diskCache.data);
    }
    const [fsData, diskLayout] = await Promise.all([
      si.fsSize(),
      si.diskLayout(),
    ]);
    const data = {
      drives: fsData
        .filter((d) => {
          if (d.size <= 0 || d.use == null) return false;
          // Skip 100%-used bind mounts and tiny virtual fs
          if (d.use === 100 && d.size < 1024 * 1024 * 1024) return false;
          // Skip 0%-used virtual/overlay mounts with no space
          if (d.use === 0 && d.size === 0) return false;
          // Keep only meaningful mount points
          const skip = ["/dev", "/proc", "/sys", "/run", "/snap", "/mnt/pid", "/mnt/scratch", "/mnt/cacache", "/etc", "/usr", "/var/lib/docker"];
          if (skip.some(s => d.mount.startsWith(s))) return false;
          // Skip duplicate small overlays
          if (d.size < 512 * 1024 * 1024 && d.use === 100) return false;
          return true;
        })
        .map((d) => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          available: d.available,
          use: Math.round(d.use ?? 0),
          mount: d.mount,
        })),
      layout: diskLayout.map((d) => ({
        name: d.name,
        type: d.type,
        vendor: d.vendor,
        size: d.size,
        health: d.smartStatus ?? "Unknown",
      })),
    };
    diskCache = { data, ts: now };
    return res.json(data);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to read disk info" });
  }
});

router.get("/system/thermals", async (_req, res) => {
  res.json({ history: thermalHistory });
});

export default router;
