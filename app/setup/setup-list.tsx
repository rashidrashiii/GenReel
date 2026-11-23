"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/components/i18n";
import type { Check } from "@/lib/setup";

type Task = { step: string; status: "running" | "done" | "failed"; log: string } | null;
type Data = { checks: Check[]; ready: boolean; task: Task };

// What the user installs themselves, per platform. genreel installs the rest (renderer, voice, lemo-opuscar).
const FIX: Record<string, Record<string, string>> = {
  claude: { all: "npm install -g @anthropic-ai/claude-code   (then run: claude   once, to sign in)" },
  node: { darwin: "brew install node", win32: "winget install OpenJS.NodeJS.LTS", all: "https://nodejs.org" },
  ffmpeg: { darwin: "brew install ffmpeg", win32: "winget install Gyan.FFmpeg", all: "sudo apt install ffmpeg" },
  python: { darwin: "brew install python@3.12", win32: "winget install Python.Python.3.12", all: "sudo apt install python3 python3-venv" },
};
const CLAUDE_PROMPT = "Please install ffmpeg (version 7 or newer) and Python 3.12 on this computer, then check that `ffmpeg -version` and `python3.12 --version` work.";
const INSTALLABLE = new Set(["renderer", "voice", "opuscar"]);

export function SetupList({ initial, platform }: { initial: Data; platform: string }) {
  const { t } = useT();
  const [d, setD] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const refresh = useCallback(async () => {
    const r = await fetch("/api/setup", { cache: "no-store" }).catch(() => null);
    if (r?.ok) setD(await r.json());
  }, []);
  const running = d.task?.status === "running";
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => void refresh(), 2000);
    return () => clearInterval(id);
  }, [running, refresh]);

  async function install(step: string) {
    if (step === "opuscar" && !confirm(t("setup.opuscarConfirm"))) return;
    setError(null);
    const r = await fetch("/api/setup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ step }) }).catch(() => null);
    if (!r?.ok) setError((await r?.json().catch(() => null))?.error ?? "errors.network");
    void refresh();
  }

  return (
    <>
      <ol className="setup-list">
        {d.checks.map((c) => {
          const fix = FIX[c.id]?.[platform] ?? FIX[c.id]?.all;
          const busy = running && d.task?.step === c.id;
          return (
            <li key={c.id} className="panel setup-item" data-ok={c.ok}>
              <div className="setup-row">
                <span className={`badge ${c.ok ? "ready" : c.required ? "failed" : "draft"}`}>{c.ok ? t("setup.ok") : c.required ? t("setup.missing") : t("setup.optional")}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 className="panel-h" style={{ margin: 0 }}>{t(`setup.item.${c.id}`)}</h2>
                  <p className="help" style={{ margin: "4px 0 0" }}>{t(`setup.why.${c.id}`)}{c.detail ? ` (${c.detail})` : ""}</p>
                </div>
                {!c.ok && INSTALLABLE.has(c.id) && (
                  <button className="btn btn-secondary" disabled={running} onClick={() => void install(c.id)}>{busy ? t("setup.installing") : t("setup.install")}</button>
                )}
              </div>
              {!c.ok && fix && <p className="setup-fix"><code>{fix}</code></p>}
            </li>
          );
        })}
      </ol>

      {d.checks.some((c) => !c.ok && FIX[c.id]) && (
        <div className="panel">
          <h2 className="panel-h">{t("setup.askClaude")}</h2>
          <p className="help">{t("setup.askClaudeHelp")}</p>
          <p className="setup-fix"><code>{CLAUDE_PROMPT}</code></p>
          <button className="btn btn-secondary" onClick={async () => { await navigator.clipboard.writeText(CLAUDE_PROMPT); setCopied(true); }}>{copied ? t("setup.copied") : t("setup.copy")}</button>
          <button className="link-btn" onClick={() => void refresh()} style={{ marginLeft: 12 }}>{t("setup.checkAgain")}</button>
        </div>
      )}

      {d.task && d.task.status !== "done" && (
        <details className="panel" open={d.task.status === "failed"}>
          <summary>{d.task.status === "failed" ? t("setup.failed") : t("setup.working")}</summary>
          <pre className="setup-log">{d.task.log.slice(-3000)}</pre>
        </details>
      )}
      {error && <p className="error-text" role="alert">{t(error)}</p>}

      <p className="notice">{t("setup.safety")}</p>
      <div className="action-bar">
        {d.ready ? <Link className="btn" href="/create">{t("setup.start")}</Link> : <p className="note">{t("setup.notReady")}</p>}
      </div>
    </>
  );
}
