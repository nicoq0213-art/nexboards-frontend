import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token  = localStorage.getItem("dp_token");
    const role   = localStorage.getItem("dp_role");
    const nombre = localStorage.getItem("dp_nombre");
    return token ? { token, role, nombre } : null;
  });

  function login(token, role, nombre) {
    localStorage.setItem("dp_token",  token);
    localStorage.setItem("dp_role",   role);
    localStorage.setItem("dp_nombre", nombre);
    setAuth({ token, role, nombre });
  }

  function logout() {
    localStorage.removeItem("dp_token");
    localStorage.removeItem("dp_role");
    localStorage.removeItem("dp_nombre");
    setAuth(null);
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
