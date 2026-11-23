import { useState } from "react";

const TABS = ["Evidence", "Root cause", "Suggested patch", "Regression test"];

export default function Finding({ f }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [review, setReview] = useState(null); // "review" | "reject" | null
  const [copied, setCopied] = useState(false);
  const conf = f.confidence != null ? ` Confidence ${Math.round(f.confidence * 100)}%.` : "";
  const toggle = (v) => setReview(review === v ? null : v);

  return (
    <article className={`case ${f.severity}`}>
      <button className="head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="sev" />
        <span className="t">
          <b>{f.title}</b>
          <small>{f.file}:{f.line} · {f.category}</small>
        </span>
        <span className="occ">{f.occurrences} failing input{f.occurrences > 1 ? "s" : ""}</span>
        <span className="chip">{f.severity}</span>
      </button>
      {open && (
        <div className="body">
          <div className="tabs" role="tablist">
            {TABS.map((t, i) => (
              <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{t}</button>
            ))}
          </div>
          {tab === 0 && <pre>{f.evidence}</pre>}
          {tab === 1 && <p>{f.root_cause}{conf}</p>}
          {tab === 2 && (f.patch ? (
            <>
              <pre>{f.patch}</pre>
              <div className="row">
                <button aria-pressed={review === "review"} onClick={() => toggle("review")}>Mark for review</button>
                <button aria-pressed={review === "reject"} onClick={() => toggle("reject")}>Reject</button>
              </div>
            </>
          ) : (
            <p className="note">No patch yet. Add ANTHROPIC_API_KEY to the backend to get proposed fixes. Patches stay suggestions until you review them.</p>
          ))}
          {tab === 3 && (
            <>
              <pre>{f.regression_test}</pre>
              <div className="row">
                <button onClick={() => { navigator.clipboard.writeText(f.regression_test); setCopied(true); }}>{copied ? "Copied" : "Copy test"}</button>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}
