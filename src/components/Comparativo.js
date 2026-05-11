import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000)    return Math.round(n).toLocaleString("es-AR");
  return Math.round(n).toLocaleString("es-AR");
}

function _safe(v) { return (v === null || v === undefined) ? 0 : Number(v) || 0; }
function _var(a, b) { return a > 0 ? ((b - a) / a * 100) : 0; }

export default function Comparativo({ data, filtros = {} }) {
  if (!data) return <div className="loading">Cargando comparativo...</div>;

  const { por_mes, totales } = data;
  const mesesFiltro = filtros.meses || [];

  const meses = (por_mes || []).filter(r =>
    mesesFiltro.length === 0 || mesesFiltro.includes(r.mes)
  );

  // Recompute totales from filtered months when month filter is active
  const hasMesFiltro = mesesFiltro.length > 0;
  const totalesEfectivos = (() => {
    if (!hasMesFiltro) return totales;
    const ma = meses.reduce((s, r) => s + _safe(r.merc_ant),    0);
    const mc = meses.reduce((s, r) => s + _safe(r.merc_act),    0);
    const ta = meses.reduce((s, r) => s + _safe(r.teus_ant),    0);
    const tc = meses.reduce((s, r) => s + _safe(r.teus_act),    0);
    const ba = meses.reduce((s, r) => s + _safe(r.buques_ant),  0);
    const bc = meses.reduce((s, r) => s + _safe(r.buques_act),  0);
    return {
      mercaderias: { anterior: ma, actual: mc, var_pct: _var(ma, mc) },
      teus:        { anterior: ta, actual: tc, var_pct: _var(ta, tc) },
      buques:      { anterior: ba, actual: bc, var_pct: _var(ba, bc) },
    };
  })();

  const chartData = {
    labels: meses.map(r => r.mes),
    datasets: [
      {
        label: "Año anterior",
        data: meses.map(r => Math.round(_safe(r.merc_ant) / 1000)),
        borderColor: "#B5D4F4", backgroundColor: "transparent",
        borderWidth: 2, pointRadius: 3, pointBackgroundColor: "#B5D4F4", tension: 0.3,
      },
      {
        label: "Año actual",
        data: meses.map(r => Math.round(_safe(r.merc_act) / 1000)),
        borderColor: "#185FA5", backgroundColor: "rgba(24,95,165,0.06)",
        fill: true, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#185FA5", tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 10 }, color: "#666", boxWidth: 16, padding: 10 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}k tn` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#aaa" } },
      y: { grid: { color: "#f0f0f0" }, ticks: { font: { size: 10 }, color: "#aaa", callback: v => `${v}k` }, border: { display: false } },
    },
  };

  const maxMerc = Math.max(_safe(totalesEfectivos?.mercaderias?.anterior), _safe(totalesEfectivos?.mercaderias?.actual), 1);
  const maxTeus = Math.max(_safe(totalesEfectivos?.teus?.anterior),        _safe(totalesEfectivos?.teus?.actual),        1);
  const maxBq   = Math.max(_safe(totalesEfectivos?.buques?.anterior),      _safe(totalesEfectivos?.buques?.actual),      1);

  function VarBar({ ant, act, max, sufijo, varPct }) {
    const pct = varPct !== undefined ? varPct : _var(_safe(ant), _safe(act));
    return (
      <div className="cmp-bar-wrap">
        <div className="cmp-bar-line">
          <span className="cmp-year">Ant.</span>
          <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(_safe(ant) / max * 100)}%`, background: "#B5D4F4" }} /></div>
          <span className="cmp-val">{fmt(ant)}{sufijo}</span>
        </div>
        <div className="cmp-bar-line">
          <span className="cmp-year">Act.</span>
          <div className="cmp-track"><div className="cmp-fill" style={{ width: `${Math.round(_safe(act) / max * 100)}%`, background: "#185FA5" }} /></div>
          <span className="cmp-val">{fmt(act)}{sufijo}</span>
        </div>
        <div className={`cmp-var ${pct >= 0 ? "up" : "down"}`}>
          {pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sec">Año anterior vs año actual</div>
      <div className="chart-box">
        <div className="chart-title">Toneladas mensuales comparadas</div>
        {meses.length > 0
          ? <Line data={chartData} options={chartOptions} height={180} />
          : <div className="loading">Sin datos para el período seleccionado.</div>}
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">Mercaderías totales</div>
        <VarBar
          ant={totalesEfectivos?.mercaderias?.anterior}
          act={totalesEfectivos?.mercaderias?.actual}
          max={maxMerc}
          sufijo=" tn"
          varPct={totalesEfectivos?.mercaderias?.var_pct}
        />
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">TEUs</div>
        <VarBar
          ant={totalesEfectivos?.teus?.anterior}
          act={totalesEfectivos?.teus?.actual}
          max={maxTeus}
          sufijo=""
          varPct={totalesEfectivos?.teus?.var_pct}
        />
      </div>

      <div className="divider" />
      <div className="cmp-row">
        <div className="cmp-label">Buques totales</div>
        <VarBar
          ant={totalesEfectivos?.buques?.anterior}
          act={totalesEfectivos?.buques?.actual}
          max={maxBq}
          sufijo=""
          varPct={totalesEfectivos?.buques?.var_pct}
        />
      </div>
    </div>
  );
}
