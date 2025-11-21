import { createContext, useContext, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access") || "");
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("username");
    return u ? { username: u } : null;
  });

  const login = (username, access, refresh) => {
    localStorage.setItem("access", access);
    if (refresh) localStorage.setItem("refresh", refresh);
    localStorage.setItem("username", username);
    setUser({ username });
    setToken(access);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
    setToken("");
  };

  return (
    <AuthCtx.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
