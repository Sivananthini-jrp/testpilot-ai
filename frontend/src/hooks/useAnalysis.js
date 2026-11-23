import { useCallback, useState } from 'react';
import { uploadRepository } from '../api/client';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const run = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const data = await uploadRepository(file);
      setAnalysis(data);
      return data;
    } catch (e) {
      setError(e.message || 'Upload failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, analysis, run };
}