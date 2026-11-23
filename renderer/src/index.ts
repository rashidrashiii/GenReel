import { registerRoot } from "remotion";
import { loadFont as sans } from "@remotion/google-fonts/NotoSans";
import { loadFont as malayalam } from "@remotion/google-fonts/NotoSansMalayalam";
import { loadFont as devanagari } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as tamil } from "@remotion/google-fonts/NotoSansTamil";
import { Root } from "./Root";

// Same fonts on every computer (nothing to install): Noto for Latin, Malayalam, Devanagari and Tamil.
// lib/fit.ts waits for them before measuring text.
const weights = ["600", "700", "800"] as ("600" | "700" | "800")[];
sans("normal", { weights, subsets: ["latin"] });
malayalam("normal", { weights, subsets: ["malayalam"] });
devanagari("normal", { weights, subsets: ["devanagari"] });
tamil("normal", { weights, subsets: ["tamil"] });

registerRoot(Root);
