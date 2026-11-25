
export const BASE =
  'https://testpilot-ai-qhv5.onrender.com';

export async function apiFetch(endpoint, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    const response = await fetch(`${BASE}${endpoint}`, {
      ...options,
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function uploadRepository(file) {
  const formData = new FormData();

  formData.append('file', file);

  // Repository analysis can take longer than 30 seconds.
  const response = await apiFetch(
    '/repositories/upload',
    {
      method: 'POST',
      body: formData
    },
    300000
  );

  return response.json();
}

export async function getRepositories() {
  const response = await apiFetch(
    '/repositories/list',
    {},
    60000
  );

  return response.json();
}

export async function getRepository(repoId) {
  const response = await apiFetch(
    `/repositories/${encodeURIComponent(repoId)}`,
    {},
    60000
  );

  return response.json();
}

export async function getDashboardStats() {
  const response = await apiFetch(
    '/dashboard/stats',
    {},
    60000
  );

  return response.json();
}
