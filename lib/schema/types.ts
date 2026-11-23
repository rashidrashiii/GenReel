// Generated from video-script.schema.json by `npm run gen`. Do not edit.

export type Background = "city" | "shop" | "nature" | "studio" | "abstract" | "night";

/**
 * A short animated explainer as a list of beats (docs/VISUAL_UPGRADE.md, docs/SCENES.md). Each beat is 1-3 s; joined narrations are the voiceover.
 */
export interface VideoScript {
  title: string;
  language: "en" | "ml" | "hi" | "ta";
  voice?: "warm_female" | "calm_male" | "energetic_female" | "energetic_male";
  music: "none" | "calm" | "upbeat" | "festive" | "serious";
  background: Background;
  /**
   * @minItems 6
   * @maxItems 45
   */
  beats: [Beat, Beat, Beat, Beat, Beat, Beat, ...Beat[]];
}
export interface Beat {
  /**
   * Spoken words for this beat, 3-9 words (Malayalam 3-7). Shown as word-by-word captions.
   */
  narration: string;
  /**
   * 0-based indexes of words in this beat's narration to stress.
   *
   * @maxItems 2
   */
  emphasis?: number[];
  layout: "stack" | "hero" | "row" | "number" | "diagram" | "presenter_big";
  presenter?: {
    pose: "neutral" | "point" | "thumbs_up" | "surprised" | "explain";
    side?: "left" | "center" | "right";
  };
  /**
   * @maxItems 3
   */
  props?: Prop[];
  number?: {
    value: string;
    label: string;
  };
  diagram?: {
    kind: "row" | "column" | "cycle";
    /**
     * @minItems 2
     * @maxItems 5
     */
    nodes: [
      {
        label: string;
        tag?: string;
      },
      {
        label: string;
        tag?: string;
      },
      ...{
        label: string;
        tag?: string;
      }[]
    ];
  };
  camera?: "push_in" | "pull_out" | "pan_left" | "pan_right" | "shake_punch" | "none";
  transition?: "cut" | "whip" | "zoom" | "iris";
  sfx?: "whoosh" | "pop" | "ding" | "thud" | "tick" | "swipe" | "none";
  background?: Background;
  /**
   * Set only by the app when the user picks one of their own photos for this beat; the model never sets it.
   */
  photo?: {
    upload_path: string;
  };
}
export interface Prop {
  /**
   * A tag from the prop list given in the prompt.
   */
  tag: string;
  enter?: "pop" | "slide_up" | "drop" | "draw_on" | "wipe_in";
  idle?: "float" | "pulse" | "wobble" | "none";
}
