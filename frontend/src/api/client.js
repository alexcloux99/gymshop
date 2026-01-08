export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const absUrl = (url) =>
  !url ? "" : (url.startsWith("http") ? url : `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`);

async function doFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) throw res;
  const ctype = res.headers.get("content-type") || "";
  return ctype.includes("application/json") ? res.json() : res.text();
}

export async function apiGet(path, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    return await doFetch(path, { headers });
  } catch (err) {
    if (err.status === 401 && await tryRefresh()) {
      const t = localStorage.getItem("gymshop_token"); 
      return await doFetch(path, { headers: { ...headers, Authorization: `Bearer ${t}` } });
    }
    throw err;
  }
}

export async function apiPost(path, body, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    return await doFetch(path, { method: "POST", headers, body: JSON.stringify(body) });
  } catch (err) {
    if (err.status === 401 && await tryRefresh()) {
      const t = localStorage.getItem("gymshop_token"); 
      return await doFetch(path, { method: "POST", headers: { ...headers, Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
    }
    throw err;
  }
}

export async function apiPut(path, body, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    return await doFetch(path, { method: "PUT", headers, body: JSON.stringify(body) });
  } catch (err) {
    if (err.status === 401 && await tryRefresh()) {
      const t = localStorage.getItem("gymshop_token"); 
      return await doFetch(path, { method: "PUT", headers: { ...headers, Authorization: `Bearer ${t}` }, body: JSON.stringify(body) });
    }
    throw err;
  }
}

async function tryRefresh() {
  const refresh = localStorage.getItem("gymshop_refresh");
  if (!refresh) return false;
  try {
    const data = await doFetch("/api/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (data?.access) {
      localStorage.setItem("gymshop_token", data.access); 
      return true;
    }
    return false;
  } catch {
    localStorage.removeItem("gymshop_token");
    localStorage.removeItem("gymshop_refresh");
    return false;
  }
}