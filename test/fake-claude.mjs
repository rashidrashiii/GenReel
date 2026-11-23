#!/usr/bin/env node
// Stands in for `claude -p` in tests. Behaviour is chosen by a MODE:<x> marker in the prompt (the env is stripped).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const prompt = process.argv.at(-1);
const mode = /MODE:([\w-]+)/.exec(prompt)?.[1] ?? "valid";
const sysFile = process.argv[process.argv.indexOf("--system-prompt-file") + 1];
const system = sysFile && existsSync(sysFile) ? readFileSync(sysFile, "utf8") : "";
writeFileSync(new URL("./.fake-env.json", import.meta.url), JSON.stringify({ keys: Object.keys(process.env), cwd: process.cwd(), argv: process.argv.slice(2, -1), system }));
const example = JSON.parse(readFileSync(new URL("../lib/schema/example.valid.json", import.meta.url), "utf8"));

const counter = `${process.cwd()}/count`;
const n = existsSync(counter) ? Number(readFileSync(counter, "utf8")) + 1 : 1;
writeFileSync(counter, String(n));

let out = example;
if (mode === "invalid-then-valid" && n === 1) out = { ...example, beats: [example.beats[0]] };
if (mode === "model-photo") out = { ...example, beats: [{ ...example.beats[0], photo: { upload_path: "someone-else/x.png" } }, ...example.beats.slice(1)] };
if (mode === "too-long") out = { ...example, beats: example.beats.map((b) => ({ ...b, narration: "many many many many many many many many words" })) };
if (mode === "invented-number") out = { ...example, beats: example.beats.map((b) => (b.number ? { ...b, number: { value: "35%", label: "off" } } : b)) };
if (mode === "odd-tags") out = { ...example, beats: example.beats.map((b, i) => (i === 0 ? { ...b, props: [{ tag: "Shopping Cart" }, { tag: "spaceship" }] } : b)) };
if (mode === "rate-limit") { console.log(JSON.stringify({ is_error: true, result: "Claude AI usage limit reached|1700000000" })); process.exit(1); }

console.log(JSON.stringify({ is_error: false, total_cost_usd: 0.01, structured_output: out }));
