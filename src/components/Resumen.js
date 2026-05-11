import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(n, tipo) {
  if (!n && n !== 0) return "0";
  if (tipo === "entero") return Math.round(n).toLocaleString("es-AR");
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
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

export default function Resumen({ data }) {
  if (!data) return <div className="loading">Cargando resumen...</div>;

  const { mercaderias, contenedores, navegacion, evolucion_mensual } = data;

  const labels = evolucion_mensual
    ? evolucion_mensual.map(r => r.mes)
    : [];
  const valores = evolucion_mensual
    ? evolucion_mensual.map(r => Math.round((r.toneladas || 0) / 1000))
    : [];

  const chartData = {
    labels,
    datasets: [{
      data: valores,
      backgroundColor: "#185FA5",
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y}k tn` } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" } },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false } }
    }
  };

  return (
    <div>
      <div className="sec">Mercaderías</div>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total acumulado</div>
          <div className="kpi-value">{fmt(mercaderias?.total)}</div>
          <div className="kpi-unit">toneladas</div>
          <Var val={mercaderias?.var_pct} />
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Importación</div>
          <div className="kpi-value">{fmt(mercaderias?.importacion)}</div>
          <div className="kpi-unit">toneladas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Exportación</div>
          <div className="kpi-value">{fmt(mercaderias?.exportacion)}</div>
          <div className="kpi-unit">toneladas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Removido</div>
          <div className="kpi-value">{fmt(mercaderias?.removido)}</div>
          <div className="kpi-unit">toneladas</div>
        </div>
      </div>

      <div className="divider" />
      <div className="chart-box">
        <div className="chart-title">Toneladas totales por mes</div>
        <Bar data={chartData} options={chartOptions} height={160} />
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
