export async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('rg_token');
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
const pad = (n) => String(n).padStart(2, '0');
export const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => fmt(new Date());
export const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return fmt(d); };
// inclusive day count, 0 if dates are invalid
export const daysBetween = (a, b) => (a && b && b >= a ? Math.round((Date.parse(b) - Date.parse(a)) / 864e5) + 1 : 0);
export const niceDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
