
import React, { useState, useEffect } from 'react';

const ArcoLateral = ({ numeroArco, dados }) => {
  const [dadosArco, setDadosArco] = useState(null);

  useEffect(() => {
    if (dados && dados.arcos && dados.arcos[numeroArco]) {
      setDadosArco(dados.arcos[numeroArco]);
    }
  }, [numeroArco, dados]);

  if (!dadosArco) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-muted">Carregando dados do arco {numeroArco}...</div>
      </div>
    );
  }

  // Função para determinar cor baseada na temperatura
  const corFaixaExata = (temp) => {
    if (temp === -1000 || temp === 0) return "#ff0000";
    if (temp < 12) return "#0384fc";
    else if (temp < 15) return "#03e8fc";
    else if (temp < 17) return "#03fcbe";
    else if (temp < 21) return "#07fc03";
    else if (temp < 25) return "#c3ff00";
    else if (temp < 27) return "#fcf803";
    else if (temp < 30) return "#ffb300";
    else if (temp < 35) return "#ff2200";
    else if (temp < 50) return "#ff0090";
    else return "#f700ff";
  };

  // Configurações do layout
  const larguraSVG = 400;
  const alturaSVG = 300;
  const alturaArmazem = 220;
  const basePiso = alturaSVG - 30;
  
  const pendulos = Object.entries(dadosArco);
  const numPendulos = pendulos.length;
  const espacamentoPendulos = numPendulos > 1 ? (larguraSVG - 100) / (numPendulos - 1) : 0;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Arco {numeroArco} - Vista Lateral</h5>
      </div>
      <div className="card-body">
        <svg
          width={larguraSVG}
          height={alturaSVG}
          viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}
          style={{ border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}
        >
          {/* Estrutura do armazém */}
          {/* Piso */}
          <rect
            x="0"
            y={basePiso}
            width={larguraSVG}
            height="30"
            fill="#888888"
          />
          
          {/* Paredes laterais */}
          <rect x="10" y={basePiso - alturaArmazem} width="8" height={alturaArmazem} fill="#cccccc" />
          <rect x={larguraSVG - 18} y={basePiso - alturaArmazem} width="8" height={alturaArmazem} fill="#cccccc" />
          
          {/* Telhado */}
          <polygon
            points={`50,${basePiso - alturaArmazem} ${larguraSVG/2},${basePiso - alturaArmazem - 40} ${larguraSVG - 50},${basePiso - alturaArmazem}`}
            fill="#666666"
            stroke="#444444"
            strokeWidth="2"
          />

          {/* Renderizar pêndulos */}
          {pendulos.map(([penduloId, sensores], index) => {
            const xPendulo = numPendulos === 1 ? larguraSVG / 2 : 50 + (index * espacamentoPendulos);
            const sensoresArray = Object.entries(sensores);
            const numSensores = sensoresArray.length;
            const espacamentoSensores = numSensores > 1 ? (alturaArmazem - 40) / (numSensores - 1) : 0;

            return (
              <g key={penduloId}>
                {/* Cabo principal */}
                <line
                  x1={xPendulo}
                  y1={basePiso - alturaArmazem + 20}
                  x2={xPendulo}
                  y2={basePiso - 10}
                  stroke="#333333"
                  strokeWidth="2"
                />

                {/* Label do pêndulo */}
                <text
                  x={xPendulo}
                  y={basePiso + 15}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#0066cc"
                >
                  P{penduloId}
                </text>

                {/* Renderizar sensores */}
                {sensoresArray.map(([sensorId, dadosSensor], sensorIndex) => {
                  const [temperatura, pontoQuente, preAlarme, falha, ativo] = dadosSensor;
                  const ySensor = basePiso - 30 - (sensorIndex * espacamentoSensores);
                  const cor = ativo ? corFaixaExata(temperatura) : "#cccccc";

                  return (
                    <g key={sensorId}>
                      {/* Corpo do sensor */}
                      <rect
                        x={xPendulo - 8}
                        y={ySensor - 6}
                        width="16"
                        height="12"
                        fill={cor}
                        stroke={falha ? "#ff0000" : pontoQuente ? "#ffaa00" : "#333333"}
                        strokeWidth={falha || pontoQuente ? "2" : "1"}
                        opacity={ativo ? 1.0 : 0.5}
                      />

                      {/* Número do sensor */}
                      <text
                        x={xPendulo}
                        y={ySensor + 2}
                        textAnchor="middle"
                        fontSize="8"
                        fill="white"
                        fontWeight="bold"
                      >
                        {sensorId}
                      </text>

                      {/* Temperatura */}
                      <text
                        x={xPendulo + 15}
                        y={ySensor + 2}
                        fontSize="10"
                        fill={falha ? "#ff0000" : ativo ? "#000000" : "#666666"}
                        fontWeight="bold"
                      >
                        {falha ? "ERR" : !ativo ? "OFF" : `${temperatura.toFixed(1)}°C`}
                      </text>

                      {/* Indicador de status */}
                      {(pontoQuente || falha) && (
                        <circle
                          cx={xPendulo + 12}
                          cy={ySensor - 8}
                          r="3"
                          fill={falha ? "#ff0000" : "#ffaa00"}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Título */}
          <text
            x={larguraSVG / 2}
            y="20"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#333333"
          >
            Arco {numeroArco} - {numPendulos} Pêndulos
          </text>
        </svg>

        {/* Informações adicionais */}
        <div className="mt-3">
          <div className="row">
            <div className="col-md-6">
              <h6>Resumo do Arco:</h6>
              <ul className="list-unstyled small">
                <li><strong>Pêndulos:</strong> {numPendulos}</li>
                <li><strong>Total de Sensores:</strong> {pendulos.reduce((acc, [_, sensores]) => acc + Object.keys(sensores).length, 0)}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Legenda:</h6>
              <div className="d-flex flex-wrap">
                <span className="badge bg-success me-1 mb-1">Normal</span>
                <span className="badge bg-warning me-1 mb-1">Ponto Quente</span>
                <span className="badge bg-danger me-1 mb-1">Falha</span>
                <span className="badge bg-secondary me-1 mb-1">Inativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcoLateral;
