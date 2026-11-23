import { useState } from 'react';
import StaticFindings from './StaticFindings';
import TestGenerationModal from './TestGenerationModal';

export default function AnalysisDashboard({ analysis }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!analysis) return null;

  const { repo_id, project_types, languages, python_files, total_functions, total_classes, files, high_complexity_functions, findings = [] } = analysis;

  const handleGenerate = async (file, functionName) => {
    setModalOpen(true);
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('http://localhost:8000/generate/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_id, file, function_name: functionName })
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      alert(err.message);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    // The Bento Grid
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto pb-10">
      
      {/* Repo Info */}
      <div className="col-span-1 md:col-span-2 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase m-0">Repository Details</h3>
          <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">{repo_id}</span>
        </div>
        <p className="text-sm text-gray-300 m-0"><strong>Type:</strong> {project_types.join(', ')}</p>
        <p className="text-sm text-gray-300 m-0 mt-1"><strong>Languages:</strong> {Object.keys(languages).join(', ')}</p>
      </div>

      {/* Metrics */}
      <MetricCard value={python_files} label="Python Files" icon="📄" color="text-blue-400" />
      <MetricCard value={total_functions} label="Functions" icon="ƒ" color="text-purple-400" />
      <MetricCard value={total_classes} label="Classes" icon="🏛️" color="text-emerald-400" />
      <MetricCard value={findings.length} label="Static Issues" icon="⚠️" color={findings.length > 0 ? "text-red-400" : "text-green-400"} />

      {/* Files & Functions */}
      <div className="col-span-1 md:col-span-2 md:row-span-2 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex flex-col">
        <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 m-0">Files & Functions</h3>
        <div className="overflow-y-auto pr-2 space-y-4 flex-1 max-h-[500px]">
          {files.map((f) => (
            <div key={f.file} className="border-b border-dark-border pb-4 last:border-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400 font-mono text-xs">{f.file}</span>
                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">{f.functions.length} fn</span>
              </div>
              {f.functions.length > 0 && (
                <div className="flex flex-col gap-2 ml-3 border-l border-dark-border pl-3">
                  {f.functions.map(fn => (
                    <div key={fn.name} className="flex justify-between items-center group">
                      <code className="text-xs text-gray-400 font-mono">def {fn.name}()</code>
                      <button 
                        onClick={() => handleGenerate(f.file, fn.name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-3 py-1 rounded-md text-[11px] font-bold border border-blue-500/30"
                      >
                        ✨ Generate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
        
        {/* Complexity */}
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex-1">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 m-0">High Complexity</h3>
          {high_complexity_functions.length === 0 ? (
            <p className="text-sm text-gray-500 m-0">No complex functions detected.</p>
          ) : (
            <ul className="space-y-2 m-0 p-0 list-none">
              {high_complexity_functions.slice(0, 5).map((fn, i) => (
                <li key={i} className="flex justify-between items-center border-b border-dark-border py-2 last:border-0 text-sm">
                  <span className="text-gray-300">{fn.name}</span>
                  <span className="bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full text-[10px] font-semibold">Score: {fn.complexity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Static Findings */}
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex-1">
          <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 m-0">Static Findings</h3>
          <div className="max-h-[200px] overflow-y-auto pr-2">
             <StaticFindings findings={findings} />
          </div>
        </div>

      </div>

      {modalOpen && (
        <TestGenerationModal 
          result={testResult} 
          loading={loading} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </div>
  );
}

function MetricCard({ value, label, icon, color }) {
  return (
    <div className="bg-dark-panel border border-dark-border rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:border-gray-600 transition-colors cursor-default">
      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-bold ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}