import { useState, useEffect } from 'react';
import RepositoryUploader from '../components/RepositoryUploader';
import AnalysisDashboard from '../components/AnalysisDashboard';
import { useAnalysis } from '../hooks/useAnalysis';
import { useAppContext } from '../context/AppContext';

export default function RepositoryPage() {
  const { loading, error, run } = useAnalysis();
  const { activeAnalysis, setActiveAnalysis, clearAnalysis } = useAppContext();
  const [pastRepos, setPastRepos] = useState([]);

  // Fetch past repos on load
  useEffect(() => {
    fetch('http://localhost:8000/repositories/list')
      .then(res => res.json())
      .then(data => setPastRepos(data))
      .catch(console.error);
  }, []);

  // When a new file is uploaded, update the Context
  const handleUpload = async (file) => {
    const result = await run(file); // Assuming your hook returns the data
    if (result) {
      setActiveAnalysis(result);
    }
  };

  const handleSelectRepo = async (e) => {
    const repoId = e.target.value;
    if (!repoId) {
      clearAnalysis();
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/repositories/${repoId}`);
      if (!res.ok) throw new Error("Failed to load repo.");
      const data = await res.json();
      setActiveAnalysis(data);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Load Previous Repository</label>
          <select 
            onChange={handleSelectRepo}
            className="w-full bg-[#0f1115] border border-dark-border text-white rounded-lg p-3 outline-none focus:border-blue-500"
          >
            <option value="">-- Select a repository --</option>
            {pastRepos.map(r => (
              <option key={r.repo_id} value={r.repo_id}>
                {r.repo_id} ({r.project_types.join(', ')})
              </option>
            ))}
          </select>
        </div>
        
        {activeAnalysis && (
          <button 
            onClick={clearAnalysis}
            className="mt-6 md:mt-0 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Clear Workspace
          </button>
        )}
      </div>

      {/* Hide the uploader if a repo is currently loaded */}
      {!activeAnalysis && (
        <RepositoryUploader onUpload={handleUpload} loading={loading} error={error} />
      )}
      
      {/* Show the Bento Grid if a repo is loaded */}
      {activeAnalysis && <AnalysisDashboard analysis={activeAnalysis} />}
    </div>
  );
}