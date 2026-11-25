import Finding from "./Finding.jsx";

const pct = (v) => (v == null ? "n/a" : `${v}%`);

export default function Report({ result: r }) {
  const s = r.summary;
  const mode = s.mode === "llm" ? "Tests written by an LLM" : "Heuristic mode: add ANTHROPIC_API_KEY to the backend for deeper tests, root-cause analysis and patches";
  return (
    <>
      <span className="mode">{mode}</span>
      <div className="stats">
        <div><b className={s.failed ? "bad" : "good"}>{s.passed}/{s.tests}</b><span>tests passed</span></div>
        <div><b className={s.bugs ? "bad" : "good"}>{s.bugs}</b><span>bug candidates</span></div>
        <div><b>{pct(s.coverage)}</b><span>line and branch coverage</span></div>
        <div><b>{pct(s.mutation)}</b><span>mutants caught</span></div>
      </div>

      <h2>Findings</h2>
      {s.test_issues > 0 && <p className="note">{s.test_issues} failure{s.test_issues > 1 ? "s were" : " was"} judged a flaw in the generated test and left out.</p>}
      {r.findings.length
        ? r.findings.map((f) => <Finding key={f.id} f={f} />)
        : <p className="note">No bugs found by this run. Passing generated tests do not prove the code is correct, so check the mutation score too.</p>}

      <h2 className="gap">Coverage by file</h2>
      {r.modules.map((m) => (
        <div className="cov" key={m.file}>
          <span title={m.file}>{m.file}</span>
          <i><s style={{ width: `${m.coverage || 0}%` }} /></i>
          <span>{pct(m.coverage)}</span>
        </div>
      ))}

      {r.mutation?.survivors.length > 0 && (
        <>
          <h2 className="gap">Mutants the tests missed</h2>
          <p className="note">Changing the operator at these lines did not fail any test, so the tests do not pin that behaviour down.</p>
          <pre>{r.mutation.survivors.map((x) => `${x.file}:${x.line}`).join("\n")}</pre>
        </>
      )}
    </>
  );
}
