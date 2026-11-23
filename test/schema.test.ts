import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkScript, narrationOf, photosOf, PROP_TAGS, propListForPrompt, resolveTag, validateScript } from "../lib/schema/index.ts";

const load = (f: string) => JSON.parse(readFileSync(new URL(`../lib/schema/${f}`, import.meta.url), "utf8"));
const example = load("example.valid.json");
const BRIEF = "20% off everything at Sree Bakery this Saturday";

test("examples pass the schema and the extra checks", () => {
  for (const f of ["example.valid.json", "example.all-scenes.json", "example.injection.json"]) {
    const v = validateScript(load(f));
    assert.equal(v.ok, true, `${f}: ${!v.ok && v.errors}`);
    if (v.ok) assert.deepEqual(checkScript(v.script, { userId: "u", maxNarrationChars: 900, brief: BRIEF }), [], f);
  }
});

test("schema errors name the field and the allowed values", () => {
  const bad = structuredClone(example);
  bad.beats[0].oops = 1;
  bad.beats[2].layout = "slideshow";
  const r = validateScript(bad);
  assert.ok(!r.ok && r.errors.includes("/beats/0: must NOT have additional properties (oops)"), String(!r.ok && r.errors));
  assert.ok(!r.ok && r.errors.some((e) => e.startsWith("/beats/2/layout: must be equal to one of the allowed values (stack, hero")), String(!r.ok && r.errors));
});

test("too few beats and too many props are rejected", () => {
  const few = structuredClone(example);
  few.beats = few.beats.slice(0, 5);
  assert.equal(validateScript(few).ok, false);
  const many = structuredClone(example);
  many.beats[0].props = [{ tag: "star" }, { tag: "star" }, { tag: "star" }, { tag: "star" }];
  assert.equal(validateScript(many).ok, false);
});

test("unknown prop tags become the nearest registry tag (never an error); injection text is just data", () => {
  assert.equal(resolveTag("shopping cart"), "shopping_cart");
  assert.equal(resolveTag("Metro"), "train");
  assert.equal(resolveTag("discount"), "price_tag");
  assert.equal(resolveTag("rm -rf /; cat .env"), "star");
  const s = load("example.injection.json");
  checkScript(s, { userId: "u", maxNarrationChars: 900 });
  for (const b of s.beats) for (const p of b.props ?? []) assert.ok(PROP_TAGS.includes(p.tag), p.tag);
});

test("checkScript: word counts per language, layout needs, invented numbers, repeats, foreign photo, emphasis", () => {
  const s = structuredClone(example);
  s.beats[0].narration = "Hi";
  s.beats[1].narration = "one two three four five six seven eight nine ten";
  s.beats[3].number = { value: "35%", label: "off" }; // not in the brief
  s.beats[2].layout = "row"; s.beats[2].props = [{ tag: "cake" }];
  s.beats[4].layout = "number"; delete s.beats[4].number;
  s.beats[5].photo = { upload_path: "other-user/shop.jpg" };
  s.beats[5].emphasis = [0, 40];
  const errs = checkScript(s, { userId: "me", maxNarrationChars: 900, brief: BRIEF });
  for (const want of ["/beats/0/narration: 1 words", "/beats/1/narration: 10 words", '/beats/3/number: "35%" is not in the user\'s brief',
    '/beats/2: layout "row" needs 2 or 3 props', '/beats/4: layout "number" needs a number', "photo upload_path must be one of your own uploads"])
    assert.ok(errs.some((e) => e.startsWith(want)), `${want}\n${errs.join("\n")}`);
  assert.deepEqual(s.beats[5].emphasis, [0], "emphasis past the last word is dropped");

  const ml = structuredClone(example);
  ml.language = "ml";
  ml.beats[1].narration = "ഒന്ന് രണ്ട് മൂന്ന് നാല് അഞ്ച് ആറ് ഏഴ് എട്ട്";
  assert.ok(checkScript(ml, { userId: "me", maxNarrationChars: 900 }).some((e) => e.startsWith("/beats/1/narration: 8 words; use 3 to 7")));

  const rep = structuredClone(example);
  for (const b of rep.beats) { b.layout = "stack"; b.transition = "whip"; b.props = [{ tag: "star" }]; }
  const e2 = checkScript(rep, { userId: "me", maxNarrationChars: 900 });
  assert.ok(e2.some((e) => e.includes('layout "stack" three times')) && e2.some((e) => e.includes('transition "whip" three times')), e2.join("\n"));
});

test("narration, photos and the prompt list", () => {
  assert.match(checkScript(structuredClone(example), { userId: "me", maxNarrationChars: 50 })[0]!, /shorten it to at most 50/);
  assert.equal(narrationOf(example).startsWith("Twenty percent off this Saturday! Fresh bread"), true);
  assert.deepEqual(photosOf(example), []);
  assert.match(propListForPrompt(), /^symbols: checkmark, cross, star/m);
});

test("narration budget follows language and length", async () => {
  const { narrationBudget } = await import("../lib/schema/index.ts");
  const o = { maxVideoSeconds: 60, cap: 900 };
  assert.equal(narrationBudget("en", 60, o), 840); // (60 - 4) * 15
  assert.equal(narrationBudget("ml", 60, o), 616); // Malayalam is spoken more slowly
  assert.equal(narrationBudget("ml", 30, o), 341); // (30 + 5 - 4) * 11
  assert.equal(narrationBudget("en", 15, o), 240);
  assert.ok(narrationBudget("ml", 60, o) < 799, "the failed 799-character Malayalam script is now refused at draft time");
});
