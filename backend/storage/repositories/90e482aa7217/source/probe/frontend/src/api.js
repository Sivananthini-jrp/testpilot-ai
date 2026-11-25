const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function call(path, options) {
  const res = await fetch(BASE + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "The request failed.");
  return data;
}

export const startScan = (body) =>
  call("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const getJob = (id) => call(`/api/jobs/${id}`);
