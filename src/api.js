const BASE_URL = "https://web-production-93fa6.up.railway.app";

export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  return res.json();
}

export async function fetchResumen() {
  const res = await fetch(`${BASE_URL}/resumen`);
  return res.json();
}

export async function fetchBuques() {
  const res = await fetch(`${BASE_URL}/buques`);
  return res.json();
}

export async function fetchCargas() {
  const res = await fetch(`${BASE_URL}/cargas`);
  return res.json();
}

export async function fetchComparativo() {
  const res = await fetch(`${BASE_URL}/comparativo`);
  return res.json();
}

export async function fetchPermisionarios() {
  const res = await fetch(`${BASE_URL}/permisionarios`);
  return res.json();
}
