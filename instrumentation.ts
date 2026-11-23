// Runs once when the local server starts: put queued videos back in line, mark interrupted jobs as failed.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await (await import("./lib/jobs")).recover();
}
