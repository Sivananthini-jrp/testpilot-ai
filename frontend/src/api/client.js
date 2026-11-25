export const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api';

export async function uploadRepository(file) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/repositories/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Upload failed (${res.status}): ${detail}`);
  }
  return res.json();
}