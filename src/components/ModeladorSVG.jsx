
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ModeladorSVG = () => {
  // Estados para configurações do Silo
  const [configSilo, setConfigSilo] = useState({
    larguraBase: 200,
    alturaTotal: 300,
    alturaCilindro: 200,
    curvaturaTopo: 50,
    tipoCone: 1, // 0: reto, 1: cônico simples, 2: cônico duplo
    aberturaCone: 30,
    espessuraBorda: 15
  });

  // Estados para configurações do Armazém
  const [configArmazem, setConfigArmazem] = useState({
    larguraBase: 350,
    alturaTotal: 200,
    alturaParede: 155,
    tipoTelhado: 1, // 0: reto, 1: arco simples, 2: arco duplo, 3: triangular
    alturaTelhado: 50,
    curvaturaTelhado: 30,
    larguraEntrada: 250,
    margemEntrada: 15,
    pontuTelhado: 50 // Para controlar quão pontudo é o telhado
  });

  const [tipoAtivo, setTipoAtivo] = useState("silo"); // "silo" ou "armazem"
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

  // Gerar path do Silo
  const gerarPathSilo = () => {
    const { larguraBase, alturaTotal, alturaCilindro, curvaturaTopo, tipoCone, aberturaCone } = configSilo;
    const raio = larguraBase / 2;
    const xCentro = raio;
    const yBase = alturaTotal;
    const yTopo = alturaTotal - alturaCilindro;
    
    let pathD = "";
    
    // Parte cilíndrica
    pathD += `M 0,${yTopo} `;
    pathD += `L 0,${yBase} `;
    pathD += `L ${larguraBase},${yBase} `;
    pathD += `L ${larguraBase},${yTopo} `;
    
    // Topo curvo
    if (curvaturaTopo > 0) {
      const alturaArco = Math.min(curvaturaTopo, yTopo);
      pathD += `Q ${xCentro},${yTopo - alturaArco} 0,${yTopo} `;
    } else {
      pathD += `L 0,${yTopo} `;
    }
    
    // Cone na base (se aplicável)
    if (tipoCone > 0) {
      const pontoMedioCone = yBase - aberturaCone;
      if (tipoCone === 1) {
        // Cone simples
        pathD = `M 0,${yTopo} L 0,${pontoMedioCone} L ${xCentro},${yBase} L ${larguraBase},${pontoMedioCone} L ${larguraBase},${yTopo} `;
        if (curvaturaTopo > 0) {
          const alturaArco = Math.min(curvaturaTopo, yTopo);
          pathD += `Q ${xCentro},${yTopo - alturaArco} 0,${yTopo}`;
        } else {
          pathD += `L 0,${yTopo}`;
        }
      } else if (tipoCone === 2) {
        // Cone duplo (formato W)
        const ponto1 = larguraBase * 0.25;
        const ponto2 = larguraBase * 0.75;
        pathD = `M 0,${yTopo} L 0,${pontoMedioCone} L ${ponto1},${yBase} L ${xCentro},${pontoMedioCone} L ${ponto2},${yBase} L ${larguraBase},${pontoMedioCone} L ${larguraBase},${yTopo} `;
        if (curvaturaTopo > 0) {
          const alturaArco = Math.min(curvaturaTopo, yTopo);
          pathD += `Q ${xCentro},${yTopo - alturaArco} 0,${yTopo}`;
        } else {
          pathD += `L 0,${yTopo}`;
        }
      }
    }
    
    pathD += " Z";
    return pathD;
  };

  // Gerar path do Armazém
  const gerarPathArmazem = () => {
    const { 
      larguraBase, 
      alturaTotal, 
      alturaParede, 
      tipoTelhado, 
      alturaTelhado, 
      curvaturaTelhado, 
      larguraEntrada, 
      margemEntrada,
      pontuTelhado 
    } = configArmazem;
    
    const yBase = alturaTotal;
    const yParede = alturaTotal - alturaParede;
    const xMeio = larguraBase / 2;
    
    let pathD = "";
    
    // Base e paredes
    pathD += `M 0,${yParede} `;
    pathD += `L 0,${yBase} `;
    pathD += `L ${larguraBase},${yBase} `;
    pathD += `L ${larguraBase},${yParede} `;
    
    // Entrada (parte mais baixa do telhado)
    const xEntradaInicio = (larguraBase - larguraEntrada) / 2;
    const xEntradaFim = xEntradaInicio + larguraEntrada;
    const yEntrada = yParede + margemEntrada;
    
    pathD += `L ${larguraBase - margemEntrada},${yParede} `;
    pathD += `L ${xEntradaFim},${yEntrada} `;
    
    // Telhado
    if (tipoTelhado === 0) {
      // Telhado reto
      pathD += `L ${xEntradaInicio},${yEntrada} `;
    } else if (tipoTelhado === 1) {
      // Arco simples
      const yTopoTelhado = yParede - alturaTelhado;
      pathD += `Q ${xMeio},${yTopoTelhado - curvaturaTelhado} ${xEntradaInicio},${yEntrada} `;
    } else if (tipoTelhado === 2) {
      // Arco duplo
      const ponto1 = xEntradaInicio + (larguraEntrada * 0.25);
      const ponto2 = xEntradaInicio + (larguraEntrada * 0.75);
      const yTopoTelhado = yParede - alturaTelhado;
      pathD += `Q ${ponto2},${yTopoTelhado - curvaturaTelhado} ${xMeio},${yEntrada + 10} `;
      pathD += `Q ${ponto1},${yTopoTelhado - curvaturaTelhado} ${xEntradaInicio},${yEntrada} `;
    } else if (tipoTelhado === 3) {
      // Triangular (pontudo)
      const yTopoTelhado = yParede - alturaTelhado - pontuTelhado;
      pathD += `L ${xMeio},${yTopoTelhado} `;
      pathD += `L ${xEntradaInicio},${yEntrada} `;
    }
    
    pathD += `L ${margemEntrada},${yParede} `;
    pathD += `L 0,${yParede} `;
    pathD += " Z";
    
    return pathD;
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
        larguraBase: 200,
        alturaTotal: 300,
        alturaCilindro: 200,
        curvaturaTopo: 50,
        tipoCone: 1,
        aberturaCone: 30,
        espessuraBorda: 15
      });
    } else {
      setConfigArmazem({
        larguraBase: 350,
        alturaTotal: 200,
        alturaParede: 155,
        tipoTelhado: 1,
        alturaTelhado: 50,
        curvaturaTelhado: 30,
        larguraEntrada: 250,
        margemEntrada: 15,
        pontuTelhado: 50
      });
    }
  };

  const configAtual = tipoAtivo === "silo" ? configSilo : configArmazem;
  const pathAtual = tipoAtivo === "silo" ? gerarPathSilo() : gerarPathArmazem();

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Modelador de SVG - Silo e Armazém</h1>
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
                  <div className="mb-3">
                    <label className="form-label">Largura da Base: {configSilo.larguraBase}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="400"
                      value={configSilo.larguraBase}
                      onChange={(e) => handleSiloChange("larguraBase", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura Total: {configSilo.alturaTotal}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="200"
                      max="500"
                      value={configSilo.alturaTotal}
                      onChange={(e) => handleSiloChange("alturaTotal", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura do Cilindro: {configSilo.alturaCilindro}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="400"
                      value={configSilo.alturaCilindro}
                      onChange={(e) => handleSiloChange("alturaCilindro", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Curvatura do Topo: {configSilo.curvaturaTopo}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      value={configSilo.curvaturaTopo}
                      onChange={(e) => handleSiloChange("curvaturaTopo", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tipo de Cone:</label>
                    <select 
                      className="form-select" 
                      value={configSilo.tipoCone} 
                      onChange={(e) => handleSiloChange("tipoCone", e.target.value)}
                    >
                      <option value="0">Reto</option>
                      <option value="1">Cone Simples (V)</option>
                      <option value="2">Cone Duplo (W)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Abertura do Cone: {configSilo.aberturaCone}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="10"
                      max="100"
                      value={configSilo.aberturaCone}
                      onChange={(e) => handleSiloChange("aberturaCone", e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Controles para Armazém */}
              {tipoAtivo === "armazem" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Largura da Base: {configArmazem.larguraBase}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="200"
                      max="500"
                      value={configArmazem.larguraBase}
                      onChange={(e) => handleArmazemChange("larguraBase", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura Total: {configArmazem.alturaTotal}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="150"
                      max="400"
                      value={configArmazem.alturaTotal}
                      onChange={(e) => handleArmazemChange("alturaTotal", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura da Parede: {configArmazem.alturaParede}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="300"
                      value={configArmazem.alturaParede}
                      onChange={(e) => handleArmazemChange("alturaParede", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tipo de Telhado:</label>
                    <select 
                      className="form-select" 
                      value={configArmazem.tipoTelhado} 
                      onChange={(e) => handleArmazemChange("tipoTelhado", e.target.value)}
                    >
                      <option value="0">Reto</option>
                      <option value="1">Arco Simples</option>
                      <option value="2">Arco Duplo</option>
                      <option value="3">Triangular (Pontudo)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Altura do Telhado: {configArmazem.alturaTelhado}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="20"
                      max="100"
                      value={configArmazem.alturaTelhado}
                      onChange={(e) => handleArmazemChange("alturaTelhado", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Curvatura do Telhado: {configArmazem.curvaturaTelhado}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="80"
                      value={configArmazem.curvaturaTelhado}
                      onChange={(e) => handleArmazemChange("curvaturaTelhado", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Largura da Entrada: {configArmazem.larguraEntrada}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="100"
                      max="400"
                      value={configArmazem.larguraEntrada}
                      onChange={(e) => handleArmazemChange("larguraEntrada", e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Margem da Entrada: {configArmazem.margemEntrada}px</label>
                    <input
                      type="range"
                      className="form-range"
                      min="5"
                      max="50"
                      value={configArmazem.margemEntrada}
                      onChange={(e) => handleArmazemChange("margemEntrada", e.target.value)}
                    />
                  </div>

                  {configArmazem.tipoTelhado === 3 && (
                    <div className="mb-3">
                      <label className="form-label">Ponto do Telhado: {configArmazem.pontuTelhado}px</label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={configArmazem.pontuTelhado}
                        onChange={(e) => handleArmazemChange("pontuTelhado", e.target.value)}
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
                viewBox={`0 0 ${configAtual.larguraBase || 400} ${configAtual.alturaTotal || 400}`}
                style={{
                  border: "1px solid #ddd",
                  backgroundColor: "#f8f9fa"
                }}
              >
                <defs>
                  <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e3f2fd" />
                    <stop offset="50%" stopColor="#bbdefb" />
                    <stop offset="100%" stopColor="#90caf9" />
                  </linearGradient>
                </defs>
                <path
                  d={pathAtual}
                  fill="url(#gradientFill)"
                  stroke="#1976d2"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeladorSVG;
