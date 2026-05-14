import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token  = localStorage.getItem("nb_token");
    const role   = localStorage.getItem("nb_role");
    const nombre = localStorage.getItem("nb_nombre");
    return token ? { token, role, nombre } : null;
  });

  function login(token, role, nombre) {
    localStorage.setItem("nb_token",  token);
    localStorage.setItem("nb_role",   role);
    localStorage.setItem("nb_nombre", nombre);
    setAuth({ token, role, nombre });
  }

  function logout() {
    localStorage.removeItem("nb_token");
    localStorage.removeItem("nb_role");
    localStorage.removeItem("nb_nombre");
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
