export default function StaticFindings({ findings }) {
  if (!findings || findings.length === 0) {
    return (
      <p className="text-sm text-green-400 m-0">No issues found. Clean code!</p>
    );
  }

  // Group findings by file
  const byFile = findings.reduce((acc, f) => {
    if (!acc[f.file]) acc[f.file] = [];
    acc[f.file].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(byFile).map(([file, items]) => (
        <div key={file} className="mb-4">
          <div className="text-blue-400 font-mono text-xs mb-2">{file}</div>
          <ul className="m-0 p-0 list-none space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-xs py-1.5 px-3 bg-white/5 rounded-md">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                  ${item.severity === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {item.tool}
                </span>
                <span className="text-gray-400 font-mono">Line {item.line}</span>
                <span className="text-gray-200 flex-1">{item.message}</span>
                <code className="bg-black/30 px-1.5 py-0.5 rounded text-yellow-300 text-[10px]">{item.code}</code>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}