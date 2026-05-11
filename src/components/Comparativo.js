import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return Math.round(n).toLocaleString("es-AR");
  return Math.round(n).toLocaleString("es-AR");
}

export default function Comparativo({ data }) {
  if (!data) return <div className="loading">Cargando comparativo...</div>;

  const { por_mes, totales } = data;

  const labels = (por_mes || []).map(r => r.mes);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Año anterior",
        data: (por_mes || []).map(r => Math.round((r.merc_ant || 0) / 1000)),
        borderColor: "#B5D4F4", backgroundColor: "transparent",
        borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#B5D4F4", tension: 0.3
      },
      {
        label: "Año actual",
        data: (por_mes || []).map(r => Math.round((r.merc_act || 0) / 1000)),
        borderColor: "#185FA5", backgroundColor: "rgba(24,95,165,0.06)",
        fill: true, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#185FA5", tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 10 }, color: "#666", boxWidth: 16, padding: 10 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}k tn` } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" } },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false } }
    }
  };

  const maxMerc = Math.max(totales?.mercaderias?.anterior || 1, totales?.mercaderias?.actual || 1);
  const maxTeus = Math.max(totales?.teus?.anterior || 1, totales?.teus?.actual || 1);
  const maxBq   = Math.max(totales?.buques?.anterior || 1, totales?.buques?.actual || 1);

  return (
    <div>
      <div className="sec">Año anterior vs año actual</div>
      <div className="chart-box">
        <div className="chart-title">Toneladas mensuales comparadas</div>
        <Line data={chartData} options={chartOptions} height={180} />
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">Mercaderías totales</div>
        <div className="cmp-bar-wrap">
          <div className="cmp-bar-line">
            <span className="cmp-year">Ant.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.mercaderias?.anterior / maxMerc * 100)}%`, background: "#B5D4F4" }} /></div>
            <span className="cmp-val">{fmt(totales?.mercaderias?.anterior)} tn</span>
          </div>
          <div className="cmp-bar-line">
            <span className="cmp-year">Act.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.mercaderias?.actual / maxMerc * 100)}%`, background: "#185FA5" }} /></div>
            <span className="cmp-val">{fmt(totales?.mercaderias?.actual)} tn</span>
          </div>
        </div>
        <div className={`cmp-var ${totales?.mercaderias?.var_pct >= 0 ? "up" : "down"}`}>
          {totales?.mercaderias?.var_pct >= 0 ? "▲" : "▼"} {Math.abs(totales?.mercaderias?.var_pct || 0).toFixed(1)}%
        </div>
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">TEUs</div>
        <div className="cmp-bar-wrap">
          <div className="cmp-bar-line">
            <span className="cmp-year">Ant.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.teus?.anterior / maxTeus * 100)}%`, background: "#B5D4F4" }} /></div>
            <span className="cmp-val">{fmt(totales?.teus?.anterior)}</span>
          </div>
          <div className="cmp-bar-line">
            <span className="cmp-year">Act.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.teus?.actual / maxTeus * 100)}%`, background: "#185FA5" }} /></div>
            <span className="cmp-val">{fmt(totales?.teus?.actual)}</span>
          </div>
        </div>
        <div className={`cmp-var ${totales?.teus?.var_pct >= 0 ? "up" : "down"}`}>
          {totales?.teus?.var_pct >= 0 ? "▲" : "▼"} {Math.abs(totales?.teus?.var_pct || 0).toFixed(1)}%
        </div>
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">Buques totales</div>
        <div className="cmp-bar-wrap">
          <div className="cmp-bar-line">
            <span className="cmp-year">Ant.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.buques?.anterior / maxBq * 100)}%`, background: "#B5D4F4" }} /></div>
            <span className="cmp-val">{fmt(totales?.buques?.anterior)}</span>
          </div>
          <div className="cmp-bar-line">
            <span className="cmp-year">Act.</span>
            <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(totales?.buques?.actual / maxBq * 100)}%`, background: "#185FA5" }} /></div>
            <span className="cmp-val">{fmt(totales?.buques?.actual)}</span>
          </div>
        </div>
        <div className={`cmp-var ${totales?.buques?.var_pct >= 0 ? "up" : "down"}`}>
          {totales?.buques?.var_pct >= 0 ? "▲" : "▼"} {Math.abs(totales?.buques?.var_pct || 0).toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
