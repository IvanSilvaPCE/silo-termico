
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import armazemDataLoader from '../utils/armazemDataLoader';

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

  // Estados para configurações do Armazém
  const [configArmazem, setConfigArmazem] = useState({
    pb: 185, // posição base
    lb: 350, // largura base
    hb: 30, // altura base
    hf: 5, // altura frente
    lf: 250, // largura frente
    le: 15, // largura entrada
    ht: 50, // altura telhado
    tipo_telhado: 1, // 1 = arco pontudo, 2 = arredondado, 3 = arco
    tipo_fundo: 0, // 0 = reto, 1 = funil/V, 2 = duplo V
    intensidade_fundo: 20, // intensidade do V/funil
    curvatura_topo: 30, // curvatura quando arredondado
    escala_sensores: 16,
    dist_y_sensores: 12,
    pos_x_cabo: [62, 52, 158, 208, 258],
    pos_y_cabo: [181, 181, 181, 181, 181],
    posicionamento_automatico: true,
  });

  const [tipoAtivo, setTipoAtivo] = useState("silo");
  const [nomeConfiguracao, setNomeConfiguracao] = useState("");
  const [forceUpdateLista, setForceUpdateLista] = useState(0);
  const [dadosArmazemJSON, setDadosArmazemJSON] = useState(null);
  const [dimensoesSVGArmazem, setDimensoesSVGArmazem] = useState({ largura: 350, altura: 200 });

  // Calcular dimensões ideais do SVG baseado nos dados JSON
  const calcularDimensoesIdeaisArmazem = (dadosJSON) => {
    if (!dadosJSON) return { largura: 350, altura: 200 };

    // Usar dimensões do layout JSON se disponíveis
    if (dadosJSON.layout && dadosJSON.layout.dimensoes) {
      return {
        largura: dadosJSON.layout.dimensoes.largura_svg,
        altura: dadosJSON.layout.dimensoes.altura_svg
      };
    }

    let maxSensores = 0;
    let maxArcos = 0;

    // Encontrar o máximo de sensores e arcos
    if (dadosJSON.layout && dadosJSON.layout.arcos) {
      maxArcos = dadosJSON.layout.arcos.length;
      dadosJSON.layout.arcos.forEach(arco => {
        maxSensores = Math.max(maxSensores, arco.sensores.length);
      });
    }

    const escala_sensores = configArmazem.escala_sensores;
    const dist_y_sensores = configArmazem.dist_y_sensores;
    const margemSuperior = 30;
    const margemInferior = 50;
    const margemPendulo = 20;

    // Calcular altura necessária
    const alturaBaseTelhado = configArmazem.pb;
    const alturaSensores = maxSensores * dist_y_sensores + escala_sensores;
    const alturaTotal = Math.max(
      alturaBaseTelhado, 
      margemSuperior + alturaSensores + margemInferior + margemPendulo
    );

    // Calcular largura necessária
    const larguraMinima = configArmazem.lb;
    const espacamentoPendulo = 30;
    const larguraCalculada = Math.max(larguraMinima, (maxArcos * espacamentoPendulo) + 100);

    return {
      largura: larguraCalculada,
      altura: Math.max(alturaTotal, 250)
    };
  };

  // Carregar configurações salvas e dados do JSON
  useEffect(() => {
    const configSalvaSilo = localStorage.getItem("configSilo");
    const configSalvaArmazem = localStorage.getItem("configArmazem");

    if (configSalvaSilo) {
      setConfigSilo(JSON.parse(configSalvaSilo));
    }
    if (configSalvaArmazem) {
      setConfigArmazem(JSON.parse(configSalvaArmazem));
    }

    // Carregar dados do JSON do armazém
    const carregarDadosJSON = async () => {
      try {
        const dados = await armazemDataLoader.carregarDados();
        setDadosArmazemJSON(dados);
        
        // Calcular dimensões baseado nos dados
        const dimensoes = calcularDimensoesIdeaisArmazem(dados);
        setDimensoesSVGArmazem(dimensoes);
      } catch (error) {
        console.error('Erro ao carregar dados JSON:', error);
      }
    };

    carregarDadosJSON();
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

  // Funções de renderização do Armazém
  

  const renderSensoresArmazem = () => {
    const elementos = [];
    
    if (!dadosArmazemJSON || !dadosArmazemJSON.layout || !dadosArmazemJSON.layout.arcos) {
      return elementos;
    }

    // Renderizar arcos baseado nos dados JSON
    dadosArmazemJSON.layout.arcos.forEach((arco) => {
      const xCabo = arco.pos_x;
      const yCabo = dimensoesSVGArmazem.altura - 35;

      // Retângulo do nome do arco
      elementos.push(
        <rect
          key={`arco-${arco.id}`}
          x={xCabo - configArmazem.escala_sensores/2}
          y={yCabo}
          width={configArmazem.escala_sensores}
          height={configArmazem.escala_sensores/2}
          rx="2"
          ry="2"
          fill="#3A78FD"
        />
      );

      // Texto do nome do arco
      elementos.push(
        <text
          key={`texto-arco-${arco.id}`}
          x={xCabo}
          y={yCabo + configArmazem.escala_sensores/4}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontSize={configArmazem.escala_sensores * 0.4 - 0.5}
          fontFamily="Arial"
          fill="white"
        >
          A{arco.id}
        </text>
      );

      // Renderizar sensores do arco
      arco.sensores.forEach((sensor) => {
        const ySensor = sensor.pos_y;
        const dadosSensor = dadosArmazemJSON.sensores[sensor.id.toString()];
        
        if (!dadosSensor) return;

        const { temperatura, falha, ativo } = dadosSensor;
        
        // Garantir que está dentro dos limites do SVG
        if (ySensor > 10 && ySensor < (dimensoesSVGArmazem.altura - 50)) {
          // Determinar cor do sensor baseado na temperatura
          let corSensor = "#ccc";
          if (ativo && temperatura > 0) {
            if (temperatura < 12) corSensor = "#0384fc";
            else if (temperatura < 15) corSensor = "#03e8fc";
            else if (temperatura < 17) corSensor = "#03fcbe";
            else if (temperatura < 21) corSensor = "#07fc03";
            else if (temperatura < 25) corSensor = "#c3ff00";
            else if (temperatura < 27) corSensor = "#fcf803";
            else if (temperatura < 30) corSensor = "#ffb300";
            else if (temperatura < 35) corSensor = "#ff2200";
            else if (temperatura < 50) corSensor = "#ff0090";
            else corSensor = "#f700ff";
          } else {
            corSensor = "#e6e6e6";
          }

          // Retângulo do sensor
          elementos.push(
            <rect
              key={`sensor-${arco.id}-${sensor.id}`}
              x={xCabo - configArmazem.escala_sensores/2}
              y={ySensor}
              width={configArmazem.escala_sensores}
              height={configArmazem.escala_sensores/2}
              rx="2"
              ry="2"
              fill={corSensor}
              stroke="black"
              strokeWidth="1"
            />
          );

          // Texto do valor do sensor
          elementos.push(
            <text
              key={`texto-sensor-${arco.id}-${sensor.id}`}
              x={xCabo}
              y={ySensor + configArmazem.escala_sensores/4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={configArmazem.escala_sensores * 0.4 - 0.5}
              fontFamily="Arial"
              fill={corSensor === "#ff2200" ? "white" : "black"}
            >
              {falha ? "ERRO" : temperatura.toFixed(1)}
            </text>
          );

          // Nome do sensor (S1, S2, etc.)
          elementos.push(
            <text
              key={`nome-sensor-${arco.id}-${sensor.id}`}
              x={xCabo - configArmazem.escala_sensores/2 - 2}
              y={ySensor + configArmazem.escala_sensores/4}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={configArmazem.escala_sensores * 0.4 - 1.5}
              fontFamily="Arial"
              fill="black"
            >
              S{sensor.id}
            </text>
          );
        }
      });
    });

    return elementos;
  };

  const renderFundoArmazem = () => {
    const {
      tipo_telhado,
      tipo_fundo,
      intensidade_fundo,
      curvatura_topo,
      hb,
      hf,
      le,
      ht,
    } = configArmazem;

    // Usar dimensões dinâmicas
    const pb = dimensoesSVGArmazem.altura - 50;
    const lb = dimensoesSVGArmazem.largura;
    const lf = Math.min(configArmazem.lf, lb * 0.7);

    // Base com diferentes tipos de fundo
    let pathBase = "";
    let polBase = null;

    if (tipo_fundo === 0) {
      // Fundo reto (original)
      const p1 = [lb, pb - hb],
        p2 = [lb - le, pb - hb],
        p3 = [lb - (lb - lf) / 2, pb - hf],
        p4 = [(lb - lf) / 2, pb - hf],
        p5 = [le, pb - hb],
        p6 = [0, pb - hb],
        p7 = [0, pb],
        p8 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;

      polBase = <polygon fill="#999999" id="des_fundo" points={pathBase} />;
    } else if (tipo_fundo === 1) {
      // Funil/V
      const p1 = [lb, pb - hb],
        p2 = [lb - le, pb - hb],
        p3 = [lb - (lb - lf) / 2, pb - hf],
        p4 = [(lb - lf) / 2, pb - hf],
        p5 = [le, pb - hb],
        p6 = [0, pb - hb],
        p7 = [intensidade_fundo, pb],
        p8 = [lb / 2, pb - intensidade_fundo],
        p9 = [lb - intensidade_fundo, pb],
        p10 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")} ${p9.join(",")} ${p10.join(",")}`;

      polBase = <polygon fill="#999999" id="des_fundo" points={pathBase} />;
    } else if (tipo_fundo === 2) {
      // Duplo V
      const p1 = [lb, pb - hb],
        p2 = [lb - le, pb - hb],
        p3 = [lb - (lb - lf) / 2, pb - hf],
        p4 = [(lb - lf) / 2, pb - hf],
        p5 = [le, pb - hb],
        p6 = [0, pb - hb],
        p7 = [intensidade_fundo, pb],
        p8 = [lb / 4, pb - intensidade_fundo],
        p9 = [lb / 2, pb],
        p10 = [(lb * 3) / 4, pb - intensidade_fundo],
        p11 = [lb - intensidade_fundo, pb],
        p12 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")} ${p9.join(",")} ${p10.join(",")} ${p11.join(",")} ${p12.join(",")}`;

      polBase = <polygon fill="#999999" id="des_fundo" points={pathBase} />;
    }

    // Telhado com diferentes formatos
    let polTelhado = null;

    if (tipo_telhado === 1) {
      // Pontudo (original)
      const p1_ = [(lb - lf) / 2, pb - hf],
        p2_ = [le, pb - hb],
        p3_ = [le, pb - ht],
        p4_ = [lb / 2, 1],
        p5_ = [lb - le, pb - ht],
        p6_ = [lb - le, pb - hb],
        p7_ = [lb - (lb - lf) / 2, pb - hf];
      const pathTelhado = `${p1_.join(",")} ${p2_.join(",")} ${p3_.join(",")} ${p4_.join(",")} ${p5_.join(",")} ${p6_.join(",")} ${p7_.join(",")}`;

      polTelhado = (
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
      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf}
        L ${le} ${pb - hb}
        L ${le} ${pb - ht}
        Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb}
        L ${lb - (lb - lf) / 2} ${pb - hf}
        Z
      `;

      polTelhado = (
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
      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf}
        L ${le} ${pb - hb}
        L ${le} ${pb - ht}
        A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb}
        L ${lb - (lb - lf) / 2} ${pb - hf}
        Z
      `;

      polTelhado = (
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

    return (
      <>
        {polTelhado}
        {polBase}
      </>
    );
  };

  // Handlers para mudança de configuração
  const handleSiloChange = (campo, valor) => {
    setConfigSilo((prev) => ({
      ...prev,
      [campo]: parseFloat(valor),
    }));
  };

  const handleArmazemChange = (campo, valor) => {
    setConfigArmazem((prev) => ({
      ...prev,
      [campo]: parseFloat(valor),
    }));
  };

  

  // Salvar configuração
  const salvarConfiguracao = () => {
    if (!nomeConfiguracao.trim()) {
      alert('Digite um nome para salvar a configuração!');
      return;
    }

    if (tipoAtivo === "silo") {
      localStorage.setItem("configSilo", JSON.stringify(configSilo));
      localStorage.setItem(
        `configSilo_${nomeConfiguracao}`,
        JSON.stringify(configSilo),
      );
    } else {
      localStorage.setItem("configArmazem", JSON.stringify(configArmazem));
      localStorage.setItem(
        `configArmazem_${nomeConfiguracao}`,
        JSON.stringify(configArmazem),
      );
    }
    alert(`Configuração ${tipoAtivo} "${nomeConfiguracao}" salva com sucesso!`);
    setForceUpdateLista(prev => prev + 1);
  };

  // Carregar configuração nomeada
  const carregarConfiguracao = (nome = nomeConfiguracao) => {
    if (!nome) return;

    const chave = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    const configSalva = localStorage.getItem(chave);

    if (configSalva) {
      if (tipoAtivo === "silo") {
        setConfigSilo(JSON.parse(configSalva));
      } else {
        setConfigArmazem(JSON.parse(configSalva));
      }
      setNomeConfiguracao(nome);
      alert("Configuração carregada com sucesso!");
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
        const nome = chave.replace(prefixo, '');
        configs.push(nome);
      }
    }

    return configs;
  };

  const configsDisponiveis = listarConfiguracoesSalvas();
  const configsMemoized = useMemo(() => configsDisponiveis, [forceUpdateLista, tipoAtivo]);

  // Deletar configuração
  const deletarConfiguracao = (nome) => {
    const chave = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_${nome}`;
    localStorage.removeItem(chave);
    alert(`Configuração "${nome}" removida com sucesso!`);
    setForceUpdateLista(prev => prev + 1);
    if (nomeConfiguracao === nome) {
      setNomeConfiguracao("");
    }
  };

  // Reset para padrão
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
      setConfigArmazem({
        pb: 185,
        lb: 350,
        hb: 30,
        hf: 5,
        lf: 250,
        le: 15,
        ht: 50,
        tipo_telhado: 1,
        tipo_fundo: 0,
        intensidade_fundo: 20,
        curvatura_topo: 30,
        escala_sensores: 16,
        dist_y_sensores: 12,
        pos_x_cabo: [62, 52, 158, 208, 258],
        pos_y_cabo: [181, 181, 181, 181, 181],
        posicionamento_automatico: true,
      });
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
      return [dimensoesSVGArmazem.largura, dimensoesSVGArmazem.altura];
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
            height: '100vh', 
            overflowY: 'auto',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: 1000,
            borderRight: '2px solid #dee2e6'
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
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="400"
                    value={configSilo.lb}
                    onChange={(e) => handleSiloChange("lb", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Superior: {configSilo.hs}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="300"
                    value={configSilo.hs}
                    onChange={(e) => handleSiloChange("hs", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Base: {configSilo.hb}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="5"
                    max="30"
                    value={configSilo.hb}
                    onChange={(e) => handleSiloChange("hb", e.target.value)}
                  />
                </div>

                <h6 className="mt-3 text-primary">Sensores</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Escala Sensores: {configSilo.escala_sensores}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="25"
                    value={configSilo.escala_sensores}
                    onChange={(e) => handleSiloChange("escala_sensores", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Distância Y Sensores: {configSilo.dist_y_sensores}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="8"
                    max="20"
                    value={configSilo.dist_y_sensores}
                    onChange={(e) => handleSiloChange("dist_y_sensores", e.target.value)}
                  />
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
                    <label className="form-check-label">
                      Ativar Aeradores
                    </label>
                  </div>
                </div>

                {configSilo.aeradores_ativo && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">
                        Número de Aeradores: {configSilo.na}
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="2"
                        max="6"
                        value={configSilo.na}
                        onChange={(e) =>
                          handleSiloChange("na", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Deslocamento Lateral: {configSilo.ds}px
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="10"
                        max="60"
                        value={configSilo.ds}
                        onChange={(e) =>
                          handleSiloChange("ds", e.target.value)
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Distância entre Aeradores: {configSilo.da}px
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="20"
                        max="60"
                        value={configSilo.da}
                        onChange={(e) =>
                          handleSiloChange("da", e.target.value)
                        }
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Controles para Armazém */}
            {tipoAtivo === "armazem" && (
              <>
                <h6 className="mt-3 text-primary">Dimensões do Armazém</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Largura Base: {configArmazem.lb}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="200"
                    max="500"
                    value={configArmazem.lb}
                    onChange={(e) =>
                      handleArmazemChange("lb", e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Posição Base: {configArmazem.pb}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="150"
                    max="300"
                    value={configArmazem.pb}
                    onChange={(e) =>
                      handleArmazemChange("pb", e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Base: {configArmazem.hb}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="20"
                    max="60"
                    value={configArmazem.hb}
                    onChange={(e) =>
                      handleArmazemChange("hb", e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Largura Frente: {configArmazem.lf}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="100"
                    max="400"
                    value={configArmazem.lf}
                    onChange={(e) =>
                      handleArmazemChange("lf", e.target.value)
                    }
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Altura Telhado: {configArmazem.ht}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="20"
                    max="100"
                    value={configArmazem.ht}
                    onChange={(e) =>
                      handleArmazemChange("ht", e.target.value)
                    }
                  />
                </div>

                <h6 className="mt-3 text-primary">Formato do Telhado</h6>
                <div className="mb-3">
                  <label className="form-label">Tipo de Telhado:</label>
                  <select
                    className="form-select"
                    value={configArmazem.tipo_telhado}
                    onChange={(e) =>
                      handleArmazemChange("tipo_telhado", e.target.value)
                    }
                  >
                    <option value="1">Pontudo</option>
                    <option value="2">Arredondado</option>
                    <option value="3">Arco</option>
                  </select>
                </div>

                {(configArmazem.tipo_telhado === 2 ||
                  configArmazem.tipo_telhado === 3) && (
                  <div className="mb-3">
                    <label className="form-label">
                      Curvatura: {configArmazem.curvatura_topo}px
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="10"
                      max="80"
                      value={configArmazem.curvatura_topo}
                      onChange={(e) =>
                        handleArmazemChange("curvatura_topo", e.target.value)
                      }
                    />
                  </div>
                )}

                <h6 className="mt-3 text-primary">Formato do Fundo</h6>
                <div className="mb-3">
                  <label className="form-label">Tipo de Fundo:</label>
                  <select
                    className="form-select"
                    value={configArmazem.tipo_fundo}
                    onChange={(e) =>
                      handleArmazemChange("tipo_fundo", e.target.value)
                    }
                  >
                    <option value="0">Reto</option>
                    <option value="1">Funil/V</option>
                    <option value="2">Duplo V</option>
                  </select>
                </div>

                {(configArmazem.tipo_fundo === 1 ||
                  configArmazem.tipo_fundo === 2) && (
                  <div className="mb-3">
                    <label className="form-label">
                      Intensidade do V: {configArmazem.intensidade_fundo}px
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="10"
                      max="50"
                      value={configArmazem.intensidade_fundo}
                      onChange={(e) =>
                        handleArmazemChange(
                          "intensidade_fundo",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}

                <h6 className="mt-3 text-primary">Sensores</h6>
                <div className="mb-3">
                  <label className="form-label">
                    Escala Sensores: {configArmazem.escala_sensores}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="10"
                    max="25"
                    value={configArmazem.escala_sensores}
                    onChange={(e) => handleArmazemChange("escala_sensores", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Distância Y Sensores: {configArmazem.dist_y_sensores}px
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="8"
                    max="20"
                    value={configArmazem.dist_y_sensores}
                    onChange={(e) => handleArmazemChange("dist_y_sensores", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={configArmazem.posicionamento_automatico}
                      onChange={(e) =>
                        handleArmazemChange(
                          "posicionamento_automatico",
                          e.target.checked ? 1 : 0,
                        )
                      }
                    />
                    <label className="form-check-label">
                      Posicionamento Automático dos Sensores
                    </label>
                  </div>
                </div>

                {/* Informações dos dados JSON */}
                {dadosArmazemJSON && (
                  <div className="mb-3">
                    <label className="form-label">Dados Carregados do JSON:</label>
                    <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem'}}>
                      <div className="d-flex justify-content-between">
                        <span>Total de Arcos:</span>
                        <span className="text-primary">{dadosArmazemJSON.layout?.arcos?.length || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Total de Sensores:</span>
                        <span className="text-success">{Object.keys(dadosArmazemJSON.sensores || {}).length}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Células:</span>
                        <span className="text-info">{dadosArmazemJSON.layout?.celulas?.length || 0}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Dimensões SVG:</span>
                        <span>{dimensoesSVGArmazem.largura} x {dimensoesSVGArmazem.altura}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            

            {/* Gerenciamento de Configurações */}
            <hr className="my-3" />
            <h6 className="text-success mb-3">Gerenciar Modelos</h6>

            <div className="mb-3">
              <label className="form-label">Nome do Modelo:</label>
              <input
                type="text"
                className="form-control"
                value={nomeConfiguracao}
                onChange={(e) => setNomeConfiguracao(e.target.value)}
                placeholder="Digite um nome para o modelo"
              />
            </div>

            <div className="d-grid gap-2 mb-3">
              <button
                className="btn btn-success"
                onClick={salvarConfiguracao}
                disabled={!nomeConfiguracao.trim()}
              >
                Salvar Modelo
              </button>
              <button className="btn btn-warning" onClick={resetarPadrao}>
                Resetar para Padrão
              </button>
            </div>

            {/* Lista de Modelos Salvos */}
            <div className="mb-3">
              <label className="form-label">Modelos Salvos:</label>
              <div className="border rounded p-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                {configsMemoized.length === 0 ? (
                  <small className="text-muted">Nenhum modelo salvo</small>
                ) : (
                  configsMemoized.map(nome => (
                    <div key={nome} className="d-flex justify-content-between align-items-center mb-2 p-1 border rounded">
                      <small 
                        className={`cursor-pointer ${nomeConfiguracao === nome ? 'fw-bold text-primary' : ''}`}
                        style={{cursor: 'pointer'}}
                        onClick={() => carregarConfiguracao(nome)}
                      >
                        {nome}
                      </small>
                      <div>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => carregarConfiguracao(nome)}
                          title="Carregar modelo"
                        >
                          Usar
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deletarConfiguracao(nome)}
                          title="Excluir modelo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Área de Visualização */}
        <div className="col-lg-9 col-md-8" style={{ marginLeft: '25%', paddingLeft: '10px', paddingRight: '10px' }}>
          <div className="d-flex justify-content-center align-items-center p-2" style={{ height: '90vh' }}>
            <div className="card w-100" style={{ height: '75vh', maxWidth: '100%' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Preview - {tipoAtivo === "silo" ? "Silo" : "Armazém"}</h5>
              </div>
              <div className="card-body text-center d-flex align-items-center justify-content-center p-1" style={{ height: 'calc(100% - 60px)' }}>
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    border: "2px solid #ddd",
                    backgroundColor: "#f8f9fa",
                    borderRadius: '8px',
                    shapeRendering: "geometricPrecision",
                    textRendering: "geometricPrecision",
                    imageRendering: "optimizeQuality",
                    fillRule: "evenodd",
                    clipRule: "evenodd",
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {tipoAtivo === "silo" ? (
                    <>
                      <g transform={transformSilo}>{renderFundoSilo()}</g>
                      {renderAeradoresSilo()}
                    </>
                  ) : (
                    <>
                      {renderFundoArmazem()}
                      {renderSensoresArmazem()}
                    </>
                  )}
                </svg>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeladorSVG;
