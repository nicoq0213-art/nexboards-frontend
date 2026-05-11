import React, { useState } from "react";
import { loginAPI } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login }  = useAuth();
  const [user, setUser]       = useState("");
  const [pass, setPass]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !pass) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loginAPI(user.trim(), pass);
      login(data.access_token, data.role, data.nombre);
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <img src="/logo-consorcio.jpg" alt="Puerto de Dock Sud" className="login-logo" />
        <div className="login-title">Data Port</div>
        <div className="login-sub">Puerto de Dock Sud</div>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="login-input"
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoCapitalize="none"
            autoComplete="username"
            disabled={loading}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <div className="login-error">{error}</div>}
          <button
            className="login-btn"
            type="submit"
            disabled={loading || !user || !pass}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
