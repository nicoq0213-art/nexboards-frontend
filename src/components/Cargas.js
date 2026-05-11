import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return Math.round(n).toLocaleString("es-AR");
}

// Mapa de corrección de tildes para nombres que vienen del backend
const NOMBRES = {
  "Aridos": "Áridos",
  "Siderurgico / carga general": "Siderúrgico / carga general",
  "Granel liquido": "Granel líquido",
  "Granel solido": "Granel sólido",
};
function corregir(nombre) {
  return NOMBRES[nombre] || nombre;
}

export default function Cargas({ data }) {
  if (!data) return <div className="loading">Cargando cargas...</div>;

  const { por_producto, evolucion_mensual, por_forma } = data;

  const maxProd = Math.max(...(por_producto?.map(p => p.toneladas) || [1]));

  const labels = (evolucion_mensual || []).map((_, i) => MESES[i] || "");
  const chartData = {
    labels,
    datasets: [
      {
        label: "Importación",
        data: (evolucion_mensual || []).map(r => Math.round((r.importacion || 0) / 1000)),
        backgroundColor: "#185FA5", borderRadius: 2, stack: "s"
      },
      {
        label: "Exportación",
        data: (evolucion_mensual || []).map(r => Math.round((r.exportacion || 0) / 1000)),
        backgroundColor: "#85B7EB", borderRadius: 2, stack: "s"
      },
      {
        label: "Removido",
        data: (evolucion_mensual || []).map(r => Math.round((r.removido || 0) / 1000)),
        backgroundColor: "#cce0f5", borderRadius: 2, stack: "s"
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 10 }, color: "#666", boxWidth: 10, padding: 8 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}k tn` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" }, stacked: true },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false }, stacked: true }
    }
  };

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
              background: p.toneladas / maxProd > 0.3 ? "#185FA5" : "#B5D4F4"
            }} />
          </div>
        </div>
      ))}

      <div className="divider" />
      <div className="chart-box">
        <div className="chart-title">Imp / Exp / Removido por mes</div>
        <Bar data={chartData} options={chartOptions} height={180} />
      </div>

      <div className="divider" />
      <div className="sec">Por forma de presentación — importación</div>
      <div className="kpi-grid">
        {(por_forma?.importacion || []).map((f, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-label">{corregir(f.forma)}</div>
            <div className="kpi-value">{fmt(f.toneladas)}</div>
            <div className="kpi-unit">toneladas</div>
          </div>
        ))}
      </div>
    </div>
  );
}
