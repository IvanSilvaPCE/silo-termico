
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";

const Cabo3D = ({ position, pendulo, sensores, escala = 0.3 }) => {
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

  const sensoresArray = Object.entries(sensores).map(([key, valores]) => ({
    numero: parseInt(key),
    temp: parseFloat(valores[0]),
    alarme: valores[1],
    qualidade: valores[2],
    falha: valores[3],
    ativo: valores[4]
  }));

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - mais fino e discreto */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 6, 8]} />
        <meshStandardMaterial color="#222222" transparent opacity={0.7} />
      </mesh>

      {/* Nome do pêndulo no topo */}
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[0.6, 0.15, 0.08]} />
        <meshStandardMaterial color="#3A78FD" />
      </mesh>
      <Text
        position={[0, 5.2, 0.05]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {pendulo}
      </Text>

      {/* Sensores distribuídos ao longo do cabo */}
      {sensoresArray.map((sensor, index) => {
        const yPos = 4.8 - (index * 0.4);
        const cor = sensor.ativo ? corFaixaExata(sensor.temp) : "#e6e6e6";
        
        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            {/* Caixa do sensor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.08, 0.08]} />
              <meshStandardMaterial 
                color={cor} 
                emissive={sensor.alarme ? "#ff0000" : "#000000"}
                emissiveIntensity={sensor.alarme ? 0.4 : 0}
              />
            </mesh>
            
            {/* Texto do valor */}
            <Text
              position={[0, 0, 0.05]}
              fontSize={0.04}
              color={cor === "#ff2200" ? "white" : "black"}
              anchorX="center"
              anchorY="middle"
            >
              {sensor.falha ? "ERR" : sensor.temp.toFixed(1)}
            </Text>
            
            {/* Label do sensor */}
            <Text
              position={[-0.12, 0, 0]}
              fontSize={0.03}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              S{sensor.numero}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

const Aerador3D = ({ position, id, status }) => {
  const grupoRef = useRef();
  const heliceRef = useRef();

  // Cores baseadas no status
  const cores = {
    0: "#c5c5c5", // desligado
    1: "#ffeb3b", // startando
    3: "#31dd0f", // ligado
    4: "#ff0000"  // erro
  };

  useFrame((state, delta) => {
    if (heliceRef.current && status === 3) {
      heliceRef.current.rotation.y += delta * 12;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      {/* Base do aerador */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.12, 16]} />
        <meshStandardMaterial color={cores[status] || cores[0]} />
      </mesh>

      {/* Hélice */}
      <group ref={heliceRef} position={[0, 0.08, 0]}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
          <mesh
            key={index}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.15,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.15
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.05, 0.02, 0.18]} />
            <meshStandardMaterial color="white" />
          </mesh>
        ))}
      </group>

      {/* Label */}
      <Text
        position={[0, -0.15, 0]}
        fontSize={0.06}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        AE-{id}
      </Text>
    </group>
  );
};

const SiloStructure3D = ({ layout, numCabos }) => {
  const { lb, hs, hb } = layout.desenho_corte_silo;
  
  // Converter dimensões SVG para escala 3D realista
  const raioTopo = (lb / 100) * 0.8; // Raio do topo
  const raioBase = (lb / 100) * 0.4; // Raio da base (menor para formato funil)
  const alturaCilindro = (hs / 80); // Altura da parte superior
  const alturaFunil = (hb / 40); // Altura do funil
  
  // Criar geometria customizada do funil
  const criarGeometriaFunil = () => {
    const geometry = new THREE.ConeGeometry(raioTopo, alturaCilindro + alturaFunil, 24);
    return geometry;
  };

  return (
    <group>
      {/* Corpo principal do silo - formato funil realista */}
      <mesh position={[0, (alturaCilindro + alturaFunil) / 2 - 1, 0]}>
        <coneGeometry args={[raioTopo, alturaCilindro + alturaFunil, 32]} />
        <meshStandardMaterial 
          color="#E7E7E7" 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Base cônica menor (saída do funil) */}
      <mesh position={[0, -(alturaCilindro + alturaFunil) / 2 - 0.5, 0]}>
        <coneGeometry args={[raioBase, alturaFunil * 0.8, 16]} />
        <meshStandardMaterial 
          color="#D0D0D0" 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Topo do silo com abertura */}
      <mesh position={[0, alturaCilindro + 0.3, 0]}>
        <ringGeometry args={[raioTopo * 0.7, raioTopo, 0, Math.PI * 2, 32]} />
        <meshStandardMaterial color="#CCCCCC" side={THREE.DoubleSide} />
      </mesh>

      {/* Estrutura de suporte no topo */}
      <mesh position={[0, alturaCilindro + 0.5, 0]}>
        <cylinderGeometry args={[raioTopo * 1.1, raioTopo * 1.1, 0.1, 6]} />
        <meshStandardMaterial color="#999999" />
      </mesh>

      {/* Saída do funil */}
      <mesh position={[0, -(alturaCilindro + alturaFunil) / 2 - 1, 0]}>
        <cylinderGeometry args={[raioBase * 0.6, raioBase * 0.6, 0.3, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  );
};

const Silo3D = ({ dados }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [mostrarMapaCalor, setMostrarMapaCalor] = useState(false);

  if (!dados) return <div>Carregando dados 3D...</div>;

  const layout = dados.dados_layout;
  const leitura = dados.leitura;
  const motorStatus = dados.motor?.statusMotor || [];

  // Calcular posições dos cabos de forma concêntrica e adaptativa
  const cabosPositions = useMemo(() => {
    const nCabos = Object.keys(leitura).length;
    const positions = [];
    const raio = (layout.desenho_corte_silo.lb / 100) * 0.5;

    // Distribuição inteligente baseada na quantidade de cabos
    if (nCabos === 1) {
      positions.push([0, 0, 0]);
    } else if (nCabos <= 6) {
      // Círculo simples
      Object.keys(leitura).forEach((pend, index) => {
        const angle = (index / nCabos) * Math.PI * 2;
        const x = Math.cos(angle) * raio * 0.7;
        const z = Math.sin(angle) * raio * 0.7;
        positions.push([x, 0, z]);
      });
    } else {
      // Múltiplos círculos concêntricos para muitos cabos
      const cabosInternos = Math.min(6, Math.floor(nCabos / 2));
      const cabosExternos = nCabos - cabosInternos;
      
      let index = 0;
      
      // Círculo interno
      for (let i = 0; i < cabosInternos; i++) {
        const angle = (i / cabosInternos) * Math.PI * 2;
        const x = Math.cos(angle) * raio * 0.4;
        const z = Math.sin(angle) * raio * 0.4;
        positions.push([x, 0, z]);
        index++;
      }
      
      // Círculo externo
      for (let i = 0; i < cabosExternos; i++) {
        const angle = (i / cabosExternos) * Math.PI * 2;
        const x = Math.cos(angle) * raio * 0.8;
        const z = Math.sin(angle) * raio * 0.8;
        positions.push([x, 0, z]);
      }
    }

    return positions;
  }, [layout, leitura]);

  // Calcular posições dos aeradores na base
  const aeradoresPositions = useMemo(() => {
    if (!layout.aeradores || layout.aeradores.na <= 0) return [];
    
    const numAeradores = layout.aeradores.na;
    const positions = [];
    const raio = (layout.desenho_corte_silo.lb / 100) * 0.9;
    
    for (let i = 0; i < numAeradores; i++) {
      const angle = (i / numAeradores) * Math.PI * 2;
      const x = Math.cos(angle) * raio;
      const z = Math.sin(angle) * raio;
      const y = -2.8; // Na base do silo
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [layout]);

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Silo 3D - Modelo Funil Realista</h1>
          
          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
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
                    <div className="col-md-4 text-center">
                      <span className="badge bg-info me-2">{Object.keys(leitura).length} Pêndulos</span>
                      <span className="badge bg-success">{Object.values(leitura).reduce((acc, p) => acc + Object.keys(p).length, 0)} Sensores</span>
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
                camera={{ position: [8, 6, 8], fov: 65 }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #f0f8ff)' }}
              >
                {/* Iluminação aprimorada */}
                <ambientLight intensity={0.5} />
                <directionalLight 
                  position={[12, 10, 8]} 
                  intensity={1.2} 
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                />
                <pointLight position={[0, 6, 0]} intensity={0.6} />
                <pointLight position={[-5, 3, 5]} intensity={0.3} color="#ffffff" />

                {/* Estrutura do silo */}
                <SiloStructure3D layout={layout} numCabos={Object.keys(leitura).length} />

                {/* Cabos e sensores */}
                {Object.entries(leitura).map(([pendulo, sensores], index) => (
                  <Cabo3D
                    key={pendulo}
                    position={cabosPositions[index]}
                    pendulo={pendulo}
                    sensores={sensores}
                  />
                ))}

                {/* Aeradores */}
                {aeradoresPositions.map((position, index) => (
                  <Aerador3D
                    key={index}
                    position={position}
                    id={index + 1}
                    status={motorStatus[index] || 0}
                  />
                ))}

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.8}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={4}
                  maxDistance={25}
                />

                {/* Grid de referência */}
                <gridHelper args={[12, 12, '#444444', '#888888']} position={[0, -4, 0]} />
              </Canvas>
            </div>
          </div>

          {/* Informações */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Silo 3D - Formato Funil Realista</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <small><strong>Controles:</strong><br/>
                      • Clique e arraste para rotacionar<br/>
                      • Scroll para zoom<br/>
                      • Clique direito e arraste para mover<br/>
                      • Distribuição automática de cabos</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Estrutura Funil:</strong><br/>
                      • Formato cônico realista<br/>
                      • Cabos internos adaptativos<br/>
                      • Distribuição concêntrica inteligente<br/>
                      • Aeradores na base externa</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Cores dos Sensores:</strong><br/>
                      • <span style={{color: '#0384fc'}}>■</span> Frio (&lt;15°C)<br/>
                      • <span style={{color: '#07fc03'}}>■</span> Normal (15-25°C)<br/>
                      • <span style={{color: '#ffb300'}}>■</span> Quente (25-35°C)<br/>
                      • <span style={{color: '#ff2200'}}>■</span> Crítico (&gt;35°C)</small>
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

export default Silo3D;
