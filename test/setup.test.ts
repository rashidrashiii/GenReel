// Setup copies the renderer project out of the installed app. From npx the app lives under
// .../node_modules/genreel, which must not make every file look like a node_modules file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const app = "/Users/someone/.npm/_npx/1eb21c4e/node_modules/genreel";
process.env.GENREEL_HOME = mkdtempSync(join(tmpdir(), "genreel-test-"));
process.env.GENREEL_APP_ROOT = app;
const { rendererFile } = await import("../lib/setup.ts");

test("renderer copy keeps the project files when genreel runs from npx, skips its own node_modules and out", () => {
  for (const f of ["", "package.json", "package-lock.json", "src/index.ts"]) assert.equal(rendererFile(join(app, "renderer", f)), true, f || "the folder itself");
  for (const f of ["node_modules", "node_modules/remotion/package.json", "out", "out/video.mp4"]) assert.equal(rendererFile(join(app, "renderer", f)), false, f);
});
