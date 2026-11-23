import { useEffect, useState } from "react";
import { getJob, startScan } from "./api.js";
import Pipeline from "./components/Pipeline.jsx";
import Report from "./components/Report.jsx";

export default function App() {
  const [repo, setRepo] = useState("");
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const busy = starting || jobId !== null;

  async function start(body) {
    setError(null);
    setJob(null);
    setStarting(true);
    try {
      const { id } = await startScan(body);
      setJobId(id);
    } catch (e) {
      setError(e.message === "Failed to fetch" ? "Could not reach the API. If it is waking up on a free plan, wait a minute and try again." : e.message);
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    const tick = async () => {
      try {
        const j = await getJob(jobId);
        if (stopped) return;
        setJob(j);
        if (j.status === "done" || j.status === "error") {
          if (j.status === "error") setError(j.error);
          setJobId(null);
        }
      } catch (e) {
        if (!stopped && e.message !== "Failed to fetch") { setError(e.message); setJobId(null); }
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => { stopped = true; clearInterval(t); };
  }, [jobId]);

  const submit = (e) => {
    e.preventDefault();
    if (repo.trim()) start({ repo_url: repo.trim() });
  };

  return (
    <>
      <header className="top"><b>Probe</b><span>Reads your code, writes the tests, shows you where it breaks.</span></header>
      <div className="grid">
        <aside className="rail">
          <form onSubmit={submit}>
            <label htmlFor="repo">Public GitHub repository</label>
            <input id="repo" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/owner/repo" autoComplete="off" />
            <button className="go" disabled={busy || !repo.trim()}>Scan repository</button>
            <button className="ghost" type="button" disabled={busy} onClick={() => start({ demo: true })}>Try the demo project</button>
          </form>
          <Pipeline stages={job?.stages} logs={job?.logs} />
        </aside>
        <main className="main" aria-live="polite">
          {error && <div className="err"><b>Scan stopped.</b> {error}</div>}
          {!error && job?.status === "done" && <Report result={job.result} />}
          {!error && job?.status !== "done" && busy && <p className="note">Scan started. Progress is shown on the left.</p>}
          {!error && !busy && !job && (
            <div className="empty">
              <h1>Find out whether your code actually works.</h1>
              <p>Point Probe at a Python repository. It parses every function, generates unit, edge-case and property tests, runs them in a sandbox, and reports each failure with the evidence, a likely cause and a regression test.</p>
              <p>No repository handy? Run the demo project and see a report in under a minute.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
