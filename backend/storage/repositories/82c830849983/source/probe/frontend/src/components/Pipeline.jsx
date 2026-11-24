export default function Pipeline({ stages = [], logs = [] }) {
  return (
    <>
      <ol className="pipe" aria-live="polite">
        {stages.map((s) => (
          <li key={s.key} className={s.state}>
            <span className="node" />
            {s.label}
            <small>{s.detail}</small>
          </li>
        ))}
      </ol>
      {logs.length > 0 && (
        <details>
          <summary>Agent log</summary>
          <pre>{logs.join("\n")}</pre>
        </details>
      )}
    </>
  );
}
