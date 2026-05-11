const BASE_URL = "https://web-production-93fa6.up.railway.app";

async function _get(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Error ${res.status}`);
    }
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export function fetchDashboard()      { return _get("/dashboard"); }
export function fetchResumen()        { return _get("/resumen"); }
export function fetchBuques()         { return _get("/buques"); }
export function fetchCargas()         { return _get("/cargas"); }
export function fetchComparativo()    { return _get("/comparativo"); }
export function fetchPermisionarios() { return _get("/permisionarios"); }
