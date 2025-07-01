
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
      {/* Cabo principal (cilindro vertical) - mais fino */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 6, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Nome do pêndulo na base */}
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.1]} />
        <meshStandardMaterial color="#3A78FD" />
      </mesh>
      <Text
        position={[0, -3.5, 0.1]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {pendulo}
      </Text>

      {/* Sensores ao longo do cabo */}
      {sensoresArray.map((sensor, index) => {
        const yPos = -2.5 + (index * 0.5);
        const cor = sensor.ativo ? corFaixaExata(sensor.temp) : "#e6e6e6";
        
        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            {/* Caixa do sensor */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.25, 0.12, 0.12]} />
              <meshStandardMaterial 
                color={cor} 
                emissive={sensor.alarme ? "#ff0000" : "#000000"}
                emissiveIntensity={sensor.alarme ? 0.3 : 0}
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
              {sensor.falha ? "ERRO" : sensor.temp.toFixed(1)}
            </Text>
            
            {/* Label do sensor */}
            <Text
              position={[-0.2, 0, 0]}
              fontSize={0.05}
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
      heliceRef.current.rotation.z += delta * 10;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      {/* Base do aerador */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.15, 16]} />
        <meshStandardMaterial color={cores[status] || cores[0]} />
      </mesh>

      {/* Hélice */}
      <group ref={heliceRef} position={[0, 0.1, 0]}>
        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <mesh
            key={index}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.2,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.2
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.08, 0.03, 0.25]} />
            <meshStandardMaterial color="white" />
          </mesh>
        ))}
      </group>

      {/* Label */}
      <Text
        position={[0, -0.2, 0]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        AE-{id}
      </Text>
    </group>
  );
};

const SiloStructure3D = ({ layout }) => {
  const { lb, hs, hb } = layout.desenho_corte_silo;
  
  // Converter dimensões 2D para 3D (escala apropriada)
  const raio = lb / 100; // Raio do cilindro
  const alturaCilindro = hs / 100; // Altura da parte cilíndrica
  const alturaBase = hb / 80; // Altura da base cônica
  
  return (
    <group>
      {/* Corpo principal do silo (cilindro) */}
      <mesh position={[0, alturaCilindro/2, 0]}>
        <cylinderGeometry args={[raio, raio, alturaCilindro, 32]} />
        <meshStandardMaterial 
          color="#E7E7E7" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Base cônica do silo */}
      <mesh position={[0, -alturaBase/2, 0]}>
        <coneGeometry args={[raio, alturaBase, 16]} />
        <meshStandardMaterial 
          color="#D0D0D0" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Topo do silo */}
      <mesh position={[0, alturaCilindro + 0.1, 0]}>
        <cylinderGeometry args={[raio, raio, 0.2, 32]} />
        <meshStandardMaterial color="#CCCCCC" />
      </mesh>

      {/* Borda superior */}
      <mesh position={[0, alturaCilindro + 0.05, 0]}>
        <torusGeometry args={[raio, 0.05, 16, 32]} />
        <meshStandardMaterial color="#999999" />
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

  // Calcular posições dos cabos em 3D de forma circular dentro do silo
  const cabosPositions = useMemo(() => {
    const nCabos = Object.keys(leitura).length;
    const positions = [];
    const raio = (layout.desenho_corte_silo.lb / 100) * 0.7; // Posicionar cabos dentro do silo

    Object.keys(leitura).forEach((pend, index) => {
      const angle = (index / nCabos) * Math.PI * 2;
      const x = Math.cos(angle) * raio;
      const z = Math.sin(angle) * raio;
      positions.push([x, 0, z]);
    });

    return positions;
  }, [layout, leitura]);

  // Calcular posições dos aeradores na base do silo
  const aeradoresPositions = useMemo(() => {
    if (!layout.aeradores || layout.aeradores.na <= 0) return [];
    
    const numAeradores = layout.aeradores.na;
    const positions = [];
    const raio = (layout.desenho_corte_silo.lb / 100) * 0.8;
    
    for (let i = 0; i < numAeradores; i++) {
      const angle = (i / numAeradores) * Math.PI * 2;
      const x = Math.cos(angle) * raio;
      const z = Math.sin(angle) * raio;
      const y = -1.5; // Na base do silo
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [layout]);

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Silo 3D - Visualização Tridimensional</h1>
          
          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
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
                camera={{ position: [8, 5, 8], fov: 60 }}
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

                {/* Estrutura do silo */}
                <SiloStructure3D layout={layout} />

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
                  autoRotateSpeed={1}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={20}
                />

                {/* Grid de referência */}
                <gridHelper args={[10, 10, '#444444', '#888888']} position={[0, -4, 0]} />
              </Canvas>
            </div>
          </div>

          {/* Informações */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Informações da Visualização 3D do Silo</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <small><strong>Controles:</strong><br/>
                      • Clique e arraste para rotacionar<br/>
                      • Scroll para zoom<br/>
                      • Clique direito e arraste para mover</small>
                    </div>
                    <div className="col-md-4">
                      <small><strong>Estrutura:</strong><br/>
                      • Silo cilíndrico com base cônica<br/>
                      • Cabos distribuídos circularmente<br/>
                      • Aeradores na base do silo</small>
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

export default Silo3D;
