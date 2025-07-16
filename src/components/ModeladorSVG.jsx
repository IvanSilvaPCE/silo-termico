import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";
import ModelConfigurationManager from "./ModelConfigurationManager";

const ModeladorSVG = () => {
  // Estados para configurações do Silo
  const [configSilo, setConfigSilo] = useState({
    lb: 200, // largura base
    hs: 180, // altura superior
    hb: 15, // altura base (elipse)
    eb: 5, // espessura borda
    escala_sensores: 16,
    dist_y_sensores: 12,
    pos_x_cabos_uniforme: 1,
    pos_x_cabo: [50, 25], // [posição inicial, distância entre cabos]
    pos_y_cabo: [160, 160, 160, 160, 160],
    aeradores_ativo: false,
    na: 4, // número de aeradores
    ds: 30, // deslocamento lateral
    dy: 0, // deslocamento vertical
    da: 35, // distância entre aeradores
  });

  // Estados para configurações do Armazém - usando dados reais do JSON
  const [configArmazem, setConfigArmazem] = useState({
    // Dimensões Básicas
    pb: 185,
    lb: 350,
    hb: 30,
    hf: 5,
    lf: 250,
    le: 15,
    ht: 50,

    // Configuração do Telhado
    tipo_telhado: 1,
    curvatura_topo: 30,

    // Configuração do Fundo
    tipo_fundo: 0,
    altura_fundo_reto: 0,

    // Configurações Funil V
    altura_funil_v: 40,
    posicao_ponta_v: 0,
    largura_abertura_v: 20,

    // Configurações Duplo V
    altura_duplo_v: 35,
    posicao_v_esquerdo: -0.5,
    posicao_v_direito: 0.5,
    largura_abertura_duplo_v: 15,

    // Configuração dos Sensores
    escala_sensores: 16,
    dist_y_sensores: 12,
    dist_x_sensores: 0,
    posicao_horizontal: 0,
    posicao_vertical: 0,
    afastamento_vertical_pendulo: 0,
  });

  // Estados para modelos de arcos
  const [quantidadeModelosArcos, setQuantidadeModelosArcos] = useState(1);
  const [modeloArcoAtual, setModeloArcoAtual] = useState(1);
  const [modelosArcos, setModelosArcos] = useState({
    1: {
      posicao: "todos", // todos, frente, par, impar, fundo, frente_fundo
      config: { ...configArmazem },
      nome: "Modelo Único"
    }
  });

  const [tipoAtivo, setTipoAtivo] = useState("silo");
  const [nomeConfiguracao, setNomeConfiguracao] = useState("");
  const [forceUpdateLista, setForceUpdateLista] = useState(0);

  // Estados para dados do JSON (igual ao Armazem.jsx)
  const [dados, setDados] = useState(null);
  const [dadosPortal, setDadosPortal] = useState(null);
  const [arcoAtual, setArcoAtual] = useState(1);
  const [analiseArcos, setAnaliseArcos] = useState(null);
  const [layoutsAutomaticos, setLayoutsAutomaticos] = useState(null);
  const [dimensoesSVGArmazem, setDimensoesSVGArmazem] = useState({
    largura: 350,
    altura: 200,
  });

  // Carregar dados reais do arquivo JSON (igual ao Armazem.jsx)
  useEffect(() => {
    const inicializarDados = async () => {
      try {
        // Carregar dados do arquivo JSON
        const response = await fetch(
          "/attached_assets/modeloRotaArmazemPortal_1751897945212.json",
        );
        const dadosArmazemPortal = await response.json();
        setDadosPortal(dadosArmazemPortal);

        // Analisar estrutura dos arcos
        const analise =
          LayoutManager.analisarEstruturaArcos(dadosArmazemPortal);
        setAnaliseArcos(analise);

        // Gerar layouts automáticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise);
        setLayoutsAutomaticos(layouts);

        // Calcular dimensões ideais do SVG baseado em todos os arcos
        const dimensoes = calcularDimensoesIdeaisArmazem(analise);
        setDimensoesSVGArmazem(dimensoes);

        // Converter dados para o formato do armazém (arco 1 inicialmente)
        const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(
          dadosArmazemPortal,
          1,
        );
        setDados(dadosConvertidos);
      } catch (error) {
        console.error("Erro ao inicializar dados:", error);
      }
    };

    inicializarDados();
  }, []);

  // Calcular dimensões ideais do SVG baseado na análise de todos os arcos - igual ao Armazem.jsx
  const calcularDimensoesIdeaisArmazem = (analiseArcos) => {
    if (!analiseArcos) return { largura: 350, altura: 200 };

    let maxSensores = 0;
    let maxPendulos = 0;

    // Encontrar o máximo de sensores e pêndulos em todos os arcos - igual ao Armazem.jsx
    Object.values(analiseArcos.arcos).forEach((arco) => {
      maxPendulos = Math.max(maxPendulos, arco.totalPendulos);
      arco.pendulos.forEach((pendulo) => {
        maxSensores = Math.max(maxSensores, pendulo.totalSensores);
      });
    });

    const escala_sensores = 16; // Valor fixo igual ao Armazem.jsx
    const dist_y_sensores = 12; // Valor fixo igual ao Armazem.jsx
    const margemSuperior = 30; // Margem para o telhado
    const margemInferior = 50; // Margem para os pêndulos (P1, P2, etc.)
    const margemPendulo = 20; // Espaço extra para o nome do pêndulo

    // Calcular altura necessária - igual ao Armazem.jsx
    const alturaBaseTelhado = 185; // Altura base original igual ao Armazem.jsx
    const alturaSensores = maxSensores * dist_y_sensores + escala_sensores;
    const alturaTotal = Math.max(
      alturaBaseTelhado,
      margemSuperior + alturaSensores + margemInferior + margemPendulo,
    );

    // Calcular largura necessária (baseada no número de pêndulos) - igual ao Armazem.jsx
    const larguraMinima = 350;
    const espacamentoPendulo = 50;
    const larguraCalculada = Math.max(
      larguraMinima,
      maxPendulos * espacamentoPendulo + 100,
    );

    return {
      largura: larguraCalculada,
      altura: Math.max(alturaTotal, 250), // Altura mínima
    };
  };

  // NÃO carregar configurações automaticamente - sempre começar com reset
  useEffect(() => {
    // Componente sempre inicia com configuração padrão (reset)
    // Usuário deve carregar manualmente se quiser usar configuração salva
  }, []);

  // Funções de renderização do Silo
  const renderFundoSilo = () => {
    const { lb, hs, hb, eb } = configSilo;
    const p1 = [0, hs];
    const p2 = [lb, hs];
    const p3 = [lb, hb * 1.75];
    const p4 = [lb / 2, 0];
    const p5 = [0, hb * 1.75];
    const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`;

    return (
      <g id="g_des_fundo">
        <polygon fill="#E7E7E7" points={points} />
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

  const renderAeradoresSilo = () => {
    if (!configSilo.aeradores_ativo) return null;

    const { na, ds, dy, da, lb, hs } = configSilo;
    const posY = hs + dy - 30;
    const posX = lb + ds * 2 - 31;
    const aeradores = [];

    const dBlade =
      "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z";
    const angles = [0, 60, 120, 180, 240, 300];

    for (let id = 1; id <= na; id++) {
      let transform = "";
      if (id === 1) transform = `translate(-73, ${posY})`;
      else if (id === 2) transform = `translate(${posX}, ${posY})`;
      else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`;
      else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`;
      else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`;
      else if (id === 6)
        transform = `translate(${posX}, ${posY - 70 - da * 2})`;

      aeradores.push(
        <g key={id} id={`aerador_${id}`} transform={transform}>
          <circle cx={70 + 12.5 + 3.5} cy={24} r="10" fill="#c5c5c5" />
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
            {`AE-${id}`}
          </text>
          <g>
            {angles.map((angle) => (
              <path
                key={angle}
                d={dBlade}
                fill="white"
                transform={
                  angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`
                }
              />
            ))}
          </g>
        </g>,
      );
    }
    return aeradores;
  };

  // Função para aplicar cores baseadas na temperatura - exatamente igual ao Armazem.jsx
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
    else if (t < 50) return "#ff0090";
    else return "#f700ff";
  };

  // Renderizar sensores básicos - com funcionalidade dos novos campos
  const renderSensoresArmazem = () => {
    if (!layoutsAutomaticos || !analiseArcos) return [];

    const elementos = [];
    const layoutArco = layoutsAutomaticos[`arco_${arcoAtual}`];
    const arcoInfo = analiseArcos.arcos[arcoAtual];

    if (!layoutArco || !arcoInfo) return [];

    const escala_sensores = configArmazem.escala_sensores;
    const dist_y_sensores = configArmazem.dist_y_sensores;
    const dist_x_sensores = configArmazem.dist_x_sensores || 0;
    const posicao_horizontal = configArmazem.posicao_horizontal || 0;
    const posicao_vertical = configArmazem.posicao_vertical || 0;
    const afastamento_vertical_pendulo = configArmazem.afastamento_vertical_pendulo || 0;
    const pb = configArmazem.pb; // Usar configuração do usuário
    const yPendulo = pb + 15 + posicao_vertical; // Posição dos pêndulos com ajuste vertical

    // Calcular índice do cabo central
    const totalCabos = arcoInfo.pendulos.length;
    const indiceCentral = Math.floor((totalCabos - 1) / 2);

    // Renderizar todos os pêndulos em ordem sequencial
    arcoInfo.pendulos.forEach((pendulo, index) => {
      const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[index];
      
      // Calcular deslocamento baseado na distância do cabo central
      const distanciaDoMeio = index - indiceCentral;
      const deslocamentoX = distanciaDoMeio * dist_x_sensores;
      
      const xCabo = xCaboBase + posicao_horizontal + deslocamentoX; // Aplicar ajustes horizontais
      const numSensores = pendulo.totalSensores;

      // Retângulo do nome do pêndulo - igual ao Armazem.jsx
      elementos.push(
        <rect
          key={`pendulo-${pendulo.numero}`}
          id={`C${index + 1}`}
          className="pendulo-element"
          x={xCabo - escala_sensores / 2}
          y={yPendulo}
          width={escala_sensores}
          height={escala_sensores / 2}
          rx="2"
          ry="2"
          fill="#3A78FD"
        />,
      );

      // Texto do nome do pêndulo - igual ao Armazem.jsx
      elementos.push(
        <text
          key={`texto-pendulo-${pendulo.numero}`}
          id={`TC${index + 1}`}
          className="pendulo-element"
          x={xCabo}
          y={yPendulo + escala_sensores / 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize={escala_sensores * 0.4 - 0.5}
          fontFamily="Arial"
          fill="white"
        >
          P{pendulo.numero}
        </text>,
      );

      // Renderizar TODOS os sensores de 1 até numSensores com posicionamento ajustado
      for (let s = 1; s <= numSensores; s++) {
        const ySensor = yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo; // Aplicar distância Y configurada e afastamento vertical

        // Garantir que o sensor está dentro dos limites do SVG
        const [, alturaSVG] = calcularDimensoesSVG();
        if (ySensor > 10 && ySensor < alturaSVG - 60) {
          // Retângulo do sensor com posicionamento ajustado
          elementos.push(
            <rect
              key={`sensor-${pendulo.numero}-${s}`}
              id={`C${index + 1}S${s}`}
              className="sensor-element"
              x={xCabo - escala_sensores / 2}
              y={ySensor}
              width={escala_sensores}
              height={escala_sensores / 2}
              rx="2"
              ry="2"
              fill="#ccc"
              stroke="black"
              strokeWidth="1"
            />,
          );

          // Texto do valor do sensor com posicionamento ajustado
          elementos.push(
            <text
              key={`texto-sensor-${pendulo.numero}-${s}`}
              id={`TC${index + 1}S${s}`}
              className="sensor-element"
              x={xCabo}
              y={ySensor + escala_sensores / 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={escala_sensores * 0.4 - 0.5}
              fontFamily="Arial"
              fill="black"
            >
              0
            </text>,
          );

          // Nome do sensor (S1, S2, etc.) com posicionamento ajustado
          elementos.push(
            <text
              key={`nome-sensor-${pendulo.numero}-${s}`}
              id={`TIND${index + 1}S${s}`}
              className="sensor-element"
              x={xCabo - escala_sensores / 2 - 2}
              y={ySensor + escala_sensores / 4}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={escala_sensores * 0.4 - 1.5}
              fontFamily="Arial"
              fill="black"
            >
              S{s}
            </text>,
          );
        }
      }
    });

    return elementos;
  };

  // Função para atualizar sensores com dados reais e posicionamento dinâmico
  const atualizarSensores = (dadosArco) => {
    if (!dadosArco?.leitura || !analiseArcos || !layoutsAutomaticos) return;

    const layoutArco = layoutsAutomaticos[`arco_${arcoAtual}`];
    if (!layoutArco) return;

    const escala_sensores = configArmazem.escala_sensores;
    const dist_y_sensores = configArmazem.dist_y_sensores;
    const dist_x_sensores = configArmazem.dist_x_sensores || 0;
    const posicao_horizontal = configArmazem.posicao_horizontal || 0;
    const posicao_vertical = configArmazem.posicao_vertical || 0;
    const afastamento_vertical_pendulo = configArmazem.afastamento_vertical_pendulo || 0;
    const pb = configArmazem.pb;
    const yPendulo = pb + 15 + posicao_vertical;

    // Use requestAnimationFrame para suavizar as atualizações
    requestAnimationFrame(() => {
      // Calcular índice do cabo central para a nova lógica
      const totalCabos = Object.keys(dadosArco.leitura).length;
      const indiceCentral = Math.floor((totalCabos - 1) / 2);

      Object.entries(dadosArco.leitura).forEach(
        ([idCabo, sensores], penduloIndex) => {
          // Recalcular posição X do cabo com os novos parâmetros (expandir a partir do centro)
          const xCaboBase = layoutArco.desenho_sensores.pos_x_cabo[penduloIndex];
          const distanciaDoMeio = penduloIndex - indiceCentral;
          const deslocamentoX = distanciaDoMeio * dist_x_sensores;
          const xCabo = xCaboBase + posicao_horizontal + deslocamentoX;

          // Atualizar posição do pêndulo
          const pendulo = document.getElementById(`C${penduloIndex + 1}`);
          const textoPendulo = document.getElementById(`TC${penduloIndex + 1}`);
          if (pendulo && textoPendulo) {
            // Aplicar transições suaves usando CSS
            pendulo.style.transition = 'all 0.15s ease-out';
            textoPendulo.style.transition = 'all 0.15s ease-out';

            // Atualizar posições apenas se diferentes
            const novoX = (xCabo - escala_sensores / 2).toString();
            const novoY = yPendulo.toString();
            const novoTextoX = xCabo.toString();
            const novoTextoY = (yPendulo + escala_sensores / 4).toString();
            const novoFontSize = (escala_sensores * 0.4 - 0.5).toString();

            if (pendulo.getAttribute("x") !== novoX) {
              pendulo.setAttribute("x", novoX);
            }
            if (pendulo.getAttribute("y") !== novoY) {
              pendulo.setAttribute("y", novoY);
            }
            if (textoPendulo.getAttribute("x") !== novoTextoX) {
              textoPendulo.setAttribute("x", novoTextoX);
            }
            if (textoPendulo.getAttribute("y") !== novoTextoY) {
              textoPendulo.setAttribute("y", novoTextoY);
            }
            if (textoPendulo.getAttribute("font-size") !== novoFontSize) {
              textoPendulo.setAttribute("font-size", novoFontSize);
            }
          }

          Object.entries(sensores).forEach(([s, [temp, , , falha, nivel]]) => {
            const ySensor = yPendulo - dist_y_sensores * parseInt(s) - 25 - afastamento_vertical_pendulo;

            const rec = document.getElementById(`C${penduloIndex + 1}S${s}`);
            const txt = document.getElementById(`TC${penduloIndex + 1}S${s}`);
            const nomeTexto = document.getElementById(`TIND${penduloIndex + 1}S${s}`);

            if (!rec || !txt || !nomeTexto) return;

            // Aplicar transições suaves para todos os elementos
            rec.style.transition = 'all 0.15s ease-out';
            txt.style.transition = 'all 0.15s ease-out';
            nomeTexto.style.transition = 'all 0.15s ease-out';

            // Calcular posição base do retângulo
            const posicaoRetanguloX = xCabo - escala_sensores / 2;
            const posicaoRetanguloY = ySensor;
            const centroRetanguloX = posicaoRetanguloX + escala_sensores / 2;
            const centroRetanguloY = posicaoRetanguloY + escala_sensores / 4;

            // Calcular novos valores baseados na mesma origem
            const novoRecX = posicaoRetanguloX.toString();
            const novoRecY = posicaoRetanguloY.toString();
            const novoRecWidth = escala_sensores.toString();
            const novoRecHeight = (escala_sensores / 2).toString();

            const novoTxtX = centroRetanguloX.toString();
            const novoTxtY = centroRetanguloY.toString();
            const novoTxtFontSize = (escala_sensores * 0.4 - 0.5).toString();

            const novoNomeX = (posicaoRetanguloX - 2).toString();
            const novoNomeY = centroRetanguloY.toString();
            const novoNomeFontSize = (escala_sensores * 0.4 - 1.5).toString();

            // Atualizar posicionamento do retângulo do sensor apenas se diferentes
            if (rec.getAttribute("x") !== novoRecX) {
              rec.setAttribute("x", novoRecX);
            }
            if (rec.getAttribute("y") !== novoRecY) {
              rec.setAttribute("y", novoRecY);
            }
            if (rec.getAttribute("width") !== novoRecWidth) {
              rec.setAttribute("width", novoRecWidth);
            }
            if (rec.getAttribute("height") !== novoRecHeight) {
              rec.setAttribute("height", novoRecHeight);
            }

            // Atualizar posicionamento e tamanho do texto da temperatura apenas se diferentes
            if (txt.getAttribute("x") !== novoTxtX) {
              txt.setAttribute("x", novoTxtX);
            }
            if (txt.getAttribute("y") !== novoTxtY) {
              txt.setAttribute("y", novoTxtY);
            }
            if (txt.getAttribute("font-size") !== novoTxtFontSize) {
              txt.setAttribute("font-size", novoTxtFontSize);
            }

            // Atualizar posicionamento e tamanho do nome do sensor apenas se diferentes
            if (nomeTexto.getAttribute("x") !== novoNomeX) {
              nomeTexto.setAttribute("x", novoNomeX);
            }
            if (nomeTexto.getAttribute("y") !== novoNomeY) {
              nomeTexto.setAttribute("y", novoNomeY);
            }
            if (nomeTexto.getAttribute("font-size") !== novoNomeFontSize) {
              nomeTexto.setAttribute("font-size", novoNomeFontSize);
            }

            // Atualizar dados com suavização - evitar mudanças desnecessárias
            const novoTexto = falha ? "ERRO" : temp.toFixed(1);
            if (txt.textContent !== novoTexto) {
              txt.textContent = novoTexto;
            }

            if (!nivel) {
              rec.setAttribute("fill", "#e6e6e6");
              txt.setAttribute("fill", "black");
            } else {
              const cor = corFaixaExata(temp);
              rec.setAttribute("fill", cor);
              txt.setAttribute("fill", cor === "#ff2200" ? "white" : "black");
            }
          });
        },
      );
    });
  };

  // useEffect para atualizar sensores quando dados ou configurações mudarem
  useEffect(() => {
    if (dados && tipoAtivo === "armazem") {
      // Pequeno delay para garantir que o DOM foi renderizado
      setTimeout(() => {
        atualizarSensores(dados);
      }, 50); // Reduzido para resposta mais rápida
    }
  }, [dados, arcoAtual, tipoAtivo, configArmazem.escala_sensores, configArmazem.dist_y_sensores, configArmazem.dist_x_sensores, configArmazem.posicao_horizontal, configArmazem.posicao_vertical, configArmazem.afastamento_vertical_pendulo]);

  // Renderizar base do armazém
  const renderArmazem = () => {
    const { tipo_fundo } = configArmazem;

    let baseElement = null;

    if (tipo_fundo === 0) {
      baseElement = renderBaseNormal();
    } else if (tipo_fundo === 1) {
      baseElement = renderBaseFunilV();
    } else if (tipo_fundo === 2) {
      baseElement = renderBaseDuploV();
    }

    return (
      <>
        {renderTelhado()}
        {baseElement}
      </>
    );
  };

  // Renderizar base normal (fundo reto)
  const renderBaseNormal = () => {
    const { pb, lb, hb, le, lf, altura_fundo_reto = 10 } = configArmazem;

    // Ajuste reduzido para metade
    const ajuste_base = -4; // Ajuste menor para não subir tanto

    // Usar altura_fundo_reto para definir a altura do fundo interno
    const altura_fundo_aplicada = altura_fundo_reto || 10;

    const p1 = [lb, pb - hb + ajuste_base];
    const p2 = [lb - le, pb - hb + ajuste_base];
    const p3 = [lb - (lb - lf) / 2, pb - altura_fundo_aplicada + ajuste_base];
    const p4 = [(lb - lf) / 2, pb - altura_fundo_aplicada + ajuste_base];
    const p5 = [le, pb - hb + ajuste_base];
    const p6 = [0, pb - hb + ajuste_base];
    const p7 = [0, pb + ajuste_base];
    const p8 = [lb, pb + ajuste_base];

    const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;

    return <polygon fill="#999999" id="des_fundo" points={pathBase} />;
  };

  // Renderizar base funil V
  const renderBaseFunilV = () => {
    const {
      pb,
      lb,
      hb,
      le,
      lf,
      altura_funil_v = 40,
      posicao_ponta_v = 0, // -1 a 1 (esquerda para direita)
      largura_abertura_v = 20,
    } = configArmazem;

    // Calcular posição da ponta do V
    const centroBase = lb / 2;
    const deslocamentoPonta = lb * 0.3 * posicao_ponta_v; // Máximo 30% da largura
    const pontaX = centroBase + deslocamentoPonta;

    // Ajustar posição para alinhar melhor com a base
    const ajuste_base = 5; // Mover o fundo mais para baixo

    const p1 = [lb, pb - hb + ajuste_base];
    const p2 = [lb - le, pb - hb + ajuste_base];
    const p3 = [
      pontaX + largura_abertura_v / 2,
      pb - altura_funil_v + ajuste_base,
    ];
    const p4 = [pontaX, pb + ajuste_base]; // Ponta do V
    const p5 = [
      pontaX - largura_abertura_v / 2,
      pb - altura_funil_v + ajuste_base,
    ];
    const p6 = [le, pb - hb + ajuste_base];
    const p7 = [0, pb - hb + ajuste_base];
    const p8 = [0, pb + ajuste_base];
    const p9 = [lb, pb + ajuste_base];

    const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")} ${p9.join(",")}`;

    return <polygon fill="#999999" id="des_fundo" points={pathBase} />;
  };

  // Renderizar base duplo V
  const renderBaseDuploV = () => {
    const {
      pb,
      lb,
      hb,
      le,
      lf,
      altura_duplo_v = 35,
      posicao_v_esquerdo = -0.5, // -1 a 1
      posicao_v_direito = 0.5, // -1 a 1
      largura_abertura_duplo_v = 15,
    } = configArmazem;

    const centroBase = lb / 2;

    // Calcular posições das pontas dos Vs
    const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo;
    const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito;

    // Ajustar posição para alinhar melhor com a base
    const ajuste_base = 5; // Mover o fundo mais para baixo

    const p1 = [lb, pb - hb + ajuste_base];
    const p2 = [lb - le, pb - hb + ajuste_base];

    // V direito
    const p3 = [
      pontaDireitaX + largura_abertura_duplo_v / 2,
      pb - altura_duplo_v + ajuste_base,
    ];
    const p4 = [pontaDireitaX, pb + ajuste_base]; // Ponta do V direito
    const p5 = [
      pontaDireitaX - largura_abertura_duplo_v / 2,
      pb - altura_duplo_v + ajuste_base,
    ];

    // Meio entre os Vs
    const p6 = [centroBase, pb - altura_duplo_v * 0.7 + ajuste_base];

    // V esquerdo
    const p7 = [
      pontaEsquerdaX + largura_abertura_duplo_v / 2,
      pb - altura_duplo_v + ajuste_base,
    ];
    const p8 = [pontaEsquerdaX, pb + ajuste_base]; // Ponta do V esquerdo
    const p9 = [
      pontaEsquerdaX - largura_abertura_duplo_v / 2,
      pb - altura_duplo_v + ajuste_base,
    ];

    const p10 = [le, pb - hb + ajuste_base];
    const p11 = [0, pb - hb + ajuste_base];
    const p12 = [0, pb + ajuste_base];
    const p13 = [lb, pb + ajuste_base];

    const pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")} ${p9.join(",")} ${p10.join(",")} ${p11.join(",")} ${p12.join(",")} ${p13.join(",")}`;

    return <polygon fill="#999999" id="des_fundo" points={pathBase} />;
  };

  // Renderizar telhado
  const renderTelhado = () => {
    const {
      tipo_telhado,
      curvatura_topo,
      pb,
      lb,
      hb,
      hf,
      lf,
      le,
      ht,
      tipo_fundo,
    } = configArmazem;

    if (tipo_telhado === 1) {
      // Pontudo
      let p1_ = [(lb - lf) / 2, pb - hf],
        p2_ = [le, pb - hb],
        p3_ = [le, pb - ht],
        p4_ = [lb / 2, 1],
        p5_ = [lb - le, pb - ht],
        p6_ = [lb - le, pb - hb],
        p7_ = [lb - (lb - lf) / 2, pb - hf];

      // Se tipo de fundo for V (1) ou Duplo V (2), estender telhado para baixo
      if (tipo_fundo === 1 || tipo_fundo === 2) {
        let extensao = 7; // Ajustando a extensão para 25px
        p1_ = [(lb - lf) / 2, pb - hf + extensao]; // Estender meio esquerdo para baixo
        p2_ = [le, pb - hb + extensao]; // Estender lado esquerdo para baixo
        p6_ = [lb - le, pb - hb + extensao]; // Estender lado direito para baixo
        p7_ = [lb - (lb - lf) / 2, pb - hf + extensao]; // Estender meio direito para baixo
      }

      const pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(",")} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;

      return (
        <polygon
          fill="#E6E6E6"
          stroke="#999999"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="23"
          id="des_telhado"
          points={pathTelhado}
        />
      );
    } else if (tipo_telhado === 2) {
      // Arredondado
      let extensao = 5;
      if (tipo_fundo === 1 || tipo_fundo === 2) {
        extensao = 5; // Extensão para baixo nos tipos V
      }

      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf + extensao}
        L ${le} ${pb - hb + extensao}
        L ${le} ${pb - ht}
        Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb + extensao}
        L ${lb - (lb - lf) / 2} ${pb - hf + extensao}
        Z
      `;
      return (
        <path
          fill="#E6E6E6"
          stroke="#999999"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="23"
          id="des_telhado"
          d={pathTelhado}
        />
      );
    } else if (tipo_telhado === 3) {
      // Arco
      let extensao = 5;
      if (tipo_fundo === 1 || tipo_fundo === 2) {
        extensao = 5; // Extensão para baixo nos tipos V
      }

      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf + extensao}
        L ${le} ${pb - hb + extensao}
        L ${le} ${pb - ht}
        A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb + extensao}
        L ${lb - (lb - lf) / 2} ${pb - hf + extensao}
        Z
      `;

      return (
        <path
          fill="#E6E6E6"
          stroke="#999999"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="23"
          id="des_telhado"
          d={pathTelhado}
        />
      );
    }

    return null;
  };

  const renderFundoArmazem = () => {
    const { tipo_fundo } = configArmazem;

    let baseElement = null;

    if (tipo_fundo === 0) {
      baseElement = renderBaseNormal();
    } else if (tipo_fundo === 1) {
      baseElement = renderBaseFunilV();
    } else if (tipo_fundo === 2) {
      baseElement = renderBaseDuploV();
    }

    return (
      <>
        {renderTelhado()}
        {baseElement}
      </>
    );
  };

  // Debounce ref para otimizar atualizações
  const debounceTimeoutRef = React.useRef(null);

  // Handlers para mudança de configuração
  const handleSiloChange = (campo, valor) => {
    setConfigSilo((prev) => ({
      ...prev,
      [campo]: parseFloat(valor),
    }));
  };

  const handleArmazemChange = (campo, valor) => {
    const novaConfig = {
      ...configArmazem,
      [campo]: parseFloat(valor),
    };

    // Limpar timeout anterior se existir
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setConfigArmazem(novaConfig);

    // Debounce para atualizar modelos (evita atualizações excessivas)
    debounceTimeoutRef.current = setTimeout(() => {
      setModelosArcos(prev => ({
        ...prev,
        [modeloArcoAtual]: {
          ...prev[modeloArcoAtual],
          config: novaConfig
        }
      }));
    }, 50); // 50ms de debounce
  };

  // Handlers para modelos de arcos
  const handleQuantidadeModelosChange = (quantidade) => {
    const qtd = parseInt(quantidade);
    setQuantidadeModelosArcos(qtd);

    const novosModelos = {};

    for (let i = 1; i <= qtd; i++) {
      let posicao, nome;

      if (qtd === 1) {
        // 1 modelo: serve para tudo
        posicao = "todos";
        nome = "Modelo Único";
      } else if (qtd === 2) {
        // 2 modelos: 1-Par, 2-Ímpar
        if (i === 1) {
          posicao = "par";
          nome = "Modelo Par";
        } else {
          posicao = "impar";
          nome = "Modelo Ímpar";
        }
      } else if (qtd === 3) {
        // 3 modelos: 1-Frente/Fundo, 2-Par, 3-Ímpar
        if (i === 1) {
          posicao = "frente_fundo";
          nome = "Modelo Frente/Fundo";
        } else if (i === 2) {
          posicao = "par";
          nome = "Modelo Par";
        } else {
          posicao = "impar";
          nome = "Modelo Ímpar";
        }
      } else if (qtd === 4) {
        // 4 modelos: 1-Frente, 2-Par, 3-Ímpar, 4-Fundo
        if (i === 1) {
          posicao = "frente";
          nome = "Modelo Frente";
        } else if (i === 2) {
          posicao = "par";
          nome = "Modelo Par";
        } else if (i === 3) {
          posicao = "impar";
          nome = "Modelo Ímpar";
        } else {
          posicao = "fundo";
          nome = "Modelo Fundo";
        }
      }

      novosModelos[i] = modelosArcos[i] || {
        posicao,
        config: { ...configArmazem },
        nome
      };
    }

    setModelosArcos(novosModelos);

    // Se o modelo atual não existe mais, voltar para o primeiro
    if (modeloArcoAtual > qtd) {
      setModeloArcoAtual(1);
      setConfigArmazem(novosModelos[1].config);
    }
  };

  const handleModeloArcoChange = (numeroModelo) => {
    setModeloArcoAtual(numeroModelo);
    setConfigArmazem(modelosArcos[numeroModelo].config);
  };

  const handlePosicaoArcoChange = (posicao) => {
    setModelosArcos(prev => ({
      ...prev,
      [modeloArcoAtual]: {
        ...prev[modeloArcoAtual],
        posicao
      }
    }));
  };

  const handleNomeModeloChange = (nome) => {
    setModelosArcos(prev => ({
      ...prev,
      [modeloArcoAtual]: {
        ...prev[modeloArcoAtual],
        nome
      }
    }));
  };

  // Função para determinar qual modelo usar baseado no arco atual
  const determinarModeloParaArco = (numeroArco) => {
    return determinarModeloParaArcoComModelos(numeroArco, modelosArcos);
  };

  // Função auxiliar para determinar modelo com parâmetros específicos
  const determinarModeloParaArcoComModelos = (numeroArco, modelos) => {
    if (!analiseArcos) return modelos[1];

    const totalArcos = analiseArcos.totalArcos;

    // 1 modelo: usar para tudo
    if (quantidadeModelosArcos === 1) {
      return Object.values(modelos).find(modelo => modelo.posicao === "todos") || modelos[1];
    }

    // 2 modelos: Par e Ímpar
    if (quantidadeModelosArcos === 2) {
      const isPar = numeroArco % 2 === 0;
      const posicaoProcurada = isPar ? "par" : "impar";
      return Object.values(modelos).find(modelo => modelo.posicao === posicaoProcurada) || modelos[1];
    }

    // 3 modelos: Frente/Fundo, Par, Ímpar
    if (quantidadeModelosArcos === 3) {
      // Primeiro e último arco usam modelo frente_fundo
      if (numeroArco === 1 || numeroArco === totalArcos) {
        return Object.values(modelos).find(modelo => modelo.posicao === "frente_fundo") || modelos[1];
      }

      // Arcos intermediários alternam entre par e ímpar
      const isPar = numeroArco % 2 === 0;
      const posicaoProcurada = isPar ? "par" : "impar";
      return Object.values(modelos).find(modelo => modelo.posicao === posicaoProcurada) || modelos[1];
    }

    // 4 modelos: Frente, Par, Ímpar, Fundo
    if (quantidadeModelosArcos === 4) {
      // Primeiro arco usa modelo "frente"
      if (numeroArco === 1) {
        return Object.values(modelos).find(modelo => modelo.posicao === "frente") || modelos[1];
      }

      // Último arco usa modelo "fundo"
      if (numeroArco === totalArcos) {
        return Object.values(modelos).find(modelo => modelo.posicao === "fundo") || modelos[1];
      }

      // Arcos intermediários alternam entre par e ímpar
      const isPar = numeroArco % 2 === 0;
      const posicaoProcurada = isPar ? "par" : "impar";
      return Object.values(modelos).find(modelo => modelo.posicao === posicaoProcurada) || modelos[1];
    }

    return modelos[1];
  };

  // Função para mudar arco e aplicar configuração correspondente
  const mudarArco = (novoArco) => {
    setArcoAtual(novoArco);

    // Determinar qual modelo usar para este arco
    const modeloParaArco = determinarModeloParaArco(novoArco);

    // Aplicar a configuração do modelo correspondente
    if (modeloParaArco && modeloParaArco.config) {
      setConfigArmazem(modeloParaArco.config);
    }

    if (dadosPortal) {
      const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(
        dadosPortal,
        novoArco,
      );
      setDados(dadosConvertidos);
    }
  };

  // Salvar apenas o modelo de arco atual
  const salvarModeloArco = () => {
    const nomeModelo = modelosArcos[modeloArcoAtual]?.nome || `Modelo Arco ${modeloArcoAtual}`;

    const dadosModelo = {
      posicao: modelosArcos[modeloArcoAtual].posicao,
      config: configArmazem,
      nome: nomeModelo,
      numeroModelo: modeloArcoAtual,
      timestamp: new Date().toISOString(),
      tipo: "modelo_arco_individual",
    };

    // Salvar modelo independente (não vinculado a armazém específico)
    localStorage.setItem(
      `modeloArco_${nomeModelo}`,
      JSON.stringify(dadosModelo),
    );

    // Atualizar também nos modelos locais
    setModelosArcos((prev) => ({
      ...prev,
      [modeloArcoAtual]: {
        ...prev[modeloArcoAtual],
        config: configArmazem,
      },
    }));

    alert(`Modelo de arco "${nomeModelo}" salvo com sucesso!`);
  };

  // Carregar modelo de arco específico
  const carregarModeloArco = (nomeModelo) => {
    const modeloSalvo = localStorage.getItem(`modeloArco_${nomeModelo}`);

    if (modeloSalvo) {
      const dadosModelo = JSON.parse(modeloSalvo);

      // Atualizar modelo atual nos modelos locais
      setModelosArcos((prev) => ({
        ...prev,
        [modeloArcoAtual]: {
          posicao: dadosModelo.posicao,
          config: dadosModelo.config,
          nome: dadosModelo.nome,
        },
      }));

      // Determinar qual modelo deve ser usado para o arco atual no preview
      const modeloParaArcoAtual = determinarModeloParaArco(arcoAtual);

      // Se o modelo carregado é o que deve ser usado para o arco atual, aplicar a configuração
      if (modeloParaArcoAtual && modeloParaArcoAtual.posicao === dadosModelo.posicao) {
        setConfigArmazem(dadosModelo.config);
      } else {
        // Se não, aplicar a configuração do modelo correto para o arco atual
        const modelosAtualizados = {
          ...modelosArcos,
          [modeloArcoAtual]: {
            posicao: dadosModelo.posicao,
            config: dadosModelo.config,
            nome: dadosModelo.nome,
          },
        };

        // Recalcular o modelo para o arco atual com os dados atualizados
        const modeloCorretoParaArco = determinarModeloParaArcoComModelos(arcoAtual, modelosAtualizados);
        if (modeloCorretoParaArco && modeloCorretoParaArco.config) {
          setConfigArmazem(modeloCorretoParaArco.config);
        }
      }

      alert(`Modelo de arco "${nomeModelo}" carregado com sucesso!`);
    } else {
      alert("Modelo de arco não encontrado!");
    }
  };

  // Listar modelos de arcos salvos
  const listarModelosArcosSalvos = () => {
    const prefixo = `modeloArco_`;
    const modelos = [];
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(prefixo)) {
        const nome = chave.replace(prefixo, "");
        modelos.push(nome);
      }
    }
    return modelos;
  };

  // Deletar modelo de arco
  const deletarModeloArco = (nomeModelo) => {
    localStorage.removeItem(`modeloArco_${nomeModelo}`);
    alert(`Modelo "${nomeModelo}" removido com sucesso!`);
    setForceUpdateLista((prev) => prev + 1);
  };

  // Salvar configuração completa do armazém (todos os modelos)
  const salvarConfiguracao = () => {
    if (!nomeConfiguracao.trim()) {
      alert("Digite um nome para salvar a configuração!");
      return;
    }

    if (tipoAtivo === "silo") {
      localStorage.setItem("configSilo", JSON.stringify(configSilo));
      localStorage.setItem(
        `configSilo_${nomeConfiguracao}`,
        JSON.stringify(configSilo),
      );
      alert(`Configuração Silo "${nomeConfiguracao}" salva com sucesso!`);
    } else {
      // Atualizar o modelo atual antes de salvar
      const modelosAtualizados = {
        ...modelosArcos,
        [modeloArcoAtual]: {
          ...modelosArcos[modeloArcoAtual],
          config: configArmazem,
        },
      };

      // Salvar configuração completa com todos os modelos
      const configCompleta = {
        nome: nomeConfiguracao,
        quantidadeModelos: quantidadeModelosArcos,
        modelosArcos: modelosAtualizados,
        modeloAtual: modeloArcoAtual,
        timestamp: new Date().toISOString(),
        versao: "2.0",
        tipo: "configuracao_armazem_completa",
      };

      localStorage.setItem("configArmazem", JSON.stringify(configCompleta));
      localStorage.setItem(
        `configArmazem_${nomeConfiguracao}`,
        JSON.stringify(configCompleta),
      );

      alert(
        `Configuração completa do armazém "${nomeConfiguracao}" salva com sucesso!`,
      );
    }

    setForceUpdateLista((prev) => prev + 1);
  };

  // Carregar configuração nomeada
  const carregarConfiguracao = (nome = nomeConfiguracao) => {
    if (!nome) return;

    const chave = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    const configSalva = localStorage.getItem(chave);

    if (configSalva) {
      const dadosCarregados = JSON.parse(configSalva);

      if (tipoAtivo === "silo") {
        setConfigSilo(dadosCarregados);
        alert("Configuração do silo carregada com sucesso!");
      } else {
        // Verificar se é uma configuração nova (com modelos) ou antiga
        if (
          dadosCarregados.modelosArcos &&
          dadosCarregados.tipo === "configuracao_armazem_completa"
        ) {
          // Configuração nova - carregar todos os modelos
          setQuantidadeModelosArcos(dadosCarregados.quantidadeModelos);
          setModelosArcos(dadosCarregados.modelosArcos);
          setModeloArcoAtual(dadosCarregados.modeloAtual);

          // Determinar qual modelo deve ser usado para o arco atual no preview
          const modeloParaArcoAtual = determinarModeloParaArcoComModelos(arcoAtual, dadosCarregados.modelosArcos);
          if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
            setConfigArmazem(modeloParaArcoAtual.config);
          } else {
            // Fallback para o modelo atual carregado
            const modeloAtualCarregado = dadosCarregados.modelosArcos[dadosCarregados.modeloAtual];
            if (modeloAtualCarregado) {
              setConfigArmazem(modeloAtualCarregado.config);
            }
          }

          alert(
            `Configuração completa do armazém "${nome}" carregada com ${dadosCarregados.quantidadeModelos} modelos de arcos!`,
          );
        } else {
          // Configuração antiga - converter para novo formato
          setConfigArmazem(dadosCarregados);
          setQuantidadeModelosArcos(1);
          setModelosArcos({
            1: {
              posicao: "todos",
              config: dadosCarregados,
              nome: "Modelo Único",
            },
          });
          setModeloArcoAtual(1);
          alert("Configuração antiga convertida para o novo formato!");
        }
      }
      setNomeConfiguracao(nome);
    } else {
      alert("Configuração não encontrada!");
    }
  };

  // Listar todas as configurações salvas
  const listarConfiguracoesSalvas = () => {
    const prefixo = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_`;
    const configs = [];

    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(prefixo)) {
        const nome = chave.replace(prefixo, "");
        configs.push(nome);
      }
    }

    return configs;
  };

  const configsDisponiveis = listarConfiguracoesSalvas();
  const configsMemoized = useMemo(
    () => configsDisponiveis,
    [forceUpdateLista, tipoAtivo],
  );

  // Deletar configuração
  const deletarConfiguracao = (nome) => {
    const chave = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    localStorage.removeItem(chave);
    alert(`Configuração "${nome}" removida com sucesso!`);
    setForceUpdateLista((prev) => prev + 1);
    if (nomeConfiguracao === nome) {
      setNomeConfiguracao("");
    }
  };

  // Resetar para padrão
  const resetarPadrao = () => {
    if (tipoAtivo === "silo") {
      setConfigSilo({
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 5,
        escala_sensores: 16,
        dist_y_sensores: 12,
        pos_x_cabos_uniforme: 1,
        pos_x_cabo: [50, 25],
        pos_y_cabo: [160, 160, 160, 160, 160],
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35,
      });
    } else {
      const configPadrao = {
        // Dimensões Básicas
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,

        // Configuração do Telhado
        tipo_telhado: 1,
        curvatura_topo: 30,

        // Configuração do Fundo
        tipo_fundo: 0,
        altura_fundo_reto: 10,

        // Configurações Funil V
        altura_funil_v: 40,
        posicao_ponta_v: 0,
        largura_abertura_v: 20,

        // Configurações Duplo V
        altura_duplo_v: 35,
        posicao_v_esquerdo: -0.5,
        posicao_v_direito: 0.5,
        largura_abertura_duplo_v: 15,

        // Configuração dos Sensores
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0,
      };

      setConfigArmazem(configPadrao);
      setQuantidadeModelosArcos(1);
      setModelosArcos({
        1: {
          posicao: "todos",
          config: configPadrao,
          nome: "Modelo Único",
        },
      });
      setModeloArcoAtual(1);
    }
  };

  // Calcular dimensões do SVG
  const calcularDimensoesSVG = () => {
    if (tipoAtivo === "silo") {
      const largura =
        configSilo.lb +
        (configSilo.aeradores_ativo ? configSilo.ds * 2 + 68 : 0);
      const altura = configSilo.hs + configSilo.hb * 1.75;
      return [largura, altura];
    } else {
      // Para armazém, usar as configurações do usuário
      const largura = Math.max(configArmazem.lb, 300);
      const altura = Math.max(configArmazem.pb + configArmazem.ht + 50, 200);
      return [largura, altura];
    }
  };

  const [larguraSVG, alturaSVG] = calcularDimensoesSVG();
  const transformSilo =
    tipoAtivo === "silo" && configSilo.aeradores_ativo
      ? `translate(${configSilo.ds + 34}, 0)`
      : "";

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Painel de Controles */}
        <div
          className="col-lg-3 col-md-4 bg-light border-end"
          style={{
            height: "100vh",
            overflowY: "auto",
            position: "fixed",
            top: "0",
            left: "0",
            zIndex: 1000,
            borderRight: "2px solid #dee2e6",
          }}
        >
          <div className="p-3">
            <h4 className="text-center mb-4">Modelador de Layouts</h4>

            {/* Seletor de Tipo */}
            <div className="mb-3">
              <label className="form-label fw-bold">Tipo de Estrutura:</label>
              <select
                className="form-select"
                value={tipoAtivo}
                onChange={(e) => setTipoAtivo(e.target.value)}
              >
                <option value="silo">Silo</option>
                <option value="armazem">Armazém</option>
              </select>
            </div>

            {/* Controles para Silo */}
            {tipoAtivo === "silo" && (
              <>
                <h6 className="mt-3 text-primary">Dimensões do Silo</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Largura Base: {configSilo.lb}px
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range me-2"
                      min="100"
                      max="400"
                      value={configSilo.lb}
                      onChange={(e) => handleSiloChange("lb", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSiloChange("lb", 200)}
                      title="Resetar para padrão (200)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Superior: {configSilo.hs}px
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range me-2"
                      min="100"
                      max="300"
                      value={configSilo.hs}
                      onChange={(e) => handleSiloChange("hs", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSiloChange("hs", 180)}
                      title="Resetar para padrão (180)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Base: {configSilo.hb}px
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range me-2"
                      min="5"
                      max="30"
                      value={configSilo.hb}
                      onChange={(e) => handleSiloChange("hb", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSiloChange("hb", 15)}
                      title="Resetar para padrão (15)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <h6 className="mt-3 text-primary">Sensores</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Escala Sensores: {configSilo.escala_sensores}px
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range me-2"
                      min="10"
                      max="25"
                      value={configSilo.escala_sensores}
                      onChange={(e) =>
                        handleSiloChange("escala_sensores", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSiloChange("escala_sensores", 16)}
                      title="Resetar para padrão (16)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Distância Y Sensores: {configSilo.dist_y_sensores}px
                  </label>
                  <div className="d-flex align-items-center">
                    <input
                      type="range"
                      className="form-range me-2"
                      min="8"
                      max="20"
                      value={configSilo.dist_y_sensores}
                      onChange={(e) =>
                        handleSiloChange("dist_y_sensores", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSiloChange("dist_y_sensores", 12)}
                      title="Resetar para padrão (12)"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <h6 className="mt-3 text-primary">Aeradores</h6>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={configSilo.aeradores_ativo}
                      onChange={(e) =>
                        handleSiloChange(
                          "aeradores_ativo",
                          e.target.checked ? 1 : 0,
                        )
                      }
                    />
                    <label className="form-check-label">Ativar Aeradores</label>
                  </div>
                </div>

                {configSilo.aeradores_ativo && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        Número de Aeradores: {configSilo.na}
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="range"
                          className="form-range me-2"
                          min="2"
                          max="6"
                          value={configSilo.na}
                          onChange={(e) => handleSiloChange("na", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSiloChange("na", 4)}
                          title="Resetar para padrão (4)"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Deslocamento Lateral: {configSilo.ds}px
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="range"
                          className="form-range me-2"
                          min="10"
                          max="60"
                          value={configSilo.ds}
                          onChange={(e) => handleSiloChange("ds", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSiloChange("ds", 30)}
                          title="Resetar para padrão (30)"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Distância entre Aeradores: {configSilo.da}px
                      </label>
                      <div className="d-flex align-items-center">
                        <input
                          type="range"
                          className="form-range me-2"
                          min="20"
                          max="60"
                          value={configSilo.da}
                          onChange={(e) => handleSiloChange("da", e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleSiloChange("da", 35)}
                          title="Resetar para padrão (35)"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Controles para Armazém */}
            {tipoAtivo === "armazem" && (
              <>
                {/* Seção 0: Configuração de Modelos de Arcos */}
                <div className="card mb-3">
                  <div className="card-header bg-dark text-white">
                    <h6 className="mb-0">🏗️ Modelos de Arcos do Armazém</h6>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">Quantidade de Modelos:</label>
                        <select
                          className="form-select"
                          value={quantidadeModelosArcos}
                          onChange={(e) => handleQuantidadeModelosChange(e.target.value)}
                        >
                          <option value={1}>1 Modelo</option>
                          <option value={2}>2 Modelos</option>
                          <option value={3}>3 Modelos</option>
                          <option value={4}>4 Modelos</option>
                        </select>
                      </div>
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">Modelo Atual:</label>
                        <select
                          className="form-select"
                          value={modeloArcoAtual}
                          onChange={(e) => handleModeloArcoChange(parseInt(e.target.value))}
                        >
                          {Array.from({ length: quantidadeModelosArcos }, (_, i) => {
                            const modeloNum = i + 1;
                            let descricaoModelo = "";

                            if (quantidadeModelosArcos === 1) {
                              descricaoModelo = "todos";
                            } else if (quantidadeModelosArcos === 2) {
                              descricaoModelo = modeloNum === 1 ? "par" : "impar";
                            } else if (quantidadeModelosArcos === 3) {
                              if (modeloNum === 1) descricaoModelo = "frente/fundo";
                              else if (modeloNum === 2) descricaoModelo = "par";
                              else descricaoModelo = "impar";
                            } else if (quantidadeModelosArcos === 4) {
                              if (modeloNum === 1) descricaoModelo = "frente";
                              else if (modeloNum === 2) descricaoModelo = "par";
                              else if (modeloNum === 3) descricaoModelo = "impar";
                              else descricaoModelo = "fundo";
                            }

                            return (
                              <option key={modeloNum} value={modeloNum}>
                                Modelo {modeloNum} - {descricaoModelo}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">Nome do Modelo:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={modelosArcos[modeloArcoAtual]?.nome || ""}
                          onChange={(e) => handleNomeModeloChange(e.target.value)}
                          placeholder="Nome do modelo"
                        />
                      </div>
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">Posição no Armazém:</label>
                        <select
                          className="form-select"
                          value={modelosArcos[modeloArcoAtual]?.posicao || "frente"}
                          onChange={(e) => handlePosicaoArcoChange(e.target.value)}
                        >
                          {quantidadeModelosArcos === 1 && (
                            <option value="todos">Todos os Arcos</option>
                          )}
                          {quantidadeModelosArcos === 2 && (
                            <>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">Ímpar (1º, 3º, 5º...)</option>
                            </>
                          )}
                          {quantidadeModelosArcos === 3 && (
                            <>
                              <option value="frente_fundo">Frente/Fundo (1º e Último)</option>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">Ímpar (3º, 5º, 7º...)</option>
                            </>
                          )}
                          {quantidadeModelosArcos === 4 && (
                            <>
                              <option value="frente">Frente (1º Arco)</option>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">Ímpar (3º, 5º, 7º...)</option>
                              <option value="fundo">Fundo (Último Arco)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="alert alert-info">
                      <strong>Configurando:</strong> {modelosArcos[modeloArcoAtual]?.nome || ""} 
                      <span className="badge bg-primary ms-2">
                        {modelosArcos[modeloArcoAtual]?.posicao || ""}
                      </span>
                      <br />
                      <small>
                        Ajuste as configurações abaixo para este modelo específico. 
                        As alterações são aplicadas em tempo real.
                      </small>
                    </div>

                    {/* Controles para salvar/carregar modelo individual */}
                    <div className="mt-3">
                      <div className="row mb-2">
                        <div className="col-lg-6 col-md-12 mb-2">
                          <button 
                            className="btn btn-success btn-sm w-100"
                            onClick={salvarModeloArco}
                          >
                            💾 Salvar Modelo Atual
                          </button>
                        </div>
                        <div className="col-lg-6 col-md-12 mb-2">
                          <select 
                            className="form-select form-select-sm"
                            onChange={(e) => e.target.value && carregarModeloArco(e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Carregar Modelo Salvo</option>
                            {listarModelosArcosSalvos().map(nome => (
                              <option key={nome} value={nome}>{nome}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Lista de modelos salvos */}
                      {listarModelosArcosSalvos().length > 0 && (
                        <div className="alert alert-light">
                          <h6>Modelos Salvos:</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {listarModelosArcosSalvos().map(nome => (
                              <span key={nome} className="badge bg-secondary position-relative">
                                {nome}
                                <button
                                  type="button"
                                  className="btn-close btn-close-white"
                                  style={{ fontSize: '8px', marginLeft: '5px' }}
                                  onClick={() => deletarModeloArco(nome)}
                                  aria-label="Close"
                                ></button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumo dos modelos */}
                    <div className="mt-3">
                      <h6>Resumo dos Modelos:</h6>
                      <div className="row">
                        {Array.from({ length: quantidadeModelosArcos }, (_, i) => (
                          <div key={i + 1} className="col-lg-6 col-md-12 col-sm-12 mb-2">
                            <div className={`card ${modeloArcoAtual === i + 1 ? 'border-primary' : ''}`}>
                              <div className="card-body p-2">
                                <small>
                                  <strong>Modelo {i + 1}:</strong> {modelosArcos[i + 1]?.posicao || ""}<br />
                                  {modelosArcos[i + 1]?.nome || ""}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 1: Dimensões Básicas */}
                <div className="card mb-3">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">📐 Dimensões Básicas do Armazém</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Profundidade Base (pb):
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="100"
                            max="300"
                            value={configArmazem.pb}
                            onChange={(e) =>
                              handleArmazemChange("pb", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.pb}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("pb", 185)}
                              title="Resetar para padrão (185)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">Largura Base (lb):</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="200"
                            max="500"
                            value={configArmazem.lb}
                            onChange={(e) =>
                              handleArmazemChange("lb", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.lb}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("lb", 350)}
                              title="Resetar para padrão (350)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">Altura Base (hb):</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="10"
                            max="80"
                            value={configArmazem.hb}
                            onChange={(e) =>
                              handleArmazemChange("hb", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.hb}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("hb", 30)}
                              title="Resetar para padrão (30)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Largura Frente (lf):
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="150"
                            max="350"
                            value={configArmazem.lf}
                            onChange={(e) =>
                              handleArmazemChange("lf", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.lf}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("lf", 250)}
                              title="Resetar para padrão (250)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Largura Estrutura (le):
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="5"
                            max="50"
                            value={configArmazem.le}
                            onChange={(e) =>
                              handleArmazemChange("le", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.le}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("le", 15)}
                              title="Resetar para padrão (15)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">Altura Teto (ht):</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="20"
                            max="100"
                            value={configArmazem.ht}
                            onChange={(e) =>
                              handleArmazemChange("ht", e.target.value)
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.ht}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("ht", 50)}
                              title="Resetar para padrão (50)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Configuração do Telhado */}
                <div className="card mb-3">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">🏠 Configuração do Telhado</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-12 col-md-12 mb-3">
                        <label className="form-label">Tipo do Telhado:</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <select
                            className="form-select me-2 flex-grow-1"
                            style={{ minWidth: "150px" }}
                            value={configArmazem.tipo_telhado}
                            onChange={(e) =>
                              handleArmazemChange("tipo_telhado", e.target.value)
                            }
                          >
                            <option value={1}>Pontudo</option>
                            <option value={2}>Arredondado</option>
                            <option value={3}>Arco</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleArmazemChange("tipo_telhado", 1)}
                            title="Resetar para padrão (Pontudo)"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="col-lg-12 col-md-12 mb-3">
                        <label className="form-label">Curvatura do Topo:</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="10"
                            max="80"
                            value={configArmazem.curvatura_topo}
                            onChange={(e) =>
                              handleArmazemChange(
                                "curvatura_topo",
                                e.target.value,
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.curvatura_topo}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("curvatura_topo", 30)}
                              title="Resetar para padrão (30)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Configuração do Fundo */}
                <div className="card mb-3">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0">⬇️ Configuração do Fundo</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-12 col-md-12 mb-3">
                        <label className="form-label">Tipo do Fundo:</label>
                        <div className="d-flex align-items-center flex-wrap">
                          <select
                            className="form-select me-2 flex-grow-1"
                            style={{ minWidth: "150px" }}
                            value={configArmazem.tipo_fundo}
                            onChange={(e) =>
                              handleArmazemChange("tipo_fundo", e.target.value)
                            }
                          >
                            <option value={0}>Reto</option>
                            <option value={1}>Funil/V</option>
                            <option value={2}>Duplo V</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleArmazemChange("tipo_fundo", 0)}
                            title="Resetar para padrão (Reto)"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Controles específicos para Fundo Reto */}
                    {configArmazem.tipo_fundo === 0 && (
                      <div className="alert alert-light">
                        <h6>Configurações do Fundo Reto:</h6>
                        <div className="row">
                          <div className="col-lg-12 col-md-12">
                            <label className="form-label">
                              Altura do Fundo Reto:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="0"
                                max="30"
                                value={configArmazem.altura_fundo_reto || 10}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_fundo_reto",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_fundo_reto || 10}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("altura_fundo_reto", 10)}
                                  title="Resetar para padrão (10)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Controles específicos para Funil V */}
                    {configArmazem.tipo_fundo === 1 && (
                      <div className="alert alert-light">
                        <h6>Configurações do Funil V:</h6>
                        <div className="row">
                          <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Altura do Funil:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="20"
                                max="80"
                                value={configArmazem.altura_funil_v || 40}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_funil_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_funil_v || 40}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("altura_funil_v", 40)}
                                  title="Resetar para padrão (40)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição da Ponta (Esq ← → Dir):
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="-1"
                                max="1"
                                step="0.1"
                                value={configArmazem.posicao_ponta_v || 0}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "posicao_ponta_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.posicao_ponta_v || 0}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("posicao_ponta_v", 0)}
                                  title="Resetar para padrão (0)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Largura da Abertura:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="5"
                                max="50"
                                value={configArmazem.largura_abertura_v || 20}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "largura_abertura_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.largura_abertura_v || 20}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("largura_abertura_v", 20)}
                                  title="Resetar para padrão (20)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Controles específicos para Duplo V */}
                    {configArmazem.tipo_fundo === 2 && (
                      <div className="alert alert-light">
                        <h6>Configurações do Duplo V:</h6>
                        <div className="row">
                          <div className="col-xxl-3 col-xl-4 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Altura dos Funis:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="20"
                                max="70"
                                value={configArmazem.altura_duplo_v || 35}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_duplo_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_duplo_v || 35}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("altura_duplo_v", 35)}
                                  title="Resetar para padrão (35)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-3 col-xl-4 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição V Esquerdo:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="-1"
                                max="0"
                                step="0.1"
                                value={configArmazem.posicao_v_esquerdo || -0.5}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "posicao_v_esquerdo",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.posicao_v_esquerdo || -0.5}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("posicao_v_esquerdo", -0.5)}
                                  title="Resetar para padrão (-0.5)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-3 col-xl-4 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição V Direito:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="0"
                                max="1"
                                step="0.1"
                                value={configArmazem.posicao_v_direito || 0.5}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "posicao_v_direito",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.posicao_v_direito || 0.5}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("posicao_v_direito", 0.5)}
                                  title="Resetar para padrão (0.5)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xxl-3 col-xl-4 col-lg-6 col-md-12 col-sm-12 mb-3">
                            <label className="form-label">
                              Largura das Aberturas:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="5"
                                max="40"
                                value={
                                  configArmazem.largura_abertura_duplo_v || 15
                                }
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "largura_abertura_duplo_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.largura_abertura_duplo_v || 15}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleArmazemChange("largura_abertura_duplo_v", 15)}
                                  title="Resetar para padrão (15)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção 4: Configuração dos Sensores */}
                <div className="card mb-3">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">🌡️ Configuração dos Sensores</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Escala dos Sensores:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="10"
                            max="30"
                            value={configArmazem.escala_sensores}
                            onChange={(e) =>
                              handleArmazemChange(
                                "escala_sensores",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.escala_sensores}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => handleArmazemChange("escala_sensores", 16)}
                              title="Resetar para padrão (16)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Distância Y Sensores:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="8"
                            max="20"
                            value={configArmazem.dist_y_sensores}
                            onChange={(e) =>
                              handleArmazemChange(
                                "dist_y_sensores",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.dist_y_sensores}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleArmazemChange("dist_y_sensores", 12)
                              }
                              title="Resetar para padrão (12)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Distância X Sensores:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="-100"
                            max="100"
                            value={configArmazem.dist_x_sensores}
                            onChange={(e) =>
                              handleArmazemChange(
                                "dist_x_sensores",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.dist_x_sensores}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleArmazemChange("dist_x_sensores", 0)
                              }
                              title="Resetar para padrão (0)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Posição Horizontal:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="-50"
                            max="50"
                            value={configArmazem.posicao_horizontal}
                            onChange={(e) =>
                              handleArmazemChange(
                                "posicao_horizontal",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.posicao_horizontal}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleArmazemChange("posicao_horizontal", 0)
                              }
                              title="Resetar para padrão (0)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Posição Vertical:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="-100"
                            max="100"
                            value={configArmazem.posicao_vertical}
                            onChange={(e) =>
                              handleArmazemChange(
                                "posicao_vertical",
                                e.target.value
                              )                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.posicao_vertical}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleArmazemChange("posicao_vertical", 0)
                              }
                              title="Resetar para padrão (0)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-12 col-sm-12 mb-3">
                        <label className="form-label">
                          Afastamento Vertical Pêndulo:
                        </label>
                        <div className="d-flex align-items-center flex-wrap">
                          <input
                            type="range"
                            className="form-range me-2 flex-grow-1"
                            style={{ minWidth: "120px" }}
                            min="-50"
                            max="50"
                            value={configArmazem.afastamento_vertical_pendulo || 0}
                            onChange={(e) =>
                              handleArmazemChange(
                                "afastamento_vertical_pendulo",
                                e.target.value
                              )
                            }
                          />
                          <div className="d-flex align-items-center">
                            <span className="badge bg-secondary me-2">
                              {configArmazem.afastamento_vertical_pendulo || 0}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleArmazemChange("afastamento_vertical_pendulo", 0)
                              }
                              title="Resetar para padrão (0)"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Botão de Reset */}
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-warning" onClick={resetarPadrao}>
                🔄 Resetar para Padrão
              </button>
            </div>

            <ModelConfigurationManager
              type={tipoAtivo}
              currentConfig={tipoAtivo === "silo" ? configSilo : configArmazem}
              onConfigurationLoad={(config, metadata) => {
                if (tipoAtivo === "silo") {
                  setConfigSilo(config);
                } else {
                  setConfigArmazem(config);
                }
                setNomeConfiguracao(metadata.name || "");
              }}
              onConfigurationSave={(name, config) => {
                setNomeConfiguracao(name);
                setForceUpdateLista((prev) => prev + 1);
              }}
            />
          </div>
        </div>

        {/* Área de Visualização */}
        <div
          className="col-lg-9 col-md-8"
          style={{
            marginLeft: "25%",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          <div
            className="d-flex justify-content-center align-items-center p-2"
            style={{ height: "90vh" }}
          >
            <div
              className="card w-100"
              style={{ height: "75vh", maxWidth: "100%" }}
            >
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  Preview - {tipoAtivo === "silo" ? "Silo" : `Armazém - ${modelosArcos[modeloArcoAtual]?.nome || "Modelo 1"}`}
                </h5>
                {tipoAtivo === "armazem" && (
                  <small>
                    Posição: {modelosArcos[modeloArcoAtual]?.posicao || "frente"} | 
                    Modelo {modeloArcoAtual} de {quantidadeModelosArcos}
                  </small>
                )}
              </div>
              <div
                className="card-body text-center d-flex align-items-center justify-content-center p-1"
                style={{ height: "calc(100% - 60px)" }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    border: "2px solid #ddd",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    shapeRendering: "geometricPrecision",
                    textRendering: "geometricPrecision",
                    imageRendering: "optimizeQuality",
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <style>
                    {`
                      .sensor-element {
                        transition: all 0.15s ease-out;
                      }
                      .pendulo-element {
                        transition: all 0.15s ease-out;
                      }
                      text {
                        transition: all 0.15s ease-out;
                      }
                      rect {
                        transition: all 0.15s ease-out;
                      }
                    `}
                  </style>
                  {tipoAtivo === "silo" ? (
                    <>
                      <g transform={transformSilo}>{renderFundoSilo()}</g>
                      {renderAeradoresSilo()}
                    </>
                  ) : (
                    <>
                      {renderFundoArmazem()}
                      <g>{renderSensoresArmazem()}</g>
                    </>
                  )}
                </svg>
              </div>

              {/* Navegação de Arcos para Armazém */}
              {tipoAtivo === "armazem" && analiseArcos && (
                <div className="card-footer bg-light">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => mudarArco(Math.max(1, arcoAtual - 1))}
                          disabled={arcoAtual <= 1}
                        >
                          ← Anterior
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() =>
                            mudarArco(
                              Math.min(analiseArcos.totalArcos, arcoAtual + 1),
                            )
                          }
                          disabled={arcoAtual >= analiseArcos.totalArcos}
                        >
                          Próximo →
                        </button>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <strong>
                        Arco {arcoAtual} de {analiseArcos.totalArcos}
                      </strong>
                      <br />
                      <small className="text-muted">
                        Aplicando: {determinarModeloParaArco(arcoAtual)?.nome || "Modelo padrão"}
                      </small>
                    </div>
                    <div className="col-md-4 text-end">
                      <span className="badge bg-info">
                        {analiseArcos.arcos[arcoAtual]?.totalPendulos || 0}{" "}
                        pêndulos,{" "}
                        {analiseArcos.arcos[arcoAtual]?.totalSensores || 0}{" "}
                        sensores
                      </span>
                      <br />
                      <span className={`badge mt-1 ${
                        quantidadeModelosArcos === 1 ? 'bg-info' :
                        quantidadeModelosArcos === 2 ? (arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning') :
                        quantidadeModelosArcos === 3 ? (
                          arcoAtual === 1 || arcoAtual === analiseArcos.totalArcos ? 'bg-success' :
                          arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning'
                        ) :
                        arcoAtual === 1 ? 'bg-success' : 
                        arcoAtual === analiseArcos.totalArcos ? 'bg-danger' :
                        arcoAtual % 2 === 0 ? 'bg-primary' : 'bg-warning'
                      }`}>
                        {quantidadeModelosArcos === 1 ? 'TODOS' :
                         quantidadeModelosArcos === 2 ? (arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR') :
                         quantidadeModelosArcos === 3 ? (
                           arcoAtual === 1 || arcoAtual === analiseArcos.totalArcos ? 'FRENTE/FUNDO' :
                           arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'
                         ) :
                         arcoAtual === 1 ? 'FRENTE' : 
                         arcoAtual === analiseArcos.totalArcos ? 'FUNDO' :
                         arcoAtual % 2 === 0 ? 'PAR' : 'ÍMPAR'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeladorSVG;