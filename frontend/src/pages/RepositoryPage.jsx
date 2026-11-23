import RepositoryUploader from '../components/RepositoryUploader';
import AnalysisDashboard from '../components/AnalysisDashboard';
import { useAnalysis } from '../hooks/useAnalysis';

export default function RepositoryPage() {
  const { loading, error, analysis, run } = useAnalysis();

  return (
    <div>
      <RepositoryUploader onUpload={run} loading={loading} error={error} />
      <AnalysisDashboard analysis={analysis} />
    </div>
  );
}