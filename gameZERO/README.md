# gameZERO — PC Gaming Performance Optimizer

A production-grade Electron desktop application for optimizing PC gaming performance. Features live system telemetry, real-time hardware monitoring, game profile scanning, and comprehensive system optimization tools.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)
![Electron](https://img.shields.io/badge/Electron-36-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Building](#building)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Real-Time System Monitoring
- **CPU Metrics**: Load percentage, temperature, model, cores, threads, current/max speed
- **GPU Metrics**: Load percentage, temperature, name, vendor, VRAM usage (supports integrated + discrete GPUs)
- **RAM Metrics**: Used/total/available memory with percentage display
- **Thermal History**: 30-point rolling history for CPU and GPU temperatures
- **Process Management**: Real-time process list with CPU/RAM usage, categorization, and kill capability
- **Disk Monitoring**: Drive volumes, filesystem types, SMART health status, usage percentages

### Game Optimization
- **Game Profile Scanning**: Automatically detects installed games from Steam, Epic Games, GOG Galaxy, and common directories
- **Per-Game Profiles**: FPS target, resolution scaling (DLSS/FSR), power management, background app aggression
- **Launch Arguments**: Custom launch parameters per game
- **Profile Notes**: Remember specific settings for each game

### System Optimization
- **10 Performance Tweaks**: Apply/revert individual optimizations with risk levels
- **Quick Optimize**: One-click safe optimization
- **Storage Cleanup**: Clear shader cache, temp files, launcher caches
- **Driver Detection**: Identify GPU, audio, network, BIOS, chipset, and USB drivers
- **Graphics Settings**: Refresh rate, VRR, hardware GPU scheduling, V-Sync, low latency mode

### User Interface
- **Dark/Light Theme**: Full theme support with system preference detection
- **Compact Mode**: Dense information display option
- **Command Palette**: Quick navigation (Ctrl+K)
- **Responsive Design**: Works on various screen sizes
- **10 Navigation Sections**: Overview, Optimize, Profiles, Processes, Drivers, Display, Thermals, Storage, Benchmarks, Settings

---

## Architecture

### Tech Stack

#### Frontend (`artifacts/gaming-optimizer`)
| Component | Technology |
|-----------|-----------|
| Framework | React 19 + TypeScript 5 |
| Build Tool | Vite 7 |
| Routing | Wouter |
| State Management | React Context + hooks |
| UI Components | shadcn/ui (Radix UI + Tailwind CSS) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Desktop | Electron 36 + electron-builder |

#### Backend (`artifacts/api-server`)
| Component | Technology |
|-----------|-----------|
| Framework | Express 5 |
| System Data | `systeminformation` |
| Logging | pino |
| Build | esbuild |

#### Infrastructure
- **pnpm workspaces** monorepo for unified dependency management
- **Electron main process** with IPC for system-level operations
- **In-memory caching** with configurable TTLs to prevent API hammering
- **Context isolation** for security

### Project Structure

```
Attached-Assets/
├── artifacts/
│   ├── gaming-optimizer/          # Frontend Electron app
│   │   ├── electron/
│   │   │   ├── main.cjs           # Electron main process
│   │   │   ├── preload.cjs        # Context isolation bridge
│   │   │   └── main.bundle.cjs    # Bundled main process
│   │   ├── src/
│   │   │   ├── pages/             # Route components
│   │   │   │   ├── overview.tsx   # System overview dashboard
│   │   │   │   ├── optimize.tsx   # Optimization tweaks
│   │   │   │   ├── profiles.tsx   # Game profiles
│   │   │   │   ├── processes.tsx  # Process manager
│   │   │   │   ├── drivers.tsx    # Driver management
│   │   │   │   ├── display.tsx    # Display/GPU settings
│   │   │   │   ├── thermals.tsx   # Thermal monitoring
│   │   │   │   ├── storage.tsx    # Storage management
│   │   │   │   ├── benchmarks.tsx # Performance benchmarks
│   │   │   │   └── settings.tsx    # App settings
│   │   │   ├── components/        # Reusable UI components
│   │   │   ├── lib/               # Utilities and API hooks
│   │   │   │   ├── system-api.ts  # React hooks for system data
│   │   │   │   └── store.ts        # Global state management
│   │   │   └── App.tsx            # Root component
│   │   ├── package.json
│   │   ├── vite.config.ts         # Vite configuration
│   │   └── vite.electron.config.ts # Electron build config
│   │
│   └── api-server/                # Backend API server
│       └── src/
│
├── lib/                           # Shared libraries
│   ├── api-spec/                  # API specifications
│   ├── api-zod/                   # Zod validation schemas
│   └── db/                        # Database utilities
│
├── scripts/                       # Build and utility scripts
├── package.json                   # Root package.json
├── pnpm-workspace.yaml           #pnpm workspace config
└── README.md                      # This file
```

---

## Installation

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 8.x or higher
- **Windows 10/11**, **Linux** (Ubuntu 20.04+), or **macOS** (11+)

### Setup

```bash
# Clone the repository
git clone https://github.com/gamezero/gameZERO.git
cd gameZERO

# Install all dependencies
pnpm install

# Build the Electron main process
cd artifacts/gaming-optimizer
pnpm run bundle:main
```

---

## Building

### Development Build

```bash
# From the gaming-optimizer directory
pnpm run electron:dev
```

This builds the frontend and main process, then launches Electron.

### Production Build

```bash
# Build for current platform
pnpm run build:electron

# Package for distribution
pnpm run package:win     # Windows (NSIS installer + ZIP)
pnpm run package:linux   # Linux (AppImage + .deb)
pnpm run package:mac     # macOS (DMG for x64 + arm64)
```

### Output Locations

- **Web build**: `artifacts/gaming-optimizer/dist-web/`
- **Electron build**: `artifacts/gaming-optimizer/dist-electron/`
- **Packaged apps**: Platform-specific installers in `dist-electron/`

---

## Usage

### Running as Desktop Application

#### Windows
```bash
# After building
cd artifacts/gaming-optimizer/dist-electron/win-unpacked
gameZERO.exe
```

#### Linux
```bash
# AppImage
chmod +x gameZERO-2.4.1.AppImage
./gameZERO-2.4.1.AppImage

# Or install .deb package
sudo dpkg -i gameZERO-2.4.1.deb
```

#### macOS
```bash
# Mount DMG and drag to Applications
open gameZERO-2.4.1.dmg
```

### Navigation

- **Sidebar**: Click icons to navigate between sections
- **Command Palette**: Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS) for quick navigation
- **Theme Toggle**: Click moon/sun icon in titlebar or use Settings

### Key Workflows

#### Running Quick Optimize
1. Go to **Overview** page
2. Click **Run Quick Optimize** button
3. Review recommended actions in the right panel

#### Scanning for Games
1. Navigate to **Game Profiles** page
2. Click **Scan for Games** button
3. Select a detected game from the list
4. Configure per-game settings (FPS target, resolution, etc.)
5. Click **Apply Profile**

#### Managing Processes
1. Go to **Processes** page
2. Filter by category using tabs (All, Browsers, Launchers, etc.)
3. Hover over a process to reveal **Kill** or **Ignore** buttons
4. Click **Kill** to terminate (removes from list)

#### Cleaning Storage
1. Navigate to **Storage** page
2. Review cleanup candidates with estimated sizes
3. Click **Clean** on individual items or **Clean All Safe** for bulk cleanup

---

## API Reference

### System Metrics

```
GET /api/system/metrics
```

Returns current system performance metrics.

**Response:**
```json
{
  "cpu": {
    "load": 45.2,
    "temp": 62,
    "model": "Intel Core i7-12700K",
    "cores": 12,
    "threads": 20,
    "speed": 3.6,
    "speedMax": 5.0
  },
  "gpu": {
    "load": 78,
    "temp": 65,
    "name": "NVIDIA GeForce RTX 3080",
    "vendor": "NVIDIA",
    "vram": {
      "used": 4096,
      "total": 10240
    }
  },
  "allGpus": [
    {
      "load": 78,
      "temp": 65,
      "name": "NVIDIA GeForce RTX 3080",
      "vendor": "NVIDIA",
      "model": "RTX 3080",
      "bus": "PCIe 4.0 x16",
      "vram": {
        "used": 4096,
        "total": 10240
      }
    }
  ],
  "ram": {
    "used": 8589934592,
    "total": 17179869184,
    "available": 8589934592
  }
}
```

**Cache TTL:** 2 seconds

### System Information

```
GET /api/system/info
```

Returns static system hardware information.

**Response:**
```json
{
  "system": {
    "manufacturer": "Dell Inc.",
    "model": "XPS 8950",
    "version": "1.0",
    "serial": "ABC123",
    "virtual": false
  },
  "cpu": {
    "manufacturer": "Intel",
    "brand": "Core i7-12700K",
    "cores": 12,
    "threads": 20,
    "speed": 3.6,
    "speedMax": 5.0,
    "cache": {
      "l1d": 480,
      "l1i": 480,
      "l2": 12288,
      "l3": 25344
    }
  },
  "gpus": [
    {
      "name": "NVIDIA GeForce RTX 3080",
      "vendor": "NVIDIA",
      "model": "RTX 3080",
      "bus": "PCIe 4.0 x16",
      "vram": 10737418240,
      "clock": 1710
    }
  ],
  "displays": [
    {
      "vendor": "Dell",
      "model": "U2723QE",
      "resolutionX": 3840,
      "resolutionY": 2160,
      "refreshRate": 60,
      "connection": "DisplayPort"
    }
  ]
}
```

### Processes

```
GET /api/system/processes
```

Returns running processes sorted by CPU usage.

**Response:**
```json
{
  "list": [
    {
      "pid": 1234,
      "name": "chrome.exe",
      "cpu": 15.5,
      "mem": 1024,
      "category": "Browser",
      "impact": "Medium",
      "user": "DESKTOP-USER",
      "state": "running"
    }
  ],
  "total": 156,
  "running": 148
}
```

**Cache TTL:** 3 seconds

### Disk Information

```
GET /api/system/disk
```

Returns filesystem and disk layout information.

**Response:**
```json
{
  "drives": [
    {
      "fs": "NTFS",
      "type": "ntfs",
      "size": 500107862016,
      "used": 300107862016,
      "available": 200000000000,
      "use": 60,
      "mount": "C:"
    }
  ],
  "layout": [
    {
      "name": "Samsung SSD 980 PRO 1TB",
      "type": "ssd",
      "vendor": "Samsung",
      "size": 1000204886016,
      "health": "Good"
    }
  ]
}
```

**Cache TTL:** 12 seconds

### Thermal History

```
GET /api/system/thermals
```

Returns rolling thermal history (30 most recent readings).

**Response:**
```json
{
  "history": [
    {
      "time": "14:32:15",
      "cpuTemp": 62,
      "gpuTemp": 58
    }
  ]
}
```

### Game Scanning

```
POST /api/system/scanGames
```

Scans system for installed games.

**Response:**
```json
{
  "games": [
    {
      "id": "g1234567890_0",
      "name": "Cyberpunk 2077",
      "preset": "Balanced",
      "fpsTarget": 60,
      "size": 70.5,
      "path": "C:\\Program Files\\Steam\\steamapps\\common\\Cyberpunk 2077"
    }
  ]
}
```

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | 8080 |
| `NODE_ENV` | Environment mode | `development` |

### Cache Configuration

Cache TTLs are configured in `electron/main.cjs`:

```javascript
const METRICS_TTL = 2000;      // 2 seconds
const PROCESS_TTL = 3000;      // 3 seconds
const DISK_TTL = 12000;        // 12 seconds
const DRIVERS_TTL = 30000;     // 30 seconds
const MAX_HISTORY = 30;        // Thermal history points
```

### Game Scan Directories

The game scanner searches these directories (Windows):

```
C:\Program Files\Steam\steamapps\common
C:\Program Files (x86)\Steam\steamapps\common
C:\Program Files\Epic Games
C:\Program Files\GOG Galaxy\Games
%LOCALAPPDATA%\Programs
%USERPROFILE%\Documents\My Games
{A-Z}:\Program Files\Steam\steamapps\common
{A-Z}:\Program Files (x86)\Steam\steamapps\common
{A-Z}:\Program Files\Epic Games
```

---

## Troubleshooting

### Common Issues

#### CPU/GPU Temperature Shows N/A

**Cause**: Thermal sensors require appropriate drivers or root/admin privileges.

**Solution**:
- **Windows**: Run as Administrator
- **Linux**: Install `lm-sensors` and run `sudo sensors-detect`
- **Docker/Containers**: Temperature monitoring is not available by design

#### GPU Load/VRAM Shows N/A

**Cause**: No discrete GPU detected, or proprietary drivers not installed.

**Solution**:
- Ensure NVIDIA/AMD GPU drivers are installed
- For integrated graphics (Intel UHD, AMD APU), some metrics may be limited

#### Game Scan Returns No Results

**Cause**: Games not installed in standard directories, or insufficient permissions.

**Solution**:
- Verify games are installed in standard directories (Steam, Epic, GOG)
- Run application with appropriate file system permissions
- Check that game directories contain executable files

#### Electron Window Won't Open

**Cause**: Build artifacts missing or corrupted.

**Solution**:
```bash
# Rebuild
pnpm run build:electron

# Clear cache and rebuild
rm -rf dist-electron dist-web electron/main.bundle.cjs
pnpm run build:electron
```

#### IPC Calls Fail with "App must run in Electron"

**Cause**: Trying to use desktop-only features in browser mode.

**Solution**: This is expected behavior. The app requires Electron for system-level operations.

---

## Performance Optimization

### Implemented Optimizations

1. **In-Memory Caching**: All system queries are cached with configurable TTLs
2. **Thermal Polling**: Background polling every 5 seconds, independent of client requests
3. **Lazy Loading**: Components load data on demand
4. **Skeleton States**: Immediate UI feedback while data loads
5. **Request Deduplication**: Multiple components can safely request same data
6. **Efficient Re-renders**: React hooks designed to minimize unnecessary updates

### Recommended Runtime Settings

- **Update interval**: 3-5 seconds for metrics, 15 seconds for disk
- **Process limit**: Top 50 processes by CPU
- **Thermal history**: 30 data points (2.5 minutes at 5s intervals)

---

## Security

### Electron Security Model

- **Context Isolation**: Enabled (`contextIsolation: true`)
- **Node Integration**: Disabled in renderer (`nodeIntegration: false`)
- **Preload Script**: Exposes only safe APIs via `contextBridge`
- **IPC Validation**: All IPC handlers validate payloads before execution
- **No Remote Code Execution**: All code is bundled at build time

### Data Privacy

- **No Telemetry**: No usage data is collected or transmitted
- **Local Only**: All system queries run locally on your machine
- **No Network Calls**: Except for external links (Valkira, GitHub)
- **No Persistent Storage**: Game profiles and settings are session-only

---

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Install** dependencies: `pnpm install`
4. **Create** a feature branch: `git checkout -b feature/my-feature`
5. **Make** changes and test thoroughly
6. **Commit** with descriptive message
7. **Push** to your fork
8. **Open** a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use project's configured formatter (check `tsconfig.json`)
- **Linting**: Run `pnpm run typecheck` before committing
- **Components**: Follow shadcn/ui patterns for new UI components
- **Hooks**: Place custom hooks in `src/lib/`
- **Pages**: Place route components in `src/pages/`

### Reporting Issues

When reporting bugs, include:
- Operating system and version
- Electron version (shown in Settings)
- Console output (if available)
- Steps to reproduce
- Expected vs actual behavior

---

## Roadmap

### Planned Features

- [ ] Actual driver update integration (winget, vendor APIs)
- [ ] Real process kill with elevated privileges
- [ ] Actual storage cleanup with file deletion
- [ ] Game profile import/export
- [ ] Benchmark result persistence
- [ ] Cloud sync for settings (optional)
- [ ] Plugin system for custom optimizations
- [ ] Multi-language support

---

## Acknowledgments

- **systeminformation**: Comprehensive system information library
- **Electron**: Cross-platform desktop app framework
- **shadcn/ui**: Beautiful, accessible UI components
- **Recharts**: Flexible charting library
- **Framer Motion**: Production-ready animations

---

## License

Proprietary — All Rights Reserved

gameZERO is a trademark of gameZERO Technologies.

---

## Support

- **Website**: https://gamezero.app
- **Documentation**: https://gamezero.app/docs
- **Community**: https://valkira.com/community
- **Issues**: https://github.com/gab1-05

---

**Built with ❤️ by the gameZERO team**