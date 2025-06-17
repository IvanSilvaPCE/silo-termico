
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ModeladorSVG = () => {
  // Estados para configurações do Silo (baseado no layout original)
  const [configSilo, setConfigSilo] = useState({
    // Desenho do corte do silo
    lb: 200, // largura base
    hs: 180, // altura superior
    hb: 15,  // altura base (elipse)
    eb: 5,   // espessura borda

    // Desenho dos sensores
    escala_sensores: 16,
    dist_y_sensores: 12,
    pos_x_cabos_uniforme: 1,
    pos_x_cabo: [50, 25], // [posição inicial, distância entre cabos]
    pos_y_cabo: [160, 160, 160, 160, 160],

    // Aeradores (opcional)
    aeradores_ativo: false,
    na: 4, // número de aeradores
    ds: 30, // deslocamento lateral
    dy: 0,  // deslocamento vertical
    da: 35  // distância entre aeradores
  });

  // Estados para configurações do Armazém (baseado no layout original)
  const [configArmazem, setConfigArmazem] = useState({
    // Desenho do arco
    pb: 185, // posição base
    lb: 350, // largura base
    hb: 30,  // altura base
    hf: 5,   // altura frente
    lf: 250, // largura frente
    le: 15,  // largura entrada
    ht: 50,  // altura telhado
    tipo_telhado: 1, // 1 = arco pontudo, 2 = arredondado, 3 = arco
    tipo_fundo: 0,   // 0 = reto, 1 = funil/V, 2 = duplo V
    intensidade_fundo: 20, // intensidade do V/funil
    curvatura_topo: 30, // curvatura quando arredondado

    // Desenho dos sensores
    escala_sensores: 16,
    dist_y_sensores: 12,
    pos_x_cabo: [62, 52, 158, 208, 258],
    pos_y_cabo: [181, 181, 181, 181, 181]
  });

  const [tipoAtivo, setTipoAtivo] = useState("silo");
  const [nomeConfiguracao, setNomeConfiguracao] = useState("");

  // Carregar configurações salvas
  useEffect(() => {
    const configSalvaSilo = localStorage.getItem("configSilo");
    const configSalvaArmazem = localStorage.getItem("configArmazem");
    
    if (configSalvaSilo) {
      setConfigSilo(JSON.parse(configSalvaSilo));
    }
    if (configSalvaArmazem) {
      setConfigArmazem(JSON.parse(configSalvaArmazem));
    }
  }, []);

  // Funções de renderização do Silo (baseadas no componente original)
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

    const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z";
    const angles = [0, 60, 120, 180, 240, 300];

    for (let id = 1; id <= na; id++) {
      let transform = "";
      if (id === 1) transform = `translate(-73, ${posY})`;
      else if (id === 2) transform = `translate(${posX}, ${posY})`;
      else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`;
      else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`;
      else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`;
      else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`;

      aeradores.push(
        <g key={id} id={`aerador_${id}`} transform={transform}>
          <circle
            cx={70 + 12.5 + 3.5}
            cy={24}
            r="10"
            fill="#c5c5c5"
          />
          <rect x={70 + 3.5} y={2} width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
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
                transform={angle === 0 ? undefined : `rotate(${angle},86.35,24.05)`}
              />
            ))}
          </g>
        </g>
      );
    }
    return aeradores;
  };

  // Funções de renderização do Armazém (baseadas no componente original)
  const renderFundoArmazem = () => {
    const { tipo_telhado, tipo_fundo, intensidade_fundo, curvatura_topo, pb, lb, hb, hf, lf, le, ht } = configArmazem;
    
    // Base com diferentes tipos de fundo
    let pathBase = "";
    let polBase = null;

    if (tipo_fundo === 0) { // Fundo reto (original)
      const p1 = [lb, pb - hb],
          p2 = [lb - le, pb - hb],
          p3 = [lb - ((lb - lf) / 2), pb - hf],
          p4 = [(lb - lf) / 2, pb - hf],
          p5 = [le, pb - hb],
          p6 = [0, pb - hb],
          p7 = [0, pb],
          p8 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;
      
      polBase = (
        <polygon
          fill="#999999"
          id="des_fundo"
          points={pathBase}
        />
      );
    } else if (tipo_fundo === 1) { // Funil/V - baseado na área da frente (lf)
      const p1 = [lb, pb - hb],
          p2 = [lb - le, pb - hb],
          p3 = [lb - ((lb - lf) / 2), pb - hf],
          // Aplicar o V na área da frente
          p3v = [lb - ((lb - lf) / 2) + intensidade_fundo, pb - hf - intensidade_fundo],
          p4v = [(lb - lf) / 2 + (lf / 2), pb - hf - intensidade_fundo * 1.5], // ponto central do V
          p5v = [(lb - lf) / 2 - intensidade_fundo, pb - hf - intensidade_fundo],
          p4 = [(lb - lf) / 2, pb - hf],
          p5 = [le, pb - hb],
          p6 = [0, pb - hb],
          p7 = [0, pb],
          p8 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p3v.join(",")} ${p4v.join(",")} ${p5v.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;
      
      polBase = (
        <polygon
          fill="#999999"
          id="des_fundo"
          points={pathBase}
        />
      );
    } else if (tipo_fundo === 2) { // Duplo V - baseado na área da frente (lf)
      const p1 = [lb, pb - hb],
          p2 = [lb - le, pb - hb],
          p3 = [lb - ((lb - lf) / 2), pb - hf],
          // Primeiro V (lado direito da frente)
          p3v1 = [lb - ((lb - lf) / 2) + intensidade_fundo / 2, pb - hf - intensidade_fundo],
          p4v1 = [(lb - lf) / 2 + (lf * 3/4), pb - hf - intensidade_fundo * 1.2], // ponto do primeiro V
          p5v1 = [(lb - lf) / 2 + (lf / 2) + intensidade_fundo / 2, pb - hf - intensidade_fundo],
          // Segundo V (lado esquerdo da frente)  
          p6v2 = [(lb - lf) / 2 + (lf / 2) - intensidade_fundo / 2, pb - hf - intensidade_fundo],
          p7v2 = [(lb - lf) / 2 + (lf / 4), pb - hf - intensidade_fundo * 1.2], // ponto do segundo V
          p8v2 = [(lb - lf) / 2 - intensidade_fundo / 2, pb - hf - intensidade_fundo],
          p4 = [(lb - lf) / 2, pb - hf],
          p5 = [le, pb - hb],
          p6 = [0, pb - hb],
          p7 = [0, pb],
          p8 = [lb, pb];
      pathBase = `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p3v1.join(",")} ${p4v1.join(",")} ${p5v1.join(",")} ${p6v2.join(",")} ${p7v2.join(",")} ${p8v2.join(",")} ${p4.join(",")} ${p5.join(",")} ${p6.join(",")} ${p7.join(",")} ${p8.join(",")}`;
      
      polBase = (
        <polygon
          fill="#999999"
          id="des_fundo"
          points={pathBase}
        />
      );
    }

    // Telhado com diferentes formatos
    let polTelhado = null;
    
    if (tipo_telhado === 1) { // Pontudo (original)
      const p1_ = [(lb - lf) / 2, pb - hf],
          p2_ = [le, pb - hb],
          p3_ = [le, pb - ht],
          p4_ = [lb / 2, 1],
          p5_ = [lb - le, pb - ht],
          p6_ = [lb - le, pb - hb],
          p7_ = [lb - ((lb - lf) / 2), pb - hf];
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
    } else if (tipo_telhado === 2) { // Arredondado
      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf}
        L ${le} ${pb - hb}
        L ${le} ${pb - ht}
        Q ${lb / 2} ${1 - curvatura_topo} ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb}
        L ${lb - ((lb - lf) / 2)} ${pb - hf}
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
    } else if (tipo_telhado === 3) { // Arco
      const pathTelhado = `
        M ${(lb - lf) / 2} ${pb - hf}
        L ${le} ${pb - hb}
        L ${le} ${pb - ht}
        A ${(lb - le * 2) / 2} ${curvatura_topo} 0 0 1 ${lb - le} ${pb - ht}
        L ${lb - le} ${pb - hb}
        L ${lb - ((lb - lf) / 2)} ${pb - hf}
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
    setConfigSilo(prev => ({
      ...prev,
      [campo]: parseFloat(valor)
    }));
  };

  const handleArmazemChange = (campo, valor) => {
    setConfigArmazem(prev => ({
      ...prev,
      [campo]: parseFloat(valor)
    }));
  };

  // Salvar configuração
  const salvarConfiguracao = () => {
    if (tipoAtivo === "silo") {
      localStorage.setItem("configSilo", JSON.stringify(configSilo));
      if (nomeConfiguracao) {
        localStorage.setItem(`configSilo_${nomeConfiguracao}`, JSON.stringify(configSilo));
      }
    } else {
      localStorage.setItem("configArmazem", JSON.stringify(configArmazem));
      if (nomeConfiguracao) {
        localStorage.setItem(`configArmazem_${nomeConfiguracao}`, JSON.stringify(configArmazem));
      }
    }
    alert(`Configuração ${tipoAtivo} salva com sucesso!`);
  };

  // Carregar configuração nomeada
  const carregarConfiguracao = () => {
    if (!nomeConfiguracao) return;
    
    const chave = `config${tipoAtivo === "silo" ? "Silo" : "Armazem"}_${nomeConfiguracao}`;
    const configSalva = localStorage.getItem(chave);
    
    if (configSalva) {
      if (tipoAtivo === "silo") {
        setConfigSilo(JSON.parse(configSalva));
      } else {
        setConfigArmazem(JSON.parse(configSalva));
      }
      alert("Configuração carregada com sucesso!");
    } else {
      alert("Configuração não encontrada!");
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
        da: 35
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
        pos_y_cabo: [181, 181, 181, 181, 181]
      });
    }
  };

  // Calcular dimensões do SVG
  const calcularDimensoesSVG = () => {
    if (tipoAtivo === "silo") {
      const largura = configSilo.lb + (configSilo.aeradores_ativo ? configSilo.ds * 2 + 68 : 0);
      const altura = configSilo.hs + configSilo.hb * 1.75;
      return [largura, altura];
    } else {
      return [configArmazem.lb, configArmazem.pb];
    }
  };

  const [larguraSVG, alturaSVG] = calcularDimensoesSVG();
  const transformSilo = (tipoAtivo === "silo" && configSilo.aeradores_ativo) 
    ? `translate(${configSilo.ds + 34}, 0)` 
    : "";

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Modelador de SVG - Baseado nos Componentes Originais</h1>
        </div>
      </div>
      
      <div className="row">
        {/* Painel de Controles */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Controles de Modelagem</h5>
            </div>
            <div className="card-body">
              {/* Seletor de Tipo */}
              <div className="mb-3">
                <label className="form-label">Tipo de Estrutura:</label>
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
                  <h6 className="mt-3">Dimensões do Silo</h6>
                  <div className="mb-3">
                    <label className="form-label">Largura Base (lb): {configSilo.lb}px</label>
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
                    <label className="form-label">Altura Superior (hs): {configSilo.hs}px</label>
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
                    <label className="form-label">Altura Base (hb): {configSilo.hb}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="5"
                      max="30"
                      value={configSilo.hb}
                      onChange={(e) => handleSiloChange("hb", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Espessura Borda (eb): {configSilo.eb}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="2"
                      max="15"
                      value={configSilo.eb}
                      onChange={(e) => handleSiloChange("eb", e.target.value)}
                    />
                  </div>

                  <h6 className="mt-3">Aeradores</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={configSilo.aeradores_ativo}
                        onChange={(e) => handleSiloChange("aeradores_ativo", e.target.checked ? 1 : 0)}
                      />
                      <label className="form-check-label">
                        Ativar Aeradores
                      </label>
                    </div>
                  </div>

                  {configSilo.aeradores_ativo && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Número de Aeradores: {configSilo.na}</label>
                        <input
                          type="range"
                          className="form-range"
                          min="2"
                          max="6"
                          value={configSilo.na}
                          onChange={(e) => handleSiloChange("na", e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Deslocamento Lateral (ds): {configSilo.ds}px</label>
                        <input
                          type="range"
                          className="form-range"
                          min="10"
                          max="60"
                          value={configSilo.ds}
                          onChange={(e) => handleSiloChange("ds", e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Distância entre Aeradores (da): {configSilo.da}px</label>
                        <input
                          type="range"
                          className="form-range"
                          min="20"
                          max="60"
                          value={configSilo.da}
                          onChange={(e) => handleSiloChange("da", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Controles para Armazém */}
              {tipoAtivo === "armazem" && (
                <>
                  <h6 className="mt-3">Dimensões do Armazém</h6>
                  <div className="mb-3">
                    <label className="form-label">Largura Base (lb): {configArmazem.lb}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="200"
                      max="500"
                      value={configArmazem.lb}
                      onChange={(e) => handleArmazemChange("lb", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Posição Base (pb): {configArmazem.pb}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="150"
                      max="300"
                      value={configArmazem.pb}
                      onChange={(e) => handleArmazemChange("pb", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura Base (hb): {configArmazem.hb}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="20"
                      max="60"
                      value={configArmazem.hb}
                      onChange={(e) => handleArmazemChange("hb", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Largura Frente (lf): {configArmazem.lf}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="400"
                      value={configArmazem.lf}
                      onChange={(e) => handleArmazemChange("lf", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura Frente (hf): {configArmazem.hf}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="2"
                      max="20"
                      value={configArmazem.hf}
                      onChange={(e) => handleArmazemChange("hf", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Largura Entrada (le): {configArmazem.le}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="5"
                      max="50"
                      value={configArmazem.le}
                      onChange={(e) => handleArmazemChange("le", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura Telhado (ht): {configArmazem.ht}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="20"
                      max="100"
                      value={configArmazem.ht}
                      onChange={(e) => handleArmazemChange("ht", e.target.value)}
                    />
                  </div>

                  <h6 className="mt-3">Formato do Topo</h6>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Telhado:</label>
                    <select 
                      className="form-select" 
                      value={configArmazem.tipo_telhado} 
                      onChange={(e) => handleArmazemChange("tipo_telhado", e.target.value)}
                    >
                      <option value="1">Pontudo (Original)</option>
                      <option value="2">Arredondado</option>
                      <option value="3">Arco</option>
                    </select>
                  </div>

                  {(configArmazem.tipo_telhado === 2 || configArmazem.tipo_telhado === 3) && (
                    <div className="mb-3">
                      <label className="form-label">Curvatura do Topo: {configArmazem.curvatura_topo}px</label>
                      <input
                        type="range"
                        className="form-range"
                        min="10"
                        max="80"
                        value={configArmazem.curvatura_topo}
                        onChange={(e) => handleArmazemChange("curvatura_topo", e.target.value)}
                      />
                    </div>
                  )}

                  <h6 className="mt-3">Formato do Fundo</h6>
                  <div className="mb-3">
                    <label className="form-label">Tipo de Fundo:</label>
                    <select 
                      className="form-select" 
                      value={configArmazem.tipo_fundo} 
                      onChange={(e) => handleArmazemChange("tipo_fundo", e.target.value)}
                    >
                      <option value="0">Reto (Original)</option>
                      <option value="1">Funil/V</option>
                      <option value="2">Duplo V</option>
                    </select>
                  </div>

                  {(configArmazem.tipo_fundo === 1 || configArmazem.tipo_fundo === 2) && (
                    <div className="mb-3">
                      <label className="form-label">Intensidade do V/Funil: {configArmazem.intensidade_fundo}px</label>
                      <input
                        type="range"
                        className="form-range"
                        min="10"
                        max="50"
                        value={configArmazem.intensidade_fundo}
                        onChange={(e) => handleArmazemChange("intensidade_fundo", e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Gerenciamento de Configurações */}
              <hr />
              <div className="mb-3">
                <label className="form-label">Nome da Configuração:</label>
                <input
                  type="text"
                  className="form-control"
                  value={nomeConfiguracao}
                  onChange={(e) => setNomeConfiguracao(e.target.value)}
                  placeholder="Digite um nome para salvar/carregar"
                />
              </div>

              <div className="d-grid gap-2">
                <button className="btn btn-success" onClick={salvarConfiguracao}>
                  Salvar Configuração
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={carregarConfiguracao}
                  disabled={!nomeConfiguracao}
                >
                  Carregar Configuração
                </button>
                <button className="btn btn-warning" onClick={resetarPadrao}>
                  Resetar para Padrão
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do SVG */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5>Preview - {tipoAtivo === "silo" ? "Silo" : "Armazém"}</h5>
            </div>
            <div className="card-body text-center">
              <svg
                width="100%"
                height="400"
                viewBox={`0 0 ${larguraSVG} ${alturaSVG}`}
                style={{
                  border: "1px solid #ddd",
                  backgroundColor: "#f8f9fa",
                  shapeRendering: "geometricPrecision",
                  textRendering: "geometricPrecision",
                  imageRendering: "optimizeQuality",
                  fillRule: "evenodd",
                  clipRule: "evenodd"
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {tipoAtivo === "silo" ? (
                  <>
                    <g transform={transformSilo}>
                      {renderFundoSilo()}
                    </g>
                    {renderAeradoresSilo()}
                  </>
                ) : (
                  renderFundoArmazem()
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeladorSVG;
