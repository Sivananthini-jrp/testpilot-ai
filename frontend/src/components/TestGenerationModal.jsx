import { useState } from 'react';

export default function TestGenerationModal({ result, loading, onClose }) {
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [mutating, setMutating] = useState(false);
  const [mutationResult, setMutationResult] = useState(null);

  if (!loading && !result) return null;

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await fetch('http://localhost:8000/execute/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_code: result.code, source_code: result.source_code })
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      alert("Execution failed: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleMutate = async () => {
    setMutating(true);
    setMutationResult(null);
    try {
      const res = await fetch('http://localhost:8000/evaluate/mutation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_code: result.code, source_code: result.source_code })
      });
      const data = await res.json();
      setMutationResult(data);
    } catch (err) {
      alert("Mutation testing failed: " + err.message);
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-dark-panel border border-dark-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-dark-border bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">✨</div>
            <div>
              <h3 className="m-0 text-white font-semibold">Generated Test</h3>
              <p className="m-0 text-xs text-gray-400 font-mono">{result?.function_name || '...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors text-3xl leading-none cursor-pointer">×</button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-10 text-gray-400">
              <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p>AI is generating tests...</p>
            </div>
          ) : (
            <>
              {/* Code Editor Window */}
              <div className="rounded-lg border border-dark-border bg-[#0f1115] overflow-hidden mb-6">
                <div className="flex items-center gap-4 px-4 py-2.5 bg-dark-panel border-b border-dark-border">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">test_generated.py</span>
                </div>
                <pre className="p-4 m-0 text-[13px] leading-relaxed text-gray-200 font-mono overflow-x-auto">
                  <code>{result.code}</code>
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button 
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-white transition-all flex justify-center items-center gap-2
                    ${executing ? 'bg-blue-600/50 cursor-wait' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'}`}
                  onClick={handleExecute} 
                  disabled={executing}
                >
                  {executing ? 'Running...' : '▶ Run Test'}
                </button>
                
                <button 
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all flex justify-center items-center gap-2 border
                    ${mutating ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 cursor-wait' : 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30'}`}
                  onClick={handleMutate} 
                  disabled={mutating}
                >
                  {mutating ? 'Evaluating...' : '🧬 Evaluate Strength'}
                </button>
              </div>

              {/* Execution Results Panel */}
              {executionResult && (
                <div className={`rounded-lg p-4 mb-4 border animate-in slide-in-from-bottom-2 duration-300
                  ${executionResult.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <h4 className={`m-0 mb-3 flex items-center gap-2 font-semibold ${executionResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {executionResult.passed ? '✅ Tests Passed Successfully' : '❌ Tests Failed'}
                  </h4>
                  <pre className="m-0 p-3 bg-black/30 rounded-md text-xs text-gray-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {executionResult.stdout}
                    {executionResult.stderr}
                  </pre>
                </div>
              )}

              {/* Mutation Score Panel */}
              {mutationResult && (
                <div className="rounded-lg p-4 border border-purple-500/20 bg-purple-500/10 animate-in slide-in-from-bottom-2 duration-300">
                  <h4 className="m-0 mb-3 flex items-center gap-2 font-semibold text-purple-400">
                    🧬 Mutation Score: {mutationResult.score.toFixed(1)}%
                  </h4>
                  
                  {mutationResult.error ? (
                    <p className="m-0 text-sm text-red-400"><strong>Engine Error:</strong> {mutationResult.error}</p>
                  ) : (
                    <>
                      <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden mb-3">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${mutationResult.score}%` }}
                        ></div>
                      </div>
                      <p className="m-0 text-sm text-gray-400">
                        Killed <strong className="text-white">{mutationResult.killed}</strong> out of {mutationResult.total} mutants. ({mutationResult.survived} survived)
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}