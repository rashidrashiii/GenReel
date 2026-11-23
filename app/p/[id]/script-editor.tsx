"use client";
import { useId, useState } from "react";
import type { Beat, VideoScript } from "@/lib/schema/index.ts";
import { useT } from "@/components/i18n";
import { LOGO_TYPES, MAX_UPLOAD, uploadImage, uploadUrl } from "@/lib/upload";
import type { Project } from "./project-view";
import { CurrentVideo } from "./current-video";

// The script is a list of short beats (docs/VISUAL_UPGRADE.md §5); each card here is one beat. People edit the words
// (spoken = captions), numbers and step labels, the order, and may swap the drawing for one of their own photos.
const MIN_BEATS = 6, MAX_BEATS = 45;
const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;
const maxWords = (lang: string) => (lang === "ml" || lang === "ta" ? 7 : 9);

export function ScriptEditor({ project, onRendered, maxNarrationChars }: { project: Project; onRendered: () => void; maxNarrationChars: number }) {
  const { t } = useT();
  const [script, setScript] = useState<VideoScript>(project.scenes!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const beats = script.beats as Beat[];
  const lang = project.language;
  const chars = beats.reduce((n, b) => n + b.narration.trim().length + 1, 0);

  // Stable keys so cards keep their own inputs when beats move or are removed.
  const [keys, setKeys] = useState(() => beats.map(() => crypto.randomUUID()));
  const setBeats = (next: Beat[], nextKeys: string[] = keys) => { setScript({ ...script, beats: next as VideoScript["beats"] }); setKeys(nextKeys); };
  const update = (i: number, patch: Partial<Beat>) => setBeats(beats.map((b, k) => (k === i ? { ...b, ...patch } : b)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...beats], nk = [...keys];
    [next[i], next[i + d]] = [next[i + d]!, next[i]!];
    [nk[i], nk[i + d]] = [nk[i + d]!, nk[i]!];
    setBeats(next, nk);
  };

  async function makeVideo() {
    if (beats.length < MIN_BEATS) { setError("review.minScenes"); return; }
    setBusy(true); setError(null); setDetails([]);
    const save = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ scenes: script }) }).catch(() => null);
    const sj = await save?.json().catch(() => ({}));
    if (!save?.ok) { setError(sj?.error ?? "errors.network"); setDetails(sj?.details ?? []); setBusy(false); return; }
    const res = await fetch(`/api/projects/${project.id}/render`, { method: "POST" }).catch(() => null);
    const rj = await res?.json().catch(() => ({}));
    if (!res?.ok) { setError(rj?.error ?? "errors.network"); setBusy(false); return; }
    onRendered();
  }

  // Rough timing for the list (about 14 spoken characters a second; Malayalam is slower).
  const cps = lang === "ml" || lang === "ta" ? 12 : 14;
  const startsAt = beats.reduce<number[]>((acc, b, i) => { acc.push(i ? acc[i - 1]! + (beats[i - 1]!.narration.length + 1) / cps : 0); return acc; }, []);
  const seconds = Math.round(chars / cps + 2.7);
  const max = maxWords(lang);
  const problems = beats.map((b, i) => { const n = wordCount(b.narration); return n < 3 || n > max ? i : -1; }).filter((i) => i >= 0);
  const [open, setOpen] = useState<number | null>(null);
  const openShot = (i: number | null) => {
    setOpen(i);
    if (i !== null) requestAnimationFrame(() => document.getElementById(`shot-${i}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  };
  const addShot = () => {
    setBeats([...beats.slice(0, -1), { narration: "", layout: "stack", presenter: { pose: "explain" }, props: [{ tag: "star", enter: "pop" }] }, ...beats.slice(-1)],
      [...keys.slice(0, -1), crypto.randomUUID(), ...keys.slice(-1)]);
    openShot(beats.length - 1);
  };

  const summary = (
    <>
      <dl className="review-stats">
        <div><dt>{t("review.statShots")}</dt><dd>{beats.length}</dd></div>
        <div><dt>{t("review.statLength")}</dt><dd>{t("review.aboutSeconds", { s: seconds })}</dd></div>
      </dl>
      <div className="meter" aria-label={t("review.length", { n: chars, max: maxNarrationChars })}>
        <span style={{ width: `${Math.min(100, (chars / maxNarrationChars) * 100)}%` }} className={chars > maxNarrationChars ? "over" : undefined} />
      </div>
      <p className={`small ${chars > maxNarrationChars ? "error-text" : "muted"}`} style={{ margin: "6px 0 0" }}>{t("review.length", { n: chars, max: maxNarrationChars })}</p>
      {problems.length > 0 && (
        <p className="review-warn">
          {t("review.problems", { n: problems.length })} <button type="button" className="link-btn" onClick={() => openShot(problems[0]!)}>{t("review.showFirst")}</button>
        </p>
      )}
      {error && (
        <div role="alert" className="error-text">
          <p style={{ margin: "8px 0 0" }}>{t(error)}</p>
          {details.length > 0 && <ul className="small" lang="en">{details.map((d) => <li key={d}>{d}</li>)}</ul>}
        </div>
      )}
    </>
  );

  return (
    <section lang={lang} className="review">
      <div className="page-head">
        <h1>{t("review.heading")}</h1>
        <p>{t("review.introList")}</p>
      </div>
      <div className="review-grid">
        <div>
          <CurrentVideo project={project} />
          <div className="panel title-inline">
            <label htmlFor="title">{t("review.titleLabel")}</label>
            <input id="title" type="text" value={script.title} maxLength={80} onChange={(e) => setScript({ ...script, title: e.target.value })} />
          </div>

          <ol className="shot-list">
            {beats.map((b, i) => (
              <ShotRow key={keys[i]} id={`shot-${i}`} i={i} b={b} total={beats.length} lang={lang} at={startsAt[i]!} open={open === i}
                onToggle={() => openShot(open === i ? null : i)}
                onChange={(p) => update(i, p)}
                onMove={(d) => { move(i, d); setOpen(i + d); }}
                onRemove={() => { setBeats(beats.filter((_, k) => k !== i), keys.filter((_, k) => k !== i)); setOpen(null); }} />
            ))}
          </ol>

          <button type="button" className="add-shot" disabled={beats.length >= MAX_BEATS} onClick={addShot}>+ {t("review.add")}</button>
        </div>

        <aside className="review-side">
          <div className="panel">
            {summary}
            <button className="btn btn-block" onClick={makeVideo} disabled={busy} style={{ marginTop: 16 }}>{busy ? t("review.saving") : t("review.submit")}</button>
            <p className="small muted" style={{ margin: "10px 0 0" }}>{t("review.note", { minutes: 30 })}</p>
          </div>
        </aside>
      </div>

      {/* phones: the summary panel sits below the list, so keep the main button in reach */}
      <div className="action-bar review-bar">
        <button className="btn" onClick={makeVideo} disabled={busy}>{busy ? t("review.saving") : t("review.submit")}</button>
        <p className="note">{t("review.barNote", { n: beats.length, s: seconds })}</p>
      </div>
    </section>
  );
}

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** One shot: a compact row you can read; tap to edit it in place. */
function ShotRow({ id, i, b, total, lang, at, open, onToggle, onChange, onMove, onRemove }: {
  id: string; i: number; b: Beat; total: number; lang: string; at: number; open: boolean;
  onToggle: () => void; onChange: (p: Partial<Beat>) => void; onMove: (d: -1 | 1) => void; onRemove: () => void;
}) {
  const { t } = useT();
  const fid = useId();
  const n = wordCount(b.narration), max = maxWords(lang);
  const bad = n < 3 || n > max;
  const kind = i === 0 ? "hook" : i === total - 1 ? "closing" : b.layout;
  const drawings = [...(b.props ?? []).map((p) => p.tag), ...(b.diagram?.nodes ?? []).flatMap((x) => (x.tag ? [x.tag] : []))];
  const shows = b.photo ? t("review.picture.upload") : b.number ? `${b.number.value} ${b.number.label}`.trim()
    : b.diagram ? b.diagram.nodes.map((x) => x.label).join(" → ") : drawings.length ? drawings.map(readable).join(", ") : t("review.picture.presenter");
  return (
    <li id={id} className={`shot${open ? " is-open" : ""}${bad ? " is-bad" : ""}`}>
      <button type="button" className="shot-row" aria-expanded={open} aria-controls={`${fid}-edit`} onClick={onToggle}>
        <span className="shot-n">{i + 1}</span>
        <span className="shot-main">
          <span className="shot-line" lang={lang}>{b.narration || <em className="muted">{t("review.emptyLine")}</em>}</span>
          <span className="shot-meta">
            <span>{fmtTime(at)}</span>
            <span className="shot-kind">{t(`review.layout.${kind}`)}</span>
            <span className="shot-shows" lang={b.number || b.diagram ? lang : "en"}>{shows}</span>
            {bad && <span className="shot-warn">{t("review.wordsShort", { n, max })}</span>}
          </span>
        </span>
        <span className="chev" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="shot-edit" id={`${fid}-edit`}>
          <div className="field">
            <label htmlFor={`${fid}-say`}>{t("review.spoken")}</label>
            <textarea id={`${fid}-say`} rows={2} value={b.narration} maxLength={90} autoFocus onChange={(e) => onChange({ narration: e.target.value.replace(/\n/g, " ") })} aria-describedby={`${fid}-say-help`} />
            <p className={`help ${bad && n ? "error-text" : ""}`} id={`${fid}-say-help`}>{t("review.wordsHint", { n, max })}</p>
          </div>
          {b.number && (
            <div className="field-row">
              <div className="field">
                <label htmlFor={`${fid}-v`}>{t("review.value")}</label>
                <input id={`${fid}-v`} type="text" value={b.number.value} maxLength={16} onChange={(e) => onChange({ number: { ...b.number!, value: e.target.value } })} />
              </div>
              <div className="field">
                <label htmlFor={`${fid}-l`}>{t("review.label")}</label>
                <input id={`${fid}-l`} type="text" value={b.number.label} maxLength={40} onChange={(e) => onChange({ number: { ...b.number!, label: e.target.value } })} />
              </div>
            </div>
          )}
          {b.diagram && (
            <div className="field">
              <label htmlFor={`${fid}-d`}>{t("review.steps")}</label>
              <textarea id={`${fid}-d`} rows={Math.min(5, b.diagram.nodes.length)} defaultValue={b.diagram.nodes.map((x) => x.label).join("\n")}
                onBlur={(e) => {
                  const labels = e.target.value.split("\n").map((l) => l.trim().slice(0, 28)).filter(Boolean).slice(0, 5);
                  if (labels.length >= 2) onChange({ diagram: { ...b.diagram!, nodes: labels.map((label, k) => ({ label, tag: b.diagram!.nodes[k]?.tag })) as NonNullable<Beat["diagram"]>["nodes"] } });
                }} />
            </div>
          )}
          <Picture b={b} onChange={onChange} />
          <div className="shot-actions">
            <button type="button" className="link-btn" disabled={i === 0} onClick={() => onMove(-1)}>{t("review.moveUp")}</button>
            <button type="button" className="link-btn" disabled={i === total - 1} onClick={() => onMove(1)}>{t("review.moveDown")}</button>
            <button type="button" className="link-btn danger" onClick={onRemove}>{t("review.remove")}</button>
            <button type="button" className="btn btn-secondary shot-done" onClick={onToggle}>{t("review.done")}</button>
          </div>
        </div>
      )}
    </li>
  );
}

const readable = (tag: string) => tag.replace(/_/g, " ");

function Picture({ b, onChange }: { b: Beat; onChange: (p: Partial<Beat>) => void }) {
  const { t } = useT();
  const id = useId();
  const path = b.photo?.upload_path;
  const thumb = path ? uploadUrl(path) : null;
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(f: File | undefined) {
    if (!f) return;
    if (!LOGO_TYPES.includes(f.type) || f.size > MAX_UPLOAD) { setError("create.logoTooBig"); return; }
    setBusy(true); setError(null);
    try { onChange({ photo: { upload_path: await uploadImage(f, "photo") } }); }
    catch { setError("create.logoTooBig"); }
    setBusy(false);
  }

  const drawings = [...(b.props ?? []).map((p) => p.tag), ...(b.diagram?.nodes ?? []).flatMap((x) => (x.tag ? [x.tag] : []))];
  return (
    <div className="field">
      <div className="picture">
        {thumb
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL of the user's own upload
          ? <img className="thumb" src={thumb} alt="" width={56} height={56} />
          : <span className="thumb" aria-hidden="true" />}
        <div>
          <span className="label" style={{ marginBottom: 0 }}>{t("review.picture")}</span>
          <span>{path ? t("review.picture.upload") : drawings.length ? t("review.drawings", { list: drawings.map(readable).join(", ") }) : b.number ? t("review.picture.number") : t("review.picture.presenter")}</span>
          <div className="picture-actions">
            <input id={`${id}-f`} className="visually-hidden" type="file" accept={LOGO_TYPES.join(",")} disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
            <label htmlFor={`${id}-f`} className="link-btn">{path ? t("review.changePhoto") : t("review.usePhoto")}</label>
            {path && <button type="button" className="link-btn" onClick={() => onChange({ photo: undefined })}>{t("review.useDrawing")}</button>}
          </div>
          {error && <p className="error-text">{t(error)}</p>}
        </div>
      </div>
    </div>
  );
}
