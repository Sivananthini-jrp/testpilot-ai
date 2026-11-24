import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Pointing to the live Render backend
    fetch('https://testpilot-ai-qhv5.onrender.com/dashboard/reports')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(console.error);
  }, []);

  const passed = reports.filter(r => r.passed).length;
  const failed = reports.length - passed;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl">📊</div>
          <div>
            <div className="text-3xl font-bold text-white leading-none">{reports.length}</div>
            <div className="text-sm text-gray-400 mt-1 font-medium">Total Tests Run</div>
          </div>
        </div>

        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center text-2xl">✅</div>
          <div>
            <div className="text-3xl font-bold text-green-400 leading-none">{passed}</div>
            <div className="text-sm text-gray-400 mt-1 font-medium">Passed</div>
          </div>
        </div>

        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center text-2xl">❌</div>
          <div>
            <div className="text-3xl font-bold text-red-400 leading-none">{failed}</div>
            <div className="text-sm text-gray-400 mt-1 font-medium">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
}