import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../api/client";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access") || "");
  const [user, setUser]   = useState(() => {
    const u = localStorage.getItem("username");
    return u ? {
      username: u,
      email: localStorage.getItem("email") || "",
      is_staff: localStorage.getItem("is_staff") === "true"
    } : null;
  });

  // Cargar usuario
  useEffect(() => {
    if (!token) return;
    apiGet("/api/auth/me/", token)
      .then((me) => {
        setUser({ username: me.username, email: me.email, is_staff: !!me.is_staff });
        localStorage.setItem("username", me.username);
        localStorage.setItem("email", me.email);
        localStorage.setItem("is_staff", (!!me.is_staff).toString());
      })
      .catch(() => logout());
  }, [token]);

  const login = async (email, access, refresh) => {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    setToken(access);
    // Perfil
    const me = await apiGet("/api/auth/me/", access);
    setUser({ username: me.username, email: me.email, is_staff: !!me.is_staff });
    localStorage.setItem("username", me.username);
    localStorage.setItem("email", me.email);
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) await apiPost("/api/auth/logout/", { refresh }, token);
    } catch {}
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("is_staff");
    setUser(null);
    setToken("");
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
