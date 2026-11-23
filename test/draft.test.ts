import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { RateLimitError, writeScript } from "../lib/draft.ts";

const fake = fileURLToPath(new URL("./fake-claude.mjs", import.meta.url));
chmodSync(fake, 0o755);
process.env.CLAUDE_BIN = fake;

// The brief carries the number the example shows (20%), so the "no invented numbers" check passes.
const input = (prompt: string, target_seconds = 30) => ({
  prompt: `20% off this Saturday at Sree Bakery. ${prompt}`, language: "en", target_seconds, brand: { name: "Sree Bakery", contact: "Sree Bakery, Kasaragod" },
});
const opts = { model: "claude-sonnet-5-5" };
const fakeEnv = () => JSON.parse(readFileSync(new URL("./.fake-env.json", import.meta.url), "utf8"));

test("valid script passes; no tools, empty temp folder, prop list in the system prompt, chosen model", async () => {
  const s = await writeScript(input("bakery offer MODE:valid"), opts);
  assert.equal(s.beats.length, 6);
  const { cwd, argv, system } = fakeEnv();
  assert.match(cwd, /genreel-draft-/);
  assert.equal(argv[argv.indexOf("--tools") + 1], "");
  assert.equal(argv[argv.indexOf("--model") + 1], "claude-sonnet-5-5");
  assert.match(system, /shopping: gift, shopping_cart, shopping_bag/);
  assert.doesNotMatch(system, /\{\{PROP_TAGS\}\}/);
});

test("invalid first answer is retried with the errors, then passes", async () => {
  assert.equal((await writeScript(input("MODE:invalid-then-valid"), opts)).beats.length, 6);
});

test("a photo set by the model is removed (only the app sets photos)", async () => {
  assert.equal((await writeScript(input("MODE:model-photo"), opts)).beats.some((b) => b.photo), false);
});

test("unknown prop tags are mapped to the registry", async () => {
  const s = await writeScript(input("MODE:odd-tags"), opts);
  assert.deepEqual(s.beats[0]!.props!.map((p) => p.tag), ["shopping_cart", "star"]);
});

test("narration over the length budget is rejected", async () => {
  await assert.rejects(writeScript(input("MODE:too-long", 15), opts), /shorten it to at most/);
});

test("a number the user never gave is refused", async () => {
  await assert.rejects(writeScript(input("MODE:invented-number"), opts), /"35%" is not in the user's brief/);
});

test("a Claude usage limit becomes RateLimitError", async () => {
  await assert.rejects(writeScript(input("MODE:rate-limit"), opts), RateLimitError);
});
