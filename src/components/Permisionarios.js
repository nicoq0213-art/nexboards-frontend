import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#042C53","#185FA5","#378ADD","#85B7EB","#B5D4F4","#0f3d6e","#1a5490","#2463a8","#4da8e0","#6bbde8","#8dcef0","#aaddf5","#cceafa","#e6f4fc"];

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  return Math.round(n).toLocaleString("es-AR");
}

function Lista({ empresas }) {
  if (!empresas || empresas.length === 0) return <div className="loading">Sin datos</div>;
  const max = Math.max(...empresas.map(e => e.toneladas));
  return (
    <div>
      {empresas.map((e, i) => (
        <div className="perm-item" key={i}>
          <div className="perm-row">
            <span className="perm-rank">{i + 1}</span>
            <span className="perm-name" title={e.empresa}>{e.empresa}</span>
            <span className="perm-val">{fmt(e.toneladas)}</span>
            <span className="perm-unit">tn</span>
          </div>
          <div className="perm-bar">
            <div className="perm-fill" style={{ width: `${Math.round(e.toneladas / max * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Permisionarios({ data }) {
  const [vista, setVista] = useState("anual");
  const [mesIdx, setMesIdx] = useState(0);

  if (!data) return <div className="loading">Cargando permisionarios...</div>;

  const { total_puerto, total_operadores, ranking_anual, por_mes } = data;

  const mesActual = por_mes?.[mesIdx];
  const empresasAnual = ranking_anual || [];
  const empresasMes = mesActual?.empresas || [];

  const pieData = {
    labels: empresasAnual.map(e => e.empresa.split(" ")[0]),
    datasets: [{
      data: empresasAnual.map(e => e.toneladas),
      backgroundColor: COLORS,
      borderWidth: 2,
      borderColor: "#fff"
    }]
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { font: { size: 10 }, color: "#666", boxWidth: 10, padding: 6 } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const tot = ctx.dataset.data.reduce((a, b) => a + b, 0);
            return ` ${empresasAnual[ctx.dataIndex]?.empresa}: ${(ctx.parsed / tot * 100).toFixed(1)}%`;
          }
        }
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span className="sec" style={{ marginBottom: 0 }}>Toneladas por empresa</span>
        <div className="toggle-wrap">
          <button className={`toggle-btn ${vista === "anual" ? "active" : ""}`} onClick={() => setVista("anual")}>Anual</button>
          <button className={`toggle-btn ${vista === "mensual" ? "active" : ""}`} onClick={() => setVista("mensual")}>Por mes</button>
        </div>
      </div>

      {vista === "anual" && (
        <div>
          <div className="total-card">
            <div>
              <div className="total-label">Total puerto</div>
              <div className="total-val">{fmt(total_puerto)} tn</div>
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>{total_operadores} operadores</div>
          </div>
          <Lista empresas={empresasAnual} />
          <div className="divider" />
          <div className="chart-box">
            <div className="chart-title">Participación sobre volumen total</div>
            <Pie data={pieData} options={pieOptions} height={240} />
          </div>
        </div>
      )}

      {vista === "mensual" && (
        <div>
          <div className="mes-sel">
            {(por_mes || []).map((m, i) => (
              <button
                key={i}
                className={`mes-btn ${mesIdx === i ? "active" : ""}`}
                onClick={() => setMesIdx(i)}
              >{m.mes}</button>
            ))}
          </div>
          <div className="total-card">
            <div>
              <div className="total-label">{mesActual?.mes}</div>
              <div className="total-val">{fmt(mesActual?.total)} tn</div>
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>{mesActual?.operadores} operadores activos</div>
          </div>
          <Lista empresas={empresasMes} />
        </div>
      )}
    </div>
  );
}
