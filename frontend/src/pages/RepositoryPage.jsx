import { useState, useEffect } from 'react';
import RepositoryUploader from '../components/RepositoryUploader';
import AnalysisDashboard from '../components/AnalysisDashboard';
import { useAnalysis } from '../hooks/useAnalysis';

export default function RepositoryPage() {
  const { loading, error, analysis, run } = useAnalysis();
  const [pastRepos, setPastRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    fetch('https://testpilot-ai-qhv5.onrender.com/repositories/list')
      .then(res => res.json())
      .then(data => setPastRepos(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Past Repositories Dropdown */}
      <div className="bg-dark-panel p-6 rounded-2xl mb-8 border border-dark-border max-w-2xl mx-auto">
        <label className="block text-sm font-medium text-gray-400 mb-2">Select a previously analyzed repository</label>
        <select 
          onChange={(e) => {
            const repo = pastRepos.find(r => r.repo_id === e.target.value);
            setSelectedRepo(repo);
            // You'd need to fetch the specific analysis here
            // For now, it just shows you the repos exist
          }}
          className="w-full bg-[#0f1115] border border-dark-border text-white rounded-lg p-3"
        >
          <option value="">-- Choose a repo --</option>
          {pastRepos.map(r => (
            <option key={r.repo_id} value={r.repo_id}>{r.repo_id} ({r.project_types.join(', ')})</option>
          ))}
        </select>
      </div>

      <RepositoryUploader onUpload={run} loading={loading} error={error} />
      <AnalysisDashboard analysis={analysis || selectedRepo} />
    </div>
  );
}