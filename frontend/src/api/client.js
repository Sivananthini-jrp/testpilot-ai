// frontend/src/api/client.js
export const BASE = 'https://testpilot-ai-qhv5.onrender.com';

export async function uploadRepository(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/repositories/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
  return res.json();
}