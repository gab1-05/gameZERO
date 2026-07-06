const fs = require("fs");

for (const lockfile of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.rmSync(lockfile, { force: true });
  } catch {
    // Ignore cleanup failures; the package manager check below is the important guard.
  }
}

if (!process.env.npm_config_user_agent?.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
