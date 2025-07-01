
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const Pendulo3D = ({ position, numero, sensores, escala = 0.3 }) => {
  const grupoRef = useRef();
  
  // Função para determiner cor baseada na temperatura
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
      {/* Cabo principal (cilindro vertical) - mais fino */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Nome do pêndulo na base */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.08]} />
        <meshStandardMaterial color="#3A78FD" />
      </mesh>
      <Text
        position={[0, -0.8, 0.05]}
        fontSize={0.1}
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
        const yPos = 3.2 - (s * 0.25);
        const cor = nivel ? corFaixaExata(temp) : "#e6e6e6";
        
        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Caixa do sensor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial 
                color={cor}
                emissive={falha ? "#ff0000" : "#000000"}
                emissiveIntensity={falha ? 0.3 : 0}
              />
            </mesh>
            
            {/* Texto do valor */}
            <Text
              position={[0, 0, 0.08]}
              fontSize={0.05}
              color={cor === "#ff2200" ? "white" : "black"}
              anchorX="center"
              anchorY="middle"
            >
              {falha ? "ERRO" : temp.toFixed(1)}
            </Text>
            
            {/* Label do sensor */}
            <Text
              position={[-0.15, 0, 0]}
              fontSize={0.04}
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

const ArcoStructure3D = ({ posicaoX, largura, altura, numeroArco, selecionado }) => {
  const profundidade = 3;
  const corArco = selecionado ? "#438AF6" : "#E6E6E6";
  const opacidade = selecionado ? 0.8 : 0.5;
  
  return (
    <group position={[posicaoX, 0, 0]}>
      {/* Base do arco */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[largura, 0.3, profundidade]} />
        <meshStandardMaterial color="#999999" transparent opacity={0.8} />
      </mesh>
      
      {/* Paredes laterais do arco */}
      <mesh position={[-largura/2, altura/2, 0]}>
        <boxGeometry args={[0.15, altura, profundidade]} />
        <meshStandardMaterial color={corArco} transparent opacity={opacidade} />
      </mesh>
      <mesh position={[largura/2, altura/2, 0]}>
        <boxGeometry args={[0.15, altura, profundidade]} />
        <meshStandardMaterial color={corArco} transparent opacity={opacidade} />
      </mesh>
      
      {/* Teto do arco (formato triangular) */}
      <mesh position={[0, altura + 0.3, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[largura/3, 0.6, 4]} />
        <meshStandardMaterial color="#CCCCCC" transparent opacity={0.7} />
      </mesh>
      
      {/* Paredes das extremidades */}
      <mesh position={[0, altura/2, -profundidade/2]}>
        <boxGeometry args={[largura, altura, 0.15]} />
        <meshStandardMaterial color={corArco} transparent opacity={opacidade} />
      </mesh>
      <mesh position={[0, altura/2, profundidade/2]}>
        <boxGeometry args={[largura, altura, 0.15]} />
        <meshStandardMaterial color={corArco} transparent opacity={opacidade} />
      </mesh>

      {/* Label do arco */}
      <Text
        position={[0, altura + 1, 0]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        Arco {numeroArco}
      </Text>
    </group>
  );
};

const ArmazemCompleto3D = ({ dadosPortal, analiseArcos, arcoSelecionado }) => {
  // Calcular posições dos arcos lado a lado
  const arcosPositions = useMemo(() => {
    if (!analiseArcos) return [];
    
    const totalArcos = analiseArcos.totalArcos;
    const espacamentoArcos = 6; // Espaçamento entre arcos
    const larguraTotal = (totalArcos - 1) * espacamentoArcos;
    const posicaoInicial = -larguraTotal / 2;
    
    const positions = [];
    for (let i = 1; i <= totalArcos; i++) {
      positions.push({
        arco: i,
        posicaoX: posicaoInicial + (i - 1) * espacamentoArcos,
        largura: 4,
        altura: 3
      });
    }
    
    return positions;
  }, [analiseArcos]);

  // Calcular posições dos pêndulos para todos os arcos
  const pendulosPositions = useMemo(() => {
    if (!analiseArcos || !dadosPortal) return {};
    
    const posicoesPorArco = {};
    
    Object.keys(analiseArcos.arcos).forEach(arcoNum => {
      const arcoInfo = analiseArcos.arcos[arcoNum];
      const arcoPos = arcosPositions.find(a => a.arco === parseInt(arcoNum));
      
      if (arcoPos && arcoInfo) {
        const positions = [];
        const larguraArco = arcoPos.largura;
        const espacamentoPendulo = larguraArco / (arcoInfo.totalPendulos + 1);
        
        arcoInfo.pendulos.forEach((pendulo, index) => {
          const xLocal = -larguraArco/2 + espacamentoPendulo * (index + 1);
          const xGlobal = arcoPos.posicaoX + xLocal;
          const z = (index % 2 === 0 ? -1 : 1) * 0.5;
          positions.push([xGlobal, 0, z]);
        });
        
        posicoesPorArco[arcoNum] = positions;
      }
    });
    
    return posicoesPorArco;
  }, [analiseArcos, arcosPositions, dadosPortal]);

  return (
    <group>
      {/* Renderizar estrutura de todos os arcos */}
      {arcosPositions.map(arcoPos => (
        <ArcoStructure3D
          key={arcoPos.arco}
          posicaoX={arcoPos.posicaoX}
          largura={arcoPos.largura}
          altura={arcoPos.altura}
          numeroArco={arcoPos.arco}
          selecionado={arcoPos.arco === arcoSelecionado}
        />
      ))}

      {/* Renderizar pêndulos para todos os arcos */}
      {Object.entries(pendulosPositions).map(([arcoNum, positions]) => {
        const arcoInfo = analiseArcos.arcos[arcoNum];
        if (!arcoInfo) return null;
        
        // Converter dados do portal para o arco específico
        const dadosArco = LayoutManager.converterDadosPortalParaArmazem(dadosPortal, parseInt(arcoNum));
        
        return positions.map((position, index) => {
          const pendulo = arcoInfo.pendulos[index];
          if (!pendulo) return null;
          
          // Encontrar dados do pêndulo
          const penduloKey = Object.keys(dadosArco.leitura)[index];
          const sensoresData = dadosArco.leitura[penduloKey];
          
          return (
            <Pendulo3D
              key={`${arcoNum}-${pendulo.numero}`}
              position={position}
              numero={pendulo.numero}
              sensores={sensoresData || {}}
            />
          );
        });
      })}
    </group>
  );
};

const Armazem3D = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [mostrarMapaCalor, setMostrarMapaCalor] = useState(false);
  const [arcoSelecionado, setArcoSelecionado] = useState(1);
  const [dadosPortal, setDadosPortal] = useState(null);
  const [analiseArcos, setAnaliseArcos] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Carregar dados automaticamente
  useEffect(() => {
    const inicializarDados = async () => {
      try {
        setCarregando(true);
        
        // Gerar dados de exemplo do ArmazemPortal
        const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
        setDadosPortal(dadosExemplo);

        // Analisar estrutura dos arcos
        const analise = LayoutManager.analisarEstruturaArcos(dadosExemplo);
        setAnaliseArcos(analise);
        
      } catch (error) {
        console.error('Erro ao inicializar dados 3D:', error);
      } finally {
        setCarregando(false);
      }
    };

    inicializarDados();
  }, []);

  const mudarArco = (novoArco) => {
    setArcoSelecionado(novoArco);
  };

  if (carregando || !analiseArcos || !dadosPortal) {
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

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Armazém 3D - Todos os Arcos</h1>
          
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
                      <label className="form-label">Arco Selecionado:</label>
                      <div className="d-flex gap-2 align-items-center">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => mudarArco(Math.max(1, arcoSelecionado - 1))}
                          disabled={arcoSelecionado <= 1}
                        >
                          ← Anterior
                        </button>
                        <select 
                          className="form-select form-select-sm"
                          value={arcoSelecionado}
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
                          onClick={() => mudarArco(Math.min(analiseArcos.totalArcos, arcoSelecionado + 1))}
                          disabled={arcoSelecionado >= analiseArcos.totalArcos}
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
                camera={{ position: [15, 8, 15], fov: 60 }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #f0f8ff)' }}
              >
                {/* Iluminação */}
                <ambientLight intensity={0.6} />
                <directionalLight 
                  position={[20, 15, 10]} 
                  intensity={1} 
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[0, 8, 0]} intensity={0.5} />

                {/* Estrutura completa do armazém */}
                <ArmazemCompleto3D 
                  dadosPortal={dadosPortal}
                  analiseArcos={analiseArcos}
                  arcoSelecionado={arcoSelecionado}
                />

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.5}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={8}
                  maxDistance={35}
                />

                {/* Grid de referência expandido */}
                <gridHelper args={[30, 30, '#444444', '#888888']} position={[0, -2, 0]} />
              </Canvas>
            </div>
          </div>

          {/* Informações da Visualização */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Visão Completa do Armazém - Todos os Arcos</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <small><strong>Controles 3D:</strong><br/>
                      • Clique e arraste para rotacionar<br/>
                      • Scroll para zoom<br/>
                      • Clique direito e arraste para mover<br/>
                      • Use seletor para destacar arcos</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Estrutura do Armazém:</strong><br/>
                      • Total: {analiseArcos.totalArcos} arcos<br/>
                      • Pêndulos: {analiseArcos.estatisticas.totalPendulos}<br/>
                      • Sensores: {analiseArcos.estatisticas.totalSensores}<br/>
                      • Vista lateral e topo combinadas</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Arco Selecionado ({arcoSelecionado}):</strong><br/>
                      {analiseArcos.arcos[arcoSelecionado] && 
                        analiseArcos.arcos[arcoSelecionado].pendulos.map(pendulo => (
                          <span key={pendulo.numero} className="badge bg-primary me-1 mb-1">
                            P{pendulo.numero}: {pendulo.totalSensores}S
                          </span>
                        ))
                      }
                      </small>
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
