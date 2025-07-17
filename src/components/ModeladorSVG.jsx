import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

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
  const [modeloArcoAtual, setModeloArcoAtual] = useState(null);
  const [modelosArcos, setModelosArcos] = useState({
    1: {
      posicao: "todos", // todos, frente, par, impar, fundo, frente_fundo
      config: { ...configArmazem },
      nome: "Modelo Único",
    },
  });

  // Estados para modelos salvos (separados dos temporários)
  const [modelosSalvos, setModelosSalvos] = useState({});

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
          "/models/modeloRotaArmazemPortal_1751897945212.json",
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

  // Sempre iniciar com configuração padrão
  useEffect(() => {
    resetarModelosParaPadrao();
  }, []);

  // Aplicar deslocamento vertical correto quando componente carrega
  useEffect(() => {
    if (configArmazem.tipo_fundo !== undefined) {
      const deslocamentoPadrao = obterDeslocamentoVerticalPadrao(
        configArmazem.tipo_fundo,
      );
      if (configArmazem.deslocamento_vertical_fundo !== deslocamentoPadrao) {
        setConfigArmazem((prev) => ({
          ...prev,
          deslocamento_vertical_fundo: deslocamentoPadrao,
        }));
      }
    }
  }, [configArmazem.tipo_fundo]);

  // Função para resetar modelos para configuração padrão
  const resetarModelosParaPadrao = () => {
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
      altura_funil_v: 18,
      posicao_ponta_v: 0,
      inclinacao_funil_v: 1,

      // Configurações Duplo V
      altura_duplo_v: 22,
      posicao_v_esquerdo: -1,
      posicao_v_direito: 1,
      largura_abertura_duplo_v: 2,
      altura_plataforma_duplo_v: 0.3,
      largura_plataforma_duplo_v: 10,

      // Configurações de Movimentação do Fundo
      deslocamento_horizontal_fundo: 0,
      deslocamento_vertical_fundo: -1,

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
    setModeloArcoAtual(null); // Não selecionar modelo inicial
    setModelosSalvos({});
  };

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
    const afastamento_vertical_pendulo =
      configArmazem.afastamento_vertical_pendulo || 0;
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
        const ySensor =
          yPendulo - dist_y_sensores * s - 25 - afastamento_vertical_pendulo; // Aplicar distância Y configurada e afastamento vertical

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
    const afastamento_vertical_pendulo =
      configArmazem.afastamento_vertical_pendulo || 0;
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
          const xCaboBase =
            layoutArco.desenho_sensores.pos_x_cabo[penduloIndex];
          const distanciaDoMeio = penduloIndex - indiceCentral;
          const deslocamentoX = distanciaDoMeio * dist_x_sensores;
          const xCabo = xCaboBase + posicao_horizontal + deslocamentoX;

          // Atualizar posição do pêndulo
          const pendulo = document.getElementById(`C${penduloIndex + 1}`);
          const textoPendulo = document.getElementById(`TC${penduloIndex + 1}`);
          if (pendulo && textoPendulo) {
            // Aplicar transições suaves usando CSS
            pendulo.style.transition = "all 0.15s ease-out";
            textoPendulo.style.transition = "all 0.15s ease-out";

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
            const ySensor =
              yPendulo -
              dist_y_sensores * parseInt(s) -
              25 -
              afastamento_vertical_pendulo;

            const rec = document.getElementById(`C${penduloIndex + 1}S${s}`);
            const txt = document.getElementById(`TC${penduloIndex + 1}S${s}`);
            const nomeTexto = document.getElementById(
              `TIND${penduloIndex + 1}S${s}`,
            );

            if (!rec || !txt || !nomeTexto) return;

            // Aplicar transições suaves para todos os elementos
            rec.style.transition = "all 0.15s ease-out";
            txt.style.transition = "all 0.15s ease-out";
            nomeTexto.style.transition = "all 0.15s ease-out";

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
  }, [
    dados,
    arcoAtual,
    tipoAtivo,
    configArmazem.escala_sensores,
    configArmazem.dist_y_sensores,
    configArmazem.dist_x_sensores,
    configArmazem.posicao_horizontal,
    configArmazem.posicao_vertical,
    configArmazem.afastamento_vertical_pendulo,
  ]);

  // useEffect para reagir a mudanças nos modelos carregados e aplicar configuração correta
  useEffect(() => {
    if (
      tipoAtivo === "armazem" &&
      Object.keys(modelosArcos).length > 0 &&
      !modeloArcoAtual
    ) {
      // Se não há modelo selecionado para edição, aplicar configuração baseada no arco atual
      const modeloParaArco = determinarModeloParaArco(arcoAtual);
      if (modeloParaArco && modeloParaArco.config) {
        console.log(
          `Aplicando automaticamente configuração do modelo ${modeloParaArco.nome} para arco ${arcoAtual}`,
        );
        setConfigArmazem(modeloParaArco.config);
      }
    }
  }, [modelosArcos, arcoAtual, modeloArcoAtual, tipoAtivo]);

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
    const {
      pb,
      lb,
      hb,
      le,
      lf,
      altura_fundo_reto = 10,
      deslocamento_horizontal_fundo = 0,
      deslocamento_vertical_fundo = 0,
    } = configArmazem;

    // Ajuste base + deslocamentos do usuário
    const ajuste_base = -4 + deslocamento_vertical_fundo;
    const ajuste_horizontal = deslocamento_horizontal_fundo;

    // Usar altura_fundo_reto para definir a altura do fundo interno
    const altura_fundo_aplicada = altura_fundo_reto || 10;

    const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base];
    const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base];
    const p3 = [
      lb - (lb - lf) / 2 + ajuste_horizontal,
      pb - altura_fundo_aplicada + ajuste_base,
    ];
    const p4 = [
      (lb - lf) / 2 + ajuste_horizontal,
      pb - altura_fundo_aplicada + ajuste_base,
    ];
    const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base];
    const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base];
    const p7 = [0 + ajuste_horizontal, pb + ajuste_base];
    const p8 = [lb + ajuste_horizontal, pb + ajuste_base];

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
      inclinacao_funil_v = 1, // Nova funcionalidade de inclinação
      deslocamento_horizontal_fundo = 0,
      deslocamento_vertical_fundo = 0,
    } = configArmazem;

    // Calcular posição do centro
    const centroBase = lb / 2;
    const deslocamentoPonta = lb * 0.1 * posicao_ponta_v;
    const pontaX = centroBase + deslocamentoPonta;

    // Ajustar posição para alinhar melhor com a base + deslocamentos do usuário
    const ajuste_base = -4 + deslocamento_vertical_fundo;
    const ajuste_horizontal = deslocamento_horizontal_fundo;

    // Aplicar inclinação nas paredes do funil
    const inclinacao_direita = altura_funil_v * inclinacao_funil_v;
    const inclinacao_esquerda = altura_funil_v * inclinacao_funil_v;

    // Criar descida angular com inclinação ajustável
    const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]; // direita superior
    const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]; // início descida direita

    // Descida com inclinação até o ponto do V (lado direito)
    const p3 = [
      pontaX + largura_abertura_v / 2 + inclinacao_direita + ajuste_horizontal,
      pb - hb + ajuste_base + altura_funil_v,
    ]; // lado direito da abertura com inclinação
    const p4 = [
      pontaX - largura_abertura_v / 2 - inclinacao_esquerda + ajuste_horizontal,
      pb - hb + ajuste_base + altura_funil_v,
    ]; // lado esquerdo da abertura com inclinação

    // Descida com inclinação até o início esquerdo (lado esquerdo)
    const p5 = [le + ajuste_horizontal, pb - hb + ajuste_base]; // início descida esquerda

    // Completar o polígono
    const p6 = [0 + ajuste_horizontal, pb - hb + ajuste_base]; // esquerda superior
    const p7 = [0 + ajuste_horizontal, pb + ajuste_base]; // esquerda inferior
    const p8 = [lb + ajuste_horizontal, pb + ajuste_base]; // direita inferior

    const pontos = [p1, p2, p3, p4, p5, p6, p7, p8];
    const pathBase = pontos.map((p) => p.join(",")).join(" ");

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
      deslocamento_horizontal_fundo = 0,
      deslocamento_vertical_fundo = 0,
    } = configArmazem;

    const centroBase = lb / 2;

    // Calcular posições dos pontos baixos
    const pontaEsquerdaX = centroBase + lb * 0.2 * posicao_v_esquerdo;
    const pontaDireitaX = centroBase + lb * 0.2 * posicao_v_direito;

    // Ajustar posição para alinhar melhor com a base + deslocamentos do usuário
    const ajuste_base = -4 + deslocamento_vertical_fundo;
    const ajuste_horizontal = deslocamento_horizontal_fundo;

    // Criar descida angular como o fundo reto, mas com duas aberturas (duplo V)
    const p1 = [lb + ajuste_horizontal, pb - hb + ajuste_base]; // direita superior
    const p2 = [lb - le + ajuste_horizontal, pb - hb + ajuste_base]; // início descida direita

    // Descida reta para a primeira abertura (lado direito)
    const p3 = [
      pontaDireitaX + largura_abertura_duplo_v / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v,
    ]; // lado direito da abertura direita
    const p4 = [
      pontaDireitaX - largura_abertura_duplo_v / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v,
    ]; // lado esquerdo da abertura direita

    // Área central elevada (plataforma entre os dois V) - usando configuração do usuário
    const alturaPlataforma = configArmazem.altura_plataforma_duplo_v || 0.3;
    const larguraPlataforma = configArmazem.largura_plataforma_duplo_v || 40;
    const p5 = [
      centroBase + larguraPlataforma / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma,
    ]; // transição central direita
    const p6 = [
      centroBase - larguraPlataforma / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v * alturaPlataforma,
    ]; // transição central esquerda

    // Descida reta para a segunda abertura (lado esquerdo)
    const p7 = [
      pontaEsquerdaX + largura_abertura_duplo_v / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v,
    ]; // lado direito da abertura esquerda
    const p8 = [
      pontaEsquerdaX - largura_abertura_duplo_v / 2 + ajuste_horizontal,
      pb - hb + ajuste_base + altura_duplo_v,
    ]; // lado esquerdo da abertura esquerda

    // Descida reta até o início esquerdo (lado esquerdo)
    const p9 = [le + ajuste_horizontal, pb - hb + ajuste_base]; // início descida esquerda

    // Completar o polígono
    const p10 = [0 + ajuste_horizontal, pb - hb + ajuste_base]; // esquerda superior
    const p11 = [0 + ajuste_horizontal, pb + ajuste_base]; // esquerda inferior
    const p12 = [lb + ajuste_horizontal, pb + ajuste_base]; // direita inferior

    const pontos = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12];
    const pathBase = pontos.map((p) => p.join(",")).join(" ");

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

  // Função para obter deslocamento vertical padrão baseado no tipo de fundo
  const obterDeslocamentoVerticalPadrao = (tipoFundo) => {
    switch (tipoFundo) {
      case 0:
        return 0; // Reto
      case 1:
        return 7; // Funil V
      case 2:
        return 10; // Duplo V
      default:
        return 0;
    }
  };

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

    // Se o tipo de fundo mudou, ajustar automaticamente o deslocamento vertical para o padrão
    if (campo === "tipo_fundo") {
      novaConfig.deslocamento_vertical_fundo = obterDeslocamentoVerticalPadrao(
        parseFloat(valor),
      );
    }

    setConfigArmazem(novaConfig);

    // Atualizar modelo atual se estiver selecionado
    if (modeloArcoAtual) {
      const modelosAtualizados = {
        ...modelosArcos,
        [modeloArcoAtual]: {
          ...modelosArcos[modeloArcoAtual],
          config: novaConfig,
        },
      };
      setModelosArcos(modelosAtualizados);

      // Salvar automaticamente no localStorage
      salvarModelosAutomatico(modelosAtualizados);
    }
  };

  // Função para salvar modelos automaticamente no localStorage
  const salvarModelosAutomatico = (modelos) => {
    const configCompleta = {
      quantidadeModelos: quantidadeModelosArcos,
      modelosArcos: modelos,
      modeloAtual: modeloArcoAtual,
      timestamp: new Date().toISOString(),
      versao: "2.0",
      tipo: "configuracao_armazem_completa",
    };

    localStorage.setItem("configArmazem", JSON.stringify(configCompleta));
  };

  // Handlers para modelos de arcos
  const handleQuantidadeModelosChange = (quantidade) => {
    const qtd = parseInt(quantidade);
    setQuantidadeModelosArcos(qtd);

    const novosModelos = {};

    for (let i = 1; i <= qtd; i++) {
      let posicao, nome;

      if (qtd === 1) {
        // 1 modelo: todos são iguais
        posicao = "todos";
        nome = "Modelo Único";
      } else if (qtd === 2) {
        // 2 modelos: 1-Par (2º, 4º, 6º...), 2-Ímpar (1º, 3º, 5º...)
        if (i === 1) {
          posicao = "par";
          nome = "Modelo Par";
        } else {
          posicao = "impar";
          nome = "Modelo Ímpar";
        }
      } else if (qtd === 3) {
        // 3 modelos: 1-Frente/Fundo (1º e último), 2-Par (2º, 4º, 6º...), 3-Ímpar (3º, 5º, 7º...)
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
        // 4 modelos: 1-Frente (1º), 2-Par (2º, 4º, 6º...), 3-Ímpar (3º, 5º, 7º...), 4-Fundo (último)
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
        nome,
      };
    }

    setModelosArcos(novosModelos);

    // Se o modelo atual não existe mais, voltar para o primeiro
    if (modeloArcoAtual > qtd) {
      setModeloArcoAtual(1);
      setConfigArmazem(novosModelos[1].config);
    }

    // Salvar automaticamente
    salvarModelosAutomatico(novosModelos);
  };

  const handleModeloArcoChange = (numeroModelo) => {
    setModeloArcoAtual(numeroModelo);
    setConfigArmazem(modelosArcos[numeroModelo].config);

    // Salvar automaticamente ao trocar modelo
    salvarModelosAutomatico(modelosArcos);

    // Automação: navegar para arco representativo do modelo selecionado
    if (analiseArcos && modelosArcos[numeroModelo]) {
      const posicaoModelo = modelosArcos[numeroModelo].posicao;
      const totalArcos = analiseArcos.totalArcos;
      let arcoRepresentativo = 1; // padrão

      if (quantidadeModelosArcos === 1) {
        // 1 modelo: todos iguais - manter arco atual
        arcoRepresentativo = arcoAtual;
      } else if (quantidadeModelosArcos === 2) {
        // 2 modelos: ímpar (1º, 3º, 5º...) e par (2º, 4º, 6º...)
        if (posicaoModelo === "impar") {
          arcoRepresentativo = 1; // primeiro arco (ímpar)
        } else if (posicaoModelo === "par") {
          arcoRepresentativo = 2; // segundo arco (par)
        }
      } else if (quantidadeModelosArcos === 3) {
        // 3 modelos: frente_fundo/par/ímpar
        if (posicaoModelo === "frente_fundo") {
          arcoRepresentativo = 1; // primeiro arco
        } else if (posicaoModelo === "par") {
          arcoRepresentativo = 2; // segundo arco (par)
        } else if (posicaoModelo === "impar") {
          arcoRepresentativo = 3; // terceiro arco (ímpar)
        }
      } else if (quantidadeModelosArcos === 4) {
        // 4 modelos: frente/par/ímpar/fundo
        if (posicaoModelo === "frente") {
          arcoRepresentativo = 1; // primeiro arco
        } else if (posicaoModelo === "par") {
          arcoRepresentativo = 2; // segundo arco (par)
        } else if (posicaoModelo === "impar") {
          arcoRepresentativo = 3; // terceiro arco (ímpar)
        } else if (posicaoModelo === "fundo") {
          arcoRepresentativo = totalArcos; // último arco
        }
      }

      // Garantir que o arco está dentro dos limites
      arcoRepresentativo = Math.max(
        1,
        Math.min(totalArcos, arcoRepresentativo),
      );

      // Navegar para o arco representativo
      if (arcoRepresentativo !== arcoAtual) {
        mudarArco(arcoRepresentativo);
      }
    }
  };

  const handlePosicaoArcoChange = (posicao) => {
    const modelosAtualizados = {
      ...modelosArcos,
      [modeloArcoAtual]: {
        ...modelosArcos[modeloArcoAtual],
        posicao,
      },
    };
    setModelosArcos(modelosAtualizados);
    salvarModelosAutomatico(modelosAtualizados);
  };

  const handleNomeModeloChange = (nome) => {
    const modelosAtualizados = {
      ...modelosArcos,
      [modeloArcoAtual]: {
        ...modelosArcos[modeloArcoAtual],
        nome,
      },
    };
    setModelosArcos(modelosAtualizados);
    salvarModelosAutomatico(modelosAtualizados);
  };

  // Função para salvar modelo individual
  const salvarModeloAtual = () => {
    if (!modeloArcoAtual) {
      alert("Selecione um modelo para salvar!");
      return;
    }

    const modeloParaSalvar = {
      ...modelosArcos[modeloArcoAtual],
      config: configArmazem, // Usar a configuração atual
    };

    // Atualizar tanto modelosArcos quanto modelosSalvos
    const modelosAtualizados = {
      ...modelosArcos,
      [modeloArcoAtual]: modeloParaSalvar,
    };

    const novosSalvos = {
      ...modelosSalvos,
      [modeloArcoAtual]: modeloParaSalvar,
    };

    setModelosArcos(modelosAtualizados);
    setModelosSalvos(novosSalvos);
    
    // Salvar automaticamente no localStorage também
    salvarModelosAutomatico(modelosAtualizados);
    
    alert(
      `Modelo ${modeloArcoAtual} (${modeloParaSalvar.nome}) salvo com sucesso!`,
    );
  };

  // Função para determinar qual modelo usar baseado no arco atual
  const determinarModeloParaArco = (numeroArco) => {
    const resultado = determinarModeloParaArcoComModelos(
      numeroArco,
      modelosArcos,
    );
    console.log(`Determinando modelo para arco ${numeroArco}:`, resultado);
    return resultado;
  };

  // Função auxiliar para determinar modelo com parâmetros específicos
  const determinarModeloParaArcoComModelos = (numeroArco, modelos) => {
    const totalArcos = analiseArcos?.totalArcos || 1;
    const quantidadeModelos = Object.keys(modelos || {}).length;

    // Garantir que temos modelos válidos
    if (!modelos || quantidadeModelos === 0) {
      return null;
    }

    // 1 modelo: todos os arcos usam o mesmo modelo
    if (quantidadeModelos === 1) {
      return modelos[1] || null;
    }

    // 2 modelos: Par (2º, 4º, 6º...) e Ímpar (1º, 3º, 5º...)
    if (quantidadeModelos === 2) {
      const isImpar = numeroArco % 2 === 1;
      const posicaoProcurada = isImpar ? "impar" : "par";
      return (
        Object.values(modelos).find(
          (modelo) => modelo && modelo.posicao === posicaoProcurada,
        ) ||
        modelos[1] ||
        null
      );
    }

    // 3 modelos: Frente/Fundo (1º e último), Par (2º, 4º, 6º...), Ímpar (3º, 5º, 7º...)
    if (quantidadeModelos === 3) {
      // Primeiro e último arco usam modelo frente_fundo
      if (numeroArco === 1 || numeroArco === totalArcos) {
        return (
          Object.values(modelos).find(
            (modelo) => modelo && modelo.posicao === "frente_fundo",
          ) ||
          modelos[1] ||
          null
        );
      }

      // Arcos intermediários: a partir do 2º arco, par e ímpar
      const isParIntermediario = numeroArco % 2 === 0;
      const posicaoProcurada = isParIntermediario ? "par" : "impar";
      return (
        Object.values(modelos).find(
          (modelo) => modelo && modelo.posicao === posicaoProcurada,
        ) ||
        modelos[1] ||
        null
      );
    }

    // 4 modelos: Frente (1º), Par (2º, 4º, 6º...), Ímpar (3º, 5º, 7º...), Fundo (último)
    if (quantidadeModelos === 4) {
      // Primeiro arco usa modelo "frente"
      if (numeroArco === 1) {
        return (
          Object.values(modelos).find(
            (modelo) => modelo && modelo.posicao === "frente",
          ) ||
          modelos[1] ||
          null
        );
      }

      // Último arco usa modelo "fundo"
      if (numeroArco === totalArcos) {
        return (
          Object.values(modelos).find(
            (modelo) => modelo && modelo.posicao === "fundo",
          ) ||
          modelos[1] ||
          null
        );
      }

      // Arcos intermediários: a partir do 2º arco, par e ímpar
      const isParIntermediario = numeroArco % 2 === 0;
      const posicaoProcurada = isParIntermediario ? "par" : "impar";
      return (
        Object.values(modelos).find(
          (modelo) => modelo && modelo.posicao === posicaoProcurada,
        ) ||
        modelos[1] ||
        null
      );
    }

    return modelos[1] || null;
  };

  // Função para mudar arco e aplicar configuração correspondente
  const mudarArco = (novoArco, forcarAplicarConfiguracao = true) => {
    setArcoAtual(novoArco);

    // Só aplicar configuração se forçado (navegação automática) ou se não estiver editando um modelo específico
    if (forcarAplicarConfiguracao) {
      // Determinar qual modelo usar para este arco
      const modeloParaArco = determinarModeloParaArco(novoArco);

      // Aplicar a configuração do modelo correspondente
      if (modeloParaArco && modeloParaArco.config) {
        setConfigArmazem(modeloParaArco.config);
      }
    }

    if (dadosPortal) {
      const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(
        dadosPortal,
        novoArco,
      );
      setDados(dadosConvertidos);
    }
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
      // Verificar se todos os modelos foram salvos
      let modelosCompletos = true;
      const modelosSalvosCount = Object.keys(modelosSalvos).length;

      if (modelosSalvosCount !== quantidadeModelosArcos) {
        alert(
          `Atenção: Você tem ${quantidadeModelosArcos} modelos configurados, mas apenas ${modelosSalvosCount} foram salvos. Salve todos os modelos antes de salvar o armazém.`,
        );
        return;
      }

      // Garantir que todos os modelos estão atualizados com as configurações mais recentes
      const modelosParaSalvar = {};
      for (let i = 1; i <= quantidadeModelosArcos; i++) {
        if (modelosSalvos[i]) {
          // Se o modelo foi salvo, usar a configuração salva
          modelosParaSalvar[i] = modelosSalvos[i];
        } else if (modelosArcos[i]) {
          // Se não foi salvo, usar a configuração atual
          modelosParaSalvar[i] = {
            ...modelosArcos[i],
            config: i === modeloArcoAtual ? configArmazem : modelosArcos[i].config
          };
        }
      }

      // Salvar configuração completa com modelos atualizados
      const configCompleta = {
        nome: nomeConfiguracao,
        quantidadeModelos: quantidadeModelosArcos,
        modelosArcos: modelosParaSalvar,
        modeloAtual: null, // Resetar modelo atual
        timestamp: new Date().toISOString(),
        versao: "2.0",
        tipo: "configuracao_armazem_completa",
      };

      localStorage.setItem("configArmazem", JSON.stringify(configCompleta));
      localStorage.setItem(
        `configArmazem_${nomeConfiguracao}`,
        JSON.stringify(configCompleta),
      );

      // Mostrar detalhes dos modelos salvos
      const detalhesModelos = Object.entries(modelosParaSalvar)
        .map(([num, modelo]) => `${num}: ${modelo.nome} (${modelo.posicao})`)
        .join(", ");

      alert(
        `Configuração completa do armazém "${nomeConfiguracao}" salva com todos os ${quantidadeModelosArcos} modelos de arcos!\n\nModelos salvos: ${detalhesModelos}`,
      );

      // Após salvar, resetar TUDO para configuração padrão e limpar status salvos
      resetarModelosParaPadrao();
      setModelosSalvos({}); // Limpar modelos salvos
      setNomeConfiguracao("");
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
          console.log("Carregando configuração completa:", dadosCarregados);

          setQuantidadeModelosArcos(dadosCarregados.quantidadeModelos);
          setModelosArcos(dadosCarregados.modelosArcos);
          setModelosSalvos(dadosCarregados.modelosArcos); // Restaurar modelos salvos
          setModeloArcoAtual(null); // Não selecionar modelo inicial

          // Aguardar um momento para garantir que os estados foram atualizados
          setTimeout(() => {
            // Determinar qual modelo deve ser usado para o arco atual no preview
            const modeloParaArcoAtual = determinarModeloParaArcoComModelos(
              arcoAtual,
              dadosCarregados.modelosArcos,
            );
            console.log("Modelo para arco atual:", modeloParaArcoAtual);

            if (modeloParaArcoAtual && modeloParaArcoAtual.config) {
              setConfigArmazem(modeloParaArcoAtual.config);
              console.log(
                "Aplicando configuração do modelo:",
                modeloParaArcoAtual.nome,
              );
            } else {
              // Fallback para o primeiro modelo carregado
              const primeiroModelo = dadosCarregados.modelosArcos[1];
              if (primeiroModelo && primeiroModelo.config) {
                setConfigArmazem(primeiroModelo.config);
                console.log(
                  "Aplicando configuração do primeiro modelo como fallback",
                );
              }
            }
          }, 100);

          alert(
            `Configuração completa do armazém "${nome}" carregada com ${dadosCarregados.quantidadeModelos} modelos de arcos!`,
          );
        } else {
          // Configuração antiga - converter para novo formato
          setConfigArmazem(dadosCarregados);
          setQuantidadeModelosArcos(1);
          const modeloUnico = {
            posicao: "todos",
            config: dadosCarregados,
            nome: "Modelo Único",
          };
          setModelosArcos({ 1: modeloUnico });
          setModelosSalvos({ 1: modeloUnico }); // Salvar automaticamente
          setModeloArcoAtual(null);
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
        inclinacao_funil_v: 1,

        // Configurações Duplo V
        altura_duplo_v: 35,
        posicao_v_esquerdo: -0.5,
        posicao_v_direito: 0.5,
        largura_abertura_duplo_v: 15,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 40,

        // Configurações de Movimentação do Fundo (todos os tipos)
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,

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
          className="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles"
          style={{
            height: window.innerWidth <= 576 ? "auto" : "100vh",
            overflowY: window.innerWidth <= 576 ? "visible" : "auto",
            position: "relative",
            borderRight: "2px solid #dee2e6",
            backgroundColor: "#f8f9fa",
            zIndex: 1000,
            maxHeight: window.innerWidth <= 576 ? "none" : "100vh",
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
                          onChange={(e) =>
                            handleSiloChange("na", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleSiloChange("ds", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleSiloChange("da", e.target.value)
                          }
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
                        <label className="form-label">
                          Quantidade de Modelos:
                        </label>
                        <select
                          className="form-select"
                          value={quantidadeModelosArcos}
                          onChange={(e) =>
                            handleQuantidadeModelosChange(e.target.value)
                          }
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
                          value={modeloArcoAtual || ""}
                          onChange={(e) =>
                            handleModeloArcoChange(parseInt(e.target.value))
                          }
                        >
                          <option value="">Selecione Modelo</option>
                          {Array.from(
                            { length: quantidadeModelosArcos },
                            (_, i) => {
                              const modeloNum = i + 1;
                              let descricaoModelo = "";

                              if (quantidadeModelosArcos === 1) {
                                descricaoModelo = "todos";
                              } else if (quantidadeModelosArcos === 2) {
                                if (modeloNum === 1) {
                                  descricaoModelo = "par";
                                } else {
                                  descricaoModelo = "impar";
                                }
                              } else if (quantidadeModelosArcos === 3) {
                                if (modeloNum === 1) {
                                  descricaoModelo = "frente/fundo";
                                } else if (modeloNum === 2) {
                                  descricaoModelo = "par";
                                } else {
                                  descricaoModelo = "impar";
                                }
                              } else if (quantidadeModelosArcos === 4) {
                                if (modeloNum === 1) {
                                  descricaoModelo = "frente";
                                } else if (modeloNum === 2) {
                                  descricaoModelo = "par";
                                } else if (modeloNum === 3) {
                                  descricaoModelo = "impar";
                                } else {
                                  descricaoModelo = "fundo";
                                }
                              }

                              return (
                                <option key={modeloNum} value={modeloNum}>
                                  Modelo {modeloNum} - {descricaoModelo}
                                </option>
                              );
                            },
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">Nome do Modelo:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            modeloArcoAtual
                              ? modelosArcos[modeloArcoAtual]?.nome || ""
                              : ""
                          }
                          onChange={(e) =>
                            handleNomeModeloChange(e.target.value)
                          }
                          placeholder="Nome do modelo"
                          disabled={!modeloArcoAtual}
                        />
                      </div>
                      <div className="col-lg-6 col-md-12 mb-3">
                        <label className="form-label">
                          Posição no Armazém:
                        </label>
                        <select
                          className="form-select"
                          value={
                            modeloArcoAtual
                              ? modelosArcos[modeloArcoAtual]?.posicao || ""
                              : ""
                          }
                          onChange={(e) =>
                            handlePosicaoArcoChange(e.target.value)
                          }
                          disabled={!modeloArcoAtual}
                        >
                          {quantidadeModelosArcos === 1 && (
                            <option value="todos">Todos os Arcos</option>
                          )}
                          {quantidadeModelosArcos === 2 && (
                            <>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">
                                Ímpar (1º, 3º, 5º...)
                              </option>
                            </>
                          )}
                          {quantidadeModelosArcos === 3 && (
                            <>
                              <option value="frente_fundo">
                                Frente/Fundo (1º e Último)
                              </option>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">
                                Ímpar (3º, 5º, 7º...)
                              </option>
                            </>
                          )}
                          {quantidadeModelosArcos === 4 && (
                            <>
                              <option value="frente">Frente (1º Arco)</option>
                              <option value="par">Par (2º, 4º, 6º...)</option>
                              <option value="impar">
                                Ímpar (3º, 5º, 7º...)
                              </option>
                              <option value="fundo">Fundo (Último Arco)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {modeloArcoAtual && (
                      <div className="alert alert-info">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>EDITANDO:</strong>{" "}
                            {modelosArcos[modeloArcoAtual]?.nome ||
                              `Modelo ${modeloArcoAtual}`}
                            <span className="badge bg-primary ms-2">
                              {modelosArcos[modeloArcoAtual]?.posicao || ""}
                            </span>
                            {modelosSalvos[modeloArcoAtual] && (
                              <span className="badge bg-success ms-2">
                                SALVO
                              </span>
                            )}
                          </div>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={salvarModeloAtual}
                            title="Salvar este modelo"
                          >
                            💾 Salvar Modelo
                          </button>
                        </div>
                      </div>
                    )}

                    {!modeloArcoAtual && (
                      <div className="alert alert-warning">
                        <strong>⚠️ Nenhum modelo selecionado</strong>
                      </div>
                    )}

                    {/* Resumo dos modelos */}
                    <div className="mt-3">
                      <h6>Resumo dos Modelos:</h6>
                      <div className="row">
                        {Array.from(
                          { length: quantidadeModelosArcos },
                          (_, i) => (
                            <div
                              key={i + 1}
                              className="col-lg-6 col-md-12 col-sm-12 mb-2"
                            >
                              <div
                                className={`card ${modeloArcoAtual === i + 1 ? "border-primary" : ""}`}
                              >
                                <div className="card-body p-2">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <small>
                                      <strong>Modelo {i + 1}:</strong>{" "}
                                      {modelosArcos[i + 1]?.posicao || ""}
                                      <br />
                                      {modelosArcos[i + 1]?.nome || ""}
                                    </small>
                                    {modelosSalvos[i + 1] && (
                                      <span className="badge bg-success badge-sm">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          <strong>Status:</strong>{" "}
                          {Object.keys(modelosSalvos).length} de{" "}
                          {quantidadeModelosArcos} modelos salvos
                        </small>
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
                    <div className="mb-2">
                      <label className="small fw-bold">Profundidade Base (pb):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="100"
                          max="300"
                          value={configArmazem.pb}
                          onChange={(e) => handleArmazemChange("pb", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.pb}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("pb", 185)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Largura Base (lb):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="200"
                          max="500"
                          value={configArmazem.lb}
                          onChange={(e) => handleArmazemChange("lb", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.lb}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("lb", 350)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Altura Base (hb):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="10"
                          max="80"
                          value={configArmazem.hb}
                          onChange={(e) => handleArmazemChange("hb", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.hb}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("hb", 30)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Largura Frente (lf):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="150"
                          max="350"
                          value={configArmazem.lf}
                          onChange={(e) => handleArmazemChange("lf", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.lf}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("lf", 250)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Largura Estrutura (le):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="5"
                          max="50"
                          value={configArmazem.le}
                          onChange={(e) => handleArmazemChange("le", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.le}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("le", 15)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Altura Teto (ht):</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="20"
                          max="100"
                          value={configArmazem.ht}
                          onChange={(e) => handleArmazemChange("ht", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.ht}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("ht", 50)}
                          title="Reset"
                        >
                          ×
                        </button>
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
                    <div className="mb-2">
                      <label className="small fw-bold">Tipo do Telhado:</label>
                      <div className="input-group input-group-sm">
                        <select
                          className="form-select"
                          value={configArmazem.tipo_telhado}
                          onChange={(e) => handleArmazemChange("tipo_telhado", e.target.value)}
                        >
                          <option value={1}>Pontudo</option>
                          <option value={2}>Arredondado</option>
                          <option value={3}>Arco</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("tipo_telhado", 1)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Curvatura do Topo:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="10"
                          max="80"
                          value={configArmazem.curvatura_topo}
                          onChange={(e) => handleArmazemChange("curvatura_topo", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.curvatura_topo}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("curvatura_topo", 30)}
                          title="Reset"
                        >
                          ×
                        </button>
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
                    <div className="mb-2">
                      <label className="small fw-bold">Tipo do Fundo:</label>
                      <div className="input-group input-group-sm">
                        <select
                          className="form-select"
                          value={configArmazem.tipo_fundo}
                          onChange={(e) => handleArmazemChange("tipo_fundo", e.target.value)}
                        >
                          <option value={0}>Reto</option>
                          <option value={1}>Funil/V</option>
                          <option value={2}>Duplo V</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("tipo_fundo", 0)}
                          title="Reset"
                        >
                          ×
                        </button>
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
                                max="50"
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
                                  onClick={() =>
                                    handleArmazemChange("altura_fundo_reto", 10)
                                  }
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

                    {/* Controles de Movimentação do Fundo (para todos os tipos) */}
                    <div className="alert alert-warning p-2">
                      <h6 className="small">🔄 Movimentação do Fundo (Todos os Tipos):</h6>
                      <div className="mb-2">
                        <label className="small fw-bold">Deslocamento Horizontal:</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="range"
                            className="form-range"
                            min="-100"
                            max="100"
                            value={configArmazem.deslocamento_horizontal_fundo || 0}
                            onChange={(e) => handleArmazemChange("deslocamento_horizontal_fundo", e.target.value)}
                          />
                          <span className="input-group-text">{configArmazem.deslocamento_horizontal_fundo || 0}</span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleArmazemChange("deslocamento_horizontal_fundo", 0)}
                            title="Reset"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="small fw-bold">Deslocamento Vertical:</label>
                        <div className="input-group input-group-sm">
                          <input
                            type="range"
                            className="form-range"
                            min="-100"
                            max="100"
                            value={configArmazem.deslocamento_vertical_fundo || 0}
                            onChange={(e) => handleArmazemChange("deslocamento_vertical_fundo", e.target.value)}
                          />
                          <span className="input-group-text">{configArmazem.deslocamento_vertical_fundo || 0}</span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleArmazemChange("deslocamento_vertical_fundo", obterDeslocamentoVerticalPadrao(configArmazem.tipo_fundo))}
                            title="Reset"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Controles específicos para Funil V */}
                    {configArmazem.tipo_fundo === 1 && (
                      <div className="alert alert-light">
                        <h6>Configurações do Funil V:</h6>
                        <div className="row">
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Altura do Funil:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="10"
                                max="120"
                                value={configArmazem.altura_funil_v || 18}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_funil_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_funil_v || 18}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange("altura_funil_v", 18)
                                  }
                                  title="Resetar para padrão (18)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição da Ponta (Esq ← → Dir):
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="-2"
                                max="2"
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
                                  onClick={() =>
                                    handleArmazemChange("posicao_ponta_v", 0)
                                  }
                                  title="Resetar para padrão (0)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Largura da Abertura:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="2"
                                max="80"
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
                                  onClick={() =>
                                    handleArmazemChange(
                                      "largura_abertura_v",
                                      20,
                                    )
                                  }
                                  title="Resetar para padrão (20)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Inclinação das Paredes:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="0"
                                max="10"
                                step="0.1"
                                value={configArmazem.inclinacao_funil_v || 1}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "inclinacao_funil_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.inclinacao_funil_v || 1}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange("inclinacao_funil_v", 1)
                                  }
                                  title="Resetar para padrão (1)"
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
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Altura dos Funis:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="10"
                                max="120"
                                value={configArmazem.altura_duplo_v || 22}
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_duplo_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_duplo_v || 22}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange("altura_duplo_v", 22)
                                  }
                                  title="Resetar para padrão (22)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição V Esquerdo:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="-2"
                                max="0.5"
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
                                  {configArmazem.posicao_v_esquerdo || -1}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange(
                                      "posicao_v_esquerdo",
                                      -1,
                                    )
                                  }
                                  title="Resetar para padrão (-1)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Posição V Direito:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="-0.5"
                                max="2"
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
                                  {configArmazem.posicao_v_direito || 1}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange("posicao_v_direito", 1)
                                  }
                                  title="Resetar para padrão (1)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Largura das Aberturas:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="2"
                                max="80"
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
                                  {configArmazem.largura_abertura_duplo_v || 2}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange(
                                      "largura_abertura_duplo_v",
                                      2,
                                    )
                                  }
                                  title="Resetar para padrão (2)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Altura da Plataforma Central:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="0"
                                max="1"
                                step="0.1"
                                value={
                                  configArmazem.altura_plataforma_duplo_v || 0.3
                                }
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "altura_plataforma_duplo_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.altura_plataforma_duplo_v ||
                                    0.3}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange(
                                      "altura_plataforma_duplo_v",
                                      0.3,
                                    )
                                  }
                                  title="Resetar para padrão (0.3)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 mb-3">
                            <label className="form-label">
                              Largura da Plataforma Central:
                            </label>
                            <div className="d-flex align-items-center flex-wrap">
                              <input
                                type="range"
                                className="form-range me-2 flex-grow-1"
                                style={{ minWidth: "120px" }}
                                min="10"
                                max="120"
                                value={
                                  configArmazem.largura_plataforma_duplo_v || 40
                                }
                                onChange={(e) =>
                                  handleArmazemChange(
                                    "largura_plataforma_duplo_v",
                                    e.target.value,
                                  )
                                }
                              />
                              <div className="d-flex align-items-center">
                                <span className="badge bg-secondary me-2">
                                  {configArmazem.largura_plataforma_duplo_v ||
                                    10}
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    handleArmazemChange(
                                      "largura_plataforma_duplo_v",
                                      10,
                                    )
                                  }
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
                  </div>
                </div>

                {/* Seção 4: Configuração dos Sensores */}
                <div className="card mb-3">
                  <div className="card-header bg-success text-white">
                    <h6 className="mb-0">🌡️ Configuração dos Sensores</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <label className="small fw-bold">Escala dos Sensores:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="10"
                          max="30"
                          value={configArmazem.escala_sensores}
                          onChange={(e) => handleArmazemChange("escala_sensores", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.escala_sensores}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("escala_sensores", 16)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Distância Y Sensores:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="8"
                          max="20"
                          value={configArmazem.dist_y_sensores}
                          onChange={(e) => handleArmazemChange("dist_y_sensores", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.dist_y_sensores}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("dist_y_sensores", 12)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Distância X Sensores:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="-100"
                          max="100"
                          value={configArmazem.dist_x_sensores}
                          onChange={(e) => handleArmazemChange("dist_x_sensores", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.dist_x_sensores}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("dist_x_sensores", 0)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Posição Horizontal:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="-150"
                          max="150"
                          value={configArmazem.posicao_horizontal}
                          onChange={(e) => handleArmazemChange("posicao_horizontal", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.posicao_horizontal}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("posicao_horizontal", 0)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Posição Vertical:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="-100"
                          max="100"
                          value={configArmazem.posicao_vertical}
                          onChange={(e) => handleArmazemChange("posicao_vertical", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.posicao_vertical}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("posicao_vertical", 0)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <label className="small fw-bold">Afastamento Vertical Pêndulo:</label>
                      <div className="input-group input-group-sm">
                        <input
                          type="range"
                          className="form-range"
                          min="-50"
                          max="50"
                          value={configArmazem.afastamento_vertical_pendulo || 0}
                          onChange={(e) => handleArmazemChange("afastamento_vertical_pendulo", e.target.value)}
                        />
                        <span className="input-group-text">{configArmazem.afastamento_vertical_pendulo || 0}</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => handleArmazemChange("afastamento_vertical_pendulo", 0)}
                          title="Reset"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Botões de Reset */}
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-warning" onClick={resetarPadrao}>
                🔄 Resetar para Padrão
              </button>
              {tipoAtivo === "armazem" && (
                <button
                  className="btn btn-outline-warning"
                  onClick={resetarModelosParaPadrao}
                >
                  🗑️ Limpar Todos os Modelos
                </button>
              )}
            </div>

            {/* Gerenciador de Configurações */}
            <div className="card mt-3">
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">📋 Gerenciar Configurações</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nome da Configuração:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nomeConfiguracao}
                    onChange={(e) => setNomeConfiguracao(e.target.value)}
                    placeholder="Digite o nome para salvar/carregar"
                  />
                </div>

                <div className="d-grid gap-2 mb-3">
                  <button
                    className="btn btn-success"
                    onClick={salvarConfiguracao}
                    disabled={!nomeConfiguracao.trim()}
                  >
                    💾 Salvar {tipoAtivo === "silo" ? "Silo" : "Armazém"}{" "}
                    Completo
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => carregarConfiguracao(nomeConfiguracao)}
                    disabled={!nomeConfiguracao.trim()}
                  >
                    📂 Carregar Configuração
                  </button>
                </div>

                {/* Lista de configurações salvas */}
                {configsMemoized.length > 0 && (
                  <div className="alert alert-light">
                    <h6>Configurações Salvas:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {configsMemoized.map((nome) => (
                        <span
                          key={nome}
                          className="badge bg-secondary position-relative"
                        >
                          {nome}
                          <button
                            type="button"
                            className="btn-close btn-close-white"
                            style={{ fontSize: "8px", marginLeft: "5px" }}
                            onClick={() => deletarConfiguracao(nome)}
                            aria-label="Close"
                          ></button>
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        Clique em uma configuração para carregar rapidamente:
                      </small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {configsMemoized.map((nome) => (
                          <button
                            key={nome}
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setNomeConfiguracao(nome);
                              carregarConfiguracao(nome);
                            }}
                          >
                            {nome}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tipoAtivo === "armazem" && (
                  <div className="alert alert-info">
                    <small>
                      <strong>📌 Dica:</strong> Quando salvar um armazém, todos
                      os {quantidadeModelosArcos} modelos de arcos configurados
                      serão salvos junto. Ao carregar, a configuração completa
                      será restaurada com todos os modelos.
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Área de Visualização */}
        <div
          className="col-xl-9 col-lg-8 col-md-7 col-sm-12"
          style={{
            padding: "10px",
            height: window.innerWidth <= 576 ? "auto" : "100vh",
            overflow: window.innerWidth <= 576 ? "visible" : "hidden",
            minHeight: window.innerWidth <= 576 ? "400px" : "100vh",
          }}
        >
          <div
            className="d-flex justify-content-center align-items-center h-100"
            style={{ 
              minHeight: "400px"
            }}
          >
            <div
              className="card w-100"
              style={{ 
                maxWidth: "100%",
                minHeight: "400px",
                maxHeight: "calc(100vh - 60px)",
                height: "calc(100vh - 60px)"
              }}
            >
              <div className="card-header bg-primary text-white">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                  <h6 className="mb-1 mb-md-0">
                    Preview -{" "}
                    {tipoAtivo === "silo"
                      ? "Silo"
                      : `${modeloArcoAtual ? `EDITANDO: ${modelosArcos[modeloArcoAtual]?.nome || `Modelo ${modeloArcoAtual}`}` : "Visualização Geral"}`}
                  </h6>
                  {tipoAtivo === "armazem" && (
                    <small className="text-white-50">
                      {modeloArcoAtual ? (
                        <>
                          {quantidadeModelosArcos === 1
                            ? "Modelo Único"
                            : modelosArcos[modeloArcoAtual]?.posicao || ""}{" "}
                          | {modeloArcoAtual}/{quantidadeModelosArcos}
                        </>
                      ) : (
                        <>
                          {determinarModeloParaArco(arcoAtual)?.nome ||
                            "Padrão"}{" "}
                          | {quantidadeModelosArcos} modelo
                          {quantidadeModelosArcos > 1 ? "s" : ""}
                        </>
                      )}
                    </small>
                  )}
                </div>
              </div>
              <div
                className="card-body text-center d-flex align-items-center justify-content-center p-2"
                style={{ 
                  height: "calc(100vh - 250px)", 
                  overflow: "auto",
                  minHeight: "300px",
                  maxHeight: "calc(100vh - 250px)"
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "calc(100vh - 320px)",
                    minHeight: "250px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    shapeRendering: "geometricPrecision",
                    textRendering: "geometricPrecision",
                    imageRendering: "optimizeQuality",
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                  }}
                  preserveAspectRatio="xMidYMid meet"
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
                <div className="card-footer bg-light p-2">
                  <div className="row g-2 align-items-center">
                    <div className="col-lg-4 col-md-12 col-sm-12">
                      <div className="d-flex gap-1 justify-content-center justify-content-lg-start">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            mudarArco(Math.max(1, arcoAtual - 1), false)
                          }
                          disabled={arcoAtual <= 1}
                          title="Navegar livremente preservando configuração atual"
                        >
                          ← Anterior
                        </button>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            mudarArco(
                              Math.min(analiseArcos.totalArcos, arcoAtual + 1),
                              false,
                            )
                          }
                          disabled={arcoAtual >= analiseArcos.totalArcos}
                          title="Navegar livremente preservando configuração atual"
                        >
                          Próximo →
                        </button>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 text-center">
                      <div>
                        <strong className="text-nowrap">
                          Arco {arcoAtual}/{analiseArcos.totalArcos}
                        </strong>
                        {modeloArcoAtual && (
                          <span className="badge bg-warning text-dark ms-1">
                            EDIT
                          </span>
                        )}
                      </div>
                      <small className="text-muted d-block">
                        {determinarModeloParaArco(arcoAtual)?.nome ||
                          "Padrão"}
                      </small>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 text-center text-lg-end">
                      <div>
                        <span className="badge bg-info">
                          {analiseArcos.arcos[arcoAtual]?.totalPendulos || 0}P,{" "}
                          {analiseArcos.arcos[arcoAtual]?.totalSensores || 0}S
                        </span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`badge ${
                            quantidadeModelosArcos === 1
                              ? "bg-info"
                              : quantidadeModelosArcos === 2
                                ? arcoAtual % 2 === 1
                                  ? "bg-warning"
                                  : "bg-primary"
                                : quantidadeModelosArcos === 3
                                  ? arcoAtual === 1 ||
                                    arcoAtual === analiseArcos.totalArcos
                                    ? "bg-success"
                                    : arcoAtual % 2 === 0
                                      ? "bg-primary"
                                      : "bg-warning"
                                  : arcoAtual === 1
                                    ? "bg-success"
                                    : arcoAtual === analiseArcos.totalArcos
                                      ? "bg-danger"
                                      : arcoAtual % 2 === 0
                                        ? "bg-primary"
                                        : "bg-warning"
                          }`}
                        >
                          {quantidadeModelosArcos === 1
                            ? "TODOS"
                            : quantidadeModelosArcos === 2
                              ? arcoAtual % 2 === 1
                                ? "ÍMPAR"
                                : "PAR"
                              : quantidadeModelosArcos === 3
                                ? arcoAtual === 1 ||
                                  arcoAtual === analiseArcos.totalArcos
                                  ? "F/F"
                                  : arcoAtual % 2 === 0
                                    ? "PAR"
                                    : "ÍMPAR"
                                : arcoAtual === 1
                                  ? "FRENTE"
                                  : arcoAtual === analiseArcos.totalArcos
                                    ? "FUNDO"
                                    : arcoAtual % 2 === 0
                                      ? "PAR"
                                      : "ÍMPAR"}
                        </span>
                      </div>
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