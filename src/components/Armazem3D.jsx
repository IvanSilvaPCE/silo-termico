import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutManager from "../utils/layoutManager";

const Pendulo3D = ({ position, numero, sensores, arcoNumero, alturaArmazem }) => {
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

  const espacamentoSensores = (alturaArmazem * 0.7) / (Object.keys(sensores).length + 1);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - mais realista */}
      <mesh position={[0, alturaArmazem / 3, 0]}>
        <cylinderGeometry args={[0.018, 0.018, alturaArmazem * 0.7, 12]} />
        <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Placa de identificação do pêndulo */}
      <Billboard position={[0, alturaArmazem * 0.8, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.25]} />
          <meshStandardMaterial color="#3A78FD" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          P{numero}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo */}
      {Object.entries(sensores).map(([sensorKey, valores], index) => {
        const s = parseInt(sensorKey);
        const [temp, , , falha, nivel] = valores;
        const yPos = alturaArmazem * 0.65 - (s * espacamentoSensores);
        const cor = nivel ? corFaixaExata(temp) : "#cccccc";

        return (
          <group key={s} position={[0, yPos, 0]}>
            {/* Corpo do sensor - mais detalhado */}
            <mesh>
              <boxGeometry args={[0.2, 0.1, 0.1]} />
              <meshStandardMaterial 
                color={cor}
                emissive={falha ? "#ff0000" : "#000000"}
                emissiveIntensity={falha ? 0.25 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Antena do sensor */}
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>

            {/* Display do valor */}
            <Billboard position={[0, 0, 0.07]}>
              <mesh>
                <planeGeometry args={[0.15, 0.05]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.03}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
              >
                {falha ? "ERR" : temp.toFixed(1) + "°"}
              </Text>
            </Billboard>

            {/* Label lateral do sensor */}
            <Billboard position={[-0.15, 0, 0]}>
              <Text
                fontSize={0.025}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                S{s}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Peso na extremidade */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 0.15, 12]} />
        <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

const ArmazemStructure3D = ({ analiseArcos, arcoSelecionado, alturaArmazem }) => {
  //const texturaParede = useLoader(THREE.TextureLoader, "/texturas/paredeArmazem.jpg").catch(() => null);
  //const texturaTelhado = useLoader(THREE.TextureLoader, "/texturas/telhadoArmazem.jpg").catch(() => null);

  const totalArcos = analiseArcos.totalArcos;
  const larguraArmazem = totalArcos * 5; // 5 metros por arco
  const profundidadeArmazem = 6;
  const alturaTelhado = alturaArmazem * 0.4;

  return (
    <group>
      {/* Base/Piso do armazém */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[larguraArmazem + 1, 0.4, profundidadeArmazem + 1]} />
        <meshStandardMaterial color="#888888" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Estrutura principal do armazém */}
      <group>
        {/* Paredes laterais */}
        <mesh position={[-larguraArmazem/2 - 0.1, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.9}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[larguraArmazem/2 + 0.1, alturaArmazem/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, alturaArmazem, profundidadeArmazem]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.9}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Paredes das extremidades */}
        <mesh position={[0, alturaArmazem/2, -profundidadeArmazem/2 - 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, alturaArmazem/2, profundidadeArmazem/2 + 0.1]} castShadow receiveShadow>
          <boxGeometry args={[larguraArmazem, alturaArmazem, 0.2]} />
          <meshStandardMaterial 
            color="#E0E0E0" 
            transparent 
            opacity={0.8}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Telhado em formato de casa - duas águas */}
        <group position={[0, alturaArmazem + alturaTelhado/2, 0]}>
          {/* Lado esquerdo do telhado */}
          <mesh position={[0, 0, -profundidadeArmazem/4]} rotation={[0, 0, Math.PI/6]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.1, profundidadeArmazem/2 + 0.2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          {/* Lado direito do telhado */}
          <mesh position={[0, 0, profundidadeArmazem/4]} rotation={[0, 0, -Math.PI/6]} castShadow>
            <boxGeometry args={[larguraArmazem + 0.5, 0.1, profundidadeArmazem/2 + 0.2]} />
            <meshStandardMaterial 
              color="#8B4513" 
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* Estruturas de divisão entre arcos (vigas) */}
        {Array.from({length: totalArcos + 1}, (_, i) => {
          const x = -larguraArmazem/2 + i * 5;
          return (
            <group key={i}>
              {/* Viga vertical */}
              <mesh position={[x, alturaArmazem/2, 0]} castShadow>
                <boxGeometry args={[0.15, alturaArmazem + 0.2, 0.15]} />
                <meshStandardMaterial 
                  color={i === arcoSelecionado ? "#FF6B35" : "#999999"} 
                  metalness={0.6}
                  roughness={0.4}
                />
              </mesh>

              {/* Viga horizontal superior */}
              <mesh position={[x, alturaArmazem, 0]}>
                <boxGeometry args={[0.15, 0.15, profundidadeArmazem]} />
                <meshStandardMaterial color="#999999" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Label do arco */}
              {i > 0 && i <= totalArcos && (
                <Billboard position={[x - 2.5, alturaArmazem + alturaTelhado + 0.5, 0]}>
                  <Text
                    fontSize={0.4}
                    color={i === arcoSelecionado ? "#FF6B35" : "#333333"}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/inter-bold.woff"
                  >
                    ARCO {i}
                  </Text>
                </Billboard>
              )}
            </group>
          );
        })}

        {/* Vigas de apoio do telhado */}
        {Array.from({length: 3}, (_, i) => (
          <mesh key={i} position={[0, alturaArmazem + 0.1, -profundidadeArmazem/2 + i * profundidadeArmazem/2]}>
            <boxGeometry args={[larguraArmazem, 0.1, 0.1]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Highlight do arco selecionado */}
      {arcoSelecionado && (
        <mesh position={[
          -larguraArmazem/2 + (arcoSelecionado - 1) * 5 + 2.5,
          alturaArmazem/2,
          0
        ]}>
          <boxGeometry args={[4.8, alturaArmazem + 0.5, profundidadeArmazem + 0.8]} />
          <meshStandardMaterial 
            color="#FF6B35" 
            transparent 
            opacity={0.1}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Portões de acesso */}
      {[0, totalArcos + 1].map((arcoIndex, i) => {
        const x = -larguraArmazem/2 + arcoIndex * 5;
        return (
          <mesh key={i} position={[x, alturaArmazem * 0.4, profundidadeArmazem/2 + 0.05]}>
            <boxGeometry args={[3, alturaArmazem * 0.8, 0.1]} />
            <meshStandardMaterial color="#654321" roughness={0.8} metalness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
};

const ArmazemCompleto3D = ({ dadosPortal, analiseArcos, arcoSelecionado, alturaArmazem }) => {
  const pendulosPositions = useMemo(() => {
    if (!analiseArcos || !dadosPortal) return {};

    const posicoesPorArco = {};
    const larguraArmazem = analiseArcos.totalArcos * 5;

    Object.keys(analiseArcos.arcos).forEach(arcoNum => {
      const arcoInfo = analiseArcos.arcos[arcoNum];
      const arcoIndex = parseInt(arcoNum) - 1;

      if (arcoInfo) {
        const positions = [];
        const xArco = -larguraArmazem/2 + arcoIndex * 5 + 2.5;
        const larguraArco = 4;
        const espacamentoPendulo = arcoInfo.totalPendulos > 1 ? 
          larguraArco / (arcoInfo.totalPendulos + 1) : larguraArco / 2;

        arcoInfo.pendulos.forEach((pendulo, index) => {
          const xLocal = -larguraArco/2 + (index + 1) * espacamentoPendulo;
          const xGlobal = xArco + xLocal;
          const z = (index % 2 === 0 ? -1.2 : 1.2);
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
        alturaArmazem={alturaArmazem}
      />

      {/* Renderizar pêndulos para todos os arcos */}
      {Object.entries(pendulosPositions).map(([arcoNum, positions]) => {
        const arcoInfo = analiseArcos.arcos[arcoNum];
        if (!arcoInfo) return null;

        const dadosArco = LayoutManager.converterDadosPortalParaArmazem(dadosPortal, parseInt(arcoNum));

        return positions.map((position, index) => {
          const pendulo = arcoInfo.pendulos[index];
          if (!pendulo) return null;

          const penduloKey = Object.keys(dadosArco.leitura)[index];
          const sensoresData = dadosArco.leitura[penduloKey];

          return (
            <Pendulo3D
              key={`${arcoNum}-${pendulo.numero}`}
              position={position}
              numero={pendulo.numero}
              sensores={sensoresData || {}}
              arcoNumero={parseInt(arcoNum)}
              alturaArmazem={alturaArmazem}
            />
          );
        });
      })}

      {/* Sistema de iluminação interno */}
      {Array.from({length: analiseArcos.totalArcos}, (_, i) => (
        <pointLight 
          key={i}
          position={[-analiseArcos.totalArcos * 2.5 + i * 5 + 2.5, alturaArmazem * 0.9, 0]}
          intensity={0.5}
          distance={8}
          decay={2}
          color="#fff8dc"
        />
      ))}
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

  // Altura baseada nos dados reais
  const alturaArmazem = 8; // metros

  useEffect(() => {
    const inicializarDados = async () => {
      try {
        setCarregando(true);

        const dadosExemplo = LayoutManager.gerarDadosExemploPortal();
        setDadosPortal(dadosExemplo);

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
          <p className="mt-2">Carregando Armazém 3D Realista...</p>
        </div>
      </div>
    );
  }

  const larguraTotal = analiseArcos.totalArcos * 5;

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Armazém 3D - Modelo Industrial Realista</h1>

          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">Controles de Visualização 3D Avançada</h6>
                </div>
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="autoRotate"
                          checked={autoRotate}
                          onChange={(e) => setAutoRotate(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="autoRotate">
                          Auto Rotação
                        </label>
                      </div>
                    </div>
                    <div className="col-md-2">
                      <div className="form-check form-switch">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="visaoCompleta"
                          checked={visaoCompleta}
                          onChange={(e) => setVisaoCompleta(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="visaoCompleta">
                          Visão Ampla
                        </label>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">Arco Destacado:</label>
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
                          Próximo →
                        </button>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <span className="badge bg-info me-1">{larguraTotal}m × {alturaArmazem}m</span>
                      <span className="badge bg-success me-1">{analiseArcos.estatisticas.totalPendulos}P</span>
                      <span className="badge bg-warning">{analiseArcos.estatisticas.totalSensores}S</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas 3D */}
          <div className="card" style={{ height: '75vh' }}>
            <div className="card-body p-0">
              <Canvas 
                camera={{ 
                  position: visaoCompleta ? [larguraTotal * 0.8, alturaArmazem * 1.2, larguraTotal * 0.6] : [larguraTotal * 0.4, alturaArmazem * 0.8, larguraTotal * 0.4], 
                  fov: 60 
                }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
                shadows
              >
                {/* Iluminação realista */}
                <ambientLight intensity={0.3} />
                <directionalLight 
                  position={[larguraTotal, alturaArmazem * 2, larguraTotal * 0.5]} 
                  intensity={1.2} 
                  castShadow
                  shadow-mapSize-width={4096}
                  shadow-mapSize-height={4096}
                  shadow-camera-far={larguraTotal * 2}
                  shadow-camera-left={-larguraTotal}
                  shadow-camera-right={larguraTotal}
                  shadow-camera-top={alturaArmazem * 2}
                  shadow-camera-bottom={-alturaArmazem}
                />
                <directionalLight 
                  position={[-larguraTotal * 0.5, alturaArmazem * 1.5, -larguraTotal * 0.3]} 
                  intensity={0.6} 
                  color="#fff8dc"
                />
                <spotLight 
                  position={[0, alturaArmazem * 2, 0]} 
                  angle={1.2} 
                  penumbra={0.3} 
                  intensity={0.8} 
                  castShadow 
                />

                {/* Estrutura completa do armazém */}
                <ArmazemCompleto3D 
                  dadosPortal={dadosPortal}
                  analiseArcos={analiseArcos}
                  arcoSelecionado={arcoSelecionado}
                  alturaArmazem={alturaArmazem}
                />

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.3}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={visaoCompleta ? larguraTotal * 0.5 : larguraTotal * 0.3}
                  maxDistance={visaoCompleta ? larguraTotal * 2 : larguraTotal * 1.2}
                  maxPolarAngle={Math.PI / 2 + 0.2}
                />

                {/* Plano do terreno */}
                <mesh position={[0, -1, 0]} receiveShadow>
                  <planeGeometry args={[larguraTotal * 2, larguraTotal * 1.5]} />
                  <meshStandardMaterial color="#8FBC8F" />
                  <primitive object={new THREE.Mesh().rotateX(-Math.PI / 2)} />
                </mesh>

                {/* Grid de referência expandido */}
                <gridHelper 
                  args={[larguraTotal * 1.5, larguraTotal, '#555555', '#888888']} 
                  position={[0, -0.9, 0]} 
                />
              </Canvas>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Armazém 3D - Modelo Industrial com Estrutura Realista Tipo Galpão</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <small><strong>Estrutura Industrial:</strong><br/>
                      • Dimensões: {larguraTotal}m × 6m × {alturaArmazem}m<br/>
                      • Telhado duas águas<br/>
                      • Vigas de sustentação<br/>
                      • Portões de acesso</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Sistema de Monitoramento:</strong><br/>
                      • {analiseArcos.totalArcos} arcos independentes<br/>
                      • {analiseArcos.estatisticas.totalPendulos} pêndulos termométricos<br/>
                      • {analiseArcos.estatisticas.totalSensores} sensores distribuídos<br/>
                      • Iluminação interna automatizada</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Arco Destacado ({arcoSelecionado}):</strong><br/>
                      • Pêndulos: {analiseArcos.arcos[arcoSelecionado]?.totalPendulos}<br/>
                      • Sensores: {analiseArcos.arcos[arcoSelecionado]?.totalSensores}<br/>
                      • Estrutura destacada em laranja<br/>
                      • Posicionamento otimizado</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Recursos Avançados:</strong><br/>
                      • Sistema de sombras realistas<br/>
                      • Iluminação dinâmica<br/>
                      • Controles de câmera profissionais</small>
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