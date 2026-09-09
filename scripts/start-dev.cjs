const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = join(__dirname, "..");
const localCaPath = join(projectRoot, ".certs", "norton-web-mail-shield-root.pem");
const nextBin = join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const env = { ...process.env };

if (!env.NODE_EXTRA_CA_CERTS && existsSync(localCaPath)) {
  env.NODE_EXTRA_CA_CERTS = localCaPath;
}

// Puerto por defecto 3100 para el repo en D:\dev (deja libre el 3000 para el
// fallback en OneDrive). Se puede sobreescribir con la variable de entorno PORT.
const port = process.env.PORT || "3100";

// Dev con Webpack en vez de Turbopack: en este entorno Turbopack revienta sus workers
// de forma recurrente (EPIPE / "Jest worker encountered child process exceptions"),
// probablemente por la interferencia de Norton con los procesos hijo de Node.
// El build de producción (next build) sigue usando el bundler por defecto.
const child = spawn(process.execPath, [nextBin, "dev", "--webpack", "-p", port], {
  cwd: projectRoot,
  env,
  stdio: "inherit",
  shell: false
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
