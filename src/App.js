import React, { useState, useEffect } from "react";
import "./App.css";
import { fetchDashboard } from "./api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Resumen from "./components/Resumen";
import Buques from "./components/Buques";
import Cargas from "./components/Cargas";
import Comparativo from "./components/Comparativo";
import Permisionarios from "./components/Permisionarios";
import Admin from "./components/Admin";
import Filtros from "./components/Filtros";

const MODULOS = [
  { id: "resumen",        label: "Resumen ejecutivo", icon: "⊞" },
  { id: "buques",         label: "Buques",             icon: "⛵" },
  { id: "cargas",         label: "Cargas",             icon: "📦" },
  { id: "comparativo",    label: "Comparativo",        icon: "📊" },
  { id: "permisionarios", label: "Permisionarios",     icon: "🏭" },
];

const FILTROS_INIT = { meses: [], operaciones: [], trafico: [], cargas: [], permisionario: "" };

// Qué filtros puede aplicar cada módulo sobre sus datos reales
const SOPORTE_MODULO = {
  resumen:        ["meses", "operaciones"],
  buques:         ["trafico"],
  cargas:         ["meses", "operaciones", "cargas"],
  comparativo:    ["meses"],
  permisionarios: ["meses", "permisionario"],
};

// Devuelve los filtros activos que el módulo NO puede aplicar
function filtrosIncompatibles(pagina, filtros) {
  const soportados = SOPORTE_MODULO[pagina] || [];
  const incomp = [];
  if (filtros.permisionario && !soportados.includes("permisionario"))
    incomp.push({ tipo: "permisionario", label: filtros.permisionario });
  if (filtros.meses?.length > 0 && !soportados.includes("meses"))
    incomp.push({ tipo: "meses", label: `Período: ${filtros.meses.join(", ")}` });
  if (filtros.operaciones?.length > 0 && !soportados.includes("operaciones"))
    incomp.push({ tipo: "operaciones", label: `Operación: ${filtros.operaciones.join(", ")}` });
  if (filtros.trafico?.length > 0 && !soportados.includes("trafico"))
    incomp.push({ tipo: "trafico", label: `Tráfico: ${filtros.trafico.join(", ")}` });
  if (filtros.cargas?.length > 0 && !soportados.includes("cargas"))
    incomp.push({ tipo: "cargas", label: `Tipo de carga: ${filtros.cargas.join(", ")}` });
  return incomp;
}

function ModuloNoSoporta({ incompatibles }) {
  const hayPermisionario = incompatibles.some(f => f.tipo === "permisionario");
  return (
    <div style={{ textAlign: "center", padding: "44px 16px" }}>
      <div style={{ fontSize: 26, color: "#ddd", marginBottom: 14, letterSpacing: 4 }}>— —</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 12 }}>
        Este módulo no aplica los filtros activos
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 18 }}>
        {incompatibles.map((f, i) => (
          <span key={i} style={{
            fontSize: 11, background: "#f5f7fa",
            border: "0.5px solid #e0e0e0", borderRadius: 6,
            padding: "4px 12px", color: "#777",
          }}>
            {f.label}
          </span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#bbb", lineHeight: 1.7, maxWidth: 230, margin: "0 auto" }}>
        {hayPermisionario
          ? <>Ir al módulo <strong style={{ color: "#999" }}>Permisionarios</strong> para ver el desglose por empresa.</>
          : "Quitá el filtro incompatible o navegá a un módulo que lo soporte."}
      </div>
    </div>
  );
}

function AppContent() {
  const { auth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pagina, setPagina]     = useState("resumen");
  const [datos, setDatos]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [filtros, setFiltros]   = useState(FILTROS_INIT);

  useEffect(() => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    fetchDashboard()
      .then(d => { setDatos(d); setLoading(false); })
      .catch(err => {
        if (err.status === 401) { logout(); return; }
        setError(
          err.name === "AbortError"
            ? "El servidor tardó demasiado. Recargá la página."
            : err.message || "No se pudo conectar con el servidor."
        );
        setLoading(false);
      });
  }, [auth]);

  if (!auth) return <Login />;

  function navegar(id) { setPagina(id); setMenuOpen(false); }

  const periodo = (() => {
    const meses = datos?.resumen?.evolucion_mensual;
    if (!meses?.length) return "—";
    const primero = meses[0]?.mes;
    const ultimo  = meses[meses.length - 1]?.mes;
    const año = new Date().getFullYear();
    return primero === ultimo ? `${primero} ${año}` : `${primero}–${ultimo} ${año}`;
  })();

  const mesesDisponibles  = datos?.resumen?.evolucion_mensual?.map(r => r.mes) || [];
  const permisDisponibles = datos?.permisionarios?.ranking_anual?.map(p => p.empresa) || [];
  const enModulo          = pagina !== "config";

  const hayFiltros = !!(
    filtros.permisionario ||
    filtros.meses.length > 0 ||
    filtros.operaciones.length > 0 ||
    filtros.trafico.length > 0 ||
    filtros.cargas.length > 0
  );
  const incompatibles = enModulo ? filtrosIncompatibles(pagina, filtros) : [];

  return (
    <div className="shell">
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">☰</button>
          <img src="/logo-consorcio.jpg" alt="Consorcio de Gestión del Puerto de Dock Sud"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="logo-app">Data Port</span>
            <span className="logo-sub">Puerto de Dock Sud</span>
          </div>
        </div>
        <span className="period-badge">{periodo}</span>
      </div>

      <div className="layout">
        <div className={`overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

        <div className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid #e0e0e0", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo-consorcio.jpg" alt="Logo"
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1A4F8A" }}>Data Port</div>
              <div style={{ fontSize: 10, color: "#888" }}>{auth.nombre || auth.role}</div>
            </div>
          </div>
          <div style={{ paddingTop: 8, flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="nav-section">Módulos</div>
            {MODULOS.map(m => (
              <div key={m.id} className={`nav-item ${pagina === m.id ? "active" : ""}`} onClick={() => navegar(m.id)}>
                <span>{m.icon}</span>{m.label}
              </div>
            ))}
            <div className="nav-divider" />
            <div className="nav-section">Sistema</div>
            {auth.role === "admin" && (
              <div className={`nav-item ${pagina === "config" ? "active" : ""}`} onClick={() => navegar("config")}>
                <span>⚙</span> Configuración
              </div>
            )}
            <div className="nav-item" onClick={logout}>
              <span>↩</span> Cerrar sesión
            </div>
          </div>
        </div>

        <div className="content">
          {loading && <div className="loading">Cargando datos del puerto...</div>}
          {error   && <div className="error">{error}</div>}

          {!loading && !error && datos && enModulo && (
            <>
              <Filtros
                meses={mesesDisponibles}
                permisionarios={permisDisponibles}
                onChange={setFiltros}
              />

              {hayFiltros && (
                <div style={{
                  background: "#EBF4FB", borderRadius: 8, padding: "8px 12px",
                  marginBottom: 12, fontSize: 11, color: "#1A4F8A",
                  borderLeft: "3px solid #1E7BC4",
                  display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
                }}>
                  <span style={{ fontWeight: 600 }}>Vista filtrada:</span>
                  {filtros.permisionario && <span><strong>{filtros.permisionario}</strong></span>}
                  {filtros.meses.length > 0 && <span>{filtros.meses.join(" · ")}</span>}
                  {filtros.operaciones.length > 0 && <span>{filtros.operaciones.join(" · ")}</span>}
                  {filtros.trafico.length > 0 && <span>{filtros.trafico.join(" · ")}</span>}
                  {filtros.cargas.length > 0 && <span>{filtros.cargas.join(" · ")}</span>}
                </div>
              )}

              {incompatibles.length > 0
                ? <ModuloNoSoporta incompatibles={incompatibles} />
                : (
                  <>
                    {pagina === "resumen"        && <Resumen        data={datos.resumen}        filtros={filtros} />}
                    {pagina === "buques"         && <Buques         data={datos.buques}         filtros={filtros} />}
                    {pagina === "cargas"         && <Cargas         data={datos.cargas}         filtros={filtros} />}
                    {pagina === "comparativo"    && <Comparativo    data={datos.comparativo}    filtros={filtros} />}
                    {pagina === "permisionarios" && <Permisionarios data={datos.permisionarios} filtros={filtros} />}
                  </>
                )
              }
            </>
          )}

          {pagina === "config" && auth.role === "admin" && <Admin />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
