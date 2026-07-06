# Build Instructions

This guide explains how to build and package **gameZERO** from the repository root.

## Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 8.x or higher
- **Windows 10/11**, **Linux** (Ubuntu 20.04+), or **macOS** (11+)

Verify they are installed:

```bash
node --version
pnpm --version
```

## Quick Build

### Windows

```bash
pnpm run dist
```

### Linux

```bash
pnpm run build:linux
```

### macOS

```bash
pnpm run build:mac
```

These commands will:
1. Build the Electron renderer with Vite.
2. Bundle the Electron main process with esbuild.
3. Package platform-specific installers.

## Project Scripts

| Script | Description |
|--------|-------------|
| `pnpm run build` | Build the Electron app only (no packaging). |
| `pnpm run dist` | Build **and** package for Windows (NSIS installer + portable exe + zip). |
| `pnpm run typecheck` | Type-check the renderer and backend. |

## Platform-Specific Output

Build artifacts are emitted to:

```
Attached-Assets/artifacts/gaming-optimizer/dist-electron/
```

### Windows
- `gameZERO Setup x.x.x.exe` — NSIS installer (one-click or custom dir).
- `gameZERO x.x.x-win.zip` — Zip archive.

### Linux
- `gameZERO x.x.x.AppImage` — Portable AppImage.
- `gameZERO x.x.x-linux.tar.gz` — Tar archive.
- `gameZERO x.x.x.deb` — Debian package.

### macOS
- `gameZERO x.x.x.dmg` — Disk image (x64 + arm64).

## Development Build

To run the app in Electron during development:

```bash
cd Attached-Assets/artifacts/gaming-optimizer
pnpm run electron:dev
```

## Troubleshooting

- **Missing dependencies**: Run `pnpm install` from the repository root, then re-run the build command.
- **Stale build cache**: Delete `Attached-Assets/artifacts/gaming-optimizer/dist-electron` and `Attached-Assets/artifacts/gaming-optimizer/dist-web`, then rebuild.
- **Electron download issues**: Ensure outbound HTTPS is allowed; Electron binaries are fetched on first packaging.
- **TypeScript errors**: Run `pnpm run typecheck` to identify type issues before building.
- **IPC failures**: Ensure the app is running in Electron mode, not browser mode. Desktop features require Electron.

## Additional Resources

- **Full Documentation**: See [README.md](./README.md) for comprehensive feature documentation, API reference, and usage guides.
- **Development Setup**: See [README.md](./README.md#installation) for detailed development environment setup.
