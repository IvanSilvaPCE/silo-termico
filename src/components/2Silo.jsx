import React, { useState } from "react";
import MapaDeCalor from "./MapaDeCalor";

function getCorTemperatura(temp) {
  if (temp === -1000) return "#ff0000";
  if (temp < 12) return "#0384fc";
  if (temp <= 14) return "#03e8fc";
  if (temp <= 16) return "#03fcbe";
  if (temp <= 20) return "#07fc03";
  if (temp <= 24) return "#c3ff00";
  if (temp <= 26) return "#fcf803";
  if (temp <= 29.99) return "#ffb300";
  if (temp <= 34.99) return "#ff2200";
  if (temp <= 49) return "#ff0090";
  return "#f700ff";
}

export default function Silo({ leituras }) {
  const [modoMapa, setModoMapa] = useState(false);

  const cabos = Object.keys(leituras);
  const nCabos = cabos.length;
  const maxSensores = Math.max(...cabos.map(c => Object.keys(leituras[c]).length));

  const espacamentoCabos = 60;
  const espacamentoSensores = 35;
  const margemLateral = 100;
  const margemTopo = 120;
  const margemBase = 100;
  const mioloLargura = (nCabos - 1) * espacamentoCabos;
  const mioloAltura = (maxSensores - 1) * espacamentoSensores;
  const larguraSVG = mioloLargura + margemLateral * 2;
  const alturaSVG = mioloAltura + margemTopo + margemBase;

  const raio = larguraSVG / 2;
  const topY = margemTopo;
  const pathD = `
    M 0,${topY}
    A ${raio},${topY} 0 0 1 ${larguraSVG},${topY}
    L ${larguraSVG},${alturaSVG}
    L 0,${alturaSVG}
    Z
  `;
  const xCabosInicio = margemLateral;
  const yBaseSensores = alturaSVG - margemBase;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={larguraSVG} height={alturaSVG} viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}>
        <path d={pathD} fill="#e0e0e0" stroke="#555" strokeWidth="2" />
        {!modoMapa ? (
          cabos.map((nomeCabo, iCabo) => {
            const xCabo = xCabosInicio + iCabo * espacamentoCabos;
            const sensoresObj = leituras[nomeCabo];
            const sensores = Object.keys(sensoresObj);
            return (
              <g key={nomeCabo}>
                <rect x={xCabo - 15} y={yBaseSensores + 20} width="30" height="20" rx="5" fill="#3F51B5" />
                <text x={xCabo} y={yBaseSensores + 34} fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">
                  {nomeCabo}
                </text>
                {sensores.map((sensor, iSensor) => {
                  const valor = sensoresObj[sensor][0];
                  const isErro = valor === -1000;
                  const ySensor = yBaseSensores - iSensor * espacamentoSensores;
                  const corFundo = isErro ? "#ff0000" : getCorTemperatura(valor);
                  return (
                    <g key={sensor}>
                      <rect x={xCabo - 20} y={ySensor - 10} width="40" height="20" rx="4" fill={corFundo} stroke="black" />
                      <text
                        x={xCabo}
                        y={ySensor + 4}
                        fontSize="10"
                        fontWeight="bold"
                        fill={isErro ? "#fff" : "#000"}
                        textAnchor="middle"
                      >
                        {isErro ? "ERRO" : `${valor.toFixed(1)}°C`}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })
        ) : (
          <MapaDeCalor leituras={leituras} largura={larguraSVG} altura={alturaSVG} />
        )}
      </svg>
      <button
        onClick={() => setModoMapa(!modoMapa)}
        style={{ marginTop: "20px", padding: "10px", fontSize: "16px", cursor: "pointer" }}
      >
        {modoMapa ? "Mostrar Temperaturas" : "Ver Mapa de Calor"}
      </button>
    </div>
  );
}
