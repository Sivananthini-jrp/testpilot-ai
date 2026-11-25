import { useState } from 'react';

export default function TestGenerationModal({ result, loading, onClose, repoId }) {
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [mutating, setMutating] = useState(false);
  const [mutationResult, setMutationResult] = useState(null);

  if (!loading && !result) return null;

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);
    
    // PROOF: Check your browser console for this log!
    console.log("SENDING REPO ID TO BACKEND:", repoId);

    try {
      const res = await fetch('http://localhost:8000/execute/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          test_code: result.code, 
          source_code: result.source_code,
          repo_id: repoId, 
          function_name: result.function_name 
        })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#171a21] border border-[#2a3039] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2a3039] bg-white/5">
          <h3 className="m-0 text-white font-semibold">Generated Test: {result?.function_name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-2xl cursor-pointer">×</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p className="text-gray-400">AI is generating test...</p>
          ) : (
            <>
              <pre className="p-4 mb-6 m-0 rounded-lg bg-[#0f1115] text-[13px] text-gray-200 font-mono overflow-x-auto border border-[#2a3039]">
                <code>{result.code}</code>
              </pre>

              <div className="flex gap-3 mb-6">
                <button 
                  className={`flex-1 py-2.5 rounded-lg font-semibold text-white ${executing ? 'bg-blue-600/50' : 'bg-blue-600 hover:bg-blue-500'}`}
                  onClick={handleExecute} 
                  disabled={executing}
                >
                  {executing ? 'Running...' : '▶ Run Test'}
                </button>
                <button 
                  className={`flex-1 py-2.5 rounded-lg font-semibold border ${mutating ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'}`}
                  onClick={handleMutate} 
                  disabled={mutating}
                >
                  {mutating ? 'Evaluating...' : '🧬 Evaluate Strength'}
                </button>
              </div>

              {executionResult && (
                <div className={`p-4 rounded-lg border ${executionResult.passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <h4 className={`m-0 mb-2 font-semibold ${executionResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {executionResult.passed ? '✅ Tests Passed' : '❌ Tests Failed'}
                  </h4>
                  <pre className="m-0 text-xs text-gray-300 font-mono whitespace-pre-wrap">{executionResult.stdout}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}