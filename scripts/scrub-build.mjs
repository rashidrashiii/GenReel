// After `next build`: the build records this computer's project folder in two files. Next.js only reads them, the app
// runs from any folder, so replace the path with a neutral one before publishing (no local usernames in the package).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
for (const f of ["required-server-files.json", "required-server-files.js"]) {
  const p = join(root, ".next", f);
  const s = readFileSync(p, "utf8");
  writeFileSync(p, s.split(root).join("/genreel"));
}
console.log("scrubbed local paths from the build");
