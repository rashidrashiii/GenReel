// Script draft: the user's own `claude -p` with NO tools, in an empty temp folder, answering with JSON only.
// The user's words go inside delimited tags as data; they can never change the instructions.
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkScript, narrationBudget, propListForPrompt, schema, validateScript, type VideoScript } from "./schema/index.ts";
import { OWNER, paths } from "./paths.ts";

// The CLI's validator does not load draft 2020-12 meta-schemas; our own Ajv 2020 check runs on the result.
const cliSchema = Object.fromEntries(Object.entries(schema).filter(([k]) => k !== "$schema" && k !== "$id"));

export class RateLimitError extends Error {}
export const isRateLimit = (text: string) => /usage limit|rate.?limit|\b429\b|limit reached|overloaded/i.test(text);
export const MAX_VIDEO_SECONDS = 90;
export const MAX_NARRATION_CHARS = 1400;

export type DraftInput = { prompt: string; language: string; target_seconds: number; brand: { name?: string | null; contact?: string | null } };

const strip = (s: string) => s.replace(/<\/?(user_brief|brand|settings|prop_tags)>/gi, "");

export function buildPrompt(input: DraftInput, maxChars: number, feedback?: string[]) {
  const settings = JSON.stringify({ language: input.language, target_seconds: input.target_seconds, max_chars: maxChars });
  const brand = JSON.stringify({ name: input.brand.name ?? null, contact: input.brand.contact ?? null });
  let p = `<settings>${settings}</settings>\n<brand>${strip(brand)}</brand>\n<user_brief>${strip(input.prompt)}</user_brief>`;
  if (feedback?.length) p += `\n\nYour previous answer was rejected. Fix these problems:\n- ${feedback.join("\n- ")}`;
  return p;
}

export const budgetFor = (p: { language: string; target_seconds: number }) =>
  narrationBudget(p.language, p.target_seconds, { maxVideoSeconds: MAX_VIDEO_SECONDS, cap: MAX_NARRATION_CHARS });

/** The system prompt with the prop registry injected. */
export async function systemPrompt() {
  return (await readFile(join(paths.session, "script.txt"), "utf8")).replace("{{PROP_TAGS}}", propListForPrompt());
}

type CliResult = { structured_output?: unknown; result?: string; is_error?: boolean };

/** The person's own Claude Code login lives in their HOME / keychain, so the child keeps the normal environment. */
export const claudeBin = () => process.env.CLAUDE_BIN || "claude";

function runClaude(prompt: string, cwd: string, model: string, timeoutMs: number, promptFile: string): Promise<CliResult> {
  const args = ["-p", "--tools", "", "--strict-mcp-config", "--setting-sources", "",
    "--model", model, "--output-format", "json", "--json-schema", JSON.stringify(cliSchema), "--system-prompt-file", promptFile, prompt];
  return new Promise((resolve, reject) => {
    // detached = own process group, so a timeout kills claude's children too.
    const p = spawn(claudeBin(), args, { cwd, env: process.env, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    const t = setTimeout(() => { try { process.kill(process.platform === "win32" ? p.pid! : -p.pid!, "SIGKILL"); } catch { /* gone */ } }, timeoutMs);
    p.on("error", (e) => reject(Object.assign(new Error(`could not start claude: ${e.message}`), { userMessage: "errors.noClaude" })));
    p.on("close", (code) => {
      clearTimeout(t);
      let parsed: CliResult | undefined;
      try { parsed = JSON.parse(out); } catch { /* fallthrough */ }
      const text = `${err}\n${parsed?.result ?? out}`;
      if (code !== 0 || !parsed || parsed.is_error) {
        if (isRateLimit(text)) return reject(new RateLimitError(text.slice(0, 300)));
        return reject(new Error(`claude exited ${code}: ${text.slice(0, 300)}`));
      }
      resolve(parsed);
    });
  });
}

/** Write a script, validate it, retry once with the errors. */
export async function writeScript(input: DraftInput, opts: { model: string; timeoutMs?: number }): Promise<VideoScript> {
  const maxChars = budgetFor(input);
  const cwd = await mkdtemp(join(tmpdir(), "genreel-draft-"));
  let feedback: string[] | undefined;
  const promptFile = join(cwd, "system.txt");
  await writeFile(promptFile, await systemPrompt());
  // Numbers on screen must come from the user's own words (checkScript refuses invented ones).
  const brief = [input.prompt, input.brand.name, input.brand.contact].filter(Boolean).join("\n");
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await runClaude(buildPrompt(input, maxChars, feedback), cwd, opts.model, opts.timeoutMs ?? 180_000, promptFile);
      let data = r.structured_output;
      if (data === undefined && typeof r.result === "string") { try { data = JSON.parse(r.result); } catch { data = null; } }
      const v = validateScript(data);
      if (!v.ok) { feedback = v.errors; continue; }
      v.script.language = input.language as VideoScript["language"];
      for (const b of v.script.beats) delete b.photo; // only the app sets photos
      const extra = checkScript(v.script, { userId: OWNER, maxNarrationChars: maxChars, brief });
      if (extra.length) { feedback = extra; continue; }
      return v.script;
    }
    throw new Error(`script invalid after retry: ${feedback?.join("; ")}`);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}
