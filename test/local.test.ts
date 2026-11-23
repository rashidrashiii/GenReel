// Store, request guard and session runner pieces, against a throwaway GENREEL_HOME.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.GENREEL_HOME = mkdtempSync(join(tmpdir(), "genreel-test-"));
const { createProject, getProject, listProjects, patchJob, updateProject, newJob } = await import("../lib/store.ts");
const { isAllowed } = await import("../proxy.ts");
const { sessionProgress, sessionRules } = await import("../lib/session.ts");
const { getSettings, saveSettings, publicSettings, languageAvailable } = await import("../lib/settings.ts");

const brand = { name: null, contact: null, logo_path: null, primary_color: "#1B6B4A" };

test("store: create, update in order, list newest first, survives a broken temp file", async () => {
  const a = await createProject({ prompt: "a", language: "en", aspect: "9:16", target_seconds: 30, brand });
  const b = await createProject({ prompt: "b", language: "en", aspect: "1:1", target_seconds: 15, brand });
  await Promise.all([1, 2, 3, 4, 5].map((n) => updateProject(a.id, (p) => { p.prompt += n; })));
  assert.equal((await getProject(a.id))!.prompt, "a12345", "concurrent updates are applied one after another");
  writeFileSync(join(process.env.GENREEL_HOME!, "projects", a.id, ".project.1.tmp"), "{ half");
  assert.deepEqual((await listProjects()).map((p) => p.id).sort(), [a.id, b.id].sort());
  assert.equal(await getProject("../../etc"), null, "ids are checked");
});

test("store: patchJob ignores undefined fields and stamps updated_at", async () => {
  const p = await createProject({ prompt: "c", language: "en", aspect: "9:16", target_seconds: 30, brand });
  await updateProject(p.id, (q) => { q.job = { ...newJob("render"), stage: "Recording the voice" }; });
  const before = (await getProject(p.id))!.job!.updated_at;
  await new Promise((r) => setTimeout(r, 5));
  await patchJob(p.id, { stage: undefined, progress: 40 });
  const j = (await getProject(p.id))!.job!;
  assert.equal(j.stage, "Recording the voice");
  assert.equal(j.progress, 40);
  assert.notEqual(j.updated_at, before);
});

test("request guard: only genreel's own page on localhost may drive the app", () => {
  const r = (method: string, path: string, host: string | null, origin: string | null, fetchSite: string | null) => isAllowed({ method, path, host, origin, fetchSite });
  assert.equal(r("POST", "/api/projects", "localhost:3311", "http://localhost:3311", "same-origin"), true);
  assert.equal(r("POST", "/api/projects", "localhost:3311", "https://evil.example", "cross-site"), false, "cross-site post");
  assert.equal(r("POST", "/api/projects", "localhost:3311", null, "cross-site"), false, "post without origin");
  assert.equal(r("POST", "/api/projects", "evil.example:3311", "http://evil.example:3311", "same-origin"), false, "DNS rebinding");
  assert.equal(r("GET", "/api/settings", "localhost:3311", null, "cross-site"), false, "cross-site API read");
  assert.equal(r("GET", "/", "127.0.0.1:3311", null, "cross-site"), true, "a link to the app from elsewhere still opens it");
  assert.equal(r("GET", "/api/projects/x", "[::1]:3311", null, "same-origin"), true);
});

test("session progress maps 0-100 onto 20-90, never goes down, ignores junk", () => {
  assert.equal(sessionProgress("50\n", 20), 55);
  assert.equal(sessionProgress("250", 20), 90);
  assert.equal(sessionProgress("10", 55), 55);
  assert.equal(sessionProgress("rm -rf", 40), 40);
});

test("session rules: real folders filled in, lemo-opuscar steps only when it is installed", async () => {
  const withIt = await sessionRules({ work: "/tmp/w", minutes: 60, opuscar: true });
  const without = await sessionRules({ work: "/tmp/w", minutes: 60, opuscar: false });
  for (const t of [withIt, without]) {
    assert.doesNotMatch(t, /\{\{|(^|[\s`(])\/(work|opt)\//m, "no placeholders or container paths left");
    assert.match(t, /\/tmp\/w\/input\/brief\.json/);
  }
  assert.match(withIt, /lemo-opuscar:lemo-opuscar/);
  assert.match(withIt, /within 45 minutes/);
  assert.doesNotMatch(without, /lemo-opuscar/);
  assert.match(without, /Make the video with the ready Remotion project/);
});

test("settings: key stays private, file is owner-only, languages follow the key", async () => {
  assert.equal(languageAvailable("ml", await getSettings()), false);
  const s = await saveSettings({ elevenlabsKey: "sk_test" });
  assert.equal(publicSettings(s).elevenlabsKey, null);
  assert.equal(publicSettings(s).hasElevenlabsKey, true);
  assert.equal(languageAvailable("ml", s), true);
  const { statSync } = await import("node:fs");
  assert.equal(statSync(join(process.env.GENREEL_HOME!, "settings.json")).mode & 0o777, 0o600);
  assert.match(readFileSync(join(process.env.GENREEL_HOME!, "settings.json"), "utf8"), /sk_test/);
});

test("restart: a job that was running when genreel stopped is marked failed with Try again", async () => {
  const { recover } = await import("../lib/jobs.ts");
  const p = await createProject({ prompt: "r", language: "en", aspect: "9:16", target_seconds: 15, brand });
  await updateProject(p.id, (q) => { q.state = "render_pending"; q.job = { ...newJob("render"), status: "running", pid: 999_999 }; });
  await recover();
  const after = (await getProject(p.id))!;
  assert.equal(after.state, "failed");
  assert.equal(after.job!.error, "errors.interrupted");
});

test("settings: model list uses real IDs; custom IDs must look like a Claude model", async () => {
  const { MODELS, isModelId } = await import("../lib/settings.ts");
  assert.ok(MODELS.every((m) => isModelId(m.id)));
  assert.ok(MODELS.some((m) => m.id === "claude-opus-5-5"));
  assert.equal(isModelId("claude-opus-4-8"), true);
  assert.equal(isModelId("gpt-5"), false);
  assert.equal(isModelId("claude-x; rm -rf ~"), false);
});
