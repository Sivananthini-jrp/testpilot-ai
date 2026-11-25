import { useEffect, useState } from 'react';
import { BASE } from '../api/client';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/dashboard/reports`)
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-gray-400 p-8">Loading test reports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Test Reports</h1>
      
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg">
        {reports.length === 0 ? (
          <p className="text-gray-400 text-sm m-0">
            No test reports found. Run a test in the repository page to generate one.
          </p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-4">
            {reports.map(r => (
              <li key={r.id} className="border-b border-dark-border pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <strong className="text-sm text-gray-200">
                      {r.test_name || r.function_name}()
                    </strong>
                    <span className="text-xs text-gray-500 ml-2">
                      in repo <span className="font-mono text-blue-400">{r.repo_id}</span>
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                    ${r.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {r.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                
                <pre className="m-0 p-4 bg-[#0f1115] rounded-lg text-xs text-gray-400 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto border border-dark-border">
                  {r.stdout || r.stderr || 'No output recorded.'}
                </pre>
                
                <div className="text-[10px] text-gray-500 mt-2">
                  Run at: {new Date(r.timestamp).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}