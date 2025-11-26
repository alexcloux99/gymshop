import { createContext, useContext, useEffect, useState } from "react";
import { apiGet } from "../api/client";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access") || "");
  const [user, setUser] = useState(null);

  const bootstrap = async (tkn) => {
    try {
      const me = await apiGet("/api/auth/me/", tkn);
      setUser(me); 
    } catch {
      logout();
    }
  };

  useEffect(() => {
    if (token) bootstrap(token);
  }, [token]);

  const login = (email, access, refresh) => {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setToken("");
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
