// props.json written by prepare.mjs (frames at 30 fps). Beat fields mirror packages/schema minus narration/photo.
import type { BgPreset } from "../components/Background";
import type { CameraKind } from "../components/Camera";
import type { Pose } from "../components/Presenter";
import type { PropSpec } from "../components/Prop";

export type Word = { w: string; f0: number; f1: number };
export type Page = { from: number; to: number; words: Word[] };
export type Layout = "stack" | "hero" | "row" | "number" | "diagram" | "presenter_big";
export type Transition = "cut" | "whip" | "zoom" | "iris";
export type Sfx = "whoosh" | "pop" | "ding" | "thud" | "tick" | "swipe" | "none";

export type BeatData = {
  layout: Layout;
  presenter?: { pose: Pose; side?: "left" | "center" | "right" };
  props?: PropSpec[];
  number?: { value: string; label: string };
  diagram?: { kind: "row" | "column" | "cycle"; nodes: { label: string; tag?: string }[] };
  camera?: CameraKind; transition?: Transition; sfx?: Sfx; background?: BgPreset;
  emphasis?: number[];
  from: number; to: number; words: Word[]; pages: Page[]; emph: number[]; photo: string | null;
};

export type ExplainerProps = {
  width: number; height: number; fps: number; language: string; title: string; background: BgPreset; primary: string;
  brand: { name: string | null; contact: string | null; logo: string | null };
  music: string | null; voice: string; total: number; contentEnd: number;
  beats: BeatData[]; mouth: number[]; speech: [number, number][]; sfx: Partial<Record<Exclude<Sfx, "none">, string>>;
};
