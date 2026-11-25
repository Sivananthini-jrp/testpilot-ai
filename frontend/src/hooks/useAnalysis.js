import { useCallback, useState } from 'react';
import { uploadRepository } from '../api/client';

export function useAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadRepository(file);
      return data; // <-- Return the data so RepositoryPage can use it
    } catch (e) {
      setError(e.message || 'Upload failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, run };
}