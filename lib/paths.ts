import { homedir } from "node:os";
import { join, resolve } from "node:path";

// Everything genreel makes lives under ~/genreel (override with GENREEL_HOME). The app's own files (renderer source,
// session rules, music, sound effects) live in the package folder, which is the working directory when it runs.
export const HOME = resolve(process.env.GENREEL_HOME || join(homedir(), "genreel"));
export const APP = resolve(process.env.GENREEL_APP_ROOT || process.cwd());

export const paths = {
  projects: join(HOME, "projects"),
  uploads: join(HOME, "uploads"),
  settings: join(HOME, "settings.json"),
  renderer: join(HOME, "renderer"), // installed copy of APP/renderer with its node_modules
  voices: join(HOME, "voices"), // Kokoro model files
  python: join(HOME, "python"), // venv for the local voice
  rendererSrc: join(APP, "renderer"),
  session: join(APP, "session"),
  assets: join(APP, "assets"),
};

/** Uploads are referenced in scripts as "local/<file>" (the schema checks photos live in the owner's folder). */
export const OWNER = "local";
