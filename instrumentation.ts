// Runs once when the local server starts: put queued videos back in line, mark interrupted jobs as failed.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Started through npm/npx, we inherit npm_config_local_prefix (the folder npx ran from) and friends.
  // They would make every npm, npx and remotion we start work in that folder instead of its own.
  for (const k of Object.keys(process.env)) if (/^npm_/i.test(k)) delete process.env[k];
  await (await import("./lib/jobs")).recover();
}
