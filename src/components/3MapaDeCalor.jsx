import React, { useEffect, useState } from "react";

export default function SiloMapaCalor() {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    fetch("http://172.16.1.85:3333/termometria/101/-1")
      .then((resp) => resp.json())
      .then((data) => setDados(data))
      .catch((err) => console.error(err));
  }, []);

  if (!dados) return <div>Carregando...</div>;

  const layout = dados.dados_layout;
  const leitura = dados.leitura;

  const corFaixaExata = (t) => {
    if (t === -1000) return "#ff0000";
    if (t < 12) return "#0384fc";
    else if (t < 15) return "#03e8fc";
    else if (t < 17) return "#03fcbe";
    else if (t < 21) return "#07fc03";
    else if (t < 25) return "#c3ff00";
    else if (t < 27) return "#fcf803";
    else if (t < 30) return "#ffb300";
    else if (t < 35) return "#ff2200";
    if (layout.desenho_sensores?.escala_cores_sensores === 1) {
      if (t >= 35 && t < 50) return "#ff0090";
      else if (t >= 50) return "#f700ff";
    }
    return "#ff2200";
  };

  const renderFundoSilo = () => {
    const { lb, hs, hb, eb } = layout.desenho_corte_silo;
    const p1 = [0, hs];
    const p2 = [lb, hs];
    const p3 = [lb, hb * 1.75];
    const p4 = [lb / 2, 0];
    const p5 = [0, hb * 1.75];
    const pontos = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`;
    let transfGrupo = "";
    if (layout.aeradores && layout.aeradores.na > 0) {
      transfGrupo = `translate(${Number(layout.aeradores.ds) + 34} 0)`;
    }
    return (
      <g transform={transfGrupo}>
        <polygon fill="#E7E7E7" points={pontos} />
        <path
          fill="#999999"
          d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
          transform={`scale(${lb / 152}, ${hb / 15})`}
        />
        <ellipse fill="#999999" cx={lb / 2} cy={hs} rx={lb / 2} ry={hb} />
        <ellipse fill="#CCCCCC" cx={lb / 2} cy={hs - eb} rx={lb / 2} ry={hb} />
      </g>
    );
  };

  const renderAeradores = () => {
    if (!(layout.aeradores && layout.aeradores.na > 0)) return null;
    return (
      <g transform="translate(-73 150)">
        <circle cx={70 + 12.5 + 3.5} cy={24} r="10.5" fill="red" />
        <rect
          x={70 + 3.5}
          y={2}
          width="25"
          height="10"
          rx="6.4"
          ry="5"
          fill="#3A78FD"
        />
        <text
          x={70 + 12.5 + 3.5}
          y={7}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize="6.5"
          fontFamily="Arial"
          fill="white"
        >
          AE-1
        </text>
      </g>
    );
  };

  // Cria um array com todas as temperaturas e posições dos sensores
  const sensores = [];
  Object.entries(leitura).forEach(([pend, objSensores], iPend) => {
    const espacamentoCabo = 60;
    const espacamentoSensor = 35;
    const margemLateral = 100;
    const margemBase = 100;
    const xPend = margemLateral + iPend * espacamentoCabo;
    Object.entries(objSensores).forEach(([sensorKey, valores]) => {
      const indiceSensor = parseInt(sensorKey, 10);
      const t = parseFloat(valores[0]);
      const yPend = layout.tamanho_svg[1] - margemBase - indiceSensor * espacamentoSensor;
      sensores.push({ x: xPend, y: yPend, t });
    });
  });

  // Interpolação Inversa por Distância (IDW)
  const idw = (cx, cy) => {
    let somaPesos = 0;
    let somaTemp = 0;
    const potencia = 2;
    sensores.forEach(({ x, y, t }) => {
      if (t === -1000) return;
      const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
      const peso = 1 / Math.pow(dist, potencia);
      somaPesos += peso;
      somaTemp += t * peso;
    });
    return somaPesos === 0 ? -1000 : somaTemp / somaPesos;
  };

  // Renderiza o mapa de calor preenchendo um grid e interpolando as temperaturas
  const renderMapaCalor = () => {
    const [largura, altura] = layout.tamanho_svg;
    const resolucao = 80;
    const larguraCelula = largura / resolucao;
    const alturaCelula = altura / resolucao;
    const blocos = [];
    for (let i = 0; i < resolucao; i++) {
      for (let j = 0; j < resolucao; j++) {
        const cx = i * larguraCelula + larguraCelula / 2;
        const cy = j * alturaCelula + alturaCelula / 2;
        const tempInterpolada = idw(cx, cy);
        const cor = corFaixaExata(tempInterpolada);
        blocos.push(
          <rect
            key={`${i}-${j}`}
            x={i * larguraCelula}
            y={j * alturaCelula}
            width={larguraCelula}
            height={alturaCelula}
            fill={cor}
          />
        );
      }
    }

    // Usa o desenho do silo como clip para limitar o efeito térmico
    const { lb, hs, hb } = layout.desenho_corte_silo;
    const p1 = [0, hs];
    const p2 = [lb, hs];
    const p3 = [lb, hb * 1.75];
    const p4 = [lb / 2, 0];
    const p5 = [0, hb * 1.75];
    const caminho = `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]} L ${p4[0]},${p4[1]} L ${p5[0]},${p5[1]} Z`;

    return (
      <>
        <defs>
          <clipPath id="clipSilo">
            <path d={caminho} />
          </clipPath>
        </defs>
        <g clipPath="url(#clipSilo)">{blocos}</g>
      </>
    );
  };

  const [larguraSvg, alturaSvg] = layout.tamanho_svg;

  return (
    <div>
      <h1>Silo - Mapa de Calor</h1>
      <svg
        width={`${larguraSvg}mm`}
        height={`${alturaSvg}mm`}
        viewBox={`0 0 ${larguraSvg} ${alturaSvg}`}
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "optimizeQuality",
          fillRule: "evenodd",
          clipRule: "evenodd"
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={layout.aeradores?.na > 0 ? `translate(${Number(layout.aeradores.ds) + 34} 0)` : ""}>
          {/* Fundo do silo */}
          {renderFundoSilo()}
          {/* Mapa de calor */}
          {renderMapaCalor()}
          {/* Aeradores */}
          {renderAeradores()}
        </g>
      </svg>
    </div>
  );
}
