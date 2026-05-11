import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const NOMBRES = {
  "Aridos": "Áridos",
  "Siderurgico / carga general": "Siderúrgico / carga general",
  "Granel liquido": "Granel líquido",
  "Granel solido": "Granel sólido",
};
function corregir(nombre) { return NOMBRES[nombre] || nombre; }

function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(0) + "k";
  return Math.round(n).toLocaleString("es-AR");
}

const FORMA_MAP = {
  "Granel líquido": ["Granel liquido", "Granel líquido"],
  "Granel sólido":  ["Granel solido",  "Granel sólido"],
  "Contenerizado":  ["Contenerizado"],
  "Carga gral.":    ["Carga gral. no contenerizada"],
};

// Mapa operación → clave en por_forma
const OPER_TO_FORMA = {
  "Importación": "importacion",
  "Exportación": "exportacion",
  "Removido":    "removido",
};

export default function Cargas({ data, filtros = {} }) {
  if (!data) return <div className="loading">Cargando cargas...</div>;

  const { por_producto, evolucion_mensual, por_forma } = data;
  const mesesFiltro  = filtros.meses       || [];
  const operFiltro   = filtros.operaciones  || [];
  const cargasFiltro = filtros.cargas       || [];

  const evolucion = (evolucion_mensual || []).filter(r =>
    mesesFiltro.length === 0 || mesesFiltro.includes(r.mes)
  );

  const DATASETS = [
    { label: "Importación", key: "importacion", color: "#185FA5" },
    { label: "Exportación", key: "exportacion", color: "#85B7EB" },
    { label: "Removido",    key: "removido",    color: "#cce0f5" },
  ].filter(d => operFiltro.length === 0 || operFiltro.includes(d.label));

  const chartData = {
    labels: evolucion.map(r => r.mes),
    datasets: DATASETS.map(d => ({
      label: d.label,
      data: evolucion.map(r => Math.round((Number(r[d.key]) || 0) / 1000)),
      backgroundColor: d.color,
      borderRadius: 2,
      stack: "s",
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 10 }, color: "#666", boxWidth: 10, padding: 8 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}k tn` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" }, stacked: true },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false }, stacked: true },
    },
  };

  const maxProd = Math.max(...(por_producto?.map(p => p.toneladas) || [1]));

  function formaVisible(forma) {
    if (cargasFiltro.length === 0) return true;
    const formaCorr = corregir(forma);
    return cargasFiltro.some(f => {
      const aliases = FORMA_MAP[f] || [f];
      return aliases.some(a => formaCorr.toLowerCase().includes(a.toLowerCase()) || forma.toLowerCase().includes(a.toLowerCase()));
    });
  }

  // Secciones de por_forma a mostrar según filtro de operaciones
  const FORMA_LABEL = { importacion: "importación", exportacion: "exportación", removido: "removido" };
  const formasSections = operFiltro.length === 0
    ? ["importacion"]
    : operFiltro.map(o => OPER_TO_FORMA[o]).filter(Boolean);

  return (
    <div>
      <div className="sec">Por tipo de producto</div>
      {(por_producto || []).map((p, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-meta">
            <span>{corregir(p.producto)}</span>
            <span>{fmt(p.toneladas)} tn</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{
              width: `${Math.round(p.toneladas / maxProd * 100)}%`,
              background: p.toneladas / maxProd > 0.3 ? "#185FA5" : "#B5D4F4",
            }} />
          </div>
        </div>
      ))}

      <div className="divider" />
      <div className="chart-box">
        <div className="chart-title">Imp / Exp / Removido por mes</div>
        {evolucion.length > 0 && DATASETS.length > 0
          ? <Bar data={chartData} options={chartOptions} height={180} />
          : <div className="loading">Sin datos para los filtros seleccionados.</div>}
      </div>

      <div className="divider" />
      {formasSections.map(secKey => {
        const items = (por_forma?.[secKey] || []).filter(f => formaVisible(f.forma));
        if (items.length === 0) return null;
        return (
          <React.Fragment key={secKey}>
            <div className="sec">Por forma de presentación — {FORMA_LABEL[secKey]}</div>
            <div className="kpi-grid">
              {items.map((f, i) => (
                <div className="kpi-card" key={i}>
                  <div className="kpi-label">{corregir(f.forma)}</div>
                  <div className="kpi-value">{fmt(f.toneladas)}</div>
                  <div className="kpi-unit">toneladas</div>
                </div>
              ))}
            </div>
            <div className="divider" />
          </React.Fragment>
        );
      })}
    </div>
  );
}
