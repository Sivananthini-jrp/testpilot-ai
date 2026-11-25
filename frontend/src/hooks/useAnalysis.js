
import { useCallback, useState } from 'react';
import { uploadRepository } from '../api/client';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (file) => {
    if (!file) {
      setError('Please select a repository file.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadRepository(file);
      return data;
    } catch (err) {
      console.error('Repository analysis failed:', err);

      setError(
        err.message || 'Repository analysis failed.'
      );

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    run
  };
}
