
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const Pendulo3D = ({ position, numero, sensores, arcoNumero }) => {
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
      {/* Cabo principal - mais fino */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 4.5, 8]} />
        <meshStandardMaterial color="#333333" transparent opacity={0.8} />
      </mesh>

      {/* Nome do pêndulo na base */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.06]} />
        <meshStandardMaterial color="#3A78FD" />
      </mesh>
      <Text
        position={[0, -0.5, 0.04]}
        fontSize={0.06}
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
        const yPos = 4.2 - (s * 0.22);
        const cor = nivel ? corFaixaExata(temp) : "#e6e6e6";
        
        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Caixa do sensor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.15, 0.08, 0.08]} />
              <meshStandardMaterial 
                color={cor}
                emissive={falha ? "#ff0000" : "#000000"}
                emissiveIntensity={falha ? 0.3 : 0}
              />
            </mesh>
            
            {/* Texto do valor */}
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.035}
              color={cor === "#ff2200" ? "white" : "black"}
              anchorX="center"
              anchorY="middle"
            >
              {falha ? "ERR" : temp.toFixed(1)}
            </Text>
            
            {/* Label do sensor */}
            <Text
              position={[-0.1, 0, 0]}
              fontSize={0.025}
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

const ArmazemStructure3D = ({ analiseArcos, arcoSelecionado }) => {
  const totalArcos = analiseArcos.totalArcos;
  const larguraArmazem = totalArcos * 4; // 4 metros por arco
  const alturaArmazem = 6;
  const profundidadeArmazem = 4;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[larguraArmazem, 0.2, profundidadeArmazem]} />
        <meshStandardMaterial color="#999999" />
      </mesh>

      {/* Estrutura principal do armazém - formato casa */}
      <group>
        {/* Paredes laterais */}
        <mesh position={[-larguraArmazem/2, alturaArmazem/2, 0]}>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial color="#E6E6E6" transparent opacity={0.8} />
        </mesh>
        <mesh position={[larguraArmazem/2, alturaArmazem/2, 0]}>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial color="#E6E6E6" transparent opacity={0.8} />
        </mesh>

        {/* Paredes das extremidades */}
        <mesh position={[0, alturaArmazem/2, -profundidadeArmazem/2]}>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial color="#E6E6E6" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, alturaArmazem/2, profundidadeArmazem/2]}>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial color="#E6E6E6" transparent opacity={0.6} />
        </mesh>

        {/* Telhado em formato de "chapéu" - usando geometria customizada */}
        <mesh position={[0, alturaArmazem + 1, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[larguraArmazem * 0.6, 2, 4]} />
          <meshStandardMaterial color="#CCCCCC" transparent opacity={0.7} />
        </mesh>

        {/* Estruturas de divisão entre arcos (pilares internos) */}
        {Array.from({length: totalArcos - 1}, (_, i) => {
          const x = -larguraArmazem/2 + (i + 1) * 4;
          return (
            <group key={i}>
              <mesh position={[x, alturaArmazem/2, 0]}>
                <boxGeometry args={[0.1, alturaArmazem, 0.1]} />
                <meshStandardMaterial 
                  color={i + 2 === arcoSelecionado ? "#438AF6" : "#BBBBBB"} 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
              
              {/* Label do arco */}
              <Text
                position={[x, alturaArmazem + 0.5, 0]}
                fontSize={0.3}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                A{i + 2}
              </Text>
            </group>
          );
        })}

        {/* Labels dos arcos das extremidades */}
        <Text
          position={[-larguraArmazem/2 + 2, alturaArmazem + 0.5, 0]}
          fontSize={0.3}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          A1
        </Text>
        <Text
          position={[larguraArmazem/2 - 2, alturaArmazem + 0.5, 0]}
          fontSize={0.3}
          color="#333333"  
          anchorX="center"
          anchorY="middle"
        >
          A{totalArcos}
        </Text>
      </group>

      {/* Highlight do arco selecionado */}
      {arcoSelecionado && (
        <mesh position={[
          -larguraArmazem/2 + (arcoSelecionado - 1) * 4 + 2,
          alturaArmazem/2,
          0
        ]}>
          <boxGeometry args={[3.8, alturaArmazem + 0.5, profundidadeArmazem + 0.5]} />
          <meshStandardMaterial 
            color="#438AF6" 
            transparent 
            opacity={0.15}
            wireframe={false}
          />
        </mesh>
      )}
    </group>
  );
};

const ArmazemCompleto3D = ({ dadosPortal, analiseArcos, arcoSelecionado }) => {
  // Calcular posições dos pêndulos para todos os arcos
  const pendulosPositions = useMemo(() => {
    if (!analiseArcos || !dadosPortal) return {};
    
    const posicoesPorArco = {};
    const larguraArmazem = analiseArcos.totalArcos * 4;
    
    Object.keys(analiseArcos.arcos).forEach(arcoNum => {
      const arcoInfo = analiseArcos.arcos[arcoNum];
      const arcoIndex = parseInt(arcoNum) - 1;
      
      if (arcoInfo) {
        const positions = [];
        const xArco = -larguraArmazem/2 + arcoIndex * 4 + 2; // Centro do arco
        const larguraArco = 3.5;
        const espacamentoPendulo = arcoInfo.totalPendulos > 1 ? 
          larguraArco / (arcoInfo.totalPendulos - 1) : 0;
        
        arcoInfo.pendulos.forEach((pendulo, index) => {
          const xLocal = arcoInfo.totalPendulos === 1 ? 0 : 
            -larguraArco/2 + espacamentoPendulo * index;
          const xGlobal = xArco + xLocal;
          const z = (index % 2 === 0 ? -0.8 : 0.8); // Alternância em Z
          positions.push([xGlobal, 0, z]);
        });
        
        posicoesPorArco[arcoNum] = positions;
      }
    });
    
    return posicoesPorArco;
  }, [analiseArcos, dadosPortal]);

  return (
    <group>
      {/* Estrutura do armazém */}
      <ArmazemStructure3D 
        analiseArcos={analiseArcos} 
        arcoSelecionado={arcoSelecionado}
      />

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
              arcoNumero={parseInt(arcoNum)}
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
  const [visaoCompleta, setVisaoCompleta] = useState(true);

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
          <h1 className="text-center mb-3 fs-4 fs-md-1">Armazém 3D - Estrutura Completa Tipo Casa</h1>
          
          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Controles de Visualização 3D</h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-3">
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
                    <div className="col-md-3">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="visaoCompleta"
                          checked={visaoCompleta}
                          onChange={(e) => setVisaoCompleta(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="visaoCompleta">
                          Visão Completa
                        </label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Destacar Arco:</label>
                      <div className="d-flex gap-2 align-items-center">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => mudarArco(Math.max(1, arcoSelecionado - 1))}
                          disabled={arcoSelecionado <= 1}
                        >
                          ← Ant
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
                                Arco {numeroArco} ({arco.totalPendulos}P/{arco.totalSensores}S)
                              </option>
                            );
                          })}
                        </select>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => mudarArco(Math.min(analiseArcos.totalArcos, arcoSelecionado + 1))}
                          disabled={arcoSelecionado >= analiseArcos.totalArcos}
                        >
                          Prox →
                        </button>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <button 
                        className={`btn ${mostrarMapaCalor ? 'btn-success' : 'btn-outline-primary'} btn-sm`}
                        onClick={() => setMostrarMapaCalor(!mostrarMapaCalor)}
                      >
                        {mostrarMapaCalor ? 'Normal' : 'Mapa Calor'}
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
                camera={{ 
                  position: visaoCompleta ? [25, 12, 20] : [12, 8, 12], 
                  fov: 60 
                }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #f0f8ff)' }}
              >
                {/* Iluminação aprimorada */}
                <ambientLight intensity={0.6} />
                <directionalLight 
                  position={[30, 20, 15]} 
                  intensity={1.2} 
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[0, 10, 0]} intensity={0.6} />
                <pointLight position={[-15, 8, 10]} intensity={0.4} color="#ffffff" />
                <pointLight position={[15, 8, -10]} intensity={0.4} color="#ffffff" />

                {/* Estrutura completa do armazém */}
                <ArmazemCompleto3D 
                  dadosPortal={dadosPortal}
                  analiseArcos={analiseArcos}
                  arcoSelecionado={arcoSelecionado}
                />

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.4}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={visaoCompleta ? 15 : 8}
                  maxDistance={visaoCompleta ? 60 : 35}
                />

                {/* Grid de referência expandido */}
                <gridHelper 
                  args={[analiseArcos.totalArcos * 6, analiseArcos.totalArcos * 2, '#444444', '#888888']} 
                  position={[0, -2, 0]} 
                />
              </Canvas>
            </div>
          </div>

          {/* Informações da Visualização */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Armazém 3D - Estrutura Completa Tipo Casa com Todos os Arcos</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <small><strong>Controles 3D:</strong><br/>
                      • Clique e arraste para rotacionar<br/>
                      • Scroll para zoom<br/>
                      • Clique direito e arraste para mover<br/>
                      • Use seletor para destacar arcos</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Estrutura Casa:</strong><br/>
                      • Total: {analiseArcos.totalArcos} arcos<br/>
                      • Pêndulos: {analiseArcos.estatisticas.totalPendulos}<br/>
                      • Sensores: {analiseArcos.estatisticas.totalSensores}<br/>
                      • Telhado tipo "chapéu"</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Arco Destacado ({arcoSelecionado}):</strong><br/>
                      • Pêndulos: {analiseArcos.arcos[arcoSelecionado]?.totalPendulos}<br/>
                      • Sensores: {analiseArcos.arcos[arcoSelecionado]?.totalSensores}<br/>
                      • Distribuição automática<br/>
                      • Visão topo + lateral</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Distribuição por Arco:</strong><br/>
                      {analiseArcos.arcos[arcoSelecionado] && 
                        analiseArcos.arcos[arcoSelecionado].pendulos.slice(0,3).map(pendulo => (
                          <span key={pendulo.numero} className="badge bg-primary me-1 mb-1">
                            P{pendulo.numero}: {pendulo.totalSensores}S
                          </span>
                        ))
                      }
                      {analiseArcos.arcos[arcoSelecionado]?.pendulos.length > 3 && 
                        <span className="badge bg-secondary">+{analiseArcos.arcos[arcoSelecionado].pendulos.length - 3}</span>
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
