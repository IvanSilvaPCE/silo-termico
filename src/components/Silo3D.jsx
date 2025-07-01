
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import "bootstrap/dist/css/bootstrap.min.css";

const Cabo3D = ({ position, pendulo, sensores, alturaSilo, raioSilo }) => {
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

  const sensoresArray = Object.entries(sensores).map(([key, valores]) => ({
    numero: parseInt(key),
    temp: parseFloat(valores[0]),
    alarme: valores[1],
    qualidade: valores[2],
    falha: valores[3],
    ativo: valores[4]
  }));

  const espacamentoSensores = (alturaSilo * 0.8) / (sensoresArray.length + 1);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - mais realista */}
      <mesh position={[0, alturaSilo / 4, 0]}>
        <cylinderGeometry args={[0.02, 0.02, alturaSilo * 0.8, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Placa de identificação do pêndulo */}
      <Billboard position={[0, alturaSilo * 0.7, 0]}>
        <mesh>
          <planeGeometry args={[0.8, 0.3]} />
          <meshStandardMaterial color="#2E86AB" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {pendulo}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo */}
      {sensoresArray.map((sensor, index) => {
        const yPos = alturaSilo * 0.6 - (index * espacamentoSensores);
        const cor = sensor.ativo ? corFaixaExata(sensor.temp) : "#cccccc";
        
        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            {/* Corpo do sensor - mais detalhado */}
            <mesh>
              <boxGeometry args={[0.25, 0.12, 0.12]} />
              <meshStandardMaterial 
                color={cor}
                emissive={sensor.alarme ? "#ff0000" : "#000000"}
                emissiveIntensity={sensor.alarme ? 0.3 : 0}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>
            
            {/* Antena do sensor */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
            
            {/* Display do valor */}
            <Billboard position={[0, 0, 0.08]}>
              <mesh>
                <planeGeometry args={[0.2, 0.06]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.04}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
                font="/fonts/inter-medium.woff"
              >
                {sensor.falha ? "ERR" : sensor.temp.toFixed(1) + "°"}
              </Text>
            </Billboard>
            
            {/* Label lateral do sensor */}
            <Billboard position={[-0.18, 0, 0]}>
              <Text
                fontSize={0.03}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                S{sensor.numero}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Peso na extremidade do cabo */}
      <mesh position={[0, -alturaSilo * 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
};

const Aerador3D = ({ position, id, status, raioSilo }) => {
  const grupoRef = useRef();
  const heliceRef = useRef();

  const cores = {
    0: "#c5c5c5", // desligado
    1: "#ffeb3b", // startando
    3: "#31dd0f", // ligado
    4: "#ff0000"  // erro
  };

  useFrame((state, delta) => {
    if (heliceRef.current && status === 3) {
      heliceRef.current.rotation.y += delta * 15;
    }
  });

  return (
    <group ref={grupoRef} position={position}>
      {/* Base do aerador - mais detalhada */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 24]} />
        <meshStandardMaterial 
          color={cores[status] || cores[0]} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Motor central */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Hélices mais realistas */}
      <group ref={heliceRef} position={[0, 0.15, 0]}>
        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <mesh
            key={index}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.25,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.25
            ]}
            rotation={[0, (angle * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.08, 0.04, 0.3]} />
            <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Label do aerador */}
      <Billboard position={[0, -0.25, 0]}>
        <Text
          fontSize={0.08}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          AE-{id}
        </Text>
      </Billboard>

      {/* Indicador de status */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color={cores[status] || cores[0]}
          emissive={status === 3 ? "#31dd0f" : "#000000"}
          emissiveIntensity={status === 3 ? 0.5 : 0}
        />
      </mesh>
    </group>
  );
};

const SiloStructure3D = ({ layout, numCabos, alturaSilo, raioSilo }) => {
  const texturaCorpo = useLoader(THREE.TextureLoader, "/texturas/siloTextura.jpg").catch(() => null);
  const texturaTopo = useLoader(THREE.TextureLoader, "/texturas/texturaTopo.jpg").catch(() => null);
  
  const alturaTopo = alturaSilo * 0.3;
  
  return (
    <group>
      {/* Corpo principal do silo - cilindro realista */}
      <mesh position={[0, alturaSilo / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[raioSilo, raioSilo, alturaSilo, 48, 1, true]} />
        <meshStandardMaterial 
          color="#E5E5E5"
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
          map={texturaCorpo}
        />
      </mesh>
      
      {/* Base do silo */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[raioSilo + 0.1, raioSilo + 0.1, 0.3, 48]} />
        <meshStandardMaterial color="#999999" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Topo cônico do silo */}
      <mesh position={[0, alturaSilo + alturaTopo / 2, 0]} castShadow>
        <coneGeometry args={[raioSilo * 1.1, alturaTopo, 32]} />
        <meshStandardMaterial 
          color="#CCCCCC" 
          metalness={0.3} 
          roughness={0.6}
          map={texturaTopo}
        />
      </mesh>

      {/* Saída superior (respiradouro) */}
      <mesh position={[0, alturaSilo + alturaTopo + 0.15, 0]}>
        <cylinderGeometry args={[raioSilo * 0.15, raioSilo * 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Estruturas de suporte */}
      {Array.from({length: 8}, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * raioSilo * 0.9;
        const z = Math.sin(angle) * raioSilo * 0.9;
        
        return (
          <mesh key={i} position={[x, alturaSilo * 0.3, z]}>
            <boxGeometry args={[0.08, alturaSilo * 0.6, 0.08]} />
            <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}

      {/* Escada de acesso */}
      <group position={[raioSilo + 0.2, alturaSilo / 2, 0]}>
        {/* Trilhos da escada */}
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, alturaSilo, 8]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        ))}
        
        {/* Degraus */}
        {Array.from({length: Math.floor(alturaSilo / 0.3)}, (_, i) => (
          <mesh key={i} position={[0, -alturaSilo/2 + i * 0.3, 0]}>
            <boxGeometry args={[0.6, 0.02, 0.15]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const NivelGrao3D = ({ nivel, raioSilo, alturaSilo }) => {
  const alturaGrao = (nivel / 100) * alturaSilo * 0.8;
  
  return (
    <mesh position={[0, alturaGrao / 2 + 0.2, 0]}>
      <cylinderGeometry args={[raioSilo * 0.95, raioSilo * 0.95, alturaGrao, 32]} />
      <meshStandardMaterial 
        color="#D4B886" 
        transparent 
        opacity={0.8}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

const Silo3D = ({ dados }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [mostrarMapaCalor, setMostrarMapaCalor] = useState(false);

  if (!dados) return <div>Carregando dados 3D...</div>;

  const layout = dados.dados_layout;
  const leitura = dados.leitura;
  const motorStatus = dados.motor?.statusMotor || [];
  const nivel = dados.dados?.nivel || 66.6;

  // Calcular dimensões baseadas nos dados
  const numCabos = Object.keys(leitura).length;
  const maxSensores = Math.max(...Object.values(leitura).map(cabo => Object.keys(cabo).length));
  
  // Dimensões mais realistas
  const alturaSilo = maxSensores * 0.8 + 2; // Altura baseada nos sensores
  const raioSilo = Math.max(3, numCabos * 0.8); // Raio baseado no número de cabos

  // Calcular posições dos cabos
  const cabosPositions = useMemo(() => {
    const positions = [];
    const raioDistribuicao = raioSilo * 0.7;

    if (numCabos === 1) {
      positions.push([0, 0, 0]);
    } else {
      Object.keys(leitura).forEach((pend, index) => {
        const angle = (index / numCabos) * Math.PI * 2;
        const x = Math.cos(angle) * raioDistribuicao;
        const z = Math.sin(angle) * raioDistribuicao;
        positions.push([x, 0, z]);
      });
    }

    return positions;
  }, [layout, leitura, raioSilo, numCabos]);

  // Calcular posições dos aeradores
  const aeradoresPositions = useMemo(() => {
    if (!layout.aeradores || layout.aeradores.na <= 0) return [];
    
    const numAeradores = layout.aeradores.na;
    const positions = [];
    const raioAeradores = raioSilo * 1.3;
    
    for (let i = 0; i < numAeradores; i++) {
      const angle = (i / numAeradores) * Math.PI * 2;
      const x = Math.cos(angle) * raioAeradores;
      const z = Math.sin(angle) * raioAeradores;
      const y = 0.2;
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [layout, raioSilo]);

  return (
    <div className="container-fluid p-1 p-md-2" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-3 fs-4 fs-md-1">Silo 3D - Modelo Realista</h1>
          
          {/* Controles */}
          <div className="row mb-3">
            <div className="col-12">
              <div className="card">
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
                    <div className="col-md-6 text-center">
                      <span className="badge bg-info me-2">Altura: {alturaSilo.toFixed(1)}m</span>
                      <span className="badge bg-success me-2">Raio: {raioSilo.toFixed(1)}m</span>
                      <span className="badge bg-warning me-2">Nível: {nivel.toFixed(1)}%</span>
                      <span className="badge bg-primary">{numCabos} Pêndulos</span>
                    </div>
                    <div className="col-md-3">
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
          <div className="card" style={{ height: '75vh' }}>
            <div className="card-body p-0">
              <Canvas 
                camera={{ position: [raioSilo * 3, alturaSilo * 0.8, raioSilo * 3], fov: 60 }}
                style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
                shadows
              >
                {/* Iluminação realista */}
                <ambientLight intensity={0.4} />
                <directionalLight 
                  position={[raioSilo * 4, alturaSilo * 2, raioSilo * 2]} 
                  intensity={1.0} 
                  castShadow
                  shadow-mapSize-width={4096}
                  shadow-mapSize-height={4096}
                  shadow-camera-far={raioSilo * 10}
                  shadow-camera-left={-raioSilo * 3}
                  shadow-camera-right={raioSilo * 3}
                  shadow-camera-top={alturaSilo * 2}
                  shadow-camera-bottom={-alturaSilo}
                />
                <pointLight position={[0, alturaSilo, 0]} intensity={0.6} />
                <spotLight 
                  position={[0, alturaSilo * 1.5, 0]} 
                  angle={0.8} 
                  penumbra={0.5} 
                  intensity={1.2} 
                  castShadow 
                />

                {/* Estrutura do silo */}
                <SiloStructure3D 
                  layout={layout} 
                  numCabos={numCabos}
                  alturaSilo={alturaSilo}
                  raioSilo={raioSilo}
                />

                {/* Nível de grãos */}
                <NivelGrao3D 
                  nivel={nivel}
                  raioSilo={raioSilo}
                  alturaSilo={alturaSilo}
                />

                {/* Cabos e sensores */}
                {Object.entries(leitura).map(([pendulo, sensores], index) => (
                  <Cabo3D
                    key={pendulo}
                    position={cabosPositions[index]}
                    pendulo={pendulo}
                    sensores={sensores}
                    alturaSilo={alturaSilo}
                    raioSilo={raioSilo}
                  />
                ))}

                {/* Aeradores */}
                {aeradoresPositions.map((position, index) => (
                  <Aerador3D
                    key={index}
                    position={position}
                    id={index + 1}
                    status={motorStatus[index] || 0}
                    raioSilo={raioSilo}
                  />
                ))}

                {/* Controles de câmera */}
                <OrbitControls 
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.5}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={raioSilo * 2}
                  maxDistance={raioSilo * 8}
                  maxPolarAngle={Math.PI / 2 + 0.3}
                />

                {/* Plano do chão */}
                <mesh position={[0, -0.5, 0]} receiveShadow>
                  <planeGeometry args={[raioSilo * 6, raioSilo * 6]} />
                  <meshStandardMaterial color="#A0A0A0" />
                  <primitive object={new THREE.Mesh().rotateX(-Math.PI / 2)} />
                </mesh>

                {/* Grid de referência */}
                <gridHelper 
                  args={[raioSilo * 4, 20, '#666666', '#999999']} 
                  position={[0, -0.4, 0]} 
                />
              </Canvas>
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="row mt-3">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">Silo 3D - Modelo Industrial Realista</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <small><strong>Estrutura:</strong><br/>
                      • Altura: {alturaSilo.toFixed(1)}m<br/>
                      • Raio: {raioSilo.toFixed(1)}m<br/>
                      • Suportes estruturais<br/>
                      • Escada de acesso</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Monitoramento:</strong><br/>
                      • {numCabos} pêndulos termométricos<br/>
                      • {Object.values(leitura).reduce((acc, p) => acc + Object.keys(p).length, 0)} sensores ativos<br/>
                      • Nível de grãos: {nivel.toFixed(1)}%<br/>
                      • Distribuição automática</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Aeração:</strong><br/>
                      • {layout.aeradores?.na || 0} aeradores<br/>
                      • Status em tempo real<br/>
                      • Indicadores visuais<br/>
                      • Rotação das hélices</small>
                    </div>
                    <div className="col-md-3">
                      <small><strong>Recursos 3D:</strong><br/>
                      • Iluminação realista<br/>
                      • Sombras dinâmicas<br/>
                      • Texturas aplicadas<br/>
                      • Controles de câmera avançados</small>
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
