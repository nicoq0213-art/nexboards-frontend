import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchDashboard } from "./api";
import Resumen from "./components/Resumen";
import Buques from "./components/Buques";
import Cargas from "./components/Cargas";
import Comparativo from "./components/Comparativo";
import Permisionarios from "./components/Permisionarios";

const MODULOS = [
  { id: "resumen",        label: "Resumen ejecutivo",  icon: "⊞" },
  { id: "buques",         label: "Buques",              icon: "⛵" },
  { id: "cargas",         label: "Cargas",              icon: "📦" },
  { id: "comparativo",    label: "Comparativo",         icon: "📊" },
  { id: "permisionarios", label: "Permisionarios",      icon: "🏭" },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pagina, setPagina]     = useState("resumen");
  const [datos, setDatos]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchDashboard()
      .then(d => { setDatos(d); setLoading(false); })
      .catch(() => {
        setError("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.");
        setLoading(false);
      });
  }, []);

  function navegar(id) {
    setPagina(id);
    setMenuOpen(false);
  }

  const periodo = (() => {
    if (!datos) return "—";
    const meses = datos.resumen?.evolucion_mensual;
    if (!meses || meses.length === 0) return "—";
    const primero = meses[0]?.mes;
    const ultimo  = meses[meses.length - 1]?.mes;
    const año = new Date().getFullYear();
    return primero === ultimo ? `${primero} ${año}` : `${primero}–${ultimo} ${año}`;
  })();

  return (
    <div className="shell">
      {/* TOPBAR */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">☰</button>
          <img
            src="/logo-consorcio.jpg"
            alt="Consorcio de Gestión del Puerto de Dock Sud"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="logo-app">Data Port</span>
            <span className="logo-sub">Puerto de Dock Sud</span>
          </div>
        </div>
        <span className="period-badge">{periodo}</span>
      </div>

      <div className="layout">
        <div className={`overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

        {/* SIDEBAR */}
        <div className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid #e0e0e0", display: "flex", alignItems: "center", gap: 10 }}>
            <img
              src="/logo-consorcio.jpg"
              alt="Logo"
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1A4F8A" }}>Data Port</div>
              <div style={{ fontSize: 10, color: "#888" }}>Puerto de Dock Sud</div>
            </div>
          </div>
          <div style={{ paddingTop: 8 }}>
            <div className="nav-section">Módulos</div>
            {MODULOS.map(m => (
              <div
                key={m.id}
                className={`nav-item ${pagina === m.id ? "active" : ""}`}
                onClick={() => navegar(m.id)}
              >
                <span>{m.icon}</span>
                {m.label}
              </div>
            ))}
            <div className="nav-divider" />
            <div className="nav-section">Sistema</div>
            <div className="nav-item"><span>⚙</span> Configuración</div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {loading && <div className="loading">Cargando datos del puerto...</div>}
          {error   && <div className="error">{error}</div>}
          {!loading && !error && datos && (
            <>
              {pagina === "resumen"        && <Resumen        data={datos.resumen} />}
              {pagina === "buques"         && <Buques         data={datos.buques} />}
              {pagina === "cargas"         && <Cargas         data={datos.cargas} />}
              {pagina === "comparativo"    && <Comparativo    data={datos.comparativo} />}
              {pagina === "permisionarios" && <Permisionarios data={datos.permisionarios} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
