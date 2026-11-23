#!/usr/bin/env node
// genreel: start the local app (http://localhost:3311) and open it in the browser.
// Only this computer can reach it (it listens on 127.0.0.1). Stop it with Ctrl+C.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT || "3311";
const url = `http://localhost:${port}`;
// npx and global installs put Next.js next to genreel, not inside it: let Node find it.
const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const env = { ...process.env, GENREEL_APP_ROOT: root, NEXT_TELEMETRY_DISABLED: "1" };

if (Number(process.versions.node.split(".")[0]) < 20) {
  console.error(`genreel needs Node.js 20 or newer (this is ${process.versions.node}).`);
  process.exit(1);
}
// A fresh clone has no build yet; npm packages ship with one.
if (!existsSync(join(root, ".next", "BUILD_ID"))) {
  console.log("Building genreel (first run only)…");
  const b = spawnSync(process.execPath, [next, "build"], { cwd: root, env, stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
}

const server = spawn(process.execPath, [next, "start", "-p", port, "-H", "127.0.0.1"], { cwd: root, env, stdio: ["ignore", "pipe", "inherit"] });
let opened = false;
server.stdout.on("data", (d) => {
  process.stdout.write(d);
  if (!opened && /ready|started|Local:/i.test(String(d))) {
    opened = true;
    console.log(`\ngenreel is running at ${url}  (Ctrl+C to stop)`);
    console.log("Free and open source, made by @rashidrashiii: https://github.com/rashidrashiii/GenReel\n");
    if (!process.env.GENREEL_NO_OPEN) {
      const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
      const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
      spawn(cmd, args, { stdio: "ignore", detached: true }).on("error", () => {}).unref();
    }
  }
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { server.kill(sig); process.exit(0); });
server.on("exit", (code) => process.exit(code ?? 0));
