
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const Pendulo3D = ({ position, numero, sensores, escala = 0.3 }) => {
  const grupoRef = useRef();
  
  // Função para determinar cor baseada na temperatura
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

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal (cilindro vertical) */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 6, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Nome do pêndulo na base */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[0.8, 0.25, 0.1]} />
        <meshStandardMaterial color="#3A78FD" />
      </mesh>
      <Text
        position={[0, -1, 0.1]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        P{numero}
      </Text>

      {/* Sensores ao longo do cabo */}
      {Object.entries(sensores).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, , , falha, nivel] = valores;
        const yPos = 4.5 - (s * 0.3);
        const cor = nivel ? corFaixaExata(temp) : "#e6e6e6";
        
        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Caixa do sensor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.3, 0.15, 0.15]} />
              <meshStandardMaterial 
                color={cor}
                emissive={falha ? "#ff0000" : "#000000"}
                emissiveIntensity={falha ? 0.3 : 0}
              />
            </mesh>
            
            {/* Texto do valor */}
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.06}
              color={cor === "#ff2200" ? "white" : "black"}
              anchorX="center"
              anchorY="middle"
            >
              {falha ? "ERRO" : temp.toFixed(1)}
            </Text>
            
            {/* Label do sensor */}
            <Text
              position={[-0.2, 0, 0]}
              fontSize={0.05}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              S{s}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const ArmazemStructure3D = ({ dimensoes }) => {
  const profundidade = 6; // Profundidade fixa para dar volume ao armazém
  
  return (
    <group>
      {/* Base do armazém */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[dimensoes.largura/50, 1, profundidade]} />
        <meshStandardMaterial 
          color="#999999" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Paredes laterais */}
      <mesh position={[-dimensoes.largura/100, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, profundidade]} />
        <meshStandardMaterial color="#E6E6E6" transparent opacity={0.7} />
      </mesh>
      <mesh position={[dimensoes.largura/100, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, profundidade]} />
        <meshStandardMaterial color="#E6E6E6" transparent opacity={0.7} />
      </mesh>
      
      {/* Telhado (formato triangular) */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[dimensoes.largura/80, 1, 4]} />
        <meshStandardMaterial color="#CCCCCC" transparent opacity={0.8} />
      </mesh>
      
      {/* Paredes das extremidades */}
      <mesh position={[0, 1.5, -profundidade/2]}>
        <boxGeometry args={[dimensoes.largura/50, 3, 0.2]} />
        <meshStandardMaterial color="#E6E6E6" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 1.5, profundidade/2]}>
        <boxGeometry args={[dimensoes.largura/50, 3, 0.2]} />
        <meshStandardMaterial color="#E6E6E6" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

const Armazem3D = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [mostrarMapaCalor, setMostrarMapaCalor] = useState(false);
  const [arcoAtual, setArcoAtual] = useState(1);
  const [dados, setDados] = useState(null);
  const [dadosPortal, setDadosPortal] = useState(null);
  const [analiseArcos, setAnaliseArcos] = useState(null);
  const [layoutsAutomaticos, setLayoutsAutomaticos] = useState(null);
  const [dimensoesSVG, setDimensoesSVG] = useState({ largura: 350, altura: 200 });

  // Carregar dados automaticamente
  useEffect(() => {
    const inicializarDados = async () => {
      try {
        // Gerar dados de exemplo do ArmazemPortal
        const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
        setDadosPortal(dadosExemplo);

        // Analisar estrutura dos arcos
        const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
        setAnaliseArcos(analise);

        // Gerar layouts automáticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise);
        setLayoutsAutomaticos(layouts);

        // Calcular dimensões ideais
        const dimensoes = calcularDimensoesIdeais(analise);
        setDimensoesSVG(dimensoes);

        // Converter dados para o formato do armazém (arco 1 inicialmente)
        const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosExemplo, 1);
        setDados(dadosConvertidos);
      } catch (error) {
        console.error('Erro ao inicializar dados 3D:', error);
      }
    };

    inicializarDados();
  }, []);

  // Calcular dimensões ideais
  function calcularDimensoesIdeais(analiseArcos) {
    if (!analiseArcos) return { largura: 350, altura: 200 };

    let maxSensores = 0;
    let maxPendulos = 0;

    Object.values(analiseArcos.arcos).forEach(arco => {
      maxPendulos = Math.max(maxPendulos, arco.totalPendulos);
      arco.pendulos.forEach(pendulo => {
        maxSensores = Math.max(maxSensores, pendulo.totalSensores);
      });
    });

    const larguraCalculada = Math.max(350, (maxPendulos * 50) + 100);
    const alturaCalculada = Math.max(250, maxSensores * 12 + 100);

    return {
      largura: larguraCalculada,
      altura: alturaCalculada
    };
  }

  // Calcular posições dos pêndulos em 3D
  const pendulosPositions = useMemo(() => {
    if (!layoutsAutomaticos || !analiseArcos || !dados) return [];

    const layoutArco = layoutsAutomaticos[`arco_${arcoAtual}`];
    const arcoInfo = analiseArcos.arcos[arcoAtual];
    
    if (!layoutArco || !arcoInfo) return [];

    const positions = [];
    const profundidade = 6;
    
    arcoInfo.pendulos.forEach((pendulo, index) => {
      const xCabo = layoutArco.desenho_sensores.pos_x_cabo[index];
      // Converter coordenadas 2D para 3D
      const x = (xCabo - dimensoesSVG.largura/2) / 50;
      const z = (index % 2 === 0 ? -profundidade/4 : profundidade/4);
      positions.push([x, 0, z]);
    });

    return positions;
  }, [layoutsAutomaticos, analiseArcos, dados, arcoAtual, dimensoesSVG]);

  const mudarArco = (novoArco) => {
    setArcoAtual(novoArco);
    if (dadosPortal) {
      const dadosConvertidos = LayoutManager.converterDadosPortalParaArmazem(dadosPortal, novoArco);
      setDados(dadosConvertidos);
    }
  };

  if (!dados || !analiseArcos) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando visualização 3D...</span>
          </div>
          <p className="mt-2">Carregando Armazém 3D...</p>
        </div>
      </div>
    );
  }

  const arcoInfo = analiseArcos.arcos[arcoAtual];

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Armazém 3D - Visualização Tridimensional</h1>
          
          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Controles de Visualização 3D</h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="autoRotate"
                          checked={autoRotate}
                          onChange={(e) => setAutoRotate(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="autoRotate">
                          Rotação Automática
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Arco Atual:</label>
                      <div className="d-flex gap-2 align-items-center">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => mudarArco(Math.max(1, arcoAtual - 1))}
                          disabled={arcoAtual <= 1}
                        >
                          ← Anterior
                        </button>
                        <select 
                          className="form-select form-select-sm"
                          value={arcoAtual}
                          onChange={(e) => mudarArco(parseInt(e.target.value))}
                        >
                          {Object.keys(analiseArcos.arcos).map(numeroArco => {
                            const arco = analiseArcos.arcos[numeroArco];
                            return (
                              <option key={numeroArco} value={numeroArco}>
                                Arco {numeroArco} - {arco.totalPendulos}P
                              </option>
                            );
                          })}
                        </select>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => mudarArco(Math.min(analiseArcos.totalArcos, arcoAtual + 1))}
                          disabled={arcoAtual >= analiseArcos.totalArcos}
                        >
                          Próximo →
                        </button>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <button 
                        className={`btn ${mostrarMapaCalor ? 'btn-success' : 'btn-outline-primary'}`}
                        onClick={() => setMostrarMapaCalor(!mostrarMapaCalor)}
                      >
                        {mostrarMapaCalor ? 'Modo Normal' : 'Mapa de Calor'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas 3D */}
          <div className="card" style={{ height: '70vh' }}>
            <div className="card-body p-0">
              <Canvas 
                camera={{ position: [10, 5, 10], fov: 60 }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #f0f8ff)' }}
              >
                {/* Iluminação */}
                <ambientLight intensity={0.6} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={1} 
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[0, 5, 0]} intensity={0.5} />

                {/* Estrutura do armazém */}
                <ArmazemStructure3D dimensoes={dimensoesSVG} />

                {/* Pêndulos e sensores */}
                {arcoInfo && Object.entries(dados.leitura).map(([pendulo, sensores], index) => {
                  if (index < pendulosPositions.length) {
                    return (
                      <Pendulo3D
                        key={pendulo}
                        position={pendulosPositions[index]}
                        numero={arcoInfo.pendulos[index]?.numero || index + 1}
                        sensores={sensores}
                      />
                    );
                  }
                  return null;
                })}

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={1}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={25}
                />

                {/* Grid de referência */}
                <gridHelper args={[15, 15, '#444444', '#888888']} position={[0, -2, 0]} />
              </Canvas>
            </div>
          </div>

          {/* Informações do Arco Atual */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Estrutura do Arco {arcoAtual} - Visualização 3D</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <small><strong>Controles 3D:</strong><br/>
                      • Clique e arraste para rotacionar<br/>
                      • Scroll para zoom<br/>
                      • Clique direito e arraste para mover</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Pêndulos no Arco:</strong><br/>
                      {arcoInfo && arcoInfo.pendulos.map(pendulo => (
                        <span key={pendulo.numero} className="badge bg-primary me-1 mb-1">
                          P{pendulo.numero}: {pendulo.totalSensores}S
                        </span>
                      ))}
                      </small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Cores dos Sensores:</strong><br/>
                      • Azul: Frio (&lt;15°C)<br/>
                      • Verde: Normal (15-25°C)<br/>
                      • Amarelo/Laranja: Quente (25-35°C)<br/>
                      • Vermelho: Crítico (&gt;35°C)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Armazem3D;
