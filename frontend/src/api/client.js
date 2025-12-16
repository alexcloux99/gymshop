export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

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
    return await doFetch(path, { headers, credentials: "omit" });
  } catch (err) {
    if (err.status === 401 && await tryRefresh()) {
      const t = localStorage.getItem("access") || "";
      return await doFetch(path, { headers: { ...headers, Authorization: `Bearer ${t}` }, credentials: "omit" });
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
    return await doFetch(path, { method: "POST", headers, body: JSON.stringify(body), credentials: "omit" });
  } catch (err) {
    if (err.status === 401 && await tryRefresh()) {
      const t = localStorage.getItem("access") || "";
      return await doFetch(path, { method: "POST", headers: { ...headers, Authorization: `Bearer ${t}` }, body: JSON.stringify(body), credentials: "omit" });
    }
    const txt = await err.text?.().catch(() => "") || "";
    throw new Error(txt || `${err.status} ${err.statusText || "Error"}`);
  }
}

async function tryRefresh() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;
  try {
    const data = await doFetch("/api/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (data?.access) {
      localStorage.setItem("access", data.access);
      return true;
    }
    return false;
  } catch {
    //  fuerzamos login
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    return false;
  }
}
