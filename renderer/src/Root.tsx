import { Composition, type CalculateMetadataFunction } from "remotion";
import { Explainer } from "./Explainer";
import type { ExplainerProps } from "./lib/types";
import { FPS } from "./lib/motion";
import { BgPreview, FitTest, type BgPreviewProps } from "./dev/Previews";
import { MouthTest, PoseSheet, type MouthTestProps } from "./dev/PresenterPreviews";
import { PropSheet } from "./dev/PropSheet";
import { PropAnimTest } from "./dev/PropAnimTest";

// Duration and size come from props.json (written by prepare.mjs): one composition fits every brief.
const calculateMetadata: CalculateMetadataFunction<ExplainerProps> = ({ props }) => ({
  durationInFrames: Math.max(1, props.total), width: props.width, height: props.height,
});

const EMPTY: ExplainerProps = { width: 1080, height: 1920, fps: 30, language: "en", title: "", background: "city", primary: "#1B6B4A",
  brand: { name: null, contact: null, logo: null }, music: null, voice: "", total: 60, contentEnd: 0, beats: [], mouth: [], speech: [], sfx: {} };

export const Root = () => (
  <>
  <Composition id="BgPreview" component={BgPreview} durationInFrames={60} fps={FPS} width={1080} height={1920}
    defaultProps={{ preset: "city", dark: false, primary: "#1B6B4A", camera: "push_in", text: "Kochi Metro has a few surprising secrets", lang: "en", zones: true } as BgPreviewProps} />
  <Composition id="PoseSheet" component={PoseSheet} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ primary: "#1B6B4A" }} />
  <Composition id="MouthTest" component={MouthTest} durationInFrames={90} fps={FPS} width={1080} height={1920}
    defaultProps={{ audio: "", mouth: [], primary: "#1B6B4A" } as MouthTestProps}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, props.mouth.length) })} />
  <Composition id="PropSheet" component={PropSheet} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ primary: "#1B6B4A", from: 0, count: 48 }} />
  <Composition id="PropAnimTest" component={PropAnimTest} durationInFrames={60} fps={FPS} width={1080} height={1920} />
  <Composition id="FitTest" component={FitTest} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  <Composition id="Video" component={Explainer} durationInFrames={60} fps={FPS} width={1080} height={1920} defaultProps={EMPTY} calculateMetadata={calculateMetadata} />
  </>
);
