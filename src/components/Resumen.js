import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function fmt(n, tipo) {
  if (!n && n !== 0) return "0";
  if (tipo === "entero") return Math.round(n).toLocaleString("es-AR");
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(0) + "k";
  return Math.round(n).toLocaleString("es-AR");
}

function Var({ val }) {
  if (!val && val !== 0) return null;
  const pos = val >= 0;
  return (
    <div className={`kpi-var ${pos ? "up" : "down"}`}>
      {pos ? "▲" : "▼"} {Math.abs(val).toFixed(1)}% vs año ant.
    </div>
  );
}

const OPS = [
  { key: "importacion", label: "Importación" },
  { key: "exportacion", label: "Exportación" },
  { key: "removido",    label: "Removido"    },
];

export default function Resumen({ data, filtros = {} }) {
  if (!data) return <div className="loading">Cargando resumen...</div>;

  const { mercaderias, contenedores, navegacion, evolucion_mensual } = data;

  const mesesFiltro = filtros.meses       || [];
  const operFiltro  = filtros.operaciones  || [];

  // Filtrar meses
  const evolucion = (evolucion_mensual || []).filter(r =>
    mesesFiltro.length === 0 || mesesFiltro.includes(r.mes)
  );

  // Detectar si el backend envía breakdown por operación en cada mes
  const hasBreakdown = evolucion.length > 0 && evolucion[0].importacion !== undefined;

  // Ops a mostrar según filtro
  const opsVisible = operFiltro.length === 0 ? OPS : OPS.filter(op => operFiltro.includes(op.label));

  // Valores por operación: desde meses filtrados si hay breakdown, si no desde totales anuales
  const opValues = hasBreakdown
    ? {
        importacion: evolucion.reduce((s, r) => s + (Number(r.importacion) || 0), 0),
        exportacion: evolucion.reduce((s, r) => s + (Number(r.exportacion) || 0), 0),
        removido:    evolucion.reduce((s, r) => s + (Number(r.removido)    || 0), 0),
      }
    : {
        importacion: mercaderias?.importacion || 0,
        exportacion: mercaderias?.exportacion || 0,
        removido:    mercaderias?.removido    || 0,
      };

  // Total: suma de las ops seleccionadas
  const totalMostrar = opsVisible.reduce((s, op) => s + (Number(opValues[op.key]) || 0), 0)
    || (mesesFiltro.length > 0
        ? evolucion.reduce((s, r) => s + (Number(r.toneladas) || 0), 0)
        : mercaderias?.total || 0);

  const labelTotal = operFiltro.length > 0
    ? opsVisible.map(o => o.label).join(" + ")
    : (mesesFiltro.length > 0 ? "Total período" : "Total acumulado");

  // Gráfico: suma de ops seleccionadas por mes
  const chartValues = evolucion.map(r => {
    if (hasBreakdown && operFiltro.length > 0) {
      return Math.round(opsVisible.reduce((s, op) => s + (Number(r[op.key]) || 0), 0) / 1000);
    }
    return Math.round((Number(r.toneladas) || 0) / 1000);
  });

  const chartData = {
    labels: evolucion.map(r => r.mes),
    datasets: [{
      data: chartValues,
      backgroundColor: "#185FA5",
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}k tn` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" } },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false } },
    },
  };

  return (
    <div>
      <div className="sec">Mercaderías</div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">{labelTotal}</div>
          <div className="kpi-value">{fmt(totalMostrar)}</div>
          <div className="kpi-unit">toneladas</div>
          {operFiltro.length === 0 && mesesFiltro.length === 0 && <Var val={mercaderias?.var_pct} />}
        </div>
        {opsVisible.map(op => (
          <div className="kpi-card" key={op.key}>
            <div className="kpi-label">{op.label}</div>
            <div className="kpi-value">{fmt(opValues[op.key])}</div>
            <div className="kpi-unit">toneladas</div>
          </div>
        ))}
      </div>

      <div className="divider" />
      <div className="chart-box">
        <div className="chart-title">
          {operFiltro.length > 0
            ? `${opsVisible.map(o => o.label).join(" + ")} — toneladas por mes`
            : "Toneladas totales por mes"}
        </div>
        {evolucion.length > 0
          ? <Bar data={chartData} options={chartOptions} height={160} />
          : <div className="loading">Sin datos para el período seleccionado.</div>}
      </div>

      <div className="divider" />
      <div className="sec">Contenedores</div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total contenedores</div>
          <div className="kpi-value">{fmt(contenedores?.total_contenedores, "entero")}</div>
          <div className="kpi-unit">unidades</div>
          <Var val={contenedores?.var_pct_teus} />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">TEUs</div>
          <div className="kpi-value">{fmt(contenedores?.teus, "entero")}</div>
          <div className="kpi-unit">unidades</div>
        </div>
      </div>

      <div className="divider" />
      <div className="sec">Navegación</div>
      <div className="pill-row">
        <div className="pill">
          <div className="pill-num" style={{ color: "#185FA5" }}>
            {Math.round(navegacion?.total_buques || 0).toLocaleString("es-AR")}
          </div>
          <div className="pill-lbl">Total buques</div>
        </div>
        <div className="pill">
          <div className="pill-num">{fmt(navegacion?.total_trn)}</div>
          <div className="pill-lbl">TRN total</div>
        </div>
      </div>
      <div className="kpi-grid">
        <div className="kpi-card kpi-full">
          <div className="kpi-label">Variación buques vs año anterior</div>
          <Var val={navegacion?.var_pct_bq} />
        </div>
      </div>
    </div>
  );
}
