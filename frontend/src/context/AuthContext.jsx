import { createContext, useContext, useState, useEffect } from "react";
import { apiPost, apiGet } from "../api/client";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("gymshop_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiGet("/api/auth/me/", token) 
        .then(setUser)
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  async function login(email, password) {
    try {
      const resp = await apiPost("/api/auth/token/", { 
          email: email, 
          password: password 
      });
      
      const newToken = resp.access || resp.token;
      
      if (!newToken) throw new Error("No se recibió el token");

      localStorage.setItem("gymshop_token", newToken);
      setToken(newToken);
    
      const userData = await apiGet("/api/auth/me/", newToken);
      setUser(userData);
      
    } catch (err) {
      console.error("Error en login:", err);
      throw new Error("Credenciales incorrectas");
    }
  }
  function logout() {
    localStorage.removeItem("gymshop_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);