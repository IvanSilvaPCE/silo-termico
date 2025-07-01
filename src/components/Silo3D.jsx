
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

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

  // Cabo vai do topo do cilindro até a base (não passa pelo chapéu cônico)
  const topoSilo = alturaSilo; // apenas altura do cilindro
  const baseSilo = 0.3; // altura da base
  const alturaCabo = topoSilo - baseSilo;
  const espacamentoSensores = alturaCabo / (sensoresArray.length + 1);

  return (
    <group ref={grupoRef} position={position}>
      {/* Cabo principal - do topo à base */}
      <mesh position={[0, (topoSilo + baseSilo) / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, alturaCabo, 12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Nome do pêndulo FORA do silo, na base */}
      <Billboard position={[0, baseSilo - 0.8, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.25]} />
          <meshStandardMaterial color="#2E86AB" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          P{pendulo}
        </Text>
      </Billboard>

      {/* Sensores ao longo do cabo */}
      {sensoresArray.map((sensor, index) => {
        const yPos = topoSilo - ((index + 1) * espacamentoSensores);
        const cor = sensor.ativo ? corFaixaExata(sensor.temp) : "#cccccc";

        return (
          <group key={sensor.numero} position={[0, yPos, 0]}>
            {/* Corpo do sensor */}
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

            {/* Display do valor na frente do sensor */}
            <Billboard position={[0, 0, 0.08]}>
              <mesh>
                <planeGeometry args={[0.25, 0.08]} />
                <meshStandardMaterial color="#000000" />
              </mesh>
              <Text
                position={[0, 0, 0.001]}
                fontSize={0.035}
                color="#00ff00"
                anchorX="center"
                anchorY="middle"
              >
                {sensor.falha ? "ERR" : sensor.temp.toFixed(1) + "°C"}
              </Text>
            </Billboard>

            {/* Número da temperatura flutuante */}
            <Billboard position={[0.4, 0, 0]}>
              <Text
                fontSize={0.08}
                color={sensor.falha ? "#ff0000" : "#ffffff"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#000000"
              >
                {sensor.falha ? "ERR" : sensor.temp.toFixed(1) + "°"}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Peso na extremidade do cabo */}
      <mesh position={[0, baseSilo + 0.1, 0]}>
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
      {/* Base do motor - mais robusta */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.2, 24]} />
        <meshStandardMaterial 
          color="#666666" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>

      {/* Corpo do motor principal */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 16]} />
        <meshStandardMaterial 
          color={cores[status] || cores[0]} 
          metalness={0.6} 
          roughness={0.4}
        />
      </mesh>

      {/* Aletas de refrigeração */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
        <mesh
          key={index}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.32,
            0.15,
            Math.sin((angle * Math.PI) / 180) * 0.32
          ]}
          rotation={[0, (angle * Math.PI) / 180, 0]}
        >
          <boxGeometry args={[0.03, 0.25, 0.08]} />
          <meshStandardMaterial color="#555555" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Eixo do motor */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Hélices - mais realistas */}
      <group ref={heliceRef} position={[0, 0.42, 0]}>
        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <mesh
            key={index}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.25,
              0,
              Math.sin((angle * Math.PI) / 180) * 0.25
            ]}
            rotation={[0, (angle * Math.PI) / 180, Math.PI / 12]}
          >
            <boxGeometry args={[0.06, 0.02, 0.35]} />
            <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
        
        {/* Hub central das hélices */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Placa de identificação */}
      <Billboard position={[0, 0.05, 0.4]}>
        <mesh>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#2E86AB" />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.04}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          AE-{id}
        </Text>
      </Billboard>

      {/* LED indicador de status */}
      <mesh position={[0, 0.32, 0.32]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial 
          color={cores[status] || cores[0]}
          emissive={status === 3 ? cores[status] : "#000000"}
          emissiveIntensity={status === 3 ? 0.8 : 0}
        />
      </mesh>
    </group>
  );
};

const SiloStructure3D = ({ numCabos, alturaSilo, raioSilo }) => {
  const alturaTopo = 0.4; // Topo mais fino e baixo

  return (
    <group>
      {/* Corpo principal do silo - cilindro */}
      <mesh position={[0, alturaSilo / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[raioSilo, raioSilo, alturaSilo, 48, 1, true]} />
        <meshStandardMaterial 
          color="#E5E5E5"
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Base do silo */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[raioSilo + 0.1, raioSilo + 0.1, 0.3, 48]} />
        <meshStandardMaterial color="#999999" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Topo plano do silo - mais fino e da mesma cor */}
      <mesh position={[0, alturaSilo + alturaTopo / 2, 0]} castShadow>
        <cylinderGeometry args={[raioSilo * 0.95, raioSilo * 0.95, alturaTopo, 32]} />
        <meshStandardMaterial 
          color="#E5E5E5" 
          metalness={0.1} 
          roughness={0.8}
        />
      </mesh>

      {/* Saída superior - mais baixa e junta com o topo */}
      <mesh position={[0, alturaSilo + alturaTopo + 0.1, 0]}>
        <cylinderGeometry args={[raioSilo * 0.15, raioSilo * 0.2, 0.2, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
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

  if (!dados) return <div>Carregando dados 3D...</div>;

  const layout = dados.dados_layout;
  const leitura = dados.leitura;
  const motorStatus = dados.motor?.statusMotor || [];
  const nivel = dados.dados?.nivel || 66.6;

  // Calcular dimensões baseadas nos dados
  const numCabos = Object.keys(leitura).length;
  const maxSensores = Math.max(...Object.values(leitura).map(cabo => Object.keys(cabo).length));

  const alturaSilo = maxSensores * 0.8 + 2;
  const raioSilo = Math.max(3, numCabos * 0.8);

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
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Controles simples */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <label>
          <input 
            type="checkbox" 
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
          />
          Rotação Automática
        </label>
      </div>

      {/* Canvas 3D */}
      <Canvas 
        camera={{ position: [raioSilo * 3, alturaSilo * 0.8, raioSilo * 3], fov: 60 }}
        style={{ height: '100%', background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        shadows
      >
        {/* Iluminação */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[raioSilo * 4, alturaSilo * 2, raioSilo * 2]} 
          intensity={1.0} 
          castShadow
        />
        <pointLight position={[0, alturaSilo, 0]} intensity={0.6} />

        {/* Estrutura do silo */}
        <SiloStructure3D 
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
          minDistance={raioSilo * 1.5}
          maxDistance={raioSilo * 12}
        />

        {/* Grade do chão */}
        <group position={[0, -0.5, 0]}>
          {/* Linhas horizontais */}
          {Array.from({ length: 21 }, (_, i) => (
            <mesh key={`h-${i}`} position={[0, 0, (i - 10) * raioSilo * 0.6]} rotation={[0, 0, 0]}>
              <boxGeometry args={[raioSilo * 12, 0.02, 0.02]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
          {/* Linhas verticais */}
          {Array.from({ length: 21 }, (_, i) => (
            <mesh key={`v-${i}`} position={[(i - 10) * raioSilo * 0.6, 0, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.02, 0.02, raioSilo * 12]} />
              <meshStandardMaterial color="#666666" />
            </mesh>
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default Silo3D;
