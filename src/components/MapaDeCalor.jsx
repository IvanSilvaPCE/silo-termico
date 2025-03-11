import React from "react";

// Interpola linearmente entre dois valores numéricos
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Interpola duas cores RGB
function lerpCor(corA, corB, t) {
  return [
    Math.round(lerp(corA[0], corB[0], t)),
    Math.round(lerp(corA[1], corB[1], t)),
    Math.round(lerp(corA[2], corB[2], t))
  ];
}

// Função que retorna cor suavizada em degradê
function corDegradeTemperatura(temp) {
  // Trata erro
  if (temp === -1000) return "#ff0000";

  // Pontos de parada (temp -> cor em [r,g,b])
  const stops = [
    { t:  0,  c: [  3, 132, 252] }, // #0384fc
    { t: 12,  c: [  3, 132, 252] },
    { t: 14,  c: [  3, 232, 252] }, 
    { t: 16,  c: [  3, 252, 190] },
    { t: 20,  c: [  7, 252,   3] },
    { t: 24,  c: [195, 255,   0] },
    { t: 26,  c: [252, 248,   3] },
    { t: 30,  c: [255, 179,   0] },
    { t: 35,  c: [255,  34,   0] },
    { t: 49,  c: [255,   0, 144] },
    { t: 60,  c: [247,   0, 255] } // extrapolado
  ];

  // Garante que temp fique dentro do range
  if (temp <= stops[0].t) temp = stops[0].t;
  if (temp >= stops[stops.length - 1].t) temp = stops[stops.length - 1].t;

  // Encontra o par de stops que envolve 'temp'
  let i = 0;
  while (i < stops.length - 1 && temp > stops[i+1].t) i++;
  const stopA = stops[i], stopB = stops[i+1];

  // Fração entre stopA e stopB
  const faixa = stopB.t - stopA.t || 1;
  const frac = (temp - stopA.t) / faixa;

  // Interpola cores
  const [r, g, b] = lerpCor(stopA.c, stopB.c, frac);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function MapaDeCalor({ leituras, largura, altura }) {
  const espacCabos = 60, espacSensores = 35;
  const margemLateral = 100, margemTopo = 120, margemBase = 100;

  // Pega posições/temperaturas válidas
  const sensores = [];
  Object.keys(leituras).forEach((cabo, iCabo) => {
    const x = margemLateral + iCabo * espacCabos;
    const obj = leituras[cabo];
    Object.keys(obj).forEach((s, iSensor) => {
      const t = obj[s][0];
      sensores.push({
        x,
        y: altura - margemBase - iSensor * espacSensores,
        t
      });
    });
  });

  // IDW ignorando -1000
  function idw(cx, cy) {
    let somaPesos = 0, somaTemp = 0;
    const power = 2;
    sensores.forEach(({ x, y, t }) => {
      if (t === -1000) return; // ignora erro
      const dist = Math.max(Math.hypot(x - cx, y - cy), 0.0001);
      const w = 1 / Math.pow(dist, power);
      somaPesos += w;
      somaTemp += t * w;
    });
    if (somaPesos === 0) return 0; // se só tem -1000, retorna algo neutro
    return somaTemp / somaPesos;
  }

  // Path do silo
  const raio = largura / 2;
  const pathD = `
    M 0,${margemTopo}
    A ${raio},${margemTopo} 0 0 1 ${largura},${margemTopo}
    L ${largura},${altura}
    L 0,${altura}
    Z
  `;

  // Cria um grid e preenche cada célula com a cor IDW
  const resolucao = 80;
  const w = largura / resolucao;
  const h = altura / resolucao;
  const blocos = [];
  for (let i = 0; i < resolucao; i++) {
    for (let j = 0; j < resolucao; j++) {
      const cx = i * w + w / 2;
      const cy = j * h + h / 2;
      const tempInterpolada = idw(cx, cy);
      blocos.push(
        <rect
          key={`${i}-${j}`}
          x={i * w}
          y={j * h}
          width={w}
          height={h}
          fill={corDegradeTemperatura(tempInterpolada)}
          stroke="none"
        />
      );
    }
  }

  return (
    <>
      {/* Fundo azul para área externa */}
      <rect width={largura} height={altura} fill="#0384fc" />
      <defs>
        <clipPath id="clipSilo">
          <path d={pathD} />
        </clipPath>
      </defs>
      <g clipPath="url(#clipSilo)">{blocos}</g>
    </>
  );
}
