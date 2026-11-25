
import { useEffect, useState } from 'react';

import RepositoryUploader from '../components/RepositoryUploader';
import AnalysisDashboard from '../components/AnalysisDashboard';

import { useAnalysis } from '../hooks/useAnalysis';
import { useAppContext } from '../context/AppContext';

import {
  getRepositories,
  getRepository
} from '../api/client';

export default function RepositoryPage() {
  const { loading, error, run } = useAnalysis();

  const {
    activeAnalysis,
    setActiveAnalysis,
    clearAnalysis
  } = useAppContext();

  const [pastRepos, setPastRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [repoError, setRepoError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadRepositories() {
      try {
        setReposLoading(true);
        setRepoError(null);

        const data = await getRepositories();

        if (mounted) {
          setPastRepos(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error('Repository list error:', err);

        if (mounted) {
          setPastRepos([]);
          setRepoError(err.message);
        }
      } finally {
        if (mounted) {
          setReposLoading(false);
        }
      }
    }

    loadRepositories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpload = async (file) => {
    const result = await run(file);

    if (result) {
      setActiveAnalysis(result);
    }
  };

  const handleSelectRepo = async (event) => {
    const repoId = event.target.value;

    if (!repoId) {
      clearAnalysis();
      return;
    }

    try {
      const data = await getRepository(repoId);
      setActiveAnalysis(data);
    } catch (err) {
      console.error('Repository loading error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">

      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">

        <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
          Load Previous Repository
        </label>

        {reposLoading ? (
          <p className="text-gray-400">
            Loading repositories...
          </p>
        ) : (
          <select
            onChange={handleSelectRepo}
            className="w-full bg-[#0f1115] border border-dark-border text-white rounded-lg p-3 outline-none focus:border-blue-500"
          >
            <option value="">
              -- Select a repository --
            </option>

            {pastRepos.map((repo) => (
              <option
                key={repo.repo_id}
                value={repo.repo_id}
              >
                {repo.repo_id} (
                  {(repo.project_types || []).join(', ')}
                )
              </option>
            ))}
          </select>
        )}

        {repoError && (
          <p className="text-red-400 text-sm mt-3">
            Could not load repository list: {repoError}
          </p>
        )}

        {activeAnalysis && (
          <button
            onClick={clearAnalysis}
            className="mt-4 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg"
          >
            Clear Workspace
          </button>
        )}

      </div>

      {!activeAnalysis && (
        <RepositoryUploader
          onUpload={handleUpload}
          loading={loading}
          error={error}
        />
      )}

      {activeAnalysis && (
        <AnalysisDashboard analysis={activeAnalysis} />
      )}

    </div>
  );
}
